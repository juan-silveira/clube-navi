#!/bin/bash

###############################################################################
# Teste E2E COMPLETO - Com Auto-Aprovação de Merchant
#
# Este teste inclui aprovação automática do merchant via SQL
# para permitir teste end-to-end completamente automatizado
###############################################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
API_URL="${API_URL:-http://localhost:8033}"
TENANT_SLUG="${TENANT_SLUG:-clube-navi}"
TENANT_DB="clube_digital_${TENANT_SLUG//-/_}"
DB_USER="${DB_USER:-clube_digital_user}"
DB_PASSWORD="${DB_PASSWORD:-clube_digital_password}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Teste E2E COMPLETO - Auto Merchant Approval            ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${YELLOW}API URL:${NC} $API_URL"
echo -e "${YELLOW}Tenant:${NC} $TENANT_SLUG"
echo -e "${YELLOW}Tenant DB:${NC} $TENANT_DB"
echo ""

# Variables
MERCHANT_EMAIL=""
MERCHANT_TOKEN=""
MERCHANT_ID=""
CONSUMER_TOKEN=""
CONSUMER_ID=""
PRODUCT_ID=""
PURCHASE_ID=""

###############################################################################
# Helper Functions
###############################################################################

function print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

function print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
}

function print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

###############################################################################
# Step 1: Criar Merchant
###############################################################################

print_step "1. Criando Merchant"

TIMESTAMP=$(date +%s)
RANDOM_SUFFIX=$((RANDOM % 1000))
MERCHANT_EMAIL="merchant_auto_${TIMESTAMP}_${RANDOM_SUFFIX}@test.com"
MERCHANT_USERNAME="merchant_auto_${TIMESTAMP}_${RANDOM_SUFFIX}"
MERCHANT_CPF="$(printf "%011d" $((TIMESTAMP % 100000000000)))"

MERCHANT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"username\": \"$MERCHANT_USERNAME\",
    \"password\": \"Test@123\",
    \"name\": \"Merchant Test Auto\",
    \"cpf\": \"$MERCHANT_CPF\",
    \"phone\": \"119999${RANDOM_SUFFIX}\",
    \"personType\": \"PF\",
    \"userType\": \"merchant\"
  }")

MERCHANT_TOKEN=$(echo $MERCHANT_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$MERCHANT_TOKEN" ]; then
    print_error "Falha ao criar merchant"
    echo "Response: $MERCHANT_RESPONSE"
    exit 1
fi

print_success "Merchant criado: $MERCHANT_EMAIL"
print_info "Token: ${MERCHANT_TOKEN:0:20}..."

###############################################################################
# Step 2: Aprovar Merchant via SQL
###############################################################################

print_step "2. Aprovando Merchant (AUTO)"

# Aprovar merchant diretamente no banco
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $TENANT_DB -c "
  UPDATE users
  SET merchant_status = 'approved',
      email_confirmed = true,
      is_active = true
  WHERE email = '$MERCHANT_EMAIL';
" > /dev/null 2>&1

# Verificar se foi aprovado
MERCHANT_STATUS=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $TENANT_DB -t -c "
  SELECT merchant_status FROM users WHERE email = '$MERCHANT_EMAIL';
" | tr -d '[:space:]')

if [ "$MERCHANT_STATUS" != "approved" ]; then
    print_error "Falha ao aprovar merchant"
    exit 1
fi

# Obter ID do merchant
MERCHANT_ID=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $TENANT_DB -t -c "
  SELECT id FROM users WHERE email = '$MERCHANT_EMAIL';
" | tr -d '[:space:]')

print_success "Merchant aprovado automaticamente"
print_info "Merchant ID: $MERCHANT_ID"
print_info "Status: $MERCHANT_STATUS"

###############################################################################
# Step 3: Criar Produto
###############################################################################

print_step "3. Criando Produto"

PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -d '{
    "name": "Produto Teste E2E Auto",
    "description": "Produto criado automaticamente pelo teste E2E",
    "price": 100.00,
    "cashbackPercentage": 10.0,
    "category": "Eletrônicos",
    "stock": 50
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[a-f0-9-]\{36\}' | head -1)

if [ -z "$PRODUCT_ID" ]; then
    print_error "Falha ao criar produto"
    echo "Response: $PRODUCT_RESPONSE"
    exit 1
fi

print_success "Produto criado: $PRODUCT_ID"

###############################################################################
# Step 4: Criar Consumer
###############################################################################

print_step "4. Criando Consumer"

CONSUMER_TIMESTAMP=$(date +%s)
CONSUMER_EMAIL="consumer_auto_${CONSUMER_TIMESTAMP}@test.com"
CONSUMER_USERNAME="consumer_auto_${CONSUMER_TIMESTAMP}"
CONSUMER_CPF="$(printf "%011d" $(((CONSUMER_TIMESTAMP + 1000) % 100000000000)))"
CONSUMER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$CONSUMER_EMAIL\",
    \"username\": \"$CONSUMER_USERNAME\",
    \"password\": \"Test@123\",
    \"name\": \"Consumer Test Auto\",
    \"cpf\": \"$CONSUMER_CPF\",
    \"phone\": \"11888888888\",
    \"personType\": \"PF\",
    \"userType\": \"consumer\"
  }")

CONSUMER_TOKEN=$(echo $CONSUMER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
CONSUMER_ID=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $TENANT_DB -t -c "
  SELECT id FROM users WHERE email = '$CONSUMER_EMAIL';
" | tr -d '[:space:]')

if [ -z "$CONSUMER_TOKEN" ]; then
    print_error "Falha ao criar consumer"
    exit 1
fi

print_success "Consumer criado: $CONSUMER_EMAIL"
print_info "Consumer ID: $CONSUMER_ID"

###############################################################################
# Step 5: Criar Compra
###############################################################################

print_step "5. Criando Compra"

PURCHASE_RESPONSE=$(curl -s -X POST "$API_URL/api/purchases" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 2
  }")

PURCHASE_ID=$(echo $PURCHASE_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[a-f0-9-]\{36\}' | head -1)

if [ -z "$PURCHASE_ID" ]; then
    print_error "Falha ao criar compra"
    echo "Response: $PURCHASE_RESPONSE"
    exit 1
fi

print_success "Compra criada: $PURCHASE_ID"

# Extrair cashback
CONSUMER_CASHBACK=$(echo $PURCHASE_RESPONSE | grep -o '"consumer":[0-9.]*' | cut -d':' -f2)
print_info "Cashback do consumidor: R\$ $CONSUMER_CASHBACK"

###############################################################################
# Step 6: Confirmar Compra
###############################################################################

print_step "6. Confirmando Compra"

CONFIRM_RESPONSE=$(curl -s -X POST "$API_URL/api/purchases/$PURCHASE_ID/confirm" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -d '{
    "txHash": "0xTESTE123AUTO"
  }')

print_success "Compra confirmada"

###############################################################################
# Step 7: Verificar Estatísticas
###############################################################################

print_step "7. Verificando Estatísticas"

STATS_RESPONSE=$(curl -s -X GET "$API_URL/api/purchases/stats" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

print_info "Stats: $STATS_RESPONSE"
print_success "Estatísticas obtidas"

###############################################################################
# Final Summary
###############################################################################

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✅ TESTE E2E AUTO CONCLUÍDO COM SUCESSO         ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${YELLOW}Resumo:${NC}"
echo -e "  Merchant ID:  ${GREEN}$MERCHANT_ID${NC}"
echo -e "  Merchant Email: ${GREEN}$MERCHANT_EMAIL${NC}"
echo -e "  Consumer ID:  ${GREEN}$CONSUMER_ID${NC}"
echo -e "  Product ID:   ${GREEN}$PRODUCT_ID${NC}"
echo -e "  Purchase ID:  ${GREEN}$PURCHASE_ID${NC}"
echo -e "  Cashback:     ${GREEN}R\$ $CONSUMER_CASHBACK${NC}"
echo ""
echo -e "${GREEN}Sistema de produtos, compras e cashback funcionando perfeitamente!${NC}"
echo ""

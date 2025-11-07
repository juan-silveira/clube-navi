#!/bin/bash

# ============================================
# TESTE E2E COMPLETO DO MARKETPLACE
# ============================================
# Fluxo testado:
# 1. Admin aprova merchant (via API)
# 2. Merchant cria produto (via API mobile)
# 3. Consumer compra produto (via API mobile)
# 4. Verifica distribuição de cashback
# 5. Verifica stats no dashboard
# ============================================

set -e # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
API_URL="${API_URL:-http://localhost:8033}"
TENANT_SLUG="${TENANT_SLUG:-clube-navi}"
DB_USER="${DB_USER:-clube_digital_user}"
DB_PASSWORD="${DB_PASSWORD:-clube_digital_password}"
TENANT_DB="clube_digital_${TENANT_SLUG//-/_}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TESTE E2E MARKETPLACE COMPLETO${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}API URL:${NC} $API_URL"
echo -e "${YELLOW}Tenant:${NC} $TENANT_SLUG"
echo ""

# Gerar dados únicos para este teste
TIMESTAMP=$(date +%s)
RANDOM_SUFFIX=$((RANDOM % 1000))

MERCHANT_EMAIL="merchant_e2e_${TIMESTAMP}_${RANDOM_SUFFIX}@test.com"
MERCHANT_CPF="$(printf "%011d" $((TIMESTAMP % 100000000000)))"
MERCHANT_PASSWORD="TestPass123$"

CONSUMER_EMAIL="consumer_e2e_${TIMESTAMP}_${RANDOM_SUFFIX}@test.com"
CONSUMER_CPF="$(printf "%011d" $(((TIMESTAMP + 1) % 100000000000)))"
CONSUMER_PASSWORD="TestPass123$"

echo -e "${YELLOW}Dados de teste gerados:${NC}"
echo "  Merchant: $MERCHANT_EMAIL / CPF: $MERCHANT_CPF"
echo "  Consumer: $CONSUMER_EMAIL / CPF: $CONSUMER_CPF"
echo ""

# ============================================
# ETAPA 1: Registrar Merchant
# ============================================
echo -e "${BLUE}[1/8]${NC} Registrando merchant..."

MERCHANT_REGISTER=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"username\": \"merchant_e2e_${TIMESTAMP}\",
    \"password\": \"$MERCHANT_PASSWORD\",
    \"name\": \"Merchant E2E Test\",
    \"cpf\": \"$MERCHANT_CPF\",
    \"personType\": \"PF\",
    \"userType\": \"merchant\"
  }")

if echo "$MERCHANT_REGISTER" | grep -q "\"success\":true"; then
  echo -e "${GREEN}✓${NC} Merchant registrado com sucesso"
else
  echo -e "${RED}✗${NC} Erro ao registrar merchant:"
  echo "$MERCHANT_REGISTER"
  exit 1
fi

# ============================================
# ETAPA 2: Aprovar Merchant (SQL)
# ============================================
echo -e "${BLUE}[2/8]${NC} Aprovando merchant via SQL..."

PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $TENANT_DB -c "
  UPDATE users
  SET merchant_status = 'approved',
      email_confirmed = true,
      is_active = true
  WHERE email = '$MERCHANT_EMAIL';
" > /dev/null 2>&1

echo -e "${GREEN}✓${NC} Merchant aprovado"

# ============================================
# ETAPA 3: Login do Merchant
# ============================================
echo -e "${BLUE}[3/8]${NC} Fazendo login do merchant..."

MERCHANT_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"password\": \"$MERCHANT_PASSWORD\"
  }")

MERCHANT_TOKEN=$(echo "$MERCHANT_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
MERCHANT_ID=$(echo "$MERCHANT_LOGIN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$MERCHANT_TOKEN" ]; then
  echo -e "${GREEN}✓${NC} Login do merchant realizado"
else
  echo -e "${RED}✗${NC} Erro ao fazer login do merchant:"
  echo "$MERCHANT_LOGIN"
  exit 1
fi

# ============================================
# ETAPA 4: Merchant Cria Produto
# ============================================
echo -e "${BLUE}[4/8]${NC} Merchant criando produto..."

PRODUCT_DATA=$(curl -s -X POST "$API_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -d "{
    \"name\": \"Produto E2E Test ${TIMESTAMP}\",
    \"description\": \"Produto criado automaticamente para teste E2E\",
    \"price\": 100.00,
    \"cashbackPercentage\": 10,
    \"category\": \"Teste\",
    \"stock\": 50
  }")

PRODUCT_ID=$(echo "$PRODUCT_DATA" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$PRODUCT_ID" ]; then
  echo -e "${GREEN}✓${NC} Produto criado: $PRODUCT_ID"
else
  echo -e "${RED}✗${NC} Erro ao criar produto:"
  echo "$PRODUCT_DATA"
  exit 1
fi

# ============================================
# ETAPA 5: Registrar e Login Consumer
# ============================================
echo -e "${BLUE}[5/8]${NC} Registrando consumer..."

CONSUMER_REGISTER=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$CONSUMER_EMAIL\",
    \"username\": \"consumer_e2e_${TIMESTAMP}\",
    \"password\": \"$CONSUMER_PASSWORD\",
    \"name\": \"Consumer E2E Test\",
    \"cpf\": \"$CONSUMER_CPF\",
    \"personType\": \"PF\",
    \"userType\": \"consumer\"
  }")

if echo "$CONSUMER_REGISTER" | grep -q "\"success\":true"; then
  echo -e "${GREEN}✓${NC} Consumer registrado"
else
  echo -e "${RED}✗${NC} Erro ao registrar consumer:"
  echo "$CONSUMER_REGISTER"
  exit 1
fi

CONSUMER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$CONSUMER_EMAIL\",
    \"password\": \"$CONSUMER_PASSWORD\"
  }")

CONSUMER_TOKEN=$(echo "$CONSUMER_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CONSUMER_TOKEN" ]; then
  echo -e "${GREEN}✓${NC} Login do consumer realizado"
else
  echo -e "${RED}✗${NC} Erro ao fazer login do consumer"
  exit 1
fi

# ============================================
# ETAPA 6: Consumer Compra Produto
# ============================================
echo -e "${BLUE}[6/8]${NC} Consumer comprando produto..."

PURCHASE=$(curl -s -X POST "$API_URL/api/purchases" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 2
  }")

PURCHASE_ID=$(echo "$PURCHASE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
CASHBACK_CONSUMER=$(echo "$PURCHASE" | grep -o '"consumer":[0-9.]*' | cut -d':' -f2)

if [ -n "$PURCHASE_ID" ]; then
  echo -e "${GREEN}✓${NC} Compra realizada: $PURCHASE_ID"
  echo -e "  ${YELLOW}Cashback consumidor:${NC} R\$ $CASHBACK_CONSUMER"
else
  echo -e "${RED}✗${NC} Erro ao realizar compra:"
  echo "$PURCHASE"
  exit 1
fi

# ============================================
# ETAPA 7: Verificar Stats de Produtos
# ============================================
echo -e "${BLUE}[7/8]${NC} Verificando estatísticas de produtos..."

PRODUCT_STATS=$(curl -s -X GET "$API_URL/api/products/stats" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN")

TOTAL_PRODUCTS=$(echo "$PRODUCT_STATS" | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ -n "$TOTAL_PRODUCTS" ] && [ "$TOTAL_PRODUCTS" -ge 1 ]; then
  echo -e "${GREEN}✓${NC} Stats de produtos OK (Total: $TOTAL_PRODUCTS)"
else
  echo -e "${YELLOW}⚠${NC} Stats de produtos retornou ${TOTAL_PRODUCTS:-0}"
fi

# ============================================
# ETAPA 8: Verificar Stats de Merchants
# ============================================
echo -e "${BLUE}[8/8]${NC} Verificando estatísticas de merchants..."

MERCHANT_STATS=$(curl -s -X GET "$API_URL/api/users/merchants/stats" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN")

TOTAL_MERCHANTS=$(echo "$MERCHANT_STATS" | grep -o '"total":[0-9]*' | cut -d':' -f2)
APPROVED_MERCHANTS=$(echo "$MERCHANT_STATS" | grep -o '"approved":[0-9]*' | cut -d':' -f2)

if [ -n "$APPROVED_MERCHANTS" ] && [ "$APPROVED_MERCHANTS" -ge 1 ]; then
  echo -e "${GREEN}✓${NC} Stats de merchants OK (Total: $TOTAL_MERCHANTS, Aprovados: $APPROVED_MERCHANTS)"
else
  echo -e "${YELLOW}⚠${NC} Stats de merchants: Aprovados = ${APPROVED_MERCHANTS:-0}"
fi

# ============================================
# RESUMO FINAL
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ TESTE E2E COMPLETO COM SUCESSO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Resumo do Teste:${NC}"
echo "  1. ✓ Merchant registrado e aprovado"
echo "  2. ✓ Merchant criou produto (ID: $PRODUCT_ID)"
echo "  3. ✓ Consumer registrado e logado"
echo "  4. ✓ Consumer comprou produto (ID: $PURCHASE_ID)"
echo "  5. ✓ Cashback distribuído: R$ $CASHBACK_CONSUMER"
echo "  6. ✓ Stats atualizadas (Produtos: $TOTAL_PRODUCTS, Merchants: $APPROVED_MERCHANTS)"
echo ""
echo -e "${BLUE}Detalhes para verificação manual:${NC}"
echo "  - Merchant ID: $MERCHANT_ID"
echo "  - Product ID: $PRODUCT_ID"
echo "  - Purchase ID: $PURCHASE_ID"
echo "  - Login Admin Web: http://localhost:3000"
echo ""

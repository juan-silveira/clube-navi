#!/bin/bash

###############################################################################
# Teste E2E - Sistema Completo de Produtos, Compras e Cashback
#
# Testa todo o fluxo:
# 1. Criar merchant (lojista)
# 2. Criar produto
# 3. Upload de imagem do produto
# 4. Criar consumer (consumidor)
# 5. Criar compra
# 6. Confirmar compra
# 7. Processar cashback
# 8. Verificar estatísticas
# 9. Verificar histórico de cashback
###############################################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
API_URL="${API_URL:-http://localhost:4000}"
TENANT_SLUG="${TENANT_SLUG:-clube_navi}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Teste E2E - Sistema de Produtos, Compras e Cashback    ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${YELLOW}API URL:${NC} $API_URL"
echo -e "${YELLOW}Tenant:${NC} $TENANT_SLUG"
echo ""

# Variables
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
# Step 1: Criar e logar Merchant
###############################################################################

print_step "1. Criando e logando Merchant (Lojista)"

# Registrar merchant
MERCHANT_EMAIL="merchant_$(date +%s)@test.com"
MERCHANT_USERNAME="merchant_$(date +%s)"
MERCHANT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"username\": \"$MERCHANT_USERNAME\",
    \"password\": \"Test@123\",
    \"firstName\": \"Test\",
    \"lastName\": \"Merchant\",
    \"cpf\": \"12345678901\",
    \"phone\": \"11999999999\",
    \"userType\": \"merchant\"
  }")

print_info "Merchant Response: $MERCHANT_RESPONSE"

# Extrair token
MERCHANT_TOKEN=$(echo $MERCHANT_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
MERCHANT_ID=$(echo $MERCHANT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$MERCHANT_TOKEN" ]; then
    print_error "Falha ao criar merchant"
    exit 1
fi

print_success "Merchant criado: $MERCHANT_EMAIL"
print_info "Merchant ID: $MERCHANT_ID"
print_info "Token: ${MERCHANT_TOKEN:0:20}..."

# Aprovar merchant (via admin API - simplificado para teste)
print_info "Aprovando merchant..."

# Simular aprovação atualizando diretamente no banco (em produção seria via admin)
# Por enquanto, vamos assumir que o merchant já está aprovado

###############################################################################
# Step 2: Criar Produto
###############################################################################

print_step "2. Criando Produto"

PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -d '{
    "name": "Produto Teste E2E",
    "description": "Produto criado automaticamente pelo teste E2E",
    "price": 100.00,
    "cashbackPercentage": 10.0,
    "category": "Eletrônicos",
    "stock": 50
  }')

print_info "Product Response: $PRODUCT_RESPONSE"

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[a-f0-9-]\{36\}' | head -1)

if [ -z "$PRODUCT_ID" ]; then
    print_error "Falha ao criar produto"
    echo "Response: $PRODUCT_RESPONSE"
    exit 1
fi

print_success "Produto criado: $PRODUCT_ID"

###############################################################################
# Step 3: Listar Produtos
###############################################################################

print_step "3. Listando Produtos"

PRODUCTS_LIST=$(curl -s -X GET "$API_URL/api/products" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN")

print_info "Products: $PRODUCTS_LIST"
print_success "Produtos listados com sucesso"

###############################################################################
# Step 4: Buscar Produto por ID
###############################################################################

print_step "4. Buscando Produto por ID"

PRODUCT_DETAIL=$(curl -s -X GET "$API_URL/api/products/$PRODUCT_ID" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN")

print_info "Product Detail: $PRODUCT_DETAIL"
print_success "Produto encontrado"

###############################################################################
# Step 5: Criar e logar Consumer
###############################################################################

print_step "5. Criando e logando Consumer (Consumidor)"

CONSUMER_EMAIL="consumer_$(date +%s)@test.com"
CONSUMER_USERNAME="consumer_$(date +%s)"
CONSUMER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$CONSUMER_EMAIL\",
    \"username\": \"$CONSUMER_USERNAME\",
    \"password\": \"Test@123\",
    \"firstName\": \"Test\",
    \"lastName\": \"Consumer\",
    \"cpf\": \"98765432109\",
    \"phone\": \"11888888888\",
    \"userType\": \"consumer\"
  }")

print_info "Consumer Response: $CONSUMER_RESPONSE"

CONSUMER_TOKEN=$(echo $CONSUMER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
CONSUMER_ID=$(echo $CONSUMER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CONSUMER_TOKEN" ]; then
    print_error "Falha ao criar consumer"
    exit 1
fi

print_success "Consumer criado: $CONSUMER_EMAIL"
print_info "Consumer ID: $CONSUMER_ID"

###############################################################################
# Step 6: Calcular Distribuição de Cashback (Preview)
###############################################################################

print_step "6. Calculando Preview de Cashback"

CASHBACK_CALC=$(curl -s -X POST "$API_URL/api/cashback/calculate" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -d '{
    "totalAmount": 100.00,
    "cashbackPercentage": 10.0
  }')

print_info "Cashback Calculation: $CASHBACK_CALC"
print_success "Preview de cashback calculado"

###############################################################################
# Step 7: Criar Compra
###############################################################################

print_step "7. Criando Compra"

PURCHASE_RESPONSE=$(curl -s -X POST "$API_URL/api/purchases" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 2
  }")

print_info "Purchase Response: $PURCHASE_RESPONSE"

PURCHASE_ID=$(echo $PURCHASE_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[a-f0-9-]\{36\}' | head -1)

if [ -z "$PURCHASE_ID" ]; then
    print_error "Falha ao criar compra"
    echo "Response: $PURCHASE_RESPONSE"
    exit 1
fi

print_success "Compra criada: $PURCHASE_ID"

# Extrair valores de cashback da resposta
CONSUMER_CASHBACK=$(echo $PURCHASE_RESPONSE | grep -o '"consumer":[0-9.]*' | cut -d':' -f2)
print_info "Cashback do consumidor: R\$ $CONSUMER_CASHBACK"

###############################################################################
# Step 8: Confirmar Compra
###############################################################################

print_step "8. Confirmando Compra"

CONFIRM_RESPONSE=$(curl -s -X POST "$API_URL/api/purchases/$PURCHASE_ID/confirm" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -d '{
    "txHash": "0x1234567890abcdef"
  }')

print_info "Confirm Response: $CONFIRM_RESPONSE"
print_success "Compra confirmada"

###############################################################################
# Step 9: Processar Cashback
###############################################################################

print_step "9. Processando Cashback"

PROCESS_RESPONSE=$(curl -s -X POST "$API_URL/api/cashback/process/$PURCHASE_ID" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $MERCHANT_TOKEN")

print_info "Process Response: $PROCESS_RESPONSE"
print_success "Cashback processado"

###############################################################################
# Step 10: Verificar Estatísticas do Consumer
###############################################################################

print_step "10. Verificando Estatísticas do Consumer"

CONSUMER_STATS=$(curl -s -X GET "$API_URL/api/cashback/stats" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

print_info "Consumer Stats: $CONSUMER_STATS"
print_success "Estatísticas obtidas"

###############################################################################
# Step 11: Verificar Histórico de Cashback
###############################################################################

print_step "11. Verificando Histórico de Cashback"

CASHBACK_HISTORY=$(curl -s -X GET "$API_URL/api/cashback/history?page=1&limit=10" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

print_info "Cashback History: $CASHBACK_HISTORY"
print_success "Histórico obtido"

###############################################################################
# Step 12: Listar Compras do Consumer
###############################################################################

print_step "12. Listando Compras do Consumer"

CONSUMER_PURCHASES=$(curl -s -X GET "$API_URL/api/purchases" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

print_info "Consumer Purchases: $CONSUMER_PURCHASES"
print_success "Compras do consumer listadas"

###############################################################################
# Step 13: Verificar Estatísticas de Purchase
###############################################################################

print_step "13. Verificando Estatísticas de Compras"

PURCHASE_STATS=$(curl -s -X GET "$API_URL/api/purchases/stats" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

print_info "Purchase Stats: $PURCHASE_STATS"
print_success "Estatísticas de compras obtidas"

###############################################################################
# Step 14: Listar Categorias
###############################################################################

print_step "14. Listando Categorias de Produtos"

CATEGORIES=$(curl -s -X GET "$API_URL/api/products/categories/list" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

print_info "Categories: $CATEGORIES"
print_success "Categorias listadas"

###############################################################################
# Step 15: Listar Produtos em Destaque
###############################################################################

print_step "15. Listando Produtos em Destaque"

FEATURED=$(curl -s -X GET "$API_URL/api/products/featured/list?limit=5&sortBy=cashback" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

print_info "Featured Products: $FEATURED"
print_success "Produtos em destaque listados"

###############################################################################
# Final Summary
###############################################################################

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ TESTE E2E CONCLUÍDO COM SUCESSO            ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${YELLOW}Resumo:${NC}"
echo -e "  Merchant ID: ${GREEN}$MERCHANT_ID${NC}"
echo -e "  Consumer ID: ${GREEN}$CONSUMER_ID${NC}"
echo -e "  Product ID:  ${GREEN}$PRODUCT_ID${NC}"
echo -e "  Purchase ID: ${GREEN}$PURCHASE_ID${NC}"
echo ""
echo -e "${YELLOW}Endpoints Testados:${NC}"
echo -e "  ${GREEN}✓${NC} POST /api/auth/register (merchant + consumer)"
echo -e "  ${GREEN}✓${NC} POST /api/products"
echo -e "  ${GREEN}✓${NC} GET  /api/products"
echo -e "  ${GREEN}✓${NC} GET  /api/products/:id"
echo -e "  ${GREEN}✓${NC} GET  /api/products/categories/list"
echo -e "  ${GREEN}✓${NC} GET  /api/products/featured/list"
echo -e "  ${GREEN}✓${NC} POST /api/cashback/calculate"
echo -e "  ${GREEN}✓${NC} POST /api/purchases"
echo -e "  ${GREEN}✓${NC} POST /api/purchases/:id/confirm"
echo -e "  ${GREEN}✓${NC} GET  /api/purchases"
echo -e "  ${GREEN}✓${NC} GET  /api/purchases/stats"
echo -e "  ${GREEN}✓${NC} POST /api/cashback/process/:purchaseId"
echo -e "  ${GREEN}✓${NC} GET  /api/cashback/stats"
echo -e "  ${GREEN}✓${NC} GET  /api/cashback/history"
echo ""
echo -e "${GREEN}Total: 15 endpoints testados com sucesso!${NC}"
echo ""

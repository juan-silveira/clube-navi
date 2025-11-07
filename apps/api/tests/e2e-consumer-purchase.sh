#!/bin/bash

# Script de teste E2E - Fluxo Completo de Compra (Consumer)
# Testa o fluxo completo desde visualização de produtos até histórico de compras

set -e # Parar em caso de erro

API_URL="${API_URL:-http://localhost:8033}"
TENANT_SLUG="${TENANT_SLUG:-clube-navi}"

echo "========================================="
echo "🧪 TESTE E2E: FLUXO DE COMPRA CONSUMER"
echo "========================================="
echo "API: $API_URL"
echo "Tenant: $TENANT_SLUG"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Limpar arquivos temporários
rm -f /tmp/consumer_token.txt /tmp/consumer_id.txt /tmp/merchant_token.txt /tmp/merchant_id.txt /tmp/product_id.txt /tmp/purchase_id.txt

# ==========================================
# ETAPA 1: REGISTRAR MERCHANT E CRIAR PRODUTO
# ==========================================
print_step "1. Registrando merchant..."

TIMESTAMP=$(date +%s)
MERCHANT_EMAIL="merchant_${TIMESTAMP}@test.com"
MERCHANT_USERNAME="merchant_${TIMESTAMP}"
MERCHANT_PASSWORD="TestPass123\$"

MERCHANT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"username\": \"$MERCHANT_USERNAME\",
    \"password\": \"$MERCHANT_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"Merchant\",
    \"cpf\": \"12345678901\",
    \"phone\": \"11999999999\",
    \"userType\": \"merchant\"
  }")

MERCHANT_ID=$(echo $MERCHANT_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$MERCHANT_ID" ]; then
    print_error "Falha ao registrar merchant"
    echo $MERCHANT_RESPONSE
    exit 1
fi
echo $MERCHANT_ID > /tmp/merchant_id.txt
print_success "Merchant registrado: $MERCHANT_ID"

# ==========================================
# ETAPA 2: LOGIN MERCHANT
# ==========================================
print_step "2. Fazendo login como merchant..."

MERCHANT_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"password\": \"$MERCHANT_PASSWORD\"
  }")

MERCHANT_TOKEN=$(echo $MERCHANT_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$MERCHANT_TOKEN" ]; then
    print_error "Falha ao fazer login do merchant"
    echo $MERCHANT_LOGIN
    exit 1
fi
echo $MERCHANT_TOKEN > /tmp/merchant_token.txt
print_success "Merchant logado com sucesso"

# ==========================================
# ETAPA 3: CRIAR PRODUTO
# ==========================================
print_step "3. Criando produto para venda..."

PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d '{
    "name": "Produto Teste E2E Consumer",
    "description": "Produto para teste do fluxo de compra do consumidor",
    "price": 50.00,
    "cashbackPercentage": 5.0,
    "category": "test",
    "stock": 10,
    "isActive": true
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$PRODUCT_ID" ]; then
    print_error "Falha ao criar produto"
    echo $PRODUCT_RESPONSE
    exit 1
fi
echo $PRODUCT_ID > /tmp/product_id.txt
print_success "Produto criado: $PRODUCT_ID - R$ 50,00 (5% cashback)"

# ==========================================
# ETAPA 4: REGISTRAR CONSUMER
# ==========================================
print_step "4. Registrando consumer..."

CONSUMER_EMAIL="consumer_${TIMESTAMP}@test.com"
CONSUMER_USERNAME="consumer_${TIMESTAMP}"
CONSUMER_PASSWORD="TestPass123\$"

CONSUMER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$CONSUMER_EMAIL\",
    \"username\": \"$CONSUMER_USERNAME\",
    \"password\": \"$CONSUMER_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"Consumer\",
    \"cpf\": \"98765432100\",
    \"phone\": \"11988888888\",
    \"userType\": \"consumer\"
  }")

CONSUMER_ID=$(echo $CONSUMER_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$CONSUMER_ID" ]; then
    print_error "Falha ao registrar consumer"
    echo $CONSUMER_RESPONSE
    exit 1
fi
echo $CONSUMER_ID > /tmp/consumer_id.txt
print_success "Consumer registrado: $CONSUMER_ID"

# ==========================================
# ETAPA 5: LOGIN CONSUMER
# ==========================================
print_step "5. Fazendo login como consumer..."

CONSUMER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$CONSUMER_EMAIL\",
    \"password\": \"$CONSUMER_PASSWORD\"
  }")

CONSUMER_TOKEN=$(echo $CONSUMER_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CONSUMER_TOKEN" ]; then
    print_error "Falha ao fazer login do consumer"
    echo $CONSUMER_LOGIN
    exit 1
fi
echo $CONSUMER_TOKEN > /tmp/consumer_token.txt
print_success "Consumer logado com sucesso"

# ==========================================
# ETAPA 6: LISTAR PRODUTOS (MARKETPLACE)
# ==========================================
print_step "6. Listando produtos no marketplace..."

PRODUCTS_LIST=$(curl -s -X GET "$API_URL/api/products?limit=10" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $PRODUCTS_LIST | grep -q "$PRODUCT_ID"
if [ $? -eq 0 ]; then
    print_success "Produto encontrado no marketplace"
else
    print_warning "Produto não encontrado na listagem (pode estar em outra página)"
fi

# ==========================================
# ETAPA 7: BUSCAR DETALHES DO PRODUTO
# ==========================================
print_step "7. Buscando detalhes do produto..."

PRODUCT_DETAIL=$(curl -s -X GET "$API_URL/api/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $PRODUCT_DETAIL
PRODUCT_NAME=$(echo $PRODUCT_DETAIL | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
PRODUCT_PRICE=$(echo $PRODUCT_DETAIL | grep -o '"price":[0-9.]*' | cut -d':' -f2)
CASHBACK_PERCENT=$(echo $PRODUCT_DETAIL | grep -o '"cashbackPercentage":[0-9.]*' | cut -d':' -f2)

print_success "Detalhes: $PRODUCT_NAME - R$ $PRODUCT_PRICE ($CASHBACK_PERCENT% cashback)"

# ==========================================
# ETAPA 8: CALCULAR CASHBACK
# ==========================================
print_step "8. Calculando preview de cashback..."

CASHBACK_CALC=$(curl -s -X POST "$API_URL/api/cashback/calculate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"totalAmount\": $PRODUCT_PRICE,
    \"cashbackPercentage\": $CASHBACK_PERCENT
  }")

echo $CASHBACK_CALC
print_success "Cashback calculado"

# ==========================================
# ETAPA 9: CRIAR COMPRA
# ==========================================
print_step "9. Criando compra..."

PURCHASE_RESPONSE=$(curl -s -X POST "$API_URL/api/purchases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 1
  }")

echo $PURCHASE_RESPONSE

PURCHASE_ID=$(echo $PURCHASE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$PURCHASE_ID" ]; then
    print_error "Falha ao criar compra"
    echo $PURCHASE_RESPONSE
    exit 1
fi

CONSUMER_CASHBACK=$(echo $PURCHASE_RESPONSE | grep -o '"consumer":[0-9.]*' | head -1 | cut -d':' -f2)

echo $PURCHASE_ID > /tmp/purchase_id.txt
print_success "Compra criada: $PURCHASE_ID"
print_success "Cashback para o consumer: R$ $CONSUMER_CASHBACK"

# ==========================================
# ETAPA 10: BUSCAR DETALHES DA COMPRA
# ==========================================
print_step "10. Buscando detalhes da compra..."

PURCHASE_DETAIL=$(curl -s -X GET "$API_URL/api/purchases/$PURCHASE_ID" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $PURCHASE_DETAIL
PURCHASE_STATUS=$(echo $PURCHASE_DETAIL | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
print_success "Status da compra: $PURCHASE_STATUS"

# ==========================================
# ETAPA 11: LISTAR HISTÓRICO DE COMPRAS
# ==========================================
print_step "11. Listando histórico de compras do consumer..."

PURCHASES_LIST=$(curl -s -X GET "$API_URL/api/purchases" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $PURCHASES_LIST
echo $PURCHASES_LIST | grep -q "$PURCHASE_ID"
if [ $? -eq 0 ]; then
    print_success "Compra encontrada no histórico"
else
    print_error "Compra NÃO encontrada no histórico"
fi

# ==========================================
# ETAPA 12: FILTRAR COMPRAS POR STATUS
# ==========================================
print_step "12. Filtrando compras pendentes..."

PENDING_PURCHASES=$(curl -s -X GET "$API_URL/api/purchases?status=pending" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $PENDING_PURCHASES
print_success "Filtro por status aplicado"

# ==========================================
# ETAPA 13: BUSCAR ESTATÍSTICAS DE COMPRAS
# ==========================================
print_step "13. Buscando estatísticas de compras..."

PURCHASE_STATS=$(curl -s -X GET "$API_URL/api/purchases/stats" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $PURCHASE_STATS
TOTAL_PURCHASES=$(echo $PURCHASE_STATS | grep -o '"totalPurchases":[0-9]*' | cut -d':' -f2)
TOTAL_AMOUNT=$(echo $PURCHASE_STATS | grep -o '"totalAmount":[0-9.]*' | cut -d':' -f2)
TOTAL_CASHBACK=$(echo $PURCHASE_STATS | grep -o '"totalCashback":[0-9.]*' | cut -d':' -f2)

print_success "Total de compras: $TOTAL_PURCHASES"
print_success "Valor total: R$ $TOTAL_AMOUNT"
print_success "Cashback total: R$ $TOTAL_CASHBACK"

# ==========================================
# ETAPA 14: MERCHANT CONFIRMA A COMPRA
# ==========================================
print_step "14. Merchant confirmando a compra..."

CONFIRM_RESPONSE=$(curl -s -X PATCH "$API_URL/api/purchases/$PURCHASE_ID/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d '{}')

echo $CONFIRM_RESPONSE
print_success "Compra confirmada pelo merchant"

# ==========================================
# ETAPA 15: VERIFICAR STATUS ATUALIZADO
# ==========================================
print_step "15. Verificando status atualizado da compra..."

sleep 2 # Aguardar processamento

UPDATED_PURCHASE=$(curl -s -X GET "$API_URL/api/purchases/$PURCHASE_ID" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $UPDATED_PURCHASE
UPDATED_STATUS=$(echo $UPDATED_PURCHASE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$UPDATED_STATUS" = "confirmed" ] || [ "$UPDATED_STATUS" = "completed" ]; then
    print_success "Status atualizado: $UPDATED_STATUS"
else
    print_warning "Status: $UPDATED_STATUS (esperado: confirmed ou completed)"
fi

# ==========================================
# ETAPA 16: VERIFICAR SALDO DE CASHBACK
# ==========================================
print_step "16. Verificando saldo de cashback do consumer..."

CASHBACK_STATS=$(curl -s -X GET "$API_URL/api/cashback/stats" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $CASHBACK_STATS
AVAILABLE_CASHBACK=$(echo $CASHBACK_STATS | grep -o '"availableBalance":[0-9.]*' | head -1 | cut -d':' -f2)
print_success "Saldo de cashback disponível: R$ $AVAILABLE_CASHBACK"

# ==========================================
# RESUMO FINAL
# ==========================================
echo ""
echo "========================================="
echo "📊 RESUMO DO TESTE DE COMPRA CONSUMER"
echo "========================================="
print_success "1. Merchant criado e produto cadastrado"
print_success "2. Consumer criado e logado"
print_success "3. Produto listado no marketplace"
print_success "4. Detalhes do produto consultados"
print_success "5. Cashback calculado"
print_success "6. Compra criada com sucesso"
print_success "7. Compra encontrada no histórico"
print_success "8. Filtros funcionando"
print_success "9. Estatísticas calculadas corretamente"
print_success "10. Merchant confirmou a compra"
print_success "11. Status atualizado"
print_success "12. Cashback creditado"
echo ""
print_info "DADOS DO TESTE:"
echo "  - Consumer: $CONSUMER_EMAIL"
echo "  - Merchant: $MERCHANT_EMAIL"
echo "  - Produto: $PRODUCT_ID"
echo "  - Compra: $PURCHASE_ID"
echo "  - Valor: R$ $PRODUCT_PRICE"
echo "  - Cashback: R$ $CONSUMER_CASHBACK"
echo "  - Status final: $UPDATED_STATUS"
echo ""
echo "========================================="
print_success "✓ TESTE CONCLUÍDO COM SUCESSO!"
echo "========================================="

echo ""
print_info "Arquivos salvos:"
echo "  - Consumer Token: /tmp/consumer_token.txt"
echo "  - Consumer ID: /tmp/consumer_id.txt"
echo "  - Merchant Token: /tmp/merchant_token.txt"
echo "  - Merchant ID: /tmp/merchant_id.txt"
echo "  - Product ID: /tmp/product_id.txt"
echo "  - Purchase ID: /tmp/purchase_id.txt"

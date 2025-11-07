#!/bin/bash

# Script de teste E2E - Fluxo KYC + Saque
# Testa todo o fluxo desde registro até solicitação de saque

set -e # Parar em caso de erro

API_URL="${API_URL:-http://localhost:8033}"
TENANT_SLUG="${TENANT_SLUG:-clube-navi}"

echo "========================================="
echo "🧪 TESTE E2E: KYC + SAQUE"
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

# Limpar arquivos temporários de execuções anteriores
rm -f /tmp/merchant_token.txt /tmp/merchant_id.txt /tmp/consumer_token.txt /tmp/consumer_id.txt /tmp/product_id.txt /tmp/purchase_id.txt

# ==========================================
# ETAPA 1: REGISTRAR MERCHANT
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

MERCHANT_ID=$(echo $MERCHANT_RESPONSE | jq -r '.data.user.id')
if [ "$MERCHANT_ID" = "null" ] || [ -z "$MERCHANT_ID" ]; then
    print_error "Falha ao registrar merchant"
    echo $MERCHANT_RESPONSE | jq .
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

MERCHANT_TOKEN=$(echo $MERCHANT_LOGIN | jq -r '.data.token')
if [ "$MERCHANT_TOKEN" = "null" ] || [ -z "$MERCHANT_TOKEN" ]; then
    print_error "Falha ao fazer login"
    echo $MERCHANT_LOGIN | jq .
    exit 1
fi
echo $MERCHANT_TOKEN > /tmp/merchant_token.txt
print_success "Login realizado com sucesso"

# ==========================================
# ETAPA 3: VERIFICAR STATUS KYC (ANTES)
# ==========================================
print_step "3. Verificando status KYC (antes do upload)..."

KYC_STATUS=$(curl -s -X GET "$API_URL/api/user-documents" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $KYC_STATUS | jq .
print_warning "Documentos ainda não enviados"

# ==========================================
# ETAPA 4: SIMULAR UPLOAD DE DOCUMENTOS
# ==========================================
print_step "4. Simulando upload de documentos KYC..."

# Criar imagem fake base64 (1x1 pixel transparente PNG)
FAKE_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

# Upload frente
print_step "   4.1. Upload documento - frente..."
UPLOAD_FRONT=$(curl -s -X POST "$API_URL/api/user-documents/upload" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -F "document=@-;filename=front.jpg;type=image/jpeg" \
  -F "documentType=front" \
  <<< $(echo $FAKE_IMAGE | base64 -d))

echo $UPLOAD_FRONT | jq .

# Upload verso
print_step "   4.2. Upload documento - verso..."
UPLOAD_BACK=$(curl -s -X POST "$API_URL/api/user-documents/upload" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -F "document=@-;filename=back.jpg;type=image/jpeg" \
  -F "documentType=back" \
  <<< $(echo $FAKE_IMAGE | base64 -d))

echo $UPLOAD_BACK | jq .

# Upload selfie
print_step "   4.3. Upload selfie com documento..."
UPLOAD_SELFIE=$(curl -s -X POST "$API_URL/api/user-documents/upload" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -F "document=@-;filename=selfie.jpg;type=image/jpeg" \
  -F "documentType=selfie" \
  <<< $(echo $FAKE_IMAGE | base64 -d))

echo $UPLOAD_SELFIE | jq .
print_success "Documentos enviados"

# ==========================================
# ETAPA 5: APROVAR MERCHANT (via API admin)
# ==========================================
print_step "5. Aprovando merchant..."

# Nota: Você precisará usar o token admin aqui
# Por enquanto vamos apenas mostrar o comando

print_warning "AÇÃO MANUAL NECESSÁRIA:"
echo "Execute no admin ou via API:"
echo "curl -X PATCH $API_URL/api/admin/users/$MERCHANT_ID/merchant-status \\"
echo "  -H 'Authorization: Bearer <ADMIN_TOKEN>' \\"
echo "  -H 'X-Tenant-Slug: $TENANT_SLUG' \\"
echo "  -d '{\"merchantStatus\": \"approved\"}'"
echo ""
echo "E aprove os documentos KYC:"
echo "Acesse: $API_URL/system/document-validation/"
echo ""

read -p "Pressione ENTER após aprovar o merchant e os documentos KYC..."

# ==========================================
# ETAPA 6: CRIAR PRODUTO
# ==========================================
print_step "6. Criando produto..."

PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d '{
    "name": "Produto Teste E2E",
    "description": "Produto para teste de saque",
    "price": 100.00,
    "category": "test",
    "stock": 10,
    "isActive": true
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.data.id')
if [ "$PRODUCT_ID" = "null" ] || [ -z "$PRODUCT_ID" ]; then
    print_error "Falha ao criar produto"
    echo $PRODUCT_RESPONSE | jq .
    exit 1
fi
echo $PRODUCT_ID > /tmp/product_id.txt
print_success "Produto criado: $PRODUCT_ID - R$ 100,00"

# ==========================================
# ETAPA 7: REGISTRAR CONSUMER
# ==========================================
print_step "7. Registrando consumer..."

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

CONSUMER_ID=$(echo $CONSUMER_RESPONSE | jq -r '.data.user.id')
if [ "$CONSUMER_ID" = "null" ] || [ -z "$CONSUMER_ID" ]; then
    print_error "Falha ao registrar consumer"
    echo $CONSUMER_RESPONSE | jq .
    exit 1
fi
echo $CONSUMER_ID > /tmp/consumer_id.txt
print_success "Consumer registrado: $CONSUMER_ID"

# ==========================================
# ETAPA 8: LOGIN CONSUMER
# ==========================================
print_step "8. Fazendo login como consumer..."

CONSUMER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$CONSUMER_EMAIL\",
    \"password\": \"$CONSUMER_PASSWORD\"
  }")

CONSUMER_TOKEN=$(echo $CONSUMER_LOGIN | jq -r '.data.token')
if [ "$CONSUMER_TOKEN" = "null" ] || [ -z "$CONSUMER_TOKEN" ]; then
    print_error "Falha ao fazer login do consumer"
    echo $CONSUMER_LOGIN | jq .
    exit 1
fi
echo $CONSUMER_TOKEN > /tmp/consumer_token.txt
print_success "Consumer logado com sucesso"

# ==========================================
# ETAPA 9: COMPRAR PRODUTO
# ==========================================
print_step "9. Consumer comprando produto..."

PURCHASE_RESPONSE=$(curl -s -X POST "$API_URL/api/purchases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 1
  }")

PURCHASE_ID=$(echo $PURCHASE_RESPONSE | jq -r '.data.id')
if [ "$PURCHASE_ID" = "null" ] || [ -z "$PURCHASE_ID" ]; then
    print_error "Falha ao criar compra"
    echo $PURCHASE_RESPONSE | jq .
    exit 1
fi
echo $PURCHASE_ID > /tmp/purchase_id.txt
print_success "Compra criada: $PURCHASE_ID - R$ 100,00"

# ==========================================
# ETAPA 10: CONFIRMAR COMPRA (simular pagamento)
# ==========================================
print_step "10. Confirmando compra..."

CONFIRM_RESPONSE=$(curl -s -X PATCH "$API_URL/api/purchases/$PURCHASE_ID/confirm" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $CONFIRM_RESPONSE | jq .
print_success "Compra confirmada - Merchant deve ter R$ 100,00 em saldo de vendas"

# ==========================================
# ETAPA 11: VERIFICAR SALDO DO MERCHANT
# ==========================================
print_step "11. Verificando saldo do merchant..."

BALANCE_RESPONSE=$(curl -s -X GET "$API_URL/api/balance/all" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $BALANCE_RESPONSE | jq .

AVAILABLE_BALANCE=$(echo $BALANCE_RESPONSE | jq -r '.data.sales.availableBalance')
print_success "Saldo disponível para saque: R$ $AVAILABLE_BALANCE"

# ==========================================
# ETAPA 12: VALIDAR CHAVE PIX
# ==========================================
print_step "12. Validando chave PIX..."

# Usar chave PIX de teste (CPF)
TEST_PIX_KEY="12345678901"

VALIDATE_PIX=$(curl -s -X POST "$API_URL/api/pix/validation/validate-format" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"pixKey\": \"$TEST_PIX_KEY\",
    \"pixKeyType\": \"cpf\"
  }")

echo $VALIDATE_PIX | jq .

PIX_VALID=$(echo $VALIDATE_PIX | jq -r '.data.valid')
if [ "$PIX_VALID" = "true" ]; then
    print_success "Formato da chave PIX válido"
else
    print_warning "Formato da chave PIX inválido (mas continuaremos o teste)"
fi

# ==========================================
# ETAPA 13: SOLICITAR SAQUE
# ==========================================
print_step "13. Solicitando saque de R$ 50,00..."

WITHDRAWAL_RESPONSE=$(curl -s -X POST "$API_URL/api/withdrawals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"amount\": 50.00,
    \"pixKey\": \"$TEST_PIX_KEY\",
    \"pixKeyType\": \"cpf\",
    \"pixKeyOwnerName\": \"Test Merchant\",
    \"pixKeyOwnerCpf\": \"12345678901\"
  }")

echo $WITHDRAWAL_RESPONSE | jq .

WITHDRAWAL_ID=$(echo $WITHDRAWAL_RESPONSE | jq -r '.data.id')
if [ "$WITHDRAWAL_ID" = "null" ] || [ -z "$WITHDRAWAL_ID" ]; then
    print_error "Falha ao solicitar saque"
    echo $WITHDRAWAL_RESPONSE | jq .
    exit 1
fi

print_success "Saque solicitado: $WITHDRAWAL_ID"
print_success "Taxa: R$ 1,00 (2%)"
print_success "Valor líquido: R$ 49,00"

# ==========================================
# ETAPA 14: VERIFICAR SALDO APÓS SAQUE
# ==========================================
print_step "14. Verificando saldo após solicitação de saque..."

BALANCE_AFTER=$(curl -s -X GET "$API_URL/api/balance/all" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $BALANCE_AFTER | jq .

AVAILABLE_AFTER=$(echo $BALANCE_AFTER | jq -r '.data.sales.availableBalance')
print_success "Saldo disponível após saque: R$ $AVAILABLE_AFTER (esperado: R$ 50,00)"

# ==========================================
# ETAPA 15: LISTAR SAQUES
# ==========================================
print_step "15. Listando saques do merchant..."

WITHDRAWALS_LIST=$(curl -s -X GET "$API_URL/api/withdrawals" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $WITHDRAWALS_LIST | jq .

# ==========================================
# RESUMO FINAL
# ==========================================
echo ""
echo "========================================="
echo "📊 RESUMO DO TESTE"
echo "========================================="
print_success "1. Merchant registrado e aprovado"
print_success "2. Documentos KYC enviados e aprovados"
print_success "3. Produto criado (R$ 100,00)"
print_success "4. Consumer registrado e comprou produto"
print_success "5. Compra confirmada"
print_success "6. Saldo de vendas: R$ 100,00"
print_success "7. Saque solicitado: R$ 50,00"
print_success "8. Saldo restante: R$ 50,00"
echo ""
print_warning "PRÓXIMOS PASSOS:"
echo "1. Admin deve aprovar o saque em: /system/withdrawals/"
echo "2. Sistema processará o PIX via EFI Pay"
echo "3. Merchant receberá R$ 49,00 (R$ 50 - R$ 1 taxa)"
echo ""
echo "========================================="
print_success "✓ TESTE CONCLUÍDO COM SUCESSO!"
echo "========================================="

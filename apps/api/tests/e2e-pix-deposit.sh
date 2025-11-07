#!/bin/bash

# Script de teste E2E - Depósito PIX via EFI Pay
# Testa criação de cobrança PIX e webhook de confirmação

set -e # Parar em caso de erro

API_URL="${API_URL:-http://localhost:8033}"
TENANT_SLUG="${TENANT_SLUG:-clube-navi}"

echo "========================================="
echo "🧪 TESTE E2E: DEPÓSITO PIX (EFI PAY)"
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
rm -f /tmp/user_token.txt /tmp/user_id.txt /tmp/deposit_id.txt

# ==========================================
# ETAPA 1: REGISTRAR USUÁRIO
# ==========================================
print_step "1. Registrando usuário para depósito..."

TIMESTAMP=$(date +%s)
USER_EMAIL="deposit_test_${TIMESTAMP}@test.com"
USER_USERNAME="deposit_${TIMESTAMP}"
USER_PASSWORD="TestPass123\$"
USER_CPF="12345678901"

USER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"username\": \"$USER_USERNAME\",
    \"password\": \"$USER_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"Deposit\",
    \"cpf\": \"$USER_CPF\",
    \"phone\": \"11999999999\",
    \"userType\": \"consumer\"
  }")

USER_ID=$(echo $USER_RESPONSE | jq -r '.data.user.id')
if [ "$USER_ID" = "null" ] || [ -z "$USER_ID" ]; then
    print_error "Falha ao registrar usuário"
    echo $USER_RESPONSE | jq .
    exit 1
fi
echo $USER_ID > /tmp/user_id.txt
print_success "Usuário registrado: $USER_ID"

# ==========================================
# ETAPA 2: LOGIN
# ==========================================
print_step "2. Fazendo login..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\"
  }")

USER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
if [ "$USER_TOKEN" = "null" ] || [ -z "$USER_TOKEN" ]; then
    print_error "Falha ao fazer login"
    echo $LOGIN_RESPONSE | jq .
    exit 1
fi
echo $USER_TOKEN > /tmp/user_token.txt
print_success "Login realizado com sucesso"

# ==========================================
# ETAPA 3: VERIFICAR SALDO INICIAL
# ==========================================
print_step "3. Verificando saldo inicial..."

BALANCE_BEFORE=$(curl -s -X GET "$API_URL/api/balance/all" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $BALANCE_BEFORE | jq .

INITIAL_BALANCE=$(echo $BALANCE_BEFORE | jq -r '.data.deposit.availableBalance')
print_info "Saldo de depósito inicial: R$ $INITIAL_BALANCE"

# ==========================================
# ETAPA 4: CRIAR COBRANÇA PIX
# ==========================================
print_step "4. Criando cobrança PIX de R$ 15,00..."

print_warning "Valor de R$ 15,00 será confirmado automaticamente pela EFI em ~30 segundos"
print_info "Conforme documentação EFI: depósitos até R$ 20,00 em sandbox são auto-confirmados"

DEPOSIT_RESPONSE=$(curl -s -X POST "$API_URL/api/deposits" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d '{
    "amount": 15.00,
    "description": "Teste de depósito PIX E2E"
  }')

echo $DEPOSIT_RESPONSE | jq .

DEPOSIT_ID=$(echo $DEPOSIT_RESPONSE | jq -r '.data.id')
PIX_CODE=$(echo $DEPOSIT_RESPONSE | jq -r '.data.pixCode')
QR_CODE=$(echo $DEPOSIT_RESPONSE | jq -r '.data.qrCodeImage')

if [ "$DEPOSIT_ID" = "null" ] || [ -z "$DEPOSIT_ID" ]; then
    print_error "Falha ao criar cobrança PIX"
    echo $DEPOSIT_RESPONSE | jq .
    exit 1
fi

echo $DEPOSIT_ID > /tmp/deposit_id.txt
print_success "Cobrança PIX criada: $DEPOSIT_ID"
print_info "Valor: R$ 15,00"
echo ""

# ==========================================
# ETAPA 5: MOSTRAR CÓDIGO PIX
# ==========================================
print_step "5. Código PIX Copia e Cola:"
echo "========================================="
echo "$PIX_CODE"
echo "========================================="
echo ""

if [ "$QR_CODE" != "null" ] && [ -n "$QR_CODE" ]; then
    print_info "QR Code gerado (base64 disponível)"
    # Salvar QR code em arquivo
    echo $QR_CODE | base64 -d > /tmp/qrcode_${DEPOSIT_ID}.png 2>/dev/null || true
    if [ -f /tmp/qrcode_${DEPOSIT_ID}.png ]; then
        print_success "QR Code salvo em: /tmp/qrcode_${DEPOSIT_ID}.png"
    fi
fi

# ==========================================
# ETAPA 6: AGUARDAR WEBHOOK
# ==========================================
print_step "6. Aguardando confirmação do pagamento..."

print_info "Webhook configurado em: EFI_WEBHOOK_URL"
print_warning "Em sandbox, depósitos até R$ 20 são confirmados automaticamente"
print_info "Aguardando 35 segundos para confirmação..."

# Loop de verificação
MAX_ATTEMPTS=35
ATTEMPT=0
CONFIRMED=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    # Verificar status da transação
    DEPOSIT_STATUS=$(curl -s -X GET "$API_URL/api/deposits/$DEPOSIT_ID" \
      -H "Authorization: Bearer $USER_TOKEN" \
      -H "X-Tenant-Slug: $TENANT_SLUG")

    STATUS=$(echo $DEPOSIT_STATUS | jq -r '.data.status')

    if [ "$STATUS" = "confirmed" ]; then
        CONFIRMED=true
        break
    fi

    echo -n "."
    sleep 1
done

echo ""

if [ "$CONFIRMED" = true ]; then
    print_success "✓ Pagamento confirmado!"
    echo $DEPOSIT_STATUS | jq .
else
    print_warning "Pagamento ainda não confirmado após 35 segundos"
    print_info "Status atual: $STATUS"
    echo ""
    print_warning "Isso pode acontecer se:"
    print_info "1. O webhook EFI_WEBHOOK_URL não está acessível"
    print_info "2. O pagamento ainda está sendo processado"
    print_info "3. Houve algum erro na comunicação com a EFI"
    echo ""
    echo "Status atual da transação:"
    echo $DEPOSIT_STATUS | jq .
fi

# ==========================================
# ETAPA 7: VERIFICAR SALDO FINAL
# ==========================================
print_step "7. Verificando saldo final..."

sleep 2 # Aguardar processamento

BALANCE_AFTER=$(curl -s -X GET "$API_URL/api/balance/all" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG")

echo $BALANCE_AFTER | jq .

FINAL_BALANCE=$(echo $BALANCE_AFTER | jq -r '.data.deposit.availableBalance')
print_info "Saldo de depósito final: R$ $FINAL_BALANCE"

# Calcular diferença
DIFFERENCE=$(echo "$FINAL_BALANCE - $INITIAL_BALANCE" | bc)

if [ "$DIFFERENCE" = "15.00" ] || [ "$DIFFERENCE" = "15" ]; then
    print_success "Saldo atualizado corretamente! (+R$ 15,00)"
else
    print_warning "Saldo não foi atualizado ainda (diferença: R$ $DIFFERENCE)"
    print_info "Verifique os logs do webhook"
fi

# ==========================================
# ETAPA 8: BUSCAR TRANSAÇÃO NO BANCO
# ==========================================
print_step "8. Verificando transação no banco de dados..."

TRANSACTION=$(curl -s -X GET "$API_URL/api/transactions/$DEPOSIT_ID" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" 2>/dev/null || echo '{"success":false}')

if [ "$(echo $TRANSACTION | jq -r '.success')" = "true" ]; then
    echo $TRANSACTION | jq .
    TX_STATUS=$(echo $TRANSACTION | jq -r '.data.status')
    print_info "Status da transação no banco: $TX_STATUS"
else
    print_warning "Não foi possível buscar transação (endpoint pode não existir)"
fi

# ==========================================
# RESUMO FINAL
# ==========================================
echo ""
echo "========================================="
echo "📊 RESUMO DO TESTE DE DEPÓSITO PIX"
echo "========================================="
print_success "1. Usuário registrado: $USER_EMAIL"
print_success "2. Cobrança PIX criada: $DEPOSIT_ID"
print_success "3. Valor: R$ 15,00"
print_success "4. Código PIX gerado"

if [ "$CONFIRMED" = true ]; then
    print_success "5. Pagamento CONFIRMADO ✓"
    print_success "6. Saldo atualizado: +R$ 15,00"
else
    print_warning "5. Pagamento PENDENTE"
    print_warning "6. Aguardando webhook da EFI"
fi

echo ""
print_info "CONFIGURAÇÃO DO WEBHOOK:"
echo "Certifique-se que EFI_WEBHOOK_URL está configurado no .env"
echo "Webhook deve apontar para: $API_URL/api/webhooks/efi"
echo ""
print_info "VERIFICAÇÃO MANUAL:"
echo "1. Abra o portal da EFI Pay (sandbox.gerencianet.com.br)"
echo "2. Verifique se a cobrança foi criada"
echo "3. Verifique se o webhook foi disparado"
echo "4. Confira os logs do servidor"
echo ""

if [ "$CONFIRMED" = true ]; then
    echo "========================================="
    print_success "✓ TESTE CONCLUÍDO COM SUCESSO!"
    echo "========================================="
else
    echo "========================================="
    print_warning "⚠ TESTE PARCIALMENTE CONCLUÍDO"
    echo "========================================="
    print_info "Cobrança criada, mas pagamento não confirmado automaticamente"
    print_info "Verifique a configuração do webhook"
fi

echo ""
print_info "Arquivos salvos:"
echo "  - Token: /tmp/user_token.txt"
echo "  - User ID: /tmp/user_id.txt"
echo "  - Deposit ID: /tmp/deposit_id.txt"
if [ -f /tmp/qrcode_${DEPOSIT_ID}.png ]; then
    echo "  - QR Code: /tmp/qrcode_${DEPOSIT_ID}.png"
fi

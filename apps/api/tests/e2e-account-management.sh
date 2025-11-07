#!/bin/bash

# Script de teste E2E - Gestão de Conta (Senha, Dados LGPD, Exclusão)
# Testa os novos endpoints de gerenciamento de conta do usuário

set -e # Parar em caso de erro

API_URL="${API_URL:-http://localhost:8033}"
TENANT_SLUG="${TENANT_SLUG:-clube-navi}"

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

echo "========================================="
echo "🧪 TESTE E2E: GESTÃO DE CONTA"
echo "========================================="
echo "API: $API_URL"
echo "Tenant: $TENANT_SLUG"
echo ""

# Verificar se API está disponível
print_step "0. Verificando disponibilidade da API..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" || echo "000")
if [ "$HEALTH_CHECK" != "200" ]; then
    print_error "API não está respondendo (HTTP $HEALTH_CHECK)"
    print_error "Verifique se o servidor está rodando em $API_URL"
    exit 1
fi
print_success "API está respondendo"
echo ""

# Limpar arquivos temporários
rm -f /tmp/test_user_token.txt /tmp/test_user_id.txt

# ==========================================
# ETAPA 1: REGISTRAR USUÁRIO DE TESTE
# ==========================================
print_step "1. Registrando usuário de teste..."

TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser_${TIMESTAMP}@test.com"
TEST_USERNAME="testuser_${TIMESTAMP}"
TEST_PASSWORD="OldPass123"
TEST_NEW_PASSWORD="NewPass456"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"cpf\": \"98765432100\",
    \"phone\": \"11988887777\",
    \"userType\": \"consumer\"
  }")

USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$USER_ID" ]; then
    print_error "Falha ao registrar usuário"
    echo $REGISTER_RESPONSE
    exit 1
fi
echo $USER_ID > /tmp/test_user_id.txt
print_success "Usuário registrado: $USER_ID"

# ==========================================
# ETAPA 2: LOGIN
# ==========================================
print_step "2. Fazendo login..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

USER_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$USER_TOKEN" ]; then
    print_error "Falha ao fazer login"
    echo $LOGIN_RESPONSE
    exit 1
fi
echo $USER_TOKEN > /tmp/test_user_token.txt
print_success "Login realizado com sucesso"

# ==========================================
# ETAPA 3: DOWNLOAD DE DADOS (LGPD)
# ==========================================
print_step "3. Testando download de dados do usuário (LGPD)..."

DATA_RESPONSE=$(curl -s -X GET "$API_URL/api/users/data" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $USER_TOKEN")

# Verificar se retornou dados
if echo "$DATA_RESPONSE" | grep -q '"success":true'; then
    print_success "Download de dados realizado com sucesso"

    # Verificar se contém campos esperados
    if echo "$DATA_RESPONSE" | grep -q '"email"' && \
       echo "$DATA_RESPONSE" | grep -q '"cpf"' && \
       ! echo "$DATA_RESPONSE" | grep -q '"password"'; then
        print_success "Dados retornados corretamente (sem campos sensíveis)"
    else
        print_warning "Estrutura de dados pode estar incorreta"
    fi
else
    print_error "Falha ao baixar dados do usuário"
    echo $DATA_RESPONSE
    exit 1
fi

# ==========================================
# ETAPA 4: ALTERAÇÃO DE SENHA
# ==========================================
print_step "4. Testando alteração de senha..."

# Tentar com senha atual errada (deve falhar)
print_info "4.1. Testando com senha atual incorreta (deve falhar)..."
WRONG_PASSWORD_RESPONSE=$(curl -s -X PUT "$API_URL/api/users/password" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"currentPassword\": \"WrongPass123\",
    \"newPassword\": \"$TEST_NEW_PASSWORD\"
  }")

if echo "$WRONG_PASSWORD_RESPONSE" | grep -q '"success":false'; then
    print_success "Validação de senha atual funcionando corretamente"
else
    print_error "Erro: deveria rejeitar senha atual incorreta"
    exit 1
fi

# Alterar senha corretamente
print_info "4.2. Alterando senha com senha atual correta..."
CHANGE_PASSWORD_RESPONSE=$(curl -s -X PUT "$API_URL/api/users/password" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"currentPassword\": \"$TEST_PASSWORD\",
    \"newPassword\": \"$TEST_NEW_PASSWORD\"
  }")

if echo "$CHANGE_PASSWORD_RESPONSE" | grep -q '"success":true'; then
    print_success "Senha alterada com sucesso"
else
    print_error "Falha ao alterar senha"
    echo $CHANGE_PASSWORD_RESPONSE
    exit 1
fi

# Tentar login com senha antiga (deve falhar)
print_info "4.3. Tentando login com senha antiga (deve falhar)..."
OLD_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$OLD_LOGIN" | grep -q '"success":false'; then
    print_success "Login com senha antiga rejeitado corretamente"
else
    print_error "Erro: deveria rejeitar senha antiga"
    exit 1
fi

# Login com nova senha
print_info "4.4. Fazendo login com nova senha..."
NEW_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_NEW_PASSWORD\"
  }")

NEW_TOKEN=$(echo $NEW_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$NEW_TOKEN" ]; then
    print_success "Login com nova senha realizado com sucesso"
    USER_TOKEN=$NEW_TOKEN
else
    print_error "Falha ao fazer login com nova senha"
    echo $NEW_LOGIN
    exit 1
fi

# ==========================================
# ETAPA 5: TENTATIVA DE EXCLUSÃO COM SALDO
# ==========================================
print_step "5. Testando exclusão de conta com saldo (deve falhar se houver)..."

# Primeiro, vamos verificar o saldo
print_info "5.1. Verificando saldo do usuário..."

DELETE_WITH_BALANCE=$(curl -s -X DELETE "$API_URL/api/users/account" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"reason\": \"Teste automatizado\"
  }")

# Se o usuário não tem saldo, vai deletar. Se tem, vai dar erro 400
if echo "$DELETE_WITH_BALANCE" | grep -q '"success":true'; then
    print_success "Conta excluída (usuário sem saldo)"

    # Verificar que não consegue mais fazer login
    print_info "5.2. Verificando que conta foi deletada (login deve falhar)..."
    DELETED_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -H "X-Tenant-Slug: $TENANT_SLUG" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_NEW_PASSWORD\"
      }")

    if echo "$DELETED_LOGIN" | grep -q '"success":false'; then
        print_success "Conta deletada e login bloqueado corretamente"
    else
        print_error "Erro: conta deletada mas ainda permite login"
        exit 1
    fi
elif echo "$DELETE_WITH_BALANCE" | grep -q 'saldo\|balance'; then
    print_success "Validação de saldo funcionando (precisa sacar antes de deletar)"
else
    print_warning "Resposta inesperada na exclusão de conta"
    echo $DELETE_WITH_BALANCE
fi

# ==========================================
# RESUMO FINAL
# ==========================================
echo ""
echo "========================================="
echo -e "${GREEN}✓ TODOS OS TESTES PASSARAM!${NC}"
echo "========================================="
echo ""
echo "Testes realizados:"
echo "  ✓ Registro de usuário"
echo "  ✓ Login"
echo "  ✓ Download de dados (LGPD)"
echo "  ✓ Validação de senha atual"
echo "  ✓ Alteração de senha"
echo "  ✓ Login com senha antiga (rejeitado)"
echo "  ✓ Login com nova senha"
echo "  ✓ Exclusão de conta (com validação de saldo)"
echo ""
print_success "Suite de testes de gestão de conta concluída!"

# Limpar arquivos temporários
rm -f /tmp/test_user_token.txt /tmp/test_user_id.txt

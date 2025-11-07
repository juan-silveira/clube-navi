# Testes E2E - API Clube Digital

Este diretório contém testes end-to-end para validar o funcionamento completo da API.

## 📋 Testes Disponíveis

### 1. `e2e-full-auto.sh` ⭐ RECOMENDADO

Teste **TOTALMENTE AUTOMATIZADO** com aprovação automática de merchant via SQL.

**O que é testado:**

1. ✅ Criação de Merchant com credenciais únicas
2. ✅ Aprovação automática via SQL (merchant_status = 'approved')
3. ✅ Criação de produto
4. ✅ Criação de Consumer com credenciais únicas
5. ✅ Criação de compra
6. ✅ Confirmação de compra
7. ✅ Verificação de estatísticas

**Características:**
- ✅ Gera CPF e email únicos para cada execução
- ✅ Aprova merchant automaticamente via SQL
- ✅ Não requer intervenção manual
- ✅ Testa fluxo completo E2E em < 5 segundos

**Como executar:**
```bash
API_URL=http://localhost:8033 TENANT_SLUG=clube-navi bash ./apps/api/tests/e2e-full-auto.sh
```

---

### 2. `e2e-account-management.sh` ⭐ NOVO

Teste completo de gerenciamento de conta do usuário com LGPD compliance.

**O que é testado:**

1. ✅ Health check da API
2. ✅ Registro de usuário com dados únicos
3. ✅ Login e obtenção de token JWT
4. ✅ Download de dados do usuário (LGPD compliance)
5. ✅ Verificação de remoção de campos sensíveis (password)
6. ✅ Alteração de senha com senha atual incorreta (deve falhar)
7. ✅ Alteração de senha com senha atual correta (deve passar)
8. ✅ Login com senha antiga após alteração (deve falhar)
9. ✅ Login com senha nova após alteração (deve passar)
10. ✅ Exclusão de conta com validação de saldo
11. ✅ Bloqueio de login após exclusão

**Características:**
- ✅ Validação de health check antes de executar
- ✅ Gera CPF, email e username únicos usando timestamp
- ✅ Testa casos de sucesso e falha (validações negativas)
- ✅ Cleanup automático de arquivos temporários
- ✅ Output colorido e estruturado
- ✅ 287 linhas de código com cobertura completa

**Como executar:**
```bash
API_URL=http://localhost:8033 TENANT_SLUG=clube-navi bash ./apps/api/tests/e2e-account-management.sh
```

**Saída esperada:**
```
=========================================
🧪 TESTE E2E: GESTÃO DE CONTA
=========================================
API: http://localhost:8033
Tenant: clube-navi

▶ 0. Verificando disponibilidade da API...
✓ API está respondendo

▶ 1. Registrando usuário de teste...
✓ Usuário registrado: <user-id>

▶ 2. Fazendo login...
✓ Login realizado com sucesso

▶ 3. Testando download de dados do usuário (LGPD)...
✓ Download de dados realizado com sucesso
✓ Dados retornados corretamente (sem campos sensíveis)

▶ 4. Testando alteração de senha...
ℹ 4.1. Testando com senha atual incorreta (deve falhar)...
✓ Validação de senha atual funcionando corretamente
ℹ 4.2. Alterando senha com senha atual correta...
✓ Senha alterada com sucesso
ℹ 4.3. Tentando login com senha antiga (deve falhar)...
✓ Login com senha antiga rejeitado corretamente
ℹ 4.4. Fazendo login com nova senha...
✓ Login com nova senha realizado com sucesso

▶ 5. Testando exclusão de conta com saldo (deve falhar se houver)...
ℹ 5.1. Verificando saldo do usuário...
✓ Conta excluída (usuário sem saldo)
ℹ 5.2. Verificando que conta foi deletada (login deve falhar)...
✓ Conta deletada e login bloqueado corretamente

=========================================
✓ TODOS OS TESTES PASSARAM!
=========================================

✓ Suite de testes de gestão de conta concluída!
```

---

### 3. `e2e-cashback-system.sh`

Teste completo do sistema de produtos, compras e cashback (requer aprovação manual de merchant).

**NOTA:** Este teste requer aprovação manual do merchant. Use o script `approve-merchant.js` ou prefira o `e2e-full-auto.sh`.

**O que é testado:**

1. ✅ Criação e autenticação de Merchant (lojista)
2. ✅ Criação de produto
3. ✅ Listagem de produtos
4. ✅ Busca de produto por ID
5. ✅ Criação e autenticação de Consumer (consumidor)
6. ✅ Cálculo de preview de cashback
7. ✅ Criação de compra
8. ✅ Confirmação de compra
9. ✅ Processamento de cashback
10. ✅ Estatísticas do consumer
11. ✅ Histórico de cashback
12. ✅ Listagem de compras
13. ✅ Estatísticas de compras
14. ✅ Listagem de categorias
15. ✅ Produtos em destaque

**Total: 15 endpoints testados**

## 🚀 Como Executar

### Pré-requisitos

1. API rodando: `npm run dev:api`
2. Banco de dados configurado e migrado
3. Tenant criado (padrão: `clube_navi`)

### Execução Básica

```bash
# Executar com configurações padrão
./apps/api/tests/e2e-cashback-system.sh
```

### Execução com Variáveis Customizadas

```bash
# Customizar API URL e Tenant
API_URL=http://localhost:4000 \
TENANT_SLUG=meu_tenant \
./apps/api/tests/e2e-cashback-system.sh
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `API_URL` | URL da API | `http://localhost:4000` |
| `TENANT_SLUG` | Slug do tenant | `clube_navi` |

## 📊 Saída Esperada

O script exibe uma saída colorida com cada passo do teste:

```
╔════════════════════════════════════════════════════════════╗
║   Teste E2E - Sistema de Produtos, Compras e Cashback    ║
╔════════════════════════════════════════════════════════════╗

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 1. Criando e logando Merchant (Lojista)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Merchant criado: merchant_1234567890@test.com
ℹ️  Merchant ID: abc123...

[... mais passos ...]

╔════════════════════════════════════════════════════════════╗
║              ✅ TESTE E2E CONCLUÍDO COM SUCESSO            ║
╔════════════════════════════════════════════════════════════╗

Total: 15 endpoints testados com sucesso!
```

## 🔍 Debugging

Se algum teste falhar, o script mostrará:
- ❌ Mensagem de erro
- 📄 Response completo da API
- 🛑 O script para na primeira falha (`set -e`)

## 📝 Estrutura do Teste

```
1. Setup
   ├── Criar merchant
   └── Criar consumer

2. Produtos
   ├── Criar produto
   ├── Listar produtos
   ├── Buscar produto
   ├── Listar categorias
   └── Produtos em destaque

3. Cashback
   ├── Calcular preview
   └── Obter estatísticas

4. Compras
   ├── Criar compra
   ├── Confirmar compra
   ├── Listar compras
   └── Estatísticas

5. Cashback Distribuição
   ├── Processar cashback
   ├── Verificar histórico
   └── Validar estatísticas
```

## 🧪 Testes Futuros

- [ ] Teste de upload de imagem de produto
- [ ] Teste de cancelamento de compra
- [ ] Teste de atualização de estoque
- [ ] Teste de filtros avançados
- [ ] Teste de paginação
- [ ] Teste de permissões (403)
- [ ] Teste de validações (400)
- [ ] Teste de recursos não encontrados (404)

## 🛠️ Scripts Helper

### `approve-merchant.js`

Script para aprovar merchants manualmente no banco de dados.

**Uso:**
```bash
node apps/api/scripts/approve-merchant.js <email_ou_id> [tenant_slug]

# Exemplos
node apps/api/scripts/approve-merchant.js merchant@test.com
node apps/api/scripts/approve-merchant.js merchant@test.com clube-navi
node apps/api/scripts/approve-merchant.js abc-123-def-456
```

**O que faz:**
- Busca merchant por email ou ID
- Atualiza `merchantStatus` para `approved`
- Ativa `isActive` e `emailConfirmed`

## 📚 Documentação Relacionada

- [PROJECT-STATUS.md](../../../docs/PROJECT-STATUS.md) - Status do projeto
- [CORE-BUSINESS.md](../../../docs/CORE-BUSINESS.md) - Regras de negócio
- [MULTI-TENANT-ARCHITECTURE.md](../../../docs/MULTI-TENANT-ARCHITECTURE.md) - Arquitetura multi-tenant

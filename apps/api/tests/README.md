# Testes E2E - API Clube Digital

Este diretório contém testes end-to-end para validar o funcionamento completo da API.

## 📋 Testes Disponíveis

### 1. `e2e-cashback-system.sh`

Teste completo do sistema de produtos, compras e cashback.

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

## 📚 Documentação Relacionada

- [PROJECT-STATUS.md](../../../docs/PROJECT-STATUS.md) - Status do projeto
- [CORE-BUSINESS.md](../../../docs/CORE-BUSINESS.md) - Regras de negócio
- [MULTI-TENANT-ARCHITECTURE.md](../../../docs/MULTI-TENANT-ARCHITECTURE.md) - Arquitetura multi-tenant

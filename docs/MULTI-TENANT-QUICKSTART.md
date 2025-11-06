# 🚀 Multi-Tenant Quick Start Guide

Guia rápido para começar a usar o sistema multi-tenant do Clube Digital.

---

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

---

## 🛠️ Setup Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite `.env` e configure:

```env
# Master Database
MASTER_DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/clube_digital_master

# PostgreSQL Admin
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

### 3. Criar Master Database

```bash
# Criar database manualmente no PostgreSQL
psql -U postgres -c "CREATE DATABASE clube_digital_master;"
```

### 4. Executar Migrations do Master

```bash
npx prisma migrate deploy --schema=./apps/api/prisma/schema-master.prisma
```

### 5. Gerar Prisma Clients

```bash
# Gerar Master Client
npx prisma generate --schema=./apps/api/prisma/schema-master.prisma

# Gerar Tenant Client
npx prisma generate --schema=./apps/api/prisma/schema-tenant.prisma
```

---

## 👥 Gerenciar Tenants

### Criar Novo Tenant

Use o script de criação automática:

```bash
node scripts/create-tenant.js \
  --slug=empresa-a \
  --name="Empresa A Ltda" \
  --email=admin@empresa-a.com \
  --document="12.345.678/0001-90" \
  --phone="11999999999" \
  --plan=BASIC
```

**O script faz automaticamente:**
- ✅ Cria database PostgreSQL para o tenant
- ✅ Cria usuário PostgreSQL específico
- ✅ Registra tenant no Master DB
- ✅ Executa migrations no tenant DB
- ✅ Cria configurações iniciais (cashback, modules, etc.)
- ✅ Cria admin do tenant
- ✅ Retorna credenciais de acesso

**Exemplo de output:**

```
✨ TENANT CREATED SUCCESSFULLY! ✨

📋 Tenant Information:
  Slug:          empresa-a
  Company:       Empresa A Ltda
  Subdomain:     empresa-a.api.clubedigital.com.br
  Status:        trial
  Plan:          BASIC
  Trial until:   06/12/2025

🔐 Admin Credentials:
  Email:         admin@empresa-a.com
  Password:      aB3$kL9pMn4Q
  ⚠️  SAVE THESE CREDENTIALS!
```

### Listar Tenants

```bash
node scripts/list-tenants.js
```

### Migrar Todos os Tenants

Quando houver mudanças no schema-tenant.prisma:

```bash
# Dry run (apenas lista)
node scripts/migrate-all-tenants.js --dry-run

# Executar migrations
node scripts/migrate-all-tenants.js
```

---

## 🔧 Desenvolvimento

### Estrutura de Schemas

```
apps/api/prisma/
├── schema-master.prisma    # Master DB (tenants, modules, analytics)
├── schema-tenant.prisma    # Tenant DB (users, products, purchases)
└── schema.prisma           # Legacy (será removido)
```

### Prisma Clients

```javascript
// Master Client (informações de tenants)
const { masterPrisma } = require('./src/database');

const tenants = await masterPrisma.tenant.findMany();

// Tenant Client (dados do tenant específico)
const { getTenantClient } = require('./src/database');

// Via middleware (automático)
app.use(resolveTenantMiddleware);

app.get('/users', async (req, res) => {
  // req.tenant = tenant data
  // req.tenantPrisma = tenant database client

  const users = await req.tenantPrisma.user.findMany();
  res.json(users);
});
```

### Middleware de Tenant Resolution

O middleware `resolveTenantMiddleware` resolve o tenant baseado em:

**Prioridade de resolução:**
1. **Header `X-Tenant-Slug`**: `X-Tenant-Slug: empresa-a`
2. **Subdomínio**: `empresa-a.api.clubedigital.com.br`
3. **Custom Domain**: `api.empresaa.com.br`

**Exemplo de uso:**

```javascript
const { resolveTenantMiddleware } = require('./src/middleware/tenant-resolution.middleware');

// Aplicar em rotas que precisam de tenant
app.use('/api', resolveTenantMiddleware);

app.get('/api/products', async (req, res) => {
  // Tenant já resolvido
  console.log(req.tenant.slug); // "empresa-a"

  const products = await req.tenantPrisma.product.findMany();
  res.json(products);
});
```

---

## 🧪 Testar Multi-Tenant

### 1. Criar Tenant de Teste

```bash
node scripts/create-tenant.js \
  --slug=test-tenant \
  --name="Test Company" \
  --email=admin@test.com
```

### 2. Fazer Request com Header

```bash
curl -H "X-Tenant-Slug: test-tenant" \
     http://localhost:4000/api/users
```

### 3. Fazer Request com Subdomínio (local)

Adicione em `/etc/hosts`:

```
127.0.0.1  test-tenant.localhost
```

Acesse: `http://test-tenant.localhost:4000/api/users`

---

## 📊 Analytics e Stats

O sistema coleta automaticamente:

- **TenantStats**: Métricas por tenant
- **GlobalStats**: Métricas agregadas de todos os tenants

### Trigger Analytics

```javascript
const { analyticsService } = require('./src/services/analytics.service');

// Ao criar usuário
await analyticsService.onUserCreated(tenantId, 'consumer');

// Ao completar compra
await analyticsService.onPurchaseCompleted(tenantId, {
  totalAmount: 1000,
  cashbackTotal: 100,
  platformFee: 50
});
```

---

## 🎨 Branding por Tenant

Cada tenant pode ter seu próprio branding:

```javascript
// Buscar branding do tenant
const tenant = await masterPrisma.tenant.findUnique({
  where: { slug: 'empresa-a' },
  include: { branding: true }
});

console.log(tenant.branding);
// {
//   logoUrl: 'https://...',
//   primaryColor: '#3B82F6',
//   appName: 'Clube Empresa A'
// }
```

---

## 🧩 Sistema de Módulos

### Habilitar/Desabilitar Módulos (Tenant-Level)

```javascript
// Via API ou script
await masterPrisma.tenantModule.update({
  where: {
    tenantId_moduleKey: {
      tenantId: tenant.id,
      moduleKey: 'marketplace'
    }
  },
  data: {
    isEnabled: false // Desabilitar marketplace
  }
});
```

### Configurar Módulos por Usuário (User-Level)

```javascript
// Desabilitar cinema para usuário específico
await req.tenantPrisma.userModule.create({
  data: {
    userId: user.id,
    moduleKey: 'cinema',
    isEnabled: false,
    reason: 'User requested removal'
  }
});
```

### Middleware de Validação

```javascript
const { requireModule } = require('./src/middleware/module.middleware');

// Validar acesso ao módulo
app.get('/api/products',
  resolveTenantMiddleware,
  authenticate,
  requireModule('marketplace'),  // 2-level validation
  async (req, res) => {
    // Apenas acessa se:
    // 1. Tenant tem marketplace habilitado
    // 2. Usuário tem marketplace habilitado (ou usa padrão do tenant)
    res.json(products);
  }
);
```

---

## 💰 Configuração de Cashback

### Padrão do Tenant

```javascript
// Atualizar percentuais padrão
await masterPrisma.tenantCashbackConfig.update({
  where: { tenantId: tenant.id },
  data: {
    consumerPercent: 60.0,  // Aumentar para 60%
    clubPercent: 20.0,
    consumerReferrerPercent: 10.0,
    merchantReferrerPercent: 10.0
  }
});
```

### Configuração Individual

```javascript
// Dar 70% de cashback para VIP
await req.tenantPrisma.userCashbackConfig.create({
  data: {
    userId: vipUser.id,
    consumerPercent: 70.0,
    clubPercent: 15.0,
    consumerReferrerPercent: 7.5,
    merchantReferrerPercent: 7.5,
    reason: 'Cliente VIP - cashback premium'
  }
});
```

---

## 🔐 Segurança

### Isolamento de Dados

- ✅ Cada tenant tem seu próprio database
- ✅ Zero cross-tenant data leakage
- ✅ Connection pooling por tenant
- ✅ Validações de tenant em todas as requests

### Status e Subscription

O middleware verifica automaticamente:
- ❌ `suspended`: Bloqueia acesso (403)
- ❌ `cancelled` / `expired`: Bloqueia acesso (403)
- ⚠️ `PAST_DUE`: Permite acesso com warning
- ❌ `SUSPENDED` (subscription): Requer pagamento (402)

---

## 📚 Próximos Passos

1. ✅ **Implementar módulos** no frontend
2. ✅ **Criar dashboard de analytics** para Super-Admin
3. ✅ **Implementar sistema de campanhas** (push, SMS, WhatsApp)
4. ✅ **Build de apps mobile** separados por tenant
5. ✅ **Configurar OTA updates** com EAS
6. ✅ **Testes E2E** de isolamento

---

## 🆘 Troubleshooting

### Erro: "Tenant not found"

- Verifique se o tenant existe: `node scripts/list-tenants.js`
- Verifique o header/subdomínio na request
- Limpe o cache: `clearTenantCache()`

### Erro: "Database connection failed"

- Verifique se o database do tenant existe
- Verifique credenciais no Master DB
- Teste conexão manualmente: `psql -h localhost -U user_empresa_a -d clube_digital_empresa_a`

### Erro: "Module not enabled"

- Verifique se módulo está habilitado no tenant
- Verifique configuração individual do usuário
- Retorne ao padrão: `DELETE FROM user_modules WHERE user_id = '...'`

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📖 Documentação completa: `/docs/MULTI-TENANT-ARCHITECTURE.md`
- 💼 Regras de negócio: `/docs/CORE-BUSINESS.md`
- 📊 Status do projeto: `/docs/PROJECT-STATUS.md`

---

**Versão**: 2.2.0
**Última atualização**: 2025-11-06

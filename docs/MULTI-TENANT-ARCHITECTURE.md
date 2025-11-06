# 🏢 Arquitetura Multi-Tenant - Clube Digital

> **Documento de Planejamento e Implementação**
> Transformação para plataforma whitelabel multi-tenant completa
> **Versão**: 2.2.0
> **Atualizado em**: 2025-11-06

---

## 📌 Índice

1. [Visão Geral](#-visão-geral)
2. [Decisões de Arquitetura](#-decisões-de-arquitetura)
3. [Arquitetura de Dados](#-arquitetura-de-dados)
4. [Schema Master Database](#-schema-master-database)
5. [Schema Tenant Database](#-schema-tenant-database)
6. [Backend - Tenant Resolution](#-backend---tenant-resolution)
7. [Sistema de Módulos](#-sistema-de-módulos)
8. [Sistema de Comunicação](#-sistema-de-comunicação)
9. [Mobile - Apps Separados + Deploy Único](#-mobile---apps-separados--deploy-único)
10. [Admin Web - Single Deploy](#-admin-web---single-deploy)
11. [Scripts de Automação](#-scripts-de-automação)
12. [Roadmap de Implementação](#-roadmap-de-implementação)
13. [Checklists Detalhadas](#-checklists-detalhadas)

---

## 🎯 Visão Geral

### O Que Estamos Construindo

Uma plataforma SaaS whitelabel onde:
- ✅ Cada empresa cliente tem **seu próprio app** nas lojas (iOS + Android)
- ✅ **1 deploy atualiza TODOS os apps** instantaneamente (sem review das stores)
- ✅ Cada tenant tem **banco de dados isolado** (segurança máxima)
- ✅ **1 comando migra todos os bancos** de uma vez
- ✅ Admin web com **subdomains por tenant**
- ✅ **Sistema modular** (habilita/desabilita features por tenant)
- ✅ **Comunicação em massa** (push/sms/whatsapp)

### Requisitos do Cliente

#### 1. **Multi-Tenant Completo**
- Cada empresa cliente tem seu próprio ambiente isolado
- Usuário da Empresa A não pode ver/acessar dados da Empresa B
- Super-admin vê todos os tenants
- Admin do tenant vê apenas seu tenant

#### 2. **Whitelabel Apps**
- App mobile separado para cada tenant (iOS + Android)
- Cada app com sua própria marca (nome, logo, cores)
- Admin web separado para cada tenant
- Acesso via subdomain: `empresa-a.clubedigital.com.br`
- Ou custom domain: `app.empresaa.com`

#### 3. **Deploy Único**
- 1 código-fonte mantém N apps
- Mudanças de código atualizam todos os apps automaticamente
- Sem necessidade de N deploys manuais
- Migrations rodam em todos os bancos com 1 comando

#### 4. **Sistema Modular**
- Admin pode habilitar/desabilitar módulos por tenant
- Módulos: Internet, Cinema, Marketplace, Telemedicina, Gift Cards, etc
- Usuário perde acesso imediato ao desabilitar módulo

#### 5. **Comunicação em Massa**
- Push notifications, SMS, WhatsApp
- Envio para 1 ou N usuários
- Preview de mensagem com imagens e botões
- Targeting por CEP e raio geográfico
- Templates customizáveis

---

## 🎯 Decisões de Arquitetura

### Mobile: Apps Separados + EAS Update (Escolhido)

**Decisão Final:** Cada tenant tem seu próprio app na loja, mas todos compartilham o mesmo código JavaScript via EAS Update.

#### Como Funciona

```
┌─────────────────────────────────────────────────┐
│           App Store / Play Store                 │
├─────────────────────────────────────────────────┤
│  📱 App Empresa A (com.empresa-a.app)           │
│  📱 App Empresa B (com.empresa-b.app)           │
│  📱 App Empresa C (com.empresa-c.app)           │
└─────────────────────────────────────────────────┘
             ↓ Todos apontam para
┌─────────────────────────────────────────────────┐
│         EAS Update Server (você controla)        │
│  - Código JavaScript compartilhado               │
│  - Assets compartilhados                         │
│  - Updates instantâneos (sem review)             │
└─────────────────────────────────────────────────┘
```

#### Vantagens

- ✅ **Apps separados nas stores** (marca própria por tenant)
- ✅ **1 deploy = todos atualizam** (via OTA)
- ✅ **Sem review da store** para updates de código
- ✅ **Manutenção simples** (1 codebase)
- ✅ **Custos baixos** (1 conta Expo)

#### Quando Fazer Build vs Update

| Ação | Quando | Requer Review Store? |
|------|--------|---------------------|
| **Build inicial** | Setup do tenant (1x) | ✅ Sim (~2 dias) |
| **Update de código** | Toda mudança JS/features | ❌ Não (instantâneo) |
| **Update de assets** | Mudança de ícone/splash | ❌ Não (instantâneo) |
| **Update nativo** | Mudança no código nativo | ✅ Sim (~2 dias) |

**Resultado:** 99% dos updates são instantâneos!

### Database: Database per Tenant (Escolhido)

**Decisão Final:** Cada tenant tem seu próprio banco PostgreSQL.

```
clube_digital_master       ← Metadados dos tenants
clube_digital_empresa_a    ← Dados da Empresa A
clube_digital_empresa_b    ← Dados da Empresa B
clube_digital_empresa_c    ← Dados da Empresa C
```

#### Vantagens

- ✅ **Isolamento total** (LGPD perfeito)
- ✅ **Performance independente**
- ✅ **Backup/restore individual**
- ✅ **1 comando migra todos** (script automatizado)
- ✅ **Escalabilidade** (mover tenant para outro servidor)

### Admin Web: Single Deploy + Subdomain

**Decisão Final:** 1 deploy do Next.js serve todos os tenants via subdomain routing.

```
empresa-a.clubedigital.com.br → Tenant A
empresa-b.clubedigital.com.br → Tenant B
admin.clubedigital.com.br     → Super Admin
```

### Backend API: Single Deploy + Tenant Middleware

**Decisão Final:** 1 deploy da API serve todos os tenants via middleware de resolução.

---

## 🗄️ Arquitetura de Dados

### Diagrama Completo

```
┌─────────────────────────────────────────────────────────┐
│                  MASTER DATABASE                         │
│  clube_digital_master                                   │
│                                                          │
│  - Tenants (empresas clientes)                          │
│  - TenantBranding (logos, cores, etc)                   │
│  - TenantModules (módulos habilitados)                  │
│  - TenantAdmins (admins de cada tenant)                 │
│  - SuperAdmins (acesso global)                          │
│  - TenantConfigs (configurações)                        │
│  - TenantUsageStats (métricas)                          │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ TENANT A DB  │   │ TENANT B DB  │   │ TENANT C DB  │
│              │   │              │   │              │
│ - Users      │   │ - Users      │   │ - Users      │
│ - Products   │   │ - Products   │   │ - Products   │
│ - Purchases  │   │ - Purchases  │   │ - Purchases  │
│ - Cashback   │   │ - Cashback   │   │ - Cashback   │
│ - Campaigns  │   │ - Campaigns  │   │ - Campaigns  │
│ - etc...     │   │ - etc...     │   │ - etc...     │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 📊 Schema Master Database

```prisma
// prisma/schema-master.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../apps/api/src/generated/master-client"
}

datasource db {
  provider = "postgresql"
  url      = env("MASTER_DATABASE_URL")
}

model Tenant {
  id                String    @id @default(uuid()) @db.Uuid
  slug              String    @unique @db.VarChar(50)
  companyName       String    @db.VarChar(255)
  companyDocument   String    @unique @db.VarChar(18)
  status            TenantStatus @default(trial)

  // Database connection
  databaseHost      String    @db.VarChar(255)
  databasePort      Int       @default(5432)
  databaseName      String    @db.VarChar(100)
  databaseUser      String    @db.VarChar(100)
  databasePassword  String    @db.VarChar(255)  // Encrypted

  // URLs
  subdomain         String?   @unique @db.VarChar(50)
  customDomain      String?   @unique @db.VarChar(255)
  adminSubdomain    String?   @unique @db.VarChar(50)

  // Limits
  maxUsers          Int       @default(1000)
  maxAdmins         Int       @default(10)
  maxStorageGB      Int       @default(50)

  // Billing & Subscription
  subscriptionPlan     SubscriptionPlan   @default(BASIC) @map("subscription_plan")
  subscriptionStatus   SubscriptionStatus @default(TRIAL) @map("subscription_status")
  monthlyFee           Decimal            @default(0) @map("monthly_fee") @db.Decimal(10, 2)

  // Datas de cobrança
  trialEndsAt          DateTime?          @map("trial_ends_at") @db.Timestamptz(6)
  nextBillingDate      DateTime?          @map("next_billing_date") @db.Timestamptz(6)
  lastBillingDate      DateTime?          @map("last_billing_date") @db.Timestamptz(6)

  // Controle financeiro
  totalBilled          Decimal            @default(0) @map("total_billed") @db.Decimal(15, 2)
  outstandingBalance   Decimal            @default(0) @map("outstanding_balance") @db.Decimal(15, 2)

  // Deprecated (manter por compatibilidade)
  planType          PlanType  @default(trial)
  billingStatus     BillingStatus @default(trial)
  monthlyPrice      Decimal   @default(0) @db.Decimal(10, 2)
  subscriptionEndsAt DateTime?

  // Contact
  contactName       String    @db.VarChar(255)
  contactEmail      String    @db.VarChar(255)
  contactPhone      String    @db.VarChar(20)

  // Metadata
  createdAt         DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime  @updatedAt @db.Timestamptz(6)

  // Relations
  branding          TenantBranding?
  modules           TenantModule[]
  admins            TenantAdmin[]
  configs           TenantConfig[]
  apiKeys           TenantApiKey[]
  usageStats        TenantUsageStats[]
  stats             TenantStats?
  cashbackConfig    TenantCashbackConfig?
  withdrawalConfig  TenantWithdrawalConfig?

  @@index([slug])
  @@index([subdomain])
  @@index([status])
  @@map("tenants")
}

model TenantBranding {
  id                String   @id @default(uuid()) @db.Uuid
  tenantId          String   @unique @db.Uuid

  // Logos
  logoUrl           String?  @db.VarChar(500)
  logoSquareUrl     String?  @db.VarChar(500)
  iconUrl           String?  @db.VarChar(500)
  splashScreenUrl   String?  @db.VarChar(500)

  // Colors
  primaryColor      String   @default("#4F46E5") @db.VarChar(7)
  secondaryColor    String   @default("#06B6D4") @db.VarChar(7)
  accentColor       String   @default("#10B981") @db.VarChar(7)
  backgroundColor   String   @default("#FFFFFF") @db.VarChar(7)
  textColor         String   @default("#1F2937") @db.VarChar(7)

  // App Store
  appStoreName      String?  @db.VarChar(255)
  appStoreDescription String? @db.Text
  iosAppId          String?  @db.VarChar(100)
  androidPackage    String?  @db.VarChar(255)

  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime @updatedAt @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_brandings")
}

model TenantModule {
  id                String   @id @default(uuid()) @db.Uuid
  tenantId          String   @db.Uuid
  moduleKey         ModuleKey
  isEnabled         Boolean  @default(true)
  isEnabledByDefault Boolean @default(true) @map("is_enabled_by_default")

  // Config
  config            Json?    @default("{}")
  displayName       String   @db.VarChar(100)
  description       String?  @db.Text
  sortOrder         Int      @default(0)

  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime @updatedAt @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, moduleKey])
  @@index([tenantId])
  @@index([isEnabled])
  @@map("tenant_modules")
}

model TenantStats {
  id                    String    @id @default(uuid()) @db.Uuid
  tenantId              String    @unique @map("tenant_id") @db.Uuid

  // Usuários
  totalUsers            Int       @default(0) @map("total_users")
  totalConsumers        Int       @default(0) @map("total_consumers")
  totalMerchants        Int       @default(0) @map("total_merchants")
  activeUsers30d        Int       @default(0) @map("active_users_30d")

  // Transações
  totalPurchases        Int       @default(0) @map("total_purchases")
  totalRevenue          Decimal   @default(0) @map("total_revenue") @db.Decimal(15, 2)
  totalCashbackPaid     Decimal   @default(0) @map("total_cashback_paid") @db.Decimal(15, 2)
  totalPlatformFees     Decimal   @default(0) @map("total_platform_fees") @db.Decimal(15, 2)

  // Métricas de período (30 dias)
  revenue30d            Decimal   @default(0) @map("revenue_30d") @db.Decimal(15, 2)
  purchases30d          Int       @default(0) @map("purchases_30d")
  cashback30d           Decimal   @default(0) @map("cashback_30d") @db.Decimal(15, 2)

  // Produtos
  totalProducts         Int       @default(0) @map("total_products")
  activeProducts        Int       @default(0) @map("active_products")

  // Timestamps
  lastUpdatedAt         DateTime  @updatedAt @map("last_updated_at") @db.Timestamptz(6)

  tenant                Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("tenant_stats")
}

model GlobalStats {
  id                    String    @id @default(uuid()) @db.Uuid
  date                  DateTime  @unique @db.Date

  // Totais globais
  totalTenants          Int       @map("total_tenants")
  activeTenants         Int       @map("active_tenants")
  totalUsers            Int       @map("total_users")
  totalRevenue          Decimal   @map("total_revenue") @db.Decimal(15, 2)
  totalCashback         Decimal   @map("total_cashback") @db.Decimal(15, 2)
  totalPurchases        Int       @map("total_purchases")

  // Crescimento
  newTenants            Int       @default(0) @map("new_tenants")
  newUsers              Int       @default(0) @map("new_users")
  churnedTenants        Int       @default(0) @map("churned_tenants")

  createdAt             DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@index([date])
  @@map("global_stats")
}

model TenantCashbackConfig {
  id                        String   @id @default(uuid()) @db.Uuid
  tenantId                  String   @unique @map("tenant_id") @db.Uuid

  // Percentuais padrão (soma deve ser 100%)
  consumerPercent           Decimal  @default(50.0) @map("consumer_percent") @db.Decimal(5, 2)
  clubPercent               Decimal  @default(25.0) @map("club_percent") @db.Decimal(5, 2)
  consumerReferrerPercent   Decimal  @default(12.5) @map("consumer_referrer_percent") @db.Decimal(5, 2)
  merchantReferrerPercent   Decimal  @default(12.5) @map("merchant_referrer_percent") @db.Decimal(5, 2)

  createdAt                 DateTime @default(now()) @db.Timestamptz(6)
  updatedAt                 DateTime @updatedAt @db.Timestamptz(6)

  tenant                    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_cashback_configs")
}

model TenantWithdrawalConfig {
  id                   String   @id @default(uuid()) @db.Uuid
  tenantId             String   @unique @map("tenant_id") @db.Uuid

  // Taxa sobre saques
  withdrawalFeePercent Decimal  @default(2.5) @map("withdrawal_fee_percent") @db.Decimal(5, 2)
  withdrawalFeeFixed   Decimal  @default(0) @map("withdrawal_fee_fixed") @db.Decimal(10, 2)
  minWithdrawalAmount  Decimal  @default(50) @map("min_withdrawal_amount") @db.Decimal(10, 2)

  createdAt            DateTime @default(now()) @db.Timestamptz(6)
  updatedAt            DateTime @updatedAt @db.Timestamptz(6)

  tenant               Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_withdrawal_configs")
}

model TenantAdmin {
  id                String   @id @default(uuid()) @db.Uuid
  tenantId          String   @db.Uuid

  name              String   @db.VarChar(255)
  email             String   @db.VarChar(255)
  password          String   @db.VarChar(255)
  role              AdminRole @default(admin)

  isActive          Boolean  @default(true)
  lastLoginAt       DateTime? @db.Timestamptz(6)

  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime @updatedAt @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])
  @@index([tenantId])
  @@map("tenant_admins")
}

model SuperAdmin {
  id                String   @id @default(uuid()) @db.Uuid
  name              String   @db.VarChar(255)
  email             String   @unique @db.VarChar(255)
  password          String   @db.VarChar(255)

  permissions       Json     @default("[]")
  isActive          Boolean  @default(true)
  lastLoginAt       DateTime? @db.Timestamptz(6)

  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime @updatedAt @db.Timestamptz(6)

  @@map("super_admins")
}

model TenantConfig {
  id                String   @id @default(uuid()) @db.Uuid
  tenantId          String   @db.Uuid
  key               String   @db.VarChar(100)
  value             Json

  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime @updatedAt @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, key])
  @@map("tenant_configs")
}

model TenantApiKey {
  id                String   @id @default(uuid()) @db.Uuid
  tenantId          String   @db.Uuid

  name              String   @db.VarChar(100)
  key               String   @unique @db.VarChar(255)

  isActive          Boolean  @default(true)
  expiresAt         DateTime? @db.Timestamptz(6)

  createdAt         DateTime @default(now()) @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([key])
  @@map("tenant_api_keys")
}

model TenantUsageStats {
  id                String   @id @default(uuid()) @db.Uuid
  tenantId          String   @db.Uuid
  date              DateTime @db.Date

  totalUsers        Int      @default(0)
  activeUsers       Int      @default(0)
  totalTransactions Int      @default(0)
  totalVolume       Decimal  @default(0) @db.Decimal(15, 2)
  apiCalls          Int      @default(0)

  createdAt         DateTime @default(now()) @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, date])
  @@map("tenant_usage_stats")
}

// ENUMS

enum TenantStatus {
  trial
  active
  suspended
  cancelled
  pending_setup
}

enum PlanType {
  trial
  basic
  pro
  enterprise
  custom
}

enum BillingStatus {
  trial
  active
  past_due
  cancelled
  suspended
}

enum SubscriptionPlan {
  BASIC       // Até 1.000 usuários - R$ 500/mês
  PRO         // Até 10.000 usuários - R$ 2.000/mês
  ENTERPRISE  // Ilimitado - R$ 5.000/mês
}

enum SubscriptionStatus {
  TRIAL       // 30 dias grátis
  ACTIVE      // Pagando normalmente
  PAST_DUE    // Atraso no pagamento
  SUSPENDED   // Suspenso por falta de pagamento
  CANCELED    // Cancelado pelo tenant
}

enum ModuleKey {
  marketplace
  internet
  cinema
  telemedicine
  giftcards
  insurance
  streaming
  referrals
  cashback
  telecom
}

enum AdminRole {
  owner
  admin
  manager
  support
}
```

---

## 📊 Schema Tenant Database

```prisma
// prisma/schema-tenant.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../apps/api/src/generated/tenant-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String              @id @default(uuid()) @db.Uuid
  username            String              @unique @db.VarChar(50)
  email               String              @unique @db.VarChar(255)
  password            String              @db.VarChar(255)

  userType            UserType            @default(consumer)
  merchantStatus      MerchantStatus?

  firstName           String              @db.VarChar(100)
  lastName            String              @db.VarChar(100)
  document            String              @unique @db.VarChar(14)
  phone               String?             @db.VarChar(20)

  // Blockchain
  publicKey           String              @unique @db.VarChar(42)
  privateKey          String              @db.VarChar(255)

  // Referral
  referralId          String              @unique @db.VarChar(20)
  referredBy          String?             @db.VarChar(20)

  // Geolocation (para push por CEP)
  address             Json?

  isActive            Boolean             @default(true)
  accountStatus       AccountStatus       @default(active)

  createdAt           DateTime            @default(now()) @db.Timestamptz(6)
  updatedAt           DateTime            @updatedAt @db.Timestamptz(6)

  // Relations
  products            Product[]
  purchases           Purchase[]          @relation("ConsumerPurchases")
  sales               Purchase[]          @relation("MerchantSales")
  pushTokens          UserPushToken[]
  notifications       Notification[]
  userModules         UserModule[]
  cashbackConfig      UserCashbackConfig?

  @@index([email])
  @@index([username])
  @@map("users")
}

model UserModule {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @db.Uuid
  moduleKey           String   @db.VarChar(50)
  isEnabled           Boolean

  reason              String?  @db.Text
  enabledBy           String?  @db.Uuid
  disabledBy          String?  @db.Uuid

  createdAt           DateTime @default(now()) @db.Timestamptz(6)
  updatedAt           DateTime @updatedAt @db.Timestamptz(6)

  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, moduleKey])
  @@index([userId])
  @@index([moduleKey])
  @@map("user_modules")
}

model UserCashbackConfig {
  id                        String   @id @default(uuid()) @db.Uuid
  userId                    String   @unique @map("user_id") @db.Uuid

  // Percentuais customizados (soma deve ser 100%)
  consumerPercent           Decimal  @map("consumer_percent") @db.Decimal(5, 2)
  clubPercent               Decimal  @map("club_percent") @db.Decimal(5, 2)
  consumerReferrerPercent   Decimal  @map("consumer_referrer_percent") @db.Decimal(5, 2)
  merchantReferrerPercent   Decimal  @map("merchant_referrer_percent") @db.Decimal(5, 2)

  // Audit
  reason                    String?  @db.Text
  configuredBy              String?  @map("configured_by") @db.Uuid
  configuredAt              DateTime @default(now()) @map("configured_at") @db.Timestamptz(6)

  createdAt                 DateTime @default(now()) @db.Timestamptz(6)
  updatedAt                 DateTime @updatedAt @db.Timestamptz(6)

  user                      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_cashback_configs")
}

model UserPushToken {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @db.Uuid

  token               String   @unique @db.VarChar(255)
  platform            Platform

  isActive            Boolean  @default(true)
  lastUsedAt          DateTime? @db.Timestamptz(6)

  createdAt           DateTime @default(now()) @db.Timestamptz(6)

  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_push_tokens")
}

model Product {
  id                  String   @id @default(uuid()) @db.Uuid
  merchantId          String   @db.Uuid

  name                String   @db.VarChar(255)
  description         String?  @db.Text
  price               Decimal  @db.Decimal(10, 2)
  cashbackPercentage  Float

  category            String   @db.VarChar(100)
  moduleKey           String   @db.VarChar(50)

  images              Json     @default("[]")
  stock               Int      @default(0)
  isActive            Boolean  @default(true)

  createdAt           DateTime @default(now()) @db.Timestamptz(6)
  updatedAt           DateTime @updatedAt @db.Timestamptz(6)

  merchant            User     @relation(fields: [merchantId], references: [id])
  purchases           Purchase[]

  @@index([merchantId])
  @@index([moduleKey])
  @@map("products")
}

model Purchase {
  id                  String          @id @default(uuid()) @db.Uuid
  consumerId          String          @db.Uuid
  merchantId          String          @db.Uuid
  productId           String          @db.Uuid

  totalPrice          Decimal         @db.Decimal(10, 2)
  cashbackTotal       Decimal         @db.Decimal(10, 2)
  status              PurchaseStatus  @default(pending)
  txHash              String?         @db.VarChar(66)

  createdAt           DateTime        @default(now()) @db.Timestamptz(6)
  updatedAt           DateTime        @updatedAt @db.Timestamptz(6)

  consumer            User            @relation("ConsumerPurchases", fields: [consumerId], references: [id])
  merchant            User            @relation("MerchantSales", fields: [merchantId], references: [id])
  product             Product         @relation(fields: [productId], references: [id])

  @@index([consumerId])
  @@index([merchantId])
  @@map("purchases")
}

model Campaign {
  id                  String             @id @default(uuid()) @db.Uuid

  name                String             @db.VarChar(255)
  type                CampaignType
  title               String?            @db.VarChar(255)
  body                String             @db.Text
  imageUrl            String?            @db.VarChar(500)
  actionUrl           String?            @db.VarChar(500)

  // Targeting
  targetAll           Boolean            @default(false)
  targetUserIds       String[]           @default([]) @db.Uuid[]
  targetZipCodes      String[]           @default([])
  targetRadius        Int?

  // Scheduling
  scheduledFor        DateTime?          @db.Timestamptz(6)
  status              CampaignStatus     @default(draft)

  // Stats
  totalSent           Int                @default(0)
  totalDelivered      Int                @default(0)

  sentAt              DateTime?          @db.Timestamptz(6)
  createdAt           DateTime           @default(now()) @db.Timestamptz(6)

  @@index([status])
  @@map("campaigns")
}

model Notification {
  id                  String             @id @default(uuid()) @db.Uuid
  userId              String             @db.Uuid

  title               String             @db.VarChar(255)
  body                String             @db.Text
  type                NotificationType   @default(info)

  imageUrl            String?            @db.VarChar(500)
  actionUrl           String?            @db.VarChar(500)

  isRead              Boolean            @default(false)
  readAt              DateTime?          @db.Timestamptz(6)

  campaignId          String?            @db.Uuid

  createdAt           DateTime           @default(now()) @db.Timestamptz(6)

  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@map("notifications")
}

// ENUMS

enum UserType {
  consumer
  merchant
}

enum MerchantStatus {
  pending
  active
  suspended
}

enum AccountStatus {
  active
  inactive_user_request
  inactive_admin
}

enum Platform {
  ios
  android
  web
}

enum PurchaseStatus {
  pending
  paid
  completed
}

enum CampaignType {
  push
  sms
  whatsapp
}

enum CampaignStatus {
  draft
  scheduled
  sending
  sent
  cancelled
}

enum NotificationType {
  info
  promotion
  transaction
}
```

---

## 🔧 Backend - Tenant Resolution

```javascript
// apps/api/src/middleware/tenant.middleware.js

const { PrismaClient: MasterPrisma } = require('@prisma/master-client');
const { getTenantPrisma } = require('../utils/tenant-db');
const Redis = require('ioredis');

const masterPrisma = new MasterPrisma();
const redis = new Redis(process.env.REDIS_URL);

async function resolveTenant(req, res, next) {
  try {
    let tenant = null;
    let cacheKey = null;

    // 1. Por tenant ID (mobile)
    const tenantId = req.headers['x-tenant-id'];
    if (tenantId) {
      cacheKey = `tenant:id:${tenantId}`;
      tenant = await getCachedTenant(cacheKey);

      if (!tenant) {
        tenant = await masterPrisma.tenant.findUnique({
          where: { id: tenantId },
          include: {
            branding: true,
            modules: { where: { isEnabled: true } }
          }
        });
        if (tenant) await cacheTenant(cacheKey, tenant);
      }
    }

    // 2. Por subdomain (admin web)
    if (!tenant) {
      const host = req.headers.host;
      const subdomain = extractSubdomain(host);

      if (subdomain) {
        cacheKey = `tenant:subdomain:${subdomain}`;
        tenant = await getCachedTenant(cacheKey);

        if (!tenant) {
          tenant = await masterPrisma.tenant.findFirst({
            where: {
              OR: [{ subdomain }, { adminSubdomain: subdomain }]
            },
            include: {
              branding: true,
              modules: { where: { isEnabled: true } }
            }
          });
          if (tenant) await cacheTenant(cacheKey, tenant);
        }
      }
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return res.status(403).json({ error: 'Tenant not active' });
    }

    // Conectar ao banco do tenant
    req.tenant = tenant;
    req.tenantPrisma = getTenantPrisma(tenant);

    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    res.status(500).json({ error: 'Failed to resolve tenant' });
  }
}

function extractSubdomain(host) {
  if (host.includes('localhost')) return null;
  const parts = host.split('.');
  return parts.length >= 3 ? parts[0] : null;
}

async function getCachedTenant(key) {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
}

async function cacheTenant(key, tenant) {
  try {
    await redis.setex(key, 300, JSON.stringify(tenant));
  } catch (error) {
    // Silent fail
  }
}

module.exports = { resolveTenant, masterPrisma };
```

```javascript
// apps/api/src/utils/tenant-db.js

const { PrismaClient } = require('@prisma/tenant-client');
const crypto = require('crypto');

const tenantConnections = new Map();

function getTenantPrisma(tenant) {
  const cacheKey = tenant.id;

  if (tenantConnections.has(cacheKey)) {
    return tenantConnections.get(cacheKey);
  }

  const password = decryptPassword(tenant.databasePassword);
  const databaseUrl = `postgresql://${tenant.databaseUser}:${password}@${tenant.databaseHost}:${tenant.databasePort}/${tenant.databaseName}?schema=public`;

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } }
  });

  tenantConnections.set(cacheKey, prisma);
  return prisma;
}

function decryptPassword(encryptedPassword) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  const parts = encryptedPassword.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

function encryptPassword(password) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

module.exports = {
  getTenantPrisma,
  encryptPassword,
  decryptPassword
};
```

---

## 🧩 Sistema de Módulos

### Validação em 2 Níveis

**Nível 1**: Módulo habilitado no tenant (Master DB)
**Nível 2**: Módulo habilitado para o usuário individual (Tenant DB)

```javascript
// apps/api/src/middleware/module.middleware.js

function requireModule(moduleKey) {
  return async (req, res, next) => {
    const tenant = req.tenant;

    // Nível 1: Validar se módulo está habilitado no TENANT
    if (!tenant || !tenant.modules) {
      return res.status(500).json({ error: 'Tenant modules not loaded' });
    }

    const tenantModule = tenant.modules.find(m => m.moduleKey === moduleKey);

    if (!tenantModule || !tenantModule.isEnabled) {
      return res.status(403).json({
        error: 'Module not enabled for this tenant',
        module: moduleKey
      });
    }

    // Nível 2: Validar se módulo está habilitado para o USUÁRIO
    const userModule = await req.tenantPrisma.userModule.findFirst({
      where: {
        userId: req.user.id,
        moduleKey: moduleKey
      }
    });

    // Se existe registro, usar a configuração específica do usuário
    // Se não existe, usar o padrão do tenant
    const isEnabledForUser = userModule
      ? userModule.isEnabled
      : tenantModule.isEnabledByDefault;

    if (!isEnabledForUser) {
      return res.status(403).json({
        error: 'Module not enabled for this user',
        module: moduleKey,
        reason: userModule?.reason || 'Default tenant configuration'
      });
    }

    req.module = tenantModule;
    next();
  };
}

module.exports = { requireModule };
```

### API para Gestão de Módulos por Usuário

```javascript
// apps/api/src/routes/admin.routes.js

// Listar módulos de um usuário
router.get('/users/:userId/modules',
  resolveTenant,
  authenticateAdmin,
  async (req, res) => {
    const { userId } = req.params;

    const user = await req.tenantPrisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true }
    });

    const userModules = await req.tenantPrisma.userModule.findMany({
      where: { userId }
    });

    const modules = req.tenant.modules.map(tm => {
      const userModule = userModules.find(um => um.moduleKey === tm.moduleKey);

      return {
        moduleKey: tm.moduleKey,
        displayName: tm.displayName,
        isEnabledForTenant: tm.isEnabled,
        isEnabledByDefault: tm.isEnabledByDefault,
        isEnabledForUser: userModule ? userModule.isEnabled : tm.isEnabledByDefault,
        source: !userModule ? 'default' : 'custom',
        reason: userModule?.reason,
        updatedAt: userModule?.updatedAt
      };
    });

    res.json({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      modules
    });
  }
);

// Habilitar/desabilitar módulo para usuário
router.put('/users/:userId/modules/:moduleKey',
  resolveTenant,
  authenticateAdmin,
  async (req, res) => {
    const { userId, moduleKey } = req.params;
    const { isEnabled, reason } = req.body;

    const userModule = await req.tenantPrisma.userModule.upsert({
      where: {
        userId_moduleKey: { userId, moduleKey }
      },
      update: {
        isEnabled,
        reason,
        [isEnabled ? 'enabledBy' : 'disabledBy']: req.admin.id
      },
      create: {
        userId,
        moduleKey,
        isEnabled,
        reason,
        [isEnabled ? 'enabledBy' : 'disabledBy']: req.admin.id
      }
    });

    res.json(userModule);
  }
);

// Configurar padrão para novos usuários
router.put('/modules/defaults',
  resolveTenant,
  authenticateAdmin,
  async (req, res) => {
    const { modules } = req.body;

    for (const mod of modules) {
      await masterPrisma.tenantModule.update({
        where: {
          tenantId_moduleKey: {
            tenantId: req.tenant.id,
            moduleKey: mod.moduleKey
          }
        },
        data: {
          isEnabledByDefault: mod.isEnabledByDefault
        }
      });
    }

    res.json({ success: true });
  }
);
```

**Uso:**

```javascript
// apps/api/src/routes/products.routes.js

router.get('/list',
  resolveTenant,
  authenticate,
  requireModule('marketplace'),  // ← Valida 2 níveis
  async (req, res) => {
    const products = await req.tenantPrisma.product.findMany();
    res.json(products);
  }
);
```

---

## 📲 Sistema de Comunicação

```javascript
// apps/api/src/services/push.service.js

const { Expo } = require('expo-server-sdk');
const expo = new Expo();

class PushService {
  async sendCampaign(tenantPrisma, campaignId) {
    const campaign = await tenantPrisma.campaign.findUnique({
      where: { id: campaignId }
    });

    // Buscar usuários alvo
    let userIds = campaign.targetAll
      ? await this.getAllActiveUsers(tenantPrisma)
      : campaign.targetUserIds;

    // Buscar tokens
    const tokens = await tenantPrisma.userPushToken.findMany({
      where: {
        userId: { in: userIds },
        isActive: true
      }
    });

    // Enviar
    const messages = tokens.map(t => ({
      to: t.token,
      title: campaign.title,
      body: campaign.body,
      data: {
        campaignId: campaign.id,
        actionUrl: campaign.actionUrl
      }
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    // Atualizar campanha
    await tenantPrisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'sent',
        totalSent: tokens.length,
        sentAt: new Date()
      }
    });

    return { sent: tokens.length };
  }

  async getAllActiveUsers(tenantPrisma) {
    const users = await tenantPrisma.user.findMany({
      where: { isActive: true },
      select: { id: true }
    });
    return users.map(u => u.id);
  }
}

module.exports = new PushService();
```

---

## 📊 Analytics Agregado e Dashboard Master

### Visão Geral

O sistema de analytics permite que o Super-Admin visualize métricas agregadas de **todos os tenants** em um único dashboard, incluindo:
- Total de usuários (consumers + merchants) de todos os tenants
- Total de vendas e revenue do SaaS inteiro
- Total de cashback pago pela plataforma
- Crescimento e churn de tenants
- Métricas de 30 dias para análise de tendências

**Arquitetura:**
- **TenantStats**: Métricas agregadas de cada tenant individualmente (Master DB)
- **GlobalStats**: Snapshot diário com soma de todos os tenants (Master DB)
- **Event-Driven**: Eventos em tempo real atualizam TenantStats
- **Scheduled Jobs**: Jobs diários fazem reconciliação e calculam métricas de 30 dias
- **LGPD Compliant**: Apenas dados agregados, sem PII (Personally Identifiable Information)

### AnalyticsService - Atualizações em Tempo Real

```javascript
// apps/api/src/services/analytics.service.js

const { PrismaClient: MasterPrisma } = require('@prisma/client');
const masterPrisma = new MasterPrisma();

class AnalyticsService {
  /**
   * Chamado quando um novo usuário é criado no tenant
   * @param {string} tenantId - ID do tenant
   * @param {string} userType - 'consumer' ou 'merchant'
   */
  async onUserCreated(tenantId, userType) {
    await masterPrisma.tenantStats.upsert({
      where: { tenantId },
      update: {
        totalUsers: { increment: 1 },
        totalConsumers: userType === 'consumer' ? { increment: 1 } : undefined,
        totalMerchants: userType === 'merchant' ? { increment: 1 } : undefined,
        updatedAt: new Date()
      },
      create: {
        tenantId,
        totalUsers: 1,
        totalConsumers: userType === 'consumer' ? 1 : 0,
        totalMerchants: userType === 'merchant' ? 1 : 0
      }
    });
  }

  /**
   * Chamado quando uma compra é concluída
   * @param {string} tenantId - ID do tenant
   * @param {object} purchaseData - Dados da compra
   */
  async onPurchaseCompleted(tenantId, purchaseData) {
    const { totalAmount, cashbackTotal, platformFee } = purchaseData;

    await masterPrisma.tenantStats.upsert({
      where: { tenantId },
      update: {
        totalPurchases: { increment: 1 },
        totalRevenue: { increment: totalAmount },
        totalCashbackPaid: { increment: cashbackTotal },
        totalPlatformFees: { increment: platformFee },
        updatedAt: new Date()
      },
      create: {
        tenantId,
        totalPurchases: 1,
        totalRevenue: totalAmount,
        totalCashbackPaid: cashbackTotal,
        totalPlatformFees: platformFee
      }
    });
  }

  /**
   * Chamado quando um produto é criado
   * @param {string} tenantId - ID do tenant
   */
  async onProductCreated(tenantId) {
    await masterPrisma.tenantStats.upsert({
      where: { tenantId },
      update: {
        totalProducts: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        tenantId,
        totalProducts: 1
      }
    });
  }

  /**
   * Chamado quando um produto é deletado
   * @param {string} tenantId - ID do tenant
   */
  async onProductDeleted(tenantId) {
    await masterPrisma.tenantStats.update({
      where: { tenantId },
      data: {
        totalProducts: { decrement: 1 },
        updatedAt: new Date()
      }
    });
  }
}

module.exports = new AnalyticsService();
```

### Integração nos Endpoints

```javascript
// apps/api/src/routes/users.routes.js
const analyticsService = require('../services/analytics.service');

router.post('/register',
  resolveTenant,
  async (req, res) => {
    const { email, password, firstName, lastName, userType } = req.body;

    const user = await req.tenantPrisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        userType
      }
    });

    // ✅ Atualizar analytics em tempo real
    await analyticsService.onUserCreated(req.tenant.id, userType);

    res.json({ userId: user.id });
  }
);
```

```javascript
// apps/api/src/routes/purchases.routes.js
const analyticsService = require('../services/analytics.service');

router.post('/',
  resolveTenant,
  authenticate,
  async (req, res) => {
    const { productId, consumerId } = req.body;

    // Criar purchase
    const purchase = await req.tenantPrisma.purchase.create({
      data: { productId, consumerId, status: 'pending' }
    });

    // ... processar pagamento via Relayer ...

    // Marcar como completed
    await req.tenantPrisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'completed', completedAt: new Date() }
    });

    // ✅ Atualizar analytics em tempo real
    await analyticsService.onPurchaseCompleted(req.tenant.id, {
      totalAmount: purchase.totalAmount,
      cashbackTotal: purchase.consumerCashback,
      platformFee: purchase.platformFee
    });

    res.json(purchase);
  }
);
```

### Jobs Agendados - Reconciliação e Métricas de 30 dias

```javascript
// apps/api/src/jobs/analytics.jobs.js

const { PrismaClient: MasterPrisma } = require('@prisma/client');
const { getTenantPrisma } = require('../utils/tenant.util');
const cron = require('node-cron');

const masterPrisma = new MasterPrisma();

/**
 * Job 1: Reconciliação diária (3h da manhã)
 * Garante que os números no Master DB estejam corretos
 */
cron.schedule('0 3 * * *', async () => {
  console.log('[Analytics Job] Starting daily reconciliation...');

  const tenants = await masterPrisma.tenant.findMany({
    where: { isActive: true }
  });

  for (const tenant of tenants) {
    try {
      const tenantPrisma = getTenantPrisma(tenant.dbName);

      // Contar usuários reais
      const totalUsers = await tenantPrisma.user.count();
      const totalConsumers = await tenantPrisma.user.count({
        where: { userType: 'consumer' }
      });
      const totalMerchants = await tenantPrisma.user.count({
        where: { userType: 'merchant' }
      });

      // Contar compras e somar valores
      const purchases = await tenantPrisma.purchase.aggregate({
        where: { status: 'completed' },
        _count: true,
        _sum: {
          totalAmount: true,
          consumerCashback: true,
          platformFee: true
        }
      });

      const totalProducts = await tenantPrisma.product.count();

      // Atualizar Master DB com valores reais
      await masterPrisma.tenantStats.upsert({
        where: { tenantId: tenant.id },
        update: {
          totalUsers,
          totalConsumers,
          totalMerchants,
          totalPurchases: purchases._count || 0,
          totalRevenue: purchases._sum.totalAmount || 0,
          totalCashbackPaid: purchases._sum.consumerCashback || 0,
          totalPlatformFees: purchases._sum.platformFee || 0,
          totalProducts,
          updatedAt: new Date()
        },
        create: {
          tenantId: tenant.id,
          totalUsers,
          totalConsumers,
          totalMerchants,
          totalPurchases: purchases._count || 0,
          totalRevenue: purchases._sum.totalAmount || 0,
          totalCashbackPaid: purchases._sum.consumerCashback || 0,
          totalPlatformFees: purchases._sum.platformFee || 0,
          totalProducts
        }
      });

      console.log(`[Analytics Job] ✓ Reconciled tenant ${tenant.slug}`);
    } catch (error) {
      console.error(`[Analytics Job] ✗ Failed for tenant ${tenant.slug}:`, error);
    }
  }

  console.log('[Analytics Job] Daily reconciliation completed');
});

/**
 * Job 2: Calcular métricas de 30 dias (4h da manhã)
 */
cron.schedule('0 4 * * *', async () => {
  console.log('[Analytics Job] Calculating 30-day metrics...');

  const tenants = await masterPrisma.tenant.findMany({
    where: { isActive: true }
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const tenant of tenants) {
    try {
      const tenantPrisma = getTenantPrisma(tenant.dbName);

      // Usuários ativos nos últimos 30 dias
      const activeUsers30d = await tenantPrisma.user.count({
        where: {
          lastLoginAt: { gte: thirtyDaysAgo }
        }
      });

      // Compras dos últimos 30 dias
      const purchases30d = await tenantPrisma.purchase.aggregate({
        where: {
          status: 'completed',
          completedAt: { gte: thirtyDaysAgo }
        },
        _count: true,
        _sum: {
          totalAmount: true,
          consumerCashback: true
        }
      });

      // Atualizar métricas de 30 dias
      await masterPrisma.tenantStats.update({
        where: { tenantId: tenant.id },
        data: {
          activeUsers30d,
          purchases30d: purchases30d._count || 0,
          revenue30d: purchases30d._sum.totalAmount || 0,
          cashback30d: purchases30d._sum.consumerCashback || 0,
          updatedAt: new Date()
        }
      });

      console.log(`[Analytics Job] ✓ Calculated 30d metrics for ${tenant.slug}`);
    } catch (error) {
      console.error(`[Analytics Job] ✗ Failed 30d metrics for ${tenant.slug}:`, error);
    }
  }

  console.log('[Analytics Job] 30-day metrics calculation completed');
});

/**
 * Job 3: Criar snapshot global diário (5h da manhã)
 */
cron.schedule('0 5 * * *', async () => {
  console.log('[Analytics Job] Creating daily global snapshot...');

  try {
    // Contar tenants ativos
    const totalTenants = await masterPrisma.tenant.count({
      where: { isActive: true }
    });

    // Somar todas as métricas
    const aggregated = await masterPrisma.tenantStats.aggregate({
      _sum: {
        totalUsers: true,
        totalConsumers: true,
        totalMerchants: true,
        totalPurchases: true,
        totalRevenue: true,
        totalCashbackPaid: true,
        totalPlatformFees: true,
        totalProducts: true,
        activeUsers30d: true,
        purchases30d: true,
        revenue30d: true,
        cashback30d: true
      }
    });

    // Calcular novos tenants e churn (comparar com snapshot de ontem)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastSnapshot = await masterPrisma.globalStats.findFirst({
      where: {
        date: {
          gte: yesterday
        }
      },
      orderBy: { date: 'desc' }
    });

    const newTenants = lastSnapshot
      ? totalTenants - lastSnapshot.totalTenants
      : 0;

    const newUsers = lastSnapshot
      ? (aggregated._sum.totalUsers || 0) - lastSnapshot.totalUsers
      : 0;

    // Criar snapshot diário
    await masterPrisma.globalStats.create({
      data: {
        date: new Date(),
        totalTenants,
        totalUsers: aggregated._sum.totalUsers || 0,
        totalConsumers: aggregated._sum.totalConsumers || 0,
        totalMerchants: aggregated._sum.totalMerchants || 0,
        totalPurchases: aggregated._sum.totalPurchases || 0,
        totalRevenue: aggregated._sum.totalRevenue || 0,
        totalCashbackPaid: aggregated._sum.totalCashbackPaid || 0,
        totalPlatformFees: aggregated._sum.totalPlatformFees || 0,
        totalProducts: aggregated._sum.totalProducts || 0,
        activeUsers30d: aggregated._sum.activeUsers30d || 0,
        revenue30d: aggregated._sum.revenue30d || 0,
        purchases30d: aggregated._sum.purchases30d || 0,
        cashback30d: aggregated._sum.cashback30d || 0,
        newTenants: Math.max(0, newTenants),
        newUsers: Math.max(0, newUsers),
        churnedTenants: 0 // Implementar lógica de churn se necessário
      }
    });

    console.log('[Analytics Job] ✓ Global snapshot created');
  } catch (error) {
    console.error('[Analytics Job] ✗ Failed to create global snapshot:', error);
  }
});

module.exports = { startAnalyticsJobs: () => console.log('Analytics jobs started') };
```

### Super-Admin Dashboard - API Endpoints

```javascript
// apps/api/src/routes/super-admin.routes.js

const express = require('express');
const { PrismaClient: MasterPrisma } = require('@prisma/client');
const router = express.Router();
const masterPrisma = new MasterPrisma();

/**
 * GET /super-admin/dashboard
 * Dashboard principal com métricas agregadas de todos os tenants
 */
router.get('/dashboard',
  authenticateSuperAdmin,
  async (req, res) => {
    // Buscar snapshot mais recente
    const latestSnapshot = await masterPrisma.globalStats.findFirst({
      orderBy: { date: 'desc' }
    });

    if (!latestSnapshot) {
      return res.status(404).json({ error: 'No data available' });
    }

    // Buscar snapshot de 30 dias atrás para calcular crescimento
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldSnapshot = await masterPrisma.globalStats.findFirst({
      where: {
        date: { lte: thirtyDaysAgo }
      },
      orderBy: { date: 'desc' }
    });

    // Calcular crescimento percentual
    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    res.json({
      overview: {
        totalTenants: latestSnapshot.totalTenants,
        totalUsers: latestSnapshot.totalUsers,
        totalConsumers: latestSnapshot.totalConsumers,
        totalMerchants: latestSnapshot.totalMerchants,
        totalProducts: latestSnapshot.totalProducts
      },
      revenue: {
        totalRevenue: latestSnapshot.totalRevenue,
        totalCashbackPaid: latestSnapshot.totalCashbackPaid,
        totalPlatformFees: latestSnapshot.totalPlatformFees,
        totalPurchases: latestSnapshot.totalPurchases
      },
      period30d: {
        activeUsers: latestSnapshot.activeUsers30d,
        revenue: latestSnapshot.revenue30d,
        purchases: latestSnapshot.purchases30d,
        cashback: latestSnapshot.cashback30d
      },
      growth: oldSnapshot ? {
        users: calculateGrowth(latestSnapshot.totalUsers, oldSnapshot.totalUsers),
        revenue: calculateGrowth(
          parseFloat(latestSnapshot.totalRevenue),
          parseFloat(oldSnapshot.totalRevenue)
        ),
        tenants: calculateGrowth(latestSnapshot.totalTenants, oldSnapshot.totalTenants)
      } : null,
      lastUpdate: latestSnapshot.date
    });
  }
);

/**
 * GET /super-admin/tenants-ranking
 * Ranking de tenants por revenue
 */
router.get('/tenants-ranking',
  authenticateSuperAdmin,
  async (req, res) => {
    const { sortBy = 'revenue', limit = 10 } = req.query;

    const tenants = await masterPrisma.tenant.findMany({
      where: { isActive: true },
      include: {
        stats: true
      }
    });

    // Ordenar
    const sortField = {
      revenue: 'totalRevenue',
      users: 'totalUsers',
      purchases: 'totalPurchases',
      cashback: 'totalCashbackPaid'
    }[sortBy] || 'totalRevenue';

    const sorted = tenants
      .filter(t => t.stats)
      .sort((a, b) => {
        const aValue = parseFloat(a.stats[sortField]) || 0;
        const bValue = parseFloat(b.stats[sortField]) || 0;
        return bValue - aValue;
      })
      .slice(0, parseInt(limit));

    res.json(
      sorted.map(t => ({
        tenantId: t.id,
        slug: t.slug,
        name: t.name,
        totalUsers: t.stats.totalUsers,
        totalRevenue: t.stats.totalRevenue,
        totalPurchases: t.stats.totalPurchases,
        totalCashback: t.stats.totalCashbackPaid,
        revenue30d: t.stats.revenue30d,
        activeUsers30d: t.stats.activeUsers30d
      }))
    );
  }
);

/**
 * GET /super-admin/historical-data
 * Dados históricos para gráficos de crescimento
 */
router.get('/historical-data',
  authenticateSuperAdmin,
  async (req, res) => {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const snapshots = await masterPrisma.globalStats.findMany({
      where: {
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    res.json(
      snapshots.map(s => ({
        date: s.date,
        totalUsers: s.totalUsers,
        totalRevenue: s.totalRevenue,
        totalTenants: s.totalTenants,
        newUsers: s.newUsers,
        newTenants: s.newTenants
      }))
    );
  }
);

module.exports = router;
```

### Super-Admin Interface (Mock)

```jsx
// apps/admin/src/pages/SuperAdminDashboard.jsx

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [historical, setHistorical] = useState([]);

  useEffect(() => {
    // Carregar dados
    fetch('/api/super-admin/dashboard')
      .then(res => res.json())
      .then(setDashboard);

    fetch('/api/super-admin/tenants-ranking?limit=10&sortBy=revenue')
      .then(res => res.json())
      .then(setRanking);

    fetch('/api/super-admin/historical-data?days=30')
      .then(res => res.json())
      .then(setHistorical);
  }, []);

  if (!dashboard) return <div>Carregando...</div>;

  return (
    <div className="super-admin-dashboard">
      <h1>Dashboard Master - Clube Digital SaaS</h1>

      {/* Cards de Overview */}
      <div className="overview-cards">
        <div className="card">
          <h3>Total de Tenants</h3>
          <p className="big-number">{dashboard.overview.totalTenants}</p>
          {dashboard.growth && (
            <span className="growth">+{dashboard.growth.tenants.toFixed(1)}% (30d)</span>
          )}
        </div>

        <div className="card">
          <h3>Total de Usuários</h3>
          <p className="big-number">{dashboard.overview.totalUsers.toLocaleString()}</p>
          {dashboard.growth && (
            <span className="growth">+{dashboard.growth.users.toFixed(1)}% (30d)</span>
          )}
        </div>

        <div className="card">
          <h3>Revenue Total</h3>
          <p className="big-number">
            R$ {parseFloat(dashboard.revenue.totalRevenue).toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}
          </p>
          {dashboard.growth && (
            <span className="growth">+{dashboard.growth.revenue.toFixed(1)}% (30d)</span>
          )}
        </div>

        <div className="card">
          <h3>Cashback Pago</h3>
          <p className="big-number">
            R$ {parseFloat(dashboard.revenue.totalCashbackPaid).toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}
          </p>
        </div>
      </div>

      {/* Gráfico de Crescimento */}
      <div className="chart-section">
        <h2>Crescimento nos últimos 30 dias</h2>
        <LineChart width={800} height={300} data={historical}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalUsers" stroke="#8884d8" name="Usuários" />
          <Line type="monotone" dataKey="totalTenants" stroke="#82ca9d" name="Tenants" />
        </LineChart>
      </div>

      {/* Ranking de Tenants */}
      <div className="ranking-section">
        <h2>Top 10 Tenants por Revenue</h2>
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Usuários</th>
              <th>Revenue Total</th>
              <th>Revenue 30d</th>
              <th>Cashback Pago</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map(t => (
              <tr key={t.tenantId}>
                <td><strong>{t.name}</strong> ({t.slug})</td>
                <td>{t.totalUsers}</td>
                <td>R$ {parseFloat(t.totalRevenue).toLocaleString('pt-BR')}</td>
                <td>R$ {parseFloat(t.revenue30d).toLocaleString('pt-BR')}</td>
                <td>R$ {parseFloat(t.totalCashback).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Métricas de 30 dias */}
      <div className="period-metrics">
        <h2>Métricas dos últimos 30 dias</h2>
        <div className="metrics-grid">
          <div className="metric">
            <span>Usuários Ativos</span>
            <strong>{dashboard.period30d.activeUsers.toLocaleString()}</strong>
          </div>
          <div className="metric">
            <span>Compras</span>
            <strong>{dashboard.period30d.purchases.toLocaleString()}</strong>
          </div>
          <div className="metric">
            <span>Revenue</span>
            <strong>R$ {parseFloat(dashboard.period30d.revenue).toLocaleString('pt-BR')}</strong>
          </div>
          <div className="metric">
            <span>Cashback</span>
            <strong>R$ {parseFloat(dashboard.period30d.cashback).toLocaleString('pt-BR')}</strong>
          </div>
        </div>
      </div>

      <p className="last-update">
        Última atualização: {new Date(dashboard.lastUpdate).toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
```

### Benefícios do Sistema de Analytics

1. **Performance**: Dashboard carrega instantaneamente (lê apenas Master DB)
2. **Escalabilidade**: Não importa se há 10 ou 1000 tenants, queries são sempre rápidas
3. **Precisão**: Reconciliação diária garante dados corretos
4. **Histórico**: GlobalStats permite análise de crescimento ao longo do tempo
5. **LGPD**: Apenas dados agregados, sem acesso a dados pessoais
6. **Sales Arguments**: Dados reais para apresentar crescimento do SaaS

---

## 📱 Mobile - Apps Separados + Deploy Único

### Estrutura de Configuração

```javascript
// apps/mobile/app.config.js

const getTenantConfig = () => {
  const tenantSlug = process.env.TENANT_SLUG;

  if (!tenantSlug) {
    throw new Error('TENANT_SLUG not defined');
  }

  const tenantConfig = require(`./tenants/${tenantSlug}/config.json`);

  return {
    name: tenantConfig.appName,
    slug: `${tenantSlug}-app`,
    owner: "clube-digital",

    // IMPORTANTE: Todos apontam para mesmo update channel
    updates: {
      url: "https://u.expo.dev/your-project-id",
      enabled: true,
      checkAutomatically: "ON_LOAD"
    },

    icon: `./tenants/${tenantSlug}/icon.png`,
    splash: {
      image: `./tenants/${tenantSlug}/splash.png`,
      backgroundColor: tenantConfig.primaryColor
    },

    ios: {
      bundleIdentifier: `com.clubedigital.${tenantSlug}`
    },
    android: {
      package: `com.clubedigital.${tenantSlug}`
    },

    extra: {
      tenantId: tenantConfig.tenantId,
      tenantSlug: tenantSlug,
      eas: {
        projectId: "your-project-id"
      }
    }
  };
};

module.exports = getTenantConfig();
```

### Config por Tenant

```json
// apps/mobile/tenants/empresa-a/config.json
{
  "tenantId": "uuid-empresa-a",
  "appName": "Empresa A",
  "primaryColor": "#FF0000"
}
```

### EAS Config

```json
// apps/mobile/eas.json
{
  "build": {
    "production": {
      "releaseChannel": "production",
      "distribution": "store",
      "env": {
        "TENANT_SLUG": "$TENANT_SLUG"
      }
    }
  }
}
```

---

## 🖥️ Admin Web - Single Deploy

```typescript
// apps/admin/frontend/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', subdomain);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}
```

---

## 🤖 Scripts de Automação

### Build Tenant App

```bash
#!/bin/bash
# scripts/build-tenant-app.sh

TENANT_SLUG=$1
PLATFORM=$2

export TENANT_SLUG=$TENANT_SLUG

cd apps/mobile

if [ "$PLATFORM" = "all" ]; then
  eas build --platform all --profile production
elif [ "$PLATFORM" = "ios" ]; then
  eas build --platform ios --profile production
else
  eas build --platform android --profile production
fi
```

### Update All Apps (OTA)

```bash
#!/bin/bash
# scripts/update-all-apps.sh

cd apps/mobile
eas update --branch production --message "$1"
```

### Migrate All Tenants

```javascript
// scripts/migrate-all-tenants.js

const { PrismaClient: MasterPrisma } = require('@prisma/master-client');
const { execSync } = require('child_process');
const { decryptPassword } = require('../apps/api/src/utils/tenant-db');

const masterPrisma = new MasterPrisma();

async function migrateAllTenants() {
  console.log('🔄 Starting migrations...\n');

  const tenants = await masterPrisma.tenant.findMany({
    where: { status: { in: ['active', 'trial'] } }
  });

  console.log(`📊 Found ${tenants.length} tenants\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const tenant of tenants) {
    try {
      console.log(`🔧 Migrating: ${tenant.companyName}...`);

      const password = decryptPassword(tenant.databasePassword);
      const databaseUrl = `postgresql://${tenant.databaseUser}:${password}@${tenant.databaseHost}:${tenant.databasePort}/${tenant.databaseName}`;

      execSync(
        `DATABASE_URL="${databaseUrl}" npx prisma migrate deploy`,
        { cwd: './apps/api', stdio: 'pipe' }
      );

      console.log(`  ✅ Success\n`);
      successCount++;

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log(`\n✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);

  if (errorCount > 0) {
    process.exit(1);
  }

  console.log('\n🎉 All migrations completed!');
}

migrateAllTenants()
  .catch(console.error)
  .finally(() => masterPrisma.$disconnect());
```

---

## 🗺️ Roadmap de Implementação

### **Fase 1: Fundação Multi-Tenant** (3 semanas)

#### Sprint 1.1 - Master Database (1 semana)
- [ ] Criar schema master database
- [ ] Setup Prisma master client
- [ ] Migrations master
- [ ] Seeds de teste (3 tenants fictícios)
- [ ] Scripts de criação de tenant
- [ ] Testes de conexão

#### Sprint 1.2 - Tenant Resolution (1 semana)
- [ ] Middleware de tenant resolution
- [ ] Utility de conexão dinâmica
- [ ] Encryption de passwords
- [ ] Cache de tenants (Redis)
- [ ] Testes de carga (100 req/s)
- [ ] Documentação de uso

#### Sprint 1.3 - Scripts de Automação (1 semana)
- [ ] Script: migrate-all-tenants.js
- [ ] Script: rollback-all-tenants.js
- [ ] Script: seed-all-tenants.js
- [ ] Script: check-tenant-status.js
- [ ] Testes com 10 tenants
- [ ] CI/CD integration

### **Fase 2: Mobile - Apps Separados + OTA** (2 semanas)

#### Sprint 2.1 - EAS Setup (1 semana)
- [ ] Conta Expo/EAS configurada
- [ ] app.config.js dinâmico
- [ ] Estrutura tenants/ criada
- [ ] Config de 2-3 tenants de teste
- [ ] Build de 1 tenant funcionando
- [ ] TestFlight/Internal Testing

#### Sprint 2.2 - OTA Updates (1 semana)
- [ ] Script: build-tenant-app.sh
- [ ] Script: update-all-apps.sh
- [ ] Teste de OTA em 2 apps
- [ ] Verificação de branding dinâmico
- [ ] Documentação de deploy
- [ ] GitHub Actions workflow

### **Fase 3: Sistema de Módulos** (1 semana)

#### Sprint 3.1 - Backend Modules
- [ ] Middleware de verificação de módulo
- [ ] API: GET /api/tenant/modules
- [ ] API: POST /api/admin/modules/:id/toggle
- [ ] Associar produtos com módulos
- [ ] Testes de permissão

#### Sprint 3.2 - Frontend Modules
- [ ] Hook: useModules (mobile)
- [ ] Renderização condicional por módulo
- [ ] Admin: Interface de gestão de módulos
- [ ] Admin: Preview de módulos ativos
- [ ] Testes E2E

### **Fase 4: Comunicação em Massa** (2 semanas)

#### Sprint 4.1 - Push Notifications (1 semana)
- [ ] Service de push (Expo)
- [ ] Registro de push tokens
- [ ] API: Campanhas CRUD
- [ ] Admin: Interface de criação
- [ ] Admin: Preview de notificação
- [ ] Targeting por CEP/raio
- [ ] Testes de envio

#### Sprint 4.2 - SMS e WhatsApp (1 semana)
- [ ] Service de SMS (Twilio)
- [ ] Service de WhatsApp
- [ ] Integração com campanhas
- [ ] Admin: Seleção de canal
- [ ] Analytics de campanha
- [ ] Testes de envio

### **Fase 5: Admin Web Multi-Tenant** (1 semana)

#### Sprint 5.1 - Admin Setup
- [ ] Middleware de subdomain
- [ ] Autenticação de TenantAdmin
- [ ] Dashboard por tenant
- [ ] Gestão de módulos
- [ ] Gestão de campanhas
- [ ] Relatórios básicos

### **Fase 6: Super Admin Dashboard** (1 semana)

#### Sprint 6.1 - Super Admin
- [ ] Autenticação de SuperAdmin
- [ ] Dashboard global
- [ ] Criação de novos tenants
- [ ] Gestão de billing
- [ ] Monitoramento de uso
- [ ] Analytics consolidado

### **Fase 7: Migração e Testes** (2 semanas)

#### Sprint 7.1 - Migração de Dados (1 semana)
- [ ] Script de migração do DB atual
- [ ] Validação de integridade
- [ ] Rollback strategy
- [ ] Testes em staging
- [ ] Backup completo

#### Sprint 7.2 - Testes Finais (1 semana)
- [ ] Testes E2E multi-tenant
- [ ] Load testing (1000 req/s)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deploy em produção

---

## ✅ Checklists Detalhadas

### Checklist: Setup Inicial

```bash
# 1. Master Database
[ ] PostgreSQL instalado e rodando
[ ] Criar banco: createdb clube_digital_master
[ ] Configurar MASTER_DATABASE_URL no .env
[ ] Rodar: cd prisma-master && npx prisma migrate dev
[ ] Verificar: psql clube_digital_master -c "\dt"
[ ] Seed: node prisma-master/seed.js

# 2. Encryption Key
[ ] Gerar: openssl rand -hex 32
[ ] Adicionar ENCRYPTION_KEY no .env
[ ] Testar: node -e "console.log(process.env.ENCRYPTION_KEY.length === 64)"

# 3. Redis
[ ] Redis instalado: redis-cli ping
[ ] Configurar REDIS_URL no .env
[ ] Testar conexão

# 4. Expo/EAS
[ ] Conta Expo criada
[ ] EAS CLI instalado: npm install -g eas-cli
[ ] Login: eas login
[ ] Configurar projeto: eas init
[ ] Gerar EXPO_TOKEN para CI: eas whoami
```

### Checklist: Criar Novo Tenant

```bash
# 1. Via Admin Interface
[ ] Acessar: https://admin.clubedigital.com.br/super/tenants/new
[ ] Preencher dados da empresa
[ ] Upload de logos (logo, icon, splash)
[ ] Escolher cores (primary, secondary)
[ ] Definir plano e limites
[ ] Salvar

# 2. Setup Banco (Automático)
[ ] Sistema cria banco automaticamente
[ ] Sistema roda migrations
[ ] Sistema cria primeiro admin

# 3. Build Mobile App (Manual - 1x)
[ ] ./scripts/build-tenant-app.sh <slug> all
[ ] Aguardar build (~20 min)
[ ] Submit para stores: eas submit --platform all
[ ] Aguardar review (~2 dias iOS, ~4h Android)

# 4. Configurar Módulos
[ ] Acessar admin do tenant
[ ] Habilitar módulos desejados
[ ] Configurar cashback
[ ] Testar acesso no app

# 5. Onboarding Completo
[ ] Tenant tem app nas lojas
[ ] Admin tem acesso ao painel
[ ] Usuários podem se cadastrar
[ ] Tudo funcionando end-to-end
```

### Checklist: Deploy de Nova Feature

```bash
# 1. Desenvolvimento
[ ] Criar branch: git checkout -b feature/nova-feature
[ ] Desenvolver código
[ ] Testar localmente
[ ] Commit: git commit -m "feat: nova feature"

# 2. Migration (se necessário)
[ ] cd apps/api
[ ] npx prisma migrate dev --name add_nova_feature
[ ] Testar migration localmente
[ ] Commit migration files

# 3. Pull Request
[ ] git push origin feature/nova-feature
[ ] Criar PR no GitHub
[ ] Code review
[ ] Merge para main

# 4. Deploy Automático (GitHub Actions)
[ ] Push para main dispara CI/CD
[ ] Rodando migrations em TODOS os tenants
[ ] Deploy do backend
[ ] Deploy do admin web
[ ] OTA update em TODOS os apps mobile

# 5. Verificação
[ ] Verificar logs do GitHub Actions
[ ] Testar em 2-3 tenants diferentes
[ ] Verificar métricas de erro
[ ] Confirmar update nos apps (versão no settings)

# Tempo total: ~15 minutos
# Tenants afetados: TODOS automaticamente
```

### Checklist: Troubleshooting

```bash
# Problema: Tenant não conecta ao banco
[ ] Verificar status: node scripts/check-tenant-status.js
[ ] Verificar password: está encrypted?
[ ] Testar conexão manual: psql <connection-string>
[ ] Logs: verificar console do backend
[ ] Cache: limpar Redis: redis-cli FLUSHALL

# Problema: App não atualiza via OTA
[ ] Verificar versão: expo-constants
[ ] Forçar update: matar e reabrir app
[ ] Verificar EAS dashboard: https://expo.dev
[ ] Verificar internet do dispositivo
[ ] Re-publicar: eas update --branch production

# Problema: Migration falhou em 1 tenant
[ ] Identificar erro: npm run db:status:all
[ ] Rollback tenant específico: npm run db:rollback <tenant-slug>
[ ] Corrigir migration
[ ] Re-rodar: npm run db:migrate:tenant <tenant-slug>

# Problema: Módulo não aparece no app
[ ] Verificar no admin: módulo está enabled?
[ ] Verificar API: GET /api/tenant/modules
[ ] Limpar cache do app
[ ] Verificar código: useIsModuleEnabled('module-key')
```

---

## 📊 Métricas de Sucesso

### Fase 1 (Fundação)
- [ ] 3 tenants de teste criados
- [ ] Middleware resolve tenant em < 50ms
- [ ] Migrations rodam em 10 tenants em < 2min
- [ ] 100% de testes passando

### Fase 2 (Mobile)
- [ ] 2 apps buildados com sucesso
- [ ] OTA update funciona em < 5min
- [ ] Branding dinâmico 100% funcional
- [ ] Apps publicados nas stores

### Fase 3 (Módulos)
- [ ] 5+ módulos configurados
- [ ] Toggle de módulo reflete no app instantaneamente
- [ ] 0 erros de permissão

### Fase 4 (Comunicação)
- [ ] Push enviado para 100+ usuários com sucesso
- [ ] Taxa de entrega > 95%
- [ ] Targeting por CEP funcional

### Fase 5-7 (Finalização)
- [ ] Admin web 100% funcional
- [ ] Super admin pode gerenciar tudo
- [ ] Sistema aguenta 1000 req/s
- [ ] Deploy total < 15min

---

## 🎯 Comando Rápidos (Quick Reference)

```bash
# MASTER DATABASE
npm run db:master:migrate       # Migrar master DB
npm run db:master:studio        # Abrir Prisma Studio (master)

# TENANT OPERATIONS
npm run db:migrate:all          # Migrar TODOS os tenants
npm run db:status:all           # Status de TODOS
npm run db:migrate:tenant slug  # Migrar 1 tenant
npm run tenant:create slug      # Criar novo tenant

# MOBILE
./scripts/build-tenant-app.sh slug ios     # Build iOS
./scripts/build-tenant-app.sh slug android # Build Android
./scripts/update-all-apps.sh "message"     # OTA update

# BACKEND
npm run dev:api                 # Dev backend
npm run build:api               # Build backend
npm run deploy:api              # Deploy backend

# ADMIN
npm run dev:admin               # Dev admin web
npm run build:admin             # Build admin
npm run deploy:admin            # Deploy admin (Vercel)

# TESTS
npm run test:e2e                # Testes E2E
npm run test:load               # Load testing
npm run test:tenant slug        # Testar 1 tenant
```

---

**Versão**: 2.0.0
**Última atualização**: 2025-11-06
**Mantido por**: Equipe Clube Digital

**Status**: ✅ Pronto para implementação

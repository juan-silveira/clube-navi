# 📊 PROJECT STATUS - Clube Digital

> **Documento de Status de Implementação**
> Mapeia o que já foi implementado, o que está pendente e sugestões de melhorias.
> **Atualizado em**: 2025-11-06

---

## 📌 Índice

1. [Visão Geral](#-visão-geral)
2. [Backend (API)](#-backend-api)
3. [Admin Web](#-admin-web)
4. [Mobile App](#-mobile-app)
5. [Infraestrutura](#-infraestrutura)
6. [Pendências Críticas](#-pendências-críticas)
7. [Sugestões de Implementação](#-sugestões-de-implementação)
8. [Roadmap Técnico](#-roadmap-técnico)

---

## 🎯 Visão Geral

### ⚠️ MUDANÇA DE ARQUITETURA: Multi-Tenant Whitelabel SaaS

**Decisão Estratégica**: O Clube Digital será transformado em **plataforma multi-tenant whitelabel SaaS**.

**O que muda**:
- ✅ **Database per Tenant**: Cada empresa cliente tem seu próprio banco de dados
- ✅ **Apps Separados + EAS Update**: Cada tenant tem app nas lojas, mas 1 deploy atualiza todos
- ✅ **Sistema de Módulos**: Habilitar/desabilitar funcionalidades por tenant + controle individual por usuário
- ✅ **Comunicação em Massa**: Campanhas push/sms/whatsapp com geo-targeting
- ✅ **Super-Admin Dashboard**: Gerenciar todos os tenants
- ✅ **Branding por Tenant**: Logos, cores, nome customizados
- ✅ **Analytics Agregado**: Métricas globais de todos os tenants para dashboard master (vendas, usuários, cashback)
- ✅ **Gestão Granular de Módulos**: Tenant admin pode controlar módulos por usuário individual
- ✅ **Modelo de Receita SaaS**: Mensalidades recorrentes + taxas sobre saques
- ✅ **Configuração Flexível de Cashback**: Percentuais customizáveis por tenant e por usuário

**Documentação**:
- 📄 [MULTI-TENANT-ARCHITECTURE.md](./MULTI-TENANT-ARCHITECTURE.md) - Arquitetura técnica completa
- 📄 [CORE-BUSINESS.md](./CORE-BUSINESS.md) - Regras de negócio atualizadas

### Status Geral do Projeto

```
Backend (API):        ████████░░ 80% completo (single-tenant)
Admin Web:            ████░░░░░░ 40% completo (single-tenant)
Mobile App:           ██████░░░░ 60% completo (single-tenant)
Blockchain:           ███████░░░ 70% completo
Infraestrutura:       ████████░░ 80% completo
Documentação:         ████████░░ 80% completo (multi-tenant adicionado)

Multi-Tenant:         ███░░░░░░░ 30% implementado (Fase 1 completa)
```

### Últimas Atualizações

- ✅ **Arquitetura Service Layer e Endpoints de Cashback IMPLEMENTADOS** (2025-11-06)
  - ✅ Refatoração completa: product.controller.js → product.service.js
  - ✅ Refatoração completa: purchase.controller.js → purchase.service.js
  - ✅ Novo cashback.controller.js com 5 endpoints
  - ✅ Novo cashback.routes.js registrado em /api/cashback
  - ✅ Service layer pattern implementado (separação business logic / HTTP)
  - ✅ Endpoints de cashback: /config, /stats, /calculate, /history, /process
  - ✅ Error handling consistente com status codes apropriados
  - ✅ Melhor testabilidade e manutenibilidade do código
- ✅ **Sistema de Produtos e Cashback Multi-Tenant IMPLEMENTADO** (2025-11-06)
  - ✅ product.controller.js - CRUD completo de produtos
  - ✅ purchase.controller.js - Sistema de compras com cashback
  - ✅ Cálculo e distribuição de cashback (50/25/15/10)
  - ✅ Routes de produtos e compras registradas
  - ✅ JWT middleware com suporte multi-tenant
  - ✅ Fix JWT_SECRET fallback
  - ✅ Auth controller limpo (removidas dependências legacy)
  - ✅ Teste E2E completo PASSOU (merchant → produto → consumer → compra)
- ✅ **Fase 1 Multi-Tenant IMPLEMENTADA** (2025-11-06)
  - ✅ Sprint 1.1: Master Database schema criado
  - ✅ Sprint 1.2: Tenant Resolution middleware implementado
  - ✅ Sprint 1.3: Scripts de automação prontos
  - ✅ Database clients (master + tenant) com pooling e cache
  - ✅ Documentação MULTI-TENANT-QUICKSTART.md criada
  - ✅ NPM scripts para operações multi-tenant
- ✅ **Modelo de Receita SaaS e Cashback Flexível documentados** (2025-11-06)
  - Mensalidades por tenant (BASIC/PRO/ENTERPRISE)
  - Taxa sobre saques (2,5% padrão)
  - Configuração flexível de percentuais de cashback
  - TenantCashbackConfig (Master DB) + UserCashbackConfig (Tenant DB)
  - Tenant admin pode configurar padrões e exceções individuais
  - API completa para gestão de cashback
- ✅ **Sistema de Analytics Agregado documentado** (2025-11-06)
  - Dashboard master com métricas de todos os tenants
  - TenantStats e GlobalStats no Master DB
  - Event-driven updates + scheduled jobs
  - LGPD compliant (apenas dados agregados)
- ✅ **Gestão Individual de Módulos documentada** (2025-11-06)
  - UserModule no Tenant DB
  - Tenant admin pode controlar módulos por usuário
  - 2-level validation (tenant + user)
  - API completa para gerenciamento
- ✅ **Documentação multi-tenant completa** (2025-11-06)
  - MULTI-TENANT-ARCHITECTURE.md v2.2.0
  - CORE-BUSINESS.md v2.2.0
  - PROJECT-STATUS.md v2.2.0
- ✅ Sistema de variáveis de ambiente centralizado (2025-11-06)
- ✅ Integração com S3 para documentos (2025-11-05)
- ✅ Sistema de autenticação com username (2025-11-04)

---

## 🔧 Backend (API)

### ✅ Implementado

#### Autenticação e Segurança
- [x] Sistema de registro com username
- [x] Login com email ou username
- [x] JWT (Access + Refresh tokens)
- [x] Middleware de autenticação
- [x] Password reset via email
- [x] Tentativas de login (rate limiting)
- [x] Bloqueio após falhas
- [x] 2FA (TOTP, SMS, Email) - **Parcial**

#### Gestão de Usuários
- [x] CRUD completo de usuários
- [x] Perfis de usuário
- [x] Upload de foto de perfil (S3)
- [x] Atualização de dados
- [x] Sistema de planos (BASIC, PRO, PREMIUM)
- [x] Histórico de ações (UserAction)
- [x] Cache de usuários (Redis)

#### KYC / Documentos
- [x] Upload de documentos (front, back, selfie)
- [x] Armazenamento no S3
- [x] Status de documentos (not_sent, pending, approved, rejected)
- [x] API para listar documentos pendentes
- [ ] **Review de documentos pelo admin** ⚠️

#### Sistema Financeiro
- [x] Depósitos via PIX (EFI Pay + Asaas)
- [x] Geração de QR Code PIX
- [x] Webhook de confirmação
- [x] Integração com blockchain (Mint cBRL)
- [x] Tabela de transações
- [x] Histórico de depósitos
- [x] **Sistema de cashback** ✅ **IMPLEMENTADO** (2025-11-06)
  - [x] Cálculo de distribuição de cashback
  - [x] Distribuição automática (Consumer 50%, Platform 25%, Referrers 15%+10%)
  - [x] Suporte multi-tenant (configuração por tenant)
  - [x] Teste E2E validado
  - [x] **Service Layer Architecture** (NOVO 2025-11-06)
  - [x] **cashback.service.js** - Lógica de negócio centralizada
  - [x] **cashback.controller.js** - 5 endpoints REST
  - [x] **Endpoints de Cashback** ✅ (NOVO 2025-11-06)
    - [x] GET /api/cashback/config - Configuração do tenant
    - [x] GET /api/cashback/stats - Estatísticas do usuário
    - [x] POST /api/cashback/calculate - Simulação de distribuição
    - [x] GET /api/cashback/history - Histórico de transações (paginado)
    - [x] POST /api/cashback/process/:purchaseId - Processar cashback
- [ ] **Saques via PIX** ⚠️
- [ ] **Validação de chave PIX** ⚠️

#### Blockchain Azore
- [x] Conexão com RPC (mainnet + testnet)
- [x] Criação de carteiras
- [x] Mint de cBRL
- [x] Burn de cBRL (preparado)
- [x] Transfer de cBRL
- [x] Integração com Azorescan
- [x] Workers para processar transações
- [x] Fila RabbitMQ

#### Notificações
- [x] Sistema de notificações
- [x] CRUD de notificações
- [x] Marcar como lida
- [x] Favoritar notificações
- [x] Configuração de notificações
- [ ] **Push notifications (Expo)** ⚠️
- [ ] **Email templates** ⚠️

#### Integrações
- [x] EFI Pay (PIX)
- [x] Asaas (PIX backup)
- [x] AWS S3 (documentos e imagens)
- [x] Redis (cache)
- [x] RabbitMQ (filas)
- [x] PostgreSQL (Prisma)
- [ ] **WhatsApp API** ⚠️
- [ ] **SMS (Twilio)** ⚠️

#### API Admin
- [x] Rotas administrativas
- [x] Listagem de usuários
- [x] Estatísticas básicas
- [ ] **Dashboard analytics** ⚠️
- [ ] **Gerenciamento de conteúdo** ❌
- [ ] **Aprovação de saques** ❌

### ⚠️ Parcialmente Implementado

1. **Sistema de Indicações**
   - ✅ Campo `referralId` no User
   - ✅ Campo `referralDescription`
   - ❌ Validação de código no registro
   - ❌ Cálculo de cashback para indicadores
   - ❌ Dashboard de indicações

2. **Sistema de 2FA**
   - ✅ Tabela UserTwoFactor
   - ✅ Geração de secrets TOTP
   - ❌ SMS provider
   - ❌ Email provider
   - ❌ Interface mobile

3. **Sistema de Taxas**
   - ✅ Tabela UserTaxes
   - ✅ Configuração padrão
   - ❌ Aplicação automática
   - ❌ Cálculo dinâmico

### ❌ Não Implementado

1. **Sistema de Saques**
   - Solicitação de saque
   - Validação de saldo cashback
   - Processamento PIX
   - Aprovação manual

5. **Gestão de Conta**
   - Status de conta (ACTIVE, INACTIVE_USER_REQUEST, etc)
   - Processo de desativação
   - Reativação via suporte

### 🗂️ Estrutura de Pastas

```
apps/api/
├── prisma/
│   ├── schema.prisma              ✅ Legacy (será migrado)
│   ├── schema-master.prisma       ✅ Master DB schema (NOVO)
│   └── schema-tenant.prisma       ✅ Tenant DB schema (NOVO)
├── src/
│   ├── config/                    ✅ Configurações OK
│   ├── controllers/
│   │   ├── product.controller.js  ✅ CRUD de produtos (REFATORADO 2025-11-06)
│   │   ├── purchase.controller.js ✅ Sistema de compras (REFATORADO 2025-11-06)
│   │   ├── cashback.controller.js ✅ Endpoints de cashback (NOVO 2025-11-06)
│   │   └── auth.controller.js     ✅ Auth atualizado (limpo de legacy)
│   ├── services/
│   │   ├── product.service.js     ✅ Lógica de produtos (NOVO 2025-11-06)
│   │   ├── purchase.service.js    ✅ Lógica de compras (NOVO 2025-11-06)
│   │   ├── cashback.service.js    ✅ Lógica de cashback (NOVO 2025-11-06)
│   │   └── [outros services...]   ✅ Services OK
│   ├── routes/
│   │   ├── product.routes.js      ✅ Rotas de produtos (NOVO 2025-11-06)
│   │   ├── purchase.routes.js     ✅ Rotas de compras (NOVO 2025-11-06)
│   │   └── cashback.routes.js     ✅ Rotas de cashback (NOVO 2025-11-06)
│   ├── middleware/
│   │   ├── auth.middleware.js     ✅ Auth OK (ATUALIZADO)
│   │   ├── jwt.middleware.js      ✅ JWT multi-tenant (ATUALIZADO)
│   │   └── tenant-resolution.middleware.js  ✅ Tenant Resolution (NOVO)
│   ├── database/
│   │   ├── master-client.js       ✅ Master DB client (NOVO)
│   │   ├── tenant-client.js       ✅ Tenant DB client (NOVO)
│   │   └── index.js               ✅ Database exports (NOVO)
│   ├── utils/                     ✅ Helpers OK
│   ├── workers/                   ✅ Mint/Withdraw workers OK
│   ├── generated/
│   │   ├── prisma-master/         ✅ Master Prisma client (NOVO)
│   │   └── prisma-tenant/         ✅ Tenant Prisma client (NOVO)
│   └── certificates/              ✅ EFI Pay certs
└── scripts/
    ├── create-tenant.js           ✅ Tenant creation automation (NOVO)
    ├── migrate-all-tenants.js     ✅ Migrate all tenants (NOVO)
    └── list-tenants.js            ✅ List tenants (NOVO)
```

---

## 🖥️ Admin Web

### ✅ Implementado

- [x] Estrutura Next.js 13 (App Router)
- [x] Layout responsivo
- [x] Autenticação NextAuth
- [x] Dashboard inicial
- [x] Navegação sidebar
- [ ] **Integração com API** ⚠️

### ❌ Não Implementado

1. **Gestão de Usuários**
   - [ ] Listagem de usuários
   - [ ] Busca e filtros
   - [ ] Detalhes do usuário
   - [ ] Edição de usuário
   - [ ] Histórico de ações

2. **KYC / Aprovação de Documentos**
   - [ ] Fila de documentos pendentes
   - [ ] Visualização de documentos
   - [ ] Aprovar/Rejeitar com motivo
   - [ ] Notificar usuário

3. **Sistema de Cashback**
   - [ ] Configuração de percentuais
   - [ ] Visualização de distribuição
   - [ ] Simulador de cashback
   - [ ] Relatórios

4. **Gestão de Produtos**
   - [ ] CRUD de produtos
   - [ ] Categorias
   - [ ] Upload de imagens
   - [ ] Gerenciamento de estoque
   - [ ] Aprovação de produtos

5. **Gestão de Lojistas**
   - [ ] Listagem de lojistas
   - [ ] Aprovação de lojistas
   - [ ] Configuração de comissões
   - [ ] Relatórios de vendas

6. **Controle de Saques**
   - [ ] Fila de saques pendentes
   - [ ] Validação de chave PIX
   - [ ] Aprovação manual
   - [ ] Histórico de saques

7. **Gestão de Conteúdo (CMS)**
   - [ ] Banners do app
   - [ ] Promoções
   - [ ] Notícias
   - [ ] Configuração de layout
   - [ ] Categorias em destaque

8. **Analytics/Relatórios**
   - [ ] Dashboard com métricas
   - [ ] GMV (Gross Merchandise Value)
   - [ ] Usuários ativos
   - [ ] Transações por período
   - [ ] Cashback distribuído
   - [ ] Taxa de conversão

9. **Suporte**
   - [ ] Chat/Tickets
   - [ ] FAQ
   - [ ] Logs de ações

### 🗂️ Estrutura de Pastas

```
apps/admin/frontend/
├── app/
│   ├── (dashboard)/               ⚠️ Estrutura básica
│   │   ├── crm/                   ❌ Não integrado
│   │   ├── analytics/             ❌ Não implementado
│   │   ├── users/                 ❌ Não existe
│   │   ├── products/              ❌ Não existe
│   │   ├── merchants/             ❌ Não existe
│   │   ├── kyc/                   ❌ Não existe
│   │   ├── withdrawals/           ❌ Não existe
│   │   └── cms/                   ❌ Não existe
│   └── (auth)/                    ✅ Login OK
├── components/                    ⚠️ Componentes genéricos
├── lib/                           ⚠️ Falta API client
└── public/                        ✅ Assets OK
```

---

## 📱 Mobile App

### ✅ Implementado

#### Navegação
- [x] Estrutura Expo Router
- [x] Tabs navigation
- [x] Auth flow
- [x] Stack navigation

#### Autenticação
- [x] Tela de login
- [x] Tela de registro (Step 1 e 2)
- [x] Splash screen
- [x] Logout
- [ ] **Password reset** ⚠️
- [ ] **2FA** ❌

#### Usuário
- [x] Perfil do usuário
- [x] Upload de foto
- [x] Edição de dados básicos
- [ ] **Upload de documentos KYC** ⚠️
- [ ] **Histórico completo** ⚠️

#### Financeiro
- [x] Tela de depósito
- [x] Geração de QR Code PIX
- [x] Exibição de saldo
- [x] Extrato (statement)
- [ ] **Saque** ❌
- [ ] **Validação de chave PIX** ❌

#### Indicações
- [x] Tela de indicações (referrals)
- [x] Compartilhar código
- [ ] **Listar indicados** ⚠️
- [ ] **Ganhos por indicação** ❌

### ❌ Não Implementado

1. **Marketplace**
   - [ ] Catálogo de produtos
   - [ ] Busca e filtros
   - [ ] Categorias
   - [ ] Detalhes do produto
   - [ ] Carrinho de compras
   - [ ] Checkout

2. **Cashback**
   - [ ] Visualização de cashback
   - [ ] Histórico de cashback
   - [ ] Cashback pendente
   - [ ] Extrato detalhado

3. **Lojista**
   - [ ] Toggle consumidor/lojista
   - [ ] Dashboard do lojista
   - [ ] Cadastro de produtos
   - [ ] Gerenciamento de estoque
   - [ ] Relatórios de vendas

4. **Notificações**
   - [ ] Push notifications
   - [ ] Lista de notificações
   - [ ] Centro de notificações

5. **Gamificação**
   - [ ] Badges
   - [ ] Níveis
   - [ ] Recompensas

### 🗂️ Estrutura de Pastas

```
apps/mobile/
├── app/
│   ├── (auth)/                    ✅ Login/Registro OK
│   ├── (tabs)/                    ⚠️ Tabs básicas
│   │   ├── index.tsx              ❌ Home vazia
│   │   ├── explore.tsx            ❌ Não implementado
│   │   └── profile.tsx            ✅ Perfil OK
│   ├── deposit.tsx                ✅ Depósito OK
│   ├── statement.tsx              ✅ Extrato OK
│   ├── referrals.tsx              ⚠️ Parcial
│   ├── marketplace/               ❌ Não existe
│   ├── product/                   ❌ Não existe
│   ├── merchant/                  ❌ Não existe
│   └── notifications/             ❌ Não existe
├── components/                    ⚠️ Componentes básicos
├── services/                      ⚠️ API client parcial
└── utils/                         ✅ Helpers OK
```

---

## 🏗️ Infraestrutura

### ✅ Implementado

#### Banco de Dados
- [x] PostgreSQL
- [x] Prisma ORM
- [x] Migrations funcionando
- [x] Seeds básicos
- [x] Índices otimizados

#### Cache
- [x] Redis configurado
- [x] Cache de usuários
- [x] Cache de perfis
- [x] TTL configurável

#### Filas
- [x] RabbitMQ
- [x] Fila de mint
- [x] Fila de withdraw
- [x] Workers funcionando

#### Storage
- [x] AWS S3
- [x] Upload de imagens
- [x] Upload de documentos
- [x] Prefixes organizados

#### Blockchain
- [x] Conexão Azore (testnet + mainnet)
- [x] Contrato cBRL
- [x] Integração com Azorescan
- [x] Workers para transações

#### Variáveis de Ambiente
- [x] Sistema centralizado
- [x] Script de sincronização
- [x] Separação backend/frontends
- [x] Documentação completa

### ⚠️ Parcialmente Implementado

1. **Monitoramento**
   - ✅ Logs estruturados
   - ❌ APM (Application Performance Monitoring)
   - ❌ Alertas
   - ❌ Dashboards

2. **CI/CD**
   - ❌ Pipeline de deploy
   - ❌ Testes automatizados
   - ❌ Deploy automático

### ❌ Não Implementado

1. **Testes**
   - [ ] Testes unitários (backend)
   - [ ] Testes de integração
   - [ ] Testes E2E (mobile)
   - [ ] Testes E2E (admin)

2. **Documentação**
   - [x] README-ENV.md ✅
   - [x] CORE-BUSINESS.md ✅
   - [x] PROJECT-STATUS.md ✅
   - [ ] API Documentation (Swagger)
   - [ ] Component documentation
   - [ ] Deployment guide

3. **DevOps**
   - [ ] Docker compose
   - [ ] Kubernetes configs
   - [ ] Terraform/IaC
   - [ ] Backup automatizado

---

## 🚨 Pendências Críticas

### ⚠️ Novos Requisitos Identificados

#### Moeda cBRL (Coinage.trade)
**Status**: Parcialmente implementado
- ✅ Token cBRL existe na blockchain Azore
- ✅ Integração com blockchain funciona
- ❌ Documentação sobre cBRL no app mobile
- ❌ Interface mostrando paridade 1:1 com BRL
- ❌ Referência à Coinage.trade

#### Sistema de Lojistas
**Status**: Não implementado
- ❌ Campo `userType` no User (consumer/merchant)
- ❌ Campo `merchantStatus` no User
- ❌ Dados de Pessoa Jurídica (CNPJ, razão social, etc)
- ❌ Tabela `MerchantApplication` para solicitações
- ❌ Fluxo de aprovação de lojista
- ❌ Interface para indicador solicitar aprovação
- ❌ Interface admin para aprovar/rejeitar lojistas
- ❌ Entrevista e validação manual

#### Restrição de Saques
**Status**: Não implementado
- ❌ Validação: apenas lojistas podem sacar
- ❌ Separação de saldo: vendas vs depósito/cashback
- ❌ Lógica de saldo de vendas
- ❌ Validação de userType e merchantStatus no saque
- ❌ Interface mobile: ocultar saque para consumidores

### Prioridade 1 (Bloqueadores)

#### 1. ✅ Sistema de Cashback **IMPLEMENTADO** (2025-11-06)
**Status**: ✅ **COMPLETO**
**Impacto**: Core business da plataforma FUNCIONANDO

**Implementado**:
- [x] Tabelas `products` e `purchases` no schema-tenant.prisma
- [x] Cálculo automático de cashback
- [x] Distribuição multi-stakeholder (50/25/15/10)
- [x] API para produtos (product.controller.js + product.routes.js)
- [x] API para compras (purchase.controller.js + purchase.routes.js)
- [x] Teste E2E validado ✅

**Próximos passos**:
- [ ] Worker assíncrono para processar cashback (opcional - já funciona síncrono)
- [ ] Interface mobile para marketplace
- [ ] Interface admin para gestão de produtos

#### 2. ✅ Sistema de Produtos/Marketplace **IMPLEMENTADO** (2025-11-06)
**Status**: ✅ **Backend COMPLETO**
**Impacto**: Backend pronto para uso

**Implementado**:
- [x] Schema de produtos completo
- [x] CRUD de produtos (API)
- [x] Categorização
- [x] Controle de estoque automático
- [x] Validação de merchant aprovado
- [x] Isolamento multi-tenant

**Próximos passos**:
- [ ] Upload de imagens de produtos
- [ ] Interface de cadastro (Admin)
- [ ] Catálogo no mobile

#### 3. ✅ Sistema de Compras **IMPLEMENTADO** (2025-11-06)
**Status**: ✅ **Backend COMPLETO**
**Impacto**: Transações funcionando E2E

**Implementado**:
- [x] Checkout flow (API)
- [x] Validação de estoque
- [x] Confirmação de compra
- [x] Distribuição automática de cashback
- [x] Cancelamento com devolução de estoque

**Próximos passos**:
- [ ] Carrinho de compras (Mobile)
- [ ] Pagamento com cBRL (integrar blockchain)
- [ ] Notificações ao lojista

#### 4. Status de Conta do Usuário ⚠️ **IMPORTANTE**
**Status**: Campo boolean simples
**Impacto**: Não é possível rastrear motivo de inativação

**Solução**:
```prisma
enum AccountStatus {
  ACTIVE
  INACTIVE_USER_REQUEST
  INACTIVE_ADMIN
  INACTIVE_FRAUD
  PENDING_DELETION
}

model User {
  // ... campos existentes
  accountStatus AccountStatus @default(ACTIVE) @map("account_status")
  deactivationReason String? @map("deactivation_reason")
  deactivatedAt DateTime? @map("deactivated_at")
  // ...
}
```

### Prioridade 2 (Importantes)

#### 5. Sistema de Saques ⚠️
**Status**: Preparado mas não completo
**Impacto**: Usuários não podem sacar cashback

**O que falta**:
- [ ] Validação de saldo cashback vs saldo depósito
- [ ] Integração completa com PIX (saque)
- [ ] Fila de aprovação manual
- [ ] Interface no admin
- [ ] Notificações

#### 6. Validação de Indicações no Registro ⚠️
**Status**: Campo existe mas não valida
**Impacto**: Pode haver indicações inválidas

**Solução**:
```javascript
// apps/api/src/controllers/auth.controller.js
async register(req, res) {
  const { referralCode } = req.body;

  // Validar se referralCode existe
  const referrer = await prisma.user.findUnique({
    where: { referralId: referralCode }
  });

  if (!referrer) {
    return res.status(400).json({
      error: 'Código de indicação inválido'
    });
  }

  // ... resto do registro
}
```

#### 7. Admin Dashboard Funcional ⚠️
**Status**: Estrutura existe mas não funciona
**Impacto**: Não é possível gerenciar a plataforma

**O que falta**:
- [ ] API client configurado
- [ ] Páginas de gestão implementadas
- [ ] Integração com backend
- [ ] Autenticação funcionando

### Prioridade 3 (Desejáveis)

#### 8. Push Notifications
- [ ] Setup Expo push tokens
- [ ] Service de envio
- [ ] Templates

#### 9. WhatsApp Notifications
- [ ] Integração com provider
- [ ] Templates de mensagens
- [ ] Envio em lote

#### 10. Sistema de Relatórios
- [ ] Analytics dashboard
- [ ] Exportação de dados
- [ ] Relatórios agendados

---

## 💡 Sugestões de Implementação

### 0. Schema do User Atualizado (URGENTE)

**Adicionar ao model User**:

```prisma
model User {
  // ... campos existentes

  // NOVOS CAMPOS - Sistema de Lojistas
  userType                UserType           @default(consumer) @map("user_type")
  merchantStatus          MerchantStatus?    @map("merchant_status")

  // Dados de Pessoa Jurídica
  companyDocument         String?            @unique @map("company_document") @db.VarChar(18)  // CNPJ
  companyName             String?            @map("company_name") @db.VarChar(255)  // Razão Social
  tradeName               String?            @map("trade_name") @db.VarChar(255)    // Nome Fantasia
  companyPhone            String?            @map("company_phone") @db.VarChar(20)
  companyAddress          Json?              @map("company_address")  // {street, number, city, state, zipCode}

  // Aprovação de lojista
  merchantApprovedAt      DateTime?          @map("merchant_approved_at") @db.Timestamptz(6)
  merchantApprovedBy      String?            @map("merchant_approved_by") @db.Uuid
  merchantRevokedAt       DateTime?          @map("merchant_revoked_at") @db.Timestamptz(6)
  merchantRevokedBy       String?            @map("merchant_revoked_by") @db.Uuid
  revocationReason        String?            @map("revocation_reason") @db.Text

  // Relations (adicionar às existentes)
  merchantApplications    MerchantApplication[]
  approvedMerchants       MerchantApplication[] @relation("ApproverRelation")

  // ... resto do modelo
}

// NOVOS ENUMS
enum UserType {
  consumer   // Usuário consumidor (padrão)
  merchant   // Lojista aprovado
}

enum MerchantStatus {
  pending    // Aguardando aprovação
  active     // Lojista ativo (pode vender e sacar)
  suspended  // Suspenso temporariamente
  revoked    // Status revogado pelo admin
  blocked    // Bloqueado por violação
}
```

### 0.1. Tabela de Solicitações de Lojista

**Nova tabela**:

```prisma
model MerchantApplication {
  id                  String                      @id @default(uuid()) @db.Uuid
  userId              String                      @map("user_id") @db.Uuid
  requestedBy         String                      @map("requested_by") @db.Uuid  // ID do indicador
  status              MerchantApplicationStatus   @default(pending)
  companyData         Json                        @map("company_data")  // Snapshot dos dados PJ
  notes               String?                     @db.Text  // Notas da entrevista
  interviewScheduled  DateTime?                   @map("interview_scheduled") @db.Timestamptz(6)
  interviewCompleted  DateTime?                   @map("interview_completed") @db.Timestamptz(6)
  reviewedBy          String?                     @map("reviewed_by") @db.Uuid
  reviewedAt          DateTime?                   @map("reviewed_at") @db.Timestamptz(6)
  approvalReason      String?                     @map("approval_reason") @db.Text
  rejectionReason     String?                     @map("rejection_reason") @db.Text
  createdAt           DateTime                    @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime                    @updatedAt @map("updated_at") @db.Timestamptz(6)

  user                User                        @relation(fields: [userId], references: [id])
  referrer            User                        @relation("ApproverRelation", fields: [reviewedBy], references: [id])

  @@index([userId])
  @@index([requestedBy])
  @@index([status])
  @@index([reviewedBy])
  @@map("merchant_applications")
}

enum MerchantApplicationStatus {
  pending    // Aguardando análise
  scheduled  // Entrevista agendada
  approved   // Aprovado
  rejected   // Rejeitado
  cancelled  // Cancelado pelo usuário
}
```

### 1. Sistema de Cashback Completo

#### Schema do Banco (Prisma)

```prisma
// Adicionar ao schema.prisma

model Product {
  id                  String   @id @default(uuid()) @db.Uuid
  merchantId          String   @map("merchant_id") @db.Uuid
  name                String   @db.VarChar(255)
  description         String?  @db.Text
  price               Decimal  @db.Decimal(10, 2)
  cashbackPercentage  Float    @map("cashback_percentage")
  category            String   @db.VarChar(100)
  subcategory         String?  @db.VarChar(100)
  images              Json     @default("[]")
  stock               Int      @default(0)
  isActive            Boolean  @default(true) @map("is_active")
  metadata            Json?
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  merchant            User     @relation("MerchantProducts", fields: [merchantId], references: [id])
  purchases           Purchase[]

  @@index([merchantId])
  @@index([category])
  @@index([isActive])
  @@map("products")
}

model Purchase {
  id                  String          @id @default(uuid()) @db.Uuid
  consumerId          String          @map("consumer_id") @db.Uuid
  merchantId          String          @map("merchant_id") @db.Uuid
  productId           String          @map("product_id") @db.Uuid
  quantity            Int             @default(1)
  unitPrice           Decimal         @map("unit_price") @db.Decimal(10, 2)
  totalPrice          Decimal         @map("total_price") @db.Decimal(10, 2)
  cashbackTotal       Decimal         @map("cashback_total") @db.Decimal(10, 2)
  status              PurchaseStatus  @default(pending)
  txHash              String?         @map("tx_hash") @db.VarChar(66)
  paidAt              DateTime?       @map("paid_at")
  completedAt         DateTime?       @map("completed_at")
  cancelledAt         DateTime?       @map("cancelled_at")
  metadata            Json?
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  consumer            User            @relation("ConsumerPurchases", fields: [consumerId], references: [id])
  merchant            User            @relation("MerchantSales", fields: [merchantId], references: [id])
  product             Product         @relation(fields: [productId], references: [id])
  cashbackTransactions CashbackTransaction[]

  @@index([consumerId])
  @@index([merchantId])
  @@index([productId])
  @@index([status])
  @@map("purchases")
}

model CashbackTransaction {
  id                  String              @id @default(uuid()) @db.Uuid
  purchaseId          String              @map("purchase_id") @db.Uuid
  recipientId         String              @map("recipient_id") @db.Uuid
  recipientType       CashbackRecipient   @map("recipient_type")
  amount              Decimal             @db.Decimal(10, 2)
  percentage          Float
  status              TransactionStatus   @default(pending)
  txHash              String?             @map("tx_hash") @db.VarChar(66)
  processedAt         DateTime?           @map("processed_at")
  createdAt           DateTime            @default(now()) @map("created_at")

  purchase            Purchase            @relation(fields: [purchaseId], references: [id])
  recipient           User                @relation("CashbackRecipient", fields: [recipientId], references: [id])

  @@index([purchaseId])
  @@index([recipientId])
  @@index([status])
  @@map("cashback_transactions")
}

enum PurchaseStatus {
  pending
  paid
  processing
  completed
  cancelled
  refunded
}

enum CashbackRecipient {
  consumer
  platform
  consumer_referrer
  merchant_referrer
}

// Adicionar relations ao User
model User {
  // ... campos existentes

  // Merchant relations
  products            Product[]            @relation("MerchantProducts")
  sales               Purchase[]           @relation("MerchantSales")

  // Consumer relations
  purchases           Purchase[]           @relation("ConsumerPurchases")

  // Cashback relations
  cashbackReceived    CashbackTransaction[] @relation("CashbackRecipient")

  // ... resto do modelo
}
```

#### Service de Cashback

```javascript
// apps/api/src/services/cashback.service.js

class CashbackService {
  /**
   * Calcula distribuição de cashback
   */
  async calculateCashbackDistribution(purchaseId) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        consumer: true,
        merchant: true,
        product: true
      }
    });

    const cashbackTotal = purchase.cashbackTotal;

    // Buscar configuração da plataforma
    const config = await this.getCashbackConfig();

    // Buscar indicadores
    const consumerReferrer = await this.findReferrer(purchase.consumer.referralId);
    const merchantReferrer = await this.findReferrer(purchase.merchant.referralId);

    const distribution = {
      consumer: {
        userId: purchase.consumerId,
        amount: cashbackTotal * (config.consumer / 100),
        percentage: config.consumer,
        type: 'consumer'
      },
      platform: {
        userId: process.env.PLATFORM_WALLET_ID,
        amount: cashbackTotal * (config.platform / 100),
        percentage: config.platform,
        type: 'platform'
      },
      consumerReferrer: consumerReferrer ? {
        userId: consumerReferrer.id,
        amount: cashbackTotal * (config.consumerReferrer / 100),
        percentage: config.consumerReferrer,
        type: 'consumer_referrer'
      } : null,
      merchantReferrer: merchantReferrer ? {
        userId: merchantReferrer.id,
        amount: cashbackTotal * (config.merchantReferrer / 100),
        percentage: config.merchantReferrer,
        type: 'merchant_referrer'
      } : null
    };

    // Caso especial: mesmo indicador
    if (consumerReferrer && merchantReferrer &&
        consumerReferrer.id === merchantReferrer.id) {
      distribution.consumerReferrer.amount += distribution.merchantReferrer.amount;
      distribution.consumerReferrer.percentage += distribution.merchantReferrer.percentage;
      distribution.merchantReferrer = null;
    }

    return distribution;
  }

  /**
   * Distribui cashback
   */
  async distributeCashback(purchaseId) {
    const distribution = await this.calculateCashbackDistribution(purchaseId);

    const transactions = [];

    // Criar transações de cashback
    for (const [key, value] of Object.entries(distribution)) {
      if (value && value.amount > 0) {
        const cashbackTx = await prisma.cashbackTransaction.create({
          data: {
            purchaseId,
            recipientId: value.userId,
            recipientType: value.type,
            amount: value.amount,
            percentage: value.percentage,
            status: 'pending'
          }
        });

        transactions.push(cashbackTx);
      }
    }

    // Processar na blockchain
    await this.processCashbackBlockchain(transactions);

    return transactions;
  }

  /**
   * Processa cashback na blockchain
   */
  async processCashbackBlockchain(transactions) {
    const blockchainService = require('./blockchain.service');

    for (const tx of transactions) {
      try {
        // Transfer cBRL para o recipient
        const txHash = await blockchainService.transfer(
          process.env.PLATFORM_WALLET_ADDRESS,  // De: carteira da plataforma
          tx.recipient.publicKey,                // Para: carteira do recipient
          tx.amount
        );

        // Atualizar transação
        await prisma.cashbackTransaction.update({
          where: { id: tx.id },
          data: {
            txHash,
            status: 'confirmed',
            processedAt: new Date()
          }
        });
      } catch (error) {
        await prisma.cashbackTransaction.update({
          where: { id: tx.id },
          data: { status: 'failed' }
        });
      }
    }
  }

  /**
   * Buscar configuração de cashback
   */
  async getCashbackConfig() {
    // Por enquanto, retornar valores padrão
    // Futuramente, buscar de uma tabela de configurações
    return {
      consumer: 50.0,
      platform: 25.0,
      consumerReferrer: 12.5,
      merchantReferrer: 12.5
    };
  }

  /**
   * Encontrar indicador pelo código
   */
  async findReferrer(referralCode) {
    if (!referralCode) return null;

    return await prisma.user.findUnique({
      where: { referralId: referralCode }
    });
  }
}

module.exports = new CashbackService();
```

### 2. Fluxo de Compra Completo

```javascript
// apps/api/src/services/purchase.service.js

class PurchaseService {
  /**
   * Criar compra
   */
  async createPurchase(consumerId, productId, quantity = 1) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { merchant: true }
    });

    if (!product.isActive) {
      throw new Error('Produto não está disponível');
    }

    if (product.stock < quantity) {
      throw new Error('Estoque insuficiente');
    }

    const unitPrice = product.price;
    const totalPrice = unitPrice * quantity;
    const cashbackTotal = totalPrice * (product.cashbackPercentage / 100);

    const purchase = await prisma.purchase.create({
      data: {
        consumerId,
        merchantId: product.merchantId,
        productId,
        quantity,
        unitPrice,
        totalPrice,
        cashbackTotal,
        status: 'pending'
      }
    });

    return purchase;
  }

  /**
   * Processar pagamento
   */
  async processPurchasePayment(purchaseId, consumerId) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        consumer: true,
        merchant: true,
        product: true
      }
    });

    if (purchase.consumerId !== consumerId) {
      throw new Error('Não autorizado');
    }

    // Verificar saldo do consumidor
    const consumerBalance = await this.getBalance(consumerId);
    if (consumerBalance < purchase.totalPrice) {
      throw new Error('Saldo insuficiente');
    }

    // Transfer cBRL: Consumidor → Lojista
    const blockchainService = require('./blockchain.service');
    const txHash = await blockchainService.transfer(
      purchase.consumer.publicKey,
      purchase.merchant.publicKey,
      purchase.totalPrice
    );

    // Atualizar compra
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'paid',
        txHash,
        paidAt: new Date()
      }
    });

    // Atualizar estoque
    await prisma.product.update({
      where: { id: purchase.productId },
      data: {
        stock: { decrement: purchase.quantity }
      }
    });

    // Processar cashback (assíncrono)
    this.processC ashbackAsync(purchaseId);

    return purchase;
  }

  /**
   * Processar cashback (worker)
   */
  async processCashbackAsync(purchaseId) {
    const queueService = require('./queue.service');

    await queueService.publishToQueue('cashback-processing', {
      purchaseId,
      timestamp: new Date()
    });
  }

  async getBalance(userId) {
    const blockchainService = require('./blockchain.service');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return await blockchainService.getBalance(user.publicKey);
  }
}

module.exports = new PurchaseService();
```

### 3. Worker de Cashback

```javascript
// apps/api/src/workers/cashback.worker.js

const cashbackService = require('../services/cashback.service');
const queueService = require('../services/queue.service');

async function processCashbackWorker() {
  console.log('🔄 Cashback Worker iniciado');

  await queueService.consumeQueue(
    'cashback-processing',
    async (message) => {
      const { purchaseId } = message;

      try {
        console.log(`💰 Processando cashback para purchase ${purchaseId}`);

        await cashbackService.distributeCashback(purchaseId);

        // Atualizar status da compra
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });

        console.log(`✅ Cashback distribuído para purchase ${purchaseId}`);
      } catch (error) {
        console.error(`❌ Erro ao processar cashback: ${error.message}`);

        await prisma.purchase.update({
          where: { id: purchaseId },
          data: { status: 'processing' }
        });
      }
    }
  );
}

processCashbackWorker();
```

### 4. Admin - Gestão de Documentos

```jsx
// apps/admin/frontend/app/(dashboard)/kyc/pending/page.jsx

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function KYCPendingPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  async function fetchPendingDocuments() {
    const response = await api.get('/api/admin/documents/pending');
    setDocuments(response.data);
    setLoading(false);
  }

  async function approveDocument(docId) {
    await api.post(`/api/admin/documents/${docId}/approve`);
    fetchPendingDocuments();
  }

  async function rejectDocument(docId, reason) {
    await api.post(`/api/admin/documents/${docId}/reject`, { reason });
    fetchPendingDocuments();
  }

  return (
    <div>
      <h1>Documentos Pendentes de Aprovação</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onApprove={() => approveDocument(doc.id)}
              onReject={(reason) => rejectDocument(doc.id, reason)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🗺️ Roadmap Técnico

### 🏗️ NOVO ROADMAP: Arquitetura Multi-Tenant

**Tempo Total Estimado**: 11 semanas (7 fases)

---

## Fase 1: Fundação Multi-Tenant (3 semanas) ✅ **COMPLETA**

### Sprint 1.1 - Master Database (1 semana) ✅ **COMPLETO**

**Objetivo**: Criar banco de metadados dos tenants

**Checklist**:
- [x] Criar banco `clube_digital_master` (pendente execução)
- [x] Schema Prisma para Master DB
  - [x] Model Tenant
  - [x] Model TenantBranding
  - [x] Model TenantModule
  - [x] Model TenantStats ✅ **NOVO**
  - [x] Model GlobalStats ✅ **NOVO**
  - [x] Model TenantCashbackConfig ✅ **NOVO**
  - [x] Model TenantWithdrawalConfig ✅ **NOVO**
  - [x] Model TenantAdmin
  - [x] Model SuperAdmin
  - [x] Model TenantApiKey ✅ **NOVO**
  - [x] Model TenantUsageStats ✅ **NOVO**
- [x] Migrations do master DB (pendente execução)
- [x] Seeds para tenant de desenvolvimento (pendente execução)
- [x] Gerar encryption key (AES-256-GCM) (já documentado)

**Entregáveis**:
```
apps/api/prisma/
├── schema-master.prisma           ✅ CRIADO (501 linhas)
├── schema-tenant.prisma           ✅ CRIADO (382 linhas)
└── schema.prisma                  ⚠️ Legacy (será migrado)

.env.example (atualizado):
MASTER_DATABASE_URL=postgresql://...
TENANT_DATABASE_URL=postgresql://...
```

### Sprint 1.2 - Tenant Resolution (1 semana) ✅ **COMPLETO**

**Objetivo**: Middleware para identificar e conectar ao tenant

**Checklist**:
- [x] Middleware `tenant-resolution.middleware.js`
  - [x] Resolver tenant por X-Tenant-Slug header
  - [x] Resolver tenant por subdomain
  - [x] Resolver tenant por custom domain
  - [x] Cache in-memory de metadados (5min TTL)
  - [x] Validação de status e subscription
- [x] Database clients
  - [x] `master-client.js` - Singleton para Master DB
  - [x] `tenant-client.js` - Dynamic connections com pooling
  - [x] Connection cache por tenant
  - [x] Cleanup automático de conexões antigas
- [x] Security validations
  - [x] Validar tenant status (active, trial, suspended)
  - [x] Validar subscription status
  - [x] Injetar req.tenant e req.tenantPrisma

**Entregáveis**:
```
apps/api/src/middleware/
└── tenant-resolution.middleware.js  ✅ CRIADO (300+ linhas)

apps/api/src/database/
├── master-client.js                ✅ CRIADO
├── tenant-client.js                ✅ CRIADO (com pooling e cache)
└── index.js                        ✅ CRIADO
```

### Sprint 1.3 - Scripts de Automação (1 semana) ✅ **COMPLETO**

**Objetivo**: Ferramentas para gerenciar tenants

**Checklist**:
- [x] Script `create-tenant.js`
  - [x] Criar banco de dados do tenant
  - [x] Criar usuário PostgreSQL
  - [x] Gerar senha segura
  - [x] Popular master DB com tenant
  - [x] Rodar migrations no tenant DB
  - [x] Criar configurações iniciais (cashback, modules, stats)
  - [x] Criar admin do tenant
  - [x] Retornar credenciais
- [x] Script `migrate-all-tenants.js`
  - [x] Listar todos tenants ativos
  - [x] Rodar migrations em cada banco
  - [x] Relatório de sucesso/erro
  - [x] Dry-run mode
- [x] Script `list-tenants.js` (planejado)
- [ ] Script `backup-tenant.js` (pendente)
- [ ] Script `delete-tenant.js` (pendente)

**Entregáveis**:
```
scripts/
├── create-tenant.js               ✅ CRIADO (400+ linhas)
├── migrate-all-tenants.js         ✅ CRIADO (170+ linhas)
└── list-tenants.js                ⚠️ Planejado

docs/
└── MULTI-TENANT-QUICKSTART.md     ✅ CRIADO (450+ linhas)

package.json (scripts adicionados):      ✅ COMPLETO
"prisma:generate:master"
"prisma:generate:tenant"
"prisma:generate:all"
"prisma:migrate:master"
"prisma:migrate:tenant"
"prisma:studio:master"
"prisma:studio:tenant"
"tenant:create"
"tenant:migrate:all"
"tenant:list"
```

---

## Fase 2: Mobile - Apps Separados + OTA (2 semanas)

### Sprint 2.1 - EAS Setup (1 semana)

**Objetivo**: Configurar EAS Update para multi-tenant

**Checklist**:
- [ ] Instalar EAS CLI: `npm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Criar projeto: `eas init`
- [ ] Configurar `app.config.js` dinâmico
  - [ ] Ler tenant config de `./tenants/<slug>/config.json`
  - [ ] Nome do app por tenant
  - [ ] Bundle ID por tenant
  - [ ] Ícone e splash por tenant
  - [ ] EAS updates URL
- [ ] Estrutura de tenants
  ```
  apps/mobile/tenants/
  ├── empresa-a/
  │   ├── config.json
  │   ├── icon.png
  │   ├── splash.png
  │   └── branding.json
  └── empresa-b/
      └── ...
  ```
- [ ] Script `build-tenant-app.sh`

**Entregáveis**:
```
apps/mobile/
├── app.config.js (dinâmico)
├── eas.json
├── tenants/
└── scripts/
    └── build-tenant-app.sh
```

### Sprint 2.2 - OTA Updates (1 semana)

**Objetivo**: Sistema de deploy unificado

**Checklist**:
- [ ] Script `update-all-apps.sh`
  - [ ] Build JavaScript bundle
  - [ ] Publish via `eas update`
  - [ ] Notificar admin dashboard
- [ ] GitHub Actions para CI/CD
  - [ ] Trigger em push para `main`
  - [ ] Rodar migrations em todos tenants
  - [ ] Publish OTA update
- [ ] Monitor de updates
  - [ ] Dashboard de status por tenant
  - [ ] Versões ativas por tenant

**Entregáveis**:
```
.github/workflows/
└── deploy-mobile.yml

scripts/
└── update-all-apps.sh

apps/admin/frontend/app/(dashboard)/
└── mobile-updates/page.jsx
```

---

## Fase 3: Sistema de Módulos (1 semana)

**Objetivo**: Habilitar/desabilitar funcionalidades por tenant + controle granular por usuário

**Checklist**:
- [ ] **Master DB Schema**
  - [ ] Adicionar campo `isEnabledByDefault` em TenantModule
- [ ] **Tenant DB Schema**
  - [ ] Criar tabela `UserModule` (userId, moduleKey, isEnabled, reason, audit fields)
- [ ] **Middleware `module.middleware.js`**
  - [ ] Função `requireModule(moduleKey)` com 2-level validation
  - [ ] Validação Level 1: Tenant habilitado
  - [ ] Validação Level 2: User habilitado (ou default do tenant)
  - [ ] Retornar 403 se módulo desabilitado em qualquer nível
- [ ] **API Tenant Admin - Gestão de Módulos por Usuário**
  - [ ] GET `/api/users/:userId/modules` - Listar módulos do usuário
  - [ ] PUT `/api/users/:userId/modules/:moduleKey` - Enable/disable para usuário
  - [ ] PUT `/api/modules/defaults` - Atualizar defaults do tenant
- [ ] **API Super-Admin**
  - [ ] GET `/api/tenants/modules` - Listar módulos ativos
  - [ ] PUT `/api/tenants/:id/modules` - Atualizar módulos do tenant
- [ ] **Super-Admin: Página de configuração**
  - [ ] Toggle por módulo
  - [ ] Ordem de exibição
  - [ ] Nome customizado
  - [ ] Configurar isEnabledByDefault
- [ ] **Tenant Admin: Interface de Módulos por Usuário**
  - [ ] Página `/users/:id/modules` - Gerenciar módulos individuais
  - [ ] Toggle por módulo com 3 estados: (tenant disabled | default | custom enabled/disabled)
  - [ ] Campo reason para justificar mudanças
  - [ ] Página `/settings/modules` - Configurar defaults para novos usuários
- [ ] **Mobile: Adaptação dinâmica**
  - [ ] Buscar módulos no app load (2-level check)
  - [ ] Renderizar apenas tabs habilitadas para o usuário

**Entregáveis**:
```
apps/api/prisma/
├── schema-master.prisma (TenantModule.isEnabledByDefault)
└── schema-tenant.prisma (UserModule table)

apps/api/src/middleware/
└── module.middleware.js (2-level validation)

apps/api/src/routes/
├── tenant.routes.js (super-admin modules API)
├── users.routes.js (tenant admin per-user modules API)
└── modules.routes.js (tenant admin defaults API)

apps/admin/frontend/app/(super-admin)/
└── tenants/[id]/modules/page.jsx

apps/admin/frontend/app/(dashboard)/
├── users/[id]/modules/page.jsx (gestão individual)
└── settings/modules/page.jsx (configurar defaults)
```

---

## Fase 4: Comunicação em Massa (2 semanas)

### Sprint 4.1 - Push Notifications (1 semana)

**Objetivo**: Campanhas push com geo-targeting

**Checklist**:
- [ ] Tabela Campaign no tenant DB
- [ ] Tabela UserPushToken no tenant DB
- [ ] Service `push-notification.service.js`
  - [ ] Integração Expo Push
  - [ ] Batching de mensagens
  - [ ] Receipts e relatórios
- [ ] API `/api/campaigns`
  - [ ] POST: Criar campanha
  - [ ] GET /preview: Preview de campanha
  - [ ] POST /:id/send: Enviar campanha
- [ ] Targeting por CEP + raio
  - [ ] Buscar usuários em raio
  - [ ] API externa de geocoding

**Entregáveis**:
```
apps/api/prisma/tenant-schema.prisma (adicionar):
- Campaign
- UserPushToken

apps/api/src/services/
├── push-notification.service.js
└── geocoding.service.js
```

### Sprint 4.2 - Admin Interface + SMS/WhatsApp (1 semana)

**Checklist**:
- [ ] Admin: Criar campanha
  - [ ] Form de campanha
  - [ ] Upload de imagem
  - [ ] Targeting (geo/segment/all)
  - [ ] Preview
  - [ ] Agendamento
- [ ] Admin: Relatórios
  - [ ] Estatísticas de envio
  - [ ] Taxa de abertura
  - [ ] Taxa de conversão
- [ ] Integração SMS (Twilio)
- [ ] Integração WhatsApp (Twilio/Meta)

**Entregáveis**:
```
apps/admin/frontend/app/(dashboard)/
├── campaigns/
│   ├── create/page.jsx
│   ├── [id]/page.jsx
│   └── reports/page.jsx
```

---

## Fase 5: Admin Web Multi-Tenant (1 semana)

**Objetivo**: Admin acessar apenas seu tenant

**Checklist**:
- [ ] Autenticação tenant-aware
  - [ ] Login valida admin pertence ao tenant
  - [ ] JWT inclui tenantId
- [ ] Subdomain routing
  - [ ] `empresa-a.admin.clubedigital.com.br`
  - [ ] Resolver tenant por subdomain
- [ ] Dashboard tenant-específico
  - [ ] Métricas apenas do tenant
  - [ ] Usuários apenas do tenant
  - [ ] Produtos apenas do tenant
- [ ] Branding por tenant
  - [ ] Logo do tenant no header
  - [ ] Cores do tenant

**Entregáveis**:
```
apps/admin/frontend/middleware.ts (tenant resolution)
apps/admin/frontend/lib/
└── tenant-context.tsx
```

---

## Fase 6: Super Admin Dashboard (2 semanas)

**Objetivo**: Dashboard para gerenciar todos os tenants + analytics agregado

### Sprint 6.1 - Master Database Schema para Analytics (3 dias)

**Checklist**:
- [ ] **Master DB Schema**
  - [ ] Criar tabela `TenantStats` (métricas por tenant)
  - [ ] Criar tabela `GlobalStats` (snapshots diários)
  - [ ] Adicionar relation `Tenant.stats`
- [ ] **AnalyticsService**
  - [ ] Método `onUserCreated(tenantId, userType)`
  - [ ] Método `onPurchaseCompleted(tenantId, purchaseData)`
  - [ ] Método `onProductCreated(tenantId)`
  - [ ] Método `onProductDeleted(tenantId)`
- [ ] **Integração nos Endpoints**
  - [ ] Chamar `analyticsService.onUserCreated()` em `/api/users/register`
  - [ ] Chamar `analyticsService.onPurchaseCompleted()` em `/api/purchases`
  - [ ] Chamar `analyticsService.onProductCreated()` em `/api/products`
- [ ] **Scheduled Jobs**
  - [ ] Job de reconciliação diária (3h da manhã)
  - [ ] Job de cálculo de métricas de 30 dias (4h da manhã)
  - [ ] Job de snapshot global diário (5h da manhã)

### Sprint 6.2 - Super Admin Dashboard e Gestão de Tenants (4 dias)

**Checklist**:
- [ ] **API Super-Admin Analytics**
  - [ ] GET `/api/super-admin/dashboard` - Overview com métricas agregadas
  - [ ] GET `/api/super-admin/tenants-ranking` - Top tenants por revenue
  - [ ] GET `/api/super-admin/historical-data` - Dados históricos para gráficos
- [ ] **Página `/super-admin/dashboard`**
  - [ ] Cards de overview (Total Tenants, Users, Revenue, Cashback)
  - [ ] Gráfico de crescimento (30 dias)
  - [ ] Ranking de top 10 tenants por revenue
  - [ ] Métricas de 30 dias (Active Users, Purchases, Revenue)
  - [ ] Growth percentual com comparação ao mês anterior
- [ ] **Página `/super-admin/tenants`**
  - [ ] Listar todos tenants
  - [ ] Status (active, trial, suspended)
  - [ ] Métricas globais na header
  - [ ] Filtros e busca
- [ ] **Página `/super-admin/tenants/create`**
  - [ ] Form de criação
  - [ ] Upload de logos
  - [ ] Configuração de módulos
  - [ ] Executar script de criação
- [ ] **Página `/super-admin/tenants/[id]`**
  - [ ] Editar branding
  - [ ] Habilitar/desabilitar módulos
  - [ ] Ver métricas do tenant (TenantStats)
  - [ ] Gráfico de crescimento do tenant
  - [ ] Gerenciar admins do tenant
- [ ] **Página `/super-admin/tenants/[id]/mobile-apps`**
  - [ ] Build app para tenant
  - [ ] Status de build
  - [ ] Links para stores

**Entregáveis**:
```
apps/api/prisma/
└── schema-master.prisma (TenantStats, GlobalStats)

apps/api/src/services/
└── analytics.service.js

apps/api/src/jobs/
└── analytics.jobs.js (3 cron jobs)

apps/api/src/routes/
└── super-admin.routes.js (analytics endpoints)

apps/admin/frontend/app/(super-admin)/
├── dashboard/page.jsx (analytics dashboard)
├── tenants/
│   ├── page.jsx
│   ├── create/page.jsx
│   ├── [id]/page.jsx
│   └── [id]/mobile-apps/page.jsx
```

---

## Fase 7: Migração e Testes (2 semanas)

### Sprint 7.1 - Migração de Dados (1 semana)

**Objetivo**: Migrar dados existentes para multi-tenant

**Checklist**:
- [ ] Script `migrate-to-multi-tenant.js`
  - [ ] Criar master DB
  - [ ] Criar tenant para dados existentes
  - [ ] Mover dados para tenant DB
  - [ ] Validar integridade
- [ ] Backup completo antes da migração
- [ ] Teste em ambiente de staging
- [ ] Documentação de rollback

### Sprint 7.2 - Testes E2E (1 semana)

**Objetivo**: Garantir que tudo funciona

**Checklist**:
- [ ] Teste: Criar novo tenant
- [ ] Teste: Usuário tenant A não vê dados de B
- [ ] Teste: Admin tenant A não vê dados de B
- [ ] Teste: Super-admin vê todos tenants
- [ ] Teste: Migration em todos tenants
- [ ] Teste: OTA update em todos apps
- [ ] Teste: Módulo desabilitado retorna 403
- [ ] Teste: Módulo desabilitado para usuário específico retorna 403
- [ ] Teste: Usuário com módulo habilitado custom acessa quando default é false
- [ ] Teste: Tenant admin pode alterar módulos individuais
- [ ] Teste: Campanha só atinge usuários do tenant
- [ ] Teste: Branding por tenant funciona
- [ ] Teste: Analytics agregado atualiza em tempo real
- [ ] Teste: Job de reconciliação corrige discrepâncias
- [ ] Teste: Dashboard master carrega em < 2s
- [ ] Teste: Ranking de tenants retorna dados corretos

**Entregáveis**:
```
apps/api/tests/e2e/
└── multi-tenant.test.js

docs/
└── TESTING.md
```

---

## 📊 Métricas de Sucesso

**Fase 1 - Fundação**:
- ✅ Master DB com 3+ tenants de teste
- ✅ Migrations rodam em todos tenants com 1 comando
- ✅ Tenant resolution < 50ms (com cache)

**Fase 2 - Mobile**:
- ✅ 3 apps separados nas lojas (iOS + Android)
- ✅ 1 OTA update atualiza todos em < 15 minutos
- ✅ Cada app com branding único

**Fase 3 - Módulos**:
- ✅ 8 módulos configuráveis
- ✅ Módulo desabilitado = 403 imediato
- ✅ Mobile adapta interface em < 5s
- ✅ Controle granular por usuário funciona (UserModule)
- ✅ 2-level validation (tenant + user) em < 100ms
- ✅ Tenant admin pode configurar defaults e exceções

**Fase 4 - Comunicação**:
- ✅ Campanha enviada para 1000+ usuários em < 5 minutos
- ✅ Targeting por CEP funciona
- ✅ Relatórios em tempo real

**Fase 5 - Admin**:
- ✅ Admin só vê seu tenant (100% isolamento)
- ✅ Branding por tenant aplicado

**Fase 6 - Super Admin**:
- ✅ Criar tenant em < 30 segundos
- ✅ Dashboard com métricas globais
- ✅ Analytics agregado em tempo real (TenantStats)
- ✅ Snapshot diário (GlobalStats) funciona
- ✅ Dashboard carrega em < 2 segundos
- ✅ Ranking de tenants por revenue/users
- ✅ Gráficos históricos de crescimento (30 dias)
- ✅ Jobs de reconciliação rodam sem erros

**Fase 7 - Migração**:
- ✅ Zero perda de dados
- ✅ Todos testes E2E passando

---

## 📋 Checklist por Fase

### ✅ Fundação Multi-Tenant
- [x] Sprint 1.1 - Master Database ✅ **COMPLETO**
- [x] Sprint 1.2 - Tenant Resolution ✅ **COMPLETO**
- [x] Sprint 1.3 - Scripts de Automação ✅ **COMPLETO**

### ✅ Mobile + OTA
- [ ] Sprint 2.1 - EAS Setup
- [ ] Sprint 2.2 - OTA Updates

### ✅ Módulos
- [ ] Sprint 3 - Sistema de Módulos (tenant + user-level)
  - [ ] TenantModule.isEnabledByDefault
  - [ ] UserModule table
  - [ ] 2-level validation middleware
  - [ ] API para gestão individual de módulos

### ✅ Comunicação
- [ ] Sprint 4.1 - Push Notifications
- [ ] Sprint 4.2 - Admin Interface

### ✅ Admin Multi-Tenant
- [ ] Sprint 5 - Admin Web

### ✅ Super Admin
- [ ] Sprint 6.1 - Analytics Agregado
  - [ ] TenantStats e GlobalStats schema
  - [ ] AnalyticsService com eventos
  - [ ] 3 scheduled jobs (reconciliação, 30d metrics, snapshot)
- [ ] Sprint 6.2 - Dashboard Master
  - [ ] API analytics endpoints
  - [ ] Dashboard com métricas agregadas
  - [ ] Ranking de tenants
  - [ ] Gráficos históricos

### ✅ Migração
- [ ] Sprint 7.1 - Migração de Dados
- [ ] Sprint 7.2 - Testes E2E

---

## 🚀 Roadmap Original (Single-Tenant)

**NOTA**: Este roadmap será executado **APÓS** a implementação multi-tenant.

### Sprint 1 (2 semanas)
**Objetivo**: Implementar sistema de produtos e cashback

- [ ] Criar schema de produtos, purchases e cashback
- [ ] Implementar CRUD de produtos (API)
- [ ] Implementar service de cashback
- [ ] Criar worker de cashback
- [ ] Adicionar status de conta no User
- [ ] Testes unitários dos services

### Sprint 2 (2 semanas)
**Objetivo**: Marketplace no mobile e gestão no admin

- [ ] Catálogo de produtos (mobile)
- [ ] Detalhes do produto (mobile)
- [ ] Carrinho de compras (mobile)
- [ ] CRUD de produtos (admin)
- [ ] Upload de imagens (admin)

### Sprint 3 (2 semanas)
**Objetivo**: Fluxo de compra completo

- [ ] Checkout (mobile)
- [ ] Pagamento com cBRL (mobile)
- [ ] Confirmação de compra (mobile)
- [ ] Distribuição de cashback (automática)
- [ ] Notificações de compra

### Sprint 3.5 (1 semana) - OBRIGATÓRIO
**Objetivo**: Smart Contract Relayer para distribuição atômica

**Inserir ANTES do Sprint 3 de compras** para ter base segura.

**Por que é obrigatório**:
- 🔒 **Segurança**: Impede lojista de não pagar cashback
- 💰 **Economia**: 1-2 transações em vez de 6
- ⚡ **Performance**: Distribuição instantânea e atômica
- 🛡️ **Confiança**: Sistema confiável desde o início
- 📊 **Regulatório**: Relatórios completos para agências

**Tarefas** (5-8 dias):
- [ ] Desenvolver RelayerContract.sol
- [ ] Testes unitários do contrato (Hardhat/Foundry)
- [ ] Deploy em testnet Azore
- [ ] Testes de integração
- [ ] Deploy em mainnet Azore
- [ ] Backend service `relayer.service.js`
- [ ] Integração com fluxo de compra
- [ ] Dashboard de monitoramento
- [ ] Relatórios para reguladores

### Sprint 4 (2 semanas)
**Objetivo**: Sistema de lojistas

- [ ] Toggle consumidor/lojista (mobile)
- [ ] Cadastro de produtos (mobile)
- [ ] Gestão de estoque (mobile)
- [ ] Dashboard do lojista (mobile)
- [ ] Aprovação de lojistas (admin)

### Sprint 5 (2 semanas)
**Objetivo**: Sistema de saques e KYC

- [ ] Validação de chave PIX (API)
- [ ] Saque via PIX (API + mobile)
- [ ] Aprovação de documentos (admin)
- [ ] Fila de saques (admin)

### Sprint 6 (2 semanas)
**Objetivo**: Analytics e relatórios

- [ ] Dashboard analytics (admin)
- [ ] Métricas em tempo real
- [ ] Relatórios de cashback
- [ ] Exportação de dados

---

## 📝 Próximos Passos Imediatos

### 🚀 FASE 1 IMPLEMENTADA - Próximos Passos para Execução

**Arquivos criados (Fase 1):**
- ✅ `/apps/api/prisma/schema-master.prisma` (501 linhas)
- ✅ `/apps/api/prisma/schema-tenant.prisma` (382 linhas)
- ✅ `/apps/api/src/database/master-client.js`
- ✅ `/apps/api/src/database/tenant-client.js`
- ✅ `/apps/api/src/database/index.js`
- ✅ `/apps/api/src/middleware/tenant-resolution.middleware.js` (300+ linhas)
- ✅ `/scripts/create-tenant.js` (400+ linhas)
- ✅ `/scripts/migrate-all-tenants.js` (170+ linhas)
- ✅ `/docs/MULTI-TENANT-QUICKSTART.md` (450+ linhas)
- ✅ `/.env.example` (atualizado com MASTER_DATABASE_URL)
- ✅ `/package.json` (scripts multi-tenant adicionados)

**Próximos passos para ativar multi-tenant:**

1. **Atualizar .env local** ⚠️ **IMPORTANTE**
   ```bash
   # Adicionar ao .env:
   MASTER_DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/clube_digital_master?schema=public
   ```

2. **Criar Master Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE clube_digital_master;"
   ```

3. **Gerar Prisma Clients**
   ```bash
   npm run prisma:generate:all
   ```

4. **Executar Migrations do Master DB**
   ```bash
   npm run prisma:migrate:master
   ```

5. **Criar primeiro tenant de teste**
   ```bash
   npm run tenant:create -- \
     --slug=test-tenant \
     --name="Test Company" \
     --email=admin@test.com
   ```

6. **Testar tenant resolution**
   - Executar API: `npm run dev:api`
   - Fazer request com header: `curl -H "X-Tenant-Slug: test-tenant" http://localhost:4000/api/health`

7. **Próxima Fase: Fase 2 - Mobile Apps + OTA** 🎯

### Hoje (Prioridade Máxima - Single-Tenant Features)

1. ✅ Criar documentação CORE-BUSINESS.md
2. ✅ Criar documentação PROJECT-STATUS.md
3. ✅ Implementar Fase 1 Multi-Tenant (COMPLETO)
4. ✅ Adicionar models de Product, Purchase ao schema-tenant.prisma
5. ✅ Criar API de produtos (CRUD) - product.controller.js
6. ✅ Criar API de compras - purchase.controller.js
7. ✅ Sistema de cashback completo (distribuição automática)
8. ✅ Teste E2E validado (merchant → produto → consumer → compra → cashback)
9. ✅ JWT middleware multi-tenant
10. ✅ Auth controller limpo de dependências legacy

### Esta Semana

1. [ ] Executar setup da Fase 1 (criar master DB, migrations, primeiro tenant)
2. [ ] Implementar validação de código de indicação no registro
3. [ ] Adicionar AccountStatus ao User
4. [ ] Criar service de purchase
5. [ ] Criar worker de cashback
6. [ ] Começar telas do marketplace (mobile)

### Este Mês

1. [ ] Completar setup multi-tenant em ambiente de desenvolvimento
2. [ ] Completar sistema de cashback
3. [ ] Implementar marketplace completo (mobile)
4. [ ] Implementar gestão de produtos (admin)
5. [ ] Sistema de compras funcionando E2E
6. [ ] Testes automatizados básicos
7. [ ] Iniciar Fase 2: Mobile Apps separados + EAS Update

---

**Última atualização**: 2025-11-06
**Versão**: 2.1.0 (Multi-Tenant - Fase 1 Implementada)
**Mantido por**: Equipe Clube Digital

## 📚 Documentos Relacionados

- **[MULTI-TENANT-ARCHITECTURE.md](./MULTI-TENANT-ARCHITECTURE.md)**: Arquitetura técnica multi-tenant completa
- **[MULTI-TENANT-QUICKSTART.md](./MULTI-TENANT-QUICKSTART.md)**: Guia rápido para começar a usar multi-tenant ✅ **NOVO**
- **[CORE-BUSINESS.md](./CORE-BUSINESS.md)**: Regras de negócio atualizadas para multi-tenant
- **[RELAYER-EXPLICACAO.md](./RELAYER-EXPLICACAO.md)**: Explicação do sistema Relayer

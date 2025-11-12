# 🏪 Clube Digital

> Plataforma whitelabel de clube de benefícios e cashback com blockchain

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-13.x-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748)](https://www.prisma.io/)
[![Blockchain](https://img.shields.io/badge/Blockchain-Azore-orange)](https://azore.technology/)

---

## 📖 Documentação

### Documentos Principais

- **[📘 CORE-BUSINESS.md](docs/CORE-BUSINESS.md)** - Regras de negócio, conceitos e estratégias
- **[📊 PROJECT-STATUS.md](docs/PROJECT-STATUS.md)** - Status de implementação e roadmap
- **[🔐 README-ENV.md](README-ENV.md)** - Gerenciamento de variáveis de ambiente

**🎯 Comece por aqui**: Leia primeiro o [CORE-BUSINESS.md](docs/CORE-BUSINESS.md) para entender o modelo de negócio.

---

## 🎯 O que é o Clube Digital?

O **Clube Digital** é uma plataforma completa que conecta **consumidores** e **lojistas** através de um sistema de **cashback** e **indicações**, fortalecendo o mercado local com incentivos financeiros distribuídos.

### Principais Funcionalidades

- 💰 **Sistema de Cashback Multinível** - Distribuição inteligente entre consumidores, indicadores e plataforma
- 🔗 **Rede de Indicações** - Cada usuário ganha com suas indicações de consumidores e lojistas
- 🛍️ **Marketplace** - Diversos segmentos (telecom, entretenimento, seguros, etc)
- ⛓️ **Blockchain Azore** - Token cBRL (Clube Real) para transações seguras
- 💳 **Carteira Digital** - Depósitos via PIX e saques de cashback
- 📱 **Whitelabel** - Personalizável para diferentes marcas

---

## 🏗️ Arquitetura

```
clube_digital/
├── apps/
│   ├── api/                 # Backend Node.js + Express
│   │   ├── prisma/         # Schema do banco de dados
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── workers/    # Workers blockchain
│   │   └── certificates/   # Certificados EFI Pay
│   │
│   ├── admin/frontend/     # Admin Dashboard React + Next.js
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   │
│   └── mobile/             # App Mobile React Native + Expo
│       ├── app/
│       ├── components/
│       └── services/
│
├── docs/                   # Documentação do projeto
│   ├── CORE-BUSINESS.md
│   └── PROJECT-STATUS.md
│
├── scripts/               # Scripts utilitários
│   └── sync-env.js       # Sincronização de variáveis
│
├── .env                  # Variáveis do backend (não commitar)
├── .env.shared          # Variáveis compartilhadas (commitar)
└── README-ENV.md        # Doc de variáveis de ambiente
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20.x ou superior
- PostgreSQL 14+
- Redis 7+
- RabbitMQ 3.12+
- AWS Account (S3)
- Conta EFI Pay ou Asaas (PIX)

### 1. Clone o Repositório

```bash
git clone https://github.com/group-navi/clube_digital.git
cd clube_digital
```

### 2. Instale Dependências

```bash
npm install
```

### 3. Configure Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar .env com suas credenciais
nano .env

# Editar variáveis compartilhadas
nano .env.shared

# Sincronizar para mobile e admin
npm run sync:env
```

**Leia**: [README-ENV.md](README-ENV.md) para detalhes completos.

### 4. Setup do Banco de Dados

```bash
# Rodar migrations
cd apps/api
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# (Opcional) Seed inicial
npm run seed
```

### 5. Rodar o Projeto

**🚀 Quick Start - Rodar TUDO de uma vez:**

```bash
# Via NPM
npm run dev:everything

# Via Make
make dev-everything

# Via Script (mais amigável)
./dev.sh all
```

Isso iniciará:
- ✅ **API**: http://localhost:8033
- ✅ **Admin**: http://localhost:3033
- ✅ **Club-Admin**: http://localhost:3000
- ✅ **Mobile**: Expo Dev Server

**📚 Ver todos os comandos disponíveis:**
- `make help` - Lista todos os comandos Make
- `./dev.sh` - Menu interativo do script
- Ver [DEV_COMMANDS.md](./DEV_COMMANDS.md) - Documentação completa
- Ver [QUICK_START.md](./QUICK_START.md) - Guia rápido

#### Outras combinações úteis:

```bash
# Backend + Admin
npm run dev:all
# ou
make dev

# Backend + Club-Admin
npm run dev:club-admin
# ou
make dev-club-admin

# Backend + Admin + Mobile (sem club-admin)
npm run dev:full
# ou
make dev-all
```

#### Serviços individuais:

```bash
# Backend API
npm run dev:api
# ou
make dev-api

# Admin Web
npm run dev:frontend
# ou
make dev-frontend

# Club-Admin Web
npm run dev:club-admin-only
# ou
make dev-club-admin-only

# Mobile App
npm run dev:mobile
# ou
make dev-mobile
```

#### Parar todos os serviços:

```bash
make stop
# ou
./dev.sh stop
```

---

## 📱 Mobile - Primeira Execução

```bash
cd apps/mobile

# iOS
npm run ios

# Android
npm run android

# Expo Go
npm run start
```

**Nota**: Certifique-se de ter:
- Xcode (para iOS)
- Android Studio (para Android)
- Ou use Expo Go app no seu telefone

---

## 🔧 Tecnologias

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **Redis** - Cache
- **RabbitMQ** - Filas
- **ethers.js** - Blockchain integration
- **JWT** - Autenticação

### Admin Web
- **React 19** - UI library
- **Next.js 13** - Framework (App Router)
- **Tailwind CSS** - Styling
- **NextAuth** - Autenticação

### Mobile
- **React Native** - Framework
- **Expo** - Tooling
- **Expo Router** - Navegação
- **Zustand** - Estado global

### Blockchain
- **Azore Network** - Blockchain EVM-compatible
- **cBRL** - Token ERC-20
- **Smart Contracts** - Solidity

### DevOps & Tools
- **AWS S3** - Storage
- **EFI Pay** - Gateway PIX
- **Asaas** - Gateway PIX (fallback)
- **Git** - Controle de versão

---

## 🌍 Ambientes

### Testnet (Desenvolvimento)
- **API**: http://localhost:8033
- **Admin**: http://localhost:3033
- **Blockchain**: Azore Testnet (Chain ID: 88001)
- **Explorer**: https://floripa.azorescan.com

### Mainnet (Produção)
- **Blockchain**: Azore Mainnet (Chain ID: 8800)
- **Explorer**: https://azorescan.com

---

## 📚 Documentação Completa

### Regras de Negócio
Leia [docs/CORE-BUSINESS.md](docs/CORE-BUSINESS.md) para entender:
- Como funciona o sistema de cashback
- Distribuição de valores
- Sistema de indicações
- Fluxos críticos
- Regras de negócio completas

### Status do Projeto
Leia [docs/PROJECT-STATUS.md](docs/PROJECT-STATUS.md) para ver:
- O que já está implementado
- O que está pendente
- Sugestões de implementação
- Roadmap técnico

### Variáveis de Ambiente
Leia [README-ENV.md](README-ENV.md) para:
- Entender a estrutura de .env
- Configurar corretamente
- Sincronizar variáveis

---

## 🧪 Testes

```bash
# Backend
cd apps/api
npm test

# Admin (quando implementado)
cd apps/admin/frontend
npm test

# Mobile (quando implementado)
cd apps/mobile
npm test
```

---

## 📦 Build para Produção

### Backend
```bash
cd apps/api
npm run build
npm start
```

### Admin Web
```bash
cd apps/admin/frontend
npm run build
npm start
```

### Mobile
```bash
cd apps/mobile

# iOS
eas build --platform ios

# Android
eas build --platform android
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Importante**: Leia [CORE-BUSINESS.md](docs/CORE-BUSINESS.md) antes de implementar novas features.

---

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Rodar tudo (turbo)
npm run dev:full         # API + Admin + Mobile
npm run dev:api          # Apenas API
npm run dev:frontend     # Apenas Admin
npm run dev:mobile       # Apenas Mobile

# Ambiente
npm run sync:env         # Sincronizar variáveis compartilhadas

# Build
npm run build            # Build todos os apps

# Linting
npm run lint             # Lint todos os apps
npm run format           # Format código com Prettier

# Database
cd apps/api
npx prisma migrate dev   # Criar migration
npx prisma studio        # Abrir Prisma Studio
npx prisma generate      # Gerar Prisma Client
```

---

## 🐛 Troubleshooting

### Problema: Variáveis de ambiente não carregam

**Solução**:
```bash
npm run sync:env
```

Leia [README-ENV.md](README-ENV.md) para mais detalhes.

### Problema: Erro de conexão com blockchain

**Solução**: Verifique se `.env` tem:
```bash
DEFAULT_NETWORK=testnet
TESTNET_RPC_URL=https://rpc-testnet.azore.technology
```

### Problema: Prisma Client outdated

**Solução**:
```bash
cd apps/api
npx prisma generate
```

### Problema: Mobile não conecta com API

**Solução**: Certifique-se de usar IP local no `.env.shared`:
```bash
API_URL=http://192.168.x.x:8033  # Seu IP local
npm run sync:env
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a [Documentação](docs/)
2. Abra uma [Issue](https://github.com/group-navi/clube_digital/issues)
3. Entre em contato com a equipe

---

## 📄 Licença

Este projeto é proprietário. © 2025 Grupo Navi. Todos os direitos reservados.

---

## 🎉 Equipe

Desenvolvido com ❤️ pela equipe Grupo Navi.

**Principais Tecnologias:**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)

---

**Última atualização**: 2025-11-06

# 🚀 Clube Navi - Plataforma Whitelabel de Clube de Benefícios

Plataforma completa de clube de benefícios com carteira digital blockchain (Polygon) e gateway de pagamentos.

## 📱 Produtos

### Apps Nativos (Principal)
- **iOS App** - App nativo para iPhone/iPad
- **Android App** - App nativo para Android
- Carteira digital blockchain
- Marketplace de produtos/serviços
- Cashback automático
- Sistema de indicação
- Mapa de parceiros

### Admin Dashboard (Secundário)
- **Web Dashboard** - Painel administrativo (Next.js + Dash Code)
- Gestão de whitelabels
- Gestão de usuários e lojistas
- Configuração de cashback
- Relatórios e analytics
- Gestão de produtos

## 🏗️ Arquitetura

```
clube-navi/
├── apps/
│   ├── mobile/          # React Native + Expo (iOS/Android)
│   ├── admin/           # Next.js + Dash Code (Admin Dashboard)
│   └── api/             # Node.js + Express (Backend API)
├── packages/
│   ├── shared/          # Código compartilhado
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Funções utilitárias
│   │   ├── constants/   # Constantes
│   │   └── validations/ # Schemas Zod
│   ├── ui/              # Componentes compartilhados
│   ├── blockchain/      # Lógica blockchain (Web3)
│   └── api-client/      # Cliente HTTP
└── templates/
    └── dash-code/       # Template Dash Code original
```

## 🛠️ Tech Stack

### Mobile (Apps Nativos)
- React Native + Expo
- TypeScript
- Expo Router
- React Query
- Zustand (state management)
- Web3.js (blockchain)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (Prisma ORM)
- Redis (cache)
- JWT Authentication
- Web3.js/Ethers.js (Polygon)

### Admin Dashboard
- Next.js 14+ (App Router)
- TypeScript
- shadcn/ui + Tailwind CSS
- Dash Code template
- NextAuth v5
- Jotai (state management)

### Infraestrutura
- Docker + Docker Compose
- Turborepo (monorepo)
- EAS Build (mobile builds)
- Vercel (admin dashboard)

## 🚦 Como Rodar

### Pré-requisitos
- Node.js 20+
- npm 10+
- Docker + Docker Compose
- Expo CLI
- PostgreSQL
- Redis

### Setup Inicial

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais
nano .env

# Subir banco de dados (Docker)
docker-compose up -d

# Rodar migrations
cd apps/api && npx prisma migrate dev

# Rodar seeds
npm run seed
```

### Desenvolvimento

```bash
# Rodar todos os ambientes
npm run dev

# Rodar apenas mobile
npm run dev:mobile

# Rodar apenas admin
npm run dev:admin

# Rodar apenas API
npm run dev:api

# Rodar app iOS (Mac apenas)
npm run ios

# Rodar app Android
npm run android
```

### Build Production (Apps Nativos)

```bash
# Build iOS (requer conta Apple Developer)
npm run build:mobile:ios

# Build Android
npm run build:mobile:android

# Build ambos
npm run build:mobile:all
```

## 🔑 Features Principais

- ✅ Sistema whitelabel (múltiplas marcas)
- ✅ Carteira digital blockchain (Polygon)
- ✅ Gateway de pagamentos (PIX, cartão)
- ✅ Sistema de cashback
- ✅ Máquinas de cartão (POS) para lojistas
- ✅ Sistema de indicação multinível
- ✅ Marketplace de produtos/serviços
- ✅ Mapa de parceiros geolocalizado
- ✅ Dashboard administrativo completo
- ✅ Autenticação multi-perfil

## 📦 Estrutura de Pacotes

### `packages/shared`
Código compartilhado entre mobile, admin e API:
- Types TypeScript
- Constantes
- Validações Zod
- Utilitários

### `packages/ui`
Componentes UI compartilhados (principalmente para mobile)

### `packages/blockchain`
Lógica de integração blockchain:
- Web3.js/Ethers.js
- Smart contracts
- Wallet management

### `packages/api-client`
Cliente HTTP para consumir API:
- Endpoints tipados
- Interceptors
- Error handling

## 🔐 Segurança

- JWT + Refresh Tokens
- Rate limiting
- Input sanitization
- HTTPS obrigatório
- Criptografia AES-256 (chaves blockchain)
- Helmet.js
- CORS configurado

## 📝 Licença

Proprietário - Clube Navi © 2024

## 👥 Time

Desenvolvido por Claude Code + Juan

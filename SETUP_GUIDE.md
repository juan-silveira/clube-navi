# 🚀 Clube Navi - Guia Completo de Setup

Guia passo a passo para rodar o projeto Clube Navi completo (Mobile + API + Admin).

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 20+ ([download](https://nodejs.org/))
- **npm** 10+ (vem com Node.js)
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop/))
- **Git** ([download](https://git-scm.com/downloads))

### Para desenvolvimento mobile (opcional):

- **Expo CLI**: `npm install -g expo-cli`
- **Para iOS**: Xcode (Mac apenas)
- **Para Android**: Android Studio
- **App Expo Go** no celular:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🎯 Etapa 1: Clonar e Instalar Dependências

```bash
# Navegar para o diretório do projeto
cd /home/juan/Desktop/Projects/Navi/clube_navi

# Instalar todas as dependências (monorepo)
npm install

# Isso irá instalar dependências de:
# - Root (Turborepo)
# - packages/shared
# - apps/api
# - apps/mobile
# - apps/admin
```

---

## 🐘 Etapa 2: Configurar Banco de Dados (PostgreSQL + Redis)

### 2.1 Subir containers Docker

```bash
# Na raiz do projeto, subir PostgreSQL e Redis
docker-compose up -d

# Verificar se containers estão rodando
docker ps

# Deve mostrar:
# - clube-navi-postgres (porta 5432)
# - clube-navi-redis (porta 6379)
```

### 2.2 Verificar conexão com banco

```bash
# Conectar ao PostgreSQL (opcional)
docker exec -it clube-navi-postgres psql -U clube_navi_user -d clube_navi

# Dentro do psql:
\l          # Listar databases
\q          # Sair
```

### 2.3 Acessar Adminer (UI do banco - opcional)

```
http://localhost:8080

Sistema: PostgreSQL
Servidor: postgres
Usuário: clube_navi_user
Senha: clube_navi_password
Base de dados: clube_navi
```

---

## ⚙️ Etapa 3: Configurar Variáveis de Ambiente

### 3.1 Backend API

```bash
cd apps/api
cp .env.example .env
```

Editar `apps/api/.env`:

```env
# Database (já configurado para Docker local)
DATABASE_URL="postgresql://clube_navi_user:clube_navi_password@localhost:5432/clube_navi?schema=public"

# JWT Secrets (MUDAR EM PRODUÇÃO!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars-long-abc123"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars-long-xyz789"

# Deixar o resto como está por enquanto
```

### 3.2 Mobile App

```bash
cd apps/mobile
cp .env.example .env
```

Editar `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_WHITELABEL_SLUG=clube-navi
```

**Nota**: Para testar no celular físico, trocar `localhost` pelo IP do seu computador na rede local (ex: `http://192.168.1.100:3001`).

### 3.3 Admin Dashboard

```bash
cd apps/admin
cp .env.example .env
```

Editar `apps/admin/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production-min-32-chars-long-xyz"
```

---

## 🗄️ Etapa 4: Configurar Database com Prisma

```bash
# Voltar para raiz do projeto
cd /home/juan/Desktop/Projects/Navi/clube_navi

# Navegar para API
cd apps/api

# Gerar Prisma Client
npm run prisma:generate

# Rodar migrations (criar tabelas)
npm run prisma:migrate

# Quando perguntar o nome da migration, pode usar: "init"

# Popular banco com dados iniciais (seed)
npm run prisma:seed
```

**Resultado esperado do seed**:
```
✅ Whitelabel: clube-navi
✅ Admin Master: admin@clubenavi.com / admin123456
✅ Admin Client: admin.client@clubenavi.com / client123456
✅ User: user@clubenavi.com / user123456
✅ Merchant: lojista@clubenavi.com / merchant123456
✅ 3 produtos demo
```

### Visualizar dados no Prisma Studio (opcional)

```bash
npm run prisma:studio

# Abre http://localhost:5555
# Permite visualizar e editar dados do banco
```

---

## 🏃 Etapa 5: Rodar os Serviços

### Opção A: Rodar tudo de uma vez (recomendado para começar)

```bash
# Na raiz do projeto
npm run dev

# Isso roda em paralelo:
# - API (http://localhost:3001)
# - Admin (http://localhost:3000)
# - Mobile (Expo Dev Server)
```

### Opção B: Rodar cada serviço separadamente

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev

# API rodando em http://localhost:3001
# Health check: http://localhost:3001/health
```

**Terminal 2 - Admin Dashboard:**
```bash
cd apps/admin
npm run dev

# Admin rodando em http://localhost:3000
```

**Terminal 3 - Mobile App:**
```bash
cd apps/mobile
npm run start

# Expo Dev Server iniciado
# Escanear QR code no app Expo Go
```

---

## ✅ Etapa 6: Testar o Sistema

### 6.1 Testar API

```bash
# Health check
curl http://localhost:3001/health

# Login (deve retornar tokens)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clubenavi.com","password":"admin123456"}'

# Buscar whitelabel (público)
curl http://localhost:3001/api/v1/whitelabels/slug/clube-navi
```

### 6.2 Testar Admin Dashboard

1. Abrir: http://localhost:3000
2. Fazer login com:
   - Email: `admin@clubenavi.com`
   - Senha: `admin123456`
3. Explorar dashboard (componentes do Dash Code estão prontos)

### 6.3 Testar Mobile App

**Opção 1 - Expo Go (mais fácil):**

1. Abrir app **Expo Go** no celular
2. Escanear QR code que aparece no terminal
3. App carrega no Expo Go
4. Testar login com: `user@clubenavi.com` / `user123456`

**Opção 2 - Simulator iOS (Mac):**

```bash
cd apps/mobile
npm run ios
```

**Opção 3 - Emulador Android:**

```bash
cd apps/mobile
npm run android
```

---

## 📊 Etapa 7: Verificar se está tudo funcionando

### Checklist:

- ✅ PostgreSQL rodando (port 5432)
- ✅ Redis rodando (port 6379)
- ✅ API rodando (port 3001) - health check retorna `{"status":"ok"}`
- ✅ Admin rodando (port 3000) - consegue fazer login
- ✅ Mobile rodando - Expo Dev Server ativo
- ✅ Database populado - Prisma Studio mostra dados

---

## 🔧 Comandos Úteis

### Database

```bash
# Ver logs do PostgreSQL
docker logs clube-navi-postgres

# Resetar database (CUIDADO!)
cd apps/api
npm run prisma:migrate reset

# Criar nova migration
npm run prisma:migrate

# Gerar Prisma Client (após alterar schema)
npm run prisma:generate
```

### Desenvolvimento

```bash
# Rodar tudo
npm run dev

# Rodar apenas API
npm run dev:api

# Rodar apenas Admin
npm run dev:admin

# Rodar apenas Mobile
npm run dev:mobile

# Limpar builds
npm run clean
```

### Type Checking

```bash
# Checar tipos TypeScript
npm run type-check
```

### Linting

```bash
# Rodar ESLint
npm run lint
```

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to database"

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Se não estiver, subir containers
docker-compose up -d

# Verificar logs
docker logs clube-navi-postgres
```

### Problema: "Port 3001 already in use"

**Solução:**
```bash
# Matar processo na porta 3001 (Linux/Mac)
lsof -ti:3001 | xargs kill -9

# Ou trocar porta no apps/api/.env
PORT=3002
```

### Problema: "Prisma Client not generated"

**Solução:**
```bash
cd apps/api
npm run prisma:generate
```

### Problema: "Module not found @clube-navi/shared"

**Solução:**
```bash
# Reinstalar dependências do monorepo
cd /home/juan/Desktop/Projects/Navi/clube_navi
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Problema: Expo não abre no celular

**Solução:**
1. Celular e computador devem estar na **mesma rede Wi-Fi**
2. Trocar `localhost` por IP local em `apps/mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
   ```
3. Descobrir IP:
   ```bash
   # Mac/Linux
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

---

## 📚 Próximos Passos

Agora que o ambiente está rodando:

1. **Explorar Admin Dashboard** (Dash Code template)
   - Ver componentes disponíveis
   - Entender estrutura de pastas
   - Ler `apps/admin/CLUBE_NAVI_GUIDE.md`

2. **Implementar features do Mobile**
   - Telas de produtos
   - Carteira blockchain
   - Mapa de parceiros
   - Sistema de cashback

3. **Completar API**
   - Controllers de produtos, transações, merchants
   - Integração blockchain (Web3.js)
   - Upload de imagens (S3)
   - Sistema de cashback automático

4. **Criar páginas do Admin**
   - CRUD de Whitelabels
   - Gestão de usuários
   - Gestão de lojistas
   - Relatórios

---

## 🔐 Contas de Teste

Após seed, você tem estas contas:

| Tipo | Email | Senha | Acesso |
|------|-------|-------|--------|
| Admin Master | admin@clubenavi.com | admin123456 | Admin Dashboard |
| Admin Client | admin.client@clubenavi.com | client123456 | Admin Dashboard |
| Usuário | user@clubenavi.com | user123456 | Mobile App |
| Lojista | lojista@clubenavi.com | merchant123456 | Mobile App |

---

## 📖 Documentação

- **Backend API**: `apps/api/README.md`
- **Mobile App**: `apps/mobile/README.md`
- **Admin Dashboard**: `apps/admin/CLUBE_NAVI_GUIDE.md`
- **Shared Packages**: `packages/shared/README.md` (criar se necessário)

---

## 🆘 Precisa de Ajuda?

1. Verificar logs dos serviços
2. Checar se todas as portas estão livres (3000, 3001, 5432, 6379)
3. Verificar se Docker está rodando
4. Reinstalar dependências: `npm install`
5. Resetar database: `npm run prisma:migrate reset` (no apps/api)

---

**Pronto! Sistema completo rodando! 🎉**

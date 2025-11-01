# 🚀 Clube Navi - Setup SEM Docker (Instalação Nativa)

Guia para rodar o Clube Navi sem Docker, instalando PostgreSQL e Redis nativamente.

---

## 📋 Pré-requisitos

- Node.js 20+
- npm 10+
- Git

---

## 🐘 Etapa 1: Instalar PostgreSQL

### Linux (Ubuntu/Debian)

```bash
# Atualizar repositórios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar versão (deve ser 12+)
psql --version

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar se está rodando
sudo systemctl status postgresql
```

### macOS (Homebrew)

```bash
# Instalar PostgreSQL
brew install postgresql@16

# Iniciar serviço
brew services start postgresql@16

# Verificar se está rodando
brew services list | grep postgresql
```

### Windows

1. Baixar installer: https://www.postgresql.org/download/windows/
2. Executar instalador
3. Durante instalação:
   - Senha do superusuário: escolher uma senha
   - Porta: **5432** (padrão)
   - Locale: padrão
4. Finalizar instalação
5. Abrir "SQL Shell (psql)" no menu Iniciar

---

## 🗄️ Etapa 2: Criar Database e Usuário

### Linux/macOS

```bash
# Conectar ao PostgreSQL como superusuário
sudo -u postgres psql

# Ou no macOS sem sudo:
psql postgres
```

### Windows

Abrir **SQL Shell (psql)** e conectar (apertar Enter em tudo, senha é a que você definiu).

### Dentro do psql (todos os sistemas):

```sql
-- Criar usuário
CREATE USER clube_navi_user WITH PASSWORD 'clube_navi_password';

-- Criar database
CREATE DATABASE clube_navi OWNER clube_navi_user;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE clube_navi TO clube_navi_user;

-- Verificar se foi criado
\l

-- Sair
\q
```

### Testar conexão:

```bash
# Conectar ao database criado
psql -U clube_navi_user -d clube_navi -h localhost

# Se pedir senha: clube_navi_password
# Dentro do psql:
\dt  # Deve estar vazio (sem tabelas ainda)
\q   # Sair
```

---

## 🔴 Etapa 3: Instalar Redis

### Linux (Ubuntu/Debian)

```bash
# Instalar Redis
sudo apt install redis-server -y

# Iniciar serviço
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Testar
redis-cli ping
# Deve retornar: PONG
```

### macOS (Homebrew)

```bash
# Instalar Redis
brew install redis

# Iniciar serviço
brew services start redis

# Testar
redis-cli ping
# Deve retornar: PONG
```

### Windows

1. Baixar: https://github.com/microsoftarchive/redis/releases
2. Baixar arquivo: **Redis-x64-X.X.XXX.msi**
3. Instalar (próximo, próximo, próximo)
4. Abrir cmd e testar:
   ```cmd
   redis-cli ping
   ```
   Deve retornar: `PONG`

---

## ⚙️ Etapa 4: Configurar Variáveis de Ambiente

### Backend API

```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi/apps/api
cp .env.example .env
```

Editar `apps/api/.env`:

```env
# Server
NODE_ENV=development
PORT=3001

# Database (NATIVA - localhost)
DATABASE_URL="postgresql://clube_navi_user:clube_navi_password@localhost:5432/clube_navi?schema=public"

# Redis (NATIVA - localhost)
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars-long-abc123"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars-long-xyz789"
JWT_EXPIRATION="15m"
REFRESH_TOKEN_EXPIRATION="7d"

# Encryption
ENCRYPTION_KEY="your-32-char-encryption-key-123"
```

**IMPORTANTE**: Se você criou o usuário PostgreSQL com **credenciais diferentes**, ajustar a `DATABASE_URL`:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/clube_navi?schema=public"
```

### Mobile App

```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi/apps/mobile
cp .env.example .env
```

Editar `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_WHITELABEL_SLUG=clube-navi
```

### Admin Dashboard

```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi/apps/admin
cp .env.example .env
```

Editar `apps/admin/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-long"
```

---

## 📦 Etapa 5: Instalar Dependências

```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi

# Instalar todas as dependências do monorepo
npm install
```

---

## 🗄️ Etapa 6: Configurar Database com Prisma

```bash
cd apps/api

# Gerar Prisma Client
npm run prisma:generate

# Criar tabelas (migrations)
npm run prisma:migrate
# Quando perguntar nome: "init"

# Popular com dados iniciais
npm run prisma:seed
```

**Resultado esperado:**
```
✅ Whitelabel created: clube-navi
✅ Admin user created: admin@clubenavi.com
✅ Client admin created: admin.client@clubenavi.com
✅ Demo user created: user@clubenavi.com
✅ Demo merchant created: Loja Demo
✅ Demo products created
✅ Global cashback rule created: 5%
```

---

## 🏃 Etapa 7: Rodar os Serviços

```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi

# Rodar tudo de uma vez
npm run dev

# Ou rodar separadamente:

# Terminal 1 - API
npm run dev:api

# Terminal 2 - Admin
npm run dev:admin

# Terminal 3 - Mobile
npm run dev:mobile
```

---

## ✅ Etapa 8: Verificar se está funcionando

### PostgreSQL

```bash
# Verificar serviço (Linux)
sudo systemctl status postgresql

# Verificar serviço (macOS)
brew services list | grep postgresql

# Conectar ao banco
psql -U clube_navi_user -d clube_navi -h localhost

# Listar tabelas (deve ter 13)
\dt

# Contar usuários (deve ter 4)
SELECT COUNT(*) FROM users;

# Sair
\q
```

### Redis

```bash
# Testar conexão
redis-cli ping
# Deve retornar: PONG

# Ver chaves (pode estar vazio no início)
redis-cli keys '*'
```

### API

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clubenavi.com","password":"admin123456"}'
```

---

## 🛑 Parar os Serviços

### PostgreSQL

```bash
# Linux
sudo systemctl stop postgresql

# macOS
brew services stop postgresql@16

# Windows
# Parar serviço no "Serviços" do Windows
```

### Redis

```bash
# Linux
sudo systemctl stop redis-server

# macOS
brew services stop redis

# Windows
# Parar serviço no "Serviços" do Windows
```

---

## 🔄 Resetar Database

```bash
cd apps/api

# Resetar tudo (apaga dados e recria)
npm run prisma:migrate reset

# Vai perguntar confirmação, digitar: yes

# Popular novamente
npm run prisma:seed
```

---

## 🎨 Visualizar Dados (Prisma Studio)

```bash
cd apps/api
npm run prisma:studio

# Abre http://localhost:5555
# Interface visual para ver/editar dados
```

---

## 🐛 Troubleshooting

### Problema: "Connection refused" ao PostgreSQL

**Solução:**

```bash
# Verificar se PostgreSQL está rodando
# Linux:
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS:
brew services list
brew services start postgresql@16

# Windows:
# Abrir "Serviços" e iniciar "postgresql-x64-XX"
```

### Problema: "password authentication failed"

**Solução:**

1. Verificar se senha em `.env` está correta
2. Recriar usuário:

```bash
sudo -u postgres psql

# Dentro do psql:
DROP USER IF EXISTS clube_navi_user;
CREATE USER clube_navi_user WITH PASSWORD 'clube_navi_password';
GRANT ALL PRIVILEGES ON DATABASE clube_navi TO clube_navi_user;
\q
```

### Problema: Redis não conecta

**Solução:**

```bash
# Linux:
sudo systemctl start redis-server

# macOS:
brew services start redis

# Windows:
# Iniciar serviço "Redis" em Serviços
```

### Problema: "relation does not exist"

**Solução:**

```bash
cd apps/api

# Rodar migrations novamente
npm run prisma:migrate reset
npm run prisma:seed
```

---

## 📊 Backup do Database (opcional)

```bash
# Backup
pg_dump -U clube_navi_user -d clube_navi -h localhost > backup.sql

# Restore
psql -U clube_navi_user -d clube_navi -h localhost < backup.sql
```

---

## 🎯 Vantagens da Instalação Nativa

✅ Melhor performance
✅ Menos uso de RAM
✅ Acesso direto ao database
✅ Ferramentas nativas (pgAdmin, DBeaver)
✅ Não precisa Docker

---

## 📝 Contas de Teste

| Email | Senha | Tipo |
|-------|-------|------|
| admin@clubenavi.com | admin123456 | Admin Master |
| admin.client@clubenavi.com | client123456 | Admin Client |
| user@clubenavi.com | user123456 | Usuário |
| lojista@clubenavi.com | merchant123456 | Lojista |

---

**Pronto! Sistema rodando sem Docker! 🎉**

Para voltar a usar Docker no futuro, basta:
1. Parar serviços nativos
2. Rodar `docker-compose up -d`
3. Usar `.env` com as mesmas credenciais

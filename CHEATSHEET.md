# 📝 Clube Digital - Cheatsheet

Comandos mais usados no dia a dia.

## 🚀 Começar a Trabalhar

```bash
# Rodar tudo
npm run dev:everything
# ou
make dev-everything
# ou
./dev.sh all
```

## 🛑 Parar Tudo

```bash
make stop
# ou
./dev.sh stop
```

## 🔧 Desenvolvimento por Área

### Frontend Admin

```bash
npm run dev:all          # Backend + Admin
make dev                 # Mesmo comando
./dev.sh admin           # Via script
```

### Frontend Club-Admin

```bash
npm run dev:club-admin   # Backend + Club-Admin
make dev-club-admin      # Mesmo comando
./dev.sh club           # Via script
```

### Mobile

```bash
npm run dev:full         # Backend + Admin + Mobile
make dev-all            # Mesmo comando
./dev.sh full           # Via script
```

## 📦 Banco de Dados

```bash
# Gerar Prisma clients
npm run prisma:generate:all

# Migrations Master DB
npm run prisma:migrate:master

# Migrations Tenant DB
npm run prisma:migrate:tenant

# Prisma Studio (visualizar dados)
npm run prisma:studio:master   # Porta 5555
npm run prisma:studio:tenant   # Porta 5556
```

## 🏢 Gerenciar Clubes

```bash
# Listar clubes
npm run club:list

# Criar novo clube
npm run club:create

# Migrar todos os clubes
npm run club:migrate:all
```

## 🔐 Acessos

### Admin (Super Admin)
- URL: http://localhost:3033
- Login: `admin@navi.com`
- Senha: `admin123`

### Club-Admin (Clube Navi)
- URL: http://localhost:3000
- Login: `admin@clube-navi.com`
- Senha: `admin123`

### API
- URL: http://localhost:8033
- Health: http://localhost:8033/health

## 🐛 Debug Rápido

```bash
# Ver portas em uso
lsof -i :8033   # API
lsof -i :3033   # Admin
lsof -i :3000   # Club-Admin

# Matar processo específico
kill -9 <PID>

# Ver logs da API
cd apps/api && npm run dev

# Limpar e reinstalar
make clean
make install
```

## 📂 Estrutura Rápida

```
apps/
├── api/              # Backend (Node.js + Express) - Porta 8033
├── admin/frontend/   # Admin Dashboard - Porta 3033
├── club-admin/frontend/  # Club Dashboard - Porta 3000
└── mobile/           # Mobile App (Expo)
```

## 💡 Comandos Git Úteis

```bash
# Verificar status
git status

# Criar branch nova
git checkout -b feature/nome-da-feature

# Commit
git add .
git commit -m "feat: descrição"

# Push
git push origin nome-da-branch
```

## 🎨 Comandos de Formatação

```bash
# Formatar código
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

## 📊 Build

```bash
# Build tudo
npm run build

# Build específico
cd apps/api && npm run build
cd apps/admin/frontend && npm run build
cd apps/club-admin/frontend && npm run build
```

## 🔄 Atualizar Dependências

```bash
# Atualizar package.json
npm update

# Atualizar tudo (forçado)
rm -rf node_modules package-lock.json
npm install
```

## 🌐 Domínios Locais

```bash
# Configurar domínios locais (primeira vez)
./setup-local-domains.sh

# Acessar por domínio
http://clube-navi.localhost:8033
http://empresa-teste.localhost:8033
```

## 🆘 Help

```bash
make help          # Ver todos comandos Make
./dev.sh          # Ver menu do script
npm run           # Ver scripts disponíveis
```

## 📚 Documentação Completa

- [README.md](./README.md) - Documentação geral
- [QUICK_START.md](./QUICK_START.md) - Guia rápido
- [DEV_COMMANDS.md](./DEV_COMMANDS.md) - Todos os comandos
- [docs/](./docs/) - Documentação técnica

---

**💡 Dica:** Mantenha este arquivo aberto em uma aba separada para consulta rápida!

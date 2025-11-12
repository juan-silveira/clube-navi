# 🚀 Quick Start Guide

Guia rápido para começar a desenvolver no Clube Digital.

## ⚡ Início Rápido

### 1. Rodar Tudo de Uma Vez

```bash
npm run dev:everything
```

Isso vai iniciar:
- ✅ API (Backend) na porta 8033
- ✅ Admin (Frontend Admin) na porta 3033
- ✅ Club-Admin (Frontend Club) na porta 3000
- ✅ Mobile (Expo) via QR Code

### 2. Acessar as Aplicações

Após rodar o comando acima, acesse:

- **Admin Dashboard**: http://localhost:3033
  - Login: admin@navi.com / admin123

- **Club-Admin Dashboard**: http://localhost:3000
  - Login: admin@clube-navi.com / admin123

- **API**: http://localhost:8033
  - Health check: http://localhost:8033/health

- **Mobile**: Escaneie o QR Code no terminal com o app Expo Go

---

## 🛠️ Outros Comandos Úteis

### Rodar Apenas Backend + Admin

```bash
npm run dev:all
# ou
make dev
```

### Rodar Apenas Backend + Club-Admin

```bash
npm run dev:club-admin
# ou
make dev-club-admin
```

### Parar Todos os Serviços

```bash
make stop
```

### Ver Todos os Comandos

```bash
make help
```

---

## 📚 Documentação Completa

Para mais detalhes sobre todos os comandos disponíveis, veja:
- [DEV_COMMANDS.md](./DEV_COMMANDS.md) - Lista completa de comandos
- [README.md](./README.md) - Documentação geral do projeto

---

## 🐛 Problemas Comuns

### Porta já em uso

```bash
# Parar todos os processos
make stop

# Ou verificar e matar manualmente
lsof -i :8033  # Verificar porta específica
kill -9 <PID>  # Matar processo
```

### Dependências desatualizadas

```bash
# Reinstalar tudo
make clean
make install
```

### Banco de dados não está rodando

```bash
# Verificar se PostgreSQL está ativo
systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql
```

---

## 🎯 Workflow Recomendado

1. **Primeira vez rodando o projeto:**
   ```bash
   make install          # Instalar dependências
   npm run dev:everything # Rodar tudo
   ```

2. **Desenvolvimento diário:**
   ```bash
   npm run dev:everything # Ou o comando específico para o que você está trabalhando
   ```

3. **Ao finalizar:**
   ```bash
   make stop             # Parar todos os processos
   ```

---

## 📝 Dicas de Produtividade

- Use `make help` para ver todos os comandos disponíveis
- Os logs são coloridos por serviço para facilitar debug
- Use `Ctrl+C` para parar os serviços
- Mantenha um terminal aberto para cada serviço se preferir controle individual

---

## 🔄 Fluxo de Atualização do Código

Quando puxar código novo do repositório:

```bash
git pull
make install          # Atualizar dependências se necessário
npm run prisma:generate:all  # Regenerar clients do Prisma se schemas mudaram
npm run dev:everything
```

---

## 🎨 Estrutura dos Serviços

```
clube_digital/
├── apps/
│   ├── api/                 # Backend (Node.js + Express)
│   ├── admin/frontend/      # Admin Dashboard (Next.js)
│   ├── club-admin/frontend/ # Club Dashboard (Next.js)
│   └── mobile/              # App Mobile (React Native + Expo)
```

Cada serviço roda independentemente e pode ser iniciado individualmente ou em conjunto.

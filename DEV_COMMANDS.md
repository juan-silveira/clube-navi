# Comandos de Desenvolvimento

Este documento lista todos os comandos disponíveis para executar o projeto.

## 🚀 Comandos Principais

### Rodar Tudo (Recomendado para desenvolvimento completo)

```bash
# Via NPM
npm run dev:everything

# Via Make
make dev-everything
```

**Serviços iniciados:**
- 🔵 **API** (Backend): http://localhost:8033
- 🟣 **Admin** (Frontend Admin): http://localhost:3033
- 🔷 **Club-Admin** (Frontend Club): http://localhost:3000
- 🟢 **Mobile** (Expo): Via QR Code

---

## 📦 Combinações de Serviços

### Backend + Admin Frontend

```bash
# Via NPM
npm run dev:all

# Via Make
make dev
```

### Backend + Admin + Mobile

```bash
# Via NPM
npm run dev:full

# Via Make
make dev-all
```

### Backend + Club-Admin

```bash
# Via NPM
npm run dev:club-admin

# Via Make
make dev-club-admin
```

---

## 🔧 Serviços Individuais

### Apenas API (Backend)

```bash
# Via NPM
npm run dev:api

# Via Make
make dev-api
```

**Porta:** 8033

### Apenas Admin Frontend

```bash
# Via NPM
npm run dev:frontend

# Via Make
make dev-frontend
```

**Porta:** 3033

### Apenas Club-Admin Frontend

```bash
# Via Make
make dev-club-admin-only
```

**Porta:** 3000

### Apenas Mobile (Expo)

```bash
# Via NPM
npm run dev:mobile

# Via Make
make dev-mobile
```

---

## 🛑 Parar Todos os Serviços

```bash
make stop
```

Este comando para todos os processos Node/NPM ativos.

---

## 📋 Ver Todos os Comandos Disponíveis

```bash
make help
```

---

## 🎨 Cores dos Logs (concurrently)

Quando você roda múltiplos serviços simultaneamente, cada um tem uma cor diferente nos logs:

- 🔵 **Azul** - API
- 🟣 **Magenta** - Admin Frontend
- 🔷 **Cyan** - Club-Admin Frontend
- 🟢 **Verde** - Mobile

Isso facilita identificar qual serviço está gerando qual log.

---

## 💡 Dicas

### 1. Desenvolvimento Full-Stack
Para trabalhar com todas as partes do sistema:
```bash
npm run dev:everything
```

### 2. Desenvolvimento Backend + Frontend Específico
- **Admin**: `npm run dev:all`
- **Club-Admin**: `npm run dev:club-admin`

### 3. Problemas com Portas Ocupadas
Se alguma porta estiver em uso:
```bash
# Para todos os processos
make stop

# Verificar quem está usando a porta (exemplo: 8033)
lsof -i :8033

# Matar processo específico
kill -9 <PID>
```

### 4. Reinstalar Dependências
```bash
# Limpar tudo
make clean

# Reinstalar
make install
```

---

## 🗺️ Portas Usadas

| Serviço | Porta | URL |
|---------|-------|-----|
| API (Backend) | 8033 | http://localhost:8033 |
| Admin Frontend | 3033 | http://localhost:3033 |
| Club-Admin Frontend | 3000 | http://localhost:3000 |
| Mobile (Expo) | 19000+ | Metro Bundler |

---

## 📝 Observações

- Todos os comandos devem ser executados da **raiz do projeto**
- O `concurrently` roda múltiplos processos em paralelo
- Use `Ctrl+C` para parar os serviços em execução
- Logs de cada serviço aparecem com cores diferentes

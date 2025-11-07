# 🔐 Credenciais de Acesso - Sistema Clube Digital

## 🎯 Super Admin (Painel de Gerenciamento do Sistema)

### Login para o Frontend Admin (localhost:3033)

**Credenciais:**
- **Email:** `admin@clubedigital.com`
- **Password:** `Admin@2025`

**Endpoint API de Login:**
```bash
POST http://localhost:8033/api/super-admin-auth/login
Content-Type: application/json

{
  "email": "admin@clubedigital.com",
  "password": "Admin@2025"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "uuid",
      "name": "Super Admin",
      "email": "admin@clubedigital.com",
      "permissions": {}
    }
  }
}
```

---

## 🏢 Tenant Admins (Administradores de Cada Empresa)

### Clube Navi
- **Email:** `admin@clube-navi.com`
- **Password:** `Admin@2025`
- **Tenant Slug:** `clube-navi`

### Empresa Teste
- **Email:** `admin@empresateste.com.br`
- **Password:** `Admin@2025`
- **Tenant Slug:** `empresa-teste`

**Endpoint API de Login (Tenant Admin):**
```bash
POST http://localhost:8033/api/tenant-auth/login
Content-Type: application/json

{
  "email": "admin@clube-navi.com",
  "password": "Admin@2025"
}
```

---

## 👥 Usuários do App (Consumers/Merchants)

Estes são usuários dentro de cada tenant, não administradores:

### Clube Navi - Usuários de Teste

**Consumer:**
- **Email:** `success@clubenavi.com`
- **Username:** `success_test`

**Merchants:**
- **Email:** `loja.joao@clubenavi.com`
- **Username:** `loja_joao`

**Endpoint de Login (Usuários do App):**
```bash
POST http://localhost:8033/api/auth/login
Content-Type: application/json
X-Tenant-Slug: clube-navi

{
  "email": "success@clubenavi.com",
  "password": "senha_do_usuario"
}
```

---

## 🔑 Hierarquia de Acesso

```
┌─────────────────────────────────────────┐
│         SUPER ADMIN                     │
│  (Gerencia o sistema todo)             │
│  - Cria/gerencia tenants                │
│  - Acesso total ao sistema              │
└─────────────────────────────────────────┘
                  │
                  ├──────────────────┬──────────────────┐
                  │                  │                  │
          ┌───────────────┐  ┌───────────────┐  ┌─────────────┐
          │ TENANT ADMIN  │  │ TENANT ADMIN  │  │  TENANT...  │
          │  Clube Navi   │  │ Empresa Teste │  │             │
          └───────────────┘  └───────────────┘  └─────────────┘
                  │
          ┌───────┴────────┐
          │                │
     ┌─────────┐      ┌──────────┐
     │ USERS   │      │ MERCHANTS│
     │Consumer │      │  (Lojas) │
     └─────────┘      └──────────┘
```

---

## 📝 Notas Importantes

1. **Frontend Mock Auth**: O frontend atual (localhost:3033) usa autenticação mock. Para usar as credenciais reais do backend, será necessário atualizar o `login-form.jsx` para fazer chamadas à API.

2. **Tokens JWT**: Após o login, o backend retorna um token JWT que deve ser incluído no header `Authorization: Bearer <token>` para rotas protegidas.

3. **Tenant Resolution**: O sistema multi-tenant funciona via:
   - Header `X-Tenant-Slug` (ex: `clube-navi`)
   - Custom domain (configurado no banco: localhost = clube-navi)
   - Subdomínio

4. **Senha Padrão**: Todas as senhas dos admins são `Admin@2025` (configurada no .env como `DEFAULT_ADMIN_PASSWORD`)

---

## 🧪 Como Testar

### 1. Testar Login Super Admin via API:
```bash
curl -X POST http://localhost:8033/api/super-admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clubedigital.com",
    "password": "Admin@2025"
  }'
```

### 2. Testar Login Tenant Admin via API:
```bash
curl -X POST http://localhost:8033/api/tenant-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clube-navi.com",
    "password": "Admin@2025"
  }'
```

### 3. Usar o Token para Acessar Recursos Protegidos:
```bash
# Salvar o token da resposta
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Fazer requisição autenticada
curl -X GET http://localhost:8033/api/super-admin-auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Próximos Passos

Para conectar o frontend ao backend real:

1. Atualizar `apps/admin/frontend/components/partials/auth/login-form.jsx`
2. Remover a lógica mock de Redux
3. Fazer POST para `/api/super-admin-auth/login`
4. Salvar o token no localStorage ou em um state manager (Zustand)
5. Incluir o token em todas as requisições subsequentes

---

**Data de Criação:** 2025-11-07
**Última Atualização:** 2025-11-07

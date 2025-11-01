# 🧪 Guia de Testes - Clube Navi API

## 📌 Pré-requisitos

Certifique-se de que o servidor backend está rodando:
```bash
npm run dev --workspace=@clube-navi/api
```

O servidor deve estar rodando em: `http://localhost:3001`

---

## 1️⃣ Teste de Health Check

```bash
curl http://localhost:3001/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T..."
}
```

---

## 2️⃣ Endpoints Públicos (Sem Autenticação)

### Listar Banners

```bash
curl http://localhost:3001/api/v1/banners
```

### Listar Categorias

```bash
curl http://localhost:3001/api/v1/categories
```

### Buscar Categoria por Slug

```bash
curl http://localhost:3001/api/v1/categories/slug/eletronicos
```

### Buscar Banner por ID

```bash
curl http://localhost:3001/api/v1/banners/SEU_BANNER_ID
```

---

## 3️⃣ Autenticação

### Registrar Novo Usuário

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novousuario@example.com",
    "password": "senha123456",
    "name": "Novo Usuário",
    "phone": "+5511999998888"
  }'
```

### Login (obter token)

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clubenavi.com",
    "password": "admin123456"
  }'
```

**Salve o `accessToken` da resposta para usar nos próximos comandos!**

Exemplo de resposta:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 4️⃣ Endpoints Protegidos (Requerem Token de Admin)

**Importante:** Substitua `SEU_TOKEN_AQUI` pelo token obtido no login!

### Criar Banner

```bash
curl -X POST http://localhost:3001/api/v1/banners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "SUPER PROMO",
    "subtitle": "Imperdível",
    "imageUrl": "https://via.placeholder.com/800x300",
    "backgroundColor": "#FF0000",
    "order": 5,
    "active": true
  }'
```

### Atualizar Banner

```bash
curl -X PUT http://localhost:3001/api/v1/banners/BANNER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "SUPER PROMO - ATUALIZADO",
    "subtitle": "Agora com desconto maior"
  }'
```

### Ativar/Desativar Banner

```bash
curl -X PATCH http://localhost:3001/api/v1/banners/BANNER_ID/toggle \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Deletar Banner

```bash
curl -X DELETE http://localhost:3001/api/v1/banners/BANNER_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Reordenar Banners

```bash
curl -X PATCH http://localhost:3001/api/v1/banners/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "banners": [
      { "id": "BANNER_ID_1", "order": 1 },
      { "id": "BANNER_ID_2", "order": 2 },
      { "id": "BANNER_ID_3", "order": 3 }
    ]
  }'
```

### Criar Categoria

```bash
curl -X POST http://localhost:3001/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Nova Categoria",
    "slug": "nova-categoria",
    "icon": "star",
    "description": "Categoria de teste",
    "order": 6,
    "active": true
  }'
```

### Atualizar Categoria

```bash
curl -X PUT http://localhost:3001/api/v1/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Categoria Atualizada",
    "description": "Nova descrição"
  }'
```

### Ativar/Desativar Categoria

```bash
curl -X PATCH http://localhost:3001/api/v1/categories/CATEGORY_ID/toggle \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Deletar Categoria

```bash
curl -X DELETE http://localhost:3001/api/v1/categories/CATEGORY_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 5️⃣ Credenciais de Teste

Você pode fazer login com qualquer uma dessas contas criadas pelo seed:

### Admin Master (acesso total)
```
Email: admin@clubenavi.com
Senha: admin123456
```

### Admin Client (admin específico do whitelabel)
```
Email: admin.client@clubenavi.com
Senha: client123456
```

### Usuário Normal
```
Email: user@clubenavi.com
Senha: user123456
```

### Lojista
```
Email: lojista@clubenavi.com
Senha: merchant123456
```

---

## 6️⃣ Testar com Postman ou Insomnia

### Importar no Postman:

1. Abra o Postman
2. Clique em "Import"
3. Cole a URL: `http://localhost:3001/api/v1`
4. Crie uma Collection chamada "Clube Navi API"
5. Adicione as requisições acima

### Configurar Token no Postman:

1. Na Collection, vá em "Authorization"
2. Escolha "Bearer Token"
3. Cole o token obtido no login
4. Todas as requisições da collection herdarão o token

---

## 7️⃣ Testar Integração no Mobile App

No seu app React Native, você pode usar assim:

```typescript
// Buscar banners
const response = await fetch('http://localhost:3001/api/v1/banners');
const data = await response.json();
console.log('Banners:', data.data);

// Buscar categorias
const categoriesResponse = await fetch('http://localhost:3001/api/v1/categories');
const categories = await categoriesResponse.json();
console.log('Categorias:', categories.data);

// Fazer login
const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@clubenavi.com',
    password: 'user123456',
  }),
});
const loginData = await loginResponse.json();
const token = loginData.data.tokens.accessToken;
```

---

## 8️⃣ Endpoints Disponíveis

### Autenticação (`/api/v1/auth`)
- ✅ `POST /register` - Registrar novo usuário
- ✅ `POST /login` - Fazer login
- ✅ `POST /refresh` - Renovar token
- ✅ `POST /logout` - Fazer logout
- ✅ `POST /forgot-password` - Solicitar reset de senha
- ✅ `POST /reset-password` - Redefinir senha

### Banners (`/api/v1/banners`)
- ✅ `GET /` - Listar banners (público)
- ✅ `GET /:id` - Buscar por ID (público)
- ✅ `POST /` - Criar (admin)
- ✅ `PUT /:id` - Atualizar (admin)
- ✅ `DELETE /:id` - Deletar (admin)
- ✅ `PATCH /:id/toggle` - Ativar/desativar (admin)
- ✅ `PATCH /reorder` - Reordenar (admin)

### Categorias (`/api/v1/categories`)
- ✅ `GET /` - Listar categorias (público)
- ✅ `GET /:id` - Buscar por ID (público)
- ✅ `GET /slug/:slug` - Buscar por slug (público)
- ✅ `POST /` - Criar (admin)
- ✅ `PUT /:id` - Atualizar (admin)
- ✅ `DELETE /:id` - Deletar (admin)
- ✅ `PATCH /:id/toggle` - Ativar/desativar (admin)
- ✅ `PATCH /reorder` - Reordenar (admin)

### Usuários (`/api/v1/users`)
- ✅ Listar, criar, atualizar, deletar usuários

### Produtos (`/api/v1/products`)
- ✅ Listar, criar, atualizar, deletar produtos

### Merchants (`/api/v1/merchants`)
- ✅ Listar, criar, atualizar, deletar lojistas

### Transações (`/api/v1/transactions`)
- ✅ Listar, criar transações

### Wallets (`/api/v1/wallets`)
- ✅ Listar, criar carteiras

### Cashback (`/api/v1/cashback`)
- ✅ Listar, processar cashback

---

## 📊 Visualizar Banco de Dados

Para visualizar os dados no banco PostgreSQL:

```bash
# Via Prisma Studio (interface visual)
npm run prisma:studio --workspace=@clube-navi/api

# Via psql (linha de comando)
psql -U clube_navi_user -d clube_navi
```

---

## 🐛 Debug e Logs

O servidor exibe logs coloridos no terminal onde está rodando.
Acompanhe as requisições em tempo real para debug.

---

## ✅ Checklist de Testes

- [ ] Health check está funcionando
- [ ] Login com admin retorna token
- [ ] Banners são listados corretamente
- [ ] Categorias são listadas corretamente
- [ ] Criar banner com token de admin funciona
- [ ] Atualizar banner funciona
- [ ] Toggle banner funciona
- [ ] Deletar banner funciona
- [ ] Criar categoria com token funciona
- [ ] Endpoints sem token retornam erro 401
- [ ] Endpoints com token de usuário normal retornam erro 403

---

## 🔗 Links Úteis

- API Base URL: http://localhost:3001/api/v1
- Health Check: http://localhost:3001/health
- Prisma Studio: http://localhost:5555 (após rodar `npm run prisma:studio`)

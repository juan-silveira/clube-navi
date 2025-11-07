# Super Admin Authentication System

## Overview

O sistema agora possui autenticação completa para Super Admins (administradores do sistema) separada da autenticação de tenant admins e usuários finais.

## Credenciais de Acesso

### Super Admin (Acesso ao Sistema Completo)
- **URL**: http://localhost:3033/login
- **Email**: admin@clubedigital.com
- **Password**: Admin@2025
- **Tipo**: Super Admin (acesso a todos os tenants)

### Tenant Admin (Acesso ao Tenant Específico)
- **URL**: http://localhost:3033/login
- **Email**: admin@clube-navi.com
- **Password**: Admin@2025
- **Tipo**: Tenant Admin (acesso apenas ao clube-navi)

## Arquitetura

### Hierarquia de Usuários

```
┌─────────────────────────────────────────┐
│         Super Admin                      │
│  - Gerencia todos os tenants             │
│  - Acesso ao banco master                │
│  - Não pertence a nenhum tenant          │
│  - Email: @clubedigital.com              │
└─────────────────────────────────────────┘
                  │
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│  Tenant Admin  │  │  Tenant Admin  │
│  (clube-navi)  │  │  (outro-tenant)│
│                │  │                │
│  - Gerencia    │  │  - Gerencia    │
│    apenas seu  │  │    apenas seu  │
│    tenant      │  │    tenant      │
└────────────────┘  └────────────────┘
        │                   │
        │                   │
   ┌────┴────┐         ┌────┴────┐
   │ Usuário │         │ Usuário │
   │ Final   │         │ Final   │
   └─────────┘         └─────────┘
```

### Bancos de Dados

**Master Database** (`clube_digital_master`)
- `super_admins` - Super administradores do sistema
- `tenants` - Todos os tenants/empresas
- `club_admins` - Administradores de cada tenant

**Tenant Databases** (`clube_digital_<slug>`)
- `users` - Usuários finais (consumidores/comerciantes)
- `transactions` - Transações do tenant
- `products` - Produtos do tenant
- etc.

## Implementação Backend

### Endpoints de Autenticação

#### Super Admin Auth
- `POST /api/super-admin-auth/login` - Login de super admin
- `GET /api/super-admin-auth/me` - Obter perfil do super admin
- `POST /api/super-admin-auth/logout` - Logout de super admin

#### Tenant Admin Auth (futuro)
- `POST /api/tenant-admin/login` - Login de tenant admin
- `GET /api/tenant-admin/me` - Obter perfil do tenant admin
- `POST /api/tenant-admin/logout` - Logout de tenant admin

### Arquivos Backend

**Controller**: `/apps/api/src/controllers/superAdminAuth.controller.js`
```javascript
- login() - Valida credenciais e gera JWT token
- getProfile() - Retorna dados do super admin autenticado
- logout() - Invalida sessão
```

**Routes**: `/apps/api/src/routes/superAdminAuth.routes.js`
```javascript
- Define rotas de autenticação
- Aplica rate limiting
```

**JWT Token Structure**:
```json
{
  "adminId": "uuid",
  "email": "admin@clubedigital.com",
  "type": "super-admin",
  "permissions": {},
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Implementação Frontend

### Arquivos Modificados

1. **`/apps/admin/frontend/services/api.js`**
   - Atualizado `authService.login` para chamar endpoint correto
   - Adicionado request interceptor para bloquear chamadas desnecessárias
   - Atualizado refresh token logic para pular super admins

2. **`/apps/admin/frontend/contexts/CompanyContext.js`**
   - Detecta super admin e pula carregamento de empresa
   - Define empresa mock para super admin

3. **`/apps/admin/frontend/hooks/useTokenValidation.js`**
   - Super admins pulam validação de token

4. **`/apps/admin/frontend/components/AuthGuard.jsx`**
   - Super admins pulam verificação de email

### Request Interceptor

O interceptor bloqueia automaticamente as seguintes chamadas para super admins:

```javascript
const blockedEndpoints = [
  '/api/whitelabel/user/current-company',  // Não tem empresa
  '/api/profile/photo',                     // Não tem foto de perfil
  '/api/notifications/unread-count',        // Não tem notificações
  '/api/notifications/unread',              // Não tem notificações
  '/api/notifications/preferences',         // Não tem preferências
  '/api/auth/me'                            // Usa endpoint próprio
];
```

Para cada endpoint bloqueado, retorna imediatamente uma resposta mock:
```javascript
{
  data: { success: true, data: null },
  status: 200,
  statusText: 'OK'
}
```

### Detecção de Super Admin

O sistema detecta super admins verificando o domínio do email:

```javascript
const isSuperAdmin = user?.email?.includes('@clubedigital.com');
```

## Fluxo de Login

### 1. Usuário acessa http://localhost:3033/login

### 2. Insere credenciais:
- Email: admin@clubedigital.com
- Password: Admin@2025

### 3. Frontend envia POST para `/api/super-admin-auth/login`

### 4. Backend valida:
```javascript
- Busca super admin no banco master
- Verifica se está ativo
- Compara senha (bcrypt)
- Gera JWT token (24h de validade)
- Retorna token + dados do admin
```

### 5. Frontend recebe resposta:
```javascript
{
  success: true,
  data: {
    token: "eyJhbGciOiJIUzI1NiIs...",
    admin: {
      id: "uuid",
      name: "Super Admin",
      email: "admin@clubedigital.com",
      permissions: {}
    }
  }
}
```

### 6. Frontend armazena no Zustand:
```javascript
useAuthStore.setState({
  user: admin,
  accessToken: token,
  refreshToken: token,
  isAuthenticated: true
})
```

### 7. Redireciona para dashboard

### 8. Request interceptor bloqueia chamadas desnecessárias

### 9. Super admin acessa dashboard sem erros

## Diferenças entre Super Admin e Tenant Admin

| Aspecto | Super Admin | Tenant Admin |
|---------|-------------|--------------|
| Banco de dados | Master | Master (registro) + Tenant (operações) |
| Email | @clubedigital.com | @dominio-tenant.com |
| Empresa/Tenant | Nenhum (acesso a todos) | Vinculado a 1 tenant |
| Endpoints | /api/super-admin-auth/* | /api/tenant-admin/* |
| Whitelabel | Não aplica | Aplica branding do tenant |
| Notificações | Não tem | Tem notificações do tenant |
| Foto de perfil | Não tem | Tem foto no S3 |
| Token refresh | Usa mesmo token (24h) | Tem refresh token (7d) |
| Email confirmation | Não precisa | Precisa confirmar email |

## Próximos Passos

### Melhorias Recomendadas

1. **Dashboard Customizado**
   - Criar dashboard específico para super admin
   - Mostrar lista de todos os tenants
   - Permitir acessar/gerenciar cada tenant

2. **Refresh Token**
   - Implementar refresh token próprio para super admin
   - Atualmente usa mesmo token como access e refresh

3. **Permissões Granulares**
   - Definir permissões específicas (ex: gerenciar tenants, gerenciar super admins, etc.)
   - Implementar middleware de autorização

4. **Logs de Auditoria**
   - Registrar todas as ações de super admin
   - Criar tabela de audit_logs no master

5. **2FA para Super Admin**
   - Implementar autenticação de dois fatores obrigatória
   - Maior segurança para conta crítica

6. **Session Management**
   - Controlar sessões ativas
   - Permitir revogar sessões

## Testes

### Teste de Login via cURL

```bash
curl -X POST http://localhost:8033/api/super-admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clubedigital.com",
    "password": "Admin@2025"
  }'
```

### Teste de Profile via cURL

```bash
TOKEN="seu-token-aqui"

curl -X GET http://localhost:8033/api/super-admin-auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Teste via Frontend

1. Acessar http://localhost:3033/login
2. Inserir email: admin@clubedigital.com
3. Inserir senha: Admin@2025
4. Clicar em "Login"
5. Verificar redirecionamento para dashboard
6. Abrir DevTools Console
7. Não deve aparecer erros 500 de whitelabel/notifications/profile
8. Deve mostrar "Super admin - endpoint bloqueado" para requests interceptadas

## Troubleshooting

### Problema: "Credenciais inválidas"
**Solução**: Verificar se o super admin existe no banco:
```sql
SELECT * FROM super_admins WHERE email = 'admin@clubedigital.com';
```

### Problema: "Email confirmation required"
**Solução**: Verificar se AuthGuard.jsx está detectando super admin corretamente

### Problema: Erros 500 após login
**Solução**: Verificar se request interceptor está ativo em api.js

### Problema: Token expira muito rápido
**Solução**: Ajustar tempo de expiração em `superAdminAuth.controller.js`:
```javascript
jwt.sign({...}, secret, { expiresIn: '24h' })
```

## Segurança

### Práticas Implementadas

1. **Bcrypt para senhas**: Salt rounds = 10
2. **JWT com secret seguro**: 64 caracteres hex
3. **Rate limiting**: 5 tentativas por 15 minutos
4. **Token expiration**: 24 horas
5. **HTTPS obrigatório em produção**
6. **Validação de email domain**: @clubedigital.com

### Recomendações Adicionais

1. Implementar 2FA obrigatório para super admin
2. Registrar todos os acessos em audit log
3. Implementar IP whitelist para super admin
4. Usar tokens de curta duração (1h) com refresh
5. Implementar bloqueio após tentativas falhas
6. Notificar por email sobre login de super admin
7. Usar HTTPS sempre (nunca HTTP em produção)

## Variáveis de Ambiente

As seguintes variáveis devem estar configuradas no `.env`:

```bash
# JWT
JWT_SECRET=1dbe2489ad1e57530b103d71d7007ad3...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
MASTER_DATABASE_URL=postgresql://clube_digital_user:clube_digital_password@localhost:5432/clube_digital_master?schema=public

# API
API_URL=http://localhost:8033
PORT=8033

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8033
```

## Documentação Adicional

- **CREDENCIAIS_ADMIN.md**: Todas as credenciais de acesso
- **README.md**: Documentação geral do projeto
- **docs/AUTHENTICATION.md**: Fluxo de autenticação detalhado
- **docs/MULTI_TENANT.md**: Arquitetura multi-tenant

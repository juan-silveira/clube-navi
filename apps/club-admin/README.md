# Club Admin Frontend

Aplicação web para administração de clubes individuais. Cada clube acessa através de seu próprio subdomínio.

## Arquitetura

### Multi-Tenant com Subdomínios

```
clube-navi.clubedigital.com.br    → Clube Navi Admin Panel
clube-teste.clubedigital.com.br   → Clube Teste Admin Panel
clube-xyz.clubedigital.com.br     → Clube XYZ Admin Panel
```

### Fluxo de Detecção de Clube

1. **Usuário acessa** `clube-navi.clubedigital.com.br`
2. **Frontend detecta** subdomain via `utils/subdomain.js`
3. **ClubContext** carrega dados do clube via API
4. **Branding dinâmico** é aplicado (logo, cores, nome)
5. **API requests** incluem header `X-Club-Slug: clube-navi`
6. **Backend middleware** `resolveClubMiddleware` identifica o clube
7. **Backend conecta** ao banco de dados específico do clube
8. **Dados isolados** - cada clube só vê seus próprios dados

## Estrutura do Projeto

```
apps/club-admin/frontend/
├── app/
│   ├── layout.jsx              # Layout raiz com ClubProvider
│   ├── page.jsx                # Homepage (redireciona para /auth ou /dashboard)
│   ├── globals.css             # Estilos globais com CSS variables para branding
│   ├── auth/
│   │   └── login/
│   │       └── page.jsx        # Tela de login com branding do clube
│   └── (dashboard)/
│       ├── dashboard/
│       │   └── page.jsx        # Dashboard principal
│       ├── users/
│       │   └── page.jsx        # Listagem de usuários
│       └── transactions/
│           └── page.jsx        # Listagem de transações
├── contexts/
│   └── ClubContext.jsx         # Context para dados do clube e branding
├── services/
│   └── api.js                  # Serviços de API com interceptors
├── store/
│   └── authStore.js            # Zustand store para autenticação
├── utils/
│   └── subdomain.js            # Funções de detecção de subdomínio
├── package.json
├── next.config.js              # Configuração Next.js com rewrites
└── tailwind.config.js          # Tailwind com cores dinâmicas
```

## Instalação

```bash
cd apps/club-admin/frontend
npm install
```

## Desenvolvimento

### Modo Normal (sem subdomain)

```bash
npm run dev
```

Acesse: `http://localhost:3001`

**Importante**: Em desenvolvimento local sem subdomain, você precisa definir manualmente o slug do clube:

```javascript
// No console do navegador
localStorage.setItem('dev_club_slug', 'clube-navi');
```

Ou use o helper:

```javascript
import { setDevClubSlug } from '@/utils/subdomain';
setDevClubSlug('clube-navi');
```

### Modo com Subdomain Local

Para testar com subdomínios localmente, adicione ao `/etc/hosts`:

```
127.0.0.1  clube-navi.localhost
127.0.0.1  clube-teste.localhost
```

Acesse: `http://clube-navi.localhost:3001`

## Build e Produção

```bash
# Build
npm run build

# Start em produção
npm start
```

## Backend APIs

### Endpoints Públicos (sem autenticação)

- `POST /api/club-admin/auth/login` - Login de club admin
- `GET /api/club-admin/club-info` - Informações do clube (para branding)

### Endpoints Protegidos (requerem autenticação)

**Autenticação:**
- `GET /api/club-admin/auth/me` - Dados do admin autenticado
- `POST /api/club-admin/auth/logout` - Logout
- `PUT /api/club-admin/auth/password` - Atualizar senha

**Clube:**
- `GET /api/club-admin/club-stats` - Estatísticas do clube
- `PUT /api/club-admin/club-settings` - Atualizar configurações

**Usuários:**
- `GET /api/club-admin/users` - Listar usuários
- `GET /api/club-admin/users/stats` - Estatísticas de usuários
- `GET /api/club-admin/users/:userId` - Detalhes de usuário
- `PATCH /api/club-admin/users/:userId/status` - Ativar/desativar usuário

**Transações:**
- `GET /api/club-admin/transactions` - Listar transações
- `GET /api/club-admin/transactions/stats` - Estatísticas de transações
- `GET /api/club-admin/transactions/:txId` - Detalhes de transação

## Autenticação

### Login

```javascript
import { authService } from '@/services/api';
import useAuthStore from '@/store/authStore';

const { login } = useAuthStore();

const response = await authService.login(email, password);
if (response.success) {
  login(response.data.admin, response.data.accessToken);
}
```

### Token JWT

O token é armazenado em:
- Zustand store (em memória)
- localStorage (`club_admin_token`)

E enviado automaticamente em todas as requisições via interceptor axios.

### Middleware Backend

```javascript
// authenticateClubAdmin verifica:
// 1. Token JWT válido
// 2. Tipo de token = 'club-admin'
// 3. Admin existe e está ativo
// 4. Clube está ativo
```

## Branding Dinâmico

### Como Funciona

1. `ClubContext` carrega dados do clube ao montar
2. Extrai `branding` object do clube
3. Aplica cores CSS variables no `:root`
4. Componentes usam classes Tailwind que referenciam as variáveis

### Exemplo de Branding Object

```javascript
{
  logoUrl: "https://s3.../logo.png",
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  companyName: "Clube Navi"
}
```

### CSS Variables Aplicadas

```css
:root {
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --secondary-500: #64748b;
}
```

### Uso nos Componentes

```jsx
<button className="bg-primary-500 hover:bg-primary-600">
  Botão com cor do clube
</button>
```

## Segurança

### Isolamento de Dados

- Cada clube tem seu próprio banco de dados
- Backend middleware `resolveClubMiddleware` identifica clube por subdomain
- `req.clubPrisma` conecta apenas ao DB do clube específico
- Impossível acessar dados de outro clube

### Autenticação

- JWT tokens com tipo `club-admin`
- Middleware valida que admin pertence ao clube
- Roles: `viewer`, `editor`, `admin`, `owner`

### Headers

Todas as requisições incluem:
- `Authorization: Bearer <token>`
- `X-Club-Slug: <slug>` - Para identificação do clube

## Desenvolvimento Local

### Testar com Múltiplos Clubes

1. Adicione clubes no super admin ou via script
2. Configure `/etc/hosts` com subdomínios locais
3. Acesse cada subdomain em abas diferentes
4. Veja branding diferente em cada aba

### Debug

```javascript
// Ver dados do clube
import { useClub } from '@/contexts/ClubContext';
const { club, branding } = useClub();
console.log(club, branding);

// Ver slug detectado
import { getClubSlugFromHostname } from '@/utils/subdomain';
console.log('Slug:', getClubSlugFromHostname());
```

## Próximos Passos

- [ ] Implementar dashboard completo
- [ ] Adicionar páginas de usuários, transações, produtos
- [ ] Implementar gerenciamento de grupos
- [ ] Adicionar relatórios e analytics
- [ ] Implementar configurações do clube
- [ ] Adicionar gestão de permissões por role
- [ ] Implementar upload de logo personalizado

## Relacionado

- **Super Admin**: `apps/admin/frontend/` - Gerencia todos os clubes
- **Backend API**: `apps/api/` - API com multi-tenant
- **Mobile App**: `apps/mobile/` - App para usuários finais

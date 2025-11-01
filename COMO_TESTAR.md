# 🧪 Como Testar o Clube Navi - Guia Completo

## 🚀 Serviços Rodando

Você tem 3 serviços rodando simultaneamente:

| Serviço | URL | Status |
|---------|-----|--------|
| 🔧 **Backend API** | http://localhost:3001 | ✅ Rodando |
| 💻 **Admin Web** | http://localhost:3000 | ✅ Rodando |
| 📱 **Mobile App** | Expo Metro (porta 8081) | ✅ Rodando |

---

## 1️⃣ TESTAR NO NAVEGADOR (Admin Web)

### Passo a Passo:

1. **Abra seu navegador**
2. **Acesse**: http://localhost:3000
3. **Faça login com**:
   ```
   Email: admin@clubenavi.com
   Senha: admin123456
   ```

### O que você deve ver:

- ✅ Tela de login do admin
- ✅ Após login: Dashboard do admin
- ✅ Menu lateral com opções (Banners, Categorias, Usuários, etc.)

### Testar Funcionalidades:

- [ ] Listar banners existentes
- [ ] Criar novo banner
- [ ] Editar banner
- [ ] Deletar banner
- [ ] Listar categorias
- [ ] Criar nova categoria
- [ ] Ver usuários cadastrados

---

## 2️⃣ TESTAR NO CELULAR/EMULADOR (Mobile App)

### Se estiver usando Expo Go:

1. **Abra o app Expo Go no seu celular**
2. **Escaneie o QR code** que aparece no terminal
3. **Aguarde o app carregar**
4. **Na tela de login, use**:
   ```
   Email: user@clubenavi.com
   Senha: user123456
   ```

### Se estiver usando emulador Android:

1. **O app já deve estar aberto** no emulador
2. **Na tela de login, digite**:
   ```
   Email: user@clubenavi.com
   Senha: user123456
   ```

### O que você deve ver:

- ✅ Tela de login
- ✅ Após login: Home com banners carrossel
- ✅ Categorias de produtos
- ✅ Tabs de navegação (Home, Carteira, Perfil)

### Testar Funcionalidades:

- [ ] Fazer login
- [ ] Ver banners na home (devem aparecer os 4 banners)
- [ ] Ver categorias
- [ ] Navegar entre tabs
- [ ] Ver perfil do usuário
- [ ] Fazer logout

---

## 3️⃣ TESTAR API DIRETAMENTE (Terminal/Postman)

### Testes Rápidos no Terminal:

```bash
# 1. Health Check
curl http://localhost:3001/health

# 2. Listar Banners
curl http://localhost:3001/api/v1/banners

# 3. Listar Categorias
curl http://localhost:3001/api/v1/categories

# 4. Fazer Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clubenavi.com","password":"admin123456"}'
```

---

## 🔍 VERIFICAR SE ESTÁ TUDO FUNCIONANDO

### Checklist Completo:

#### Backend API:
- [ ] http://localhost:3001/health responde "ok"
- [ ] http://localhost:3001/api/v1/banners retorna 4 banners
- [ ] http://localhost:3001/api/v1/categories retorna 5 categorias
- [ ] Login retorna token JWT

#### Admin Web:
- [ ] http://localhost:3000 abre a página
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Banners são listados
- [ ] Categorias são listadas

#### Mobile App:
- [ ] App abre sem crash
- [ ] Tela de login aparece
- [ ] Login funciona
- [ ] Home carrega com banners
- [ ] Navegação entre tabs funciona

---

## 📊 VER DADOS NO BANCO

### Opção 1: Prisma Studio (Visual)

```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi/apps/api
npm run prisma:studio
```

Abre em: http://localhost:5555

### Opção 2: psql (Terminal)

```bash
psql -U clube_navi_user -d clube_navi
```

Comandos úteis:
```sql
-- Ver todos os banners
SELECT id, title, subtitle, "order" FROM banners ORDER BY "order";

-- Ver todas as categorias
SELECT id, name, slug, "order" FROM categories ORDER BY "order";

-- Ver todos os usuários
SELECT id, email, name, type FROM users;

-- Ver transações
SELECT id, type, amount, status FROM transactions;
```

---

## 🐛 PROBLEMAS COMUNS

### Mobile não conecta na API:

**Problema**: App mobile não consegue acessar http://localhost:3001

**Solução Android**: Use o IP da sua máquina ao invés de localhost
```typescript
// No código do mobile, troque:
const API_URL = 'http://localhost:3001/api/v1';
// Por:
const API_URL = 'http://SEU_IP_LOCAL:3001/api/v1';
// Exemplo: http://192.168.1.100:3001/api/v1
```

**Descobrir seu IP local**:
```bash
# Linux/Mac
ip addr show | grep "inet " | grep -v 127.0.0.1

# Ou
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Admin Web não carrega:

**Verificar se está rodando**:
```bash
lsof -i :3000
```

**Reiniciar**:
```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi/apps/admin
npm run dev
```

### Backend API não responde:

**Verificar se está rodando**:
```bash
lsof -i :3001
```

**Reiniciar**:
```bash
cd /home/juan/Desktop/Projects/Navi/clube_navi/apps/api
npm run dev
```

---

## 🎯 PRÓXIMOS PASSOS

Após testar tudo, você pode:

1. **Criar novos endpoints** no backend
2. **Integrar banners do backend no mobile** (buscar da API ao invés de dados mockados)
3. **Criar páginas de admin** para gerenciar banners e categorias
4. **Implementar autenticação completa** no mobile
5. **Conectar carteira blockchain** (Azore Network)

---

## 📝 CREDENCIAIS DE TESTE

### Admin Master (acesso total):
```
Email: admin@clubenavi.com
Senha: admin123456
```

### Admin Client:
```
Email: admin.client@clubenavi.com
Senha: client123456
```

### Usuário Normal:
```
Email: user@clubenavi.com
Senha: user123456
```

### Lojista:
```
Email: lojista@clubenavi.com
Senha: merchant123456
```

---

## 🆘 PRECISA DE AJUDA?

- **Ver logs do backend**: O terminal onde rodou `npm run dev --workspace=@clube-navi/api`
- **Ver logs do mobile**: O terminal do Expo
- **Ver logs do admin**: O terminal onde rodou `npm run dev` no admin
- **Banco de dados**: Use Prisma Studio (http://localhost:5555)

---

## ✅ TUDO FUNCIONANDO?

Se todos os checkli sts acima passaram, você tem:

- ✅ Backend API completo com autenticação
- ✅ 13 endpoints funcionando (auth, banners, categories, etc.)
- ✅ Banco de dados populado com dados de teste
- ✅ Admin Web pronto para gerenciar o sistema
- ✅ Mobile App pronto para usuários finais

**Parabéns! Seu sistema está integrado e funcionando! 🎉**

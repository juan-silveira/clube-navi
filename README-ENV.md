# 🔐 Gerenciamento de Variáveis de Ambiente

Este projeto utiliza um sistema **híbrido** de gerenciamento de variáveis de ambiente que mantém a **segurança do backend** enquanto **elimina duplicação** de configurações compartilhadas.

## 📁 Estrutura de Arquivos

```
clube_digital/
├── .env                    # ✅ Backend (API) - credenciais sensíveis
├── .env.shared            # ✅ Variáveis compartilhadas (sincronizadas)
├── .env.example           # ✅ Template para novos desenvolvedores
├── apps/
│   ├── api/
│   │   └── (sem .env)     # ✅ Usa .env da raiz diretamente
│   ├── mobile/
│   │   └── .env           # 🤖 AUTO-GERADO (não editar!)
│   └── admin/frontend/
│       └── .env.local     # 🤖 AUTO-GERADO (não editar!)
```

## 🎯 Filosofia

### ✅ O que resolvemos:

1. **Zero duplicação**: Altere `DEFAULT_NETWORK` em um só lugar
2. **Segurança mantida**: Backend tem suas próprias credenciais
3. **Sincronização automática**: Frontends recebem apenas o necessário
4. **Prefixos corretos**: `EXPO_PUBLIC_*` para mobile, `NEXT_PUBLIC_*` para admin

### 🔒 Separação de Responsabilidades:

| Arquivo | O que contém | Quem usa |
|---------|--------------|----------|
| `.env` | Database, JWT, API keys, blockchain private keys | Backend (API) |
| `.env.shared` | URLs, rede padrão, exploradores | Todos (após sync) |
| `apps/mobile/.env` | Variáveis públicas do Expo | Mobile app |
| `apps/admin/.env.local` | Variáveis públicas do Next.js | Admin dashboard |

## 🚀 Como Usar

### 1️⃣ Primeiro Setup (novo dev)

```bash
# Copiar template
cp .env.example .env

# Preencher credenciais sensíveis no .env
# (Database, JWT secrets, etc.)

# Sincronizar variáveis compartilhadas
npm run sync:env
```

### 2️⃣ Alterar Configurações Compartilhadas

Quando quiser mudar `API_URL`, `DEFAULT_NETWORK`, etc:

```bash
# 1. Editar .env.shared (único lugar!)
nano .env.shared

# 2. Sincronizar para mobile e admin
npm run sync:env
```

**Exemplo**: Mudar de testnet para mainnet

```diff
# .env.shared
-DEFAULT_NETWORK=testnet
+DEFAULT_NETWORK=mainnet
```

```bash
npm run sync:env
```

✅ Agora todos os apps usam mainnet automaticamente!

### 3️⃣ Adicionar Nova Variável Compartilhada

```javascript
// 1. Adicionar no .env.shared
NOVA_VARIAVEL=valor

// 2. Atualizar script (scripts/sync-env.js)
const SHARED_VARS = {
  API_URL: true,
  DEFAULT_NETWORK: true,
  MAINNET_EXPLORER_URL: true,
  TESTNET_EXPLORER_URL: true,
  NOVA_VARIAVEL: true,  // ← Adicionar aqui
};

// 3. Sincronizar
npm run sync:env
```

### 4️⃣ Variáveis Locais (Específicas de cada App)

Se um app precisa de uma variável **só dele**:

#### Mobile:
```bash
# Editar apps/mobile/.env
# Adicionar ABAIXO da seção "VARIÁVEIS LOCAIS"

# ============================================
# VARIÁVEIS LOCAIS (Não sincronizadas)
# ============================================
EXPO_PUBLIC_MINHA_VAR_LOCAL=valor
```

#### Admin:
```bash
# Editar apps/admin/frontend/.env.local
# Adicionar ABAIXO da seção "VARIÁVEIS LOCAIS"

NEXT_PUBLIC_MINHA_VAR_ADMIN=valor
```

⚠️ **Importante**: Variáveis locais são preservadas durante `npm run sync:env`

## 📋 Variáveis Atualmente Compartilhadas

- `API_URL` - URL do backend
- `DEFAULT_NETWORK` - testnet ou mainnet
- `MAINNET_EXPLORER_URL` - Azorescan mainnet
- `TESTNET_EXPLORER_URL` - Azorescan testnet

## 🔐 Segurança

### ✅ O que NÃO é exposto aos frontends:

- `DATABASE_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `ENCRYPTION_KEY`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `EFI_CLIENT_ID`, `EFI_CLIENT_SECRET`
- Qualquer outra credencial sensível

### ⚠️ O que É exposto (com prefixos):

Mobile recebe: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_DEFAULT_NETWORK`, etc.
Admin recebe: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DEFAULT_NETWORK`, etc.

Esses valores são **embedados no bundle** durante o build, então devem ser apenas configurações públicas.

## 🛠️ Comandos Úteis

```bash
# Sincronizar variáveis
npm run sync:env

# Verificar variáveis atuais
cat .env.shared

# Ver logs de sincronização
npm run sync:env

# Restaurar backup (se necessário)
cp .env.backup/api.env.backup apps/api/.env
```

## 🤔 FAQ

### Por que não um único .env para tudo?

Expo e Next.js só expõem variáveis com prefixos específicos (`EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`). Se colocássemos tudo em um arquivo, teríamos risco de expor credenciais sensíveis acidentalmente.

### Posso ainda usar .env local no mobile/admin?

Sim! Variáveis locais são preservadas. Apenas as compartilhadas são sobrescritas.

### O que acontece se eu editar apps/mobile/.env diretamente?

Suas edições nas variáveis compartilhadas serão **sobrescritas** no próximo `npm run sync:env`. Edite apenas variáveis na seção "VARIÁVEIS LOCAIS".

### Preciso rodar sync:env sempre?

Apenas quando alterar `.env.shared`. Durante desenvolvimento, só rodar uma vez é suficiente.

### Como funciona em CI/CD?

1. Configure `.env` com credenciais de produção no servidor
2. Configure `.env.shared` com URLs de produção
3. Execute `npm run sync:env` antes do build
4. Build e deploy normalmente

## 📞 Problemas?

Se algo não funcionar:

1. Verificar se `.env.shared` existe na raiz
2. Executar `npm run sync:env`
3. Verificar se prefixos estão corretos (`EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`)
4. Checar backup em `.env.backup/` se precisar restaurar

## 🎉 Benefícios Finais

✅ Uma única fonte de verdade para configs compartilhadas
✅ Backend com credenciais isoladas e seguras
✅ Sincronização automática para frontends
✅ Zero duplicação de código
✅ Fácil onboarding de novos devs
✅ Suporte a variáveis locais quando necessário

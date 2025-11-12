# Separação de Responsabilidades - Branding Multi-Tenant

## 🎯 Estratégia: White-Label com Conta Única

### Arquitetura:
- **1 codebase** → **N apps** (um por tenant)
- **1 conta de desenvolvedor** → Publica todos os apps
- **Bundle ID único** por tenant: `com.clubenavi.{tenant-slug}`

### Exemplo:
```
Clube Force  → com.clubenavi.force  → "Clube Force" na loja
Clube Azore  → com.clubenavi.azore  → "Clube Azore" na loja
Clube XYZ    → com.clubenavi.xyz    → "Clube XYZ" na loja
```

---

## 🔐 ADMIN (Super-Admin) - Configuração de App por Tenant

### O que o Admin gerencia:
Dados que vão para o **build** e requerem atualização na loja.

#### Campos:
- ✅ **Nome do App** - "Clube Force"
- ✅ **Slug do Tenant** - "force" (usado no bundle ID)
- ✅ **Ícone do App** - 1024x1024 (vários tamanhos gerados)
- ✅ **Splash Screen** - Imagens nativas
- ✅ **Descrição para Lojas** - Texto nas stores
- ✅ **URL Scheme** - `clubeforce://`
- ✅ **Versão Publicada** - 1.0.0, 1.0.1, etc.

### Tabela no Master DB:
```sql
-- apps/api/prisma/master/schema.prisma
model ClubAppConfig {
  id        String   @id @default(uuid()) @db.Uuid
  clubId    String   @unique @map("club_id") @db.Uuid
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)

  // Dados do app (build)
  appName          String   @map("app_name") @db.VarChar(100)        // "Clube Force"
  tenantSlug       String   @unique @map("tenant_slug") @db.VarChar(50) // "force"
  appDescription   String?  @map("app_description") @db.Text

  // Bundle identifiers (únicos por tenant)
  bundleId         String   @unique @map("bundle_id") @db.VarChar(100)    // "com.clubenavi.force"
  packageName      String   @unique @map("package_name") @db.VarChar(100) // "com.clubenavi.force"
  urlScheme        String   @unique @map("url_scheme") @db.VarChar(50)    // "clubeforce"

  // Assets para build (URLs fixas no S3)
  appIconUrl       String   @map("app_icon_url") @db.VarChar(500)     // Ícone da home
  splashScreenUrl  String   @map("splash_screen_url") @db.VarChar(500) // Splash nativo

  // Versões publicadas
  currentVersion   String   @map("current_version") @db.VarChar(20)   // "1.0.0"
  iosBuildNumber   Int      @default(1) @map("ios_build_number")      // 1, 2, 3...
  androidBuildNumber Int    @default(1) @map("android_build_number")  // 1, 2, 3...

  // Status nas lojas
  appStoreStatus   AppStoreStatus @default(DRAFT) @map("app_store_status")
  playStoreStatus  AppStoreStatus @default(DRAFT) @map("play_store_status")

  // Build automation
  autoBuildEnabled Boolean  @default(false) @map("auto_build_enabled") // Se deve incluir em builds em massa

  // Timestamps
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)
  publishedAt    DateTime? @map("published_at") @db.Timestamptz(6)

  @@map("club_app_configs")
}

enum AppStoreStatus {
  DRAFT            // Ainda não publicado
  PENDING_REVIEW   // Enviado para revisão
  IN_REVIEW        // Em análise pela loja
  REJECTED         // Rejeitado
  PUBLISHED        // Publicado e ativo
  REMOVED          // Removido da loja

  @@map("app_store_status")
}
```

---

## ✅ CLUB-ADMIN (Multi-tenant) - Personalização OTA

### O que o Club-Admin gerencia:
Dados que são **carregados via API** no app e não requerem atualização na loja.

#### Campos:
- ✅ Cores do tema (primary, secondary, accent)
- ✅ Logos internos (header, menu, footer)
- ✅ Banners promocionais
- ✅ Textos e mensagens
- ✅ Links de suporte
- ✅ Feature flags

### Tabela no Tenant DB:
```sql
-- apps/api/prisma/tenant/schema.prisma
model ClubBranding {
  id        String   @id @default(uuid()) @db.Uuid

  // Cores do tema (atualização via OTA)
  primaryColor     String @default("#3B82F6") @map("primary_color") @db.VarChar(7)
  secondaryColor   String @default("#10B981") @map("secondary_color") @db.VarChar(7)
  accentColor      String @default("#F59E0B") @map("accent_color") @db.VarChar(7)
  backgroundColor  String @default("#FFFFFF") @map("background_color") @db.VarChar(7)
  textColor        String @default("#1A1A1A") @map("text_color") @db.VarChar(7)

  // Logos internos (URLs fixas no S3)
  logoHeaderUrl    String? @map("logo_header_url") @db.VarChar(500)
  logoMenuUrl      String? @map("logo_menu_url") @db.VarChar(500)
  logoFooterUrl    String? @map("logo_footer_url") @db.VarChar(500)

  // Banners (URLs fixas no S3)
  bannerHomeUrl    String? @map("banner_home_url") @db.VarChar(500)
  bannerPromoUrl   String? @map("banner_promo_url") @db.VarChar(500)

  // Textos personalizados
  welcomeMessage   String? @map("welcome_message") @db.Text
  aboutUs          String? @map("about_us") @db.Text

  // Links
  termsUrl         String? @map("terms_url") @db.VarChar(500)
  privacyUrl       String? @map("privacy_url") @db.VarChar(500)
  supportEmail     String? @map("support_email") @db.VarChar(100)
  supportPhone     String? @map("support_phone") @db.VarChar(20)
  websiteUrl       String? @map("website_url") @db.VarChar(500)

  // Timestamps
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@map("club_branding")
}
```

---

## 🗄️ Sistema de Armazenamento S3 - URLs Fixas

### Estrutura no S3:
```
s3://clube-navi-assets/
  ├── tenants/
  │   ├── force/                    # Clube Force
  │   │   ├── build/                # Assets para BUILD (admin)
  │   │   │   ├── app-icon.png      # 1024x1024 - Ícone da loja
  │   │   │   └── splash.png        # Splash screen nativo
  │   │   └── runtime/              # Assets para RUNTIME (club-admin)
  │   │       ├── logo-header.png   # Logo no app
  │   │       ├── logo-menu.png
  │   │       ├── banner-home.jpg
  │   │       └── banner-promo.jpg
  │   ├── azore/
  │   │   ├── build/
  │   │   └── runtime/
  │   └── xyz/
  │       ├── build/
  │       └── runtime/
```

### URLs Públicas (CloudFront):
```
# Assets de BUILD (gerenciados pelo admin)
https://cdn.clubenavi.com/tenants/force/build/app-icon.png
https://cdn.clubenavi.com/tenants/force/build/splash.png

# Assets de RUNTIME (gerenciados pelo club-admin)
https://cdn.clubenavi.com/tenants/force/runtime/logo-header.png
https://cdn.clubenavi.com/tenants/force/runtime/banner-home.jpg
```

### Backend - Upload com Nome Fixo:
```javascript
// apps/api/src/services/s3.service.js
const uploadAsset = async (file, tenantSlug, assetType, fileName) => {
  // assetType: 'build' ou 'runtime'
  const key = `tenants/${tenantSlug}/${assetType}/${fileName}`;

  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000' // 1 ano (URL fixa)
  });

  return `https://cdn.clubenavi.com/${key}`;
};

// Exemplo: Upload de ícone do app (admin)
const iconUrl = await uploadAsset(
  iconFile,
  'force',
  'build',
  'app-icon.png'
);
// Retorna: https://cdn.clubenavi.com/tenants/force/build/app-icon.png

// Exemplo: Upload de banner (club-admin)
const bannerUrl = await uploadAsset(
  bannerFile,
  'force',
  'runtime',
  'banner-home.jpg'
);
// Retorna: https://cdn.clubenavi.com/tenants/force/runtime/banner-home.jpg
```

---

## 🚀 Sistema de Build Coordenado

### 1. Ambiente do Projeto Mobile
```
/apps/mobile/
  ├── src/                    # Código fonte compartilhado
  ├── app.json               # Config base Expo
  ├── app.config.js          # Config dinâmica
  ├── build-config/          # Configurações por tenant
  │   ├── force.json
  │   ├── azore.json
  │   └── xyz.json
  └── scripts/
      ├── build-single.sh    # Build de um tenant
      ├── build-all.sh       # Build de todos
      └── publish-all.sh     # Publica todos
```

### 2. Configuração Dinâmica (app.config.js)
```javascript
// apps/mobile/app.config.js
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  // Lê o tenant do env ou arquivo
  const tenant = process.env.TENANT_SLUG || 'default';
  const tenantConfigPath = path.join(__dirname, 'build-config', `${tenant}.json`);

  let tenantConfig = {};
  if (fs.existsSync(tenantConfigPath)) {
    tenantConfig = JSON.parse(fs.readFileSync(tenantConfigPath, 'utf-8'));
  }

  return {
    ...config,
    name: tenantConfig.appName || 'Clube Navi',
    slug: `clubenavi-${tenant}`,
    owner: 'clubenavi',
    version: tenantConfig.version || '1.0.0',

    ios: {
      bundleIdentifier: tenantConfig.bundleId || `com.clubenavi.${tenant}`,
      buildNumber: String(tenantConfig.iosBuildNumber || '1'),
      icon: tenantConfig.appIconPath || './assets/icon.png',
    },

    android: {
      package: tenantConfig.packageName || `com.clubenavi.${tenant}`,
      versionCode: tenantConfig.androidBuildNumber || 1,
      icon: tenantConfig.appIconPath || './assets/icon.png',
      adaptiveIcon: {
        foregroundImage: tenantConfig.appIconPath || './assets/adaptive-icon.png',
        backgroundColor: tenantConfig.primaryColor || '#3B82F6'
      }
    },

    splash: {
      image: tenantConfig.splashPath || './assets/splash.png',
      backgroundColor: tenantConfig.primaryColor || '#3B82F6'
    },

    extra: {
      tenantSlug: tenant,
      apiUrl: process.env.API_URL || 'https://api.clubenavi.com',
    }
  };
};
```

### 3. Build Config por Tenant (force.json)
```json
{
  "appName": "Clube Force",
  "tenantSlug": "force",
  "version": "1.0.0",
  "iosBuildNumber": 1,
  "androidBuildNumber": 1,

  "bundleId": "com.clubenavi.force",
  "packageName": "com.clubenavi.force",

  "primaryColor": "#FF6B35",

  "appIconPath": "./assets/tenants/force/app-icon.png",
  "splashPath": "./assets/tenants/force/splash.png",

  "appStoreUrl": "",
  "playStoreUrl": ""
}
```

### 4. Script de Build Individual
```bash
#!/bin/bash
# apps/mobile/scripts/build-single.sh

TENANT=$1

if [ -z "$TENANT" ]; then
  echo "❌ Erro: Especifique o tenant"
  echo "Uso: ./build-single.sh force"
  exit 1
fi

echo "🚀 Iniciando build para: $TENANT"

# 1. Baixar configuração do tenant do banco
node scripts/fetch-tenant-config.js $TENANT

# 2. Baixar assets do S3
node scripts/download-assets.js $TENANT

# 3. Build iOS
echo "📱 Building iOS..."
TENANT_SLUG=$TENANT eas build --platform ios --profile production

# 4. Build Android
echo "🤖 Building Android..."
TENANT_SLUG=$TENANT eas build --platform android --profile production

echo "✅ Build concluído: $TENANT"
```

### 5. Script de Build em Massa
```bash
#!/bin/bash
# apps/mobile/scripts/build-all.sh

echo "🚀 Iniciando build coordenado para todos os tenants"

# Buscar todos os tenants ativos do banco
TENANTS=$(node scripts/list-active-tenants.js)

for tenant in $TENANTS; do
  echo "================================"
  echo "Building: $tenant"
  echo "================================"

  ./scripts/build-single.sh $tenant

  if [ $? -eq 0 ]; then
    echo "✅ $tenant: Build com sucesso"
  else
    echo "❌ $tenant: Build falhou"
  fi

  echo ""
done

echo "✅ Build coordenado concluído!"
echo "📊 Verificar logs para detalhes"
```

### 6. Script de Download de Assets
```javascript
// apps/mobile/scripts/download-assets.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tenant = process.argv[2];

const downloadAsset = async (url, outputPath) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(outputPath, response.data);
};

const main = async () => {
  console.log(`📥 Baixando assets para: ${tenant}`);

  // Criar diretório
  const assetsDir = path.join(__dirname, '../assets/tenants', tenant);
  fs.mkdirSync(assetsDir, { recursive: true });

  // Baixar ícone
  await downloadAsset(
    `https://cdn.clubenavi.com/tenants/${tenant}/build/app-icon.png`,
    path.join(assetsDir, 'app-icon.png')
  );

  // Baixar splash
  await downloadAsset(
    `https://cdn.clubenavi.com/tenants/${tenant}/build/splash.png`,
    path.join(assetsDir, 'splash.png')
  );

  console.log('✅ Assets baixados com sucesso');
};

main();
```

---

## 🔄 Fluxo Completo de Atualização

### Cenário 1: Nova funcionalidade (requer update na loja)
```
1. Desenvolvedor adiciona nova feature no código
2. Commit e push para main
3. Super-admin executa script de build coordenado:

   $ cd apps/mobile
   $ ./scripts/build-all.sh

4. Script:
   - Busca lista de tenants ativos do banco
   - Para cada tenant:
     a. Baixa configuração (nome, ícone, cores)
     b. Baixa assets do S3
     c. Gera build iOS
     d. Gera build Android
     e. (Opcional) Submete automaticamente para lojas

5. Aguarda aprovação das lojas (1-7 dias)
6. Usuários recebem update
```

### Cenário 2: Mudança visual (OTA - imediato)
```
1. Club-admin altera cor ou logo interno
2. Salva no painel club-admin
3. Backend atualiza banco tenant
4. Backend faz upload para S3 (URL fixa)
5. App busca nova config na próxima abertura
6. Mudanças aplicadas IMEDIATAMENTE
```

---

## 📱 Consumo no App Mobile

### Inicialização:
```javascript
// apps/mobile/src/services/config.service.ts
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const tenantSlug = Constants.expoConfig.extra.tenantSlug;
const apiUrl = Constants.expoConfig.extra.apiUrl;

export const loadTenantConfig = async () => {
  // 1. Buscar do cache local
  const cached = await AsyncStorage.getItem('tenant-config');

  if (cached) {
    const config = JSON.parse(cached);
    // Usar config cacheada enquanto busca atualização
    applyConfig(config);
  }

  // 2. Buscar atualização do servidor
  const response = await fetch(`${apiUrl}/v1/config/${tenantSlug}`);
  const serverConfig = await response.json();

  // 3. Atualizar cache
  await AsyncStorage.setItem('tenant-config', JSON.stringify(serverConfig));

  // 4. Aplicar configuração
  applyConfig(serverConfig);
};

const applyConfig = (config) => {
  // Aplicar tema
  ThemeService.setColors(config.branding.primaryColor, ...);

  // Configurar assets
  AssetService.setLogoUrl(config.branding.logoHeaderUrl);

  // Feature flags
  FeatureFlagService.setFlags(config.features);
};
```

### API Endpoint:
```javascript
// apps/api/src/routes/config.routes.js
router.get('/v1/config/:tenantSlug', async (req, res) => {
  const { tenantSlug } = req.params;

  // 1. Buscar config do app (master db)
  const appConfig = await masterPrisma.clubAppConfig.findUnique({
    where: { tenantSlug }
  });

  // 2. Buscar branding (tenant db)
  const tenantPrisma = await getTenantClient(tenantSlug);
  const branding = await tenantPrisma.clubBranding.findFirst();

  // 3. Buscar módulos ativos
  const modules = await masterPrisma.clubModule.findMany({
    where: { clubId: appConfig.clubId, isActive: true }
  });

  // 4. Retornar config completa
  res.json({
    app: {
      name: appConfig.appName,
      version: appConfig.currentVersion,
      urlScheme: appConfig.urlScheme
    },
    branding: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      logoHeaderUrl: branding.logoHeaderUrl,
      logoMenuUrl: branding.logoMenuUrl,
      bannerHomeUrl: branding.bannerHomeUrl,
      // ...
    },
    modules: modules.map(m => ({
      key: m.moduleKey,
      enabled: m.isActive
    }))
  });
});
```

---

## ⚡ Vantagens desta Arquitetura

1. **Desenvolvimento Único**: Um código para todos os apps
2. **Build Coordenado**: Script atualiza todos os apps de uma vez
3. **Flexibilidade**: Mix de updates na loja + OTA
4. **Escalabilidade**: Fácil adicionar novos tenants
5. **Manutenção Simples**: Correções aplicadas a todos simultaneamente
6. **Branding Completo**: Cada tenant tem app exclusivo
7. **Uma Conta**: Todos na mesma conta de desenvolvedor

---

## 📊 Resumo Final

| Aspecto | Admin | Club-Admin |
|---------|-------|------------|
| **Nome do App** | ✅ Gerencia | ❌ Apenas visualiza |
| **Ícone do App** | ✅ Upload | ❌ |
| **Splash Screen** | ✅ Upload | ❌ |
| **Bundle ID** | ✅ Define | ❌ |
| **Cores do Tema** | ❌ | ✅ Edita livremente |
| **Logos Internos** | ❌ | ✅ Upload |
| **Banners** | ❌ | ✅ Upload |
| **Textos** | ❌ | ✅ Edita |
| **Build** | ✅ Executa scripts | ❌ |
| **Update Loja** | ✅ Coordena | ❌ |

---

**Criado em:** 12 de Novembro de 2025
**Versão:** 1.0
**Projeto:** Clube Navi Multi-Tenant Platform

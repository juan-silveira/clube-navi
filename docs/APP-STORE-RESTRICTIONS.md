# Guia Completo: Personalização de Apps React Native Multi-Tenant

## 📱 O que pode ser alterado em Apps React Native sem Resubmissão nas Lojas

Este documento detalha as possibilidades e limitações de personalização em aplicativos React Native multi-tenant, especificamente para o projeto **Clube Navi**, considerando as regras da Apple App Store e Google Play Store.

---

## 📋 Índice

1. [Regras das Lojas](#regras-das-lojas)
2. [Estratégia Multi-Tenant](#estratégia-multi-tenant)
3. [O que Cada Admin Pode Personalizar](#o-que-cada-admin-pode-personalizar)
4. [O que Requer Update na Loja](#o-que-requer-update-na-loja)
5. [Estratégias de Implementação](#estratégias-de-implementação)
6. [Implementação Técnica](#implementação-técnica)
7. [Tabela Resumo](#tabela-resumo)
8. [Recomendação Final](#recomendação-final)
9. [Avisos Importantes](#avisos-importantes)

---

## 📱 Regras das Lojas

### Apple App Store (iOS) - MAIS RESTRITIVA

A Apple é muito rigorosa quanto a mudanças fora da loja. Segundo as diretrizes da App Store:

#### ✅ PERMITIDO alterar via OTA (Over-The-Air):

- Conteúdo textual dinâmico
- Imagens carregadas de servidor (assets remotos)
- Dados de API (produtos, preços, descrições)
- Cores e estilos CSS/inline
- Configurações de features (enable/disable via feature flags)
- Tradução de textos
- Banners promocionais
- Conteúdo de feeds/listas
- Layouts baseados em dados remotos

#### ❌ PROIBIDO alterar via OTA (requer nova versão):

- **Código JavaScript/Bundle principal** (mudanças significativas de comportamento)
- **Funcionalidades completamente novas** não previstas
- **Ícone do app** (aquele da home screen)
- **Nome do app** (o que aparece sob o ícone)
- **Splash screen** (tela de abertura inicial)
- **Permissões nativas** (Info.plist)
- **Código nativo** (Swift/Objective-C)
- **SDKs novos** ou atualizações de libs nativas

### Google Play Store (Android) - MAIS FLEXÍVEL

O Android é mais permissivo com updates OTA:

#### ✅ PERMITIDO alterar via OTA:

- Tudo que é permitido no iOS +
- **Atualizações de código JavaScript** (com CodePush ou similar)
- Mudanças de UI/UX via JavaScript
- Novos fluxos de navegação em JS
- Integrações com APIs

#### ❌ PROIBIDO alterar via OTA (requer nova versão):

- **Ícone do app** (launcher icon)
- **Nome do app**
- **Permissões no AndroidManifest.xml**
- **Código nativo Java/Kotlin**
- **Bibliotecas nativas** novas
- **Mudanças em assinatura do app**

---

## 🎨 Estratégia Multi-Tenant para Clube Navi

### Arquitetura Recomendada: White-Label + Configuração Remota

```
┌─────────────────────────────────────────────┐
│  SUPER ADMIN (Plataforma Central)           │
├─────────────────────────────────────────────┤
│ - Publica APPS BASE nas lojas               │
│ - Define configurações globais              │
│ - Gerencia versões do app                   │
│ - Controla módulos disponíveis              │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  Clube Force  │       │  Clube Azore  │
│  (Admin)      │       │  (Admin)      │
├───────────────┤       ├───────────────┤
│ Personaliza:  │       │ Personaliza:  │
│ ✓ Cores       │       │ ✓ Cores       │
│ ✓ Logos int.  │       │ ✓ Logos int.  │
│ ✓ Conteúdo    │       │ ✓ Conteúdo    │
│ ✓ Módulos     │       │ ✓ Módulos     │
└───────────────┘       └───────────────┘
```

---

## ✅ O que Cada Admin de Clube Pode Personalizar

### 1. Cores e Temas ✅ OTA

```javascript
// Configuração remota via API
{
  "theme": {
    "primary": "#FF6B35",
    "secondary": "#004E89",
    "accent": "#F7931E",
    "background": "#FFFFFF",
    "text": "#1A1A1A"
  }
}
```

**Implementação**: Styled Components, CSS-in-JS ou tema do React Native

### 2. Logos e Imagens Internas ✅ OTA

```javascript
// URLs das imagens vindas do backend
{
  "branding": {
    "logoHeader": "https://cdn.clubenavi.com/force/logo-header.png",
    "logoSplash": "https://cdn.clubenavi.com/force/logo-splash.png", // ⚠️ Ver nota
    "logoMenu": "https://cdn.clubenavi.com/force/logo-menu.png",
    "bannerHome": "https://cdn.clubenavi.com/force/banner.jpg"
  }
}
```

**✅ Permitido**: Logos dentro do app (header, menu, páginas)  
**❌ Proibido**: Ícone do app (launcher icon), nome do app

**⚠️ SPLASH SCREEN**: Técnico!
- **iOS**: Splash nativo não muda via OTA (LaunchScreen.storyboard)
- **Android**: Pode usar splash dinâmico com bibliotecas
- **Solução**: Usar "fake splash" - tela inicial carregável que parece splash

### 3. Conteúdos Textuais ✅ OTA

```javascript
{
  "content": {
    "welcomeMessage": "Bem-vindo ao Clube Force!",
    "aboutUs": "Somos o maior clube de benefícios...",
    "termsUrl": "https://clubeforce.com/terms",
    "supportEmail": "suporte@clubeforce.com"
  }
}
```

**Permitido**: Todos os textos, desde que não mudem funcionalidade core

### 4. Módulos/Features Disponíveis ✅ OTA

```javascript
{
  "features": {
    "wallet": true,
    "cashback": true,
    "referral": true,
    "map": true,
    "pos": false, // Desabilitado para este clube
    "marketplace": true
  }
}
```

**Implementação**: Feature flags controladas remotamente

### 5. Configurações de Cashback ✅ OTA

```javascript
{
  "cashback": {
    "defaultPercentage": 5,
    "categories": {
      "food": 10,
      "transport": 3,
      "shopping": 7
    }
  }
}
```

### 6. Links e Deep Links ✅ OTA

```javascript
{
  "links": {
    "website": "https://clubeforce.com",
    "instagram": "clubeforce",
    "whatsapp": "+5511999999999"
  }
}
```

### 7. Menu Personalizado ✅ OTA

```javascript
{
  "menu": [
    { "id": "home", "label": "Início", "icon": "home", "enabled": true },
    { "id": "wallet", "label": "Carteira", "icon": "wallet", "enabled": true },
    { "id": "marketplace", "label": "Loja", "icon": "shopping", "enabled": true },
    { "id": "referral", "label": "Indique e Ganhe", "icon": "users", "enabled": false }
  ]
}
```

---

## ❌ O que Apenas Super-Admin Pode Fazer

### 1. Ícone do App (Launcher Icon) ❌

- **Onde**: Ícone que aparece na home do celular
- **Como mudar**: Novo build e submissão nas lojas
- **Solução**: Cada clube = app separado na loja com seu próprio ícone

### 2. Nome do App ❌

```
iOS: CFBundleDisplayName (Info.plist)
Android: android:label (AndroidManifest.xml)
```

- **Solução**: "Clube Force", "Clube Azore" - cada um com nome único na loja

### 3. Deep Links/URL Schemes ❌

```
iOS: URL Schemes (Info.plist)
Android: Intent Filters (AndroidManifest.xml)
```

- Exemplo: `clubeforce://`, `clubeazore://`

### 4. Permissões Nativas ❌

```
- Câmera
- Localização
- Notificações Push
- Contatos
- Arquivos
```

Mudanças no `Info.plist` (iOS) ou `AndroidManifest.xml` (Android)

### 5. Funcionalidades Completamente Novas ❌

- Adicionar módulo de **videochamada** (se não estava antes)
- Integração com **hardware específico**
- Novos **SDKs nativos** (ex: pagamento via NFC)

### 6. Versão do App ❌

```
iOS: CFBundleShortVersionString
Android: versionName, versionCode
```

---

## 🚀 Estratégias de Implementação Multi-Tenant

### Estratégia 1: APP ÚNICO COM TENANT ID (Recomendado)

**Como funciona:**

1. Super-admin publica 1 app: "Clube Navi Universal"
2. No primeiro acesso, usuário escolhe/digita código do clube
3. App baixa configuração específica do clube
4. Todas as personalizações via API

**Vantagens:**

- ✅ 1 único app na loja para gerenciar
- ✅ Updates simultâneos para todos os clubes
- ✅ Sem necessidade de múltiplas publicações

**Desvantagens:**

- ❌ Nome e ícone genéricos ("Clube Navi")
- ❌ Menos exclusividade para cada clube
- ❌ Usuário precisa saber código do clube

### Estratégia 2: APPS SEPARADOS POR CLUBE (White-Label Completo)

**Como funciona:**

1. Super-admin cria build específico para cada clube
2. Cada clube tem app próprio na loja
3. "Clube Force" com ícone e nome exclusivo
4. Personalização via config remota + build

**Vantagens:**

- ✅ Branding completo (nome + ícone próprios)
- ✅ Exclusividade e profissionalismo
- ✅ Melhor para revenda/parceiros

**Desvantagens:**

- ❌ Múltiplas publicações e manutenções
- ❌ Updates precisam ser coordenados
- ❌ Custos de contas de desenvolvedor ($99/ano iOS por conta)

**Implementação:**

```bash
# Build específico por clube
expo build:ios --release-channel clube-force
expo build:android --release-channel clube-force

# Variáveis de ambiente
TENANT_ID=clube-force
APP_NAME="Clube Force"
PRIMARY_COLOR="#FF6B35"
```

### Estratégia 3: HÍBRIDA (Recomendação para Clube Navi)

**Como funciona:**

1. App principal "Clube Navi" na loja (genérico)
2. Clubes premium podem ter app exclusivo (mediante taxa)
3. Config remota para todos

**Divisão:**

- **Plano Básico**: Usa app genérico + config remota
- **Plano Premium**: App exclusivo com nome e ícone próprios

---

## 🔧 Implementação Técnica Recomendada

### 1. Sistema de Configuração Remota

```typescript
// services/config.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TenantConfig {
  id: string;
  name: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  branding: {
    logoHeader: string;
    logoMenu: string;
    bannerHome: string;
  };
  features: {
    wallet: boolean;
    cashback: boolean;
    referral: boolean;
    map: boolean;
  };
  content: {
    welcomeMessage: string;
    aboutUs: string;
  };
}

class ConfigService {
  private config: TenantConfig | null = null;

  async loadConfig(tenantId: string): Promise<TenantConfig> {
    // Busca do cache primeiro
    const cached = await AsyncStorage.getItem(`config_${tenantId}`);
    if (cached) {
      this.config = JSON.parse(cached);
    }

    // Busca atualização do servidor
    const response = await fetch(
      `https://api.clubenavi.com/v1/tenants/${tenantId}/config`
    );
    const serverConfig = await response.json();

    // Salva no cache
    await AsyncStorage.setItem(
      `config_${tenantId}`,
      JSON.stringify(serverConfig)
    );

    this.config = serverConfig;
    return serverConfig;
  }

  getConfig(): TenantConfig {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config;
  }

  isFeatureEnabled(feature: keyof TenantConfig['features']): boolean {
    return this.config?.features[feature] ?? false;
  }
}

export default new ConfigService();
```

### 2. Sistema de Temas Dinâmicos

```typescript
// components/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import ConfigService from '../services/config.service';

const ThemeContext = createContext(null);

export const ThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const config = ConfigService.getConfig();
    setTheme({
      colors: config.theme,
      branding: config.branding,
    });
  }, []);

  if (!theme) return null;

  return (
    <StyledThemeProvider theme={theme}>
      {children}
    </StyledThemeProvider>
  );
};

// Uso nos componentes
import styled from 'styled-components/native';

const Button = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: 16px;
  border-radius: 8px;
`;
```

### 3. Carregamento de Assets Remotos

```typescript
// components/RemoteImage.tsx
import React from 'react';
import { Image, ImageProps } from 'react-native';
import ConfigService from '../services/config.service';

interface RemoteImageProps extends Omit<ImageProps, 'source'> {
  imageKey: keyof TenantConfig['branding'];
}

export const RemoteImage: React.FC<RemoteImageProps> = ({ 
  imageKey, 
  ...props 
}) => {
  const config = ConfigService.getConfig();
  const uri = config.branding[imageKey];

  return <Image source={{ uri }} {...props} />;
};

// Uso
<RemoteImage imageKey="logoHeader" style={{ width: 120, height: 40 }} />
```

### 4. Feature Flags

```typescript
// components/FeatureGate.tsx
import React from 'react';
import ConfigService from '../services/config.service';

interface FeatureGateProps {
  feature: keyof TenantConfig['features'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = null,
}) => {
  const isEnabled = ConfigService.isFeatureEnabled(feature);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

// Uso
<FeatureGate feature="wallet">
  <WalletScreen />
</FeatureGate>
```

---

## 📊 Tabela Resumo: Admin Clube vs Super-Admin

| Item | Admin do Clube (OTA) | Super-Admin (Update Loja) |
|------|----------------------|---------------------------|
| **Cores do tema** | ✅ Via API | ❌ |
| **Logos internos** | ✅ URLs remotas | ❌ |
| **Ícone do app** | ❌ | ✅ Novo build |
| **Nome do app** | ❌ | ✅ Novo build |
| **Textos/conteúdo** | ✅ Via API | ❌ |
| **Features on/off** | ✅ Feature flags | ❌ |
| **Splash screen** | ⚠️ Parcial (fake splash) | ✅ Splash nativo |
| **Menu items** | ✅ Config remota | ❌ |
| **Cashback %** | ✅ Via API | ❌ |
| **Permissões** | ❌ | ✅ Manifests |
| **Deep links** | ❌ | ✅ Manifests |
| **Versão do app** | ❌ | ✅ Novo build |
| **SDKs/Libs** | ❌ | ✅ Novo build |

---

## 🎯 Recomendação Final para Clube Navi

### Arquitetura Proposta:

#### 1. App Base "Clube Navi"

- Nome genérico, ícone genérico
- Publicado pelo Super-Admin
- Todos os módulos incluídos (wallet, cashback, map, etc.)

#### 2. Sistema de Tenant ID

- Primeiro acesso: usuário insere código do clube
- App baixa config específica e salva localmente
- Próximas aberturas: carrega direto

#### 3. Personalização Remota (Admin Clube)

- ✅ Cores, logos internos, textos
- ✅ Enable/disable features
- ✅ Config de cashback, comissões
- ✅ Menu personalizado

#### 4. Apps Premium (Opcional)

- Clubes que pagam mais: app exclusivo
- Nome e ícone próprios
- Mesma base code, build customizado

### Fluxo de Update:

```
┌─────────────────────────────────────────┐
│ MUDANÇA SOLICITADA                      │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│ Cores, logos, │    │ Ícone, nome,   │
│ textos,       │    │ permissões,    │
│ features      │    │ nova feature   │
└───────┬───────┘    └────────┬───────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│ ADMIN CLUBE   │    │ SUPER-ADMIN    │
│ Atualiza API  │    │ Novo build +   │
│ ⚡ IMEDIATO    │    │ Submit lojas   │
└───────────────┘    │ ⏱️ 1-7 dias     │
                     └────────────────┘
```

---

## ⚠️ Avisos Importantes

### Apple App Store Review:

- Apple pode rejeitar apps que mudam drasticamente via OTA
- Guideline 2.5.2: Apps não podem baixar código executável
- **Solução**: Use CodePush do Microsoft (aprovado pela Apple) para updates JS

### Code Push (React Native)

```bash
npm install react-native-code-push

# Permite updates OTA do código JavaScript
# Apple permite isso oficialmente
# Updates de bugfixes e pequenas mudanças de UI
```

### Limites do CodePush:

- ✅ Código JavaScript/TypeScript
- ✅ Assets (imagens, fonts)
- ✅ Mudanças de UI
- ❌ Código nativo
- ❌ Novas permissões
- ❌ Novos módulos nativos

---

## 📈 Resumo dos Benefícios

Esta arquitetura permite:

- **95% das personalizações** via painel admin (OTA)
- **5% via Super-Admin** (updates críticos nas lojas)
- **Escalabilidade** para centenas de clubes
- **Custos controlados** de manutenção
- **Time-to-market rápido** para novos clubes
- **Flexibilidade** para planos básico e premium

---

## 📚 Referências e Links Úteis

### Documentação Oficial

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [React Native Code Push](https://docs.microsoft.com/en-us/appcenter/distribution/codepush/)
- [Expo Over-the-Air Updates](https://docs.expo.dev/eas-update/introduction/)

### Ferramentas Recomendadas

- **Microsoft CodePush**: Updates OTA oficialmente aprovados
- **Expo EAS Update**: Sistema de updates para Expo
- **Firebase Remote Config**: Feature flags e configuração remota
- **LaunchDarkly**: Sistema avançado de feature flags

---

## 📝 Conclusão

O modelo multi-tenant proposto permite que o Clube Navi ofereça alta personalização para seus clientes através de configuração remota, mantendo um único codebase e minimizando a necessidade de submissões às lojas de aplicativos. 

A estratégia híbrida oferece flexibilidade para atender diferentes perfis de clientes, desde planos básicos com app compartilhado até planos premium com apps exclusivos, sempre mantendo a eficiência operacional e custos sob controle.

---

**Documento criado em:** Novembro de 2025  
**Versão:** 1.0  
**Projeto:** Clube Navi - Plataforma Multi-Tenant  
**Autor:** Arquitetura de Software
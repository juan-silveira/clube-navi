# Estrutura de Traduções - Coinage Platform

## 📋 Visão Geral

Este documento define a estrutura de namespaces de tradução para toda a plataforma Coinage.

## 🎯 Princípios

1. **Um namespace por funcionalidade principal** (ex: `deposit`, `withdraw`, `exchange`)
2. **Namespaces hierárquicos para admin** (ex: `admin` contém users, companies, etc)
3. **Reutilização via namespace `common`** para textos compartilhados
4. **Facilitar gestão no Translation System** (`/system/translations`)

## 📁 Mapeamento de Namespaces

### ✅ COMPLETOS (Implementados e Traduzidos)

| Namespace | Descrição | Páginas Cobertas | Status |
|-----------|-----------|------------------|--------|
| `common` | Textos compartilhados (botões, labels comuns) | Todas | ✅ |
| `auth` | Autenticação e login | Login, Register, Forgot Password | ✅ |
| `dashboard` | Dashboard principal | `/dashboard` | ✅ |
| `menu` | Menu de navegação | Sidebar, Header | ✅ |
| `header` | Cabeçalho e navegação | Header component | ✅ |
| `deposit` | Depósitos | `/deposit`, `/deposit/pix/*`, `/deposit/tx/*` | ✅ |
| `withdraw` | Saques | `/withdraw`, `/withdraw/pix-key`, `/withdraw/receipt/*` | ✅ |
| `transfer` | Transferências | `/transfer` | ✅ |
| `statement` | Extrato | `/statement` | ✅ |
| `exchange` | Exchange de tokens | `/exchange`, `/exchange/market`, `/exchange/book` | ✅ |
| `investments` | Investimentos | `/investments` | ✅ |
| `documentValidation` | Validação de documentos | `/document-validation` | ✅ |
| `fees` | Tarifas e prazos | `/fees` | ✅ |
| `security` | Segurança | `/security` | ✅ |
| `help` | Central de ajuda | `/help`, `/help/faq`, `/help/support`, `/help/tutorials` | ✅ |

### 🔨 EM ANDAMENTO

| Namespace | Descrição | Páginas Cobertas | Status |
|-----------|-----------|------------------|--------|
| `admin` | Administração | `/admin/*` | 🟡 50% |
| └─ `admin.users` | Gestão de usuários | `/admin/users`, `/admin/users/[id]` | 🟡 Parcial |

### ⏳ PENDENTES (A Implementar)

#### Prioridade ALTA (Funcionalidades Core)

| Namespace | Descrição | Páginas a Cobrir | Prioridade |
|-----------|-----------|------------------|------------|
| `admin.companies` | Gestão de empresas | `/admin/companies`, `/admin/companies/[id]/*` | 🔴 ALTA |
| `admin.documents` | Gestão de documentos | `/admin/documents`, `/admin/documents/[id]` | 🔴 ALTA |
| `admin.transactions` | Transações admin | `/admin/transactions` | 🔴 ALTA |
| `admin.whitelabel` | Whitelabel | `/admin/whitelabel` | 🔴 ALTA |
| `admin.companyStakes` | Company stakes | `/admin/company-stakes` | 🔴 ALTA |
| `admin.reports` | Relatórios | `/admin/reports` | 🔴 ALTA |
| `system` | Sistema | `/system/*` | 🔴 ALTA |
| └─ `system.users` | Usuários sistema | `/system/users`, `/system/users/[id]` | 🔴 ALTA |
| └─ `system.companies` | Empresas sistema | `/system/companies` | 🔴 ALTA |
| └─ `system.translations` | Translation System | `/system/translations` | 🔴 ALTA |
| └─ `system.withdrawals` | Withdrawals sistema | `/system/withdrawals` | 🔴 ALTA |
| └─ `system.documentValidation` | Doc validation admin | `/system/document-validation` | 🔴 ALTA |
| └─ `system.contracts` | Contratos | `/system/contracts/deploy` | 🔴 ALTA |
| └─ `system.settings` | Configurações sistema | `/system/settings` | 🔴 ALTA |
| └─ `system.logs` | Logs do sistema | `/system/logs` | 🔴 ALTA |
| └─ `system.whatsapp` | WhatsApp integration | `/system/whatsapp` | 🔴 ALTA |
| `stake` | Stake/Investimentos | `/stake/investir`, `/stake/retirar` | 🔴 ALTA |
| `profile` | Perfil de usuário | `/profile` | 🔴 ALTA |
| `notifications` | Notificações | `/notifications`, `/notifications/[id]` | 🔴 ALTA |
| `contracts` | Contratos blockchain | `/contracts/interact` | 🔴 ALTA |
| `companySettings` | Config empresa | `/company-settings` | 🔴 ALTA |
| `apiKey` | API Keys | `/api-key` | 🔴 ALTA |

#### Prioridade MÉDIA (Funcionalidades Secundárias)

| Namespace | Descrição | Páginas a Cobrir | Prioridade |
|-----------|-----------|------------------|------------|
| `analytics` | Analytics | `/analytics` | 🟡 MÉDIA |
| `changelog` | Changelog | `/changelog` | 🟡 MÉDIA |
| `crm` | CRM | `/crm` | 🟡 MÉDIA |
| `ecommerce` | E-commerce | `/ecommerce` | 🟡 MÉDIA |
| `project` | Projetos | `/project` | 🟡 MÉDIA |
| `invoice` | Faturas | `/invoice/*` | 🟡 MÉDIA |
| `pricing` | Preços | `/pricing` | 🟡 MÉDIA |
| `settings` | Configurações | `/settings` | 🟡 MÉDIA |

#### Prioridade BAIXA (Template/Demo Pages)

| Namespace | Descrição | Páginas a Cobrir | Prioridade |
|-----------|-----------|------------------|------------|
| `apps` | Apps demo | `/calender`, `/chat`, `/email`, `/kanban`, `/projects`, `/todo` | ⚪ BAIXA |
| `components` | Componentes UI | `/(components)/*` | ⚪ BAIXA |
| `forms` | Formulários demo | `/(forms)/*` | ⚪ BAIXA |
| `charts` | Gráficos demo | `/(chart)/*` | ⚪ BAIXA |
| `tables` | Tabelas demo | `/(table)/*` | ⚪ BAIXA |
| `widgets` | Widgets demo | `/(widget)/*` | ⚪ BAIXA |
| `utility` | Utilitários demo | `/(utility)/*` (exceto security, profile, notifications) | ⚪ BAIXA |

## 🏗️ Estrutura Padrão de Arquivo de Tradução

Cada arquivo JSON deve seguir esta estrutura hierárquica:

```json
{
  "title": "Título da Página",
  "pageTitle": "Título SEO",
  "subtitle": "Subtítulo",
  "loading": "Carregando...",
  "error": "Erro ao carregar",

  "sections": {
    "sectionName": {
      "title": "Título da Seção",
      "subtitle": "Subtítulo da Seção",
      "field1": "Campo 1",
      "field2": "Campo 2"
    }
  },

  "filters": {
    "search": "Buscar",
    "searchPlaceholder": "Digite para buscar...",
    "filter1": "Filtro 1",
    "clear": "Limpar"
  },

  "table": {
    "column1": "Coluna 1",
    "column2": "Coluna 2",
    "noData": "Nenhum dado encontrado",
    "noDataDesc": "Descrição do estado vazio"
  },

  "actions": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "edit": "Editar",
    "delete": "Excluir",
    "view": "Visualizar"
  },

  "options": {
    "option1": {
      "label": "Opção 1",
      "value": "option1"
    }
  },

  "messages": {
    "success": "Operação realizada com sucesso",
    "error": "Erro ao realizar operação",
    "warning": "Aviso",
    "info": "Informação"
  },

  "validation": {
    "required": "Campo obrigatório",
    "invalid": "Valor inválido",
    "minLength": "Mínimo de X caracteres"
  }
}
```

## 📝 Convenções de Nomenclatura

### Chaves (Keys)

- Use **camelCase** para chaves: `searchPlaceholder`, `lastLoginDate`
- Use nomes **descritivos e específicos**: ❌ `text1` ✅ `searchPlaceholder`
- Agrupe por **contexto/seção**: `filters.search`, `table.column1`, `actions.save`

### Valores (Values)

- Mantenha **consistência** entre idiomas na estrutura
- Use **placeholders** quando necessário: `"Olá {{name}}"`, `"Total: {{count}} itens"`
- Para **pluralização**, use sufixos: `item` / `itemPlural`

## 🔄 Workflow de Tradução

### 1. Identificar Página/Funcionalidade
```bash
# Exemplo: Traduzir admin/companies
1. Verificar se namespace existe: admin.json
2. Se não, criar estrutura base
3. Adicionar seção: admin.companies
```

### 2. Extrair Textos da Página
```jsx
// Antes (hardcoded)
<h1>Gestão de Empresas</h1>
<Button>Salvar</Button>

// Depois (i18n)
<h1>{t('admin.companies.title')}</h1>
<Button>{t('admin.companies.actions.save')}</Button>
```

### 3. Criar Traduções nos 3 Idiomas

```json
// pt-BR/admin.json
{
  "companies": {
    "title": "Gestão de Empresas",
    "actions": {
      "save": "Salvar"
    }
  }
}

// en-US/admin.json
{
  "companies": {
    "title": "Company Management",
    "actions": {
      "save": "Save"
    }
  }
}

// es/admin.json
{
  "companies": {
    "title": "Gestión de Empresas",
    "actions": {
      "save": "Guardar"
    }
  }
}
```

### 4. Implementar no Componente

```jsx
import { useTranslation } from 'react-i18next';

const CompaniesPage = () => {
  const { t } = useTranslation('admin');

  return (
    <div>
      <h1>{t('companies.title')}</h1>
      <Button>{t('companies.actions.save')}</Button>
    </div>
  );
};
```

### 5. Sincronizar com Banco de Dados

```bash
# Rodar script de sincronização
cd backend
node import-translations.js
```

## 🎯 Roadmap de Implementação

### Fase 1: Core Funcionalidades (PRIORIDADE ALTA) ⏳
- [ ] `admin.*` - Completar todas subseções
- [ ] `system.*` - Implementar todas páginas
- [ ] `stake` - Investimentos/Stake
- [ ] `profile` - Perfil de usuário
- [ ] `notifications` - Sistema de notificações
- [ ] `contracts` - Contratos blockchain
- [ ] `companySettings` - Configurações empresa
- [ ] `apiKey` - API Keys

### Fase 2: Funcionalidades Secundárias (PRIORIDADE MÉDIA)
- [ ] `analytics` - Analytics
- [ ] `changelog` - Changelog
- [ ] `crm` - CRM
- [ ] `ecommerce` - E-commerce
- [ ] `project` - Projetos
- [ ] `invoice` - Faturas
- [ ] `pricing` - Preços
- [ ] `settings` - Configurações gerais

### Fase 3: Template Pages (PRIORIDADE BAIXA)
- [ ] Apps demo
- [ ] Componentes UI
- [ ] Forms demo
- [ ] Charts demo
- [ ] Tables demo
- [ ] Widgets demo

## 📊 Estatísticas Atuais

- **Total de Páginas**: ~120 páginas
- **Namespaces Completos**: 15 (✅ 100%)
- **Namespaces Parciais**: 1 (🟡 50%)
- **Namespaces Pendentes**: ~30
- **Páginas Traduzidas**: ~40 páginas (~33%)
- **Páginas Pendentes**: ~80 páginas (~67%)

## 🛠️ Ferramentas e Scripts

### Script de Sincronização
```bash
# backend/import-translations.js
# Sincroniza JSON files → Database
node backend/import-translations.js
```

### Comando para Verificar Chaves Faltantes
```bash
# TODO: Criar script para detectar chaves hardcoded
npm run check-translations
```

### Interface de Gestão
```
/system/translations
- Visualizar todas as traduções
- Editar inline
- Adicionar novas chaves
- Exportar/Importar
```

## ✅ Checklist por Página

Ao traduzir uma página, verificar:

- [ ] Todos os textos visíveis estão usando `t()`
- [ ] Placeholders de inputs estão traduzidos
- [ ] Mensagens de erro/sucesso/warning estão traduzidas
- [ ] Labels de formulários estão traduzidos
- [ ] Títulos e subtítulos estão traduzidos
- [ ] Tooltips estão traduzidos
- [ ] Opções de select/dropdown estão traduzidas
- [ ] Textos de botões estão traduzidos
- [ ] Mensagens de estado vazio (no data) estão traduzidas
- [ ] Textos de paginação estão traduzidos
- [ ] Arquivo JSON criado nos 3 idiomas (pt-BR, en-US, es)
- [ ] Namespace adicionado ao `LanguageContext.jsx` (ALL_NAMESPACES)
- [ ] Script de sincronização rodado (`import-translations.js`)
- [ ] Testado mudança de idioma na interface

---

**Última Atualização**: 2025-01-16
**Mantido por**: Equipe Coinage

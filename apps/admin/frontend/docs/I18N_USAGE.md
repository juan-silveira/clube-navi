# Internationalization (i18n) Usage Guide

## Overview

The Coinage platform uses a custom i18n implementation based on i18next and react-i18next for multi-language support.

## Supported Languages

- **pt-BR** (Portuguese Brazil) - Default
- **en-US** (English United States)
- **es** (Spanish)

## File Structure

```
frontend/
├── public/
│   └── locales/
│       ├── pt-BR/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── dashboard.json
│       │   ├── financial.json
│       │   ├── exchange.json
│       │   ├── stake.json
│       │   ├── admin.json
│       │   ├── system.json
│       │   ├── errors.json
│       │   ├── validations.json
│       │   ├── notifications.json
│       │   └── emails.json
│       ├── en-US/
│       │   └── ... (same structure)
│       └── es/
│           └── ... (same structure)
├── contexts/
│   └── LanguageContext.jsx
├── hooks/
│   └── useTranslation.js
└── components/
    └── LanguageSwitcher.jsx
```

## Namespaces

Translations are organized into namespaces for better organization:

- **common**: Buttons, labels, common messages
- **auth**: Login, register, password reset
- **dashboard**: Dashboard screens
- **financial**: Deposits, withdrawals, balances
- **exchange**: Exchange/swap functionality
- **stake**: Staking functionality
- **admin**: Admin panel
- **system**: System settings and translations management
- **errors**: Error messages
- **validations**: Form validation messages
- **notifications**: Notification messages
- **emails**: Email templates

## Basic Usage

### In Components

```jsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function MyComponent() {
  // Use default namespace (common)
  const { t } = useTranslation();

  return (
    <div>
      <button>{t('buttons.save')}</button>
      <p>{t('messages.success')}</p>
    </div>
  );
}
```

### With Specific Namespace

```jsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  // Use auth namespace
  const { t } = useTranslation('auth');

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <button>{t('login.submit')}</button>
    </div>
  );
}
```

### With Variables (Interpolation)

```jsx
const { t } = useTranslation();

// If your translation is: "Hello, {{name}}!"
return <p>{t('greeting', { name: 'John' })}</p>;
```

### Accessing Other Namespaces

```jsx
const { t } = useTranslation('dashboard');

// Access another namespace explicitly
return (
  <div>
    <h1>{t('overview.title')}</h1>
    <button>{t('common:buttons.close')}</button>
  </div>
);
```

## Language Switching

### Using the LanguageSwitcher Component

```jsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### Programmatic Language Change

```jsx
import { useLanguage } from '@/contexts/LanguageContext';

export default function Settings() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <select
      value={currentLanguage}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="pt-BR">Português</option>
      <option value="en-US">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

## Translation Key Naming Convention

Use the pattern: `section.element.action` or `section.element`

Examples:
- `buttons.save`
- `buttons.cancel`
- `labels.email`
- `login.form.email`
- `login.form.password`
- `dashboard.overview.title`
- `errors.invalidEmail`
- `validations.required`

## Backend Integration

The frontend translations are synced from the database via the backend API.

### Sync from Database to Files

```bash
cd backend
node scripts/sync-translations-to-frontend.js
```

### API Endpoints

- `GET /api/translations/statistics` - Get translation statistics
- `GET /api/translations/grouped/:language` - Get all translations grouped by namespace
- `PUT /api/translations/:namespace/:language/:key` - Update a translation
- `POST /api/translations/bulk` - Bulk update translations
- `POST /api/translations/sync/to-files` - Sync database to files
- `POST /api/translations/sync/from-files` - Sync files to database

## Adding New Translations

### Method 1: Via Admin Panel (Recommended)

1. Navigate to `/system/translations`
2. Select language and namespace
3. Add or edit translations
4. Click save

### Method 2: Directly in JSON Files

1. Edit the appropriate JSON file in `public/locales/{language}/{namespace}.json`
2. Add your translation key and value
3. Sync to database: `POST /api/translations/sync/from-files`

Example:
```json
{
  "buttons.save": "Save",
  "buttons.cancel": "Cancel",
  "myNewKey": "My New Translation"
}
```

### Method 3: Via API

```javascript
await fetch('/api/translations/common/pt-BR/myNewKey', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ value: 'Minha Nova Tradução' })
});
```

## Best Practices

1. **Always use translation keys**, never hardcode text
2. **Use descriptive key names** that indicate the context
3. **Keep translations in the correct namespace**
4. **Use interpolation** for dynamic content
5. **Test in all languages** before deploying
6. **Keep translations consistent** across languages

## Examples

### Button with Translation

```jsx
const { t } = useTranslation();

<button className="btn-primary">
  {t('buttons.save')}
</button>
```

### Form with Translations

```jsx
const { t } = useTranslation('auth');

<form>
  <label>{t('login.form.email')}</label>
  <input type="email" placeholder={t('login.form.emailPlaceholder')} />

  <label>{t('login.form.password')}</label>
  <input type="password" placeholder={t('login.form.passwordPlaceholder')} />

  <button type="submit">{t('login.form.submit')}</button>
</form>
```

### Error Messages

```jsx
const { t } = useTranslation('errors');

try {
  // ... some operation
} catch (error) {
  const errorMessage = t(`api.${error.code}`) || t('generic');
  showNotification(errorMessage);
}
```

## Troubleshooting

### Translation Not Showing

1. Check if the key exists in the JSON file
2. Verify the namespace is correct
3. Check browser console for i18n warnings
4. Ensure the LanguageProvider is wrapping your component

### Language Not Changing

1. Check if localStorage is working
2. Verify the language code is correct (pt-BR, not pt)
3. Check if all translation files exist for that language

### Missing Translations

Use the backend API to find missing translations:
```
GET /api/translations/missing/en-US
```

This will return all keys that exist in the default language but not in the specified language.

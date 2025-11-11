module.exports = {
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en-US', 'es'],
    localeDetection: false,
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',

  reloadOnPrerender: process.env.NODE_ENV === 'development',

  // Namespaces that will be loaded on every page
  ns: ['common', 'errors', 'validations'],

  // Default namespace
  defaultNS: 'common',

  // Fallback language
  fallbackLng: 'pt-BR',

  // Load all namespaces for the current language
  nonExplicitSupportedLngs: true,

  // Interpolation options
  interpolation: {
    escapeValue: false, // React already escapes
  },

  // React options
  react: {
    useSuspense: false,
  },

  // Debug mode (only in development)
  debug: process.env.NODE_ENV === 'development',

  // Save missing translations
  saveMissing: process.env.NODE_ENV === 'development',

  // Custom backend to fetch translations from API if needed
  // backend: {
  //   loadPath: '/api/translations/{{ns}}/{{lng}}',
  // },
};

import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Hook to use translations in components
 * @param {string} namespace - Optional namespace (defaults to 'common')
 * @returns {object} - { t, i18n, currentLanguage, changeLanguage }
 */
export const useTranslation = (namespace = 'common') => {
  const { t, i18n, currentLanguage, changeLanguage, isInitialized } = useLanguage();

  const translate = (key, options = {}) => {
    // If namespace is provided and key doesn't already contain namespace
    const fullKey = key.includes(':') ? key : `${namespace}:${key}`;
    return t(fullKey, options);
  };

  return {
    t: translate,
    i18n,
    currentLanguage,
    changeLanguage,
    isInitialized,
  };
};

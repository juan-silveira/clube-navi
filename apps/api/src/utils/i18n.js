const fs = require('fs');
const path = require('path');

/**
 * Cache de traduções carregadas
 */
const translationCache = {};

/**
 * Carregar traduções de um arquivo JSON
 * @param {string} language - Código do idioma (pt-BR, en-US, es)
 * @param {string} namespace - Namespace das traduções (notifications, emails, etc)
 * @returns {object} Objeto com as traduções
 */
function loadTranslations(language, namespace) {
  const cacheKey = `${language}:${namespace}`;

  // Verificar cache
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const filePath = path.join(__dirname, '../../locales', language, `${namespace}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(fileContent);

    // Salvar no cache
    translationCache[cacheKey] = translations;

    return translations;
  } catch (error) {
    console.error(`❌ Erro ao carregar traduções ${language}/${namespace}:`, error.message);

    // Fallback para pt-BR se não encontrar
    if (language !== 'pt-BR') {
      console.warn(`⚠️ Tentando fallback para pt-BR`);
      return loadTranslations('pt-BR', namespace);
    }

    return {};
  }
}

/**
 * Obter uma tradução específica usando dot notation
 * @param {object} translations - Objeto de traduções
 * @param {string} key - Chave da tradução (ex: "withdrawal.confirmed.title")
 * @param {object} params - Parâmetros para interpolação
 * @returns {string} Texto traduzido
 */
function getTranslation(translations, key, params = {}) {
  const keys = key.split('.');
  let value = translations;

  // Navegar pela estrutura do objeto
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      console.warn(`⚠️ Tradução não encontrada para chave: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`⚠️ Valor da tradução não é string: ${key}`);
    return key;
  }

  // Interpolar parâmetros
  let result = value;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    const regex = new RegExp(`{{${paramKey}}}`, 'g');
    result = result.replace(regex, paramValue);
  }

  return result;
}

/**
 * Função principal de tradução
 * @param {string} language - Código do idioma
 * @param {string} namespace - Namespace das traduções
 * @param {string} key - Chave da tradução
 * @param {object} params - Parâmetros para interpolação
 * @returns {string} Texto traduzido
 */
function t(language, namespace, key, params = {}) {
  const translations = loadTranslations(language, namespace);
  return getTranslation(translations, key, params);
}

/**
 * Limpar cache de traduções (útil para testes ou hot-reload)
 */
function clearCache() {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
  console.log('🗑️ Cache de traduções limpo');
}

module.exports = {
  loadTranslations,
  getTranslation,
  t,
  clearCache
};

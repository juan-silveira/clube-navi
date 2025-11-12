/**
 * Utilitários para geração e sanitização de slugs
 */

/**
 * Mapa de caracteres especiais para suas versões ASCII
 */
const CHAR_MAP = {
  // Minúsculas com acentos
  'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ç': 'c',
  'ñ': 'n',

  // Maiúsculas com acentos
  'Á': 'a', 'À': 'a', 'Ã': 'a', 'Â': 'a', 'Ä': 'a',
  'É': 'e', 'È': 'e', 'Ê': 'e', 'Ë': 'e',
  'Í': 'i', 'Ì': 'i', 'Î': 'i', 'Ï': 'i',
  'Ó': 'o', 'Ò': 'o', 'Õ': 'o', 'Ô': 'o', 'Ö': 'o',
  'Ú': 'u', 'Ù': 'u', 'Û': 'u', 'Ü': 'u',
  'Ç': 'c',
  'Ñ': 'n'
};

/**
 * Remove acentos e caracteres especiais de uma string
 * @param {string} text - Texto para remover acentos
 * @returns {string} Texto sem acentos
 */
const removeAccents = (text) => {
  return text.split('').map(char => CHAR_MAP[char] || char).join('');
};

/**
 * Gera um slug sanitizado a partir de um nome
 * Remove acentos, converte para lowercase, remove caracteres especiais
 * e substitui espaços por hífens
 *
 * @param {string} name - Nome para converter em slug
 * @returns {string} Slug sanitizado
 *
 * @example
 * generateSlug("Clube São Paulo") // "clube-sao-paulo"
 * generateSlug("Força & Ação") // "forca-acao"
 * generateSlug("Café com Açúcar") // "cafe-com-acucar"
 */
const generateSlug = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Nome inválido para geração de slug');
  }

  return removeAccents(name)
    .toLowerCase() // Converte para minúsculas
    .trim() // Remove espaços nas extremidades
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais (mantém apenas letras, números, espaços e hífens)
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início e fim
};

/**
 * Gera o Bundle ID (iOS) a partir do tenant slug
 * Formato: com.clubedigital.{tenant-slug}
 *
 * @param {string} tenantSlug - Slug do tenant
 * @returns {string} Bundle ID
 *
 * @example
 * generateBundleId("clube-sao-paulo") // "com.clubedigital.clubesaopaulo"
 * generateBundleId("forca-acao") // "com.clubedigital.forcaacao"
 */
const generateBundleId = (tenantSlug) => {
  if (!tenantSlug || typeof tenantSlug !== 'string') {
    throw new Error('Tenant slug inválido');
  }

  // Remove hífens do slug para o bundle ID (iOS não aceita hífens)
  const sanitized = tenantSlug.replace(/-/g, '').toLowerCase();

  return `com.clubedigital.${sanitized}`;
};

/**
 * Gera o Package Name (Android) a partir do tenant slug
 * Formato: com.clubedigital.{tenant-slug}
 *
 * @param {string} tenantSlug - Slug do tenant
 * @returns {string} Package Name
 *
 * @example
 * generatePackageName("clube-sao-paulo") // "com.clubedigital.clubesaopaulo"
 */
const generatePackageName = (tenantSlug) => {
  // Para Android, usa o mesmo formato do iOS
  return generateBundleId(tenantSlug);
};

/**
 * Gera o URL Scheme a partir do tenant slug
 * Formato: clubedigital{tenantslug}
 *
 * @param {string} tenantSlug - Slug do tenant
 * @returns {string} URL Scheme
 *
 * @example
 * generateUrlScheme("clube-sao-paulo") // "clubedigitalclubesaopaulo"
 * generateUrlScheme("forca-acao") // "clubedigitalforcaacao"
 */
const generateUrlScheme = (tenantSlug) => {
  if (!tenantSlug || typeof tenantSlug !== 'string') {
    throw new Error('Tenant slug inválido');
  }

  // Remove hífens do slug para o URL scheme
  const sanitized = tenantSlug.replace(/-/g, '').toLowerCase();

  return `clubedigital${sanitized}`;
};

/**
 * Valida se um slug é válido para uso como tenant
 * - Apenas letras minúsculas, números e hífens
 * - Não pode começar ou terminar com hífen
 * - Não pode ter hífens consecutivos
 * - Mínimo 3 caracteres, máximo 50
 *
 * @param {string} slug - Slug para validar
 * @returns {boolean} True se válido, false caso contrário
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Regex para validar slug:
  // - Apenas a-z, 0-9, e hífens
  // - Não começa ou termina com hífen
  // - Não tem hífens consecutivos
  // - Entre 3 e 50 caracteres
  const slugRegex = /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/;

  return slugRegex.test(slug);
};

/**
 * Valida se um Bundle ID é válido
 *
 * @param {string} bundleId - Bundle ID para validar
 * @returns {boolean} True se válido
 */
const isValidBundleId = (bundleId) => {
  if (!bundleId || typeof bundleId !== 'string') {
    return false;
  }

  // Formato: com.clubedigital.{slug}
  const bundleRegex = /^com\.clubedigital\.[a-z0-9]+$/;

  return bundleRegex.test(bundleId);
};

module.exports = {
  removeAccents,
  generateSlug,
  generateBundleId,
  generatePackageName,
  generateUrlScheme,
  isValidSlug,
  isValidBundleId
};

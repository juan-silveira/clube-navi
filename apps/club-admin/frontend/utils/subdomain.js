/**
 * Utility functions for subdomain detection and management
 */

/**
 * Extrai o slug do clube do hostname atual
 * Exemplos:
 * - clube-navi.clubedigital.com.br -> clube-navi
 * - localhost:3001 -> null (desenvolvimento local)
 * - clube-teste.localhost:3001 -> clube-teste (desenvolvimento com subdomain)
 *
 * @returns {string|null} - Club slug ou null se não detectado
 */
export function getClubSlugFromHostname() {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  // Desenvolvimento local sem subdomain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Permitir subdomain em localhost para testes: clube-navi.localhost
    if (hostname.includes('.localhost')) {
      const parts = hostname.split('.');
      return parts[0];
    }
    return null;
  }

  // Produção: extrair subdomain
  // clube-navi.clubedigital.com.br -> ['clube-navi', 'clubedigital', 'com', 'br']
  const parts = hostname.split('.');

  // Se tiver 4+ partes, primeiro é o subdomain
  if (parts.length >= 4) {
    const subdomain = parts[0];

    // Ignorar subdomains reservados do sistema
    const reserved = ['www', 'admin', 'api', 'app', 'dashboard'];
    if (!reserved.includes(subdomain)) {
      return subdomain;
    }
  }

  // Se tiver 3 partes, pode ser subdomain.domain.com
  if (parts.length === 3) {
    const subdomain = parts[0];
    const reserved = ['www', 'admin', 'api', 'app', 'dashboard'];
    if (!reserved.includes(subdomain)) {
      return subdomain;
    }
  }

  return null;
}

/**
 * Verifica se estamos em ambiente de desenvolvimento
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Retorna o slug do clube para usar nas requisições
 * Em desenvolvimento, pode usar um slug fixo ou do localStorage
 */
export function getClubSlugForAPI() {
  // Tentar extrair do hostname
  const slug = getClubSlugFromHostname();

  if (slug) {
    return slug;
  }

  // Em desenvolvimento, tentar pegar do localStorage
  if (isDevelopment()) {
    const devSlug = localStorage.getItem('dev_club_slug');
    if (devSlug) {
      return devSlug;
    }
  }

  return null;
}

/**
 * Define o slug do clube para desenvolvimento
 * Útil para testar diferentes clubes em localhost
 */
export function setDevClubSlug(slug) {
  if (isDevelopment() && typeof window !== 'undefined') {
    localStorage.setItem('dev_club_slug', slug);
    console.log(`🔧 [DEV] Club slug definido: ${slug}`);
  }
}

/**
 * Limpa o slug de desenvolvimento
 */
export function clearDevClubSlug() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dev_club_slug');
  }
}

/**
 * Retorna URL completa do clube
 */
export function getClubUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.protocol}//${window.location.host}`;
}

/**
 * Clube Resolution Middleware
 *
 * Resolve o clube baseado no subdomínio, custom domain ou header
 * Injeta o clube e a conexão do clube DB no request
 *
 * IMPORTANTE: Este middleware deve ser um dos primeiros na cadeia
 */

const { masterPrisma } = require('../database');
const { getClubClient } = require('../database');

// Cache de clubes por slug/domain (TTL: 5 minutos)
const clubeCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Extrai o slug do clube do request
 * Estratégias (em ordem de prioridade):
 * 1. Header X-Clube-Slug (útil para APIs, testes)
 * 2. Subdomínio (ex: empresa-a.api.clubedigital.com.br)
 * 3. Custom domain (ex: api.empresaa.com.br)
 *
 * @param {Request} req
 * @returns {string|null}
 */
function extractClubeIdentifier(req) {
  // Estratégia 1: Header explícito
  const headerSlug = req.headers['x-clube-slug'];
  if (headerSlug) {
    return { type: 'slug', value: headerSlug };
  }

  // Estratégia 2: Subdomínio
  const host = req.headers.host || req.hostname;

  if (!host) {
    return null;
  }

  // Remover porta se houver
  const cleanHost = host.split(':')[0];

  // Exemplo: empresa-a.api.clubedigital.com.br
  // Extrai: empresa-a
  const parts = cleanHost.split('.');

  // Detectar localhost subdomain (ex: clubenavi.localhost)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return { type: 'subdomain', value: parts[0] };
  }

  // Se tiver 4+ partes, primeiro é o subdomain
  if (parts.length >= 4) {
    const subdomain = parts[0];

    // Ignorar subdomains reservados
    const reserved = ['www', 'api', 'admin', 'app', 'dashboard'];
    if (!reserved.includes(subdomain)) {
      return { type: 'subdomain', value: subdomain };
    }
  }

  // Estratégia 3: Custom domain completo
  return { type: 'customDomain', value: cleanHost };
}

/**
 * Busca clube do cache ou database
 * @param {string} type - 'slug', 'subdomain', 'customDomain'
 * @param {string} value
 * @returns {Promise<Object|null>}
 */
async function resolveClube(type, value) {
  // Tentar cache primeiro
  const cacheKey = `${type}:${value}`;

  if (clubeCache.has(cacheKey)) {
    const cached = clubeCache.get(cacheKey);

    // Verificar TTL
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.clube;
    }

    // Cache expirado, remover
    clubeCache.delete(cacheKey);
  }

  // Buscar no Master DB
  let clube = null;

  try {
    const master = masterPrisma;

    switch (type) {
      case 'slug':
      case 'subdomain':
        clube = await master.club.findUnique({
          where: { slug: value },
          include: {
            branding: true,
            modules: {
              where: { isEnabled: true },
              orderBy: { sortOrder: 'asc' }
            },
            cashbackConfig: true,
            withdrawalConfig: true
          }
        });
        break;

      case 'customDomain':
        clube = await master.club.findUnique({
          where: { customDomain: value },
          include: {
            branding: true,
            modules: {
              where: { isEnabled: true },
              orderBy: { sortOrder: 'asc' }
            },
            cashbackConfig: true,
            withdrawalConfig: true
          }
        });
        break;
    }

    // Armazenar em cache se encontrado
    if (clube) {
      clubeCache.set(cacheKey, {
        clube,
        timestamp: Date.now()
      });
    }

    return clube;
  } catch (error) {
    console.error('Error resolving clube:', error);
    return null;
  }
}

/**
 * Middleware principal de resolução de clube
 */
async function resolveClubMiddleware(req, res, next) {
  try {
    // Extrair identificador do clube
    const identifier = extractClubeIdentifier(req);

    if (!identifier) {
      return res.status(400).json({
        error: 'Clube not specified',
        message: 'Please provide clube via subdomain, custom domain, or X-Clube-Slug header'
      });
    }

    // Resolver clube
    const clube = await resolveClube(identifier.type, identifier.value);

    if (!clube) {
      return res.status(404).json({
        error: 'Clube not found',
        message: `Clube not found for ${identifier.type}: ${identifier.value}`
      });
    }

    // Verificar status do clube
    if (clube.status === 'suspended') {
      return res.status(403).json({
        error: 'Clube suspended',
        message: 'This clube account has been suspended. Please contact support.'
      });
    }

    if (clube.status === 'cancelled' || clube.status === 'expired') {
      return res.status(403).json({
        error: 'Clube inactive',
        message: 'This clube account is no longer active.'
      });
    }

    // Verificar subscription status
    if (clube.subscriptionStatus === 'PAST_DUE') {
      // Permitir acesso mas adicionar warning header
      res.setHeader('X-Subscription-Warning', 'Payment past due');
    }

    if (clube.subscriptionStatus === 'SUSPENDED') {
      return res.status(402).json({
        error: 'Payment required',
        message: 'Subscription payment is required to access this clube.'
      });
    }

    // Obter cliente do clube DB
    const clubPrisma = getClubClient(clube);

    // Injetar no request
    req.club = clube;
    req.clubPrisma = clubPrisma;

    // Headers úteis para debug/logging
    res.setHeader('X-Clube-Id', clube.id);
    res.setHeader('X-Clube-Slug', clube.slug);

    console.log(`[Clube Resolution] ✓ ${clube.slug} (${identifier.type}: ${identifier.value})`);

    next();
  } catch (error) {
    console.error('Clube resolution error:', error);

    return res.status(500).json({
      error: 'Clube resolution failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

/**
 * Limpa cache de clubes
 */
function clearClubeCache() {
  clubeCache.clear();
  console.log('🧹 Clube cache cleared');
}

/**
 * Remove clube específico do cache
 * @param {string} clubId
 */
function invalidateClubeCache(clubId) {
  // Encontrar e remover todas as entradas deste clube
  for (const [key, value] of clubeCache.entries()) {
    if (value.clube.id === clubId) {
      clubeCache.delete(key);
    }
  }

  console.log(`🧹 Clube cache invalidated: ${clubId}`);
}

/**
 * Obtém estatísticas do cache
 * @returns {Object}
 */
function getCacheStats() {
  const now = Date.now();
  let expired = 0;
  let valid = 0;

  for (const [key, value] of clubeCache.entries()) {
    if (now - value.timestamp < CACHE_TTL) {
      valid++;
    } else {
      expired++;
    }
  }

  return {
    total: clubeCache.size,
    valid,
    expired,
    ttlMs: CACHE_TTL
  };
}

module.exports = {
  resolveClubMiddleware,
  extractClubeIdentifier,
  resolveClube,
  clearClubeCache,
  invalidateClubeCache,
  getCacheStats
};

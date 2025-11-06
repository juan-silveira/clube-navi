/**
 * Tenant Resolution Middleware
 *
 * Resolve o tenant baseado no subdomínio, custom domain ou header
 * Injeta o tenant e a conexão do tenant DB no request
 *
 * IMPORTANTE: Este middleware deve ser um dos primeiros na cadeia
 */

const { masterPrisma } = require('../database');
const { getTenantClient } = require('../database');

// Cache de tenants por slug/domain (TTL: 5 minutos)
const tenantCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Extrai o slug do tenant do request
 * Estratégias (em ordem de prioridade):
 * 1. Header X-Tenant-Slug (útil para APIs, testes)
 * 2. Subdomínio (ex: empresa-a.api.clubedigital.com.br)
 * 3. Custom domain (ex: api.empresaa.com.br)
 *
 * @param {Request} req
 * @returns {string|null}
 */
function extractTenantIdentifier(req) {
  // Estratégia 1: Header explícito
  const headerSlug = req.headers['x-tenant-slug'];
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
 * Busca tenant do cache ou database
 * @param {string} type - 'slug', 'subdomain', 'customDomain'
 * @param {string} value
 * @returns {Promise<Object|null>}
 */
async function resolveTenant(type, value) {
  // Tentar cache primeiro
  const cacheKey = `${type}:${value}`;

  if (tenantCache.has(cacheKey)) {
    const cached = tenantCache.get(cacheKey);

    // Verificar TTL
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.tenant;
    }

    // Cache expirado, remover
    tenantCache.delete(cacheKey);
  }

  // Buscar no Master DB
  let tenant = null;

  try {
    const master = masterPrisma;

    switch (type) {
      case 'slug':
      case 'subdomain':
        tenant = await master.tenant.findUnique({
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
        tenant = await master.tenant.findUnique({
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
    if (tenant) {
      tenantCache.set(cacheKey, {
        tenant,
        timestamp: Date.now()
      });
    }

    return tenant;
  } catch (error) {
    console.error('Error resolving tenant:', error);
    return null;
  }
}

/**
 * Middleware principal de resolução de tenant
 */
async function resolveTenantMiddleware(req, res, next) {
  try {
    // Extrair identificador do tenant
    const identifier = extractTenantIdentifier(req);

    if (!identifier) {
      return res.status(400).json({
        error: 'Tenant not specified',
        message: 'Please provide tenant via subdomain, custom domain, or X-Tenant-Slug header'
      });
    }

    // Resolver tenant
    const tenant = await resolveTenant(identifier.type, identifier.value);

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant not found for ${identifier.type}: ${identifier.value}`
      });
    }

    // Verificar status do tenant
    if (tenant.status === 'suspended') {
      return res.status(403).json({
        error: 'Tenant suspended',
        message: 'This tenant account has been suspended. Please contact support.'
      });
    }

    if (tenant.status === 'cancelled' || tenant.status === 'expired') {
      return res.status(403).json({
        error: 'Tenant inactive',
        message: 'This tenant account is no longer active.'
      });
    }

    // Verificar subscription status
    if (tenant.subscriptionStatus === 'PAST_DUE') {
      // Permitir acesso mas adicionar warning header
      res.setHeader('X-Subscription-Warning', 'Payment past due');
    }

    if (tenant.subscriptionStatus === 'SUSPENDED') {
      return res.status(402).json({
        error: 'Payment required',
        message: 'Subscription payment is required to access this tenant.'
      });
    }

    // Obter cliente do tenant DB
    const tenantPrisma = getTenantClient(tenant);

    // Injetar no request
    req.tenant = tenant;
    req.tenantPrisma = tenantPrisma;

    // Headers úteis para debug/logging
    res.setHeader('X-Tenant-Id', tenant.id);
    res.setHeader('X-Tenant-Slug', tenant.slug);

    console.log(`[Tenant Resolution] ✓ ${tenant.slug} (${identifier.type}: ${identifier.value})`);

    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);

    return res.status(500).json({
      error: 'Tenant resolution failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

/**
 * Limpa cache de tenants
 */
function clearTenantCache() {
  tenantCache.clear();
  console.log('🧹 Tenant cache cleared');
}

/**
 * Remove tenant específico do cache
 * @param {string} tenantId
 */
function invalidateTenantCache(tenantId) {
  // Encontrar e remover todas as entradas deste tenant
  for (const [key, value] of tenantCache.entries()) {
    if (value.tenant.id === tenantId) {
      tenantCache.delete(key);
    }
  }

  console.log(`🧹 Tenant cache invalidated: ${tenantId}`);
}

/**
 * Obtém estatísticas do cache
 * @returns {Object}
 */
function getCacheStats() {
  const now = Date.now();
  let expired = 0;
  let valid = 0;

  for (const [key, value] of tenantCache.entries()) {
    if (now - value.timestamp < CACHE_TTL) {
      valid++;
    } else {
      expired++;
    }
  }

  return {
    total: tenantCache.size,
    valid,
    expired,
    ttlMs: CACHE_TTL
  };
}

module.exports = {
  resolveTenantMiddleware,
  extractTenantIdentifier,
  resolveTenant,
  clearTenantCache,
  invalidateTenantCache,
  getCacheStats
};

/**
 * Tenant Database Client Manager
 *
 * Gerencia conexões dinâmicas com databases de tenants
 * Usa connection pooling e cache para performance
 */

const { PrismaClient } = require('../generated/prisma-tenant');

// Cache de conexões por tenant
const tenantConnections = new Map();

// Configurações de pool
const POOL_CONFIG = {
  maxConnections: 10,
  idleTimeout: 60000, // 60 segundos
  connectionTimeout: 10000 // 10 segundos
};

/**
 * Constrói URL de conexão do tenant
 * @param {Object} tenant - Dados do tenant do Master DB
 * @returns {string}
 */
function buildTenantDatabaseUrl(tenant) {
  const { databaseHost, databasePort, databaseName, databaseUser, databasePassword } = tenant;

  // TODO: Descriptografar senha se estiver encriptada
  const password = databasePassword;

  return `postgresql://${databaseUser}:${password}@${databaseHost}:${databasePort}/${databaseName}?schema=public&connection_limit=${POOL_CONFIG.maxConnections}&pool_timeout=${POOL_CONFIG.connectionTimeout}`;
}

/**
 * Obtém ou cria conexão com database do tenant
 * @param {Object} tenant - Dados do tenant do Master DB
 * @returns {PrismaClient}
 */
function getTenantClient(tenant) {
  const tenantId = tenant.id;

  // Retornar conexão em cache se existir
  if (tenantConnections.has(tenantId)) {
    const cached = tenantConnections.get(tenantId);
    cached.lastUsed = Date.now();
    return cached.client;
  }

  // Criar nova conexão
  const databaseUrl = buildTenantDatabaseUrl(tenant);

  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error']
  });

  // Armazenar em cache
  tenantConnections.set(tenantId, {
    client,
    lastUsed: Date.now(),
    tenant: {
      id: tenantId,
      slug: tenant.slug,
      companyName: tenant.companyName
    }
  });

  console.log(`✅ Tenant Database Client created for: ${tenant.slug} (${tenantId})`);

  return client;
}

/**
 * Desconecta um tenant específico
 * @param {string} tenantId
 */
async function disconnectTenant(tenantId) {
  if (tenantConnections.has(tenantId)) {
    const cached = tenantConnections.get(tenantId);
    await cached.client.$disconnect();
    tenantConnections.delete(tenantId);
    console.log(`🔌 Tenant Database Client disconnected: ${cached.tenant.slug}`);
  }
}

/**
 * Desconecta todos os tenants
 */
async function disconnectAllTenants() {
  const promises = [];

  for (const [tenantId, cached] of tenantConnections.entries()) {
    promises.push(
      cached.client.$disconnect()
        .then(() => {
          console.log(`🔌 Tenant Database Client disconnected: ${cached.tenant.slug}`);
        })
        .catch(err => {
          console.error(`❌ Error disconnecting tenant ${cached.tenant.slug}:`, err);
        })
    );
  }

  await Promise.all(promises);
  tenantConnections.clear();
  console.log('🔌 All Tenant Database Clients disconnected');
}

/**
 * Limpa conexões idle (não usadas há muito tempo)
 */
function cleanupIdleConnections() {
  const now = Date.now();
  const toDisconnect = [];

  for (const [tenantId, cached] of tenantConnections.entries()) {
    const idleTime = now - cached.lastUsed;

    if (idleTime > POOL_CONFIG.idleTimeout) {
      toDisconnect.push(tenantId);
    }
  }

  // Desconectar em background
  toDisconnect.forEach(tenantId => {
    disconnectTenant(tenantId).catch(err => {
      console.error(`Error disconnecting idle tenant ${tenantId}:`, err);
    });
  });

  if (toDisconnect.length > 0) {
    console.log(`🧹 Cleaned up ${toDisconnect.length} idle tenant connections`);
  }
}

// Limpeza automática de conexões idle a cada 5 minutos
setInterval(cleanupIdleConnections, 5 * 60 * 1000);

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectAllTenants();
});

/**
 * Obtém estatísticas de conexões
 * @returns {Object}
 */
function getConnectionStats() {
  const stats = {
    totalConnections: tenantConnections.size,
    tenants: []
  };

  const now = Date.now();

  for (const [tenantId, cached] of tenantConnections.entries()) {
    const idleTime = now - cached.lastUsed;

    stats.tenants.push({
      tenantId,
      slug: cached.tenant.slug,
      companyName: cached.tenant.companyName,
      idleTimeMs: idleTime,
      idleTimeSec: Math.floor(idleTime / 1000)
    });
  }

  return stats;
}

module.exports = {
  getTenantClient,
  disconnectTenant,
  disconnectAllTenants,
  cleanupIdleConnections,
  getConnectionStats
};

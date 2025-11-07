/**
 * Clube Database Client Manager
 *
 * Gerencia conexões dinâmicas com databases de clubes
 * Usa connection pooling e cache para performance
 */

const { PrismaClient } = require('../generated/prisma-tenant');

// Cache de conexões por clube
const clubConnections = new Map();

// Configurações de pool
const POOL_CONFIG = {
  maxConnections: 10,
  idleTimeout: 60000, // 60 segundos
  connectionTimeout: 10000 // 10 segundos
};

/**
 * Constrói URL de conexão do clube
 * @param {Object} clube - Dados do clube do Master DB
 * @returns {string}
 */
function buildClubDatabaseUrl(clube) {
  const { databaseHost, databasePort, databaseName, databaseUser, databasePassword } = clube;

  // TODO: Descriptografar senha se estiver encriptada
  const password = databasePassword;

  return `postgresql://${databaseUser}:${password}@${databaseHost}:${databasePort}/${databaseName}?schema=public&connection_limit=${POOL_CONFIG.maxConnections}&pool_timeout=${POOL_CONFIG.connectionTimeout}`;
}

/**
 * Obtém ou cria conexão com database do clube
 * @param {Object} clube - Dados do clube do Master DB
 * @returns {PrismaClient}
 */
function getClubClient(clube) {
  const clubId = clube.id;

  // Retornar conexão em cache se existir
  if (clubConnections.has(clubId)) {
    const cached = clubConnections.get(clubId);
    cached.lastUsed = Date.now();
    return cached.client;
  }

  // Criar nova conexão
  const databaseUrl = buildClubDatabaseUrl(clube);

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
  clubConnections.set(clubId, {
    client,
    lastUsed: Date.now(),
    clube: {
      id: clubId,
      slug: clube.slug,
      companyName: clube.companyName
    }
  });

  console.log(`✅ Clube Database Client created for: ${clube.slug} (${clubId})`);

  return client;
}

/**
 * Desconecta um clube específico
 * @param {string} clubId
 */
async function disconnectClub(clubId) {
  if (clubConnections.has(clubId)) {
    const cached = clubConnections.get(clubId);
    await cached.client.$disconnect();
    clubConnections.delete(clubId);
    console.log(`🔌 Clube Database Client disconnected: ${cached.clube.slug}`);
  }
}

/**
 * Desconecta todos os clubes
 */
async function disconnectAllClubs() {
  const promises = [];

  for (const [clubId, cached] of clubConnections.entries()) {
    promises.push(
      cached.client.$disconnect()
        .then(() => {
          console.log(`🔌 Clube Database Client disconnected: ${cached.clube.slug}`);
        })
        .catch(err => {
          console.error(`❌ Error disconnecting clube ${cached.clube.slug}:`, err);
        })
    );
  }

  await Promise.all(promises);
  clubConnections.clear();
  console.log('🔌 All Clube Database Clients disconnected');
}

/**
 * Limpa conexões idle (não usadas há muito tempo)
 */
function cleanupIdleConnections() {
  const now = Date.now();
  const toDisconnect = [];

  for (const [clubId, cached] of clubConnections.entries()) {
    const idleTime = now - cached.lastUsed;

    if (idleTime > POOL_CONFIG.idleTimeout) {
      toDisconnect.push(clubId);
    }
  }

  // Desconectar em background
  toDisconnect.forEach(clubId => {
    disconnectClub(clubId).catch(err => {
      console.error(`Error disconnecting idle clube ${clubId}:`, err);
    });
  });

  if (toDisconnect.length > 0) {
    console.log(`🧹 Cleaned up ${toDisconnect.length} idle clube connections`);
  }
}

// Limpeza automática de conexões idle a cada 5 minutos
setInterval(cleanupIdleConnections, 5 * 60 * 1000);

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectAllClubs();
});

/**
 * Obtém estatísticas de conexões
 * @returns {Object}
 */
function getConnectionStats() {
  const stats = {
    totalConnections: clubConnections.size,
    clubes: []
  };

  const now = Date.now();

  for (const [clubId, cached] of clubConnections.entries()) {
    const idleTime = now - cached.lastUsed;

    stats.clubes.push({
      clubId,
      slug: cached.clube.slug,
      companyName: cached.clube.companyName,
      idleTimeMs: idleTime,
      idleTimeSec: Math.floor(idleTime / 1000)
    });
  }

  return stats;
}

module.exports = {
  getClubClient,
  disconnectClub,
  disconnectAllClubs,
  cleanupIdleConnections,
  getConnectionStats
};

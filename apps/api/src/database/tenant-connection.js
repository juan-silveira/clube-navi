/**
 * Tenant Database Connection Manager
 * Creates and manages Prisma connections to tenant databases
 */

const { PrismaClient } = require('../../prisma/src/generated/prisma-tenant');

/**
 * Cache of tenant Prisma clients
 * Key: connection string
 * Value: Prisma client instance
 */
const tenantClients = new Map();

/**
 * Get or create a Prisma client for a tenant database
 * @param {Object} config - Database configuration
 * @param {string} config.host - Database host
 * @param {number} config.port - Database port
 * @param {string} config.database - Database name
 * @param {string} config.username - Database username
 * @param {string} config.password - Database password
 * @returns {PrismaClient} Prisma client for the tenant
 */
function getTenantPrisma({ host, port, database, username, password }) {
  // Build connection string
  const connectionString = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;

  // Return cached client if exists
  if (tenantClients.has(connectionString)) {
    return tenantClients.get(connectionString);
  }

  // Create new client
  const client = new PrismaClient({
    datasources: {
      db: {
        url: connectionString
      }
    }
  });

  // Cache the client
  tenantClients.set(connectionString, client);

  return client;
}

/**
 * Close all tenant connections
 */
async function disconnectAllTenants() {
  const promises = [];

  for (const client of tenantClients.values()) {
    promises.push(client.$disconnect());
  }

  await Promise.all(promises);
  tenantClients.clear();
}

/**
 * Close a specific tenant connection
 */
async function disconnectTenant(connectionString) {
  const client = tenantClients.get(connectionString);

  if (client) {
    await client.$disconnect();
    tenantClients.delete(connectionString);
  }
}

module.exports = {
  getTenantPrisma,
  disconnectAllTenants,
  disconnectTenant
};

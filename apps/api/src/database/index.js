/**
 * Database Clients Module
 *
 * Exporta clientes para Master DB e Tenant DBs
 */

const { getMasterClient, disconnectMaster, masterPrisma } = require('./master-client');
const {
  getTenantClient,
  disconnectTenant,
  disconnectAllTenants,
  cleanupIdleConnections,
  getConnectionStats
} = require('./tenant-client');

module.exports = {
  // Master Database
  getMasterClient,
  disconnectMaster,
  masterPrisma,

  // Tenant Databases
  getTenantClient,
  disconnectTenant,
  disconnectAllTenants,
  cleanupIdleConnections,
  getConnectionStats
};

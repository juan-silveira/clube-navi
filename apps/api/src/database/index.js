/**
 * Database Clients Module
 *
 * Exporta clientes para Master DB e Clube DBs
 */

const { getMasterClient, disconnectMaster, masterPrisma } = require('./master-client');
const {
  getClubClient,
  disconnectClub,
  disconnectAllClubs,
  cleanupIdleConnections,
  getConnectionStats
} = require('./club-client');

module.exports = {
  // Master Database
  getMasterClient,
  disconnectMaster,
  masterPrisma,

  // Clube Databases
  getClubClient,
  disconnectClub,
  disconnectAllClubs,
  cleanupIdleConnections,
  getConnectionStats
};

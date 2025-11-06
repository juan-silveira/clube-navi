/**
 * Master Database Client
 *
 * Cliente Prisma para o banco de dados Master
 * Gerencia informações de tenants, módulos, analytics, etc.
 */

const { PrismaClient } = require('../generated/prisma-master');

// Singleton instance
let masterPrisma = null;

/**
 * Obtém a instância do Master Prisma Client
 * @returns {PrismaClient}
 */
function getMasterClient() {
  if (!masterPrisma) {
    masterPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.MASTER_DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error']
    });

    // Graceful shutdown
    process.on('beforeExit', async () => {
      await masterPrisma.$disconnect();
    });

    console.log('✅ Master Database Client initialized');
  }

  return masterPrisma;
}

/**
 * Desconecta o Master Client
 */
async function disconnectMaster() {
  if (masterPrisma) {
    await masterPrisma.$disconnect();
    masterPrisma = null;
    console.log('🔌 Master Database Client disconnected');
  }
}

module.exports = {
  getMasterClient,
  disconnectMaster,
  get masterPrisma() {
    return getMasterClient();
  }
};

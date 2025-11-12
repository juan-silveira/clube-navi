/**
 * Club Stats Synchronization Service
 * Syncs club statistics from tenant databases to master database
 */

const { masterPrisma } = require('../database');
const { getTenantPrisma } = require('../database/tenant-connection');

class ClubStatsSyncService {
  /**
   * Sync stats for a single club
   */
  async syncClubStats(clubId) {
    try {
      console.log(`🔄 [Stats Sync] Starting sync for club ${clubId}...`);

      // Get club info from master
      const club = await masterPrisma.club.findUnique({
        where: { id: clubId }
      });

      if (!club) {
        throw new Error(`Club ${clubId} not found`);
      }

      // Get tenant Prisma client
      const tenantPrisma = getTenantPrisma({
        host: club.databaseHost,
        port: club.databasePort,
        database: club.databaseName,
        username: club.databaseUser,
        password: club.databasePassword
      });

      // Gather statistics from tenant database
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Total users by type
      const totalConsumers = await tenantPrisma.user.count({
        where: { userType: 'consumer' }
      });

      const totalMerchants = await tenantPrisma.user.count({
        where: { userType: 'merchant' }
      });

      const totalUsers = totalConsumers + totalMerchants;

      // Active users in last 30 days
      const activeUsers30d = await tenantPrisma.user.count({
        where: {
          lastLoginAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      // Purchases statistics
      const allPurchases = await tenantPrisma.purchase.findMany({
        where: {
          status: 'completed'
        },
        select: {
          totalAmount: true,
          consumerCashback: true,
          platformFee: true,
          createdAt: true
        }
      });

      const totalPurchases = allPurchases.length;
      const totalRevenue = allPurchases.reduce((sum, t) => sum + parseFloat(t.totalAmount || 0), 0);
      const totalCashbackPaid = allPurchases.reduce((sum, t) => sum + parseFloat(t.consumerCashback || 0), 0);
      const totalPlatformFees = allPurchases.reduce((sum, t) => sum + parseFloat(t.platformFee || 0), 0);

      // Last 30 days statistics
      const recent30dPurchases = allPurchases.filter(t => t.createdAt >= thirtyDaysAgo);
      const purchases30d = recent30dPurchases.length;
      const revenue30d = recent30dPurchases.reduce((sum, t) => sum + parseFloat(t.totalAmount || 0), 0);
      const cashback30d = recent30dPurchases.reduce((sum, t) => sum + parseFloat(t.consumerCashback || 0), 0);

      // Products count
      const totalProducts = await tenantPrisma.product.count();

      // Update stats in master database
      const stats = await masterPrisma.clubStats.upsert({
        where: { clubId },
        update: {
          totalUsers,
          totalConsumers,
          totalMerchants,
          activeUsers30d,
          totalPurchases,
          totalRevenue,
          totalCashbackPaid,
          totalPlatformFees,
          totalProducts,
          revenue30d,
          purchases30d,
          cashback30d,
          lastSyncAt: new Date()
        },
        create: {
          clubId,
          totalUsers,
          totalConsumers,
          totalMerchants,
          activeUsers30d,
          totalPurchases,
          totalRevenue,
          totalCashbackPaid,
          totalPlatformFees,
          totalProducts,
          revenue30d,
          purchases30d,
          cashback30d,
          lastSyncAt: new Date()
        }
      });

      console.log(`✅ [Stats Sync] Club ${club.companyName} synced successfully`);
      console.log(`   - Users: ${totalUsers} (${totalConsumers} consumers, ${totalMerchants} merchants)`);
      console.log(`   - Purchases: ${totalPurchases} (${purchases30d} in 30d)`);
      console.log(`   - Revenue: R$ ${totalRevenue.toFixed(2)} (R$ ${revenue30d.toFixed(2)} in 30d)`);

      // Disconnect tenant Prisma
      await tenantPrisma.$disconnect();

      return stats;

    } catch (error) {
      console.error(`❌ [Stats Sync] Error syncing club ${clubId}:`, error);
      throw error;
    }
  }

  /**
   * Sync stats for all active clubs
   */
  async syncAllClubs() {
    try {
      console.log('🔄 [Stats Sync] Starting sync for all clubs...');

      // Get all active clubs
      const clubs = await masterPrisma.club.findMany({
        where: { isActive: true },
        select: { id: true, companyName: true }
      });

      console.log(`📊 [Stats Sync] Found ${clubs.length} active clubs`);

      const results = {
        success: [],
        failed: []
      };

      // Sync each club sequentially
      for (const club of clubs) {
        try {
          await this.syncClubStats(club.id);
          results.success.push(club);
        } catch (error) {
          console.error(`❌ [Stats Sync] Failed to sync ${club.companyName}:`, error.message);
          results.failed.push({ club, error: error.message });
        }
      }

      console.log(`✅ [Stats Sync] Sync completed:`);
      console.log(`   - Success: ${results.success.length} clubs`);
      console.log(`   - Failed: ${results.failed.length} clubs`);

      return results;

    } catch (error) {
      console.error('❌ [Stats Sync] Error syncing all clubs:', error);
      throw error;
    }
  }

  /**
   * Get last sync time for a club
   */
  async getLastSyncTime(clubId) {
    const stats = await masterPrisma.clubStats.findUnique({
      where: { clubId },
      select: { lastSyncAt: true }
    });

    return stats?.lastSyncAt || null;
  }

  /**
   * Check if sync is needed (older than X minutes)
   */
  async needsSync(clubId, maxAgeMinutes = 30) {
    const lastSync = await this.getLastSyncTime(clubId);

    if (!lastSync) {
      return true; // Never synced
    }

    const ageMinutes = (Date.now() - lastSync.getTime()) / 1000 / 60;
    return ageMinutes >= maxAgeMinutes;
  }
}

module.exports = new ClubStatsSyncService();

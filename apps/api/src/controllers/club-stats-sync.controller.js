/**
 * Club Stats Sync Controller
 * Handles manual and automatic sync of club statistics
 */

const clubStatsSyncService = require('../services/club-stats-sync.service');

class ClubStatsSyncController {
  /**
   * Sync stats for a specific club
   * @route POST /api/super-admin/clubs/:id/sync-stats
   */
  async syncClub(req, res) {
    try {
      const { id } = req.params;

      const stats = await clubStatsSyncService.syncClubStats(id);

      res.json({
        success: true,
        message: 'Club stats synced successfully',
        data: { stats }
      });

    } catch (error) {
      console.error('❌ [Clubs] Sync stats error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Sync stats for all active clubs
   * @route POST /api/super-admin/clubs/sync-stats/all
   */
  async syncAll(req, res) {
    try {
      const results = await clubStatsSyncService.syncAllClubs();

      res.json({
        success: true,
        message: 'Stats sync completed',
        data: {
          successCount: results.success.length,
          failedCount: results.failed.length,
          success: results.success.map(c => c.companyName),
          failed: results.failed.map(f => ({
            club: f.club.companyName,
            error: f.error
          }))
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] Sync all stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get last sync time for a club
   * @route GET /api/super-admin/clubs/:id/sync-stats/status
   */
  async getSyncStatus(req, res) {
    try {
      const { id } = req.params;

      const lastSync = await clubStatsSyncService.getLastSyncTime(id);
      const needsSync = await clubStatsSyncService.needsSync(id, 30);

      res.json({
        success: true,
        data: {
          lastSyncAt: lastSync,
          needsSync,
          ageMinutes: lastSync ? Math.floor((Date.now() - lastSync.getTime()) / 1000 / 60) : null
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] Get sync status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClubStatsSyncController();

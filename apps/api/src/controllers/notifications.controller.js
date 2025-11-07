/**
 * Notifications Controller
 * Handles push notifications management
 */

const { masterPrisma } = require('../database');
const { getClubClient } = require('../database');

class NotificationsController {
  /**
   * Send notification to users
   * @route POST /api/super-admin/notifications/send
   */
  async send(req, res) {
    try {
      const {
        clubId,
        title,
        body,
        userIds,
        sendToAll = false,
        data = {}
      } = req.body;

      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: 'Title and body are required'
        });
      }

      if (!clubId) {
        return res.status(400).json({
          success: false,
          message: 'Club ID is required'
        });
      }

      // Get club database
      const club = await masterPrisma.club.findUnique({
        where: { id: clubId }
      });

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      const clubPrisma = await getClubClient(club.databaseUrl);

      // Get target users
      let users = [];
      if (sendToAll) {
        users = await clubPrisma.user.findMany({
          where: { isActive: true },
          select: { id: true, name: true, email: true, fcmToken: true }
        });
      } else if (userIds && userIds.length > 0) {
        users = await clubPrisma.user.findMany({
          where: {
            id: { in: userIds },
            isActive: true
          },
          select: { id: true, name: true, email: true, fcmToken: true }
        });
      }

      // Filter users with FCM tokens
      const usersWithTokens = users.filter(u => u.fcmToken);

      // TODO: Integrate with Firebase Cloud Messaging
      // For now, just return the count
      const result = {
        totalUsers: users.length,
        usersWithTokens: usersWithTokens.length,
        title,
        body,
        data
      };

      res.json({
        success: true,
        message: `Notification queued for ${usersWithTokens.length} users`,
        data: result
      });

    } catch (error) {
      console.error('❌ [Notifications] Send error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get notification history
   * @route GET /api/super-admin/notifications/history
   */
  async getHistory(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        clubId
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // TODO: Implement notification history from database
      // For now, return empty array
      res.json({
        success: true,
        data: {
          notifications: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
          }
        }
      });

    } catch (error) {
      console.error('❌ [Notifications] History error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new NotificationsController();

/**
 * Clubs Management Controller
 * Handles CRUD operations for system clubs (super admin only)
 */

const { masterPrisma } = require('../database');

class ClubsController {
  /**
   * List all clubs with pagination and filters
   * @route GET /api/super-admin/clubs
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        subscriptionStatus,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (status) {
        where.status = status;
      }

      if (subscriptionStatus) {
        where.subscriptionStatus = subscriptionStatus;
      }

      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { companyDocument: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const total = await masterPrisma.club.count({ where });

      // Get clubs
      const clubs = await masterPrisma.club.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          branding: {
            select: {
              logoUrl: true,
              appName: true,
              primaryColor: true
            }
          },
          stats: {
            select: {
              totalUsers: true,
              totalConsumers: true,
              totalMerchants: true,
              totalRevenue: true,
              totalCashbackPaid: true
            }
          },
          _count: {
            select: {
              admins: true,
              modules: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          clubs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] List error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get club by ID
   * @route GET /api/super-admin/clubs/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const club = await masterPrisma.club.findUnique({
        where: { id },
        include: {
          branding: true,
          stats: true,
          cashbackConfig: true,
          withdrawalConfig: true,
          modules: {
            orderBy: {
              sortOrder: 'asc'
            }
          },
          admins: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              admins: true,
              modules: true,
              apiKeys: true
            }
          }
        }
      });

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Clube not found'
        });
      }

      res.json({
        success: true,
        data: { club }
      });

    } catch (error) {
      console.error('❌ [Clubs] Get by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get club statistics
   * @route GET /api/super-admin/clubs/:id/stats
   */
  async getStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await masterPrisma.clubStats.findUnique({
        where: { clubId: id }
      });

      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Stats not found for this club'
        });
      }

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('❌ [Clubs] Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update club status
   * @route PATCH /api/super-admin/clubs/:id/status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['trial', 'active', 'suspended', 'cancelled', 'expired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const club = await masterPrisma.club.update({
        where: { id },
        data: { status }
      });

      res.json({
        success: true,
        message: 'Clube status updated successfully',
        data: { club }
      });

    } catch (error) {
      console.error('❌ [Clubs] Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get global dashboard stats
   * @route GET /api/super-admin/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      // Get total counts
      const totalClubs = await masterPrisma.club.count();
      const activeClubs = await masterPrisma.club.count({
        where: { status: 'active' }
      });
      const trialClubs = await masterPrisma.club.count({
        where: { status: 'trial' }
      });

      // Get aggregated stats from all clubs
      const allStats = await masterPrisma.clubStats.findMany();

      const aggregated = allStats.reduce((acc, stat) => {
        acc.totalUsers += stat.totalUsers || 0;
        acc.totalConsumers += stat.totalConsumers || 0;
        acc.totalMerchants += stat.totalMerchants || 0;
        acc.totalPurchases += stat.totalPurchases || 0;
        acc.totalRevenue += parseFloat(stat.totalRevenue || 0);
        acc.totalCashbackPaid += parseFloat(stat.totalCashbackPaid || 0);
        acc.totalPlatformFees += parseFloat(stat.totalPlatformFees || 0);
        acc.revenue30d += parseFloat(stat.revenue30d || 0);
        acc.purchases30d += stat.purchases30d || 0;
        return acc;
      }, {
        totalUsers: 0,
        totalConsumers: 0,
        totalMerchants: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        totalCashbackPaid: 0,
        totalPlatformFees: 0,
        revenue30d: 0,
        purchases30d: 0
      });

      // Get recent clubs
      const recentClubs = await masterPrisma.club.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          branding: {
            select: {
              logoUrl: true,
              appName: true
            }
          },
          stats: {
            select: {
              totalUsers: true,
              totalRevenue: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          clubs: {
            total: totalClubs,
            active: activeClubs,
            trial: trialClubs
          },
          ...aggregated,
          recentClubs
        }
      });

    } catch (error) {
      console.error('❌ [Clubs] Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClubsController();

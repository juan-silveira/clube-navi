/**
 * Billing Controller
 * Handles billing and subscription management for clubs
 */

const { masterPrisma } = require('../database');

class BillingController {
  /**
   * List all billing records
   * @route GET /api/super-admin/billing
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        clubId,
        status,
        search
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (clubId) {
        where.clubId = clubId;
      }

      if (status) {
        where.status = status;
      }

      if (search) {
        where.club = {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } }
          ]
        };
      }

      // Get billing records (using clubs as proxy for now)
      const total = await masterPrisma.club.count({ where });

      const clubs = await masterPrisma.club.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          branding: {
            select: {
              logoUrl: true,
              appName: true
            }
          }
        }
      });

      // Transform to billing format
      const billingRecords = clubs.map(club => ({
        id: club.id,
        clubId: club.id,
        clubName: club.branding?.appName || club.companyName,
        clubSlug: club.slug,
        logoUrl: club.branding?.logoUrl,
        status: club.subscriptionStatus,
        plan: club.subscriptionPlan || 'basic',
        subscriptionStartDate: club.subscriptionStartDate,
        subscriptionEndDate: club.subscriptionEndDate,
        monthlyFee: club.subscriptionPlan === 'premium' ? 499.00 : 199.00,
        createdAt: club.createdAt
      }));

      res.json({
        success: true,
        data: {
          billing: billingRecords,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ [Billing] List error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get billing statistics
   * @route GET /api/super-admin/billing/stats
   */
  async getStats(req, res) {
    try {
      const [
        totalActive,
        totalPending,
        totalCancelled,
        basicPlan,
        premiumPlan
      ] = await Promise.all([
        masterPrisma.club.count({ where: { subscriptionStatus: 'active' } }),
        masterPrisma.club.count({ where: { subscriptionStatus: 'pending' } }),
        masterPrisma.club.count({ where: { subscriptionStatus: 'cancelled' } }),
        masterPrisma.club.count({ where: { subscriptionPlan: 'basic' } }),
        masterPrisma.club.count({ where: { subscriptionPlan: 'premium' } })
      ]);

      // Calculate monthly revenue
      const basicRevenue = basicPlan * 199.00;
      const premiumRevenue = premiumPlan * 499.00;
      const totalRevenue = basicRevenue + premiumRevenue;

      res.json({
        success: true,
        data: {
          subscriptions: {
            active: totalActive,
            pending: totalPending,
            cancelled: totalCancelled,
            total: totalActive + totalPending + totalCancelled
          },
          plans: {
            basic: basicPlan,
            premium: premiumPlan
          },
          revenue: {
            monthly: totalRevenue,
            basicPlan: basicRevenue,
            premiumPlan: premiumRevenue
          }
        }
      });

    } catch (error) {
      console.error('❌ [Billing] Stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update billing status
   * @route PATCH /api/super-admin/billing/:clubId/status
   */
  async updateStatus(req, res) {
    try {
      const { clubId } = req.params;
      const { status } = req.body;

      if (!['active', 'pending', 'cancelled', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const club = await masterPrisma.club.update({
        where: { id: clubId },
        data: {
          subscriptionStatus: status
        }
      });

      res.json({
        success: true,
        message: 'Billing status updated successfully',
        data: { club }
      });

    } catch (error) {
      console.error('❌ [Billing] Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new BillingController();

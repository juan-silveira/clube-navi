/**
 * Club Admins Controller
 * Handles operations for club administrators
 */

const { masterPrisma } = require('../database');

class ClubAdminsController {
  /**
   * List all club admins with pagination and filters
   * @route GET /api/super-admin/club-admins
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        clubId,
        isActive,
        role,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (clubId) {
        where.clubId = clubId;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const total = await masterPrisma.clubAdmin.count({ where });

      // Get club admins
      const clubAdmins = await masterPrisma.clubAdmin.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder
        },
        select: {
          id: true,
          clubId: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          club: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              status: true,
              branding: {
                select: {
                  logoUrl: true,
                  appName: true
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          clubAdmins,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ [ClubAdmins] List error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get club admin by ID
   * @route GET /api/super-admin/club-admins/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const clubAdmin = await masterPrisma.clubAdmin.findUnique({
        where: { id },
        select: {
          id: true,
          clubId: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          club: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              status: true,
              subscriptionStatus: true,
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
                  totalMerchants: true
                }
              }
            }
          }
        }
      });

      if (!clubAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Club admin not found'
        });
      }

      res.json({
        success: true,
        data: { clubAdmin }
      });

    } catch (error) {
      console.error('❌ [ClubAdmins] Get by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update club admin status
   * @route PATCH /api/super-admin/club-admins/:id/status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const clubAdmin = await masterPrisma.clubAdmin.update({
        where: { id },
        data: { isActive }
      });

      res.json({
        success: true,
        message: 'Club admin status updated successfully',
        data: { clubAdmin }
      });

    } catch (error) {
      console.error('❌ [ClubAdmins] Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get statistics about club admins
   * @route GET /api/super-admin/club-admins/stats
   */
  async getStats(req, res) {
    try {
      const total = await masterPrisma.clubAdmin.count();
      const active = await masterPrisma.clubAdmin.count({
        where: { isActive: true }
      });
      const inactive = await masterPrisma.clubAdmin.count({
        where: { isActive: false }
      });

      // Count by role
      const superAdmins = await masterPrisma.clubAdmin.count({
        where: { role: 'super_admin' }
      });
      const admins = await masterPrisma.clubAdmin.count({
        where: { role: 'admin' }
      });
      const managers = await masterPrisma.clubAdmin.count({
        where: { role: 'manager' }
      });

      // Recent logins
      const recentLogins = await masterPrisma.clubAdmin.findMany({
        where: {
          lastLoginAt: { not: null }
        },
        orderBy: {
          lastLoginAt: 'desc'
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          lastLoginAt: true,
          club: {
            select: {
              companyName: true,
              branding: {
                select: {
                  appName: true
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          total,
          active,
          inactive,
          byRole: {
            super_admin: superAdmins,
            admin: admins,
            manager: managers
          },
          recentLogins
        }
      });

    } catch (error) {
      console.error('❌ [ClubAdmins] Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClubAdminsController();

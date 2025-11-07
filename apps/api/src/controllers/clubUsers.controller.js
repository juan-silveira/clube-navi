/**
 * Club Users Controller
 * Handles users from all clubs
 */

const { masterPrisma } = require('../database');
const { getClubClient } = require('../database');

class ClubUsersController {
  /**
   * List users from all clubs
   * @route GET /api/super-admin/club-users
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        clubId,
        search,
        isActive,
        role
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Get clubs
      const clubsQuery = clubId ? { id: clubId } : { status: 'active' };
      const clubs = await masterPrisma.club.findMany({
        where: clubsQuery,
        select: {
          id: true,
          companyName: true,
          slug: true,
          databaseUrl: true,
          branding: {
            select: {
              logoUrl: true,
              appName: true
            }
          }
        }
      });

      // Fetch users from each club
      const allUsers = [];
      for (const club of clubs) {
        try {
          const clubPrisma = await getClubClient(club.databaseUrl);

          const where = {};
          if (search) {
            where.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { cpf: { contains: search, mode: 'insensitive' } }
            ];
          }
          if (isActive !== undefined) {
            where.isActive = isActive === 'true';
          }
          if (role) {
            where.role = role;
          }

          const users = await clubPrisma.user.findMany({
            where,
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              phone: true,
              role: true,
              isActive: true,
              emailVerified: true,
              createdAt: true,
              lastLoginAt: true
            },
            take: take,
            skip: skip
          });

          users.forEach(user => {
            allUsers.push({
              ...user,
              club: {
                id: club.id,
                name: club.branding?.appName || club.companyName,
                slug: club.slug,
                logoUrl: club.branding?.logoUrl
              }
            });
          });
        } catch (error) {
          console.error(`Error fetching users from club ${club.id}:`, error.message);
        }
      }

      // Paginate results
      const total = allUsers.length;
      const paginatedUsers = allUsers.slice(skip, skip + take);

      res.json({
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ [ClubUsers] List error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user statistics across all clubs
   * @route GET /api/super-admin/club-users/stats
   */
  async getStats(req, res) {
    try {
      const { clubId } = req.query;

      const clubsQuery = clubId ? { id: clubId } : { status: 'active' };
      const clubs = await masterPrisma.club.findMany({
        where: clubsQuery,
        select: {
          id: true,
          databaseUrl: true
        }
      });

      let totalUsers = 0;
      let activeUsers = 0;
      let consumers = 0;
      let merchants = 0;

      for (const club of clubs) {
        try {
          const clubPrisma = await getClubClient(club.databaseUrl);

          const [total, active, consumersCount, merchantsCount] = await Promise.all([
            clubPrisma.user.count(),
            clubPrisma.user.count({ where: { isActive: true } }),
            clubPrisma.user.count({ where: { role: 'consumer' } }),
            clubPrisma.user.count({ where: { role: 'merchant' } })
          ]);

          totalUsers += total;
          activeUsers += active;
          consumers += consumersCount;
          merchants += merchantsCount;
        } catch (error) {
          console.error(`Error fetching stats from club ${club.id}:`, error.message);
        }
      }

      res.json({
        success: true,
        data: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          consumers,
          merchants
        }
      });

    } catch (error) {
      console.error('❌ [ClubUsers] Stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClubUsersController();

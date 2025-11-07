/**
 * Club Groups Controller
 * Handles groups from all clubs
 */

const { masterPrisma } = require('../database');
const { getClubClient } = require('../database');

class ClubGroupsController {
  /**
   * List groups from all clubs
   * @route GET /api/super-admin/club-groups
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        clubId,
        search
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

      // Fetch groups from each club
      const allGroups = [];
      for (const club of clubs) {
        try {
          const clubPrisma = await getClubClient(club.databaseUrl);

          const where = {};
          if (search) {
            where.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ];
          }

          const groups = await clubPrisma.group.findMany({
            where,
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
              createdAt: true,
              _count: {
                select: {
                  members: true
                }
              }
            },
            take: take,
            skip: skip
          });

          groups.forEach(group => {
            allGroups.push({
              ...group,
              memberCount: group._count.members,
              club: {
                id: club.id,
                name: club.branding?.appName || club.companyName,
                slug: club.slug,
                logoUrl: club.branding?.logoUrl
              }
            });
          });
        } catch (error) {
          console.error(`Error fetching groups from club ${club.id}:`, error.message);
        }
      }

      // Paginate results
      const total = allGroups.length;
      const paginatedGroups = allGroups.slice(skip, skip + take);

      res.json({
        success: true,
        data: {
          groups: paginatedGroups,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ [ClubGroups] List error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get group statistics across all clubs
   * @route GET /api/super-admin/club-groups/stats
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

      let totalGroups = 0;
      let activeGroups = 0;
      let totalMembers = 0;

      for (const club of clubs) {
        try {
          const clubPrisma = await getClubClient(club.databaseUrl);

          const [total, active, groups] = await Promise.all([
            clubPrisma.group.count(),
            clubPrisma.group.count({ where: { isActive: true } }),
            clubPrisma.group.findMany({
              select: {
                _count: {
                  select: {
                    members: true
                  }
                }
              }
            })
          ]);

          totalGroups += total;
          activeGroups += active;
          totalMembers += groups.reduce((sum, g) => sum + g._count.members, 0);
        } catch (error) {
          console.error(`Error fetching stats from club ${club.id}:`, error.message);
        }
      }

      res.json({
        success: true,
        data: {
          total: totalGroups,
          active: activeGroups,
          inactive: totalGroups - activeGroups,
          totalMembers,
          averageMembers: totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0
        }
      });

    } catch (error) {
      console.error('❌ [ClubGroups] Stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClubGroupsController();

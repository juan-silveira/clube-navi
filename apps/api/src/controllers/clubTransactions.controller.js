/**
 * Club Transactions Controller
 * Handles transactions from all clubs
 */

const { masterPrisma } = require('../database');
const { getClubClient } = require('../database');

class ClubTransactionsController {
  /**
   * List transactions from all clubs
   * @route GET /api/super-admin/club-transactions
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        clubId,
        status,
        type,
        startDate,
        endDate
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

      // Fetch transactions from each club
      const allTransactions = [];
      for (const club of clubs) {
        try {
          const clubPrisma = await getClubClient(club.databaseUrl);

          const where = {};
          if (status) {
            where.status = status;
          }
          if (type) {
            where.type = type;
          }
          if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
              where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
              where.createdAt.lte = new Date(endDate);
            }
          }

          const transactions = await clubPrisma.transaction.findMany({
            where,
            select: {
              id: true,
              type: true,
              amount: true,
              status: true,
              description: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            take: take,
            skip: skip,
            orderBy: {
              createdAt: 'desc'
            }
          });

          transactions.forEach(transaction => {
            allTransactions.push({
              ...transaction,
              club: {
                id: club.id,
                name: club.branding?.appName || club.companyName,
                slug: club.slug,
                logoUrl: club.branding?.logoUrl
              }
            });
          });
        } catch (error) {
          console.error(`Error fetching transactions from club ${club.id}:`, error.message);
        }
      }

      // Sort by date and paginate
      allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const total = allTransactions.length;
      const paginatedTransactions = allTransactions.slice(skip, skip + take);

      res.json({
        success: true,
        data: {
          transactions: paginatedTransactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ [ClubTransactions] List error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get transaction statistics across all clubs
   * @route GET /api/super-admin/club-transactions/stats
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

      let totalTransactions = 0;
      let totalAmount = 0;
      let completedTransactions = 0;
      let pendingTransactions = 0;
      let failedTransactions = 0;

      for (const club of clubs) {
        try {
          const clubPrisma = await getClubClient(club.databaseUrl);

          const [total, completed, pending, failed, amountResult] = await Promise.all([
            clubPrisma.transaction.count(),
            clubPrisma.transaction.count({ where: { status: 'completed' } }),
            clubPrisma.transaction.count({ where: { status: 'pending' } }),
            clubPrisma.transaction.count({ where: { status: 'failed' } }),
            clubPrisma.transaction.aggregate({
              where: { status: 'completed' },
              _sum: {
                amount: true
              }
            })
          ]);

          totalTransactions += total;
          completedTransactions += completed;
          pendingTransactions += pending;
          failedTransactions += failed;
          totalAmount += parseFloat(amountResult._sum.amount || 0);
        } catch (error) {
          console.error(`Error fetching stats from club ${club.id}:`, error.message);
        }
      }

      res.json({
        success: true,
        data: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: pendingTransactions,
          failed: failedTransactions,
          totalAmount: totalAmount,
          averageAmount: totalTransactions > 0 ? totalAmount / totalTransactions : 0
        }
      });

    } catch (error) {
      console.error('❌ [ClubTransactions] Stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ClubTransactionsController();

/**
 * Club Admin Transactions Routes
 * Gerenciar transações do clube específico
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');

/**
 * GET /api/club-admin/transactions
 * Listar transações do clube
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const {
      page = 1,
      limit = 20,
      type,
      status,
      userId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
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

    // Buscar transações
    const [transactions, total] = await Promise.all([
      clubPrisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      clubPrisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Transactions] List error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/club-admin/transactions/stats
 * Estatísticas de transações
 */
router.get('/stats', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { startDate, endDate } = req.query;

    // Construir filtro de data
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.lte = new Date(endDate);
      }
    }

    const [
      total,
      completed,
      pending,
      failed,
      deposits,
      withdrawals,
      transfers
    ] = await Promise.all([
      clubPrisma.transaction.count({ where: dateFilter }),
      clubPrisma.transaction.count({
        where: { ...dateFilter, status: 'completed' }
      }),
      clubPrisma.transaction.count({
        where: { ...dateFilter, status: 'pending' }
      }),
      clubPrisma.transaction.count({
        where: { ...dateFilter, status: 'failed' }
      }),
      clubPrisma.transaction.count({
        where: { ...dateFilter, type: 'deposit' }
      }),
      clubPrisma.transaction.count({
        where: { ...dateFilter, type: 'withdrawal' }
      }),
      clubPrisma.transaction.count({
        where: { ...dateFilter, type: 'transfer' }
      })
    ]);

    // Calcular totais por tipo
    const depositSum = await clubPrisma.transaction.aggregate({
      where: { ...dateFilter, type: 'deposit', status: 'completed' },
      _sum: { amount: true }
    });

    const withdrawalSum = await clubPrisma.transaction.aggregate({
      where: { ...dateFilter, type: 'withdrawal', status: 'completed' },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          completed,
          pending,
          failed
        },
        byType: {
          deposits: {
            count: deposits,
            total: depositSum._sum.amount || 0
          },
          withdrawals: {
            count: withdrawals,
            total: withdrawalSum._sum.amount || 0
          },
          transfers: {
            count: transfers
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Transactions] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/club-admin/transactions/:txId
 * Obter detalhes de uma transação específica
 */
router.get('/:txId', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { txId } = req.params;

    const transaction = await clubPrisma.transaction.findUnique({
      where: { id: txId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('❌ [Club Admin Transactions] Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

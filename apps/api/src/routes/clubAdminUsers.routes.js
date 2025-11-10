/**
 * Club Admin Users Routes
 * Gerenciar usuários do clube específico
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');

/**
 * GET /api/club-admin/users
 * Listar usuários do clube
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { page = 1, limit = 20, search, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Buscar usuários
    const [users, total] = await Promise.all([
      clubPrisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          emailConfirmed: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      clubPrisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] List error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/club-admin/users/stats
 * Estatísticas de usuários
 */
router.get('/stats', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;

    const [total, active, emailConfirmed] = await Promise.all([
      clubPrisma.user.count(),
      clubPrisma.user.count({ where: { isActive: true } }),
      clubPrisma.user.count({ where: { emailConfirmed: true } })
    ]);

    // Usuários dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await clubPrisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        emailConfirmed,
        emailNotConfirmed: total - emailConfirmed,
        newUsers
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/club-admin/users/:userId
 * Obter detalhes de um usuário específico
 */
router.get('/:userId', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { userId } = req.params;

    const user = await clubPrisma.user.findUnique({
      where: { id: userId },
      include: {
        balance: true,
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/club-admin/users/:userId/status
 * Atualizar status do usuário (ativar/desativar)
 */
router.patch('/:userId/status', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean'
      });
    }

    const user = await clubPrisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

/**
 * Club Admin Info Routes
 * Endpoints para obter informações do clube e estatísticas
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');
const { resolveClubMiddleware } = require('../middleware/club-resolution.middleware');

/**
 * GET /api/club-admin/club-info
 * Obter informações do clube (sem autenticação para branding na tela de login)
 */
router.get('/club-info', resolveClubMiddleware, async (req, res) => {
  try {
    const club = req.club;

    // Retornar dados públicos do clube para branding
    res.json({
      success: true,
      data: {
        id: club.id,
        slug: club.slug,
        companyName: club.companyName,
        status: club.status,
        branding: club.branding || {},
        modules: club.modules || [],
        createdAt: club.createdAt
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Info] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/club-admin/club-stats
 * Obter estatísticas gerais do clube
 */
router.get('/club-stats', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;

    // Obter estatísticas do banco do clube
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalProducts,
      totalGroups
    ] = await Promise.all([
      clubPrisma.user.count(),
      clubPrisma.user.count({ where: { isActive: true } }),
      clubPrisma.transaction.count(),
      clubPrisma.product.count(),
      clubPrisma.group.count()
    ]);

    // Obter transações recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTransactions = await clubPrisma.transaction.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Obter novos usuários (últimos 7 dias)
    const newUsers = await clubPrisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          new: newUsers
        },
        transactions: {
          total: totalTransactions,
          recent: recentTransactions
        },
        products: {
          total: totalProducts
        },
        groups: {
          total: totalGroups
        }
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Stats] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/club-admin/club-settings
 * Atualizar configurações do clube (apenas role admin ou owner)
 */
router.put('/club-settings', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubAdmin } = req;
    const { role } = clubAdmin;

    // Verificar permissão (apenas admin ou owner)
    if (role !== 'admin' && role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Admin or owner role required.'
      });
    }

    // TODO: Implementar atualização de configurações
    // Por enquanto, retornar sucesso

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('❌ [Club Admin Settings] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

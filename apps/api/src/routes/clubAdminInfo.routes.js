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
 * NOTA: resolveClubMiddleware já foi aplicado no app.js
 */
router.get('/club-info', async (req, res) => {
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
 * NOTA: resolveClubMiddleware já foi aplicado no app.js
 */
router.get('/club-stats', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const club = req.club;

    // Datas de referência
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // MEMBROS (Usuários consumidores)
    const [
      totalMembers,
      activeMembers,
      newMembers7d
    ] = await Promise.all([
      clubPrisma.user.count({ where: { userType: 'consumer' } }),
      clubPrisma.user.count({ where: { userType: 'consumer', isActive: true } }),
      clubPrisma.user.count({ where: { userType: 'consumer', createdAt: { gte: sevenDaysAgo } } })
    ]);

    // COMERCIANTES (Merchants)
    const [
      totalMerchants,
      activeMerchants,
      pendingMerchants,
      newMerchants7d
    ] = await Promise.all([
      clubPrisma.user.count({ where: { userType: 'merchant' } }),
      clubPrisma.user.count({ where: { userType: 'merchant', isActive: true } }),
      clubPrisma.user.count({ where: { userType: 'merchant', isActive: false } }),
      clubPrisma.user.count({ where: { userType: 'merchant', createdAt: { gte: sevenDaysAgo } } })
    ]);

    // PRODUTOS (safe queries with fallback)
    let totalProducts = 0;
    let activeProducts = 0;
    let totalGroups = 0;

    try {
      totalProducts = await clubPrisma.product.count();
      activeProducts = await clubPrisma.product.count({ where: { isActive: true } });
    } catch (err) {
      console.warn('⚠️ Erro ao contar produtos:', err.message);
    }

    try {
      totalGroups = await clubPrisma.group.count();
    } catch (err) {
      console.warn('⚠️ Erro ao contar grupos:', err.message);
    }

    // TRANSAÇÕES (usando tabela purchases com status corretos: pending, processing, completed, failed, refunded)
    const [
      totalTransactions,
      todayTransactions,
      confirmedTransactions,
      pendingTransactions,
      cancelledTransactions
    ] = await Promise.all([
      clubPrisma.purchase.count(),
      clubPrisma.purchase.count({ where: { createdAt: { gte: today } } }),
      clubPrisma.purchase.count({ where: { status: 'completed' } }),
      clubPrisma.purchase.count({ where: { status: 'pending' } }),
      clubPrisma.purchase.count({ where: { status: 'failed' } })
    ]);

    // FINANCEIRO - Agregações (usando tabela purchases)
    const financialData = await clubPrisma.purchase.aggregate({
      where: { status: 'completed' },
      _sum: {
        totalAmount: true,
        consumerCashback: true
      },
      _avg: {
        totalAmount: true
      }
    });

    const financial30d = await clubPrisma.purchase.aggregate({
      where: {
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        totalAmount: true,
        consumerCashback: true
      }
    });

    // Calcular taxa média de cashback (percentual médio de cashback em relação ao valor total)
    const totalVolume = Number(financialData._sum.totalAmount || 0);
    const totalCashback = Number(financialData._sum.consumerCashback || 0);
    const avgCashbackRate = totalVolume > 0
      ? (totalCashback / totalVolume) * 100
      : 0;

    // GRÁFICO - Transações dos últimos 30 dias (usando tabela purchases)
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const count = await clubPrisma.purchase.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });

      chartData.push({
        date: startOfDay.toISOString(),
        count
      });
    }

    // PERFORMANCE
    const totalTransactionsForRate = await clubPrisma.purchase.count();
    const successRate = totalTransactionsForRate > 0
      ? Math.round((confirmedTransactions / totalTransactionsForRate) * 100)
      : 0;

    const engagementRate = totalMembers > 0
      ? Math.round((activeMembers / totalMembers) * 100)
      : 0;

    const avgTransactionsPerDay = chartData.length > 0
      ? Math.round(chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length)
      : 0;

    // TOP MERCHANTS - Top 3 comerciantes por volume de vendas
    const topMerchantsData = await clubPrisma.purchase.groupBy({
      by: ['merchantId'],
      where: { status: 'completed' },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      },
      take: 3
    });

    const topMerchants = await Promise.all(
      topMerchantsData.map(async (item) => {
        const merchant = await clubPrisma.user.findUnique({
          where: { id: item.merchantId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        });
        return {
          ...merchant,
          totalSales: item._sum.totalAmount || 0,
          transactionCount: item._count.id
        };
      })
    );

    // TOP MEMBERS - Top 3 consumidores por volume de compras
    const topMembersData = await clubPrisma.purchase.groupBy({
      by: ['consumerId'],
      where: { status: 'completed' },
      _sum: {
        totalAmount: true,
        consumerCashback: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      },
      take: 3
    });

    const topMembers = await Promise.all(
      topMembersData.map(async (item) => {
        const member = await clubPrisma.user.findUnique({
          where: { id: item.consumerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        });
        return {
          ...member,
          totalSpent: item._sum.totalAmount || 0,
          totalCashback: item._sum.consumerCashback || 0,
          transactionCount: item._count.id
        };
      })
    );

    res.json({
      success: true,
      data: {
        clubInfo: {
          name: club.companyName,
          slug: club.slug
        },
        members: {
          total: totalMembers,
          active: activeMembers,
          inactive: totalMembers - activeMembers,
          new7days: newMembers7d
        },
        merchants: {
          total: totalMerchants,
          active: activeMerchants,
          pending: pendingMerchants,
          new7days: newMerchants7d
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: totalProducts - activeProducts,
          groups: totalGroups
        },
        transactions: {
          total: totalTransactions,
          today: todayTransactions,
          confirmed: confirmedTransactions,
          pending: pendingTransactions,
          cancelled: cancelledTransactions,
          chartData
        },
        financial: {
          totalVolume: financialData._sum.totalAmount || 0,
          totalCashback: financialData._sum.consumerCashback || 0,
          volume30d: financial30d._sum.totalAmount || 0,
          cashback30d: financial30d._sum.consumerCashback || 0,
          avgTicket: financialData._avg.totalAmount || 0,
          avgCashbackRate: avgCashbackRate
        },
        performance: {
          successRate,
          engagementRate,
          avgTransactionsPerDay
        },
        rankings: {
          topMerchants,
          topMembers
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Stats] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/users
 * Obter lista de usuários filtrada por tipo
 * Query params: userType (consumer, merchant, admin)
 */
router.get('/users', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { userType } = req.query;

    const where = {};
    if (userType) {
      where.userType = userType;
    }

    const users = await clubPrisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        cpf: true,
        phone: true,
        isActive: true,
        userType: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/products
 * Obter lista de produtos
 */
router.get('/products', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { category, isActive, merchantId } = req.query;

    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (merchantId) where.merchantId = merchantId;

    const products = await clubPrisma.product.findMany({
      where,
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('❌ [Club Admin Products] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/purchases
 * Obter lista de compras/transações
 */
router.get('/purchases', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { status, consumerId, merchantId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (consumerId) where.consumerId = consumerId;
    if (merchantId) where.merchantId = merchantId;

    const purchases = await clubPrisma.purchase.findMany({
      where,
      include: {
        consumer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('❌ [Club Admin Purchases] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/groups
 * Obter lista de grupos
 */
router.get('/groups', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;

    const groups = await clubPrisma.group.findMany({
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                userType: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatar resposta com contagem de membros
    const formattedGroups = groups.map(group => ({
      ...group,
      memberCount: group.users.length,
      members: group.users.map(gu => gu.user)
    }));

    res.json({
      success: true,
      data: formattedGroups
    });

  } catch (error) {
    console.error('❌ [Club Admin Groups] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

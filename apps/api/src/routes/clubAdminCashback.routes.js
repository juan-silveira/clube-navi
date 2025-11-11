const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');
const { masterPrisma } = require('../database');

/**
 * GET /api/club-admin/cashback/stats
 * Obter estatísticas de cashback do clube
 */
router.get('/stats', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const clubId = req.clubAdmin?.clubId;

    // Total distribuído
    const totalStats = await clubPrisma.purchase.aggregate({
      where: {
        status: 'completed'
      },
      _sum: {
        consumerCashback: true,
        consumerReferrerFee: true,
        merchantReferrerFee: true,
        platformFee: true
      },
      _count: {
        id: true
      }
    });

    // Último mês
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const lastMonthStats = await clubPrisma.purchase.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: lastMonthDate
        }
      },
      _sum: {
        consumerCashback: true
      }
    });

    // Transações recentes com cashback
    const recentTransactions = await clubPrisma.purchase.findMany({
      where: {
        status: 'completed',
        consumerCashback: {
          gt: 0
        }
      },
      include: {
        consumer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Formatar transações
    const formattedTransactions = recentTransactions.map(t => ({
      id: t.id,
      consumerName: `${t.consumer.firstName} ${t.consumer.lastName}`,
      consumerCashback: t.consumerCashback,
      totalAmount: t.totalAmount,
      createdAt: t.createdAt
    }));

    // Buscar configuração do clube no master database
    const club = await masterPrisma.club.findUnique({
      where: { id: clubId },
      include: {
        cashbackConfig: true
      }
    });

    const totalDistributed =
      Number(totalStats._sum.consumerCashback || 0) +
      Number(totalStats._sum.consumerReferrerFee || 0) +
      Number(totalStats._sum.merchantReferrerFee || 0) +
      Number(totalStats._sum.platformFee || 0);

    const avgCashback = totalStats._count.id > 0
      ? Number(totalStats._sum.consumerCashback || 0) / totalStats._count.id
      : 0;

    // Mapear configuração do schema para o formato esperado pelo frontend
    const frontendConfig = club?.cashbackConfig ? {
      consumerPercentage: Number(club.cashbackConfig.consumerPercent),
      merchantPercentage: 0, // Não usado no schema atual
      clubPercentage: Number(club.cashbackConfig.clubPercent),
      consumerReferrerPercentage: Number(club.cashbackConfig.consumerReferrerPercent),
      merchantReferrerPercentage: Number(club.cashbackConfig.merchantReferrerPercent),
      minPurchaseAmount: 0,
      maxCashbackPerTransaction: 0
    } : null;

    res.json({
      totalDistributed,
      lastMonth: Number(lastMonthStats._sum.consumerCashback || 0),
      transactionCount: totalStats._count.id,
      avgCashback,
      recentTransactions: formattedTransactions,
      config: frontendConfig
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de cashback:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ error: 'Erro ao buscar estatísticas de cashback', details: error.message });
  }
});

/**
 * POST /api/club-admin/cashback/config
 * Salvar configuração de cashback do clube
 */
router.post('/config', authenticateClubAdmin, async (req, res) => {
  try {
    const {
      consumerPercentage,
      clubPercentage,
      consumerReferrerPercentage,
      merchantReferrerPercentage
    } = req.body;

    // Validar dados
    if (consumerPercentage < 0 || clubPercentage < 0) {
      return res.status(400).json({ error: 'Porcentagens não podem ser negativas' });
    }

    if (consumerReferrerPercentage !== undefined && consumerReferrerPercentage < 0) {
      return res.status(400).json({ error: 'Porcentagem de referral não pode ser negativa' });
    }

    if (merchantReferrerPercentage !== undefined && merchantReferrerPercentage < 0) {
      return res.status(400).json({ error: 'Porcentagem de referral não pode ser negativa' });
    }

    // Validar se a soma é 100%
    const total = Number(consumerPercentage || 0) +
                  Number(clubPercentage || 0) +
                  Number(consumerReferrerPercentage || 0) +
                  Number(merchantReferrerPercentage || 0);

    if (total > 100) {
      return res.status(400).json({
        error: 'A soma das porcentagens não pode exceder 100%',
        total: total.toFixed(2)
      });
    }

    // Verificar se já existe configuração
    const clubId = req.clubAdmin?.clubId || req.user?.clubId;
    if (!clubId) {
      return res.status(400).json({ error: 'Club ID not found in request' });
    }

    const existingConfig = await masterPrisma.clubCashbackConfig.findUnique({
      where: { clubId }
    });

    let updatedConfig;

    if (existingConfig) {
      // Atualizar configuração existente
      updatedConfig = await masterPrisma.clubCashbackConfig.update({
        where: { clubId },
        data: {
          consumerPercent: Number(consumerPercentage),
          clubPercent: Number(clubPercentage),
          consumerReferrerPercent: Number(consumerReferrerPercentage || 0),
          merchantReferrerPercent: Number(merchantReferrerPercentage || 0)
        }
      });
    } else {
      // Criar nova configuração
      updatedConfig = await masterPrisma.clubCashbackConfig.create({
        data: {
          clubId,
          consumerPercent: Number(consumerPercentage),
          clubPercent: Number(clubPercentage),
          consumerReferrerPercent: Number(consumerReferrerPercentage || 0),
          merchantReferrerPercent: Number(merchantReferrerPercentage || 0)
        }
      });
    }

    res.json({
      success: true,
      message: 'Configuração de cashback atualizada com sucesso',
      config: {
        consumerPercentage: Number(updatedConfig.consumerPercent),
        clubPercentage: Number(updatedConfig.clubPercent),
        consumerReferrerPercentage: Number(updatedConfig.consumerReferrerPercent),
        merchantReferrerPercentage: Number(updatedConfig.merchantReferrerPercent)
      }
    });
  } catch (error) {
    console.error('Erro ao salvar configuração de cashback:', error);
    res.status(500).json({ error: 'Erro ao salvar configuração de cashback' });
  }
});

module.exports = router;

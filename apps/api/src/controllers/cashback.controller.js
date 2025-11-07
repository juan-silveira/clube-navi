/**
 * Cashback Controller - Multi-Tenant
 * Gerencia estatísticas e consultas de cashback
 * Usa req.tenantPrisma para isolamento de dados por tenant
 */

const cashbackService = require('../services/cashback.service');

/**
 * Obter configuração de cashback do tenant
 */
const getTenantConfig = async (req, res) => {
  try {
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant não identificado'
      });
    }

    const config = await cashbackService.getTenantCashbackConfig(tenantId);

    res.json({
      success: true,
      data: { config }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar configuração de cashback:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configuração de cashback',
      error: error.message
    });
  }
};

/**
 * Obter estatísticas de cashback do usuário
 */
const getUserStats = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const userId = req.user.id;

    const stats = await cashbackService.getUserCashbackStats(prisma, userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de cashback:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas de cashback',
      error: error.message
    });
  }
};

/**
 * Calcular distribuição de cashback (simulação)
 * Útil para o frontend mostrar preview antes da compra
 */
const calculateDistribution = async (req, res) => {
  try {
    const { totalAmount, cashbackPercentage } = req.body;
    const tenantId = req.tenant?.id;

    // Validações
    if (!totalAmount || !cashbackPercentage) {
      return res.status(400).json({
        success: false,
        message: 'totalAmount e cashbackPercentage são obrigatórios'
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'totalAmount deve ser maior que zero'
      });
    }

    if (cashbackPercentage < 0 || cashbackPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'cashbackPercentage deve estar entre 0 e 100'
      });
    }

    // Obter configuração do tenant
    const config = await cashbackService.getTenantCashbackConfig(tenantId);

    // Calcular distribuição
    const distribution = cashbackService.calculateDistribution(
      parseFloat(totalAmount),
      parseFloat(cashbackPercentage),
      config
    );

    res.json({
      success: true,
      data: {
        distribution,
        config: {
          consumerPercent: config.consumerPercent,
          clubPercent: config.clubPercent,
          consumerReferrerPercent: config.consumerReferrerPercent,
          merchantReferrerPercent: config.merchantReferrerPercent
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao calcular distribuição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao calcular distribuição',
      error: error.message
    });
  }
};

/**
 * Processar cashback de uma compra
 * (Normalmente seria chamado internamente pelo sistema, mas expondo para testes)
 */
const processPurchaseCashback = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const tenantId = req.tenant?.id;
    const { purchaseId } = req.params;

    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: 'purchaseId é obrigatório'
      });
    }

    const result = await cashbackService.processCashback(prisma, tenantId, purchaseId);

    console.log(`✅ Cashback processado para compra: ${purchaseId}`);
    console.log(`   Total Cashback: R$ ${result.distribution.totalCashback.toFixed(2)}`);

    res.json({
      success: true,
      message: 'Cashback processado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao processar cashback:', error);

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao processar cashback',
      error: error.message
    });
  }
};

/**
 * Obter histórico de cashback do usuário
 * Lista todas as transações de cashback (recebidas e pagas)
 */
const getCashbackHistory = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query; // type: 'received' ou 'paid'

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      type
    };

    // Buscar compras onde o usuário recebeu cashback
    const where = {};

    if (type === 'received') {
      // Como consumidor
      where.consumerId = userId;
    } else if (type === 'paid') {
      // Como merchant (pagou cashback)
      where.merchantId = userId;
    } else {
      // Ambos
      where.OR = [
        { consumerId: userId },
        { merchantId: userId }
      ];
    }

    where.status = 'completed'; // Apenas compras completadas

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        take: filters.limit,
        skip: (filters.page - 1) * filters.limit,
        orderBy: { completedAt: 'desc' },
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true
            }
          },
          consumer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          merchant: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.purchase.count({ where })
    ]);

    // Formatar histórico
    const history = purchases.map(purchase => ({
      purchaseId: purchase.id,
      date: purchase.completedAt,
      productName: purchase.product.name,
      productImage: purchase.product.imageUrl,
      totalAmount: parseFloat(purchase.totalAmount),
      cashbackAmount: purchase.consumerId === userId
        ? parseFloat(purchase.consumerCashback)
        : parseFloat(purchase.platformFee) +
          parseFloat(purchase.consumerReferrerFee) +
          parseFloat(purchase.merchantReferrerFee),
      type: purchase.consumerId === userId ? 'received' : 'paid',
      consumer: {
        id: purchase.consumer.id,
        name: `${purchase.consumer.firstName} ${purchase.consumer.lastName}`
      },
      merchant: {
        id: purchase.merchant.id,
        name: `${purchase.merchant.firstName} ${purchase.merchant.lastName}`
      }
    }));

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(total / filters.limit),
          hasMore: filters.page * filters.limit < total
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar histórico de cashback:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de cashback',
      error: error.message
    });
  }
};

module.exports = {
  getTenantConfig,
  getUserStats,
  calculateDistribution,
  processPurchaseCashback,
  getCashbackHistory
};

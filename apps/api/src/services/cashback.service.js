/**
 * Cashback Service
 *
 * Service para gerenciar lógica de cashback e distribuição
 */

const { getMasterClient } = require('../database/master-client');

class CashbackService {
  /**
   * Obter configuração de cashback do tenant
   * @param {String} tenantId - ID do tenant
   * @returns {Object} Configuração de cashback
   */
  async getTenantCashbackConfig(tenantId) {
    const masterPrisma = getMasterClient();

    const config = await masterPrisma.tenantCashbackConfig.findUnique({
      where: { tenantId }
    });

    // Retornar configuração ou valores padrão
    return config || {
      consumerPercent: 50.0,
      clubPercent: 25.0,
      consumerReferrerPercent: 15.0,
      merchantReferrerPercent: 10.0
    };
  }

  /**
   * Calcular distribuição de cashback
   * @param {Number} totalAmount - Valor total da compra
   * @param {Number} cashbackPercentage - Percentual de cashback do produto
   * @param {Object} config - Configuração de distribuição
   * @returns {Object} Distribuição calculada
   */
  calculateDistribution(totalAmount, cashbackPercentage, config) {
    // Calcular cashback total
    const totalCashback = totalAmount * (cashbackPercentage / 100);

    // Distribuir conforme configuração
    return {
      totalCashback,
      consumerCashback: totalCashback * (config.consumerPercent / 100),
      platformFee: totalCashback * (config.clubPercent / 100),
      consumerReferrerFee: totalCashback * (config.consumerReferrerPercent / 100),
      merchantReferrerFee: totalCashback * (config.merchantReferrerPercent / 100)
    };
  }

  /**
   * Distribuir cashback após compra
   * @param {Object} prisma - Prisma client do tenant
   * @param {String} purchaseId - ID da compra
   * @param {Object} distribution - Distribuição de cashback
   * @returns {Object} Resultado da distribuição
   */
  async distributeCashback(prisma, purchaseId, distribution) {
    // Buscar compra com todos os relacionamentos
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        consumer: {
          select: {
            id: true,
            referredBy: true,
            publicKey: true
          }
        },
        merchant: {
          select: {
            id: true,
            referredBy: true,
            publicKey: true
          }
        }
      }
    });

    if (!purchase) {
      throw new Error('Compra não encontrada');
    }

    // Preparar resultado
    const result = {
      purchaseId,
      distributions: [],
      totalDistributed: 0
    };

    // Distribuir para consumidor
    if (distribution.consumerCashback > 0) {
      result.distributions.push({
        recipientId: purchase.consumer.id,
        recipientType: 'consumer',
        amount: distribution.consumerCashback,
        percentage: distribution.consumerPercent
      });
      result.totalDistributed += distribution.consumerCashback;
    }

    // Distribuir para plataforma
    if (distribution.platformFee > 0) {
      result.distributions.push({
        recipientType: 'platform',
        amount: distribution.platformFee,
        percentage: distribution.clubPercent
      });
      result.totalDistributed += distribution.platformFee;
    }

    // Distribuir para indicador do consumidor (se houver)
    if (purchase.consumer.referredBy && distribution.consumerReferrerFee > 0) {
      const consumerReferrer = await prisma.user.findUnique({
        where: { referralId: purchase.consumer.referredBy },
        select: { id: true }
      });

      if (consumerReferrer) {
        result.distributions.push({
          recipientId: consumerReferrer.id,
          recipientType: 'consumer_referrer',
          amount: distribution.consumerReferrerFee,
          percentage: distribution.consumerReferrerPercent
        });
        result.totalDistributed += distribution.consumerReferrerFee;
      }
    }

    // Distribuir para indicador do merchant (se houver)
    if (purchase.merchant.referredBy && distribution.merchantReferrerFee > 0) {
      const merchantReferrer = await prisma.user.findUnique({
        where: { referralId: purchase.merchant.referredBy },
        select: { id: true }
      });

      if (merchantReferrer) {
        result.distributions.push({
          recipientId: merchantReferrer.id,
          recipientType: 'merchant_referrer',
          amount: distribution.merchantReferrerFee,
          percentage: distribution.merchantReferrerPercent
        });
        result.totalDistributed += distribution.merchantReferrerFee;
      }
    }

    return result;
  }

  /**
   * Processar cashback completo (calcular + distribuir)
   * @param {Object} prisma - Prisma client do tenant
   * @param {String} tenantId - ID do tenant
   * @param {String} purchaseId - ID da compra
   * @returns {Object} Resultado completo
   */
  async processCashback(prisma, tenantId, purchaseId) {
    // Buscar compra
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: true
      }
    });

    if (!purchase) {
      throw new Error('Compra não encontrada');
    }

    // Obter configuração do tenant
    const config = await this.getTenantCashbackConfig(tenantId);

    // Calcular distribuição
    const distribution = this.calculateDistribution(
      parseFloat(purchase.totalAmount),
      parseFloat(purchase.product.cashbackPercentage),
      config
    );

    // Distribuir cashback
    const result = await this.distributeCashback(prisma, purchaseId, {
      ...distribution,
      ...config
    });

    return {
      purchaseId,
      totalAmount: parseFloat(purchase.totalAmount),
      cashbackPercentage: parseFloat(purchase.product.cashbackPercentage),
      distribution,
      result
    };
  }

  /**
   * Obter estatísticas de cashback do usuário
   * @param {Object} prisma - Prisma client do tenant
   * @param {String} userId - ID do usuário
   * @returns {Object} Estatísticas
   */
  async getUserCashbackStats(prisma, userId) {
    // Buscar todas as compras como consumidor
    const consumerPurchases = await prisma.purchase.findMany({
      where: {
        consumerId: userId,
        status: 'completed'
      },
      select: {
        consumerCashback: true
      }
    });

    // Buscar vendas como merchant
    const merchantSales = await prisma.purchase.findMany({
      where: {
        merchantId: userId,
        status: 'completed'
      },
      select: {
        merchantAmount: true
      }
    });

    // Calcular totais
    const totalCashbackReceived = consumerPurchases.reduce(
      (sum, purchase) => sum + parseFloat(purchase.consumerCashback),
      0
    );

    const totalEarned = merchantSales.reduce(
      (sum, purchase) => sum + parseFloat(purchase.merchantAmount),
      0
    );

    return {
      totalCashbackReceived,
      totalConsumerPurchases: consumerPurchases.length,
      totalEarned,
      totalMerchantSales: merchantSales.length,
      averageCashbackPerPurchase: consumerPurchases.length > 0
        ? totalCashbackReceived / consumerPurchases.length
        : 0
    };
  }

  /**
   * Obter configuração personalizada de cashback do usuário (se houver)
   * @param {Object} prisma - Prisma client do tenant
   * @param {String} userId - ID do usuário
   * @returns {Object|null} Configuração personalizada ou null
   */
  async getUserCashbackConfig(prisma, userId) {
    return await prisma.userCashbackConfig.findUnique({
      where: { userId }
    });
  }

  /**
   * Validar percentuais de cashback (soma deve ser 100)
   * @param {Object} config - Configuração a validar
   * @returns {Boolean} Válido ou não
   */
  validateConfig(config) {
    const total = parseFloat(config.consumerPercent || 0) +
                  parseFloat(config.clubPercent || 0) +
                  parseFloat(config.consumerReferrerPercent || 0) +
                  parseFloat(config.merchantReferrerPercent || 0);

    return Math.abs(total - 100) < 0.01; // Tolerância de 0.01 para float
  }
}

module.exports = new CashbackService();

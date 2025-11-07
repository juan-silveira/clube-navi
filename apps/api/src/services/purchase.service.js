/**
 * Purchase Service
 *
 * Service para gerenciar lógica de compras e cashback
 */

class PurchaseService {
  /**
   * Calcula distribuição de cashback
   * @param {Object} prisma - Prisma client do clube
   * @param {Object} clubeConfig - Configuração do clube
   * @param {Number} totalAmount - Valor total da compra
   * @param {Number} cashbackPercentage - Percentual de cashback do produto
   * @returns {Object} Distribuição de cashback
   */
  async calculateCashbackDistribution(prisma, clubeConfig, totalAmount, cashbackPercentage) {
    // Calcular cashback total
    const totalCashback = totalAmount * (cashbackPercentage / 100);

    // Obter configuração de cashback (clube-specific ou default)
    const config = clubeConfig?.cashbackConfig || {
      consumerPercent: 50,           // 50% do cashback vai para o consumidor
      clubPercent: 25,                // 25% fica com o clube/plataforma
      consumerReferrerPercent: 15,   // 15% para quem indicou o consumidor
      merchantReferrerPercent: 10    // 10% para quem indicou o comerciante
    };

    // Distribuir cashback
    return {
      consumerCashback: totalCashback * (config.consumerPercent / 100),
      platformFee: totalCashback * (config.clubPercent / 100),
      consumerReferrerFee: totalCashback * (config.consumerReferrerPercent / 100),
      merchantReferrerFee: totalCashback * (config.merchantReferrerPercent / 100)
    };
  }

  /**
   * Criar compra
   * @param {Object} prisma - Prisma client do clube
   * @param {Object} data - Dados da compra
   * @returns {Object} Compra criada
   */
  async createPurchase(prisma, data) {
    const { consumerId, productId, quantity = 1, clubeConfig } = data;

    // Buscar produto e validar
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { merchant: true }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (!product.isActive) {
      throw new Error('Produto não está disponível');
    }

    if (product.stock < quantity) {
      throw new Error('Estoque insuficiente');
    }

    // Calcular valores
    const totalAmount = parseFloat(product.price) * quantity;
    const merchantAmount = totalAmount; // Merchant recebe o valor total (produto já tem margem)

    // Calcular distribuição de cashback
    const distribution = await this.calculateCashbackDistribution(
      prisma,
      clubeConfig,
      totalAmount,
      parseFloat(product.cashbackPercentage)
    );

    // Criar compra com transação para garantir atomicidade
    const purchase = await prisma.$transaction(async (tx) => {
      // Criar registro de compra
      const newPurchase = await tx.purchase.create({
        data: {
          consumerId,
          merchantId: product.merchantId,
          productId: product.id,
          totalAmount,
          merchantAmount,
          consumerCashback: distribution.consumerCashback,
          platformFee: distribution.platformFee,
          consumerReferrerFee: distribution.consumerReferrerFee,
          merchantReferrerFee: distribution.merchantReferrerFee,
          status: 'pending'
        },
        include: {
          product: true,
          consumer: true,
          merchant: true
        }
      });

      // Decrementar estoque atomicamente
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity
          }
        }
      });

      return newPurchase;
    });

    // Retornar purchase com estrutura esperada pelo controller
    return {
      purchase,
      distribution,
      totalAmount
    };
  }

  /**
   * Confirmar compra (atualizar status para completed)
   * @param {Object} prisma - Prisma client do clube
   * @param {String} purchaseId - ID da compra
   * @param {String} userId - ID do usuário
   * @returns {Object} Compra atualizada
   */
  async confirmPurchase(prisma, purchaseId, userId) {
    // Buscar compra
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: true,
        consumer: true,
        merchant: true
      }
    });

    if (!purchase) {
      throw new Error('Compra não encontrada');
    }

    // Verificar se usuário é o merchant da compra
    if (purchase.merchantId !== userId) {
      throw new Error('Apenas o comerciante pode confirmar a compra');
    }

    // Verificar se compra está pendente
    if (purchase.status !== 'pending') {
      throw new Error(`Compra não pode ser confirmada. Status atual: ${purchase.status}`);
    }

    // Atualizar status da compra
    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'completed',
        completedAt: new Date()
      },
      include: {
        product: true,
        consumer: true,
        merchant: true
      }
    });

    return updatedPurchase;
  }

  /**
   * Cancelar compra
   * @param {Object} prisma - Prisma client do clube
   * @param {String} purchaseId - ID da compra
   * @param {String} userId - ID do usuário
   * @returns {Object} Compra cancelada
   */
  async cancelPurchase(prisma, purchaseId, userId) {
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

    // Verificar se usuário é o consumidor ou merchant da compra
    if (purchase.consumerId !== userId && purchase.merchantId !== userId) {
      throw new Error('Você não tem permissão para cancelar esta compra');
    }

    // Verificar se compra pode ser cancelada
    if (purchase.status === 'completed') {
      throw new Error('Compra já foi completada e não pode ser cancelada');
    }

    if (purchase.status === 'refunded') {
      throw new Error('Compra já foi reembolsada');
    }

    // Cancelar compra e devolver estoque
    const cancelledPurchase = await prisma.$transaction(async (tx) => {
      // Atualizar status da compra
      const updated = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'refunded'
        },
        include: {
          product: true,
          consumer: true,
          merchant: true
        }
      });

      // Devolver estoque
      await tx.product.update({
        where: { id: purchase.productId },
        data: {
          stock: {
            increment: 1 // Assumindo quantity = 1 por enquanto
          }
        }
      });

      return updated;
    });

    return cancelledPurchase;
  }

  /**
   * Buscar compra por ID
   * @param {Object} prisma - Prisma client do clube
   * @param {String} purchaseId - ID da compra
   * @param {String} userId - ID do usuário
   * @returns {Object} Compra
   */
  async getPurchaseById(prisma, purchaseId, userId) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: true,
        consumer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true
          }
        },
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true
          }
        }
      }
    });

    if (!purchase) {
      throw new Error('Compra não encontrada');
    }

    // Verificar se usuário tem acesso à compra
    if (purchase.consumerId !== userId && purchase.merchantId !== userId) {
      throw new Error('Você não tem permissão para visualizar esta compra');
    }

    return purchase;
  }

  /**
   * Listar compras do usuário
   * @param {Object} prisma - Prisma client do clube
   * @param {String} userId - ID do usuário
   * @param {Object} filters - Filtros (status, page, limit)
   * @returns {Object} Lista de compras
   */
  async listUserPurchases(prisma, userId, filters = {}) {
    const { status, page = 1, limit = 20, userType } = filters;

    // Verificar tipo de usuário para determinar campo de filtro
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Construir where clause
    const where = {
      ...(user.userType === 'consumer' ? { consumerId: userId } : { merchantId: userId }),
      ...(status && { status })
    };

    // Buscar compras
    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          product: true,
          consumer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true
            }
          },
          merchant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.purchase.count({ where })
    ]);

    return {
      purchases,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obter estatísticas de compras
   * @param {Object} prisma - Prisma client do clube
   * @param {String} userId - ID do usuário
   * @returns {Object} Estatísticas
   */
  async getPurchaseStats(prisma, userId) {
    // Verificar tipo de usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const where = user.userType === 'consumer'
      ? { consumerId: userId }
      : { merchantId: userId };

    // Buscar estatísticas
    const [
      totalPurchases,
      completedPurchases,
      pendingPurchases,
      totalAmount,
      totalCashback
    ] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.count({ where: { ...where, status: 'completed' } }),
      prisma.purchase.count({ where: { ...where, status: 'pending' } }),
      prisma.purchase.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { totalAmount: true }
      }),
      prisma.purchase.aggregate({
        where: { ...where, status: 'completed' },
        _sum: user.userType === 'consumer' ? { consumerCashback: true } : { merchantAmount: true }
      })
    ]);

    return {
      totalPurchases,
      completedPurchases,
      pendingPurchases,
      totalAmount: parseFloat(totalAmount._sum.totalAmount || 0),
      totalCashback: parseFloat(
        user.userType === 'consumer'
          ? totalCashback._sum.consumerCashback || 0
          : totalCashback._sum.merchantAmount || 0
      )
    };
  }
}

module.exports = new PurchaseService();

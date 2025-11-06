/**
 * Purchase Controller - Multi-Tenant
 * Gerencia compras e distribui cashback
 * Usa req.tenantPrisma para isolamento de dados por tenant
 */

const { Decimal } = require('@prisma/client/runtime/library');

/**
 * Calcula distribuição de cashback
 * Segue as regras do tenant (configurações em tenant_cashback_configs)
 */
const calculateCashbackDistribution = async (prisma, tenantConfig, totalAmount, cashbackPercentage) => {
  // Total de cashback sobre o valor da compra
  const totalCashback = totalAmount * (cashbackPercentage / 100);

  // Configurações padrão (podem ser customizadas por tenant)
  const config = tenantConfig.cashbackConfig || {
    consumerPercent: 50,    // 50% do cashback vai para o consumidor
    clubPercent: 25,         // 25% fica com o clube
    consumerReferrerPercent: 15,  // 15% para quem indicou o consumidor
    merchantReferrerPercent: 10   // 10% para quem indicou o comerciante
  };

  return {
    consumerCashback: totalCashback * (config.consumerPercent / 100),
    platformFee: totalCashback * (config.clubPercent / 100),
    consumerReferrerFee: totalCashback * (config.consumerReferrerPercent / 100),
    merchantReferrerFee: totalCashback * (config.merchantReferrerPercent / 100)
  };
};

/**
 * Criar nova compra
 */
const createPurchase = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const consumerId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validações
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID do produto é obrigatório'
      });
    }

    // Verificar se usuário é consumer
    const consumer = await prisma.user.findUnique({
      where: { id: consumerId },
      select: {
        userType: true,
        referredBy: true,
        isActive: true
      }
    });

    if (!consumer || consumer.userType !== 'consumer') {
      return res.status(403).json({
        success: false,
        message: 'Apenas consumidores podem realizar compras'
      });
    }

    if (!consumer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo não pode realizar compras'
      });
    }

    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            merchantStatus: true,
            referredBy: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Produto não está ativo'
      });
    }

    if (product.merchant.merchantStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Comerciante não está aprovado'
      });
    }

    // Verificar estoque
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Estoque insuficiente. Disponível: ${product.stock}`
      });
    }

    // Calcular valores
    const totalAmount = parseFloat(product.price) * quantity;

    // Buscar configuração de cashback do tenant (do req.tenant)
    const tenantConfig = req.tenant || {};

    // Calcular distribuição de cashback
    const distribution = await calculateCashbackDistribution(
      prisma,
      tenantConfig,
      totalAmount,
      parseFloat(product.cashbackPercentage)
    );

    const merchantAmount = totalAmount - (
      distribution.consumerCashback +
      distribution.platformFee +
      distribution.consumerReferrerFee +
      distribution.merchantReferrerFee
    );

    // Criar compra em transação
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
          status: 'pending',
          txHash: null // Será preenchido após confirmação blockchain
        },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              cashbackPercentage: true,
              imageUrl: true
            }
          },
          merchant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Decrementar estoque
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

    console.log(`✅ Compra criada: ${purchase.id}`);
    console.log(`   Produto: ${purchase.product.name}`);
    console.log(`   Valor Total: R$ ${totalAmount.toFixed(2)}`);
    console.log(`   Cashback Consumidor: R$ ${distribution.consumerCashback.toFixed(2)}`);

    res.status(201).json({
      success: true,
      message: 'Compra criada com sucesso',
      data: {
        purchase,
        cashbackDistribution: {
          consumer: distribution.consumerCashback,
          platform: distribution.platformFee,
          consumerReferrer: distribution.consumerReferrerFee,
          merchantReferrer: distribution.merchantReferrerFee
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar compra',
      error: error.message
    });
  }
};

/**
 * Listar compras do usuário
 */
const listPurchases = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const userId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;

    // Construir filtro baseado no tipo de usuário
    const where = {};

    if (req.user.userType === 'consumer') {
      where.consumerId = userId;
    } else if (req.user.userType === 'merchant') {
      where.merchantId = userId;
    }

    if (status) {
      where.status = status;
    }

    // Buscar compras
    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              cashbackPercentage: true,
              imageUrl: true,
              category: true
            }
          },
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
          }
        }
      }),
      prisma.purchase.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        purchases,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('❌ Erro ao listar compras:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar compras',
      error: error.message
    });
  }
};

/**
 * Buscar compra por ID
 */
const getPurchaseById = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const userId = req.user.id;
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        product: true,
        consumer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            cpf: true
          }
        },
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra não encontrada'
      });
    }

    // Verificar permissão (apenas consumer ou merchant da compra pode ver)
    if (purchase.consumerId !== userId && purchase.merchantId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para ver esta compra'
      });
    }

    res.json({
      success: true,
      data: { purchase }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar compra',
      error: error.message
    });
  }
};

/**
 * Confirmar compra (atualizar status)
 * Normalmente seria chamado após confirmação do pagamento
 */
const confirmPurchase = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const { id } = req.params;
    const { txHash } = req.body; // Hash da transação blockchain (opcional)

    const purchase = await prisma.purchase.findUnique({
      where: { id }
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra não encontrada'
      });
    }

    if (purchase.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Compra já foi confirmada'
      });
    }

    // Atualizar status
    const updatedPurchase = await prisma.purchase.update({
      where: { id },
      data: {
        status: 'completed',
        txHash: txHash || null,
        completedAt: new Date()
      }
    });

    console.log(`✅ Compra confirmada: ${id}`);

    // TODO: Aqui você pode adicionar lógica para:
    // - Enviar notificação ao consumidor
    // - Enviar notificação ao comerciante
    // - Registrar na blockchain
    // - Processar cashback

    res.json({
      success: true,
      message: 'Compra confirmada com sucesso',
      data: { purchase: updatedPurchase }
    });
  } catch (error) {
    console.error('❌ Erro ao confirmar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar compra',
      error: error.message
    });
  }
};

/**
 * Cancelar compra
 */
const cancelPurchase = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra não encontrada'
      });
    }

    // Apenas o consumidor pode cancelar
    if (purchase.consumerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para cancelar esta compra'
      });
    }

    // Não pode cancelar compra já completada
    if (purchase.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma compra já confirmada'
      });
    }

    // Cancelar em transação (devolver estoque)
    const canceledPurchase = await prisma.$transaction(async (tx) => {
      // Atualizar status
      const updated = await tx.purchase.update({
        where: { id },
        data: {
          status: 'refunded',
          completedAt: new Date()
        }
      });

      // Devolver estoque
      await tx.product.update({
        where: { id: purchase.productId },
        data: {
          stock: {
            increment: 1 // TODO: Usar quantity quando adicionar ao schema
          }
        }
      });

      return updated;
    });

    console.log(`🔄 Compra cancelada: ${id} - Motivo: ${reason || 'Não informado'}`);

    res.json({
      success: true,
      message: 'Compra cancelada com sucesso',
      data: { purchase: canceledPurchase }
    });
  } catch (error) {
    console.error('❌ Erro ao cancelar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar compra',
      error: error.message
    });
  }
};

/**
 * Obter estatísticas de compras do usuário
 */
const getPurchaseStats = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const userId = req.user.id;

    const where = req.user.userType === 'consumer'
      ? { consumerId: userId }
      : { merchantId: userId };

    const [
      totalPurchases,
      completedPurchases,
      totalSpent,
      totalCashback
    ] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.count({
        where: { ...where, status: 'completed' }
      }),
      prisma.purchase.aggregate({
        where: { ...where, status: 'completed' },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.purchase.aggregate({
        where: { ...where, status: 'completed' },
        _sum: {
          consumerCashback: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalPurchases,
        completedPurchases,
        pendingPurchases: totalPurchases - completedPurchases,
        totalSpent: totalSpent._sum.totalAmount || 0,
        totalCashback: totalCashback._sum.consumerCashback || 0
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};

module.exports = {
  createPurchase,
  listPurchases,
  getPurchaseById,
  confirmPurchase,
  cancelPurchase,
  getPurchaseStats
};

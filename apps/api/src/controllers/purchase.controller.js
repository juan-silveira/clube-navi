/**
 * Purchase Controller - Multi-Tenant
 * Gerencia compras e distribui cashback
 * Usa req.tenantPrisma para isolamento de dados por tenant
 */

const purchaseService = require('../services/purchase.service');

/**
 * Criar nova compra
 */
const createPurchase = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const consumerId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    const tenantConfig = req.tenant || {};

    const data = {
      consumerId,
      productId,
      quantity,
      tenantConfig
    };

    const result = await purchaseService.createPurchase(prisma, data);

    console.log(`✅ Compra criada: ${result.purchase.id}`);
    console.log(`   Produto: ${result.purchase.product.name}`);
    console.log(`   Valor Total: R$ ${result.totalAmount.toFixed(2)}`);
    console.log(`   Cashback Consumidor: R$ ${result.distribution.consumerCashback.toFixed(2)}`);

    res.status(201).json({
      success: true,
      message: 'Compra criada com sucesso',
      data: {
        purchase: result.purchase,
        cashbackDistribution: {
          consumer: result.distribution.consumerCashback,
          platform: result.distribution.platformFee,
          consumerReferrer: result.distribution.consumerReferrerFee,
          merchantReferrer: result.distribution.merchantReferrerFee
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar compra:', error);

    // Handle validation errors with 400 status
    if (error.message.includes('obrigatório') ||
        error.message.includes('não está ativo') ||
        error.message.includes('não está aprovado') ||
        error.message.includes('Estoque insuficiente')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle permission errors with 403 status
    if (error.message.includes('Apenas consumidores') ||
        error.message.includes('inativo não pode')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

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
    const userType = req.user.userType;
    const { status, page = 1, limit = 20 } = req.query;

    const filters = {
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await purchaseService.listUserPurchases(prisma, userId, userType, filters);

    res.json({
      success: true,
      data: result
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

    const purchase = await purchaseService.getPurchaseById(prisma, id, userId);

    res.json({
      success: true,
      data: { purchase }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar compra:', error);

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Handle permission errors with 403 status
    if (error.message.includes('não tem permissão')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

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
    const { txHash } = req.body;

    const updatedPurchase = await purchaseService.confirmPurchase(prisma, id, txHash);

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

    // Handle validation errors with 400 status
    if (error.message.includes('já foi confirmada')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

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

    const canceledPurchase = await purchaseService.cancelPurchase(prisma, id, userId, reason);

    console.log(`🔄 Compra cancelada: ${id} - Motivo: ${reason || 'Não informado'}`);

    res.json({
      success: true,
      message: 'Compra cancelada com sucesso',
      data: { purchase: canceledPurchase }
    });
  } catch (error) {
    console.error('❌ Erro ao cancelar compra:', error);

    // Handle validation errors with 400 status
    if (error.message.includes('não é possível cancelar') ||
        error.message.includes('já confirmada')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle permission errors with 403 status
    if (error.message.includes('não tem permissão')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

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
    const userType = req.user.userType;

    const stats = await purchaseService.getPurchaseStats(prisma, userId, userType);

    res.json({
      success: true,
      data: stats
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

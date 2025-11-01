const express = require('express');
const router = express.Router();
const exchangeSystemManager = require('../services/exchangeSystemManager');

// Middleware de autenticação (reutilizar existente)
const authenticateJWT = require('../middleware/jwt.middleware').authenticateToken;

/**
 * @route GET /api/exchange-matching/health
 * @desc Health check do sistema de matching
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await exchangeSystemManager.healthCheck();

    res.status(healthStatus.overall ? 200 : 503).json({
      success: healthStatus.overall,
      data: healthStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking system health',
      error: error.message
    });
  }
});

/**
 * @route GET /api/exchange-matching/stats
 * @desc Estatísticas consolidadas do sistema
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await exchangeSystemManager.getSystemStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting system stats',
      error: error.message
    });
  }
});

/**
 * @route GET /api/exchange-matching/contracts
 * @desc Lista contratos de exchange gerenciados
 */
router.get('/contracts', async (req, res) => {
  try {
    const contracts = exchangeSystemManager.listManagedContracts();

    res.json({
      success: true,
      data: {
        contracts,
        count: contracts.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listing managed contracts',
      error: error.message
    });
  }
});

/**
 * @route POST /api/exchange-matching/request-matching
 * @desc Solicita matching específico entre ordens
 * @access Private (Admin apenas para segurança)
 */
router.post('/request-matching', authenticateJWT, async (req, res) => {
  try {
    const { contractAddress, buyOrderIds, sellOrderIds } = req.body;

    // Validações básicas
    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        message: 'Contract address is required'
      });
    }

    if (!buyOrderIds || !Array.isArray(buyOrderIds) || buyOrderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Buy order IDs array is required'
      });
    }

    if (!sellOrderIds || !Array.isArray(sellOrderIds) || sellOrderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sell order IDs array is required'
      });
    }

    const result = await exchangeSystemManager.requestMatching(
      contractAddress,
      buyOrderIds,
      sellOrderIds
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Matching request queued successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to queue matching request',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing matching request',
      error: error.message
    });
  }
});

/**
 * @route POST /api/exchange-matching/refresh-cache/:contractAddress
 * @desc Força atualização do cache de um contrato
 * @access Private (Admin apenas)
 */
router.post('/refresh-cache/:contractAddress', authenticateJWT, async (req, res) => {
  try {
    const { contractAddress } = req.params;

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        message: 'Contract address is required'
      });
    }

    const result = await exchangeSystemManager.refreshContractCache(contractAddress);

    if (result.success) {
      res.json({
        success: true,
        message: 'Cache refreshed successfully',
        data: { contractAddress }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to refresh cache',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing cache',
      error: error.message
    });
  }
});

/**
 * @route POST /api/exchange-matching/broadcast/orderbook/:contractAddress
 * @desc Força broadcast de orderbook para um contrato
 * @access Private
 */
router.post('/broadcast/orderbook/:contractAddress', authenticateJWT, async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const { action = 'UPDATE' } = req.body;

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        message: 'Contract address is required'
      });
    }

    const result = await exchangeSystemManager.broadcastOrderBookUpdate(contractAddress, action);

    if (result.success) {
      res.json({
        success: true,
        message: 'OrderBook broadcast queued successfully',
        data: { contractAddress, action }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to queue orderbook broadcast',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error broadcasting orderbook update',
      error: error.message
    });
  }
});

/**
 * @route POST /api/exchange-matching/broadcast/user-orders
 * @desc Força broadcast de ordens de usuário
 * @access Private
 */
router.post('/broadcast/user-orders', authenticateJWT, async (req, res) => {
  try {
    const { userAddress, contractAddress, orderData } = req.body;

    if (!userAddress || !contractAddress) {
      return res.status(400).json({
        success: false,
        message: 'User address and contract address are required'
      });
    }

    const result = await exchangeSystemManager.broadcastUserOrdersUpdate(
      userAddress,
      contractAddress,
      orderData
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'User orders broadcast queued successfully',
        data: { userAddress, contractAddress }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to queue user orders broadcast',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error broadcasting user orders update',
      error: error.message
    });
  }
});

/**
 * @route GET /api/exchange-matching/cache-stats/:contractAddress?
 * @desc Estatísticas do cache Redis (específico ou geral)
 */
router.get('/cache-stats/:contractAddress?', async (req, res) => {
  try {
    const { contractAddress } = req.params;

    if (contractAddress) {
      // Estatísticas de um contrato específico
      const redisOrderBookCache = require('../services/redisOrderBookCache');
      const stats = await redisOrderBookCache.getCacheStats(contractAddress);

      res.json({
        success: true,
        data: {
          contract: contractAddress,
          ...stats
        }
      });
    } else {
      // Estatísticas gerais do cache
      const stats = await exchangeSystemManager.getCacheStats();

      res.json({
        success: true,
        data: stats
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting cache stats',
      error: error.message
    });
  }
});

module.exports = router;
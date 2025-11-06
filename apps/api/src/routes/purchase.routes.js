const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const { authenticateToken } = require('../middleware/jwt.middleware');

/**
 * Todas as routes de compras requerem autenticação
 */

/**
 * POST /api/purchases
 * Criar nova compra (apenas consumers)
 */
router.post('/', authenticateToken, purchaseController.createPurchase);

/**
 * GET /api/purchases
 * Listar compras do usuário
 * - Consumers veem suas compras
 * - Merchants veem vendas de seus produtos
 */
router.get('/', authenticateToken, purchaseController.listPurchases);

/**
 * GET /api/purchases/stats
 * Obter estatísticas de compras
 */
router.get('/stats', authenticateToken, purchaseController.getPurchaseStats);

/**
 * GET /api/purchases/:id
 * Buscar compra por ID
 */
router.get('/:id', authenticateToken, purchaseController.getPurchaseById);

/**
 * PUT /api/purchases/:id/confirm
 * Confirmar compra (atualizar status para completed)
 */
router.put('/:id/confirm', authenticateToken, purchaseController.confirmPurchase);

/**
 * PUT /api/purchases/:id/cancel
 * Cancelar compra
 */
router.put('/:id/cancel', authenticateToken, purchaseController.cancelPurchase);

module.exports = router;

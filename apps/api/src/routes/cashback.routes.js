const express = require('express');
const router = express.Router();
const cashbackController = require('../controllers/cashback.controller');
const { authenticateToken } = require('../middleware/jwt.middleware');

/**
 * Todas as routes de cashback requerem autenticação
 */

/**
 * GET /api/cashback/config
 * Obter configuração de cashback do tenant
 */
router.get('/config', authenticateToken, cashbackController.getTenantConfig);

/**
 * GET /api/cashback/stats
 * Obter estatísticas de cashback do usuário
 */
router.get('/stats', authenticateToken, cashbackController.getUserStats);

/**
 * POST /api/cashback/calculate
 * Calcular distribuição de cashback (simulação)
 * Body: { totalAmount, cashbackPercentage }
 */
router.post('/calculate', authenticateToken, cashbackController.calculateDistribution);

/**
 * GET /api/cashback/history
 * Obter histórico de cashback do usuário
 * Query params: page, limit, type (received/paid)
 */
router.get('/history', authenticateToken, cashbackController.getCashbackHistory);

/**
 * POST /api/cashback/process/:purchaseId
 * Processar cashback de uma compra
 * (Para testes - normalmente seria chamado internamente)
 */
router.post('/process/:purchaseId', authenticateToken, cashbackController.processPurchaseCashback);

module.exports = router;

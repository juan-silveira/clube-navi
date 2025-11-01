/**
 * CDI (Certificado de Depósito Interbancário) Routes
 * Rotas para gerenciamento de taxas CDI e cálculos relacionados
 */

const express = require('express');
const router = express.Router();
const cdiController = require('../controllers/cdi.controller');
const { authenticateJWT } = require('../middleware/jwt.middleware');
const { requireAnyAdmin } = require('../middleware/auth.middleware');

/**
 * Rotas públicas (autenticadas)
 */

// GET /api/cdi/latest - Obtém a taxa CDI mais recente
router.get('/latest', authenticateJWT, cdiController.getLatestRate);

// GET /api/cdi/history - Obtém histórico de taxas CDI
router.get('/history', authenticateJWT, cdiController.getHistory);

// GET /api/cdi/by-date/:date - Obtém taxa CDI de uma data específica
router.get('/by-date/:date', authenticateJWT, cdiController.getRateByDate);

// POST /api/cdi/calculate-equivalent - Calcula equivalente ao CDI
router.post('/calculate-equivalent', authenticateJWT, cdiController.calculateEquivalent);

// GET /api/cdi/status - Verifica status da sincronização
router.get('/status', authenticateJWT, cdiController.getStatus);

/**
 * Rotas administrativas (requerem admin)
 */

// POST /api/cdi/sync - Sincroniza taxas CDI com API do Banco Central
router.post('/sync', authenticateJWT, requireAnyAdmin, cdiController.syncRates);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminWithdrawalsController = require('../controllers/adminWithdrawals.controller');
const { authenticateJWT } = require('../middleware/jwt.middleware');
const { requireSuperAdmin } = require('../middleware/admin.middleware');

// Todas as rotas requerem autenticação e permissão de SUPER_ADMIN (APP_ADMIN ou SUPER_ADMIN)
router.use(authenticateJWT);
router.use(requireSuperAdmin);

// Listar todos os saques
router.get('/all', (req, res) => adminWithdrawalsController.getAllWithdrawals(req, res));

// Listar saques pendentes (mantido para compatibilidade)
router.get('/pending', (req, res) => adminWithdrawalsController.getPendingWithdrawals(req, res));

// Histórico de saques processados
router.get('/processed', (req, res) => adminWithdrawalsController.getProcessedWithdrawals(req, res));

// Obter detalhes de um saque específico
router.get('/:id', (req, res) => adminWithdrawalsController.getWithdrawal(req, res));

// Confirmar pagamento manual de saque
router.post('/:id/confirm', (req, res) => adminWithdrawalsController.confirmWithdrawalPayment(req, res));

// Rejeitar saque
router.post('/:id/reject', (req, res) => adminWithdrawalsController.rejectWithdrawal(req, res));

module.exports = router;
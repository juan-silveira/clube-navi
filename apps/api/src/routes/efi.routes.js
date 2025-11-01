const express = require('express');
const router = express.Router();
const efiWebhookController = require('../controllers/efiWebhook.controller');
const jwtMiddleware = require('../middleware/jwt.middleware');

/**
 * @route   GET /api/webhooks/efi/pix
 * @desc    Verificar se o webhook está funcionando
 * @access  Public
 */
router.get('/pix', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook EFI Pay está funcionando!',
    endpoint: '/api/webhooks/efi/pix',
    method: 'POST para receber notificações',
    status: 'ready'
  });
});

/**
 * @route   POST /api/webhooks/efi/pix
 * @desc    Receber notificações de pagamento PIX da EFI
 * @access  Public (webhook externo)
 */
router.post('/pix', efiWebhookController.handleWebhook.bind(efiWebhookController));

/**
 * @route   POST /api/webhooks/efi/configure
 * @desc    Configurar webhook na EFI
 * @access  Private (Admin)
 */
router.post('/configure', jwtMiddleware.authenticateToken, efiWebhookController.configureWebhook.bind(efiWebhookController));

/**
 * @route   GET /api/webhooks/efi/list
 * @desc    Listar webhooks configurados na EFI
 * @access  Private (Admin)
 */
router.get('/list', jwtMiddleware.authenticateToken, efiWebhookController.listWebhooks.bind(efiWebhookController));

/**
 * @route   DELETE /api/webhooks/efi/remove
 * @desc    Remover webhook da EFI
 * @access  Private (Admin)
 */
router.delete('/remove', jwtMiddleware.authenticateToken, efiWebhookController.removeWebhook.bind(efiWebhookController));

module.exports = router;
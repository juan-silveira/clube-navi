/**
 * Rotas para gerenciamento de tokens de push notification
 */

const express = require('express');
const router = express.Router();
const pushTokenController = require('../controllers/pushToken.controller');
const { authenticateJWT } = require('../middlewares/auth');

/**
 * @route POST /api/push-tokens/register
 * @desc Registrar ou atualizar token de push do usuário
 * @access Private (authenticated users)
 */
router.post('/register', authenticateJWT, pushTokenController.registerPushToken);

/**
 * @route POST /api/push-tokens/remove
 * @desc Remover token de push do usuário
 * @access Private (authenticated users)
 */
router.post('/remove', authenticateJWT, pushTokenController.removePushToken);

/**
 * @route GET /api/push-tokens
 * @desc Listar tokens do usuário
 * @access Private (authenticated users)
 */
router.get('/', authenticateJWT, pushTokenController.listUserTokens);

/**
 * @route POST /api/push-tokens/test
 * @desc Enviar notificação de teste para os dispositivos do usuário
 * @access Private (authenticated users)
 */
router.post('/test', authenticateJWT, pushTokenController.testPushNotification);

module.exports = router;

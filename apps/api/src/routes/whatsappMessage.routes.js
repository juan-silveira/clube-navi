const express = require('express');
const router = express.Router();
const whatsappMessageController = require('../controllers/whatsappMessage.controller');

/**
 * @route   POST /api/whatsapp-messages
 * @desc    Envia mensagens WhatsApp para usuários selecionados
 * @access  Private (Admin)
 */
router.post('/', whatsappMessageController.sendMessages);

/**
 * @route   GET /api/whatsapp-messages/templates
 * @desc    Lista templates de mensagens disponíveis
 * @access  Private (Admin)
 */
router.get('/templates', whatsappMessageController.getTemplates);

/**
 * @route   GET /api/whatsapp-messages/history
 * @desc    Lista histórico de mensagens enviadas
 * @access  Private (Admin)
 */
router.get('/history', whatsappMessageController.getMessageHistory);

module.exports = { router };

const express = require('express');
const router = express.Router();
const asaasWebhookController = require('../controllers/asaasWebhook.controller');

/**
 * @swagger
 * tags:
 *   name: Asaas
 *   description: Webhooks e integrações com Asaas
 */

/**
 * @swagger
 * /api/webhooks/asaas:
 *   post:
 *     summary: Webhook para receber notificações do Asaas
 *     description: Endpoint para receber notificações de pagamentos e transferências do Asaas
 *     tags: [Asaas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 enum: [PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_DELETED, TRANSFER_DONE, TRANSFER_FAILED]
 *               payment:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   value:
 *                     type: number
 *                   externalReference:
 *                     type: string
 *                   confirmedDate:
 *                     type: string
 *               transfer:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   value:
 *                     type: number
 *                   externalReference:
 *                     type: string
 *                   transferDate:
 *                     type: string
 *     responses:
 *       200:
 *         description: Webhook recebido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Assinatura inválida
 */
router.post('/webhooks/asaas', asaasWebhookController.handleWebhook.bind(asaasWebhookController));

// Rota alternativa para compatibilidade
router.post('/webhook/asaas', asaasWebhookController.handleWebhook.bind(asaasWebhookController));

module.exports = router;
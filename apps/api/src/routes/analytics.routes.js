/**
 * Rotas de Analytics
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateJWT } = require('../middlewares/auth');

/**
 * @route POST /api/analytics/events
 * @desc Rastrear evento genérico
 * @access Public (pode ser anônimo)
 */
router.post('/events', analyticsController.trackEvent);

/**
 * @route POST /api/analytics/pageview
 * @desc Rastrear page view
 * @access Public
 */
router.post('/pageview', analyticsController.trackPageView);

/**
 * @route POST /api/analytics/click
 * @desc Rastrear clique
 * @access Public
 */
router.post('/click', analyticsController.trackClick);

/**
 * @route POST /api/analytics/session
 * @desc Criar ou atualizar sessão
 * @access Public
 */
router.post('/session', analyticsController.createSession);

/**
 * @route POST /api/analytics/notification/open
 * @desc Rastrear abertura de notificação
 * @access Private
 */
router.post('/notification/open', authenticateJWT, analyticsController.trackNotificationOpen);

/**
 * @route POST /api/analytics/notification/click
 * @desc Rastrear clique em notificação
 * @access Private
 */
router.post('/notification/click', authenticateJWT, analyticsController.trackNotificationClick);

/**
 * @route GET /api/analytics/stats
 * @desc Obter estatísticas gerais
 * @access Private (Admin)
 */
router.get('/stats', authenticateJWT, analyticsController.getStats);

/**
 * @route GET /api/analytics/events
 * @desc Obter lista de eventos
 * @access Private (Admin)
 */
router.get('/events', authenticateJWT, analyticsController.getEvents);

/**
 * @route GET /api/analytics/sessions
 * @desc Obter lista de sessões
 * @access Private (Admin)
 */
router.get('/sessions', authenticateJWT, analyticsController.getSessions);

/**
 * @route GET /api/analytics/campaigns/:campaignId
 * @desc Obter analytics de uma campanha push
 * @access Private (Admin)
 */
router.get('/campaigns/:campaignId', authenticateJWT, analyticsController.getCampaignAnalytics);

module.exports = router;

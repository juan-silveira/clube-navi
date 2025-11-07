const express = require('express');
const router = express.Router();
const pushNotificationController = require('../controllers/pushNotification.controller');
const jwtMiddleware = require('../middlewares/jwt.middleware');

// Middleware de autenticação
router.use(jwtMiddleware.authenticateToken);

// Criar campanha de push (com upload de imagens)
router.post(
  '/',
  pushNotificationController.upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  pushNotificationController.createPushNotification
);

// Listar campanhas
router.get('/', pushNotificationController.listPushCampaigns);

// Detalhes de uma campanha
router.get('/:id', pushNotificationController.getCampaignDetails);

module.exports = router;

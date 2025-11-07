const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

router.use(authenticateSuperAdmin);

router.post('/send', notificationsController.send);
router.get('/history', notificationsController.getHistory);

module.exports = router;

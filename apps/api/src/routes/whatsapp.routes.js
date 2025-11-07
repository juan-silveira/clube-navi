const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

router.use(authenticateSuperAdmin);

router.post('/send', whatsappController.send);
router.get('/history', whatsappController.getHistory);

module.exports = router;

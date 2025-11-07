const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

router.use(authenticateSuperAdmin);

router.get('/stats', billingController.getStats);
router.get('/', billingController.list);
router.patch('/:clubId/status', billingController.updateStatus);

module.exports = router;

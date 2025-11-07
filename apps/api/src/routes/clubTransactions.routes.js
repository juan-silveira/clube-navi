const express = require('express');
const router = express.Router();
const clubTransactionsController = require('../controllers/clubTransactions.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

router.use(authenticateSuperAdmin);

router.get('/stats', clubTransactionsController.getStats);
router.get('/', clubTransactionsController.list);

module.exports = router;

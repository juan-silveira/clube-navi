const express = require('express');
const router = express.Router();
const clubUsersController = require('../controllers/clubUsers.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

router.use(authenticateSuperAdmin);

router.get('/stats', clubUsersController.getStats);
router.get('/', clubUsersController.list);

module.exports = router;

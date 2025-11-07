const express = require('express');
const router = express.Router();
const clubGroupsController = require('../controllers/clubGroups.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

router.use(authenticateSuperAdmin);

router.get('/stats', clubGroupsController.getStats);
router.get('/', clubGroupsController.list);

module.exports = router;

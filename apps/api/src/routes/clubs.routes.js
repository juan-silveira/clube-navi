/**
 * Clubs Routes
 * Routes for managing clubs (super admin only)
 */

const express = require('express');
const router = express.Router();
const clubsController = require('../controllers/clubs.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

// All routes require super admin authentication
router.use(authenticateSuperAdmin);

// Dashboard stats (must come before :id routes)
router.get('/dashboard/stats', clubsController.getDashboardStats);

// List clubs with pagination and filters
router.get('/', clubsController.list);

// Get clube by ID
router.get('/:id', clubsController.getById);

// Get clube statistics
router.get('/:id/stats', clubsController.getStats);

// Update clube status
router.patch('/:id/status', clubsController.updateStatus);

module.exports = router;

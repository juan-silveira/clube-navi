/**
 * Club Admins Routes
 * Routes for managing club administrators (super admin only)
 */

const express = require('express');
const router = express.Router();
const clubAdminsController = require('../controllers/clubAdmins.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

// All routes require super admin authentication
router.use(authenticateSuperAdmin);

// Stats endpoint (must come before :id routes)
router.get('/stats', clubAdminsController.getStats);

// List club admins with pagination and filters
router.get('/', clubAdminsController.list);

// Get club admin by ID
router.get('/:id', clubAdminsController.getById);

// Update club admin status
router.patch('/:id/status', clubAdminsController.updateStatus);

module.exports = router;

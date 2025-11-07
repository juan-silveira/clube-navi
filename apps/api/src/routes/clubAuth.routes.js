/**
 * Club Admin Authentication Routes
 */

const express = require('express');
const router = express.Router();
const clubAuthController = require('../controllers/clubAuth.controller');
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');

/**
 * @route POST /api/club-auth/login
 * @desc Login club admin
 * @access Public
 */
router.post('/login', clubAuthController.login);

/**
 * @route GET /api/club-auth/me
 * @desc Get current admin profile
 * @access Private (Club Admin)
 */
router.get('/me', authenticateClubAdmin, clubAuthController.getProfile);

/**
 * @route POST /api/club-auth/logout
 * @desc Logout club admin
 * @access Private (Club Admin)
 */
router.post('/logout', authenticateClubAdmin, clubAuthController.logout);

/**
 * @route POST /api/club-auth/refresh
 * @desc Refresh JWT token
 * @access Public (requires valid token)
 */
router.post('/refresh', clubAuthController.refreshToken);

module.exports = router;

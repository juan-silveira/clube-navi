/**
 * Super Admin Authentication Routes
 */

const express = require('express');
const router = express.Router();
const superAdminAuthController = require('../controllers/superAdminAuth.controller');

/**
 * @route POST /api/super-admin-auth/login
 * @desc Login super admin
 * @access Public
 */
router.post('/login', superAdminAuthController.login);

/**
 * @route GET /api/super-admin-auth/me
 * @desc Get current super admin profile
 * @access Private (Super Admin)
 */
router.get('/me', superAdminAuthController.getProfile);

/**
 * @route POST /api/super-admin-auth/logout
 * @desc Logout super admin
 * @access Private (Super Admin)
 */
router.post('/logout', superAdminAuthController.logout);

module.exports = router;

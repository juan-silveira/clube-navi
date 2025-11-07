/**
 * Super Admin Authentication Controller
 * Handles login/logout for system super administrators
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { masterPrisma } = require('../database');

class SuperAdminAuthController {
  /**
   * Login super admin
   * @route POST /api/super-admin-auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find super admin by email
      const admin = await masterPrisma.superAdmin.findUnique({
        where: { email }
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      await masterPrisma.superAdmin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          type: 'super-admin',
          permissions: admin.permissions || {}
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return success with token and admin info
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            type: 'super-admin',
            isSuperAdmin: true,
            isApiAdmin: true,
            permissions: admin.permissions || {}
          }
        }
      });

    } catch (error) {
      console.error('❌ [Super Admin Auth] Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get current super admin profile
   * @route GET /api/super-admin-auth/me
   */
  async getProfile(req, res) {
    try {
      // req.superAdmin is set by authenticateSuperAdmin middleware
      const adminId = req.superAdmin?.adminId;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const admin = await masterPrisma.superAdmin.findUnique({
        where: { id: adminId }
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          type: 'super-admin',
          isSuperAdmin: true,
          isApiAdmin: true,
          permissions: admin.permissions || {},
          isActive: admin.isActive,
          lastLoginAt: admin.lastLoginAt
        }
      });

    } catch (error) {
      console.error('❌ [Super Admin Auth] Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Logout super admin
   * @route POST /api/super-admin-auth/logout
   */
  async logout(req, res) {
    try {
      // In a more sophisticated setup, you'd invalidate the token here
      // For now, we just return success (client should remove the token)

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('❌ [Super Admin Auth] Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new SuperAdminAuthController();

/**
 * Club Admin Authentication Controller
 * Handles login/logout for club administrators
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { masterPrisma } = require('../database');

class ClubAuthController {
  /**
   * Login club admin
   * @route POST /api/clube-auth/login
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

      // Find club admin by email (using findFirst since email alone is not unique)
      const admin = await masterPrisma.clubAdmin.findFirst({
        where: { email },
        include: {
          club: {
            select: {
              id: true,
              slug: true,
              companyName: true,
              status: true,
              subscriptionStatus: true,
              customDomain: true
            }
          }
        }
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

      // Check if clube is active
      if (admin.club.status === 'suspended' || admin.club.status === 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Club account is not active'
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
      await masterPrisma.clubAdmin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          adminId: admin.id,
          clubId: admin.clubId,
          email: admin.email,
          role: admin.role,
          type: 'club-admin'
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
            role: admin.role,
            clube: {
              id: admin.club.id,
              slug: admin.club.slug,
              name: admin.club.companyName
            }
          }
        }
      });

    } catch (error) {
      console.error('❌ [Clube Auth] Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get current admin profile
   * @route GET /api/clube-auth/me
   */
  async getProfile(req, res) {
    try {
      // req.clubAdmin is set by authenticateClubeAdmin middleware
      const adminId = req.clubAdmin?.adminId;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const admin = await masterPrisma.clubAdmin.findUnique({
        where: { id: adminId },
        include: {
          clube: {
            select: {
              id: true,
              slug: true,
              companyName: true,
              status: true,
              subscriptionStatus: true,
              customDomain: true
            }
          }
        }
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
          role: admin.role,
          isActive: admin.isActive,
          lastLoginAt: admin.lastLoginAt,
          clube: {
            id: admin.club.id,
            slug: admin.club.slug,
            name: admin.club.companyName,
            status: admin.club.status,
            subscriptionStatus: admin.club.subscriptionStatus
          }
        }
      });

    } catch (error) {
      console.error('❌ [Clube Auth] Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Logout club admin
   * @route POST /api/clube-auth/logout
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
      console.error('❌ [Clube Auth] Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Refresh token
   * @route POST /api/clube-auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      // Verify old token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Check if admin still exists and is active
      const admin = await masterPrisma.clubAdmin.findUnique({
        where: { id: decoded.adminId }
      });

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account is not active'
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          adminId: admin.id,
          clubId: admin.clubId,
          email: admin.email,
          role: admin.role,
          type: 'club-admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Token refreshed',
        data: { token: newToken }
      });

    } catch (error) {
      console.error('❌ [Clube Auth] Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new ClubAuthController();

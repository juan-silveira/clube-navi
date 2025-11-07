/**
 * Super Admin Authentication Middleware
 * Verifies JWT tokens for super admin access
 */

const jwt = require('jsonwebtoken');
const { masterPrisma } = require('../database');

/**
 * Middleware to authenticate super admin requests
 */
async function authenticateSuperAdmin(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Verify token type
    if (decoded.type !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Super admin privileges required'
      });
    }

    // Verify super admin exists and is active
    const admin = await masterPrisma.superAdmin.findUnique({
      where: { id: decoded.adminId }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Attach super admin info to request
    req.superAdmin = {
      adminId: decoded.adminId,
      email: decoded.email,
      permissions: decoded.permissions || {}
    };

    next();

  } catch (error) {
    console.error('❌ [Super Admin Auth Middleware] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { authenticateSuperAdmin };

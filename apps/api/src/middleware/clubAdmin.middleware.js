/**
 * Club Admin Authentication Middleware
 * Validates JWT tokens for club administrators
 */

const jwt = require('jsonwebtoken');
const { masterPrisma } = require('../database');

/**
 * Authenticate club admin via JWT
 */
async function authenticateClubAdmin(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Check if it's a club-admin token
    if (decoded.type !== 'club-admin') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Verify admin still exists and is active
    const admin = await masterPrisma.clubAdmin.findUnique({
      where: { id: decoded.adminId },
      include: {
        club: {
          select: {
            id: true,
            slug: true,
            status: true
          }
        }
      }
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

    if (admin.club.status === 'suspended' || admin.club.status === 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Club account is not active'
      });
    }

    // Attach admin info to request
    req.clubAdmin = {
      adminId: admin.id,
      clubId: admin.clubId,
      email: admin.email,
      role: admin.role,
      clubSlug: admin.club.slug
    };

    next();

  } catch (error) {
    console.error('❌ [Club Admin Middleware] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Check if club admin has specific role
 */
function requireClubAdminRole(requiredRole) {
  return (req, res, next) => {
    if (!req.clubAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const roleHierarchy = {
      'viewer': 1,
      'editor': 2,
      'admin': 3,
      'owner': 4
    };

    const userRoleLevel = roleHierarchy[req.clubAdmin.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

module.exports = {
  authenticateClubAdmin,
  requireClubAdminRole
};

/**
 * Club Admin Authentication Middleware
 * Validates JWT tokens for club administrators
 */

const jwt = require('jsonwebtoken');
const { masterPrisma } = require('../database');

/**
 * Authenticate club admin via JWT
 * IMPORTANTE: Este middleware DEVE ser usado DEPOIS do resolveClubMiddleware
 * para que req.club e req.clubPrisma estejam disponíveis
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

    // CRÍTICO: Precisamos do club e clubPrisma do middleware anterior
    if (!req.club || !req.clubPrisma) {
      console.error('❌ [Club Admin Middleware] req.club ou req.clubPrisma não disponível! Certifique-se de que resolveClubMiddleware foi executado antes.');
      return res.status(500).json({
        success: false,
        message: 'Internal server error - club context missing'
      });
    }

    const club = req.club;
    const clubPrisma = req.clubPrisma;

    // Verify admin still exists and is active no Club DB
    // Using raw query to bypass Prisma enum validation until client is properly regenerated
    const admins = await clubPrisma.$queryRaw`
      SELECT * FROM users
      WHERE id = ${decoded.userId}::uuid
      LIMIT 1
    `;
    const admin = admins[0];

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Note: Raw query returns snake_case fields
    if (admin.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'User is not an admin'
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Verificar status do clube
    if (club.status === 'suspended' || club.status === 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Club account is not active'
      });
    }

    // Attach admin info to request
    req.clubAdmin = {
      adminId: admin.id,
      clubId: club.id,
      email: admin.email,
      userType: admin.userType,
      clubSlug: club.slug
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

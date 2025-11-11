/**
 * Club Admin Authentication Routes
 * Login and auth management for club administrators
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { masterPrisma } = require('../database');
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');
const { resolveClubMiddleware } = require('../middleware/club-resolution.middleware');

/**
 * POST /api/club-admin/auth/login
 * Login de Club Admin
 * NOTA: resolveClubMiddleware já foi aplicado no app.js para toda a rota /api/club-admin/auth
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const club = req.club;
    const clubPrisma = req.clubPrisma;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Buscar admin no Club DB (users table com user_type = 'admin')
    // Using raw query to bypass Prisma enum validation until client is properly regenerated
    const admins = await clubPrisma.$queryRaw`
      SELECT * FROM users
      WHERE email = ${email.toLowerCase()}
      AND user_type = 'admin'
      AND is_active = true
      LIMIT 1
    `;
    const admin = admins[0];

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verificar status do clube
    if (club.status === 'suspended' || club.status === 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Club account is not active'
      });
    }

    // Gerar JWT token
    const token = jwt.sign(
      {
        userId: admin.id,
        clubId: club.id,
        email: admin.email,
        userType: admin.user_type,
        type: 'club-admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Retornar dados do admin (sem senha)
    // Note: Raw query returns snake_case fields
    const adminData = {
      id: admin.id,
      email: admin.email,
      name: `${admin.first_name} ${admin.last_name}`,
      firstName: admin.first_name,
      lastName: admin.last_name,
      userType: admin.user_type,
      clubId: club.id,
      clubSlug: club.slug,
      clubName: club.companyName,
      isActive: admin.is_active,
      createdAt: admin.created_at
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminData,
        accessToken: token
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Auth] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/auth/me
 * Obter dados do admin autenticado
 * NOTA: resolveClubMiddleware já foi aplicado no app.js
 */
router.get('/me', authenticateClubAdmin, async (req, res) => {
  try {
    const { adminId, clubId, clubSlug } = req.clubAdmin;
    const club = req.club;
    const clubPrisma = req.clubPrisma;

    const admin = await clubPrisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
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
        ...admin,
        name: `${admin.firstName} ${admin.lastName}`,
        clubId: club.id,
        clubSlug: club.slug,
        clubName: club.companyName
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Auth] Me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/club-admin/auth/logout
 * Logout (client-side apenas, mas endpoint para consistência)
 */
router.post('/logout', authenticateClubAdmin, async (req, res) => {
  // JWT é stateless, logout é feito no client removendo o token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * PUT /api/club-admin/auth/password
 * Atualizar senha do admin
 */
router.put('/password', authenticateClubAdmin, async (req, res) => {
  try {
    const { adminId } = req.clubAdmin;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Buscar admin
    const admin = await masterPrisma.clubAdmin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await masterPrisma.clubAdmin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('❌ [Club Admin Auth] Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

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
 */
router.post('/login', resolveClubMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    const club = req.club;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Buscar admin no Master DB filtrado por clube
    const admin = await masterPrisma.clubAdmin.findFirst({
      where: {
        email: email.toLowerCase(),
        clubId: club.id,
        isActive: true
      },
      include: {
        club: {
          select: {
            id: true,
            slug: true,
            companyName: true,
            status: true
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

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verificar status do clube
    if (admin.club.status === 'suspended' || admin.club.status === 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Club account is not active'
      });
    }

    // Gerar JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        clubId: admin.clubId,
        email: admin.email,
        role: admin.role,
        type: 'club-admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Retornar dados do admin (sem senha)
    const adminData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      clubId: admin.clubId,
      clubSlug: admin.club.slug,
      clubName: admin.club.companyName,
      isActive: admin.isActive,
      createdAt: admin.createdAt
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
 */
router.get('/me', authenticateClubAdmin, async (req, res) => {
  try {
    const { adminId } = req.clubAdmin;

    const admin = await masterPrisma.clubAdmin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clubId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        club: {
          select: {
            id: true,
            slug: true,
            companyName: true,
            status: true
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
        ...admin,
        clubSlug: admin.club.slug,
        clubName: admin.club.companyName
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

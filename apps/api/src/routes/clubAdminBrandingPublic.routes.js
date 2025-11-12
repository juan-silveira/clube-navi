/**
 * Club Admin Branding Public Routes
 * Endpoints públicos de branding (sem autenticação) para tela de login
 */

const express = require('express');
const router = express.Router();
const { getMasterClient } = require('../database/master-client');

/**
 * GET /api/public/club-admin/branding
 * Buscar configurações de branding do clube (endpoint público para tela de login)
 */
router.get('/branding', async (req, res) => {
  try {
    const { subdomain } = req.query;

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain is required'
      });
    }

    const masterPrisma = getMasterClient();

    // Buscar clube pelo subdomain
    const club = await masterPrisma.club.findUnique({
      where: { slug: subdomain },
      include: {
        branding: true
      }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Se não existir branding, retornar valores padrão
    const branding = club.branding || {
      appName: club.companyName || 'Clube Digital',
      primaryColor: '#3B82F6',
      logoUrl: '/assets/images/logo/logo.svg',
      loginDescriptionPt: 'Sistema de gestão de tokens e transações em blockchain',
      loginDescriptionEn: 'Token and blockchain transaction management system',
      loginDescriptionEs: 'Sistema de gestión de tokens y transacciones en blockchain',
      loginWelcomePt: `Bem-vindo ao ${club.companyName || 'Clube Digital'}`,
      loginWelcomeEn: `Welcome to ${club.companyName || 'Clube Digital'}`,
      loginWelcomeEs: `Bienvenido a ${club.companyName || 'Clube Digital'}`,
      loginIllustrationUrl: '/shared-assets/images/auth/ils1.svg'
    };

    res.json({
      success: true,
      data: branding
    });

  } catch (error) {
    console.error('❌ [Branding Public Get] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching branding configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

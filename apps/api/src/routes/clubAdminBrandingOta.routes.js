/**
 * Club Admin Branding OTA Routes
 * Gerenciar branding que pode ser atualizado via OTA (cores, logos internos, banners)
 * NÃO inclui dados de build-time (nome do app, ícone principal, splash)
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');

/**
 * GET /api/club-admin/branding-ota
 * Buscar configurações de branding OTA do clube
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma } = req;

    console.log('🎨 [Club Admin Branding OTA] Buscando branding');

    const branding = await clubPrisma.clubBranding.findFirst();

    // Se não existe, retornar valores padrão
    if (!branding) {
      return res.json({
        success: true,
        data: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          logoHeaderUrl: null,
          logoMenuUrl: null,
          logoFooterUrl: null,
          bannerHomeUrl: null,
          bannerPromoUrl: null,
          welcomeMessage: null,
          aboutUs: null,
          termsUrl: null,
          privacyUrl: null,
          supportEmail: null,
          supportPhone: null,
          websiteUrl: null,
          instagramUrl: null,
          facebookUrl: null,
          twitterUrl: null,
          linkedinUrl: null
        }
      });
    }

    res.json({
      success: true,
      data: branding
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA] Get error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar branding',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/club-admin/branding-ota
 * Atualizar configurações de branding OTA
 */
router.put('/', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma } = req;
    const {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      logoHeaderUrl,
      logoMenuUrl,
      logoFooterUrl,
      bannerHomeUrl,
      bannerPromoUrl,
      welcomeMessage,
      aboutUs,
      termsUrl,
      privacyUrl,
      supportEmail,
      supportPhone,
      websiteUrl,
      instagramUrl,
      facebookUrl,
      twitterUrl,
      linkedinUrl
    } = req.body;

    console.log('🎨 [Club Admin Branding OTA] Atualizando branding');

    // Verificar se já existe
    const existing = await clubPrisma.clubBranding.findFirst();

    const data = {};

    // Cores
    if (primaryColor) data.primaryColor = primaryColor;
    if (secondaryColor) data.secondaryColor = secondaryColor;
    if (accentColor) data.accentColor = accentColor;
    if (backgroundColor) data.backgroundColor = backgroundColor;
    if (textColor) data.textColor = textColor;

    // Logos internos
    if (logoHeaderUrl !== undefined) data.logoHeaderUrl = logoHeaderUrl;
    if (logoMenuUrl !== undefined) data.logoMenuUrl = logoMenuUrl;
    if (logoFooterUrl !== undefined) data.logoFooterUrl = logoFooterUrl;

    // Banners
    if (bannerHomeUrl !== undefined) data.bannerHomeUrl = bannerHomeUrl;
    if (bannerPromoUrl !== undefined) data.bannerPromoUrl = bannerPromoUrl;

    // Textos
    if (welcomeMessage !== undefined) data.welcomeMessage = welcomeMessage;
    if (aboutUs !== undefined) data.aboutUs = aboutUs;

    // Links
    if (termsUrl !== undefined) data.termsUrl = termsUrl;
    if (privacyUrl !== undefined) data.privacyUrl = privacyUrl;
    if (supportEmail !== undefined) data.supportEmail = supportEmail;
    if (supportPhone !== undefined) data.supportPhone = supportPhone;
    if (websiteUrl !== undefined) data.websiteUrl = websiteUrl;

    // Social Media
    if (instagramUrl !== undefined) data.instagramUrl = instagramUrl;
    if (facebookUrl !== undefined) data.facebookUrl = facebookUrl;
    if (twitterUrl !== undefined) data.twitterUrl = twitterUrl;
    if (linkedinUrl !== undefined) data.linkedinUrl = linkedinUrl;

    let branding;

    if (existing) {
      // Update
      branding = await clubPrisma.clubBranding.update({
        where: { id: existing.id },
        data
      });
    } else {
      // Create
      branding = await clubPrisma.clubBranding.create({
        data
      });
    }

    res.json({
      success: true,
      message: 'Branding atualizado com sucesso',
      data: branding
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar branding',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/club-admin/branding-ota/colors
 * Atualizar apenas cores do tema
 */
router.patch('/colors', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma } = req;
    const { primaryColor, secondaryColor, accentColor, backgroundColor, textColor } = req.body;

    if (!primaryColor && !secondaryColor && !accentColor && !backgroundColor && !textColor) {
      return res.status(400).json({
        success: false,
        message: 'Forneça pelo menos uma cor para atualizar'
      });
    }

    console.log('🎨 [Club Admin Branding OTA] Atualizando cores');

    const existing = await clubPrisma.clubBranding.findFirst();

    const data = {};
    if (primaryColor) data.primaryColor = primaryColor;
    if (secondaryColor) data.secondaryColor = secondaryColor;
    if (accentColor) data.accentColor = accentColor;
    if (backgroundColor) data.backgroundColor = backgroundColor;
    if (textColor) data.textColor = textColor;

    let branding;

    if (existing) {
      branding = await clubPrisma.clubBranding.update({
        where: { id: existing.id },
        data
      });
    } else {
      branding = await clubPrisma.clubBranding.create({
        data
      });
    }

    res.json({
      success: true,
      message: 'Cores atualizadas com sucesso',
      data: {
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        backgroundColor: branding.backgroundColor,
        textColor: branding.textColor
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA] Update colors error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cores',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/branding-ota/app-info
 * Buscar informações do app (nome, ícone, splash) - READ ONLY
 * Essas informações vêm do master DB e não podem ser editadas aqui
 */
router.get('/app-info', authenticateClubAdmin, async (req, res) => {
  try {
    const { club } = req;
    const { getMasterClient } = require('../database/master-client');
    const masterPrisma = await getMasterClient();

    console.log('🎨 [Club Admin Branding OTA] Buscando app info');

    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId: club.id },
      select: {
        appName: true,
        appDescription: true,
        appIconUrl: true,
        splashScreenUrl: true,
        splashBackgroundColor: true,
        currentVersion: true,
        appStoreUrl: true,
        playStoreUrl: true,
        appStoreStatus: true,
        playStoreStatus: true
      }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    res.json({
      success: true,
      data: appConfig,
      readonly: true,
      message: 'Estas informações só podem ser alteradas pelo administrador da plataforma'
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA] Get app info error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar informações do app',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

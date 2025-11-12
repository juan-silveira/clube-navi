/**
 * Club Admin Branding OTA Upload Routes
 * Rotas para upload de assets OTA (logos internos, banners)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');
const { getMasterClient } = require('../database/master-client');
const s3Service = require('../services/s3.service');

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

/**
 * POST /api/club-admin/branding-ota/upload-logo-header
 * Upload de logo do header (OTA)
 */
router.post('/upload-logo-header', authenticateClubAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { club, clubPrisma } = req;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo fornecido'
      });
    }

    // Buscar tenant slug do master DB
    const masterPrisma = await getMasterClient();
    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId: club.id }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada. Entre em contato com o administrador da plataforma.'
      });
    }

    console.log('🎨 [Club Admin Branding OTA Upload] Uploading logo header:', {
      clubId: club.id,
      tenantSlug: appConfig.tenantSlug,
      fileSize: file.size
    });

    // Upload para S3 com URL fixa (runtime folder)
    const uploadResult = await s3Service.uploadLogoHeader(appConfig.tenantSlug, file);

    // Atualizar URL no branding OTA (tenant DB)
    const branding = await clubPrisma.clubBranding.findFirst();

    if (branding) {
      await clubPrisma.clubBranding.update({
        where: { id: branding.id },
        data: { logoHeaderUrl: uploadResult.url }
      });
    } else {
      await clubPrisma.clubBranding.create({
        data: { logoHeaderUrl: uploadResult.url }
      });
    }

    res.json({
      success: true,
      message: 'Logo do header enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA Upload] Upload logo header error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do logo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/branding-ota/upload-logo-menu
 * Upload de logo do menu (OTA)
 */
router.post('/upload-logo-menu', authenticateClubAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { club, clubPrisma } = req;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo fornecido'
      });
    }

    const masterPrisma = await getMasterClient();
    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId: club.id }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    console.log('🎨 [Club Admin Branding OTA Upload] Uploading logo menu');

    const uploadResult = await s3Service.uploadLogoMenu(appConfig.tenantSlug, file);

    const branding = await clubPrisma.clubBranding.findFirst();

    if (branding) {
      await clubPrisma.clubBranding.update({
        where: { id: branding.id },
        data: { logoMenuUrl: uploadResult.url }
      });
    } else {
      await clubPrisma.clubBranding.create({
        data: { logoMenuUrl: uploadResult.url }
      });
    }

    res.json({
      success: true,
      message: 'Logo do menu enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA Upload] Upload logo menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do logo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/branding-ota/upload-logo-footer
 * Upload de logo do footer (OTA)
 */
router.post('/upload-logo-footer', authenticateClubAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { club, clubPrisma } = req;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo fornecido'
      });
    }

    const masterPrisma = await getMasterClient();
    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId: club.id }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    console.log('🎨 [Club Admin Branding OTA Upload] Uploading logo footer');

    const uploadResult = await s3Service.uploadLogoFooter(appConfig.tenantSlug, file);

    const branding = await clubPrisma.clubBranding.findFirst();

    if (branding) {
      await clubPrisma.clubBranding.update({
        where: { id: branding.id },
        data: { logoFooterUrl: uploadResult.url }
      });
    } else {
      await clubPrisma.clubBranding.create({
        data: { logoFooterUrl: uploadResult.url }
      });
    }

    res.json({
      success: true,
      message: 'Logo do footer enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA Upload] Upload logo footer error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do logo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/branding-ota/upload-banner-home
 * Upload de banner da home (OTA)
 */
router.post('/upload-banner-home', authenticateClubAdmin, upload.single('banner'), async (req, res) => {
  try {
    const { club, clubPrisma } = req;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo fornecido'
      });
    }

    const masterPrisma = await getMasterClient();
    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId: club.id }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    console.log('🎨 [Club Admin Branding OTA Upload] Uploading banner home');

    const uploadResult = await s3Service.uploadBannerHome(appConfig.tenantSlug, file);

    const branding = await clubPrisma.clubBranding.findFirst();

    if (branding) {
      await clubPrisma.clubBranding.update({
        where: { id: branding.id },
        data: { bannerHomeUrl: uploadResult.url }
      });
    } else {
      await clubPrisma.clubBranding.create({
        data: { bannerHomeUrl: uploadResult.url }
      });
    }

    res.json({
      success: true,
      message: 'Banner da home enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA Upload] Upload banner home error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do banner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/branding-ota/upload-banner-promo
 * Upload de banner de promoção (OTA)
 */
router.post('/upload-banner-promo', authenticateClubAdmin, upload.single('banner'), async (req, res) => {
  try {
    const { club, clubPrisma } = req;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo fornecido'
      });
    }

    const masterPrisma = await getMasterClient();
    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId: club.id }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    console.log('🎨 [Club Admin Branding OTA Upload] Uploading banner promo');

    const uploadResult = await s3Service.uploadBannerPromo(appConfig.tenantSlug, file);

    const branding = await clubPrisma.clubBranding.findFirst();

    if (branding) {
      await clubPrisma.clubBranding.update({
        where: { id: branding.id },
        data: { bannerPromoUrl: uploadResult.url }
      });
    } else {
      await clubPrisma.clubBranding.create({
        data: { bannerPromoUrl: uploadResult.url }
      });
    }

    res.json({
      success: true,
      message: 'Banner de promoção enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Branding OTA Upload] Upload banner promo error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do banner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

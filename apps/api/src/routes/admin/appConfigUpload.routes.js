/**
 * Admin App Config Upload Routes
 * Rotas para upload de assets de app (ícones, splash screens)
 * Apenas super-admin tem acesso
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateSuperAdmin } = require('../../middleware/authenticateSuperAdmin');
const { getMasterClient } = require('../../database/master-client');
const s3Service = require('../../services/s3.service');

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
 * POST /api/admin/app-config/:clubId/upload-icon
 * Upload de ícone do app (1024x1024px)
 */
router.post('/:clubId/upload-icon', authenticateSuperAdmin, upload.single('icon'), async (req, res) => {
  try {
    const { clubId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo fornecido'
      });
    }

    const masterPrisma = await getMasterClient();

    // Buscar configuração do app
    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    console.log('📱 [Admin App Config Upload] Uploading app icon:', {
      clubId,
      tenantSlug: appConfig.tenantSlug,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Upload para S3 com URL fixa
    const uploadResult = await s3Service.uploadAppIcon(appConfig.tenantSlug, file);

    // Atualizar URL no banco
    await masterPrisma.clubAppConfig.update({
      where: { clubId },
      data: { appIconUrl: uploadResult.url }
    });

    res.json({
      success: true,
      message: 'Ícone do app enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [Admin App Config Upload] Upload icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do ícone',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/admin/app-config/:clubId/upload-splash
 * Upload de splash screen
 */
router.post('/:clubId/upload-splash', authenticateSuperAdmin, upload.single('splash'), async (req, res) => {
  try {
    const { clubId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo fornecido'
      });
    }

    const masterPrisma = await getMasterClient();

    // Buscar configuração do app
    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId }
    });

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    console.log('📱 [Admin App Config Upload] Uploading splash screen:', {
      clubId,
      tenantSlug: appConfig.tenantSlug,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Upload para S3 com URL fixa
    const uploadResult = await s3Service.uploadSplashScreen(appConfig.tenantSlug, file);

    // Atualizar URL no banco
    await masterPrisma.clubAppConfig.update({
      where: { clubId },
      data: { splashScreenUrl: uploadResult.url }
    });

    res.json({
      success: true,
      message: 'Splash screen enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [Admin App Config Upload] Upload splash error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do splash screen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

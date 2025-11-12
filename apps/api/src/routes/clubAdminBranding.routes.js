/**
 * Club Admin Branding Routes
 * Gerenciar configurações de branding do clube
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { getMasterClient } = require('../database/master-client');

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/branding');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/x-icon';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, SVG, ICO)'));
    }
  }
});

/**
 * GET /api/club-admin/branding/public
 * Buscar configurações de branding do clube (endpoint público para tela de login)
 */
router.get('/public', async (req, res) => {
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
      loginIllustrationUrl: '/assets/images/auth/ils1.svg'
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

/**
 * GET /api/club-admin/branding
 * Buscar configurações de branding do clube
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const masterPrisma = getMasterClient();
    const clubId = req.clubAdmin.clubId;

    // Buscar branding
    let branding = await masterPrisma.clubBranding.findUnique({
      where: { clubId }
    });

    // Se não existir, criar um padrão
    if (!branding) {
      const club = await masterPrisma.club.findUnique({
        where: { id: clubId },
        select: { companyName: true }
      });

      branding = await masterPrisma.clubBranding.create({
        data: {
          clubId,
          appName: club?.companyName || 'Meu Clube',
          appDescription: 'Aplicativo do clube com benefícios exclusivos',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937'
        }
      });
    }

    res.json({
      success: true,
      data: branding
    });

  } catch (error) {
    console.error('❌ [Branding Get] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações de branding',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/club-admin/branding
 * Atualizar configurações de branding do clube
 */
router.put('/', authenticateClubAdmin, async (req, res) => {
  try {
    const masterPrisma = getMasterClient();
    const clubId = req.clubAdmin.clubId;
    const {
      appName,
      appDescription,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      appStoreUrl,
      playStoreUrl
    } = req.body;

    // Validações básicas
    if (appName && appName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nome do app deve ter no máximo 100 caracteres'
      });
    }

    // Validar formato de cores (hex)
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    const colors = { primaryColor, secondaryColor, accentColor, backgroundColor, textColor };

    for (const [key, value] of Object.entries(colors)) {
      if (value && !hexColorRegex.test(value)) {
        return res.status(400).json({
          success: false,
          message: `${key} deve ser uma cor hexadecimal válida (ex: #3B82F6)`
        });
      }
    }

    // Atualizar ou criar branding
    const branding = await masterPrisma.clubBranding.upsert({
      where: { clubId },
      update: {
        appName,
        appDescription,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        appStoreUrl,
        playStoreUrl
      },
      create: {
        clubId,
        appName: appName || 'Meu Clube',
        appDescription,
        primaryColor: primaryColor || '#3B82F6',
        secondaryColor: secondaryColor || '#10B981',
        accentColor: accentColor || '#F59E0B',
        backgroundColor: backgroundColor || '#FFFFFF',
        textColor: textColor || '#1F2937',
        appStoreUrl,
        playStoreUrl
      }
    });

    console.log(`✅ [BRANDING] Configurações atualizadas para clube ${clubId}`);

    res.json({
      success: true,
      message: 'Configurações de branding atualizadas com sucesso',
      data: branding
    });

  } catch (error) {
    console.error('❌ [Branding Update] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configurações de branding',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/branding/upload
 * Upload de imagens de branding (logo, icon, favicon)
 */
router.post('/upload', authenticateClubAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    const { imageType } = req.body; // 'logo', 'icon', ou 'favicon'

    if (!['logo', 'icon', 'favicon'].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de imagem inválido. Use: logo, icon ou favicon'
      });
    }

    const masterPrisma = getMasterClient();
    const clubId = req.clubAdmin.clubId;
    const imageUrl = `/uploads/branding/${req.file.filename}`;

    // Mapear o tipo de imagem para o campo correto no banco
    const fieldMap = {
      logo: 'logoUrl',
      icon: 'logoIconUrl',
      favicon: 'faviconUrl'
    };

    const fieldName = fieldMap[imageType];

    // Atualizar ou criar branding com a URL da imagem
    const branding = await masterPrisma.clubBranding.upsert({
      where: { clubId },
      update: {
        [fieldName]: imageUrl
      },
      create: {
        clubId,
        appName: 'Meu Clube',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        [fieldName]: imageUrl
      }
    });

    console.log(`✅ [BRANDING UPLOAD] ${imageType} atualizado para clube ${clubId}: ${imageUrl}`);

    res.json({
      success: true,
      message: `${imageType} enviado com sucesso`,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        fieldName: fieldName
      }
    });

  } catch (error) {
    console.error('❌ [Branding Upload] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da imagem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

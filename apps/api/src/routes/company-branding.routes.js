const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateJWT } = require('../middleware/jwt.middleware');
const s3Service = require('../services/s3.service');
const prismaConfig = require('../config/prisma');

// Configuração do multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, GIF, WebP ou SVG.'));
    }
  }
});

// Upload de logo da empresa
router.post('/upload-logo', authenticateJWT, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    // Verificar se o usuário tem permissão para atualizar a empresa
    const prisma = prismaConfig.prisma;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCompanies: {
          where: { companyId: parseInt(companyId) },
          include: {
            company: true
          }
        }
      }
    });

    if (!user || user.userCompanies.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar esta empresa'
      });
    }

    const company = user.userCompanies[0].company;

    // Fazer upload para o S3
    const uploadResult = await s3Service.uploadCompanyLogo(companyId, req.file);

    // Salvar URL no banco de dados
    await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: {
        branding: {
          ...(company.branding || {}),
          logoUrl: uploadResult.url,
          logoKey: uploadResult.key,
          logoUpdatedAt: new Date().toISOString()
        },
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Logo da empresa enviado com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao enviar logo'
    });
  }
});

// Obter informações do logo da empresa
router.get('/logo/:companyId', authenticateJWT, async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;
    const prisma = prismaConfig.prisma;

    // Verificar se o usuário tem acesso à empresa
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCompanies: {
          where: { companyId: parseInt(companyId) },
          include: {
            company: true
          }
        }
      }
    });

    if (!user || user.userCompanies.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem acesso a esta empresa'
      });
    }

    const company = user.userCompanies[0].company;
    const branding = company.branding || {};

    res.json({
      success: true,
      message: 'Informações obtidas',
      data: {
        hasLogo: !!branding.logoUrl,
        url: branding.logoUrl || null,
        lastUpdated: branding.logoUpdatedAt || null
      }
    });
  } catch (error) {
    console.error('Erro ao obter informações do logo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter informações'
    });
  }
});

// Deletar logo da empresa
router.delete('/logo/:companyId', authenticateJWT, async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;
    const prisma = prismaConfig.prisma;

    // Verificar se o usuário tem permissão para deletar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCompanies: {
          where: { companyId: parseInt(companyId) },
          include: {
            company: true
          }
        }
      }
    });

    if (!user || user.userCompanies.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para esta ação'
      });
    }

    const company = user.userCompanies[0].company;
    const branding = company.branding || {};

    if (branding.logoKey) {
      // Deletar do S3
      await s3Service.deleteFile(branding.logoKey);
    }

    // Remover do banco
    await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: {
        branding: {
          ...(branding || {}),
          logoUrl: null,
          logoKey: null,
          logoUpdatedAt: null
        },
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Logo removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar logo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao deletar logo'
    });
  }
});

// Upload de outras imagens de branding (favicon, banner, etc)
router.post('/upload-branding', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyId, type } = req.body; // type: favicon, banner, background, etc
    const prisma = prismaConfig.prisma;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de imagem não especificado'
      });
    }

    // Verificar permissões
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCompanies: {
          where: { companyId: parseInt(companyId) },
          include: {
            company: true
          }
        }
      }
    });

    if (!user || user.userCompanies.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar esta empresa'
      });
    }

    const company = user.userCompanies[0].company;

    // Upload para S3 com prefixo específico
    const fileName = s3Service.generateUniqueFileName(req.file.originalname, `${companyId}_${type}`);
    const key = `${s3Service.prefixes.companyLogos}${companyId}/${type}/${fileName}`;
    
    const uploadResult = await s3Service.uploadFile(req.file.buffer, key, req.file.mimetype);

    // Atualizar branding no banco
    const brandingUpdate = {
      ...(company.branding || {}),
      [`${type}Url`]: uploadResult.url,
      [`${type}Key`]: uploadResult.key,
      [`${type}UpdatedAt`]: new Date().toISOString()
    };

    await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: {
        branding: brandingUpdate,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: `${type} enviado com sucesso`,
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        type
      }
    });
  } catch (error) {
    console.error('Erro ao fazer upload de branding:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao enviar imagem'
    });
  }
});

module.exports = router;
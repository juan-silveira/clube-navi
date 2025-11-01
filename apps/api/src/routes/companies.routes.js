const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateJWT } = require('../middleware/jwt.middleware');
const { requireAnyAdmin } = require('../middleware/admin.middleware');
const s3Service = require('../services/s3.service');
const whitelabelService = require('../services/whitelabel.service');
const prismaConfig = require('../config/prisma');

// Configuração do multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, GIF, WebP, SVG ou ICO.'));
    }
  }
});

// Buscar empresa por ID (pública - não requer autenticação)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = prismaConfig.prisma;

    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        alias: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar empresa'
    });
  }
});

// Listar todas as empresas
router.get('/', authenticateJWT, requireAnyAdmin, async (req, res) => {
  try {
    const prisma = prismaConfig.prisma;
    
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        alias: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            userCompanies: true,
            transactions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar dados para incluir estatísticas e informações de branding
    const companiesWithStats = await Promise.all(companies.map(async (company) => {
      // Buscar branding específico da tabela companyBrandings
      const branding = await prisma.companyBranding.findFirst({
        where: {
          companyId: company.id,
          isActive: true
        }
      });

      // Retornar URLs diretas (públicas) para assets de branding
      const generateSignedUrlIfExists = async (url) => {
        if (!url) return null;
        return url; // URLs de branding são públicas
      };

      return {
        id: company.id,
        name: company.name,
        alias: company.alias,
        status: company.isActive ? 'active' : 'inactive',
        hasCustomBranding: !!branding,
        users: company._count.userCompanies,
        transactions: company._count.transactions,
        volume: 0, // TODO: Calcular volume real das transações
        createdAt: company.createdAt,
        lastActivityAt: company.updatedAt,
        branding: branding ? {
          id: branding.id,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          accentColor: branding.accentColor,
          backgroundColor: branding.backgroundColor,
          textColor: branding.textColor,
          logoUrl: await generateSignedUrlIfExists(branding.logoUrl),
          logoUrlDark: await generateSignedUrlIfExists(branding.logoUrlDark),
          miniUrl: await generateSignedUrlIfExists(branding.miniUrl),
          miniUrlDark: await generateSignedUrlIfExists(branding.miniUrlDark),
          textUrl: await generateSignedUrlIfExists(branding.textUrl),
          textUrlDark: await generateSignedUrlIfExists(branding.textUrlDark),
          faviconUrl: await generateSignedUrlIfExists(branding.faviconUrl),
          backgroundImageUrl: await generateSignedUrlIfExists(branding.backgroundImageUrl),
          loginTitle: branding.loginTitle,
          loginSubtitle: branding.loginSubtitle,
          welcomeMessage: branding.welcomeMessage,
          footerText: branding.footerText,
          supportUrl: branding.supportUrl,
          privacyPolicyUrl: branding.privacyPolicyUrl,
          termsOfServiceUrl: branding.termsOfServiceUrl,
          contactEmail: branding.contactEmail,
          layoutStyle: branding.layoutStyle,
          borderRadius: branding.borderRadius,
          fontFamily: branding.fontFamily,
          fontSize: branding.fontSize,
          customCss: branding.customCss,
          customJs: branding.customJs,
          allowCustomization: branding.allowCustomization,
          isActive: branding.isActive,
          version: branding.version,
          deployedAt: branding.deployedAt
        } : null
      };
    }));

    res.json({
      success: true,
      data: companiesWithStats,
      total: companiesWithStats.length
    });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao listar empresas'
    });
  }
});

// Upload de branding asset
router.post('/:companyId/branding/upload/:assetType', 
  authenticateJWT, 
  requireAnyAdmin, 
  upload.single('file'), 
  async (req, res) => {
    try {
      const { companyId, assetType } = req.params;
      const prisma = prismaConfig.prisma;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      // Validar asset type
      const allowedTypes = ['logo', 'logo-dark', 'mini', 'mini-dark', 'text', 'text-dark', 'favicon', 'background'];
      if (!allowedTypes.includes(assetType)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de asset não permitido. Use: ${allowedTypes.join(', ')}`
        });
      }

      // Verificar se a empresa existe
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      // Fazer upload para o S3
      const uploadResult = await s3Service.uploadBrandingAsset(companyId, req.file, assetType);

      // Buscar ou criar registro de branding
      let branding = await prisma.companyBranding.findFirst({
        where: {
          companyId: companyId,
          isActive: true
        }
      });

      const fieldMap = {
        'logo': 'logoUrl',
        'logo-dark': 'logoUrlDark',
        'mini': 'miniUrl',
        'mini-dark': 'miniUrlDark',
        'text': 'textUrl',
        'text-dark': 'textUrlDark',
        'favicon': 'faviconUrl',
        'background': 'backgroundImageUrl'
      };

      const updateData = {
        [fieldMap[assetType]]: uploadResult.url
      };

      if (branding) {
        // Atualizar branding existente
        branding = await prisma.companyBranding.update({
          where: { id: branding.id },
          data: updateData
        });
      } else {
        // Criar novo branding
        branding = await prisma.companyBranding.create({
          data: {
            companyId: companyId,
            primaryColor: '#10B981',
            secondaryColor: '#059669',
            accentColor: '#3B82F6',
            backgroundColor: '#FFFFFF',
            textColor: '#111827',
            loginTitle: `Bem-vindo à ${company.name}`,
            loginSubtitle: 'Plataforma de blockchain',
            welcomeMessage: `Bem-vindo à ${company.name}! Sua plataforma confiável para operações blockchain.`,
            footerText: `© 2025 ${company.name}. Todos os direitos reservados.`,
            contactEmail: `support@${company.alias}.com`,
            layoutStyle: 'default',
            borderRadius: 8,
            fontSize: 'medium',
            allowCustomization: true,
            isActive: true,
            version: 1,
            ...updateData
          }
        });
      }

      res.json({
        success: true,
        message: `${assetType} enviado com sucesso`,
        data: {
          url: uploadResult.url,
          key: uploadResult.key,
          assetType: assetType,
          branding: branding
        }
      });
    } catch (error) {
      console.error('Erro ao fazer upload de branding asset:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao enviar arquivo'
      });
    }
  }
);

// Salvar configurações de branding completas
router.put('/:companyId/branding', 
  authenticateJWT, 
  requireAnyAdmin, 
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const brandingData = req.body;
      const prisma = prismaConfig.prisma;

      // Verificar se a empresa existe
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      // Buscar branding existente
      let branding = await prisma.companyBranding.findFirst({
        where: {
          companyId: companyId,
          isActive: true
        }
      });

      const updateData = {
        primaryColor: brandingData.primaryColor || '#10B981',
        secondaryColor: brandingData.secondaryColor || '#059669',
        accentColor: brandingData.accentColor || '#3B82F6',
        backgroundColor: brandingData.backgroundColor || '#FFFFFF',
        textColor: brandingData.textColor || '#111827',
        loginTitle: brandingData.loginTitle || `Bem-vindo à ${company.name}`,
        loginSubtitle: brandingData.loginSubtitle || 'Plataforma de blockchain',
        welcomeMessage: brandingData.welcomeMessage || `Bem-vindo à ${company.name}!`,
        footerText: brandingData.footerText || `© 2025 ${company.name}. Todos os direitos reservados.`,
        supportUrl: brandingData.supportUrl || null,
        privacyPolicyUrl: brandingData.privacyPolicyUrl || null,
        termsOfServiceUrl: brandingData.termsOfServiceUrl || null,
        contactEmail: brandingData.contactEmail || `support@${company.alias}.com`,
        layoutStyle: brandingData.layoutStyle || 'default',
        borderRadius: brandingData.borderRadius || 8,
        fontFamily: brandingData.fontFamily || null,
        fontSize: brandingData.fontSize || 'medium',
        customCss: brandingData.customCss || null,
        customJs: brandingData.customJs || null,
        allowCustomization: brandingData.allowCustomization ?? true
      };

      if (branding) {
        // Atualizar branding existente
        branding = await prisma.companyBranding.update({
          where: { id: branding.id },
          data: updateData
        });
      } else {
        // Criar novo branding
        branding = await prisma.companyBranding.create({
          data: {
            companyId: companyId,
            isActive: true,
            version: 1,
            ...updateData
          }
        });
      }

      res.json({
        success: true,
        message: 'Configurações de branding salvas com sucesso',
        data: branding
      });
    } catch (error) {
      console.error('Erro ao salvar branding:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao salvar configurações'
      });
    }
  }
);

// Obter branding de uma empresa
router.get('/:companyId/branding', authenticateJWT, async (req, res) => {
  try {
    const { companyId } = req.params;
    const prisma = prismaConfig.prisma;

    const branding = await prisma.companyBranding.findFirst({
      where: {
        companyId: companyId,
        isActive: true
      }
    });

    if (!branding) {
      return res.status(404).json({
        success: false,
        message: 'Configurações de branding não encontradas'
      });
    }

    // Retornar URLs diretas (públicas) para assets de branding
    const generateSignedUrlIfExists = async (url) => {
      if (!url) return null;
      return url; // URLs de branding são públicas
    };

    // Mapear campos para manter compatibilidade com frontend
    const mappedBranding = {
      ...branding,
      brandName: branding.brandName || branding.loginTitle,
      logoUrl: await generateSignedUrlIfExists(branding.logoUrl),
      logoUrlDark: await generateSignedUrlIfExists(branding.logoUrlDark),
      miniUrl: await generateSignedUrlIfExists(branding.miniUrl),
      miniUrlDark: await generateSignedUrlIfExists(branding.miniUrlDark),
      textUrl: await generateSignedUrlIfExists(branding.textUrl),
      textUrlDark: await generateSignedUrlIfExists(branding.textUrlDark),
      faviconUrl: await generateSignedUrlIfExists(branding.faviconUrl),
      backgroundImageUrl: await generateSignedUrlIfExists(branding.backgroundImageUrl)
    };

    res.json({
      success: true,
      data: mappedBranding
    });
  } catch (error) {
    console.error('Erro ao obter branding:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter configurações'
    });
  }
});

// Deletar asset de branding
router.delete('/:companyId/branding/asset/:assetType', 
  authenticateJWT, 
  requireAnyAdmin, 
  async (req, res) => {
    try {
      const { companyId, assetType } = req.params;
      const prisma = prismaConfig.prisma;

      // Validar asset type
      const allowedTypes = ['logo', 'logo-dark', 'mini', 'mini-dark', 'text', 'text-dark', 'favicon', 'background'];
      if (!allowedTypes.includes(assetType)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de asset não permitido. Use: ${allowedTypes.join(', ')}`
        });
      }

      // Buscar branding
      const branding = await prisma.companyBranding.findFirst({
        where: {
          companyId: companyId,
          isActive: true
        }
      });

      if (!branding) {
        return res.status(404).json({
          success: false,
          message: 'Configurações de branding não encontradas'
        });
      }

      // Deletar do S3
      await s3Service.deleteBrandingAssets(companyId, assetType);

      // Atualizar registro no banco
      const fieldMap = {
        'logo': 'logoUrl',
        'logo-dark': 'logoUrlDark',
        'mini': 'miniUrl',
        'mini-dark': 'miniUrlDark',
        'text': 'textUrl',
        'text-dark': 'textUrlDark',
        'favicon': 'faviconUrl',
        'background': 'backgroundImageUrl'
      };

      await prisma.companyBranding.update({
        where: { id: branding.id },
        data: {
          [fieldMap[assetType]]: null
        }
      });

      res.json({
        success: true,
        message: `${assetType} removido com sucesso`
      });
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao deletar asset'
      });
    }
  }
);

// Ativar/Desativar empresa
router.patch('/:companyId/status', 
  authenticateJWT, 
  requireAnyAdmin, 
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const { status } = req.body;
      const prisma = prismaConfig.prisma;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status deve ser "active" ou "inactive"'
        });
      }

      const company = await prisma.company.update({
        where: { id: companyId },
        data: { isActive: status === 'active' }
      });

      res.json({
        success: true,
        message: `Empresa ${status === 'active' ? 'ativada' : 'desativada'} com sucesso`,
        data: company
      });
    } catch (error) {
      console.error('Erro ao alterar status da empresa:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao alterar status'
      });
    }
  }
);

module.exports = router;
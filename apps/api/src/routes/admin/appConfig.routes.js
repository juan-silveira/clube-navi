/**
 * Admin App Config Routes
 * Gerenciar configurações de build-time dos apps (ícone, nome, bundle IDs)
 * Apenas super-admin tem acesso
 */

const express = require('express');
const router = express.Router();
const { authenticateSuperAdmin } = require('../../middleware/authenticateSuperAdmin');
const { getMasterClient } = require('../../database/master-client');
const {
  generateSlug,
  generateBundleId,
  generatePackageName,
  generateUrlScheme,
  isValidSlug
} = require('../../utils/slug.utils');

/**
 * GET /api/admin/app-config/:clubId
 * Buscar configuração do app de um clube
 */
router.get('/:clubId', authenticateSuperAdmin, async (req, res) => {
  try {
    const { clubId } = req.params;
    const masterPrisma = await getMasterClient();

    console.log('📱 [Admin App Config] Buscando configuração do clube:', clubId);

    const appConfig = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId },
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

    if (!appConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuração de app não encontrada'
      });
    }

    res.json({
      success: true,
      data: appConfig
    });

  } catch (error) {
    console.error('❌ [Admin App Config] Get error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configuração',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/admin/app-config
 * Criar nova configuração de app para um clube
 */
router.post('/', authenticateSuperAdmin, async (req, res) => {
  try {
    const { clubId, appName, tenantSlug, appDescription } = req.body;

    if (!clubId || !appName) {
      return res.status(400).json({
        success: false,
        message: 'clubId e appName são obrigatórios'
      });
    }

    const masterPrisma = await getMasterClient();

    // Verificar se clube existe
    const club = await masterPrisma.club.findUnique({
      where: { id: clubId }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Clube não encontrado'
      });
    }

    // Verificar se já existe config para este clube
    const existing = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Clube já possui configuração de app'
      });
    }

    // Gerar ou usar tenant slug fornecido
    let finalSlug = tenantSlug;
    if (!finalSlug) {
      finalSlug = generateSlug(appName);
    }

    // Validar slug
    if (!isValidSlug(finalSlug)) {
      return res.status(400).json({
        success: false,
        message: 'Slug inválido. Use apenas letras minúsculas, números e hífens.'
      });
    }

    // Verificar unicidade do slug
    const slugExists = await masterPrisma.clubAppConfig.findUnique({
      where: { tenantSlug: finalSlug }
    });

    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'Este slug já está em uso por outro clube'
      });
    }

    // Gerar bundle IDs automaticamente
    const bundleId = generateBundleId(finalSlug);
    const packageName = generatePackageName(finalSlug);
    const urlScheme = generateUrlScheme(finalSlug);

    // Verificar unicidade dos bundle IDs
    const bundleExists = await masterPrisma.clubAppConfig.findFirst({
      where: {
        OR: [
          { bundleId },
          { packageName },
          { urlScheme }
        ]
      }
    });

    if (bundleExists) {
      return res.status(400).json({
        success: false,
        message: 'Bundle ID ou Package Name já existe'
      });
    }

    // URLs padrão (temporárias até fazer upload real)
    const defaultIconUrl = `https://cdn.clubedigital.com/tenants/${finalSlug}/build/app-icon.png`;
    const defaultSplashUrl = `https://cdn.clubedigital.com/tenants/${finalSlug}/build/splash.png`;

    console.log('📱 [Admin App Config] Criando configuração:', {
      clubId,
      appName,
      tenantSlug: finalSlug,
      bundleId,
      packageName,
      urlScheme
    });

    const appConfig = await masterPrisma.clubAppConfig.create({
      data: {
        clubId,
        appName,
        tenantSlug: finalSlug,
        appDescription,
        bundleId,
        packageName,
        urlScheme,
        appIconUrl: defaultIconUrl,
        splashScreenUrl: defaultSplashUrl
      },
      include: {
        club: {
          select: {
            id: true,
            slug: true,
            companyName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Configuração de app criada com sucesso',
      data: appConfig
    });

  } catch (error) {
    console.error('❌ [Admin App Config] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar configuração',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/admin/app-config/:clubId
 * Atualizar configuração de app
 */
router.put('/:clubId', authenticateSuperAdmin, async (req, res) => {
  try {
    const { clubId } = req.params;
    const {
      appName,
      appDescription,
      appIconUrl,
      splashScreenUrl,
      appStoreUrl,
      playStoreUrl,
      appStoreStatus,
      playStoreStatus,
      autoBuildEnabled
    } = req.body;

    const masterPrisma = await getMasterClient();

    // Verificar se existe
    const existing = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      });
    }

    console.log('📱 [Admin App Config] Atualizando configuração:', clubId);

    // Preparar dados para update (apenas campos permitidos)
    const updateData = {};
    if (appName) updateData.appName = appName;
    if (appDescription !== undefined) updateData.appDescription = appDescription;
    if (appIconUrl) updateData.appIconUrl = appIconUrl;
    if (splashScreenUrl) updateData.splashScreenUrl = splashScreenUrl;
    if (appStoreUrl !== undefined) updateData.appStoreUrl = appStoreUrl;
    if (playStoreUrl !== undefined) updateData.playStoreUrl = playStoreUrl;
    if (appStoreStatus) updateData.appStoreStatus = appStoreStatus;
    if (playStoreStatus) updateData.playStoreStatus = playStoreStatus;
    if (autoBuildEnabled !== undefined) updateData.autoBuildEnabled = autoBuildEnabled;

    const updated = await masterPrisma.clubAppConfig.update({
      where: { clubId },
      data: updateData,
      include: {
        club: {
          select: {
            id: true,
            slug: true,
            companyName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso',
      data: updated
    });

  } catch (error) {
    console.error('❌ [Admin App Config] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configuração',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/admin/app-config/:clubId/increment-build
 * Incrementar build numbers (iOS e/ou Android)
 */
router.patch('/:clubId/increment-build', authenticateSuperAdmin, async (req, res) => {
  try {
    const { clubId } = req.params;
    const { platform, version } = req.body; // platform: 'ios' | 'android' | 'both'

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform é obrigatório (ios, android ou both)'
      });
    }

    const masterPrisma = await getMasterClient();

    const existing = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      });
    }

    console.log('📱 [Admin App Config] Incrementando build:', { clubId, platform, version });

    const updateData = {};

    if (platform === 'ios' || platform === 'both') {
      updateData.iosBuildNumber = existing.iosBuildNumber + 1;
    }

    if (platform === 'android' || platform === 'both') {
      updateData.androidBuildNumber = existing.androidBuildNumber + 1;
    }

    if (version) {
      updateData.currentVersion = version;
    }

    const updated = await masterPrisma.clubAppConfig.update({
      where: { clubId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Build numbers incrementados',
      data: {
        iosBuildNumber: updated.iosBuildNumber,
        androidBuildNumber: updated.androidBuildNumber,
        currentVersion: updated.currentVersion
      }
    });

  } catch (error) {
    console.error('❌ [Admin App Config] Increment build error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao incrementar build',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/admin/app-config
 * Listar todas as configurações de apps
 */
router.get('/', authenticateSuperAdmin, async (req, res) => {
  try {
    const { status, autoBuildEnabled } = req.query;
    const masterPrisma = await getMasterClient();

    console.log('📱 [Admin App Config] Listando configurações');

    const where = {};

    if (status) {
      where.OR = [
        { appStoreStatus: status },
        { playStoreStatus: status }
      ];
    }

    if (autoBuildEnabled !== undefined) {
      where.autoBuildEnabled = autoBuildEnabled === 'true';
    }

    const configs = await masterPrisma.clubAppConfig.findMany({
      where,
      include: {
        club: {
          select: {
            id: true,
            slug: true,
            companyName: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: configs,
      count: configs.length
    });

  } catch (error) {
    console.error('❌ [Admin App Config] List error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar configurações',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/admin/app-config/:clubId
 * Deletar configuração de app
 */
router.delete('/:clubId', authenticateSuperAdmin, async (req, res) => {
  try {
    const { clubId } = req.params;
    const masterPrisma = await getMasterClient();

    const existing = await masterPrisma.clubAppConfig.findUnique({
      where: { clubId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada'
      });
    }

    // Verificar se app já está publicado
    if (existing.appStoreStatus === 'PUBLISHED' || existing.playStoreStatus === 'PUBLISHED') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar configuração de app publicado'
      });
    }

    console.log('📱 [Admin App Config] Deletando configuração:', clubId);

    await masterPrisma.clubAppConfig.delete({
      where: { clubId }
    });

    res.json({
      success: true,
      message: 'Configuração deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ [Admin App Config] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar configuração',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

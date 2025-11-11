/**
 * Club Admin Modules Routes
 * Gerenciar módulos do clube específico
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');
const { getMasterClient } = require('../database/master-client');

/**
 * GET /api/club-admin/modules
 * Listar todos os módulos do clube (ativos e inativos)
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const { club } = req;
    const masterPrisma = await getMasterClient();

    console.log(`📦 [Modules] Buscando módulos do clube: ${club.slug}`);

    const modules = await masterPrisma.clubModule.findMany({
      where: {
        clubId: club.id
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json({
      success: true,
      data: modules
    });

  } catch (error) {
    console.error('❌ [Club Admin Modules] List error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/modules/active
 * Listar apenas módulos ativos do clube
 */
router.get('/active', authenticateClubAdmin, async (req, res) => {
  try {
    const { club } = req;
    const masterPrisma = await getMasterClient();

    console.log(`📦 [Modules] Buscando módulos ativos do clube: ${club.slug}`);

    const modules = await masterPrisma.clubModule.findMany({
      where: {
        clubId: club.id,
        isEnabled: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json({
      success: true,
      data: modules
    });

  } catch (error) {
    console.error('❌ [Club Admin Modules] List active error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/club-admin/modules/:moduleId
 * Atualizar módulo específico (habilitar/desabilitar, alterar config, etc)
 */
router.put('/:moduleId', authenticateClubAdmin, async (req, res) => {
  try {
    const { club } = req;
    const { moduleId } = req.params;
    const { isEnabled, config, displayName, description } = req.body;
    const masterPrisma = await getMasterClient();

    console.log(`📦 [Modules] Atualizando módulo ${moduleId} do clube: ${club.slug}`);

    // Verificar se o módulo pertence ao clube
    const existingModule = await masterPrisma.clubModule.findUnique({
      where: { id: moduleId }
    });

    if (!existingModule || existingModule.clubId !== club.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or does not belong to this club'
      });
    }

    // Atualizar módulo
    const updatedModule = await masterPrisma.clubModule.update({
      where: { id: moduleId },
      data: {
        ...(isEnabled !== undefined && { isEnabled }),
        ...(config !== undefined && { config }),
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description })
      }
    });

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: updatedModule
    });

  } catch (error) {
    console.error('❌ [Club Admin Modules] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/club-admin/modules/reorder
 * Reordenar módulos (atualizar sortOrder de múltiplos módulos)
 */
router.put('/reorder', authenticateClubAdmin, async (req, res) => {
  try {
    const { club } = req;
    const { modules } = req.body; // Array de { id, sortOrder }
    const masterPrisma = await getMasterClient();

    if (!Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        message: 'modules must be an array'
      });
    }

    console.log(`📦 [Modules] Reordenando ${modules.length} módulos do clube: ${club.slug}`);

    // Atualizar cada módulo em uma transação
    await masterPrisma.$transaction(
      modules.map((module) =>
        masterPrisma.clubModule.update({
          where: {
            id: module.id,
            clubId: club.id // Garantir que pertence ao clube
          },
          data: {
            sortOrder: module.sortOrder
          }
        })
      )
    );

    // Buscar módulos atualizados
    const updatedModules = await masterPrisma.clubModule.findMany({
      where: {
        clubId: club.id
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Modules reordered successfully',
      data: updatedModules
    });

  } catch (error) {
    console.error('❌ [Club Admin Modules] Reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/club-admin/modules/:moduleId/toggle
 * Alternar status de habilitação de um módulo
 */
router.patch('/:moduleId/toggle', authenticateClubAdmin, async (req, res) => {
  try {
    const { club } = req;
    const { moduleId } = req.params;
    const masterPrisma = await getMasterClient();

    console.log(`📦 [Modules] Alternando status do módulo ${moduleId} do clube: ${club.slug}`);

    // Verificar se o módulo pertence ao clube
    const existingModule = await masterPrisma.clubModule.findUnique({
      where: { id: moduleId }
    });

    if (!existingModule || existingModule.clubId !== club.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or does not belong to this club'
      });
    }

    // Alternar isEnabled
    const updatedModule = await masterPrisma.clubModule.update({
      where: { id: moduleId },
      data: {
        isEnabled: !existingModule.isEnabled
      }
    });

    res.json({
      success: true,
      message: `Module ${updatedModule.isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: updatedModule
    });

  } catch (error) {
    console.error('❌ [Club Admin Modules] Toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

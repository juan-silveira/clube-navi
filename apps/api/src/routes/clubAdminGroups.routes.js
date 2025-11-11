/**
 * Club Admin Groups Routes
 * Gerenciar grupos de usuários do clube
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');

/**
 * GET /api/club-admin/groups
 * Listar todos os grupos do clube com seus membros
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma, user } = req;

    console.log('📦 [Groups] Buscando grupos do clube');

    const groups = await clubPrisma.group.findMany({
      where: {
        createdBy: user.id
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar dados para incluir membros diretamente e memberCount
    const groupsWithMembers = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      color: group.color,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.users.map(gu => gu.user),
      memberCount: group._count.users
    }));

    res.json({
      success: true,
      data: groupsWithMembers
    });

  } catch (error) {
    console.error('❌ [Club Admin Groups] List error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/groups
 * Criar novo grupo
 */
router.post('/', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma, user } = req;
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome do grupo é obrigatório'
      });
    }

    console.log('📦 [Groups] Criando novo grupo:', name);

    const group = await clubPrisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#6366f1',
        createdBy: user.id
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Grupo criado com sucesso',
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        color: group.color,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        members: group.users.map(gu => gu.user),
        memberCount: group._count.users
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Groups] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/club-admin/groups/:id
 * Atualizar grupo existente
 */
router.put('/:id', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma } = req;
    const { id } = req.params;
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome do grupo é obrigatório'
      });
    }

    console.log('📦 [Groups] Atualizando grupo:', id);

    // Verificar se o grupo existe
    const existingGroup = await clubPrisma.group.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }

    const group = await clubPrisma.group.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#6366f1'
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Grupo atualizado com sucesso',
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        color: group.color,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        members: group.users.map(gu => gu.user),
        memberCount: group._count.users
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Groups] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/club-admin/groups/:id
 * Deletar grupo
 */
router.delete('/:id', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma } = req;
    const { id } = req.params;

    console.log('📦 [Groups] Deletando grupo:', id);

    // Verificar se o grupo existe
    const existingGroup = await clubPrisma.group.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }

    await clubPrisma.group.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Grupo excluído com sucesso'
    });

  } catch (error) {
    console.error('❌ [Club Admin Groups] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/groups/:id/members
 * Adicionar usuário ao grupo
 */
router.post('/:id/members', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma, user: adminUser } = req;
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId é obrigatório'
      });
    }

    console.log('📦 [Groups] Adicionando usuário', userId, 'ao grupo', id);

    // Verificar se o grupo existe
    const group = await clubPrisma.group.findUnique({
      where: { id }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }

    // Verificar se o usuário existe
    const user = await clubPrisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // CRÍTICO: Verificar se o usuário já está em outro grupo (validação one-user-per-group)
    const existingMembership = await clubPrisma.groupUser.findFirst({
      where: {
        userId: userId
      },
      include: {
        group: {
          select: {
            name: true
          }
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: `Usuário já está em outro grupo: ${existingMembership.group.name}`
      });
    }

    // Adicionar usuário ao grupo
    await clubPrisma.groupUser.create({
      data: {
        groupId: id,
        userId: userId,
        addedBy: adminUser.id
      }
    });

    res.json({
      success: true,
      message: 'Usuário adicionado ao grupo com sucesso'
    });

  } catch (error) {
    console.error('❌ [Club Admin Groups] Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/club-admin/groups/:id/members/:userId
 * Remover usuário do grupo
 */
router.delete('/:id/members/:userId', authenticateClubAdmin, async (req, res) => {
  try {
    const { clubPrisma } = req;
    const { id, userId } = req.params;

    console.log('📦 [Groups] Removendo usuário', userId, 'do grupo', id);

    // Verificar se o usuário pertence ao grupo
    const groupUser = await clubPrisma.groupUser.findFirst({
      where: {
        groupId: id,
        userId: userId
      }
    });

    if (!groupUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado neste grupo'
      });
    }

    // Remover usuário do grupo
    await clubPrisma.groupUser.delete({
      where: {
        id: groupUser.id
      }
    });

    res.json({
      success: true,
      message: 'Usuário removido do grupo com sucesso'
    });

  } catch (error) {
    console.error('❌ [Club Admin Groups] Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

/**
 * Controller de Roles e Permissões
 *
 * Gerencia roles, permissões e atribuição de roles aos usuários.
 */

const { PrismaClient } = require('../generated/prisma-tenant');
const { clearUserPermissionCache } = require('../middlewares/checkPermission');

/**
 * Listar todas as roles
 */
exports.listRoles = async (req, res) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        priority: 'desc' // Maior prioridade primeiro
      },
      include: {
        _count: {
          select: {
            userRoles: true,
            permissions: true
          }
        }
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao listar roles:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar roles'
    });
  }
};

/**
 * Buscar detalhes de uma role específica
 */
exports.getRoleDetails = async (req, res) => {
  const { roleId } = req.params;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                cpf: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Role não encontrada'
      });
    }

    await prisma.$disconnect();

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao buscar role:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar role'
    });
  }
};

/**
 * Criar nova role (apenas roles personalizadas, não system roles)
 */
exports.createRole = async (req, res) => {
  const { name, displayName, description, priority, permissionIds } = req.body;

  if (!name || !displayName) {
    return res.status(400).json({
      success: false,
      error: 'Nome e displayName são obrigatórios'
    });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    // Criar role
    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        isSystem: false, // Roles criadas pelo usuário nunca são system
        priority: priority || 40 // Prioridade padrão entre Operador (50) e Cliente Adimplente (30)
      }
    });

    // Atribuir permissões se fornecidas
    if (permissionIds && permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId
        }))
      });
    }

    // Buscar role completa com permissões
    const completeRole = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    await prisma.$disconnect();

    res.status(201).json({
      success: true,
      data: completeRole
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao criar role:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma role com este nome'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao criar role'
    });
  }
};

/**
 * Atualizar role (apenas roles não-system)
 */
exports.updateRole = async (req, res) => {
  const { roleId } = req.params;
  const { displayName, description, priority, permissionIds } = req.body;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    // Verificar se a role existe e não é system
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Role não encontrada'
      });
    }

    if (role.isSystem) {
      await prisma.$disconnect();
      return res.status(403).json({
        success: false,
        error: 'Roles do sistema não podem ser editadas'
      });
    }

    // Atualizar role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        displayName,
        description,
        priority
      }
    });

    // Atualizar permissões se fornecidas
    if (permissionIds !== undefined) {
      // Deletar permissões antigas
      await prisma.rolePermission.deleteMany({
        where: { roleId }
      });

      // Criar novas permissões
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId
          }))
        });
      }
    }

    // Buscar role completa
    const completeRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Limpar cache de permissões de todos os usuários com esta role
    const userRoles = await prisma.userRole.findMany({
      where: { roleId }
    });

    for (const userRole of userRoles) {
      clearUserPermissionCache(userRole.userId);
    }

    await prisma.$disconnect();

    res.json({
      success: true,
      data: completeRole
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao atualizar role:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar role'
    });
  }
};

/**
 * Deletar role (apenas roles não-system)
 */
exports.deleteRole = async (req, res) => {
  const { roleId } = req.params;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Role não encontrada'
      });
    }

    if (role.isSystem) {
      await prisma.$disconnect();
      return res.status(403).json({
        success: false,
        error: 'Roles do sistema não podem ser deletadas'
      });
    }

    // Buscar usuários com esta role antes de deletar
    const userRoles = await prisma.userRole.findMany({
      where: { roleId }
    });

    // Deletar role (cascade deleta rolePermissions e userRoles)
    await prisma.role.delete({
      where: { id: roleId }
    });

    // Limpar cache dos usuários afetados
    for (const userRole of userRoles) {
      clearUserPermissionCache(userRole.userId);
    }

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Role deletada com sucesso'
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao deletar role:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar role'
    });
  }
};

/**
 * Listar todas as permissões disponíveis
 */
exports.listPermissions = async (req, res) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { action: 'asc' }
      ]
    });

    // Agrupar por módulo
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {});

    await prisma.$disconnect();

    res.json({
      success: true,
      data: {
        all: permissions,
        grouped: groupedPermissions
      }
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar permissões'
    });
  }
};

/**
 * Atribuir role a um usuário
 */
exports.assignRoleToUser = async (req, res) => {
  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    return res.status(400).json({
      success: false,
      error: 'userId e roleId são obrigatórios'
    });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se role existe
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Role não encontrada'
      });
    }

    // Criar atribuição
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
        createdBy: req.user.id
      },
      include: {
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Limpar cache de permissões do usuário
    clearUserPermissionCache(userId);

    await prisma.$disconnect();

    res.status(201).json({
      success: true,
      data: userRole
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao atribuir role:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Usuário já possui esta role'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao atribuir role'
    });
  }
};

/**
 * Remover role de um usuário
 */
exports.removeRoleFromUser = async (req, res) => {
  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    return res.status(400).json({
      success: false,
      error: 'userId e roleId são obrigatórios'
    });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId
      }
    });

    if (!userRole) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Atribuição não encontrada'
      });
    }

    await prisma.userRole.delete({
      where: { id: userRole.id }
    });

    // Limpar cache de permissões do usuário
    clearUserPermissionCache(userId);

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Role removida do usuário com sucesso'
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao remover role:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover role'
    });
  }
};

/**
 * Listar roles de um usuário
 */
exports.getUserRoles = async (req, res) => {
  const { userId } = req.params;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      },
      orderBy: {
        role: {
          priority: 'desc'
        }
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: userRoles
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao buscar roles do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar roles do usuário'
    });
  }
};

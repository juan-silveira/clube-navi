/**
 * Controller de Grupos
 *
 * Gerencia grupos de usuários para operações em massa
 */

const { PrismaClient } = require('../generated/prisma-tenant');

/**
 * Listar todos os grupos
 */
exports.listGroups = async (req, res) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const groups = await prisma.group.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar grupos'
    });
  }
};

/**
 * Buscar detalhes de um grupo específico
 */
exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!group) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Grupo não encontrado'
      });
    }

    await prisma.$disconnect();

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar grupo'
    });
  }
};

/**
 * Criar novo grupo
 */
exports.createGroup = async (req, res) => {
  const { name, description, color, userIds } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Nome é obrigatório'
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
    // Criar grupo
    const group = await prisma.group.create({
      data: {
        name,
        description,
        color: color || '#3B82F6', // Azul padrão
        createdBy: req.user.id
      }
    });

    // Adicionar usuários ao grupo se fornecidos
    if (userIds && userIds.length > 0) {
      await prisma.groupUser.createMany({
        data: userIds.map(userId => ({
          groupId: group.id,
          userId,
          addedBy: req.user.id
        })),
        skipDuplicates: true
      });
    }

    // Buscar grupo completo com usuários
    const completeGroup = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        users: {
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
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    await prisma.$disconnect();

    res.status(201).json({
      success: true,
      data: completeGroup
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar grupo'
    });
  }
};

/**
 * Atualizar grupo
 */
exports.updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, description, color } = req.body;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Grupo não encontrado'
      });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        name,
        description,
        color
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar grupo'
    });
  }
};

/**
 * Deletar grupo
 */
exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Grupo não encontrado'
      });
    }

    // Deletar grupo (cascade deleta groupUsers)
    await prisma.group.delete({
      where: { id: groupId }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Grupo deletado com sucesso'
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao deletar grupo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar grupo'
    });
  }
};

/**
 * Adicionar usuários a um grupo
 */
exports.addUsersToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIds } = req.body;

  if (!userIds || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'userIds é obrigatório'
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
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Grupo não encontrado'
      });
    }

    // Adicionar usuários
    await prisma.groupUser.createMany({
      data: userIds.map(userId => ({
        groupId,
        userId,
        addedBy: req.user.id
      })),
      skipDuplicates: true
    });

    // Buscar grupo atualizado
    const updatedGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: {
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
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao adicionar usuários ao grupo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar usuários ao grupo'
    });
  }
};

/**
 * Remover usuários de um grupo
 */
exports.removeUsersFromGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIds } = req.body;

  if (!userIds || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'userIds é obrigatório'
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
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Grupo não encontrado'
      });
    }

    // Remover usuários
    await prisma.groupUser.deleteMany({
      where: {
        groupId,
        userId: {
          in: userIds
        }
      }
    });

    // Buscar grupo atualizado
    const updatedGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: {
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
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao remover usuários do grupo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover usuários do grupo'
    });
  }
};

/**
 * Listar grupos de um usuário
 */
exports.getUserGroups = async (req, res) => {
  const { userId } = req.params;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.clubeDatabaseUrl
      }
    }
  });

  try {
    const groupUsers = await prisma.groupUser.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: {
              select: {
                users: true
              }
            }
          }
        }
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: groupUsers.map(gu => gu.group)
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao buscar grupos do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar grupos do usuário'
    });
  }
};

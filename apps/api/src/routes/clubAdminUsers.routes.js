/**
 * Club Admin Users Routes
 * Gerenciar usuários do clube específico
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');

/**
 * GET /api/club-admin/users
 * Listar usuários do clube
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { page = 1, limit = 20, search, status, userType } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Filtrar por userType se fornecido
    if (userType) {
      // Usar raw query para contornar problema de enum do Prisma
      let whereClauses = [`user_type::text = '${userType}'`];

      if (status === 'active') {
        whereClauses.push('is_active = true');
      } else if (status === 'inactive') {
        whereClauses.push('is_active = false');
      }

      if (search) {
        const searchPattern = `%${search}%`;
        whereClauses.push(`(
          first_name ILIKE '${searchPattern}' OR
          last_name ILIKE '${searchPattern}' OR
          email ILIKE '${searchPattern}' OR
          phone LIKE '${searchPattern}'
        )`);
      }

      const whereClause = whereClauses.join(' AND ');

      console.log(`[DEBUG] WHERE clause: ${whereClause}`);
      console.log(`[DEBUG] userType value: ${userType}`);

      const usersRaw = await clubPrisma.$queryRawUnsafe(`
        SELECT
          id,
          first_name as "firstName",
          last_name as "lastName",
          email,
          cpf,
          phone,
          is_active as "isActive",
          email_confirmed as "emailConfirmed",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${take}
        OFFSET ${skip}
      `);

      const totalRaw = await clubPrisma.$queryRawUnsafe(`
        SELECT COUNT(*)::int as count
        FROM users
        WHERE ${whereClause}
      `);

      return res.json({
        success: true,
        data: usersRaw,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRaw[0].count,
          totalPages: Math.ceil(totalRaw[0].count / parseInt(limit))
        }
      });
    }

    // Buscar usuários (sem filtro de userType)
    const [users, total] = await Promise.all([
      clubPrisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          cpf: true,
          phone: true,
          isActive: true,
          emailConfirmed: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      clubPrisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] List error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/club-admin/users/stats
 * Estatísticas de usuários
 */
router.get('/stats', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;

    const [total, active, emailConfirmed] = await Promise.all([
      clubPrisma.user.count(),
      clubPrisma.user.count({ where: { isActive: true } }),
      clubPrisma.user.count({ where: { emailConfirmed: true } })
    ]);

    // Usuários dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await clubPrisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        emailConfirmed,
        emailNotConfirmed: total - emailConfirmed,
        newUsers
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/club-admin/users/:userId
 * Obter detalhes de um usuário específico
 */
router.get('/:userId', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { userId } = req.params;

    const user = await clubPrisma.user.findUnique({
      where: { id: userId },
      include: {
        balance: true,
        groups: {
          include: {
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/club-admin/users/:userId/status
 * Atualizar status do usuário (ativar/desativar)
 */
router.patch('/:userId/status', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean'
      });
    }

    const user = await clubPrisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/club-admin/users
 * Criar novo usuário
 */
router.post('/', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { name, email, cpf, phone, type = 'consumer', isActive = true } = req.body;

    // Validações
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Verificar se email já existe
    const existingUser = await clubPrisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Criar usuário
    const user = await clubPrisma.user.create({
      data: {
        name,
        email,
        cpf: cpf || null,
        phone: phone || null,
        type,
        userType: type, // Compatibilidade
        isActive,
        emailConfirmed: false,
        password: '', // Será definida pelo usuário no primeiro acesso
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Create error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/club-admin/users/:userId
 * Atualizar usuário
 */
router.put('/:userId', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { userId } = req.params;
    const { name, email, cpf, phone, type, isActive } = req.body;

    // Verificar se usuário existe
    const existingUser = await clubPrisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Se email foi alterado, verificar se já existe
    if (email && email !== existingUser.email) {
      const emailExists = await clubPrisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Atualizar usuário
    const updatedUser = await clubPrisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(cpf !== undefined && { cpf }),
        ...(phone !== undefined && { phone }),
        ...(type !== undefined && { type, userType: type }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/club-admin/users/:userId
 * Deletar usuário
 */
router.delete('/:userId', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { userId } = req.params;

    // Verificar se usuário existe
    const existingUser = await clubPrisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Deletar usuário
    await clubPrisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ [Club Admin Users] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

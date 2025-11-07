/**
 * Middleware de Verificação de Permissões
 *
 * Este middleware verifica se o usuário tem permissão para acessar um recurso.
 * Deve ser usado após o middleware authenticateJWT.
 *
 * Uso:
 *   router.get('/users', authenticateJWT, checkPermission('users.read'), userController.list);
 *   router.post('/users', authenticateJWT, checkPermission('users.create'), userController.create);
 */

const { PrismaClient } = require('../generated/prisma-tenant');

// Cache de permissões por usuário (expira após 5 minutos)
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Limpa o cache de permissões de um usuário
 * Útil quando as permissões de um usuário são alteradas
 */
function clearUserPermissionCache(userId) {
  permissionCache.delete(userId);
}

/**
 * Busca todas as permissões de um usuário no banco
 */
async function getUserPermissions(userId, tenantDatabaseUrl) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: tenantDatabaseUrl
      }
    }
  });

  try {
    // Buscar todas as roles do usuário com suas permissões
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
      }
    });

    // Extrair todas as permissões únicas
    const permissions = new Set();
    let highestPriority = 0;
    let isSuperAdmin = false;

    for (const userRole of userRoles) {
      const role = userRole.role;

      // Verificar se é Super Admin (prioridade 100)
      if (role.priority >= 100) {
        isSuperAdmin = true;
      }

      // Rastrear a maior prioridade
      if (role.priority > highestPriority) {
        highestPriority = role.priority;
      }

      // Adicionar todas as permissões da role
      for (const rolePermission of role.permissions) {
        permissions.add(rolePermission.permission.resource);
      }
    }

    await prisma.$disconnect();

    return {
      permissions: Array.from(permissions),
      highestPriority,
      isSuperAdmin
    };
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
async function userHasPermission(userId, requiredPermission, tenantDatabaseUrl) {
  // Verificar cache
  const cacheKey = `${userId}-${tenantDatabaseUrl}`;
  const cached = permissionCache.get(cacheKey);

  let userPermissions;

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    // Usar permissões do cache
    userPermissions = cached.data;
  } else {
    // Buscar permissões do banco
    userPermissions = await getUserPermissions(userId, tenantDatabaseUrl);

    // Armazenar no cache
    permissionCache.set(cacheKey, {
      data: userPermissions,
      timestamp: Date.now()
    });
  }

  // Super Admin tem acesso a tudo
  if (userPermissions.isSuperAdmin) {
    return true;
  }

  // Verificar se tem a permissão específica
  if (userPermissions.permissions.includes(requiredPermission)) {
    return true;
  }

  // Verificar permissões wildcard (ex: users.*)
  const [module, action] = requiredPermission.split('.');
  const wildcardPermission = `${module}.*`;

  if (userPermissions.permissions.includes(wildcardPermission)) {
    return true;
  }

  return false;
}

/**
 * Middleware que verifica se o usuário tem a permissão necessária
 *
 * @param {string} requiredPermission - A permissão necessária (ex: 'users.read', 'products.create')
 * @returns {Function} Middleware do Express
 */
function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Verificar se temos o tenantDatabaseUrl
      if (!req.tenantDatabaseUrl) {
        return res.status(500).json({
          success: false,
          error: 'Tenant não identificado'
        });
      }

      const userId = req.user.id;
      const tenantDatabaseUrl = req.tenantDatabaseUrl;

      // Verificar permissão
      const hasPermission = await userHasPermission(userId, requiredPermission, tenantDatabaseUrl);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para acessar este recurso',
          requiredPermission
        });
      }

      // Permissão concedida, continuar
      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
}

/**
 * Middleware que verifica se o usuário tem QUALQUER UMA das permissões da lista
 * Útil para rotas que podem ser acessadas por múltiplas permissões
 *
 * @param {string[]} permissions - Array de permissões (ex: ['users.read', 'users.update'])
 * @returns {Function} Middleware do Express
 */
function checkAnyPermission(permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      if (!req.tenantDatabaseUrl) {
        return res.status(500).json({
          success: false,
          error: 'Tenant não identificado'
        });
      }

      const userId = req.user.id;
      const tenantDatabaseUrl = req.tenantDatabaseUrl;

      // Verificar se tem qualquer uma das permissões
      for (const permission of permissions) {
        const hasPermission = await userHasPermission(userId, permission, tenantDatabaseUrl);
        if (hasPermission) {
          next();
          return;
        }
      }

      // Nenhuma permissão encontrada
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para acessar este recurso',
        requiredPermissions: permissions
      });
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
}

/**
 * Middleware que verifica se o usuário tem TODAS as permissões da lista
 * Útil para rotas que exigem múltiplas permissões
 *
 * @param {string[]} permissions - Array de permissões
 * @returns {Function} Middleware do Express
 */
function checkAllPermissions(permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      if (!req.tenantDatabaseUrl) {
        return res.status(500).json({
          success: false,
          error: 'Tenant não identificado'
        });
      }

      const userId = req.user.id;
      const tenantDatabaseUrl = req.tenantDatabaseUrl;

      // Verificar todas as permissões
      for (const permission of permissions) {
        const hasPermission = await userHasPermission(userId, permission, tenantDatabaseUrl);
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Você não tem permissão para acessar este recurso',
            requiredPermissions: permissions,
            missingPermission: permission
          });
        }
      }

      // Todas as permissões encontradas
      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
}

/**
 * Função auxiliar para buscar as permissões de um usuário
 * Útil para retornar as permissões no login ou em endpoints específicos
 */
async function getUserPermissionsForResponse(userId, tenantDatabaseUrl) {
  const cacheKey = `${userId}-${tenantDatabaseUrl}`;
  const cached = permissionCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const userPermissions = await getUserPermissions(userId, tenantDatabaseUrl);

  permissionCache.set(cacheKey, {
    data: userPermissions,
    timestamp: Date.now()
  });

  return userPermissions;
}

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  clearUserPermissionCache,
  getUserPermissionsForResponse
};

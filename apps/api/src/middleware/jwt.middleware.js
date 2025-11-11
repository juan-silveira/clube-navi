const jwt = require('jsonwebtoken');
const prismaConfig = require('../config/prisma');
const redisService = require('../services/redis.service');
const userCompanyService = require('../services/userCompany.service');

// Função helper para obter Prisma
const getPrisma = () => prismaConfig.getPrisma();

// JWT Secret com fallback (deve ser o mesmo que jwt.service.js)
const JWT_SECRET = process.env.JWT_SECRET || 'azore-jwt-secret-key-change-in-production';

// Cache em memória para evitar validações repetidas - SOLUÇÃO PRINCIPAL PARA EXCESSIVE CALLS
const tokenCache = new Map();
const CACHE_DURATION = 30000; // 30 segundos - tempo para reutilizar validação
const MAX_CACHE_SIZE = 1000; // Máximo de tokens em cache
const CLEANUP_INTERVAL = 60000; // Limpar cache a cada 60 segundos

// Limpar cache periodicamente (menos agressivo que validações)
const cacheCleanupInterval = setInterval(() => {
  const now = Date.now();
  let removedCount = 0;
  
  for (const [token, data] of tokenCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      tokenCache.delete(token);
      removedCount++;
    }
  }
  
  // Limitar tamanho do cache - remover os mais antigos
  if (tokenCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(tokenCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Ordenar por timestamp
    const toDelete = entries.slice(0, tokenCache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([token]) => tokenCache.delete(token));
  }
  
  if (removedCount > 0 || tokenCache.size > MAX_CACHE_SIZE) {
    console.log(`🧹 [JWT-Cache] Limpeza: ${removedCount} tokens expirados removidos, ${tokenCache.size} tokens restantes`);
  }
}, CLEANUP_INTERVAL);

// Graceful shutdown - limpar interval quando processo terminar
process.on('exit', () => {
  if (cacheCleanupInterval) clearInterval(cacheCleanupInterval);
});
process.on('SIGINT', () => {
  if (cacheCleanupInterval) clearInterval(cacheCleanupInterval);
  process.exit(0);
});
process.on('SIGTERM', () => {
  if (cacheCleanupInterval) clearInterval(cacheCleanupInterval);
  process.exit(0);
});

/**
 * Middleware para autenticação JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    // console.log('🔑 JWT Middleware - Iniciando autenticação...');
    // console.log('🔍 JWT Middleware VERSION CHECK - Código atualizado com debugging!');
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // console.log('❌ JWT Middleware - Token não fornecido ou formato inválido');
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
    }

    const token = authHeader.substring(7);
    
    // 🚀 CACHE CHECK PRIMEIRO - EVITA CONSULTAS REPETIDAS
    const cachedData = tokenCache.get(token);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      // console.log(`🔄 [JWT-Cache] Token ${token.substring(0,10)}... reutilizado (usuário: ${cachedData.user.name})`);
      req.user = cachedData.user;
      req.company = cachedData.company; // Inclui dados da empresa no cache
      return next();
    }
    
    // Se passou do cache, significa que vai fazer validação completa
    // console.log(`🔍 JWT Middleware - Validação completa necessária para token ${token.substring(0,10)}...`);
    
    // Verificar se o token está na blacklist (opcional, se Redis disponível)
    try {
      if (redisService && redisService.isConnected) {
        const isBlacklisted = await redisService.isBlacklisted(token);
        
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado'
          });
        }
      }
    } catch (redisError) {
      console.warn('⚠️ Redis não disponível para verificação de blacklist:', redisError.message);
      // Continuar sem verificação de blacklist se Redis não estiver disponível
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;

    // Check if this is a Super Admin token
    if (decoded.type === 'super-admin') {
      console.log('🔍 JWT Middleware - Autenticando Super Admin');

      // Get Master Prisma Client
      const masterClient = require('../database/master-client');
      const masterPrisma = masterClient.getMasterClient();

      const admin = await masterPrisma.superAdmin.findUnique({
        where: { id: decoded.adminId }
      });

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Super Admin não encontrado ou inativo'
        });
      }

      // Create a user-like object for compatibility
      user = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
        isSuperAdmin: true,
        isAdmin: true,
        isApiAdmin: true,
        permissions: admin.permissions || {},
        type: 'super-admin',
        roles: ['super-admin']
      };

      req.superAdmin = decoded; // Keep decoded token data
    } else if (decoded.type === 'club-admin') {
      // Club Admin authentication - usar decoded.userId e req.clubPrisma
      console.log('🔍 JWT Middleware - Autenticando Club Admin');

      if (!req.clubPrisma) {
        console.log('⚠️ JWT Middleware - clubPrisma não disponível para club-admin');
        return res.status(401).json({
          success: false,
          message: 'Contexto de clube não disponível'
        });
      }

      user = await req.clubPrisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Club Admin não encontrado ou inativo'
        });
      }

      if (user.userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'User is not a club admin'
        });
      }

      // Add club admin flags
      user.isClubAdmin = true;
      user.isAdmin = true;
      user.type = 'club-admin';
      user.roles = ['club-admin'];
    } else {
      // Regular user authentication - use tenant database
      console.log('🔍 JWT Middleware - Autenticando usuário do clube');

      // MULTI-TENANT: Usar req.clubPrisma se disponível (rotas clube), senão usar master
      let prisma;
      if (req.clubPrisma) {
        console.log('🔍 JWT Middleware - Usando Clube Prisma Client');
        prisma = req.clubPrisma;
      } else {
        console.log('⚠️ JWT Middleware - clubPrisma não disponível, usuário requer contexto de clube');
        return res.status(401).json({
          success: false,
          message: 'Contexto de clube não disponível'
        });
      }

      user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado ou inativo'
        });
      }

      // Verificar roles do usuário
      const userRoles = []; // TODO: Implementar sistema de roles sem companies

      // Helpers de verificação de permissão
      user.isAdmin = false; // TODO: Implementar sistema de roles
      user.isApiAdmin = false;
      user.isSuperAdmin = false;
      user.roles = userRoles;
    }

    req.user = user;

    // 💾 SALVAR NO CACHE TODOS OS DADOS (user + company) - EVITA PRÓXIMAS VALIDAÇÕES
    tokenCache.set(token, {
      user: user,
      company: req.company || null, // Incluir dados da empresa no cache
      timestamp: Date.now()
    });

    // console.log(`✅ [JWT-Cache] Usuário ${user.name} autenticado e salvo no cache (empresa: ${req.company?.name || 'N/A'})`);
    next();
    
  } catch (error) {
    console.error('❌ JWT Middleware - Erro na verificação:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    } else {
      console.error('❌ Erro na verificação do token:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

/**
 * Middleware opcional para autenticação JWT (não falha se não houver token)
 */
const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continua sem usuário
    }

    const token = authHeader.substring(7);

    // Verificar se o token está na blacklist (opcional, se Redis disponível)
    try {
      if (redisService && redisService.isConnected) {
        const isBlacklisted = await redisService.isBlacklisted(token);
        if (isBlacklisted) {
          return next(); // Continua sem usuário
        }
      }
    } catch (redisError) {
      // Ignora erro do Redis no middleware opcional
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;

    // Check if this is a Super Admin token
    if (decoded.type === 'super-admin') {
      // Get Master Prisma Client
      const masterClient = require('../database/master-client');
      const masterPrisma = masterClient.getMasterClient();

      const admin = await masterPrisma.superAdmin.findUnique({
        where: { id: decoded.adminId }
      });

      if (admin && admin.isActive) {
        // Create a user-like object for compatibility
        user = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          isActive: admin.isActive,
          isSuperAdmin: true,
          isAdmin: true,
          isApiAdmin: true,
          permissions: admin.permissions || {},
          type: 'super-admin',
          roles: ['super-admin']
        };

        req.superAdmin = decoded;
        req.user = user;
      }
    } else {
      // Regular user authentication - try to use tenant database
      if (req.clubPrisma) {
        const prisma = req.clubPrisma;

        user = await prisma.user.findUnique({
          where: { id: decoded.id }
        });

        if (user && user.isActive) {
          // Verificar roles do usuário
          const userRoles = []; // TODO: Implementar sistema de roles
          const hasAdminRole = false; // TODO: Implementar sistema de roles
          user.isApiAdmin = hasAdminRole;
          user.isSuperAdmin = false;
          user.roles = userRoles;

          req.user = user;
        }
      }
    }

    next();

  } catch (error) {
    // Em caso de erro, continua sem usuário
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateJWT: authenticateToken, // Alias para manter compatibilidade
  optionalJWT
};
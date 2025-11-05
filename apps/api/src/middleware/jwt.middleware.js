const jwt = require('jsonwebtoken');
const prismaConfig = require('../config/prisma');
const redisService = require('../services/redis.service');
const userCompanyService = require('../services/userCompany.service');

// Função helper para obter Prisma
const getPrisma = () => prismaConfig.getPrisma();

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário completo no banco com dados da empresa
    let prisma;
    try {
      prisma = getPrisma();
    } catch (error) {
      // Se Prisma não foi inicializado, inicializar primeiro
      await prismaConfig.initialize();
      prisma = getPrisma();
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
      // FUNCIONALIDADE REMOVIDA: userCompanies
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // FUNCIONALIDADE REMOVIDA: Seleção de empresa (userCompanies removido do schema)
    // if (user.userCompanies && user.userCompanies.length > 0) {
    //   const activeCompanies = user.userCompanies.filter(uc => uc.status === 'active' && uc.company.isActive);
    //   ...
    // }
    
    // Verificar roles do usuário (sem userCompanies - removido do schema)
    const userRoles = []; // TODO: Implementar sistema de roles sem companies

    // Helpers de verificação de permissão
    user.isAdmin = false; // TODO: Implementar sistema de roles
    user.isApiAdmin = false;
    user.isSuperAdmin = false;
    user.roles = userRoles;

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco usando Prisma
    let prisma;
    try {
      prisma = getPrisma();
    } catch (error) {
      // Se Prisma não foi inicializado, inicializar primeiro
      await prismaConfig.initialize();
      prisma = getPrisma();
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
      // FUNCIONALIDADE REMOVIDA: userCompanies
    });

    if (user && user.isActive) {
      // FUNCIONALIDADE REMOVIDA: Dados da empresa (userCompanies removido do schema)
      // if (user.userCompanies && user.userCompanies.length > 0) {
      //   ...
      // }

      // FUNCIONALIDADE REMOVIDA: Verificação de roles (userCompanies removido do schema)
      const hasAdminRole = false; // TODO: Implementar sistema de roles
      user.isApiAdmin = hasAdminRole;
      
      req.user = user;
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
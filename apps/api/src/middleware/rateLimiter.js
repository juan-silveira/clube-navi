const rateLimit = require('express-rate-limit');
const prismaConfig = require('../config/prisma');

// Cache in-memory para rate limiting baseado no plano
const userPlanCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configurações de rate limiting por plano
const RATE_LIMITS = {
  PREMIUM: {
    windowMs: 1 * 60 * 1000, // 1 minuto  
    max: 120, // 120 requests por minuto
    message: 'Muitas requisições - limite premium excedido'
  },
  PRO: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto  
    message: 'Muitas requisições - limite pro excedido'
  },
  BASIC: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // 30 requests por minuto
    message: 'Muitas requisições - limite básico excedido'
  }
};

// Função para obter plano do usuário com cache
async function getUserPlan(userId) {
  // Verificar cache primeiro
  const cached = userPlanCache.get(userId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.plan;
  }

  try {
    const prisma = prismaConfig.getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userPlan: true }
    });

    const plan = user?.userPlan || 'BASIC';
    
    // Salvar no cache
    userPlanCache.set(userId, {
      plan,
      timestamp: Date.now()
    });

    return plan;
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    return 'BASIC'; // Fallback para plano básico
  }
}

// Middleware de rate limiting dinâmico baseado no plano
const createUserPlanRateLimit = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Se não há usuário autenticado, usar limite padrão
      if (!req.user?.id) {
        return rateLimit({
          windowMs: 1 * 60 * 1000,
          max: 20, // Limite muito baixo para não autenticados
          message: { success: false, message: 'Rate limit excedido - usuário não autenticado' }
        })(req, res, next);
      }

      const userPlan = await getUserPlan(req.user.id);
      const limits = RATE_LIMITS[userPlan] || RATE_LIMITS.BASIC;

      // Aplicar configurações específicas se passadas nas opções
      const finalLimits = {
        ...limits,
        ...options,
        keyGenerator: (req) => `${req.user.id}_${userPlan}`,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            success: false,
            message: limits.message,
            retryAfter: Math.ceil(limits.windowMs / 1000),
            userPlan,
            limit: limits.max
          });
        }
      };

      // Criar rate limiter dinâmico
      const limiter = rateLimit(finalLimits);
      return limiter(req, res, next);

    } catch (error) {
      console.error('Erro no middleware de rate limiting:', error);
      // Em caso de erro, permitir requisição mas logar
      next();
    }
  };
};

// Rate limiters específicos para diferentes endpoints
const notificationRateLimit = createUserPlanRateLimit({
  // Notificações têm limite mais relaxado
  max: (req) => RATE_LIMITS[req.userPlan || 'BASIC'].max * 2
});

const balanceSyncRateLimit = createUserPlanRateLimit({
  // Balance sync tem limite mais restrito
  max: (req) => Math.ceil(RATE_LIMITS[req.userPlan || 'BASIC'].max / 2)
});

const generalRateLimit = createUserPlanRateLimit();

module.exports = {
  createUserPlanRateLimit,
  notificationRateLimit,
  balanceSyncRateLimit, 
  generalRateLimit,
  getUserPlan
};
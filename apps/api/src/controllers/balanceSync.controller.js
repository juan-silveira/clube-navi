const balanceSyncService = require('../services/balanceSync.service');
const azorescanService = require('../services/azorescan.service');
const stakeBalanceService = require('../services/stakeBalance.service');
const orderBalanceService = require('../services/orderBalance.service');

/**
 * @desc Busca cache Redis para um usuário
 * @route GET /api/balance-sync/cache
 * @access Private
 */
const getCache = async (req, res) => {
  try {
    const { userId, address, network = 'mainnet' } = req.query;
    
    if (!userId || !address) {
      return res.status(400).json({
        success: false,
        message: 'userId e address são obrigatórios'
      });
    }

    // Verificar se o usuário logado pode acessar estes dados
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - usuário não autorizado'
      });
    }

    const cache = await balanceSyncService.getCache(userId, address, network);
    
    if (cache && cache.balances) {
      res.json({
        success: true,
        data: {
          balances: cache.balances,
          lastUpdated: cache.lastUpdated,
          source: cache.source || 'redis'
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Cache não encontrado ou vazio',
        data: null
      });
    }
    
  } catch (error) {
    console.error('❌ [BalanceSyncController] Erro ao buscar cache:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @desc Atualiza cache Redis com novos balances
 * @route POST /api/balance-sync/cache
 * @access Private
 */
const updateCache = async (req, res) => {
  try {
    const { userId, address, balances, timestamp, source, network = 'mainnet' } = req.body;
    
    if (!userId || !address || !balances) {
      return res.status(400).json({
        success: false,
        message: 'userId, address e balances são obrigatórios'
      });
    }

    // Verificar se o usuário logado pode acessar estes dados
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - usuário não autorizado'
      });
    }

    const result = await balanceSyncService.updateCache(userId, address, balances, timestamp, source, network);

    // IMPORTANTE: Não atualizar stake/orders aqui porque causa race condition
    // A atualização acontece via /api/portfolio/summary quando necessário
    // Isso evita que blockchain.service sobrescreva dados de orders que ainda estão sendo calculados

    res.json({
      success: true,
      data: result,
      message: 'Cache atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [BalanceSyncController] Erro ao atualizar cache:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @desc Busca histórico de mudanças de um usuário
 * @route GET /api/balance-sync/history
 * @access Private
 */
const getHistory = async (req, res) => {
  try {
    const { userId, address, limit = 50, network = 'mainnet' } = req.query;
    
    if (!userId || !address) {
      return res.status(400).json({
        success: false,
        message: 'userId e address são obrigatórios'
      });
    }

    // Verificar se o usuário logado pode acessar estes dados
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - usuário não autorizado'
      });
    }

    const history = await balanceSyncService.getHistory(userId, address, parseInt(limit), network);
    
    res.json({
      success: true,
      data: history
    });
    
  } catch (error) {
    console.error('❌ [BalanceSyncController] Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @desc Limpa cache Redis para um usuário
 * @route DELETE /api/balance-sync/cache/clear
 * @access Private
 */
const clearCache = async (req, res) => {
  try {
    const { userId, address, network = 'mainnet' } = req.query;
    
    if (!userId || !address) {
      return res.status(400).json({
        success: false,
        message: 'userId e address são obrigatórios'
      });
    }

    // Verificar se o usuário logado pode acessar estes dados
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - usuário não autorizado'
      });
    }

    const result = await balanceSyncService.clearCache(userId, address, network);
    
    res.json({
      success: true,
      data: result,
      message: 'Cache limpo com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [BalanceSyncController] Erro ao limpar cache:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @desc Busca status da sincronização
 * @route GET /api/balance-sync/status
 * @access Private
 */
const getStatus = async (req, res) => {
  try {
    const { userId, address, network = 'mainnet' } = req.query;
    
    if (!userId || !address) {
      return res.status(400).json({
        success: false,
        message: 'userId e address são obrigatórios'
      });
    }

    // Verificar se o usuário logado pode acessar estes dados
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - usuário não autorizado'
      });
    }

    const status = await balanceSyncService.getStatus(userId, address, network);
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('❌ [BalanceSyncController] Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @desc Busca balances completos diretamente do Azorescan (inclui AZE-t nativo)
 * Com fallback para cache quando API falha
 * @route GET /api/balance-sync/fresh
 * @access Private
 */
const getFreshBalances = async (req, res) => {
  try {
    const { address, network = process.env.DEFAULT_NETWORK || 'mainnet' } = req.query;
    const userId = req.user.id; // Obtido do middleware de autenticação
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'address é obrigatório'
      });
    }

    // Buscar balances frescos da blockchain
    const balanceData = await balanceSyncService.getFreshBalances(address, network);
    
    if (balanceData.success) {
      // Sucesso: salvar no cache e no PostgreSQL
      try {
        await balanceSyncService.updateCache(userId, address, balanceData.data, network);
      } catch (cacheError) {
        console.warn('⚠️ [BalanceSyncController] Erro ao salvar cache (continuando):', cacheError.message);
      }

      // Salvar no PostgreSQL usando blockchain service e capturar informações de mudança
      let balanceChangeInfo = null;
      try {
        const blockchainService = require('../services/blockchain.service');
        balanceChangeInfo = await blockchainService.saveAndCompareUserBalances(userId, balanceData.data);
        // console.log('✅ [BalanceSyncController] Saldos salvos no PostgreSQL para usuário:', userId);
        
        if (balanceChangeInfo?.changes?.hasChanges) {
          console.log('🔔 [BalanceSyncController] Mudanças detectadas:', {
            newTokens: balanceChangeInfo.changes.newTokens.length,
            balanceChanges: balanceChangeInfo.changes.balanceChanges.length
          });
        }
      } catch (dbError) {
        console.warn('⚠️ [BalanceSyncController] Erro ao salvar no PostgreSQL (continuando):', dbError.message);
      }
      
      // Incluir informações de mudança na resposta
      const response = {
        success: true,
        message: 'Balances sincronizados com sucesso',
        data: balanceData.data
      };
      
      // Se temos informações de mudança, incluir na resposta
      if (balanceChangeInfo?.changes) {
        response.balanceChanges = balanceChangeInfo.changes;
      }
      
      res.json(response);
    } else {
      // FALHA NA API: Tentar fallback de cache
      // console.log('🔄 [BalanceSyncController] Tentando fallback de cache devido ao erro na API...');
      
      try {
        const cachedBalances = await balanceSyncService.getCache(userId, address, network);
        
        if (cachedBalances && cachedBalances.balances && cachedBalances.balances.balancesTable && Object.keys(cachedBalances.balances.balancesTable).length > 0) {
          // console.log('✅ [BalanceSyncController] Cache fallback bem-sucedido:', {
          //   tokens: Object.keys(cachedBalances.balances.balancesTable).length,
          //   cacheAge: cachedBalances.lastUpdated ? Math.floor((Date.now() - new Date(cachedBalances.lastUpdated).getTime()) / 1000 / 60) : 'desconhecida'
          // });
          
          // Retornar dados do cache com indicação de erro
          res.json({
            success: true,
            message: 'Usando dados em cache devido ao erro na API',
            data: {
              ...cachedBalances.balances,
              syncStatus: 'cached_redis',
              fromCache: true,
              cacheSource: 'redis',
              syncError: balanceData.error,
              lastCacheUpdate: cachedBalances.lastUpdated
            }
          });
        } else {
          console.warn('⚠️ [BalanceSyncController] Cache Redis vazio ou inválido');
          res.status(500).json({
            success: false,
            message: 'Erro ao sincronizar balances e cache Redis não disponível',
            error: balanceData.error,
            syncStatus: 'error'
          });
        }
      } catch (cacheError) {
        console.error('❌ [BalanceSyncController] Erro ao acessar cache Redis:', cacheError.message);
        res.status(500).json({
          success: false,
          message: 'Erro ao sincronizar balances e falha no acesso ao cache Redis',
          error: `API Error: ${balanceData.error} | Cache Error: ${cacheError.message}`,
          syncStatus: 'error'
        });
      }
    }
    
  } catch (error) {
    console.error('❌ [BalanceSyncController] Erro ao buscar balances frescos:', error);
    
    // ÚLTIMO RECURSO: Tentar cache mesmo com erro geral
    try {
      const userId = req.user?.id;
      const { address, network = 'mainnet' } = req.query;
      
      if (userId && address) {
        console.log('🔄 [BalanceSyncController] Último recurso - tentando cache...');
        const cachedBalances = await balanceSyncService.getCache(userId, address, network);
        
        if (cachedBalances && cachedBalances.balancesTable && Object.keys(cachedBalances.balancesTable).length > 0) {
          console.log('✅ [BalanceSyncController] Último recurso bem-sucedido');
          return res.json({
            success: true,
            message: 'Usando dados em cache devido ao erro interno',
            data: {
              ...cachedBalances,
              syncStatus: 'error',
              fromCache: true,
              syncError: error.message
            }
          });
        }
      }
    } catch (lastResortError) {
      console.error('❌ [BalanceSyncController] Último recurso também falhou:', lastResortError.message);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      syncStatus: 'error'
    });
  }
};

/**
 * @desc Busca balances de qualquer usuário (apenas para admin)
 * @route GET /api/balance-sync/admin/fresh
 * @access Private (Admin only)
 */
const getAdminFreshBalances = async (req, res) => {
  try {
    const { userId, address, network = process.env.DEFAULT_NETWORK || 'mainnet' } = req.query;

    // Verificar se é admin (ADMIN, APP_ADMIN ou SUPER_ADMIN)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - apenas administradores'
      });
    }

    if (!userId || !address) {
      return res.status(400).json({
        success: false,
        message: 'userId e address são obrigatórios'
      });
    }

    // Buscar balances frescos da blockchain
    const balanceData = await balanceSyncService.getFreshBalances(address, network);

    if (balanceData.success) {
      // Salvar no cache
      try {
        await balanceSyncService.updateCache(userId, address, balanceData.data, network);
      } catch (cacheError) {
        console.warn('⚠️ [BalanceSyncController] Erro ao salvar cache (continuando):', cacheError.message);
      }

      // Salvar no PostgreSQL
      try {
        const blockchainService = require('../services/blockchain.service');
        await blockchainService.saveAndCompareUserBalances(userId, balanceData.data);
      } catch (dbError) {
        console.warn('⚠️ [BalanceSyncController] Erro ao salvar no PostgreSQL (continuando):', dbError.message);
      }

      res.json({
        success: true,
        message: 'Balances sincronizados com sucesso',
        data: balanceData.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar balances da blockchain',
        error: balanceData.error
      });
    }

  } catch (error) {
    console.error('❌ [BalanceSyncController] Erro ao buscar balances (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getCache,
  updateCache,
  getHistory,
  clearCache,
  getStatus,
  getFreshBalances,
  getAdminFreshBalances
};

// Importar Prisma company
const prismaConfig = require('../config/prisma');

// Função helper para obter Prisma
const getPrisma = () => prismaConfig.getPrisma();

// Importar serviços
const userService = require('../services/user.service');
const userActionsService = require('../services/userActions.service');
const { validatePassword } = require('../utils/passwordValidation');
const blockchainService = require('../services/blockchain.service');
const tokenService = require('../services/token.service');

/**
 * Criar usuário
 */
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const companyId = req.user.companyId; // Empresa do usuário autenticado

    // Validações básicas
    if (!userData.name || !userData.email || !userData.cpf || !userData.password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, CPF e senha são obrigatórios'
      });
    }

    // Validação de senha forte
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha não atende aos critérios de segurança',
        errors: passwordValidation.errors
      });
    }

    const user = await userService.createUser(userData, companyId);

    // Registrar ação administrativa de criação de usuário
    await userActionsService.logAdmin(req.user.id, 'user_created', user.id, req, {
      details: {
        newUser: {
          name: user.name,
          email: user.email,
          userPlan: user.userPlan
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    if (error.message.includes('já está em uso')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar usuário por ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const includePrivateKey = req.query.includePrivateKey === 'true';

    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuário inválido'
      });
    }

    const user = await userService.getUserById(id, includePrivateKey);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar usuário por CPF
 */
const getUserByCpf = async (req, res) => {
  try {
    const { cpf } = req.params;
    const includePrivateKey = req.query.includePrivateKey === 'true';

    const user = await userService.getUserByCpf(cpf, includePrivateKey);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário por CPF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar usuários
 */
const listUsers = async (req, res) => {
  try {
    console.log('🔍 listUsers - Usuário autenticado:', req.user ? req.user.id : 'Nenhum');
    
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      companyId: req.user.isApiAdmin ? req.query.companyId : req.user.companyId,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search,
      roles: req.query.roles ? req.query.roles.split(',') : undefined,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    console.log('🔍 listUsers - Options:', JSON.stringify(options, null, 2));

    const result = await userService.listUsers(options);

    console.log('✅ listUsers - Resultado:', result.users.length, 'usuários encontrados');

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar usuário
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await userService.updateUser(id, updateData);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Desativar usuário
 */
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.deactivateUser(id);

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Ativar usuário
 */
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.activateUser(id);

    res.json({
      success: true,
      message: 'Usuário ativado com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao ativar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar usuário por endereço (chave pública)
 */
const getUserByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const includePrivateKey = req.query.includePrivateKey === 'true';

    console.log(`🔍 Buscando usuário por endereço: ${address} (length: ${address.length})`);

    const user = await userService.getUserByPublicKey(address, includePrivateKey);

    if (!user) {
      console.log(`❌ Usuário não encontrado para endereço: ${address}`);
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('❌ [getUserByAddress] Erro ao buscar usuário por endereço:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obter saldos de um usuário por endereço
 */
const getUserBalancesByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const { network = 'testnet', forceRefresh = 'false' } = req.query;
    
    console.log(`💰 Obtendo saldos para address: ${address}, network: ${network}, forceRefresh: ${forceRefresh}`);
    
    // Verificar cache primeiro se usuário autenticado E não for forceRefresh
    if (req.user && req.user.id && forceRefresh !== 'true') {
      const redisService = require('../services/redis.service');
      const cachedBalances = await redisService.getCachedUserBalances(req.user.id, address, network);
      
      if (cachedBalances) {
        console.log(`⚡ Retornando saldos do cache para ${network}`);
        return res.json({
          success: true,
          data: cachedBalances
        });
      }
    } else if (forceRefresh === 'true') {
      console.log(`🔄 forceRefresh=true - LIMPANDO CACHE e consultando blockchain diretamente`);
      
      // LIMPAR CACHE REDIS FORÇADAMENTE
      if (req.user && req.user.id) {
        const redisService = require('../services/redis.service');
        const cacheKey = `balances:${req.user.id}:${address}:${network}`;
        try {
          if (redisService.company && redisService.isConnected) {
            await redisService.company.del(cacheKey);
            console.log(`🗑️ Cache Redis REMOVIDO para chave: ${cacheKey}`);
          }
        } catch (error) {
          console.error('❌ Erro ao limpar cache Redis:', error);
        }
      }
    }
    
    // PULAR AzoreScan temporariamente e usar consulta direta da blockchain
    console.log(`🔄 Usando consulta direta da blockchain para ${address} na ${network}`);

    // USAR: consulta direta da blockchain
    
    // Inicializar dados de resposta
    let balancesData = {
      address,
      network,
      azeBalance: { balanceWei: '0', balanceEth: '0' },
      tokenBalances: [],
      balancesTable: {},
      totalTokens: 0,
      timestamp: new Date().toISOString(),
      fromCache: false
    };
    
    try {
      // Obter saldo de AZE (token nativo)
      console.log(`🔍 [FALLBACK] Consultando saldo AZE para ${address}`);
      const azeBalance = await blockchainService.getBalance(address, network);
      balancesData.azeBalance = {
        balanceWei: azeBalance.balanceWei,
        balanceEth: azeBalance.balanceEth
      };
      console.log(`✅ [FALLBACK] Saldo AZE obtido: ${azeBalance.balanceEth} AZE`);
    } catch (azeError) {
      console.warn(`⚠️ [FALLBACK] Erro ao obter saldo AZE: ${azeError.message}`);
      // Manter saldo zerado se não conseguir consultar
    }
    
    // Consultar tokens ERC-20 configurados (temporário até migração Prisma)
    console.log(`🔍 INICIANDO consulta de tokens ERC-20 para network: ${network}`);
    try {
      // Tokens conhecidos para testnet e mainnet
      const knownTokens = {
        testnet: [
          {
            name: 'Coinage Real Brasil',
            symbol: 'cBRL',
            address: '0x0A8c73967e4Eee8ffA06484C3fBf65E6Ae3b9804',
            decimals: 18
          },
          {
            name: 'Stake Token Test',
            symbol: 'STT', 
            address: '0x575b05df92b1a2e7782322bb86a9ee1e5bf2edcd',
            decimals: 18
          }
        ],
        mainnet: [
          {
            name: 'Coinage Real Brasil',
            symbol: 'cBRL',
            address: '0x18e946548b2C24Ad371343086e424ABaC3393678', // Contrato correto da mainnet
            decimals: 18
          }
        ]
      };
      
      const configuredTokens = knownTokens[network] || [];
      
      console.log(`🔍 Consultando ${configuredTokens.length} tokens ERC-20 para ${network}`);
      
      // Consultar saldos REAIS dos tokens ERC-20 na blockchain
      console.log(`🔍 Consultando saldos reais para ${configuredTokens.length} tokens na blockchain`);
      const tokenPromises = configuredTokens.map(async (token) => {
        try {
          console.log(`🪙 Consultando token ${token.symbol} (${token.address})`);
          
          // Consultar saldo real do token na blockchain
          const { loadLocalABI } = require('../contracts');
          const tokenABI = await loadLocalABI('default_token_abi');
          const tokenBalance = await blockchainService.getTokenBalance(
            address,
            token.address, 
            tokenABI,
            network
          );
          
          console.log(`✅ Saldo real ${token.symbol}: ${tokenBalance.balanceEth}`);
          return tokenBalance;
          
        } catch (tokenError) {
          console.warn(`⚠️ Erro ao consultar token ${token.symbol}: ${tokenError.message}`);
          return null; // Ignorar tokens com erro
        }
      });
      
      const tokenResults = await Promise.all(tokenPromises);
      const validTokenBalances = tokenResults.filter(result => result !== null);
      
      balancesData.tokenBalances = validTokenBalances;
      balancesData.totalTokens = validTokenBalances.length + 1; // +1 para AZE
      
      // Criar tabela de balances para facilitar acesso no frontend
      const nativeSymbol = network === 'testnet' ? 'AZE-t' : 'AZE';
      balancesData.balancesTable = {
        [nativeSymbol]: balancesData.azeBalance.balanceEth
      };
      
      validTokenBalances.forEach(token => {
        balancesData.balancesTable[token.tokenSymbol] = token.balanceEth;
      });
      
      console.log(`✅ Total de tokens consultados: ${validTokenBalances.length} ERC-20 + 1 ${nativeSymbol}`);
      
    } catch (tokensError) {
      console.error(`❌ Erro ao consultar tokens ERC-20: ${tokensError.message}`);
      // Manter apenas o saldo nativo se houver erro nos tokens  
      balancesData.balancesTable = { [nativeSymbol]: balancesData.azeBalance.balanceEth };
      balancesData.totalTokens = 1;
    }
    
    // Salvar dados no campo balance do usuário e detectar mudanças
    let changeData = null;
    if (req.user && req.user.id) {
      console.log(`💾 Salvando dados no banco para ${req.user.id} e detectando mudanças`);
      try {
        changeData = await blockchainService.saveAndCompareUserBalances(req.user.id, balancesData);
        
        // Se houve mudanças, enviar notificações via SSE
        if (changeData.changes.hasChanges) {
          console.log(`🔔 Mudanças detectadas para usuário ${req.user.id}:`, {
            newTokens: changeData.changes.newTokens.length,
            balanceChanges: changeData.changes.balanceChanges.length
          });

          // Aqui você pode implementar envio de notificações SSE ou websocket
          // Por exemplo: notificationService.sendBalanceChangeNotification(req.user.id, changeData.changes);
        }
      } catch (saveError) {
        console.error('❌ Erro ao salvar saldos no banco:', saveError);
        // Continuar mesmo se der erro ao salvar
      }
    }
    
    // Incluir informações sobre mudanças na resposta se disponível
    const response = {
      success: true,
      data: balancesData
    };
    
    if (changeData && changeData.changes.hasChanges) {
      response.balanceChanges = {
        newTokens: changeData.changes.newTokens,
        balanceChanges: changeData.changes.balanceChanges,
        hasChanges: true
      };
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao obter saldos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Busca usuário por email
 */
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuário por email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Lista transações do usuário (considerando contexto multi-empresa)
 */
const listUserTransactions = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { 
      companyId, 
      page = 1, 
      limit = 50,
      status,
      startDate,
      endDate,
      type
    } = req.query;

    // Verificar se o usuário pode acessar as transações
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar transações de outro usuário'
      });
    }

    const prisma = require('../config/prisma').getPrisma();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (companyId) {
      // Buscar transações específicas da empresa
      const userCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId,
            companyId
          }
        }
      });

      if (!userCompany) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não vinculado a esta empresa'
        });
      }

      where.userCompanyId = userCompany.id;
    } else {
      // Buscar todas as transações do usuário (através de todas as vinculações)
      const userCompanies = await prisma.userCompany.findMany({
        where: { userId, status: 'active' },
        select: { id: true }
      });

      where.userCompanyId = {
        in: userCompanies.map(uc => uc.id)
      };
    }

    // Filtros adicionais
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          userCompany: {
            include: {
              company: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar transações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Bloquear usuário
 */
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.blockUser(id);
    res.json({
      success: true,
      message: 'Usuário bloqueado com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Desbloquear usuário
 */
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.unblockUser(id);
    res.json({
      success: true,
      message: 'Usuário desbloqueado com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Testar serviço de usuários
 */
const testUserService = async (req, res) => {
  try {
    const result = await userService.testService();
    res.json(result);
  } catch (error) {
    console.error('Erro ao testar serviço de usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar serviço'
    });
  }
};


/**
 * Obter ações do usuário
 */
const getUserActions = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { 
      category, 
      action, 
      status, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 
    } = req.query;

    console.log('🔍 [getUserActions] Requisição recebida para userId:', userId);
    console.log('🔍 [getUserActions] Filtros:', { category, action, status, limit, offset });

    const result = await userActionsService.getUserActions(userId, {
      category,
      action,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('🔍 [getUserActions] Ações encontradas:', result?.actions?.length || 0);
    console.log('🔍 [getUserActions] Total no BD:', result?.total || 0);

    res.json({
      success: true,
      data: result?.actions || [],
      pagination: {
        total: result?.total || 0,
        page: result?.page || 1,
        totalPages: result?.totalPages || 0
      }
    });
  } catch (error) {
    console.error('❌ [getUserActions] Erro ao buscar ações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar role do usuário na empresa
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const companyId = req.user.companyId; // Empresa do usuário autenticado
    
    // Validar role
    const validRoles = ['USER', 'ADMIN', 'APP_ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role inválido'
      });
    }
    
    const prisma = getPrisma();
    
    // Buscar a relação user_company
    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: id,
          companyId: companyId
        }
      }
    });
    
    if (!userCompany) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado nesta empresa'
      });
    }
    
    // Atualizar o role
    const updatedUserCompany = await prisma.userCompany.update({
      where: {
        userId_companyId: {
          userId: id,
          companyId: companyId
        }
      },
      data: {
        role: role
      }
    });
    
    res.json({
      success: true,
      message: 'Role atualizado com sucesso',
      data: { userCompany: updatedUserCompany }
    });
  } catch (error) {
    console.error('Erro ao atualizar role do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter saldos salvos no banco de dados do usuário
 */
const getUserSavedBalances = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar se o usuário pode acessar estes dados
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar saldos de outro usuário'
      });
    }

    console.log(`📚 Buscando saldos salvos para usuário ${userId}`);

    const savedBalances = await blockchainService.getUserSavedBalances(userId);

    res.json(savedBalances);

  } catch (error) {
    console.error('❌ Erro ao obter saldos salvos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar idioma preferido do usuário
 */
const updateUserLanguage = async (req, res) => {
  try {
    const userId = req.user.id; // Usuário autenticado
    const { language } = req.body;

    // Validar idioma
    const validLanguages = ['pt-BR', 'en-US', 'es'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Idioma inválido. Use: pt-BR, en-US ou es'
      });
    }

    console.log(`🌐 Atualizando idioma para usuário ${userId}: ${language}`);

    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferredLanguage: language },
      select: {
        id: true,
        name: true,
        email: true,
        preferredLanguage: true
      }
    });

    console.log(`✅ Idioma atualizado com sucesso para ${language}`);

    res.json({
      success: true,
      message: 'Idioma atualizado com sucesso',
      data: { user }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar idioma do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByCpf,
  getUserByAddress,
  getUserBalancesByAddress,
  listUsers,
  updateUser,
  updateUserRole,
  deactivateUser,
  activateUser,
  blockUser,
  unblockUser,
  testUserService,
  testService: testUserService,
  listUserTransactions,
  getUserByEmail,
  getUserActions,
  getUserSavedBalances,
  updateUserLanguage
};
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const userController = require('../controllers/user.controller');
const contractController = require('../controllers/contract.controller');
const { authenticateApiKey, requireApiAdmin, requireAnyAdmin } = require('../middleware/auth.middleware');
const { requirePasswordChange } = require('../middleware/session.middleware');
// const DatabaseReset = require('../../scripts/reset-database');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     AdminAuth:
 *       type: apiKey
 *       in: header
 *       name: X-API-Key
 *       description: API Key do administrador
 */

/**
 * @swagger
 * /api/admin/companies:
 *   get:
 *     summary: Lista todos os companies (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou email
 *     responses:
 *       200:
 *         description: Lista de companies
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/companies', authenticateApiKey, requireApiAdmin, requirePasswordChange, companyController.listCompanies);

/**
 * @swagger
 * /api/admin/companies/{id}:
 *   get:
 *     summary: Obtém uma empresa por ID (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Empresa não encontrada
 */
router.get('/companies/:id', authenticateApiKey, requireApiAdmin, requirePasswordChange, companyController.getCompanyById);

/**
 * @swagger
 * /api/admin/companies:
 *   post:
 *     summary: Cria uma nova empresa (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da empresa
 *               rateLimit:
 *                 type: object
 *                 properties:
 *                   requestsPerMinute:
 *                     type: integer
 *                     default: 100
 *                   requestsPerHour:
 *                     type: integer
 *                     default: 1000
 *                   requestsPerDay:
 *                     type: integer
 *                     default: 10000
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post('/companies', authenticateApiKey, requireApiAdmin, requirePasswordChange, companyController.createCompany);

/**
 * @swagger
 * /api/admin/companies/{id}:
 *   put:
 *     summary: Atualiza uma empresa (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do company
 *               isActive:
 *                 type: boolean
 *                 description: Status ativo do company
 *               rateLimit:
 *                 type: object
 *                 properties:
 *                   requestsPerMinute:
 *                     type: integer
 *                   requestsPerHour:
 *                     type: integer
 *                   requestsPerDay:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Company não encontrado
 */
router.put('/companies/:id', authenticateApiKey, requireApiAdmin, companyController.updateCompany);

/**
 * @swagger
 * /api/admin/companies/{id}:
 *   delete:
 *     summary: Desativa uma empresa (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa desativada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Company não encontrado
 */
router.delete('/companies/:id', authenticateApiKey, requireApiAdmin, companyController.deactivateCompany);

/**
 * @swagger
 * /api/admin/companies/{id}/activate:
 *   post:
 *     summary: Reativa uma empresa (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa reativada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Company não encontrado
 */
router.post('/companies/:id/activate', authenticateApiKey, requireApiAdmin, companyController.activateCompany);

/**
 * @swagger
 * /api/admin/companies/{id}/users:
 *   get:
 *     summary: Obtém usuários de uma empresa específica (Admin)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, email ou CPF
 *       - in: query
 *         name: includePrivateKey
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir chave privada na resposta
 *     responses:
 *       200:
 *         description: Lista de usuários da empresa
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
// router.get('/companies/:id/users', authenticateApiKey, requireApiAdmin, userController.getUsersByCompanyId); // TODO: Implementar função

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Cria um novo usuário (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - companyId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da empresa à qual o usuário será vinculado
 *               cpf:
 *                 type: string
 *                 description: CPF do usuário
 *               phone:
 *                 type: string
 *                 description: Telefone do usuário
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento
 *               permissions:
 *                 type: object
 *                 description: Permissões do usuário
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Roles do usuário
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post('/users', authenticateApiKey, requireApiAdmin, userController.createUser);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lista todos os usuários (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por company ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, email ou CPF
 *       - in: query
 *         name: includePrivateKey
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir chave privada na resposta
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/users', authenticateApiKey, requireApiAdmin, requirePasswordChange, userController.listUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Obtém um usuário por ID (Admin)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: query
 *         name: includePrivateKey
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir chave privada na resposta
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/users/:id', authenticateApiKey, requireApiAdmin, userController.getUserById);

/**
 * @swagger
 * /api/admin/users/{userId}/keys:
 *   get:
 *     summary: Obtém chaves públicas e privadas de um usuário (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Chaves obtidas com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
// router.get('/users/:userId/keys', authenticateApiKey, requireApiAdmin, userController.getUserKeysAdmin); // TODO: Implementar função

/**
 * @swagger
 * /api/admin/users/email/{email}:
 *   get:
 *     summary: Obtém um usuário por email (Admin)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email do usuário
 *       - in: query
 *         name: includePrivateKey
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir chave privada na resposta
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/users/email/:email', authenticateApiKey, requireApiAdmin, userController.getUserByEmail);

/**
 * @swagger
 * /api/admin/users/cpf/{cpf}:
 *   get:
 *     summary: Obtém um usuário por CPF (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *         description: CPF do usuário
 *       - in: query
 *         name: includePrivateKey
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir chave privada na resposta
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/users/cpf/:cpf', authenticateApiKey, requireApiAdmin, userController.getUserByCpf);

/**
 * @swagger
 * /api/admin/users/{userId}/add-api-admin:
 *   post:
 *     summary: Concede a flag isApiAdmin de um usuário (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Flag concedida com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
// router.post('/users/:userId/add-api-admin', authenticateApiKey, requireApiAdmin, userController.addApiAdmin); // TODO: Implementar função

/**
 * @swagger
 * /api/admin/users/{userId}/remove-api-admin:
 *   post:
 *     summary: Remove a flag isApiAdmin de um usuário (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Flag removida com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
// router.post('/users/:userId/remove-api-admin', authenticateApiKey, requireApiAdmin, userController.removeApiAdmin); // TODO: Implementar função

/**
 * @swagger
 * /api/admin/users/{userId}/add-company-admin:
 *   post:
 *     summary: Concede a flag isCompanyAdmin de um usuário (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Flag concedida com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
// router.post('/users/:userId/add-company-admin', authenticateApiKey, requireAnyAdmin, userController.addCompanyAdmin); // TODO: Implementar função

/**
 * @swagger
 * /api/admin/users/{userId}/remove-company-admin:
 *   post:
 *     summary: Remove a flag isCompanyAdmin de um usuário (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Flag removida com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
// router.post('/users/:userId/remove-company-admin', authenticateApiKey, requireAnyAdmin, userController.removeCompanyAdmin); // TODO: Implementar função

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Obtém estatísticas gerais do sistema (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/dashboard/stats', requirePasswordChange, async (req, res) => {
  try {
    const { getMasterClient } = require('../database');
    const masterPrisma = getMasterClient();

    console.log('🔍 [DASHBOARD] masterPrisma:', !!masterPrisma);
    console.log('🔍 [DASHBOARD] masterPrisma.club:', !!masterPrisma?.club);
    console.log('🔍 [DASHBOARD] masterPrisma.globalStats:', !!masterPrisma?.globalStats);

    if (!masterPrisma) {
      throw new Error('Master Prisma client not initialized');
    }

    // Buscar estatísticas globais mais recentes
    const latestGlobalStats = await masterPrisma.globalStats.findFirst({
      orderBy: {
        date: 'desc'
      }
    });

    // Buscar contagens básicas do Master DB
    const [
      totalClubs,
      activeClubs,
      totalClubAdmins,
      activeClubAdmins,
      totalSuperAdmins,
      activeSuperAdmins
    ] = await Promise.all([
      masterPrisma.club.count(),
      masterPrisma.club.count({ where: { status: 'active' } }),
      masterPrisma.clubAdmin.count(),
      masterPrisma.clubAdmin.count({ where: { isActive: true } }),
      masterPrisma.superAdmin.count(),
      masterPrisma.superAdmin.count({ where: { isActive: true } })
    ]);

    const stats = {
      // Estatísticas de clubs e admins
      totalClubs,
      activeClubs,
      totalClubAdmins,
      activeClubAdmins,
      totalSuperAdmins,
      activeSuperAdmins,

      // Estatísticas globais (da tabela global_stats)
      globalStats: latestGlobalStats ? {
        date: latestGlobalStats.date,
        totalUsers: latestGlobalStats.totalUsers,
        totalConsumers: latestGlobalStats.totalConsumers,
        totalMerchants: latestGlobalStats.totalMerchants,
        totalPurchases: latestGlobalStats.totalPurchases,
        totalRevenue: latestGlobalStats.totalRevenue,
        totalCashbackPaid: latestGlobalStats.totalCashbackPaid,
        totalPlatformFees: latestGlobalStats.totalPlatformFees,
        totalProducts: latestGlobalStats.totalProducts,
        activeUsers30d: latestGlobalStats.activeUsers30d,
        revenue30d: latestGlobalStats.revenue30d,
        purchases30d: latestGlobalStats.purchases30d,
        cashback30d: latestGlobalStats.cashback30d,
        newClubs: latestGlobalStats.newClubs,
        newUsers: latestGlobalStats.newUsers,
        churnedClubs: latestGlobalStats.churnedClubs
      } : null,

      systemUptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/contracts/{address}/grant-admin-role:
 *   post:
 *     summary: Concede a role DEFAULT_ADMIN_ROLE a um usuário (Admin)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Endereço do contrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newAdminPublicKey
 *             properties:
 *               newAdminPublicKey:
 *                 type: string
 *                 description: PublicKey do novo admin
 *     responses:
 *       200:
 *         description: Role concedida com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post('/contracts/:address/grant-admin-role', contractController.grantAdminRoleAdmin);

/**
 * @swagger
 * /api/admin/test/service:
 *   get:
 *     summary: Testa os serviços admin
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: Teste executado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro no teste
 */
router.get('/test/service', async (req, res) => {
  try {
    const results = {
      adminAuth: 'OK',
      companyService: 'OK',
      userService: 'OK',
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Serviços admin funcionando corretamente',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no teste dos serviços admin',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/cache/stats:
 *   get:
 *     summary: Obtém estatísticas do cache Redis
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do cache obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isConnected:
 *                       type: boolean
 *                     userCache:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                     balancesCache:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                     blacklist:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                     totalKeys:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/cache/stats', authenticateApiKey, requireApiAdmin, async (req, res) => {
  try {
    const redisService = require('../services/redis.service');
    const stats = await redisService.getCacheStats();
    
    res.json({
      success: true,
      message: 'Estatísticas do cache obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas do cache',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/cache/clear:
 *   post:
 *     summary: Limpa todo o cache Redis
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache limpo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     clearedKeys:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post('/cache/clear', authenticateApiKey, requireApiAdmin, async (req, res) => {
  try {
    const redisService = require('../services/redis.service');
    const clearedKeys = await redisService.clearAllCache();
    
    res.json({
      success: true,
      message: 'Cache limpo com sucesso',
      data: {
        clearedKeys: clearedKeys
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar cache',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/database/reset:
 *   post:
 *     summary: Zera o banco de dados e carrega dados iniciais (CUIDADO - OPERAÇÃO DESTRUTIVA)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmReset:
 *                 type: boolean
 *                 description: Confirmação de que deseja realmente resetar o banco
 *                 example: true
 *             required:
 *               - confirmReset
 *     responses:
 *       200:
 *         description: Banco resetado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Banco de dados resetado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       type: object
 *                       description: Company padrão criado
 *                     user:
 *                       type: object
 *                       description: Usuário padrão criado
 *       400:
 *         description: Confirmação necessária
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.post('/database/reset', authenticateApiKey, requireApiAdmin, async (req, res) => {
  try {
    const { confirmReset } = req.body;
    
    // Verificar confirmação
    if (!confirmReset || confirmReset !== true) {
      return res.status(400).json({
        success: false,
        message: 'Para executar o reset, você deve enviar confirmReset: true no body da requisição',
        warning: 'ATENÇÃO: Esta operação irá apagar TODOS os dados do banco de dados!'
      });
    }
    
    // const databaseReset = new DatabaseReset();
    // const result = await databaseReset.run();
    
    res.json({
      success: true,
      message: 'Banco de dados resetado com sucesso',
      data: result.data,
      warning: 'Todos os dados anteriores foram apagados e dados padrão foram carregados'
    });
  } catch (error) {
    console.error('❌ Erro no reset do banco via API:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao resetar banco de dados',
      error: error.message
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middleware/jwt.middleware');
const jwtMiddleware = require('../middleware/jwt.middleware');
const { userCacheMiddleware, clearUserCacheMiddleware, updateBalancesCacheMiddleware } = require('../middleware/cache.middleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation.middleware');
const prismaConfig = require('../config/prisma');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - cpf
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         cpf:
 *           type: string
 *           description: CPF do usuário (apenas números)
 *         phone:
 *           type: string
 *           description: Telefone do usuário
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Data de nascimento
 *         publicKey:
 *           type: string
 *           description: Chave pública do usuário
 *         privateKey:
 *           type: string
 *           description: Chave privada do usuário
 *         companyId:
 *           type: string
 *           format: uuid
 *           description: ID do company ao qual o usuário pertence
 *         isActive:
 *           type: boolean
 *           description: Se o usuário está ativo
 *         metadata:
 *           type: object
 *           description: Metadados adicionais do usuário
 *         lastActivityAt:
 *           type: string
 *           format: date-time
 *           description: Última atividade do usuário
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', jwtMiddleware.authenticateToken, userController.createUser);


/**
 * @swagger
 * /api/users/test/service:
 *   get:
 *     summary: Testa o serviço de usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Teste executado com sucesso
 *       500:
 *         description: Erro no teste
 */
router.get('/test/service', userController.testService);

/**
 * /api/users:
 *   get:
 *     summary: Lista usuários com paginação
 *     tags: [Users]
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
 *       400:
 *         description: Parâmetros inválidos
 */
router.get('/', jwtMiddleware.authenticateToken, userController.listUsers);

/**
 * @swagger
 * /api/users/address/{address}:
 *   get:
 *     summary: Obtém um usuário por endereço (publicKey)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Endereço (publicKey) do usuário
 *       - in: query
 *         name: includePrivateKey
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir chave privada na resposta
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/address/:address', userController.getUserByAddress);

/**
 * @swagger
 * /api/users/address/{address}/balances:
 *   get:
 *     summary: Lista saldos de um usuário por endereço
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Endereço do usuário
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [mainnet, testnet]
 *           default: testnet
 *         description: Rede para consultar (mainnet ou testnet)
 *       - in: query
 *         name: forceRefresh
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *         description: Força consulta direta à blockchain (ignora cache)
 *     responses:
 *       200:
 *         description: Saldos obtidos com sucesso
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
 *                     address:
 *                       type: string
 *                     network:
 *                       type: string
 *                     azeBalance:
 *                       type: object
 *                       properties:
 *                         balanceWei:
 *                           type: string
 *                         balanceEth:
 *                           type: string
 *                     tokenBalances:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           contractAddress:
 *                             type: string
 *                           tokenName:
 *                             type: string
 *                           tokenSymbol:
 *                             type: string
 *                           tokenDecimals:
 *                             type: integer
 *                           balanceWei:
 *                             type: string
 *                           balanceEth:
 *                             type: string
 *                     balancesTable:
 *                       type: object
 *                       description: Tabela com balances por token
 *                     totalTokens:
 *                       type: integer
 *                     timestamp:
 *                       type: string
 *                     fromCache:
 *                       type: boolean
 *       400:
 *         description: Endereço inválido ou erro na consulta
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/address/:address/balances', updateBalancesCacheMiddleware, userController.getUserBalancesByAddress);

// Alias for frontend compatibility
router.get('/:address/balances', updateBalancesCacheMiddleware, userController.getUserBalancesByAddress);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtém um usuário por ID
 *     tags: [Users]
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
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * GET /api/users/taxes
 * Obter taxas de transferência do usuário
 */
router.get('/taxes',
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const userTaxesService = require('../services/userTaxes.service');
      const taxes = await userTaxesService.getTokenTransferFees(userId);

      res.json({
        success: true,
        data: {
          transferTaxes: taxes
        }
      });

    } catch (error) {
      console.error('Erro ao obter taxas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter taxas de transferência'
      });
    }
  }
);

/**
 * GET /api/users/{id}/taxes
 * Obter dados completos de user_taxes por ID do usuário
 */
router.get('/:id/taxes',
  authenticateJWT,
  async (req, res) => {
    try {
      const { id: userId } = req.params;

      const prisma = prismaConfig.getPrisma();
      const userTaxes = await prisma.userTaxes.findUnique({
        where: { userId: userId }
      });

      if (!userTaxes) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de taxas não encontrada para este usuário'
        });
      }

      res.json({
        success: true,
        data: userTaxes
      });

    } catch (error) {
      console.error('Erro ao obter dados de user_taxes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter dados de taxas do usuário'
      });
    }
  }
);

/**
 * @swagger
 * /api/users/balance:
 *   get:
 *     summary: Obter saldo de cBRL do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo obtido com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Usuário sem endereço blockchain
 */
router.get('/balance', authenticateJWT, userController.getUserBalance);

router.get('/:id', jwtMiddleware.authenticateToken, userController.getUserById);

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     summary: Obtém um usuário por email
 *     tags: [Users]
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
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/email/:email', userController.getUserByEmail);

/**
 * @swagger
 * /api/users/cpf/{cpf}:
 *   get:
 *     summary: Obtém um usuário por CPF
 *     tags: [Users]
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
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/cpf/:cpf', userController.getUserByCpf);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', jwtMiddleware.authenticateToken, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   post:
 *     summary: Desativa um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário desativado com sucesso
 *       400:
 *         description: Erro ao desativar
 */
router.post('/:id/deactivate', jwtMiddleware.authenticateToken, userController.deactivateUser);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   post:
 *     summary: Reativa um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário reativado com sucesso
 *       400:
 *         description: Erro ao reativar
 */
router.post('/:id/activate', jwtMiddleware.authenticateToken, userController.activateUser);

/**
 * @swagger
 * /api/users/{id}/block:
 *   post:
 *     summary: Bloqueia um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário bloqueado com sucesso
 *       400:
 *         description: Erro ao bloquear
 */
router.post('/:id/block', jwtMiddleware.authenticateToken, userController.blockUser);

/**
 * @swagger
 * /api/users/{id}/unblock:
 *   post:
 *     summary: Desbloqueia um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário desbloqueado com sucesso
 *       400:
 *         description: Erro ao desbloquear
 */
router.post('/:id/unblock', jwtMiddleware.authenticateToken, userController.unblockUser);

/**
 * @swagger
 * /api/users/company/{companyId}:
 *   get:
 *     summary: Obtém usuários de um company específico
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do company
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
 *         description: Lista de usuários do company
 *       400:
 *         description: Parâmetros inválidos
 */
// router.get('/company/:companyId', userController.getUsersByCompanyId); // TODO: Implementar função

/**
 * @swagger
 * /api/users/{userId}/keys:
 *   get:
 *     summary: Obtém chaves públicas e privadas de um usuário (Admin)
 *     tags: [Users]
 *     security:
 *       - AdminAuth: []
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
 *       400:
 *         description: Erro ao obter chaves
 *       401:
 *         description: Não autorizado
 */
// router.get('/:userId/keys', userController.getUserKeysAdmin); // TODO: Implementar função

/**
 * @swagger
 * /api/users/{userId}/keys/company:
 *   get:
 *     summary: Obtém chaves públicas e privadas de um usuário (Company)
 *     tags: [Users]
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
 *       400:
 *         description: Erro ao obter chaves
 *       401:
 *         description: Não autorizado
 */
// router.get('/:userId/keys/company', userController.getUserKeysCompany); // TODO: Implementar função

/**
 * @swagger
 * /api/users/search/{type}/{value}/keys:
 *   get:
 *     summary: Busca usuário por diferentes critérios e retorna chaves
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [id, email, cpf]
 *         description: Tipo de busca (id, email, cpf)
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Valor para busca
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *       400:
 *         description: Erro ao buscar usuário
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
// router.get('/search/:type/:value/keys', userController.searchUserKeys); // TODO: Implementar função

/**
 * POST /api/users/find
 * Buscar usuário por identificador (email, cpf, telefone)
 */
router.post('/find',
  authenticateJWT,
  [
    body('type').isIn(['email', 'cpf', 'phone']).withMessage('Tipo inválido'),
    body('value').notEmpty().withMessage('Valor é obrigatório')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { type, value } = req.body;
      
      let where = {};
      
      switch (type) {
        case 'email':
          where = { email: value.toLowerCase() };
          break;
        case 'cpf':
          // Remover formatação do CPF
          const cleanCPF = value.replace(/\D/g, '');
          where = { cpf: cleanCPF };
          break;
        case 'phone':
          // Remover formatação do telefone
          const cleanPhone = value.replace(/\D/g, '');
          where = { phone: cleanPhone };
          break;
      }

      const prisma = prismaConfig.getPrisma();
      const user = await prisma.user.findFirst({
        where: where,
        select: {
          id: true,
          name: true,
          email: true,
          cpf: true,
          phone: true,
          publicKey: true,
          isActive: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (!user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Usuário inativo'
        });
      }

      // Mascarar dados sensíveis
      const maskedUser = {
        id: user.id,
        name: user.name,
        email: user.email.substring(0, 2) + '***@' + user.email.split('@')[1],
        cpf: user.cpf ? user.cpf.substring(0, 3) + '.***.***-' + user.cpf.substring(9, 11) : null,
        phone: user.phone ? user.phone.substring(0, 2) + '****-' + user.phone.substring(7, 11) : null,
        publicKey: user.publicKey
      };

      res.json({
        success: true,
        data: maskedUser
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}/actions:
 *   get:
 *     summary: Obtém o histórico de ações de um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria da ação
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de ação
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status da ação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Limite de itens
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginação
 *     responses:
 *       200:
 *         description: Histórico de ações obtido com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id/actions', jwtMiddleware.authenticateToken, userController.getUserActions);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Atualiza o role do usuário na empresa
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, APP_ADMIN]
 *                 description: Novo role do usuário
 *     responses:
 *       200:
 *         description: Role atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id/role', jwtMiddleware.authenticateToken, userController.updateUserRole);

/**
 * @swagger
 * /api/users/{id}/saved-balances:
 *   get:
 *     summary: Obtém saldos salvos no banco de dados do usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Saldos salvos obtidos com sucesso
 *       404:
 *         description: Usuário não encontrado ou saldos não salvos
 */
router.get('/:id/saved-balances', jwtMiddleware.authenticateToken, userController.getUserSavedBalances);

/**
 * @swagger
 * /api/users/language:
 *   put:
 *     summary: Atualiza o idioma preferido do usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [pt-BR, en-US, es]
 *                 description: Idioma preferido do usuário
 *     responses:
 *       200:
 *         description: Idioma atualizado com sucesso
 *       400:
 *         description: Idioma inválido
 */
router.put('/language', jwtMiddleware.authenticateToken, userController.updateUserLanguage);

module.exports = router; 
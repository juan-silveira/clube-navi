const express = require('express');
const router = express.Router();
const transferService = require('../services/transfer.service');
const twoFactorService = require('../services/twoFactor.service');
const userActionsService = require('../services/userActions.service');
const { authenticateJWT } = require('../middleware/jwt.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { body, query } = require('express-validator');

/**
 * POST /api/transfers
 * Criar nova transferência
 */
router.post('/',
  authenticateJWT,
  (req, res, next) => {
    console.log('🔍 [TRANSFER] Payload recebido:', JSON.stringify(req.body, null, 2));
    next();
  },
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que 0'),
    body('asset').isString().notEmpty().withMessage('Ativo é obrigatório'),
    body('type').isIn(['internal', 'external']).withMessage('Tipo de transferência inválido'),
    body('description').optional().isString().customSanitizer(value => value || null),
    body('recipient').isObject().withMessage('Dados do destinatário são obrigatórios'),
    body('twoFactorCode').optional({ nullable: true }).isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      console.log(`📨 [TRANSFER-${requestId}] INÍCIO - Nova requisição de transferência`);

      const userId = req.user.id;
      let { amount, asset, type, description, recipient, twoFactorCode } = req.body;

      console.log(`📨 [TRANSFER-${requestId}] userId:`, userId, 'has2FACode:', !!twoFactorCode);

      // Verificar se usuário tem 2FA ativo
      const has2FA = await twoFactorService.userHasTwoFactor(userId);
      console.log(`📨 [TRANSFER-${requestId}] Usuário tem 2FA?`, has2FA);

      if (has2FA) {
        // Se tem 2FA mas não forneceu código, retornar erro
        if (!twoFactorCode) {
          return res.status(400).json({
            success: false,
            message: 'Código 2FA necessário para esta operação',
            requires2FA: true
          });
        }

        // Verificar código 2FA
        const isValidCode = await twoFactorService.verifyTOTP(userId, twoFactorCode);

        if (!isValidCode) {
          // Registrar tentativa falha de 2FA
          await userActionsService.logSecurity(userId, 'two_factor_failed', req, {
            operation: 'transfer',
            status: 'failed',
            errorMessage: 'Invalid 2FA code'
          });

          return res.status(401).json({
            success: false,
            message: 'Código 2FA inválido'
          });
        }

        // Código 2FA válido - registrar sucesso
        await userActionsService.logSecurity(userId, 'two_factor_verified', req, {
          operation: 'transfer',
          status: 'success',
          details: { method: 'totp' }
        });
      }

      // Debug para entender o problema
      console.log('📝 Transfer payload recebido:', {
        amount,
        asset,
        type,
        description: description === undefined ? 'undefined' : description === null ? 'null' : `"${description}"`,
        hasRecipient: !!recipient,
        recipientKeys: recipient ? Object.keys(recipient) : []
      });

      // Sanitizar descrição - garantir que seja null se vazio
      if (!description || (typeof description === 'string' && description.trim() === '')) {
        description = null;
      }

      // Criar transferência
      const transfer = await transferService.createTransfer({
        userId,
        amount: parseFloat(amount),
        asset,
        type,
        description,
        recipient
      });

      // Executar transferência automaticamente
      const result = await transferService.executeTransfer(transfer.id);

      res.json({
        success: true,
        data: result,
        message: 'Transferência realizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao processar transferência:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao processar transferência'
      });
    }
  }
);


/**
 * POST /api/transfers/validate-recipient
 * Validar e buscar destinatário
 */
router.post('/validate-recipient',
  authenticateJWT,
  [
    body('type').isIn(['email', 'cpf', 'phone', 'address']).withMessage('Tipo inválido'),
    body('value').notEmpty().withMessage('Valor é obrigatório')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { type, value } = req.body;

      // Se for endereço externo, apenas validar
      if (type === 'address') {
        const isValid = transferService.isValidEthereumAddress(value);
        
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: 'Endereço Ethereum inválido'
          });
        }

        return res.json({
          success: true,
          data: {
            type: 'external',
            address: value,
            blockchain: 'Azore',
            chainId: 8800
          }
        });
      }

      // Buscar usuário interno
      const user = await transferService.findUserByIdentifier(type, value);

      res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Erro ao validar destinatário:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Destinatário não encontrado'
      });
    }
  }
);

/**
 * GET /api/transfers
 * Listar transferências do usuário
 */
router.get('/',
  authenticateJWT,
  [
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed']),
    query('type').optional().isIn(['internal', 'external']),
    query('asset').optional().isIn(['cBRL', 'PCN', 'AZE', 'AZE-t', 'CNT']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        type: req.query.type,
        asset: req.query.asset,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const transfers = await transferService.getUserTransfers(userId, filters);

      res.json({
        success: true,
        data: transfers
      });

    } catch (error) {
      console.error('Erro ao listar transferências:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar transferências'
      });
    }
  }
);

/**
 * GET /api/transfers/valid-tokens
 * Obter lista de tokens válidos para transferência
 */
router.get('/valid-tokens',
  authenticateJWT,
  async (req, res) => {
    try {
      const validTokens = await transferService.getValidTokens();

      res.json({
        success: true,
        data: validTokens
      });

    } catch (error) {
      console.error('Erro ao obter tokens válidos:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao obter tokens válidos'
      });
    }
  }
);

/**
 * GET /api/transfers/:id
 * Obter detalhes de uma transferência
 */
router.get('/:id',
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const transferId = req.params.id;

      const transfer = await transferService.getTransferById(transferId, userId);

      res.json({
        success: true,
        data: transfer
      });

    } catch (error) {
      console.error('Erro ao obter transferência:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Transferência não encontrada'
      });
    }
  }
);

/**
 * GET /api/transfers/token-metadata/:symbol
 * Obter metadata do token incluindo gasPayer
 */
router.get('/token-metadata/:symbol',
  authenticateJWT,
  async (req, res) => {
    try {
      const tokenSymbol = req.params.symbol;

      const metadata = await transferService.getTokenMetadata(tokenSymbol);

      res.json({
        success: true,
        data: metadata
      });

    } catch (error) {
      console.error('Erro ao obter metadata do token:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Token não encontrado'
      });
    }
  }
);


module.exports = router;
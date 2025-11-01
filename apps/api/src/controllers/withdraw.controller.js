const WithdrawService = require('../services/withdraw.service');
const userActionsService = require('../services/userActions.service');
const twoFactorService = require('../services/twoFactor.service');

class WithdrawController {
  constructor() {
    this.withdrawService = new WithdrawService();
  }

  /**
   * @swagger
   * /api/withdrawals:
   *   post:
   *     summary: Criar saque PIX
   *     description: Inicia um novo processo de saque PIX convertendo cBRL para BRL
   *     tags: [Withdrawals]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - pixKey
   *             properties:
   *               amount:
   *                 type: number
   *                 minimum: 10
   *                 description: Valor do saque em cBRL (mínimo R$ 10,00)
   *                 example: 50.00
   *               pixKey:
   *                 type: string
   *                 description: Chave PIX de destino (CPF, CNPJ, email, telefone ou aleatória)
   *                 example: "usuario@exemplo.com"
   *               description:
   *                 type: string
   *                 description: Descrição opcional do saque
   *                 example: "Saque de cBRL para conta corrente"
   *     responses:
   *       201:
   *         description: Saque criado com sucesso
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
   *                   example: "Saque iniciado com sucesso"
   *                 data:
   *                   type: object
   *                   properties:
   *                     withdrawal:
   *                       $ref: '#/components/schemas/Withdrawal'
   *                     estimatedProcessingTime:
   *                       type: string
   *                       example: "5-15 minutos"
   *                       description: Tempo estimado de processamento
   *       400:
   *         description: Dados inválidos ou saldo insuficiente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Chave PIX inválida"
   *       403:
   *         description: Email não confirmado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Por favor, confirme seu email antes de continuar"
   *                 code:
   *                   type: string
   *                   example: "EMAIL_NOT_CONFIRMED"
   *       401:
   *         description: Token inválido ou expirado
   *       500:
   *         description: Erro interno do servidor
   */
  async initiateWithdrawal(req, res) {
    try {
      const { amount, pixKey, twoFactorCode } = req.body;

      // Obter userId do JWT token (definido pelo middleware de autenticação)
      const userId = req.user?.id;

      // Validações
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor inválido para saque'
        });
      }

      if (!pixKey) {
        return res.status(400).json({
          success: false,
          message: 'Chave PIX é obrigatória'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Verificar se usuário tem 2FA ativo
      const has2FA = await twoFactorService.userHasTwoFactor(userId);

      if (has2FA) {
        // Se tem 2FA mas não forneceu código, retornar erro
        if (!twoFactorCode) {
          return res.status(400).json({
            success: false,
            message: 'Código 2FA necessário para esta operação',
            requires2FA: true
          });
        }

        // Verificar código 2FA (TOTP ou backup code)
        try {
          const verificationResult = await twoFactorService.verify2FA(userId, twoFactorCode);

          if (!verificationResult.success) {
            // Registrar tentativa falha de 2FA
            await userActionsService.logSecurity(userId, 'two_factor_failed', req, {
              operation: 'withdrawal_initiate',
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
            operation: 'withdrawal_initiate',
            status: 'success',
            details: { method: verificationResult.method }
          });

        } catch (error) {
          return res.status(401).json({
            success: false,
            message: error.message || 'Código 2FA inválido'
          });
        }
      }

      // Iniciar processo de saque
      const result = await this.withdrawService.initiateWithdrawal(amount, pixKey, userId);
      
      // Registrar ação de saque iniciado
      await userActionsService.logFinancial(userId, 'withdrawal_initiated', req, {
        status: 'pending',
        amount,
        currency: 'cBRL',
        method: 'pix',
        transactionId: result.withdrawalId,
        details: {
          withdrawalId: result.withdrawalId,
          amount: result.amount,
          pixKey: this.maskPixKey(pixKey)
        }
      });

      // Enviar notificação WhatsApp para admins sobre novo saque pendente
      try {
        const axios = require('axios');
        const prismaConfig = require('../config/prisma');
        const prisma = prismaConfig.getPrisma();

        console.log('📱 [WITHDRAWAL] Iniciando envio de notificações WhatsApp...');

        // Buscar configuração de usuários diretamente do banco
        const config = await prisma.notificationConfig.findUnique({
          where: { type: 'withdrawal' }
        });

        const userIds = config?.userIds || [];
        console.log(`📱 [WITHDRAWAL] IDs configurados: ${userIds.length}`, userIds);

        if (userIds.length === 0) {
          console.log('⚠️ [WITHDRAWAL] Nenhum usuário configurado para receber notificações de saque');
        } else {
          // Buscar dados dos usuários
          const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { phone: true, name: true }
          });
          console.log(`📱 [WITHDRAWAL] Usuários encontrados: ${users.length}`, users);

          // Mascarar chave PIX
          const maskedPixKey = this.maskPixKey(pixKey);

          const message = `💰 *NOVO SAQUE PENDENTE* 💰\n\n👤 *Usuário:* ${req.user?.name || 'N/A'}\n📧 *Email:* ${req.user?.email || 'N/A'}\n💵 *Valor:* R$ ${parseFloat(amount).toFixed(2)}\n🔑 *Chave PIX:* ${maskedPixKey}\n📅 *Data:* ${new Date().toLocaleString('pt-BR')}\n\n⚠️ *Ação necessária:* Acesse o sistema para aprovar o saque.`;

          for (const user of users) {
            if (user.phone) {
              console.log(`📱 [WITHDRAWAL] Enviando para ${user.name} (${user.phone})...`);
              await axios.post('https://webhook.n8n.net.br/webhook/envios-coinage', {
                user: 'Coinage',
                dest: user.phone,
                text: message
              });
              console.log(`✅ [WITHDRAWAL] Mensagem WhatsApp enviada para ${user.phone}`);
            } else {
              console.log(`⚠️ [WITHDRAWAL] Usuário ${user.name} não tem telefone cadastrado`);
            }
          }
        }
      } catch (notificationError) {
        console.error('❌ [WITHDRAWAL] Erro ao enviar WhatsApp:', notificationError.message);
        console.error('❌ [WITHDRAWAL] Stack:', notificationError.stack);
      }

      res.json({
        success: true,
        message: 'Saque iniciado com sucesso',
        data: {
          withdrawalId: result.withdrawalId,
          amount: result.amount,
          status: result.status,
          estimatedTime: result.estimatedTime
        }
      });

    } catch (error) {
      console.error('Erro ao iniciar saque:', error);
      
      // Registrar falha no saque
      if (req.body.userId) {
        await userActionsService.logFinancial(req.body.userId, 'withdrawal_failed', req, {
          status: 'failed',
          amount: req.body.amount,
          pixKey: this.maskPixKey(req.body.pixKey),
          errorMessage: error.message,
          errorCode: 'WITHDRAWAL_INITIATION_ERROR'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message.includes('saldo insuficiente') ? error.message : 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Confirmar saque executando burn na blockchain e PIX
   */
  async confirmWithdrawal(req, res) {
    // console.log(`🔍 [DEBUG] Controller confirmWithdrawal CHAMADO com withdrawalId: ${req.body?.withdrawalId}`);
    try {
      const { withdrawalId, twoFactorCode } = req.body;

      // Obter userId do JWT token
      const userId = req.user?.id;

      // Validações
      if (!withdrawalId) {
        return res.status(400).json({
          success: false,
          message: 'ID do saque é obrigatório'
        });
      }

      // Verificar se usuário tem 2FA ativo
      if (userId) {
        const has2FA = await twoFactorService.userHasTwoFactor(userId);

        if (has2FA) {
          // Se tem 2FA mas não forneceu código, retornar erro
          if (!twoFactorCode) {
            return res.status(400).json({
              success: false,
              message: 'Código 2FA necessário para esta operação',
              requires2FA: true
            });
          }

          // Verificar código 2FA (TOTP ou backup code)
          try {
            const verificationResult = await twoFactorService.verify2FA(userId, twoFactorCode);

            if (!verificationResult.success) {
              // Registrar tentativa falha de 2FA
              await userActionsService.logSecurity(userId, 'two_factor_failed', req, {
                operation: 'withdrawal_confirm',
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
              operation: 'withdrawal_confirm',
              status: 'success',
              details: { method: verificationResult.method }
            });

          } catch (error) {
            return res.status(401).json({
              success: false,
              message: error.message || 'Código 2FA inválido'
            });
          }
        }
      }

      // Confirmar saque (executa burn + PIX automaticamente)
      // console.log(`🔍 [DEBUG] Controller chamando withdrawService.confirmWithdrawal(${withdrawalId})`);
      const result = await this.withdrawService.confirmWithdrawal(withdrawalId);
      
      // Registrar ação de saque confirmado
      if (result && result.user) {
        await userActionsService.logFinancial(result.user.id, 'withdrawal_confirmed', req, {
          status: 'completed',
          amount: result.amount,
          currency: 'cBRL',
          method: 'pix',
          transactionId: withdrawalId,
          burnTxHash: result.burnTxHash,
          pixTransactionId: result.pixTransactionId,
          details: {
            withdrawalId: withdrawalId,
            amount: result.amount,
            pixKey: this.maskPixKey(result.pixKey),
            burnResult: result.metadata?.burn,
            pixResult: result.metadata?.pixPayment
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Saque confirmado com sucesso',
        data: {
          withdrawalId: result.id,
          status: result.status,
          amount: result.amount,
          pixKey: result.pixKey,
          burnTxHash: result.burnTxHash,
          pixTransactionId: result.pixTransactionId,
          pixEndToEndId: result.pixEndToEndId,
          completedAt: result.completedAt,
          metadata: result.metadata
        }
      });

    } catch (error) {
      console.error('Erro ao confirmar saque:', error);
      
      // Registrar falha na confirmação
      if (req.body.withdrawalId) {
        try {
          const withdrawal = await this.withdrawService.getWithdrawalStatus(req.body.withdrawalId);
          if (withdrawal && withdrawal.user) {
            await userActionsService.logFinancial(withdrawal.user.id, 'withdrawal_confirmation_failed', req, {
              status: 'failed',
              withdrawalId: req.body.withdrawalId,
              errorMessage: error.message,
              errorCode: 'WITHDRAWAL_CONFIRMATION_ERROR'
            });
          }
        } catch (logError) {
          console.error('Erro ao registrar falha:', logError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: error.message.includes('não encontrado') ? error.message : 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter status de um saque
   */
  async getWithdrawalStatus(req, res) {
    try {
      const { withdrawalId } = req.params;
      
      if (!withdrawalId) {
        return res.status(400).json({
          success: false,
          message: 'ID do saque é obrigatório'
        });
      }

      const status = await this.withdrawService.getWithdrawalStatus(withdrawalId);
      
      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Erro ao obter status do saque:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Listar saques de um usuário
   */
  async getUserWithdrawals(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      const withdrawals = await this.withdrawService.getUserWithdrawals(
        userId, 
        parseInt(page), 
        parseInt(limit), 
        status
      );
      
      res.json({
        success: true,
        data: withdrawals
      });

    } catch (error) {
      console.error('Erro ao listar saques:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Calcular taxa de saque
   */
  async calculateWithdrawalFee(req, res) {
    try {
      const { amount } = req.body;
      
      // Obter userId do JWT token (definido pelo middleware de autenticação)
      const userId = req.user?.id;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor inválido'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      console.log('🔍 [calculateWithdrawalFee] Calculando taxa para:', { amount, userId });
      const fee = await this.withdrawService.calculateFee(amount, userId);
      console.log('🔍 [calculateWithdrawalFee] Taxa calculada:', fee);
      
      res.json({
        success: true,
        data: {
          amount,
          fee,
          netAmount: amount - fee,
          feePercentage: (fee / amount * 100).toFixed(2)
        }
      });

    } catch (error) {
      console.error('Erro ao calcular taxa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Validar chave PIX
   */
  async validatePixKey(req, res) {
    try {
      const { pixKey } = req.body;
      
      if (!pixKey) {
        return res.status(400).json({
          success: false,
          message: 'Chave PIX é obrigatória'
        });
      }

      const validation = await this.withdrawService.validatePixKey(pixKey);
      
      res.json({
        success: true,
        data: validation
      });

    } catch (error) {
      console.error('Erro ao validar chave PIX:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Mascara a chave PIX para logs
   */
  maskPixKey(pixKey) {
    if (!pixKey) return '';
    
    if (pixKey.includes('@')) {
      // Email
      const [username, domain] = pixKey.split('@');
      return `${username.substring(0, 2)}***@${domain}`;
    } else if (pixKey.length === 11) {
      // CPF
      return `***${pixKey.slice(-3)}`;
    } else if (pixKey.length === 14) {
      // CNPJ
      return `***${pixKey.slice(-4)}`;
    } else {
      // Telefone ou aleatória
      return `***${pixKey.slice(-4)}`;
    }
  }
}

module.exports = WithdrawController;
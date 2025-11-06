const emailService = require('../services/email.service');
const userActionsService = require('../services/userActions.service');
const userService = require('../services/user.service');

class EmailConfirmationController {
  constructor() {
    // Removed: prisma instance moved to req.tenantPrisma
  }

  /**
   * @swagger
   * /api/email-confirmation/confirm:
   *   get:
   *     summary: Confirmar email do usuário
   *     description: Confirma o email do usuário usando token de confirmação enviado por email
   *     tags: [Email Confirmation]
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: Token de confirmação enviado por email
   *       - in: query
   *         name: company
   *         required: false
   *         schema:
   *           type: string
   *           default: default
   *         description: Alias da empresa (para white-label)
   *     responses:
   *       200:
   *         description: Email confirmado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmailConfirmation'
   *             example:
   *               success: true
   *               message: "Email confirmado com sucesso!"
   *               data:
   *                 emailConfirmed: true
   *                 user:
   *                   id: "123e4567-e89b-12d3-a456-426614174000"
   *                   email: "usuario@exemplo.com"
   *                   isActive: true
   *       400:
   *         description: Token inválido ou expirado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               message: "Token inválido ou expirado"
   *               code: "INVALID_TOKEN"
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async confirmEmail(req, res) {
    try {
      const prisma = req.tenantPrisma;
      const { token, company } = req.query;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de confirmação é obrigatório',
          code: 'TOKEN_REQUIRED'
        });
      }

      // Validar token
      const tokenData = await emailService.validateEmailConfirmationToken(token, company);

      if (!tokenData || !tokenData.valid) {
        const errorMessages = {
          'TOKEN_NOT_FOUND': 'Token não encontrado. Solicite um novo email de confirmação.',
          'TOKEN_EXPIRED': 'Token expirado. Solicite um novo email de confirmação.',
          'TOKEN_ALREADY_USED': 'Este token já foi utilizado.',
          'INVALID_METADATA': 'Token inválido. Solicite um novo email de confirmação.',
          'VALIDATION_ERROR': 'Erro ao validar token. Tente novamente.'
        };

        const message = errorMessages[tokenData?.error] || 'Token inválido ou expirado. Solicite um novo email de confirmação.';

        console.error('❌ Token inválido:', {
          token: token.substring(0, 16) + '...',
          error: tokenData?.error,
          company
        });

        // Retornar email e userId se disponíveis para facilitar reenvio
        return res.status(400).json({
          success: false,
          message,
          code: tokenData?.error || 'INVALID_TOKEN',
          data: {
            email: tokenData?.email || null,
            userId: tokenData?.userId || null,
            canResend: !!tokenData?.email
          }
        });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: tokenData.userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Se já ativo, retornar sucesso
      if (user.emailConfirmed && user.isActive) {
        return res.status(200).json({
          success: true,
          message: 'Email já foi confirmado anteriormente',
          code: 'ALREADY_CONFIRMED',
          data: {
            userId: user.id,
            email: user.email,
            confirmedAt: user.updatedAt,
            hasBlockchainKeys: !!(user.publicKey && user.privateKey)
          }
        });
      }

      // Gerar chaves blockchain EVM se ainda não existirem
      let publicKeyHex = user.publicKey;
      let privateKeyHex = user.privateKey;

      if (!publicKeyHex || !privateKeyHex) {
        console.log('🔐 Gerando chaves blockchain EVM para usuário:', user.email);

        // Usar a API EVM correta do userService
        const { publicKey, privateKey } = userService.generateKeyPair();

        publicKeyHex = publicKey;
        privateKeyHex = privateKey;

        console.log('✅ Chaves blockchain EVM geradas com sucesso');
        console.log('🔑 Public Key:', publicKey.substring(0, 20) + '...');
      }

      // Ativar usuário e atualizar chaves blockchain
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          emailConfirmed: true,
          publicKey: publicKeyHex,
          privateKey: privateKeyHex,
          updatedAt: new Date()
        }
      });

      // Registrar ação
      await userActionsService.logAuth(user.id, 'email_sent', req, {
        status: 'success',
        details: {
          email: user.email,
          confirmedAt: new Date().toISOString(),
          tokenUsed: token.substring(0, 8) + '...',
          company: company || 'default',
          emailType: 'email_confirmation_success'
        }
      });

      // Invalidar token (marcar como usado)
      await this.invalidateToken(prisma, token);

      // Enviar email de boas-vindas
      try {
        await emailService.sendTemplateEmail('welcome', user.email, {
          userName: user.name,
          companyName: company || 'Coinage',
          publicKey: user.publicKey,
          loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
        });
      } catch (emailError) {
        console.warn('⚠️ Erro ao enviar email de boas-vindas:', emailError.message);
      }

      // Resposta de sucesso
      res.status(200).json({
        success: true,
        message: 'Email confirmado com sucesso! Sua conta está ativa.',
        code: 'EMAIL_CONFIRMED',
        data: {
          userId: user.id,
          email: user.email,
          name: user.name,
          confirmedAt: updatedUser.updatedAt,
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        }
      });

    } catch (error) {
      console.error('❌ Erro ao confirmar email:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Reenviar email de confirmação
   * POST /api/email/resend-confirmation
   */
  async resendConfirmationEmail(req, res) {
    try {
      const prisma = req.tenantPrisma;
      const { email, companyAlias } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório',
          code: 'EMAIL_REQUIRED'
        });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // Por segurança, não revelar que o email não existe
        return res.status(200).json({
          success: true,
          message: 'Se o email estiver em nosso sistema, você receberá um email de confirmação',
          code: 'RESEND_REQUESTED'
        });
      }

      // Se já ativo, informar
      if (user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Este email já foi confirmado',
          code: 'ALREADY_CONFIRMED'
        });
      }

      // Verificar rate limiting (max 3 emails por hora)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentResends = await prisma.userAction.count({
        where: {
          userId: user.id,
          action: 'email_sent',
          performedAt: {
            gte: oneHourAgo
          }
        }
      });

      if (recentResends >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Muitos emails enviados. Tente novamente em 1 hora.',
          code: 'RATE_LIMITED'
        });
      }

      // Gerar novo token
      const token = await emailService.generateEmailConfirmationToken(user.id, companyAlias || 'default');
      
      // Enviar email
      await emailService.sendEmailConfirmation(user.email, {
        userName: user.name,
        companyName: companyAlias || 'Coinage',
        token,
        userId: user.id,
        companyAlias: companyAlias || 'default',
        baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        expiresIn: '24 horas'
      });

      // Registrar ação
      await userActionsService.logAuth(user.id, 'email_sent', req, {
        status: 'success',
        details: {
          email: user.email,
          requestedAt: new Date().toISOString(),
          companyAlias: companyAlias || 'default',
          emailType: 'email_confirmation_resend'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Email de confirmação reenviado com sucesso',
        code: 'RESEND_SUCCESS',
        data: {
          email: user.email,
          expiresIn: '24 horas'
        }
      });

    } catch (error) {
      console.error('❌ Erro ao reenviar email de confirmação:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Verificar status do email de um usuário
   * GET /api/email/status/:userId
   */
  async getEmailStatus(req, res) {
    try {
      const prisma = req.tenantPrisma;
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório',
          code: 'USER_ID_REQUIRED'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Buscar tentativas recentes de reenvio
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentResends = await prisma.userAction.count({
        where: {
          userId: user.id,
          action: 'email_sent',
          performedAt: {
            gte: oneHourAgo
          }
        }
      });

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          isActive: user.isActive,
          emailConfirmed: user.isActive,
          createdAt: user.createdAt,
          confirmedAt: user.isActive ? user.updatedAt : null,
          canResendEmail: !user.isActive && recentResends < 3,
          recentResends,
          maxResendsPerHour: 3
        }
      });

    } catch (error) {
      console.error('❌ Erro ao obter status do email:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * @desc Confirmação manual do email (botão de "Já confirmei meu email")
   * @route POST /api/email-confirmation/manual-confirm
   * @access Private
   */
  async manualConfirmEmail(req, res) {
    try {
      const prisma = req.tenantPrisma;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Buscar usuário atual
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          isActive: true,
          emailConfirmed: true,
          name: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se já está confirmado
      if (user.emailConfirmed && user.isActive) {
        return res.json({
          success: true,
          message: 'Email já confirmado',
          data: {
            emailConfirmed: true,
            isActive: true,
            canAccessDashboard: true
          }
        });
      }

      // Atualizar ambas as flags
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailConfirmed: true,
          isActive: true
        }
      });

      // Registrar ação
      await userActionsService.logAuth(userId, 'email_sent', req, {
        status: 'success',
        details: {
          email: user.email,
          confirmedAt: new Date().toISOString(),
          method: 'manual_confirmation',
          emailType: 'email_manual_confirmation'
        }
      });

      return res.json({
        success: true,
        message: 'Email confirmado com sucesso! Você pode agora acessar o dashboard.',
        data: {
          emailConfirmed: true,
          isActive: true,
          canAccessDashboard: true
        }
      });

    } catch (error) {
      console.error('❌ Erro ao confirmar email manualmente:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Invalidar token usado
   */
  async invalidateToken(prisma, token) {
    try {
      await prisma.emailLog.updateMany({
        where: {
          subject: 'Email Confirmation Token',
          metadata: {
            path: ['token'],
            equals: token
          }
        },
        data: {
          status: 'used',
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Erro ao invalidar token:', error);
    }
  }
}

const emailConfirmationController = new EmailConfirmationController();

module.exports = {
  confirmEmail: emailConfirmationController.confirmEmail.bind(emailConfirmationController),
  resendConfirmationEmail: emailConfirmationController.resendConfirmationEmail.bind(emailConfirmationController),
  getEmailStatus: emailConfirmationController.getEmailStatus.bind(emailConfirmationController),
  manualConfirmEmail: emailConfirmationController.manualConfirmEmail.bind(emailConfirmationController)
};
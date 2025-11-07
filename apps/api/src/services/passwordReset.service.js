const crypto = require('crypto');

// Função para obter Prisma
const prismaConfig = require('../config/prisma');
const getPrisma = () => prismaConfig.getPrisma();

// Email service
const emailService = require('./email.service');

/**
 * Serviço para gerenciamento de recuperação de senha
 */
class PasswordResetService {
  /**
   * Inicializa o serviço
   */
  static async initialize() {
    try {
      const prisma = getPrisma();
      if (!prisma) {
        console.log('⚠️ Prisma não inicializado, aguardando...');
        return;
      }
      
      console.log('✅ Serviço de recuperação de senha inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de recuperação de senha:', error);
      // Não lançar erro para não parar a inicialização
    }
  }

  /**
   * Solicita recuperação de senha para um usuário
   */
  static async requestCompanyReset(email, ipAddress = null, userAgent = null, companyAlias = 'coinage') {
    try {
      console.log('🔍 Iniciando requestCompanyReset para:', email);
      const prisma = getPrisma();

      if (!prisma) {
        console.error('❌ Prisma não inicializado');
        return {
          success: false,
          message: 'Erro interno do servidor'
        };
      }

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          message: 'Email não encontrado no sistema'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Conta inativa. Entre em contato com o suporte.'
        };
      }

      // Invalidar tokens anteriores
      await prisma.passwordReset.updateMany({
        where: {
          email,
          used: false
        },
        data: {
          used: true,
          usedAt: new Date()
        }
      });

      // Criar novo token de reset
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + (60 * 60 * 1000)); // 1 hora
      
      console.log('🔍 Token gerado:', token.substring(0, 10) + '...');
      
      const passwordReset = await prisma.passwordReset.create({
        data: {
          userId: user.id,
          email,
          token,
          expiresAt,
          used: false
        }
      });

      console.log('✅ Token criado:', passwordReset.id);

      // Buscar dados da empresa para personalizar email
      let companyData = null;
      try {
        if (companyAlias && companyAlias !== 'coinage') {
          const company = await prisma.company.findUnique({
            where: { alias: companyAlias }
          });
          companyData = company;
        }
      } catch (error) {
        console.log('⚠️ Não foi possível buscar dados da empresa:', companyAlias);
      }

      // Enviar email de recuperação
      const frontendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password/${companyAlias || 'coinage'}?token=${token}`;
      
      try {
        await emailService.sendTemplateEmail('password_reset', email, {
          userName: user.name || user.email.split('@')[0],
          userEmail: user.email,
          resetUrl,
          companyName: companyData?.name || 'Clube Digital',
          requestDate: new Date().toLocaleString('pt-BR'),
          requestIp: ipAddress || 'N/A',
          userAgent: userAgent || 'N/A',
          supportEmail: 'suporte@coinage.trade',
          loginUrl: `${frontendUrl}/login/${companyAlias || 'coinage'}`,
          supportUrl: frontendUrl,
          securityUrl: frontendUrl
        }, {
          companyId: companyData?.id
        });

        console.log('✅ Email de recuperação enviado para:', email);
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
        // Não falhar a operação se o email não foi enviado
      }

      return {
        success: true,
        message: 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.',
        data: {
          expiresAt: passwordReset.expiresAt,
          // Em desenvolvimento, incluir o token para debug
          _debug: process.env.NODE_ENV === 'development' ? {
            token: token,
            resetUrl: resetUrl
          } : undefined
        }
      };
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Valida um token de recuperação
   */
  static async validateToken(token) {
    try {
      const prisma = getPrisma();

      if (!prisma) {
        return {
          success: false,
          message: 'Erro interno do servidor'
        };
      }

      const passwordReset = await prisma.passwordReset.findUnique({
        where: { token }
      });
      
      if (!passwordReset) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        };
      }

      if (passwordReset.expiresAt < new Date()) {
        return {
          success: false,
          message: 'Token expirado'
        };
      }

      if (passwordReset.used) {
        return {
          success: false,
          message: 'Token já foi utilizado'
        };
      }

      return {
        success: true,
        message: 'Token válido',
        data: {
          email: passwordReset.email,
          expiresAt: passwordReset.expiresAt
        }
      };
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Redefine a senha usando um token válido
   */
  static async resetPassword(token, newPassword) {
    try {
      const prisma = getPrisma();
      const bcrypt = require('bcrypt');

      if (!prisma) {
        return {
          success: false,
          message: 'Erro interno do servidor'
        };
      }

      // Validar token
      const passwordReset = await prisma.passwordReset.findUnique({
        where: { token }
      });
      
      if (!passwordReset) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        };
      }

      if (passwordReset.expiresAt < new Date()) {
        return {
          success: false,
          message: 'Token expirado'
        };
      }

      if (passwordReset.used) {
        return {
          success: false,
          message: 'Token já foi utilizado'
        };
      }

      // Buscar o usuário
      const user = await prisma.user.findUnique({
        where: { email: passwordReset.email }
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }

      // Validar nova senha
      if (!newPassword || newPassword.length < 6) {
        return {
          success: false,
          message: 'Nova senha deve ter pelo menos 6 caracteres'
        };
      }

      // Hash da nova senha
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Atualizar senha do usuário usando transação
      await prisma.$transaction([
        // Atualizar senha do usuário
        prisma.user.update({
          where: { id: user.id },
          data: { 
            password: hashedPassword,
            isFirstAccess: false
          }
        }),
        // Marcar token como usado
        prisma.passwordReset.update({
          where: { id: passwordReset.id },
          data: {
            used: true,
            usedAt: new Date()
          }
        })
      ]);

      console.log('✅ Senha redefinida com sucesso para:', user.email);

      return {
        success: true,
        message: 'Senha redefinida com sucesso',
        data: {
          email: user.email,
          isFirstAccess: false
        }
      };
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Limpa tokens expirados
   */
  static async cleanupExpiredTokens() {
    try {
      const models = getModels();
      const { PasswordReset } = models;

      const sequelize = global.sequelize;
      const result = await PasswordReset.update(
        {
          isUsed: true,
          usedAt: new Date()
        },
        {
          where: {
            isUsed: false,
            expiresAt: {
              [sequelize.Sequelize.Op.lt]: new Date()
            }
          }
        }
      );

      console.log(`🧹 Limpeza de tokens: ${result[0]} tokens expirados marcados como usados`);
      
      return {
        success: true,
        message: 'Limpeza de tokens concluída',
        data: {
          cleanedCount: result[0]
        }
      };
    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Obtém estatísticas de tokens
   */
  static async getTokenStats() {
    try {
      console.log('🔍 Iniciando getTokenStats');
      const models = getModels();
      console.log('🔍 Models disponíveis:', Object.keys(models));
      const { PasswordReset } = models;
      console.log('🔍 PasswordReset model:', !!PasswordReset);
      console.log('🔍 PasswordReset.count:', !!PasswordReset?.count);

      // Contar todos os registros
      const total = await PasswordReset.count();
      
      // Contar registros usados
      const used = await PasswordReset.count({
        where: { isUsed: true }
      });
      
      // Contar registros não usados
      const unused = await PasswordReset.count({
        where: { isUsed: false }
      });

      return {
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: {
          total: total,
          used: used,
          unused: unused
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = PasswordResetService; 
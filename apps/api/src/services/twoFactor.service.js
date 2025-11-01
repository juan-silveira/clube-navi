const prismaConfig = require('../config/prisma');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const emailService = require('./email.service');

class TwoFactorService {
  constructor() {
    this.prisma = null;
  }

  async init() {
    this.prisma = prismaConfig.getPrisma();
  }

  /**
   * Gera secret para TOTP
   * @param {string} userId - ID do usuário
   * @param {string} userEmail - Email do usuário
   * @returns {Promise<Object>} Dados do TOTP
   */
  async generateTOTPSecret(userId, userEmail) {
    try {
      if (!this.prisma) await this.init();

      // Gerar secret
      const secret = speakeasy.generateSecret({
        name: `Coinage (${userEmail})`,
        issuer: 'Coinage',
        length: 32
      });

      // Criar ou atualizar registro de 2FA
      const twoFactor = await this.prisma.userTwoFactor.upsert({
        where: {
          userId_type: {
            userId,
            type: 'totp'
          }
        },
        update: {
          secret: secret.base32,
          isActive: false,
          isVerified: false,
          setupCompletedAt: null
        },
        create: {
          userId,
          type: 'totp',
          secret: secret.base32,
          isActive: false,
          isVerified: false
        }
      });

      // Gerar QR Code
      const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode: qrCodeDataURL,
        manualEntryKey: secret.base32,
        id: twoFactor.id
      };

    } catch (error) {
      console.error('❌ Erro ao gerar secret TOTP:', error);
      throw error;
    }
  }

  /**
   * Verifica e ativa TOTP
   * @param {string} userId - ID do usuário
   * @param {string} token - Token TOTP fornecido
   * @returns {Promise<Object>} Resultado da verificação
   */
  async verifyAndActivateTOTP(userId, token) {
    try {
      if (!this.prisma) await this.init();

      console.log('🔐 [2FA] Verificando e ativando TOTP para userId:', userId);

      const twoFactor = await this.prisma.userTwoFactor.findUnique({
        where: {
          userId_type: {
            userId,
            type: 'totp'
          }
        }
      });

      console.log('🔐 [2FA] TwoFactor encontrado:', { id: twoFactor?.id, isActive: twoFactor?.isActive, hasSecret: !!twoFactor?.secret });

      if (!twoFactor || !twoFactor.secret) {
        throw new Error('TOTP não configurado para este usuário');
      }

      // Verificar token
      const verified = speakeasy.totp.verify({
        secret: twoFactor.secret,
        encoding: 'base32',
        token,
        window: 2 // Permite uma janela de tolerância
      });

      console.log('🔐 [2FA] Token verificado:', verified);

      if (!verified) {
        return {
          success: false,
          message: 'Código inválido'
        };
      }

      // Gerar códigos de backup
      const backupCodes = this.generateBackupCodes();
      console.log('🔐 [2FA] Códigos de backup gerados:', backupCodes.length);

      // Ativar TOTP
      const activatedTwoFactor = await this.prisma.userTwoFactor.update({
        where: { id: twoFactor.id },
        data: {
          isActive: true,
          isVerified: true,
          setupCompletedAt: new Date(),
          backupCodes: backupCodes.map(code => ({ code, used: false })),
          lastUsedAt: new Date()
        }
      });

      console.log('✅ [2FA] TOTP ativado com sucesso:', { id: activatedTwoFactor.id, isActive: activatedTwoFactor.isActive });

      return {
        success: true,
        message: 'TOTP ativado com sucesso',
        backupCodes
      };

    } catch (error) {
      console.error('❌ Erro ao verificar TOTP:', error);
      throw error;
    }
  }

  /**
   * Verifica token TOTP para login
   * @param {string} userId - ID do usuário
   * @param {string} token - Token fornecido
   * @returns {Promise<boolean>} Se o token é válido
   */
  async verifyTOTP(userId, token) {
    try {
      if (!this.prisma) await this.init();

      // Log de início com ID único
      const callId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      console.log(`🔐 [verifyTOTP-${callId}] INÍCIO - userId:`, userId, 'token:', token?.substring(0, 2) + '****');

      const twoFactor = await this.prisma.userTwoFactor.findUnique({
        where: {
          userId_type: {
            userId,
            type: 'totp'
          }
        }
      });

      console.log(`🔐 [verifyTOTP-${callId}] TwoFactor encontrado - failedAttempts atual:`, twoFactor?.failedAttempts || 0);

      if (!twoFactor || !twoFactor.isActive || !twoFactor.secret) {
        return false;
      }

      // Verificar se está bloqueado
      if (twoFactor.lockedUntil && new Date() < twoFactor.lockedUntil) {
        throw new Error('2FA temporariamente bloqueado devido a muitas tentativas inválidas');
      }

      // Se o token está vazio ou não foi fornecido, NÃO incrementar failedAttempts
      // Isso acontece quando o backend solicita 2FA pela primeira vez
      if (!token || token.trim() === '') {
        console.log('⚠️ [2FA] Token vazio - não incrementando failedAttempts');
        return false;
      }

      // Verificar token
      const verified = speakeasy.totp.verify({
        secret: twoFactor.secret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (verified) {
        // Reset failed attempts e atualizar último uso
        await this.prisma.userTwoFactor.update({
          where: { id: twoFactor.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
            lastUsedAt: new Date()
          }
        });
        return true;
      } else {
        // Incrementar failed attempts APENAS quando um código válido (não vazio) foi fornecido
        const currentAttempts = twoFactor.failedAttempts;
        console.log(`❌ [2FA] Código inválido fornecido - incrementando failedAttempts de ${currentAttempts} para ${currentAttempts + 1}`);
        console.log(`🔍 [2FA] Stack trace:`, new Error().stack);

        const failedAttempts = currentAttempts + 1;
        const lockedUntil = failedAttempts >= 5
          ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
          : null;

        await this.prisma.userTwoFactor.update({
          where: { id: twoFactor.id },
          data: {
            failedAttempts,
            lockedUntil
          }
        });

        console.log(`✅ [2FA] failedAttempts atualizado para ${failedAttempts} no banco de dados`);

        if (lockedUntil) {
          console.log(`🔒 [2FA] Conta bloqueada após ${failedAttempts} tentativas - desbloqueio em ${lockedUntil.toISOString()}`);
        }

        return false;
      }

    } catch (error) {
      console.error('❌ Erro ao verificar TOTP:', error);
      throw error;
    }
  }

  /**
   * Configura 2FA por email
   * @param {string} userId - ID do usuário
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Configuração criada
   */
  async setupEmailTwoFactor(userId, email) {
    try {
      if (!this.prisma) await this.init();

      const twoFactor = await this.prisma.userTwoFactor.upsert({
        where: {
          userId_type: {
            userId,
            type: 'email'
          }
        },
        update: {
          email,
          isActive: true,
          isVerified: true,
          setupCompletedAt: new Date()
        },
        create: {
          userId,
          type: 'email',
          email,
          isActive: true,
          isVerified: true,
          setupCompletedAt: new Date()
        }
      });

      return twoFactor;

    } catch (error) {
      console.error('❌ Erro ao configurar 2FA por email:', error);
      throw error;
    }
  }

  /**
   * Envia código 2FA por email
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendEmailTwoFactorCode(userId) {
    try {
      if (!this.prisma) await this.init();

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userTwoFactors: {
            where: { type: 'email', isActive: true }
          }
        }
      });

      if (!user || !user.userTwoFactors[0]) {
        throw new Error('2FA por email não configurado');
      }

      const twoFactor = user.userTwoFactors[0];

      // Gerar código de 6 dígitos
      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Salvar código temporariamente
      await this.prisma.userTwoFactor.update({
        where: { id: twoFactor.id },
        data: {
          settings: {
            tempCode: code,
            tempCodeExpiresAt: expiresAt.toISOString()
          }
        }
      });

      // Enviar email
      await emailService.send2FACode(twoFactor.email || user.email, {
        userName: user.name,
        code,
        expiresIn: '10 minutos',
        expiresInMs: 10 * 60 * 1000
      });

      return {
        success: true,
        message: 'Código enviado por email',
        expiresAt
      };

    } catch (error) {
      console.error('❌ Erro ao enviar código 2FA:', error);
      throw error;
    }
  }

  /**
   * Verifica código 2FA enviado por email
   * @param {string} userId - ID do usuário
   * @param {string} code - Código fornecido
   * @returns {Promise<boolean>} Se o código é válido
   */
  async verifyEmailTwoFactorCode(userId, code) {
    try {
      if (!this.prisma) await this.init();

      const twoFactor = await this.prisma.userTwoFactor.findUnique({
        where: {
          userId_type: {
            userId,
            type: 'email'
          }
        }
      });

      if (!twoFactor || !twoFactor.isActive) {
        return false;
      }

      const settings = twoFactor.settings || {};
      const tempCode = settings.tempCode;
      const tempCodeExpiresAt = settings.tempCodeExpiresAt 
        ? new Date(settings.tempCodeExpiresAt) 
        : null;

      if (!tempCode || !tempCodeExpiresAt || new Date() > tempCodeExpiresAt) {
        return false;
      }

      if (tempCode === code) {
        // Limpar código temporário
        await this.prisma.userTwoFactor.update({
          where: { id: twoFactor.id },
          data: {
            settings: {},
            lastUsedAt: new Date(),
            failedAttempts: 0
          }
        });
        return true;
      } else {
        // Incrementar failed attempts
        await this.prisma.userTwoFactor.update({
          where: { id: twoFactor.id },
          data: {
            failedAttempts: { increment: 1 }
          }
        });
        return false;
      }

    } catch (error) {
      console.error('❌ Erro ao verificar código 2FA por email:', error);
      throw error;
    }
  }

  /**
   * Verifica código de backup
   * @param {string} userId - ID do usuário
   * @param {string} backupCode - Código de backup
   * @returns {Promise<Object>} Resultado da verificação { valid: boolean, alreadyUsed: boolean }
   */
  async verifyBackupCode(userId, backupCode) {
    try {
      if (!this.prisma) await this.init();

      console.log(`🔐 [BACKUP] Verificando código de backup para userId: ${userId}, code: ${backupCode}`);

      // Buscar todos os registros 2FA ativos do usuário
      const twoFactorRecords = await this.prisma.userTwoFactor.findMany({
        where: {
          userId,
          isActive: true,
          type: 'totp' // Backup codes são apenas para TOTP
        }
      });

      console.log(`🔐 [BACKUP] Encontrados ${twoFactorRecords.length} registros 2FA`);

      if (!twoFactorRecords || twoFactorRecords.length === 0) {
        console.log('⚠️ [BACKUP] Nenhum registro 2FA ativo encontrado');
        return { valid: false, alreadyUsed: false };
      }

      // Procurar em cada registro se tem o código de backup
      for (const twoFactor of twoFactorRecords) {
        const backupCodes = twoFactor.backupCodes || [];
        console.log(`🔐 [BACKUP] Verificando ${backupCodes.length} códigos de backup`);

        // Verificar se o código existe e se já foi usado
        const foundCode = backupCodes.find(bc => bc.code === backupCode);

        if (foundCode) {
          if (foundCode.used) {
            console.log(`⚠️ [BACKUP] Código encontrado mas já foi utilizado em: ${foundCode.usedAt}`);
            return { valid: false, alreadyUsed: true };
          }

          // Código válido e não usado ainda
          const codeIndex = backupCodes.findIndex(bc => bc.code === backupCode);
          console.log(`✅ [BACKUP] Código de backup válido encontrado no índice ${codeIndex}`);

          // Marcar código como usado E RESETAR bloqueio
          backupCodes[codeIndex].used = true;
          backupCodes[codeIndex].usedAt = new Date().toISOString();

          await this.prisma.userTwoFactor.update({
            where: { id: twoFactor.id },
            data: {
              backupCodes,
              usedBackupCodes: {
                push: backupCode
              },
              lastUsedAt: new Date(),
              // IMPORTANTE: Resetar bloqueio ao usar código de backup
              failedAttempts: 0,
              lockedUntil: null
            }
          });

          console.log('✅ [2FA] Código de backup usado - bloqueio resetado para userId:', userId);
          return { valid: true, alreadyUsed: false };
        }
      }

      console.log('❌ [BACKUP] Código de backup não encontrado');
      return { valid: false, alreadyUsed: false };

    } catch (error) {
      console.error('❌ Erro ao verificar código de backup:', error);
      throw error;
    }
  }

  /**
   * Verifica código 2FA (tenta TOTP primeiro, depois backup)
   * @param {string} userId - ID do usuário
   * @param {string} code - Código fornecido
   * @param {string} method - Método preferencial (opcional)
   * @param {boolean} skipFailedIncrement - Se true, não incrementa failedAttempts (usado internamente)
   * @returns {Promise<Object>} Resultado da verificação
   */
  async verify2FA(userId, code, method = null, skipFailedIncrement = false) {
    try {
      if (!this.prisma) await this.init();

      // Log único para rastrear chamadas
      const callId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      console.log(`🔐 [2FA-${callId}] INÍCIO verificação - userId:`, userId, 'método:', method || 'auto', 'code:', code?.substring(0, 2) + '****');

      // Se método específico foi fornecido
      if (method === 'email') {
        const isValid = await this.verifyEmailTwoFactorCode(userId, code);
        if (isValid) {
          return { success: true, method: 'email' };
        }
        throw new Error('Código de email inválido');
      }

      // Primeiro tentar código de backup (mais rápido e não incrementa contador)
      // Códigos de backup são alfanuméricos de 8 caracteres
      if (code && code.length === 8 && /^[A-F0-9]+$/i.test(code)) {
        console.log('🔐 [2FA] Código parece ser backup (8 chars alfanuméricos), verificando...');
        const backupResult = await this.verifyBackupCode(userId, code.toUpperCase());

        if (backupResult.valid) {
          console.log('✅ [2FA] Código de backup válido');
          return { success: true, method: 'backup' };
        }

        if (backupResult.alreadyUsed) {
          console.log('⚠️ [2FA] Código de backup já foi utilizado');
          throw new Error('Código de backup já utilizado, tente outro!');
        }

        console.log('⚠️ [2FA] Código de backup inválido, tentando TOTP...');
      }

      // Tentar TOTP
      // IMPORTANTE: verifyTOTP incrementa failedAttempts internamente quando falha
      const isValidTOTP = await this.verifyTOTP(userId, code);

      if (isValidTOTP) {
        console.log('✅ [2FA] Código TOTP válido');
        return { success: true, method: 'totp' };
      }

      // Nenhum método funcionou
      // failedAttempts já foi incrementado em verifyTOTP
      console.log('❌ [2FA] Código inválido em todos os métodos');
      throw new Error('Código 2FA inválido');

    } catch (error) {
      console.error('❌ Erro ao verificar código 2FA:', error);
      throw error;
    }
  }

  /**
   * Gera códigos de backup
   * @returns {Array<string>} Lista de códigos
   */
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      // Gerar código de 8 caracteres (letras e números)
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Lista métodos 2FA ativos de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de métodos 2FA
   */
  async getUserTwoFactorMethods(userId) {
    try {
      if (!this.prisma) await this.init();

      const methods = await this.prisma.userTwoFactor.findMany({
        where: {
          userId,
          isActive: true
        },
        select: {
          id: true,
          type: true,
          isVerified: true,
          isActive: true,
          setupCompletedAt: true,
          lastUsedAt: true,
          phoneNumber: true,
          email: true
        }
      });

      console.log('📋 [2FA] Métodos ativos para userId:', userId, '- Total:', methods.length, methods);

      return methods;

    } catch (error) {
      console.error('❌ Erro ao listar métodos 2FA:', error);
      throw error;
    }
  }

  /**
   * Desativa método 2FA
   * @param {string} userId - ID do usuário
   * @param {string} type - Tipo do 2FA
   * @returns {Promise<Object>} Método desativado
   */
  async disableTwoFactor(userId, type) {
    try {
      if (!this.prisma) await this.init();

      const twoFactor = await this.prisma.userTwoFactor.update({
        where: {
          userId_type: {
            userId,
            type
          }
        },
        data: {
          isActive: false,
          deletedAt: new Date()
        }
      });

      console.log('✅ [2FA] Método desativado:', { userId, type });

      return twoFactor;

    } catch (error) {
      console.error('❌ Erro ao desativar 2FA:', error);
      throw error;
    }
  }

  /**
   * Desativa método 2FA (wrapper com mensagem)
   * @param {string} userId - ID do usuário
   * @param {string} method - Tipo do 2FA
   * @returns {Promise<Object>} Resultado da desativação
   */
  async disable2FA(userId, method) {
    try {
      await this.disableTwoFactor(userId, method);

      return {
        success: true,
        message: '2FA desativado com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro ao desativar 2FA:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário tem 2FA ativo
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} Se tem 2FA ativo
   */
  async userHasTwoFactor(userId) {
    try {
      if (!this.prisma) await this.init();

      const count = await this.prisma.userTwoFactor.count({
        where: {
          userId,
          isActive: true,
          isVerified: true
        }
      });

      return count > 0;

    } catch (error) {
      console.error('❌ Erro ao verificar 2FA:', error);
      return false;
    }
  }

  /**
   * Verifica se 2FA é necessário para uma operação específica
   * @param {string} userId - ID do usuário
   * @param {string} operation - Nome da operação (withdraw, transfer, etc)
   * @returns {Promise<boolean>} Se 2FA é necessário para esta operação
   */
  async require2FAForOperation(userId, operation) {
    try {
      if (!this.prisma) await this.init();

      // Se o usuário tem 2FA configurado, sempre requer para operações sensíveis
      const has2FA = await this.userHasTwoFactor(userId);

      if (!has2FA) {
        return false;
      }

      // Lista de operações que sempre requerem 2FA quando configurado
      const sensitiveOperations = [
        'withdraw',
        'transfer',
        'transfer_tokens',
        'change_password',
        'add_api_key',
        'change_2fa_settings',
        'disable_2fa'
      ];

      return sensitiveOperations.includes(operation);

    } catch (error) {
      console.error('❌ Erro ao verificar requisito 2FA para operação:', error);
      return false;
    }
  }
}

module.exports = new TwoFactorService();
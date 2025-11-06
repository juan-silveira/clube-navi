// Nota: Prisma agora vem de req.tenantPrisma (multi-tenant)
// Removido: const prismaConfig = require('../config/prisma');
// Removido: const getPrisma = () => prismaConfig.getPrisma();

// Importar serviços
const jwtService = require('../services/jwt.service');
const redisService = require('../services/redis.service');
const userCacheService = require('../services/userCache.service');
const userService = require('../services/user.service');
const userActionsService = require('../services/userActions.service');
const userCompanyService = require('../services/userCompany.service');
const emailService = require('../services/email.service');
const { DEFAULT_USER_TAXES } = require('../config/defaultTaxes');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validatePassword } = require('../utils/passwordValidation');

/**
 * Autenticar usuário (método auxiliar)
 */
const authenticateUser = async (email, password, prisma) => {
  try {
    // Determinar se é email ou username
    const isEmail = email.includes('@');

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: email.toLowerCase() } : { username: email.toLowerCase() }
    });

    if (!user) {
      return null;
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return null;
  }
};

/**
 * Login do usuário com controle de tentativas
 */
const login = async (req, res) => {
  const prisma = req.tenantPrisma;

  try {
    const { email, password, company_alias } = req.body;
    const companyIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username e senha são obrigatórios'
      });
    }

    // Determinar se é email ou username
    const isEmail = email.includes('@');

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Buscar usuário por email ou username (para verificar tentativas)
    const existingUser = await prisma.user.findUnique({
      where: isEmail ? { email } : { username: email.toLowerCase() }
    });

    // Verificar se usuário está bloqueado por tentativas excessivas
    if (existingUser && existingUser.isBlockedLoginAttempts) {
      // Tentar obter empresa atual para registro
      let currentCompany = null;
      try {
        currentCompany = await userCompanyService.getCurrentCompany(existingUser.id);
      } catch (error) {
        // Ignorar erro silenciosamente para não afetar o fluxo
      }
      const reqWithCompany = { ...req, company: currentCompany };
      
      // Registrar tentativa de login em conta bloqueada
      await userActionsService.logAuth(existingUser.id, 'login_failed', reqWithCompany, {
        status: 'failed',
        errorMessage: 'Account blocked due to excessive failed attempts',
        errorCode: 'ACCOUNT_BLOCKED'
      });
      
      return res.status(423).json({
        success: false,
        message: 'Conta bloqueada devido a muitas tentativas de login incorretas. Entre em contato com o administrador.',
        data: {
          blocked: true,
          lastFailedAttempt: existingUser.lastFailedLoginAt
        }
      });
    }

    // Autenticar usuário
    const user = await authenticateUser(email, password, prisma);
    
    if (!user) {
      // Login falhou - incrementar contador de tentativas se usuário existe
      if (existingUser) {
        const newFailedAttempts = existingUser.failedLoginAttempts + 1;
        const shouldBlock = newFailedAttempts >= 5;
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lastFailedLoginAt: new Date(),
            isBlockedLoginAttempts: shouldBlock
          }
        });

        if (shouldBlock) {
          // Registrar bloqueio da conta
          await userActionsService.logSecurity(existingUser.id, 'account_locked', req, {
            status: 'failed',
            details: { reason: 'Excessive failed login attempts', attempts: newFailedAttempts },
            errorMessage: 'Account locked after 5 failed attempts'
          });
          
          return res.status(423).json({
            success: false,
            message: 'Conta bloqueada devido a 5 tentativas incorretas consecutivas. Entre em contato com o administrador.',
            data: {
              blocked: true,
              attempts: newFailedAttempts
            }
          });
        }

        // Tentar obter empresa atual para registro
        let currentCompany = null;
        try {
          currentCompany = await userCompanyService.getCurrentCompany(existingUser.id);
        } catch (error) {
          // Ignorar erro silenciosamente
        }
        const reqWithCompany = { ...req, company: currentCompany };
        
        // Registrar tentativa de login falhada
        await userActionsService.logAuth(existingUser.id, 'login_failed', reqWithCompany, {
          status: 'failed',
          details: { attempts: newFailedAttempts },
          errorMessage: 'Invalid credentials'
        });

        return res.status(401).json({
          success: false,
          message: `Credenciais inválidas. Tentativas restantes: ${5 - newFailedAttempts}`,
          data: {
            attemptsRemaining: 5 - newFailedAttempts,
            totalAttempts: newFailedAttempts
          }
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    if (!user.isActive) {
      // Tentar obter empresa atual para registro
      let currentCompany = null;
      try {
        currentCompany = await userCompanyService.getCurrentCompany(user.id);
      } catch (error) {
        // Ignorar erro silenciosamente
      }
      const reqWithCompany = { ...req, company: currentCompany };

      // Registrar tentativa de login em conta inativa
      await userActionsService.logAuth(user.id, 'login_failed', reqWithCompany, {
        status: 'failed',
        errorMessage: 'Inactive user account',
        errorCode: 'ACCOUNT_INACTIVE'
      });

      return res.status(403).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    // Verificar se usuário tem 2FA ativo
    console.log('🔐 [LOGIN] Verificando 2FA para usuário:', user.id, user.email);
    const twoFactorService = require('../services/twoFactor.service');
    const has2FA = await twoFactorService.userHasTwoFactor(user.id);
    console.log('🔐 [LOGIN] Usuário tem 2FA?', has2FA);

    if (has2FA) {
      const { twoFactorCode } = req.body;
      console.log('🔐 [LOGIN] Código 2FA fornecido?', !!twoFactorCode);

      // Se tem 2FA mas não forneceu código, retornar que precisa do código
      if (!twoFactorCode) {
        console.log('🔐 [LOGIN] Solicitando código 2FA ao frontend...');
        return res.status(200).json({
          success: false,
          requiresTwoFactor: true,
          message: 'Código 2FA necessário',
          data: {
            userId: user.id,
            email: user.email
          }
        });
      }

      // Verificar código 2FA (TOTP ou backup code)
      try {
        console.log('🔐 [LOGIN] Verificando código 2FA...');
        const verificationResult = await twoFactorService.verify2FA(user.id, twoFactorCode);
        console.log('🔐 [LOGIN] Código 2FA válido?', verificationResult.success, 'método:', verificationResult.method);

        if (!verificationResult.success) {
          // Registrar tentativa falha de 2FA
          await userActionsService.logSecurity(user.id, 'two_factor_failed', req, {
            status: 'failed',
            errorMessage: 'Invalid 2FA code'
          });

          console.log('❌ [LOGIN] Código 2FA inválido');
          return res.status(401).json({
            success: false,
            requiresTwoFactor: true,
            message: 'Código 2FA inválido'
          });
        }

        // Código 2FA válido - registrar sucesso
        console.log('✅ [LOGIN] Código 2FA válido! Prosseguindo com login...');
        await userActionsService.logSecurity(user.id, 'two_factor_verified', req, {
          status: 'success',
          details: { method: verificationResult.method }
        });

      } catch (error) {
        console.error('❌ [LOGIN] Erro ao verificar 2FA:', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Erro ao verificar código 2FA'
        });
      }
    }

    // Login bem-sucedido - resetar contador de tentativas falhas
    if (existingUser && (existingUser.failedLoginAttempts > 0 || existingUser.isBlockedLoginAttempts)) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          failedLoginAttempts: 0,
          lastFailedLoginAt: null,
          isBlockedLoginAttempts: false
        }
      });
      
      // Registrar desbloqueio se estava bloqueado
      if (existingUser.isBlockedLoginAttempts) {
        await userActionsService.logSecurity(user.id, 'account_unlocked', req, {
          details: { reason: 'Successful login after block' }
        });
      }
    }

    // FUNCIONALIDADE DE EMPRESAS REMOVIDA - Comentado para evitar erros
    let currentCompany = null;
    // try {
    //   if (company_alias) {
    //     // Buscar empresa pelo alias fornecido
    //     const targetCompany = await prisma.company.findUnique({
    //       where: { alias: company_alias }
    //     });
    //
    //     if (targetCompany) {
    //       // Verificar se o usuário tem acesso a esta empresa
    //       const userCompanyAccess = await prisma.userCompany.findUnique({
    //         where: {
    //           userId_companyId: {
    //             userId: user.id,
    //             companyId: targetCompany.id
    //           },
    //           status: 'active'
    //         }
    //       });
    //
    //       if (userCompanyAccess) {
    //         currentCompany = {
    //           id: targetCompany.id,
    //           name: targetCompany.name,
    //           alias: targetCompany.alias,
    //           isActive: targetCompany.isActive
    //         };
    //
    //         // Atualizar lastAccessAt para esta empresa (definindo como atual)
    //         await prisma.userCompany.update({
    //           where: {
    //             userId_companyId: {
    //               userId: user.id,
    //               companyId: currentCompany.id
    //             }
    //           },
    //           data: { lastAccessAt: new Date() }
    //         });
    //
    //         console.log(`🏢 Login: Empresa definida via alias "${company_alias}": ${currentCompany.name}`);
    //       } else {
    //         console.warn(`⚠️ Usuário ${user.email} não tem acesso à empresa "${company_alias}"`);
    //       }
    //     } else {
    //       console.warn(`⚠️ Empresa com alias "${company_alias}" não encontrada`);
    //     }
    //   }
    //
    //   // Se não foi possível definir via alias, usar a lógica atual (lastAccessAt)
    //   if (!currentCompany) {
    //     currentCompany = await userCompanyService.getCurrentCompany(user.id);
    //
    //     // Se ainda não há empresa atual, usar a primeira empresa ativa
    //     if (!currentCompany) {
    //       const userWithCompanies = await prisma.user.findUnique({
    //         where: { id: user.id },
    //         include: {
    //           userCompanies: {
    //             where: {
    //               status: 'active',
    //               company: { isActive: true }
    //             },
    //             include: {
    //               company: true
    //             },
    //             orderBy: { linkedAt: 'asc' } // Primeira empresa vinculada
    //           }
    //         }
    //       });
    //
    //       if (userWithCompanies?.userCompanies?.length > 0) {
    //         const firstCompany = userWithCompanies.userCompanies[0];
    //         currentCompany = {
    //           id: firstCompany.company.id,
    //           name: firstCompany.company.name,
    //           alias: firstCompany.company.alias,
    //           isActive: firstCompany.company.isActive
    //         };
    //
    //         // Atualizar lastAccessAt para esta empresa
    //         await prisma.userCompany.update({
    //           where: {
    //             userId_companyId: {
    //               userId: user.id,
    //               companyId: currentCompany.id
    //             }
    //           },
    //           data: { lastAccessAt: new Date() }
    //         });
    //
    //         console.log(`📅 Login: Definindo empresa padrão para ${user.name}: ${currentCompany.name}`);
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.warn('⚠️ Não foi possível obter/definir empresa atual no login:', error.message);
    // }
    
    // Simular req.company para o logging
    const reqWithCompany = { ...req, company: currentCompany };

    // COMENTADO: userActions usa singleton Prisma, não suporta multi-tenant ainda
    // // Registrar login bem-sucedido
    // await userActionsService.logAuth(user.id, 'login', reqWithCompany, {
    //   details: {
    //     userPlan: user.userPlan,
    //     companyName: currentCompany?.name,
    //     companyAlias: currentCompany?.alias
    //   }
    // });

    // Gerar tokens
    const accessToken = jwtService.generateAccessToken(user);
    const refreshToken = jwtService.generateRefreshToken(user);

    // Buscar dados completos do usuário usando tenant Prisma
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        cpf: true,
        phone: true,
        birthDate: true,
        profilePicture: true,
        userType: true,
        merchantStatus: true,
        publicKey: true,
        referralId: true,
        referredBy: true,
        address: true,
        isActive: true,
        accountStatus: true,
        emailConfirmed: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!userData) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do usuário'
      });
    }

    // FUNCIONALIDADE DE EMPRESAS REMOVIDA - Comentado para evitar erros
    // Atualizar último acesso na empresa principal (Coinage) por padrão
    // try {
    //   const userCompanyService = require('../services/userCompany.service');
    //   const companyService = require('../services/company.service');
    //
    //   // Buscar empresa Coinage
    //   const coinageCompany = await companyService.getCompanyByAlias('coinage');
    //   if (coinageCompany) {
    //     await userCompanyService.updateLastActivity(user.id, coinageCompany.id);
    //   }
    // } catch (accessError) {
    //   console.warn('⚠️ Erro ao atualizar último acesso:', accessError.message);
    // }

    // Iniciar cache automático
    try {
      await userCacheService.startAutoCache(user.email);
    } catch (cacheError) {
      console.warn('⚠️ Cache automático não iniciado:', cacheError.message);
    }

    // Resposta de sucesso
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userData,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Logout do usuário
 */
const logout = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?.id;
    const companyIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Adicionar token à blacklist se fornecido
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        await jwtService.blacklistToken(token);
      } catch (blacklistError) {
        console.warn('⚠️ Falha ao adicionar token à blacklist:', blacklistError.message);
      }
    } else {
      console.warn('⚠️ Logout sem token fornecido');
    }

    // Finalizar cache automático
    try {
      await userCacheService.stopAutoCache(userEmail);
    } catch (cacheError) {
      console.warn('⚠️ Erro ao finalizar cache automático:', cacheError.message);
    }

    // Registrar logout
    if (req.user && req.user.id) {
      await userActionsService.logAuth(req.user.id, 'logout', req);
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Alterar senha (primeiro acesso)
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validações básicas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    // Validação de senha forte
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha não atende aos critérios de segurança',
        errors: passwordValidation.errors
      });
    }

    // Buscar usuário atual
    const user = await userService.getUserById(req.user.id, true);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isValidPassword = userService.verifyPassword(currentPassword, user.password, user.email);
    
    if (!isValidPassword) {
      // Registrar tentativa falhada de mudança de senha
      await userActionsService.logSecurity(req.user.id, 'password_changed', req, {
        status: 'failed',
        errorMessage: 'Invalid current password',
        errorCode: 'INVALID_PASSWORD'
      });
      
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha no banco (o userService.updateUser já faz o hash)
    const updateResult = await userService.updateUser(req.user.id, {
      password: newPassword
    });

    if (updateResult.success) {
      // Registrar mudança de senha bem-sucedida
      await userActionsService.logSecurity(req.user.id, 'password_changed', req, {
        details: {
          type: 'password_changed'
        }
      });
      
      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar senha'
      });
    }

  } catch (error) {
    console.error('❌ Erro na troca de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Gerar API Key
 */
const generateApiKey = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validações básicas
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome da API Key é obrigatório'
      });
    }

    // Validar tamanho do nome
    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Nome da API Key deve ter entre 3 e 50 caracteres'
      });
    }

    // Validar formato do nome (apenas letras, números, espaços e hífens)
    const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Nome da API Key deve conter apenas letras, números, espaços, hífens e underscores'
      });
    }

    // Validar descrição se fornecida
    if (description && description.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Descrição deve ter no máximo 200 caracteres'
      });
    }
    
    // Gerar nova API Key
    const apiKeyValue = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = crypto.createHash('sha256').update(apiKeyValue).digest('hex');
    
    // Criar registro da API Key
    const apiKey = await getPrisma().apiKey.create({
      data: {
        key: apiKeyValue,
        keyHash: apiKeyHash,
        name: name,
        description: description || null,
        userId: req.user.id,
        permissions: req.user.permissions || {}
      }
    });
    
    res.json({
      success: true,
      message: 'API Key gerada com sucesso',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        description: apiKey.description,
        apiKey: apiKeyValue, // Retornar apenas uma vez
        createdAt: apiKey.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao gerar API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar API Keys da empresa
 */
const listApiKeys = async (req, res) => {
  try {
    const apiKeys = await getPrisma().apiKey.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      message: 'API Keys listadas com sucesso',
      data: {
        apiKeys: apiKeys
      }
    });
  } catch (error) {
    console.error('Erro ao listar API Keys:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Revogar API Key
 */
const revokeApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    
    if (!apiKeyId) {
      return res.status(400).json({
        success: false,
        message: 'ID da API Key é obrigatório'
      });
    }

    // Buscar API Key
    const apiKey = await getPrisma().apiKey.findFirst({
      where: { 
        id: apiKeyId, 
        userId: req.user.id 
      }
    });
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key não encontrada'
      });
    }

    // Desativar API Key
    const updatedApiKey = await getPrisma().apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false }
    });
    
    res.json({
      success: true,
      message: 'API Key revogada com sucesso',
      data: {
        id: updatedApiKey.id,
        name: updatedApiKey.name
      }
    });
  } catch (error) {
    console.error('Erro ao revogar API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Editar API Key
 */
const editApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    const { name, description } = req.body;

    if (!apiKeyId) {
      return res.status(400).json({
        success: false,
        message: 'ID da API Key é obrigatório'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome da API Key é obrigatório'
      });
    }

    // Buscar API Key
    const apiKey = await getPrisma().apiKey.findFirst({
      where: { 
        id: apiKeyId, 
        userId: req.user.id 
      }
    });
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key não encontrada'
      });
    }

    // Atualizar API Key
    const updatedApiKey = await getPrisma().apiKey.update({
      where: { id: apiKeyId },
      data: {
        name: name,
        description: description || null
      }
    });
    
    res.json({
      success: true,
      message: 'API Key editada com sucesso',
      data: {
        id: updatedApiKey.id,
        name: updatedApiKey.name,
        description: updatedApiKey.description,
        updatedAt: updatedApiKey.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao editar API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Renovar access token usando refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const companyIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    console.log('\ud83d\udd0d [Refresh] Recebida requisição de refresh token:', {
      hasRefreshToken: !!refreshToken,
      tokenLength: refreshToken?.length || 0,
      tokenStart: refreshToken?.substring(0, 20) + '...',
      companyIP,
      userAgent: userAgent?.substring(0, 50)
    });

    if (!refreshToken) {
      console.error('\u274c [Refresh] Refresh token não fornecido');
      return res.status(400).json({
        success: false,
        message: 'Refresh token é obrigatório'
      });
    }

    // Verificar se o refresh token está na blacklist
    const isBlacklisted = await jwtService.isTokenBlacklisted(refreshToken);
    
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }

    // Verificar e decodificar o refresh token
    let decoded;
    try {
      decoded = jwtService.verifyRefreshToken(refreshToken);
      console.log('\ud83d\udd0d [Refresh] Token decodificado com sucesso:', { userId: decoded.id, exp: decoded.exp });
    } catch (verifyError) {
      console.error('\u274c [Refresh] Erro ao verificar refresh token:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Refresh token inv\u00e1lido ou expirado'
      });
    }
    
    // Buscar usuário
    const user = await userService.getUserById(decoded.id);
    console.log('\ud83d\udd0d [Refresh] Usu\u00e1rio encontrado:', { found: !!user, active: user?.isActive });
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar refresh token antigo à blacklist
    try {
      const blacklistSuccess = await jwtService.blacklistToken(refreshToken);
      if (blacklistSuccess) {
        console.log('\ud83d\udcdd [Refresh] Token antigo adicionado à blacklist com sucesso');
      } else {
        console.warn('\u26a0\ufe0f [Refresh] Falha ao adicionar token antigo à blacklist');
      }
    } catch (blacklistError) {
      console.warn('\u26a0\ufe0f [Refresh] Erro ao adicionar token antigo à blacklist:', blacklistError.message);
    }

    // Gerar novos tokens
    const newAccessToken = jwtService.generateAccessToken(user);
    const newRefreshToken = jwtService.generateRefreshToken(user);
    
    console.log('\u2705 [Refresh] Novos tokens gerados com sucesso para usuário:', user.email);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
      }
    });

  } catch (error) {
    console.error('❌ [Refresh] Erro no refresh token:', {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3),
      refreshToken: refreshToken?.substring(0, 20) + '...'
    });
    
    // Retornar erro 401 para refresh token inválidos ao invés de 500
    if (error.message.includes('invalid') || error.message.includes('expired') || error.message.includes('jwt')) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter informações do usuário atual
 */
const getCurrentUser = async (req, res) => {
  try {
    console.log('👤 getCurrentUser - Iniciando...');
    const user = req.user;
    console.log('👤 getCurrentUser - Usuário:', user ? user.id : 'null');
    
    if (!user) {
      console.log('❌ getCurrentUser - Usuário não encontrado no req.user');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
          birthDate: user.birthDate,
          publicKey: user.publicKey || user.public_key,
          blockchainAddress: user.blockchainAddress || user.blockchain_address,
          isActive: user.isActive,
          emailConfirmed: user.emailConfirmed,
          permissions: user.permissions,
          roles: user.roles,
          isApiAdmin: user.isApiAdmin,
          isCompanyAdmin: user.isCompanyAdmin
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Registro de novo usuário
 */
const register = async (req, res) => {
  try {
    const {
      email,
      username,
      phone,
      password,
      userType, // 'consumer' ou 'merchant'
      personType, // 'PF' ou 'PJ'
      // Dados PF
      cpf,
      name,
      firstName,
      lastName,
      // Dados PJ
      cnpj,
      companyName,
      legalRepDocument,
      legalRepDocumentType,
      // Endereço
      address,
      // Opcional
      company_alias,
      referralCode // Código de indicação (username de quem indicou)
    } = req.body;

    // Log do referralCode recebido
    console.log('📝 Registro - referralCode recebido:', referralCode);

    // Validações básicas
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, username e senha são obrigatórios'
      });
    }

    if (!userType || !['consumer', 'merchant'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuário (consumer ou merchant) é obrigatório'
      });
    }

    if (!personType || !['PF', 'PJ'].includes(personType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de pessoa (PF ou PJ) é obrigatório'
      });
    }

    // Validações específicas por tipo
    if (personType === 'PF') {
      if (!cpf || !name) {
        return res.status(400).json({
          success: false,
          message: 'CPF e nome completo são obrigatórios para pessoa física'
        });
      }
    } else if (personType === 'PJ') {
      if (!cnpj || !companyName || !legalRepDocument || !legalRepDocumentType) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ, razão social, documento do representante legal e tipo de documento são obrigatórios para pessoa jurídica'
        });
      }
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Validação de senha forte
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha não atende aos critérios de segurança',
        errors: passwordValidation.errors
      });
    }

    const prisma = req.tenantPrisma;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está em uso'
      });
    }

    // Verificar se username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Este username já está em uso'
      });
    }

    // Para PF, verificar se CPF já existe
    if (personType === 'PF' && cpf) {
      const cleanCpf = cpf.replace(/\D/g, '');
      const existingCpf = await prisma.user.findUnique({
        where: { cpf: cleanCpf }
      });

      if (existingCpf) {
        return res.status(409).json({
          success: false,
          message: 'Este CPF já está cadastrado'
        });
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // NOTA: As chaves blockchain serão geradas após a validação do email
    // Não gerar chaves no registro inicial

    // Validar código de indicação se fornecido e obter ID do indicador
    let referrerId = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { username: referralCode.toLowerCase() },
        select: { id: true, username: true }
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Código de indicação inválido'
        });
      }

      referrerId = referrer.id;
      console.log(`✅ Código de indicação válido: ${referralCode} (ID: ${referrerId})`);
    }

    // Preparar dados do usuário
    let userData = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      userType, // consumer ou merchant
      publicKey: null, // Será preenchido após validação de email
      privateKey: null, // Será preenchido após validação de email
      phone: phone ? phone.replace(/\D/g, '') : null, // Salvar apenas números (opcional)
      isActive: true, // Usuário começa ativo
      emailConfirmed: false, // Email não confirmado inicialmente
      referredBy: referralCode ? referralCode.toLowerCase() : null, // Código de quem indicou
      address: address ? {
        personType,
        ...address,
        referralCode: referralCode ? referralCode.toLowerCase() : null
      } : {
        personType,
        referralCode: referralCode ? referralCode.toLowerCase() : null
      }
    };

    // Adicionar dados específicos por tipo
    if (personType === 'PF') {
      userData.firstName = firstName || (name ? name.split(' ')[0] : '');
      userData.lastName = lastName || (name ? name.split(' ').slice(1).join(' ') : '');
      userData.cpf = cpf.replace(/\D/g, ''); // Remover formatação
    } else if (personType === 'PJ') {
      userData.firstName = companyName ? companyName.split(' ')[0] : ''; // Primeira palavra da razão social
      userData.lastName = companyName ? companyName.split(' ').slice(1).join(' ') : ''; // Resto da razão social
      userData.cpf = cnpj.replace(/\D/g, ''); // CNPJ no campo CPF (ambos são únicos)
      // Adicionar dados PJ no address (que é Json)
      userData.address.cnpj = cnpj.replace(/\D/g, '');
      userData.address.companyName = companyName;
      userData.address.legalRepDocument = legalRepDocument;
      userData.address.legalRepDocumentType = legalRepDocumentType;
    }

    // Debug: Log userData antes de criar
    console.log('📝 userData antes do create:', JSON.stringify(userData, null, 2));

    // Criar usuário
    const user = await prisma.user.create({
      data: userData
    });

    // TENANT SCHEMA: userTaxes não existe no schema tenant, pulando criação de taxas
    // TENANT SCHEMA: Company não existe no schema tenant, pulando vinculação de empresa
    // TENANT SCHEMA: userActions não existe no schema tenant, pulando log de ação

    // Gerar token de confirmação ANTES do try-catch
    let confirmationToken = null;

    // Enviar email de confirmação
    try {
      console.log('📧 Enviando email de confirmação para:', user.email);

      // Gerar token de confirmação
      confirmationToken = await emailService.generateEmailConfirmationToken(user.id, 'default');

      // Enviar email de confirmação
      await emailService.sendEmailConfirmation(user.email, {
        userName: user.name,
        companyName: 'Clube Digital',
        token: confirmationToken,
        userId: user.id,
        companyAlias: 'default',
        baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        expiresIn: '24 horas'
      });

      console.log('✅ Email de confirmação enviado com sucesso');
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email de confirmação:', emailError.message);
      // Não falhar o registro por erro no envio de email
    }

    // Gerar tokens para login automático
    const accessToken = jwtService.generateAccessToken(user);
    const refreshToken = jwtService.generateRefreshToken(user);

    // Buscar dados completos do usuário
    const userData_response = await userService.getUserById(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso. Verifique seu email para confirmar o cadastro.',
      data: {
        user: userData_response,
        accessToken,
        refreshToken,
        emailSent: true,
        requiresEmailConfirmation: true,
        confirmationToken // Retornar token para debug/teste
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Testa a blacklist do Redis
 */
const testBlacklist = async (req, res) => {
  try {
    // Testar conexão
    const connectionTest = await redisService.testConnection();
    
    // Obter estatísticas
    const stats = await redisService.getBlacklistStats();
    
    // Testar adicionar token à blacklist
    const testToken = 'test-token-' + Date.now();
    const added = await redisService.addToBlacklist(testToken, 60); // 60 segundos
    
    // Verificar se foi adicionado
    const isBlacklisted = await redisService.isBlacklisted(testToken);
    
    // Remover token de teste
    await redisService.removeFromBlacklist(testToken);
    
    res.json({
      success: true,
      message: 'Teste da blacklist realizado com sucesso',
      data: {
        connection: connectionTest,
        stats,
        testResults: {
          tokenAdded: added,
          isBlacklisted,
          tokenRemoved: true
        }
      }
    });
  } catch (error) {
    console.error('Erro no teste da blacklist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no teste da blacklist',
      error: error.message
    });
  }
};

/**
 * Desbloquear usuário (função para administradores)
 */
const unblockUser = async (req, res) => {
  const prisma = req.tenantPrisma;
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Desbloquear usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        isBlockedLoginAttempts: false
      }
    });

    res.json({
      success: true,
      message: `Usuário ${email} desbloqueado com sucesso`,
      data: {
        email: user.email,
        name: user.name,
        wasBlocked: user.isBlockedLoginAttempts,
        previousAttempts: user.failedLoginAttempts
      }
    });

  } catch (error) {
    console.error('❌ Erro ao desbloquear usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Bloquear usuário (função para administradores)
 */
const blockUser = async (req, res) => {
  const prisma = req.tenantPrisma;
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Bloquear usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isBlockedLoginAttempts: true,
        lastFailedLoginAt: new Date()
      }
    });

    res.json({
      success: true,
      message: `Usuário ${email} bloqueado com sucesso`,
      data: {
        email: user.email,
        name: user.name,
        wasBlocked: user.isBlockedLoginAttempts,
        blockedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao bloquear usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar usuários bloqueados (função para administradores)
 */
const listBlockedUsers = async (req, res) => {
  const prisma = req.tenantPrisma;
  
  try {
    const blockedUsers = await prisma.user.findMany({
      where: {
        isBlockedLoginAttempts: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        isBlockedLoginAttempts: true
      }
    });

    res.json({
      success: true,
      message: `Encontrados ${blockedUsers.length} usuários bloqueados`,
      data: {
        blockedUsers,
        count: blockedUsers.length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar usuários bloqueados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar empresas disponíveis (público - para tela de login)
 */
const getAvailableCompanies = async (req, res) => {
  const prisma = req.tenantPrisma;
  
  try {
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        alias: {
          not: null // Apenas empresas com alias definido
        }
      },
      select: {
        id: true,
        name: true,
        alias: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Empresas disponíveis listadas com sucesso',
      data: {
        companies
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar empresas disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar usuário por username (para validação de código de indicação)
 */
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username é obrigatório'
      });
    }

    const prisma = req.tenantPrisma;
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        name: true,
        referralDescription: true,
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
        message: 'Usuário não está ativo'
      });
    }

    res.json({
      success: true,
      message: 'Usuário encontrado',
      data: {
        username: user.username,
        name: user.name,
        referralDescription: user.referralDescription || 'Sem descrição'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuário por username:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar descrição de indicação do usuário logado
 */
const updateReferralDescription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { referralDescription } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!referralDescription || referralDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Descrição de indicação é obrigatória'
      });
    }

    if (referralDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Descrição deve ter no máximo 500 caracteres'
      });
    }

    const prisma = req.tenantPrisma;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { referralDescription: referralDescription.trim() },
      select: {
        id: true,
        username: true,
        referralDescription: true
      }
    });

    res.json({
      success: true,
      message: 'Descrição de indicação atualizada com sucesso',
      data: {
        username: updatedUser.username,
        referralDescription: updatedUser.referralDescription
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar descrição de indicação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas de indicações do usuário logado
 */
const getReferralStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const prisma = req.tenantPrisma;

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        referralDescription: true
      }
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Contar usuários indicados (usando o ID do usuário)
    const referralCount = await prisma.user.count({
      where: {
        referralId: currentUser.id
      }
    });

    // Buscar lista de indicados (usando o ID do usuário)
    const referrals = await prisma.user.findMany({
      where: {
        referralId: currentUser.id
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: 'Estatísticas de indicações obtidas com sucesso',
      data: {
        referralCode: currentUser.username,
        referralDescription: currentUser.referralDescription,
        totalReferrals: referralCount,
        recentReferrals: referrals
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de indicações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Validar código de indicação
 */
const validateReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Código de indicação é obrigatório'
      });
    }

    const prisma = req.tenantPrisma;

    // Buscar usuário pelo username (código de indicação)
    const referrer = await prisma.user.findFirst({
      where: {
        username: {
          equals: referralCode,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        referralDescription: true
      }
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Código de indicação não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Código de indicação válido',
      data: {
        referrerId: referrer.id,
        referrerName: referrer.name,
        referrerUsername: referrer.username,
        referralDescription: referrer.referralDescription || 'Nenhuma descrição disponível'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao validar código de indicação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Confirmar email do usuário via token
 */
const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const prisma = req.tenantPrisma;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de confirmação é obrigatório'
      });
    }

    // Verificar e decodificar token
    const decoded = await emailService.verifyEmailConfirmationToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se já foi confirmado
    if (user.emailConfirmed) {
      return res.status(200).json({
        success: true,
        message: 'Email já foi confirmado anteriormente',
        data: { alreadyConfirmed: true }
      });
    }

    // Gerar chaves blockchain se ainda não existem
    let updateData = { emailConfirmed: true };

    if (!user.publicKey || !user.privateKey) {
      console.log('🔑 Gerando chaves blockchain para o usuário:', user.id);
      const { publicKey, privateKey } = userService.generateKeyPair();
      updateData.publicKey = publicKey;
      updateData.privateKey = privateKey;
      console.log('✅ Chaves geradas - PublicKey:', publicKey);
    }

    // Atualizar status de confirmação e chaves
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    // Limpar cache do usuário
    await userCacheService.clearUserCache(user.id);

    // Registrar ação
    await userActionsService.logAuth(user.id, 'email_confirmed', req, {
      status: 'success',
      keysGenerated: !user.publicKey
    });

    res.status(200).json({
      success: true,
      message: 'Email confirmado com sucesso!',
      data: { confirmed: true }
    });

  } catch (error) {
    console.error('❌ Erro ao confirmar email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar email'
    });
  }
};

/**
 * Reenviar email de confirmação
 */
const resendConfirmationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const prisma = req.tenantPrisma;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se já foi confirmado
    if (user.emailConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Email já está confirmado'
      });
    }

    // Gerar novo token
    const confirmationToken = await emailService.generateEmailConfirmationToken(user.id, 'default');

    // Enviar email
    await emailService.sendEmailConfirmation(user.email, {
      userName: user.name,
      companyName: 'Clube Digital',
      token: confirmationToken,
      userId: user.id,
      companyAlias: 'default',
      baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8033',
      expiresIn: '24 horas'
    });

    res.status(200).json({
      success: true,
      message: 'Email de confirmação reenviado com sucesso',
      data: {
        confirmationToken // Retornar token para debug/teste
      }
    });

  } catch (error) {
    console.error('❌ Erro ao reenviar email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reenviar email de confirmação'
    });
  }
};

/**
 * Verificar status de confirmação de email
 */
const checkEmailConfirmation = async (req, res) => {
  try {
    const userId = req.user?.id;
    const prisma = req.tenantPrisma;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailConfirmed: true, email: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        emailConfirmed: user.emailConfirmed,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar confirmação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status de confirmação'
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  changePassword,
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  editApiKey,
  refreshToken,
  getCurrentUser,
  testBlacklist,
  blockUser,
  unblockUser,
  listBlockedUsers,
  getAvailableCompanies,
  getUserByUsername,
  updateReferralDescription,
  getReferralStats,
  confirmEmail,
  resendConfirmationEmail,
  checkEmailConfirmation,
  validateReferralCode
};
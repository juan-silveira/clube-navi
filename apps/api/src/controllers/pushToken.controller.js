/**
 * Controller para gerenciar tokens de push notification dos usuários
 */

const { PrismaClient } = require('../generated/prisma-tenant');

/**
 * Registrar ou atualizar token de push do usuário
 */
exports.registerPushToken = async (req, res) => {
  const { token, platform } = req.body;
  const userId = req.user.id;

  if (!token || !platform) {
    return res.status(400).json({
      success: false,
      error: 'Token e plataforma são obrigatórios'
    });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.tenantDatabaseUrl
      }
    }
  });

  try {
    // Verificar se o token já existe
    const existingToken = await prisma.userPushToken.findUnique({
      where: { token }
    });

    if (existingToken) {
      // Atualizar token existente
      const updatedToken = await prisma.userPushToken.update({
        where: { token },
        data: {
          userId, // Atualizar para o usuário atual (caso tenha mudado de dono)
          platform,
          isActive: true,
          updatedAt: new Date()
        }
      });

      await prisma.$disconnect();

      return res.json({
        success: true,
        message: 'Token atualizado com sucesso',
        data: {
          id: updatedToken.id,
          platform: updatedToken.platform
        }
      });
    }

    // Criar novo token
    const newToken = await prisma.userPushToken.create({
      data: {
        userId,
        token,
        platform,
        isActive: true
      }
    });

    await prisma.$disconnect();

    res.status(201).json({
      success: true,
      message: 'Token registrado com sucesso',
      data: {
        id: newToken.id,
        platform: newToken.platform
      }
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao registrar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar token'
    });
  }
};

/**
 * Remover token de push do usuário
 */
exports.removePushToken = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token é obrigatório'
    });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.tenantDatabaseUrl
      }
    }
  });

  try {
    // Desativar o token ao invés de deletar (para histórico)
    await prisma.userPushToken.updateMany({
      where: {
        token,
        userId
      },
      data: {
        isActive: false
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Token removido com sucesso'
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao remover token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover token'
    });
  }
};

/**
 * Listar tokens do usuário
 */
exports.listUserTokens = async (req, res) => {
  const userId = req.user.id;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.tenantDatabaseUrl
      }
    }
  });

  try {
    const tokens = await prisma.userPushToken.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        id: true,
        platform: true,
        createdAt: true,
        updatedAt: true
        // Não retornar o token por segurança
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao listar tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar tokens'
    });
  }
};

/**
 * Testar envio de push notification (para debug)
 */
exports.testPushNotification = async (req, res) => {
  const userId = req.user.id;
  const { title, body } = req.body;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: req.tenantDatabaseUrl
      }
    }
  });

  try {
    const fcmService = require('../services/fcm.service');

    // Buscar tokens do usuário
    const userTokens = await prisma.userPushToken.findMany({
      where: {
        userId,
        isActive: true
      }
    });

    if (userTokens.length === 0) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        error: 'Nenhum token de push encontrado para este usuário'
      });
    }

    // Enviar notificação de teste
    const tokens = userTokens.map(t => t.token);
    const result = await fcmService.sendToMultipleTokens(
      tokens,
      {
        title: title || 'Teste de Notificação',
        body: body || 'Esta é uma notificação de teste do Clube Digital'
      },
      {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    );

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Notificação de teste enviada',
      data: {
        totalTokens: tokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });
  } catch (error) {
    await prisma.$disconnect();
    console.error('Erro ao testar push notification:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar push notification'
    });
  }
};

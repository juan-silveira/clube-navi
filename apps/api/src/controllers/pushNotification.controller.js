const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fcmService = require('../services/fcm.service');

// Configuração de upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/push-notifications');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF)'));
    }
  }
});

/**
 * Criar e enviar notificação push
 */
const createPushNotification = async (req, res) => {
  const prisma = req.tenantPrisma;
  const tenantId = req.tenant.id;

  try {
    const {
      title,
      description,
      pageTitle,
      pageDescription,
      code,
      rules,
      enableButton,
      buttonType,
      targetModule,
      externalLink,
      buttonText,
      cep,
      radius,
      cpfList,
      userIds,
      scheduledAt // Data/hora para agendamento
    } = req.body;

    // Validações
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Título e descrição são obrigatórios'
      });
    }

    // Processar uploads
    const logo = req.files?.logo ? req.files.logo[0].filename : null;
    const banner = req.files?.banner ? req.files.banner[0].filename : null;

    // Determinar público-alvo
    let targetUserIds = [];

    // 1. Usuários por geolocalização (CEP + raio)
    if (cep && radius) {
      // Aqui você implementaria a lógica de geocoding e busca por raio
      // Por enquanto, vamos buscar usuários com CEPs próximos
      const cepPrefix = cep.substring(0, 5); // Primeiros 5 dígitos do CEP

      const usersByLocation = await prisma.users.findMany({
        where: {
          address: {
            path: ['zipCode'],
            string_starts_with: cepPrefix
          },
          isActive: true,
          accountStatus: 'active'
        },
        select: { id: true }
      });

      targetUserIds.push(...usersByLocation.map(u => u.id));
    }

    // 2. Usuários por CPF
    if (cpfList) {
      try {
        const cpfs = JSON.parse(cpfList);
        if (Array.isArray(cpfs) && cpfs.length > 0) {
          const usersByCpf = await prisma.users.findMany({
            where: {
              cpf: { in: cpfs },
              isActive: true,
              accountStatus: 'active'
            },
            select: { id: true }
          });

          targetUserIds.push(...usersByCpf.map(u => u.id));
        }
      } catch (error) {
        console.error('Erro ao processar lista de CPFs:', error);
      }
    }

    // 3. Usuários específicos selecionados
    if (userIds) {
      try {
        const selectedIds = JSON.parse(userIds);
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          targetUserIds.push(...selectedIds);
        }
      } catch (error) {
        console.error('Erro ao processar IDs de usuários:', error);
      }
    }

    // Remover duplicatas
    targetUserIds = [...new Set(targetUserIds)];

    if (targetUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum usuário encontrado para enviar a notificação'
      });
    }

    // Verificar se é campanha agendada
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const campaignStatus = isScheduled ? 'scheduled' : 'processing';

    // Criar registro da campanha
    const campaign = await prisma.pushNotificationCampaigns.create({
      data: {
        tenantId,
        title,
        description,
        pageTitle,
        pageDescription,
        code,
        rules,
        logoUrl: logo ? `/uploads/push-notifications/${logo}` : null,
        bannerUrl: banner ? `/uploads/push-notifications/${banner}` : null,
        enableButton: enableButton === 'true',
        buttonType: buttonType || null,
        targetModule: targetModule || null,
        externalLink: externalLink || null,
        buttonText: buttonText || null,
        geolocation: cep ? { cep, radius: Number(radius) } : null,
        targetUserCount: targetUserIds.length,
        status: campaignStatus,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      }
    });

    // Se for campanha agendada, retornar sem enviar agora
    if (isScheduled) {
      return res.status(201).json({
        success: true,
        message: `Campanha agendada com sucesso para ${new Date(scheduledAt).toLocaleString('pt-BR')}`,
        data: {
          campaignId: campaign.id,
          status: 'scheduled',
          scheduledAt: campaign.scheduledAt,
          totalTargeted: targetUserIds.length
        }
      });
    }

    // Buscar tokens de push dos usuários
    const userPushTokens = await prisma.userPushTokens.findMany({
      where: {
        userId: { in: targetUserIds },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Preparar payload da notificação
    const notificationPayload = {
      notification: {
        title,
        body: description
      },
      data: {
        type: 'campaign',
        campaignId: campaign.id,
        pageTitle: pageTitle || '',
        pageDescription: pageDescription || '',
        code: code || '',
        rules: rules || '',
        logoUrl: logo ? `/uploads/push-notifications/${logo}` : '',
        bannerUrl: banner ? `/uploads/push-notifications/${banner}` : '',
        enableButton: String(enableButton === 'true'),
        buttonType: buttonType || '',
        targetModule: targetModule || '',
        externalLink: externalLink || '',
        buttonText: buttonText || ''
      }
    };

    // Enviar notificações usando FCM
    let successCount = 0;
    let failureCount = 0;
    const invalidTokens = [];

    // Preparar dados da notificação para FCM
    const notification = {
      title,
      body: description
    };

    const data = {
      type: 'campaign',
      campaignId: campaign.id,
      pageTitle: pageTitle || '',
      pageDescription: pageDescription || '',
      code: code || '',
      rules: rules || '',
      logoUrl: campaign.logoUrl || '',
      bannerUrl: campaign.bannerUrl || '',
      enableButton: String(enableButton === 'true'),
      buttonType: buttonType || '',
      targetModule: targetModule || '',
      externalLink: externalLink || '',
      buttonText: buttonText || ''
    };

    // Usar imagem de banner se disponível
    const imageUrl = campaign.bannerUrl ?
      `${process.env.API_URL || 'http://localhost:8033'}${campaign.bannerUrl}` : null;

    // Enviar em lote para melhor performance
    const tokens = userPushTokens.map(t => t.token);
    const userTokenMap = {};
    userPushTokens.forEach(t => {
      userTokenMap[t.token] = t;
    });

    if (tokens.length > 0) {
      console.log(`📲 Enviando push para ${tokens.length} tokens via FCM...`);

      const result = await fcmService.sendToMultipleTokens(
        tokens,
        notification,
        data,
        imageUrl
      );

      // Processar resultados individuais
      for (const sendResult of result.results) {
        const tokenData = userTokenMap[sendResult.token];

        if (sendResult.success) {
          // Registrar envio bem-sucedido
          await prisma.pushNotificationLogs.create({
            data: {
              campaignId: campaign.id,
              userId: tokenData.userId,
              pushToken: sendResult.token,
              status: 'sent',
              sentAt: new Date()
            }
          });

          successCount++;
        } else {
          // Registrar falha
          await prisma.pushNotificationLogs.create({
            data: {
              campaignId: campaign.id,
              userId: tokenData.userId,
              pushToken: sendResult.token,
              status: 'failed',
              error: sendResult.error || 'Unknown error',
              sentAt: new Date()
            }
          });

          failureCount++;

          // Marcar token como inválido se necessário
          if (sendResult.isInvalidToken) {
            invalidTokens.push(sendResult.token);
          }
        }
      }

      // Desativar tokens inválidos
      if (invalidTokens.length > 0) {
        await prisma.userPushTokens.updateMany({
          where: {
            token: { in: invalidTokens }
          },
          data: {
            isActive: false
          }
        });

        console.log(`🗑️ ${invalidTokens.length} tokens inválidos foram desativados`);
      }
    }

    // Atualizar campanha com resultados
    await prisma.pushNotificationCampaigns.update({
      where: { id: campaign.id },
      data: {
        status: 'completed',
        sentCount: successCount,
        failedCount: failureCount,
        completedAt: new Date()
      }
    });

    return res.status(201).json({
      success: true,
      message: `Notificação enviada com sucesso para ${successCount} usuários`,
      data: {
        campaignId: campaign.id,
        sentCount: successCount,
        failedCount: failureCount,
        totalTargeted: targetUserIds.length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar campanha de push:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar campanha de push',
      error: error.message
    });
  }
};

/**
 * Listar campanhas de push
 */
const listPushCampaigns = async (req, res) => {
  const prisma = req.tenantPrisma;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    const [campaigns, total] = await Promise.all([
      prisma.pushNotificationCampaigns.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              logs: true
            }
          }
        }
      }),
      prisma.pushNotificationCampaigns.count()
    ]);

    return res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar campanhas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar campanhas',
      error: error.message
    });
  }
};

/**
 * Obter detalhes de uma campanha
 */
const getCampaignDetails = async (req, res) => {
  const prisma = req.tenantPrisma;
  const { id } = req.params;

  try {
    const campaign = await prisma.pushNotificationCampaigns.findUnique({
      where: { id },
      include: {
        logs: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    return res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('❌ Erro ao buscar campanha:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar campanha',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  createPushNotification,
  listPushCampaigns,
  getCampaignDetails
};

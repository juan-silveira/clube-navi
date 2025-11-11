/**
 * Club Admin Push Notifications Routes
 * Criar e enviar notificações push para membros do clube
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configurar multer para upload de imagens
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
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, SVG)'));
    }
  }
});

/**
 * POST /api/club-admin/push-notifications/upload-image
 * Upload de logo ou banner para notificação
 */
router.post('/upload-image', authenticateClubAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    const imageUrl = `/uploads/push-notifications/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ [Push Notifications Upload] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da imagem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/push-notifications
 * Criar nova campanha de notificação push
 */
router.post('/', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const clubAdmin = req.clubAdmin;
    const {
      title,
      description,
      pageTitle,
      pageDescription,
      code,
      rules,
      logoUrl,
      bannerUrl,
      enableButton,
      buttonType,
      targetModule,
      externalLink,
      buttonText,
      geolocation,
      targetUserIds,
      scheduledAt
    } = req.body;

    // Validações
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Título e descrição são obrigatórios'
      });
    }

    if (!targetUserIds || !Array.isArray(targetUserIds) || targetUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selecione pelo menos um usuário'
      });
    }

    // Criar campanha
    const campaign = await clubPrisma.pushNotificationCampaign.create({
      data: {
        title,
        description,
        pageTitle,
        pageDescription,
        code,
        rules,
        logoUrl,
        bannerUrl,
        enableButton: enableButton || false,
        buttonType,
        targetModule,
        externalLink,
        buttonText,
        geolocation,
        targetUserIds,
        targetUserCount: targetUserIds.length,
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: clubAdmin.id
      }
    });

    console.log(`✅ [PUSH NOTIFICATIONS] Campanha criada: ${campaign.id}`);

    res.json({
      success: true,
      message: 'Campanha criada com sucesso',
      data: campaign
    });

  } catch (error) {
    console.error('❌ [Push Notifications Create] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar campanha',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/club-admin/push-notifications/:id/send
 * Enviar notificação push para os usuários da campanha
 */
router.post('/:id/send', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { id } = req.params;
    const { Expo } = require('expo-server-sdk');
    const expo = new Expo();

    // Buscar campanha
    const campaign = await clubPrisma.pushNotificationCampaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    if (campaign.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Campanha já foi enviada'
      });
    }

    // Atualizar status para processing
    await clubPrisma.pushNotificationCampaign.update({
      where: { id },
      data: { status: 'processing' }
    });

    // Buscar tokens push dos usuários
    const userTokens = await clubPrisma.userPushToken.findMany({
      where: {
        userId: { in: campaign.targetUserIds },
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (userTokens.length === 0) {
      await clubPrisma.pushNotificationCampaign.update({
        where: { id },
        data: {
          status: 'failed',
          failedCount: campaign.targetUserCount
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Nenhum usuário com token push encontrado'
      });
    }

    console.log(`📱 [PUSH NOTIFICATIONS] Enviando notificações para ${userTokens.length} dispositivos...`);

    let successCount = 0;
    let failureCount = 0;
    const messages = [];

    // Preparar mensagens
    for (const userToken of userTokens) {
      if (!Expo.isExpoPushToken(userToken.token)) {
        console.warn(`⚠️ [PUSH NOTIFICATIONS] Token inválido: ${userToken.token}`);
        failureCount++;

        await clubPrisma.pushNotificationLog.create({
          data: {
            campaignId: campaign.id,
            userId: userToken.userId,
            pushToken: userToken.token,
            status: 'failed',
            error: 'Token push inválido',
            sentAt: new Date()
          }
        });
        continue;
      }

      messages.push({
        to: userToken.token,
        sound: 'default',
        title: campaign.title,
        body: campaign.description,
        data: {
          campaignId: campaign.id,
          pageTitle: campaign.pageTitle,
          pageDescription: campaign.pageDescription,
          code: campaign.code,
          rules: campaign.rules,
          logoUrl: campaign.logoUrl,
          bannerUrl: campaign.bannerUrl,
          enableButton: campaign.enableButton,
          buttonType: campaign.buttonType,
          targetModule: campaign.targetModule,
          externalLink: campaign.externalLink,
          buttonText: campaign.buttonText
        }
      });
    }

    // Enviar notificações em chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('❌ [PUSH NOTIFICATIONS] Erro ao enviar chunk:', error);
      }
    }

    // Processar tickets
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const userToken = userTokens[i];

      if (ticket.status === 'ok') {
        successCount++;
        await clubPrisma.pushNotificationLog.create({
          data: {
            campaignId: campaign.id,
            userId: userToken.userId,
            pushToken: userToken.token,
            status: 'sent',
            sentAt: new Date()
          }
        });
        console.log(`✅ [PUSH NOTIFICATIONS] Enviada para ${userToken.user.firstName} ${userToken.user.lastName}`);
      } else {
        failureCount++;
        await clubPrisma.pushNotificationLog.create({
          data: {
            campaignId: campaign.id,
            userId: userToken.userId,
            pushToken: userToken.token,
            status: 'failed',
            error: ticket.message || 'Erro desconhecido',
            sentAt: new Date()
          }
        });
        console.error(`❌ [PUSH NOTIFICATIONS] Falha para ${userToken.user.firstName}: ${ticket.message}`);
      }
    }

    // Atualizar campanha
    const finalStatus = successCount > 0 ? 'completed' : 'failed';
    await clubPrisma.pushNotificationCampaign.update({
      where: { id },
      data: {
        status: finalStatus,
        sentCount: successCount,
        failedCount: failureCount,
        completedAt: new Date()
      }
    });

    console.log(`📊 [PUSH NOTIFICATIONS] Resultado: ${successCount} enviadas, ${failureCount} falharam`);

    res.json({
      success: true,
      message: `Notificações enviadas: ${successCount} sucesso, ${failureCount} falhas`,
      data: {
        totalSent: successCount,
        totalFailed: failureCount
      }
    });

  } catch (error) {
    console.error('❌ [Push Notifications Send] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar notificações',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/push-notifications
 * Listar campanhas de notificação push
 */
router.get('/', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) {
      where.status = status;
    }

    // Buscar total de campanhas
    const total = await clubPrisma.pushNotificationCampaign.count({ where });

    // Buscar campanhas com paginação
    const campaigns = await clubPrisma.pushNotificationCampaign.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        targetUserCount: true,
        sentCount: true,
        failedCount: true,
        status: true,
        createdAt: true,
        scheduledAt: true,
        completedAt: true
      }
    });

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ [Push Notifications List] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar campanhas'
    });
  }
});

/**
 * GET /api/club-admin/push-notifications/:id
 * Obter detalhes de uma campanha
 */
router.get('/:id', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { id } = req.params;

    const campaign = await clubPrisma.pushNotificationCampaign.findUnique({
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
          orderBy: {
            sentAt: 'desc'
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('❌ [Push Notifications Get] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar campanha'
    });
  }
});

/**
 * DELETE /api/club-admin/push-notifications/:id
 * Deletar uma campanha (apenas se status for draft)
 */
router.delete('/:id', authenticateClubAdmin, async (req, res) => {
  try {
    const clubPrisma = req.clubPrisma;
    const { id } = req.params;

    const campaign = await clubPrisma.pushNotificationCampaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Apenas campanhas em rascunho podem ser deletadas'
      });
    }

    await clubPrisma.pushNotificationCampaign.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Campanha deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ [Push Notifications Delete] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar campanha'
    });
  }
});

module.exports = router;

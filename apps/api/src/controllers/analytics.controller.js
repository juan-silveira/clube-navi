/**
 * Analytics Controller
 *
 * Endpoints para rastreamento de eventos e visualização de analytics
 */

const analyticsService = require('../services/analytics.service');

/**
 * Rastrear evento genérico
 */
exports.trackEvent = async (req, res) => {
  const prisma = req.tenantPrisma;
  const userId = req.user?.id || null;

  try {
    const {
      sessionId,
      eventType,
      eventName,
      category,
      pagePath,
      pageTitle,
      referrer,
      metadata
    } = req.body;

    if (!eventType || !eventName) {
      return res.status(400).json({
        success: false,
        message: 'eventType e eventName são obrigatórios'
      });
    }

    const result = await analyticsService.trackEvent({
      prisma,
      userId,
      sessionId,
      eventType,
      eventName,
      category,
      pagePath,
      pageTitle,
      referrer,
      metadata,
      req
    });

    return res.json({
      success: true,
      message: 'Evento rastreado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('❌ Error tracking event:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao rastrear evento',
      error: error.message
    });
  }
};

/**
 * Rastrear page view
 */
exports.trackPageView = async (req, res) => {
  const prisma = req.tenantPrisma;
  const userId = req.user?.id || null;

  try {
    const {
      sessionId,
      pagePath,
      pageTitle,
      referrer
    } = req.body;

    if (!pagePath) {
      return res.status(400).json({
        success: false,
        message: 'pagePath é obrigatório'
      });
    }

    await analyticsService.trackPageView({
      prisma,
      userId,
      sessionId,
      pagePath,
      pageTitle,
      referrer,
      req
    });

    return res.json({
      success: true,
      message: 'Page view rastreado'
    });
  } catch (error) {
    console.error('❌ Error tracking page view:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao rastrear page view',
      error: error.message
    });
  }
};

/**
 * Rastrear clique
 */
exports.trackClick = async (req, res) => {
  const prisma = req.tenantPrisma;
  const userId = req.user?.id || null;

  try {
    const {
      sessionId,
      elementId,
      elementText,
      elementClass,
      pagePath,
      metadata
    } = req.body;

    await analyticsService.trackClick({
      prisma,
      userId,
      sessionId,
      elementId,
      elementText,
      elementClass,
      pagePath,
      metadata,
      req
    });

    return res.json({
      success: true,
      message: 'Clique rastreado'
    });
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao rastrear clique',
      error: error.message
    });
  }
};

/**
 * Criar ou atualizar sessão
 */
exports.createSession = async (req, res) => {
  const prisma = req.tenantPrisma;
  const userId = req.user?.id || null;

  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'sessionToken é obrigatório'
      });
    }

    const session = await analyticsService.createOrUpdateSession({
      prisma,
      userId,
      sessionToken,
      req
    });

    return res.json({
      success: true,
      message: 'Sessão criada/atualizada',
      data: session
    });
  } catch (error) {
    console.error('❌ Error creating session:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar sessão',
      error: error.message
    });
  }
};

/**
 * Rastrear abertura de notificação
 */
exports.trackNotificationOpen = async (req, res) => {
  const prisma = req.tenantPrisma;
  const userId = req.user?.id || null;

  try {
    const { campaignId, notificationLogId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'campaignId é obrigatório'
      });
    }

    await analyticsService.trackNotificationOpen({
      prisma,
      userId,
      campaignId,
      notificationLogId,
      req
    });

    return res.json({
      success: true,
      message: 'Abertura de notificação rastreada'
    });
  } catch (error) {
    console.error('❌ Error tracking notification open:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao rastrear abertura',
      error: error.message
    });
  }
};

/**
 * Rastrear clique em notificação
 */
exports.trackNotificationClick = async (req, res) => {
  const prisma = req.tenantPrisma;
  const userId = req.user?.id || null;

  try {
    const {
      campaignId,
      notificationLogId,
      buttonType,
      targetModule
    } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'campaignId é obrigatório'
      });
    }

    await analyticsService.trackNotificationClick({
      prisma,
      userId,
      campaignId,
      notificationLogId,
      buttonType,
      targetModule,
      req
    });

    return res.json({
      success: true,
      message: 'Clique em notificação rastreado'
    });
  } catch (error) {
    console.error('❌ Error tracking notification click:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao rastrear clique',
      error: error.message
    });
  }
};

/**
 * Obter estatísticas gerais de analytics
 */
exports.getStats = async (req, res) => {
  const prisma = req.tenantPrisma;

  try {
    const {
      startDate,
      endDate,
      userId,
      eventType
    } = req.query;

    const stats = await analyticsService.getStats(prisma, {
      startDate,
      endDate,
      userId,
      eventType
    });

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
};

/**
 * Obter eventos detalhados
 */
exports.getEvents = async (req, res) => {
  const prisma = req.tenantPrisma;

  try {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      userId,
      eventType,
      eventName,
      category
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {};

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    if (userId) {
      where.userId = userId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (eventName) {
      where.eventName = eventName;
    }

    if (category) {
      where.category = category;
    }

    const [events, total] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.analyticsEvent.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting events:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter eventos',
      error: error.message
    });
  }
};

/**
 * Obter sessões de usuários
 */
exports.getSessions = async (req, res) => {
  const prisma = req.tenantPrisma;

  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      userId
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {};

    if (startDate) {
      where.startedAt = { ...where.startedAt, gte: new Date(startDate) };
    }

    if (endDate) {
      where.startedAt = { ...where.startedAt, lte: new Date(endDate) };
    }

    if (userId) {
      where.userId = userId;
    }

    const [sessions, total] = await Promise.all([
      prisma.userSession.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { startedAt: 'desc' },
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
      }),
      prisma.userSession.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter sessões',
      error: error.message
    });
  }
};

/**
 * Obter analytics de campanhas push
 */
exports.getCampaignAnalytics = async (req, res) => {
  const prisma = req.tenantPrisma;
  const { campaignId } = req.params;

  try {
    const [
      campaign,
      totalSent,
      totalOpened,
      totalClicked,
      opensByDay,
      clicksByDay
    ] = await Promise.all([
      // Dados da campanha
      prisma.pushNotificationCampaign.findUnique({
        where: { id: campaignId }
      }),

      // Total enviado
      prisma.pushNotificationLog.count({
        where: { campaignId, status: 'sent' }
      }),

      // Total aberto
      prisma.pushNotificationLog.count({
        where: {
          campaignId,
          status: 'sent',
          openedAt: { not: null }
        }
      }),

      // Total clicado
      prisma.pushNotificationLog.count({
        where: {
          campaignId,
          status: 'sent',
          clickedAt: { not: null }
        }
      }),

      // Aberturas por dia (últimos 7 dias)
      prisma.$queryRaw`
        SELECT DATE(opened_at) as date, COUNT(*) as count
        FROM push_notification_logs
        WHERE campaign_id = ${campaignId}::uuid
          AND opened_at IS NOT NULL
          AND opened_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(opened_at)
        ORDER BY date DESC
      `,

      // Cliques por dia (últimos 7 dias)
      prisma.$queryRaw`
        SELECT DATE(clicked_at) as date, COUNT(*) as count
        FROM push_notification_logs
        WHERE campaign_id = ${campaignId}::uuid
          AND clicked_at IS NOT NULL
          AND clicked_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(clicked_at)
        ORDER BY date DESC
      `
    ]);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : 0;
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : 0;
    const clickThroughRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(2) : 0;

    return res.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          createdAt: campaign.createdAt,
          completedAt: campaign.completedAt
        },
        metrics: {
          totalSent,
          totalOpened,
          totalClicked,
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          clickThroughRate: parseFloat(clickThroughRate)
        },
        trends: {
          opensByDay: opensByDay.map(row => ({
            date: row.date,
            count: Number(row.count)
          })),
          clicksByDay: clicksByDay.map(row => ({
            date: row.date,
            count: Number(row.count)
          }))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting campaign analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter analytics da campanha',
      error: error.message
    });
  }
};

module.exports = exports;

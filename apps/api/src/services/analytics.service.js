/**
 * Analytics Service
 *
 * Serviço central para rastreamento de eventos e analytics da plataforma
 */

const UAParser = require('ua-parser-js');

class AnalyticsService {
  constructor() {
    this.batchQueue = [];
    this.batchSize = 50;
    this.flushInterval = 5000; // Flush a cada 5 segundos
    this.startBatchProcessor();
  }

  /**
   * Rastrear evento
   */
  async trackEvent({
    prisma,
    userId = null,
    sessionId = null,
    eventType,
    eventName,
    category = null,
    pagePath = null,
    pageTitle = null,
    referrer = null,
    metadata = null,
    req = null // Request do Express (para extrair info do device/browser)
  }) {
    try {
      // Extrair informações do request se disponível
      let deviceInfo = {};
      let ipAddress = null;

      if (req) {
        deviceInfo = this.extractDeviceInfo(req);
        ipAddress = this.getClientIp(req);
      }

      // Criar evento
      const event = {
        userId,
        sessionId,
        eventType,
        eventName,
        category,
        pagePath,
        pageTitle,
        referrer,
        metadata: metadata ? metadata : null,
        platform: deviceInfo.platform || null,
        deviceType: deviceInfo.deviceType || null,
        browser: deviceInfo.browser || null,
        os: deviceInfo.os || null,
        ipAddress
      };

      // Adicionar à fila de batch
      this.batchQueue.push({ prisma, event });

      // Se atingiu o tamanho do batch, fazer flush imediatamente
      if (this.batchQueue.length >= this.batchSize) {
        await this.flushBatch();
      }

      return { success: true, eventId: 'queued' };
    } catch (error) {
      console.error('❌ Error tracking event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Criar ou atualizar sessão do usuário
   */
  async createOrUpdateSession({
    prisma,
    userId = null,
    sessionToken,
    req = null
  }) {
    try {
      const deviceInfo = req ? this.extractDeviceInfo(req) : {};
      const ipAddress = req ? this.getClientIp(req) : null;

      // Buscar sessão existente
      let session = await prisma.userSession.findUnique({
        where: { sessionToken }
      });

      if (session) {
        // Atualizar sessão existente
        const now = new Date();
        const duration = Math.floor((now - session.startedAt) / 1000);

        session = await prisma.userSession.update({
          where: { sessionToken },
          data: {
            lastActivityAt: now,
            duration,
            interactions: { increment: 1 }
          }
        });
      } else {
        // Criar nova sessão
        session = await prisma.userSession.create({
          data: {
            userId,
            sessionToken,
            platform: deviceInfo.platform,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ipAddress
          }
        });
      }

      return session;
    } catch (error) {
      console.error('❌ Error creating/updating session:', error);
      return null;
    }
  }

  /**
   * Registrar page view
   */
  async trackPageView({
    prisma,
    userId = null,
    sessionId = null,
    pagePath,
    pageTitle,
    referrer = null,
    req = null
  }) {
    // Atualizar contador de page views na sessão se sessionId fornecido
    if (sessionId) {
      try {
        await prisma.userSession.update({
          where: { id: sessionId },
          data: {
            pageViews: { increment: 1 }
          }
        });
      } catch (error) {
        // Sessão pode não existir, continuar sem erro
      }
    }

    return this.trackEvent({
      prisma,
      userId,
      sessionId,
      eventType: 'page_view',
      eventName: 'page_view',
      category: 'navigation',
      pagePath,
      pageTitle,
      referrer,
      req
    });
  }

  /**
   * Registrar clique
   */
  async trackClick({
    prisma,
    userId = null,
    sessionId = null,
    elementId = null,
    elementText = null,
    elementClass = null,
    pagePath = null,
    metadata = null,
    req = null
  }) {
    return this.trackEvent({
      prisma,
      userId,
      sessionId,
      eventType: 'click',
      eventName: 'element_click',
      category: 'engagement',
      pagePath,
      metadata: {
        ...metadata,
        elementId,
        elementText,
        elementClass
      },
      req
    });
  }

  /**
   * Registrar compra
   */
  async trackPurchase({
    prisma,
    userId,
    sessionId = null,
    purchaseId,
    productId,
    amount,
    cashbackAmount = null,
    metadata = null,
    req = null
  }) {
    return this.trackEvent({
      prisma,
      userId,
      sessionId,
      eventType: 'purchase',
      eventName: 'purchase_completed',
      category: 'transaction',
      metadata: {
        ...metadata,
        purchaseId,
        productId,
        amount,
        cashbackAmount
      },
      req
    });
  }

  /**
   * Registrar busca
   */
  async trackSearch({
    prisma,
    userId = null,
    sessionId = null,
    searchTerm,
    resultsCount = null,
    pagePath = null,
    req = null
  }) {
    return this.trackEvent({
      prisma,
      userId,
      sessionId,
      eventType: 'search',
      eventName: 'search_performed',
      category: 'engagement',
      pagePath,
      metadata: {
        searchTerm,
        resultsCount
      },
      req
    });
  }

  /**
   * Registrar abertura de notificação push
   */
  async trackNotificationOpen({
    prisma,
    userId,
    campaignId,
    notificationLogId,
    req = null
  }) {
    // Atualizar log de notificação
    if (notificationLogId) {
      try {
        await prisma.pushNotificationLog.update({
          where: { id: notificationLogId },
          data: { openedAt: new Date() }
        });
      } catch (error) {
        console.error('Error updating notification log:', error);
      }
    }

    return this.trackEvent({
      prisma,
      userId,
      eventType: 'notification_open',
      eventName: 'notification_opened',
      category: 'notification',
      metadata: {
        campaignId,
        notificationLogId
      },
      req
    });
  }

  /**
   * Registrar clique em notificação push
   */
  async trackNotificationClick({
    prisma,
    userId,
    campaignId,
    notificationLogId,
    buttonType = null,
    targetModule = null,
    req = null
  }) {
    // Atualizar log de notificação
    if (notificationLogId) {
      try {
        await prisma.pushNotificationLog.update({
          where: { id: notificationLogId },
          data: { clickedAt: new Date() }
        });
      } catch (error) {
        console.error('Error updating notification log:', error);
      }
    }

    return this.trackEvent({
      prisma,
      userId,
      eventType: 'notification_click',
      eventName: 'notification_clicked',
      category: 'notification',
      metadata: {
        campaignId,
        notificationLogId,
        buttonType,
        targetModule
      },
      req
    });
  }

  /**
   * Registrar erro
   */
  async trackError({
    prisma,
    userId = null,
    sessionId = null,
    errorMessage,
    errorStack = null,
    pagePath = null,
    req = null
  }) {
    return this.trackEvent({
      prisma,
      userId,
      sessionId,
      eventType: 'error',
      eventName: 'error_occurred',
      category: 'system',
      pagePath,
      metadata: {
        errorMessage,
        errorStack: errorStack ? errorStack.substring(0, 1000) : null
      },
      req
    });
  }

  /**
   * Extrair informações do dispositivo/browser do request
   */
  extractDeviceInfo(req) {
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      platform: this.detectPlatform(userAgent, req),
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name || null,
      os: result.os.name || null
    };
  }

  /**
   * Detectar plataforma (web, ios, android)
   */
  detectPlatform(userAgent, req) {
    const ua = userAgent.toLowerCase();

    // Verificar se é mobile app
    if (req.headers['x-platform']) {
      return req.headers['x-platform'];
    }

    if (ua.includes('android')) {
      return 'android';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      return 'ios';
    } else {
      return 'web';
    }
  }

  /**
   * Obter IP do cliente
   */
  getClientIp(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      null
    );
  }

  /**
   * Processar batch de eventos
   */
  startBatchProcessor() {
    this.batchInterval = setInterval(async () => {
      if (this.batchQueue.length > 0) {
        await this.flushBatch();
      }
    }, this.flushInterval);
  }

  /**
   * Fazer flush do batch
   */
  async flushBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.batchSize);

    // Agrupar por prisma instance
    const byPrisma = {};
    batch.forEach(({ prisma, event }) => {
      const key = prisma.constructor.name;
      if (!byPrisma[key]) {
        byPrisma[key] = { prisma, events: [] };
      }
      byPrisma[key].events.push(event);
    });

    // Inserir em batch para cada prisma
    for (const key in byPrisma) {
      const { prisma, events } = byPrisma[key];
      try {
        await prisma.analyticsEvent.createMany({
          data: events,
          skipDuplicates: true
        });
        console.log(`✅ Flushed ${events.length} analytics events`);
      } catch (error) {
        console.error('❌ Error flushing analytics batch:', error);
      }
    }
  }

  /**
   * Parar processador de batch
   */
  stop() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
  }

  /**
   * Obter estatísticas de analytics
   */
  async getStats(prisma, {
    startDate = null,
    endDate = null,
    userId = null,
    eventType = null
  }) {
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

    const [
      totalEvents,
      uniqueUsers,
      eventsByType,
      topPages
    ] = await Promise.all([
      // Total de eventos
      prisma.analyticsEvent.count({ where }),

      // Usuários únicos
      prisma.analyticsEvent.findMany({
        where,
        distinct: ['userId'],
        select: { userId: true }
      }).then(results => results.filter(r => r.userId).length),

      // Eventos por tipo
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where,
        _count: true
      }),

      // Páginas mais visitadas
      prisma.analyticsEvent.groupBy({
        by: ['pagePath'],
        where: {
          ...where,
          eventType: 'page_view',
          pagePath: { not: null }
        },
        _count: true,
        orderBy: {
          _count: {
            pagePath: 'desc'
          }
        },
        take: 10
      })
    ]);

    return {
      totalEvents,
      uniqueUsers,
      eventsByType: eventsByType.map(e => ({
        type: e.eventType,
        count: e._count
      })),
      topPages: topPages.map(p => ({
        path: p.pagePath,
        views: p._count
      }))
    };
  }
}

// Singleton
const analyticsService = new AnalyticsService();

module.exports = analyticsService;

/**
 * Scheduled Campaign Processor Service
 *
 * Processa campanhas agendadas para envio de push notifications
 */

const fcmService = require('./fcm.service');

class ScheduledCampaignProcessorService {
  constructor() {
    this.isProcessing = false;
    this.checkInterval = 60000; // Verificar a cada 1 minuto
    this.intervalId = null;
  }

  /**
   * Iniciar processamento de campanhas agendadas
   */
  start() {
    if (this.intervalId) {
      console.log('⚠️ Scheduled campaign processor already running');
      return;
    }

    console.log('🚀 Starting scheduled campaign processor...');

    // Executar imediatamente e depois a cada intervalo
    this.processScheduledCampaigns();

    this.intervalId = setInterval(() => {
      this.processScheduledCampaigns();
    }, this.checkInterval);

    console.log(`✅ Scheduled campaign processor started (checking every ${this.checkInterval / 1000}s)`);
  }

  /**
   * Parar processamento de campanhas agendadas
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Scheduled campaign processor stopped');
    }
  }

  /**
   * Processar campanhas agendadas
   */
  async processScheduledCampaigns() {
    // Evitar processamento concorrente
    if (this.isProcessing) {
      console.log('⏳ Already processing scheduled campaigns, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      // Buscar todos os tenants com campanhas agendadas
      const { PrismaClient: MainPrismaClient } = require('../generated/prisma-main');
      const mainPrisma = new MainPrismaClient();

      const tenants = await mainPrisma.tenant.findMany({
        where: {
          status: 'active'
        }
      });

      await mainPrisma.$disconnect();

      // Processar cada tenant
      for (const tenant of tenants) {
        await this.processTenantCampaigns(tenant);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled campaigns:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processar campanhas de um tenant específico
   */
  async processTenantCampaigns(tenant) {
    const { PrismaClient: TenantPrismaClient } = require('../generated/prisma-tenant');
    const prisma = new TenantPrismaClient({
      datasources: {
        db: {
          url: tenant.databaseUrl
        }
      }
    });

    try {
      const now = new Date();

      // Buscar campanhas agendadas que devem ser enviadas agora
      const campaigns = await prisma.pushNotificationCampaign.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: {
            lte: now
          }
        }
      });

      if (campaigns.length > 0) {
        console.log(`📅 Found ${campaigns.length} scheduled campaign(s) to process for tenant ${tenant.slug}`);
      }

      // Processar cada campanha
      for (const campaign of campaigns) {
        await this.processCampaign(campaign, prisma, tenant);
      }
    } catch (error) {
      console.error(`❌ Error processing campaigns for tenant ${tenant.slug}:`, error);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Processar uma campanha individual
   */
  async processCampaign(campaign, prisma, tenant) {
    try {
      console.log(`📲 Processing campaign: ${campaign.title} (${campaign.id})`);

      // Atualizar status para processing
      await prisma.pushNotificationCampaign.update({
        where: { id: campaign.id },
        data: { status: 'processing' }
      });

      // Buscar usuários alvo (mesma lógica do controller)
      let targetUserIds = [];

      // 1. Usuários por geolocalização (CEP + raio)
      if (campaign.geolocation?.cep && campaign.geolocation?.radius) {
        const cepPrefix = campaign.geolocation.cep.substring(0, 5);

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

      // Remover duplicatas
      targetUserIds = [...new Set(targetUserIds)];

      if (targetUserIds.length === 0) {
        console.log(`⚠️ No target users found for campaign ${campaign.id}`);
        await prisma.pushNotificationCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'failed',
            completedAt: new Date()
          }
        });
        return;
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

      if (userPushTokens.length === 0) {
        console.log(`⚠️ No push tokens found for campaign ${campaign.id}`);
        await prisma.pushNotificationCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });
        return;
      }

      // Preparar dados da notificação
      const notification = {
        title: campaign.title,
        body: campaign.description
      };

      const data = {
        type: 'campaign',
        campaignId: campaign.id,
        pageTitle: campaign.pageTitle || '',
        pageDescription: campaign.pageDescription || '',
        code: campaign.code || '',
        rules: campaign.rules || '',
        logoUrl: campaign.logoUrl || '',
        bannerUrl: campaign.bannerUrl || '',
        enableButton: String(campaign.enableButton),
        buttonType: campaign.buttonType || '',
        targetModule: campaign.targetModule || '',
        externalLink: campaign.externalLink || '',
        buttonText: campaign.buttonText || ''
      };

      // URL da imagem do banner
      const imageUrl = campaign.bannerUrl ?
        `${process.env.API_URL || 'http://localhost:8033'}${campaign.bannerUrl}` : null;

      // Enviar notificações
      let successCount = 0;
      let failureCount = 0;
      const invalidTokens = [];

      const tokens = userPushTokens.map(t => t.token);
      const userTokenMap = {};
      userPushTokens.forEach(t => {
        userTokenMap[t.token] = t;
      });

      console.log(`📲 Sending push to ${tokens.length} tokens via FCM...`);

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

        console.log(`🗑️ ${invalidTokens.length} invalid tokens deactivated`);
      }

      // Atualizar campanha com resultados
      await prisma.pushNotificationCampaign.update({
        where: { id: campaign.id },
        data: {
          status: 'completed',
          sentCount: successCount,
          failedCount: failureCount,
          completedAt: new Date()
        }
      });

      console.log(`✅ Campaign ${campaign.id} completed: ${successCount} sent, ${failureCount} failed`);
    } catch (error) {
      console.error(`❌ Error processing campaign ${campaign.id}:`, error);

      // Marcar campanha como falha
      try {
        await prisma.pushNotificationCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'failed',
            completedAt: new Date()
          }
        });
      } catch (updateError) {
        console.error('Error updating campaign status:', updateError);
      }
    }
  }

  /**
   * Obter status do processador
   */
  getStatus() {
    return {
      running: !!this.intervalId,
      processing: this.isProcessing,
      checkInterval: this.checkInterval
    };
  }
}

// Singleton
const scheduledCampaignProcessor = new ScheduledCampaignProcessorService();

// Iniciar automaticamente quando o serviço é carregado
if (process.env.ENABLE_SCHEDULED_CAMPAIGNS !== 'false') {
  scheduledCampaignProcessor.start();
}

module.exports = scheduledCampaignProcessor;

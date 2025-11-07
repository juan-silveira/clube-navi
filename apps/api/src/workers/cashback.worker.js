// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const rabbitmqConfig = require('../config/rabbitmq');
const { getClubClient } = require('../database/club-client');

/**
 * Cashback Worker
 *
 * Worker para processar distribuição de cashback de forma assíncrona
 */
class CashbackWorker {
  constructor() {
    this.isRunning = false;
    this.consumerTags = [];
  }

  /**
   * Iniciar processamento de mensagens
   */
  async start() {
    try {
      if (this.isRunning) {
        console.log('⚠️ CashbackWorker já está rodando');
        return;
      }

      console.log('🚀 CashbackWorker: Starting...');

      // Inicializar RabbitMQ se necessário
      if (!rabbitmqConfig.isConnected) {
        await rabbitmqConfig.initialize();
      }

      // Configurar consumidores
      await this.setupConsumers();

      this.isRunning = true;
      console.log('✅ CashbackWorker: Started successfully');

    } catch (error) {
      console.error('❌ CashbackWorker: Failed to start:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Configura consumidores
   */
  async setupConsumers() {
    const channel = rabbitmqConfig.getChannel();

    // Fila de processamento de cashback
    const QUEUE_NAME = 'cashback-processing';

    // Garantir que a fila existe
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-message-ttl': 3600000, // 1 hora
        'x-max-length': 10000
      }
    });

    console.log(`📥 CashbackWorker: Listening on queue "${QUEUE_NAME}"`);

    // Consumir mensagens
    const consumerTag = await channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg) {
          await this.processCashbackMessage(msg);
        }
      },
      {
        noAck: false
      }
    );

    this.consumerTags.push(consumerTag.consumerTag);
  }

  /**
   * Processar mensagem de cashback
   */
  async processCashbackMessage(msg) {
    const channel = rabbitmqConfig.getChannel();

    try {
      const content = msg.content.toString();
      const data = JSON.parse(content);

      console.log('💰 CashbackWorker: Processing cashback...', {
        purchaseId: data.purchaseId,
        clubeSlug: data.clubeSlug
      });

      // Obter Prisma client do clube
      const prisma = await getClubClient({
        slug: data.clubeSlug,
        databaseName: data.clubeDatabase
      });

      // Buscar compra
      const purchase = await prisma.purchase.findUnique({
        where: { id: data.purchaseId },
        include: {
          consumer: true,
          merchant: true,
          product: true
        }
      });

      if (!purchase) {
        console.error(`❌ CashbackWorker: Purchase ${data.purchaseId} not found`);
        channel.ack(msg);
        return;
      }

      // Distribuir cashback (atualmente está nos valores já calculados)
      // No futuro, podemos integrar com blockchain aqui

      // Para fins de logging, vamos registrar a distribuição
      console.log('✅ CashbackWorker: Cashback distributed', {
        purchaseId: purchase.id,
        consumerCashback: parseFloat(purchase.consumerCashback),
        platformFee: parseFloat(purchase.platformFee),
        consumerReferrerFee: parseFloat(purchase.consumerReferrerFee),
        merchantReferrerFee: parseFloat(purchase.merchantReferrerFee)
      });

      // TODO: Integração com blockchain para transferir tokens
      // await blockchainService.distributeCashback(purchase);

      // Ack da mensagem
      channel.ack(msg);

    } catch (error) {
      console.error('❌ CashbackWorker: Error processing message:', error);

      // Verificar se deve reenviar ou descartar
      if (error.message && error.message.includes('não encontrad')) {
        // Erro permanente - ack para não reprocessar
        console.log('⚠️ CashbackWorker: Permanent error, acknowledging message');
        channel.ack(msg);
      } else {
        // Erro temporário - requeue
        console.log('🔄 CashbackWorker: Temporary error, requeuing message');
        channel.nack(msg, false, true);
      }
    }
  }

  /**
   * Parar worker
   */
  async stop() {
    try {
      console.log('🛑 CashbackWorker: Stopping...');

      const channel = rabbitmqConfig.getChannel();

      // Cancelar todos os consumidores
      for (const tag of this.consumerTags) {
        await channel.cancel(tag);
      }

      this.consumerTags = [];
      this.isRunning = false;

      console.log('✅ CashbackWorker: Stopped successfully');

    } catch (error) {
      console.error('❌ CashbackWorker: Error stopping:', error);
      throw error;
    }
  }

  /**
   * Enfileirar processamento de cashback
   */
  static async enqueueCashback(clubeSlug, clubeDatabase, purchaseId) {
    try {
      const channel = rabbitmqConfig.getChannel();
      const QUEUE_NAME = 'cashback-processing';

      const message = {
        purchaseId,
        clubeSlug,
        clubeDatabase,
        timestamp: new Date().toISOString()
      };

      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true
        }
      );

      console.log('📤 CashbackWorker: Cashback enqueued', {
        purchaseId,
        clubeSlug
      });

    } catch (error) {
      console.error('❌ CashbackWorker: Error enqueueing:', error);
      throw error;
    }
  }
}

// Criar instância única
const cashbackWorker = new CashbackWorker();

// Iniciar worker se executado diretamente
if (require.main === module) {
  cashbackWorker.start().catch((error) => {
    console.error('❌ CashbackWorker: Fatal error:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('⚠️ SIGTERM received');
    await cashbackWorker.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('⚠️ SIGINT received');
    await cashbackWorker.stop();
    process.exit(0);
  });
}

module.exports = cashbackWorker;

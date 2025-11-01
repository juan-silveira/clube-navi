const amqp = require('amqplib');

class RabbitMQManager {
    constructor() {
        this.connection = null;
        this.channels = new Map();
        this.config = {
            url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
            options: {
                heartbeat: 60,
                connectionTimeout: 10000,
                channelMax: 100,
                frameMax: 0x1000
            }
        };

        // Exchange e Queue definitions
        this.exchanges = {
            EXCHANGE_EVENTS: 'exchange.events',
            MATCHING_ENGINE: 'matching.engine',
            NOTIFICATIONS: 'notifications',
            DEADLETTER: 'deadletter'
        };

        this.queues = {
            // Exchange events
            ORDER_CREATED: 'exchange.order.created',
            ORDER_CANCELLED: 'exchange.order.cancelled',
            ORDERS_MATCHED: 'exchange.orders.matched',

            // Matching engine
            MATCH_ORDERS: 'matching.process',
            MATCH_RESULT: 'matching.result',

            // Notifications
            USER_NOTIFICATIONS: 'notifications.user',
            ADMIN_ALERTS: 'notifications.admin',

            // Dead letter queues
            DLQ_ORDERS: 'dlq.orders',
            DLQ_MATCHING: 'dlq.matching'
        };
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.config.url, this.config.options);

            this.connection.on('error', (error) => {
                console.error('❌ RabbitMQ connection error:', error);
            });

            this.connection.on('close', () => {
                console.log('🔌 RabbitMQ connection closed');
                this.reconnect();
            });

            console.log('✅ RabbitMQ connected successfully');
            await this.setupInfrastructure();
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to RabbitMQ:', error);
            return false;
        }
    }

    async reconnect() {
        console.log('🔄 Attempting to reconnect to RabbitMQ...');
        setTimeout(async () => {
            await this.connect();
        }, 5000);
    }

    async createChannel(channelId) {
        if (this.channels.has(channelId)) {
            return this.channels.get(channelId);
        }

        try {
            const channel = await this.connection.createChannel();

            // Configurações de qualidade de serviço
            await channel.prefetch(10); // Processar até 10 mensagens por vez

            channel.on('error', (error) => {
                console.error(`❌ Channel error for ${channelId}:`, error);
                this.channels.delete(channelId);
            });

            channel.on('close', () => {
                console.log(`🔌 Channel ${channelId} closed`);
                this.channels.delete(channelId);
            });

            this.channels.set(channelId, channel);
            return channel;
        } catch (error) {
            console.error(`Failed to create channel ${channelId}:`, error);
            throw error;
        }
    }

    async setupInfrastructure() {
        const channel = await this.createChannel('setup');

        try {
            // Declarar exchanges
            await channel.assertExchange(this.exchanges.EXCHANGE_EVENTS, 'topic', {
                durable: true,
                autoDelete: false
            });

            await channel.assertExchange(this.exchanges.MATCHING_ENGINE, 'direct', {
                durable: true,
                autoDelete: false
            });

            await channel.assertExchange(this.exchanges.NOTIFICATIONS, 'fanout', {
                durable: true,
                autoDelete: false
            });

            await channel.assertExchange(this.exchanges.DEADLETTER, 'direct', {
                durable: true,
                autoDelete: false
            });

            // Declarar filas principais
            await this.declareQueue(channel, this.queues.ORDER_CREATED, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': this.exchanges.DEADLETTER,
                    'x-dead-letter-routing-key': 'dlq.orders',
                    'x-message-ttl': 3600000 // 1 hora TTL
                }
            });

            await this.declareQueue(channel, this.queues.ORDER_CANCELLED, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': this.exchanges.DEADLETTER,
                    'x-dead-letter-routing-key': 'dlq.orders'
                }
            });

            await this.declareQueue(channel, this.queues.ORDERS_MATCHED, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': this.exchanges.DEADLETTER,
                    'x-dead-letter-routing-key': 'dlq.orders'
                }
            });

            await this.declareQueue(channel, this.queues.MATCH_ORDERS, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': this.exchanges.DEADLETTER,
                    'x-dead-letter-routing-key': 'dlq.matching',
                    'x-max-retries': 3
                }
            });

            // Dead Letter Queues
            await this.declareQueue(channel, this.queues.DLQ_ORDERS, { durable: true });
            await this.declareQueue(channel, this.queues.DLQ_MATCHING, { durable: true });

            // Bindings
            await channel.bindQueue(this.queues.ORDER_CREATED, this.exchanges.EXCHANGE_EVENTS, 'order.created.*');
            await channel.bindQueue(this.queues.ORDER_CANCELLED, this.exchanges.EXCHANGE_EVENTS, 'order.cancelled.*');
            await channel.bindQueue(this.queues.ORDERS_MATCHED, this.exchanges.EXCHANGE_EVENTS, 'orders.matched.*');
            await channel.bindQueue(this.queues.MATCH_ORDERS, this.exchanges.MATCHING_ENGINE, 'process');

            console.log('✅ RabbitMQ infrastructure setup complete');
        } catch (error) {
            console.error('❌ Failed to setup RabbitMQ infrastructure:', error);
            throw error;
        }
    }

    async declareQueue(channel, queueName, options = {}) {
        const defaultOptions = {
            durable: true,
            autoDelete: false,
            exclusive: false
        };

        return await channel.assertQueue(queueName, { ...defaultOptions, ...options });
    }

    // Publicar evento de nova ordem
    async publishOrderCreated(contractAddress, orderData) {
        const channel = await this.createChannel('publisher');
        const routingKey = `order.created.${contractAddress}`;

        const message = {
            id: this.generateMessageId(),
            timestamp: Date.now(),
            contractAddress,
            orderData,
            metadata: {
                source: 'blockchain_event',
                version: '1.0'
            }
        };

        return await channel.publish(
            this.exchanges.EXCHANGE_EVENTS,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                messageId: message.id,
                timestamp: message.timestamp,
                headers: {
                    contractAddress,
                    eventType: 'order_created'
                }
            }
        );
    }

    // Publicar evento de ordem cancelada
    async publishOrderCancelled(contractAddress, orderData) {
        const channel = await this.createChannel('publisher');
        const routingKey = `order.cancelled.${contractAddress}`;

        const message = {
            id: this.generateMessageId(),
            timestamp: Date.now(),
            contractAddress,
            orderData,
            metadata: {
                source: 'blockchain_event',
                version: '1.0'
            }
        };

        return await channel.publish(
            this.exchanges.EXCHANGE_EVENTS,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                messageId: message.id,
                timestamp: message.timestamp
            }
        );
    }

    // Publicar evento de match executado
    async publishOrdersMatched(contractAddress, matchData) {
        const channel = await this.createChannel('publisher');
        const routingKey = `orders.matched.${contractAddress}`;

        const message = {
            id: this.generateMessageId(),
            timestamp: Date.now(),
            contractAddress,
            matchData,
            metadata: {
                source: 'blockchain_event',
                version: '1.0'
            }
        };

        return await channel.publish(
            this.exchanges.EXCHANGE_EVENTS,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                messageId: message.id,
                timestamp: message.timestamp
            }
        );
    }

    // Solicitar processamento de matching
    async requestMatching(contractAddress, orderData) {
        const channel = await this.createChannel('matching_publisher');

        const message = {
            id: this.generateMessageId(),
            timestamp: Date.now(),
            contractAddress,
            orderData,
            priority: this.calculateMatchingPriority(orderData),
            metadata: {
                source: 'matching_engine',
                version: '1.0'
            }
        };

        return await channel.sendToQueue(
            this.queues.MATCH_ORDERS,
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                priority: message.priority,
                messageId: message.id,
                timestamp: message.timestamp
            }
        );
    }

    // Consumer para ordens criadas
    async consumeOrderCreated(callback) {
        const channel = await this.createChannel('order_created_consumer');

        return await channel.consume(this.queues.ORDER_CREATED, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await callback(content);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing order created:', error);
                    // Rejeitar e enviar para DLQ após 3 tentativas
                    const retryCount = (msg.properties.headers['x-retry-count'] || 0) + 1;
                    if (retryCount <= 3) {
                        setTimeout(() => {
                            channel.nack(msg, false, true);
                        }, retryCount * 1000);
                    } else {
                        channel.nack(msg, false, false); // Enviar para DLQ
                    }
                }
            }
        }, { noAck: false });
    }

    // Consumer para matching engine
    async consumeMatchingRequests(callback) {
        const channel = await this.createChannel('matching_consumer');

        return await channel.consume(this.queues.MATCH_ORDERS, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await callback(content);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing matching request:', error);
                    channel.nack(msg, false, false); // Enviar para DLQ
                }
            }
        }, { noAck: false });
    }

    // Calcular prioridade de matching
    calculateMatchingPriority(orderData) {
        // Prioridade baseada no tamanho da ordem e tempo
        const amount = parseFloat(orderData.amountToken || 0);
        const time = Date.now() - (orderData.timestamp || Date.now());

        if (amount > 10000) return 9; // Ordens grandes têm prioridade alta
        if (amount > 1000) return 7;
        if (time > 60000) return 8; // Ordens antigas têm prioridade alta
        return 5; // Prioridade padrão
    }

    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Health check
    async healthCheck() {
        try {
            if (!this.connection || this.connection.connection.stream.destroyed) {
                return { status: 'unhealthy', reason: 'No connection' };
            }

            // Verificar se conseguimos criar um channel
            const testChannel = await this.connection.createChannel();
            await testChannel.close();

            return {
                status: 'healthy',
                channels: this.channels.size,
                queues: Object.keys(this.queues).length
            };
        } catch (error) {
            return { status: 'unhealthy', reason: error.message };
        }
    }

    // Fechar todas as conexões
    async close() {
        try {
            for (const [channelId, channel] of this.channels) {
                await channel.close();
                console.log(`🔌 Closed channel: ${channelId}`);
            }

            if (this.connection) {
                await this.connection.close();
                console.log('🔌 RabbitMQ connection closed');
            }
        } catch (error) {
            console.error('Error closing RabbitMQ connections:', error);
        }
    }
}

module.exports = new RabbitMQManager();
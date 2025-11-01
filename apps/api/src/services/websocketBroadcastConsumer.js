/**
 * WebSocket Broadcast Consumer - Processa mensagens de broadcast do RabbitMQ
 *
 * Responsabilidades:
 * - Consumir mensagens de broadcast do RabbitMQ
 * - Enviar notificações via WebSocket para clientes conectados
 */
class WebSocketBroadcastConsumer {
    constructor() {
        this.io = null;
        this.rabbitMQ = null;
        this.isActive = false;
    }

    /**
     * Inicializar o consumer
     */
    async initialize(io) {
        try {
            console.log('🔊 Initializing WebSocket Broadcast Consumer...');

            this.io = io;

            // Setup RabbitMQ
            const rabbitMQ = require('../config/rabbitmq');
            this.rabbitMQ = rabbitMQ;

            console.log('✅ WebSocket Broadcast Consumer initialized');

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize WebSocket Broadcast Consumer:', error);
            throw error;
        }
    }

    /**
     * Iniciar consumer do RabbitMQ para broadcasts WebSocket
     */
    async startConsumer() {
        try {
            console.log('🚀 Starting WebSocket broadcast consumer...');

            // Consumir mensagens de broadcast
            await this.rabbitMQ.consumeQueue(
                'exchange.websocket.broadcast',
                this.handleBroadcastMessage.bind(this),
                {
                    prefetch: 10, // Processar múltiplas mensagens de broadcast
                    autoAck: true // Auto confirmar broadcasts
                }
            );

            this.isActive = true;
            console.log('✅ WebSocket broadcast consumer started');

        } catch (error) {
            console.error('❌ Error starting WebSocket broadcast consumer:', error);
            throw error;
        }
    }

    /**
     * Processar mensagem de broadcast
     */
    async handleBroadcastMessage(message) {
        try {
            const broadcastData = JSON.parse(message.content.toString());

            console.log(`📡 Broadcasting: ${broadcastData.broadcastType}`);

            switch (broadcastData.broadcastType) {
                case 'match.executed':
                    await this.broadcastMatchExecuted(broadcastData.data);
                    break;

                case 'order.created':
                    await this.broadcastOrderCreated(broadcastData.data);
                    break;

                case 'order.cancelled':
                    await this.broadcastOrderCancelled(broadcastData.data);
                    break;

                default:
                    console.log(`⚠️ Unknown broadcast type: ${broadcastData.broadcastType}`);
            }

        } catch (error) {
            console.error('❌ Error processing broadcast message:', error);
        }
    }

    /**
     * Broadcast match executado
     */
    async broadcastMatchExecuted(data) {
        try {
            console.log(`🎯 Broadcasting match executed for contract ${data.contractAddress?.substring(0,8)}...`);

            // Broadcast global para todos os clientes
            this.io.emit('matchExecuted', {
                type: 'MATCH_EXECUTED',
                contractAddress: data.contractAddress,
                pair: data.pair,
                buyOrderId: data.buyOrderId,
                sellOrderId: data.sellOrderId,
                transactionHash: data.transactionHash,
                blockNumber: data.blockNumber,
                timestamp: data.timestamp
            });

            // Broadcast específico por contrato
            this.io.emit(`match:${data.contractAddress}`, {
                type: 'MATCH_EXECUTED',
                buyOrderId: data.buyOrderId,
                sellOrderId: data.sellOrderId,
                transactionHash: data.transactionHash,
                timestamp: data.timestamp
            });

            console.log(`✅ Match executed broadcast sent for ${data.pair}`);

        } catch (error) {
            console.error('❌ Error broadcasting match executed:', error);
        }
    }

    /**
     * Broadcast ordem criada
     */
    async broadcastOrderCreated(data) {
        try {
            console.log(`📋 Broadcasting order created for contract ${data.contractAddress?.substring(0,8)}...`);

            this.io.emit('orderCreated', {
                type: 'ORDER_CREATED',
                contractAddress: data.contractAddress,
                orderId: data.orderId,
                orderType: data.orderType,
                price: data.price,
                amount: data.amount,
                userAddress: data.userAddress,
                timestamp: data.timestamp
            });

            // Broadcast específico por contrato
            this.io.emit(`orders:${data.contractAddress}`, {
                type: 'ORDER_CREATED',
                orderId: data.orderId,
                orderType: data.orderType,
                price: data.price,
                amount: data.amount,
                timestamp: data.timestamp
            });

        } catch (error) {
            console.error('❌ Error broadcasting order created:', error);
        }
    }

    /**
     * Broadcast ordem cancelada
     */
    async broadcastOrderCancelled(data) {
        try {
            console.log(`❌ Broadcasting order cancelled for contract ${data.contractAddress?.substring(0,8)}...`);

            this.io.emit('orderCancelled', {
                type: 'ORDER_CANCELLED',
                contractAddress: data.contractAddress,
                orderId: data.orderId,
                transactionHash: data.transactionHash,
                timestamp: data.timestamp
            });

            // Broadcast específico por contrato
            this.io.emit(`orders:${data.contractAddress}`, {
                type: 'ORDER_CANCELLED',
                orderId: data.orderId,
                transactionHash: data.transactionHash,
                timestamp: data.timestamp
            });

        } catch (error) {
            console.error('❌ Error broadcasting order cancelled:', error);
        }
    }

    /**
     * Parar o consumer
     */
    async stop() {
        try {
            console.log('🛑 Stopping WebSocket Broadcast Consumer...');

            this.isActive = false;

            console.log('✅ WebSocket Broadcast Consumer stopped');

        } catch (error) {
            console.error('❌ Error stopping WebSocket Broadcast Consumer:', error);
        }
    }

    /**
     * Health check
     */
    healthCheck() {
        return {
            healthy: this.isActive && this.io !== null,
            connectedClients: this.io?.engine?.clientsCount || 0,
            isActive: this.isActive
        };
    }
}

module.exports = WebSocketBroadcastConsumer;
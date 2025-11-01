const { ethers } = require('ethers');
const rabbitMQ = require('../config/rabbitmq.config');
const redisManager = require('../config/redis.config');
const ExchangeService = require('./exchangeService');

class ExchangeEventListener {
    constructor(contractAddress, abi, providerUrl) {
        this.contractAddress = ethers.getAddress(contractAddress);
        this.abi = abi;
        this.provider = new ethers.JsonRpcProvider(providerUrl);
        this.contract = new ethers.Contract(contractAddress, abi, this.provider);
        this.isListening = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.exchangeService = new ExchangeService();

        // Event handlers
        this.eventHandlers = new Map();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Handler para OrderCreated
        this.eventHandlers.set('OrderCreated', async (orderId, user, orderType, amount, price, event) => {
            console.log(`📦 OrderCreated Event - Contract: ${this.contractAddress}, OrderId: ${orderId}`);

            const orderData = {
                contractAddress: this.contractAddress,
                orderId: orderId.toString(),
                user: ethers.getAddress(user),
                orderType: orderType, // 0 = buy, 1 = sell
                amountToken: amount.toString(),
                pricePerToken: price.toString(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: Date.now(),
                isActive: true
            };

            try {
                // Buscar detalhes completos da ordem no contrato
                const orderDetails = await this.fetchOrderDetails(orderId);
                const enrichedOrderData = { ...orderData, ...orderDetails };

                // Cache temporário no Redis
                await redisManager.setBlockchainCache(
                    this.contractAddress,
                    `order:${orderId}`,
                    enrichedOrderData,
                    300 // 5 minutos
                );

                // Publicar no RabbitMQ para processamento
                await rabbitMQ.publishOrderCreated(this.contractAddress, enrichedOrderData);

                console.log(`✅ Order ${orderId} published to queue`);
            } catch (error) {
                console.error(`❌ Error processing OrderCreated event:`, error);
                // Tentar novamente em caso de erro
                setTimeout(async () => {
                    await this.retryEventProcessing('OrderCreated', orderData);
                }, 5000);
            }
        });

        // Handler para OrderCancelled
        this.eventHandlers.set('OrderCancelled', async (orderId, user, event) => {
            console.log(`❌ OrderCancelled Event - Contract: ${this.contractAddress}, OrderId: ${orderId}`);

            const cancelData = {
                contractAddress: this.contractAddress,
                orderId: orderId.toString(),
                user: ethers.getAddress(user),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: Date.now()
            };

            try {
                // Remover do cache
                await redisManager.setBlockchainCache(
                    this.contractAddress,
                    `order:${orderId}`,
                    null,
                    1 // Expirar imediatamente
                );

                // Publicar cancelamento
                await rabbitMQ.publishOrderCancelled(this.contractAddress, cancelData);

                console.log(`✅ Order cancellation ${orderId} published to queue`);
            } catch (error) {
                console.error(`❌ Error processing OrderCancelled event:`, error);
            }
        });

        // Handler para OrdersMatched
        this.eventHandlers.set('OrdersMatched', async (buyOrderId, sellOrderId, amount, price, buyer, seller, event) => {
            console.log(`🤝 OrdersMatched Event - Contract: ${this.contractAddress}`);

            const matchData = {
                contractAddress: this.contractAddress,
                buyOrderId: buyOrderId.toString(),
                sellOrderId: sellOrderId.toString(),
                amount: amount.toString(),
                price: price.toString(),
                buyer: ethers.getAddress(buyer),
                seller: ethers.getAddress(seller),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: Date.now()
            };

            try {
                // Cache da transação
                await redisManager.setBlockchainCache(
                    this.contractAddress,
                    `trade:${event.transactionHash}`,
                    matchData,
                    3600 // 1 hora
                );

                // Publicar match executado
                await rabbitMQ.publishOrdersMatched(this.contractAddress, matchData);

                console.log(`✅ Orders match published to queue`);
            } catch (error) {
                console.error(`❌ Error processing OrdersMatched event:`, error);
            }
        });
    }

    async fetchOrderDetails(orderId) {
        try {
            // Buscar dados completos da ordem no contrato
            const order = await this.contract.orders(orderId);

            return {
                isActive: order.isActive,
                remainingAmount: order.remainingAmount?.toString() || '0',
                user: order.user ? ethers.getAddress(order.user) : '',
                orderType: order.orderType || 0,
                amountToken: order.amountToken?.toString() || '0',
                pricePerToken: order.pricePerToken?.toString() || '0',
                createdAt: order.createdAt?.toString() || '0'
            };
        } catch (error) {
            console.error(`Error fetching order details for ${orderId}:`, error);
            return {};
        }
    }

    async startListening() {
        if (this.isListening) {
            console.log(`⚠️ Already listening to contract ${this.contractAddress}`);
            return;
        }

        try {
            console.log(`🎧 Starting to listen to contract ${this.contractAddress} (POLLING MODE)`);

            // USAR POLLING ao invés de event listeners para evitar "Batch request length too long"
            // Event listeners (.on) criam eth_newFilter que sobrecarrega o RPC
            // Polling com queryFilter é mais eficiente e controlável

            this.isListening = true;
            this.reconnectAttempts = 0;

            // Iniciar polling loop
            this.startPolling();

            console.log(`✅ Successfully started polling for contract ${this.contractAddress}`);
        } catch (error) {
            console.error(`❌ Failed to start listening to ${this.contractAddress}:`, error);
            await this.handleConnectionError();
        }
    }

    /**
     * Polling loop para buscar novos eventos sem criar filtros permanentes
     */
    async startPolling() {
        const POLL_INTERVAL = 15000; // 15 segundos - ajuste conforme necessário

        const poll = async () => {
            if (!this.isListening) {
                console.log(`⏸️ Polling stopped for ${this.contractAddress}`);
                return;
            }

            try {
                await this.catchUpMissedEvents();
            } catch (error) {
                // Suprimir erros de "Batch request length too long" no log
                if (!error.message?.includes('Batch request length too long')) {
                    console.error(`❌ Polling error for ${this.contractAddress}:`, error.message);
                }
            }

            // Agendar próximo poll
            if (this.isListening) {
                this.pollTimeout = setTimeout(poll, POLL_INTERVAL);
            }
        };

        // Iniciar primeiro poll imediatamente
        await poll();
    }

    async safeEventHandler(eventName, handler, args) {
        try {
            await handler(...args);
        } catch (error) {
            console.error(`❌ Error in ${eventName} handler:`, error);

            // Log do erro para análise posterior
            const errorData = {
                contractAddress: this.contractAddress,
                eventName,
                error: error.message,
                args: args.map(arg => arg.toString()),
                timestamp: Date.now()
            };

            await redisManager.setSecure('errors',
                `event_error:${Date.now()}`,
                errorData,
                86400 // 24 horas
            );
        }
    }

    async catchUpMissedEvents() {
        try {
            // Buscar último bloco processado do cache
            const lastBlock = await redisManager.getBlockchainCache(
                this.contractAddress,
                'last_processed_block'
            ) || 0;

            const currentBlock = await this.provider.getBlockNumber();

            if (currentBlock > lastBlock + 1) {
                console.log(`🔍 Catching up missed events from block ${lastBlock + 1} to ${currentBlock}`);

                // Buscar eventos perdidos por evento
                for (const eventName of this.eventHandlers.keys()) {
                    const filter = this.contract.filters[eventName]();
                    const events = await this.contract.queryFilter(
                        filter,
                        lastBlock + 1,
                        currentBlock
                    );

                    console.log(`📥 Found ${events.length} missed ${eventName} events`);

                    // Processar eventos em ordem cronológica
                    for (const event of events) {
                        const handler = this.eventHandlers.get(eventName);
                        if (handler) {
                            await this.safeEventHandler(eventName, handler, [...event.args, event]);
                        }
                    }
                }

                // Atualizar último bloco processado
                await redisManager.setBlockchainCache(
                    this.contractAddress,
                    'last_processed_block',
                    currentBlock,
                    3600
                );
            }
        } catch (error) {
            console.error(`Error catching up missed events:`, error);
        }
    }

    async handleConnectionError() {
        this.isListening = false;
        this.reconnectAttempts++;

        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            console.error(`❌ Max reconnection attempts reached for ${this.contractAddress}`);
            // Notificar administradores
            await this.notifyConnectionFailure();
            return;
        }

        const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`🔄 Attempting to reconnect in ${backoffTime}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(async () => {
            await this.reconnect();
        }, backoffTime);
    }

    async reconnect() {
        try {
            // Criar novo provider
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            this.contract = new ethers.Contract(this.contractAddress, this.abi, this.provider);

            // Remover todos os listeners antigos
            this.contract.removeAllListeners();

            // Reiniciar listening
            await this.startListening();
        } catch (error) {
            console.error(`❌ Reconnection failed:`, error);
            await this.handleConnectionError();
        }
    }

    async notifyConnectionFailure() {
        const alertData = {
            type: 'CRITICAL',
            service: 'ExchangeEventListener',
            contractAddress: this.contractAddress,
            message: `Failed to maintain connection after ${this.maxReconnectAttempts} attempts`,
            timestamp: Date.now()
        };

        try {
            await redisManager.setSecure('alerts',
                `connection_failure:${this.contractAddress}:${Date.now()}`,
                alertData,
                86400
            );

            // Aqui você pode adicionar integração com Slack, email, etc.
            console.log(`🚨 CRITICAL ALERT: Connection failure for ${this.contractAddress}`);
        } catch (error) {
            console.error('Failed to send connection failure alert:', error);
        }
    }

    async retryEventProcessing(eventName, eventData) {
        try {
            console.log(`🔄 Retrying ${eventName} processing for order ${eventData.orderId}`);

            switch (eventName) {
                case 'OrderCreated':
                    await rabbitMQ.publishOrderCreated(this.contractAddress, eventData);
                    break;
                case 'OrderCancelled':
                    await rabbitMQ.publishOrderCancelled(this.contractAddress, eventData);
                    break;
                case 'OrdersMatched':
                    await rabbitMQ.publishOrdersMatched(this.contractAddress, eventData);
                    break;
            }

            console.log(`✅ Successfully retried ${eventName} processing`);
        } catch (error) {
            console.error(`❌ Retry failed for ${eventName}:`, error);
        }
    }

    async stopListening() {
        console.log(`🛑 Stopping listener for contract ${this.contractAddress}`);

        this.isListening = false;

        // Limpar timeout de polling
        if (this.pollTimeout) {
            clearTimeout(this.pollTimeout);
            this.pollTimeout = null;
        }

        // Remover todos os event listeners (se houver)
        this.contract.removeAllListeners();

        // Limpar cache temporário
        const cacheKeys = await redisManager.createConnection('blockchain_cache').keys(`contract:${this.contractAddress}:*`);
        if (cacheKeys.length > 0) {
            const pipeline = redisManager.createConnection('blockchain_cache').pipeline();
            cacheKeys.forEach(key => {
                pipeline.del(key.replace('coinage:blockchain_cache:', ''));
            });
            await pipeline.exec();
        }

        console.log(`✅ Stopped listening to contract ${this.contractAddress}`);
    }

    async getStatus() {
        return {
            contractAddress: this.contractAddress,
            isListening: this.isListening,
            reconnectAttempts: this.reconnectAttempts,
            lastBlock: await redisManager.getBlockchainCache(this.contractAddress, 'last_processed_block'),
            timestamp: Date.now()
        };
    }
}

module.exports = ExchangeEventListener;
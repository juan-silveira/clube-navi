const { ethers } = require('ethers');
const rabbitMQ = require('../config/rabbitmq.config');
const redisManager = require('../config/redis.config');
const db = require('../config/database');

class SecureMatchingEngine {
    constructor(contractAddress, abi, privateKey) {
        this.contractAddress = contractAddress.toLowerCase();
        this.abi = abi;
        this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers.Contract(contractAddress, abi, this.wallet);

        this.isProcessing = false;
        this.processingQueue = [];
        this.matchingConfig = {
            maxOrdersPerMatch: 10,
            maxGasPrice: ethers.parseUnits('100', 'gwei'),
            gasLimit: 500000,
            minMatchAmount: ethers.parseUnits('1', 18) // 1 token mínimo
        };

        // Métricas
        this.metrics = {
            totalMatches: 0,
            successfulMatches: 0,
            failedMatches: 0,
            averageMatchTime: 0,
            lastMatchTimestamp: 0
        };
    }

    async initialize() {
        console.log(`🚀 Initializing SecureMatchingEngine for contract ${this.contractAddress}`);

        try {
            // Verificar conexão com contrato
            const nextOrderId = await this.contract.nextOrderId();
            console.log(`✅ Contract connected, next order ID: ${nextOrderId}`);

            // Inicializar consumers do RabbitMQ
            await this.setupMessageConsumers();

            // Carregar configurações do Redis
            await this.loadMatchingConfig();

            console.log(`✅ SecureMatchingEngine initialized for ${this.contractAddress}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to initialize SecureMatchingEngine:`, error);
            return false;
        }
    }

    async setupMessageConsumers() {
        // Consumer para novas ordens
        await rabbitMQ.consumeOrderCreated(async (message) => {
            if (message.contractAddress === this.contractAddress) {
                await this.processNewOrder(message.orderData);
            }
        });

        // Consumer para ordens canceladas
        await rabbitMQ.consumeOrderCancelled(async (message) => {
            if (message.contractAddress === this.contractAddress) {
                await this.processOrderCancellation(message.orderData);
            }
        });

        // Consumer para matching requests diretos
        await rabbitMQ.consumeMatchingRequests(async (message) => {
            if (message.contractAddress === this.contractAddress) {
                await this.processMatchingRequest(message);
            }
        });

        console.log(`✅ Message consumers setup for ${this.contractAddress}`);
    }

    async loadMatchingConfig() {
        try {
            const config = await redisManager.getBlockchainCache(
                this.contractAddress,
                'matching_config'
            );

            if (config) {
                this.matchingConfig = { ...this.matchingConfig, ...config };
                console.log(`📋 Loaded matching config for ${this.contractAddress}`);
            }
        } catch (error) {
            console.error('Error loading matching config:', error);
        }
    }

    async processNewOrder(orderData) {
        const startTime = Date.now();
        console.log(`📦 Processing new order ${orderData.orderId} for matching`);

        try {
            // Prevenir processamento concorrente
            if (this.isProcessing) {
                this.processingQueue.push(orderData);
                console.log(`⏳ Order ${orderData.orderId} queued for processing`);
                return;
            }

            this.isProcessing = true;

            // 1. Salvar ordem no banco de dados
            await this.saveOrderToDatabase(orderData);

            // 2. Verificar se há ordens compatíveis para matching
            const matchingOrders = await this.findMatchingOrders(orderData);

            if (matchingOrders.length > 0) {
                console.log(`🎯 Found ${matchingOrders.length} matching orders for order ${orderData.orderId}`);
                await this.executeMatching(orderData, matchingOrders);
            } else {
                console.log(`ℹ️ No matching orders found for order ${orderData.orderId}`);
                // Armazenar ordem no cache para matching futuro
                await this.cacheActiveOrder(orderData);
            }

            // Métricas
            const processingTime = Date.now() - startTime;
            await this.updateMetrics('order_processed', processingTime);

        } catch (error) {
            console.error(`❌ Error processing order ${orderData.orderId}:`, error);
            await this.handleProcessingError(orderData, error);
        } finally {
            this.isProcessing = false;

            // Processar próxima ordem na fila
            if (this.processingQueue.length > 0) {
                const nextOrder = this.processingQueue.shift();
                setImmediate(() => this.processNewOrder(nextOrder));
            }
        }
    }

    async saveOrderToDatabase(orderData) {
        const query = `
            INSERT INTO exchange_orders (
                contract_address, order_id, user_address, order_type,
                amount_token, price_per_token, remaining_amount,
                is_active, block_number, transaction_hash, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT (contract_address, order_id)
            DO UPDATE SET
                remaining_amount = EXCLUDED.remaining_amount,
                is_active = EXCLUDED.is_active,
                updated_at = NOW()
        `;

        const values = [
            orderData.contractAddress,
            orderData.orderId,
            orderData.user,
            orderData.orderType,
            orderData.amountToken,
            orderData.pricePerToken,
            orderData.remainingAmount || orderData.amountToken,
            orderData.isActive,
            orderData.blockNumber,
            orderData.transactionHash
        ];

        await db.query(query, values);
        console.log(`💾 Order ${orderData.orderId} saved to database`);
    }

    async findMatchingOrders(newOrder) {
        const oppositeType = newOrder.orderType === 0 ? 1 : 0; // 0=buy, 1=sell

        // Query otimizada para encontrar ordens compatíveis
        const query = `
            SELECT * FROM exchange_orders
            WHERE contract_address = $1
                AND order_type = $2
                AND is_active = true
                AND remaining_amount > 0
                AND (
                    (order_type = 0 AND CAST(price_per_token AS NUMERIC) >= CAST($3 AS NUMERIC)) OR
                    (order_type = 1 AND CAST(price_per_token AS NUMERIC) <= CAST($3 AS NUMERIC))
                )
            ORDER BY
                CASE WHEN order_type = 0 THEN CAST(price_per_token AS NUMERIC) END DESC,
                CASE WHEN order_type = 1 THEN CAST(price_per_token AS NUMERIC) END ASC,
                created_at ASC
            LIMIT $4
        `;

        const result = await db.query(query, [
            this.contractAddress,
            oppositeType,
            newOrder.pricePerToken,
            this.matchingConfig.maxOrdersPerMatch
        ]);

        return result.rows;
    }

    async executeMatching(newOrder, matchingOrders) {
        const startTime = Date.now();
        console.log(`🤝 Executing matching for order ${newOrder.orderId} with ${matchingOrders.length} orders`);

        try {
            // Organizar ordens por tipo
            const buyOrders = [];
            const sellOrders = [];

            // Adicionar nova ordem
            if (newOrder.orderType === 0) {
                buyOrders.push(BigInt(newOrder.orderId));
            } else {
                sellOrders.push(BigInt(newOrder.orderId));
            }

            // Adicionar ordens compatíveis
            matchingOrders.forEach(order => {
                if (order.order_type === 0) {
                    buyOrders.push(BigInt(order.order_id));
                } else {
                    sellOrders.push(BigInt(order.order_id));
                }
            });

            // Verificar gas price atual
            const gasPrice = await this.provider.getFeeData();
            if (gasPrice.gasPrice > this.matchingConfig.maxGasPrice) {
                console.log(`⛽ Gas price too high, delaying matching`);
                setTimeout(() => this.executeMatching(newOrder, matchingOrders), 30000);
                return;
            }

            // Executar transação de matching
            const tx = await this.contract.matchOrders(buyOrders, sellOrders, {
                gasLimit: this.matchingConfig.gasLimit,
                gasPrice: gasPrice.gasPrice
            });

            console.log(`📤 Matching transaction sent: ${tx.hash}`);

            // Cache da transação pendente
            await redisManager.setBlockchainCache(
                this.contractAddress,
                `pending_match:${tx.hash}`,
                {
                    buyOrders: buyOrders.map(o => o.toString()),
                    sellOrders: sellOrders.map(o => o.toString()),
                    timestamp: Date.now(),
                    status: 'pending'
                },
                3600
            );

            // Aguardar confirmação
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                console.log(`✅ Matching successful: ${tx.hash}`);
                await this.handleSuccessfulMatch(newOrder, matchingOrders, receipt);
                this.metrics.successfulMatches++;
            } else {
                console.log(`❌ Matching transaction failed: ${tx.hash}`);
                await this.handleFailedMatch(newOrder, matchingOrders, receipt);
                this.metrics.failedMatches++;
            }

            // Atualizar métricas
            const matchTime = Date.now() - startTime;
            this.metrics.totalMatches++;
            this.metrics.averageMatchTime = (this.metrics.averageMatchTime + matchTime) / 2;
            this.metrics.lastMatchTimestamp = Date.now();

            await this.updateMetrics('match_executed', matchTime);

        } catch (error) {
            console.error(`❌ Error executing matching:`, error);
            this.metrics.failedMatches++;
            await this.handleMatchingError(newOrder, matchingOrders, error);
        }
    }

    async handleSuccessfulMatch(newOrder, matchingOrders, receipt) {
        // Processar eventos de matching do receipt
        const matchEvents = receipt.logs.filter(log => {
            try {
                const parsed = this.contract.interface.parseLog(log);
                return parsed.name === 'OrdersMatched';
            } catch {
                return false;
            }
        });

        for (const event of matchEvents) {
            const parsed = this.contract.interface.parseLog(event);

            // Criar registro de trade
            await this.createTradeRecord({
                buyOrderId: parsed.args.buyOrderId.toString(),
                sellOrderId: parsed.args.sellOrderId.toString(),
                amount: parsed.args.amount.toString(),
                price: parsed.args.price.toString(),
                buyer: parsed.args.buyer.toLowerCase(),
                seller: parsed.args.seller.toLowerCase(),
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber
            });
        }

        // Limpar cache de ordens processadas
        for (const order of matchingOrders) {
            await redisManager.setBlockchainCache(
                this.contractAddress,
                `order:${order.order_id}`,
                null,
                1
            );
        }
    }

    async createTradeRecord(tradeData) {
        const query = `
            INSERT INTO trades (
                contract_address, buy_order_id, sell_order_id,
                quantity, price, buyer_address, seller_address,
                transaction_hash, block_number, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `;

        const values = [
            this.contractAddress,
            tradeData.buyOrderId,
            tradeData.sellOrderId,
            tradeData.amount,
            tradeData.price,
            tradeData.buyer,
            tradeData.seller,
            tradeData.transactionHash,
            tradeData.blockNumber
        ];

        await db.query(query, values);
        console.log(`💰 Trade record created for orders ${tradeData.buyOrderId}/${tradeData.sellOrderId}`);
    }

    async processOrderCancellation(cancelData) {
        console.log(`❌ Processing order cancellation ${cancelData.orderId}`);

        try {
            // Atualizar status no banco
            const query = `
                UPDATE exchange_orders
                SET is_active = false, updated_at = NOW()
                WHERE contract_address = $1 AND order_id = $2
            `;

            await db.query(query, [this.contractAddress, cancelData.orderId]);

            // Remover do cache
            await redisManager.setBlockchainCache(
                this.contractAddress,
                `order:${cancelData.orderId}`,
                null,
                1
            );

            console.log(`✅ Order ${cancelData.orderId} marked as cancelled`);
        } catch (error) {
            console.error(`Error processing cancellation:`, error);
        }
    }

    async cacheActiveOrder(orderData) {
        // Cache ordem ativa para consultas rápidas
        await redisManager.setBlockchainCache(
            this.contractAddress,
            `active_order:${orderData.orderType}:${orderData.orderId}`,
            orderData,
            1800 // 30 minutos
        );
    }

    async updateMetrics(operation, duration) {
        const currentMetrics = await redisManager.getBlockchainCache(
            this.contractAddress,
            'metrics'
        ) || {};

        const updatedMetrics = {
            ...currentMetrics,
            [operation]: {
                count: (currentMetrics[operation]?.count || 0) + 1,
                averageDuration: ((currentMetrics[operation]?.averageDuration || 0) + duration) / 2,
                lastUpdate: Date.now()
            }
        };

        await redisManager.setBlockchainCache(
            this.contractAddress,
            'metrics',
            updatedMetrics,
            3600
        );
    }

    async handleProcessingError(orderData, error) {
        const errorData = {
            contractAddress: this.contractAddress,
            orderId: orderData.orderId,
            error: error.message,
            timestamp: Date.now(),
            orderData
        };

        await redisManager.setSecure('errors',
            `processing_error:${orderData.orderId}:${Date.now()}`,
            errorData,
            86400
        );

        // Retry logic para erros recuperáveis
        if (this.isRecoverableError(error)) {
            console.log(`🔄 Retrying order processing for ${orderData.orderId}`);
            setTimeout(() => {
                this.processNewOrder(orderData);
            }, 5000);
        }
    }

    async handleMatchingError(newOrder, matchingOrders, error) {
        const errorData = {
            contractAddress: this.contractAddress,
            newOrderId: newOrder.orderId,
            matchingOrderIds: matchingOrders.map(o => o.order_id),
            error: error.message,
            timestamp: Date.now()
        };

        await redisManager.setSecure('errors',
            `matching_error:${newOrder.orderId}:${Date.now()}`,
            errorData,
            86400
        );

        // Se erro de gas, tentar novamente com gas maior
        if (error.message.includes('gas')) {
            console.log(`⛽ Gas error detected, retrying with higher gas limit`);
            this.matchingConfig.gasLimit = Math.min(
                this.matchingConfig.gasLimit * 1.2,
                1000000
            );

            setTimeout(() => {
                this.executeMatching(newOrder, matchingOrders);
            }, 10000);
        }
    }

    isRecoverableError(error) {
        const recoverableErrors = [
            'network error',
            'timeout',
            'connection reset',
            'temporary failure'
        ];

        return recoverableErrors.some(errorType =>
            error.message.toLowerCase().includes(errorType)
        );
    }

    async getMetrics() {
        const redisMetrics = await redisManager.getBlockchainCache(
            this.contractAddress,
            'metrics'
        ) || {};

        return {
            ...this.metrics,
            redis: redisMetrics,
            contractAddress: this.contractAddress,
            isProcessing: this.isProcessing,
            queueLength: this.processingQueue.length,
            timestamp: Date.now()
        };
    }

    async shutdown() {
        console.log(`🛑 Shutting down SecureMatchingEngine for ${this.contractAddress}`);

        this.isProcessing = false;
        this.processingQueue = [];

        // Salvar métricas finais
        await redisManager.setBlockchainCache(
            this.contractAddress,
            'final_metrics',
            this.metrics,
            86400
        );

        console.log(`✅ SecureMatchingEngine shutdown complete for ${this.contractAddress}`);
    }
}

module.exports = SecureMatchingEngine;
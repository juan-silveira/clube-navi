const { PrismaClient } = require('../generated/prisma');
const { ethers } = require('ethers');
const EventEmitter = require('events');
const { normalizeAddress } = require('../utils/address');

class ExchangeService extends EventEmitter {
    constructor() {
        super();
        this.prisma = global.prisma || new PrismaClient();
        this.provider = null;
        this.contract = null;
        this.initialized = false;
    }

    async initialize(contractAddress, contractABI, providerUrl) {
        try {
            this.contractAddress = contractAddress;
            this.provider = new ethers.JsonRpcProvider(providerUrl);
            this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);

            // Escutar eventos do contrato
            this.setupEventListeners();

            this.initialized = true;
            console.log('ExchangeService initialized');
        } catch (error) {
            console.error('Failed to initialize ExchangeService:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // DESABILITADO: Event listeners causam "Batch request length too long"
        // Os eventos são processados via polling no ExchangeEventListener
        console.log('⚠️ Event listeners desabilitados - usando polling mode');
        return;

        /* CÓDIGO ORIGINAL COMENTADO
        // Wrapper para capturar erros nos event listeners
        const safeEventListener = (eventName, handler) => {
            try {
                this.contract.on(eventName, async (...args) => {
                    try {
                        await handler(...args);
                    } catch (error) {
                        // Filtrar erros específicos do FilterIdEventSubscriber
                        if (error.message && error.message.includes('results is not iterable')) {
                            console.warn(`⚠️ Filtered ${eventName} error: ${error.message}`);
                            return;
                        }
                        console.error(`❌ Error in ${eventName} handler:`, error);
                    }
                });
            } catch (error) {
                console.error(`❌ Error setting up ${eventName} listener:`, error);
            }
        };
        */

        // Escutar criação de ordens de compra
        safeEventListener('BuyOrderCreated', async (buyer, orderId, amountAsset, pricePerAsset) => {
            console.log(`🟢 Buy order created: ${orderId} by ${buyer}`);
            // Note: Order sync is handled by OrderManagementService now
            this.emit('orderCreated', { orderId, user: buyer, orderType: 'BUY', amountToken: amountAsset, pricePerToken: pricePerAsset });
        });

        // Escutar criação de ordens de venda
        safeEventListener('SellOrderCreated', async (seller, orderId, amountAsset, pricePerAsset) => {
            console.log(`🔴 Sell order created: ${orderId} by ${seller}`);
            // Note: Order sync is handled by OrderManagementService now
            this.emit('orderCreated', { orderId, user: seller, orderType: 'SELL', amountToken: amountAsset, pricePerToken: pricePerAsset });
        });

        // Escutar matches
        safeEventListener('OrdersMatched', async (buyOrderId, sellOrderId, buyer, seller, amountMatched, pricePerAsset, fee, event) => {
            // Obter transaction hash e block number do evento
            const transactionHash = event?.transactionHash || event?.log?.transactionHash;
            const blockNumber = event?.blockNumber || event?.log?.blockNumber;

            await this.syncTrade({
                buyOrderId,
                sellOrderId,
                buyer,
                seller,
                amountMatched,
                pricePerToken: pricePerAsset,
                fee,
                exchangeContractAddress: this.contractAddress,
                transactionHash,
                blockNumber
            });
            this.emit('orderMatched', { buyOrderId, sellOrderId, amountMatched, pricePerToken: pricePerAsset });
        });

        // Escutar cancelamento de ordens de compra
        safeEventListener('BuyOrderCancelled', async (buyer, orderId) => {
            await this.cancelOrder(orderId);
            this.emit('orderCancelled', { orderId, user: buyer });
        });

        // Escutar cancelamento de ordens de venda
        safeEventListener('SellOrderCancelled', async (seller, orderId) => {
            await this.cancelOrder(orderId);
            this.emit('orderCancelled', { orderId, user: seller });
        });
    }

    // Sincronizar ordem do blockchain
    async syncOrder(orderId) {
        try {
            const orderData = await this.contract.orders(orderId);
            const tradingPairId = await this.getTradingPairId(orderData);

            await this.prisma.exchangeOrders.upsert({
                where: { order_id_blockchain: Number(orderId) },
                update: {
                    remaining_amount: orderData.remainingAmount.toString(),
                    status: this.getOrderStatus(orderData),
                    updated_at: new Date()
                },
                create: {
                    order_id_blockchain: Number(orderId),
                    trading_pair_id: tradingPairId,
                    user_address: normalizeAddress(orderData.user),
                    order_type: orderData.orderType === 0 ? 'BUY' : 'SELL',
                    price: ethers.formatEther(orderData.pricePerToken),
                    amount: ethers.formatEther(orderData.amountToken),
                    remaining_amount: ethers.formatEther(orderData.remainingAmount),
                    status: this.getOrderStatus(orderData)
                }
            });
        } catch (error) {
            console.error('Error syncing order:', error);
            throw error;
        }
    }

    // Registrar trade executado
    async syncTrade(tradeData) {
        try {
            const tradingPairId = 1; // TODO: Determinar par baseado nos tokens

            const buyOrder = await this.prisma.exchangeOrder.findFirst({
                where: {
                    blockchainOrderId: BigInt(tradeData.buyOrderId),
                    exchangeContractAddress: tradeData.exchangeContractAddress || tradeData.contractAddress
                }
            });

            const sellOrder = await this.prisma.exchangeOrder.findFirst({
                where: {
                    blockchainOrderId: BigInt(tradeData.sellOrderId),
                    exchangeContractAddress: tradeData.exchangeContractAddress || tradeData.contractAddress
                }
            });

            // Criar registro do trade
            await this.prisma.exchangeTrade.create({
                data: {
                    exchangeContractAddress: tradeData.exchangeContractAddress || tradeData.contractAddress,
                    buyOrderId: buyOrder?.id,
                    sellOrderId: sellOrder?.id,
                    buyerAddress: normalizeAddress(tradeData.buyer),
                    sellerAddress: normalizeAddress(tradeData.seller),
                    tokenASymbol: 'cBRL',
                    tokenBSymbol: 'PCN',
                    // Converter BigInt/wei para formato decimal legível
                    price: tradeData.pricePerToken ? ethers.formatEther(tradeData.pricePerToken) : '0',
                    amount: tradeData.amountMatched ? ethers.formatEther(tradeData.amountMatched) : '0',
                    totalValue: tradeData.amountMatched && tradeData.pricePerToken ?
                        (parseFloat(ethers.formatEther(tradeData.amountMatched)) * parseFloat(ethers.formatEther(tradeData.pricePerToken))).toString() : '0',
                    feeAmount: tradeData.fee ? ethers.formatEther(tradeData.fee) : '0',
                    transactionHash: tradeData.transactionHash || '0x',
                    blockNumber: tradeData.blockNumber ? tradeData.blockNumber.toString() : '0',
                    tradeTimestamp: new Date()
                }
            });

            // Atualizar status das ordens
            // TODO: sincronização está sendo feita pelo OrderManagementService
            // await this.syncOrder(tradeData.buyOrderId);
            // await this.syncOrder(tradeData.sellOrderId);
        } catch (error) {
            console.error('Error syncing trade:', error);
            throw error;
        }
    }

    // Cancelar ordem
    async cancelOrder(orderId) {
        try {
            await this.prisma.exchangeOrder.updateMany({
                where: { blockchainOrderId: BigInt(orderId) },
                data: {
                    status: 'CANCELLED',
                    remainingAmount: 0,
                    updatedAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    // Obter order book agregado
    async getOrderBook(symbol, depth = 20) {
        try {
            const tradingPair = await this.prisma.tradingPairs.findUnique({
                where: { symbol }
            });

            if (!tradingPair) {
                throw new Error('Trading pair not found');
            }

            // Buscar ordens agregadas por preço
            const buyOrders = await this.prisma.$queryRaw`
                SELECT
                    price,
                    SUM(remaining_amount) as total_amount,
                    COUNT(*) as order_count,
                    ARRAY_AGG(
                        json_build_object(
                            'id', order_id_blockchain,
                            'amount', remaining_amount,
                            'created_at', created_at
                        ) ORDER BY created_at ASC
                    ) as orders
                FROM exchange_orders
                WHERE trading_pair_id = ${tradingPair.id}
                AND order_type = 'BUY'
                AND status IN ('OPEN', 'PARTIALLY_FILLED')
                GROUP BY price
                ORDER BY price DESC
                LIMIT ${depth}
            `;

            const sellOrders = await this.prisma.$queryRaw`
                SELECT
                    price,
                    SUM(remaining_amount) as total_amount,
                    COUNT(*) as order_count,
                    ARRAY_AGG(
                        json_build_object(
                            'id', order_id_blockchain,
                            'amount', remaining_amount,
                            'created_at', created_at
                        ) ORDER BY created_at ASC
                    ) as orders
                FROM exchange_orders
                WHERE trading_pair_id = ${tradingPair.id}
                AND order_type = 'SELL'
                AND status IN ('OPEN', 'PARTIALLY_FILLED')
                GROUP BY price
                ORDER BY price ASC
                LIMIT ${depth}
            `;

            return {
                symbol,
                bids: buyOrders.map(o => ({
                    price: parseFloat(o.price),
                    amount: parseFloat(o.total_amount),
                    orderCount: parseInt(o.order_count),
                    orders: o.orders // Detalhes para FIFO
                })),
                asks: sellOrders.map(o => ({
                    price: parseFloat(o.price),
                    amount: parseFloat(o.total_amount),
                    orderCount: parseInt(o.order_count),
                    orders: o.orders // Detalhes para FIFO
                }))
            };
        } catch (error) {
            console.error('Error getting order book:', error);
            throw error;
        }
    }

    // Obter ordens para matching
    async getMatchingOrders(tradingPairId, orderType, priceLimit, amountNeeded) {
        try {
            const orders = await this.prisma.$queryRaw`
                SELECT * FROM get_matching_orders(
                    ${tradingPairId}::int,
                    ${orderType}::varchar,
                    ${priceLimit}::decimal,
                    ${amountNeeded}::decimal
                )
            `;

            return orders;
        } catch (error) {
            console.error('Error getting matching orders:', error);
            throw error;
        }
    }

    // Obter candles para gráfico
    async getCandles(symbol, interval = '1m', limit = 100) {
        try {
            const tradingPair = await this.prisma.tradingPairs.findUnique({
                where: { symbol }
            });

            if (!tradingPair) {
                throw new Error('Trading pair not found');
            }

            let tableName = 'candles_1m';
            let groupBy = 1;

            // Determinar intervalo
            switch(interval) {
                case '5m':
                    groupBy = 5;
                    break;
                case '15m':
                    groupBy = 15;
                    break;
                case '1h':
                    groupBy = 60;
                    break;
                case '4h':
                    groupBy = 240;
                    break;
                case '1d':
                    groupBy = 1440;
                    break;
            }

            // Agregar candles se necessário
            const candles = await this.prisma.$queryRaw`
                SELECT
                    date_trunc('minute', timestamp) -
                        (EXTRACT(MINUTE FROM timestamp)::int % ${groupBy}) * INTERVAL '1 minute' as time,
                    (array_agg(open ORDER BY timestamp ASC))[1] as open,
                    MAX(high) as high,
                    MIN(low) as low,
                    (array_agg(close ORDER BY timestamp DESC))[1] as close,
                    SUM(volume) as volume
                FROM candles_1m
                WHERE trading_pair_id = ${tradingPair.id}
                AND timestamp >= NOW() - INTERVAL '${limit * groupBy} minutes'
                GROUP BY time
                ORDER BY time DESC
                LIMIT ${limit}
            `;

            return candles.reverse().map(c => ({
                time: c.time.getTime() / 1000,
                open: parseFloat(c.open),
                high: parseFloat(c.high),
                low: parseFloat(c.low),
                close: parseFloat(c.close),
                volume: parseFloat(c.volume)
            }));
        } catch (error) {
            console.error('Error getting candles:', error);
            throw error;
        }
    }

    // Obter estatísticas 24h
    async getStats24h(symbol) {
        try {
            const stats = await this.prisma.$queryRaw`
                SELECT * FROM trading_stats_24h
                WHERE symbol = ${symbol}
            `;

            return stats[0] || {
                symbol,
                last_price: 0,
                price_change_24h: 0,
                price_change_pct_24h: 0,
                high_24h: 0,
                low_24h: 0,
                volume_24h: 0,
                trade_count_24h: 0
            };
        } catch (error) {
            console.error('Error getting 24h stats:', error);
            throw error;
        }
    }

    // Obter trades recentes
    async getRecentTrades(symbol, limit = 50) {
        try {
            const tradingPair = await this.prisma.tradingPairs.findUnique({
                where: { symbol }
            });

            if (!tradingPair) {
                throw new Error('Trading pair not found');
            }

            const trades = await this.prisma.trades.findMany({
                where: { trading_pair_id: tradingPair.id },
                orderBy: { executed_at: 'desc' },
                take: limit,
                select: {
                    id: true,
                    price: true,
                    amount: true,
                    total_value: true,
                    buyer_address: true,
                    seller_address: true,
                    executed_at: true
                }
            });

            return trades.map(t => ({
                id: t.id,
                price: parseFloat(t.price),
                amount: parseFloat(t.amount),
                value: parseFloat(t.total_value),
                side: 'buy', // Determinar baseado no taker
                time: t.executed_at.getTime()
            }));
        } catch (error) {
            console.error('Error getting recent trades:', error);
            throw error;
        }
    }

    // Helpers
    getOrderStatus(orderData) {
        if (!orderData.isActive) return 'CANCELLED';
        if (orderData.remainingAmount === 0n) return 'FILLED';
        if (orderData.remainingAmount < orderData.amountToken) return 'PARTIALLY_FILLED';
        return 'OPEN';
    }

    async getTradingPairId(orderData) {
        // TODO: Implementar lógica para determinar o par baseado nos tokens
        return 1;
    }
}

module.exports = ExchangeService;
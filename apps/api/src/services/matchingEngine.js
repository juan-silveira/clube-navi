const { ethers } = require('ethers');
const EventEmitter = require('events');
const { PrismaClient } = require('../generated/prisma');
const redisService = require('./redis.service');
const { normalizeAddress } = require('../utils/address');
const websocketBroadcast = require('./websocketBroadcast');

class MatchingEngine extends EventEmitter {
    constructor(orderManagementService, redisService) {
        super();
        this.orderManagement = orderManagementService;
        this.redis = redisService;
        this.prisma = global.prisma || new PrismaClient();
        this.isProcessing = false;
        this.processedOrders = new Set();
        this.monitoringActive = false;
    }

    /**
     * Detectar e executar matches quando spread <= 0
     */
    async detectAndExecuteMatches(exchangeContractAddress) {
        let buyOrderIds = [];
        let sellOrderIds = [];

        try {
            console.log('🎯 Checking for potential matches...');

            // Buscar order book atualizado
            const orderBook = await this.orderManagement.getOrderBook(exchangeContractAddress);

            if (!orderBook.bids.length || !orderBook.asks.length) {
                // console.log('📊 No matching possible - missing bids or asks');
                return;
            }

            // Ordenar por prioridade FIFO (melhor preço + mais antigo)
            const sortedBids = orderBook.bids.sort((a, b) => {
                if (b.price !== a.price) return b.price - a.price; // Maior preço primeiro
                return new Date(a.createdAt) - new Date(b.createdAt); // Mais antigo primeiro
            });

            const sortedAsks = orderBook.asks.sort((a, b) => {
                if (a.price !== b.price) return a.price - b.price; // Menor preço primeiro
                return new Date(a.createdAt) - new Date(b.createdAt); // Mais antigo primeiro
            });

            const bestBid = sortedBids[0];
            const bestAsk = sortedAsks[0];
            const spread = bestAsk.price - bestBid.price;

            // console.log(`📊 Best bid: ${bestBid.price}, Best ask: ${bestAsk.price}, Spread: ${spread}`);

            if (spread > 0) {
                console.log('✅ Spread positive, no matching needed');
                return;
            }

            console.log('🔥 Spread <= 0 detected! Automatic matching disabled - deferring to AutoMatchingService...');

            // 🚫 AUTOMATIC MATCHING DISABLED 🚫
            // Matches são agora processados via AutoMatchingService -> RabbitMQ -> MatchExecutorService
            // Esta mudança previne conflitos entre dois sistemas de matching rodando simultaneamente
            console.log('   ℹ️ Match will be processed by AutoMatchingService via RabbitMQ queue');
            return; // Sair sem fazer matching automático

            // Calcular ordens que serão envolvidas no match
            const matchingOrdersResult = this.calculateMatchingOrders(sortedBids, sortedAsks);
            buyOrderIds = matchingOrdersResult.buyOrderIds;
            sellOrderIds = matchingOrdersResult.sellOrderIds;

            if (buyOrderIds.length === 0 || sellOrderIds.length === 0) {
                console.log('📊 No valid matching orders found');
                return;
            }

            // STEP 1: Marcar ordens como MATCHING (estado transitório)
            console.log('🔄 Marking orders as MATCHING (transitional state)...');
            await this.setOrdersToMatching(exchangeContractAddress, buyOrderIds, sellOrderIds);

            // STEP 2: Enviar WebSocket para esconder ordens do frontend
            console.log('📡 Broadcasting order book update (hiding matching orders)...');
            await this.broadcastOrderBookUpdate(exchangeContractAddress);

            // STEP 3: Executar matching no blockchain
            console.log('⛓️ Executing blockchain matching...');
            const result = await this.executeMatching(exchangeContractAddress, sortedBids, sortedAsks);

            // STEP 4: Processar resultado e atualizar ordens
            if (result && result.success) {
                console.log('✅ Matching successful, processing results...');
                await this.processMatchingResults(exchangeContractAddress, result, buyOrderIds, sellOrderIds);
            } else {
                console.log('❌ Matching failed, reverting order states...');
                await this.revertOrdersFromMatching(exchangeContractAddress, buyOrderIds, sellOrderIds);
            }

            // STEP 5: Enviar WebSocket final com order book atualizado
            console.log('📡 Broadcasting final order book update...');
            await this.broadcastOrderBookUpdate(exchangeContractAddress);

        } catch (error) {
            console.error('❌ Error in detectAndExecuteMatches:', error);
            // Em caso de erro, reverter todas as ordens para ACTIVE
            try {
                const allOrderIds = [...(buyOrderIds || []), ...(sellOrderIds || [])];
                if (allOrderIds.length > 0) {
                    await this.revertOrdersFromMatching(exchangeContractAddress, buyOrderIds || [], sellOrderIds || []);
                    await this.broadcastOrderBookUpdate(exchangeContractAddress);
                }
            } catch (revertError) {
                console.error('❌ Error reverting orders:', revertError);
            }
        }
    }

    /**
     * Executar matching chamando o contrato
     */
    async executeMatching(exchangeContractAddress, sortedBids, sortedAsks) {
        try {
            // Coletar ordens que farão match mantendo spread positivo
            let { buyOrderIds, sellOrderIds } = this.calculateMatchingOrders(sortedBids, sortedAsks);

            if (buyOrderIds.length === 0 || sellOrderIds.length === 0) {
                console.log('📊 No valid matching orders found');
                return;
            }

            console.log(`🎯 Pre-validation: ${buyOrderIds.length} buy orders, ${sellOrderIds.length} sell orders`);
            console.log(`📝 Buy IDs: [${buyOrderIds.join(', ')}]`);
            console.log(`📝 Sell IDs: [${sellOrderIds.join(', ')}]`);

            // PASSO 1: Validar ordens no blockchain antes de executar matching
            console.log('🔍 Validating orders on blockchain...');
            const validationResult = await this.validateOrdersOnBlockchain(
                exchangeContractAddress,
                buyOrderIds,
                sellOrderIds
            );

            if (!validationResult.isValid) {
                console.log('⚠️ Some orders are invalid, updating order book and recalculating...');

                // Atualizar status das ordens inválidas no banco
                await this.updateInvalidOrders(exchangeContractAddress, validationResult.invalidOrders);

                // Recarregar ordens do banco e recalcular
                const refreshedOrders = await this.getActiveOrders(exchangeContractAddress);
                const newSortedBids = refreshedOrders.bids.sort((a, b) => b.price - a.price);
                const newSortedAsks = refreshedOrders.asks.sort((a, b) => a.price - b.price);

                // Recalcular matching com ordens válidas
                const newMatching = this.calculateMatchingOrders(newSortedBids, newSortedAsks);
                buyOrderIds = newMatching.buyOrderIds;
                sellOrderIds = newMatching.sellOrderIds;

                if (buyOrderIds.length === 0 || sellOrderIds.length === 0) {
                    console.log('📊 No valid matching orders found after validation');
                    return;
                }

                console.log(`🔄 Recalculated matching: ${buyOrderIds.length} buy orders, ${sellOrderIds.length} sell orders`);
            }

            // PASSO 2: Executar matching com ordens validadas
            console.log(`🎯 Executing validated matching: ${buyOrderIds.length} buy orders, ${sellOrderIds.length} sell orders`);
            console.log(`📝 Final Buy IDs: [${buyOrderIds.join(', ')}]`);
            console.log(`📝 Final Sell IDs: [${sellOrderIds.join(', ')}]`);

            // Chamar função matchOrders do contrato
            const result = await this.orderManagement.executeMatchOrders(
                exchangeContractAddress,
                buyOrderIds,
                sellOrderIds
            );

            console.log('✅ Matching executed successfully:', result);
            return result;

        } catch (error) {
            console.error('❌ Error executing matching:', error);
            throw error;
        }
    }

    /**
     * Calcular quais ordens farão match mantendo spread positivo
     */
    calculateMatchingOrders(sortedBids, sortedAsks) {
        const buyOrderIds = [];
        const sellOrderIds = [];

        let bidIndex = 0;
        let askIndex = 0;
        let remainingBuyAmount = 0;
        let remainingSellAmount = 0;

        // Enquanto houver overlap de preços (spread <= 0)
        while (bidIndex < sortedBids.length && askIndex < sortedAsks.length) {
            const bid = sortedBids[bidIndex];
            const ask = sortedAsks[askIndex];

            // Se não há mais overlap, parar
            if (bid.price < ask.price) {
                break;
            }

            // Adicionar ordens aos arrays se ainda não adicionadas
            if (!buyOrderIds.includes(bid.blockchainOrderId)) {
                buyOrderIds.push(bid.blockchainOrderId);
                remainingBuyAmount += bid.remainingAmount;
            }

            if (!sellOrderIds.includes(ask.blockchainOrderId)) {
                sellOrderIds.push(ask.blockchainOrderId);
                remainingSellAmount += ask.remainingAmount;
            }

            // Determinar qual lado está completo e avançar
            if (remainingBuyAmount <= remainingSellAmount) {
                remainingSellAmount -= remainingBuyAmount;
                remainingBuyAmount = 0;
                bidIndex++;
            } else {
                remainingBuyAmount -= remainingSellAmount;
                remainingSellAmount = 0;
                askIndex++;
            }
        }

        return { buyOrderIds, sellOrderIds };
    }

    /**
     * Validar ordens no blockchain antes de executar matching
     */
    async validateOrdersOnBlockchain(exchangeContractAddress, buyOrderIds, sellOrderIds) {
        try {
            console.log('🔍 Validating orders on blockchain...');

            const contract = this.orderManagement.exchangeContracts.get(exchangeContractAddress.toLowerCase());
            if (!contract) {
                throw new Error(`Contract not found: ${exchangeContractAddress}`);
            }

            const invalidOrders = [];
            let isValid = true;

            // Validar ordens de compra
            for (const buyId of buyOrderIds) {
                try {
                    const buyOrder = await contract.buyOrders(buyId);
                    const remainingAmount = parseFloat(buyOrder.amountTokenB?.toString() || '0');

                    console.log(`🔍 Buy Order ${buyId}:`, {
                        user: buyOrder.user,
                        amountTokenB: buyOrder.amountTokenB?.toString(),
                        pricePerTokenB: buyOrder.pricePerTokenB?.toString(),
                        isActive: buyOrder.isActive,
                        remainingAmount: remainingAmount
                    });

                    // Lógica precisa de validação
                    if (buyOrder.isActive && remainingAmount > 0) {
                        // ✅ Ordem válida - ativa com quantidade disponível
                        console.log(`✅ Buy order ${buyId} is valid (active with ${remainingAmount} remaining)`);
                    } else if (!buyOrder.isActive && remainingAmount > 0) {
                        // ❌ Ordem cancelada
                        console.log(`❌ Buy order ${buyId} was CANCELLED (inactive with remaining amount)`);
                        invalidOrders.push({ id: buyId, type: 'buy', reason: 'cancelled', status: 'CANCELLED' });
                        isValid = false;
                    } else if (!buyOrder.isActive && remainingAmount === 0) {
                        // ❌ Ordem executada
                        console.log(`❌ Buy order ${buyId} was EXECUTED (inactive with 0 remaining)`);
                        invalidOrders.push({ id: buyId, type: 'buy', reason: 'executed', status: 'EXECUTED' });
                        isValid = false;
                    } else if (buyOrder.isActive && remainingAmount === 0) {
                        // ❌ Estado inconsistente
                        console.log(`❌ Buy order ${buyId} has inconsistent state (active but 0 remaining)`);
                        invalidOrders.push({ id: buyId, type: 'buy', reason: 'inconsistent', status: 'EXECUTED' });
                        isValid = false;
                    } else {
                        // ❌ Ordem inválida por outros motivos
                        console.log(`❌ Buy order ${buyId} is invalid`);
                        invalidOrders.push({ id: buyId, type: 'buy', reason: 'invalid', status: 'CANCELLED' });
                        isValid = false;
                    }
                } catch (error) {
                    console.log(`❌ Error reading buy order ${buyId}:`, error.message);
                    invalidOrders.push({ id: buyId, type: 'buy', reason: 'read_error', status: 'CANCELLED' });
                    isValid = false;
                }
            }

            // Validar ordens de venda
            for (const sellId of sellOrderIds) {
                try {
                    const sellOrder = await contract.sellOrders(sellId);
                    const remainingAmount = parseFloat(sellOrder.amountTokenB?.toString() || '0');

                    console.log(`🔍 Sell Order ${sellId}:`, {
                        user: sellOrder.user,
                        amountTokenB: sellOrder.amountTokenB?.toString(),
                        pricePerTokenB: sellOrder.pricePerTokenB?.toString(),
                        isActive: sellOrder.isActive,
                        remainingAmount: remainingAmount
                    });

                    // Lógica precisa de validação
                    if (sellOrder.isActive && remainingAmount > 0) {
                        // ✅ Ordem válida - ativa com quantidade disponível
                        console.log(`✅ Sell order ${sellId} is valid (active with ${remainingAmount} remaining)`);
                    } else if (!sellOrder.isActive && remainingAmount > 0) {
                        // ❌ Ordem cancelada
                        console.log(`❌ Sell order ${sellId} was CANCELLED (inactive with remaining amount)`);
                        invalidOrders.push({ id: sellId, type: 'sell', reason: 'cancelled', status: 'CANCELLED' });
                        isValid = false;
                    } else if (!sellOrder.isActive && remainingAmount === 0) {
                        // ❌ Ordem executada
                        console.log(`❌ Sell order ${sellId} was EXECUTED (inactive with 0 remaining)`);
                        invalidOrders.push({ id: sellId, type: 'sell', reason: 'executed', status: 'EXECUTED' });
                        isValid = false;
                    } else if (sellOrder.isActive && remainingAmount === 0) {
                        // ❌ Estado inconsistente
                        console.log(`❌ Sell order ${sellId} has inconsistent state (active but 0 remaining)`);
                        invalidOrders.push({ id: sellId, type: 'sell', reason: 'inconsistent', status: 'EXECUTED' });
                        isValid = false;
                    } else {
                        // ❌ Ordem inválida por outros motivos
                        console.log(`❌ Sell order ${sellId} is invalid`);
                        invalidOrders.push({ id: sellId, type: 'sell', reason: 'invalid', status: 'CANCELLED' });
                        isValid = false;
                    }
                } catch (error) {
                    console.log(`❌ Error reading sell order ${sellId}:`, error.message);
                    invalidOrders.push({ id: sellId, type: 'sell', reason: 'read_error', status: 'CANCELLED' });
                    isValid = false;
                }
            }

            console.log(`✅ Validation completed: ${isValid ? 'All orders valid' : `${invalidOrders.length} invalid orders found`}`);

            return {
                isValid,
                invalidOrders
            };

        } catch (error) {
            console.error('❌ Error validating orders on blockchain:', error);
            return {
                isValid: false,
                invalidOrders: [...buyOrderIds.map(id => ({ id, type: 'buy', reason: 'validation_error' })),
                               ...sellOrderIds.map(id => ({ id, type: 'sell', reason: 'validation_error' }))]
            };
        }
    }

    /**
     * Atualizar ordens inválidas no banco de dados com status correto
     */
    async updateInvalidOrders(exchangeContractAddress, invalidOrders) {
        try {
            console.log(`🔄 Updating ${invalidOrders.length} invalid orders in database...`);

            for (const invalidOrder of invalidOrders) {
                const newStatus = invalidOrder.status || 'CANCELLED'; // Use status específico ou default CANCELLED

                await this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(invalidOrder.id),
                        exchangeContractAddress: exchangeContractAddress,
                        status: 'ACTIVE'
                    },
                    data: {
                        status: newStatus,
                        updatedAt: new Date()
                    }
                });

                console.log(`✅ Updated invalid order ${invalidOrder.id} (${invalidOrder.type}) to ${newStatus} - Reason: ${invalidOrder.reason}`);
            }

        } catch (error) {
            console.error('❌ Error updating invalid orders:', error);
        }
    }

    /**
     * Recarregar ordens ativas do banco de dados
     */
    async getActiveOrders(exchangeContractAddress) {
        try {
            const orders = await this.prisma.exchangeOrder.findMany({
                where: {
                    exchangeContractAddress: exchangeContractAddress,
                    status: 'ACTIVE'
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            const bids = orders
                .filter(order => order.orderType === 'BUY')
                .map(order => ({
                    blockchainOrderId: Number(order.blockchainOrderId),
                    price: parseFloat(order.price),
                    remainingAmount: parseFloat(order.remainingAmount),
                    userAddress: order.userAddress
                }));

            const asks = orders
                .filter(order => order.orderType === 'SELL')
                .map(order => ({
                    blockchainOrderId: Number(order.blockchainOrderId),
                    price: parseFloat(order.price),
                    remainingAmount: parseFloat(order.remainingAmount),
                    userAddress: order.userAddress
                }));

            console.log(`📊 Reloaded orders: ${bids.length} bids, ${asks.length} asks`);

            return { bids, asks };

        } catch (error) {
            console.error('❌ Error reloading active orders:', error);
            return { bids: [], asks: [] };
        }
    }

    /**
     * Marcar ordens como MATCHING (estado transitório)
     */
    async setOrdersToMatching(exchangeContractAddress, buyOrderIds, sellOrderIds) {
        try {
            const allOrderIds = [...buyOrderIds, ...sellOrderIds];

            for (const orderId of allOrderIds) {
                await this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: orderId,
                        exchangeContractAddress: exchangeContractAddress,
                        status: 'ACTIVE'
                    },
                    data: {
                        status: 'MATCHING',
                        updatedAt: new Date()
                    }
                });
            }

            console.log(`🔄 Marked ${allOrderIds.length} orders as MATCHING`);
        } catch (error) {
            console.error('❌ Error setting orders to MATCHING:', error);
            throw error;
        }
    }

    /**
     * Reverter ordens de MATCHING para ACTIVE em caso de erro
     */
    async revertOrdersFromMatching(exchangeContractAddress, buyOrderIds, sellOrderIds) {
        try {
            const allOrderIds = [...buyOrderIds, ...sellOrderIds];

            for (const orderId of allOrderIds) {
                await this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: orderId,
                        exchangeContractAddress: exchangeContractAddress,
                        status: 'MATCHING'
                    },
                    data: {
                        status: 'ACTIVE',
                        updatedAt: new Date()
                    }
                });
            }

            console.log(`🔄 Reverted ${allOrderIds.length} orders from MATCHING to ACTIVE`);
        } catch (error) {
            console.error('❌ Error reverting orders from MATCHING:', error);
        }
    }

    /**
     * Processar resultados do matching e atualizar ordens adequadamente
     */
    async processMatchingResults(exchangeContractAddress, matchingResult, buyOrderIds, sellOrderIds) {
        try {
            console.log('🔄 Processing matching results...');

            // Re-sincronizar status das ordens com o blockchain
            const allOrderIds = [...buyOrderIds, ...sellOrderIds];

            for (const orderId of allOrderIds) {
                // Buscar status real da ordem no blockchain
                let blockchainOrder = null;
                let isActive = false;

                try {
                    // Verificar se é buy ou sell order pelo ID
                    const dbOrder = await this.prisma.exchangeOrder.findFirst({
                        where: {
                            blockchainOrderId: orderId,
                            exchangeContractAddress: exchangeContractAddress
                        }
                    });

                    if (dbOrder) {
                        // Obter o contrato correto usando o endereço
                        const contract = this.orderManagement.exchangeContracts.get(normalizeAddress(exchangeContractAddress));
                        if (!contract) {
                            console.warn(`🚫 Contract not found for address: ${exchangeContractAddress}`);
                            continue;
                        }

                        if (dbOrder.orderType === 'BUY') {
                            isActive = await contract.isBuyOrderActive(orderId);
                            if (isActive) {
                                blockchainOrder = await contract.buyOrders(orderId);
                            }
                        } else {
                            isActive = await contract.isSellOrderActive(orderId);
                            if (isActive) {
                                blockchainOrder = await contract.sellOrders(orderId);
                            }
                        }

                        // Atualizar ordem baseado no status do blockchain
                        if (!isActive) {
                            // Ordem foi executada completamente
                            await this.prisma.exchangeOrder.update({
                                where: { id: dbOrder.id },
                                data: {
                                    status: 'EXECUTED',
                                    remainingAmount: 0,
                                    filledAmount: parseFloat(dbOrder.amount),
                                    updatedAt: new Date()
                                }
                            });
                            console.log(`✅ Order ${orderId} marked as EXECUTED`);
                        } else if (blockchainOrder) {
                            // Ordem ainda ativa, verificar se foi parcialmente executada
                            const remainingAmount = parseFloat(ethers.formatUnits(blockchainOrder.remainingAmount, 18));
                            const originalAmount = parseFloat(dbOrder.amount);
                            const filledAmount = originalAmount - remainingAmount;

                            if (remainingAmount < originalAmount) {
                                // Parcialmente executada
                                await this.prisma.exchangeOrder.update({
                                    where: { id: dbOrder.id },
                                    data: {
                                        status: 'ACTIVE',
                                        remainingAmount: remainingAmount,
                                        filledAmount: filledAmount,
                                        updatedAt: new Date()
                                    }
                                });
                                console.log(`📊 Order ${orderId} partially executed: ${filledAmount}/${originalAmount}`);
                            } else {
                                // Ainda totalmente ativa
                                await this.prisma.exchangeOrder.update({
                                    where: { id: dbOrder.id },
                                    data: {
                                        status: 'ACTIVE',
                                        updatedAt: new Date()
                                    }
                                });
                                console.log(`🔄 Order ${orderId} remains ACTIVE`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing order ${orderId}:`, error);
                    // Em caso de erro, reverter para ACTIVE
                    await this.prisma.exchangeOrder.updateMany({
                        where: {
                            blockchainOrderId: orderId,
                            exchangeContractAddress: exchangeContractAddress,
                            status: 'MATCHING'
                        },
                        data: {
                            status: 'ACTIVE',
                            updatedAt: new Date()
                        }
                    });
                }
            }

        } catch (error) {
            console.error('❌ Error processing matching results:', error);
            throw error;
        }
    }

    /**
     * Broadcast order book update (simple implementation)
     */
    async broadcastOrderBookUpdate(exchangeContractAddress) {
        // Simple no-op implementation since frontend uses HTTP polling
        // This prevents crashes when the method is called
        console.log('📡 Order book update broadcasted (no-op)');
    }

    /**
     * Processar nova ordem de compra
     */
    async processBuyOrder(userAddress, exchangeContractAddress, tokenASymbol, tokenBSymbol, amount, maxPrice) {
        try {
            console.log(`🔄 Processing buy order: ${amount} ${tokenBSymbol} at max ${maxPrice} ${tokenASymbol}`);

            // 1. Criar a ordem de compra primeiro
            const result = await this.orderManagement.createBuyOrder(
                userAddress,
                exchangeContractAddress,
                tokenASymbol,
                tokenBSymbol,
                amount,
                maxPrice
            );

            // console.log('📝 Buy order created:', result);

            // 2. Verificar se há matches possíveis após adicionar a nova ordem
            await this.detectAndExecuteMatches(exchangeContractAddress);

            return result;

        } catch (error) {
            console.error('❌ Error processing buy order:', error);
            throw error;
        }
    }

    /**
     * Processar nova ordem de venda
     */
    async processSellOrder(userAddress, exchangeContractAddress, tokenASymbol, tokenBSymbol, amount, minPrice) {
        try {
            // console.log(`🔄 Processing sell order: ${amount} ${tokenBSymbol} at min ${minPrice} ${tokenASymbol}`);

            // 1. Criar a ordem de venda primeiro
            const result = await this.orderManagement.createSellOrder(
                userAddress,
                exchangeContractAddress,
                tokenASymbol,
                tokenBSymbol,
                amount,
                minPrice
            );

            // console.log('📝 Sell order created:', result);

            // 2. Verificar se há matches possíveis após adicionar a nova ordem
            await this.detectAndExecuteMatches(exchangeContractAddress);

            return result;

        } catch (error) {
            console.error('❌ Error processing sell order:', error);
            throw error;
        }
    }

    /**
     * Calcular execução possível contra ordem book
     */
    calculateExecution(orders, targetAmount, side) {
        let remainingAmount = targetAmount;
        let totalValue = 0;
        let fillableAmount = 0;
        const ordersToMatch = [];

        for (const order of orders) {
            if (remainingAmount <= 0) break;

            const orderAmount = parseFloat(order.amount);
            const orderPrice = parseFloat(order.price);
            const amountToTake = Math.min(remainingAmount, orderAmount);

            ordersToMatch.push({
                orderId: order.orderId,
                userAddress: order.userAddress,
                price: orderPrice,
                amount: amountToTake,
                remainingAmount: orderAmount
            });

            totalValue += amountToTake * orderPrice;
            fillableAmount += amountToTake;
            remainingAmount -= amountToTake;
        }

        const averagePrice = fillableAmount > 0 ? totalValue / fillableAmount : 0;

        return {
            canFillCompletely: remainingAmount === 0,
            fillableAmount,
            remainingAmount,
            totalValue,
            averagePrice,
            ordersToMatch
        };
    }

    /**
     * Executar compra de mercado
     */
    async executeMarketBuy(userAddress, exchangeContractAddress, tokenASymbol, tokenBSymbol, execution) {
        try {
            // Processar cada ordem individualmente
            const trades = [];

            for (const orderToMatch of execution.ordersToMatch) {
                // Simular execução da ordem no blockchain
                const tradeResult = await this.executeOrderMatch(
                    userAddress,
                    orderToMatch,
                    'BUY',
                    exchangeContractAddress,
                    tokenASymbol,
                    tokenBSymbol
                );

                trades.push(tradeResult);

                // Cache invalidation
                await this.redis.invalidateExchangeCache(exchangeContractAddress);
            }

            this.emit('marketOrderExecuted', {
                user: userAddress,
                side: 'BUY',
                amount: execution.fillableAmount,
                averagePrice: execution.averagePrice,
                totalValue: execution.totalValue,
                trades: trades.length
            });

            return {
                success: true,
                executed: execution.fillableAmount,
                averagePrice: execution.averagePrice,
                totalCost: execution.totalValue,
                trades
            };
        } catch (error) {
            console.error('❌ Error executing market buy:', error);
            throw error;
        }
    }

    /**
     * Executar venda de mercado
     */
    async executeMarketSell(userAddress, exchangeContractAddress, tokenASymbol, tokenBSymbol, execution) {
        try {
            // Processar cada ordem individualmente
            const trades = [];

            for (const orderToMatch of execution.ordersToMatch) {
                // Simular execução da ordem no blockchain
                const tradeResult = await this.executeOrderMatch(
                    userAddress,
                    orderToMatch,
                    'SELL',
                    exchangeContractAddress,
                    tokenASymbol,
                    tokenBSymbol
                );

                trades.push(tradeResult);

                // Cache invalidation
                await this.redis.invalidateExchangeCache(exchangeContractAddress);
            }

            this.emit('marketOrderExecuted', {
                user: userAddress,
                side: 'SELL',
                amount: execution.fillableAmount,
                averagePrice: execution.averagePrice,
                totalValue: execution.totalValue,
                trades: trades.length
            });

            return {
                success: true,
                executed: execution.fillableAmount,
                averagePrice: execution.averagePrice,
                totalRevenue: execution.totalValue,
                trades
            };
        } catch (error) {
            console.error('❌ Error executing market sell:', error);
            throw error;
        }
    }

    /**
     * Broadcast de atualizações após trade executado
     */
    async broadcastTradeUpdates(exchangeContractAddress, newTrade) {
        try {
            // 1. Buscar trades recentes (últimos 10)
            const recentTrades = await this.prisma.exchangeTrade.findMany({
                where: {
                    exchangeContractAddress: normalizeAddress(exchangeContractAddress)
                },
                orderBy: {
                    tradeTimestamp: 'desc'
                },
                take: 10
            });

            // 2. Calcular ticker data (24h stats)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const trades24h = await this.prisma.exchangeTrade.findMany({
                where: {
                    exchangeContractAddress: normalizeAddress(exchangeContractAddress),
                    tradeTimestamp: {
                        gte: oneDayAgo
                    }
                },
                orderBy: {
                    tradeTimestamp: 'asc'
                }
            });

            let tickerData = {
                lastPrice: parseFloat(newTrade.price),
                change24h: 0,
                changePercent24h: 0,
                high24h: parseFloat(newTrade.price),
                low24h: parseFloat(newTrade.price),
                volume24h: 0,
                trades24h: trades24h.length,
                lastUpdate: newTrade.tradeTimestamp.toISOString()
            };

            if (trades24h.length > 0) {
                const firstPrice = parseFloat(trades24h[0].price);
                const lastPrice = parseFloat(newTrade.price);

                tickerData.change24h = lastPrice - firstPrice;
                tickerData.changePercent24h = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
                tickerData.high24h = Math.max(...trades24h.map(t => parseFloat(t.price)));
                tickerData.low24h = Math.min(...trades24h.map(t => parseFloat(t.price)));
                tickerData.volume24h = trades24h.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            }

            // 3. Enviar broadcasts via WebSocket (será processado assincronamente via RabbitMQ)
            const broadcastPromises = [
                // Broadcast trades recentes
                websocketBroadcast.broadcastRecentTradesUpdate(
                    exchangeContractAddress,
                    recentTrades.map(trade => ({
                        id: trade.id,
                        price: parseFloat(trade.price),
                        amount: parseFloat(trade.amount),
                        total: parseFloat(trade.totalValue),
                        timestamp: trade.tradeTimestamp.toISOString(),
                        type: trade.buyerAddress && trade.sellerAddress ? 'buy' : 'sell', // simplificado
                        hash: trade.transactionHash || null,
                        pair: `${trade.tokenASymbol}/${trade.tokenBSymbol}`
                    }))
                ),

                // Broadcast ticker atualizado
                websocketBroadcast.broadcastTickerUpdate(exchangeContractAddress, tickerData)
            ];

            await Promise.allSettled(broadcastPromises);
            // console.log(`📡 Broadcasted trade updates for ${exchangeContractAddress}`); // Reduced logging

        } catch (error) {
            console.error('❌ Error broadcasting trade updates:', error);
            // Não propagar erro para não quebrar o trade execution
        }
    }

    /**
     * Executar match individual entre ordens
     */
    async executeOrderMatch(takerAddress, makerOrder, takerSide, exchangeContractAddress, tokenASymbol, tokenBSymbol) {
        try {
            // Simular transação no blockchain (usando orderManagement)
            const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;

            // Registrar trade no banco
            const trade = await this.prisma.exchangeTrade.create({
                data: {
                    exchangeContractAddress: normalizeAddress(exchangeContractAddress),
                    buyerAddress: takerSide === 'BUY' ? normalizeAddress(takerAddress) : normalizeAddress(makerOrder.userAddress),
                    sellerAddress: takerSide === 'SELL' ? normalizeAddress(takerAddress) : normalizeAddress(makerOrder.userAddress),
                    tokenASymbol,
                    tokenBSymbol,
                    price: makerOrder.price.toString(),
                    amount: makerOrder.amount.toString(),
                    totalValue: (makerOrder.price * makerOrder.amount).toString(),
                    feeAmount: '0', // TODO: Calcular fee
                    transactionHash: mockTxHash,
                    blockNumber: BigInt(Date.now()), // Mock block number
                    tradeTimestamp: new Date()
                }
            });

            // Atualizar ordem maker (reduzir remaining amount)
            // Use databaseId para UUID do banco, não orderId que é o blockchain ID
            await this.prisma.exchangeOrder.updateMany({
                where: {
                    id: makerOrder.databaseId || makerOrder.id,
                    status: 'ACTIVE'
                },
                data: {
                    remainingAmount: {
                        decrement: makerOrder.amount
                    },
                    filledAmount: {
                        increment: makerOrder.amount
                    },
                    status: (makerOrder.remainingAmount - makerOrder.amount) <= 0 ? 'FILLED' : 'ACTIVE',
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Trade executed: ${makerOrder.amount} at ${makerOrder.price}`);

            // Broadcast WebSocket updates após trade executado
            await this.broadcastTradeUpdates(exchangeContractAddress, trade);

            return trade;

        } catch (error) {
            console.error('❌ Error executing order match:', error);
            throw error;
        }
    }

    /**
     * Criar ordem limite usando OrderManagementService
     */
    async createLimitOrder(userAddress, exchangeContractAddress, tokenASymbol, tokenBSymbol, orderType, amount, price) {
        try {
            let result;

            if (orderType === 'BUY') {
                result = await this.orderManagement.createBuyOrder(
                    userAddress,
                    exchangeContractAddress,
                    tokenASymbol,
                    tokenBSymbol,
                    amount,
                    price
                );
            } else {
                result = await this.orderManagement.createSellOrder(
                    userAddress,
                    exchangeContractAddress,
                    tokenASymbol,
                    tokenBSymbol,
                    amount,
                    price
                );
            }

            // Invalidar cache do order book
            await this.redis.invalidateExchangeCache(exchangeContractAddress);

            this.emit('limitOrderCreated', {
                user: userAddress,
                side: orderType,
                amount,
                price,
                orderId: result.orderId
            });

            return result;
        } catch (error) {
            console.error(`❌ Error creating ${orderType.toLowerCase()} order:`, error);
            throw error;
        }
    }

    /**
     * Cancelar ordem usando OrderManagementService
     */
    async cancelOrder(orderId, userAddress, exchangeContractAddress, orderType) {
        try {
            const result = await this.orderManagement.cancelOrder(
                orderId,
                userAddress,
                exchangeContractAddress,
                orderType
            );

            // Invalidar cache do order book
            await this.redis.invalidateExchangeCache(exchangeContractAddress);

            this.emit('orderCancelled', {
                orderId,
                user: userAddress
            });

            return result;
        } catch (error) {
            console.error('❌ Error cancelling order:', error);
            throw error;
        }
    }

    /**
     * Obter cotação para uma quantidade
     */
    async getQuote(side, amount, exchangeContractAddress) {
        try {
            // Buscar order book do cache ou banco
            let orderBook = await this.redis.getCachedOrderBook(exchangeContractAddress);
            if (!orderBook) {
                orderBook = await this.orderManagement.getOrderBook(exchangeContractAddress);
                await this.redis.cacheOrderBook(exchangeContractAddress, orderBook, 30);
            }

            // Selecionar lado correto do order book
            const orders = side === 'BUY' ? orderBook.asks : orderBook.bids;

            if (!orders || orders.length === 0) {
                return {
                    canExecute: false,
                    amount: 0,
                    averagePrice: 0,
                    totalCost: 0,
                    priceImpact: 0,
                    slippage: 0,
                    message: 'No liquidity available'
                };
            }

            // Ordenar ordens (melhor preço primeiro)
            const sortedOrders = side === 'BUY'
                ? orders.sort((a, b) => a.price - b.price)  // Asks: preço crescente
                : orders.sort((a, b) => b.price - a.price); // Bids: preço decrescente

            const execution = this.calculateExecution(sortedOrders, amount, side);

            // Calcular impacto no preço e slippage
            const bestPrice = sortedOrders[0] ? parseFloat(sortedOrders[0].price) : 0;
            const priceImpact = bestPrice > 0 && execution.averagePrice > 0
                ? Math.abs((execution.averagePrice - bestPrice) / bestPrice) * 100
                : 0;

            const slippage = execution.canFillCompletely ? priceImpact : 100; // 100% se não conseguir preencher

            return {
                canExecute: execution.fillableAmount > 0,
                amount: execution.fillableAmount,
                requestedAmount: amount,
                averagePrice: execution.averagePrice,
                totalCost: execution.totalValue,
                priceImpact,
                slippage,
                bestPrice,
                canFillCompletely: execution.canFillCompletely,
                orders: execution.ordersToMatch.slice(0, 5) // Apenas primeiros 5 para display
            };
        } catch (error) {
            console.error('❌ Error getting quote:', error);
            throw error;
        }
    }

    /**
     * Processar matching automático entre ordens existentes
     */
    async runAutomaticMatching(exchangeContractAddress) {
        try {
            console.log(`🤖 Running automatic matching for ${exchangeContractAddress}`);

            // Buscar order book atualizado
            const orderBook = await this.orderManagement.getOrderBook(exchangeContractAddress, 50);

            if (!orderBook.bids.length || !orderBook.asks.length) {
                console.log('📝 No orders to match');
                return { matched: 0 };
            }

            // Buscar overlapping prices
            const bestBid = orderBook.bids[0]; // Highest bid
            const bestAsk = orderBook.asks[0]; // Lowest ask

            if (bestBid.price >= bestAsk.price) {
                console.log(`🎯 Price overlap found: bid ${bestBid.price} >= ask ${bestAsk.price}`);

                // Executar match
                const matchPrice = (bestBid.price + bestAsk.price) / 2; // Mid price
                const matchAmount = Math.min(bestBid.amount, bestAsk.amount);

                const trade = await this.executeOrderMatch(
                    bestBid.userAddress,
                    {
                        orderId: bestAsk.orderId,
                        userAddress: bestAsk.userAddress,
                        price: matchPrice,
                        amount: matchAmount,
                        remainingAmount: bestAsk.amount
                    },
                    'BUY',
                    exchangeContractAddress,
                    'cBRL', // TODO: Get from contract
                    'PCN'   // TODO: Get from contract
                );

                // Invalidar cache
                await this.redis.invalidateExchangeCache(exchangeContractAddress);

                this.emit('automaticMatchExecuted', {
                    tradeId: trade.id,
                    amount: matchAmount,
                    price: matchPrice,
                    buyer: bestBid.userAddress,
                    seller: bestAsk.userAddress
                });

                return { matched: 1, trade };
            }

            return { matched: 0 };
        } catch (error) {
            console.error('❌ Error in automatic matching:', error);
            return { matched: 0, error: error.message };
        }
    }

    /**
     * Obter estatísticas do matching engine
     */
    getStats() {
        return {
            isProcessing: this.isProcessing,
            processedOrdersCount: this.processedOrders.size,
            redisConnected: this.redis.isConnected,
            lastActivity: new Date().toISOString()
        };
    }

    /**
     * Cleanup recursos
     */
    async cleanup() {
        try {
            await this.prisma.$disconnect();
            this.processedOrders.clear();
            console.log('✅ MatchingEngine cleanup completed');
        } catch (error) {
            console.error('❌ Error during MatchingEngine cleanup:', error);
        }
    }

}

module.exports = MatchingEngine;
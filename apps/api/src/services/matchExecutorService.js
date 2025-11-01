const { ethers } = require('ethers');
const { PrismaClient } = require('../generated/prisma');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const orderManagementService = require('./orderManagement.service');

/**
 * Match Executor Service - Processa matches da fila RabbitMQ
 *
 * Responsabilidades:
 * - Consumir mensagens de match do RabbitMQ
 * - Executar transação matchOrders na blockchain
 * - Atualizar status das ordens no banco
 * - Notificar via WebSocket
 */
class MatchExecutorService extends EventEmitter {
    constructor() {
        super();
        this.prisma = global.prisma || new PrismaClient();
        this.provider = null;
        this.wallet = null;
        this.isProcessing = false;
        this.rabbitMQ = null;
    }

    /**
     * Inicializar o serviço
     */
    async initialize(rpcUrl, privateKey) {
        try {
            console.log('🎯 Initializing MatchExecutorService...');

            // Setup blockchain connection
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);

            // Setup RabbitMQ
            const rabbitMQ = require('../config/rabbitmq');
            this.rabbitMQ = rabbitMQ;

            console.log('✅ MatchExecutorService initialized');
            console.log('📍 Wallet address:', this.wallet.address);

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize MatchExecutorService:', error);
            throw error;
        }
    }

    /**
     * Iniciar consumer do RabbitMQ
     */
    async startConsumer() {
        try {
            console.log('🚀 Starting RabbitMQ consumer for order matching...');

            // 1. Limpar ordens PROCESSING órfãs antes de iniciar
            await this.cleanupOrphanedProcessingOrders();

            // 2. Consumir mensagens de matching de uma fila específica para execução
            await this.rabbitMQ.consumeQueue(
                'exchange.match.execution',
                this.handleMatchMessage.bind(this),
                {
                    prefetch: 1, // Processar uma mensagem por vez
                    autoAck: false // Confirmar manualmente após processamento
                }
            );

            console.log('✅ RabbitMQ consumer started for order matching');

        } catch (error) {
            console.error('❌ Error starting RabbitMQ consumer:', error);
            throw error;
        }
    }

    /**
     * Processar mensagem de match do RabbitMQ
     */
    async handleMatchMessage(content, messageInfo) {
        let matchData = null; // Declarar no escopo da função

        try {
            console.log('📨 Received match message from queue');

            if (this.isProcessing) {
                console.log('⚠️ Already processing a match, skipping...');
                throw new Error('Service busy processing another match');
            }

            this.isProcessing = true;

            // Verificar se é o tipo de mensagem correto para este consumer
            if (content.type !== 'MATCH_EXECUTION') {
                console.log(`⚠️ Skipping message type: ${content.type}`);
                return;
            }

            matchData = content;
            console.log(`🔍 Processing match for contract ${matchData.contractAddress?.substring(0,8)}... (${matchData.pair})`);

            // Determinar se é match simples (legado) ou grupo de match (novo)
            const isMatchGroup = matchData.matchGroup && (matchData.matchGroup.buyOrders || matchData.matchGroup.sellOrders);

            if (isMatchGroup) {
                console.log(`📦 Processing match group with ${matchData.matchGroup.buyOrders?.length || 0} buy orders and ${matchData.matchGroup.sellOrders?.length || 0} sell orders`);

                // 1. Marcar todas as ordens do grupo como PROCESSING
                await this.markMatchGroupAsProcessing(matchData);

                // 2. Executar todas as transações do grupo na blockchain
                const result = await this.executeMatchGroupOnBlockchain(matchData);

                if (result.success) {
                    console.log(`✅ Match group executed successfully! Transactions: ${result.transactions?.length || 0}`);
                    await this.updateOrdersAfterMatchGroup(matchData, result);
                    await this.notifyMatchGroupExecuted(matchData, result);
                } else {
                    console.log(`❌ Match group execution failed: ${result.error}`);
                    await this.revertMatchGroupFromProcessing(matchData);
                    throw new Error(`Match group execution failed: ${result.error}`);
                }
            } else {
                console.log(`🔄 Processing legacy single match`);

                // 1. Marcar ordens como PROCESSING antes de enviar para blockchain (modo legado)
                await this.markOrdersAsProcessing(matchData);

                // 2. Executar match na blockchain (modo legado)
                const result = await this.executeMatchOnBlockchain(matchData);

                if (result.success) {
                    console.log(`✅ Match executed successfully! TX: ${result.transactionHash}`);
                    await this.updateOrdersAfterMatch(matchData, result);
                    await this.notifyMatchExecuted(matchData, result);
                } else {
                    console.log(`❌ Match execution failed: ${result.error}`);
                    await this.revertOrdersFromProcessing(matchData);
                    throw new Error(`Match execution failed: ${result.error}`);
                }
            }

        } catch (error) {
            console.error('❌ Error processing match message:', error);

            // Reverter ordens para status ACTIVE em caso de erro
            try {
                if (matchData) {
                    await this.revertOrdersFromProcessing(matchData);
                }
            } catch (revertError) {
                console.error('❌ Error reverting orders from PROCESSING:', revertError);
            }

            throw error; // Re-throw para o sistema de retry do RabbitMQ
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Marcar ordens como PROCESSING para evitar re-matching
     */
    async markOrdersAsProcessing(matchData) {
        try {
            console.log('🔄 Marking orders as PROCESSING...');

            const { contractAddress, buyOrder, sellOrder } = matchData;

            // Marcar ambas as ordens como PROCESSING
            const updatePromises = [
                this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(buyOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'BUY',
                        status: { in: ['ACTIVE', 'OPEN', 'ACTIVE'] }
                    },
                    data: {
                        status: 'PROCESSING',
                        updatedAt: new Date()
                    }
                }),
                this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(sellOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'SELL',
                        status: { in: ['ACTIVE', 'OPEN', 'ACTIVE'] }
                    },
                    data: {
                        status: 'PROCESSING',
                        updatedAt: new Date()
                    }
                })
            ];

            const results = await Promise.all(updatePromises);

            console.log(`✅ Orders #${buyOrder.id} and #${sellOrder.id} marked as PROCESSING`);
            console.log(`   Buy order updates: ${results[0].count}, Sell order updates: ${results[1].count}`);

            // Verificar se ambas as ordens foram marcadas como PROCESSING
            if (results[0].count === 0 || results[1].count === 0) {
                console.error('⚠️ Failed to mark one or both orders as PROCESSING');
                console.error(`   This likely means the orders were already processed by another instance`);
                console.error(`   Buy order updates: ${results[0].count}, Sell order updates: ${results[1].count}`);
                throw new Error('Failed to acquire order lock - orders may already be processing');
            }

        } catch (error) {
            console.error('❌ Error marking orders as PROCESSING:', error);
            throw error;
        }
    }

    /**
     * Reverter ordens de PROCESSING para ACTIVE em caso de falha
     */
    async revertOrdersFromProcessing(matchData) {
        try {
            console.log('🔄 Reverting orders from PROCESSING to ACTIVE...');

            const { contractAddress, buyOrder, sellOrder } = matchData;

            // Reverter ambas as ordens para ACTIVE
            const updatePromises = [
                this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(buyOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'BUY',
                        status: 'PROCESSING'
                    },
                    data: {
                        status: 'ACTIVE',
                        updatedAt: new Date()
                    }
                }),
                this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(sellOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'SELL',
                        status: 'PROCESSING'
                    },
                    data: {
                        status: 'ACTIVE',
                        updatedAt: new Date()
                    }
                })
            ];

            const results = await Promise.all(updatePromises);

            console.log(`✅ Orders #${buyOrder.id} and #${sellOrder.id} reverted to ACTIVE`);
            console.log(`   Buy order reverts: ${results[0].count}, Sell order reverts: ${results[1].count}`);

        } catch (error) {
            console.error('❌ Error reverting orders from PROCESSING:', error);
            // Não fazer throw aqui para evitar mascarar o erro original
        }
    }

    /**
     * Marcar todas as ordens de um grupo como PROCESSING
     * NOTA: AutoMatchingService já marca as ordens como PROCESSING antes de enviar para a fila,
     * então esta função apenas VERIFICA se estão no status correto
     */
    async markMatchGroupAsProcessing(matchData) {
        try {
            console.log('🔄 Verifying match group orders are in PROCESSING status...');

            const { contractAddress, matchGroup } = matchData;
            const allOrders = [
                ...matchGroup.buyOrders.map(order => ({ ...order, type: 'BUY' })),
                ...matchGroup.sellOrders.map(order => ({ ...order, type: 'SELL' }))
            ];

            console.log(`📋 Verifying ${allOrders.length} orders in match group`);

            // Verificar o status atual de cada ordem
            const orderChecks = await Promise.all(
                allOrders.map(order =>
                    this.prisma.exchangeOrder.findFirst({
                        where: {
                            blockchainOrderId: BigInt(order.id),
                            exchangeContractAddress: contractAddress,
                            orderType: order.type // CRITICAL: Filter by orderType to avoid duplicates
                        },
                        select: { status: true, id: true }
                    })
                )
            );

            // Contar quantas já estão PROCESSING (o esperado) vs outras
            const processingCount = orderChecks.filter(o => o?.status === 'PROCESSING').length;
            const activeCount = orderChecks.filter(o => o?.status === 'ACTIVE' || o?.status === 'OPEN').length;

            console.log(`📊 Order status: ${processingCount} PROCESSING, ${activeCount} ACTIVE/OPEN`);

            // Se alguma ordem ainda está ACTIVE/OPEN, marcar como PROCESSING
            if (activeCount > 0) {
                console.log(`🔄 Marking ${activeCount} orders as PROCESSING...`);

                const updatePromises = allOrders.map(order =>
                    this.prisma.exchangeOrder.updateMany({
                        where: {
                            blockchainOrderId: BigInt(order.id),
                            exchangeContractAddress: contractAddress,
                            orderType: order.type,
                            status: { in: ['ACTIVE', 'OPEN'] }
                        },
                        data: {
                            status: 'PROCESSING',
                            updatedAt: new Date()
                        }
                    })
                );

                await Promise.all(updatePromises);
                console.log(`✅ Updated ${activeCount} orders to PROCESSING`);
            }

            console.log(`✅ All match group orders are in PROCESSING status`);

        } catch (error) {
            console.error('❌ Error marking match group as PROCESSING:', error);
            throw error;
        }
    }

    /**
     * Reverter todas as ordens de um grupo de PROCESSING para ACTIVE
     */
    async revertMatchGroupFromProcessing(matchData) {
        try {
            console.log('🔄 Reverting match group orders from PROCESSING to ACTIVE...');

            const { contractAddress, matchGroup } = matchData;
            const allOrders = [
                ...matchGroup.buyOrders.map(order => ({ ...order, type: 'BUY' })),
                ...matchGroup.sellOrders.map(order => ({ ...order, type: 'SELL' }))
            ];

            // Criar updates para todas as ordens
            const updatePromises = allOrders.map(order =>
                this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(order.id),
                        exchangeContractAddress: contractAddress,
                        orderType: order.type,
                        status: 'PROCESSING'
                    },
                    data: {
                        status: 'ACTIVE',
                        updatedAt: new Date()
                    }
                })
            );

            const results = await Promise.all(updatePromises);
            const totalReverted = results.reduce((sum, result) => sum + result.count, 0);

            console.log(`✅ Match group orders reverted to ACTIVE: ${totalReverted} orders`);

        } catch (error) {
            console.error('❌ Error reverting match group from PROCESSING:', error);
        }
    }

    /**
     * Executar match na blockchain
     */
    async executeMatchOnBlockchain(matchData) {
        try {
            const { contractAddress, buyOrder, sellOrder } = matchData;

            console.log(`🔗 Executing matchOrders on blockchain for contract ${contractAddress.substring(0,8)}...`);
            console.log(`  Buy Order: #${buyOrder.id} from ${buyOrder.userAddress.substring(0,8)}...`);
            console.log(`  Sell Order: #${sellOrder.id} from ${sellOrder.userAddress.substring(0,8)}...`);

            // Carregar ABI do contrato
            const abiPath = path.join(__dirname, '../contracts/abis/default_exchange_abi.json');
            if (!fs.existsSync(abiPath)) {
                throw new Error('Exchange ABI file not found');
            }

            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
            const contract = new ethers.Contract(contractAddress, exchangeABI, this.wallet);

            // Verificar se a função matchOrders existe
            if (typeof contract.matchOrders !== 'function') {
                throw new Error('matchOrders function not found in contract');
            }

            // Executar matchOrders na blockchain
            console.log('📤 Sending matchOrders transaction...');

            const buyOrderIds = [BigInt(buyOrder.id)];
            const sellOrderIds = [BigInt(sellOrder.id)];

            const tx = await contract.matchOrders(buyOrderIds, sellOrderIds, {
                gasLimit: 500000, // Limite de gas conservador
                gasPrice: ethers.parseUnits('20', 'gwei')
            });

            console.log(`⏳ Transaction sent: ${tx.hash}`);
            console.log('⏳ Waiting for confirmation...');

            // Aguardar confirmação
            const receipt = await tx.wait(1);

            if (receipt.status === 1) {
                console.log(`🎉 Transaction confirmed! Block: ${receipt.blockNumber}`);

                return {
                    success: true,
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString()
                };
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            console.error('❌ Blockchain execution failed:', error.message);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Executar grupo de matches na blockchain
     */
    async executeMatchGroupOnBlockchain(matchData) {
        try {
            const { contractAddress, matchGroup } = matchData;

            console.log(`🔗 Executing match group on blockchain for contract ${contractAddress.substring(0,8)}...`);
            console.log(`  Buy Orders: ${matchGroup.buyOrders.map(o => `#${o.id}`).join(', ')}`);
            console.log(`  Sell Orders: ${matchGroup.sellOrders.map(o => `#${o.id}`).join(', ')}`);
            console.log(`  Total Amount: ${matchGroup.totalAmount}`);

            // Carregar ABI do contrato
            const abiPath = path.join(__dirname, '../contracts/abis/default_exchange_abi.json');
            if (!fs.existsSync(abiPath)) {
                throw new Error('Exchange ABI file not found');
            }

            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
            const contract = new ethers.Contract(contractAddress, exchangeABI, this.wallet);

            // Verificar se a função matchOrders existe
            if (typeof contract.matchOrders !== 'function') {
                throw new Error('matchOrders function not found in contract');
            }

            // Preparar arrays de IDs para a blockchain
            const buyOrderIds = matchGroup.buyOrders.map(order => BigInt(order.id));
            const sellOrderIds = matchGroup.sellOrders.map(order => BigInt(order.id));

            console.log('📤 Sending matchOrders transaction for group...');
            console.log(`  Buy IDs: [${buyOrderIds.join(', ')}]`);
            console.log(`  Sell IDs: [${sellOrderIds.join(', ')}]`);

            // Executar transação única para todo o grupo
            const tx = await contract.matchOrders(buyOrderIds, sellOrderIds, {
                gasLimit: 1000000, // Aumentar gas limit para múltiplas ordens
                gasPrice: ethers.parseUnits('20', 'gwei')
            });

            console.log(`⏳ Transaction sent: ${tx.hash}`);
            console.log('⏳ Waiting for confirmation...');

            // Aguardar confirmação
            const receipt = await tx.wait(1);

            if (receipt.status === 1) {
                console.log(`🎉 Match group transaction confirmed! Block: ${receipt.blockNumber}`);

                return {
                    success: true,
                    transactionHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    matchGroup // Incluir dados do grupo para processamento posterior
                };
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            console.error('❌ Match group blockchain execution failed:', error.message);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Atualizar status das ordens no banco após grupo de matches
     */
    async updateOrdersAfterMatchGroup(matchData, result) {
        try {
            console.log('💾 Updating match group orders in database...');

            const { matchGroup, contractAddress } = matchData;
            const { transactionHash, blockNumber } = result;

            // Processar todas as ordens do grupo (buy + sell)
            const allOrders = [
                ...matchGroup.buyOrders.map(order => ({ ...order, type: 'BUY' })),
                ...matchGroup.sellOrders.map(order => ({ ...order, type: 'SELL' }))
            ];

            console.log(`📋 Updating ${allOrders.length} orders from match group`);

            // Atualizar cada ordem individualmente com base no quanto foi matchado
            const updatePromises = allOrders.map(async (order) => {
                console.log(`  🔄 Updating ${order.type} Order #${order.id}:`);
                console.log(`    Match Amount: ${order.matchAmount}`);
                console.log(`    Remaining: ${order.remainingAmount}`);

                // Buscar ordem atual no banco
                const currentOrder = await this.prisma.exchangeOrder.findFirst({
                    where: {
                        blockchainOrderId: BigInt(order.id),
                        exchangeContractAddress: contractAddress,
                        orderType: order.type, // CRITICAL: Filter by orderType to avoid duplicates
                        status: 'PROCESSING'
                    },
                    select: {
                        id: true,
                        remainingAmount: true,
                        filledAmount: true,
                        status: true,
                        blockchainOrderId: true
                    }
                });

                if (!currentOrder) {
                    console.error(`  ❌ Order #${order.id} not found in PROCESSING status`);
                    return { count: 0 };
                }

                // Calcular novos valores
                const currentRemaining = parseFloat(currentOrder.remainingAmount);
                const currentFilled = parseFloat(currentOrder.filledAmount || '0');
                const matchAmount = parseFloat(order.matchAmount);

                const newFilled = currentFilled + matchAmount;
                const newRemaining = currentRemaining - matchAmount;

                // Determinar novo status
                const newStatus = newRemaining > 0 ? 'ACTIVE' : 'EXECUTED';

                console.log(`    Current: filled=${currentFilled}, remaining=${currentRemaining}`);
                console.log(`    New: filled=${newFilled}, remaining=${newRemaining}, status=${newStatus}`);

                // Executar update
                const updateResult = await this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(order.id),
                        exchangeContractAddress: contractAddress,
                        orderType: order.type,
                        status: 'PROCESSING'
                    },
                    data: {
                        status: newStatus,
                        filledAmount: newFilled.toString(),
                        remainingAmount: Math.max(0, newRemaining).toString(),
                        blockNumber: blockNumber ? BigInt(blockNumber) : null,
                        updatedAt: new Date()
                    }
                });

                console.log(`    ✅ Updated ${updateResult.count} rows to ${newStatus}`);
                return {
                    count: updateResult.count,
                    orderId: currentOrder.id,
                    newStatus,
                    matchAmount
                };
            });

            const updateResults = await Promise.all(updatePromises);

            // Verificar resultados
            const totalUpdated = updateResults.reduce((sum, result) => sum + result.count, 0);
            console.log(`✅ Match group orders updated: ${totalUpdated}/${allOrders.length} orders`);

            if (totalUpdated !== allOrders.length) {
                console.error(`⚠️ Expected to update ${allOrders.length} orders, but updated ${totalUpdated}`);
                updateResults.forEach((result, index) => {
                    const order = allOrders[index];
                    console.log(`  Order #${order.id}: ${result.count} rows updated`);
                });
            }

            // Criar um trade para cada ordem individual (preservando preços específicos)
            console.log('🎯 Creating individual trade records for each matched order...');

            const tradePromises = [];

            // Se temos 1 buy vs N sells - criar um trade para cada sell
            if (matchGroup.buyOrders.length === 1 && matchGroup.sellOrders.length > 1) {
                const buyOrder = matchGroup.buyOrders[0];
                const buyResult = updateResults.find(r => r.orderId && allOrders.find(o => o.id === buyOrder.id && o.type === 'BUY'));

                console.log(`  📈 1 Buy Order vs ${matchGroup.sellOrders.length} Sell Orders`);
                console.log(`  📋 Sell Orders Details:`);
                matchGroup.sellOrders.forEach((sellOrder, index) => {
                    console.log(`    ${index + 1}. Order #${sellOrder.id}: ${sellOrder.matchAmount} @ ${sellOrder.price}`);
                });

                for (let i = 0; i < matchGroup.sellOrders.length; i++) {
                    const sellOrder = matchGroup.sellOrders[i];
                    const sellResult = updateResults.find(r => r.orderId && allOrders.find(o => o.id === sellOrder.id && o.type === 'SELL'));

                    console.log(`    🔍 Processing Sell Order ${i + 1}:`);
                    console.log(`      Order ID: ${sellOrder.id}`);
                    console.log(`      Match Amount: ${sellOrder.matchAmount}`);
                    console.log(`      Price: ${sellOrder.price}`);
                    console.log(`      Found Update Result: ${sellResult ? 'YES' : 'NO'}`);
                    if (sellResult) {
                        console.log(`      Update Result Order ID: ${sellResult.orderId}`);
                    }

                    const orderIds = {
                        buyOrderId: buyResult?.orderId,
                        sellOrderId: sellResult?.orderId
                    };

                    console.log(`      Trade Order IDs: Buy=${orderIds.buyOrderId}, Sell=${orderIds.sellOrderId}`);

                    // Criar trade individual com preço específico da venda
                    const individualTradeData = {
                        ...matchData,
                        buyOrder: {
                            ...buyOrder,
                            price: sellOrder.price // Usar preço da sell order (preço de execução)
                        },
                        sellOrder: sellOrder
                    };

                    console.log(`    💰 Creating Trade ${i + 1}: ${sellOrder.matchAmount} @ ${sellOrder.price} (Buy #${buyOrder.id} + Sell #${sellOrder.id})`);

                    tradePromises.push(
                        this.createTradeRecord(individualTradeData, result, parseFloat(sellOrder.matchAmount), orderIds)
                    );
                }

                console.log(`  📊 Total trade promises created: ${tradePromises.length}`);
            }
            // Se temos N buys vs 1 sell - criar um trade para cada buy
            else if (matchGroup.buyOrders.length > 1 && matchGroup.sellOrders.length === 1) {
                const sellOrder = matchGroup.sellOrders[0];
                const sellResult = updateResults.find(r => r.orderId && allOrders.find(o => o.id === sellOrder.id && o.type === 'SELL'));

                console.log(`  📉 ${matchGroup.buyOrders.length} Buy Orders vs 1 Sell Order`);

                for (const buyOrder of matchGroup.buyOrders) {
                    const buyResult = updateResults.find(r => r.orderId && allOrders.find(o => o.id === buyOrder.id && o.type === 'BUY'));

                    const orderIds = {
                        buyOrderId: buyResult?.orderId,
                        sellOrderId: sellResult?.orderId
                    };

                    // Criar trade individual com preço específico da venda
                    const individualTradeData = {
                        ...matchData,
                        buyOrder: {
                            ...buyOrder,
                            price: sellOrder.price // Usar preço da sell order (preço de execução)
                        },
                        sellOrder: sellOrder
                    };

                    console.log(`    💰 Trade: ${buyOrder.matchAmount} @ ${sellOrder.price} (Buy #${buyOrder.id} + Sell #${sellOrder.id})`);

                    tradePromises.push(
                        this.createTradeRecord(individualTradeData, result, parseFloat(buyOrder.matchAmount), orderIds)
                    );
                }
            }
            // Caso 1:1 ou casos especiais - criar um trade
            else {
                console.log(`  🔄 Standard 1:1 trade creation`);

                const buyOrder = matchGroup.buyOrders[0];
                const sellOrder = matchGroup.sellOrders[0];

                const buyResult = updateResults.find(r => r.orderId && allOrders.find(o => o.id === buyOrder.id && o.type === 'BUY'));
                const sellResult = updateResults.find(r => r.orderId && allOrders.find(o => o.id === sellOrder.id && o.type === 'SELL'));

                const orderIds = {
                    buyOrderId: buyResult?.orderId,
                    sellOrderId: sellResult?.orderId
                };

                const tradeData = {
                    ...matchData,
                    buyOrder: {
                        ...buyOrder,
                        price: sellOrder.price // Usar preço da sell order
                    },
                    sellOrder: sellOrder
                };

                console.log(`    💰 Trade: ${matchGroup.totalAmount} @ ${sellOrder.price}`);

                tradePromises.push(
                    this.createTradeRecord(tradeData, result, matchGroup.totalAmount, orderIds)
                );
            }

            await Promise.all(tradePromises);
            console.log(`✅ Created ${tradePromises.length} trade records (one for each price level)`);

        } catch (error) {
            console.error('❌ Error updating match group orders:', error);
            throw error;
        }
    }

    /**
     * Atualizar status das ordens no banco após match (versão legado 1:1)
     */
    async updateOrdersAfterMatch(matchData, result) {
        try {
            console.log('💾 Updating order status in database...');

            const { buyOrder, sellOrder, contractAddress } = matchData;
            const { transactionHash, blockNumber } = result;

            // Buscar dados atuais das ordens do banco para cálculos precisos
            console.log(`🔍 Looking for orders in DB:`);
            console.log(`   Buy Order ID: ${buyOrder.id} (${BigInt(buyOrder.id)})`);
            console.log(`   Sell Order ID: ${sellOrder.id} (${BigInt(sellOrder.id)})`);
            console.log(`   Contract: ${contractAddress}`);

            const [currentBuyOrder, currentSellOrder] = await Promise.all([
                this.prisma.exchangeOrder.findFirst({
                    where: {
                        blockchainOrderId: BigInt(buyOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'BUY', // CRITICAL: Filter by orderType to avoid duplicates
                        status: 'PROCESSING' // Só buscar ordens que estão em PROCESSING
                    },
                    select: { id: true, remainingAmount: true, status: true, blockchainOrderId: true }
                }),
                this.prisma.exchangeOrder.findFirst({
                    where: {
                        blockchainOrderId: BigInt(sellOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'SELL', // CRITICAL: Filter by orderType to avoid duplicates
                        status: 'PROCESSING' // Só buscar ordens que estão em PROCESSING
                    },
                    select: { id: true, remainingAmount: true, status: true, blockchainOrderId: true }
                })
            ]);

            console.log(`📋 Found orders in DB:`);
            console.log(`   Buy Order:`, currentBuyOrder);
            console.log(`   Sell Order:`, currentSellOrder);

            if (!currentBuyOrder || !currentSellOrder) {
                console.log('⚠️ Orders not found in PROCESSING status - likely already processed by another service');
                console.log('   This can happen when multiple services process the same match');
                console.log('   Skipping update to avoid conflicts...');
                return; // Sair sem erro, pois a transação blockchain já foi bem-sucedida
            }

            // Calcular o valor que foi matchado (menor entre as duas ordens ATUAIS)
            const buyRemaining = parseFloat(currentBuyOrder.remainingAmount);
            const sellRemaining = parseFloat(currentSellOrder.remainingAmount);
            const matchedAmount = Math.min(buyRemaining, sellRemaining);

            // Calcular novos remainingAmount para cada ordem
            const newBuyRemaining = buyRemaining - matchedAmount;
            const newSellRemaining = sellRemaining - matchedAmount;

            // Determinar status baseado no remainingAmount
            const buyStatus = newBuyRemaining > 0 ? 'ACTIVE' : 'EXECUTED';
            const sellStatus = newSellRemaining > 0 ? 'ACTIVE' : 'EXECUTED';

            console.log(`  📊 Match details:`);
            console.log(`    Matched amount: ${matchedAmount}`);
            console.log(`    Buy order: ${buyRemaining} → ${newBuyRemaining} (${buyStatus})`);
            console.log(`    Sell order: ${sellRemaining} → ${newSellRemaining} (${sellStatus})`);

            // Atualizar ordens com status correto baseado na execução
            // USAR updateMany para garantir que todas as ordens duplicadas com mesmo blockchainOrderId sejam atualizadas
            const updatePromises = [
                this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(buyOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'BUY',  // CRITICAL: Must specify orderType to avoid updating wrong order!
                        status: 'PROCESSING'
                    },
                    data: {
                        status: buyStatus,
                        // transactionHash NEVER changes - it's the creation TX hash (immutable)
                        blockNumber: blockNumber ? BigInt(blockNumber) : null,
                        remainingAmount: newBuyRemaining.toString(),
                        updatedAt: new Date()
                    }
                }),
                this.prisma.exchangeOrder.updateMany({
                    where: {
                        blockchainOrderId: BigInt(sellOrder.id),
                        exchangeContractAddress: contractAddress,
                        orderType: 'SELL',  // CRITICAL: Must specify orderType to avoid updating wrong order!
                        status: 'PROCESSING'
                    },
                    data: {
                        status: sellStatus,
                        // transactionHash NEVER changes - it's the creation TX hash (immutable)
                        blockNumber: blockNumber ? BigInt(blockNumber) : null,
                        remainingAmount: newSellRemaining.toString(),
                        updatedAt: new Date()
                    }
                })
            ];

            const [buyResult, sellResult] = await Promise.all(updatePromises);

            console.log(`✅ Orders updated:`);
            console.log(`   Buy Order #${buyOrder.id}: ${buyResult.count} rows updated to ${buyStatus}`);
            console.log(`   Sell Order #${sellOrder.id}: ${sellResult.count} rows updated to ${sellStatus}`);

            // Verificar se as atualizações foram bem-sucedidas
            if (!buyResult || !sellResult) {
                console.error('❌ Update operation returned null results');
                console.error(`   Buy result: ${JSON.stringify(buyResult)}`);
                console.error(`   Sell result: ${JSON.stringify(sellResult)}`);
                throw new Error('Order update operation failed');
            }

            // Log do resultado das atualizações para diagnóstico
            if (buyResult.count === 0 || sellResult.count === 0) {
                console.error('⚠️ Warning: Some orders were not updated (possibly already processed)');
                console.error(`   Buy result: ${JSON.stringify(buyResult)} (${buyResult.count} rows)`);
                console.error(`   Sell result: ${JSON.stringify(sellResult)} (${sellResult.count} rows)`);

                // Verificar se as ordens ainda existem no banco
                const [checkBuy, checkSell] = await Promise.all([
                    this.prisma.exchangeOrder.findFirst({
                        where: {
                            blockchainOrderId: BigInt(buyOrder.id),
                            exchangeContractAddress: contractAddress,
                            orderType: 'BUY' // CRITICAL: Filter by orderType to avoid duplicates
                        },
                        select: { status: true, remainingAmount: true }
                    }),
                    this.prisma.exchangeOrder.findFirst({
                        where: {
                            blockchainOrderId: BigInt(sellOrder.id),
                            exchangeContractAddress: contractAddress,
                            orderType: 'SELL' // CRITICAL: Filter by orderType to avoid duplicates
                        },
                        select: { status: true, remainingAmount: true }
                    })
                ]);

                console.log(`   Current buy order status: ${checkBuy?.status || 'NOT FOUND'} (remaining: ${checkBuy?.remainingAmount || 'N/A'})`);
                console.log(`   Current sell order status: ${checkSell?.status || 'NOT FOUND'} (remaining: ${checkSell?.remainingAmount || 'N/A'})`);

                // Se as ordens não estão mais em PROCESSING, podem já ter sido processadas
                const bothProcessed = (checkBuy && checkBuy.status !== 'PROCESSING') &&
                                    (checkSell && checkSell.status !== 'PROCESSING');

                if (bothProcessed) {
                    console.log('ℹ️ Orders appear to have been processed by another instance, continuing...');
                } else {
                    throw new Error(`Order update failed - Buy: ${buyResult.count} rows, Sell: ${sellResult.count} rows`);
                }
            }

            // Criar registro na tabela exchange_trades para histórico
            console.log('🎯 About to call createTradeRecord...');
            // Passar os IDs das ordens encontradas durante o UPDATE para o createTradeRecord
            const orderIds = {
                buyOrderId: currentBuyOrder.id,
                sellOrderId: currentSellOrder.id
            };
            await this.createTradeRecord(matchData, result, matchedAmount, orderIds);
            console.log('🎯 createTradeRecord completed successfully');

            // Criar registros de transação para ambos os usuários envolvidos no match
            console.log('📝 Creating transaction records for match execution...');
            await this.createMatchTransactionRecords(matchData, result, matchedAmount);
            console.log('📝 Transaction records created successfully');

        } catch (error) {
            console.error('❌ Error updating orders in database:', error);
            throw error;
        }
    }

    /**
     * Criar registro do trade na tabela exchange_trades
     */
    async createTradeRecord(matchData, result, matchedAmount, orderIds = null) {
        try {
            console.log('📊 Creating trade record...');
            console.log(`   Contract: ${matchData.contractAddress}`);
            console.log(`   Pair: ${matchData.pair}`);
            console.log(`   Matched amount: ${matchedAmount}`);
            console.log(`   Buy Order Price: ${matchData.buyOrder.price}`);
            console.log(`   Sell Order Price: ${matchData.sellOrder.price}`);
            console.log(`   TX Hash: ${result.transactionHash}`);
            console.log(`   Order IDs: Buy=${orderIds?.buyOrderId}, Sell=${orderIds?.sellOrderId}`);

            const { contractAddress, buyOrder, sellOrder, pair } = matchData;
            const { transactionHash, blockNumber } = result;

            // Validações básicas
            if (!contractAddress || !transactionHash) {
                throw new Error('Missing required data: contractAddress or transactionHash');
            }

            if (matchedAmount <= 0) {
                throw new Error(`Invalid matched amount: ${matchedAmount}`);
            }

            // Verificar se o trade já existe para evitar duplicatas
            const existingTrade = await this.prisma.exchangeTrade.findFirst({
                where: {
                    transactionHash: transactionHash
                }
            });

            if (existingTrade) {
                console.log(`ℹ️ Trade already exists for transaction ${transactionHash}, skipping creation`);
                return existingTrade;
            }

            // Extrair símbolos do pair (ex: "CST/cBRL" → tokenB = "CST", tokenA = "cBRL")
            const [tokenBSymbol, tokenASymbol] = (pair || 'CST/cBRL').split('/');

            // Calcular preço e valor total
            const price = parseFloat(buyOrder.price);
            const amount = matchedAmount;
            const totalValue = price * amount;

            console.log(`   Trade details: ${amount} ${tokenBSymbol} at ${price} ${tokenASymbol} = ${totalValue} total`);

            // Importar função correta de normalização de endereços (formato checksum)
            const { normalizeAddress } = require('../utils/address');

            let buyOrderRecord = null;
            let sellOrderRecord = null;

            // Se IDs foram passados como parâmetro, usar eles (método preferido)
            if (orderIds) {
                console.log(`   ✅ Using provided order IDs:`);
                console.log(`     Buy Order ID: ${orderIds.buyOrderId}`);
                console.log(`     Sell Order ID: ${orderIds.sellOrderId}`);

                buyOrderRecord = { id: orderIds.buyOrderId };
                sellOrderRecord = { id: orderIds.sellOrderId };
            } else {
                // Fallback: Buscar IDs das ordens no banco para relacionar ao trade
                console.log(`   🔍 Searching for order IDs in database...`);

                [buyOrderRecord, sellOrderRecord] = await Promise.all([
                    this.prisma.exchangeOrder.findFirst({
                        where: {
                            blockchainOrderId: BigInt(buyOrder.id),
                            exchangeContractAddress: normalizeAddress(contractAddress),
                            orderType: 'BUY' // CRITICAL: Filter by orderType to avoid duplicates
                        },
                        select: { id: true, status: true, blockchainOrderId: true }
                    }),
                    this.prisma.exchangeOrder.findFirst({
                        where: {
                            blockchainOrderId: BigInt(sellOrder.id),
                            exchangeContractAddress: normalizeAddress(contractAddress),
                            orderType: 'SELL' // CRITICAL: Filter by orderType to avoid duplicates
                        },
                        select: { id: true, status: true, blockchainOrderId: true }
                    })
                ]);

                console.log(`   📋 Found records in database:`);
                console.log(`     Buy Order: ${buyOrderRecord ? `ID=${buyOrderRecord.id}, status=${buyOrderRecord.status}` : 'not found'}`);
                console.log(`     Sell Order: ${sellOrderRecord ? `ID=${sellOrderRecord.id}, status=${sellOrderRecord.status}` : 'not found'}`);
            }

            const tradeData = {
                exchangeContractAddress: normalizeAddress(contractAddress),
                buyOrderId: buyOrderRecord?.id || null, // UUID da ordem de compra
                sellOrderId: sellOrderRecord?.id || null, // UUID da ordem de venda
                buyerAddress: normalizeAddress(buyOrder.userAddress),
                sellerAddress: normalizeAddress(sellOrder.userAddress),
                tokenASymbol: tokenASymbol || 'cBRL',
                tokenBSymbol: tokenBSymbol || 'CST',
                price: price.toString(),
                amount: amount.toString(),
                totalValue: totalValue.toString(),
                feeAmount: '0', // TODO: Implementar cálculo de taxa se necessário
                transactionHash: transactionHash,
                blockNumber: blockNumber ? BigInt(blockNumber) : BigInt(0),
                tradeTimestamp: new Date()
            };


            console.log(`🔄 Creating trade with data: ${JSON.stringify(tradeData, null, 2)}`);

            const createdTrade = await this.prisma.exchangeTrade.create({
                data: tradeData
            });

            console.log(`✅ Trade record created successfully:`, createdTrade.id);
            console.log(`   Trade: ${amount} ${tokenBSymbol} at ${price} ${tokenASymbol} (TX: ${transactionHash})`);

        } catch (error) {
            // Log erro mas não interromper o fluxo principal
            console.error('❌ Error creating trade record:', error.message);
            console.error('❌ Full error:', error);

            // Se for erro de constraint UNIQUE (trade duplicado), ignorar silenciosamente
            if (error.code === 'P2002') {
                console.log('ℹ️ Trade record already exists (duplicate), skipping...');
            } else if (error.code === 'P2000') {
                console.error('❌ Prisma validation error - check field types and constraints');
            } else {
                console.error('❌ Unexpected error creating trade record');
                console.error(`   Error code: ${error.code}`);
                console.error(`   Error message: ${error.message}`);
            }
        }
    }

    /**
     * Criar registros de transação para execução de match
     * Cria um registro para cada usuário envolvido (comprador e vendedor)
     */
    async createMatchTransactionRecords(matchData, result, matchedAmount) {
        try {
            console.log('📝 Creating transaction records for match...');

            const { contractAddress, buyOrder, sellOrder, pair } = matchData;
            const { transactionHash, blockNumber } = result;

            // Extrair símbolos do par (ex: "CST/cBRL" → tokenB = "CST", tokenA = "cBRL")
            const [tokenBSymbol, tokenASymbol] = (pair || 'CST/cBRL').split('/');

            // Criar registro para o comprador (usuario da buy order)
            try {
                await orderManagementService.createTransactionRecord(
                    buyOrder.userAddress,
                    'executeTrade', // functionName específico para matches
                    matchedAmount,
                    tokenBSymbol, // O comprador está comprando tokenB
                    contractAddress,
                    transactionHash,
                    blockNumber,
                    result.gasUsed
                );
                console.log(`  ✅ Transaction record created for buyer ${buyOrder.userAddress.substring(0, 8)}...`);
            } catch (error) {
                console.error(`  ⚠️ Failed to create transaction record for buyer:`, error.message);
            }

            // Criar registro para o vendedor (usuario da sell order)
            try {
                await orderManagementService.createTransactionRecord(
                    sellOrder.userAddress,
                    'executeTrade', // functionName específico para matches
                    matchedAmount,
                    tokenBSymbol, // O vendedor está vendendo tokenB
                    contractAddress,
                    transactionHash,
                    blockNumber,
                    result.gasUsed
                );
                console.log(`  ✅ Transaction record created for seller ${sellOrder.userAddress.substring(0, 8)}...`);
            } catch (error) {
                console.error(`  ⚠️ Failed to create transaction record for seller:`, error.message);
            }

            console.log('✅ Match transaction records creation completed');

        } catch (error) {
            console.error('❌ Error creating match transaction records:', error);
            // Não fazer throw - registros de transação são suplementares
        }
    }

    /**
     * Notificar match executado via WebSocket
     */
    async notifyMatchExecuted(matchData, result) {
        try {
            console.log('📡 Broadcasting match execution via WebSocket...');

            const notificationData = {
                type: 'MATCH_EXECUTED',
                contractAddress: matchData.contractAddress,
                pair: matchData.pair,
                buyOrderId: matchData.buyOrder.id,
                sellOrderId: matchData.sellOrder.id,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                timestamp: new Date().toISOString()
            };

            // Enviar notificação via WebSocket broadcast
            await this.rabbitMQ.publishWebSocketBroadcast('match.executed', notificationData);

            console.log('✅ Match execution broadcasted');

        } catch (error) {
            console.error('❌ Error broadcasting match execution:', error);
        }
    }

    /**
     * Notificar grupo de matches executado via WebSocket
     */
    async notifyMatchGroupExecuted(matchData, result) {
        try {
            console.log('📡 Broadcasting match group execution via WebSocket...');

            const notificationData = {
                type: 'MATCH_GROUP_EXECUTED',
                contractAddress: matchData.contractAddress,
                pair: matchData.pair,
                buyOrderIds: matchData.matchGroup.buyOrders.map(o => o.id),
                sellOrderIds: matchData.matchGroup.sellOrders.map(o => o.id),
                totalAmount: matchData.matchGroup.totalAmount,
                executionPrice: matchData.matchGroup.executionPrice,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                timestamp: new Date().toISOString()
            };

            // Enviar notificação via WebSocket broadcast
            await this.rabbitMQ.publishWebSocketBroadcast('match.group.executed', notificationData);

            console.log('✅ Match group execution broadcasted');
            console.log(`  Orders: ${notificationData.buyOrderIds.length + notificationData.sellOrderIds.length} total`);
            console.log(`  Amount: ${notificationData.totalAmount} at ${notificationData.executionPrice}`);

        } catch (error) {
            console.error('❌ Error broadcasting match group execution:', error);
        }
    }

    /**
     * Parar o consumer
     */
    async stop() {
        try {
            console.log('🛑 Stopping MatchExecutorService...');

            // Aguardar processamento atual terminar
            while (this.isProcessing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log('✅ MatchExecutorService stopped');

        } catch (error) {
            console.error('❌ Error stopping MatchExecutorService:', error);
        }
    }

    /**
     * Limpar ordens PROCESSING órfãs (com timeout)
     * Executa automaticamente quando o serviço inicia
     */
    async cleanupOrphanedProcessingOrders() {
        try {
            console.log('🧹 Cleaning up orphaned PROCESSING orders...');

            // Buscar ordens que estão em PROCESSING há mais de 5 minutos
            const timeoutMinutes = 5;
            const timeoutDate = new Date();
            timeoutDate.setMinutes(timeoutDate.getMinutes() - timeoutMinutes);

            const orphanedOrders = await this.prisma.exchangeOrder.findMany({
                where: {
                    status: 'PROCESSING',
                    updatedAt: {
                        lt: timeoutDate
                    }
                },
                select: {
                    blockchainOrderId: true,
                    exchangeContractAddress: true,
                    userAddress: true,
                    updatedAt: true
                }
            });

            if (orphanedOrders.length === 0) {
                console.log('✅ No orphaned PROCESSING orders found');
                return;
            }

            console.log(`🔍 Found ${orphanedOrders.length} orphaned PROCESSING orders older than ${timeoutMinutes} minutes`);

            // Reverter todas as ordens órfãs para ACTIVE
            const result = await this.prisma.exchangeOrder.updateMany({
                where: {
                    status: 'PROCESSING',
                    updatedAt: {
                        lt: timeoutDate
                    }
                },
                data: {
                    status: 'ACTIVE',
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Reverted ${result.count} orphaned orders from PROCESSING to ACTIVE`);

            // Log detalhes das ordens limpas
            orphanedOrders.forEach(order => {
                const timeDiff = Math.floor((new Date() - order.updatedAt) / 60000);
                console.log(`  - Order #${order.blockchainOrderId} (${order.userAddress.substring(0,8)}...) stuck for ${timeDiff} minutes`);
            });

        } catch (error) {
            console.error('❌ Error cleaning up orphaned PROCESSING orders:', error);
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const blockNumber = await this.provider.getBlockNumber();

            return {
                healthy: true,
                blockNumber,
                walletAddress: this.wallet.address,
                processing: this.isProcessing
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }
}

module.exports = MatchExecutorService;
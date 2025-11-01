/**
 * Order Reconciliation Service
 *
 * Executa reconciliação completa em 2 etapas:
 * 1. Sincronização de status com blockchain
 * 2. Detecção e execução de matches pendentes
 */

const { PrismaClient } = require('../generated/prisma');
const { ethers } = require('ethers');

class OrderReconciliationService {
    constructor() {
        this.prisma = global.prisma || new PrismaClient();
        this.isRunning = false;
        this.lastRun = null;
        this.stats = {
            totalRuns: 0,
            syncedOrders: 0,
            executedMatches: 0,
            errors: 0
        };

        // Exchange configuration
        this.EXCHANGE_CONTRACT_ADDRESS = '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';

        // Use environment variables to determine RPC URL
        const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
        this.RPC_URL = defaultNetwork === 'mainnet'
            ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
            : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';

        // Contract ABI
        this.EXCHANGE_ABI = [
            {
                "inputs": [],
                "name": "nextBuyOrderId",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "nextSellOrderId",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "orderId", "type": "uint256"}],
                "name": "buyOrders",
                "outputs": [{
                    "components": [
                        {"name": "id", "type": "uint256"},
                        {"name": "buyer", "type": "address"},
                        {"name": "amountTokenB", "type": "uint256"},
                        {"name": "pricePerTokenB", "type": "uint256"},
                        {"name": "remainingAmount", "type": "uint256"},
                        {"name": "isActive", "type": "bool"},
                        {"name": "createdAt", "type": "uint256"}
                    ],
                    "type": "tuple"
                }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "orderId", "type": "uint256"}],
                "name": "sellOrders",
                "outputs": [{
                    "components": [
                        {"name": "id", "type": "uint256"},
                        {"name": "seller", "type": "address"},
                        {"name": "amountTokenA", "type": "uint256"},
                        {"name": "pricePerTokenB", "type": "uint256"},
                        {"name": "remainingAmount", "type": "uint256"},
                        {"name": "isActive", "type": "bool"},
                        {"name": "createdAt", "type": "uint256"}
                    ],
                    "type": "tuple"
                }],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    /**
     * Executa reconciliação completa
     */
    async runFullReconciliation(options = {}) {
        if (this.isRunning) {
            console.log('⏳ Reconciliação já está rodando, aguardando...');
            return { success: false, message: 'Already running' };
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            console.log('🔄 INICIANDO RECONCILIAÇÃO COMPLETA');
            console.log('='.repeat(60));

            // ETAPA 1: Sincronização de Status com Blockchain
            console.log('📋 ETAPA 1: Sincronizando status das ordens...');
            const syncResult = await this.syncOrdersWithBlockchain(options);

            if (!syncResult.success) {
                throw new Error(`Falha na sincronização: ${syncResult.error}`);
            }

            console.log(`✅ Sincronização concluída: ${syncResult.updated} ordens atualizadas`);

            // ETAPA 2: Detecção e Execução de Matches Pendentes
            console.log('\\n🎯 ETAPA 2: Detectando matches pendentes...');
            const matchResult = await this.detectAndExecutePendingMatches(options);

            if (!matchResult.success) {
                console.warn(`⚠️ Aviso na detecção de matches: ${matchResult.error}`);
            }

            console.log(`✅ Matching concluído: ${matchResult.executed} matches executados`);

            // Atualizar estatísticas
            this.stats.totalRuns++;
            this.stats.syncedOrders += syncResult.updated;
            this.stats.executedMatches += matchResult.executed;
            this.lastRun = new Date();

            const duration = Date.now() - startTime;

            console.log('\\n' + '='.repeat(60));
            console.log('✅ RECONCILIAÇÃO COMPLETA FINALIZADA');
            console.log(`⏱️ Duração: ${duration}ms`);
            console.log(`📊 Ordens sincronizadas: ${syncResult.updated}`);
            console.log(`🎯 Matches executados: ${matchResult.executed}`);
            console.log('='.repeat(60));

            return {
                success: true,
                duration,
                sync: syncResult,
                matches: matchResult,
                stats: this.getStats()
            };

        } catch (error) {
            this.stats.errors++;
            console.error('❌ Erro na reconciliação:', error.message);

            return {
                success: false,
                error: error.message,
                stats: this.getStats()
            };
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * ETAPA 1: Sincronizar ordens com blockchain
     */
    async syncOrdersWithBlockchain(options = {}) {
        try {
            // Initialize blockchain connection
            const provider = new ethers.JsonRpcProvider(this.RPC_URL);
            const contract = new ethers.Contract(this.EXCHANGE_CONTRACT_ADDRESS, this.EXCHANGE_ABI, provider);

            // Get orders that might need sync (ACTIVE only)
            const ordersToCheck = await this.prisma.exchangeOrder.findMany({
                where: {
                    exchangeContractAddress: this.EXCHANGE_CONTRACT_ADDRESS,
                    status: {
                        in: ['ACTIVE', 'ACTIVE']
                    }
                },
                orderBy: {
                    blockchainOrderId: 'asc'
                }
            });

            console.log(`🔍 Verificando ${ordersToCheck.length} ordens ativas/parciais...`);

            let updatedCount = 0;
            let errorCount = 0;

            for (const order of ordersToCheck) {
                try {
                    const orderId = Number(order.blockchainOrderId);
                    const updated = await this.syncSingleOrder(contract, order);

                    if (updated) {
                        updatedCount++;
                        console.log(`✅ Ordem ${orderId} sincronizada`);
                    }
                } catch (error) {
                    errorCount++;
                    console.warn(`⚠️ Erro sincronizando ordem ${order.blockchainOrderId}: ${error.message}`);
                }
            }

            return {
                success: true,
                checked: ordersToCheck.length,
                updated: updatedCount,
                errors: errorCount
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sincronizar uma ordem específica
     */
    async syncSingleOrder(contract, order) {
        const orderId = Number(order.blockchainOrderId);

        try {
            let blockchainOrder = null;
            let orderExists = false;

            // Get order data from blockchain
            if (order.orderType === 'BUY') {
                try {
                    blockchainOrder = await contract.buyOrders(orderId);
                    const [id, buyer] = blockchainOrder;
                    orderExists = buyer !== '0x0000000000000000000000000000000000000000';
                } catch (error) {
                    orderExists = false;
                }
            } else if (order.orderType === 'SELL') {
                try {
                    blockchainOrder = await contract.sellOrders(orderId);
                    const [id, seller] = blockchainOrder;
                    orderExists = seller !== '0x0000000000000000000000000000000000000000';
                } catch (error) {
                    orderExists = false;
                }
            }

            if (!orderExists) {
                // Order doesn't exist - mark as executed
                await this.prisma.exchangeOrder.update({
                    where: { id: order.id },
                    data: {
                        status: 'EXECUTED',
                        remainingAmount: 0,
                        filledAmount: parseFloat(order.amount),
                        updatedAt: new Date()
                    }
                });
                return true;
            }

            if (blockchainOrder) {
                const [id, userAddress, amount, price, remainingAmount, isActive] = blockchainOrder;
                const remainingEther = parseFloat(ethers.formatUnits(remainingAmount, 18));
                const amountEther = parseFloat(ethers.formatUnits(amount, 18));
                const filledAmount = amountEther - remainingEther;

                let newStatus;
                if (isActive && remainingEther > 0) {
                    newStatus = 'ACTIVE';
                } else {
                    newStatus = 'EXECUTED';
                }

                // Check if update is needed
                if (order.status !== newStatus || Math.abs(parseFloat(order.remainingAmount) - remainingEther) > 0.0001) {
                    await this.prisma.exchangeOrder.update({
                        where: { id: order.id },
                        data: {
                            status: newStatus,
                            remainingAmount: remainingEther,
                            filledAmount: filledAmount,
                            updatedAt: new Date()
                        }
                    });
                    return true;
                }
            }

            return false;
        } catch (error) {
            throw new Error(`Failed to sync order ${orderId}: ${error.message}`);
        }
    }

    /**
     * ETAPA 2: Detectar e executar matches pendentes
     */
    async detectAndExecutePendingMatches(options = {}) {
        try {
            // Get active orders that might match
            const activeOrders = await this.prisma.exchangeOrder.findMany({
                where: {
                    exchangeContractAddress: this.EXCHANGE_CONTRACT_ADDRESS,
                    status: {
                        in: ['ACTIVE', 'ACTIVE']
                    },
                    remainingAmount: {
                        gt: 0
                    }
                },
                orderBy: [
                    { orderType: 'asc' }, // BUY first, then SELL
                    { price: 'desc' }, // Higher prices first for BUY
                    { createdAt: 'asc' } // FIFO
                ]
            });

            console.log(`🔍 Analisando ${activeOrders.length} ordens ativas para matches...`);

            const buyOrders = activeOrders.filter(o => o.orderType === 'BUY');
            const sellOrders = activeOrders.filter(o => o.orderType === 'SELL');

            console.log(`📊 ${buyOrders.length} ordens de compra, ${sellOrders.length} ordens de venda`);

            let matchesFound = 0;
            let matchesExecuted = 0;

            // Check for potential matches
            for (const buyOrder of buyOrders) {
                for (const sellOrder of sellOrders) {
                    // Check if prices can match (buy price >= sell price)
                    const buyPrice = parseFloat(buyOrder.price);
                    const sellPrice = parseFloat(sellOrder.price);

                    if (buyPrice >= sellPrice) {
                        const buyRemaining = parseFloat(buyOrder.remainingAmount);
                        const sellRemaining = parseFloat(sellOrder.remainingAmount);

                        if (buyRemaining > 0 && sellRemaining > 0) {
                            matchesFound++;
                            console.log(`💡 Match encontrado: Buy ${buyOrder.blockchainOrderId} (${buyPrice}) x Sell ${sellOrder.blockchainOrderId} (${sellPrice})`);

                            // Try to execute the match
                            try {
                                const matchResult = await this.executeMatch(buyOrder, sellOrder);
                                matchesExecuted++;
                                console.log(`✅ Match executado com sucesso`);

                                // Register the trade
                                await this.registerTrade(buyOrder, sellOrder, matchResult);
                            } catch (error) {
                                console.warn(`⚠️ Falha ao executar match: ${error.message}`);
                            }
                        }
                    }
                }
            }

            return {
                success: true,
                analyzed: activeOrders.length,
                matchesFound,
                executed: matchesExecuted
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                executed: 0
            };
        }
    }

    /**
     * Executar um match específico
     */
    async executeMatch(buyOrder, sellOrder) {
        try {
            // Get the global OrderManagementService instance (already initialized with contracts)
            const exchangeRoutes = require('../routes/exchangeRoutes');
            const orderManagementService = exchangeRoutes.getOrderManagementService();

            if (!orderManagementService) {
                throw new Error('OrderManagementService not initialized. Make sure exchange services are started.');
            }

            // Execute the match using order management service
            const result = await orderManagementService.executeMatchOrders(
                this.EXCHANGE_CONTRACT_ADDRESS,
                [Number(buyOrder.blockchainOrderId)],
                [Number(sellOrder.blockchainOrderId)]
            );

            return result;
        } catch (error) {
            throw new Error(`Failed to execute match: ${error.message}`);
        }
    }

    /**
     * Obter estatísticas do serviço
     */
    getStats() {
        return {
            ...this.stats,
            lastRun: this.lastRun,
            isRunning: this.isRunning
        };
    }

    /**
     * Registrar trade executado
     */
    async registerTrade(buyOrder, sellOrder, matchResult) {
        try {
            // Calculate the trade details
            const buyPrice = parseFloat(buyOrder.price);
            const sellPrice = parseFloat(sellOrder.price);

            // The executed price is typically the sell price (maker price)
            const executedPrice = sellPrice;

            // Calculate the amount traded (minimum of remaining amounts)
            const buyRemaining = parseFloat(buyOrder.remainingAmount);
            const sellRemaining = parseFloat(sellOrder.remainingAmount);
            const tradedAmount = Math.min(buyRemaining, sellRemaining);

            // Calculate total value
            const totalValue = executedPrice * tradedAmount;

            // Calculate fee (assume 0.1% fee for now)
            const feeAmount = totalValue * 0.001;

            // Get user addresses from orders
            const buyerAddress = buyOrder.userAddress || '0x0000000000000000000000000000000000000000';
            const sellerAddress = sellOrder.userAddress || '0x0000000000000000000000000000000000000000';

            console.log(`📊 Registrando trade: ${tradedAmount} tokens a ${executedPrice} (total: ${totalValue})`);

            // Register the trade in the database
            const trade = await this.prisma.exchangeTrade.create({
                data: {
                    exchangeContractAddress: this.EXCHANGE_CONTRACT_ADDRESS,
                    buyOrderId: buyOrder.id,
                    sellOrderId: sellOrder.id,
                    buyerAddress: buyerAddress,
                    sellerAddress: sellerAddress,
                    tokenASymbol: 'CST', // Token being sold
                    tokenBSymbol: 'cBRL', // Token being bought
                    price: executedPrice,
                    amount: tradedAmount,
                    totalValue: totalValue,
                    feeAmount: feeAmount,
                    transactionHash: matchResult?.transactionHash || '0x' + Date.now().toString(16).padStart(64, '0'),
                    blockNumber: matchResult?.blockNumber || BigInt(Date.now()),
                    tradeTimestamp: new Date(),
                }
            });

            console.log(`✅ Trade registrado com ID: ${trade.id}`);
            return trade;

        } catch (error) {
            console.error(`❌ Erro ao registrar trade: ${error.message}`);
            throw error;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const dbCheck = await this.prisma.$queryRaw`SELECT 1`;
            return {
                healthy: true,
                service: 'OrderReconciliationService',
                database: !!dbCheck,
                stats: this.getStats()
            };
        } catch (error) {
            return {
                healthy: false,
                service: 'OrderReconciliationService',
                error: error.message
            };
        }
    }
}

// Export singleton instance
module.exports = new OrderReconciliationService();
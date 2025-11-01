const { ethers } = require('ethers');
const prismaConfig = require('../config/prisma');
const path = require('path');
const fs = require('fs');

class OrderIdAutoUpdater {
    constructor() {
        this.prisma = null;
        this.provider = null;
        this.contract = null;
        this.isRunning = false;
        this.intervalId = null;
    }

    async initialize() {
        try {
            this.prisma = prismaConfig.getPrisma();

            // Setup blockchain connection
            const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
            const RPC_URL = defaultNetwork === 'mainnet'
                ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
                : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';
            this.provider = new ethers.JsonRpcProvider(RPC_URL);

            // Load exchange ABI
            const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_exchange_abi.json');
            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

            // Setup contract
            const CONTRACT_ADDRESS = process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, exchangeABI, this.provider);

            console.log('✅ OrderIdAutoUpdater initialized');
            console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
            console.log(`🔗 RPC: ${RPC_URL}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize OrderIdAutoUpdater:', error);
            throw error;
        }
    }

    /**
     * Inicia o monitoramento automático de ordens com blockchain_order_id = 0
     */
    startAutoUpdate(intervalSeconds = 30) {
        if (this.isRunning) {
            console.log('⚠️ OrderIdAutoUpdater already running');
            return;
        }

        this.isRunning = true;
        console.log(`🔄 Starting OrderIdAutoUpdater (checking every ${intervalSeconds}s)`);

        // Executa imediatamente
        this.updatePendingOrders();

        // Configura intervalo
        this.intervalId = setInterval(() => {
            this.updatePendingOrders();
        }, intervalSeconds * 1000);
    }

    /**
     * Para o monitoramento automático
     */
    stopAutoUpdate() {
        if (!this.isRunning) {
            console.log('⚠️ OrderIdAutoUpdater not running');
            return;
        }

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('🛑 OrderIdAutoUpdater stopped');
    }

    /**
     * Atualiza todas as ordens pendentes (blockchain_order_id = 0)
     */
    async updatePendingOrders() {
        try {
            // Buscar ordens com blockchain_order_id = 0 e transaction_hash
            const pendingOrders = await this.prisma.exchangeOrder.findMany({
                where: {
                    blockchainOrderId: 0,
                    transactionHash: {
                        not: null
                    },
                    status: 'ACTIVE'
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10 // Processa até 10 por vez para não sobrecarregar
            });

            if (pendingOrders.length === 0) {
                console.log('✅ No pending orders to update');
                return;
            }

            console.log(`🔍 Found ${pendingOrders.length} pending orders to update`);

            for (const order of pendingOrders) {
                await this.updateSingleOrder(order);

                // Pequena pausa entre processamentos
                await new Promise(resolve => setTimeout(resolve, 100));
            }

        } catch (error) {
            console.error('❌ Error in updatePendingOrders:', error);
        }
    }

    /**
     * Atualiza uma única ordem
     */
    async updateSingleOrder(order) {
        try {
            console.log(`🔍 Processing order ${order.id.substring(0, 8)}... txHash: ${order.transactionHash}`);

            // Buscar receipt da transação
            const receipt = await this.provider.getTransactionReceipt(order.transactionHash);

            if (!receipt) {
                console.log(`⚠️ No receipt found for ${order.transactionHash}`);
                return;
            }

            // Criar interface do contrato para parsing
            const contractInterface = new ethers.Interface(this.contract.interface.fragments);

            // Buscar evento de criação de ordem
            let blockchainOrderId = null;

            for (const log of receipt.logs) {
                try {
                    const parsedLog = contractInterface.parseLog(log);

                    if (parsedLog && (parsedLog.name === 'BuyOrderCreated' || parsedLog.name === 'SellOrderCreated')) {
                        blockchainOrderId = parsedLog.args.orderId.toString();
                        console.log(`✅ Found ${parsedLog.name} event with orderId: ${blockchainOrderId}`);
                        break;
                    }
                } catch (e) {
                    // Log pode não ser do nosso contrato, continua
                    continue;
                }
            }

            if (blockchainOrderId) {
                // Atualizar no banco
                await this.prisma.exchangeOrder.update({
                    where: { id: order.id },
                    data: {
                        blockchainOrderId: BigInt(blockchainOrderId),
                        blockNumber: receipt.blockNumber ? BigInt(receipt.blockNumber) : null,
                        updatedAt: new Date()
                    }
                });

                console.log(`✅ Updated order ${order.id.substring(0, 8)}... with blockchain_order_id: ${blockchainOrderId}`);

                // Notificar via console
                console.log(`🎉 Order ID ${blockchainOrderId} recovered for ${order.orderType} order!`);

            } else {
                console.log(`❌ No order creation event found in transaction ${order.transactionHash}`);
            }

        } catch (error) {
            console.error(`❌ Error processing order ${order.id}:`, error.message);
        }
    }

    /**
     * Força atualização manual de todas as ordens pendentes
     */
    async forceUpdateAll() {
        console.log('🔧 Force updating all pending orders...');
        await this.updatePendingOrders();
        console.log('✅ Force update completed');
    }

    /**
     * Obtém estatísticas das ordens
     */
    async getStats() {
        try {
            const stats = await this.prisma.exchangeOrder.groupBy({
                by: ['status'],
                where: {
                    exchangeContractAddress: process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9'
                },
                _count: {
                    id: true
                }
            });

            const pendingCount = await this.prisma.exchangeOrder.count({
                where: {
                    blockchainOrderId: 0,
                    transactionHash: { not: null },
                    status: 'ACTIVE'
                }
            });

            return {
                ordersByStatus: stats,
                pendingOrdersCount: pendingCount
            };
        } catch (error) {
            console.error('❌ Error getting stats:', error);
            return null;
        }
    }
}

module.exports = OrderIdAutoUpdater;
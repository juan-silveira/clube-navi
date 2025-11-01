const { ethers } = require('ethers');
const prismaConfig = require('../config/prisma');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

class InstantOrderIdUpdater {
    constructor() {
        this.prisma = null;
        this.provider = null;
        this.contract = null;
        this.pgClient = null;
        this.isListening = false;
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

            // Setup PostgreSQL client for LISTEN/NOTIFY
            this.pgClient = new Client({
                host: process.env.DATABASE_HOST || 'localhost',
                port: process.env.DATABASE_PORT || 5432,
                user: process.env.DATABASE_USER || 'coinage_user',
                password: process.env.DATABASE_PASSWORD || 'coinage_password',
                database: process.env.DATABASE_NAME || 'coinage_db',
            });

            await this.pgClient.connect();

            console.log('✅ InstantOrderIdUpdater initialized');
            console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
            console.log(`🔗 RPC: ${RPC_URL}`);
            console.log('🎯 PostgreSQL NOTIFY/LISTEN ready');

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize InstantOrderIdUpdater:', error);
            throw error;
        }
    }

    /**
     * Inicia a escuta em tempo real de novas ordens
     */
    async startListening() {
        if (this.isListening) {
            console.log('⚠️ InstantOrderIdUpdater already listening');
            return;
        }

        try {
            // Configurar listener para notificações do PostgreSQL
            this.pgClient.on('notification', async (msg) => {
                if (msg.channel === 'new_order_inserted') {
                    await this.handleNewOrderNotification(msg.payload);
                }
            });

            // Começar a escutar o canal 'new_order_inserted'
            await this.pgClient.query('LISTEN new_order_inserted');

            this.isListening = true;
            console.log('🎯 InstantOrderIdUpdater: Listening for new orders (REAL-TIME)');
            console.log('📡 Trigger ativo: Toda nova ordem será processada IMEDIATAMENTE');

        } catch (error) {
            console.error('❌ Error starting listener:', error);
            throw error;
        }
    }

    /**
     * Para a escuta
     */
    async stopListening() {
        if (!this.isListening) {
            console.log('⚠️ InstantOrderIdUpdater not listening');
            return;
        }

        try {
            await this.pgClient.query('UNLISTEN new_order_inserted');
            this.isListening = false;
            console.log('🛑 InstantOrderIdUpdater stopped listening');
        } catch (error) {
            console.error('❌ Error stopping listener:', error);
        }
    }

    /**
     * Processa notificação de nova ordem IMEDIATAMENTE
     */
    async handleNewOrderNotification(payload) {
        try {
            const orderData = JSON.parse(payload);
            console.log(`🚨 NOVA ORDEM DETECTADA IMEDIATAMENTE! ID: ${orderData.order_id.substring(0, 8)}...`);
            console.log(`📋 Tipo: ${orderData.order_type}, TxHash: ${orderData.transaction_hash}`);

            // Processar ordem imediatamente
            await this.updateOrderIdImmediately(orderData);

        } catch (error) {
            console.error('❌ Error handling new order notification:', error);
        }
    }

    /**
     * Atualiza o blockchain_order_id IMEDIATAMENTE
     */
    async updateOrderIdImmediately(orderData) {
        try {
            console.log(`⚡ Processando ordem ${orderData.order_id.substring(0, 8)}... IMEDIATAMENTE`);

            // Buscar receipt da transação
            const receipt = await this.provider.getTransactionReceipt(orderData.transaction_hash);

            if (!receipt) {
                console.log(`⚠️ Receipt ainda não disponível para ${orderData.transaction_hash}`);
                // Se não há receipt ainda, vamos tentar novamente em 2 segundos
                setTimeout(() => {
                    this.updateOrderIdImmediately(orderData);
                }, 2000);
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
                        console.log(`✅ Evento ${parsedLog.name} encontrado! OrderId: ${blockchainOrderId}`);
                        break;
                    }
                } catch (e) {
                    // Log pode não ser do nosso contrato, continua
                    continue;
                }
            }

            if (blockchainOrderId) {
                // Atualizar no banco IMEDIATAMENTE
                await this.prisma.exchangeOrder.update({
                    where: { id: orderData.order_id },
                    data: {
                        blockchainOrderId: BigInt(blockchainOrderId),
                        blockNumber: receipt.blockNumber ? BigInt(receipt.blockNumber) : null,
                        updatedAt: new Date()
                    }
                });

                console.log(`🎉 SUCESSO! Ordem ${orderData.order_id.substring(0, 8)}... atualizada IMEDIATAMENTE`);
                console.log(`📊 blockchain_order_id: 0 → ${blockchainOrderId}`);
                console.log(`⚡ Tempo de resposta: INSTANTÂNEO (trigger-based)`);

                // Disparar WebSocket broadcast para atualizar OrderBook imediatamente
                try {
                    const rabbitmq = require('../config/rabbitmq');
                    const CONTRACT_ADDRESS = process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';

                    // Broadcast orderbook update using the correct method
                    await rabbitmq.publishWebSocketBroadcast('orderbook_update', {
                        contractAddress: CONTRACT_ADDRESS
                    });
                    console.log('📤 Orderbook broadcast enviado para RabbitMQ via publishWebSocketBroadcast');

                    // Broadcast user orders update using the correct method
                    await rabbitmq.publishWebSocketBroadcast('user_orders_update', {
                        userAddress: orderData.user_address,
                        contractAddress: CONTRACT_ADDRESS
                    });

                    console.log('📡 WebSocket broadcast enviado para atualização do OrderBook');
                } catch (broadcastError) {
                    console.error('❌ Erro ao enviar WebSocket broadcast:', broadcastError.message);
                }

                // Log de sucesso mais visível
                console.log('='.repeat(60));
                console.log(`🚀 ORDEM ${orderData.order_type} #${blockchainOrderId} PRONTA PARA MATCHING!`);
                console.log('='.repeat(60));

            } else {
                console.log(`❌ Nenhum evento de criação encontrado em ${orderData.transaction_hash}`);

                // Tentar novamente em 5 segundos caso o evento ainda não esteja disponível
                setTimeout(() => {
                    console.log(`🔄 Tentativa novamente para ordem ${orderData.order_id.substring(0, 8)}...`);
                    this.updateOrderIdImmediately(orderData);
                }, 5000);
            }

        } catch (error) {
            console.error(`❌ Erro processando ordem ${orderData.order_id}:`, error.message);

            // Tentar novamente em caso de erro
            setTimeout(() => {
                console.log(`🔄 Retry após erro para ordem ${orderData.order_id.substring(0, 8)}...`);
                this.updateOrderIdImmediately(orderData);
            }, 3000);
        }
    }

    /**
     * Testa o sistema de notificação
     */
    async testNotificationSystem() {
        try {
            console.log('🧪 Testando sistema de notificação...');

            // Simular notificação manual
            await this.pgClient.query(`
                SELECT pg_notify('new_order_inserted',
                    '{"order_id": "test-123", "transaction_hash": "0x123", "order_type": "TEST", "user_address": "0xtest"}'
                )
            `);

            console.log('✅ Notificação de teste enviada');
        } catch (error) {
            console.error('❌ Erro no teste:', error);
        }
    }

    /**
     * Cleanup
     */
    async destroy() {
        try {
            if (this.isListening) {
                await this.stopListening();
            }
            if (this.pgClient) {
                await this.pgClient.end();
            }
            console.log('✅ InstantOrderIdUpdater destroyed');
        } catch (error) {
            console.error('❌ Error destroying InstantOrderIdUpdater:', error);
        }
    }
}

module.exports = InstantOrderIdUpdater;
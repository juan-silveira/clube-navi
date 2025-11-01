const prismaConfig = require('../config/prisma');

class OrderIdManager {
    constructor() {
        this.prisma = null;
    }

    async initialize() {
        this.prisma = prismaConfig.getPrisma();
        if (!this.prisma) {
            throw new Error('Prisma not initialized');
        }
        console.log('✅ OrderIdManager initialized');
    }

    /**
     * Obtém o próximo ID de ordem de forma atômica
     * Evita conflitos quando múltiplas ordens são criadas simultaneamente
     */
    async getNextOrderId(contractAddress, orderType) {
        try {
            if (!this.prisma) {
                throw new Error('OrderIdManager not initialized');
            }

            // Usar função SQL para obter e incrementar atomicamente
            const result = await this.prisma.$queryRaw`
                SELECT get_next_order_id(${contractAddress}, ${orderType.toUpperCase()}) as next_id
            `;

            const nextId = result[0]?.next_id;

            if (nextId === null || nextId === undefined) {
                throw new Error(`Failed to get next ${orderType} order ID for contract ${contractAddress}`);
            }

            console.log(`📊 Next ${orderType} order ID for ${contractAddress}: ${nextId}`);
            return parseInt(nextId);

        } catch (error) {
            console.error('❌ Error getting next order ID:', error);
            throw error;
        }
    }

    /**
     * Sincroniza os contadores com os IDs reais da blockchain
     * Deve ser chamado após processamento de transações
     */
    async syncCountersWithBlockchain(contractAddress) {
        try {
            console.log('🔄 Syncing order counters with blockchain...');

            // Buscar o maior ID de cada tipo
            const [maxBuyResult, maxSellResult] = await Promise.all([
                this.prisma.exchangeOrder.aggregate({
                    where: {
                        exchangeContractAddress: contractAddress,
                        orderType: 'BUY',
                        blockchainOrderId: { gt: 0 }
                    },
                    _max: { blockchainOrderId: true }
                }),
                this.prisma.exchangeOrder.aggregate({
                    where: {
                        exchangeContractAddress: contractAddress,
                        orderType: 'SELL',
                        blockchainOrderId: { gt: 0 }
                    },
                    _max: { blockchainOrderId: true }
                })
            ]);

            const maxBuyId = maxBuyResult._max.blockchainOrderId || 0;
            const maxSellId = maxSellResult._max.blockchainOrderId || 0;

            // Atualizar contadores
            await this.prisma.$executeRaw`
                UPDATE exchange_order_counters
                SET
                    next_buy_order_id = ${maxBuyId + 1},
                    next_sell_order_id = ${maxSellId + 1},
                    updated_at = CURRENT_TIMESTAMP
                WHERE exchange_contract_address = ${contractAddress}
            `;

            console.log(`✅ Counters synced: next_buy=${maxBuyId + 1}, next_sell=${maxSellId + 1}`);

            return {
                nextBuyId: maxBuyId + 1,
                nextSellId: maxSellId + 1
            };

        } catch (error) {
            console.error('❌ Error syncing counters:', error);
            throw error;
        }
    }

    /**
     * Inicializa contadores para um novo contrato
     */
    async initializeContract(contractAddress) {
        try {
            await this.prisma.$executeRaw`
                INSERT INTO exchange_order_counters (exchange_contract_address, next_buy_order_id, next_sell_order_id)
                VALUES (${contractAddress}, 1, 1)
                ON CONFLICT (exchange_contract_address) DO NOTHING
            `;

            console.log(`✅ Initialized counters for contract ${contractAddress}`);
        } catch (error) {
            console.error('❌ Error initializing contract counters:', error);
            throw error;
        }
    }

    /**
     * Obtém status atual dos contadores
     */
    async getCounterStatus(contractAddress) {
        try {
            const counter = await this.prisma.$queryRaw`
                SELECT next_buy_order_id, next_sell_order_id, updated_at
                FROM exchange_order_counters
                WHERE exchange_contract_address = ${contractAddress}
            `;

            return counter[0] || null;
        } catch (error) {
            console.error('❌ Error getting counter status:', error);
            throw error;
        }
    }
}

module.exports = OrderIdManager;
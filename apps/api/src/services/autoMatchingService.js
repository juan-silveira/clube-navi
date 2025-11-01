const { ethers } = require('ethers');
const EventEmitter = require('events');
const Redis = require('ioredis');

class AutoMatchingService extends EventEmitter {
    constructor(exchangeService, prisma) {
        super();
        this.exchangeService = exchangeService;
        this.prisma = prisma;
        this.isRunning = false;
        this.intervalId = null;
        this.exchangeContracts = []; // Lista de contratos de exchange
        this.CONTRACT_ADDRESS = '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9'; // Mantido para compatibilidade
        this.isProcessing = false;
        this.redis = new Redis({
            host: 'localhost',
            port: 6379,
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            maxRetriesPerRequest: 1,
        });
        this.LOCK_KEY = 'auto_matching_lock';
        this.LOCK_TTL = 10; // 10 segundos
    }

    /**
     * Carregar contratos de exchange do banco de dados
     */
    async loadExchangeContracts() {
        try {
            const contracts = await this.prisma.smartContract.findMany({
                where: {
                    contractTypeId: 'b96cbbfd-38b9-4224-8eb6-467fb612190b', // Exchange contract type
                    isActive: true
                }
            });

            this.exchangeContracts = contracts.map(c => c.address);
            console.log(`✅ AutoMatchingService loaded ${this.exchangeContracts.length} exchange contracts`);
            this.exchangeContracts.forEach(address => {
                const contract = contracts.find(c => c.address === address);
                const metadata = contract?.metadata || {};
                console.log(`  - ${address} (${metadata.pair || 'Unknown pair'})`);
            });
        } catch (error) {
            console.error('❌ Error loading exchange contracts:', error);
            // Fallback para o contrato original se houver erro
            this.exchangeContracts = [this.CONTRACT_ADDRESS];
        }
    }

    /**
     * Iniciar o job de matching automático
     */
    async start() {
        if (this.isRunning) {
            return;
        }

        // Carregar contratos antes de iniciar
        await this.loadExchangeContracts();

        this.isRunning = true;

        // Executar a cada 1 segundo
        this.intervalId = setInterval(() => {
            this.executeMatchingCycle();
        }, 1000);
    }

    /**
     * Parar o job de matching automático
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Adquirir lock distribuído para evitar múltiplas execuções
     */
    async acquireLock() {
        try {
            const result = await this.redis.set(
                this.LOCK_KEY,
                process.pid,
                'EX',
                this.LOCK_TTL,
                'NX'
            );
            return result === 'OK';
        } catch (error) {
            return false;
        }
    }

    /**
     * Liberar lock distribuído
     */
    async releaseLock() {
        try {
            const script = `
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            `;
            await this.redis.eval(script, 1, this.LOCK_KEY, process.pid);
        } catch (error) {
            // Silent error handling
        }
    }

    /**
     * Ciclo principal de matching
     */
    async executeMatchingCycle() {
        if (this.isProcessing) {
            // Pular este ciclo se ainda estiver processando o anterior
            return;
        }

        // Tentar adquirir lock distribuído
        const lockAcquired = await this.acquireLock();
        if (!lockAcquired) {
            // Outro processo está executando o matching, pular
            return;
        }

        try {
            this.isProcessing = true;
            await this.detectAndExecuteMatches();
        } catch (error) {
            console.log('❌ Error in matching cycle:', error.message);
        } finally {
            this.isProcessing = false;
            await this.releaseLock();
        }
    }

    /**
     * Detectar e executar matches automaticamente - Abordagem robusta
     */
    async detectAndExecuteMatches() {
        try {
            // console.log('🔄 Starting systematic exchange contract scan...');

            // 1. Buscar TODOS os contratos de exchange ativos do banco de dados
            const exchangeContracts = await this.prisma.smartContract.findMany({
                where: {
                    contractTypeId: 'b96cbbfd-38b9-4224-8eb6-467fb612190b', // Exchange contract type
                    isActive: true
                },
                select: {
                    address: true,
                    name: true,
                    metadata: true
                }
            });

            if (!exchangeContracts.length) {
                // console.log('⚠️ No exchange contracts found in database');
                return;
            }

            // console.log(`📋 Found ${exchangeContracts.length} exchange contracts to process`);

            // 2. Para cada contrato de exchange, verificar se há ordens para match
            for (const contract of exchangeContracts) {
                await this.processContractForMatches(contract);
            }

            // console.log('✅ Completed systematic scan of all exchange contracts');

        } catch (error) {
            console.error('❌ Error in detectAndExecuteMatches:', error);
        }
    }

    /**
     * Processar um contrato específico para matches
     */
    async processContractForMatches(contract) {
        try {
            const contractAddress = contract.address;
            const contractName = contract.name;
            const metadata = contract.metadata || {};
            const pair = metadata.pair || 'Unknown';

            // console.log(`🔍 Processing contract: ${contractName} (${pair}) - ${contractAddress.substring(0,8)}...`);

            // 1. Buscar ordens ativas APENAS deste contrato específico
            // Excluir ordens com status PROCESSING para evitar re-matching durante processamento blockchain
            // Excluir ordens MARKET - apenas LIMIT orders podem ser matched
            const orders = await this.prisma.exchangeOrder.findMany({
                where: {
                    exchangeContractAddress: contractAddress,
                    orderSide: 'LIMIT', // Apenas LIMIT orders - excluir MARKET orders
                    status: {
                        in: ['ACTIVE', 'OPEN'] // Apenas ordens verdadeiramente ativas
                    },
                    remainingAmount: { gt: '0' },
                    blockchainOrderId: { gt: BigInt(0) }
                },
                orderBy: { createdAt: 'asc' }
            });

            if (!orders.length) {
                // console.log(`  ℹ️ No active orders for contract ${contractAddress.substring(0,8)}...`);
                return;
            }

            // 2. Separar em compras e vendas
            const bids = orders.filter(order => order.orderType === 'BUY');
            const asks = orders.filter(order => order.orderType === 'SELL');

            // Só logar se há ordens suficientes para matching
            if (!bids.length || !asks.length) {
                return; // Sem log para contratos sem ordens suficientes
            }

            // console.log(`  📊 Contract ${contractAddress.substring(0,8)}... has ${bids.length} buy orders, ${asks.length} sell orders`);

            // 3. Encontrar todas as oportunidades de match possíveis
            const sortedBids = this.sortOrdersByFIFO(bids, 'BUY');
            const sortedAsks = this.sortOrdersByFIFO(asks, 'SELL');

            if (!sortedBids.length || !sortedAsks.length) {
                return;
            }

            // 4. Coletar todos os matches possíveis usando algoritmo de matching otimizado
            const matchGroups = this.findAllPossibleMatches(sortedBids, sortedAsks);

            if (matchGroups.length === 0) {
                // console.log(`  📈 Contract ${contractAddress.substring(0,8)}... no valid matches found`);
                return;
            }

            // 5. Enviar cada grupo de match para a fila RabbitMQ
            console.log(`  🎯 FOUND ${matchGroups.length} MATCH GROUPS for contract ${contractAddress.substring(0,8)}...!`);

            for (const matchGroup of matchGroups) {
                await this.sendMatchGroupToQueue(contractAddress, matchGroup, pair);
            }

        } catch (error) {
            console.error(`❌ Error processing contract ${contract.address.substring(0,8)}...:`, error.message);
        }
    }

    /**
     * Encontrar todos os matches possíveis entre bids e asks (1:N matching)
     * Uma ordem grande consome múltiplas ordens menores
     */
    findAllPossibleMatches(sortedBids, sortedAsks) {

        // Criar cópias das ordens para não modificar as originais
        const availableBids = sortedBids.map(order => ({
            ...order,
            availableAmount: parseFloat(order.remainingAmount)
        }));

        const availableAsks = sortedAsks.map(order => ({
            ...order,
            availableAmount: parseFloat(order.remainingAmount)
        }));

        // console.log(`  🔍 Starting 1:N match analysis (FIFO - First In, First Out):`);
        // console.log(`    Available bids: ${availableBids.length}, Available asks: ${availableAsks.length}`);

        // Processar ordens EM ORDEM (FIFO) - já vêm ordenadas por melhor preço
        // Para vendas: menor preço primeiro (1.00, 1.01, 1.02...)
        // Para compras: maior preço primeiro (1.02, 1.01, 1.00...)
        // IMPORTANTE: Retornar o PRIMEIRO match válido encontrado (não o de "maior valor")

        // Processar ordens de venda (menor preço primeiro)
        for (let askIndex = 0; askIndex < availableAsks.length; askIndex++) {
            const currentAsk = availableAsks[askIndex];

            if (currentAsk.availableAmount <= 0) continue;

            const matchingBids = [];
            let remainingAskAmount = currentAsk.availableAmount;

            // Tentar match com ordens de compra compatíveis (maior preço primeiro)
            for (let bidIndex = 0; bidIndex < availableBids.length && remainingAskAmount > 0; bidIndex++) {
                const currentBid = availableBids[bidIndex];

                if (currentBid.availableAmount <= 0) continue;

                // Verificar compatibilidade de preço
                const bidPrice = parseFloat(currentBid.price);
                const askPrice = parseFloat(currentAsk.price);

                if (bidPrice < askPrice) continue; // Bid muito baixo

                // Verificar se não são do mesmo usuário
                if (currentBid.userAddress.toLowerCase() === currentAsk.userAddress.toLowerCase()) {
                    continue;
                }

                // Calcular quanto desta bid podemos consumir
                const matchAmount = Math.min(remainingAskAmount, currentBid.availableAmount);

                matchingBids.push({
                    ...currentBid,
                    matchAmount: matchAmount
                });

                remainingAskAmount -= matchAmount;
            }

            // Se encontramos bids compatíveis, RETORNAR IMEDIATAMENTE (FIFO)
            // Não continuar procurando por "melhores" matches
            if (matchingBids.length > 0) {
                const totalMatchedAmount = currentAsk.availableAmount - remainingAskAmount;

                console.log(`    ✅ FIFO Match: Ask #${currentAsk.blockchainOrderId} @ ${currentAsk.price} (${totalMatchedAmount}) vs ${matchingBids.length} buy orders`);

                // Retornar o PRIMEIRO match válido encontrado (FIFO)
                return [{
                    buyOrders: matchingBids,
                    sellOrders: [{
                        ...currentAsk,
                        matchAmount: totalMatchedAmount
                    }],
                    totalAmount: totalMatchedAmount,
                    executionPrice: currentAsk.price
                }];
            }
        }

        // Processar ordens de compra (maior preço primeiro)
        for (let bidIndex = 0; bidIndex < availableBids.length; bidIndex++) {
            const currentBid = availableBids[bidIndex];

            if (currentBid.availableAmount <= 0) continue;

            const matchingAsks = [];
            let remainingBidAmount = currentBid.availableAmount;

            // Tentar match com ordens de venda compatíveis
            for (let askIndex = 0; askIndex < availableAsks.length && remainingBidAmount > 0; askIndex++) {
                const currentAsk = availableAsks[askIndex];

                if (currentAsk.availableAmount <= 0) continue;

                // Verificar compatibilidade de preço
                const bidPrice = parseFloat(currentBid.price);
                const askPrice = parseFloat(currentAsk.price);

                if (bidPrice < askPrice) continue; // Bid muito baixo

                // Verificar se não são do mesmo usuário
                if (currentBid.userAddress.toLowerCase() === currentAsk.userAddress.toLowerCase()) {
                    continue;
                }

                // Calcular quanto desta ask podemos consumir
                const matchAmount = Math.min(remainingBidAmount, currentAsk.availableAmount);

                matchingAsks.push({
                    ...currentAsk,
                    matchAmount: matchAmount
                });

                remainingBidAmount -= matchAmount;
            }

            // Se encontramos asks compatíveis, RETORNAR IMEDIATAMENTE (FIFO)
            if (matchingAsks.length > 0) {
                const totalMatchedAmount = currentBid.availableAmount - remainingBidAmount;

                console.log(`    ✅ FIFO Match: Bid #${currentBid.blockchainOrderId} @ ${currentBid.price} (${totalMatchedAmount}) vs ${matchingAsks.length} sell orders`);

                // Retornar o PRIMEIRO match válido encontrado (FIFO)
                return [{
                    buyOrders: [{
                        ...currentBid,
                        matchAmount: totalMatchedAmount
                    }],
                    sellOrders: matchingAsks.map(ask => ({ ...ask })),
                    totalAmount: totalMatchedAmount,
                    executionPrice: matchingAsks[0].price
                }];
            }
        }

        // Nenhum match encontrado - log silencioso
        // console.log(`    ℹ️ No valid matches found`);
        return [];
    }

    /**
     * Enviar grupo de match para fila RabbitMQ
     */
    async sendMatchGroupToQueue(contractAddress, matchGroup, pair) {
        try {
            // 🔒 CRITICAL: Marcar ordens como PROCESSING ANTES de enviar para fila
            // Isso previne que o próximo ciclo do AutoMatchingService (1s depois)
            // selecione as mesmas ordens novamente, causando duplicação
            const allOrderIds = [
                ...matchGroup.buyOrders.map(o => o.id),
                ...matchGroup.sellOrders.map(o => o.id)
            ];

            await this.prisma.exchangeOrder.updateMany({
                where: {
                    id: { in: allOrderIds }
                },
                data: {
                    status: 'PROCESSING',
                    updatedAt: new Date()
                }
            });

            console.log(`  🔒 Marked ${allOrderIds.length} orders as PROCESSING to prevent duplicate matching`);

            const matchData = {
                type: 'MATCH_EXECUTION',
                contractAddress,
                pair,
                matchGroup: {
                    buyOrders: matchGroup.buyOrders.map(order => ({
                        id: order.blockchainOrderId.toString(),
                        userAddress: order.userAddress,
                        price: order.price,
                        remainingAmount: order.remainingAmount,
                        matchAmount: order.matchAmount.toString()
                    })),
                    sellOrders: matchGroup.sellOrders.map(order => ({
                        id: order.blockchainOrderId.toString(),
                        userAddress: order.userAddress,
                        price: order.price,
                        remainingAmount: order.remainingAmount,
                        matchAmount: order.matchAmount.toString()
                    })),
                    totalAmount: matchGroup.totalAmount.toString(),
                    executionPrice: matchGroup.executionPrice.toString()
                },
                timestamp: new Date().toISOString()
            };

            // Enviar para fila RabbitMQ de execução de matches
            const rabbitMQ = require('../config/rabbitmq');
            await rabbitMQ.publishMatchExecution(contractAddress, matchData);

            const buyOrderIds = matchGroup.buyOrders.map(o => o.blockchainOrderId).join(',');
            const sellOrderIds = matchGroup.sellOrders.map(o => o.blockchainOrderId).join(',');

            console.log(`  ✅ Match group sent to queue for contract ${contractAddress.substring(0,8)}... (${pair})`);
            console.log(`    Buy Orders: [${buyOrderIds}], Sell Orders: [${sellOrderIds}], Amount: ${matchGroup.totalAmount}`);

        } catch (error) {
            console.error(`❌ Error sending match group to queue:`, error.message);
        }
    }

    /**
     * @deprecated - Usar sendMatchGroupToQueue ao invés
     * Enviar match para fila RabbitMQ (versão antiga - 1:1)
     */
    async sendMatchToQueue(contractAddress, buyOrder, sellOrder, pair) {
        try {
            const matchData = {
                contractAddress,
                pair,
                buyOrder: {
                    id: buyOrder.blockchainOrderId.toString(),
                    userAddress: buyOrder.userAddress,
                    price: buyOrder.price,
                    amount: buyOrder.remainingAmount
                },
                sellOrder: {
                    id: sellOrder.blockchainOrderId.toString(),
                    userAddress: sellOrder.userAddress,
                    price: sellOrder.price,
                    amount: sellOrder.remainingAmount
                },
                timestamp: new Date().toISOString()
            };

            // Enviar para fila RabbitMQ de execução de matches
            const rabbitMQ = require('../config/rabbitmq');
            await rabbitMQ.publishMatchExecution(contractAddress, matchData);

            console.log(`  ✅ Match sent to queue for contract ${contractAddress.substring(0,8)}... (${pair})`);

        } catch (error) {
            console.error(`❌ Error sending match to queue:`, error.message);
        }
    }



    /**
     * Organizar ordens por FIFO (First In, First Out)
     */
    sortOrdersByFIFO(orders, orderType) {
        return orders.sort((a, b) => {
            const priceA = parseFloat(a.price);
            const priceB = parseFloat(b.price);

            if (orderType === 'BUY') {
                // Para compras: maior preço primeiro, depois mais antigo
                if (priceB !== priceA) return priceB - priceA;
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else {
                // Para vendas: menor preço primeiro, depois mais antigo
                if (priceA !== priceB) return priceA - priceB;
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });
    }

    /**
     * Validar se o contrato está disponível antes de fazer chamadas blockchain
     */
    async validateContractAvailability() {
        try {
            // Setup blockchain connection
            const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
            const RPC_URL = defaultNetwork === 'mainnet'
                ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
                : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';
            const provider = new ethers.JsonRpcProvider(RPC_URL);

            // Load contract ABI
            const fs = require('fs');
            const path = require('path');
            const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_exchange_abi.json');

            if (!fs.existsSync(abiPath)) {
                console.log('⚠️ Contract ABI file not found');
                return false;
            }

            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

            // Validar que o contrato foi fornecido
            if (!contractAddress) {
                console.error('No contract address provided for validation');
                return false;
            }

            // Setup contract
            const contract = new ethers.Contract(contractAddress, exchangeABI, provider);

            // Tentar uma chamada simples para verificar se o contrato está disponível
            // Testar com uma função que sabemos que existe no contrato de exchange
            await contract.getAddress();

            console.log('✅ Contract is available and accessible');
            return true;

        } catch (error) {
            console.log(`⚠️ Contract validation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Validar ordens na blockchain por IDs
     */
    async validateOrdersOnBlockchain(orderIds) {
        const validOrderIds = [];

        try {
            // Setup blockchain connection
            const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
            const RPC_URL = defaultNetwork === 'mainnet'
                ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
                : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';
            const provider = new ethers.JsonRpcProvider(RPC_URL);

            // Load contract ABI
            const fs = require('fs');
            const path = require('path');
            const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_exchange_abi.json');

            if (!fs.existsSync(abiPath)) {
                console.log('⚠️ Contract ABI file not found for validation');
                return validOrderIds;
            }

            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

            // Setup contract
            const contract = new ethers.Contract(this.CONTRACT_ADDRESS, exchangeABI, provider);

            for (const orderId of orderIds) {
                try {
                    // Tentar buscar a ordem em ambas as estruturas (buy e sell)
                    let blockchainOrder = null;
                    let orderType = null;

                    try {
                        blockchainOrder = await contract.buyOrders(orderId);
                        orderType = 'BUY';
                    } catch {
                        try {
                            blockchainOrder = await contract.sellOrders(orderId);
                            orderType = 'SELL';
                        } catch {
                            console.log(`⚠️ Order ${orderId} not found in blockchain`);
                            continue;
                        }
                    }

                    // Verificar se a ordem está ativa e tem quantidade restante
                    if (blockchainOrder && blockchainOrder.isActive && blockchainOrder.remainingAmount > 0) {
                        validOrderIds.push(orderId);
                        console.log(`✅ Order ${orderId} (${orderType}) is valid on blockchain`);
                    } else {
                        console.log(`⚠️ Order ${orderId} is not active or has no remaining amount`);
                    }

                } catch (error) {
                    console.log(`⚠️ Error validating order ${orderId}: ${error.message}`);
                }
            }

        } catch (error) {
            console.error('❌ Error in blockchain validation:', error.message);
        }

        return validOrderIds;
    }

    /**
     * Verificar saldos suficientes
     */
    async checkSufficientBalances() {
        // TODO: Implementar verificação de saldos via API
        // Por enquanto retornar true, mas seria ideal verificar:
        // - Se o comprador tem cBRL suficiente
        // - Se o vendedor tem PCN suficiente
        return true;
    }

    /**
     * Buscar chave privada do admin do contrato
     */
    async getContractAdminPrivateKey() {
        try {
            // Primeiro, tentar buscar o admin do contrato na tabela users
            const adminUser = await this.prisma.user.findFirst({
                where: {
                    blockchainAddress: {
                        equals: '0x5528C065931f523CA9F3a6e49a911896fb1D2e6f', // Admin wallet conhecido
                        mode: 'insensitive'
                    }
                },
                select: {
                    privateKey: true,
                    blockchainAddress: true
                }
            });

            if (adminUser && adminUser.privateKey) {
                return adminUser.privateKey;
            }

            // Fallback: usar variável de ambiente
            const fallbackKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
            if (fallbackKey) {
                return fallbackKey;
            }

            throw new Error('Admin private key not found in database or environment');
        } catch (error) {
            throw new Error(`Failed to get admin private key: ${error.message}`);
        }
    }

    /**
     * Executar matching na blockchain com retry logic
     */
    async executeMatchingWithRetry(buyOrderIds, sellOrderIds, maxRetries = 1) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`🔄 Matching attempt ${attempt}/${maxRetries}`);

            const result = await this.executeMatching(buyOrderIds, sellOrderIds);

            if (result.success) {
                return result;
            }

            console.log(`❌ Attempt ${attempt} failed: ${result.error}`);

            // Se falhou, fazer validação mais detalhada antes de tentar novamente
            if (attempt < maxRetries) {
                console.log('🔍 Performing detailed validation before retry...');

                const contractValid = await this.validateContractAvailability();
                if (!contractValid) {
                    console.log('⚠️ Contract validation failed, aborting retry');
                    return { success: false, error: 'Contract not available' };
                }

                const ordersValid = await this.validateOrdersOnBlockchain([...buyOrderIds, ...sellOrderIds]);
                if (ordersValid.length === 0) {
                    console.log('⚠️ No valid orders found on blockchain, aborting retry');
                    return { success: false, error: 'Orders not valid on blockchain' };
                }

                console.log(`⏱️ Waiting 2 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return { success: false, error: 'Max retries exceeded' };
    }

    /**
     * Executar matching na blockchain
     */
    async executeMatching(buyOrderIds, sellOrderIds) {
        try {
            // Validações prévias
            if (!buyOrderIds.length || !sellOrderIds.length) {
                throw new Error('Empty order arrays provided');
            }

            // Setup blockchain connection
            const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
            const RPC_URL = defaultNetwork === 'mainnet'
                ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
                : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';
            const provider = new ethers.JsonRpcProvider(RPC_URL);

            // Load contract ABI
            const fs = require('fs');
            const path = require('path');
            const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_exchange_abi.json');

            if (!fs.existsSync(abiPath)) {
                throw new Error('Contract ABI file not found');
            }

            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

            // Buscar chave privada do admin do contrato
            const adminPrivateKey = await this.getContractAdminPrivateKey();
            if (!adminPrivateKey) {
                throw new Error('Admin private key not available');
            }

            const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
            const contract = new ethers.Contract(this.CONTRACT_ADDRESS, exchangeABI, adminWallet);

            // Verificar se a função existe no contrato
            if (typeof contract.matchOrders !== 'function') {
                throw new Error('matchOrders function not found in contract');
            }

            console.log(`📋 Executing matchOrders with buyOrders: [${buyOrderIds}], sellOrders: [${sellOrderIds}]`);

            // Execute matching
            const tx = await contract.matchOrders(buyOrderIds, sellOrderIds);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error('💥 Blockchain execution error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🚫 MÉTODO DESABILITADO - Atualização de ordens após match
     *
     * Este método foi desabilitado para evitar conflitos com o novo MatchExecutorService.
     * Agora o MatchExecutorService é responsável por atualizar as ordens após matches
     * blockchain com transaction hash válido.
     */
    async updateOrderStatusAfterMatch(buyOrder, sellOrder, matchResult) {
        console.log(`🚫 [AutoMatching] updateOrderStatusAfterMatch DISABLED - MatchExecutorService will handle order updates`);
        console.log(`   ℹ️ Orders ${buyOrder.blockchainOrderId} and ${sellOrder.blockchainOrderId} will be updated by MatchExecutorService`);
        console.log(`   ℹ️ Transaction hash: ${matchResult.transactionHash}`);

        // Método desabilitado para evitar conflitos entre AutoMatchingService e MatchExecutorService
        return;
    }
}

module.exports = AutoMatchingService;
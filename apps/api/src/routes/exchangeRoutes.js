const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();
const ExchangeService = require('../services/exchangeService');
const MatchingEngine = require('../services/matchingEngine');
const { normalizeAddress } = require('../utils/address');

// Instâncias dos serviços (inicializar no app principal)
let exchangeService;
let matchingEngine;
let orderManagementService;
let marketOrderService;
let redisService;

// Middleware para verificar inicialização
const checkInitialized = (req, res, next) => {
    if (!exchangeService || !matchingEngine) {
        return res.status(503).json({ error: 'Exchange service not initialized' });
    }
    next();
};

// Adicionar imports dos novos serviços
const OrderManagementService = require('../services/orderManagement.service');
const MarketOrderService = require('../services/MarketOrderService');
const redisServiceImport = require('../services/redis.service');

// Inicializar serviços
router.initializeServices = async (contractAddress, contractABI, providerUrl, signer) => {
    exchangeService = new ExchangeService();
    await exchangeService.initialize(contractAddress, contractABI, providerUrl);

    // Inicializar Redis
    redisService = redisServiceImport;
    await redisService.initialize();

    // Inicializar OrderManagementService
    orderManagementService = new OrderManagementService();
    await orderManagementService.initialize(providerUrl, signer.privateKey);

    // Inicializar MarketOrderService
    marketOrderService = new MarketOrderService();
    await marketOrderService.initialize(providerUrl, signer.privateKey);

    // Buscar TODOS os contratos de exchange do banco de dados
    const { PrismaClient } = require('../generated/prisma');
    const prisma = global.prisma || new PrismaClient();

    try {
        const exchangeContracts = await prisma.smartContract.findMany({
            where: {
                contractTypeId: 'b96cbbfd-38b9-4224-8eb6-467fb612190b', // Exchange contract type
                isActive: true
            }
        });

        console.log(`📋 Loading ${exchangeContracts.length} exchange contracts for OrderManagementService`);

        // Adicionar TODOS os contratos de exchange encontrados
        for (const contract of exchangeContracts) {
            const metadata = contract.metadata || {};
            console.log(`  - Adding ${contract.name}: ${metadata.tokenA?.symbol || 'N/A'}/${metadata.tokenB?.symbol || 'N/A'} at ${contract.address}`);
            orderManagementService.addExchangeContract(contract.address, contractABI);
        }
    } catch (error) {
        console.error('❌ Error loading exchange contracts from database:', error);
        // Fallback: adicionar apenas o contrato principal se houver erro
        orderManagementService.addExchangeContract(contractAddress, contractABI);
    }

    // Criar MatchingEngine com os novos serviços
    const MatchingEngineClass = require('../services/matchingEngine');
    matchingEngine = new MatchingEngineClass(orderManagementService, redisService);

    console.log('✅ All exchange services initialized');
    return { exchangeService, matchingEngine, orderManagementService, redisService };
};

// Getter para acessar o orderManagementService globalmente
router.getOrderManagementService = () => {
    return orderManagementService;
};

// WebSocket para atualizações em tempo real
router.setupWebSocket = (io) => {
    if (!exchangeService) return;

    // Escutar eventos do exchange
    exchangeService.on('orderCreated', (data) => {
        io.emit('orderCreated', data);
    });

    exchangeService.on('orderMatched', (data) => {
        io.emit('orderMatched', data);
    });

    exchangeService.on('orderCancelled', (data) => {
        io.emit('orderCancelled', data);
    });

    matchingEngine.on('marketOrderExecuted', (data) => {
        io.emit('marketOrderExecuted', data);
    });
};

// ==================== ROTAS DE CONSULTA ====================

// Obter order book
router.get('/orderbook/:symbol', checkInitialized, async (req, res) => {
    try {
        const { symbol } = req.params;
        const depth = parseInt(req.query.depth) || 20;

        const orderBook = await exchangeService.getOrderBook(symbol, depth);
        res.json(orderBook);
    } catch (error) {
        console.error('Error fetching order book:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter candles/OHLCV
router.get('/candles/:symbol', checkInitialized, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { interval = '15m', limit = 100 } = req.query;

        const candles = await exchangeService.getCandles(symbol, interval, parseInt(limit));
        res.json(candles);
    } catch (error) {
        console.error('Error fetching candles:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/exchange/v3/trades/:contractAddress
 * Get recent trades from database for Negociações Recentes
 * IMPORTANT: This route must come BEFORE /trades/:symbol to avoid conflicts
 */
router.get('/v3/trades/:contractAddress', async (req, res) => {
    try {
        const { contractAddress } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        console.log('🔍 [v3/trades] Searching for trades with contract address:', contractAddress);

        const trades = await global.prisma.exchangeTrade.findMany({
            where: {
                exchangeContractAddress: {
                    equals: contractAddress,
                    mode: 'insensitive'
                }
            },
            orderBy: {
                tradeTimestamp: 'desc'
            },
            take: limit,
            select: {
                id: true,
                price: true,
                amount: true,
                totalValue: true,
                tradeTimestamp: true,
                buyerAddress: true,
                sellerAddress: true,
                tokenASymbol: true,
                tokenBSymbol: true,
                transactionHash: true
            }
        });

        // Format for frontend
        const formattedTrades = trades.map(trade => ({
            id: trade.id,
            price: parseFloat(trade.price),
            amount: parseFloat(trade.amount),
            total: parseFloat(trade.totalValue),
            timestamp: trade.tradeTimestamp,
            type: 'buy', // Can be determined from order comparison
            hash: trade.transactionHash,
            pair: `${trade.tokenASymbol}/${trade.tokenBSymbol}`
        }));

        res.json({
            success: true,
            data: formattedTrades,
            count: formattedTrades.length
        });

    } catch (error) {
        console.error('❌ Error fetching recent trades:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar negociações recentes',
            error: error.message
        });
    }
});

// Obter trades recentes
router.get('/trades/:symbol', checkInitialized, async (req, res) => {
    try {
        const { symbol } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const trades = await exchangeService.getRecentTrades(symbol, limit);
        res.json(trades);
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter estatísticas 24h
router.get('/stats/:symbol', checkInitialized, async (req, res) => {
    try {
        const { symbol } = req.params;

        const stats = await exchangeService.getStats24h(symbol);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter pares de trading disponíveis
router.get('/pairs', checkInitialized, async (req, res) => {
    try {
        const pairs = await exchangeService.prisma.tradingPairs.findMany({
            where: { is_active: true },
            select: {
                id: true,
                symbol: true,
                base_token: true,
                quote_token: true,
                min_order_size: true,
                price_decimals: true
            }
        });

        res.json(pairs);
    } catch (error) {
        console.error('Error fetching pairs:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROTAS DE TRADING ====================

// Obter cotação
router.post('/quote', checkInitialized, async (req, res) => {
    try {
        const { symbol, side, amount } = req.body;

        if (!symbol || !side || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tradingPair = await exchangeService.prisma.tradingPairs.findUnique({
            where: { symbol }
        });

        if (!tradingPair) {
            return res.status(404).json({ error: 'Trading pair not found' });
        }

        const quote = await matchingEngine.getQuote(side, parseFloat(amount), tradingPair);
        res.json(quote);
    } catch (error) {
        console.error('Error getting quote:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar ordem de compra
router.post('/order/buy', checkInitialized, async (req, res) => {
    try {
        const { user_address, symbol, amount, max_price } = req.body;

        if (!user_address || !symbol || !amount || !max_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tradingPair = await exchangeService.prisma.tradingPairs.findUnique({
            where: { symbol }
        });

        if (!tradingPair) {
            return res.status(404).json({ error: 'Trading pair not found' });
        }

        const result = await matchingEngine.processBuyOrder(
            user_address,
            tradingPair,
            parseFloat(amount),
            parseFloat(max_price)
        );

        res.json(result);
    } catch (error) {
        console.error('Error creating buy order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar ordem de venda
router.post('/order/sell', checkInitialized, async (req, res) => {
    try {
        const { user_address, symbol, amount, min_price } = req.body;

        if (!user_address || !symbol || !amount || !min_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tradingPair = await exchangeService.prisma.tradingPairs.findUnique({
            where: { symbol }
        });

        if (!tradingPair) {
            return res.status(404).json({ error: 'Trading pair not found' });
        }

        const result = await matchingEngine.processSellOrder(
            user_address,
            tradingPair,
            parseFloat(amount),
            parseFloat(min_price)
        );

        res.json(result);
    } catch (error) {
        console.error('Error creating sell order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancelar ordem
router.delete('/order/:orderId', checkInitialized, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { user_address } = req.body;

        if (!user_address) {
            return res.status(400).json({ error: 'User address required' });
        }

        const result = await matchingEngine.cancelOrder(parseInt(orderId), user_address);
        res.json(result);
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter ordens do usuário
router.get('/orders/:userAddress', checkInitialized, async (req, res) => {
    try {
        const { userAddress } = req.params;
        const { status = 'all' } = req.query;

        // Normalizar endereço para formato checksum
        const normalizedUserAddress = normalizeAddress(userAddress);

        console.log('🔍 Fetching orders for:', normalizedUserAddress);
        console.log('📊 Query params:', req.query);

        const whereClause = {
            userAddress: normalizedUserAddress,
            orderSide: 'LIMIT' // Apenas ordens LIMIT - excluir MARKET orders
        };

        if (status !== 'all') {
            whereClause.status = status.toUpperCase();
        }

        console.log('🔎 Where clause:', whereClause);

        const orders = await global.prisma.ExchangeOrder.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        console.log(`📋 Found ${orders.length} orders`);
        // console.log('📄 Orders data:', orders);

        res.json(orders.map(order => ({
            id: order.blockchainOrderId,
            pair: `${order.tokenASymbol}/${order.tokenBSymbol}`,
            type: order.orderType.toLowerCase(),
            price: parseFloat(order.price),
            amount: parseFloat(order.amount),
            remaining: parseFloat(order.remainingAmount),
            status: order.status.toLowerCase(),
            created_at: order.createdAt
        })));
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Executar matching automático (pode ser chamado periodicamente)
router.post('/matching/auto/:symbol', checkInitialized, async (req, res) => {
    try {
        const { symbol } = req.params;

        const tradingPair = await exchangeService.prisma.tradingPairs.findUnique({
            where: { symbol }
        });

        if (!tradingPair) {
            return res.status(404).json({ error: 'Trading pair not found' });
        }

        await matchingEngine.runAutomaticMatching(tradingPair.id);
        res.json({ success: true, message: 'Automatic matching executed' });
    } catch (error) {
        console.error('Error in automatic matching:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== NOVAS ROTAS PARA EXCHANGE V2 ====================

// Obter order book usando novo sistema
router.get('/v2/orderbook/:contractAddress', checkInitialized, async (req, res) => {
    try {
        const { contractAddress } = req.params;
        const depth = parseInt(req.query.depth) || 20;

        // Tentar cache primeiro
        let orderBook = await redisService.getCachedOrderBook(contractAddress);

        if (!orderBook) {
            orderBook = await orderManagementService.getOrderBook(contractAddress, depth);
            await redisService.cacheOrderBook(contractAddress, orderBook, 60);
        }

        res.json({
            success: true,
            data: orderBook
        });
    } catch (error) {
        console.error('Error fetching order book v2:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Obter cotação usando novo sistema
router.post('/v2/quote', checkInitialized, async (req, res) => {
    try {
        const { contractAddress, side, amount } = req.body;

        if (!contractAddress || !side || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: contractAddress, side, amount'
            });
        }

        const quote = await matchingEngine.getQuote(side.toUpperCase(), parseFloat(amount), contractAddress);

        res.json({
            success: true,
            data: quote
        });
    } catch (error) {
        console.error('Error getting quote v2:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Criar ordem de compra usando novo sistema
router.post('/v2/buy', checkInitialized, async (req, res) => {
    try {
        const { userAddress, contractAddress, tokenASymbol, tokenBSymbol, amount, maxPrice } = req.body;

        if (!userAddress || !contractAddress || !tokenASymbol || !tokenBSymbol || !amount || !maxPrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Normalizar endereços para formato checksum
        const normalizedUserAddress = normalizeAddress(userAddress);
        const normalizedContractAddress = normalizeAddress(contractAddress);

        const result = await matchingEngine.processBuyOrder(
            normalizedUserAddress,
            normalizedContractAddress,
            tokenASymbol,
            tokenBSymbol,
            parseFloat(amount),
            parseFloat(maxPrice)
        );

        // SIMPLIFIED: No WebSocket needed - frontend uses HTTP polling

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error creating buy order v2:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Criar ordem de venda usando novo sistema
router.post('/v2/sell', checkInitialized, async (req, res) => {
    try {
        const { userAddress, contractAddress, tokenASymbol, tokenBSymbol, amount, minPrice } = req.body;

        if (!userAddress || !contractAddress || !tokenASymbol || !tokenBSymbol || !amount || !minPrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Normalizar endereços para formato checksum
        const normalizedUserAddress = normalizeAddress(userAddress);
        const normalizedContractAddress = normalizeAddress(contractAddress);

        const result = await matchingEngine.processSellOrder(
            normalizedUserAddress,
            normalizedContractAddress,
            tokenASymbol,
            tokenBSymbol,
            parseFloat(amount),
            parseFloat(minPrice)
        );

        // SIMPLIFIED: No WebSocket needed - frontend uses HTTP polling

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error creating sell order v2:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Obter ordens do usuário usando novo sistema
router.get('/v2/orders/:userAddress/:contractAddress', checkInitialized, async (req, res) => {
    try {
        const { userAddress, contractAddress } = req.params;
        const filters = {
            exchangeContractAddress: ethers.getAddress(contractAddress),
            ...req.query
        };

        const orders = await orderManagementService.getUserOrders(userAddress, filters);

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching user orders v2:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Cancelar ordem usando novo sistema
router.delete('/v2/orders/:orderId', checkInitialized, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userAddress, contractAddress } = req.body;

        if (!userAddress || !contractAddress) {
            return res.status(400).json({
                success: false,
                message: 'Missing userAddress or contractAddress'
            });
        }

        const result = await matchingEngine.cancelOrder(
            parseInt(orderId),
            userAddress,
            contractAddress
        );

        // SIMPLIFIED: No WebSocket needed - frontend uses HTTP polling

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error cancelling order v2:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Trades recentes usando novo sistema
router.get('/v2/trades/:contractAddress', checkInitialized, async (req, res) => {
    try {
        const { contractAddress } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        // Tentar cache primeiro
        let trades = await redisService.getCachedRecentTrades(contractAddress);

        if (!trades) {
            trades = await orderManagementService.getRecentTrades(contractAddress, limit);
            await redisService.cacheRecentTrades(contractAddress, trades, 120);
        }

        res.json({
            success: true,
            data: trades
        });
    } catch (error) {
        console.error('Error fetching trades v2:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== MARKET ORDER ROUTES ====================

// Get market buy quote
router.post('/v2/market/buy/quote', checkInitialized, async (req, res) => {
    try {
        const { contractAddress, amount, userAddress, slippage } = req.body;

        if (!contractAddress || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: contractAddress and amount'
            });
        }

        // Validar slippage (0.1% a 50%, default 2%)
        const slippagePercent = slippage ? parseFloat(slippage) : 2;
        if (slippagePercent < 0.1 || slippagePercent > 50) {
            return res.status(400).json({
                success: false,
                message: 'Slippage must be between 0.1% and 50%'
            });
        }

        const quote = await marketOrderService.getMarketBuyQuote(
            contractAddress,
            parseFloat(amount),
            userAddress, // Pass userAddress to exclude user's own orders
            slippagePercent
        );

        res.json({
            success: true,
            data: quote
        });
    } catch (error) {
        console.error('Error getting market buy quote:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get market sell quote
router.post('/v2/market/sell/quote', checkInitialized, async (req, res) => {
    try {
        const { contractAddress, amount, userAddress, slippage } = req.body;

        if (!contractAddress || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: contractAddress and amount'
            });
        }

        // Validar slippage (0.1% a 50%, default 2%)
        const slippagePercent = slippage ? parseFloat(slippage) : 2;
        if (slippagePercent < 0.1 || slippagePercent > 50) {
            return res.status(400).json({
                success: false,
                message: 'Slippage must be between 0.1% and 50%'
            });
        }

        const quote = await marketOrderService.getMarketSellQuote(
            contractAddress,
            parseFloat(amount),
            userAddress, // Pass userAddress to exclude user's own orders
            slippagePercent
        );

        res.json({
            success: true,
            data: quote
        });
    } catch (error) {
        console.error('Error getting market sell quote:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Execute market buy
router.post('/v2/market/buy', checkInitialized, async (req, res) => {
    try {
        const { userAddress, contractAddress, amount, orderIds, minAmountOut } = req.body;

        if (!userAddress || !contractAddress || !amount || !orderIds || !minAmountOut) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const result = await marketOrderService.executeMarketBuy(
            userAddress,
            contractAddress,
            parseFloat(amount),
            orderIds,
            parseFloat(minAmountOut)
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error executing market buy:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Execute market sell
router.post('/v2/market/sell', checkInitialized, async (req, res) => {
    try {
        const { userAddress, contractAddress, amount, orderIds, minAmountOut } = req.body;

        if (!userAddress || !contractAddress || !amount || !orderIds || !minAmountOut) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const result = await marketOrderService.executeMarketSell(
            userAddress,
            contractAddress,
            parseFloat(amount),
            orderIds,
            parseFloat(minAmountOut)
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error executing market sell:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Executar matching automático
router.post('/v2/match/:contractAddress', checkInitialized, async (req, res) => {
    try {
        const { contractAddress } = req.params;

        const result = await matchingEngine.runAutomaticMatching(contractAddress);

        // SIMPLIFIED: No WebSocket needed - frontend uses HTTP polling

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error running automatic matching:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Status dos serviços
router.get('/v2/status', checkInitialized, async (req, res) => {
    try {
        const status = {
            exchangeService: !!exchangeService,
            orderManagement: !!orderManagementService,
            matchingEngine: !!matchingEngine,
            redis: redisService ? redisService.getStats() : null,
            matchingStats: matchingEngine ? matchingEngine.getStats() : null
        };

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Endpoint público para buscar saldos de usuário (específico para Exchange)
router.get('/v2/user/:userAddress/balances', async (req, res) => {
    try {
        const { userAddress } = req.params;

        // Normalizar endereço para formato checksum
        const normalizedUserAddress = normalizeAddress(userAddress);

        // Buscar usuário no banco por endereço público
        const user = await global.prisma.user.findFirst({
            where: {
                OR: [
                    { publicKey: normalizedUserAddress },
                    { blockchainAddress: normalizedUserAddress }
                ],
                isActive: true
            },
            select: {
                id: true,
                balances: true,
                publicKey: true,
                blockchainAddress: true
            }
        });

        if (!user) {
            return res.json({
                success: true,
                data: {},
                message: 'User not found'
            });
        }

        // Retornar saldos salvos no banco
        const balances = user.balances || {};

        res.json({
            success: true,
            data: balances
        });

    } catch (error) {
        console.error('Error fetching user balances for exchange:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== ROTAS ADAPTADORAS PARA COMPATIBILIDADE COM FRONTEND ====================

// Adaptador para create-buy-order
router.post('/create-buy-order', checkInitialized, async (req, res) => {
    try {
        const { symbol, amount, price, walletAddress, contractAddress } = req.body;

        if (!walletAddress || !symbol || !amount || !price) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        console.log('🚀 [create-buy-order] Creating buy order with automatic matching...');
        console.log('📝 Parameters:', { walletAddress, contractAddress, symbol, amount, price });

        // Use default contract address if not provided
        const exchangeContractAddress = contractAddress || process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';

        // Normalizar endereços para formato checksum
        const normalizedUserAddress = normalizeAddress(walletAddress);
        const normalizedContractAddress = normalizeAddress(exchangeContractAddress);

        // Use correct method signature with 6 parameters for automatic matching
        const result = await matchingEngine.processBuyOrder(
            normalizedUserAddress,
            normalizedContractAddress,
            'cBRL', // tokenASymbol (quote token)
            'PCN',  // tokenBSymbol (base token)
            parseFloat(amount),
            parseFloat(price)
        );

        console.log('✅ [create-buy-order] Order created with automatic matching:', result);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('❌ [create-buy-order] Error creating buy order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Adaptador para create-sell-order
router.post('/create-sell-order', checkInitialized, async (req, res) => {
    try {
        const { symbol, amount, price, walletAddress, contractAddress } = req.body;

        if (!walletAddress || !symbol || !amount || !price) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        console.log('🚀 [create-sell-order] Creating sell order with automatic matching...');
        console.log('📝 Parameters:', { walletAddress, contractAddress, symbol, amount, price });

        // Use default contract address if not provided
        const exchangeContractAddress = contractAddress || process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';

        // Normalizar endereços para formato checksum
        const normalizedUserAddress = normalizeAddress(walletAddress);
        const normalizedContractAddress = normalizeAddress(exchangeContractAddress);

        // Use correct method signature with 6 parameters for automatic matching
        const result = await matchingEngine.processSellOrder(
            normalizedUserAddress,
            normalizedContractAddress,
            'cBRL', // tokenASymbol (quote token)
            'PCN',  // tokenBSymbol (base token)
            parseFloat(amount),
            parseFloat(price)
        );

        console.log('✅ [create-sell-order] Order created with automatic matching:', result);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('❌ [create-sell-order] Error creating sell order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Adaptador para cancel-buy-order
router.post('/cancel-buy-order', checkInitialized, async (req, res) => {
    try {
        const { orderId, walletAddress, contractAddress } = req.body;

        if (!walletAddress || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Usar contractAddress padrão se não fornecido
        const exchangeContractAddress = contractAddress || process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';

        const result = await matchingEngine.cancelOrder(parseInt(orderId), walletAddress, exchangeContractAddress, 'buy');

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error cancelling buy order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Adaptador para cancel-sell-order
router.post('/cancel-sell-order', checkInitialized, async (req, res) => {
    try {
        const { orderId, walletAddress, contractAddress } = req.body;

        if (!walletAddress || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Usar contractAddress padrão se não fornecido
        const exchangeContractAddress = contractAddress || process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';

        const result = await matchingEngine.cancelOrder(parseInt(orderId), walletAddress, exchangeContractAddress, 'sell');

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error cancelling sell order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Adaptador para formatar respostas no padrão esperado pelo frontend
const formatResponse = (data, success = true) => {
    return {
        success,
        data
    };
};

// Sobrescrever rotas existentes para usar formato do frontend
const originalOrderBookRoute = router.stack.find(layer =>
    layer.route && layer.route.path === '/orderbook/:symbol'
);

if (originalOrderBookRoute) {
    // Remover rota original
    const index = router.stack.indexOf(originalOrderBookRoute);
    router.stack.splice(index, 1);
}

// Recriar rota com formato correto
router.get('/orderbook/:symbol', checkInitialized, async (req, res) => {
    try {
        const { symbol } = req.params;
        const depth = parseInt(req.query.depth) || 20;

        const orderBook = await exchangeService.getOrderBook(symbol, depth);
        res.json(formatResponse(orderBook));
    } catch (error) {
        console.error('Error fetching order book:', error);
        res.status(500).json(formatResponse(null, false));
    }
});

// Fazer o mesmo para trades
const originalTradesRoute = router.stack.find(layer =>
    layer.route && layer.route.path === '/trades/:symbol'
);

if (originalTradesRoute) {
    const index = router.stack.indexOf(originalTradesRoute);
    router.stack.splice(index, 1);
}

router.get('/trades/:symbol', checkInitialized, async (req, res) => {
    try {
        const { symbol } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const trades = await exchangeService.getRecentTrades(symbol, limit);
        res.json(formatResponse(trades));
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json(formatResponse([], false));
    }
});

// Force matching endpoint para debug
router.post('/force-matching/:contractAddress', checkInitialized, async (req, res) => {
    try {
        const { contractAddress } = req.params;
        console.log('🎯 Force matching requested for:', contractAddress);

        // Verificar se o matching engine está disponível
        if (!matchingEngine) {
            return res.status(500).json({
                success: false,
                message: 'Matching engine not available'
            });
        }

        // Executar detecção e matching automático
        await matchingEngine.detectAndExecuteMatches(contractAddress);

        res.json({
            success: true,
            message: 'Matching check completed'
        });

    } catch (error) {
        console.error('❌ Error in force matching:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/exchange/v3/candles/:contractAddress
 * Get price data for TradingView charts (OHLCV)
 */
router.get('/v3/candles/:contractAddress', async (req, res) => {
    try {
        const { contractAddress } = req.params;
        const interval = req.query.interval || '1h'; // 1m, 5m, 15m, 1h, 4h, 1d
        const limit = parseInt(req.query.limit) || 100;

        console.log('📊 [v3/candles] Building candles for contract address:', contractAddress, 'interval:', interval);

        // Map interval to minutes
        const intervalMinutes = {
            '1m': 1,
            '5m': 5,
            '15m': 15,
            '1h': 60,
            '4h': 240,
            '1d': 1440
        };

        const minutes = intervalMinutes[interval] || 60;

        // Get trades and group by time intervals
        const trades = await global.prisma.exchangeTrade.findMany({
            where: {
                exchangeContractAddress: {
                    equals: contractAddress,
                    mode: 'insensitive'
                }
            },
            orderBy: {
                tradeTimestamp: 'desc'
            },
            take: limit * 20, // Get more trades to have enough data for grouping
            select: {
                price: true,
                amount: true,
                tradeTimestamp: true
            }
        });

        // Group trades by time intervals and calculate OHLCV
        const candles = {};

        trades.forEach(trade => {
            const timestamp = new Date(trade.tradeTimestamp);
            // Round down to interval boundary
            const intervalStart = new Date(
                Math.floor(timestamp.getTime() / (minutes * 60 * 1000)) * minutes * 60 * 1000
            );
            const key = intervalStart.getTime();

            if (!candles[key]) {
                candles[key] = {
                    timestamp: intervalStart,
                    open: parseFloat(trade.price),
                    high: parseFloat(trade.price),
                    low: parseFloat(trade.price),
                    close: parseFloat(trade.price),
                    volume: 0
                };
            }

            const price = parseFloat(trade.price);
            const volume = parseFloat(trade.amount);

            candles[key].high = Math.max(candles[key].high, price);
            candles[key].low = Math.min(candles[key].low, price);
            candles[key].close = price; // Last trade price in interval
            candles[key].volume += volume;
        });

        // Convert to array and sort by timestamp
        const candleArray = Object.values(candles)
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-limit); // Take only the requested number of candles

        res.json({
            success: true,
            data: candleArray,
            interval: interval,
            count: candleArray.length
        });

    } catch (error) {
        console.error('❌ Error fetching candle data:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados de preço',
            error: error.message
        });
    }
});

/**
 * GET /api/exchange/v3/ticker/:contractAddress
 * Get last price and 24h stats for Order Book header
 */
router.get('/v3/ticker/:contractAddress', async (req, res) => {
    try {
        const { contractAddress } = req.params;

        // Get last trade for current price
        const lastTrade = await global.prisma.exchangeTrade.findFirst({
            where: {
                exchangeContractAddress: {
                    equals: contractAddress,
                    mode: 'insensitive'
                }
            },
            orderBy: {
                tradeTimestamp: 'desc'
            },
            select: {
                price: true,
                tradeTimestamp: true
            }
        });

        // Get 24h stats
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const trades24h = await global.prisma.exchangeTrade.findMany({
            where: {
                exchangeContractAddress: {
                    equals: contractAddress,
                    mode: 'insensitive'
                },
                tradeTimestamp: {
                    gte: yesterday
                }
            },
            select: {
                price: true,
                amount: true,
                totalValue: true,
                tradeTimestamp: true
            },
            orderBy: {
                tradeTimestamp: 'asc'
            }
        });

        let stats = {
            lastPrice: lastTrade ? parseFloat(lastTrade.price) : 0,
            change24h: 0,
            changePercent24h: 0,
            high24h: 0,
            low24h: 0,
            volume24h: 0,
            trades24h: trades24h.length,
            lastUpdate: lastTrade ? lastTrade.tradeTimestamp : new Date()
        };

        if (trades24h.length > 0) {
            const prices = trades24h.map(t => parseFloat(t.price));
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];

            stats.high24h = Math.max(...prices);
            stats.low24h = Math.min(...prices);
            stats.volume24h = trades24h.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            stats.change24h = lastPrice - firstPrice;
            stats.changePercent24h = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
        }

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ Error fetching ticker data:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados do ticker',
            error: error.message
        });
    }
});

module.exports = router;
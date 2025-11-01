const { PrismaClient } = require('../generated/prisma');
const { ethers } = require('ethers');
const EventEmitter = require('events');
const rabbitMQ = require('../config/rabbitmq');
const redisService = require('./redis.service');
const redisOrderBookCache = require('./redisOrderBookCache');
const { normalizeAddress } = require('../utils/address');

/**
 * Order Matching Service - Sistema FIFO para matching automático de ordens
 *
 * Funcionalidades:
 * - Processamento FIFO de ordens criadas
 * - Matching automático baseado em preço/tempo
 * - Integração com blockchain (contrato matchOrders)
 * - Cache Redis para performance
 * - WebSocket broadcast para updates em tempo real
 */
class OrderMatchingService extends EventEmitter {
  constructor() {
    super();
    this.prisma = global.prisma || new PrismaClient();
    this.provider = null;
    this.wallet = null;
    this.contracts = new Map(); // contractAddress -> { contract, abi }
    this.isProcessing = false;
    this.processingQueue = [];
    this.matchingInProgress = new Set(); // Track orders being processed
    this.stats = {
      processedOrders: 0,
      successfulMatches: 0,
      failedMatches: 0,
      startTime: Date.now()
    };
  }

  /**
   * Inicializa o serviço
   */
  async initialize(rpcUrl, privateKey) {
    try {
      console.log('🎯 Initializing OrderMatchingService...');

      // Setup blockchain connection
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Setup RabbitMQ consumers
      await this.setupRabbitMQConsumers();

      console.log('✅ OrderMatchingService initialized');
      console.log('📍 Wallet address:', this.wallet.address);

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize OrderMatchingService:', error);
      throw error;
    }
  }

  /**
   * Adiciona contrato de exchange para gerenciar
   */
  addExchangeContract(contractAddress, abi) {
    try {
      const checksumAddress = ethers.getAddress(contractAddress);
      const contract = new ethers.Contract(checksumAddress, abi, this.wallet);

      this.contracts.set(checksumAddress, {
        contract,
        abi,
        address: checksumAddress
      });

      console.log(`✅ Added exchange contract to matching service: ${contractAddress}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add exchange contract ${contractAddress}:`, error);
      throw error;
    }
  }

  /**
   * Setup RabbitMQ consumers
   */
  async setupRabbitMQConsumers() {
    try {
      // Consumer para ordens criadas
      await rabbitMQ.consumeQueue(
        rabbitMQ.queues.EXCHANGE_ORDER_CREATED.name,
        this.handleNewOrder.bind(this),
        { noAck: false }
      );

      // Consumer para solicitações de matching
      await rabbitMQ.consumeQueue(
        rabbitMQ.queues.EXCHANGE_ORDER_MATCHING.name,
        this.handleMatchingRequest.bind(this),
        { noAck: false }
      );

      console.log('✅ RabbitMQ consumers setup completed');
    } catch (error) {
      console.error('❌ Error setting up RabbitMQ consumers:', error);
      throw error;
    }
  }

  /**
   * Handler para novas ordens criadas (FIFO)
   */
  async handleNewOrder(message, messageInfo) {
    try {
      const { orderData, contractAddress } = message;

      console.log(`📦 Processing new order: ${orderData.orderId} for contract: ${contractAddress}`);

      // Verificar se ordem já está sendo processada
      const orderKey = `${contractAddress}:${orderData.orderId}`;
      if (this.matchingInProgress.has(orderKey)) {
        console.log(`⚠️ Order ${orderKey} already being processed, skipping`);
        return;
      }

      this.matchingInProgress.add(orderKey);

      try {
        // 1. Tentar matching imediato
        await this.attemptMatching(contractAddress, orderData);

        // 2. Atualizar cache do Redis com a nova ordem
        await this.updateCacheWithNewOrder(contractAddress, orderData);

        // 3. Publicar atualização para WebSocket
        await rabbitMQ.publishWebSocketBroadcast('orderbook_update', {
          contractAddress,
          orderData,
          action: 'ORDER_CREATED'
        });

        this.stats.processedOrders++;
        console.log(`✅ Successfully processed order: ${orderData.orderId}`);

      } finally {
        this.matchingInProgress.delete(orderKey);
      }

    } catch (error) {
      console.error('❌ Error handling new order:', error);
      throw error;
    }
  }

  /**
   * Handler para solicitações explícitas de matching
   */
  async handleMatchingRequest(message, messageInfo) {
    try {
      const { contractAddress, matchingData } = message;

      console.log(`🤝 Processing matching request for contract: ${contractAddress}`);

      // Executar matching específico
      await this.executeSpecificMatching(contractAddress, matchingData);

    } catch (error) {
      console.error('❌ Error handling matching request:', error);
      throw error;
    }
  }

  /**
   * Algoritmo principal de matching FIFO
   */
  async attemptMatching(contractAddress, newOrder) {
    try {
      console.log(`🔍 Attempting matching for order ${newOrder.orderId} (${newOrder.orderType})`);

      // Buscar ordens compatíveis ordenadas por preço e tempo (FIFO)
      const compatibleOrders = await this.findCompatibleOrders(contractAddress, newOrder);

      if (compatibleOrders.length === 0) {
        console.log(`📋 No compatible orders found for ${newOrder.orderId}`);
        return;
      }

      console.log(`🎯 Found ${compatibleOrders.length} compatible orders`);

      // Processar matches em ordem FIFO
      for (const compatibleOrder of compatibleOrders) {
        if (this.canMatch(newOrder, compatibleOrder)) {
          const success = await this.executeMatching(contractAddress, newOrder, compatibleOrder);

          if (success) {
            this.stats.successfulMatches++;

            // Se ordem foi completamente preenchida, parar
            const updatedOrder = await this.getOrderById(newOrder.id);
            if (!updatedOrder || updatedOrder.remainingAmount <= 0) {
              break;
            }

            // Atualizar dados da nova ordem para próxima iteração
            newOrder.remainingAmount = updatedOrder.remainingAmount;
          } else {
            this.stats.failedMatches++;
          }
        }
      }

    } catch (error) {
      console.error('❌ Error in matching algorithm:', error);
      this.stats.failedMatches++;
      throw error;
    }
  }

  /**
   * Busca ordens compatíveis (FIFO: ordenadas por preço e tempo)
   * Usa Redis cache quando disponível para performance otimizada
   */
  async findCompatibleOrders(contractAddress, newOrder) {
    try {
      console.log(`🔍 Finding compatible orders for ${newOrder.orderType} order with price ${newOrder.price}`);

      // Tentar usar cache Redis primeiro
      let compatibleOrders = await this.findCompatibleOrdersFromCache(contractAddress, newOrder);

      // Se não encontrou no cache ou cache não disponível, usar banco de dados
      if (!compatibleOrders || compatibleOrders.length === 0) {
        console.log('📂 Cache miss, querying database for compatible orders');
        compatibleOrders = await this.findCompatibleOrdersFromDatabase(contractAddress, newOrder);

        // Cache os resultados para próximas consultas
        if (compatibleOrders.length > 0) {
          await this.cacheOrdersForContract(contractAddress);
        }
      }

      console.log(`🎯 Found ${compatibleOrders.length} compatible orders`);
      return compatibleOrders;

    } catch (error) {
      console.error('❌ Error finding compatible orders:', error);
      return [];
    }
  }

  /**
   * Busca ordens compatíveis do cache Redis
   */
  async findCompatibleOrdersFromCache(contractAddress, newOrder) {
    try {
      if (newOrder.orderType === 'BUY') {
        // Para ordem de compra, buscar sell orders com preço <= maxPrice da compra
        return await redisOrderBookCache.findCompatibleSellOrders(
          contractAddress,
          parseFloat(newOrder.price),
          20 // limit
        );
      } else {
        // Para ordem de venda, buscar buy orders com preço >= minPrice da venda
        return await redisOrderBookCache.findCompatibleBuyOrders(
          contractAddress,
          parseFloat(newOrder.price),
          20 // limit
        );
      }
    } catch (error) {
      console.error('❌ Error finding compatible orders from cache:', error);
      return null;
    }
  }

  /**
   * Busca ordens compatíveis do banco de dados (fallback)
   */
  async findCompatibleOrdersFromDatabase(contractAddress, newOrder) {
    try {
      const oppositeType = newOrder.orderType === 'BUY' ? 'SELL' : 'BUY';

      let whereClause = {
        exchangeContractAddress: normalizeAddress(contractAddress),
        orderType: oppositeType,
        status: { in: ['ACTIVE', 'OPEN', 'ACTIVE'] },
        remainingAmount: { gt: 0 },
        userAddress: { not: newOrder.userAddress } // Não pode fazer match consigo mesmo
      };

      // Filtros de preço baseados no tipo da nova ordem
      if (newOrder.orderType === 'BUY') {
        // Para ordem de compra, buscar ordens de venda com preço <= maxPrice da compra
        whereClause.price = { lte: newOrder.price };
      } else {
        // Para ordem de venda, buscar ordens de compra com preço >= minPrice da venda
        whereClause.price = { gte: newOrder.price };
      }

      // Ordenação FIFO: melhor preço primeiro, depois por tempo de criação
      const orderBy = newOrder.orderType === 'BUY'
        ? [{ price: 'asc' }, { createdAt: 'asc' }]  // Para compra: menor preço de venda primeiro
        : [{ price: 'desc' }, { createdAt: 'asc' }]; // Para venda: maior preço de compra primeiro

      const compatibleOrders = await this.prisma.exchangeOrder.findMany({
        where: whereClause,
        orderBy,
        take: 50 // Limit para performance
      });

      return compatibleOrders;

    } catch (error) {
      console.error('❌ Error finding compatible orders from database:', error);
      return [];
    }
  }

  /**
   * Atualiza cache de ordens para um contrato
   */
  async cacheOrdersForContract(contractAddress) {
    try {
      // Buscar ordens ativas do banco
      const [buyOrders, sellOrders] = await Promise.all([
        this.prisma.exchangeOrder.findMany({
          where: {
            exchangeContractAddress: normalizeAddress(contractAddress),
            orderType: 'BUY',
            status: { in: ['ACTIVE', 'OPEN', 'ACTIVE'] },
            remainingAmount: { gt: 0 }
          },
          orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
          take: 100
        }),
        this.prisma.exchangeOrder.findMany({
          where: {
            exchangeContractAddress: normalizeAddress(contractAddress),
            orderType: 'SELL',
            status: { in: ['ACTIVE', 'OPEN', 'ACTIVE'] },
            remainingAmount: { gt: 0 }
          },
          orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
          take: 100
        })
      ]);

      // Cache no Redis usando sorted sets
      await Promise.all([
        redisOrderBookCache.cacheBuyOrdersByPrice(contractAddress, buyOrders),
        redisOrderBookCache.cacheSellOrdersByPrice(contractAddress, sellOrders)
      ]);

      console.log(`📊 Cached ${buyOrders.length} buy orders and ${sellOrders.length} sell orders for ${contractAddress}`);
      return true;
    } catch (error) {
      console.error('❌ Error caching orders for contract:', error);
      return false;
    }
  }

  /**
   * Atualiza cache com nova ordem
   */
  async updateCacheWithNewOrder(contractAddress, orderData) {
    try {
      // Adicionar ordem ao cache Redis sorted sets
      await redisOrderBookCache.updateOrderInCache(contractAddress, orderData);

      // Também reconstruir e cachear o order book completo
      await this.rebuildOrderBookCache(contractAddress);

      console.log(`🔄 Cache updated with new order: ${orderData.orderId}`);
    } catch (error) {
      console.error('❌ Error updating cache with new order:', error);
    }
  }

  /**
   * Reconstrói e cache o order book completo
   */
  async rebuildOrderBookCache(contractAddress) {
    try {
      const normalizeAddress = require('../utils/address').normalizeAddress;

      // Buscar ordens ativas do banco
      const [buyOrders, sellOrders] = await Promise.all([
        this.prisma.exchangeOrder.findMany({
          where: {
            exchangeContractAddress: normalizeAddress(contractAddress),
            orderType: 'BUY',
            status: { in: ['ACTIVE', 'OPEN', 'ACTIVE'] },
            remainingAmount: { gt: 0 }
          },
          orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
          take: 20
        }),
        this.prisma.exchangeOrder.findMany({
          where: {
            exchangeContractAddress: normalizeAddress(contractAddress),
            orderType: 'SELL',
            status: { in: ['ACTIVE', 'OPEN', 'ACTIVE'] },
            remainingAmount: { gt: 0 }
          },
          orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
          take: 20
        })
      ]);

      // Construir order book no formato esperado pelo frontend
      const orderBook = {
        bids: buyOrders.map(order => ({
          price: parseFloat(order.price),
          amount: parseFloat(order.remainingAmount),
          total: parseFloat(order.price) * parseFloat(order.remainingAmount),
          orderId: order.blockchainOrderId.toString(),
          userAddress: order.userAddress
        })),
        asks: sellOrders.map(order => ({
          price: parseFloat(order.price),
          amount: parseFloat(order.remainingAmount),
          total: parseFloat(order.price) * parseFloat(order.remainingAmount),
          orderId: order.blockchainOrderId.toString(),
          userAddress: order.userAddress
        })),
        timestamp: new Date().toISOString()
      };

      // Cache o order book completo
      await redisOrderBookCache.cacheOrderBook(contractAddress, orderBook);

      console.log(`📊 Rebuilt order book cache with ${buyOrders.length} bids and ${sellOrders.length} asks`);
      return orderBook;
    } catch (error) {
      console.error('❌ Error rebuilding order book cache:', error);
      return null;
    }
  }

  /**
   * Verifica se duas ordens podem fazer match
   */
  canMatch(order1, order2) {
    // Verificações básicas
    if (order1.userAddress === order2.userAddress) return false;
    if (order1.orderType === order2.orderType) return false;
    if (order1.remainingAmount <= 0 || order2.remainingAmount <= 0) return false;

    // Verificação de preços
    if (order1.orderType === 'BUY') {
      // Ordem de compra: seu preço deve ser >= preço da venda
      return parseFloat(order1.price) >= parseFloat(order2.price);
    } else {
      // Ordem de venda: seu preço deve ser <= preço da compra
      return parseFloat(order1.price) <= parseFloat(order2.price);
    }
  }

  /**
   * Executa o matching no contrato blockchain
   */
  async executeMatching(contractAddress, order1, order2) {
    try {
      const contractInfo = this.contracts.get(normalizeAddress(contractAddress));
      if (!contractInfo) {
        throw new Error(`Contract not found: ${contractAddress}`);
      }

      // Determinar qual é buy e qual é sell
      const buyOrder = order1.orderType === 'BUY' ? order1 : order2;
      const sellOrder = order1.orderType === 'SELL' ? order1 : order2;

      console.log(`🔗 Executing blockchain matching: Buy ${buyOrder.blockchainOrderId} <-> Sell ${sellOrder.blockchainOrderId}`);

      // Chamar matchOrders no contrato
      const tx = await contractInfo.contract.matchOrders(
        [buyOrder.blockchainOrderId], // Array de buy orders
        [sellOrder.blockchainOrderId]  // Array de sell orders
      );

      console.log(`📤 Matching transaction sent: ${tx.hash}`);

      // Aguardar confirmação
      const receipt = await tx.wait();

      console.log(`✅ Matching confirmed in block: ${receipt.blockNumber}`);

      // Publicar resultado
      await rabbitMQ.publishOrdersMatched(contractAddress, {
        buyOrderId: buyOrder.blockchainOrderId,
        sellOrderId: sellOrder.blockchainOrderId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      return true;

    } catch (error) {
      console.error('❌ Error executing matching on blockchain:', error);
      return false;
    }
  }

  /**
   * Executa matching específico baseado em solicitação
   */
  async executeSpecificMatching(contractAddress, matchingData) {
    try {
      const { buyOrderIds, sellOrderIds } = matchingData;

      const contractInfo = this.contracts.get(normalizeAddress(contractAddress));
      if (!contractInfo) {
        throw new Error(`Contract not found: ${contractAddress}`);
      }

      console.log(`🎯 Executing specific matching: ${buyOrderIds.length} buy orders, ${sellOrderIds.length} sell orders`);

      // Chamar matchOrders no contrato
      const tx = await contractInfo.contract.matchOrders(buyOrderIds, sellOrderIds);

      console.log(`📤 Specific matching transaction sent: ${tx.hash}`);

      // Aguardar confirmação
      const receipt = await tx.wait();

      console.log(`✅ Specific matching confirmed in block: ${receipt.blockNumber}`);

      // Publicar resultado
      await rabbitMQ.publishOrdersMatched(contractAddress, {
        buyOrderIds,
        sellOrderIds,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        type: 'SPECIFIC_MATCHING'
      });

      return true;

    } catch (error) {
      console.error('❌ Error executing specific matching:', error);
      return false;
    }
  }

  /**
   * Busca ordem por ID
   */
  async getOrderById(orderId) {
    try {
      const order = await this.prisma.exchangeOrder.findUnique({
        where: { id: orderId }
      });
      return order;
    } catch (error) {
      console.error('❌ Error getting order by ID:', error);
      return null;
    }
  }

  /**
   * API pública para solicitar matching específico
   */
  async requestMatching(contractAddress, buyOrderIds, sellOrderIds) {
    try {
      await rabbitMQ.publishOrderMatching(contractAddress, {
        buyOrderIds,
        sellOrderIds,
        requestedBy: 'API',
        timestamp: new Date().toISOString()
      });

      return { success: true, message: 'Matching request queued' };
    } catch (error) {
      console.error('❌ Error requesting matching:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter estatísticas do serviço
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;

    return {
      ...this.stats,
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      contractsManaged: this.contracts.size,
      ordersInProgress: this.matchingInProgress.size,
      successRate: this.stats.processedOrders > 0
        ? ((this.stats.successfulMatches / this.stats.processedOrders) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Formatar tempo de atividade
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const rabbitHealth = await rabbitMQ.healthCheck();
      const redisHealth = redisService.isConnected;

      return {
        healthy: rabbitHealth.healthy && redisHealth && this.contracts.size > 0,
        services: {
          rabbitmq: rabbitHealth.healthy,
          redis: redisHealth,
          blockchain: !!this.provider,
          contracts: this.contracts.size
        },
        stats: this.getStats()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      console.log('🔄 OrderMatchingService shutting down...');

      // Aguardar processamento de ordens em andamento
      while (this.matchingInProgress.size > 0) {
        console.log(`⏳ Waiting for ${this.matchingInProgress.size} orders to complete...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('✅ OrderMatchingService shutdown completed');
    } catch (error) {
      console.error('❌ Error during OrderMatchingService shutdown:', error);
    }
  }
}

module.exports = OrderMatchingService;
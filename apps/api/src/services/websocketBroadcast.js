const EventEmitter = require('events');
const rabbitMQ = require('../config/rabbitmq');
const redisOrderBookCache = require('./redisOrderBookCache');

/**
 * WebSocket Broadcast Service - Sistema otimizado para broadcasts em tempo real
 *
 * Funcionalidades:
 * - Broadcast por rooms específicas (contrato, usuário)
 * - Rate limiting para evitar spam
 * - Batch updates para eficiência
 * - Fallback para múltiplas instâncias via Redis
 * - Métricas e monitoring
 */
class WebSocketBroadcastService extends EventEmitter {
  constructor() {
    super();
    this.io = null; // Socket.IO instance
    this.isInitialized = false;
    this.broadcastQueue = [];
    this.processingBatch = false;
    this.batchInterval = null;
    this.rateLimiters = new Map(); // Track rate limits per room

    // Configurações
    this.config = {
      batchSize: 10,           // Máximo de updates por batch
      batchInterval: 500,      // Intervalo entre batches (ms) - aumentado
      rateLimitWindow: 2000,   // Janela de rate limit (ms) - aumentado
      maxUpdatesPerWindow: 2,  // Máx updates por janela - reduzido
      roomMaxClients: 100      // Máx clientes por room
    };

    // Métricas
    this.metrics = {
      totalBroadcasts: 0,
      totalClients: 0,
      activeRooms: new Set(),
      rateLimitedBroadcasts: 0,
      batchedUpdates: 0,
      startTime: Date.now()
    };
  }

  /**
   * Inicializa o serviço com instância do Socket.IO
   */
  async initialize(socketIOInstance) {
    try {
      console.log('📡 Initializing WebSocket Broadcast Service...');

      this.io = socketIOInstance;

      // Setup RabbitMQ consumer para broadcasts
      await this.setupRabbitMQConsumer();

      // Setup eventos do Socket.IO
      this.setupSocketIOEvents();

      // Iniciar processamento em lote
      this.startBatchProcessing();

      this.isInitialized = true;
      console.log('✅ WebSocket Broadcast Service initialized');

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket Broadcast Service:', error);
      throw error;
    }
  }

  /**
   * Setup RabbitMQ consumer para broadcasts
   */
  async setupRabbitMQConsumer() {
    try {
      await rabbitMQ.consumeQueue(
        rabbitMQ.queues.EXCHANGE_WEBSOCKET_BROADCAST.name,
        this.handleBroadcastMessage.bind(this),
        { noAck: false }
      );

      console.log('✅ WebSocket broadcast RabbitMQ consumer setup completed');
    } catch (error) {
      console.error('❌ Error setting up broadcast RabbitMQ consumer:', error);
      throw error;
    }
  }

  /**
   * Setup eventos do Socket.IO
   */
  setupSocketIOEvents() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      this.metrics.totalClients++;
      console.log(`👤 Client connected: ${socket.id} (Total: ${this.metrics.totalClients})`);

      // Handler para joining rooms
      socket.on('join_room', (roomData) => {
        this.handleJoinRoom(socket, roomData);
      });

      // Handler para leaving rooms
      socket.on('leave_room', (roomData) => {
        this.handleLeaveRoom(socket, roomData);
      });

      // Handler para disconnect
      socket.on('disconnect', () => {
        this.metrics.totalClients--;
        console.log(`👋 Client disconnected: ${socket.id} (Total: ${this.metrics.totalClients})`);
      });
    });
  }

  /**
   * Handler para cliente joining room
   */
  handleJoinRoom(socket, roomData) {
    try {
      const { roomType, roomId } = roomData;
      const roomName = `${roomType}_${roomId}`;

      // Verificar limite de clientes por room
      const room = this.io.sockets.adapter.rooms.get(roomName);
      if (room && room.size >= this.config.roomMaxClients) {
        socket.emit('room_full', { roomName, limit: this.config.roomMaxClients });
        return;
      }

      socket.join(roomName);
      this.metrics.activeRooms.add(roomName);

      socket.emit('room_joined', { roomName, roomType, roomId });
      console.log(`📱 Client ${socket.id} joined room: ${roomName}`);

    } catch (error) {
      console.error('❌ Error handling join room:', error);
      socket.emit('room_error', { error: 'Failed to join room' });
    }
  }

  /**
   * Handler para cliente leaving room
   */
  handleLeaveRoom(socket, roomData) {
    try {
      const { roomType, roomId } = roomData;
      const roomName = `${roomType}_${roomId}`;

      socket.leave(roomName);
      socket.emit('room_left', { roomName, roomType, roomId });

      // Limpar room das métricas se vazia
      const room = this.io.sockets.adapter.rooms.get(roomName);
      if (!room || room.size === 0) {
        this.metrics.activeRooms.delete(roomName);
      }

      console.log(`📱 Client ${socket.id} left room: ${roomName}`);

    } catch (error) {
      console.error('❌ Error handling leave room:', error);
    }
  }

  /**
   * Handler para mensagens de broadcast do RabbitMQ
   */
  async handleBroadcastMessage(message, messageInfo) {
    try {
      const { broadcastType, data } = message;

      console.log(`📢 Processing broadcast: ${broadcastType}`);

      switch (broadcastType) {
        case 'orderbook_update':
          await this.handleOrderBookUpdate(data);
          break;
        case 'user_orders_update':
          await this.handleUserOrdersUpdate(data);
          break;
        case 'trade_executed':
          await this.handleTradeExecuted(data);
          break;
        case 'recent_trades_update':
          await this.handleRecentTradesUpdate(data);
          break;
        case 'ticker_update':
          await this.handleTickerUpdate(data);
          break;
        case 'candles_update':
          await this.handleCandlesUpdate(data);
          break;
        case 'batch_update':
          await this.handleBatchUpdate(data);
          break;
        default:
          console.warn(`⚠️ Unknown broadcast type: ${broadcastType}`);
      }

    } catch (error) {
      console.error('❌ Error handling broadcast message:', error);
      throw error;
    }
  }

  /**
   * Handler para atualização do order book
   */
  async handleOrderBookUpdate(data) {
    try {
      const { contractAddress, orderData, action } = data;
      const roomName = `book:${contractAddress}`;

      // Verificar rate limit para a room
      if (!this.checkRateLimit(roomName)) {
        this.metrics.rateLimitedBroadcasts++;
        console.log(`⏳ Rate limited broadcast for room: ${roomName}`);
        return;
      }

      // Buscar order book atualizado do cache
      let orderBook = await redisOrderBookCache.getOrderBook(contractAddress);
      console.log(`🔍 OrderBook from cache:`, orderBook ? 'found' : 'not found');

      // Se não está no cache, construir um orderbook básico
      if (!orderBook) {
        console.log(`🔧 Building orderbook from database for: ${contractAddress}`);
        orderBook = await this.buildOrderBookFromDatabase(contractAddress);
        console.log(`📋 Built orderbook:`, orderBook ? `${orderBook.bids?.length || 0} bids, ${orderBook.asks?.length || 0} asks` : 'null');

        // Cache o resultado
        if (orderBook) {
          await redisOrderBookCache.cacheOrderBook(contractAddress, orderBook);
          console.log(`💾 Cached orderbook for ${contractAddress}`);
        }
      }

      // Broadcast para room específica
      const broadcastData = {
        type: 'orderbook_updated',
        contractAddress,
        data: orderBook,
        action,
        timestamp: new Date().toISOString()
      };

      this.queueBroadcast(roomName, broadcastData);
      this.metrics.totalBroadcasts++;

      console.log(`📊 Queued orderbook update for room: ${roomName}`);

    } catch (error) {
      console.error('❌ Error handling orderbook update:', error);
    }
  }

  /**
   * Handler para atualização de ordens do usuário
   */
  async handleUserOrdersUpdate(data) {
    try {
      const { userAddress, orderData, contractAddress } = data;
      const roomName = `user_${userAddress}`;

      if (!this.checkRateLimit(roomName)) {
        this.metrics.rateLimitedBroadcasts++;
        return;
      }

      const broadcastData = {
        type: 'user_orders_updated',
        userAddress,
        contractAddress,
        data: orderData,
        timestamp: new Date().toISOString()
      };

      this.queueBroadcast(roomName, broadcastData);
      this.metrics.totalBroadcasts++;

      console.log(`👤 Queued user orders update for: ${userAddress}`);

    } catch (error) {
      console.error('❌ Error handling user orders update:', error);
    }
  }

  /**
   * Handler para trade executado
   */
  async handleTradeExecuted(data) {
    try {
      const { contractAddress, tradeData } = data;
      const roomName = `book_${contractAddress}`;

      if (!this.checkRateLimit(roomName)) {
        this.metrics.rateLimitedBroadcasts++;
        return;
      }

      const broadcastData = {
        type: 'trade_executed',
        contractAddress,
        data: tradeData,
        timestamp: new Date().toISOString()
      };

      this.queueBroadcast(roomName, broadcastData);
      this.metrics.totalBroadcasts++;

      console.log(`💰 Queued trade executed for contract: ${contractAddress}`);

    } catch (error) {
      console.error('❌ Error handling trade executed:', error);
    }
  }

  /**
   * Handler para atualização de trades recentes
   */
  async handleRecentTradesUpdate(data) {
    try {
      const { contractAddress, tradesData } = data;
      const roomName = `book_${contractAddress}`;

      if (!this.checkRateLimit(roomName)) {
        this.metrics.rateLimitedBroadcasts++;
        return;
      }

      const broadcastData = {
        type: 'recent_trades_updated',
        contractAddress,
        data: tradesData,
        timestamp: new Date().toISOString()
      };

      this.queueBroadcast(roomName, broadcastData);
      this.metrics.totalBroadcasts++;

      // console.log(`📈 Queued recent trades update for contract: ${contractAddress}`); // Reduced logging

    } catch (error) {
      console.error('❌ Error handling recent trades update:', error);
    }
  }

  /**
   * Handler para atualização do ticker (preço, volume 24h)
   */
  async handleTickerUpdate(data) {
    try {
      const { contractAddress, tickerData } = data;
      const roomName = `book_${contractAddress}`;

      if (!this.checkRateLimit(roomName)) {
        this.metrics.rateLimitedBroadcasts++;
        return;
      }

      const broadcastData = {
        type: 'ticker_updated',
        contractAddress,
        data: tickerData,
        timestamp: new Date().toISOString()
      };

      this.queueBroadcast(roomName, broadcastData);
      this.metrics.totalBroadcasts++;

      // console.log(`💹 Queued ticker update for contract: ${contractAddress}`); // Reduced logging

    } catch (error) {
      console.error('❌ Error handling ticker update:', error);
    }
  }

  /**
   * Handler para atualização de candlesticks
   */
  async handleCandlesUpdate(data) {
    try {
      const { contractAddress, candlesData, interval } = data;
      const roomName = `book_${contractAddress}`;

      if (!this.checkRateLimit(roomName)) {
        this.metrics.rateLimitedBroadcasts++;
        return;
      }

      const broadcastData = {
        type: 'candles_updated',
        contractAddress,
        data: candlesData,
        interval,
        timestamp: new Date().toISOString()
      };

      this.queueBroadcast(roomName, broadcastData);
      this.metrics.totalBroadcasts++;

      console.log(`📊 Queued candles update for contract: ${contractAddress} (${interval})`);

    } catch (error) {
      console.error('❌ Error handling candles update:', error);
    }
  }

  /**
   * Handler para batch update
   */
  async handleBatchUpdate(data) {
    try {
      const { updates } = data;

      for (const update of updates) {
        switch (update.type) {
          case 'orderbook':
            await this.handleOrderBookUpdate(update.data);
            break;
          case 'user_orders':
            await this.handleUserOrdersUpdate(update.data);
            break;
          case 'trade':
            await this.handleTradeExecuted(update.data);
            break;
        }
      }

      this.metrics.batchedUpdates += updates.length;
      console.log(`📦 Processed batch update with ${updates.length} updates`);

    } catch (error) {
      console.error('❌ Error handling batch update:', error);
    }
  }

  /**
   * Adiciona broadcast à fila
   */
  queueBroadcast(roomName, data) {
    this.broadcastQueue.push({ roomName, data });
  }

  /**
   * Inicia processamento em lote
   */
  startBatchProcessing() {
    this.batchInterval = setInterval(() => {
      this.processBroadcastBatch();
    }, this.config.batchInterval);

    console.log('⚡ Started batch processing for WebSocket broadcasts');
  }

  /**
   * Processa lote de broadcasts
   */
  async processBroadcastBatch() {
    if (this.processingBatch || this.broadcastQueue.length === 0 || !this.io) {
      return;
    }

    this.processingBatch = true;

    try {
      // Pega próximo lote
      const batch = this.broadcastQueue.splice(0, this.config.batchSize);

      // Agrupa por room para otimizar
      const roomBroadcasts = new Map();

      batch.forEach(({ roomName, data }) => {
        if (!roomBroadcasts.has(roomName)) {
          roomBroadcasts.set(roomName, []);
        }
        roomBroadcasts.get(roomName).push(data);
      });

      // Envia broadcasts agrupados
      const promises = [];
      for (const [roomName, dataList] of roomBroadcasts) {
        if (dataList.length === 1) {
          // Broadcast único
          promises.push(this.sendBroadcast(roomName, dataList[0]));
        } else {
          // Batch broadcast
          promises.push(this.sendBatchBroadcast(roomName, dataList));
        }
      }

      await Promise.all(promises);

      if (batch.length > 0) {
        console.log(`⚡ Processed broadcast batch: ${batch.length} updates`);
      }

    } catch (error) {
      console.error('❌ Error processing broadcast batch:', error);
    } finally {
      this.processingBatch = false;
    }
  }

  /**
   * Envia broadcast único
   */
  async sendBroadcast(roomName, data) {
    try {
      if (!this.io) {
        console.log(`❌ No Socket.IO instance available`);
        return;
      }

      const room = this.io.sockets.adapter.rooms.get(roomName);
      if (!room || room.size === 0) {
        console.log(`📭 Room ${roomName} is empty, skipping broadcast`);
        return; // Room vazia
      }

      console.log(`📤 Sending ${data.type} to room ${roomName} (${room.size} clients)`);
      this.io.to(roomName).emit(data.type, data);
      console.log(`✅ Broadcast sent successfully to ${roomName}`);

    } catch (error) {
      console.error(`❌ Error sending broadcast to ${roomName}:`, error);
    }
  }

  /**
   * Envia batch broadcast
   */
  async sendBatchBroadcast(roomName, dataList) {
    try {
      if (!this.io || dataList.length === 0) return;

      const room = this.io.sockets.adapter.rooms.get(roomName);
      if (!room || room.size === 0) {
        return; // Room vazia
      }

      this.io.to(roomName).emit('batch_update', {
        type: 'batch_update',
        updates: dataList,
        count: dataList.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Error sending batch broadcast to ${roomName}:`, error);
    }
  }

  /**
   * Verifica rate limit para room
   */
  checkRateLimit(roomName) {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;

    if (!this.rateLimiters.has(roomName)) {
      this.rateLimiters.set(roomName, []);
    }

    const timestamps = this.rateLimiters.get(roomName);

    // Remove timestamps antigos
    const validTimestamps = timestamps.filter(ts => ts > windowStart);

    if (validTimestamps.length >= this.config.maxUpdatesPerWindow) {
      return false; // Rate limited
    }

    // Adiciona timestamp atual
    validTimestamps.push(now);
    this.rateLimiters.set(roomName, validTimestamps);

    return true;
  }

  /**
   * Constrói order book do banco de dados
   */
  async buildOrderBookFromDatabase(contractAddress) {
    try {
      const { PrismaClient } = require('../generated/prisma');
      const prisma = global.prisma || new PrismaClient();
      const { normalizeAddress } = require('../utils/address');

      const [buyOrders, sellOrders] = await Promise.all([
        prisma.exchangeOrder.findMany({
          where: {
            exchangeContractAddress: normalizeAddress(contractAddress),
            orderType: 'BUY',
            status: {
              in: ['ACTIVE', 'ACTIVE']
            },
            remainingAmount: { gt: 0 }
          },
          orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
          take: 20
        }),
        prisma.exchangeOrder.findMany({
          where: {
            exchangeContractAddress: normalizeAddress(contractAddress),
            orderType: 'SELL',
            status: {
              in: ['ACTIVE', 'ACTIVE']
            },
            remainingAmount: { gt: 0 }
          },
          orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
          take: 20
        })
      ]);

      return {
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

    } catch (error) {
      console.error('❌ Error building order book from database:', error);
      return null;
    }
  }

  // ===================== API PÚBLICA =====================

  /**
   * API para solicitar broadcast de orderbook
   */
  async broadcastOrderBookUpdate(contractAddress, orderData = null, action = 'UPDATE') {
    try {
      await rabbitMQ.publishWebSocketBroadcast('orderbook_update', {
        contractAddress,
        orderData,
        action
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error broadcasting orderbook update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * API para solicitar broadcast de ordens do usuário
   */
  async broadcastUserOrdersUpdate(userAddress, contractAddress, orderData) {
    try {
      await rabbitMQ.publishWebSocketBroadcast('user_orders_update', {
        userAddress,
        contractAddress,
        orderData
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error broadcasting user orders update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * API para solicitar broadcast de trades recentes
   */
  async broadcastRecentTradesUpdate(contractAddress, tradesData) {
    try {
      await rabbitMQ.publishWebSocketBroadcast('recent_trades_update', {
        contractAddress,
        tradesData
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error broadcasting recent trades update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * API para solicitar broadcast de ticker
   */
  async broadcastTickerUpdate(contractAddress, tickerData) {
    try {
      await rabbitMQ.publishWebSocketBroadcast('ticker_update', {
        contractAddress,
        tickerData
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error broadcasting ticker update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * API para solicitar broadcast de candles
   */
  async broadcastCandlesUpdate(contractAddress, candlesData, interval) {
    try {
      await rabbitMQ.publishWebSocketBroadcast('candles_update', {
        contractAddress,
        candlesData,
        interval
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error broadcasting candles update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * API para solicitar batch broadcasts
   */
  async broadcastBatchUpdates(updates) {
    try {
      await rabbitMQ.publishWebSocketBroadcast('batch_update', {
        updates
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error broadcasting batch updates:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter métricas do serviço
   */
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;

    return {
      ...this.metrics,
      activeRooms: Array.from(this.metrics.activeRooms),
      activeRoomsCount: this.metrics.activeRooms.size,
      queueSize: this.broadcastQueue.length,
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      config: this.config
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

      // Se não foi inicializado ainda, considerar como "pending" mas não falhar
      const isPending = !this.isInitialized && !this.io;
      const isHealthy = this.isInitialized && rabbitHealth.healthy && !!this.io;

      return {
        healthy: isHealthy || isPending, // Allow pending state during initialization
        services: {
          rabbitmq: rabbitHealth.healthy,
          socketio: !!this.io,
          initialized: this.isInitialized
        },
        metrics: this.getMetrics(),
        status: isPending ? 'pending' : (isHealthy ? 'healthy' : 'unhealthy')
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        status: 'error'
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      console.log('🔄 WebSocket Broadcast Service shutting down...');

      // Parar processamento em lote
      if (this.batchInterval) {
        clearInterval(this.batchInterval);
        this.batchInterval = null;
      }

      // Processar fila restante
      if (this.broadcastQueue.length > 0) {
        console.log(`📤 Processing remaining ${this.broadcastQueue.length} broadcasts...`);
        await this.processBroadcastBatch();
      }

      console.log('✅ WebSocket Broadcast Service shutdown completed');
    } catch (error) {
      console.error('❌ Error during WebSocket Broadcast Service shutdown:', error);
    }
  }
}

// Export singleton instance
module.exports = new WebSocketBroadcastService();
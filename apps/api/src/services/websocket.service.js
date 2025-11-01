const { Server } = require('socket.io');
const websocketBroadcast = require('./websocketBroadcast');

class WebSocketService {
  constructor() {
    this.io = null;
    this.activeUsers = new Map(); // userId -> { socketId, currentScreen, contractAddress }
    this.screenUsers = new Map(); // screen:contract -> Set(userIds)
  }

  async initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();

    // Inicializar sistema de broadcast otimizado
    await websocketBroadcast.initialize(this.io);

    console.log('🔌 WebSocket service initialized with optimized broadcasting');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Usuário se registra em uma tela específica
      socket.on('join_screen', (data) => {
        const { userId, screen, contractAddress } = data;

        // Remove usuário de telas anteriores
        this.removeUserFromAllScreens(userId);

        // Adiciona usuário à nova tela
        this.addUserToScreen(userId, socket.id, screen, contractAddress);

        console.log(`👤 User ${userId} joined screen: ${screen} (contract: ${contractAddress})`);
        console.log(`📊 Active users on ${screen}:${contractAddress}: ${this.getScreenUsers(screen, contractAddress).length}`);
      });

      // Usuário sai de uma tela
      socket.on('leave_screen', (data) => {
        const { userId } = data;
        this.removeUserFromAllScreens(userId);
        console.log(`👋 User ${userId} left all screens`);
      });

      // Disconnect
      socket.on('disconnect', () => {
        const userId = this.getUserBySocketId(socket.id);
        if (userId) {
          this.removeUserFromAllScreens(userId);
          console.log(`🔌 User ${userId} disconnected`);
        }
      });
    });
  }

  addUserToScreen(userId, socketId, screen, contractAddress) {
    // Armazenar informações do usuário
    this.activeUsers.set(userId, {
      socketId,
      currentScreen: screen,
      contractAddress
    });

    // Adicionar usuário ao grupo da tela
    const screenKey = `${screen}:${contractAddress || 'all'}`;
    if (!this.screenUsers.has(screenKey)) {
      this.screenUsers.set(screenKey, new Set());
    }
    this.screenUsers.get(screenKey).add(userId);

    // Juntar o socket à room específica
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(screenKey);
    }
  }

  removeUserFromAllScreens(userId) {
    const userInfo = this.activeUsers.get(userId);
    if (userInfo) {
      // Remover de todas as screens
      for (const [screenKey, users] of this.screenUsers.entries()) {
        users.delete(userId);
        if (users.size === 0) {
          this.screenUsers.delete(screenKey);
        }
      }

      // Remover socket das rooms
      const socket = this.io.sockets.sockets.get(userInfo.socketId);
      if (socket) {
        socket.leaveAll();
      }

      this.activeUsers.delete(userId);
    }
  }

  getUserBySocketId(socketId) {
    for (const [userId, userInfo] of this.activeUsers.entries()) {
      if (userInfo.socketId === socketId) {
        return userId;
      }
    }
    return null;
  }

  getScreenUsers(screen, contractAddress) {
    const screenKey = `${screen}:${contractAddress || 'all'}`;
    return Array.from(this.screenUsers.get(screenKey) || []);
  }

  // Notificar todos os usuários em uma tela específica
  notifyScreen(screen, contractAddress, eventType, data) {
    const screenKey = `${screen}:${contractAddress || 'all'}`;
    const users = this.getScreenUsers(screen, contractAddress);

    if (users.length > 0) {
      // console.log(`📡 Broadcasting ${eventType} to ${users.length} users on ${screenKey}`);
      this.io.to(screenKey).emit(eventType, data);
    }
  }

  // Notificar usuário específico
  notifyUser(userId, eventType, data) {
    const userInfo = this.activeUsers.get(userId);
    if (userInfo) {
      console.log(`📧 Sending ${eventType} to user ${userId}`);
      this.io.to(userInfo.socketId).emit(eventType, data);
    }
  }

  // Quando uma nova ordem é criada - SIMPLIFIED: só notifica ticker se necessário
  async onOrderCreated(orderData) {
    // Minimalista: frontend usa HTTP polling para order book
    // WebSocket apenas para ticker updates críticos
  }

  // Quando uma ordem é cancelada - SIMPLIFIED
  async onOrderCancelled(orderData) {
    // Minimalista: frontend usa HTTP polling
  }

  // Quando ordens são executadas/matcheadas - SIMPLIFIED
  async onOrdersMatched(matchData) {
    const { exchangeContractAddress } = matchData;

    try {
      // Apenas notificar ticker update para último preço
      if (matchData.executedPrice) {
        this.notifyScreen('book', exchangeContractAddress, 'ticker_updated', {
          contractAddress: exchangeContractAddress,
          data: {
            lastPrice: matchData.executedPrice,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('❌ Error sending ticker update:', error);
    }
  }

  // Obter estatísticas dos usuários ativos
  getStats() {
    const stats = {
      totalActiveUsers: this.activeUsers.size,
      screenBreakdown: {}
    };

    for (const [screenKey, users] of this.screenUsers.entries()) {
      stats.screenBreakdown[screenKey] = users.size;
    }

    return stats;
  }

  // REMOVED: Não precisamos mais de broadcast automático de order book
  // Frontend usa HTTP polling como o OrderBook.jsx faz

  // Buscar order book atualizado do banco de dados
  async getUpdatedOrderBook(exchangeContractAddress) {
    try {
      const { ethers } = require('ethers');

      // Use prisma instance from global or create new instance if not available
      const prisma = global.prisma || new (require('../generated/prisma').PrismaClient)();

      // Buscar ordens ativas de compra (excluindo MATCHING para evitar spreads negativos)
      const buyOrders = await prisma.exchangeOrder.findMany({
        where: {
          exchangeContractAddress: ethers.getAddress(exchangeContractAddress),
          orderType: 'BUY',
          status: {
            in: ['ACTIVE', 'ACTIVE']
          }
        },
        orderBy: [
          { price: 'desc' },
          { createdAt: 'asc' }
        ],
        take: 20
      });

      // Buscar ordens ativas de venda (excluindo MATCHING para evitar spreads negativos)
      const sellOrders = await prisma.exchangeOrder.findMany({
        where: {
          exchangeContractAddress: ethers.getAddress(exchangeContractAddress),
          orderType: 'SELL',
          status: {
            in: ['ACTIVE', 'ACTIVE']
          }
        },
        orderBy: [
          { price: 'asc' },
          { createdAt: 'asc' }
        ],
        take: 20
      });

      // Formatar order book no mesmo formato usado pela API
      return {
        bids: buyOrders.map(order => ({
          price: parseFloat(order.price),
          amount: parseFloat(order.remainingAmount),
          total: parseFloat(order.price) * parseFloat(order.remainingAmount),
          orderId: order.blockchainOrderId.toString(),
          blockchainOrderId: order.blockchainOrderId.toString(),
          databaseId: order.id,
          userAddress: order.userAddress
        })),
        asks: sellOrders.map(order => ({
          price: parseFloat(order.price),
          amount: parseFloat(order.remainingAmount),
          total: parseFloat(order.price) * parseFloat(order.remainingAmount),
          orderId: order.blockchainOrderId.toString(),
          blockchainOrderId: order.blockchainOrderId.toString(),
          databaseId: order.id,
          userAddress: order.userAddress
        }))
      };
    } catch (error) {
      console.error('❌ Error fetching updated order book:', error);
      throw error;
    }
  }
}

module.exports = new WebSocketService();
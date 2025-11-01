const OrderMatchingService = require('./orderMatchingService');
const websocketBroadcast = require('./websocketBroadcast');
const redisOrderBookCache = require('./redisOrderBookCache');
const rabbitMQ = require('../config/rabbitmq');

/**
 * Exchange System Manager - Gerencia todos os componentes do sistema de exchange
 *
 * Responsabilidades:
 * - Inicializar e coordenar todos os serviços
 * - Gerenciar contratos de exchange
 * - Health checks centralizados
 * - Graceful shutdown
 * - Métricas consolidadas
 */
class ExchangeSystemManager {
  constructor() {
    this.orderMatchingService = new OrderMatchingService();
    this.isInitialized = false;
    this.managedContracts = new Map(); // contractAddress -> contract info

    // Status dos serviços
    this.services = {
      rabbitmq: { initialized: false, healthy: false },
      redis: { initialized: false, healthy: false },
      orderMatching: { initialized: false, healthy: false },
      websocketBroadcast: { initialized: false, healthy: false }
    };
  }

  /**
   * Inicializa todo o sistema de exchange
   */
  async initialize(config) {
    try {
      console.log('🚀 Initializing Exchange System Manager...');

      const { rpcUrl, privateKey, exchangeContracts } = config;

      // 1. Inicializar RabbitMQ (se não já inicializado)
      if (!rabbitMQ.isConnected) {
        console.log('📦 Initializing RabbitMQ...');
        await rabbitMQ.initialize();
        this.services.rabbitmq.initialized = true;
      }

      // 2. Inicializar OrderMatchingService
      console.log('🎯 Initializing Order Matching Service...');
      await this.orderMatchingService.initialize(rpcUrl, privateKey);
      this.services.orderMatching.initialized = true;

      // 3. Adicionar contratos de exchange ao sistema
      if (exchangeContracts && exchangeContracts.length > 0) {
        console.log(`📋 Adding ${exchangeContracts.length} exchange contracts...`);

        for (const contractInfo of exchangeContracts) {
          await this.addExchangeContract(contractInfo);
        }
      }

      // 4. Fazer cache inicial dos order books
      console.log('📊 Initializing order book cache...');
      await this.initializeOrderBookCache();

      this.isInitialized = true;
      console.log('✅ Exchange System Manager initialized successfully');

      // 5. Executar health check inicial
      const healthStatus = await this.healthCheck();
      console.log('🏥 Initial health check:', healthStatus.overall ? '✅ Healthy' : '❌ Unhealthy');

      if (!healthStatus.overall) {
        console.log('🔍 Health check details:', JSON.stringify(healthStatus, null, 2));
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Exchange System Manager:', error);
      throw error;
    }
  }

  /**
   * Adiciona um contrato de exchange ao sistema
   */
  async addExchangeContract(contractInfo) {
    try {
      const { address, abi, name, tokenA, tokenB } = contractInfo;

      console.log(`➕ Adding exchange contract: ${name || address}`);

      // Adicionar ao OrderMatchingService
      this.orderMatchingService.addExchangeContract(address, abi);

      // Salvar informações do contrato
      this.managedContracts.set(address, {
        address,
        abi,
        name: name || `Exchange-${address.slice(0, 8)}`,
        tokenA,
        tokenB,
        addedAt: new Date(),
        isActive: true
      });

      // Fazer cache inicial do order book para este contrato
      await this.orderMatchingService.cacheOrdersForContract(address);

      console.log(`✅ Exchange contract added: ${name || address}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add exchange contract ${contractInfo.address}:`, error);
      return false;
    }
  }

  /**
   * Remove um contrato de exchange do sistema
   */
  async removeExchangeContract(contractAddress) {
    try {
      console.log(`➖ Removing exchange contract: ${contractAddress}`);

      // Limpar cache Redis
      await redisOrderBookCache.clearContractCache(contractAddress);

      // Remover das estruturas internas
      this.managedContracts.delete(contractAddress);

      console.log(`✅ Exchange contract removed: ${contractAddress}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to remove exchange contract ${contractAddress}:`, error);
      return false;
    }
  }

  /**
   * Inicializa cache dos order books existentes
   */
  async initializeOrderBookCache() {
    try {
      const promises = [];

      for (const [contractAddress] of this.managedContracts) {
        promises.push(this.orderMatchingService.cacheOrdersForContract(contractAddress));
      }

      await Promise.all(promises);

      console.log(`📊 Order book cache initialized for ${this.managedContracts.size} contracts`);
      return true;
    } catch (error) {
      console.error('❌ Error initializing order book cache:', error);
      return false;
    }
  }

  /**
   * API para solicitar matching específico
   */
  async requestMatching(contractAddress, buyOrderIds, sellOrderIds) {
    try {
      if (!this.managedContracts.has(contractAddress)) {
        throw new Error(`Contract not managed: ${contractAddress}`);
      }

      return await this.orderMatchingService.requestMatching(
        contractAddress,
        buyOrderIds,
        sellOrderIds
      );
    } catch (error) {
      console.error('❌ Error requesting matching:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * API para broadcast de orderbook
   */
  async broadcastOrderBookUpdate(contractAddress, action = 'UPDATE') {
    try {
      if (!this.managedContracts.has(contractAddress)) {
        console.warn(`⚠️ Broadcasting for unmanaged contract: ${contractAddress}`);
      }

      return await websocketBroadcast.broadcastOrderBookUpdate(contractAddress, null, action);
    } catch (error) {
      console.error('❌ Error broadcasting orderbook update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * API para broadcast de ordens do usuário
   */
  async broadcastUserOrdersUpdate(userAddress, contractAddress, orderData) {
    try {
      return await websocketBroadcast.broadcastUserOrdersUpdate(userAddress, contractAddress, orderData);
    } catch (error) {
      console.error('❌ Error broadcasting user orders update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualiza cache de um contrato específico
   */
  async refreshContractCache(contractAddress) {
    try {
      if (!this.managedContracts.has(contractAddress)) {
        throw new Error(`Contract not managed: ${contractAddress}`);
      }

      await this.orderMatchingService.cacheOrdersForContract(contractAddress);
      console.log(`🔄 Cache refreshed for contract: ${contractAddress}`);

      return { success: true };
    } catch (error) {
      console.error(`❌ Error refreshing cache for ${contractAddress}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista contratos gerenciados
   */
  listManagedContracts() {
    const contracts = [];

    for (const [address, info] of this.managedContracts) {
      contracts.push({
        address,
        name: info.name,
        tokenA: info.tokenA,
        tokenB: info.tokenB,
        addedAt: info.addedAt,
        isActive: info.isActive
      });
    }

    return contracts;
  }

  /**
   * Estatísticas consolidadas do sistema
   */
  async getSystemStats() {
    try {
      const [
        orderMatchingStats,
        websocketStats,
        rabbitMQStats,
        redisStats
      ] = await Promise.all([
        this.orderMatchingService.getStats(),
        websocketBroadcast.getMetrics(),
        rabbitMQ.getAllQueueStats(),
        this.getCacheStats()
      ]);

      return {
        system: {
          initialized: this.isInitialized,
          managedContracts: this.managedContracts.size,
          uptime: Date.now() - (orderMatchingStats.startTime || Date.now())
        },
        orderMatching: orderMatchingStats,
        websocket: websocketStats,
        rabbitmq: rabbitMQStats,
        redis: redisStats,
        contracts: this.listManagedContracts()
      };
    } catch (error) {
      console.error('❌ Error getting system stats:', error);
      return {
        system: { initialized: this.isInitialized, error: error.message }
      };
    }
  }

  /**
   * Estatísticas do cache Redis
   */
  async getCacheStats() {
    try {
      const contractStats = [];

      for (const [contractAddress] of this.managedContracts) {
        const stats = await redisOrderBookCache.getCacheStats(contractAddress);
        contractStats.push(stats);
      }

      const cacheHealth = await redisOrderBookCache.healthCheck();

      return {
        healthy: cacheHealth.healthy,
        connected: cacheHealth.connected,
        contracts: contractStats
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Health check consolidado
   */
  async healthCheck() {
    try {
      const checks = await Promise.all([
        rabbitMQ.healthCheck(),
        this.orderMatchingService.healthCheck(),
        websocketBroadcast.healthCheck(),
        redisOrderBookCache.healthCheck()
      ]);

      const [rabbitHealth, orderMatchingHealth, websocketHealth, cacheHealth] = checks;

      // Atualizar status dos serviços
      this.services.rabbitmq.healthy = rabbitHealth.healthy;
      this.services.orderMatching.healthy = orderMatchingHealth.healthy;
      this.services.websocketBroadcast.healthy = websocketHealth.healthy;
      this.services.redis.healthy = cacheHealth.healthy;

      const overall = rabbitHealth.healthy &&
                     orderMatchingHealth.healthy &&
                     websocketHealth.healthy &&
                     cacheHealth.healthy;

      return {
        overall,
        timestamp: new Date().toISOString(),
        services: {
          rabbitmq: rabbitHealth,
          orderMatching: orderMatchingHealth,
          websocket: websocketHealth,
          redis: cacheHealth
        },
        system: {
          initialized: this.isInitialized,
          managedContracts: this.managedContracts.size
        }
      };
    } catch (error) {
      return {
        overall: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      console.log('🔄 Exchange System Manager shutting down...');

      // Shutdown serviços na ordem reversa
      const shutdownPromises = [
        websocketBroadcast.shutdown(),
        this.orderMatchingService.shutdown(),
        rabbitMQ.close()
      ];

      await Promise.all(shutdownPromises);

      this.isInitialized = false;
      console.log('✅ Exchange System Manager shutdown completed');
    } catch (error) {
      console.error('❌ Error during Exchange System Manager shutdown:', error);
    }
  }
}

// Export singleton instance
module.exports = new ExchangeSystemManager();
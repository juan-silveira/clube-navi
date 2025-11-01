const redisService = require('./redis.service');

/**
 * Redis OrderBook Cache Service
 *
 * Utiliza sorted sets do Redis para cache otimizado de order books
 * com busca rápida por preço e ordenação FIFO
 */
class RedisOrderBookCache {
  constructor() {
    this.redis = redisService;
    this.defaultTTL = {
      orderbook: 30,     // 30 segundos - order book completo (aumentado para estabilidade)
      orders: 60,        // 60 segundos - ordens individuais por preço
      userOrders: 120,   // 120 segundos - ordens do usuário
      stats: 300         // 300 segundos - estatísticas
    };
  }

  // ===================== ORDER BOOK CACHE =====================

  /**
   * Cache completo do order book
   */
  async cacheOrderBook(contractAddress, orderBook) {
    try {
      const key = `orderbook:${contractAddress}`;

      if (this.redis.isConnected) {
        await this.redis.client.setEx(key, this.defaultTTL.orderbook, JSON.stringify(orderBook));
      } else {
        // Fallback em memória
        this.redis.memoryFallback.set(key, {
          data: JSON.stringify(orderBook),
          expiry: Date.now() + (this.defaultTTL.orderbook * 1000)
        });
      }

      console.log(`📊 Cached order book for contract: ${contractAddress}`);
      return true;
    } catch (error) {
      console.error('❌ Error caching order book:', error);
      return false;
    }
  }

  /**
   * Recupera order book do cache
   */
  async getOrderBook(contractAddress) {
    try {
      const key = `orderbook:${contractAddress}`;

      if (this.redis.isConnected) {
        const data = await this.redis.client.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Fallback em memória
        const cached = this.redis.memoryFallback.get(key);
        if (cached && cached.expiry > Date.now()) {
          return JSON.parse(cached.data);
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting order book from cache:', error);
      return null;
    }
  }

  // ===================== SORTED SETS FOR PRICE-ORDERED MATCHING =====================

  /**
   * Cache ordens de compra ordenadas por preço (maior primeiro - ZREVRANGE)
   */
  async cacheBuyOrdersByPrice(contractAddress, orders) {
    try {
      const key = `buy_orders:${contractAddress}`;

      if (!this.redis.isConnected) {
        console.log('⚠️ Redis not connected, skipping sorted set cache');
        return true; // Return true para não falhar o processo
      }


      // Pipeline para operações atômicas
      const pipeline = this.redis.client.multi();

      // Limpar sorted set existente
      pipeline.del(key);

      // Adicionar ordens ordenadas por preço (score = preço)
      // Para buy orders: maior preço = prioridade maior
      orders.forEach((order, index) => {
        try {
          let score;

          // Handle different price formats
          if (typeof order.price === 'string') {
            score = parseFloat(order.price);
          } else if (order.price && typeof order.price.toNumber === 'function') {
            score = order.price.toNumber();
          } else if (order.price && typeof order.price.toString === 'function') {
            score = parseFloat(order.price.toString());
          } else {
            score = parseFloat(order.price);
          }

          // Validar score antes de adicionar
          if (isNaN(score) || score === undefined || score === null || !isFinite(score)) {
            console.warn(`⚠️ Invalid score for buy order ${order.id}: ${order.price} (score: ${score}, type: ${typeof order.price})`);
            return; // Skip esta ordem
          }

          // Criar member object sem propriedades problemáticas
          const memberData = {
            id: order.id,
            blockchainOrderId: order.blockchainOrderId,
            userAddress: order.userAddress,
            exchangeContractAddress: order.exchangeContractAddress,
            orderType: order.orderType,
            orderSide: order.orderSide,
            tokenASymbol: order.tokenASymbol,
            tokenBSymbol: order.tokenBSymbol,
            price: score,
            amount: order.amount?.toString() || order.amount,
            remainingAmount: order.remainingAmount?.toString() || order.remainingAmount,
            filledAmount: order.filledAmount?.toString() || order.filledAmount,
            status: order.status,
            transactionHash: order.transactionHash,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            timestamp: order.createdAt || new Date().toISOString()
          };

          const member = JSON.stringify(memberData);


          // Usar sintaxe para Redis 4.x: ZADD key {score: member}
          pipeline.ZADD(key, { score: score, value: member });
        } catch (error) {
          console.error(`❌ Error processing buy order ${order.id}:`, error);
          console.error(`Order data:`, JSON.stringify(order, null, 2));
        }
      });

      // Set TTL
      pipeline.expire(key, this.defaultTTL.orders);

      await pipeline.exec();

      console.log(`🟢 Cached ${orders.length} buy orders for ${contractAddress}`);
      return true;
    } catch (error) {
      console.error('❌ Error caching buy orders:', error);
      return false;
    }
  }

  /**
   * Cache ordens de venda ordenadas por preço (menor primeiro - ZRANGE)
   */
  async cacheSellOrdersByPrice(contractAddress, orders) {
    try {
      const key = `sell_orders:${contractAddress}`;

      if (!this.redis.isConnected) {
        console.log('⚠️ Redis not connected, skipping sorted set cache');
        return true; // Return true para não falhar o processo
      }


      const pipeline = this.redis.client.multi();

      pipeline.del(key);

      // Para sell orders: menor preço = prioridade maior (score invertido ou usar ZRANGE)
      orders.forEach((order, index) => {
        try {
          let score;

          // Handle different price formats
          if (typeof order.price === 'string') {
            score = parseFloat(order.price);
          } else if (order.price && typeof order.price.toNumber === 'function') {
            score = order.price.toNumber();
          } else if (order.price && typeof order.price.toString === 'function') {
            score = parseFloat(order.price.toString());
          } else {
            score = parseFloat(order.price);
          }

          // Validar score antes de adicionar
          if (isNaN(score) || score === undefined || score === null || !isFinite(score)) {
            console.warn(`⚠️ Invalid score for sell order ${order.id}: ${order.price} (score: ${score}, type: ${typeof order.price})`);
            return; // Skip esta ordem
          }

          // Criar member object sem propriedades problemáticas
          const memberData = {
            id: order.id,
            blockchainOrderId: order.blockchainOrderId,
            userAddress: order.userAddress,
            exchangeContractAddress: order.exchangeContractAddress,
            orderType: order.orderType,
            orderSide: order.orderSide,
            tokenASymbol: order.tokenASymbol,
            tokenBSymbol: order.tokenBSymbol,
            price: score,
            amount: order.amount?.toString() || order.amount,
            remainingAmount: order.remainingAmount?.toString() || order.remainingAmount,
            filledAmount: order.filledAmount?.toString() || order.filledAmount,
            status: order.status,
            transactionHash: order.transactionHash,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            timestamp: order.createdAt || new Date().toISOString()
          };

          const member = JSON.stringify(memberData);


          // Usar sintaxe para Redis 4.x: ZADD key {score: member}
          pipeline.ZADD(key, { score: score, value: member });
        } catch (error) {
          console.error(`❌ Error processing sell order ${order.id}:`, error);
          console.error(`Order data:`, JSON.stringify(order, null, 2));
        }
      });

      pipeline.expire(key, this.defaultTTL.orders);

      await pipeline.exec();

      console.log(`🔴 Cached ${orders.length} sell orders for ${contractAddress}`);
      return true;
    } catch (error) {
      console.error('❌ Error caching sell orders:', error);
      return false;
    }
  }

  // ===================== FAST COMPATIBLE ORDER LOOKUP =====================

  /**
   * Busca rápida de ordens de compra compatíveis
   * Para matching com ordem de venda: buscar buy orders com preço >= minPrice
   */
  async findCompatibleBuyOrders(contractAddress, minPrice, limit = 10) {
    try {
      const key = `buy_orders:${contractAddress}`;

      if (!this.redis.isConnected) {
        return [];
      }

      // ZREVRANGEBYSCORE: buscar ordens com score >= minPrice em ordem decrescente
      // Isso retorna buy orders ordenadas do maior preço para o menor
      const orders = await this.redis.client.ZREVRANGEBYSCORE(
        key,
        '+inf',      // score máximo
        minPrice,    // score mínimo
        'LIMIT', 0, limit
      );

      return orders.map(order => JSON.parse(order));
    } catch (error) {
      console.error('❌ Error finding compatible buy orders:', error);
      return [];
    }
  }

  /**
   * Busca rápida de ordens de venda compatíveis
   * Para matching com ordem de compra: buscar sell orders com preço <= maxPrice
   */
  async findCompatibleSellOrders(contractAddress, maxPrice, limit = 10) {
    try {
      const key = `sell_orders:${contractAddress}`;

      if (!this.redis.isConnected) {
        return [];
      }

      // ZRANGEBYSCORE: buscar ordens com score <= maxPrice em ordem crescente
      // Isso retorna sell orders ordenadas do menor preço para o maior
      const orders = await this.redis.client.ZRANGEBYSCORE(
        key,
        0,           // score mínimo
        maxPrice,    // score máximo
        'LIMIT', 0, limit
      );

      return orders.map(order => JSON.parse(order));
    } catch (error) {
      console.error('❌ Error finding compatible sell orders:', error);
      return [];
    }
  }

  // ===================== ORDER BOOK UPDATES =====================

  /**
   * Atualiza uma ordem específica no cache
   */
  async updateOrderInCache(contractAddress, order) {
    try {
      const buyKey = `buy_orders:${contractAddress}`;
      const sellKey = `sell_orders:${contractAddress}`;

      if (!this.redis.isConnected) {
        return false;
      }

      const orderData = JSON.stringify({
        ...order,
        timestamp: order.createdAt || new Date().toISOString()
      });

      const score = parseFloat(order.price);

      // Validar score antes de atualizar
      if (isNaN(score) || score === undefined || score === null || !isFinite(score)) {
        console.warn(`⚠️ Invalid score for order ${order.id}: ${order.price} (score: ${score})`);
        return false;
      }

      if (order.orderType === 'BUY') {
        // Atualizar/adicionar na sorted set de buy orders
        await this.redis.client.ZADD(buyKey, { score: score, value: orderData });
        await this.redis.client.expire(buyKey, this.defaultTTL.orders);
      } else {
        // Atualizar/adicionar na sorted set de sell orders
        await this.redis.client.ZADD(sellKey, { score: score, value: orderData });
        await this.redis.client.expire(sellKey, this.defaultTTL.orders);
      }

      console.log(`🔄 Updated ${order.orderType} order ${order.id} in cache`);
      return true;
    } catch (error) {
      console.error('❌ Error updating order in cache:', error);
      return false;
    }
  }

  /**
   * Remove uma ordem específica do cache
   */
  async removeOrderFromCache(contractAddress, order) {
    try {
      const buyKey = `buy_orders:${contractAddress}`;
      const sellKey = `sell_orders:${contractAddress}`;

      if (!this.redis.isConnected) {
        return false;
      }

      const orderData = JSON.stringify({
        ...order,
        timestamp: order.createdAt || new Date().toISOString()
      });

      if (order.orderType === 'BUY') {
        await this.redis.client.ZREM(buyKey, orderData);
      } else {
        await this.redis.client.ZREM(sellKey, orderData);
      }

      console.log(`🗑️ Removed ${order.orderType} order ${order.id} from cache`);
      return true;
    } catch (error) {
      console.error('❌ Error removing order from cache:', error);
      return false;
    }
  }

  // ===================== USER ORDERS CACHE =====================

  /**
   * Cache ordens de um usuário específico
   */
  async cacheUserOrders(userAddress, contractAddress, orders) {
    try {
      const key = `user_orders:${userAddress}:${contractAddress}`;

      if (this.redis.isConnected) {
        await this.redis.client.setEx(key, this.defaultTTL.userOrders, JSON.stringify(orders));
      } else {
        this.redis.memoryFallback.set(key, {
          data: JSON.stringify(orders),
          expiry: Date.now() + (this.defaultTTL.userOrders * 1000)
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error caching user orders:', error);
      return false;
    }
  }

  /**
   * Recupera ordens de um usuário do cache
   */
  async getUserOrders(userAddress, contractAddress) {
    try {
      const key = `user_orders:${userAddress}:${contractAddress}`;

      if (this.redis.isConnected) {
        const data = await this.redis.client.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        const cached = this.redis.memoryFallback.get(key);
        if (cached && cached.expiry > Date.now()) {
          return JSON.parse(cached.data);
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user orders from cache:', error);
      return null;
    }
  }

  // ===================== STATISTICS AND MONITORING =====================

  /**
   * Cache estatísticas do order book
   */
  async cacheOrderBookStats(contractAddress, stats) {
    try {
      const key = `orderbook_stats:${contractAddress}`;

      const statsData = {
        ...stats,
        timestamp: new Date().toISOString(),
        cachedAt: Date.now()
      };

      if (this.redis.isConnected) {
        await this.redis.client.setEx(key, this.defaultTTL.stats, JSON.stringify(statsData));
      } else {
        this.redis.memoryFallback.set(key, {
          data: JSON.stringify(statsData),
          expiry: Date.now() + (this.defaultTTL.stats * 1000)
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error caching order book stats:', error);
      return false;
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats(contractAddress) {
    try {
      if (!this.redis.isConnected) {
        return { connected: false };
      }

      const buyKey = `buy_orders:${contractAddress}`;
      const sellKey = `sell_orders:${contractAddress}`;
      const orderBookKey = `orderbook:${contractAddress}`;

      const pipeline = this.redis.client.multi();
      pipeline.ZCARD(buyKey);     // Quantidade de buy orders
      pipeline.ZCARD(sellKey);    // Quantidade de sell orders
      pipeline.TTL(orderBookKey); // TTL do order book

      const results = await pipeline.exec();

      return {
        connected: true,
        contractAddress,
        buyOrdersCount: results[0][1] || 0,
        sellOrdersCount: results[1][1] || 0,
        orderBookTTL: results[2][1] || -1,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return { connected: false, error: error.message };
    }
  }

  // ===================== CACHE MANAGEMENT =====================

  /**
   * Limpa cache de um contrato específico
   */
  async clearContractCache(contractAddress) {
    try {
      if (!this.redis.isConnected) {
        return false;
      }

      const keys = [
        `orderbook:${contractAddress}`,
        `buy_orders:${contractAddress}`,
        `sell_orders:${contractAddress}`,
        `orderbook_stats:${contractAddress}`,
        `user_orders:*:${contractAddress}`
      ];

      const pipeline = this.redis.client.multi();
      keys.forEach(key => {
        if (key.includes('*')) {
          // Para padrões com wildcard, precisamos buscar as chaves primeiro
          // Por simplicidade, vamos fazer uma busca direta
        } else {
          pipeline.del(key);
        }
      });

      await pipeline.exec();

      console.log(`🧹 Cleared cache for contract: ${contractAddress}`);
      return true;
    } catch (error) {
      console.error('❌ Error clearing contract cache:', error);
      return false;
    }
  }

  /**
   * Invalida cache do order book para um contrato específico
   * (Alias para clearContractCache para compatibilidade)
   */
  async invalidateOrderBook(contractAddress) {
    return await this.clearContractCache(contractAddress);
  }

  /**
   * Health check do cache
   */
  async healthCheck() {
    try {
      if (!this.redis.isConnected) {
        return { healthy: false, error: 'Redis not connected' };
      }

      // Teste simples de operação
      const testKey = `health_check:${Date.now()}`;
      await this.redis.client.setEx(testKey, 1, 'test');
      const testValue = await this.redis.client.get(testKey);
      await this.redis.client.del(testKey);

      return {
        healthy: testValue === 'test',
        connected: this.redis.isConnected,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        connected: false
      };
    }
  }
}

// Export singleton instance
module.exports = new RedisOrderBookCache();
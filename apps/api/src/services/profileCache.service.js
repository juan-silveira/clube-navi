/**
 * Profile Cache Service
 * Gerencia cache de dados de perfil no Redis
 */

const redisService = require('./redis.service');

class ProfileCacheService {
  constructor() {
    this.keyPrefix = 'profile:photo:';
    this.ttl = 3600; // 1 hora de cache por padrão
  }

  /**
   * Gera a chave do cache para foto de perfil
   */
  getPhotoKey(userId) {
    return `${this.keyPrefix}${userId}`;
  }

  /**
   * Busca URL da foto no cache
   */
  async getCachedPhotoUrl(userId) {
    try {
      // Garantir que Redis está inicializado
      if (!redisService.client) {
        await redisService.initialize();
      }

      const key = this.getPhotoKey(userId);
      
      if (redisService.isConnected && redisService.client) {
        const cached = await redisService.client.get(key);
        
        if (cached) {
          console.log(`📦 [ProfileCache] Foto encontrada no cache para usuário ${userId}`);
          return JSON.parse(cached);
        }
      } else {
        // Usar fallback de memória
        const fallback = redisService.memoryFallback.get(key);
        if (fallback && fallback.expiry > Date.now()) {
          console.log(`📦 [ProfileCache] Foto encontrada no cache de memória para usuário ${userId}`);
          return JSON.parse(fallback.data);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ [ProfileCache] Erro ao buscar do cache:', error);
      return null;
    }
  }

  /**
   * Armazena URL da foto no cache
   */
  async setCachedPhotoUrl(userId, photoData) {
    try {
      // Garantir que Redis está inicializado
      if (!redisService.client) {
        await redisService.initialize();
      }

      const key = this.getPhotoKey(userId);
      const data = JSON.stringify(photoData);
      
      if (redisService.isConnected && redisService.client) {
        await redisService.client.setEx(key, this.ttl, data);
        console.log(`💾 [ProfileCache] Foto armazenada no cache Redis para usuário ${userId}`);
      } else {
        // Usar fallback de memória
        redisService.memoryFallback.set(key, {
          data,
          expiry: Date.now() + (this.ttl * 1000)
        });
        console.log(`💾 [ProfileCache] Foto armazenada no cache de memória para usuário ${userId}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ [ProfileCache] Erro ao salvar no cache:', error);
      return false;
    }
  }

  /**
   * Invalida cache da foto
   */
  async invalidatePhotoCache(userId) {
    try {
      const key = this.getPhotoKey(userId);
      
      if (redisService.isConnected && redisService.client) {
        await redisService.client.del(key);
      } else {
        // Remover do fallback de memória
        redisService.memoryFallback.delete(key);
      }
      
      console.log(`🗑️ [ProfileCache] Cache invalidado para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ [ProfileCache] Erro ao invalidar cache:', error);
      return false;
    }
  }

  /**
   * Busca múltiplas fotos do cache
   */
  async getMultipleCachedPhotos(userIds) {
    try {
      if (!redisService.client) {
        await redisService.initialize();
      }

      const photos = {};
      
      if (redisService.isConnected && redisService.client) {
        const keys = userIds.map(id => this.getPhotoKey(id));
        const results = await redisService.client.mGet(keys);
        
        userIds.forEach((userId, index) => {
          if (results[index]) {
            photos[userId] = JSON.parse(results[index]);
          }
        });
      } else {
        // Usar fallback de memória
        userIds.forEach(userId => {
          const key = this.getPhotoKey(userId);
          const fallback = redisService.memoryFallback.get(key);
          if (fallback && fallback.expiry > Date.now()) {
            photos[userId] = JSON.parse(fallback.data);
          }
        });
      }
      
      return photos;
    } catch (error) {
      console.error('❌ [ProfileCache] Erro ao buscar múltiplas fotos:', error);
      return {};
    }
  }

  /**
   * Define TTL customizado para o cache
   */
  setTTL(seconds) {
    this.ttl = seconds;
  }

  /**
   * Verifica se o cache existe
   */
  async hasCache(userId) {
    try {
      const key = this.getPhotoKey(userId);
      
      if (redisService.isConnected && redisService.client) {
        const exists = await redisService.client.exists(key);
        return exists === 1;
      } else {
        // Verificar no fallback de memória
        const fallback = redisService.memoryFallback.get(key);
        return fallback && fallback.expiry > Date.now();
      }
    } catch (error) {
      console.error('❌ [ProfileCache] Erro ao verificar cache:', error);
      return false;
    }
  }

  /**
   * Obtém informações sobre o cache
   */
  async getCacheInfo(userId) {
    try {
      const key = this.getPhotoKey(userId);
      
      if (redisService.isConnected && redisService.client) {
        const ttl = await redisService.client.ttl(key);
        const exists = ttl > 0;
        
        return {
          exists,
          ttl,
          key
        };
      } else {
        // Verificar no fallback de memória
        const fallback = redisService.memoryFallback.get(key);
        const exists = fallback && fallback.expiry > Date.now();
        const ttl = exists ? Math.floor((fallback.expiry - Date.now()) / 1000) : -1;
        
        return {
          exists,
          ttl,
          key
        };
      }
    } catch (error) {
      console.error('❌ [ProfileCache] Erro ao obter info do cache:', error);
      return { exists: false, ttl: -1, key: null };
    }
  }

  /**
   * Limpa todo o cache de fotos
   */
  async clearAllPhotoCache() {
    try {
      const pattern = `${this.keyPrefix}*`;
      
      if (redisService.isConnected && redisService.client) {
        const keys = await redisService.client.keys(pattern);
        
        if (keys.length > 0) {
          await redisService.client.del(keys);
          console.log(`🧹 [ProfileCache] ${keys.length} fotos removidas do cache Redis`);
        }
        
        return keys.length;
      } else {
        // Limpar fallback de memória
        let count = 0;
        for (const [key] of redisService.memoryFallback.entries()) {
          if (key.startsWith(this.keyPrefix)) {
            redisService.memoryFallback.delete(key);
            count++;
          }
        }
        console.log(`🧹 [ProfileCache] ${count} fotos removidas do cache de memória`);
        return count;
      }
    } catch (error) {
      console.error('❌ [ProfileCache] Erro ao limpar cache:', error);
      return 0;
    }
  }
}

module.exports = new ProfileCacheService();
const Redis = require('ioredis');

class SecureRedisManager {
    constructor() {
        this.connections = new Map();
        this.config = {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || null,
            db: 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            keepAlive: 30000,
            // Configurações de segurança
            enableOfflineQueue: false,
            connectTimeout: 10000,
            commandTimeout: 5000
        };
    }

    // Criar conexão isolada por namespace
    createConnection(namespace) {
        if (this.connections.has(namespace)) {
            return this.connections.get(namespace);
        }

        const connection = new Redis({
            ...this.config,
            keyPrefix: `club:${namespace}:`,
            // Isolamento por database para namespaces críticos
            db: this.getDbForNamespace(namespace)
        });

        // Event handlers para logging e monitoramento
        connection.on('connect', () => {
            console.log(`✅ Redis connected for namespace: ${namespace}`);
        });

        connection.on('error', (error) => {
            console.error(`❌ Redis error for namespace ${namespace}:`, error);
        });

        connection.on('close', () => {
            console.log(`🔌 Redis connection closed for namespace: ${namespace}`);
        });

        // Auto-cleanup de chaves expiradas
        this.setupAutoCleanup(connection, namespace);

        this.connections.set(namespace, connection);
        return connection;
    }

    // Determinar database baseado no namespace para isolamento
    getDbForNamespace(namespace) {
        const namespaceMap = {
            'exchange': 1,
            'user_sessions': 2,
            'user_cache': 3,
            'blockchain_cache': 4,
            'matching_engine': 5,
            'notifications': 6,
            'rate_limiting': 7,
            'temp_data': 8
        };

        return namespaceMap[namespace] || 0;
    }

    // Configurar limpeza automática de dados expirados
    setupAutoCleanup(connection, namespace) {
        setInterval(async () => {
            try {
                // Limpar chaves expiradas específicas do namespace
                const expiredKeys = await connection.keys(`club:${namespace}:temp:*`);
                if (expiredKeys.length > 0) {
                    const pipeline = connection.pipeline();
                    expiredKeys.forEach(key => {
                        pipeline.del(key.replace(`club:${namespace}:`, ''));
                    });
                    await pipeline.exec();
                }
            } catch (error) {
                console.error(`Cleanup error for ${namespace}:`, error);
            }
        }, 300000); // 5 minutos
    }

    // Métodos seguros com TTL automático
    async setSecure(namespace, key, value, ttl = 3600) {
        const connection = this.createConnection(namespace);
        const serializedValue = JSON.stringify({
            data: value,
            timestamp: Date.now(),
            namespace: namespace
        });

        return await connection.setex(key, ttl, serializedValue);
    }

    async getSecure(namespace, key) {
        const connection = this.createConnection(namespace);
        const value = await connection.get(key);

        if (!value) return null;

        try {
            const parsed = JSON.parse(value);

            // Verificar se é do namespace correto
            if (parsed.namespace !== namespace) {
                console.warn(`⚠️ Namespace mismatch: expected ${namespace}, got ${parsed.namespace}`);
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.error('Error parsing Redis value:', error);
            return null;
        }
    }

    // Cache específico para usuário com isolamento total
    async setUserCache(userId, key, value, ttl = 1800) {
        const namespace = `user_cache`;
        const userKey = `user:${userId}:${key}`;
        return await this.setSecure(namespace, userKey, value, ttl);
    }

    async getUserCache(userId, key) {
        const namespace = `user_cache`;
        const userKey = `user:${userId}:${key}`;
        return await this.getSecure(namespace, userKey);
    }

    // Cache para dados de blockchain
    async setBlockchainCache(contractAddress, key, value, ttl = 300) {
        const namespace = `blockchain_cache`;
        const blockchainKey = `contract:${contractAddress}:${key}`;
        return await this.setSecure(namespace, blockchainKey, value, ttl);
    }

    async getBlockchainCache(contractAddress, key) {
        const namespace = `blockchain_cache`;
        const blockchainKey = `contract:${contractAddress}:${key}`;
        return await this.getSecure(namespace, blockchainKey);
    }

    // Limpar todos os dados de um usuário (GDPR compliance)
    async clearUserData(userId) {
        const connection = this.createConnection('user_cache');
        const userKeys = await connection.keys(`user:${userId}:*`);

        if (userKeys.length > 0) {
            const pipeline = connection.pipeline();
            userKeys.forEach(key => {
                pipeline.del(key.replace('club:user_cache:', ''));
            });
            await pipeline.exec();
        }

        console.log(`🗑️ Cleared ${userKeys.length} keys for user ${userId}`);
    }

    // Rate limiting seguro
    async checkRateLimit(namespace, identifier, limit, window) {
        const connection = this.createConnection('rate_limiting');
        const key = `rate:${namespace}:${identifier}`;

        const pipeline = connection.pipeline();
        pipeline.incr(key);
        pipeline.expire(key, window);

        const results = await pipeline.exec();
        const count = results[0][1];

        return {
            allowed: count <= limit,
            count: count,
            remaining: Math.max(0, limit - count),
            resetTime: Date.now() + (window * 1000)
        };
    }

    // Fechar todas as conexões
    async closeAll() {
        for (const [namespace, connection] of this.connections) {
            await connection.quit();
            console.log(`🔌 Closed Redis connection for namespace: ${namespace}`);
        }
        this.connections.clear();
    }

    // Health check
    async healthCheck() {
        const results = {};

        for (const [namespace, connection] of this.connections) {
            try {
                await connection.ping();
                results[namespace] = 'healthy';
            } catch (error) {
                results[namespace] = 'unhealthy';
                console.error(`Health check failed for ${namespace}:`, error);
            }
        }

        return results;
    }
}

module.exports = new SecureRedisManager();
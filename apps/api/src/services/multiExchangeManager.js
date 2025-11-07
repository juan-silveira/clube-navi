const ExchangeEventListener = require('./exchangeEventListener');
const SecureMatchingEngine = require('./secureMatchingEngine');
const rabbitMQ = require('../config/rabbitmq.config');
const redisManager = require('../config/redis.config');
const db = require('../config/database');

class MultiExchangeManager {
    constructor() {
        this.listeners = new Map();
        this.matchingEngines = new Map();
        this.isRunning = false;
        this.healthCheckInterval = null;
        this.metricsInterval = null;

        // Configurações de segurança
        this.security = {
            maxConcurrentExchanges: 20,
            maxOrdersPerSecond: 100,
            rateLimitWindow: 60000, // 1 minuto
            allowedOperators: new Set()
        };

        // Métricas globais
        this.globalMetrics = {
            totalExchanges: 0,
            activeExchanges: 0,
            totalOrdersProcessed: 0,
            totalMatchesExecuted: 0,
            systemUptime: 0,
            lastHealthCheck: 0
        };

        // Load balancing para providers RPC
        this.rpcProviders = [
            process.env.RPC_URL_PRIMARY,
            process.env.RPC_URL_SECONDARY,
            process.env.RPC_URL_TERTIARY
        ].filter(Boolean);
        this.currentProviderIndex = 0;
    }

    async initialize() {
        console.log('🚀 Initializing MultiExchangeManager...');

        try {
            // 1. Conectar RabbitMQ
            const rabbitConnected = await rabbitMQ.connect();
            if (!rabbitConnected) {
                throw new Error('Failed to connect to RabbitMQ');
            }

            // 2. Verificar Redis
            const redisHealth = await redisManager.healthCheck();
            if (Object.values(redisHealth).includes('unhealthy')) {
                throw new Error('Redis health check failed');
            }

            // 3. Carregar configurações de segurança
            await this.loadSecurityConfig();

            // 4. Carregar exchanges ativos do banco
            await this.loadActiveExchanges();

            // 5. Inicializar monitoramento
            await this.startHealthChecking();
            await this.startMetricsCollection();

            // 6. Configurar handlers de sistema
            await this.setupSystemHandlers();

            this.isRunning = true;
            this.globalMetrics.systemUptime = Date.now();

            console.log(`✅ MultiExchangeManager initialized with ${this.listeners.size} exchanges`);
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize MultiExchangeManager:', error);
            return false;
        }
    }

    async loadSecurityConfig() {
        try {
            const config = await redisManager.getSecure('system', 'security_config');

            if (config) {
                this.security = { ...this.security, ...config };
                console.log('📋 Security configuration loaded');
            }

            // Carregar operadores autorizados do banco
            const operatorsQuery = `
                SELECT wallet_address FROM authorized_operators
                WHERE is_active = true
            `;

            const result = await db.query(operatorsQuery);
            result.rows.forEach(row => {
                this.security.allowedOperators.add(row.wallet_address.toLowerCase());
            });

            console.log(`🔐 Loaded ${this.security.allowedOperators.size} authorized operators`);

        } catch (error) {
            console.error('Error loading security config:', error);
        }
    }

    async loadActiveExchanges() {
        try {
            const query = `
                SELECT
                    sc.contract_address,
                    sc.abi,
                    sc.metadata,
                    tp.pair,
                    tp.token_a_address,
                    tp.token_b_address
                FROM smart_contracts sc
                JOIN trading_pairs tp ON sc.contract_address = tp.exchange_contract_address
                WHERE sc.contract_type = 'exchange'
                    AND sc.is_active = true
                    AND tp.is_active = true
            `;

            const result = await db.query(query);

            console.log(`📊 Found ${result.rows.length} active exchanges to monitor`);

            // Processar cada exchange em paralelo, mas com limite
            const batches = this.chunkArray(result.rows, 5); // 5 exchanges por batch

            for (const batch of batches) {
                await Promise.all(batch.map(exchange => this.addExchange(exchange)));

                // Delay entre batches para evitar sobrecarga
                await this.sleep(2000);
            }

            this.globalMetrics.totalExchanges = result.rows.length;
            this.globalMetrics.activeExchanges = this.listeners.size;

        } catch (error) {
            console.error('❌ Error loading active exchanges:', error);
        }
    }

    async addExchange(exchangeData) {
        const contractAddress = exchangeData.contract_address.toLowerCase();

        try {
            // Verificar limite de exchanges simultâneos
            if (this.listeners.size >= this.security.maxConcurrentExchanges) {
                console.warn(`⚠️ Max concurrent exchanges reached (${this.security.maxConcurrentExchanges})`);
                return false;
            }

            // Verificar se já está sendo monitorado
            if (this.listeners.has(contractAddress)) {
                console.log(`ℹ️ Exchange ${contractAddress} already being monitored`);
                return true;
            }

            console.log(`🔧 Adding exchange ${contractAddress} (${exchangeData.pair})`);

            // Obter provider com load balancing
            const providerUrl = this.getNextProvider();

            // 1. Criar Event Listener
            const listener = new ExchangeEventListener(
                contractAddress,
                JSON.parse(exchangeData.abi),
                providerUrl
            );

            await listener.startListening();
            this.listeners.set(contractAddress, listener);

            // 2. Criar Matching Engine (apenas se há chave privada autorizada)
            const operatorKey = await this.getOperatorKey(contractAddress);
            if (operatorKey) {
                const matchingEngine = new SecureMatchingEngine(
                    contractAddress,
                    JSON.parse(exchangeData.abi),
                    operatorKey
                );

                const initialized = await matchingEngine.initialize();
                if (initialized) {
                    this.matchingEngines.set(contractAddress, matchingEngine);
                    console.log(`✅ Matching engine initialized for ${contractAddress}`);
                } else {
                    console.warn(`⚠️ Failed to initialize matching engine for ${contractAddress}`);
                }
            } else {
                console.log(`ℹ️ No operator key found for ${contractAddress}, monitoring only`);
            }

            // 3. Cache informações do exchange
            await redisManager.setBlockchainCache(
                contractAddress,
                'exchange_info',
                {
                    pair: exchangeData.pair,
                    tokenA: exchangeData.token_a_address,
                    tokenB: exchangeData.token_b_address,
                    metadata: exchangeData.metadata,
                    addedAt: Date.now(),
                    status: 'active'
                },
                86400 // 24 horas
            );

            console.log(`✅ Successfully added exchange ${contractAddress}`);
            return true;

        } catch (error) {
            console.error(`❌ Error adding exchange ${contractAddress}:`, error);

            // Cleanup em caso de erro
            this.listeners.delete(contractAddress);
            this.matchingEngines.delete(contractAddress);

            return false;
        }
    }

    async removeExchange(contractAddress) {
        contractAddress = contractAddress.toLowerCase();

        console.log(`🗑️ Removing exchange ${contractAddress}`);

        try {
            // 1. Parar Event Listener
            const listener = this.listeners.get(contractAddress);
            if (listener) {
                await listener.stopListening();
                this.listeners.delete(contractAddress);
            }

            // 2. Parar Matching Engine
            const matchingEngine = this.matchingEngines.get(contractAddress);
            if (matchingEngine) {
                await matchingEngine.shutdown();
                this.matchingEngines.delete(contractAddress);
            }

            // 3. Limpar cache
            const cacheKeys = await redisManager.createConnection('blockchain_cache')
                .keys(`contract:${contractAddress}:*`);

            if (cacheKeys.length > 0) {
                const pipeline = redisManager.createConnection('blockchain_cache').pipeline();
                cacheKeys.forEach(key => {
                    pipeline.del(key.replace('club:blockchain_cache:', ''));
                });
                await pipeline.exec();
            }

            console.log(`✅ Successfully removed exchange ${contractAddress}`);
            return true;

        } catch (error) {
            console.error(`❌ Error removing exchange ${contractAddress}:`, error);
            return false;
        }
    }

    async getOperatorKey(contractAddress) {
        try {
            // Buscar chave do operador autorizado para este contrato
            const query = `
                SELECT private_key FROM exchange_operators
                WHERE contract_address = $1
                    AND is_active = true
                ORDER BY created_at DESC
                LIMIT 1
            `;

            const result = await db.query(query, [contractAddress]);

            if (result.rows.length > 0) {
                // Descriptografar chave (implementar criptografia adequada)
                return this.decryptOperatorKey(result.rows[0].private_key);
            }

            return null;
        } catch (error) {
            console.error(`Error getting operator key for ${contractAddress}:`, error);
            return null;
        }
    }

    decryptOperatorKey(encryptedKey) {
        // TODO: Implementar descriptografia segura
        // Por agora, assumindo que está em texto plano (apenas para desenvolvimento)
        return encryptedKey;
    }

    getNextProvider() {
        const provider = this.rpcProviders[this.currentProviderIndex];
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.rpcProviders.length;
        return provider;
    }

    async startHealthChecking() {
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, 30000); // A cada 30 segundos

        console.log('🏥 Health checking started');
    }

    async performHealthCheck() {
        const healthData = {
            timestamp: Date.now(),
            rabbitMQ: await rabbitMQ.healthCheck(),
            redis: await redisManager.healthCheck(),
            exchanges: {},
            system: {
                uptime: Date.now() - this.globalMetrics.systemUptime,
                memoryUsage: process.memoryUsage(),
                activeExchanges: this.listeners.size,
                activeMatchers: this.matchingEngines.size
            }
        };

        // Verificar health de cada exchange
        for (const [contractAddress, listener] of this.listeners) {
            try {
                const status = await listener.getStatus();
                healthData.exchanges[contractAddress] = status;

                // Se exchange não está saudável, tentar reconectar
                if (!status.isListening) {
                    console.warn(`⚠️ Exchange ${contractAddress} is not listening, attempting reconnect`);
                    await listener.reconnect();
                }
            } catch (error) {
                healthData.exchanges[contractAddress] = {
                    status: 'error',
                    error: error.message
                };
            }
        }

        // Salvar health check
        await redisManager.setSecure('system', 'health_check', healthData, 300);
        this.globalMetrics.lastHealthCheck = Date.now();

        // Alertar se há problemas críticos
        await this.checkCriticalIssues(healthData);
    }

    async checkCriticalIssues(healthData) {
        const issues = [];

        // Verificar RabbitMQ
        if (healthData.rabbitMQ.status === 'unhealthy') {
            issues.push('RabbitMQ connection failed');
        }

        // Verificar Redis
        if (Object.values(healthData.redis).includes('unhealthy')) {
            issues.push('Redis connection issues');
        }

        // Verificar exchanges com problemas
        const failedExchanges = Object.entries(healthData.exchanges)
            .filter(([_, status]) => !status.isListening)
            .length;

        if (failedExchanges > 0) {
            issues.push(`${failedExchanges} exchanges are not listening`);
        }

        // Verificar uso de memória
        const memoryUsageMB = healthData.system.memoryUsage.heapUsed / 1024 / 1024;
        if (memoryUsageMB > 500) { // 500MB limit
            issues.push(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`);
        }

        if (issues.length > 0) {
            await this.sendCriticalAlert(issues);
        }
    }

    async sendCriticalAlert(issues) {
        const alertData = {
            type: 'CRITICAL',
            service: 'MultiExchangeManager',
            issues,
            timestamp: Date.now(),
            metrics: this.globalMetrics
        };

        await redisManager.setSecure('alerts',
            `critical_alert:${Date.now()}`,
            alertData,
            86400
        );

        console.log(`🚨 CRITICAL ALERT: ${issues.join(', ')}`);
    }

    async startMetricsCollection() {
        this.metricsInterval = setInterval(async () => {
            await this.collectMetrics();
        }, 60000); // A cada minuto

        console.log('📊 Metrics collection started');
    }

    async collectMetrics() {
        const metrics = {
            timestamp: Date.now(),
            global: this.globalMetrics,
            exchanges: {},
            aggregated: {
                totalOrdersLastMinute: 0,
                totalMatchesLastMinute: 0,
                averageMatchTime: 0,
                successRate: 0
            }
        };

        let totalMatches = 0;
        let totalMatchTime = 0;
        let successfulMatches = 0;

        // Coletar métricas de cada matching engine
        for (const [contractAddress, engine] of this.matchingEngines) {
            try {
                const engineMetrics = await engine.getMetrics();
                metrics.exchanges[contractAddress] = engineMetrics;

                totalMatches += engineMetrics.totalMatches;
                totalMatchTime += engineMetrics.averageMatchTime;
                successfulMatches += engineMetrics.successfulMatches;
            } catch (error) {
                console.error(`Error collecting metrics for ${contractAddress}:`, error);
            }
        }

        // Calcular métricas agregadas
        if (totalMatches > 0) {
            metrics.aggregated.averageMatchTime = totalMatchTime / this.matchingEngines.size;
            metrics.aggregated.successRate = (successfulMatches / totalMatches) * 100;
        }

        // Salvar métricas
        await redisManager.setSecure('metrics', 'global_metrics', metrics, 3600);

        // Atualizar métricas globais
        this.globalMetrics.totalMatchesExecuted = totalMatches;
    }

    async setupSystemHandlers() {
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('📤 Received SIGTERM, shutting down gracefully...');
            await this.shutdown();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('📤 Received SIGINT, shutting down gracefully...');
            await this.shutdown();
            process.exit(0);
        });

        // Error handlers
        process.on('uncaughtException', async (error) => {
            console.error('❌ Uncaught Exception:', error);
            await this.sendCriticalAlert([`Uncaught exception: ${error.message}`]);
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            await this.sendCriticalAlert([`Unhandled rejection: ${reason}`]);
        });
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getStatus() {
        const exchangeStatuses = {};

        for (const [contractAddress, listener] of this.listeners) {
            exchangeStatuses[contractAddress] = await listener.getStatus();
        }

        return {
            isRunning: this.isRunning,
            globalMetrics: this.globalMetrics,
            totalExchanges: this.listeners.size,
            totalMatchingEngines: this.matchingEngines.size,
            exchanges: exchangeStatuses,
            lastHealthCheck: this.globalMetrics.lastHealthCheck,
            uptime: Date.now() - this.globalMetrics.systemUptime
        };
    }

    async shutdown() {
        console.log('🛑 Shutting down MultiExchangeManager...');

        this.isRunning = false;

        // Parar intervalos
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }

        // Parar todos os listeners
        const listenerShutdowns = Array.from(this.listeners.values())
            .map(listener => listener.stopListening());

        await Promise.all(listenerShutdowns);

        // Parar todos os matching engines
        const engineShutdowns = Array.from(this.matchingEngines.values())
            .map(engine => engine.shutdown());

        await Promise.all(engineShutdowns);

        // Fechar conexões
        await rabbitMQ.close();
        await redisManager.closeAll();

        console.log('✅ MultiExchangeManager shutdown complete');
    }
}

module.exports = MultiExchangeManager;
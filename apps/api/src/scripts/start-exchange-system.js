#!/usr/bin/env node

const ExchangeCluster = require('../services/exchangeCluster');
const MonitoringService = require('../services/monitoringService');
const redisManager = require('../config/redis.config');

class ExchangeSystemStarter {
    constructor() {
        this.services = {
            cluster: null,
            monitoring: null
        };

        this.isShuttingDown = false;
    }

    async start() {
        console.log('🚀 Starting Clube Digital Exchange System...');
        console.log('=======================================');

        try {
            // 1. Verificar ambiente
            await this.verifyEnvironment();

            // 2. Inicializar monitoramento (em processo separado se for master)
            if (process.env.NODE_ENV === 'production') {
                await this.startMonitoringService();
            }

            // 3. Inicializar cluster principal
            await this.startExchangeCluster();

            // 4. Configurar handlers de sistema
            this.setupSystemHandlers();

            console.log('✅ Clube Digital Exchange System started successfully');
            console.log('=======================================');

            // Manter processo vivo
            this.keepAlive();

        } catch (error) {
            console.error('❌ Failed to start Clube Digital Exchange System:', error);
            process.exit(1);
        }
    }

    async verifyEnvironment() {
        console.log('🔍 Verifying environment...');

        // Verificar Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

        if (majorVersion < 16) {
            throw new Error(`Node.js 16+ required, current: ${nodeVersion}`);
        }

        // Verificar variáveis de ambiente obrigatórias
        const requiredEnvVars = [
            'NODE_ENV',
            'PORT',
            'DATABASE_URL',
            'REDIS_HOST',
            'RABBITMQ_URL',
            'RPC_URL',
            'JWT_SECRET'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        // Verificar conectividade básica
        try {
            const redisHealth = await redisManager.healthCheck();
            if (Object.values(redisHealth).includes('unhealthy')) {
                throw new Error('Redis connectivity check failed');
            }
        } catch (error) {
            throw new Error(`Redis verification failed: ${error.message}`);
        }

        console.log('✅ Environment verification passed');
    }

    async startMonitoringService() {
        console.log('📊 Starting monitoring service...');

        this.services.monitoring = new MonitoringService();
        const initialized = await this.services.monitoring.initialize();

        if (!initialized) {
            throw new Error('Failed to initialize MonitoringService');
        }

        console.log('✅ Monitoring service started');
    }

    async startExchangeCluster() {
        console.log('👥 Starting exchange cluster...');

        this.services.cluster = new ExchangeCluster();
        await this.services.cluster.start();

        console.log('✅ Exchange cluster started');
    }

    setupSystemHandlers() {
        // Graceful shutdown
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

        // Error handlers
        process.on('uncaughtException', async (error) => {
            console.error('❌ Uncaught Exception:', error);
            await this.emergencyShutdown();
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            await this.emergencyShutdown();
        });

        // Memory monitoring
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const memUsageMB = memUsage.heapUsed / 1024 / 1024;

            if (memUsageMB > 1000) { // 1GB warning
                console.warn(`⚠️ High memory usage: ${memUsageMB.toFixed(2)}MB`);
            }
        }, 60000); // Check every minute
    }

    async gracefulShutdown(signal) {
        if (this.isShuttingDown) {
            console.log('⚠️ Shutdown already in progress');
            return;
        }

        console.log(`📤 Received ${signal}, starting graceful shutdown...`);
        this.isShuttingDown = true;

        try {
            // Shutdown em ordem reversa
            if (this.services.cluster) {
                await this.services.cluster.gracefulShutdown(signal);
            }

            if (this.services.monitoring) {
                await this.services.monitoring.shutdown();
            }

            // Fechar conexões globais
            await redisManager.closeAll();

            console.log('✅ Graceful shutdown completed');
            process.exit(0);

        } catch (error) {
            console.error('❌ Error during graceful shutdown:', error);
            await this.emergencyShutdown();
        }
    }

    async emergencyShutdown() {
        console.log('🚨 Emergency shutdown initiated');

        try {
            // Tentar salvar estado crítico
            const criticalState = {
                timestamp: Date.now(),
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            };

            await redisManager.setSecure('emergency',
                `shutdown_${Date.now()}`,
                criticalState,
                3600
            );

        } catch (error) {
            console.error('Failed to save emergency state:', error);
        }

        // Aguardar um pouco e sair
        setTimeout(() => {
            process.exit(1);
        }, 3000);
    }

    keepAlive() {
        // Manter processo vivo e logar status periodicamente
        setInterval(() => {
            if (this.isShuttingDown) return;

            const status = {
                uptime: process.uptime(),
                memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
                timestamp: new Date().toISOString()
            };

            console.log(`💚 System healthy - Uptime: ${status.uptime}s, Memory: ${status.memory}MB`);
        }, 300000); // Log every 5 minutes
    }

    static async main() {
        const starter = new ExchangeSystemStarter();
        await starter.start();
    }
}

// Se executado diretamente, iniciar o sistema
if (require.main === module) {
    ExchangeSystemStarter.main().catch(error => {
        console.error('❌ Failed to start Exchange System:', error);
        process.exit(1);
    });
}

module.exports = ExchangeSystemStarter;
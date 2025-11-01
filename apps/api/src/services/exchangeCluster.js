const cluster = require('cluster');
const os = require('os');
const MultiExchangeManager = require('./multiExchangeManager');
const redisManager = require('../config/redis.config');

class ExchangeCluster {
    constructor() {
        this.workers = new Map();
        this.isShuttingDown = false;
        this.clusterConfig = {
            maxWorkers: process.env.MAX_WORKERS || os.cpus().length,
            workerTimeout: 30000,
            gracefulShutdownTimeout: 15000,
            healthCheckInterval: 10000,
            autoRestart: true
        };

        // Métricas do cluster
        this.clusterMetrics = {
            totalWorkers: 0,
            activeWorkers: 0,
            restartedWorkers: 0,
            failedWorkers: 0,
            startTime: Date.now(),
            lastHealthCheck: 0
        };
    }

    async start() {
        if (cluster.isMaster) {
            await this.startMaster();
        } else {
            await this.startWorker();
        }
    }

    async startMaster() {
        console.log(`🎯 Starting Exchange Cluster Master (PID: ${process.pid})`);
        console.log(`💻 Available CPUs: ${os.cpus().length}`);
        console.log(`👥 Starting ${this.clusterConfig.maxWorkers} workers`);

        try {
            // 1. Verificar pré-requisitos
            await this.verifyPrerequisites();

            // 2. Configurar master process
            await this.setupMasterProcess();

            // 3. Iniciar workers
            await this.startWorkers();

            // 4. Configurar monitoramento
            await this.startClusterMonitoring();

            console.log(`✅ Exchange Cluster Master started successfully`);

        } catch (error) {
            console.error('❌ Failed to start Exchange Cluster Master:', error);
            process.exit(1);
        }
    }

    async verifyPrerequisites() {
        console.log('🔍 Verifying prerequisites...');

        // Verificar variáveis de ambiente
        const requiredEnvVars = [
            'RPC_URL',
            'DATABASE_URL',
            'REDIS_HOST',
            'RABBITMQ_URL'
        ];

        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Required environment variable ${envVar} is not set`);
            }
        }

        // Verificar conectividade Redis
        const redisHealth = await redisManager.healthCheck();
        if (Object.values(redisHealth).includes('unhealthy')) {
            throw new Error('Redis connectivity check failed');
        }

        console.log('✅ Prerequisites verified');
    }

    async setupMasterProcess() {
        // Configurar title do processo
        process.title = 'coinage-exchange-master';

        // Configurar event handlers
        cluster.setupMaster({
            exec: __filename,
            args: ['--worker'],
            silent: false
        });

        // Handler para workers que morrem
        cluster.on('exit', (worker, code, signal) => {
            console.log(`💀 Worker ${worker.process.pid} died (${signal || code})`);

            this.workers.delete(worker.id);
            this.clusterMetrics.failedWorkers++;

            // Auto-restart se não estamos fazendo shutdown
            if (!this.isShuttingDown && this.clusterConfig.autoRestart) {
                console.log(`🔄 Restarting worker...`);
                this.startSingleWorker();
                this.clusterMetrics.restartedWorkers++;
            }
        });

        // Handler para workers online
        cluster.on('online', (worker) => {
            console.log(`✅ Worker ${worker.process.pid} is online`);

            this.workers.set(worker.id, {
                worker,
                startTime: Date.now(),
                lastHealthCheck: Date.now(),
                isHealthy: true
            });

            this.clusterMetrics.activeWorkers = this.workers.size;
        });

        // Handler para workers que falham em inicializar
        cluster.on('listening', (worker, address) => {
            console.log(`🎧 Worker ${worker.process.pid} listening on ${address.address}:${address.port}`);
        });

        // Graceful shutdown handlers
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

        // Error handlers
        process.on('uncaughtException', async (error) => {
            console.error('❌ Master uncaught exception:', error);
            await this.emergencyShutdown();
        });

        process.on('unhandledRejection', async (reason) => {
            console.error('❌ Master unhandled rejection:', reason);
            await this.emergencyShutdown();
        });

        console.log('🎛️ Master process configured');
    }

    async startWorkers() {
        for (let i = 0; i < this.clusterConfig.maxWorkers; i++) {
            await this.startSingleWorker();
            // Pequeno delay entre workers para evitar sobrecarga
            await this.sleep(1000);
        }

        this.clusterMetrics.totalWorkers = this.clusterConfig.maxWorkers;
        console.log(`👥 Started ${this.workers.size} workers`);
    }

    async startSingleWorker() {
        return new Promise((resolve, reject) => {
            const worker = cluster.fork();

            const timeout = setTimeout(() => {
                console.error(`⏰ Worker ${worker.process.pid} failed to start within timeout`);
                worker.kill('SIGKILL');
                reject(new Error('Worker startup timeout'));
            }, this.clusterConfig.workerTimeout);

            worker.once('online', () => {
                clearTimeout(timeout);
                resolve(worker);
            });

            worker.once('exit', (code, signal) => {
                clearTimeout(timeout);
                if (code !== 0) {
                    reject(new Error(`Worker exited with code ${code} signal ${signal}`));
                }
            });
        });
    }

    async startClusterMonitoring() {
        // Health check dos workers
        setInterval(async () => {
            await this.performClusterHealthCheck();
        }, this.clusterConfig.healthCheckInterval);

        // Salvar métricas do cluster
        setInterval(async () => {
            await this.saveClusterMetrics();
        }, 60000); // A cada minuto

        console.log('🏥 Cluster monitoring started');
    }

    async performClusterHealthCheck() {
        this.clusterMetrics.lastHealthCheck = Date.now();

        for (const [workerId, workerInfo] of this.workers) {
            try {
                // Enviar ping para worker
                const healthCheckPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Health check timeout'));
                    }, 5000);

                    workerInfo.worker.send({ type: 'HEALTH_CHECK' }, (error) => {
                        clearTimeout(timeout);
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });

                await healthCheckPromise;
                workerInfo.isHealthy = true;
                workerInfo.lastHealthCheck = Date.now();

            } catch (error) {
                console.error(`❌ Worker ${workerId} health check failed:`, error);
                workerInfo.isHealthy = false;

                // Se worker não responde há muito tempo, reiniciar
                const timeSinceLastCheck = Date.now() - workerInfo.lastHealthCheck;
                if (timeSinceLastCheck > 60000) { // 1 minuto
                    console.log(`🔄 Restarting unresponsive worker ${workerId}`);
                    workerInfo.worker.kill('SIGTERM');
                }
            }
        }

        // Verificar se temos workers suficientes
        const healthyWorkers = Array.from(this.workers.values())
            .filter(w => w.isHealthy).length;

        if (healthyWorkers < this.clusterConfig.maxWorkers / 2) {
            console.warn(`⚠️ Only ${healthyWorkers}/${this.clusterConfig.maxWorkers} workers are healthy`);
            await this.sendClusterAlert('LOW_WORKER_COUNT', {
                healthyWorkers,
                totalWorkers: this.workers.size,
                maxWorkers: this.clusterConfig.maxWorkers
            });
        }
    }

    async saveClusterMetrics() {
        const metrics = {
            ...this.clusterMetrics,
            workers: Array.from(this.workers.values()).map(w => ({
                id: w.worker.id,
                pid: w.worker.process.pid,
                startTime: w.startTime,
                lastHealthCheck: w.lastHealthCheck,
                isHealthy: w.isHealthy,
                uptime: Date.now() - w.startTime
            })),
            system: {
                cpuUsage: process.cpuUsage(),
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
                loadAverage: os.loadavg()
            },
            timestamp: Date.now()
        };

        await redisManager.setSecure('cluster', 'metrics', metrics, 3600);
    }

    async sendClusterAlert(type, data) {
        const alert = {
            type,
            level: 'WARNING',
            service: 'ExchangeCluster',
            data,
            timestamp: Date.now(),
            clusterMetrics: this.clusterMetrics
        };

        await redisManager.setSecure('alerts',
            `cluster_alert:${type}:${Date.now()}`,
            alert,
            86400
        );

        console.log(`🚨 CLUSTER ALERT [${type}]:`, data);
    }

    async startWorker() {
        console.log(`🧑‍💼 Starting Exchange Worker (PID: ${process.pid})`);

        try {
            // Configurar title do processo
            process.title = 'coinage-exchange-worker';

            // Criar e inicializar MultiExchangeManager
            const exchangeManager = new MultiExchangeManager();

            const initialized = await exchangeManager.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize MultiExchangeManager');
            }

            // Configurar message handlers
            process.on('message', async (message) => {
                switch (message.type) {
                    case 'HEALTH_CHECK':
                        // Responder health check
                        const status = await exchangeManager.getStatus();
                        process.send({
                            type: 'HEALTH_RESPONSE',
                            status: status.isRunning ? 'healthy' : 'unhealthy',
                            data: status
                        });
                        break;

                    case 'SHUTDOWN':
                        console.log('📤 Worker received shutdown command');
                        await exchangeManager.shutdown();
                        process.exit(0);
                        break;

                    default:
                        console.warn(`Unknown message type: ${message.type}`);
                }
            });

            // Error handlers para worker
            process.on('uncaughtException', async (error) => {
                console.error('❌ Worker uncaught exception:', error);
                await exchangeManager.shutdown();
                process.exit(1);
            });

            process.on('unhandledRejection', async (reason) => {
                console.error('❌ Worker unhandled rejection:', reason);
                await exchangeManager.shutdown();
                process.exit(1);
            });

            // Graceful shutdown para worker
            process.on('SIGTERM', async () => {
                console.log('📤 Worker received SIGTERM');
                await exchangeManager.shutdown();
                process.exit(0);
            });

            console.log(`✅ Exchange Worker ${process.pid} started successfully`);

        } catch (error) {
            console.error('❌ Failed to start Exchange Worker:', error);
            process.exit(1);
        }
    }

    async gracefulShutdown(signal) {
        if (this.isShuttingDown) {
            console.log('⚠️ Shutdown already in progress');
            return;
        }

        console.log(`📤 Received ${signal}, starting graceful shutdown...`);
        this.isShuttingDown = true;

        try {
            // Parar de aceitar novos workers
            cluster.removeAllListeners('exit');

            // Enviar shutdown para todos os workers
            const shutdownPromises = Array.from(this.workers.values()).map(workerInfo => {
                return new Promise((resolve) => {
                    const worker = workerInfo.worker;

                    // Timeout para shutdown forçado
                    const forceKillTimeout = setTimeout(() => {
                        console.log(`⚡ Force killing worker ${worker.process.pid}`);
                        worker.kill('SIGKILL');
                        resolve();
                    }, this.clusterConfig.gracefulShutdownTimeout);

                    // Graceful shutdown
                    worker.send({ type: 'SHUTDOWN' });

                    worker.once('exit', () => {
                        clearTimeout(forceKillTimeout);
                        resolve();
                    });
                });
            });

            // Aguardar todos os workers pararem
            await Promise.all(shutdownPromises);

            // Salvar métricas finais
            await this.saveClusterMetrics();

            // Fechar conexões master
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

        // Matar todos os workers imediatamente
        for (const workerInfo of this.workers.values()) {
            workerInfo.worker.kill('SIGKILL');
        }

        // Aguardar um pouco e sair
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getClusterStatus() {
        const workers = Array.from(this.workers.values()).map(w => ({
            id: w.worker.id,
            pid: w.worker.process.pid,
            isHealthy: w.isHealthy,
            uptime: Date.now() - w.startTime
        }));

        return {
            isMaster: cluster.isMaster,
            isShuttingDown: this.isShuttingDown,
            metrics: this.clusterMetrics,
            workers,
            system: {
                cpus: os.cpus().length,
                freeMem: os.freemem(),
                totalMem: os.totalmem(),
                loadAvg: os.loadavg()
            }
        };
    }
}

// Inicializar cluster se este arquivo for executado diretamente
if (require.main === module) {
    const cluster = new ExchangeCluster();
    cluster.start().catch(error => {
        console.error('❌ Failed to start Exchange Cluster:', error);
        process.exit(1);
    });
}

module.exports = ExchangeCluster;
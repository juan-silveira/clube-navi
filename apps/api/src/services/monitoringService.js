const redisManager = require('../config/redis.config');
const rabbitMQ = require('../config/rabbitmq.config');
const db = require('../config/database');

class MonitoringService {
    constructor() {
        this.alertThresholds = {
            // Métricas de performance
            averageMatchTime: 10000, // 10 segundos
            matchSuccessRate: 80, // 80%
            queueDepth: 100, // 100 mensagens
            memoryUsage: 500, // 500MB
            cpuUsage: 80, // 80%

            // Métricas de conectividade
            consecutiveErrors: 5,
            healthCheckFailures: 3,
            connectionTimeouts: 10,

            // Métricas de negócio
            dailyVolumeDropPercentage: 50, // 50% de queda
            unusualPriceDeviation: 10, // 10% de desvio
            suspiciousOrderPatterns: 20 // 20 ordens suspeitas por hora
        };

        this.alertChannels = {
            email: [],
            slack: null,
            webhook: [],
            sms: []
        };

        this.metricsBuffer = new Map();
        this.isRunning = false;
    }

    async initialize() {
        console.log('📊 Initializing MonitoringService...');

        try {
            // Carregar configurações de alerta
            await this.loadAlertConfig();

            // Configurar canais de notificação
            await this.setupNotificationChannels();

            // Iniciar coleta de métricas
            await this.startMetricsCollection();

            // Iniciar análise de alertas
            await this.startAlertAnalysis();

            this.isRunning = true;
            console.log('✅ MonitoringService initialized');

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize MonitoringService:', error);
            return false;
        }
    }

    async loadAlertConfig() {
        try {
            const config = await redisManager.getSecure('system', 'alert_config');

            if (config) {
                this.alertThresholds = { ...this.alertThresholds, ...config.thresholds };
                this.alertChannels = { ...this.alertChannels, ...config.channels };
                console.log('📋 Alert configuration loaded');
            }
        } catch (error) {
            console.error('Error loading alert config:', error);
        }
    }

    async setupNotificationChannels() {
        // Carregar configurações dos canais do banco
        const channelsQuery = `
            SELECT channel_type, config, is_active
            FROM notification_channels
            WHERE is_active = true
        `;

        const result = await db.query(channelsQuery);

        result.rows.forEach(row => {
            const config = JSON.parse(row.config);

            switch (row.channel_type) {
                case 'email':
                    this.alertChannels.email.push(config);
                    break;
                case 'slack':
                    this.alertChannels.slack = config;
                    break;
                case 'webhook':
                    this.alertChannels.webhook.push(config);
                    break;
                case 'sms':
                    this.alertChannels.sms.push(config);
                    break;
            }
        });

        console.log(`📢 Configured ${result.rows.length} notification channels`);
    }

    async startMetricsCollection() {
        // Coletar métricas a cada 30 segundos
        setInterval(async () => {
            await this.collectSystemMetrics();
        }, 30000);

        // Coletar métricas de negócio a cada 5 minutos
        setInterval(async () => {
            await this.collectBusinessMetrics();
        }, 300000);

        console.log('📈 Metrics collection started');
    }

    async collectSystemMetrics() {
        try {
            const timestamp = Date.now();

            // Métricas do sistema
            const systemMetrics = {
                timestamp,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                uptime: process.uptime()
            };

            // Métricas do Redis
            const redisHealth = await redisManager.healthCheck();
            const redisMetrics = {
                timestamp,
                health: redisHealth,
                connections: Object.keys(redisHealth).length
            };

            // Métricas do RabbitMQ
            const rabbitHealth = await rabbitMQ.healthCheck();
            const rabbitMetrics = {
                timestamp,
                health: rabbitHealth,
                status: rabbitHealth.status
            };

            // Salvar métricas
            await redisManager.setSecure('metrics', 'system_latest', systemMetrics, 300);
            await redisManager.setSecure('metrics', 'redis_latest', redisMetrics, 300);
            await redisManager.setSecure('metrics', 'rabbit_latest', rabbitMetrics, 300);

            // Adicionar ao buffer para análise
            this.addToMetricsBuffer('system', systemMetrics);
            this.addToMetricsBuffer('redis', redisMetrics);
            this.addToMetricsBuffer('rabbit', rabbitMetrics);

        } catch (error) {
            console.error('Error collecting system metrics:', error);
        }
    }

    async collectBusinessMetrics() {
        try {
            const timestamp = Date.now();
            const last24h = timestamp - (24 * 60 * 60 * 1000);

            // Métricas de trading
            const tradingQuery = `
                SELECT
                    COUNT(*) as total_trades,
                    SUM(CAST(quantity AS NUMERIC)) as total_volume,
                    AVG(CAST(price AS NUMERIC)) as average_price,
                    COUNT(DISTINCT buyer_address) + COUNT(DISTINCT seller_address) as unique_traders
                FROM trades
                WHERE created_at >= $1
            `;

            const tradingResult = await db.query(tradingQuery, [new Date(last24h)]);

            // Métricas de ordens
            const ordersQuery = `
                SELECT
                    COUNT(*) as total_orders,
                    COUNT(*) FILTER (WHERE order_type = 0) as buy_orders,
                    COUNT(*) FILTER (WHERE order_type = 1) as sell_orders,
                    COUNT(*) FILTER (WHERE is_active = true) as active_orders
                FROM exchange_orders
                WHERE created_at >= $1
            `;

            const ordersResult = await db.query(ordersQuery, [new Date(last24h)]);

            const businessMetrics = {
                timestamp,
                trading: tradingResult.rows[0],
                orders: ordersResult.rows[0],
                period: '24h'
            };

            // Salvar métricas
            await redisManager.setSecure('metrics', 'business_latest', businessMetrics, 3600);
            this.addToMetricsBuffer('business', businessMetrics);

        } catch (error) {
            console.error('Error collecting business metrics:', error);
        }
    }

    addToMetricsBuffer(type, metrics) {
        if (!this.metricsBuffer.has(type)) {
            this.metricsBuffer.set(type, []);
        }

        const buffer = this.metricsBuffer.get(type);
        buffer.push(metrics);

        // Manter apenas os últimos 100 pontos
        if (buffer.length > 100) {
            buffer.shift();
        }
    }

    async startAlertAnalysis() {
        // Analisar alertas a cada minuto
        setInterval(async () => {
            await this.analyzeAlerts();
        }, 60000);

        console.log('🚨 Alert analysis started');
    }

    async analyzeAlerts() {
        try {
            // Analisar diferentes tipos de alertas
            await this.analyzeSystemAlerts();
            await this.analyzeBusinessAlerts();
            await this.analyzeSecurityAlerts();

        } catch (error) {
            console.error('Error analyzing alerts:', error);
        }
    }

    async analyzeSystemAlerts() {
        const systemMetrics = this.metricsBuffer.get('system') || [];
        if (systemMetrics.length === 0) return;

        const latest = systemMetrics[systemMetrics.length - 1];

        // Verificar uso de memória
        const memoryUsageMB = latest.memory.heapUsed / 1024 / 1024;
        if (memoryUsageMB > this.alertThresholds.memoryUsage) {
            await this.sendAlert('HIGH_MEMORY_USAGE', {
                current: memoryUsageMB.toFixed(2),
                threshold: this.alertThresholds.memoryUsage,
                unit: 'MB'
            }, 'WARNING');
        }

        // Verificar saúde do Redis
        const redisMetrics = this.metricsBuffer.get('redis') || [];
        if (redisMetrics.length > 0) {
            const latestRedis = redisMetrics[redisMetrics.length - 1];
            const unhealthyConnections = Object.values(latestRedis.health)
                .filter(status => status === 'unhealthy').length;

            if (unhealthyConnections > 0) {
                await this.sendAlert('REDIS_CONNECTIVITY_ISSUES', {
                    unhealthyConnections,
                    totalConnections: Object.keys(latestRedis.health).length
                }, 'CRITICAL');
            }
        }

        // Verificar saúde do RabbitMQ
        const rabbitMetrics = this.metricsBuffer.get('rabbit') || [];
        if (rabbitMetrics.length > 0) {
            const latestRabbit = rabbitMetrics[rabbitMetrics.length - 1];
            if (latestRabbit.health.status === 'unhealthy') {
                await this.sendAlert('RABBITMQ_CONNECTIVITY_ISSUES', {
                    status: latestRabbit.health.status,
                    reason: latestRabbit.health.reason
                }, 'CRITICAL');
            }
        }
    }

    async analyzeBusinessAlerts() {
        const businessMetrics = this.metricsBuffer.get('business') || [];
        if (businessMetrics.length < 2) return;

        const current = businessMetrics[businessMetrics.length - 1];
        const previous = businessMetrics[businessMetrics.length - 2];

        // Verificar queda no volume de trading
        const currentVolume = parseFloat(current.trading.total_volume) || 0;
        const previousVolume = parseFloat(previous.trading.total_volume) || 0;

        if (previousVolume > 0) {
            const volumeChange = ((currentVolume - previousVolume) / previousVolume) * 100;

            if (volumeChange < -this.alertThresholds.dailyVolumeDropPercentage) {
                await this.sendAlert('TRADING_VOLUME_DROP', {
                    change: volumeChange.toFixed(2),
                    current: currentVolume,
                    previous: previousVolume,
                    threshold: this.alertThresholds.dailyVolumeDropPercentage
                }, 'WARNING');
            }
        }

        // Verificar desvio de preço anormal
        const currentPrice = parseFloat(current.trading.average_price) || 0;
        const previousPrice = parseFloat(previous.trading.average_price) || 0;

        if (previousPrice > 0) {
            const priceChange = Math.abs((currentPrice - previousPrice) / previousPrice) * 100;

            if (priceChange > this.alertThresholds.unusualPriceDeviation) {
                await this.sendAlert('UNUSUAL_PRICE_MOVEMENT', {
                    change: priceChange.toFixed(2),
                    current: currentPrice,
                    previous: previousPrice,
                    threshold: this.alertThresholds.unusualPriceDeviation
                }, 'WARNING');
            }
        }
    }

    async analyzeSecurityAlerts() {
        // Verificar padrões suspeitos nas últimas horas
        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        try {
            // Detectar ordens com padrões suspeitos
            const suspiciousQuery = `
                SELECT
                    user_address,
                    COUNT(*) as order_count,
                    AVG(CAST(amount_token AS NUMERIC)) as avg_amount,
                    COUNT(DISTINCT price_per_token) as price_variations
                FROM exchange_orders
                WHERE created_at >= $1
                GROUP BY user_address
                HAVING COUNT(*) > $2
            `;

            const result = await db.query(suspiciousQuery, [
                new Date(oneHourAgo),
                this.alertThresholds.suspiciousOrderPatterns
            ]);

            if (result.rows.length > 0) {
                await this.sendAlert('SUSPICIOUS_ORDER_PATTERNS', {
                    suspiciousUsers: result.rows.length,
                    details: result.rows.slice(0, 5), // Primeiros 5 usuários
                    threshold: this.alertThresholds.suspiciousOrderPatterns
                }, 'WARNING');
            }

            // Detectar múltiplas tentativas de matching falhadas
            const failedMatchesQuery = `
                SELECT COUNT(*) as failed_count
                FROM (
                    SELECT jsonb_extract_path_text(data, 'error') as error
                    FROM system_logs
                    WHERE created_at >= $1
                        AND log_level = 'ERROR'
                        AND message LIKE '%matching%'
                ) failures
            `;

            const failedResult = await db.query(failedMatchesQuery, [new Date(oneHourAgo)]);
            const failedCount = parseInt(failedResult.rows[0]?.failed_count) || 0;

            if (failedCount > this.alertThresholds.consecutiveErrors) {
                await this.sendAlert('HIGH_MATCHING_FAILURE_RATE', {
                    failedMatches: failedCount,
                    period: '1 hour',
                    threshold: this.alertThresholds.consecutiveErrors
                }, 'CRITICAL');
            }

        } catch (error) {
            console.error('Error analyzing security alerts:', error);
        }
    }

    async sendAlert(type, data, severity = 'WARNING') {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            data,
            timestamp: Date.now(),
            source: 'MonitoringService'
        };

        try {
            // Salvar alerta no Redis
            await redisManager.setSecure('alerts',
                `${alert.id}`,
                alert,
                86400 // 24 horas
            );

            // Salvar no banco para histórico
            await this.saveAlertToDatabase(alert);

            // Enviar notificações
            await this.sendNotifications(alert);

            console.log(`🚨 ALERT [${severity}] ${type}:`, data);

        } catch (error) {
            console.error('Error sending alert:', error);
        }
    }

    async saveAlertToDatabase(alert) {
        const query = `
            INSERT INTO system_alerts (
                alert_id, alert_type, severity, data,
                timestamp, source, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `;

        const values = [
            alert.id,
            alert.type,
            alert.severity,
            JSON.stringify(alert.data),
            new Date(alert.timestamp),
            alert.source
        ];

        await db.query(query, values);
    }

    async sendNotifications(alert) {
        // Determinar quais canais usar baseado na severidade
        const shouldNotify = this.shouldSendNotification(alert);

        if (!shouldNotify) return;

        // Email notifications
        if (this.alertChannels.email.length > 0) {
            await this.sendEmailNotification(alert);
        }

        // Slack notifications
        if (this.alertChannels.slack) {
            await this.sendSlackNotification(alert);
        }

        // Webhook notifications
        if (this.alertChannels.webhook.length > 0) {
            await this.sendWebhookNotifications(alert);
        }

        // SMS para alertas críticos
        if (alert.severity === 'CRITICAL' && this.alertChannels.sms.length > 0) {
            await this.sendSMSNotifications(alert);
        }
    }

    shouldSendNotification(alert) {
        // Verificar rate limiting para evitar spam
        const rateLimitKey = `rate_limit:${alert.type}`;

        // Para alertas críticos, sempre enviar
        if (alert.severity === 'CRITICAL') {
            return true;
        }

        // Para outros, verificar se já enviamos recentemente
        // (implementar rate limiting baseado no tipo de alerta)
        return true; // Simplificado por agora
    }

    async sendEmailNotification(alert) {
        // Implementar envio de email
        console.log(`📧 Would send email for alert: ${alert.type}`);
    }

    async sendSlackNotification(alert) {
        // Implementar envio para Slack
        console.log(`💬 Would send Slack message for alert: ${alert.type}`);
    }

    async sendWebhookNotifications(alert) {
        // Implementar envio para webhooks
        console.log(`🔗 Would send webhook for alert: ${alert.type}`);
    }

    async sendSMSNotifications(alert) {
        // Implementar envio de SMS
        console.log(`📱 Would send SMS for critical alert: ${alert.type}`);
    }

    async getMetricsSummary(period = '1h') {
        const periods = {
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000
        };

        const periodMs = periods[period] || periods['1h'];
        const since = Date.now() - periodMs;

        const summary = {
            period,
            since: new Date(since),
            system: await this.getSystemMetricsSummary(since),
            business: await this.getBusinessMetricsSummary(since),
            alerts: await this.getAlertsSummary(since)
        };

        return summary;
    }

    async getSystemMetricsSummary(since) {
        const systemMetrics = this.metricsBuffer.get('system') || [];
        const recentMetrics = systemMetrics.filter(m => m.timestamp >= since);

        if (recentMetrics.length === 0) return null;

        const memoryUsages = recentMetrics.map(m => m.memory.heapUsed / 1024 / 1024);

        return {
            memoryUsage: {
                current: memoryUsages[memoryUsages.length - 1]?.toFixed(2),
                average: (memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length).toFixed(2),
                max: Math.max(...memoryUsages).toFixed(2),
                unit: 'MB'
            },
            uptime: process.uptime(),
            dataPoints: recentMetrics.length
        };
    }

    async getBusinessMetricsSummary(since) {
        // Implementar summary de métricas de negócio
        return {
            trades: 0,
            volume: 0,
            activeOrders: 0
        };
    }

    async getAlertsSummary(since) {
        try {
            const query = `
                SELECT
                    severity,
                    COUNT(*) as count
                FROM system_alerts
                WHERE timestamp >= $1
                GROUP BY severity
            `;

            const result = await db.query(query, [new Date(since)]);

            const summary = {
                total: 0,
                critical: 0,
                warning: 0,
                info: 0
            };

            result.rows.forEach(row => {
                summary.total += parseInt(row.count);
                summary[row.severity.toLowerCase()] = parseInt(row.count);
            });

            return summary;
        } catch (error) {
            console.error('Error getting alerts summary:', error);
            return { total: 0, critical: 0, warning: 0, info: 0 };
        }
    }

    async shutdown() {
        console.log('🛑 Shutting down MonitoringService...');

        this.isRunning = false;

        // Limpar buffers
        this.metricsBuffer.clear();

        console.log('✅ MonitoringService shutdown complete');
    }
}

module.exports = MonitoringService;
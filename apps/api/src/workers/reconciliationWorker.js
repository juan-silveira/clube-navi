/**
 * Reconciliation Worker
 *
 * Worker que executa reconciliação de ordens a cada 1 minuto:
 * 1. Sincronização de status com blockchain
 * 2. Detecção e execução de matches pendentes
 */

const orderReconciliationService = require('../services/orderReconciliationService');

class ReconciliationWorker {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
        this.intervalMs = 60000; // 1 minuto
        this.stats = {
            jobsRun: 0,
            lastJobTime: null,
            totalErrors: 0,
            startTime: Date.now()
        };
    }

    /**
     * Iniciar o worker
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ Reconciliation Worker já está rodando');
            return;
        }

        console.log('🚀 Iniciando Reconciliation Worker...');
        console.log(`⏰ Intervalo: ${this.intervalMs / 1000} segundos`);

        this.isRunning = true;

        // Executar imediatamente na primeira vez
        this.runJob();

        // Configurar intervalo
        this.intervalId = setInterval(() => {
            this.runJob();
        }, this.intervalMs);

        console.log('✅ Reconciliation Worker iniciado com sucesso');
    }

    /**
     * Parar o worker
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Reconciliation Worker não está rodando');
            return;
        }

        console.log('🛑 Parando Reconciliation Worker...');

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('✅ Reconciliation Worker parado');
    }

    /**
     * Executar job de reconciliação
     */
    async runJob() {
        const startTime = Date.now();

        try {
            console.log('\\n🔄 [RECONCILIATION JOB] Executando...');
            console.log(`⏰ Horário: ${new Date().toISOString()}`);

            // Executar reconciliação completa
            const result = await orderReconciliationService.runFullReconciliation({
                source: 'worker',
                jobId: this.stats.jobsRun + 1
            });

            const duration = Date.now() - startTime;

            if (result.success) {
                console.log(`✅ [RECONCILIATION JOB] Concluído em ${duration}ms`);
                console.log(`📊 Ordens sincronizadas: ${result.sync?.updated || 0}`);
                console.log(`🎯 Matches executados: ${result.matches?.executed || 0}`);
            } else {
                console.error(`❌ [RECONCILIATION JOB] Falhou: ${result.error}`);
                this.stats.totalErrors++;
            }

            // Atualizar estatísticas
            this.stats.jobsRun++;
            this.stats.lastJobTime = new Date();

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`💥 [RECONCILIATION JOB] Erro crítico após ${duration}ms:`, error.message);
            this.stats.totalErrors++;
        }
    }

    /**
     * Alterar intervalo do worker
     */
    setInterval(ms) {
        console.log(`🔧 Alterando intervalo: ${ms / 1000} segundos`);

        this.intervalMs = ms;

        if (this.isRunning) {
            // Reiniciar com novo intervalo
            this.stop();
            this.start();
        }
    }

    /**
     * Executar job manualmente
     */
    async runManual() {
        console.log('🎯 [MANUAL] Executando reconciliação manual...');
        await this.runJob();
    }

    /**
     * Obter estatísticas do worker
     */
    getStats() {
        const uptime = Date.now() - this.stats.startTime;

        return {
            ...this.stats,
            isRunning: this.isRunning,
            intervalMs: this.intervalMs,
            intervalSeconds: this.intervalMs / 1000,
            uptime,
            uptimeFormatted: this.formatUptime(uptime),
            averageJobTime: this.stats.jobsRun > 0 ? uptime / this.stats.jobsRun : 0
        };
    }

    /**
     * Formatar tempo de atividade
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const reconciliationHealth = await orderReconciliationService.healthCheck();

            return {
                healthy: this.isRunning && reconciliationHealth.healthy,
                worker: {
                    running: this.isRunning,
                    stats: this.getStats()
                },
                reconciliationService: reconciliationHealth
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                worker: {
                    running: this.isRunning,
                    stats: this.getStats()
                }
            };
        }
    }
}

// Export singleton instance
module.exports = new ReconciliationWorker();
/**
 * Reconciliation Routes
 *
 * Rotas para administração do sistema de reconciliação de ordens
 */

const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/jwt.middleware');
const orderReconciliationService = require('../services/orderReconciliationService');
const reconciliationWorker = require('../workers/reconciliationWorker');

/**
 * Middleware para verificar se usuário é admin
 */
const requireAdmin = (req, res, next) => {
    try {
        const user = req.user;

        // Verificar se usuário tem permissão de admin
        const hasAdminRole = user.userCompanies?.some(uc =>
            uc.role === 'SUPER_ADMIN' || uc.role === 'ADMIN'
        );

        if (!hasAdminRole) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado: Apenas administradores podem executar esta ação'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro verificando permissões de admin',
            error: error.message
        });
    }
};

/**
 * GET /api/reconciliation/status
 * Obter status do sistema de reconciliação
 */
router.get('/status', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const [workerHealth, serviceStats] = await Promise.all([
            reconciliationWorker.healthCheck(),
            orderReconciliationService.getStats()
        ]);

        res.json({
            success: true,
            data: {
                worker: workerHealth,
                service: serviceStats,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro obtendo status da reconciliação',
            error: error.message
        });
    }
});

/**
 * POST /api/reconciliation/run
 * Executar reconciliação manual (botão do admin)
 */
router.post('/run', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        console.log(`🎯 [ADMIN] Reconciliação manual iniciada por: ${req.user.name} (${req.user.email})`);

        const result = await orderReconciliationService.runFullReconciliation({
            source: 'admin_manual',
            adminUser: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            },
            timestamp: new Date().toISOString()
        });

        if (result.success) {
            console.log(`✅ [ADMIN] Reconciliação manual concluída por: ${req.user.name}`);

            res.json({
                success: true,
                message: 'Reconciliação executada com sucesso',
                data: result
            });
        } else {
            console.error(`❌ [ADMIN] Reconciliação manual falhou para: ${req.user.name} - ${result.error}`);

            res.status(500).json({
                success: false,
                message: 'Falha na execução da reconciliação',
                error: result.error,
                data: result
            });
        }
    } catch (error) {
        console.error(`💥 [ADMIN] Erro crítico na reconciliação manual para: ${req.user.name}`, error);

        res.status(500).json({
            success: false,
            message: 'Erro crítico durante reconciliação',
            error: error.message
        });
    }
});

/**
 * POST /api/reconciliation/worker/start
 * Iniciar worker de reconciliação
 */
router.post('/worker/start', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        console.log(`🚀 [ADMIN] Worker iniciado por: ${req.user.name} (${req.user.email})`);

        reconciliationWorker.start();

        res.json({
            success: true,
            message: 'Worker de reconciliação iniciado',
            data: reconciliationWorker.getStats()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro iniciando worker',
            error: error.message
        });
    }
});

/**
 * POST /api/reconciliation/worker/stop
 * Parar worker de reconciliação
 */
router.post('/worker/stop', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        console.log(`🛑 [ADMIN] Worker parado por: ${req.user.name} (${req.user.email})`);

        reconciliationWorker.stop();

        res.json({
            success: true,
            message: 'Worker de reconciliação parado',
            data: reconciliationWorker.getStats()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro parando worker',
            error: error.message
        });
    }
});

/**
 * POST /api/reconciliation/worker/interval
 * Alterar intervalo do worker
 */
router.post('/worker/interval', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { intervalSeconds } = req.body;

        if (!intervalSeconds || intervalSeconds < 10) {
            return res.status(400).json({
                success: false,
                message: 'Intervalo deve ser pelo menos 10 segundos'
            });
        }

        const intervalMs = intervalSeconds * 1000;

        console.log(`🔧 [ADMIN] Intervalo alterado para ${intervalSeconds}s por: ${req.user.name} (${req.user.email})`);

        reconciliationWorker.setInterval(intervalMs);

        res.json({
            success: true,
            message: `Intervalo alterado para ${intervalSeconds} segundos`,
            data: reconciliationWorker.getStats()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro alterando intervalo do worker',
            error: error.message
        });
    }
});

/**
 * GET /api/reconciliation/health
 * Health check público (sem auth para monitoring)
 */
router.get('/health', async (req, res) => {
    try {
        const health = await reconciliationWorker.healthCheck();

        res.status(health.healthy ? 200 : 503).json({
            success: health.healthy,
            data: health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Health check falhou',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
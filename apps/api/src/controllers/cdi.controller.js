const cdiService = require('../services/cdi.service');

/**
 * Controller para endpoints relacionados ao CDI (Certificado de Depósito Interbancário)
 */

/**
 * GET /api/cdi/latest
 * Retorna a taxa CDI mais recente do banco de dados
 */
async function getLatestRate(req, res) {
    try {
      const latest = await cdiService.getLatestCdiRate();

      if (!latest) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma taxa CDI encontrada'
        });
      }

      res.json({
        success: true,
        data: latest
      });
    } catch (error) {
      console.error('[CDI Controller] Erro ao buscar CDI mais recente:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar taxa CDI mais recente'
      });
    }
}

/**
 * POST /api/cdi/sync
 * Sincroniza dados do CDI com a API do Banco Central
 * Body: { daysBack?: number }
 * Requer autenticação de admin
 */
async function syncRates(req, res) {
    try {
      const { daysBack = 30 } = req.body;

      if (daysBack < 1 || daysBack > 365) {
        return res.status(400).json({
          success: false,
          message: 'daysBack deve estar entre 1 e 365'
        });
      }

      console.log(`[CDI Controller] Iniciando sincronização de ${daysBack} dias...`);

      const result = await cdiService.syncCdiRates(daysBack);

      res.json({
        success: true,
        message: `${result.saved} taxas CDI sincronizadas com sucesso`,
        data: result
      });
    } catch (error) {
      console.error('[CDI Controller] Erro ao sincronizar CDI:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao sincronizar taxas CDI'
      });
    }
}

/**
 * POST /api/cdi/calculate-equivalent
 * Calcula o equivalente ao CDI baseado na rentabilidade
 * Body: { profitability: number, referenceDate?: string, isMonthly?: boolean }
 */
async function calculateEquivalent(req, res) {
    try {
      const { profitability, referenceDate, isMonthly = true } = req.body;

      if (!profitability) {
        return res.status(400).json({
          success: false,
          message: 'Rentabilidade é obrigatória'
        });
      }

      if (isNaN(profitability) || profitability <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Rentabilidade deve ser um número positivo'
        });
      }

      const result = await cdiService.calculateCdiEquivalent(profitability, referenceDate, isMonthly);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[CDI Controller] Erro ao calcular equivalente CDI:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao calcular equivalente CDI'
      });
    }
}

/**
 * GET /api/cdi/history
 * Retorna histórico de taxas CDI
 * Query params: startDate?, endDate?, limit?
 */
async function getHistory(req, res) {
    try {
      const { startDate, endDate, limit = 30 } = req.query;

      const history = await cdiService.getCdiHistory(startDate, endDate, limit);

      res.json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (error) {
      console.error('[CDI Controller] Erro ao buscar histórico CDI:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar histórico de taxas CDI'
      });
    }
}

/**
 * GET /api/cdi/by-date/:date
 * Retorna a taxa CDI de uma data específica
 * Params: date (formato: YYYY-MM-DD)
 */
async function getRateByDate(req, res) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Data é obrigatória'
        });
      }

      const cdiRate = await cdiService.getCdiRateByDate(date);

      if (!cdiRate) {
        return res.status(404).json({
          success: false,
          message: `Nenhuma taxa CDI encontrada para a data ${date}`
        });
      }

      res.json({
        success: true,
        data: cdiRate
      });
    } catch (error) {
      console.error('[CDI Controller] Erro ao buscar taxa CDI por data:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar taxa CDI'
      });
    }
}

/**
 * GET /api/cdi/status
 * Verifica o status da sincronização do CDI
 */
async function getStatus(req, res) {
    try {
      const latest = await cdiService.getLatestCdiRate();
      const isOutdated = await cdiService.isOutdated();

      res.json({
        success: true,
        data: {
          hasData: !!latest,
          latestDate: latest?.date || null,
          latestRate: latest?.rateYear || null,
          isOutdated,
          needsSync: isOutdated || !latest
        }
      });
    } catch (error) {
      console.error('[CDI Controller] Erro ao verificar status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao verificar status do CDI'
      });
    }
}

module.exports = {
  getLatestRate,
  syncRates,
  calculateEquivalent,
  getHistory,
  getRateByDate,
  getStatus
};

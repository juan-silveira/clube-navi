const express = require('express');
const router = express.Router();
const taxReportsService = require('../services/taxReports.service');
const pdfService = require('../services/pdf.service');
const { authenticateToken } = require('../middleware/jwt.middleware');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/tax-reports/available-years
 * @desc    Obter lista de anos disponíveis para informe
 * @access  Private
 */
router.get('/available-years', async (req, res) => {
  try {
    const userId = req.user.id;
    const { network = 'testnet' } = req.query;

    const result = await taxReportsService.getAvailableYears(userId, network);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Erro na rota GET /tax-reports/available-years:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/tax-reports/income/:year
 * @desc    Obter informe de rendimentos para um ano específico
 * @access  Private
 */
router.get('/income/:year', async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.params;
    const { network = 'testnet' } = req.query;

    // Validar ano do informe (pode ser até ano atual + 1)
    const yearInt = parseInt(year);
    const maxYear = new Date().getFullYear() + 1;
    if (isNaN(yearInt) || yearInt < 2000 || yearInt > maxYear) {
      return res.status(400).json({
        success: false,
        message: 'Ano inválido',
      });
    }

    const result = await taxReportsService.getIncomeReport(userId, yearInt, network);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error(`Erro na rota GET /tax-reports/income/${req.params.year}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/tax-reports/income/:year/pdf
 * @desc    Gerar e baixar PDF do informe de rendimentos
 * @access  Private
 */
router.get('/income/:year/pdf', async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.params;
    const { network = 'testnet' } = req.query;

    // Validar ano do informe (pode ser até ano atual + 1)
    const yearInt = parseInt(year);
    const maxYear = new Date().getFullYear() + 1;
    if (isNaN(yearInt) || yearInt < 2000 || yearInt > maxYear) {
      return res.status(400).json({
        success: false,
        message: 'Ano inválido',
      });
    }

    // Buscar dados do informe
    console.log(`[PDF] Gerando PDF para ano ${yearInt}`);
    const reportResult = await taxReportsService.getIncomeReport(userId, yearInt, network);

    if (!reportResult.success) {
      console.error('[PDF] Erro ao buscar dados:', reportResult.message);
      return res.status(400).json(reportResult);
    }

    // Gerar PDF
    const pdfBuffer = await pdfService.generateIncomeReportPDF(reportResult.data);
    console.log('[PDF] PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="informe-rendimentos-${year}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Enviar PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error(`[PDF] Erro ao gerar PDF:`, error.message);
    console.error('[PDF] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * @route   GET /api/tax-reports/balance/:date
 * @desc    Obter saldo do usuário em uma data específica
 * @access  Private
 */
router.get('/balance/:date', async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    const { network = 'testnet' } = req.query;

    // Validar data
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Data inválida',
      });
    }

    const result = await taxReportsService.getBalanceAtDate(userId, dateObj, network);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error(`Erro na rota GET /tax-reports/balance/${req.params.date}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
});

module.exports = router;

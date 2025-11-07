/**
 * Balance Routes
 *
 * Rotas para consultar saldos de usuários
 */

const express = require('express');
const router = express.Router();
const balanceService = require('../services/balance.service');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/balance/merchant-sales
 * Retorna saldo de vendas do merchant autenticado
 */
router.get('/merchant-sales', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    if (userType !== 'merchant') {
      return res.status(403).json({
        success: false,
        message: 'Apenas lojistas podem consultar saldo de vendas',
      });
    }

    const balance = await balanceService.getMerchantSalesBalance(userId);

    return res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error('❌ [BalanceRoutes] Erro ao buscar saldo de vendas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar saldo de vendas',
    });
  }
});

/**
 * GET /api/balance/cashback
 * Retorna saldo de cashback do usuário autenticado
 */
router.get('/cashback', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const balance = await balanceService.getCashbackBalance(userId);

    return res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error('❌ [BalanceRoutes] Erro ao buscar saldo de cashback:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar saldo de cashback',
    });
  }
});

/**
 * GET /api/balance/deposit
 * Retorna saldo de depósito do usuário autenticado
 */
router.get('/deposit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const balance = await balanceService.getDepositBalance(userId);

    return res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error('❌ [BalanceRoutes] Erro ao buscar saldo de depósito:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar saldo de depósito',
    });
  }
});

/**
 * GET /api/balance/all
 * Retorna todos os saldos do usuário autenticado
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    const balances = await balanceService.getAllBalances(userId, userType);

    return res.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error('❌ [BalanceRoutes] Erro ao buscar todos os saldos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar saldos',
    });
  }
});

/**
 * POST /api/balance/can-withdraw
 * Verifica se o usuário pode sacar determinado valor
 *
 * Body: { amount: number }
 */
router.post('/can-withdraw', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor inválido',
      });
    }

    const result = await balanceService.canWithdraw(userId, amount, userType);

    if (!result.canWithdraw) {
      return res.status(400).json({
        success: false,
        message: result.reason,
        data: result,
      });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ [BalanceRoutes] Erro ao verificar saque:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar possibilidade de saque',
    });
  }
});

module.exports = router;

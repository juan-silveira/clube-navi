/**
 * Withdrawal Routes
 *
 * Rotas para gerenciar solicitações de saque (merchants only)
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const balanceService = require('../services/balance.service');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/withdrawals
 * Lista todas as solicitações de saque do usuário autenticado
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    console.error('❌ [WithdrawalRoutes] Erro ao listar saques:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar saques',
    });
  }
});

/**
 * GET /api/withdrawals/:id
 * Busca uma solicitação de saque específica
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const withdrawal = await prisma.withdrawal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação de saque não encontrada',
      });
    }

    return res.json({
      success: true,
      data: withdrawal,
    });
  } catch (error) {
    console.error('❌ [WithdrawalRoutes] Erro ao buscar saque:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar saque',
    });
  }
});

/**
 * POST /api/withdrawals
 * Cria uma nova solicitação de saque
 *
 * Body: {
 *   amount: number,
 *   pixKey: string,
 *   pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
 *   pixKeyOwnerName: string,
 *   pixKeyOwnerCpf: string
 * }
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { amount, pixKey, pixKeyType, pixKeyOwnerName, pixKeyOwnerCpf } = req.body;

    // Validar tipo de usuário
    if (userType !== 'merchant') {
      return res.status(403).json({
        success: false,
        message: 'Apenas lojistas podem solicitar saques',
      });
    }

    // Validar campos obrigatórios
    if (!amount || !pixKey || !pixKeyType || !pixKeyOwnerName || !pixKeyOwnerCpf) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Todos os campos são obrigatórios.',
      });
    }

    // Validar valor mínimo
    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'O valor mínimo de saque é R$ 10,00',
      });
    }

    // Verificar se pode sacar
    const canWithdrawCheck = await balanceService.canWithdraw(userId, amount, userType);
    if (!canWithdrawCheck.canWithdraw) {
      return res.status(400).json({
        success: false,
        message: canWithdrawCheck.reason,
      });
    }

    // Verificar se há saque pendente
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId,
        status: {
          in: ['pending', 'processing'],
        },
      },
    });

    if (pendingWithdrawal) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui uma solicitação de saque em andamento',
      });
    }

    // Calcular taxa e valor líquido (2% de taxa)
    const fee = amount * 0.02;
    const netAmount = amount - fee;

    // Criar solicitação de saque
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        pixKey,
        pixKeyType,
        pixKeyOwnerName,
        pixKeyOwnerCpf,
        status: 'pending',
        fee,
        netAmount,
      },
    });

    console.log(`✅ [WithdrawalRoutes] Saque criado: ${withdrawal.id} - R$ ${amount}`);

    return res.status(201).json({
      success: true,
      data: withdrawal,
      message: 'Solicitação de saque criada com sucesso',
    });
  } catch (error) {
    console.error('❌ [WithdrawalRoutes] Erro ao criar saque:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar solicitação de saque',
    });
  }
});

/**
 * POST /api/withdrawals/:id/cancel
 * Cancela uma solicitação de saque pendente
 */
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Buscar saque
    const withdrawal = await prisma.withdrawal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação de saque não encontrada',
      });
    }

    // Verificar se pode cancelar
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Apenas saques pendentes podem ser cancelados',
      });
    }

    // Cancelar saque
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: {
        id,
      },
      data: {
        status: 'cancelled',
      },
    });

    console.log(`✅ [WithdrawalRoutes] Saque cancelado: ${id}`);

    return res.json({
      success: true,
      data: updatedWithdrawal,
      message: 'Solicitação de saque cancelada com sucesso',
    });
  } catch (error) {
    console.error('❌ [WithdrawalRoutes] Erro ao cancelar saque:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao cancelar saque',
    });
  }
});

module.exports = router;

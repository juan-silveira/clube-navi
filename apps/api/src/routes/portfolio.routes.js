/**
 * Portfolio Routes
 * Rotas para dados de portfólio do usuário (stake, ordens, saldos)
 */

const express = require('express');
const router = express.Router();
const stakeBalanceService = require('../services/stakeBalance.service');
const orderBalanceService = require('../services/orderBalance.service');
const prismaConfig = require('../config/prisma');

// Cache de promises em andamento para evitar cálculos duplicados
const ongoingUpdates = new Map();

/**
 * GET /api/portfolio/summary
 * Retorna resumo do portfólio do usuário (stake + ordens + saldos)
 */
router.get('/summary', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userId = req.user.id;
    const userAddress = req.user.publicKey || req.user.blockchainAddress;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        message: 'Endereço blockchain não encontrado'
      });
    }

    // Buscar dados do cache (banco de dados)
    let [stakeBalance, orderBalance] = await Promise.all([
      stakeBalanceService.getUserStakeBalance(userId),
      orderBalanceService.getUserOrderBalance(userId)
    ]);

    console.log('📊 [Portfolio Summary] Stake Balance (cache):', JSON.stringify(stakeBalance, null, 2));
    console.log('📊 [Portfolio Summary] Order Balance (cache):', JSON.stringify(orderBalance, null, 2));

    // Verificar se precisa atualizar stake ou orders
    const needsStakeUpdate = !stakeBalance.totalStakeUpdatedAt || stakeBalance.totalStake === '0';

    // Verificar se os dados de orders estão desatualizados (mais de 30 segundos)
    const ordersAge = orderBalance.ordersUpdatedAt
      ? Date.now() - new Date(orderBalance.ordersUpdatedAt).getTime()
      : Infinity;
    const ordersAreStale = ordersAge > 30000; // 30 segundos

    // Atualizar orders se:
    // - Não tem data de atualização OU
    // - Não tem totalInOrdersBRL OU
    // - O valor está zerado mas existem ordens OU
    // - Os dados estão desatualizados (mais de 30 segundos)
    const needsOrderUpdate = !orderBalance.ordersUpdatedAt ||
                             !orderBalance.totalInOrdersBRL ||
                             (orderBalance.totalInOrdersBRL === '0.00' && orderBalance.totalInOrders > 0) ||
                             ordersAreStale;

    if (needsStakeUpdate || needsOrderUpdate) {
      const updateKey = `${userId}`;

      // Se já existe uma atualização em andamento para este usuário, aguardar ela
      if (ongoingUpdates.has(updateKey)) {
        console.log('📊 [Portfolio Summary] Aguardando atualização em andamento...');
        await ongoingUpdates.get(updateKey);

        // Buscar dados atualizados
        [stakeBalance, orderBalance] = await Promise.all([
          stakeBalanceService.getUserStakeBalance(userId),
          orderBalanceService.getUserOrderBalance(userId)
        ]);
      } else {
        console.log('📊 [Portfolio Summary] Iniciando atualização:', {
          stake: needsStakeUpdate,
          orders: needsOrderUpdate
        });

        // Criar promise de atualização
        const updatePromise = (async () => {
          try {
            const updates = [];
            if (needsStakeUpdate) {
              updates.push(stakeBalanceService.updateUserStakeBalance(userId, userAddress));
            }
            if (needsOrderUpdate) {
              updates.push(orderBalanceService.updateUserOrderBalance(userId, userAddress));
            }

            await Promise.all(updates);

            // Buscar novamente após atualização
            const [newStake, newOrders] = await Promise.all([
              stakeBalanceService.getUserStakeBalance(userId),
              orderBalanceService.getUserOrderBalance(userId)
            ]);

            console.log('📊 [Portfolio Summary] Dados atualizados!');
            return { stake: newStake, orders: newOrders };
          } finally {
            // Limpar cache após 1 segundo
            setTimeout(() => ongoingUpdates.delete(updateKey), 1000);
          }
        })();

        // Salvar no cache
        ongoingUpdates.set(updateKey, updatePromise);

        // Aguardar conclusão
        const result = await updatePromise;
        stakeBalance = result.stake;
        orderBalance = result.orders;
      }
    }

    // Buscar saldos totais do usuário (buscar novamente para garantir dados atualizados)
    const prisma = prismaConfig.getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balances: true }
    });

    const balances = user?.balances || {};

    // Verificar se os dados que acabamos de salvar estão realmente lá
    if ((needsStakeUpdate || needsOrderUpdate) && balances) {
      console.log('📊 [Portfolio Summary] Verificação pós-save:', {
        ordersNoBalance: orderBalance.ordersBreakdown?.length || 0,
        ordersInDB: balances.ordersBreakdown?.length || 0,
        match: (balances.ordersBreakdown?.length || 0) === (orderBalance.ordersBreakdown?.length || 0)
      });
    }

    console.log('📊 [Portfolio Summary] User Balances:', JSON.stringify(balances, null, 2));

    // Calcular total geral (saldos + stake + ordens)
    // Converter tudo para BRL aproximado (simplificação - na produção usar cotações reais)
    let totalInWallet = 0;

    // Somar saldos de tokens
    if (balances && typeof balances === 'object') {
      Object.entries(balances).forEach(([key, value]) => {
        // Ignorar campos de metadata
        if (key.includes('Updated') || key.includes('Breakdown') || key === 'totalStake' || key === 'totalInOrders' || key === 'ordersBreakdown') {
          return;
        }

        if (typeof value === 'string' || typeof value === 'number') {
          try {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              totalInWallet += numValue;
            }
          } catch (e) {
            // Ignorar erros de conversão
          }
        }
      });
    }

    // IMPORTANTE: Usar dados do banco (balances) em vez das variáveis em memória
    // para evitar race conditions com balance sync
    const responseData = {
      totalInWallet: totalInWallet.toString(),
      totalStake: balances.totalStake || stakeBalance.totalStake || '0',
      totalStakeUpdatedAt: balances.totalStakeUpdatedAt || stakeBalance.totalStakeUpdatedAt,
      totalInOrders: balances.totalInOrders !== undefined ? balances.totalInOrders : (orderBalance.totalInOrders || 0),
      totalInOrdersBRL: balances.totalInOrdersBRL || orderBalance.totalInOrdersBRL || '0.00',
      ordersUpdatedAt: balances.ordersUpdatedAt || orderBalance.ordersUpdatedAt,
      stakeBreakdown: balances.stakeBreakdown || stakeBalance.stakeBreakdown || [],
      ordersBreakdown: balances.ordersBreakdown || orderBalance.ordersBreakdown || []
    };

    console.log('📊 [Portfolio Summary] Retornando resposta:', {
      totalStake: responseData.totalStake !== '0',
      totalInOrders: responseData.totalInOrders,
      totalInOrdersBRL: responseData.totalInOrdersBRL,
      ordersCount: responseData.ordersBreakdown?.length || 0
    });

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar resumo do portfólio',
      error: error.message
    });
  }
});

/**
 * POST /api/portfolio/refresh-stake
 * Força atualização do total em stake
 */
router.post('/refresh-stake', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userId = req.user.id;
    const userAddress = req.user.publicKey || req.user.blockchainAddress;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        message: 'Endereço blockchain não encontrado'
      });
    }

    console.log(`🔄 [Portfolio] Atualizando stake para usuário ${userId} (${userAddress})`);

    const result = await stakeBalanceService.updateUserStakeBalance(userId, userAddress);

    console.log(`✅ [Portfolio] Stake atualizado: ${result.totalStake} em ${result.contractsChecked} contratos`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error refreshing stake balance:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar saldo de stake',
      error: error.message
    });
  }
});

/**
 * POST /api/portfolio/refresh-orders
 * Força atualização do total em ordens
 */
router.post('/refresh-orders', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userId = req.user.id;
    const userAddress = req.user.publicKey || req.user.blockchainAddress;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        message: 'Endereço blockchain não encontrado'
      });
    }

    console.log(`🔄 [Portfolio] Atualizando ordens para usuário ${userId} (${userAddress})`);

    const result = await orderBalanceService.updateUserOrderBalance(userId, userAddress);

    console.log(`✅ [Portfolio] Ordens atualizadas: ${result.totalOrders} ordens ativas`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error refreshing order balance:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar saldo de ordens',
      error: error.message
    });
  }
});

/**
 * POST /api/portfolio/refresh-all
 * Força atualização de stake + ordens
 */
router.post('/refresh-all', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userId = req.user.id;
    const userAddress = req.user.publicKey || req.user.blockchainAddress;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        message: 'Endereço blockchain não encontrado'
      });
    }

    console.log(`🔄 [Portfolio] Atualizando portfolio completo para usuário ${userId} (${userAddress})`);

    // Executar atualizações em paralelo
    const [stakeResult, orderResult] = await Promise.allSettled([
      stakeBalanceService.updateUserStakeBalance(userId, userAddress),
      orderBalanceService.updateUserOrderBalance(userId, userAddress)
    ]);

    const response = {
      success: true,
      data: {
        stake: stakeResult.status === 'fulfilled' ? stakeResult.value : null,
        orders: orderResult.status === 'fulfilled' ? orderResult.value : null,
        errors: []
      }
    };

    if (stakeResult.status === 'rejected') {
      response.data.errors.push({ type: 'stake', error: stakeResult.reason?.message });
    }
    if (orderResult.status === 'rejected') {
      response.data.errors.push({ type: 'orders', error: orderResult.reason?.message });
    }

    console.log(`✅ [Portfolio] Portfolio atualizado`);

    res.json(response);

  } catch (error) {
    console.error('Error refreshing portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar portfólio',
      error: error.message
    });
  }
});

module.exports = router;

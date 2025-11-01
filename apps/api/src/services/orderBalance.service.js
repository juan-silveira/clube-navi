/**
 * Order Balance Service
 * Serviço para calcular total em ordens ativas do usuário
 */

const prismaConfig = require('../config/prisma');

class OrderBalanceService {
  /**
   * Buscar preço real do token do metadata (mesma lógica do endpoint /api/tokens/:symbol/price)
   *
   * Ordem de prioridade (já calculado e armazenado em metadata.tokenPrice):
   * 1. Preço do trade mais recente
   * 2. Melhor oferta de COMPRA
   * 3. Melhor oferta de VENDA
   * 4. Fallback: 1.00
   */
  async getTokenMarketPrice(tokenSymbol) {
    try {
      // cBRL sempre vale 1.00 (stablecoin de referência)
      if (tokenSymbol === 'cBRL') {
        return 1.00;
      }

      const prisma = prismaConfig.getPrisma();
      const TOKEN_CONTRACT_TYPE_ID = 'cc350023-d9ba-4746-85f3-1590175a2328';

      // Buscar token pelo símbolo
      const token = await prisma.smartContract.findFirst({
        where: {
          contractTypeId: TOKEN_CONTRACT_TYPE_ID,
          metadata: {
            path: ['symbol'],
            equals: tokenSymbol
          }
        }
      });

      if (!token || !token.metadata) {
        console.warn(`⚠️ [OrderBalance] Token ${tokenSymbol} não encontrado, usando fallback`);
        return 1.00;
      }

      // Obter preço do metadata (já calculado com a lógica de prioridade)
      const price = parseFloat(token.metadata.tokenPrice) || 1.00;

      return price;

    } catch (error) {
      console.warn(`⚠️ [OrderBalance] Erro ao buscar preço de ${tokenSymbol}:`, error.message);
      return 1.00; // Fallback para 1 BRL
    }
  }

  /**
   * Calcular total em ordens ativas do usuário
   */
  async calculateTotalInOrders(userAddress) {
    try {
      const prisma = prismaConfig.getPrisma();

      console.log(`📊 [OrderBalance] Calculando ordens para ${userAddress}`);

      // Buscar ordens ativas do usuário APENAS com orderSide = LIMIT
      const activeOrders = await prisma.exchangeOrder.findMany({
        where: {
          userAddress: {
            equals: userAddress,
            mode: 'insensitive'
          },
          orderSide: 'LIMIT', // Apenas LIMIT orders (não MARKET)
          status: 'ACTIVE'
        },
        select: {
          id: true,
          blockchainOrderId: true,
          orderType: true,
          orderSide: true,
          tokenASymbol: true,
          tokenBSymbol: true,
          price: true,
          amount: true,
          remainingAmount: true,
          filledAmount: true,
          status: true,
          createdAt: true
        }
      });

      console.log(`📊 [OrderBalance] Encontradas ${activeOrders.length} ordens ativas (LIMIT only)`);

      // Calcular totais por token usando preço de mercado
      const tokenTotals = {};
      let totalInOrdersBRL = 0;

      // Buscar preços de todos os tokens envolvidos de uma vez
      const uniqueTokens = new Set();
      activeOrders.forEach(order => {
        // Analisar qual token está realmente comprometido
        // BUY: comprando tokenA, comprometendo tokenB (mas queremos valor de tokenA)
        // SELL: vendendo tokenB, comprometendo tokenB
        uniqueTokens.add(order.tokenASymbol);
        uniqueTokens.add(order.tokenBSymbol);
      });

      // Buscar preços de mercado para todos os tokens
      const tokenPrices = {};
      for (const token of uniqueTokens) {
        tokenPrices[token] = await this.getTokenMarketPrice(token);
      }

      console.log(`📊 [OrderBalance] Preços de mercado:`, tokenPrices);

      for (const order of activeOrders) {
        try {
          // IMPORTANTE: Usar remainingAmount do token que está REALMENTE comprometido
          // Schema: token_a_symbol = primeiro token, token_b_symbol = segundo token
          // BUY: comprando token_a_symbol, comprometendo valor em token_b_symbol
          // SELL: vendendo token_b_symbol, comprometendo quantidade em token_b_symbol

          let committedToken;
          let committedAmount; // Quantidade de tokens
          let marketPrice; // Preço de mercado do token

          if (order.orderType === 'BUY') {
            // Comprando tokenA (ex: 8 cBRL) pagando tokenB (ex: PCN a 0.90 cada)
            // O que fica travado é: remainingAmount × price do tokenA (em unidades de tokenA)
            // Exemplo: comprando 8 cBRL a 0.90 = trava 7.20 cBRL
            committedToken = order.tokenASymbol;
            committedAmount = parseFloat(order.remainingAmount) * parseFloat(order.price);
            marketPrice = tokenPrices[order.tokenASymbol] || 1.0;
          } else {
            // Vendendo tokenB (PCN por exemplo)
            // O valor comprometido é: remainingAmount de tokenB
            committedToken = order.tokenBSymbol;
            committedAmount = parseFloat(order.remainingAmount);
            marketPrice = tokenPrices[order.tokenBSymbol] || 1.0;
          }

          // Calcular valor em BRL usando preço de mercado
          const valueBRL = committedAmount * marketPrice;
          totalInOrdersBRL += valueBRL;

          // Acumular por token
          if (!tokenTotals[committedToken]) {
            tokenTotals[committedToken] = {
              token: committedToken,
              total: 0, // Total em quantidade de tokens
              totalBRL: 0, // Total em BRL
              marketPrice: marketPrice,
              orders: []
            };
          }

          tokenTotals[committedToken].total += committedAmount;
          tokenTotals[committedToken].totalBRL += valueBRL;
          tokenTotals[committedToken].orders.push({
            orderId: order.id.toString(),
            blockchainOrderId: order.blockchainOrderId.toString(),
            type: order.orderType,
            side: order.orderSide,
            amount: committedAmount.toString(),
            valueBRL: valueBRL.toFixed(2),
            status: order.status
          });

        } catch (error) {
          console.warn(`⚠️ [OrderBalance] Error processing order ${order.id}:`, error);
        }
      }

      // Converter para array
      const breakdown = Object.values(tokenTotals).map(item => ({
        token: item.token,
        total: item.total.toString(), // Quantidade de tokens
        totalBRL: item.totalBRL.toFixed(2), // Valor em BRL
        marketPrice: item.marketPrice.toFixed(2),
        orders: item.orders
      }));

      console.log(`💰 [OrderBalance] Total em ordens: R$ ${totalInOrdersBRL.toFixed(2)} (${activeOrders.length} ordens)`);
      console.log(`💰 [OrderBalance] Breakdown:`, JSON.stringify(breakdown, null, 2));

      return {
        totalOrders: activeOrders.length,
        totalInOrdersBRL: totalInOrdersBRL.toFixed(2),
        breakdown,
        updatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calculating total in orders:', error);
      throw error;
    }
  }

  /**
   * Atualizar total em ordens no banco de dados do usuário
   */
  async updateUserOrderBalance(userId, userAddress) {
    try {
      const prisma = prismaConfig.getPrisma();

      // Calcular total em ordens
      const orderData = await this.calculateTotalInOrders(userAddress);

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balances: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      console.log('💾 [OrderBalance] Preparando para salvar:', {
        totalInOrders: orderData.totalOrders,
        totalInOrdersBRL: orderData.totalInOrdersBRL,
        ordersBreakdownCount: orderData.breakdown?.length || 0
      });

      // Usar transação para evitar race condition
      const updated = await prisma.$transaction(async (tx) => {
        // Buscar dados mais recentes dentro da transação
        const latestUser = await tx.user.findUnique({
          where: { id: userId },
          select: { balances: true }
        });

        const currentBalances = latestUser?.balances || {};

        // Atualizar apenas campos de orders, preservando todo o resto
        const updatedBalances = {
          ...currentBalances,
          totalInOrders: orderData.totalOrders,
          totalInOrdersBRL: orderData.totalInOrdersBRL, // Valor em BRL
          ordersBreakdown: orderData.breakdown,
          ordersUpdatedAt: orderData.updatedAt
        };

        await tx.user.update({
          where: { id: userId },
          data: {
            balances: updatedBalances
          }
        });

        return updatedBalances;
      });

      console.log('✅ [OrderBalance] Salvo no banco:', {
        totalInOrders: updated.totalInOrders,
        totalInOrdersBRL: updated.totalInOrdersBRL,
        ordersBreakdownCount: updated.ordersBreakdown?.length || 0
      });

      return {
        success: true,
        totalOrders: orderData.totalOrders,
        totalInOrdersBRL: orderData.totalInOrdersBRL,
        breakdown: orderData.breakdown
      };

    } catch (error) {
      console.error('Error updating user order balance:', error);
      throw error;
    }
  }

  /**
   * Buscar total em ordens do usuário do cache (banco de dados)
   */
  async getUserOrderBalance(userId) {
    try {
      const prisma = prismaConfig.getPrisma();

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balances: true }
      });

      if (!user || !user.balances) {
        return {
          totalInOrders: 0,
          totalInOrdersBRL: '0.00',
          ordersBreakdown: [],
          ordersUpdatedAt: null
        };
      }

      const balances = user.balances;
      return {
        totalInOrders: balances.totalInOrders || 0,
        totalInOrdersBRL: balances.totalInOrdersBRL || '0.00',
        ordersBreakdown: balances.ordersBreakdown || [],
        ordersUpdatedAt: balances.ordersUpdatedAt || null
      };

    } catch (error) {
      console.error('Error fetching user order balance:', error);
      return {
        totalInOrders: 0,
        totalInOrdersBRL: '0.00',
        ordersBreakdown: [],
        ordersUpdatedAt: null
      };
    }
  }
}

module.exports = new OrderBalanceService();

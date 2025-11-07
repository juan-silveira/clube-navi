/**
 * Balance Service
 *
 * Serviço para gerenciar saldos separados por tipo:
 * - Saldo de vendas (merchants): vem de vendas de produtos
 * - Saldo de depósito: vem de depósitos PIX
 * - Saldo de cashback: vem de cashback recebido
 *
 * REGRA DE NEGÓCIO:
 * - Apenas merchants podem sacar
 * - Merchants podem sacar apenas o saldo de vendas
 * - Consumidores NÃO podem sacar (saldo de depósito + cashback fica no app)
 */

const prisma = require('../config/database');

class BalanceService {
  /**
   * Calcula saldo de vendas de um merchant
   * Baseado em todas as vendas confirmadas (purchases com status 'completed')
   */
  async getMerchantSalesBalance(userId) {
    try {
      // Buscar todas as vendas confirmadas do merchant
      const sales = await prisma.purchase.findMany({
        where: {
          merchantId: userId,
          status: 'completed',
        },
        select: {
          totalPrice: true,
        },
      });

      // Somar total de vendas
      const totalSales = sales.reduce((sum, sale) => {
        return sum + parseFloat(sale.totalPrice);
      }, 0);

      // Buscar saques já realizados ou pendentes
      const withdrawals = await prisma.withdrawal.findMany({
        where: {
          userId,
          status: {
            in: ['pending', 'processing', 'completed'],
          },
        },
        select: {
          amount: true,
        },
      });

      // Somar total de saques
      const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => {
        return sum + parseFloat(withdrawal.amount);
      }, 0);

      // Saldo disponível = vendas - saques
      const availableBalance = totalSales - totalWithdrawals;

      return {
        totalSales,
        totalWithdrawals,
        availableBalance: Math.max(0, availableBalance), // Nunca negativo
      };
    } catch (error) {
      console.error('❌ [BalanceService] Erro ao calcular saldo de vendas:', error);
      throw error;
    }
  }

  /**
   * Calcula saldo de cashback de um usuário
   * Baseado em todas as transações de cashback recebidas
   */
  async getCashbackBalance(userId) {
    try {
      const cashbackTransactions = await prisma.cashbackTransaction.findMany({
        where: {
          recipientId: userId,
          status: 'completed',
        },
        select: {
          amount: true,
        },
      });

      const totalCashback = cashbackTransactions.reduce((sum, transaction) => {
        return sum + parseFloat(transaction.amount);
      }, 0);

      return {
        totalCashback,
        availableBalance: totalCashback,
      };
    } catch (error) {
      console.error('❌ [BalanceService] Erro ao calcular saldo de cashback:', error);
      throw error;
    }
  }

  /**
   * Calcula saldo de depósito de um usuário
   * Baseado em todas as transações de depósito confirmadas
   */
  async getDepositBalance(userId) {
    try {
      const deposits = await prisma.transaction.findMany({
        where: {
          userId,
          transactionType: 'deposit',
          status: 'confirmed',
        },
        select: {
          amount: true,
        },
      });

      const totalDeposits = deposits.reduce((sum, deposit) => {
        return sum + (parseFloat(deposit.amount) || 0);
      }, 0);

      return {
        totalDeposits,
        availableBalance: totalDeposits,
      };
    } catch (error) {
      console.error('❌ [BalanceService] Erro ao calcular saldo de depósito:', error);
      throw error;
    }
  }

  /**
   * Retorna todos os saldos de um usuário
   */
  async getAllBalances(userId, userType) {
    try {
      const balances = {
        sales: { totalSales: 0, totalWithdrawals: 0, availableBalance: 0 },
        cashback: { totalCashback: 0, availableBalance: 0 },
        deposit: { totalDeposits: 0, availableBalance: 0 },
        total: 0,
      };

      // Se for merchant, calcular saldo de vendas
      if (userType === 'merchant') {
        balances.sales = await this.getMerchantSalesBalance(userId);
      }

      // Todos os usuários podem ter cashback e depósito
      balances.cashback = await this.getCashbackBalance(userId);
      balances.deposit = await this.getDepositBalance(userId);

      // Total = vendas + cashback + depósito
      balances.total =
        balances.sales.availableBalance +
        balances.cashback.availableBalance +
        balances.deposit.availableBalance;

      return balances;
    } catch (error) {
      console.error('❌ [BalanceService] Erro ao calcular todos os saldos:', error);
      throw error;
    }
  }

  /**
   * Verifica se merchant pode sacar determinado valor
   */
  async canWithdraw(userId, amount, userType) {
    try {
      // Apenas merchants podem sacar
      if (userType !== 'merchant') {
        return {
          canWithdraw: false,
          reason: 'Apenas lojistas podem solicitar saques',
        };
      }

      // Verificar saldo disponível
      const salesBalance = await this.getMerchantSalesBalance(userId);

      if (amount > salesBalance.availableBalance) {
        return {
          canWithdraw: false,
          reason: 'Saldo insuficiente',
          available: salesBalance.availableBalance,
          requested: amount,
        };
      }

      return {
        canWithdraw: true,
        available: salesBalance.availableBalance,
      };
    } catch (error) {
      console.error('❌ [BalanceService] Erro ao verificar possibilidade de saque:', error);
      throw error;
    }
  }
}

module.exports = new BalanceService();

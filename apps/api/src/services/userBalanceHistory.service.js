const prismaConfig = require('../config/prisma');

// Função helper para obter Prisma
const getPrisma = () => prismaConfig.getPrisma();

class UserBalanceHistoryService {
  /**
   * Salvar snapshot dos saldos de todos os usuários ativos
   * Deve ser executado diariamente às 23:50
   */
  async createDailySnapshot(network = process.env.DEFAULT_NETWORK || 'testnet') {
    try {
      console.log(`[UserBalanceHistory] 🔄 Iniciando snapshot diário de saldos (${network})...`);

      // Buscar todos os usuários ativos
      const users = await getPrisma().user.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          balances: true,
          stakes: true,
          blockchainAddress: true,
          publicKey: true,
        },
      });

      console.log(`[UserBalanceHistory] 👥 Encontrados ${users.length} usuários ativos`);

      // Buscar contratos de stake para criar mapeamento (igual ao financial-report)
      const stakeContracts = await getPrisma().smartContract.findMany({
        where: {
          isActive: true,
          contractTypeId: '165a6e47-a216-4ac4-b96d-1c6d85ebb492', // Stake contract type
          network: network
        },
        select: {
          address: true,
          metadata: true
        }
      });

      console.log(`[UserBalanceHistory] 📊 Encontrados ${stakeContracts.length} contratos de stake`);

      // Buscar tokens referenciados pelos contratos de stake
      const stakeTokenAddresses = stakeContracts
        .map(c => c.metadata?.tokenAddress)
        .filter(Boolean);

      const stakeTokens = await getPrisma().smartContract.findMany({
        where: {
          address: { in: stakeTokenAddresses }
        },
        select: {
          address: true,
          metadata: true
        }
      });

      // Criar mapa de tokenAddress -> tokenSymbol
      const tokenAddressToSymbol = {};
      stakeTokens.forEach(token => {
        if (token.metadata?.symbol) {
          tokenAddressToSymbol[token.address.toLowerCase()] = token.metadata.symbol;
        }
      });

      // Mapear contratos de stake para símbolos de token
      const stakeContractToToken = {};
      stakeContracts.forEach(contract => {
        const tokenSymbol = contract.metadata?.tokenSymbol;
        const tokenAddress = contract.metadata?.tokenAddress;

        if (tokenSymbol) {
          stakeContractToToken[contract.address.toLowerCase()] = tokenSymbol;
        } else if (tokenAddress) {
          const symbol = tokenAddressToSymbol[tokenAddress.toLowerCase()];
          if (symbol) {
            stakeContractToToken[contract.address.toLowerCase()] = symbol;
          }
        }
      });

      console.log(`[UserBalanceHistory] 🗺️  Mapeamento de stake contracts:`, stakeContractToToken);

      // Buscar todas as ordens ativas de uma vez (igual ao financial-report)
      // IMPORTANTE: Usar publicKey (checksum) ao invés de blockchainAddress (lowercase)
      const userAddresses = users.map(u => u.publicKey || u.blockchainAddress).filter(Boolean);

      const activeOrders = await getPrisma().exchangeOrder.findMany({
        where: {
          userAddress: { in: userAddresses },
          status: 'ACTIVE',
          orderSide: 'LIMIT'
        },
        select: {
          userAddress: true,
          orderType: true,
          tokenASymbol: true,
          tokenBSymbol: true,
          remainingAmount: true,
          price: true
        }
      });

      console.log(`[UserBalanceHistory] 📋 Encontradas ${activeOrders.length} ordens ativas`);

      // Mapear ordens por userAddress (igual ao financial-report)
      const ordersMap = new Map();
      activeOrders.forEach(order => {
        if (!ordersMap.has(order.userAddress)) {
          ordersMap.set(order.userAddress, {});
        }
        const userOrders = ordersMap.get(order.userAddress);

        const orderType = order.orderType?.toUpperCase();
        const remainingAmount = parseFloat(order.remainingAmount?.toString() || '0');
        const price = parseFloat(order.price?.toString() || '0');

        if (orderType === 'BUY') {
          // Comprando tokenB com tokenA (cBRL)
          const tokenSymbol = order.tokenASymbol;
          const orderValue = remainingAmount * price;

          if (!userOrders[tokenSymbol]) {
            userOrders[tokenSymbol] = 0;
          }
          userOrders[tokenSymbol] += orderValue;
        } else if (orderType === 'SELL') {
          // Vendendo tokenB por tokenA (cBRL)
          const tokenSymbol = order.tokenBSymbol;

          if (!userOrders[tokenSymbol]) {
            userOrders[tokenSymbol] = 0;
          }
          userOrders[tokenSymbol] += remainingAmount;
        }
      });

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Criar snapshot para cada usuário
      for (const user of users) {
        try {
          // Pular usuários sem saldos
          if (!user.balances || Object.keys(user.balances).length === 0) {
            console.log(`[UserBalanceHistory] ⏭️  Usuário ${user.email} sem saldos, pulando...`);
            continue;
          }

          // IMPORTANTE: Usar publicKey (checksum) para buscar ordens
          const userAddress = user.publicKey || user.blockchainAddress;

          // Extrair balances da balancesTable
          const balancesTable = user.balances?.balancesTable || {};

          // Processar stakes: agrupar por tokenSymbol (igual ao financial-report)
          const stakesByToken = {};
          const stakesBreakdown = user.stakes?.breakdown || {};

          Object.entries(stakesBreakdown).forEach(([contractAddress, stakeContract]) => {
            let tokenSymbol = stakeContract.tokenSymbol;

            // Se não tem tokenSymbol no breakdown, buscar no mapeamento
            if (!tokenSymbol) {
              tokenSymbol = stakeContractToToken[contractAddress.toLowerCase()];
            }

            if (tokenSymbol) {
              // Converter de Wei (18 decimais) para token
              const balanceWei = parseFloat(stakeContract.balance || '0');
              const balanceToken = balanceWei / 1e18;

              if (!stakesByToken[tokenSymbol]) {
                stakesByToken[tokenSymbol] = 0;
              }
              stakesByToken[tokenSymbol] += balanceToken;
            }
          });

          // Processar orders
          const ordersByToken = ordersMap.get(userAddress) || {};

          // Calcular tokenData agregado (balance + stake + order)
          const allTokens = new Set([
            ...Object.keys(balancesTable),
            ...Object.keys(stakesByToken),
            ...Object.keys(ordersByToken)
          ]);

          const tokenData = {};
          allTokens.forEach(token => {
            const balance = parseFloat(balancesTable[token] || '0');
            const stake = stakesByToken[token] || 0;
            const order = ordersByToken[token] || 0;

            tokenData[token] = {
              balance: balance,
              stake: stake,
              order: order,
              total: balance + stake + order
            };
          });

          // Criar registro de snapshot com dados processados
          await getPrisma().userBalance.create({
            data: {
              userId: user.id,
              balances: user.balances, // Raw data (mantido para compatibilidade)
              stakes: user.stakes || {}, // Raw data (mantido para compatibilidade)
              tokenData: tokenData, // NOVO: Dados processados por token
              network,
            },
          });

          successCount++;
          console.log(`[UserBalanceHistory] ✅ Snapshot criado para ${user.email} (${Object.keys(tokenData).length} tokens)`);
        } catch (error) {
          errorCount++;
          errors.push({
            userId: user.id,
            email: user.email,
            error: error.message,
          });
          console.error(`[UserBalanceHistory] ❌ Erro ao criar snapshot para ${user.email}:`, error.message);
        }
      }

      const result = {
        success: true,
        message: 'Snapshot diário concluído',
        data: {
          totalUsers: users.length,
          successCount,
          errorCount,
          errors: errors.length > 0 ? errors : undefined,
        },
      };

      console.log(`[UserBalanceHistory] ✅ Snapshot concluído: ${successCount} sucesso, ${errorCount} erros`);

      return result;
    } catch (error) {
      console.error('[UserBalanceHistory] ❌ Erro ao criar snapshot diário:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao criar snapshot de saldos',
      };
    }
  }

  /**
   * Buscar saldo de um usuário em uma data específica
   * Retorna o snapshot mais próximo da data solicitada
   *
   * @param {string} userId - ID do usuário
   * @param {Date} date - Data de referência
   * @param {string} network - Network (mainnet/testnet)
   * @param {boolean} allowFallback - Se true, busca snapshot mais recente se não encontrar na data (default: true)
   */
  async getBalanceAtDate(userId, date, network = process.env.DEFAULT_NETWORK || 'testnet', allowFallback = true) {
    try {
      console.log(`[UserBalanceHistory] 🔍 Buscando snapshot:`);
      console.log(`   - userId: ${userId}`);
      console.log(`   - date: ${date.toISOString()}`);
      console.log(`   - network: ${network}`);
      console.log(`   - allowFallback: ${allowFallback}`);

      // Buscar o snapshot mais próximo da data (anterior ou igual)
      const snapshot = await getPrisma().userBalance.findFirst({
        where: {
          userId,
          network,
          createdAt: {
            lte: date,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!snapshot) {
        console.log(`[UserBalanceHistory] ❌ Nenhum snapshot encontrado para a data solicitada`);

        // Se allowFallback = false, retornar dados vazios imediatamente
        if (!allowFallback) {
          console.log(`[UserBalanceHistory] ⚠️  allowFallback=false - Retornando dados vazios`);
          return {
            success: true,
            noData: true,
            data: {
              balances: {},
              stakes: {},
              tokenData: {},
              snapshotDate: null,
            },
          };
        }

        console.log(`[UserBalanceHistory] 🔄 Tentando fallback: buscar snapshot mais recente...`);

        // DEBUG: Verificar quantos snapshots existem para este usuário (qualquer network)
        const allUserSnapshots = await getPrisma().userBalance.findMany({
          where: { userId },
          select: {
            id: true,
            createdAt: true,
            network: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        console.log(`[UserBalanceHistory] 🔍 DEBUG: Total de snapshots encontrados para userId ${userId}: ${allUserSnapshots.length}`);
        if (allUserSnapshots.length > 0) {
          console.log(`[UserBalanceHistory] 🔍 DEBUG: Snapshots disponíveis:`);
          allUserSnapshots.forEach((snap, idx) => {
            console.log(`   ${idx + 1}. ID: ${snap.id}, Data: ${snap.createdAt.toISOString()}, Network: ${snap.network}`);
          });
        }

        // FALLBACK: Buscar o snapshot mais recente disponível (qualquer data, mesma network)
        const mostRecentSnapshot = await getPrisma().userBalance.findFirst({
          where: {
            userId,
            network,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!mostRecentSnapshot) {
          console.log(`[UserBalanceHistory] ❌ Nenhum snapshot encontrado para network: ${network}`);

          // SUPER FALLBACK: Tentar buscar em qualquer network
          console.log(`[UserBalanceHistory] 🔄 SUPER FALLBACK: Buscando em qualquer network...`);
          const anyNetworkSnapshot = await getPrisma().userBalance.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });

          if (!anyNetworkSnapshot) {
            console.log(`[UserBalanceHistory] ❌ Nenhum snapshot encontrado em nenhuma network`);
            return {
              success: false,
              message: 'Nenhum snapshot encontrado para este usuário',
            };
          }

          console.log(`[UserBalanceHistory] ✅ SUPER FALLBACK: Encontrado snapshot em network diferente!`);
          console.log(`   - Data: ${anyNetworkSnapshot.createdAt.toISOString()}`);
          console.log(`   - Network encontrada: ${anyNetworkSnapshot.network}`);
          console.log(`   - Network solicitada: ${network}`);
          console.log(`   - Balances keys: ${Object.keys(anyNetworkSnapshot.balances || {}).length}`);
          console.log(`   - TokenData keys: ${Object.keys(anyNetworkSnapshot.tokenData || {}).length}`);

          return {
            success: true,
            data: {
              balances: anyNetworkSnapshot.balances,
              stakes: anyNetworkSnapshot.stakes || {},
              tokenData: anyNetworkSnapshot.tokenData || null, // NOVO: Dados pré-calculados
              snapshotDate: anyNetworkSnapshot.createdAt,
            },
            usedFallback: true,
            usedDifferentNetwork: true,
          };
        }

        console.log(`[UserBalanceHistory] ✅ FALLBACK: Usando snapshot mais recente:`);
        console.log(`   - Data: ${mostRecentSnapshot.createdAt.toISOString()}`);
        console.log(`   - Network: ${mostRecentSnapshot.network}`);
        console.log(`   - Balances keys: ${Object.keys(mostRecentSnapshot.balances || {}).length}`);
        console.log(`   - Stakes keys: ${Object.keys(mostRecentSnapshot.stakes || {}).length}`);
        console.log(`   - TokenData keys: ${Object.keys(mostRecentSnapshot.tokenData || {}).length}`);
        console.log(`   ⚠️  ATENÇÃO: Snapshot é de data diferente da solicitada!`);

        return {
          success: true,
          data: {
            balances: mostRecentSnapshot.balances,
            stakes: mostRecentSnapshot.stakes || {},
            tokenData: mostRecentSnapshot.tokenData || null, // NOVO: Dados pré-calculados
            snapshotDate: mostRecentSnapshot.createdAt,
          },
          usedFallback: true, // Flag indicando que usou fallback
        };
      }

      console.log(`[UserBalanceHistory] ✅ Snapshot encontrado:`);
      console.log(`   - Data: ${snapshot.createdAt.toISOString()}`);
      console.log(`   - Network: ${snapshot.network}`);
      console.log(`   - Balances keys: ${Object.keys(snapshot.balances || {}).length}`);
      console.log(`   - Stakes keys: ${Object.keys(snapshot.stakes || {}).length}`);
      console.log(`   - TokenData keys: ${Object.keys(snapshot.tokenData || {}).length}`);

      return {
        success: true,
        data: {
          balances: snapshot.balances,
          stakes: snapshot.stakes || {},
          tokenData: snapshot.tokenData || null, // NOVO: Dados pré-calculados
          snapshotDate: snapshot.createdAt,
        },
      };
    } catch (error) {
      console.error('[UserBalanceHistory] Erro ao buscar saldo na data:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao buscar saldo histórico',
      };
    }
  }

  /**
   * Buscar todos os snapshots de um usuário em um período
   */
  async getUserBalanceHistory(userId, startDate, endDate, network = process.env.DEFAULT_NETWORK || 'testnet') {
    try {
      const snapshots = await getPrisma().userBalance.findMany({
        where: {
          userId,
          network,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return {
        success: true,
        data: snapshots,
      };
    } catch (error) {
      console.error('[UserBalanceHistory] Erro ao buscar histórico:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao buscar histórico de saldos',
      };
    }
  }

  /**
   * Limpar snapshots antigos (manter apenas os últimos N dias)
   * Útil para manutenção do banco de dados
   */
  async cleanOldSnapshots(daysToKeep = 365, network = process.env.DEFAULT_NETWORK || 'testnet') {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await getPrisma().userBalance.deleteMany({
        where: {
          network,
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`[UserBalanceHistory] 🗑️  ${result.count} snapshots antigos removidos`);

      return {
        success: true,
        message: `${result.count} snapshots removidos`,
        data: {
          deletedCount: result.count,
          cutoffDate,
        },
      };
    } catch (error) {
      console.error('[UserBalanceHistory] Erro ao limpar snapshots antigos:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao limpar snapshots antigos',
      };
    }
  }

  /**
   * Obter estatísticas dos snapshots
   */
  async getSnapshotStats(network = process.env.DEFAULT_NETWORK || 'testnet') {
    try {
      const [total, oldestSnapshot, newestSnapshot, userCount] = await Promise.all([
        getPrisma().userBalance.count({ where: { network } }),
        getPrisma().userBalance.findFirst({
          where: { network },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        }),
        getPrisma().userBalance.findFirst({
          where: { network },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
        getPrisma().userBalance.groupBy({
          by: ['userId'],
          where: { network },
          _count: true,
        }),
      ]);

      return {
        success: true,
        data: {
          totalSnapshots: total,
          uniqueUsers: userCount.length,
          oldestSnapshot: oldestSnapshot?.createdAt,
          newestSnapshot: newestSnapshot?.createdAt,
          averageSnapshotsPerUser: userCount.length > 0 ? (total / userCount.length).toFixed(2) : 0,
        },
      };
    } catch (error) {
      console.error('[UserBalanceHistory] Erro ao obter estatísticas:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao obter estatísticas',
      };
    }
  }
}

module.exports = new UserBalanceHistoryService();

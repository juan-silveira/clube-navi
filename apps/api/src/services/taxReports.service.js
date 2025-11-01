const prismaConfig = require('../config/prisma');
const userBalanceHistoryService = require('./userBalanceHistory.service');

// Função helper para obter Prisma
const getPrisma = () => prismaConfig.getPrisma();

class TaxReportsService {
  /**
   * Campos de metadados que devem ser ignorados ao extrair saldos
   * (não são tokens, são informações sobre o usuário)
   */
  METADATA_FIELDS = [
    'address',
    'timestamp',
    'lastUpdate',
    'totalStake',
    'totalTokens',
    'totalInOrders',
    'ordersUpdatedAt',
    'totalStakeUpdatedAt',
    'updatedAt',
    'createdAt'
  ];

  /**
   * Verificar se uma chave é um token válido (não é metadado)
   */
  isTokenKey(key) {
    // Ignorar campos de metadados conhecidos
    if (this.METADATA_FIELDS.includes(key)) {
      return false;
    }

    // Tokens geralmente têm símbolos alfanuméricos (2-20 caracteres)
    // Aceitar maiúsculas e minúsculas para ser mais flexível
    if (key.length < 2 || key.length > 20) {
      return false;
    }

    // Token deve conter apenas letras e números (sem caracteres especiais)
    if (!/^[a-zA-Z0-9]+$/.test(key)) {
      return false;
    }

    // Token deve começar com letra
    if (!/^[a-zA-Z]/.test(key)) {
      return false;
    }

    return true;
  }

  /**
   * Extrair informações de stake dos dados
   * Prioriza o novo campo stakes, mas faz fallback para balances.stakeBreakdown
   */
  extractStakeInfo(stakes, balances) {
    // Se stakes existe e tem breakdown, usar ele
    if (stakes && stakes.breakdown && Object.keys(stakes.breakdown).length > 0) {
      console.log('[TaxReports] Using stakes from dedicated field');
      return stakes;
    }

    // Fallback: buscar de balances.stakeBreakdown (compatibilidade)
    if (balances && balances.stakeBreakdown && balances.stakeBreakdown.length > 0) {
      console.log('[TaxReports] Using stakes from balances.stakeBreakdown (legacy)');

      const breakdown = {};
      balances.stakeBreakdown.forEach(item => {
        breakdown[item.contract] = {
          balance: item.balance,
          network: item.network,
          contractName: item.contractName || item.contract
        };
      });

      return {
        total: balances.totalStake || '0',
        breakdown: breakdown,
        updatedAt: balances.totalStakeUpdatedAt || null
      };
    }

    // Sem stakes
    console.log('[TaxReports] No stakes found');
    return {
      total: '0',
      breakdown: {},
      updatedAt: null
    };
  }

  /**
   * Buscar ordens ativas do usuário direto do banco de dados
   * Usa a mesma lógica do financial-report
   */
  async getActiveOrders(userAddress) {
    if (!userAddress) {
      console.log('[TaxReports] No userAddress provided for getActiveOrders');
      return {};
    }

    try {
      const activeOrders = await getPrisma().exchangeOrder.findMany({
        where: {
          userAddress: userAddress,
          status: 'ACTIVE',
          orderSide: 'LIMIT'
        },
        select: {
          userAddress: true,
          exchangeContractAddress: true,
          orderType: true,
          orderSide: true,
          tokenASymbol: true,
          tokenBSymbol: true,
          amount: true,
          remainingAmount: true,
          price: true
        }
      });

      console.log(`[TaxReports] Found ${activeOrders.length} active orders for ${userAddress}`);

      // Processar ordens igual ao financial-report
      const ordersByToken = {};

      activeOrders.forEach(order => {
        const orderType = order.orderType?.toUpperCase();
        const remainingAmount = parseFloat(order.remainingAmount?.toString() || '0');
        const price = parseFloat(order.price?.toString() || '0');

        if (orderType === 'BUY') {
          // Comprando tokenB com tokenA (cBRL), então adiciona valor em cBRL
          const tokenSymbol = order.tokenASymbol;
          const orderValue = remainingAmount * price;

          if (!ordersByToken[tokenSymbol]) {
            ordersByToken[tokenSymbol] = 0;
          }
          ordersByToken[tokenSymbol] += orderValue;

          console.log(`[TaxReports]   BUY: ${remainingAmount} ${order.tokenBSymbol} @ ${price} = ${orderValue.toFixed(6)} ${tokenSymbol}`);
        } else if (orderType === 'SELL') {
          // Vendendo tokenB por tokenA (cBRL), então adiciona quantidade em tokenB
          const tokenSymbol = order.tokenBSymbol;

          if (!ordersByToken[tokenSymbol]) {
            ordersByToken[tokenSymbol] = 0;
          }
          ordersByToken[tokenSymbol] += remainingAmount;

          console.log(`[TaxReports]   SELL: ${remainingAmount} ${tokenSymbol}`);
        }
      });

      console.log('[TaxReports] Orders by token:', ordersByToken);
      return ordersByToken;
    } catch (error) {
      console.error('[TaxReports] Error fetching active orders:', error);
      return {};
    }
  }

  /**
   * Extrair informações de ordens dos dados do snapshot (DEPRECATED - usar getActiveOrders)
   * Agrupa orders por token (igual ao financial-report)
   *
   * Lógica:
   * - BUY: quantidade × preço = cBRL em ordem
   * - SELL: quantidade = token em ordem
   */
  extractOrdersInfo(balances) {
    const ordersByToken = {};

    if (!balances || !balances.ordersBreakdown) {
      console.log('[TaxReports] No orders found in snapshot');
      return ordersByToken;
    }

    console.log('[TaxReports] Extracting orders from ordersBreakdown');
    console.log('[TaxReports] ordersBreakdown structure:', JSON.stringify(balances.ordersBreakdown, null, 2));

    // ordersBreakdown é pré-processado e agrupa por token
    // Formato: [{ token: "PCN", total: "34.65", orders: [...], totalBRL: "34.65", marketPrice: "1.00" }]
    //
    // IMPORTANTE: O campo "total" pode significar:
    // - Para cBRL: valor em cBRL bloqueado nas ordens
    // - Para outros tokens: quantidade do token bloqueada nas ordens
    balances.ordersBreakdown.forEach((orderGroup, groupIdx) => {
      const token = orderGroup.token; // Ex: "PCN" ou "cBRL"
      const total = parseFloat(orderGroup.total || '0');
      const totalBRL = parseFloat(orderGroup.totalBRL || '0');
      const marketPrice = parseFloat(orderGroup.marketPrice || '1');
      const orders = orderGroup.orders || [];

      console.log(`[TaxReports] Processing orderGroup ${groupIdx + 1}: token=${token}, total=${total}, totalBRL=${totalBRL}, marketPrice=${marketPrice}`);

      // Analisar o tipo predominante das ordens (BUY ou SELL)
      const orderTypes = orders.map(o => o.type?.toUpperCase()).filter(Boolean);
      const hasBuy = orderTypes.includes('BUY');
      const hasSell = orderTypes.includes('SELL');

      console.log(`[TaxReports]   Order types: ${orderTypes.join(', ')}, hasBuy=${hasBuy}, hasSell=${hasSell}`);

      // Lógica:
      // 1. Se token="cBRL": o total já está em cBRL
      // 2. Se é BUY de outro token: preciso converter para cBRL (total * marketPrice)
      // 3. Se é SELL de outro token: o total é a quantidade do token

      if (token === 'cBRL') {
        // Total em cBRL já está correto
        if (!ordersByToken['cBRL']) {
          ordersByToken['cBRL'] = 0;
        }
        ordersByToken['cBRL'] += total;
        console.log(`[TaxReports]   ✅ Added ${total} cBRL to orders`);
      } else if (hasBuy && !hasSell) {
        // Comprando este token (ex: comprando PCN com cBRL)
        // O total representa a quantidade do token sendo comprado
        // Valor em cBRL = total * marketPrice (ou usar totalBRL se disponível)
        const cBRLValue = totalBRL > 0 ? totalBRL : total * marketPrice;

        if (!ordersByToken['cBRL']) {
          ordersByToken['cBRL'] = 0;
        }
        ordersByToken['cBRL'] += cBRLValue;
        console.log(`[TaxReports]   ✅ BUY: Added ${cBRLValue.toFixed(6)} cBRL (buying ${total} ${token} @ ${marketPrice})`);
      } else if (hasSell && !hasBuy) {
        // Vendendo este token (ex: vendendo PCN por cBRL)
        // O total representa a quantidade do token sendo vendido
        if (!ordersByToken[token]) {
          ordersByToken[token] = 0;
        }
        ordersByToken[token] += total;
        console.log(`[TaxReports]   ✅ SELL: Added ${total} ${token} to orders`);
      } else if (hasBuy && hasSell) {
        // Tem ordens de compra E venda do mesmo token
        // Processar ordem por ordem
        console.log(`[TaxReports]   ⚠️  Mixed orders (BUY and SELL), processing individually...`);

        orders.forEach((order, orderIdx) => {
          const orderType = order.type?.toUpperCase();
          const amount = parseFloat(order.amount || '0');

          if (orderType === 'BUY') {
            const cBRLValue = amount * marketPrice;
            if (!ordersByToken['cBRL']) {
              ordersByToken['cBRL'] = 0;
            }
            ordersByToken['cBRL'] += cBRLValue;
            console.log(`[TaxReports]     Order ${orderIdx + 1}: BUY ${amount} ${token} = ${cBRLValue.toFixed(6)} cBRL`);
          } else if (orderType === 'SELL') {
            if (!ordersByToken[token]) {
              ordersByToken[token] = 0;
            }
            ordersByToken[token] += amount;
            console.log(`[TaxReports]     Order ${orderIdx + 1}: SELL ${amount} ${token}`);
          }
        });
      }
    });

    // Converter para string para manter compatibilidade
    Object.keys(ordersByToken).forEach(token => {
      const value = ordersByToken[token];
      console.log(`[TaxReports] Total em ordens: ${value} ${token}`);
    });

    return ordersByToken;
  }

  /**
   * Calcular totais agrupados por token (balance + stake + orders)
   * Usa a mesma lógica do financial-report
   */
  calculateTotalsByToken(balances, stakes, orders) {
    const totals = {};
    const allTokens = new Set([
      ...Object.keys(balances || {}),
      ...Object.keys(orders || {})
    ]);

    // Processar stakes: agrupar por tokenSymbol
    const stakesByToken = {};
    if (stakes && stakes.breakdown) {
      Object.entries(stakes.breakdown).forEach(([contractAddress, stakeContract]) => {
        const tokenSymbol = stakeContract.tokenSymbol;

        if (tokenSymbol) {
          // Converter de Wei (18 decimais) para token
          const balanceWei = parseFloat(stakeContract.balance || '0');
          const balanceToken = balanceWei / 1e18;

          if (!stakesByToken[tokenSymbol]) {
            stakesByToken[tokenSymbol] = 0;
          }
          stakesByToken[tokenSymbol] += balanceToken;

          allTokens.add(tokenSymbol);
        }
      });
    }

    // Calcular totais para cada token
    allTokens.forEach(token => {
      const balance = parseFloat(balances[token] || '0');
      const stake = stakesByToken[token] || 0;
      const order = parseFloat(orders[token] || '0');

      totals[token] = balance + stake + order;

      console.log(`[TaxReports] Token ${token}: balance=${balance}, stake=${stake}, order=${order}, total=${totals[token]}`);
    });

    return totals;
  }

  /**
   * Extrair apenas saldos de tokens, ignorando metadados
   */
  extractTokenBalances(balances) {
    if (!balances || typeof balances !== 'object') {
      console.log('[TaxReports] extractTokenBalances: balances is empty or not an object');
      return {};
    }

    console.log('[TaxReports] extractTokenBalances: Input structure:', JSON.stringify(balances, null, 2).substring(0, 500));

    // IMPORTANTE: Os tokens podem estar em diferentes lugares:
    // 1. balances.balances (estrutura mais comum)
    // 2. balances.balancesTable
    // 3. balances direto (estrutura antiga)
    let source = balances;

    if (balances.balances && typeof balances.balances === 'object') {
      console.log('[TaxReports] extractTokenBalances: Using balances.balances');
      source = balances.balances;
    } else if (balances.balancesTable && typeof balances.balancesTable === 'object') {
      console.log('[TaxReports] extractTokenBalances: Using balances.balancesTable');
      source = balances.balancesTable;
    } else {
      console.log('[TaxReports] extractTokenBalances: Using balances directly');
    }

    console.log('[TaxReports] extractTokenBalances: Keys found:', Object.keys(source));

    const tokenBalances = {};
    Object.keys(source).forEach(key => {
      // Pular metadados conhecidos
      if (this.METADATA_FIELDS.includes(key)) {
        console.log(`[TaxReports] ⏭️ Skipped metadata: ${key}`);
        return;
      }

      const rawValue = source[key];
      const normalizedValue = this.normalizeValue(rawValue);

      console.log(`[TaxReports] Key: "${key}" | RawValue: ${rawValue} | Normalized: ${normalizedValue}`);

      // Adicionar se for um valor numérico válido
      if (!isNaN(normalizedValue) && normalizedValue !== null && normalizedValue !== undefined) {
        tokenBalances[key] = normalizedValue;
        console.log(`[TaxReports] ✅ Added token: ${key} = ${normalizedValue}`);
      } else {
        console.log(`[TaxReports] ⚠️ Skipped ${key}: invalid value (${normalizedValue})`);
      }
    });

    console.log('[TaxReports] Final token balances:', tokenBalances);
    return tokenBalances;
  }

  /**
   * Converter valor de wei (18 decimais) para unidade normal
   */
  fromWei(value) {
    if (!value || value === 0) return 0;
    return parseFloat(value) / Math.pow(10, 18);
  }

  /**
   * Verificar se um valor parece estar em wei (muito grande)
   */
  isWeiValue(value) {
    const num = parseFloat(value);
    return num > 1000000000000; // Se for maior que 1 trilhão, provavelmente é wei
  }

  /**
   * Normalizar valor (converter de wei se necessário)
   */
  normalizeValue(value) {
    if (!value || value === 0) return 0;
    const num = parseFloat(value);
    return this.isWeiValue(num) ? this.fromWei(num) : num;
  }
  /**
   * Obter saldo do usuário em uma data específica
   * Busca de snapshots históricos + ordens ativas do banco
   *
   * @param {string} userId - ID do usuário
   * @param {Date} date - Data alvo
   * @param {string} network - Network (testnet/mainnet)
   * @param {string} userAddress - Endereço blockchain do usuário (opcional, para buscar ordens ativas)
   */
  async getBalanceAtDate(userId, date, network = process.env.DEFAULT_NETWORK || 'testnet', userAddress = null) {
    try {
      console.log(`[TaxReports] Buscando saldo para usuário ${userId} na data ${date.toISOString()}`);

      // Para datas futuras, ajustar para usar a data de hoje
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const targetDate = date > today ? today : date;
      const isFutureOrToday = date >= today;

      if (date > today) {
        console.log(`[TaxReports] ⚠️  Data solicitada (${date.toLocaleDateString('pt-BR')}) é futura, usando data atual (${today.toLocaleDateString('pt-BR')})`);
      }

      // Buscar snapshot do histórico
      // allowFallback = false quando procuramos por data específica de 31/12, para evitar pegar snapshots futuros
      const isEndOfYear = targetDate.getMonth() === 11 && targetDate.getDate() === 31;
      console.log(`[TaxReports] Buscando snapshot para ${targetDate.toLocaleDateString('pt-BR')} (isEndOfYear: ${isEndOfYear})...`);
      const snapshotResult = await userBalanceHistoryService.getBalanceAtDate(userId, targetDate, network, !isEndOfYear);

      if (snapshotResult.success) {
        // Se noData = true, retornar dados vazios
        if (snapshotResult.noData) {
          console.log(`[TaxReports] ⚠️  Snapshot não encontrado (noData=true) - usuário não tinha saldos nesta data`);
          return {
            success: true,
            data: {},
            balances: {},
            stakes: {
              total: '0',
              breakdown: {},
              updatedAt: null
            },
            stakesOnly: {},
            orders: {},
            snapshotDate: null,
            noData: true,
          };
        }

        console.log(`[TaxReports] ✅ Snapshot encontrado (${new Date(snapshotResult.data.snapshotDate).toLocaleDateString('pt-BR')})`);

        // NOVO: Se o snapshot tem tokenData pré-calculado, usar direto
        if (snapshotResult.data.tokenData) {
          console.log(`[TaxReports] 🎯 Usando tokenData pré-calculado do snapshot`);

          const tokenData = snapshotResult.data.tokenData;

          // Extrair dados separados
          const totals = {};
          const balancesOnly = {};
          const ordersOnly = {};
          const stakesOnly = {};

          Object.entries(tokenData).forEach(([token, data]) => {
            totals[token] = data.total;
            balancesOnly[token] = data.balance;
            ordersOnly[token] = data.order;
            stakesOnly[token] = data.stake;
          });

          // Stakes detalhados (raw data)
          const stakes = this.extractStakeInfo(snapshotResult.data.stakes, snapshotResult.data.balances);

          console.log(`[TaxReports] TokenData: ${Object.keys(tokenData).length} tokens processados`);

          return {
            success: true,
            data: totals, // Totais pré-calculados (balance + stake + orders)
            balances: balancesOnly, // Apenas balances
            stakes: stakes, // Stakes detalhados (para breakdown)
            stakesOnly: stakesOnly, // NOVO: Stakes agregados por token
            orders: ordersOnly, // Apenas orders
            snapshotDate: snapshotResult.data.snapshotDate,
          };
        }

        // FALLBACK: Snapshot antigo sem tokenData - calcular na hora
        console.log(`[TaxReports] ⚠️  Snapshot antigo sem tokenData, calculando...`);

        const tokenBalances = this.extractTokenBalances(snapshotResult.data.balances);
        const stakes = this.extractStakeInfo(snapshotResult.data.stakes, snapshotResult.data.balances);

        // Calcular stakesOnly agregado por token
        const stakesOnly = {};
        if (stakes && stakes.breakdown) {
          Object.values(stakes.breakdown).forEach(stakeContract => {
            const tokenSymbol = stakeContract.tokenSymbol;
            if (tokenSymbol) {
              const balanceWei = parseFloat(stakeContract.balance || '0');
              const balanceToken = balanceWei / 1e18;

              if (!stakesOnly[tokenSymbol]) {
                stakesOnly[tokenSymbol] = 0;
              }
              stakesOnly[tokenSymbol] += balanceToken;
            }
          });
        }

        // Para snapshot antigo, tentar buscar ordens se for data atual
        let orders = {};
        if (isFutureOrToday && userAddress) {
          console.log(`[TaxReports] Buscando ordens ativas do banco (data atual)`);
          orders = await this.getActiveOrders(userAddress);
        } else {
          console.log(`[TaxReports] Data passada - ordens não disponíveis (usando 0)`);
        }

        const totals = this.calculateTotalsByToken(tokenBalances, stakes, orders);

        console.log(`[TaxReports] Balances: ${Object.keys(tokenBalances).length} tokens`);
        console.log(`[TaxReports] Stakes: ${Object.keys(stakes.breakdown || {}).length} contracts`);
        console.log(`[TaxReports] StakesOnly: ${Object.keys(stakesOnly).length} tokens`);
        console.log(`[TaxReports] Orders: ${Object.keys(orders).length} tokens`);

        return {
          success: true,
          data: totals,
          balances: tokenBalances,
          stakes: stakes,
          stakesOnly: stakesOnly, // NOVO: Stakes agregados por token
          orders: orders,
          snapshotDate: snapshotResult.data.snapshotDate,
        };
      }

      // Se não encontrou snapshot, retornar vazio (não havia saldos naquela data)
      console.log(`[TaxReports] ⚠️  Nenhum snapshot encontrado para ${targetDate.toLocaleDateString('pt-BR')} - usuário não tinha saldos nesta data`);

      return {
        success: true,
        data: {}, // Saldos vazios
        stakes: {
          total: '0',
          breakdown: {},
          updatedAt: null
        },
        snapshotDate: null, // Indica que não há snapshot
        noData: true, // Flag para indicar que não havia dados
      };
    } catch (error) {
      console.error('Erro ao obter saldo na data:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao buscar saldo histórico',
      };
    }
  }

  /**
   * Obter resumo detalhado de trades de um ano
   * Mostra ambos os lados de cada transação (o que recebeu e o que pagou)
   */
  async getTradesSummary(userId, year) {
    try {
      // Buscar usuário para obter endereço blockchain
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
        select: { blockchainAddress: true },
      });

      if (!user || !user.blockchainAddress) {
        return { trades: [], summary: {} };
      }

      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      const userAddress = user.blockchainAddress.toLowerCase();

      // Buscar TODOS os trades do usuário (como comprador OU vendedor)
      const trades = await getPrisma().exchangeTrade.findMany({
        where: {
          OR: [
            { buyerAddress: userAddress },
            { sellerAddress: userAddress },
          ],
          tradeTimestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          tokenASymbol: true,
          tokenBSymbol: true,
          amount: true,
          totalValue: true,
          price: true,
          buyerAddress: true,
          sellerAddress: true,
          tradeTimestamp: true,
          transactionHash: true,
        },
        orderBy: {
          tradeTimestamp: 'desc',
        },
      });

      // Processar cada trade para extrair o que o usuário recebeu/pagou
      const tradesList = [];
      const summary = {}; // { token: { bought: amount, sold: amount, boughtValueBRL, soldValueBRL, netBalance } }

      trades.forEach(trade => {
        const isBuyer = trade.buyerAddress.toLowerCase() === userAddress;

        const tokenReceived = isBuyer ? trade.tokenASymbol : trade.tokenBSymbol;
        const amountReceived = isBuyer
          ? this.normalizeValue(trade.amount)
          : this.normalizeValue(trade.totalValue);

        const tokenPaid = isBuyer ? trade.tokenBSymbol : trade.tokenASymbol;
        const amountPaid = isBuyer
          ? this.normalizeValue(trade.totalValue)
          : this.normalizeValue(trade.amount);

        // Calcular valor em BRL (baseado em cBRL)
        let valueBRL = 0;
        if (tokenReceived === 'cBRL') {
          valueBRL = amountReceived;
        } else if (tokenPaid === 'cBRL') {
          valueBRL = amountPaid;
        }

        // Adicionar à lista detalhada
        tradesList.push({
          id: trade.id,
          date: trade.tradeTimestamp,
          type: isBuyer ? 'BUY' : 'SELL',
          pair: `${trade.tokenASymbol}/${trade.tokenBSymbol}`,
          tokenReceived,
          amountReceived,
          tokenPaid,
          amountPaid,
          valueBRL,
          price: this.normalizeValue(trade.price),
          transactionHash: trade.transactionHash,
        });

        // Atualizar resumo - token recebido
        if (!summary[tokenReceived]) {
          summary[tokenReceived] = {
            bought: 0,
            sold: 0,
            boughtValueBRL: 0,
            soldValueBRL: 0,
            netBalance: 0,
            netValueBRL: 0
          };
        }
        summary[tokenReceived].bought += amountReceived;
        if (tokenReceived !== 'cBRL' && tokenPaid === 'cBRL') {
          summary[tokenReceived].boughtValueBRL += amountPaid; // Valor pago em cBRL
        }

        // Atualizar resumo - token pago
        if (!summary[tokenPaid]) {
          summary[tokenPaid] = {
            bought: 0,
            sold: 0,
            boughtValueBRL: 0,
            soldValueBRL: 0,
            netBalance: 0,
            netValueBRL: 0
          };
        }
        summary[tokenPaid].sold += amountPaid;
        if (tokenPaid !== 'cBRL' && tokenReceived === 'cBRL') {
          summary[tokenPaid].soldValueBRL += amountReceived; // Valor recebido em cBRL
        }
      });

      // Calcular balanço líquido de cada token
      Object.keys(summary).forEach(token => {
        summary[token].netBalance = summary[token].bought - summary[token].sold;

        // Para cBRL, o valor em BRL é o próprio saldo do token
        if (token === 'cBRL') {
          summary[token].boughtValueBRL = summary[token].bought;
          summary[token].soldValueBRL = summary[token].sold;
          summary[token].netValueBRL = summary[token].netBalance;
        } else {
          summary[token].netValueBRL = summary[token].boughtValueBRL - summary[token].soldValueBRL;
        }
      });

      return {
        trades: tradesList,
        summary
      };
    } catch (error) {
      console.error('[TaxReports] Erro ao buscar resumo de trades:', error);
      return { trades: [], summary: {} };
    }
  }

  /**
   * Obter saldos em ordens (orders abertas)
   */
  async getOrdersBalance(blockchainAddress) {
    try {
      if (!blockchainAddress) {
        return {};
      }

      // Buscar ordens abertas do usuário
      const orders = await getPrisma().exchangeOrder.findMany({
        where: {
          userAddress: blockchainAddress.toLowerCase(),
          status: 'open',
        },
        select: {
          tokenASymbol: true,
          remainingAmount: true,
        },
      });

      // Agrupar por token
      const ordersBalance = {};
      orders.forEach(order => {
        const symbol = order.tokenASymbol;
        const amount = this.normalizeValue(order.remainingAmount);
        ordersBalance[symbol] = (ordersBalance[symbol] || 0) + amount;
      });

      return ordersBalance;
    } catch (error) {
      console.error('[TaxReports] Erro ao buscar saldos em ordens:', error);
      return {};
    }
  }

  /**
   * Obter earnings agrupados por produto/contrato
   */
  async getEarningsGroupedByProduct(userId, year, network = process.env.DEFAULT_NETWORK || 'testnet') {
    try {
      // Definir período do ano
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

      // Buscar earnings do período
      const earnings = await getPrisma().earnings.findMany({
        where: {
          userId,
          network,
          isActive: true,
          distributionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          distributionDate: 'asc',
        },
      });

      // Buscar contratos de stake e tokens
      const [stakeContracts, tokenContracts] = await Promise.all([
        getPrisma().smartContract.findMany({
          where: {
            network,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            address: true,
            metadata: true,
          },
        }),
        // Buscar contratos de tokens para fazer o mapeamento symbol -> address
        getPrisma().smartContract.findMany({
          where: {
            network,
            isActive: true,
          },
          select: {
            address: true,
            metadata: true,
          },
        })
      ]);

      // Criar mapa de symbol -> tokenAddress
      const symbolToAddressMap = {};
      tokenContracts.forEach(token => {
        const metadata = token.metadata || {};
        if (metadata.symbol) {
          symbolToAddressMap[metadata.symbol] = token.address.toLowerCase();
        }
      });

      // Filtrar apenas contratos de stake (excluir exchanges)
      const filteredStakeContracts = stakeContracts.filter(c => {
        const metadata = c.metadata || {};
        return metadata.contractType === 'stake' || !metadata.contractType || !c.name.includes('Exchange');
      });

      // Agrupar earnings por token/produto
      const earningsByProduct = {};

      earnings.forEach(earning => {
        const symbol = earning.tokenSymbol;

        if (!earningsByProduct[symbol]) {
          // Tentar encontrar informações do contrato de stake
          const tokenAddress = symbolToAddressMap[symbol]; // Buscar endereço do token pelo símbolo

          const contract = filteredStakeContracts.find(c => {
            const metadata = c.metadata || {};
            // Primeiro tentar match por tokenAddress (mais preciso)
            if (tokenAddress && metadata.tokenAddress?.toLowerCase() === tokenAddress) {
              return true;
            }
            // Depois por code
            if (metadata.code === symbol) {
              return true;
            }
            // Por último, verificar se o nome inclui o símbolo (mas não é um Exchange)
            if (c.name.includes(symbol) && !c.name.includes('Exchange')) {
              return true;
            }
            return false;
          });

          earningsByProduct[symbol] = {
            tokenSymbol: symbol,
            tokenName: earning.tokenName,
            productName: contract?.name || earning.tokenName,
            productType: contract?.metadata?.investment_type || 'stake',
            contractAddress: contract?.address,
            riskLevel: contract?.metadata?.risk,
            distributions: [],
            totalAmount: 0,
            totalValueBRL: 0,
            count: 0,
          };
        }

        // Adicionar distribuição
        const valueBRL = parseFloat(earning.amount) * parseFloat(earning.quote);

        earningsByProduct[symbol].distributions.push({
          date: earning.distributionDate,
          amount: parseFloat(earning.amount),
          quote: parseFloat(earning.quote),
          valueBRL,
          transactionHash: earning.transactionHash,
        });

        earningsByProduct[symbol].totalAmount += parseFloat(earning.amount);
        earningsByProduct[symbol].totalValueBRL += valueBRL;
        earningsByProduct[symbol].count += 1;
      });

      return {
        success: true,
        data: Object.values(earningsByProduct),
      };
    } catch (error) {
      console.error('Erro ao agrupar earnings por produto:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao agrupar rendimentos',
      };
    }
  }

  /**
   * Gerar informe de rendimentos completo para um ano
   * @param {string} userId - ID do usuário
   * @param {number} informeYear - Ano do INFORME (ex: 2025 para ano-calendário 2024)
   * @param {string} network - Rede (testnet/mainnet)
   */
  async getIncomeReport(userId, informeYear, network = process.env.DEFAULT_NETWORK || 'testnet') {
    try {
      // O informe do ano X refere-se ao ano-calendário X-1
      // Ex: "Informe 2025" = rendimentos de 2024
      const calendarYear = informeYear - 1;

      console.log(`[TaxReports] Gerando Informe ${informeYear} (ano-calendário ${calendarYear})`);

      // Validar ano do informe
      const currentYear = new Date().getFullYear();
      const currentInformeYear = currentYear + 1; // Informe atual é sempre ano+1

      if (informeYear > currentInformeYear) {
        return {
          success: false,
          message: `Não é possível gerar informe para ${informeYear}. O informe mais recente disponível é ${currentInformeYear}.`,
        };
      }

      // Buscar dados do usuário
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          cpf: true,
          email: true,
          balances: true,
          blockchainAddress: true,
          publicKey: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado',
        };
      }

      // Buscar empresa (fonte pagadora)
      const company = await getPrisma().company.findFirst({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          alias: true,
        },
      });

      // Definir datas do ano-calendário
      const startDate = new Date(`${calendarYear}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${calendarYear}-12-31T23:59:59.999Z`);

      // userAddress para buscar ordens ativas
      const userAddress = user.blockchainAddress || user.publicKey;

      // Buscar saldo inicial (primeiro dia do ano anterior ao calendário)
      const previousYearEnd = new Date(`${calendarYear - 1}-12-31T23:59:59.999Z`);
      console.log(`[TaxReports] Buscando saldo inicial em 31/12/${calendarYear - 1}...`);
      const initialBalanceResult = await this.getBalanceAtDate(userId, previousYearEnd, network, userAddress);

      const initialBalances = (initialBalanceResult.success && initialBalanceResult.data) ? initialBalanceResult.data : {};
      const initialStakes = (initialBalanceResult.success && initialBalanceResult.stakes) ? initialBalanceResult.stakes : {};
      const initialOrders = (initialBalanceResult.success && initialBalanceResult.orders) ? initialBalanceResult.orders : {};
      const initialStakesOnly = (initialBalanceResult.success && initialBalanceResult.stakesOnly) ? initialBalanceResult.stakesOnly : {};
      const initialSnapshotDate = initialBalanceResult.snapshotDate;
      const initialNoData = initialBalanceResult.noData || false;

      // Buscar saldo final (último dia do ano-calendário ou último snapshot disponível)
      console.log(`[TaxReports] Buscando saldo final em 31/12/${calendarYear}...`);
      const finalBalanceResult = await this.getBalanceAtDate(userId, endDate, network, userAddress);

      // Dados do saldo final
      const finalTotals = (finalBalanceResult.success && finalBalanceResult.data) ? finalBalanceResult.data : {}; // Total (balance + stake + orders)
      const finalBalancesOnly = (finalBalanceResult.success && finalBalanceResult.balances) ? finalBalanceResult.balances : {}; // Apenas balances disponíveis
      const finalOrdersFromSnapshot = (finalBalanceResult.success && finalBalanceResult.orders) ? finalBalanceResult.orders : {}; // Ordens do snapshot
      const finalStakesOnly = (finalBalanceResult.success && finalBalanceResult.stakesOnly) ? finalBalanceResult.stakesOnly : {}; // Stakes agregados por token
      const finalStakes = (finalBalanceResult.success && finalBalanceResult.stakes) ? finalBalanceResult.stakes : {};
      const finalSnapshotDate = finalBalanceResult.snapshotDate;
      const finalNoData = finalBalanceResult.noData || false;

      // Dados do saldo inicial (se necessário)
      const initialTotals = (initialBalanceResult.success && initialBalanceResult.data) ? initialBalanceResult.data : {};
      const initialBalancesOnly = (initialBalanceResult.success && initialBalanceResult.balances) ? initialBalanceResult.balances : {};

      console.log(`[TaxReports] Saldo inicial: ${Object.keys(initialTotals).length} tokens${initialNoData ? ' (sem dados)' : ''}`);
      console.log(`[TaxReports] Saldo final: ${Object.keys(finalTotals).length} tokens${finalNoData ? ' (sem dados)' : ''}`);

      // Buscar dados adicionais do ano-calendário
      const [earningsResult, tradesData, ordersData] = await Promise.all([
        this.getEarningsGroupedByProduct(userId, calendarYear, network),
        this.getTradesSummary(userId, calendarYear),
        this.getOrdersBalance(user.blockchainAddress), // Ordens atuais (pode ser diferente do snapshot)
      ]);

      if (!earningsResult.success) {
        return earningsResult;
      }

      // Calcular totais gerais
      const totalsByToken = {};
      let grandTotalBRL = 0;

      earningsResult.data.forEach(product => {
        if (!totalsByToken[product.tokenSymbol]) {
          totalsByToken[product.tokenSymbol] = {
            symbol: product.tokenSymbol,
            name: product.tokenName,
            totalAmount: 0,
            totalValueBRL: 0,
          };
        }

        totalsByToken[product.tokenSymbol].totalAmount += product.totalAmount;
        totalsByToken[product.tokenSymbol].totalValueBRL += product.totalValueBRL;
        grandTotalBRL += product.totalValueBRL;
      });

      // Estruturar dados do informe
      const report = {
        // Identificação
        company: {
          name: company?.name || 'Coinage Platform',
          cnpj: '02.332.886/0001-04', // TODO: buscar do banco de dados
          alias: company?.alias,
        },
        beneficiary: {
          name: user.name,
          cpf: user.cpf,
          email: user.email,
        },
        period: {
          informeYear: parseInt(informeYear), // Ano do informe (ex: 2025)
          calendarYear: parseInt(calendarYear), // Ano-calendário (ex: 2024)
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },

        // Saldos detalhados
        balances: {
          initial: initialBalancesOnly, // Saldo disponível em 31/12 do ano anterior
          initialTotal: initialTotals, // Total (balance + stake + orders) em 31/12 do ano anterior
          initialOrders: initialOrders, // Ordens em 31/12 do ano anterior
          initialStakes: initialStakesOnly, // Stakes em 31/12 do ano anterior
          initialDate: initialSnapshotDate, // Data real do snapshot inicial (ou null se não houver)
          initialNoData: initialNoData, // Flag para indicar se não havia dados

          final: finalBalancesOnly, // Saldo disponível em 31/12 do ano-calendário
          finalTotal: finalTotals, // Total (balance + stake + orders) em 31/12 do ano-calendário
          finalDate: finalSnapshotDate, // Data real do snapshot final (ou null se não houver)
          finalNoData: finalNoData, // Flag para indicar se não havia dados

          total: finalTotals, // Total completo (balance + stake + orders) - para compatibilidade e exibição principal
          available: finalBalancesOnly, // Saldo disponível (sem ordens e stakes)
          inOrders: finalOrdersFromSnapshot || ordersData, // Preferir ordens do snapshot, fallback para ordens atuais
          inStake: finalStakesOnly, // Stakes agregados por token (pré-calculado no snapshot)
          date: finalSnapshotDate, // Data do snapshot
        },

        // Saldos em stake
        stakes: {
          date: finalSnapshotDate,
          total: finalStakes.total || '0',
          breakdown: finalStakes.breakdown || {},
          updatedAt: finalStakes.updatedAt || null,
        },

        // Trades detalhados do ano
        trades: {
          list: tradesData.trades, // Lista completa de trades
          summary: tradesData.summary, // Resumo agregado por token
        },

        // Rendimentos por produto
        products: earningsResult.data,

        // Totais
        totals: {
          byToken: Object.values(totalsByToken),
          grandTotalBRL,
          totalDistributions: earningsResult.data.reduce((sum, p) => sum + p.count, 0),
        },

        // Metadados
        metadata: {
          generatedAt: new Date().toISOString(),
          network,
          reportType: 'income',
        },
      };

      return {
        success: true,
        data: report,
        message: 'Informe de rendimentos gerado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao gerar informe de rendimentos:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao gerar informe de rendimentos',
      };
    }
  }

  /**
   * Obter lista de anos disponíveis para informe
   * Retorna anos dos INFORMES (ano-calendário + 1)
   * Ex: Se há earnings em 2024, retorna 2025 (Informe 2025 = rendimentos de 2024)
   */
  async getAvailableYears(userId, network = process.env.DEFAULT_NETWORK || 'testnet') {
    try {
      // Buscar o earning mais antigo e mais recente
      const [oldest, newest] = await Promise.all([
        getPrisma().earnings.findFirst({
          where: {
            userId,
            network,
            isActive: true,
          },
          orderBy: {
            distributionDate: 'asc',
          },
          select: {
            distributionDate: true,
          },
        }),
        getPrisma().earnings.findFirst({
          where: {
            userId,
            network,
            isActive: true,
          },
          orderBy: {
            distributionDate: 'desc',
          },
          select: {
            distributionDate: true,
          },
        }),
      ]);

      if (!oldest || !newest) {
        // Se não há earnings, retornar array vazio
        return {
          success: true,
          data: [],
          message: 'Nenhum rendimento encontrado',
        };
      }

      // Gerar lista de anos de INFORME (ano-calendário + 1)
      const startCalendarYear = oldest.distributionDate.getFullYear();
      const endCalendarYear = newest.distributionDate.getFullYear();

      const informeYears = [];

      for (let calendarYear = startCalendarYear; calendarYear <= endCalendarYear; calendarYear++) {
        // Informe do ano X+1 refere-se ao ano-calendário X
        informeYears.push(calendarYear + 1);
      }

      console.log(`[TaxReports] Anos disponíveis: ${informeYears.join(', ')} (anos-calendário: ${startCalendarYear}-${endCalendarYear})`);

      return {
        success: true,
        data: informeYears,
        message: 'Anos disponíveis obtidos com sucesso',
      };
    } catch (error) {
      console.error('Erro ao obter anos disponíveis:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao obter anos disponíveis',
      };
    }
  }
}

module.exports = new TaxReportsService();

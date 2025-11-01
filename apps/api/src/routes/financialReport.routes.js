/**
 * Financial Report Routes
 * Rotas para relatório financeiro do sistema (Admin)
 */

const express = require('express');
const router = express.Router();
const prismaConfig = require('../config/prisma');
const balanceSyncService = require('../services/balanceSync.service');
const stakeBalanceService = require('../services/stakeBalance.service');
const blockchainService = require('../services/blockchain.service');

/**
 * @swagger
 * /api/admin/financial-report:
 *   get:
 *     summary: Obtém relatório financeiro de todos os usuários (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por empresa
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [mainnet, testnet]
 *         description: Filtrar por rede
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, email ou CPF
 *     responses:
 *       200:
 *         description: Relatório financeiro obtido com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/', async (req, res) => {
  try {
    const { companyId, network, search, onlyWithBalance, tokens: selectedTokensParam } = req.query;
    const prisma = prismaConfig.getPrisma();

    console.log('📊 [Financial Report] Iniciando geração do relatório...', { network, companyId, search, onlyWithBalance, tokens: selectedTokensParam });

    // 1. Buscar TODOS os usuários com suas empresas (SEM FILTRO DE SALDO)
    let userWhere = {};

    // Aplicar filtro de busca se fornecido
    if (search) {
      const searchLower = search.toLowerCase();
      userWhere.OR = [
        { name: { contains: searchLower, mode: 'insensitive' } },
        { email: { contains: searchLower, mode: 'insensitive' } },
        { cpf: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        publicKey: true,
        balances: true,
        stakes: true,
        isActive: true,
        userCompanies: {
          select: {
            company: {
              select: {
                id: true,
                name: true,
                alias: true
              }
            },
            role: true,
            status: true
          }
        }
      }
    });

    console.log(`📊 [Financial Report] Encontrados ${users.length} usuários totais`);

    // Aplicar filtro de empresa se fornecido
    let filteredUsers = users;
    if (companyId) {
      filteredUsers = users.filter(user =>
        user.userCompanies.some(uc => uc.company.id === companyId)
      );
      console.log(`📊 [Financial Report] Filtrados ${filteredUsers.length} usuários da empresa ${companyId}`);
    }

    console.log(`📊 [Financial Report] ${filteredUsers.length} usuários após filtros`);

    // 2. Buscar ordens ativas para cada usuário
    const userAddresses = filteredUsers.map(u => u.publicKey).filter(Boolean);
    const userIds = filteredUsers.map(u => u.id);

    const activeOrders = await prisma.exchangeOrder.findMany({
      where: {
        userAddress: { in: userAddresses },
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

    console.log(`📊 [Financial Report] Encontradas ${activeOrders.length} ordens ativas`);

    // 3. Buscar histórico de transações
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: { in: userIds },
        status: 'confirmed'
      },
      select: {
        userId: true,
        transactionType: true,
        currency: true,
        amount: true,
        contractAddress: true
      }
    });

    console.log(`📊 [Financial Report] Encontradas ${transactions.length} transações confirmadas`);

    // 4. Buscar transferências
    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { recipientUserId: { in: userIds } }
        ],
        status: 'confirmed'
      },
      select: {
        userId: true,
        recipientUserId: true,
        asset: true,
        amount: true
      }
    });

    console.log(`📊 [Financial Report] Encontradas ${transfers.length} transferências`);

    // 5. Buscar ordens canceladas
    const cancelledOrders = await prisma.exchangeOrder.findMany({
      where: {
        userAddress: { in: userAddresses },
        status: 'CANCELLED'
      },
      select: {
        userAddress: true,
        exchangeContractAddress: true,
        orderType: true,
        orderSide: true,
        tokenASymbol: true,
        tokenBSymbol: true,
        amount: true
      }
    });

    console.log(`📊 [Financial Report] Encontradas ${cancelledOrders.length} ordens canceladas`);

    // 6. Buscar ordens executadas (trades)
    const executedTrades = await prisma.exchangeTrade.findMany({
      where: {
        OR: [
          { buyerAddress: { in: userAddresses } },
          { sellerAddress: { in: userAddresses } }
        ]
      },
      select: {
        buyerAddress: true,
        sellerAddress: true,
        exchangeContractAddress: true,
        tokenASymbol: true,
        tokenBSymbol: true,
        price: true,
        amount: true,
        buyOrder: {
          select: {
            orderType: true,
            orderSide: true
          }
        },
        sellOrder: {
          select: {
            orderType: true,
            orderSide: true
          }
        }
      }
    });

    console.log(`📊 [Financial Report] Encontrados ${executedTrades.length} trades executados`);

    // 3. Buscar todos os tokens cadastrados (APENAS DA REDE ESPECIFICADA)
    const tokensWhere = {
      isActive: true,
      contractTypeId: 'cc350023-d9ba-4746-85f3-1590175a2328' // ID do ERC20 token type
    };

    // Se rede especificada, filtrar apenas tokens dessa rede
    if (network) {
      tokensWhere.network = network;
    }

    const tokens = await prisma.smartContract.findMany({
      where: tokensWhere,
      select: {
        address: true,
        name: true,
        metadata: true,
        network: true
      }
    });

    console.log(`📊 [Financial Report] Encontrados ${tokens.length} tokens${network ? ` da rede ${network}` : ''}`);

    const filteredTokens = tokens;

    // 6.5 Buscar contratos de stake da rede especificada
    const stakeContractsWhere = {
      isActive: true,
      contractTypeId: '165a6e47-a216-4ac4-b96d-1c6d85ebb492' // ID do Stake contract type
    };

    if (network) {
      stakeContractsWhere.network = network;
    }

    const stakeContracts = await prisma.smartContract.findMany({
      where: stakeContractsWhere,
      select: {
        address: true,
        name: true,
        metadata: true,
        network: true
      }
    });

    console.log(`📊 [Financial Report] Encontrados ${stakeContracts.length} contratos de stake${network ? ` da rede ${network}` : ''}`);

    // 6.6 Criar mapa de contratos de stake para tokens
    const stakeContractToToken = {};

    // Buscar tokens referenciados pelos contratos de stake
    const stakeTokenAddresses = stakeContracts
      .map(c => c.metadata?.tokenAddress)
      .filter(Boolean);

    const stakeTokens = await prisma.smartContract.findMany({
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
    stakeContracts.forEach(contract => {
      const tokenSymbol = contract.metadata?.tokenSymbol;
      const tokenAddress = contract.metadata?.tokenAddress;

      if (tokenSymbol) {
        // Se já tem tokenSymbol direto no metadata do stake
        stakeContractToToken[contract.address.toLowerCase()] = tokenSymbol;
      } else if (tokenAddress) {
        // Se tem tokenAddress, buscar o símbolo do token
        const symbol = tokenAddressToSymbol[tokenAddress.toLowerCase()];
        if (symbol) {
          stakeContractToToken[contract.address.toLowerCase()] = symbol;
        }
      }
    });

    console.log(`📊 [Financial Report] Mapeamento de contratos de stake para tokens:`, stakeContractToToken);

    // 7. Criar mapas de dados históricos por usuário

    // 7.1 Mapa de ordens ativas (apenas LIMIT)
    const ordersMap = new Map();
    activeOrders.forEach(order => {
      if (!ordersMap.has(order.userAddress)) {
        ordersMap.set(order.userAddress, {});
      }
      const userOrders = ordersMap.get(order.userAddress);

      // BUY: soma quantidade × preço em cBRL (tokenA)
      // SELL: soma quantidade no outro token (tokenB)
      const orderType = order.orderType?.toUpperCase();
      const remainingAmount = parseFloat(order.remainingAmount?.toString() || '0');
      const price = parseFloat(order.price?.toString() || '0');

      if (orderType === 'BUY') {
        // Comprando tokenB com tokenA (cBRL), então adiciona valor em cBRL
        const tokenSymbol = order.tokenASymbol;
        const orderValue = remainingAmount * price;

        if (!userOrders[tokenSymbol]) {
          userOrders[tokenSymbol] = '0';
        }
        const currentAmount = parseFloat(userOrders[tokenSymbol] || '0');
        userOrders[tokenSymbol] = (currentAmount + orderValue).toString();
      } else if (orderType === 'SELL') {
        // Vendendo tokenB por tokenA (cBRL), então adiciona quantidade em tokenB
        const tokenSymbol = order.tokenBSymbol;

        if (!userOrders[tokenSymbol]) {
          userOrders[tokenSymbol] = '0';
        }
        const currentAmount = parseFloat(userOrders[tokenSymbol] || '0');
        userOrders[tokenSymbol] = (currentAmount + remainingAmount).toString();
      }
    });

    // 7.2 Mapa de transações (depósitos/saques) por usuário e token
    const transactionsMap = new Map();
    transactions.forEach(tx => {
      if (!transactionsMap.has(tx.userId)) {
        transactionsMap.set(tx.userId, {
          deposits: {},
          withdrawals: {}
        });
      }
      const userTx = transactionsMap.get(tx.userId);
      const symbol = tx.currency || 'UNKNOWN';

      if (tx.transactionType === 'deposit') {
        userTx.deposits[symbol] = (parseFloat(userTx.deposits[symbol] || '0') + parseFloat(tx.amount || '0')).toString();
      } else if (tx.transactionType === 'withdrawal') {
        userTx.withdrawals[symbol] = (parseFloat(userTx.withdrawals[symbol] || '0') + parseFloat(tx.amount || '0')).toString();
      }
    });

    // 7.3 Mapa de transferências por usuário
    const transfersMap = new Map();
    transfers.forEach(transfer => {
      // Transferências enviadas (userId = remetente)
      if (!transfersMap.has(transfer.userId)) {
        transfersMap.set(transfer.userId, { sent: {}, received: {} });
      }
      const fromUser = transfersMap.get(transfer.userId);
      const symbol = transfer.asset;
      fromUser.sent[symbol] = (parseFloat(fromUser.sent[symbol] || '0') + parseFloat(transfer.amount)).toString();

      // Transferências recebidas (recipientUserId = destinatário)
      if (transfer.recipientUserId) {
        if (!transfersMap.has(transfer.recipientUserId)) {
          transfersMap.set(transfer.recipientUserId, { sent: {}, received: {} });
        }
        const toUser = transfersMap.get(transfer.recipientUserId);
        toUser.received[symbol] = (parseFloat(toUser.received[symbol] || '0') + parseFloat(transfer.amount)).toString();
      }
    });

    // 7.4 Mapa de ordens canceladas por usuário
    const cancelledOrdersMap = new Map();
    cancelledOrders.forEach(order => {
      if (!cancelledOrdersMap.has(order.userAddress)) {
        cancelledOrdersMap.set(order.userAddress, []);
      }
      cancelledOrdersMap.get(order.userAddress).push({
        exchange: order.exchangeContractAddress,
        type: order.orderType,
        side: order.orderSide,
        tokenA: order.tokenASymbol,
        tokenB: order.tokenBSymbol,
        amount: parseFloat(order.amount.toString())
      });
    });

    // 7.5 Mapa de ordens executadas (trades) por usuário
    const executedTradesMap = new Map();
    executedTrades.forEach(trade => {
      // Para o comprador
      if (!executedTradesMap.has(trade.buyerAddress)) {
        executedTradesMap.set(trade.buyerAddress, []);
      }
      executedTradesMap.get(trade.buyerAddress).push({
        exchange: trade.exchangeContractAddress,
        type: trade.buyOrder?.orderType || 'unknown',
        side: 'buy',
        tokenA: trade.tokenASymbol,
        tokenB: trade.tokenBSymbol,
        price: parseFloat(trade.price.toString()),
        amount: parseFloat(trade.amount.toString())
      });

      // Para o vendedor
      if (!executedTradesMap.has(trade.sellerAddress)) {
        executedTradesMap.set(trade.sellerAddress, []);
      }
      executedTradesMap.get(trade.sellerAddress).push({
        exchange: trade.exchangeContractAddress,
        type: trade.sellOrder?.orderType || 'unknown',
        side: 'sell',
        tokenA: trade.tokenASymbol,
        tokenB: trade.tokenBSymbol,
        price: parseFloat(trade.price.toString()),
        amount: parseFloat(trade.amount.toString())
      });
    });

    // 5. Criar lista de símbolos de tokens APENAS dos contratos da rede
    const tokenSymbols = new Set();

    // Adicionar tokens dos contratos ERC20 da rede
    filteredTokens.forEach(token => {
      const symbol = token.metadata?.symbol || token.name;
      if (symbol) tokenSymbols.add(symbol);
    });

    // Adicionar moeda nativa baseado na rede
    if (!network || network === 'mainnet') {
      tokenSymbols.add('AZE');
      tokenSymbols.add('cBRL');
    }
    if (!network || network === 'testnet') {
      tokenSymbols.add('AZE-t');
    }

    let tokenSymbolsArray = Array.from(tokenSymbols).sort();

    // Filtrar tokens se especificado
    if (selectedTokensParam) {
      const selectedTokens = selectedTokensParam.split(',').map(t => t.trim()).filter(Boolean);
      if (selectedTokens.length > 0) {
        tokenSymbolsArray = tokenSymbolsArray.filter(symbol => selectedTokens.includes(symbol));
        console.log(`📊 [Financial Report] Filtrado para tokens: [${tokenSymbolsArray.join(', ')}]`);
      }
    }

    console.log(`📊 [Financial Report] Tokens da rede: [${tokenSymbolsArray.join(', ')}]`);
    console.log(`📊 [Financial Report] Total de ${tokenSymbolsArray.length} tokens na rede ${network || 'todas'}`);

    // 6. Processar dados de TODOS os usuários (sem filtrar por saldo)
    const reportData = filteredUsers.map(user => {
      const balances = user.balances || {};
      const stakes = user.stakes || {};
      const orders = ordersMap.get(user.publicKey) || {};
      const userTransactions = transactionsMap.get(user.id) || { deposits: {}, withdrawals: {} };
      const userTransfers = transfersMap.get(user.id) || { sent: {}, received: {} };
      const userCancelledOrders = cancelledOrdersMap.get(user.publicKey) || [];
      const userExecutedTrades = executedTradesMap.get(user.publicKey) || [];

      // Empresa principal (primeira ativa ou primeira da lista)
      const primaryCompany = user.userCompanies.find(uc => uc.status === 'active') || user.userCompanies[0];

      // Processar stakes: agrupar por tokenSymbol
      const stakesByToken = {};
      const stakesBreakdown = stakes.breakdown || {};

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

      // Processar ordens: usar ordersMap que foi calculado corretamente com base em LIMIT orders
      const ordersByToken = orders || {};

      // Criar objeto com dados por token
      const tokenData = {};
      tokenSymbolsArray.forEach(symbol => {
        // Saldos estão em balances.balancesTable
        const balancesTable = balances.balancesTable || {};
        const balance = parseFloat(balancesTable[symbol] || '0');

        // Stakes: soma de todos os contratos desse token
        const stake = stakesByToken[symbol] || 0;

        // Ordens: usar ordersMap com cálculo correto (BUY = quantidade × preço em cBRL, SELL = quantidade no token)
        const order = parseFloat(ordersByToken[symbol] || '0');

        tokenData[symbol] = {
          balance: balance.toFixed(6),
          stake: stake.toFixed(6),
          order: order.toFixed(6),
          total: (balance + stake + order).toFixed(6),
          // Dados históricos
          history: {
            deposits: parseFloat(userTransactions.deposits[symbol] || '0').toFixed(6),
            withdrawals: parseFloat(userTransactions.withdrawals[symbol] || '0').toFixed(6),
            transfersSent: parseFloat(userTransfers.sent[symbol] || '0').toFixed(6),
            transfersReceived: parseFloat(userTransfers.received[symbol] || '0').toFixed(6)
          }
        };
      });

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userCpf: user.cpf,
        publicKey: user.publicKey,
        isActive: user.isActive,
        company: primaryCompany ? {
          id: primaryCompany.company.id,
          name: primaryCompany.company.name,
          alias: primaryCompany.company.alias,
          role: primaryCompany.role
        } : null,
        allCompanies: user.userCompanies.map(uc => ({
          id: uc.company.id,
          name: uc.company.name,
          alias: uc.company.alias,
          role: uc.role,
          status: uc.status
        })),
        tokenData,
        // Ordens ativas
        activeOrders: (() => {
          const userActiveOrders = activeOrders.filter(order =>
            order.userAddress?.toLowerCase() === user.publicKey?.toLowerCase()
          );

          if (userActiveOrders.length > 0) {
            console.log(`📊 [Financial Report] Usuário ${user.email} tem ${userActiveOrders.length} ordens ativas`);
          }

          return userActiveOrders.map(order => ({
            exchange: order.exchangeContractAddress || 'N/A',
            type: order.orderSide?.toLowerCase() || 'unknown', // LIMIT ou MARKET
            side: order.orderType?.toLowerCase(), // BUY ou SELL
            tokenA: order.tokenASymbol,
            tokenB: order.tokenBSymbol,
            amount: parseFloat(order.amount?.toString() || '0'),
            remaining: parseFloat(order.remainingAmount?.toString() || '0'),
            price: parseFloat(order.price?.toString() || '0')
          }));
        })(),
        // Stakes ativos (do breakdown com mapeamento de token)
        activeStakes: Object.entries(stakes.breakdown || {}).map(([contractAddress, stakeInfo]) => {
          // Buscar tokenSymbol do mapeamento se não estiver no breakdown
          let tokenSymbol = stakeInfo.tokenSymbol;
          if (!tokenSymbol) {
            tokenSymbol = stakeContractToToken[contractAddress.toLowerCase()];
          }

          return {
            contract: contractAddress,
            contractName: stakeInfo.contractName || 'N/A',
            tokenSymbol: tokenSymbol || 'N/A',
            tokenAddress: stakeInfo.tokenAddress || null,
            balance: (parseFloat(stakeInfo.balance || '0') / 1e18).toFixed(6),
            network: stakeInfo.network
          };
        })
      };
    });

    // 6.1 Filtrar usuários por saldo (se solicitado)
    let finalReportData = reportData;
    if (onlyWithBalance === 'with') {
      // Apenas usuários COM saldo
      finalReportData = reportData.filter(user => {
        return tokenSymbolsArray.some(symbol => {
          const data = user.tokenData[symbol];
          return (
            parseFloat(data.balance) > 0 ||
            parseFloat(data.stake) > 0 ||
            parseFloat(data.order) > 0
          );
        });
      });
      console.log(`📊 [Financial Report] Filtrado para ${finalReportData.length} usuários COM saldo`);
    } else if (onlyWithBalance === 'without') {
      // Apenas usuários SEM saldo
      finalReportData = reportData.filter(user => {
        return !tokenSymbolsArray.some(symbol => {
          const data = user.tokenData[symbol];
          return (
            parseFloat(data.balance) > 0 ||
            parseFloat(data.stake) > 0 ||
            parseFloat(data.order) > 0
          );
        });
      });
      console.log(`📊 [Financial Report] Filtrado para ${finalReportData.length} usuários SEM saldo`);
    }

    // 7. Calcular totais por token
    const tokenTotals = {};
    tokenSymbolsArray.forEach(symbol => {
      let totalBalance = 0;
      let totalStake = 0;
      let totalOrder = 0;
      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let totalTransfersSent = 0;
      let totalTransfersReceived = 0;

      finalReportData.forEach(user => {
        totalBalance += parseFloat(user.tokenData[symbol].balance);
        totalStake += parseFloat(user.tokenData[symbol].stake);
        totalOrder += parseFloat(user.tokenData[symbol].order);
        totalDeposits += parseFloat(user.tokenData[symbol].history.deposits);
        totalWithdrawals += parseFloat(user.tokenData[symbol].history.withdrawals);
        totalTransfersSent += parseFloat(user.tokenData[symbol].history.transfersSent);
        totalTransfersReceived += parseFloat(user.tokenData[symbol].history.transfersReceived);
      });

      tokenTotals[symbol] = {
        balance: totalBalance.toFixed(6),
        stake: totalStake.toFixed(6),
        order: totalOrder.toFixed(6),
        total: (totalBalance + totalStake + totalOrder).toFixed(6),
        history: {
          deposits: totalDeposits.toFixed(6),
          withdrawals: totalWithdrawals.toFixed(6),
          transfersSent: totalTransfersSent.toFixed(6),
          transfersReceived: totalTransfersReceived.toFixed(6)
        }
      };
    });

    // 8. Calcular estatísticas finais
    const uniqueCompanies = new Set();
    finalReportData.forEach(user => {
      if (user.company) {
        uniqueCompanies.add(user.company.id);
      }
    });

    console.log('📊 [Financial Report] Relatório gerado com sucesso!');
    console.log(`📊 [Financial Report] Retornando ${finalReportData.length} usuários, ${tokenSymbolsArray.length} tokens, ${stakeContracts.length} contratos de stake`);

    res.json({
      success: true,
      data: {
        users: finalReportData,
        tokenSymbols: tokenSymbolsArray,
        tokenTotals,
        summary: {
          totalUsers: finalReportData.length,
          totalTokens: tokenSymbolsArray.length,
          totalActiveOrders: activeOrders.length,
          totalCompanies: uniqueCompanies.size,
          totalStakeContracts: stakeContracts.length,
          totalTransactions: transactions.length,
          totalTransfers: transfers.length,
          totalCancelledOrders: cancelledOrders.length,
          totalExecutedTrades: executedTrades.length
        }
      }
    });

  } catch (error) {
    console.error('❌ [Financial Report] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório financeiro',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/admin/financial-report/sync-blockchain:
 *   post:
 *     summary: Sincroniza balances e stakes de usuários com blockchain (Admin)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [mainnet, testnet]
 *         description: Rede para sincronizar
 *     responses:
 *       200:
 *         description: Sincronização iniciada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post('/sync-blockchain', async (req, res) => {
  try {
    const { network = process.env.DEFAULT_NETWORK || 'testnet' } = req.query;
    const prisma = prismaConfig.getPrisma();

    console.log('🔄 [Financial Report Sync] Iniciando sincronização blockchain...', { network });

    // Buscar usuários com balances não vazios
    const users = await prisma.user.findMany({
      where: {
        balances: {
          not: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        publicKey: true,
        balances: true
      }
    });

    console.log(`🔄 [Financial Report Sync] Encontrados ${users.length} usuários com balances`);

    // Iniciar sincronização em background
    const syncResults = {
      total: users.length,
      synced: 0,
      failed: 0,
      errors: []
    };

    // Responder imediatamente (sincronização em background)
    res.json({
      success: true,
      message: `Sincronização iniciada para ${users.length} usuários`,
      data: {
        total: users.length,
        network
      }
    });

    // Processar sincronização em background
    (async () => {
      // Buscar contratos de stake para mapear tokenAddress -> tokenSymbol
      const stakeContracts = await prisma.smartContract.findMany({
        where: {
          isActive: true,
          contractTypeId: '165a6e47-a216-4ac4-b96d-1c6d85ebb492', // ID do Stake contract type
          network
        },
        select: {
          address: true,
          metadata: true
        }
      });

      // Buscar tokens referenciados pelos contratos de stake
      const stakeTokenAddresses = stakeContracts
        .map(c => c.metadata?.tokenAddress)
        .filter(Boolean);

      const stakeTokens = await prisma.smartContract.findMany({
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

      // Criar mapa de contractAddress -> { tokenAddress, tokenSymbol }
      const stakeContractToTokenInfo = {};
      stakeContracts.forEach(contract => {
        const tokenAddress = contract.metadata?.tokenAddress;
        if (tokenAddress) {
          const tokenSymbol = tokenAddressToSymbol[tokenAddress.toLowerCase()];
          stakeContractToTokenInfo[contract.address.toLowerCase()] = {
            tokenAddress,
            tokenSymbol: tokenSymbol || contract.metadata?.tokenSymbol || null
          };
        }
      });

      console.log(`📊 [Sync] Mapeamento de contratos de stake:`, stakeContractToTokenInfo);

      for (const user of users) {
        try {
          console.log(`🔄 [Sync] Processando ${user.email}...`);

          // 1. Sincronizar balances
          const balanceData = await balanceSyncService.getFreshBalances(user.publicKey, network);

          if (balanceData.success) {
            // Salvar balances no PostgreSQL
            await blockchainService.saveAndCompareUserBalances(user.id, balanceData.data);
            console.log(`✅ [Sync] Balances atualizados para ${user.email}`);
          } else {
            console.warn(`⚠️ [Sync] Erro ao buscar balances de ${user.email}:`, balanceData.error);
          }

          // 2. Sincronizar stakes
          const stakeData = await stakeBalanceService.calculateTotalStake(user.publicKey);

          if (stakeData && stakeData.breakdown) {
            // Atualizar stakes no PostgreSQL com tokenSymbol e tokenAddress resolvidos
            const stakesBreakdown = {};
            stakeData.breakdown.forEach(item => {
              const contractAddr = item.contract.toLowerCase();
              const tokenInfo = stakeContractToTokenInfo[contractAddr] || {};

              stakesBreakdown[item.contract] = {
                balance: item.balance,
                network: item.network,
                contractName: item.contractName,
                tokenSymbol: tokenInfo.tokenSymbol || item.tokenSymbol,
                tokenAddress: tokenInfo.tokenAddress || item.tokenAddress
              };
            });

            await prisma.user.update({
              where: { id: user.id },
              data: {
                stakes: {
                  total: stakeData.totalStake,
                  breakdown: stakesBreakdown,
                  updatedAt: new Date().toISOString()
                }
              }
            });

            console.log(`✅ [Sync] Stakes atualizados para ${user.email}`);
          }

          syncResults.synced++;
        } catch (error) {
          console.error(`❌ [Sync] Erro ao processar ${user.email}:`, error.message);
          syncResults.failed++;
          syncResults.errors.push({
            userId: user.id,
            email: user.email,
            error: error.message
          });
        }
      }

      console.log('✅ [Financial Report Sync] Sincronização concluída:', syncResults);
    })();

  } catch (error) {
    console.error('❌ [Financial Report Sync] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao iniciar sincronização blockchain',
      error: error.message
    });
  }
});

module.exports = router;

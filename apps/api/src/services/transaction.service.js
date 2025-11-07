const { ethers } = require('ethers');
const prismaConfig = require('../config/prisma');

// Função para obter o serviço de webhook
const getWebhookService = () => {
  if (!global.webhookService) {
    global.webhookService = require('./webhook.service');
  }
  return global.webhookService;
};

class TransactionService {
  constructor() {
    this.prisma = null;
  }

  async initialize() {
    this.prisma = await prismaConfig.initialize();
  }

  /**
   * Dispara webhooks para eventos de transação
   */
  async triggerTransactionWebhooks(event, transaction, companyId) {
    try {
      const webhookService = getWebhookService();
      await webhookService.triggerWebhooks(event, {
        transactionId: transaction.id,
        txHash: transaction.txHash,
        type: transaction.type,
        status: transaction.status,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        amount: transaction.amount,
        network: transaction.network,
        blockNumber: transaction.blockNumber,
        timestamp: transaction.createdAt
      }, companyId);
    } catch (error) {
      console.error('Erro ao disparar webhooks de transação:', error.message);
      // Não falhar a operação principal por erro de webhook
    }
  }

  /**
   * Cria um registro de transação
   */
  async createTransaction(transactionData) {
    try {
      if (!this.prisma) {
        await this.initialize();
      }

      const transaction = await this.prisma.transaction.create({
        data: transactionData
      });
      
      // Disparar webhook de transação criada
      if (transaction.companyId) {
        await this.triggerTransactionWebhooks('transaction.created', transaction, transaction.companyId);
      }
      
      return transaction;
    } catch (error) {
      console.error('Erro ao criar transação:', error.message);
      throw error;
    }
  }

  /**
   * Atualiza uma transação com dados da blockchain
   */
  async updateTransaction(transactionId, updateData) {
    try {
      if (!this.Transaction) {
        await this.initialize();
      }

      const transaction = await this.Transaction.findByPk(transactionId);
      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      const oldStatus = transaction.status;
      await transaction.update(updateData);
      
      // Disparar webhook se o status mudou
      if (updateData.status && updateData.status !== oldStatus) {
        await this.triggerTransactionWebhooks('transaction.status_updated', transaction, transaction.companyId);
      }
      
      return transaction;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error.message);
      throw error;
    }
  }

  /**
   * Atualiza uma transação pelo hash
   */
  async updateTransactionByHash(txHash, updateData) {
    try {
      if (!this.Transaction) {
        await this.initialize();
      }

      const transaction = await this.Transaction.findOne({
        where: { txHash }
      });

      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      await transaction.update(updateData);
      return transaction;
    } catch (error) {
      console.error('Erro ao atualizar transação por hash:', error.message);
      throw error;
    }
  }

  /**
   * Registra uma transação de mint
   */
  async recordMintTransaction(data) {
    const {
      companyId,
      userId,
      contractAddress,
      toAddress,
      amount,
      amountWei,
      gasPayer,
      network,
      txHash,
      gasUsed,
      gasPrice,
      blockNumber,
      status = 'confirmed'
    } = data;

    const transactionData = {
      companyId,
      userId,
      network: network || 'testnet',
      transactionType: 'contract_call',
      status,
      txHash,
      blockNumber,
      fromAddress: gasPayer,
      toAddress: contractAddress,
      functionName: 'mint',
      functionParams: [toAddress, amountWei],
      gasUsed,
      gasPrice,
      metadata: {
        operation: 'mint',
        contractAddress,
        toAddress,
        amount,
        amountWei: amountWei.toString(),
        gasPayer,
        targetAddress: toAddress,
        amount: amount.toString()
      }
    };

    const transaction = await this.createTransaction(transactionData);
    
    // Disparar webhook específico de mint
    if (companyId) {
      await this.triggerTransactionWebhooks('transaction.mint', transaction, companyId);
    }
    
    return transaction;
  }

  /**
   * Registra uma transação de burn
   */
  async recordBurnTransaction(data) {
    const {
      companyId,
      userId,
      contractAddress,
      fromAddress,
      amount,
      amountWei,
      gasPayer,
      network,
      txHash,
      gasUsed,
      gasPrice,
      blockNumber,
      status = 'confirmed'
    } = data;

    const transactionData = {
      companyId,
      userId,
      network: network || 'testnet',
      transactionType: 'contract_call',
      status,
      txHash,
      blockNumber: blockNumber.toString(),
      fromAddress: gasPayer,
      toAddress: contractAddress,
      contractAddress: contractAddress,
      functionName: 'burnFrom',
      gasUsed: gasUsed.toString(),
      amount: parseFloat(amount),
      currency: 'cBRL',
      confirmedAt: new Date(),
      metadata: {
        operation: 'burn',
        contractAddress,
        fromAddress,
        amount,
        amountWei: amountWei.toString(),
        gasPayer,
        targetAddress: fromAddress,
        functionParams: [fromAddress, amountWei.toString()],
        tokenSymbol: 'cBRL',
        tokenName: 'Clube Digital Real Brasil'
      }
    };

    const transaction = await this.createTransaction(transactionData);
    
    // Disparar webhook específico de burn
    if (companyId) {
      await this.triggerTransactionWebhooks('transaction.burn', transaction, companyId);
    }
    
    return transaction;
  }

  /**
   * Registra uma transação de transfer
   */
  async recordTransferTransaction(data) {
    const {
      companyId,
      userId,
      contractAddress,
      fromAddress,
      toAddress,
      amount,
      amountWei,
      gasPayer,
      network,
      txHash,
      gasUsed,
      gasPrice,
      blockNumber,
      status = 'confirmed'
    } = data;

    const transactionData = {
      companyId,
      userId,
      network: network || 'testnet',
      transactionType: 'contract_call',
      status,
      txHash,
      blockNumber,
      fromAddress: gasPayer,
      toAddress: contractAddress,
      functionName: 'transferFromGasless',
      functionParams: [fromAddress, toAddress, amountWei],
      gasUsed,
      gasPrice,
      metadata: {
        operation: 'transfer',
        contractAddress,
        fromAddress,
        toAddress,
        amount,
        amountWei: amountWei.toString(),
        gasPayer,
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: amount.toString()
      }
    };

    const transaction = await this.createTransaction(transactionData);
    
    // Disparar webhook específico de transfer
    if (companyId) {
      await this.triggerTransactionWebhooks('transaction.transfer', transaction, companyId);
    }
    
    return transaction;
  }

  /**
   * Registra uma transação de grant role
   */
  async recordGrantRoleTransaction(data) {
    const {
      companyId,
      userId,
      contractAddress,
      role,
      targetAddress,
      gasPayer,
      network,
      txHash,
      gasUsed,
      gasPrice,
      blockNumber,
      status = 'confirmed'
    } = data;

    const transactionData = {
      companyId,
      userId,
      network: network || 'testnet',
      transactionType: 'contract_call',
      status,
      txHash,
      blockNumber,
      fromAddress: gasPayer,
      toAddress: contractAddress,
      functionName: 'grantRole',
      functionParams: [role, targetAddress],
      gasUsed,
      gasPrice,
      metadata: {
        operation: 'grant_role',
        contractAddress,
        role,
        targetAddress,
        gasPayer
      }
    };

    return await this.createTransaction(transactionData);
  }

  /**
   * Registra uma transação de revoke role
   */
  async recordRevokeRoleTransaction(data) {
    const {
      companyId,
      userId,
      contractAddress,
      role,
      targetAddress,
      gasPayer,
      network,
      txHash,
      gasUsed,
      gasPrice,
      blockNumber,
      status = 'confirmed'
    } = data;

    const transactionData = {
      companyId,
      userId,
      network: network || 'testnet',
      transactionType: 'contract_call',
      status,
      txHash,
      blockNumber,
      fromAddress: gasPayer,
      toAddress: contractAddress,
      functionName: 'revokeRole',
      functionParams: [role, targetAddress],
      gasUsed,
      gasPrice,
      metadata: {
        operation: 'revoke_role',
        contractAddress,
        role,
        targetAddress,
        gasPayer
      }
    };

    return await this.createTransaction(transactionData);
  }

  /**
   * Busca transações por empresa (todas as transações de todos os usuários da empresa)
   */
  async getTransactionsByCompany(companyId, options = {}) {
    try {
      console.log('🔍 [TransactionService] Buscando transações para companyId:', companyId);
      
      if (!this.prisma) {
        console.log('🔍 [TransactionService] Inicializando Prisma...');
        await this.initialize();
      }
      
      if (!companyId) {
        console.error('❌ [TransactionService] CompanyID é obrigatório');
        return {
          rows: [],
          count: 0
        };
      }

      const { 
        page = 1, 
        limit = 50, 
        status, 
        network, 
        transactionType, 
        tokenSymbol, 
        startDate, 
        endDate,
        userId: filterUserId
      } = options;

      // Construir filtros
      const where = { 
        companyId: companyId  // Buscar todas as transações da empresa
      };
      
      // IMPORTANTE: Filtrar apenas pela rede DEFAULT_NETWORK
      const defaultNetwork = process.env.DEFAULT_NETWORK || 'mainnet';
      where.network = defaultNetwork;
      console.log('🌐 [TransactionService] Filtrando apenas transações da rede:', defaultNetwork);
      
      // Filtro por usuário específico (opcional)
      if (filterUserId) {
        where.userId = filterUserId;
      }
      
      // Adicionar filtros opcionais
      if (status) where.status = status;
      if (network && network !== defaultNetwork) {
        console.log('⚠️ [TransactionService] Filtro de rede ignorado, usando DEFAULT_NETWORK:', defaultNetwork);
      }
      if (transactionType) where.transactionType = transactionType;
      
      if (tokenSymbol && tokenSymbol !== '') {
        where.AND = where.AND || [];
        where.AND.push({
          metadata: {
            path: ['tokenSymbol'],
            equals: tokenSymbol
          }
        });
      }
      
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      // Excluir transações de cancelamento (o status já aparece na ordem original)
      where.AND = where.AND || [];
      where.AND.push({
        NOT: {
          AND: [
            { transactionType: 'exchange' },
            { functionName: 'cancel' }
          ]
        }
      });

      console.log('🔍 [TransactionService] Filtros aplicados:', JSON.stringify(where, null, 2));

      // Executar query no Prisma
      console.log('🔍 [TransactionService] Executando queries Prisma para empresa...');
      
      let transactions, count;
      try {
        console.log('🔍 [TransactionService] INCLUDE CONFIG DETALHADA:', JSON.stringify({
          include: {
            company: {
              select: {
                id: true,
                name: true,
                alias: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                blockchainAddress: true
              }
            }
          }
        }, null, 2));

        const queryOptions = {
          where,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                alias: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                blockchainAddress: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        };

        console.log('🔍 [TransactionService] QUERY OPTIONS FINAL:', JSON.stringify(queryOptions, null, 2));

        [transactions, count] = await Promise.all([
          this.prisma.transaction.findMany(queryOptions),
          this.prisma.transaction.count({ where })
        ]);
        
        console.log('🔍 [TransactionService] Queries executadas com sucesso para empresa');
        console.log('🔍 [TransactionService] SAMPLE TRANSACTION DATA:', {
          count: transactions.length,
          firstTransaction: transactions[0] ? {
            id: transactions[0].id,
            hasUser: !!transactions[0].user,
            hasCompany: !!transactions[0].company,
            userKeys: transactions[0].user ? Object.keys(transactions[0].user) : null,
            companyKeys: transactions[0].company ? Object.keys(transactions[0].company) : null
          } : null
        });
      } catch (prismaError) {
        console.error('❌ [TransactionService] Erro na query Prisma:', {
          error: prismaError.message,
          stack: prismaError.stack
        });
        throw prismaError;
      }
      
      console.log(`🔍 [TransactionService] Query executada: ${transactions.length} transações encontradas de ${count} total para empresa ${companyId}`);

      // Comprehensive BigInt to string conversion function
      const convertBigIntToString = (obj) => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return obj.toString();
        
        // Preserve Date objects by converting to ISO string
        if (obj instanceof Date) {
          return obj.toISOString();
        }
        
        if (Array.isArray(obj)) return obj.map(convertBigIntToString);
        if (typeof obj === 'object' && obj.constructor === Object) {
          const converted = {};
          for (const [key, value] of Object.entries(obj)) {
            converted[key] = convertBigIntToString(value);
          }
          return converted;
        }
        if (typeof obj === 'object') {
          const converted = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              converted[key] = convertBigIntToString(obj[key]);
            }
          }
          return converted;
        }
        return obj;
      };
      
      // Enrich ALL transactions with user data to ensure blockchainAddress is available
      const enrichedTransactions = await Promise.all(transactions.map(async (tx) => {
        // Always fetch user data to ensure we have blockchainAddress
        if (tx.userId) {
          console.log('🔍 [TransactionService] Enriching transaction with user data:', tx.id, 'userId:', tx.userId);
          try {
            const user = await this.prisma.user.findUnique({
              where: { id: tx.userId },
              select: {
                id: true,
                name: true,
                email: true,
                blockchainAddress: true
              }
            });
            // Override or set the user data
            tx.user = user;
            console.log('✅ [TransactionService] User enriched:', user?.name, 'address:', user?.blockchainAddress);
          } catch (error) {
            console.warn('⚠️ [TransactionService] Failed to enrich transaction with user data:', error.message);
          }
        }

        // Enriquecer transações de exchange (buy/sell/cancel) com detalhes da ordem
        if ((tx.transactionType === 'buy' || tx.transactionType === 'sell' || tx.transactionType === 'cancel') && tx.contractAddress) {
          try {
            // Buscar a ordem relacionada pelo txHash
            const order = await this.prisma.exchangeOrder.findFirst({
              where: {
                transactionHash: tx.txHash,
                exchangeContractAddress: tx.contractAddress
              },
              select: {
                id: true,
                blockchainOrderId: true,
                orderType: true,
                orderSide: true,
                status: true,
                price: true,
                amount: true,
                remainingAmount: true,
                filledAmount: true,
                tokenASymbol: true,
                tokenBSymbol: true
              }
            });

            if (order) {
              // Adicionar detalhes da ordem aos metadados
              tx.metadata = {
                ...tx.metadata,
                orderDetails: {
                  orderId: order.blockchainOrderId?.toString(),
                  orderType: order.orderType,
                  orderSide: order.orderSide,
                  orderStatus: order.status,
                  price: order.price?.toString(),
                  amount: order.amount?.toString(),
                  filledAmount: order.filledAmount?.toString(),
                  remainingAmount: order.remainingAmount?.toString(),
                  tokenPair: `${order.tokenBSymbol}/${order.tokenASymbol}`
                }
              };

              // Converter status da ordem para status legível
              if (order.status === 'ACTIVE') {
                tx.status = 'Pendente';
              } else if (order.status === 'EXECUTED' || order.status === 'FILLED') {
                tx.status = 'Confirmado';
              } else if (order.status === 'CANCELLED') {
                tx.status = 'Cancelado';
              }
            }
          } catch (error) {
            console.warn(`⚠️ [TransactionService] Erro ao enriquecer transação de exchange ${tx.id}:`, error.message);
          }
        }

        return tx;
      }));

      // Convert all transactions with comprehensive BigInt handling
      const formattedTransactions = enrichedTransactions.map(tx => {
        const converted = convertBigIntToString(tx);
        return {
          ...converted,
          getFormattedResponse: function() { return this; }
        };
      });

      console.log(`✅ [TransactionService] Encontradas ${count} transações para companyId ${companyId}`);

      return {
        rows: formattedTransactions,
        count
      };
    } catch (error) {
      console.error('❌ [TransactionService] Erro ao buscar transações da empresa:', {
        companyId,
        error: error.message,
        stack: error.stack
      });
      
      // Retornar resultado vazio ao invés de lançar erro
      return {
        rows: [],
        count: 0
      };
    }
  }

  /**
   * Busca transações por usuário (versão corrigida)
   */
  async getTransactionsByUser(userId, options = {}) {
    try {
      console.log('🔍 [TransactionService] Buscando TODAS as transações para userId:', userId);
      
      if (!this.prisma) {
        console.log('🔍 [TransactionService] Inicializando Prisma...');
        await this.initialize();
      }
      
      if (!userId) {
        console.error('❌ [TransactionService] UserID é obrigatório');
        return {
          rows: [],
          count: 0
        };
      }

      const { 
        page = 1, 
        limit = 50, 
        status, 
        network, 
        transactionType, 
        tokenSymbol, 
        startDate, 
        endDate 
      } = options;

      // Construir filtros
      const where = {
        userId: userId  // SEMPRE filtrar por userId, independente da empresa
      };
      
      // Adicionar filtros opcionais
      if (status) where.status = status;
      if (network) where.network = network; 
      
      // Filtro de tipo de transação complexo - considerar tanto transactionType quanto operation nos metadados
      console.log('🔍 [TransactionService] Verificando filtro transactionType:', transactionType, 'tipo:', typeof transactionType);
      if (transactionType) {
        // Mapear tipos do frontend para tipos/operations do backend
        const typeMapping = {
          'deposit': {
            OR: [
              { transactionType: 'deposit' },
              { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'deposit' } },
              { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'mint' } }
            ]
          },
          'withdraw': {
            OR: [
              { transactionType: 'withdraw' },
              { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'withdraw' } },
              { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'burn' } }
            ]
          },
          'exchange': {
            OR: [
              { transactionType: 'exchange' },
              { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'exchange' } },
              { transactionType: 'transfer', metadata: { path: ['operation'], equals: 'exchange' } }
            ]
          },
          'transfer': {
            AND: [
              { 
                OR: [
                  { transactionType: 'transfer' },
                  { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'transfer' } }
                ]
              },
              {
                NOT: {
                  metadata: { path: ['operation'], equals: 'exchange' }
                }
              }
            ]
          },
          'stake': {
            OR: [
              { transactionType: 'stake' },
              { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'stake' } }
            ]
          },
          'unstake': {
            OR: [
              { transactionType: 'unstake' },
              { transactionType: 'contract_call', metadata: { path: ['operation'], equals: 'unstake' } }
            ]
          }
        };
        
        console.log('🔍 [TransactionService] transactionType solicitado:', transactionType);
        console.log('🔍 [TransactionService] typeMapping disponível:', Object.keys(typeMapping));
        
        if (typeMapping[transactionType]) {
          console.log('🔍 [TransactionService] Aplicando mapeamento complexo para:', transactionType);
          where.AND = where.AND || [];
          where.AND.push(typeMapping[transactionType]);
        } else {
          console.log('🔍 [TransactionService] Usando fallback para tipo não mapeado:', transactionType);
          where.transactionType = transactionType;
        }
      }

      if (tokenSymbol && tokenSymbol !== '') {
        where.AND = where.AND || [];
        where.AND.push({
          metadata: {
            path: ['tokenSymbol'],
            equals: tokenSymbol
          }
        });
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      // Excluir transações de cancelamento (o status já aparece na ordem original)
      where.AND = where.AND || [];
      where.AND.push({
        NOT: {
          AND: [
            { transactionType: 'exchange' },
            { functionName: 'cancel' }
          ]
        }
      });

      console.log('🔍 [TransactionService] Filtros aplicados:', JSON.stringify(where, null, 2));

      // Executar query no Prisma com tratamento específico de BigInt
      console.log('🔍 [TransactionService] Executando queries Prisma...');
      
      let transactions, count;
      try {
        [transactions, count] = await Promise.all([
          this.prisma.transaction.findMany({
            where,
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  alias: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
          }),
          this.prisma.transaction.count({ where })
        ]);
        
        console.log('🔍 [TransactionService] Queries executadas com sucesso');
      } catch (prismaError) {
        console.error('❌ [TransactionService] Erro na query Prisma:', {
          error: prismaError.message,
          stack: prismaError.stack
        });
        throw prismaError;
      }
      
      console.log(`🔍 [TransactionService] Query executada: ${transactions.length} transações encontradas de ${count} total`);

      // 🔥 DEBUG: Log primeiras 3 transações retornadas pelo Prisma ANTES de enrichment
      console.log('🔥 [TransactionService] ORDEM DAS TRANSAÇÕES DO PRISMA (primeiras 3):');
      transactions.slice(0, 3).forEach((tx, idx) => {
        console.log(`  ${idx + 1}. ${tx.id} | ${tx.transactionType} | ${tx.createdAt}`);
      });

      console.log(`✅ [TransactionService] Encontradas ${count} transações para userId ${userId}`);

      // Comprehensive BigInt to string conversion function
      const convertBigIntToString = (obj) => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return obj.toString();
        
        // Preserve Date objects by converting to ISO string
        if (obj instanceof Date) {
          return obj.toISOString();
        }
        
        if (Array.isArray(obj)) return obj.map(convertBigIntToString);
        if (typeof obj === 'object' && obj.constructor === Object) {
          const converted = {};
          for (const [key, value] of Object.entries(obj)) {
            converted[key] = convertBigIntToString(value);
          }
          return converted;
        }
        if (typeof obj === 'object') {
          // Handle Prisma models and other objects, but preserve Date objects
          const converted = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              converted[key] = convertBigIntToString(obj[key]);
            }
          }
          return converted;
        }
        return obj;
      };

      // Enriquecer transações de stake com informações do token real
      const enrichedTransactions = await Promise.all(transactions.map(async (tx) => {
        let enrichedTx = { ...tx };
        
        // Se for uma transação de stake/unstake/stake_reward, buscar o token real do contrato
        if ((tx.transactionType === 'stake' || tx.transactionType === 'unstake' || 
             tx.transactionType === 'stake_reward') && tx.contractAddress) {
          
          try {
            console.log(`🔍 [TransactionService] Enriquecendo transação de stake: ${tx.id}`);
            
            // Buscar o contrato de stake
            const stakeContract = await this.prisma.smartContract.findUnique({
              where: { address: tx.contractAddress },
              select: { metadata: true }
            });
            
            if (stakeContract && stakeContract.metadata) {
              // Extrair o tokenAddress dos metadados do contrato de stake
              const metadata = typeof stakeContract.metadata === 'string' 
                ? JSON.parse(stakeContract.metadata) 
                : stakeContract.metadata;
              
              const tokenAddress = metadata.tokenAddress || metadata.stakeToken;
              
              if (tokenAddress) {
                console.log(`📍 [TransactionService] Token address encontrado: ${tokenAddress}`);
                
                // Buscar o contrato do token
                const tokenContract = await this.prisma.smartContract.findUnique({
                  where: { address: tokenAddress },
                  select: { name: true, metadata: true }
                });
                
                if (tokenContract) {
                  const tokenMetadata = typeof tokenContract.metadata === 'string'
                    ? JSON.parse(tokenContract.metadata)
                    : tokenContract.metadata;
                  
                  // Sobrescrever currency e adicionar informações do token aos metadados
                  const tokenSymbol = tokenMetadata.symbol || tokenMetadata.tokenSymbol || tx.currency;
                  const tokenName = tokenContract.name || tokenMetadata.name || tokenSymbol;
                  
                  enrichedTx.currency = tokenSymbol;
                  enrichedTx.metadata = {
                    ...enrichedTx.metadata,
                    tokenSymbol: tokenSymbol,
                    tokenName: tokenName,
                    tokenAddress: tokenAddress,
                    enrichedFromContract: true
                  };
                  
                  console.log(`✅ [TransactionService] Token enriquecido: ${tokenSymbol} - ${tokenName}`);
                }
              }
            }
          } catch (error) {
            console.warn(`⚠️ [TransactionService] Erro ao enriquecer transação ${tx.id}:`, error.message);
            // Continuar com os dados originais se houver erro
          }
        }

        // Enriquecer transações de exchange (buy/sell/cancel) com detalhes da ordem
        if (tx.transactionType === 'exchange' && tx.contractAddress && tx.functionName &&
            ['buy', 'sell', 'cancel'].includes(tx.functionName)) {
          try {
            console.log(`🔍 [TransactionService] Tentando enriquecer transação ${tx.id} (${tx.functionName}):`, {
              txHash: tx.txHash,
              contractAddress: tx.contractAddress,
              metadata: tx.metadata
            });

            // Variável para armazenar o orderId extraído (usada tanto para buscar ordem quanto para o fallback)
            let orderId = tx.metadata?.orderId;

            // Tentar buscar a ordem relacionada pelo txHash
            let order = await this.prisma.exchangeOrder.findFirst({
              where: {
                transactionHash: tx.txHash,
                exchangeContractAddress: tx.contractAddress
              },
              select: {
                id: true,
                blockchainOrderId: true,
                orderType: true,
                orderSide: true,
                status: true,
                price: true,
                amount: true,
                remainingAmount: true,
                filledAmount: true,
                tokenASymbol: true,
                tokenBSymbol: true
              }
            });

            // Se não encontrou por txHash, tentar extrair orderId da blockchain e buscar
            if (!order) {

              // Se não tem orderId nos metadados, tentar extrair do receipt da blockchain
              if (!orderId && tx.txHash) {
                try {
                  const { ethers } = require('ethers');
                  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-testnet.azore.technology');
                  const receipt = await provider.getTransactionReceipt(tx.txHash);

                  if (receipt && receipt.logs && receipt.logs.length > 0) {
                    // Event OrderCreated(uint256 indexed orderId, address indexed trader, bool isBuy, ...)
                    // Topic 0 = event signature hash
                    // Topic 1 = orderId (indexed)
                    // Topic 2 = trader address (indexed)
                    const orderCreatedTopic = ethers.id("OrderCreated(uint256,address,bool,uint256,uint256)");
                    const log = receipt.logs.find(l => l.topics[0] === orderCreatedTopic);

                    if (log && log.topics[1]) {
                      orderId = parseInt(log.topics[1], 16); // Convert hex to decimal
                      console.log(`📋 [TransactionService] orderId extraído da blockchain: ${orderId}`);
                    }
                  }
                } catch (extractError) {
                  console.warn(`⚠️ [TransactionService] Erro ao extrair orderId da blockchain:`, extractError.message);
                }
              }

              if (orderId) {
                console.log(`🔍 [TransactionService] Tentando buscar ordem por blockchainOrderId: ${orderId}`);
                order = await this.prisma.exchangeOrder.findFirst({
                  where: {
                    blockchainOrderId: parseInt(orderId),
                    exchangeContractAddress: tx.contractAddress,
                    orderType: tx.functionName.toUpperCase()
                  },
                  select: {
                    id: true,
                    blockchainOrderId: true,
                    orderType: true,
                    orderSide: true,
                    status: true,
                    price: true,
                    amount: true,
                    remainingAmount: true,
                    filledAmount: true,
                    tokenASymbol: true,
                    tokenBSymbol: true
                  },
                  orderBy: {
                    createdAt: 'desc' // Pegar a ordem mais recente se houver duplicatas
                  }
                });
              }
            }

            console.log(`📋 [TransactionService] Ordem encontrada para tx ${tx.id}:`, order ? `Ordem #${order.blockchainOrderId} (${order.status})` : 'Nenhuma ordem encontrada');

            if (order) {
              // Adicionar detalhes da ordem aos metadados
              enrichedTx.metadata = {
                ...enrichedTx.metadata,
                orderDetails: {
                  orderId: order.blockchainOrderId?.toString(),
                  orderType: order.orderType,
                  orderSide: order.orderSide,
                  orderStatus: order.status,
                  price: order.price?.toString(),
                  amount: order.amount?.toString(),
                  filledAmount: order.filledAmount?.toString(),
                  remainingAmount: order.remainingAmount?.toString(),
                  tokenPair: `${order.tokenBSymbol}/${order.tokenASymbol}`
                }
              };

              console.log(`✅ [TransactionService] orderDetails adicionado à transação ${tx.id}`);

              // Converter status da ordem para status da transação (usar valores lowercase que o frontend espera)
              const oldStatus = enrichedTx.status;
              if (order.status === 'ACTIVE') {
                enrichedTx.status = 'pending';
              } else if (order.status === 'EXECUTED' || order.status === 'FILLED') {
                enrichedTx.status = 'confirmed';
              } else if (order.status === 'CANCELLED') {
                enrichedTx.status = 'cancelled';
              }
              console.log(`📊 [TransactionService] Status alterado de "${oldStatus}" para "${enrichedTx.status}" (ordem: ${order.status})`);
            } else {
              // Mesmo sem ordem, criar orderDetails completo para exibir tooltip
              enrichedTx.metadata = {
                ...enrichedTx.metadata,
                orderDetails: {
                  orderId: orderId?.toString() || '-',
                  orderType: tx.functionName?.toUpperCase(),
                  orderSide: 'LIMIT',
                  orderStatus: 'UNKNOWN',
                  price: tx.metadata?.price || '-',
                  amount: tx.amount?.toString() || '-',
                  filledAmount: '0',
                  remainingAmount: tx.amount?.toString() || '-',
                  tokenPair: tx.currency ? `${tx.currency}/${tx.metadata?.tokenASymbol || 'cBRL'}` : '-',
                  txHash: tx.txHash
                }
              };
              console.log(`📋 [TransactionService] orderDetails completo criado para tx ${tx.id} sem ordem no banco`);
            }
          } catch (error) {
            console.warn(`⚠️ [TransactionService] Erro ao enriquecer transação de exchange ${tx.id}:`, error.message);
          }
        }

        return enrichedTx;
      }));
      
      // Convert all transactions with comprehensive BigInt handling
      const formattedTransactions = enrichedTransactions.map(tx => {
        const converted = convertBigIntToString(tx);
        return {
          ...converted,
          getFormattedResponse: function() { return this; }
        };
      });

      // 🔥 DEBUG: Log primeiras 3 transações DEPOIS de enrichment e formatação
      console.log('🔥 [TransactionService] ORDEM FINAL DAS TRANSAÇÕES (primeiras 3):');
      formattedTransactions.slice(0, 3).forEach((tx, idx) => {
        console.log(`  ${idx + 1}. ${tx.id} | ${tx.transactionType} | ${tx.createdAt}`);
      });

      return {
        rows: formattedTransactions,
        count
      };
    } catch (error) {
      console.error('❌ [TransactionService] Erro ao buscar transações:', {
        userId,
        error: error.message,
        stack: error.stack
      });
      
      // Retornar resultado vazio ao invés de lançar erro
      return {
        rows: [],
        count: 0
      };
    }
  }

  /**
   * Debug - busca transações com logs detalhados
   */
  async debugGetTransactionsByUser(userId, options = {}) {
    try {
      if (!this.prisma) {
        await this.initialize();
      }

      console.log('🐛 DEBUG - Parâmetros recebidos:', options);
      
      const { page = 1, limit = 50, tokenSymbol } = options;
      
      const where = { userId };
      
      if (tokenSymbol) {
        where.metadata = {
          path: ['tokenSymbol'],
          equals: tokenSymbol
        };
        console.log('🐛 DEBUG - Aplicando filtro tokenSymbol:', tokenSymbol);
      }
      
      console.log('🐛 DEBUG - Where final:', JSON.stringify(where, null, 2));
      
      const [transactions, count] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        this.prisma.transaction.count({ where })
      ]);
      
      console.log('🐛 DEBUG - Resultados: count =', count, ', rows =', transactions.length);
      
      return { rows: transactions, count };
    } catch (error) {
      console.error('Erro no debug:', error.message);
      throw error;
    }
  }

  /**
   * Busca transação por hash
   */
  async getTransactionByHash(txHash) {
    try {
      if (!this.Transaction) {
        await this.initialize();
      }

      return await this.Transaction.findByTxHash(txHash);
    } catch (error) {
      console.error('Erro ao buscar transação por hash:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de transações
   */
  async getTransactionStats(options = {}) {
    try {
      if (!this.Transaction) {
        await this.initialize();
      }

      return await this.Transaction.getStats(options);
    } catch (error) {
      console.error('Erro ao obter estatísticas de transações:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas por status
   */
  async getStatusStats(options = {}) {
    try {
      if (!this.Transaction) {
        await this.initialize();
      }

      return await this.Transaction.getStatusStats(options);
    } catch (error) {
      console.error('Erro ao obter estatísticas por status:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas por tipo
   */
  async getTypeStats(options = {}) {
    try {
      if (!this.Transaction) {
        await this.initialize();
      }

      return await this.Transaction.getTypeStats(options);
    } catch (error) {
      console.error('Erro ao obter estatísticas por tipo:', error.message);
      throw error;
    }
  }

  /**
   * Obtém tokens cadastrados no banco de dados
   * Filtra apenas contratos que são tokens (contract_types.name contém "token")
   */
  async getAvailableTokens(companyId = null) {
    try {
      if (!this.prisma) {
        await this.initialize();
      }

      console.log('🪙 [TransactionService] Obtendo tokens cadastrados no banco de dados');
      
      // Buscar smart_contracts que são tokens
      const tokens = await this.prisma.smartContract.findMany({
        where: {
          isActive: true,
          ...(companyId && { companyId: companyId }),
          contractType: {
            name: {
              contains: 'token',
              mode: 'insensitive'
            },
            isActive: true
          }
        },
        include: {
          contractType: {
            select: {
              name: true,
              category: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      console.log(`✅ [TransactionService] Encontrados ${tokens.length} tokens`);
      
      // Mapear para formato adequado ao frontend
      const formattedTokens = tokens.map(token => ({
        value: token.name,
        label: token.name,
        address: token.address,
        network: token.network,
        contractType: token.contractType?.name,
        category: token.contractType?.category
      }));

      return formattedTokens;
    } catch (error) {
      console.error('❌ [TransactionService] Erro ao obter tokens:', error.message);
      throw error;
    }
  }

  /**
   * Testa o serviço
   */
  async testService() {
    try {
      await this.initialize();
      return {
        success: true,
        message: 'TransactionService inicializado com sucesso',
        data: {
          service: 'TransactionService',
          status: 'ready',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao inicializar TransactionService',
        error: error.message
      };
    }
  }
}

module.exports = new TransactionService(); 
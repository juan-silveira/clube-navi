const { ethers } = require('ethers');
const prismaConfig = require('../config/prisma');
const userTaxesService = require('./userTaxes.service');
const blockchainService = require('./blockchain.service');
const userService = require('./user.service');
const transactionService = require('./transaction.service');
const logService = require('./log.service');
const userCompanyService = require('./userCompany.service');

class TransferService {
  constructor() {
    this.prisma = null;
  }

  async init() {
    this.prisma = prismaConfig.getPrisma();
  }

  /**
   * Criar nova transferência na tabela transactions
   */
  async createTransfer({
    userId,
    amount,
    asset,
    type, // internal ou external
    description = null, // Valor padrão null se não fornecido
    recipient // { userId, address } para interno ou { address } para externo
  }) {
    try {
      if (!this.prisma) await this.init();

      // Validar usuário
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      console.log('🔍 Preparando transferência gasless:', {
        fromAddress: user.publicKey,
        asset: asset,
        amountRequested: amount
      });

      // Determinar endereço de destino
      let toAddress;
      let recipientUser = null;
      
      if (type === 'internal') {
        // Buscar usuário destinatário
        recipientUser = await userService.getUserById(recipient.userId);
        if (!recipientUser) {
          throw new Error('Usuário destinatário não encontrado');
        }
        toAddress = recipientUser.publicKey;
      } else {
        // Transferência externa - usar endereço fornecido
        toAddress = recipient.address;
        
        // Validar endereço Ethereum
        if (!this.isValidEthereumAddress(toAddress)) {
          throw new Error('Endereço Ethereum inválido');
        }
      }

      // Obter metadata do token incluindo contract address
      const tokenMetadata = await this.getTokenMetadata(asset);

      // Detectar rede atual baseada no DEFAULT_NETWORK
      const currentNetwork = process.env.DEFAULT_NETWORK || 'testnet';

      // Calcular taxa de transferência para este token
      const feeData = await userTaxesService.calculateTokenTransferFee(
        userId,
        amount,
        tokenMetadata.id || asset, // Usar ID do token se disponível
        asset // symbol
      );

      console.log('💰 Taxa calculada:', {
        fee: feeData.fee,
        feeType: feeData.feeType,
        tokenSymbol: asset
      });

      // Obter a empresa atual do usuário
      const currentCompany = await userCompanyService.getCurrentCompany(userId);
      if (!currentCompany) {
        throw new Error('Usuário não está associado a nenhuma empresa ativa');
      }

      console.log('🏢 Empresa atual do usuário:', {
        companyId: currentCompany.id,
        companyName: currentCompany.name,
        userId: userId
      });

      // Criar registro da transação de transferência
      const transfer = await this.prisma.transaction.create({
        data: {
          companyId: currentCompany.id, // Usar ID da empresa atual
          userId: userId,
          transactionType: 'transfer',
          operation_type: type === 'internal' ? 'internal_transfer' : 'external_transfer',
          status: 'pending',
          amount: amount,
          currency: asset,
          network: currentNetwork,
          contractAddress: tokenMetadata.contractAddress,
          fromAddress: user.publicKey,
          toAddress: toAddress,
          functionName: 'transferFromGasless',
          fee: feeData.fee, // Taxa calculada
          net_amount: amount, // Valor líquido que o destinatário vai receber
          metadata: {
            description: description || null, // Garantir que seja null se não fornecido
            recipientUserId: recipientUser?.id || null,
            tokenMetadata: tokenMetadata,
            feeData: feeData, // Incluir dados da taxa
            userAgent: 'TransferService',
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('✅ Transação de transferência criada:', {
        transactionId: transfer.id,
        userId: userId,
        amount: amount,
        asset: asset,
        type: type,
        toAddress: toAddress
      });

      return transfer;

    } catch (error) {
      console.error('❌ Erro ao criar transferência:', error.message);
      throw error;
    }
  }

  /**
   * Executar transferência na blockchain
   */
  async executeTransfer(transactionId) {
    try {
      if (!this.prisma) await this.init();

      // Buscar transação
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      if (transaction.status !== 'pending') {
        throw new Error(`Transação já foi processada. Status: ${transaction.status}`);
      }

      // Atualizar status para processing
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: { 
          status: 'confirmed'
        }
      });

      try {
        const feeAmount = parseFloat(transaction.fee) || 0;
        const hasTransferFee = feeAmount > 0;

        // 1. Executar transferência do valor para o destinatário
        console.log('📤 Transferindo valor para destinatário:', {
          from: transaction.fromAddress,
          to: transaction.toAddress,
          amount: transaction.amount,
          currency: transaction.currency
        });

        const txResult = await this.executeTransferFromGasless(
          transaction.fromAddress,
          transaction.toAddress,
          transaction.amount,
          transaction.currency
        );

        // 2. Se houver taxa, executar transferência da taxa para o admin
        let feeTxResult = null;
        if (hasTransferFee) {
          const adminWallet = process.env.ADMIN_WALLET_PUBLIC_KEY;

          if (!adminWallet) {
            console.warn('⚠️ ADMIN_WALLET_PUBLIC_KEY não configurado - taxa não será cobrada');
          } else {
            console.log('💰 Transferindo taxa para admin:', {
              from: transaction.fromAddress,
              to: adminWallet,
              amount: feeAmount,
              currency: transaction.currency
            });

            try {
              feeTxResult = await this.executeTransferFromGasless(
                transaction.fromAddress,
                adminWallet,
                feeAmount,
                transaction.currency
              );

              console.log('✅ Taxa transferida com sucesso:', {
                txHash: feeTxResult.transactionHash,
                amount: feeAmount,
                currency: transaction.currency
              });
            } catch (feeError) {
              console.error('❌ Erro ao transferir taxa (transferência principal já foi concluída):', feeError.message);
              // Não falhar a transação principal se a taxa falhar
              // Apenas logar o erro
            }
          }
        }

        // Atualizar transação principal com sucesso
        const updatedTransaction = await this.prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'confirmed',
            blockchain_status: 'confirmed',
            blockchain_tx_hash: txResult.transactionHash,
            txHash: txResult.transactionHash,
            blockchain_block_number: txResult.blockNumber,
            blockNumber: txResult.blockNumber,
            gasUsed: parseInt(txResult.gasUsed || '0'),
            blockchain_confirmed_at: new Date(),
            confirmedAt: new Date(),
            metadata: {
              ...transaction.metadata,
              feeTxHash: feeTxResult?.transactionHash || null, // Hash da transação de taxa
              feeTransferred: !!feeTxResult // Flag indicando se a taxa foi transferida
            }
          }
        });

        // Se for transferência interna, criar transação de entrada para o destinatário
        const recipientUserId = transaction.metadata?.recipientUserId;
        if (transaction.operation_type === 'internal_transfer' && recipientUserId) {
          // Obter a empresa atual do usuário destinatário
          const recipientCompany = await userCompanyService.getCurrentCompany(recipientUserId);
          const recipientCompanyId = recipientCompany ? recipientCompany.id : transaction.companyId;
          
          await this.prisma.transaction.create({
            data: {
              companyId: recipientCompanyId, // Usar empresa do destinatário
              userId: recipientUserId,
              transactionType: 'transfer',
              status: 'confirmed',
              amount: transaction.amount,
              currency: transaction.currency,
              network: transaction.network,
              contractAddress: transaction.contractAddress,
              fromAddress: transaction.fromAddress,
              toAddress: transaction.toAddress,
              txHash: txResult.transactionHash, // Usar o mesmo hash da transação original
              blockchain_tx_hash: txResult.transactionHash, // Usar o mesmo hash da transação original
              blockNumber: txResult.blockNumber,
              blockchain_block_number: txResult.blockNumber,
              gasUsed: parseInt(txResult.gasUsed || '0'),
              functionName: 'transferFromGasless',
              blockchain_status: 'confirmed',
              confirmedAt: new Date(),
              blockchain_confirmed_at: new Date(),
              fee: 0,
              net_amount: transaction.amount,
              operation_type: 'internal_transfer_received',
              metadata: {
                originalTransactionId: transactionId,
                originalTxHash: txResult.transactionHash, // Manter referência ao hash original
                description: transaction.metadata?.description || null, // Garantir que seja null se não fornecido
                userAgent: 'TransferService',
                timestamp: new Date().toISOString()
              }
            }
          });
        }

        console.log('✅ Transferência executada com sucesso:', {
          transactionId: transactionId,
          txHash: txResult.transactionHash,
          status: 'completed'
        });

        return updatedTransaction;

      } catch (blockchainError) {
        // Erro na blockchain - marcar como falha
        await this.prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'failed',
            blockchain_status: 'failed',
            blockchain_failed_at: new Date(),
            failedAt: new Date(),
            metadata: {
              ...transaction.metadata,
              error: blockchainError.message
            }
          }
        });

        throw blockchainError;
      }

    } catch (error) {
      console.error('❌ Erro ao executar transferência:', error.message);
      throw error;
    }
  }

  /**
   * Executar transferência na blockchain Azore
   * - Para tokens nativos (AZE/AZE-t): usa transfer normal
   * - Para outros tokens: usa transferFromGasless
   */
  async executeTransferFromGasless(fromAddress, toAddress, amount, tokenSymbol) {
    try {
      console.log('🚀 === INÍCIO DA TRANSFERÊNCIA ===');
      console.log('📤 Dados recebidos na executeTransferFromGasless:', {
        fromAddress,
        toAddress,
        amount,
        amountType: typeof amount,
        tokenSymbol,
        tokenSymbolType: typeof tokenSymbol
      });
      
      // Obter metadata do token
      const tokenMetadata = await this.getTokenMetadata(tokenSymbol);
      console.log('🔑 Metadata do token:', {
        contractAddress: tokenMetadata.contractAddress,
        gasPayer: tokenMetadata.gasPayer ? 'configurado' : 'não configurado',
        isNative: tokenMetadata.isNative
      });

      // Preparar dados da transação (converte para Wei com 18 decimais)
      const amountWei = blockchainService.toWei(amount.toString());
      
      console.log('💰 Valores da transferência:', {
        fromAddress,
        toAddress,
        amountWei: amountWei.toString(),
        tokenSymbol,
        contractAddress: tokenMetadata.contractAddress,
        isNative: tokenMetadata.isNative
      });

      let tx;
      
      if (tokenMetadata.isNative) {
        // Para tokens nativos (AZE/AZE-t): transferência nativa
        console.log('🪙 Token nativo detectado - executando transferência nativa');
        
        // Buscar usuário pela publicKey (fromAddress) para obter a privateKey
        const user = await this.prisma.user.findFirst({ 
          where: { publicKey: fromAddress } 
        });
        
        if (!user) {
          throw new Error(`Usuário não encontrado para o endereço ${fromAddress}`);
        }
        
        if (!user.privateKey) {
          throw new Error('Chave privada não encontrada para o usuário');
        }
        
        console.log('🔐 Usando chave privada do usuário para transação nativa');
        
        // Executar transferência nativa com a chave privada do usuário
        tx = await blockchainService.sendNativeToken(
          user.privateKey, 
          toAddress, 
          ethers.formatEther(amountWei) // Converter de Wei para Ether
        );
      } else {
        // Para tokens não nativos: usar transferFromGasless
        console.log('🔗 Token contrato detectado - executando transferFromGasless');
        
        // Obter contrato do token já configurado com o gasPayer
        const tokenContract = await blockchainService.getTokenContract(tokenSymbol);
        
        // Chamar função transferFromGasless
        // O gasPayer (configurado no metadata) executará e pagará pela transação
        console.log('🔗 Chamando transferFromGasless com parâmetros:', {
          fromAddress,
          toAddress,
          amountWei: amountWei.toString(),
          contractAddress: tokenMetadata.contractAddress,
          gasPayerAddress: tokenMetadata.gasPayer || tokenMetadata.adminAddress
        });
        
        tx = await tokenContract.transferFromGasless(
          fromAddress,
          toAddress,
          amountWei
        );
        
        console.log('✅ transferFromGasless executado, resposta:', {
          hash: tx.hash,
          to: tx.to,
          value: tx.value?.toString(),
          data: tx.data
        });
      }

      let result;

      if (tokenMetadata.isNative) {
        // Para tokens nativos, sendNativeToken já retorna o resultado final
        console.log('✅ Transação nativa confirmada:', {
          hash: tx.transactionHash,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          status: tx.status
        });

        result = {
          transactionHash: tx.transactionHash,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed || '0',
          status: tx.status
        };
      } else {
        // Para contratos, tx é um objeto de transação que precisa aguardar confirmação
        console.log('⏳ Aguardando confirmação da transação:', tx.hash);

        const receipt = await tx.wait();

        console.log('✅ Transação de contrato confirmada:', {
          hash: receipt.hash || tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString(),
          status: receipt.status === 1 ? 'success' : 'failed'
        });

        result = {
          transactionHash: receipt.hash || tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString() || '0',
          status: receipt.status === 1 ? 'success' : 'failed'
        };
      }

      return result;

    } catch (error) {
      console.error('❌ Erro ao executar transferFromGasless:', error.message);
      throw new Error(`Falha na transferência blockchain: ${error.message}`);
    }
  }

  /**
   * Buscar usuário por identificador (email, cpf ou telefone)
   */
  async findUserByIdentifier(type, value) {
    try {
      if (!this.prisma) await this.init();

      // console.log(`[DEBUG] Buscando usuário por ${type}: '${value}'`);

      let where = {};
      
      switch (type) {
        case 'email':
          where = { email: value.toLowerCase() };
          break;
        case 'cpf':
          // Remover formatação do CPF
          const cleanCPF = value.replace(/\D/g, '');
          where = { cpf: cleanCPF };
          // console.log(`[DEBUG] CPF limpo: '${cleanCPF}'`);
          break;
        case 'phone':
          // Remover formatação do telefone
          const cleanPhone = value.replace(/\D/g, '');
          where = { phone: cleanPhone };
          // console.log(`[DEBUG] Phone limpo: '${cleanPhone}'`);
          break;
        default:
          throw new Error('Tipo de identificador inválido');
      }

      const user = await this.prisma.user.findFirst({
        where: where,
        select: {
          id: true,
          name: true,
          email: true,
          cpf: true,
          phone: true,
          publicKey: true,
          isActive: true
        }
      });

      // console.log(`[DEBUG] Usuário encontrado:`, user ? { id: user.id, name: user.name } : 'null');

      if (!user) {
        // console.log(`[DEBUG] Nenhum usuário encontrado com critério:`, where);
        throw new Error('Usuário não encontrado');
      }

      if (!user.isActive) {
        throw new Error('Usuário inativo');
      }

      // Mascarar dados sensíveis
      return {
        id: user.id,
        name: user.name,
        email: this.maskEmail(user.email),
        cpf: user.cpf ? this.maskCPF(user.cpf) : null,
        phone: user.phone ? this.maskPhone(user.phone) : null,
        publicKey: user.publicKey
      };

    } catch (error) {
      console.error('Erro ao buscar usuário por identificador:', error.message);
      throw error;
    }
  }

  /**
   * Obter saldo de token
   */
  async getTokenBalance(address, tokenSymbol) {
    try {
      const balance = await blockchainService.getTokenBalance(address, tokenSymbol);
      return parseFloat(balance);
    } catch (error) {
      console.error('Erro ao obter saldo do token:', error.message);
      return 0;
    }
  }

  /**
   * Listar transferências do usuário
   */
  async getUserTransfers(userId, filters = {}) {
    try {
      if (!this.prisma) await this.init();

      const where = {
        userId: userId,
        transactionType: 'transfer'
      };

      // Aplicar filtros
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.type) {
        where.operation_type = filters.type === 'internal' ? 'internal_transfer' : 'external_transfer';
      }
      if (filters.asset) {
        where.currency = filters.asset;
      }

      const transfers = await this.prisma.transaction.findMany({
        where: where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 100,
        skip: filters.offset || 0
      });

      return transfers;

    } catch (error) {
      console.error('❌ Erro ao listar transferências:', error.message);
      throw error;
    }
  }

  /**
   * Obter detalhes de uma transferência
   */
  async getTransferById(transactionId, userId) {
    try {
      if (!this.prisma) await this.init();

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId: userId,
          transactionType: 'transfer'
        }
      });

      if (!transaction) {
        throw new Error('Transferência não encontrada');
      }

      return transaction;

    } catch (error) {
      console.error('❌ Erro ao obter transferência:', error.message);
      throw error;
    }
  }

  /**
   * Validar endereço Ethereum
   */
  isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Mascarar email
   */
  maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local.substring(0, 2) + '***';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mascarar CPF
   */
  maskCPF(cpf) {
    const clean = cpf.replace(/\D/g, '');
    return `${clean.substring(0, 3)}.***.***.${clean.substring(9, 11)}`;
  }

  /**
   * Mascarar telefone
   */
  maskPhone(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 3)}****-${clean.substring(7, 11)}`;
    }
    return `(${clean.substring(0, 2)}) ****-${clean.substring(6, 10)}`;
  }

  /**
   * Obter lista de tokens válidos para transferência
   */
  async getValidTokens() {
    try {
      if (!this.prisma) await this.init();

      // Buscar tokens da tabela smart_contracts
      const smartContracts = await this.prisma.smartContract.findMany({
        where: {
          isActive: true,
          metadata: {
            path: ['symbol'],
            not: null
          }
        },
        select: {
          metadata: true
        }
      });

      // Extrair símbolos dos contratos
      const contractTokens = smartContracts
        .map(contract => contract.metadata?.symbol)
        .filter(symbol => symbol); // Remove valores nulos/undefined

      // Adicionar tokens nativos da blockchain
      const nativeTokens = ['AZE', 'AZE-t'];

      // Combinar tokens de contrato com nativos
      const validTokens = [...new Set([...contractTokens, ...nativeTokens])]; // Remove duplicatas

      console.log('✅ Tokens válidos encontrados:', validTokens);

      return validTokens;

    } catch (error) {
      console.error('Erro ao obter tokens válidos:', error.message);
      throw error;
    }
  }

  /**
   * Obter metadata do token incluindo gasPayer
   */
  async getTokenMetadata(tokenSymbol) {
    try {
      if (!this.prisma) await this.init();

      console.log(`🔍 [getTokenMetadata] Buscando metadata para token: '${tokenSymbol}'`);

      // Verificar se é token nativo (AZE para mainnet, AZE-t para testnet)
      const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
      const isNativeToken = (tokenSymbol === 'AZE' && defaultNetwork === 'mainnet') || 
                          (tokenSymbol === 'AZE-t' && defaultNetwork === 'testnet');

      if (isNativeToken) {
        console.log(`🪙 Token nativo detectado: ${tokenSymbol} (rede: ${defaultNetwork})`);
        return {
          tokenSymbol: tokenSymbol,
          contractAddress: null, // Token nativo não tem contrato
          gasPayer: null, // Usuário paga o próprio gas
          metadata: {
            symbol: tokenSymbol,
            name: tokenSymbol === 'AZE' ? 'Azore' : 'Azore Testnet',
            decimals: 18,
            isNative: true
          },
          abi: null, // Token nativo não precisa de ABI
          isNative: true
        };
      }

      // Buscar contrato no banco de dados filtrado pela rede atual
      const smartContract = await this.prisma.smartContract.findFirst({
        where: {
          metadata: {
            path: ['symbol'],
            equals: tokenSymbol
          },
          network: defaultNetwork, // Filtrar pela rede atual
          isActive: true
        }
      });

      console.log(`🔍 [getTokenMetadata] Resultado da busca:`, smartContract ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      
      if (!smartContract) {
        console.log(`⚠️ [getTokenMetadata] Token ${tokenSymbol} não encontrado no banco`);
        const allContracts = await this.prisma.smartContract.findMany({
          where: { isActive: true },
          select: { 
            address: true, 
            metadata: true 
          },
          take: 10
        });
        console.log(`📋 [getTokenMetadata] Contratos disponíveis:`, allContracts.map(c => ({
          address: c.address.substring(0, 10) + '...',
          symbol: c.metadata?.symbol
        })));
        
        throw new Error(`Token ${tokenSymbol} não encontrado`);
      }

      // Extrair gasPayer do metadata - primeiro tentar adminAddress, depois gasPayer
      const metadata = smartContract.metadata || {};
      let gasPayer = metadata.adminAddress || metadata.gasPayer;

      // Fallback: usar ADMIN_WALLET_PUBLIC_KEY se nem adminAddress nem gasPayer estiverem configurados
      if (!gasPayer) {
        gasPayer = process.env.ADMIN_WALLET_PUBLIC_KEY;
        console.log(`🔧 [getTokenMetadata] adminAddress/gasPayer não configurado para ${tokenSymbol}, usando fallback: ${gasPayer}`);
        
        if (!gasPayer) {
          throw new Error(`adminAddress/gasPayer não configurado para o token ${tokenSymbol} e ADMIN_WALLET_PUBLIC_KEY não encontrado`);
        }
      } else {
        const payerType = metadata.adminAddress ? 'adminAddress' : 'gasPayer';
        console.log(`✅ [getTokenMetadata] ${payerType} configurado para ${tokenSymbol}: ${gasPayer}`);
      }

      return {
        id: smartContract.id, // Adicionar ID do token
        tokenSymbol: tokenSymbol,
        contractAddress: smartContract.address,
        gasPayer: gasPayer,
        metadata: metadata,
        abi: smartContract.abi,
        isNative: false
      };

    } catch (error) {
      console.error('❌ Erro ao obter metadata do token:', error.message);
      throw error;
    }
  }
}

module.exports = new TransferService();

const { ethers } = require('ethers');
const blockchainConfig = require('../config/blockchain');
const azorescanService = require('./azorescan.service');
const { loadLocalABI, DEFAULT_CONTRACT_TYPES } = require('../contracts');

// Import fetch para Node.js (disponível a partir do Node.js 18)
const fetch = globalThis.fetch || require('node-fetch');

class BlockchainService {
  constructor() {
    this.config = blockchainConfig;
  }

  /**
   * Testa a conexão com a blockchain
   * @param {string} network - Rede para testar
   * @returns {Promise<Object>} Resultado do teste
   */
  async testConnection(network) {
    return await this.config.testConnection(network);
  }

  /**
   * Obtém informações da rede atual
   * @returns {Object} Informações da rede
   */
  getNetworkInfo() {
    return this.config.getNetworkInfo();
  }

  /**
   * Obtém o saldo de um endereço
   * @param {string} address - Endereço para consultar
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Saldo formatado
   */
  async getBalance(address, network) {
    try {
      // Validar endereço
      if (!ethers.isAddress(address)) {
        throw new Error('Endereço inválido');
      }

      const balanceWei = await this.config.getBalance(address, network);
      const balanceEth = ethers.formatEther(balanceWei);

      return {
        address: address,
        balanceWei: balanceWei,
        balanceEth: balanceEth,
        network: network || this.config.defaultNetwork
      };
    } catch (error) {
      throw new Error(`Erro ao consultar saldo: ${error.message}`);
    }
  }

  /**
   * Obtém o saldo de um token ERC-20 para um endereço
   * @param {string} userAddress - Endereço do usuário
   * @param {string} tokenAddress - Endereço do contrato do token
   * @param {Array} tokenABI - ABI do token
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Saldo formatado do token
   */
  async getTokenBalance(userAddress, tokenAddress, tokenABI, network) {
    try {
      // Validar endereços
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Endereço do usuário inválido');
      }
      if (!ethers.isAddress(tokenAddress)) {
        throw new Error('Endereço do contrato inválido');
      }

      const provider = this.config.getProvider(network);
      const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
      
      // Obter informações do token
      const [balance, decimals, name, symbol] = await Promise.all([
        contract.balanceOf(userAddress),
        contract.decimals(),
        contract.name(),
        contract.symbol()
      ]);

      const balanceFormatted = ethers.formatUnits(balance, decimals);

      return {
        contractAddress: tokenAddress,
        tokenName: name,
        tokenSymbol: symbol,
        tokenDecimals: Number(decimals),
        balanceWei: balance.toString(),
        balanceEth: balanceFormatted,
        userAddress: userAddress,
        network: network || this.config.defaultNetwork
      };
    } catch (error) {
      throw new Error(`Erro ao consultar saldo do token: ${error.message}`);
    }
  }

  /**
   * Obtém informações de um bloco
   * @param {number|string} blockNumber - Número do bloco ou 'latest'
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Informações do bloco
   */
  async getBlock(blockNumber, network) {
    try {
      const block = await this.config.getBlock(blockNumber, network);
      return {
        ...block,
        network: network || this.config.defaultNetwork
      };
    } catch (error) {
      throw new Error(`Erro ao obter bloco: ${error.message}`);
    }
  }

  /**
   * Obtém informações de uma transação
   * @param {string} txHash - Hash da transação
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Informações da transação
   */
  async getTransaction(txHash, network) {
    try {
      const provider = this.config.getProvider(network);
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        throw new Error('Transação não encontrada');
      }

      const receipt = await provider.getTransactionReceipt(txHash);

      return {
        hash: tx.hash || '',
        from: tx.from || '',
        to: tx.to || '',
        value: tx.value ? tx.value.toString() : '0',
        valueEth: tx.value ? ethers.formatEther(tx.value) : '0',
        gasPrice: tx.gasPrice ? tx.gasPrice.toString() : '0',
        gasLimit: tx.gasLimit ? tx.gasLimit.toString() : '0',
        nonce: tx.nonce || 0,
        data: tx.data || '',
        blockNumber: tx.blockNumber || null,
        confirmations: tx.confirmations || 0,
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
        gasUsed: receipt && receipt.gasUsed ? receipt.gasUsed.toString() : null,
        effectiveGasPrice: receipt && receipt.effectiveGasPrice ? receipt.effectiveGasPrice.toString() : null,
        network: network || this.config.defaultNetwork
      };
    } catch (error) {
      throw new Error(`Erro ao obter transação: ${error.message}`);
    }
  }

  /**
   * Obtém o preço atual do gás
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Preço do gás
   */
  async getGasPrice(network) {
    try {
      const provider = this.config.getProvider(network);
      const feeData = await provider.getFeeData();
      
      return {
        gasPriceWei: feeData.gasPrice ? feeData.gasPrice.toString() : '0',
        gasPriceGwei: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0',
        maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas.toString() : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas.toString() : null,
        network: network || this.config.defaultNetwork
      };
    } catch (error) {
      throw new Error(`Erro ao obter preço do gás: ${error.message}`);
    }
  }

  /**
   * Obtém informações da rede
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Informações da rede
   */
  async getNetwork(network) {
    try {
      const provider = this.config.getProvider(network);
      const networkInfo = await provider.getNetwork();
      
      return {
        name: networkInfo.name,
        chainId: Number(networkInfo.chainId),
        network: network || this.config.defaultNetwork
      };
    } catch (error) {
      throw new Error(`Erro ao obter informações da rede: ${error.message}`);
    }
  }

  /**
   * Valida se um endereço é válido
   * @param {string} address - Endereço para validar
   * @returns {boolean} True se válido
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Converte um valor de ETH para Wei
   * @param {string|number} ethValue - Valor em ETH
   * @returns {string} Valor em Wei
   */
  ethToWei(ethValue) {
    return ethers.parseEther(ethValue.toString()).toString();
  }

  /**
   * Converte um valor de Wei para ETH
   * @param {string|number} weiValue - Valor em Wei
   * @returns {string} Valor em ETH
   */
  weiToEth(weiValue) {
    return ethers.formatEther(weiValue.toString());
  }

  /**
   * Obtém informações detalhadas de uma transação usando a API do AzoreScan
   * @param {string} txHash - Hash da transação
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Informações detalhadas da transação
   */
  async getTransactionDetails(txHash, network = this.config.defaultNetwork) {
    try {
      const baseUrl = network === 'mainnet' 
        ? process.env.MAINNET_EXPLORER_URL || 'https://azorescan.com'
        : process.env.TESTNET_EXPLORER_URL || 'https://floripa.azorescan.com';
      
      const response = await fetch(`${baseUrl}?module=transaction&action=gettxinfo&txhash=${txHash}`);
      const data = await response.json();

      if (data.status === '1' && data.result) {
        return {
          ...data.result,
          network: network
        };
      } else {
        throw new Error(data.message || 'Transação não encontrada');
      }
    } catch (error) {
      throw new Error(`Erro ao obter detalhes da transação: ${error.message}`);
    }
  }

  /**
   * Obtém informações detalhadas de um bloco usando a API do AzoreScan
   * @param {string} blockNumber - Número do bloco
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Informações detalhadas do bloco
   */
  async getBlockDetails(blockNumber, network = this.config.defaultNetwork) {
    try {
      const baseUrl = network === 'mainnet' 
        ? process.env.MAINNET_EXPLORER_URL || 'https://azorescan.com'
        : process.env.TESTNET_EXPLORER_URL || 'https://floripa.azorescan.com';
      
      const response = await fetch(`${baseUrl}?module=block&action=getblocknobytime&timestamp=${Date.now() / 1000}&closest=before`);
      const data = await response.json();

      // Para obter informações específicas do bloco, usamos o provider ethers
      const provider = this.config.getProvider(network);
      const block = await provider.getBlock(blockNumber);
      
      if (!block) {
        throw new Error('Bloco não encontrado');
      }

      return {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        transactions: block.transactions.length,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner,
        difficulty: block.difficulty?.toString(),
        totalDifficulty: block.totalDifficulty?.toString(),
        network: network
      };
    } catch (error) {
      throw new Error(`Erro ao obter detalhes do bloco: ${error.message}`);
    }
  }

  /**
   * Obtém o saldo de múltiplos endereços usando a API do AzoreScan
   * @param {string[]} addresses - Array de endereços
   * @param {string} network - Rede para consultar
   * @returns {Promise<Object>} Saldos dos endereços
   */
  async getMultipleBalances(addresses, network = this.config.defaultNetwork) {
    try {
      const baseUrl = network === 'mainnet' 
        ? process.env.MAINNET_EXPLORER_URL || 'https://azorescan.com'
        : process.env.TESTNET_EXPLORER_URL || 'https://floripa.azorescan.com';
      
      const addressList = addresses.join(',');
      const response = await fetch(`${baseUrl}?module=account&action=balancemulti&address=${addressList}`);
      const data = await response.json();

      if (data.status === '1' && data.result) {
        return {
          balances: data.result,
          network: network
        };
      } else {
        throw new Error(data.message || 'Erro ao consultar saldos');
      }
    } catch (error) {
      throw new Error(`Erro ao obter saldos múltiplos: ${error.message}`);
    }
  }

  /**
   * Executa uma função em um contrato inteligente
   * @param {string} contractAddress - Endereço do contrato
   * @param {Array} abi - ABI do contrato
   * @param {string} functionName - Nome da função a executar
   * @param {Array} params - Parâmetros da função
   * @param {string} network - Rede para executar
   * @param {Object} options - Opções adicionais (privateKey, gasPrice, etc)
   * @returns {Promise<Object>} Resultado da transação
   */
  async executeContractFunction(contractAddress, abi, functionName, params = [], network = this.config.defaultNetwork, options = {}) {
    try {
      // Validar endereço do contrato
      if (!ethers.isAddress(contractAddress)) {
        throw new Error('Endereço do contrato inválido');
      }

      // Obter provider e wallet
      const provider = this.config.getProvider(network);
      
      // Usar private key das variáveis de ambiente ou das opções
      const privateKey = options.privateKey || process.env.ADMIN_WALLET_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key não configurada');
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      
      // Criar instância do contrato
      const contract = new ethers.Contract(contractAddress, abi, wallet);
      
      // Verificar se a função existe
      if (!contract[functionName]) {
        throw new Error(`Função ${functionName} não encontrada no contrato`);
      }

      console.log(`🚀 Executando ${functionName} no contrato ${contractAddress}`);
      console.log(`📊 Parâmetros:`, params);

      // Configurar opções da transação
      const txOptions = {};
      if (options.gasPrice) {
        txOptions.gasPrice = ethers.parseUnits(options.gasPrice.toString(), 'gwei');
      }
      if (options.gasLimit) {
        txOptions.gasLimit = options.gasLimit;
      }

      // Executar função
      const tx = await contract[functionName](...params, txOptions);
      
      console.log(`📝 Transação enviada: ${tx.hash}`);
      
      // Aguardar confirmação
      const receipt = await tx.wait();
      
      console.log(`✅ Transação confirmada no bloco ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        from: tx.from,
        to: tx.to,
        contractAddress: contractAddress,
        functionName: functionName,
        network: network
      };
    } catch (error) {
      console.error(`❌ Erro ao executar função ${functionName}:`, error);
      throw new Error(`Erro ao executar função do contrato: ${error.message}`);
    }
  }

  /**
   * Obtém saldos completos de um usuário (AZE + todos os tokens ERC-20)
   * Usa o Azorescan Service para buscar dados da blockchain
   * @param {string} publicKey - Endereço público do usuário
   * @param {string} network - Rede para consultar (testnet/mainnet)
   * @returns {Promise<Object>} Saldos completos formatados para o cache
   */
  async getUserBalances(publicKey, network = this.config.defaultNetwork) {
    console.log(`🔄 Obtendo saldos completos para ${publicKey} na ${network}`);
    
    try {
      // Usar o serviço Azorescan para obter todos os saldos
      const azorescanResponse = await azorescanService.getCompleteBalances(publicKey, network);
      
      if (!azorescanResponse.success) {
        console.warn(`⚠️ Erro no Azorescan: ${azorescanResponse.error}`);
        
        // IMPORTANT: NÃO tentar cache aqui pois não temos userId
        // O fallback será feito no frontend ou no controlador que tem acesso ao userId
        
        // Retornar estrutura com erro indicando que não foi possível obter dados
        throw new Error(`Azorescan API error: ${azorescanResponse.error}`);
      }

      const azorescanData = azorescanResponse.data;
      
      // Formatar dados para o formato esperado pelo cache
      const result = {
        balances: azorescanData.balancesTable || {}, // Tabela de balances por símbolo
        tokenBalances: azorescanData.tokenBalances || [], // Array detalhado de tokens
        balancesTable: azorescanData.balancesTable || {}, // Mesma tabela (compatibilidade)
        network,
        totalTokens: azorescanData.totalTokens || 0,
        address: publicKey,
        azeBalance: azorescanData.azeBalance,
        syncStatus: 'success',
        syncError: null,
        timestamp: new Date().toISOString(),
        fromCache: false
      };

      console.log(`✅ Saldos obtidos: ${result.totalTokens} tokens`);
      console.log(`📊 Tokens disponíveis:`, Object.keys(result.balances));
      
      // NÃO salvar cache aqui pois não temos userId
      // O cache será gerenciado pelo balanceSync.controller que tem acesso ao userId
      
      return result;
    } catch (error) {
      console.error(`❌ Erro ao obter saldos do usuário ${publicKey}:`, error.message);
      
      // Repassar o erro para que o controlador possa lidar com fallback
      throw error;
    }
  }

  /**
   * Obtém o contrato de um token pela sigla
   * @param {string} tokenSymbol - Sigla do token (ex: cBRL, DREX)
   * @param {string} network - Rede (testnet/mainnet)
   * @returns {Promise<Object>} Contrato do token
   */
  async getTokenContract(tokenSymbol, network = this.config.defaultNetwork) {
    try {
      console.log(`🔍 [getTokenContract] Buscando contrato: ${tokenSymbol} na rede: ${network}`);
      
      // Buscar contrato na tabela smart_contracts
      const prismaConfig = require('../config/prisma');
      const prisma = prismaConfig.getPrisma();
      
      const smartContract = await prisma.smartContract.findFirst({
        where: {
          metadata: {
            path: ['symbol'],
            equals: tokenSymbol
          },
          network: network, // Filtrar pela rede especificada
          isActive: true
        }
      });
      
      if (!smartContract) {
        throw new Error(`Token ${tokenSymbol} não encontrado na base de dados`);
      }

      // Obter provider
      const provider = this.config.getProvider(network);
      
      // Obter gasPayer do metadata do contrato - primeiro tentar adminAddress, depois gasPayer
      const metadata = smartContract.metadata || {};
      let gasPayerAddress = metadata.adminAddress || metadata.gasPayer;
      
      // Fallback: usar ADMIN_WALLET_PUBLIC_KEY se nem adminAddress nem gasPayer estiverem configurados
      if (!gasPayerAddress) {
        gasPayerAddress = process.env.ADMIN_WALLET_PUBLIC_KEY;
        console.log(`🔧 [getTokenContract] adminAddress/gasPayer não configurado para ${tokenSymbol}, usando fallback: ${gasPayerAddress}`);
        
        if (!gasPayerAddress) {
          throw new Error(`adminAddress/gasPayer não configurado para o token ${tokenSymbol} e ADMIN_WALLET_PUBLIC_KEY não encontrado`);
        }
      } else {
        const payerType = metadata.adminAddress ? 'adminAddress' : 'gasPayer';
        console.log(`✅ [getTokenContract] ${payerType} configurado para ${tokenSymbol}: ${gasPayerAddress}`);
      }
      
      // Para fins de segurança, usar a private key do admin configurada no .env
      // Em produção, isso deveria vir de um sistema de gerenciamento de chaves mais seguro
      const gasPayerPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
      if (!gasPayerPrivateKey) {
        throw new Error('ADMIN_WALLET_PRIVATE_KEY não configurada no ambiente');
      }
      
      // Verificar se a private key corresponde ao endereço gasPayer
      const tempWallet = new ethers.Wallet(gasPayerPrivateKey);
      if (tempWallet.address.toLowerCase() !== gasPayerAddress.toLowerCase()) {
        throw new Error(`Private key não corresponde ao gasPayer configurado: ${gasPayerAddress}`);
      }
      
      // Criar wallet com a chave privada do gasPayer
      const wallet = new ethers.Wallet(gasPayerPrivateKey, provider);

      // Usar o ABI do próprio contrato se disponível, senão usar o padrão
      const tokenABI = smartContract.abi || loadLocalABI('token');
      
      // Criar instância do contrato
      const contract = new ethers.Contract(
        smartContract.address,
        tokenABI,
        wallet // Usar wallet do gasPayer para executar transações
      );

      return contract;

    } catch (error) {
      console.error(`Erro ao obter contrato do token ${tokenSymbol}:`, error);
      throw error;
    }
  }

  /**
   * FUNÇÃO REMOVIDA: getTokenBalance duplicada que dependia de SmartContract table
   * Use a função getTokenBalance(userAddress, tokenAddress, tokenABI, network) definida acima (linha ~66)
   */

  /**
   * Converte valor para Wei (considerando decimals do token)
   * @param {string} value - Valor em string
   * @param {number} decimals - Decimais do token (padrão 18)
   * @returns {BigInt} Valor em Wei
   */
  toWei(value, decimals = 18) {
    return ethers.parseUnits(value.toString(), decimals);
  }

  /**
   * Converte valor de Wei para formato legível
   * @param {BigInt} value - Valor em Wei
   * @param {number} decimals - Decimais do token (padrão 18)
   * @returns {string} Valor formatado
   */
  fromWei(value, decimals = 18) {
    return ethers.formatUnits(value, decimals);
  }

  /**
   * Envia tokens nativos (AZE/AZE-t) de uma carteira para outra
   * @param {string} fromPrivateKey - Chave privada do remetente
   * @param {string} toAddress - Endereço do destinatário
   * @param {string} amount - Valor a transferir (em formato decimal)
   * @param {string} network - Rede para executar a transação
   * @returns {Promise<Object>} Resultado da transação
   */
  async sendNativeToken(fromPrivateKey, toAddress, amount, network = this.config.defaultNetwork) {
    try {
      // Validar endereços
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Endereço de destino inválido');
      }

      // Obter provider
      const provider = this.config.getProvider(network);
      
      // Criar wallet do remetente
      const wallet = new ethers.Wallet(fromPrivateKey, provider);
      
      console.log(`🚀 Enviando ${amount} tokens nativos de ${wallet.address} para ${toAddress}`);

      // Converter amount para Wei
      const valueInWei = ethers.parseEther(amount.toString());
      
      // Obter informações para a transação
      const feeData = await provider.getFeeData();
      
      // Preparar transação
      const tx = {
        to: toAddress,
        value: valueInWei,
        gasPrice: feeData.gasPrice,
        gasLimit: 21000n // Gas limit padrão para transferências de token nativo
      };

      console.log(`📊 Detalhes da transação:`, {
        from: wallet.address,
        to: toAddress,
        value: valueInWei.toString(),
        gasPrice: feeData.gasPrice?.toString(),
        gasLimit: tx.gasLimit.toString()
      });

      // Enviar transação
      const transaction = await wallet.sendTransaction(tx);
      
      console.log(`📝 Transação enviada: ${transaction.hash}`);
      
      // Aguardar confirmação
      const receipt = await transaction.wait();
      
      console.log(`✅ Transação confirmada no bloco ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        from: wallet.address,
        to: toAddress,
        value: amount,
        valueWei: valueInWei.toString(),
        network: network
      };
    } catch (error) {
      console.error(`❌ Erro ao enviar tokens nativos:`, error);
      throw new Error(`Erro ao enviar tokens nativos: ${error.message}`);
    }
  }

  /**
   * Salva saldos no campo balance do usuário e detecta mudanças
   * @param {string} userId - ID do usuário
   * @param {Object} newBalances - Novos saldos obtidos da blockchain
   * @returns {Promise<Object>} Resultado com informações sobre mudanças detectadas
   */
  async saveAndCompareUserBalances(userId, newBalances) {
    // console.log(`💾 Salvando e comparando saldos para usuário ${userId}`);
    
    try {
      const prismaConfig = require('../config/prisma');
      const prisma = prismaConfig.getPrisma();
      
      // Buscar saldos anteriores do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      let previousBalances = null;
      let balanceChanges = [];
      let newTokens = [];

      if (user?.balances && typeof user.balances === 'object' && user.balances.balancesTable) {
        previousBalances = user.balances.balancesTable;
        
        // Detectar novos tokens
        const newBalanceTokens = Object.keys(newBalances.balancesTable || {});
        const previousTokens = Object.keys(previousBalances);
        
        newTokens = newBalanceTokens.filter(token => !previousTokens.includes(token));
        
        // Detectar mudanças de saldo
        newBalanceTokens.forEach(token => {
          const previousBalance = parseFloat(previousBalances[token]) || 0;
          const currentBalance = parseFloat(newBalances.balancesTable[token]) || 0;
          const difference = currentBalance - previousBalance;
          
          // Verificar mudanças significativas (evitar diferenças de precisão)
          if (Math.abs(difference) > 0.000001 && previousTokens.includes(token)) {
            balanceChanges.push({
              token,
              previousBalance,
              currentBalance,
              difference,
              type: difference > 0 ? 'increase' : 'decrease'
            });
          }
        });

        // console.log(`🔍 Detectadas ${newTokens.length} novos tokens e ${balanceChanges.length} mudanças de saldo`);
      } else {
        // console.log(`📊 Primeira sincronização de saldos para usuário ${userId}`);
      }

      // Buscar balances atuais para preservar stake e orders
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { balances: true }
      });

      const currentBalances = currentUser?.balances || {};

      console.log('💾 [BlockchainService] Preservando dados portfolio:', {
        hasStake: !!currentBalances.totalStake,
        hasOrders: !!currentBalances.ordersBreakdown,
        ordersCount: currentBalances.ordersBreakdown?.length || 0
      });

      // Preparar dados para salvar, preservando totalStake e ordersBreakdown
      const balanceDataToSave = {
        balancesTable: newBalances.balancesTable,
        network: newBalances.network,
        totalTokens: newBalances.totalTokens,
        address: newBalances.address,
        lastUpdate: new Date().toISOString(),
        syncStatus: newBalances.syncStatus,
        timestamp: newBalances.timestamp,
        // Preservar dados de stake e orders se existirem
        ...(currentBalances.totalStake && { totalStake: currentBalances.totalStake }),
        ...(currentBalances.totalStakeUpdatedAt && { totalStakeUpdatedAt: currentBalances.totalStakeUpdatedAt }),
        ...(currentBalances.stakeBreakdown && { stakeBreakdown: currentBalances.stakeBreakdown }),
        ...(currentBalances.totalInOrders !== undefined && { totalInOrders: currentBalances.totalInOrders }),
        ...(currentBalances.totalInOrdersBRL !== undefined && { totalInOrdersBRL: currentBalances.totalInOrdersBRL }),
        ...(currentBalances.ordersUpdatedAt && { ordersUpdatedAt: currentBalances.ordersUpdatedAt }),
        ...(currentBalances.ordersBreakdown && { ordersBreakdown: currentBalances.ordersBreakdown })
      };

      // Salvar novos saldos no campo balances do usuário
      await prisma.user.update({
        where: { id: userId },
        data: {
          balances: balanceDataToSave
        }
      });

      // console.log(`✅ Saldos salvos no banco para usuário ${userId}`);

      return {
        success: true,
        changes: {
          newTokens,
          balanceChanges,
          hasChanges: newTokens.length > 0 || balanceChanges.length > 0
        },
        previousBalances,
        currentBalances: newBalances.balancesTable
      };

    } catch (error) {
      console.error(`❌ Erro ao salvar e comparar saldos:`, error);
      throw error;
    }
  }

  /**
   * Obtém saldos salvos do usuário (fallback)
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Saldos salvos ou estrutura vazia
   */
  async getUserSavedBalances(userId) {
    console.log(`📚 Buscando saldos salvos para usuário ${userId}`);
    
    try {
      const prismaConfig = require('../config/prisma');
      const prisma = prismaConfig.getPrisma();
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user?.balances && typeof user.balances === 'object' && user.balances.balancesTable) {
        const savedBalance = user.balances;
        
        console.log(`✅ Saldos salvos encontrados: ${Object.keys(savedBalance.balancesTable).length} tokens`);
        
        return {
          success: true,
          data: {
            ...savedBalance,
            fromCache: true,
            isEmergency: false,
            address: user.publicKey
          }
        };
      } else {
        console.log(`⚠️ Nenhum saldo salvo encontrado para usuário ${userId}`);
        
        // Retornar estrutura vazia mas válida
        return {
          success: true,
          data: {
            balancesTable: {},
            network: process.env.DEFAULT_NETWORK || 'mainnet',
            totalTokens: 0,
            address: user?.publicKey || '',
            fromCache: true,
            isEmergency: true,
            syncStatus: 'no_data'
          }
        };
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar saldos salvos:`, error);
      throw error;
    }
  }
}

module.exports = new BlockchainService(); 
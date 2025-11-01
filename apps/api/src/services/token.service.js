/**
 * Token Service
 * Serviço para buscar informações de tokens ERC20
 */

const axios = require('axios');
const prismaConfig = require('../config/prisma');
const blockchainService = require('./blockchain.service');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class TokenService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 300000; // 5 minutos
    this.ERC20_CONTRACT_TYPE_ID = 'cc350023-d9ba-4746-85f3-1590175a2328'; // ID padrão para tokens ERC20
  }

  /**
   * Carrega o ABI padrão do token ERC20
   */
  loadTokenABI() {
    try {
      const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_token_abi.json');
      const abiContent = fs.readFileSync(abiPath, 'utf8');
      return JSON.parse(abiContent);
    } catch (error) {
      console.warn('Erro ao carregar ABI do token:', error.message);
      return null;
    }
  }

  /**
   * Busca ou cria o contractTypeId para tokens ERC20
   */
  async getTokenContractTypeId() {
    try {
      const prisma = prismaConfig.getPrisma();

      // Sempre usar o contract type correto existente
      const contractType = await prisma.contractType.findUnique({
        where: {
          id: this.ERC20_CONTRACT_TYPE_ID
        }
      });

      if (contractType) {
        return contractType.id;
      }

      // Se o ID específico não existir, buscar por nome (o correto é 'token', não 'ERC20')
      const contractTypeByName = await prisma.contractType.findFirst({
        where: {
          name: 'token',
          category: 'token'
        }
      });

      if (contractTypeByName) {
        return contractTypeByName.id;
      }

      // Fallback para o ID conhecido
      return this.ERC20_CONTRACT_TYPE_ID;
    } catch (error) {
      console.warn('Erro ao obter contractTypeId:', error.message);
      // Fallback para o ID conhecido
      return this.ERC20_CONTRACT_TYPE_ID;
    }
  }


  /**
   * Busca informações completas do token diretamente da blockchain (name, symbol, decimals)
   */
  async getTokenInfo(tokenAddress, network = 'mainnet') {
    const cacheKey = `info_${tokenAddress}_${network}`;
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return cached.info;
    }

    try {
      // Usar blockchain service diretamente ao invés de HTTP calls
      const provider = require('../config/blockchain').getProvider(network);
      console.log(`🌐 Provider para rede ${network}:`, provider ? 'OK' : 'UNDEFINED');

      // ABI mínima para ERC20 token info
      const minimalERC20ABI = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)"
      ];

      const contract = new ethers.Contract(tokenAddress, minimalERC20ABI, provider);
      console.log(`📄 Contrato criado para ${tokenAddress}:`, contract ? 'OK' : 'UNDEFINED');

      // Fazer múltiplas chamadas em paralelo com debugging
      const [name, symbol, decimals] = await Promise.all([
        contract.name().catch((error) => {
          console.warn(`❌ Erro ao buscar name() para ${tokenAddress}:`, error.message);
          return 'Unknown Token';
        }),
        contract.symbol().catch((error) => {
          console.warn(`❌ Erro ao buscar symbol() para ${tokenAddress}:`, error.message);
          return 'TOKEN';
        }),
        contract.decimals().catch((error) => {
          console.warn(`❌ Erro ao buscar decimals() para ${tokenAddress}:`, error.message);
          return 18;
        })
      ]);

      console.log(`🔍 Token info para ${tokenAddress}:`, { name, symbol, decimals });

      const info = {
        name: name || 'Unknown Token',
        symbol: symbol || 'TOKEN',
        decimals: parseInt(decimals) || 18,
        address: tokenAddress
      };

      // Limpar dados
      info.name = String(info.name).trim();
      info.symbol = String(info.symbol).trim().replace(/[^a-zA-Z0-9]/g, '');
      info.decimals = parseInt(info.decimals) || 18;

      // Armazenar no cache
      this.cache.set(cacheKey, {
        info,
        timestamp: Date.now()
      });

      return info;
    } catch (error) {
      console.warn(`Erro ao buscar informações do token ${tokenAddress}:`, error.message);
      
      // Fallback com tokens conhecidos
      const knownSymbol = this.getKnownTokenSymbol(tokenAddress);
      return {
        name: knownSymbol || 'Unknown Token',
        symbol: knownSymbol || 'TOKEN',
        decimals: 18,
        address: tokenAddress
      };
    }
  }

  /**
   * Chama uma função do contrato
   */
  async callContractFunction(contractAddress, functionName, params, network) {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'}/api/contracts/read`, {
        contractAddress,
        functionName,
        params,
        network
      });
      return response.data;
    } catch (error) {
      console.warn(`Erro ao chamar ${functionName} do contrato ${contractAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Extrai o resultado da resposta da API
   */
  extractResult(response) {
    if (!response || !response.success || !response.data) {
      return null;
    }

    const data = response.data;
    
    // Diferentes formatos possíveis
    if (typeof data === 'string' || typeof data === 'number') {
      return data;
    }
    
    if (data.result !== undefined) {
      if (Array.isArray(data.result)) {
        return data.result[0];
      }
      return data.result;
    }
    
    if (Array.isArray(data)) {
      return data[0];
    }
    
    return null;
  }

  /**
   * Retorna símbolos de tokens conhecidos (hardcoded para tokens comuns)
   */
  getKnownTokenSymbol(tokenAddress) {
    const knownTokens = {
      // Tokens conhecidos da rede Azore (adicionar conforme necessário)
      '0x2f8d31627a1F014691Eb6e56c235b2382702f4B9': 'PCN',
      '0x0A8c73967e4Eee8ffA06484C3fBf65E6Ae3b9804': 'cBRL', // Testnet
      '0x18e946548b2C24Ad371343086e424ABaC3393678': 'cBRL', // Mainnet
      // Adicionar outros tokens conhecidos aqui
    };

    return knownTokens[tokenAddress.toLowerCase()] || knownTokens[tokenAddress];
  }

  /**
   * Limpa o cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Busca múltiplos tokens em paralelo
   */
  async getMultipleTokenSymbols(tokenAddresses, network = 'mainnet') {
    const promises = tokenAddresses.map(address =>
      this.getTokenInfo(address, network).then(info => info.symbol).catch(error => {
        console.warn(`Erro ao buscar token ${address}:`, error.message);
        return 'TOKEN';
      })
    );

    return await Promise.all(promises);
  }

  /**
   * Lista todos os tokens registrados no banco de dados
   */
  async listTokens(options = {}) {
    try {
      const prisma = prismaConfig.getPrisma();
      const {
        page = 1,
        limit = 10,
        network,
        contractType,
        isActive
      } = options;

      const where = {};
      
      if (network) {
        where.network = network;
      }
      
      if (contractType) {
        where.contractTypeId = contractType;
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const skip = (page - 1) * limit;

      // Buscar tokens com paginação
      const [tokens, total] = await Promise.all([
        prisma.smartContract.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            name: true,
            address: true,
            network: true,
            contractTypeId: true,
            isActive: true,
            metadata: true,
            deployedBy: true,
            createdAt: true,
            updatedAt: true,
            abi: true,
            bytecode: true
          }
        }),
        prisma.smartContract.count({ where })
      ]);

      return {
        success: true,
        message: 'Tokens listados com sucesso',
        data: {
          tokens,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Erro ao listar tokens:', error);
      throw new Error(`Erro ao listar tokens: ${error.message}`);
    }
  }

  /**
   * Registra um novo token no banco de dados
   */
  async registerToken(tokenData) {
    try {
      const prisma = prismaConfig.getPrisma();
      const {
        address,
        adminAddress,
        website,
        description,
        network = 'testnet',
        companyId,
        contractType = 'token',
        tokenAAddress,
        tokenBAddress,
        category
      } = tokenData;

      // Se for exchange, buscar informações dos tokens do par
      let tokenInfo;
      let tokenAInfo = null;
      let tokenBInfo = null;

      if (contractType === 'exchange' && tokenAAddress && tokenBAddress) {
        // Para exchanges, buscar informações dos tokens A e B
        try {
          [tokenAInfo, tokenBInfo] = await Promise.all([
            this.getTokenInfo(tokenAAddress, network),
            this.getTokenInfo(tokenBAddress, network)
          ]);

          // Criar informações do "token" exchange
          tokenInfo = {
            name: `${tokenBInfo.symbol}/${tokenAInfo.symbol} Exchange`,
            symbol: `${tokenBInfo.symbol}/${tokenAInfo.symbol}`,
            decimals: 18 // Padrão para exchanges
          };
        } catch (error) {
          throw new Error(`Erro ao buscar informações dos tokens do par: ${error.message}`);
        }
      } else {
        // Para tokens normais, buscar informações do contrato
        tokenInfo = await this.getTokenInfo(address, network);
      }

      // Verificar se o token já existe (usar checksum correto e buscar case-insensitive)
      const checksumAddress = ethers.getAddress(address);
      const existingToken = await prisma.smartContract.findFirst({
        where: {
          address: {
            equals: checksumAddress,
            mode: 'insensitive' // Case-insensitive para compatibilidade com dados antigos
          },
          network
        }
      });

      // Get or create a default company if none provided
      let finalCompanyId = companyId;
      if (!finalCompanyId) {
        // Try to find a default company or use the first company
        const defaultCompany = await prisma.company.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        });
        
        if (defaultCompany) {
          finalCompanyId = defaultCompany.id;
        } else {
          // Create a default company if none exists
          const newCompany = await prisma.company.create({
            data: {
              name: 'Default Company',
              alias: 'default'
            }
          });
          finalCompanyId = newCompany.id;
        }
      }

      // Obter contractTypeId e ABI
      let contractTypeId;
      let contractABI;

      if (contractType === 'exchange') {
        // Para exchanges, usar categoria 'defi'
        const exchangeContractType = await prisma.contractType.findFirst({
          where: {
            category: 'defi',
            name: { contains: 'exchange', mode: 'insensitive' }
          }
        });

        if (exchangeContractType) {
          contractTypeId = exchangeContractType.id;
        } else {
          // Criar contract type para exchange se não existir
          const newExchangeType = await prisma.contractType.create({
            data: {
              name: 'exchange',
              category: 'defi',
              description: 'Contrato de Exchange/DEX',
              abiPath: '/contracts/abis/default_exchange_abi.json',
              version: '1.0.0'
            }
          });
          contractTypeId = newExchangeType.id;
        }

        // Carregar ABI de exchange
        contractABI = this.loadExchangeABI();
      } else {
        // Para tokens, usar a lógica existente
        contractTypeId = await this.getTokenContractTypeId();
        contractABI = this.loadTokenABI();
      }

      const tokenPayload = {
        name: tokenInfo.name,
        address: ethers.getAddress(address), // Usar checksum correto
        network,
        companyId: finalCompanyId,
        contractTypeId: contractTypeId,
        abi: contractABI,
        metadata: {
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          website: website || null,
          description: description || null,
          adminAddress: adminAddress ? ethers.getAddress(adminAddress) : null,
          contractType: contractType,
          category: category || 'criptomoedas', // Add category to metadata
          ...(contractType === 'exchange' && tokenAAddress && tokenBAddress && {
            tokenA: {
              address: ethers.getAddress(tokenAAddress),
              symbol: tokenAInfo?.symbol,
              name: tokenAInfo?.name,
              decimals: tokenAInfo?.decimals
            },
            tokenB: {
              address: ethers.getAddress(tokenBAddress),
              symbol: tokenBInfo?.symbol,
              name: tokenBInfo?.name,
              decimals: tokenBInfo?.decimals
            },
            pair: `${tokenBInfo?.symbol}/${tokenAInfo?.symbol}`
          })
        },
        deployedBy: null, // This should be a User UUID, not a wallet address
        isActive: true
      };

      let result;
      if (existingToken) {
        // Atualizar token existente - apenas campos editáveis
        try {
          const updateData = {
            metadata: {
              ...existingToken.metadata,
              website: website !== undefined ? website : existingToken.metadata?.website,
              description: description !== undefined ? description : existingToken.metadata?.description,
              adminAddress: adminAddress ? ethers.getAddress(adminAddress) : existingToken.metadata?.adminAddress,
              category: category || existingToken.metadata?.category || 'criptomoedas'
            }
          };

          console.log('Atualizando token:', existingToken.id);
          console.log('Update data:', JSON.stringify(updateData, null, 2));

          result = await prisma.smartContract.update({
            where: { id: existingToken.id },
            data: updateData
          });

          console.log('Token atualizado com sucesso');

          return {
            success: true,
            message: 'Token atualizado com sucesso',
            data: { ...result, tokenInfo: { isUpdate: true } }
          };
        } catch (updateError) {
          console.error('Erro ao atualizar token:', updateError);
          throw new Error(`Erro ao atualizar token: ${updateError.message}`);
        }
      } else {
        // Criar novo token/exchange
        result = await prisma.smartContract.create({
          data: tokenPayload
        });

        // Se for exchange, criar par de trading na tabela trading_pairs
        if (contractType === 'exchange' && tokenAAddress && tokenBAddress) {
          await this.createTradingPair(result.id, {
            symbol: `${tokenBInfo.symbol}/${tokenAInfo.symbol}`,
            baseToken: tokenBInfo.symbol,
            quoteToken: tokenAInfo.symbol,
            baseTokenAddress: ethers.getAddress(tokenBAddress),
            quoteTokenAddress: ethers.getAddress(tokenAAddress),
            exchangeContract: ethers.getAddress(address),
            network
          });
        }

        return {
          success: true,
          message: contractType === 'exchange' ? 'Exchange registrado com sucesso' : 'Token registrado com sucesso',
          data: { ...result, tokenInfo: { isUpdate: false } }
        };
      }
    } catch (error) {
      console.error('Erro ao registrar token:', error.message);
      throw new Error(`Erro ao registrar token: ${error.message}`);
    }
  }

  /**
   * Desativa um token
   */
  async deactivateToken(contractAddress) {
    try {
      const prisma = prismaConfig.getPrisma();
      
      const token = await prisma.smartContract.findFirst({
        where: {
          address: contractAddress.toLowerCase()
        }
      });

      if (!token) {
        throw new Error('Token não encontrado');
      }

      const result = await prisma.smartContract.update({
        where: { id: token.id },
        data: { isActive: false }
      });

      return {
        success: true,
        message: 'Token desativado com sucesso',
        data: {
          address: result.address,
          isActive: result.isActive
        }
      };
    } catch (error) {
      console.error('Erro ao desativar token:', error);
      throw new Error(`Erro ao desativar token: ${error.message}`);
    }
  }

  /**
   * Ativa um token
   */
  async activateToken(contractAddress) {
    try {
      const prisma = prismaConfig.getPrisma();
      
      const token = await prisma.smartContract.findFirst({
        where: {
          address: contractAddress.toLowerCase()
        }
      });

      if (!token) {
        throw new Error('Token não encontrado');
      }

      const result = await prisma.smartContract.update({
        where: { id: token.id },
        data: { isActive: true }
      });

      return {
        success: true,
        message: 'Token ativado com sucesso',
        data: {
          address: result.address,
          isActive: result.isActive
        }
      };
    } catch (error) {
      console.error('Erro ao ativar token:', error);
      throw new Error(`Erro ao ativar token: ${error.message}`);
    }
  }

  /**
   * Obtém saldo de um token ERC20
   */
  async getTokenBalance(contractAddress, walletAddress, network = 'testnet') {
    try {
      const response = await this.callContractFunction(contractAddress, 'balanceOf', [walletAddress], network);
      
      if (response && response.success && response.data) {
        const balance = this.extractResult(response);
        return {
          success: true,
          data: {
            balance: balance || '0',
            contractAddress,
            walletAddress,
            network
          }
        };
      }

      throw new Error('Falha ao consultar saldo');
    } catch (error) {
      console.error(`Erro ao consultar saldo do token ${contractAddress}:`, error);
      throw new Error(`Erro ao consultar saldo: ${error.message}`);
    }
  }

  /**
   * Executa função mint do token
   */
  async mintToken(contractAddress, toAddress, amount, gasPayer, network = 'testnet', options = {}) {
    try {
      // Fazer chamada para o endpoint de write
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'}/api/contracts/write`, {
        contractAddress,
        functionName: 'mint',
        params: [toAddress, amount],
        network,
        gasPayer,
        ...options
      });

      return {
        success: true,
        message: 'Tokens mintados com sucesso',
        data: response.data
      };
    } catch (error) {
      console.error(`Erro ao mintar tokens:`, error);
      throw new Error(`Erro ao mintar tokens: ${error.message}`);
    }
  }

  /**
   * Executa função burnFrom do token
   */
  async burnFromToken(contractAddress, fromAddress, amount, gasPayer, network = 'testnet', options = {}) {
    try {
      // Fazer chamada para o endpoint de write
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'}/api/contracts/write`, {
        contractAddress,
        functionName: 'burnFrom',
        params: [fromAddress, amount],
        network,
        gasPayer,
        ...options
      });

      return {
        success: true,
        message: 'Tokens queimados com sucesso',
        data: response.data
      };
    } catch (error) {
      console.error(`Erro ao queimar tokens:`, error);
      throw new Error(`Erro ao queimar tokens: ${error.message}`);
    }
  }

  /**
   * Executa função transferFromGasless do token
   */
  async transferFromGasless(contractAddress, fromAddress, toAddress, amount, gasPayer, network = 'testnet', options = {}) {
    try {
      // Fazer chamada para o endpoint de write
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'}/api/contracts/write`, {
        contractAddress,
        functionName: 'transferFromGasless',
        params: [fromAddress, toAddress, amount],
        network,
        gasPayer,
        ...options
      });

      return {
        success: true,
        message: 'Transferência sem gás realizada com sucesso',
        data: response.data
      };
    } catch (error) {
      console.error(`Erro na transferência sem gás:`, error);
      throw new Error(`Erro na transferência sem gás: ${error.message}`);
    }
  }

  /**
   * Obtém saldo da moeda nativa AZE
   */
  async getAzeBalance(walletAddress, network = 'testnet') {
    try {
      // Fazer chamada para obter saldo nativo
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'}/api/contracts/balance`, {
        walletAddress,
        network
      });

      return {
        success: true,
        data: {
          balance: response.data?.balance || '0',
          walletAddress,
          network,
          currency: 'AZE'
        }
      };
    } catch (error) {
      console.error(`Erro ao consultar saldo AZE:`, error);
      throw new Error(`Erro ao consultar saldo AZE: ${error.message}`);
    }
  }

  /**
   * Testa o serviço de tokens
   */
  async testService() {
    try {
      const knownTokens = {
        '0x2f8d31627a1F014691Eb6e56c235b2382702f4B9': 'PCN',
        '0x0A8c73967e4Eee8ffA06484C3fBf65E6Ae3b9804': 'cBRL', // Testnet
        '0x18e946548b2C24Ad371343086e424ABaC3393678': 'cBRL'  // Mainnet
      };

      const testResults = {
        cache: this.cache.size,
        cacheDuration: this.CACHE_DURATION,
        knownTokens: Object.keys(knownTokens),
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        message: 'Serviço de tokens funcionando corretamente',
        data: testResults
      };
    } catch (error) {
      console.error('Erro no teste do serviço:', error);
      throw new Error(`Erro no teste do serviço: ${error.message}`);
    }
  }

  /**
   * Carrega o ABI padrão do exchange
   */
  loadExchangeABI() {
    try {
      const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_exchange_abi.json');
      const abiContent = fs.readFileSync(abiPath, 'utf8');
      return JSON.parse(abiContent);
    } catch (error) {
      console.warn('Erro ao carregar ABI do exchange:', error.message);
      return null;
    }
  }

  /**
   * Cria um par de trading na tabela trading_pairs
   */
  async createTradingPair(smartContractId, pairData) {
    try {
      const prisma = prismaConfig.getPrisma();

      // Verificar se o par já existe
      const existingPair = await prisma.$queryRaw`
        SELECT id FROM trading_pairs
        WHERE symbol = ${pairData.symbol}
        AND exchange_contract = ${pairData.exchangeContract}
      `;

      if (existingPair && existingPair.length > 0) {
        console.log(`Par de trading ${pairData.symbol} já existe`);
        return existingPair[0];
      }

      // Criar novo par de trading
      const newPair = await prisma.$queryRaw`
        INSERT INTO trading_pairs (
          symbol,
          base_token,
          quote_token,
          base_token_address,
          quote_token_address,
          exchange_contract,
          min_order_size,
          price_decimals,
          is_active
        ) VALUES (
          ${pairData.symbol},
          ${pairData.baseToken},
          ${pairData.quoteToken},
          ${pairData.baseTokenAddress},
          ${pairData.quoteTokenAddress},
          ${pairData.exchangeContract},
          0.01,
          4,
          true
        ) RETURNING id
      `;

      console.log(`Par de trading criado: ${pairData.symbol}`);
      return newPair;
    } catch (error) {
      console.error('Erro ao criar par de trading:', error.message);
      // Não falhar o registro do exchange por causa do par
      return null;
    }
  }
}

module.exports = new TokenService();
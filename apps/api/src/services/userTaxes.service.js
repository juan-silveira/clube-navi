const prismaConfig = require('../config/prisma');

class UserTaxesService {
  constructor() {
    this.prisma = null;
  }

  async init() {
    this.prisma = prismaConfig.getPrisma();
  }

  /**
   * Obter taxas do usuário ou criar taxas padrão
   */
  async getUserTaxes(userId) {
    try {
      if (!this.prisma) await this.init();

      // Buscar taxas existentes (usando userId como campo do Prisma)
      let userTaxes = await this.prisma.userTaxes.findUnique({
        where: { userId: userId }
      });

      // Se não existir, criar com valores padrão
      if (!userTaxes) {
        userTaxes = await this.createDefaultTaxes(userId);
      }

      // Verificar se as taxas ainda são válidas
      if (userTaxes.validUntil && new Date(userTaxes.validUntil) < new Date()) {
        // Taxas expiraram, retornar aos valores padrão
        userTaxes = await this.resetToDefaultTaxes(userId);
      }

      return userTaxes;

    } catch (error) {
      console.error('❌ Erro ao obter taxas do usuário:', error);
      throw error;
    }
  }

  /**
   * Criar taxas padrão para um usuário
   */
  async createDefaultTaxes(userId) {
    try {
      if (!this.prisma) await this.init();

      const defaultTaxes = await this.prisma.userTaxes.create({
        data: {
          userId: userId,
          depositFee: 3.0,           // R$ 3,00 taxa fixa
          withdrawFee: 1.0,          // R$ 1,00 taxa fixa
          exchangeFeePercent: 0.3,  // 0.3%
          transferFeePercent: 0.1,  // 0.1%
          tokenTransferFees: {      // Taxas de transferência por token
            cBRL: 0.5,
            DREX: 1.0
          },
          gasSubsidyEnabled: false,
          gasSubsidyPercent: 0,
          isVip: false,
          vipLevel: 0
        }
      });

      console.log(`✅ Taxas padrão criadas para usuário ${userId}`);
      return defaultTaxes;

    } catch (error) {
      console.error('❌ Erro ao criar taxas padrão:', error);
      throw error;
    }
  }

  /**
   * Resetar taxas para valores padrão
   */
  async resetToDefaultTaxes(userId) {
    try {
      if (!this.prisma) await this.init();

      const updatedTaxes = await this.prisma.userTaxes.update({
        where: { userId: userId },
        data: {
          depositFee: 3.0,
          withdrawFee: 1.0,
          exchangeFeePercent: 0.3,
          transferFeePercent: 0.1,
          gasSubsidyEnabled: false,
          gasSubsidyPercent: 0,
          isVip: false,
          vipLevel: 0,
          validUntil: null
        }
      });

      console.log(`🔄 Taxas resetadas para valores padrão para usuário ${userId}`);
      return updatedTaxes;

    } catch (error) {
      console.error('❌ Erro ao resetar taxas:', error);
      throw error;
    }
  }

  /**
   * Calcular taxa de depósito
   */
  async calculateDepositFee(userId, amount) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      
      // Usar taxa fixa para depósito (campo depositFee)
      const fee = userTaxes.depositFee || 3.0; // Taxa fixa padrão R$ 3,00

      return {
        fee: parseFloat(fee.toFixed(2)),
        feeType: 'fixed', // Indicar que é taxa fixa
        // NOVA LÓGICA: valor desejado (amount) + taxa = total a pagar
        desiredAmount: amount, // O que o usuário quer receber em cBRL
        totalAmount: parseFloat((amount + fee).toFixed(2)), // Total que o usuário vai pagar
        netAmount: amount, // Valor final que vai receber em cBRL (igual ao desejado)
        grossAmount: parseFloat((amount + fee).toFixed(2)), // Total a pagar
        isVip: userTaxes.isVip,
        vipLevel: userTaxes.vipLevel
      };

    } catch (error) {
      console.error('❌ Erro ao calcular taxa de depósito:', error);
      throw error;
    }
  }

  /**
   * Calcular taxa de saque usando taxa fixa do banco
   */
  async calculateWithdrawFee(userId, amount) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      
      console.log('🔍 [UserTaxesService] userTaxes completo:', userTaxes);
      console.log('🔍 [UserTaxesService] withdrawFee do banco:', userTaxes.withdrawFee);
      console.log('🔍 [UserTaxesService] tipo:', typeof userTaxes.withdrawFee);
      
      // Usar taxa fixa do banco de dados (campo withdrawFee)
      const fee = userTaxes.withdrawFee || 1.0; // Fallback para R$ 1,00
      
      console.log('🔍 [UserTaxesService] taxa calculada:', fee);

      return {
        fee: parseFloat(fee.toFixed(2)),
        feeType: 'fixed', // Taxa fixa, não percentual
        netAmount: parseFloat((amount - fee).toFixed(2)),
        grossAmount: amount,
        isVip: userTaxes.isVip,
        vipLevel: userTaxes.vipLevel
      };

    } catch (error) {
      console.error('❌ Erro ao calcular taxa de saque:', error);
      throw error;
    }
  }

  /**
   * Calcular taxa de exchange
   */
  async calculateExchangeFee(userId, amount) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      
      // Calcular taxa percentual
      const fee = (amount * userTaxes.exchangeFeePercent) / 100;

      return {
        fee: parseFloat(fee.toFixed(2)),
        feePercent: userTaxes.exchangeFeePercent,
        netAmount: parseFloat((amount - fee).toFixed(2)),
        grossAmount: amount,
        isVip: userTaxes.isVip,
        vipLevel: userTaxes.vipLevel
      };

    } catch (error) {
      console.error('❌ Erro ao calcular taxa de exchange:', error);
      throw error;
    }
  }

  /**
   * Calcular taxa de transferência
   */
  async calculateTransferFee(userId, amount) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      
      // Calcular taxa percentual
      const fee = (amount * userTaxes.transferFeePercent) / 100;

      return {
        fee: parseFloat(fee.toFixed(2)),
        feePercent: userTaxes.transferFeePercent,
        netAmount: parseFloat((amount - fee).toFixed(2)),
        grossAmount: amount,
        isVip: userTaxes.isVip,
        vipLevel: userTaxes.vipLevel
      };

    } catch (error) {
      console.error('❌ Erro ao calcular taxa de transferência:', error);
      throw error;
    }
  }

  /**
   * Calcular taxa de transferência por token específico - NOVA VERSÃO COM TAXA FIXA
   */
  async calculateTokenTransferFee(userId, amount, tokenId, tokenSymbol) {
    try {
      const userTaxes = await this.getUserTaxes(userId);

      // Sistema de taxas fixas por token
      const tokenFees = userTaxes.tokenTransferFees || {};

      console.log('🔍 [calculateTokenTransferFee] Buscando taxa:', {
        userId,
        tokenId,
        tokenSymbol,
        tokenFeesStructure: typeof tokenFees
      });

      // Detectar rede atual
      const currentNetwork = process.env.DEFAULT_NETWORK || 'testnet';
      let fixedFee = 0; // Taxa padrão ZERO

      // NOVO FORMATO: { testnet: [...], mainnet: [...] }
      if (tokenFees.testnet || tokenFees.mainnet) {
        const networkTokens = tokenFees[currentNetwork] || [];

        console.log('🔍 [calculateTokenTransferFee] Estrutura nova detectada:', {
          currentNetwork,
          tokensCount: networkTokens.length
        });

        // Buscar o token pelo ID na rede atual
        const tokenData = networkTokens.find(t => t.id === tokenId);

        if (tokenData) {
          fixedFee = parseFloat(tokenData.fee) || 0;
          console.log('✅ [calculateTokenTransferFee] Taxa encontrada:', {
            tokenId,
            tokenSymbol,
            fee: fixedFee
          });
        } else {
          console.log('⚠️ [calculateTokenTransferFee] Token não encontrado na rede:', {
            tokenId,
            currentNetwork,
            availableTokens: networkTokens.map(t => ({ id: t.id, symbol: t.symbol }))
          });
        }
      }
      // FORMATO ANTIGO: { "tokenId_symbol": { fee: X }, ... }
      else {
        const tokenKey = `${tokenId}_${tokenSymbol}`;

        console.log('🔍 [calculateTokenTransferFee] Estrutura antiga detectada:', {
          tokenKey
        });

        if (tokenFees[tokenKey] && typeof tokenFees[tokenKey] === 'object') {
          fixedFee = tokenFees[tokenKey].fee || 0;
        } else if (tokenFees[tokenSymbol] && typeof tokenFees[tokenSymbol] === 'object') {
          fixedFee = tokenFees[tokenSymbol].fee || 0;
        }
      }

      console.log('💰 [calculateTokenTransferFee] Taxa final calculada:', {
        tokenId,
        tokenSymbol,
        fee: fixedFee,
        network: currentNetwork
      });

      return {
        fee: parseFloat(fixedFee.toFixed(6)),
        feeType: 'fixed', // Taxa fixa, não percentual
        netAmount: parseFloat((amount - fixedFee).toFixed(6)),
        grossAmount: amount,
        tokenId: tokenId,
        tokenSymbol: tokenSymbol,
        isVip: userTaxes.isVip,
        vipLevel: userTaxes.vipLevel
      };

    } catch (error) {
      console.error('❌ Erro ao calcular taxa de transferência do token:', error);
      throw error;
    }
  }

  /**
   * Obter tokens disponíveis no sistema
   */
  async getAvailableTokens() {
    try {
      if (!this.prisma) await this.init();

      // Buscar tokens da tabela smart_contracts
      const contracts = await this.prisma.smartContract.findMany({
        where: {
          isActive: true,
          contractType: {
            OR: [
              { name: { contains: 'Token', mode: 'insensitive' } },
              { category: { contains: 'token', mode: 'insensitive' } }
            ]
          }
        },
        include: {
          contractType: true
        },
        select: {
          id: true,
          name: true,
          symbol: true,
          address: true,
          network: true,
          metadata: true,
          contractType: {
            select: {
              name: true,
              category: true
            }
          }
        }
      });

      const tokenMap = {};
      
      for (const contract of contracts) {
        // Obter símbolo do contrato
        let symbol = contract.symbol;
        
        // Se não tiver símbolo direto, tentar obter do metadata
        if (!symbol && contract.metadata) {
          if (typeof contract.metadata === 'object') {
            symbol = contract.metadata.symbol || contract.metadata.ticker;
          }
        }

        if (symbol) {
          tokenMap[symbol] = {
            id: contract.id,
            symbol: symbol,
            fee: this.getDefaultFeeBySymbol(symbol),
            address: contract.address,
            name: contract.name,
            network: contract.network
          };
        }
      }

      // Adicionar AZE baseado na network
      const network = process.env.DEFAULT_NETWORK || 'testnet';
      if (network === 'mainnet') {
        if (!tokenMap['AZE']) {
          tokenMap['AZE'] = { 
            id: 'aze-mainnet', 
            symbol: 'AZE', 
            fee: 1.0, 
            network: 'mainnet',
            name: 'Azore Token',
            address: process.env.AZE_TOKEN_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000'
          };
        }
      } else {
        if (!tokenMap['AZE-t']) {
          tokenMap['AZE-t'] = { 
            id: 'aze-testnet', 
            symbol: 'AZE-t', 
            fee: 1.0, 
            network: 'testnet',
            name: 'Azore Token (Testnet)',
            address: process.env.AZE_TOKEN_ADDRESS_TESTNET || '0x0000000000000000000000000000000000000000'
          };
        }
      }

      return tokenMap;
      
    } catch (error) {
      console.error('❌ Erro ao buscar tokens disponíveis:', error);
      
      // Fallback para tokens conhecidos baseado na network
      const network = process.env.DEFAULT_NETWORK || 'testnet';
      const fallbackTokens = {
        'PCN': { 
          id: '498c034d-90f1-44cf-9604-68601afe2352', 
          symbol: 'PCN', 
          fee: 1.0,
          address: '0x0b5F5510160E27E6BFDe03914a18d555B590DAF5',
          name: 'Pratique Coin'
        },
        'cBRL': { 
          id: 'c10e12cf-ceaa-416b-ace5-f9f22169efda', 
          symbol: 'cBRL', 
          fee: 0.5,
          // Usar contrato correto baseado na rede
          address: (process.env.DEFAULT_NETWORK || 'mainnet') === 'testnet' 
            ? '0x0A8c73967e4Eee8ffA06484C3fBf65E6Ae3b9804'  // Testnet
            : '0x18e946548b2C24Ad371343086e424ABaC3393678', // Mainnet
          name: 'Clube Digital Real Brasil'
        },
        'CNT': {
          id: 'cnt-fallback',
          symbol: 'CNT',
          fee: 1.0,
          address: '0x0000000000000000000000000000000000000000',
          name: 'CNT Token'
        }
      };

      if (network === 'mainnet') {
        fallbackTokens['AZE'] = { 
          id: 'aze-mainnet', 
          symbol: 'AZE', 
          fee: 1.0, 
          address: process.env.AZE_TOKEN_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
          name: 'Azore Token'
        };
      } else {
        fallbackTokens['AZE-t'] = { 
          id: 'aze-testnet', 
          symbol: 'AZE-t', 
          fee: 1.0, 
          address: process.env.AZE_TOKEN_ADDRESS_TESTNET || '0x0000000000000000000000000000000000000000',
          name: 'Azore Token (Testnet)'
        };
      }

      return fallbackTokens;
    }
  }

  /**
   * Obter taxa padrão por símbolo do token
   */
  getDefaultFeeBySymbol(symbol) {
    const defaultFees = {
      'cBRL': 0.5,    // Taxa menor para moeda brasileira
      'PCN': 1.0,     // Taxa padrão
      'AZE': 1.0,     // Taxa padrão (mainnet)
      'AZE-t': 1.0,   // Taxa padrão (testnet)
      'CNT': 1.0      // Taxa padrão
    };
    
    return defaultFees[symbol] || 1.0; // Taxa padrão de 1.0 para tokens não especificados
  }

  /**
   * Obter taxas de transferência por token - FORMATO ATUALIZADO COM TOKENS DINÂMICOS
   */
  async getTokenTransferFees(userId) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      const tokenFees = userTaxes.tokenTransferFees || {};
      
      // Buscar tokens disponíveis do banco de dados
      const availableTokens = await this.getAvailableTokens();
      const formattedFees = {};
      
      // Processar tokens disponíveis
      for (const [symbol, tokenData] of Object.entries(availableTokens)) {
        formattedFees[symbol] = { ...tokenData };
        
        // Verificar se há taxa customizada para este token
        // Formato: tokenId_symbol
        const tokenKey = `${tokenData.id}_${symbol}`;
        if (tokenFees[tokenKey] && typeof tokenFees[tokenKey] === 'object') {
          formattedFees[symbol].fee = tokenFees[tokenKey].fee || tokenData.fee;
        } else if (tokenFees[symbol] && typeof tokenFees[symbol] === 'object') {
          // Fallback para buscar apenas por symbol
          formattedFees[symbol].fee = tokenFees[symbol].fee || tokenData.fee;
        }
      }
      
      // Processar outras taxas customizadas que não estão nos tokens disponíveis
      for (const [key, value] of Object.entries(tokenFees)) {
        if (typeof value === 'object' && value.symbol) {
          if (!formattedFees[value.symbol]) {
            formattedFees[value.symbol] = value;
          }
        } else if (key.includes('_')) {
          // Formato: tokenId_symbol
          const [tokenId, symbol] = key.split('_');
          if (!formattedFees[symbol]) {
            formattedFees[symbol] = {
              id: tokenId,
              symbol: symbol,
              fee: typeof value === 'object' ? value.fee || this.getDefaultFeeBySymbol(symbol) : this.getDefaultFeeBySymbol(symbol),
              address: null,
              name: symbol
            };
          }
        } else if (!formattedFees[key]) {
          // Compatibilidade com formato antigo (apenas symbol)
          formattedFees[key] = {
            id: null,
            symbol: key,
            fee: typeof value === 'object' ? value.fee || this.getDefaultFeeBySymbol(key) : this.getDefaultFeeBySymbol(key),
            address: null,
            name: key
          };
        }
      }
      
      return formattedFees;
    } catch (error) {
      console.error('❌ Erro ao obter taxas de transferência por token:', error);
      throw error;
    }
  }

  /**
   * Atualizar taxas de transferência por token
   */
  async updateTokenTransferFees(userId, tokenFees) {
    try {
      if (!this.prisma) await this.init();

      const updatedTaxes = await this.prisma.userTaxes.update({
        where: { userId: userId },
        data: {
          tokenTransferFees: tokenFees
        }
      });

      console.log(`📝 Taxas de transferência por token atualizadas para usuário ${userId}`);
      return updatedTaxes;

    } catch (error) {
      console.error('❌ Erro ao atualizar taxas de transferência por token:', error);
      throw error;
    }
  }

  /**
   * Calcular subsídio de gas
   */
  async calculateGasSubsidy(userId, gasAmount) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      
      if (!userTaxes.gasSubsidyEnabled) {
        return {
          subsidyAmount: 0,
          userPays: gasAmount,
          platformPays: 0,
          subsidyPercent: 0,
          isSubsidized: false
        };
      }

      const subsidyAmount = (gasAmount * userTaxes.gasSubsidyPercent) / 100;
      const userPays = gasAmount - subsidyAmount;

      return {
        subsidyAmount: parseFloat(subsidyAmount.toFixed(4)),
        userPays: parseFloat(userPays.toFixed(4)),
        platformPays: parseFloat(subsidyAmount.toFixed(4)),
        subsidyPercent: userTaxes.gasSubsidyPercent,
        isSubsidized: true
      };

    } catch (error) {
      console.error('❌ Erro ao calcular subsídio de gas:', error);
      throw error;
    }
  }

  /**
   * Atualizar nível VIP do usuário
   */
  async updateVipLevel(userId, vipLevel, validUntil = null) {
    try {
      if (!this.prisma) await this.init();

      const updatedTaxes = await this.prisma.userTaxes.update({
        where: { userId: userId },
        data: {
          isVip: vipLevel > 0,
          vipLevel: vipLevel,
          validUntil: validUntil,
          // Ajustar taxas baseado no nível VIP
          depositFeePercent: this.getVipDepositFee(vipLevel),
          withdrawFeePercent: this.getVipWithdrawFee(vipLevel),
          exchangeFeePercent: this.getVipExchangeFee(vipLevel),
          transferFeePercent: this.getVipTransferFee(vipLevel),
          gasSubsidyEnabled: vipLevel >= 3,
          gasSubsidyPercent: this.getVipGasSubsidy(vipLevel)
        }
      });

      console.log(`⭐ Nível VIP atualizado para ${vipLevel} para usuário ${userId}`);
      return updatedTaxes;

    } catch (error) {
      console.error('❌ Erro ao atualizar nível VIP:', error);
      throw error;
    }
  }

  /**
   * Obter taxa de depósito baseada no nível VIP
   */
  getVipDepositFee(vipLevel) {
    const fees = {
      0: 0.5,   // Normal
      1: 0.45,  // VIP 1
      2: 0.4,   // VIP 2
      3: 0.35,  // VIP 3
      4: 0.3,   // VIP 4
      5: 0.25   // VIP 5
    };
    return fees[vipLevel] || fees[0];
  }

  /**
   * Obter taxa de saque baseada no nível VIP
   */
  getVipWithdrawFee(vipLevel) {
    const fees = {
      0: 0.5,   // Normal
      1: 0.45,  // VIP 1
      2: 0.4,   // VIP 2
      3: 0.35,  // VIP 3
      4: 0.3,   // VIP 4
      5: 0.25   // VIP 5
    };
    return fees[vipLevel] || fees[0];
  }

  /**
   * Obter taxa de exchange baseada no nível VIP
   */
  getVipExchangeFee(vipLevel) {
    const fees = {
      0: 0.3,   // Normal
      1: 0.28,  // VIP 1
      2: 0.25,  // VIP 2
      3: 0.22,  // VIP 3
      4: 0.18,  // VIP 4
      5: 0.15   // VIP 5
    };
    return fees[vipLevel] || fees[0];
  }

  /**
   * Obter taxa de transferência baseada no nível VIP
   */
  getVipTransferFee(vipLevel) {
    const fees = {
      0: 0.1,   // Normal
      1: 0.09,  // VIP 1
      2: 0.08,  // VIP 2
      3: 0.06,  // VIP 3
      4: 0.04,  // VIP 4
      5: 0.02   // VIP 5
    };
    return fees[vipLevel] || fees[0];
  }

  /**
   * Obter subsídio de gas baseado no nível VIP
   */
  getVipGasSubsidy(vipLevel) {
    const subsidies = {
      0: 0,    // Normal - sem subsídio
      1: 0,    // VIP 1 - sem subsídio
      2: 0,    // VIP 2 - sem subsídio
      3: 25,   // VIP 3 - 25% subsídio
      4: 50,   // VIP 4 - 50% subsídio
      5: 100   // VIP 5 - 100% subsídio
    };
    return subsidies[vipLevel] || subsidies[0];
  }

  /**
   * Atualizar taxas customizadas para um usuário
   */
  async updateCustomTaxes(userId, customTaxes) {
    try {
      if (!this.prisma) await this.init();

      const updatedTaxes = await this.prisma.userTaxes.update({
        where: { userId: userId },
        data: customTaxes
      });

      console.log(`📝 Taxas customizadas atualizadas para usuário ${userId}`);
      return updatedTaxes;

    } catch (error) {
      console.error('❌ Erro ao atualizar taxas customizadas:', error);
      throw error;
    }
  }

  /**
   * Obter todos os tokens com suas taxas para um usuário
   * Estrutura: { testnet: [...], mainnet: [...] }
   */
  async getUserTokenFees(userId) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      const tokenTransferFees = userTaxes.tokenTransferFees || { testnet: [], mainnet: [] };

      return tokenTransferFees;
    } catch (error) {
      console.error('❌ Erro ao obter taxas de tokens do usuário:', error);
      throw error;
    }
  }

  /**
   * Atualizar taxa de um token específico para um usuário
   */
  async updateUserTokenFee(userId, network, tokenId, newFee) {
    try {
      if (!this.prisma) await this.init();

      // Validar network
      if (!['testnet', 'mainnet'].includes(network)) {
        throw new Error('Network deve ser "testnet" ou "mainnet"');
      }

      // Obter taxas atuais
      const userTaxes = await this.getUserTaxes(userId);
      const tokenTransferFees = userTaxes.tokenTransferFees || { testnet: [], mainnet: [] };

      // Encontrar o token na network especificada
      const networkTokens = tokenTransferFees[network] || [];
      const tokenIndex = networkTokens.findIndex(t => t.id === tokenId);

      if (tokenIndex === -1) {
        throw new Error(`Token ${tokenId} não encontrado na network ${network}`);
      }

      // Atualizar a taxa
      networkTokens[tokenIndex].fee = parseFloat(newFee);
      tokenTransferFees[network] = networkTokens;

      // Salvar no banco
      const updatedTaxes = await this.prisma.userTaxes.update({
        where: { userId: userId },
        data: {
          tokenTransferFees: tokenTransferFees
        }
      });

      console.log(`💰 Taxa do token ${tokenId} atualizada para ${newFee} na network ${network} para usuário ${userId}`);
      return updatedTaxes;

    } catch (error) {
      console.error('❌ Erro ao atualizar taxa do token:', error);
      throw error;
    }
  }

  /**
   * Atualizar múltiplas taxas de tokens para um usuário
   */
  async updateMultipleTokenFees(userId, updates) {
    try {
      if (!this.prisma) await this.init();

      // Obter taxas atuais
      const userTaxes = await this.getUserTaxes(userId);
      const tokenTransferFees = userTaxes.tokenTransferFees || { testnet: [], mainnet: [] };

      // Processar updates
      // updates = [{ network, tokenId, fee }, ...]
      for (const update of updates) {
        const { network, tokenId, fee } = update;

        // Validar network
        if (!['testnet', 'mainnet'].includes(network)) {
          console.warn(`⚠️ Network inválida: ${network}`);
          continue;
        }

        // Encontrar e atualizar o token
        const networkTokens = tokenTransferFees[network] || [];
        const tokenIndex = networkTokens.findIndex(t => t.id === tokenId);

        if (tokenIndex !== -1) {
          networkTokens[tokenIndex].fee = parseFloat(fee);
          tokenTransferFees[network] = networkTokens;
        } else {
          console.warn(`⚠️ Token ${tokenId} não encontrado na network ${network}`);
        }
      }

      // Salvar no banco
      const updatedTaxes = await this.prisma.userTaxes.update({
        where: { userId: userId },
        data: {
          tokenTransferFees: tokenTransferFees
        }
      });

      console.log(`💰 Múltiplas taxas de tokens atualizadas para usuário ${userId}`);
      return updatedTaxes;

    } catch (error) {
      console.error('❌ Erro ao atualizar múltiplas taxas de tokens:', error);
      throw error;
    }
  }

  /**
   * Obter taxa de um token específico para um usuário
   */
  async getTokenFee(userId, network, tokenId) {
    try {
      const userTaxes = await this.getUserTaxes(userId);
      const tokenTransferFees = userTaxes.tokenTransferFees || { testnet: [], mainnet: [] };

      // Validar network
      if (!['testnet', 'mainnet'].includes(network)) {
        throw new Error('Network deve ser "testnet" ou "mainnet"');
      }

      // Buscar o token na network especificada
      const networkTokens = tokenTransferFees[network] || [];
      const token = networkTokens.find(t => t.id === tokenId);

      if (!token) {
        throw new Error(`Token ${tokenId} não encontrado na network ${network}`);
      }

      return {
        ...token,
        network: network,
        userId: userId
      };

    } catch (error) {
      console.error('❌ Erro ao obter taxa do token:', error);
      throw error;
    }
  }

  /**
   * Resetar todas as taxas de tokens para um usuário (volta aos valores padrão de 0)
   */
  async resetAllTokenFees(userId) {
    try {
      if (!this.prisma) await this.init();

      // Buscar todos os tokens
      const tokenContracts = await this.prisma.smartContract.findMany({
        where: {
          contractTypeId: 'cc350023-d9ba-4746-85f3-1590175a2328',
          isActive: true
        },
        select: {
          id: true,
          name: true,
          network: true,
          address: true,
          metadata: true
        }
      });

      // Separar por rede
      const testnet = tokenContracts.filter(t => t.network === 'testnet');
      const mainnet = tokenContracts.filter(t => t.network === 'mainnet');

      // Gerar estrutura com fee = 0
      const tokenFeesStructure = {
        testnet: testnet.map(t => ({
          id: t.id,
          name: t.name,
          symbol: t.metadata?.symbol || t.name,
          address: t.address,
          fee: 0
        })),
        mainnet: mainnet.map(t => ({
          id: t.id,
          name: t.name,
          symbol: t.metadata?.symbol || t.name,
          address: t.address,
          fee: 0
        }))
      };

      // Atualizar no banco
      const updatedTaxes = await this.prisma.userTaxes.update({
        where: { userId: userId },
        data: {
          tokenTransferFees: tokenFeesStructure
        }
      });

      console.log(`🔄 Taxas de tokens resetadas para valores padrão (0) para usuário ${userId}`);
      return updatedTaxes;

    } catch (error) {
      console.error('❌ Erro ao resetar taxas de tokens:', error);
      throw error;
    }
  }
}

module.exports = new UserTaxesService();
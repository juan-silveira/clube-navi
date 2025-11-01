/**
 * Stake Balance Service
 * Serviço para calcular e cachear saldos de stake do usuário
 */

const ethers = require('ethers');
const prismaConfig = require('../config/prisma');
const blockchainService = require('./blockchain.service');
const fs = require('fs');
const path = require('path');

class StakeBalanceService {
  constructor() {
    this.defaultStakeABI = this.loadStakeABI();
  }

  loadStakeABI() {
    try {
      const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_stake_abi.json');
      const abiContent = fs.readFileSync(abiPath, 'utf8');
      return JSON.parse(abiContent);
    } catch (error) {
      console.error('Error loading stake ABI:', error);
      return null;
    }
  }

  /**
   * Buscar saldo de stake em um contrato específico
   */
  async getStakeBalanceInContract(contractAddress, userAddress, network, abi) {
    try {
      const provider = blockchainService.config.getProvider(network);
      const contractInstance = new ethers.Contract(contractAddress, abi, provider);

      // Verificar se a função existe
      if (!contractInstance.getTotalStakeBalance) {
        console.warn(`Contract ${contractAddress} doesn't have getTotalStakeBalance function`);
        return '0';
      }

      // Chamar função getTotalStakeBalance com timeout de 5 segundos
      const balancePromise = contractInstance.getTotalStakeBalance(userAddress);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const balance = await Promise.race([balancePromise, timeoutPromise]);

      // Converter BigNumber para string
      return balance.toString();
    } catch (error) {
      if (error.message !== 'Timeout') {
        console.warn(`Error fetching stake balance from ${contractAddress}:`, error.message);
      }
      return '0';
    }
  }

  /**
   * Calcular total de stake do usuário em todos os contratos
   */
  async calculateTotalStake(userAddress) {
    try {
      const prisma = prismaConfig.getPrisma();

      console.log(`📊 [StakeBalance] Calculando stake para ${userAddress}`);

      // Buscar todos os contratos de stake ativos
      const stakeContracts = await prisma.smartContract.findMany({
        where: {
          isActive: true,
          contractType: {
            category: {
              in: ['defi', 'other']
            },
            name: {
              not: 'ERC20'
            }
          }
        },
        select: {
          address: true,
          network: true,
          abi: true,
          name: true
        }
      });

      console.log(`📊 [StakeBalance] Encontrados ${stakeContracts.length} contratos de stake`);

      if (stakeContracts.length === 0) {
        return {
          totalStake: '0',
          contractsChecked: 0,
          breakdown: []
        };
      }

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

      // Buscar saldos em paralelo (com Promise.allSettled para não falhar se um contrato falhar)
      const balancePromises = stakeContracts.map(async (contract) => {
        const abi = typeof contract.abi === 'string'
          ? JSON.parse(contract.abi)
          : (contract.abi || this.defaultStakeABI);

        if (!abi) {
          return { contract: contract.address, balance: '0', error: 'No ABI' };
        }

        const balance = await this.getStakeBalanceInContract(
          contract.address,
          userAddress,
          contract.network.toLowerCase(),
          abi
        );

        if (balance !== '0') {
          console.log(`✅ [StakeBalance] ${contract.name || contract.address}: ${balance} wei`);
        }

        // Extrair tokenAddress e tokenSymbol do metadata do contrato
        const metadata = contract.metadata || {};
        let tokenAddress = metadata.tokenAddress || null;
        let tokenSymbol = null;

        // Se não tem tokenAddress no metadata, tentar buscar do contrato chamando stakeToken()
        if (!tokenAddress) {
          try {
            const { ethers } = require('ethers');
            const blockchainService = require('./blockchain.service');
            const provider = blockchainService.config.getProvider(contract.network.toLowerCase());
            const contractInstance = new ethers.Contract(contract.address, abi, provider);

            // Tentar chamar stakeToken() para obter o endereço do token
            if (contractInstance.stakeToken) {
              tokenAddress = await contractInstance.stakeToken();
              console.log(`📍 [StakeBalance] Token address from contract ${contract.name}: ${tokenAddress}`);
            }
          } catch (e) {
            console.warn(`⚠️ [StakeBalance] Could not get stakeToken from ${contract.name}:`, e.message);
          }
        }

        // Prioridade para buscar tokenSymbol:
        // 1. Buscar símbolo pelo tokenAddress no mapa (tokens já carregados)
        // 2. Se não encontrou, buscar token no banco pelo address
        // 3. Usar tokenSymbol/code/symbol direto do metadata do stake (fallback)
        if (tokenAddress) {
          tokenSymbol = tokenAddressToSymbol[tokenAddress.toLowerCase()];

          // Se não encontrou no mapa, buscar no banco
          if (!tokenSymbol) {
            try {
              const tokenContract = await prisma.smartContract.findFirst({
                where: {
                  address: {
                    equals: tokenAddress,
                    mode: 'insensitive'
                  }
                },
                select: { metadata: true }
              });
              if (tokenContract?.metadata?.symbol) {
                tokenSymbol = tokenContract.metadata.symbol;
                console.log(`📍 [StakeBalance] Token symbol from DB for ${tokenAddress}: ${tokenSymbol}`);
              } else {
                console.warn(`⚠️ [StakeBalance] Token contract found but no symbol in metadata for ${tokenAddress}`);
              }
            } catch (e) {
              console.warn(`⚠️ [StakeBalance] Could not fetch token from DB:`, e.message);
            }
          }
        }

        // Fallback para metadata do próprio contrato de stake
        if (!tokenSymbol) {
          tokenSymbol = metadata.tokenSymbol || metadata.code || metadata.symbol || null;
        }

        console.log(`📊 [StakeBalance] ${contract.name}: tokenAddress=${tokenAddress}, tokenSymbol=${tokenSymbol}`);

        return {
          contract: contract.address,
          contractName: contract.name,
          network: contract.network,
          balance,
          tokenSymbol,
          tokenAddress,
          error: null
        };
      });

      const results = await Promise.allSettled(balancePromises);

      // Processar resultados e somar
      let totalStakeWei = BigInt(0);
      const breakdown = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { contract, network, balance, tokenSymbol, tokenAddress, contractName, error } = result.value;

          if (!error && balance && balance !== '0') {
            try {
              totalStakeWei += BigInt(balance);
              breakdown.push({
                contract,
                network,
                balance,
                tokenSymbol,
                tokenAddress,
                contractName
              });
            } catch (e) {
              console.warn(`Error parsing balance for ${contract}:`, e);
            }
          }
        }
      });

      console.log(`📊 [StakeBalance] Total: ${totalStakeWei.toString()} wei (${breakdown.length} contratos com saldo)`);

      return {
        totalStake: totalStakeWei.toString(),
        contractsChecked: stakeContracts.length,
        breakdown
      };

    } catch (error) {
      console.error('Error calculating total stake:', error);
      throw error;
    }
  }

  /**
   * Atualizar saldo de stake no banco de dados do usuário
   */
  async updateUserStakeBalance(userId, userAddress) {
    try {
      const prisma = prismaConfig.getPrisma();

      // Calcular total de stake
      const stakeData = await this.calculateTotalStake(userAddress);

      console.log('💾 [StakeBalance] Preparando para salvar:', {
        totalStake: stakeData.totalStake,
        contractsWithBalance: stakeData.breakdown.length
      });

      // Usar transação para evitar race condition
      const updated = await prisma.$transaction(async (tx) => {
        // Buscar dados mais recentes dentro da transação
        const latestUser = await tx.user.findUnique({
          where: { id: userId },
          select: { balances: true, stakes: true }
        });

        if (!latestUser) {
          throw new Error('User not found');
        }

        const currentBalances = latestUser.balances || {};
        const currentStakes = latestUser.stakes || {};

        // Atualizar apenas campos de stake no campo balances (manter compatibilidade)
        const updatedBalances = {
          ...currentBalances,
          totalStake: stakeData.totalStake,
          totalStakeUpdatedAt: new Date().toISOString(),
          stakeBreakdown: stakeData.breakdown
        };

        // Também salvar em campo dedicado stakes com estrutura organizada
        const updatedStakes = {
          total: stakeData.totalStake,
          updatedAt: new Date().toISOString(),
          breakdown: stakeData.breakdown.reduce((acc, item) => {
            // Agrupar por contrato
            acc[item.contract] = {
              balance: item.balance,
              network: item.network,
              contractName: item.contractName
            };
            return acc;
          }, {})
        };

        await tx.user.update({
          where: { id: userId },
          data: {
            balances: updatedBalances,
            stakes: updatedStakes
          }
        });

        return { updatedBalances, updatedStakes };
      });

      console.log('✅ [StakeBalance] Salvo no banco:', {
        totalStake: updated.updatedStakes.total,
        contractsWithStake: Object.keys(updated.updatedStakes.breakdown).length
      });

      return {
        success: true,
        totalStake: stakeData.totalStake,
        contractsChecked: stakeData.contractsChecked,
        breakdown: stakeData.breakdown
      };

    } catch (error) {
      console.error('Error updating user stake balance:', error);
      throw error;
    }
  }

  /**
   * Buscar total de stake do usuário do cache (banco de dados)
   */
  async getUserStakeBalance(userId) {
    try {
      const prisma = prismaConfig.getPrisma();

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balances: true, stakes: true }
      });

      if (!user) {
        return {
          totalStake: '0',
          totalStakeUpdatedAt: null,
          stakeBreakdown: []
        };
      }

      // Priorizar novo campo stakes, fallback para balances (compatibilidade)
      const stakes = user.stakes || {};
      const balances = user.balances || {};

      return {
        totalStake: stakes.total || balances.totalStake || '0',
        totalStakeUpdatedAt: stakes.updatedAt || balances.totalStakeUpdatedAt || null,
        stakeBreakdown: stakes.breakdown ? Object.entries(stakes.breakdown).map(([contract, data]) => ({
          contract,
          balance: data.balance,
          network: data.network,
          contractName: data.contractName
        })) : (balances.stakeBreakdown || [])
      };

    } catch (error) {
      console.error('Error fetching user stake balance:', error);
      return {
        totalStake: '0',
        totalStakeUpdatedAt: null,
        stakeBreakdown: []
      };
    }
  }
}

module.exports = new StakeBalanceService();

const stakeService = require('../services/stake.service');
const axios = require('axios');

/**
 * Helper function to refresh contract metadata after whitelist changes
 * Calls the refresh-metadata endpoint to update database with blockchain data
 */
async function refreshContractMetadata(contractAddress, network) {
  try {
    console.log(`🔄 [refreshMetadata] Iniciando refresh para ${contractAddress} na rede ${network}`);
    const baseURL = process.env.API_URL || 'http://localhost:8800';
    const response = await axios.post(`${baseURL}/api/contracts/refresh-metadata`, {
      contractAddress,
      network
    });
    console.log(`✅ [refreshMetadata] Metadata refreshed successfully:`, response.data);
  } catch (error) {
    console.error(`❌ [refreshMetadata] Failed for ${contractAddress}:`, error.message);
    if (error.response) {
      console.error(`   Response status: ${error.response.status}`);
      console.error(`   Response data:`, error.response.data);
    }
    // Don't throw - metadata refresh failure shouldn't block the main operation
  }
}

/**
 * Controller para gerenciamento de contratos de staking
 */
class StakeController {

  /**
   * Registra um novo stake
   */
  async registerStake(req, res) {
    try {
      const { name, address, network } = req.body;
      
      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do stake é obrigatório'
        });
      }

      if (!network) {
        return res.status(400).json({
          success: false,
          message: 'Rede é obrigatória'
        });
      }

      const result = await stakeService.registerStake({ name, address, network });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao registrar stake',
        error: error.message
      });
    }
  }

  /**
   * Obtém informações do stake
   */
  async getStakeInfo(req, res) {
    try {
      const { address } = req.params;
      
      const result = await stakeService.getStakeInfo(address);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter informações do stake',
        error: error.message
      });
    }
  }

  /**
   * Investir token (stake)
   */
  async investToken(req, res) {
    try {
      const { address } = req.params;
      const { user, amount, customTimestamp = 0 } = req.body;

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade é obrigatória'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      // Verificar limite de emissão total (totalEmission) SOMENTE se estiver definido
      const totalEmission = stake.data?.metadata?.totalEmission;
      // Validar SOMENTE se totalEmission existir, não for null/undefined e for maior que 0
      if (totalEmission !== null && totalEmission !== undefined && totalEmission > 0) {
        // Buscar total já investido no contrato
        const totalStakedResponse = await stakeService.readStakeContract(address, 'getTotalStakedSupply', []);
        if (totalStakedResponse.success) {
          const totalStakedInEther = parseFloat(totalStakedResponse.data.result) / Math.pow(10, 18);
          const amountInEther = parseFloat(amount);
          const availableToStake = totalEmission - totalStakedInEther;

          if (amountInEther > availableToStake) {
            return res.status(400).json({
              success: false,
              message: `Limite de emissão atingido. Valor máximo disponível para investimento: ${availableToStake.toFixed(6)}. Limite total de emissão: ${totalEmission}`,
              error: 'EMISSION_LIMIT_EXCEEDED',
              data: {
                amountRequested: amountInEther,
                availableToStake,
                totalEmission,
                currentTotalStaked: totalStakedInEther
              }
            });
          }
        }
      }

      const result = await stakeService.writeStakeContract(
        address,
        'stake',
        [user, amount, customTimestamp],
        null, // Não precisamos mais do adminAddress
        req.user // Passar informações do usuário JWT
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao investir token',
        error: error.message
      });
    }
  }

  /**
   * Retirar investimento (unstake)
   */
  async withdrawInvestment(req, res) {
    try {
      const { address } = req.params;
      const { user, amount } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade é obrigatória'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'unstake', 
        [user, amount], 
        null, // Não precisamos mais do adminAddress
        req.user // Passar informações do usuário JWT
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao retirar investimento',
        error: error.message
      });
    }
  }

  /**
   * Resgatar recompensas (claimReward)
   */
  async claimRewards(req, res) {
    try {
      const { address } = req.params;
      const { user } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }

      // Verificar se o stake existe e obter adminAddress
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'claimReward', 
        [user], 
        null, // adminAddress
        req.user // Passar informações do usuário JWT
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao resgatar recompensas',
        error: error.message
      });
    }
  }

  /**
   * Reinvestir recompensas (compound)
   */
  async compoundRewards(req, res) {
    try {
      const { address } = req.params;
      const { user } = req.body;

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }

      // Verificar se o stake existe e obter adminAddress
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      // Verificar limite de emissão total (totalEmission) SOMENTE se estiver definido
      const totalEmission = stake.data?.metadata?.totalEmission;
      // Validar SOMENTE se totalEmission existir, não for null/undefined e for maior que 0
      if (totalEmission !== null && totalEmission !== undefined && totalEmission > 0) {
        // Buscar rewards pendentes do usuário
        const pendingRewardResponse = await stakeService.readStakeContract(address, 'getPendingReward', [user]);
        if (pendingRewardResponse.success) {
          const pendingRewardInEther = parseFloat(pendingRewardResponse.data.result) / Math.pow(10, 18);

          // Buscar total já investido no contrato
          const totalStakedResponse = await stakeService.readStakeContract(address, 'getTotalStakedSupply', []);
          if (totalStakedResponse.success) {
            const totalStakedInEther = parseFloat(totalStakedResponse.data.result) / Math.pow(10, 18);
            const availableToStake = totalEmission - totalStakedInEther;

            if (pendingRewardInEther > availableToStake) {
              return res.status(400).json({
                success: false,
                message: `Não é possível reinvestir. O valor a reinvestir (${pendingRewardInEther.toFixed(6)}) excede o limite disponível (${availableToStake.toFixed(6)}). Limite total de emissão: ${totalEmission}. Por favor, resgate seus recebíveis primeiro.`,
                error: 'EMISSION_LIMIT_EXCEEDED',
                data: {
                  pendingReward: pendingRewardInEther,
                  availableToStake,
                  totalEmission,
                  currentTotalStaked: totalStakedInEther
                }
              });
            }
          }
        }
      }

      const result = await stakeService.writeStakeContract(
        address,
        'compound',
        [user],
        null, // adminAddress
        req.user // Passar informações do usuário JWT
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao reinvestir recompensas',
        error: error.message
      });
    }
  }

  // ===== ROTAS QUE SOMENTE O adminAddress DO STAKE PODE CHAMAR =====

  /**
   * Depositar recompensas no cofre (depositRewards)
   */
  async depositRewards(req, res) {
    try {
      const { address } = req.params;
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade é obrigatória'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'depositRewards', 
        [amount], 
        null
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao depositar recompensas',
        error: error.message
      });
    }
  }

  /**
   * Distribuir recompensas (distributeReward)
   */
  async distributeRewards(req, res) {
    try {
      const { address } = req.params;
      const { percentageInBasisPoints } = req.body;
      
      if (!percentageInBasisPoints) {
        return res.status(400).json({
          success: false,
          message: 'Percentual em pontos-base é obrigatório'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'distributeReward', 
        [percentageInBasisPoints], 
        null
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao distribuir recompensas',
        error: error.message
      });
    }
  }

  /**
   * Retirar recompensas do cofre (withdrawRewardTokens)
   */
  async withdrawRewardTokens(req, res) {
    try {
      const { address } = req.params;
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade é obrigatória'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'withdrawRewardTokens', 
        [amount], 
        null
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao retirar recompensas do cofre',
        error: error.message
      });
    }
  }

  /**
   * Definir duração do ciclo de recompensas (setCycleDuration)
   */
  async setCycleDuration(req, res) {
    try {
      const { address } = req.params;
      const { newDurationInDays } = req.body;
      
      if (!newDurationInDays) {
        return res.status(400).json({
          success: false,
          message: 'Nova duração em dias é obrigatória'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'setCycleDuration', 
        [newDurationInDays], 
        null
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao definir duração do ciclo',
        error: error.message
      });
    }
  }

  /**
   * Permitir/Bloquear reinvestir (setAllowRestake)
   */
  async setAllowRestake(req, res) {
    try {
      const { address } = req.params;
      const { status, adminAddress } = req.body;
      
      if (typeof status !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Status deve ser um booleano'
        });
      }

      if (!adminAddress) {
        return res.status(400).json({
          success: false,
          message: 'adminAddress é obrigatório'
        });
      }

      // Verificar se o adminAddress tem permissão
      const isAdmin = await stakeService.verifyStakeAdmin(address, adminAddress);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - requer ser admin do stake'
        });
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'setAllowRestake', 
        [status], 
        adminAddress
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao definir permissão de reinvestir',
        error: error.message
      });
    }
  }

  /**
   * Remover da blacklist (removeFromBlacklist)
   */
  async removeFromBlacklist(req, res) {
    try {
      const { address } = req.params;
      const { user } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'removeFromBlacklist', 
        [user], 
        null
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao remover da blacklist',
        error: error.message
      });
    }
  }

  /**
   * Permitir/Bloquear novos investimentos (setStakingBlocked)
   */
  async setStakingBlocked(req, res) {
    try {
      const { address } = req.params;
      const { blocked } = req.body;
      
      if (typeof blocked !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Blocked deve ser um booleano'
        });
      }

      // Verificar se o stake existe
      const stake = await stakeService.getStakeByAddress(address);
      if (!stake.success) {
        return res.status(404).json(stake);
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'setStakingBlocked', 
        [blocked], 
        null
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao definir bloqueio de staking',
        error: error.message
      });
    }
  }

  /**
   * Definir tempo de carência (setTimelock)
   */
  async setTimelock(req, res) {
    try {
      const { address } = req.params;
      const { timestamp, adminAddress } = req.body;
      
      if (!timestamp) {
        return res.status(400).json({
          success: false,
          message: 'Timestamp é obrigatório'
        });
      }

      if (!adminAddress) {
        return res.status(400).json({
          success: false,
          message: 'adminAddress é obrigatório'
        });
      }

      // Verificar se o adminAddress tem permissão
      const isAdmin = await stakeService.verifyStakeAdmin(address, adminAddress);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - requer ser admin do stake'
        });
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'setTimelock', 
        [timestamp], 
        adminAddress
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao definir timelock',
        error: error.message
      });
    }
  }

  /**
   * Permitir/Proibir retiradas parciais (setAllowPartialWithdrawal)
   */
  async setAllowPartialWithdrawal(req, res) {
    try {
      const { address } = req.params;
      const { allow, adminAddress } = req.body;
      
      if (typeof allow !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Allow deve ser um booleano'
        });
      }

      if (!adminAddress) {
        return res.status(400).json({
          success: false,
          message: 'adminAddress é obrigatório'
        });
      }

      // Verificar se o adminAddress tem permissão
      const isAdmin = await stakeService.verifyStakeAdmin(address, adminAddress);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - requer ser admin do stake'
        });
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'setAllowPartialWithdrawal', 
        [allow], 
        adminAddress
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao definir permissão de retirada parcial',
        error: error.message
      });
    }
  }

  /**
   * Definir novo valor mínimo (updateMinValueStake)
   */
  async updateMinValueStake(req, res) {
    try {
      const { address } = req.params;
      const { value, adminAddress } = req.body;
      
      if (!value) {
        return res.status(400).json({
          success: false,
          message: 'Valor é obrigatório'
        });
      }

      if (!adminAddress) {
        return res.status(400).json({
          success: false,
          message: 'adminAddress é obrigatório'
        });
      }

      // Verificar se o adminAddress tem permissão
      const isAdmin = await stakeService.verifyStakeAdmin(address, adminAddress);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - requer ser admin do stake'
        });
      }

      const result = await stakeService.writeStakeContract(
        address, 
        'updateMinValueStake', 
        [value], 
        adminAddress
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar valor mínimo',
        error: error.message
      });
    }
  }

  /**
   * Adicionar na whitelist (addToWhitelist)
   */
  async addToWhitelist(req, res) {
    try {
      const { address } = req.params;
      const { user, adminAddress } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }

      if (!adminAddress) {
        return res.status(400).json({
          success: false,
          message: 'adminAddress é obrigatório'
        });
      }

      // Verificar se o adminAddress tem permissão
      const isAdmin = await stakeService.verifyStakeAdmin(address, adminAddress);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - requer ser admin do stake'
        });
      }

      const result = await stakeService.writeStakeContract(
        address,
        'addToWhitelist',
        [user],
        adminAddress
      );

      // Refresh metadata from blockchain after successful whitelist update
      if (result.success) {
        // Get network from stake contract
        const stakeInfo = await stakeService.getStakeInfo(address);
        if (stakeInfo && stakeInfo.network) {
          await refreshContractMetadata(address, stakeInfo.network);
        }
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao adicionar na whitelist',
        error: error.message
      });
    }
  }

  /**
   * Remover da whitelist (removeFromWhitelist)
   */
  async removeFromWhitelist(req, res) {
    try {
      const { address } = req.params;
      const { user, adminAddress } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }

      if (!adminAddress) {
        return res.status(400).json({
          success: false,
          message: 'adminAddress é obrigatório'
        });
      }

      // Verificar se o adminAddress tem permissão
      const isAdmin = await stakeService.verifyStakeAdmin(address, adminAddress);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - requer ser admin do stake'
        });
      }

      const result = await stakeService.writeStakeContract(
        address,
        'removeFromWhitelist',
        [user],
        adminAddress
      );

      // Refresh metadata from blockchain after successful whitelist update
      if (result.success) {
        // Get network from stake contract
        const stakeInfo = await stakeService.getStakeInfo(address);
        if (stakeInfo && stakeInfo.network) {
          await refreshContractMetadata(address, stakeInfo.network);
        }
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao remover da whitelist',
        error: error.message
      });
    }
  }

  /**
   * Ativar/Desativar whitelist (setWhitelistEnabled)
   */
  async setWhitelistEnabled(req, res) {
    try {
      const { address } = req.params;
      const { enabled, adminAddress } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Enabled deve ser um booleano'
        });
      }

      if (!adminAddress) {
        return res.status(400).json({
          success: false,
          message: 'adminAddress é obrigatório'
        });
      }

      // Verificar se o adminAddress tem permissão
      const isAdmin = await stakeService.verifyStakeAdmin(address, adminAddress);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado - requer ser admin do stake'
        });
      }

      const result = await stakeService.writeStakeContract(
        address,
        'setWhitelistEnabled',
        [enabled],
        adminAddress
      );

      // Refresh metadata from blockchain after successful whitelist update
      if (result.success) {
        // Get network from stake contract
        const stakeInfo = await stakeService.getStakeInfo(address);
        if (stakeInfo && stakeInfo.network) {
          await refreshContractMetadata(address, stakeInfo.network);
        }
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao definir whitelist',
        error: error.message
      });
    }
  }

  // ===== ROTAS DE CONSULTA =====

  /**
   * Saldo do cofre (getAvailableRewardBalance)
   */
  async getAvailableRewardBalance(req, res) {
    try {
      const { address } = req.params;
      
      const result = await stakeService.readStakeContract(address, 'getAvailableRewardBalance');
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter saldo do cofre',
        error: error.message
      });
    }
  }

  /**
   * Total investido (getTotalStakedSupply)
   */
  async getTotalStakedSupply(req, res) {
    try {
      const { address } = req.params;
      
      const result = await stakeService.readStakeContract(address, 'getTotalStakedSupply');
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter total investido',
        error: error.message
      });
    }
  }

  /**
   * Total de investidores (getNumberOfActiveUsers)
   */
  async getNumberOfActiveUsers(req, res) {
    try {
      const { address } = req.params;
      
      const result = await stakeService.readStakeContract(address, 'getNumberOfActiveUsers');
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter total de investidores',
        error: error.message
      });
    }
  }

  /**
   * Total de recompensas distribuídas (getTotalRewardDistributed)
   */
  async getTotalRewardDistributed(req, res) {
    try {
      const { address } = req.params;
      
      const result = await stakeService.readStakeContract(address, 'getTotalRewardDistributed');
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter total de recompensas distribuídas',
        error: error.message
      });
    }
  }

  /**
   * Permissão de reinvestir (isRestakeAllowed)
   */
  async isRestakeAllowed(req, res) {
    try {
      const { address } = req.params;
      
      const result = await stakeService.readStakeContract(address, 'isRestakeAllowed');
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao verificar permissão de reinvestir',
        error: error.message
      });
    }
  }

  /**
   * Verificar se usuário está na blacklist (getBlacklistStatus)
   */
  async getBlacklistStatus(req, res) {
    try {
      const { address } = req.params;
      const { user } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }
      
      const result = await stakeService.readStakeContract(address, 'getBlacklistStatus', [user]);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao verificar status da blacklist',
        error: error.message
      });
    }
  }

  /**
   * Total investido pelo usuário (getTotalStakeBalance)
   */
  async getTotalStakeBalance(req, res) {
    try {
      const { address } = req.params;
      const { user } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }
      
      const result = await stakeService.readStakeContract(address, 'getTotalStakeBalance', [user]);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter total investido pelo usuário',
        error: error.message
      });
    }
  }

  /**
   * Verificar lista da whitelist (getWhitelistedAddresses)
   */
  async getWhitelistedAddresses(req, res) {
    try {
      const { address } = req.params;
      
      const result = await stakeService.readStakeContract(address, 'getWhitelistedAddresses');
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter lista da whitelist',
        error: error.message
      });
    }
  }

  /**
   * Verificar recompensas pendentes de um usuário (getPendingReward)
   */
  async getPendingReward(req, res) {
    try {
      const { address } = req.params;
      const { user } = req.body;
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Endereço do usuário é obrigatório'
        });
      }
      
      const result = await stakeService.readStakeContract(address, 'getPendingReward', [user]);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter recompensas pendentes',
        error: error.message
      });
    }
  }

  /**
   * Lista todos os stakes
   */
  async listStakes(req, res) {
    try {
      const { page = 1, limit = 10, network, contractType } = req.query;
      
      const result = await stakeService.listStakes({
        page: parseInt(page),
        limit: parseInt(limit),
        network,
        contractType
      });
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao listar stakes',
        error: error.message
      });
    }
  }

  /**
   * Testa o serviço de stakes
   */
  async testService(req, res) {
    try {
      const result = await stakeService.testService();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro no teste do serviço',
        error: error.message
      });
    }
  }
}

module.exports = new StakeController(); 
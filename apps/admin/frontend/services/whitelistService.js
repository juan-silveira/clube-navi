/**
 * Serviço centralizado para gerenciar verificações de whitelist
 * Usa dados do banco de dados (metadata) como fonte primária
 * Atualiza da blockchain apenas quando necessário
 */

import api from './api';

class WhitelistService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Verifica se um usuário está autorizado a ver um contrato baseado em whitelist
   * @param {Object} contract - Contrato com metadata do banco de dados
   * @param {string} userAddress - Endereço do usuário
   * @returns {boolean} - true se usuário pode ver o contrato
   */
  isUserAuthorized(contract, userAddress) {
    if (!contract || !contract.metadata) {
      // Se não tem metadata, assumir que é público (backward compatibility)
      return true;
    }

    const { whitelistEnabled, whitelist } = contract.metadata;

    // Regra 1: Se whitelistEnabled é false ou undefined, mostrar para todos
    if (!whitelistEnabled) {
      return true;
    }

    // Regra 2: Se whitelistEnabled é true mas whitelist está vazia, não mostrar para ninguém
    if (!whitelist || !Array.isArray(whitelist) || whitelist.length === 0) {
      return false;
    }

    // Regra 3: Se whitelistEnabled é true e whitelist tem endereços, verificar se usuário está na lista
    if (!userAddress) {
      return false;
    }

    // Normalizar endereços para comparação (case-insensitive)
    const normalizedUserAddress = userAddress.toLowerCase();
    const normalizedWhitelist = whitelist.map(addr => addr.toLowerCase());

    return normalizedWhitelist.includes(normalizedUserAddress);
  }

  /**
   * Filtra uma lista de contratos baseado em autorização de whitelist
   * @param {Array} contracts - Lista de contratos
   * @param {string} userAddress - Endereço do usuário
   * @returns {Array} - Contratos autorizados
   */
  filterAuthorizedContracts(contracts, userAddress) {
    if (!Array.isArray(contracts)) {
      return [];
    }

    return contracts.filter(contract => this.isUserAuthorized(contract, userAddress));
  }

  /**
   * Força atualização da whitelist de um contrato específico da blockchain
   * Deve ser chamado após alterações nas telas de admin
   * @param {string} contractAddress - Endereço do contrato
   * @param {string} network - Rede do contrato
   * @returns {Promise<Object>} - Metadata atualizado
   */
  async refreshContractWhitelist(contractAddress, network) {
    try {
      console.log(`Refreshing whitelist from blockchain for contract: ${contractAddress}`);

      // Chamar endpoint que atualiza metadata do banco com dados da blockchain
      const response = await api.post('/api/contracts/refresh-metadata', {
        contractAddress,
        network
      });

      if (response.data.success) {
        // Limpar cache para este contrato
        this.clearContractCache(contractAddress);
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to refresh whitelist');
    } catch (error) {
      console.error('Error refreshing contract whitelist:', error);
      throw error;
    }
  }

  /**
   * Atualiza whitelistEnabled de um contrato na blockchain
   * @param {string} contractAddress - Endereço do contrato
   * @param {boolean} enabled - Novo estado
   * @param {string} network - Rede do contrato
   * @returns {Promise<Object>}
   */
  async updateWhitelistEnabled(contractAddress, enabled, network) {
    try {
      const response = await api.post(`/api/stakes/${contractAddress}/set-whitelist-enabled`, {
        enabled,
        network
      });

      if (response.data.success) {
        // Atualizar metadata no banco após alteração bem-sucedida
        await this.refreshContractWhitelist(contractAddress, network);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to update whitelist status');
    } catch (error) {
      console.error('Error updating whitelist enabled:', error);
      throw error;
    }
  }

  /**
   * Adiciona endereços à whitelist de um contrato
   * @param {string} contractAddress - Endereço do contrato
   * @param {Array<string>} addresses - Endereços a adicionar
   * @param {string} network - Rede do contrato
   * @returns {Promise<Object>}
   */
  async addToWhitelist(contractAddress, addresses, network) {
    try {
      const response = await api.post(`/api/stakes/${contractAddress}/add-to-whitelist`, {
        addresses,
        network
      });

      if (response.data.success) {
        // Atualizar metadata no banco após alteração bem-sucedida
        await this.refreshContractWhitelist(contractAddress, network);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to add to whitelist');
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      throw error;
    }
  }

  /**
   * Remove endereços da whitelist de um contrato
   * @param {string} contractAddress - Endereço do contrato
   * @param {Array<string>} addresses - Endereços a remover
   * @param {string} network - Rede do contrato
   * @returns {Promise<Object>}
   */
  async removeFromWhitelist(contractAddress, addresses, network) {
    try {
      const response = await api.post(`/api/stakes/${contractAddress}/remove-from-whitelist`, {
        addresses,
        network
      });

      if (response.data.success) {
        // Atualizar metadata no banco após alteração bem-sucedida
        await this.refreshContractWhitelist(contractAddress, network);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to remove from whitelist');
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      throw error;
    }
  }

  /**
   * Limpa cache de um contrato específico
   * @param {string} contractAddress - Endereço do contrato
   */
  clearContractCache(contractAddress) {
    this.cache.delete(contractAddress);
  }

  /**
   * Limpa todo o cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Enriquece contratos com informação de autorização
   * @param {Array} contracts - Lista de contratos
   * @param {string} userAddress - Endereço do usuário
   * @returns {Array} - Contratos com campo isAuthorized
   */
  enrichContractsWithAuth(contracts, userAddress) {
    if (!Array.isArray(contracts)) {
      return [];
    }

    return contracts.map(contract => ({
      ...contract,
      isAuthorized: this.isUserAuthorized(contract, userAddress),
      whitelistInfo: {
        enabled: contract.metadata?.whitelistEnabled || false,
        userInList: contract.metadata?.whitelist?.some(
          addr => addr.toLowerCase() === userAddress?.toLowerCase()
        ) || false,
        totalAddresses: contract.metadata?.whitelist?.length || 0
      }
    }));
  }
}

// Exportar instância singleton
const whitelistService = new WhitelistService();
export default whitelistService;

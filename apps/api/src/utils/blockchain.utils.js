/**
 * Utilitários para operações blockchain
 */

/**
 * Retorna o endereço do token cBRL baseado na rede configurada
 * @returns {string} Endereço do contrato cBRL
 */
function getCBRLAddress() {
  const network = process.env.BLOCKCHAIN_NETWORK || 'testnet';

  if (network === 'mainnet') {
    return process.env.CBRL_MAINNET || '0x18e946548b2C24Ad371343086e424ABaC3393678';
  }

  // Default: testnet
  return process.env.CBRL_TESTNET || '0x0A8c73967e4Eee8ffA06484C3fBf65E6Ae3b9804';
}

/**
 * Retorna a URL do RPC baseado na rede configurada
 * @returns {string} URL do RPC
 */
function getRPCUrl() {
  const network = process.env.BLOCKCHAIN_NETWORK || 'testnet';

  if (network === 'mainnet') {
    return process.env.AZORE_RPC_URL || 'https://rpc-mainnet.azore.technology/';
  }

  // Default: testnet
  return process.env.AZORE_TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology/';
}

/**
 * Retorna a rede configurada
 * @returns {string} 'mainnet' ou 'testnet'
 */
function getBlockchainNetwork() {
  return process.env.BLOCKCHAIN_NETWORK || 'testnet';
}

/**
 * Verifica se está rodando em mainnet
 * @returns {boolean}
 */
function isMainnet() {
  return getBlockchainNetwork() === 'mainnet';
}

/**
 * Verifica se está rodando em testnet
 * @returns {boolean}
 */
function isTestnet() {
  return getBlockchainNetwork() === 'testnet';
}

module.exports = {
  getCBRLAddress,
  getRPCUrl,
  getBlockchainNetwork,
  isMainnet,
  isTestnet
};

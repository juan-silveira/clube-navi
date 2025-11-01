/**
 * Retorna o URL do explorer de blockchain baseado na rede
 * @param {string} network - Nome da rede (mainnet, testnet, etc.)
 * @returns {string} URL base do explorer
 */
export const getExplorerUrl = (network) => {
  const networkLower = (network || 'testnet').toLowerCase();

  // Mapeamento de redes para URLs de explorers
  const explorerUrls = {
    'mainnet': 'https://azorescan.com',
    'testnet': 'https://floripa.azorescan.com',
    'polygon': 'https://polygonscan.com',
    'polygon-testnet': 'https://mumbai.polygonscan.com',
    'mumbai': 'https://mumbai.polygonscan.com',
    'ethereum': 'https://etherscan.io',
    'goerli': 'https://goerli.etherscan.io',
    'sepolia': 'https://sepolia.etherscan.io'
  };

  return explorerUrls[networkLower] || 'https://floripa.azorescan.com';
};

/**
 * Retorna o URL completo para um endereço no explorer
 * @param {string} address - Endereço do contrato/wallet
 * @param {string} network - Nome da rede
 * @returns {string} URL completo do explorer
 */
export const getExplorerAddressUrl = (address, network) => {
  const baseUrl = getExplorerUrl(network);
  return `${baseUrl}/address/${address}`;
};

/**
 * Retorna o URL completo para uma transação no explorer
 * @param {string} txHash - Hash da transação
 * @param {string} network - Nome da rede
 * @returns {string} URL completo do explorer
 */
export const getExplorerTxUrl = (txHash, network) => {
  const baseUrl = getExplorerUrl(network);
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Retorna o nome formatado da rede
 * @param {string} network - Nome da rede
 * @returns {string} Nome formatado da rede
 */
export const getNetworkDisplayName = (network) => {
  const networkLower = (network || 'testnet').toLowerCase();

  const networkNames = {
    'mainnet': 'Azore Mainnet',
    'testnet': 'Azore Testnet (Floripa)',
    'polygon': 'Polygon Mainnet',
    'polygon-testnet': 'Polygon Testnet (Mumbai)',
    'mumbai': 'Mumbai Testnet',
    'ethereum': 'Ethereum Mainnet',
    'goerli': 'Goerli Testnet',
    'sepolia': 'Sepolia Testnet'
  };

  return networkNames[networkLower] || network || 'Unknown Network';
};

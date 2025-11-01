/**
 * Controller para configurações públicas da aplicação
 */

console.log('🔧 [Config] Config controller loaded');

// Cache em memória simples para evitar erro com Redis
let configCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 300000; // 5 minutos em milissegundos

/**
 * Obter configurações públicas da aplicação
 */
const getPublicConfig = async (req, res) => {
  try {
    console.log('🔧 [Config] getPublicConfig called');

    // Verificar cache em memória
    const now = Date.now();
    if (configCache && cacheTimestamp && (now - cacheTimestamp < CACHE_TTL)) {
      console.log('✅ [Config] Configurações obtidas do cache em memória');
      return res.json({
        success: true,
        data: configCache,
        message: 'Configurações obtidas com sucesso'
      });
    }

    // Gerar configurações do .env
    console.log('🔧 [Config] Gerando configurações do .env');

    const config = {
      defaultNetwork: process.env.DEFAULT_NETWORK || 'testnet',
      mainnetRpcUrl: process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology',
      testnetRpcUrl: process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology',
      mainnetChainId: parseInt(process.env.MAINNET_CHAIN_ID) || 8800,
      testnetChainId: parseInt(process.env.TESTNET_CHAIN_ID) || 88001,
      mainnetExplorerUrl: process.env.MAINNET_EXPLORER_URL || 'https://explorer-mainnet.azore.technology',
      testnetExplorerUrl: process.env.TESTNET_EXPLORER_URL || 'https://explorer-testnet.azore.technology',
    };

    // Salvar no cache em memória
    configCache = config;
    cacheTimestamp = now;

    console.log('✅ [Config] Configurações enviadas:', config);

    res.json({
      success: true,
      data: config,
      message: 'Configurações obtidas com sucesso'
    });
  } catch (error) {
    console.error('❌ [Config] Erro ao obter configurações:', error);
    console.error('❌ [Config] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
};

module.exports = {
  getPublicConfig,
};
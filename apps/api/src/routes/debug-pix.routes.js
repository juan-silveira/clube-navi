const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/debug/pix-config
 * @desc    Debug - Verificar configuração PIX
 * @access  Public (apenas para debug)
 */
router.get('/pix-config', (req, res) => {
  const config = {
    PIX_PROVIDER: process.env.PIX_PROVIDER || 'NOT_SET',
    PIX_FALLBACK_PROVIDER: process.env.PIX_FALLBACK_PROVIDER || 'NOT_SET',
    USE_PIX_MOCK: process.env.USE_PIX_MOCK || 'NOT_SET',
    EFI_CLIENT_ID: process.env.EFI_CLIENT_ID ? 'CONFIGURED' : 'NOT_SET',
    EFI_CLIENT_SECRET: process.env.EFI_CLIENT_SECRET ? 'CONFIGURED' : 'NOT_SET',
    EFI_CERTIFICATE_PATH: process.env.EFI_CERTIFICATE_PATH || 'NOT_SET',
    EFI_PIX_KEY: process.env.EFI_PIX_KEY || 'NOT_SET',
    ASAAS_API_KEY: process.env.ASAAS_API_KEY ? 'CONFIGURED' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    WORKING_DIR: process.cwd(),
    ENV_FILE_CHECK: require('fs').existsSync('/var/www/coinage/.env') ? 'EXISTS' : 'NOT_FOUND'
  };
  
  // Criar uma instância do PixService para ver o que ele está usando
  try {
    const PixService = require('../services/pix.service');
    const pixService = new PixService();
    
    config.PIX_SERVICE_INSTANCE = {
      provider: pixService.provider,
      isMockMode: pixService.isMockMode,
      hasApiKey: !!pixService.apiKey && pixService.apiKey !== 'mock_key',
      apiUrl: pixService.apiUrl
    };
  } catch (error) {
    config.PIX_SERVICE_ERROR = error.message;
  }
  
  res.json({
    success: true,
    message: 'Configuração PIX atual',
    data: config,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/debug/test-efi-pix
 * @desc    Debug - Testar criação de PIX com EFI
 * @access  Public (apenas para debug)
 */
router.post('/test-efi-pix', async (req, res) => {
  try {
    console.log('🧪 [DEBUG] Testando criação de PIX com EFI...');
    
    const PixService = require('../services/pix.service');
    const pixService = new PixService();
    
    const testData = {
      amount: 1.00,
      description: 'Teste EFI Pay Debug',
      userInfo: {
        name: 'Teste Debug',
        email: 'teste@debug.com',
        cpf: '00000000000',
        phone: '00000000000'
      },
      externalId: `debug_${Date.now()}`,
      expirationMinutes: 30
    };
    
    console.log('🧪 [DEBUG] Provider sendo usado:', pixService.provider);
    console.log('🧪 [DEBUG] Tentando criar cobrança...');
    
    const result = await pixService.createPixCharge(testData);
    
    res.json({
      success: true,
      message: 'PIX criado com sucesso',
      provider: pixService.provider,
      data: {
        paymentId: result.paymentId,
        provider: result.provider,
        hasQrCode: !!result.qrCodeImage,
        hasPixCode: !!result.pixCode,
        expiresAt: result.expiresAt
      }
    });
    
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao criar PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar PIX de teste',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
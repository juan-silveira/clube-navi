const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Rotas de teste para integração com Asaas
 */

/**
 * @route GET /api/asaas/test-connection
 * @desc Testar conexão com API do Asaas
 */
router.get('/test-connection', async (req, res) => {
  try {
    const apiKey = process.env.ASAAS_API_KEY;
    const apiUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
    
    if (!apiKey || apiKey === '$aact_YourSandboxApiKeyHere') {
      return res.status(400).json({
        success: false,
        message: 'API Key do Asaas não configurada',
        config: {
          hasApiKey: false,
          apiUrl,
          environment: apiUrl.includes('sandbox') ? 'sandbox' : 'production'
        }
      });
    }

    // Testar conexão com endpoint de cliente
    const response = await axios.get(`${apiUrl}/customers`, {
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 1
      }
    });

    res.json({
      success: true,
      message: 'Conexão com Asaas estabelecida com sucesso',
      config: {
        hasApiKey: true,
        apiUrl,
        environment: apiUrl.includes('sandbox') ? 'sandbox' : 'production',
        totalCustomers: response.data.totalCount || 0
      }
    });

  } catch (error) {
    console.error('❌ Erro ao testar conexão com Asaas:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com Asaas',
      error: error.response?.data?.errors || error.message,
      config: {
        apiUrl: process.env.ASAAS_API_URL || 'https://api.asaas.com/v3',
        environment: (process.env.ASAAS_API_URL || '').includes('sandbox') ? 'sandbox' : 'production'
      }
    });
  }
});

/**
 * @route GET /api/asaas/config
 * @desc Verificar configuração atual do Asaas
 */
router.get('/config', (req, res) => {
  const config = {
    provider: process.env.PIX_PROVIDER,
    apiUrl: process.env.ASAAS_API_URL || 'https://api.asaas.com/v3',
    hasApiKey: !!(process.env.ASAAS_API_KEY && process.env.ASAAS_API_KEY !== '$aact_YourSandboxApiKeyHere'),
    webhookUrl: process.env.ASAAS_WEBHOOK_URL,
    hasWebhookToken: !!process.env.ASAAS_WEBHOOK_TOKEN,
    pixExpiration: process.env.PIX_EXPIRATION_MINUTES || '30',
    depositFee: process.env.DEFAULT_DEPOSIT_FEE || '3.00',
    useMock: process.env.USE_PIX_MOCK === 'true',
    environment: (process.env.ASAAS_API_URL || '').includes('sandbox') ? 'sandbox' : 'production'
  };

  res.json({
    success: true,
    config,
    instructions: {
      production: {
        steps: [
          '1. Acesse https://www.asaas.com',
          '2. Vá em Configurações > Integrações > API',
          '3. Copie a API Key de produção',
          '4. Configure ASAAS_API_KEY no .env',
          '5. Mude ASAAS_API_URL para https://api.asaas.com/v3',
          '6. Configure webhook em Configurações > Webhooks',
          '7. Use a URL: ' + (process.env.ASAAS_WEBHOOK_URL || 'https://seu-dominio.com/api/asaas/webhook')
        ]
      }
    }
  });
});

/**
 * @route POST /api/asaas/create-customer
 * @desc Criar cliente de teste no Asaas
 */
router.post('/create-customer', async (req, res) => {
  try {
    const { name, cpf, email } = req.body;
    
    if (!name || !cpf || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome, CPF e email são obrigatórios'
      });
    }

    const apiKey = process.env.ASAAS_API_KEY;
    const apiUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

    const response = await axios.post(
      `${apiUrl}/customers`,
      {
        name,
        cpfCnpj: cpf.replace(/\D/g, ''),
        email,
        notificationDisabled: false
      },
      {
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: response.data
    });

  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente',
      error: error.response?.data?.errors || error.message
    });
  }
});

/**
 * @route POST /api/asaas/create-pix-test
 * @desc Criar cobrança PIX de teste
 */
router.post('/create-pix-test', async (req, res) => {
  try {
    const { value = 10.00, description = 'Teste PIX Clube Digital', customerEmail } = req.body;
    
    const apiKey = process.env.ASAAS_API_KEY;
    const apiUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

    // Primeiro, buscar ou criar cliente
    let customerId;
    
    if (customerEmail) {
      // Buscar cliente existente
      const customerSearch = await axios.get(`${apiUrl}/customers`, {
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json'
        },
        params: {
          email: customerEmail
        }
      });

      if (customerSearch.data.data && customerSearch.data.data.length > 0) {
        customerId = customerSearch.data.data[0].id;
      }
    }

    // Criar cobrança PIX
    const chargeData = {
      billingType: 'PIX',
      value,
      dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().split('T')[0], // 30 minutos
      description,
      externalReference: `TEST_${Date.now()}`
    };

    if (customerId) {
      chargeData.customer = customerId;
    }

    const response = await axios.post(
      `${apiUrl}/payments`,
      chargeData,
      {
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    // Buscar QR Code PIX
    const pixResponse = await axios.get(
      `${apiUrl}/payments/${response.data.id}/pixQrCode`,
      {
        headers: {
          'access_token': apiKey
        }
      }
    );

    res.json({
      success: true,
      message: 'Cobrança PIX criada com sucesso',
      data: {
        paymentId: response.data.id,
        value: response.data.value,
        status: response.data.status,
        pixCopyPaste: pixResponse.data.payload,
        pixQrCode: pixResponse.data.encodedImage,
        expirationDate: pixResponse.data.expirationDate
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar PIX:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cobrança PIX',
      error: error.response?.data?.errors || error.message
    });
  }
});

module.exports = router;
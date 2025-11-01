const axios = require('axios');
const crypto = require('crypto');

/**
 * Serviço PIX - Preparado para integração real mas usando mock
 * Suporta diferentes provedores PIX do Brasil
 */
class PixService {
  constructor() {
    // DEBUG COMPLETO DAS VARIÁVEIS DE AMBIENTE
    console.log('🔍 [PixService] Variáveis de ambiente na inicialização:', {
      PIX_PROVIDER: process.env.PIX_PROVIDER,
      PIX_FALLBACK_PROVIDER: process.env.PIX_FALLBACK_PROVIDER,
      USE_PIX_MOCK: process.env.USE_PIX_MOCK,
      EFI_CLIENT_ID: process.env.EFI_CLIENT_ID ? '***CONFIGURADO***' : 'NÃO CONFIGURADO',
      EFI_CLIENT_SECRET: process.env.EFI_CLIENT_SECRET ? '***CONFIGURADO***' : 'NÃO CONFIGURADO',
      EFI_PIX_KEY: process.env.EFI_PIX_KEY,
      ASAAS_API_KEY: process.env.ASAAS_API_KEY ? '***CONFIGURADO***' : 'NÃO CONFIGURADO',
      NODE_ENV: process.env.NODE_ENV
    });
    
    this.provider = process.env.PIX_PROVIDER || 'mock'; // 'efipay', 'pagarme', 'asaas', 'mock'
    this.apiUrl = process.env.PIX_API_URL || process.env.ASAAS_API_URL || 'https://api-pix.example.com';
    this.apiKey = process.env.PIX_API_KEY || process.env.ASAAS_API_KEY || 'mock_key';
    this.webhookSecret = process.env.PIX_WEBHOOK_SECRET || process.env.ASAAS_WEBHOOK_TOKEN || 'mock_secret';
    // Forçar uso do Asaas quando configurado
    this.isMockMode = this.provider === 'mock' && process.env.USE_PIX_MOCK !== 'false';
    
    // Debug log
    console.log('🔧 PIX Service Config FINAL:', {
      provider: this.provider,
      isMockMode: this.isMockMode,
      hasApiKey: !!this.apiKey && this.apiKey !== 'mock_key',
      apiUrl: this.apiUrl
    });
    
    // Configurações por provedor
    this.providerConfig = {
      efipay: {
        baseUrl: 'https://api-pix.gerencianet.com.br',
        endpoints: {
          charge: '/v2/cob',
          payment: '/v2/pix',
          webhook: '/v2/webhook'
        }
      },
      pagarme: {
        baseUrl: 'https://api.pagar.me',
        endpoints: {
          charge: '/core/v5/orders',
          payment: '/core/v5/transactions',
          webhook: '/core/v5/webhooks'
        }
      },
      asaas: {
        baseUrl: process.env.ASAAS_API_URL || 'https://api.asaas.com/v3',
        endpoints: {
          charge: '/payments',
          payment: '/payments',
          webhook: '/webhook'
        }
      }
    };
  }

  /**
   * Cria cobrança PIX para depósito (com fallback automático)
   */
  async createPixCharge(chargeData) {
    try {
      const { amount, description, userInfo, externalId, expirationMinutes = 30 } = chargeData;
      
      // Verificar novamente as variáveis de ambiente em tempo de execução
      const currentProvider = process.env.PIX_PROVIDER || this.provider;
      const fallbackProvider = process.env.PIX_FALLBACK_PROVIDER;
      const shouldUseMock = currentProvider === 'mock' || process.env.USE_PIX_MOCK === 'true';
      
      console.log(`💰 Creating PIX charge: R$ ${amount} for user ${userInfo.name}`);
      console.log(`📍 Provider: ${currentProvider}, Fallback: ${fallbackProvider}, Use Mock: ${shouldUseMock}`);
      
      if (shouldUseMock) {
        console.log('⚠️ Returning MOCK PIX charge');
        return this.createMockPixCharge(chargeData);
      }
      
      // Tentar com o provedor principal
      try {
        console.log(`🔄 Tentando com provedor principal: ${currentProvider}`);
        return await this.createChargeWithProvider(currentProvider, chargeData);
      } catch (primaryError) {
        console.error(`❌ Falha no provedor principal ${currentProvider}:`, primaryError.message);
        
        // Se houver fallback configurado, tentar com ele
        if (fallbackProvider && fallbackProvider !== currentProvider) {
          console.log(`🔄 Tentando com provedor fallback: ${fallbackProvider}`);
          try {
            const result = await this.createChargeWithProvider(fallbackProvider, chargeData);
            // Adicionar flag indicando que usou fallback
            result.usedFallback = true;
            result.fallbackProvider = fallbackProvider;
            return result;
          } catch (fallbackError) {
            console.error(`❌ Falha também no fallback ${fallbackProvider}:`, fallbackError.message);
            throw new Error(`Falha em ambos provedores PIX. Principal: ${primaryError.message}, Fallback: ${fallbackError.message}`);
          }
        }
        
        // Se não houver fallback, propagar o erro original
        throw primaryError;
      }
      
    } catch (error) {
      console.error('❌ Error creating PIX charge:', error);
      throw error;
    }
  }

  /**
   * Cria cobrança com um provedor específico
   */
  async createChargeWithProvider(provider, chargeData) {
    switch (provider) {
      case 'efipay':
        return await this.createEfiPayCharge(chargeData);
      case 'pagarme':
        return await this.createPagarMeCharge(chargeData);
      case 'asaas':
        console.log('✅ Calling Asaas API to create PIX charge');
        return await this.createAsaasCharge(chargeData);
      default:
        throw new Error(`Unsupported PIX provider: ${provider}`);
    }
  }

  /**
   * Verifica status de pagamento PIX (com fallback automático)
   */
  async checkPaymentStatus(paymentId) {
    try {
      console.log(`🔍 Checking PIX payment status: ${paymentId}`);
      
      // Verificar novamente as variáveis de ambiente em tempo de execução
      const currentProvider = process.env.PIX_PROVIDER || this.provider;
      const fallbackProvider = process.env.PIX_FALLBACK_PROVIDER;
      const shouldUseMock = currentProvider === 'mock' || process.env.USE_PIX_MOCK === 'true';
      
      if (shouldUseMock) {
        return this.checkMockPaymentStatus(paymentId);
      }
      
      // Tentar com o provedor principal
      try {
        return await this.checkStatusWithProvider(currentProvider, paymentId);
      } catch (primaryError) {
        console.error(`❌ Falha ao verificar status com ${currentProvider}:`, primaryError.message);
        
        // Se houver fallback e o erro indicar que o pagamento não foi encontrado
        if (fallbackProvider && fallbackProvider !== currentProvider) {
          console.log(`🔄 Tentando verificar com fallback: ${fallbackProvider}`);
          try {
            const result = await this.checkStatusWithProvider(fallbackProvider, paymentId);
            result.usedFallback = true;
            result.fallbackProvider = fallbackProvider;
            return result;
          } catch (fallbackError) {
            console.error(`❌ Falha também no fallback ${fallbackProvider}:`, fallbackError.message);
            // Retornar status padrão se ambos falharem
            return {
              status: 'pending',
              error: `Falha em ambos provedores`,
              provider: currentProvider
            };
          }
        }
        
        // Se não houver fallback, retornar erro padrão
        return {
          status: 'pending',
          error: primaryError.message,
          provider: currentProvider
        };
      }
      
    } catch (error) {
      console.error('❌ Error checking payment status:', error.message);
      // Retornar status padrão em caso de erro
      return {
        status: 'pending',
        error: error.message,
        provider: this.provider
      };
    }
  }

  /**
   * Verifica status com um provedor específico
   */
  async checkStatusWithProvider(provider, paymentId) {
    switch (provider) {
      case 'efipay':
        return await this.checkEfiPayStatus(paymentId);
      case 'pagarme':
        return await this.checkPagarMeStatus(paymentId);
      case 'asaas':
        return await this.checkAsaasStatus(paymentId);
      default:
        console.warn(`⚠️ Unsupported PIX provider: ${provider}, usando MOCK`);
        return this.checkMockPaymentStatus(paymentId);
    }
  }

  /**
   * Processa saque PIX
   */
  async processPixWithdrawal(withdrawalData) {
    try {
      const { amount, pixKey, pixKeyType, userInfo, externalId } = withdrawalData;
      
      console.log(`💸 Processing PIX withdrawal: R$ ${amount} to ${this.maskPixKey(pixKey)}`);
      
      if (this.isMockMode) {
        return this.processMockPixWithdrawal(withdrawalData);
      }
      
      // Implementação real baseada no provedor
      switch (this.provider) {
        case 'efipay':
          return await this.processEfiPayWithdrawal(withdrawalData);
        case 'pagarme':
          return await this.processPagarMeWithdrawal(withdrawalData);
        case 'asaas':
          return await this.processAsaasWithdrawal(withdrawalData);
        default:
          throw new Error(`Unsupported PIX provider: ${this.provider}`);
      }
      
    } catch (error) {
      console.error('❌ Error processing PIX withdrawal:', error);
      throw error;
    }
  }

  /**
   * MOCK IMPLEMENTATIONS
   */

  /**
   * Mock: Cria cobrança PIX
   */
  async createMockPixCharge(chargeData) {
    const { amount, description, userInfo, externalId, expirationMinutes = 30 } = chargeData;
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const paymentId = `pix_charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    
    // QR Code PIX mock (seria gerado pela API real)
    const pixCode = this.generateMockPixCode(amount, description, paymentId);
    
    return {
      success: true,
      paymentId,
      externalId,
      status: 'waiting_payment',
      amount: parseFloat(amount),
      description,
      pixCode,
      qrCodeImage: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`, // Pixel transparente
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      webhookUrl: `${process.env.API_BASE_URL}/api/webhooks/pix/${paymentId}`,
      provider: 'mock'
    };
  }

  /**
   * Mock: Verifica status do pagamento
   */
  async checkMockPaymentStatus(paymentId) {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Para mock, simular aprovação em 70% dos casos após 10 segundos
    const createdTime = this.extractTimeFromPaymentId(paymentId);
    const elapsed = Date.now() - createdTime;
    const shouldApprove = elapsed > 10000 && Math.random() > 0.3;
    
    if (shouldApprove) {
      return {
        success: true,
        paymentId,
        status: 'approved',
        paidAt: new Date().toISOString(),
        paidAmount: 100.00, // Mock amount
        endToEndId: `E${Date.now()}2023${Math.random().toString().substr(2, 8)}`,
        txId: `txid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: 'mock'
      };
    } else {
      return {
        success: true,
        paymentId,
        status: 'waiting_payment',
        provider: 'mock'
      };
    }
  }

  /**
   * Mock: Processa saque PIX
   */
  async processMockPixWithdrawal(withdrawalData) {
    const { amount, pixKey, pixKeyType, userInfo, externalId } = withdrawalData;
    
    // Simular delay do processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular sucesso em 90% dos casos
    const success = Math.random() > 0.1;
    
    if (success) {
      const withdrawalId = `pix_withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        withdrawalId,
        externalId,
        status: 'completed',
        amount: parseFloat(amount),
        pixKey: this.maskPixKey(pixKey),
        pixKeyType,
        endToEndId: `E${Date.now()}2023${Math.random().toString().substr(2, 8)}`,
        txId: `txid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processedAt: new Date().toISOString(),
        fee: 0.00, // Mock sem taxa
        provider: 'mock'
      };
    } else {
      return {
        success: false,
        error: 'PIX provider temporarily unavailable',
        errorCode: 'PROVIDER_ERROR',
        provider: 'mock'
      };
    }
  }

  /**
   * REAL PROVIDER IMPLEMENTATIONS (Templates prontos para integração)
   */

  /**
   * EfiPay (ex-Gerencianet) - Implementação real
   */
  async createEfiPayCharge(chargeData) {
    try {
      const { amount, description, userInfo, externalId, expirationMinutes = 30 } = chargeData;
      
      // Verificar configurações
      const clientId = process.env.EFI_CLIENT_ID;
      const clientSecret = process.env.EFI_CLIENT_SECRET;
      const certificatePath = process.env.EFI_CERTIFICATE_PATH;
      const pixKey = process.env.EFI_PIX_KEY;
      const sandbox = process.env.EFI_SANDBOX === 'true';
      
      if (!clientId || !clientSecret || !certificatePath || !pixKey) {
        console.error('❌ EFI configuração incompleta');
        throw new Error('EFI Pay não configurado. Verifique as variáveis de ambiente.');
      }
      
      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const fs = require('fs');
      const path = require('path');
      
      const options = {
        client_id: clientId,
        client_secret: clientSecret,
        certificate: path.resolve(certificatePath),
        sandbox: sandbox,
        validateMtls: false
      };
      
      const efipay = new EfiPay(options);
      
      // Gerar txid único - remover hífens do UUID e limitar a 35 caracteres
      const txid = externalId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 35);
      
      // Criar cobrança imediata
      const body = {
        calendario: {
          expiracao: expirationMinutes * 60 // em segundos
        },
        devedor: {
          cpf: userInfo.cpf?.replace(/\D/g, ''),
          nome: userInfo.name
        },
        valor: {
          original: amount.toFixed(2)
        },
        chave: pixKey,
        solicitacaoPagador: description || 'Depósito Coinage'
      };
      
      console.log(`🔄 Criando cobrança EFI: ${txid}`);

      // Criar a cobrança - EFI pode retornar um txid diferente
      const response = await efipay.pixCreateImmediateCharge({ txid }, body);

      if (!response || !response.pixCopiaECola) {
        throw new Error('Falha ao criar cobrança EFI');
      }

      // IMPORTANTE: Usar o txid retornado pela EFI, não o que enviamos
      const actualTxid = response.txid || txid;
      console.log(`✅ Cobrança criada com txid: ${actualTxid}`);

      // Gerar QR Code
      const qrCodeResponse = await efipay.pixGenerateQRCode({ id: response.loc.id });

      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      return {
        success: true,
        paymentId: actualTxid, // Usar o txid real retornado pela EFI
        pixCode: response.pixCopiaECola,
        qrCodeImage: qrCodeResponse?.imagemQrcode || null,
        expiresAt: expiresAt,
        status: 'pending',
        provider: 'efipay',
        amount: parseFloat(amount),
        metadata: {
          locId: response.loc?.id,
          location: response.location,
          txid: txid,
          status: response.status
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar cobrança EFI - Detalhes completos:');
      console.error('  Mensagem:', error.message);
      console.error('  Código:', error.code);
      if (error.response) {
        console.error('  Response data:', JSON.stringify(error.response.data || error.response, null, 2));
      }
      console.error('  Stack:', error.stack);
      
      // Extrair mensagem de erro mais específica
      let errorMessage = error.message || 'Erro desconhecido';
      if (error.response?.data?.mensagem) {
        errorMessage = error.response.data.mensagem;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error_description) {
        errorMessage = error.response.data.error_description;
      }
      
      throw new Error(`Falha ao criar PIX EFI: ${errorMessage}`);
    }
  }

  async checkEfiPayStatus(paymentId) {
    try {
      // Verificar configurações
      const clientId = process.env.EFI_CLIENT_ID;
      const clientSecret = process.env.EFI_CLIENT_SECRET;
      const certificatePath = process.env.EFI_CERTIFICATE_PATH;
      const sandbox = process.env.EFI_SANDBOX === 'true';
      
      if (!clientId || !clientSecret || !certificatePath) {
        throw new Error('EFI Pay não configurado');
      }
      
      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const path = require('path');
      
      const options = {
        client_id: clientId,
        client_secret: clientSecret,
        certificate: path.resolve(certificatePath),
        sandbox: sandbox,
        validateMtls: false
      };
      
      const efipay = new EfiPay(options);

      // Se o paymentId tem hífens (UUID), converter. Senão, usar como está (já é um txid válido)
      let txid = paymentId;
      if (paymentId.includes('-')) {
        // É um UUID, converter removendo hífens
        txid = paymentId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 35);
        console.log(`📝 Convertendo UUID ${paymentId} para txid ${txid}`);
      }

      // Consultar cobrança
      const response = await efipay.pixDetailCharge({ txid: txid });
      
      // Mapear status
      let status = 'pending';
      if (response.status === 'CONCLUIDA') {
        status = 'approved';
      } else if (response.status === 'REMOVIDA_PELO_USUARIO_RECEBEDOR' || response.status === 'REMOVIDA_PELO_PSP') {
        status = 'expired';
      }
      
      return {
        success: true,
        paymentId: paymentId,
        status: status,
        paidAt: response.pix?.[0]?.horario || null,
        paidAmount: response.pix?.[0]?.valor || null,
        endToEndId: response.pix?.[0]?.endToEndId || null,
        provider: 'efipay',
        originalStatus: response.status
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar status EFI:', error);
      
      // Se for erro 404, a cobrança não existe
      if (error.code === 'GN_NOT_FOUND') {
        return {
          success: false,
          status: 'not_found',
          message: 'Cobrança não encontrada na EFI',
          provider: 'efipay'
        };
      }
      
      throw new Error(`Falha ao verificar status EFI: ${error.message}`);
    }
  }

  async processEfiPayWithdrawal(withdrawalData) {
    try {
      const { amount, pixKey, pixKeyType, userInfo, externalId } = withdrawalData;
      
      // Verificar configurações
      const clientId = process.env.EFI_CLIENT_ID;
      const clientSecret = process.env.EFI_CLIENT_SECRET;
      const certificatePath = process.env.EFI_CERTIFICATE_PATH;
      const sandbox = process.env.EFI_SANDBOX === 'true';
      
      if (!clientId || !clientSecret || !certificatePath) {
        throw new Error('EFI Pay não configurado');
      }
      
      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const path = require('path');
      
      const options = {
        client_id: clientId,
        client_secret: clientSecret,
        certificate: path.resolve(certificatePath),
        sandbox: sandbox,
        validateMtls: false
      };
      
      const efipay = new EfiPay(options);
      
      // Preparar dados do envio PIX
      const body = {
        valor: amount.toFixed(2),
        pagador: {
          chave: process.env.EFI_PIX_KEY
        },
        favorecido: {
          chave: pixKey
        }
      };
      
      // Gerar idEnvio único
      const idEnvio = `${externalId}_${Date.now()}`.replace(/[^a-zA-Z0-9]/g, '').substring(0, 35);
      
      console.log(`💸 Enviando PIX EFI: ${idEnvio}`);
      
      // Enviar PIX
      const response = await efipay.pixSend({ idEnvio }, body);
      
      return {
        success: true,
        transactionId: idEnvio,
        status: response.status || 'processing',
        endToEndId: response.endToEndId,
        amount: parseFloat(amount),
        provider: 'efipay',
        metadata: response
      };
      
    } catch (error) {
      console.error('❌ Erro ao processar saque EFI:', error);
      throw new Error(`Falha ao processar saque EFI: ${error.message}`);
    }
  }

  /**
   * Pagar.me - Implementação real
   */
  async createPagarMeCharge(chargeData) {
    // TODO: Implementar integração real com Pagar.me
    // Documentação: https://docs.pagar.me/
    
    throw new Error('Pagar.me integration not implemented yet');
  }

  async checkPagarMeStatus(paymentId) {
    // TODO: Implementar verificação de status Pagar.me
    throw new Error('Pagar.me integration not implemented yet');
  }

  async processPagarMeWithdrawal(withdrawalData) {
    // TODO: Implementar saque Pagar.me
    throw new Error('Pagar.me integration not implemented yet');
  }

  /**
   * Asaas - Implementação real
   */
  async createAsaasCharge(chargeData) {
    try {
      const { amount, description, userInfo, externalId, expirationMinutes = 30 } = chargeData;
      
      // Configuração da API Asaas
      const config = this.providerConfig.asaas;
      const apiKey = process.env.ASAAS_API_KEY || this.apiKey;
      
      // Verificar se API Key está configurada corretamente
      if (!apiKey || apiKey === 'mock_key') {
        console.error('❌ Asaas API Key não configurada');
        throw new Error('PIX temporariamente indisponível. Configure a API Key do Asaas.');
      }
      
      console.log('🔑 Usando Asaas API');
      console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 30)}...` : 'NOT SET');
      console.log('🌐 API URL:', config.baseUrl);
      
      // Calcular data de vencimento
      const dueDate = new Date();
      dueDate.setMinutes(dueDate.getMinutes() + expirationMinutes);
      
      // Criar cliente no Asaas se necessário
      let customerId = userInfo.asaasCustomerId;
      if (!customerId) {
        const customerResponse = await axios.post(
          `${config.baseUrl}/customers`,
          {
            name: userInfo.name,
            email: userInfo.email,
            cpfCnpj: userInfo.cpf?.replace(/\D/g, ''),
            mobilePhone: userInfo.phone,
            externalReference: userInfo.id
          },
          {
            headers: {
              'access_token': apiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        customerId = customerResponse.data.id;
      }
      
      // Criar cobrança PIX no Asaas
      const paymentResponse = await axios.post(
        `${config.baseUrl}/payments`,
        {
          customer: customerId,
          billingType: 'PIX',
          value: amount,
          dueDate: dueDate.toISOString().split('T')[0],
          description: description || `Depósito PIX - ${userInfo.name}`,
          externalReference: externalId,
          discount: {
            value: 0,
            dueDateLimitDays: 0
          },
          fine: {
            value: 0
          },
          interest: {
            value: 0
          }
        },
        {
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const payment = paymentResponse.data;
      
      // Buscar QR Code do PIX
      const qrCodeResponse = await axios.get(
        `${config.baseUrl}/payments/${payment.id}/pixQrCode`,
        {
          headers: {
            'access_token': apiKey
          }
        }
      );
      
      const qrCodeData = qrCodeResponse.data;
      
      return {
        success: true,
        paymentId: payment.id,
        externalId: externalId,
        status: 'waiting_payment',
        amount: payment.value,
        description: payment.description,
        pixCode: qrCodeData.payload,
        qrCodeImage: qrCodeData.encodedImage,
        expiresAt: qrCodeData.expirationDate,
        createdAt: payment.dateCreated,
        webhookUrl: payment.invoiceUrl,
        provider: 'asaas',
        asaasData: {
          customerId: customerId,
          invoiceUrl: payment.invoiceUrl,
          bankSlipUrl: payment.bankSlipUrl
        }
      };
      
    } catch (error) {
      console.error('❌ Error creating Asaas PIX charge:', error.response?.data || error.message);
      throw new Error(`Asaas PIX creation failed: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }

  async checkAsaasStatus(paymentId) {
    try {
      const config = this.providerConfig.asaas;
      const apiKey = process.env.ASAAS_API_KEY || this.apiKey;
      
      // Verificar se API Key está configurada corretamente
      if (!apiKey || apiKey === 'mock_key') {
        console.error('❌ Asaas API Key não configurada');
        throw new Error('PIX temporariamente indisponível. Configure a API Key do Asaas.');
      }
      
      // Usar URL de produção sempre que não for explicitamente sandbox
      const apiUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
      console.log(`🔍 Checking Asaas payment status at: ${apiUrl}/payments/${paymentId}`);
      
      const response = await axios.get(
        `${apiUrl}/payments/${paymentId}`,
        {
          headers: {
            'access_token': apiKey
          }
        }
      );
      
      const payment = response.data;
      
      // Mapear status do Asaas para nosso padrão
      let status = 'waiting_payment';
      if (payment.status === 'CONFIRMED' || payment.status === 'RECEIVED') {
        status = 'approved';
      } else if (payment.status === 'OVERDUE' || payment.status === 'CANCELLED') {
        status = 'expired';
      }
      
      return {
        success: true,
        paymentId: payment.id,
        status: status,
        paidAt: payment.confirmedDate || payment.paymentDate,
        paidAmount: payment.value,
        endToEndId: payment.transactionReceiptUrl,
        txId: payment.id,
        provider: 'asaas',
        originalStatus: payment.status,
        netValue: payment.netValue
      };
      
    } catch (error) {
      console.error('❌ Error checking Asaas payment status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        headers: error.config?.headers
      });
      
      // Se for erro 401, a chave está inválida
      if (error.response?.status === 401) {
        throw new Error('Chave API Asaas inválida. Verifique a configuração.');
      }
      
      // Se for erro 404, o pagamento não existe
      if (error.response?.status === 404) {
        return {
          success: false,
          status: 'not_found',
          message: 'Pagamento não encontrado no Asaas',
          provider: 'asaas'
        };
      }
      
      throw new Error(`Asaas status check failed: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }

  async processAsaasWithdrawal(withdrawalData) {
    try {
      const { amount, pixKey, pixKeyType, userInfo, externalId } = withdrawalData;
      
      const config = this.providerConfig.asaas;
      const apiKey = process.env.ASAAS_API_KEY || this.apiKey;
      
      // Criar transferência PIX no Asaas
      const transferResponse = await axios.post(
        `${config.baseUrl}/transfers`,
        {
          value: amount,
          bankAccount: {
            bank: {
              ispb: "00000000" // ISPB do banco será detectado automaticamente pelo Asaas
            },
            accountName: userInfo.name,
            ownerName: userInfo.name,
            cpfCnpj: userInfo.cpf?.replace(/\D/g, ''),
            pixAddressKey: {
              key: pixKey,
              type: this.mapPixKeyTypeToAsaas(pixKeyType)
            }
          },
          operationType: 'PIX',
          description: `Saque PIX - ${userInfo.name}`,
          externalReference: externalId
        },
        {
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const transfer = transferResponse.data;
      
      return {
        success: true,
        withdrawalId: transfer.id,
        externalId: externalId,
        status: transfer.status === 'DONE' ? 'completed' : 'processing',
        amount: transfer.value,
        pixKey: this.maskPixKey(pixKey),
        pixKeyType: pixKeyType,
        endToEndId: transfer.transactionReceiptUrl,
        txId: transfer.id,
        processedAt: transfer.transferDate || new Date().toISOString(),
        fee: transfer.transferFee || 0,
        provider: 'asaas',
        asaasData: {
          status: transfer.status,
          bankAccountId: transfer.bankAccount?.id
        }
      };
      
    } catch (error) {
      console.error('❌ Error processing Asaas withdrawal:', error.response?.data || error.message);
      
      // Tratar erros específicos do Asaas
      if (error.response?.data?.errors) {
        const asaasError = error.response.data.errors[0];
        return {
          success: false,
          error: asaasError.description,
          errorCode: asaasError.code,
          provider: 'asaas'
        };
      }
      
      throw new Error(`Asaas withdrawal failed: ${error.message}`);
    }
  }

  /**
   * Mapeia tipo de chave PIX para o formato Asaas
   */
  mapPixKeyTypeToAsaas(type) {
    const typeMap = {
      'cpf': 'CPF',
      'cnpj': 'CNPJ',
      'email': 'EMAIL',
      'phone': 'PHONE',
      'random': 'EVP'
    };
    return typeMap[type] || 'EVP';
  }

  /**
   * UTILITY METHODS
   */

  /**
   * Gera código PIX mock
   */
  generateMockPixCode(amount, description, paymentId) {
    // PIX code simplificado para mock
    const payload = `${paymentId}|${amount}|${description}`;
    return `00020126${payload.length.toString().padStart(2, '0')}${payload}5303986540${amount.toFixed(2)}5802BR6009SAO PAULO62070503***6304`;
  }

  /**
   * Extrai timestamp do paymentId para simulação
   */
  extractTimeFromPaymentId(paymentId) {
    const match = paymentId.match(/(\d+)/);
    return match ? parseInt(match[1]) : Date.now();
  }

  /**
   * Mascara chave PIX
   */
  maskPixKey(pixKey) {
    if (!pixKey) return '';
    
    if (pixKey.includes('@')) {
      // Email
      const [username, domain] = pixKey.split('@');
      return `${username.substring(0, 2)}***@${domain}`;
    } else if (pixKey.length === 11) {
      // CPF
      return `***${pixKey.slice(-3)}`;
    } else if (pixKey.length === 14) {
      // CNPJ
      return `***${pixKey.slice(-4)}`;
    } else {
      // Telefone ou aleatória
      return `***${pixKey.slice(-4)}`;
    }
  }

  /**
   * Valida chave PIX
   */
  validatePixKey(pixKey, type) {
    if (!pixKey) return false;
    
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
      case 'cpf':
        return /^\d{11}$/.test(pixKey.replace(/\D/g, ''));
      case 'cnpj':
        return /^\d{14}$/.test(pixKey.replace(/\D/g, ''));
      case 'phone':
        return /^\+55\d{10,11}$/.test(pixKey.replace(/\D/g, ''));
      case 'random':
        return /^[a-f0-9-]{36}$/.test(pixKey);
      default:
        return false;
    }
  }

  /**
   * Detecta tipo de chave PIX
   */
  detectPixKeyType(pixKey) {
    if (!pixKey) return null;
    
    const cleaned = pixKey.replace(/\D/g, '');
    
    if (pixKey.includes('@')) return 'email';
    if (cleaned.length === 11) return 'cpf';
    if (cleaned.length === 14) return 'cnpj';
    if (cleaned.length >= 10 && cleaned.length <= 11 && pixKey.includes('+55')) return 'phone';
    if (/^[a-f0-9-]{36}$/.test(pixKey)) return 'random';
    
    return 'unknown';
  }

  /**
   * Calcula taxa PIX (se aplicável)
   */
  calculatePixFee(amount, operation = 'withdrawal') {
    // Mock: sem taxa para depósitos, taxa fixa para saques
    if (operation === 'deposit') return 0;
    if (operation === 'withdrawal') return 1.0; // Usar taxa padrão do banco
    return 0;
  }

  /**
   * Health check do serviço PIX
   */
  async healthCheck() {
    try {
      if (this.isMockMode) {
        return {
          healthy: true,
          provider: 'mock',
          status: 'operational',
          timestamp: new Date().toISOString()
        };
      }
      
      // Para provedores reais, fazer ping na API
      const response = await axios.get(`${this.apiUrl}/health`, {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return {
        healthy: response.status === 200,
        provider: this.provider,
        status: response.data?.status || 'unknown',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        healthy: false,
        provider: this.provider,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = PixService;
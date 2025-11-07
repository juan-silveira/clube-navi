const axios = require('axios');
const crypto = require('crypto');

/**
 * Serviço PIX - Integração com EFI Pay (Gerencianet)
 * Suporta depósitos via cobrança PIX e saques via envio PIX
 */
class PixService {
  constructor() {
    // DEBUG das variáveis de ambiente
    console.log('🔍 [PixService] Variáveis de ambiente na inicialização:', {
      EFI_CLIENT_ID: process.env.EFI_CLIENT_ID ? '***CONFIGURADO***' : 'NÃO CONFIGURADO',
      EFI_CLIENT_SECRET: process.env.EFI_CLIENT_SECRET ? '***CONFIGURADO***' : 'NÃO CONFIGURADO',
      EFI_CERTIFICATE_PATH: process.env.EFI_CERTIFICATE_PATH || 'NÃO CONFIGURADO',
      EFI_PIX_KEY: process.env.EFI_PIX_KEY,
      EFI_SANDBOX: process.env.EFI_SANDBOX,
      NODE_ENV: process.env.NODE_ENV
    });

    // Configuração EFI Pay
    this.provider = 'efipay';
    this.isSandbox = process.env.EFI_SANDBOX === 'true';
    this.clientId = process.env.EFI_CLIENT_ID;
    this.clientSecret = process.env.EFI_CLIENT_SECRET;
    this.certificatePath = process.env.EFI_CERTIFICATE_PATH;
    this.pixKey = process.env.EFI_PIX_KEY;

    // Verificar configuração
    this.isConfigured = !!(this.clientId && this.clientSecret && this.certificatePath && this.pixKey);

    console.log('🔧 PIX Service Config:', {
      provider: this.provider,
      isSandbox: this.isSandbox,
      isConfigured: this.isConfigured
    });
  }

  /**
   * Verifica se o serviço está configurado
   */
  checkConfiguration() {
    if (!this.isConfigured) {
      throw new Error('EFI Pay não configurado. Verifique: EFI_CLIENT_ID, EFI_CLIENT_SECRET, EFI_CERTIFICATE_PATH, EFI_PIX_KEY');
    }
  }

  /**
   * Cria cobrança PIX para depósito
   */
  async createPixCharge(chargeData) {
    try {
      const { amount, description, userInfo, externalId, expirationMinutes = 30 } = chargeData;

      console.log(`💰 Creating PIX charge: R$ ${amount} for user ${userInfo.name}`);

      this.checkConfiguration();

      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const fs = require('fs');
      const path = require('path');

      const options = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        certificate: path.resolve(this.certificatePath),
        sandbox: this.isSandbox,
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
        chave: this.pixKey,
        solicitacaoPagador: description || 'Depósito Clube Digital'
      };

      console.log(`🔄 Criando cobrança EFI: ${txid}`);

      // Criar a cobrança
      const response = await efipay.pixCreateImmediateCharge({ txid }, body);

      if (!response || !response.pixCopiaECola) {
        throw new Error('Falha ao criar cobrança EFI');
      }

      // Usar o txid retornado pela EFI
      const actualTxid = response.txid || txid;
      console.log(`✅ Cobrança criada com txid: ${actualTxid}`);

      // Gerar QR Code
      const qrCodeResponse = await efipay.pixGenerateQRCode({ id: response.loc.id });

      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      return {
        success: true,
        paymentId: actualTxid,
        pixCode: response.pixCopiaECola,
        qrCodeImage: qrCodeResponse?.imagemQrcode || null,
        expiresAt: expiresAt,
        status: 'pending',
        provider: 'efipay',
        amount: parseFloat(amount),
        metadata: {
          locId: response.loc?.id,
          location: response.location,
          txid: actualTxid,
          status: response.status
        }
      };

    } catch (error) {
      console.error('❌ Erro ao criar cobrança EFI:', error);

      // Extrair mensagem de erro
      let errorMessage = error?.message || 'Erro desconhecido';

      if (error?.error_description) {
        errorMessage = `${error.error}: ${error.error_description}`;
      } else if (error?.response?.data?.mensagem) {
        errorMessage = error.response.data.mensagem;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.error_description) {
        errorMessage = error.response.data.error_description;
      }

      throw new Error(`Falha ao criar PIX EFI: ${errorMessage}`);
    }
  }

  /**
   * Verifica status de pagamento PIX
   */
  async checkPaymentStatus(paymentId) {
    try {
      console.log(`🔍 Checking PIX payment status: ${paymentId}`);

      this.checkConfiguration();

      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const path = require('path');

      const options = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        certificate: path.resolve(this.certificatePath),
        sandbox: this.isSandbox,
        validateMtls: false
      };

      const efipay = new EfiPay(options);

      // Consultar cobrança PIX
      const response = await efipay.pixDetailCharge({ txid: paymentId });

      // Mapear status da EFI para nosso sistema
      let status = 'pending';
      if (response.status === 'CONCLUIDA') {
        status = 'paid';
      } else if (response.status === 'ATIVA') {
        status = 'pending';
      } else if (response.status === 'REMOVIDA_PELO_USUARIO_RECEBEDOR' ||
                 response.status === 'REMOVIDA_PELO_PSP') {
        status = 'expired';
      }

      const result = {
        success: true,
        status,
        paymentId,
        provider: 'efipay',
        pixCopiaECola: response.pixCopiaECola,
        metadata: {
          efiStatus: response.status,
          valor: response.valor?.original,
          chave: response.chave,
          horarioCriacao: response.calendario?.criacao,
          expiracao: response.calendario?.expiracao
        }
      };

      // Se pago, incluir informações do pagamento
      if (status === 'paid' && response.pix && response.pix.length > 0) {
        const pix = response.pix[0];
        result.paidAt = pix.horario;
        result.amount = parseFloat(pix.valor);
        result.e2eId = pix.endToEndId;
      }

      return result;

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error?.message);

      // Retornar status padrão em caso de erro
      return {
        success: false,
        status: 'pending',
        error: error?.message || 'Erro ao verificar status',
        provider: 'efipay'
      };
    }
  }

  /**
   * Processa saque PIX
   */
  async processPixWithdrawal(withdrawalData) {
    try {
      const { amount, pixKey, pixKeyType, userInfo, externalId } = withdrawalData;

      console.log(`💸 Processing PIX withdrawal: R$ ${amount} to ${this.maskPixKey(pixKey)}`);

      this.checkConfiguration();

      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const path = require('path');

      const options = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        certificate: path.resolve(this.certificatePath),
        sandbox: this.isSandbox,
        validateMtls: false
      };

      const efipay = new EfiPay(options);

      // Preparar dados do envio PIX
      const body = {
        valor: amount.toFixed(2),
        pagador: {
          chave: this.pixKey
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
        pixKey: this.maskPixKey(pixKey),
        provider: 'efipay',
        processedAt: new Date().toISOString(),
        metadata: response
      };

    } catch (error) {
      console.error('❌ Erro ao processar saque PIX:', error);

      let errorMessage = error?.message || 'Erro desconhecido';

      if (error?.error_description) {
        errorMessage = `${error.error}: ${error.error_description}`;
      } else if (error?.response?.data?.mensagem) {
        errorMessage = error.response.data.mensagem;
      }

      throw new Error(`Falha ao processar saque PIX: ${errorMessage}`);
    }
  }

  /**
   * Valida chave PIX
   */
  async validatePixKey(pixKey, pixKeyType) {
    try {
      console.log(`🔍 Validando chave PIX: ${this.maskPixKey(pixKey)} (${pixKeyType})`);

      // Validação básica de formato
      const validation = this.validatePixKeyFormat(pixKey, pixKeyType);
      if (!validation.valid) {
        return {
          success: false,
          valid: false,
          error: validation.error
        };
      }

      this.checkConfiguration();

      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const path = require('path');

      const options = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        certificate: path.resolve(this.certificatePath),
        sandbox: this.isSandbox,
        validateMtls: false
      };

      const efipay = new EfiPay(options);

      // Consultar dados da chave PIX no DICT
      const response = await efipay.pixDetailDictKey({ chave: pixKey });

      if (response && response.Nome) {
        return {
          success: true,
          valid: true,
          pixKey,
          pixKeyType,
          holder: {
            name: response.Nome,
            cpfCnpj: response.Pessoa?.Cpf || response.Pessoa?.Cnpj,
            personType: response.Pessoa?.Tipo // 'NATURAL_PERSON' ou 'LEGAL_PERSON'
          },
          provider: 'efipay'
        };
      }

      return {
        success: false,
        valid: false,
        error: 'Chave PIX não encontrada'
      };

    } catch (error) {
      console.error('❌ Erro ao validar chave PIX:', error?.message);

      // Se a chave não existe ou é inválida
      if (error?.code === 404 || error?.response?.status === 404) {
        return {
          success: false,
          valid: false,
          error: 'Chave PIX não encontrada ou inválida'
        };
      }

      return {
        success: false,
        valid: false,
        error: error?.message || 'Erro ao validar chave PIX'
      };
    }
  }

  /**
   * Valida formato da chave PIX
   */
  validatePixKeyFormat(pixKey, pixKeyType) {
    const cleanKey = pixKey.replace(/\D/g, '');

    switch (pixKeyType) {
      case 'cpf':
        if (cleanKey.length !== 11) {
          return { valid: false, error: 'CPF deve ter 11 dígitos' };
        }
        return { valid: true };

      case 'cnpj':
        if (cleanKey.length !== 14) {
          return { valid: false, error: 'CNPJ deve ter 14 dígitos' };
        }
        return { valid: true };

      case 'phone':
        if (cleanKey.length < 10 || cleanKey.length > 11) {
          return { valid: false, error: 'Telefone inválido' };
        }
        return { valid: true };

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(pixKey)) {
          return { valid: false, error: 'Email inválido' };
        }
        return { valid: true };

      case 'random':
        if (pixKey.length < 32) {
          return { valid: false, error: 'Chave aleatória inválida' };
        }
        return { valid: true };

      default:
        return { valid: false, error: 'Tipo de chave inválido' };
    }
  }

  /**
   * Verifica webhook de pagamento
   */
  async verifyWebhook(payload, signature) {
    try {
      // EFI usa HMAC SHA256 para assinar webhooks
      const webhookSecret = process.env.EFI_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.warn('⚠️ EFI_WEBHOOK_SECRET não configurado, pulando verificação');
        return true;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Erro ao verificar webhook:', error);
      return false;
    }
  }

  /**
   * Processa webhook de pagamento recebido
   */
  async processWebhook(payload) {
    try {
      console.log('📨 Processando webhook EFI:', payload);

      // Estrutura do webhook EFI:
      // { pix: [{ endToEndId, txid, valor, horario, infoPagador }] }

      if (!payload.pix || !Array.isArray(payload.pix) || payload.pix.length === 0) {
        throw new Error('Webhook inválido: campo pix ausente');
      }

      const pix = payload.pix[0];

      return {
        success: true,
        paymentId: pix.txid,
        endToEndId: pix.endToEndId,
        amount: parseFloat(pix.valor),
        paidAt: pix.horario,
        status: 'paid',
        provider: 'efipay',
        payerInfo: pix.infoPagador
      };

    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      throw error;
    }
  }

  /**
   * Máscara para chave PIX (segurança)
   */
  maskPixKey(pixKey) {
    if (!pixKey) return '***';

    if (pixKey.includes('@')) {
      // Email
      const [name, domain] = pixKey.split('@');
      return `${name.substring(0, 2)}***@${domain}`;
    } else if (pixKey.length === 11) {
      // CPF
      return `***${pixKey.substring(7, 11)}`;
    } else if (pixKey.length === 14) {
      // CNPJ
      return `***${pixKey.substring(10, 14)}`;
    } else if (pixKey.length > 10) {
      // Telefone ou chave aleatória
      return `***${pixKey.substring(pixKey.length - 4)}`;
    }

    return '***';
  }
}

module.exports = new PixService();

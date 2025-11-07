const depositService = require('../services/deposit.service');
const userActionsService = require('../services/userActions.service');
const userTaxesService = require('../services/userTaxes.service');
const pixService = require('../services/pix.service');
const mintService = require('../services/mint.service');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

class DepositController {
  constructor() {
    this.depositService = depositService; // Usar instância singleton
  }

  /**
   * @swagger
   * /api/deposits/pix:
   *   post:
   *     summary: Criar depósito PIX
   *     description: Inicia um novo processo de depósito PIX convertendo BRL para cBRL
   *     tags: [Deposits]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - userId
   *             properties:
   *               amount:
   *                 type: number
   *                 minimum: 10
   *                 description: Valor do depósito em BRL (mínimo R$ 10,00)
   *                 example: 100.00
   *               userId:
   *                 type: string
   *                 format: uuid
   *                 description: ID do usuário
   *               description:
   *                 type: string
   *                 description: Descrição opcional do depósito
   *                 example: "Depósito para compra de cBRL"
   *     responses:
   *       201:
   *         description: Depósito criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Depósito iniciado com sucesso"
   *                 data:
   *                   type: object
   *                   properties:
   *                     deposit:
   *                       $ref: '#/components/schemas/Deposit'
   *                     pixPayment:
   *                       type: object
   *                       properties:
   *                         paymentId:
   *                           type: string
   *                           description: ID do pagamento PIX
   *                         qrCode:
   *                           type: string
   *                           description: Código QR para pagamento
   *                         pixKey:
   *                           type: string
   *                           description: Chave PIX para pagamento manual
   *                         expiresAt:
   *                           type: string
   *                           format: date-time
   *                           description: Data de expiração
   *       400:
   *         description: Dados inválidos
   *       403:
   *         description: Email não confirmado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Por favor, confirme seu email antes de continuar"
   *                 code:
   *                   type: string
   *                   example: "EMAIL_NOT_CONFIRMED"
   *       401:
   *         description: Token inválido ou expirado
   *       500:
   *         description: Erro interno do servidor
   */
  async initiateDeposit(req, res) {
    try {
      const { amount, userId } = req.body;
      
      // Validações
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor inválido para depósito'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      // Iniciar processo de depósito
      const result = await this.depositService.initiateDeposit(amount, userId);
      
      // Registrar ação de depósito iniciado
      await userActionsService.logFinancial(userId, 'deposit_initiated', req, {
        status: 'pending',
        amount,
        currency: 'BRL',
        method: 'pix',
        transactionId: result.transactionId,
        details: {
          depositId: result.transactionId,
          amount: result.amount
        }
      });
      
      res.json({
        success: true,
        message: 'Depósito iniciado com sucesso',
        data: {
          transactionId: result.transactionId,
          amount: result.amount,
          totalAmount: result.totalAmount,
          fee: result.fee,
          status: result.status,
          pixPaymentId: result.pixPaymentId,
          pixData: result.pixData
        }
      });

    } catch (error) {
      console.error('Erro ao iniciar depósito:', error);
      
      // Registrar falha no depósito
      if (req.body.userId) {
        await userActionsService.logFinancial(req.body.userId, 'deposit_failed', req, {
          status: 'failed',
          amount: req.body.amount,
          errorMessage: error.message,
          errorCode: 'DEPOSIT_INITIATION_ERROR'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Confirmar depósito PIX
   */
  async confirmPixDeposit(req, res) {
    try {
      const { transactionId, pixData } = req.body;
      
      // Validações
      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação é obrigatório'
        });
      }

      // Confirmar PIX
      const result = await this.depositService.confirmPixDeposit(transactionId, pixData);
      
      res.json({
        success: true,
        message: 'PIX confirmado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro ao confirmar PIX:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao confirmar PIX',
        error: error.message
      });
    }
  }

  /**
   * Confirmar depósito na blockchain
   */
  async confirmBlockchainDeposit(req, res) {
    try {
      const { transactionId, txHash, blockNumber, fromAddress, toAddress, gasUsed } = req.body;
      
      // Validações
      if (!transactionId || !txHash) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação e hash da blockchain são obrigatórios'
        });
      }

      // Confirmar blockchain
      const blockchainData = {
        txHash,
        blockNumber,
        fromAddress,
        toAddress,
        gasUsed
      };
      
      const result = await this.depositService.confirmBlockchainMint(transactionId, blockchainData);
      
      res.json({
        success: true,
        message: 'Mint blockchain confirmado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro ao confirmar blockchain:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter status de um depósito
   */
  async getDepositStatus(req, res) {
    try {
      const { transactionId } = req.params;
      
      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação é obrigatório'
        });
      }

      const status = await this.depositService.getDepositStatus(transactionId);
      
      // Se tem PIX, buscar dados completos para exibir
      if (status.pixPaymentId) {
        const deposit = await prisma.transaction.findUnique({
          where: { id: transactionId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                phone: true
              }
            }
          }
        });
        
        // Se não tem QR Code no metadata mas tem PIX ID, tentar buscar no Asaas
        if ((!deposit.metadata?.pixCode || !deposit.metadata?.qrCodeImage) && deposit.pix_transaction_id) {
          try {
            const axios = require('axios');
            const apiKey = process.env.ASAAS_API_KEY;
            const apiUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
            
            console.log(`🔄 Buscando QR Code para PIX ${deposit.pix_transaction_id}`);
            
            const qrCodeResponse = await axios.get(
              `${apiUrl}/payments/${deposit.pix_transaction_id}/pixQrCode`,
              {
                headers: {
                  'access_token': apiKey
                }
              }
            );
            
            const qrCodeData = qrCodeResponse.data;
            
            // Atualizar metadata com QR Code recuperado
            await prisma.transaction.update({
              where: { id: transactionId },
              data: {
                metadata: {
                  ...deposit.metadata,
                  pixCode: qrCodeData.payload,
                  qrCodeImage: qrCodeData.encodedImage,
                  expiresAt: qrCodeData.expirationDate
                }
              }
            });
            
            // Atualizar objeto local
            deposit.metadata = {
              ...deposit.metadata,
              pixCode: qrCodeData.payload,
              qrCodeImage: qrCodeData.encodedImage,
              expiresAt: qrCodeData.expirationDate
            };
            
            console.log(`✅ QR Code recuperado e salvo para transação ${transactionId}`);
            
          } catch (error) {
            console.error('Erro ao buscar QR Code no Asaas:', error.response?.data || error.message);
          }
        }
        
        // Calcular valores - se não tem fee, assume padrão de R$ 3
        const defaultFee = 3.00;
        const feeAmount = deposit.fee ? parseFloat(deposit.fee) : defaultFee;
        const baseAmount = parseFloat(deposit.amount);
        const totalAmount = baseAmount + feeAmount;
        
        console.log(`💰 Valores da transação ${deposit.id}:`);
        console.log(`   Base: R$ ${baseAmount.toFixed(2)}`);
        console.log(`   Taxa: R$ ${feeAmount.toFixed(2)}`);
        console.log(`   Total: R$ ${totalAmount.toFixed(2)}`);
        console.log(`   Metadata existe? ${!!deposit.metadata}`);
        console.log(`   pixCode existe? ${!!deposit.metadata?.pixCode}`);
        console.log(`   qrCodeImage existe? ${!!deposit.metadata?.qrCodeImage}`);
        console.log(`   PIX Transaction ID: ${deposit.pix_transaction_id}`);
        
        if (deposit.metadata) {
          console.log(`   Chaves no metadata: ${Object.keys(deposit.metadata).join(', ')}`);
        }
        
        // Retornar dados formatados para o frontend
        const pixData = {
          transactionId: deposit.id,
          paymentId: deposit.pix_transaction_id,
          amount: baseAmount,
          totalAmount: totalAmount,
          feeAmount: feeAmount,
          pixCode: deposit.metadata?.pixCode || '',
          qrCodeImage: deposit.metadata?.qrCodeImage || '',
          status: status.status,
          expiresAt: deposit.metadata?.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          asaasData: deposit.metadata?.asaasData
        };
        
        return res.json({
          success: true,
          data: pixData
        });
      }
      
      // Adicionar campos booleanos para facilitar no frontend
      const enrichedStatus = {
        ...status,
        pixPaid: status.pixStatus === 'confirmed',
        blockchainConfirmed: status.blockchainStatus === 'confirmed',
        txHash: status.blockchainTxHash
      };

      res.json({
        success: true,
        data: enrichedStatus
      });

    } catch (error) {
      console.error('Erro ao obter status do depósito:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Listar depósitos de um usuário
   */
  async getUserDeposits(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      const deposits = await this.depositService.getUserDeposits(
        userId, 
        parseInt(page), 
        parseInt(limit), 
        status
      );
      
      res.json({
        success: true,
        data: deposits
      });

    } catch (error) {
      console.error('Erro ao listar depósitos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * DEBUG: Confirmar PIX manualmente (apenas para desenvolvimento)
   */
  async debugConfirmPix(req, res) {
    try {
      // Permitir em desenvolvimento e ambientes de teste
      // Comentado temporariamente para funcionar no Docker
      // if (process.env.NODE_ENV === 'production') {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Este endpoint está disponível apenas em desenvolvimento'
      //   });
      // }

      const { transactionId } = req.params;
      
      console.log(`🐛 DEBUG: Confirmando PIX manualmente para transação ${transactionId}`);

      // Dados simulados do PIX
      const pixData = {
        pixId: `PIX_DEBUG_${Date.now()}`,
        payerDocument: '12345678900',
        payerName: 'Debug Test User',
        paidAmount: req.body.amount || 100.00
      };

      // Confirmar pagamento PIX e enviar para fila
      const result = await this.depositService.confirmPixPayment(transactionId, pixData);

      // Registrar ação de debug
      if (result.user_id) {
        await userActionsService.logFinancial(result.user_id, 'debug_pix_confirmed', req, {
          status: 'confirmed',
          transactionId: transactionId,
          method: 'debug',
          details: pixData
        });
      }

      res.json({
        success: true,
        message: 'PIX confirmado (DEBUG) e enviado para processamento blockchain',
        data: {
          transactionId: result.id,
          status: result.status,
          metadata: result.metadata
        }
      });

    } catch (error) {
      console.error('Erro ao confirmar PIX (DEBUG):', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao confirmar PIX',
        error: error.message
      });
    }
  }

  /**
   * Webhook para receber confirmações de PIX do provedor
   */
  async handlePixWebhook(req, res) {
    try {
      // Validar assinatura do webhook (implementar conforme provedor)
      const signature = req.headers['x-webhook-signature'];
      
      // TODO: Validar assinatura quando integrar com provedor real
      // if (!validateWebhookSignature(signature, req.body)) {
      //   return res.status(401).json({ success: false, message: 'Invalid signature' });
      // }

      const { 
        transactionId, 
        pixId, 
        status,
        payerDocument,
        payerName,
        paidAmount 
      } = req.body;

      console.log(`📨 Webhook PIX recebido: ${transactionId} - Status: ${status}`);

      // Processar apenas se o PIX foi confirmado
      if (status === 'confirmed' || status === 'approved') {
        const pixData = {
          pixId,
          payerDocument,
          payerName,
          paidAmount
        };

        // Confirmar pagamento e enviar para fila
        await this.depositService.confirmPixPayment(transactionId, pixData);

        res.json({
          success: true,
          message: 'Webhook processado com sucesso'
        });
      } else {
        console.log(`⚠️ PIX não confirmado: ${status}`);
        res.json({
          success: true,
          message: 'Webhook recebido mas PIX não está confirmado'
        });
      }

    } catch (error) {
      console.error('Erro ao processar webhook PIX:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar webhook',
        error: error.message
      });
    }
  }

  /**
   * DEBUG: Completar depósito simulando PIX confirmado + mint automático
   */
  async debugCompleteDeposit(req, res) {
    try {
      // Permitir em desenvolvimento e ambientes de teste
      // Comentado temporariamente para funcionar no Docker
      // if (process.env.NODE_ENV === 'production') {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Este endpoint está disponível apenas em desenvolvimento'
      //   });
      // }

      const { transactionId } = req.params;
      const { amount } = req.body;

      console.log(`🧪 [DEBUG] Completando depósito: ${transactionId}`);

      await this.depositService.init();

      // Buscar transação primeiro para verificar estado atual
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!existingTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }

      console.log(`🧪 [DEBUG] Status atual - PIX: ${existingTransaction.pix_status}, Blockchain: ${existingTransaction.blockchain_status}, Status geral: ${existingTransaction.status}`);

      // Se já está completamente confirmado, retornar sucesso
      if (existingTransaction.status === 'confirmed' &&
          existingTransaction.pix_status === 'confirmed' &&
          existingTransaction.blockchain_status === 'confirmed') {
        console.log(`✅ [DEBUG] Depósito já confirmado: ${transactionId}`);
        return res.json({
          success: true,
          message: 'Depósito já estava confirmado (DEBUG)',
          data: {
            deposit: {
              transactionId: existingTransaction.id,
              status: existingTransaction.status,
              amount: existingTransaction.amount,
              currency: existingTransaction.currency,
              type: 'deposit'
            }
          }
        });
      }

      let result;

      // 1. Confirmar PIX manualmente (para ter controle sobre o timing)
      if (existingTransaction.pix_status === 'pending') {
        console.log(`🔄 [DEBUG] Confirmando PIX manualmente...`);

        // Confirmar PIX manualmente SEM disparar mint automático ainda
        result = await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            pix_status: 'confirmed',
            pix_confirmed_at: new Date(),
            pix_transaction_id: `pix-debug-${Date.now()}`,
            pix_end_to_end_id: `E${Date.now()}`,
            blockchain_status: 'pending', // Marcar como pending
            status: 'pending',
            metadata: {
              ...existingTransaction.metadata,
              pixConfirmation: {
                confirmedAt: new Date().toISOString(),
                pixId: `pix-debug-${Date.now()}`,
                payerDocument: '000.000.000-00',
                payerName: 'Teste Debug',
                paidAmount: amount || existingTransaction.amount,
                isDebugMode: true
              }
            }
          }
        });

        console.log(`✅ [DEBUG] PIX confirmado, blockchain status: pending`);

        // Disparar mint ASSÍNCRONO (não aguardar) para dar tempo do app mostrar tela de processing
        console.log(`🚀 [DEBUG] Disparando mint assíncrono na blockchain...`);

        // Executar mint em background sem aguardar (fire and forget)
        (async () => {
          try {
            // Aguardar 2 segundos para garantir que o app mostre a tela de processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log(`🔄 [DEBUG] Iniciando mint real na testnet...`);

            // Buscar usuário para pegar chave pública (endereço blockchain)
            const user = await prisma.user.findUnique({
              where: { id: result.userId },
              select: { publicKey: true, name: true }
            });

            const recipientAddress = user?.publicKey;
            if (!recipientAddress) {
              throw new Error('Usuário não possui chave pública (publicKey) configurada');
            }

            console.log(`   📍 PublicKey (Endereço): ${recipientAddress}`);
            console.log(`   💰 Valor: ${result.net_amount} cBRL`);

            // Executar mint REAL na testnet
            const mintResult = await mintService.mintCBRL(
              recipientAddress,
              result.net_amount.toString(),
              process.env.DEFAULT_NETWORK || 'testnet',
              transactionId
            );

            console.log(`   ✅ Mint executado: ${mintResult.transactionHash}`);

            // Atualizar transação com dados da blockchain
            if (mintResult.success) {
              await this.depositService.confirmBlockchainMint(transactionId, {
                txHash: mintResult.transactionHash,
                blockNumber: parseInt(mintResult.blockNumber) || 0,
                gasUsed: parseInt(mintResult.gasUsed) || 0,
                fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3',
                toAddress: recipientAddress
              });

              console.log(`✅ [DEBUG] Mint completado em background com sucesso!`);
            } else {
              throw new Error(mintResult.error || 'Mint failed');
            }
          } catch (err) {
            console.error(`❌ [DEBUG] Erro no mint background:`, err.message);

            // Atualizar status para failed
            await prisma.transaction.update({
              where: { id: transactionId },
              data: {
                blockchain_status: 'failed',
                status: 'failed',
                metadata: {
                  ...result.metadata,
                  blockchainError: {
                    error: err.message,
                    failedAt: new Date().toISOString()
                  }
                }
              }
            });
          }
        })();

      } else {
        console.log(`⏭️ [DEBUG] PIX já confirmado`);
        result = existingTransaction;
      }

      // Buscar transação atualizada
      const finalTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      res.json({
        success: true,
        message: 'Depósito concluído com sucesso (DEBUG)',
        data: {
          deposit: {
            transactionId: finalTransaction.id,
            status: finalTransaction.status,
            pixStatus: finalTransaction.pix_status,
            blockchainStatus: finalTransaction.blockchain_status,
            amount: finalTransaction.amount,
            currency: finalTransaction.currency,
            type: 'deposit',
            txHash: finalTransaction.txHash
          },
          mint: finalTransaction.metadata?.linkedMint || null
        }
      });

    } catch (error) {
      console.error('❌ [DEBUG] Erro ao completar depósito:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao completar depósito (DEBUG)',
        error: error.message
      });
    }
  }

  /**
   * Buscar dados do PIX já criado (não cria novo!)
   */
  async createPixCharge(req, res) {
    try {
      const { transactionId, userId } = req.body;
      
      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação é obrigatório'
        });
      }
      
      // Buscar transação de depósito
      const deposit = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              phone: true
            }
          }
        }
      });
      
      if (!deposit) {
        return res.status(404).json({
          success: false,
          message: 'Depósito não encontrado'
        });
      }
      
      if (deposit.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Depósito já foi processado'
        });
      }
      
      // NÃO criar novo PIX - apenas retornar os dados do PIX já criado
      console.log('📱 Retornando dados do PIX existente para transação:', deposit.id);
      
      // Verificar se já tem PIX criado (no metadata)
      if (!deposit.metadata?.pixTransactionId && !deposit.metadata?.pixPaymentId) {
        return res.status(400).json({
          success: false,
          message: 'PIX ainda não foi criado para esta transação'
        });
      }
      
      const depositAmount = parseFloat(deposit.amount);
      const feeAmount = parseFloat(deposit.fee || 0);
      const totalAmount = depositAmount + feeAmount;
      
      const pixCodeValue = deposit.metadata?.pixCode || '';
      const responseData = {
        transactionId: deposit.id,
        paymentId: deposit.metadata?.pixTransactionId || deposit.metadata?.pixPaymentId,
        amount: depositAmount,  // Valor base (sem taxa)
        totalAmount: totalAmount, // Valor total correto (base + taxa)
        feeAmount: feeAmount,     // Taxa
        pixCode: pixCodeValue,    // Código PIX (formato original)
        qrCode: pixCodeValue,     // Alias para compatibilidade com mobile
        qrCodeImage: deposit.metadata?.qrCodeImage || deposit.metadata?.asaasData?.qrCodeImage || '',
        expiresAt: deposit.metadata?.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: deposit.status,
        asaasData: deposit.metadata?.asaasData
      };
      
      res.json({
        success: true,
        message: 'Dados do PIX recuperados com sucesso',
        data: responseData
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar cobrança PIX:', error);
      
      // Verificar se é erro de configuração
      if (error.message && error.message.includes('temporariamente indisponível')) {
        return res.status(503).json({
          success: false,
          message: 'Sistema de pagamento PIX temporariamente indisponível',
          error: 'PIX_UNAVAILABLE',
          details: 'O sistema está em manutenção. Tente novamente mais tarde.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao criar cobrança PIX',
        error: error.message
      });
    }
  }
  
  /**
   * Verificar status do pagamento PIX
   */
  async checkPixStatus(req, res) {
    try {
      const { transactionId } = req.params;
      
      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação é obrigatório'
        });
      }
      
      // Buscar depósito
      const deposit = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      if (!deposit) {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }
      
      // Se não tem pix_transaction_id ainda, retornar status pendente
      if (!deposit.pix_transaction_id) {
        return res.json({
          success: true,
          message: 'Aguardando criação do PIX',
          data: {
            transactionId: deposit.id,
            status: 'waiting_pix_creation',
            amount: deposit.amount,
            createdAt: deposit.created_at
          }
        });
      }
      
      // Verificar status no Asaas
      const paymentStatus = await pixService.checkPaymentStatus(deposit.pix_transaction_id);
      
      // Se o pagamento não foi encontrado no Asaas
      if (paymentStatus.status === 'not_found') {
        return res.status(404).json({
          success: false,
          message: 'Pagamento PIX não encontrado no provedor',
          data: {
            transactionId: deposit.id,
            status: 'not_found',
            pixTransactionId: deposit.pix_transaction_id
          }
        });
      }
      
      // Atualizar status do PIX se mudou (não o status geral da transação)
      if (paymentStatus.status === 'approved' && deposit.pix_status === 'pending') {
        await prisma.transaction.update({
          where: { id: deposit.id },
          data: {
            pix_status: 'confirmed',  // Apenas atualiza o status do PIX
            pix_confirmed_at: new Date(),
            metadata: {
              ...deposit.metadata,
              asaasStatus: paymentStatus.originalStatus,
              paidAt: paymentStatus.paidAt,
              paidAmount: paymentStatus.paidAmount
            }
          }
        });
        
        // Processar depósito (mint cBRL)
        await depositService.processDeposit(deposit.id);
      }
      
      res.json({
        success: true,
        message: 'Status verificado com sucesso',
        data: {
          transactionId: deposit.id,
          status: paymentStatus.status,
          paidAt: paymentStatus.paidAt,
          paidAmount: paymentStatus.paidAmount,
          originalStatus: paymentStatus.originalStatus
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao verificar status do PIX:', error);
      
      // Se é erro de configuração, retornar status apropriado
      if (error.message && error.message.includes('temporariamente indisponível')) {
        return res.status(503).json({
          success: false,
          message: 'Sistema de pagamento PIX temporariamente indisponível',
          error: 'PIX_UNAVAILABLE'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar status do pagamento',
        error: error.message
      });
    }
  }

  /**
   * Calcular taxas de depósito para um usuário
   */
  async calculateDepositFees(req, res) {
    try {
      const { userId, amount } = req.body;
      
      // Validações
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário e valor são obrigatórios'
        });
      }

      // Calcular taxas
      const feeCalculation = await userTaxesService.calculateDepositFee(userId, parseFloat(amount));
      
      res.json({
        success: true,
        message: 'Taxas calculadas com sucesso',
        data: {
          amount: parseFloat(amount),
          fee: feeCalculation.fee,
          feePercent: feeCalculation.feePercent,
          netAmount: feeCalculation.netAmount,
          minFee: feeCalculation.minFee,
          maxFee: feeCalculation.maxFee,
          isVip: feeCalculation.isVip,
          vipLevel: feeCalculation.vipLevel,
          breakdown: {
            'Valor bruto': `R$ ${amount.toFixed(2)}`,
            'Taxa': `R$ ${feeCalculation.fee.toFixed(2)} (${feeCalculation.feePercent}%)`,
            'Valor líquido': `R$ ${feeCalculation.netAmount.toFixed(2)}`,
            'cBRL a receber': `${feeCalculation.netAmount.toFixed(2)} cBRL`
          }
        }
      });

    } catch (error) {
      console.error('Erro ao calcular taxas de depósito:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter taxas do usuário
   */
  async getUserTaxes(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      const userTaxes = await userTaxesService.getUserTaxes(userId);
      
      res.json({
        success: true,
        data: {
          depositFeePercent: userTaxes.depositFeePercent,
          withdrawFeePercent: userTaxes.withdrawFeePercent,
          minDepositFee: userTaxes.minDepositFee,
          maxDepositFee: userTaxes.maxDepositFee,
          minWithdrawFee: userTaxes.minWithdrawFee,
          maxWithdrawFee: userTaxes.maxWithdrawFee,
          exchangeFeePercent: userTaxes.exchangeFeePercent,
          transferFeePercent: userTaxes.transferFeePercent,
          gasSubsidyEnabled: userTaxes.gasSubsidyEnabled,
          gasSubsidyPercent: userTaxes.gasSubsidyPercent,
          isVip: userTaxes.isVip,
          vipLevel: userTaxes.vipLevel,
          validFrom: userTaxes.validFrom,
          validUntil: userTaxes.validUntil
        }
      });

    } catch (error) {
      console.error('Erro ao obter taxas do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Debug metadata de uma transação
   */
  async debugMetadata(req, res) {
    try {
      const { transactionId } = req.params;
      
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        select: {
          id: true,
          amount: true,
          fee: true,
          pix_transaction_id: true,
          metadata: true,
          createdAt: true,
          status: true
        }
      });
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }
      
      const debugInfo = {
        transactionId: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        fee: transaction.fee,
        totalAmount: parseFloat(transaction.amount || 0) + parseFloat(transaction.fee || 0),
        pixTransactionId: transaction.pix_transaction_id,
        createdAt: transaction.createdAt,
        metadata: {
          exists: !!transaction.metadata,
          keys: transaction.metadata ? Object.keys(transaction.metadata) : [],
          hasPixCode: !!transaction.metadata?.pixCode,
          hasQrCodeImage: !!transaction.metadata?.qrCodeImage,
          hasPixPaymentId: !!transaction.metadata?.pixPaymentId,
          pixCodePreview: transaction.metadata?.pixCode ? transaction.metadata.pixCode.substring(0, 50) + '...' : null,
          qrCodeImagePreview: transaction.metadata?.qrCodeImage ? transaction.metadata.qrCodeImage.substring(0, 50) + '...' : null
        }
      };
      
      console.log('🔍 DEBUG METADATA:', JSON.stringify(debugInfo, null, 2));
      
      return res.json({
        success: true,
        data: debugInfo
      });
      
    } catch (error) {
      console.error('Erro ao debugar metadata:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao debugar metadata',
        error: error.message
      });
    }
  }
}

module.exports = DepositController;















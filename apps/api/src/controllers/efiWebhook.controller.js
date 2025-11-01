const crypto = require('crypto');
const depositService = require('../services/deposit.service');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

class EfiWebhookController {
  /**
   * Recebe webhooks da EFI Pay (Gerencianet)
   */
  async handleWebhook(req, res) {
    try {
      console.log('📨 [EFI Webhook] Recebido:', JSON.stringify(req.body, null, 2));
      console.log('📨 [EFI Webhook] Headers:', req.headers);
      
      // EFI envia notificações em formato específico
      const { pix } = req.body;
      
      if (!pix || !Array.isArray(pix)) {
        console.log('⚠️ [EFI Webhook] Formato inválido, esperado array de pix');
        return res.status(200).json({ received: true });
      }
      
      // Processar cada notificação PIX
      for (const pixNotification of pix) {
        await this.processPixNotification(pixNotification);
      }
      
      // Sempre retornar 200 para a EFI
      res.status(200).json({ received: true });
      
    } catch (error) {
      console.error('❌ [EFI Webhook] Erro ao processar:', error);
      // Ainda assim retornar 200 para evitar retry da EFI
      res.status(200).json({ received: true, error: error.message });
    }
  }
  
  /**
   * Processa notificação individual de PIX
   */
  async processPixNotification(pixData) {
    try {
      console.log('💰 [EFI Webhook] Processando PIX:', pixData);

      const { txid, horario, valor, chave, infoPagador, endToEndId } = pixData;

      if (!txid) {
        console.warn('⚠️ [EFI Webhook] PIX sem txid');
        return;
      }

      // Extrair o ID da transação do txid/endToEndId
      // Para depósitos: txid = {transactionId}_{timestamp}
      // Para saques: endToEndId ou transactionId único da EFI
      const transactionId = txid.split('_')[0].replace(/[^a-zA-Z0-9-]/g, '');

      console.log(`🔍 [EFI Webhook] Buscando transação: ${transactionId} (txid: ${txid}, endToEndId: ${endToEndId})`);

      // Primeiro, tentar encontrar um saque (withdrawal)
      const withdrawal = await prisma.withdrawal.findFirst({
        where: {
          OR: [
            { id: transactionId },
            { pixTransactionId: txid },
            { pixEndToEndId: endToEndId },
            {
              metadata: {
                path: '$.pixPayment.transactionId',
                equals: txid
              }
            }
          ],
          status: { in: ['PROCESSING', 'PENDING'] }
        },
        include: {
          user: true
        }
      });

      if (withdrawal) {
        console.log(`✅ [EFI Webhook] Saque encontrado: ${withdrawal.id}`);
        return await this.processWithdrawalConfirmation(withdrawal, pixData);
      }

      // Se não é saque, buscar depósito
      const deposit = await prisma.transaction.findFirst({
        where: {
          OR: [
            { id: transactionId },
            { 
              metadata: {
                path: '$.txid',
                equals: txid
              }
            }
          ],
          transactionType: 'deposit',
          status: 'pending'
        }
      });
      
      if (!deposit) {
        // Tentar encontrar com ID modificado (com hífen)
        const formattedId = transactionId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
        const depositRetry = await prisma.transaction.findFirst({
          where: {
            id: formattedId,
            transactionType: 'deposit',
            status: 'pending'
          }
        });
        
        if (!depositRetry) {
          console.warn(`⚠️ [EFI Webhook] Depósito não encontrado para txid ${txid}`);
          return;
        }
        
        deposit = depositRetry;
      }
      
      console.log(`✅ [EFI Webhook] Depósito encontrado: ${deposit.id}`);
      
      // Atualizar status do PIX para confirmado
      await prisma.transaction.update({
        where: { id: deposit.id },
        data: {
          pix_status: 'confirmed',
          pix_confirmed_at: new Date(horario),
          metadata: {
            ...deposit.metadata,
            efi_txid: txid,
            efi_endToEndId: endToEndId,
            efi_horario: horario,
            efi_valor: valor,
            efi_chave: chave,
            efi_infoPagador: infoPagador,
            paidAmount: parseFloat(valor),
            paymentConfirmedAt: horario
          }
        }
      });
      
      console.log(`✅ [EFI Webhook] PIX confirmado para depósito ${deposit.id}`);
      
      // Processar o depósito (mint cBRL)
      try {
        await depositService.processDeposit(deposit.id);
        console.log(`✅ [EFI Webhook] Depósito ${deposit.id} processado com sucesso`);
      } catch (mintError) {
        console.error(`❌ [EFI Webhook] Erro ao processar mint para ${deposit.id}:`, mintError);
        // Marcar para reprocessamento
        await prisma.transaction.update({
          where: { id: deposit.id },
          data: {
            metadata: {
              ...deposit.metadata,
              mintError: mintError.message,
              needsReprocessing: true
            }
          }
        });
      }
      
    } catch (error) {
      console.error('❌ [EFI Webhook] Erro ao processar notificação PIX:', error);
      throw error;
    }
  }

  /**
   * Processar confirmação de saque PIX
   */
  async processWithdrawalConfirmation(withdrawal, pixData) {
    try {
      const { txid, horario, valor, chave, endToEndId } = pixData;

      console.log(`💸 [EFI Webhook] Confirmando saque: ${withdrawal.id} - PIX: R$ ${valor}`);

      // Atualizar status do saque para confirmado
      const updatedWithdrawal = await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'CONFIRMED',
          completedAt: new Date(horario),
          pixEndToEndId: endToEndId,
          metadata: {
            ...withdrawal.metadata,
            pixPayment: {
              ...withdrawal.metadata?.pixPayment,
              status: 'CONFIRMED',
              confirmedAt: new Date(horario).toISOString(),
              efiTxid: txid,
              efiEndToEndId: endToEndId,
              efiHorario: horario,
              efiValor: valor,
              efiChave: chave,
              confirmedAmount: parseFloat(valor)
            }
          }
        }
      });

      // Atualizar transação padronizada se existir
      try {
        const withdrawTransactionService = require('../services/withdrawTransaction.service');
        const standardTransaction = await withdrawTransactionService.findByWithdrawalId(withdrawal.id);

        if (standardTransaction) {
          await withdrawTransactionService.updateWithPixConfirmation(standardTransaction.id, {
            pixEndToEndId: endToEndId,
            confirmedAt: new Date(horario),
            confirmedAmount: parseFloat(valor),
            status: 'CONFIRMED'
          });
          console.log(`✅ [EFI Webhook] Transação padronizada atualizada para saque ${withdrawal.id}`);
        }
      } catch (updateError) {
        console.warn(`⚠️ [EFI Webhook] Erro ao atualizar transação padronizada:`, updateError);
      }

      // Enviar notificação para o usuário
      try {
        const NotificationService = require('../services/notification.service');
        const notificationService = new NotificationService();

        await notificationService.sendWithdrawalConfirmed(withdrawal.userId, {
          withdrawalId: withdrawal.id,
          amount: withdrawal.amount,
          pixKey: withdrawal.pixKey,
          completedAt: new Date(horario),
          endToEndId: endToEndId
        });

        console.log(`✅ [EFI Webhook] Notificação enviada para usuário ${withdrawal.userId}`);
      } catch (notificationError) {
        console.warn(`⚠️ [EFI Webhook] Erro ao enviar notificação:`, notificationError);
      }

      console.log(`✅ [EFI Webhook] Saque ${withdrawal.id} confirmado com sucesso - E2E: ${endToEndId}`);

      return {
        success: true,
        withdrawalId: withdrawal.id,
        status: 'CONFIRMED',
        endToEndId: endToEndId,
        confirmedAt: horario
      };

    } catch (error) {
      console.error(`❌ [EFI Webhook] Erro ao processar confirmação de saque:`, error);

      // Marcar saque como falha se erro crítico
      try {
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: 'FAILED',
            metadata: {
              ...withdrawal.metadata,
              pixPayment: {
                ...withdrawal.metadata?.pixPayment,
                status: 'FAILED',
                failedAt: new Date().toISOString(),
                webhookError: error.message
              }
            }
          }
        });
      } catch (updateError) {
        console.error(`❌ [EFI Webhook] Erro ao marcar saque como falha:`, updateError);
      }

      throw error;
    }
  }

  /**
   * Endpoint para configurar webhook na EFI
   * Deve ser chamado uma vez para registrar a URL do webhook
   */
  async configureWebhook(req, res) {
    try {
      const webhookUrl = process.env.EFI_WEBHOOK_URL || `${process.env.APP_URL}/api/webhooks/efi/pix`;
      
      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const fs = require('fs');
      const path = require('path');
      
      const options = {
        client_id: process.env.EFI_CLIENT_ID,
        client_secret: process.env.EFI_CLIENT_SECRET,
        certificate: path.resolve(__dirname, '../../', process.env.EFI_CERTIFICATE_PATH),
        sandbox: process.env.EFI_SANDBOX === 'true',
        validateMtls: false
      };
      
      const efipay = new EfiPay(options);
      
      // Configurar webhook
      const body = {
        webhookUrl: webhookUrl
      };
      
      console.log(`🔧 [EFI Webhook] Configurando webhook: ${webhookUrl}`);
      
      // Configurar webhook para PIX
      const response = await efipay.pixConfigWebhook({
        chave: process.env.EFI_PIX_KEY
      }, body);
      
      console.log('✅ [EFI Webhook] Webhook configurado:', response);
      
      return res.status(200).json({
        success: true,
        message: 'Webhook EFI configurado com sucesso',
        data: {
          url: webhookUrl,
          response: response
        }
      });
      
    } catch (error) {
      console.error('❌ [EFI Webhook] Erro ao configurar webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao configurar webhook EFI',
        error: error.message
      });
    }
  }
  
  /**
   * Listar webhooks configurados na EFI
   */
  async listWebhooks(req, res) {
    try {
      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const fs = require('fs');
      const path = require('path');
      
      const options = {
        client_id: process.env.EFI_CLIENT_ID,
        client_secret: process.env.EFI_CLIENT_SECRET,
        certificate: path.resolve(__dirname, '../../', process.env.EFI_CERTIFICATE_PATH),
        sandbox: process.env.EFI_SANDBOX === 'true',
        validateMtls: false
      };
      
      const efipay = new EfiPay(options);
      
      // Listar webhooks
      const response = await efipay.pixDetailWebhook({
        chave: process.env.EFI_PIX_KEY
      });
      
      console.log('📋 [EFI Webhook] Webhooks listados:', response);
      
      return res.status(200).json({
        success: true,
        message: 'Webhooks EFI listados',
        data: response
      });
      
    } catch (error) {
      console.error('❌ [EFI Webhook] Erro ao listar webhooks:', error);
      
      // Se não houver webhook configurado, retornar vazio
      if (error.message?.includes('webhook_nao_encontrado')) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum webhook configurado',
          data: null
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar webhooks EFI',
        error: error.message
      });
    }
  }
  
  /**
   * Remover webhook da EFI
   */
  async removeWebhook(req, res) {
    try {
      // Configurar SDK da EFI
      const EfiPay = require('sdk-node-apis-efi');
      const fs = require('fs');
      const path = require('path');
      
      const options = {
        client_id: process.env.EFI_CLIENT_ID,
        client_secret: process.env.EFI_CLIENT_SECRET,
        certificate: path.resolve(__dirname, '../../', process.env.EFI_CERTIFICATE_PATH),
        sandbox: process.env.EFI_SANDBOX === 'true',
        validateMtls: false
      };
      
      const efipay = new EfiPay(options);
      
      // Remover webhook
      const response = await efipay.pixDeleteWebhook({
        chave: process.env.EFI_PIX_KEY
      });
      
      console.log('🗑️ [EFI Webhook] Webhook removido:', response);
      
      return res.status(200).json({
        success: true,
        message: 'Webhook EFI removido com sucesso',
        data: response
      });
      
    } catch (error) {
      console.error('❌ [EFI Webhook] Erro ao remover webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover webhook EFI',
        error: error.message
      });
    }
  }
}

module.exports = new EfiWebhookController();
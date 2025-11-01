const crypto = require('crypto');
const depositService = require('../services/deposit.service');
const withdrawService = require('../services/withdraw.service');
const PixService = require('../services/pix.service');
const pixService = new PixService();
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

class AsaasWebhookController {
  /**
   * Recebe webhooks do Asaas
   */
  async handleWebhook(req, res) {
    try {
      console.log('📨 [Asaas Webhook] Recebido:', req.body);
      
      // Validar assinatura do webhook (se configurado)
      if (process.env.ASAAS_WEBHOOK_TOKEN) {
        const isValid = this.validateWebhookSignature(req);
        if (!isValid) {
          console.error('❌ [Asaas Webhook] Assinatura inválida');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }
      
      const { event, payment, transfer } = req.body;
      
      // Processar diferentes tipos de eventos
      switch (event) {
        case 'PAYMENT_CONFIRMED':
        case 'PAYMENT_RECEIVED':
          await this.handlePaymentConfirmed(payment);
          break;
          
        case 'PAYMENT_OVERDUE':
        case 'PAYMENT_DELETED':
          await this.handlePaymentCancelled(payment);
          break;
          
        case 'TRANSFER_DONE':
          await this.handleTransferCompleted(transfer);
          break;
          
        case 'TRANSFER_FAILED':
          await this.handleTransferFailed(transfer);
          break;
          
        default:
          console.log(`⚠️ [Asaas Webhook] Evento não tratado: ${event}`);
      }
      
      // Sempre retornar 200 para o Asaas
      res.status(200).json({ received: true });
      
    } catch (error) {
      console.error('❌ [Asaas Webhook] Erro ao processar:', error);
      // Ainda assim retornar 200 para evitar retry do Asaas
      res.status(200).json({ received: true, error: error.message });
    }
  }
  
  /**
   * Valida assinatura do webhook
   */
  validateWebhookSignature(req) {
    const token = process.env.ASAAS_WEBHOOK_TOKEN;
    const signature = req.headers['asaas-signature'];
    
    if (!signature || !token) {
      return false;
    }
    
    // Asaas usa HMAC SHA-256
    const expectedSignature = crypto
      .createHmac('sha256', token)
      .update(JSON.stringify(req.body))
      .digest('hex');
      
    return signature === expectedSignature;
  }
  
  /**
   * Processa pagamento confirmado
   */
  async handlePaymentConfirmed(payment) {
    try {
      console.log(`✅ [Asaas Webhook] Pagamento confirmado: ${payment.id}`);
      
      // Buscar transação de depósito pelo externalReference
      const deposit = await prisma.transaction.findFirst({
        where: {
          id: payment.externalReference,
          transactionType: 'deposit',
          status: 'pending'
        }
      });
      
      if (!deposit) {
        console.warn(`⚠️ [Asaas Webhook] Depósito não encontrado para payment ${payment.id}`);
        return;
      }
      
      // Atualizar apenas o status do PIX (status geral só muda após mint)
      await prisma.transaction.update({
        where: { id: deposit.id },
        data: {
          pix_status: 'confirmed',  // Apenas confirma o PIX
          pix_confirmed_at: new Date(),
          metadata: {
            ...deposit.metadata,
            asaasPaymentId: payment.id,
            asaasStatus: payment.status,
            asaasConfirmedDate: payment.confirmedDate,
            paidAmount: payment.value
          }
        }
      });
      
      // Processar o depósito (mint cBRL)
      await depositService.processDeposit(deposit.id);
      
      console.log(`✅ [Asaas Webhook] Depósito ${deposit.id} processado com sucesso`);
      
    } catch (error) {
      console.error('❌ [Asaas Webhook] Erro ao processar pagamento confirmado:', error);
      throw error;
    }
  }
  
  /**
   * Processa pagamento cancelado/expirado
   */
  async handlePaymentCancelled(payment) {
    try {
      console.log(`❌ [Asaas Webhook] Pagamento cancelado: ${payment.id}`);
      
      // Buscar transação de depósito pelo externalReference
      const deposit = await prisma.transaction.findFirst({
        where: {
          id: payment.externalReference,
          transactionType: 'deposit',
          status: 'pending'
        }
      });
      
      if (!deposit) {
        console.warn(`⚠️ [Asaas Webhook] Depósito não encontrado para payment ${payment.id}`);
        return;
      }
      
      // Atualizar status da transação para cancelado
      await prisma.transaction.update({
        where: { id: deposit.id },
        data: {
          status: 'cancelled',
          pix_status: 'cancelled',
          metadata: {
            ...deposit.metadata,
            asaasPaymentId: payment.id,
            asaasStatus: payment.status,
            cancelledAt: new Date().toISOString(),
            cancelReason: payment.status === 'OVERDUE' ? 'Pagamento expirado' : 'Pagamento cancelado'
          }
        }
      });
      
      console.log(`⚠️ [Asaas Webhook] Depósito ${deposit.id} cancelado`);
      
    } catch (error) {
      console.error('❌ [Asaas Webhook] Erro ao processar pagamento cancelado:', error);
      throw error;
    }
  }
  
  /**
   * Processa transferência completada
   */
  async handleTransferCompleted(transfer) {
    try {
      console.log(`✅ [Asaas Webhook] Transferência completada: ${transfer.id}`);
      
      // Buscar saque pelo externalReference
      const withdrawal = await prisma.withdrawal.findFirst({
        where: {
          externalId: transfer.externalReference,
          status: 'confirmed'
        }
      });
      
      if (!withdrawal) {
        console.warn(`⚠️ [Asaas Webhook] Saque não encontrado para transfer ${transfer.id}`);
        return;
      }
      
      // Atualizar status do saque
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          metadata: {
            ...withdrawal.metadata,
            asaasTransferId: transfer.id,
            asaasStatus: transfer.status,
            asaasTransferDate: transfer.transferDate,
            transactionReceiptUrl: transfer.transactionReceiptUrl
          }
        }
      });
      
      console.log(`✅ [Asaas Webhook] Saque ${withdrawal.id} completado com sucesso`);
      
    } catch (error) {
      console.error('❌ [Asaas Webhook] Erro ao processar transferência completada:', error);
      throw error;
    }
  }
  
  /**
   * Processa transferência falhada
   */
  async handleTransferFailed(transfer) {
    try {
      console.log(`❌ [Asaas Webhook] Transferência falhou: ${transfer.id}`);
      
      // Buscar saque pelo externalReference
      const withdrawal = await prisma.withdrawal.findFirst({
        where: {
          externalId: transfer.externalReference,
          status: 'confirmed'
        }
      });
      
      if (!withdrawal) {
        console.warn(`⚠️ [Asaas Webhook] Saque não encontrado para transfer ${transfer.id}`);
        return;
      }
      
      // Atualizar status do saque para falhou
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'failed',
          metadata: {
            ...withdrawal.metadata,
            asaasTransferId: transfer.id,
            asaasStatus: transfer.status,
            failureReason: transfer.failReason || 'Transferência falhou',
            failedAt: new Date().toISOString()
          }
        }
      });
      
      // Reverter o burn de cBRL (devolver tokens ao usuário)
      await withdrawService.reverseWithdrawal(withdrawal.id);
      
      console.log(`⚠️ [Asaas Webhook] Saque ${withdrawal.id} falhou e foi revertido`);
      
    } catch (error) {
      console.error('❌ [Asaas Webhook] Erro ao processar transferência falhada:', error);
      throw error;
    }
  }
}

module.exports = new AsaasWebhookController();
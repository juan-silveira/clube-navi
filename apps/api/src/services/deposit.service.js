// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const prismaConfig = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const NotificationService = require('./notification.service');
const mintService = require('./mint.service');
const userTaxesService = require('./userTaxes.service');

class DepositService {
  constructor() {
    this.prisma = null;
    this.notificationService = new NotificationService();
    this.rabbitMQConnection = null;
    this.rabbitMQChannel = null;
  }

  async init() {
    this.prisma = prismaConfig.getPrisma();
  }

  /**
   * Conectar ao RabbitMQ
   */
  async connectToRabbitMQ() {
    try {
      if (!this.rabbitMQConnection) {
        this.rabbitMQConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        this.rabbitMQChannel = await this.rabbitMQConnection.createChannel();
        
        // Declarar fila de depósitos
        await this.rabbitMQChannel.assertQueue('deposits', {
          durable: true
        });
        
        console.log('✅ Conectado ao RabbitMQ');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar ao RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Iniciar processo de depósito (TRANSAÇÃO ÚNICA)
   */
  async initiateDeposit(amount, userId) {
    try {
      if (!this.prisma) await this.init();
      
      // Verificar se usuário existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Sem company - sistema simplificado
      const companyId = null;

      // Calcular taxa usando UserTaxesService
      const feeCalculation = await userTaxesService.calculateDepositFee(userId, amount);
      const fee = feeCalculation.fee;
      const totalAmount = feeCalculation.totalAmount; // Valor total que o usuário deve pagar
      const netAmount = amount; // Valor que será creditado em cBRL

      // Endereços e configurações padrão
      const ADMIN_ADDRESS = process.env.ADMIN_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3';
      
      // Determinar a rede e o contrato correto
      const { getCBRLAddress, getBlockchainNetwork } = require('../utils/blockchain.utils');

      // Usar contrato correto baseado na BLOCKCHAIN_NETWORK do .env
      const CONTRACT_ADDRESS = getCBRLAddress();
      const NETWORK = getBlockchainNetwork();

      console.log('🔍 [DEPOSIT DEBUG] Blockchain Network:', NETWORK);
      console.log('🔍 [DEPOSIT DEBUG] cBRL Contract Address:', CONTRACT_ADDRESS);

      // CRIAR TRANSAÇÃO ÚNICA com campos unificados e padronizados
      const transaction = await this.prisma.transaction.create({
        data: {
          id: uuidv4(),
          userId: userId,
          transactionType: 'deposit',
          status: 'pending',
          amount: parseFloat(amount),
          fee: parseFloat(fee),
          netAmount: parseFloat(netAmount),
          currency: 'BRL',
          fromAddress: ADMIN_ADDRESS,
          toAddress: user?.publicKey,
          operationType: 'deposit',
          metadata: {
            type: 'deposit',
            paymentMethod: 'pix',
            description: `Depósito PIX de R$ ${netAmount}`,
            source: 'user_deposit',
            network: NETWORK,
            contractAddress: CONTRACT_ADDRESS,
            functionName: 'mint',
            timestamp: new Date().toISOString(),
            fee: fee,
            totalAmount: totalAmount,
            netAmount: netAmount,
            adminAddress: ADMIN_ADDRESS,
            userAddress: user?.publicKey,
            pixStatus: 'pending',
            pixKey: 'contato@coinage.com.br',
            pixKeyType: 'EMAIL',
            blockchainStatus: null
          }
        }
      });

      // PIX: Criar cobrança PIX real
      console.log(`💰 [DEPOSIT] Iniciando criação de PIX...`);
      console.log(`💰 [DEPOSIT] PIX_PROVIDER do env: ${process.env.PIX_PROVIDER}`);
      
      const PixService = require('./pix.service');
      const pixService = new PixService();
      
      console.log(`💰 [DEPOSIT] PixService instanciado com provider: ${pixService.provider}`);
      
      // Buscar dados do usuário para criar cobrança
      const userWithInfo = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          cpf: true,
          phone: true,
          publicKey: true
        }
      });

      if (!userWithInfo) {
        throw new Error('Usuário não encontrado');
      }

      try {
        console.log(`🚀 Tentando criar PIX para transação ${transaction.id}`);
        console.log(`   Valor total: R$ ${totalAmount}`);
        console.log(`   Usuário: ${userWithInfo.name} (${userWithInfo.email})`);
        
        // Criar cobrança PIX via Asaas
        const pixCharge = await pixService.createPixCharge({
          amount: parseFloat(totalAmount), // Valor total com taxa
          description: `Depósito cBRL - ${userWithInfo.name}`,
          userInfo: {
            id: userWithInfo.id,
            name: userWithInfo.name,
            email: userWithInfo.email,
            cpf: userWithInfo.cpf,
            phone: userWithInfo.phone
          },
          externalId: transaction.id,
          expirationMinutes: 30
        });

        console.log(`✅ PIX criado com sucesso!`);
        console.log(`   Payment ID: ${pixCharge.paymentId}`);
        console.log(`   Tem pixCode? ${!!pixCharge.pixCode}`);
        console.log(`   Tem qrCodeImage? ${!!pixCharge.qrCodeImage}`);

        // Atualizar transação com dados do PIX (tudo no metadata - pix_transaction_id não existe no schema)
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            metadata: {
              ...transaction.metadata,
              pixTransactionId: pixCharge.paymentId,
              pixPaymentId: pixCharge.paymentId,
              pixCode: pixCharge.pixCode,
              qrCodeImage: pixCharge.qrCodeImage,
              expiresAt: pixCharge.expiresAt,
              asaasData: pixCharge.asaasData
            }
          }
        });

        console.log(`💾 Dados salvos no banco para transação ${transaction.id}`);

        // 🧪 AUTO-CONFIRMAÇÃO EM MODO MOCK: Confirmar PIX automaticamente após 5 segundos
        if (process.env.USE_PIX_MOCK === 'true') {
          console.log(`🧪 [MOCK MODE] Agendando auto-confirmação PIX em 5 segundos...`);
          setTimeout(async () => {
            try {
              console.log(`🧪 [MOCK MODE] Executando auto-confirmação PIX para ${transaction.id}...`);
              await this.confirmPixDeposit(transaction.id, {
                txid: `mock_txid_${Date.now()}`,
                status: 'confirmed',
                paidAt: new Date().toISOString(),
                amount: totalAmount
              });
              console.log(`✅ [MOCK MODE] PIX auto-confirmado para ${transaction.id}`);
            } catch (error) {
              console.error(`❌ [MOCK MODE] Erro ao auto-confirmar PIX:`, error.message);
            }
          }, 5000); // 5 segundos
        }

        return {
          transactionId: transaction.id,
          amount: netAmount, // Valor líquido
          totalAmount: totalAmount, // Total a pagar
          fee: fee,
          status: 'pending',
          pixPaymentId: pixCharge.paymentId,
          pixData: {
            pixPaymentId: pixCharge.paymentId,
            transactionId: transaction.id,
            amount: parseFloat(totalAmount), // Total a pagar
            netAmount: parseFloat(netAmount), // Valor líquido
            fee: parseFloat(fee),
            status: 'pending',
            qrCode: pixCharge.pixCode, // Código PIX real do Asaas
            qrCodeImage: pixCharge.qrCodeImage, // URL da imagem QR Code
            pixKey: 'contato@coinage.com.br',
            expiresAt: pixCharge.expiresAt,
            createdAt: new Date(),
            asaasData: pixCharge.asaasData
          }
        };

      } catch (pixError) {
        console.error('❌ Erro ao criar PIX no Asaas:', pixError.message);
        console.error('   Detalhes do erro:', pixError.response?.data || pixError);

        // Em caso de erro na criação do PIX, criar dados mock como fallback
        const pixPaymentId = `pix_${transaction.id}_${Date.now()}`;
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        const qrCodeMock = `00020126580014br.gov.bcb.pix2536pix-qr.mercadopago.com/instore/o/v2/${pixPaymentId}5204000053039865802BR5925Coinage Tecnologia6009Sao Paulo62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // IMPORTANTE: Atualizar transaction com dados do PIX no metadata (não há campo pix_transaction_id no schema)
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            metadata: {
              ...transaction.metadata,
              pixTransactionId: pixPaymentId,
              pixPaymentId: pixPaymentId,
              pixCode: qrCodeMock,
              qrCodeImage: '', // Sem imagem no mock
              expiresAt: expiresAt.toISOString(),
              fallback: true,
              pixError: pixError.message
            }
          }
        });

        const pixData = {
          pixPaymentId,
          transactionId: transaction.id,
          amount: parseFloat(totalAmount),
          netAmount: parseFloat(netAmount),
          fee: parseFloat(fee),
          status: 'pending',
          qrCode: qrCodeMock,
          pixKey: 'contato@coinage.com.br',
          expiresAt: expiresAt,
          createdAt: new Date(),
          error: pixError.message
        };

        console.log(`📱 PIX fallback (mock) criado e salvo: ${pixPaymentId} para transação ${transaction.id}`);

        return {
          transactionId: transaction.id,
          amount: netAmount,
          totalAmount: totalAmount,
          fee: fee,
          status: 'pending',
          pixPaymentId: pixPaymentId,
          pixData: pixData
        };
      }

    } catch (error) {
      console.error('❌ Erro ao iniciar depósito:', error);
      throw error;
    }
  }

  /**
   * Confirmar depósito PIX (atualizar apenas status PIX)
   */
  async confirmPixDeposit(transactionId, pixData = null) {
    try {
      if (!this.prisma) await this.init();
      
      // Buscar transação
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      // PIX status está no metadata
      const pixStatus = transaction.metadata?.pixStatus || 'pending';
      if (pixStatus !== 'pending') {
        console.log(`⚠️ PIX já foi confirmado anteriormente (status: ${pixStatus})`);
        return transaction; // Retornar sem erro
      }

      // TRANSAÇÃO ATÔMICA: Atualizar PIX e controlar fila blockchain
      const updatedTransaction = await this.prisma.$transaction(async (prisma) => {
        // Verificar se blockchain já foi iniciado (prevenir múltiplos envios para fila)
        const currentTransaction = await prisma.transaction.findUnique({
          where: { id: transactionId }
        });

        const blockchainStatus = currentTransaction.metadata?.blockchainStatus;
        if (blockchainStatus && blockchainStatus !== 'null') {
          console.log(`🛡️ BLOCKCHAIN JÁ INICIADO: ${transactionId} (status: ${blockchainStatus})`);
          return currentTransaction; // Retornar sem enviar novamente para fila
        }

        // Atualizar atomicamente PIX e iniciar blockchain
        return await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            // Status geral ainda pendente (aguardando blockchain)
            status: 'pending',

            // Atualizar metadata com PIX confirmado e blockchain pendente
            metadata: {
              ...currentTransaction.metadata,
              pixStatus: 'confirmed',
              pixConfirmedAt: new Date().toISOString(),
              pixTransactionId: pixData?.pixId || `mock_pix_${Date.now()}`,
              pixEndToEndId: pixData?.endToEndId || `E${Date.now()}`,
              blockchainStatus: 'pending',
              pixConfirmation: {
                confirmedAt: new Date().toISOString(),
                ...(pixData && {
                  pixId: pixData.pixId,
                  payerDocument: pixData.payerDocument,
                  payerName: pixData.payerName,
                  paidAmount: pixData.paidAmount
                })
              }
            }
          }
        });
      });

      // VERIFICAR SE JÁ FOI ENVIADO PARA FILA (blockchain_status mudou de null para pending)
      const oldBlockchainStatus = transaction.metadata?.blockchainStatus;
      const newBlockchainStatus = updatedTransaction.metadata?.blockchainStatus;
      if (!oldBlockchainStatus && newBlockchainStatus === 'pending') {
        // Buscar endereço blockchain do usuário
        const user = await this.prisma.user.findUnique({
          where: { id: transaction.userId },
          select: { publicKey: true }
        });

        const recipientAddress = user?.publicKey;
        if (!recipientAddress) {
          throw new Error('Usuário não possui chave pública (publicKey) configurada');
        }

        // EXECUTAR MINT DIRETAMENTE AO INVÉS DE USAR FILA
        console.log(`🔄 Executando mint blockchain para: ${transactionId}`);
        console.log(`💰 Valor do mint: ${updatedTransaction.netAmount || updatedTransaction.amount}`);

        try {
          const mintAmount = updatedTransaction.netAmount || updatedTransaction.amount;
          if (!mintAmount) {
            throw new Error('Valor do mint não encontrado na transação');
          }

          const mintResult = await mintService.mintCBRL(
            recipientAddress,
            mintAmount.toString(),
            process.env.DEFAULT_NETWORK || 'testnet',
            transactionId
          );

          if (mintResult.success) {
            // Atualizar transação com dados reais da blockchain
            const finalTransaction = await this.prisma.transaction.update({
              where: { id: transactionId },
              data: {
                status: 'confirmed', // Status geral também confirmed
                confirmedAt: new Date(),
                txHash: mintResult.transactionHash,
                blockNumber: BigInt(parseInt(mintResult.blockNumber) || 0),
                metadata: {
                  ...updatedTransaction.metadata,
                  blockchainStatus: 'confirmed',
                  blockchainConfirmedAt: new Date().toISOString(),
                  blockchain: {
                    transactionHash: mintResult.transactionHash,
                    blockNumber: mintResult.blockNumber,
                    gasUsed: mintResult.gasUsed,
                    recipient: mintResult.recipient,
                    amountMinted: mintResult.amountMinted,
                    explorerUrl: mintResult.explorerUrl,
                    confirmedAt: new Date().toISOString()
                  }
                }
              }
            });

            console.log(`✅ Depósito confirmado na blockchain: ${mintResult.transactionHash}`);
            return finalTransaction;
          } else {
            throw new Error(`Mint failed: ${mintResult.error}`);
          }
        } catch (blockchainError) {
          console.error('❌ Erro na blockchain:', blockchainError);

          // Atualizar status para failed
          await this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'failed',
              metadata: {
                ...updatedTransaction.metadata,
                blockchainStatus: 'failed',
                blockchain: {
                  error: blockchainError.message,
                  failedAt: new Date().toISOString()
                }
              }
            }
          });
          
          throw blockchainError;
        }
      } else {
        console.log(`🛡️ PIX confirmado para ${transactionId}, mas blockchain JÁ INICIADO`);
      }

      return updatedTransaction;

    } catch (error) {
      console.error('❌ Erro ao confirmar PIX:', error);
      throw error;
    }
  }

  /**
   * Confirmar mint blockchain (atualizar apenas status blockchain) - COM LOCK ATÔMICO
   */
  async confirmBlockchainMint(transactionId, blockchainData) {
    try {
      if (!this.prisma) await this.init();
      
      // TRANSAÇÃO ATÔMICA COM LOCK PARA PREVENIR DUPLICAÇÃO
      const result = await this.prisma.$transaction(async (prisma) => {
        // Buscar E LOCKEAR transação atomicamente
        const transaction = await prisma.transaction.findUnique({
          where: { id: transactionId }
        });

        if (!transaction) {
          throw new Error('Transação não encontrada');
        }

        // VERIFICAÇÃO CRÍTICA: Se já foi processado, ABORTAR imediatamente
        const blockchainStatus = transaction.metadata?.blockchainStatus;
        if (blockchainStatus === 'confirmed') {
          console.log(`🛡️ DUPLICATA DETECTADA E BLOQUEADA: ${transactionId} já foi processado`);
          return { already_processed: true, transaction };
        }

        if (blockchainStatus !== 'pending') {
          throw new Error(`Blockchain status inválido: ${blockchainStatus}. Esperado: pending`);
        }

        // VALIDAR: PIX deve estar confirmado antes de confirmar status geral
        const pixStatus = transaction.metadata?.pixStatus;
        if (pixStatus !== 'confirmed') {
          throw new Error(`PIX deve estar confirmado antes da blockchain. PIX status: ${pixStatus}`);
        }

        // Atualizar ATOMICAMENTE para confirmed
        return await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            // Dados blockchain (usar txHash como campo principal)
            txHash: blockchainData.txHash, // Campo principal unificado
            blockNumber: BigInt(blockchainData.blockNumber || 0),
            fromAddress: blockchainData.fromAddress || transaction.fromAddress,
            toAddress: blockchainData.toAddress || transaction.toAddress,

            // Status geral CONFIRMADO (só agora que PIX + Blockchain estão ok)
            status: 'confirmed',
            confirmedAt: new Date(),

            // Atualizar metadata
            metadata: {
              ...transaction.metadata,
              blockchainStatus: 'confirmed',
              blockchainConfirmedAt: new Date().toISOString(),
              blockchainTxHash: blockchainData.txHash,
              blockchainBlockNumber: blockchainData.blockNumber,
              blockchainConfirmation: {
                confirmedAt: new Date().toISOString(),
                txHash: blockchainData.txHash,
                blockNumber: blockchainData.blockNumber,
                gasUsed: blockchainData.gasUsed
              }
            }
          }
        });
      });

      // Se já foi processado, retornar sem fazer nada
      if (result.already_processed) {
        return result.transaction;
      }

      // Notificar usuário (somente se não foi processado anteriormente)
      await this.notificationService.createNotification({
        userId: result.userId,
        type: 'success',
        title: 'Depósito Confirmado',
        message: `Seu depósito de ${result.net_amount} cBRL foi confirmado com sucesso!`,
        data: {
          transactionId: result.id,
          amount: result.net_amount,
          type: 'deposit_confirmed'
        }
      });

      console.log(`✅ Blockchain confirmado para transação ${transactionId}`);

      return result;

    } catch (error) {
      console.error('❌ Erro ao confirmar blockchain:', error);
      throw error;
    }
  }

  /**
   * Marcar falha no PIX
   */
  async failPixDeposit(transactionId, reason) {
    try {
      if (!this.prisma) await this.init();
      
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      return await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          pix_status: 'failed',
          pix_failed_at: new Date(),
          status: 'failed',
          failedAt: new Date(),
          metadata: {
            ...(transaction?.metadata || {}),
            failureReason: reason,
            failedAt: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao marcar falha PIX:', error);
      throw error;
    }
  }

  /**
   * Marcar falha no blockchain
   */
  async failBlockchainMint(transactionId, reason) {
    try {
      if (!this.prisma) await this.init();
      
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      return await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'failed',
          failedAt: new Date(),
          metadata: {
            ...(transaction?.metadata || {}),
            blockchainStatus: 'failed',
            blockchainFailedAt: new Date().toISOString(),
            blockchainFailureReason: reason,
            failedAt: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao marcar falha blockchain:', error);
      throw error;
    }
  }

  /**
   * Obter status do depósito
   */
  async getDepositStatus(transactionId) {
    try {
      if (!this.prisma) await this.init();
      
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });
      
      if (!transaction) {
        throw new Error('Transação não encontrada');
      }
      
      return {
        id: transaction.id,
        amount: transaction.amount,
        fee: transaction.fee,
        totalAmount: parseFloat(transaction.amount || 0) + parseFloat(transaction.fee || 0),
        status: transaction.status,
        pixCode: transaction.metadata?.pixCode || '',
        qrCodeImage: transaction.metadata?.qrCodeImage || '',
        pixStatus: transaction.metadata?.pixStatus || 'pending',
        blockchainStatus: transaction.metadata?.blockchainStatus || null,
        pixTransactionId: transaction.metadata?.pixTransactionId || null,
        blockchainTxHash: transaction.metadata?.blockchainTxHash || transaction.txHash,
        createdAt: transaction.createdAt,
        confirmedAt: transaction.confirmedAt,
        metadata: transaction.metadata
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter status do depósito:', error);
      throw error;
    }
  }

  /**
   * Processa um depósito após confirmação do PIX
   * Envia para fila de mint na blockchain
   */
  async processDeposit(transactionId) {
    try {
      if (!this.prisma) await this.init();
      
      console.log(`🔄 Processando depósito ${transactionId} para mint na blockchain`);
      
      // Buscar a transação
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true }
      });
      
      if (!transaction) {
        throw new Error(`Transação ${transactionId} não encontrada`);
      }
      
      // Verificar se o PIX está confirmado
      if (transaction.pix_status !== 'confirmed') {
        console.warn(`⚠️ Transação ${transactionId} com PIX não confirmado: ${transaction.pix_status}`);
        return;
      }
      
      // Verificar se já foi processado
      if (transaction.blockchain_status === 'confirmed') {
        console.log(`✅ Transação ${transactionId} já processada na blockchain`);
        return;
      }
      
      // Buscar endereço do usuário diretamente do banco
      const user = await this.prisma.user.findUnique({
        where: { id: transaction.userId },
        select: {
          publicKey: true,
          email: true
        }
      });

      const recipientAddress = user?.publicKey;

      if (!recipientAddress) {
        console.error('❌ [MINT] Usuário não possui chave pública (publicKey):', user?.email);
        throw new Error('Usuário não possui chave pública (publicKey) configurada');
      }

      console.log('✅ [MINT] Chave pública encontrada para', user.email, ':', recipientAddress);

      // Enviar para fila de mint
      const amqp = require('amqplib');
      const connection = await amqp.connect('amqp://localhost');
      const channel = await connection.createChannel();

      await channel.assertQueue('blockchain.mint', { durable: true });

      const mintMessage = {
        transactionId: transaction.id,
        userId: transaction.userId,
        amount: transaction.net_amount || transaction.amount,
        recipientAddress: recipientAddress,
        network: process.env.DEFAULT_NETWORK || 'testnet',
        type: 'deposit'
      };
      
      channel.sendToQueue(
        'blockchain.mint',
        Buffer.from(JSON.stringify(mintMessage)),
        { persistent: true }
      );
      
      console.log(`✅ Depósito ${transactionId} enviado para fila de mint`);
      
      await channel.close();
      await connection.close();
      
      // Atualizar status para indicar que foi enviado para processamento
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          metadata: {
            ...transaction.metadata,
            blockchainStatus: 'pending',
            sentToMintQueue: true,
            sentToMintAt: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao processar depósito:', error);
      throw error;
    }
  }
}

module.exports = new DepositService();
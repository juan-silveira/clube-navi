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
      
      // Buscar empresa do usuário
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userCompanies: {
            include: {
              company: true
            }
          }
        }
      });

      const companyId = user?.userCompanies?.[0]?.company?.id;
      if (!companyId) {
        throw new Error('Usuário não possui empresa associada');
      }

      // Calcular taxa usando UserTaxesService
      const feeCalculation = await userTaxesService.calculateDepositFee(userId, amount);
      const fee = feeCalculation.fee;
      const totalAmount = feeCalculation.totalAmount; // Valor total que o usuário deve pagar
      const netAmount = amount; // Valor que será creditado em cBRL

      // Endereços e configurações padrão
      const ADMIN_ADDRESS = process.env.ADMIN_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3';
      
      // Determinar a rede e o contrato correto
      const NETWORK = process.env.DEFAULT_NETWORK || 'mainnet'; // Usar mainnet por padrão em produção

      // DEBUG TEMPORÁRIO - REMOVER DEPOIS
      console.log('🔍 [DEPOSIT DEBUG] DEFAULT_NETWORK from env:', process.env.DEFAULT_NETWORK);
      console.log('🔍 [DEPOSIT DEBUG] NETWORK final value:', NETWORK);
      
      // Usar contrato correto baseado na rede
      // Mainnet: 0x18e946548b2C24Ad371343086e424ABaC3393678
      // Testnet: 0x0A8c73967e4Eee8ffA06484C3fBf65E6Ae3b9804
      const CONTRACT_ADDRESS = NETWORK === 'testnet' 
        ? '0x0A8c73967e4Eee8ffA06484C3fBf65E6Ae3b9804'  // Testnet contract
        : '0x18e946548b2C24Ad371343086e424ABaC3393678'; // Mainnet contract (produção)

      // CRIAR TRANSAÇÃO ÚNICA com campos unificados e padronizados
      const transaction = await this.prisma.transaction.create({
        data: {
          id: uuidv4(),
          userId: userId,
          companyId: companyId,
          transactionType: 'deposit', // Padronizado como 'deposit'
          
          // Status principal
          status: 'pending',
          
          // Valores
          amount: parseFloat(amount), // Valor base (sem taxa)
          fee: parseFloat(fee),
          net_amount: parseFloat(netAmount), // Valor que será creditado
          currency: 'cBRL', // Depósito resulta em cBRL
          
          // Blockchain fields (preenchidos desde o início)
          network: NETWORK,
          contractAddress: CONTRACT_ADDRESS,
          fromAddress: ADMIN_ADDRESS, // Endereço admin (mint vem do admin)
          toAddress: user?.blockchainAddress || user?.publicKey, // Endereço do usuário
          functionName: 'mint',
          
          // PIX - Inicialmente pendente
          pix_status: 'pending',
          pix_key: 'contato@coinage.com.br',
          pix_key_type: 'EMAIL',
          
          // Blockchain - Inicialmente null (só inicia após PIX confirmado)
          blockchain_status: null,
          
          // Tipo de operação
          operation_type: 'deposit',
          
          // Metadata
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
            userAddress: user?.blockchainAddress || user?.publicKey
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
          blockchainAddress: true
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

        // Atualizar transação com dados do PIX
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            pix_transaction_id: pixCharge.paymentId,
            metadata: {
              ...transaction.metadata,
              pixPaymentId: pixCharge.paymentId,
              pixCode: pixCharge.pixCode,
              qrCodeImage: pixCharge.qrCodeImage,
              expiresAt: pixCharge.expiresAt,
              asaasData: pixCharge.asaasData
            }
          }
        });

        console.log(`💾 Dados salvos no banco para transação ${transaction.id}`);

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
        const pixData = {
          pixPaymentId,
          transactionId: transaction.id,
          amount: parseFloat(totalAmount),
          netAmount: parseFloat(netAmount),
          fee: parseFloat(fee),
          status: 'pending',
          qrCode: `00020126580014br.gov.bcb.pix2536pix-qr.mercadopago.com/instore/o/v2/${pixPaymentId}5204000053039865802BR5925Coinage Tecnologia6009Sao Paulo62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          pixKey: 'contato@coinage.com.br',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          createdAt: new Date(),
          error: pixError.message
        };

        console.log(`📱 PIX fallback (mock) criado: ${pixPaymentId} para transação ${transaction.id}`);

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

      if (transaction.pix_status !== 'pending') {
        throw new Error('PIX não está pendente');
      }

      // TRANSAÇÃO ATÔMICA: Atualizar PIX e controlar fila blockchain
      const updatedTransaction = await this.prisma.$transaction(async (prisma) => {
        // Verificar se blockchain já foi iniciado (prevenir múltiplos envios para fila)
        const currentTransaction = await prisma.transaction.findUnique({
          where: { id: transactionId }
        });

        if (currentTransaction.blockchain_status !== null) {
          console.log(`🛡️ BLOCKCHAIN JÁ INICIADO: ${transactionId} (status: ${currentTransaction.blockchain_status})`);
          return currentTransaction; // Retornar sem enviar novamente para fila
        }

        // Atualizar atomicamente PIX e iniciar blockchain
        return await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            // PIX confirmado
            pix_status: 'confirmed',
            pix_confirmed_at: new Date(),
            pix_transaction_id: pixData?.pixId || `mock_pix_${Date.now()}`,
            pix_end_to_end_id: pixData?.endToEndId || `E${Date.now()}`,
            
            // Iniciar blockchain ATOMICAMENTE
            blockchain_status: 'pending',
            
            // Status geral ainda pendente (aguardando blockchain)
            status: 'pending',
            
            // Atualizar metadata
            metadata: {
              ...currentTransaction.metadata,
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
      if (transaction.blockchain_status === null && updatedTransaction.blockchain_status === 'pending') {
        // Buscar endereço blockchain do usuário
        const user = await this.prisma.user.findUnique({
          where: { id: transaction.userId },
          select: { blockchainAddress: true, publicKey: true }
        });
        
        const recipientAddress = user?.blockchainAddress || user?.publicKey;
        if (!recipientAddress) {
          throw new Error('Usuário não possui endereço blockchain configurado');
        }

        // EXECUTAR MINT DIRETAMENTE AO INVÉS DE USAR FILA
        console.log(`🔄 Executando mint blockchain para: ${transactionId}`);
        
        try {
          const mintResult = await mintService.mintCBRL(
            recipientAddress,
            transaction.net_amount.toString(),
            process.env.DEFAULT_NETWORK || 'testnet',
            transactionId
          );

          if (mintResult.success) {
            // Atualizar transação com dados reais da blockchain
            const finalTransaction = await this.prisma.transaction.update({
              where: { id: transactionId },
              data: {
                blockchain_status: 'confirmed',
                blockchain_confirmed_at: new Date(),
                status: 'confirmed', // Status geral também confirmed
                confirmedAt: new Date(),
                txHash: mintResult.transactionHash,
                blockNumber: parseInt(mintResult.blockNumber) || null,
                gasUsed: parseInt(mintResult.gasUsed) || null,
                metadata: {
                  ...updatedTransaction.metadata,
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
              blockchain_status: 'failed',
              status: 'failed',
              metadata: {
                ...updatedTransaction.metadata,
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
        if (transaction.blockchain_status === 'confirmed') {
          console.log(`🛡️ DUPLICATA DETECTADA E BLOQUEADA: ${transactionId} já foi processado`);
          return { already_processed: true, transaction };
        }

        if (transaction.blockchain_status !== 'pending') {
          throw new Error(`Blockchain status inválido: ${transaction.blockchain_status}. Esperado: pending`);
        }

        // VALIDAR: PIX deve estar confirmado antes de confirmar status geral
        if (transaction.pix_status !== 'confirmed') {
          throw new Error(`PIX deve estar confirmado antes da blockchain. PIX status: ${transaction.pix_status}`);
        }

        // Atualizar ATOMICAMENTE para confirmed
        return await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            // Blockchain confirmado
            blockchain_status: 'confirmed',
            blockchain_confirmed_at: new Date(),
            blockchain_tx_hash: blockchainData.txHash,
            blockchain_block_number: blockchainData.blockNumber,
            
            // Dados blockchain (usar txHash como campo principal)
            txHash: blockchainData.txHash, // Campo principal unificado
            blockNumber: blockchainData.blockNumber,
            fromAddress: blockchainData.fromAddress || transaction.fromAddress,
            toAddress: blockchainData.toAddress || transaction.toAddress,
            gasUsed: blockchainData.gasUsed,
            
            // Status geral CONFIRMADO (só agora que PIX + Blockchain estão ok)
            status: 'confirmed',
            confirmedAt: new Date(),
            
            // Atualizar metadata
            metadata: {
              ...transaction.metadata,
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
          blockchain_status: 'failed',
          blockchain_failed_at: new Date(),
          status: 'failed',
          failedAt: new Date(),
          metadata: {
            ...(transaction?.metadata || {}),
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
        pixStatus: transaction.pix_status,
        blockchainStatus: transaction.blockchain_status,
        pixTransactionId: transaction.pix_transaction_id,
        blockchainTxHash: transaction.blockchain_tx_hash || transaction.txHash,
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
          blockchainAddress: true,
          publicKey: true,
          email: true
        }
      });

      const recipientAddress = user?.blockchainAddress || user?.publicKey;

      if (!recipientAddress) {
        console.error('❌ [MINT] Usuário não possui endereço blockchain:', user?.email);
        throw new Error('Usuário não possui endereço blockchain configurado');
      }

      console.log('✅ [MINT] Endereço encontrado para', user.email, ':', recipientAddress);

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
          blockchain_status: 'pending',
          metadata: {
            ...transaction.metadata,
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
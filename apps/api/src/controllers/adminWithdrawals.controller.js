const prismaConfig = require('../config/prisma');
const NotificationService = require('../services/notification.service');

class AdminWithdrawalsController {
  constructor() {
    this.prisma = null;
    this.notificationService = new NotificationService();
  }

  async init() {
    if (!this.prisma) {
      await prismaConfig.initialize();
      this.prisma = prismaConfig.getPrisma();
    }
  }

  /**
   * Listar todos os saques (para admins) - mantido para compatibilidade
   */
  async getPendingWithdrawals(req, res) {
    return this.getAllWithdrawals(req, res);
  }

  /**
   * Listar todos os saques (para admins)
   */
  async getAllWithdrawals(req, res) {
    try {
      console.log('🔍 [AdminWithdrawals] Iniciando getAllWithdrawals');

      await this.init();

      console.log('🔍 [AdminWithdrawals] Buscando withdrawals para admin:', {
        userId: req.user.id,
        userName: req.user.name,
        roles: req.user.userCompanies?.map(uc => uc.role)
      });

      console.log('🔍 [AdminWithdrawals] Query: burnTxHash not null');

      // Buscar todos os saques (PENDING, CONFIRMED, FAILED) que já tiveram o burn executado
      const withdrawals = await this.prisma.withdrawal.findMany({
        where: {
          burnTxHash: {
            not: null
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              publicKey: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Buscar também as transactions correspondentes
      const withdrawalIds = withdrawals.map(w => w.id);

      console.log('🔍 [AdminWithdrawals] Withdrawals encontrados:', withdrawals.length);
      console.log('🔍 [AdminWithdrawals] Withdrawal IDs:', withdrawalIds);

      let transactions = [];

      // Só buscar transactions se houver withdrawals
      // NOTE: withdrawalId is stored in metadata JSON field, not as a direct foreign key
      if (withdrawalIds.length > 0) {
        // Buscar todas as transactions que têm withdrawalId no metadata
        const allTransactions = await this.prisma.transaction.findMany({
          where: {
            metadata: {
              not: null
            }
          }
        });

        // Filtrar as transactions que pertencem aos withdrawals que estamos buscando
        transactions = allTransactions.filter(t => {
          const withdrawalId = t.metadata?.withdrawalId;
          return withdrawalId && withdrawalIds.includes(withdrawalId);
        });

        console.log('🔍 [AdminWithdrawals] Transactions encontradas:', transactions.length);
      }

      // Mapear transactions por withdrawalId
      const transactionMap = {};
      transactions.forEach(t => {
        const withdrawalId = t.metadata?.withdrawalId;
        if (withdrawalId) {
          transactionMap[withdrawalId] = t;
        }
      });

      // Combinar dados
      const enrichedWithdrawals = withdrawals.map(w => ({
        ...w,
        transaction: transactionMap[w.id] || null
      }));

      return res.status(200).json({
        success: true,
        withdrawals: enrichedWithdrawals,
        total: enrichedWithdrawals.length
      });

    } catch (error) {
      console.error('Erro ao buscar saques:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar saques',
        error: error.message
      });
    }
  }

  /**
   * Confirmar pagamento manual de saque
   */
  async confirmWithdrawalPayment(req, res) {
    try {
      await this.init();

      const { id } = req.params;
      const { receiptCode } = req.body;

      // Verificar se o usuário é admin
      if (!req.user.isApiAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem confirmar pagamentos.'
        });
      }

      if (!receiptCode) {
        return res.status(400).json({
          success: false,
          message: 'Código do recibo é obrigatório'
        });
      }

      // Buscar o saque
      const withdrawal = await this.prisma.withdrawal.findUnique({
        where: { id },
        include: {
          user: true
        }
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Saque não encontrado'
        });
      }

      if (withdrawal.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Saque não está pendente. Status atual: ${withdrawal.status}`
        });
      }

      // Iniciar transação do banco de dados
      const result = await this.prisma.$transaction(async (prisma) => {
        // Atualizar withdrawal
        const updatedWithdrawal = await prisma.withdrawal.update({
          where: { id },
          data: {
            status: 'CONFIRMED',
            pixStatus: 'CONFIRMED',
            pixTransactionId: receiptCode,
            completedAt: new Date(),
            metadata: {
              ...withdrawal.metadata,
              manualConfirmation: {
                confirmedBy: req.user.id,
                confirmedByName: req.user.name,
                confirmedAt: new Date().toISOString(),
                receiptCode: receiptCode
              }
            }
          }
        });

        // Primeiro, vamos verificar se existe uma transaction para este withdrawal
        // O withdrawalId está salvo no metadata da transaction
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            metadata: {
              path: ['withdrawalId'],
              equals: id
            }
          }
        });
        console.log(`🔍 Transaction encontrada para withdrawal ${id}:`, existingTransaction ? 'SIM' : 'NÃO');

        // Atualizar transaction associada usando metadata
        console.log(`🔄 Atualizando transaction para withdrawal: ${id}`);
        const updatedTransaction = await prisma.transaction.updateMany({
          where: {
            metadata: {
              path: ['withdrawalId'],
              equals: id
            }
          },
          data: {
            status: 'confirmed',
            pix_status: 'confirmed',
            pix_transaction_id: receiptCode,
            pix_confirmed_at: new Date()
            // updatedAt é atualizado automaticamente pelo Prisma
          }
        });
        console.log(`✅ Transaction atualizada. Registros afetados: ${updatedTransaction.count}`);

        return { updatedWithdrawal, updatedTransaction };
      });

      // Enviar notificação para o usuário
      try {
        await this.notificationService.sendNotification({
          userId: withdrawal.user.id,
          type: 'WITHDRAWAL_CONFIRMED',
          title: 'Saque Concluído',
          message: `🎉 **Seu saque foi concluído com sucesso!**

💰 **Detalhes do Saque:**
• Valor solicitado: **R$ ${withdrawal.amount.toFixed(2)}**
• Taxa aplicada: **R$ ${withdrawal.fee.toFixed(2)}**
• **Valor enviado por PIX: R$ ${withdrawal.netAmount.toFixed(2)}**

🏦 **Destino:**
• Chave PIX: \`${withdrawal.pixKey}\`

📋 **Comprovante:**
• Código do recibo: \`${receiptCode}\`

✅ O valor já foi transferido para sua conta!`,
          data: {
            withdrawalId: id,
            amount: withdrawal.amount,
            fee: withdrawal.fee,
            netAmount: withdrawal.netAmount,
            pixKey: withdrawal.pixKey,
            receiptCode: receiptCode
          }
        });
      } catch (notificationError) {
        console.error('Erro ao enviar notificação:', notificationError);
        // Não falhar a operação por causa da notificação
      }

      // Enviar email de confirmação
      try {
        await this.notificationService.sendEmail({
          to: withdrawal.user.email,
          subject: 'Saque Concluído com Sucesso',
          template: 'withdrawal-confirmed',
          data: {
            userName: withdrawal.user.name,
            requestedAmount: withdrawal.amount.toFixed(2),
            fee: withdrawal.fee.toFixed(2),
            netAmount: withdrawal.netAmount.toFixed(2),
            pixKey: withdrawal.pixKey,
            receiptCode: receiptCode,
            date: new Date().toLocaleString('pt-BR')
          }
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falhar a operação por causa do email
      }

      return res.status(200).json({
        success: true,
        message: 'Pagamento confirmado com sucesso',
        withdrawal: result.updatedWithdrawal
      });

    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao confirmar pagamento',
        error: error.message
      });
    }
  }

  /**
   * Rejeitar saque (em caso de problemas)
   */
  async rejectWithdrawal(req, res) {
    try {
      await this.init();

      const { id } = req.params;
      const { reason } = req.body;

      // Verificar se o usuário é admin
      if (!req.user.isApiAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem rejeitar saques.'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Motivo da rejeição é obrigatório'
        });
      }

      // Buscar o saque
      const withdrawal = await this.prisma.withdrawal.findUnique({
        where: { id },
        include: {
          user: true
        }
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Saque não encontrado'
        });
      }

      // Atualizar status
      const updatedWithdrawal = await this.prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'FAILED',
          pixStatus: 'FAILED',
          metadata: {
            ...withdrawal.metadata,
            rejection: {
              rejectedBy: req.user.id,
              rejectedByName: req.user.name,
              rejectedAt: new Date().toISOString(),
              reason: reason
            }
          }
        }
      });

      // Atualizar transaction usando metadata
      await this.prisma.transaction.updateMany({
        where: {
          metadata: {
            path: ['withdrawalId'],
            equals: id
          }
        },
        data: {
          status: 'failed',
          pix_status: 'failed',
          pix_failed_at: new Date()
          // updatedAt é atualizado automaticamente pelo Prisma
        }
      });

      // Notificar usuário sobre a rejeição
      await this.notificationService.sendNotification({
        userId: withdrawal.user.id,
        type: 'WITHDRAWAL_REJECTED',
        title: 'Saque Rejeitado',
        message: `Seu saque foi rejeitado. Motivo: ${reason}. Entre em contato com o suporte para mais informações.`,
        data: {
          withdrawalId: id,
          reason: reason
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Saque rejeitado',
        withdrawal: updatedWithdrawal
      });

    } catch (error) {
      console.error('Erro ao rejeitar saque:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao rejeitar saque',
        error: error.message
      });
    }
  }

  /**
   * Obter histórico de saques processados
   */
  async getProcessedWithdrawals(req, res) {
    try {
      await this.init();

      // Verificar se o usuário é admin
      if (!req.user.isApiAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem rejeitar saques.'
        });
      }

      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        status: {
          in: status ? [status] : ['CONFIRMED', 'FAILED']
        }
      };

      const [withdrawals, total] = await Promise.all([
        this.prisma.withdrawal.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                cpf: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          },
          skip,
          take: parseInt(limit)
        }),
        this.prisma.withdrawal.count({ where })
      ]);

      return res.status(200).json({
        success: true,
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Erro ao buscar histórico de saques:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de saques',
        error: error.message
      });
    }
  }

  /**
   * Obter detalhes de um saque específico
   */
  async getWithdrawal(req, res) {
    try {
      await this.init();

      const { id } = req.params;

      console.log(`🔍 [AdminWithdrawals] Buscando saque: ${id}`);

      // Verificar se o usuário é admin
      if (!req.user.isApiAdmin) {
        console.log('🔍 [AdminWithdrawals] Acesso negado:', {
          userId: req.user.id,
          isApiAdmin: req.user.isApiAdmin
        });
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
        });
      }

      const withdrawal = await this.prisma.withdrawal.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              publicKey: true
            }
          }
        }
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Saque não encontrado'
        });
      }

      // Buscar também a transaction correspondente
      // NOTE: withdrawalId is stored in metadata JSON field
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          metadata: {
            path: ['withdrawalId'],
            equals: withdrawal.id
          }
        }
      });

      return res.status(200).json({
        success: true,
        withdrawal: {
          ...withdrawal,
          transaction: transaction || null
        }
      });

    } catch (error) {
      console.error('Erro ao buscar saque:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar saque',
        error: error.message
      });
    }
  }
}

module.exports = new AdminWithdrawalsController();
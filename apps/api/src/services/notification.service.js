const { PrismaClient } = require('../generated/prisma');
const { t } = require('../utils/i18n');

class NotificationService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Obter idioma preferido do usuário
   */
  async getUserLanguage(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { preferredLanguage: true }
      });
      return user?.preferredLanguage || 'pt-BR';
    } catch (error) {
      console.warn(`⚠️ Erro ao obter idioma do usuário ${userId}:`, error.message);
      return 'pt-BR'; // Fallback
    }
  }

  /**
   * Limpar markdown de uma string, mantendo emojis
   */
  cleanMarkdown(text) {
    if (!text) return text;
    
    // Remover markdown básico, mas manter emojis
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // **bold** -> bold
      .replace(/\*(.*?)\*/g, '$1')     // *italic* -> italic
      .replace(/`(.*?)`/g, '$1')       // `code` -> code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // [text](url) -> text
      .replace(/^#{1,6}\s+/gm, '')    // # heading -> heading
      .replace(/^\s*[-*+]\s+/gm, '')  // - list item -> list item
      .replace(/^\s*\d+\.\s+/gm, '')  // 1. list item -> list item
      .replace(/\n\s*\n/g, '\n')      // Múltiplas quebras de linha -> uma
      .trim();
  }

  /**
   * Obter emoji baseado no tipo de notificação
   */
  getNotificationEmoji(type) {
    const emojiMap = {
      'balance_change': '💰',
      'token_received': '📥',
      'token_sent': '📤',
      'system': '🔔',
      'warning': '⚠️',
      'success': '✅',
      'error': '❌',
      'info': 'ℹ️'
    };
    
    return emojiMap[type] || '🔔';
  }

  /**
   * Alias para createNotification (compatibilidade)
   */
  async sendNotification(data) {
    return this.createNotification(data);
  }

  /**
   * Criar uma nova notificação
   */
  async createNotification(data) {
    try {
      // Criar string de título com emoji baseado no tipo
      const emoji = data.type ? this.getNotificationEmoji(data.type) : '🔔';
      const titleWithEmoji = `${emoji} ${data.title}`;
      
      // Adicionar informações de tipo, prioridade e categoria na mensagem se fornecidas
      let enhancedMessage = data.message;
      if (data.type || data.priority || data.category) {
        const metaInfo = [];
        // if (data.type) metaInfo.push(`Tipo: ${data.type}`);
        // if (data.priority) metaInfo.push(`Prioridade: ${data.priority}`);
        // if (data.category) metaInfo.push(`Categoria: ${data.category}`);
        enhancedMessage = `${data.message}\n\n${metaInfo.join(' | ')}`;
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          sender: data.sender || 'Coinage',
          title: titleWithEmoji,
          message: enhancedMessage,
          isRead: false,
          isActive: true
        }
      });
      
      // Emitir evento para notificações em tempo real
      this.emitNotificationEvent(notification);
      
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  /**
   * Emitir evento de notificação criada
   */
  emitNotificationEvent(notification) {
    try {
      // Emitir evento no processo para que outros componentes possam escutar
      process.emit('notification:created', {
        userId: notification.userId,
        notification: notification,
        timestamp: new Date().toISOString()
      });
      
      // Se existir WebSocket global, emitir para o usuário específico
      if (global.io) {
        global.io.to(`user:${notification.userId}`).emit('notification', {
          notification: notification,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao emitir evento de notificação:', error);
    }
  }

  /**
   * Listar todas as notificações de um usuário (incluindo excluídas)
   */
  async getAllNotifications(userId) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar todas as notificações:', error);
      throw error;
    }
  }

  /**
   * Listar todas as notificações ativas de um usuário
   */
  async getActiveNotifications(userId) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  /**
   * Obter notificação específica por ID
   */
  async getNotificationById(notificationId, userId) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: userId,
          isActive: true
        }
      });
      return notification;
    } catch (error) {
      console.error('Erro ao buscar notificação por ID:', error);
      throw error;
    }
  }

  /**
   * Listar notificações não lidas de um usuário
   */
  async getUnreadNotifications(userId) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId: userId,
          isActive: true,
          isRead: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      throw error;
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId) {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId
        },
        data: {
          isRead: true,
          readDate: new Date()
        }
      });
      return notification;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  /**
   * Marcar notificação como não lida
   */
  async markAsUnread(notificationId) {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId
        },
        data: {
          isRead: false,
          readDate: null
        }
      });
      return notification;
    } catch (error) {
      console.error('Erro ao marcar notificação como não lida:', error);
      throw error;
    }
  }

  /**
   * Marcar/desmarcar notificação como favorita
   */
  async toggleFavorite(notificationId) {
    try {
      const currentNotification = await this.prisma.notification.findUnique({
        where: { id: notificationId }
      });

      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId
        },
        data: {
          isFavorite: !currentNotification.isFavorite
        }
      });
      return notification;
    } catch (error) {
      console.error('Erro ao alternar favorito da notificação:', error);
      throw error;
    }
  }

  /**
   * Marcar múltiplas notificações como lidas
   */
  async markMultipleAsRead(notificationIds) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          id: { in: notificationIds }
        },
        data: {
          isRead: true,
          readDate: new Date()
        }
      });
      return result;
    } catch (error) {
      console.error('Erro ao marcar múltiplas notificações como lidas:', error);
      throw error;
    }
  }

  /**
   * Marcar todas as notificações de um usuário como lidas
   */
  async markAllAsRead(userId) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId: userId,
          isActive: true,
          isRead: false
        },
        data: {
          isRead: true,
          readDate: new Date()
        }
      });
      return result;
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  /**
   * Marcar todas as notificações de um usuário como não lidas
   */
  async markAllAsUnread(userId) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId: userId,
          isActive: true,
          isRead: true
        },
        data: {
          isRead: false,
          readDate: null
        }
      });
      return result;
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como não lidas:', error);
      throw error;
    }
  }

  /**
   * Excluir múltiplas notificações
   */
  async deleteMultipleNotifications(notificationIds) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          id: { in: notificationIds }
        },
        data: {
          isActive: false,
          deleteDate: new Date()
        }
      });
      return result;
    } catch (error) {
      console.error('Erro ao excluir múltiplas notificações:', error);
      throw error;
    }
  }

  /**
   * Restaurar notificação excluída
   */
  async restoreNotification(notificationId, userId) {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          isActive: true,
          deleteDate: null
        }
      });
      return notification;
    } catch (error) {
      console.error('Erro ao restaurar notificação:', error);
      throw error;
    }
  }

  /**
   * Marcar notificação como excluída (soft delete)
   */
  async deleteNotification(notificationId) {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId
        },
        data: {
          isActive: false,
          deleteDate: new Date()
        }
      });
      return notification;
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      throw error;
    }
  }

  /**
   * Enviar email (stub por enquanto)
   */
  async sendEmail(data) {
    try {
      console.log(`📧 Enviando email para: ${data.to}`);
      console.log(`   Assunto: ${data.subject}`);
      console.log(`   Template: ${data.template}`);
      console.log(`   Dados:`, data.data);

      // TODO: Implementar envio real de email quando o serviço estiver configurado

      return {
        success: true,
        message: 'Email enviado (simulado)'
      };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      // Não falhar a operação por causa do email
      return {
        success: false,
        message: 'Erro ao enviar email',
        error: error.message
      };
    }
  }

  /**
   * Contar notificações não lidas de um usuário
   */
  async getUnreadCount(userId) {
    try {
      const count = await this.prisma.notification.count({
        where: {
          userId: userId,
          isActive: true,
          isRead: false
        }
      });
      return count;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      throw error;
    }
  }

  /**
   * Criar notificação de mudança de saldo de token
   */
  async createBalanceChangeNotification(userId, tokenSymbol, oldAmount, newAmount, changePercent, changeType) {
    try {
      // Obter idioma do usuário
      const language = await this.getUserLanguage(userId);

      // Determinar tipo de mudança (aumentou/diminuiu)
      const isIncrease = changeType === 'aumentou' || changeType === 'increased' || changeType === 'aumentó';
      const emoji = isIncrease ? '📈' : '📉';

      // Traduzir tipo de mudança
      const translatedChangeType = t(language, 'notifications', isIncrease ? 'changeTypes.increased' : 'changeTypes.decreased');

      // Traduzir título e mensagem
      const title = emoji + ' ' + t(language, 'notifications', 'balance.changed.title', { tokenSymbol });
      const message = t(language, 'notifications', 'balance.changed.message', {
        tokenSymbol,
        changeType: translatedChangeType,
        oldAmount,
        newAmount,
        changePercent
      });

      const notification = await this.createNotification({
        userId: userId,
        sender: 'Coinage',
        title,
        message
      });

      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação de mudança de saldo:', error);
      throw error;
    }
  }

  /**
   * Criar notificação de mudança de saldo de token
   */
  async createTokenBalanceChangeNotification(userId, oldBalance, newBalance, tokenSymbol, walletAddress) {
    try {
      const balanceChange = newBalance - oldBalance;
      const changeAmount = Math.abs(balanceChange);

      if (balanceChange === 0) {
        return null; // Sem mudança
      }

      // Obter idioma do usuário
      const language = await this.getUserLanguage(userId);

      // Formatar endereço da carteira
      const formattedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

      let title, message;

      if (balanceChange > 0) {
        // Recebimento
        title = `💰 ${t(language, 'notifications', 'balance.received.title', { tokenSymbol })}`;
        message = t(language, 'notifications', 'balance.received.message', {
          walletAddress: formattedAddress,
          amount: changeAmount.toFixed(6),
          tokenSymbol,
          oldBalance: oldBalance.toFixed(6),
          newBalance: newBalance.toFixed(6)
        });
      } else {
        // Envio
        title = `💸 ${t(language, 'notifications', 'balance.sent.title', { tokenSymbol })}`;
        message = t(language, 'notifications', 'balance.sent.message', {
          walletAddress: formattedAddress,
          amount: changeAmount.toFixed(6),
          tokenSymbol,
          newBalance: newBalance.toFixed(6)
        });
      }

      const notification = await this.createNotification({
        userId: userId,
        sender: 'Coinage',
        title,
        message
      });

      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação de mudança de saldo:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de saque confirmado
   */
  async sendWithdrawalConfirmed(userId, withdrawalData) {
    try {
      const { withdrawalId, amount, pixKey, completedAt, endToEndId } = withdrawalData;

      // Obter idioma do usuário
      const language = await this.getUserLanguage(userId);

      // Mascarar a chave PIX para segurança
      const maskedPixKey = this.maskPixKey(pixKey);

      // Traduzir título e mensagem
      const title = t(language, 'notifications', 'withdrawal.confirmed.title');
      const message = t(language, 'notifications', 'withdrawal.confirmed.message', {
        amount: parseFloat(amount).toFixed(2),
        pixKey: maskedPixKey,
        completedAt: completedAt.toLocaleString(language === 'pt-BR' ? 'pt-BR' : language === 'es' ? 'es' : 'en-US'),
        endToEndId
      });

      return await this.createNotification({
        userId: userId,
        type: 'success',
        priority: 'high',
        category: 'financial',
        sender: 'Coinage - PIX',
        title,
        message,
        metadata: {
          type: 'withdrawal_confirmed',
          withdrawalId,
          amount,
          pixKey: maskedPixKey,
          endToEndId,
          completedAt: completedAt.toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao criar notificação de saque confirmado:', error);
      throw error;
    }
  }

  /**
   * Mascara a chave PIX para exibição segura
   */
  maskPixKey(pixKey) {
    if (!pixKey) return '';

    if (pixKey.includes('@')) {
      // Email
      const [username, domain] = pixKey.split('@');
      return `${username.substring(0, 2)}***@${domain}`;
    } else if (pixKey.replace(/\D/g, '').length === 11) {
      // CPF
      const cleanCPF = pixKey.replace(/\D/g, '');
      return `***${cleanCPF.slice(-3)}`;
    } else if (pixKey.replace(/\D/g, '').length === 14) {
      // CNPJ
      const cleanCNPJ = pixKey.replace(/\D/g, '');
      return `***${cleanCNPJ.slice(-4)}`;
    } else {
      // Telefone ou aleatória
      return `***${pixKey.slice(-4)}`;
    }
  }
}

module.exports = NotificationService;

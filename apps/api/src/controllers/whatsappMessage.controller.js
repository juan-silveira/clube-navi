const prismaConfig = require('../config/prisma');
const axios = require('axios');

// Templates de mensagens pré-definidas
const MESSAGE_TEMPLATES = {
  'welcome': {
    id: 'welcome',
    name: 'Boas-vindas',
    message: '👋 *Bem-vindo à Coinage!*\n\nOlá, {{nome}}!\n\nFicamos felizes em tê-lo conosco. Nossa plataforma oferece as melhores soluções em criptomoedas.\n\nSe precisar de ajuda, estamos à disposição!'
  },
  'document_reminder': {
    id: 'document_reminder',
    name: 'Lembrete de Documentos',
    message: '📄 *Lembrete de Documentação*\n\nOlá, {{nome}}!\n\nNotamos que você ainda não enviou todos os documentos necessários para validação da sua conta.\n\nPor favor, acesse o sistema e complete seu cadastro para ter acesso total à plataforma.'
  },
  'document_approved': {
    id: 'document_approved',
    name: 'Aprovação de Documentação',
    message: '✅ *Aprovação de Documentação da Coinage*\n\nOlá, {{nome}}!\n\nTodos os documentos necessários para validação da sua conta foram aprovados.\n\nAgora você tem acesso total à plataforma.'
  },
  'withdrawal_reminder': {
    id: 'withdrawal_reminder',
    name: 'Lembrete de Saque Pendente',
    message: '💰 *Saque Pendente*\n\nOlá, {{nome}}!\n\nVocê possui um saque pendente de aprovação. Estamos analisando sua solicitação e em breve retornaremos.\n\nAcompanhe o status pelo sistema!'
  },
  'general_announcement': {
    id: 'general_announcement',
    name: 'Comunicado Geral',
    message: '📢 *Comunicado Importante*\n\nOlá, {{nome}}!\n\n[Digite aqui o conteúdo do comunicado]\n\nAtenciosamente,\nEquipe Coinage'
  },
  'maintenance': {
    id: 'maintenance',
    name: 'Manutenção Programada',
    message: '🔧 *Manutenção Programada*\n\nOlá!\n\nInformamos que realizaremos uma manutenção programada em {{data}} às {{hora}}.\n\nDurante este período, alguns serviços podem ficar temporariamente indisponíveis.\n\nContamos com sua compreensão!'
  },
  'custom': {
    id: 'custom',
    name: 'Mensagem Personalizada',
    message: ''
  }
};

/**
 * Envia mensagens WhatsApp para usuários selecionados
 */
const sendMessages = async (req, res) => {
  try {
    const { recipientUserIds, message, templateId } = req.body;
    const senderUserId = req.user.id;

    // Validações
    if (!recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pelo menos um destinatário deve ser selecionado'
      });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A mensagem não pode estar vazia'
      });
    }

    const prisma = prismaConfig.getPrisma();

    // Buscar dados dos usuários destinatários
    const users = await prisma.user.findMany({
      where: { id: { in: recipientUserIds } },
      select: { id: true, name: true, phone: true }
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum usuário encontrado'
      });
    }

    console.log(`📱 [WHATSAPP] Enviando mensagens para ${users.length} usuários...`);

    let successCount = 0;
    let failureCount = 0;
    const recipientPhones = [];

    // Função para normalizar número de telefone (remover caracteres especiais)
    const normalizePhone = (phone) => {
      if (!phone) return null;
      // Remove todos os caracteres que não sejam números
      return phone.replace(/\D/g, '');
    };

    // Enviar mensagens
    for (const user of users) {
      if (user.phone) {
        // Normalizar o telefone removendo caracteres especiais
        const cleanPhone = normalizePhone(user.phone);

        if (!cleanPhone || cleanPhone.length < 10) {
          failureCount++;
          console.warn(`⚠️ [WHATSAPP] Telefone inválido para ${user.name} (${user.phone})`);
          continue;
        }

        try {
          // Substituir variáveis na mensagem
          const personalizedMessage = message
            .replace(/{{nome}}/g, user.name);

          await axios.post('https://webhook.n8n.net.br/webhook/envios-coinage', {
            user: 'Coinage',
            dest: cleanPhone,
            text: personalizedMessage
          });

          recipientPhones.push(cleanPhone);
          successCount++;
          console.log(`✅ [WHATSAPP] Mensagem enviada para ${user.name} (${user.phone} → ${cleanPhone})`);
        } catch (error) {
          failureCount++;
          console.error(`❌ [WHATSAPP] Erro ao enviar para ${user.name} (${cleanPhone}):`, error.message);
        }
      } else {
        failureCount++;
        console.warn(`⚠️ [WHATSAPP] Usuário ${user.name} não possui telefone cadastrado`);
      }
    }

    // Salvar no histórico
    const whatsappMessage = await prisma.whatsAppMessage.create({
      data: {
        senderUserId,
        recipientUserIds,
        recipientPhones,
        message,
        templateId: templateId || null,
        status: failureCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'partial'),
        successCount,
        failureCount
      }
    });

    console.log(`📊 [WHATSAPP] Resultado: ${successCount} enviadas, ${failureCount} falharam`);

    res.json({
      success: true,
      message: 'Mensagens enviadas com sucesso',
      data: {
        id: whatsappMessage.id,
        totalRecipients: users.length,
        successCount,
        failureCount,
        status: whatsappMessage.status
      }
    });

  } catch (error) {
    console.error('Erro ao enviar mensagens WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagens',
      error: error.message
    });
  }
};

/**
 * Lista templates de mensagens disponíveis
 */
const getTemplates = async (req, res) => {
  try {
    // Adicionar isSystem: true para todos os templates do código
    const templatesWithSystemFlag = Object.values(MESSAGE_TEMPLATES).map(t => ({
      ...t,
      isSystem: true
    }));

    res.json({
      success: true,
      data: templatesWithSystemFlag
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar templates',
      error: error.message
    });
  }
};

/**
 * Lista histórico de mensagens enviadas
 */
const getMessageHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prisma = prismaConfig.getPrisma();

    const [messages, total] = await Promise.all([
      prisma.whatsAppMessage.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { sentAt: 'desc' },
        select: {
          id: true,
          senderUserId: true,
          recipientUserIds: true,
          recipientPhones: true,
          message: true,
          templateId: true,
          status: true,
          successCount: true,
          failureCount: true,
          sentAt: true
        }
      }),
      prisma.whatsAppMessage.count()
    ]);

    // Buscar nomes dos destinatários
    const messagesWithRecipients = await Promise.all(
      messages.map(async (msg) => {
        const recipients = await prisma.user.findMany({
          where: { id: { in: msg.recipientUserIds } },
          select: { id: true, name: true, phone: true }
        });

        return {
          ...msg,
          recipients
        };
      })
    );

    res.json({
      success: true,
      data: {
        messages: messagesWithRecipients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de mensagens',
      error: error.message
    });
  }
};

module.exports = {
  sendMessages,
  getTemplates,
  getMessageHistory
};

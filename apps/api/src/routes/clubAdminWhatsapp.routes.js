/**
 * Club Admin WhatsApp Routes
 * Enviar mensagens WhatsApp para membros do clube
 */

const express = require('express');
const router = express.Router();
const { authenticateClubAdmin } = require('../middleware/clubAdmin.middleware');

/**
 * GET /api/club-admin/whatsapp/templates
 * Obter templates de mensagens WhatsApp
 */
router.get('/templates', authenticateClubAdmin, async (req, res) => {
  try {
    // Templates padrão para mensagens WhatsApp (baseado no sistema admin)
    const templates = [
      {
        id: 'welcome',
        name: 'Boas-vindas',
        message: '👋 *Bem-vindo ao Clube!*\n\nOlá!\n\nFicamos felizes em tê-lo conosco. Nossa plataforma oferece benefícios exclusivos e cashback em suas compras.\n\nSe precisar de ajuda, estamos à disposição!',
        isSystem: true
      },
      {
        id: 'cashback_available',
        name: 'Cashback Disponível',
        message: '💰 *Cashback Disponível!*\n\nOlá!\n\nVocê tem cashback disponível para usar em suas próximas compras.\n\nAproveite os benefícios do clube!',
        isSystem: true
      },
      {
        id: 'promotion',
        name: 'Promoção Especial',
        message: '🎉 *Promoção Especial!*\n\nOlá!\n\nTemos uma promoção especial para você! Confira as ofertas exclusivas dos nossos parceiros.\n\nNão perca essa oportunidade!',
        isSystem: true
      },
      {
        id: 'reminder',
        name: 'Lembrete de Benefícios',
        message: '⏰ *Lembrete Importante*\n\nOlá!\n\nNão se esqueça de usar seus benefícios e cashback acumulado.\n\nAproveite enquanto é tempo!',
        isSystem: true
      },
      {
        id: 'general_announcement',
        name: 'Comunicado Geral',
        message: '📢 *Comunicado Importante*\n\nOlá!\n\n[Digite aqui o conteúdo do comunicado]\n\nAtenciosamente,\nEquipe do Clube',
        isSystem: true
      },
      {
        id: 'new_partner',
        name: 'Novo Parceiro',
        message: '🤝 *Novo Parceiro no Clube!*\n\nOlá!\n\nTemos um novo parceiro com benefícios exclusivos para você.\n\nConfira as vantagens e aproveite!',
        isSystem: true
      },
      {
        id: 'custom',
        name: 'Mensagem Personalizada',
        message: '',
        isSystem: true
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('❌ [Club Admin WhatsApp Templates] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar templates'
    });
  }
});

/**
 * POST /api/club-admin/whatsapp/send
 * Enviar mensagens WhatsApp usando webhook real
 */
router.post('/send', authenticateClubAdmin, async (req, res) => {
  try {
    const { userIds, message } = req.body;
    const clubPrisma = req.clubPrisma;
    const clubAdmin = req.clubAdmin;
    const club = req.club;
    const axios = require('axios');

    // Validações
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum usuário selecionado'
      });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Mensagem não pode estar vazia'
      });
    }

    // Buscar usuários com telefone usando raw query para evitar erro de enum
    const users = await clubPrisma.$queryRawUnsafe(`
      SELECT
        id,
        first_name as "firstName",
        last_name as "lastName",
        phone
      FROM users
      WHERE id = ANY($1::uuid[])
        AND phone IS NOT NULL
        AND phone != ''
    `, userIds);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum usuário com telefone encontrado'
      });
    }

    console.log(`📱 [WHATSAPP] Enviando mensagens para ${users.length} usuários do clube ${club.companyName}...`);

    let successCount = 0;
    let failureCount = 0;
    const recipientPhones = [];
    const results = [];

    // Função para normalizar número de telefone
    const normalizePhone = (phone) => {
      if (!phone) return null;
      return phone.replace(/\D/g, '');
    };

    // Enviar mensagens via webhook n8n
    for (const user of users) {
      const cleanPhone = normalizePhone(user.phone);

      if (!cleanPhone || cleanPhone.length < 10) {
        failureCount++;
        console.warn(`⚠️ [WHATSAPP] Telefone inválido para ${user.firstName} ${user.lastName} (${user.phone})`);
        results.push({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          status: 'failed',
          error: 'Telefone inválido'
        });
        continue;
      }

      try {
        // Substituir variáveis na mensagem
        const personalizedMessage = message
          .replace(/{{nome}}/g, `${user.firstName} ${user.lastName}`)
          .replace(/\{nome\}/g, `${user.firstName} ${user.lastName}`);

        // Enviar via webhook n8n
        await axios.post('https://webhook.n8n.net.br/webhook/envios-coinage', {
          user: club.companyName || 'Clube Digital',
          dest: cleanPhone,
          text: personalizedMessage
        });

        recipientPhones.push(cleanPhone);
        successCount++;
        results.push({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          phone: cleanPhone,
          status: 'success',
          sentAt: new Date()
        });
        console.log(`✅ [WHATSAPP] Mensagem enviada para ${user.firstName} ${user.lastName} (${user.phone} → ${cleanPhone})`);
      } catch (error) {
        failureCount++;
        results.push({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          phone: cleanPhone,
          status: 'failed',
          error: error.message
        });
        console.error(`❌ [WHATSAPP] Erro ao enviar para ${user.firstName} ${user.lastName} (${cleanPhone}):`, error.message);
      }
    }

    console.log(`📊 [WHATSAPP] Resultado: ${successCount} enviadas, ${failureCount} falharam`);

    // TODO: Salvar histórico no banco (criar tabela whatsapp_messages no schema tenant)

    res.json({
      success: true,
      message: `Mensagens enviadas: ${successCount} sucesso, ${failureCount} falhas`,
      data: {
        totalSent: successCount,
        totalFailed: failureCount,
        results
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin WhatsApp Send] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagens',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/club-admin/whatsapp/history
 * Obter histórico de mensagens enviadas
 */
router.get('/history', authenticateClubAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // TODO: Implementar armazenamento real de histórico no banco
    // Por enquanto, retornar array vazio
    res.json({
      success: true,
      data: {
        messages: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      }
    });

  } catch (error) {
    console.error('❌ [Club Admin WhatsApp History] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar histórico'
    });
  }
});

module.exports = router;

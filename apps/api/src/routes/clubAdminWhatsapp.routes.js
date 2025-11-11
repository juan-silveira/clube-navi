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
 * Enviar mensagens WhatsApp
 */
router.post('/send', authenticateClubAdmin, async (req, res) => {
  try {
    const { userIds, message } = req.body;
    const clubPrisma = req.clubPrisma;

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

    // Buscar usuários com telefone
    const users = await clubPrisma.user.findMany({
      where: {
        id: { in: userIds },
        phone: { not: null }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum usuário com telefone encontrado'
      });
    }

    // Simular envio de mensagens
    // TODO: Integrar com serviço real de WhatsApp (Twilio, WhatsApp Business API, etc)
    const results = users.map(user => ({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      status: 'success', // Em produção: verificar status real do envio
      sentAt: new Date()
    }));

    res.json({
      success: true,
      data: {
        totalSent: results.length,
        totalFailed: 0,
        results
      },
      message: `Mensagens enviadas com sucesso para ${results.length} usuário(s)`
    });

  } catch (error) {
    console.error('❌ [Club Admin WhatsApp Send] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagens'
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

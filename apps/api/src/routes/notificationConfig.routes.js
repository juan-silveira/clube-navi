const express = require('express');
const router = express.Router();
const prismaConfig = require('../config/prisma');

/**
 * GET /api/notification-config
 * Retorna configuração atual
 */
router.get('/', async (req, res) => {
  try {
    const prisma = prismaConfig.getPrisma();
    const configs = await prisma.notificationConfig.findMany();

    // Converter para formato esperado
    const notificationConfig = {
      withdrawal: [],
      document: []
    };

    configs.forEach(config => {
      if (config.type === 'withdrawal') {
        notificationConfig.withdrawal = config.userIds || [];
      } else if (config.type === 'document') {
        notificationConfig.document = config.userIds || [];
      }
    });

    res.json({
      success: true,
      data: notificationConfig
    });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configuração'
    });
  }
});

/**
 * POST /api/notification-config
 * Atualiza configuração
 */
router.post('/', async (req, res) => {
  try {
    const prisma = prismaConfig.getPrisma();
    const { withdrawal, document } = req.body;

    // Atualizar configuração de withdrawal
    if (withdrawal !== undefined) {
      await prisma.notificationConfig.upsert({
        where: { type: 'withdrawal' },
        update: { userIds: withdrawal },
        create: { type: 'withdrawal', userIds: withdrawal }
      });
    }

    // Atualizar configuração de document
    if (document !== undefined) {
      await prisma.notificationConfig.upsert({
        where: { type: 'document' },
        update: { userIds: document },
        create: { type: 'document', userIds: document }
      });
    }

    // Buscar configuração atualizada
    const configs = await prisma.notificationConfig.findMany();
    const notificationConfig = {
      withdrawal: [],
      document: []
    };

    configs.forEach(config => {
      if (config.type === 'withdrawal') {
        notificationConfig.withdrawal = config.userIds || [];
      } else if (config.type === 'document') {
        notificationConfig.document = config.userIds || [];
      }
    });

    res.json({
      success: true,
      message: 'Configuração atualizada',
      data: notificationConfig
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configuração'
    });
  }
});

module.exports = { router };

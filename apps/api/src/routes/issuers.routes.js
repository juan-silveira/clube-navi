/**
 * Issuers Routes
 * Rotas para gerenciamento de emissores de ativos de investimento
 */

const express = require('express');
const router = express.Router();
const prismaConfig = require('../config/prisma');
const multer = require('multer');
const s3Service = require('../services/s3.service');

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Helper function to get prisma instance
const getPrisma = () => {
  try {
    return prismaConfig.getPrisma();
  } catch (error) {
    console.error('Prisma not initialized:', error.message);
    throw new Error('Database connection not available');
  }
};

/**
 * GET /api/issuers
 * Lista todos os emissores
 */
router.get('/', async (req, res) => {
  try {
    const prisma = getPrisma();

    const issuers = await prisma.issuer.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: issuers
    });

  } catch (error) {
    console.error('Error fetching issuers:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar emissores',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/issuers/:id
 * Busca um emissor por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    const issuer = await prisma.issuer.findUnique({
      where: { id }
    });

    if (!issuer) {
      return res.status(404).json({
        success: false,
        message: 'Emissor não encontrado'
      });
    }

    res.json({
      success: true,
      data: issuer
    });

  } catch (error) {
    console.error('Error fetching issuer:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar emissor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/issuers
 * Cria um novo emissor
 */
router.post('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { name, foundationYear, website, description } = req.body;

    // Validações básicas
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    // Converter foundationYear para número e validar
    const yearNum = foundationYear ? parseInt(foundationYear, 10) : null;
    const validYear = (yearNum && !isNaN(yearNum)) ? yearNum : null;

    const newIssuer = await prisma.issuer.create({
      data: {
        name,
        foundationYear: validYear,
        website,
        description
      }
    });

    res.status(201).json({
      success: true,
      data: newIssuer,
      message: 'Emissor criado com sucesso'
    });

  } catch (error) {
    console.error('Error creating issuer:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar emissor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * PUT /api/issuers/:id
 * Atualiza um emissor
 */
router.put('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;
    const { name, foundationYear, website, description, isActive } = req.body;

    // Verificar se emissor existe
    const existingIssuer = await prisma.issuer.findUnique({
      where: { id }
    });

    if (!existingIssuer) {
      return res.status(404).json({
        success: false,
        message: 'Emissor não encontrado'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (foundationYear !== undefined) {
      // Converter para número e validar
      const yearNum = foundationYear ? parseInt(foundationYear, 10) : null;
      updateData.foundationYear = (yearNum && !isNaN(yearNum)) ? yearNum : null;
    }
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedIssuer = await prisma.issuer.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedIssuer,
      message: 'Emissor atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating issuer:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar emissor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/issuers/:id
 * Remove (desativa) um emissor
 */
router.delete('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    await prisma.issuer.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    res.json({
      success: true,
      message: 'Emissor desativado com sucesso'
    });

  } catch (error) {
    console.error('Error deleting issuer:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Emissor não encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao remover emissor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/issuers/:id/upload-logo
 * Upload de logo do emissor
 */
router.post('/:id/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // Verificar se o emissor existe
    const prisma = getPrisma();
    const issuer = await prisma.issuer.findUnique({
      where: { id }
    });

    if (!issuer) {
      return res.status(404).json({
        success: false,
        message: 'Emissor não encontrado'
      });
    }

    // Upload para S3 usando a mesma estrutura de investment-products
    const uploadResult = await s3Service.uploadIssuerLogo(id, file);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload do logo'
      });
    }

    // Atualizar emissor com a URL do logo
    await prisma.issuer.update({
      where: { id },
      data: {
        logoUrl: uploadResult.url,
        logoKey: uploadResult.key
      }
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      },
      message: 'Logo enviado com sucesso'
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao fazer upload do logo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

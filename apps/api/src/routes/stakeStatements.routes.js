/**
 * Stake Statements Routes
 * Rotas para gerenciamento de demonstrativos de contratos de stake
 */

const express = require('express');
const router = express.Router();
const prismaConfig = require('../config/prisma');
const s3Service = require('../services/s3.service');
const multer = require('multer');

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas PDFs e imagens
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use PDF, JPEG, PNG ou WEBP.'));
    }
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
 * GET /api/stake-statements/:contractId
 * Listar demonstrativos de um contrato específico
 */
router.get('/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const prisma = getPrisma();

    // Verificar se o contrato existe
    const contract = await prisma.smartContract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Buscar demonstrativos ordenados por data (mais recentes primeiro)
    const statements = await prisma.stakeStatement.findMany({
      where: { contractId },
      orderBy: [
        { statementDate: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        contract: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: statements,
      count: statements.length
    });

  } catch (error) {
    console.error('Error listing statements:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar demonstrativos',
      error: error.message
    });
  }
});

/**
 * POST /api/stake-statements
 * Criar novo demonstrativo com upload de arquivo
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { contractId, companyId, statementDate, name, linkUrl } = req.body;
    const file = req.file;

    // Validações
    if (!contractId || !companyId || !statementDate || !name) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: contractId, companyId, statementDate, name'
      });
    }

    if (!file && !linkUrl) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo ou link é obrigatório'
      });
    }

    const prisma = getPrisma();

    // Verificar se o contrato existe
    const contract = await prisma.smartContract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Preparar dados para criação
    const statementData = {
      contractId,
      companyId,
      statementDate: new Date(statementDate),
      name
    };

    // Upload do arquivo para S3 (se houver)
    if (file) {
      const uploadResult = await s3Service.uploadProductDocument(
        contractId,
        file,
        'statements'
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao fazer upload do arquivo'
        });
      }

      statementData.fileUrl = uploadResult.url;
      statementData.fileKey = uploadResult.key;
    }

    // Adicionar link se fornecido
    if (linkUrl) {
      statementData.linkUrl = linkUrl;
    }

    // Criar demonstrativo no banco
    const statement = await prisma.stakeStatement.create({
      data: statementData,
      include: {
        contract: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: statement,
      message: 'Demonstrativo criado com sucesso'
    });

  } catch (error) {
    console.error('Error creating statement:', error);

    // Se houve erro após upload, tentar deletar o arquivo do S3
    if (req.uploadedFileKey) {
      try {
        await s3Service.deleteFile(req.uploadedFileKey);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Erro ao criar demonstrativo',
      error: error.message
    });
  }
});

/**
 * PUT /api/stake-statements/:id
 * Atualizar demonstrativo (com possibilidade de alterar arquivo)
 */
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { statementDate, name, linkUrl, removeFile } = req.body;
    const file = req.file;

    if (!statementDate && !name && linkUrl === undefined && !file && !removeFile) {
      return res.status(400).json({
        success: false,
        message: 'Informe pelo menos um campo para atualizar'
      });
    }

    const prisma = getPrisma();

    // Verificar se o demonstrativo existe
    const existingStatement = await prisma.stakeStatement.findUnique({
      where: { id }
    });

    if (!existingStatement) {
      return res.status(404).json({
        success: false,
        message: 'Demonstrativo não encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (statementDate) updateData.statementDate = new Date(statementDate);
    if (name) updateData.name = name;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl || null;

    // Validar que ao menos um (arquivo ou link) estará presente
    const willHaveFile = file || (existingStatement.fileUrl && removeFile !== 'true');
    const willHaveLink = linkUrl || (existingStatement.linkUrl && linkUrl !== '');

    if (!willHaveFile && !willHaveLink) {
      return res.status(400).json({
        success: false,
        message: 'É necessário ter pelo menos um arquivo ou link'
      });
    }

    // Se está removendo arquivo existente
    if (removeFile === 'true' && existingStatement.fileKey) {
      try {
        await s3Service.deleteFile(existingStatement.fileKey);
        updateData.fileUrl = null;
        updateData.fileKey = null;
      } catch (s3Error) {
        console.error('Error deleting file from S3:', s3Error);
        // Continuar mesmo se falhar ao deletar do S3
      }
    }

    // Se está fazendo upload de novo arquivo
    if (file) {
      // Deletar arquivo antigo se existir
      if (existingStatement.fileKey) {
        try {
          await s3Service.deleteFile(existingStatement.fileKey);
        } catch (s3Error) {
          console.error('Error deleting old file from S3:', s3Error);
        }
      }

      // Upload do novo arquivo
      const uploadResult = await s3Service.uploadProductDocument(
        existingStatement.contractId,
        file,
        'statements'
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao fazer upload do arquivo'
        });
      }

      updateData.fileUrl = uploadResult.url;
      updateData.fileKey = uploadResult.key;
    }

    // Atualizar demonstrativo
    const statement = await prisma.stakeStatement.update({
      where: { id },
      data: updateData,
      include: {
        contract: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: statement,
      message: 'Demonstrativo atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating statement:', error);

    // Se houve erro após upload, tentar deletar o arquivo do S3
    if (req.uploadedFileKey) {
      try {
        await s3Service.deleteFile(req.uploadedFileKey);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar demonstrativo',
      error: error.message
    });
  }
});

/**
 * DELETE /api/stake-statements/:id
 * Deletar demonstrativo e seu arquivo no S3
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = getPrisma();

    // Buscar demonstrativo
    const statement = await prisma.stakeStatement.findUnique({
      where: { id }
    });

    if (!statement) {
      return res.status(404).json({
        success: false,
        message: 'Demonstrativo não encontrado'
      });
    }

    // Deletar arquivo do S3
    try {
      await s3Service.deleteFile(statement.fileKey);
    } catch (s3Error) {
      console.error('Error deleting file from S3:', s3Error);
      // Continuar mesmo se falhar ao deletar do S3
    }

    // Deletar demonstrativo do banco
    await prisma.stakeStatement.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Demonstrativo deletado com sucesso'
    });

  } catch (error) {
    console.error('Error deleting statement:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao deletar demonstrativo',
      error: error.message
    });
  }
});

/**
 * GET /api/stake-statements/by-company/:companyId
 * Listar todos os demonstrativos de uma empresa
 */
router.get('/by-company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const prisma = getPrisma();

    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Buscar demonstrativos ordenados por data (mais recentes primeiro)
    const statements = await prisma.stakeStatement.findMany({
      where: { companyId },
      orderBy: [
        { statementDate: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        contract: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: statements,
      count: statements.length
    });

  } catch (error) {
    console.error('Error listing company statements:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar demonstrativos da empresa',
      error: error.message
    });
  }
});

module.exports = router;

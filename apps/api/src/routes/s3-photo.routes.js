const express = require('express');
const router = express.Router();
const multer = require('multer');
const s3Service = require('../services/s3.service');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Configurar multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// S3 configurado no service

/**
 * @swagger
 * /api/s3-photos/upload:
 *   post:
 *     summary: Upload de foto de perfil para S3
 *     tags: [S3 Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL da foto no S3
 *                     key:
 *                       type: string
 *                       description: Chave S3 da foto
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // console.log('📸 [S3Photos] Upload solicitado para usuário:', userId);
    // console.log('📸 [S3Photos] Arquivo:', file.originalname, file.size, 'bytes');

    // Deletar fotos antigas do usuário no S3
    try {
      await s3Service.deleteUserProfilePhotos(userId);
    } catch (deleteError) {
      console.warn('⚠️ Erro ao deletar fotos antigas:', deleteError.message);
    }

    // Upload para S3
    const uploadResult = await s3Service.uploadProfilePhoto(userId, file);

    // Salvar URL no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: uploadResult.url,
        metadata: {
          ...(await prisma.user.findUnique({ where: { id: userId } }))?.metadata,
          profilePhotoS3Key: uploadResult.key,
          profilePhotoUpdatedAt: new Date().toISOString()
        }
      }
    });

    // console.log('✅ [S3Photos] Foto salva no banco:', uploadResult.url);

    res.json({
      success: true,
      message: 'Foto de perfil enviada com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [S3Photos] Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar foto',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/s3-photos/info:
 *   get:
 *     summary: Obter informações da foto de perfil do usuário
 *     tags: [S3 Photos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações obtidas com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/info', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profilePicture: true,
        metadata: true
      }
    });

    // console.log('📸 [S3Photos] Info solicitada para usuário:', userId);

    const hasPhoto = !!user?.profilePicture;
    const metadata = user?.metadata || {};
    
    let photoUrl = null;
    
    // Se tem foto, gerar URL assinada temporária
    if (hasPhoto && metadata.profilePhotoS3Key) {
      try {
        // console.log('📸 [S3Photos] Gerando URL assinada para key:', metadata.profilePhotoS3Key);
        const signedUrlResult = await s3Service.getSignedUrl(metadata.profilePhotoS3Key, 3600); // 1 hora
        photoUrl = signedUrlResult.url;
        // console.log('📸 [S3Photos] URL assinada gerada com sucesso');
      } catch (error) {
        console.warn('⚠️ Erro ao gerar URL assinada, usando URL original:', error.message);
        photoUrl = user?.profilePicture;
      }
    } else if (hasPhoto) {
      // console.log('📸 [S3Photos] Usando URL direta do banco (sem S3Key)');
      photoUrl = user?.profilePicture;
    }

    res.json({
      success: true,
      message: 'Informações obtidas',
      data: {
        hasPhoto: hasPhoto,
        url: photoUrl,
        lastUpdated: metadata.profilePhotoUpdatedAt || null
      }
    });

  } catch (error) {
    console.error('❌ [S3Photos] Erro ao obter info:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/s3-photos/delete:
 *   delete:
 *     summary: Deletar foto de perfil do S3
 *     tags: [S3 Photos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foto deletada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.delete('/delete', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar usuário para obter a key S3
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        metadata: true
      }
    });

    const metadata = user?.metadata || {};
    
    // Deletar do S3 se existir
    if (metadata.profilePhotoS3Key) {
      try {
        await s3Service.deleteFile(metadata.profilePhotoS3Key);
      } catch (deleteError) {
        console.warn('⚠️ Erro ao deletar do S3:', deleteError.message);
      }
    }

    // Limpar do banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: null,
        metadata: {
          ...metadata,
          profilePhotoS3Key: null,
          profilePhotoUpdatedAt: null
        }
      }
    });

    // console.log('🗑️ [S3Photos] Foto removida para usuário:', userId);

    res.json({
      success: true,
      message: 'Foto de perfil removida com sucesso'
    });

  } catch (error) {
    console.error('❌ [S3Photos] Erro na deleção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover foto',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/s3-photos/company-logo/upload:
 *   post:
 *     summary: Upload de logo da empresa para S3
 *     tags: [S3 Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem do logo
 *               companyId:
 *                 type: string
 *                 description: ID da empresa
 */
router.post('/company-logo/upload', upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.body.companyId || req.user?.companyId;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'ID da empresa não fornecido'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // console.log('🏢 [S3Photos] Upload de logo solicitado para empresa:', companyId);
    // console.log('🏢 [S3Photos] Arquivo:', file.originalname, file.size, 'bytes');

    // Verificar permissão do usuário
    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    });

    if (!userCompany) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para atualizar logo da empresa'
      });
    }

    // Deletar logos antigas da empresa no S3
    try {
      await s3Service.deleteCompanyLogos(companyId);
    } catch (deleteError) {
      console.warn('⚠️ Erro ao deletar logos antigas:', deleteError.message);
    }

    // Upload para S3
    const uploadResult = await s3Service.uploadCompanyLogo(companyId, file);

    // Salvar URL no banco de dados
    await prisma.company.update({
      where: { id: companyId },
      data: {
        logo: uploadResult.url,
        metadata: {
          ...(await prisma.company.findUnique({ where: { id: companyId } }))?.metadata,
          logoS3Key: uploadResult.key,
          logoUpdatedAt: new Date().toISOString()
        }
      }
    });

    // console.log('✅ [S3Photos] Logo da empresa salva no banco:', uploadResult.url);

    res.json({
      success: true,
      message: 'Logo da empresa enviada com sucesso',
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      }
    });

  } catch (error) {
    console.error('❌ [S3Photos] Erro no upload do logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar logo',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/s3-photos/company-logo/info:
 *   get:
 *     summary: Obter informações do logo da empresa
 *     tags: [S3 Photos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/company-logo/info/:companyId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.params.companyId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar empresa no banco
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        logo: true,
        metadata: true
      }
    });

    // console.log('🏢 [S3Photos] Info de logo solicitada para empresa:', companyId);

    const hasLogo = !!company?.logo;
    const metadata = company?.metadata || {};

    res.json({
      success: true,
      message: 'Informações obtidas',
      data: {
        hasLogo: hasLogo,
        url: company?.logo || null,
        lastUpdated: metadata.logoUpdatedAt || null
      }
    });

  } catch (error) {
    console.error('❌ [S3Photos] Erro ao obter info do logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;
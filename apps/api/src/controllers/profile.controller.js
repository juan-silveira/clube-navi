const s3Service = require('../services/s3.service');
const userActionsService = require('../services/userActions.service');
const profileCacheService = require('../services/profileCache.service');

class ProfileController {
  constructor() {
    // Removed: prisma instance moved to req.tenantPrisma
  }

  /**
   * @swagger
   * /api/profile/upload-photo:
   *   post:
   *     summary: Upload profile photo
   *     description: Upload a profile photo to MinIO and update user profile
   *     tags: [Profile]
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
   *                 description: Profile photo file (jpg, png, gif)
   *     responses:
   *       200:
   *         description: Photo uploaded successfully
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
   *                     profilePicture:
   *                       type: string
   *                     url:
   *                       type: string
   *       400:
   *         description: Invalid file or missing file
   *       401:
   *         description: Unauthorized
   *       413:
   *         description: File too large
   */
  async uploadProfilePhoto(req, res) {
    try {
      const prisma = req.tenantPrisma;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const file = req.file;

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos.'
        });
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(413).json({
          success: false,
          message: 'Arquivo muito grande. Máximo permitido: 5MB'
        });
      }

      // Get current user to check for existing profile picture
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true, name: true, email: true }
      });

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Delete old profile picture from S3 if it exists
      if (currentUser.profilePicture) {
        try {
          await s3Service.deleteFile(currentUser.profilePicture);
        } catch (deleteError) {
          console.warn('⚠️ Warning: Could not delete old profile picture:', deleteError.message);
        }
      }

      // Upload new profile picture to S3
      const uploadResult = await s3Service.uploadProfilePhoto(userId, file);

      // Update user's profile picture in database
      console.log('💾 [ProfileController] Salvando URL no campo profilePicture:', uploadResult.url);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: uploadResult.url
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true
        }
      });

      console.log('💾 [ProfileController] Usuario atualizado:', updatedUser);

      // Log user action
      await userActionsService.logAuth(userId, 'profile_updated', req, {
        status: 'success',
        details: {
          action: 'profile_photo_uploaded',
          fileName: uploadResult.key,
          s3Key: uploadResult.key,
          s3Url: uploadResult.url,
          uploadedAt: new Date().toISOString()
        }
      });

      // CACHE DESABILITADO POR SEGURANÇA - Photo salva apenas no PostgreSQL

      res.status(200).json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso!',
        data: {
          profilePicture: uploadResult.url,
          url: uploadResult.url,
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('❌ Error uploading profile photo:', error);
      
      // Log error action
      if (req.user?.id) {
        await userActionsService.logAuth(req.user.id, 'profile_updated', req, {
          status: 'failed',
          details: {
            action: 'profile_photo_upload_failed',
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/profile/photo:
   *   get:
   *     summary: Get current user's profile photo URL
   *     description: Returns the current user's profile photo URL if it exists
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile photo URL retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     hasPhoto:
   *                       type: boolean
   *                     url:
   *                       type: string
   *                       nullable: true
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   */
  async getProfilePhoto(req, res) {
    try {
      const prisma = req.tenantPrisma;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // CACHE DESABILITADO POR SEGURANÇA - Sempre buscar do PostgreSQL

      // Buscar SEMPRE do banco PostgreSQL para máxima segurança
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          profilePicture: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Preparar dados para resposta (SEM cache)
      const photoData = {
        hasPhoto: !!user.profilePicture,
        url: user.profilePicture || null,
        profilePicture: user.profilePicture || null
      };

      // Headers sem cache para segurança
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate', // SEM cache
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache': 'DISABLED', // Cache desabilitado por segurança
        'ETag': `"profile-${userId}-${Date.now()}"`, // ETag único sempre
      });

      res.status(200).json({
        success: true,
        data: photoData
      });

    } catch (error) {
      console.error('❌ Error getting profile photo:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /api/profile/photo:
   *   delete:
   *     summary: Delete current user's profile photo
   *     description: Removes the current user's profile photo from MinIO and database
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile photo deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found or no photo to delete
   */
  async deleteProfilePhoto(req, res) {
    try {
      const prisma = req.tenantPrisma;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true, name: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (!user.profilePicture) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma foto de perfil para deletar'
        });
      }

      // Delete from S3
      await s3Service.deleteFile(user.profilePicture);

      // Update user record
      await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: null
        }
      });

      // Log user action
      await userActionsService.logAuth(userId, 'profile_updated', req, {
        status: 'success',
        details: {
          action: 'profile_photo_deleted',
          fileName: user.profilePicture,
          deletedAt: new Date().toISOString()
        }
      });

      // CACHE DESABILITADO POR SEGURANÇA - Sem necessidade de invalidar

      res.status(200).json({
        success: true,
        message: 'Foto de perfil removida com sucesso!'
      });

    } catch (error) {
      console.error('❌ Error deleting profile photo:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

const profileController = new ProfileController();

module.exports = {
  uploadProfilePhoto: profileController.uploadProfilePhoto.bind(profileController),
  getProfilePhoto: profileController.getProfilePhoto.bind(profileController),
  deleteProfilePhoto: profileController.deleteProfilePhoto.bind(profileController)
};
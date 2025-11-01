const prismaConfig = require('../config/prisma');
const s3Service = require('./s3.service');

class UserDocumentService {
  constructor() {
    this.prisma = null;
  }

  async init() {
    try {
      this.prisma = prismaConfig.getPrisma();
    } catch (error) {
      this.prisma = await prismaConfig.initialize();
    }
  }

  /**
   * Upload de arquivo para S3
   */
  async uploadToS3(file, documentType, userId) {
    try {
      // Upload para S3 usando o s3Service
      const result = await s3Service.uploadUserDocument(userId, file, documentType);

      return {
        s3Url: result.url,
        s3Key: result.key,
        filename: file.originalname,
        mimeType: file.mimetype,
        fileSize: BigInt(file.size)
      };
    } catch (error) {
      console.error('❌ Erro ao fazer upload para S3:', error);
      throw error;
    }
  }

  /**
   * Lista documentos do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de documentos do usuário
   */
  async getUserDocuments(userId) {
    try {
      if (!this.prisma) await this.init();

      const documents = await this.prisma.userDocument.findMany({
        where: { userId },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { documentType: 'asc' }
      });

      return documents;
    } catch (error) {
      console.error('❌ Erro ao buscar documentos do usuário:', error);
      throw error;
    }
  }

  /**
   * Obtém documento específico do usuário
   * @param {string} userId - ID do usuário
   * @param {string} documentType - Tipo do documento (front, back, selfie)
   * @returns {Promise<Object|null>} Documento encontrado
   */
  async getUserDocument(userId, documentType) {
    try {
      if (!this.prisma) await this.init();

      const document = await this.prisma.userDocument.findUnique({
        where: {
          user_document_type_unique: {
            userId,
            documentType
          }
        },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return document;
    } catch (error) {
      console.error('❌ Erro ao buscar documento específico:', error);
      throw error;
    }
  }

  /**
   * Cria ou atualiza documento do usuário
   * @param {string} userId - ID do usuário
   * @param {string} documentType - Tipo do documento
   * @param {Object} documentData - Dados do documento
   * @returns {Promise<Object>} Documento criado/atualizado
   */
  async upsertUserDocument(userId, documentType, documentData) {
    try {
      if (!this.prisma) await this.init();

      // Buscar documento existente
      const existingDoc = await this.prisma.userDocument.findUnique({
        where: {
          user_document_type_unique: {
            userId,
            documentType
          }
        }
      });

      // Se existir documento antigo com arquivo no S3, deletar arquivo antigo
      if (existingDoc && existingDoc.s3Key) {
        try {
          await s3Service.deleteUserDocument(existingDoc.s3Key);
          console.log(`🗑️ Arquivo antigo deletado: ${existingDoc.s3Key}`);
        } catch (error) {
          console.warn('⚠️ Erro ao deletar arquivo antigo:', error);
          // Continuar mesmo se falhar ao deletar arquivo antigo
        }
      }

      const document = await this.prisma.userDocument.upsert({
        where: {
          user_document_type_unique: {
            userId,
            documentType
          }
        },
        create: {
          userId,
          documentType,
          status: 'pending',
          s3Url: documentData.s3Url,
          s3Key: documentData.s3Key,
          filename: documentData.filename,
          mimeType: documentData.mimeType,
          fileSize: documentData.fileSize,
          uploadedAt: new Date()
        },
        update: {
          status: 'pending',
          s3Url: documentData.s3Url,
          s3Key: documentData.s3Key,
          filename: documentData.filename,
          mimeType: documentData.mimeType,
          fileSize: documentData.fileSize,
          uploadedAt: new Date(),
          rejectionReason: null,
          reviewedBy: null,
          reviewedAt: null
        },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return document;
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar documento:', error);
      throw error;
    }
  }

  /**
   * Aprova documento
   * @param {string} documentId - ID do documento
   * @param {string} reviewerId - ID do revisor
   * @returns {Promise<Object>} Documento aprovado
   */
  async approveDocument(documentId, reviewerId) {
    try {
      if (!this.prisma) await this.init();

      const document = await this.prisma.userDocument.update({
        where: { id: documentId },
        data: {
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: null
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Atualizar também o campo do usuário para manter sincronizado
      await this.updateUserDocumentStatus(document.userId, document.documentType, 'approved');

      return document;
    } catch (error) {
      console.error('❌ Erro ao aprovar documento:', error);
      throw error;
    }
  }

  /**
   * Rejeita documento
   * @param {string} documentId - ID do documento
   * @param {string} reviewerId - ID do revisor
   * @param {string} rejectionReason - Motivo da rejeição
   * @returns {Promise<Object>} Documento rejeitado
   */
  async rejectDocument(documentId, reviewerId, rejectionReason) {
    try {
      if (!this.prisma) await this.init();

      const document = await this.prisma.userDocument.update({
        where: { id: documentId },
        data: {
          status: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          rejectionReason
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Atualizar também o campo do usuário para manter sincronizado
      await this.updateUserDocumentStatus(document.userId, document.documentType, 'rejected');

      return document;
    } catch (error) {
      console.error('❌ Erro ao rejeitar documento:', error);
      throw error;
    }
  }

  /**
   * Atualiza status do documento na tabela users
   * @param {string} userId - ID do usuário
   * @param {string} documentType - Tipo do documento
   * @param {string} status - Novo status
   */
  async updateUserDocumentStatus(userId, documentType, status) {
    try {
      if (!this.prisma) await this.init();

      const fieldMap = {
        'front': 'frontDocument',
        'back': 'backDocument',
        'selfie': 'selfieDocument'
      };

      const field = fieldMap[documentType];
      if (!field) return;

      await this.prisma.user.update({
        where: { id: userId },
        data: { [field]: status }
      });

      console.log(`✅ Status do documento ${documentType} atualizado para ${status} no usuário ${userId}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar status no usuário:', error);
      // Não lançar erro para não quebrar o fluxo principal
    }
  }

  /**
   * Lista documentos pendentes para revisão
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} Lista paginada de documentos pendentes
   */
  async getPendingDocuments(options = {}) {
    try {
      if (!this.prisma) await this.init();

      const {
        page = 1,
        limit = 50,
        documentType,
        status,
        userId,
        companyId
      } = options;

      const skip = (page - 1) * limit;
      const take = parseInt(limit);

      const where = {};

      // Filtrar por status (se não especificado, mostrar todos)
      if (status) {
        where.status = status;
      }

      if (documentType) where.documentType = documentType;
      if (userId) where.userId = userId;

      // Filtrar por empresa se especificado
      if (companyId) {
        where.user = {
          userCompanies: {
            some: {
              companyId,
              status: 'active'
            }
          }
        };
      }

      const [documents, total] = await Promise.all([
        this.prisma.userDocument.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                userCompanies: {
                  where: companyId ? { companyId, status: 'active' } : { status: 'active' },
                  include: {
                    company: {
                      select: { id: true, name: true, alias: true }
                    }
                  }
                }
              }
            },
            reviewer: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { uploadedAt: 'desc' },
          skip,
          take
        }),
        this.prisma.userDocument.count({ where })
      ]);

      return {
        documents,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
          hasNext: skip + take < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Erro ao listar documentos pendentes:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de documentos
   * @param {string} companyId - ID da empresa (opcional)
   * @returns {Promise<Object>} Estatísticas dos documentos
   */
  async getDocumentStats(companyId = null) {
    try {
      if (!this.prisma) await this.init();

      const where = {};

      if (companyId) {
        where.user = {
          userCompanies: {
            some: {
              companyId,
              status: 'active'
            }
          }
        };
      }

      const [
        pendingCount,
        approvedCount,
        rejectedCount,
        totalCount
      ] = await Promise.all([
        this.prisma.userDocument.count({ where: { ...where, status: 'pending' } }),
        this.prisma.userDocument.count({ where: { ...where, status: 'approved' } }),
        this.prisma.userDocument.count({ where: { ...where, status: 'rejected' } }),
        this.prisma.userDocument.count({ where })
      ]);

      return {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de documentos:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário tem todos documentos aprovados
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} True se todos documentos estão aprovados
   */
  async isUserDocumentationComplete(userId) {
    try {
      if (!this.prisma) await this.init();

      const approvedCount = await this.prisma.userDocument.count({
        where: {
          userId,
          status: 'approved'
        }
      });

      // Todos os 3 tipos de documento devem estar aprovados
      return approvedCount === 3;
    } catch (error) {
      console.error('❌ Erro ao verificar documentação completa:', error);
      throw error;
    }
  }

  /**
   * Gerar URL temporária para visualização/download de documento
   * @param {string} documentId - ID do documento
   * @param {string} userId - ID do usuário (para verificar permissão)
   * @param {boolean} isAdmin - Se é administrador (opcional)
   * @returns {Promise<string>} URL temporária
   */
  async generateDocumentUrl(documentId, userId, isAdmin = false) {
    try {
      if (!this.prisma) await this.init();

      const document = await this.prisma.userDocument.findUnique({
        where: { id: documentId },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });

      if (!document) {
        throw new Error('Documento não encontrado');
      }

      // Verificar se o usuário tem permissão (é o dono ou é admin)
      if (!isAdmin && document.userId !== userId) {
        throw new Error('Sem permissão para acessar este documento');
      }

      if (!document.s3Key) {
        throw new Error('Documento não possui arquivo associado');
      }

      // Gerar URL temporária (válida por 1 hora) usando o s3Service
      const result = await s3Service.getSignedUrl(document.s3Key, 3600); // 1 hora

      return result.url;
    } catch (error) {
      console.error('❌ Erro ao gerar URL do documento:', error);
      throw error;
    }
  }

  /**
   * Obtém um documento específico por ID
   * @param {string} documentId - ID do documento
   * @returns {Promise<Object>} Documento encontrado
   */
  async getDocumentById(documentId) {
    try {
      if (!this.prisma) await this.init();

      const document = await this.prisma.userDocument.findUnique({
        where: { id: documentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              phone: true,
              userCompanies: {
                where: { status: 'active' },
                include: {
                  company: {
                    select: { id: true, name: true, alias: true }
                  }
                }
              }
            }
          },
          reviewer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return document;
    } catch (error) {
      console.error('❌ Erro ao buscar documento por ID:', error);
      throw error;
    }
  }

  /**
   * Gerar URL assinada diretamente da chave S3
   * @param {string} s3Key - Chave do arquivo no S3
   * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns {Promise<string>} URL assinada
   */
  async generateSignedUrlFromKey(s3Key, expiresIn = 3600) {
    try {
      const result = await s3Service.getSignedUrl(s3Key, expiresIn);
      return result.url;
    } catch (error) {
      console.error('❌ Erro ao gerar URL assinada:', error);
      throw error;
    }
  }
}

module.exports = new UserDocumentService();

const userDocumentService = require('../services/userDocument.service');
const userActionsService = require('../services/userActions.service');

// Buffer para agrupar notificações de documentos
const documentNotificationBuffer = new Map();
const NOTIFICATION_DELAY = 3000; // 3 segundos de delay para agrupar

/**
 * Envia notificações agrupadas de documentos
 */
const sendGroupedDocumentNotifications = async (prisma, userId, userName, userEmail, documents) => {
  try {
    const axios = require('axios');

    console.log('📱 [UPLOAD] Enviando notificações agrupadas...');

    // Buscar configuração de usuários diretamente do banco
    const config = await prisma.notificationConfig.findUnique({
      where: { type: 'document' }
    });

    const userIds = config?.userIds || [];
    console.log(`📱 [UPLOAD] IDs configurados: ${userIds.length}`, userIds);

    if (userIds.length === 0) {
      console.log('⚠️ [UPLOAD] Nenhum usuário configurado para receber notificações de documentos');
      return;
    }

    // Buscar dados dos usuários
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { phone: true, name: true }
    });
    console.log(`📱 [UPLOAD] Usuários encontrados: ${users.length}`, users);

    const docTypeNames = {
      'front': 'Frente do documento',
      'back': 'Verso do documento',
      'selfie': 'Selfie'
    };

    // Criar lista de documentos
    const docList = documents.map(doc => `   • ${docTypeNames[doc] || doc}`).join('\n');
    const docCount = documents.length;
    const docWord = docCount === 1 ? 'documento foi enviado' : 'documentos foram enviados';

    const message = `📄 *${docCount === 1 ? 'NOVO DOCUMENTO PENDENTE' : 'NOVOS DOCUMENTOS PENDENTES'}* 📄\n\n👤 *Usuário:* ${userName || 'N/A'}\n📧 *Email:* ${userEmail || 'N/A'}\n📎 *${docCount} ${docWord}:*\n${docList}\n📅 *Data:* ${new Date().toLocaleString('pt-BR')}\n\n⚠️ *Ação necessária:* Acesse o sistema para verificar ${docCount === 1 ? 'o documento' : 'os documentos'}.`;

    for (const user of users) {
      if (user.phone) {
        console.log(`📱 [UPLOAD] Enviando para ${user.name} (${user.phone})...`);
        await axios.post('https://webhook.n8n.net.br/webhook/envios-coinage', {
          user: 'Coinage',
          dest: user.phone,
          text: message
        });
        console.log(`✅ [UPLOAD] Mensagem WhatsApp enviada para ${user.phone}`);
      } else {
        console.log(`⚠️ [UPLOAD] Usuário ${user.name} não tem telefone cadastrado`);
      }
    }
  } catch (error) {
    console.error('❌ [UPLOAD] Erro ao enviar WhatsApp:', error.message);
    console.error('❌ [UPLOAD] Stack:', error.stack);
  }
};

/**
 * Lista documentos do usuário autenticado ou de um usuário específico (admin)
 */
const getUserDocuments = async (req, res) => {
  try {
    // Se userId vier nos params, é um admin buscando documentos de outro usuário
    // Senão, é o próprio usuário buscando seus documentos
    const userId = req.params.userId || req.user.id;
    const documents = await userDocumentService.getUserDocuments(userId);

    // Gerar URLs assinadas para cada documento
    const documentsWithSignedUrls = await Promise.all(
      documents.map(async (doc) => {
        if (doc.s3Key) {
          try {
            const signedUrl = await userDocumentService.generateSignedUrlFromKey(doc.s3Key, 3600); // 1 hora
            return { ...doc, s3Url: signedUrl };
          } catch (error) {
            console.error(`Erro ao gerar URL assinada para ${doc.id}:`, error);
            return doc; // Retornar sem URL assinada em caso de erro
          }
        }
        return doc;
      })
    );

    res.json({
      success: true,
      data: documentsWithSignedUrls
    });
  } catch (error) {
    console.error('Erro ao buscar documentos do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obtém documento específico do usuário
 */
const getUserDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType } = req.params;

    if (!['front', 'back', 'selfie'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento inválido'
      });
    }

    const document = await userDocumentService.getUserDocument(userId, documentType);

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Upload de documento do usuário
 */
const uploadUserDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType } = req.params;

    console.log(`📤 [Upload] Iniciando upload de documento - userId: ${userId}, tipo: ${documentType}`);

    if (!['front', 'back', 'selfie'].includes(documentType)) {
      console.error(`❌ [Upload] Tipo de documento inválido: ${documentType}`);
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento inválido'
      });
    }

    // Verificar se arquivo foi enviado
    if (!req.file) {
      console.error('❌ [Upload] Nenhum arquivo foi enviado');
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    console.log(`📎 [Upload] Arquivo recebido - nome: ${req.file.originalname}, tipo: ${req.file.mimetype}, tamanho: ${req.file.size} bytes`);

    // Upload para S3 e salvar no banco
    console.log(`☁️ [Upload] Enviando para S3...`);
    const documentData = await userDocumentService.uploadToS3(req.file, documentType, userId);
    console.log(`✅ [Upload] Arquivo enviado para S3 - URL: ${documentData.s3Url}`);

    console.log(`💾 [Upload] Salvando no banco de dados...`);
    const document = await userDocumentService.upsertUserDocument(userId, documentType, documentData);
    console.log(`✅ [Upload] Documento salvo no banco - ID: ${document.id}`);

    // Registrar upload de documento
    await userActionsService.logAction({
      userId,
      companyId: req.user?.companyId,
      action: 'document_uploaded',
      category: 'profile',
      details: {
        documentType,
        filename: req.file.originalname,
        size: req.file.size
      },
      relatedId: document.id,
      relatedType: 'user_document',
      ipAddress: userActionsService.getIpAddress(req),
      userAgent: req.headers['user-agent']
    });

    console.log(`✅ [Upload] Upload completo! Documento ${documentType} enviado com sucesso`);

    // Agrupar notificações de documentos
    const bufferKey = userId;
    const prisma = req.tenantPrisma;

    // Cancelar timer anterior se existir
    if (documentNotificationBuffer.has(bufferKey)) {
      const { timer } = documentNotificationBuffer.get(bufferKey);
      clearTimeout(timer);
    }

    // Pegar documentos existentes no buffer ou criar novo array
    const currentBuffer = documentNotificationBuffer.get(bufferKey) || { documents: [], userName: req.user?.name, userEmail: req.user?.email, prisma };
    currentBuffer.documents.push(documentType);

    // Criar novo timer para enviar notificação agrupada
    const timer = setTimeout(async () => {
      const bufferData = documentNotificationBuffer.get(bufferKey);
      if (bufferData) {
        await sendGroupedDocumentNotifications(
          bufferData.prisma,
          userId,
          bufferData.userName,
          bufferData.userEmail,
          bufferData.documents
        );
        documentNotificationBuffer.delete(bufferKey);
      }
    }, NOTIFICATION_DELAY);

    currentBuffer.timer = timer;
    documentNotificationBuffer.set(bufferKey, currentBuffer);

    console.log(`📱 [UPLOAD] Documento adicionado ao buffer. Total no buffer: ${currentBuffer.documents.length}`);

    // Gerar URL assinada para o documento
    let signedUrl = null;
    if (document.s3Key) {
      try {
        signedUrl = await userDocumentService.generateSignedUrlFromKey(document.s3Key, 3600);
        console.log(`🔗 [Upload] URL assinada gerada: ${signedUrl}`);
      } catch (error) {
        console.error(`❌ [Upload] Erro ao gerar URL assinada:`, error);
      }
    }

    // Converter BigInt para string antes de enviar
    const documentSerialized = JSON.parse(JSON.stringify(document, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    // Adicionar URL assinada ao documento
    const documentWithUrl = {
      ...documentSerialized,
      s3Url: signedUrl
    };

    const response = {
      success: true,
      message: 'Documento enviado com sucesso',
      data: documentWithUrl
    };

    console.log('📤 [Upload] Enviando resposta:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ [Upload] Erro ao enviar documento:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
};

/**
 * Lista documentos pendentes (admin)
 */
const getPendingDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      documentType,
      status,
      userId,
      companyId
    } = req.query;

    // Se não for super admin, filtrar pela empresa do usuário
    const finalCompanyId = req.user.isApiAdmin ? companyId : req.user.companyId;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      documentType,
      status,
      userId,
      companyId: finalCompanyId
    };

    const result = await userDocumentService.getPendingDocuments(options);

    // Gerar URLs assinadas para cada documento
    const documentsWithSignedUrls = await Promise.all(
      result.documents.map(async (doc) => {
        if (doc.s3Key) {
          try {
            const signedUrl = await userDocumentService.generateSignedUrlFromKey(doc.s3Key, 3600); // 1 hora
            return { ...doc, s3Url: signedUrl };
          } catch (error) {
            console.error(`Erro ao gerar URL assinada para ${doc.id}:`, error);
            return doc;
          }
        }
        return doc;
      })
    );

    res.json({
      success: true,
      data: {
        ...result,
        documents: documentsWithSignedUrls
      }
    });
  } catch (error) {
    console.error('Erro ao listar documentos pendentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Aprova documento (admin)
 */
const approveDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const reviewerId = req.user.id;

    const document = await userDocumentService.approveDocument(documentId, reviewerId);

    // Registrar aprovação de documento
    await userActionsService.logAdmin(reviewerId, 'document_verified', document.userId, req, {
      details: {
        documentId,
        documentType: document.documentType,
        action: 'approved'
      }
    });

    // Registrar para o usuário titular do documento
    await userActionsService.logAction({
      userId: document.userId,
      companyId: req.user?.companyId,
      action: 'document_verified',
      category: 'profile',
      status: 'success',
      details: {
        documentType: document.documentType,
        reviewedBy: reviewerId
      },
      relatedId: documentId,
      relatedType: 'user_document'
    });

    res.json({
      success: true,
      message: 'Documento aprovado com sucesso',
      data: document
    });
  } catch (error) {
    console.error('Erro ao aprovar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Rejeita documento (admin)
 */
const rejectDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { rejectionReason } = req.body;
    const reviewerId = req.user.id;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da rejeição é obrigatório'
      });
    }

    const document = await userDocumentService.rejectDocument(documentId, reviewerId, rejectionReason);

    res.json({
      success: true,
      message: 'Documento rejeitado',
      data: document
    });
  } catch (error) {
    console.error('Erro ao rejeitar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obtém estatísticas de documentos (admin)
 */
const getDocumentStats = async (req, res) => {
  try {
    const { companyId } = req.query;
    
    // Se não for super admin, usar empresa do usuário
    const finalCompanyId = req.user.isApiAdmin ? companyId : req.user.companyId;

    const stats = await userDocumentService.getDocumentStats(finalCompanyId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Verifica se documentação do usuário está completa
 */
const checkDocumentationComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const isComplete = await userDocumentService.isUserDocumentationComplete(userId);

    res.json({
      success: true,
      data: { isComplete }
    });
  } catch (error) {
    console.error('Erro ao verificar documentação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Gerar URL para visualizar/baixar documento
 */
const getDocumentUrl = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const url = await userDocumentService.generateDocumentUrl(documentId, userId);

    res.json({
      success: true,
      data: { url }
    });
  } catch (error) {
    console.error('Erro ao gerar URL do documento:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar documento por ID (admin)
 */
const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await userDocumentService.getDocumentById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    // Gerar URL assinada se documento tiver s3Key
    if (document.s3Key) {
      try {
        const signedUrl = await userDocumentService.generateSignedUrlFromKey(document.s3Key, 3600); // 1 hora
        document.s3Url = signedUrl;
      } catch (error) {
        console.error(`Erro ao gerar URL assinada para ${document.id}:`, error);
      }
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getUserDocuments,
  getUserDocument,
  uploadUserDocument,
  getPendingDocuments,
  approveDocument,
  rejectDocument,
  getDocumentStats,
  checkDocumentationComplete,
  getDocumentUrl,
  getDocumentById
};
/**
 * Service para gerenciar uploads e downloads no AWS S3
 */

const AWS = require('aws-sdk');
const path = require('path');
const crypto = require('crypto');

class S3Service {
  constructor() {
    // Configurar AWS SDK
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'sa-east-1'
    });

    this.s3 = new AWS.S3();
    this.bucketName = process.env.S3_BUCKET_NAME || 'coinage-assets';
    this.region = process.env.AWS_REGION || 'sa-east-1';
    
    // Prefixos para organização
    this.prefixes = {
      profilePhotos: process.env.S3_PROFILE_PHOTOS_PREFIX || 'profile-photos/',
      companyLogos: process.env.S3_COMPANY_LOGOS_PREFIX || 'company-logos/',
      brandingAssets: process.env.S3_BRANDING_ASSETS_PREFIX || 'branding/',
      documents: process.env.S3_DOCUMENTS_PREFIX || 'documents/'
    };

    // Configurações de upload
    this.maxFileSize = parseInt(process.env.S3_MAX_FILE_SIZE) || 5242880; // 5MB
    this.allowedImageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/x-icon'
    ];
    this.allowedDocumentTypes = (process.env.S3_ALLOWED_DOCUMENT_TYPES || 'application/pdf').split(',');
  }

  /**
   * Gerar nome único para arquivo
   */
  generateUniqueFileName(originalName, userId) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    
    // Sanitizar nome do arquivo
    const sanitizedName = nameWithoutExt
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    return `${userId}_${sanitizedName}_${timestamp}_${randomString}${extension}`;
  }

  /**
   * Validar arquivo de imagem
   */
  validateImageFile(file) {
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    console.log('🔍 [S3Service] Validando arquivo:', {
      mimetype: file.mimetype,
      allowedTypes: this.allowedImageTypes
    });

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${this.allowedImageTypes.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    return true;
  }

  /**
   * Upload de foto de perfil
   */
  async uploadProfilePhoto(userId, file) {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, userId);
      const key = `${this.prefixes.profilePhotos}${userId}/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Sem ACL - usa as permissões padrão do bucket
        Metadata: {
          userId: userId.toString(),
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        // Se falhar com ACL, tentar sem ACL
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Foto de perfil enviada: ${result.Key}`);
      
      // Construir URL pública direta (com política de bucket configurada)
      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,  // URL pública (controlada pela política do bucket)
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag,
        location: result.Location
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro no upload de foto de perfil:', error);
      throw error;
    }
  }

  /**
   * Upload de logo da empresa
   */
  async uploadCompanyLogo(companyId, file, logoType = 'light') {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, companyId);
      const key = `${this.prefixes.companyLogos}${companyId}/${logoType}/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          companyId: companyId.toString(),
          logoType: logoType,
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        // Se falhar com ACL, tentar sem ACL
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Logo da empresa enviado: ${result.Location}`);

      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro no upload de logo:', error);
      throw error;
    }
  }

  /**
   * Deletar arquivo do S3
   */
  async deleteFile(key) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(deleteParams).promise();

      console.log(`✅ [S3Service] Arquivo deletado: ${key}`);

      return {
        success: true,
        message: 'Arquivo deletado com sucesso'
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  /**
   * Deletar todas as fotos de perfil de um usuário
   */
  async deleteUserProfilePhotos(userId) {
    try {
      const prefix = `${this.prefixes.profilePhotos}${userId}/`;
      
      // Listar todos os objetos com o prefixo
      const listParams = {
        Bucket: this.bucketName,
        Prefix: prefix
      };

      const listedObjects = await this.s3.listObjectsV2(listParams).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`ℹ️ [S3Service] Nenhuma foto encontrada para o usuário ${userId}`);
        return { success: true, deleted: 0 };
      }

      // Deletar todos os objetos encontrados
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
        }
      };

      await this.s3.deleteObjects(deleteParams).promise();

      console.log(`✅ [S3Service] ${listedObjects.Contents.length} fotos deletadas do usuário ${userId}`);

      return {
        success: true,
        deleted: listedObjects.Contents.length
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar fotos do usuário:', error);
      throw error;
    }
  }

  /**
   * Obter URL temporária para download privado
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn // tempo em segundos
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);

      return {
        success: true,
        url: url,
        expiresIn: expiresIn
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao gerar URL assinada:', error);
      throw error;
    }
  }

  /**
   * Listar arquivos de um prefixo
   */
  async listFiles(prefix, maxKeys = 100) {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      };

      const result = await this.s3.listObjectsV2(params).promise();

      return {
        success: true,
        files: result.Contents || [],
        count: result.KeyCount || 0,
        isTruncated: result.IsTruncated || false
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao listar arquivos:', error);
      throw error;
    }
  }

  /**
   * Verificar se arquivo existe
   */
  async fileExists(key) {
    try {
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      return true;

    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Upload de logo da empresa
   */
  async uploadCompanyLogo(companyId, file) {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, companyId);
      const key = `${this.prefixes.companyLogos}${companyId}/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Sem ACL - usa as permissões padrão do bucket
        Metadata: {
          companyId: companyId.toString(),
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        // Se falhar com ACL, tentar sem ACL
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Logo da empresa enviado: ${result.Key}`);
      
      // Construir URL pública direta (com política de bucket configurada)
      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,  // URL pública (controlada pela política do bucket)
        key: result.Key,
        bucket: result.Bucket,
        location: result.Location
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao enviar logo da empresa:', error);
      throw error;
    }
  }

  /**
   * Deletar logos antigas da empresa
   */
  async deleteCompanyLogos(companyId) {
    try {
      const prefix = `${this.prefixes.companyLogos}${companyId}/`;
      
      // Listar todos os logos da empresa
      const listedObjects = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix
      }).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`ℹ️ [S3Service] Nenhum logo encontrado para a empresa ${companyId}`);
        return { success: true, deleted: 0 };
      }

      // Deletar todos os objetos encontrados
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
        }
      };

      await this.s3.deleteObjects(deleteParams).promise();

      console.log(`✅ [S3Service] ${listedObjects.Contents.length} logos deletados da empresa ${companyId}`);

      return {
        success: true,
        deleted: listedObjects.Contents.length
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar logos da empresa:', error);
      throw error;
    }
  }

  /**
   * Obter metadados do arquivo
   */
  async getFileMetadata(key) {
    try {
      const result = await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      return {
        success: true,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao obter metadados:', error);
      throw error;
    }
  }

  /**
   * Upload de assets de branding (logos, favicons, backgrounds, etc)
   */
  async uploadBrandingAsset(companyId, file, assetType) {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, `${companyId}_${assetType}`);
      const key = `${this.prefixes.brandingAssets}${companyId}/${assetType}/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          companyId: companyId.toString(),
          assetType: assetType,
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        // Se falhar com ACL, tentar sem ACL
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Branding asset enviado: ${result.Key}`);
      
      // Para assets de branding, usar URL pública direta (sem expiração)
      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;
      
      return {
        success: true,
        url: publicUrl, // URL pública (não expira)
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag,
        location: result.Location,
        assetType: assetType
      };

    } catch (error) {
      console.error(`❌ [S3Service] Erro no upload de ${assetType}:`, error);
      throw error;
    }
  }

  /**
   * Deletar assets antigos de branding de uma empresa
   */
  async deleteBrandingAssets(companyId, assetType = null) {
    try {
      const prefix = assetType 
        ? `${this.prefixes.brandingAssets}${companyId}/${assetType}/`
        : `${this.prefixes.brandingAssets}${companyId}/`;
      
      // Listar todos os assets da empresa
      const listedObjects = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix
      }).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`ℹ️ [S3Service] Nenhum asset encontrado para ${companyId}${assetType ? `/${assetType}` : ''}`);
        return { success: true, deleted: 0 };
      }

      // Deletar todos os objetos encontrados
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
        }
      };

      await this.s3.deleteObjects(deleteParams).promise();

      console.log(`✅ [S3Service] ${listedObjects.Contents.length} assets deletados da empresa ${companyId}`);

      return {
        success: true,
        deleted: listedObjects.Contents.length
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar assets de branding:', error);
      throw error;
    }
  }

  /**
   * Gerar URL pública para arquivo
   */
  getPublicUrl(key) {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Upload de documento do usuário (RG, CNH, Selfie)
   */
  async uploadUserDocument(userId, file, documentType) {
    try {
      // Validar arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, HEIC, WEBP ou PDF.');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
      }

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, `${userId}_${documentType}`);
      const key = `${this.prefixes.documents}${userId}/${documentType}/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          userId: userId.toString(),
          documentType: documentType,
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        // Se falhar com ACL, tentar sem ACL
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Documento enviado: ${result.Key}`);

      // Construir URL pública (controlada pela política do bucket)
      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag,
        location: result.Location
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro no upload de documento:', error);
      throw error;
    }
  }

  /**
   * Deletar documento do usuário
   */
  async deleteUserDocument(key) {
    try {
      await this.deleteFile(key);
      console.log(`✅ [S3Service] Documento deletado: ${key}`);
      return { success: true };
    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar documento:', error);
      throw error;
    }
  }

  /**
   * Deletar todos documentos de um usuário
   */
  async deleteAllUserDocuments(userId) {
    try {
      const prefix = `${this.prefixes.documents}${userId}/`;

      // Listar todos os documentos do usuário
      const listedObjects = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix
      }).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`ℹ️ [S3Service] Nenhum documento encontrado para o usuário ${userId}`);
        return { success: true, deleted: 0 };
      }

      // Deletar todos os objetos encontrados
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
        }
      };

      await this.s3.deleteObjects(deleteParams).promise();

      console.log(`✅ [S3Service] ${listedObjects.Contents.length} documentos deletados do usuário ${userId}`);

      return {
        success: true,
        deleted: listedObjects.Contents.length
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar documentos do usuário:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA PRODUTOS DE INVESTIMENTO =====

  /**
   * Upload de logo do produto de investimento
   */
  async uploadProductLogo(contractId, file) {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, `product_${contractId}`);
      const key = `investment-products/${contractId}/logo/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Tornar arquivo público
        Metadata: {
          contractId: contractId.toString(),
          assetType: 'product_logo',
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Logo do produto enviado: ${result.Key}`);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro no upload de logo do produto:', error);
      throw error;
    }
  }

  /**
   * Upload de logo do emissor
   */
  async uploadIssuerLogo(issuerId, file) {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, `issuer_${issuerId}`);
      const key = `investment-products/issuers/${issuerId}/logo/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Tornar arquivo público
        Metadata: {
          issuerId: issuerId.toString(),
          assetType: 'issuer_logo',
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Logo do emissor enviado: ${result.Key}`);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro no upload de logo do emissor:', error);
      throw error;
    }
  }

  /**
   * Upload de banner do produto de investimento
   */
  async uploadProductBanner(contractId, file) {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, `product_${contractId}`);
      const key = `investment-products/${contractId}/banner/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Tornar arquivo público
        Metadata: {
          contractId: contractId.toString(),
          assetType: 'product_banner',
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Banner do produto enviado: ${result.Key}`);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro no upload de banner do produto:', error);
      throw error;
    }
  }

  /**
   * Upload de documento do produto de investimento
   */
  async uploadProductDocument(contractId, file, documentType) {
    try {
      // Validar tipo de arquivo (aceita imagens e PDFs)
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf'
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou PDF.');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
      }

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.originalname, `product_${contractId}_${documentType}`);
      const key = `investment-products/${contractId}/documents/${documentType}/${fileName}`;

      // Sanitizar o nome original para metadados (S3 não aceita caracteres especiais em metadados)
      const sanitizedOriginalName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          contractId: contractId.toString(),
          documentType: documentType,
          originalName: sanitizedOriginalName,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Documento do produto enviado: ${result.Key}`);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag,
        documentType: documentType
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro no upload de documento do produto:', error);
      throw error;
    }
  }

  /**
   * Deletar logo do produto
   */
  async deleteProductLogo(contractId) {
    try {
      const prefix = `investment-products/${contractId}/logo/`;
      return await this.deleteFilesByPrefix(prefix);
    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar logo do produto:', error);
      throw error;
    }
  }

  /**
   * Deletar banner do produto
   */
  async deleteProductBanner(contractId) {
    try {
      const prefix = `investment-products/${contractId}/banner/`;
      return await this.deleteFilesByPrefix(prefix);
    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar banner do produto:', error);
      throw error;
    }
  }

  /**
   * Deletar documento específico do produto
   */
  async deleteProductDocument(contractId, documentType) {
    try {
      const prefix = `investment-products/${contractId}/documents/${documentType}/`;
      return await this.deleteFilesByPrefix(prefix);
    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar documento do produto:', error);
      throw error;
    }
  }

  /**
   * Upload de buffer (dados em memória) - Método genérico
   */
  async uploadBuffer(buffer, key, contentType = 'application/octet-stream') {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: process.env.S3_ACL || 'public-read'
      };

      console.log(`⬆️ [S3Service] Uploading buffer to S3: ${key}`);

      const result = await this.s3.upload(params).promise();

      console.log(`✅ [S3Service] Upload successful: ${result.Location}`);

      return result.Location;
    } catch (error) {
      console.error('❌ [S3Service] Erro ao fazer upload do buffer:', error);
      throw error;
    }
  }

  /**
   * Deletar todos os arquivos de um prefixo (helper method)
   */
  async deleteFilesByPrefix(prefix) {
    try {
      const listedObjects = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix
      }).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log(`ℹ️ [S3Service] Nenhum arquivo encontrado com prefixo ${prefix}`);
        return { success: true, deleted: 0 };
      }

      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
        }
      };

      await this.s3.deleteObjects(deleteParams).promise();

      console.log(`✅ [S3Service] ${listedObjects.Contents.length} arquivos deletados com prefixo ${prefix}`);

      return {
        success: true,
        deleted: listedObjects.Contents.length
      };

    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar arquivos:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA APP BRANDING (URLs FIXAS) =====

  /**
   * Upload com URL fixa - substitui o arquivo no mesmo caminho
   * Usado para ícones de app, splash screens, etc.
   * @param {string} tenantSlug - Slug do tenant
   * @param {object} file - Arquivo do multer
   * @param {string} assetType - Tipo: 'app-icon', 'splash', 'logo-header', 'logo-menu', 'logo-footer', 'banner-home', 'banner-promo'
   * @param {string} folder - 'build' (requer rebuild) ou 'runtime' (OTA)
   */
  async uploadTenantAsset(tenantSlug, file, assetType, folder = 'runtime') {
    try {
      // Validar arquivo
      this.validateImageFile(file);

      // Determinar extensão baseado no tipo de arquivo
      const extension = path.extname(file.originalname) || '.png';

      // Mapear tipo de asset para nome de arquivo fixo
      const fileNameMap = {
        'app-icon': 'app-icon.png',
        'splash': 'splash.png',
        'logo-header': 'logo-header.png',
        'logo-menu': 'logo-menu.png',
        'logo-footer': 'logo-footer.png',
        'banner-home': 'banner-home.png',
        'banner-promo': 'banner-promo.png'
      };

      const fileName = fileNameMap[assetType] || `${assetType}${extension}`;

      // Construir chave com estrutura de pastas: tenants/{slug}/{build|runtime}/{filename}
      const key = `tenants/${tenantSlug}/${folder}/${fileName}`;

      console.log(`📤 [S3Service] Uploading tenant asset: ${key}`);

      // Configurar parâmetros de upload
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=3600', // Cache de 1 hora
        Metadata: {
          tenantSlug: tenantSlug,
          assetType: assetType,
          folder: folder,
          uploadDate: new Date().toISOString()
        }
      };

      // Fazer upload (substitui se já existe)
      let result;
      try {
        result = await this.s3.upload(uploadParams).promise();
      } catch (uploadError) {
        if (uploadError.code === 'AccessControlListNotSupported' || uploadError.message.includes('ACL')) {
          console.warn('⚠️ ACL não suportado, tentando sem ACL...');
          delete uploadParams.ACL;
          result = await this.s3.upload(uploadParams).promise();
        } else {
          throw uploadError;
        }
      }

      console.log(`✅ [S3Service] Tenant asset uploaded: ${result.Key}`);

      // Construir URL pública fixa
      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${result.Key}`;

      return {
        success: true,
        url: publicUrl,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag,
        assetType: assetType,
        folder: folder
      };

    } catch (error) {
      console.error(`❌ [S3Service] Erro no upload de ${assetType}:`, error);
      throw error;
    }
  }

  /**
   * Upload de ícone do app (build-time) - 1024x1024px
   */
  async uploadAppIcon(tenantSlug, file) {
    return this.uploadTenantAsset(tenantSlug, file, 'app-icon', 'build');
  }

  /**
   * Upload de splash screen (build-time)
   */
  async uploadSplashScreen(tenantSlug, file) {
    return this.uploadTenantAsset(tenantSlug, file, 'splash', 'build');
  }

  /**
   * Upload de logo interno do header (OTA)
   */
  async uploadLogoHeader(tenantSlug, file) {
    return this.uploadTenantAsset(tenantSlug, file, 'logo-header', 'runtime');
  }

  /**
   * Upload de logo interno do menu (OTA)
   */
  async uploadLogoMenu(tenantSlug, file) {
    return this.uploadTenantAsset(tenantSlug, file, 'logo-menu', 'runtime');
  }

  /**
   * Upload de logo interno do footer (OTA)
   */
  async uploadLogoFooter(tenantSlug, file) {
    return this.uploadTenantAsset(tenantSlug, file, 'logo-footer', 'runtime');
  }

  /**
   * Upload de banner da home (OTA)
   */
  async uploadBannerHome(tenantSlug, file) {
    return this.uploadTenantAsset(tenantSlug, file, 'banner-home', 'runtime');
  }

  /**
   * Upload de banner de promoção (OTA)
   */
  async uploadBannerPromo(tenantSlug, file) {
    return this.uploadTenantAsset(tenantSlug, file, 'banner-promo', 'runtime');
  }

  /**
   * Deletar asset de um tenant
   */
  async deleteTenantAsset(tenantSlug, assetType, folder = 'runtime') {
    try {
      const fileNameMap = {
        'app-icon': 'app-icon.png',
        'splash': 'splash.png',
        'logo-header': 'logo-header.png',
        'logo-menu': 'logo-menu.png',
        'logo-footer': 'logo-footer.png',
        'banner-home': 'banner-home.png',
        'banner-promo': 'banner-promo.png'
      };

      const fileName = fileNameMap[assetType];
      if (!fileName) {
        throw new Error(`Tipo de asset inválido: ${assetType}`);
      }

      const key = `tenants/${tenantSlug}/${folder}/${fileName}`;

      await this.deleteFile(key);

      console.log(`✅ [S3Service] Tenant asset deletado: ${key}`);

      return {
        success: true,
        message: 'Asset deletado com sucesso'
      };

    } catch (error) {
      console.error(`❌ [S3Service] Erro ao deletar ${assetType}:`, error);
      throw error;
    }
  }

  /**
   * Deletar todos os assets de um tenant
   */
  async deleteAllTenantAssets(tenantSlug) {
    try {
      const prefix = `tenants/${tenantSlug}/`;
      return await this.deleteFilesByPrefix(prefix);
    } catch (error) {
      console.error('❌ [S3Service] Erro ao deletar assets do tenant:', error);
      throw error;
    }
  }

  /**
   * Verificar se asset do tenant existe
   */
  async tenantAssetExists(tenantSlug, assetType, folder = 'runtime') {
    try {
      const fileNameMap = {
        'app-icon': 'app-icon.png',
        'splash': 'splash.png',
        'logo-header': 'logo-header.png',
        'logo-menu': 'logo-menu.png',
        'logo-footer': 'logo-footer.png',
        'banner-home': 'banner-home.png',
        'banner-promo': 'banner-promo.png'
      };

      const fileName = fileNameMap[assetType];
      if (!fileName) {
        throw new Error(`Tipo de asset inválido: ${assetType}`);
      }

      const key = `tenants/${tenantSlug}/${folder}/${fileName}`;
      return await this.fileExists(key);

    } catch (error) {
      console.error(`❌ [S3Service] Erro ao verificar ${assetType}:`, error);
      return false;
    }
  }

  /**
   * Obter URL pública de um asset do tenant
   */
  getTenantAssetUrl(tenantSlug, assetType, folder = 'runtime') {
    const fileNameMap = {
      'app-icon': 'app-icon.png',
      'splash': 'splash.png',
      'logo-header': 'logo-header.png',
      'logo-menu': 'logo-menu.png',
      'logo-footer': 'logo-footer.png',
      'banner-home': 'banner-home.png',
      'banner-promo': 'banner-promo.png'
    };

    const fileName = fileNameMap[assetType];
    if (!fileName) {
      throw new Error(`Tipo de asset inválido: ${assetType}`);
    }

    const key = `tenants/${tenantSlug}/${folder}/${fileName}`;
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

// Exportar instância única
module.exports = new S3Service();
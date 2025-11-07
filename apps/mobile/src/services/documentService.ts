/**
 * Document Service
 *
 * Service para gerenciar documentos KYC (Know Your Customer)
 */

import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';

export type DocumentType = 'front' | 'back' | 'selfie';
export type DocumentStatus = 'not_sent' | 'pending' | 'approved' | 'rejected';

export interface UserDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  filename: string;
  s3Url: string;
  mimeType: string;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface DocumentsResponse {
  success: boolean;
  data?: UserDocument[];
  error?: string;
  message?: string;
}

export interface UploadDocumentResponse {
  success: boolean;
  data?: UserDocument;
  error?: string;
  message?: string;
}

class DocumentService {
  /**
   * Lista todos os documentos do usuário
   */
  async listDocuments(): Promise<DocumentsResponse> {
    try {
      return await apiService.get<UserDocument[]>('/api/user-documents');
    } catch (error) {
      console.error('Error listing documents:', error);
      return {
        success: false,
        error: 'Erro ao listar documentos',
        message: 'Não foi possível carregar seus documentos',
      };
    }
  }

  /**
   * Busca um documento específico por tipo
   */
  async getDocumentByType(type: DocumentType): Promise<UploadDocumentResponse> {
    try {
      const response = await this.listDocuments();
      if (!response.success || !response.data) {
        return {
          success: false,
          error: 'Documento não encontrado',
        };
      }

      const document = response.data.find(doc => doc.documentType === type);
      if (!document) {
        return {
          success: false,
          error: 'Documento não encontrado',
        };
      }

      return {
        success: true,
        data: document,
      };
    } catch (error) {
      console.error('Error getting document:', error);
      return {
        success: false,
        error: 'Erro ao buscar documento',
      };
    }
  }

  /**
   * Faz upload de um documento KYC
   */
  async uploadDocument(
    documentType: DocumentType,
    imageUri: string
  ): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData();

      // Extrair o nome do arquivo da URI
      const filename = imageUri.split('/').pop() || `${documentType}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore - FormData aceita blob no React Native
      formData.append('document', {
        uri: imageUri,
        name: filename,
        type,
      });

      formData.append('documentType', documentType);

      return await apiService.post<UserDocument>(
        '/api/user-documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } catch (error: any) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload',
        message: error.response?.data?.message || 'Não foi possível enviar o documento',
      };
    }
  }

  /**
   * Verifica o status KYC do usuário
   */
  async getKYCStatus(): Promise<{
    success: boolean;
    data?: {
      hasAllDocuments: boolean;
      allApproved: boolean;
      documents: {
        front: DocumentStatus;
        back: DocumentStatus;
        selfie: DocumentStatus;
      };
    };
    error?: string;
  }> {
    try {
      const response = await this.listDocuments();
      if (!response.success || !response.data) {
        return {
          success: false,
          error: 'Erro ao verificar status KYC',
        };
      }

      const documents = response.data;
      const frontDoc = documents.find(d => d.documentType === 'front');
      const backDoc = documents.find(d => d.documentType === 'back');
      const selfieDoc = documents.find(d => d.documentType === 'selfie');

      const hasAllDocuments = !!(frontDoc && backDoc && selfieDoc);
      const allApproved = hasAllDocuments &&
        frontDoc.status === 'approved' &&
        backDoc.status === 'approved' &&
        selfieDoc.status === 'approved';

      return {
        success: true,
        data: {
          hasAllDocuments,
          allApproved,
          documents: {
            front: frontDoc?.status || 'not_sent',
            back: backDoc?.status || 'not_sent',
            selfie: selfieDoc?.status || 'not_sent',
          },
        },
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      return {
        success: false,
        error: 'Erro ao verificar status KYC',
      };
    }
  }
}

// Exportar instância única
export const documentService = new DocumentService();
export default documentService;

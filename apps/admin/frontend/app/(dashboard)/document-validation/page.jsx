"use client";
import React, { useState, useEffect, useRef, Fragment, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAlertContext } from '@/contexts/AlertContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  FileText,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import api from '@/services/api';

const DocumentValidationPage = () => {
  const { t } = useTranslation('documentValidation');
  const { showSuccess, showError, showInfo } = useAlertContext();
  const modalRef = useRef(null);
  const [documents, setDocuments] = useState({
    front: null,
    back: null,
    selfie: null
  });
  const [selectedFiles, setSelectedFiles] = useState({
    front: null,
    back: null,
    selfie: null
  });
  const [loading, setLoading] = useState({
    front: false,
    back: false,
    selfie: false
  });
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: null, title: null, zoom: 1, isPdf: false });

  const documentTypes = [
    {
      id: 'front',
      label: t('documentTypes.front.label'),
      description: t('documentTypes.front.description')
    },
    {
      id: 'back',
      label: t('documentTypes.back.label'),
      description: t('documentTypes.back.description')
    },
    {
      id: 'selfie',
      label: t('documentTypes.selfie.label'),
      description: t('documentTypes.selfie.description')
    }
  ];

  // Buscar documentos existentes
  useEffect(() => {
    fetchUserDocuments();
  }, []);

  // Limpeza de objetos URL quando componente é desmontado
  useEffect(() => {
    return () => {
      Object.values(selectedFiles).forEach(file => {
        if (file?.preview) {
          try {
            URL.revokeObjectURL(file.preview);
          } catch (error) {
            // Ignorar erros de revogação
          }
        }
      });
    };
  }, []);

  // Funções de zoom
  const handleZoomIn = () => {
    setImageModal(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.25, 3)
    }));
  };

  const handleZoomOut = () => {
    setImageModal(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.25, 0.5)
    }));
  };

  const handleResetZoom = () => {
    setImageModal(prev => ({
      ...prev,
      zoom: 1
    }));
  };

  const fetchUserDocuments = async () => {
    try {
      setFetchingDocs(true);
      const response = await api.get('/api/user-documents');
      // console.log('📄 Documentos carregados:', response.data);
      if (response.data.success && response.data.data) {
        const docsMap = {};
        response.data.data.forEach(doc => {
          docsMap[doc.documentType] = doc;
        });
        setDocuments(docsMap);
        // console.log('📄 Mapa de documentos:', docsMap);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setFetchingDocs(false);
    }
  };

  const handleFileSelect = (file, documentType) => {
    console.log(`📎 handleFileSelect chamado:`, { documentType, file: file?.name });

    if (!file) {
      console.warn('⚠️ Arquivo vazio recebido');
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showError(t('errors.invalidFileType'));
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError(t('errors.fileTooLarge'));
      return;
    }

    console.log(`✅ Arquivo válido, criando preview...`);

    // Revogar preview anterior se existir
    const previousFile = selectedFiles[documentType];
    if (previousFile?.preview) {
      URL.revokeObjectURL(previousFile.preview);
    }

    // Criar preview para imagens
    const fileWithPreview = Object.assign(file, {
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    });

    console.log(`💾 Salvando arquivo no estado para ${documentType}`);

    setSelectedFiles(prev => {
      const newState = {
        ...prev,
        [documentType]: fileWithPreview
      };
      console.log('📦 Novo estado de selectedFiles:', newState);
      return newState;
    });
  };

  const handleRemoveFile = (documentType) => {
    const file = selectedFiles[documentType];
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setSelectedFiles(prev => ({
      ...prev,
      [documentType]: null
    }));
  };

  const handleFileUpload = async (file, documentType) => {
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showError(t('errors.invalidFileType'));
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError(t('errors.fileTooLarge'));
      return;
    }

    setLoading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post(`/user-documents/${documentType}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: response.data.data
        }));
        // Limpar arquivo selecionado após upload
        handleRemoveFile(documentType);
        showSuccess(t('messages.success'));
      }
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      showError(error.response?.data?.message || t('errors.uploadFailed'));
    } finally {
      setLoading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleUploadAll = async () => {
    console.log('🚀 handleUploadAll iniciado');
    console.log('📂 Estado atual de selectedFiles:', selectedFiles);
    console.log('📄 Estado atual de documents:', documents);

    const filesToUpload = Object.entries(selectedFiles).filter(([type, file]) => {
      console.log(`Verificando ${type}:`, { file: file?.name, doc: documents[type]?.status });
      if (!file) return false;
      const doc = documents[type];
      // Permitir upload se: não existe documento OU status é 'not_sent' OU status é 'rejected'
      return !doc || doc.status === 'not_sent' || doc.status === 'rejected';
    });

    console.log('📤 Arquivos para upload:', filesToUpload);

    if (filesToUpload.length === 0) {
      showInfo(t('messages.noDocumentsSelected'));
      return;
    }

    setLoading(prev => {
      const newLoading = { ...prev };
      filesToUpload.forEach(([type]) => {
        newLoading[type] = true;
      });
      return newLoading;
    });

    try {
      const uploadPromises = filesToUpload.map(async ([documentType, file]) => {
        try {
          const formData = new FormData();
          formData.append('document', file);

          const uploadUrl = `/api/user-documents/${documentType}/upload`;
          console.log(`📤 Enviando ${documentType} para:`, uploadUrl);

          const response = await api.post(uploadUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          console.log(`✅ Resposta do servidor para ${documentType}:`, {
            status: response.status,
            data: response.data,
            success: response.data?.success
          });

          if (response.data && response.data.success) {
            console.log(`✅ Upload de ${documentType} bem-sucedido!`);
            return { success: true, documentType, data: response.data.data };
          }

          console.error(`❌ Resposta sem success=true para ${documentType}:`, response.data);
          throw new Error(response.data?.message || `Erro no envio do documento ${documentType}`);
        } catch (uploadError) {
          console.error(`❌ Erro ao enviar ${documentType}:`, {
            name: uploadError.name,
            message: uploadError.message,
            response: uploadError.response?.data,
            status: uploadError.response?.status,
            url: uploadError.config?.url,
            stack: uploadError.stack
          });
          return {
            success: false,
            documentType,
            error: uploadError.response?.data?.message || uploadError.message || 'Erro desconhecido'
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      // Verificar se algum upload falhou
      const failedUploads = results.filter(r => !r.success);
      if (failedUploads.length > 0) {
        const docTypeLabels = {
          front: 'Frente',
          back: 'Verso',
          selfie: 'Selfie'
        };
        const errorMessages = failedUploads
          .map(f => `• ${docTypeLabels[f.documentType]}: ${f.error}`)
          .join('\n');
        throw new Error(`Falha no envio:\n${errorMessages}`);
      }

      const successResults = results.filter(r => r.success);

      // Atualizar documentos com os dados do servidor
      setDocuments(prev => {
        const newDocs = { ...prev };
        successResults.forEach(({ documentType, data }) => {
          // Garantir que os dados do servidor incluem a URL assinada
          newDocs[documentType] = {
            ...data,
            s3Url: data.s3Url // URL assinada já vem do servidor
          };
        });
        return newDocs;
      });

      // Limpar arquivos selecionados E suas URLs
      setSelectedFiles(prev => {
        const newSelectedFiles = { ...prev };
        successResults.forEach(({ documentType }) => {
          const file = newSelectedFiles[documentType];
          if (file?.preview) {
            URL.revokeObjectURL(file.preview);
          }
          newSelectedFiles[documentType] = null;
        });
        return newSelectedFiles;
      });

      showSuccess(t('messages.successMultiple', { count: successResults.length }));
    } catch (error) {
      console.error('Erro ao enviar documentos:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Erro ao enviar um ou mais documentos';
      showError(errorMessage);
    } finally {
      setLoading({ front: false, back: false, selfie: false });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={18} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={18} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return <span className="text-xs text-green-600">{t('status.approved')}</span>;
      case 'pending':
        return <span className="text-xs text-yellow-600">{t('status.pending')}</span>;
      case 'rejected':
        return <span className="text-xs text-red-600">{t('status.rejected')}</span>;
      default:
        return <span className="text-xs text-gray-500">{t('status.notSent')}</span>;
    }
  };

  const DocumentUploader = ({ documentType, label, description, document, loading }) => {
    const selectedFile = selectedFiles[documentType];
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.webp'],
        'application/pdf': ['.pdf']
      },
      maxSize: 10 * 1024 * 1024,
      multiple: false,
      disabled: loading || document?.status === 'approved',
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          handleFileSelect(acceptedFiles[0], documentType);
        }
      }
    });

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
              {document && getStatusIcon(document.status)}
            </div>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>

        {document && document.status !== 'rejected' && document.status !== 'not_sent' ? (
          // Documento já enviado (pendente ou aprovado) - exibir resultado final
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            {document.s3Url && document.mimeType?.startsWith('image/') ? (
              <img
                src={document.s3Url}
                alt={label}
                className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setImageModal({ isOpen: true, imageUrl: document.s3Url, title: label, zoom: 1, isPdf: false })}
              />
            ) : document.s3Url && document.mimeType === 'application/pdf' ? (
              <div
                className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded flex flex-col items-center justify-center border border-blue-200 dark:border-blue-700 cursor-pointer hover:opacity-80 transition-opacity relative"
                onClick={() => setImageModal({ isOpen: true, imageUrl: document.s3Url, title: label, zoom: 1, isPdf: true })}
              >
                <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 mt-0.5">PDF</span>
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <FileText className="text-gray-400" size={24} />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {document.filename}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusText(document.status)}
                {document.status === 'approved' && (
                  <CheckCircle className="text-green-500" size={16} />
                )}
              </div>
              {document.uploadedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('uploader.uploadedOn')} {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        ) : document && document.status === 'rejected' ? (
          // Documento rejeitado - mostrar motivo e permitir novo upload
          <div className="space-y-3">
            {/* Informações do documento rejeitado */}
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
              {document.s3Url && document.mimeType?.startsWith('image/') ? (
                <img
                  src={document.s3Url}
                  alt={label}
                  className="w-16 h-16 object-cover rounded border border-red-300 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setImageModal({ isOpen: true, imageUrl: document.s3Url, title: label, zoom: 1, isPdf: false })}
                />
              ) : document.s3Url && document.mimeType === 'application/pdf' ? (
                <div
                  className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center border border-blue-200 dark:border-blue-700 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setImageModal({ isOpen: true, imageUrl: document.s3Url, title: label, zoom: 1, isPdf: true })}
                >
                  <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center border border-red-300 dark:border-red-800">
                  <FileText className="text-red-400" size={24} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {document.filename}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusText(document.status)}
                </div>
                {document.uploadedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('uploader.uploadedOn')} {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            {/* Motivo da rejeição em destaque */}
            {document.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                      {t('uploader.rejectionReason')}:
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {document.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Layout lado a lado: Dropzone + Preview para novo envio */}
            <div className="grid grid-cols-2 gap-4">
              {/* Dropzone do lado esquerdo */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                  transition-colors duration-200 h-32 flex flex-col items-center justify-center
                  ${isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-xs text-gray-600">{t('uploader.uploading')}...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isDragActive ? t('uploader.dropHere') : t('uploader.clickOrDrag')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('uploader.fileTypes')}
                    </p>
                  </>
                )}
              </div>

              {/* Preview do lado direito */}
              <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                {selectedFile ? (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {selectedFile.preview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={selectedFile.preview}
                          alt={label}
                          className="w-full h-full object-contain rounded"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(documentType);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="text-gray-400" size={32} />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(documentType);
                          }}
                          className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600 transition-colors"
                        >
                          {t('uploader.remove')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={32} />
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {t('uploader.previewNew')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Layout lado a lado: Dropzone + Preview
          <div className="grid grid-cols-2 gap-4">
            {/* Dropzone do lado esquerdo */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                transition-colors duration-200 h-32 flex flex-col items-center justify-center
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-xs text-gray-600">{t('uploader.uploading')}...</span>
                </div>
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDragActive ? t('uploader.dropHere') : t('uploader.clickOrDrag')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('uploader.fileTypes')}
                  </p>
                </>
              )}
            </div>

            {/* Preview do lado direito */}
            <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              {selectedFile ? (
                <div className="w-full h-full flex items-center justify-center relative">
                  {selectedFile.preview ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={selectedFile.preview} 
                        alt={label}
                        className="w-full h-full object-contain rounded"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(documentType);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="text-gray-400" size={32} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(documentType);
                        }}
                        className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600 transition-colors"
                      >
                        {t('uploader.remove')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={32} />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {t('uploader.preview')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (fetchingDocs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const approvedCount = Object.values(documents).filter(doc => doc?.status === 'approved').length;
  const isComplete = approvedCount === 3;

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('subtitle')}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                {approvedCount}/3
              </div>
              <p className="text-xs text-gray-500">{t('approved')}</p>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isComplete ? 'bg-green-500' : 'bg-blue-600'
                }`}
                style={{ width: `${(approvedCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Documentos */}
      <Card>
        <div className="p-6 space-y-4">
          {documentTypes.map((docType) => (
            <DocumentUploader
              key={docType.id}
              documentType={docType.id}
              label={docType.label}
              description={docType.description}
              document={documents[docType.id]}
              loading={loading[docType.id]}
            />
          ))}
          
          {/* Botão de Envio - Sempre Visível */}
          {(() => {
            const hasSelectedFiles = Object.values(selectedFiles).some(file => file !== null);
            const isLoading = Object.values(loading).some(l => l);
            const selectedCount = Object.values(selectedFiles).filter(file => file !== null).length;
            
            return (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedCount > 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('selectedCount', { count: selectedCount })}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {t('selectFiles')}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleUploadAll}
                    disabled={!hasSelectedFiles || isLoading}
                    className={`btn ${!hasSelectedFiles ? 'btn-secondary opacity-50' : 'btn-primary'}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t('uploader.uploading')}...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={16} />
                        <span>{selectedCount > 1 ? t('uploadMultiple', { count: selectedCount }) : selectedCount === 1 ? t('uploadSingle') : t('uploadDocuments')}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </Card>

      {/* Avisos Importantes */}
      <Card>
        <div className="p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-amber-500 flex-shrink-0" size={18} />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white mb-1">{t('warnings.title')}</p>
              <ul className="space-y-1 text-xs">
                <li>• {t('warnings.item1')}</li>
                <li>• {t('warnings.item2')}</li>
                <li>• {t('warnings.item3')}</li>
                <li>• {t('warnings.item4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Visualização de Imagem/PDF com Headless UI */}
      <Transition appear show={imageModal.isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[99999]"
          onClose={() => setImageModal({ isOpen: false, imageUrl: null, title: null, zoom: 1, isPdf: false })}
        >
          {/* Backdrop escuro */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-full">
                <div
                  ref={modalRef}
                  className="w-full h-full flex flex-col"
                >
                  {/* Header com fundo sólido */}
                  <div className="bg-slate-900 border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-white font-semibold text-lg">
                        {imageModal.title}
                      </Dialog.Title>
                      <div className="flex items-center gap-3">
                        {/* Controles de Zoom - apenas para imagens */}
                        {!imageModal.isPdf && (
                          <>
                            <div className="flex items-center gap-2 bg-slate-800 rounded-md border border-slate-600 p-1">
                              <button
                                onClick={handleZoomOut}
                                disabled={imageModal.zoom <= 0.5}
                                className="text-slate-300 hover:text-white hover:bg-slate-700 rounded p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Diminuir zoom"
                              >
                                <ZoomOut size={18} />
                              </button>
                              <span className="text-white text-sm font-medium px-2 min-w-[60px] text-center">
                                {Math.round(imageModal.zoom * 100)}%
                              </span>
                              <button
                                onClick={handleZoomIn}
                                disabled={imageModal.zoom >= 3}
                                className="text-slate-300 hover:text-white hover:bg-slate-700 rounded p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Aumentar zoom"
                              >
                                <ZoomIn size={18} />
                              </button>
                            </div>

                            {/* Botão Reset Zoom (1:1) */}
                            {imageModal.zoom !== 1 && (
                              <button
                                onClick={handleResetZoom}
                                className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded px-3 py-1.5 text-sm transition-colors border border-slate-600"
                                title="Reset zoom (100%)"
                              >
                                1:1
                              </button>
                            )}
                          </>
                        )}

                        {/* Botão Fechar */}
                        <button
                          onClick={() => setImageModal({ isOpen: false, imageUrl: null, title: null, zoom: 1, isPdf: false })}
                          className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full p-2 transition-colors"
                          title="Fechar"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Área da Imagem/PDF com fundo escuro */}
                  <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-slate-950">
                    {imageModal.isPdf ? (
                      <iframe
                        src={imageModal.imageUrl}
                        className="w-full h-full rounded-lg shadow-2xl"
                        title={imageModal.title}
                      />
                    ) : (
                      <img
                        src={imageModal.imageUrl}
                        alt={imageModal.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-150 rounded-lg shadow-2xl"
                        style={{ transform: `scale(${imageModal.zoom})` }}
                      />
                    )}
                  </div>

                  {/* Footer com fundo sólido */}
                  <div className="bg-slate-900 border-t border-slate-700 p-4">
                    <p className="text-slate-300 text-sm text-center">
                      {imageModal.isPdf
                        ? t('imageModal.pdfInstructions')
                        : t('imageModal.imageInstructions')
                      }
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DocumentValidationPage;
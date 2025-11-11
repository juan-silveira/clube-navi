"use client";
import React, { useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import Card from '@/components/ui/Card';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import api from '@/services/api';

const UserDocumentsTab = ({ userId }) => {
  const { t } = useTranslation('admin');
  const [documents, setDocuments] = useState({
    front: null,
    back: null,
    selfie: null
  });
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: null, title: null, zoom: 1, isPdf: false });

  const documentTypes = [
    {
      id: 'front',
      label: t('users.profile.documents.types.front'),
      description: t('users.profile.documents.types.frontDesc')
    },
    {
      id: 'back',
      label: t('users.profile.documents.types.back'),
      description: t('users.profile.documents.types.backDesc')
    },
    {
      id: 'selfie',
      label: t('users.profile.documents.types.selfie'),
      description: t('users.profile.documents.types.selfieDesc')
    }
  ];

  // Buscar documentos do usuário específico
  useEffect(() => {
    fetchUserDocuments();
  }, [userId]);

  const fetchUserDocuments = async () => {
    try {
      setFetchingDocs(true);
      const response = await api.get(`/api/user-documents/user/${userId}`);
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
        return <span className="text-xs text-green-600">{t('users.profile.documents.status.approved')}</span>;
      case 'pending':
        return <span className="text-xs text-yellow-600">{t('users.profile.documents.status.pending')}</span>;
      case 'rejected':
        return <span className="text-xs text-red-600">{t('users.profile.documents.status.rejected')}</span>;
      default:
        return <span className="text-xs text-gray-500">{t('users.profile.documents.status.notSent')}</span>;
    }
  };

  const DocumentViewer = ({ documentType, label, description, document }) => {
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

        {document ? (
          // Documento existe - exibir informações
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            {document.s3Url && document.mimeType?.startsWith('image/') ? (
              <img
                src={document.s3Url}
                alt={label}
                className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setImageModal({
                  isOpen: true,
                  imageUrl: document.s3Url,
                  title: label,
                  zoom: 1,
                  isPdf: false
                })}
                title={t('users.profile.documents.clickToView')}
              />
            ) : document.s3Url && document.mimeType === 'application/pdf' ? (
              <div
                className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center border border-blue-200 dark:border-blue-700 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setImageModal({
                  isOpen: true,
                  imageUrl: document.s3Url,
                  title: label,
                  zoom: 1,
                  isPdf: true
                })}
                title={t('users.profile.documents.clickToViewPdf')}
              >
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
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
              {document.rejectionReason && (
                <p className="text-xs text-red-500 mt-1">
                  {t('users.profile.documents.reason')}: {document.rejectionReason}
                </p>
              )}
              {document.uploadedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('users.profile.documents.uploadedOn')} {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        ) : (
          // Documento não enviado
          <div className="flex items-center justify-center h-24 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <FileText className="text-gray-300 dark:text-gray-600 mx-auto mb-2" size={32} />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t('users.profile.documents.notSent')}
              </p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('users.profile.documents.title')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t('users.profile.documents.subtitle')}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                {approvedCount}/3
              </div>
              <p className="text-xs text-gray-500">{t('users.profile.documents.approved')}</p>
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
            <DocumentViewer
              key={docType.id}
              documentType={docType.id}
              label={docType.label}
              description={docType.description}
              document={documents[docType.id]}
            />
          ))}
        </div>
      </Card>

      {/* Status Geral */}
      <Card>
        <div className="p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-amber-500 flex-shrink-0" size={18} />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white mb-1">{t('users.profile.documents.validationStatus')}</p>
              <ul className="space-y-1 text-xs">
                <li>• {t('users.profile.documents.approvedCount', { count: approvedCount })}</li>
                <li>• {t('users.profile.documents.pendingCount', { count: Object.values(documents).filter(doc => doc?.status === 'pending').length })}</li>
                <li>• {t('users.profile.documents.rejectedCount', { count: Object.values(documents).filter(doc => doc?.status === 'rejected').length })}</li>
                <li>• {t('users.profile.documents.notSentCount', { count: 3 - Object.values(documents).filter(doc => doc !== null).length })}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Visualização de Imagem/PDF com Zoom */}
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
            <div className="fixed inset-0 bg-black backdrop-filter backdrop-blur-sm" />
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
                <div className="w-full h-full flex flex-col">
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
                                title={t('users.profile.documents.zoomOut')}
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
                                title={t('users.profile.documents.zoomIn')}
                              >
                                <ZoomIn size={18} />
                              </button>
                            </div>

                            {/* Botão Reset Zoom (1:1) */}
                            {imageModal.zoom !== 1 && (
                              <button
                                onClick={handleResetZoom}
                                className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded px-3 py-1.5 text-sm transition-colors border border-slate-600"
                                title={t('users.profile.documents.resetZoom')}
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
                          title={t('users.profile.documents.close')}
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
                        ? t('users.profile.documents.pdfControls')
                        : t('users.profile.documents.zoomControls')
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

export default UserDocumentsTab;
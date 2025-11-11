"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import { Upload, FileText } from 'lucide-react';
import { useAlertContext } from '@/contexts/AlertContext';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

const AddStatementModal = ({
  isOpen,
  onClose,
  contractId,
  companyId,
  onSuccess,
  editingStatement = null
}) => {
  const { t } = useTranslation('admin');
  const { showSuccess, showError } = useAlertContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    statementDate: '',
    name: '',
    file: null,
    linkUrl: ''
  });
  const [fileName, setFileName] = useState('');
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const isEditing = !!editingStatement;

  // Populate form when editing
  useEffect(() => {
    if (editingStatement) {
      setFormData({
        statementDate: editingStatement.statementDate ? new Date(editingStatement.statementDate).toISOString().split('T')[0] : '',
        name: editingStatement.name || '',
        file: null,
        linkUrl: editingStatement.linkUrl || ''
      });
      setFileName('');
      setRemoveExistingFile(false);
    } else {
      setFormData({
        statementDate: '',
        name: '',
        file: null,
        linkUrl: ''
      });
      setFileName('');
      setRemoveExistingFile(false);
    }
  }, [editingStatement]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ];

      if (!allowedTypes.includes(file.type)) {
        showError(t('companyStakes.statements.addModal.fileInfo'));
        return;
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError(t('companyStakes.statements.addModal.fileInfo'));
        return;
      }

      setFormData(prev => ({ ...prev, file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    // Validar campos
    if (!formData.statementDate) {
      showError(t('companyStakes.statements.addModal.date'));
      return;
    }

    if (!formData.name) {
      showError(t('companyStakes.statements.addModal.name'));
      return;
    }

    // Validação especial para edição
    if (isEditing) {
      // Verificar se está removendo arquivo existente e não tem novo arquivo nem link
      const hasExistingFile = editingStatement.fileUrl && !removeExistingFile && !formData.file;
      const hasNewFile = formData.file;
      const hasLink = formData.linkUrl;

      if (!hasExistingFile && !hasNewFile && !hasLink) {
        showError(t('companyStakes.statements.addModal.fileOrLink'));
        return;
      }
    } else {
      // Para criação, precisa ter arquivo ou link
      if (!formData.file && !formData.linkUrl) {
        showError(t('companyStakes.statements.addModal.fileOrLink'));
        return;
      }
    }

    try {
      setLoading(true);

      if (isEditing) {
        // Modo de edição - usar PUT
        const uploadFormData = new FormData();

        if (formData.file) {
          uploadFormData.append('file', formData.file);
        }

        uploadFormData.append('statementDate', formData.statementDate);
        uploadFormData.append('name', formData.name);
        uploadFormData.append('linkUrl', formData.linkUrl || '');
        uploadFormData.append('removeFile', removeExistingFile.toString());

        const response = await api.put(`/api/stake-statements/${editingStatement.id}`, uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          showSuccess(t('companyStakes.statements.editModal.success'));

          // Notificar sucesso
          if (onSuccess) {
            onSuccess();
          }

          // Fechar modal
          onClose();
        } else {
          showError(response.data.message || t('companyStakes.statements.editModal.error'));
        }
      } else {
        // Modo de criação - usar POST
        const uploadFormData = new FormData();
        if (formData.file) {
          uploadFormData.append('file', formData.file);
        }
        uploadFormData.append('contractId', contractId);
        uploadFormData.append('companyId', companyId);
        uploadFormData.append('statementDate', formData.statementDate);
        uploadFormData.append('name', formData.name);
        if (formData.linkUrl) {
          uploadFormData.append('linkUrl', formData.linkUrl);
        }

        const response = await api.post('/api/stake-statements', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          showSuccess(t('companyStakes.statements.addModal.add'));

          // Limpar formulário
          setFormData({
            statementDate: '',
            name: '',
            file: null,
            linkUrl: ''
          });
          setFileName('');

          // Notificar sucesso
          if (onSuccess) {
            onSuccess();
          }

          // Fechar modal
          onClose();
        } else {
          showError(response.data.message || t('companyStakes.statements.addModal.add'));
        }
      }
    } catch (error) {
      console.error('Error saving statement:', error);
      showError(error.response?.data?.message || (isEditing ? t('companyStakes.statements.editModal.error') : t('companyStakes.statements.addModal.add')));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        statementDate: '',
        name: '',
        file: null,
        linkUrl: ''
      });
      setFileName('');
      setRemoveExistingFile(false);
      onClose();
    }
  };

  return (
    <Modal
      title={isEditing ? t('companyStakes.statements.editModal.title') : t('companyStakes.statements.addModal.title')}
      activeModal={isOpen}
      onClose={handleClose}
      centered
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Data do Demonstrativo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('companyStakes.statements.addModal.date')} *
          </label>
          <Textinput
            type="date"
            placeholder={t('companyStakes.statements.addModal.datePlaceholder')}
            value={formData.statementDate}
            onChange={(e) => setFormData(prev => ({ ...prev, statementDate: e.target.value }))}
            disabled={loading}
          />
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('companyStakes.statements.addModal.name')} *
          </label>
          <Textinput
            placeholder={t('companyStakes.statements.addModal.namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={loading}
          />
        </div>

        {/* Link URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('companyStakes.statements.addModal.linkUrl')}
          </label>
          <Textinput
            type="url"
            placeholder={t('companyStakes.statements.addModal.linkUrlPlaceholder')}
            value={formData.linkUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
            disabled={loading}
          />
        </div>

        {/* Arquivo Existente (modo edição) */}
        {isEditing && editingStatement.fileUrl && !removeExistingFile && !formData.file && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {t('companyStakes.statements.editModal.currentFile')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {editingStatement.fileUrl.split('/').pop()}
                  </p>
                </div>
              </div>
              <Button
                className="btn-sm btn-outline-danger flex-shrink-0"
                onClick={() => setRemoveExistingFile(true)}
                disabled={loading}
              >
                {t('companyStakes.statements.editModal.removeFile')}
              </Button>
            </div>
          </div>
        )}

        {/* Upload de Arquivo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {isEditing ? t('companyStakes.statements.editModal.newFile') : t('companyStakes.statements.addModal.file')}
          </label>
          <div className="mt-1">
            <label
              htmlFor="file-upload"
              className={`
                flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer
                transition-colors duration-200
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'}
                ${fileName ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600'}
              `}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                disabled={loading}
              />
              <div className="flex items-center space-x-2">
                {fileName ? (
                  <>
                    <FileText className="w-5 h-5 text-primary-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t('companyStakes.statements.addModal.fileSelected')} {fileName}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {t('companyStakes.statements.addModal.selectFile')} ({t('companyStakes.statements.addModal.fileInfo')})
                    </span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            text={t('companyStakes.statements.addModal.cancel')}
            className="btn-secondary"
            onClick={handleClose}
            disabled={loading}
          />
          <Button
            text={loading
              ? (isEditing ? t('companyStakes.statements.editModal.updating') : t('companyStakes.statements.addModal.uploading'))
              : (isEditing ? t('companyStakes.statements.editModal.update') : t('companyStakes.statements.addModal.add'))
            }
            className="btn-primary"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddStatementModal;

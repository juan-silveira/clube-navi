"use client";

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Select from 'react-select';
import { Bell, Send, Users, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAlertContext } from '@/contexts/AlertContext';

const NotificationSender = ({ 
  isOpen, 
  onClose, 
  selectedUsers = [], 
  isBulk = false 
}) => {
  const { sendNotification, sendBulkNotification, loading } = useNotifications();
  const { showSuccess, showError } = useAlertContext();
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    category: 'general'
  });

  const notificationTypes = [
    { value: 'info', label: 'Informação', icon: Info, color: 'text-blue-500' },
    { value: 'success', label: 'Sucesso', icon: CheckCircle, color: 'text-green-500' },
    { value: 'warning', label: 'Aviso', icon: AlertTriangle, color: 'text-yellow-500' },
    { value: 'error', label: 'Erro', icon: AlertCircle, color: 'text-red-500' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'Geral' },
    { value: 'system', label: 'Sistema' },
    { value: 'security', label: 'Segurança' },
    { value: 'account', label: 'Conta' },
    { value: 'transaction', label: 'Transação' },
    { value: 'document', label: 'Documento' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 NotificationSender - handleSubmit called');
    console.log('🔍 Form data:', formData);
    console.log('🔍 Selected users:', selectedUsers);
    
    if (!formData.title.trim() || !formData.message.trim()) {
      console.log('❌ Validation failed: title or message empty');
      showError('Título e mensagem são obrigatórios');
      return;
    }

    if (selectedUsers.length === 0) {
      console.log('❌ Validation failed: no users selected');
      showError('Nenhum usuário selecionado');
      return;
    }

    console.log('✅ Validation passed, preparing to send notification');

    try {
      if (isBulk && selectedUsers.length > 1) {
        console.log('📤 Sending bulk notification');
        const userIds = selectedUsers.map(user => user.id);
        console.log('🔍 User IDs for bulk:', userIds);
        
        const result = await sendBulkNotification(userIds, formData);
        console.log('✅ Bulk notification result:', result);
        showSuccess(`Notificação enviada para ${selectedUsers.length} usuários`);
      } else {
        console.log('📤 Sending single notification');
        const userId = selectedUsers[0].id;
        const userName = selectedUsers[0].name;
        
        console.log('🔍 Sending to user:', { id: userId, name: userName });
        console.log('🔍 Notification data:', formData);
        
        const result = await sendNotification(userId, formData);
        console.log('✅ Single notification result:', result);
        showSuccess(`Notificação enviada para ${userName}`);
      }
      
      // Limpar formulário e fechar modal
      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        category: 'general'
      });
      onClose();
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      showError(error.message || 'Erro ao enviar notificação');
    }
  };

  const selectedType = notificationTypes.find(type => type.value === formData.type);
  const TypeIcon = selectedType?.icon || Info;

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title="Enviar Notificação"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info dos usuários selecionados */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users size={16} className="text-slate-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isBulk && selectedUsers.length > 1 
                ? `${selectedUsers.length} usuários selecionados`
                : `Enviando para: ${selectedUsers[0]?.name || 'Usuário'}`
              }
            </span>
          </div>
          {selectedUsers.length <= 3 && (
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {selectedUsers.map(user => user.name).join(', ')}
            </div>
          )}
        </div>

        {/* Título */}
        <div>
          <Textinput
            label="Título da Notificação"
            placeholder="Digite o título da notificação"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
        </div>

        {/* Tipo e Prioridade */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tipo
            </label>
            <Select
              options={notificationTypes.map(type => ({
                value: type.value,
                label: (
                  <div className="flex items-center space-x-2">
                    <type.icon size={14} className={type.color} />
                    <span>{type.label}</span>
                  </div>
                )
              }))}
              value={{ value: formData.type, label: formData.type }}
              onChange={(option) => handleInputChange('type', option.value)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Prioridade
            </label>
            <Select
              options={priorityOptions}
              value={priorityOptions.find(p => p.value === formData.priority)}
              onChange={(option) => handleInputChange('priority', option.value)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Categoria
          </label>
          <Select
            options={categoryOptions}
            value={categoryOptions.find(c => c.value === formData.category)}
            onChange={(option) => handleInputChange('category', option.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Mensagem */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Mensagem
          </label>
          <textarea
            placeholder="Digite a mensagem da notificação..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white resize-none"
            required
          />
          <div className="text-xs text-slate-500 mt-1">
            {formData.message.length}/500 caracteres
          </div>
        </div>

        {/* Preview */}
        {formData.title && formData.message && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preview:</h4>
            <div className="flex items-start space-x-3">
              <div className={`p-1 rounded ${selectedType?.color}`}>
                <TypeIcon size={16} />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.title}
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {formData.message}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                  <span>Prioridade: {priorityOptions.find(p => p.value === formData.priority)?.label}</span>
                  <span>Categoria: {categoryOptions.find(c => c.value === formData.category)?.label}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Send size={14} className="mr-2" />
            Enviar Notificação
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NotificationSender;
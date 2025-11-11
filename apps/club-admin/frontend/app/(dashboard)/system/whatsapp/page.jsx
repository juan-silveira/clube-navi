"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import MultiSelect from '@/components/ui/MultiSelect';
import { useAlertContext } from '@/contexts/AlertContext';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/services/api';
import {
  Send,
  Users,
  MessageCircle,
  FileText,
  History,
  Loader
} from 'lucide-react';

const WhatsAppMessagingPage = () => {
  const { t } = useTranslation('whatsapp');
  const { showSuccess, showError } = useAlertContext();

  // Estado para envio de mensagem
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sending, setSending] = useState(false);

  // Estado para templates
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Estado para histórico
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Carregar dados iniciais
  useEffect(() => {
    fetchUsers();
    fetchTemplates();
  }, []);

  // Carregar histórico quando o usuário abre
  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, historyPage]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users?limit=1000');
      if (response.data.success) {
        const usersList = response.data.data?.users || [];
        // Ordenar alfabeticamente por nome
        const sortedUsers = usersList.sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
        );
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showError(t('errors.loadUsers'));
    }
  };

  // Função para selecionar todos os usuários (apenas com telefone)
  const handleSelectAll = () => {
    const allUserIds = users
      .filter(user => user.phone) // Somente usuários com telefone
      .map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  // Função para remover todos os usuários selecionados
  const handleDeselectAll = () => {
    setSelectedUsers([]);
  };

  // Função para normalizar telefone (apenas números)
  const normalizePhoneDisplay = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await api.get('/api/whatsapp-messages/templates');
      if (response.data.success) {
        setTemplates(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      showError(t('errors.loadTemplates'));
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get(`/api/whatsapp-messages/history?page=${historyPage}&limit=10`);
      if (response.data.success) {
        setHistory(response.data.data.messages || []);
        setHistoryTotal(response.data.data.pagination.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      showError(t('errors.loadHistory'));
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);

      // Se for template do sistema, buscar tradução
      // Se for customizado, usar mensagem original
      const message = template.isSystem
        ? t(`templateMessages.${template.id}`)
        : template.message;

      setMessage(message);
    } else {
      setSelectedTemplate('');
      setMessage('');
    }
  };

  const handleSendMessage = async () => {
    // Validações
    if (selectedUsers.length === 0) {
      showError(t('errors.noRecipients'));
      return;
    }

    if (!message.trim()) {
      showError(t('errors.noMessage'));
      return;
    }

    setSending(true);
    try {
      const response = await api.post('/api/whatsapp-messages', {
        recipientUserIds: selectedUsers,
        message: message.trim(),
        templateId: selectedTemplate || null
      });

      if (response.data.success) {
        const { successCount, failureCount } = response.data.data;
        if (failureCount === 0) {
          showSuccess(t('success.allSent', { count: successCount }));
        } else if (successCount === 0) {
          showError(t('success.allFailed', { count: failureCount }));
        } else {
          showSuccess(t('success.partialSent', { success: successCount, failed: failureCount }));
        }

        // Limpar formulário
        setSelectedUsers([]);
        setMessage('');
        setSelectedTemplate('');

        // Atualizar histórico se estiver visível
        if (showHistory) {
          fetchHistory();
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showError(error.response?.data?.message || t('errors.sendError'));
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sent':
        return t('status.sent');
      case 'failed':
        return t('status.failed');
      case 'partial':
        return t('status.partial');
      default:
        return status;
    }
  };

  const getTemplateName = (templateName) => {
    // Mapeamento direto dos nomes dos templates
    const templateMap = {
      'Boas-vindas': t('templateNames.Boas-vindas'),
      'Lembrete de Documentos': t('templateNames.Lembrete de Documentos'),
      'Aprovação de Documentação': t('templateNames.Aprovação de Documentação'),
      'Lembrete de Saque Pendente': t('templateNames.Lembrete de Saque Pendente'),
      'Comunicado Geral': t('templateNames.Comunicado Geral'),
      'Manutenção Programada': t('templateNames.Manutenção Programada'),
      'Mensagem Personalizada': t('templateNames.Mensagem Personalizada')
    };

    return templateMap[templateName] || templateName;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button
          text={showHistory ? t('buttons.hideHistory') : t('buttons.showHistory')}
          icon={History}
          className={showHistory ? "btn-secondary" : "btn-outline-secondary"}
          onClick={() => setShowHistory(!showHistory)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Envio de Mensagem */}
        <div className="lg:col-span-2">
          <Card title={t('cards.sendMessage')} icon="heroicons-outline:chat-bubble-left-right">
            <div className="space-y-6">
              {/* Destinatários */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('form.recipients.label')}
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                      type="button"
                    >
                      {t('buttons.selectAll')}
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                      type="button"
                    >
                      {t('buttons.deselectAll')}
                    </button>
                  </div>
                </div>

                <MultiSelect
                  label=""
                  options={users.map(user => ({
                    value: user.id,
                    label: `${user.name}${user.phone ? ` (${normalizePhoneDisplay(user.phone)})` : ''}`,
                    disabled: !user.phone
                  }))}
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  placeholder={t('form.recipients.placeholder')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('form.recipients.selected', { count: selectedUsers.length })}
                </p>
              </div>

              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.templates.label')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedTemplate === template.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <FileText size={16} className="mt-0.5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {getTemplateName(template.name)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.message.label')}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('form.message.placeholder')}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('form.message.characters', { count: message.length })}
                </p>
              </div>

              {/* Botão Enviar */}
              <div className="flex justify-end">
                <Button
                  text={sending ? t('buttons.sending') : t('buttons.sendMessage')}
                  icon={sending ? Loader : Send}
                  className="btn-primary"
                  onClick={handleSendMessage}
                  disabled={sending || selectedUsers.length === 0 || !message.trim()}
                  isLoading={sending}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Informações */}
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Users size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.phone).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('stats.usersWithPhone')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {t('stats.usersWithoutPhone', { count: users.length - users.filter(u => u.phone).length })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <MessageCircle size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {templates.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('stats.templatesAvailable')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title={t('cards.tips')}>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>{t('tips.tip1')}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>{t('tips.tip2')}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>{t('tips.tip3')}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>{t('tips.tip4')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Histórico */}
      {showHistory && (
        <Card title={t('cards.history')} icon="heroicons-outline:clock">
          {loadingHistory ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin text-primary-500" size={32} />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('history.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(msg.status)}`}>
                          {getStatusText(msg.status)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(msg.sentAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap line-clamp-2 mb-2">
                        {msg.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>
                          👥 {t('history.recipients', { count: msg.recipients?.length || 0 })}
                        </span>
                        <span>
                          ✅ {t('history.sent', { count: msg.successCount })}
                        </span>
                        {msg.failureCount > 0 && (
                          <span className="text-red-600">
                            ❌ {t('history.failed', { count: msg.failureCount })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginação */}
              {historyTotal > 10 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    text={t('buttons.previous')}
                    className="btn-outline-secondary"
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                  />
                  <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('history.pagination', { current: historyPage, total: Math.ceil(historyTotal / 10) })}
                  </span>
                  <Button
                    text={t('buttons.next')}
                    className="btn-outline-secondary"
                    onClick={() => setHistoryPage(p => p + 1)}
                    disabled={historyPage >= Math.ceil(historyTotal / 10)}
                  />
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default WhatsAppMessagingPage;

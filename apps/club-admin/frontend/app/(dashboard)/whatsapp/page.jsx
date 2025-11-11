"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Icon } from "@iconify/react";
import { useAlertContext } from '@/contexts/AlertContext';
import { clubAdminApi } from '@/services/api';

const WhatsAppMessagingPage = () => {
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
      const response = await clubAdminApi.get('/users');
      if (response.data) {
        const usersList = response.data.users || [];
        const sortedUsers = usersList.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'pt-BR')
        );
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showError('Erro ao carregar usuários');
    }
  };

  const handleSelectAll = () => {
    const allUserIds = users
      .filter(user => user.phone)
      .map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  const handleDeselectAll = () => {
    setSelectedUsers([]);
  };

  const normalizePhoneDisplay = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await clubAdminApi.get('/whatsapp/templates');
      if (response.data) {
        setTemplates(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setTemplates([
        { id: 'welcome', name: 'Boas-vindas', message: 'Olá! Bem-vindo ao nosso clube!' },
        { id: 'reminder', name: 'Lembrete', message: 'Lembrete importante sobre sua conta.' },
        { id: 'announcement', name: 'Comunicado', message: 'Temos uma novidade para você!' }
      ]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await clubAdminApi.get(`/whatsapp/history?page=${historyPage}&limit=10`);
      if (response.data) {
        setHistory(response.data.messages || []);
        setHistoryTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMessage(template.message);
    } else {
      setSelectedTemplate('');
      setMessage('');
    }
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0) {
      showError('Selecione pelo menos um destinatário');
      return;
    }

    if (!message.trim()) {
      showError('Digite uma mensagem');
      return;
    }

    setSending(true);
    try {
      const response = await clubAdminApi.post('/whatsapp/send', {
        recipientUserIds: selectedUsers,
        message: message.trim(),
        templateId: selectedTemplate || null
      });

      if (response.data.success) {
        const { successCount, failureCount } = response.data;
        if (failureCount === 0) {
          showSuccess(`Mensagem enviada para ${successCount} usuários!`);
        } else if (successCount === 0) {
          showError(`Falha ao enviar para ${failureCount} usuários`);
        } else {
          showSuccess(`Enviado para ${successCount} usuários (${failureCount} falhas)`);
        }

        setSelectedUsers([]);
        setMessage('');
        setSelectedTemplate('');

        if (showHistory) {
          fetchHistory();
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showError(error.response?.data?.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300';
      case 'failed': return 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300';
      case 'partial': return 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'failed': return 'Falhou';
      case 'partial': return 'Parcial';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">WhatsApp</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Envie mensagens em massa para seus membros
          </p>
        </div>
        <Button
          text={showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
          icon="heroicons:clock"
          className={showHistory ? "btn-secondary" : "btn-outline-secondary"}
          onClick={() => setShowHistory(!showHistory)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Envio de Mensagem */}
        <div className="lg:col-span-2">
          <Card title="Enviar Mensagem" subtitle="Configure e envie mensagens via WhatsApp">
            <div className="p-6 space-y-6">
              {/* Destinatários */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Destinatários
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                      type="button"
                    >
                      Selecionar Todos
                    </button>
                    <span className="text-slate-400">|</span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-slate-500 hover:text-slate-600 font-medium"
                      type="button"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <select
                  multiple
                  value={selectedUsers}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedUsers(selected);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32"
                >
                  {users.map(user => (
                    <option
                      key={user.id}
                      value={user.id}
                      disabled={!user.phone}
                      className={!user.phone ? 'text-slate-400' : ''}
                    >
                      {user.firstName} {user.lastName}
                      {user.phone ? ` (${normalizePhoneDisplay(user.phone)})` : ' (Sem telefone)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </p>
              </div>

              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Templates (Opcional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedTemplate === template.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon icon="heroicons:document-text" className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600 dark:text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {template.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={10}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {message.length} caracteres
                </p>
              </div>

              {/* Botão Enviar */}
              <div className="flex justify-end">
                <Button
                  text={sending ? 'Enviando...' : 'Enviar Mensagem'}
                  icon={sending ? "heroicons:arrow-path" : "heroicons:paper-airplane"}
                  className="btn-primary"
                  onClick={handleSendMessage}
                  disabled={sending || selectedUsers.length === 0 || !message.trim()}
                  isLoading={sending}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Informações */}
        <div className="space-y-6">
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Icon icon="heroicons:users" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => u.phone).length}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Usuários com telefone
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {users.length - users.filter(u => u.phone).length} sem telefone
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success-100 dark:bg-success-900/20">
                  <Icon icon="heroicons:chat-bubble-left-right" className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {templates.length}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Templates disponíveis
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Dicas">
            <div className="p-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>Mensagens são enviadas individualmente para cada destinatário</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>Use templates para economizar tempo</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>Verifique se os usuários têm telefone cadastrado</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-500">•</span>
                <p>Teste primeiro com poucos usuários</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Histórico */}
      {showHistory && (
        <Card title="Histórico de Mensagens" subtitle="Últimas mensagens enviadas">
          <div className="p-6">
            {loadingHistory ? (
              <div className="flex justify-center items-center py-12">
                <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="heroicons:chat-bubble-left-right" className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Nenhuma mensagem enviada ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(msg.status)}`}>
                            {getStatusText(msg.status)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(msg.sentAt).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap line-clamp-2 mb-2">
                          {msg.message}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                          <span>👥 {msg.recipients?.length || 0} destinatários</span>
                          <span>✅ {msg.successCount} enviados</span>
                          {msg.failureCount > 0 && (
                            <span className="text-red-600">❌ {msg.failureCount} falharam</span>
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
                      text="Anterior"
                      className="btn-outline-secondary"
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                    />
                    <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                      Página {historyPage} de {Math.ceil(historyTotal / 10)}
                    </span>
                    <Button
                      text="Próxima"
                      className="btn-outline-secondary"
                      onClick={() => setHistoryPage(p => p + 1)}
                      disabled={historyPage >= Math.ceil(historyTotal / 10)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppMessagingPage;

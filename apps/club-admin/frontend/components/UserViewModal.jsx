import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { userService } from '@/services/api';
import { useAlertContext } from '@/contexts/AlertContext';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  Building,
  FileCheck,
  Bell,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';

const UserViewModal = ({ isOpen, onClose, userId }) => {
  const { showError } = useAlertContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando usuário com ID:', userId);
      
      const response = await userService.getUserById(userId);
      console.log('📊 Resposta da API:', response);
      
      // Tentar ambos os formatos de resposta
      let userData = null;
      
      if (response && response.success && response.data) {
        // A API retorna { success: true, data: { user: { id, name, ... } } }
        userData = response.data.user || response.data;
        console.log('📋 Formato 1 - userData extraído:', userData);
      } else if (response && response.id) {
        userData = response;
        console.log('📋 Formato 2 - userData extraído:', userData);
      }
      
      console.log('🔍 userData final:', userData);
      console.log('🔍 userData tem ID?', userData?.id);
      
      if (userData && userData.id) {
        console.log('✅ Dados do usuário carregados:', userData);
        setUser(userData);
      } else {
        console.error('❌ Dados inválidos - response:', response);
        console.error('❌ Dados inválidos - userData:', userData);
        showError('Erro ao carregar dados do usuário');
        onClose();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      showError('Erro ao carregar dados do usuário');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-red-500";
      case "APP_ADMIN": return "bg-orange-500";
      case "ADMIN": return "bg-blue-500";
      case "USER": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "APP_ADMIN": return "Admin da Empresa";
      case "ADMIN": return "Administrador";
      case "USER": return "Usuário";
      default: return role || "Usuário";
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge label="Aprovado" className="bg-green-500 text-white" />;
      case 'pending':
        return <Badge label="Pendente" className="bg-yellow-500 text-white" />;
      case 'rejected':
        return <Badge label="Rejeitado" className="bg-red-500 text-white" />;
      default:
        return <Badge label="Não enviado" className="bg-gray-500 text-white" />;
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'documents', label: 'Documentos', icon: FileCheck },
    { id: 'activity', label: 'Atividade', icon: Activity }
  ];

  const getUserRole = () => {
    if (user?.userCompanies && user.userCompanies.length > 0) {
      return user.userCompanies[0].role;
    }
    return 'USER';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando dados...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">Nenhum usuário selecionado</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Header do usuário */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {user.name || 'Nome não informado'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user.email || 'Email não informado'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              label={getRoleLabel(getUserRole())}
              className={`${getRoleBadgeColor(getUserRole())} text-white`}
            />
            <Badge
              label={user.isActive ? "Ativo" : "Inativo"}
              className={`${user.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo das tabs */}
        <div className="pt-4">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Nome Completo
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {user.name || 'Não informado'}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {user.email || 'Não informado'}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Telefone
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {user.phone || 'Não informado'}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  CPF
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {user.cpf || 'Não informado'}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Data de Cadastro
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Não informado'}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Último Acesso
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleDateString('pt-BR') : 'Nunca'}
                </p>
              </div>

              {user.publicKey && (
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Dados Blockchain
                    </label>
                    <button
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {showSensitiveData ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {showSensitiveData && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                        {user.publicKey}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center space-x-2">
                  <FileCheck size={16} className="text-gray-500" />
                  <span className="text-sm font-medium">Documento Frente</span>
                </div>
                {getDocumentStatusBadge(user.frontDocument)}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center space-x-2">
                  <FileCheck size={16} className="text-gray-500" />
                  <span className="text-sm font-medium">Documento Verso</span>
                </div>
                {getDocumentStatusBadge(user.backDocument)}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center space-x-2">
                  <FileCheck size={16} className="text-gray-500" />
                  <span className="text-sm font-medium">Selfie</span>
                </div>
                {getDocumentStatusBadge(user.selfieDocument)}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Histórico de atividades será implementado em breve
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  console.log('🎭 UserViewModal render - isOpen:', isOpen, 'userId:', userId, 'user:', user);
  
  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title="Detalhes do Usuário"
      className="max-w-3xl"
    >
      {renderContent()}
    </Modal>
  );
};

export default UserViewModal;
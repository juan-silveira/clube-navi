"use client";

import { useState, useEffect, useCallback } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "react-select";
import Tooltip from "@/components/ui/Tooltip";
import Dropdown from "@/components/ui/Dropdown";
import NotificationSender from '@/components/NotificationSender';
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from '@/contexts/AlertContext';
import { userService } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Eye,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Building,
  Globe,
  FileCheck,
  FileX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  MessageSquare,
  Users
} from 'lucide-react';

const SystemUsersPage = () => {
  const { t } = useTranslation('systemUsers');
  const { showSuccess, showError, showInfo, showWarning } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Notificações
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedUsersForNotification, setSelectedUsersForNotification] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    role: '',
    status: '',
    lastLoginDays: '',
    country: ''
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    superAdmins: 0,
    companies: 0
  });

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }
    
    // Só carrega uma vez na montagem inicial
    if (!initialLoadDone) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.canViewSystemSettings, router, initialLoadDone]);

  // Aplicar filtros quando filters mudarem
  useEffect(() => {
    if (initialLoadDone) {
      applyFilters();
    }
  }, [users, filters, initialLoadDone]);


  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page: 1,
        limit: 100, // Reduzir limit para evitar sobrecarga
      };

      try {
        const response = await userService.getUsers(params);
        
        if (response.success && response.data) {
          const usersData = response.data.users || [];
          
          // Transformar dados da API para o formato esperado
          const transformedUsers = usersData.map(user => {
            // Obter todas as empresas do usuário
            const userCompanies = user.userCompanies || [];
            
            // Empresa principal (primeira ativa ou primeira da lista)
            const primaryCompany = userCompanies.find(uc => uc.status === 'active') || userCompanies[0] || null;
            
            // Extrair o maior role entre todas as empresas
            const roles = userCompanies.map(uc => uc.role).filter(Boolean);
            const roleHierarchy = { 'SUPER_ADMIN': 4, 'APP_ADMIN': 3, 'ADMIN': 2, 'USER': 1 };
            const highestRole = roles.reduce((highest, role) => {
              return (roleHierarchy[role] || 0) > (roleHierarchy[highest] || 0) ? role : highest;
            }, user.role || 'USER');
            
            // Calcular totais de atividade de todas as empresas
            const totalAccessCount = userCompanies.reduce((total, uc) => total + (uc.accessCount || 0), 0);
            
            // Último acesso mais recente entre todas as empresas
            const lastAccessDates = userCompanies
              .map(uc => uc.lastAccessAt)
              .filter(Boolean)
              .map(date => new Date(date));
            const mostRecentAccess = lastAccessDates.length > 0 
              ? new Date(Math.max(...lastAccessDates))
              : (user.lastActivityAt ? new Date(user.lastActivityAt) : null);
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              cpf: user.cpf,
              phone: user.phone,
              role: highestRole,
              status: user.isActive ? 'active' : 'inactive',
              // Para exibição na tabela - empresa principal
              company: {
                id: primaryCompany?.company?.id || 'sem-empresa',
                name: primaryCompany?.company?.name || 'Sem Empresa',
                alias: primaryCompany?.company?.alias || 'sem-empresa'
              },
              // Todas as empresas para uso no modal e outras funções
              allCompanies: userCompanies.map(uc => ({
                id: uc.company.id,
                name: uc.company.name,
                alias: uc.company.alias,
                role: uc.role,
                status: uc.status,
                accessCount: uc.accessCount,
                lastAccessAt: uc.lastAccessAt,
                linkedAt: uc.linkedAt
              })),
              // Status de documentos reais da base de dados
              documentsStatus: {
                front: user.frontDocument || 'not_sent',
                back: user.backDocument || 'not_sent', 
                selfie: user.selfieDocument || 'not_sent'
              },
              createdAt: user.createdAt,
              lastLogin: mostRecentAccess?.toISOString() || user.lastActivityAt,
              loginCount: totalAccessCount,
              transactions: 0,
              balance: 0,
              publicKey: user.publicKey,
              privateKey: permissions.canViewSensitiveData ? user.privateKey : "***REDACTED***",
              avatar: user.avatar || null
            };
          });
          
          setUsers(transformedUsers);
          
          // Calcular estatísticas
          const companies = [...new Set(transformedUsers.map(u => u.company.name))];
          const newStats = {
            total: transformedUsers.length,
            active: transformedUsers.filter(u => u.status === 'active').length,
            inactive: transformedUsers.filter(u => u.status === 'inactive' || u.status === 'blocked').length,
            superAdmins: transformedUsers.filter(u => u.role === 'SUPER_ADMIN').length,
            companies: companies.length
          };
          
          setStats(newStats);
          
          // Aplicar filtros iniciais
          if (!initialLoadDone) {
            setInitialLoadDone(true);
          }
        } else {
          // Se não conseguir carregar dados reais, mostrar estado vazio
          console.warn('Nenhum usuário encontrado ou resposta inválida:', response);
          setUsers([]);
          setStats({ total: 0, active: 0, inactive: 0, superAdmins: 0, companies: 0 });
          setInitialLoadDone(true);
        }
      } catch (apiError) {
        console.error('Erro na API de usuários:', apiError);
        
        // Se falhar na API, mostrar estado vazio em vez de erro
        setUsers([]);
        setStats({ total: 0, active: 0, inactive: 0, superAdmins: 0, companies: 0 });
        setInitialLoadDone(true);
        
        // Mostrar toast apenas se for erro de autenticação ou rate limiting
        if (apiError.response?.status === 401) {
          showError(t('messages.authError'));
        } else if (apiError.response?.status === 429) {
          showError(t('messages.rateLimitError'));
        } else {
          showError(t('messages.genericLoadError'));
        }
      }
      
    } catch (error) {
      console.error('Erro geral ao carregar usuários:', error);
      showError(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [initialLoadDone]);

  const applyFilters = () => {
    let filtered = [...users];

    // Filtro de busca
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user => {
        // Verificar se user existe
        if (!user) return false;
        
        // Verificar cada campo com segurança
        const nameMatch = user.name?.toLowerCase().includes(search) || false;
        const emailMatch = user.email?.toLowerCase().includes(search) || false;
        const cpfMatch = user.cpf?.includes(search) || false;
        const phoneMatch = user.phone?.includes(search) || false;
        const companyMatch = user.company?.name?.toLowerCase().includes(search) || false;
        const allCompaniesMatch = user.allCompanies?.some(company => 
          company?.name?.toLowerCase().includes(search)
        ) || false;
        
        return nameMatch || emailMatch || cpfMatch || phoneMatch || companyMatch || allCompaniesMatch;
      });
    }

    // Filtro de empresa - considerar todas as empresas do usuário
    if (filters.company) {
      filtered = filtered.filter(user => 
        user.allCompanies.some(company => company.name === filters.company)
      );
    }

    // Filtro de role
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Filtro de último login
    if (filters.lastLoginDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filters.lastLoginDays));
      filtered = filtered.filter(user => 
        new Date(user.lastLogin) >= daysAgo
      );
    }

    // Filtro de país
    if (filters.country) {
      filtered = filtered.filter(user => user.country === filters.country);
    }

    setFilteredUsers(filtered);
  };

  // Debounced filter change to prevent excessive API calls
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearFilters = () => {
    setFilters({
      search: '',
      company: '',
      role: '',
      status: '',
      lastLoginDays: '',
      country: ''
    });
  };

  const exportUsers = () => {
    const csvData = filteredUsers.map(user => ({
      Nome: user.name,
      Email: user.email,
      CPF: user.cpf,
      Telefone: user.phone,
      Role: user.role,
      Status: user.status,
      Empresa: user.company.name,
      País: user.country,
      Cidade: user.city,
      'Data Criação': new Date(user.createdAt).toLocaleDateString('pt-BR'),
      'Último Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca',
      'Login Count': user.loginCount,
      'Transações': user.transactions,
      'Saldo (BRL)': `R$ ${user.balance.toFixed(2)}`
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-sistema-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para gerenciar seleção de usuários
  const handleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const selectAllUsers = () => {
    const currentPageUserIds = currentUsers.map(user => user.id);
    setSelectedUserIds(currentPageUserIds);
  };

  const deselectAllUsers = () => {
    setSelectedUserIds([]);
  };

  const sendBulkNotification = () => {
    if (selectedUserIds.length === 0) {
      showWarning(t('messages.selectUserWarning'));
      return;
    }

    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    setSelectedUsersForNotification(selectedUsers);
    setNotificationModalOpen(true);
  };

  const handleUserAction = async (action, user) => {
    if (!permissions.canManageRoles && ['block', 'unblock', 'changeRole'].includes(action)) {
      showError(t('messages.noPermission'));
      return;
    }

    try {
      switch (action) {
        case 'viewProfile':
          console.log('🔍 Navegando para página do usuário:', user.id, user.name);
          router.push(`/system/users/${user.id}`);
          break;

        case 'sendNotification':
          setSelectedUsersForNotification([user]);
          setNotificationModalOpen(true);
          break;

        case 'block':
          await userService.blockUser(user.id);
          setUsers(users.map(u =>
            u.id === user.id ? { ...u, status: 'blocked' } : u
          ));
          showSuccess(t('messages.blockSuccess', { name: user.name }));
          break;

        case 'unblock':
          await userService.unblockUser(user.id);
          setUsers(users.map(u =>
            u.id === user.id ? { ...u, status: 'active' } : u
          ));
          showSuccess(t('messages.unblockSuccess', { name: user.name }));
          break;

        case 'activate':
          await userService.activateUser(user.id);
          setUsers(users.map(u =>
            u.id === user.id ? { ...u, status: 'active' } : u
          ));
          showSuccess(t('messages.activateSuccess', { name: user.name }));
          break;

        case 'deactivate':
          await userService.deactivateUser(user.id);
          setUsers(users.map(u =>
            u.id === user.id ? { ...u, status: 'inactive' } : u
          ));
          showSuccess(t('messages.deactivateSuccess', { name: user.name }));
          break;

        default:
          console.log('Action:', action, 'User:', user.name);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      showError(t('messages.actionError'));
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-500";
      case "blocked": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <UserCheck size={16} />;
      case "inactive": return <UserX size={16} />;
      case "blocked": return <ShieldX size={16} />;
      default: return <User size={16} />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return <ShieldCheck className="text-red-600" size={16} />;
      case "APP_ADMIN": return <Shield className="text-orange-600" size={16} />;
      case "ADMIN": return <Shield className="text-blue-600" size={16} />;
      case "USER": return <User className="text-gray-600" size={16} />;
      default: return <User className="text-gray-600" size={16} />;
    }
  };

  const getRoleLabel = (role) => {
    return t(`roles.${role}`, { defaultValue: role });
  };

  const getStatusLabel = (status) => {
    return t(`status.${status}`, { defaultValue: status });
  };

  const getDaysSinceLastLogin = (lastLogin) => {
    if (!lastLogin) return null;
    const days = Math.floor((new Date() - new Date(lastLogin)) / (1000 * 60 * 60 * 24));
    return days;
  };

  const generateCompaniesTooltip = (allCompanies) => {
    if (!allCompanies || allCompanies.length <= 1) return null;
    
    return (
      <div className="space-y-2 p-2">
        <div className="font-semibold text-sm border-b border-gray-200 pb-1 mb-2">
          {t('table.companies.title', { count: allCompanies.length })}
        </div>
        {allCompanies.map((company, index) => (
          <div key={company.id} className="flex items-center justify-between space-x-3 text-xs">
            <div className="flex-1">
              <div className="font-medium text-white">{company.name}</div>
            </div>
            <div className="text-right">
              <div className="text-blue-200 font-medium">{company.role}</div>
              <div className="text-gray-300">
                {company.accessCount || 0} {t('table.companies.accesses')}
              </div>
            </div>
            {company.status === 'active' && (
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const generateDocumentsTooltip = (documentsStatus) => {
    const getStatusInfo = (status) => {
      switch (status) {
        case 'approved':
          return { isValid: true, color: 'text-green-400', icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, label: t('table.documents.approved') };
        case 'pending':
          return { isValid: false, color: 'text-yellow-400', icon: <AlertCircle className="w-4 h-4 text-yellow-400" />, label: t('table.documents.pending') };
        case 'rejected':
          return { isValid: false, color: 'text-red-400', icon: <XCircle className="w-4 h-4 text-red-400" />, label: t('table.documents.rejected') };
        case 'not_sent':
        default:
          return { isValid: false, color: 'text-gray-400', icon: <XCircle className="w-4 h-4 text-gray-400" />, label: t('table.documents.notSent') };
      }
    };

    const documents = [
      {
        key: 'front',
        name: t('table.documents.frontDocument'),
        description: t('table.documents.frontDocumentDesc'),
        status: documentsStatus.front,
        icon: '📄',
        ...getStatusInfo(documentsStatus.front)
      },
      {
        key: 'back',
        name: t('table.documents.backDocument'),
        description: t('table.documents.backDocumentDesc'),
        status: documentsStatus.back,
        icon: '📃',
        ...getStatusInfo(documentsStatus.back)
      },
      {
        key: 'selfie',
        name: t('table.documents.selfieDocument'),
        description: t('table.documents.selfieDocumentDesc'),
        status: documentsStatus.selfie,
        icon: '🤳',
        ...getStatusInfo(documentsStatus.selfie)
      }
    ];

    const approvedCount = documents.filter(doc => doc.status === 'approved').length;
    const totalCount = documents.length;
    const allApproved = approvedCount === totalCount;
    
    return (
      <div className="space-y-3 p-2 min-w-64">
        <div className="border-b border-gray-200 pb-2 mb-3">
          <div className="font-semibold text-sm text-white">
            {t('table.documents.statusTitle')}
          </div>
          <div className="text-xs text-gray-300">
            {t('table.documents.approvedCount', { approved: approvedCount, total: totalCount })}
          </div>
          <div className="flex items-center mt-2">
            <div className="flex-1 bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  allApproved ? 'bg-green-400' : approvedCount > 0 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${(approvedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className={`ml-2 text-xs font-medium ${
              allApproved ? 'text-green-400' : approvedCount > 0 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {allApproved ? t('table.documents.complete') : approvedCount > 0 ? t('table.documents.partial') : t('table.documents.pending')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.key} className="flex items-start space-x-3">
              <div className="text-lg">{doc.icon}</div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${doc.color}`}>
                  {doc.name}
                </div>
                <div className="text-xs text-gray-400">
                  {doc.description}
                </div>
                <div className={`text-xs ${doc.color} font-medium`}>
                  {doc.label}
                </div>
              </div>
              <div className="flex items-center">
                {doc.icon}
              </div>
            </div>
          ))}
        </div>

        {!allApproved && (
          <div className="pt-2 border-t border-gray-600">
            <div className="text-xs text-yellow-400 font-medium">
              {t('table.documents.incompleteWarning')}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {approvedCount === 0 ? t('table.documents.noneSubmitted') : t('table.documents.pendingSubmission')}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Opções para filtros - incluir todas as empresas de todos os usuários
  const allCompanyNames = users.flatMap(u => u.allCompanies.map(c => c.name));
  const companyOptions = [
    { value: '', label: t('filters.company.all') },
    ...Array.from(new Set(allCompanyNames)).map(company => ({
      value: company,
      label: company
    }))
  ];

  const roleOptions = [
    { value: '', label: t('filters.role.all') },
    { value: 'SUPER_ADMIN', label: t('roles.SUPER_ADMIN') },
    { value: 'APP_ADMIN', label: t('roles.APP_ADMIN') },
    { value: 'ADMIN', label: t('roles.ADMIN') },
    { value: 'USER', label: t('roles.USER') }
  ];

  const statusOptions = [
    { value: '', label: t('filters.status.all') },
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
    { value: 'blocked', label: t('status.blocked') }
  ];

  const lastLoginOptions = [
    { value: '', label: t('filters.lastLogin.anyPeriod') },
    { value: '1', label: t('filters.lastLogin.lastDay') },
    { value: '7', label: t('filters.lastLogin.last7Days') },
    { value: '30', label: t('filters.lastLogin.last30Days') },
    { value: '90', label: t('filters.lastLogin.last90Days') }
  ];

  const countryOptions = [
    { value: '', label: t('filters.country.all') },
    { value: 'Brasil', label: 'Brasil' },
    { value: 'Estados Unidos', label: 'Estados Unidos' },
    { value: 'Argentina', label: 'Argentina' }
  ];

  const itemsPerPageOptions = [
    { value: 10, label: t('table.pagination.perPage10') },
    { value: 20, label: t('table.pagination.perPage20') },
    { value: 50, label: t('table.pagination.perPage50') },
    { value: 100, label: t('table.pagination.perPage100') }
  ];

  // Estilos para react-select
  const selectStyles = {
    option: (provided, state) => ({
      ...provided,
      fontSize: "14px",
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      fontSize: "14px",
    }),
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const goToPage = (page) => setCurrentPage(page);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const handleItemsPerPageChange = (option) => {
    setItemsPerPage(option.value);
    setCurrentPage(1);
  };


  if (!permissions.canViewSystemSettings) {
    return null;
  }

  return (
    <>
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedUserIds.length > 0 && (
            <>
              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                <Users size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedUserIds.length > 1 ? t('selection.selectedPlural', { count: selectedUserIds.length }) : t('selection.selected', { count: selectedUserIds.length })}
                </span>
              </div>
              <Button
                onClick={sendBulkNotification}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Bell size={16} className="mr-2" />
                {t('buttons.notifySelected')}
              </Button>
              <Button
                onClick={deselectAllUsers}
                variant="outline"
              >
                {t('buttons.deselectAll')}
              </Button>
            </>
          )}
          <Button
            onClick={exportUsers}
            className="btn-outline-primary"
            text={t('buttons.exportCSV')}
            icon="heroicons:arrow-down-tray"
          />
          <Button
            onClick={loadUsers}
            icon="heroicons:arrow-path-solid"
            isLoading={loading}
            text={t('buttons.refresh')}
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.total')}</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.active')}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <UserX className="text-gray-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.inactive')}</p>
                <p className="text-xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ShieldCheck className="text-red-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.superAdmins')}</p>
                <p className="text-xl font-bold">{stats.superAdmins}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="text-purple-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.companies')}</p>
                <p className="text-xl font-bold">{stats.companies}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.search.label')}
            </label>
            <div className="relative">
              <Textinput
                placeholder={t('filters.search.placeholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.company.label')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={companyOptions}
              value={companyOptions.find(option => option.value === filters.company)}
              onChange={(option) => handleFilterChange('company', option?.value || '')}
              placeholder={t('filters.company.placeholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.role.label')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={roleOptions}
              value={roleOptions.find(option => option.value === filters.role)}
              onChange={(option) => handleFilterChange('role', option?.value || '')}
              placeholder={t('filters.role.placeholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.status.label')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={statusOptions}
              value={statusOptions.find(option => option.value === filters.status)}
              onChange={(option) => handleFilterChange('status', option?.value || '')}
              placeholder={t('filters.status.placeholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.lastLogin.label')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={lastLoginOptions}
              value={lastLoginOptions.find(option => option.value === filters.lastLoginDays)}
              onChange={(option) => handleFilterChange('lastLoginDays', option?.value || '')}
              placeholder={t('filters.lastLogin.placeholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="btn-outline-secondary flex-1"
            >
              {t('filters.clear')}
            </Button>
          </div>
        </div>

        {/* Resumo dos filtros */}
        {(filters.search || filters.company || filters.role || filters.status || filters.lastLoginDays) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('filters.activeFilters')}:</span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.search')}: {filters.search}
                </span>
              )}
              {filters.company && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.company')}: {filters.company}
                </span>
              )}
              {filters.role && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.role')}: {roleOptions.find(o => o.value === filters.role)?.label}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.status')}: {statusOptions.find(o => o.value === filters.status)?.label}
                </span>
              )}
              {filters.lastLoginDays && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.login')}: {lastLoginOptions.find(o => o.value === filters.lastLoginDays)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Lista de Usuários */}
      <Card className="flex-1 flex flex-col min-h-0" style={{ overflow: 'visible' }}>
        <div className="flex flex-col h-full">
          {/* Cabeçalho da tabela com contador */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('table.title')} ({loading ? '...' : filteredUsers.length})
            </h3>
            <div className="flex items-center space-x-2">
              <Select
                className="react-select"
                classNamePrefix="select"
                options={itemsPerPageOptions}
                value={itemsPerPageOptions.find(option => option.value === itemsPerPage)}
                onChange={handleItemsPerPageChange}
                styles={selectStyles}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-slate-600 dark:text-slate-400">{t('table.loading')}</span>
            </div>
          )}

          {/* Tabela responsiva com altura fixa */}
          {!loading && (
            <div className="flex-1 overflow-auto relative" style={{ minHeight: currentUsers.length < 3 ? '400px' : 'auto' }}>
              <table className="min-w-full relative">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length > 0 && selectedUserIds.length === currentUsers.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectAllUsers();
                          } else {
                            deselectAllUsers();
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.user')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.company')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.role')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.activity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.documents')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => {
                      const daysSinceLogin = getDaysSinceLastLogin(user.lastLogin);
                      
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => handleUserSelection(user.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          </td>
                          
                          {/* Usuário */}
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex-none">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="w-full h-full object-cover absolute inset-0"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        // Mostrar inicial se a imagem falhar
                                        const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <span className={`avatar-fallback text-white font-bold text-sm ${user.avatar ? 'hidden' : 'flex'} items-center justify-center`}>
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {user.email}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {user.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Empresa */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.allCompanies.length > 1 ? (
                              <Tooltip
                                content={generateCompaniesTooltip(user.allCompanies)}
                                placement="top"
                                theme="dark"
                                allowHTML={true}
                                interactive={true}
                                maxWidth={320}
                                animation="shift-away"
                              >
                                <div className="flex items-center space-x-2 cursor-help">
                                  <Building className="w-4 h-4 text-slate-500" />
                                  <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                      {user.company.name}
                                      <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">
                                        +{user.allCompanies.length - 1}
                                      </span>
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                      {user.allCompanies.length} {t('table.companies.label')}
                                    </div>
                                  </div>
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-slate-500" />
                                <div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user.company.name}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          
                          {/* Role */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(user.role)}
                              <Badge
                                label={getRoleLabel(user.role)}
                                className={`${getRoleBadgeColor(user.role)} text-white`}
                              />
                            </div>
                          </td>
                          
                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(user.status)}
                              <Badge
                                label={getStatusLabel(user.status)}
                                className={`${getStatusBadgeColor(user.status)} text-white`}
                              />
                            </div>
                          </td>
                          
                          {/* Atividade */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              <div className="text-slate-900 dark:text-white">
                                {user.loginCount.toLocaleString()} {t('table.activity.logins')}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">
                                {user.transactions.toLocaleString()} {t('table.activity.transactions')}
                              </div>
                              {daysSinceLogin !== null && (
                                <div className={`text-xs ${
                                  daysSinceLogin <= 1 ? 'text-green-600' :
                                  daysSinceLogin <= 7 ? 'text-yellow-600' :
                                  daysSinceLogin <= 30 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  {daysSinceLogin === 0 ? t('table.activity.today') : t('table.activity.daysAgo', { days: daysSinceLogin })}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Documentos */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Tooltip
                              content={generateDocumentsTooltip(user.documentsStatus)}
                              placement="auto"
                              theme="dark"
                              allowHTML={true}
                              interactive={true}
                              maxWidth={280}
                              animation="shift-away"
                              appendTo={() => document.body}
                              popperOptions={{
                                strategy: 'fixed',
                                modifiers: [
                                  {
                                    name: 'preventOverflow',
                                    options: {
                                      altAxis: true,
                                      boundary: 'clippingParents',
                                      padding: 8
                                    }
                                  },
                                  {
                                    name: 'flip',
                                    options: {
                                      fallbackPlacements: ['top', 'bottom', 'left', 'right'],
                                      boundary: 'viewport'
                                    }
                                  }
                                ]
                              }}
                              zIndex={9999}
                            >
                              <div className="space-y-1 cursor-help">
                                {(() => {
                                  const approvedCount = Object.values(user.documentsStatus).filter(status => status === 'approved').length;
                                  const totalCount = Object.keys(user.documentsStatus).length;
                                  const allApproved = approvedCount === totalCount;
                                  const hasRejected = Object.values(user.documentsStatus).some(status => status === 'rejected');
                                  const hasPending = Object.values(user.documentsStatus).some(status => status === 'pending');
                                  
                                  if (allApproved) {
                                    return (
                                      <div className="flex items-center space-x-1 text-green-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-medium">{t('table.documents.statusComplete')}</span>
                                      </div>
                                    );
                                  } else if (hasRejected) {
                                    return (
                                      <div className="flex items-center space-x-1 text-red-600">
                                        <XCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">{t('table.documents.statusRejected')}</span>
                                      </div>
                                    );
                                  } else if (hasPending) {
                                    return (
                                      <div className="flex items-center space-x-1 text-yellow-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">{t('table.documents.statusPending')}</span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="flex items-center space-x-1 text-gray-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">{t('table.documents.statusNotSent')}</span>
                                      </div>
                                    );
                                  }
                                })()}
                                <div className="flex space-x-1">
                                  {(() => {
                                    const getDocumentIcon = (status) => {
                                      switch (status) {
                                        case 'approved':
                                          return <FileCheck className="w-3 h-3 text-green-600" />;
                                        case 'pending':
                                          return <AlertCircle className="w-3 h-3 text-yellow-600" />;
                                        case 'rejected':
                                          return <FileX className="w-3 h-3 text-red-600" />;
                                        case 'not_sent':
                                        default:
                                          return <FileX className="w-3 h-3 text-gray-400" />;
                                      }
                                    };
                                    
                                    return (
                                      <>
                                        <div title={t('table.documents.frontDocument')}>
                                          {getDocumentIcon(user.documentsStatus.front)}
                                        </div>
                                        <div title={t('table.documents.backDocument')}>
                                          {getDocumentIcon(user.documentsStatus.back)}
                                        </div>
                                        <div title={t('table.documents.selfieDocument')}>
                                          {getDocumentIcon(user.documentsStatus.selfie)}
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </Tooltip>
                          </td>
                          
                          {/* Ações */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Dropdown
                              label={<MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />}
                              labelClass="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              classMenuItems="mt-2 w-[180px]"
                            >
                              <button
                                onClick={() => handleUserAction('viewProfile', user)}
                                className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                                  isDark
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <Eye size={14} className="mr-2" />
                                {t('buttons.viewProfile')}
                              </button>
                              
                              {permissions.canManageRoles && (
                                <>
                                  <div className="border-t border-gray-100 dark:border-gray-600"></div>
                                  
                                  {user.status === 'blocked' ? (
                                    <button
                                      onClick={() => handleUserAction('unblock', user)}
                                      className="flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                      <Unlock size={14} className="mr-2" />
                                      {t('buttons.unblock')}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserAction('block', user)}
                                      className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                      <Lock size={14} className="mr-2" />
                                      {t('buttons.block')}
                                    </button>
                                  )}
                                  
                                  {user.status !== 'blocked' && (
                                    <>
                                      {user.status === 'active' ? (
                                        <button
                                          onClick={() => handleUserAction('deactivate', user)}
                                          className="flex items-center px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                          <UserX size={14} className="mr-2" />
                                          {t('buttons.deactivate')}
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleUserAction('activate', user)}
                                          className="flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                          <UserCheck size={14} className="mr-2" />
                                          {t('buttons.activate')}
                                        </button>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center">
                          <User className="w-12 h-12 mb-2 opacity-50" />
                          <span className="font-medium">{t('table.empty.title')}</span>
                          <span className="text-sm">{t('table.empty.description')}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredUsers.length > itemsPerPage && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                    {t('table.pagination.showing', { from: ((currentPage - 1) * itemsPerPage) + 1, to: Math.min(currentPage * itemsPerPage, filteredUsers.length), total: filteredUsers.length })}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      «
                    </button>
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ‹
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          currentPage === page
                            ? "bg-primary-500 text-white"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ›
                    </button>
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </Card>

    </div>

    {/* Modal de Notificação */}
    <NotificationSender
      isOpen={notificationModalOpen}
      onClose={() => {
        setNotificationModalOpen(false);
        setSelectedUsersForNotification([]);
      }}
      selectedUsers={selectedUsersForNotification}
      isBulk={selectedUsersForNotification.length > 1}
    />

    </>
  );
};

export default SystemUsersPage;
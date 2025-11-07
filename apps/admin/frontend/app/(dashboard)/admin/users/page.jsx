"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "react-select";
import Modal from "@/components/ui/Modal";
import useDarkMode from "@/hooks/useDarkMode";
import Dropdown from "@/components/ui/Dropdown";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from '@/contexts/AlertContext';
import api, { userService } from '@/services/api';
import useCurrentCompany from '@/hooks/useCurrentCompany';
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
  UserPlus,
  Lock,
  Unlock,
  Building,
  Globe,
  Clock
} from 'lucide-react';

const CompanyUsersPage = () => {
  const { t } = useTranslation('admin');
  const { showSuccess, showError, showInfo, showWarning } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();

  // Função para formatar telefone
  const formatPhone = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    if (phoneNumber.length <= 2) return `(${phoneNumber}`;
    if (phoneNumber.length <= 6)
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    if (phoneNumber.length <= 10)
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
        2,
        6
      )}-${phoneNumber.slice(6)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
      2,
      7
    )}-${phoneNumber.slice(7, 11)}`;
  };
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isDark] = useDarkMode();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Seleção múltipla
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Modal de Roles
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Filtros (sem empresa pois é apenas da empresa do usuário)
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    lastLoginDays: '',
    createdFrom: '',
    createdTo: ''
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    pending: 0
  });

  // Dados da empresa atual
  const { currentCompany, loading: companyLoading } = useCurrentCompany();

  useEffect(() => {
    if (!permissions.canViewCompanySettings) {
      router.push("/dashboard");
      return;
    }
    
    // Só carrega quando a empresa estiver disponível e não tenha carregado ainda
    if (!initialLoadDone && currentCompany?.id && !companyLoading) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.canViewCompanySettings, router, initialLoadDone, currentCompany, companyLoading]);

  // Aplicar filtros quando filters mudarem
  useEffect(() => {
    if (initialLoadDone) {
      applyFilters();
    }
  }, [users, filters, initialLoadDone]);

  // Recalcular estatísticas quando usuários mudarem
  useEffect(() => {
    if (users.length > 0) {
      const newStats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        admins: users.filter(u => u.role === 'ADMIN' || u.role === 'APP_ADMIN' || u.role === 'SUPER_ADMIN').length,
        blocked: users.filter(u => u.status === 'blocked').length
      };
      setStats(newStats);
    }
  }, [users]);


  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      // const { user } = useAuthStore.getState(); // Removido - não utilizado
      
      // Garantir que temos o ID da empresa
      if (!currentCompany?.id) {
        console.warn('Empresa não disponível ainda');
        return;
      }
      
      // Filtrar usuários apenas da empresa atual
      const params = {
        page: 1,
        limit: 100, // Reduzir limit para evitar sobrecarga
        companyId: currentCompany.id // Filtrar pela empresa atual
      };
      
      // console.log('🔍 Buscando usuários da empresa:', currentCompany.name, 'ID:', currentCompany.id);

      const response = await userService.getUsers(params);
      
      if (response.success && response.data) {
        const usersData = response.data.users || [];


        // Transformar dados da API para o formato esperado
        const transformedUsers = usersData.map(user => {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            phone: user.phone,
            role: (() => {
              // Buscar o role na empresa atual
              if (user.userCompanies && user.userCompanies.length > 0) {
                const currentUserCompany = user.userCompanies.find(uc => uc.companyId === currentCompany.id);
                if (currentUserCompany) {
                  return currentUserCompany.role;
                }
              }
              // Fallback
              return user.role || 'USER';
            })(),
            status: user.isBlockedLoginAttempts ? 'blocked' : (user.isActive ? 'active' : 'inactive'),
            createdAt: user.createdAt,
            lastLogin: user.lastActivityAt,
            loginCount: user.loginCount || 0,
            transactions: user.transactionCount || 0,
            publicKey: user.publicKey,
            privateKey: permissions.canViewSensitiveData ? user.privateKey : "***REDACTED***",
            avatar: user.avatar || null
          };
        });
        
        setUsers(transformedUsers);
        
        // Calcular estatísticas
        const newStats = {
          total: transformedUsers.length,
          active: transformedUsers.filter(u => u.status === 'active').length,
          inactive: transformedUsers.filter(u => u.status === 'inactive' || u.status === 'blocked').length,
          admins: transformedUsers.filter(u => u.role === 'ADMIN' || u.role === 'APP_ADMIN' || u.role === 'SUPER_ADMIN').length,
          blocked: transformedUsers.filter(u => u.status === 'blocked').length
        };
        setStats(newStats);
        
        // Marcar carregamento inicial como concluído
        if (!initialLoadDone) {
          setInitialLoadDone(true);
        }
      } else {
        showError(t('users.messages.errorLoading'));
        setInitialLoadDone(true);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setInitialLoadDone(true);

      // Tratamento específico para rate limiting
      if (error.response?.status === 429) {
        showError(t('users.messages.tooManyRequests'));
      } else {
        showError(t('users.messages.errorLoading'));
      }
    } finally {
      setLoading(false);
    }
  }, [currentCompany, showError]);

  const applyFilters = () => {
    let filtered = [...users];

    // Filtro de busca
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        (user.name?.toLowerCase().includes(search) || false) ||
        (user.email?.toLowerCase().includes(search) || false) ||
        (user.cpf?.includes(search) || false) ||
        (user.phone?.includes(search) || false)
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
        user.lastLogin && new Date(user.lastLogin) >= daysAgo
      );
    }

    // Filtro de data de criação (from)
    if (filters.createdFrom) {
      const fromDate = new Date(filters.createdFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(user =>
        new Date(user.createdAt) >= fromDate
      );
    }

    // Filtro de data de criação (to)
    if (filters.createdTo) {
      const toDate = new Date(filters.createdTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(user =>
        new Date(user.createdAt) <= toDate
      );
    }

    setFilteredUsers(filtered);
    // Reset para primeira página quando aplicar filtros
    setCurrentPage(1);
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
      role: '',
      status: '',
      lastLoginDays: '',
      createdFrom: '',
      createdTo: ''
    });
  };

  // Funções de seleção múltipla
  const toggleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Ações em massa
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      showWarning(t('users.messages.selectUsers'));
      return;
    }

    if (!permissions.canViewCompanySettings) {
      showError(t('users.messages.noPermission'));
      return;
    }

    const selectedUsersList = users.filter(u => selectedUsers.includes(u.id));
    const count = selectedUsers.length;

    try {
      setLoading(true);

      switch (action) {
        case 'approve':
          await Promise.all(
            selectedUsersList.map(user =>
              userService.updateUser(user.id, { isActive: true, isBlockedLoginAttempts: false })
            )
          );
          setUsers(users.map(u => {
            if (selectedUsers.includes(u.id)) {
              const updated = { ...u, isActive: true, isBlockedLoginAttempts: false };
              updated.status = 'active';
              return updated;
            }
            return u;
          }));
          showSuccess(`${count} ${t('users.messages.usersApproved')}`);
          break;

        case 'activate':
          await Promise.all(
            selectedUsersList.map(user =>
              userService.updateUser(user.id, { isActive: true })
            )
          );
          setUsers(users.map(u => {
            if (selectedUsers.includes(u.id)) {
              const updated = { ...u, isActive: true };
              updated.status = updated.isBlockedLoginAttempts ? 'blocked' : 'active';
              return updated;
            }
            return u;
          }));
          showSuccess(`${count} ${t('users.messages.usersActivated')}`);
          break;

        case 'deactivate':
          await Promise.all(
            selectedUsersList.map(user =>
              userService.updateUser(user.id, { isActive: false })
            )
          );
          setUsers(users.map(u => {
            if (selectedUsers.includes(u.id)) {
              const updated = { ...u, isActive: false };
              updated.status = 'inactive';
              return updated;
            }
            return u;
          }));
          showSuccess(`${count} ${t('users.messages.usersDeactivated')}`);
          break;

        case 'block':
          await Promise.all(
            selectedUsersList.map(user =>
              userService.updateUser(user.id, { isBlockedLoginAttempts: true })
            )
          );
          setUsers(users.map(u => {
            if (selectedUsers.includes(u.id)) {
              const updated = { ...u, isBlockedLoginAttempts: true };
              updated.status = 'blocked';
              return updated;
            }
            return u;
          }));
          showSuccess(`${count} ${t('users.messages.usersBlocked')}`);
          break;

        case 'unblock':
          await Promise.all(
            selectedUsersList.map(user =>
              userService.updateUser(user.id, { isBlockedLoginAttempts: false })
            )
          );
          setUsers(users.map(u => {
            if (selectedUsers.includes(u.id)) {
              const updated = { ...u, isBlockedLoginAttempts: false };
              updated.status = updated.isActive ? 'active' : 'inactive';
              return updated;
            }
            return u;
          }));
          showSuccess(`${count} ${t('users.messages.usersUnblocked')}`);
          break;

        case 'exportSelected':
          const csvData = selectedUsersList.map(user => ({
            Nome: user.name,
            Email: user.email,
            CPF: user.cpf,
            Telefone: user.phone,
            Role: user.role,
            Status: user.status,
            'Data Criação': new Date(user.createdAt).toLocaleDateString('pt-BR'),
            'Último Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca',
            'Login Count': user.loginCount,
            'Transações': user.transactions
          }));

          const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `usuarios-selecionados-${currentCompany.alias}-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          showSuccess(`${count} ${t('users.messages.usersExported')}`);
          break;
      }

      clearSelection();
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error in bulk action:', error);
      showError(t('users.messages.errorBulkAction'));
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = () => {
    const csvData = filteredUsers.map(user => ({
      Nome: user.name,
      Email: user.email,
      CPF: user.cpf,
      Telefone: user.phone,
      Role: user.role,
      Status: user.status,
      'Data Criação': new Date(user.createdAt).toLocaleDateString('pt-BR'),
      'Último Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca',
      'Login Count': user.loginCount,
      'Transações': user.transactions
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-${currentCompany.alias}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUserAction = async (action, user) => {
    if (!permissions.canViewCompanySettings && ['block', 'unblock', 'activate', 'deactivate', 'approve'].includes(action)) {
      showError(t('users.messages.noPermission'));
      return;
    }

    try {
      switch (action) {
        case 'viewProfile':
          router.push(`/admin/users/${user.id}`);
          break;

        case 'block':
          try {
            // Fazer chamada à API para bloquear o usuário (apenas isBlockedLoginAttempts)
            await userService.updateUser(user.id, { isBlockedLoginAttempts: true });
            
            // Atualizar estado local após sucesso na API
            setUsers(users.map(u => {
              if (u.id === user.id) {
                const updatedUser = { ...u, isBlockedLoginAttempts: true };
                updatedUser.status = updatedUser.isBlockedLoginAttempts ? 'blocked' : (updatedUser.isActive ? 'active' : 'inactive');
                return updatedUser;
              }
              return u;
            }));
            showSuccess(`${user.name} ${t('users.messages.blocked')}`);
          } catch (error) {
            console.error('Erro ao bloquear usuário:', error);
            showError(t('users.messages.errorAction'));
          }
          break;

        case 'unblock':
          try {
            // Fazer chamada à API para desbloquear o usuário (apenas isBlockedLoginAttempts)
            await userService.updateUser(user.id, { isBlockedLoginAttempts: false });
            
            // Atualizar estado local após sucesso na API
            setUsers(users.map(u => {
              if (u.id === user.id) {
                const updatedUser = { ...u, isBlockedLoginAttempts: false };
                updatedUser.status = updatedUser.isBlockedLoginAttempts ? 'blocked' : (updatedUser.isActive ? 'active' : 'inactive');
                return updatedUser;
              }
              return u;
            }));
            showSuccess(`${user.name} ${t('users.messages.unblocked')}`);
          } catch (error) {
            console.error('Erro ao desbloquear usuário:', error);
            showError(t('users.messages.errorAction'));
          }
          break;

        case 'activate':
          try {
            // Fazer chamada à API para ativar o usuário (apenas isActive)
            await userService.updateUser(user.id, { isActive: true });
            
            // Atualizar estado local após sucesso na API
            setUsers(users.map(u => {
              if (u.id === user.id) {
                const updatedUser = { ...u, isActive: true };
                updatedUser.status = updatedUser.isBlockedLoginAttempts ? 'blocked' : (updatedUser.isActive ? 'active' : 'inactive');
                return updatedUser;
              }
              return u;
            }));
            showSuccess(`${user.name} ${t('users.messages.activated')}`);
          } catch (error) {
            console.error('Erro ao ativar usuário:', error);
            showError(t('users.messages.errorAction'));
          }
          break;

        case 'deactivate':
          try {
            // Fazer chamada à API para desativar o usuário (apenas isActive)
            await userService.updateUser(user.id, { isActive: false });
            
            // Atualizar estado local após sucesso na API
            setUsers(users.map(u => {
              if (u.id === user.id) {
                const updatedUser = { ...u, isActive: false };
                updatedUser.status = updatedUser.isBlockedLoginAttempts ? 'blocked' : (updatedUser.isActive ? 'active' : 'inactive');
                return updatedUser;
              }
              return u;
            }));
            showSuccess(`${user.name} ${t('users.messages.deactivated')}`);
          } catch (error) {
            console.error('Erro ao desativar usuário:', error);
            showError(t('users.messages.errorAction'));
          }
          break;

        case 'approve':
          try {
            // Fazer chamada à API para aprovar o usuário (ativa e desbloqueia)
            await userService.updateUser(user.id, { isActive: true, isBlockedLoginAttempts: false });
            
            // Atualizar estado local após sucesso na API
            setUsers(users.map(u => {
              if (u.id === user.id) {
                const updatedUser = { ...u, isActive: true, isBlockedLoginAttempts: false };
                updatedUser.status = updatedUser.isBlockedLoginAttempts ? 'blocked' : (updatedUser.isActive ? 'active' : 'inactive');
                return updatedUser;
              }
              return u;
            }));
            showSuccess(`${user.name} ${t('users.messages.approved')}`);
          } catch (error) {
            console.error('Erro ao aprovar usuário:', error);
            showError(t('users.messages.errorAction'));
          }
          break;

        case 'promoteToAdmin':
          try {
            // Fazer chamada à API para atualizar o role na tabela user_companies
            const response = await api.put(`/api/users/${user.id}/role`, { role: 'ADMIN' });
            
            if (response.data.success) {
              // Atualizar estado local após sucesso na API
              setUsers(users.map(u => 
                u.id === user.id ? { ...u, role: 'ADMIN' } : u
              ));
              showSuccess(`${user.name} ${t('users.messages.promotedToAdmin')}`);
            } else {
              showError(response.data.message || t('users.messages.errorAction'));
            }
          } catch (error) {
            console.error('Erro ao promover usuário:', error);
            showError(t('users.messages.errorAction'));
          }
          break;

        case 'demoteToUser':
          try {
            // Fazer chamada à API para atualizar o role na tabela user_companies
            const response = await api.put(`/api/users/${user.id}/role`, { role: 'USER' });
            
            if (response.data.success) {
              // Atualizar estado local após sucesso na API
              setUsers(users.map(u => 
                u.id === user.id ? { ...u, role: 'USER' } : u
              ));
              showSuccess(`${user.name} ${t('users.messages.demotedToUser')}`);
            } else {
              showError(response.data.message || t('users.messages.errorAction'));
            }
          } catch (error) {
            console.error('Erro ao rebaixar usuário:', error);
            showError(t('users.messages.errorAction'));
          }
          break;

        default:
          console.log('Action:', action, 'User:', user.name);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      showError(t('users.messages.errorAction'));
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-purple-500";
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
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <UserCheck size={16} />;
      case "inactive": return <UserX size={16} />;
      case "blocked": return <ShieldX size={16} />;
      case "pending": return <Clock size={16} />;
      default: return <User size={16} />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return <Shield className="text-purple-600" size={16} />;
      case "APP_ADMIN": return <Shield className="text-orange-600" size={16} />;
      case "ADMIN": return <Shield className="text-blue-600" size={16} />;
      case "USER": return <User className="text-gray-600" size={16} />;
      default: return <User className="text-gray-600" size={16} />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return t('users.roles.superAdmin');
      case "APP_ADMIN": return t('users.roles.appAdmin');
      case "ADMIN": return t('users.roles.admin');
      case "USER": return t('users.roles.user');
      default: return role;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active": return t('users.status.active');
      case "inactive": return t('users.status.inactive');
      case "blocked": return t('users.status.blocked');
      case "pending": return t('users.status.pending');
      default: return status;
    }
  };

  // Funções para gerenciar Roles RBAC
  const handleOpenRolesModal = async (user) => {
    setSelectedUserForRoles(user);
    setShowRolesModal(true);
    setLoadingRoles(true);

    try {
      // Buscar roles disponíveis
      const rolesResponse = await api.get('/api/roles/roles');
      if (rolesResponse.data.success) {
        setAvailableRoles(rolesResponse.data.data || []);
      }

      // Buscar roles do usuário
      const userRolesResponse = await api.get(`/api/roles/users/${user.id}/roles`);
      if (userRolesResponse.data.success) {
        setUserRoles(userRolesResponse.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar roles:', error);
      showError('Erro ao carregar roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleCloseRolesModal = () => {
    setShowRolesModal(false);
    setSelectedUserForRoles(null);
    setAvailableRoles([]);
    setUserRoles([]);
  };

  const handleAssignRole = async (roleId) => {
    if (!selectedUserForRoles) return;

    try {
      const response = await api.post('/api/roles/user-roles', {
        userId: selectedUserForRoles.id,
        roleId
      });

      if (response.data.success) {
        showSuccess('Role atribuída com sucesso');
        // Recarregar roles do usuário
        const userRolesResponse = await api.get(`/api/roles/users/${selectedUserForRoles.id}/roles`);
        if (userRolesResponse.data.success) {
          setUserRoles(userRolesResponse.data.data || []);
        }
      }
    } catch (error) {
      console.error('Erro ao atribuir role:', error);
      showError(error.response?.data?.error || 'Erro ao atribuir role');
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!selectedUserForRoles) return;

    try {
      const response = await api.delete('/api/roles/user-roles', {
        data: {
          userId: selectedUserForRoles.id,
          roleId
        }
      });

      if (response.data.success) {
        showSuccess('Role removida com sucesso');
        setUserRoles(userRoles.filter(ur => ur.role.id !== roleId));
      }
    } catch (error) {
      console.error('Erro ao remover role:', error);
      showError(error.response?.data?.error || 'Erro ao remover role');
    }
  };

  const getDaysSinceLastLogin = (lastLogin) => {
    if (!lastLogin) return null;
    const days = Math.floor((new Date() - new Date(lastLogin)) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Opções para filtros
  const roleOptions = [
    { value: '', label: t('users.roles.all') },
    { value: 'SUPER_ADMIN', label: t('users.roles.superAdmin') },
    { value: 'APP_ADMIN', label: t('users.roles.appAdmin') },
    { value: 'ADMIN', label: t('users.roles.admin') },
    { value: 'USER', label: t('users.roles.user') }
  ];

  const statusOptions = [
    { value: '', label: t('users.status.all') },
    { value: 'active', label: t('users.status.active') },
    { value: 'inactive', label: t('users.status.inactive') },
    { value: 'blocked', label: t('users.status.blocked') },
    { value: 'pending', label: t('users.status.pending') }
  ];


  const lastLoginOptions = [
    { value: '', label: t('users.lastLoginOptions.any') },
    { value: '1', label: t('users.lastLoginOptions.lastDay') },
    { value: '7', label: t('users.lastLoginOptions.last7Days') },
    { value: '30', label: t('users.lastLoginOptions.last30Days') },
    { value: '90', label: t('users.lastLoginOptions.last90Days') }
  ];

  const itemsPerPageOptions = [
    { value: 10, label: t('users.itemsPerPage.10') },
    { value: 20, label: t('users.itemsPerPage.20') },
    { value: 50, label: t('users.itemsPerPage.50') },
    { value: 100, label: t('users.itemsPerPage.100') }
  ];

  // Estilos para react-select
  const selectStyles = {
    option: (provided) => ({
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


  if (!permissions.canViewCompanySettings) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('users.companyTitle')} - {currentCompany?.name || t('users.loading')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('users.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            className="btn-outline-primary"
            icon="heroicons:arrow-down-tray"
            onClick={exportUsers}
            text={t('users.exportCSV')}
          />

          {/* {permissions.canManageRoles && (
            <Button
              onClick={() => {
                // TODO: Implementar modal de criar usuário
                showInfo("Funcionalidade de criar usuário em desenvolvimento");
              }}
              className="btn-brand"
            >
              <UserPlus size={16} className="mr-2" />
              Novo Usuário
            </Button>
          )} */}
          <Button
            isLoading={loading}
            icon="heroicons:arrow-path-solid"
            onClick={loadUsers}
            text={t('users.refresh')}
          />
        </div>
      </div>

      {/* Barra de Ações em Massa */}
      {selectedUsers.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 p-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedUsers.length === currentUsers.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {selectedUsers.length} {t('users.bulkActions.selected', { count: selectedUsers.length })}
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                {t('users.bulkActions.clearSelection')}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {permissions.canViewCompanySettings && (
                <>
                  <Button
                    onClick={() => handleBulkAction('approve')}
                    className="btn-sm bg-green-500 hover:bg-green-600 text-white"
                    disabled={loading}
                  >
                    <UserCheck size={14} className="mr-1" />
                    {t('users.bulkActions.approve')}
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('activate')}
                    className="btn-sm bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={loading}
                  >
                    <UserCheck size={14} className="mr-1" />
                    {t('users.bulkActions.activate')}
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('deactivate')}
                    className="btn-sm bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={loading}
                  >
                    <UserX size={14} className="mr-1" />
                    {t('users.bulkActions.deactivate')}
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('block')}
                    className="btn-sm bg-red-500 hover:bg-red-600 text-white"
                    disabled={loading}
                  >
                    <Lock size={14} className="mr-1" />
                    {t('users.bulkActions.block')}
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('unblock')}
                    className="btn-sm bg-teal-500 hover:bg-teal-600 text-white"
                    disabled={loading}
                  >
                    <Unlock size={14} className="mr-1" />
                    {t('users.bulkActions.unblock')}
                  </Button>
                </>
              )}
              <Button
                onClick={() => handleBulkAction('exportSelected')}
                className="btn-sm bg-gray-500 hover:bg-gray-600 text-white"
                disabled={loading}
              >
                <Download size={14} className="mr-1" />
                {t('users.bulkActions.export')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('users.stats.total')}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('users.stats.active')}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('users.stats.inactive')}</p>
                <p className="text-xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="text-orange-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('users.stats.admins')}</p>
                <p className="text-xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('users.stats.blocked')}</p>
                <p className="text-xl font-bold">{stats.blocked}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          {/* Primeira linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('users.filters.search')}
              </label>
              <div className="relative">
                <Textinput
                  placeholder={t('users.filters.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('users.filters.role')}
              </label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={roleOptions}
                value={roleOptions.find(option => option.value === filters.role)}
                onChange={(option) => handleFilterChange('role', option?.value || '')}
                placeholder="Role"
                styles={selectStyles}
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('users.filters.status')}
              </label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={statusOptions}
                value={statusOptions.find(option => option.value === filters.status)}
                onChange={(option) => handleFilterChange('status', option?.value || '')}
                placeholder={t('users.filters.status')}
                styles={selectStyles}
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('users.filters.lastLogin')}
              </label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={lastLoginOptions}
                value={lastLoginOptions.find(option => option.value === filters.lastLoginDays)}
                onChange={(option) => handleFilterChange('lastLoginDays', option?.value || '')}
                placeholder={t('users.filters.period')}
                styles={selectStyles}
                isClearable
              />
            </div>
          </div>

          {/* Segunda linha - Filtros de data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('users.filters.createdFrom', 'Data de criação (de)')}
              </label>
              <Textinput
                type="date"
                value={filters.createdFrom}
                onChange={(e) => handleFilterChange('createdFrom', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('users.filters.createdTo', 'Data de criação (até)')}
              </label>
              <Textinput
                type="date"
                value={filters.createdTo}
                onChange={(e) => handleFilterChange('createdTo', e.target.value)}
              />
            </div>

            <div className="flex items-end space-x-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="btn-outline-secondary flex-1"
              >
                {t('users.filters.clear')}
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo dos filtros */}
        {(filters.search || filters.role || filters.status || filters.lastLoginDays || filters.createdFrom || filters.createdTo) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('users.filters.activeFilters')}</span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('users.filters.searchLabel')} {filters.search}
                </span>
              )}
              {filters.role && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('users.filters.roleLabel')} {roleOptions.find(o => o.value === filters.role)?.label}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('users.filters.statusLabel')} {statusOptions.find(o => o.value === filters.status)?.label}
                </span>
              )}
              {filters.lastLoginDays && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('users.filters.loginLabel')} {lastLoginOptions.find(o => o.value === filters.lastLoginDays)?.label}
                </span>
              )}
              {filters.createdFrom && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  De: {new Date(filters.createdFrom).toLocaleDateString('pt-BR')}
                </span>
              )}
              {filters.createdTo && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  Até: {new Date(filters.createdTo).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <div className="space-y-4">
          {/* Cabeçalho da tabela com contador */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('users.usersCount')} ({loading ? '...' : filteredUsers.length})
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
              <span className="ml-2 text-slate-600 dark:text-slate-400">{t('users.loading')}</span>
            </div>
          )}

          {/* Tabela responsiva */}
          {!loading && (
            <div className="overflow-x-auto relative" style={{ minHeight: currentUsers.length < 3 ? '400px' : 'auto' }}>
              <table className="min-w-full relative">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length > 0 && selectedUsers.length === currentUsers.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('users.table.user')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('users.table.role')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('users.table.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('users.table.activity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('users.table.actions')}
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
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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
                                  {formatPhone(user.phone)}
                                </div>
                              </div>
                            </div>
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
                                {user.loginCount.toLocaleString()} {t('users.table.logins')}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">
                                {user.transactions.toLocaleString()} {t('users.table.transactions')}
                              </div>
                              {daysSinceLogin !== null ? (
                                <div className={`text-xs ${
                                  daysSinceLogin <= 1 ? 'text-green-600' :
                                  daysSinceLogin <= 7 ? 'text-yellow-600' :
                                  daysSinceLogin <= 30 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  {daysSinceLogin === 0 ? t('users.table.today') : `${daysSinceLogin} ${t('users.table.daysAgo')}`}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">{t('users.table.neverLoggedIn')}</div>
                              )}
                            </div>
                          </td>
                          
                          
                          {/* Ações */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Dropdown
                              label={<MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />}
                              labelClass="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              classMenuItems="w-[180px] max-h-80 overflow-y-auto"
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
                                {t('users.actions.viewProfile')}
                              </button>
                              
                              {permissions.canViewCompanySettings && (
                                <>
                                  <div className="border-t border-gray-100 dark:border-gray-600"></div>
                                  
                                  {user.status === 'pending' && (
                                    <button
                                      onClick={() => handleUserAction('approve', user)}
                                      className="flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                      <UserCheck size={14} className="mr-2" />
                                      {t('users.actions.approve')}
                                    </button>
                                  )}

                                  {user.status === 'blocked' ? (
                                    <button
                                      onClick={() => handleUserAction('unblock', user)}
                                      className="flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                      <Unlock size={14} className="mr-2" />
                                      {t('users.actions.unblock')}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserAction('block', user)}
                                      className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                      <Lock size={14} className="mr-2" />
                                      {t('users.actions.block')}
                                    </button>
                                  )}
                                  
                                  {user.status !== 'blocked' && user.status !== 'pending' && (
                                    <>
                                      {user.status === 'active' ? (
                                        <button
                                          onClick={() => handleUserAction('deactivate', user)}
                                          className="flex items-center px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                          <UserX size={14} className="mr-2" />
                                          {t('users.actions.deactivate')}
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleUserAction('activate', user)}
                                          className="flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                          <UserCheck size={14} className="mr-2" />
                                          {t('users.actions.activate')}
                                        </button>
                                      )}

                                      <div className="border-t border-gray-100 dark:border-gray-600"></div>

                                      {user.role === 'USER' && (
                                        <button
                                          onClick={() => handleUserAction('promoteToAdmin', user)}
                                          className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                          <Shield size={14} className="mr-2" />
                                          {t('users.actions.promoteToAdmin')}
                                        </button>
                                      )}

                                      {(user.role === 'ADMIN' || user.role === 'APP_ADMIN') && user.role !== 'APP_ADMIN' && (
                                        <button
                                          onClick={() => handleUserAction('demoteToUser', user)}
                                          className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                        >
                                          <User size={14} className="mr-2" />
                                          {t('users.actions.demoteToUser')}
                                        </button>
                                      )}
                                    </>
                                  )}

                                  <div className="border-t border-gray-100 dark:border-gray-600"></div>

                                  <button
                                    onClick={() => handleOpenRolesModal(user)}
                                    className="flex items-center px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                  >
                                    <Shield size={14} className="mr-2" />
                                    Gerenciar Permissões
                                  </button>
                                </>
                              )}
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center">
                          <User className="w-12 h-12 mb-2 opacity-50" />
                          <span className="font-medium">{t('users.noUsers')}</span>
                          <span className="text-sm">{t('users.noUsersDesc')}</span>
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
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                  {t('users.pagination.showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('users.pagination.to')} {Math.min(currentPage * itemsPerPage, filteredUsers.length)} {t('users.pagination.of')} {filteredUsers.length} {t('users.pagination.records')}
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

      {/* Modal de Roles */}
      <Modal
        activeModal={showRolesModal}
        onClose={handleCloseRolesModal}
        title={`Gerenciar Permissões - ${selectedUserForRoles?.name}`}
        className="max-w-3xl"
        footer={
          <div className="flex justify-end">
            <Button
              text="Fechar"
              className="btn-outline-secondary"
              onClick={handleCloseRolesModal}
            />
          </div>
        }
      >
        {loadingRoles ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-slate-600 dark:text-slate-400">Carregando roles...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Roles Atuais do Usuário */}
            <div>
              <h6 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Roles Atribuídas ({userRoles.length})
              </h6>
              {userRoles.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Shield className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nenhuma role atribuída
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userRoles.map((userRole) => (
                    <div
                      key={userRole.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-purple-600" />
                        <div>
                          <h6 className="text-sm font-medium text-slate-900 dark:text-white">
                            {userRole.role.displayName}
                          </h6>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {userRole.role.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                              Prioridade: {userRole.role.priority}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {userRole.role._count?.permissions || 0} permissões
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRole(userRole.role.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remover role"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Roles Disponíveis */}
            <div>
              <h6 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Roles Disponíveis
              </h6>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableRoles
                  .filter(role => !userRoles.some(ur => ur.role.id === role.id))
                  .map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Shield className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h6 className="text-sm font-medium text-slate-900 dark:text-white">
                              {role.displayName}
                            </h6>
                            {role.isSystem && (
                              <Lock className="w-3 h-3 text-slate-400" title="Role do sistema" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {role.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                              Prioridade: {role.priority}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {role._count?.permissions || 0} permissões
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignRole(role.id)}
                        className="ml-3 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-md transition-colors"
                      >
                        Atribuir
                      </button>
                    </div>
                  ))}
                {availableRoles.filter(role => !userRoles.some(ur => ur.role.id === role.id)).length === 0 && (
                  <div className="text-center py-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Todas as roles disponíveis já foram atribuídas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CompanyUsersPage;
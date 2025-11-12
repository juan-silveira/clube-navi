"use client";

import { useState, useEffect } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Dropdown from "@/components/ui/Dropdown";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  UserPlus
} from 'lucide-react';

// Mock data
const mockSuperAdmins = [
  {
    id: 1,
    name: 'Admin Navi',
    email: 'admin@navi.com',
    isActive: true,
    lastLoginAt: '2025-01-12T16:45:00',
    createdAt: '2024-01-01T00:00:00',
    permissions: ['all']
  },
  {
    id: 2,
    name: 'Roberto Silva',
    email: 'roberto@navi.com',
    isActive: true,
    lastLoginAt: '2025-01-12T10:30:00',
    createdAt: '2024-06-15T10:00:00',
    permissions: ['clubs', 'users', 'billing']
  },
  {
    id: 3,
    name: 'Carla Santos',
    email: 'carla@navi.com',
    isActive: false,
    lastLoginAt: '2024-12-20T15:20:00',
    createdAt: '2024-03-10T14:30:00',
    permissions: ['clubs', 'users']
  }
];

const SuperAdminsPage = () => {
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [superAdmins, setSuperAdmins] = useState(mockSuperAdmins);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    isActive: ''
  });

  // Estatísticas (mock)
  const stats = {
    total: 3,
    active: 2,
    inactive: 1
  };

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.canViewSystemSettings, router]);

  const handleAdminAction = (action, admin) => {
    switch (action) {
      case 'view':
        router.push(`/system/super-admins/${admin.id}`);
        break;
      case 'edit':
        router.push(`/system/super-admins/${admin.id}/edit`);
        break;
      case 'toggle-status':
        console.log('Toggle status:', admin.name);
        break;
      default:
        console.log('Action:', action, 'Admin:', admin.name);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    // TODO: Implement search with API
    console.log('Search filters:', filters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      isActive: ''
    });
    setCurrentPage(1);
    setSuperAdmins(mockSuperAdmins);
  };

  const handleRefresh = () => {
    setSuperAdmins(mockSuperAdmins);
  };

  const handleAddNew = () => {
    router.push('/system/super-admins/new');
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-success-500/10 text-success-500 border-success-500">Ativo</Badge>
    ) : (
      <Badge className="bg-danger-500/10 text-danger-500 border-danger-500">Inativo</Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionsBadge = (permissions) => {
    if (permissions.includes('all')) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
          Acesso Total
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
        {permissions.length} permissões
      </span>
    );
  };

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Super Administradores
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Gerencie os administradores do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon="heroicons-outline:refresh"
            className="btn-secondary"
            onClick={handleRefresh}
            isLoading={loading}
          >
            Atualizar
          </Button>
          <Button
            className="btn-primary"
            onClick={handleAddNew}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Admin
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Total</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            </div>
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-success-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Ativos</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</div>
            </div>
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-danger-500/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-danger-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Inativos</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Textinput
            label="Buscar"
            placeholder="Nome ou email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              className="btn-primary flex-1"
              onClick={handleSearch}
              isLoading={loading}
            >
              Buscar
            </Button>
            <Button
              className="btn-secondary"
              onClick={handleClearFilters}
            >
              Limpar
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card title={`Super Administradores (${superAdmins.length})`} noborder>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Administrador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Permissões
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mr-2" />
                      <span className="text-slate-600 dark:text-slate-300">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : superAdmins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Nenhum administrador encontrado
                  </td>
                </tr>
              ) : (
                superAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {admin.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPermissionsBadge(admin.permissions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(admin.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4" />
                        {formatDate(admin.lastLoginAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(admin.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Dropdown
                        label={<MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />}
                        labelClass="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        classMenuItems="mt-2 w-[200px]"
                      >
                        <button
                          onClick={() => handleAdminAction('view', admin)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Eye size={14} className="mr-2" />
                          Ver Detalhes
                        </button>
                        <button
                          onClick={() => handleAdminAction('edit', admin)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Edit size={14} className="mr-2" />
                          Editar
                        </button>
                        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                        <button
                          onClick={() => handleAdminAction('toggle-status', admin)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            admin.isActive
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {admin.isActive ? (
                            <>
                              <Lock size={14} className="mr-2" />
                              Bloquear
                            </>
                          ) : (
                            <>
                              <Unlock size={14} className="mr-2" />
                              Desbloquear
                            </>
                          )}
                        </button>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminsPage;

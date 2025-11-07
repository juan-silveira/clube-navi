"use client";

import { useState, useEffect } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from '@/contexts/AlertContext';
import { clubAdminsService } from '@/services/api';
import {
  Search,
  RefreshCw,
  UserCog,
  Users,
  Shield,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const ClubAdminsPage = () => {
  const { showSuccess, showError } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [clubAdmins, setClubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const itemsPerPage = 20;

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    role: '',
    clubId: ''
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {
      super_admin: 0,
      admin: 0,
      manager: 0
    }
  });

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadAdmins();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.canViewSystemSettings, router, currentPage]);

  const loadStats = async () => {
    try {
      const response = await clubAdminsService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };

      const response = await clubAdminsService.list(params);

      if (response.success) {
        setClubAdmins(response.data.clubAdmins);
        setTotalPages(response.data.pagination.totalPages);
        setTotalAdmins(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error loading club admins:', error);
      showError('Erro ao carregar administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAdmins();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      isActive: '',
      role: '',
      clubId: ''
    });
    setCurrentPage(1);
    setTimeout(() => loadAdmins(), 100);
  };

  const handleToggleStatus = async (admin) => {
    try {
      const newStatus = !admin.isActive;
      const response = await clubAdminsService.updateStatus(admin.id, newStatus);

      if (response.success) {
        showSuccess(`Admin ${newStatus ? 'ativado' : 'desativado'} com sucesso`);
        loadAdmins();
        loadStats();
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      showError('Erro ao alterar status do administrador');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      super_admin: { label: 'Super Admin', className: 'bg-red-500/10 text-red-500' },
      admin: { label: 'Admin', className: 'bg-blue-500/10 text-blue-500' },
      manager: { label: 'Gerente', className: 'bg-purple-500/10 text-purple-500' }
    };

    const config = roleConfig[role] || { label: role, className: 'bg-gray-500/10 text-gray-500' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
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

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Administradores de Clubes
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Gerencie os administradores de todos os clubes
          </p>
        </div>
        <Button
          icon="heroicons-outline:refresh"
          className="btn-primary"
          onClick={() => {
            loadAdmins();
            loadStats();
          }}
          isLoading={loading}
        >
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-500" />
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

        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Super Admins</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.byRole?.super_admin || 0}</div>
            </div>
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Admins</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.byRole?.admin || 0}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-control"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Gerente</option>
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
      <Card title={`Administradores (${totalAdmins})`} noborder>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Administrador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Clube
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Último Login
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
              ) : clubAdmins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Nenhum administrador encontrado
                  </td>
                </tr>
              ) : (
                clubAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {admin.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {admin.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {admin.club?.branding?.logoUrl && (
                          <img
                            src={admin.club.branding.logoUrl}
                            alt={admin.club.companyName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {admin.club?.branding?.appName || admin.club?.companyName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {admin.club?.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(admin.role)}
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
                      <div className="flex items-center gap-2">
                        <Tooltip content={admin.isActive ? "Desativar" : "Ativar"}>
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            className={`p-2 rounded-lg transition-colors ${
                              admin.isActive
                                ? 'bg-danger-500/10 text-danger-500 hover:bg-danger-500/20'
                                : 'bg-success-500/10 text-success-500 hover:bg-success-500/20'
                            }`}
                          >
                            {admin.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                className="btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </Button>
              <Button
                className="btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClubAdminsPage;

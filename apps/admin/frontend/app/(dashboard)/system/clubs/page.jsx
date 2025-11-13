"use client";

import { useState, useEffect } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import Dropdown from "@/components/ui/Dropdown";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from '@/contexts/AlertContext';
import clubsService from '@/services/clubsService';
import {
  Building,
  Users,
  TrendingUp,
  Eye,
  MoreVertical,
  Edit,
  Palette,
  UserCog,
  Power,
  PowerOff
} from 'lucide-react';

const ClubsPage = () => {
  const { showSuccess, showError } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [clubs, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClubs, setTotalTenants] = useState(0);
  const itemsPerPage = 20;

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    plan: ''
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    console.log('🔍 [Clubes] Verificando permissões:', {
      canViewSystemSettings: permissions.canViewSystemSettings,
      permissions
    });

    if (!permissions.canViewSystemSettings) {
      console.log('❌ [Clubes] Sem permissão - redirecionando para dashboard');
      router.push("/dashboard");
      return;
    }

    console.log('✅ [Clubes] Carregando clubes...');
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.canViewSystemSettings, router, currentPage]);

  const loadTenants = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };

      console.log('📡 [Clubes] Chamando API com params:', params);
      const response = await clubsService.listClubs(params);
      console.log('📡 [Clubes] Resposta da API:', response);

      if (response.success) {
        console.log('✅ [Clubes] Clubes carregados:', response.data.clubs.length);
        setTenants(response.data.clubs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalTenants(response.data.pagination.total);

        // Calculate stats
        const activeCount = response.data.clubs.filter(t => t.isActive === true).length;
        const inactiveCount = response.data.clubs.filter(t => t.isActive === false).length;

        setStats({
          total: response.data.pagination.total,
          active: activeCount,
          inactive: inactiveCount
        });
      }
    } catch (error) {
      console.error('❌ [Clubes] Error loading clubs:', error);
      showError('Erro ao carregar clubes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTenants();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      isActive: '',
      plan: ''
    });
    setCurrentPage(1);
    setTimeout(() => loadTenants(), 100);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-success-500">Ativo</Badge>
    ) : (
      <Badge className="bg-danger-500">Inativo</Badge>
    );
  };

  const getPlanBadge = (plan) => {
    const planMap = {
      basic: { label: 'Basic', className: 'bg-slate-500' },
      pro: { label: 'Pro', className: 'bg-blue-500' },
      premium: { label: 'Premium', className: 'bg-purple-500' },
      custom: { label: 'Custom', className: 'bg-orange-500' }
    };

    const planInfo = planMap[plan] || { label: plan, className: 'bg-secondary-500' };

    return (
      <Badge className={planInfo.className}>
        {planInfo.label}
      </Badge>
    );
  };

  const handleToggleStatus = async (club) => {
    try {
      const response = await clubsService.toggleClubStatus(club.id);
      if (response.success) {
        showSuccess(response.message);
        loadTenants();
      }
    } catch (error) {
      console.error('Error toggling club status:', error);
      showError('Erro ao alterar status do clube');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const handleClubAction = (action, club) => {
    switch (action) {
      case 'view':
        router.push(`/system/clubs/${club.id}`);
        break;
      case 'edit':
        router.push(`/system/clubs/${club.id}/edit`);
        break;
      case 'branding':
        router.push(`/system/clubs/${club.id}/branding`);
        break;
      case 'manage-admins':
        router.push(`/system/clubs/${club.id}/admins`);
        break;
      case 'toggle-status':
        handleToggleStatus(club);
        break;
      default:
        console.log('Action:', action, 'Club:', club.companyName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Clubes
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gerenciamento de clubes do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon="heroicons-outline:arrow-path"
            className="btn-secondary"
            isLoading={loading}
            onClick={loadTenants}
            text="Atualizar"
          />
          <Button
            className="btn-primary"
            onClick={() => router.push('/system/clubs/new')}
            icon="heroicons-outline:plus"
            text="Novo Clube"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total de Clubes
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-success-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-500" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ativos
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.active}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-danger-500/10 flex items-center justify-center">
                <PowerOff className="w-6 h-6 text-danger-500" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Inativos
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.inactive}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Filtros">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Textinput
              type="text"
              placeholder="Buscar por nome, slug, CNPJ ou email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <select
              className="form-control py-2"
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            >
              <option value="">Todos os status</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div>
            <select
              className="form-control py-2"
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            >
              <option value="">Todos os planos</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            className="btn-primary"
            onClick={handleSearch}
            isLoading={loading}
            icon="heroicons-outline:magnifying-glass"
            text="Buscar"
          />
          <Button
            className="btn-secondary"
            onClick={handleClearFilters}
            icon="heroicons-outline:x-mark"
            text="Limpar Filtros"
          />
        </div>
      </Card>

      {/* Clubes List */}
      <Card
        title={`Clubes (${totalClubs})`}
        headerslot={
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Página {currentPage} de {totalPages}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Receita Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : clubs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                    Nenhum clube encontrado
                  </td>
                </tr>
              ) : (
                clubs.map((clube) => (
                  <tr key={clube.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {clube.branding?.logoUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-contain"
                              src={clube.branding.logoUrl}
                              alt={clube.companyName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                              <Building className="w-5 h-5 text-primary-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {clube.companyName}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {clube.contactEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {clube.slug}
                      </div>
                      {clube.subdomain && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {clube.subdomain}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(clube.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(clube.plan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900 dark:text-white">
                        <Users className="w-4 h-4 mr-1" />
                        {clube.stats?.totalUsers || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {formatCurrency(clube.stats?.totalRevenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {formatDate(clube.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Dropdown
                        label={<MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />}
                        labelClass="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        classMenuItems="mt-2 w-[200px]"
                      >
                        <button
                          onClick={() => handleClubAction('view', clube)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Eye size={14} className="mr-2" />
                          Ver Detalhes
                        </button>

                        <button
                          onClick={() => handleClubAction('edit', clube)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Edit size={14} className="mr-2" />
                          Editar
                        </button>

                        <button
                          onClick={() => handleClubAction('branding', clube)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Palette size={14} className="mr-2" />
                          Branding
                        </button>

                        <button
                          onClick={() => handleClubAction('manage-admins', clube)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <UserCog size={14} className="mr-2" />
                          Gerenciar Admins
                        </button>

                        <div className="border-t border-gray-100 dark:border-gray-600"></div>

                        <button
                          onClick={() => handleClubAction('toggle-status', clube)}
                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                            clube.isActive
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {clube.isActive ? (
                            <>
                              <PowerOff size={14} className="mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Power size={14} className="mr-2" />
                              Ativar
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              className="btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              icon="heroicons-outline:chevron-left"
              text="Anterior"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              className="btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              icon="heroicons-outline:chevron-right"
              text="Próxima"
              iconPosition="right"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClubsPage;

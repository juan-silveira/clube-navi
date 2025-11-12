"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Dropdown from "@/components/ui/Dropdown";
import Textinput from "@/components/ui/Textinput";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import clubsService from "@/services/clubsService";
import {
  ArrowLeft,
  MoreVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const ClubAdminsPage = () => {
  const { t } = useTranslation("common");
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [club, setClub] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadClubAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadClubAdmins = async () => {
    try {
      setLoading(true);
      const response = await clubsService.getClubById(params.id);
      const clubData = response.data.club;

      setClub({
        id: clubData.id,
        companyName: clubData.companyName,
        slug: clubData.slug
      });
      setAdmins(clubData.admins || []);
    } catch (err) {
      console.error('Error loading club admins:', err);
      setError('Erro ao carregar administradores do clube');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = (action, admin) => {
    switch (action) {
      case 'view':
        router.push(`/system/club-admins/${admin.id}`);
        break;
      case 'edit':
        router.push(`/system/club-admins/${admin.id}/edit`);
        break;
      case 'toggle-status':
        console.log('Toggle status:', admin.name);
        break;
      default:
        console.log('Action:', action, 'Admin:', admin.name);
    }
  };

  const handleAddAdmin = () => {
    router.push(`/system/club-admins/new?clubId=${params.id}`);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-blue-500/10 text-blue-500' },
      manager: { label: 'Gerente', className: 'bg-purple-500/10 text-purple-500' }
    };

    const config = roleConfig[role] || roleConfig.manager;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
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

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: admins.length,
    active: admins.filter(a => a.isActive).length,
    inactive: admins.filter(a => !a.isActive).length
  };

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Clube não encontrado
        </h2>
        <Button
          className="btn-primary mt-4"
          onClick={() => router.push('/system/clubs')}
          icon="heroicons-outline:arrow-left"
          text={t("buttons.back")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content={t("buttons.back")} placement="bottom">
            <button
              onClick={() => router.push(`/system/clubs/${params.id}`)}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Administradores do Clube
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {club.companyName} - Gerencie os administradores
            </p>
          </div>
        </div>
        <Button
          className="btn-primary"
          onClick={handleAddAdmin}
          icon="heroicons-outline:user-plus"
          text="Novo Administrador"
        />
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

      {/* Search */}
      <Card>
        <Textinput
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Table */}
      <Card title={`Administradores (${filteredAdmins.length})`} noborder>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Administrador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Membro desde
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Nenhum administrador encontrado
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
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
                      {getRoleBadge(admin.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.isActive ? (
                        <Badge className="bg-success-500/10 text-success-500 border-success-500">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-danger-500/10 text-danger-500 border-danger-500">
                          Inativo
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4" />
                        {formatDate(admin.lastLoginAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Dropdown
                        label={<MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />}
                        labelClass="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        classMenuItems="mt-2 w-[200px] right-0"
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

export default ClubAdminsPage;

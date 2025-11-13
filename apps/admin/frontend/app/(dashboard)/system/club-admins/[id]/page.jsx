"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import { useAlertContext } from '@/contexts/AlertContext';
import { clubAdminsService } from '@/services/api';
import {
  ArrowLeft,
  Shield,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';

const ClubAdminDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkMode();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadAdmin = async () => {
    try {
      setLoading(true);
      const response = await clubAdminsService.getById(params.id);
      if (response.success) {
        setAdmin(response.data.clubAdmin);
      }
    } catch (error) {
      console.error('Error loading club admin:', error);
      showError('Erro ao carregar dados do administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await clubAdminsService.updateStatus(admin.id, !admin.isActive);
      if (response.success) {
        showSuccess(response.message || 'Status atualizado com sucesso');
        loadAdmin();
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
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

  if (!admin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Administrador não encontrado
        </h2>
        <Button className="btn-primary mt-4" onClick={() => router.push('/system/club-admins')}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content="Voltar" placement="bottom">
            <button
              onClick={() => router.push('/system/club-admins')}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Detalhes do Administrador
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Informações completas do administrador
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className={admin.isActive ? "btn-outline-danger" : "btn-outline-success"}
            onClick={handleToggleStatus}
            icon={admin.isActive ? "heroicons-outline:x-circle" : "heroicons-outline:check-circle"}
            text={admin.isActive ? "Desativar" : "Ativar"}
          />
          <Button
            className="btn-primary"
            onClick={() => router.push(`/system/club-admins/${admin.id}/edit`)}
            icon="heroicons-outline:pencil-square"
            text="Editar"
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2">
        {admin.isActive ? (
          <Badge className="bg-success-500/10 text-success-500 border-success-500 flex items-center gap-1">
            <CheckCircle size={14} />
            Ativo
          </Badge>
        ) : (
          <Badge className="bg-danger-500/10 text-danger-500 border-danger-500 flex items-center gap-1">
            <XCircle size={14} />
            Inativo
          </Badge>
        )}
        {getRoleBadge(admin.role)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information */}
          <Card title="Informações Pessoais">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                    <Shield size={16} />
                    Nome Completo
                  </label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {admin.name}
                  </p>
                </div>
                {admin.cpf && (
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                      <Shield size={16} />
                      CPF
                    </label>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {admin.cpf}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {admin.email}
                  </p>
                </div>
                {admin.phone && (
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                      <Phone size={16} />
                      Telefone
                    </label>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {admin.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Club Information */}
          <Card title="Clube">
            <div className="flex items-center gap-4">
              {admin.club?.branding?.logoUrl ? (
                <img
                  src={admin.club.branding.logoUrl}
                  alt={admin.club.companyName}
                  className="w-16 h-16 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 p-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Building size={32} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {admin.club?.branding?.appName || admin.club?.companyName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Slug: <span className="font-semibold">{admin.club?.slug}</span>
                </p>
                <Button
                  className="btn-outline-primary btn-sm"
                  onClick={() => router.push(`/system/clubs/${admin.club.id}`)}
                  icon="heroicons-outline:arrow-right"
                  text="Ver Detalhes do Clube"
                  iconPosition="right"
                />
              </div>
            </div>
          </Card>

          {/* Permissions */}
          {admin.permissions && admin.permissions.length > 0 && (
            <Card title="Permissões">
              <div className="flex flex-wrap gap-2">
                {admin.permissions.map((permission, index) => (
                  <Badge
                    key={index}
                    className="bg-primary-500/10 text-primary-500 border-primary-500"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Activity */}
          <Card title="Atividade">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Clock size={16} />
                  Último Login
                </label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(admin.lastLoginAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={16} />
                  Criado em
                </label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(admin.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Atualizado em
                </label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(admin.updatedAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Role Info */}
          <Card title="Função">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                {getRoleBadge(admin.role)}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Nível de acesso ao sistema
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubAdminDetailPage;

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import usePermissions from "@/hooks/usePermissions";
import {
  ArrowLeft,
  Edit,
  Shield,
  Building,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';

// Mock data
const getMockAdmin = (id) => ({
  id,
  name: 'João Silva',
  email: 'joao@clube-navi.com',
  role: 'admin',
  isActive: true,
  lastLoginAt: '2025-01-12T10:30:00',
  createdAt: '2024-06-15T10:00:00',
  updatedAt: '2025-01-12T10:30:00',
  club: {
    id: 1,
    companyName: 'Clube Navi',
    slug: 'clube-navi',
    branding: {
      appName: 'Clube Navi',
      logoUrl: 'https://via.placeholder.com/100',
      primaryColor: '#3B82F6'
    }
  },
  permissions: ['manage_users', 'view_reports', 'manage_products'],
  phone: '+55 11 98765-4321',
  cpf: '123.456.789-00'
});

const ClubAdminDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setAdmin(getMockAdmin(params.id));
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleToggleStatus = () => {
    setAdmin({ ...admin, isActive: !admin.isActive });
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
          <Button
            icon={<ArrowLeft size={16} />}
            className="btn-secondary"
            onClick={() => router.push('/system/club-admins')}
          >
            Voltar
          </Button>
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
            className={admin.isActive ? "btn-danger" : "btn-success"}
            onClick={handleToggleStatus}
          >
            {admin.isActive ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Bloquear
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Desbloquear
              </>
            )}
          </Button>
          <Button
            className="btn-primary"
            onClick={() => router.push(`/system/club-admins/${admin.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Nome Completo
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {admin.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    CPF
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {admin.cpf}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {admin.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Telefone
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {admin.phone}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Club Information */}
          <Card title="Clube">
            <div className="flex items-center gap-4">
              {admin.club?.branding?.logoUrl && (
                <img
                  src={admin.club.branding.logoUrl}
                  alt={admin.club.companyName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building size={18} className="text-slate-500 dark:text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {admin.club?.branding?.appName || admin.club?.companyName}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Slug: <span className="font-semibold">{admin.club?.slug}</span>
                </p>
                <Button
                  className="btn-sm btn-outline-primary mt-2"
                  onClick={() => router.push(`/system/clubs/${admin.club.id}`)}
                >
                  Ver Detalhes do Clube
                </Button>
              </div>
            </div>
          </Card>

          {/* Permissions */}
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

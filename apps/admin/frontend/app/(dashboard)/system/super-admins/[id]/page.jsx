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
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Key
} from 'lucide-react';

// Mock data
const getMockAdmin = (id) => ({
  id,
  name: 'Admin Navi',
  email: 'admin@navi.com',
  isActive: true,
  lastLoginAt: '2025-01-12T16:45:00',
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2025-01-12T16:45:00',
  permissions: ['all'],
  phone: '+55 11 91234-5678',
  role: 'super_admin'
});

const SuperAdminDetailPage = () => {
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
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-500">
          Acesso Total
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500">
        {permissions.length} permissões
      </span>
    );
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
        <Button className="btn-primary mt-4" onClick={() => router.push('/system/super-admins')}>
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
            onClick={() => router.push('/system/super-admins')}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Detalhes do Super Admin
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Informações completas do administrador do sistema
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
            onClick={() => router.push(`/system/super-admins/${admin.id}/edit`)}
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
        {getPermissionsBadge(admin.permissions)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information */}
          <Card title="Informações Pessoais">
            <div className="flex items-center gap-6 mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {admin.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Super Administrador do Sistema
                </p>
              </div>
            </div>

            <div className="space-y-4">
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

          {/* Permissions */}
          <Card title="Permissões">
            {admin.permissions.includes('all') ? (
              <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                  Acesso Total ao Sistema
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Este administrador tem acesso irrestrito a todas as funcionalidades do sistema,
                  incluindo gestão de clubes, usuários, configurações e dados sensíveis.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {admin.permissions.map((permission, index) => (
                  <Badge
                    key={index}
                    className="bg-primary-500/10 text-primary-500 border-primary-500 flex items-center gap-1"
                  >
                    <Key size={12} />
                    {permission}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Security Info */}
          <Card title="Segurança">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    Autenticação de Dois Fatores
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Recomendamos habilitar 2FA para maior segurança da conta.
                  </p>
                  <Button className="btn-sm btn-outline-primary mt-3">
                    Configurar 2FA
                  </Button>
                </div>
              </div>
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
          <Card title="Nível de Acesso">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Nível máximo de acesso ao sistema com permissões administrativas completas.
              </p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Ações Rápidas">
            <div className="space-y-2">
              <Button className="btn-outline-primary w-full btn-sm">
                Ver Histórico de Ações
              </Button>
              <Button className="btn-outline-secondary w-full btn-sm">
                Resetar Senha
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDetailPage;

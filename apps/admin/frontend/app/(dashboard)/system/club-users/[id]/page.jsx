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
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

// Mock data
const getMockUser = (id) => ({
  id,
  name: 'Pedro Alves',
  email: 'pedro@example.com',
  cpf: '123.456.789-00',
  phone: '+55 11 98765-4321',
  userType: 'consumer',
  isActive: true,
  lastLoginAt: '2025-01-12T14:30:00',
  createdAt: '2024-12-01T10:00:00',
  updatedAt: '2025-01-12T14:30:00',
  club: {
    id: 1,
    companyName: 'Clube Navi',
    slug: 'clube-navi',
    branding: {
      appName: 'Clube Navi',
      logoUrl: 'https://via.placeholder.com/100'
    }
  },
  stats: {
    totalPurchases: 15,
    totalSpent: 2500.50,
    totalCashback: 125.25,
    referrals: 3
  },
  address: {
    street: 'Rua Exemplo, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
  }
});

const ClubUserDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setUser(getMockUser(params.id));
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleToggleStatus = () => {
    setUser({ ...user, isActive: !user.isActive });
  };

  const getUserTypeBadge = (userType) => {
    if (userType === 'consumer') {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500">
          Consumidor
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-500">
        Lojista
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Usuário não encontrado
        </h2>
        <Button className="btn-primary mt-4" onClick={() => router.push('/system/club-users')}>
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
            onClick={() => router.push('/system/club-users')}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Detalhes do Usuário
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Informações completas do usuário
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className={user.isActive ? "btn-danger" : "btn-success"}
            onClick={handleToggleStatus}
          >
            {user.isActive ? (
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
            onClick={() => router.push(`/system/club-users/${user.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2">
        {user.isActive ? (
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
        {getUserTypeBadge(user.userType)}
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
                    {user.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    CPF
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {user.cpf}
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
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Phone size={16} />
                    Telefone
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {user.phone}
                  </p>
                </div>
              </div>

              {user.address && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Endereço
                  </label>
                  <p className="text-base text-slate-900 dark:text-white mt-1">
                    {user.address.street}<br />
                    {user.address.city} - {user.address.state}<br />
                    CEP: {user.address.zipCode}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Club Information */}
          <Card title="Clube">
            <div className="flex items-center gap-4">
              {user.club?.branding?.logoUrl && (
                <img
                  src={user.club.branding.logoUrl}
                  alt={user.club.companyName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building size={18} className="text-slate-500 dark:text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {user.club?.branding?.appName || user.club?.companyName}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Slug: <span className="font-semibold">{user.club?.slug}</span>
                </p>
                <Button
                  className="btn-sm btn-outline-primary mt-2"
                  onClick={() => router.push(`/system/clubs/${user.club.id}`)}
                >
                  Ver Detalhes do Clube
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card title="Estatísticas">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={18} className="text-blue-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Compras</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.stats?.totalPurchases || 0}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={18} className="text-green-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Gasto Total</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(user.stats?.totalSpent)}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={18} className="text-purple-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Cashback</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(user.stats?.totalCashback)}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <User size={18} className="text-orange-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Indicações</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.stats?.referrals || 0}
                </p>
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
                  {formatDate(user.lastLoginAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={16} />
                  Criado em
                </label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Atualizado em
                </label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* User Type */}
          <Card title="Tipo de Usuário">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                {user.userType === 'consumer' ? (
                  <User className="w-6 h-6 text-blue-500" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-purple-500" />
                )}
              </div>
              <div>
                {getUserTypeBadge(user.userType)}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {user.userType === 'consumer' ? 'Realiza compras no marketplace' : 'Vende produtos no marketplace'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubUserDetailPage;

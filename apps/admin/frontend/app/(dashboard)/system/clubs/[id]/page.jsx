"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import { useAlertContext } from '@/contexts/AlertContext';
import clubsService from '@/services/clubsService';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Calendar,
  Users,
  DollarSign,
  Globe,
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  Package,
  Database,
  Server,
  HardDrive,
  UserCog,
  Power,
  PowerOff
} from 'lucide-react';

const ClubDetailPage = () => {
  const { t } = useTranslation("common");
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkMode();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadClub = async () => {
    try {
      setLoading(true);
      const response = await clubsService.getClubById(params.id);
      if (response.success) {
        setClub(response.data.club);
      }
    } catch (error) {
      console.error('Error loading club:', error);
      showError('Erro ao carregar dados do clube');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await clubsService.toggleClubStatus(club.id);
      if (response.success) {
        showSuccess(response.message);
        loadClub();
      }
    } catch (error) {
      console.error('Error toggling club status:', error);
      showError('Erro ao alterar status do clube');
    }
  };

  const getPlanBadge = (plan) => {
    const planConfig = {
      basic: { label: 'Basic', className: 'bg-gray-500/10 text-gray-500' },
      pro: { label: 'Pro', className: 'bg-blue-500/10 text-blue-500' },
      premium: { label: 'Premium', className: 'bg-purple-500/10 text-purple-500' },
      custom: { label: 'Custom', className: 'bg-orange-500/10 text-orange-500' }
    };

    const config = planConfig[plan] || planConfig.basic;

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
      year: 'numeric'
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
              onClick={() => router.push('/system/clubs')}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Detalhes do Clube
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Informações completas do clube
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="btn-outline-primary"
            onClick={() => router.push(`/system/clubs/${club.id}/branding`)}
            icon="material-symbols:palette-outline"
            text="Branding"
          />
          <Button
            className="btn-outline-primary"
            onClick={() => router.push(`/system/clubs/${club.id}/admins`)}
            icon="heroicons-outline:shield-check"
            text="Admins"
          />
          <Button
            className="btn-primary"
            onClick={() => router.push(`/system/clubs/${club.id}/edit`)}
            icon="heroicons-outline:pencil-square"
            text="Editar"
          />
        </div>
      </div>

      {/* Status & Plan Badges */}
      <div className="flex gap-2">
        {club.isActive ? (
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
        {getPlanBadge(club.plan)}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Usuários</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {club.stats.totalUsers}
              </div>
              <div className="text-xs text-success-500">
                {club.stats.activeUsers} ativos
              </div>
            </div>
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Receita Total</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(club.stats.totalRevenue)}
              </div>
            </div>
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Transações</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {club.stats.totalTransactions}
              </div>
            </div>
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Plano</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {club.plan}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Company Information */}
          <Card title="Informações da Empresa">
            <div className="flex items-start gap-4 mb-6">
              {club.branding?.logoUrl && (
                <img
                  src={club.branding.logoUrl}
                  alt={club.companyName}
                  className="w-20 h-20 rounded-lg object-contain"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {club.companyName}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  {club.branding?.appName}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    CNPJ
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {club.cnpj}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Slug
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {club.slug}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Mail size={16} />
                    Email de Contato
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {club.contactEmail}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Phone size={16} />
                    Telefone
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {club.contactPhone}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Address */}
          {club.address && (
            <Card title="Endereço">
              <div className="text-slate-900 dark:text-white">
                <p>{club.address.street}</p>
                <p>{club.address.city} - {club.address.state}</p>
                <p>CEP: {club.address.zipCode}</p>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{club.address.country}</p>
              </div>
            </Card>
          )}

          {/* Domains */}
          <Card title="Domínios e Acesso">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Globe size={16} />
                  Subdomínio
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                  {club.subdomain}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  URL: {club.subdomain}.localhost:3000
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Shield size={16} />
                  Admin Subdomain
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                  {club.adminSubdomain}
                </p>
              </div>
              {club.customDomain && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Domínio Customizado
                  </label>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {club.customDomain}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Database Info */}
          <Card title="Informações do Banco de Dados">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Database size={16} />
                  Database Name
                </label>
                <p className="text-base font-mono text-slate-900 dark:text-white mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {club.databaseName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Server size={16} />
                  Database Host
                </label>
                <p className="text-base font-mono text-slate-900 dark:text-white mt-1">
                  {club.databaseHost}:{club.databasePort}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <UserCog size={16} />
                  Database User
                </label>
                <p className="text-base font-mono text-slate-900 dark:text-white mt-1">
                  {club.databaseUser}
                </p>
              </div>
            </div>
          </Card>

          {/* App Config */}
          {club.appConfig && (
            <Card title="Configuração do App">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Package size={16} />
                    Package Name
                  </label>
                  <p className="text-base font-mono text-slate-900 dark:text-white mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {club.appConfig.packageName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Bundle ID (iOS)
                  </label>
                  <p className="text-base font-mono text-slate-900 dark:text-white mt-1">
                    {club.appConfig.bundleId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    URL Scheme
                  </label>
                  <p className="text-base font-mono text-slate-900 dark:text-white mt-1">
                    {club.appConfig.urlScheme}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Versão Atual
                  </label>
                  <p className="text-base text-slate-900 dark:text-white mt-1">
                    {club.appConfig.currentVersion}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Limits */}
          <Card title="Limites e Recursos">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Users size={16} />
                  Máximo de Usuários
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {club.maxUsers?.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Shield size={16} />
                  Máximo de Admins
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {club.maxAdmins}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <HardDrive size={16} />
                  Storage
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {club.maxStorageGB} GB
                </p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <DollarSign size={16} />
                  Mensalidade
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(club.monthlyFee)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <Card title="Ações Rápidas">
            <div className="space-y-2">
              <Button
                className={club.isActive ? "btn-danger w-full" : "btn-success w-full"}
                onClick={handleToggleStatus}
                icon={club.isActive ? "heroicons-outline:x-circle" : "heroicons-outline:check-circle"}
                text={club.isActive ? "Desativar Clube" : "Ativar Clube"}
              />
              <Button
                className="btn-outline-primary w-full"
                icon="heroicons-outline:users"
                text="Ver Usuários"
              />
              <Button
                className="btn-outline-secondary w-full"
                icon="heroicons-outline:credit-card"
                text="Ver Transações"
              />
            </div>
          </Card>

          {/* Activity */}
          <Card title="Informações do Sistema">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={16} />
                  Criado em
                </label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(club.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Última Atualização
                </label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(club.updatedAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Branding Preview */}
          <Card title="Preview do Branding">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded"
                  style={{ backgroundColor: club.branding?.primaryColor }}
                />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Cor Primária</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {club.branding?.primaryColor}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded"
                  style={{ backgroundColor: club.branding?.secondaryColor }}
                />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Cor Secundária</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {club.branding?.secondaryColor}
                  </p>
                </div>
              </div>
              <Button
                className="btn-outline-primary w-full btn-sm mt-2"
                onClick={() => router.push(`/system/clubs/${club.id}/branding`)}
                icon="material-symbols:palette-outline"
                text="Editar Branding"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailPage;

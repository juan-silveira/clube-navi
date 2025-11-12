"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import usePermissions from "@/hooks/usePermissions";
import clubsService from "@/services/clubsService";
import {
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowRight,
  Percent
} from 'lucide-react';

const SystemDashboardPage = () => {
  const router = useRouter();
  const permissions = usePermissions();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await clubsService.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Erro ao carregar estatísticas do sistema');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      setError(null);

      const response = await clubsService.syncAllClubsStats();

      setSyncMessage({
        type: 'success',
        text: `✅ Sincronização completa! ${response.data.successCount} clubes atualizados.`
      });

      // Reload stats after sync
      await loadDashboardStats();

    } catch (err) {
      console.error('Error syncing stats:', err);
      setSyncMessage({
        type: 'error',
        text: 'Erro ao sincronizar estatísticas'
      });
    } finally {
      setSyncing(false);

      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Erro ao carregar dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
          <Button
            className="btn-primary"
            onClick={loadDashboardStats}
            icon="heroicons-outline:arrow-path"
            text="Tentar Novamente"
          />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard do Sistema
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Visão geral de todos os clubes da plataforma
          </p>
        </div>
        <Button
          className="btn-primary"
          onClick={handleSyncAll}
          disabled={syncing}
          isLoading={syncing}
          icon="heroicons-outline:arrow-path"
          text={syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        />
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`p-4 rounded-lg ${
          syncMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          {syncMessage.text}
        </div>
      )}

      {/* Clubs Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total de Clubes
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.clubs.total}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Clubes Ativos
              </p>
              <h3 className="text-3xl font-bold text-green-500">
                {stats.clubs.active}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {((stats.clubs.active / stats.clubs.total) * 100).toFixed(1)}% do total
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Clubes Inativos
              </p>
              <h3 className="text-3xl font-bold text-red-500">
                {stats.clubs.inactive}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {((stats.clubs.inactive / stats.clubs.total) * 100).toFixed(1)}% do total
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total de Usuários
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.totalUsers)}
              </h3>
              <div className="flex gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{formatNumber(stats.totalConsumers)} consumidores</span>
                <span>{formatNumber(stats.totalMerchants)} comerciantes</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total de Compras
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(stats.totalPurchases)}
              </h3>
              <p className="text-xs text-green-500 mt-2">
                {formatNumber(stats.purchases30d)} nos últimos 30 dias
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-full">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Receita Total
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </h3>
              <p className="text-xs text-green-500 mt-2">
                {formatCurrency(stats.revenue30d)} em 30 dias
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Cashback Pago
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.totalCashbackPaid)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {((stats.totalCashbackPaid / stats.totalRevenue) * 100).toFixed(2)}% da receita
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Percent className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Fees */}
      <Card title="Taxas da Plataforma">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Total de Taxas Arrecadadas
            </p>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.totalPlatformFees)}
            </h3>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Margem da Plataforma
            </p>
            <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {((stats.totalPlatformFees / stats.totalRevenue) * 100).toFixed(2)}%
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Das transações totais
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Clubs */}
      {stats.recentClubs && stats.recentClubs.length > 0 && (
        <Card title="Clubes Adicionados Recentemente">
          <div className="space-y-3">
            {stats.recentClubs.map((club) => (
              <div
                key={club.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/system/clubs/${club.id}`)}
              >
                <div className="flex items-center gap-4">
                  {club.branding?.logoUrl ? (
                    <img
                      src={club.branding.logoUrl}
                      alt={club.branding.appName}
                      className="w-12 h-12 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {club.companyName}
                    </h4>
                    <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatNumber(club.stats?.totalUsers || 0)} usuários
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(club.stats?.totalRevenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {club.isActive ? (
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full">
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full">
                      Inativo
                    </span>
                  )}
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button
              className="btn-outline-primary"
              onClick={() => router.push('/system/clubs')}
              icon="heroicons-outline:arrow-right"
              text="Ver Todos os Clubes"
              iconPosition="right"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default SystemDashboardPage;

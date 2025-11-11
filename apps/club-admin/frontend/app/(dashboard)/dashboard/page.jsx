"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import useAuthStore from "@/store/authStore";
import { clubService } from "@/services/api";

const StatCard = ({ title, value, subtitle, icon, color = "primary", trend }) => (
  <Card bodyClass="p-4">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-slate-600 dark:text-slate-300 text-sm mb-1 font-normal">
          {title}
        </div>
        <div className="text-2xl font-medium text-slate-900 dark:text-white mb-1">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </div>
        )}
        {trend && (
          <div className={`text-xs mt-2 flex items-center gap-1 ${
            trend.direction === 'up' ? 'text-success-500' : 'text-danger-500'
          }`}>
            <Icon
              icon={trend.direction === 'up' ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'}
              className="w-4 h-4"
            />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div className={`h-12 w-12 rounded-full bg-${color}-500/10 flex items-center justify-center`}>
        <Icon icon={icon} className={`w-6 h-6 text-${color}-500`} />
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await clubService.getStats();

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Fallback para dados vazios em caso de erro
      setStats({
        clubInfo: { name: 'Clube' },
        members: { total: 0, active: 0, inactive: 0, new7days: 0 },
        merchants: { total: 0, active: 0, pending: 0, new7days: 0 },
        products: { total: 0, active: 0, inactive: 0, groups: 0 },
        transactions: { total: 0, today: 0, confirmed: 0, pending: 0, cancelled: 0 },
        financial: { totalVolume: 0, volume30d: 0, totalCashback: 0, cashback30d: 0, avgTicket: 0, avgCashbackRate: 0 },
        performance: { successRate: 0, engagementRate: 0, avgTransactionsPerDay: 0 },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard - {stats?.clubInfo?.name || 'Clube'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Bem-vindo de volta, {user?.name || user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Icon icon="heroicons:check-circle" className="w-5 h-5 text-success-500" />
          <span>Sistema Ativo</span>
        </div>
      </div>

      {/* Estatísticas Principais - Linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Membros"
          value={stats?.members?.total || 0}
          subtitle={`${stats?.members?.active || 0} ativos`}
          icon="heroicons:users"
          color="primary"
          trend={{
            direction: 'up',
            value: `+${stats?.members?.new7days || 0} esta semana`
          }}
        />

        <StatCard
          title="Total de Comerciantes"
          value={stats?.merchants?.total || 0}
          subtitle={`${stats?.merchants?.active || 0} ativos`}
          icon="heroicons:building-storefront"
          color="success"
        />

        <StatCard
          title="Total de Produtos"
          value={stats?.products?.total || 0}
          subtitle={`${stats?.products?.active || 0} disponíveis`}
          icon="heroicons:cube"
          color="warning"
        />

        <StatCard
          title="Transações Hoje"
          value={stats?.transactions?.today || 0}
          subtitle={`${stats?.transactions?.total || 0} no total`}
          icon="heroicons:shopping-cart"
          color="info"
        />
      </div>

      {/* Estatísticas Financeiras - Linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Volume Total"
          value={`R$ ${(stats?.financial?.totalVolume || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`R$ ${(stats?.financial?.volume30d || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} últimos 30 dias`}
          icon="heroicons:banknotes"
          color="success"
        />

        <StatCard
          title="Cashback Distribuído"
          value={`R$ ${(stats?.financial?.totalCashback || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`R$ ${(stats?.financial?.cashback30d || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} últimos 30 dias`}
          icon="heroicons:gift"
          color="warning"
        />

        <StatCard
          title="Taxa Média Cashback"
          value={`${(stats?.financial?.avgCashbackRate || 0).toFixed(1)}%`}
          subtitle="Percentual médio"
          icon="heroicons:receipt-percent"
          color="info"
        />

        <StatCard
          title="Ticket Médio"
          value={`R$ ${(stats?.financial?.avgTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Por transação"
          icon="heroicons:currency-dollar"
          color="primary"
        />
      </div>

      {/* Gráfico e Status de Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card title="Transações dos Últimos 30 Dias" subtitle="Evolução diária de transações">
            <div className="flex items-center justify-center h-[350px]">
              <div className="text-center">
                <Icon icon="heroicons:chart-bar" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Sem transações ainda</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  O gráfico aparecerá quando houver dados
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Status de Transações" bodyClass="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success-500"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Confirmadas</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {stats?.transactions?.confirmed || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-warning-500"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Pendentes</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {stats?.transactions?.pending || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-danger-500"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Canceladas</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {stats?.transactions?.cancelled || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Performance" bodyClass="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Taxa de Sucesso</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {stats?.performance?.successRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.performance?.successRate || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Engajamento</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {stats?.performance?.engagementRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-info-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.performance?.engagementRate || 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Transações/Dia</span>
                  <span className="text-lg font-medium text-slate-900 dark:text-white">
                    {stats?.performance?.avgTransactionsPerDay || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Detalhes Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card title="Resumo de Membros" bodyClass="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Total</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.members?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Ativos</span>
              <span className="font-medium text-success-500">
                {stats?.members?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Inativos</span>
              <span className="font-medium text-slate-500">
                {stats?.members?.inactive || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">Novos (7 dias)</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.members?.new7days || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Resumo de Comerciantes" bodyClass="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Total</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.merchants?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Ativos</span>
              <span className="font-medium text-success-500">
                {stats?.merchants?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Pendentes</span>
              <span className="font-medium text-warning-500">
                {stats?.merchants?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">Novos (7 dias)</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.merchants?.new7days || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Resumo de Produtos" bodyClass="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Total</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.products?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Ativos</span>
              <span className="font-medium text-success-500">
                {stats?.products?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Inativos</span>
              <span className="font-medium text-slate-500">
                {stats?.products?.inactive || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">Grupos</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.products?.groups || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Última atualização */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        Última atualização: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString('pt-BR') : '-'}
      </div>
    </div>
  );
};

export default Dashboard;

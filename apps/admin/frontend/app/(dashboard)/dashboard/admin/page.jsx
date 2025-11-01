"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";
import { Icon } from "@iconify/react";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";

// Importação dinâmica do Chart para evitar erro de SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

const AdminDashboard = () => {
  const { t } = useTranslation('admin');
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se usuário é APP_ADMIN ou SUPER_ADMIN
  const isSuperAdmin = React.useMemo(() => {
    if (!user?.userCompanies || !Array.isArray(user.userCompanies)) {
      return false;
    }

    return user.userCompanies.some(uc =>
      uc.role === 'APP_ADMIN' || uc.role === 'SUPER_ADMIN'
    );
  }, [user]);

  useEffect(() => {
    // Verificar se o usuário é APP_ADMIN ou SUPER_ADMIN
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    fetchAdminStats();
  }, [user, router, isSuperAdmin]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar estatísticas gerais
      const response = await api.get('/api/admin/stats');

      // Buscar estatísticas de documentos
      const documentsResponse = await api.get('/api/user-documents/stats');

      if (response.data.success) {
        const statsData = response.data.data;

        // Adicionar estatísticas de documentos se disponíveis
        if (documentsResponse.data.success) {
          statsData.documents = documentsResponse.data.data;
        }

        setStats(statsData);
      } else {
        throw new Error(response.data.message || 'Erro ao buscar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao buscar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  // Configuração do gráfico de transações
  const chartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: ['#4669FA'],
    tooltip: {
      theme: 'dark',
    },
    grid: {
      show: true,
      borderColor: '#e2e8f0',
      strokeDashArray: 5,
      position: 'back',
    },
    xaxis: {
      categories: stats?.transactions?.chartData?.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }) || [],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
  };

  const chartSeries = [{
    name: t('dashboard.stats.transactions.seriesName'),
    data: stats?.transactions?.chartData?.map(d => d.count) || []
  }];

  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <HomeBredCurbs title={t('dashboard.pageTitle')} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-500 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-300">{t('dashboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <HomeBredCurbs title={t('dashboard.pageTitle')} />
        <Card>
          <div className="text-center py-12">
            <Icon icon="heroicons:exclamation-triangle" className="w-16 h-16 text-danger-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {t('dashboard.error.title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
            <button
              onClick={fetchAdminStats}
              className="btn btn-primary"
            >
              {t('dashboard.error.retry')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HomeBredCurbs title={t('dashboard.pageTitle')} />

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.stats.users.title')}
          value={stats?.users?.total || 0}
          subtitle={`${stats?.users?.active || 0} ${t('dashboard.stats.users.active')} (${stats?.users?.activePercentage || 0}%)`}
          icon="heroicons:users"
          color="primary"
          trend={{
            direction: 'up',
            value: `+${stats?.users?.newLast7Days || 0} ${t('dashboard.stats.users.newLast7Days')}`
          }}
        />

        <StatCard
          title={t('dashboard.stats.companies.title')}
          value={stats?.companies?.total || 0}
          subtitle={`${stats?.companies?.active || 0} ${t('dashboard.stats.companies.active')} (${stats?.companies?.activePercentage || 0}%)`}
          icon="heroicons:building-office-2"
          color="success"
          trend={{
            direction: 'up',
            value: `+${stats?.companies?.newLast7Days || 0} ${t('dashboard.stats.companies.newLast7Days')}`
          }}
        />

        <StatCard
          title={t('dashboard.stats.withdrawals.title')}
          value={stats?.withdrawals?.pending || 0}
          subtitle={`${stats?.withdrawals?.completed || 0} ${t('dashboard.stats.withdrawals.completed')}`}
          icon="heroicons:banknotes"
          color="warning"
        />

        <StatCard
          title={t('dashboard.stats.transactions.title')}
          value={stats?.transactions?.total || 0}
          subtitle={`${stats?.transactions?.successRate || 0}% ${t('dashboard.stats.transactions.successRate')}`}
          icon="heroicons:chart-bar"
          color="info"
        />
      </div>

      {/* Estatísticas de documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.stats.documents.pending')}
          value={stats?.documents?.pending || 0}
          subtitle={`${stats?.documents?.total || 0} ${t('dashboard.stats.documents.total')}`}
          icon="heroicons:document-check"
          color="warning"
        />

        <StatCard
          title={t('dashboard.stats.documents.approved')}
          value={stats?.documents?.approved || 0}
          subtitle={t('dashboard.stats.documents.approvedSubtitle')}
          icon="heroicons:check-circle"
          color="success"
        />

        <StatCard
          title={t('dashboard.stats.documents.rejected')}
          value={stats?.documents?.rejected || 0}
          subtitle={t('dashboard.stats.documents.rejectedSubtitle')}
          icon="heroicons:x-circle"
          color="danger"
        />

        <div className="flex items-center justify-center">
          <button
            onClick={() => router.push('/system/document-validation')}
            className="btn btn-outline-primary w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 hover:bg-primary-500 hover:text-white transition-all"
          >
            <Icon icon="heroicons:arrow-right-circle" className="w-8 h-8" />
            <span className="text-sm font-medium">{t('dashboard.stats.documents.viewAll')}</span>
          </button>
        </div>
      </div>

      {/* Gráfico e métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card title={t('dashboard.stats.transactions.chartTitle')} subtitle={t('dashboard.stats.transactions.chartSubtitle')}>
            <div className="legend-ring">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={350}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title={t('dashboard.stats.transactions.statusTitle')} bodyClass="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success-500"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.stats.transactions.confirmed')}</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {stats?.transactions?.confirmed || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-warning-500"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.stats.transactions.pending')}</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {stats?.transactions?.pending || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-danger-500"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.stats.transactions.failed')}</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {stats?.transactions?.failed || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card title={t('dashboard.stats.performance.title')} bodyClass="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.stats.performance.transactionSuccessRate')}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {stats?.performance?.transactionSuccessRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.performance?.transactionSuccessRate || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.stats.performance.withdrawalSuccessRate')}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {stats?.performance?.withdrawalSuccessRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-info-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.performance?.withdrawalSuccessRate || 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{t('dashboard.stats.performance.avgTransactionsPerDay')}</span>
                  <span className="text-lg font-medium text-slate-900 dark:text-white">
                    {stats?.performance?.avgTransactionsPerDay || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Detalhes adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card title={t('dashboard.stats.withdrawals.summaryTitle')} bodyClass="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.withdrawals.total')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.withdrawals?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.withdrawals.pending')}</span>
              <span className="font-medium text-warning-500">
                {stats?.withdrawals?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.withdrawals.completed')}</span>
              <span className="font-medium text-success-500">
                {stats?.withdrawals?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.withdrawals.last7Days')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.withdrawals?.last7Days || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card title={t('dashboard.stats.users.summaryTitle')} bodyClass="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.users.total')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.users?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.users.activeLabel')}</span>
              <span className="font-medium text-success-500">
                {stats?.users?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.users.inactive')}</span>
              <span className="font-medium text-slate-500">
                {stats?.users?.inactive || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.users.new7days')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.users?.newLast7Days || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card title={t('dashboard.stats.companies.summaryTitle')} bodyClass="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.companies.total')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.companies?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.companies.activeLabel')}</span>
              <span className="font-medium text-success-500">
                {stats?.companies?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.companies.inactive')}</span>
              <span className="font-medium text-slate-500">
                {stats?.companies?.inactive || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300">{t('dashboard.stats.companies.new7days')}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats?.companies?.newLast7Days || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Última atualização */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t('dashboard.lastUpdate')} {stats?.timestamp ? new Date(stats.timestamp).toLocaleString('pt-BR') : '-'}
        <button
          onClick={fetchAdminStats}
          className="ml-3 text-primary-500 hover:text-primary-600 inline-flex items-center gap-1"
        >
          <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
          {t('dashboard.updateButton')}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

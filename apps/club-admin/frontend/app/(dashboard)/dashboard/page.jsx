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
        console.log('📊 Stats received:', response.data);
        console.log('📈 Chart data:', response.data.transactions?.chartData);
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

  console.log('🎨 Rendering with stats:', stats);
  console.log('📊 Chart condition check:', {
    hasStats: !!stats,
    hasTransactions: !!stats?.transactions,
    hasChartData: !!stats?.transactions?.chartData,
    isArray: Array.isArray(stats?.transactions?.chartData),
    length: stats?.transactions?.chartData?.length
  });

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
          value={`R$ ${Number(stats?.financial?.totalVolume || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`R$ ${Number(stats?.financial?.volume30d || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} últimos 30 dias`}
          icon="heroicons:banknotes"
          color="success"
        />

        <StatCard
          title="Cashback Distribuído"
          value={`R$ ${Number(stats?.financial?.totalCashback || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`R$ ${Number(stats?.financial?.cashback30d || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} últimos 30 dias`}
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
          value={`R$ ${Number(stats?.financial?.avgTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Por transação"
          icon="heroicons:currency-dollar"
          color="primary"
        />
      </div>

      {/* Gráfico e Status de Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card title="Transações dos Últimos 30 Dias" subtitle="Evolução diária de transações">
            {stats?.transactions?.chartData && Array.isArray(stats.transactions.chartData) && stats.transactions.chartData.length > 0 ? (
              <div className="p-6">
                <div className="relative">
                  {/* Grid de fundo */}
                  <div className="absolute inset-0 flex flex-col justify-between h-[300px] pointer-events-none">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="border-t border-slate-200 dark:border-slate-700 opacity-50"></div>
                    ))}
                  </div>

                  {/* Gráfico de linha */}
                  <svg className="w-full h-[300px]" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet">
                    {(() => {
                      const chartData = stats.transactions.chartData;
                      const maxCount = Math.max(...chartData.map(d => d.count || 0), 1);
                      const padding = 20;
                      const width = 1000;
                      const height = 300;
                      const stepX = (width - padding * 2) / (chartData.length - 1);

                      // Criar pontos da linha
                      const points = chartData.map((item, index) => {
                        const x = padding + index * stepX;
                        const y = height - padding - ((item.count / maxCount) * (height - padding * 2));
                        return { x, y, count: item.count, date: item.date, index };
                      });

                      // Path da linha
                      const linePath = points.map((point, i) =>
                        `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                      ).join(' ');

                      // Path da área preenchida
                      const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

                      return (
                        <>
                          {/* Área preenchida (gradiente) */}
                          <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          <path
                            d={areaPath}
                            fill="url(#areaGradient)"
                          />

                          {/* Linha principal */}
                          <path
                            d={linePath}
                            fill="none"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Pontos interativos */}
                          {points.map((point) => (
                            <g key={`point-${point.index}`} className="group cursor-pointer">
                              {/* Círculo externo (hover) */}
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="12"
                                fill="rgb(59, 130, 246)"
                                opacity="0"
                                className="group-hover:opacity-20 transition-opacity"
                              />
                              {/* Círculo principal */}
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="rgb(59, 130, 246)"
                                stroke="white"
                                strokeWidth="2"
                                className="group-hover:r-6 transition-all"
                              />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Tooltips em HTML */}
                  <div className="absolute inset-0 flex h-[300px]">
                    {stats.transactions.chartData.map((item, index) => {
                      const date = new Date(item.date);

                      return (
                        <div
                          key={`tooltip-${index}`}
                          className="flex-1 relative group cursor-pointer pointer-events-auto"
                        >
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-30 shadow-xl">
                            <div className="font-bold text-sm mb-0.5">{item.count} {item.count === 1 ? 'transação' : 'transações'}</div>
                            <div className="text-slate-300 text-[10px]">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                            {/* Seta */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Labels de dias */}
                  <div className="flex justify-between mt-4">
                    {stats.transactions.chartData.map((item, index) => {
                      if (index % 5 !== 0) return <div key={index} className="flex-1"></div>;
                      const date = new Date(item.date);
                      return (
                        <div key={index} className="flex-1 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {date.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                  Últimos 30 dias · Total: {stats.transactions.total} transações
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[350px]">
                <div className="text-center">
                  <Icon icon="heroicons:chart-bar" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">Sem transações ainda</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                    O gráfico aparecerá quando houver dados
                  </p>
                </div>
              </div>
            )}
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

      {/* Rankings - Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Comerciantes */}
        <Card title="🏆 Top Comerciantes" subtitle="Por volume de vendas">
          <div className="p-4 space-y-3">
            {stats?.rankings?.topMerchants && stats.rankings.topMerchants.length > 0 ? (
              stats.rankings.topMerchants.map((merchant, index) => (
                <div key={merchant.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  {/* Posição */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                    'bg-amber-700 text-white'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 text-sm font-medium">
                      {merchant.firstName?.charAt(0)}{merchant.lastName?.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {merchant.firstName} {merchant.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {merchant.transactionCount} {merchant.transactionCount === 1 ? 'venda' : 'vendas'}
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-success-600">
                      R$ {Number(merchant.totalSales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Icon icon="heroicons:building-storefront" className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Nenhum comerciante ainda</p>
              </div>
            )}
          </div>
        </Card>

        {/* Top Membros */}
        <Card title="🏆 Top Membros" subtitle="Por volume de compras">
          <div className="p-4 space-y-3">
            {stats?.rankings?.topMembers && stats.rankings.topMembers.length > 0 ? (
              stats.rankings.topMembers.map((member, index) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  {/* Posição */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                    'bg-amber-700 text-white'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 text-sm font-medium">
                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {member.transactionCount} {member.transactionCount === 1 ? 'compra' : 'compras'} ·
                      <span className="text-success-600 ml-1">
                        R$ {Number(member.totalCashback || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cashback
                      </span>
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">
                      R$ {Number(member.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Icon icon="heroicons:users" className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Nenhum membro ainda</p>
              </div>
            )}
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

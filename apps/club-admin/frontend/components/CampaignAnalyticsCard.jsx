/**
 * Card de Analytics para Campanhas de Push Notification
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Eye,
  MousePointer,
  Users,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function CampaignAnalyticsCard({ campaignId }) {
  const { getAuthHeaders } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      fetchAnalytics();
    }
  }, [campaignId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/campaigns/${campaignId}`,
        { headers: getAuthHeaders() }
      );

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <Activity size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Não há dados de analytics disponíveis</p>
      </div>
    );
  }

  const { metrics, trends } = analytics;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Enviados</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalSent.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={18} className="text-green-600" />
            <span className="text-xs font-medium text-green-900">Abertos</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{metrics.totalOpened.toLocaleString()}</p>
          <p className="text-xs text-green-700 mt-1">{metrics.openRate}% taxa</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer size={18} className="text-purple-600" />
            <span className="text-xs font-medium text-purple-900">Cliques</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{metrics.totalClicked.toLocaleString()}</p>
          <p className="text-xs text-purple-700 mt-1">{metrics.clickRate}% taxa</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-orange-600" />
            <span className="text-xs font-medium text-orange-900">CTR</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{metrics.clickThroughRate}%</p>
          <p className="text-xs text-orange-700 mt-1">Click-through rate</p>
        </div>
      </div>

      {/* Trends Charts */}
      {(trends.opensByDay.length > 0 || trends.clicksByDay.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opens Trend */}
          {trends.opensByDay.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye size={16} className="text-green-600" />
                Aberturas nos Últimos 7 Dias
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trends.opensByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                    name="Aberturas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Clicks Trend */}
          {trends.clicksByDay.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MousePointer size={16} className="text-purple-600" />
                Cliques nos Últimos 7 Dias
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trends.clicksByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Cliques"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={16} />
          Insights de Performance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Taxa de Abertura</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(metrics.openRate, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.openRate}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.openRate >= 20 ? '✅ Excelente' : metrics.openRate >= 10 ? '⚠️ Bom' : '❌ Baixo'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Taxa de Cliques</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(metrics.clickRate, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.clickRate}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.clickRate >= 5 ? '✅ Excelente' : metrics.clickRate >= 2 ? '⚠️ Bom' : '❌ Baixo'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">CTR (Click-through Rate)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(metrics.clickThroughRate, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.clickThroughRate}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.clickThroughRate >= 25 ? '✅ Excelente' : metrics.clickThroughRate >= 15 ? '⚠️ Bom' : '❌ Baixo'}
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Status</p>
            <p className="font-semibold text-gray-900">{analytics.campaign.status}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Criada em</p>
            <p className="font-semibold text-gray-900">
              {new Date(analytics.campaign.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {analytics.campaign.completedAt && (
            <div>
              <p className="text-gray-600 mb-1">Concluída em</p>
              <p className="font-semibold text-gray-900">
                {new Date(analytics.campaign.completedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-600 mb-1">Engajamento Total</p>
            <p className="font-semibold text-gray-900">
              {((metrics.totalOpened + metrics.totalClicked) / metrics.totalSent * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

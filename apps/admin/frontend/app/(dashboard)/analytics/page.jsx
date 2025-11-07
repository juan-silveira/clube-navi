'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Activity,
  Users,
  MousePointer,
  Eye,
  TrendingUp,
  Calendar,
  Download,
  RefreshCcw,
  Smartphone,
  Monitor,
  Globe,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '@/components/ui/Card';

export default function AnalyticsPage() {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'all':
          startDate = null;
          break;
      }

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());

      const [statsRes, eventsRes, sessionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/stats?${params}`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/events?${params}&limit=100`, { headers: getAuthHeaders() }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/sessions?${params}&limit=50`, { headers: getAuthHeaders() })
      ]);

      const statsData = await statsRes.json();
      const eventsData = await eventsRes.json();
      const sessionsData = await sessionsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (eventsData.success) setEvents(eventsData.data.events);
      if (sessionsData.success) setSessions(sessionsData.data.sessions);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast.error('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCcw className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics da Plataforma</h1>
        <p className="text-gray-600">Acompanhe o comportamento e engajamento dos usuários</p>
      </div>

      {/* Time Range Filter */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { value: '24h', label: 'Últimas 24h' },
              { value: '7d', label: 'Últimos 7 dias' },
              { value: '30d', label: 'Últimos 30 dias' },
              { value: 'all', label: 'Todo período' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCcw size={16} />
            Atualizar
          </button>
        </div>
      </Card>

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  +12%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalEvents.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">Total de Eventos</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  +8%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.uniqueUsers.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">Usuários Únicos</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <MousePointer className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  +15%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.eventsByType.find(e => e.type === 'click')?.count || 0}
              </h3>
              <p className="text-sm text-gray-600">Total de Cliques</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  +5%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.eventsByType.find(e => e.type === 'page_view')?.count || 0}
              </h3>
              <p className="text-sm text-gray-600">Visualizações</p>
            </Card>
          </div>

          {/* Events by Type */}
          <Card title="Tipos de Eventos">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stats.eventsByType.map((event, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{event.type}</p>
                  <p className="text-2xl font-bold text-gray-900">{event.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Pages */}
          <Card title="Páginas Mais Visitadas">
            <div className="space-y-3">
              {stats.topPages.slice(0, 10).map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{page.path || 'Homepage'}</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{page.views} views</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Sessions */}
          <Card title="Sessões Recentes">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plataforma</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Páginas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.slice(0, 10).map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {session.user ? `${session.user.firstName} ${session.user.lastName}` : 'Anônimo'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          {session.platform === 'web' && <Monitor size={14} />}
                          {(session.platform === 'ios' || session.platform === 'android') && <Smartphone size={14} />}
                          {session.platform || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : 'Em andamento'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{session.pageViews}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(session.startedAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Events */}
          <Card title="Eventos Recentes">
            <div className="space-y-3">
              {events.slice(0, 15).map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {event.eventType === 'click' && <MousePointer size={16} className="text-blue-600" />}
                    {event.eventType === 'page_view' && <Eye size={16} className="text-green-600" />}
                    {event.eventType === 'purchase' && <Activity size={16} className="text-purple-600" />}
                    {event.eventType === 'search' && <Globe size={16} className="text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{event.eventName}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(event.createdAt).toLocaleString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {event.user ? `${event.user.firstName} ${event.user.lastName}` : 'Usuário anônimo'}
                      {event.pagePath && ` • ${event.pagePath}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

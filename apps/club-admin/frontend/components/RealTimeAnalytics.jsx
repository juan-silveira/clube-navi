/**
 * Widget de Analytics em Tempo Real
 * Mostra eventos acontecendo na plataforma em tempo real
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Activity,
  Users,
  MousePointer,
  Eye,
  TrendingUp,
  Circle
} from 'lucide-react';

export default function RealTimeAnalytics() {
  const { getAuthHeaders } = useAuth();
  const [recentEvents, setRecentEvents] = useState([]);
  const [stats, setStats] = useState({
    activeUsers: 0,
    eventsLastMinute: 0,
    pageViewsLastMinute: 0,
    clicksLastMinute: 0
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchRecentEvents();

    // Atualizar a cada 5 segundos
    intervalRef.current = setInterval(fetchRecentEvents, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchRecentEvents = async () => {
    try {
      // Buscar eventos dos últimos 60 segundos
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const now = new Date().toISOString();

      const [eventsRes, sessionsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/events?startDate=${oneMinuteAgo}&endDate=${now}&limit=20`,
          { headers: getAuthHeaders() }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/sessions?startDate=${oneMinuteAgo}&endDate=${now}`,
          { headers: getAuthHeaders() }
        )
      ]);

      const eventsData = await eventsRes.json();
      const sessionsData = await sessionsRes.json();

      if (eventsData.success) {
        const events = eventsData.data.events;
        setRecentEvents(events.slice(0, 10));

        // Calcular estatísticas
        setStats({
          activeUsers: sessionsData.success ? sessionsData.data.sessions.length : 0,
          eventsLastMinute: events.length,
          pageViewsLastMinute: events.filter(e => e.eventType === 'page_view').length,
          clicksLastMinute: events.filter(e => e.eventType === 'click').length
        });
      }
    } catch (error) {
      console.error('Erro ao buscar eventos recentes:', error);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'page_view':
        return <Eye size={14} className="text-blue-600" />;
      case 'click':
        return <MousePointer size={14} className="text-green-600" />;
      case 'purchase':
        return <TrendingUp size={14} className="text-purple-600" />;
      default:
        return <Activity size={14} className="text-gray-600" />;
    }
  };

  const getTimeDiff = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 10) return 'agora';
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m atrás`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle size={8} className="text-green-500 fill-green-500 animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900">
              Analytics em Tempo Real
            </h3>
          </div>
          <span className="text-xs text-gray-500">Atualiza a cada 5s</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={16} className="text-green-600" />
            <span className="text-xs text-gray-600">Ativos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity size={16} className="text-blue-600" />
            <span className="text-xs text-gray-600">Eventos/min</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.eventsLastMinute}</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye size={16} className="text-purple-600" />
            <span className="text-xs text-gray-600">Views/min</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pageViewsLastMinute}</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MousePointer size={16} className="text-orange-600" />
            <span className="text-xs text-gray-600">Cliques/min</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.clicksLastMinute}</p>
        </div>
      </div>

      {/* Event Stream */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Eventos Recentes
        </h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aguardando eventos...</p>
            </div>
          ) : (
            recentEvents.map((event, index) => (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-2 rounded-lg transition-all ${
                  index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
                style={{
                  animation: index === 0 ? 'slideIn 0.3s ease-out' : 'none'
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {event.eventName}
                    </p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {getTimeDiff(event.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {event.user && (
                      <span className="truncate">
                        {event.user.firstName} {event.user.lastName}
                      </span>
                    )}
                    {event.pagePath && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="truncate">{event.pagePath}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

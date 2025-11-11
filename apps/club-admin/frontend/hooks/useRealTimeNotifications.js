import { useEffect } from 'react';
import { useNotificationEvents } from '@/contexts/NotificationContext';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';

/**
 * Hook para conectar com notificações em tempo real
 * Por enquanto simula via polling, mas pode ser expandido para WebSocket
 */
export const useRealTimeNotifications = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { notifyNewNotification, notifyBatchNotifications } = useNotificationEvents();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let pollInterval;

    // Intervalos otimizados para reduzir requests (50% menos frequência)
    const getNotificationInterval = (userPlan) => {
      switch (userPlan) {
        case 'PREMIUM': return 30000;  // 30 segundos para usuários premium (reduzido de 15s)
        case 'PRO': return 60000;      // 60 segundos para usuários pro (reduzido de 30s)
        case 'BASIC':
        default: return 120000;        // 120 segundos para usuários básicos (reduzido de 60s)
      }
    };

    // Simular conexão de notificações em tempo real
    // Futuramente pode ser substituído por WebSocket
    const connectToNotifications = () => {
      const interval = getNotificationInterval(user?.userPlan);
      // console.log(`🔌 Conectando ao sistema de notificações (${user?.userPlan}: ${interval/1000}s)...`);
      
      let lastNotificationCount = 0;
      
      // Cache local para reduzir requests desnecessárias (mas permitir detecção)
      let lastApiCall = 0;
      const API_CACHE_TTL = 15000; // 15 segundos de cache (reduzido para melhor detecção)
      
      // Polling otimizado - apenas 1 request por ciclo ao invés de 2
      pollInterval = setInterval(async () => {
        try {
          const now = Date.now();
          
          // Rate limiting inteligente: pular apenas se cache muito recente (5s no mínimo)
          if (now - lastApiCall < 5000) {
            return;
          }
          
          // OTIMIZAÇÃO CRÍTICA: Apenas 1 request - buscar diretamente notificações
          const response = await api.get('/api/notifications/unread?limit=10');
          
          if (response.data.success) {
            const notifications = response.data.data || [];
            const currentCount = notifications.length;
            
            // Atualizar cache
            lastApiCall = now;
            
            // Se houve aumento na contagem, processar as novas notificações
            if (currentCount > lastNotificationCount && lastNotificationCount >= 0) {
              const tolerance = Math.max(interval / 1000 * 2, 60); // Tolerância dinâmica (mínimo 60s)
              const recentNotifications = notifications.filter(notification => {
                const notificationTime = new Date(notification.createdAt);
                const now = new Date();
                const diffInSeconds = (now - notificationTime) / 1000;
                return diffInSeconds <= tolerance;
              });
              
              if (recentNotifications.length > 0) {
                if (recentNotifications.length === 1) {
                  // Uma única notificação
                  notifyNewNotification(recentNotifications[0]);
                } else {
                  // Múltiplas notificações (batch) - tocar som apenas 1x
                  notifyBatchNotifications(recentNotifications);
                }
              }
            }
            
            lastNotificationCount = currentCount;
          }
        } catch (error) {
          // Rate limiting detectado - pausar temporariamente
          if (error.response?.status === 429) {
            console.warn('⚠️ Rate limit detectado, pausando notificações por 3 minutos');
            clearInterval(pollInterval);
            setTimeout(() => {
              if (isAuthenticated && user) {
                connectToNotifications(); // Reconectar após pausa
              }
            }, 180000); // 3 minutos
            return;
          }
          console.warn('⚠️ Erro no polling de notificações:', error.message);
        }
      }, interval);
    };

    // Conectar após um delay para não sobrecarregar no login
    const connectTimeout = setTimeout(connectToNotifications, 5000);

    return () => {
      clearTimeout(connectTimeout);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      // console.log('🔌 Desconectando do sistema de notificações em tempo real...');
    };
  }, [isAuthenticated, user]);

  // Função para simular nova notificação (para debug)
  const simulateNotification = (notification) => {
    console.log('🧪 Simulando nova notificação:', notification);
    notifyNewNotification(notification);
  };

  // Função para simular batch de notificações (para debug)
  const simulateBatchNotifications = (notifications) => {
    console.log('🧪 Simulando batch de notificações:', notifications);
    notifyBatchNotifications(notifications);
  };

  // Função para testar som diretamente
  const testNotificationSound = () => {
    // Simular uma notificação de teste com som
    const testNotification = {
      id: 'test-' + Date.now(),
      title: '🧪 Teste de Som',
      message: 'Esta é uma notificação de teste para o som!',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    simulateNotification(testNotification);
  };

  return {
    simulateNotification,
    simulateBatchNotifications,
    testNotificationSound
  };
};

export default useRealTimeNotifications;
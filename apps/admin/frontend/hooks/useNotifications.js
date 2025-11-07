import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';

export const useNotifications = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Buscar contagem de não lidas
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    // Super admins não têm notificações
    if (user?.email?.includes('@clubedigital.com')) {
      setUnreadCount(0);
      return 0;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/notifications/unread-count');

      if (response.data.success) {
        const count = response.data.data.count;
        setUnreadCount(count);
        return count;
      }
    } catch (error) {
      // Fallback para contagem local
      const localCount = 0;
      setUnreadCount(localCount);
      return localCount;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Atualizar a cada 30 segundos
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Enviar notificação para usuário específico
  const sendNotification = useCallback(async (userId, notification) => {
    console.log('🔍 useNotifications.sendNotification called');
    console.log('🔍 Parameters:', { userId, notification, isAuthenticated });
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated');
      throw new Error('Usuário não autenticado');
    }
    
    try {
      setLoading(true);
      console.log('📤 Making API call to /api/notifications/send');
      
      const requestData = {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info', // info, success, warning, error
        priority: notification.priority || 'normal', // low, normal, high, urgent
        category: notification.category || 'general',
        metadata: notification.metadata || {}
      };
      
      console.log('🔍 Request data:', requestData);
      
      const response = await api.post('/api/notifications/send', requestData);
      
      console.log('✅ API response:', response);
      console.log('🔍 Response data:', response.data);
      
      if (response.data.success) {
        console.log('✅ Notification sent successfully:', response.data.data);
        return response.data.data;
      } else {
        console.log('❌ API returned success: false');
        throw new Error(response.data.message || 'Erro ao enviar notificação');
      }
    } catch (error) {
      console.error('❌ Error in sendNotification:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Enviar notificação em massa para múltiplos usuários
  const sendBulkNotification = useCallback(async (userIds, notification) => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      setLoading(true);
      const response = await api.post('/api/notifications/send-bulk', {
        userIds,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        priority: notification.priority || 'normal',
        category: notification.category || 'general',
        metadata: notification.metadata || {}
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erro ao enviar notificações');
      }
    } catch (error) {
      console.error('Erro ao enviar notificações em massa:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        // Atualizar contagem local
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }, [isAuthenticated]);

  // Buscar todas as notificações do usuário
  const fetchNotifications = useCallback(async (options = {}) => {
    if (!isAuthenticated) return [];
    
    try {
      setLoading(true);
      const params = {
        page: options.page || 1,
        limit: options.limit || 10,
        type: options.type,
        category: options.category,
        read: options.read,
        priority: options.priority
      };
      
      const response = await api.get('/api/notifications', { params });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    unreadCount,
    loading,
    fetchUnreadCount,
    sendNotification,
    sendBulkNotification,
    markAsRead,
    fetchNotifications
  };
};


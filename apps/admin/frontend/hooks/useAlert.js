import { useState, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Hook para gerenciar alerts usando o sistema nativo do tema
 */
const useAlert = () => {
  const { t } = useTranslation('common');
  const [alerts, setAlerts] = useState([]);

  // Adicionar um novo alert
  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      type: 'info', // success, danger, warning, info, primary, secondary
      title: '',
      message: '',
      dismissible: true,
      autoClose: 5000, // Auto-close após 5 segundos
      hideProgressBar: false,
      pauseOnHover: true,
      ...alert
    };

    setAlerts(prev => [...prev, newAlert]);

    return id;
  }, []);

  // Remover alert específico
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Limpar todos os alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Funções de conveniência
  const showSuccess = useCallback((message, title) => {
    return addAlert({
      type: 'success',
      title: title || t('alerts.success'),
      message,
      icon: 'heroicons-outline:check-circle'
    });
  }, [addAlert, t]);

  const showError = useCallback((message, title) => {
    return addAlert({
      type: 'danger',
      title: title || t('alerts.error'),
      message,
      icon: 'heroicons-outline:x-circle',
      autoClose: 8000 // Erros ficam mais tempo na tela
    });
  }, [addAlert, t]);

  const showWarning = useCallback((message, title) => {
    return addAlert({
      type: 'warning',
      title: title || t('alerts.warning'),
      message,
      icon: 'heroicons-outline:exclamation-triangle'
    });
  }, [addAlert, t]);

  const showInfo = useCallback((message, title) => {
    return addAlert({
      type: 'info',
      title: title || t('alerts.info'),
      message,
      icon: 'heroicons-outline:information-circle'
    });
  }, [addAlert, t]);

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useAlert;
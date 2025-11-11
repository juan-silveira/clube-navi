import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '@/store/authStore';

// Hook simplificado para club-admin
// No sistema club-admin não existe conceito de múltiplas empresas
// Cada subdomínio representa um clube único
const useCurrentCompany = () => {
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(false); // Sempre false pois não precisa carregar
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuthStore();

  const fetchCurrentCompany = useCallback(async () => {
    // No club-admin, não precisa buscar empresa
    // O clube já está definido pelo subdomínio
    setCurrentCompany(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentCompany();
    }
  }, [isAuthenticated, fetchCurrentCompany]);

  const refreshCurrentCompany = useCallback(() => {
    // Noop - não faz nada no club-admin
  }, []);

  return {
    currentCompany: null, // Sempre null no club-admin
    loading: false,
    error: null,
    refreshCurrentCompany
  };
};

export default useCurrentCompany;

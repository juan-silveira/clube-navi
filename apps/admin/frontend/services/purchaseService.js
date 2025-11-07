import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8033';
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'clube-navi';

// Criar instância do axios com configuração base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT_SLUG,
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const purchaseService = {
  /**
   * Obter estatísticas de compras
   */
  async getPurchaseStats() {
    try {
      const response = await api.get('/api/purchases/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting purchase stats:', error);
      // Retornar dados mock em caso de erro
      return {
        success: true,
        data: {
          total: 0,
          pending: 0,
          confirmed: 0,
          totalAmount: 0,
        },
      };
    }
  },
};

export default purchaseService;

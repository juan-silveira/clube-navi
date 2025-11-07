import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8033';
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'clube-navi';

// Criar instância do axios com configuração base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Club-Slug': TENANT_SLUG,
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

const merchantService = {
  /**
   * Lista todos os merchants
   */
  async listMerchants(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('merchantStatus', params.status);
      if (params.search) queryParams.append('search', params.search);

      const url = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);

      // Filtrar apenas merchants
      if (response.data.success && response.data.data) {
        const merchants = Array.isArray(response.data.data)
          ? response.data.data.filter((user) => user.userType === 'merchant')
          : response.data.data.users
          ? response.data.data.users.filter((user) => user.userType === 'merchant')
          : [];

        return {
          ...response.data,
          data: {
            ...response.data.data,
            merchants,
            users: merchants,
          },
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error listing merchants:', error);
      throw error;
    }
  },

  /**
   * Busca merchant por ID
   */
  async getMerchantById(id) {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting merchant:', error);
      throw error;
    }
  },

  /**
   * Aprova um merchant
   */
  async approveMerchant(id) {
    try {
      const response = await api.patch(`/api/users/${id}/merchant-status`, {
        merchantStatus: 'approved',
        isActive: true,
        emailConfirmed: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving merchant:', error);
      throw error;
    }
  },

  /**
   * Rejeita um merchant
   */
  async rejectMerchant(id, reason = '') {
    try {
      const response = await api.patch(`/api/users/${id}/merchant-status`, {
        merchantStatus: 'rejected',
        isActive: false,
        rejectionReason: reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting merchant:', error);
      throw error;
    }
  },

  /**
   * Ativa/Desativa merchant
   */
  async toggleMerchantStatus(id, isActive) {
    try {
      const response = await api.patch(`/api/users/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling merchant status:', error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas de merchants
   */
  async getMerchantStats() {
    try {
      const response = await api.get('/api/users/merchants/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting merchant stats:', error);
      // Retornar dados mock em caso de erro
      return {
        success: true,
        data: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      };
    }
  },

  /**
   * Obtém produtos de um merchant
   */
  async getMerchantProducts(merchantId) {
    try {
      const response = await api.get(`/api/products?merchantId=${merchantId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting merchant products:', error);
      throw error;
    }
  },
};

export default merchantService;

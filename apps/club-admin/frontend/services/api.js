import axios from 'axios';
import { getClubSlugForAPI } from '@/utils/subdomain';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token e club slug em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação
    const token = localStorage.getItem('club_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar slug do clube
    const clubSlug = getClubSlugForAPI();
    if (clubSlug) {
      config.headers['X-Club-Slug'] = clubSlug;
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
      // Token inválido ou expirado
      localStorage.removeItem('club_admin_token');
      localStorage.removeItem('club_admin_user');
      window.location.href = '/auth/login';
    }

    if (error.response?.status === 403) {
      // Sem permissão
      console.error('❌ Acesso negado:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================
export const authService = {
  /**
   * Login de club admin
   */
  login: async (email, password) => {
    const response = await api.post('/api/club-admin/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await api.post('/api/club-admin/auth/logout');
    return response.data;
  },

  /**
   * Obter dados do usuário autenticado
   */
  me: async () => {
    const response = await api.get('/api/club-admin/auth/me');
    return response.data;
  },

  /**
   * Atualizar senha
   */
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/club-admin/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ============================================================================
// CLUB INFO SERVICE
// ============================================================================
export const clubService = {
  /**
   * Obter informações do clube
   */
  getInfo: async () => {
    const response = await api.get('/api/club-admin/club-info');
    return response.data;
  },

  /**
   * Atualizar configurações do clube
   */
  updateSettings: async (settings) => {
    const response = await api.put('/api/club-admin/club-settings', settings);
    return response.data;
  },

  /**
   * Obter estatísticas do clube
   */
  getStats: async () => {
    const response = await api.get('/api/club-admin/club-stats');
    return response.data;
  },
};

// ============================================================================
// USERS SERVICE
// ============================================================================
export const usersService = {
  /**
   * Listar usuários do clube
   */
  list: async (params = {}) => {
    const response = await api.get('/api/club-admin/users', { params });
    return response.data;
  },

  /**
   * Obter usuário por ID
   */
  getById: async (userId) => {
    const response = await api.get(`/api/club-admin/users/${userId}`);
    return response.data;
  },

  /**
   * Obter estatísticas de usuários
   */
  getStats: async () => {
    const response = await api.get('/api/club-admin/users/stats');
    return response.data;
  },

  /**
   * Atualizar status do usuário
   */
  updateStatus: async (userId, isActive) => {
    const response = await api.patch(`/api/club-admin/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  },
};

// ============================================================================
// TRANSACTIONS SERVICE
// ============================================================================
export const transactionsService = {
  /**
   * Listar transações
   */
  list: async (params = {}) => {
    const response = await api.get('/api/club-admin/transactions', { params });
    return response.data;
  },

  /**
   * Obter estatísticas de transações
   */
  getStats: async (params = {}) => {
    const response = await api.get('/api/club-admin/transactions/stats', { params });
    return response.data;
  },

  /**
   * Obter detalhes de transação
   */
  getById: async (txId) => {
    const response = await api.get(`/api/club-admin/transactions/${txId}`);
    return response.data;
  },
};

// ============================================================================
// GROUPS SERVICE
// ============================================================================
export const groupsService = {
  /**
   * Listar grupos
   */
  list: async (params = {}) => {
    const response = await api.get('/api/club-admin/groups', { params });
    return response.data;
  },

  /**
   * Criar grupo
   */
  create: async (data) => {
    const response = await api.post('/api/club-admin/groups', data);
    return response.data;
  },

  /**
   * Atualizar grupo
   */
  update: async (groupId, data) => {
    const response = await api.put(`/api/club-admin/groups/${groupId}`, data);
    return response.data;
  },

  /**
   * Deletar grupo
   */
  delete: async (groupId) => {
    const response = await api.delete(`/api/club-admin/groups/${groupId}`);
    return response.data;
  },
};

// ============================================================================
// PRODUCTS SERVICE
// ============================================================================
export const productsService = {
  /**
   * Listar produtos
   */
  list: async (params = {}) => {
    const response = await api.get('/api/club-admin/products', { params });
    return response.data;
  },

  /**
   * Criar produto
   */
  create: async (data) => {
    const response = await api.post('/api/club-admin/products', data);
    return response.data;
  },

  /**
   * Atualizar produto
   */
  update: async (productId, data) => {
    const response = await api.put(`/api/club-admin/products/${productId}`, data);
    return response.data;
  },

  /**
   * Deletar produto
   */
  delete: async (productId) => {
    const response = await api.delete(`/api/club-admin/products/${productId}`);
    return response.data;
  },

  /**
   * Atualizar status do produto
   */
  updateStatus: async (productId, status) => {
    const response = await api.patch(`/api/club-admin/products/${productId}/status`, {
      status,
    });
    return response.data;
  },
};

export default api;

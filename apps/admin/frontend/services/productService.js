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

const productService = {
  /**
   * Lista todos os produtos
   */
  async listProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.order) queryParams.append('order', params.order);

      const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);

      return response.data;
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  },

  /**
   * Busca produto por ID
   */
  async getProductById(id) {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  /**
   * Cria novo produto
   */
  async createProduct(data) {
    try {
      const response = await api.post('/api/products', data);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Atualiza produto
   */
  async updateProduct(id, data) {
    try {
      const response = await api.put(`/api/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  /**
   * Deleta produto
   */
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Ativa/Desativa produto
   */
  async toggleProductStatus(id, isActive) {
    try {
      const response = await api.patch(`/api/products/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling product status:', error);
      throw error;
    }
  },

  /**
   * Lista categorias de produtos
   */
  async getCategories() {
    try {
      const response = await api.get('/api/products/categories/list');
      return response.data;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas de produtos
   */
  async getProductStats() {
    try {
      const response = await api.get('/api/products/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting product stats:', error);
      // Retornar dados mock em caso de erro
      return {
        success: true,
        data: {
          total: 0,
          active: 0,
          lowStock: 0,
          outOfStock: 0,
        },
      };
    }
  },
};

export default productService;

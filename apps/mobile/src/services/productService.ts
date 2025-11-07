/**
 * Product Service
 *
 * Service para gerenciar produtos e marketplace
 */

import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  Product,
  ProductsListParams,
  ProductsListResponse,
  ProductResponse,
  CategoriesResponse,
  FeaturedProductsParams,
  FeaturedProductsResponse,
} from '@/types/product';

class ProductService {
  /**
   * Lista produtos com filtros e paginação
   */
  async listProducts(params?: ProductsListParams): Promise<ProductsListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.order) queryParams.append('order', params.order);

      const url = `${API_ENDPOINTS.PRODUCTS}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      return await apiService.get<ProductsListResponse['data']>(url);
    } catch (error) {
      console.error('Error listing products:', error);
      return {
        success: false,
        error: 'Erro ao listar produtos',
        message: 'Não foi possível carregar os produtos',
      };
    }
  }

  /**
   * Busca produto por ID
   */
  async getProductById(id: string): Promise<ProductResponse> {
    try {
      return await apiService.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
    } catch (error) {
      console.error('Error getting product:', error);
      return {
        success: false,
        error: 'Erro ao buscar produto',
        message: 'Não foi possível carregar o produto',
      };
    }
  }

  /**
   * Lista categorias de produtos
   */
  async getCategories(): Promise<CategoriesResponse> {
    try {
      return await apiService.get<string[]>(API_ENDPOINTS.PRODUCTS_CATEGORIES);
    } catch (error) {
      console.error('Error getting categories:', error);
      return {
        success: false,
        error: 'Erro ao buscar categorias',
        message: 'Não foi possível carregar as categorias',
      };
    }
  }

  /**
   * Lista produtos em destaque
   */
  async getFeaturedProducts(
    params?: FeaturedProductsParams
  ): Promise<FeaturedProductsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

      const url = `${API_ENDPOINTS.PRODUCTS_FEATURED}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      return await apiService.get<Product[]>(url);
    } catch (error) {
      console.error('Error getting featured products:', error);
      return {
        success: false,
        error: 'Erro ao buscar produtos em destaque',
        message: 'Não foi possível carregar os produtos em destaque',
      };
    }
  }

  /**
   * Busca produtos por categoria
   */
  async getProductsByCategory(
    category: string,
    params?: Omit<ProductsListParams, 'category'>
  ): Promise<ProductsListResponse> {
    return this.listProducts({
      ...params,
      category,
    });
  }

  /**
   * Busca produtos (search)
   */
  async searchProducts(
    search: string,
    params?: Omit<ProductsListParams, 'search'>
  ): Promise<ProductsListResponse> {
    return this.listProducts({
      ...params,
      search,
    });
  }
}

// Exportar instância única
export const productService = new ProductService();
export default productService;

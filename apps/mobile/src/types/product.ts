/**
 * Product Types
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cashbackPercentage: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  merchantId: string;
  merchant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'price' | 'cashback' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface ProductsListResponse {
  success: boolean;
  data?: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
  message?: string;
}

export interface ProductResponse {
  success: boolean;
  data?: Product;
  error?: string;
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data?: string[];
  error?: string;
  message?: string;
}

export interface FeaturedProductsParams {
  limit?: number;
  sortBy?: 'cashback' | 'price' | 'createdAt';
}

export interface FeaturedProductsResponse {
  success: boolean;
  data?: Product[];
  error?: string;
  message?: string;
}

/**
 * Purchase Service
 *
 * Service para gerenciar compras e transações
 */

import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  Purchase,
  CreatePurchaseData,
  CreatePurchaseResponse,
  ConfirmPurchaseData,
  PurchaseResponse,
  PurchasesListParams,
  PurchasesListResponse,
  PurchaseStatsResponse,
} from '@/types/purchase';

class PurchaseService {
  /**
   * Cria uma nova compra
   */
  async createPurchase(data: CreatePurchaseData): Promise<CreatePurchaseResponse> {
    try {
      return await apiService.post<CreatePurchaseResponse['data']>(
        API_ENDPOINTS.PURCHASES,
        data
      );
    } catch (error) {
      console.error('Error creating purchase:', error);
      return {
        success: false,
        error: 'Erro ao criar compra',
        message: 'Não foi possível processar a compra',
      };
    }
  }

  /**
   * Busca compra por ID
   */
  async getPurchaseById(id: string): Promise<PurchaseResponse> {
    try {
      return await apiService.get<Purchase>(API_ENDPOINTS.PURCHASE_BY_ID(id));
    } catch (error) {
      console.error('Error getting purchase:', error);
      return {
        success: false,
        error: 'Erro ao buscar compra',
        message: 'Não foi possível carregar a compra',
      };
    }
  }

  /**
   * Lista compras do usuário
   */
  async listPurchases(params?: PurchasesListParams): Promise<PurchasesListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = `${API_ENDPOINTS.PURCHASES}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      return await apiService.get<PurchasesListResponse['data']>(url);
    } catch (error) {
      console.error('Error listing purchases:', error);
      return {
        success: false,
        error: 'Erro ao listar compras',
        message: 'Não foi possível carregar as compras',
      };
    }
  }

  /**
   * Confirma uma compra (merchant only)
   */
  async confirmPurchase(
    id: string,
    data: ConfirmPurchaseData
  ): Promise<PurchaseResponse> {
    try {
      return await apiService.post<Purchase>(
        API_ENDPOINTS.PURCHASE_CONFIRM(id),
        data
      );
    } catch (error) {
      console.error('Error confirming purchase:', error);
      return {
        success: false,
        error: 'Erro ao confirmar compra',
        message: 'Não foi possível confirmar a compra',
      };
    }
  }

  /**
   * Obtém estatísticas de compras do usuário
   */
  async getPurchaseStats(): Promise<PurchaseStatsResponse> {
    try {
      return await apiService.get<PurchaseStatsResponse['data']>(
        API_ENDPOINTS.PURCHASE_STATS
      );
    } catch (error) {
      console.error('Error getting purchase stats:', error);
      return {
        success: false,
        error: 'Erro ao buscar estatísticas',
        message: 'Não foi possível carregar as estatísticas',
      };
    }
  }
}

// Exportar instância única
export const purchaseService = new PurchaseService();
export default purchaseService;

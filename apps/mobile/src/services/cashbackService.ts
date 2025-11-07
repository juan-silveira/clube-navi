/**
 * Cashback Service
 *
 * Service para gerenciar cashback e recompensas
 */

import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  CashbackStatsResponse,
  CashbackHistoryParams,
  CashbackHistoryResponse,
  CalculateCashbackData,
  CalculateCashbackResponse,
} from '@/types/cashback';

class CashbackService {
  /**
   * Obtém estatísticas de cashback do usuário
   */
  async getCashbackStats(): Promise<CashbackStatsResponse> {
    try {
      return await apiService.get<CashbackStatsResponse['data']>(
        API_ENDPOINTS.CASHBACK_STATS
      );
    } catch (error) {
      console.error('Error getting cashback stats:', error);
      return {
        success: false,
        error: 'Erro ao buscar estatísticas de cashback',
        message: 'Não foi possível carregar as estatísticas',
      };
    }
  }

  /**
   * Lista histórico de cashback
   */
  async getCashbackHistory(
    params?: CashbackHistoryParams
  ): Promise<CashbackHistoryResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);

      const url = `${API_ENDPOINTS.CASHBACK_HISTORY}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      return await apiService.get<CashbackHistoryResponse['data']>(url);
    } catch (error) {
      console.error('Error getting cashback history:', error);
      return {
        success: false,
        error: 'Erro ao buscar histórico de cashback',
        message: 'Não foi possível carregar o histórico',
      };
    }
  }

  /**
   * Calcula distribuição de cashback (preview)
   */
  async calculateCashback(
    data: CalculateCashbackData
  ): Promise<CalculateCashbackResponse> {
    try {
      return await apiService.post<CalculateCashbackResponse['data']>(
        API_ENDPOINTS.CASHBACK_CALCULATE,
        data
      );
    } catch (error) {
      console.error('Error calculating cashback:', error);
      return {
        success: false,
        error: 'Erro ao calcular cashback',
        message: 'Não foi possível calcular o cashback',
      };
    }
  }
}

// Exportar instância única
export const cashbackService = new CashbackService();
export default cashbackService;

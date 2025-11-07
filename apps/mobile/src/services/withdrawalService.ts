/**
 * Withdrawal Service
 *
 * Serviço para gerenciar solicitações de saque (merchants only)
 */

import apiService, { ApiResponse } from './apiService';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  pixKey: string;
  pixKeyType: PixKeyType;
  pixKeyOwnerName?: string;
  pixKeyOwnerCpf?: string;
  status: WithdrawalStatus;
  rejectionReason?: string;
  processedBy?: string;
  processedAt?: string;
  txHash?: string;
  fee: number;
  netAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantBalance {
  totalSales: number;
  totalWithdrawals: number;
  availableBalance: number;
}

export interface AllBalances {
  sales: MerchantBalance;
  cashback: {
    totalCashback: number;
    availableBalance: number;
  };
  deposit: {
    totalDeposits: number;
    availableBalance: number;
  };
  total: number;
}

export interface WithdrawalRequest {
  amount: number;
  pixKey: string;
  pixKeyType: PixKeyType;
  pixKeyOwnerName?: string;
  pixKeyOwnerCpf?: string;
}

export interface CanWithdrawResponse {
  canWithdraw: boolean;
  reason?: string;
  available?: number;
  requested?: number;
}

type WithdrawalsResponse = ApiResponse<Withdrawal[]>;
type WithdrawalResponse = ApiResponse<Withdrawal>;
type BalanceResponse = ApiResponse<MerchantBalance>;
type AllBalancesResponse = ApiResponse<AllBalances>;
type CanWithdrawCheckResponse = ApiResponse<CanWithdrawResponse>;

class WithdrawalService {
  /**
   * Lista todas as solicitações de saque do usuário
   */
  async listWithdrawals(): Promise<WithdrawalsResponse> {
    try {
      return await apiService.get<Withdrawal[]>('/api/withdrawals');
    } catch (error) {
      console.error('Error listing withdrawals:', error);
      return {
        success: false,
        message: 'Erro ao listar saques',
      };
    }
  }

  /**
   * Busca uma solicitação de saque específica
   */
  async getWithdrawal(id: string): Promise<WithdrawalResponse> {
    try {
      return await apiService.get<Withdrawal>(`/api/withdrawals/${id}`);
    } catch (error) {
      console.error('Error getting withdrawal:', error);
      return {
        success: false,
        message: 'Erro ao buscar saque',
      };
    }
  }

  /**
   * Cria uma nova solicitação de saque
   */
  async createWithdrawal(data: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      return await apiService.post<Withdrawal>('/api/withdrawals', data);
    } catch (error: any) {
      console.error('Error creating withdrawal:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Erro ao solicitar saque',
      };
    }
  }

  /**
   * Cancela uma solicitação de saque pendente
   */
  async cancelWithdrawal(id: string): Promise<WithdrawalResponse> {
    try {
      return await apiService.post<Withdrawal>(`/api/withdrawals/${id}/cancel`, {});
    } catch (error) {
      console.error('Error cancelling withdrawal:', error);
      return {
        success: false,
        message: 'Erro ao cancelar saque',
      };
    }
  }

  /**
   * Busca saldo de vendas do merchant
   */
  async getMerchantBalance(): Promise<BalanceResponse> {
    try {
      return await apiService.get<MerchantBalance>('/api/balance/merchant-sales');
    } catch (error) {
      console.error('Error getting merchant balance:', error);
      return {
        success: false,
        message: 'Erro ao buscar saldo',
      };
    }
  }

  /**
   * Busca todos os saldos do usuário
   */
  async getAllBalances(): Promise<AllBalancesResponse> {
    try {
      return await apiService.get<AllBalances>('/api/balance/all');
    } catch (error) {
      console.error('Error getting all balances:', error);
      return {
        success: false,
        message: 'Erro ao buscar saldos',
      };
    }
  }

  /**
   * Verifica se pode sacar determinado valor
   */
  async canWithdraw(amount: number): Promise<CanWithdrawCheckResponse> {
    try {
      return await apiService.post<CanWithdrawResponse>('/api/balance/can-withdraw', {
        amount,
      });
    } catch (error: any) {
      console.error('Error checking withdrawal:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Erro ao verificar saque',
      };
    }
  }

  /**
   * Valida formato de chave PIX localmente
   */
  validatePixKeyFormat(key: string, type: PixKeyType): { valid: boolean; error?: string } {
    const cleanKey = key.replace(/\D/g, '');

    switch (type) {
      case 'cpf':
        if (cleanKey.length !== 11) {
          return { valid: false, error: 'CPF deve ter 11 dígitos' };
        }
        return { valid: true };

      case 'cnpj':
        if (cleanKey.length !== 14) {
          return { valid: false, error: 'CNPJ deve ter 14 dígitos' };
        }
        return { valid: true };

      case 'phone':
        if (cleanKey.length < 10 || cleanKey.length > 11) {
          return { valid: false, error: 'Telefone inválido' };
        }
        return { valid: true };

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(key)) {
          return { valid: false, error: 'Email inválido' };
        }
        return { valid: true };

      case 'random':
        if (key.length < 32) {
          return { valid: false, error: 'Chave aleatória inválida' };
        }
        return { valid: true };

      default:
        return { valid: false, error: 'Tipo de chave inválido' };
    }
  }

  /**
   * Valida chave PIX com o servidor (consulta DICT via EFI)
   */
  async validatePixKey(
    pixKey: string,
    pixKeyType: PixKeyType
  ): Promise<{
    success: boolean;
    valid: boolean;
    holder?: {
      name: string;
      cpfCnpj: string;
      personType: string;
    };
    error?: string;
  }> {
    try {
      const response = await apiService.post<{
        valid: boolean;
        pixKey: string;
        pixKeyType: PixKeyType;
        holder?: {
          name: string;
          cpfCnpj: string;
          personType: string;
        };
      }>('/api/pix/validation/validate-key', {
        pixKey,
        pixKeyType,
      });

      if (response.success && response.data) {
        return {
          success: true,
          valid: response.data.valid,
          holder: response.data.holder,
        };
      }

      return {
        success: false,
        valid: false,
        error: response.message || 'Erro ao validar chave PIX',
      };
    } catch (error: any) {
      console.error('Error validating PIX key:', error);
      return {
        success: false,
        valid: false,
        error: error?.response?.data?.message || 'Erro ao validar chave PIX',
      };
    }
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Retorna label do status de saque
   */
  getStatusLabel(status: WithdrawalStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Em processamento';
      case 'completed':
        return 'Concluído';
      case 'rejected':
        return 'Rejeitado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  }

  /**
   * Retorna cor do status de saque
   */
  getStatusColor(status: WithdrawalStatus): string {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }
}

export default new WithdrawalService();

import { API_URL } from '@/constants/api';
import { apiService } from './api';

export interface Transaction {
  id: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'MINT' | 'BURN' | 'BUY' | 'SELL';
  status: 'pending' | 'confirmed' | 'failed';
  amount: number;
  currency: string;
  txHash: string | null;
  createdAt: string;
  confirmedAt: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  fee: number | null;
  netAmount: number | null;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
}

class TransactionsService {
  /**
   * Busca todas as transações do usuário autenticado
   */
  async getMyTransactions(): Promise<Transaction[]> {
    try {
      const token = await apiService.getAccessToken();
      if (!token) {
        console.error('No access token available');
        return [];
      }

      const response = await fetch(`${API_URL}/api/logs/me/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch transactions:', errorData);
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data: TransactionsResponse = await response.json();
      return data.success ? (data.data || []) : [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
}

export const transactionsService = new TransactionsService();
export default transactionsService;

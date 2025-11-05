import { API_URL } from '@/constants/api';
import { apiService } from './api';

export interface BlockchainBalance {
  balance: string;
  formattedBalance: string;
  tokenSymbol: string;
  tokenAddress: string;
}

class BlockchainService {
  /**
   * Busca o saldo de cBRL do usuário na blockchain
   */
  async getCBRLBalance(): Promise<BlockchainBalance | null> {
    try {
      const token = await apiService.getAccessToken();

      if (!token) {
        // Silenciosamente retorna null se não houver token (usuário deslogado)
        return null;
      }

      console.log('🔍 Fetching balance from:', `${API_URL}/api/users/balance`);

      const response = await fetch(`${API_URL}/api/users/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();

        // Se o usuário ainda não confirmou o email e não tem publicKey, retornar null silenciosamente
        if (response.status === 404) {
          console.log('ℹ️ User does not have publicKey yet (email not confirmed)');
          return null;
        }

        console.error('❌ Failed to fetch balance:', response.status, errorText);
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Balance data:', data);

      if (data.success && data.data) {
        return {
          balance: data.data.balance || '0',
          formattedBalance: data.data.formattedBalance || 'R$ 0,00',
          tokenSymbol: data.data.tokenSymbol || 'cBRL',
          tokenAddress: data.data.tokenAddress || '',
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching cBRL balance:', error);
      return null;
    }
  }

  /**
   * Formata um valor BigNumber para exibição em Real
   */
  formatBalance(balance: string, decimals: number = 18): string {
    try {
      const value = parseFloat(balance) / Math.pow(10, decimals);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    } catch {
      return 'R$ 0,00';
    }
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;

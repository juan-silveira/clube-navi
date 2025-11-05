import { API_URL } from '@/constants/api';
import { apiService } from './api';

export interface DepositFees {
  depositValue: number;
  depositFeePercentage: number;
  depositFeeAmount: number;
  netAmount: number;
  tokensToReceive: number;
}

export interface DepositInitResponse {
  transactionId: string;
  amount: number;
  netAmount: number;
  fees: DepositFees;
}

export interface PixChargeResponse {
  success: boolean;
  data: {
    qrCode: string;
    qrCodeImage: string;
    paymentId: string;
    expiresAt: string;
    amount: number;
  };
}

export interface DepositStatus {
  transactionId: string;
  status: string;
  amount: number;
  pixStatus?: string;
  blockchainStatus?: string;
  pixPaid: boolean;
  blockchainConfirmed: boolean;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

class DepositService {
  /**
   * Calcula as taxas de depósito
   */
  async calculateFees(amount: number, userId: string): Promise<DepositFees | null> {
    try {
      const token = await apiService.getAccessToken();
      if (!token) {
        console.error('No access token available');
        return null;
      }

      const response = await fetch(`${API_URL}/api/deposits/calculate-fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to calculate fees:', errorData);
        throw new Error(`Failed to calculate fees: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error calculating deposit fees:', error);
      return null;
    }
  }

  /**
   * Inicia o processo de depósito
   */
  async initiateDeposit(amount: number, userId: string): Promise<DepositInitResponse | null> {
    try {
      const token = await apiService.getAccessToken();
      if (!token) {
        console.error('No access token available');
        return null;
      }

      const response = await fetch(`${API_URL}/api/deposits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate deposit: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error initiating deposit:', error);
      return null;
    }
  }

  /**
   * Cria cobrança PIX (gera QR code)
   */
  async createPixCharge(transactionId: string, userId: string): Promise<PixChargeResponse | null> {
    try {
      const token = await apiService.getAccessToken();
      if (!token) {
        console.error('No access token available');
        return null;
      }

      const response = await fetch(`${API_URL}/api/deposits/create-pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create PIX charge: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating PIX charge:', error);
      return null;
    }
  }

  /**
   * Verifica o status de um depósito
   */
  async checkDepositStatus(transactionId: string): Promise<DepositStatus | null> {
    try {
      const token = await apiService.getAccessToken();
      if (!token) {
        console.error('No access token available');
        return null;
      }

      const response = await fetch(`${API_URL}/api/deposits/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check deposit status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error checking deposit status:', error);
      return null;
    }
  }

  /**
   * DEBUG: Completa o depósito manualmente (apenas sandbox)
   */
  async debugCompleteDeposit(transactionId: string): Promise<boolean> {
    try {
      const token = await apiService.getAccessToken();
      if (!token) {
        console.error('No access token available');
        return false;
      }

      const response = await fetch(`${API_URL}/api/deposits/debug/complete-deposit/${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to complete deposit: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error completing deposit:', error);
      return false;
    }
  }
}

export const depositService = new DepositService();
export default depositService;

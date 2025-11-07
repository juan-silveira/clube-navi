/**
 * Cashback Types
 */

export interface CashbackStats {
  totalEarned: number;
  pendingCashback: number;
  availableCashback: number;
  totalWithdrawn: number;
  fromPurchases: number;
  fromReferrals: number;
}

export interface CashbackStatsResponse {
  success: boolean;
  data?: CashbackStats;
  error?: string;
  message?: string;
}

export interface CashbackHistoryItem {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'referral' | 'withdrawal' | 'bonus';
  description: string;
  purchaseId?: string;
  referralId?: string;
  createdAt: string;
}

export interface CashbackHistoryParams {
  page?: number;
  limit?: number;
  type?: 'purchase' | 'referral' | 'withdrawal' | 'bonus';
}

export interface CashbackHistoryResponse {
  success: boolean;
  data?: {
    history: CashbackHistoryItem[];
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

export interface CalculateCashbackData {
  totalAmount: number;
  cashbackPercentage: number;
}

export interface CashbackDistribution {
  totalCashback: number;
  consumerCashback: number;
  platformFee: number;
  consumerReferrerFee: number;
  merchantReferrerFee: number;
}

export interface CalculateCashbackResponse {
  success: boolean;
  data?: CashbackDistribution;
  error?: string;
  message?: string;
}

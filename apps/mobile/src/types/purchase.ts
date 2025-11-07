/**
 * Purchase Types
 */

import type { Product } from './product';
import type { User } from './user';

export type PurchaseStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Purchase {
  id: string;
  consumerId: string;
  merchantId: string;
  productId: string;
  totalAmount: number;
  merchantAmount: number;
  consumerCashback: number;
  platformFee: number;
  consumerReferrerFee: number;
  merchantReferrerFee: number;
  status: PurchaseStatus;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  consumer?: User;
  merchant?: User;
}

export interface CreatePurchaseData {
  productId: string;
  quantity: number;
}

export interface CreatePurchaseResponse {
  success: boolean;
  data?: {
    purchase: Purchase;
    cashbackDistribution: {
      consumer: number;
      platform: number;
      consumerReferrer: number;
      merchantReferrer: number;
    };
  };
  error?: string;
  message?: string;
}

export interface ConfirmPurchaseData {
  txHash: string;
}

export interface PurchaseResponse {
  success: boolean;
  data?: Purchase;
  error?: string;
  message?: string;
}

export interface PurchasesListParams {
  page?: number;
  limit?: number;
  status?: PurchaseStatus;
}

export interface PurchasesListResponse {
  success: boolean;
  data?: {
    purchases: Purchase[];
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

export interface PurchaseStats {
  totalPurchases: number;
  completedPurchases: number;
  pendingPurchases: number;
  totalAmount: number;
  totalCashback: number;
}

export interface PurchaseStatsResponse {
  success: boolean;
  data?: PurchaseStats;
  error?: string;
  message?: string;
}

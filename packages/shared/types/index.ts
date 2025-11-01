/**
 * TypeScript Types compartilhados entre Mobile, Admin e API
 */

// ============================================
// USER TYPES
// ============================================

export enum UserType {
  ADMIN_MASTER = 'ADMIN_MASTER',
  ADMIN_CLIENT = 'ADMIN_CLIENT',
  USER = 'USER',
  MERCHANT = 'MERCHANT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  type: UserType;
  status: UserStatus;
  whitelabelId?: string;
  walletAddress?: string;
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// WHITELABEL TYPES
// ============================================

export interface Whitelabel {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface WhitelabelTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  logoUrl?: string;
  backgroundUrl?: string;
}

// ============================================
// MERCHANT TYPES
// ============================================

export enum MerchantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  tradeName?: string;
  cnpj?: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  phone: string;
  email: string;
  status: MerchantStatus;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PRODUCT TYPES
// ============================================

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  cashbackPercent: number;
  category: string;
  images: string[];
  status: ProductStatus;
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  CASHBACK = 'CASHBACK',
  TRANSFER = 'TRANSFER',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  COMMISSION = 'COMMISSION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Transaction {
  id: string;
  userId: string;
  merchantId?: string;
  type: TransactionType;
  amount: number;
  cashbackAmount?: number;
  status: TransactionStatus;
  paymentMethod?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// WALLET TYPES
// ============================================

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  blockchainAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  txHash?: string; // Blockchain transaction hash
  createdAt: Date;
}

// ============================================
// REFERRAL TYPES
// ============================================

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  level: number;
  commissionEarned: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
}

export interface ReferralTree {
  user: User;
  children: ReferralTree[];
  level: number;
  totalEarned: number;
}

// ============================================
// CASHBACK TYPES
// ============================================

export enum CashbackStatus {
  PENDING = 'PENDING',
  RELEASED = 'RELEASED',
  EXPIRED = 'EXPIRED',
}

export interface Cashback {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  status: CashbackStatus;
  releaseDate: Date;
  releasedAt?: Date;
  createdAt: Date;
}

export interface CashbackRule {
  id: string;
  whitelabelId?: string;
  merchantId?: string;
  categoryId?: string;
  productId?: string;
  percentage: number;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  active: boolean;
}

// ============================================
// POS (Máquina de Cartão) TYPES
// ============================================

export interface POSDevice {
  id: string;
  merchantId: string;
  serialNumber: string;
  model: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  lastSeen?: Date;
  createdAt: Date;
}

export interface POSTransaction {
  id: string;
  posDeviceId: string;
  merchantId: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentMethod: 'CREDIT' | 'DEBIT' | 'PIX';
  cardBrand?: string;
  installments?: number;
  status: TransactionStatus;
  createdAt: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// AUTH TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  referralCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  type: UserType;
  whitelabelId?: string;
}

export interface AuthUser extends User {
  tokens: AuthTokens;
}

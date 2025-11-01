/**
 * Constantes compartilhadas entre Mobile, Admin e API
 */

// ============================================
// APP CONSTANTS
// ============================================

export const APP_NAME = 'Clube Navi';
export const APP_VERSION = '1.0.0';

// ============================================
// PAGINATION
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============================================
// CASHBACK
// ============================================

export const DEFAULT_CASHBACK_RELEASE_DAYS = 30;
export const MIN_CASHBACK_PERCENT = 0;
export const MAX_CASHBACK_PERCENT = 50;

// ============================================
// REFERRAL
// ============================================

export const MAX_REFERRAL_LEVELS = 5;
export const REFERRAL_CODE_LENGTH = 8;

export const REFERRAL_COMMISSION_PERCENTAGES: Record<number, number> = {
  1: 5, // 5% do cashback do nível 1
  2: 3, // 3% do cashback do nível 2
  3: 2, // 2% do cashback do nível 3
  4: 1, // 1% do cashback do nível 4
  5: 1, // 1% do cashback do nível 5
};

// ============================================
// BLOCKCHAIN
// ============================================

export const POLYGON_CHAIN_ID = 137; // Mainnet
export const POLYGON_TESTNET_CHAIN_ID = 80001; // Mumbai Testnet

export const TOKEN_DECIMALS = 18;
export const MIN_TRANSFER_AMOUNT = 0.000001;

// ============================================
// PAYMENT
// ============================================

export const MIN_TRANSACTION_AMOUNT = 1; // R$ 1.00
export const MAX_TRANSACTION_AMOUNT = 10000; // R$ 10.000,00

export const POS_FEE_PERCENTAGES = {
  DEBIT: 1.5, // 1.5%
  CREDIT_1X: 2.5, // 2.5%
  CREDIT_2_6X: 3.5, // 3.5%
  CREDIT_7_12X: 4.5, // 4.5%
  PIX: 0.99, // R$ 0.99 fixo
} as const;

// ============================================
// PRODUCT CATEGORIES
// ============================================

export const PRODUCT_CATEGORIES = [
  'Alimentação',
  'Vestuário',
  'Saúde e Bem-estar',
  'Educação',
  'Entretenimento',
  'Tecnologia',
  'Casa e Decoração',
  'Automotivo',
  'Viagens e Turismo',
  'Serviços',
  'Outros',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// ============================================
// MERCHANT CATEGORIES
// ============================================

export const MERCHANT_CATEGORIES = [
  'Restaurante',
  'Loja de Roupas',
  'Academia',
  'Farmácia',
  'Supermercado',
  'Posto de Gasolina',
  'Salão de Beleza',
  'Pet Shop',
  'Livraria',
  'Eletrônicos',
  'Outros',
] as const;

export type MerchantCategory = (typeof MERCHANT_CATEGORIES)[number];

// ============================================
// FILE UPLOAD
// ============================================

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

// ============================================
// RATE LIMITING
// ============================================

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
export const RATE_LIMIT_MAX_REQUESTS = 100;

// ============================================
// JWT
// ============================================

export const JWT_EXPIRATION = '15m'; // 15 minutos
export const REFRESH_TOKEN_EXPIRATION = '7d'; // 7 dias

// ============================================
// REGEX PATTERNS
// ============================================

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
export const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const ZIP_CODE_REGEX = /^\d{5}-?\d{3}$/;

// ============================================
// MAPS
// ============================================

export const DEFAULT_MAP_CENTER = {
  lat: -23.5505, // São Paulo
  lng: -46.6333,
};

export const DEFAULT_MAP_ZOOM = 12;
export const MAX_NEARBY_DISTANCE_KM = 50;

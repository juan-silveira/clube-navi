/**
 * API Configuration
 *
 * Para desenvolvimento local:
 * - Android Emulator: use 10.0.2.2
 * - iOS Simulator: use localhost
 * - Dispositivo físico: use o IP da sua máquina na rede local
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detectar se está rodando em emulador ou dispositivo físico
const getApiUrl = () => {
  if (__DEV__) {
    // Em desenvolvimento

    // Se estiver rodando no Expo Go em dispositivo físico, usar IP local
    const isExpoGo = Constants.appOwnership === 'expo';

    if (Platform.OS === 'android') {
      // Android Emulator usa 10.0.2.2 para acessar localhost do host
      // Dispositivo físico Android usa IP da rede local
      return isExpoGo
        ? 'http://192.168.0.16:8033'  // Dispositivo físico
        : 'http://10.0.2.2:8033';      // Emulador
    }

    // iOS Simulator e Expo Go podem usar localhost ou IP
    return isExpoGo
      ? 'http://192.168.0.16:8033'  // Dispositivo físico
      : 'http://localhost:8033';     // Simulator
  }

  // Em produção, usar URL real da API
  return 'https://api.clubedigital.com.br';
};

export const API_URL = getApiUrl();

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',

  // User
  ME: '/api/auth/me',
  UPDATE_PROFILE: '/api/users/profile',

  // 2FA
  ENABLE_2FA: '/api/auth/2fa/enable',
  DISABLE_2FA: '/api/auth/2fa/disable',
  VERIFY_2FA: '/api/auth/2fa/verify',

  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  PRODUCTS_CATEGORIES: '/api/products/categories/list',
  PRODUCTS_FEATURED: '/api/products/featured/list',

  // Purchases
  PURCHASES: '/api/purchases',
  PURCHASE_BY_ID: (id: string) => `/api/purchases/${id}`,
  PURCHASE_CONFIRM: (id: string) => `/api/purchases/${id}/confirm`,
  PURCHASE_STATS: '/api/purchases/stats',

  // Cashback
  CASHBACK_STATS: '/api/cashback/stats',
  CASHBACK_HISTORY: '/api/cashback/history',
  CASHBACK_CALCULATE: '/api/cashback/calculate',
} as const;

export const API_TIMEOUT = 30000; // 30 segundos

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  // Network (testnet or mainnet)
  NETWORK: 'testnet', // Pode ser alterado para 'mainnet' em produção

  // Explorer URLs
  MAINNET_EXPLORER_URL: 'https://azorescan.com',
  TESTNET_EXPLORER_URL: 'https://floripa.azorescan.com',

  // Get current explorer URL based on network
  getExplorerUrl(): string {
    return this.NETWORK === 'mainnet'
      ? this.MAINNET_EXPLORER_URL
      : this.TESTNET_EXPLORER_URL;
  },

  // Get transaction URL
  getTxUrl(txHash: string): string {
    return `${this.getExplorerUrl()}/tx/${txHash}`;
  },

  // Get address URL
  getAddressUrl(address: string): string {
    return `${this.getExplorerUrl()}/address/${address}`;
  },
};

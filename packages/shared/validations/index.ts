/**
 * Schemas de validação Zod compartilhados
 */

import { z } from 'zod';
import { UserType, UserStatus, ProductStatus, TransactionType, TransactionStatus } from '../types';
import { isValidCPF, isValidCNPJ, isValidEmail } from '../utils';

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().optional(),
  type: z.nativeEnum(UserType),
  whitelabelId: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

// ============================================
// WHITELABEL SCHEMAS
// ============================================

export const createWhitelabelSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)'),
});

export const updateWhitelabelSchema = createWhitelabelSchema.partial();

// ============================================
// MERCHANT SCHEMAS
// ============================================

export const createMerchantSchema = z.object({
  businessName: z.string().min(2, 'Razão social deve ter no mínimo 2 caracteres'),
  tradeName: z.string().optional(),
  cnpj: z.string().refine(isValidCNPJ, 'CNPJ inválido'),
  category: z.string(),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  description: z.string().optional(),
});

export const updateMerchantSchema = createMerchantSchema.partial();

// ============================================
// PRODUCT SCHEMAS
// ============================================

export const createProductSchema = z.object({
  merchantId: z.string().uuid(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  price: z.number().positive('Preço deve ser maior que zero'),
  originalPrice: z.number().positive().optional(),
  cashbackPercent: z.number().min(0).max(50, 'Cashback deve ser entre 0% e 50%'),
  category: z.string(),
  images: z.array(z.string().url()).min(1, 'Adicione pelo menos uma imagem'),
  stock: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.nativeEnum(ProductStatus).optional(),
});

// ============================================
// TRANSACTION SCHEMAS
// ============================================

export const createTransactionSchema = z.object({
  userId: z.string().uuid(),
  merchantId: z.string().uuid().optional(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Valor deve ser maior que zero'),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================
// WALLET SCHEMAS
// ============================================

export const transferSchema = z.object({
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço blockchain inválido'),
  amount: z.number().positive('Valor deve ser maior que zero'),
});

export const withdrawSchema = z.object({
  amount: z.number().positive('Valor deve ser maior que zero'),
  pixKey: z.string().min(1, 'Chave PIX obrigatória'),
});

// ============================================
// CASHBACK RULE SCHEMAS
// ============================================

export const createCashbackRuleSchema = z.object({
  whitelabelId: z.string().uuid().optional(),
  merchantId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  percentage: z.number().min(0).max(50),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  active: z.boolean().default(true),
}).refine(
  data => {
    if (data.minAmount && data.maxAmount) {
      return data.minAmount < data.maxAmount;
    }
    return true;
  },
  {
    message: 'Valor mínimo deve ser menor que valor máximo',
    path: ['minAmount'],
  }
);

// ============================================
// PAGINATION SCHEMA
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// SEARCH SCHEMA
// ============================================

export const searchSchema = paginationSchema.extend({
  query: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateWhitelabelInput = z.infer<typeof createWhitelabelSchema>;
export type UpdateWhitelabelInput = z.infer<typeof updateWhitelabelSchema>;
export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type CreateCashbackRuleInput = z.infer<typeof createCashbackRuleSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

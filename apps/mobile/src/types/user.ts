export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  profilePicture?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  // Dados básicos
  email: string;
  username: string;
  phone?: string;
  password: string;

  // Tipo de pessoa
  personType: 'PF' | 'PJ'; // Pessoa Física ou Jurídica

  // Código de indicação (username de quem indicou)
  referralCode?: string;

  // Dados de Pessoa Física
  cpf?: string;
  name?: string; // Nome completo

  // Dados de Pessoa Jurídica
  cnpj?: string;
  companyName?: string; // Razão Social
  legalRepDocument?: string; // RG ou CNH do representante
  legalRepDocumentType?: 'RG' | 'CNH';

  // Endereço
  address?: {
    zipCode: string; // CEP
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
    requires2FA?: boolean;
    tempToken?: string;
  };
  error?: string;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

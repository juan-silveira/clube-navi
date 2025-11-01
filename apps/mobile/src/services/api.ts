import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS, API_TIMEOUT } from '@/constants/api';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RefreshTokenResponse,
  ForgotPasswordData,
  ResetPasswordData,
  User,
  ApiResponse,
} from '@/types/user';

// Keys para AsyncStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@clube_navi:access_token',
  REFRESH_TOKEN: '@clube_navi:refresh_token',
  USER: '@clube_navi:user',
};

class ApiService {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token nas requisições
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar erros 401 e renovar token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Se erro 401 e não é retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Renovar token
            const response = await this.renewToken();

            if (response.success && response.data) {
              const { accessToken } = response.data;

              // Atualizar header da requisição original
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              // Retry da requisição original
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Se falhar ao renovar, fazer logout
            await this.clearStorage();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticação
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user, requires2FA, tempToken } =
          response.data.data;

        if (requires2FA) {
          // Retorna resposta indicando que precisa de 2FA
          return {
            success: true,
            data: {
              accessToken: '',
              refreshToken: '',
              user,
              requires2FA: true,
              tempToken,
            },
          };
        }

        // Salvar tokens e usuário
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
          [STORAGE_KEYS.USER, JSON.stringify(user)],
        ]);
      }

      return response.data;
    } catch (error) {
      return this.handleError<LoginResponse>(error);
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>(
        API_ENDPOINTS.REGISTER,
        data
      );

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;

        // Salvar tokens e usuário
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
          [STORAGE_KEYS.USER, JSON.stringify(user)],
        ]);
      }

      return response.data;
    } catch (error) {
      return this.handleError<LoginResponse>(error);
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      await this.api.post(API_ENDPOINTS.LOGOUT);
      await this.clearStorage();
      return { success: true };
    } catch (error) {
      // Mesmo que falhe, limpar storage local
      await this.clearStorage();
      return { success: true };
    }
  }

  async renewToken(): Promise<RefreshTokenResponse> {
    // Se já está renovando, retorna a mesma promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = await AsyncStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN
        );

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await this.api.post<RefreshTokenResponse>(
          API_ENDPOINTS.REFRESH_TOKEN,
          { refreshToken }
        );

        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Atualizar tokens no storage
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
            [STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken],
          ]);
        }

        return response.data;
      } catch (error) {
        await this.clearStorage();
        return this.handleError<RefreshTokenResponse>(error);
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.FORGOT_PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError<ApiResponse>(error);
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.RESET_PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError<ApiResponse>(error);
    }
  }

  // Métodos de usuário
  async getMe(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get<ApiResponse<User>>(API_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      return this.handleError<ApiResponse<User>>(error);
    }
  }

  // Métodos auxiliares
  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  private async clearStorage(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  }

  private handleError<T>(error: any): T {
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Erro na comunicação com o servidor';

      return {
        success: false,
        error: message,
        message,
      } as T;
    }

    return {
      success: false,
      error: 'Erro desconhecido',
      message: 'Erro desconhecido',
    } as T;
  }
}

// Exportar instância única
export const apiService = new ApiService();
export default apiService;

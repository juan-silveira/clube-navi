import { create } from 'zustand';
import { apiService } from '@/services/api';
import type { User, LoginCredentials, RegisterData } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        if (response.data.requires2FA) {
          // TODO: Implementar fluxo de 2FA
          set({
            isLoading: false,
            error: '2FA não implementado ainda',
          });
          return false;
        }

        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Credenciais inválidas',
      });

      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao fazer login',
      });

      return false;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.register(data);

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Erro ao criar conta',
      });

      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao criar conta',
      });

      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await apiService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });

    try {
      const isAuthenticated = await apiService.isAuthenticated();

      if (!isAuthenticated) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Tentar carregar usuário do storage
      const storedUser = await apiService.getStoredUser();

      if (storedUser) {
        set({
          user: storedUser,
          isAuthenticated: true,
          isLoading: false,
        });

        // Buscar dados atualizados em background
        const response = await apiService.getMe();
        if (response.success && response.data) {
          set({ user: response.data });
        }
      } else {
        // Se não tem usuário salvo, buscar da API
        const response = await apiService.getMe();

        if (response.success && response.data) {
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

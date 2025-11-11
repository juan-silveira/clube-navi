import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // Estado SIMPLES
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Login - salvar usuário e token
  login: (user, accessToken) => {
    console.log('✅ [AuthStore] Login:', user);

    if (typeof window !== 'undefined') {
      localStorage.setItem('club_admin_user', JSON.stringify(user));
      localStorage.setItem('club_admin_token', accessToken);
    }

    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  // Logout - limpar tudo
  logout: () => {
    console.log('🚪 [AuthStore] Logout');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('club_admin_user');
      localStorage.removeItem('club_admin_token');
    }

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  // Carregar do localStorage ao iniciar
  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('club_admin_user');
      const token = localStorage.getItem('club_admin_token');

      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
          });
          console.log('✅ [AuthStore] Carregado:', user.email);
        } catch (e) {
          console.error('❌ [AuthStore] Erro:', e);
          localStorage.removeItem('club_admin_user');
          localStorage.removeItem('club_admin_token');
        }
      }
    }
  },
}));

export default useAuthStore;

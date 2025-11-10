import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      admin: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Ações
      setAdmin: (admin) => set({ admin }),

      setToken: (accessToken) =>
        set({ accessToken, isAuthenticated: true }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: (admin, accessToken) => {
        set({
          admin,
          accessToken,
          isAuthenticated: true,
        });

        // Salvar no localStorage também
        if (typeof window !== 'undefined') {
          localStorage.setItem('club_admin_token', accessToken);
          localStorage.setItem('club_admin_user', JSON.stringify(admin));
        }
      },

      logout: () => {
        set({
          admin: null,
          accessToken: null,
          isAuthenticated: false,
        });

        // Limpar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('club_admin_token');
          localStorage.removeItem('club_admin_user');
        }
      },

      updateAdmin: (updates) => {
        const currentAdmin = get().admin;
        if (currentAdmin) {
          const updatedAdmin = { ...currentAdmin, ...updates };
          set({ admin: updatedAdmin });

          if (typeof window !== 'undefined') {
            localStorage.setItem('club_admin_user', JSON.stringify(updatedAdmin));
          }
        }
      },
    }),
    {
      name: 'club-admin-auth',
      partialize: (state) => ({
        admin: state.admin,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

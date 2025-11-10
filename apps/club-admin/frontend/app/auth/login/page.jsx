"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClub } from '@/contexts/ClubContext';
import { authService } from '@/services/api';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { club, branding } = useClub();
  const { login: loginStore } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);

      if (response.success) {
        // Salvar no store
        loginStore(response.data.admin, response.data.accessToken);

        // Redirecionar para dashboard
        router.push('/dashboard');
      } else {
        setError(response.message || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Nome do Clube */}
        <div className="text-center">
          {branding?.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={club?.companyName}
              className="h-16 w-auto mx-auto mb-4"
            />
          )}
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {club?.companyName || 'Club Admin'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Painel de Administração
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Esqueceu sua senha?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Powered by Clube Digital</p>
        </div>
      </div>
    </div>
  );
}

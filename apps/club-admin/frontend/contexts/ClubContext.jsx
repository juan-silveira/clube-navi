"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { getClubSlugFromHostname, getClubSlugForAPI } from '@/utils/subdomain';
import axios from 'axios';

const ClubContext = createContext(null);

export function ClubProvider({ children }) {
  const [club, setClub] = useState(null);
  const [clubSlug, setClubSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detectar slug do clube ao montar
  useEffect(() => {
    const detectClub = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obter slug do hostname
        const slug = getClubSlugForAPI();

        if (!slug) {
          throw new Error('Club slug not detected. Please access via subdomain (e.g., clube-navi.clubedigital.com.br)');
        }

        setClubSlug(slug);

        // Buscar dados do clube da API
        const response = await axios.get(`/api/club-admin/club-info`, {
          headers: {
            'X-Club-Slug': slug
          }
        });

        if (response.data.success) {
          setClub(response.data.data);

          // Aplicar branding dinâmico
          applyBranding(response.data.data.branding);
        } else {
          throw new Error(response.data.message || 'Failed to load club data');
        }

      } catch (err) {
        console.error('❌ Error loading club:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    detectClub();
  }, []);

  // Aplicar branding dinâmico (cores, logo, etc)
  const applyBranding = (branding) => {
    if (!branding || typeof document === 'undefined') return;

    const root = document.documentElement;

    // Aplicar cores primárias
    if (branding.primaryColor) {
      root.style.setProperty('--primary-500', branding.primaryColor);
      // Você pode gerar variações automáticas ou ter cores específicas
      root.style.setProperty('--primary-600', darkenColor(branding.primaryColor, 10));
      root.style.setProperty('--primary-700', darkenColor(branding.primaryColor, 20));
    }

    // Aplicar cores secundárias
    if (branding.secondaryColor) {
      root.style.setProperty('--secondary-500', branding.secondaryColor);
    }

    // Aplicar logo no title
    if (branding.companyName) {
      document.title = `${branding.companyName} - Admin`;
    }
  };

  // Função auxiliar para escurecer cor (simplificada)
  const darkenColor = (color, percent) => {
    // Implementação básica - você pode usar uma lib como tinycolor2
    return color;
  };

  const value = {
    club,
    clubSlug,
    loading,
    error,
    branding: club?.branding || {},
    refreshClub: async () => {
      // Implementar refresh se necessário
    }
  };

  // Mostrar loading enquanto carrega dados do clube
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Carregando clube...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se falhou ao carregar
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
              Erro ao Carregar Clube
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClubContext.Provider value={value}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within ClubProvider');
  }
  return context;
}

"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';

const CompanyContext = createContext();

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompanyContext deve ser usado dentro de um CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState(null);
  const [companyBranding, setCompanyBranding] = useState(null);
  const [userCompanies, setUserCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brandingLoaded, setBrandingLoaded] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();

  // Carregar branding do clube quando usuário está autenticado
  useEffect(() => {
    const fetchClubBranding = async () => {
      if (isAuthenticated && user && user.clubId && !brandingLoaded) {
        console.log('🎨 [CompanyContext] Carregando branding do clube...');
        try {
          const response = await api.get('/api/club-admin/branding');

          if (response.data.success && response.data.data) {
            const brandingData = response.data.data;
            console.log('✅ [CompanyContext] Branding carregado da API:', brandingData);

            // Converter para o formato esperado pelos componentes
            const formattedBranding = {
              brand_name: brandingData.appName || user.clubName || 'Clube Digital',
              primaryColor: brandingData.primaryColor || '#3B82F6',
              secondaryColor: brandingData.secondaryColor || '#10B981',
              primary_color: brandingData.primaryColor || '#3B82F6', // Compatibilidade
              secondary_color: brandingData.secondaryColor || '#10B981', // Compatibilidade
              logoUrl: brandingData.logoUrl,
              logoIconUrl: brandingData.logoIconUrl,
              faviconUrl: brandingData.faviconUrl,
              tagline: brandingData.appDescription || 'Sistema de gestão do clube'
            };

            console.log('✅ [CompanyContext] Branding formatado:', formattedBranding);
            setCompanyBranding(formattedBranding);
            setCurrentCompany({
              id: user.clubId,
              name: brandingData.appName || user.clubName,
              slug: user.clubSlug
            });
          }
        } catch (error) {
          console.error('❌ [CompanyContext] Erro ao carregar branding:', error);
          // Em caso de erro, usar valores padrão do clube
          setCurrentCompany({
            id: user.clubId,
            name: user.clubName || 'Clube Digital',
            slug: user.clubSlug
          });
        } finally {
          setBrandingLoaded(true);
        }
      }
    };

    fetchClubBranding();
  }, [isAuthenticated, user, brandingLoaded]);

  // No club-admin, não precisa carregar empresa do backend
  const loadCurrentCompany = async () => {
    // No club-admin, o clube já está definido pelo subdomínio
    setCurrentCompany(null);
    setCompanyBranding(null);
    setLoading(false);
  };

  // No club-admin, não precisa carregar branding por API
  const loadCompanyBranding = async (companyId) => {
    // Não faz nada - branding é gerenciado pelo subdomínio
    setCompanyBranding(null);
  };

  // No club-admin, não precisa carregar branding por API
  const loadCompanyBrandingByAlias = async (companyAlias) => {
    // Retornar branding padrão sem fazer chamadas API
    const defaultBranding = {
      brand_name: 'Clube Digital',
      primary_color: "#3B82F6",
      secondary_color: "#1E293B",
      logo_url: "/assets/images/logo/logo.svg",
      logo_dark_url: "/assets/images/logo/logo-white.svg",
      tagline: "Sistema de gestão de clubes"
    };
    setCompanyBranding(defaultBranding);
    setCurrentCompany({
      alias: companyAlias,
      name: defaultBranding.brand_name
    });
    return defaultBranding;
  };

  // No club-admin, não precisa carregar múltiplas empresas
  const loadUserCompanies = async () => {
    // No club-admin, sempre retorna array vazio (não há múltiplas empresas)
    setUserCompanies([]);
    return [];
  };

  // Recarregar branding da empresa atual
  const reloadCompanyBranding = async () => {
    if (currentCompany?.id) {
      await loadCompanyBranding(currentCompany.id);
    } else {
      await loadCurrentCompany();
    }
  };

  // No club-admin, não permite trocar empresa
  const switchCompany = async (companyId) => {
    // Noop - não há troca de empresa no club-admin
    return false;
  };

  // Limpar dados da empresa (usar no logout)
  const clearCompanyData = () => {
    setCurrentCompany(null);
    setCompanyBranding(null);
    setUserCompanies([]);
  };

  // Obter branding ativo (empresa atual ou padrão)
  const getActiveBranding = () => {
    if (companyBranding) {
      return companyBranding;
    }
    
    // Branding padrão
    return {
      brand_name: "Clube Digital",
      primary_color: "#3B82F6",
      secondary_color: "#1E293B", 
      logo_url: "/assets/images/logo/logo.svg",
      logo_dark_url: "/assets/images/logo/logo-white.svg",
      tagline: "Sistema de gestão de tokens e transações em blockchain"
    };
  };

  // Verificar se está em contexto whitelabel
  const isWhitelabelContext = () => {
    return currentCompany && currentCompany.alias;
  };

  const value = {
    // Estado
    currentCompany,
    companyBranding,
    userCompanies,
    loading,
    
    // Ações
    loadCurrentCompany,
    loadCompanyBranding,
    loadCompanyBrandingByAlias,
    loadUserCompanies,
    switchCompany,
    clearCompanyData,
    reloadCompanyBranding,
    
    // Utilidades
    getActiveBranding,
    isWhitelabelContext
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
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

  // Carregar branding automaticamente quando autenticar
  useEffect(() => {
    if (isAuthenticated && user && !brandingLoaded) {
      // Super admins não têm "empresa atual", pular carregamento
      if (user.email && user.email.includes('@clubedigital.com')) {
        console.log('🔐 Super admin detectado, pulando carregamento de empresa');
        setBrandingLoaded(true);
        setCurrentCompany({ name: 'Super Admin', id: 'super-admin' });
        return;
      }

      // console.log('🎨 Carregando branding após login...');
      loadCurrentCompany().then(() => {
        setBrandingLoaded(true);
      });
    }
  }, [isAuthenticated, user]);

  // Carregar empresa atual do usuário
  const loadCurrentCompany = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/whitelabel/user/current-company');

      if (response.data.success) {
        const company = response.data.data.currentCompany;
        setCurrentCompany(company);

        // Salvar alias no authStore para usar no logout
        if (company?.alias) {
          useAuthStore.getState().setCurrentCompanyAlias(company.alias);
        }

        // Carregar branding da empresa
        if (company.id) {
          await loadCompanyBranding(company.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar empresa atual:', error);
      // Se não conseguir carregar a empresa atual, usar configuração padrão
      setCurrentCompany(null);
      setCompanyBranding(null);
    } finally {
      setLoading(false);
    }
  };

  // Carregar branding do companye
  const loadCompanyBranding = async (companyId) => {
    try {
      const response = await api.get(`/api/whitelabel/branding/${companyId}`);
      
      if (response.data.success) {
        const branding = response.data.data.branding;
        
        // Mapear propriedades se necessário
        if (branding) {
          const mappedBranding = {
            ...branding,
            logoUrl: branding.logoUrl || branding.logo_url,
            logoUrlDark: branding.logoUrlDark || branding.logo_dark_url,
            miniUrl: branding.miniUrl || branding.mini_url,
            miniUrlDark: branding.miniUrlDark || branding.mini_url_dark,
            textUrl: branding.textUrl || branding.text_url,
            textUrlDark: branding.textUrlDark || branding.text_url_dark,
            primaryColor: branding.primaryColor || branding.primary_color,
            secondaryColor: branding.secondaryColor || branding.secondary_color,
            brandName: branding.brandName || branding.brand_name,
            companyId: branding.companyId || branding.company_id
          };
          
          setCompanyBranding(mappedBranding);
        } else {
          setCompanyBranding(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
      setCompanyBranding(null);
    }
  };

  // Carregar branding por alias (para páginas whitelabel)
  const loadCompanyBrandingByAlias = async (companyAlias) => {
    // Evitar recarregar se já temos o branding para este alias
    if (currentCompany?.alias === companyAlias && companyBranding) {
      // console.log('🔍 Branding já carregado para:', companyAlias);
      return companyBranding;
    }

    try {
      setLoading(true);
      // console.log('🔍 Carregando branding para:', companyAlias);
      const response = await api.get(`/api/whitelabel/company-branding/${companyAlias}`);
      
      if (response.data.success) {
        const branding = response.data.data;
        
        // Mapear propriedades do backend (snake_case) para frontend (camelCase)
        const mappedBranding = {
          ...branding,
          logoUrl: branding.logo_url,
          logoUrlDark: branding.logo_dark_url,
          miniUrl: branding.mini_url,
          miniUrlDark: branding.mini_url_dark,
          textUrl: branding.text_url,
          textUrlDark: branding.text_url_dark,
          primaryColor: branding.primary_color,
          secondaryColor: branding.secondary_color,
          brandName: branding.brand_name,
          companyId: branding.company_id
        };
        
        setCompanyBranding(mappedBranding);
        
        // Definir também como empresa atual temporária
        setCurrentCompany({
          id: branding.company_id,
          name: branding.brand_name,
          alias: companyAlias
        });
        
        console.log('✅ Branding carregado:', branding.brand_name);
        return branding;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar branding por alias:', error);
      
      // Só definir branding padrão se ainda não temos nenhum branding
      if (!companyBranding) {
        const defaultBranding = {
          brand_name: companyAlias === 'navi' ? 'Navi' : 'Clube Digital',
          primary_color: "#3B82F6",
          secondary_color: "#1E293B", 
          logo_url: "/assets/images/logo/logo.svg",
          logo_dark_url: "/assets/images/logo/logo-white.svg",
          tagline: "Sistema de gestão de tokens e transações em blockchain"
        };
        setCompanyBranding(defaultBranding);
        setCurrentCompany({
          alias: companyAlias,
          name: defaultBranding.brand_name
        });
        return defaultBranding;
      }
      
      return companyBranding;
    } finally {
      setLoading(false);
    }
  };

  // Carregar empresas do usuário
  const loadUserCompanies = async () => {
    try {
      const response = await api.get('/api/whitelabel/user/companies');
      
      if (response.data.success) {
        setUserCompanies(response.data.data.companies);
        return response.data.data.companies;
      }
    } catch (error) {
      console.error('Erro ao carregar empresas do usuário:', error);
      setUserCompanies([]);
      return [];
    }
  };

  // Recarregar branding da empresa atual
  const reloadCompanyBranding = async () => {
    if (currentCompany?.id) {
      await loadCompanyBranding(currentCompany.id);
    } else {
      await loadCurrentCompany();
    }
  };

  // Trocar empresa atual
  const switchCompany = async (companyId) => {
    try {
      setLoading(true);
      
      // Atualizar último acesso
      await api.post(`/api/whitelabel/company/${companyId}/update-access`);
      
      // Recarregar empresa atual
      await loadCurrentCompany();
      
      return true;
    } catch (error) {
      console.error('Erro ao trocar empresa:', error);
      return false;
    } finally {
      setLoading(false);
    }
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
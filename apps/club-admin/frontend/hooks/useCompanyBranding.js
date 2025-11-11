import { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export const useCompanyBranding = () => {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundDimensions, setBackgroundDimensions] = useState({ width: '100%', height: '100%' });
  const { user } = useAuthStore();

  // Função para extrair dimensões do customCss
  const extractDimensionsFromCss = (cssString) => {
    if (!cssString) return { width: '100%', height: '100%' };
    
    try {
      // Procurar por comentário específico com as dimensões
      const dimensionsMatch = cssString.match(/\/\*\s*background-dimensions:\s*({[^}]+})\s*\*\//);
      if (dimensionsMatch) {
        const dimensions = JSON.parse(dimensionsMatch[1]);
        return {
          width: dimensions.width || '100%',
          height: dimensions.height || '100%'
        };
      }
    } catch (error) {
      console.error('Erro ao extrair dimensões do CSS:', error);
    }
    
    return { width: '100%', height: '100%' };
  };

  useEffect(() => {
    // No club-admin, não precisa buscar branding por API
    // O branding é gerenciado pelo ClubContext baseado no subdomínio
    setBranding(null);
    setLoading(false);
  }, [user]);

  // Função para obter a imagem de fundo com fallback
  const getBackgroundImage = () => {
    if (branding?.background_image_url) {
      return branding.background_image_url;
    }
    // Fallback para a imagem padrão
    return '/assets/images/logo/logo.svg';
  };

  // Função para obter a imagem da área de ilustração (ils1.svg ou background_image_url)
  const getAuthIllustration = () => {
    if (branding?.background_image_url) {
      return branding.background_image_url;
    }
    // Fallback para a ilustração padrão
    return '/assets/images/auth/ils1.svg';
  };

  // Função para obter estilos da imagem de fundo
  const getBackgroundStyles = () => {
    console.log('🔍 [Hook] getBackgroundStyles chamado:', {
      hasCustomCss: !!branding?.custom_css,
      dimensions: backgroundDimensions,
      branding: branding
    });
    
    // Se não há customCss ou se as dimensões são padrão, usar classes CSS originais
    if (!branding?.custom_css || (backgroundDimensions.width === '100%' && backgroundDimensions.height === '100%')) {
      console.log('🔍 [Hook] Usando CSS padrão');
      return {};
    }
    
    const styles = {
      width: backgroundDimensions.width,
      height: backgroundDimensions.height,
      objectFit: 'contain'
    };
    
    console.log('🔍 [Hook] Aplicando estilos personalizados:', styles);
    return styles;
  };
  
  // Função para obter classes CSS da imagem de fundo
  const getBackgroundClasses = () => {
    // Se não há customCss ou se as dimensões são padrão, usar classes CSS originais
    if (!branding?.custom_css || (backgroundDimensions.width === '100%' && backgroundDimensions.height === '100%')) {
      return 'h-full w-full object-contain';
    }
    
    return 'object-contain';
  };
  
  // Função para obter classes CSS do container da imagem
  const getBackgroundContainerClasses = (customBottomClass = '2xl:bottom-[-160px] bottom-[-130px]') => {
    // Se há dimensões personalizadas, centralizar a imagem
    if (branding?.custom_css && (backgroundDimensions.width !== '100%' || backgroundDimensions.height !== '100%')) {
      return `absolute left-0 ${customBottomClass} h-full w-full z-[-1] flex items-center justify-center`;
    }
    
    // Classes originais se não há personalização
    return `absolute left-0 ${customBottomClass} h-full w-full z-[-1]`;
  };

  return {
    branding,
    loading,
    backgroundDimensions,
    getBackgroundImage,
    getAuthIllustration,
    getBackgroundStyles,
    getBackgroundClasses,
    getBackgroundContainerClasses
  };
};

export default useCompanyBranding;
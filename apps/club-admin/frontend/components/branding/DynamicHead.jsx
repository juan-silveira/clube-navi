"use client";

import { useEffect } from 'react';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { usePathname } from 'next/navigation';

/**
 * Componente para gerenciar dinamicamente o favicon e o título da página
 * baseado no branding do clube
 */
const DynamicHead = () => {
  const { companyBranding, currentCompany } = useCompanyContext();
  const pathname = usePathname();

  useEffect(() => {
    if (!companyBranding && !currentCompany) return;

    const brandName = companyBranding?.brand_name || currentCompany?.name || 'Clube Digital';
    const faviconUrl = companyBranding?.faviconUrl;

    // Atualizar favicon
    if (faviconUrl) {
      // Remover favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      existingFavicons.forEach(link => link.remove());

      // Adicionar novo favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      document.head.appendChild(link);
    }

    // Atualizar título baseado na rota atual
    const getPageTitle = () => {
      const path = pathname || '/dashboard';

      // Mapear rotas para títulos
      const titleMap = {
        '/dashboard': 'Dashboard',
        '/users': 'Usuários',
        '/companies': 'Empresas',
        '/transactions': 'Transações',
        '/settings': 'Configurações',
        '/branding': 'Branding',
        '/profile': 'Perfil',
        '/change-password': 'Alterar Senha',
        '/system/clubs': 'Clubes',
        '/system/club-admins': 'Administradores',
      };

      // Buscar título exato ou genérico
      let pageTitle = titleMap[path];

      if (!pageTitle) {
        // Tentar match parcial
        for (const [route, title] of Object.entries(titleMap)) {
          if (path.startsWith(route)) {
            pageTitle = title;
            break;
          }
        }
      }

      return pageTitle ? `${pageTitle} - ${brandName}` : brandName;
    };

    document.title = getPageTitle();

  }, [companyBranding, currentCompany, pathname]);

  // Aplicar CSS customizado para cores do branding
  useEffect(() => {
    if (!companyBranding) return;

    const primaryColor = companyBranding.primary_color || companyBranding.primaryColor || '#3B82F6';
    const secondaryColor = companyBranding.secondary_color || companyBranding.secondaryColor || '#10B981';

    // Atualizar variáveis CSS
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', primaryColor);
    root.style.setProperty('--brand-secondary', secondaryColor);
  }, [companyBranding]);

  return null; // Este componente não renderiza nada
};

export default DynamicHead;

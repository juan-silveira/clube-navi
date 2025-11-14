"use client";

import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import useSidebar from "@/hooks/useSidebar";
import Link from "next/link";
import useWidth from "@/hooks/useWidth";
import { useCompanyContext } from "@/contexts/CompanyContext";
import useImageFallback from "@/hooks/useImageFallback";
import { generateLogoPlaceholder, generateCompanyPlaceholder } from "@/utils/placeholderUtils";

const Logo = () => {
  const [isDark] = useDarkMode();
  const [collapsed] = useSidebar();
  const { width, breakpoints } = useWidth();
  const { companyBranding, currentCompany } = useCompanyContext();

  // Função para obter logo de fallback
  const getFallbackLogo = () => {
    const isCompact = width < breakpoints.xl;
    
    // Se temos informações da empresa, usar placeholder personalizado
    if (currentCompany?.name) {
      return generateCompanyPlaceholder(currentCompany.name, isDark, isCompact);
    }
    
    // Fallback genérico
    return generateLogoPlaceholder(isDark, isCompact);
  };

  // Hook para fallback de imagem
  const { getImageSrc, handleImageError } = useImageFallback(getFallbackLogo());

  // Usar logo da empresa se disponível, senão usar default
  const getLogo = () => {
    // Se tem branding da empresa, tentar usar primeiro
    if (companyBranding) {
      let logoUrl = null;

      // Se o menu estiver colapsado ou tela pequena, priorizar logo icon
      if (collapsed || width < breakpoints.xl) {
        logoUrl = companyBranding.logoIconUrl || companyBranding.logoUrl;
      } else {
        // Menu expandido - usar logo normal, fallback para logoIconUrl se não tiver
        logoUrl = companyBranding.logoUrl || companyBranding.logoIconUrl;
      }

      // Se encontrou uma URL válida, retornar
      if (logoUrl) {
        return logoUrl;
      }
    }
    // Fallback para assets estáticos baseado no estado collapsed
    if (width >= breakpoints.xl && !collapsed) {
      return isDark
        ? "/assets/images/logo/logo-white.svg"
        : "/assets/images/logo/logo.svg";
    } else {
      return isDark
        ? "/assets/images/logo/logo-c-white.svg"
        : "/assets/images/logo/logo-c.svg";
    }
  };

  return (
    <div className="flex flex-col items-end">
      <Link href="/dashboard">
        <React.Fragment>
          <img
            src={getLogo()}
            alt="Logo"
            style={{ 
              maxHeight: width >= breakpoints.xl ? '40px' : '35px',
              width: 'auto'
            }}
            onError={handleImageError}
          />
        </React.Fragment>
      </Link>
    </div>
  );
};

export default Logo;
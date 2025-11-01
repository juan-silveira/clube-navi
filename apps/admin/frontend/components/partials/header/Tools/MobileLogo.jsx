import React from "react";
import Link from "next/link";
import useDarkMode from "@/hooks/useDarkMode";
import { useCompanyContext } from "@/contexts/CompanyContext";

import MainLogo from "@/assets/images/logo/logo.svg";
import LogoWhite from "@/assets/images/logo/logo-white.svg";

const MobileLogo = () => {
  const [isDark] = useDarkMode();
  const { companyBranding } = useCompanyContext();

  // Função para obter o logo correto
  const getLogo = () => {
    // Se tem branding da empresa, usar os logos específicos
    if (companyBranding) {
      if (isDark && companyBranding.logoUrlDark) {
        return companyBranding.logoUrlDark;
      }
      if (!isDark && companyBranding.logoUrl) {
        return companyBranding.logoUrl;
      }
      // Fallback dentro do branding da empresa
      if (companyBranding.logoUrl) {
        return companyBranding.logoUrl;
      }
    }
    
    // Fallback para logos padrão quando não há branding
    return isDark ? LogoWhite : MainLogo;
  };

  return (
    <Link href="/dashboard">
      <div className="flex flex-col items-end">
        <img 
          src={getLogo()} 
          alt="Logo" 
          style={{ maxHeight: '35px', width: 'auto' }}
        />
        <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 mr-1">
          by Coinage
        </span>
      </div>
    </Link>
  );
};

export default MobileLogo;

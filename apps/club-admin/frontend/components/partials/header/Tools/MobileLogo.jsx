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
    // Se tem branding da empresa, usar miniUrl ou logo_url
    if (companyBranding) {
      // Priorizar mini logo para mobile
      const logoUrl = companyBranding.miniUrl || companyBranding.logo_url;
      if (logoUrl) {
        return logoUrl;
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
      </div>
    </Link>
  );
};

export default MobileLogo;

import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import useDarkMode from "@/hooks/useDarkMode";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import { useCompanyContext } from "@/contexts/CompanyContext";
import useImageFallback from "@/hooks/useImageFallback";
import { generateLogoPlaceholder, generateCompanyPlaceholder } from "@/utils/placeholderUtils";
import useAuthStore from "@/store/authStore";

const SidebarLogo = ({ menuHover }) => {
  const [isDark] = useDarkMode();
  const [collapsed, setMenuCollapsed] = useSidebar();
  // semi dark
  const [isSemiDark] = useSemiDark();
  // skin
  const [skin] = useSkin();
  const { companyBranding, currentCompany } = useCompanyContext();
  const { user } = useAuthStore();

  // Verificar se é super admin do sistema
  const isSystemAdmin = user?.email?.includes('@clubedigital.com');

  // Função para obter logo de fallback
  const getFallbackLogo = (isCompact = false) => {
    // Se temos informações da empresa, usar placeholder personalizado
    if (currentCompany?.name) {
      return generateCompanyPlaceholder(currentCompany.name, isDark, isCompact);
    }
    
    // Fallback genérico
    return generateLogoPlaceholder(isDark, isCompact);
  };

  // Hook para fallback de imagem (mini logo)
  const { getImageSrc: getMiniImageSrc, handleImageError: handleMiniImageError } = useImageFallback(getFallbackLogo(true));
  
  // Hook para fallback de imagem (text logo)  
  const { getImageSrc: getTextImageSrc, handleImageError: handleTextImageError } = useImageFallback(getFallbackLogo(false));

  // Verificar se tem mini + text disponíveis
  const hasMiniAndText = () => {
    // Super admins sempre têm mini + text
    if (isSystemAdmin) return true;

    if (!companyBranding) return false;

    const hasMini = !!(companyBranding.miniUrl || companyBranding.miniUrlDark);
    const hasText = !!(companyBranding.textUrl || companyBranding.textUrlDark);

    return hasMini && hasText;
  };

  // Obter mini logo (logo-c)
  const getMiniLogo = () => {
    // Super admins do sistema - usar logo Clube Digital
    if (isSystemAdmin) {
      return isDark || isSemiDark
        ? "/assets/images/logo/white-mini.svg"
        : "/assets/images/logo/mini.svg";
    }

    if (companyBranding) {
      // Se tem mini + text, usar mini
      if (hasMiniAndText()) {
        const miniUrl = isDark
          ? (companyBranding.miniUrlDark || companyBranding.miniUrl)
          : (companyBranding.miniUrl || companyBranding.miniUrlDark);

        if (miniUrl) {
          return getMiniImageSrc(miniUrl);
        }
      }

      // Se não tem mini+text, usar logo principal como mini
      const logoUrl = isDark
        ? (companyBranding.logoUrlDark || companyBranding.logoUrl)
        : (companyBranding.logoUrl || companyBranding.logoUrlDark);

      if (logoUrl) {
        return getMiniImageSrc(logoUrl);
      }
    }

    // Fallback para assets estáticos
    return !isDark && !isSemiDark
      ? "/assets/images/logo/logo-c.svg"
      : "/assets/images/logo/logo-c-white.svg";
  };

  // Obter text logo
  const getTextLogo = () => {
    // Super admins do sistema - usar logo completo
    if (isSystemAdmin) {
      return isDark || isSemiDark
        ? "/assets/images/logo/white-logo.svg"
        : "/assets/images/logo/logo.svg";
    }

    if (companyBranding) {
      // Se tem mini + text, usar text
      if (hasMiniAndText()) {
        const textUrl = isDark
          ? (companyBranding.textUrlDark || companyBranding.textUrl)
          : (companyBranding.textUrl || companyBranding.textUrlDark);

        if (textUrl) {
          return getTextImageSrc(textUrl);
        }
      }

      // Se não tem mini+text, não mostrar nada (será escondido)
      return null;
    }

    // Fallback para assets estáticos
    return !isDark && !isSemiDark
      ? "/assets/images/logo/text.svg"
      : "/assets/images/logo/text-white.svg";
  };
  return (
    <>
      <div
        className={` logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] pt-6 px-4 
        ${menuHover ? "logo-hovered" : ""}
        ${
          skin === "bordered"
            ? " border-b border-r-0 border-slate-200 dark:border-slate-700"
            : " border-none"
        }
        
        `}
      >
        <Link href="/dashboard">
          <div className="flex items-center space-x-2">
            {hasMiniAndText() ? (
              // Caso 1: Tem mini + text - mostrar mini sempre e text quando expandido
              <>
                <div className="logo-icon">
                  <img
                    src={getMiniLogo()}
                    alt="Logo"
                    width={35}
                    height={35}
                    onError={handleMiniImageError}
                    style={{ maxWidth: '35px', maxHeight: '35px', objectFit: 'contain' }}
                  />
                </div>

                {(!collapsed || menuHover) && (
                  <div>
                    <img 
                      src={getTextLogo()} 
                      alt="Logo Text" 
                      width={140}
                      onError={handleTextImageError}
                      style={{ maxWidth: '140px', maxHeight: '35px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </>
            ) : (
              // Caso 2: Só tem logo principal - mostrar sempre, ocupando espaço todo
              <div className="logo-icon">
                <img
                  src={getMiniLogo()}
                  alt="Logo"
                  style={{ maxHeight: '35px', width: 'auto', objectFit: 'contain' }}
                  onError={handleMiniImageError}
                />
              </div>
            )}
          </div>
        </Link>

        {(!collapsed || menuHover) && (
          <div
            onClick={() => setMenuCollapsed(!collapsed)}
            className={`h-4 w-4 border-[1.5px] border-slate-900 dark:border-slate-700 rounded-full transition-all duration-150
            ${
              collapsed
                ? ""
                : "ring-2 ring-inset ring-offset-4 ring-black-900 dark:ring-slate-400 bg-slate-900 dark:bg-slate-400 dark:ring-offset-slate-700"
            }
            `}
          ></div>
        )}
      </div>
    </>
  );
};

export default SidebarLogo;

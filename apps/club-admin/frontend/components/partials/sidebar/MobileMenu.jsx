import React, { useRef, useEffect, useState, useMemo } from "react";

import Navmenu from "./Navmenu";
import { getMenuItems } from '@/constants/menu-config';
import SimpleBar from "simplebar-react";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import useDarkMode from "@/hooks/useDarkMode";
import Link from "next/link";
import useMobileMenu from "@/hooks/useMobileMenu";
import Icon from "@/components/ui/Icon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompanyContext } from "@/contexts/CompanyContext";

const MobileMenu = ({ className = "custom-class" }) => {
  const { t, isInitialized } = useLanguage();
  const { companyBranding, currentCompany } = useCompanyContext();
  const menuItems = useMemo(() => {
    if (!isInitialized || !t) return [];
    return getMenuItems(t);
  }, [t, isInitialized]);
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    scrollableNodeRef.current.addEventListener("scroll", handleScroll);
  }, [scrollableNodeRef]);

  const [isSemiDark] = useSemiDark();
  // skin
  const [skin] = useSkin();
  const [isDark] = useDarkMode();
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  // Get logo and club name from branding
  const getLogo = () => {
    if (companyBranding) {
      // Use logoIconUrl or logoUrl from branding
      return companyBranding.logoIconUrl || companyBranding.logoUrl;
    }
    // Fallback to default
    return isDark || isSemiDark
      ? "/assets/images/logo/logo-c-white.svg"
      : "/assets/images/logo/logo-c.svg";
  };

  const getClubName = () => {
    return companyBranding?.brand_name || currentCompany?.name || 'Clube Digital';
  };
  return (
    <div
      className={`${className} fixed  top-0 bg-white dark:bg-slate-800 shadow-lg  h-full   w-[248px]`}
    >
      <div className="logo-segment flex justify-between items-center bg-white dark:bg-slate-800 z-[9] h-[85px]  px-4 ">
        <Link href="/">
          <div className="flex items-center space-x-4">
            <div className="logo-icon">
              <img
                src={getLogo()}
                alt={getClubName()}
                width={40}
                height={40}
                style={{ maxHeight: '40px', width: 'auto' }}
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {getClubName()}
              </h1>
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          className="cursor-pointer text-slate-900 dark:text-white text-2xl"
        >
          <Icon icon="heroicons:x-mark" />
        </button>
      </div>

      <div
        className={`h-[60px]  absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
          scroll ? " opacity-100" : " opacity-0"
        }`}
      ></div>
      <SimpleBar
        className="sidebar-menu px-4 h-[calc(100%-80px)]"
        scrollableNodeProps={{ ref: scrollableNodeRef }}
      >
        <Navmenu menus={menuItems} />
        {/* <div className="bg-slate-900 mb-24 lg:mb-10 mt-24 p-4 relative text-center rounded-2xl text-white">
          <img
            src="/assets/images/svg/rabit.svg"
            alt=""
            className="mx-auto relative -mt-[73px]"
          />
          <div className="max-w-[160px] mx-auto mt-6">
            <div className="widget-title">Unlimited Access</div>
            <div className="text-xs font-light">
              Upgrade your system to business plan
            </div>
          </div>
          <div className="mt-6">
            <button className="btn bg-white hover:bg-opacity-80 text-slate-900 btn-sm w-full block">
              Upgrade
            </button>
          </div>
        </div> */}
      </SimpleBar>
    </div>
  );
};

export default MobileMenu;

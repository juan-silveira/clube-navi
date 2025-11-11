import React, { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/ui/UserAvatar";
import Switch from "@/components/ui/Switch";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/api";
import { getNotificationSoundService } from "@/services/notificationSoundService";
import { useAlertContext } from "@/contexts/AlertContext";
import { useTranslation } from "@/hooks/useTranslation";

const ProfileLabel = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation('header');

  // Função para formatar nome (primeiro + último)
  const formatNameForHeader = (fullName) => {
    if (!fullName) return t('profile.defaultUser');
    
    const names = fullName.trim().split(' ').filter(name => name.length > 0);
    if (names.length === 0) return t('profile.defaultUser');
    if (names.length === 1) return names[0];
    
    // Retorna primeiro nome + último nome
    return `${names[0]} ${names[names.length - 1]}`;
  };
  
  return (
    <div className="flex items-center">
      <div className="flex-1 ltr:mr-[10px] rtl:ml-[10px]">
        <UserAvatar size="sm" />
      </div>
      <div className="flex-none text-slate-600 dark:text-white text-sm font-normal items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-[85px] block">
          {formatNameForHeader(user?.name)}
        </span>
        <span className="text-base inline-block ltr:ml-[10px] rtl:mr-[10px]">
          <Icon icon="heroicons-outline:chevron-down"></Icon>
        </span>
      </div>
    </div>
  );
};

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { showSuccess, showError } = useAlertContext();
  const { t } = useTranslation('header');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Carregar preferência de som do localStorage
  useEffect(() => {
    const soundService = getNotificationSoundService();
    if (soundService) {
      setSoundEnabled(soundService.isEnabled());
    }
  }, []);

  // Posicionamento do dropdown
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // w-64
      
      let top = triggerRect.bottom + 8;
      let left = triggerRect.right - dropdownWidth;
      
      // Ajustar se sair da viewport
      const viewportWidth = window.innerWidth;
      if (left < 8) {
        left = 8;
      }
      if (left + dropdownWidth > viewportWidth - 8) {
        left = viewportWidth - dropdownWidth - 8;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSoundToggle = (enabled) => {
    const soundService = getNotificationSoundService();
    if (soundService) {
      if (enabled) {
        soundService.enable();
        showSuccess(t('profile.menu.soundEnabled'), t('profile.menu.soundActivated'));
      } else {
        soundService.disable();
        showSuccess(t('profile.menu.soundDisabled'), t('profile.menu.soundDeactivated'));
      }
      setSoundEnabled(enabled);
    }
  };

  const ProfileMenu = [
    {
      label: t('profile.menu.profile'),
      icon: "heroicons-outline:user",
      action: () => {
        router.push("/profile");
        setIsOpen(false);
      },
    },
    {
      label: t('profile.menu.logout'),
      icon: "heroicons-outline:login",
      action: () => {
        handleLogout();
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <ProfileLabel />
      </div>
      
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-64 bg-slate-800 dark:bg-slate-900 rounded-lg shadow-2xl z-[9999] border border-slate-700 dark:border-slate-600 overflow-hidden"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          {/* Header com informações do usuário */}
          <div className="p-4 bg-slate-700 dark:bg-slate-800 border-b border-slate-600 dark:border-slate-700">
            <div className="text-white font-medium text-sm">{user?.name || t('profile.defaultUser')}</div>
            <div className="text-slate-400 text-xs mt-1">{user?.email || t('profile.defaultEmail')}</div>
          </div>

          {/* Switch de Som das Notificações */}
          <div className="px-4 py-3 border-b border-slate-700 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-slate-400 mr-3">
                  <Icon icon="heroicons-outline:volume-up" />
                </span>
                <span className="text-sm text-slate-300">{t('profile.menu.notificationSound')}</span>
              </div>
              <Switch
                value={soundEnabled}
                onChange={handleSoundToggle}
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {ProfileMenu.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-700 dark:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-slate-400 mr-3">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="text-sm">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Profile;

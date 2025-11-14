"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SimpleInput from "@/components/ui/SimpleInput";
import { useAlertContext } from "@/contexts/AlertContext";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/api";
import useDarkMode from "@/hooks/useDarkMode";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelectorSimple from "@/components/ui/LanguageSelectorSimple";

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isDark] = useDarkMode();
  const { showSuccess, showError, showInfo } = useAlertContext();
  const { t } = useTranslation('auth');

  // Estado para branding do clube
  const [branding, setBranding] = useState({
    appName: 'Clube Digital',
    logoUrl: '/assets/images/logo/logo.svg',
    logoUrlDark: '/assets/images/logo/logo-white.svg',
    loginDescriptionPt: 'Sistema de gestão de tokens e transações em blockchain',
    loginDescriptionEn: 'Token and blockchain transaction management system',
    loginDescriptionEs: 'Sistema de gestión de tokens y transacciones en blockchain',
    loginWelcomePt: 'Bem-vindo ao Clube Digital',
    loginWelcomeEn: 'Welcome to Clube Digital',
    loginWelcomeEs: 'Bienvenido a Clube Digital',
    loginIllustrationUrl: '/shared-assets/images/auth/ils1.svg',
    primaryColor: '#3B82F6'
  });
  const [brandingLoading, setBrandingLoading] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');

  // Detectar mudanças de idioma
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentLanguage(localStorage.getItem('language') || 'pt-BR');
    };

    // Configurar idioma inicial
    if (typeof window !== 'undefined') {
      setCurrentLanguage(localStorage.getItem('language') || 'pt-BR');

      // Listener para mudanças de idioma
      window.addEventListener('storage', handleStorageChange);

      // Polling como fallback (porque storage event não funciona na mesma aba)
      const intervalId = setInterval(handleStorageChange, 500);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(intervalId);
      };
    }
  }, []);

  // Buscar configurações de branding
  useEffect(() => {
    const fetchBranding = async () => {
      setBrandingLoading(true);
      try {
        // Extrair subdomínio do host
        const host = window.location.hostname;
        const subdomain = host.split('.')[0]; // Ex: clubenavi de clubenavi.localhost

        // Buscar branding do clube via API (endpoint público)
        const response = await fetch(`/api/public/club-admin/branding?subdomain=${subdomain}`);
        const data = await response.json();

        if (data.success && data.data) {
          setBranding({
            appName: data.data.appName || 'Clube Digital',
            logoUrl: data.data.logoUrl || '/assets/images/logo/logo.svg',
            logoUrlDark: data.data.logoUrl || '/assets/images/logo/logo-white.svg',
            loginDescriptionPt: data.data.loginDescriptionPt || 'Sistema de gestão de tokens e transações em blockchain',
            loginDescriptionEn: data.data.loginDescriptionEn || 'Token and blockchain transaction management system',
            loginDescriptionEs: data.data.loginDescriptionEs || 'Sistema de gestión de tokens y transacciones en blockchain',
            loginWelcomePt: data.data.loginWelcomePt || `Bem-vindo ao ${data.data.appName || 'Clube Digital'}`,
            loginWelcomeEn: data.data.loginWelcomeEn || `Welcome to ${data.data.appName || 'Clube Digital'}`,
            loginWelcomeEs: data.data.loginWelcomeEs || `Bienvenido a ${data.data.appName || 'Clube Digital'}`,
            loginIllustrationUrl: data.data.loginIllustrationUrl || '/shared-assets/images/auth/ils1.svg',
            primaryColor: data.data.primaryColor || '#3B82F6',
            faviconUrl: data.data.faviconUrl
          });

          // Atualizar título da página
          document.title = `${data.data.appName || 'Clube Digital'} - Login`;

          // Atualizar favicon se disponível
          if (data.data.faviconUrl) {
            const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
            existingFavicons.forEach(link => link.remove());

            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = data.data.faviconUrl;
            document.head.appendChild(link);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar branding:', error);
        // Usar valores padrão em caso de erro
      } finally {
        setBrandingLoading(false);
      }
    };

    fetchBranding();
  }, []);

  // Verificar toasts do sessionStorage
  useEffect(() => {
    const currentUrl = window.location.pathname;
    if (currentUrl === '/login') {
      sessionStorage.removeItem('showLoginError');
      sessionStorage.removeItem('showLoginSuccess');
      sessionStorage.removeItem('loginUserName');
    }

    const logoutSuccess = sessionStorage.getItem('showLogoutSuccess');
    if (logoutSuccess) {
      showSuccess(t('messages.logoutSuccess') || "Logout realizado com sucesso");
      sessionStorage.removeItem('showLogoutSuccess');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'auth') {
      showError(t('messages.invalidCredentials') || "Email ou senha incorretos");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showSuccess, showError, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('validations.emailRequired') || "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validations.emailInvalid') || "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = t('validations.passwordRequired') || "Senha é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password,
        formData.twoFactorCode || null
      );

      if (response.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setIsLoading(false);
        showInfo(t('messages.enter2FACode') || 'Digite o código do seu aplicativo autenticador');
        return;
      }

      const { user, accessToken, refreshToken, isFirstAccess } = response.data;

      login(user, accessToken, refreshToken, isFirstAccess);

      if (isFirstAccess) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      setIsLoading(false);

      let errorMessage = t('messages.loginError') || "Erro ao fazer login";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = requiresTwoFactor
          ? (t('messages.invalid2FACode') || "Código 2FA inválido")
          : (t('messages.invalidCredentials') || "Email ou senha incorretos");
      } else if (error.response?.status === 0) {
        errorMessage = t('messages.connectionError') || "Erro de conexão com o servidor";
      }

      showError(errorMessage);
    }
  };

  // Calcular textos traduzidos dinamicamente baseado no branding e idioma
  const loginDescription = useMemo(() => {
    if (currentLanguage === 'en-US') return branding.loginDescriptionEn;
    if (currentLanguage === 'es') return branding.loginDescriptionEs;
    return branding.loginDescriptionPt;
  }, [currentLanguage, branding.loginDescriptionPt, branding.loginDescriptionEn, branding.loginDescriptionEs]);

  const loginWelcome = useMemo(() => {
    if (currentLanguage === 'en-US') return branding.loginWelcomeEn;
    if (currentLanguage === 'es') return branding.loginWelcomeEs;
    return branding.loginWelcomePt;
  }, [currentLanguage, branding.loginWelcomePt, branding.loginWelcomeEn, branding.loginWelcomeEs]);

  // Loading do branding
  if (brandingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('login.loading') || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        :root {
          --brand-primary: ${branding.primaryColor};
        }
        .btn-brand {
          background-color: ${branding.primaryColor};
          border-color: ${branding.primaryColor};
        }
        .btn-brand:hover {
          opacity: 0.9;
        }
      `}</style>

      <div className="loginwrapper">
        {/* Seletor de idioma fixo no canto superior direito */}
        <div className="fixed top-4 right-4 z-[999]">
          <LanguageSelectorSimple />
        </div>

        <div className="lg-inner-column">
          <div className="left-column relative z-[1]">
            <div className="max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20">
              <Link href="/">
                <img
                  src={isDark ? branding.logoUrlDark : branding.logoUrl}
                  alt={branding.appName}
                  className="mb-10 h-12 object-contain"
                />
              </Link>
              <h4>
                {loginDescription}
              </h4>
            </div>
            <div className="absolute left-0 right-0 z-[-1] px-8" style={{ bottom: '40px', height: 'calc(100% - 240px)', maxHeight: '600px' }}>
              <img
                src={branding.loginIllustrationUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <div className="right-column relative">
            <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
              <div className="auth-box h-full flex flex-col justify-center">
                <div className="mobile-logo text-center mb-6 lg:hidden block">
                  <Link href="/">
                    <img
                      src={isDark ? branding.logoUrlDark : branding.logoUrl}
                      alt={branding.appName}
                      className="mx-auto h-10 object-contain"
                    />
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-4">
                  <h4 className="font-medium">{loginWelcome}</h4>
                  <div className="text-slate-500 text-base">
                    {t('login.subtitle') || 'Faça login para acessar sua conta'}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <SimpleInput
                    type="email"
                    name="email"
                    label={t('login.form.email') || 'Email'}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('login.form.emailPlaceholder') || 'Digite seu email'}
                    error={errors.email}
                    required
                    disabled={requiresTwoFactor}
                  />

                  <SimpleInput
                    type="password"
                    name="password"
                    label={t('login.form.password') || 'Senha'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('login.form.passwordPlaceholder') || 'Digite sua senha'}
                    error={errors.password}
                    required
                    disabled={requiresTwoFactor}
                  />

                  {requiresTwoFactor && (
                    <div className="space-y-3">
                      <SimpleInput
                        type="text"
                        name="twoFactorCode"
                        label={useBackupCode ? (t('login.form.backupCode') || 'Código de Backup') : (t('login.form.twoFactorCode') || 'Código 2FA')}
                        value={formData.twoFactorCode}
                        onChange={(e) => {
                          const maxLength = useBackupCode ? 8 : 6;
                          const cleanValue = useBackupCode
                            ? e.target.value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase().slice(0, maxLength)
                            : e.target.value.replace(/\D/g, "").slice(0, maxLength);

                          setFormData(prev => ({
                            ...prev,
                            twoFactorCode: cleanValue
                          }));

                          if (errors.twoFactorCode) {
                            setErrors(prev => ({
                              ...prev,
                              twoFactorCode: ""
                            }));
                          }
                        }}
                        placeholder={useBackupCode ? (t('login.form.backupCodePlaceholder') || 'Digite o código de backup') : (t('login.form.twoFactorCodePlaceholder') || 'Digite o código 2FA')}
                        error={errors.twoFactorCode}
                        required
                        maxLength={useBackupCode ? 8 : 6}
                        autoFocus
                        className="text-center font-mono tracking-widest"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        {useBackupCode
                          ? (t('login.twoFactor.backupCodeInfo') || 'Digite um dos códigos de backup de 8 caracteres')
                          : (t('login.twoFactor.authenticatorHelp') || 'Digite o código de 6 dígitos do seu aplicativo autenticador')
                        }
                      </p>
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUseBackupCode(!useBackupCode);
                            setFormData(prev => ({
                              ...prev,
                              twoFactorCode: ""
                            }));
                            setErrors(prev => ({
                              ...prev,
                              twoFactorCode: ""
                            }));
                          }}
                          className="text-sm font-medium hover:opacity-80 transition-opacity underline"
                          style={{ color: branding.primaryColor }}
                        >
                          {useBackupCode
                            ? (t('login.twoFactor.useAuthenticator') || 'Usar código do autenticador')
                            : (t('login.twoFactor.useBackupCode') || 'Usar código de backup')
                          }
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-brand block w-full text-center text-white"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? (t('login.form.submitButtonLoading') || 'Entrando...')
                      : requiresTwoFactor
                        ? (t('login.form.verifyCodeButton') || 'Verificar Código')
                        : (t('login.form.submitButton') || 'Entrar')
                    }
                  </button>

                  {requiresTwoFactor && (
                    <button
                      type="button"
                      onClick={() => {
                        setRequiresTwoFactor(false);
                        setUseBackupCode(false);
                        setFormData({ ...formData, twoFactorCode: "" });
                      }}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-full text-center"
                    >
                      {t('login.form.backToLogin') || 'Voltar ao login'}
                    </button>
                  )}
                </form>
              </div>
              <div className="auth-footer text-center">
                Copyright © {new Date().getFullYear()} {branding.appName}.{' '}
                {currentLanguage === 'en-US'
                  ? 'All Rights Reserved.'
                  : currentLanguage === 'es'
                  ? 'Todos los derechos reservados.'
                  : 'Todos os direitos reservados.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

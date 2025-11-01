"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SimpleInput from "@/components/ui/SimpleInput";
import useGlobalAlert from "@/hooks/useGlobalAlert";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/api";
import useDarkMode from "@/hooks/useDarkMode";
import useCompanyBranding from "@/hooks/useCompanyBranding";
import { useTranslation } from "@/hooks/useTranslation"; // Importação adicionada

const ChangePasswordPage = () => {
  const router = useRouter();
  const { 
    isAuthenticated, 
    requiresPasswordChange, 
    isLoading, 
    setLoading,
    clearRequiresPasswordChange 
  } = useAuthStore();
  const [isDark] = useDarkMode();
  const { showSuccess, showError } = useGlobalAlert();
  const { t } = useTranslation('security'); // Hook de tradução
  const { getAuthIllustration, getBackgroundStyles, getBackgroundClasses, getBackgroundContainerClasses } = useCompanyBranding();
  
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Verificar se precisa trocar senha
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    if (!requiresPasswordChange) {
      router.push('/');
    }
  }, [isAuthenticated, requiresPasswordChange, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(t('changePassword.validation.minLength', { minLength }));
    }
    if (!hasUpperCase) {
      errors.push(t('changePassword.validation.upperCase'));
    }
    if (!hasLowerCase) {
      errors.push(t('changePassword.validation.lowerCase'));
    }
    if (!hasNumbers) {
      errors.push(t('changePassword.validation.numbers'));
    }
    if (!hasSpecialChar) {
      errors.push(t('changePassword.validation.specialChar'));
    }

    return errors;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = t('changePassword.errors.oldPasswordRequired');
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('changePassword.errors.newPasswordRequired');
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(", ");
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('changePassword.errors.confirmPasswordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('changePassword.errors.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(formData.oldPassword, formData.newPassword);
      
      // Limpar flag de troca de senha
      clearRequiresPasswordChange();
      
      showSuccess(t('changePassword.messages.success'));
      
      // Redirecionar para o dashboard
      router.push('/');
      
    } catch (error) {
      let errorMessage = t('changePassword.errors.defaultChangeError');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = t('changePassword.errors.incorrectCurrentPassword');
      } else if (error.response?.status === 0) {
        errorMessage = t('changePassword.errors.serverConnectionError');
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !requiresPasswordChange) {
    return null;
  }

  return (
    <>
      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="left-column relative z-[1]">
            <div className="max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20">
              <Link href="/">
                <img
                  src={
                    isDark
                      ? "/assets/images/logo/logo-white.svg"
                      : "/assets/images/logo/logo.svg"
                  }
                  alt=""
                  className="mb-10"
                />
              </Link>
              <h4>
                {t('changePassword.page.header_p1')}{" "}
                <span className="text-slate-800 dark:text-slate-400 font-bold">
                  {t('changePassword.page.header_p2')}
                </span>{" "}
                {t('changePassword.page.header_p3')}
              </h4>
            </div>
            <div className={getBackgroundContainerClasses()}>
              <img
                src={getAuthIllustration()}
                alt=""
                className={getBackgroundClasses()}
                style={getBackgroundStyles()}
              />
            </div>
          </div>
          <div className="right-column relative">
            <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
              <div className="auth-box h-full flex flex-col justify-center">
                <div className="mobile-logo text-center mb-6 lg:hidden block">
                  <Link href="/">
                    <img
                      src={
                        isDark
                          ? "/assets/images/logo/logo-white.svg"
                          : "/assets/images/logo/logo.svg"
                      }
                      alt=""
                      className="mx-auto"
                    />
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-4">
                  <h4 className="font-medium">
                    {t('changePassword.page.form_title')}
                  </h4>
                  <div className="text-slate-500 text-base">
                    {t('changePassword.page.form_subtitle')}
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <SimpleInput
                    type="password"
                    name="oldPassword"
                    label={t('changePassword.labels.oldPassword')}
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    placeholder={t('changePassword.placeholders.oldPassword')}
                    error={errors.oldPassword}
                    required
                  />

                  <SimpleInput
                    type="password"
                    name="newPassword"
                    label={t('changePassword.labels.newPassword')}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder={t('changePassword.placeholders.newPassword')}
                    error={errors.newPassword}
                    required
                  />
                  <div className="mt-2 text-xs text-slate-500">
                    {t('changePassword.page.password_hint')}
                  </div>

                  <SimpleInput
                    type="password"
                    name="confirmPassword"
                    label={t('changePassword.labels.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={t('changePassword.placeholders.confirmPassword')}
                    error={errors.confirmPassword}
                    required
                  />

                  <button 
                    type="submit"
                    className="btn btn-dark block w-full text-center"
                    disabled={isLoading}
                  >
                    {isLoading ? t('changePassword.loading') : t('changePassword.button')}
                  </button>
                </form>
              </div>
              <div className="auth-footer text-center">
                {t('common.footer_copyright')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPage;

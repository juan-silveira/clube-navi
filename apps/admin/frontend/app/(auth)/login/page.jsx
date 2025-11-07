"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SimpleInput from "@/components/ui/SimpleInput";
import { useAlertContext } from "@/contexts/AlertContext";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/api";
import useDarkMode from "@/hooks/useDarkMode";

const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, setLoading } = useAuthStore();
  const [isDark] = useDarkMode();
  const { showSuccess, showError, showInfo } = useAlertContext();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [errors, setErrors] = useState({});
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Alterar title da página
  useEffect(() => {
    document.title = 'Clube Digital - Login';
  }, []);

  // Verificar toasts do sessionStorage
  useEffect(() => {
    // Limpar resíduos de sessões anteriores (exceto logout se vier de uma sessão válida)
    const currentUrl = window.location.pathname;
    if (currentUrl === '/login') {
      // Se estamos na página de login, limpar flags de login
      sessionStorage.removeItem('showLoginError');
      sessionStorage.removeItem('showLoginSuccess');
      sessionStorage.removeItem('loginUserName');
    }

    // Verificar se há sucesso de logout (só mostrar se vier de uma sessão válida)
    const logoutSuccess = sessionStorage.getItem('showLogoutSuccess');
    if (logoutSuccess) {
      showSuccess("Logout realizado com sucesso");
      sessionStorage.removeItem('showLogoutSuccess');
    }

    // Verificar se há erro na URL (após redirecionamento)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'auth') {
      showError("Email ou senha incorretos");
      // Limpar o parâmetro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
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
      const loginData = {
        email: formData.email,
        password: formData.password
      };

      // Se já está no modo 2FA, incluir o código
      if (requiresTwoFactor && formData.twoFactorCode) {
        loginData.twoFactorCode = formData.twoFactorCode;
      }

      // console.log('🔐 [FRONTEND] Fazendo login...', { email: loginData.email, has2FACode: !!loginData.twoFactorCode });
      const response = await authService.login(loginData.email, loginData.password, loginData.twoFactorCode);
      // console.log('🔐 [FRONTEND] Resposta recebida:', { requiresTwoFactor: response.requiresTwoFactor, success: response.success, hasData: !!response.data });

      // Verificar se requer 2FA
      if (response.requiresTwoFactor) {
        // console.log('🔐 [FRONTEND] Backend solicitou 2FA! Mostrando campo...');
        setRequiresTwoFactor(true);
        setLoading(false);
        showInfo('Digite o código do seu aplicativo autenticador');
        return;
      }

      // console.log('✅ [FRONTEND] Login bem-sucedido! Redirecionando...');
      // Extrair dados da estrutura correta: response.data
      const { user, accessToken, refreshToken, isFirstAccess } = response.data;

      // Fazer login no store
      login(user, accessToken, refreshToken, isFirstAccess);

      // Redirecionar após login bem-sucedido
      if (isFirstAccess) {
        window.location.href = '/change-password';
      } else {
        // Redirecionar para a raiz que mostrará o dashboard
        window.location.href = '/';
      }

    } catch (error) {
      setLoading(false);

      let errorMessage = "Erro ao fazer login";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = requiresTwoFactor ? "Código 2FA inválido" : "Email ou senha incorretos";
      } else if (error.response?.status === 0) {
        errorMessage = "Erro de conexão com o servidor";
      }

      // Exibir toast de erro imediatamente
      showError(errorMessage);
    }
  };

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
              Sistema de gestão de tokens e transações em{" "}
                <span className="text-slate-800 dark:text-slate-400 font-bold">
                blockchain
                </span>{" "}
                .
              </h4>
            </div>
            <div className="absolute left-0 2xl:bottom-[-160px] bottom-[-130px] h-full w-full z-[-1]">
              <img
                src="/assets/images/auth/ils1.svg"
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
                  <h4 className="font-medium">Bem-vindo ao Clube Digital</h4>
                  <div className="text-slate-500 text-base">
                    Faça login para acessar sua conta
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <SimpleInput
                    type="email"
                    name="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Digite seu email"
                    error={errors.email}
                    required
                    disabled={requiresTwoFactor}
                  />

                  <SimpleInput
                    type="password"
                    name="password"
                    label="Senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha"
                    error={errors.password}
                    required
                    disabled={requiresTwoFactor}
                  />

                  {requiresTwoFactor && (
                    <div className="space-y-3">
                      <SimpleInput
                        type="text"
                        name="twoFactorCode"
                        label={useBackupCode ? "Código de Backup" : "Código 2FA"}
                        value={formData.twoFactorCode}
                        onChange={(e) => {
                          const maxLength = useBackupCode ? 8 : 6;
                          // Para backup code, aceita A-F e 0-9 (hexadecimal)
                          // Para TOTP, aceita apenas dígitos
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
                        placeholder={useBackupCode ? "A3F2B8C1" : "000000"}
                        error={errors.twoFactorCode}
                        required
                        maxLength={useBackupCode ? 8 : 6}
                        autoFocus
                        className="text-center font-mono tracking-widest"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        {useBackupCode
                          ? 'Digite um dos seus códigos de backup de 8 caracteres'
                          : 'Digite o código do seu aplicativo autenticador (Google Authenticator, Authy, etc.)'
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
                          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors underline"
                        >
                          {useBackupCode
                            ? '← Voltar para código do autenticador'
                            : 'Usar código de backup 2FA →'
                          }
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-dark block w-full text-center"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : requiresTwoFactor ? "Verificar Código" : "Entrar"}
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
                      ← Voltar ao login
                    </button>
                  )}
                </form>
                
              </div>
              <div className="auth-footer text-center">
                Copyright 2025, Clube Digital All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SimpleInput from "@/components/ui/SimpleInput";
import { useAlertContext } from "@/contexts/AlertContext";
import useDarkMode from "@/hooks/useDarkMode";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isDark] = useDarkMode();
  const { showSuccess, showError } = useAlertContext();

  const [isLoading, setIsLoading] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Clube Navi - Redefinir Senha';
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenValidating(false);
        showError("Token de recuperação não encontrado");
        return;
      }

      try {
        const response = await fetch(`/api/password-reset/validate/${token}`);
        const data = await response.json();

        if (data.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          showError(data.message || "Token inválido ou expirado");
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
        setTokenValid(false);
        showError("Erro ao validar token de recuperação");
      } finally {
        setTokenValidating(false);
      }
    };

    if (!isSubmitted) {
      validateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

    if (!formData.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Nova senha deve ter pelo menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
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
      const response = await fetch(`/api/password-reset/reset/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        showSuccess("Senha redefinida com sucesso!");

        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        showError(data.message || "Erro ao redefinir senha");
      }

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      showError("Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Validando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="left-column relative z-[1]">
            <div className="max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20">
              <Link href="/login">
                <img
                  src={isDark ? "/assets/images/logo/logo-white.svg" : "/assets/images/logo/logo.svg"}
                  alt="Clube Navi"
                  className="mb-10"
                />
              </Link>
              <h4>
                Sistema de gestão de tokens e transações em{" "}
                <span className="text-slate-800 dark:text-slate-400 font-bold">
                  blockchain
                </span>
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
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </div>
                    <h4 className="font-medium mb-2">Token Inválido</h4>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">
                      O link de recuperação é inválido ou já expirou.
                    </div>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Solicitar novo link de recuperação
                  </Link>
                </div>
              </div>
              <div className="auth-footer text-center">
                Copyright 2025, Clube Navi All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loginwrapper">
      <div className="lg-inner-column">
        <div className="left-column relative z-[1]">
          <div className="max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20">
            <Link href="/login">
              <img
                src={isDark ? "/assets/images/logo/logo-white.svg" : "/assets/images/logo/logo.svg"}
                alt="Clube Navi"
                className="mb-10"
              />
            </Link>
            <h4>
              Sistema de gestão de tokens e transações em{" "}
              <span className="text-slate-800 dark:text-slate-400 font-bold">
                blockchain
              </span>
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
                <Link href="/login">
                  <img
                    src={isDark ? "/assets/images/logo/logo-white.svg" : "/assets/images/logo/logo.svg"}
                    alt="Clube Navi"
                    className="mx-auto"
                  />
                </Link>
              </div>

              {!isSubmitted ? (
                <>
                  <div className="text-center 2xl:mb-10 mb-4">
                    <h4 className="font-medium">Redefinir Senha</h4>
                    <div className="text-slate-500 text-base">
                      Crie uma nova senha para sua conta
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <SimpleInput
                      type="password"
                      name="newPassword"
                      label="Nova Senha"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Digite sua nova senha"
                      error={errors.newPassword}
                      required
                    />

                    <SimpleInput
                      type="password"
                      name="confirmPassword"
                      label="Confirmar Nova Senha"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirme sua nova senha"
                      error={errors.confirmPassword}
                      required
                    />

                    <button
                      type="submit"
                      className="btn btn-dark block w-full text-center"
                      disabled={isLoading}
                    >
                      {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h4 className="font-medium mb-2">Senha Redefinida!</h4>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">
                      Sua senha foi redefinida com sucesso. Redirecionando para o login...
                    </div>
                  </div>
                </div>
              )}

              <div className="md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 mt-12 uppercase text-sm">
                <Link
                  href="/login"
                  className="text-slate-900 dark:text-white font-medium hover:underline"
                >
                  Voltar ao Login
                </Link>
              </div>
            </div>
            <div className="auth-footer text-center">
              Copyright 2025, Clube Navi All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

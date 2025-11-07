"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, requiresPasswordChange, user, accessToken, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedUserStatus, setHasCheckedUserStatus] = useState(false);

  // Função para verificar status atual do usuário no servidor
  const checkUserStatus = async () => {
    // Super admins não precisam verificar status de email
    const isSuperAdmin = user?.type === 'super-admin' || user?.isSuperAdmin || user?.isApiAdmin;
    if (isSuperAdmin) {
      return { emailConfirmed: true, isActive: true };
    }

    if (!accessToken || !user?.id) return { emailConfirmed: false, isActive: false };

    try {
      // Criar um timeout para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos timeout
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          const serverUser = data.data.user;
          
          // Verificar se há discrepância nos dados
          const hasDiscrepancy = (
            user.emailConfirmed !== serverUser.emailConfirmed || 
            user.isActive !== serverUser.isActive
          );
          
          if (hasDiscrepancy) {
            // console.log('🔄 Dados desatualizados detectados. Atualizando do servidor:', {
            //   cache: { emailConfirmed: user.emailConfirmed, isActive: user.isActive },
            //   server: { emailConfirmed: serverUser.emailConfirmed, isActive: serverUser.isActive }
            // });
            updateUser(serverUser);
          }
          
          return { emailConfirmed: serverUser.emailConfirmed, isActive: serverUser.isActive };
        }
      }
    } catch (error) {
      window.location.reload();
      return { emailConfirmed: false, isActive: false };
    }
    
    // Fallback para dados em cache
    return { emailConfirmed: user.emailConfirmed || false, isActive: user.isActive || false };
  };

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Verificar se é Super Admin (usando type, isSuperAdmin ou isApiAdmin)
      const isSuperAdmin = user?.type === 'super-admin' || user?.isSuperAdmin || user?.isApiAdmin;

      // Super admins não precisam de verificação de email e vão para dashboard admin
      if (isSuperAdmin) {
        console.log('🔐 AuthGuard: Super Admin detectado, permitindo acesso direto');
        setIsLoading(false);
        return;
      }

      // Verificar status atual do usuário se ainda não verificou
      if (!hasCheckedUserStatus && user) {
        const userStatus = await checkUserStatus();
        setHasCheckedUserStatus(true);

        // Verificar se o email foi confirmado com dados atualizados
        if (!userStatus.emailConfirmed || !userStatus.isActive) {
          router.push('/email-confirmation-required');
          return;
        }
      } else if (user && (!user.emailConfirmed || !user.isActive)) {
        // Fallback para dados em cache se não conseguiu verificar no servidor
        router.push('/email-confirmation-required');
        return;
      }

      if (requiresPasswordChange) {
        router.push('/change-password');
        return;
      }

      setIsLoading(false);
    };

    // Aguardar um pouco para o Zustand carregar o estado do localStorage
    const timer = setTimeout(verifyAuth, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, requiresPasswordChange, router, user, accessToken, hasCheckedUserStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;

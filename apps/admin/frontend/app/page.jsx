"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

const HomePage = () => {
  const router = useRouter();
  const { isAuthenticated, requiresPasswordChange, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // Se não está autenticado, fica na página raiz (vai mostrar login via AuthGuard)
      return;
    }

    if (requiresPasswordChange) {
      router.replace('/change-password');
      return;
    }

    // Verificar se é Super Admin
    const isSuperAdmin = user?.type === 'super-admin' || user?.isSuperAdmin;

    console.log('🔍 HomePage - Redirecionando...', {
      userType: user?.type,
      isSuperAdmin,
      isApiAdmin: user?.isApiAdmin
    });

    // Redirecionar para o dashboard correto
    if (isSuperAdmin) {
      console.log('✅ Redirecionando para /dashboard/admin');
      router.replace('/dashboard/admin');
    } else {
      console.log('✅ Redirecionando para /dashboard');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, requiresPasswordChange, user, router]);

  // Página de loading enquanto redireciona
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
      </div>
    </div>
  );
};

export default HomePage;

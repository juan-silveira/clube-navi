"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar do localStorage
    loadFromStorage();

    // Verificar autenticação
    const timer = setTimeout(() => {
      const { isAuthenticated } = useAuthStore.getState();

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      console.log('✅ AuthGuard: Usuário autenticado');
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

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

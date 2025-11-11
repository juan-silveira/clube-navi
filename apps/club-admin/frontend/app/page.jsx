"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

const HomePage = () => {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    // Carregar do localStorage
    loadFromStorage();

    // Esperar um pouco para garantir que carregou
    setTimeout(() => {
      const { isAuthenticated } = useAuthStore.getState();

      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 100);
  }, []);

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

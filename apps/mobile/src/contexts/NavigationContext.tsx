import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'expo-router';

interface NavigationContextType {
  navigateWithHistory: (path: string, params?: Record<string, any>) => void;
  goBack: () => void;
  previousPath: string | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentPath = usePathname();
  const [navigationStack, setNavigationStack] = useState<string[]>([]);

  const navigateWithHistory = useCallback((path: string, params?: Record<string, any>) => {
    setNavigationStack(prev => [...prev, currentPath]);
    router.push({ pathname: path as any, params });
  }, [currentPath, router]);

  const goBack = useCallback(() => {
    const previousPath = navigationStack[navigationStack.length - 1];
    if (previousPath) {
      setNavigationStack(prev => prev.slice(0, -1));
      router.push(previousPath as any);
    } else {
      // Fallback para index se não houver histórico
      router.push('/(tabs)/index');
    }
  }, [navigationStack, router]);

  return (
    <NavigationContext.Provider value={{
      navigateWithHistory,
      goBack,
      previousPath: navigationStack[navigationStack.length - 1] || null
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

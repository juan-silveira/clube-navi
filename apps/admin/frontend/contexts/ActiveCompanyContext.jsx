'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import useAuthStore from '@/store/authStore';
import { whitelabelService } from '@/services/api';

const ActiveCompanyContext = createContext();

export const ActiveCompanyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Buscar company ativa do backend
  useEffect(() => {
    const fetchCurrentCompany = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await whitelabelService.getCurrentCompany();

        if (response.success) {
          setCurrentCompany(response.data.currentCompany);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar empresa atual:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentCompany();
  }, [isAuthenticated, user]);

  // Pegar dados da company ativa a partir do user.userCompanies
  const activeCompany = useMemo(() => {
    if (!user?.userCompanies || !currentCompany?.id) return null;

    return user.userCompanies.find(uc => uc.companyId === currentCompany.id);
  }, [user, currentCompany]);

  // Pegar role do usuário na company ativa
  const activeRole = useMemo(() => {
    return activeCompany?.role || 'USER';
  }, [activeCompany]);

  // Calcular permissões baseadas APENAS na company ativa
  const permissions = useMemo(() => {
    if (!activeCompany) {
      return {
        isAdmin: false,
        isAppAdmin: false,
        isSuperAdmin: false,
        canViewCompanySettings: false,
        canViewSystemSettings: false,
        canViewSensitiveData: false,
        canManageRoles: false,
        role: 'USER'
      };
    }

    const role = activeCompany.role;
    const isAdmin = role === 'ADMIN';
    const isAppAdmin = role === 'APP_ADMIN';
    const isSuperAdmin = role === 'SUPER_ADMIN';

    return {
      isAdmin,
      isAppAdmin,
      isSuperAdmin,
      canViewCompanySettings: isAdmin || isAppAdmin || isSuperAdmin,
      canViewSystemSettings: isAppAdmin || isSuperAdmin,
      canViewSensitiveData: isSuperAdmin,
      canManageRoles: isSuperAdmin,
      role: role
    };
  }, [activeCompany]);

  const value = {
    currentCompany,
    activeCompany,
    activeRole,
    permissions,
    loading
  };

  return (
    <ActiveCompanyContext.Provider value={value}>
      {children}
    </ActiveCompanyContext.Provider>
  );
};

export const useActiveCompany = () => {
  const context = useContext(ActiveCompanyContext);
  if (!context) {
    // Return default values instead of throwing error during SSR or before mount
    return {
      currentCompany: null,
      activeCompany: null,
      activeRole: 'USER',
      permissions: {
        isAdmin: false,
        isAppAdmin: false,
        isSuperAdmin: false,
        canViewCompanySettings: false,
        canViewSystemSettings: false,
        canViewSensitiveData: false,
        canManageRoles: false,
        role: 'USER'
      },
      loading: true
    };
  }
  return context;
};

export default ActiveCompanyContext;

import { useMemo } from 'react';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';

const usePermissions = () => {
  // Usar permissões da company ativa ao invés de todas as companies
  const { permissions: activeCompanyPermissions, activeRole } = useActiveCompany();

  const permissions = useMemo(() => {
    return {
      ...activeCompanyPermissions,
      roles: [activeRole], // Array com apenas a role da company ativa
      primaryRole: activeRole
    };
  }, [activeCompanyPermissions, activeRole]);

  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  const hasAnyRole = (rolesList) => {
    return rolesList.includes(activeRole);
  };

  const hasAllRoles = (rolesList) => {
    // Se pedir múltiplas roles e só temos uma, retornar false
    if (rolesList.length > 1) return false;
    return rolesList.includes(activeRole);
  };

  return {
    ...permissions,
    hasPermission,
    hasAnyRole,
    hasAllRoles
  };
};

export default usePermissions;
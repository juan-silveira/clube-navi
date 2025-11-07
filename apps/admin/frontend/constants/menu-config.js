/**
 * Configuração dos menus com suporte a internacionalização
 * Use getMenuItems(t) para obter os menus traduzidos
 */

export const getMenuItems = (t) => [
  {
    isHeadr: true,
    title: t('menu:sections.menu'),
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.dashboard'),
    icon: "heroicons-outline:home",
    isHide: true,
    link: "/dashboard",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.adminDashboard'),
    icon: "heroicons:chart-bar-square",
    isHide: true,
    link: "/dashboard/admin",
    adminOnly: true,
  },
  {
    isHeadr: true,
    title: t('menu:sections.financial'),
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.withdraw'),
    isHide: true,
    icon: "fa6-brands:pix",
    link: "/withdraw",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.deposit'),
    isHide: true,
    icon: "heroicons-outline:arrow-down-on-square",
    link: "/deposit",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.transfer'),
    isHide: true,
    icon: "heroicons-outline:switch-horizontal",
    link: "/transfer",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.exchange'),
    isHide: true,
    icon: "material-symbols:currency-exchange-rounded",
    link: "/exchange",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.statement'),
    isHide: true,
    icon: "heroicons-outline:banknotes",
    link: "/statement",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.incomeReport'),
    isHide: true,
    icon: "heroicons-outline:document-chart-bar",
    link: "/tax-reports/income",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    isHeadr: true,
    title: t('menu:sections.investments'),
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.investments'),
    isHide: true,
    icon: "heroicons-outline:trending-up",
    link: "/investments",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    isHeadr: true,
    title: t('menu:sections.userSettings'),
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.accountData'),
    isHide: true,
    icon: "heroicons-outline:user-circle",
    link: "/profile",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.documentValidation'),
    isHide: true,
    icon: "heroicons-outline:identification",
    link: "/document-validation",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.feesAndDeadlines'),
    isHide: true,
    icon: "heroicons-outline:currency-dollar",
    link: "/fees",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.security'),
    isHide: true,
    icon: "heroicons-outline:shield-check",
    link: "/security",
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    isHeadr: true,
    title: t('menu:sections.companySettings'),
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.userSearch'),
    isHide: true,
    icon: "heroicons-outline:search",
    link: "/admin/users",
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.companyTransactions'),
    isHide: true,
    icon: "heroicons-outline:credit-card",
    link: "/admin/transactions",
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: t('menu:items.stakesManagement'),
    isHide: true,
    icon: "heroicons-outline:chart-pie",
    link: "/admin/company-stakes",
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    isHeadr: true,
    title: "Marketplace",
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: "Analytics",
    isHide: true,
    icon: "heroicons:chart-bar",
    link: "/marketplace-analytics",
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: "Produtos",
    isHide: true,
    icon: "heroicons:shopping-bag",
    link: "/products",
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    title: "Merchants",
    isHide: true,
    icon: "heroicons:building-storefront",
    link: "/merchants",
    requiredPermissions: ["canViewCompanySettings"],
    hideForSystemAdmin: true, // Ocultar para super admins do sistema
  },
  {
    isHeadr: true,
    title: t('menu:sections.systemSettings'),
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: t('menu:items.clubs'),
    isHide: true,
    icon: "heroicons-outline:building-office-2",
    link: "/system/clubs",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: t('menu:items.clubAdmins'),
    isHide: true,
    icon: "heroicons-outline:user-group",
    link: "/system/club-admins",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: t('menu:items.superAdmins'),
    isHide: true,
    icon: "heroicons-outline:shield-check",
    link: "/system/super-admins",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: "Usuários dos Clubes",
    isHide: true,
    icon: "heroicons:users",
    link: "/system/club-users",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: "Gestão de Grupos",
    isHide: true,
    icon: "heroicons:user-group",
    link: "/system/club-groups",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: "Cobrança dos Clubes",
    isHide: true,
    icon: "heroicons:credit-card",
    link: "/system/billing",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: "Transações dos Clubes",
    isHide: true,
    icon: "heroicons:arrow-path",
    link: "/system/club-transactions",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: "Layout do App",
    isHide: true,
    icon: "heroicons:device-phone-mobile",
    link: "/system/app-layout",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: t('menu:items.modules'),
    isHide: true,
    icon: "heroicons:squares-2x2",
    link: "/system/modules",
    requiredPermissions: ["canViewSystemSettings"],
  },
    {
    title: "Notificações Push",
    isHide: true,
    icon: "heroicons:bell",
    link: "/system/notifications",
    requiredPermissions: ["canViewSystemSettings"],
  },
  {
    title: "Envio WhatsApp",
    isHide: true,
    icon: "fa6-brands:whatsapp",
    link: "/system/whatsapp",
    requiredPermissions: ["canViewSystemSettings"],
  },
];

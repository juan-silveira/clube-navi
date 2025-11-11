/**
 * Configuração dos menus do Club Admin
 * Use getMenuItems(t) para obter os menus traduzidos
 */

export const getMenuItems = (t) => [
  {
    isHeadr: true,
    title: "Menu",
  },
  {
    title: "Dashboard",
    icon: "heroicons-outline:home",
    link: "/dashboard",
  },
  {
    isHeadr: true,
    title: "Usuários",
  },
  {
    title: "Membros",
    icon: "heroicons:users",
    link: "/members",
  },
  {
    title: "Grupos",
    icon: "heroicons:user-group",
    link: "/groups",
  },
  {
    isHeadr: true,
    title: "Financeiro",
  },
  {
    title: "Transações",
    icon: "heroicons:arrow-path",
    link: "/transactions",
  },
  {
    title: "Cashback",
    icon: "heroicons:gift",
    link: "/cashback",
  },
  {
    title: "Relatórios",
    icon: "heroicons:document-chart-bar",
    link: "/reports",
  },
  {
    isHeadr: true,
    title: "Marketplace",
  },
  {
    title: "Produtos",
    icon: "heroicons:shopping-bag",
    link: "/products",
  },
  {
    title: "Comerciantes",
    icon: "heroicons:building-storefront",
    link: "/merchants",
  },
  {
    title: "Pedidos",
    icon: "heroicons:shopping-cart",
    link: "/orders",
  },
  {
    isHeadr: true,
    title: "Comunicação",
  },
  {
    title: "Notificações Push",
    icon: "heroicons:bell",
    link: "/notifications",
  },
  {
    title: "WhatsApp",
    icon: "fa6-brands:whatsapp",
    link: "/whatsapp",
  },
  {
    isHeadr: true,
    title: "Configurações",
  },
  {
    title: "Branding",
    icon: "heroicons:paint-brush",
    link: "/branding",
  },
  {
    title: "Layout do App",
    icon: "heroicons:device-phone-mobile",
    link: "/app-layout",
  },
  {
    title: "Módulos",
    icon: "heroicons:squares-2x2",
    link: "/modules",
  },
  {
    title: "Configurações do Clube",
    icon: "heroicons:cog-6-tooth",
    link: "/settings",
  },
];

/**
 * Shared Assets
 *
 * Esta biblioteca gerencia os assets compartilhados entre mobile e admin.
 * Futuramente, as URLs serão substituídas por imagens do S3.
 */

export const BANNER_IMAGES = {
  cashback: require('./images/banners/cashback.jpg'),
  ofertas: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop',
  valePresente: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop',
  novidades: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop',

  // Placeholder padrão
  default: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop',
} as const;

export const ICON_IMAGES = {
  logo: require('./images/icons/logo.png'), // TODO: Adicionar logo real
} as const;

/**
 * Helper para obter URL de imagem
 * Futuramente, isso buscará do S3
 */
export const getImageUrl = (
  type: 'banner' | 'icon',
  key: string,
  defaultUrl?: string
): string => {
  // TODO: Implementar busca no S3
  // Por enquanto, retorna das constantes acima

  if (type === 'banner') {
    return BANNER_IMAGES[key as keyof typeof BANNER_IMAGES] || defaultUrl || BANNER_IMAGES.default;
  }

  return defaultUrl || BANNER_IMAGES.default;
};

export type BannerImageKey = keyof typeof BANNER_IMAGES;
export type IconImageKey = keyof typeof ICON_IMAGES;

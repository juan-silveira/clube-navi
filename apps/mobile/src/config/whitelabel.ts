export const whitelabelConfig = {
  colors: {
    primary: '#172741', // rgb(23, 39, 65) - Azul escuro
    secondary: '#12A384', // rgb(18, 163, 132) - Verde
    background: '#FFFFFF',
    backgroundDark: '#172741',
    text: '#000000',
    textSecondary: '#8E8E93',
    textLight: '#FFFFFF',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    white: '#FFFFFF',
  },
  branding: {
    companyName: 'Clube Digital',
    logos: {
      // Fundo claro
      light: {
        full: require('../../assets/images/logo/logo.png'),
        mini: require('../../assets/images/logo/mini.png'),
      },
      // Fundo escuro
      dark: {
        full: require('../../assets/images/logo/white-logo.png'),
        mini: require('../../assets/images/logo/white-mini.png'),
      },
      // Fundo verde/secundário
      secondary: {
        full: require('../../assets/images/logo/green-screen-logo.png'),
        mini: require('../../assets/images/logo/green-screen-mini.png'),
      },
    },
  },
  splash: {
    backgroundColor: '#172741',
    duration: 2000, // 2 seconds
  },
};

export type WhitelabelConfig = typeof whitelabelConfig;

// Helper para selecionar logo baseado no contexto
export const getLogo = (background: 'light' | 'dark' | 'secondary', size: 'full' | 'mini' = 'full') => {
  return whitelabelConfig.branding.logos[background][size];
};

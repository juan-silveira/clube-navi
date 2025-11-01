export const whitelabelConfig = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    white: '#FFFFFF',
  },
  branding: {
    companyName: 'Clube Navi',
    logoUrl: '', // Will be added later
  },
  splash: {
    backgroundColor: '#007AFF',
    duration: 2000, // 2 seconds
  },
};

export type WhitelabelConfig = typeof whitelabelConfig;

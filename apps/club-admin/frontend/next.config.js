const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n,

  // Configurar domínios permitidos para Next/Image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coinage-assets.s3.sa-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.sa-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },

  // Configurar proxy para redirecionar APIs para backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // Headers customizados para enviar subdomínio ao backend
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Club-Context',
            value: 'club-admin',
          },
        ],
      },
    ];
  },

  webpack(config, { isServer }) {
    // Ensure modules that use browser APIs only run on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;

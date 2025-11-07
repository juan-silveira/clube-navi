#!/usr/bin/env node

/**
 * CLUBE NAVI - Script de Setup de .env
 *
 * Versão Node.js (funciona em Windows também)
 * Copia variáveis do .env raiz para apps individuais
 */

const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = (msg, color = 'reset') => console.log(colors[color] + msg + colors.reset);

// Função para carregar .env como objeto
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();

    // Ignorar comentários e linhas vazias
    if (!line || line.startsWith('#')) return;

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

// Main
async function main() {
  log('🔧 Configurando arquivos .env...', 'blue');

  const rootEnvPath = path.join(__dirname, '..', '.env');

  // Verificar se .env existe na raiz
  if (!fs.existsSync(rootEnvPath)) {
    log('❌ Arquivo .env não encontrado na raiz!', 'red');
    log('💡 Copie .env.example para .env primeiro:', 'yellow');
    log('   cp .env.example .env', 'yellow');
    process.exit(1);
  }

  // Carregar variáveis
  const env = loadEnv(rootEnvPath);
  log('✅ .env raiz carregado', 'green');

  // ============================================
  // API .env
  // ============================================
  log('📝 Criando apps/api/.env...', 'blue');

  const apiEnv = `# Gerado automaticamente por scripts/setup-env.js
# Não editar manualmente! Edite o .env da raiz.

NODE_ENV=${env.NODE_ENV || 'development'}
PORT=3001
API_URL=${env.API_URL || 'http://localhost:3001'}

# Database
DATABASE_URL=${env.DATABASE_URL}

# Redis
REDIS_URL=${env.REDIS_URL || 'redis://localhost:6379'}

# JWT
JWT_SECRET=${env.JWT_SECRET}
JWT_REFRESH_SECRET=${env.JWT_REFRESH_SECRET}
JWT_EXPIRATION=${env.JWT_EXPIRATION || '15m'}
REFRESH_TOKEN_EXPIRATION=${env.REFRESH_TOKEN_EXPIRATION || '7d'}

# Blockchain (Azore)
AZORE_RPC_URL=${env.AZORE_RPC_URL || ''}
AZORE_TESTNET_RPC_URL=${env.AZORE_TESTNET_RPC_URL || ''}
BLOCKCHAIN_NETWORK=${env.BLOCKCHAIN_NETWORK || 'testnet'}
MASTER_WALLET_PRIVATE_KEY=${env.MASTER_WALLET_PRIVATE_KEY || ''}

# AWS S3
AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID || ''}
AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY || ''}
AWS_REGION=${env.AWS_REGION || 'us-east-1'}
AWS_S3_BUCKET=${env.AWS_S3_BUCKET || ''}

# Payment
STRIPE_SECRET_KEY=${env.STRIPE_SECRET_KEY || ''}
STRIPE_WEBHOOK_SECRET=${env.STRIPE_WEBHOOK_SECRET || ''}

# External APIs
GOOGLE_MAPS_API_KEY=${env.GOOGLE_MAPS_API_KEY || ''}

# Email
SENDGRID_API_KEY=${env.SENDGRID_API_KEY || ''}
FROM_EMAIL=${env.FROM_EMAIL || 'noreply@clubedigital.com.br'}

# Security
ENCRYPTION_KEY=${env.ENCRYPTION_KEY}
RATE_LIMIT_WINDOW_MS=${env.RATE_LIMIT_WINDOW_MS || '900000'}
RATE_LIMIT_MAX_REQUESTS=${env.RATE_LIMIT_MAX_REQUESTS || '100'}
`;

  fs.writeFileSync(path.join(__dirname, '../apps/api/.env'), apiEnv);
  log('   ✅ apps/api/.env criado', 'green');

  // ============================================
  // MOBILE .env
  // ============================================
  log('📝 Criando apps/mobile/.env...', 'blue');

  const mobileEnv = `# Gerado automaticamente por scripts/setup-env.js
# Não editar manualmente! Edite o .env da raiz.

# API (EXPO_PUBLIC_ prefix é obrigatório para Expo)
EXPO_PUBLIC_API_URL=${env.API_URL || 'http://localhost:3001'}

# Whitelabel
EXPO_PUBLIC_WHITELABEL_SLUG=${env.WHITELABEL_SLUG || 'clube-digital'}

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${env.GOOGLE_MAPS_API_KEY || ''}

# Blockchain (Azore)
EXPO_PUBLIC_AZORE_RPC_URL=${env.AZORE_TESTNET_RPC_URL || ''}
EXPO_PUBLIC_BLOCKCHAIN_NETWORK=${env.BLOCKCHAIN_NETWORK || 'testnet'}

# EAS
EAS_PROJECT_ID=${env.EAS_PROJECT_ID || ''}
`;

  fs.writeFileSync(path.join(__dirname, '../apps/mobile/.env'), mobileEnv);
  log('   ✅ apps/mobile/.env criado', 'green');

  // ============================================
  // ADMIN .env
  // ============================================
  log('📝 Criando apps/admin/.env...', 'blue');

  const adminEnv = `# Gerado automaticamente por scripts/setup-env.js
# Não editar manualmente! Edite o .env da raiz.

# API (NEXT_PUBLIC_ prefix é obrigatório para Next.js)
NEXT_PUBLIC_API_URL=${env.API_URL || 'http://localhost:3001'}

# NextAuth
NEXTAUTH_URL=${env.NEXTAUTH_URL || 'http://localhost:3000'}
NEXTAUTH_SECRET=${env.NEXTAUTH_SECRET}

# OAuth (opcional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App Config
NEXT_PUBLIC_APP_NAME=Clube Digital Admin
NEXT_PUBLIC_WHITELABEL_ID=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${env.GOOGLE_MAPS_API_KEY || ''}
`;

  fs.writeFileSync(path.join(__dirname, '../apps/admin/.env'), adminEnv);
  log('   ✅ apps/admin/.env criado', 'green');

  // ============================================
  // Concluído
  // ============================================
  console.log('');
  log('✅ Todos os arquivos .env criados com sucesso!', 'green');
  console.log('');
  log('📋 Arquivos gerados:', 'blue');
  log('   - apps/api/.env');
  log('   - apps/mobile/.env');
  log('   - apps/admin/.env');
  console.log('');
  log('💡 Para atualizar, edite o .env da raiz e rode novamente:', 'yellow');
  log('   npm run setup:env');
  console.log('');
}

main().catch(err => {
  log('❌ Erro: ' + err.message, 'red');
  process.exit(1);
});

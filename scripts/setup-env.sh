#!/bin/bash

# ============================================
# CLUBE NAVI - Script de Setup de .env
# ============================================
# Este script copia as variáveis do .env raiz
# para os .env de cada app (api, mobile, admin)

set -e

echo "🔧 Configurando arquivos .env..."

# Verificar se .env existe na raiz
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado na raiz!"
    echo "💡 Copie .env.example para .env primeiro:"
    echo "   cp .env.example .env"
    exit 1
fi

# Carregar variáveis do .env raiz
source .env

echo "✅ .env raiz carregado"

# ============================================
# API .env
# ============================================
echo "📝 Criando apps/api/.env..."

cat > apps/api/.env << EOF
# Gerado automaticamente por scripts/setup-env.sh
# Não editar manualmente! Edite o .env da raiz.

NODE_ENV=${NODE_ENV}
PORT=3001
API_URL=${API_URL}

# Database
DATABASE_URL=${DATABASE_URL}

# Redis
REDIS_URL=${REDIS_URL}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRATION=${JWT_EXPIRATION}
REFRESH_TOKEN_EXPIRATION=${REFRESH_TOKEN_EXPIRATION}

# Blockchain (Azore)
AZORE_RPC_URL=${AZORE_RPC_URL}
AZORE_TESTNET_RPC_URL=${AZORE_TESTNET_RPC_URL}
BLOCKCHAIN_NETWORK=${BLOCKCHAIN_NETWORK}
MASTER_WALLET_PRIVATE_KEY=${MASTER_WALLET_PRIVATE_KEY}

# AWS S3
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET=${AWS_S3_BUCKET}

# Payment
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}

# External APIs
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

# Email
SENDGRID_API_KEY=${SENDGRID_API_KEY}
FROM_EMAIL=${FROM_EMAIL}

# Security
ENCRYPTION_KEY=${ENCRYPTION_KEY}
RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS}
RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS}
EOF

echo "   ✅ apps/api/.env criado"

# ============================================
# MOBILE .env
# ============================================
echo "📝 Criando apps/mobile/.env..."

cat > apps/mobile/.env << EOF
# Gerado automaticamente por scripts/setup-env.sh
# Não editar manualmente! Edite o .env da raiz.

# API (EXPO_PUBLIC_ prefix é obrigatório para Expo)
EXPO_PUBLIC_API_URL=${API_URL}

# Whitelabel
EXPO_PUBLIC_WHITELABEL_SLUG=${WHITELABEL_SLUG}

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

# Blockchain (Azore)
EXPO_PUBLIC_AZORE_RPC_URL=${AZORE_TESTNET_RPC_URL}
EXPO_PUBLIC_BLOCKCHAIN_NETWORK=${BLOCKCHAIN_NETWORK}

# EAS
EAS_PROJECT_ID=${EAS_PROJECT_ID}
EOF

echo "   ✅ apps/mobile/.env criado"

# ============================================
# ADMIN .env
# ============================================
echo "📝 Criando apps/admin/.env..."

cat > apps/admin/.env << EOF
# Gerado automaticamente por scripts/setup-env.sh
# Não editar manualmente! Edite o .env da raiz.

# API (NEXT_PUBLIC_ prefix é obrigatório para Next.js)
NEXT_PUBLIC_API_URL=${API_URL}

# NextAuth
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# OAuth (opcional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App Config
NEXT_PUBLIC_APP_NAME=Clube Navi Admin
NEXT_PUBLIC_WHITELABEL_ID=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
EOF

echo "   ✅ apps/admin/.env criado"

# ============================================
# Concluído
# ============================================
echo ""
echo "✅ Todos os arquivos .env criados com sucesso!"
echo ""
echo "📋 Arquivos gerados:"
echo "   - apps/api/.env"
echo "   - apps/mobile/.env"
echo "   - apps/admin/.env"
echo ""
echo "💡 Para atualizar, edite o .env da raiz e rode novamente:"
echo "   ./scripts/setup-env.sh"
echo ""

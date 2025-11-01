#!/bin/bash

# Script para atualizar dependências deprecadas
# Rode com: bash scripts/update-deps.sh

set -e

echo "🔧 Atualizando dependências deprecadas..."
echo ""

# Atualizar rimraf (v3 -> v6)
echo "📦 Atualizando rimraf..."
npm install rimraf@latest --save-dev

# Atualizar glob (v7 -> v11)
echo "📦 Atualizando glob..."
npm install glob@latest --save-dev

# Atualizar multer (v1 -> v2) - CUIDADO: breaking changes
echo "📦 Atualizando multer..."
npm install multer@latest --save

# Atualizar eslint (v8 -> v9)
echo "📦 Atualizando eslint..."
npm install eslint@latest --save-dev

echo ""
echo "✅ Dependências atualizadas!"
echo ""
echo "🧪 IMPORTANTE: Testar se tudo ainda funciona:"
echo "   npm run dev"
echo ""

#!/bin/bash

# Script para configurar subdomínios locais para teste do Club Admin
# Execute com: sudo bash setup-local-domains.sh

echo "🔧 Configurando subdomínios locais..."

# Verificar se já existe
if grep -q "clube-navi.localhost" /etc/hosts; then
    echo "✓ clube-navi.localhost já está configurado"
else
    echo "127.0.0.1  clube-navi.localhost" >> /etc/hosts
    echo "✓ clube-navi.localhost adicionado"
fi

if grep -q "empresa-teste.localhost" /etc/hosts; then
    echo "✓ empresa-teste.localhost já está configurado"
else
    echo "127.0.0.1  empresa-teste.localhost" >> /etc/hosts
    echo "✓ empresa-teste.localhost adicionado"
fi

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Subdomínios disponíveis:"
echo "   • http://clube-navi.localhost:3001"
echo "   • http://empresa-teste.localhost:3001"
echo ""
echo "🔐 Credenciais:"
echo "   Clube Navi:"
echo "     Email: admin@clube-navi.com"
echo "     Senha: Admin123"
echo ""
echo "   Empresa Teste:"
echo "     Email: admin@empresateste.com.br"
echo "     Senha: Admin123"
echo ""

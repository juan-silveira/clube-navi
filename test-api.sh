#!/bin/bash

# ============================================
# Script de Teste - Clube Navi API
# ============================================

API_URL="http://localhost:3001/api/v1"

echo "======================================"
echo "   CLUBE NAVI - TESTES DA API"
echo "======================================"
echo ""

# ============================================
# 1. HEALTH CHECK
# ============================================
echo "1️⃣  HEALTH CHECK"
echo "--------------------------------------"
curl -s http://localhost:3001/health | python3 -m json.tool
echo ""
echo ""

# ============================================
# 2. REGISTRAR NOVO USUÁRIO
# ============================================
echo "2️⃣  REGISTRAR NOVO USUÁRIO"
echo "--------------------------------------"
curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123456",
    "name": "Usuário Teste",
    "phone": "+5511999998888"
  }' | python3 -m json.tool
echo ""
echo ""

# ============================================
# 3. LOGIN COMO ADMIN
# ============================================
echo "3️⃣  LOGIN COMO ADMIN"
echo "--------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clubenavi.com",
    "password": "admin123456"
  }')

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extrair o token de acesso
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Falha ao obter token de acesso"
  exit 1
fi

echo ""
echo "✅ Token obtido com sucesso!"
echo ""
echo ""

# ============================================
# 4. LISTAR BANNERS (público)
# ============================================
echo "4️⃣  LISTAR BANNERS (endpoint público)"
echo "--------------------------------------"
curl -s $API_URL/banners | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total de banners: {len(data[\"data\"])}'); [print(f'  - {b[\"title\"]}: {b[\"subtitle\"]}') for b in data['data']]"
echo ""
echo ""

# ============================================
# 5. LISTAR CATEGORIAS (público)
# ============================================
echo "5️⃣  LISTAR CATEGORIAS (endpoint público)"
echo "--------------------------------------"
curl -s $API_URL/categories | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total de categorias: {len(data[\"data\"])}'); [print(f'  - {c[\"name\"]} (slug: {c[\"slug\"]})') for c in data['data']]"
echo ""
echo ""

# ============================================
# 6. CRIAR NOVO BANNER (protegido - admin)
# ============================================
echo "6️⃣  CRIAR NOVO BANNER (endpoint protegido)"
echo "--------------------------------------"
NEW_BANNER=$(curl -s -X POST $API_URL/banners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "title": "TESTE API",
    "subtitle": "Banner criado via API",
    "imageUrl": "https://via.placeholder.com/800x300/FF0000/FFFFFF?text=TESTE",
    "backgroundColor": "#FF0000",
    "order": 99,
    "active": true
  }')

echo "$NEW_BANNER" | python3 -m json.tool
BANNER_ID=$(echo "$NEW_BANNER" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo ""
echo "✅ Banner criado com ID: $BANNER_ID"
echo ""
echo ""

# ============================================
# 7. ATUALIZAR BANNER (protegido - admin)
# ============================================
echo "7️⃣  ATUALIZAR BANNER (endpoint protegido)"
echo "--------------------------------------"
curl -s -X PUT $API_URL/banners/$BANNER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "title": "TESTE API - ATUALIZADO",
    "subtitle": "Banner atualizado via API"
  }' | python3 -m json.tool
echo ""
echo ""

# ============================================
# 8. TOGGLE BANNER (protegido - admin)
# ============================================
echo "8️⃣  DESATIVAR BANNER (endpoint protegido)"
echo "--------------------------------------"
curl -s -X PATCH $API_URL/banners/$BANNER_ID/toggle \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# ============================================
# 9. CRIAR NOVA CATEGORIA (protegido - admin)
# ============================================
echo "9️⃣  CRIAR NOVA CATEGORIA (endpoint protegido)"
echo "--------------------------------------"
NEW_CATEGORY=$(curl -s -X POST $API_URL/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Teste Categoria",
    "slug": "teste-categoria",
    "icon": "flask",
    "description": "Categoria criada via API de teste",
    "order": 99,
    "active": true
  }')

echo "$NEW_CATEGORY" | python3 -m json.tool
CATEGORY_ID=$(echo "$NEW_CATEGORY" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
echo ""
echo "✅ Categoria criada com ID: $CATEGORY_ID"
echo ""
echo ""

# ============================================
# 10. BUSCAR CATEGORIA POR SLUG
# ============================================
echo "🔟 BUSCAR CATEGORIA POR SLUG"
echo "--------------------------------------"
curl -s $API_URL/categories/slug/teste-categoria | python3 -m json.tool
echo ""
echo ""

# ============================================
# 11. DELETAR BANNER DE TESTE (protegido - admin)
# ============================================
echo "1️⃣1️⃣  DELETAR BANNER DE TESTE (cleanup)"
echo "--------------------------------------"
curl -s -X DELETE $API_URL/banners/$BANNER_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# ============================================
# 12. DELETAR CATEGORIA DE TESTE (protegido - admin)
# ============================================
echo "1️⃣2️⃣  DELETAR CATEGORIA DE TESTE (cleanup)"
echo "--------------------------------------"
curl -s -X DELETE $API_URL/categories/$CATEGORY_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# ============================================
# 13. LOGOUT
# ============================================
echo "1️⃣3️⃣  LOGOUT"
echo "--------------------------------------"
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['refreshToken'])" 2>/dev/null)
curl -s -X POST $API_URL/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | python3 -m json.tool
echo ""
echo ""

echo "======================================"
echo "   ✅ TESTES CONCLUÍDOS COM SUCESSO!"
echo "======================================"

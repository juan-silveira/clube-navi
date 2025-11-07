# 🧪 GUIA DE TESTES - Clube Digital

> Guia completo para testar todas as funcionalidades implementadas nos últimos 2 dias

---

## 📋 Índice

1. [Preparação do Ambiente](#preparação-do-ambiente)
2. [Admin Web - Testes](#admin-web---testes)
3. [Mobile App - Testes](#mobile-app---testes)
4. [Testes de Integração](#testes-de-integração)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Preparação do Ambiente

### 1. Verificar Serviços

```bash
cd /home/juan/Desktop/Projects/Navi/clube_digital

# Verificar se os serviços estão rodando
systemctl status postgresql
systemctl status redis
systemctl status rabbitmq-server

# Se algum não estiver rodando:
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl start rabbitmq-server
```

### 2. Rodar Migrations no Tenant Database

```bash
cd apps/api

# Rodar migrations no banco do tenant
TENANT_DATABASE_URL="postgresql://clube_digital_user:clube_digital_password@localhost:5432/clube_digital_clube_navi?schema=public" npx prisma migrate deploy --schema=./prisma/tenant/schema.prisma

# Verificar se as tabelas foram criadas
psql -U clube_digital_user -d clube_digital_clube_navi -c "\dt"
```

### 3. Rodar Seeds de Permissões

```bash
cd apps/api

# Executar seed de permissões
node -e "
const seed = require('./prisma/seeds/permissions.seed.js');
seed.seedPermissions('postgresql://clube_digital_user:clube_digital_password@localhost:5432/clube_digital_clube_navi?schema=public')
  .then(() => console.log('✅ Seeds executados com sucesso!'))
  .catch(err => console.error('❌ Erro:', err));
"
```

### 4. Iniciar Servidores

```bash
# Terminal 1 - Backend API
cd apps/api
npm run dev

# Terminal 2 - Admin Web
cd apps/admin/frontend
npm run dev

# Terminal 3 - Mobile (se necessário)
cd apps/mobile
npx expo start
```

### 5. Verificar Logs

```bash
# Ver logs do backend
tail -f apps/api/logs/api.log

# Ver se o scheduler de campanhas iniciou
# Deve aparecer: "🚀 Starting scheduled campaign processor..."
```

---

## 🖥️ Admin Web - Testes

### URL Base
```
http://localhost:3001
```

### 1. Login no Admin

**Credenciais de Teste:**
```
Email: admin@clubenavi.com
Senha: TestPass123$
```

**O que verificar:**
- ✅ Login funciona
- ✅ Redirect para dashboard após login
- ✅ Menu lateral carregado

---

### 2. Testar Analytics Dashboard

**URL:** `http://localhost:3001/analytics`

**Checklist:**
- [ ] Página carrega sem erros
- [ ] 4 cards de KPIs aparecem (Total de Eventos, Usuários Únicos, Cliques, Visualizações)
- [ ] Filtros de período funcionam (24h, 7d, 30d, todo período)
- [ ] Botão "Atualizar" funciona
- [ ] Seção "Tipos de Eventos" mostra os eventos
- [ ] Seção "Páginas Mais Visitadas" aparece
- [ ] Tabela "Sessões Recentes" carregada
- [ ] "Eventos Recentes" mostra feed de eventos

**Como gerar dados de teste:**
```bash
# Abrir console do navegador (F12) e executar:
fetch('http://localhost:8033/api/analytics/pageview', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SEU_TOKEN_JWT'
  },
  body: JSON.stringify({
    sessionId: 'test-session-123',
    pagePath: '/produtos',
    pageTitle: 'Produtos'
  })
});

// Gerar alguns cliques
for (let i = 0; i < 10; i++) {
  fetch('http://localhost:8033/api/analytics/click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    body: JSON.stringify({
      sessionId: 'test-session-123',
      elementId: `btn-${i}`,
      elementText: `Botão ${i}`,
      pagePath: '/produtos'
    })
  });
}
```

---

### 3. Testar Sistema de Permissões

**URL:** `http://localhost:3001/system/permissions`

**Checklist:**
- [ ] Lista de roles aparece (Super Admin, Admin, Operador, etc)
- [ ] Cada role mostra suas permissões
- [ ] Botão "Nova Role" abre modal
- [ ] Modal permite criar role customizada
- [ ] Checkboxes de permissões funcionam
- [ ] Salvar cria a role no banco

**Teste de Criação:**
1. Clicar em "Nova Role"
2. Nome: "Gerente"
3. Descrição: "Gerente de loja"
4. Prioridade: 60
5. Selecionar algumas permissões (ex: products.read, products.create)
6. Salvar
7. Verificar se aparece na lista

---

### 4. Testar Grupos de Usuários

**URL:** `http://localhost:3001/system/groups`

**Checklist:**
- [ ] Grid de grupos carregado
- [ ] Botão "Novo Grupo" funciona
- [ ] Modal de criação aparece
- [ ] Seletor de cor funciona
- [ ] MultiSelect de usuários funciona
- [ ] Criar grupo salva no banco
- [ ] Adicionar/remover membros funciona

**Teste de Criação:**
1. Clicar "Novo Grupo"
2. Nome: "Lojistas Premium"
3. Descrição: "Comerciantes com mais vendas"
4. Escolher cor: Verde
5. Selecionar 2-3 usuários
6. Salvar
7. Verificar card do grupo criado

---

### 5. Testar Gestão de Roles em Usuários

**URL:** `http://localhost:3001/admin/users`

**Checklist:**
- [ ] Lista de usuários carrega
- [ ] Menu dropdown (⋮) em cada usuário funciona
- [ ] Opção "Gerenciar Permissões" aparece
- [ ] Modal de roles abre
- [ ] Mostra roles atuais do usuário
- [ ] Mostra roles disponíveis
- [ ] Botão "Atribuir" adiciona role
- [ ] Botão "Remover" remove role

**Teste:**
1. Escolher um usuário qualquer
2. Abrir menu (⋮) → "Gerenciar Permissões"
3. Atribuir role "Admin"
4. Fechar modal
5. Reabrir e verificar se role está lá
6. Remover role
7. Verificar remoção

---

### 6. Testar Push Notifications - Criar Campanha

**URL:** `http://localhost:3001/system/push/new`

**Checklist - Etapa 1 (Conteúdo):**
- [ ] Formulário de conteúdo aparece
- [ ] Campos: Título, Descrição, Título da Página, Descrição da Página, Código, Regras
- [ ] Botão "Próxima" habilitado após preencher obrigatórios
- [ ] Preview da notificação atualiza em tempo real

**Checklist - Etapa 2 (Imagens):**
- [ ] Upload de logo funciona
- [ ] Upload de banner funciona
- [ ] Preview das imagens aparece
- [ ] Pode prosseguir sem imagens

**Checklist - Etapa 3 (Botão):**
- [ ] Toggle "Habilitar botão" funciona
- [ ] Seletor de tipo (módulo/link externo) funciona
- [ ] Campo de texto do botão aparece
- [ ] Quando tipo = módulo, mostra select de módulos
- [ ] Quando tipo = link, mostra input de URL

**Checklist - Etapa 4 (Público):**
- [ ] Opção "Geo-localização" com CEP + raio
- [ ] Opção "Lista de CPFs"
- [ ] Opção "Usuários específicos"
- [ ] Contador mostra usuários encontrados
- [ ] Campo de agendamento funciona (date/time picker)
- [ ] Botão "Enviar" ou "Agendar" funciona

**Teste Completo:**
```
Etapa 1:
- Título: "Black Friday Chegou! 🎉"
- Descrição: "Até 70% de desconto em todos os produtos"
- Título Página: "Ofertas Black Friday"
- Código: "BLACKFRIDAY"

Etapa 2:
- Fazer upload de qualquer imagem como logo
- Fazer upload de banner

Etapa 3:
- Habilitar botão
- Tipo: Módulo
- Módulo: "products" (Produtos)
- Texto: "Ver Ofertas"

Etapa 4:
- CEP: 01310-100 (Av Paulista, SP)
- Raio: 5 km
- Agendar para: daqui a 5 minutos

Enviar/Agendar
```

**Verificar no console do backend:**
```
Deve aparecer:
"📅 Campaign scheduled for [DATA]"
```

---

### 7. Testar Histórico de Campanhas

**URL:** `http://localhost:3001/system/push/history`

**Checklist:**
- [ ] Lista de campanhas aparece
- [ ] Filtros funcionam (Todas, Concluídas, Processando, Agendadas)
- [ ] Card de cada campanha mostra:
  - Título e descrição
  - Status badge
  - Data de criação
  - Estatísticas (público-alvo, enviados, falharam, taxa de sucesso)
- [ ] Botão "Ver Detalhes" abre modal
- [ ] Botão "Exportar" baixa CSV
- [ ] Paginação funciona (se houver múltiplas páginas)

**Checklist - Modal de Detalhes:**
- [ ] Seção "Analytics da Campanha" aparece
- [ ] 4 KPIs: Enviados, Abertos, Cliques, CTR
- [ ] Gráficos de tendência (se houver dados)
- [ ] Progress bars com benchmarks
- [ ] Seção "Informações da Campanha"
- [ ] Seção "Conteúdo da Página" (se houver)
- [ ] Tabela "Logs de Envio" com usuários

**Aguardar Processamento:**
- Após 5 minutos do agendamento, recarregar a página
- Status deve mudar de "scheduled" para "processing" ou "completed"
- Verificar logs no terminal do backend

---

## 📱 Mobile App - Testes

### Iniciar o App

```bash
cd apps/mobile
npx expo start
```

**Opções:**
- Pressionar `a` para Android emulator
- Pressionar `i` para iOS simulator
- Escanear QR code com Expo Go no celular físico

---

### 1. Testar Login/Registro

**Checklist:**
- [ ] Tela de login aparece
- [ ] Botão "Criar Conta" funciona
- [ ] Registro em 2 etapas funciona:
  - Etapa 1: email, senha, nome, username
  - Etapa 2: CPF, telefone, data nascimento
- [ ] Login funciona após registro
- [ ] Token JWT salvo (verificar AsyncStorage)

---

### 2. Testar Perfil

**Checklist:**
- [ ] Foto de perfil aparece/pode ser alterada
- [ ] Nome e email mostrados
- [ ] Botões de edição funcionam
- [ ] Salvar alterações persiste no banco

---

### 3. Testar KYC (Upload de Documentos)

**URL:** Tab "Mais" → "Documentos KYC"

**Checklist:**
- [ ] Lista de documentos pendentes aparece
- [ ] Botão "Enviar Documento" funciona
- [ ] Seletor de tipo (RG, CNH, etc) funciona
- [ ] Camera/galeria abre para foto
- [ ] Preview do documento aparece
- [ ] Upload envia para S3
- [ ] Status muda para "Em análise"

**No Admin Web:**
- Ir em `/admin/users`
- Encontrar o usuário
- Menu → "Validar Documentos"
- Deve aparecer o documento enviado

---

### 4. Testar Marketplace (Consumer)

**Checklist:**
- [ ] Tab "Produtos" mostra catálogo
- [ ] Lista de produtos carrega
- [ ] Busca funciona
- [ ] Filtros funcionam
- [ ] Clicar em produto abre detalhes
- [ ] Botão "Comprar" funciona
- [ ] Modal de confirmação aparece
- [ ] Compra registra no banco
- [ ] Cashback calculado corretamente

**No Admin Web:**
- Verificar em Analytics se eventos de compra aparecem

---

### 5. Testar Carteira de Cashback

**URL:** Tab "Cashback"

**Checklist:**
- [ ] Saldo total aparece
- [ ] Cards de estatísticas (acumulado, resgatado, pendente)
- [ ] Histórico de cashback
- [ ] Detalhes de cada transação

---

### 6. Testar Histórico de Compras

**URL:** Tab "Compras"

**Checklist:**
- [ ] Lista de compras aparece
- [ ] Cada compra mostra:
  - Produto
  - Merchant
  - Valor
  - Cashback
  - Data
  - Status
- [ ] Filtros funcionam

---

### 7. Testar Solicitação de Saque (Merchants)

**Pré-requisito:** Usuário deve ser tipo "merchant"

**Checklist:**
- [ ] Tab "Saque" aparece (só para merchants)
- [ ] Formulário de saque:
  - Valor
  - Chave PIX
  - Tipo de chave
- [ ] Validação de saldo funciona
- [ ] Validação de chave PIX funciona
- [ ] Enviar cria solicitação
- [ ] Status "Pendente" aparece

**No Admin Web:**
- Ir em `/admin/withdrawals`
- Deve aparecer o saque pendente
- Aprovar/Rejeitar funciona

---

### 8. Testar Indicações

**URL:** Tab "Mais" → "Indicações"

**Checklist:**
- [ ] Código de indicação aparece
- [ ] Botão "Compartilhar" funciona
- [ ] Lista de indicados aparece
- [ ] Estatísticas (total indicados, ganhos)

---

### 9. Testar Configurações de Conta

**URL:** Tab "Mais" → "Configurações"

**Checklist:**
- [ ] Alterar senha funciona
- [ ] Ver dados (LGPD) mostra JSON
- [ ] Solicitar exclusão de dados abre modal
- [ ] Cancelar conta funciona (com confirmação)

---

## 🔗 Testes de Integração

### 1. Fluxo Completo: Registro → Compra → Cashback

```bash
# Terminal
cd apps/api
bash tests/e2e-consumer-purchase.sh
```

**O que testa:**
1. Criação de usuário consumer
2. Criação de produto
3. Compra do produto
4. Verificação de cashback
5. Verificação de saldo

**Saída esperada:**
```
✅ Usuário criado
✅ Produto criado
✅ Compra realizada
✅ Cashback calculado: R$ X.XX
✅ Saldo atualizado
```

---

### 2. Fluxo Analytics: Rastreamento E2E

**No navegador:**
```javascript
// 1. Criar sessão
const sessionId = `test-${Date.now()}`;

// 2. Page view
await fetch('http://localhost:8033/api/analytics/pageview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    pagePath: '/produtos',
    pageTitle: 'Produtos'
  })
});

// 3. Clique
await fetch('http://localhost:8033/api/analytics/click', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    elementId: 'btn-comprar',
    elementText: 'Comprar',
    pagePath: '/produtos'
  })
});

// 4. Verificar no dashboard /analytics
```

---

### 3. Fluxo Push: Agendamento → Envio

**Teste:**
1. Criar campanha agendada para daqui a 2 minutos
2. Aguardar processamento
3. Verificar logs do backend:
```bash
tail -f apps/api/logs/api.log | grep CAMPAIGN
```

**Logs esperados:**
```
📅 Campaign scheduled for [DATA]
🚀 Starting scheduled campaign processor...
📅 Found 1 scheduled campaign(s) to process
📲 Processing campaign: [TITULO]
📲 Sending push to [N] tokens via FCM...
✅ Campaign [ID] completed: [N] sent, [N] failed
```

---

### 4. Testar Permissões RBAC

**Terminal:**
```bash
# 1. Criar usuário de teste
curl -X POST http://localhost:8033/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@test.com",
    "password": "Test123$",
    "firstName": "Operador",
    "lastName": "Teste",
    "username": "operador_test",
    "cpf": "12345678901",
    "userType": "consumer"
  }'

# 2. No Admin Web:
# - Ir em /admin/users
# - Encontrar usuário "operador@test.com"
# - Atribuir role "Operador"

# 3. Fazer login com esse usuário
# - Verificar que não tem acesso a certas áreas
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, iniciar
sudo systemctl start postgresql

# Testar conexão
psql -U clube_digital_user -d clube_digital_clube_navi -c "SELECT 1;"
```

---

### Erro: "Redis connection failed"

```bash
# Verificar Redis
sudo systemctl status redis

# Iniciar se necessário
sudo systemctl start redis

# Testar
redis-cli ping
# Deve retornar: PONG
```

---

### Erro: "Prisma generate failed"

```bash
cd apps/api

# Regenerar Prisma Client
npx prisma generate --schema=./prisma/tenant/schema.prisma
npx prisma generate --schema=./prisma/main/schema.prisma
```

---

### Erro: "Module not found" no Frontend

```bash
cd apps/admin/frontend

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

### Analytics não mostra dados

**Verificar:**
```bash
# 1. Verificar se tabelas existem
psql -U clube_digital_user -d clube_digital_clube_navi \
  -c "SELECT count(*) FROM analytics_events;"

# 2. Inserir evento de teste manualmente
psql -U clube_digital_user -d clube_digital_clube_navi \
  -c "INSERT INTO analytics_events (id, event_type, event_name, created_at) VALUES (gen_random_uuid(), 'page_view', 'test_page', NOW());"

# 3. Recarregar dashboard
```

---

### Push Notifications não enviam

**Verificar:**
```bash
# 1. Ver logs do scheduler
tail -f apps/api/logs/api.log | grep "scheduled campaign"

# 2. Verificar se há campanhas agendadas
psql -U clube_digital_user -d clube_digital_clube_navi \
  -c "SELECT id, title, status, scheduled_at FROM push_notification_campaigns;"

# 3. Verificar se FCM está em modo mock
# No console do backend deve aparecer:
# "⚠️ FCM credentials não configuradas, usando modo MOCK"
```

---

### Mobile não conecta com API

**Verificar:**
```javascript
// apps/mobile/src/services/api.ts
// Trocar localhost por IP da máquina

// No Linux, descobrir IP:
ip addr show | grep "inet " | grep -v 127.0.0.1

// Exemplo:
baseURL: 'http://192.168.1.100:8033'
```

---

## ✅ Checklist Final

### Backend
- [ ] API rodando na porta 8033
- [ ] Migrations aplicadas
- [ ] Seeds de permissões executados
- [ ] Scheduler de campanhas iniciado
- [ ] Logs sem erros críticos

### Admin Web
- [ ] Rodando na porta 3001
- [ ] Login funciona
- [ ] Dashboard Analytics carrega
- [ ] Permissões funcionam
- [ ] Push Notifications cria campanhas
- [ ] Histórico mostra campanhas

### Mobile
- [ ] App inicia sem crashes
- [ ] Login/Registro funciona
- [ ] Marketplace carrega produtos
- [ ] Compras processam
- [ ] Cashback calcula
- [ ] KYC envia documentos

### Integrações
- [ ] Teste E2E de compra passa
- [ ] Analytics rastreia eventos
- [ ] Push notificações agendam
- [ ] Permissões bloqueiam acesso

---

## 📞 Suporte

Se encontrar erros não listados aqui:
1. Verificar logs: `tail -f apps/api/logs/api.log`
2. Verificar console do navegador (F12)
3. Verificar terminal do backend
4. Verificar banco de dados: `psql -U clube_digital_user -d clube_digital_clube_navi`

---

**Última atualização**: 2025-11-07
**Versão do Sistema**: 2.3.0

# Sistema de Sincronização de Estatísticas dos Clubes

## Visão Geral

O sistema sincroniza automaticamente as estatísticas dos clubes dos bancos de dados tenant para o banco master, permitindo que o dashboard do super admin exiba informações atualizadas sem impactar a performance dos tenants.

## Como Funciona

### 1. Sincronização Automática (Cron Job)

O sistema executa automaticamente a sincronização a cada **30 minutos** (configurável).

**Arquivo**: `src/jobs/club-stats-sync.job.js`

#### Configuração

```bash
# Intervalo de sincronização em minutos (padrão: 30)
CLUB_STATS_SYNC_INTERVAL=30

# Desabilitar sincronização automática (padrão: false)
DISABLE_CLUB_STATS_SYNC=false
```

#### Comportamento

- ✅ Executa automaticamente ao iniciar o servidor (após 10 segundos)
- ✅ Sincroniza apenas clubes ativos
- ✅ Processa clubes sequencialmente para evitar sobrecarga
- ✅ Registra logs detalhados de sucesso/falha
- ✅ Continua mesmo se alguns clubes falharem

### 2. Sincronização Manual (API)

#### Sincronizar Todos os Clubes

```bash
POST /api/super-admin/clubs/sync-stats/all
```

**Response**:
```json
{
  "success": true,
  "message": "Stats sync completed",
  "data": {
    "successCount": 2,
    "failedCount": 0,
    "success": ["Clube Navi", "Clube Force"],
    "failed": []
  }
}
```

#### Sincronizar Clube Específico

```bash
POST /api/super-admin/clubs/:clubId/sync-stats
```

**Response**:
```json
{
  "success": true,
  "message": "Club stats synced successfully",
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalRevenue": "125000.50",
      "lastSyncAt": "2025-01-12T16:30:00.000Z"
    }
  }
}
```

#### Verificar Status da Sincronização

```bash
GET /api/super-admin/clubs/:clubId/sync-stats/status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "lastSyncAt": "2025-01-12T16:30:00.000Z",
    "needsSync": false,
    "ageMinutes": 15
  }
}
```

### 3. Sincronização via Dashboard

O dashboard do super admin (`/system`) possui um botão **"Sincronizar Agora"** que permite:

- ✅ Sincronizar manualmente todos os clubes
- ✅ Ver feedback visual do processo
- ✅ Recarregar automaticamente as estatísticas após sync

## Dados Sincronizados

A tabela `club_stats` no banco master armazena:

### Usuários
- `totalUsers` - Total de usuários
- `totalConsumers` - Total de consumidores
- `totalMerchants` - Total de comerciantes
- `activeUsers30d` - Usuários ativos nos últimos 30 dias

### Transações
- `totalPurchases` - Total de compras
- `totalRevenue` - Receita total
- `totalCashbackPaid` - Cashback pago
- `totalPlatformFees` - Taxas da plataforma

### Produtos
- `totalProducts` - Total de produtos cadastrados

### Métricas de 30 dias
- `revenue30d` - Receita dos últimos 30 dias
- `purchases30d` - Compras dos últimos 30 dias
- `cashback30d` - Cashback dos últimos 30 dias

### Controle
- `lastSyncAt` - Data/hora da última sincronização

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Cron Job (30min)                     │
│              src/jobs/club-stats-sync.job.js            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              ClubStatsSyncService                       │
│       src/services/club-stats-sync.service.js           │
│                                                          │
│  • syncClubStats(clubId)                                │
│  • syncAllClubs()                                       │
│  • getLastSyncTime(clubId)                              │
│  • needsSync(clubId, maxAgeMinutes)                     │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  Master Database │          │  Tenant Database │
│   (club_stats)   │◄─────────│   (real data)    │
└──────────────────┘          └──────────────────┘
```

## Logs

### Sucesso
```
🔄 [Stats Sync] Starting sync for club <uuid>...
✅ [Stats Sync] Club Clube Navi synced successfully
   - Users: 1250 (1100 consumers, 150 merchants)
   - Purchases: 3450 (1200 in 30d)
   - Revenue: R$ 125000.50 (R$ 45000.00 in 30d)
```

### Erro
```
❌ [Stats Sync] Error syncing club <uuid>: Connection refused
```

### Resumo
```
✅ [Stats Sync] Sync completed:
   - Success: 2 clubs
   - Failed: 0 clubs
```

## Performance

- **Duração**: ~2-5 segundos por clube (depende do volume de dados)
- **Impacto**: Mínimo - leitura apenas, sem locks
- **Escalabilidade**: Processa clubes sequencialmente para evitar sobrecarga

## Troubleshooting

### Sincronização não está funcionando

1. Verificar se o cron job está ativo:
```bash
grep "Stats Sync Job" logs/app.log
```

2. Verificar variáveis de ambiente:
```bash
echo $DISABLE_CLUB_STATS_SYNC
echo $CLUB_STATS_SYNC_INTERVAL
```

3. Testar sincronização manual via API

### Erro de conexão com tenant database

- Verificar credenciais do banco na tabela `clubs`
- Verificar se o banco tenant está acessível
- Verificar logs para detalhes do erro

### Stats desatualizadas

- Verificar `lastSyncAt` na tabela `club_stats`
- Executar sincronização manual
- Reduzir intervalo de sync se necessário

## Manutenção

### Alterar Intervalo de Sincronização

```bash
# .env
CLUB_STATS_SYNC_INTERVAL=15  # 15 minutos
```

### Desabilitar Temporariamente

```bash
# .env
DISABLE_CLUB_STATS_SYNC=true
```

### Forçar Sincronização de Todos

```bash
curl -X POST http://localhost:8033/api/super-admin/clubs/sync-stats/all \
  -H "Authorization: Bearer $TOKEN"
```

## Segurança

- ✅ Requer autenticação de super admin
- ✅ Não expõe dados sensíveis dos tenants
- ✅ Logs sanitizados (sem senhas ou tokens)
- ✅ Rate limiting via cron job (não sobrecarrega sistema)

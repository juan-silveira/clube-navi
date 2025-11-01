#!/usr/bin/env node

/**
 * Script de Cron Job: Snapshot Diário de Saldos
 *
 * Executa diariamente às 23:50 para salvar um snapshot dos saldos
 * de todos os usuários da plataforma.
 *
 * Configuração do cron:
 * 50 23 * * * cd /var/www/coinage/backend && node daily-balance-snapshot.js >> logs/balance-snapshot.log 2>&1
 *
 * OU usar o crontab:
 * 50 23 * * * /usr/bin/node /var/www/coinage/backend/daily-balance-snapshot.js >> /var/www/coinage/backend/logs/balance-snapshot.log 2>&1
 */

// Carregar variáveis de ambiente ANTES de qualquer outra coisa
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const userBalanceHistoryService = require('./src/services/userBalanceHistory.service');
const stakeBalanceService = require('./src/services/stakeBalance.service');
const prismaConfig = require('./src/config/prisma');

// Obter network do ambiente (testnet ou mainnet)
const network = process.env.DEFAULT_NETWORK || 'testnet';

console.log('\n===============================================');
console.log('🕐 SNAPSHOT DIÁRIO DE SALDOS E STAKES');
console.log('===============================================');
console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
console.log(`🌐 Network: ${network}`);
console.log('===============================================\n');

// Executar snapshot
async function runDailySnapshot() {
  try {
    // Inicializar Prisma
    console.log('🔄 Inicializando conexão com banco de dados...');
    await prismaConfig.initialize();
    console.log('✅ Banco de dados conectado\n');

    const prisma = prismaConfig.getPrisma();

    // Primeiro: Atualizar stakes de todos os usuários
    console.log('📊 Etapa 1: Atualizando saldos em stake...\n');

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        blockchainAddress: { not: null }
      },
      select: {
        id: true,
        email: true,
        blockchainAddress: true
      }
    });

    let stakesUpdated = 0;
    let stakesErrors = 0;

    for (const user of users) {
      try {
        console.log(`   🔄 Atualizando stake: ${user.email}`);
        await stakeBalanceService.updateUserStakeBalance(user.id, user.blockchainAddress);
        stakesUpdated++;
        console.log(`   ✅ Stake atualizado: ${user.email}`);
      } catch (error) {
        stakesErrors++;
        console.error(`   ❌ Erro ao atualizar stake de ${user.email}:`, error.message);
      }
    }

    console.log(`\n📊 Stakes atualizados: ${stakesUpdated}/${users.length}`);
    if (stakesErrors > 0) {
      console.log(`⚠️  Erros ao atualizar stakes: ${stakesErrors}`);
    }

    // Segundo: Criar snapshot com balances e stakes atualizados
    console.log('\n📸 Etapa 2: Criando snapshot de saldos e stakes...\n');

    const result = await userBalanceHistoryService.createDailySnapshot(network);

    if (result.success) {
      console.log('\n✅ SNAPSHOT CONCLUÍDO COM SUCESSO\n');
      console.log(`📊 Total de usuários: ${result.data.totalUsers}`);
      console.log(`✅ Snapshots criados: ${result.data.successCount}`);
      console.log(`❌ Erros: ${result.data.errorCount}`);

      if (result.data.errors && result.data.errors.length > 0) {
        console.log('\n⚠️  Erros encontrados:');
        result.data.errors.forEach(err => {
          console.log(`   - ${err.email}: ${err.error}`);
        });
      }

      // Mostrar estatísticas gerais
      const stats = await userBalanceHistoryService.getSnapshotStats(network);
      if (stats.success) {
        console.log('\n📈 ESTATÍSTICAS GERAIS:');
        console.log(`   - Total de snapshots no banco: ${stats.data.totalSnapshots}`);
        console.log(`   - Usuários únicos: ${stats.data.uniqueUsers}`);
        console.log(`   - Média de snapshots por usuário: ${stats.data.averageSnapshotsPerUser}`);
        console.log(`   - Snapshot mais antigo: ${stats.data.oldestSnapshot ? new Date(stats.data.oldestSnapshot).toLocaleDateString('pt-BR') : 'N/A'}`);
        console.log(`   - Snapshot mais recente: ${stats.data.newestSnapshot ? new Date(stats.data.newestSnapshot).toLocaleDateString('pt-BR') : 'N/A'}`);
      }

      // Fechar conexão
      await prismaConfig.close();
      process.exit(0);
    } else {
      console.error('\n❌ ERRO AO EXECUTAR SNAPSHOT\n');
      console.error(result.message);
      console.error(result.error);

      // Fechar conexão
      await prismaConfig.close();
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO\n');
    console.error(error);

    // Tentar fechar conexão mesmo em caso de erro
    try {
      await prismaConfig.close();
    } catch (closeError) {
      console.error('Erro ao fechar conexão:', closeError.message);
    }

    process.exit(1);
  }
}

// Executar
runDailySnapshot();

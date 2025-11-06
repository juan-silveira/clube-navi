#!/usr/bin/env node

/**
 * Migrate All Tenants Script
 *
 * Executa migrations em TODOS os tenants ativos
 * Útil quando há mudanças no schema-tenant.prisma
 *
 * Usage:
 *   node scripts/migrate-all-tenants.js
 *   node scripts/migrate-all-tenants.js --dry-run  (apenas listar tenants)
 */

require('dotenv').config({ path: './.env' });
const { execSync } = require('child_process');
const { getMasterClient } = require('../apps/api/src/database/master-client');

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

/**
 * Executa migrations em um tenant
 */
async function migrateTenant(tenant) {
  const { slug, databaseHost, databasePort, databaseName, databaseUser, databasePassword } = tenant;

  console.log(`\n🔄 Migrating tenant: ${slug}...`);

  try {
    // Construir DATABASE_URL
    const dbUrl = `postgresql://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}`;

    // Set env var temporariamente
    process.env.TENANT_DATABASE_URL = dbUrl;

    // Executar migrations
    execSync('npx prisma migrate deploy --schema=./apps/api/prisma/tenant/schema.prisma', {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    console.log(`✅ ${slug}: Migrations completed`);

    return { success: true, tenant: slug };
  } catch (error) {
    console.error(`❌ ${slug}: Migration failed`);
    console.error(`   Error: ${error.message}`);

    return { success: false, tenant: slug, error: error.message };
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Clube Digital - Migrate All Tenants\n');

  const masterPrisma = getMasterClient();

  try {
    // 1. Buscar todos os tenants ativos
    console.log('📋 Fetching tenants from Master DB...');

    const tenants = await masterPrisma.tenant.findMany({
      where: {
        status: {
          in: ['trial', 'active']
        }
      },
      select: {
        id: true,
        slug: true,
        companyName: true,
        status: true,
        databaseHost: true,
        databasePort: true,
        databaseName: true,
        databaseUser: true,
        databasePassword: true
      }
    });

    console.log(`✅ Found ${tenants.length} tenants\n`);

    if (tenants.length === 0) {
      console.log('No tenants to migrate. Exiting.');
      return;
    }

    // 2. Listar tenants
    console.log('Tenants to migrate:');
    tenants.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.slug} (${t.companyName}) - ${t.status}`);
    });

    // 3. Dry run?
    if (isDryRun) {
      console.log('\n🔍 DRY RUN mode - no migrations will be executed');
      return;
    }

    // 4. Confirmar
    console.log('\n⚠️  This will run migrations on ALL tenants!');
    console.log('Press Ctrl+C to cancel or Enter to continue...');

    // Aguardar Enter (em produção, considere usar readline ou um prompt)
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    // 5. Executar migrations em cada tenant
    console.log('\n🔄 Starting migrations...\n');
    console.log('='.repeat(60));

    const results = [];

    for (const tenant of tenants) {
      const result = await migrateTenant(tenant);
      results.push(result);
    }

    // 6. Resumo
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ Failed tenants:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.tenant}: ${r.error}`);
        });
    }

    console.log('\n✨ Migration process completed!\n');

  } catch (error) {
    console.error('\n❌ Error during migration process:', error);
    process.exit(1);
  } finally {
    await masterPrisma.$disconnect();
  }
}

// Run script
main().catch(console.error);

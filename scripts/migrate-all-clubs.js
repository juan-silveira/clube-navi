#!/usr/bin/env node

/**
 * Migrate All Clubs Script
 *
 * Executa migrations em TODOS os clubs ativos
 * Útil quando há mudanças no schema-club.prisma
 *
 * Usage:
 *   node scripts/migrate-all-clubs.js
 *   node scripts/migrate-all-clubs.js --dry-run  (apenas listar clubs)
 */

require('dotenv').config({ path: './.env' });
const { execSync } = require('child_process');
const { getMasterClient } = require('../apps/api/src/database/master-client');

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

/**
 * Executa migrations em um club
 */
async function migrateTenant(club) {
  const { slug, databaseHost, databasePort, databaseName, databaseUser, databasePassword } = club;

  console.log(`\n🔄 Migrating club: ${slug}...`);

  try {
    // Construir DATABASE_URL
    const dbUrl = `postgresql://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort}/${databaseName}`;

    // Set env var temporariamente
    process.env.CLUB_DATABASE_URL = dbUrl;

    // Executar migrations
    execSync('npx prisma migrate deploy --schema=./apps/api/prisma/club/schema.prisma', {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    console.log(`✅ ${slug}: Migrations completed`);

    return { success: true, club: slug };
  } catch (error) {
    console.error(`❌ ${slug}: Migration failed`);
    console.error(`   Error: ${error.message}`);

    return { success: false, club: slug, error: error.message };
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Clube Digital - Migrate All Clubs\n');

  const masterPrisma = getMasterClient();

  try {
    // 1. Buscar todos os clubs ativos
    console.log('📋 Fetching clubs from Master DB...');

    const clubs = await masterPrisma.club.findMany({
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

    console.log(`✅ Found ${clubs.length} clubs\n`);

    if (clubs.length === 0) {
      console.log('No clubs to migrate. Exiting.');
      return;
    }

    // 2. Listar clubs
    console.log('Clubs to migrate:');
    clubs.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.slug} (${t.companyName}) - ${t.status}`);
    });

    // 3. Dry run?
    if (isDryRun) {
      console.log('\n🔍 DRY RUN mode - no migrations will be executed');
      return;
    }

    // 4. Confirmar
    console.log('\n⚠️  This will run migrations on ALL clubs!');
    console.log('Press Ctrl+C to cancel or Enter to continue...');

    // Aguardar Enter (em produção, considere usar readline ou um prompt)
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    // 5. Executar migrations em cada club
    console.log('\n🔄 Starting migrations...\n');
    console.log('='.repeat(60));

    const results = [];

    for (const club of clubs) {
      const result = await migrateTenant(club);
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
      console.log('\n❌ Failed clubs:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.club}: ${r.error}`);
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

#!/usr/bin/env node

/**
 * Create Tenant Script
 *
 * Cria um novo tenant com:
 * - Registro no Master DB
 * - Criação do database do tenant
 * - Execução de migrations
 * - Configuração inicial (branding, módulos, cashback, etc.)
 *
 * Usage:
 *   node scripts/create-tenant.js --slug=empresa-a --name="Empresa A" --email=admin@empresa-a.com
 */

require('dotenv').config({ path: './.env' });
const { execSync } = require('child_process');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Importar após carregar .env
const { getMasterClient } = require('../apps/api/src/database/master-client');

// Parse CLI arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    args[key] = value;
  });
  return args;
}

/**
 * Gera senha aleatória segura
 */
function generatePassword(length = 16) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Gera nome de database baseado no slug
 */
function generateDatabaseName(slug) {
  return `clube_digital_${slug.replace(/-/g, '_')}`;
}

/**
 * Cria database PostgreSQL
 */
async function createDatabase(dbName, dbUser, dbPassword) {
  console.log(`\n📦 Creating database: ${dbName}...`);

  try {
    // Criar database (conectar ao database postgres)
    const createDbCommand = `PGPASSWORD="${process.env.POSTGRES_PASSWORD}" psql -h ${process.env.DB_HOST} -U ${process.env.POSTGRES_USER} -d postgres -c "CREATE DATABASE ${dbName};"`;

    execSync(createDbCommand, { stdio: 'inherit' });

    // NOTA: Em ambiente de desenvolvimento, estamos usando o mesmo usuário para todos os tenants
    // Em produção, cada tenant deve ter seu próprio usuário PostgreSQL
    // Por enquanto, todos os tenants usarão clube_digital_user com databases separados

    console.log('✅ Database created successfully');
    console.log(`⚠️  Using shared database user (${process.env.POSTGRES_USER}) for development`);

    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    return false;
  }
}

/**
 * Executa migrations do tenant
 */
async function runTenantMigrations(dbUrl) {
  console.log('\n🔄 Running tenant migrations...');

  try {
    // Set temp env var
    process.env.TENANT_DATABASE_URL = dbUrl;

    // Run migrations (usando schema do diretório tenant/)
    execSync('npx prisma migrate deploy --schema=./apps/api/prisma/tenant/schema.prisma', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✅ Migrations completed successfully');

    return true;
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    return false;
  }
}

/**
 * Cria configurações iniciais do tenant
 */
async function createTenantConfigs(masterPrisma, tenantId) {
  console.log('\n⚙️  Creating tenant configurations...');

  try {
    // 1. Configuração de Cashback (padrão)
    await masterPrisma.tenantCashbackConfig.create({
      data: {
        tenantId,
        consumerPercent: 50.0,
        clubPercent: 25.0,
        consumerReferrerPercent: 12.5,
        merchantReferrerPercent: 12.5
      }
    });
    console.log('  ✓ Cashback config created');

    // 2. Configuração de Saque (padrão)
    await masterPrisma.tenantWithdrawalConfig.create({
      data: {
        tenantId,
        withdrawalFeePercent: 2.5,
        minWithdrawalAmount: 50.0
      }
    });
    console.log('  ✓ Withdrawal config created');

    // 3. Módulos padrão
    const defaultModules = [
      { key: 'marketplace', name: 'Marketplace', order: 1 },
      { key: 'referrals', name: 'Indicações', order: 2 },
      { key: 'cashback', name: 'Cashback', order: 3 }
    ];

    for (const module of defaultModules) {
      await masterPrisma.tenantModule.create({
        data: {
          tenantId,
          moduleKey: module.key,
          isEnabled: true,
          isEnabledByDefault: true,
          displayName: module.name,
          sortOrder: module.order
        }
      });
    }
    console.log(`  ✓ ${defaultModules.length} modules created`);

    // 4. Stats iniciais
    await masterPrisma.tenantStats.create({
      data: {
        tenantId,
        totalUsers: 0,
        totalConsumers: 0,
        totalMerchants: 0
      }
    });
    console.log('  ✓ Initial stats created');

    console.log('✅ Configurations created successfully');

    return true;
  } catch (error) {
    console.error('❌ Error creating configurations:', error.message);
    return false;
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Clube Digital - Create Tenant Script\n');

  const args = parseArgs();

  // Validar argumentos obrigatórios
  if (!args.slug || !args.name || !args.email) {
    console.error('❌ Missing required arguments');
    console.log('\nUsage:');
    console.log('  node scripts/create-tenant.js --slug=empresa-a --name="Empresa A" --email=admin@empresa-a.com');
    console.log('\nRequired:');
    console.log('  --slug        Slug único do tenant (ex: empresa-a)');
    console.log('  --name        Nome da empresa');
    console.log('  --email       Email do admin principal');
    console.log('\nOptional:');
    console.log('  --document    CNPJ da empresa');
    console.log('  --phone       Telefone de contato');
    console.log('  --plan        Plano inicial (BASIC, PRO, ENTERPRISE)');
    process.exit(1);
  }

  const masterPrisma = getMasterClient();

  try {
    // 1. Verificar se tenant já existe
    console.log(`🔍 Checking if tenant "${args.slug}" already exists...`);

    const existing = await masterPrisma.tenant.findUnique({
      where: { slug: args.slug }
    });

    if (existing) {
      console.error(`❌ Tenant with slug "${args.slug}" already exists!`);
      process.exit(1);
    }

    console.log('✅ Slug available');

    // 2. Gerar credenciais do database
    const dbName = generateDatabaseName(args.slug);
    // Em desenvolvimento, usar o mesmo usuário para todos os tenants
    const dbUser = process.env.POSTGRES_USER || 'clube_digital_user';
    const dbPassword = process.env.POSTGRES_PASSWORD || 'clube_digital_password';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '5432');

    console.log(`\n📊 Database Configuration:`);
    console.log(`  Name: ${dbName}`);
    console.log(`  User: ${dbUser} (shared)`);
    console.log(`  Host: ${dbHost}:${dbPort}`);

    // 3. Criar database
    const dbCreated = await createDatabase(dbName, dbUser, dbPassword);

    if (!dbCreated) {
      console.error('❌ Failed to create database');
      process.exit(1);
    }

    // 4. Criar tenant no Master DB
    console.log('\n💾 Creating tenant in Master DB...');

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30 dias de trial

    const tenant = await masterPrisma.tenant.create({
      data: {
        slug: args.slug,
        companyName: args.name,
        companyDocument: args.document || 'pending',
        status: 'trial',

        // Database
        databaseHost: dbHost,
        databasePort: dbPort,
        databaseName: dbName,
        databaseUser: dbUser,
        databasePassword: dbPassword, // TODO: Encriptar

        // URLs
        subdomain: args.slug,

        // Subscription
        subscriptionPlan: args.plan || 'BASIC',
        subscriptionStatus: 'TRIAL',
        monthlyFee: args.plan === 'PRO' ? 2000 : args.plan === 'ENTERPRISE' ? 5000 : 500,
        trialEndsAt,

        // Contact
        contactName: args.name,
        contactEmail: args.email,
        contactPhone: args.phone || 'pending'
      }
    });

    console.log('✅ Tenant created in Master DB');
    console.log(`  ID: ${tenant.id}`);
    console.log(`  Slug: ${tenant.slug}`);
    console.log(`  Trial ends: ${trialEndsAt.toISOString()}`);

    // 5. Executar migrations do tenant
    const dbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    const migrationsOk = await runTenantMigrations(dbUrl);

    if (!migrationsOk) {
      console.error('❌ Failed to run migrations');
      // Rollback: deletar tenant
      await masterPrisma.tenant.delete({ where: { id: tenant.id } });
      process.exit(1);
    }

    // 6. Criar configurações iniciais
    const configsOk = await createTenantConfigs(masterPrisma, tenant.id);

    if (!configsOk) {
      console.error('❌ Failed to create configurations');
      process.exit(1);
    }

    // 7. Criar admin do tenant
    console.log('\n👤 Creating tenant admin...');

    const adminPassword = args.adminPassword || generatePassword(12);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await masterPrisma.tenantAdmin.create({
      data: {
        tenantId: tenant.id,
        name: args.name,
        email: args.email,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Admin created');

    // 8. Sucesso!
    console.log('\n' + '='.repeat(60));
    console.log('✨ TENANT CREATED SUCCESSFULLY! ✨');
    console.log('='.repeat(60));
    console.log('\n📋 Tenant Information:');
    console.log(`  Slug:          ${tenant.slug}`);
    console.log(`  Company:       ${tenant.companyName}`);
    console.log(`  Subdomain:     ${tenant.subdomain}.api.clubedigital.com.br`);
    console.log(`  Status:        ${tenant.status}`);
    console.log(`  Plan:          ${tenant.subscriptionPlan}`);
    console.log(`  Trial until:   ${trialEndsAt.toLocaleDateString()}`);

    console.log('\n🔐 Admin Credentials:');
    console.log(`  Email:         ${args.email}`);
    console.log(`  Password:      ${adminPassword}`);
    console.log('  ⚠️  SAVE THESE CREDENTIALS - They will not be shown again!');

    console.log('\n🗄️  Database:');
    console.log(`  Name:          ${dbName}`);
    console.log(`  User:          ${dbUser}`);
    console.log(`  Password:      ${dbPassword}`);

    console.log('\n✅ Next Steps:');
    console.log('  1. Configure branding via admin panel');
    console.log('  2. Build mobile apps for this tenant');
    console.log('  3. Configure modules as needed');
    console.log('  4. Add users and products\n');

  } catch (error) {
    console.error('\n❌ Error creating tenant:', error);
    process.exit(1);
  } finally {
    await masterPrisma.$disconnect();
  }
}

// Run script
main().catch(console.error);

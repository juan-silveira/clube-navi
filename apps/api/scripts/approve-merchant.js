#!/usr/bin/env node

/**
 * Script para aprovar um merchant no banco de dados
 * Uso: node scripts/approve-merchant.js <email_ou_id>
 */

const { getTenantClient } = require('../src/database/tenant-client');

async function approveMerchant(emailOrId, tenantSlug = 'clube-navi') {
  console.log(`\n🔍 Buscando merchant: ${emailOrId} no tenant: ${tenantSlug}\n`);

  const prisma = await getTenantClient({
    slug: tenantSlug,
    databaseName: `clube_digital_${tenantSlug.replace(/-/g, '_')}`
  });

  try {
    // Buscar merchant por email ou ID
    const merchant = await prisma.user.findFirst({
      where: {
        OR: [
          { id: emailOrId },
          { email: emailOrId }
        ],
        userType: 'merchant'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        merchantStatus: true
      }
    });

    if (!merchant) {
      console.error('❌ Merchant não encontrado');
      process.exit(1);
    }

    console.log('📋 Merchant encontrado:');
    console.log(`   ID: ${merchant.id}`);
    console.log(`   Email: ${merchant.email}`);
    console.log(`   Nome: ${merchant.firstName} ${merchant.lastName}`);
    console.log(`   Status Atual: ${merchant.merchantStatus || 'null'}`);
    console.log('');

    if (merchant.merchantStatus === 'approved') {
      console.log('✅ Merchant já está aprovado!');
      process.exit(0);
    }

    // Aprovar merchant
    const updated = await prisma.user.update({
      where: { id: merchant.id },
      data: {
        merchantStatus: 'approved',
        isActive: true,
        emailConfirmed: true
      }
    });

    console.log('✅ Merchant aprovado com sucesso!');
    console.log(`   Novo Status: ${updated.merchantStatus}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Uso: node scripts/approve-merchant.js <email_ou_id> [tenant_slug]');
  process.exit(1);
}

const emailOrId = args[0];
const tenantSlug = args[1] || 'clube-navi';

approveMerchant(emailOrId, tenantSlug);

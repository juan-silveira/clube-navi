const { PrismaClient } = require('../src/generated/prisma-master');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting master database seed...');

  // 1. Create Super Admin
  console.log('Creating Super Admin...');
  const hashedPassword = await bcrypt.hash('Admin@2025', 10);

  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: 'admin@clubedigital.com' },
    update: {},
    create: {
      name: 'Admin Clube Digital',
      email: 'admin@clubedigital.com',
      password: hashedPassword,
      permissions: JSON.stringify(['all']),
      isActive: true,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // 2. Create Clube Navi
  console.log('Creating Clube Navi...');
  const clubeNavi = await prisma.club.upsert({
    where: { slug: 'clubenavi' },
    update: {},
    create: {
      slug: 'clubenavi',
      companyName: 'Clube Navi',
      companyDocument: '12.345.678/0001-90',
      isActive: true,
      plan: 'pro',
      subdomain: 'clubenavi',
      adminSubdomain: 'adminclubenavi',
      databaseHost: 'localhost',
      databasePort: 5432,
      databaseName: 'clube_digital_clubenavi',
      databaseUser: 'clube_digital_user',
      databasePassword: 'clube_digital_password',
      contactName: 'João Silva',
      contactEmail: 'clube@navi.inf.br',
      contactPhone: '+55 11 98765-4321',
      monthlyFee: 2000.00,
      maxUsers: 10000,
      maxAdmins: 20,
      maxStorageGB: 100,
    },
  });
  console.log('✅ Clube Navi created:', clubeNavi.companyName);

  // 3. Create Branding for Clube Navi
  console.log('Creating Branding for Clube Navi...');
  await prisma.clubBranding.upsert({
    where: { clubId: clubeNavi.id },
    update: {},
    create: {
      clubId: clubeNavi.id,
      appName: 'Clube Navi',
      appDescription: 'O melhor clube de benefícios do Brasil',
      logoUrl: 'https://via.placeholder.com/200',
      logoIconUrl: 'https://via.placeholder.com/100',
      faviconUrl: 'https://via.placeholder.com/32',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
    },
  });
  console.log('✅ Branding created for Clube Navi');

  // 4. Create App Config for Clube Navi
  console.log('Creating App Config for Clube Navi...');
  await prisma.clubAppConfig.upsert({
    where: { clubId: clubeNavi.id },
    update: {},
    create: {
      clubId: clubeNavi.id,
      appName: 'Clube Navi',
      tenantSlug: 'clubenavi',
      appDescription: 'O melhor clube de benefícios do Brasil',
      bundleId: 'com.clubedigital.clubenavi',
      packageName: 'com.clubedigital.clubenavi',
      urlScheme: 'clubedigitalclubenavi',
      appIconUrl: 'https://via.placeholder.com/1024',
      splashScreenUrl: 'https://via.placeholder.com/1242x2688',
      splashBackgroundColor: '#3B82F6',
      currentVersion: '1.0.0',
      iosBuildNumber: 1,
      androidBuildNumber: 1,
      autoBuildEnabled: true,
    },
  });
  console.log('✅ App Config created for Clube Navi');

  // 5. Create Stats for Clube Navi
  console.log('Creating Stats for Clube Navi...');
  await prisma.clubStats.upsert({
    where: { clubId: clubeNavi.id },
    update: {},
    create: {
      clubId: clubeNavi.id,
      totalUsers: 1250,
      totalConsumers: 1100,
      totalMerchants: 150,
      activeUsers30d: 980,
      totalPurchases: 3450,
      totalRevenue: 125000.50,
      totalCashbackPaid: 6250.02,
      totalPlatformFees: 3125.01,
      totalProducts: 250,
      revenue30d: 45000.00,
      purchases30d: 1200,
      cashback30d: 2250.00,
    },
  });
  console.log('✅ Stats created for Clube Navi');

  // 6. Create Admin for Clube Navi
  console.log('Creating Admin for Clube Navi...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.clubAdmin.upsert({
    where: {
      clubId_email: {
        clubId: clubeNavi.id,
        email: 'clube@navi.inf.br'
      }
    },
    update: {},
    create: {
      clubId: clubeNavi.id,
      name: 'João Silva',
      email: 'clube@navi.inf.br',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('✅ Admin created for Clube Navi');

  // 7. Create Clube Force
  console.log('Creating Clube Force...');
  const clubeForce = await prisma.club.upsert({
    where: { slug: 'clubeforce' },
    update: {},
    create: {
      slug: 'clubeforce',
      companyName: 'Clube Force',
      companyDocument: '98.765.432/0001-10',
      isActive: true,
      plan: 'premium',
      subdomain: 'clubeforce',
      adminSubdomain: 'adminclubeforce',
      databaseHost: 'localhost',
      databasePort: 5432,
      databaseName: 'clube_digital_clubeforce',
      databaseUser: 'clube_digital_user',
      databasePassword: 'clube_digital_password',
      contactName: 'Maria Santos',
      contactEmail: 'clube@forcetelecom.com.br',
      contactPhone: '+55 11 91234-5678',
      monthlyFee: 3500.00,
      maxUsers: 15000,
      maxAdmins: 30,
      maxStorageGB: 200,
    },
  });
  console.log('✅ Clube Force created:', clubeForce.companyName);

  // 8. Create Branding for Clube Force
  console.log('Creating Branding for Clube Force...');
  await prisma.clubBranding.upsert({
    where: { clubId: clubeForce.id },
    update: {},
    create: {
      clubId: clubeForce.id,
      appName: 'Clube Force',
      appDescription: 'Clube de benefícios exclusivo da Force Telecom',
      logoUrl: 'https://via.placeholder.com/200',
      logoIconUrl: 'https://via.placeholder.com/100',
      faviconUrl: 'https://via.placeholder.com/32',
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
    },
  });
  console.log('✅ Branding created for Clube Force');

  // 9. Create App Config for Clube Force
  console.log('Creating App Config for Clube Force...');
  await prisma.clubAppConfig.upsert({
    where: { clubId: clubeForce.id },
    update: {},
    create: {
      clubId: clubeForce.id,
      appName: 'Clube Force',
      tenantSlug: 'clubeforce',
      appDescription: 'Clube de benefícios exclusivo da Force Telecom',
      bundleId: 'com.clubedigital.clubeforce',
      packageName: 'com.clubedigital.clubeforce',
      urlScheme: 'clubedigitalclubeforce',
      appIconUrl: 'https://via.placeholder.com/1024',
      splashScreenUrl: 'https://via.placeholder.com/1242x2688',
      splashBackgroundColor: '#8B5CF6',
      currentVersion: '1.0.0',
      iosBuildNumber: 1,
      androidBuildNumber: 1,
      autoBuildEnabled: true,
    },
  });
  console.log('✅ App Config created for Clube Force');

  // 10. Create Stats for Clube Force
  console.log('Creating Stats for Clube Force...');
  await prisma.clubStats.upsert({
    where: { clubId: clubeForce.id },
    update: {},
    create: {
      clubId: clubeForce.id,
      totalUsers: 2850,
      totalConsumers: 2500,
      totalMerchants: 350,
      activeUsers30d: 2100,
      totalPurchases: 8920,
      totalRevenue: 485000.00,
      totalCashbackPaid: 24250.00,
      totalPlatformFees: 12125.00,
      totalProducts: 450,
      revenue30d: 165000.00,
      purchases30d: 3200,
      cashback30d: 8250.00,
    },
  });
  console.log('✅ Stats created for Clube Force');

  // 11. Create Admin for Clube Force
  console.log('Creating Admin for Clube Force...');
  await prisma.clubAdmin.upsert({
    where: {
      clubId_email: {
        clubId: clubeForce.id,
        email: 'clube@forcetelecom.com.br'
      }
    },
    update: {},
    create: {
      clubId: clubeForce.id,
      name: 'Maria Santos',
      email: 'clube@forcetelecom.com.br',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('✅ Admin created for Clube Force');

  console.log('');
  console.log('✅ Master database seed completed!');
  console.log('');
  console.log('📝 Credentials:');
  console.log('   Super Admin: admin@clubedigital.com / Admin@2025');
  console.log('   Clube Navi Admin: clube@navi.inf.br / admin123');
  console.log('   Clube Force Admin: clube@forcetelecom.com.br / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

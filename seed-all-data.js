/**
 * Script para popular TODAS as tabelas do clube-navi com dados de teste
 * Execução: TENANT_DATABASE_URL="postgresql://clube_digital_user:clube_digital_password@localhost:5432/clube_digital_clube_navi?schema=public" node seed-all-data.js
 */

const { PrismaClient } = require('./apps/api/prisma/src/generated/prisma-tenant');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TENANT_DATABASE_URL
    }
  }
});

async function main() {
  console.log('🌱 Iniciando seed completo do clube-navi...\n');

  // ==========================================
  // 1. CRIAR GRUPOS
  // ==========================================
  console.log('📦 Criando grupos...');

  const adminUser = await prisma.user.findFirst({
    where: { userType: 'admin' }
  });

  const grupos = await Promise.all([
    prisma.group.create({
      data: {
        name: 'VIP Premium',
        description: 'Clientes VIP com benefícios exclusivos',
        color: '#FFD700',
        createdBy: adminUser.id
      }
    }),
    prisma.group.create({
      data: {
        name: 'Merchants Parceiros',
        description: 'Comerciantes parceiros oficiais',
        color: '#4169E1',
        createdBy: adminUser.id
      }
    }),
    prisma.group.create({
      data: {
        name: 'Early Adopters',
        description: 'Primeiros usuários da plataforma',
        color: '#32CD32',
        createdBy: adminUser.id
      }
    })
  ]);
  console.log(`✅ ${grupos.length} grupos criados\n`);

  // ==========================================
  // 2. ADICIONAR USUÁRIOS AOS GRUPOS
  // ==========================================
  console.log('👥 Adicionando usuários aos grupos...');

  const consumers = await prisma.user.findMany({
    where: { userType: 'consumer' },
    take: 6
  });

  const merchants = await prisma.user.findMany({
    where: { userType: 'merchant' },
    take: 5
  });

  // Adicionar consumidores ao grupo VIP
  for (let i = 0; i < 3; i++) {
    await prisma.groupUser.create({
      data: {
        groupId: grupos[0].id,
        userId: consumers[i].id,
        addedBy: adminUser.id
      }
    });
  }

  // Adicionar merchants ao grupo Parceiros
  for (let i = 0; i < merchants.length; i++) {
    await prisma.groupUser.create({
      data: {
        groupId: grupos[1].id,
        userId: merchants[i].id,
        addedBy: adminUser.id
      }
    });
  }

  // Adicionar alguns ao grupo Early Adopters
  for (let i = 3; i < consumers.length; i++) {
    await prisma.groupUser.create({
      data: {
        groupId: grupos[2].id,
        userId: consumers[i].id,
        addedBy: adminUser.id
      }
    });
  }

  console.log('✅ Usuários adicionados aos grupos\n');

  // ==========================================
  // 3. CRIAR PRODUTOS DIVERSOS
  // ==========================================
  console.log('🛍️  Criando produtos variados...');

  const categorias = ['Eletrônicos', 'Alimentos', 'Vestuário', 'Serviços', 'Beleza'];
  const produtos = [];

  const produtosData = [
    { name: 'Smartphone Galaxy X', description: 'Smartphone de última geração com câmera 108MP', price: 2499.90, cashback: 5, category: 'Eletrônicos', stock: 15 },
    { name: 'Notebook Pro 15"', description: 'Notebook potente para trabalho e jogos', price: 4599.90, cashback: 7, category: 'Eletrônicos', stock: 8 },
    { name: 'Fone Bluetooth Premium', description: 'Fone com cancelamento de ruído', price: 599.90, cashback: 10, category: 'Eletrônicos', stock: 30 },
    { name: 'Pizza Grande', description: 'Pizza tradicional com borda recheada', price: 45.90, cashback: 15, category: 'Alimentos', stock: 100 },
    { name: 'Hambúrguer Artesanal', description: 'Hambúrguer 200g com batatas', price: 32.50, cashback: 12, category: 'Alimentos', stock: 50 },
    { name: 'Refrigerante 2L', description: 'Refrigerante gelado diversos sabores', price: 8.90, cashback: 8, category: 'Alimentos', stock: 200 },
    { name: 'Camiseta Premium', description: 'Camiseta 100% algodão', price: 79.90, cashback: 20, category: 'Vestuário', stock: 45 },
    { name: 'Calça Jeans', description: 'Calça jeans skinny premium', price: 149.90, cashback: 18, category: 'Vestuário', stock: 25 },
    { name: 'Tênis Esportivo', description: 'Tênis para corrida e caminhada', price: 299.90, cashback: 15, category: 'Vestuário', stock: 18 },
    { name: 'Corte de Cabelo', description: 'Corte + barba + sobrancelha', price: 55.00, cashback: 25, category: 'Serviços', stock: 999 },
    { name: 'Manicure + Pedicure', description: 'Serviço completo de manicure', price: 40.00, cashback: 20, category: 'Serviços', stock: 999 },
    { name: 'Massagem Relaxante', description: 'Massagem de 60 minutos', price: 120.00, cashback: 22, category: 'Serviços', stock: 999 },
    { name: 'Kit Maquiagem', description: 'Kit completo de maquiagem profissional', price: 189.90, cashback: 16, category: 'Beleza', stock: 20 },
    { name: 'Perfume Importado', description: 'Perfume 100ml fragrância marcante', price: 259.90, cashback: 12, category: 'Beleza', stock: 12 },
    { name: 'Creme Facial', description: 'Creme hidratante facial anti-idade', price: 89.90, cashback: 18, category: 'Beleza', stock: 35 }
  ];

  for (const prodData of produtosData) {
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];

    const produto = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: prodData.name,
        description: prodData.description,
        price: prodData.price,
        cashbackPercentage: prodData.cashback,
        category: prodData.category,
        stock: prodData.stock,
        isActive: true
      }
    });
    produtos.push(produto);
  }

  console.log(`✅ ${produtos.length} produtos criados\n`);

  // ==========================================
  // 4. CRIAR COMPRAS (PURCHASES) COM STATUS VARIADOS
  // ==========================================
  console.log('💳 Criando transações/compras...');

  const statusOptions = ['completed', 'pending', 'processing', 'failed'];
  const compras = [];

  // Criar 30 compras variadas
  for (let i = 0; i < 30; i++) {
    const consumer = consumers[Math.floor(Math.random() * consumers.length)];
    const produto = produtos[Math.floor(Math.random() * produtos.length)];
    const merchant = await prisma.user.findUnique({ where: { id: produto.merchantId } });

    const totalAmount = parseFloat(produto.price);
    const cashbackAmount = totalAmount * (parseFloat(produto.cashbackPercentage) / 100);
    const platformFee = totalAmount * 0.03; // 3% taxa
    const merchantAmount = totalAmount - cashbackAmount - platformFee;

    const status = i < 20 ? 'completed' : statusOptions[Math.floor(Math.random() * statusOptions.length)];

    // Data aleatória nos últimos 30 dias
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const compra = await prisma.purchase.create({
      data: {
        consumerId: consumer.id,
        merchantId: merchant.id,
        productId: produto.id,
        totalAmount,
        merchantAmount,
        consumerCashback: cashbackAmount,
        platformFee,
        consumerReferrerFee: 0,
        merchantReferrerFee: 0,
        status,
        txHash: status === 'completed' ? `0x${Math.random().toString(16).substr(2, 64)}` : null,
        createdAt,
        completedAt: status === 'completed' ? createdAt : null
      }
    });
    compras.push(compra);
  }

  console.log(`✅ ${compras.length} compras criadas\n`);

  // ==========================================
  // 5. CRIAR CONFIGURAÇÕES DE CASHBACK PERSONALIZADAS
  // ==========================================
  console.log('💰 Criando configurações de cashback...');

  // Alguns usuários VIP com cashback diferenciado
  for (let i = 0; i < 2; i++) {
    await prisma.userCashbackConfig.upsert({
      where: { userId: consumers[i].id },
      update: {},
      create: {
        userId: consumers[i].id,
        consumerPercent: 12.00, // Maior que o padrão
        clubPercent: 3.00,
        consumerReferrerPercent: 2.00,
        merchantReferrerPercent: 3.00,
        reason: 'Cliente VIP - cashback premium',
        configuredBy: adminUser.id
      }
    });
  }

  console.log('✅ Configurações de cashback criadas\n');

  // ==========================================
  // 6. CAMPANHAS PUSH - Pulado devido à complexidade do clubId
  // ==========================================
  console.log('⏭️  Campanhas push puladas (adicionar manualmente se necessário)\n');

  // ==========================================
  // 8. CRIAR NOTIFICAÇÕES IN-APP
  // ==========================================
  console.log('🔔 Criando notificações in-app...');

  const notificationTypes = ['purchase', 'cashback', 'referral', 'system', 'promotion'];
  const notificationsData = [
    { type: 'purchase', title: 'Compra realizada!', message: 'Sua compra foi confirmada. Cashback será creditado em 24h.' },
    { type: 'cashback', title: 'Cashback creditado!', message: 'R$ 15,50 de cashback foi adicionado à sua carteira.' },
    { type: 'promotion', title: 'Oferta especial!', message: 'Aproveite 20% de desconto + cashback em dobro hoje!' },
    { type: 'system', title: 'Bem-vindo ao Clube Navi', message: 'Obrigado por fazer parte do nosso clube!' },
    { type: 'referral', title: 'Amigo indicado!', message: 'Seu amigo se cadastrou. Você ganhou R$ 10 de bônus!' }
  ];

  let notifCount = 0;
  for (const consumer of consumers) {
    for (let i = 0; i < 3; i++) {
      const notifData = notificationsData[Math.floor(Math.random() * notificationsData.length)];
      const createdAt = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000);

      await prisma.notification.create({
        data: {
          userId: consumer.id,
          type: notifData.type,
          title: notifData.title,
          message: notifData.message,
          isRead: Math.random() > 0.5,
          readAt: Math.random() > 0.5 ? new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000) : null,
          createdAt
        }
      });
      notifCount++;
    }
  }

  console.log(`✅ ${notifCount} notificações in-app criadas\n`);

  // ==========================================
  // 9. CRIAR EVENTOS DE ANALYTICS
  // ==========================================
  console.log('📊 Criando eventos de analytics...');

  const eventTypes = ['page_view', 'click', 'purchase', 'notification_open'];
  const pages = ['/dashboard', '/products', '/marketplace', '/wallet', '/profile'];

  let analyticsCount = 0;
  for (let i = 0; i < 100; i++) {
    const user = [...consumers, ...merchants][Math.floor(Math.random() * (consumers.length + merchants.length))];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType,
        eventName: eventType === 'page_view' ? 'page_viewed' : eventType === 'click' ? 'button_clicked' : 'purchase_completed',
        category: eventType === 'purchase' ? 'transaction' : 'engagement',
        pagePath: pages[Math.floor(Math.random() * pages.length)],
        platform: ['ios', 'android', 'web'][Math.floor(Math.random() * 3)],
        deviceType: ['mobile', 'tablet', 'desktop'][Math.floor(Math.random() * 3)],
        createdAt
      }
    });
    analyticsCount++;
  }

  console.log(`✅ ${analyticsCount} eventos de analytics criados\n`);

  // ==========================================
  // RESUMO FINAL
  // ==========================================
  console.log('\n🎉 SEED COMPLETO!\n');
  console.log('═══════════════════════════════════════');
  console.log(`📦 Grupos: ${grupos.length}`);
  console.log(`🛍️  Produtos: ${produtos.length}`);
  console.log(`💳 Compras: ${compras.length}`);
  console.log(`🔔 Notificações In-App: ${notifCount}`);
  console.log(`📊 Eventos Analytics: ${analyticsCount}`);
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const masterPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL || 'postgresql://clube_digital_user:clube_digital_password@localhost:5432/clube_digital_master?schema=public'
    }
  }
});

async function resetPassword() {
  try {
    const email = 'admin@clube-navi.com';
    const newPassword = 'Admin@2025';

    console.log('🔐 Gerando hash da nova senha...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('📝 Atualizando senha no banco de dados...');
    // Usar SQL direto porque a tabela é snake_case
    await masterPrisma.$executeRaw`
      UPDATE club_admins
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE email = ${email}
    `;

    console.log('✅ Senha atualizada com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${newPassword}`);
    console.log('\n🌐 Acesse: http://clube-navi.localhost:3001/login');

  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
  } finally {
    await masterPrisma.$disconnect();
  }
}

resetPassword();

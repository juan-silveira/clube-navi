const { PrismaClient } = require('../../src/generated/prisma');
const prisma = new PrismaClient();

async function seedI18n() {
  console.log('🌍 Seeding internationalization data...');

  try {
    // 1. Criar idiomas
    console.log('Creating languages...');

    const languages = await Promise.all([
      prisma.language.upsert({
        where: { code: 'pt-BR' },
        update: {},
        create: {
          code: 'pt-BR',
          name: 'Português (Brasil)',
          flag: '🇧🇷',
          isActive: true,
          isDefault: true,
        },
      }),
      prisma.language.upsert({
        where: { code: 'en-US' },
        update: {},
        create: {
          code: 'en-US',
          name: 'English (US)',
          flag: '🇺🇸',
          isActive: true,
          isDefault: false,
        },
      }),
      prisma.language.upsert({
        where: { code: 'es' },
        update: {},
        create: {
          code: 'es',
          name: 'Español',
          flag: '🇪🇸',
          isActive: true,
          isDefault: false,
        },
      }),
    ]);

    console.log(`✓ Created ${languages.length} languages`);

    // 2. Criar namespaces
    console.log('Creating namespaces...');

    const namespaces = await Promise.all([
      prisma.translationNamespace.upsert({
        where: { key: 'common' },
        update: {},
        create: {
          key: 'common',
          description: 'Textos comuns (botões, labels, mensagens genéricas)',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'auth' },
        update: {},
        create: {
          key: 'auth',
          description: 'Telas de autenticação (login, registro, recuperação de senha)',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'dashboard' },
        update: {},
        create: {
          key: 'dashboard',
          description: 'Dashboards (usuário e admin)',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'financial' },
        update: {},
        create: {
          key: 'financial',
          description: 'Operações financeiras (depósito, saque, transferência)',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'exchange' },
        update: {},
        create: {
          key: 'exchange',
          description: 'Exchange (mercado, book, ordens)',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'stake' },
        update: {},
        create: {
          key: 'stake',
          description: 'Staking e investimentos',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'admin' },
        update: {},
        create: {
          key: 'admin',
          description: 'Administração de empresas',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'system' },
        update: {},
        create: {
          key: 'system',
          description: 'Administração do sistema',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'errors' },
        update: {},
        create: {
          key: 'errors',
          description: 'Mensagens de erro',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'validations' },
        update: {},
        create: {
          key: 'validations',
          description: 'Mensagens de validação de formulários',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'notifications' },
        update: {},
        create: {
          key: 'notifications',
          description: 'Notificações e alertas',
        },
      }),
      prisma.translationNamespace.upsert({
        where: { key: 'emails' },
        update: {},
        create: {
          key: 'emails',
          description: 'Templates de email',
        },
      }),
    ]);

    console.log(`✓ Created ${namespaces.length} namespaces`);

    // 3. Criar algumas traduções de exemplo (common namespace)
    console.log('Creating sample translations...');

    const commonNamespace = namespaces[0];
    const ptBR = languages[0];
    const enUS = languages[1];
    const es = languages[2];

    const sampleTranslations = [
      // Botões comuns
      { key: 'buttons.save', ptBR: 'Salvar', enUS: 'Save', es: 'Guardar', screen: 'common' },
      { key: 'buttons.cancel', ptBR: 'Cancelar', enUS: 'Cancel', es: 'Cancelar', screen: 'common' },
      { key: 'buttons.confirm', ptBR: 'Confirmar', enUS: 'Confirm', es: 'Confirmar', screen: 'common' },
      { key: 'buttons.delete', ptBR: 'Excluir', enUS: 'Delete', es: 'Eliminar', screen: 'common' },
      { key: 'buttons.edit', ptBR: 'Editar', enUS: 'Edit', es: 'Editar', screen: 'common' },
      { key: 'buttons.back', ptBR: 'Voltar', enUS: 'Back', es: 'Volver', screen: 'common' },
      { key: 'buttons.next', ptBR: 'Próximo', enUS: 'Next', es: 'Siguiente', screen: 'common' },
      { key: 'buttons.submit', ptBR: 'Enviar', enUS: 'Submit', es: 'Enviar', screen: 'common' },
      { key: 'buttons.close', ptBR: 'Fechar', enUS: 'Close', es: 'Cerrar', screen: 'common' },
      { key: 'buttons.search', ptBR: 'Buscar', enUS: 'Search', es: 'Buscar', screen: 'common' },

      // Labels comuns
      { key: 'labels.name', ptBR: 'Nome', enUS: 'Name', es: 'Nombre', screen: 'common' },
      { key: 'labels.email', ptBR: 'E-mail', enUS: 'Email', es: 'Correo electrónico', screen: 'common' },
      { key: 'labels.password', ptBR: 'Senha', enUS: 'Password', es: 'Contraseña', screen: 'common' },
      { key: 'labels.date', ptBR: 'Data', enUS: 'Date', es: 'Fecha', screen: 'common' },
      { key: 'labels.amount', ptBR: 'Valor', enUS: 'Amount', es: 'Monto', screen: 'common' },
      { key: 'labels.status', ptBR: 'Status', enUS: 'Status', es: 'Estado', screen: 'common' },
      { key: 'labels.actions', ptBR: 'Ações', enUS: 'Actions', es: 'Acciones', screen: 'common' },
      { key: 'labels.description', ptBR: 'Descrição', enUS: 'Description', es: 'Descripción', screen: 'common' },

      // Mensagens comuns
      { key: 'messages.success', ptBR: 'Operação realizada com sucesso', enUS: 'Operation completed successfully', es: 'Operación completada exitosamente', screen: 'common' },
      { key: 'messages.error', ptBR: 'Ocorreu um erro', enUS: 'An error occurred', es: 'Ocurrió un error', screen: 'common' },
      { key: 'messages.loading', ptBR: 'Carregando...', enUS: 'Loading...', es: 'Cargando...', screen: 'common' },
      { key: 'messages.noData', ptBR: 'Nenhum dado encontrado', enUS: 'No data found', es: 'No se encontraron datos', screen: 'common' },
      { key: 'messages.confirmDelete', ptBR: 'Tem certeza que deseja excluir?', enUS: 'Are you sure you want to delete?', es: '¿Está seguro de que desea eliminar?', screen: 'common' },
    ];

    for (const sample of sampleTranslations) {
      // PT-BR
      await prisma.translation.upsert({
        where: {
          unique_translation: {
            namespaceId: commonNamespace.id,
            languageId: ptBR.id,
            key: sample.key,
          },
        },
        update: {},
        create: {
          namespaceId: commonNamespace.id,
          languageId: ptBR.id,
          key: sample.key,
          value: sample.ptBR,
          screen: sample.screen,
        },
      });

      // EN-US
      await prisma.translation.upsert({
        where: {
          unique_translation: {
            namespaceId: commonNamespace.id,
            languageId: enUS.id,
            key: sample.key,
          },
        },
        update: {},
        create: {
          namespaceId: commonNamespace.id,
          languageId: enUS.id,
          key: sample.key,
          value: sample.enUS,
          screen: sample.screen,
        },
      });

      // ES
      await prisma.translation.upsert({
        where: {
          unique_translation: {
            namespaceId: commonNamespace.id,
            languageId: es.id,
            key: sample.key,
          },
        },
        update: {},
        create: {
          namespaceId: commonNamespace.id,
          languageId: es.id,
          key: sample.key,
          value: sample.es,
          screen: sample.screen,
        },
      });
    }

    console.log(`✓ Created ${sampleTranslations.length * 3} sample translations`);

    console.log('✅ Internationalization seed completed!');
    console.log('');
    console.log('Summary:');
    console.log(`  - ${languages.length} languages`);
    console.log(`  - ${namespaces.length} namespaces`);
    console.log(`  - ${sampleTranslations.length * 3} translations`);

  } catch (error) {
    console.error('❌ Error seeding i18n data:', error);
    throw error;
  }
}

module.exports = seedI18n;

// Se executado diretamente
if (require.main === module) {
  seedI18n()
    .then(() => {
      console.log('Seed completed');
      prisma.$disconnect();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      prisma.$disconnect();
      process.exit(1);
    });
}

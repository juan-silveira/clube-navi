/**
 * Script para migrar os tipos de documentos de português para inglês
 *
 * Migra:
 * - "lamina" → "whitepaper"
 * - "informacoes_essenciais" → "essential_info"
 * - "oferta_publica" → "offer_info"
 *
 * Usage: node scripts/migrate-document-types.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const prismaConfig = require('../src/config/prisma');

const TYPE_MAPPING = {
  'lamina': 'whitepaper',
  'informacoes_essenciais': 'essential_info',
  'oferta_publica': 'offer_info'
};

async function migrateDocumentTypes() {
  await prismaConfig.initialize();
  const prisma = prismaConfig.getPrisma();

  try {
    console.log('🚀 Iniciando migração de tipos de documentos...\n');

    // Buscar todos os contratos com documentos
    const contracts = await prisma.smartContract.findMany({
      where: {
        metadata: {
          path: ['documents'],
          not: { equals: null }
        }
      },
      select: {
        id: true,
        name: true,
        metadata: true
      }
    });

    console.log(`📋 Encontrados ${contracts.length} contratos com documentos\n`);

    let updatedCount = 0;
    let unchangedCount = 0;

    for (const contract of contracts) {
      const documents = contract.metadata?.documents;

      if (!Array.isArray(documents) || documents.length === 0) {
        unchangedCount++;
        continue;
      }

      let hasChanges = false;
      const updatedDocuments = documents.map(doc => {
        if (TYPE_MAPPING[doc.type]) {
          console.log(`  📝 ${contract.name}: ${doc.type} → ${TYPE_MAPPING[doc.type]}`);
          hasChanges = true;

          // Atualizar também a key no S3 se necessário
          const oldKey = doc.key;
          const newKey = oldKey ? oldKey.replace(`/${doc.type}/`, `/${TYPE_MAPPING[doc.type]}/`) : oldKey;

          return {
            ...doc,
            type: TYPE_MAPPING[doc.type],
            key: newKey
          };
        }
        return doc;
      });

      if (hasChanges) {
        await prisma.smartContract.update({
          where: { id: contract.id },
          data: {
            metadata: {
              ...contract.metadata,
              documents: updatedDocuments
            },
            updatedAt: new Date()
          }
        });

        console.log(`  ✅ ${contract.name}: ${updatedDocuments.length} documento(s) atualizado(s)\n`);
        updatedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total de contratos analisados: ${contracts.length}`);
    console.log(`✅ Contratos atualizados: ${updatedCount}`);
    console.log(`⏭️ Contratos sem alterações: ${unchangedCount}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (updatedCount > 0) {
      console.log('✅ Migração concluída! Os tipos de documentos foram atualizados.\n');
      console.log('⚠️ IMPORTANTE: As chaves do S3 foram atualizadas no metadata, mas os arquivos');
      console.log('   físicos no S3 ainda estão nas pastas antigas. Eles continuarão funcionando');
      console.log('   normalmente, pois as URLs completas foram preservadas.\n');
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
migrateDocumentTypes()
  .then(() => {
    console.log('✅ Script finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  });

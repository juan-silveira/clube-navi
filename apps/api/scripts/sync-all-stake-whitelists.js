/**
 * Script para sincronizar a whitelist de todos os contratos de stake
 * Popula o campo metadata.whitelist para evitar dependência de blockchain no carregamento inicial
 *
 * Usage: node scripts/sync-all-stake-whitelists.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const prismaConfig = require('../src/config/prisma');
const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const blockchainService = require('../src/services/blockchain.service');

// Carregar ABI do contrato de stake
function loadStakeABI() {
  try {
    const abiPath = path.join(__dirname, '../src/contracts/abis/default_stake_abi.json');
    const abiFile = fs.readFileSync(abiPath, 'utf8');
    const abiJson = JSON.parse(abiFile);
    return abiJson.abi || abiJson;
  } catch (error) {
    console.error('❌ Erro ao carregar ABI do StakeContract:', error.message);
    return null;
  }
}

// Verificar se whitelist está habilitada
async function checkWhitelistStatus(contractAddress, network, abi) {
  try {
    const provider = blockchainService.config.getProvider(network);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    if (!contract.whitelistEnabled) {
      console.log(`   ⚠️ Contrato não possui função whitelistEnabled`);
      return false;
    }

    const enabled = await contract.whitelistEnabled();
    return enabled;
  } catch (error) {
    console.warn(`   ❌ Erro ao verificar whitelist: ${error.message}`);
    return false;
  }
}

// Buscar endereços whitelistados
async function getWhitelistedAddresses(contractAddress, network, abi) {
  try {
    const provider = blockchainService.config.getProvider(network);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    if (!contract.getWhitelistedAddresses) {
      console.log(`   ⚠️ Contrato não possui função getWhitelistedAddresses`);
      return [];
    }

    const addresses = await contract.getWhitelistedAddresses();
    return addresses || [];
  } catch (error) {
    console.warn(`   ❌ Erro ao buscar endereços: ${error.message}`);
    return [];
  }
}

async function syncAllStakeWhitelists() {
  // Inicializar Prisma
  await prismaConfig.initialize();
  const prisma = prismaConfig.getPrisma();

  try {
    console.log('🚀 Iniciando sincronização de whitelists de contratos de stake...\n');

    // Buscar todos os contratos de stake
    const stakeContracts = await prisma.smartContract.findMany({
      where: {
        OR: [
          {
            metadata: {
              path: ['contractType'],
              equals: 'stake'
            }
          },
          {
            metadata: {
              path: ['contractType'],
              equals: 'staking'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        address: true,
        network: true,
        metadata: true,
        abi: true
      }
    });

    console.log(`📋 Encontrados ${stakeContracts.length} contratos de stake\n`);

    // Carregar ABI padrão
    const defaultStakeABI = loadStakeABI();

    if (!defaultStakeABI) {
      throw new Error('Não foi possível carregar o ABI padrão do StakeContract');
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Processar cada contrato
    for (const contract of stakeContracts) {
      console.log(`\n📍 Processando: ${contract.name} (${contract.address})`);
      console.log(`   Rede: ${contract.network}`);

      try {
        // Usar ABI do contrato ou padrão
        let abi = typeof contract.abi === 'string' ? JSON.parse(contract.abi) : contract.abi;
        if (!abi) {
          abi = defaultStakeABI;
        }

        // Verificar se whitelist está habilitada
        const whitelistEnabled = await checkWhitelistStatus(
          contract.address,
          contract.network.toLowerCase(),
          abi
        );

        console.log(`   Whitelist habilitada: ${whitelistEnabled ? 'Sim ✅' : 'Não ❌'}`);

        let whitelistAddresses = [];

        if (whitelistEnabled) {
          // Buscar endereços whitelistados
          whitelistAddresses = await getWhitelistedAddresses(
            contract.address,
            contract.network.toLowerCase(),
            abi
          );

          console.log(`   Endereços na whitelist: ${whitelistAddresses.length}`);

          if (whitelistAddresses.length > 0) {
            console.log(`   Primeiros 3 endereços: ${whitelistAddresses.slice(0, 3).join(', ')}`);
          }
        }

        // Atualizar metadata
        const updatedMetadata = {
          ...contract.metadata,
          whitelistEnabled,
          whitelist: whitelistAddresses.map(addr => addr.toLowerCase()),
          whitelistLastSync: new Date().toISOString()
        };

        await prisma.smartContract.update({
          where: { id: contract.id },
          data: {
            metadata: updatedMetadata,
            updatedAt: new Date()
          }
        });

        console.log(`   ✅ Metadata atualizado com sucesso`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Erro ao processar contrato: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA SINCRONIZAÇÃO');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total de contratos: ${stakeContracts.length}`);
    console.log(`✅ Sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`⏭️ Pulados: ${skippedCount}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (successCount > 0) {
      console.log('✅ Sincronização concluída! Os contratos agora usarão metadata para whitelist.');
      console.log('   Isso evitará chamadas desnecessárias à blockchain no carregamento inicial.\n');
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
syncAllStakeWhitelists()
  .then(() => {
    console.log('✅ Script finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  });

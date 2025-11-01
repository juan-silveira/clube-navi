// Interceptar múltiplas funções de output para filtrar erros específicos do ethers.js
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalStderrWrite = process.stderr.write;
const originalStdoutWrite = process.stdout.write;

// Função para verificar se a mensagem deve ser filtrada
const shouldFilterMessage = (message) => {
  const msgStr = typeof message === 'string' ? message : String(message);
  return (msgStr.includes('results is not iterable') && msgStr.includes('FilterIdEventSubscriber')) ||
         (msgStr.includes('@TODO') && msgStr.includes('results is not iterable')) ||
         (msgStr.includes('@TODO TypeError: results is not iterable'));
};

// Interceptar console.error
console.error = (...args) => {
  const message = args.join(' ');
  if (shouldFilterMessage(message)) {
    return; // Silenciar estes erros específicos
  }
  originalConsoleError.apply(console, args);
};

// Interceptar console.log
console.log = (...args) => {
  const message = args.join(' ');
  if (shouldFilterMessage(message)) {
    return; // Silenciar estes erros específicos
  }
  originalConsoleLog.apply(console, args);
};

// Interceptar process.stderr.write
process.stderr.write = function(string, encoding, fd) {
  if (shouldFilterMessage(string)) {
    return true; // Silenciar estes erros específicos
  }
  return originalStderrWrite.call(this, string, encoding, fd);
};

// Interceptar process.stdout.write
process.stdout.write = function(string, encoding, fd) {
  if (shouldFilterMessage(string)) {
    return true; // Silenciar estes erros específicos
  }
  return originalStdoutWrite.call(this, string, encoding, fd);
};

// Carregar variáveis de ambiente do diretório pai PRIMEIRO
const path = require('path');
const fs = require('fs');

// IMPORTANTE: Em produção, o .env está em /var/www/coinage/.env
const prodEnvPath = path.join(__dirname, '../../.env');
const backupEnvPath = path.join(__dirname, '../.env');

// Tentar carregar da raiz primeiro, depois do backend
let envPath = prodEnvPath;
if (!fs.existsSync(envPath)) {
  console.log('⚠️ .env não encontrado na raiz, tentando backend...');
  envPath = backupEnvPath;
}

console.log('📁 Carregando variáveis de ambiente de:', envPath);
const dotenvResult = require('dotenv').config({ path: envPath });

if (dotenvResult.error) {
  console.error('❌ Erro ao carregar .env:', dotenvResult.error);
  console.log('🔄 Tentando carregar variáveis do processo...');
}

// Log COMPLETO das variáveis PIX para debug
console.log('📦 Environment PIX/EFI loaded:', {
  PIX_PROVIDER: process.env.PIX_PROVIDER,
  PIX_FALLBACK_PROVIDER: process.env.PIX_FALLBACK_PROVIDER,
  USE_PIX_MOCK: process.env.USE_PIX_MOCK,
  EFI_CLIENT_ID: process.env.EFI_CLIENT_ID ? '***CONFIGURADO***' : 'NÃO CONFIGURADO',
  EFI_CLIENT_SECRET: process.env.EFI_CLIENT_SECRET ? '***CONFIGURADO***' : 'NÃO CONFIGURADO',
  EFI_PIX_KEY: process.env.EFI_PIX_KEY || 'NÃO CONFIGURADO',
  HAS_ASAAS_KEY: !!process.env.ASAAS_API_KEY,
  NODE_ENV: process.env.NODE_ENV
});

const app = require('./app');
const http = require('http');
const websocketService = require('./services/websocket.service');
const exchangeSystemManager = require('./services/exchangeSystemManager');
const reconciliationWorker = require('./workers/reconciliationWorker');

// Importar configuração Prisma ao invés do Sequelize
const prismaConfig = require('./config/prisma');
const redisService = require('./services/redis.service');
const userCacheService = require('./services/userCache.service');

// Importar serviços (mantenha os originais por enquanto, eles serão migrados gradualmente)
const contractService = require('./services/contract.service');
const companyService = require('./services/company.service');
const userService = require('./services/user.service');
const logService = require('./services/log.service');
const adminService = require('./services/admin.service.prisma');
const passwordResetService = require('./services/passwordReset.service');
const tokenInitializerService = require('./services/tokenInitializer.service');
const tokenService = require('./services/token.service');
const stakeService = require('./services/stake.service');
const queueService = require('./services/queue.service');
// const initService = require('./services/init.service.prisma'); // Temporariamente desabilitado

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Função para iniciar o servidor
const startServer = () => {
  try {
    // Criar servidor HTTP
    const server = http.createServer(app);

    // Inicializar WebSocket
    websocketService.initialize(server);

    // Disponibilizar websocketService globalmente para outros serviços
    global.websocketService = websocketService;

    server.listen(PORT, () => {
      console.log('🚀 Azore Blockchain API Service iniciado com sucesso! (PRISMA)');
      console.log(`📍 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${NODE_ENV}`);
      console.log(`🗄️ ORM: Prisma`);
      console.log(`🔌 WebSocket: Ativo`);
      console.log(`⏰ Iniciado em: ${new Date().toISOString()}`);
      console.log('');
      console.log('📋 Endpoints disponíveis:');
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log(`   API Info: http://localhost:${PORT}/`);
      console.log(`   Test Connection: http://localhost:${PORT}/api/test/connection`);
      console.log(`   Network Info: http://localhost:${PORT}/api/test/network-info`);

      console.log('');
      console.log('🔗 Para testar a conexão com a blockchain:');
      console.log(`   curl http://localhost:${PORT}/api/test/connection`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Inicialização assíncrona com Prisma
(async () => {
  try {
    console.log('🔍 Inicializando conexão Prisma...');
    const prisma = await prismaConfig.initialize();
    console.log('✅ Conexão Prisma estabelecida');

    // Disponibilizar Prisma globalmente (para compatibilidade com código existente)
    global.prisma = prisma;
    global.prismaConfig = prismaConfig;

    // TokenPriceUpdater não precisa mais de inicialização explícita
    console.log('✅ TokenPriceUpdater pronto para uso');
    
    // Para compatibilidade com código Sequelize existente, criar um mock básico
    global.models = {
      // Os services antigos ainda vão funcionar por enquanto
      // Gradualmente serão migrados para usar Prisma diretamente
    };
    
    // Inicializar Redis
    try {
      await redisService.initialize();
      console.log('✅ Redis: Conectado e inicializado');
    } catch (error) {
      console.error('❌ Erro ao conectar Redis:', error.message);
    }
    
    // Inicializar UserCacheService
    try {
      await userCacheService.initialize();
      console.log('✅ UserCacheService: Inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar UserCacheService:', error.message);
    }
    
    // Inicializar serviços (alguns podem falhar se dependem de Sequelize, mas não vamos quebrar)
    console.log('🔍 Inicializando serviços...');
    
    try {
      await contractService.initialize();
      console.log('✅ Contract service inicializado');
    } catch (error) {
      console.log('⚠️ Contract service: não inicializado (aguardando migração para Prisma)');
    }
    
    try {
      await companyService.initialize();
      console.log('✅ Company service (Prisma) inicializado');
    } catch (error) {
      console.log('⚠️ Company service: erro na inicialização -', error.message);
    }
    
    try {
      await userService.init();
      console.log('✅ User service (Prisma) inicializado');
    } catch (error) {
      console.log('⚠️ User service: erro na inicialização -', error.message);
    }
    
    try {
      await logService.initialize();
      console.log('✅ Log service inicializado');
    } catch (error) {
      console.log('⚠️ Log service: não inicializado (aguardando migração para Prisma)');
    }
    
    try {
      await passwordResetService.initialize();
      console.log('✅ Password reset service inicializado');
    } catch (error) {
      console.log('⚠️ Password reset service: não inicializado (aguardando migração para Prisma)');
    }
    
    try {
      await tokenService.initialize();
      console.log('✅ Token service inicializado');
    } catch (error) {
      console.log('⚠️ Token service: não inicializado (aguardando migração para Prisma)');
    }
    
    try {
      await stakeService.initialize();
      console.log('✅ Stake service inicializado');
    } catch (error) {
      console.log('⚠️ Stake service: não inicializado (aguardando migração para Prisma)');
    }
    
    // Inicializar fila (opcional)
    try {
      await queueService.initialize();
      console.log('✅ Queue service inicializado');
    } catch (error) {
      console.log('⚠️ Queue service: não disponível');
    }
    
    
    // Tentar inicializar sistema completo (temporariamente desabilitado)
    try {
      // await initService.initializeSystem();
      console.log('✅ Sistema básico inicializado');
    } catch (error) {
      console.log('⚠️ Sistema: inicialização parcial (alguns serviços podem não estar disponíveis)');
    }
    
    // Tokens serão gerenciados via frontend pelos administradores
    console.log('ℹ️ Tokens serão gerenciados via interface administrativa');

    // Inicializar dados padrão
    console.log('🔍 Verificando dados padrão...');
    try {
      // Verificar se existem empresas
      const companiesCount = await prisma.company.count();
      console.log(`📊 Companies existentes: ${companiesCount}`);
      
      if (companiesCount === 0) {
        console.log('🏗️ Criando empresa padrão...');
        const defaultCompany = await prisma.company.create({
          data: {
            name: 'Company Padrão',
            alias: 'default',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('✅ Company padrão criado:', defaultCompany.name);
      }

      // Verificar se existe empresa com alias 'navi'
      const naviCompany = await prisma.company.findFirst({
        where: { alias: 'navi' }
      });

      if (!naviCompany) {
        console.log('🏗️ Criando empresa Navi...');
        const naviCompany = await prisma.company.create({
          data: {
            name: 'Navi',
            alias: 'navi',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('✅ Company Navi criada:', naviCompany.name);
      }
      
      // Verificar se existem usuários
      const usersCount = await prisma.user.count();
      console.log(`👥 Usuários existentes: ${usersCount}`);
      
      // Criar usuário admin padrão se não existir
      console.log(`🔍 Verificando se deve criar usuário admin (usersCount = ${usersCount})`);
      if (usersCount === 0) {
        console.log('👤 Criando usuário admin padrão...');
        try {
          await adminService.initializeDefaultAdmin();
          console.log('✅ Usuário admin padrão criado com sucesso');
        } catch (error) {
          console.log('⚠️ Erro ao criar usuário admin padrão:', error.message);
        }
      } else {
        console.log('👤 Usuário admin já existe, pulando criação');
      }
      
    } catch (error) {
      console.log('⚠️ Erro ao verificar dados padrão:', error.message);
    }
    
    console.log('');
    console.log('🎉 Sistema iniciado com Prisma!');
    console.log('📝 Nota: Alguns serviços podem não estar disponíveis até a migração completa');
    
    // Inicializar MintWorker
    try {
      const mintWorker = require('./workers/mint.worker');
      await mintWorker.start();
      console.log('🏭 MintWorker inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar MintWorker:', error.message);
    }

    // Inicializar CDI Sync Job
    try {
      const cdiSyncJob = require('./jobs/cdiSync.job');
      cdiSyncJob.start();
      console.log('💹 CDI Sync Job inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar CDI Sync Job:', error.message);
    }

    // Inicializar Exchange V2 (Gasless Architecture)
    try {
      console.log('🚀 Inicializando Exchange V2 (Gasless)...');
      const exchangeRoutes = require('./routes/exchangeRoutes');

      const CONTRACT_ADDRESS = process.env.EXCHANGE_CONTRACT_ADDRESS || '0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9';
      const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
      const RPC_URL = defaultNetwork === 'mainnet'
        ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
        : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';
      const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;

      // Load proper exchange ABI
      const loadExchangeABI = () => {
        try {
          const abiPath = path.join(__dirname, 'contracts', 'abis', 'default_exchange_abi.json');
          const abiContent = fs.readFileSync(abiPath, 'utf8');
          return JSON.parse(abiContent);
        } catch (error) {
          console.error('Error loading exchange ABI:', error);
          return null;
        }
      };

      const CONTRACT_ABI = loadExchangeABI();

      if (!CONTRACT_ABI) {
        console.error('❌ Failed to load exchange ABI, skipping exchange initialization');
        return;
      }

      await exchangeRoutes.initializeServices(CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL, {
        privateKey: ADMIN_PRIVATE_KEY
      });

      console.log('✅ Exchange V2 (Gasless) inicializado com sucesso!');
      console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);

      // Inicializar sistema de matching otimizado
      console.log('🚀 Initializing Exchange Matching System...');
      try {
        // Buscar todos os contratos de exchange do banco de dados
        const exchangeContracts = await prisma.smartContract.findMany({
          where: {
            contractTypeId: 'b96cbbfd-38b9-4224-8eb6-467fb612190b', // Exchange contract type
            isActive: true
          }
        });

        console.log(`📋 Found ${exchangeContracts.length} exchange contracts in database`);

        // Preparar contratos para inicialização
        const contractsConfig = exchangeContracts.map(contract => {
          const metadata = contract.metadata || {};

          // Validar que temos os metadados necessários
          if (!metadata.tokenA || !metadata.tokenB) {
            console.warn(`⚠️ Contract ${contract.name} (${contract.address}) missing token metadata`);
            return null;
          }

          return {
            address: contract.address,
            abi: CONTRACT_ABI, // Mesmo ABI para todos os contratos de exchange
            name: contract.name,
            tokenA: metadata.tokenA,
            tokenB: metadata.tokenB
          };
        }).filter(Boolean); // Remove contratos sem metadata válido

        // Log dos contratos encontrados
        contractsConfig.forEach(contract => {
          console.log(`  - ${contract.name}: ${contract.tokenA.symbol}/${contract.tokenB.symbol} at ${contract.address}`);
        });

        await exchangeSystemManager.initialize({
          rpcUrl: RPC_URL,
          privateKey: ADMIN_PRIVATE_KEY,
          exchangeContracts: contractsConfig
        });

        console.log('✅ Exchange Matching System initialized successfully!');
      } catch (error) {
        console.error('❌ Failed to initialize Exchange Matching System:', error);
        console.log('⚠️ Exchange will continue without optimized matching');
      }

      // Inicializar AutoMatchingService
      try {
        const AutoMatchingService = require('./services/autoMatchingService');
        const ExchangeService = require('./services/exchangeService');

        const exchangeService = new ExchangeService();

        await exchangeService.initialize(CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL);

        const autoMatchingService = new AutoMatchingService(exchangeService, prisma);
        await autoMatchingService.start(); // Agora é assíncrono para carregar contratos

        global.autoMatchingService = autoMatchingService;

        // Cleanup no shutdown
        process.on('SIGTERM', () => {
          autoMatchingService.stop();
        });

        process.on('SIGINT', () => {
          autoMatchingService.stop();
        });

        console.log('✅ AutoMatchingService inicializado - Matching automático a cada 1 segundo');
      } catch (error) {
        console.error('❌ Erro ao inicializar AutoMatchingService:', error);
      }

      // Inicializar MatchExecutorService
      try {
        const MatchExecutorService = require('./services/matchExecutorService');

        const matchExecutorService = new MatchExecutorService();
        await matchExecutorService.initialize(RPC_URL, ADMIN_PRIVATE_KEY);
        await matchExecutorService.startConsumer();

        global.matchExecutorService = matchExecutorService;

        // Cleanup no shutdown
        process.on('SIGTERM', async () => {
          await matchExecutorService.stop();
        });

        process.on('SIGINT', async () => {
          await matchExecutorService.stop();
        });

        console.log('✅ MatchExecutorService inicializado - Consumer RabbitMQ ativo');
      } catch (error) {
        console.error('❌ Erro ao inicializar MatchExecutorService:', error);
      }

      // Inicializar WebSocket Broadcast Consumer
      try {
        const WebSocketBroadcastConsumer = require('./services/websocketBroadcastConsumer');

        const websocketBroadcastConsumer = new WebSocketBroadcastConsumer();
        await websocketBroadcastConsumer.initialize(io);
        await websocketBroadcastConsumer.startConsumer();

        global.websocketBroadcastConsumer = websocketBroadcastConsumer;

        // Cleanup no shutdown
        process.on('SIGTERM', async () => {
          await websocketBroadcastConsumer.stop();
        });

        process.on('SIGINT', async () => {
          await websocketBroadcastConsumer.stop();
        });

        console.log('✅ WebSocket Broadcast Consumer inicializado - Notificações em tempo real ativas');
      } catch (error) {
        console.error('❌ Erro ao inicializar WebSocket Broadcast Consumer:', error);
      }

      console.log(`🔗 RPC: ${RPC_URL}`);
      console.log('🛡️ Arquitetura gasless: Admin wallet com TRANSFER_ROLE');

      // Inicializar InstantOrderIdUpdater (substitui o sistema de intervalo)
      try {
        const InstantOrderIdUpdater = require('./services/instantOrderIdUpdater.service');
        const instantUpdater = new InstantOrderIdUpdater();
        await instantUpdater.initialize();

        // Inicia escuta em tempo real (PostgreSQL NOTIFY/LISTEN)
        await instantUpdater.startListening();

        console.log('🎯 InstantOrderIdUpdater ativo - RESPOSTA IMEDIATA');
        console.log('⚡ Toda nova ordem será processada INSTANTANEAMENTE');

        // Cleanup graceful
        process.on('SIGTERM', async () => {
          await instantUpdater.destroy();
        });

        process.on('SIGINT', async () => {
          await instantUpdater.destroy();
        });

      } catch (error) {
        console.error('❌ Erro ao inicializar InstantOrderIdUpdater:', error.message);
      }

      // Inicializar Reconciliation Worker
      try {
        console.log('🔄 Inicializando Reconciliation Worker...');

        // Aguardar um pouco para não sobrecarregar na inicialização
        setTimeout(() => {
          // reconciliationWorker.start(); // DESABILITADO - causando transações duplicadas
          console.log('🚫 Reconciliation Worker DESABILITADO para evitar transações duplicadas');
        }, 5000); // 5 segundos de delay

        // Cleanup graceful
        process.on('SIGTERM', async () => {
          reconciliationWorker.stop();
        });

        process.on('SIGINT', async () => {
          reconciliationWorker.stop();
        });

      } catch (error) {
        console.error('❌ Erro ao inicializar Reconciliation Worker:', error.message);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar Exchange V2:', error.message);
      console.log('⚠️ Exchange V2 não disponível, mas servidor continuará...');
    }

    console.log('');

    startServer();
  } catch (err) {
    console.error('❌ Erro na inicialização do Prisma:', err);
    
    // Tentar iniciar mesmo com alguns erros (modo degradado)
    console.log('🔄 Tentando iniciar em modo degradado...');
    try {
      startServer();
    } catch (serverError) {
      console.error('❌ Erro crítico ao iniciar servidor:', serverError);
      process.exit(1);
    }
  }
})();

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  try {
    // Shutdown Exchange System Manager primeiro
    await exchangeSystemManager.shutdown();
    console.log('✅ Exchange System Manager encerrado');

    await prismaConfig.close();
    console.log('✅ Conexões Prisma fechadas');
  } catch (error) {
    console.error('❌ Erro ao fechar conexões:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recebido, encerrando servidor...');
  try {
    // Shutdown Exchange System Manager primeiro
    await exchangeSystemManager.shutdown();
    console.log('✅ Exchange System Manager encerrado');

    await prismaConfig.close();
    console.log('✅ Conexões Prisma fechadas');
  } catch (error) {
    console.error('❌ Erro ao fechar conexões:', error);
  }
  process.exit(0);
});

// Interceptador movido para o início do arquivo

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  // Filtrar erros específicos do ethers.js FilterIdEventSubscriber
  if (error.message && error.message.includes('results is not iterable')) {
    // Silenciar este erro específico do ethers.js
    return;
  }

  console.error('⚠️ Erro não capturado (continuando):', error);
  // Não encerrar o processo para permitir que o servidor continue funcionando
});

process.on('unhandledRejection', (reason, promise) => {
  // Filtrar errors específicos do ethers.js
  if (reason && reason.message && reason.message.includes('results is not iterable')) {
    // Silenciar este erro específico do ethers.js
    return;
  }

  console.error('⚠️ Promise rejeitada não tratada (continuando):', reason);
  // Não encerrar o processo para permitir que o servidor continue funcionando
});

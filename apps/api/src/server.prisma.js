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

// Importar configuração Prisma ao invés do Sequelize
const prismaConfig = require('./config/prisma');
const redisService = require('./services/redis.service');
const userCacheService = require('./services/userCache.service');

// Importar serviços
const userService = require('./services/user.service');
const logService = require('./services/log.service');
const adminService = require('./services/admin.service.prisma');
const passwordResetService = require('./services/passwordReset.service');
const queueService = require('./services/queue.service');

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
    
    // Inicializar serviços
    console.log('🔍 Inicializando serviços...');

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
      console.log('⚠️ Log service: não inicializado');
    }

    try {
      await passwordResetService.initialize();
      console.log('✅ Password reset service inicializado');
    } catch (error) {
      console.log('⚠️ Password reset service: não inicializado');
    }

    // Inicializar fila (opcional)
    try {
      await queueService.initialize();
      console.log('✅ Queue service inicializado');
    } catch (error) {
      console.log('⚠️ Queue service: não disponível');
    }

    // Inicializar dados padrão
    console.log('🔍 Verificando dados padrão...');
    try {
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

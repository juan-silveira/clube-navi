// Carregar variáveis de ambiente ANTES de qualquer outra coisa
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Agora importar o resto
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Importar configuração do Swagger
const swaggerSpecs = require('./config/swagger');

// Importar rotas
const testRoutes = require('./routes/test.routes');
const testPrismaRoutes = require('./routes/test-prisma.routes');
const debugLoginRoutes = require('./routes/debug-login.routes');
const testEmailRoutes = require('./routes/test-email.routes');
const testSimpleRoutes = require('./routes/test-simple.routes');
const asaasTestRoutes = require('./routes/asaas-test.routes');
// const debugUserRoutes = require('./routes/debug-user.routes'); // Temporariamente desabilitado

const logRoutes = require('./routes/log.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const passwordResetRoutes = require('./routes/passwordReset.routes');
const transactionRoutes = require('./routes/transaction.routes');
const queueRoutes = require('./routes/queue.routes');
const documentRoutes = require('./routes/document.routes');
const webhookRoutes = require('./routes/webhook.routes');

// Novas rotas
const whitelabelRoutes = require('./routes/whitelabel.routes');
const twoFactorRoutes = require('./routes/twoFactor.routes');
const cacheRoutes = require('./routes/cache.routes');
const notificationRoutes = require('./routes/notification.routes');
const taxReportsRoutes = require('./routes/taxReports.routes');
const userPlanRoutes = require('./routes/userPlan.routes');
const configRoutes = require('./routes/config.routes');
const userDocumentRoutes = require('./routes/userDocument.routes');
const userActionsRoutes = require('./routes/userActions.routes');
const workersRoutes = require('./routes/workers.routes');
const profileRoutes = require('./routes/profile.routes');
const s3PhotoRoutes = require('./routes/s3-photo.routes');
const backupRoutes = require('./routes/backup.routes');

// Routes multi-clube (Products, Purchases & Cashback)
const productRoutes = require('./routes/product.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const cashbackRoutes = require('./routes/cashback.routes');
const balanceRoutes = require('./routes/balance.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const pixValidationRoutes = require('./routes/pix-validation.routes');

// Importar serviços
const logService = require('./services/log.service');

// Importar middlewares
const { 
  authenticateApiKey, 
  checkPermission, 
  checkNetworkAccess, 
  checkUsageLimits,
  addUserInfo,
  logAuthenticatedRequest 
} = require('./middleware/auth.middleware');
const { authenticateJWT, authenticateToken } = require('./middleware/jwt.middleware');
const {
  requireApiAdmin,
  requireCompanyAdmin,
  requireAnyAdmin,
  requireSuperAdmin,
  addUserInfo: addAdminUserInfo,
  logAdminRequest
} = require('./middleware/admin.middleware');
const { 
  apiRateLimiter, 
  transactionRateLimiter, 
  apiKeyRateLimiter,
  loginRateLimiter,
  getRateLimitStats 
} = require('./middleware/rateLimit.middleware');
const {
  performanceMonitoring,
  errorTracking,
  loginTracking,
  databaseErrorTracking,
  criticalAlertMiddleware
} = require('./middleware/alerting.middleware');
// const { 
//   requestLogger, 
//   transactionLogger, 
//   errorLogger, 
//   performanceLogger 
// } = require('./middleware/logging.middleware');
const QueueMiddleware = require('./middleware/queue.middleware');
const CacheRefreshMiddleware = require('./middleware/cacheRefresh.middleware');

// Removidas todas as referências a databaseConfig e modelos do app.js

// Criar aplicação Express
const app = express();

// ====== ENDPOINTS PÚBLICOS (SEM AUTENTICAÇÃO) ======

// Endpoint público para buscar transação por UUID parcial (FORA do /api para evitar middleware)
app.get('/search-deposit/:partialId', async (req, res) => {
  try {
    const { partialId } = req.params;
    
    console.log(`🔍 [SEARCH] Buscando transação com UUID parcial: ${partialId}`);
    
    // Buscar transações que começam com o ID parcial
    const transactions = await global.prisma.transaction.findMany({
      where: {
        id: {
          startsWith: partialId
        },
        transactionType: 'deposit'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1 // Pegar apenas a mais recente
    });
    
    if (transactions.length > 0) {
      const transaction = transactions[0];
      // console.log(`✅ [SEARCH] Transação encontrada: ${transaction.id}`);
      
      res.json({
        success: true,
        data: {
          id: transaction.id,
          status: transaction.status,
          amount: String(transaction.amount),
          currency: transaction.currency,
          transactionType: transaction.transactionType,
          createdAt: transaction.createdAt,
          confirmedAt: transaction.confirmedAt,
          txHash: transaction.txHash,
          blockNumber: transaction.blockNumber,
          gasUsed: transaction.gasUsed,
          metadata: transaction.metadata
        }
      });
    } else {
      console.log(`❌ [SEARCH] Nenhuma transação encontrada iniciando com: ${partialId}`);
      res.status(404).json({
        success: false,
        message: `Nenhuma transação de depósito encontrada iniciando com: ${partialId}`
      });
    }
    
  } catch (error) {
    console.error('❌ [SEARCH] Erro na busca:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ====== INÍCIO DOS MIDDLEWARES ======

// Middlewares de segurança
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Session-Token', 'X-Clube-Slug']
}));

// Middleware de Rate Limiting Global
// TEMPORARIAMENTE DESABILITADO PARA TESTES
// app.use('/api/', apiRateLimiter);

// Middleware de Alertas e Monitoramento
app.use(performanceMonitoring);
app.use(loginTracking);

// Middleware de logging personalizado (antes do morgan)
// app.use(requestLogger);
// app.use(performanceLogger);

// Middleware de logging padrão
app.use(morgan('combined'));

// Global BigInt serialization fix
BigInt.prototype.toJSON = function() { return this.toString() }

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste para Multi-Clube (com clube resolution)
const { resolveClubMiddleware } = require('./middleware/club-resolution.middleware');
app.get('/api/clube-info', resolveClubMiddleware, (req, res) => {
  res.json({
    success: true,
    clube: {
      id: req.club.id,
      slug: req.club.slug,
      companyName: req.club.companyName,
      status: req.club.status,
      plan: req.club.subscriptionPlan,
      subdomain: req.club.subdomain
    },
    database: {
      name: req.club.databaseName,
      host: req.club.databaseHost
    },
    message: '✅ Clube resolution working!'
  });
});

// TESTE DIRETO: Endpoint para mostrar transações sem middleware
app.get('/test-transactions-direto', async (req, res) => {
  try {
    console.log('🔥 [TEST-DIRETO] Iniciando teste direto das transações');
    
    // Importar Prisma diretamente
    const prismaConfig = require('./config/prisma');
    const prisma = await prismaConfig.initialize();
    
    // UserID do Ivan
    const userId = '34290450-ce0d-46fc-a370-6ffa787ea6b9';
    
    console.log('🔥 [TEST-DIRETO] Buscando transações para userId:', userId);
    
    // Query direta
    const transactions = await global.prisma.transaction.findMany({
      where: { userId },
      include: {
        company: {
          select: { id: true, name: true, alias: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('🔥 [TEST-DIRETO] Encontradas', transactions.length, 'transações');
    
    if (transactions.length > 0) {
      console.log('🔥 [TEST-DIRETO] Primeira transação (tipos):', {
        blockNumber: typeof transactions[0].blockNumber,
        gasPrice: typeof transactions[0].gasPrice,
        gasUsed: typeof transactions[0].gasUsed
      });
    }
    
    // Converter BigInt manualmente campo por campo
    const safeTransactions = transactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      companyId: tx.companyId,
      company: tx.company,
      network: tx.network,
      transactionType: tx.transactionType,
      status: tx.status,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber ? String(tx.blockNumber) : null,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      gasPrice: tx.gasPrice ? String(tx.gasPrice) : null,
      gasUsed: tx.gasUsed ? String(tx.gasUsed) : null,
      gasLimit: tx.gasLimit ? String(tx.gasLimit) : null,
      actualGasCost: tx.actualGasCost ? String(tx.actualGasCost) : null,
      estimatedGas: tx.estimatedGas ? String(tx.estimatedGas) : null,
      functionName: tx.functionName,
      functionParams: tx.functionParams,
      metadata: tx.metadata,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    }));
    
    console.log('🔥 [TEST-DIRETO] Transações convertidas com sucesso');
    
    // Resposta manual sem usar res.json()
    res.setHeader('Content-Type', 'application/json');
    const response = {
      success: true,
      message: 'Transações encontradas com sucesso!',
      data: {
        count: transactions.length,
        userId,
        transactions: safeTransactions
      }
    };
    
    const responseString = JSON.stringify(response);
    console.log('🔥 [TEST-DIRETO] JSON serializado com sucesso, enviando resposta');
    
    res.status(200).send(responseString);
    
  } catch (error) {
    console.error('🔥 [TEST-DIRETO] ERRO:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no teste direto',
      error: error.message,
      stack: error.stack
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Azore Blockchain API Service',
    version: '1.0.0',
    description: 'Microserviço para abstrair a complexidade da blockchain Azore',
    endpoints: {
      health: '/health',
      test: '/api/test',
      docs: '/api-docs',
      swagger: '/api-docs',
      testTransactionsDireto: '/test-transactions-direto'
    }
  });
});

// Rota de teste do MailerSend
app.get('/api/test-mailersend', async (req, res) => {
  try {
    console.log('🧪 Testando configuração do MailerSend...');
    
    const config = {
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
      MAILERSEND_FROM_EMAIL: process.env.MAILERSEND_FROM_EMAIL,
      MAILERSEND_FROM_NAME: process.env.MAILERSEND_FROM_NAME,
      hasApiToken: !!process.env.MAILERSEND_API_TOKEN,
      apiTokenPreview: process.env.MAILERSEND_API_TOKEN ? 
        `${process.env.MAILERSEND_API_TOKEN.substring(0, 15)}...` : null,
      DEFAULT_NETWORK: process.env.DEFAULT_NETWORK,
      NODE_ENV: process.env.NODE_ENV
    };

    console.log('📧 Configuração MailerSend:', config);

    // Importar e testar EmailService
    const EmailService = require('./services/email.service');
    const emailService = new EmailService();
    
    console.log('🔍 Provider ativo:', emailService.activeProvider);
    console.log('🔍 Provider instances:', Object.keys(emailService.providerInstances || {}));
    
    const providerEnabled = emailService.providerInstances?.mailersend?.isEnabled();
    console.log('🔍 MailerSend enabled:', providerEnabled);

    res.json({
      success: true,
      message: 'Configuração MailerSend verificada',
      config,
      provider: {
        active: emailService.activeProvider,
        enabled: providerEnabled,
        instances: Object.keys(emailService.providerInstances || {})
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao testar MailerSend:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar configuração MailerSend',
      error: error.message,
      stack: error.stack
    });
  }
});

// Rota de teste de envio real do MailerSend
app.post('/api/send-test-email', async (req, res) => {
  try {
    const { to = 'test@example.com' } = req.body;
    
    console.log('📧 Enviando email de teste para:', to);
    
    const EmailService = require('./services/email.service');
    const emailService = new EmailService();
    
    const result = await emailService.sendEmail({
      to: {
        email: to,
        name: 'Test User'
      },
      subject: 'Teste MailerSend - Clube Digital System',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">🏦 Clube Digital - Teste de Email</h1>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>✅ <strong>MailerSend está funcionando!</strong></p>
            <p>Este email foi enviado via MailerSend API em ambiente de desenvolvimento/testnet.</p>
            <p><strong>Configuração:</strong></p>
            <ul>
              <li>Provider: ${emailService.activeProvider}</li>
              <li>Network: ${process.env.DEFAULT_NETWORK}</li>
              <li>Environment: ${process.env.NODE_ENV}</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Data: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `,
      textContent: `Clube Digital - Teste de Email\n\n✅ MailerSend está funcionando!\n\nEste email foi enviado via MailerSend API em ambiente de desenvolvimento/testnet.\n\nProvider: ${emailService.activeProvider}\nNetwork: ${process.env.DEFAULT_NETWORK}\nEnvironment: ${process.env.NODE_ENV}\n\nData: ${new Date().toLocaleString('pt-BR')}`
    });

    console.log('📧 Resultado do envio:', result);

    res.json({
      success: true,
      message: 'Email de teste enviado',
      result,
      provider: emailService.activeProvider,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar email de teste',
      error: error.message,
      stack: error.stack
    });
  }
});

// Configuração do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Azore Blockchain API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true
  }
}));

// Removida inicialização assíncrona dos serviços do app.js

// Rotas públicas (sem autenticação) - comunicação direta com blockchain
app.use('/api/test', testRoutes);
app.use('/api/debug', testPrismaRoutes);
app.use('/api/debug', debugLoginRoutes);

// Rotas de teste de email
app.use('/api/test/email', testEmailRoutes);
app.use('/api/test-simple', testSimpleRoutes);
// Rotas de teste do Asaas
app.use('/api/asaas', asaasTestRoutes);
// app.use('/api/debug', debugUserRoutes); // Temporariamente desabilitado

// Removed deprecated mint dev route - using unified transaction architecture

// ========================================
// DEPOSIT APIs - Estrutura organizada
// ========================================

// 1. POST /api/deposit - Criar depósito com integração Asaas PIX
app.post('/api/deposit', async (req, res) => {
  try {
    console.log('💰 [DEPOSIT] Criando novo depósito com Asaas PIX');
    const { userId, amount, currency = 'cBRL', paymentMethod = 'pix' } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'userId e amount são obrigatórios'
      });
    }

    // Usar o DepositService que tem integração com Asaas
    const depositService = require('./services/deposit.service');
    
    // Iniciar depósito usando o serviço integrado
    const result = await depositService.initiateDeposit(parseFloat(amount), userId);
    
    console.log(`✅ [DEPOSIT] Depósito criado: ${result.transactionId}`);
    
    res.json({
      success: true,
      message: 'Depósito criado com sucesso',
      data: {
        transactionId: result.transactionId,
        amount: result.amount, // Valor líquido
        totalAmount: result.totalAmount, // Valor total do PIX
        fee: result.fee, // Taxa
        status: result.status,
        pixPaymentId: result.pixPaymentId,
        pixData: result.pixData
      }
    });
    
  } catch (error) {
    console.error('❌ [DEPOSIT] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar depósito',
      error: error.message
    });
  }
});

// 2. POST /api/deposit/pix - Confirmar PIX
app.post('/api/deposit/pix', async (req, res) => {
  try {
    // console.log('🔵 [PIX] Confirmando pagamento PIX');
    const { transactionId, pixPaymentId, paidAmount } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'transactionId é obrigatório'
      });
    }
    
    const prismaConfig = require('./config/prisma');
    const prisma = prismaConfig.getPrisma();
    
    // Confirmar PIX (mas manter status pending até blockchain confirmar)
    const depositTransaction = await global.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'pending', // MANTER PENDING até blockchain confirmar
        pix_status: 'confirmed', // Confirmar apenas PIX
        pix_confirmed_at: new Date(),
        metadata: {
          ...((await global.prisma.transaction.findUnique({ where: { id: transactionId } }))?.metadata || {}),
          pix_confirmed: true,
          pix_confirmation_date: new Date().toISOString(),
          pix_payment_id: pixPaymentId || `pix-${Date.now()}`,
          pix_payer_document: '000.000.000-00',
          pix_payer_name: 'Usuario Teste',
          pix_paid_amount: paidAmount || 0
        }
      }
    });
    
    // console.log(`✅ [PIX] PIX confirmado: ${transactionId}`);
    
    // AUTO-DISPARAR MINT APÓS CONFIRMAÇÃO PIX
    // console.log('🚀 [AUTO-MINT] Disparando mint automaticamente após confirmação PIX...');
    
    try {
      // Buscar dados da transação confirmada
      const confirmedTransaction = await global.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { user: { select: { publicKey: true, email: true } } }
      });
      
      if (!confirmedTransaction || !confirmedTransaction.user?.publicKey) {
        console.error('❌ [AUTO-MINT] Usuário não encontrado ou sem endereço de carteira');
        // Não falha a confirmação PIX por isso
      } else {
        // Executar mint automaticamente
        const MintTransactionService = require('./services/mintTransaction.service');
        const mintService = new MintTransactionService();
        
        console.log(`🏭 [AUTO-MINT] Criando mint REAL para ${confirmedTransaction.amount} cBRL`);
        const mintTransaction = await mintService.createMintTransaction(
          transactionId,
          confirmedTransaction.userId,
          confirmedTransaction.amount.toString(),
          confirmedTransaction.user.publicKey
        );
        
        console.log(`✅ [AUTO-MINT] Mint REAL criado automaticamente: ${mintTransaction.id}`);
      }
    } catch (mintError) {
      console.error('❌ [AUTO-MINT] Erro ao executar mint automático:', mintError);
      // Não falha a confirmação PIX por causa do erro no mint
    }
    
    res.json({
      success: true,
      message: 'PIX confirmado com sucesso',
      data: {
        transactionId: transactionId,
        status: 'confirmed',
        pixConfirmed: true,
        readyForMint: true,
        autoMintTriggered: true
      }
    });
    
  } catch (error) {
    console.error('❌ [PIX] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar PIX',
      error: error.message
    });
  }
});

// 3. POST /api/deposit/mint - Executar mint na blockchain
app.post('/api/deposit/mint', async (req, res) => {
  try {
    console.log('⛓️ [MINT] Executando mint na blockchain');
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'transactionId é obrigatório'
      });
    }
    
    const prismaConfig = require('./config/prisma');
    const MintTransactionService = require('./services/mintTransaction.service');
    const prisma = prismaConfig.getPrisma();
    const mintService = new MintTransactionService();
    
    // Buscar depósito confirmado
    const depositTransaction = await global.prisma.transaction.findUnique({
      where: { id: transactionId }
    });
    
    if (!depositTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Depósito não encontrado'
      });
    }
    
    if (depositTransaction.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Depósito deve estar confirmado antes do mint'
      });
    }
    
    // Buscar endereço real do usuário
    const user = await global.prisma.user.findUnique({
      where: { id: depositTransaction.userId },
      select: { publicKey: true, email: true }
    });
    
    if (!user || !user.publicKey) {
      throw new Error('Usuário não encontrado ou sem endereço de carteira');
    }
    
    console.log(`🔑 [MINT] Endereço do usuário: ${user.publicKey} (${user.email})`);
    
    // Criar transação de mint REAL
    console.log(`🏭 [MINT] Criando mint REAL para ${depositTransaction.amount} cBRL`);
    const mintTransaction = await mintService.createMintTransaction(
      transactionId,
      depositTransaction.userId,
      depositTransaction.amount.toString(),
      user.publicKey
    );
    
    console.log(`✅ [MINT] Mint REAL criado: ${mintTransaction.id}`);
    
    res.json({
      success: true,
      message: 'Mint executado na blockchain',
      data: {
        mintTransactionId: mintTransaction.id,
        depositTransactionId: transactionId,
        amount: depositTransaction.amount,
        recipientAddress: user.publicKey,
        status: 'pending',
        network: process.env.DEFAULT_NETWORK || 'testnet'
      }
    });
    
  } catch (error) {
    console.error('❌ [MINT] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar mint',
      error: error.message
    });
  }
});

// Rota pública para buscar empresa por ID (deve vir ANTES da rota com autenticação)
// Validar que o ID é um UUID válido
app.get('/api/companies/:id', apiRateLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar se é um UUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      // Se não for UUID, passar para próxima rota
      return next();
    }

    const prisma = prismaConfig.getPrisma();

    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        alias: true,
        isActive: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar empresa'
    });
  }
});

// Rotas de empresas (com autenticação JWT e rate limiting)
// REMOVIDO - arquivos de rotas não existem mais
// app.use('/api/companies', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, companyRoutes);

// Rotas de contratos de stake (com autenticação JWT)
// REMOVIDO - arquivos de rotas não existem mais
// app.use('/api/stake-contracts', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, stakeContractRoutes);
// app.use('/api/stake-statements', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, stakeStatementsRoutes);
// app.use('/api/issuers', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, issuersRoutes);
// app.use('/api/portfolio', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, portfolioRoutes);

// Rotas públicas específicas para busca de contratos (devem vir ANTES da rota geral)
// REMOVIDO - arquivos de rotas não existem mais
// app.use('/api/contracts/tokens', contractsInteractRoutes);
// app.use('/api/contracts/exchanges', contractsInteractRoutes);
// app.use('/api/contracts/stakes', contractsInteractRoutes);

// Outras rotas de contratos mantêm autenticação JWT (rota geral)
// REMOVIDO - arquivos de rotas não existem mais
// app.use('/api/contracts', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, contractsInteractRoutes);

// Rotas de autenticação (públicas com clube resolution)
app.use('/api/auth', resolveClubMiddleware, loginRateLimiter, authRoutes);

// Rotas de autenticação para club admins (públicas - sem clube resolution)
const clubAuthRoutes = require('./routes/clubAuth.routes');
app.use('/api/club-auth', loginRateLimiter, clubAuthRoutes);

// Rotas de autenticação para super admins (públicas - sem clube resolution)
const superAdminAuthRoutes = require('./routes/superAdminAuth.routes');
app.use('/api/super-admin-auth', loginRateLimiter, superAdminAuthRoutes);

// Rotas de gerenciamento de clubes (super admin apenas)
const clubsRoutes = require('./routes/clubs.routes');
app.use('/api/super-admin/clubs', clubsRoutes);

// Rotas de gerenciamento de administradores de clubes (super admin apenas)
const clubAdminsRoutes = require('./routes/clubAdmins.routes');
app.use('/api/super-admin/club-admins', clubAdminsRoutes);

// Rotas de notificações (super admin apenas)
const notificationsRoutes = require('./routes/notifications.routes');
app.use('/api/super-admin/notifications', notificationsRoutes);

// Rotas de WhatsApp (super admin apenas)
const whatsappRoutes = require('./routes/whatsapp.routes');
app.use('/api/super-admin/whatsapp', whatsappRoutes);

// Rotas de usuários dos clubes (super admin apenas)
const clubUsersRoutes = require('./routes/clubUsers.routes');
app.use('/api/super-admin/club-users', clubUsersRoutes);

// Rotas de grupos dos clubes (super admin apenas)
const clubGroupsRoutes = require('./routes/clubGroups.routes');
app.use('/api/super-admin/club-groups', clubGroupsRoutes);

// Rotas de billing (super admin apenas)
const billingRoutes = require('./routes/billing.routes');
app.use('/api/super-admin/billing', billingRoutes);

// Rotas de transações dos clubes (super admin apenas)
const clubTransactionsRoutes = require('./routes/clubTransactions.routes');
app.use('/api/super-admin/club-transactions', clubTransactionsRoutes);

// ============================================================================
// CLUB ADMIN ROUTES (com resolução de clube e autenticação de club admin)
// ============================================================================

// Rotas de autenticação de club admin (PRECISA do middleware de resolução!)
const clubAdminAuthRoutes = require('./routes/clubAdminAuth.routes');
app.use('/api/club-admin/auth', resolveClubMiddleware, clubAdminAuthRoutes);

// Rotas de informações do clube (com clube resolution)
const clubAdminInfoRoutes = require('./routes/clubAdminInfo.routes');
app.use('/api/club-admin', resolveClubMiddleware, clubAdminInfoRoutes);

// Rotas de usuários do clube
const clubAdminUsersRoutes = require('./routes/clubAdminUsers.routes');
app.use('/api/club-admin/users', resolveClubMiddleware, clubAdminUsersRoutes);

// Rotas de transações do clube
const clubAdminTransactionsRoutes = require('./routes/clubAdminTransactions.routes');
app.use('/api/club-admin/transactions', resolveClubMiddleware, clubAdminTransactionsRoutes);

// Rotas de cashback do clube
const clubAdminCashbackRoutes = require('./routes/clubAdminCashback.routes');
app.use('/api/club-admin/cashback', resolveClubMiddleware, clubAdminCashbackRoutes);

// Rotas de WhatsApp do clube
const clubAdminWhatsappRoutes = require('./routes/clubAdminWhatsapp.routes');
app.use('/api/club-admin/whatsapp', resolveClubMiddleware, clubAdminWhatsappRoutes);

// Rotas de notificações push do clube
const clubAdminPushNotificationsRoutes = require('./routes/clubAdminPushNotifications.routes');
app.use('/api/club-admin/push-notifications', resolveClubMiddleware, clubAdminPushNotificationsRoutes);

// Rotas de branding do clube
const clubAdminBrandingRoutes = require('./routes/clubAdminBranding.routes');
app.use('/api/club-admin/branding', resolveClubMiddleware, clubAdminBrandingRoutes);

// Rotas de módulos do clube
const clubAdminModulesRoutes = require('./routes/clubAdminModules.routes');
app.use('/api/club-admin/modules', resolveClubMiddleware, clubAdminModulesRoutes);

// Rotas de grupos do clube
const clubAdminGroupsRoutes = require('./routes/clubAdminGroups.routes');
app.use('/api/club-admin/groups', resolveClubMiddleware, clubAdminGroupsRoutes);

// Rotas de recuperação de senha (públicas)
app.use('/api/password-reset', loginRateLimiter, passwordResetRoutes);

// Rotas de confirmação de email (públicas)
const emailConfirmationRoutes = require('./routes/emailConfirmation.routes');
app.use('/api/email-confirmation', loginRateLimiter, emailConfirmationRoutes);

// Rotas de usuários (com clube resolution, autenticação JWT e refresh de cache)
app.use('/api/users', resolveClubMiddleware, authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, CacheRefreshMiddleware.refreshAfterWrite, userRoutes);

// Rotas multi-clube de produtos, compras e cashback
app.use('/api/products', resolveClubMiddleware, authenticateJWT, apiRateLimiter, productRoutes);
app.use('/api/purchases', resolveClubMiddleware, authenticateJWT, apiRateLimiter, purchaseRoutes);
app.use('/api/cashback', resolveClubMiddleware, authenticateJWT, apiRateLimiter, cashbackRoutes);

// Rotas de saldo e saques
app.use('/api/balance', resolveClubMiddleware, authenticateJWT, apiRateLimiter, balanceRoutes);
app.use('/api/withdrawals', resolveClubMiddleware, authenticateJWT, apiRateLimiter, withdrawalRoutes);

// Rotas de validação PIX
app.use('/api/pix/validation', resolveClubMiddleware, authenticateJWT, apiRateLimiter, pixValidationRoutes);

// Rotas de contratos (com autenticação e sistema de fila) - COMENTADO PARA DEBUG
// app.use('/api/contracts', authenticateApiKey, transactionRateLimiter, addUserInfo, logAuthenticatedRequest, QueueMiddleware.enqueueExternalOperations, CacheRefreshMiddleware.refreshAfterQueueOperation, contractRoutes);

// Endpoint de teste para verificar JWT
app.get('/api/admin/test-jwt', authenticateJWT, (req, res) => {
  console.log('🧪 Teste JWT - Usuário:', req.user.id, req.user.name);
  res.json({ success: true, message: 'JWT funcionando', user: req.user.name });
});

// Rotas administrativas de tokens (com autenticação JWT para frontend) - DEVE VIR ANTES DA ROTA GENÉRICA
// REMOVIDO - arquivos de rotas não existem mais
// app.use('/api/admin/tokens', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, tokenRoutes);

// Middleware híbrido para aceitar JWT ou API Key
const authenticateHybrid = (req, res, next) => {
  // Verificar se há JWT token no header
  const authHeader = req.headers.authorization;
  console.log('🔍 [HYBRID] AuthHeader:', authHeader ? 'presente' : 'ausente');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('🔍 [HYBRID] Token parts:', token.split('.').length);
    // Se parece com JWT (3 partes separadas por pontos), usar JWT middleware
    if (token.split('.').length === 3) {
      console.log('🔄 Usando autenticação JWT para tokens');
      return authenticateJWT(req, res, next);
    }
  }

  // Caso contrário, usar API Key middleware
  console.log('🔄 Usando autenticação API Key para tokens');
  return authenticateApiKey(req, res, next);
};

// Rotas de tokens (com autenticação híbrida e sistema de fila)
// REMOVIDO - arquivos de rotas não existem mais
// Rota pública para listar tokens (para admin/settings)
// app.use('/api/tokens/public', tokenRoutes);

// Rota pública para preços de tokens (sem autenticação)
// app.use('/api/tokens', tokenPriceRoutes);

// Rota protegida para operações com tokens
// app.use('/api/tokens', authenticateHybrid, transactionRateLimiter, addUserInfo, logAuthenticatedRequest, QueueMiddleware.enqueueExternalOperations, CacheRefreshMiddleware.refreshAfterQueueOperation, tokenRoutes);

// Rotas de stakes (com autenticação e sistema de fila)
// REMOVIDO - arquivos de rotas não existem mais
// app.use('/api/stakes', authenticateJWT, transactionRateLimiter, addUserInfo, logAuthenticatedRequest, QueueMiddleware.enqueueExternalOperations, CacheRefreshMiddleware.refreshAfterQueueOperation, stakeRoutes);

// TESTE TEMPORÁRIO: Endpoint de debug direto no app
app.get('/api/transactions-debug', async (req, res) => {
  try {
    console.log('🔴 [APP-DEBUG] Endpoint de debug chamado diretamente no app!');
    
    // Simular userId do usuário Ivan
    const userId = 'c5cb9ad1-c89c-4b86-a483-5dfec6e3bd51';
    
    // Importar serviço diretamente
    const transactionService = require('./services/transaction.service');
    
    const result = await transactionService.getTransactionsByUser(userId, {
      page: 1,
      limit: 20
    });

    res.status(200).json({
      success: true,
      message: 'Debug app-level executado com sucesso',
      data: {
        userId,
        transactions: result.rows,
        count: result.count,
        pagination: {
          total: result.count,
          page: 1,
          limit: 20,
          totalPages: Math.ceil(result.count / 20)
        }
      }
    });
  } catch (error) {
    console.error('❌ [APP-DEBUG] Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no debug app-level',
      error: error.message,
      stack: error.stack
    });
  }
});

// Rotas de transações (com autenticação JWT)
app.use('/api/transactions', transactionRoutes);

// Rotas de depósitos (com autenticação JWT e email confirmado)
const depositRoutes = require('./routes/deposit.routes');
// const mintRoutes = require('./routes/mint.routes'); // REMOVIDO - arquivo não existe mais
const pixRoutes = require('./routes/pix.routes');
const { requireEmailConfirmation } = require('./middleware/emailConfirmed.middleware');
// IMPORTANTE: Rotas de desenvolvimento SEM autenticação devem vir ANTES (COM clube resolution)
app.use('/api/pix/dev', resolveClubMiddleware, pixRoutes);
app.use('/api/deposits/dev', resolveClubMiddleware, depositRoutes);
// app.use('/api/mint/dev', mintRoutes); // REMOVIDO - arquivo não existe mais

// Rota de debug direta (sem autenticação)
app.get('/api/debug/pix/:transactionId', async (req, res) => {
  const { PrismaClient } = require('./generated/prisma');
  const prisma = new PrismaClient();
  
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.transactionId },
      select: {
        id: true,
        amount: true,
        fee: true,
        pix_transaction_id: true,
        metadata: true,
        status: true,
        createdAt: true
      }
    });
    
    if (!transaction) {
      return res.json({ success: false, message: 'Transação não encontrada' });
    }
    
    const debugInfo = {
      transactionId: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      fee: transaction.fee,
      totalAmount: parseFloat(transaction.amount || 0) + parseFloat(transaction.fee || 0),
      pixId: transaction.pix_transaction_id,
      metadata: {
        exists: !!transaction.metadata,
        keys: transaction.metadata ? Object.keys(transaction.metadata) : [],
        hasPixCode: !!transaction.metadata?.pixCode,
        hasQrCodeImage: !!transaction.metadata?.qrCodeImage,
        pixCodeSample: transaction.metadata?.pixCode ? transaction.metadata.pixCode.substring(0, 50) + '...' : 'NONE',
        qrCodeSample: transaction.metadata?.qrCodeImage ? transaction.metadata.qrCodeImage.substring(0, 50) + '...' : 'NONE'
      }
    };
    
    res.json({ success: true, data: debugInfo });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  } finally {
    await prisma.$disconnect();
  }
});

// Rotas com clube resolution e autenticação JWT
app.use('/api/deposits', resolveClubMiddleware, authenticateJWT, depositRoutes);
// app.use('/api/mint', authenticateJWT, mintRoutes); // REMOVIDO - arquivo não existe mais
app.use('/api/pix', resolveClubMiddleware, authenticateJWT, pixRoutes);

// Exchange Matching System API
// REMOVIDO - arquivo não existe mais
// app.use('/api/exchange-matching', exchangeMatchingRoutes);

// Rotas de saques (com autenticação JWT - email confirmado temporariamente desabilitado)
// REMOVIDO - arquivos não existem mais
// const withdrawRoutes = require('./routes/withdraw.routes');
// const adminWithdrawalsRoutes = require('./routes/adminWithdrawals.routes');
// app.use('/api/withdrawals', authenticateJWT, withdrawRoutes);
// app.use('/api/admin/withdrawals', adminWithdrawalsRoutes);

// Rotas de transferências (com autenticação JWT)
// REMOVIDO - arquivo não existe mais
// const transferRoutes = require('./routes/transfer.routes');
// app.use('/api/transfers', authenticateJWT, transferRoutes);

// Rotas de logs (com autenticação JWT)
app.use('/api/logs', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, logRoutes);

// Rotas de documentos (com autenticação JWT)
app.use('/api/documents', resolveClubMiddleware, authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, documentRoutes);

// Rotas de webhooks (com autenticação JWT)
// app.use('/api/webhooks', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, webhookRoutes); // Temporariamente desabilitado

// Rotas de fila (com autenticação admin)
app.use('/api/queue', queueRoutes);

// Rotas específicas de empresas (devem vir antes das rotas gerais de admin)
// REMOVIDO - arquivo não existe mais
// app.use('/api/admin/companies', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, companiesRoutes);

// Rota de estatísticas admin (com JWT e verificação de SUPER_ADMIN)
app.get('/api/admin/stats', authenticateJWT, requireSuperAdmin, async (req, res) => {
  try {
    console.log('📊 [Admin Stats] Requisição recebida');
    console.log('📊 [Admin Stats] User:', req.user?.name);
    console.log('📊 [Admin Stats] User Roles:', req.user?.userCompanies?.map(uc => uc.role));

    const prismaConfig = require('./config/prisma');
    const prisma = prismaConfig.getPrisma();

    // Buscar estatísticas em paralelo para melhor performance
    const [
      totalUsers,
      activeUsers,
      totalCompanies,
      activeCompanies,
      pendingWithdrawals,
      totalWithdrawals,
      totalTransactions,
      confirmedTransactions,
      pendingTransactions,
      failedTransactions,
      transactionsLast7Days,
      transactionsLast30Days,
      withdrawalsLast7Days,
      usersLast7Days,
      companiesLast7Days
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.withdrawal.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.withdrawal.count(),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'confirmed' } }),
      prisma.transaction.count({ where: { status: 'pending' } }),
      prisma.transaction.count({ where: { status: 'failed' } }),
      prisma.transaction.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true, status: true }
      }),
      prisma.transaction.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.withdrawal.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.company.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
    ]);

    const transactionsByDay = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      last7Days.push(dateKey);
      transactionsByDay[dateKey] = 0;
    }

    transactionsLast7Days.forEach(tx => {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      if (transactionsByDay[dateKey] !== undefined) {
        transactionsByDay[dateKey]++;
      }
    });

    const chartData = last7Days.map(date => ({ date, count: transactionsByDay[date] || 0 }));
    const successRate = totalTransactions > 0 ? ((confirmedTransactions / totalTransactions) * 100).toFixed(2) : 0;
    const withdrawalSuccessRate = totalWithdrawals > 0 ? (((totalWithdrawals - pendingWithdrawals) / totalWithdrawals) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          newLast7Days: usersLast7Days,
          activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
        },
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          inactive: totalCompanies - activeCompanies,
          newLast7Days: companiesLast7Days,
          activePercentage: totalCompanies > 0 ? ((activeCompanies / totalCompanies) * 100).toFixed(2) : 0
        },
        withdrawals: {
          total: totalWithdrawals,
          pending: pendingWithdrawals,
          completed: totalWithdrawals - pendingWithdrawals,
          last7Days: withdrawalsLast7Days,
          successRate: withdrawalSuccessRate
        },
        transactions: {
          total: totalTransactions,
          confirmed: confirmedTransactions,
          pending: pendingTransactions,
          failed: failedTransactions,
          last30Days: transactionsLast30Days,
          successRate: successRate,
          chartData: chartData
        },
        performance: {
          transactionSuccessRate: parseFloat(successRate),
          withdrawalSuccessRate: parseFloat(withdrawalSuccessRate),
          avgTransactionsPerDay: transactionsLast7Days.length > 0 ? (transactionsLast7Days.length / 7).toFixed(2) : 0
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas administrativas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

// Rotas admin (com autenticação admin)
// Nota: rotas mais específicas devem vir ANTES das rotas gerais
// Financial report usa JWT (para acesso via dashboard web)
// REMOVIDO - arquivo não existe mais
// app.use('/api/admin/financial-report', authenticateJWT, financialReportRoutes);
// Usar authenticateToken (JWT) para permitir acesso via frontend com Bearer token
app.use('/api/admin', authenticateToken, requireApiAdmin, apiRateLimiter, addAdminUserInfo, logAdminRequest, adminRoutes);

// Rota para estatísticas de rate limiting (admin)
app.get('/api/admin/rate-limit-stats', authenticateApiKey, requireApiAdmin, (req, res) => {
  try {
    const stats = getRateLimitStats();
    res.json({
      success: true,
      message: 'Estatísticas de rate limiting obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas de rate limiting',
      error: error.message
    });
  }
});

// Rotas para sistema de alertas (admin)
const alertingService = require('./services/alerting.service');

app.get('/api/admin/alert-stats', authenticateApiKey, requireApiAdmin, (req, res) => {
  try {
    const stats = alertingService.getAlertStats();
    res.json({
      success: true,
      message: 'Estatísticas de alertas obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas de alertas',
      error: error.message
    });
  }
});

app.post('/api/admin/alert-thresholds', authenticateApiKey, requireApiAdmin, (req, res) => {
  try {
    const newThresholds = req.body;
    alertingService.updateThresholds(newThresholds);
    res.json({
      success: true,
      message: 'Thresholds de alertas atualizados com sucesso',
      data: alertingService.getAlertStats().thresholds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar thresholds de alertas',
      error: error.message
    });
  }
});

app.post('/api/admin/reset-alert-counters', authenticateApiKey, requireApiAdmin, (req, res) => {
  try {
    alertingService.forceResetCounters();
    res.json({
      success: true,
      message: 'Contadores de alertas resetados com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao resetar contadores de alertas',
      error: error.message
    });
  }
});

// Rotas whitelabel (públicas e autenticadas)
app.use('/api/whitelabel', whitelabelRoutes);

// Rotas 2FA (com autenticação JWT)
app.use('/api/2fa', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, twoFactorRoutes);

// Rotas de cache (com autenticação JWT)
app.use('/api/cache', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, cacheRoutes);

// Rotas de notificações (com autenticação JWT)
app.use('/api/notifications', resolveClubMiddleware, notificationRoutes);

// Rotas de sincronização de balances (com autenticação JWT)
// REMOVIDO - arquivo não existe mais
// const balanceSyncRoutes = require('./routes/balanceSync.routes');
// app.use('/api/balance-sync', balanceSyncRoutes);

// Rotas de atualização automática de saldos (com autenticação JWT)

// Rotas de monitoramento de saldos de tokens
// REMOVIDO - arquivos não existem mais
// app.use('/api/token-amounts', tokenAmountRoutes);
// app.use('/api/earnings', earningsRoutes);
app.use('/api/tax-reports', taxReportsRoutes);

// Rotas de planos de usuário (públicas para consulta, autenticadas para admin)
app.use('/api/user-plans', userPlanRoutes);

// Teste direto da rota de config
app.get('/api/config/test-direct', (req, res) => {
  res.json({
    success: true,
    message: 'Direct test working',
    timestamp: new Date().toISOString()
  });
});

// Configurações públicas (sem autenticação e sem rate limiting)
app.use('/api/config', configRoutes);

// Smart Contract Routes (Public)
// REMOVIDO - arquivo não existe mais
// app.use('/api/smart-contracts', smartContractRoutes);

// User Documents Routes (com autenticação JWT)
app.use('/api/user-documents', resolveClubMiddleware, authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, userDocumentRoutes);

// User Actions Routes
app.use('/api/user-actions', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, userActionsRoutes);

// Contract Types Routes
// REMOVIDO - arquivo não existe mais
// app.use('/api/contract-types', authenticateJWT, apiRateLimiter, addUserInfo, logAuthenticatedRequest, contractTypeRoutes);

// Workers Routes (Admin only)
app.use('/api/workers', workersRoutes);

// PIX Routes (cBRL deposits/withdrawals) - TEMPORARIAMENTE DESABILITADO
// app.use('/api/pix', pixRoutes);

// Rotas do Profile
app.use('/api/profile', resolveClubMiddleware, profileRoutes);
app.use('/api/s3-photos', authenticateJWT, s3PhotoRoutes);
// REMOVIDO - arquivo não existe mais
// app.use('/api/company-branding', authenticateJWT, companyBrandingRoutes);

// Backup routes (public - no authentication required)
app.use('/api/backup', backupRoutes);

// PIX Keys routes (com autenticação JWT)
// REMOVIDO - arquivo não existe mais
// const pixKeysRoutes = require('./routes/pixKeys.routes');
// app.use('/api/pix-keys', pixKeysRoutes);

// Switch company routes (com autenticação JWT)
// REMOVIDO - arquivo não existe mais
// const switchCompanyRoutes = require('./routes/switch-company.routes');
// app.use('/api/switch-company', authenticateJWT, switchCompanyRoutes);

// Banks routes (públicas)
const banksRoutes = require('./routes/banks.routes');
app.use('/api/banks', banksRoutes);

// Rotas de webhook Asaas (sem autenticação)
const asaasRoutes = require('./routes/asaas.routes');
const efiRoutes = require('./routes/efi.routes');
app.use('/api', asaasRoutes);

// Rotas de webhook EFI (sem autenticação para o webhook de recebimento)
app.use('/api/webhooks/efi', efiRoutes);

// Rotas de debug PIX (temporário)
const debugPixRoutes = require('./routes/debug-pix.routes');
// REMOVIDO - arquivo não existe mais
// const exchangeRoutes = require('./routes/exchangeRoutes');
app.use('/api/debug', debugPixRoutes);

// Rotas de exchange (públicas para consulta, autenticadas para trading)
// REMOVIDO - arquivo não existe mais
// app.use('/api/exchange', exchangeRoutes);

// Rotas de reconciliação (admin only)
// REMOVIDO - arquivo não existe mais
// const reconciliationRoutes = require('./routes/reconciliation.routes');
// app.use('/api/reconciliation', reconciliationRoutes);

// Rotas de configuração de notificações
const { router: notificationConfigRoutes } = require('./routes/notificationConfig.routes');
app.use('/api/notification-config', authenticateJWT, notificationConfigRoutes);

// Rotas de mensagens WhatsApp
const { router: whatsappMessageRoutes } = require('./routes/whatsappMessage.routes');
app.use('/api/whatsapp-messages', authenticateJWT, whatsappMessageRoutes);

// Rotas de Analytics
const analyticsRoutes = require('./routes/analytics.routes');
app.use('/api/analytics', resolveClubMiddleware, analyticsRoutes);

// Rotas de Roles e Permissões
const roleRoutes = require('./routes/role.routes');
app.use('/api/roles', resolveClubMiddleware, authenticateJWT, roleRoutes);

// Rotas de Grupos
const groupRoutes = require('./routes/group.routes');
app.use('/api/groups', resolveClubMiddleware, authenticateJWT, groupRoutes);

// Rotas de taxas de usuários (com autenticação JWT)
const userTaxesRoutes = require('./routes/userTaxes.routes');
app.use('/api/user-taxes', authenticateJWT, userTaxesRoutes);

// Rotas de traduções/internacionalização (com autenticação JWT para admin)
// REMOVIDO - arquivo não existe mais
// const translationRoutes = require('./routes/translation.routes');
// app.use('/api/translations', authenticateJWT, translationRoutes);

// Rotas de CDI (Certificado de Depósito Interbancário)
// REMOVIDO - arquivo não existe mais
// const cdiRoutes = require('./routes/cdi.routes');
// app.use('/api/cdi', cdiRoutes);

// Middleware de tratamento de erros 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de tratamento de erros global (com logging e alertas)
app.use(databaseErrorTracking);
app.use(errorTracking);
// app.use(errorLogger);

module.exports = app; 
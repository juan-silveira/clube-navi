#!/usr/bin/env node
/**
 * Script de Sincronização de Variáveis de Ambiente
 *
 * Lê .env.shared da raiz e sincroniza para:
 * - apps/mobile/.env (com prefixo EXPO_PUBLIC_)
 * - apps/admin/frontend/.env.local (com prefixo NEXT_PUBLIC_)
 *
 * Uso: npm run sync:env
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Paths
const ROOT_DIR = path.join(__dirname, '..');
const SHARED_ENV_PATH = path.join(ROOT_DIR, '.env.shared');
const MOBILE_ENV_PATH = path.join(ROOT_DIR, 'apps/mobile/.env');
const ADMIN_ENV_PATH = path.join(ROOT_DIR, 'apps/admin/frontend/.env.local');

// Mapeamento de variáveis compartilhadas
const SHARED_VARS = {
  API_URL: true,
  DEFAULT_NETWORK: true,
  MAINNET_EXPLORER_URL: true,
  TESTNET_EXPLORER_URL: true,
};

/**
 * Parse arquivo .env em objeto
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};

  content.split('\n').forEach(line => {
    // Ignorar comentários e linhas vazias
    line = line.trim();
    if (!line || line.startsWith('#')) {
      return;
    }

    // Parse KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      vars[key] = value;
    }
  });

  return vars;
}

/**
 * Atualiza arquivo .env mantendo comentários e estrutura
 */
function updateEnvFile(filePath, newVars, prefix = '') {
  let content = '';
  let existingVars = {};

  // Ler arquivo existente se houver
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    const lines = existing.split('\n');

    // Extrair variáveis existentes (não-compartilhadas)
    lines.forEach(line => {
      const match = line.match(/^([^=#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        // Remove prefixo para comparação
        const baseKey = key.replace(new RegExp(`^${prefix}`), '');

        // Se não é uma variável compartilhada, manter
        if (!SHARED_VARS[baseKey]) {
          existingVars[key] = match[2].trim();
        }
      }
    });
  }

  // Montar novo arquivo
  content += '# ============================================\n';
  content += '# VARIÁVEIS COMPARTILHADAS (AUTO-GERADAS)\n';
  content += '# ============================================\n';
  content += '# Este arquivo é gerado automaticamente por: npm run sync:env\n';
  content += '# NÃO edite as variáveis compartilhadas diretamente aqui.\n';
  content += '# Edite .env.shared na raiz do projeto.\n';
  content += '#\n';
  content += `# Última sincronização: ${new Date().toISOString()}\n`;
  content += '# ============================================\n\n';

  // Adicionar variáveis compartilhadas
  Object.entries(newVars).forEach(([key, value]) => {
    const prefixedKey = prefix ? `${prefix}${key}` : key;
    content += `${prefixedKey}=${value}\n`;
  });

  // Adicionar seção de variáveis locais se houver
  if (Object.keys(existingVars).length > 0) {
    content += '\n# ============================================\n';
    content += '# VARIÁVEIS LOCAIS (Não sincronizadas)\n';
    content += '# ============================================\n';
    content += '# Você pode adicionar variáveis específicas abaixo.\n';
    content += '# Elas serão preservadas durante a sincronização.\n';
    content += '# ============================================\n\n';

    Object.entries(existingVars).forEach(([key, value]) => {
      content += `${key}=${value}\n`;
    });
  }

  // Escrever arquivo
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Main
 */
function main() {
  log('\n🔄 Sincronizando variáveis de ambiente...\n', 'blue');

  // Verificar se .env.shared existe
  if (!fs.existsSync(SHARED_ENV_PATH)) {
    log('❌ Arquivo .env.shared não encontrado na raiz do projeto!', 'red');
    log('   Crie o arquivo .env.shared com as variáveis compartilhadas.', 'yellow');
    process.exit(1);
  }

  // Parse variáveis compartilhadas
  const sharedVars = parseEnvFile(SHARED_ENV_PATH);
  const sharedKeys = Object.keys(sharedVars).filter(key => SHARED_VARS[key]);

  if (sharedKeys.length === 0) {
    log('⚠️  Nenhuma variável compartilhada encontrada em .env.shared', 'yellow');
    return;
  }

  log(`📋 Variáveis compartilhadas encontradas: ${sharedKeys.length}`, 'blue');
  sharedKeys.forEach(key => {
    log(`   • ${key}=${sharedVars[key]}`, 'reset');
  });
  log('');

  // Filtrar apenas variáveis compartilhadas
  const varsToSync = {};
  sharedKeys.forEach(key => {
    varsToSync[key] = sharedVars[key];
  });

  // Sincronizar para Mobile (EXPO_PUBLIC_)
  log('📱 Sincronizando para Mobile (apps/mobile/.env)...', 'blue');
  const mobileDir = path.dirname(MOBILE_ENV_PATH);
  if (!fs.existsSync(mobileDir)) {
    fs.mkdirSync(mobileDir, { recursive: true });
  }
  updateEnvFile(MOBILE_ENV_PATH, varsToSync, 'EXPO_PUBLIC_');
  log('   ✅ Mobile sincronizado!', 'green');

  // Sincronizar para Admin (NEXT_PUBLIC_)
  log('🖥️  Sincronizando para Admin (apps/admin/frontend/.env.local)...', 'blue');
  const adminDir = path.dirname(ADMIN_ENV_PATH);
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }
  updateEnvFile(ADMIN_ENV_PATH, varsToSync, 'NEXT_PUBLIC_');
  log('   ✅ Admin sincronizado!', 'green');

  log('\n✨ Sincronização concluída com sucesso!\n', 'green');
  log('💡 Lembre-se:', 'yellow');
  log('   • Backend usa .env da raiz diretamente', 'reset');
  log('   • Mobile e Admin foram atualizados automaticamente', 'reset');
  log('   • Execute este script sempre que alterar .env.shared\n', 'reset');
}

// Executar
try {
  main();
} catch (error) {
  log(`\n❌ Erro ao sincronizar: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
}

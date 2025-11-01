/**
 * Middleware para validação dinâmica de assets baseado na tabela smart_contracts
 */

const prismaConfig = require('../config/prisma');

class AssetValidationService {
  constructor() {
    this.prisma = null;
    this.cachedAssets = null;
    this.cacheTimestamp = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  }

  async init() {
    if (!this.prisma) {
      this.prisma = prismaConfig.getPrisma();
    }
  }

  /**
   * Obter assets válidos da tabela smart_contracts
   */
   async getValidAssets() {
    try {
      // Verificar cache primeiro
      const now = Date.now();
      if (this.cachedAssets && this.cacheTimestamp && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
        return this.cachedAssets;
      }

      // Tentar conectar ao Prisma
      if (!this.prisma) {
        await this.init();
      }

      // Buscar tokens ativos da tabela smart_contracts
      const contracts = await this.prisma.smartContract.findMany({
        where: {
          isActive: true,
          contractType: {
            OR: [
              { name: { contains: 'Token', mode: 'insensitive' } },
              { category: { contains: 'token', mode: 'insensitive' } }
            ]
          }
        },
        include: {
          contractType: true
        },
        select: {
          id: true,
          name: true,
          symbol: true,
          address: true,
          network: true,
          metadata: true,
          contractType: {
            select: {
              name: true,
              category: true
            }
          }
        }
      });

      console.log(`💰 [AssetValidation] Encontrados ${contracts.length} contratos de token`);

      const validAssets = [];

      for (const contract of contracts) {
        // Obter símbolo do contrato
        let symbol = contract.symbol;
        
        // Se não tiver símbolo direto, tentar obter do metadata
        if (!symbol && contract.metadata) {
          if (typeof contract.metadata === 'object') {
            symbol = contract.metadata.symbol || contract.metadata.ticker;
          }
        }

        if (symbol) {
          validAssets.push(symbol);
          console.log(`✅ [AssetValidation] Token adicionado: ${symbol}`);
        }
      }

      // Adicionar AZE baseado na network
      const network = process.env.DEFAULT_NETWORK || 'testnet';
      if (network === 'mainnet') {
        if (!validAssets.includes('AZE')) {
          validAssets.push('AZE');
          console.log('✅ [AssetValidation] AZE (mainnet) adicionado');
        }
      } else {
        if (!validAssets.includes('AZE-t')) {
          validAssets.push('AZE-t');
          console.log('✅ [AssetValidation] AZE-t (testnet) adicionado');
        }
      }

      // Atualizar cache
      this.cachedAssets = validAssets;
      this.cacheTimestamp = now;

      console.log(`🎯 [AssetValidation] Assets válidos: ${validAssets.join(', ')}`);
      return validAssets;

    } catch (error) {
      console.error('❌ [AssetValidation] Erro ao obter assets válidos:', error.message);
      
      // Fallback para assets conhecidos
      const network = process.env.DEFAULT_NETWORK || 'testnet';
      const fallbackAssets = ['cBRL', 'PCN', 'CNT'];
      
      if (network === 'mainnet') {
        fallbackAssets.push('AZE');
      } else {
        fallbackAssets.push('AZE-t');
      }
      
      console.log(`🔄 [AssetValidation] Usando fallback: ${fallbackAssets.join(', ')}`);
      
      // Atualizar cache com fallback
      this.cachedAssets = fallbackAssets;
      this.cacheTimestamp = Date.now();
      
      return fallbackAssets;
    }
  }

  /**
   * Middleware para validar asset dinamicamente
   */
  validateAsset(fieldName = 'asset') {
    return async (req, res, next) => {
      try {
        const validAssets = await this.getValidAssets();
        const assetValue = req.body[fieldName] || req.query[fieldName];

        if (assetValue && !validAssets.includes(assetValue)) {
          return res.status(400).json({
            success: false,
            message: `Ativo inválido. Ativos válidos: ${validAssets.join(', ')}`
          });
        }

        next();
      } catch (error) {
        console.error('Erro na validação de asset:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro interno na validação do ativo'
        });
      }
    };
  }

  /**
   * Middleware para validar asset opcional (query params)
   */
  validateOptionalAsset(fieldName = 'asset') {
    return async (req, res, next) => {
      try {
        const assetValue = req.query[fieldName];
        
        if (!assetValue) {
          return next(); // Campo opcional, continuar se não presente
        }

        const validAssets = await this.getValidAssets();

        if (!validAssets.includes(assetValue)) {
          return res.status(400).json({
            success: false,
            message: `Ativo inválido. Ativos válidos: ${validAssets.join(', ')}`
          });
        }

        next();
      } catch (error) {
        console.error('Erro na validação de asset opcional:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro interno na validação do ativo'
        });
      }
    };
  }

  /**
   * Limpar cache (útil para desenvolvimento)
   */
  clearCache() {
    this.cachedAssets = null;
    this.cacheTimestamp = null;
  }
}

const assetValidationService = new AssetValidationService();

module.exports = {
  assetValidationService,
  validateAsset: (fieldName) => assetValidationService.validateAsset(fieldName),
  validateOptionalAsset: (fieldName) => assetValidationService.validateOptionalAsset(fieldName)
};
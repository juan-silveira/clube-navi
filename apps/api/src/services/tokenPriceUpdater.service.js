/**
 * Serviço para atualizar automaticamente o tokenPrice no metadata dos tokens
 *
 * Prioridades:
 * 1. Novo trade → atualiza tokenPrice imediatamente
 * 2. Nova ordem de compra → atualiza se não houver trades recentes
 * 3. Nova ordem de venda → atualiza se não houver trades nem ordens de compra
 */

const TOKEN_CONTRACT_TYPE_ID = 'cc350023-d9ba-4746-85f3-1590175a2328';

class TokenPriceUpdaterService {
  /**
   * Extrai o símbolo do token do par, apenas se o par contiver cBRL
   * Ex: "CST/cBRL" -> "CST"
   * Ex: "PCN/CST" -> null (não contém cBRL, não atualiza preço)
   *
   * IMPORTANTE: Apenas pares com cBRL determinam tokenPrice
   * Quando há cBRL, ele é sempre tokenA no banco
   */
  getTokenSymbolFromPair(pair) {
    if (!pair) return null;

    const parts = pair.split('/');

    // Verifica se o par contém cBRL
    if (!parts.includes('cBRL')) {
      return null; // Pares sem cBRL não atualizam tokenPrice
    }

    // Retorna o símbolo que NÃO é cBRL
    return parts[0] !== 'cBRL' ? parts[0] : parts[1];
  }

  /**
   * Atualiza o tokenPrice de um token específico
   */
  async updateTokenPrice(symbol, newPrice, source) {
    try {
      if (!global.prisma) {
        console.error('❌ [TokenPriceUpdater] Prisma not initialized');
        return false;
      }

      // Buscar token pelo símbolo
      const token = await global.prisma.smartContract.findFirst({
        where: {
          contractTypeId: TOKEN_CONTRACT_TYPE_ID,
          metadata: {
            path: ['symbol'],
            equals: symbol
          }
        }
      });

      if (!token) {
        console.warn(`⚠️ [TokenPriceUpdater] Token ${symbol} not found`);
        return false;
      }

      const metadata = token.metadata || {};
      const oldPrice = metadata.tokenPrice || 1.00;

      // Atualizar metadata com novo preço
      await global.prisma.smartContract.update({
        where: { id: token.id },
        data: {
          metadata: {
            ...metadata,
            tokenPrice: parseFloat(newPrice),
            tokenPriceSource: source,
            tokenPriceUpdatedAt: new Date().toISOString()
          }
        }
      });

      console.log(`💰 [TokenPriceUpdater] ${symbol}: ${oldPrice} → ${newPrice} (source: ${source})`);
      return true;

    } catch (error) {
      console.error(`❌ [TokenPriceUpdater] Error updating ${symbol}:`, error);
      return false;
    }
  }

  /**
   * Chamado quando um novo trade é criado
   * Prioridade MÁXIMA: sempre atualiza o preço
   * IMPORTANTE: Apenas trades em pares com cBRL atualizam tokenPrice
   */
  async onTradeCreated(trade) {
    try {
      const symbol = this.getTokenSymbolFromPair(trade.pair);
      if (!symbol) return; // null = par não contém cBRL, não atualiza preço

      const price = parseFloat(trade.price);
      if (isNaN(price) || price <= 0) return;

      await this.updateTokenPrice(symbol, price, 'trade');
    } catch (error) {
      console.error('❌ [TokenPriceUpdater] Error in onTradeCreated:', error);
    }
  }

  /**
   * Atualiza o tokenPrice baseado nas melhores ordens disponíveis
   * - Para ordens de venda: menor preço (melhor oferta de venda)
   * - Para ordens de compra: maior preço (melhor oferta de compra)
   */
  async updatePriceFromOrders(symbol) {
    try {
      // Verificar se há trades recentes (última hora)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentTrade = await global.prisma.exchangeTrade.findFirst({
        where: {
          tokenASymbol: 'cBRL',
          tokenBSymbol: symbol,
          createdAt: {
            gte: oneHourAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Se houver trade recente, não atualizar (trade tem prioridade)
      if (recentTrade) {
        console.log(`⏭️ [TokenPriceUpdater] ${symbol}: Skipping order update (recent trade exists)`);
        return;
      }

      // Buscar melhor ordem de compra (maior preço)
      const bestBuyOrder = await global.prisma.exchangeOrder.findFirst({
        where: {
          tokenASymbol: 'cBRL',
          tokenBSymbol: symbol,
          orderType: 'BUY',
          status: 'ACTIVE'
        },
        orderBy: {
          price: 'desc' // Maior preço = melhor oferta de compra
        }
      });

      // Buscar melhor ordem de venda (menor preço)
      const bestSellOrder = await global.prisma.exchangeOrder.findFirst({
        where: {
          tokenASymbol: 'cBRL',
          tokenBSymbol: symbol,
          orderType: 'SELL',
          status: 'ACTIVE'
        },
        orderBy: {
          price: 'asc' // Menor preço = melhor oferta de venda
        }
      });

      // Prioridade: buy_order > sell_order
      if (bestBuyOrder) {
        const price = parseFloat(bestBuyOrder.price.toString());
        await this.updateTokenPrice(symbol, price, 'buy_order');
      } else if (bestSellOrder) {
        const price = parseFloat(bestSellOrder.price.toString());
        await this.updateTokenPrice(symbol, price, 'sell_order');
      }

    } catch (error) {
      console.error(`❌ [TokenPriceUpdater] Error in updatePriceFromOrders:`, error);
    }
  }

  /**
   * Chamado quando uma nova ordem é criada
   * Atualiza baseado nas melhores ordens disponíveis
   * IMPORTANTE: Apenas ordens em pares com cBRL atualizam tokenPrice
   */
  async onOrderCreated(order) {
    try {
      const symbol = this.getTokenSymbolFromPair(order.pair);
      if (!symbol) return; // null = par não contém cBRL, não atualiza preço

      // Atualizar preço baseado nas melhores ordens
      await this.updatePriceFromOrders(symbol);

    } catch (error) {
      console.error('❌ [TokenPriceUpdater] Error in onOrderCreated:', error);
    }
  }

  /**
   * Chamado quando um token é criado
   * Define preço inicial de 1.00
   */
  async onTokenCreated(tokenId) {
    try {
      const token = await global.prisma.smartContract.findUnique({
        where: { id: tokenId }
      });

      if (!token || token.contractTypeId !== TOKEN_CONTRACT_TYPE_ID) return;

      const metadata = token.metadata || {};

      // Se já tem preço, não sobrescrever
      if (metadata.tokenPrice) return;

      const symbol = metadata.symbol;
      if (!symbol) return;

      await this.updateTokenPrice(symbol, 1.00, 'initial');

    } catch (error) {
      console.error('❌ [TokenPriceUpdater] Error in onTokenCreated:', error);
    }
  }
}

module.exports = new TokenPriceUpdaterService();

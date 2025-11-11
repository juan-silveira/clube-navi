import api from './api';

/**
 * Serviço para buscar preços reais de tokens
 *
 * Ordem de prioridade para obter preço:
 * 1. Preço do trade mais recente no par token/cBRL
 * 2. Melhor oferta de COMPRA no exchange_orders do par token/cBRL
 * 3. Melhor oferta de VENDA no exchange_orders do par token/cBRL
 * 4. Fallback: 1.00 (se não existir exchange ou ordens)
 */

class TokenPriceService {
  constructor() {
    this.priceCache = new Map();
    this.cacheTimeout = 30000; // 30 segundos de cache
  }

  /**
   * Busca o preço real de um token
   */
  async getTokenPrice(symbol) {
    // cBRL sempre vale 1.00 (stablecoin de referência)
    if (symbol === 'cBRL') {
      return 1.00;
    }

    // Verificar cache
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.price;
    }

    try {
      // Buscar preço real da API
      const response = await api.get(`/api/tokens/${symbol}/price`);

      if (response.data.success && response.data.data) {
        const price = parseFloat(response.data.data.price) || 1.00;

        // Armazenar no cache
        this.priceCache.set(symbol, {
          price,
          timestamp: Date.now(),
          source: response.data.data.source // 'trade', 'buy_order', 'sell_order', 'fallback'
        });

        return price;
      }
    } catch (error) {
      console.warn(`Erro ao buscar preço de ${symbol}, usando fallback:`, error);
    }

    // Fallback
    return 1.00;
  }

  /**
   * Busca preços de múltiplos tokens em paralelo
   */
  async getMultipleTokenPrices(symbols) {
    const promises = symbols.map(symbol => this.getTokenPrice(symbol));
    const prices = await Promise.all(promises);

    return symbols.reduce((acc, symbol, index) => {
      acc[symbol] = prices[index];
      return acc;
    }, {});
  }

  /**
   * Limpa o cache de preços
   */
  clearCache() {
    this.priceCache.clear();
  }
}

export default new TokenPriceService();

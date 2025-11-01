const axios = require('axios');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * Serviço para gerenciar taxas CDI (Certificado de Depósito Interbancário)
 * Integração com API do Banco Central do Brasil
 */
class CdiService {
  constructor() {
    this.BCB_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados';
  }

  /**
   * Busca dados do CDI da API do Banco Central do Brasil
   * @param {Date} startDate - Data inicial
   * @param {Date} endDate - Data final (opcional, padrão: hoje)
   * @returns {Promise<Array>} Array de objetos com data e valor
   */
  async fetchCdiFromBCB(startDate, endDate = new Date()) {
    const formatDate = (date) => {
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const params = {
      formato: 'json',
      dataInicial: formatDate(startDate),
      dataFinal: formatDate(endDate)
    };

    try {
      console.log(`[CDI Service] Buscando CDI de ${formatDate(startDate)} até ${formatDate(endDate)}...`);
      const response = await axios.get(this.BCB_API_URL, { params, timeout: 10000 });
      console.log(`[CDI Service] ${response.data.length} registros encontrados`);
      return response.data;
    } catch (error) {
      console.error('[CDI Service] Erro ao buscar CDI da API do BCB:', error.message);
      throw new Error(`Falha ao buscar dados do CDI: ${error.message}`);
    }
  }

  /**
   * Converte taxa diária do CDI para taxa anualizada
   * Fórmula: ((1 + taxaDiaria)^252 - 1) * 100
   * 252 = número de dias úteis no ano
   * @param {number} dailyRate - Taxa diária (ex: 0.045513)
   * @returns {string} Taxa anualizada formatada (ex: "12.75")
   */
  calculateAnnualizedRate(dailyRate) {
    const rate = parseFloat(dailyRate);
    const annualized = ((Math.pow(1 + rate / 100, 252) - 1) * 100);
    return annualized.toFixed(4);
  }

  /**
   * Salva dados do CDI no banco de dados
   * Usa upsert para evitar duplicatas (data é unique)
   * @param {Array} cdiData - Array de objetos com { data, valor }
   * @returns {Promise<Object>} Resultado da operação
   */
  async saveCdiRates(cdiData) {
    const saved = [];
    const skipped = [];
    const errors = [];

    for (const item of cdiData) {
      try {
        // Converter data do formato DD/MM/YYYY para Date
        const [day, month, year] = item.data.split('/');
        const date = new Date(`${year}-${month}-${day}`);

        // Validar data
        if (isNaN(date.getTime())) {
          errors.push({ date: item.data, error: 'Data inválida' });
          continue;
        }

        const rate = parseFloat(item.valor);
        const rateYear = this.calculateAnnualizedRate(rate);

        const cdiRate = await prisma.cdiRate.upsert({
          where: { date },
          update: {
            rate,
            rateYear,
            updatedAt: new Date()
          },
          create: {
            date,
            rate,
            rateYear,
            source: 'BCB'
          }
        });

        saved.push(cdiRate);
      } catch (error) {
        console.error(`[CDI Service] Erro ao salvar taxa do dia ${item.data}:`, error.message);
        errors.push({ date: item.data, error: error.message });
        skipped.push(item);
      }
    }

    return {
      saved: saved.length,
      skipped: skipped.length,
      errors: errors.length,
      details: { saved, skipped, errors }
    };
  }

  /**
   * Sincroniza dados do CDI (busca da API e salva no banco)
   * @param {number} daysBack - Quantos dias para trás buscar (padrão: 30)
   * @returns {Promise<Object>} Resultado da sincronização
   */
  async syncCdiRates(daysBack = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    console.log(`[CDI Service] Sincronizando CDI dos últimos ${daysBack} dias...`);

    try {
      const cdiData = await this.fetchCdiFromBCB(startDate);

      if (!cdiData || cdiData.length === 0) {
        console.warn('[CDI Service] Nenhum dado retornado da API do BCB');
        return { saved: 0, skipped: 0, errors: 0, message: 'Nenhum dado retornado' };
      }

      const result = await this.saveCdiRates(cdiData);

      console.log(`[CDI Service] Sincronização concluída: ${result.saved} salvos, ${result.skipped} ignorados, ${result.errors} erros`);

      return result;
    } catch (error) {
      console.error('[CDI Service] Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * Obtém a taxa CDI mais recente do banco de dados
   * Se não houver dados, tenta sincronizar automaticamente
   * @returns {Promise<Object>} Objeto com taxa CDI mais recente
   */
  async getLatestCdiRate() {
    const latest = await prisma.cdiRate.findFirst({
      orderBy: { date: 'desc' }
    });

    if (!latest) {
      console.log('[CDI Service] Nenhuma taxa CDI encontrada, sincronizando...');
      await this.syncCdiRates(30);
      return this.getLatestCdiRate();
    }

    return latest;
  }

  /**
   * Obtém taxa CDI de uma data específica
   * @param {Date|string} date - Data desejada
   * @returns {Promise<Object|null>} Objeto com taxa CDI ou null
   */
  async getCdiRateByDate(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // Normalizar para início do dia

    return prisma.cdiRate.findUnique({
      where: { date: targetDate }
    });
  }

  /**
   * Calcula o equivalente ao CDI baseado na rentabilidade
   * Fórmula: (Rentabilidade / CDI_Anualizado) * 100
   * Exemplo: 1.25% p.m. = 15% a.a. com CDI de 12% = (15 / 12) * 100 = 125% do CDI
   *
   * @param {number} profitability - Rentabilidade (ex: 1.25 para 1.25% p.m. ou 15.5 para 15.5% a.a.)
   * @param {Date} referenceDate - Data de referência (opcional, usa a mais recente)
   * @param {boolean} isMonthly - Se true, converte rentabilidade mensal para anual (padrão: true)
   * @returns {Promise<Object>} Objeto com resultado do cálculo
   */
  async calculateCdiEquivalent(profitability, referenceDate = null, isMonthly = true) {
    let cdiRate;

    if (referenceDate) {
      cdiRate = await this.getCdiRateByDate(referenceDate);
      if (!cdiRate) {
        throw new Error(`Nenhuma taxa CDI disponível para a data ${referenceDate}`);
      }
    } else {
      cdiRate = await this.getLatestCdiRate();
    }

    if (!cdiRate) {
      throw new Error('Nenhuma taxa CDI disponível no banco de dados');
    }

    let profitabilityNumber = parseFloat(profitability);

    if (isNaN(profitabilityNumber) || profitabilityNumber <= 0) {
      throw new Error('Rentabilidade deve ser um número positivo');
    }

    // Se for rentabilidade mensal, converter para anual: (1 + r_mensal)^12 - 1
    // Simplificação: r_mensal * 12 (aproximação linear para taxas pequenas)
    const profitabilityMonthly = profitabilityNumber;
    if (isMonthly) {
      profitabilityNumber = profitabilityNumber * 12;
    }

    const cdiAnnualized = parseFloat(cdiRate.rateYear);
    const cdiEquivalent = ((profitabilityNumber / cdiAnnualized) * 100);

    // Calcular CDI mensal (simplificado: anual / 12)
    const cdiMonthly = parseFloat((cdiAnnualized / 12).toFixed(4));

    return {
      cdiEquivalent: parseFloat(cdiEquivalent.toFixed(2)),
      profitability: profitabilityNumber,
      profitabilityMonthly: isMonthly ? profitabilityMonthly : (profitabilityNumber / 12).toFixed(2),
      cdiRate: cdiAnnualized,
      cdiRateMonthly: cdiMonthly,
      cdiRateDaily: parseFloat(cdiRate.rate),
      cdiDate: cdiRate.date,
      isMonthly,
      formula: `(${profitabilityNumber} / ${cdiAnnualized}) * 100 = ${cdiEquivalent.toFixed(2)}%`
    };
  }

  /**
   * Obtém histórico de taxas CDI
   * @param {Date} startDate - Data inicial (opcional)
   * @param {Date} endDate - Data final (opcional)
   * @param {number} limit - Limite de registros (padrão: 30)
   * @returns {Promise<Array>} Array de taxas CDI
   */
  async getCdiHistory(startDate = null, endDate = null, limit = 30) {
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return prisma.cdiRate.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit)
    });
  }

  /**
   * Verifica se os dados CDI estão desatualizados
   * Considera desatualizado se a última taxa for de mais de 2 dias úteis atrás
   * @returns {Promise<boolean>} true se desatualizado, false caso contrário
   */
  async isOutdated() {
    const latest = await prisma.cdiRate.findFirst({
      orderBy: { date: 'desc' }
    });

    if (!latest) return true;

    const now = new Date();
    const latestDate = new Date(latest.date);
    const diffDays = Math.floor((now - latestDate) / (1000 * 60 * 60 * 24));

    // Considera desatualizado se passou mais de 2 dias úteis
    // (considerando fins de semana)
    return diffDays > 4;
  }
}

module.exports = new CdiService();

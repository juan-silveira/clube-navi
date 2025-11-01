const cron = require('node-cron');
const cdiService = require('../services/cdi.service');

/**
 * Job de sincronização diária do CDI (Certificado de Depósito Interbancário)
 * Busca taxas CDI do Banco Central do Brasil e armazena no banco de dados
 *
 * Execução: Diariamente às 9h da manhã (horário de Brasília)
 * API: https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados
 */
class CdiSyncJob {
  constructor() {
    // Executar todos os dias às 9h da manhã
    this.cronExpression = '0 9 * * *';
    this.isRunning = false;
    this.lastExecutionTime = null;
    this.lastExecutionResult = null;
  }

  /**
   * Executa a sincronização do CDI
   */
  async execute() {
    if (this.isRunning) {
      console.log('[CDI Sync Job] Job já está em execução, pulando...');
      return;
    }

    try {
      this.isRunning = true;
      const startTime = Date.now();

      console.log('========================================');
      console.log('[CDI Sync Job] Iniciando sincronização diária do CDI...');
      console.log('[CDI Sync Job] Data/Hora:', new Date().toLocaleString('pt-BR'));
      console.log('========================================');

      // Sincronizar últimos 7 dias para garantir que pegamos dados recentes
      // O Banco Central publica as taxas diariamente (dias úteis)
      const result = await cdiService.syncCdiRates(7);

      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

      this.lastExecutionTime = new Date();
      this.lastExecutionResult = {
        success: true,
        ...result,
        executionTime: `${executionTime}s`
      };

      console.log('========================================');
      console.log('[CDI Sync Job] Sincronização concluída com sucesso!');
      console.log(`[CDI Sync Job] Taxas salvas: ${result.saved}`);
      console.log(`[CDI Sync Job] Taxas ignoradas: ${result.skipped}`);
      console.log(`[CDI Sync Job] Erros: ${result.errors}`);
      console.log(`[CDI Sync Job] Tempo de execução: ${executionTime}s`);
      console.log('========================================');

      // Verificar se houve algum problema
      if (result.errors > 0) {
        console.warn('[CDI Sync Job] Atenção: Alguns erros ocorreram durante a sincronização');
        console.warn('[CDI Sync Job] Detalhes:', result.details?.errors);
      }

      if (result.saved === 0 && result.skipped === 0) {
        console.warn('[CDI Sync Job] Atenção: Nenhuma taxa foi salva ou atualizada');
      }

    } catch (error) {
      console.error('========================================');
      console.error('[CDI Sync Job] ERRO ao sincronizar CDI:');
      console.error('[CDI Sync Job] Erro:', error.message);
      console.error('[CDI Sync Job] Stack:', error.stack);
      console.error('========================================');

      this.lastExecutionTime = new Date();
      this.lastExecutionResult = {
        success: false,
        error: error.message
      };

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Inicia o job de sincronização
   */
  start() {
    console.log('');
    console.log('========================================');
    console.log('[CDI Sync Job] Inicializando job de sincronização CDI');
    console.log(`[CDI Sync Job] Agendamento: ${this.cronExpression} (9h todos os dias)`);
    console.log('[CDI Sync Job] Status: Ativo');
    console.log('========================================');

    // Executar imediatamente na inicialização (se necessário)
    // Descomente a linha abaixo se quiser executar ao iniciar o servidor
    // this.execute();

    // Agendar execução diária
    this.scheduledTask = cron.schedule(this.cronExpression, () => {
      this.execute();
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo" // Horário de Brasília
    });

    console.log('[CDI Sync Job] Job agendado com sucesso');
    console.log('');
  }

  /**
   * Para o job de sincronização
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      console.log('[CDI Sync Job] Job de sincronização parado');
    }
  }

  /**
   * Retorna informações sobre o status do job
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      cronExpression: this.cronExpression,
      lastExecutionTime: this.lastExecutionTime,
      lastExecutionResult: this.lastExecutionResult,
      scheduledTaskActive: this.scheduledTask ? true : false
    };
  }

  /**
   * Executa manualmente a sincronização (útil para testes e debug)
   */
  async runManually() {
    console.log('[CDI Sync Job] Executando sincronização manual...');
    return this.execute();
  }
}

// Exportar instância única (singleton)
module.exports = new CdiSyncJob();

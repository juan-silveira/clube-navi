"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { useAlertContext } from "@/contexts/AlertContext";
import { clubAdminApi } from "@/services/api";

const CashbackPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({
    consumerPercentage: 50,
    clubPercentage: 25,
    consumerReferrerPercentage: 12.5,
    merchantReferrerPercentage: 12.5,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);
  const { showSuccess, showError } = useAlertContext();

  useEffect(() => {
    loadCashbackData(currentPage);
  }, [currentPage]);

  const loadCashbackData = async (page = 1) => {
    try {
      setLoading(true);
      const response = await clubAdminApi.get("/cashback/stats", {
        params: {
          page,
          limit: transactionsPerPage
        }
      });
      setStats(response.data);

      // Se houver configuração salva, carregar
      if (response.data.config) {
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de cashback:", error);
      showError("Erro ao carregar dados de cashback");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      await clubAdminApi.post("/cashback/config", config);
      showSuccess("Configuração de cashback salva com sucesso!");
      await loadCashbackData();
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      showError("Erro ao salvar configuração de cashback");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = "primary" }) => (
    <Card>
      <div className="flex items-center gap-4 p-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center`}>
          <Icon icon={icon} className={`w-6 h-6 text-${color}-600 dark:text-${color}-300`} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Cashback</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure e monitore o sistema de cashback</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Distribuído"
          value={`R$ ${Number(stats?.totalDistributed || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Todo o período"
          icon="heroicons:gift"
          color="success"
        />
        <StatCard
          title="Último Mês"
          value={`R$ ${Number(stats?.lastMonth || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Cashback distribuído"
          icon="heroicons:calendar"
          color="primary"
        />
        <StatCard
          title="Transações"
          value={stats?.transactionCount || 0}
          subtitle="Com cashback"
          icon="heroicons:arrow-path"
          color="warning"
        />
        <StatCard
          title="Ticket Médio Cashback"
          value={`R$ ${Number(stats?.avgCashback || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Por transação"
          icon="heroicons:chart-bar"
          color="info"
        />
      </div>

      {/* Configuração */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Porcentagens de Cashback */}
        <Card title="Porcentagens de Cashback" subtitle="Configure as porcentagens para cada participante (soma máxima: 100%)">
          <div className="p-6 space-y-4">
            <div>
              <Textinput
                label="Cashback para Consumidor (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={config.consumerPercentage}
                onChange={(e) => setConfig({ ...config, consumerPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 50"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Porcentagem do cashback que vai direto para o consumidor que fez a compra
              </p>
            </div>

            <div>
              <Textinput
                label="Taxa do Clube (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={config.clubPercentage}
                onChange={(e) => setConfig({ ...config, clubPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 25"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Porcentagem que fica para o clube como taxa administrativa
              </p>
            </div>

            <div>
              <Textinput
                label="Bônus para Indicador do Consumidor (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={config.consumerReferrerPercentage}
                onChange={(e) => setConfig({ ...config, consumerReferrerPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 12.5"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Porcentagem para quem indicou o consumidor (programa de indicação)
              </p>
            </div>

            <div>
              <Textinput
                label="Bônus para Indicador do Comerciante (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={config.merchantReferrerPercentage}
                onChange={(e) => setConfig({ ...config, merchantReferrerPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 12.5"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Porcentagem para quem indicou o comerciante (programa de indicação)
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Distribuído:</span>
                <span className={`text-lg font-bold ${
                  (config.consumerPercentage + config.clubPercentage + config.consumerReferrerPercentage + config.merchantReferrerPercentage) > 100
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {(config.consumerPercentage + config.clubPercentage + config.consumerReferrerPercentage + config.merchantReferrerPercentage).toFixed(2)}%
                </span>
              </div>
              {(config.consumerPercentage + config.clubPercentage + config.consumerReferrerPercentage + config.merchantReferrerPercentage) > 100 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  A soma não pode exceder 100%
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Informações e Ações */}
        <Card title="Salvar Configurações" subtitle="Aplicar as alterações de cashback">
          <div className="p-6 space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Como funciona o sistema de cashback:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>O cashback é calculado automaticamente sobre o valor total da compra</li>
                    <li>É distribuído instantaneamente após cada transação concluída</li>
                    <li>As porcentagens são aplicadas sobre a taxa de cashback do comerciante</li>
                    <li>O programa de indicação permite recompensar quem trouxe novos membros</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex gap-2">
                <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Importante:</p>
                  <p className="text-xs">
                    As alterações nas porcentagens afetarão apenas as novas transações.
                    Transações já realizadas mantêm as porcentagens originais.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                text="Salvar Configurações"
                className="btn-primary w-full"
                onClick={handleSaveConfig}
                isLoading={loading}
                icon="heroicons:check"
                disabled={(config.consumerPercentage + config.clubPercentage + config.consumerReferrerPercentage + config.merchantReferrerPercentage) > 100}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Distribuição Recente */}
      <Card title="Distribuição Recente de Cashback" subtitle="Últimas transações com cashback">
        <div className="p-4">
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                {stats.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
                        <Icon icon="heroicons:gift" className="w-5 h-5 text-success-600 dark:text-success-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {transaction.consumerName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(transaction.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(transaction.createdAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-success-600 dark:text-success-400">
                        R$ {Number(transaction.consumerCashback).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        de R$ {Number(transaction.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {stats.pagination && stats.pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Mostrando <span className="font-semibold text-slate-900 dark:text-white">
                      {((currentPage - 1) * transactionsPerPage) + 1}
                    </span> a <span className="font-semibold text-slate-900 dark:text-white">
                      {Math.min(currentPage * transactionsPerPage, stats.pagination.total)}
                    </span> de <span className="font-semibold text-slate-900 dark:text-white">
                      {stats.pagination.total}
                    </span> transações
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      text="Anterior"
                      className="btn-outline-secondary btn-sm"
                      icon="heroicons:chevron-left"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />

                    {/* Indicador de página */}
                    <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        Página {currentPage}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        de {stats.pagination.totalPages}
                      </span>
                    </div>

                    <Button
                      text="Próxima"
                      className="btn-outline-secondary btn-sm"
                      icon="heroicons:chevron-right"
                      iconPosition="right"
                      onClick={() => setCurrentPage(p => Math.min(stats.pagination.totalPages, p + 1))}
                      disabled={currentPage === stats.pagination.totalPages}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Icon icon="heroicons:gift" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Nenhuma transação com cashback ainda</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CashbackPage;

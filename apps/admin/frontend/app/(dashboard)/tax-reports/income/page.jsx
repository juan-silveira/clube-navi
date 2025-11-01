"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import useConfig from '@/hooks/useConfig';
import api from '@/services/api';

const IncomeReportPage = () => {
  const { t } = useTranslation('taxReports');
  const { user } = useAuth();
  const { defaultNetwork } = useConfig();
  // Ano padrão é o informe do ano atual (ano-calendário anterior)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 1);
  const [availableYears, setAvailableYears] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState(null);

  // Buscar anos disponíveis ao carregar
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  // Buscar dados do informe quando o ano mudar
  useEffect(() => {
    if (selectedYear) {
      fetchReportData(selectedYear);
    }
  }, [selectedYear]);

  /**
   * Buscar anos disponíveis para informe
   */
  const fetchAvailableYears = async () => {
    try {
      const network = defaultNetwork || 'mainnet';
      const response = await api.get(`/api/tax-reports/available-years?network=${network}`);
      if (response.data.success) {
        const years = response.data.data;
        setAvailableYears(years);

        // Se o ano selecionado não está disponível, selecionar o ano mais recente
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[years.length - 1]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar anos disponíveis:', err);
    }
  };

  /**
   * Buscar dados do informe
   */
  const fetchReportData = async (year) => {
    setLoading(true);
    setError(null);

    try {
      const network = defaultNetwork || 'mainnet';
      const response = await api.get(`/api/tax-reports/income/${year}?network=${network}`);
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError(response.data.message || 'Erro ao buscar informe');
      }
    } catch (err) {
      console.error('Erro ao buscar informe:', err);
      setError(err.response?.data?.message || 'Erro ao carregar informe');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Baixar PDF do informe
   */
  const downloadPDF = async () => {
    setDownloadingPDF(true);

    try {
      const network = defaultNetwork || 'mainnet';
      const response = await api.get(`/api/tax-reports/income/${selectedYear}/pdf?network=${network}`, {
        responseType: 'blob',
      });

      // Criar URL do blob e baixar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe-rendimentos-${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      alert(t('errors.downloadFailed') || 'Erro ao baixar PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  /**
   * Formatar valor em BRL
   */
  const formatBRL = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  /**
   * Formatar número
   */
  const formatNumber = (value, decimals = 2) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0,00';

    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('income.title') || 'Informe de Rendimentos'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('income.subtitle') ||
              'Visualize e exporte seus rendimentos por ano calendário'}
          </p>
        </div>
      </div>

      {/* Seletor de Ano e Botão de Download */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('income.selectYear') || 'Selecione o Ano'}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-select rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {availableYears.length > 0 ? (
                  availableYears.map((year) => (
                    <option key={year} value={year}>
                      Informe {year}
                    </option>
                  ))
                ) : (
                  <option value={selectedYear}>Informe {selectedYear}</option>
                )}
              </select>
              {reportData && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ano-Calendário: {reportData.period.calendarYear}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={downloadPDF}
            disabled={!reportData || downloadingPDF}
            className="btn-primary inline-flex items-center"
          >
            {downloadingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('income.downloading') || 'Baixando...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {t('income.downloadPDF') || 'Baixar PDF'}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              {t('income.loading') || 'Carregando informe...'}
            </span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('income.errorTitle') || 'Erro ao carregar informe'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Report Data */}
      {reportData && !loading && !error && (
        <>
          {/* Resumo de Saldos */}
          <Card
            title={
              reportData.balances.date
                ? `Resumo do Saldo em ${new Date(reportData.balances.date).toLocaleDateString('pt-BR')}`
                : t('income.balancesSummary') || 'Resumo do Saldo (última data registrada)'
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                      Disponível
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      Em Ordens
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Em Stake
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(reportData.balances.total || {})
                    .filter(([_, amount]) => amount != null && !isNaN(amount))
                    .map(([token, totalAmount]) => {
                      const inOrders = reportData.balances.inOrders?.[token] || 0;
                      const available = reportData.balances.available?.[token] || 0;

                      // Usar stakes pré-calculados se disponível
                      const inStake = reportData.balances.inStake?.[token] || 0;

                      // Calculate total including stakes
                      const totalWithStakes = available + inOrders + inStake;

                      return (
                        <tr key={token}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {token}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-mono">
                            {formatNumber(available, 8)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-orange-600 dark:text-orange-400 font-mono">
                            {formatNumber(inOrders, 8)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400 font-mono">
                            {formatNumber(inStake, 8)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 font-mono">
                            {formatNumber(totalWithStakes, 8)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {Object.entries(reportData.balances.total || {}).filter(
                ([_, amount]) => amount != null && !isNaN(amount)
              ).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t('income.noBalance') || 'Sem saldo'}
                </p>
              )}
            </div>
          </Card>

          {/* Rendimentos por Produto */}
          <Card
            title={t('income.earningsByProduct') || 'Rendimentos por Produto'}
          >
            {reportData.products && reportData.products.length > 0 ? (
              <div className="space-y-6">
                {reportData.products.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {product.tokenSymbol} • {product.count}{' '}
                          {product.count === 1 ? 'distribuição' : 'distribuições'}
                        </p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('income.totalReceived') || 'Total Recebido'}
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatNumber(product.totalAmount, 8)}{' '}
                          {product.tokenSymbol}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('income.approximateValue') || 'Valor Aproximado'}
                        </p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {formatBRL(product.totalValueBRL)}
                        </p>
                      </div>
                    </div>

                    {/* Tabela de Distribuições */}
                    {product.distributions && product.distributions.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Distribuições ({product.distributions.length})
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-900">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Data
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Quantidade
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Cotação
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
                                  Valor (R$)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                              {product.distributions.map((dist, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                                    {new Date(dist.date).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-green-600 dark:text-green-400 font-mono">
                                    {formatNumber(dist.amount, 8)} {product.tokenSymbol}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-600 dark:text-gray-400 font-mono">
                                    {formatBRL(dist.quote)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-blue-600 dark:text-blue-400 font-mono">
                                    {formatBRL(dist.valueBRL)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('income.noEarnings') ||
                    'Nenhum rendimento registrado neste período'}
                </p>
              </div>
            )}
          </Card>

          {/* Totais */}
          <Card title={t('income.totals') || 'Totais'}>
            <div className="space-y-4">
              {/* Total por token */}
              {reportData.totals.byToken.map((token, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('income.total') || 'Total'} {token.symbol}:
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(token.totalAmount, 8)} {token.symbol}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ≈ {formatBRL(token.totalValueBRL)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Grande Total */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('income.grandTotal') || 'TOTAL GERAL'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatBRL(reportData.totals.grandTotalBRL)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Observações */}
          <Card>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p>
                    <strong>{t('income.note') || 'Observação'}:</strong>{' '}
                    {t('income.noteText') ||
                      `Os valores em reais (BRL) são aproximados, baseados nas cotações do último dia do ano-calendário (31/12/${selectedYear}).`}
                  </p>
                  <p>
                    {t('income.legalNote') ||
                      'Este documento serve apenas como informe de rendimentos, não substitui a declaração oficial de imposto de renda.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default IncomeReportPage;

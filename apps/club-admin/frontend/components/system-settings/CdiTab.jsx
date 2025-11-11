"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TrendingUp, Calendar, RefreshCw, Percent } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import useAlert from '@/hooks/useAlert';
import api from '@/services/api';

/**
 * Aba de gerenciamento do CDI (Certificado de Depósito Interbancário)
 * Mostra informações do CDI e permite sincronização com Banco Central
 */
const CdiTab = () => {
  const { t } = useTranslation('systemSettings');
  const { showSuccess, showError } = useAlert();

  const [cdiData, setCdiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Buscar dados do CDI ao carregar
  useEffect(() => {
    fetchLatestCdi();
  }, []);

  const fetchLatestCdi = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/cdi/latest');
      if (response.data.success) {
        setCdiData(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar CDI:', error);
      showError(t('cdi.errors.loadFailed') || 'Erro ao carregar dados do CDI');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Calcular dias desde 01/01/2025 até hoje
      const startDate = new Date('2025-01-01');
      const today = new Date();
      const daysBack = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

      const response = await api.post('/api/cdi/sync', {
        daysBack: daysBack
      });

      if (response.data.success) {
        showSuccess(t('cdi.messages.syncSuccess') || `${response.data.data.saved} taxas CDI sincronizadas com sucesso`);
        await fetchLatestCdi(); // Atualizar dados após sincronização
      }
    } catch (error) {
      console.error('Erro ao sincronizar CDI:', error);
      showError(error.response?.data?.message || t('cdi.errors.syncFailed') || 'Erro ao sincronizar CDI');
    } finally {
      setSyncing(false);
    }
  };

  // Calcular CDI mensal a partir do anual
  const getCdiMonthly = () => {
    if (!cdiData?.rateYear) return '--';
    const monthly = (parseFloat(cdiData.rateYear) / 12).toFixed(4);
    return `${monthly}%`;
  };

  // Formatar data (sem conversão de fuso horário)
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    // Usar apenas a parte da data (YYYY-MM-DD) para evitar problemas de fuso
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              {t('cdi.title') || 'CDI - Certificado de Depósito Interbancário'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('cdi.subtitle') || 'Gerencie a sincronização das taxas CDI do Banco Central'}
            </p>
          </div>

          <Button
            onClick={handleSync}
            isLoading={syncing}
            className="btn-primary"
            icon="heroicons:arrow-path"
            text={t('cdi.syncButton') || 'Sincronizar CDI'}
          />
        </div>
      </Card>

      {/* Cards de Informação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CDI Mensal */}
        <Card>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('cdi.monthlyRate') || 'CDI Mensal'}
            </h3>
            {loading ? (
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {getCdiMonthly()}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('cdi.perMonth') || 'p.m. (ao mês)'}
            </p>
          </div>
        </Card>

        {/* CDI Anual */}
        <Card>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('cdi.yearlyRate') || 'CDI Anual'}
            </h3>
            {loading ? (
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {cdiData?.rateYear ? `${cdiData.rateYear}%` : '--'}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('cdi.perYear') || 'a.a. (ao ano)'}
            </p>
          </div>
        </Card>

        {/* Última Atualização */}
        <Card>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('cdi.lastUpdate') || 'Última Atualização'}
            </h3>
            {loading ? (
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatDate(cdiData?.date)}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('cdi.referenceDate') || 'Data de referência'}
            </p>
          </div>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t('cdi.aboutTitle') || 'Sobre o CDI'}
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              {t('cdi.about1') || 'O CDI (Certificado de Depósito Interbancário) é a taxa de juros média dos empréstimos entre bancos.'}
            </p>
            <p>
              {t('cdi.about2') || 'A taxa é atualizada diariamente pelo Banco Central do Brasil e serve como referência para diversos investimentos de renda fixa.'}
            </p>
            <p>
              {t('cdi.about3') || 'Use o botão "Sincronizar CDI" para obter as taxas mais recentes do Banco Central.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CdiTab;

"use client";
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/services/api';
import useAlert from '@/hooks/useAlert';

/**
 * Componente para calcular o equivalente CDI automaticamente
 * Usado no formulário de stake contracts
 */
const CdiCalculator = ({ stakeForm, setStakeForm, editingStakeId }) => {
  const { t } = useTranslation('systemSettings');
  const { showSuccess, showError } = useAlert();
  const [calculatingCdi, setCalculatingCdi] = useState(false);

  // Handler para calcular CDI
  const handleCalculateCdi = async () => {
    try {
      setCalculatingCdi(true);

      // Determinar valor a usar baseado no tipo de investimento
      let profitability;
      let profitabilitySource = '';

      if (stakeForm.investment_type === 'fixed' || stakeForm.investment_type === 'stake' || stakeForm.investment_type === 'pratique') {
        profitability = stakeForm.rentabilityValue;
        profitabilitySource = 'fixed';
      } else if (stakeForm.investment_type === 'variable') {
        // Para renda variável, usar média da faixa
        const min = parseFloat(stakeForm.rentabilityRangeMin || 0);
        const max = parseFloat(stakeForm.rentabilityRangeMax || 0);
        profitability = ((min + max) / 2).toFixed(2);
        profitabilitySource = 'variable_avg';
      }

      if (!profitability || profitability <= 0) {
        showError(t('stakes.financialInfo.missingProfitability') || 'Informe a rentabilidade antes de calcular o CDI');
        return;
      }

      const response = await api.post('/api/cdi/calculate-equivalent', { profitability });

      if (response.data.success) {
        setStakeForm(prev => ({
          ...prev,
          equivalentCDI: response.data.data.cdiEquivalent,
          cdiRate: response.data.data.cdiRate,
          cdiRateMonthly: response.data.data.cdiRateMonthly,
          cdiCalculationDate: response.data.data.cdiDate,
          cdiProfitabilityUsed: profitability,
          cdiProfitabilitySource: profitabilitySource
        }));
        showSuccess(t('stakes.financialInfo.cdiCalculated') || 'CDI Equivalent calculado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao calcular CDI:', error);
      showError(error.response?.data?.message || 'Erro ao calcular CDI Equivalent');
    } finally {
      setCalculatingCdi(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          {t('stakes.financialInfo.cdiEquivalentTitle') || 'Equivalente ao CDI'}
        </h4>
      </div>

      {/* Valor Calculado */}
      <div className="space-y-3">
        {stakeForm.equivalentCDI ? (
          <>
            <div className="flex justify-center">
              {/* CDI Equivalente - Único valor */}
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 w-full md:w-auto md:min-w-[300px]">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {parseFloat(stakeForm.equivalentCDI).toFixed(2).replace('.', ',')}%
                  </span>
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {t('stakes.financialInfo.cdiPreposition') || 'do'} CDI
                  </span>
                </div>
              </div>
            </div>

            {stakeForm.cdiCalculationDate && (
              <div className="space-y-3">
                {/* Data de Cálculo */}
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  <strong>{t('stakes.financialInfo.calculatedOn') || 'Calculado em'}:</strong>{' '}
                  {(() => {
                    const [year, month, day] = stakeForm.cdiCalculationDate.split('T')[0].split('-');
                    return `${day}/${month}/${year}`;
                  })()}
                  {stakeForm.cdiProfitabilitySource === 'variable_avg' && (
                    <span className="ml-1 text-gray-500">
                      {t('stakes.financialInfo.averageRange') || '(média da faixa)'}
                    </span>
                  )}
                </p>

                {/* Comparativo Lado a Lado */}
                {stakeForm.cdiRateMonthly && stakeForm.cdiProfitabilityUsed && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                        {t('stakes.financialInfo.comparisonTitle') || 'Comparativo'}
                      </h5>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Linha Mensal */}
                      <div className="grid grid-cols-3 gap-2 px-3 py-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t('stakes.financialInfo.monthlyRate') || 'Mensal'}
                        </div>
                        <div className="text-xs text-right">
                          <div className="text-gray-600 dark:text-gray-400">
                            {t('stakes.financialInfo.cdiLabel') || 'CDI'}
                          </div>
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {parseFloat(stakeForm.cdiRateMonthly).toFixed(4).replace('.', ',')}% {t('stakes.financialInfo.monthSuffix') || 'a.m.'}
                          </div>
                        </div>
                        <div className="text-xs text-right">
                          <div className="text-gray-600 dark:text-gray-400">
                            {t('stakes.financialInfo.assetProfitability') || 'Rentabilidade'}
                          </div>
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {parseFloat(stakeForm.cdiProfitabilityUsed).toFixed(2).replace('.', ',')}% {t('stakes.financialInfo.monthSuffix') || 'a.m.'}
                          </div>
                        </div>
                      </div>
                      {/* Linha Anual */}
                      <div className="grid grid-cols-3 gap-2 px-3 py-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t('stakes.financialInfo.annualRate') || 'Anual'}
                        </div>
                        <div className="text-xs text-right">
                          <div className="text-gray-600 dark:text-gray-400">
                            {t('stakes.financialInfo.cdiLabel') || 'CDI'}
                          </div>
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {parseFloat(stakeForm.cdiRate).toFixed(2).replace('.', ',')}% {t('stakes.financialInfo.yearSuffix') || 'a.a.'}
                          </div>
                        </div>
                        <div className="text-xs text-right">
                          <div className="text-gray-600 dark:text-gray-400">
                            {t('stakes.financialInfo.assetProfitability') || 'Rentabilidade'}
                          </div>
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            {(stakeForm.cdiProfitabilityUsed * 12).toFixed(2).replace('.', ',')}% {t('stakes.financialInfo.yearSuffix') || 'a.a.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botão de recalcular quando já calculado */}
            {editingStakeId && (stakeForm.rentabilityValue || (stakeForm.rentabilityRangeMin && stakeForm.rentabilityRangeMax)) && (
              <div className="flex justify-center md:justify-end">
                <Button
                  type="button"
                  onClick={handleCalculateCdi}
                  className="btn-primary w-full md:w-auto"
                  icon="heroicons:calculator"
                  text={t('stakes.financialInfo.recalculate') || 'Recalcular'}
                  isLoading={calculatingCdi}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('stakes.financialInfo.notCalculated') || 'Não calculado'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {t('stakes.financialInfo.fillProfitability') || 'Preencha a rentabilidade e clique em calcular'}
              </p>
            </div>

            {/* Botão de calcular quando não há cálculo */}
            {editingStakeId && (stakeForm.rentabilityValue || (stakeForm.rentabilityRangeMin && stakeForm.rentabilityRangeMax)) && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={handleCalculateCdi}
                  className="btn-primary w-full md:w-auto"
                  icon="heroicons:calculator"
                  text={t('stakes.financialInfo.calculate') || 'Calcular'}
                  isLoading={calculatingCdi}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Avisos */}
      {!editingStakeId && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              {t('stakes.financialInfo.saveFirst') || 'Salve o contrato primeiro para poder calcular o CDI'}
            </p>
          </div>
        </div>
      )}

      {editingStakeId && (!stakeForm.rentabilityValue && !(stakeForm.rentabilityRangeMin && stakeForm.rentabilityRangeMax)) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {t('stakes.financialInfo.fillToCalculate') || 'Preencha a rentabilidade (renda fixa) ou a faixa de rentabilidade (renda variável) para calcular o equivalente ao CDI'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CdiCalculator;

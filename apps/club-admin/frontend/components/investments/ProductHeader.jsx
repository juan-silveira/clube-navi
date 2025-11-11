"use client";
import React, { useState, useEffect } from 'react';
import { BadgeCheck, Info } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';

/**
 * Cabeçalho de produto de investimento
 * Exibe informações principais do produto em um layout destacado
 */
const ProductHeader = ({
  product,
  totalStaked = '0', // Total em stake no contrato
  stakeTokenSymbol = '', // Símbolo do token de stake
  formatCurrency,
  formatDate
}) => {
  const { t } = useTranslation('investments');

  // Estado para número de investidores ativos
  const [activeUsers, setActiveUsers] = useState(null);
  const [latestCdiDate, setLatestCdiDate] = useState(null);

  // Converter totalStaked de string para número
  const totalStakedNum = parseFloat(totalStaked) || 0;

  // Usar issuerName do metadata ou fallback para issuer
  const displayIssuerName = product?.metadata?.issuerName || product?.issuer || product?.metadata?.issuer || 'Emissor';

  // Buscar número de investidores ativos
  useEffect(() => {
    if (!product) return;
    const fetchActiveUsers = async () => {
      if (!product?.address || !product?.network) return;

      try {
        const response = await api.post('/api/contracts/read', {
          contractAddress: product.address,
          functionName: 'getNumberOfActiveUsers',
          params: [],
          network: product.network
        });

        if (response.data.success && response.data.data?.result !== undefined) {
          setActiveUsers(response.data.data.result);
        }
      } catch (error) {
        console.error('Error fetching active users:', error);
        setActiveUsers('--');
      }
    };

    fetchActiveUsers();
  }, [product?.address, product?.network]);

  // Buscar data do CDI mais recente
  useEffect(() => {
    const fetchLatestCdiDate = async () => {
      try {
        const response = await api.get('/api/cdi/latest');
        if (response.data.success && response.data.data?.date) {
          setLatestCdiDate(response.data.data.date);
        }
      } catch (error) {
        console.warn('Erro ao buscar data do CDI:', error);
      }
    };

    fetchLatestCdiDate();
  }, []);

  // Formatar CDI Equivalent
  const formatEquivalentCDI = () => {
    const cdiValue = product.metadata?.equivalentCDI || product.equivalentCDI;
    if (!cdiValue || cdiValue === '--') return '--';

    // Se já tiver "% do CDI", "% of CDI" ou "% del CDI", retornar direto
    if (typeof cdiValue === 'string' && cdiValue.includes('CDI')) {
      return cdiValue;
    }

    // O valor já vem calculado corretamente do backend
    const cdiEquivalent = parseFloat(cdiValue);
    if (isNaN(cdiEquivalent)) return cdiValue;

    // Formatar com vírgula para decimais (padrão brasileiro)
    const formattedValue = cdiEquivalent.toFixed(2).replace('.', ',');
    return `${formattedValue}% ${t('productCard.cdiPreposition') || 'do CDI'}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'Em captação':
        return 'bg-blue-600 text-white';
      case 'closed':
      case 'Concluído':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getStatusText = (status) => {
    if (status === 'active') return t('productHeader.status.activeCollecting');
    if (status === 'closed') return t('productHeader.status.completed');
    return status || t('productHeader.status.activeCollecting');
  };

  if (!product) return null;

  return (
    <div className="space-y-4 pb-6">
      {/* Header: Logo + Código/Nome + Rentabilidade + Status + Vencimento */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Logo ou código */}
          {product.metadata?.logoUrl ? (
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center flex-shrink-0"
              style={{
                backgroundImage: `url(${product.metadata.logoUrl})`
              }}
            />
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {(product.metadata?.code || product.code || 'N/A').substring(0, 6)}
              </span>
            </div>
          )}

          {/* Código e Nome */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {product.metadata?.code || product.code || 'PRODUCT'}
              </h1>
              <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>

            <h2 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
              {product.name}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayIssuerName}
            </p>
          </div>
        </div>

        {/* Rentabilidade com borda ao redor */}
        <div className="flex flex-col items-center px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('productHeader.monthlyProfitability')}</p>
          <div className="flex items-center gap-1">
            <p className="text-lg md:text-xl font-bold text-green-600">
              {product.metadata?.investment_type === 'variable'
                ? (product.metadata?.rentabilityRange || product.rentabilityRange || '--')
                : (product.metadata?.rentability || product.rentability || '--')}
            </p>
            {/* Tooltip para rentabilidade */}
            {(product.metadata?.rentabilityTooltip || product.metadata?.rentabilityRangeTooltip) && (
              <Tooltip
                content={product.metadata?.investment_type === 'variable'
                  ? (product.metadata?.rentabilityRangeTooltip || '')
                  : (product.metadata?.rentabilityTooltip || '')}
                placement="top"
                theme="dark"
                maxWidth={400}
                interactive={false}
              >
                <Info className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatEquivalentCDI()}
            </p>
            {(product.metadata?.equivalentCDI || product.equivalentCDI) && (
              <Tooltip
                content={t('productCard.cdiTooltip', {
                  date: latestCdiDate
                    ? (() => {
                        const [year, month, day] = latestCdiDate.split('T')[0].split('-');
                        return `${day}/${month}/${year}`;
                      })()
                    : new Date().toLocaleDateString('pt-BR')
                })}
                placement="top"
                theme="dark"
                maxWidth={400}
                interactive={false}
              >
                <Info className="w-3 h-3 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
              </Tooltip>
            )}
          </div>
        </div>

        {/* Status Badge com Vencimento abaixo */}
        <div className="flex flex-col items-center">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap mb-2 ${getStatusColor(product.metadata?.capturedStatus || product.status)}`}>
            {getStatusText(product.metadata?.capturedStatus || product.status)}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('productHeader.maturity')} <span className="font-semibold text-gray-900 dark:text-white">{formatDate(product.metadata?.maturityDate)}</span>
          </p>
        </div>
      </div>

      {/* Segunda linha: Quantidade a captar, Valor captado, Compradores */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('productHeader.amountToRaise')}</p>
          <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
            {product.metadata?.totalEmission ?
              `${new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: product.metadata.totalEmission % 1 === 0 ? 0 : 6
              }).format(product.metadata.totalEmission)} ${stakeTokenSymbol || product.metadata?.code || ''}` :
              '--'}
          </p>
        </div>

        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('productHeader.amountRaised')}</p>
          <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
            {stakeTokenSymbol ?
              `${new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: totalStakedNum % 1 === 0 ? 0 : 6
              }).format(totalStakedNum)} ${stakeTokenSymbol}` :
              '--'}
          </p>
        </div>

        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('productHeader.investors')}</p>
          <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
            {activeUsers !== null ? activeUsers : '--'}
          </p>
        </div>
      </div>

      {/* Aviso de impostos */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-4">
          {t('productHeader.taxExemption')}
        </p>
      </div>
    </div>
  );
};

export default ProductHeader;

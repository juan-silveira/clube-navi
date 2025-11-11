"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Copy, Check, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from 'react-i18next';
import { getExplorerAddressUrl, getNetworkDisplayName } from '@/utils/explorerUtils';
import useConfig from '@/hooks/useConfig';
import api from '@/services/api';

/**
 * Sidebar de investimento para mobile com accordion
 */
const InvestmentSidebarMobile = ({
  product,
  user,
  totalStaked = '0', // Total em stake no contrato
  stakeTokenSymbol = '', // Símbolo do token de stake
  contractRewards = '0', // Rewards pendentes
  userStake = '0', // Stake do usuário
  loadingRewards = false,
  loadingStake = false,
  handleInvest,
  handleWithdraw,
  handleBuy,
  handleCompound,
  handleClaim,
  formatCurrency,
  formatTokenAmount,
  formatDate,
  documents = []
}) => {
  const { t } = useTranslation('investments');
  const { defaultNetwork } = useConfig();
  const [expandedSection, setExpandedSection] = useState(null);
  const [copied, setCopied] = useState(false);
  const [cycleDays, setCycleDays] = useState(null);
  const [latestCdiDate, setLatestCdiDate] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCopyAddress = () => {
    if (product?.address) {
      navigator.clipboard.writeText(product.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Buscar cycleDurationInDays do contrato
  useEffect(() => {
    const fetchCycleDuration = async () => {
      if (!product?.address || !product?.network) return;

      try {
        const cycleDurationResponse = await api.post('/api/contracts/read', {
          contractAddress: product.address,
          functionName: 'cycleDurationInDays',
          params: [],
          network: product.network
        });

        if (cycleDurationResponse?.data?.success) {
          const durationInDays = cycleDurationResponse.data.data || cycleDurationResponse.data.result || 0;
          setCycleDays(Number(durationInDays.result || durationInDays));
        }
      } catch (error) {
        console.warn('Erro ao buscar cycleDurationInDays:', error);
      }
    };

    fetchCycleDuration();
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

  const calculateProgress = () => {
    const totalEmission = product.metadata?.totalEmission || 0;
    const totalStakedNum = parseFloat(totalStaked) || 0;
    if (totalEmission > 0) {
      return Math.min((totalStakedNum / totalEmission) * 100, 100);
    }
    return 0;
  };

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
    return `${formattedValue}% ${t('productCard.cdiPreposition') || 'do'} CDI`;
  };

  // Traduzir tipo de ativo
  const getAssetTypeText = (assetTypeValue) => {
    if (!assetTypeValue) return '--';

    const normalized = assetTypeValue
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const typeMapping = {
      'recebivel': 'receivable',
      'participacao': 'participation',
      'debenture': 'debenture',
      'cri': 'cri',
      'cra': 'cra',
      'royalty': 'royalty',
      'agronegocio': 'agribusiness',
      'imobiliario': 'real_estate',
      'credito': 'credit',
      'outro': 'other'
    };

    const typeKey = typeMapping[normalized] || normalized;
    const translationKey = `productCard.assetTypes.${typeKey}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : assetTypeValue;
  };

  // Converter cycleDurationInDays para texto amigável
  const getPaymentFrequencyText = () => {
    // Se não tiver cycleDays do contrato, usar o paymentFrequency direto
    if (!cycleDays && cycleDays !== 0) {
      const freq = product.paymentFrequency || product.metadata?.paymentFrequency;
      return freq || t('paymentFrequency.single');
    }

    // Converter dias para texto traduzido
    switch (cycleDays) {
      case 1:
        return t('paymentFrequency.daily');
      case 7:
        return t('paymentFrequency.weekly');
      case 15:
        return t('paymentFrequency.biweekly');
      case 30:
        return t('paymentFrequency.monthly');
      case 60:
        return t('paymentFrequency.bimonthly');
      case 90:
        return t('paymentFrequency.quarterly');
      case 180:
        return t('paymentFrequency.semiannual');
      case 365:
        return t('paymentFrequency.annual');
      default:
        return t('paymentFrequency.days', { count: cycleDays });
    }
  };

  return (
    <div className="lg:hidden space-y-4">
      {/* Aviso de isenção de imposto */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          {t('sidebar.taxExemptionText')}
        </p>
      </div>

      {/* Card de informações do produto */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header com logo e nome */}
        <div className="flex items-center gap-3 mb-4">
          {/* Logo ou código */}
          {product.metadata?.logoUrl ? (
            <div
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center flex-shrink-0"
              style={{
                backgroundImage: `url(${product.metadata.logoUrl})`
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {(product.metadata?.code || product.code || 'N/A').substring(0, 6)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h3>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-semibold rounded-full whitespace-nowrap flex-shrink-0">
                {t('sidebar.collecting')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{product.metadata?.code || product.code}</p>
          </div>
        </div>

        {/* Informações principais */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">{t('productCard.monthlyRentability')}</span>
            <div className="flex items-center gap-1">
              <span className="text-green-600 font-semibold">
                {product.metadata?.investment_type === 'variable'
                  ? (product.metadata?.rentabilityRange || product.rentabilityRange || '--')
                  : (product.metadata?.rentability || product.rentability || '--')}
              </span>
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
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">{t('productCard.equivalentTo')}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-900 dark:text-white font-medium">
                {formatEquivalentCDI()}
              </span>
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
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('productCard.assetType')}</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {getAssetTypeText(product.metadata?.assetType || product.assetType)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('productCard.maturity')}</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatDate(product.metadata?.maturityDate || product.maturityDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('productCard.remuneration')}</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {getPaymentFrequencyText()}
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Informações de disponibilidade */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('sidebar.assetAvailability')}</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {(() => {
                const totalEmission = product.metadata?.totalEmission || 0;
                const totalStakedNum = parseFloat(totalStaked) || 0;
                const available = Math.max(totalEmission - totalStakedNum, 0);
                return formatTokenAmount ? formatTokenAmount(available) : `${available} ${stakeTokenSymbol}`;
              })()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('sidebar.tokensIssued')}</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {product.metadata?.totalEmission ?
                `${new Intl.NumberFormat('pt-BR').format(product.metadata.totalEmission)} ${stakeTokenSymbol || 'TOKEN'}` :
                '--'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('sidebar.capturedAmount')}</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {formatTokenAmount ? formatTokenAmount(parseFloat(totalStaked)) : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Card escuro com informações de rewards, stake e botões */}
      <div className="bg-gray-900 dark:bg-black rounded-2xl p-6">
        {/* A Receber */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center mb-1">
            <span className="text-3xl font-bold text-white">
              {loadingRewards ? (
                <div className="h-9 w-24 bg-gray-700 rounded animate-pulse mx-auto"></div>
              ) : (
                formatTokenAmount(parseFloat(contractRewards))
              )}
            </span>
          </div>
          <div className="text-xs text-gray-400 uppercase">
            {stakeTokenSymbol} {t('detailPage.toReceive')}
          </div>
        </div>

        {/* Meu Investimento */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{t('detailPage.myInvestment')}</span>
            <span className="text-lg font-bold text-white">
              {loadingStake ? (
                <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
              ) : (
                formatTokenAmount(parseFloat(userStake))
              )}
            </span>
          </div>
        </div>

        {/* Risco */}
        {product.metadata?.risk !== undefined && (
          <div className="mb-6 pb-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t('detailPage.risk')}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                product.metadata.risk === 0 ? 'bg-green-100 text-green-800' :
                product.metadata.risk === 1 ? 'bg-blue-100 text-blue-800' :
                product.metadata.risk === 2 ? 'bg-yellow-100 text-yellow-800' :
                product.metadata.risk === 3 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.metadata.risk === 0 ? t('detailPage.riskLevels.veryLow') :
                 product.metadata.risk === 1 ? t('detailPage.riskLevels.low') :
                 product.metadata.risk === 2 ? t('detailPage.riskLevels.medium') :
                 product.metadata.risk === 3 ? t('detailPage.riskLevels.high') :
                 t('detailPage.riskLevels.veryHigh')}
              </span>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleInvest}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!user || product.status === 'closed'}
          >
            {t('detailPage.invest')}
          </button>
          <button
            onClick={handleWithdraw}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!user || parseFloat(userStake) <= 0}
          >
            {t('detailPage.withdraw')}
          </button>
          <button
            onClick={handleBuy}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors"
          >
            {t('detailPage.buy')}
          </button>
          <button
            onClick={handleCompound}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!user || parseFloat(contractRewards) <= 0}
          >
            {t('detailPage.reinvest')}
          </button>
          <button
            onClick={handleClaim}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!user || parseFloat(contractRewards) <= 0}
          >
            {t('detailPage.claim')}
          </button>
        </div>
      </div>

      {/* Accordion: Sobre o ativo */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleSection('about')}
          className="w-full flex items-center justify-between p-4 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-semibold">{t('detailPage.aboutAssetTitle')}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
        </button>
        {expandedSection === 'about' && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {product.description?.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n') || t('detailPage.aboutAssetEmpty')}
            </p>
          </div>
        )}
      </div>

      {/* Accordion: Documentos */}
      {documents && documents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('documents')}
            className="w-full flex items-center justify-between p-4 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-semibold">{t('detailPage.documentsTitle')}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'documents' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'documents' && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              {documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  <span>{doc.name}</span>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accordion: Sobre o emissor */}
      {(product.metadata?.issuerName || product.metadata?.issuerDescription) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('issuer')}
            className="w-full flex items-center justify-between p-4 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-semibold">{t('detailPage.aboutIssuerTitle')}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'issuer' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'issuer' && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              {/* Logo e informações */}
              <div className="flex items-center gap-3">
                {product.metadata?.issuerLogo && (
                  <div
                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center flex-shrink-0"
                    style={{
                      backgroundImage: `url(${product.metadata.issuerLogo})`
                    }}
                  />
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Linha 1: Nome e Ano */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {product.metadata?.issuerName || product.issuer || 'Emissor'}
                    </h4>
                    {product.metadata?.issuerFoundationYear && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {t('detailPage.issuerFoundationYear')}: <strong className="text-gray-900 dark:text-white">{product.metadata.issuerFoundationYear}</strong>
                      </span>
                    )}
                  </div>

                  {/* Linha 2: URL e Projetos */}
                  <div className="flex items-center justify-between gap-2">
                    {product.metadata?.issuerWebsite ? (
                      <a
                        href={product.metadata.issuerWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1 truncate"
                      >
                        {product.metadata.issuerWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink size={12} className="flex-shrink-0" />
                      </a>
                    ) : (
                      <div />
                    )}
                    {product.issuerProjectsCount !== undefined && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {t('detailPage.issuerProjects')}: <strong className="text-gray-900 dark:text-white">{product.issuerProjectsCount}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Descrição em largura total */}
              {product.metadata?.issuerDescription && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.metadata.issuerDescription}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Accordion: Registro blockchain */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleSection('blockchain')}
          className="w-full flex items-center justify-between p-4 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-semibold">{t('detailPage.blockchainTitle')}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'blockchain' ? 'rotate-180' : ''}`} />
        </button>
        {expandedSection === 'blockchain' && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('detailPage.blockchainNetwork')}</p>
              <p className="text-sm font-semibold">{getNetworkDisplayName(product?.network || defaultNetwork)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('detailPage.contractAddress')}</p>
              <div className="flex items-center space-x-2">
                <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                  {product?.address || '--'}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
                <a
                  href={getExplorerAddressUrl(product?.address, product?.network || defaultNetwork)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion: Garantias */}
      {product.guarantees && (typeof product.guarantees === 'string' ? product.guarantees.trim() !== '' : product.guarantees.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('guarantees')}
            className="w-full flex items-center justify-between p-4 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-semibold">{t('detailPage.guaranteesTitle')}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'guarantees' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'guarantees' && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              {typeof product.guarantees === 'string' ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.guarantees}
                </p>
              ) : (
                <ul className="space-y-2">
                  {product.guarantees.map((guarantee, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      • {guarantee}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Accordion: Riscos */}
      {product.risks && (typeof product.risks === 'string' ? product.risks.trim() !== '' : product.risks.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('risks')}
            className="w-full flex items-center justify-between p-4 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-semibold">{t('detailPage.risksTitle')}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'risks' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'risks' && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              {typeof product.risks === 'string' ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.risks}
                </p>
              ) : (
                <ul className="space-y-2">
                  {product.risks.map((risk, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      • {risk}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestmentSidebarMobile;

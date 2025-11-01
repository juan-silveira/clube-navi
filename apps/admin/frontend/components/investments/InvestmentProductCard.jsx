"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import api from '@/services/api';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from 'react-i18next';

/**
 * Card de produto de investimento
 * Baseado no design da plataforma concorrente
 */
const InvestmentProductCard = ({ product }) => {
  const router = useRouter();
  const { t } = useTranslation('investments');
  const [totalStaked, setTotalStaked] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [capturedStatus, setCapturedStatus] = useState('collecting');
  const [cycleDays, setCycleDays] = useState(null);
  const [latestCdiDate, setLatestCdiDate] = useState(null);

  const {
    code,                    // FTR3
    name,                    // Force Telecom Recebíveis
    symbol,                  // TOKEN (ex: FTR)
    issuer,                  // Emissor
    totalEmission,           // Quantidade máxima a captar (definida no admin)
    maxStake,                // Quantidade máxima que pode ser colocada em stake
    contractAddress,         // Endereço do contrato
    network,                 // Rede do contrato
    logoUrl,                 // URL do logo
    bannerUrl,               // URL do banner
    rentability,             // 1.40% a.m (Renda Fixa)
    rentabilityRange,        // 2% - 3% a.m (Renda Variável)
    equivalentCDI,           // 123% do CDI
    assetType,               // Recebível
    maturityDate,            // 09/12/2025
    paymentFrequency,        // única
    status,                  // Em captação
    capturedPercentage,      // 26.77
    minInvestment,           // valor em wei
    investment_type,         // fixed, variable, stake, etc.
    metadata
  } = product;

  // Usar issuerName do metadata ou fallback para issuer
  const displayIssuerName = metadata?.issuerName || issuer || metadata?.issuer || 'Emissor';

  // Determinar qual rentabilidade mostrar baseado no tipo de investimento
  const displayRentability = investment_type === 'variable'
    ? (rentabilityRange || metadata?.rentabilityRange || '--')
    : (rentability || metadata?.rentability || '--');

  // Determinar qual tooltip mostrar baseado no tipo de investimento
  const displayTooltip = investment_type === 'variable'
    ? metadata?.rentabilityRangeTooltip
    : metadata?.rentabilityTooltip;

  // Verificar se existe tooltip personalizado
  const hasTooltip = displayTooltip && displayTooltip.trim().length > 0;

  // Exibir CDI Equivalent
  const displayEquivalentCDI = () => {
    const cdiValue = equivalentCDI || metadata?.equivalentCDI;
    if (!cdiValue || cdiValue === '--') return '--';

    // Se já tiver "% do CDI" ou similar, retornar direto
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

  // Converter cycleDurationInDays para texto amigável
  const getPaymentFrequencyText = () => {
    // Se não tiver cycleDays do contrato, usar o paymentFrequency direto
    if (!cycleDays && cycleDays !== 0) {
      return paymentFrequency || metadata?.paymentFrequency || t('paymentFrequency.single');
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

  // Traduzir status do produto
  const getStatusText = (statusValue) => {
    if (!statusValue) return t('productCard.status.collecting');

    const statusLower = statusValue.toLowerCase();
    const statusKey = `productCard.status.${statusLower}`;

    // Tentar traduzir com a chave, se não existir, retornar o valor original
    const translated = t(statusKey);
    return translated !== statusKey ? translated : statusValue;
  };

  // Traduzir tipo de ativo
  const getAssetTypeText = (assetTypeValue) => {
    if (!assetTypeValue) return '--';

    // Normalizar o valor: remover acentos e converter para lowercase
    const normalized = assetTypeValue
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos

    // Mapear termos em português para inglês
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

    // Tentar traduzir, se não existir retornar o valor original
    const translated = t(translationKey);
    return translated !== translationKey ? translated : assetTypeValue;
  };

  // Determinar qual valor mostrar: capturedAmount se existir, senão maxCapacity
  const displayAmount = () => {
    // Se existe totalEmission no metadata (já está em ether)
    if (metadata?.totalEmission && metadata?.totalEmission > 0) {
      // Formatar com separadores de milhar
      const formatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: metadata.totalEmission % 1 === 0 ? 0 : 6
      }).format(metadata.totalEmission);
      return `${formatted} ${symbol || metadata?.symbol || 'TOKEN'}`;
    }
    // Senão, mostrar a capacidade máxima (está em wei, precisa converter)
    if (maxCapacity > 0) {
      return formatTokenAmount(maxCapacity, symbol || metadata?.symbol);
    }
    return '--';
  };

  // Buscar última data do CDI
  useEffect(() => {
    const fetchLatestCdiDate = async () => {
      try {
        const response = await api.get('/api/cdi/latest');
        if (response.data.success && response.data.data?.date) {
          setLatestCdiDate(response.data.data.date);
        }
      } catch (error) {
        console.warn('Erro ao buscar última data do CDI:', error);
      }
    };

    fetchLatestCdiDate();
  }, []);

  // Buscar total staked e calcular percentual de captação
  useEffect(() => {
    const fetchStakingData = async () => {
      if (!contractAddress || !network) return;

      try {
        let stakedWei = 0;
        let maxCapacityWei = 0;

        // 1. Buscar getTotalStakedSupply do contrato de stake
        try {
          const totalStakedResponse = await api.post('/api/contracts/read', {
            contractAddress,
            functionName: 'getTotalStakedSupply',
            params: [],
            network
          });

          if (totalStakedResponse?.data?.success) {
            stakedWei = totalStakedResponse.data.data || 0;
            setTotalStaked(stakedWei);
          }
        } catch (error) {
          console.warn('Erro ao buscar getTotalStakedSupply:', error);
        }

        // 1.5. Buscar cycleDurationInDays do contrato de stake
        try {
          const cycleDurationResponse = await api.post('/api/contracts/read', {
            contractAddress,
            functionName: 'cycleDurationInDays',
            params: [],
            network
          });

          if (cycleDurationResponse?.data?.success) {
            const durationInDays = cycleDurationResponse.data.data || cycleDurationResponse.data.result || 0;
            setCycleDays(Number(durationInDays.result));
          }
        } catch (error) {
          console.warn('Erro ao buscar cycleDurationInDays:', error);
        }

        // 2. Determinar capacidade máxima
        // Se maxStake foi definido no registro, usar ele
        if (maxStake && maxStake > 0) {
          maxCapacityWei = maxStake;
        }
        // Caso contrário, buscar totalSupply do token
        else if (metadata?.tokenAddress) {
          try {
            const totalSupplyResponse = await api.post('/api/contracts/read', {
              contractAddress: metadata.tokenAddress,
              functionName: 'totalSupply',
              params: [],
              network
            });

            if (totalSupplyResponse?.data?.success) {
              // O valor pode vir em data.data ou data.result
              maxCapacityWei = totalSupplyResponse.data.data?.result || totalSupplyResponse.data.result || totalSupplyResponse.data.data || 0;
            }
          } catch (error) {
            console.warn('Erro ao buscar totalSupply:', error);
          }
        }

        setMaxCapacity(maxCapacityWei);

        // 3. Calcular percentual e definir status
        if (maxCapacityWei > 0 && stakedWei > 0) {
          const percentage = (parseFloat(stakedWei) / parseFloat(maxCapacityWei)) * 100;

          if (percentage >= 100) {
            setCapturedStatus(status || 'completed');
          } else {
            setCapturedStatus(status || 'collecting');
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar dados de staking:', error);
      }
    };

    fetchStakingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, network]);

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Converter wei para ether e formatar com símbolo do token
  const formatTokenAmount = (weiValue, tokenSymbol) => {
    if (!weiValue) return '--';
    try {
      // Converter de wei para ether (dividir por 10^18)
      const etherValue = parseFloat(weiValue) / Math.pow(10, 18);

      // Formatar com separadores de milhar
      const formatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: etherValue % 1 === 0 ? 0 : 6
      }).format(etherValue);

      return `${formatted} ${tokenSymbol || 'TOKEN'}`;
    } catch (error) {
      console.error('Erro ao formatar valor em token:', error);
      return '--';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'em captação':
      case 'open':
      case 'active':
        return 'bg-blue-600 text-white';
      case 'fechado':
      case 'closed':
        return 'bg-gray-500 text-white';
      case 'concluído':
      case 'completed':
        return 'bg-green-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  // Pegar o código do produto (pode vir direto ou do metadata)
  const productCode = code || metadata?.code;
  const productType = investment_type || metadata?.investment_type;

  const handleClick = () => {
    if (!productCode) {
      console.error('Product code not found');
      return;
    }

    // Navegar para página de detalhes baseado no tipo de investimento
    if (productType === 'fixed') {
      router.push(`/investments/fixed/${productCode}`);
    } else if (productType === 'variable') {
      router.push(`/investments/variable/${productCode}`);
    } else {
      router.push(`/investments/${productCode}`);
    }
  };

  // Calcular percentual capturado
  const getCapturedPercentage = () => {
    // Usar valores obtidos da blockchain
    if (maxCapacity > 0 && totalStaked > 0) {
      const percentage = (parseFloat(totalStaked) / parseFloat(maxCapacity)) * 100;
      return Math.min(percentage, 100).toFixed(2); // Limitar a 100%
    }

    // Fallback se não conseguir buscar da blockchain
    if (capturedPercentage) return capturedPercentage;

    return 0;
  };

  const percentage = getCapturedPercentage();

  // Determinar se a captação está concluída (100%)
  const isCompleted = parseFloat(percentage) >= 100;

  // Definir status e cor da barra baseado no percentual
  const finalStatus = isCompleted ? 'completed' : capturedStatus;
  const progressBarColor = isCompleted ? 'bg-green-600' : 'bg-blue-600';

  return (
    <div
      onClick={handleClick}
      className="flex w-full md:w-[22.125rem] h-auto cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex-col items-center justify-center gap-5 hover:shadow-lg transition-shadow"
    >
        {/* Cabeçalho: Nome + Company | Code + Qtd. */}
        <div className="flex flex-row justify-between items-start w-full">
          {/* Logo + Nome + Company */}
          <div className="flex flex-row items-start gap-2.5">
            <div
              className="bg-gray-300 dark:bg-gray-700 rounded-full min-w-[35px] w-[35px] h-[35px] bg-cover bg-center flex-shrink-0"
              style={{
                backgroundImage: logoUrl || metadata?.logoUrl ? `url(${logoUrl || metadata?.logoUrl})` : 'none'
              }}
            />
            <div className="flex flex-col justify-start items-start">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {displayIssuerName}
              </span>
            </div>
          </div>

          {/* Code + Quantidade */}
          <div className="flex flex-col justify-start items-end">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {productCode}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {displayAmount()}
            </span>
          </div>
        </div>

        {/* Banner - sempre mostrar */}
        <div className="flex flex-row justify-center items-center w-full">
          <div
            className="w-full h-[110px] rounded-2xl bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: (bannerUrl || metadata?.bannerUrl)
                ? `url(${bannerUrl || metadata?.bannerUrl})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          />
        </div>

        {/* Informações Financeiras */}
        <div className="flex flex-col justify-center items-center w-full gap-3 px-2">
          {/* Rentabilidade mensal */}
          <div className="flex flex-row justify-between gap-1 items-center w-full">
            <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
              {t('productCard.monthlyRentability')}
            </span>
            <span className="flex flex-row justify-center items-center text-sm font-semibold text-green-600">
              {displayRentability}
              {hasTooltip && (
                <Tooltip
                  content={displayTooltip}
                  placement="top"
                  theme="dark"
                  maxWidth={400}
                  interactive={false}
                >
                  <Info className="w-4 h-4 ml-1 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                </Tooltip>
              )}
            </span>
          </div>

          {/* Equivalente CDI */}
          <div className="flex flex-row justify-between gap-1 items-center w-full">
            <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
              {t('productCard.equivalentTo')}
            </span>
            <span className="flex flex-row justify-center items-center text-sm font-semibold text-gray-700 dark:text-white">
              {displayEquivalentCDI()}
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
                <Info className="w-4 h-4 ml-1 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
              </Tooltip>
            </span>
          </div>

          {/* Tipo do ativo */}
          <div className="flex flex-row justify-between gap-1 items-center w-full">
            <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
              {t('productCard.assetType')}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-white">
              {getAssetTypeText(assetType || metadata?.assetType)}
            </span>
          </div>

          {/* Vencimento */}
          <div className="flex flex-row justify-between gap-1 items-center w-full">
            <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
              {t('productCard.maturity')}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-white">
              {formatDate(maturityDate || metadata?.maturityDate)}
            </span>
          </div>

          {/* Remuneração */}
          <div className="flex flex-row justify-between gap-1 items-center w-full">
            <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
              {t('productCard.remuneration')}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-white">
              {getPaymentFrequencyText()}
            </span>
          </div>
        </div>

        {/* Status + Barra de Captação */}
        <div className="w-full flex gap-3 items-center">
          <span className={`text-xs px-3 py-1 font-semibold w-36 h-7 flex items-center justify-center rounded-lg ${getStatusBadgeColor(finalStatus)}`}>
            {getStatusText(finalStatus)}
          </span>
          <div className="w-full">
            <div className="mb-1">
              <p className="text-[10px] font-normal text-gray-900 dark:text-white/90">
                {percentage}% {t('productCard.captured')}
              </p>
            </div>
            <div className="bg-gray-300 dark:bg-gray-700 h-2 w-full rounded-full relative">
              <div
                className={`rounded-full ${progressBarColor} h-2 absolute`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer: Investimento mínimo + Botão Investir */}
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-col justify-center items-start w-1/2 pl-2">
            <span className="text-sm font-normal text-gray-900 dark:text-gray-400">
              {t('productCard.minInvestment')}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-400">
              {formatTokenAmount(minInvestment || metadata?.minInvestment, symbol || metadata?.symbol)}
            </span>
          </div>
          <div className="flex flex-col justify-center items-end w-1/2">
            <button
              className="text-sm font-semibold w-[120px] h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex flex-row justify-center items-center gap-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {t('productCard.investButton')}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
    </div>
  );
};

export default InvestmentProductCard;

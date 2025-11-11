"use client";
import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  TrendingUp,
  Clock,
  Percent,
  Award,
  Info,
  Loader2
} from 'lucide-react';
import Image from '@/components/ui/Image';
import stakeContractsService from '@/services/stakeContractsService';
import { useAuth } from '@/hooks/useAuth';
import { useAlertContext } from '@/contexts/AlertContext';
import { useTranslation } from '@/hooks/useTranslation';

const StakeTab = () => {
  const { t } = useTranslation('investments');
  const { user } = useAuth();
  const { showError } = useAlertContext();
  const [loading, setLoading] = useState(true);
  const [publicStakeContracts, setPublicStakeContracts] = useState([]);


  useEffect(() => {
    loadPublicStakeContracts();
  }, [user]);

  const loadPublicStakeContracts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Limpar cache se forceRefresh
      if (forceRefresh) {
        stakeContractsService.clearCache();
      }
      
      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;
      
      const result = await stakeContractsService.categorizeStakeContracts(userAddress, forceRefresh);

      // Validar resultado antes de definir estado e filtrar apenas stakes tradicionais
      if (result && Array.isArray(result.publicStakes)) {
        // Filtrar apenas contratos com investment_type = 'stake' ou sem tipo definido (para compatibilidade)
        const stakeOnlyContracts = result.publicStakes.filter(contract =>
          contract.metadata?.investment_type === 'stake' ||
          !contract.metadata?.investment_type // Manter contratos sem tipo definido por compatibilidade
        );
        setPublicStakeContracts(stakeOnlyContracts);
      } else {
        console.warn('Invalid result from categorizeStakeContracts:', result);
        setPublicStakeContracts([]);
      }
    } catch (error) {
      console.error('Error loading public stake contracts:', error);
      setPublicStakeContracts([]); // Garantir estado válido em caso de erro
      showError(t('stake.errors.loadContracts'));
    } finally {
      setLoading(false);
    }
  };

  const formatContractToStakeOption = (contract) => {
    // Validar dados do contrato
    if (!contract || typeof contract !== 'object') {
      console.warn('Invalid contract for stake option formatting:', contract);
      return null;
    }

    // Usar o símbolo do token obtido do backend
    const tokenSymbol = contract.symbol || 'STAKE';
    
    console.log(`📋 [StakeTab] Formatando contrato: ${contract.name}, Token: ${tokenSymbol}`, {
      contractAddress: contract.address,
      tokenAddress: contract.tokenAddress,
      symbol: contract.symbol
    });

    return {
      title: contract.name || 'Unknown Contract',
      subtitle: '(Smart Contract)',
      risk: t('stake.risk.variable'),
      riskLevel: 2,
      currency: tokenSymbol, // Usar o símbolo correto do token
      receivableInteger: '0',
      receivableDecimals: '00',
      quarterlyReturn: t('stake.risk.variable'),
      stakedInteger: '0',
      stakedDecimals: '00',
      distributedInteger: '0',
      distributedDecimals: '000000',
      vencimento: t('stake.noDeadline'),
      disponivel: 'N/A',
      aliquota: 'N/A',
      type: 'contract',
      contractAddress: contract.address || '',
      tokenAddress: contract.tokenAddress || '',
      network: contract.network || ''
    };
  };

  // Usar apenas contratos de stake reais com validação
  const allStakeOptions = publicStakeContracts
    .map(formatContractToStakeOption)
    .filter(option => option !== null); // Filtrar opções inválidas

  const getRiskBadge = (risk) => {
    const colors = {
      [t('stake.risk.low')]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      [t('stake.risk.medium')]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      [t('stake.risk.high')]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      [t('stake.risk.variable')]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[risk] || colors[t('stake.risk.variable')]}`}>
        {risk}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('stake.title')}</h2>
            <p className="text-purple-100">
              {t('stake.subtitle')}
            </p>
          </div>
          <Award size={48} className="text-purple-200" />
        </div>
      </div>

      {/* Stake Options Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {t('stake.loading')}
          </span>
        </div>
      ) : allStakeOptions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {allStakeOptions.map((option, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {option.subtitle}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-purple-500 to-indigo-600`}>
                  <Image 
                    src={`assets/images/currencies/${option.currency}.png`} 
                    alt={option.currency}
                    fallback={
                      <span className="text-sm font-bold text-white">
                        {option.currency.slice(0, 3)}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Receivable Amount */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">
                    {t('stake.card.toReceive')}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {option.receivableInteger}
                    </span>
                    <span className="text-lg">,</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {option.receivableDecimals}
                    </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {option.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('stake.card.risk')}</span>
                  {getRiskBadge(option.risk)}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Percent size={14} className="mr-1" />
                    {t('stake.card.quarterlyReturn')}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {option.quarterlyReturn}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {t('stake.card.maturity')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.vencimento}
                  </span>
                </div>

                {/* <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Alíquota:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.aliquota}
                  </span>
                </div> */}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('stake.card.available')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.disponivel} {option.currency}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('stake.card.inStake')}</span>
                  <div className="flex items-baseline">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {option.stakedInteger}
                    </span>
                    <span className="text-xs">,</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {option.stakedDecimals}
                    </span>
                    <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                      {option.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                  <Lock size={16} className="mr-1" />
                  {t('stake.card.stakeButton')}
                </button>
                <button className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors">
                  <Unlock size={16} className="mr-1" />
                  {t('stake.card.withdrawButton')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <Award className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('stake.empty.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('stake.empty.description')}
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-200 mb-2">
              {t('stake.infoCard.title')}
            </h3>
            <div className="text-sm text-indigo-700 dark:text-indigo-300 space-y-2">
              <p>
                {t('stake.infoCard.description')}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('stake.infoCard.benefit1')}</li>
                <li>{t('stake.infoCard.benefit2')}</li>
                <li>{t('stake.infoCard.benefit3')}</li>
                <li>{t('stake.infoCard.benefit4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeTab;
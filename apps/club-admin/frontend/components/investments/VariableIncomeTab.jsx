"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import InvestmentProductCard from './InvestmentProductCard';
import stakeContractsService from '@/services/stakeContractsService';
import { useAuth } from '@/hooks/useAuth';

const VariableIncomeTab = () => {
  const { t } = useTranslation('investments');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadVariableIncomeProducts();
  }, [user]);

  const loadVariableIncomeProducts = async () => {
    try {
      setLoading(true);
      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

      // Buscar contratos públicos categorizados como "Renda Variável Digital"
      const result = await stakeContractsService.categorizeStakeContracts(userAddress);

      // Filtrar contratos que sejam públicos e com investment_type = 'variable'
      const variableIncomeContracts = (result.publicStakes || []).filter(contract =>
        contract.metadata?.investment_type === 'variable'
      );

      // Mapear para o formato esperado pelo card
      const mappedProducts = variableIncomeContracts.map(contract => ({
        id: contract.address,
        contractAddress: contract.address,
        name: contract.name || 'Produto Renda Variável',
        symbol: contract.symbol || 'TOKEN',
        code: contract.metadata?.code || null,
        issuer: contract.metadata?.issuer || 'Emissor',
        companyId: contract.companyId || contract.metadata?.companyId || null,
        logoUrl: contract.metadata?.logoUrl || null,
        bannerUrl: contract.metadata?.bannerUrl || null,
        rentabilityRange: contract.metadata?.rentabilityRange || '2% - 3% a.m',
        equivalentCDI: contract.metadata?.equivalentCDI || 'Variável',
        assetType: contract.metadata?.assetType || 'Imobiliário',
        paymentFrequency: contract.metadata?.paymentFrequency || 'Trimestral',
        maturityDate: contract.metadata?.maturityDate || null,
        market: contract.metadata?.market || 'Primário',
        minInvestment: contract.minValueStake || 25,
        maxStake: contract.metadata?.maxStake || null,
        totalEmission: contract.metadata?.totalEmission || null,
        status: contract.metadata?.status || 'active',
        investment_type: contract.metadata?.investment_type || 'variable',
        network: contract.network,
        metadata: contract.metadata
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading variable income products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid de produtos */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('variableIncome.empty.title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('variableIncome.empty.description')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <InvestmentProductCard
                key={product.contractAddress}
                product={product}
                type="variable"
              />
            ))}
          </div>

          {/* Info Card - Movido para baixo */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  {t('variableIncome.infoCard.title')}
                </h3>
                <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                  <p>
                    {t('variableIncome.infoCard.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VariableIncomeTab;
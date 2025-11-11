"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import InvestmentProductCard from './InvestmentProductCard';
import stakeContractsService from '@/services/stakeContractsService';
import { useAuth } from '@/hooks/useAuth';

const FixedIncomeTab = () => {
  const { t } = useTranslation('investments');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadFixedIncomeProducts();
  }, [user]);

  const loadFixedIncomeProducts = async () => {
    try {
      setLoading(true);
      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

      // Buscar contratos públicos categorizados como "Renda Fixa Digital"
      const result = await stakeContractsService.categorizeStakeContracts(userAddress);

      // Filtrar contratos que sejam públicos e com investment_type = 'fixed'
      const fixedIncomeContracts = (result.publicStakes || []).filter(contract =>
        contract.metadata?.investment_type === 'fixed'
      );

      // Mapear para o formato esperado pelo card
      const mappedProducts = fixedIncomeContracts.map(contract => ({
        id: contract.address,
        contractAddress: contract.address,
        name: contract.name || 'Produto Renda Fixa',
        symbol: contract.symbol || 'TOKEN',
        code: contract.metadata?.code || null,
        issuer: contract.metadata?.issuer || 'Emissor',
        companyId: contract.companyId || contract.metadata?.companyId || null,
        logoUrl: contract.metadata?.logoUrl || null,
        bannerUrl: contract.metadata?.bannerUrl || null,
        rentability: contract.metadata?.rentability || '1.5% a.m',
        equivalentCDI: contract.metadata?.equivalentCDI || '123% do CDI',
        assetType: contract.metadata?.assetType || 'Recebível',
        paymentFrequency: contract.metadata?.paymentFrequency || 'Mensal',
        maturityDate: contract.metadata?.maturityDate || null,
        market: contract.metadata?.market || 'Primário',
        minInvestment: contract.minValueStake || 25,
        maxStake: contract.metadata?.maxStake || null,
        totalEmission: contract.metadata?.totalEmission || null,
        status: contract.metadata?.status || 'active',
        investment_type: contract.metadata?.investment_type || 'fixed',
        network: contract.network,
        metadata: contract.metadata
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading fixed income products:', error);
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
            {t('fixedIncome.empty.title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('fixedIncome.empty.description')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <InvestmentProductCard
                key={product.contractAddress}
                product={product}
                type="fixed"
              />
            ))}
          </div>

          {/* Info Card - Movido para baixo */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  {t('fixedIncome.infoCard.title')}
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>
                    {t('fixedIncome.infoCard.description')}
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

export default FixedIncomeTab;
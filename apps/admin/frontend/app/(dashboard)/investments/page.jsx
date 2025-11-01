"use client";
import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Bitcoin,
  Shield,
  Activity,
  Lock,
  Layers
} from 'lucide-react';
import CryptoTab from '@/components/investments/CryptoTab';
import FixedIncomeTab from '@/components/investments/FixedIncomeTab';
import VariableIncomeTab from '@/components/investments/VariableIncomeTab';
import PrivateOffersTab from '@/components/investments/PrivateOffersTab';
import StakeTab from '@/components/investments/StakeTab';
import PortfolioSummary from '@/components/partials/widget/PortfolioSummary';
import DigitalAssetsCard from '@/components/partials/widget/DigitalAssetsCard';
import { useTranslation } from '@/hooks/useTranslation';

const InvestmentsPage = () => {
  const { t } = useTranslation('investments');
  const [selectedTab, setSelectedTab] = useState('portfolio');

  const opportunitiesData = [
    {
      id: 1,
      name: 'Solana',
      symbol: 'SOL',
      price: 'R$ 145,30',
      change24h: '+8.45%',
      trend: 'up',
      marketCap: 'R$ 62.4B',
      description: t('opportunities.solana.description')
    },
    {
      id: 2,
      name: 'Chainlink',
      symbol: 'LINK',
      price: 'R$ 72,80',
      change24h: '+3.21%',
      trend: 'up',
      marketCap: 'R$ 41.2B',
      description: t('opportunities.chainlink.description')
    },
    {
      id: 3,
      name: 'Polygon',
      symbol: 'MATIC',
      price: 'R$ 4,15',
      change24h: '+6.78%',
      trend: 'up',
      marketCap: 'R$ 38.7B',
      description: t('opportunities.polygon.description')
    }
  ];

  const totalPortfolioValue = 13116.04;

  const tabs = [
    { id: 'portfolio', label: t('tabs.portfolio'), icon: PieChart },
    // { id: 'crypto', label: t('tabs.crypto'), icon: Bitcoin },
    { id: 'fixed', label: t('tabs.fixed'), icon: Shield },
    { id: 'variable', label: t('tabs.variable'), icon: Activity },
    { id: 'private', label: t('tabs.private'), icon: Lock },
    // { id: 'stake', label: t('tabs.stake'), icon: Layers },
    // { id: 'opportunities', label: t('tabs.opportunities'), icon: TrendingUp },
    // { id: 'analysis', label: t('tabs.analysis'), icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        {/* <Button className="btn-brand">
          <Plus size={16} className="mr-2" />
          {t('newInvestmentButton')}
        </Button> */}
      </div>

      {/* Resumo do Portfólio */}
      <div className="">
        <PortfolioSummary />
      </div>

      {/* Tabs - Desktop Grid Layout */}
      <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center justify-center flex-1 py-2 px-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tabs - Mobile/Tablet Scrollable */}
      <div className="lg:hidden border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <nav className="flex space-x-2 overflow-x-auto scrollbar-hide pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} className="mr-1.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {selectedTab === 'portfolio' && (
        <div className="w-full">
          <DigitalAssetsCard />
        </div>
      )}

      {selectedTab === 'opportunities' && (
        <Card title={t('opportunities.title')} icon="heroicons-outline:star">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunitiesData.map((opportunity) => (
              <div key={opportunity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{opportunity.name}</h3>
                    <p className="text-sm text-gray-500">{opportunity.symbol}</p>
                  </div>
                  <div className={`flex items-center text-sm ${opportunity.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {opportunity.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="ml-1">{opportunity.change24h}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('opportunities.price')}:</span>
                    <span className="text-sm font-medium">{opportunity.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('opportunities.marketCap')}:</span>
                    <span className="text-sm font-medium">{opportunity.marketCap}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">{opportunity.description}</p>
                <Button size="sm" className="w-full btn-brand">
                  {t('opportunities.investButton')}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedTab === 'analysis' && (
        <Card title={t('analysis.title')} icon="heroicons-outline:chart-bar">
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('analysis.inDevelopment')}
            </h3>
            <p className="text-gray-500">
              {t('analysis.description')}
            </p>
          </div>
        </Card>
      )}

      {/* New Tabs Content */}
      {selectedTab === 'crypto' && <CryptoTab />}
      {selectedTab === 'fixed' && <FixedIncomeTab />}
      {selectedTab === 'variable' && <VariableIncomeTab />}
      {selectedTab === 'private' && <PrivateOffersTab />}
      {selectedTab === 'stake' && <StakeTab />}
    </div>
  );
};

export default InvestmentsPage;
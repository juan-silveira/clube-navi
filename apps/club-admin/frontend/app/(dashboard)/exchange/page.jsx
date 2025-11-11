"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

const ExchangePage = () => {
  const { t } = useTranslation('exchange');
  const router = useRouter();

  const handleModeSelect = (mode) => {
    router.push(`/exchange/${mode}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('selectionPage.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('selectionPage.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Market Option */}
          <button
            onClick={() => handleModeSelect('market')}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon icon="heroicons:bolt" className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('selectionPage.market.title')}</h2>
              <p className="text-gray-300 text-sm">
                {t('selectionPage.market.subtitle')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/0 to-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Order Book Option */}
          <button
            onClick={() => handleModeSelect('book')}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon icon="heroicons:chart-bar" className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('selectionPage.limit.title')}</h2>
              <p className="text-gray-300 text-sm">
                {t('selectionPage.limit.subtitle')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/0 to-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Icon icon="heroicons:information-circle" className="inline w-4 h-4 mr-1" />
            <span dangerouslySetInnerHTML={{ __html: t('selectionPage.helpText') }} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
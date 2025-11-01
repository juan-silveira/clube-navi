"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/ui/Icon';

const HelpPage = () => {
  const router = useRouter();
  const { t } = useTranslation('help');

  const handleOptionSelect = (option) => {
    router.push(`/help/${option}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-6xl w-full px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('home.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tutoriais */}
          <button
            onClick={() => handleOptionSelect('tutorials')}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon icon="heroicons:academic-cap" className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('home.tutorials.title')}</h2>
              <p className="text-blue-100 text-sm">
                {t('home.tutorials.description')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/0 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Perguntas Frequentes */}
          <button
            onClick={() => handleOptionSelect('faq')}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon icon="heroicons:chat-bubble-bottom-center-text" className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('home.faq.title')}</h2>
              <p className="text-purple-100 text-sm">
                {t('home.faq.description')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-700/0 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Falar com Suporte */}
          {/* <button
            onClick={() => handleOptionSelect('support')}
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon icon="heroicons:lifebuoy" className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Suporte</h2>
              <p className="text-green-100 text-sm">
                Fale diretamente com nossa equipe
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-700/0 to-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button> */}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Icon icon="heroicons:information-circle" className="inline w-4 h-4 mr-1" />
            {t('home.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

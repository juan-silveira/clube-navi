"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import { useFAQData } from './useFAQData';

const FAQPage = () => {
  const router = useRouter();
  const { t } = useTranslation('help');
  const { categories, faqs } = useFAQData();
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800'
    };
    return colors[color] || colors.blue;
  };

  // Filtrar FAQs por busca
  const filteredFaqs = searchQuery
    ? Object.entries(faqs).flatMap(([category, questions]) =>
        questions
          .map((faq, index) => ({ ...faq, category, originalIndex: index }))
          .filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : faqs[activeCategory]?.map((faq, index) => ({ ...faq, originalIndex: index })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/help')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('faq.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('faq.subtitle')}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('faq.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeCategory === category.id
                  ? `${getCategoryColor(category.color)} shadow-md`
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon icon={category.icon} className="w-4 h-4" />
              {category.label}
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                activeCategory === category.id
                  ? 'bg-white/30 dark:bg-black/20'
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}>
                {faqs[category.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search Results Header */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icon icon="heroicons:magnifying-glass" className="w-4 h-4" />
          <span>
            {filteredFaqs.length} {filteredFaqs.length !== 1 ? t('faq.searchResultsPlural') : t('faq.searchResults')} {filteredFaqs.length !== 1 ? t('faq.searchFoundPlural') : t('faq.searchFound')} {t('faq.searchFor')} "{searchQuery}"
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="ml-auto text-blue-500 hover:text-blue-600 font-medium"
          >
            {t('faq.clearSearch')}
          </button>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <Icon icon="heroicons:question-mark-circle" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('faq.noResults.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('faq.noResults.description')}
              </p>
              <button
                onClick={() => router.push('/help/support')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                {t('faq.noResults.button')}
              </button>
            </div>
          </Card>
        ) : (
          filteredFaqs.map((faq, index) => (
            <Card key={`${faq.category}-${faq.originalIndex}`} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Icon
                      icon="heroicons:question-mark-circle"
                      className="w-5 h-5 text-blue-600 dark:text-blue-300"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {faq.question}
                  </h3>
                  {searchQuery && faq.category && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Categoria: {categories.find(c => c.id === faq.category)?.label || faq.category}
                    </span>
                  )}
                </div>
                <Icon
                  icon={openIndex === index ? "heroicons:chevron-up" : "heroicons:chevron-down"}
                  className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200"
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="pt-4 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>

                    {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('faq.relatedLinks')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {faq.relatedLinks.map((link, linkIndex) => (
                            <button
                              key={linkIndex}
                              onClick={() => router.push(link.path)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-200"
                            >
                              <Icon icon="heroicons:arrow-right" className="w-4 h-4" />
                              {link.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Icon icon="heroicons:academic-cap" className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('faq.quickActions.tutorials.title')}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('faq.quickActions.tutorials.description')}
            </p>
            <button
              onClick={() => router.push('/help/tutorials')}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Icon icon="heroicons:play" className="w-5 h-5" />
              {t('faq.quickActions.tutorials.button')}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FAQPage;

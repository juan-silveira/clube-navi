'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentLanguage === lang.code
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={lang.name}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.code.split('-')[0].toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

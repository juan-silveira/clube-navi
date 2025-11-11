"use client";
import React from 'react';
import Card from '@/components/ui/Card';
import Textinput from '@/components/ui/Textinput';
import Select from '@/components/ui/Select';
import { useTranslation } from '@/hooks/useTranslation';

const GeneralTab = ({ settings, handleInputChange, handleToggle }) => {
  const { t } = useTranslation('systemSettings');

  const timezones = [
    { value: 'America/Sao_Paulo', label: t('general.timezones.saoPaulo') },
    { value: 'America/New_York', label: t('general.timezones.newYork') },
    { value: 'Europe/London', label: t('general.timezones.london') },
    { value: 'Asia/Tokyo', label: t('general.timezones.tokyo') }
  ];

  const languages = [
    { value: 'pt-BR', label: t('general.languages.ptBR') },
    { value: 'en-US', label: t('general.languages.enUS') },
    { value: 'es-ES', label: t('general.languages.esES') }
  ];

  const currencies = [
    { value: 'BRL', label: t('general.currencies.brl') },
    { value: 'USD', label: t('general.currencies.usd') },
    { value: 'EUR', label: t('general.currencies.eur') }
  ];

  return (
    <Card title={t('general.sectionTitle')} icon="heroicons-outline:cog-6-tooth">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textinput
            label={t('general.platformName')}
            value={settings.general.platformName}
            onChange={(e) => handleInputChange('general', 'platformName', e.target.value)}
            required
          />
          <Textinput
            label={t('general.description')}
            value={settings.general.platformDescription}
            onChange={(e) => handleInputChange('general', 'platformDescription', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label={t('general.timezone')}
            options={timezones}
            value={settings.general.timezone}
            onChange={(value) => handleInputChange('general', 'timezone', value)}
          />
          <Select
            label={t('general.defaultLanguage')}
            options={languages}
            value={settings.general.language}
            onChange={(value) => handleInputChange('general', 'language', value)}
          />
          <Select
            label={t('general.mainCurrency')}
            options={currencies}
            value={settings.general.currency}
            onChange={(value) => handleInputChange('general', 'currency', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{t('general.maintenanceMode')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('general.maintenanceModeDescription')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.maintenanceMode}
              onChange={() => handleToggle('general', 'maintenanceMode')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </Card>
  );
};

export default GeneralTab;

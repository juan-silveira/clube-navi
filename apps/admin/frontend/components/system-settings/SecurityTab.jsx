"use client";
import React from 'react';
import Card from '@/components/ui/Card';
import Textinput from '@/components/ui/Textinput';
import { useTranslation } from '@/hooks/useTranslation';

const SecurityTab = ({ settings, handleInputChange, handleToggle }) => {
  const { t } = useTranslation('systemSettings');

  return (
    <Card title={t('security.sectionTitle')} icon="heroicons-outline:shield-check">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textinput
            label={t('security.passwordMinLength')}
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
            min="6"
            max="20"
          />
          <Textinput
            label={t('security.maxLoginAttempts')}
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            min="3"
            max="10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textinput
            label={t('security.sessionTimeout')}
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
            min="5"
            max="120"
          />
          <Textinput
            label={t('security.apiRateLimit')}
            type="number"
            value={settings.security.apiRateLimit}
            onChange={(e) => handleInputChange('security', 'apiRateLimit', parseInt(e.target.value))}
            min="10"
            max="1000"
          />
        </div>

        <Textinput
          label={t('security.ipWhitelist')}
          value={settings.security.ipWhitelist}
          onChange={(e) => handleInputChange('security', 'ipWhitelist', e.target.value)}
          placeholder={t('security.ipWhitelistPlaceholder')}
        />

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{t('security.twoFactorRequired')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('security.twoFactorRequiredDescription')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.twoFactorRequired}
              onChange={() => handleToggle('security', 'twoFactorRequired')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </Card>
  );
};

export default SecurityTab;

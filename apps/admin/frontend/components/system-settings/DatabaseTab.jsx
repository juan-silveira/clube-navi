"use client";
import React from 'react';
import Card from '@/components/ui/Card';
import Textinput from '@/components/ui/Textinput';
import Select from '@/components/ui/Select';
import { useTranslation } from '@/hooks/useTranslation';

const DatabaseTab = ({ settings, handleInputChange, handleToggle, backupFrequencies }) => {
  const { t } = useTranslation('systemSettings');

  return (
    <Card title={t('database.sectionTitle')} icon="heroicons-outline:server">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t('database.backupFrequency')}
            options={backupFrequencies}
            value={settings.database.backupFrequency}
            onChange={(value) => handleInputChange('database', 'backupFrequency', value)}
          />
          <Textinput
            label={t('database.retentionDays')}
            type="number"
            value={settings.database.retentionDays}
            onChange={(e) => handleInputChange('database', 'retentionDays', parseInt(e.target.value))}
            min="7"
            max="365"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{t('database.autoBackup')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('database.autoBackupDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.database.autoBackup}
                onChange={() => handleToggle('database', 'autoBackup')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{t('database.encryptionEnabled')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('database.encryptionEnabledDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.database.encryptionEnabled}
                onChange={() => handleToggle('database', 'encryptionEnabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DatabaseTab;

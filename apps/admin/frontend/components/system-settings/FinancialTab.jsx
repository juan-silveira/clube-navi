"use client";
import React from 'react';
import Card from '@/components/ui/Card';
import Textinput from '@/components/ui/Textinput';
import { useTranslation } from '@/hooks/useTranslation';

const FinancialTab = ({ settings, handleInputChange }) => {
  const { t } = useTranslation('systemSettings');

  return (
    <Card title={t('financial.sectionTitle')} icon="heroicons-outline:currency-dollar">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Textinput
            label={t('financial.minDeposit')}
            type="number"
            value={settings.financial.minDeposit}
            onChange={(e) => handleInputChange('financial', 'minDeposit', parseFloat(e.target.value))}
            step="0.01"
          />
          <Textinput
            label={t('financial.maxDeposit')}
            type="number"
            value={settings.financial.maxDeposit}
            onChange={(e) => handleInputChange('financial', 'maxDeposit', parseFloat(e.target.value))}
            step="0.01"
          />
          <Textinput
            label={t('financial.minWithdraw')}
            type="number"
            value={settings.financial.minWithdraw}
            onChange={(e) => handleInputChange('financial', 'minWithdraw', parseFloat(e.target.value))}
            step="0.01"
          />
          <Textinput
            label={t('financial.maxWithdraw')}
            type="number"
            value={settings.financial.maxWithdraw}
            onChange={(e) => handleInputChange('financial', 'maxWithdraw', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Textinput
            label={t('financial.transferFee')}
            type="number"
            value={settings.financial.transferFee}
            onChange={(e) => handleInputChange('financial', 'transferFee', parseFloat(e.target.value))}
            step="0.01"
          />
          <Textinput
            label={t('financial.exchangeFee')}
            type="number"
            value={settings.financial.exchangeFee}
            onChange={(e) => handleInputChange('financial', 'exchangeFee', parseFloat(e.target.value))}
            step="0.01"
          />
          <Textinput
            label={t('financial.pixFee')}
            type="number"
            value={settings.financial.pixFee}
            onChange={(e) => handleInputChange('financial', 'pixFee', parseFloat(e.target.value))}
            step="0.01"
          />
          <Textinput
            label={t('financial.tedFee')}
            type="number"
            value={settings.financial.tedFee}
            onChange={(e) => handleInputChange('financial', 'tedFee', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
      </div>
    </Card>
  );
};

export default FinancialTab;

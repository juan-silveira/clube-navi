import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Select from '@/components/ui/Select';
import { useTranslation } from '@/hooks/useTranslation';
import useConfig from '@/hooks/useConfig';
import {
  Edit3,
  CheckCircle,
  XCircle,
  ArrowLeftRight
} from 'lucide-react';
import ExchangesTable from '@/components/partials/table/exchanges-table';

const ExchangesTab = ({
  exchangeForm,
  setExchangeForm,
  showExchangeForm,
  setShowExchangeForm,
  loading,
  handleExchangeSubmit,
  tokens,
  loadingTokens,
  filterTokensByTypeAndNetwork,
  handleExchangeActivate
}) => {
  const { t } = useTranslation('systemSettings');
  const { defaultNetwork } = useConfig();

  return (
    <Card title={t('exchanges.sectionTitle')} icon="heroicons-outline:arrow-left-right">
      <div className="space-y-6">
        {/* Header com botão de adicionar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('exchanges.description', { network: defaultNetwork === 'mainnet' ? t('tokens.network.mainnet') : t('tokens.network.testnet') })}
          </p>
          {!showExchangeForm && (
            <Button
              onClick={() => setShowExchangeForm(true)}
              className="btn-primary"
              icon="heroicons:plus"
              text={t('exchanges.registerExchange')}
            />
          )}
        </div>

        {/* Formulário de registro */}
        {showExchangeForm && (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    {t('exchanges.infoBox.title')}
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {t('exchanges.infoBox.description')}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                  label={t('exchanges.form.contractAddress')}
                  value={exchangeForm.address}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={t('tokens.form.contractAddressPlaceholder')}
                  required
                />
                <Textinput
                  label={t('exchanges.form.network')}
                  value={defaultNetwork === 'mainnet' ? t('tokens.network.mainnet') : t('tokens.network.testnet')}
                  disabled={true}
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                  label={t('exchanges.form.tokenAAddress')}
                  value={exchangeForm.tokenAAddress}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, tokenAAddress: e.target.value }))}
                  placeholder={t('exchanges.form.tokenAPlaceholder')}
                  required
                />
                <Textinput
                  label={t('exchanges.form.tokenBAddress')}
                  value={exchangeForm.tokenBAddress}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, tokenBAddress: e.target.value }))}
                  placeholder={t('exchanges.form.tokenBPlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                  label={t('exchanges.form.pairSymbol')}
                  value={exchangeForm.symbol}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder={t('exchanges.form.pairSymbolPlaceholder')}
                  required
                />
                <Textinput
                  label={t('exchanges.form.exchangeName')}
                  value={exchangeForm.name}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('exchanges.form.exchangeNamePlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('exchanges.form.contractType')}
                  options={[
                    { value: 'exchange', label: t('exchanges.form.contractTypeExchange') }
                  ]}
                  value="exchange"
                  onChange={(value) => setExchangeForm(prev => ({ ...prev, contractType: value }))}
                  disabled={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                  label={t('exchanges.form.adminPublicKey')}
                  value={exchangeForm.adminAddress}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, adminAddress: e.target.value }))}
                  placeholder={t('tokens.form.contractAddressPlaceholder')}
                />
                <Textinput
                  label={t('exchanges.form.website')}
                  value={exchangeForm.website}
                  onChange={(e) => setExchangeForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder={t('exchanges.form.websitePlaceholder')}
                />
              </div>

              {/* Trading Configuration */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t('exchanges.form.tradingConfig')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Textinput
                    label={t('exchanges.form.tradingFee')}
                    value={exchangeForm.metadata.tradingFee}
                    onChange={(e) => setExchangeForm(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, tradingFee: e.target.value }
                    }))}
                    placeholder={t('exchanges.form.tradingFeePlaceholder')}
                    type="number"
                    step="0.01"
                  />
                  <Textinput
                    label={t('exchanges.form.minOrder')}
                    value={exchangeForm.metadata.minOrderSize}
                    onChange={(e) => setExchangeForm(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, minOrderSize: e.target.value }
                    }))}
                    placeholder={t('exchanges.form.minOrderPlaceholder')}
                    type="number"
                  />
                  <Textinput
                    label={t('exchanges.form.maxOrder')}
                    value={exchangeForm.metadata.maxOrderSize}
                    onChange={(e) => setExchangeForm(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, maxOrderSize: e.target.value }
                    }))}
                    placeholder={t('exchanges.form.maxOrderPlaceholder')}
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Textinput
                    label={t('exchanges.form.priceDecimals')}
                    value={exchangeForm.metadata.priceDecimals}
                    onChange={(e) => setExchangeForm(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, priceDecimals: e.target.value }
                    }))}
                    placeholder={t('exchanges.form.priceDecimalsPlaceholder')}
                    type="number"
                    min="0"
                    max="18"
                  />
                  <Textinput
                    label={t('exchanges.form.amountDecimals')}
                    value={exchangeForm.metadata.amountDecimals}
                    onChange={(e) => setExchangeForm(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, amountDecimals: e.target.value }
                    }))}
                    placeholder={t('exchanges.form.amountDecimalsPlaceholder')}
                    type="number"
                    min="0"
                    max="18"
                  />
                </div>
              </div>

              <Textinput
                label={t('exchanges.form.description')}
                value={exchangeForm.description}
                onChange={(e) => setExchangeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('exchanges.form.descriptionPlaceholder')}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => setShowExchangeForm(false)}
                  className="btn-outline-secondary"
                  icon="heroicons:x-mark"
                  text={t('buttons.cancel')}
                />
                <Button
                  onClick={handleExchangeSubmit}
                  className="btn-primary"
                  isLoading={loading}
                  icon="heroicons:check"
                  text={t('buttons.save')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de exchanges - Só exibe quando não está editando/criando */}
        {!showExchangeForm && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('exchanges.registeredExchanges')}
            </h4>

            <ExchangesTable
              exchanges={filterTokensByTypeAndNetwork('exchange')}
              loading={loadingTokens}
              onEdit={(exchange) => {
                setExchangeForm({
                  address: exchange.address || '',
                  baseToken: exchange.metadata?.baseToken || '',
                  quoteToken: exchange.metadata?.quoteToken || '',
                  name: exchange.name || exchange.metadata?.name || '',
                  tradingFee: exchange.metadata?.tradingFee || '0.3',
                  minOrderSize: exchange.metadata?.minOrderSize || '',
                  maxOrderSize: exchange.metadata?.maxOrderSize || '',
                  priceDecimals: exchange.metadata?.priceDecimals || '18',
                  amountDecimals: exchange.metadata?.amountDecimals || '18'
                });
                setShowExchangeForm(true);
              }}
              onToggleActive={(exchange) => handleExchangeActivate(exchange.address, exchange.isActive)}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExchangesTab;

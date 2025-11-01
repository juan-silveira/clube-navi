"use client";
import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import { Coins, Edit3, XCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import useConfig from '@/hooks/useConfig';
import TokensTable from '@/components/partials/table/tokens-table';

const TokensTab = ({
  tokenForm,
  setTokenForm,
  showTokenForm,
  setShowTokenForm,
  loading,
  handleTokenSubmit,
  tokens,
  loadingTokens,
  filterTokensByTypeAndNetwork,
  editingToken,
  setEditingToken,
  handleTokenActivate
}) => {
  const { t } = useTranslation('systemSettings');
  const { defaultNetwork } = useConfig();

  return (
    <Card title={t('tokens.sectionTitle')} icon="heroicons-outline:circle-stack">
      <div className="space-y-6">
        {/* Header com botão de adicionar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('tokens.description', { network: defaultNetwork === 'mainnet' ? t('tokens.network.mainnet') : t('tokens.network.testnet') })}
          </p>
          {!showTokenForm && (
            <Button
              onClick={() => setShowTokenForm(true)}
              className="btn-primary"
              icon="heroicons:plus"
              text={t('tokens.registerToken')}
            />
          )}
        </div>

        {/* Formulário de registro */}
        {showTokenForm && (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Textinput
                  label={t('tokens.form.contractAddress')}
                  value={tokenForm.address}
                  onChange={(e) => setTokenForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={t('tokens.form.contractAddressPlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                  label={t('tokens.form.adminPublicKey')}
                  value={tokenForm.adminAddress}
                  onChange={(e) => setTokenForm(prev => ({ ...prev, adminAddress: e.target.value }))}
                  placeholder={t('tokens.form.adminPublicKeyPlaceholder')}
                />
                <Textinput
                  label={t('tokens.form.website')}
                  value={tokenForm.website}
                  onChange={(e) => setTokenForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder={t('tokens.form.websitePlaceholder')}
                />
              </div>

              <Textinput
                label={t('tokens.form.description')}
                value={tokenForm.description}
                onChange={(e) => setTokenForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('tokens.form.descriptionPlaceholder')}
              />

              <div>
                <label className="form-label">{t('tokens.form.category')}</label>
                <select
                  value={tokenForm.category}
                  onChange={(e) => setTokenForm(prev => ({ ...prev, category: e.target.value }))}
                  className="form-control w-full"
                >
                  <option value="criptomoedas">{t('tokens.form.categories.cryptocurrencies')}</option>
                  <option value="startups">{t('tokens.form.categories.startups')}</option>
                  <option value="utility">{t('tokens.form.categories.utility')}</option>
                  <option value="digital">{t('tokens.form.categories.digital')}</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowTokenForm(false);
                    setEditingToken(null);
                  }}
                  className="btn-outline-secondary"
                  icon="heroicons:x-mark"
                  text={t('buttons.cancel')}
                />
                <Button
                  onClick={handleTokenSubmit}
                  className="btn-primary"
                  isLoading={loading}
                  icon="heroicons:check"
                  text={t('buttons.save')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de tokens - Só exibe quando não está editando/criando */}
        {!showTokenForm && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('tokens.registeredTokens')}
            </h4>

            <TokensTable
              tokens={filterTokensByTypeAndNetwork('token')}
              loading={loadingTokens}
              onEdit={(token) => {
                setEditingToken(token);
                setTokenForm({
                  address: token.address || '',
                  symbol: token.symbol || token.metadata?.symbol || '',
                  name: token.name || token.metadata?.name || '',
                  description: token.metadata?.description || '',
                  category: token.metadata?.category || 'criptomoedas',
                  website: token.metadata?.website || ''
                });
                setShowTokenForm(true);
              }}
              onToggleActive={(token) => handleTokenActivate(token.address, token.isActive)}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default TokensTab;

"use client";
import React, { useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { AlertTriangle, Layers, Link, Edit3, Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import useConfig from '@/hooks/useConfig';
import useAlert from '@/hooks/useAlert';
import api from '@/services/api';
import StakesTable from '@/components/partials/table/stakes-table';
import CdiCalculator from '@/components/investments/CdiCalculator';

const StakesTab = ({
  stakeForm,
  setStakeForm,
  showStakeForm,
  setShowStakeForm,
  loading,
  handleStakeSubmit,
  companies,
  loadingCompanies,
  currentCompany,
  stakeContracts,
  loadingStakeContracts,
  filterStakesByNetwork,
  editingStakeId,
  setEditingStakeId,
  handleStakeActivate,
  issuers = [],
  loadingIssuers = false
}) => {
  const { t, currentLanguage } = useTranslation('systemSettings');
  const { defaultNetwork } = useConfig();
  const { showSuccess, showError } = useAlert();
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [bannerUploadSuccess, setBannerUploadSuccess] = useState(false);

  // Handler para upload de logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingStakeId) return;

    // Resetar status de sucesso
    setLogoUploadSuccess(false);

    // Criar preview local imediatamente para feedback visual instantâneo
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post(`/api/stake-contracts/${editingStakeId}/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Atualizar com a URL do S3
        setStakeForm(prev => ({ ...prev, logoUrl: response.data.data.url }));
        setLogoUploadSuccess(true);
        showSuccess(t('stakes.images.uploadSuccess') || 'Logo enviado com sucesso!');
        // Manter o preview local - será usado até recarregar a página
      }
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      setLogoPreview(null); // Limpar preview apenas em caso de erro
      setLogoUploadSuccess(false);
      showError(error.response?.data?.message || error.message || 'Erro ao fazer upload do logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handler para upload de banner
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingStakeId) return;

    // Resetar status de sucesso
    setBannerUploadSuccess(false);

    // Criar preview local imediatamente para feedback visual instantâneo
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append('banner', file);

      const response = await api.post(`/api/stake-contracts/${editingStakeId}/upload-banner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Atualizar com a URL do S3
        setStakeForm(prev => ({ ...prev, bannerUrl: response.data.data.url }));
        setBannerUploadSuccess(true);
        showSuccess(t('stakes.images.uploadSuccess') || 'Banner enviado com sucesso!');
        // Manter o preview local - será usado até recarregar a página
      }
    } catch (error) {
      console.error('Erro ao fazer upload do banner:', error);
      setBannerPreview(null); // Limpar preview apenas em caso de erro
      setBannerUploadSuccess(false);
      showError(error.response?.data?.message || error.message || 'Erro ao fazer upload do banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Handler para upload de documento
  const handleDocumentUpload = async (e, documentType, documentName) => {
    const file = e.target.files?.[0];
    if (!file || !editingStakeId) return;

    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      formData.append('documentName', documentName);

      const response = await api.post(`/api/stake-contracts/${editingStakeId}/upload-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const currentDocs = stakeForm.documents || [];
        setStakeForm(prev => ({
          ...prev,
          documents: [...currentDocs, response.data.data.document]
        }));
        showSuccess(t('stakes.documents.uploadSuccess') || 'Documento enviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      showError(error.response?.data?.message || error.message || 'Erro ao fazer upload do documento');
    } finally {
      setUploadingDocument(false);
    }
  };

  // Handler para deletar documento
  const handleDeleteDocument = async (index) => {
    if (!editingStakeId || !confirm(t('stakes.documents.confirmDelete') || 'Deseja realmente deletar este documento?')) return;

    try {
      await api.delete(`/api/stake-contracts/${editingStakeId}/documents/${index}`);
      const updatedDocs = (stakeForm.documents || []).filter((_, i) => i !== index);
      setStakeForm(prev => ({ ...prev, documents: updatedDocs }));
      showSuccess(t('stakes.documents.deleteSuccess') || 'Documento deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      showError(error.response?.data?.message || error.message || 'Erro ao deletar documento');
    }
  };

  const tabs = useMemo(() => [
    { id: 'basic', label: t('stakes.tabs.basic'), icon: Layers },
    { id: 'financial', label: t('stakes.tabs.financial'), icon: FileText },
    { id: 'media', label: t('stakes.tabs.media'), icon: ImageIcon },
    { id: 'guarantees', label: t('stakes.tabs.guarantees'), icon: AlertTriangle }
  ], [t, currentLanguage]);

  return (
    <Card title={t('stakes.sectionTitle')} icon="heroicons-outline:server-stack">
      <div className="space-y-6">
        {/* Header com botão de adicionar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('stakes.description', { network: defaultNetwork === 'mainnet' ? t('tokens.network.mainnet') : t('tokens.network.testnet') })}
          </p>
          {!showStakeForm && (
            <Button
              onClick={() => {
                // Abrindo o formulário para novo registro - limpar tudo
                setEditingStakeId(null);
                setLogoPreview(null);
                setBannerPreview(null);
                setLogoUploadSuccess(false);
                setBannerUploadSuccess(false);
                setStakeForm({
                  address: '',
                  tokenAddress: '',
                  network: defaultNetwork || 'testnet',
                  name: '',
                  description: '',
                  adminAddress: '',
                  risk: 1,
                  companyId: currentCompany?.id || '',
                  code: '',
                  investment_type: 'stake',
                  logoUrl: '',
                  bannerUrl: '',
                  issuerId: '',
                  issuer: '',
                  issuerName: '',
                  issuerDescription: '',
                  issuerWebsite: '',
                  issuerFoundationYear: '',
                  issuerLogo: '',
                  rentability: '',
                  rentabilityValue: '',
                  rentabilityRange: '',
                  rentabilityRangeMin: '',
                  rentabilityRangeMax: '',
                  rentabilityTooltip: '',
                  rentabilityRangeTooltip: '',
                  equivalentCDI: '',
                  cdiRate: '',
                  cdiCalculationDate: '',
                  cdiProfitabilityUsed: '',
                  cdiProfitabilitySource: '',
                  assetType: '',
                  maturityDate: '',
                  paymentFrequency: '',
                  minInvestment: '',
                  totalEmission: '',
                  tokenSymbol: '',
                  guarantees: '',
                  risks: '',
                  blockchainNetwork: '',
                  registryInfo: ''
                });
                setShowStakeForm(true);
                setActiveTab('basic'); // Reset tab quando abrir
              }}
              className="btn-primary"
              icon="heroicons:plus"
              text={t('stakes.registerContract')}
            />
          )}
        </div>

        {/* Formulário de registro de stake */}
        {showStakeForm && (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
            {/* Indicador de modo de edição */}
            {editingStakeId && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t('stakes.editingContract') || 'Editando Contrato'}: {stakeForm.name}
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {t('stakes.editingNote') || 'Você está editando um contrato existente. As alterações serão salvas sem criar um novo contrato.'}
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-2 overflow-x-auto scrollbar-hide pb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.label}
                      className={`
                        flex items-center whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      <Icon size={16} className="mr-1.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            <div className="space-y-4">
              {/* ABA 1: DADOS BÁSICOS */}
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textinput
                      label={t('stakes.form.stakeContractAddress')}
                      value={stakeForm.address}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder={t('tokens.form.contractAddressPlaceholder')}
                      required
                      disabled={!!editingStakeId}
                      className={editingStakeId ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
                    />
                    <Textinput
                      label={t('stakes.form.tokenAddress')}
                      value={stakeForm.tokenAddress}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, tokenAddress: e.target.value }))}
                      placeholder={t('tokens.form.contractAddressPlaceholder')}
                      required
                      disabled={!!editingStakeId}
                      className={editingStakeId ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textinput
                      label={t('stakes.form.network')}
                      value={defaultNetwork === 'mainnet' ? t('tokens.network.mainnet') : t('tokens.network.testnet')}
                      disabled={true}
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                    <Textinput
                      label={t('stakes.form.contractName')}
                      value={stakeForm.name}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('stakes.form.contractNamePlaceholder')}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Textinput
                      label={t('stakes.form.productCode') || 'Código do Produto'}
                      value={stakeForm.code || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, code: e.target.value }))}
                      placeholder={t('stakes.form.productCodePlaceholder') || 'Ex: FTR3'}
                    />
                    <Select
                      label={t('stakes.form.investmentType') || 'Tipo de Investimento'}
                      options={[
                        { value: 'stake', label: t('stakes.form.investmentTypes.stake') || 'Stake Tradicional' },
                        { value: 'private_offer', label: t('stakes.form.investmentTypes.privateOffer') || 'Oferta Privada' },
                        { value: 'fixed', label: t('stakes.form.investmentTypes.fixed') || 'Renda Fixa Digital' },
                        { value: 'variable', label: t('stakes.form.investmentTypes.variable') || 'Renda Variável Digital' },
                        { value: 'pratique', label: t('stakes.form.investmentTypes.pratique') || 'Pedacinho Pratique' }
                      ]}
                      value={stakeForm.investment_type || 'stake'}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, investment_type: e.target.value }))}
                    />
                    <div>
                      <Select
                        label={t('stakes.form.company')}
                        options={[
                          {
                            value: '',
                            label: companies.filter(c => c.isActive).length === 0
                              ? t('stakes.form.noActiveCompanies')
                              : t('stakes.form.selectCompany')
                          },
                          ...companies
                            .filter(c => c.isActive)
                            .map(c => ({
                              value: c.id,
                              label: c.name
                            }))
                        ]}
                        value={stakeForm.companyId}
                        onChange={(e) => setStakeForm(prev => ({ ...prev, companyId: e.target.value }))}
                        required
                        disabled={loadingCompanies}
                      />
                      {companies.filter(c => c.isActive).length === 0 && !loadingCompanies && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          {t('stakes.form.noActiveCompaniesWarning')}
                        </p>
                      )}
                      {stakeForm.companyId && currentCompany?.id === stakeForm.companyId && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {t('stakes.form.currentCompanySelected')}
                        </p>
                      )}
                    </div>
                  </div>

                  <Select
                    label={t('stakes.form.selectIssuer') || 'Emissor'}
                    options={[
                      { value: '', label: t('stakes.form.selectIssuerPlaceholder') || 'Selecione um emissor' },
                      ...issuers.filter(issuer => issuer.isActive).map(issuer => ({
                        value: issuer.id,
                        label: issuer.name
                      }))
                    ]}
                    value={stakeForm.issuerId || ''}
                    onChange={(e) => {
                      const issuerId = e.target.value;
                      const selectedIssuer = issuers.find(i => i.id === issuerId);

                      if (selectedIssuer) {
                        setStakeForm(prev => ({
                          ...prev,
                          issuerId: issuerId,
                          issuerName: selectedIssuer.name,
                          issuerWebsite: selectedIssuer.website || '',
                          issuerDescription: selectedIssuer.description || '',
                          issuerFoundationYear: selectedIssuer.foundationYear || '',
                          issuerLogo: selectedIssuer.logoUrl || ''
                        }));
                      } else {
                        setStakeForm(prev => ({
                          ...prev,
                          issuerId: '',
                          issuerName: '',
                          issuerWebsite: '',
                          issuerDescription: '',
                          issuerFoundationYear: '',
                          issuerLogo: ''
                        }));
                      }
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textinput
                      label={t('stakes.form.adminAddress')}
                      value={stakeForm.adminAddress}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, adminAddress: e.target.value }))}
                      placeholder={t('tokens.form.contractAddressPlaceholder')}
                    />
                    <Select
                      label={t('stakes.form.riskLevel')}
                      options={[
                        { value: '0', label: t('stakes.form.riskLevels.veryLow') },
                        { value: '1', label: t('stakes.form.riskLevels.low') },
                        { value: '2', label: t('stakes.form.riskLevels.medium') },
                        { value: '3', label: t('stakes.form.riskLevels.high') },
                        { value: '4', label: t('stakes.form.riskLevels.veryHigh') }
                      ]}
                      value={stakeForm.risk ? stakeForm.risk.toString() : '1'}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, risk: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <Textarea
                      label={t('stakes.form.description')}
                      value={stakeForm.description}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('stakes.form.descriptionPlaceholder')}
                      rows={5}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Use \n\n para criar parágrafos ou \n para quebra de linha simples
                    </p>
                  </div>
                </>
              )}

              {/* ABA 2: INFORMAÇÕES FINANCEIRAS */}
              {activeTab === 'financial' && (
                <>
                  {/* Calculadora de CDI */}
                  <CdiCalculator
                    stakeForm={stakeForm}
                    setStakeForm={setStakeForm}
                    editingStakeId={editingStakeId}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rentabilidade (Renda Fixa) - Separar valor numérico e exibição */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('stakes.financialInfo.rentability') || 'Rentabilidade (Renda Fixa)'}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Textinput
                          label={`${t('stakes.financialInfo.rentabilityValue') || 'Valor (%)'} ${t('stakes.financialInfo.monthSuffix') || 'a.m.'}`}
                          type="number"
                          step="0.01"
                          value={stakeForm.rentabilityValue || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const monthSuffix = t('stakes.financialInfo.monthSuffix') || 'a.m.';
                            setStakeForm(prev => ({
                              ...prev,
                              rentabilityValue: value,
                              // Auto-atualizar a string de display
                              rentability: value ? `${parseFloat(value).toFixed(2)}% ${monthSuffix}` : ''
                            }));
                          }}
                          placeholder="1.25"
                        />
                        <Textinput
                          label={t('stakes.financialInfo.rentabilityDisplay') || 'Exibição'}
                          value={stakeForm.rentability || ''}
                          onChange={(e) => setStakeForm(prev => ({ ...prev, rentability: e.target.value }))}
                          placeholder={`1.25% ${t('stakes.financialInfo.monthSuffix') || 'a.m.'}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('stakes.financialInfo.rentabilityHelp') || 'O valor numérico será usado para calcular o CDI Equivalent'}
                      </p>
                    </div>

                    {/* Faixa de Rentabilidade (Renda Variável) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('stakes.financialInfo.rentabilityRange') || 'Faixa de Rentabilidade (Renda Variável)'}
                      </label>
                      <div className="space-y-2">
                        {/* Min e Max juntos */}
                        <div className="grid grid-cols-2 gap-2">
                          <Textinput
                            label={`${t('stakes.financialInfo.rentabilityMin') || 'Min (%)'} ${t('stakes.financialInfo.monthSuffix') || 'a.m.'}`}
                            type="number"
                            step="0.01"
                            value={stakeForm.rentabilityRangeMin || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const monthSuffix = t('stakes.financialInfo.monthSuffix') || 'a.m.';
                              setStakeForm(prev => ({
                                ...prev,
                                rentabilityRangeMin: value,
                                // Auto-atualizar a string de display se ambos os valores estão preenchidos
                                rentabilityRange: value && prev.rentabilityRangeMax
                                  ? `${parseFloat(value).toFixed(2)}% - ${parseFloat(prev.rentabilityRangeMax).toFixed(2)}% ${monthSuffix}`
                                  : prev.rentabilityRange
                              }));
                            }}
                            placeholder="2.00"
                          />
                          <Textinput
                            label={`${t('stakes.financialInfo.rentabilityMax') || 'Max (%)'} ${t('stakes.financialInfo.monthSuffix') || 'a.m.'}`}
                            type="number"
                            step="0.01"
                            value={stakeForm.rentabilityRangeMax || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const monthSuffix = t('stakes.financialInfo.monthSuffix') || 'a.m.';
                              setStakeForm(prev => ({
                                ...prev,
                                rentabilityRangeMax: value,
                                // Auto-atualizar a string de display se ambos os valores estão preenchidos
                                rentabilityRange: prev.rentabilityRangeMin && value
                                  ? `${parseFloat(prev.rentabilityRangeMin).toFixed(2)}% - ${parseFloat(value).toFixed(2)}% ${monthSuffix}`
                                  : prev.rentabilityRange
                              }));
                            }}
                            placeholder="3.50"
                          />
                        </div>
                        {/* Display separado */}
                        <Textinput
                          label={t('stakes.financialInfo.display') || 'Exibição'}
                          value={stakeForm.rentabilityRange || ''}
                          onChange={(e) => setStakeForm(prev => ({ ...prev, rentabilityRange: e.target.value }))}
                          placeholder={`2% - 3.5% ${t('stakes.financialInfo.monthSuffix') || 'a.m.'}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('stakes.financialInfo.rentabilityRangeHelp') || 'Para renda variável, a média será usada para calcular o CDI'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label={t('stakes.financialInfo.assetType')}
                      options={[
                        { value: '', label: t('stakes.financialInfo.assetTypePlaceholder') },
                        { value: 'receivable', label: t('stakes.financialInfo.assetTypeOptions.receivable') },
                        { value: 'participation', label: t('stakes.financialInfo.assetTypeOptions.participation') },
                        { value: 'debenture', label: t('stakes.financialInfo.assetTypeOptions.debenture') },
                        { value: 'cri', label: t('stakes.financialInfo.assetTypeOptions.cri') },
                        { value: 'cra', label: t('stakes.financialInfo.assetTypeOptions.cra') },
                        { value: 'royalty', label: t('stakes.financialInfo.assetTypeOptions.royalty') },
                        { value: 'agribusiness', label: t('stakes.financialInfo.assetTypeOptions.agribusiness') },
                        { value: 'real_estate', label: t('stakes.financialInfo.assetTypeOptions.real_estate') },
                        { value: 'credit', label: t('stakes.financialInfo.assetTypeOptions.credit') },
                        { value: 'other', label: t('stakes.financialInfo.assetTypeOptions.other') }
                      ]}
                      value={stakeForm.assetType || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, assetType: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea
                      label={t('stakes.financialInfo.rentabilityTooltip')}
                      value={stakeForm.rentabilityTooltip || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, rentabilityTooltip: e.target.value }))}
                      placeholder={t('stakes.financialInfo.rentabilityTooltipPlaceholder')}
                      rows={3}
                    />
                    <Textarea
                      label={t('stakes.financialInfo.rentabilityRangeTooltip')}
                      value={stakeForm.rentabilityRangeTooltip || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, rentabilityRangeTooltip: e.target.value }))}
                      placeholder={t('stakes.financialInfo.rentabilityRangeTooltipPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textinput
                      label={t('stakes.financialInfo.maturityDate')}
                      type="date"
                      value={stakeForm.maturityDate || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, maturityDate: e.target.value }))}
                    />
                    <Textinput
                      label={t('stakes.financialInfo.totalEmission')}
                      type="number"
                      value={stakeForm.totalEmission || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, totalEmission: e.target.value }))}
                      placeholder={t('stakes.financialInfo.totalEmissionPlaceholder')}
                      helpText={t('stakes.financialInfo.totalEmissionHelp') || 'Quantidade máxima a ser captada nesta oferta'}
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <AlertTriangle size={16} className="inline mr-2" />
                      {t('stakes.financialInfo.capturedAmountNote') || 'A quantidade captada é obtida automaticamente do contrato através da função getTotalStakedSupply()'}
                    </p>
                  </div>
                </>
              )}

              {/* ABA 3: IMAGENS E DOCUMENTOS */}
              {activeTab === 'media' && (
                <>
                  {!editingStakeId && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <AlertTriangle size={16} className="inline mr-2" />
                        {t('stakes.images.saveContractFirst') || 'Salve o contrato primeiro para poder fazer upload de imagens e documentos.'}
                      </p>
                    </div>
                  )}

                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('stakes.images.logoLabel')}
                    </label>
                    <div className="flex items-center gap-4">
                      {(logoPreview || stakeForm.logoUrl) && (
                        <div className="relative">
                          <img
                            src={logoPreview || stakeForm.logoUrl}
                            alt="Logo"
                            className="w-24 h-24 object-contain border border-gray-200 dark:border-gray-700 rounded"
                          />
                          {uploadingLogo && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded gap-1">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                              <span className="text-[10px] text-white font-medium">{t('stakes.images.uploading')}</span>
                            </div>
                          )}
                          {logoUploadSuccess && !uploadingLogo && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={!editingStakeId || uploadingLogo}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('stakes.images.formatHint')}</p>
                        {uploadingLogo && (
                          <div className="flex items-center gap-2 mt-2">
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            <span className="text-xs text-blue-600 font-medium">{t('stakes.images.uploading')}</span>
                          </div>
                        )}
                        {logoUploadSuccess && !uploadingLogo && (
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">{t('stakes.images.uploadSuccess') || 'Enviado com sucesso!'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('stakes.images.bannerLabel')}
                    </label>
                    <div className="flex items-center gap-4">
                      {(bannerPreview || stakeForm.bannerUrl) && (
                        <div className="relative">
                          <img
                            src={bannerPreview || stakeForm.bannerUrl}
                            alt="Banner"
                            className="w-48 h-24 object-cover border border-gray-200 dark:border-gray-700 rounded"
                          />
                          {uploadingBanner && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded gap-1">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                              <span className="text-[10px] text-white font-medium">{t('stakes.images.uploading')}</span>
                            </div>
                          )}
                          {bannerUploadSuccess && !uploadingBanner && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}
                          disabled={!editingStakeId || uploadingBanner}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('stakes.images.formatHintBanner')}</p>
                        {uploadingBanner && (
                          <div className="flex items-center gap-2 mt-2">
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            <span className="text-xs text-blue-600 font-medium">{t('stakes.images.uploading')}</span>
                          </div>
                        )}
                        {bannerUploadSuccess && !uploadingBanner && (
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">{t('stakes.images.uploadSuccess') || 'Enviado com sucesso!'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('stakes.documents.documentsLabel')}
                    </label>

                    {/* Lista de documentos */}
                    {stakeForm.documents && stakeForm.documents.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {stakeForm.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded">
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-blue-500" />
                              <div>
                                <p className="text-sm font-medium">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.type}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(index)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload de novos documentos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['whitepaper', 'essential_info', 'offer_info'].map((type) => (
                        <div key={type}>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {t(`stakes.documents.documentTypes.${type}`)}
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentUpload(e, type, e.target.files[0]?.name || '')}
                            disabled={!editingStakeId || uploadingDocument}
                            className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ABA 4: GARANTIAS E RISCOS */}
              {activeTab === 'guarantees' && (
                <>
                  <Textarea
                    label={t('stakes.documents.guarantees')}
                    value={stakeForm.guarantees || ''}
                    onChange={(e) => setStakeForm(prev => ({ ...prev, guarantees: e.target.value }))}
                    placeholder={t('stakes.documents.guaranteesPlaceholder')}
                    rows={6}
                  />

                  <Textarea
                    label={t('stakes.documents.risks')}
                    value={stakeForm.risks || ''}
                    onChange={(e) => setStakeForm(prev => ({ ...prev, risks: e.target.value }))}
                    placeholder={t('stakes.documents.risksPlaceholder')}
                    rows={6}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textinput
                      label={t('stakes.documents.blockchainNetwork')}
                      value={stakeForm.blockchainNetwork || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, blockchainNetwork: e.target.value }))}
                      placeholder={t('stakes.documents.blockchainNetworkPlaceholder')}
                    />
                    <Textinput
                      label={t('stakes.documents.registryInfo')}
                      value={stakeForm.registryInfo || ''}
                      onChange={(e) => setStakeForm(prev => ({ ...prev, registryInfo: e.target.value }))}
                      placeholder={t('stakes.documents.registryInfoPlaceholder')}
                    />
                  </div>
                </>
              )}

              {/* Botões de ação */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  onClick={() => {
                    setShowStakeForm(false);
                    setEditingStakeId(null);
                    setActiveTab('basic');
                  }}
                  className="btn-outline-secondary"
                  icon="heroicons:x-mark"
                  text={t('buttons.cancel')}
                />
                <Button
                  onClick={handleStakeSubmit}
                  className="btn-primary"
                  isLoading={loading}
                  icon="heroicons:check"
                  text={t('buttons.save')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de contratos de stake - Só exibe quando não está editando/criando */}
        {!showStakeForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('stakes.registeredContracts')}
              </h4>
              {stakeContracts.some(contract => contract.isFallbackData) && (
                <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} />
                  <span>{t('stakes.demoData')}</span>
                </div>
              )}
            </div>

            <StakesTable
              contracts={filterStakesByNetwork()}
              loading={loadingStakeContracts}
              onEdit={(contract) => {
              const tokenAddr = contract.tokenAddress
                || contract.metadata?.tokenAddress
                || contract.stakeToken
                || '';

              setEditingStakeId(contract.id);
              setStakeForm({
                address: contract.address,
                tokenAddress: tokenAddr,
                network: contract.network,
                name: contract.name,
                code: contract.metadata?.code || '',
                description: contract.description || contract.metadata?.description || '',
                adminAddress: contract.metadata?.adminAddress || contract.adminAddress || '',
                risk: contract.metadata?.risk !== undefined ? contract.metadata.risk : 1,
                companyId: contract.companyId || '',
                investment_type: contract.metadata?.investment_type || 'stake',
                // Campos do emissor
                issuerId: contract.metadata?.issuerId || '',
                issuer: contract.metadata?.issuer || '',
                issuerName: contract.metadata?.issuerName || '',
                issuerDescription: contract.metadata?.issuerDescription || '',
                issuerWebsite: contract.metadata?.issuerWebsite || '',
                issuerFoundationYear: contract.metadata?.issuerFoundationYear || '',
                issuerLogo: contract.metadata?.issuerLogo || '',
                // Novos campos financeiros
                equivalentCDI: contract.metadata?.equivalentCDI || '',
                cdiRate: contract.metadata?.cdiRate || '',
                cdiCalculationDate: contract.metadata?.cdiCalculationDate || '',
                cdiProfitabilityUsed: contract.metadata?.cdiProfitabilityUsed || '',
                cdiProfitabilitySource: contract.metadata?.cdiProfitabilitySource || '',
                rentability: contract.metadata?.rentability || '',
                rentabilityValue: contract.metadata?.rentabilityValue || '',
                rentabilityRange: contract.metadata?.rentabilityRange || '',
                rentabilityRangeMin: contract.metadata?.rentabilityRangeMin || '',
                rentabilityRangeMax: contract.metadata?.rentabilityRangeMax || '',
                rentabilityTooltip: contract.metadata?.rentabilityTooltip || '',
                rentabilityRangeTooltip: contract.metadata?.rentabilityRangeTooltip || '',
                assetType: contract.metadata?.assetType || '',
                paymentFrequency: contract.metadata?.paymentFrequency || '',
                maturityDate: contract.metadata?.maturityDate || '',
                status: contract.metadata?.status || '',
                market: contract.metadata?.market || '',
                totalEmission: contract.metadata?.totalEmission || '',
                minInvestment: contract.metadata?.minInvestment || '',
                tokenSymbol: contract.metadata?.tokenSymbol || '',
                // Imagens
                logoUrl: contract.metadata?.logoUrl || '',
                bannerUrl: contract.metadata?.bannerUrl || '',
                // Documentos
                documents: contract.metadata?.documents || [],
                // Garantias e riscos
                guarantees: contract.metadata?.guarantees || '',
                risks: contract.metadata?.risks || '',
                blockchainNetwork: contract.metadata?.blockchainNetwork || '',
                registryInfo: contract.metadata?.registryInfo || ''
              });

              setShowStakeForm(true);
              setActiveTab('basic');
            }}
            onToggleActive={(contract) => handleStakeActivate(contract.address, contract.isActive)}
          />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StakesTab;

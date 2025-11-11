"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "react-select";
import Modal from "@/components/ui/Modal";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from '@/contexts/AlertContext';
import companiesService from '@/services/companiesService';
import Dropdown from "@/components/ui/Dropdown";
import { useTranslation } from '@/hooks/useTranslation';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Building,
  Globe,
  Users,
  Activity,
  Calendar,
  Edit,
  Settings,
  Palette,
  Upload,
  Save,
  X,
  Image,
  Link,
  Type,
  Monitor,
  Smartphone,
  Layers
} from 'lucide-react';

const CompaniesManagementPage = () => {
  const { t } = useTranslation('adminCompanies');
  const { showSuccess, showError, showInfo, showWarning } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [saving, setSaving] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    hasCustomBranding: '',
    lastActivityDays: ''
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withCustomBranding: 0,
    defaultBranding: 0
  });

  // Dados do branding sendo editado
  const [brandingData, setBrandingData] = useState({
    companyId: null,
    companyName: "",
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    accentColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
    textColor: "#111827",
    logoUrl: "",
    logoUrlDark: "",
    faviconUrl: "",
    backgroundImageUrl: "",
    loginTitle: "",
    loginSubtitle: "",
    welcomeMessage: "",
    footerText: "",
    supportUrl: "",
    privacyPolicyUrl: "",
    termsOfServiceUrl: "",
    contactEmail: "",
    layoutStyle: "default",
    borderRadius: 8,
    fontFamily: "",
    fontSize: "medium",
    customCss: "",
    customJs: "",
    allowCustomization: true
  });

  useEffect(() => {
    if (!permissions.canViewCompanySettings) {
      router.push("/dashboard");
      return;
    }
    
    if (!initialLoadDone) {
      loadCompanies();
    }
  }, [permissions.canViewCompanySettings, router, initialLoadDone]);

  // Aplicar filtros quando filters mudarem
  useEffect(() => {
    if (initialLoadDone) {
      applyFilters();
    }
  }, [companies, filters, initialLoadDone]);


  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar empresas da API real
      const result = await companiesService.getCompanies();
      
      if (result.success) {
        setCompanies(result.data);

        // Calcular estatísticas
        const newStats = {
          total: result.data.length,
          active: result.data.filter(c => c.status === 'active').length,
          inactive: result.data.filter(c => c.status !== 'active').length,
          withCustomBranding: result.data.filter(c => c.hasCustomBranding).length,
          defaultBranding: result.data.filter(c => !c.hasCustomBranding).length
        };
        setStats(newStats);

        if (!initialLoadDone) {
          setInitialLoadDone(true);
        }
      } else {
        showError(result.message || t('messages.loadError'));
        setInitialLoadDone(true);
      }

    } catch (error) {
      console.error("Error loading companies:", error);
      showError(t('messages.loadError'));
      setInitialLoadDone(true);
    } finally {
      setLoading(false);
    }
  }, [initialLoadDone, showError, t]);

  const applyFilters = () => {
    let filtered = [...companies];

    // Filtro de busca
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(search) ||
        company.alias.toLowerCase().includes(search)
      );
    }

    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter(company => company.status === filters.status);
    }

    // Filtro de personalização
    if (filters.hasCustomBranding) {
      const hasCustom = filters.hasCustomBranding === 'true';
      filtered = filtered.filter(company => company.hasCustomBranding === hasCustom);
    }

    // Filtro de última atividade
    if (filters.lastActivityDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(filters.lastActivityDays));
      filtered = filtered.filter(company => 
        company.lastActivityAt && new Date(company.lastActivityAt) >= daysAgo
      );
    }

    setFilteredCompanies(filtered);
  };

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      hasCustomBranding: '',
      lastActivityDays: ''
    });
  };

  const exportCompanies = () => {
    const csvData = filteredCompanies.map(company => ({
      'Nome': company.name,
      'Alias': company.alias,
      'Status': t(`status.${company.status}`),
      'Personalização': company.hasCustomBranding ? t('table.brandingStatus.custom') : t('table.brandingStatus.default'),
      'Usuários': company.users,
      'Transações': company.transactions,
      'Volume (BRL)': `R$ ${company.volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Data Criação': new Date(company.createdAt).toLocaleDateString('pt-BR'),
      'Última Atividade': new Date(company.lastActivityAt).toLocaleDateString('pt-BR')
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empresas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompanyAction = async (action, company) => {
    if (!permissions.canViewCompanySettings && ['activate', 'deactivate', 'editBranding'].includes(action)) {
      showError(t('messages.noPermission'));
      return;
    }

    try {
      switch (action) {
        case 'editBranding':
          router.push(`/admin/companies/${company.id}/branding`);
          break;

        case 'activate':
          const activateResult = await companiesService.updateCompanyStatus(company.id, 'active');
          if (activateResult.success) {
            showSuccess(activateResult.message || t('messages.activateSuccess', { name: company.name }));
            await loadCompanies();
          } else {
            showError(activateResult.message || t('messages.activateError'));
          }
          break;

        case 'deactivate':
          const deactivateResult = await companiesService.updateCompanyStatus(company.id, 'inactive');
          if (deactivateResult.success) {
            showSuccess(deactivateResult.message || t('messages.deactivateSuccess', { name: company.name }));
            await loadCompanies();
          } else {
            showError(deactivateResult.message || t('messages.deactivateError'));
          }
          break;

        default:
          console.log('Action:', action, 'Company:', company.name);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      showError(t('messages.actionError'));
    }
  };

  const openBrandingModal = (company) => {
    setSelectedCompany(company);
    setBrandingData({
      companyId: company.id,
      companyName: company.name,
      primaryColor: company.branding?.primaryColor || "#10B981",
      secondaryColor: company.branding?.secondaryColor || "#059669",
      accentColor: company.branding?.accentColor || "#3B82F6",
      backgroundColor: company.branding?.backgroundColor || "#FFFFFF",
      textColor: company.branding?.textColor || "#111827",
      logoUrl: company.branding?.logoUrl || "",
      logoUrlDark: company.branding?.logoUrlDark || "",
      faviconUrl: company.branding?.faviconUrl || "",
      backgroundImageUrl: company.branding?.backgroundImageUrl || "",
      loginTitle: company.branding?.loginTitle || `Bem-vindo à ${company.name}`,
      loginSubtitle: company.branding?.loginSubtitle || "Plataforma de blockchain",
      welcomeMessage: company.branding?.welcomeMessage || `Bem-vindo à ${company.name}! Sua plataforma confiável para operações blockchain.`,
      footerText: company.branding?.footerText || `© 2025 ${company.name}. Todos os direitos reservados.`,
      supportUrl: company.branding?.supportUrl || `https://support.${company.alias}.com`,
      privacyPolicyUrl: company.branding?.privacyPolicyUrl || `https://${company.alias}.com/privacy`,
      termsOfServiceUrl: company.branding?.termsOfServiceUrl || `https://${company.alias}.com/terms`,
      contactEmail: company.branding?.contactEmail || `support@${company.alias}.com`,
      layoutStyle: company.branding?.layoutStyle || "default",
      borderRadius: company.branding?.borderRadius || 8,
      fontFamily: company.branding?.fontFamily || "",
      fontSize: company.branding?.fontSize || "medium",
      customCss: company.branding?.customCss || "",
      customJs: company.branding?.customJs || "",
      allowCustomization: company.branding?.allowCustomization ?? true
    });
    setShowBrandingModal(true);
  };

  const handleInputChange = (field, value) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event, assetType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar arquivo
    const validation = companiesService.validateFile(file);
    if (!validation.valid) {
      showError(validation.message);
      return;
    }

    try {
      setSaving(true);
      showInfo(t('messages.uploadingAsset', { assetType: companiesService.getAssetTypeLabel(assetType) }));

      // Fazer upload do arquivo
      const result = await companiesService.uploadBrandingAsset(
        brandingData.companyId,
        file,
        assetType
      );

      if (result.success) {
        // Atualizar URL no formulário
        const fieldMap = {
          'logo': 'logoUrl',
          'logo-dark': 'logoUrlDark',
          'favicon': 'faviconUrl',
          'background': 'backgroundImageUrl'
        };

        setBrandingData(prev => ({
          ...prev,
          [fieldMap[assetType]]: result.data.url
        }));

        showSuccess(result.message || t('messages.uploadSuccess', { assetType: companiesService.getAssetTypeLabel(assetType) }));
      } else {
        showError(result.message || t('messages.uploadError'));
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      showError(t('messages.uploadError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Salvar configurações via API
      const result = await companiesService.updateBranding(brandingData.companyId, {
        brandName: brandingData.companyName,
        primaryColor: brandingData.primaryColor,
        secondaryColor: brandingData.secondaryColor,
        accentColor: brandingData.accentColor,
        backgroundColor: brandingData.backgroundColor,
        textColor: brandingData.textColor,
        loginTitle: brandingData.loginTitle,
        loginSubtitle: brandingData.loginSubtitle,
        welcomeMessage: brandingData.welcomeMessage,
        footerText: brandingData.footerText,
        supportUrl: brandingData.supportUrl,
        privacyPolicyUrl: brandingData.privacyPolicyUrl,
        termsOfServiceUrl: brandingData.termsOfServiceUrl,
        contactEmail: brandingData.contactEmail,
        layoutStyle: brandingData.layoutStyle,
        borderRadius: brandingData.borderRadius,
        fontFamily: brandingData.fontFamily,
        fontSize: brandingData.fontSize,
        customCss: brandingData.customCss,
        customJs: brandingData.customJs,
        allowCustomization: brandingData.allowCustomization
      });
      
      if (result.success) {
        showSuccess(result.message || t('messages.saveSuccess'));
        setShowBrandingModal(false);
        // Recarregar dados
        await loadCompanies();
      } else {
        showError(result.message || t('messages.saveError'));
      }
    } catch (error) {
      console.error("Error saving branding data:", error);
      showError(t('messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status) => {
    return t(`status.${status}`, status);
  };

  const getDaysSinceLastActivity = (lastActivity) => {
    if (!lastActivity) return null;
    const days = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Opções para filtros
  const statusOptions = [
    { value: '', label: t('filters.status.all') },
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
    { value: 'pending', label: t('status.pending') }
  ];

  const brandingOptions = [
    { value: '', label: t('filters.branding.all') },
    { value: 'true', label: t('filters.branding.custom') },
    { value: 'false', label: t('filters.branding.default') }
  ];

  const lastActivityOptions = [
    { value: '', label: t('filters.lastActivity.anyPeriod') },
    { value: '1', label: t('filters.lastActivity.lastDay') },
    { value: '7', label: t('filters.lastActivity.last7Days') },
    { value: '30', label: t('filters.lastActivity.last30Days') },
    { value: '90', label: t('filters.lastActivity.last90Days') }
  ];

  const itemsPerPageOptions = [
    { value: 10, label: t('table.pagination.perPage10') },
    { value: 20, label: t('table.pagination.perPage20') },
    { value: 50, label: t('table.pagination.perPage50') },
    { value: 100, label: t('table.pagination.perPage100') }
  ];

  const layoutStyleOptions = [
    { value: 'default', label: t('branding.layout.styles.default') },
    { value: 'centered', label: t('branding.layout.styles.centered') },
    { value: 'sidebar', label: t('branding.layout.styles.sidebar') },
    { value: 'fullscreen', label: t('branding.layout.styles.fullscreen') }
  ];

  const fontSizeOptions = [
    { value: 'small', label: t('branding.layout.fontSizes.small') },
    { value: 'medium', label: t('branding.layout.fontSizes.medium') },
    { value: 'large', label: t('branding.layout.fontSizes.large') }
  ];

  // Estilos para react-select
  const selectStyles = {
    option: (provided, state) => ({
      ...provided,
      fontSize: "14px",
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      fontSize: "14px",
    }),
  };

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const currentCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const goToPage = (page) => setCurrentPage(page);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const handleItemsPerPageChange = (option) => {
    setItemsPerPage(option.value);
    setCurrentPage(1);
  };


  if (!permissions.canViewCompanySettings) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
        <Button
            text={t('buttons.exportCSV')}
            icon="heroicons:arrow-down-tray"
            className="btn-outline-primary"
            onClick={exportCompanies}
          />
          <Button
            text={t('buttons.refresh')}
            icon="heroicons:arrow-path-solid"
            onClick={loadCompanies}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.total')}</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.active')}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="text-gray-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.inactive')}</p>
                <p className="text-xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette className="text-purple-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.customBranding')}</p>
                <p className="text-xl font-bold">{stats.withCustomBranding}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Globe className="text-yellow-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.defaultBranding')}</p>
                <p className="text-xl font-bold">{stats.defaultBranding}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.search.label')}
            </label>
            <div className="relative">
              <Textinput
                placeholder={t('filters.search.placeholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.status.label')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={statusOptions}
              value={statusOptions.find(option => option.value === filters.status)}
              onChange={(option) => handleFilterChange('status', option?.value || '')}
              placeholder={t('filters.status.placeholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.branding.label')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={brandingOptions}
              value={brandingOptions.find(option => option.value === filters.hasCustomBranding)}
              onChange={(option) => handleFilterChange('hasCustomBranding', option?.value || '')}
              placeholder={t('filters.branding.placeholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.lastActivity.label')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={lastActivityOptions}
              value={lastActivityOptions.find(option => option.value === filters.lastActivityDays)}
              onChange={(option) => handleFilterChange('lastActivityDays', option?.value || '')}
              placeholder={t('filters.lastActivity.placeholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="btn-outline-secondary flex-1"
            >
              {t('buttons.clear')}
            </Button>
          </div>
        </div>

        {/* Resumo dos filtros */}
        {(filters.search || filters.status || filters.hasCustomBranding || filters.lastActivityDays) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('filters.activeFilters')}:</span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.search')}: {filters.search}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.status')}: {statusOptions.find(o => o.value === filters.status)?.label}
                </span>
              )}
              {filters.hasCustomBranding && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.branding')}: {brandingOptions.find(o => o.value === filters.hasCustomBranding)?.label}
                </span>
              )}
              {filters.lastActivityDays && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.activeLabels.activity')}: {lastActivityOptions.find(o => o.value === filters.lastActivityDays)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Lista de Empresas */}
      <Card>
        <div className="space-y-4">
          {/* Cabeçalho da tabela com contador */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('table.title')} ({loading ? '...' : filteredCompanies.length})
            </h3>
            <div className="flex items-center space-x-2">
              <Select
                className="react-select"
                classNamePrefix="select"
                options={itemsPerPageOptions}
                value={itemsPerPageOptions.find(option => option.value === itemsPerPage)}
                onChange={handleItemsPerPageChange}
                styles={selectStyles}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-slate-600 dark:text-slate-400">{t('table.loading')}</span>
            </div>
          )}

          {/* Tabela responsiva */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.company')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.branding')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.stats')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.activity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('table.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {currentCompanies.length > 0 ? (
                    currentCompanies.map((company) => {
                      const daysSinceActivity = getDaysSinceLastActivity(company.lastActivityAt);
                      
                      return (
                        <tr
                          key={company.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                        >
                          {/* Empresa */}
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex-none">
                                <div className="relative">
                                  <div 
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: company.branding?.primaryColor || '#6B7280' }}
                                  >
                                    {company.branding?.logoUrl ? (
                                      <img
                                        src={company.branding.logoUrl}
                                        alt={company.name}
                                        className="w-8 h-8 rounded object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <span className="text-white font-bold text-sm">
                                      {company.name.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {company.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  @{company.alias}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              label={getStatusLabel(company.status)}
                              className={`${getStatusBadgeColor(company.status)} text-white`}
                            />
                          </td>
                          
                          {/* Personalização */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {company.hasCustomBranding ? (
                                <>
                                  <Palette className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm text-purple-600 font-medium">{t('table.brandingStatus.custom')}</span>
                                </>
                              ) : (
                                <>
                                  <Settings className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">{t('table.brandingStatus.default')}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Estatísticas */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              <div className="text-slate-900 dark:text-white">
                                <Users className="w-4 h-4 inline mr-1" />
                                {company.users.toLocaleString()} {t('table.stats.users')}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">
                                <Activity className="w-4 h-4 inline mr-1" />
                                {company.transactions.toLocaleString()} {t('table.stats.transactions')}
                              </div>
                              <div className="text-green-600 font-medium">
                                R$ {company.volume.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                              </div>
                            </div>
                          </td>

                          {/* Atividade */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              <div className="text-slate-500 dark:text-slate-400">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {t('table.activity.created')} {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                              {daysSinceActivity !== null ? (
                                <div className={`text-xs ${
                                  daysSinceActivity <= 1 ? 'text-green-600' :
                                  daysSinceActivity <= 7 ? 'text-yellow-600' :
                                  daysSinceActivity <= 30 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  {t('table.activity.active')}: {daysSinceActivity === 0 ? t('table.activity.today') : t('table.activity.daysAgo', { days: daysSinceActivity })}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">{t('table.activity.noRecentActivity')}</div>
                              )}
                            </div>
                          </td>
                          
                          {/* Ações */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {permissions.canViewCompanySettings && (
                              <Dropdown
                                label={<MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />}
                                labelClass="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                classMenuItems="mt-2 w-[180px]"
                              >
                                <button
                                  onClick={() => router.push(`/admin/company-stakes?companyId=${company.id}`)}
                                  className="flex items-center px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                  <Layers size={14} className="mr-2" />
                                  {t('actions.manageStakes')}
                                </button>

                                <button
                                  onClick={() => handleCompanyAction('editBranding', company)}
                                  className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                  <Palette size={14} className="mr-2" />
                                  {t('actions.editBranding')}
                                </button>

                                <div className="border-t border-gray-100 dark:border-gray-600"></div>

                                {company.status === 'active' ? (
                                  <button
                                    onClick={() => handleCompanyAction('deactivate', company)}
                                    className="flex items-center px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                  >
                                    <Settings size={14} className="mr-2" />
                                    {t('actions.deactivate')}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCompanyAction('activate', company)}
                                    className="flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                  >
                                    <Settings size={14} className="mr-2" />
                                    {t('actions.activate')}
                                  </button>
                                )}
                              </Dropdown>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center">
                          <Building className="w-12 h-12 mb-2 opacity-50" />
                          <span className="font-medium">{t('table.empty.title')}</span>
                          <span className="text-sm">{t('table.empty.subtitle')}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredCompanies.length > itemsPerPage && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                  {t('table.pagination.showing', {
                    from: ((currentPage - 1) * itemsPerPage) + 1,
                    to: Math.min(currentPage * itemsPerPage, filteredCompanies.length),
                    total: filteredCompanies.length
                  })}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentPage === page
                          ? "bg-primary-500 text-white"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Edição de Branding */}
      {selectedCompany && showBrandingModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowBrandingModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('branding.modalTitle')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedCompany.name} (@{selectedCompany.alias})
                </p>
              </div>
              <Button
                onClick={() => setShowBrandingModal(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="p-6 space-y-8">
              {/* Upload de Imagens */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  {t('branding.sections.images')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.images.mainLogo')}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      {brandingData.logoUrl ? (
                        <img src={brandingData.logoUrl} alt="Logo" className="w-full h-20 object-contain mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logoUrl"
                        onChange={async (e) => {
                          await handleFileUpload(e, 'logo');
                        }}
                      />
                      <label htmlFor="logoUrl" className="text-xs text-slate-600 cursor-pointer hover:underline">
                        {t('buttons.upload')}
                      </label>
                      <Textinput
                        value={brandingData.logoUrl}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        placeholder={t('branding.images.urlPlaceholder')}
                        className="mt-2"
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.images.darkLogo')}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      {brandingData.logoUrlDark ? (
                        <img src={brandingData.logoUrlDark} alt="Logo Dark" className="w-full h-20 object-contain mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logoUrlDark"
                        onChange={async (e) => {
                          await handleFileUpload(e, 'logo-dark');
                        }}
                      />
                      <label htmlFor="logoUrlDark" className="text-xs text-slate-600 cursor-pointer hover:underline">
                        {t('buttons.upload')}
                      </label>
                      <Textinput
                        value={brandingData.logoUrlDark}
                        onChange={(e) => handleInputChange('logoUrlDark', e.target.value)}
                        placeholder={t('branding.images.urlPlaceholder')}
                        className="mt-2"
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.images.favicon')}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      {brandingData.faviconUrl ? (
                        <img src={brandingData.faviconUrl} alt="Favicon" className="w-full h-20 object-contain mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="faviconUrl"
                        onChange={async (e) => {
                          await handleFileUpload(e, 'favicon');
                        }}
                      />
                      <label htmlFor="faviconUrl" className="text-xs text-slate-600 cursor-pointer hover:underline">
                        {t('buttons.upload')}
                      </label>
                      <Textinput
                        value={brandingData.faviconUrl}
                        onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                        placeholder={t('branding.images.urlPlaceholder')}
                        className="mt-2"
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.images.backgroundImage')}
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      {brandingData.backgroundImageUrl ? (
                        <img src={brandingData.backgroundImageUrl} alt="Background" className="w-full h-20 object-contain mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="backgroundImageUrl"
                        onChange={async (e) => {
                          await handleFileUpload(e, 'background');
                        }}
                      />
                      <label htmlFor="backgroundImageUrl" className="text-xs text-slate-600 cursor-pointer hover:underline">
                        {t('buttons.upload')}
                      </label>
                      <Textinput
                        value={brandingData.backgroundImageUrl}
                        onChange={(e) => handleInputChange('backgroundImageUrl', e.target.value)}
                        placeholder={t('branding.images.urlPlaceholder')}
                        className="mt-2"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  {t('branding.sections.colors')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.colors.primary')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandingData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <Textinput
                        value={brandingData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.colors.secondary')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandingData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <Textinput
                        value={brandingData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        placeholder="#059669"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.colors.accent')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandingData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <Textinput
                        value={brandingData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.colors.background')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandingData.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <Textinput
                        value={brandingData.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.colors.text')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brandingData.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <Textinput
                        value={brandingData.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        placeholder="#111827"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Textos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  {t('branding.sections.texts')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.texts.loginTitle')}
                    </label>
                    <Textinput
                      value={brandingData.loginTitle}
                      onChange={(e) => handleInputChange('loginTitle', e.target.value)}
                      placeholder={t('branding.texts.loginTitlePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.texts.loginSubtitle')}
                    </label>
                    <Textinput
                      value={brandingData.loginSubtitle}
                      onChange={(e) => handleInputChange('loginSubtitle', e.target.value)}
                      placeholder={t('branding.texts.loginSubtitlePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.texts.welcomeMessage')}
                    </label>
                    <textarea
                      value={brandingData.welcomeMessage || ''}
                      onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                      placeholder={t('branding.texts.welcomeMessagePlaceholder')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.texts.footerText')}
                    </label>
                    <Textinput
                      value={brandingData.footerText}
                      onChange={(e) => handleInputChange('footerText', e.target.value)}
                      placeholder={t('branding.texts.footerTextPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.texts.contactEmail')}
                    </label>
                    <Textinput
                      value={brandingData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder={t('branding.texts.contactEmailPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Link className="w-5 h-5 mr-2" />
                  {t('branding.sections.urls')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.urls.support')}
                    </label>
                    <Textinput
                      value={brandingData.supportUrl}
                      onChange={(e) => handleInputChange('supportUrl', e.target.value)}
                      placeholder={t('branding.urls.supportPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.urls.privacyPolicy')}
                    </label>
                    <Textinput
                      value={brandingData.privacyPolicyUrl}
                      onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)}
                      placeholder={t('branding.urls.privacyPolicyPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.urls.termsOfService')}
                    </label>
                    <Textinput
                      value={brandingData.termsOfServiceUrl}
                      onChange={(e) => handleInputChange('termsOfServiceUrl', e.target.value)}
                      placeholder={t('branding.urls.termsOfServicePlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Configurações de Layout */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  {t('branding.sections.layout')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.layout.style')}
                    </label>
                    <Select
                      className="react-select"
                      classNamePrefix="select"
                      options={layoutStyleOptions}
                      value={layoutStyleOptions.find(option => option.value === brandingData.layoutStyle)}
                      onChange={(option) => handleInputChange('layoutStyle', option.value)}
                      styles={selectStyles}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.layout.fontSize')}
                    </label>
                    <Select
                      className="react-select"
                      classNamePrefix="select"
                      options={fontSizeOptions}
                      value={fontSizeOptions.find(option => option.value === brandingData.fontSize)}
                      onChange={(option) => handleInputChange('fontSize', option.value)}
                      styles={selectStyles}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('branding.layout.borderRadius')}
                    </label>
                    <Textinput
                      type="number"
                      value={brandingData.borderRadius}
                      onChange={(e) => handleInputChange('borderRadius', parseInt(e.target.value))}
                      placeholder={t('branding.layout.borderRadiusPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  {t('branding.sections.preview')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('branding.preview.desktop')}</div>
                    <div
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 h-48 flex items-center justify-center"
                      style={{
                        backgroundColor: brandingData.backgroundColor,
                        color: brandingData.textColor,
                        borderColor: brandingData.primaryColor,
                        borderRadius: `${brandingData.borderRadius}px`
                      }}
                    >
                      <div className="text-center">
                        <h2
                          className="text-2xl font-bold mb-2"
                          style={{ color: brandingData.primaryColor }}
                        >
                          {brandingData.loginTitle}
                        </h2>
                        <p className="text-sm" style={{ color: brandingData.textColor }}>
                          {brandingData.loginSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('branding.preview.mobile')}</div>
                    <div
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 h-48 w-32 mx-auto flex items-center justify-center"
                      style={{
                        backgroundColor: brandingData.backgroundColor,
                        color: brandingData.textColor,
                        borderColor: brandingData.primaryColor,
                        borderRadius: `${brandingData.borderRadius}px`
                      }}
                    >
                      <div className="text-center">
                        <h3
                          className="text-lg font-bold mb-1"
                          style={{ color: brandingData.primaryColor }}
                        >
                          {brandingData.loginTitle}
                        </h3>
                        <p className="text-xs" style={{ color: brandingData.textColor }}>
                          {brandingData.loginSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={() => setShowBrandingModal(false)}
                  variant="outline"
                >
                  {t('buttons.cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  className="btn-brand"
                  isLoading={saving}
                >
                  <Save size={16} className="mr-2" />
                  {t('buttons.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesManagementPage;
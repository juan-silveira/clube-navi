"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import { useAlertContext } from '@/contexts/AlertContext';
import companiesService from '@/services/companiesService';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image,
  Palette,
  Type,
  Monitor,
  Smartphone,
  Eye,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

const CompanyBrandingPage = () => {
  const { showSuccess, showError, showInfo, showWarning } = useAlertContext();
  const router = useRouter();
  const params = useParams();
  const permissions = usePermissions();
  const { t } = useTranslation('adminCompanies');

  const companyId = params.companyId;
  
  const [activeTab, setActiveTab] = useState("images");
  const [company, setCompany] = useState(null);
  const [branding, setBranding] = useState({
    brandName: '',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    accentColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    loginTitle: '',
    loginSubtitle: '',
    welcomeMessage: '',
    footerText: '',
    supportUrl: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
    contactEmail: '',
    layoutStyle: 'default',
    borderRadius: 8,
    fontFamily: '',
    fontSize: 'medium',
    customCss: '',
    customJs: '',
    allowCustomization: true,
    logoUrl: '',
    logoUrlDark: '',
    miniUrl: '',
    miniUrlDark: '',
    textUrl: '',
    textUrlDark: '',
    faviconUrl: '',
    backgroundImageUrl: ''
  });
  
  // Estados para dimensões da imagem de fundo
  const [backgroundDimensions, setBackgroundDimensions] = useState({
    width: '100%',
    height: '100%'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAssets, setUploadingAssets] = useState({});
  
  // Refs para inputs de arquivo
  const logoInputRef = useRef(null);
  const logoDarkInputRef = useRef(null);
  const miniInputRef = useRef(null);
  const miniDarkInputRef = useRef(null);
  const textInputRef = useRef(null);
  const textDarkInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const backgroundInputRef = useRef(null);

  // Função para extrair dimensões do customCss
  const extractDimensionsFromCss = (cssString) => {
    if (!cssString) return { width: '100%', height: '100%' };
    
    try {
      // Procurar por comentário específico com as dimensões
      const dimensionsMatch = cssString.match(/\/\*\s*background-dimensions:\s*({[^}]+})\s*\*\//);
      if (dimensionsMatch) {
        const dimensions = JSON.parse(dimensionsMatch[1]);
        return {
          width: dimensions.width || '100%',
          height: dimensions.height || '100%'
        };
      }
    } catch (error) {
      console.error('Erro ao extrair dimensões do CSS:', error);
    }
    
    return { width: '100%', height: '100%' };
  };
  
  // Função para inserir dimensões no customCss
  const insertDimensionsIntoCss = (cssString, dimensions) => {
    // Remover comentário anterior se existir
    const cleanedCss = (cssString || '').replace(/\/\*\s*background-dimensions:[^*]+\*\/\s*/g, '');
    
    // Adicionar novo comentário com dimensões
    const dimensionsComment = `/* background-dimensions: ${JSON.stringify(dimensions)} */\n`;
    
    return dimensionsComment + cleanedCss;
  };

  // Carregar dados da empresa e branding
  const loadCompanyData = useCallback(async () => {
    console.log('🔄 [LoadData] loadCompanyData() foi chamado para companyId:', companyId);
    console.trace('🔍 [LoadData] Stack trace de quem chamou loadCompanyData');
    
    try {
      setLoading(true);
      
      // Buscar dados da empresa
      const companiesResponse = await companiesService.getCompanies();
      if (companiesResponse.success) {
        const companyData = companiesResponse.data.find(c => c.id === companyId);
        if (!companyData) {
          showError(t('messages.loadError'));
          router.push('/admin/companies');
          return;
        }
        setCompany(companyData);
        console.log('✅ [LoadData] Dados da empresa carregados:', companyData.name);
      }
      
      // Buscar dados de branding
      console.log('🔍 [LoadData] Buscando dados de branding...');
      const brandingResponse = await companiesService.getCompanyBranding(companyId);
      if (brandingResponse.success && brandingResponse.data) {
        console.log('📦 [LoadData] Dados de branding recebidos do servidor:', {
          logoUrl: brandingResponse.data.logoUrl,
          logoUrlDark: brandingResponse.data.logoUrlDark,
          miniUrl: brandingResponse.data.miniUrl,
          miniUrlDark: brandingResponse.data.miniUrlDark,
          textUrl: brandingResponse.data.textUrl,
          textUrlDark: brandingResponse.data.textUrlDark,
          faviconUrl: brandingResponse.data.faviconUrl,
          backgroundImageUrl: brandingResponse.data.backgroundImageUrl
        });
        
        console.log('🔍 [DEBUG] Objeto completo do servidor:', brandingResponse.data);
        
        setBranding(prev => {
          // Preservar URLs que estão no estado local e não são data URLs (ou seja, URLs reais do S3)
          // Isso evita sobrescrever uploads recentes que podem não ter sincronizado no servidor ainda
          const preserveUrl = (newUrl, currentUrl) => {
            // Se temos uma URL atual que não é data URL e a nova URL é vazia, preservar a atual
            if (currentUrl && !currentUrl.includes('data:') && !newUrl) {
              console.log('🔒 [LoadData] Preservando URL atual:', currentUrl.slice(0, 50) + '...');
              return currentUrl;
            }
            // Senão, usar a nova URL do servidor
            return newUrl;
          };
          
          const newBranding = {
            ...prev,
            ...brandingResponse.data,
            brandName: brandingResponse.data.brandName || '',
            primaryColor: brandingResponse.data.primaryColor || '#10B981',
            secondaryColor: brandingResponse.data.secondaryColor || '#059669',
            accentColor: brandingResponse.data.accentColor || '#3B82F6',
            backgroundColor: brandingResponse.data.backgroundColor || '#FFFFFF',
            textColor: brandingResponse.data.textColor || '#111827',
            // Preservar URLs de assets se existirem localmente e forem URLs reais
            logoUrl: preserveUrl(brandingResponse.data.logoUrl, prev.logoUrl),
            logoUrlDark: preserveUrl(brandingResponse.data.logoUrlDark, prev.logoUrlDark),
            miniUrl: preserveUrl(brandingResponse.data.miniUrl, prev.miniUrl),
            miniUrlDark: preserveUrl(brandingResponse.data.miniUrlDark, prev.miniUrlDark),
            textUrl: preserveUrl(brandingResponse.data.textUrl, prev.textUrl),
            textUrlDark: preserveUrl(brandingResponse.data.textUrlDark, prev.textUrlDark),
            faviconUrl: preserveUrl(brandingResponse.data.faviconUrl, prev.faviconUrl),
            backgroundImageUrl: preserveUrl(brandingResponse.data.backgroundImageUrl, prev.backgroundImageUrl),
          };
          
          console.log('🔄 [LoadData] Estado de branding sendo atualizado:', {
            logoUrl: newBranding.logoUrl ? newBranding.logoUrl.slice(0, 50) + '...' : null,
            logoUrlDark: newBranding.logoUrlDark ? newBranding.logoUrlDark.slice(0, 50) + '...' : null,
            miniUrl: newBranding.miniUrl ? newBranding.miniUrl.slice(0, 50) + '...' : null,
            miniUrlDark: newBranding.miniUrlDark ? newBranding.miniUrlDark.slice(0, 50) + '...' : null,
            textUrl: newBranding.textUrl ? newBranding.textUrl.slice(0, 50) + '...' : null,
            textUrlDark: newBranding.textUrlDark ? newBranding.textUrlDark.slice(0, 50) + '...' : null,
            faviconUrl: newBranding.faviconUrl ? newBranding.faviconUrl.slice(0, 50) + '...' : null,
            backgroundImageUrl: newBranding.backgroundImageUrl ? newBranding.backgroundImageUrl.slice(0, 50) + '...' : null
          });
          
          return newBranding;
        });
        
        // Extrair dimensões do customCss
        const dimensions = extractDimensionsFromCss(brandingResponse.data.customCss);
        console.log('🔍 [LoadData] Dimensões extraídas do CSS:', dimensions);
        console.log('🔍 [LoadData] CSS original:', brandingResponse.data.customCss);
        setBackgroundDimensions(dimensions);
      } else {
        console.log('⚠️ [LoadData] Nenhum dado de branding encontrado ou falha na requisição');
      }
    } catch (error) {
      console.error('❌ [LoadData] Erro ao carregar dados:', error);
      showError(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [companyId, showError, router]);
  // Note: 't' is intentionally excluded from dependencies to prevent infinite loop
  // The translation function is stable and doesn't need to trigger re-fetching

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
    }
  }, [companyId, loadCompanyData]);

  // Salvar configurações de branding
  const handleSaveBranding = async () => {
    try {
      setSaving(true);
      
      console.log('🔍 [SaveBranding] Dimensões atuais:', backgroundDimensions);
      
      // Inserir dimensões no customCss antes de salvar
      const updatedBranding = {
        ...branding,
        customCss: insertDimensionsIntoCss(branding.customCss, backgroundDimensions)
      };
      
      console.log('🔍 [SaveBranding] CSS atualizado:', updatedBranding.customCss);
      
      const response = await companiesService.updateBranding(companyId, updatedBranding);

      if (response.success) {
        showSuccess(t('messages.saveSuccess'));
      } else {
        showError(response.message || t('messages.saveError'));
      }
    } catch (error) {
      console.error('Erro ao salvar branding:', error);
      showError(t('messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  // Upload de assets
  const handleAssetUpload = async (assetType, file) => {
    if (!file) return;

    const validation = companiesService.validateFile(file);
    if (!validation.valid) {
      showError(validation.message || t('messages.uploadError'));
      return;
    }

    console.log('🔍 [Upload] Iniciando upload:', {
      assetType,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    try {
      setUploadingAssets(prev => ({ ...prev, [assetType]: true }));
      
      // Gerar preview imediatamente para SVGs e outras imagens
      if (companiesService.isImageFile(file)) {
        try {
          const preview = await companiesService.generateFilePreview(file);
          console.log('✅ [Upload] Preview gerado:', { assetType, previewUrl: preview.url.slice(0, 50) + '...' });
          // Atualizar estado com preview temporário
          setBranding(prev => ({
            ...prev,
            [`${assetType}Url`]: preview.url
          }));
        } catch (previewError) {
          console.warn('⚠️ [Upload] Erro ao gerar preview:', previewError);
        }
      }
      
      console.log('🚀 [Upload] Iniciando upload para servidor...');
      const response = await companiesService.uploadBrandingAsset(companyId, file, assetType);
      
      console.log('📨 [Upload] Resposta do servidor:', {
        success: response.success,
        message: response.message,
        hasUrl: !!response.data?.url
      });
      
      if (response.success) {
        // Atualizar com URL real do S3
        setBranding(prev => ({
          ...prev,
          [`${assetType}Url`]: response.data.url
        }));
        console.log('✅ [Upload] Upload concluído com sucesso:', response.data.url);
        showSuccess(t('messages.uploadSuccess', { assetType: companiesService.getAssetTypeLabel(assetType) }));
      } else {
        // Se falhou, limpar preview
        console.error('❌ [Upload] Upload falhou:', response.message);
        setBranding(prev => ({
          ...prev,
          [`${assetType}Url`]: ''
        }));
        showError(response.message || t('messages.uploadError'));
      }
    } catch (error) {
      console.error('❌ [Upload] Erro no upload:', error);
      console.error('❌ [Upload] Stack trace:', error.stack);
      console.error('❌ [Upload] Response data:', error.response?.data);
      
      // Se falhou, limpar preview
      setBranding(prev => ({
        ...prev,
        [`${assetType}Url`]: ''
      }));
      
      // Melhor tratamento de erro
      let errorMessage = t('messages.uploadError');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      setUploadingAssets(prev => ({ ...prev, [assetType]: false }));
    }
  };

  // Deletar asset
  const handleDeleteAsset = async (assetType) => {
    try {
      const response = await companiesService.deleteBrandingAsset(companyId, assetType);

      if (response.success) {
        setBranding(prev => ({
          ...prev,
          [`${assetType}Url`]: ''
        }));
        showSuccess(t('messages.uploadSuccess', { assetType: companiesService.getAssetTypeLabel(assetType) }));
      } else {
        showError(response.message || t('messages.uploadError'));
      }
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      showError(t('messages.uploadError'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t('table.loading')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "images", label: t('branding.sections.images'), icon: Image },
    { id: "colors", label: t('branding.sections.colors'), icon: Palette },
    { id: "texts", label: t('branding.sections.texts'), icon: Type },
    { id: "links", label: "Links", icon: Monitor },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Tooltip content={t('buttons.cancel')} placement="bottom">
            <button
              onClick={() => router.push("/admin/companies")}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
            >
              <ArrowLeft
                size={16}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('branding.modalTitle')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {company ? `${company.name} (${company.alias})` : t('table.loading')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSaveBranding}
            isLoading={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save size={16} className="mr-2" />
            {saving ? t('table.loading') : t('buttons.save')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        {/* Tabs - Desktop Single Row */}
        <div className="hidden md:block border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tabs - Mobile Grid (2x2) */}
        <div className="md:hidden border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center py-3 px-2 border-b-2 font-medium text-xs transition-all ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={16} className="mr-1.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Aba: Imagens */}
          {activeTab === "images" && (
            <div className="space-y-6">

      {/* Imagens */}
      <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Image className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t('branding.sections.images')}</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Logo Principal */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">{t('branding.images.mainLogo')}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.logoUrl ? (
                    <div className="relative">
                      <img
                        src={branding.logoUrl}
                        alt="Logo"
                        className="max-h-20 mx-auto"
                        style={{ imageRendering: branding.logoUrl.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('logo')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => {
                      console.log('🎯 [FileInput] Input onChange disparado:', {
                        hasFiles: !!e.target.files,
                        fileCount: e.target.files?.length,
                        firstFile: e.target.files?.[0] ? {
                          name: e.target.files[0].name,
                          type: e.target.files[0].type,
                          size: e.target.files[0].size
                        } : null
                      });
                      handleAssetUpload('logo', e.target.files[0]);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('👆 [FileInput] Botão clicado, abrindo seletor de arquivo');
                      logoInputRef.current?.click();
                    }}
                    disabled={uploadingAssets.logo}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets.logo ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>

              {/* Logo Escura */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">{t('branding.images.darkLogo')}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.logoUrlDark ? (
                    <div className="relative">
                      <img
                        src={branding.logoUrlDark}
                        alt="Logo Escura"
                        className="max-h-20 mx-auto"
                        style={{ imageRendering: branding.logoUrlDark.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('logo-dark')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={logoDarkInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => handleAssetUpload('logo-dark', e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoDarkInputRef.current?.click()}
                    disabled={uploadingAssets['logo-dark']}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets['logo-dark'] ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>

              {/* Mini Logo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Mini Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.miniUrl ? (
                    <div className="relative">
                      <img
                        src={branding.miniUrl}
                        alt="Mini Logo"
                        className="max-h-16 mx-auto"
                        style={{ imageRendering: branding.miniUrl.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('mini')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={miniInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => handleAssetUpload('mini', e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => miniInputRef.current?.click()}
                    disabled={uploadingAssets.mini}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets.mini ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>

              {/* Mini Logo Escura */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Mini Logo Escura</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.miniUrlDark ? (
                    <div className="relative">
                      <img
                        src={branding.miniUrlDark}
                        alt="Mini Logo Escura"
                        className="max-h-16 mx-auto"
                        style={{ imageRendering: branding.miniUrlDark.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('mini-dark')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={miniDarkInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => handleAssetUpload('mini-dark', e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => miniDarkInputRef.current?.click()}
                    disabled={uploadingAssets['mini-dark']}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets['mini-dark'] ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>

              {/* Logo Texto */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Logo Texto</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.textUrl ? (
                    <div className="relative">
                      <img
                        src={branding.textUrl}
                        alt="Logo Texto"
                        className="max-h-16 mx-auto"
                        style={{ imageRendering: branding.textUrl.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('text')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={textInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => handleAssetUpload('text', e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => textInputRef.current?.click()}
                    disabled={uploadingAssets.text}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets.text ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>

              {/* Logo Texto Escura */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Logo Texto Escura</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.textUrlDark ? (
                    <div className="relative">
                      <img
                        src={branding.textUrlDark}
                        alt="Logo Texto Escura"
                        className="max-h-16 mx-auto"
                        style={{ imageRendering: branding.textUrlDark.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('text-dark')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={textDarkInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => handleAssetUpload('text-dark', e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => textDarkInputRef.current?.click()}
                    disabled={uploadingAssets['text-dark']}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets['text-dark'] ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">{t('branding.images.favicon')}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.faviconUrl ? (
                    <div className="relative">
                      <img
                        src={branding.faviconUrl}
                        alt="Favicon"
                        className="max-h-16 mx-auto"
                        style={{ imageRendering: branding.faviconUrl.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('favicon')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={faviconInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => handleAssetUpload('favicon', e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={uploadingAssets.favicon}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets.favicon ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>

              {/* Imagem de Fundo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">{t('branding.images.backgroundImage')}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-gray-200 dark:bg-slate-700">
                  {branding.backgroundImageUrl ? (
                    <div className="relative">
                      <img
                        src={branding.backgroundImageUrl}
                        alt="Background"
                        className="max-h-20 mx-auto"
                        style={{ imageRendering: branding.backgroundImageUrl.includes('data:') ? 'auto' : 'crisp-edges' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAsset('background')}
                        className="mt-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{t('buttons.upload')}</p>
                    </div>
                  )}
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                    onChange={(e) => handleAssetUpload('background', e.target.files[0])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => backgroundInputRef.current?.click()}
                    disabled={uploadingAssets.background}
                    className="mt-2 w-full"
                  >
                    {uploadingAssets.background ? t('messages.uploadingAsset', { assetType: '' }) : t('buttons.upload')}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Configurações de Dimensões da Imagem de Fundo */}
            {branding.backgroundImageUrl && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">{t('branding.images.backgroundDimensions')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('branding.images.width')}</label>
                    <Textinput
                      type="text"
                      placeholder={t('branding.images.widthPlaceholder')}
                      value={backgroundDimensions.width}
                      onChange={(e) => setBackgroundDimensions(prev => ({ ...prev, width: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('branding.images.dimensionsHint')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('branding.images.height')}</label>
                    <Textinput
                      type="text"
                      placeholder={t('branding.images.heightPlaceholder')}
                      value={backgroundDimensions.height}
                      onChange={(e) => setBackgroundDimensions(prev => ({ ...prev, height: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('branding.images.dimensionsHint')}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <strong>Dica:</strong> {t('branding.images.dimensionsTip')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
            </div>
          )}

          {/* Aba: Cores */}
          {activeTab === "colors" && (
            <div className="space-y-6">
      {/* Cores */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('branding.sections.colors')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.primaryColor || '#3B82F6'}
                  onChange={(e) => setBranding(prev => ({...prev, primaryColor: e.target.value}))}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <label className="text-sm font-medium">{t('branding.colors.primary')}</label>
              </div>
              <Textinput
                value={branding.primaryColor || ''}
                onChange={(e) => setBranding(prev => ({...prev, primaryColor: e.target.value}))}
                placeholder="#3B82F6"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.secondaryColor || '#1E293B'}
                  onChange={(e) => setBranding(prev => ({...prev, secondaryColor: e.target.value}))}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <label className="text-sm font-medium">{t('branding.colors.secondary')}</label>
              </div>
              <Textinput
                value={branding.secondaryColor || ''}
                onChange={(e) => setBranding(prev => ({...prev, secondaryColor: e.target.value}))}
                placeholder="#1E293B"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.accentColor || '#10B981'}
                  onChange={(e) => setBranding(prev => ({...prev, accentColor: e.target.value}))}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <label className="text-sm font-medium">{t('branding.colors.accent')}</label>
              </div>
              <Textinput
                value={branding.accentColor || ''}
                onChange={(e) => setBranding(prev => ({...prev, accentColor: e.target.value}))}
                placeholder="#10B981"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.backgroundColor || '#FFFFFF'}
                  onChange={(e) => setBranding(prev => ({...prev, backgroundColor: e.target.value}))}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <label className="text-sm font-medium">{t('branding.colors.background')}</label>
              </div>
              <Textinput
                value={branding.backgroundColor || ''}
                onChange={(e) => setBranding(prev => ({...prev, backgroundColor: e.target.value}))}
                placeholder="#FFFFFF"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.textColor || '#111827'}
                  onChange={(e) => setBranding(prev => ({...prev, textColor: e.target.value}))}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <label className="text-sm font-medium">{t('branding.colors.text')}</label>
              </div>
              <Textinput
                value={branding.textColor || ''}
                onChange={(e) => setBranding(prev => ({...prev, textColor: e.target.value}))}
                placeholder="#111827"
              />
            </div>
          </div>
        </div>
      </Card>
            </div>
          )}

          {/* Aba: Textos */}
          {activeTab === "texts" && (
            <div className="space-y-6">
      {/* Textos */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Type className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t('branding.sections.texts')}</h2>
            </div>

            <div className="space-y-4">
              <Textinput
                label={t('branding.texts.brandName')}
                value={branding.brandName}
                onChange={(e) => setBranding(prev => ({...prev, brandName: e.target.value}))}
                placeholder={t('branding.texts.brandNamePlaceholder')}
              />

              <Textinput
                label={t('branding.texts.loginTitle')}
                value={branding.loginTitle}
                onChange={(e) => setBranding(prev => ({...prev, loginTitle: e.target.value}))}
                placeholder={t('branding.texts.loginTitlePlaceholder')}
              />

              <Textinput
                label={t('branding.texts.loginSubtitle')}
                value={branding.loginSubtitle}
                onChange={(e) => setBranding(prev => ({...prev, loginSubtitle: e.target.value}))}
                placeholder={t('branding.texts.loginSubtitlePlaceholder')}
              />

              <div>
                <label className="block text-sm font-medium mb-2">{t('branding.texts.welcomeMessage')}</label>
                <textarea
                  value={branding.welcomeMessage || ''}
                  onChange={(e) => setBranding(prev => ({...prev, welcomeMessage: e.target.value}))}
                  placeholder={t('branding.texts.welcomeMessagePlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Textinput
                label={t('branding.texts.footerText')}
                value={branding.footerText}
                onChange={(e) => setBranding(prev => ({...prev, footerText: e.target.value}))}
                placeholder={t('branding.texts.footerTextPlaceholder')}
              />

              <Textinput
                label={t('branding.texts.contactEmail')}
                type="email"
                value={branding.contactEmail}
                onChange={(e) => setBranding(prev => ({...prev, contactEmail: e.target.value}))}
                placeholder={t('branding.texts.contactEmailPlaceholder')}
              />
            </div>
          </div>
        </Card>
            </div>
          )}

          {/* Aba: Links */}
          {activeTab === "links" && (
            <div className="space-y-6">
        {/* URLs */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Monitor className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Links</h2>
            </div>

            <div className="space-y-4">
              <Textinput
                label={t('branding.urls.support')}
                type="url"
                value={branding.supportUrl}
                onChange={(e) => setBranding(prev => ({...prev, supportUrl: e.target.value}))}
                placeholder={t('branding.urls.supportPlaceholder')}
              />

              <Textinput
                label={t('branding.urls.privacyPolicy')}
                type="url"
                value={branding.privacyPolicyUrl}
                onChange={(e) => setBranding(prev => ({...prev, privacyPolicyUrl: e.target.value}))}
                placeholder={t('branding.urls.privacyPolicyPlaceholder')}
              />

              <Textinput
                label={t('branding.urls.termsOfService')}
                type="url"
                value={branding.termsOfServiceUrl}
                onChange={(e) => setBranding(prev => ({...prev, termsOfServiceUrl: e.target.value}))}
                placeholder={t('branding.urls.termsOfServicePlaceholder')}
              />
            </div>
          </div>
        </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CompanyBrandingPage;
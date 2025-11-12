"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import { useAlertContext } from '@/contexts/AlertContext';
import clubsService from "@/services/clubsService";
import BrandingPreviews from "@/components/branding/BrandingPreviews";
import {
  ArrowLeft,
  Palette,
  Image as ImageIcon,
  Smartphone
} from 'lucide-react';

const ClubBrandingPage = () => {
  const { t } = useTranslation("common");
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    appName: '',
    appDescription: '',
    logoUrl: '',
    logoIconUrl: '',
    faviconUrl: '',
    appStoreUrl: '',
    playStoreUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    // Login customization
    loginDescriptionPt: '',
    loginDescriptionEn: '',
    loginDescriptionEs: '',
    loginIllustrationUrl: '',
    loginWelcomePt: '',
    loginWelcomeEn: '',
    loginWelcomeEs: ''
  });

  const [clubName, setClubName] = useState('');
  const [previewModal, setPreviewModal] = useState({ isOpen: false, image: null });
  const [hasScroll, setHasScroll] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Detectar se há scroll disponível no container de ilustrações
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setHasScroll(scrollWidth > clientWidth);
      }
    };

    // Verificar inicialmente
    checkScroll();

    // Verificar quando a janela for redimensionada
    window.addEventListener('resize', checkScroll);

    // Cleanup
    return () => window.removeEventListener('resize', checkScroll);
  }, [formData.loginIllustrationUrl]); // Re-checar quando mudar de ilustração

  const loadClub = async () => {
    try {
      setLoading(true);
      const response = await clubsService.getClubById(params.id);
      const club = response.data.club;
      const branding = club.branding || {};

      setClubName(club.companyName);
      setFormData({
        appName: branding.appName || club.companyName || '',
        appDescription: branding.appDescription || '',
        logoUrl: branding.logoUrl || '',
        logoIconUrl: branding.logoIconUrl || '',
        faviconUrl: branding.faviconUrl || '',
        appStoreUrl: branding.appStoreUrl || '',
        playStoreUrl: branding.playStoreUrl || '',
        primaryColor: branding.primaryColor || '#3B82F6',
        secondaryColor: branding.secondaryColor || '#10B981',
        accentColor: branding.accentColor || '#F59E0B',
        backgroundColor: branding.backgroundColor || '#FFFFFF',
        textColor: branding.textColor || '#1F2937',
        loginDescriptionPt: branding.loginDescriptionPt || '',
        loginDescriptionEn: branding.loginDescriptionEn || '',
        loginDescriptionEs: branding.loginDescriptionEs || '',
        loginIllustrationUrl: branding.loginIllustrationUrl || '',
        loginWelcomePt: branding.loginWelcomePt || '',
        loginWelcomeEn: branding.loginWelcomeEn || '',
        loginWelcomeEs: branding.loginWelcomeEs || ''
      });
    } catch (err) {
      console.error('Error loading club:', err);
      setError('Erro ao carregar dados do clube');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await clubsService.updateClubBranding(params.id, formData);
      router.push(`/system/clubs/${params.id}`);
    } catch (err) {
      console.error('Error updating branding:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar branding');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/system/clubs/${params.id}`);
  };

  const handleFileUpload = async (field) => {
    // Criar input file temporário
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          setLoading(true);

          // Mapear nome do campo para tipo de asset
          const assetTypeMap = {
            'logo': 'logo',
            'logoIcon': 'logo-icon',
            'favicon': 'favicon',
            'loginIllustration': 'login-illustration'
          };

          const assetType = assetTypeMap[field];
          const response = await clubsService.uploadBrandingAsset(params.id, file, assetType);

          if (response.success) {
            // Atualizar o campo correspondente no formData
            const fieldMap = {
              'logo': 'logoUrl',
              'logoIcon': 'logoIconUrl',
              'favicon': 'faviconUrl',
              'loginIllustration': 'loginIllustrationUrl'
            };

            const formField = fieldMap[field];
            setFormData({ ...formData, [formField]: response.data.url });
            showSuccess('Upload realizado com sucesso!');
          }
        } catch (error) {
          showError('Erro ao fazer upload: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      }
    };

    input.click();
  };

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content={t("buttons.back")} placement="bottom">
            <button
              onClick={handleCancel}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Branding do Clube
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {clubName} - Personalize a identidade visual do app
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* App Identity */}
            <Card title="Identidade do App">
              <div className="space-y-4">
                <Textinput
                  label="Nome do App"
                  type="text"
                  placeholder="Digite o nome do app"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  required
                />

                <Textarea
                  label="Descrição do App"
                  placeholder="Descrição que aparecerá nas lojas de aplicativos"
                  value={formData.appDescription}
                  onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="URL App Store (iOS)"
                    type="text"
                    placeholder="https://apps.apple.com/..."
                    value={formData.appStoreUrl}
                    onChange={(e) => setFormData({ ...formData, appStoreUrl: e.target.value })}
                  />

                  <Textinput
                    label="URL Play Store (Android)"
                    type="text"
                    placeholder="https://play.google.com/..."
                    value={formData.playStoreUrl}
                    onChange={(e) => setFormData({ ...formData, playStoreUrl: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card title="Imagens">
              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <label className="form-label flex items-center gap-2 mb-2">
                    <ImageIcon size={16} />
                    Logo do App
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.logoUrl && (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="w-20 h-20 object-contain rounded-lg border-2 border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div className="flex-1">
                      <Textinput
                        type="text"
                        placeholder="URL da logo"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      />
                      <Button
                        type="button"
                        className="btn-outline-primary btn-sm mt-2"
                        onClick={() => handleFileUpload('logo')}
                        icon="heroicons-outline:arrow-up-tray"
                        text="Upload Logo"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Recomendado: 512x512px, PNG com fundo transparente
                  </p>
                </div>

                {/* Logo Icon */}
                <div>
                  <label className="form-label flex items-center gap-2 mb-2">
                    <Smartphone size={16} />
                    Logo Ícone (Versão compacta)
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.logoIconUrl && (
                      <img
                        src={formData.logoIconUrl}
                        alt="Logo Icon"
                        className="w-16 h-16 object-contain rounded-xl border-2 border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div className="flex-1">
                      <Textinput
                        type="text"
                        placeholder="URL do logo ícone"
                        value={formData.logoIconUrl}
                        onChange={(e) => setFormData({ ...formData, logoIconUrl: e.target.value })}
                      />
                      <Button
                        type="button"
                        className="btn-outline-primary btn-sm mt-2"
                        onClick={() => handleFileUpload('logoIcon')}
                        icon="heroicons-outline:arrow-up-tray"
                        text="Upload Logo Ícone"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Recomendado: 200x200px, PNG com fundo transparente
                  </p>
                </div>

                {/* Favicon */}
                <div>
                  <label className="form-label flex items-center gap-2 mb-2">
                    <ImageIcon size={16} />
                    Favicon (Web)
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.faviconUrl && (
                      <img
                        src={formData.faviconUrl}
                        alt="Favicon"
                        className="w-8 h-8 object-contain rounded border-2 border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div className="flex-1">
                      <Textinput
                        type="text"
                        placeholder="URL do favicon"
                        value={formData.faviconUrl}
                        onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                      />
                      <Button
                        type="button"
                        className="btn-outline-primary btn-sm mt-2"
                        onClick={() => handleFileUpload('favicon')}
                        icon="heroicons-outline:arrow-up-tray"
                        text="Upload Favicon"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Recomendado: 32x32px ou 64x64px, PNG ou ICO
                  </p>
                </div>
              </div>
            </Card>

            {/* Colors */}
            <Card title="Paleta de Cores">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Cor Primária</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <Textinput
                      type="text"
                      placeholder="#3B82F6"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Cor Secundária</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <Textinput
                      type="text"
                      placeholder="#10B981"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Cor de Destaque</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <Textinput
                      type="text"
                      placeholder="#F59E0B"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Cor de Fundo</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <Textinput
                      type="text"
                      placeholder="#FFFFFF"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Cor do Texto</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <Textinput
                      type="text"
                      placeholder="#1F2937"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Login Customization */}
            <Card title="Personalização da Tela de Login">
              <div className="space-y-4">
                {/* Ilustração */}
                <div>
                  <label className="form-label">Ilustração de Login</label>

                  {/* Opções pré-definidas com preview */}
                  <div className="mb-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Escolha uma ilustração dos assets:
                    </p>

                    {/* Grid scrollável horizontal para múltiplas ilustrações */}
                    <div className="relative">
                      <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
                        {[
                          { url: '/shared-assets/images/auth/ils1.svg', name: 'Ilustração 1' },
                          { url: '/shared-assets/images/auth/ilst2.png', name: 'Ilustração 2' }
                        ].map((option) => (
                          <div
                            key={option.url}
                            className={`
                              relative flex-shrink-0 w-40 border-2 rounded-lg p-2 transition-all group
                              ${formData.loginIllustrationUrl === option.url
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                              }
                            `}
                          >
                            {/* Preview da imagem - clique abre modal */}
                            <div
                              className="aspect-video bg-slate-50 dark:bg-slate-900 rounded overflow-hidden mb-1.5 cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all relative"
                              onClick={() => setPreviewModal({ isOpen: true, image: option })}
                            >
                              <img
                                src={option.url}
                                alt={option.name}
                                className="w-full h-full object-contain p-2"
                              />
                              {/* Ícone de zoom no hover */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>

                            <p className="text-xs font-medium text-center truncate px-1 mb-2">
                              {option.name}
                            </p>

                            {/* Botão de selecionar */}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, loginIllustrationUrl: option.url })}
                              className={`
                                w-full text-xs py-1.5 rounded transition-colors font-medium
                                ${formData.loginIllustrationUrl === option.url
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }
                              `}
                            >
                              {formData.loginIllustrationUrl === option.url ? 'Selecionada' : 'Selecionar'}
                            </button>

                            {formData.loginIllustrationUrl === option.url && (
                              <div className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full p-1 shadow-lg">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Indicador de scroll - só mostra se tiver scroll */}
                      {hasScroll && (
                        <div className="flex justify-center gap-1 mt-2">
                          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                            Role para ver mais
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview + Input + Botão */}
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    {formData.loginIllustrationUrl && (
                      <div className="w-32 h-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={formData.loginIllustrationUrl}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.alt = 'Erro ao carregar';
                          }}
                        />
                      </div>
                    )}

                    {/* Input + Botão */}
                    <div className="flex-1 space-y-2">
                      <Textinput
                        type="text"
                        placeholder="https://seu-bucket.s3.amazonaws.com/ilustracao.svg"
                        value={formData.loginIllustrationUrl}
                        onChange={(e) => setFormData({ ...formData, loginIllustrationUrl: e.target.value })}
                      />

                      <Button
                        type="button"
                        className="btn-outline-primary btn-sm mt-2"
                        onClick={() => handleFileUpload('loginIllustration')}
                        icon="heroicons-outline:arrow-up-tray"
                        text="Upload Ilustração"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Recomendado: 600x400px, PNG com fundo transparente
                  </p>
                </div>

                {/* Descrição - Português */}
                <div>
                  <label className="form-label">Descrição (Português)</label>
                  <Textarea
                    placeholder="Sistema de gestão de tokens e transações em blockchain"
                    value={formData.loginDescriptionPt}
                    onChange={(e) => setFormData({ ...formData, loginDescriptionPt: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Descrição - Inglês */}
                <div>
                  <label className="form-label">Descrição (English)</label>
                  <Textarea
                    placeholder="Token and blockchain transaction management system"
                    value={formData.loginDescriptionEn}
                    onChange={(e) => setFormData({ ...formData, loginDescriptionEn: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Descrição - Espanhol */}
                <div>
                  <label className="form-label">Descrição (Español)</label>
                  <Textarea
                    placeholder="Sistema de gestión de tokens y transacciones en blockchain"
                    value={formData.loginDescriptionEs}
                    onChange={(e) => setFormData({ ...formData, loginDescriptionEs: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Boas-vindas - Português */}
                <div>
                  <label className="form-label">Frase de Boas-vindas (Português)</label>
                  <Textinput
                    type="text"
                    placeholder="Bem-vindo ao Clube Digital"
                    value={formData.loginWelcomePt}
                    onChange={(e) => setFormData({ ...formData, loginWelcomePt: e.target.value })}
                  />
                </div>

                {/* Boas-vindas - Inglês */}
                <div>
                  <label className="form-label">Frase de Boas-vindas (English)</label>
                  <Textinput
                    type="text"
                    placeholder="Welcome to Digital Club"
                    value={formData.loginWelcomeEn}
                    onChange={(e) => setFormData({ ...formData, loginWelcomeEn: e.target.value })}
                  />
                </div>

                {/* Boas-vindas - Espanhol */}
                <div>
                  <label className="form-label">Frase de Boas-vindas (Español)</label>
                  <Textinput
                    type="text"
                    placeholder="Bienvenido al Club Digital"
                    value={formData.loginWelcomeEs}
                    onChange={(e) => setFormData({ ...formData, loginWelcomeEs: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card title="Ações">
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="btn-primary w-full"
                  isLoading={saving}
                  icon="heroicons-outline:check"
                  text="Salvar Branding"
                />
                <Button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={handleCancel}
                  disabled={saving}
                  icon="heroicons-outline:x-mark"
                  text="Cancelar"
                />
              </div>
            </Card>

            <Card title="Informações">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-start gap-2">
                  <Palette className="w-4 h-4 text-primary-500 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    As alterações de branding serão aplicadas na próxima build do app.
                    Para atualizações imediatas, use OTA (Over-The-Air) updates.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>

      {/* Previews Section */}
      <Card title="Pré-visualização do Branding" subtitle="Veja como ficará seu app e painel admin">
        <div className="p-6">
          <BrandingPreviews
            appName={formData.appName}
            logoUrl={formData.logoUrl}
            logoIconUrl={formData.logoIconUrl}
            faviconUrl={formData.faviconUrl}
            primaryColor={formData.primaryColor}
            secondaryColor={formData.secondaryColor}
            accentColor={formData.accentColor}
            backgroundColor={formData.backgroundColor}
            textColor={formData.textColor}
            loginDescriptionPt={formData.loginDescriptionPt}
            loginDescriptionEn={formData.loginDescriptionEn}
            loginDescriptionEs={formData.loginDescriptionEs}
            loginIllustrationUrl={formData.loginIllustrationUrl}
            loginWelcomePt={formData.loginWelcomePt}
            loginWelcomeEn={formData.loginWelcomeEn}
            loginWelcomeEs={formData.loginWelcomeEs}
          />
        </div>
      </Card>

      {/* Modal de Preview da Ilustração */}
      {previewModal.isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewModal({ isOpen: false, image: null })}
        >
          <div
            className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Preview da Ilustração
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {previewModal.image?.name}
                </p>
              </div>
              <button
                onClick={() => setPreviewModal({ isOpen: false, image: null })}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Imagem em tamanho grande */}
            <div className="p-8 bg-slate-50 dark:bg-slate-900">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-inner">
                <img
                  src={previewModal.image?.url}
                  alt={previewModal.image?.name}
                  className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                />
              </div>
            </div>

            {/* Footer com ações */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Arquivo:</span> {previewModal.image?.url}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewModal({ isOpen: false, image: null })}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...formData, loginIllustrationUrl: previewModal.image?.url });
                    setPreviewModal({ isOpen: false, image: null });
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Selecionar Esta Ilustração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubBrandingPage;

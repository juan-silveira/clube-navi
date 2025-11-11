"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import { useAlertContext } from "@/contexts/AlertContext";
import { clubAdminApi } from "@/services/api";
import AppPreview from "@/components/branding/AppPreview";
import useAuthStore from "@/store/authStore";

const BrandingPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState({
    appName: "",
    appDescription: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
    logoUrl: "",
    logoIconUrl: "",
    faviconUrl: ""
  });

  // File states for uploads
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoIconFile, setLogoIconFile] = useState(null);
  const [logoIconPreview, setLogoIconPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const { showSuccess, showError } = useAlertContext();

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const response = await clubAdminApi.get("/branding");
      if (response.data && response.data.success) {
        const brandingData = response.data.data;
        setBranding({
          appName: brandingData.appName || "",
          appDescription: brandingData.appDescription || "",
          primaryColor: brandingData.primaryColor || "#3B82F6",
          secondaryColor: brandingData.secondaryColor || "#10B981",
          accentColor: brandingData.accentColor || "#F59E0B",
          logoUrl: brandingData.logoUrl || "",
          logoIconUrl: brandingData.logoIconUrl || "",
          faviconUrl: brandingData.faviconUrl || ""
        });
        // Set previews from existing URLs
        if (brandingData.logoUrl) setLogoPreview(brandingData.logoUrl);
        if (brandingData.logoIconUrl) setLogoIconPreview(brandingData.logoIconUrl);
        if (brandingData.faviconUrl) setFaviconPreview(brandingData.faviconUrl);
      }
    } catch (error) {
      console.error("Erro ao carregar branding:", error);
      showError("Erro ao carregar configurações de branding");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let uploadedLogoUrl = branding.logoUrl;
      let uploadedLogoIconUrl = branding.logoIconUrl;
      let uploadedFaviconUrl = branding.faviconUrl;

      // Upload logo if new file selected
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('image', logoFile);
        logoFormData.append('imageType', 'logo');

        const logoUploadResponse = await clubAdminApi.post('/branding/upload', logoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (logoUploadResponse.data.success) {
          uploadedLogoUrl = logoUploadResponse.data.data.url;
        }
      }

      // Upload logo icon if new file selected
      if (logoIconFile) {
        const logoIconFormData = new FormData();
        logoIconFormData.append('image', logoIconFile);
        logoIconFormData.append('imageType', 'icon');

        const logoIconUploadResponse = await clubAdminApi.post('/branding/upload', logoIconFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (logoIconUploadResponse.data.success) {
          uploadedLogoIconUrl = logoIconUploadResponse.data.data.url;
        }
      }

      // Upload favicon if new file selected
      if (faviconFile) {
        const faviconFormData = new FormData();
        faviconFormData.append('image', faviconFile);
        faviconFormData.append('imageType', 'favicon');

        const faviconUploadResponse = await clubAdminApi.post('/branding/upload', faviconFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (faviconUploadResponse.data.success) {
          uploadedFaviconUrl = faviconUploadResponse.data.data.url;
        }
      }

      // Save branding with uploaded URLs using PUT
      const response = await clubAdminApi.put("/branding", {
        appName: branding.appName,
        appDescription: branding.appDescription,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        logoUrl: uploadedLogoUrl,
        logoIconUrl: uploadedLogoIconUrl,
        faviconUrl: uploadedFaviconUrl
      });

      if (response.data.success) {
        showSuccess("Branding atualizado com sucesso!");

        // Clear file states
        setLogoFile(null);
        setLogoIconFile(null);
        setFaviconFile(null);

        await loadBranding();
      }
    } catch (error) {
      console.error("Erro ao salvar branding:", error);
      showError(error.response?.data?.message || "Erro ao salvar branding");
    } finally {
      setLoading(false);
    }
  };

  const ColorPicker = ({ label, value, onChange, description }) => (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-16 rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
        />
        <div className="flex-1">
          <Textinput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
          />
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading && !branding.appName) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Branding</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Personalize a identidade visual do seu clube</p>
        </div>
        <Button
          text="Salvar Alterações"
          className="btn-primary"
          onClick={handleSave}
          isLoading={loading}
          icon="heroicons:check"
        />
      </div>

      {/* Informações e Paleta de Cores - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Informações do App */}
        <Card title="Informações do Aplicativo" subtitle="Nome e descrição que aparecerão no app">
          <div className="p-6 space-y-4">
            <Textinput
              label="Nome do App"
              value={branding.appName}
              onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
              placeholder="Ex: Clube Navi"
            />

            <Textarea
              label="Descrição do App"
              value={branding.appDescription || ""}
              onChange={(e) => setBranding({ ...branding, appDescription: e.target.value })}
              placeholder="Descreva seu clube em poucas palavras..."
              rows={3}
            />
          </div>
        </Card>

        {/* Coluna Direita - Paleta de Cores */}
        <Card title="Paleta de Cores" subtitle="Defina as cores principais do seu clube">
          <div className="p-6 space-y-6">
            <ColorPicker
              label="Cor Primária"
              value={branding.primaryColor}
              onChange={(color) => setBranding({ ...branding, primaryColor: color })}
              description="Cor principal usada em botões e destaques"
            />

            <ColorPicker
              label="Cor Secundária"
              value={branding.secondaryColor}
              onChange={(color) => setBranding({ ...branding, secondaryColor: color })}
              description="Cor para elementos secundários e ações de sucesso"
            />

            <ColorPicker
              label="Cor de Destaque"
              value={branding.accentColor}
              onChange={(color) => setBranding({ ...branding, accentColor: color })}
              description="Cor para alertas e elementos que precisam chamar atenção"
            />
          </div>
        </Card>
      </div>

      {/* Logos e Ícones - Full Width */}
      <Card title="Logos e Ícones" subtitle="Faça upload das imagens do clube">
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            💡 Use imagens PNG com fundo transparente para melhor resultado
          </p>
        </div>
        <div className="p-6 pt-4">
          {/* Grid de 3 colunas para uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Logo Principal */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Logo Principal
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Usada no dashboard web, emails, documentos e telas de login
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="group cursor-pointer block">
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10">
                    {logoPreview ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white dark:bg-slate-800 p-2 flex items-center justify-center">
                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon icon="heroicons:arrow-path" className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                          <Icon icon="heroicons:photo" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Clique para upload
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          200x50px
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Logo Ícone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Logo Ícone
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Aparece no app mobile (home, splash e tela principal) e nas notificações push
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoIconUpload}
                  className="hidden"
                  id="logo-icon-upload"
                />
                <label htmlFor="logo-icon-upload" className="group cursor-pointer block">
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10">
                    {logoIconPreview ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white dark:bg-slate-800 p-2 flex items-center justify-center">
                        <img src={logoIconPreview} alt="Icon preview" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon icon="heroicons:arrow-path" className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                          <Icon icon="heroicons:photo" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Clique para upload
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          128x128px
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Favicon
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Ícone que aparece na aba do navegador do dashboard web e nos favoritos
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.ico"
                  onChange={handleFaviconUpload}
                  className="hidden"
                  id="favicon-upload"
                />
                <label htmlFor="favicon-upload" className="group cursor-pointer block">
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10">
                    {faviconPreview ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white dark:bg-slate-800 p-2 flex items-center justify-center">
                        <img src={faviconPreview} alt="Favicon preview" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon icon="heroicons:arrow-path" className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                          <Icon icon="heroicons:photo" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Clique para upload
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          32x32px
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
          </Card>

      {/* Preview Mobile - Full Width */}
      <div className="mt-6">
        <Card title="Pré-visualização do Aplicativo" subtitle="Veja como seu app ficará nos dispositivos móveis">
          <div className="p-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <AppPreview
                appName={branding.appName || "Nome do App"}
                appDescription={branding.appDescription || "Descrição do app"}
                logoUrl={logoPreview}
                logoIconUrl={logoIconPreview}
                primaryColor={branding.primaryColor}
                secondaryColor={branding.secondaryColor}
                accentColor={branding.accentColor}
                userName={user?.name || user?.email?.split('@')[0] || "Usuário"}
                showHomeScreen={true}
                showSplash={true}
                showHome={true}
              />
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex gap-2">
                <Icon icon="heroicons:eye" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Esta é uma pré-visualização aproximada. O resultado real pode variar conforme o dispositivo e versão do sistema operacional.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <Icon icon="heroicons:light-bulb" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Dicas de Branding</h5>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Use cores que reflitam a identidade do seu clube</li>
                    <li>• Garanta boa legibilidade com contraste adequado</li>
                    <li>• Mantenha consistência nas suas escolhas de cores</li>
                    <li>• O logo ícone deve ser quadrado e funcionar bem em tamanhos pequenos</li>
                    <li>• Teste em diferentes dispositivos e modos (claro/escuro)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BrandingPage;

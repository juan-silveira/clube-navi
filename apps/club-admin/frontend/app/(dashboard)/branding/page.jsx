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

  // App info (read-only from master DB)
  const [appInfo, setAppInfo] = useState({
    appName: "",
    appDescription: "",
    appIconUrl: "",
    splashScreenUrl: "",
    splashBackgroundColor: "#FFFFFF",
    currentVersion: "",
    appStoreStatus: "",
    playStoreStatus: ""
  });

  // OTA branding (editable)
  const [branding, setBranding] = useState({
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    logoHeaderUrl: "",
    logoMenuUrl: "",
    logoFooterUrl: "",
    bannerHomeUrl: "",
    bannerPromoUrl: "",
    welcomeMessage: "",
    aboutUs: "",
    termsUrl: "",
    privacyUrl: "",
    supportEmail: "",
    supportPhone: "",
    websiteUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    linkedinUrl: ""
  });

  // File states for OTA uploads (internal logos and banners)
  const [logoHeaderFile, setLogoHeaderFile] = useState(null);
  const [logoHeaderPreview, setLogoHeaderPreview] = useState(null);
  const [logoMenuFile, setLogoMenuFile] = useState(null);
  const [logoMenuPreview, setLogoMenuPreview] = useState(null);
  const [logoFooterFile, setLogoFooterFile] = useState(null);
  const [logoFooterPreview, setLogoFooterPreview] = useState(null);
  const [bannerHomeFile, setBannerHomeFile] = useState(null);
  const [bannerHomePreview, setBannerHomePreview] = useState(null);
  const [bannerPromoFile, setBannerPromoFile] = useState(null);
  const [bannerPromoPreview, setBannerPromoPreview] = useState(null);

  const { showSuccess, showError } = useAlertContext();

  useEffect(() => {
    loadAppInfo();
    loadBranding();
  }, []);

  const loadAppInfo = async () => {
    try {
      const response = await clubAdminApi.get("/branding-ota/app-info");
      if (response.data && response.data.success) {
        const data = response.data.data;
        setAppInfo({
          appName: data.appName || "",
          appDescription: data.appDescription || "",
          appIconUrl: data.appIconUrl || "",
          splashScreenUrl: data.splashScreenUrl || "",
          splashBackgroundColor: data.splashBackgroundColor || "#FFFFFF",
          currentVersion: data.currentVersion || "",
          appStoreStatus: data.appStoreStatus || "",
          playStoreStatus: data.playStoreStatus || ""
        });
      }
    } catch (error) {
      console.error("Erro ao carregar informações do app:", error);
      // Don't show error toast - app info may not be configured yet
    }
  };

  const loadBranding = async () => {
    try {
      setLoading(true);
      const response = await clubAdminApi.get("/branding-ota");
      if (response.data && response.data.success) {
        const data = response.data.data;
        setBranding({
          primaryColor: data.primaryColor || "#3B82F6",
          secondaryColor: data.secondaryColor || "#10B981",
          accentColor: data.accentColor || "#F59E0B",
          backgroundColor: data.backgroundColor || "#FFFFFF",
          textColor: data.textColor || "#1F2937",
          logoHeaderUrl: data.logoHeaderUrl || "",
          logoMenuUrl: data.logoMenuUrl || "",
          logoFooterUrl: data.logoFooterUrl || "",
          bannerHomeUrl: data.bannerHomeUrl || "",
          bannerPromoUrl: data.bannerPromoUrl || "",
          welcomeMessage: data.welcomeMessage || "",
          aboutUs: data.aboutUs || "",
          termsUrl: data.termsUrl || "",
          privacyUrl: data.privacyUrl || "",
          supportEmail: data.supportEmail || "",
          supportPhone: data.supportPhone || "",
          websiteUrl: data.websiteUrl || "",
          instagramUrl: data.instagramUrl || "",
          facebookUrl: data.facebookUrl || "",
          twitterUrl: data.twitterUrl || "",
          linkedinUrl: data.linkedinUrl || ""
        });
        // Set previews from existing URLs
        if (data.logoHeaderUrl) setLogoHeaderPreview(data.logoHeaderUrl);
        if (data.logoMenuUrl) setLogoMenuPreview(data.logoMenuUrl);
        if (data.logoFooterUrl) setLogoFooterPreview(data.logoFooterUrl);
        if (data.bannerHomeUrl) setBannerHomePreview(data.bannerHomeUrl);
        if (data.bannerPromoUrl) setBannerPromoPreview(data.bannerPromoUrl);
      }
    } catch (error) {
      console.error("Erro ao carregar branding:", error);
      showError("Erro ao carregar configurações de branding");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file, setFile, setPreview) => {
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // TODO: Implement file uploads to S3 with fixed URLs
      // For now, just save the branding data
      let uploadedLogoHeaderUrl = branding.logoHeaderUrl;
      let uploadedLogoMenuUrl = branding.logoMenuUrl;
      let uploadedLogoFooterUrl = branding.logoFooterUrl;
      let uploadedBannerHomeUrl = branding.bannerHomeUrl;
      let uploadedBannerPromoUrl = branding.bannerPromoUrl;

      // Upload files (placeholder - will be implemented with S3)
      if (logoHeaderFile) {
        // TODO: Upload to S3
        showError("Upload de arquivos será implementado em breve");
        return;
      }

      // Save OTA branding using PUT
      const response = await clubAdminApi.put("/branding-ota", {
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        backgroundColor: branding.backgroundColor,
        textColor: branding.textColor,
        logoHeaderUrl: uploadedLogoHeaderUrl,
        logoMenuUrl: uploadedLogoMenuUrl,
        logoFooterUrl: uploadedLogoFooterUrl,
        bannerHomeUrl: uploadedBannerHomeUrl,
        bannerPromoUrl: uploadedBannerPromoUrl,
        welcomeMessage: branding.welcomeMessage,
        aboutUs: branding.aboutUs,
        termsUrl: branding.termsUrl,
        privacyUrl: branding.privacyUrl,
        supportEmail: branding.supportEmail,
        supportPhone: branding.supportPhone,
        websiteUrl: branding.websiteUrl,
        instagramUrl: branding.instagramUrl,
        facebookUrl: branding.facebookUrl,
        twitterUrl: branding.twitterUrl,
        linkedinUrl: branding.linkedinUrl
      });

      if (response.data.success) {
        showSuccess("Branding atualizado com sucesso!");

        // Clear file states
        setLogoHeaderFile(null);
        setLogoMenuFile(null);
        setLogoFooterFile(null);
        setBannerHomeFile(null);
        setBannerPromoFile(null);

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

  if (loading && !branding.primaryColor) {
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
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Personalize a identidade visual do seu clube (OTA - Over-The-Air)</p>
        </div>
        <Button
          text="Salvar Alterações"
          className="btn-primary"
          onClick={handleSave}
          isLoading={loading}
          icon="heroicons:check"
        />
      </div>

      {/* Alert - Build-time settings */}
      <Card>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <Icon icon="heroicons:information-circle" className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Informações Importantes sobre Branding
              </h5>
              <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
                Existem dois tipos de configurações de branding:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 ml-4">
                <li>• <strong>Build-time (requer atualização nas lojas)</strong>: Nome do app, ícone principal, splash screen. Apenas o administrador da plataforma pode alterar.</li>
                <li>• <strong>OTA (atualizável via servidor)</strong>: Cores do tema, logos internos, banners, textos. Você pode alterar aqui e as mudanças aparecerão imediatamente no app.</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* App Info (Read-only) */}
      <Card title="Informações do App (somente leitura)" subtitle="Gerenciadas pelo administrador da plataforma">
        <div className="p-6">
          {appInfo.appName ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  Nome do App
                </label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <p className="text-slate-900 dark:text-white font-semibold">{appInfo.appName}</p>
                </div>
              </div>

              {appInfo.appDescription && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Descrição
                  </label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{appInfo.appDescription}</p>
                  </div>
                </div>
              )}

              {appInfo.appIconUrl && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Ícone do App
                  </label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <img src={appInfo.appIconUrl} alt="App Icon" className="w-16 h-16 rounded-xl" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  Versão Atual
                </label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <p className="text-slate-900 dark:text-white font-mono">{appInfo.currentVersion || "N/A"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon icon="heroicons:information-circle" className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configuração do app não encontrada. Entre em contato com o administrador da plataforma.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Paleta de Cores (OTA) */}
      <Card title="Paleta de Cores" subtitle="Atualizável via OTA - mudanças aparecem imediatamente">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <ColorPicker
              label="Cor de Fundo"
              value={branding.backgroundColor}
              onChange={(color) => setBranding({ ...branding, backgroundColor: color })}
              description="Cor de fundo padrão do app"
            />

            <ColorPicker
              label="Cor do Texto"
              value={branding.textColor}
              onChange={(color) => setBranding({ ...branding, textColor: color })}
              description="Cor padrão do texto"
            />
          </div>
        </div>
      </Card>

      {/* Text Content (OTA) */}
      <Card title="Conteúdo de Texto" subtitle="Mensagens e textos personalizados">
        <div className="p-6 space-y-4">
          <Textarea
            label="Mensagem de Boas-vindas"
            value={branding.welcomeMessage}
            onChange={(e) => setBranding({ ...branding, welcomeMessage: e.target.value })}
            placeholder="Mensagem exibida aos novos usuários..."
            rows={3}
          />

          <Textarea
            label="Sobre Nós"
            value={branding.aboutUs}
            onChange={(e) => setBranding({ ...branding, aboutUs: e.target.value })}
            placeholder="Informações sobre o clube..."
            rows={4}
          />
        </div>
      </Card>

      {/* Support & Links (OTA) */}
      <Card title="Suporte e Links" subtitle="Informações de contato e redes sociais">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="Email de Suporte"
              value={branding.supportEmail}
              onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
              placeholder="suporte@clube.com"
              type="email"
            />

            <Textinput
              label="Telefone de Suporte"
              value={branding.supportPhone}
              onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
              placeholder="(00) 0000-0000"
            />

            <Textinput
              label="Website"
              value={branding.websiteUrl}
              onChange={(e) => setBranding({ ...branding, websiteUrl: e.target.value })}
              placeholder="https://seuclube.com"
            />

            <Textinput
              label="Termos de Uso (URL)"
              value={branding.termsUrl}
              onChange={(e) => setBranding({ ...branding, termsUrl: e.target.value })}
              placeholder="https://seuclube.com/termos"
            />

            <Textinput
              label="Política de Privacidade (URL)"
              value={branding.privacyUrl}
              onChange={(e) => setBranding({ ...branding, privacyUrl: e.target.value })}
              placeholder="https://seuclube.com/privacidade"
            />

            <Textinput
              label="Instagram"
              value={branding.instagramUrl}
              onChange={(e) => setBranding({ ...branding, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/seuclube"
            />

            <Textinput
              label="Facebook"
              value={branding.facebookUrl}
              onChange={(e) => setBranding({ ...branding, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/seuclube"
            />

            <Textinput
              label="Twitter/X"
              value={branding.twitterUrl}
              onChange={(e) => setBranding({ ...branding, twitterUrl: e.target.value })}
              placeholder="https://twitter.com/seuclube"
            />

            <Textinput
              label="LinkedIn"
              value={branding.linkedinUrl}
              onChange={(e) => setBranding({ ...branding, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/company/seuclube"
            />
          </div>
        </div>
      </Card>

      {/* Preview Mobile - Full Width */}
      <div className="mt-6">
        <Card title="Pré-visualização do Aplicativo" subtitle="Veja como seu app ficará nos dispositivos móveis">
          <div className="p-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
              <AppPreview
                appName={appInfo.appName || "Nome do App"}
                appDescription={appInfo.appDescription || "Descrição do app"}
                logoUrl={appInfo.appIconUrl}
                logoIconUrl={appInfo.appIconUrl}
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
                  Esta é uma pré-visualização aproximada. O resultado real pode variar conforme o dispositivo e versão do sistema operacional. Nome e ícone do app são definidos pelo administrador da plataforma.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <Icon icon="heroicons:light-bulb" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Dicas de Branding (OTA)</h5>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Use cores que reflitam a identidade do seu clube e garantam boa legibilidade</li>
                    <li>• Mantenha consistência nas suas escolhas de cores em todos os elementos</li>
                    <li>• As mudanças de cor aparecem imediatamente no app sem necessidade de atualização nas lojas</li>
                    <li>• Teste as cores em diferentes dispositivos e modos (claro/escuro)</li>
                    <li>• Para mudar nome, ícone ou splash do app, entre em contato com o administrador da plataforma</li>
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

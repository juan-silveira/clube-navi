"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import AppPreview from "@/components/branding/AppPreview";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8033";

const AppConfigPage = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [appConfig, setAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    appName: "",
    appDescription: "",
    tenantSlug: "",
    splashBackgroundColor: "#FFFFFF",
    appIconUrl: "",
    splashScreenUrl: "",
    appStoreUrl: "",
    playStoreUrl: "",
    autoBuildEnabled: true
  });

  // File states for upload
  const [appIconFile, setAppIconFile] = useState(null);
  const [appIconPreview, setAppIconPreview] = useState(null);
  const [splashFile, setSplashFile] = useState(null);
  const [splashPreview, setSplashPreview] = useState(null);

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    if (selectedClub) {
      loadAppConfig(selectedClub.id);
    }
  }, [selectedClub]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      // Buscar lista de clubes
      const response = await axios.get(`${API_URL}/api/clubs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setClubs(response.data.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar clubes:", error);
      toast.error("Erro ao carregar clubes");
    } finally {
      setLoading(false);
    }
  };

  const loadAppConfig = async (clubId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/admin/app-config/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        const config = response.data.data;
        setAppConfig(config);
        setFormData({
          appName: config.appName || "",
          appDescription: config.appDescription || "",
          tenantSlug: config.tenantSlug || "",
          splashBackgroundColor: config.splashBackgroundColor || "#FFFFFF",
          appIconUrl: config.appIconUrl || "",
          splashScreenUrl: config.splashScreenUrl || "",
          appStoreUrl: config.appStoreUrl || "",
          playStoreUrl: config.playStoreUrl || "",
          autoBuildEnabled: config.autoBuildEnabled ?? true
        });
        setAppIconPreview(config.appIconUrl);
        setSplashPreview(config.splashScreenUrl);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Clube não tem config ainda
        setAppConfig(null);
        resetForm();
      } else {
        console.error("Erro ao carregar configuração:", error);
        toast.error("Erro ao carregar configuração");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      appName: selectedClub?.companyName || "",
      appDescription: "",
      tenantSlug: "",
      splashBackgroundColor: "#FFFFFF",
      appIconUrl: "",
      splashScreenUrl: "",
      appStoreUrl: "",
      playStoreUrl: "",
      autoBuildEnabled: true
    });
    setAppIconFile(null);
    setAppIconPreview(null);
    setSplashFile(null);
    setSplashPreview(null);
  };

  const handleCreateConfig = () => {
    if (!selectedClub) {
      toast.error("Selecione um clube primeiro");
      return;
    }
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditConfig = () => {
    if (!appConfig) return;
    setShowEditModal(true);
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");

      if (!formData.appName.trim()) {
        toast.error("Nome do app é obrigatório");
        return;
      }

      let payload = { ...formData };

      // Criar ou atualizar configuração primeiro
      let configResponse;
      if (appConfig) {
        // Update
        configResponse = await axios.put(
          `${API_URL}/api/admin/app-config/${selectedClub.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create
        payload.clubId = selectedClub.id;
        configResponse = await axios.post(
          `${API_URL}/api/admin/app-config`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (!configResponse.data.success) {
        throw new Error(configResponse.data.message || "Erro ao salvar configuração");
      }

      // Fazer upload de arquivos se necessário
      if (appIconFile) {
        const iconFormData = new FormData();
        iconFormData.append('icon', appIconFile);

        const iconUploadResponse = await axios.post(
          `${API_URL}/api/admin/app-config/${selectedClub.id}/upload-icon`,
          iconFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (iconUploadResponse.data.success) {
          toast.success("Ícone do app enviado com sucesso");
          setAppIconPreview(iconUploadResponse.data.data.url);
        }
      }

      if (splashFile) {
        const splashFormData = new FormData();
        splashFormData.append('splash', splashFile);

        const splashUploadResponse = await axios.post(
          `${API_URL}/api/admin/app-config/${selectedClub.id}/upload-splash`,
          splashFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (splashUploadResponse.data.success) {
          toast.success("Splash screen enviado com sucesso");
          setSplashPreview(splashUploadResponse.data.data.url);
        }
      }

      // Recarregar configuração
      await loadAppConfig(selectedClub.id);

      toast.success(appConfig ? "Configuração atualizada com sucesso" : "Configuração criada com sucesso");
      setShowEditModal(false);
      setShowCreateModal(false);

      // Limpar arquivos
      setAppIconFile(null);
      setSplashFile(null);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  const handleAppIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAppIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSplashUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSplashFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSplashPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIncrementBuild = async (platform) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.patch(
        `${API_URL}/api/admin/app-config/${selectedClub.id}/increment-build`,
        { platform },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Build ${platform} incrementado`);
        loadAppConfig(selectedClub.id);
      }
    } catch (error) {
      console.error("Erro ao incrementar build:", error);
      toast.error("Erro ao incrementar build");
    }
  };

  if (loading && clubs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
            Configuração de Apps
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gerenciar configurações de build-time dos apps (requer atualização nas lojas)
          </p>
        </div>
      </div>

      {/* Seletor de Clube */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Selecionar Clube
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => setSelectedClub(club)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedClub?.id === club.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 dark:text-primary-300 text-lg font-bold">
                      {club.companyName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {club.companyName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {club.slug}
                    </p>
                  </div>
                  {selectedClub?.id === club.id && (
                    <Icon icon="heroicons:check-circle-solid" className="w-6 h-6 text-primary-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Configuração do App */}
      {selectedClub && (
        <>
          {appConfig ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Info Card */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Informações do App
                    </h3>
                    <Button
                      onClick={handleEditConfig}
                      className="btn-sm btn-primary"
                    >
                      <Icon icon="heroicons:pencil" className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* App Name */}
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Nome do App
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {appConfig.appName}
                      </p>
                    </div>

                    {/* Description */}
                    {appConfig.appDescription && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Descrição
                        </label>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {appConfig.appDescription}
                        </p>
                      </div>
                    )}

                    {/* Bundle IDs */}
                    <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Tenant Slug
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-white">
                          {appConfig.tenantSlug}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Bundle ID (iOS)
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-white">
                          {appConfig.bundleId}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Package Name (Android)
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-white">
                          {appConfig.packageName}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          URL Scheme
                        </label>
                        <p className="text-sm font-mono text-slate-900 dark:text-white">
                          {appConfig.urlScheme}://
                        </p>
                      </div>
                    </div>

                    {/* Version Info */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Versão
                        </label>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {appConfig.currentVersion}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Build iOS
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {appConfig.iosBuildNumber}
                          </p>
                          <button
                            onClick={() => handleIncrementBuild('ios')}
                            className="text-primary-600 hover:text-primary-700"
                            title="Incrementar"
                          >
                            <Icon icon="heroicons:plus-circle" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Build Android
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {appConfig.androidBuildNumber}
                          </p>
                          <button
                            onClick={() => handleIncrementBuild('android')}
                            className="text-primary-600 hover:text-primary-700"
                            title="Incrementar"
                          >
                            <Icon icon="heroicons:plus-circle" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Store Status */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                          App Store
                        </label>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          appConfig.appStoreStatus === 'PUBLISHED'
                            ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'
                            : appConfig.appStoreStatus === 'IN_REVIEW'
                            ? 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {appConfig.appStoreStatus}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                          Play Store
                        </label>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          appConfig.playStoreStatus === 'PUBLISHED'
                            ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'
                            : appConfig.playStoreStatus === 'IN_REVIEW'
                            ? 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {appConfig.playStoreStatus}
                        </span>
                      </div>
                    </div>

                    {/* Auto Build */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={appConfig.autoBuildEnabled}
                          disabled
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Incluir em builds automáticos
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Preview Card */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Preview do App
                  </h3>
                  <div className="flex justify-center">
                    <AppPreview
                      appName={appConfig.appName}
                      appDescription={appConfig.appDescription}
                      logoUrl={appConfig.appIconUrl}
                      logoIconUrl={appConfig.appIconUrl}
                      primaryColor="#3B82F6"
                      secondaryColor="#10B981"
                      accentColor="#F59E0B"
                      userName="Usuário"
                      showSplash={true}
                    />
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <div className="p-12 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                  <Icon icon="heroicons:device-phone-mobile" className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhuma Configuração Encontrada
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Este clube ainda não possui configuração de app.
                </p>
                <Button onClick={handleCreateConfig} className="btn-primary">
                  <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                  Criar Configuração
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modal Criar */}
      <Modal
        activeModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Configuração de App"
        className="max-w-3xl"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              text="Cancelar"
              className="btn-outline-secondary"
              onClick={() => setShowCreateModal(false)}
            />
            <Button
              text="Criar"
              className="btn-primary"
              onClick={handleSaveConfig}
              disabled={saving}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <Textinput
            label="Nome do App"
            placeholder="Ex: Clube Force"
            value={formData.appName}
            onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
            required
          />

          <Textarea
            label="Descrição"
            placeholder="Descrição do app para as lojas..."
            rows={3}
            value={formData.appDescription}
            onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
          />

          <Textinput
            label="Tenant Slug (opcional)"
            placeholder="Se vazio, será gerado automaticamente"
            value={formData.tenantSlug}
            onChange={(e) => setFormData({ ...formData, tenantSlug: e.target.value })}
            helpText="Apenas letras minúsculas, números e hífens"
          />

          <div>
            <label className="form-label">Cor de Fundo do Splash</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.splashBackgroundColor}
                onChange={(e) => setFormData({ ...formData, splashBackgroundColor: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <Textinput
                value={formData.splashBackgroundColor}
                onChange={(e) => setFormData({ ...formData, splashBackgroundColor: e.target.value })}
                placeholder="#FFFFFF"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cor de fundo do splash screen nativo (requer rebuild)
            </p>
          </div>

          <div>
            <label className="form-label">Ícone do App (1024x1024)</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleAppIconUpload}
              className="form-control"
            />
            {appIconPreview && (
              <img src={appIconPreview} alt="Preview" className="mt-2 w-24 h-24 rounded-lg" />
            )}
          </div>

          <div>
            <label className="form-label">Splash Screen</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleSplashUpload}
              className="form-control"
            />
            {splashPreview && (
              <img src={splashPreview} alt="Preview" className="mt-2 w-24 h-48 rounded-lg object-cover" />
            )}
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoBuildEnabled}
                onChange={(e) => setFormData({ ...formData, autoBuildEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Incluir em builds automáticos
              </span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal
        activeModal={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Configuração"
        className="max-w-3xl"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              text="Cancelar"
              className="btn-outline-secondary"
              onClick={() => setShowEditModal(false)}
            />
            <Button
              text="Salvar"
              className="btn-primary"
              onClick={handleSaveConfig}
              disabled={saving}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <Textinput
            label="Nome do App"
            value={formData.appName}
            onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
          />

          <Textarea
            label="Descrição"
            rows={3}
            value={formData.appDescription}
            onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
          />

          <div>
            <label className="form-label">Cor de Fundo do Splash</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.splashBackgroundColor}
                onChange={(e) => setFormData({ ...formData, splashBackgroundColor: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <Textinput
                value={formData.splashBackgroundColor}
                onChange={(e) => setFormData({ ...formData, splashBackgroundColor: e.target.value })}
              />
            </div>
          </div>

          <Textinput
            label="URL da App Store"
            value={formData.appStoreUrl}
            onChange={(e) => setFormData({ ...formData, appStoreUrl: e.target.value })}
          />

          <Textinput
            label="URL da Play Store"
            value={formData.playStoreUrl}
            onChange={(e) => setFormData({ ...formData, playStoreUrl: e.target.value })}
          />

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoBuildEnabled}
                onChange={(e) => setFormData({ ...formData, autoBuildEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Incluir em builds automáticos</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppConfigPage;

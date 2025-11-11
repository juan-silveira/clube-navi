"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import { useAlertContext } from "@/contexts/AlertContext";
import { clubAdminApi } from "@/services/api";

const BrandingPage = () => {
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
  const { showSuccess, showError } = useAlertContext();

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const response = await clubAdminApi.get("/branding");
      if (response.data) {
        setBranding(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar branding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await clubAdminApi.post("/branding", branding);
      showSuccess("Branding atualizado com sucesso!");
      await loadBranding();
    } catch (error) {
      console.error("Erro ao salvar branding:", error);
      showError("Erro ao salvar branding");
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do App */}
        <div className="lg:col-span-2 space-y-6">
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

          {/* Logos e Ícones */}
          <Card title="Logos e Ícones" subtitle="URLs das imagens do clube">
            <div className="p-6 space-y-4">
              <Textinput
                label="URL do Logo Principal"
                value={branding.logoUrl || ""}
                onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
              />

              <Textinput
                label="URL do Logo Ícone"
                value={branding.logoIconUrl || ""}
                onChange={(e) => setBranding({ ...branding, logoIconUrl: e.target.value })}
                placeholder="https://exemplo.com/icon.png"
              />

              <Textinput
                label="URL do Favicon"
                value={branding.faviconUrl || ""}
                onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                placeholder="https://exemplo.com/favicon.ico"
              />

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-2">
                  <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Dicas para imagens:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Logo principal: 200x50px (PNG com fundo transparente)</li>
                      <li>Logo ícone: 128x128px (PNG quadrado)</li>
                      <li>Favicon: 32x32px (ICO ou PNG)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cores */}
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

        {/* Preview */}
        <div className="space-y-6">
          <Card title="Pré-visualização" subtitle="Como ficará no app">
            <div className="p-6">
              {/* Preview do App */}
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#f8fafc' }}>
                {/* Header Preview */}
                <div className="text-center space-y-2">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Logo" className="h-12 mx-auto" />
                  ) : (
                    <div className="h-12 w-32 bg-slate-300 dark:bg-slate-600 rounded mx-auto flex items-center justify-center">
                      <Icon icon="heroicons:photo" className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{branding.appName || "Nome do App"}</h3>
                  <p className="text-xs text-slate-600">{branding.appDescription || "Descrição do app"}</p>
                </div>

                {/* Botões Preview */}
                <div className="space-y-2">
                  <button
                    className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    Botão Primário
                  </button>
                  <button
                    className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: branding.secondaryColor }}
                  >
                    Botão Secundário
                  </button>
                  <button
                    className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: branding.accentColor }}
                  >
                    Botão de Destaque
                  </button>
                </div>

                {/* Card Preview */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: branding.primaryColor }}></div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex gap-2">
                  <Icon icon="heroicons:eye" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Esta é uma pré-visualização aproximada. O resultado real pode variar conforme o dispositivo.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Dicas */}
          <Card>
            <div className="p-6">
              <div className="flex gap-2">
                <Icon icon="heroicons:light-bulb" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Dicas de Branding</h5>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Use cores que reflitam a identidade do seu clube</li>
                    <li>• Garanta boa legibilidade com contraste adequado</li>
                    <li>• Mantenha consistência nas suas escolhas</li>
                    <li>• Teste em diferentes dispositivos</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandingPage;

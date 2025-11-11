"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { useAlertContext } from "@/contexts/AlertContext";
import { clubAdminApi } from "@/services/api";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    companyDocument: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    subdomain: "",
    adminSubdomain: "",
    customDomain: "",
    status: "active"
  });
  const { showSuccess, showError } = useAlertContext();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await clubAdminApi.get("/settings");
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await clubAdminApi.post("/settings", settings);
      showSuccess("Configurações salvas com sucesso!");
      await loadSettings();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      showError("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.companyName) {
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
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações do Clube</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure as informações gerais do seu clube</p>
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
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <Card title="Informações da Empresa" subtitle="Dados cadastrais do clube">
            <div className="p-6 space-y-4">
              <Textinput
                label="Nome da Empresa"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                placeholder="Ex: Minha Empresa Ltda"
              />

              <Textinput
                label="CNPJ"
                value={settings.companyDocument}
                onChange={(e) => setSettings({ ...settings, companyDocument: e.target.value })}
                placeholder="00.000.000/0000-00"
                disabled
              />

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex gap-2">
                  <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    O CNPJ não pode ser alterado após o cadastro. Entre em contato com o suporte se precisar fazer alterações.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card title="Informações de Contato" subtitle="Dados do responsável pelo clube">
            <div className="p-6 space-y-4">
              <Textinput
                label="Nome do Responsável"
                value={settings.contactName}
                onChange={(e) => setSettings({ ...settings, contactName: e.target.value })}
                placeholder="Nome completo"
              />

              <Textinput
                label="Email de Contato"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="contato@exemplo.com"
              />

              <Textinput
                label="Telefone"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </Card>

          {/* Domain Configuration */}
          <Card title="Configuração de Domínios" subtitle="URLs de acesso ao clube">
            <div className="p-6 space-y-4">
              <div>
                <Textinput
                  label="Subdomínio do Clube"
                  value={settings.subdomain || ""}
                  onChange={(e) => setSettings({ ...settings, subdomain: e.target.value })}
                  placeholder="meu-clube"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  URL do app: <span className="font-mono">{settings.subdomain || 'meu-clube'}.localhost:8033</span>
                </p>
              </div>

              <div>
                <Textinput
                  label="Subdomínio do Admin"
                  value={settings.adminSubdomain || ""}
                  onChange={(e) => setSettings({ ...settings, adminSubdomain: e.target.value })}
                  placeholder="admin-meu-clube"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  URL do admin: <span className="font-mono">{settings.adminSubdomain || 'admin-meu-clube'}.localhost:3001</span>
                </p>
              </div>

              <div>
                <Textinput
                  label="Domínio Customizado (Opcional)"
                  value={settings.customDomain || ""}
                  onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
                  placeholder="meuclube.com.br"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure um domínio próprio para seu clube
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-2">
                  <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>Alterações nos domínios podem afetar o acesso dos usuários. Teste antes de finalizar.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card title="Status do Clube">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Status Atual</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  settings.status === 'active' ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300' :
                  settings.status === 'trial' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {settings.status === 'active' ? 'Ativo' :
                   settings.status === 'trial' ? 'Trial' :
                   settings.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Icon icon="heroicons:users" className="w-4 h-4" />
                  <span>Membros ativos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Icon icon="heroicons:building-storefront" className="w-4 h-4" />
                  <span>Comerciantes cadastrados</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Icon icon="heroicons:shopping-bag" className="w-4 h-4" />
                  <span>Produtos disponíveis</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Ações Rápidas">
            <div className="p-6 space-y-3">
              <Button
                text="Gerar Relatório"
                className="btn-outline-primary w-full"
                icon="heroicons:document-chart-bar"
                link="/reports"
              />
              <Button
                text="Gerenciar Módulos"
                className="btn-outline-secondary w-full"
                icon="heroicons:squares-2x2"
                link="/modules"
              />
              <Button
                text="Personalizar Branding"
                className="btn-outline-warning w-full"
                icon="heroicons:paint-brush"
                link="/branding"
              />
            </div>
          </Card>

          {/* Help */}
          <Card>
            <div className="p-6">
              <div className="flex gap-2">
                <Icon icon="heroicons:question-mark-circle" className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Precisa de Ajuda?</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Entre em contato com o suporte se tiver dúvidas sobre as configurações.
                  </p>
                  <Button
                    text="Suporte"
                    className="btn-outline-dark btn-sm w-full"
                    icon="heroicons:chat-bubble-left-right"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

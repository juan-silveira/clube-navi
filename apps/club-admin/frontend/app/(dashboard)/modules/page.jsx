"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import Switch from "@/components/ui/Switch";
import { useAlertContext } from "@/contexts/AlertContext";
import { clubAdminApi } from "@/services/api";

const ModulesPage = () => {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const { showSuccess, showError } = useAlertContext();

  const moduleDefinitions = [
    {
      key: "marketplace",
      name: "Marketplace",
      description: "Sistema de produtos e vendas online",
      icon: "heroicons:shopping-bag",
      color: "primary"
    },
    {
      key: "cashback",
      name: "Cashback",
      description: "Sistema de recompensas e cashback",
      icon: "heroicons:gift",
      color: "success"
    },
    {
      key: "referrals",
      name: "Indicações",
      description: "Programa de indicação de membros",
      icon: "heroicons:user-plus",
      color: "warning"
    },
    {
      key: "giftcards",
      name: "Gift Cards",
      description: "Venda e gerenciamento de gift cards",
      icon: "heroicons:ticket",
      color: "info"
    },
    {
      key: "streaming",
      name: "Streaming",
      description: "Integração com serviços de streaming",
      icon: "heroicons:play-circle",
      color: "danger"
    },
    {
      key: "cinema",
      name: "Cinema",
      description: "Venda de ingressos de cinema",
      icon: "heroicons:film",
      color: "purple"
    },
    {
      key: "telemedicine",
      name: "Telemedicina",
      description: "Consultas médicas online",
      icon: "heroicons:heart",
      color: "pink"
    },
    {
      key: "insurance",
      name: "Seguros",
      description: "Seguros e proteções",
      icon: "heroicons:shield-check",
      color: "cyan"
    },
    {
      key: "internet",
      name: "Internet",
      description: "Planos de internet e conectividade",
      icon: "heroicons:wifi",
      color: "indigo"
    },
    {
      key: "telecom",
      name: "Telecom",
      description: "Planos de telefonia e celular",
      icon: "heroicons:phone",
      color: "teal"
    }
  ];

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await clubAdminApi.get("/modules");
      setModules(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
      showError("Erro ao carregar módulos");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleKey, currentStatus) => {
    try {
      await clubAdminApi.post(`/modules/${moduleKey}/toggle`, {
        isEnabled: !currentStatus
      });

      showSuccess(`Módulo ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      await loadModules();
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error);
      showError("Erro ao atualizar módulo");
    }
  };

  const getModuleStatus = (moduleKey) => {
    const module = modules.find(m => m.moduleKey === moduleKey);
    return module?.isEnabled ?? false;
  };

  if (loading && modules.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Módulos</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Ative ou desative funcionalidades do seu clube</p>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <div className="p-4 flex items-start gap-3">
          <Icon icon="heroicons:information-circle" className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-medium mb-1">Sobre os Módulos</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Os módulos permitem customizar as funcionalidades disponíveis no seu clube. Ative apenas os módulos
              que você pretende usar para simplificar a experiência dos seus membros.
            </p>
          </div>
        </div>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moduleDefinitions.map((moduleDef) => {
          const isEnabled = getModuleStatus(moduleDef.key);

          return (
            <Card key={moduleDef.key} className={`transition-all ${isEnabled ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-${moduleDef.color}-100 dark:bg-${moduleDef.color}-900 flex items-center justify-center`}>
                      <Icon icon={moduleDef.icon} className={`w-6 h-6 text-${moduleDef.color}-600 dark:text-${moduleDef.color}-300`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-base font-semibold text-slate-900 dark:text-white">{moduleDef.name}</h5>
                        {isEnabled && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300 rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{moduleDef.description}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    <Switch
                      value={isEnabled}
                      onChange={() => toggleModule(moduleDef.key, isEnabled)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Modules Summary */}
      <Card title="Resumo" subtitle="Módulos ativos no seu clube">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="heroicons:squares-2x2" className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {modules.filter(m => m.isEnabled).length} de {moduleDefinitions.length} módulos ativos
            </span>
          </div>

          {modules.filter(m => m.isEnabled).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {moduleDefinitions
                .filter(def => getModuleStatus(def.key))
                .map(def => (
                  <span key={def.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    <Icon icon={def.icon} className="w-4 h-4" />
                    {def.name}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum módulo ativo</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ModulesPage;

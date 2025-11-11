"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AppPreview from "@/components/branding/AppPreview";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://clube-navi.localhost:8033";

// Ícones para cada módulo
const MODULE_ICONS = {
  marketplace: "heroicons:shopping-bag",
  internet: "heroicons:globe-alt",
  cinema: "heroicons:film",
  telemedicine: "heroicons:heart",
  giftcards: "heroicons:gift",
  insurance: "heroicons:shield-check",
  streaming: "heroicons:play-circle",
  referrals: "heroicons:user-plus",
  cashback: "heroicons:currency-dollar",
  telecom: "heroicons:phone"
};

const AppLayoutPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Carregar módulos do clube
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      const response = await axios.get(`${API_URL}/api/club-admin/modules`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Clube-Slug": clubSlug
        }
      });

      if (response.data.success) {
        setModules(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
      toast.error("Erro ao carregar módulos");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleId) => {
    try {
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      const response = await axios.patch(
        `${API_URL}/api/club-admin/modules/${moduleId}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clube-Slug": clubSlug
          }
        }
      );

      if (response.data.success) {
        setModules(prev =>
          prev.map(m =>
            m.id === moduleId ? { ...m, isEnabled: response.data.data.isEnabled } : m
          )
        );
        toast.success(
          response.data.data.isEnabled
            ? "Módulo ativado com sucesso"
            : "Módulo desativado com sucesso"
        );
      }
    } catch (error) {
      console.error("Erro ao alternar módulo:", error);
      toast.error("Erro ao alternar módulo");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedItem === null || draggedItem === index) return;

    const newModules = [...modules];
    const draggedModule = newModules[draggedItem];

    // Remove from old position
    newModules.splice(draggedItem, 1);

    // Insert at new position
    newModules.splice(index, 0, draggedModule);

    setModules(newModules);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      // Atualizar sortOrder de todos os módulos
      const reorderedModules = modules.map((module, index) => ({
        id: module.id,
        sortOrder: index
      }));

      const response = await axios.put(
        `${API_URL}/api/club-admin/modules/reorder`,
        { modules: reorderedModules },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clube-Slug": clubSlug
          }
        }
      );

      if (response.data.success) {
        setModules(response.data.data);
        toast.success("Ordem dos módulos atualizada");
      }
    } catch (error) {
      console.error("Erro ao reordenar módulos:", error);
      toast.error("Erro ao reordenar módulos");
      // Recarregar para reverter mudanças em caso de erro
      fetchModules();
    } finally {
      setSaving(false);
      setDraggedItem(null);
    }
  };

  // Filtrar apenas módulos ativos para o preview
  const activeModules = modules.filter(m => m.isEnabled);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Layout do App</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Configure a ordem e visibilidade dos módulos no aplicativo mobile
            </p>
          </div>
        </div>
        <Card>
          <div className="text-center py-16">
            <Icon icon="heroicons:arrow-path" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">Carregando módulos...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Layout do App</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Configure a ordem e visibilidade dos módulos no aplicativo mobile
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Módulos */}
        <Card title="Módulos Disponíveis" headerslot={
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Icon icon="heroicons:information-circle" className="w-4 h-4" />
            <span>Arraste para reordenar</span>
          </div>
        }>
          <div className="space-y-2">
            {modules.length === 0 ? (
              <div className="text-center py-8">
                <Icon icon="heroicons:inbox" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Nenhum módulo disponível</p>
              </div>
            ) : (
              modules.map((module, index) => (
                <div
                  key={module.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-move
                    ${module.isEnabled
                      ? "bg-white dark:bg-slate-800 border-primary-200 dark:border-primary-800"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60"
                    }
                    ${draggedItem === index ? "opacity-50 scale-95" : "hover:shadow-md"}
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Icon icon="heroicons:bars-3" className="w-5 h-5 text-slate-400" />
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${module.isEnabled
                          ? "bg-primary-100 dark:bg-primary-900"
                          : "bg-slate-200 dark:bg-slate-700"
                        }
                      `}
                    >
                      <Icon
                        icon={MODULE_ICONS[module.moduleKey] || "heroicons:cube"}
                        className={`w-6 h-6 ${module.isEnabled ? "text-primary-600 dark:text-primary-400" : "text-slate-400"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {module.displayName}
                      </p>
                      {module.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${module.isEnabled ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600"}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${module.isEnabled ? "translate-x-6" : "translate-x-1"}
                      `}
                    />
                  </button>
                </div>
              ))
            )}
          </div>

          {saving && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400">
              <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
              <span>Salvando ordem...</span>
            </div>
          )}
        </Card>

        {/* Preview do App */}
        <Card title="Preview do App" headerslot={
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>{activeModules.length} módulo(s) ativo(s)</span>
          </div>
        }>
          <div className="flex justify-center py-4">
            {activeModules.length === 0 ? (
              <div className="text-center py-16">
                <Icon icon="heroicons:device-phone-mobile" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ative módulos para visualizar o preview
                </p>
              </div>
            ) : (
              <AppPreview modules={activeModules} moduleIcons={MODULE_ICONS} />
            )}
          </div>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card>
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Como funciona o Layout do App
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Ativar/Desativar:</strong> Use o toggle para controlar quais módulos aparecem no app</li>
              <li>• <strong>Reordenar:</strong> Arraste e solte os módulos para definir a ordem de exibição</li>
              <li>• <strong>Preview em tempo real:</strong> Veja como o app ficará para os usuários</li>
              <li>• <strong>Sincronização automática:</strong> As mudanças são salvas automaticamente</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppLayoutPage;

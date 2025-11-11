"use client";
import React from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações do Clube</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure as definições gerais do clube</p>
        </div>
      </div>
      <Card>
        <div className="text-center py-16">
          <Icon icon="heroicons:cog-6-tooth" className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Página de Configurações</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Configure as definições gerais do sistema</p>
        </div>
      </Card>
    </div>
  );
};
export default SettingsPage;

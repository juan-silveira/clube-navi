"use client";
import React from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Notificações Push</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Envie notificações para os membros</p>
        </div>
      </div>
      <Card>
        <div className="text-center py-16">
          <Icon icon="heroicons:bell" className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Página de Notificações</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Configure e envie notificações push</p>
        </div>
      </Card>
    </div>
  );
};
export default NotificationsPage;

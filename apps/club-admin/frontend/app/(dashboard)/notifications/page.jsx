"use client";
import React from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Notificações</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Sistema de notificações gerais (em desenvolvimento)
        </p>
      </div>

      <Card>
        <div className="p-12 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <Icon icon="heroicons:bell" className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Sistema de Notificações
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Esta página será utilizada para gerenciar notificações gerais do sistema,
            como emails, alertas internos, e outras comunicações não-push.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/push-notifications"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Icon icon="heroicons:device-phone-mobile" className="w-5 h-5" />
              <span>Ir para Push Notifications</span>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationsPage;

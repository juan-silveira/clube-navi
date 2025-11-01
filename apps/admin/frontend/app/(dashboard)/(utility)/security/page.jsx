"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import ChangePasswordModal from "@/components/partials/security/ChangePasswordModal";
import TwoFactorSetup from "@/components/security/TwoFactorSetup";
import Link from "next/link";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "@/hooks/useTranslation";

const SecurityPage = () => {
  const { t } = useTranslation('security');
  // Hook para gerenciar título da aba com contagem de notificações
  useDocumentTitle(t('pageTitle'), 'Coinage', true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <div className="min-h-screen py-8">
        <div className="px-2 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Security Settings */}
          <div className="space-y-6">
            {/* Main Security Cards - 2FA and Change Password */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Two-Factor Authentication */}
              <TwoFactorSetup />

              {/* Change Password */}
              <Card className="p-6 bg-white dark:bg-slate-800">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                    <Icon icon="heroicons-outline:lock-closed" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('changePassword.title')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('changePassword.description')}
                    </p>
                  </div>
                </div>

                <Tooltip
                  content={t('changePassword.tooltip')}
                  placement="top"
                  maxWidth={350}
                >
                  <div className="w-full">
                    <Button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t('changePassword.button')}
                    </Button>
                  </div>
                </Tooltip>
              </Card>
            </div>

            {/* Additional Security Features (commented out for now) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
              {/* Placeholder for future features */}

            {/* API Keys - COMMENTED OUT UNTIL IMPLEMENTED */}
            {/* <Card className="p-6 bg-white dark:bg-slate-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-4">
                  <Icon icon="heroicons-outline:key" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chaves da API
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gerencie suas chaves de integração
                  </p>
                </div>
              </div>
              <Link href="/api-key">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Gerenciar Chaves
                </Button>
              </Link>
            </Card> */}

            {/* Login History - COMMENTED OUT UNTIL IMPLEMENTED */}
            {/* <Card className="p-6 bg-white dark:bg-slate-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mr-4">
                  <Icon icon="heroicons-outline:clock" className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Histórico de Login
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitore acessos à sua conta
                  </p>
                </div>
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Ver Histórico
              </Button>
            </Card> */}

            {/* Device Management - COMMENTED OUT UNTIL IMPLEMENTED */}
            {/* <Card className="p-6 bg-white dark:bg-slate-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mr-4">
                  <Icon icon="heroicons-outline:device-phone-mobile" className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dispositivos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gerencie dispositivos conectados
                  </p>
                </div>
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Gerenciar Dispositivos
              </Button>
            </Card> */}

            {/* Privacy Settings - COMMENTED OUT UNTIL IMPLEMENTED */}
            {/* <Card className="p-6 bg-white dark:bg-slate-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mr-4">
                  <Icon icon="heroicons-outline:eye-slash" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Privacidade
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure suas preferências de privacidade
                  </p>
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Configurar Privacidade
              </Button>
            </Card> */}
            </div>
          </div>

          {/* Security Tips */}
          <div className="mt-8">
            <Card className="p-6 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('tips.title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons-outline:check-circle" className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('tips.strongPassword.title')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('tips.strongPassword.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons-outline:check-circle" className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('tips.enable2FA.title')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('tips.enable2FA.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons-outline:check-circle" className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('tips.authenticatorApp.title')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('tips.authenticatorApp.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons-outline:check-circle" className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('tips.backupCodes.title')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('tips.backupCodes.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons-outline:check-circle" className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('tips.monitorActivity.title')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('tips.monitorActivity.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icon icon="heroicons-outline:check-circle" className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('tips.operationProtection.title')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('tips.operationProtection.description')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default SecurityPage;
"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';
import { ShieldX, AlertTriangle } from 'lucide-react';

const Disable2FAAdmin = ({ userId, onDisabled }) => {
  const { t } = useTranslation('admin');
  const { showSuccess, showError } = useAlertContext();
  const [loading, setLoading] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const [methods, setMethods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    load2FAStatus();
  }, [userId]);

  const load2FAStatus = async () => {
    try {
      const response = await api.get(`/api/2fa/admin/${userId}/status`);

      if (response.data.success) {
        setHas2FA(response.data.data.has2FA);
        setMethods(response.data.data.methods || []);
      }
    } catch (error) {
      console.error('Erro ao carregar status 2FA:', error);
    }
  };

  const handleDisable = async () => {
    if (!selectedMethod) {
      showError(t('users.profile.twoFA.selectMethod'));
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/2fa/admin/${userId}/disable`, {
        type: selectedMethod
      });

      if (response.data.success) {
        showSuccess(t('users.profile.twoFA.disabled'));
        setShowModal(false);
        setSelectedMethod(null);
        await load2FAStatus();

        if (onDisabled) {
          onDisabled();
        }
      }
    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error);
      showError(error.response?.data?.message || t('users.profile.twoFA.errorDisabling'));
    } finally {
      setLoading(false);
    }
  };

  if (!has2FA || methods.length === 0) {
    return null;
  }

  return (
    <>
      <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldX className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-300">
                {t('users.profile.twoFA.active')}
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                {t('users.profile.twoFA.activeDesc')}
              </p>
              <div className="mt-2 space-y-1">
                {methods.map((method, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">
                      {method.type === 'totp' ? t('users.profile.twoFA.authenticatorApp') : method.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              if (methods.length === 1) {
                setSelectedMethod(methods[0].type);
              }
              setShowModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0"
          >
            <ShieldX size={16} className="mr-2" />
            {t('users.profile.twoFA.disable')}
          </Button>
        </div>
      </div>

      <Modal
        title={t('users.profile.twoFA.disableTitle')}
        activeModal={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedMethod(null);
        }}
      >
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-red-800 dark:text-red-300">
                <strong>{t('users.profile.twoFA.warning')}:</strong> {t('users.profile.twoFA.warningDesc')}
              </div>
            </div>
          </div>

          {methods.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('users.profile.twoFA.selectMethodLabel')}
              </label>
              <div className="space-y-2">
                {methods.map((method) => (
                  <label
                    key={method.type}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <input
                      type="radio"
                      name="2fa-method"
                      value={method.type}
                      checked={selectedMethod === method.type}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {method.type === 'totp' ? t('users.profile.twoFA.authenticatorApp') : method.type.toUpperCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setShowModal(false);
                setSelectedMethod(null);
              }}
              className="btn-outline-dark"
            >
              {t('users.profile.cancel')}
            </Button>
            <Button
              onClick={handleDisable}
              isLoading={loading}
              disabled={!selectedMethod}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('users.profile.twoFA.confirmDisable')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Disable2FAAdmin;

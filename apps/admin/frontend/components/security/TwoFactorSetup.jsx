"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Modal from '@/components/ui/Modal';
import Tooltip from '@/components/ui/Tooltip';
import useDarkmode from '@/hooks/useDarkMode';
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';
import { Shield, ShieldCheck, Copy, Download, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const TwoFactorSetup = () => {
  const [isDark] = useDarkmode();
  const { showSuccess, showError, showInfo } = useAlertContext();
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [methods, setMethods] = useState([]);
  const { t } = useTranslation('security'); // Usa o namespace 'security'

  // Setup TOTP
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [setupStep, setSetupStep] = useState(1); // 1=QR, 2=Verificação, 3=Backup codes

  // Disable 2FA
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [useBackupCodeForDisable, setUseBackupCodeForDisable] = useState(false);

  // Classes baseadas no tema atual
  const themeClasses = {
    heading: isDark ? "!text-white" : "!text-gray-900",
    text: isDark ? "!text-slate-300" : "!text-gray-600",
    qrContainer: isDark
      ? "bg-slate-800 border-slate-700"
      : "bg-white border-gray-200",
    codeBox: isDark
      ? "bg-gray-800 !text-white"
      : "bg-gray-100 !text-gray-900",
    button: {
      outline: isDark
        ? "bg-slate-700 border-slate-600 !text-gray-300 hover:bg-slate-600"
        : "bg-white border-gray-300 !text-gray-700 hover:bg-gray-50",
      primary: "bg-primary-500 hover:bg-primary-600 !text-white"
    }
  };

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/2fa/methods');

      if (response.data.success) {
        setMethods(response.data.data.methods || []);
        setIs2FAEnabled(response.data.data.hasActive2FA);
      }
    } catch (error) {
      console.error('Erro ao carregar status 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/2fa/totp/setup');

      if (response.data.success) {
        setQrCode(response.data.data.qrCode);
        setSecret(response.data.data.manualEntryKey);
        setShowSetupModal(true);
        setSetupStep(1);
      }
    } catch (error) {
      console.error('Erro ao iniciar setup 2FA:', error);
      // Usando tradução para a mensagem de erro padrão
      showError(error.response?.data?.message || t('errors.default2FAConfigError')); 
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndActivate = async () => {
    try {
      if (!verificationCode || verificationCode.length !== 6) {
        // Usando tradução para a mensagem de erro
        showError(t('twoFactorAuthentication.errors.enterSixDigitCode'));
        return;
      }

      setLoading(true);
      const response = await api.post('/api/2fa/totp/verify', {
        code: verificationCode
      });

      if (response.data.success) {
        setBackupCodes(response.data.data.backupCodes);
        setSetupStep(3);
        // Usando tradução para a mensagem de sucesso
        showSuccess(t('twoFactorAuthentication.messages.enabledSuccess')); 
        await load2FAStatus();
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      // Usando tradução para a mensagem de erro
      showError(error.response?.data?.message || t('twoFactorAuthentication.errors.invalidCode')); 
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const expectedLength = useBackupCodeForDisable ? 8 : 6;

      if (!disableCode || disableCode.length !== expectedLength) {
        // Usando tradução para a mensagem de erro
        const lengthType = useBackupCodeForDisable ? t('twoFactorAuthentication.disable.characters') : t('twoFactorAuthentication.disable.digits');
        showError(t('twoFactorAuthentication.disable.enterCodeToConfirm', { length: expectedLength, type: lengthType }));
        return;
      }

      setLoading(true);
      const response = await api.post('/api/2fa/disable', {
        method: 'totp',
        confirmationCode: disableCode
      });

      if (response.data.success) {
        // Usando tradução para a mensagem de sucesso
        showSuccess(t('twoFactorAuthentication.messages.disabledSuccess'));
        setShowDisableModal(false);
        setDisableCode('');
        setUseBackupCodeForDisable(false);
        await load2FAStatus();
      }
    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error);
      // Usando tradução para a mensagem de erro
      showError(error.response?.data?.message || t('twoFactorAuthentication.errors.defaultDisableError'));
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    // Usando tradução
    showInfo(t('twoFactorAuthentication.setup.secretCopied'));
  };

  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    // Usando tradução
    showInfo(t('twoFactorAuthentication.backup.codesCopied'));
  };

  const downloadBackupCodes = () => {
    // Usando tradução para o conteúdo do arquivo
    const text = t('twoFactorAuthentication.backup.downloadFileContent', {
      date: new Date().toLocaleDateString(),
      codes: backupCodes.join('\n')
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coinage-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Usando tradução para a mensagem de sucesso
    showSuccess(t('twoFactorAuthentication.backup.codesDownloadedSuccess'));
  };

  const closeSetupModal = () => {
    setShowSetupModal(false);
    setQrCode(null);
    setSecret('');
    setVerificationCode('');
    setBackupCodes([]);
    setSetupStep(1);
  };

  return (
    <>
      <Card className="p-6 bg-white dark:bg-slate-800">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
              is2FAEnabled
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-orange-100 dark:bg-orange-900/20'
            }`}>
              {is2FAEnabled ? (
                <ShieldCheck className={`w-6 h-6 text-green-600 dark:text-green-400`} />
              ) : (
                <Shield className={`w-6 h-6 text-orange-600 dark:text-orange-400`} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {/* Tradução: Two-Factor Authentication (2FA) */}
                {t('twoFactorAuthentication.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {is2FAEnabled
                  ? // Tradução: Sua conta está protegida com 2FA
                    t('twoFactorAuthentication.messages.accountProtected')
                  : // Tradução: Add an extra layer of security
                    t('twoFactorAuthentication.description')}
              </p>
            </div>
          </div>
          {is2FAEnabled && (
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
              {/* Tradução: Ativo */}
              {t('common.active')} 
            </div>
          )}
        </div>

        <div className="space-y-4">

          {is2FAEnabled && methods.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {/* Tradução: Métodos Ativos: */}
                {t('twoFactorAuthentication.activeMethods.title')}
              </h4>
              <div className="space-y-2">
                {methods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {/* Tradução: App Autenticador */}
                        {method.type === 'totp' ? t('twoFactorAuthentication.activeMethods.authenticatorApp') : method.type.toUpperCase()}
                      </span>
                    </div>
                    {method.lastUsedAt && (
                      <span className="text-xs text-gray-500">
                        {/* Tradução: Último uso: */}
                        {t('twoFactorAuthentication.activeMethods.lastUsed')}: {new Date(method.lastUsedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!is2FAEnabled ? (
            <Tooltip
              // Tradução: Two-factor authentication adds an extra layer of security...
              content={t('twoFactorAuthentication.tooltip')} 
              placement="top"
              maxWidth={350}
            >
              <div className="w-full">
                <Button
                  onClick={handleStartSetup}
                  isLoading={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  icon="heroicons:shield-check"
                  // Tradução: Enable 2FA
                  text={t('twoFactorAuthentication.enable')}
                />
              </div>
            </Tooltip>
          ) : (
            <Tooltip
              // Tradução: Desabilitar o 2FA reduzirá a segurança da sua conta...
              content={t('twoFactorAuthentication.disable.tooltip')} 
              placement="top"
              maxWidth={350}
            >
              <div className="w-full">
                <Button
                  onClick={() => setShowDisableModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {/* Tradução: Disable 2FA */}
                  {t('twoFactorAuthentication.disable.button')}
                </Button>
              </div>
            </Tooltip>
          )}
        </div>
      </Card>

      {/* Modal de Setup */}
      <Modal
        // Tradução: Configurar Autenticação em Dois Fatores
        title={t('twoFactorAuthentication.setup.modalTitle')}
        activeModal={showSetupModal}
        onClose={closeSetupModal}
        className="max-w-2xl"
      >
        {setupStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-2 ${themeClasses.heading}`}>
                {/* Tradução: Passo 1: Escaneie o QR Code */}
                {t('twoFactorAuthentication.setup.step1Title')}
              </h3>
              <p className={`text-sm ${themeClasses.text}`}>
                {/* Tradução: Use seu app autenticador... */}
                {t('twoFactorAuthentication.setup.step1Description')}
              </p>
            </div>

            {qrCode && (
              <div className="flex justify-center">
                <div className={`p-4 rounded-lg border ${themeClasses.qrContainer}`}>
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>
            )}

            <div className={`border-t pt-4 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              <p className={`text-sm mb-2 ${themeClasses.text}`}>
                {/* Tradução: Ou insira manualmente a chave: */}
                {t('twoFactorAuthentication.setup.manualKeyLabel')}
              </p>
              <div className="flex items-center gap-2">
                <code className={`flex-1 px-3 py-2 rounded text-sm font-mono break-all ${themeClasses.codeBox}`}>
                  {secret}
                </code>
                <Button onClick={copySecret} className={`!p-2 ${themeClasses.button.outline}`}>
                  <Copy size={18} />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={closeSetupModal} className={themeClasses.button.outline}>
                {/* Tradução: Cancelar */}
                {t('common.cancel')}
              </Button>
              <Button onClick={() => setSetupStep(2)} className={themeClasses.button.primary}>
                {/* Tradução: Próximo */}
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}

        {setupStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-2 ${themeClasses.heading}`}>
                {/* Tradução: Passo 2: Verificar Código */}
                {t('twoFactorAuthentication.setup.step2Title')}
              </h3>
              <p className={`text-sm ${themeClasses.text}`}>
                {/* Tradução: Digite o código de 6 dígitos... */}
                {t('twoFactorAuthentication.setup.step2Description')}
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <Textinput
                // Tradução: Código de Verificação
                label={t('twoFactorAuthentication.setup.verificationCodeLabel')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setSetupStep(1)} className={themeClasses.button.outline}>
                {/* Tradução: Voltar */}
                {t('common.back')}
              </Button>
              <Button
                onClick={handleVerifyAndActivate}
                isLoading={loading}
                disabled={verificationCode.length !== 6}
                className={themeClasses.button.primary}
              >
                {/* Tradução: Verificar e Ativar */}
                {t('twoFactorAuthentication.setup.verifyAndActivate')}
              </Button>
            </div>
          </div>
        )}

        {setupStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${themeClasses.heading}`}>
                {/* Tradução: 2FA Ativado com Sucesso! */}
                {t('twoFactorAuthentication.setup.step3SuccessTitle')}
              </h3>
              <p className={`text-sm ${themeClasses.text}`}>
                {/* Tradução: Guarde seus códigos de backup em local seguro */}
                {t('twoFactorAuthentication.setup.step3Description')}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-orange-800 dark:text-orange-300">
                  {/* Tradução: Importante: */}
                  <strong>{t('common.important')}:</strong>
                  {/* Tradução: Guarde estes códigos de backup... */}
                  {t('twoFactorAuthentication.backup.importantWarning')}
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code key={index} className={`px-3 py-2 rounded text-sm font-mono text-center ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={copyBackupCodes} className={`flex-1 ${themeClasses.button.outline}`}>
                <Copy size={18} className="mr-2" />
                {/* Tradução: Copiar Códigos */}
                {t('twoFactorAuthentication.backup.copyCodesButton')}
              </Button>
              <Button onClick={downloadBackupCodes} className={`flex-1 ${themeClasses.button.outline}`}>
                <Download size={18} className="mr-2" />
                {/* Tradução: Baixar Códigos */}
                {t('twoFactorAuthentication.backup.downloadCodesButton')}
              </Button>
            </div>

            <div className="flex justify-end">
              <Button onClick={closeSetupModal} className={themeClasses.button.primary}>
                {/* Tradução: Concluir */}
                {t('common.finish')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Desabilitar */}
      <Modal
        // Tradução: Desabilitar Autenticação em Dois Fatores
        title={t('twoFactorAuthentication.disable.modalTitle')}
        activeModal={showDisableModal}
        onClose={() => {
          setShowDisableModal(false);
          setDisableCode('');
          setUseBackupCodeForDisable(false);
        }}
      >
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-red-800 dark:text-red-300">
                {/* Tradução: Atenção: */}
                <strong>{t('common.attention')}:</strong>
                {/* Tradução: Desabilitar o 2FA reduzirá a segurança da sua conta. */}
                {t('twoFactorAuthentication.disable.warningBase')}
                {useBackupCodeForDisable
                  ? // Tradução: Digite um código de backup para confirmar.
                    t('twoFactorAuthentication.disable.warningBackupCode')
                  : // Tradução: Digite o código do seu app autenticador para confirmar.
                    t('twoFactorAuthentication.disable.warningAuthenticatorCode')
                }
              </div>
            </div>
          </div>

          <Textinput
            // Tradução: Código de Backup / Código de Confirmação
            label={useBackupCodeForDisable ? t('twoFactorAuthentication.disable.backupCodeLabel') : t('twoFactorAuthentication.disable.confirmationCodeLabel')}
            value={disableCode}
            onChange={(e) => {
              const maxLength = useBackupCodeForDisable ? 8 : 6;
              const cleanValue = useBackupCodeForDisable
                ? e.target.value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase().slice(0, maxLength)
                : e.target.value.replace(/\D/g, "").slice(0, maxLength);
              setDisableCode(cleanValue);
            }}
            placeholder={useBackupCodeForDisable ? "A3F2B8C1" : "000000"}
            className="text-center text-xl tracking-widest font-mono"
            maxLength={useBackupCodeForDisable ? 8 : 6}
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCodeForDisable(!useBackupCodeForDisable);
                setDisableCode('');
              }}
              className={`text-sm font-medium transition-colors ${
                isDark
                  ? 'text-primary-400 hover:text-primary-300'
                  : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              {useBackupCodeForDisable
                ? // Tradução: ← Voltar para código do autenticador
                  t('twoFactorAuthentication.disable.backToAuthenticatorCode')
                : // Tradução: Usar código de backup 2FA →
                  t('twoFactorAuthentication.disable.useBackupCode')
              }
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setShowDisableModal(false);
                setDisableCode('');
                setUseBackupCodeForDisable(false);
              }}
              className={themeClasses.button.outline}
            >
              {/* Tradução: Cancelar */}
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDisable2FA}
              isLoading={loading}
              disabled={disableCode.length !== (useBackupCodeForDisable ? 8 : 6)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {/* Tradução: Desabilitar 2FA */}
              {t('twoFactorAuthentication.disable.button')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TwoFactorSetup;
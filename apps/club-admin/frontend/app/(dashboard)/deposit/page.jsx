"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import useAuthStore from "@/store/authStore";
import { useAlertContext } from "@/contexts/AlertContext";
import useDarkmode from "@/hooks/useDarkMode";
import useCacheData from "@/hooks/useCacheData";
import useCurrencyMask from "@/hooks/useCurrencyMask";
import { useTranslation } from "@/hooks/useTranslation";
// Removed mock services - using only real API

const DepositPage = () => {
  const { t } = useTranslation('deposit');
  useDocumentTitle(t('pageTitle'), 'Clube Digital', true);

  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkmode();
  const { cachedUser } = useCacheData();

  // Estados do wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Estados para cálculo de taxas
  const [feeCalculation, setFeeCalculation] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);

  // Estados do modal
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Hook para máscara de moeda
  const {
    value: depositAmount,
    formatDisplayValue,
    getNumericValue,
    isValidAmount: isValidAmountHook,
    clearValue,
    inputProps: currencyInputProps
  } = useCurrencyMask();

  // Validação do valor
  const isValidAmount = () => {
    return isValidAmountHook();
  };

  // Função para calcular taxas (usando valores fixos)
  const calculateFees = async (amount) => {
    if (!amount || amount < 0.01) {
      setFeeCalculation(null);
      return;
    }

    setLoadingFees(true);
    
    // Usar taxas fixas sem chamar API
    const defaultFee = 3.0; // Taxa fixa R$ 3,00
    setFeeCalculation({
      desiredAmount: amount,
      fee: defaultFee,
      feePercent: 0.001,
      totalAmount: amount + defaultFee,
      netAmount: amount, // Valor que vai receber em cBRL
      grossAmount: amount + defaultFee,
      isVip: false,
      vipLevel: 0
    });
    
    setLoadingFees(false);
  };

  // Função para continuar para o próximo passo
  const handleContinue = async () => {
    if (isValidAmount()) {
      const amount = getNumericValue();
      // Calcular taxas localmente sem API
      calculateFees(amount);
      setCurrentStep(2);
    } else {
      showError(t('messages.invalidAmount'));
    }
  };

  // Função para voltar ao passo anterior
  const handleBack = () => {
    setCurrentStep(1);
  };

  // Função para processar o depósito
  const handleDeposit = async () => {
    if (!isValidAmount()) {
      showError(t('messages.invalidAmount'));
      return;
    }

    setLoading(true);

    try {
      // Usar função do hook para obter valor numérico
      const amount = getNumericValue();
      
      // Validar se o valor é um número válido
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0.01) {
        showError(t('messages.invalidValue'), t('messages.invalidAmount'));
        return;
      }
      
      // DESENVOLVIMENTO: Criar depósito via API sem JWT (v2)
      console.log('🚀 Iniciando depósito com valor:', amount, 'userId:', user?.id || '5e8fd1b6-9969-44a8-bcb5-0dd832b1d973');
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          userId: user?.id || '5e8fd1b6-9969-44a8-bcb5-0dd832b1d973', // Fallback para desenvolvimento
          paymentMethod: 'pix'
        })
      });

      console.log('📡 Resposta do servidor:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        
        if (data.success) {
          showSuccess(
            t('messages.successTitle'),
            t('messages.successMessage')
          );
          
          // USAR APENAS O UUID REAL DO BANCO - NUNCA MAIS pixPaymentId
          if (data.data?.transactionId) {
            console.log('🔄 [DEPOSIT] Redirecionando para PIX com UUID real:', data.data.transactionId);
            router.push(`/deposit/pix/${data.data.transactionId}`);
          } else {
            console.error('❌ [DEPOSIT] TransactionId não encontrado!', data.data);
            showError(t('messages.errorTitle'), t('messages.transactionIdNotFound'));
            setCurrentStep(1);
            clearValue();
          }
        } else {
          showError(t('messages.errorTitle'), data.message || t('messages.depositError'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(t('messages.apiError'), errorData.message || t('messages.apiCommunicationError'));
      }
    } catch (error) {
      console.error("Erro no depósito:", error);
      showError(t('messages.depositError'), t('messages.tryAgainLater'));
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar rede Azore na MetaMask
  const addAzoreToMetamask = async () => {
    if (typeof window.ethereum === "undefined") {
      showError(
        t('messages.metamaskNotFound'),
        t('messages.installMetamask')
      );
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x2260", // 8800 em hexadecimal
            chainName: "Azore",
            nativeCurrency: {
              name: "Azore",
              symbol: "AZE",
              decimals: 18,
            },
            rpcUrls: ["https://rpc-mainnet.azore.technology"],
            blockExplorerUrls: ["https://azorescan.com"],
          },
        ],
      });

      showSuccess(
        t('messages.networkAdded'),
        t('messages.networkAddedMessage')
      );
      setShowTokenModal(false);
    } catch (error) {
      if (error.code === 4902) {
        showError(
          t('messages.networkExists'),
          t('messages.networkExistsMessage')
        );
      } else {
        showError(
          t('messages.errorAddingNetwork'),
          t('messages.errorAddingNetworkMessage')
        );
      }
    }
  };

  // Renderizar passo atual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('step1.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('step1.subtitle')}
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="space-y-2">
                <label className="block capitalize form-label">
                  {t('step1.amountLabel')}
                </label>
                <input
                  type="text"
                  {...currencyInputProps}
                  className="form-control py-2 text-center text-2xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div className="mt-4 text-sm text-gray-500 text-center">
                {t('step1.minAmount')}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleContinue}
                disabled={!isValidAmount()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
              >
                {t('step1.continueButton')}
              </Button>

              <Button
                onClick={() => setShowTokenModal(true)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3"
              >
                {t('step1.depositTokensButton')}
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('step2.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('step2.subtitle')}
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Card className="p-6">
                {loadingFees ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {t('step2.calculating')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('step2.desiredAmount')}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDisplayValue(depositAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('step2.fee')}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {feeCalculation?.fee ? `R$ ${feeCalculation.fee.toFixed(2)}` : 'R$ 3,00'}
                        {feeCalculation?.isVip && (
                          <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                            {t('step2.vipLevel', { level: feeCalculation.vipLevel })}
                          </span>
                        )}
                      </span>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {t('step2.totalToPay')}
                      </span>
                      <span className="text-xl font-bold text-red-600 dark:text-red-400">
                        {feeCalculation?.totalAmount ?
                          `R$ ${feeCalculation.totalAmount.toFixed(2)}` :
                          'R$ --,--'
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {t('step2.finalAmount')}
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {feeCalculation?.netAmount ?
                          `${feeCalculation.netAmount.toFixed(2)} cBRL` :
                          '--,-- cBRL'
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>{t('step2.importantNote')}</strong> {t('step2.importantText')}
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleBack}
                className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-3"
              >
                {t('step2.backButton')}
              </Button>

              <Button
                onClick={handleDeposit}
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:arrow-path" className="w-5 h-5 animate-spin" />
                    <span>{t('step2.processing')}</span>
                  </div>
                ) : (
                  t('step2.depositButton')
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            {t('steps.amount')}
          </span>
          <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            {t('steps.confirmation')}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {renderStep()}
      </div>

      <Modal
        title={t('tokenModal.title')}
        activeModal={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        sizeClass="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tokenModal.howTo')}
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
              {t('tokenModal.description')} <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>MetaMask</span>
            </p>

            {/* User Address */}
            {(cachedUser?.publicKey || user?.publicKey) && (
              <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'} mb-4`}>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon icon="heroicons:key" className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium uppercase ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {t('tokenModal.yourAddress')}
                  </span>
                </div>
                <div className={`font-mono text-xs break-all text-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {cachedUser?.publicKey || user?.publicKey}
                </div>
              </div>
            )}

            {/* Debug - remove later */}
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} text-center`}>
              Debug: cachedUser: {cachedUser ? 'Sim' : 'Não'}, publicKey: {cachedUser?.publicKey ? 'Sim' : 'Não'}, user publicKey: {user?.publicKey ? 'Sim' : 'Não'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-slate-800 border-blue-400' : 'bg-slate-100 border-blue-500'}`}>
            <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {t('tokenModal.networkData')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('tokenModal.name')}</span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>Azore</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{t('tokenModal.rpcUrl')}</span>
                <span className={`font-mono text-xs break-all ${isDark ? 'text-white' : 'text-slate-900'}`}>https://rpc-mainnet.azore.technology</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('tokenModal.chainId')}</span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>8800</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('tokenModal.symbol')}</span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>AZE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('tokenModal.explorer')}</span>
                <span className={`font-mono text-xs break-all ${isDark ? 'text-white' : 'text-slate-900'}`}>https://azorescan.com</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={addAzoreToMetamask}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
            >
              <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
              {t('tokenModal.addToMetamask')}
            </Button>

            <Button
              onClick={() => setShowTokenModal(false)}
              className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-2"
            >
              {t('tokenModal.closeButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DepositPage;

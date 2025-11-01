import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { MinusCircle } from 'lucide-react';
import api from '@/services/api';
import { useAlertContext } from '@/contexts/AlertContext';
import useDarkmode from '@/hooks/useDarkMode';
import useTokenMask from '@/hooks/useTokenMask';
import { BalanceDisplay } from '@/utils/balanceUtils';
import { useTranslation } from 'react-i18next';

const UnstakeModal = ({ isOpen, onClose, contract, userAddress, userStake, tokenSymbol, onSuccess }) => {
  const { t } = useTranslation('investments');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkmode();

  // Hook para máscara de token
  const {
    value: amount,
    getNumericValue,
    isValidAmount,
    clearValue: clearAmount,
    setValue: setAmount,
    inputProps: tokenInputProps
  } = useTokenMask();


  const handleMaxAmount = () => {
    if (userStake && userStake !== '0') {
      // Usar o valor exato do stake sem conversões que introduzam erro
      setAmount(parseFloat(userStake));
    }
  };

  const handleUnstake = async () => {
    if (!isValidAmount()) {
      showError(t('modals.unstake.errorInvalidAmount'));
      return;
    }

    // Obter valor numérico do hook
    const numericValue = getNumericValue();

    if (numericValue > parseFloat(userStake)) {
      showError(t('modals.unstake.errorExceedsBalance'));
      return;
    }

    try {
      setLoading(true);
      
      console.log('Unstaking with params:', {
        contractAddress: contract.address,
        userAddress: userAddress,
        displayAmount: amount,
        numericValue: numericValue,
        network: contract.network
      });
      
      const response = await api.post(`/api/stakes/${contract.address}/withdraw`, {
        user: userAddress,  // Backend espera 'user', não 'userAddress'
        amount: numericValue.toString(),  // Backend espera em ETH, não Wei (igual ao StakeModal)
      });

      if (response.data.success) {
        showSuccess(t('modals.unstake.successMessage', { amount, symbol: tokenSymbol }));
        onSuccess && onSuccess();
        onClose();
        clearAmount();
      } else {
        throw new Error(response.data.message || t('modals.unstake.errorInvalidAmount'));
      }
    } catch (error) {
      console.error('Error unstaking:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else if (error.response?.data?.error) {
        showError(error.response.data.error);
      } else {
        showError(error.message || t('modals.unstake.errorInvalidAmount'));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={t('modals.unstake.title')}
      centered
      footerContent={
        <div className="flex space-x-3">
          <Button
            text={t('modals.unstake.cancelButton')}
            className="btn-outline-danger"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            text={loading ? t('modals.unstake.processing') : t('modals.unstake.confirmButton')}
            className="btn-warning"
            onClick={handleUnstake}
            disabled={loading || !isValidAmount() || getNumericValue() > parseFloat(userStake)}
            isLoading={loading}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isDark ? "bg-orange-900/20" : "bg-orange-50"}`}>
          <div className="flex items-start space-x-3">
            <MinusCircle className={`mt-1 ${isDark ? "text-orange-400" : "text-orange-600"}`} size={20} />
            <div>
              <h4 className={`font-medium ${isDark ? "text-orange-300" : "text-orange-900"}`}>
                {t('modals.unstake.unstakeTitle')}
              </h4>
              <p className={`text-sm mt-1 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                {t('modals.unstake.description')}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>{t('modals.unstake.availableBalance')}</span>
              <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                <BalanceDisplay value={userStake} symbol={tokenSymbol} />
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {t('modals.unstake.amountLabel', { symbol: tokenSymbol })}
                </label>
                <Button
                  text={t('modals.unstake.maxButton')}
                  className="btn-sm btn-outline-primary"
                  onClick={handleMaxAmount}
                  disabled={loading || parseFloat(userStake) <= 0}
                />
              </div>
              <input
                {...tokenInputProps}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={loading}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {t('modals.unstake.decimalHint')}
              </p>
            </div>

            {amount && getNumericValue() > 0 && getNumericValue() > parseFloat(userStake) && (
              <div className={`p-3 rounded-md ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                <p className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`}>
                  <strong>{t('modals.unstake.exceedsStake')}</strong> {t('modals.unstake.exceedsStakeDesc', {
                    stakeBalance: parseFloat(userStake).toLocaleString('pt-BR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6
                    }),
                    symbol: tokenSymbol
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-amber-900/20" : "bg-amber-50"}`}>
          <p className={`text-sm ${isDark ? "text-amber-400" : "text-amber-700"}`}>
            <strong>{t('modals.unstake.noteTitle')}</strong> {t('modals.unstake.noteDesc')}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
          <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-700"}`}>
            <strong>{t('modals.unstake.importantTitle')}</strong> {t('modals.unstake.importantDesc')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default UnstakeModal;
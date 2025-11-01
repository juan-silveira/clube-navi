import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { useAlertContext } from '@/contexts/AlertContext';
import useDarkmode from '@/hooks/useDarkMode';
import { BalanceDisplay } from '@/utils/balanceUtils';
import { useTranslation } from 'react-i18next';

const ClaimRewardsModal = ({ isOpen, onClose, contract, userAddress, rewardsAmount, tokenSymbol, onSuccess }) => {
  const { t } = useTranslation('investments');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkmode();

  const handleClaim = async () => {
    try {
      setLoading(true);
      
      console.log('Claiming rewards with params:', {
        contractAddress: contract.address,
        userAddress: userAddress,
        network: contract.network,
        adminAddress: contract.adminAddress || contract.metadata?.adminAddress,
        fullContract: contract
      });
      
      const response = await api.post(`/api/stakes/${contract.address}/claim-rewards`, {
        user: userAddress
      });

      if (response.data.success) {
        showSuccess(t('modals.claim.successMessage'));
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(response.data.message || t('modals.claim.successMessage'));
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      // Melhor tratamento de erro
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else if (error.response?.data?.error) {
        showError(error.response.data.error);
      } else {
        showError(error.message || t('modals.claim.successMessage'));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={t('modals.claim.title')}
      centered
      footerContent={
        <div className="flex space-x-3">
          <Button
            text={t('modals.claim.cancelButton')}
            className="btn-outline-danger"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            text={loading ? t('modals.claim.processing') : t('modals.claim.confirmButton')}
            className="btn-primary"
            onClick={handleClaim}
            disabled={loading}
            isLoading={loading}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`mt-1 ${isDark ? "text-blue-400" : "text-blue-600"}`} size={20} />
            <div>
              <h4 className={`font-medium ${isDark ? "text-blue-300" : "text-blue-900"}`}>
                {t('modals.claim.confirmationTitle')}
              </h4>
              <p className={`text-sm mt-1 ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                {t('modals.claim.description')}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>{t('modals.claim.amountToReceive')}</span>
              <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                <BalanceDisplay value={rewardsAmount} symbol={tokenSymbol} />
              </span>
            </div>
            {/* <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>Taxa de gás:</span>
              <span className={`font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
                Grátis (pago pelo admin)
              </span>
            </div> */}
          </div>
        </div>

        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {t('modals.claim.noteDesc')}
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
          <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-700"}`}>
            <strong>{t('modals.claim.importantTitle')}</strong> {t('modals.claim.importantDesc')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimRewardsModal;
import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TrendingUp } from 'lucide-react';
import api from '@/services/api';
import { useAlertContext } from '@/contexts/AlertContext';
import useDarkmode from '@/hooks/useDarkMode';
import { BalanceDisplay, weiToDecimal } from '@/utils/balanceUtils';
import { useTranslation } from 'react-i18next';

const CompoundRewardsModal = ({ isOpen, onClose, contract, userAddress, rewardsAmount, tokenSymbol, onSuccess, totalEmission, totalStaked }) => {
  const { t } = useTranslation('investments');
  const [loading, setLoading] = useState(false);
  const [loadingTotalStaked, setLoadingTotalStaked] = useState(false);
  const [currentTotalStaked, setCurrentTotalStaked] = useState('0');
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkmode();

  // Carregar total staked atual
  useEffect(() => {
    if (isOpen && contract) {
      loadCurrentTotalStaked();
    }
  }, [isOpen, contract]);

  const loadCurrentTotalStaked = async () => {
    try {
      setLoadingTotalStaked(true);

      const response = await api.post('/api/contracts/read', {
        contractAddress: contract.address,
        functionName: 'getTotalStakedSupply',
        params: [],
        network: contract.network || 'testnet'
      });

      if (response.data.success && response.data.data?.result) {
        const totalStakedInWei = response.data.data.result;
        const totalStakedInEther = weiToDecimal(totalStakedInWei, 18);
        setCurrentTotalStaked(totalStakedInEther);
      } else {
        setCurrentTotalStaked('0');
      }
    } catch (error) {
      console.error('Error loading total staked:', error);
      setCurrentTotalStaked('0');
    } finally {
      setLoadingTotalStaked(false);
    }
  };

  const handleCompound = async () => {
    // Verificar limite máximo de emissão antes de enviar SOMENTE se totalEmission estiver definido
    const contractTotalEmission = contract.metadata?.totalEmission || totalEmission;
    if (contractTotalEmission && contractTotalEmission > 0) {
      const currentStaked = parseFloat(currentTotalStaked);
      const rewardsValue = parseFloat(rewardsAmount);
      const availableToStake = contractTotalEmission - currentStaked;

      if (rewardsValue > availableToStake) {
        showError(t('modals.compound.errorExceedsLimit', {
          rewardsValue: rewardsValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
          }),
          symbol: tokenSymbol,
          available: availableToStake.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
          })
        }));
        return;
      }
    }

    try {
      setLoading(true);

      console.log('Compounding rewards with params:', {
        contractAddress: contract.address,
        userAddress: userAddress,
        network: contract.network
      });

      const response = await api.post(`/api/stakes/${contract.address}/compound`, {
        user: userAddress
      });

      if (response.data.success) {
        showSuccess(t('modals.compound.successMessage'));
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(response.data.message || t('modals.compound.successMessage'));
      }
    } catch (error) {
      console.error('Error compounding rewards:', error);
      // Melhor tratamento de erro
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else if (error.response?.data?.error) {
        showError(error.response.data.error);
      } else {
        showError(error.message || t('modals.compound.successMessage'));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={t('modals.compound.title')}
      centered
      footerContent={
        <div className="flex space-x-3">
          <Button
            text={t('modals.compound.cancelButton')}
            className="btn-outline-danger"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            text={loading ? t('modals.compound.processing') : t('modals.compound.confirmButton')}
            className="btn-success"
            onClick={handleCompound}
            disabled={loading || (() => {
              const contractTotalEmission = contract.metadata?.totalEmission || totalEmission;
              // SOMENTE desabilitar botão se totalEmission estiver definido E exceder o limite
              if (contractTotalEmission && contractTotalEmission > 0) {
                const currentStaked = parseFloat(currentTotalStaked);
                const rewardsValue = parseFloat(rewardsAmount);
                const availableToStake = contractTotalEmission - currentStaked;
                return rewardsValue > availableToStake;
              }
              return false;
            })()}
            isLoading={loading}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
          <div className="flex items-start space-x-3">
            <TrendingUp className={`mt-1 ${isDark ? "text-green-400" : "text-green-600"}`} size={20} />
            <div>
              <h4 className={`font-medium ${isDark ? "text-green-300" : "text-green-900"}`}>
                {t('modals.compound.autoReinvest')}
              </h4>
              <p className={`text-sm mt-1 ${isDark ? "text-green-400" : "text-green-700"}`}>
                {t('modals.compound.description')}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>{t('modals.compound.amountToReinvest')}</span>
              <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                <BalanceDisplay value={rewardsAmount} symbol={tokenSymbol} />
              </span>
            </div>
            {/* <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>Taxa de gás:</span>
              <span className={`font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
                Grátis (pago pelo admin)
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>Efeito:</span>
              <span className={`font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                Aumenta seu stake total
              </span>
            </div> */}
          </div>
        </div>

        {(() => {
          const contractTotalEmission = contract.metadata?.totalEmission || totalEmission;
          // SOMENTE mostrar aviso se totalEmission estiver definido
          if (contractTotalEmission && contractTotalEmission > 0) {
            const currentStaked = parseFloat(currentTotalStaked);
            const rewardsValue = parseFloat(rewardsAmount);
            const availableToStake = contractTotalEmission - currentStaked;

            if (rewardsValue > availableToStake) {
              return (
                <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                  <p className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`}>
                    <strong>{t('modals.compound.emissionLimitReached')}</strong> {t('modals.compound.emissionLimitDesc', {
                      rewardsValue: rewardsValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 6
                      }),
                      symbol: tokenSymbol,
                      available: availableToStake.toLocaleString('pt-BR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 6
                      }),
                      totalEmission: contractTotalEmission.toLocaleString('pt-BR')
                    })}
                  </p>
                </div>
              );
            }
          }
          return null;
        })()}

        <div className={`p-3 rounded-lg ${isDark ? "bg-amber-900/20" : "bg-amber-50"}`}>
          <p className={`text-sm ${isDark ? "text-amber-400" : "text-amber-700"}`}>
            <strong>{t('modals.compound.noteTitle')}</strong> {t('modals.compound.noteDesc')}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
          <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-700"}`}>
            <strong>{t('modals.compound.importantTitle')}</strong> {t('modals.compound.importantDesc')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CompoundRewardsModal;
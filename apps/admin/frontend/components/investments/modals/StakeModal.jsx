import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';
import api from '@/services/api';
import { useAlertContext } from '@/contexts/AlertContext';
import useDarkmode from '@/hooks/useDarkMode';
import useTokenMask from '@/hooks/useTokenMask';
import { weiToDecimal, BalanceDisplay } from '@/utils/balanceUtils';
import { useTranslation } from 'react-i18next';

const StakeModal = ({ isOpen, onClose, contract, userAddress, tokenSymbol, onSuccess, totalEmission, totalStaked }) => {
  const { t } = useTranslation('investments');
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState('0');
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [minStakeValue, setMinStakeValue] = useState('0');
  const [loadingMinStake, setLoadingMinStake] = useState(false);
  const [loadingTotalStaked, setLoadingTotalStaked] = useState(false);
  const [currentTotalStaked, setCurrentTotalStaked] = useState('0');
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

  // Carregar saldo do usuário e valor mínimo de stake quando o modal abrir
  useEffect(() => {
    if (isOpen && contract && userAddress) {
      loadUserBalance();
      loadMinStakeValue();
      loadCurrentTotalStaked();
    }
  }, [isOpen, contract, userAddress]);


  const loadUserBalance = async () => {
    try {
      setLoadingBalance(true);
      
      // Buscar saldo do token do contrato
      const tokenAddress = contract.tokenAddress || contract.stakeToken;
      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        setUserBalance('0');
        return;
      }

      const response = await api.post('/api/contracts/read', {
        contractAddress: tokenAddress,
        functionName: 'balanceOf',
        params: [userAddress],
        network: contract.network || 'testnet'
      });

      if (response.data.success && response.data.data?.result) {
        const balanceInWei = response.data.data.result;
        // Converter de wei para decimal sem perda de precisão
        const balanceInEther = weiToDecimal(balanceInWei, 18);
        setUserBalance(balanceInEther);
      } else {
        setUserBalance('0');
      }
    } catch (error) {
      console.error('Error loading user balance:', error);
      setUserBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadMinStakeValue = async () => {
    try {
      setLoadingMinStake(true);

      const response = await api.post('/api/contracts/read', {
        contractAddress: contract.address,
        functionName: 'minValueStake',
        params: [],
        network: contract.network || 'testnet'
      });

      if (response.data.success && response.data.data?.result) {
        const minValueInWei = response.data.data.result;
        // Converter de wei para decimal sem perda de precisão
        const minValueInEther = weiToDecimal(minValueInWei, 18);
        setMinStakeValue(minValueInEther);
      } else {
        setMinStakeValue('0');
      }
    } catch (error) {
      console.error('Error loading min stake value:', error);
      setMinStakeValue('0');
    } finally {
      setLoadingMinStake(false);
    }
  };

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

  const handleMaxAmount = () => {
    if (userBalance && userBalance !== '0') {
      const userBalanceNum = parseFloat(userBalance);

      // Verificar se há limite de emissão definido
      const contractTotalEmission = contract.metadata?.totalEmission || totalEmission;

      // SOMENTE aplicar limite se totalEmission estiver definido e for maior que 0
      if (contractTotalEmission && contractTotalEmission > 0 && !loadingTotalStaked) {
        const currentStaked = parseFloat(currentTotalStaked);
        const availableToStake = Math.max(contractTotalEmission - currentStaked, 0);

        // Se o saldo do usuário é maior que o disponível no contrato, usar o disponível
        if (userBalanceNum > availableToStake) {
          if (availableToStake > 0) {
            setAmount(availableToStake);
            showSuccess(t('modals.stake.maxAdjusted', {
              amount: availableToStake.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              }),
              symbol: tokenSymbol,
              balance: userBalanceNum.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              })
            }));
          } else {
            showError(t('modals.stake.emissionLimitFull'));
          }
        } else {
          // Caso contrário, usar o saldo total do usuário
          setAmount(userBalanceNum);
        }
      } else {
        // Se não há limite definido, sempre usar o saldo total do usuário
        setAmount(userBalanceNum);
      }
    }
  };

  const handleStake = async () => {
    if (!isValidAmount()) {
      showError(t('modals.stake.errorInvalidAmount'));
      return;
    }

    // Obter valor numérico do hook
    const numericValue = getNumericValue();

    // Verificar se tem saldo suficiente
    const userBalanceNum = parseFloat(userBalance);
    if (numericValue > userBalanceNum) {
      showError(t('modals.stake.errorInsufficientBalance'));
      return;
    }

    // Verificar valor mínimo de stake
    const minStakeNum = parseFloat(minStakeValue);
    if (numericValue < minStakeNum) {
      showError(t('modals.stake.errorMinValue', {
        minValue: minStakeNum.toLocaleString('pt-BR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 6
        }),
        symbol: tokenSymbol
      }));
      return;
    }

    // Verificar limite máximo de emissão SOMENTE se totalEmission estiver definido
    const contractTotalEmission = contract.metadata?.totalEmission || totalEmission;
    if (contractTotalEmission && contractTotalEmission > 0) {
      const currentStaked = parseFloat(currentTotalStaked);
      const availableToStake = contractTotalEmission - currentStaked;

      if (numericValue > availableToStake) {
        showError(t('modals.stake.errorMaxEmission', {
          available: availableToStake.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
          }),
          symbol: tokenSymbol,
          totalEmission: contractTotalEmission.toLocaleString('pt-BR')
        }));
        return;
      }
    }

    try {
      setLoading(true);
      
      const response = await api.post(`/api/stakes/${contract.address}/invest`, {
        user: userAddress,  // Backend espera 'user', não 'userAddress'
        amount: numericValue.toString(),  // Backend espera em ETH, não Wei
        customTimestamp: 0
      });

      if (response.data.success) {
        showSuccess(t('modals.stake.successMessage', { amount, symbol: tokenSymbol }));
        onSuccess && onSuccess();
        onClose();
        clearAmount();
      } else {
        throw new Error(response.data.message || t('modals.stake.errorInvalidAmount'));
      }
    } catch (error) {
      console.error('Error staking:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else if (error.response?.data?.error) {
        showError(error.response.data.error);
      } else {
        showError(error.message || t('modals.stake.errorInvalidAmount'));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={t('modals.stake.title')}
      centered
      footerContent={
        <div className="flex space-x-3">
          <Button
            text={t('modals.stake.cancelButton')}
            className="btn-outline-danger"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            text={loading ? t('modals.stake.processing') : t('modals.stake.confirmButton')}
            className="btn-success"
            onClick={handleStake}
            disabled={loading || !isValidAmount() || getNumericValue() < parseFloat(minStakeValue) || getNumericValue() > parseFloat(userBalance) || (() => {
              const contractTotalEmission = contract.metadata?.totalEmission || totalEmission;
              // SOMENTE desabilitar botão se totalEmission estiver definido E exceder o limite
              if (contractTotalEmission && contractTotalEmission > 0) {
                const currentStaked = parseFloat(currentTotalStaked);
                const availableToStake = contractTotalEmission - currentStaked;
                return getNumericValue() > availableToStake;
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
            <PlusCircle className={`mt-1 ${isDark ? "text-green-400" : "text-green-600"}`} size={20} />
            <div>
              <h4 className={`font-medium ${isDark ? "text-green-300" : "text-green-900"}`}>
                {t('modals.stake.newStake')}
              </h4>
              <p className={`text-sm mt-1 ${isDark ? "text-green-400" : "text-green-700"}`}>
                {t('modals.stake.description')}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>{t('modals.stake.availableBalance')}</span>
              {loadingBalance ? (
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t('productCard.loading')}</span>
              ) : (
                <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  <BalanceDisplay value={userBalance} symbol={tokenSymbol} />
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>{t('modals.stake.minStakeValue')}</span>
              {loadingMinStake ? (
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t('productCard.loading')}</span>
              ) : (
                <span className={`font-medium ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                  <BalanceDisplay value={minStakeValue} symbol={tokenSymbol} />
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {t('modals.stake.amountLabel', { symbol: tokenSymbol })}
                </label>
                <Button
                  text={t('modals.stake.maxButton')}
                  className="btn-sm btn-outline-primary"
                  onClick={handleMaxAmount}
                  disabled={loading || loadingBalance || parseFloat(userBalance) <= 0}
                />
              </div>
              <input
                {...tokenInputProps}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={loading}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {t('modals.stake.decimalHint')}
              </p>
            </div>
            
            {/* {amount && getNumericValue() > 0 && (
              <div className={`p-3 rounded-md ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                  <strong>Valor numérico:</strong> {getNumericValue()} {tokenSymbol}
                </p>
              </div>
            )} */}

            {amount && getNumericValue() > 0 && getNumericValue() < parseFloat(minStakeValue) && (
              <div className={`p-3 rounded-md ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                <p className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`}>
                  <strong>{t('modals.stake.insufficientValue')}</strong> {t('modals.stake.insufficientValueDesc', {
                    minValue: parseFloat(minStakeValue).toLocaleString('pt-BR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6
                    }),
                    symbol: tokenSymbol
                  })}
                </p>
              </div>
            )}

            {amount && getNumericValue() > 0 && getNumericValue() > parseFloat(userBalance) && (
              <div className={`p-3 rounded-md ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                <p className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`}>
                  <strong>{t('modals.stake.insufficientBalance')}</strong> {t('modals.stake.insufficientBalanceDesc')}
                </p>
              </div>
            )}

            {amount && getNumericValue() > 0 && (() => {
              const contractTotalEmission = contract.metadata?.totalEmission || totalEmission;
              // SOMENTE mostrar aviso se totalEmission estiver definido
              if (contractTotalEmission && contractTotalEmission > 0) {
                const currentStaked = parseFloat(currentTotalStaked);
                const availableToStake = contractTotalEmission - currentStaked;
                if (getNumericValue() > availableToStake) {
                  return (
                    <div className={`p-3 rounded-md ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                      <p className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`}>
                        <strong>{t('modals.stake.emissionLimitReached')}</strong> {t('modals.stake.emissionLimitDesc', {
                          available: availableToStake.toLocaleString('pt-BR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 6
                          }),
                          symbol: tokenSymbol
                        })}
                      </p>
                    </div>
                  );
                }
              }
              return null;
            })()}
          </div>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-amber-900/20" : "bg-amber-50"}`}>
          <p className={`text-sm ${isDark ? "text-amber-400" : "text-amber-700"}`}>
            <strong>{t('modals.stake.noteTitle')}</strong> {t('modals.stake.noteDesc')}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
          <p className={`text-sm ${isDark ? "text-blue-400" : "text-blue-700"}`}>
            <strong>{t('modals.stake.importantTitle')}</strong> {t('modals.stake.importantDesc')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default StakeModal;
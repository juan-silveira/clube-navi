"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Select from '@/components/ui/Select';
import Icon from '@/components/ui/Icon';
import { ChevronDown } from 'lucide-react';
import { useAlertContext } from '@/contexts/AlertContext';
import useAuthStore from '@/store/authStore';
import useConfig from "@/hooks/useConfig";
import useCachedBalances from '@/hooks/useCachedBalances';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import useCurrencyMaskExtended from '@/hooks/useCurrencyMaskExtended';
import useDocumentValidation from '@/hooks/useDocumentValidation';
import DocumentValidationRequired from '@/components/ui/DocumentValidationRequired';
import useTwoFactorVerification from '@/hooks/useTwoFactorVerification';
import TwoFactorVerification from '@/components/security/TwoFactorVerification';
import api from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

const TransferPage = () => {
  const { t } = useTranslation('transfer');
  useDocumentTitle(t('pageTitle'), 'Clube Digital', true);

  const router = useRouter();
  const { user } = useAuthStore();
  const { isValidated, isLoading: documentsLoading } = useDocumentValidation();
  const { getBalance, reloadBalances, balances, loading: balancesLoading } = useCachedBalances();
  const { showSuccess, showError, showInfo, showWarning } = useAlertContext();
  const { defaultNetwork } = useConfig();

  // 2FA verification hook
  const {
    showVerificationModal,
    setShowVerificationModal,
    verifiedCode,
    handleVerificationSuccess,
    handleVerificationError,
    verify2FA,
    reset: reset2FA
  } = useTwoFactorVerification('transfer');
  
  // Estados do wizard
  const [currentStep, setCurrentStep] = useState(1); // 1 = dados, 2 = confirmação, 3 = resultado
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Estados de transferência
  const [transferType, setTransferType] = useState('internal'); // internal ou external
  const [selectedAsset, setSelectedAsset] = useState('');
  const [tokenMetadata, setTokenMetadata] = useState(null); // metadata do token incluindo gasPayer
  const [validTokens, setValidTokens] = useState([]); // lista de tokens válidos do backend
  const [recipientIdentifier, setRecipientIdentifier] = useState(''); // email, cpf, telefone ou address
  const [recipientType, setRecipientType] = useState('email'); // email, cpf, phone (interno) ou address (externo)
  const [recipientData, setRecipientData] = useState(null); // dados do destinatário após validação
  const [description, setDescription] = useState('');
  const [externalAddress, setExternalAddress] = useState('');

  // Estados para cálculo de taxas
  const [feeAmount, setFeeAmount] = useState(0);
  const [userTaxes, setUserTaxes] = useState(null);
  const [tokenFees, setTokenFees] = useState({ testnet: [], mainnet: [] });

  // Estados da transação
  const [transferData, setTransferData] = useState(null);
  const [balance, setBalance] = useState(0);

  // Funções auxiliares para o dropdown
  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleAssetSelect = async (asset) => {
    setSelectedAsset(asset.code);
    setOpenDropdown(null);
    
    // Buscar metadata do token incluindo gasPayer
    await fetchTokenMetadata(asset.code);
  };

  // Buscar metadata do token
  const fetchTokenMetadata = async (tokenSymbol) => {
    try {
      // console.log('🔍 Buscando metadata do token:', tokenSymbol);
      const response = await api.get(`/api/transfers/token-metadata/${tokenSymbol}`);
      
      if (response.data.success) {
        // console.log('✅ Metadata do token carregado:', response.data.data);
        setTokenMetadata(response.data.data);
      } else {
        console.warn('⚠️ Metadata do token não encontrado:', response.data.message);
        setTokenMetadata(null);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar metadata do token:', error);
      setTokenMetadata(null);
      // Não mostrar erro para o usuário, pois é informação técnica
    }
  };

  const getSelectedAsset = () => {
    const defaultAsset = {
      code: 'N/A',
      name: 'Nenhum token disponível',
      icon: '/assets/images/currencies/default.png',
      balance: 0
    };
    
    if (transferAssets.length === 0) return defaultAsset;
    
    return transferAssets.find(asset => asset.code === selectedAsset) || transferAssets[0] || defaultAsset;
  };

  // Função para calcular valor máximo considerando gás (apenas para tokens nativos)
  const getMaxTransferAmount = () => {
    const selectedAssetData = getSelectedAsset();
    const currentBalance = parseFloat(selectedAssetData.balance || 0);
    
    // Verificar se é token nativo (AZE ou AZE-t)
    const isNativeToken = selectedAsset === 'AZE' || selectedAsset === 'AZE-t';
    
    if (!isNativeToken) {
      // Para tokens de contrato, pode usar todo o saldo (gasPayer paga o gás)
      // Formatar para padrão brasileiro
      return currentBalance.toLocaleString('pt-BR', { 
        minimumFractionDigits: 6, 
        maximumFractionDigits: 6 
      });
    }
    
    // Para tokens nativos, reservar gás estimado
    // Gas limit padrão é 21.000, gas price estimado ~20 gwei
    // Total estimado: 21.000 * 20 = 420.000 gwei = 0.00042 tokens nativos
    const estimatedGasCost = 0.001; // Reservar 0.001 tokens para gás (margem de segurança)
    const maxAmount = Math.max(0, currentBalance - estimatedGasCost);
    
    // Se o saldo for muito baixo, não permitir transferência
    if (maxAmount <= 0) {
      return "0";
    }
    
    // Formatar para padrão brasileiro (vírgula como separador decimal)
    return maxAmount.toLocaleString('pt-BR', { 
      minimumFractionDigits: 6, 
      maximumFractionDigits: 6 
    });
  };
  
  // Hook para máscara de moeda com suporte a 18 casas decimais
  const {
    value: transferAmount,
    formatDisplayValue,
    getNumericValue,
    clearValue,
    setValue,
    inputProps: currencyInputProps
  } = useCurrencyMaskExtended('', 18);

  // Definição dos tokens com metadados estáticos
  const staticTokenMetadata = {
    'AZE': { name: 'Azore Token', icon: '/assets/images/currencies/AZE.png' },
    'AZE-t': { name: 'Azore Token (Testnet)', icon: '/assets/images/currencies/AZE.png' },
    'cBRL': { name: 'Clube Digital Real Brasil', icon: '/assets/images/currencies/cBRL.png' },
    'CNT': { name: 'Clube Digital Trade', icon: '/assets/images/currencies/CNT.png' },
    'PCN': { name: 'Pratique Coin', icon: '/assets/images/currencies/PCN.png' },
    'MJD': { name: 'Meu Jurídico Digital', icon: '/assets/images/currencies/MJD.png' },
    'IMB': { name: 'Imobiliária', icon: '/assets/images/currencies/IMB.png' }
  };

  // Gerar lista de ativos baseada nos saldos reais do usuário
  const transferAssets = React.useMemo(() => {
    if (!balances?.balancesTable || validTokens.length === 0) return [];
    
    return Object.entries(balances.balancesTable)
      .filter(([symbol, balance]) => {
        // Incluir apenas tokens válidos com saldo > 0
        const numericBalance = parseFloat(balance || '0');
        return validTokens.includes(symbol) && numericBalance > 0;
      })
      .map(([symbol, balance]) => ({
        code: symbol,
        name: staticTokenMetadata[symbol]?.name || symbol,
        icon: staticTokenMetadata[symbol]?.icon || '/assets/images/currencies/default.png',
        balance: parseFloat(balance || '0')
      }))
      .sort((a, b) => b.balance - a.balance); // Ordenar por saldo (maior primeiro)
  }, [balances?.balancesTable, validTokens]);

  // Opções de tipo de identificador para transferência interna
  const internalIdentifierOptions = [
    { value: 'email', label: t('step1.identifierTypes.email') },
    { value: 'cpf', label: t('step1.identifierTypes.cpf') },
    { value: 'phone', label: t('step1.identifierTypes.phone') },
  ];

  // Carregar lista de tokens válidos do backend
  useEffect(() => {
    const loadValidTokens = async () => {
      if (!user?.id) return;

      try {
        // console.log('🔍 [TransferPage] Carregando tokens válidos do backend');
        const response = await api.get('/api/transfers/valid-tokens');

        if (response.data.success) {
          // console.log('✅ [TransferPage] Tokens válidos carregados:', response.data.data);
          setValidTokens(response.data.data);
        }
      } catch (error) {
        console.error('❌ [TransferPage] Erro ao carregar tokens válidos:', error);
        // Usar lista padrão como fallback
        setValidTokens(['cBRL', 'PCN', 'AZE', 'AZE-t', 'CNT']);
      }
    };

    loadValidTokens();
  }, [user?.id]);

  // Carregar taxas do usuário
  useEffect(() => {
    const loadUserFees = async () => {
      if (!user?.id) return;

      try {
        const response = await api.get(`/api/users/${user.id}/taxes`);

        if (response.data.success) {
          setUserTaxes(response.data.data);

          // Se tiver tokenTransferFees estruturado por rede
          if (response.data.data.tokenTransferFees) {
            setTokenFees(response.data.data.tokenTransferFees);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar taxas do usuário:', error);
      }
    };

    loadUserFees();
  }, [user?.id]);

  // Selecionar automaticamente o primeiro token quando os dados chegarem
  useEffect(() => {
    if (transferAssets.length > 0 && !selectedAsset) {
      const firstAsset = transferAssets[0].code;
      setSelectedAsset(firstAsset);
      // Buscar metadata do primeiro token
      fetchTokenMetadata(firstAsset);
    }
  }, [transferAssets, selectedAsset]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };
    
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Atualizar balance quando mudar o ativo selecionado
  useEffect(() => {
    if (!user?.id || !balances) return;

    const assetBalance = parseFloat(getBalance(selectedAsset) || 0);
    setBalance(assetBalance);
  }, [balances, selectedAsset, user?.id, getBalance]);

  // Calcular taxa baseada no token selecionado
  useEffect(() => {
    if (!selectedAsset || !tokenFees || !tokenMetadata) {
      setFeeAmount(0);
      return;
    }

    // Determinar a rede atual
    const currentNetwork = defaultNetwork || 'mainnet';
    const networkTokens = tokenFees[currentNetwork] || [];

    // Buscar o token na rede atual usando o ID do metadata
    const tokenFee = networkTokens.find(t => t.id === tokenMetadata.id);

    if (tokenFee) {
      const fee = parseFloat(tokenFee.fee) || 0;
      setFeeAmount(fee);
    } else {
      setFeeAmount(0);
    }
  }, [selectedAsset, tokenFees, tokenMetadata, defaultNetwork]);

  // Forçar reload de balances ao montar
  useEffect(() => {
    if (user?.id && user?.publicKey) {
      reloadBalances(false);
    }
  }, [user?.id, user?.publicKey]);

  // Validar endereço Ethereum
  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Validar CPF
  const isValidCPF = (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11;
  };

  // Validar telefone
  const isValidPhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  // Validar email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Buscar dados do usuário interno
  const fetchInternalUser = async () => {
    if (!recipientIdentifier) {
      showError(t('messages.invalidIdentifier'));
      return false;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/transfers/validate-recipient', {
        type: recipientType,
        value: recipientIdentifier
      });

      if (response.data.success) {
        setRecipientData(response.data.data);
        return true;
      } else {
        // Tratar erro específico baseado no tipo
        const tipoLabel = recipientType === 'email' ? t('step1.identifierTypes.email') :
                         recipientType === 'cpf' ? t('step1.identifierTypes.cpf') :
                         recipientType === 'phone' ? t('step1.identifierTypes.phone') : t('messages.invalidIdentifier');

        showError(t('messages.userNotFound', { type: tipoLabel }), response.data.message || t('messages.verifyData'));
        return false;
      }
    } catch (error) {
      // Tratar diferentes tipos de erro sem mostrar no console
      if (error.response?.status === 404 || error.response?.status === 400) {
        const tipoLabel = recipientType === 'email' ? t('step1.identifierTypes.email') :
                         recipientType === 'cpf' ? t('step1.identifierTypes.cpf') :
                         recipientType === 'phone' ? t('step1.identifierTypes.phone') : t('messages.invalidIdentifier');

        showError(t('messages.userNotFound', { type: tipoLabel }), t('messages.verifyData'));
      } else {
        showError(t('messages.connectionError'), t('messages.checkConnection'));
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validar e avançar para confirmação
  const handleContinueToConfirmation = async () => {
    const amount = getNumericValue();
    
    // Validações básicas
    if (amount < 0.01) {
      showError(t('messages.minAmount'), t('messages.minAmountText'));
      return;
    }

    if (amount > balance) {
      showError(t('messages.insufficientBalance'), t('messages.insufficientBalanceText', { balance: balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), asset: selectedAsset }));
      return;
    }

    // Validar destinatário baseado no tipo
    if (transferType === 'internal') {
      // Validar identificador interno
      let isValid = false;

      switch (recipientType) {
        case 'email':
          isValid = isValidEmail(recipientIdentifier);
          if (!isValid) showError(t('messages.invalidEmail'));
          break;
        case 'cpf':
          isValid = isValidCPF(recipientIdentifier);
          if (!isValid) showError(t('messages.invalidCPF'));
          break;
        case 'phone':
          isValid = isValidPhone(recipientIdentifier);
          if (!isValid) showError(t('messages.invalidPhone'));
          break;
      }

      if (!isValid) return;

      // Buscar dados do usuário
      const userFound = await fetchInternalUser();
      if (!userFound) return;

    } else {
      // Validar endereço blockchain
      if (!isValidEthereumAddress(externalAddress)) {
        showError(t('messages.invalidAddress'), t('messages.invalidAddressText'));
        return;
      }
      
      setRecipientData({
        address: externalAddress,
        type: 'external',
        blockchain: 'Azore',
        chainId: 8800
      });
    }
    
    // Avançar para confirmação
    setCurrentStep(2);
  };

  // Confirmar transferência
  const handleConfirmTransfer = async () => {
    const amount = getNumericValue();

    // Verificar 2FA antes de processar
    try {
      await verify2FA(async (code) => {
        setProcessing(true);

        try {
          showInfo(t('messages.initiatingTransfer'), t('messages.preparingTransaction'));

          // Preparar dados da transferência
          const transferPayload = {
            amount: amount,
            asset: selectedAsset,
            type: transferType,
            recipient: transferType === 'internal' ? {
              userId: recipientData.id,
              address: recipientData.publicKey
            } : {
              address: externalAddress
            },
            twoFactorCode: code // Incluir código 2FA se fornecido
          };

          // Adicionar descrição apenas se não estiver vazia
          if (description && description.trim() !== '') {
            transferPayload.description = description;
          }

          // Iniciar transferência
          const response = await api.post('/api/transfers', transferPayload);

          if (!response.data.success) {
            throw new Error(response.data.message || t('messages.transferError'));
          }

          const result = response.data.data;
          setTransferData(result);

          // Resetar 2FA após operação bem-sucedida
          reset2FA();

          // Atualizar saldos
          reloadBalances(true);

          showSuccess(
            t('messages.transferSuccess'),
            transferType === 'internal'
              ? t('messages.transferSuccessInternal', {
                  amount: getNumericValue().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  asset: selectedAsset,
                  recipient: recipientData.name
                })
              : t('messages.transferSuccessExternal', {
                  amount: getNumericValue().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  asset: selectedAsset
                })
          );

          // Mostrar resultado
          setCurrentStep(3);

        } catch (error) {
          console.error('Erro na transferência:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Tente novamente mais tarde';

          // Se for erro de 2FA, resetar para permitir nova tentativa
          if (errorMessage.toLowerCase().includes('2fa') || errorMessage.toLowerCase().includes('código')) {
            reset2FA();
            showError(t('messages.invalid2FA'), t('messages.invalid2FAMessage'));
          } else {
            showError(t('messages.transferError'), errorMessage);
          }

          setProcessing(false);
        }
      });
    } catch (error) {
      // Erro na verificação 2FA (usuário cancelou ou erro no modal)
      console.log('2FA verification cancelled or failed');
      setProcessing(false);
    }
  };

  // Voltar etapa
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        // Limpar dados do destinatário ao voltar
        setRecipientData(null);
      }
    }
  };

  // Resetar formulário
  const handleNewTransfer = () => {
    setCurrentStep(1);
    setTransferType('internal');
    setSelectedAsset('');
    setTokenMetadata(null);
    setRecipientIdentifier('');
    setRecipientType('email');
    setRecipientData(null);
    setDescription('');
    setExternalAddress('');
    clearValue();
    setTransferData(null);
    setProcessing(false);
  };

  // Máscara para CPF (EXATAMENTE igual ao first-access)
  const formatCPF = (value) => {
    // Remove todos os caracteres não numéricos
    value = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Aplica a máscara do CPF
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    
    return value;
  };

  // Máscara para telefone (EXATAMENTE igual ao first-access)
  const formatPhone = (value) => {
    // Remove todos os caracteres não numéricos
    value = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Aplica a máscara do telefone
    if (value.length > 10) {
      // Celular com 11 dígitos: (xx) 9xxxx-xxxx
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      // Telefone fixo ou celular com 10 dígitos: (xx) xxxx-xxxx
      value = value.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    }
    
    return value;
  };

  // Renderizar conteúdo baseado no passo
  const renderStepContent = () => {
    // Step 1: Dados da transferência
    if (currentStep === 1) {
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

          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Tipo de transferência */}
                <div>
                  <label className="block form-label mb-2">
                    {t('step1.transferType')}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setTransferType('internal');
                        setRecipientIdentifier('');
                        setExternalAddress('');
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        transferType === 'internal'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon icon="heroicons:users" className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                      <p className="font-semibold">{t('step1.internal')}</p>
                      <p className="text-sm text-gray-500">{t('step1.internalDesc')}</p>
                    </button>

                    <button
                      onClick={() => {
                        setTransferType('external');
                        setRecipientIdentifier('');
                        setExternalAddress('');
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        transferType === 'external'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon icon="heroicons:globe-alt" className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                      <p className="font-semibold">{t('step1.external')}</p>
                      <p className="text-sm text-gray-500">{t('step1.externalDesc')}</p>
                    </button>
                  </div>
                </div>

                {/* Ativo */}
                <div>
                  <label className="block form-label mb-2">
                    {t('step1.asset')}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onClick={() => handleDropdownToggle('asset_select')}
                    >
                      <div className="flex items-center">
                        <img 
                          src={getSelectedAsset().icon} 
                          alt={getSelectedAsset().code} 
                          width="24" 
                          height="24"
                          className="mr-3 rounded-full"
                        />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">{getSelectedAsset().code}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{getSelectedAsset().name}</div>
                        </div>
                      </div>
                      <ChevronDown size={16} />
                    </button>

                    {/* Asset Dropdown */}
                    {openDropdown === 'asset_select' && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 shadow-lg rounded-md border border-gray-200 dark:border-slate-600 z-20">
                        <ul className="py-1">
                          {transferAssets.length > 0 ? (
                            transferAssets.map(asset => (
                              <li
                                key={asset.code}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer flex items-center"
                                onClick={() => handleAssetSelect(asset)}
                              >
                                <img 
                                  src={asset.icon} 
                                  alt={asset.code} 
                                  width="24" 
                                  height="24"
                                  className="mr-3 rounded-full" 
                                />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{asset.code}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
                              {t('step1.noTokensWithBalance')}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t('step1.availableBalance')}</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {parseFloat(getSelectedAsset().balance || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6
                      })} {getSelectedAsset().code}
                    </span>
                  </div>
                  
                  {/* Aviso sobre reserva de gás para tokens nativos */}
                  {(selectedAsset === 'AZE' || selectedAsset === 'AZE-t') && (
                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
                      ⚠️ {t('step1.nativeTokenWarning', { asset: selectedAsset })}
                    </div>
                  )}
                </div>

                {/* Valor */}
                <div>
                  <label className="block form-label mb-2">
                    {t('step1.amount')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...currencyInputProps}
                      className="form-control py-3 pr-20 text-lg font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setValue(getMaxTransferAmount())}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded transition-colors"
                    >
                      {t('step1.maxButton')}
                    </button>
                  </div>
                  {/* Seção de taxa removida - transferências sem taxa */}
                </div>

                {/* Destinatário - Transferência Interna */}
                {transferType === 'internal' && (
                  <div>
                    <label className="block form-label mb-2">
                      {t('step1.recipientIdentifier')}
                    </label>
                    <div className="space-y-3">
                      <Select
                        value={recipientType}
                        onChange={(e) => {
                          setRecipientType(e.target.value);
                          setRecipientIdentifier('');
                        }}
                        options={internalIdentifierOptions}
                        className="w-full"
                      />
                      
                      {recipientType === 'email' && (
                        <Textinput
                          type="email"
                          placeholder={t('step1.emailPlaceholder')}
                          value={recipientIdentifier}
                          onChange={(e) => setRecipientIdentifier(e.target.value)}
                          className="w-full"
                        />
                      )}
                      
                      {recipientType === 'cpf' && (
                        <input
                          type="text"
                          placeholder={t('step1.cpfPlaceholder')}
                          value={recipientIdentifier}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            setRecipientIdentifier(formatted);
                          }}
                          className="form-control py-2 px-3 w-full"
                        />
                      )}
                      
                      {recipientType === 'phone' && (
                        <input
                          type="text"
                          placeholder={t('step1.phonePlaceholder')}
                          value={recipientIdentifier}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            setRecipientIdentifier(formatted);
                          }}
                          className="form-control py-2 px-3 w-full"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Destinatário - Transferência Externa */}
                {transferType === 'external' && (
                  <div>
                    <label className="block form-label mb-2">
                      {t('step1.externalAddress')}
                    </label>
                    <Textinput
                      type="text"
                      placeholder={t('step1.addressPlaceholder')}
                      value={externalAddress}
                      onChange={(e) => setExternalAddress(e.target.value)}
                      className="w-full font-mono text-sm"
                    />
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>{t('step1.externalWarning')}</strong> {t('step1.externalWarningText')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Descrição (opcional) */}
                <div>
                  <label className="block form-label mb-2">
                    {t('step1.description')}
                  </label>
                  <Textinput
                    type="text"
                    placeholder={t('step1.descriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Botões de ação */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleContinueToConfirmation}
                disabled={
                  transferAssets.length === 0 ||
                  !getNumericValue() || 
                  getNumericValue() > balance ||
                  (transferType === 'internal' && !recipientIdentifier) ||
                  (transferType === 'external' && !externalAddress) ||
                  loading
                }
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
              >
                {loading ? t('step1.verifying') : t('step1.continueButton')}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 2: Confirmação
    if (currentStep === 2) {
      const amount = getNumericValue();
      
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
              <div className="space-y-4">
                {/* Tipo de transferência */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('step2.type')}
                  </span>
                  <span className="font-semibold">
                    {transferType === 'internal' ? t('step2.internal') : t('step2.external')}
                  </span>
                </div>

                {/* Ativo */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('step2.asset')}
                  </span>
                  <span className="font-semibold">
                    {tokenMetadata?.metadata?.name || staticTokenMetadata[selectedAsset]?.name || selectedAsset}
                  </span>
                </div>

                {/* Valor */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('step2.amount')}
                  </span>
                  <span className="text-lg font-semibold">
                    {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedAsset}
                  </span>
                </div>

                {/* Taxa */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('step2.fee')}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {feeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {selectedAsset}
                  </span>
                </div>

                {/* Valor total (com taxa) */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {t('step2.totalToSend')}
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {(getNumericValue() + feeAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {selectedAsset}
                  </span>
                </div>

                {/* Destinatário */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t('step2.sendingTo')}
                  </p>
                  {transferType === 'internal' && recipientData && (
                    <>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {recipientData.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {recipientType === 'email' ? recipientIdentifier :
                         recipientType === 'cpf' ? recipientIdentifier :
                         recipientType === 'phone' ? recipientIdentifier : ''}
                      </p>
                    </>
                  )}
                  {transferType === 'external' && (
                    <>
                      <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                        {externalAddress}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('step2.blockchainInfo')}
                      </p>
                    </>
                  )}
                </div>

                {/* Descrição */}
                {description && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t('step2.description')}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {description}
                    </p>
                  </div>
                )}

                {/* Aviso */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>{t('step2.important')}</strong> {t('step2.irreversibleWarning')}
                    {transferType === 'external' && ' ' + t('step2.verifyAddressWarning')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Botões de ação */}
            <div className="flex justify-center space-x-4 mt-6">
              <Button
                onClick={handleBack}
                disabled={processing}
                className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-3"
              >
                {t('step2.backButton')}
              </Button>

              <Button
                onClick={handleConfirmTransfer}
                disabled={processing}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
              >
                {processing ? (
                  <div className="flex items-center">
                    <Icon icon="heroicons:arrow-path" className="w-5 h-5 animate-spin mr-2" />
                    <span>{t('step2.processing')}</span>
                  </div>
                ) : (
                  t('step2.confirmButton')
                )}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Step 3: Resultado
    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <Icon icon="heroicons:check-circle" className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('step3.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('step3.subtitle')}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="p-6">
              <div className="space-y-4">
                {/* ID da transação */}
                {transferData?.transactionId && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t('step3.transactionId')}
                    </p>
                    <p className="font-mono text-sm break-all">
                      {transferData.transactionId}
                    </p>
                  </div>
                )}

                {/* Detalhes da transferência */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="space-y-2">
                    {(transferData?.txHash || transferData?.blockchain_tx_hash) && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t('step3.txHash')}</span>
                        <span className="font-semibold">
                          <a
                            href={`${defaultNetwork === 'mainnet' ? 'https://azorescan.com' : 'https://floripa.azorescan.com'}/tx/${transferData?.txHash || transferData?.blockchain_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {(transferData?.txHash || transferData?.blockchain_tx_hash)?.slice(0, 10)}...{(transferData?.txHash || transferData?.blockchain_tx_hash)?.slice(-8)}
                          </a>
                        </span>
                      </div>
                    )}

                    {description && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t('step3.description')}</span>
                        <span className="font-semibold">{description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('step3.amountSent')}</span>
                      <span className="font-semibold">{getNumericValue().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedAsset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('step3.fee')}</span>
                      <span>{feeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {selectedAsset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('step3.total')}</span>
                      <span className="font-semibold">{(getNumericValue() + feeAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {selectedAsset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('step3.asset')}</span>
                      <span>{tokenMetadata?.metadata?.name || staticTokenMetadata[selectedAsset]?.name || selectedAsset}</span>
                    </div>
                    {transferType === 'internal' && recipientIdentifier && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            {t('step3.recipientIdentification')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">{t('step3.to')}</span>
                          <span className="text-right">
                            {recipientData
                              ? recipientData.name
                              : `${externalAddress.slice(0, 6)}...${externalAddress.slice(-4)}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            {recipientType === 'email' && t('step1.identifierTypes.email') + ':'}
                            {recipientType === 'cpf' && t('step1.identifierTypes.cpf') + ':'}
                            {recipientType === 'phone' && t('step1.identifierTypes.phone') + ':'}
                          </span>
                          <span className="text-right">
                            {recipientType === 'email' && `${recipientIdentifier}`}
                            {recipientType === 'cpf' && `${formatCPF(recipientIdentifier)}`}
                            {recipientType === 'phone' && `${formatPhone(recipientIdentifier)}`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Botões de ação */}
            <div className="flex justify-center space-x-4 mt-6">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3"
              >
                {t('step3.backToDashboard')}
              </Button>

              <Button
                onClick={handleNewTransfer}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3"
              >
                {t('step3.newTransfer')}
              </Button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Verificar se documentos estão validados
  if (documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {t('messages.verifyingDocuments')}
          </p>
        </div>
      </div>
    );
  }

  if (!isValidated) {
    return <DocumentValidationRequired />;
  }

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

      {/* Progress bar */}
      {currentStep < 3 && (
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              {t('steps.data')}
            </span>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              {t('steps.confirmation')}
            </span>
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              {t('steps.completed')}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {renderStepContent()}
      </div>

      {/* Modal de verificação 2FA */}
      <TwoFactorVerification
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={handleVerificationSuccess}
        title={t('twoFactor.title')}
      />
    </div>
  );
};

export default TransferPage;
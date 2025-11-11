"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useAlertContext } from '@/contexts/AlertContext';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import useNetwork from '@/hooks/useNetwork';
import useDarkmode from '@/hooks/useDarkMode';
import useCachedBalances from '@/hooks/useCachedBalances';
import { BalanceDisplay } from '@/utils/balanceUtils';
import api from '@/services/api';
import { ethers } from 'ethers';
import StakeStatementsSection from '@/components/admin/StakeStatementsSection';
import {
  Building,
  TrendingUp,
  Users,
  Wallet,
  DollarSign,
  Calendar,
  Clock,
  Shield,
  UserPlus,
  UserMinus,
  Send,
  Gift,
  Settings,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Eye,
  EyeOff,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

const CompanyStakesManagementPage = () => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError, showInfo } = useAlertContext();
  const { defaultNetwork } = useNetwork();
  const [isDark] = useDarkmode();
  const { getBalance, getCorrectAzeSymbol } = useCachedBalances();

  // Helper para obter símbolo do token a partir do endereço
  const getTokenSymbol = (tokenAddress) => {
    if (!tokenAddress) return getCorrectAzeSymbol();

    // Endereços conhecidos na testnet
    const knownTokens = {
      '0x0000000000000000000000000000000000000000': 'AZE-t', // Native token testnet
      '0x2b9EC71C4F084DeA26C548b0b24E2F2C0Bfc9A07': 'cBRL', // cBRL testnet
    };

    // Endereços conhecidos na mainnet
    const knownTokensMainnet = {
      '0x0000000000000000000000000000000000000000': 'AZE', // Native token mainnet
    };

    const tokens = defaultNetwork === 'mainnet' ? knownTokensMainnet : knownTokens;
    return tokens[tokenAddress] || getCorrectAzeSymbol();
  };

  // Usar currentCompany do hook ao invés de URL
  const { currentCompany, loading: companyLoading } = useCurrentCompany();
  const companyIdFromUrl = searchParams.get('companyId');

  // Se tem companyId na URL, usar ele. Senão, usar currentCompany
  const effectiveCompanyId = companyIdFromUrl || currentCompany?.id;

  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    availableRewardBalance: '0',
    totalStaked: '0',
    activeUsers: 0,
    totalRewardsDistributed: '0',
    cycleDuration: 0,
    cycleStartTime: 0,
    minStakeValue: '0',
    whitelistEnabled: false,
    isRestakeAllowed: false
  });

  // Token symbols
  const [tokenSymbols, setTokenSymbols] = useState({
    stakeToken: '',
    rewardToken: ''
  });

  // Last distribution data
  const [lastDistribution, setLastDistribution] = useState({
    hasDistribution: false,
    distributionPercentage: null,
    distributedAt: null,
    distributedBy: null
  });

  // Contract actions history
  const [contractActions, setContractActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalInputs, setModalInputs] = useState({});
  const [executing, setExecuting] = useState(false);

  // Whitelist states
  const [whitelistAddresses, setWhitelistAddresses] = useState([]);
  const [whitelistUsersData, setWhitelistUsersData] = useState([]);
  const [loadingWhitelistData, setLoadingWhitelistData] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState('');
  const [addressCheckResult, setAddressCheckResult] = useState(null);

  // Company users for select
  const [companyUsers, setCompanyUsers] = useState([]);
  const [loadingCompanyUsers, setLoadingCompanyUsers] = useState(false);

  // Error tracking
  const [dashboardError, setDashboardError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [failedFunctions, setFailedFunctions] = useState([]);

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    whitelist: false,
    rewards: false,
    settings: false,
    actions: false
  });

  useEffect(() => {
    if (effectiveCompanyId && defaultNetwork) {
      loadContracts();
      loadCompanyUsers();
    }
  }, [effectiveCompanyId, defaultNetwork]);

  useEffect(() => {
    if (selectedContract) {
      loadDashboardData();
    }
  }, [selectedContract]);

  const loadContracts = async () => {
    if (!effectiveCompanyId || !defaultNetwork) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/stake-contracts?companyId=${effectiveCompanyId}`);
      if (response.data.success) {
        const contractsList = response.data.data || [];

        // Filtrar contratos pela rede atual
        const filteredContracts = contractsList.filter(contract =>
          contract.network === defaultNetwork
        );

        setContracts(filteredContracts);
        if (filteredContracts.length > 0) {
          setSelectedContract(filteredContracts[0]);
        } else {
          setSelectedContract(null);
          // Empty state será mostrado visualmente, sem alert
        }
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      showError(t('companyStakes.messages.errorLoadingContracts'));
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    if (!selectedContract) return;

    try {
      setLoading(true);
      setDashboardError(false);
      const failed = [];

      // Helper function para fazer chamada com fallback
      const safeReadContract = async (functionName, defaultValue = '0') => {
        try {
          const response = await api.post('/api/contracts/read', {
            contractAddress: selectedContract.address,
            functionName,
            params: [],
            network: selectedContract.network
          });

          if (response.data.success) {
            return response.data.data.result;
          }
          failed.push({ function: functionName, error: 'Response not successful' });
          return defaultValue;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
          const is400 = error.response?.status === 400;

          // Only add to failed list if not a 400 (function not found) error
          if (!is400 || !errorMsg.includes('not found')) {
            failed.push({ function: functionName, error: errorMsg });
            console.warn(`❌ Failed to read ${functionName}:`, errorMsg);
          } else {
            // Silently handle function not found errors
            console.debug(`Function ${functionName} not found in contract (using default value)`);
          }

          return defaultValue;
        }
      };

      // Buscar dados em paralelo com tratamento individual de erros
      const [
        availableRewardBalance,
        totalStaked,
        activeUsers,
        totalRewardsDistributed,
        cycleDuration,
        cycleStartTime,
        minStakeValue,
        whitelistEnabled,
        isRestakeAllowed,
        stakingBlocked,
        stakeToken,
        rewardToken
      ] = await Promise.all([
        safeReadContract('getAvailableRewardBalance', '0'),
        safeReadContract('getTotalStakedSupply', '0'),
        safeReadContract('getNumberOfActiveUsers', 0),
        safeReadContract('getTotalRewardDistributed', '0'),
        safeReadContract('cycleDurationInDays', 0),
        safeReadContract('getInitialCycleStartTime', 0),
        safeReadContract('minValueStake', '0'),
        safeReadContract('whitelistEnabled', false),
        safeReadContract('isRestakeAllowed', false),
        safeReadContract('stakingBlocked', false),
        safeReadContract('stakeToken', ''),
        safeReadContract('rewardToken', '')
      ]);

      setDashboardData({
        availableRewardBalance,
        totalStaked,
        activeUsers: typeof activeUsers === 'number' ? activeUsers : parseInt(activeUsers) || 0,
        totalRewardsDistributed,
        cycleDuration: typeof cycleDuration === 'number' ? cycleDuration : parseInt(cycleDuration) || 0,
        cycleStartTime: typeof cycleStartTime === 'number' ? cycleStartTime : parseInt(cycleStartTime) || 0,
        minStakeValue,
        whitelistEnabled: Boolean(whitelistEnabled),
        isRestakeAllowed: Boolean(isRestakeAllowed),
        stakingBlocked: Boolean(stakingBlocked),
        stakeToken,
        rewardToken
      });

      // Buscar símbolos dos tokens no banco de dados
      if (stakeToken || rewardToken) {
        try {
          const symbolsResponse = await api.post('/api/contracts/get-token-symbols', {
            stakeTokenAddress: stakeToken,
            rewardTokenAddress: rewardToken,
            network: selectedContract.network
          });

          if (symbolsResponse.data.success) {
            setTokenSymbols({
              stakeToken: symbolsResponse.data.data.stakeTokenSymbol || '',
              rewardToken: symbolsResponse.data.data.rewardTokenSymbol || ''
            });
          }
        } catch (error) {
          console.warn('Error fetching token symbols:', error);
          // Fallback para símbolos padrão se falhar
          setTokenSymbols({
            stakeToken: getTokenSymbol(stakeToken),
            rewardToken: getTokenSymbol(rewardToken)
          });
        }
      }

      // Buscar última distribuição de recompensas
      try {
        const distributionResponse = await api.get(`/api/contracts/last-distribution/${selectedContract.id}`);

        if (distributionResponse.data.success && distributionResponse.data.data.hasDistribution) {
          setLastDistribution({
            hasDistribution: true,
            distributionPercentage: distributionResponse.data.data.distributionPercentage,
            distributedAt: distributionResponse.data.data.distributedAt,
            distributedBy: distributionResponse.data.data.distributedBy
          });
        } else {
          setLastDistribution({
            hasDistribution: false,
            distributionPercentage: null,
            distributedAt: null,
            distributedBy: null
          });
        }
      } catch (error) {
        console.warn('Error fetching last distribution:', error);
        setLastDistribution({
          hasDistribution: false,
          distributionPercentage: null,
          distributedAt: null,
          distributedBy: null
        });
      }

      // Atualizar estado de erros
      setFailedFunctions(failed);
      setErrorCount(failed.length);

      // Se todos os dados falharam, marcar como erro
      if (failed.length >= 10) {
        setDashboardError(true);
        showWarning(t('companyStakes.messages.errorLoadingData'));
      } else if (failed.length > 0) {
        console.log('⚠️ Failed functions:', failed);
        showInfo(t('companyStakes.messages.functionsNotRead', { count: failed.length }));
      }

      // Sempre carregar whitelist (independente de estar habilitada ou não)
      // Os endereços existem na blockchain mesmo quando desabilitada
      await loadWhitelist();

      // Carregar histórico de ações
      await loadContractActions();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardError(true);
      showError(t('companyStakes.messages.errorLoadingContractData'));
    } finally {
      setLoading(false);
    }
  };

  const loadContractActions = async () => {
    if (!selectedContract) return;

    try {
      setLoadingActions(true);
      const response = await api.get(`/api/contracts/actions/${selectedContract.id}?limit=50`);

      if (response.data.success) {
        setContractActions(response.data.data.actions);
      }
    } catch (error) {
      console.error('Error loading contract actions:', error);
      setContractActions([]);
    } finally {
      setLoadingActions(false);
    }
  };

  const loadCompanyUsers = async () => {
    if (!effectiveCompanyId) return;

    try {
      setLoadingCompanyUsers(true);

      // Usar o mesmo endpoint que admin/users
      const response = await api.get('/api/users', {
        params: {
          companyId: effectiveCompanyId,
          limit: 1000 // Aumentar limite para pegar todos os usuários
        }
      });

      if (response.data.success) {
        const users = response.data.data.users || [];
        // console.log(`📊 Total de usuários da empresa: ${users.length}`);
        // console.log(`📊 Exemplo de usuário:`, users[0]); // Ver estrutura

        // Filtrar apenas usuários com blockchainAddress ou publicKey
        const usersWithAddress = users.filter(user => user.blockchainAddress || user.publicKey);
        // console.log(`📊 Usuários com endereço blockchain: ${usersWithAddress.length}`);

        // Normalizar para usar blockchainAddress ou publicKey
        const normalizedUsers = usersWithAddress.map(user => ({
          ...user,
          blockchainAddress: user.blockchainAddress || user.publicKey
        }));

        // Ordenar por nome (ordem alfabética)
        normalizedUsers.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setCompanyUsers(normalizedUsers);
      }
    } catch (error) {
      console.error('Error loading company users:', error);
      setCompanyUsers([]);
    } finally {
      setLoadingCompanyUsers(false);
    }
  };

  const loadWhitelist = async () => {
    try {
      setLoadingWhitelistData(true);

      // Buscar endereços da whitelist
      const response = await api.post('/api/contracts/read', {
        contractAddress: selectedContract.address,
        functionName: 'getWhitelistedAddresses',
        params: [],
        network: selectedContract.network
      });

      // console.log('📋 Whitelist response:', response.data);

      if (response.data.success) {
        let addresses = response.data.data.result || [];
        // console.log('📋 Whitelist addresses raw:', addresses);
        // console.log('📋 Type of addresses:', typeof addresses);
        // console.log('📋 Is array?', Array.isArray(addresses));

        // Converter para array se necessário
        if (!Array.isArray(addresses)) {
          // Se for string, colocar em array
          if (typeof addresses === 'string' && addresses.startsWith('0x')) {
            addresses = [addresses];
          } else {
            addresses = [];
          }
        }

        // console.log('📋 Addresses after conversion:', addresses);

        // Filtrar e validar endereços
        const addressList = addresses.filter(addr => {
          if (typeof addr !== 'string' || !addr.startsWith('0x')) {
            console.warn(`⚠️ Valor inválido ignorado:`, addr);
            return false;
          }

          if (addr.length !== 42) {
            console.warn(`⚠️ Endereço com tamanho incorreto ignorado: ${addr} (length: ${addr.length}, esperado: 42)`);
            return false;
          }

          return true;
        });

        // console.log('📋 Whitelist addresses processed:', addressList);
        // console.log('📋 Total addresses found:', addressList.length);
        setWhitelistAddresses(addressList);

        // Para cada endereço, buscar dados do usuário e do contrato
        if (addressList.length > 0) {
          const usersDataPromises = addressList.map(async (address) => {
            try {
              // Normalizar endereço - remover espaços e converter para checksum
              const cleanAddress = address.trim();
              let checksumAddress;

              try {
                checksumAddress = ethers.getAddress(cleanAddress);
              } catch (err) {
                console.warn(`⚠️ Invalid address format: ${cleanAddress}`, err);
                checksumAddress = cleanAddress;
              }

              // console.log(`🔍 Looking up user for address: ${checksumAddress}`);
              // console.log(`🔍 Address length: ${checksumAddress.length} (should be 42)`);
              // console.log(`🔍 Full address:`, checksumAddress);

              // Buscar dados do usuário no backend
              let userResponse;
              try {
                userResponse = await api.get(`/api/users/address/${checksumAddress}`);
                // console.log(`✅ User found for ${checksumAddress}:`, userResponse.data);
              } catch (userError) {
                console.error(`❌ User not found for ${checksumAddress}:`, userError.response?.data || userError.message);
                userResponse = { data: { success: false } };
              }

              // Buscar dados de stake do contrato
              const [stakeBalance, pendingRewards] = await Promise.all([
                api.post('/api/contracts/read', {
                  contractAddress: selectedContract.address,
                  functionName: 'getTotalStakeBalance',
                  params: [address],
                  network: selectedContract.network
                }).catch(() => ({ data: { success: false, data: { result: '0' } } })),

                api.post('/api/contracts/read', {
                  contractAddress: selectedContract.address,
                  functionName: 'getPendingReward',
                  params: [address],
                  network: selectedContract.network
                }).catch(() => ({ data: { success: false, data: { result: '0' } } }))
              ]);

              const userData = userResponse.data?.data?.user || {};

              return {
                address,
                name: userData.name || 'N/A',
                email: userData.email || 'N/A',
                stakedBalance: stakeBalance.data.success ? stakeBalance.data.data.result : '0',
                pendingRewards: pendingRewards.data.success ? pendingRewards.data.data.result : '0',
                hasUserData: userResponse.data.success && !!userData.name
              };
            } catch (error) {
              console.warn(`Failed to load data for ${address}:`, error.message);
              return {
                address,
                name: 'N/A',
                email: 'N/A',
                stakedBalance: '0',
                pendingRewards: '0',
                hasUserData: false
              };
            }
          });

          const usersData = await Promise.all(usersDataPromises);
          setWhitelistUsersData(usersData);
        } else {
          setWhitelistUsersData([]);
        }
      } else {
        console.warn('⚠️ Failed to load whitelist addresses:', response.data.message);
        setWhitelistAddresses([]);
        setWhitelistUsersData([]);
      }
    } catch (error) {
      console.error('❌ Error loading whitelist:', error);
      console.error('Error details:', error.response?.data || error.message);
      setWhitelistAddresses([]);
      setWhitelistUsersData([]);

      // Se for erro de função não encontrada, mostrar aviso específico
      if (error.response?.data?.message?.includes('not found in contract')) {
        showWarning(t('companyStakes.messages.whitelistFunctionNotFound'));
      }
    } finally {
      setLoadingWhitelistData(false);
    }
  };

  const checkAddressInWhitelist = async () => {
    if (!checkingAddress || !ethers.isAddress(checkingAddress)) {
      showError(t('companyStakes.messages.invalidAddress'));
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/contracts/read', {
        contractAddress: selectedContract.address,
        functionName: 'isWhitelisted',
        params: [checkingAddress],
        network: selectedContract.network
      });

      if (response.data.success) {
        setAddressCheckResult({
          address: checkingAddress,
          isWhitelisted: response.data.data.result
        });
        showSuccess(response.data.data.result ? t('companyStakes.messages.addressIsWhitelisted') : t('companyStakes.messages.addressNotWhitelisted'));
      }
    } catch (error) {
      console.error('Error checking address:', error);
      showError(t('companyStakes.messages.errorCheckingAddress'));
    } finally {
      setLoading(false);
    }
  };

  const formatTokenAmount = (amount) => {
    try {
      if (!amount || amount === '0') return '0.000000';
      const formatted = ethers.formatUnits(amount, 18);
      const num = parseFloat(formatted);
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    } catch (error) {
      return '0.000000';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openConfirmModal = (action, inputs = {}) => {
    setModalAction(action);
    setModalInputs(inputs);
    setShowConfirmModal(true);
  };

  const executeWriteFunction = async () => {
    if (!selectedContract || !modalAction) return;

    try {
      setExecuting(true);

      const adminAddress = selectedContract.adminAddress || selectedContract.metadata?.adminAddress;

      if (!adminAddress) {
        throw new Error(t('companyStakes.messages.adminAddressNotFound'));
      }

      let params = [];
      let functionName = '';

      switch (modalAction.type) {
        case 'depositRewards':
          functionName = 'depositRewards';
          params = [ethers.parseUnits(modalInputs.amount || '0', 18).toString()];
          break;

        case 'distributeReward':
          functionName = 'distributeReward';
          params = [modalInputs.percentage || '0'];
          break;

        case 'addToWhitelist':
          functionName = 'addToWhitelist';
          params = [modalInputs.address];
          break;

        case 'removeFromWhitelist':
          functionName = 'removeFromWhitelist';
          params = [modalInputs.address];
          break;

        case 'updateMinValueStake':
          functionName = 'updateMinValueStake';
          params = [ethers.parseUnits(modalInputs.value || '0', 18).toString()];
          break;

        case 'withdrawRewardTokens':
          functionName = 'withdrawRewardTokens';
          params = [ethers.parseUnits(modalInputs.amount || '0', 18).toString()];
          break;

        case 'setCycleDuration':
          functionName = 'setCycleDuration';
          params = [modalInputs.days || '0'];
          break;

        case 'setWhitelistEnabled':
          functionName = 'setWhitelistEnabled';
          params = [modalInputs.enabled];
          break;

        case 'setStakingBlocked':
          functionName = 'setStakingBlocked';
          params = [modalInputs.blocked];
          break;

        case 'setAllowRestake':
          functionName = 'setAllowRestake';
          params = [modalInputs.allowed];
          break;

        default:
          throw new Error(t('companyStakes.messages.actionNotRecognized'));
      }

      const response = await api.post('/api/contracts/write', {
        contractAddress: selectedContract.address,
        functionName,
        params,
        gasPayer: adminAddress,
        network: selectedContract.network
      });

      if (response.data.success) {
        showSuccess(t('companyStakes.messages.actionExecutedSuccess', { action: modalAction.label }));

        // Se foi distributeReward, atualizar metadata do contrato com lastDistribution
        if (modalAction.type === 'distributeReward' && params[0]) {
          try {
            const encodedAddress = encodeURIComponent(selectedContract.address);

            await api.patch(`/api/stake-contracts/${encodedAddress}/distribution`, {
              percentage: parseInt(params[0]), // Primeiro parâmetro é o percentage
              network: selectedContract.network // Passar a network para buscar cycleDurationInDays
            });

            console.log('✅ lastDistribution atualizado no metadata do stake contract');
          } catch (updateError) {
            console.error('❌ Erro ao atualizar lastDistribution:', updateError.response?.data || updateError);
          }
        }

        setShowConfirmModal(false);
        setModalInputs({});

        // Recarregar dados
        await loadDashboardData();

        // Se foi operação na whitelist, sempre recarregar (independente de estar habilitada)
        if (['addToWhitelist', 'removeFromWhitelist', 'setWhitelistEnabled'].includes(modalAction.type)) {
          await loadWhitelist();
        }
      } else {
        throw new Error(response.data.message || t('companyStakes.messages.errorExecutingFunction'));
      }
    } catch (error) {
      console.error('Error executing write function:', error);
      showError(error.response?.data?.message || error.message || t('companyStakes.messages.errorExecutingFunction'));
    } finally {
      setExecuting(false);
    }
  };

  // Loading state
  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-slate-600 dark:text-slate-400">{t('companyStakes.loading')}</p>
        </div>
      </div>
    );
  }

  // Se não tem currentCompany nem companyId na URL
  if (!effectiveCompanyId) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {t('companyStakes.emptyState.companyNotIdentified')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t('companyStakes.emptyState.companyNotIdentifiedDesc')}
            </p>
            <Button
              onClick={() => router.push('/admin/companies')}
              variant="outline"
            >
              {t('companyStakes.emptyState.goToCompanies')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('companyStakes.title')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('companyStakes.subtitle', { companyName: currentCompany?.name })}
        </p>
      </div>

      {/* Empty State - No Contracts */}
      {!loading && contracts.length === 0 && (
        <Card>
          <div className="text-center py-16">
            <Building className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t('companyStakes.emptyState.noContractsTitle')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('companyStakes.emptyState.noContractsDesc', { network: defaultNetwork })}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={loadContracts}
                icon="heroicons:arrow-path-solid"
                text={t('companyStakes.actions.reload')}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Contract Selector */}
      {contracts.length > 0 && (
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              <div className="flex items-center space-x-4 flex-1 lg:flex-initial lg:min-w-[400px]">
                <Building className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('companyStakes.contract.selectContract')}
                  </label>
                  <select
                    value={selectedContract?.id || ''}
                    onChange={(e) => {
                      const contract = contracts.find(c => c.id === e.target.value);
                      setSelectedContract(contract);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                  >
                    {contracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.name} - {contract.address.substring(0, 10)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {tokenSymbols.stakeToken && tokenSymbols.rewardToken && (
                <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg lg:self-start lg:mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">{t('companyStakes.contract.stake')}:</span>
                    <img
                      src={`/assets/images/currencies/${tokenSymbols.stakeToken}.png`}
                      alt={tokenSymbols.stakeToken}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {tokenSymbols.stakeToken}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">{t('companyStakes.contract.reward')}:</span>
                    <img
                      src={`/assets/images/currencies/${tokenSymbols.rewardToken}.png`}
                      alt={tokenSymbols.rewardToken}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {tokenSymbols.rewardToken}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={loadDashboardData}
                isLoading={loading}
                className="bg-primary-500 hover:bg-primary-600 text-white lg:self-start lg:mt-6"
              >
                <div className="flex items-center justify-center">
                  <RefreshCw size={16} className="mr-2" />
                  {t('companyStakes.actions.update')}
                </div>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {selectedContract && (
        <>
          {/* Error Alert */}
          {(dashboardError || errorCount > 0) && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start p-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    {dashboardError ? t('companyStakes.error.problemLoadingData') : t('companyStakes.error.functionsNotRead', { count: errorCount })}
                  </h3>

                  {dashboardError ? (
                    <>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                        {t('companyStakes.error.unableToConnect')}
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1 mb-3">
                        <li>{t('companyStakes.error.contractNotDeployed')}</li>
                        <li>{t('companyStakes.error.adminNoPermission')}</li>
                        <li>{t('companyStakes.error.networkUnavailable')}</li>
                        <li>{t('companyStakes.error.abiOutdated')}</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                        {t('companyStakes.error.someFunctionsReturned')}
                      </p>
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-3 mb-3 max-h-60 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left border-b border-yellow-300 dark:border-yellow-700">
                              <th className="pb-2 font-semibold text-yellow-800 dark:text-yellow-300">{t('companyStakes.error.function')}</th>
                              <th className="pb-2 font-semibold text-yellow-800 dark:text-yellow-300">{t('companyStakes.error.error')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {failedFunctions.map((failed, index) => (
                              <tr key={index} className="border-b border-yellow-200 dark:border-yellow-800 last:border-0">
                                <td className="py-2 font-mono text-yellow-900 dark:text-yellow-200">
                                  {failed.function}
                                </td>
                                <td className="py-2 text-yellow-700 dark:text-yellow-400">
                                  {failed.error}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={loadDashboardData}
                      size="sm"
                      variant="outline"
                      className="border-yellow-600 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    >
                      <RefreshCw size={14} className="mr-2" />
                      {t('companyStakes.error.tryAgain')}
                    </Button>
                    <Button
                      onClick={() => router.push('/system/settings')}
                      size="sm"
                      variant="outline"
                      className="border-yellow-600 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    >
                      {t('companyStakes.error.checkSettings')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Dashboard Section */}
          <Card>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('dashboard')}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
                {t('companyStakes.dashboard.title')}
                {errorCount > 0 && errorCount < 9 && (
                  <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                    {t('companyStakes.dashboard.errors', { count: errorCount })}
                  </Badge>
                )}
              </h2>
              {expandedSections.dashboard ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.dashboard && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <Badge className="bg-blue-600 text-white">{t('companyStakes.dashboard.vault')}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatTokenAmount(dashboardData.availableRewardBalance)} <span className="text-lg text-slate-900 dark:text-white">{tokenSymbols.rewardToken || ''}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('companyStakes.dashboard.availableBalance')}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <Badge className="bg-green-600 text-white">{t('companyStakes.dashboard.invested')}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatTokenAmount(dashboardData.totalStaked)} <span className="text-lg text-slate-900 dark:text-white">{tokenSymbols.stakeToken || ''}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('companyStakes.dashboard.totalInStake')}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <Badge className="bg-purple-600 text-white">{t('companyStakes.dashboard.users')}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {dashboardData.activeUsers}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('companyStakes.dashboard.active')}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <Badge className="bg-orange-600 text-white">{t('companyStakes.dashboard.rewards')}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatTokenAmount(dashboardData.totalRewardsDistributed)} <span className="text-lg text-slate-900 dark:text-white">{tokenSymbols.rewardToken || ''}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('companyStakes.dashboard.totalDistributed')}</p>
                  {lastDistribution.hasDistribution && (
                    <div className="mt-2 pt-2 border-t border-orange-200 dark:border-orange-700">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('companyStakes.dashboard.last')}: <span className="font-semibold text-orange-700 dark:text-orange-300">{(lastDistribution.distributionPercentage / 100).toFixed(2)}%</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {new Date(lastDistribution.distributedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyStakes.dashboard.cycleDuration')}</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('companyStakes.dashboard.days', { count: dashboardData.cycleDuration })}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyStakes.dashboard.cycleStart')}</p>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {formatDate(dashboardData.cycleStartTime)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyStakes.dashboard.minValue')}</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatTokenAmount(dashboardData.minStakeValue)} <span className="text-sm text-slate-900 dark:text-white">{tokenSymbols.stakeToken || ''}</span>
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyStakes.dashboard.settings')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t('companyStakes.dashboard.whitelist')}: <span className={dashboardData.whitelistEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {dashboardData.whitelistEnabled ? `✅ ${t('companyStakes.dashboard.active')}` : `❌ ${t('companyStakes.dashboard.deactivated')}`}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t('companyStakes.dashboard.restake')}: <span className={dashboardData.isRestakeAllowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {dashboardData.isRestakeAllowed ? `✅ ${t('companyStakes.dashboard.allowed')}` : `❌ ${t('companyStakes.dashboard.blocked')}`}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t('companyStakes.dashboard.stake')}: <span className={dashboardData.stakingBlocked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                        {dashboardData.stakingBlocked ? `🔒 ${t('companyStakes.dashboard.blocked')}` : `✅ ${t('companyStakes.dashboard.available')}`}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Whitelist Section */}
          <Card>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('whitelist')}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary-500" />
                {t('companyStakes.whitelist.title')}
                {dashboardData.whitelistEnabled && (
                  <Badge className="ml-2 bg-green-500 text-white">{t('companyStakes.whitelist.active')}</Badge>
                )}
              </h2>
              {expandedSections.whitelist ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.whitelist && (
              <div className="mt-4 space-y-4">
                {/* Check Address */}
                <div className="flex gap-2">
                  <Textinput
                    placeholder={t('companyStakes.whitelist.checkAddressPlaceholder')}
                    value={checkingAddress}
                    onChange={(e) => setCheckingAddress(e.target.value)}
                  />
                  <Button onClick={checkAddressInWhitelist} isLoading={loading}>
                    <div className="flex items-center justify-center">
                      <Eye size={16} className="mr-2" />
                      {t('companyStakes.whitelist.check')}
                    </div>
                  </Button>
                </div>

                {addressCheckResult && (
                  <div className={`p-4 rounded-lg ${addressCheckResult.isWhitelisted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <div className="flex items-center">
                      {addressCheckResult.isWhitelisted ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <p className="text-sm font-medium">
                        {addressCheckResult.address} {addressCheckResult.isWhitelisted ? t('companyStakes.whitelist.isInWhitelist') : t('companyStakes.whitelist.notInWhitelist')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Whitelist Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => openConfirmModal(
                      { type: 'addToWhitelist', label: t('companyStakes.whitelist.addToWhitelist') },
                      {}
                    )}
                    className="btn-success"
                  >
                    <div className="flex items-center justify-center">
                      <UserPlus size={16} className="mr-2" />
                      {t('companyStakes.whitelist.addAddress')}
                    </div>
                  </Button>

                  <Button
                    onClick={() => openConfirmModal(
                      { type: 'removeFromWhitelist', label: t('companyStakes.whitelist.removeFromWhitelist') },
                      {}
                    )}
                    className="btn-danger"
                  >
                    <div className="flex items-center justify-center">
                      <UserMinus size={16} className="mr-2" />
                      {t('companyStakes.whitelist.removeAddress')}
                    </div>
                  </Button>

                  <Button
                    onClick={() => openConfirmModal(
                      { type: 'setWhitelistEnabled', label: dashboardData.whitelistEnabled ? t('companyStakes.whitelist.deactivateWhitelist') : t('companyStakes.whitelist.activateWhitelist') },
                      { enabled: !dashboardData.whitelistEnabled }
                    )}
                    variant="outline"
                  >
                    <div className="flex items-center justify-center">
                      <Shield size={16} className="mr-2" />
                      {dashboardData.whitelistEnabled ? t('companyStakes.whitelist.deactivate') : t('companyStakes.whitelist.activate')} {t('companyStakes.whitelist.whitelist')}
                    </div>
                  </Button>
                </div>

                {/* Whitelist Addresses Table */}
                <div>
                  {!dashboardData.whitelistEnabled && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          {t('companyStakes.whitelist.whitelistDisabled')} - {t('companyStakes.whitelist.manageAddressesAnyway')}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('companyStakes.whitelist.usersInWhitelist', { count: whitelistAddresses.length })}
                    </h3>
                    <Button
                      onClick={loadWhitelist}
                      variant="outline"
                      size="sm"
                      isLoading={loadingWhitelistData}
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw size={14} className="mr-1" />
                        {t('companyStakes.actions.update')}
                      </div>
                    </Button>
                  </div>

                    {loadingWhitelistData ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('companyStakes.whitelist.loadingUsers')}</p>
                      </div>
                    ) : whitelistUsersData.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">{t('companyStakes.whitelist.table.name')}</th>
                              <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">{t('companyStakes.whitelist.table.email')}</th>
                              <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">{t('companyStakes.whitelist.table.address')}</th>
                              <th className="text-right py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">{t('companyStakes.whitelist.table.inStake')}</th>
                              <th className="text-right py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">{t('companyStakes.whitelist.table.toReceive')}</th>
                              <th className="text-center py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">{t('companyStakes.whitelist.table.actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {whitelistUsersData.map((userData, index) => (
                              <tr
                                key={index}
                                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <td className="py-3 px-2">
                                  <div className="flex items-center">
                                    {userData.hasUserData ? (
                                      <CheckCircle className="w-3 h-3 text-green-500 mr-1.5" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3 text-slate-400 mr-1.5" />
                                    )}
                                    <span className="text-slate-900 dark:text-white">
                                      {userData.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                                  {userData.email}
                                </td>
                                <td className="py-3 px-2">
                                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                    {userData.address.substring(0, 6)}...{userData.address.substring(38)}
                                  </code>
                                </td>
                                <td className="py-3 px-2 text-right font-medium text-slate-900 dark:text-white">
                                  {formatTokenAmount(userData.stakedBalance)}
                                </td>
                                <td className="py-3 px-2 text-right font-medium text-green-600 dark:text-green-400">
                                  {formatTokenAmount(userData.pendingRewards)}
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <Button
                                    onClick={() => openConfirmModal(
                                      { type: 'removeFromWhitelist', label: t('companyStakes.whitelist.removeFromWhitelist') },
                                      { address: userData.address }
                                    )}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                                  >
                                    <UserMinus size={14} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm mb-2">{t('companyStakes.whitelist.noUsers')}</p>
                        <p className="text-xs text-slate-400">
                          {dashboardData.whitelistEnabled
                            ? t('companyStakes.whitelist.whitelistEnabledNoAddresses')
                            : t('companyStakes.whitelist.whitelistDisabled')}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}
          </Card>

          {/* Rewards Section */}
          <Card>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('rewards')}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Gift className="w-5 h-5 mr-2 text-primary-500" />
                {t('companyStakes.rewards.title')}
              </h2>
              {expandedSections.rewards ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.rewards && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => openConfirmModal(
                    { type: 'depositRewards', label: t('companyStakes.rewards.depositRewards') },
                    {}
                  )}
                  className="btn-primary"
                >
                  <div className="flex items-center justify-center">
                    <ArrowDownCircle size={16} className="mr-2" />
                    {t('companyStakes.rewards.depositRewards')}
                  </div>
                </Button>

                <Button
                  onClick={() => openConfirmModal(
                    { type: 'distributeReward', label: t('companyStakes.rewards.distributeRewards') },
                    {}
                  )}
                  className="btn-success"
                >
                  <div className="flex items-center justify-center">
                    <Send size={16} className="mr-2" />
                    {t('companyStakes.rewards.distributeRewards')}
                  </div>
                </Button>

                <Button
                  onClick={() => openConfirmModal(
                    { type: 'withdrawRewardTokens', label: t('companyStakes.rewards.withdrawFromVault') },
                    {}
                  )}
                  className="btn-warning"
                >
                  <div className="flex items-center justify-center">
                    <ArrowUpCircle size={16} className="mr-2" />
                    {t('companyStakes.rewards.withdrawFromVault')}
                  </div>
                </Button>
              </div>
            )}
          </Card>

          {/* Settings Section */}
          <Card>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('settings')}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary-500" />
                {t('companyStakes.settings.title')}
              </h2>
              {expandedSections.settings ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.settings && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => openConfirmModal(
                    { type: 'updateMinValueStake', label: t('companyStakes.settings.updateMinValue') },
                    { currentValue: dashboardData.minStakeValue }
                  )}
                  className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <div className="flex items-center justify-center">
                    <DollarSign size={16} className="mr-2" />
                    {t('companyStakes.settings.minValue')}
                  </div>
                </Button>

                <Button
                  onClick={() => openConfirmModal(
                    { type: 'setCycleDuration', label: t('companyStakes.settings.changeCycleDuration') },
                    { currentDuration: dashboardData.cycleDuration }
                  )}
                  className="bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  <div className="flex items-center justify-center">
                    <Clock size={16} className="mr-2" />
                    {t('companyStakes.settings.cycleDuration')}
                  </div>
                </Button>

                <Button
                  onClick={() => openConfirmModal(
                    { type: 'setAllowRestake', label: t('companyStakes.settings.allowBlockRestake') },
                    { allowed: !dashboardData.isRestakeAllowed, currentStatus: dashboardData.isRestakeAllowed }
                  )}
                  className={dashboardData.isRestakeAllowed
                    ? 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700'
                    : 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
                  }
                >
                  <div className="flex items-center justify-center">
                    <RefreshCw size={16} className="mr-2" />
                    {dashboardData.isRestakeAllowed ? t('companyStakes.settings.blockRestake') : t('companyStakes.settings.allowRestake')}
                  </div>
                </Button>

                <Button
                  onClick={() => openConfirmModal(
                    { type: 'setStakingBlocked', label: t('companyStakes.settings.blockUnblockStakes') },
                    { blocked: !dashboardData.stakingBlocked, currentStatus: dashboardData.stakingBlocked }
                  )}
                  className={dashboardData.stakingBlocked
                    ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700'
                  }
                >
                  <div className="flex items-center justify-center">
                    <Shield size={16} className="mr-2" />
                    {dashboardData.stakingBlocked ? t('companyStakes.settings.unblockStakes') : t('companyStakes.settings.blockStakes')}
                  </div>
                </Button>
              </div>
            )}
          </Card>

          {/* Actions History Section */}
          <Card>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('actions')}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-500" />
                {t('companyStakes.actions.title')}
                {contractActions.length > 0 && (
                  <Badge className="ml-2 bg-primary-500 text-white text-xs">
                    {contractActions.length}
                  </Badge>
                )}
              </h2>
              {expandedSections.actions ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections.actions && (
              <div className="mt-4">
                {loadingActions ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                    <span className="ml-2 text-slate-600 dark:text-slate-400">{t('companyStakes.actions.loadingActions')}</span>
                  </div>
                ) : contractActions.length === 0 ? (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">{t('companyStakes.actions.noActionsYet')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('companyStakes.actions.table.dateTime')}
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('companyStakes.actions.table.user')}
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('companyStakes.actions.table.action')}
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('companyStakes.actions.table.parameters')}
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('companyStakes.actions.table.transaction')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractActions.map((action, index) => (
                          <tr
                            key={action.id}
                            className={`border-b border-slate-100 dark:border-slate-800 ${
                              index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                              {new Date(action.createdAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-medium">
                              {action.userName}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="bg-primary-500 text-white text-xs">
                                {t(`companyStakes.actions.names.${action.actionType}`) || action.actionName}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                              {action.actionType === 'distributeReward' && action.metadata?.distributionPercentage ? (
                                <span className="font-semibold text-orange-600 dark:text-orange-400">
                                  {(action.metadata.distributionPercentage / 100).toFixed(2)}%
                                </span>
                              ) : action.params && action.params.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {action.params.map((param, i) => {
                                    // Formatação especial para booleanos baseado no tipo de ação
                                    if (typeof param === 'boolean') {
                                      let badgeText = '';
                                      let badgeColor = '';

                                      if (action.actionType === 'setWhitelistEnabled') {
                                        badgeText = param ? t('companyStakes.actions.params.activated') : t('companyStakes.actions.params.deactivated');
                                        badgeColor = param ? 'bg-green-500' : 'bg-red-500';
                                      } else if (action.actionType === 'setAllowRestake') {
                                        badgeText = param ? t('companyStakes.actions.params.allowed') : t('companyStakes.actions.params.blocked');
                                        badgeColor = param ? 'bg-green-500' : 'bg-red-500';
                                      } else if (action.actionType === 'setStakingBlocked') {
                                        badgeText = param ? t('companyStakes.actions.params.blocked') : t('companyStakes.actions.params.available');
                                        badgeColor = param ? 'bg-red-500' : 'bg-green-500';
                                      } else {
                                        badgeText = param ? t('companyStakes.actions.params.yes') : t('companyStakes.actions.params.no');
                                        badgeColor = param ? 'bg-green-500' : 'bg-red-500';
                                      }

                                      return (
                                        <Badge key={i} className={`${badgeColor} text-white text-xs`}>
                                          {badgeText}
                                        </Badge>
                                      );
                                    } else if (typeof param === 'string' || typeof param === 'number') {
                                      const paramStr = param.toString();

                                      // Verificar se é um endereço Ethereum (0x + 40 caracteres hexadecimais)
                                      if (paramStr.startsWith('0x') && paramStr.length === 42) {
                                        const shortened = `${paramStr.slice(0, 5)}...${paramStr.slice(-5)}`;
                                        return (
                                          <span key={i} className="font-mono text-xs text-slate-900 dark:text-white">
                                            {shortened}
                                          </span>
                                        );
                                      }
                                      // Se tem mais de 15 dígitos, provavelmente é wei
                                      else if (paramStr.length > 15 && !isNaN(paramStr)) {
                                        try {
                                          const valueInUnits = parseFloat(ethers.formatUnits(paramStr, 18));
                                          const formattedValue = valueInUnits.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 6,
                                            maximumFractionDigits: 6
                                          });
                                          return (
                                            <span key={i} className="font-semibold text-slate-900 dark:text-white">
                                              {formattedValue}
                                            </span>
                                          );
                                        } catch (e) {
                                          return (
                                            <span key={i} className="font-mono text-xs">
                                              {paramStr}
                                            </span>
                                          );
                                        }
                                      } else {
                                        // Verificar se é duração de ciclo (ação setCycleDuration)
                                        const isDuration = action.actionType === 'setCycleDuration';
                                        return (
                                          <span key={i} className={isDuration ? 'font-semibold text-orange-600 dark:text-orange-400' : 'font-mono text-xs'}>
                                            {paramStr}{isDuration ? ` ${t('companyStakes.actions.params.days')}` : ''}
                                          </span>
                                        );
                                      }
                                    } else if (typeof param === 'object') {
                                      return (
                                        <span key={i} className="font-mono text-xs">
                                          {JSON.stringify(param)}
                                        </span>
                                      );
                                    }

                                    return null;
                                  })}
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              {action.metadata?.transactionHash ? (
                                <a
                                  href={`https://${selectedContract.network === 'mainnet' ? '' : 'floripa.'}azorescan.com/tx/${action.metadata.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 font-mono"
                                >
                                  {action.metadata.transactionHash.slice(0, 10)}...
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Seção de Demonstrativos */}
          <StakeStatementsSection
            contractId={selectedContract.id}
            companyId={effectiveCompanyId}
            contractName={selectedContract.name}
          />
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        activeModal={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setModalInputs({});
        }}
        title={modalAction?.label || t('companyStakes.modals.confirmAction')}
        footerContent={
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmModal(false);
                setModalInputs({});
              }}
              className="bg-white dark:bg-slate-700 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-400 dark:text-red-400"
            >
              {t('companyStakes.modals.cancel')}
            </Button>
            <Button
              onClick={executeWriteFunction}
              isLoading={executing}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              {t('companyStakes.modals.confirm')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-300 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('companyStakes.modals.attention')}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-100 mt-1">
                  {t('companyStakes.modals.blockchainWarning')}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic inputs based on action type */}
          {modalAction?.type === 'depositRewards' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{t('companyStakes.modals.depositRewards.yourBalance')}</p>
                  <div className="flex items-center space-x-2">
                    <img
                      src={`/assets/images/currencies/${tokenSymbols.rewardToken || getTokenSymbol(dashboardData.rewardToken)}.png`}
                      alt={tokenSymbols.rewardToken || getTokenSymbol(dashboardData.rewardToken)}
                      className="w-5 h-5"
                    />
                    <div className="text-base font-semibold text-slate-900 dark:text-white">
                      <BalanceDisplay
                        value={getBalance(tokenSymbols.rewardToken || getTokenSymbol(dashboardData.rewardToken)) || '0'}
                        showSymbol={false}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{t('companyStakes.modals.depositRewards.vaultBalance')}</p>
                  <div className="flex items-center space-x-2">
                    <img
                      src={`/assets/images/currencies/${tokenSymbols.rewardToken || getTokenSymbol(dashboardData.rewardToken)}.png`}
                      alt={tokenSymbols.rewardToken || getTokenSymbol(dashboardData.rewardToken)}
                      className="w-5 h-5"
                    />
                    <div className="text-base font-semibold text-slate-900 dark:text-white">
                      {formatTokenAmount(dashboardData.availableRewardBalance)}
                    </div>
                  </div>
                </div>
              </div>
              <Textinput
                label={t('companyStakes.modals.depositRewards.tokenQuantity')}
                type="number"
                placeholder={t('companyStakes.modals.depositRewards.placeholder')}
                value={modalInputs.amount || ''}
                onChange={(e) => setModalInputs({ ...modalInputs, amount: e.target.value })}
              />
            </>
          )}

          {modalAction?.type === 'distributeReward' && (
            <Textinput
              label={t('companyStakes.modals.distributeReward.percentageLabel')}
              type="number"
              placeholder={t('companyStakes.modals.distributeReward.placeholder')}
              value={modalInputs.percentage || ''}
              onChange={(e) => setModalInputs({ ...modalInputs, percentage: e.target.value })}
            />
          )}

          {modalAction?.type === 'addToWhitelist' && (
            <div className="space-y-4">
              {loadingCompanyUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">{t('companyStakes.modals.addToWhitelist.loadingUsers')}</span>
                </div>
              ) : (() => {
                // Filtrar usuários que NÃO estão na whitelist
                const usersNotInWhitelist = companyUsers.filter(user => {
                  const normalizedUserAddress = user.blockchainAddress?.toLowerCase();
                  return !whitelistAddresses.some(addr => addr.toLowerCase() === normalizedUserAddress);
                });

                // console.log(`📋 Modal Adicionar - Total usuários: ${companyUsers.length}`);
                // console.log(`📋 Modal Adicionar - Whitelist tem: ${whitelistAddresses.length} endereços`);
                // console.log(`📋 Modal Adicionar - Usuários fora da whitelist: ${usersNotInWhitelist.length}`);

                return usersNotInWhitelist.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600">
                    {t('companyStakes.modals.addToWhitelist.allUsersInWhitelist')}
                  </div>
                ) : (
                  <Select
                    label={t('companyStakes.modals.addToWhitelist.selectUser')}
                    placeholder={t('companyStakes.modals.addToWhitelist.selectPlaceholder')}
                    value={modalInputs.selectedUserId || ''}
                    onChange={(e) => {
                      const userId = e.target.value;
                      const user = usersNotInWhitelist.find(u => u.id === userId);
                      if (user) {
                        setModalInputs({
                          ...modalInputs,
                          selectedUserId: userId,
                          address: user.blockchainAddress
                        });
                      } else {
                        setModalInputs({
                          ...modalInputs,
                          selectedUserId: '',
                          address: ''
                        });
                      }
                    }}
                    options={usersNotInWhitelist.map(user => ({
                      value: user.id,
                      label: `${user.name} - ${user.email}`
                    }))}
                  />
                );
              })()}
              <Textinput
                label={t('companyStakes.modals.addToWhitelist.addressLabel')}
                placeholder={t('companyStakes.modals.addToWhitelist.addressPlaceholder')}
                value={modalInputs.address || ''}
                onChange={(e) => setModalInputs({ ...modalInputs, address: e.target.value })}
              />
            </div>
          )}

          {modalAction?.type === 'removeFromWhitelist' && (
            <div className="space-y-4">
              {loadingCompanyUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">{t('companyStakes.modals.removeFromWhitelist.loadingUsers')}</span>
                </div>
              ) : (() => {
                // Filtrar usuários que ESTÃO na whitelist
                const usersInWhitelist = companyUsers.filter(user => {
                  const normalizedUserAddress = user.blockchainAddress?.toLowerCase();
                  return whitelistAddresses.some(addr => addr.toLowerCase() === normalizedUserAddress);
                });

                return usersInWhitelist.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600">
                    {t('companyStakes.modals.removeFromWhitelist.noUsersInWhitelist')}
                  </div>
                ) : (
                  <Select
                    label={t('companyStakes.modals.removeFromWhitelist.selectUser')}
                    placeholder={t('companyStakes.modals.removeFromWhitelist.selectPlaceholder')}
                    value={modalInputs.selectedUserId || ''}
                    onChange={(e) => {
                      const userId = e.target.value;
                      const user = usersInWhitelist.find(u => u.id === userId);
                      if (user) {
                        setModalInputs({
                          ...modalInputs,
                          selectedUserId: userId,
                          address: user.blockchainAddress
                        });
                      } else {
                        setModalInputs({
                          ...modalInputs,
                          selectedUserId: '',
                          address: ''
                        });
                      }
                    }}
                    options={usersInWhitelist.map(user => ({
                      value: user.id,
                      label: `${user.name} - ${user.email}`
                    }))}
                  />
                );
              })()}
              <Textinput
                label={t('companyStakes.modals.removeFromWhitelist.addressLabel')}
                placeholder={t('companyStakes.modals.removeFromWhitelist.addressPlaceholder')}
                value={modalInputs.address || ''}
                onChange={(e) => {
                  setModalInputs({
                    ...modalInputs,
                    address: e.target.value,
                    selectedUserId: '' // Limpa o select se digitar manualmente
                  });
                }}
                readOnly={!!modalInputs.selectedUserId}
              />
            </div>
          )}

          {modalAction?.type === 'updateMinValueStake' && (
            <>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t('companyStakes.modals.updateMinValue.currentValue')}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatTokenAmount(modalInputs.currentValue || '0')}
                </p>
              </div>
              <Textinput
                label={t('companyStakes.modals.updateMinValue.newMinValue')}
                type="number"
                placeholder={t('companyStakes.modals.updateMinValue.placeholder')}
                value={modalInputs.value || ''}
                onChange={(e) => setModalInputs({ ...modalInputs, value: e.target.value })}
              />
            </>
          )}

          {modalAction?.type === 'withdrawRewardTokens' && (
            <>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{t('companyStakes.modals.withdrawRewardTokens.availableBalance')}</p>
                <div className="flex items-center space-x-2">
                  <img
                    src={`/assets/images/currencies/${tokenSymbols.rewardToken || getTokenSymbol(dashboardData.rewardToken)}.png`}
                    alt={tokenSymbols.rewardToken || getTokenSymbol(dashboardData.rewardToken)}
                    className="w-5 h-5"
                  />
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatTokenAmount(dashboardData.availableRewardBalance)}
                  </div>
                </div>
              </div>
              <div className="relative">
                <Textinput
                  label={t('companyStakes.modals.withdrawRewardTokens.withdrawQuantity')}
                  type="number"
                  placeholder={t('companyStakes.modals.withdrawRewardTokens.placeholder')}
                  value={modalInputs.amount || ''}
                  onChange={(e) => setModalInputs({ ...modalInputs, amount: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => {
                    // Converter de wei para unidade legível (eth/tokens)
                    const maxAmountWei = dashboardData.availableRewardBalance?.toString() || '0';
                    const maxAmountFormatted = ethers.formatUnits(maxAmountWei, 18);
                    setModalInputs({ ...modalInputs, amount: maxAmountFormatted });
                  }}
                  className="absolute right-3 top-[34px] px-3 py-1 text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors"
                >
                  {t('companyStakes.modals.withdrawRewardTokens.maxButton')}
                </button>
              </div>
            </>
          )}

          {modalAction?.type === 'setCycleDuration' && (
            <>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t('companyStakes.modals.setCycleDuration.currentDuration')}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {modalInputs.currentDuration || 0} {t('companyStakes.modals.setCycleDuration.days')}
                </p>
              </div>
              <Textinput
                label={t('companyStakes.modals.setCycleDuration.newDuration')}
                type="number"
                placeholder={t('companyStakes.modals.setCycleDuration.placeholder')}
                value={modalInputs.days || ''}
                onChange={(e) => setModalInputs({ ...modalInputs, days: e.target.value })}
              />
            </>
          )}

          {modalAction?.type === 'setWhitelistEnabled' && (
            <div className="text-center py-4">
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {modalInputs.enabled ? t('companyStakes.modals.setWhitelistEnabled.activate') : t('companyStakes.modals.setWhitelistEnabled.deactivate')} {t('companyStakes.modals.setWhitelistEnabled.question')}
              </p>
            </div>
          )}

          {modalAction?.type === 'setAllowRestake' && (
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('companyStakes.modals.setAllowRestake.currentStatus')}</p>
                <p className={`text-xl font-bold mb-4 ${modalInputs.currentStatus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {modalInputs.currentStatus ? `✅ ${t('companyStakes.modals.setAllowRestake.restakeAllowed')}` : `🔒 ${t('companyStakes.modals.setAllowRestake.restakeBlocked')}`}
                </p>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-3 mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('companyStakes.modals.setAllowRestake.willChangeTitle')}</p>
                  <p className={`text-xl font-bold ${!modalInputs.currentStatus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {modalInputs.allowed ? `✅ ${t('companyStakes.modals.setAllowRestake.restakeAllowed')}` : `🔒 ${t('companyStakes.modals.setAllowRestake.restakeBlocked')}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {modalAction?.type === 'setStakingBlocked' && (
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('companyStakes.modals.setStakingBlocked.currentStatus')}</p>
                <p className={`text-xl font-bold mb-4 ${modalInputs.currentStatus ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {modalInputs.currentStatus ? `🔒 ${t('companyStakes.modals.setStakingBlocked.stakesBlocked')}` : `✅ ${t('companyStakes.modals.setStakingBlocked.stakesAvailable')}`}
                </p>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-3 mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('companyStakes.modals.setStakingBlocked.willChangeTitle')}</p>
                  <p className={`text-xl font-bold ${!modalInputs.currentStatus ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {modalInputs.blocked ? `🔒 ${t('companyStakes.modals.setStakingBlocked.stakesBlocked')}` : `✅ ${t('companyStakes.modals.setStakingBlocked.stakesAvailable')}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CompanyStakesManagementPage;

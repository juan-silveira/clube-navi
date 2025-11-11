"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import Select from "react-select";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from '@/contexts/AlertContext';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import useConfig from "@/hooks/useConfig";
import axios from "axios";
import useAuthStore from "@/store/authStore";

const CompanyTransactionsPage = () => {
  const { t } = useTranslation('admin');

  // Hook para gerenciar título da aba com contagem de notificações
  useDocumentTitle(t('transactions.pageTitle'), 'Clube Digital', true);
  
  const { showSuccess, showError, showInfo, showWarning } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();
  const { defaultNetwork } = useConfig();
  const { accessToken, isAuthenticated } = useAuthStore();
  
  // Estados
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [tokenFilter, setTokenFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [userFilter, setUserFilter] = useState("");
  const [tokenOptions, setTokenOptions] = useState([]);

  // Opções para filtros (mantidas estáticas)

  const typeOptions = [
    { value: 'deposit', label: t('transactions.types.deposit') },
    { value: 'withdraw', label: t('transactions.types.withdraw') },
    { value: 'transfer', label: t('transactions.types.transfer') },
    { value: 'exchange', label: t('transactions.types.exchange') },
    { value: 'stake', label: t('transactions.types.stake') },
    { value: 'unstake', label: t('transactions.types.unstake') },
    { value: 'stake_reward', label: t('transactions.types.stake_reward') }
  ];

  const statusOptions = [
    { value: 'confirmed', label: t('transactions.statuses.confirmed') },
    { value: 'pending', label: t('transactions.statuses.pending') },
    { value: 'failed', label: t('transactions.statuses.failed') },
    { value: 'cancelled', label: t('transactions.statuses.cancelled') }
  ];

  const itemsPerPageOptions = [
    { value: 10, label: t('transactions.pagination.perPage', { count: 10 }) },
    { value: 20, label: t('transactions.pagination.perPage', { count: 20 }) },
    { value: 50, label: t('transactions.pagination.perPage', { count: 50 }) },
    { value: 100, label: t('transactions.pagination.perPage', { count: 100 }) }
  ];

  // Função para carregar tokens disponíveis do banco de dados
  const loadAvailableTokens = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      // console.log('🔐 User not authenticated, skipping tokens load');
      return;
    }

    try {
      // console.log('🪙 Loading available tokens from database...');
      
      const response = await axios.get('/api/transactions/available-tokens', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // console.log('✅ Available tokens response:', response.data);
      
      if (response.data.success) {
        const tokens = response.data.data || [];
        setTokenOptions(tokens);
        // console.log(`✅ Loaded ${tokens.length} tokens from database`);
      } else {
        console.warn('⚠️ No tokens found or API error:', response.data.message);
        setTokenOptions([]); // Fallback para array vazio
      }
    } catch (error) {
      console.error('❌ Error loading available tokens:', error.message);
      showError(t('transactions.messages.errorLoadingTokens'));
      setTokenOptions([]); // Fallback para array vazio
    }
  }, [isAuthenticated, accessToken, showError, t]);

  // Função para carregar transações
  const loadTransactions = useCallback(async () => {
    // Verificar se está autenticado
    if (!isAuthenticated || !accessToken) {
      // console.log('🔐 User not authenticated, skipping transaction load');
      setError(t('transactions.messages.notAuthenticated'));
      showError(t('transactions.messages.notAuthenticated'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // console.log('🔍 Loading company transactions...');
      
      const response = await axios.get('/api/transactions/company', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // console.log('✅ API Response received:', response.data);
      
      if (response.data.success) {
        const transactions = response.data.data.transactions || [];
        
        // Mapear os dados da API para o formato esperado pelo frontend usando estrutura real da tabela transactions
        const mappedTransactions = transactions.map(tx => {
          // console.log('🔍 [DEBUG] Transação original:', {
          //   id: tx.id,
          //   type: tx.transactionType,
          //   userId: tx.userId,
          //   userName: tx.user?.name,
          //   userAddress: tx.user?.blockchainAddress,
          //   from_address: tx.from_address,
          //   to_address: tx.to_address,
          //   amount: tx.amount,
          //   net_amount: tx.net_amount
          // });

          // Helper para determinar token symbol e name baseado nos metadados ou currency
          const getTokenInfo = (tx) => {
            // Priorizar informações dos metadados
            if (tx.metadata?.tokenSymbol) {
              return {
                tokenSymbol: tx.metadata.tokenSymbol,
                tokenName: tx.metadata.tokenName || tx.metadata.tokenSymbol
              };
            }
            
            // Fallback para currency
            const currencyMap = {
              'cBRL': { symbol: 'cBRL', name: 'Clube Digital Real Brasil' },
              'AZE': { symbol: 'AZE', name: 'Azore' },
              'AZE-t': { symbol: 'AZE-t', name: 'Azore Testnet' },
              'STT': { symbol: 'STT', name: 'Stake Token' },
              'USDT': { symbol: 'USDT', name: 'Tether' },
              'USDC': { symbol: 'USDC', name: 'USD Coin' },
              'BTC': { symbol: 'BTC', name: 'Bitcoin' },
              'ETH': { symbol: 'ETH', name: 'Ethereum' }
            };
            
            const currency = tx.currency || 'AZE-t';
            const tokenInfo = currencyMap[currency] || { symbol: currency, name: currency };
            
            return {
              tokenSymbol: tokenInfo.symbol,
              tokenName: tokenInfo.name
            };
          };

          // Determinar tipo e subtipo baseado em transactionType e operation
          const getTypeInfo = (tx) => {
            const type = tx.transactionType || 'transfer';
            const operation = tx.metadata?.operation;

            let mappedType = type;
            let subType = 'debit';

            // Mapear tipos para o frontend
            if (type === 'contract_call') {
              if (operation === 'mint') {
                mappedType = 'deposit';
                subType = 'credit';
              } else if (operation === 'burn') {
                mappedType = 'withdraw';
                subType = 'debit';
              } else if (operation === 'transfer') {
                mappedType = 'transfer';
                // Para transferências, determinar subType baseado nos endereços
                const userAddress = tx.user?.blockchainAddress?.toLowerCase();
                const fromAddress = tx.from_address?.toLowerCase();
                const toAddress = tx.to_address?.toLowerCase();

                if (userAddress && fromAddress && userAddress === fromAddress) {
                  subType = 'debit'; // Usuário enviou
                } else if (userAddress && toAddress && userAddress === toAddress) {
                  subType = 'credit'; // Usuário recebeu
                } else {
                  subType = 'neutral';
                }
              } else if (operation === 'stake') {
                mappedType = 'stake';
                subType = 'debit';
              } else if (operation === 'unstake') {
                mappedType = 'unstake';
                subType = 'credit';
              }
            } else if (type === 'deposit') {
              mappedType = 'deposit';
              subType = 'credit';
            } else if (type === 'withdraw') {
              mappedType = 'withdraw';
              subType = 'debit';
            } else if (type === 'transfer') {
              // Para transferências diretas, determinar subType baseado nos endereços
              const userAddress = tx.user?.blockchainAddress?.toLowerCase();
              const fromAddress = tx.from_address?.toLowerCase();
              const toAddress = tx.to_address?.toLowerCase();

              if (userAddress && fromAddress && userAddress === fromAddress) {
                subType = 'debit'; // Usuário enviou
              } else if (userAddress && toAddress && userAddress === toAddress) {
                subType = 'credit'; // Usuário recebeu
              } else {
                subType = 'neutral';
              }
            }

            return { type: mappedType, subType };
          };

          // Calcular valor baseado em amount, net_amount e tipo
          const calculateAmount = (tx, subType) => {
            let amount = 0;
            
            // Função helper para converter valores decimais do Prisma
            const parseAmount = (value) => {
              if (!value && value !== 0) return 0;
              
              // Se for um número simples
              if (typeof value === 'number') {
                return isNaN(value) ? 0 : value;
              }
              
              // Se for string, tentar converter
              if (typeof value === 'string') {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? 0 : parsed;
              }
              
              // Se for objeto Decimal do Prisma {s, e, d}
              if (typeof value === 'object' && value !== null) {
                // Tentativa 1: toString()
                if (value.toString && typeof value.toString === 'function') {
                  try {
                    const str = value.toString();
                    const parsed = parseFloat(str);
                    if (!isNaN(parsed)) {
                      return parsed;
                    }
                  } catch (error) {
                    console.warn('Erro toString:', error);
                  }
                }
                
                // Tentativa 2: Estrutura Decimal.js {s, e, d}
                if (value.d && Array.isArray(value.d)) {
                  const { s = 1, e = 0, d } = value;
                  
                  if (d.length === 1) {
                    const digits = d[0].toString();
                    const numDigits = digits.length;
                    const result = (d[0] * s) * Math.pow(10, e - numDigits + 1);
                    return result;
                  }
                  
                  if (d.length >= 2) {
                    const allDigits = d.join('');
                    const totalDigits = allDigits.length;
                    const numValue = parseInt(allDigits);
                    const result = (numValue * s) * Math.pow(10, e - totalDigits + 1);
                    return result;
                  }
                }
              }
              
              return 0;
            };
            
            // Para depósitos, usar net_amount (valor líquido que o usuário recebe)
            if (tx.transactionType === 'deposit') {
              amount = parseAmount(tx.net_amount) || parseAmount(tx.amount) || 0;
              // Depósitos são sempre positivos
              return Math.abs(amount);
            }

            // Para saques, usar amount (valor bruto solicitado)
            if (tx.transactionType === 'withdraw') {
              amount = parseAmount(tx.amount) || parseAmount(tx.net_amount) || 0;
              // Saques são sempre negativos
              return -Math.abs(amount);
            }

            // Para resgates (unstake), sempre positivo
            if (tx.transactionType === 'unstake') {
              amount = parseAmount(tx.amount) || parseAmount(tx.net_amount) || 0;
              // Resgates são sempre positivos (usuário recebe de volta)
              return Math.abs(amount);
            }

            // Para investimentos (stake), sempre negativo
            if (tx.transactionType === 'stake' || tx.transactionType === 'investment') {
              amount = parseAmount(tx.amount) || parseAmount(tx.net_amount) || 0;
              // Investimentos são sempre negativos (usuário envia para contrato)
              return -Math.abs(amount);
            }
            
            // Para transferências, determinar sinal baseado em quem é o usuário
            if (tx.transactionType === 'transfer') {
              amount = parseAmount(tx.amount) || parseAmount(tx.net_amount) || 0;

              const userAddress = tx.user?.blockchainAddress?.toLowerCase();
              const fromAddress = tx.from_address?.toLowerCase();
              const toAddress = tx.to_address?.toLowerCase();

              if (userAddress && fromAddress && userAddress === fromAddress) {
                // Usuário enviou - negativo
                return -Math.abs(amount);
              } else if (userAddress && toAddress && userAddress === toAddress) {
                // Usuário recebeu - positivo
                return Math.abs(amount);
              }

              // Fallback baseado no subType
              return subType === 'debit' ? -Math.abs(amount) : Math.abs(amount);
            }

            // Para outros tipos, usar net_amount primeiro, depois amount
            amount = parseAmount(tx.net_amount) || parseAmount(tx.amount) || 0;

            // Aplicar sinal baseado no subtipo
            return subType === 'debit' ? -Math.abs(amount) : Math.abs(amount);
          };

          const tokenInfo = getTokenInfo(tx);
          const typeInfo = getTypeInfo(tx);
          const amount = calculateAmount(tx, typeInfo.subType);

          // console.log('✅ [DEBUG] Transação mapeada:', {
          //   id: tx.id,
          //   userName: tx.user?.name,
          //   type: typeInfo.type,
          //   subType: typeInfo.subType,
          //   amount: amount,
          //   userAddress: tx.user?.blockchainAddress,
          //   from: tx.from_address,
          //   to: tx.to_address
          // });

          return {
            id: tx.id.toString(),
            txHash: tx.txHash || tx.blockchain_tx_hash || '',
            type: typeInfo.type,
            subType: typeInfo.subType,
            amount: amount,
            tokenSymbol: tokenInfo.tokenSymbol,
            tokenName: tokenInfo.tokenName,
            status: tx.status,
            date: tx.createdAt,
            network: tx.network || 'testnet',
            company: tx.company || null,
            // Se não há relação user expandida, criar objeto básico
            user: tx.user ? {
              id: tx.user.id?.toString() || tx.userId?.toString() || 'unknown',
              name: tx.user.name || 'Usuário não encontrado',
              email: tx.user.email || '',
              blockchainAddress: tx.user.blockchainAddress || tx.user.publicKey || ''
            } : {
              id: tx.userId?.toString() || 'unknown',
              name: 'Usuário não encontrado',
              email: '',
              blockchainAddress: ''
            },
            fromAddress: tx.from_address || tx.fromAddress || '',
            toAddress: tx.to_address || tx.toAddress || '',
            fees: parseFloat(tx.fee) || 0,
            blockNumber: tx.blockNumber || tx.blockchain_block_number || null,
            contractAddress: tx.contractAddress || '',
            functionName: tx.functionName || '',
            metadata: tx.metadata || {}
          };
        });
        
        setTransactions(mappedTransactions);
      } else {
        throw new Error(response.data.message || t('transactions.messages.errorLoading'));
      }
    } catch (error) {
      console.error("🔴 Error loading company transactions:", error);
      setError(error.response?.data?.message || error.message);
      setTransactions([]); // Deixar vazio ao invés de usar mock data
      showError(t('transactions.messages.errorLoading') + ": " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken, showError, t]);

  // Verificar permissões e carregar transações
  useEffect(() => {
    if (!permissions.canViewCompanySettings) {
      router.push("/dashboard");
      return;
    }
    loadTransactions();
  }, [permissions.canViewCompanySettings, router, loadTransactions]);

  // Carregar tokens disponíveis quando o componente montar
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadAvailableTokens();
    }
  }, [isAuthenticated, accessToken, loadAvailableTokens]);

  // Mapeamento dos tipos de transação
  const transactionTypeTranslation = {
    transfer: t('transactions.types.transfer'),
    deposit: t('transactions.types.deposit'),
    withdraw: t('transactions.types.withdraw'),
    stake: t('transactions.types.stake'),
    unstake: t('transactions.types.unstake'),
    exchange: t('transactions.types.exchange'),
    stake_reward: t('transactions.types.stake_reward'),
    contract_deploy: t('transactions.types.contract_deploy'),
    contract_call: t('transactions.types.contract_call'),
    contract_read: t('transactions.types.contract_read')
  };

  // Função para obter logo do token
  const getTokenLogo = (symbol) => {
    return `/assets/images/currencies/${symbol}.png`;
  };

  // Aplicar filtros
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro por token (busca por nome ou símbolo)
    if (tokenFilter && tokenFilter.trim()) {
      const search = tokenFilter.toLowerCase().trim();
      filtered = filtered.filter(tx => 
        tx.tokenSymbol?.toLowerCase().includes(search) ||
        tx.tokenName?.toLowerCase().includes(search)
      );
    }

    // Filtro por tipo (Select)
    if (typeFilter) {
      filtered = filtered.filter(tx => tx.type === typeFilter.value);
    }

    // Filtro por status (Select) 
    if (statusFilter) {
      filtered = filtered.filter(tx => tx.status === statusFilter.value);
    }

    // Filtro por usuário (busca por nome ou email)
    if (userFilter && userFilter.trim()) {
      const search = userFilter.toLowerCase().trim();
      filtered = filtered.filter(tx => 
        tx.user?.name?.toLowerCase().includes(search) ||
        tx.user?.email?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [transactions, tokenFilter, typeFilter, statusFilter, userFilter]);

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Navegação de páginas
  const goToPage = (page) => setCurrentPage(page);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  // Função para obter URL da blockchain
  const getBlockchainUrl = (txHash) => {
    const network = defaultNetwork || 'mainnet';
    const baseUrl = network === 'mainnet' 
      ? 'https://azorescan.com/tx/' 
      : 'https://floripa.azorescan.com/tx/';
    return `${baseUrl}${txHash}`;
  };

  // Função para truncar hash
  const truncateHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  // Função para obter cor do tipo de transação
  const getTransactionColor = (type, subType, transaction) => {
    // Investimentos (stake) sempre são negativos e vermelhos
    if (type === 'stake' || type === 'investment') {
      return 'text-red-500';
    }

    // Resgates (unstake) sempre são positivos e verdes
    if (type === 'unstake') {
      return 'text-green-500';
    }

    // Para transferências, verificar se o usuário é remetente ou destinatário
    if (type === 'transfer') {
      // Comparar endereços em lowercase para evitar problemas de case sensitivity
      const userAddress = transaction.user?.blockchainAddress?.toLowerCase();
      const fromAddress = transaction.fromAddress?.toLowerCase();
      const toAddress = transaction.toAddress?.toLowerCase();

      if (fromAddress && userAddress && fromAddress === userAddress) {
        return 'text-red-500'; // Usuário é o remetente (enviou)
      }
      if (toAddress && userAddress && toAddress === userAddress) {
        return 'text-green-500'; // Usuário é o destinatário (recebeu)
      }

      // Fallback para subType se não conseguir determinar pelos endereços
      return subType === 'debit' ? 'text-red-500' : 'text-green-500';
    }

    // Para outros tipos, usar lógica padrão
    return subType === 'credit' ? 'text-green-500' : 'text-red-500';
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const statusColors = {
      confirmed: 'text-green-500 bg-green-100 dark:bg-green-500/20',
      pending: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20',
      failed: 'text-red-500 bg-red-100 dark:bg-red-500/20',
      cancelled: 'text-gray-500 bg-gray-100 dark:bg-gray-500/20'
    };
    return statusColors[status] || 'text-gray-500 bg-gray-100 dark:bg-gray-500/20';
  };

  // Função para obter ícone do tipo de transação
  const getTransactionIcon = (type) => {
    const iconMap = {
      transfer: "heroicons:arrow-right-circle",
      exchange: "heroicons:arrow-path", 
      deposit: "heroicons:arrow-down-circle",
      withdraw: "heroicons:arrow-up-circle",
      stake: "heroicons:lock-closed",
      unstake: "heroicons:lock-open",
      stake_reward: "heroicons:gift"
    };
    return iconMap[type] || "heroicons:document";
  };

  // Estilos para react-select
  const selectStyles = {
    option: (provided) => ({
      ...provided,
      fontSize: "14px",
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      fontSize: "14px",
    }),
  };

  // Limpar filtros
  const clearFilters = () => {
    setTokenFilter("");
    setTypeFilter(null);
    setStatusFilter(null);
    setUserFilter("");
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tokenFilter, typeFilter, statusFilter, userFilter, itemsPerPage]);

  // Handle items per page change
  const handleItemsPerPageChange = (option) => {
    setItemsPerPage(option.value);
    setCurrentPage(1);
  };

  // Export function
  const exportTransactions = () => {
    const csvData = filteredTransactions.map(tx => ({
      Hash: tx.txHash,
      Tipo: transactionTypeTranslation[tx.type] || tx.type,
      'Valor': tx.amount,
      Token: tx.tokenSymbol,
      Status: statusOptions.find(s => s.value === tx.status)?.label || tx.status,
      Usuário: tx.user?.name || 'N/A',
      Email: tx.user?.email || 'N/A',
      'Data': new Date(tx.date).toLocaleString('pt-BR')
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes-empresa-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!permissions.canViewCompanySettings) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('transactions.title')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('transactions.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            text={t('transactions.actions.export')}
            icon="heroicons:arrow-down-tray"
            className="btn-outline-primary"
            onClick={exportTransactions}
          />
          <Button
            text={t('transactions.actions.refresh')}
            icon="heroicons:arrow-path-solid"
            onClick={() => loadTransactions()}
            disabled={loading}
          />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('transactions.filters.token')}
            </label>
            <Textinput
              type="text"
              placeholder={t('transactions.filters.tokenPlaceholder')}
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value)}
              className="h-[38px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('transactions.filters.type')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={typeOptions}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder={t('transactions.filters.typePlaceholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('transactions.filters.status')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={t('transactions.filters.statusPlaceholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('transactions.filters.user')}
            </label>
            <Textinput
              type="text"
              placeholder={t('transactions.filters.userPlaceholder')}
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="h-[38px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('transactions.filters.itemsPerPage')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={itemsPerPageOptions}
              value={itemsPerPageOptions.find(option => option.value === itemsPerPage)}
              onChange={handleItemsPerPageChange}
              styles={selectStyles}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              text={t('transactions.filters.clear')}
              icon="heroicons:x-mark"
              className="btn-outline-secondary flex-1"
              onClick={clearFilters}
            />
          </div>
        </div>

        {/* Resumo dos filtros */}
        {(tokenFilter || typeFilter || statusFilter || userFilter) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('transactions.filters.activeFilters')}</span>
              {tokenFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('transactions.filters.token')}: {tokenFilter}
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('transactions.filters.type')}: {typeFilter.label}
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('transactions.filters.status')}: {statusFilter.label}
                </span>
              )}
              {userFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('transactions.filters.user')}: {userFilter}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Tabela de Transações */}
      <Card>
        <div className="space-y-4">
          {/* Cabeçalho da tabela com contador */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('transactions.table.title')} ({loading ? '...' : filteredTransactions.length})
            </h3>
          </div>

          {/* Loading/Error States */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-slate-600 dark:text-slate-400">{t('transactions.messages.loading')}</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center py-8">
              <Icon icon="heroicons-outline:exclamation-triangle" className="w-12 h-12 mb-2 text-red-500" />
              <span className="font-medium text-red-600 dark:text-red-400">{t('transactions.messages.errorLoading')}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{error}</span>
            </div>
          )}

          {/* Tabela responsiva */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.user')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.token')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.txHash')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.type')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.amount')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      {/* User */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {transaction.user?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {transaction.user?.email || ''}
                          </div>
                        </div>
                      </td>
                      
                      {/* Token - Logo, Symbol, Name */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-none">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                src={getTokenLogo(transaction.tokenSymbol)}
                                alt={transaction.tokenSymbol}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center hidden">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  {transaction.tokenSymbol?.slice(0, 2) || 'NA'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {transaction.tokenSymbol}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {transaction.tokenName}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* TxHash truncated com link */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a
                          href={getBlockchainUrl(transaction.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-primary-500 hover:text-primary-600 hover:underline transition-colors"
                        >
                          {truncateHash(transaction.txHash)}
                        </a>
                      </td>
                      
                      {/* Tipo com ícone */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Icon 
                            icon={getTransactionIcon(transaction.type)} 
                            className="w-4 h-4 text-slate-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {transactionTypeTranslation[transaction.type] || transaction.type}
                          </span>
                        </div>
                      </td>
                      
                      {/* Valor com cor */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getTransactionColor(transaction.type, transaction.subType, transaction)}`}>
                          {(() => {
                            // Investimentos (stake) sempre negativos
                            if (transaction.type === 'stake' || transaction.type === 'investment') {
                              return `-${Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
                            }

                            // Resgates (unstake) sempre positivos
                            if (transaction.type === 'unstake') {
                              return `+${Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
                            }

                            // Para transferências, verificar direção baseada nos endereços
                            if (transaction.type === 'transfer') {
                              // Comparar endereços em lowercase para evitar problemas de case sensitivity
                              const userAddress = transaction.user?.blockchainAddress?.toLowerCase();
                              const fromAddress = transaction.fromAddress?.toLowerCase();
                              const toAddress = transaction.toAddress?.toLowerCase();

                              if (fromAddress && userAddress && fromAddress === userAddress) {
                                // Usuário enviou - sempre negativo
                                return `-${Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
                              }
                              if (toAddress && userAddress && toAddress === userAddress) {
                                // Usuário recebeu - sempre positivo
                                return `+${Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
                              }
                            }

                            // Para outros tipos, mostrar sinal baseado no valor
                            return `${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
                          })()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {statusOptions.find(s => s.value === transaction.status)?.label || transaction.status}
                        </span>
                      </td>
                      
                      {/* Data */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        <div>
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center">
                        <Icon icon="heroicons-outline:document-text" className="w-12 h-12 mb-2 opacity-50" />
                        <span className="font-medium">{t('transactions.messages.noTransactions')}</span>
                        <span className="text-sm">{t('transactions.messages.adjustFilters')}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

          {/* Pagination */}
          {!loading && filteredTransactions.length > itemsPerPage && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                  {t('transactions.pagination.showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('transactions.pagination.to')} {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} {t('transactions.pagination.of')} {filteredTransactions.length} {t('transactions.pagination.records')}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="heroicons-outline:chevron-double-left" />
                  </button>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="heroicons-outline:chevron-left" />
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          currentPage === page
                            ? "bg-primary-500 text-white"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="heroicons-outline:chevron-right" />
                  </button>
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="heroicons-outline:chevron-double-right" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CompanyTransactionsPage;
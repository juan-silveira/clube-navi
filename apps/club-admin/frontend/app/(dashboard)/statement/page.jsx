"use client";
import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import Select from "react-select";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import useCacheData from "@/hooks/useCacheData";
import useTransactions from "@/hooks/useTransactions";
import useTransactionFilters from "@/hooks/useTransactionFilters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import useConfig from "@/hooks/useConfig";
import useAuthStore from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";

const StatementPage = () => {
  const { t } = useTranslation('statement');
  // Hook para gerenciar título da aba com contagem de notificações
  useDocumentTitle(t('pageTitle'), 'Clube Digital', true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [tokenFilter, setTokenFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const { balances } = useCacheData();
  const { defaultNetwork } = useConfig();
  const { user } = useAuthStore();
  
  // Hook para buscar opções de filtro
  const { tokenOptions, typeOptions, statusOptions } = useTransactionFilters();

  // Memoizar parâmetros - se há filtro de token, buscar todos os dados
  const transactionParams = useMemo(() => ({
    page: tokenFilter ? 1 : currentPage, // Se há filtro de token, sempre página 1
    limit: tokenFilter ? 1000 : itemsPerPage, // Se há filtro de token, buscar muito mais dados
    status: statusFilter?.value && statusFilter.value !== "" ? statusFilter.value : undefined,
    network: balances?.network || defaultNetwork,
    transactionType: typeFilter?.value && typeFilter.value !== "" ? typeFilter.value : undefined
    // Não enviar tokenSymbol para o backend - faremos filtro local
  }), [tokenFilter ? 1 : currentPage, tokenFilter ? 1000 : itemsPerPage, statusFilter?.value, balances?.network, typeFilter?.value, tokenFilter?.value]);

  // Buscar transações reais do banco de dados
  const { 
    transactions: realTransactions, 
    loading: transactionsLoading, 
    error: transactionsError,
    pagination: transactionsPagination,
    updatePagination 
  } = useTransactions(transactionParams);

  // Função para obter logo do token
  const getTokenLogo = (symbol) => {
    return `/assets/images/currencies/${symbol}.png`;
  };

  // Função para obter label do tipo de transação considerando functionName
  const getTransactionLabel = (transaction) => {
    // Se for exchange, verificar functionName
    if (transaction.type === 'exchange') {
      if (transaction.functionName === 'sell') {
        return t('transactionTypes.sell');
      } else if (transaction.functionName === 'buy') {
        return t('transactionTypes.buy');
      } else if (transaction.functionName === 'cancel') {
        return t('transactionTypes.cancel');
      }
      // Fallback para "Troca" se não tiver functionName
      return t('transactionTypes.exchange');
    }

    // Para outros tipos, usar o mapeamento padrão com traduções
    return t(`transactionTypes.${transaction.type}`) || transaction.type;
  };

  // Usar transações reais do banco de dados
  const allTransactions = realTransactions || [];

  // Debug: verificar se há orderDetails nas transações
  useEffect(() => {
    if (allTransactions.length > 0) {
      console.log('🔍 Verificando transações:', allTransactions.slice(0, 3));
      const hasOrderDetails = allTransactions.some(t => t.metadata?.orderDetails);
      console.log('📋 Tem orderDetails?', hasOrderDetails);
      if (hasOrderDetails) {
        const txWithDetails = allTransactions.find(t => t.metadata?.orderDetails);
        console.log('📋 Exemplo de transação com orderDetails:', txWithDetails);
      }
    }
  }, [allTransactions]);

  // WORKAROUND: Aplicar filtro de token no frontend temporariamente
  // até corrigirmos o problema no backend
  const filteredTransactions = useMemo(() => {
    if (!tokenFilter || !tokenFilter.value) return allTransactions;
    return allTransactions.filter(transaction => {
      return transaction.tokenSymbol === tokenFilter.value;
    });
  }, [allTransactions, tokenFilter]);

  // Usar paginação ajustada para filtros locais
  const totalPages = tokenFilter ? 
    Math.ceil(filteredTransactions.length / itemsPerPage) : 
    transactionsPagination.totalPages || 0;
  
  const currentTransactions = tokenFilter ? 
    filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) :
    allTransactions;


  const itemsPerPageOptions = [
    { value: 10, label: t('itemsPerPage.10') },
    { value: 20, label: t('itemsPerPage.20') },
    { value: 50, label: t('itemsPerPage.50') },
    { value: 100, label: t('itemsPerPage.100') }
  ];

  // Navegação de páginas 
  const goToPage = (page) => {
    setCurrentPage(page);
    // Só atualizar backend se não houver filtro de token (que é local)
    if (!tokenFilter) {
      updatePagination({ 
        page, 
        limit: itemsPerPage,
        status: statusFilter?.value && statusFilter.value !== "" ? statusFilter.value : undefined,
        transactionType: typeFilter?.value && typeFilter.value !== "" ? typeFilter.value : undefined
      });
    }
  };

  const goToPreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    if (!tokenFilter) {
      updatePagination({ 
        page: newPage, 
        limit: itemsPerPage,
        status: statusFilter?.value && statusFilter.value !== "" ? statusFilter.value : undefined,
        transactionType: typeFilter?.value && typeFilter.value !== "" ? typeFilter.value : undefined
      });
    }
  };

  const goToNextPage = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    setCurrentPage(newPage);
    if (!tokenFilter) {
      updatePagination({ 
        page: newPage, 
        limit: itemsPerPage,
        status: statusFilter?.value && statusFilter.value !== "" ? statusFilter.value : undefined,
        transactionType: typeFilter?.value && typeFilter.value !== "" ? typeFilter.value : undefined
      });
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
    if (!tokenFilter) {
      updatePagination({ 
        page: 1, 
        limit: itemsPerPage,
        status: statusFilter?.value && statusFilter.value !== "" ? statusFilter.value : undefined,
        transactionType: typeFilter?.value && typeFilter.value !== "" ? typeFilter.value : undefined
      });
    }
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
    if (!tokenFilter) {
      updatePagination({ 
        page: totalPages, 
        limit: itemsPerPage,
        status: statusFilter?.value && statusFilter.value !== "" ? statusFilter.value : undefined,
        transactionType: typeFilter?.value && typeFilter.value !== "" ? typeFilter.value : undefined
      });
    }
  };

  // Função para obter URL da blockchain baseada na rede
  const getBlockchainUrl = (txHash) => {
    const network = balances?.network || defaultNetwork;
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

  // Função para obter cor do tipo de transação baseada no endereço do usuário
  const getTransactionColor = (type, subType, fromAddress, toAddress) => {
    const userAddress = user?.publicKey?.toLowerCase();

    // Investimentos sempre são negativos e vermelhos
    if (type === 'stake' || type === 'investment') {
      return 'text-red-500';
    }

    // Para transferências, verificar se o usuário é remetente ou destinatário
    if (type === 'transfer') {
      // Se o usuário é o remetente (fromAddress), é uma saída (vermelho)
      if (fromAddress && userAddress && fromAddress.toLowerCase() === userAddress) {
        return 'text-red-500';
      }
      // Se o usuário é o destinatário (toAddress), é uma entrada (verde)
      if (toAddress && userAddress && toAddress.toLowerCase() === userAddress) {
        return 'text-green-500';
      }
    }

    // Para outros tipos, usar a lógica anterior
    // Saídas (vermelho): saques, débitos
    if (type === 'withdraw' || subType === 'debit') {
      return 'text-red-500';
    }
    // Entradas (verde): depósitos, dividendos, créditos
    return 'text-green-500';
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
    option: (provided, state) => ({
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
    setTokenFilter(null);
    setTypeFilter(null);
    setStatusFilter(null);
    setCurrentPage(1);
  };

  // Reset pagination when filters change (apenas para filtros backend)
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, tokenFilter, itemsPerPage]);

  // Handle items per page change
  const handleItemsPerPageChange = (option) => {
    setItemsPerPage(option.value);
    setCurrentPage(1);
    if (!tokenFilter) {
      updatePagination({ 
        page: 1, 
        limit: option.value,
        status: statusFilter?.value && statusFilter.value !== "" ? statusFilter.value : undefined,
        transactionType: typeFilter?.value && typeFilter.value !== "" ? typeFilter.value : undefined
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('header.title')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('header.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            text={t('header.exportButton')}
            icon="heroicons:arrow-down-tray"
            className="btn-outline-primary"
            onClick={() => {
              // TODO: Implementar exportação
              console.log('Exportar transações filtradas:', filteredTransactions);
            }}
          />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.token')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={tokenOptions}
              value={tokenFilter}
              onChange={setTokenFilter}
              placeholder={t('filters.tokenPlaceholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.transactionType')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={typeOptions}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder={t('filters.typePlaceholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.status')}
            </label>
            <Select
              className="react-select"
              classNamePrefix="select"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={t('filters.statusPlaceholder')}
              styles={selectStyles}
              isClearable
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('filters.itemsPerPage')}
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
              text={t('filters.clearButton')}
              icon="heroicons:x-mark"
              className="btn-outline-secondary flex-1"
              onClick={clearFilters}
            />
          </div>
        </div>

        {/* Resumo dos filtros */}
        {(tokenFilter || typeFilter || statusFilter) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('filters.activeFilters')}</span>
              {tokenFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.tokenLabel')} {tokenFilter.label}
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.typeLabel')} {typeFilter.label}
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300">
                  {t('filters.statusLabel')} {statusFilter.label}
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
              {t('table.title')} ({transactionsLoading ? '...' : (tokenFilter ? filteredTransactions.length : (transactionsPagination.total || 0))})
            </h3>
          </div>

          {/* Loading/Error States */}
          {transactionsLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-slate-600 dark:text-slate-400">{t('loading')}</span>
            </div>
          )}

          {transactionsError && !transactionsLoading && (
            <div className="flex flex-col items-center py-8">
              <Icon icon="heroicons-outline:exclamation-triangle" className="w-12 h-12 mb-2 text-red-500" />
              <span className="font-medium text-red-600 dark:text-red-400">{t('error')}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{transactionsError}</span>
            </div>
          )}

          {/* Tabela responsiva */}
          {!transactionsLoading && !transactionsError && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('table.company')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('table.token')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('table.txHash')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('table.type')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('table.amount')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('table.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('table.date')}
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
                      {/* Company */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {transaction.company?.name || 'N/A'}
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
                                  {transaction.tokenSymbol.slice(0, 2)}
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
                        {(transaction.txHash || transaction.blockchain_tx_hash) ? (
                          <a
                            href={getBlockchainUrl(transaction.txHash || transaction.blockchain_tx_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-primary-500 hover:text-primary-600 hover:underline transition-colors"
                          >
                            {truncateHash(transaction.txHash || transaction.blockchain_tx_hash)}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      
                      {/* Tipo com ícone e tooltip para ordens */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {transaction.metadata?.orderDetails ? (
                          <Tooltip
                            content={
                              <div className="space-y-1 text-xs">
                                <div className="font-semibold border-b border-slate-300 dark:border-slate-600 pb-1 mb-2">
                                  {t('orderDetails.title')}
                                </div>

                                {/* Barra de Progresso */}
                                {(() => {
                                  const amount = Number(transaction.metadata.orderDetails.amount) || 0;
                                  const filled = Number(transaction.metadata.orderDetails.filledAmount) || 0;
                                  const percentage = amount > 0 ? (filled / amount) * 100 : 0;

                                  return (
                                    <div className="mb-2">
                                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                        <span>{t('orderDetails.progress')}</span>
                                        <span>{percentage.toFixed(1)}%</span>
                                      </div>
                                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div
                                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                                          style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                      </div>
                                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span>{filled.toFixed(2)} {t('orderDetails.executed')}</span>
                                        <span>{amount.toFixed(2)} {t('orderDetails.total')}</span>
                                      </div>
                                    </div>
                                  );
                                })()}

                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.id')}</span>
                                  <span className="font-medium">#{transaction.metadata.orderDetails.orderId || '-'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.pair')}</span>
                                  <span className="font-medium">{transaction.metadata.orderDetails.tokenPair || '-'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.operation')}</span>
                                  <span className="font-medium">{transaction.metadata.orderDetails.orderType || '-'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.type')}</span>
                                  <span className="font-medium">{transaction.metadata.orderDetails.orderSide || '-'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.price')}</span>
                                  <span className="font-medium">
                                    {transaction.metadata.orderDetails.price && transaction.metadata.orderDetails.price !== '-'
                                      ? Number(transaction.metadata.orderDetails.price).toFixed(4)
                                      : '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.amount')}</span>
                                  <span className="font-medium">
                                    {transaction.metadata.orderDetails.amount && transaction.metadata.orderDetails.amount !== '-'
                                      ? Number(transaction.metadata.orderDetails.amount).toFixed(2)
                                      : '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.filled')}</span>
                                  <span className="font-medium">
                                    {transaction.metadata.orderDetails.filledAmount !== undefined && transaction.metadata.orderDetails.filledAmount !== null
                                      ? Number(transaction.metadata.orderDetails.filledAmount).toFixed(2)
                                      : '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.remaining')}</span>
                                  <span className="font-medium">
                                    {transaction.metadata.orderDetails.remainingAmount !== undefined && transaction.metadata.orderDetails.remainingAmount !== null && transaction.metadata.orderDetails.remainingAmount !== '-'
                                      ? Number(transaction.metadata.orderDetails.remainingAmount).toFixed(2)
                                      : '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.orderStatus')}</span>
                                  <span className="font-medium">{transaction.metadata.orderDetails.orderStatus || '-'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">{t('orderDetails.txHash')}</span>
                                  <span className="font-medium font-mono text-[10px]">
                                    {transaction.metadata.orderDetails.txHash
                                      ? `${transaction.metadata.orderDetails.txHash.slice(0, 10)}...`
                                      : '-'}
                                  </span>
                                </div>
                              </div>
                            }
                            placement="top"
                            arrow
                          >
                            <div className="flex items-center space-x-2 cursor-help">
                              <Icon
                                icon={getTransactionIcon(transaction.type)}
                                className="w-4 h-4 text-slate-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {getTransactionLabel(transaction)}
                              </span>
                              <Icon
                                icon="heroicons:information-circle"
                                className="w-4 h-4 text-blue-500"
                              />
                            </div>
                          </Tooltip>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Icon
                              icon={getTransactionIcon(transaction.type)}
                              className="w-4 h-4 text-slate-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {getTransactionLabel(transaction)}
                            </span>
                          </div>
                        )}
                      </td>
                      
                      {/* Valor com cor */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getTransactionColor(transaction.type, transaction.subType, transaction.fromAddress, transaction.toAddress)}`}>
                          {(() => {
                            const amount = Number(transaction.amount) || 0;
                            const absAmount = Math.abs(amount);
                            if (isNaN(absAmount)) return '0';

                            const userAddress = user?.publicKey?.toLowerCase();
                            let prefix = '+';

                            // Investimentos sempre são negativos
                            if (transaction.type === 'stake' || transaction.type === 'investment') {
                              prefix = '-';
                            }
                            // Para transferências, determinar o prefixo baseado no endereço
                            else if (transaction.type === 'transfer') {
                              if (transaction.fromAddress && userAddress && transaction.fromAddress.toLowerCase() === userAddress) {
                                prefix = '-'; // Usuário é o remetente
                              } else if (transaction.toAddress && userAddress && transaction.toAddress.toLowerCase() === userAddress) {
                                prefix = '+'; // Usuário é o destinatário
                              }
                            }
                            // Para outros tipos, usar a lógica anterior
                            else if (transaction.type === 'withdraw' || transaction.subType === 'debit') {
                              prefix = '-';
                            }

                            return `${prefix}${absAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
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
                        <span className="font-medium">{t('table.noTransactions')}</span>
                        <span className="text-sm">{t('table.adjustFilters')}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

          {/* Pagination */}
          {!transactionsLoading && !transactionsError && (
            (tokenFilter && filteredTransactions.length > itemsPerPage) || 
            (!tokenFilter && (transactionsPagination.total || 0) > itemsPerPage)
          ) && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                  {tokenFilter ? (
                    `${t('pagination.showing')} ${((currentPage - 1) * itemsPerPage) + 1} ${t('pagination.to')} ${Math.min(currentPage * itemsPerPage, filteredTransactions.length)} ${t('pagination.of')} ${filteredTransactions.length} ${t('pagination.records')}`
                  ) : (
                    `${t('pagination.showing')} ${((currentPage - 1) * itemsPerPage) + 1} ${t('pagination.to')} ${Math.min(currentPage * itemsPerPage, transactionsPagination.total || 0)} ${t('pagination.of')} ${transactionsPagination.total || 0} ${t('pagination.records')}`
                  )}
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                  ))}
                  
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

export default StatementPage;
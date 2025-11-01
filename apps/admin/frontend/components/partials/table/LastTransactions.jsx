"use client";
import React, { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import Card from "@/components/ui/Card";
import Tooltip from "@/components/ui/Tooltip";
import useCacheData from "@/hooks/useCacheData";
import useTransactions from "@/hooks/useTransactions";
import useConfig from "@/hooks/useConfig";
import useAuthStore from "@/store/authStore";
import { BalanceDisplay } from "@/utils/balanceUtils";
import { useTranslation } from "@/hooks/useTranslation";

const LastTransactions = () => {
  const { t } = useTranslation('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { balances } = useCacheData();
  const { defaultNetwork } = useConfig();
  const { user } = useAuthStore();
  
  // Memoizar parâmetros para evitar recriação do objeto
  const transactionParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    network: balances?.network || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || defaultNetwork
  }), [currentPage, itemsPerPage, balances?.network, defaultNetwork]);
  
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

  // Usar transações reais do banco de dados
  const transactions = realTransactions || [];

  // Paginação usando dados reais
  const totalPages = transactionsPagination.totalPages || 0;
  const currentTransactions = transactions;

  const goToPage = (page) => {
    setCurrentPage(page);
    updatePagination({ page, limit: itemsPerPage });
  };

  const goToPreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    updatePagination({ page: newPage, limit: itemsPerPage });
  };

  const goToNextPage = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    setCurrentPage(newPage);
    updatePagination({ page: newPage, limit: itemsPerPage });
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
    updatePagination({ page: 1, limit: itemsPerPage });
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
    updatePagination({ page: totalPages, limit: itemsPerPage });
  };

  // Função para obter URL da blockchain baseada na rede
  const getBlockchainUrl = (txHash) => {
    const network = balances?.network || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || defaultNetwork;

    const baseUrl = network === 'mainnet' 
      ? `https://azorescan.com/tx/` 
      : `https://floripa.azorescan.com/tx/`;
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

  // Mapeamento dos tipos de transação usando traduções
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

  // Função para obter ícone do status
  const getStatusIcon = (status) => {
    const iconMap = {
      pending: "heroicons:clock",
      confirmed: "heroicons:check-circle",
      failed: "heroicons:x-circle",
      cancelled: "heroicons:minus-circle"
    };
    return iconMap[status] || "heroicons:question-mark-circle";
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "text-yellow-500",
      confirmed: "text-green-500",
      failed: "text-red-500",
      cancelled: "text-gray-500"
    };
    return colorMap[status] || "text-gray-500";
  };

  // Função para obter nome traduzido do status
  const getStatusName = (status) => {
    const nameMap = {
      pending: t('transactions.status.pending'),
      confirmed: t('transactions.status.confirmed'),
      failed: t('transactions.status.failed'),
      cancelled: t('transactions.status.cancelled')
    };
    return nameMap[status] || status;
  };

  // Função para obter label do tipo de transação considerando functionName
  const getTransactionLabel = (transaction) => {
    // Se for exchange, verificar functionName
    if (transaction.type === 'exchange') {
      if (transaction.functionName === 'sell') {
        return t('transactions.types.sell');
      } else if (transaction.functionName === 'buy') {
        return t('transactions.types.buy');
      } else if (transaction.functionName === 'cancel') {
        return t('transactions.types.cancel');
      }
      // Fallback para "Troca" se não tiver functionName
      return t('transactions.types.exchange');
    }

    // Para outros tipos, usar o mapeamento padrão
    return transactionTypeTranslation[transaction.type] || transaction.type;
  };

  return (
    <Card
      title={t('transactions.title')}
      subtitle={t('transactions.subtitle')}
      headerslot={
        <div className="flex items-center space-x-2">
          {/* <Button> */}
            <Icon icon="heroicons-outline:arrow-down-circle" />
          {/* </Button> */}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Loading/Error States */}
        {transactionsLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-slate-600 dark:text-slate-400">{t('transactions.loading')}</span>
          </div>
        )}

        {transactionsError && !transactionsLoading && (
          <div className="flex flex-col items-center py-8">
            <Icon icon="heroicons-outline:exclamation-triangle" className="w-12 h-12 mb-2 text-red-500" />
            <span className="font-medium text-red-600 dark:text-red-400">{t('transactions.error')}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{transactionsError}</span>
          </div>
        )}

        {/* Tabela */}
        {!transactionsLoading && !transactionsError && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.company')}
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
                    {t('transactions.table.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('transactions.table.value')}
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
                  {/* Empresa */}
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
                              // Fallback para placeholder se imagem não carregar
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
                  
                  {/* Tipo com ícone */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Icon
                        icon={getTransactionIcon(transaction.type)}
                        className="w-4 h-4 text-slate-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {getTransactionLabel(transaction)}
                      </span>
                    </div>
                  </td>

                  {/* Status com ícone e tooltip */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Tooltip content={getStatusName(transaction.status)} placement="top">
                      <div className="flex items-center justify-center w-6 h-6">
                        <Icon
                          icon={getStatusIcon(transaction.status)}
                          className={`w-5 h-5 ${getStatusColor(transaction.status)}`}
                        />
                      </div>
                    </Tooltip>
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

                        return (
                          <span>
                            {prefix}<BalanceDisplay value={absAmount.toString()} showSymbol={false} />
                          </span>
                        );
                      })()}
                    </span>
                  </td>
                  
                  {/* Data */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center">
                    <Icon icon="heroicons-outline:document-text" className="w-12 h-12 mb-2 opacity-50" />
                    <span className="font-medium">{t('transactions.noResults')}</span>
                    <span className="text-sm">{t('transactions.noResultsMessage')}</span>
                  </div>
                </td>
              </tr>
            )}
              </tbody>
            </table>
          </div>
        )}

      {/* Pagination */}
      {!transactionsLoading && !transactionsError && (transactionsPagination.total || 0) > itemsPerPage && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
              {t('transactions.pagination.showing', {
                from: ((currentPage - 1) * itemsPerPage) + 1,
                to: Math.min(currentPage * itemsPerPage, transactionsPagination.total || 0),
                total: transactionsPagination.total || 0
              })}
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
              
              {/* Page Numbers with smart ellipsis */}
              {(() => {
                const getVisiblePages = () => {
                  const delta = 1; // Show 1 page before and after current page
                  const left = Math.max(1, currentPage - delta);
                  const right = Math.min(totalPages, currentPage + delta);
                  const pages = [];

                  // Always show first page
                  if (left > 1) {
                    pages.push(1);
                    if (left > 2) {
                      pages.push('...');
                    }
                  }

                  // Show pages around current page
                  for (let i = left; i <= right; i++) {
                    pages.push(i);
                  }

                  // Always show last page
                  if (right < totalPages) {
                    if (right < totalPages - 1) {
                      pages.push('...');
                    }
                    pages.push(totalPages);
                  }

                  return pages;
                };

                return getVisiblePages().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span 
                        key={`ellipsis-${index}`}
                        className="px-3 py-1 text-slate-500"
                      >
                        ...
                      </span>
                    );
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
                });
              })()}
              
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
  );
};

export default LastTransactions;
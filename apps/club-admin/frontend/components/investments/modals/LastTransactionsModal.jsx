"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import api from '@/services/api';
import { getExplorerTxUrl } from '@/utils/explorerUtils';
import useDarkmode from '@/hooks/useDarkMode';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Modal que exibe as últimas transações (stakes) de um contrato
 */
const LastTransactionsModal = ({ isOpen, onClose, contractAddress, network, productCode }) => {
  const { t } = useTranslation('investments');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark] = useDarkmode();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen && contractAddress) {
      setCurrentPage(1);
      loadTransactions();
    }
  }, [isOpen, contractAddress]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [LastTransactionsModal] Buscando transações para:', contractAddress);

      if (!contractAddress) {
        console.error('❌ [LastTransactionsModal] contractAddress não definido');
        setError(t('transactionsModal.errorContractAddress'));
        setLoading(false);
        return;
      }

      const response = await api.get(`/api/stake-contracts/${contractAddress}/transactions`, {
        params: {
          network: network?.toLowerCase() || 'bsctest',
          limit: 100
        }
      });

      console.log('✅ [LastTransactionsModal] Resposta recebida:', response.data);
      console.log('📊 [LastTransactionsModal] Total de transações:', response.data.data?.length || 0);
      console.log('📋 [LastTransactionsModal] Lista completa de transações:', response.data.data);

      // Log detalhado de cada transação
      response.data.data?.forEach((tx, index) => {
        console.log(`[TX ${index}] symbol:`, tx.symbol, '| amount:', tx.amount, '| full tx:', tx);
      });

      if (response.data.success) {
        const txList = response.data.data || [];
        console.log('💾 [LastTransactionsModal] Salvando no state:', txList);
        setTransactions(txList);
      } else {
        setError(t('transactionsModal.errorTitle'));
      }
    } catch (err) {
      console.error('❌ [LastTransactionsModal] Erro ao buscar transações:', err);
      setError(t('transactionsModal.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '0,00';
    const numAmount = parseFloat(amount);
    const value = numAmount > 1000 ? numAmount / 10**18 : numAmount;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: value % 1 === 0 ? 0 : 6
    }).format(value);
  };

  const truncateHash = (hash) => {
    if (!hash) return '--';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  // Paginação
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => setCurrentPage(page);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title={productCode ? t('transactionsModal.title', { productCode }) : t('transactionsModal.titleFallback')}
      className="max-w-6xl"
      centered
      scrollContent
      footerContent={
        <Button
          text={t('transactionsModal.closeButton')}
          className="btn-dark"
          onClick={onClose}
        />
      }
    >
      <div className="-mx-6 -my-8">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className={`ml-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('transactionsModal.loading')}</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12">
            <Icon icon="heroicons-outline:exclamation-triangle" className="w-12 h-12 mb-2 text-red-500 mx-auto" />
            <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            <Button
              text={t('transactionsModal.retryButton')}
              className="btn-primary"
              onClick={loadTransactions}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              {t('transactionsModal.emptyState')}
            </p>
          </div>
        )}

        {/* Tabela */}
        {!loading && !error && transactions.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={isDark ? 'bg-slate-800' : 'bg-slate-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('transactionsModal.table.headers.investment')}
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('transactionsModal.table.headers.date')}
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('transactionsModal.table.headers.hash')}
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('transactionsModal.table.headers.value')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'bg-slate-900 divide-slate-700' : 'bg-white divide-slate-200'}`}>
                  {currentTransactions.map((tx, index) => (
                    <tr
                      key={tx.id || index}
                      className={`transition-colors duration-150 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                    >
                      {/* Investimento */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t('transactionsModal.table.investmentLabel')}
                          </div>
                        </div>
                      </td>

                      {/* Data */}
                      <td className={`px-4 py-3 whitespace-nowrap text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatDate(tx.timestamp || tx.blockTimestamp)}
                      </td>

                      {/* Hash */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {tx.transactionHash ? (
                          <a
                            href={getExplorerTxUrl(tx.transactionHash, network?.toLowerCase() || 'bsctest')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                          >
                            {truncateHash(tx.transactionHash)}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {formatAmount(tx.amount)} {tx.symbol || productCode || ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {transactions.length > itemsPerPage && (
              <div className={`px-4 py-3 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className={`text-sm text-center md:text-left ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('transactionsModal.pagination.showing', {
                      from: ((currentPage - 1) * itemsPerPage) + 1,
                      to: Math.min(currentPage * itemsPerPage, transactions.length),
                      total: transactions.length
                    })}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon icon="heroicons-outline:chevron-double-left" />
                    </button>
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon icon="heroicons-outline:chevron-left" />
                    </button>

                    {/* Page Numbers */}
                    {(() => {
                      const getVisiblePages = () => {
                        const delta = 1;
                        const left = Math.max(1, currentPage - delta);
                        const right = Math.min(totalPages, currentPage + delta);
                        const pages = [];

                        if (left > 1) {
                          pages.push(1);
                          if (left > 2) pages.push('...');
                        }

                        for (let i = left; i <= right; i++) {
                          pages.push(i);
                        }

                        if (right < totalPages) {
                          if (right < totalPages - 1) pages.push('...');
                          pages.push(totalPages);
                        }

                        return pages;
                      };

                      return getVisiblePages().map((page, index) => {
                        if (page === '...') {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className={`px-3 py-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
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
                                ? "bg-blue-500 text-white"
                                : isDark
                                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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
                      className={`px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon icon="heroicons-outline:chevron-right" />
                    </button>
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon icon="heroicons-outline:chevron-double-right" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default LastTransactionsModal;

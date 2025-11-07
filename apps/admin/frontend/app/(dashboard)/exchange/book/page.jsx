"use client";

import React, { useState, useEffect, useRef } from 'react';
import useCachedBalances from '@/hooks/useCachedBalances';
import useSharedPolling from '@/hooks/useSharedPolling';
import { BalanceDisplay } from '@/utils/balanceUtils';

// Estilos para animações do modal
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }

  .animate-scaleIn {
    animation: scaleIn 0.2s ease-out;
  }
`;
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/services/api';
import { useAlertContext } from '@/contexts/AlertContext';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import LimitOrderForm from '@/components/partials/exchange/LimitOrderForm';
import OrderBook from '@/components/partials/exchange/OrderBook';
import RecentTrades from '@/components/partials/exchange/RecentTrades';
import TradingChart from '@/components/partials/exchange/TradingChart';
import Tooltip from '@/components/ui/Tooltip';
import Drawer from '@/components/ui/Drawer';

const OrderBookPage = () => {
  const { t } = useTranslation('exchange');
  const router = useRouter();
  const { showSuccess, showError } = useAlertContext();
  const { user } = useAuth();
  const walletAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

  // Sistema sempre ativo (sem WebSocket)
  const isConnected = false; // WebSocket desabilitado permanentemente

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const [exchanges, setExchanges] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [userBalances, setUserBalances] = useState({});
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [userOrders, setUserOrders] = useState([]);
  const [allUserOrders, setAllUserOrders] = useState([]); // Todas as ordens
  const [orderFilter, setOrderFilter] = useState('active'); // Filtro inicial: Ativas
  const [pairFilter, setPairFilter] = useState('all'); // Filtro de par
  const [typeFilter, setTypeFilter] = useState('all'); // Filtro de tipo (compra/venda)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedOrders, setPaginatedOrders] = useState([]);

  // Modal de confirmação para cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Drawer para mobile
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerSide, setDrawerSide] = useState('buy'); // 'buy' ou 'sell'

  // Tabs para mobile
  const [mobileTab, setMobileTab] = useState('chart'); // 'chart', 'orderbook', 'trades'

  // Use cached balances hook
  const {
    getBalance,
    loading: isBalanceLoading,
    getCorrectAzeSymbol,
    syncStatus,
    balances
  } = useCachedBalances();

  // Estado para controlar timeout do skeleton
  const [skeletonTimeout, setSkeletonTimeout] = useState(false);

  // Sistema de polling compartilhado (sempre ativo)
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // Função de fetch para polling compartilhado
  const fetchOrderBookData = async () => {
    if (!selectedExchange) return null;

    try {
      const response = await api.get(`/api/exchange/v2/orderbook/${selectedExchange.address}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Erro no fetch do orderbook:', error);
    }
    return null;
  };

  // Hook de polling compartilhado (sempre ativo)
  const pollingData = useSharedPolling(
    selectedExchange?.address,
    fetchOrderBookData,
    pollingEnabled && !!selectedExchange
  );

  // Timeout de 3 segundos para parar skeleton mesmo se API falhar
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonTimeout(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Só mostrar skeleton se está carregando E não passou do timeout E não tem dados válidos
  const shouldShowSkeleton = isBalanceLoading && !skeletonTimeout && (!balances || !balances.balancesTable || balances.isEmergency);

  // Função para obter saldo com proteção
  const getSafeBalance = (token) => {
    const balance = getBalance(token);
    return balance || '0';
  };

  // Função para filtrar ordens
  const filterOrders = (filter) => {
    setOrderFilter(filter);
    setCurrentPage(1); // Reset page when filter changes
    applyFilters(filter, pairFilter, typeFilter);
  };

  // Função para filtrar por par
  const filterByPair = (pair) => {
    setPairFilter(pair);
    setCurrentPage(1); // Reset page when filter changes
    applyFilters(orderFilter, pair, typeFilter);
  };

  // Função para filtrar por tipo
  const filterByType = (type) => {
    setTypeFilter(type);
    setCurrentPage(1); // Reset page when filter changes
    applyFilters(orderFilter, pairFilter, type);
  };

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setOrderFilter('active');
    setPairFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
    applyFilters('active', 'all', 'all');
  };

  // Aplicar todos os filtros
  const applyFilters = (statusFilter, pairFilterValue, typeFilterValue) => {
    let filtered = [...allUserOrders];

    // Aplicar filtro de status
    if (statusFilter === 'active') {
      filtered = filtered.filter(order => {
        const status = order.status?.toLowerCase();
        return status === 'active' || status === 'open' || status === 'partially_executed';
      });
    } else if (statusFilter === 'executed') {
      filtered = filtered.filter(order => {
        const status = order.status?.toLowerCase();
        return status === 'filled' || status === 'executed';
      });
    } else if (statusFilter === 'cancelled') {
      filtered = filtered.filter(order => {
        const status = order.status?.toLowerCase();
        return status === 'cancelled' || status === 'canceled';
      });
    }

    // Aplicar filtro de par
    if (pairFilterValue && pairFilterValue !== 'all') {
      filtered = filtered.filter(order => order.pair === pairFilterValue);
    }

    // Aplicar filtro de tipo
    if (typeFilterValue && typeFilterValue !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilterValue);
    }

    setUserOrders(filtered);
  };

  // Função para paginação
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedOrders(userOrders.slice(startIndex, endIndex));
  }, [userOrders, currentPage, itemsPerPage]);

  // Aplicar filtro inicial apenas na primeira carga
  const hasAppliedInitialFilter = useRef(false);
  useEffect(() => {
    if (allUserOrders.length > 0 && !hasAppliedInitialFilter.current) {
      hasAppliedInitialFilter.current = true;
      applyFilters('active', 'all', 'all'); // Padrão: Ativas
    } else if (allUserOrders.length > 0 && hasAppliedInitialFilter.current) {
      // Re-aplicar filtros atuais quando dados são atualizados (preserva escolha do usuário)
      applyFilters(orderFilter, pairFilter, typeFilter);
    }
  }, [allUserOrders]);

  const totalPages = Math.ceil(userOrders.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Fetch exchanges on mount
  useEffect(() => {
    fetchExchanges();
  }, []);

  // Atualizar orderbook com dados do polling compartilhado
  useEffect(() => {
    if (pollingData) {
      setOrderBook(pollingData);
    }
  }, [pollingData]);

  // Setup inicial e polling quando exchange é selecionado
  useEffect(() => {
    if (selectedExchange) {
      // Initial fetch sempre
      fetchExchangeData();
      if (walletAddress) {
        fetchUserData();
      }

      // Sistema baseado em polling - sempre ativo
      console.log('🔄 Iniciando sistema de polling para exchange:', selectedExchange.address);
    }
  }, [selectedExchange]);

  // Polling adicional para dados do usuário (ordens e saldos)
  useEffect(() => {
    if (!selectedExchange || !walletAddress) return;

    const pollUserData = () => {
      fetchUserData();
    };

    // Fetch inicial
    pollUserData();

    // Polling a cada 10 segundos para dados do usuário
    const interval = setInterval(pollUserData, 10000);

    return () => clearInterval(interval);
  }, [selectedExchange, walletAddress]);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      // Get network from environment or default
      const network = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'testnet';

      const response = await api.get(`/api/contracts/exchanges?network=${network}`);
      if (response.data.success) {
        const exchangeContracts = response.data.data || [];
        setExchanges(exchangeContracts);

        // console.log('Loaded exchanges for order book:', exchangeContracts.map(e => ({
        //   name: e.name,
        //   pair: e.pair,
        //   tokenA: e.tokenA?.symbol,
        //   tokenB: e.tokenB?.symbol
        // })));

        // Try to find PCN/cBRL exchange first
        let selectedEx = null;
        for (const exchange of exchangeContracts) {
          // With the new API, tokenA and tokenB are already parsed
          const tokenASymbol = exchange.tokenA?.symbol;
          const tokenBSymbol = exchange.tokenB?.symbol;
          const pair = exchange.pair;

          // Check if this is PCN/cBRL exchange
          if (pair && (pair.includes('PCN') && pair.includes('cBRL'))) {
            selectedEx = exchange;
            break;
          }

          // Also check tokenA and tokenB directly
          if (tokenASymbol && tokenBSymbol) {
            const hasPCN = (tokenASymbol === 'PCN' || tokenBSymbol === 'PCN');
            const hascBRL = (tokenASymbol === 'cBRL' || tokenBSymbol === 'cBRL');
            if (hasPCN && hascBRL) {
              selectedEx = exchange;
              break;
            }
          }
        }

        // If no PCN/cBRL found, use first exchange
        if (!selectedEx && exchangeContracts.length > 0) {
          selectedEx = exchangeContracts[0];
        }

        if (selectedEx) {
          setSelectedExchange(selectedEx);
        }
      }
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      showError('Erro ao carregar exchanges');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeData = async () => {
    if (!selectedExchange) return;

    try {
      const symbol = getSymbol();

      // Only fetch if we have a valid symbol
      if (symbol && symbol !== 'Selecione um exchange') {
        // Fetch order book using Exchange V2 endpoint
        try {
          // console.log('📊 Fetching order book for:', selectedExchange.address);
          const bookResponse = await api.get(`/api/exchange/v2/orderbook/${selectedExchange.address}`);
          // console.log('📊 Order book response:', bookResponse.data);
          if (bookResponse.data.success) {
            const newOrderBook = bookResponse.data.data;

            // Defensive check: only update if we have valid data
            if (newOrderBook && (
              (newOrderBook.bids && newOrderBook.bids.length > 0) ||
              (newOrderBook.asks && newOrderBook.asks.length > 0) ||
              (orderBook.bids.length === 0 && orderBook.asks.length === 0)
            )) {
              // console.log('✅ Setting order book:', newOrderBook);
              setOrderBook(newOrderBook);
            } else {
              // console.log('⚠️ Received empty order book, keeping current state to prevent disappearing');
              // console.log('Current:', orderBook);
              // console.log('New:', newOrderBook);
            }
          } else {
            // console.log('❌ Order book request failed:', bookResponse.data);
          }
        } catch (e) {
          // console.log('❌ Order book error:', e.message);
        }

      }
    } catch (error) {
      // Only log, don't show error to user for background fetches
      console.error('Error fetching exchange data:', error);
    }
  };

  const fetchUserData = async () => {
    if (!walletAddress || !selectedExchange) return;

    try {
      const tokenA = selectedExchange.tokenA;
      const tokenB = selectedExchange.tokenB;
      const balances = {};

      // Usar APENAS o endpoint do exchange V2 (mais confiável e evita múltiplas chamadas)
      try {
        const exchangeBalancesResponse = await api.get(`/api/exchange/v2/user/${walletAddress}/balances`);
        if (exchangeBalancesResponse.data.success && exchangeBalancesResponse.data.data.balancesTable) {
          const userBalances = exchangeBalancesResponse.data.data.balancesTable;

          // Mapear os saldos pelos símbolos
          if (tokenA?.symbol && userBalances[tokenA.symbol] !== undefined) {
            balances[tokenA.symbol] = parseFloat(userBalances[tokenA.symbol]) || 0;
          }
          if (tokenB?.symbol && userBalances[tokenB.symbol] !== undefined) {
            balances[tokenB.symbol] = parseFloat(userBalances[tokenB.symbol]) || 0;
          }
        }
      } catch (e) {
        // Fallback: usar saldos do contexto de autenticação se disponível
        if (user?.balances) {
          if (tokenA?.symbol && user.balances[tokenA.symbol] !== undefined) {
            balances[tokenA.symbol] = parseFloat(user.balances[tokenA.symbol]) || 0;
          }
          if (tokenB?.symbol && user.balances[tokenB.symbol] !== undefined) {
            balances[tokenB.symbol] = parseFloat(user.balances[tokenB.symbol]) || 0;
          }
        }
      }

      setUserBalances(balances);

      // Fetch user orders (all contracts)
      try {
        // console.log('🔍 Fetching all user orders for:', walletAddress);
        const ordersResponse = await api.get(`/api/exchange/orders/${walletAddress}`);
        // console.log('📋 Orders response:', ordersResponse.data);
        if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
          // console.log('✅ Setting all user orders:', ordersResponse.data);
          setAllUserOrders(ordersResponse.data);
          setUserOrders(ordersResponse.data);
        } else if (ordersResponse.data.success && ordersResponse.data.data) {
          // console.log('✅ Setting all user orders from data field:', ordersResponse.data.data);
          setAllUserOrders(ordersResponse.data.data);
          setUserOrders(ordersResponse.data.data);
        }
      } catch (e) {
        // console.log('❌ User orders error:', e.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Function to refresh data after user actions
  const refreshData = () => {
    // Refresh orderbook and user data immediately after user actions
    fetchExchangeData();
    if (walletAddress) {
      fetchUserData();
    }
  };

  const fetchUserBalances = async () => {
    // This function will be used by WebSocket listeners to refresh balances
    if (walletAddress) {
      fetchUserData();
    }
  };

  const handleOrderSubmit = async (orderData) => {
    try {

      // Use Exchange V2 endpoints - gasless architecture
      const endpoint = orderData.side === 'buy'
        ? '/api/exchange/v2/buy'
        : '/api/exchange/v2/sell';

      // Get token symbols from exchange metadata
      const tokenASymbol = selectedExchange.tokenA?.symbol || 'cBRL';
      const tokenBSymbol = selectedExchange.tokenB?.symbol || 'PCN';

      // Prepare gasless order data - NO PRIVATE KEY NEEDED!
      const gaslessOrderData = {
        userAddress: walletAddress, // Only public address needed
        contractAddress: selectedExchange.address,
        tokenASymbol: tokenASymbol,
        tokenBSymbol: tokenBSymbol,
        amount: parseFloat(orderData.amount),
        ...(orderData.side === 'buy'
          ? { maxPrice: parseFloat(orderData.price) }
          : { minPrice: parseFloat(orderData.price) }
        )
      };

      // console.log('🚀 Sending gasless limit order (no private key):', gaslessOrderData);

      const response = await api.post(endpoint, gaslessOrderData);

      if (response.data.success) {
        showSuccess(`Ordem limitada de ${orderData.side === 'buy' ? 'compra' : 'venda'} criada com sucesso! Os dados serão atualizados em ~10s após confirmação na blockchain.`);

        // WebSocket will handle updates automatically after blockchain confirmation
        // Refresh with progressive delays to catch backend updates
        setTimeout(() => {
          // console.log('🔄 First refresh after order creation');
          refreshData();
        }, 500); // Give backend more time to update cache

        setTimeout(() => {
          // console.log('🔄 Second refresh after order creation');
          refreshData();
        }, 2000); // Second attempt

        setTimeout(() => {
          // console.log('🔄 Third refresh after order creation');
          refreshData();
        }, 5000); // Final attempt
      }
    } catch (error) {
      console.error('Error submitting gasless limit order:', error);

      // Handle expected "User not found" error for demo
      if (error.response?.data?.message?.includes('User not found')) {
        showError('Demo: Usuário não encontrado no banco de dados. Em produção, este erro não ocorreria para usuários autenticados.');
      } else {
        showError(error.response?.data?.message || 'Erro ao criar ordem');
      }

      throw error;
    }
  };

  const handleCancelOrder = (orderId, orderType) => {
    // Abrir modal de confirmação
    setOrderToCancel({ orderId, orderType });
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel || cancelLoading) return;

    setCancelLoading(true);
    try {
      const endpoint = orderToCancel.orderType === 'buy'
        ? '/api/exchange/cancel-buy-order'
        : '/api/exchange/cancel-sell-order';

      const response = await api.post(endpoint, {
        orderId: orderToCancel.orderId,
        contractAddress: selectedExchange.address,
        walletAddress
      });

      if (response.data.success) {
        showSuccess('Ordem cancelada com sucesso! Aguarde a confirmação na blockchain.');
        // WebSocket will handle updates automatically
        setTimeout(() => refreshData(), 100);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError('Erro ao cancelar ordem');
    } finally {
      setCancelLoading(false);
      // Fechar modal
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const cancelModal = () => {
    if (cancelLoading) return; // Não permitir fechar modal durante loading
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const handleOrderBookPriceClick = (price, side) => {
    // This will be passed to LimitOrderForm to pre-fill the price
    setActiveTab(side === 'bid' ? 'sell' : 'buy');
  };

  // Funções para controlar o Drawer
  const handleOpenBuyDrawer = () => {
    setDrawerSide('buy');
    setActiveTab('buy');
    setShowDrawer(true);
  };

  const handleOpenSellDrawer = () => {
    setDrawerSide('sell');
    setActiveTab('sell');
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  // Helper function to normalize pair format
  const normalizePair = (pair) => {
    if (!pair || typeof pair !== 'string') return pair;

    // Sempre mostrar no formato tokenB/tokenA (invertido)
    const tokens = pair.split('/');
    if (tokens.length === 2) {
      const inverted = `${tokens[1]}/${tokens[0]}`;
      // console.log('normalizePair - Original:', pair, '| Inverted:', inverted);
      return inverted;
    }

    return pair;
  };

  const getSymbol = () => {
    if (!selectedExchange) return 'Selecione um exchange';

    // With the new API, pair and symbol are already available directly
    const pair = selectedExchange.pair || selectedExchange.symbol || 'PAR/cBRL';
    const normalized = normalizePair(pair);

    // console.log('getSymbol - selectedExchange:', selectedExchange);
    // console.log('getSymbol - Original pair:', pair, '| Normalized:', normalized);

    return normalized;
  };

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: modalStyles }} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Tooltip content={t('tooltips.back')} placement="bottom">
            <button
              onClick={() => router.push('/exchange')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
            >
              <Icon
                icon="heroicons:arrow-left"
                className="w-4 h-4 text-gray-600 dark:text-gray-300"
              />
            </button>
          </Tooltip>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('bookPage.title')}
              </h1>
              {/* Polling status indicator */}
              <div className={`w-2 h-2 rounded-full ${
                pollingEnabled ? 'bg-blue-500' : 'bg-red-500'
              }`} title={
                pollingEnabled
                  ? 'Atualizações automáticas (Polling 5s)'
                  : 'Sistema pausado'
              } />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('bookPage.subtitle')} {
                pollingEnabled
                  ? '(atualizações automáticas a cada 5s)'
                  : '(dados estáticos)'
              }
            </p>
          </div>
        </div>
      </div>

      {/* User Balances and Exchange Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* User Balances - Dynamic pair tokens */}
        {selectedExchange && (
          <div className="flex items-center space-x-4">
            {/* Token A Balance */}
            {selectedExchange.tokenA && (
              <Card bodyClass="px-4 py-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={`/assets/images/currencies/${selectedExchange.tokenA.symbol}.png`}
                    alt={selectedExchange.tokenA.symbol}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.target.src = '/assets/images/currencies/default.png';
                    }}
                  />
                  <div>
                    <div className="text-xs">
                      {t('bookPage.balance')} {selectedExchange.tokenA.symbol}
                    </div>
                    <div className="font-bold">
                      {shouldShowSkeleton ? (
                        <div className="h-4 w-20 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 rounded animate-pulse"></div>
                      ) : (
                        <BalanceDisplay
                          value={userBalances[selectedExchange.tokenA.symbol] || '0'}
                          showSymbol={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
            {/* Token B Balance */}
            {selectedExchange.tokenB && (
              <Card bodyClass="px-4 py-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={`/assets/images/currencies/${selectedExchange.tokenB.symbol}.png`}
                    alt={selectedExchange.tokenB.symbol}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.target.src = '/assets/images/currencies/default.png';
                    }}
                  />
                  <div>
                    <div className="text-xs">
                      {t('bookPage.balance')} {selectedExchange.tokenB.symbol}
                    </div>
                    <div className="font-bold">
                      {shouldShowSkeleton ? (
                        <div className="h-4 w-20 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 rounded animate-pulse"></div>
                      ) : (
                        <BalanceDisplay
                          value={userBalances[selectedExchange.tokenB.symbol] || '0'}
                          showSymbol={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Exchange Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bookPage.pair')}:</label>
          <select
            value={selectedExchange?.address || ''}
            onChange={(e) => {
              const exchange = exchanges.find(ex => ex.address === e.target.value);
              setSelectedExchange(exchange);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 w-full lg:w-auto"
          >
            <option value="">Selecione um exchange</option>
            {exchanges.map(exchange => {
              const symbol = exchange.pair || exchange.symbol || exchange.name;
              return (
                <option key={exchange.address} value={exchange.address}>
                  {symbol}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {selectedExchange ? (
        <>
          {/* Mobile Layout - Tabs System (visible only on small screens) */}
          <div className="block md:hidden space-y-4">
            {/* Mobile Tabs */}
            <Card>
              <div className="flex border-b dark:border-gray-700">
                <button
                  onClick={() => setMobileTab('chart')}
                  className={`flex-1 py-2.5 px-2 text-center text-sm font-medium transition-colors ${
                    mobileTab === 'chart'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Gráfico
                </button>
                <button
                  onClick={() => setMobileTab('orderbook')}
                  className={`flex-1 py-2.5 px-2 text-center text-sm font-medium transition-colors ${
                    mobileTab === 'orderbook'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Livro
                </button>
                <button
                  onClick={() => setMobileTab('trades')}
                  className={`flex-1 py-2.5 px-2 text-center text-sm font-medium transition-colors ${
                    mobileTab === 'trades'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Trades
                </button>
              </div>

              {/* Mobile Tab Content */}
              <div className="py-2">
                {mobileTab === 'chart' && (
                  <TradingChart
                    symbol={getSymbol()}
                    exchangeContract={selectedExchange?.address}
                  />
                )}
                {mobileTab === 'orderbook' && (
                  <OrderBook
                    buyOrders={orderBook.bids || []}
                    sellOrders={orderBook.asks || []}
                    onPriceClick={handleOrderBookPriceClick}
                    symbol={getSymbol()}
                    exchangeContract={selectedExchange?.address}
                  />
                )}
                {mobileTab === 'trades' && (
                  <RecentTrades
                    symbol={getSymbol()}
                    exchangeContract={selectedExchange?.address}
                  />
                )}
              </div>
            </Card>

            {/* Mobile - My Orders Section (sempre visível abaixo das abas) */}
            <Card>
              <div className="py-4 pb-32">
                <h3 className="text-lg font-semibold mb-4 px-4 flex items-center gap-2">
                  <Icon icon="heroicons:clipboard-document-list" className="w-5 h-5" />
                  {t('myOrders.title')}
                </h3>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4 px-4 overflow-x-auto">
                  <Button
                    className={`btn-sm whitespace-nowrap ${orderFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => filterOrders('all')}
                  >
                    {t('myOrders.filters.all')}
                  </Button>
                  <Button
                    className={`btn-sm whitespace-nowrap ${orderFilter === 'active' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => filterOrders('active')}
                  >
                    {t('myOrders.filters.active')}
                  </Button>
                  <Button
                    className={`btn-sm whitespace-nowrap ${orderFilter === 'executed' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => filterOrders('executed')}
                  >
                    {t('myOrders.filters.executed')}
                  </Button>
                  <Button
                    className={`btn-sm whitespace-nowrap ${orderFilter === 'cancelled' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => filterOrders('cancelled')}
                  >
                    {t('myOrders.filters.cancelled')}
                  </Button>
                </div>

                {/* Orders Table - Mobile with stripped rows and hover */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                    <thead className="bg-slate-200 dark:bg-slate-700">
                      <tr>
                        <th className="table-th text-left">Par</th>
                        <th className="table-th text-left">Tipo</th>
                        <th className="table-th text-right">Preço</th>
                        <th className="table-th text-right">Qtd</th>
                        <th className="table-th text-right">Rest.</th>
                        <th className="table-th text-center">Status</th>
                        <th className="table-th text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                      {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order, index) => {
                          const normalizedStatus = order.status?.toLowerCase();
                          const isActive = normalizedStatus === 'active' || normalizedStatus === 'open' || normalizedStatus === 'partially_executed';
                          const isFilled = normalizedStatus === 'filled' || normalizedStatus === 'executed';

                          return (
                            <tr
                              key={index}
                              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <td className="table-td text-xs font-medium">
                                {normalizePair(order.pair) || getSymbol()}
                              </td>
                              <td className="table-td">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  order.type === 'buy'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400'
                                }`}>
                                  {order.type === 'buy' ? 'COMPRA' : 'VENDA'}
                                </span>
                              </td>
                              <td className="table-td text-right text-xs font-semibold">
                                {order.price}
                              </td>
                              <td className="table-td text-right text-xs">
                                {order.amount}
                              </td>
                              <td className="table-td text-right text-xs">
                                <span className={`${
                                  order.remaining < order.amount
                                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                                    : ''
                                }`}>
                                  {order.remaining !== undefined ? order.remaining : order.amount}
                                </span>
                              </td>
                              <td className="table-td text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  isActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-400"
                                    : isFilled
                                    ? "bg-green-50 text-green-700 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}>
                                  {isActive ? 'Ativa' : isFilled ? 'Exec.' : 'Canc.'}
                                </span>
                              </td>
                              <td className="table-td text-center">
                                {isActive && order.id !== "0" && (
                                  <Button
                                    onClick={() => handleCancelOrder(order.id, order.type)}
                                    className="btn-sm btn-outline-danger py-1 px-2 text-xs"
                                  >
                                    <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                                  </Button>
                                )}
                                {isActive && order.id === "0" && (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-gray-500 text-sm">
                            {t('myOrders.empty.noOrders')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* Floating Action Buttons - Horizontal Layout above MobileFooter */}
            <div className="fixed bottom-[90px] left-0 right-0 flex justify-center gap-3 px-4 z-[9998]">
              <button
                onClick={handleOpenBuyDrawer}
                className="flex-1 max-w-[180px] px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold shadow-lg flex items-center justify-center transition-all"
              >
                Comprar
              </button>
              <button
                onClick={handleOpenSellDrawer}
                className="flex-1 max-w-[180px] px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold shadow-lg flex items-center justify-center transition-all"
              >
                Vender
              </button>
            </div>
          </div>

          {/* Medium Layout (md) - 2/3 left + 1/3 right */}
          <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-6">
            {/* Left Column 2/3 - Chart + OrderBook/Trades */}
            <div className="md:col-span-2 space-y-6">
              {/* Trading Chart */}
              <TradingChart
                symbol={getSymbol()}
                exchangeContract={selectedExchange?.address}
              />

              {/* OrderBook + RecentTrades Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                <OrderBook
                  buyOrders={orderBook.bids || []}
                  sellOrders={orderBook.asks || []}
                  onPriceClick={handleOrderBookPriceClick}
                  symbol={getSymbol()}
                  exchangeContract={selectedExchange?.address}
                />
                <RecentTrades
                  symbol={getSymbol()}
                  exchangeContract={selectedExchange?.address}
                />
              </div>
            </div>

            {/* Right Column 1/3 - LimitOrderForm */}
            <div className="md:col-span-1">
              <Card>
                <div className="p-4">
                  {/* Tab Selector */}
                  <div className="flex mb-4 border-b dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab('buy')}
                      className={`flex-1 py-2 text-center font-medium transition-colors ${
                        activeTab === 'buy'
                          ? 'text-green-600 border-b-2 border-green-600'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {t('orderForm.buy')}
                    </button>
                    <button
                      onClick={() => setActiveTab('sell')}
                      className={`flex-1 py-2 text-center font-medium transition-colors ${
                        activeTab === 'sell'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {t('orderForm.sell')}
                    </button>
                  </div>

                  {/* Order Form */}
                  <LimitOrderForm
                    symbol={getSymbol()}
                    exchangeContract={selectedExchange}
                    side={activeTab}
                    onOrderSubmit={handleOrderSubmit}
                    userBalances={userBalances}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* My Orders Section - Full Width for md */}
          <div className="hidden md:block lg:hidden mt-6">
            <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon icon="heroicons:clipboard-document-list" className="w-5 h-5" />
                    {t('myOrders.title')}
                  </h3>

                  {/* Filter Tabs and Pagination Controls */}
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <div className="flex gap-2 items-center flex-wrap">
                      <Button
                        className={`btn-sm ${orderFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => filterOrders('all')}
                      >
                        {t('myOrders.filters.all')}
                      </Button>
                      <Button
                        className={`btn-sm ${orderFilter === 'active' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => filterOrders('active')}
                      >
                        {t('myOrders.filters.active')}
                      </Button>
                      <Button
                        className={`btn-sm ${orderFilter === 'executed' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => filterOrders('executed')}
                      >
                        {t('myOrders.filters.executed')}
                      </Button>
                      <Button
                        className={`btn-sm ${orderFilter === 'cancelled' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => filterOrders('cancelled')}
                      >
                        {t('myOrders.filters.cancelled')}
                      </Button>

                      {/* Filtro de Par */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">{t('myOrders.filters.pair')}:</label>
                        <select
                          value={pairFilter}
                          onChange={(e) => filterByPair(e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="all">{t('myOrders.filters.allPairs')}</option>
                          {Array.from(new Set(allUserOrders.map(order => order.pair))).map(pair => (
                            <option key={pair} value={pair}>
                              {normalizePair(pair)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Filtro de Tipo */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">{t('myOrders.filters.type')}:</label>
                        <select
                          value={typeFilter}
                          onChange={(e) => filterByType(e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="all">{t('myOrders.filters.allTypes')}</option>
                          <option value="buy">{t('myOrders.filters.buy')}</option>
                          <option value="sell">{t('myOrders.filters.sell')}</option>
                        </select>
                      </div>

                      {/* Botão Limpar Filtros */}
                      {(orderFilter !== 'active' || pairFilter !== 'all' || typeFilter !== 'all') && (
                        <Button
                          className="btn-sm btn-outline-danger"
                          onClick={clearFilters}
                        >
                          <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-1" />
                          {t('myOrders.filters.clearFilters')}
                        </Button>
                      )}
                    </div>

                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('myOrders.pagination.itemsPerPage')}</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-3 px-2 text-sm font-medium">{t('myOrders.table.pair')}</th>
                          <th className="text-left py-3 px-2 text-sm font-medium">{t('myOrders.table.type')}</th>
                          <th className="text-right py-3 px-2 text-sm font-medium">{t('myOrders.table.initialAmount')}</th>
                          <th className="text-right py-3 px-2 text-sm font-medium">{t('myOrders.table.remainingAmount')}</th>
                          <th className="text-right py-3 px-2 text-sm font-medium">{t('myOrders.table.price')}</th>
                          <th className="text-right py-3 px-2 text-sm font-medium">{t('myOrders.table.total')}</th>
                          <th className="text-center py-3 px-2 text-sm font-medium">{t('myOrders.table.status')}</th>
                          <th className="text-center py-3 px-2 text-sm font-medium">{t('myOrders.table.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.length > 0 ? (
                          paginatedOrders.map((order, index) => {
                            // Calcular o total se não existir
                            const orderTotal = order.total || (parseFloat(order.price) * parseFloat(order.amount)).toFixed(2);
                            // Normalizar status para comparação
                            const normalizedStatus = order.status?.toLowerCase();
                            const isActive = normalizedStatus === 'active' || normalizedStatus === 'open' || normalizedStatus === 'partially_executed';
                            const isFilled = normalizedStatus === 'filled' || normalizedStatus === 'executed';
                            const isCancelled = normalizedStatus === 'cancelled' || normalizedStatus === 'canceled';

                            return (
                              <tr key={index} className="border-b dark:border-gray-700">
                                <td className="py-3 px-2 text-sm">{normalizePair(order.pair) || getSymbol()}</td>
                                <td className="py-3 px-2">
                                  <span className={`text-sm font-medium ${
                                    order.type === 'buy' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {order.type === 'buy' ? t('myOrders.filters.buy') : t('myOrders.filters.sell')}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-sm text-right">{order.amount}</td>
                                <td className="py-3 px-2 text-sm text-right">
                                  <span className={order.remaining < order.amount ? 'text-orange-600 font-medium' : ''}>
                                    {order.remaining !== undefined ? order.remaining : order.amount}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-sm text-right">{order.price}</td>
                                <td className="py-3 px-2 text-sm text-right">{orderTotal}</td>
                                <td className="py-3 px-2 text-center">
                                  <span
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                      isActive
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-400"
                                        : isFilled
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400"
                                    }`}
                                  >
                                    <Icon
                                      icon={
                                        isActive
                                          ? "heroicons-solid:clock"
                                          : isFilled
                                          ? "heroicons-solid:check-circle"
                                          : "heroicons-solid:x-circle"
                                      }
                                      className="w-3 h-3 mr-1.5"
                                    />
                                    {isActive ? t('myOrders.status.active') : isFilled ? t('myOrders.status.executed') : t('myOrders.status.cancelled')}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  {isActive && order.id !== "0" && (
                                    <Button
                                      onClick={() => handleCancelOrder(order.id, order.type)}
                                      className="btn-sm btn-outline-danger"
                                    >
                                      {t('myOrders.actions.cancel')}
                                    </Button>
                                  )}
                                  {isActive && order.id === "0" && (
                                    <span className="text-xs text-yellow-600">{t('myOrders.status.processing')}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="8" className="py-8 text-center text-gray-500">
                              {userOrders.length === 0 ? t('myOrders.empty.noOrders') : t('myOrders.empty.noOrdersPage')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('myOrders.pagination.showing', { from: ((currentPage - 1) * itemsPerPage) + 1, to: Math.min(currentPage * itemsPerPage, userOrders.length), total: userOrders.length })}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          className="btn-sm btn-outline-secondary"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          {t('myOrders.pagination.previous')}
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            className={`btn-sm ${
                              page === currentPage ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          className="btn-sm btn-outline-secondary"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          {t('myOrders.pagination.next')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
          </div>

          {/* Large+ Layout (lg, xl, xxl) - 1/3 left + 2/3 right */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {/* Left Column 1/3 - OrderBook + RecentTrades */}
            <div className="lg:col-span-1 space-y-6">
              <OrderBook
                buyOrders={orderBook.bids || []}
                sellOrders={orderBook.asks || []}
                onPriceClick={handleOrderBookPriceClick}
                symbol={getSymbol()}
                exchangeContract={selectedExchange?.address}
              />
              <RecentTrades
                symbol={getSymbol()}
                exchangeContract={selectedExchange?.address}
              />
            </div>

            {/* Right Column 2/3 - Chart + LimitOrderForm */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trading Chart */}
              <TradingChart
                symbol={getSymbol()}
                exchangeContract={selectedExchange?.address}
              />

              {/* LimitOrderForm */}
              <Card>
                <div className="p-4">
                  {/* Tab Selector */}
                  <div className="flex mb-4 border-b dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab('buy')}
                      className={`flex-1 py-2 text-center font-medium transition-colors ${
                        activeTab === 'buy'
                          ? 'text-green-600 border-b-2 border-green-600'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {t('orderForm.buy')}
                    </button>
                    <button
                      onClick={() => setActiveTab('sell')}
                      className={`flex-1 py-2 text-center font-medium transition-colors ${
                        activeTab === 'sell'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {t('orderForm.sell')}
                    </button>
                  </div>

                  {/* Order Form */}
                  <LimitOrderForm
                    symbol={getSymbol()}
                    exchangeContract={selectedExchange}
                    side={activeTab}
                    onOrderSubmit={handleOrderSubmit}
                    userBalances={userBalances}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* My Orders Section - Full Width for lg+ */}
          <div className="hidden lg:block mt-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="heroicons:clipboard-document-list" className="w-5 h-5" />
                  {t('myOrders.title')}
                </h3>

                {/* Filter Tabs and Pagination Controls */}
                <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                  <div className="flex gap-2 items-center flex-wrap">
                    <Button
                      className={`btn-sm ${orderFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => filterOrders('all')}
                    >
                      {t('myOrders.filters.all')}
                    </Button>
                    <Button
                      className={`btn-sm ${orderFilter === 'active' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => filterOrders('active')}
                    >
                      {t('myOrders.filters.active')}
                    </Button>
                    <Button
                      className={`btn-sm ${orderFilter === 'executed' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => filterOrders('executed')}
                    >
                      {t('myOrders.filters.executed')}
                    </Button>
                    <Button
                      className={`btn-sm ${orderFilter === 'cancelled' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => filterOrders('cancelled')}
                    >
                      {t('myOrders.filters.cancelled')}
                    </Button>

                    {/* Filtro de Par */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{t('myOrders.filters.pair')}:</label>
                      <select
                        value={pairFilter}
                        onChange={(e) => filterByPair(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">{t('myOrders.filters.allPairs')}</option>
                        {Array.from(new Set(allUserOrders.map(order => order.pair))).map(pair => (
                          <option key={pair} value={pair}>
                            {normalizePair(pair)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro de Tipo */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{t('myOrders.filters.type')}:</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => filterByType(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">{t('myOrders.filters.allTypes')}</option>
                        <option value="buy">{t('myOrders.filters.buy')}</option>
                        <option value="sell">{t('myOrders.filters.sell')}</option>
                      </select>
                    </div>

                    {/* Botão Limpar Filtros */}
                    {(orderFilter !== 'active' || pairFilter !== 'all' || typeFilter !== 'all') && (
                      <Button
                        className="btn-sm btn-outline-danger"
                        onClick={clearFilters}
                      >
                        <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-1" />
                        {t('myOrders.filters.clearFilters')}
                      </Button>
                    )}
                  </div>

                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('myOrders.pagination.itemsPerPage')}</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                    <thead className="bg-slate-200 dark:bg-slate-700">
                      <tr>
                        <th className="table-th text-left">{t('myOrders.table.pair')}</th>
                        <th className="table-th text-left">{t('myOrders.table.type')}</th>
                        <th className="table-th text-right">{t('myOrders.table.initialAmount')}</th>
                        <th className="table-th text-right">{t('myOrders.table.remainingAmount')}</th>
                        <th className="table-th text-right">{t('myOrders.table.price')}</th>
                        <th className="table-th text-right">{t('myOrders.table.total')}</th>
                        <th className="table-th text-center">{t('myOrders.table.status')}</th>
                        <th className="table-th text-center">{t('myOrders.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                      {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order, index) => {
                          const orderTotal = order.total || (parseFloat(order.price) * parseFloat(order.amount)).toFixed(2);
                          const normalizedStatus = order.status?.toLowerCase();
                          const isActive = normalizedStatus === 'active' || normalizedStatus === 'open' || normalizedStatus === 'partially_executed';
                          const isFilled = normalizedStatus === 'filled' || normalizedStatus === 'executed';

                          return (
                            <tr key={index} className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                              <td className="table-td">{normalizePair(order.pair) || getSymbol()}</td>
                              <td className="table-td">
                                <span className={`font-medium ${
                                  order.type === 'buy' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {order.type === 'buy' ? t('myOrders.filters.buy') : t('myOrders.filters.sell')}
                                </span>
                              </td>
                              <td className="table-td text-right">{order.amount}</td>
                              <td className="table-td text-right">
                                <span className={order.remaining < order.amount ? 'text-orange-600 font-medium' : ''}>
                                  {order.remaining !== undefined ? order.remaining : order.amount}
                                </span>
                              </td>
                              <td className="table-td text-right">{order.price}</td>
                              <td className="table-td text-right">{orderTotal}</td>
                              <td className="table-td text-center">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                    isActive
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-400"
                                      : isFilled
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400"
                                  }`}
                                >
                                  <Icon
                                    icon={
                                      isActive
                                        ? "heroicons-solid:clock"
                                        : isFilled
                                        ? "heroicons-solid:check-circle"
                                        : "heroicons-solid:x-circle"
                                    }
                                    className="w-3 h-3 mr-1.5"
                                  />
                                  {isActive ? t('myOrders.status.active') : isFilled ? t('myOrders.status.executed') : t('myOrders.status.cancelled')}
                                </span>
                              </td>
                              <td className="table-td text-center">
                                {isActive && order.id !== "0" && (
                                  <Button
                                    onClick={() => handleCancelOrder(order.id, order.type)}
                                    className="btn-sm btn-outline-danger"
                                  >
                                    {t('myOrders.actions.cancel')}
                                  </Button>
                                )}
                                {isActive && order.id === "0" && (
                                  <span className="text-xs text-yellow-600">{t('myOrders.status.processing')}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-gray-500">
                            {userOrders.length === 0 ? t('myOrders.empty.noOrders') : t('myOrders.empty.noOrdersPage')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('myOrders.pagination.showing', { from: ((currentPage - 1) * itemsPerPage) + 1, to: Math.min(currentPage * itemsPerPage, userOrders.length), total: userOrders.length })}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        className="btn-sm btn-outline-secondary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        {t('myOrders.pagination.previous')}
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          className={`btn-sm ${
                            page === currentPage ? 'btn-primary' : 'btn-outline-secondary'
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        className="btn-sm btn-outline-secondary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        {t('myOrders.pagination.next')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <div className="p-12 text-center">
            <Icon icon="heroicons:arrow-right-circle" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">{t('bookPage.selectExchange.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('bookPage.selectExchange.description')}
            </p>
          </div>
        </Card>
      )}

      {/* Drawer for Mobile Order Form */}
      <Drawer
        isOpen={showDrawer}
        onClose={handleCloseDrawer}
        title={drawerSide === 'buy' ? t('orderForm.buy') : t('orderForm.sell')}
        position="bottom"
      >
        <div className="p-4">
          <LimitOrderForm
            symbol={getSymbol()}
            exchangeContract={selectedExchange}
            side={drawerSide}
            onOrderSubmit={(orderData) => {
              handleOrderSubmit(orderData).then(() => {
                handleCloseDrawer();
              });
            }}
            userBalances={userBalances}
          />
        </div>
      </Drawer>

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={cancelModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-200 scale-100 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('myOrders.cancelModal.title')}
              </h3>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-300 ml-13">
              {orderToCancel?.orderType === 'buy' ? t('myOrders.cancelModal.descriptionBuy') : t('myOrders.cancelModal.descriptionSell')}
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('myOrders.cancelModal.warning')}</span>
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={cancelModal}
                className="btn-secondary px-4 py-2"
                disabled={cancelLoading}
              >
                {t('myOrders.cancelModal.no')}
              </Button>
              <Button
                onClick={confirmCancelOrder}
                className="btn-danger px-4 py-2"
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('myOrders.actions.cancelling')}
                  </div>
                ) : (
                  t('myOrders.cancelModal.yes')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderBookPage;
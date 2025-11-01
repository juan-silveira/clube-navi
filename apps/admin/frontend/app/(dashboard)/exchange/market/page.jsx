"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/services/api';
import { useAlertContext } from '@/contexts/AlertContext';
import { useAuth } from '@/hooks/useAuth';
import TabbedMarketForm from '@/components/partials/exchange/TabbedMarketForm';
import Tooltip from '@/components/ui/Tooltip';
import useAuthStore from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
// import useWebSocket from '@/hooks/useWebSocket'; // Removed - using polling instead
import useConfig from "@/hooks/useConfig";
import useCachedBalances from '@/hooks/useCachedBalances';
import { BalanceDisplay } from '@/utils/balanceUtils';

const MarketPage = () => {
  const { t } = useTranslation('exchange');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useAlertContext();
  const { user } = useAuth();
  const walletAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [userBalances, setUserBalances] = useState({});
  const [selectedTokenA, setSelectedTokenA] = useState(null);
  const [selectedTokenB, setSelectedTokenB] = useState(null);
  const [tokensInitialized, setTokensInitialized] = useState(false);
  const hasInitializedFromUrl = useRef(false);
  const { defaultNetwork } = useConfig();


  // Use cached balances hook like HomeBredCurbs
  const {
    getBalance,
    loading: isBalanceLoading,
    getCorrectAzeSymbol,
    syncStatus,
    balances
  } = useCachedBalances();

  // Estado para controlar timeout do skeleton
  const [skeletonTimeout, setSkeletonTimeout] = useState(false);

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

  // Polling for updates instead of WebSocket
  const [pollingInterval, setPollingInterval] = useState(null);

  // Fetch tokens and exchanges on mount
  useEffect(() => {
    fetchTokensAndExchanges();
  }, []);

  // Set tokens from URL parameters - LÓGICA SIMPLIFICADA
  // REGRA: Se from não for cBRL, então to DEVE ser cBRL
  useEffect(() => {
    if (tokens.length === 0) return;

    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Se não há parâmetros, deixar o auto-select fazer seu trabalho
    if (!fromParam || !toParam) {
      setTokensInitialized(false);
      return;
    }

    // Se já inicializamos com esses parâmetros, não fazer nada
    const currentA = selectedTokenA?.metadata?.symbol || selectedTokenA?.symbol;
    const currentB = selectedTokenB?.metadata?.symbol || selectedTokenB?.symbol;
    if (currentA === fromParam && currentB === toParam) {
      return;
    }

    // REGRA SIMPLES: Se from não é cBRL, to DEVE ser cBRL
    let finalFrom = fromParam;
    let finalTo = toParam;

    if (fromParam !== 'cBRL' && toParam !== 'cBRL') {
      finalTo = 'cBRL';
    }

    const tokenA = tokens.find(t => {
      const symbol = t.metadata?.symbol || t.symbol;
      return symbol === finalFrom;
    });

    const tokenB = tokens.find(t => {
      const symbol = t.metadata?.symbol || t.symbol;
      return symbol === finalTo;
    });

    if (tokenA && tokenB && tokenA.address !== tokenB.address) {
      // CRÍTICO: Setar tokensInitialized ANTES de setar os tokens
      // para evitar race condition com auto-select
      setTokensInitialized(true);

      // Usar setTimeout para garantir que tokensInitialized seja processado primeiro
      setTimeout(() => {
        setSelectedTokenA(tokenA);
        setSelectedTokenB(tokenB);
      }, 0);
    } else {
      setTokensInitialized(false);
    }
  }, [tokens, searchParams]);

  // Update user balances when wallet changes
  useEffect(() => {
    if (walletAddress) {
      fetchUserBalances();
    }
  }, [walletAddress]);

  // Update exchange when tokens change
  useEffect(() => {
    findMatchingExchange();
  }, [selectedTokenA, selectedTokenB, exchanges]);

  // Setup polling for updates
  useEffect(() => {
    if (!selectedExchange || !walletAddress) return;

    // Fetch balances immediately
    fetchUserBalances();

    // Setup polling interval (every 3 seconds)
    const interval = setInterval(() => {
      fetchUserBalances();
    }, 3000);

    setPollingInterval(interval);

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedExchange, walletAddress]);

  const fetchTokensAndExchanges = async () => {
    setLoading(true);
    try {
      // Get network from environment or default
      const network = defaultNetwork || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'mainnet';

      // console.log('About to fetch contracts with network:', network);
      // console.log('API base URL:', api.defaults.baseURL);

      // Check auth state
      const { accessToken, isAuthenticated, user } = useAuthStore.getState();
      // console.log('Auth state:', {
      //   isAuthenticated,
      //   hasToken: !!accessToken,
      //   tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'null',
      //   userEmail: user?.email
      // });

      // Fetch tokens and exchanges using the new specific endpoints
      const [tokensResponse, exchangesResponse] = await Promise.all([
        api.get(`/api/contracts/tokens?network=${network}`),
        api.get(`/api/contracts/exchanges?network=${network}`)
      ]);

      // console.log('Responses received:', {
      //   tokensSuccess: tokensResponse.data.success,
      //   tokensCount: tokensResponse.data.data?.length || 0,
      //   exchangesSuccess: exchangesResponse.data.success,
      //   exchangesCount: exchangesResponse.data.data?.length || 0
      // });

      if (tokensResponse.data.success) {
        const tokenList = tokensResponse.data.data || [];
        setTokens(tokenList);
      }

      if (exchangesResponse.data.success) {
        const exchangeList = exchangesResponse.data.data || [];

        // console.log('Loaded exchanges:', exchangeList.map(e => ({
        //   name: e.name,
        //   pair: e.pair,
        //   tokenA: e.tokenA?.symbol,
        //   tokenB: e.tokenB?.symbol,
        //   address: e.address
        // })));

        // console.log('Full exchange response:', exchangesResponse.data);

        setExchanges(exchangeList);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      showError('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const findMatchingExchange = () => {
    if (!selectedTokenA || !selectedTokenB || exchanges.length === 0) {
      // console.log('Early return: missing tokens or exchanges', {
      //   selectedTokenA,
      //   selectedTokenB,
      //   exchangesCount: exchanges.length
      // });
      setSelectedExchange(null);
      return;
    }

    // Helper function to get token symbol
    const getSymbol = (token) => {
      if (!token) return '';
      if (token.metadata) {
        try {
          const metadata = typeof token.metadata === 'string' ? JSON.parse(token.metadata) : token.metadata;
          if (metadata.symbol) return metadata.symbol;
        } catch (e) {}
      }
      return token.symbol || '';
    };

    const tokenASymbol = getSymbol(selectedTokenA);
    const tokenBSymbol = getSymbol(selectedTokenB);

    // console.log('Looking for exchange with tokens:', {
    //   tokenASymbol,
    //   tokenBSymbol,
    //   availableExchanges: exchanges.map(e => ({
    //     name: e.name,
    //     tokenA: e.tokenA?.symbol,
    //     tokenB: e.tokenB?.symbol,
    //     pair: e.pair
    //   }))
    // });

    // Find exchange that matches the token pair by symbols
    const matchingExchange = exchanges.find(exchange => {
      // With the new API structure, tokenA and tokenB are already parsed
      const exchangeTokenASymbol = exchange.tokenA?.symbol;
      const exchangeTokenBSymbol = exchange.tokenB?.symbol;

      // console.log('Checking exchange:', {
      //   exchangeName: exchange.name,
      //   exchangeTokenA: exchangeTokenASymbol,
      //   exchangeTokenB: exchangeTokenBSymbol,
      //   userTokenA: tokenASymbol,
      //   userTokenB: tokenBSymbol
      // });

      // Check if exchange matches our selected tokens by symbol
      // The exchange can match in either order
      const isMatch = (
        (exchangeTokenASymbol === tokenASymbol && exchangeTokenBSymbol === tokenBSymbol) ||
        (exchangeTokenASymbol === tokenBSymbol && exchangeTokenBSymbol === tokenASymbol)
      );

      if (isMatch) {
        // console.log('Found matching exchange!', exchange.name);
      }

      return isMatch;
    });

    if (matchingExchange) {
      // console.log('Setting selected exchange:', matchingExchange.name);
      setSelectedExchange(matchingExchange);
      // Don't swap tokens here - let the user control the order
    } else {
      // console.log('No matching exchange found');
      setSelectedExchange(null);
      // Don't show error immediately - wait for user to try to submit
    }
  };

  const fetchUserBalances = async () => {
    if (!walletAddress) return;

    try {
      // Usar APENAS o endpoint do exchange V2 (mais confiável e evita múltiplas chamadas)
      try {
        const exchangeResponse = await api.get(`/api/exchange/v2/user/${walletAddress}/balances`);
        if (exchangeResponse.data.success) {
          const allUserBalances = exchangeResponse.data.data.balancesTable || exchangeResponse.data.data;
          setUserBalances(allUserBalances);
          return;
        }
      } catch (e) {
        // Fallback: usar saldos do contexto de autenticação se disponível
        if (user?.balances) {
          setUserBalances(user.balances);
        }
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      // Check if this is a market order
      if (orderData.isMarketOrder) {
        // Use market order endpoints
        const endpoint = orderData.side === 'buy'
          ? '/api/exchange/v2/market/buy'
          : '/api/exchange/v2/market/sell';

        const marketOrderData = {
          userAddress: walletAddress,
          contractAddress: orderData.contractAddress,
          amount: parseFloat(orderData.amount),
          orderIds: orderData.orderIds,
          minAmountOut: parseFloat(orderData.minAmountOut)
        };

        console.log('🚀 Sending market order:', marketOrderData);

        const response = await api.post(endpoint, marketOrderData);

        if (response.data.success) {
          showSuccess(`Ordem de mercado de ${orderData.side === 'buy' ? 'compra' : 'venda'} executada com sucesso!`);
          fetchUserBalances(); // Refresh balances
        }
      } else {
        // Regular limit order (existing code)
        const endpoint = orderData.side === 'buy'
          ? '/api/exchange/v2/buy'
          : '/api/exchange/v2/sell';

        // Get token symbols from selected tokens
        const getSymbol = (token) => {
          if (token.metadata) {
            try {
              const metadata = typeof token.metadata === 'string' ? JSON.parse(token.metadata) : token.metadata;
              return metadata.symbol;
            } catch (e) {}
          }
          return token.symbol || '';
        };

        const tokenASymbol = getSymbol(selectedTokenA);
        const tokenBSymbol = getSymbol(selectedTokenB);

        // Prepare gasless order data - NO PRIVATE KEY NEEDED!
        const gaslessOrderData = {
          userAddress: walletAddress, // Only public address needed
          contractAddress: selectedExchange.address,
          tokenASymbol: tokenASymbol,
          tokenBSymbol: tokenBSymbol,
          amount: parseFloat(orderData.amount),
          ...(orderData.side === 'buy'
            ? { maxPrice: orderData.quote?.price || 1.0 }
            : { minPrice: orderData.quote?.price || 1.0 }
          )
        };

        // console.log('🚀 Sending gasless order (no private key):', gaslessOrderData);

        const response = await api.post(endpoint, gaslessOrderData);

        if (response.data.success) {
          showSuccess(`Ordem de ${orderData.side === 'buy' ? 'compra' : 'venda'} executada com sucesso! Transação gasless processada.`);
          fetchUserBalances(); // Refresh balances
        }
      }
    } catch (error) {
      console.error('Error submitting order:', error);

      // Handle expected "User not found" error for demo
      if (error.response?.data?.message?.includes('User not found')) {
        showError('Demo: Usuário não encontrado no banco de dados. Em produção, este erro não ocorreria para usuários autenticados.');
      } else if (error.response?.data?.message?.includes('No sell orders available') ||
                 error.response?.data?.message?.includes('No buy orders available')) {
        showError('Não há ordens disponíveis no mercado para executar sua ordem.');
      } else if (error.response?.data?.message?.includes('Insufficient liquidity')) {
        showError(error.response?.data?.message);
      } else {
        showError(error.response?.data?.message || 'Erro ao executar ordem');
      }

      throw error;
    }
  };

  const handleTokenChange = (type, token, isManualSwap = false) => {
    const symbol = token?.metadata?.symbol || token?.symbol;

    if (type === 'base') {
      // Se NÃO for swap manual e já existe tokenB com o mesmo endereço, bloquear (proteção para seleção via URL)
      if (!isManualSwap && selectedTokenB && token.address === selectedTokenB.address) {
        showError(`Não é possível selecionar ${symbol} em ambos os campos`);
        return;
      }
      setSelectedTokenA(token);
    } else {
      // Se NÃO for swap manual e já existe tokenA com o mesmo endereço, bloquear (proteção para seleção via URL)
      if (!isManualSwap && selectedTokenA && token.address === selectedTokenA.address) {
        showError(`Não é possível selecionar ${symbol} em ambos os campos`);
        return;
      }
      setSelectedTokenB(token);
    }
  };

  const getSymbol = () => {
    if (!selectedExchange) return 'Selecione os tokens';

    try {
      const metadata = typeof selectedExchange.metadata === 'string'
        ? JSON.parse(selectedExchange.metadata)
        : selectedExchange.metadata;
      return metadata.pair || metadata.symbol || 'PAR/cBRL';
    } catch (e) {
      return 'PAR/cBRL';
    }
  };

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('marketPage.title')} - {getSymbol()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('marketPage.subtitle')}
            </p>
          </div>
        </div>
      </div>

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
                    {t('marketPage.balance')} {selectedExchange.tokenA.symbol}
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
                    {t('marketPage.balance')} {selectedExchange.tokenB.symbol}
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

      {/* Trading Interface */}
      <TabbedMarketForm
        availableTokens={tokens}
        userBalances={userBalances}
        onOrderSubmit={handleOrderSubmit}
        selectedExchange={selectedExchange}
        onTokenChange={handleTokenChange}
        selectedTokenA={selectedTokenA}
        selectedTokenB={selectedTokenB}
        tokensInitialized={tokensInitialized}
        user={user}
      />

      {!selectedExchange && selectedTokenA && selectedTokenB && (
        <Card>
          <div className="p-12 text-center">
            <Icon icon="heroicons:exclamation-triangle" className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">{t('marketPage.exchangeNotFound.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('marketPage.exchangeNotFound.description', { pair: `${selectedTokenA.symbol}/${selectedTokenB.symbol}` })}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {t('marketPage.exchangeNotFound.contact')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarketPage;
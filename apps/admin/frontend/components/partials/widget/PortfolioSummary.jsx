"use client";
import React, { useEffect, useState, useMemo } from "react";
import useCachedBalances from "@/hooks/useCachedBalances";
import PortfolioDonutChart from "@/components/partials/widget/chart/portfolio-donut-chart";
import UserAvatar from "@/components/ui/UserAvatar";
import SyncStatusIndicator from "@/components/ui/SyncStatusIndicator";
import Tooltip from "@/components/ui/Tooltip";
import useAuthStore from "@/store/authStore";
import useConfig from "@/hooks/useConfig";
import balanceBackupService from "@/services/balanceBackupService";
import { FeaturedBalanceSkeleton, PortfolioCardSkeleton } from "@/components/skeleton/BalanceSkeleton";
import {
  getTokenPrice,
  formatCurrency as formatCurrencyHelper,
} from "@/constants/tokenPrices";
import api from "@/services/api";
import { tokenService } from "@/services/api";
import tokenPriceService from "@/services/tokenPriceService";
import { useTranslation } from "@/hooks/useTranslation";

const PortfolioSummary = () => {
  const { t } = useTranslation('dashboard');
  const { balances, loading, syncStatus, getCorrectAzeSymbol, getBalance: getCachedBalance } = useCachedBalances();
  const { user, setCachedBalances } = useAuthStore();
  const { defaultNetwork } = useConfig();
  const [emergencyApplied, setEmergencyApplied] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [tokenPrices, setTokenPrices] = useState({});

  // REMOVIDO: Backup automático que estava causando problemas de segurança
  // REMOVIDO: Sistema de reset de emergency (não mais usado)

  // Buscar dados de portfolio (stake + orders) do backend
  useEffect(() => {
    // Verificação para evitar execução durante SSR
    if (typeof window === 'undefined') return;

    const fetchPortfolioData = async () => {
      try {
        setLoadingPortfolio(true);
        const response = await api.get('/api/portfolio/summary');
        if (response.data.success) {
          if (typeof window !== 'undefined' && window.console) {
            // console.log('📊 Portfolio data loaded:', {
            //   totalStake: response.data.data.totalStake,
            //   totalInOrders: response.data.data.totalInOrders,
            //   ordersCount: response.data.data.ordersBreakdown?.length || 0
            // });
          }
          setPortfolioData(response.data.data);
        }
      } catch (error) {
        if (typeof window !== 'undefined' && window.console) {
          console.error('Error fetching portfolio data:', error);
        }
        // Se falhar, usar valores padrão
        setPortfolioData({
          totalStake: '0',
          totalInOrders: 0,
          stakeBreakdown: [],
          ordersBreakdown: []
        });
      } finally {
        setLoadingPortfolio(false);
      }
    };

    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  // Carregar tokens do banco de dados filtrando pela rede atual
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const response = await tokenService.getTokens({ limit: 100 });
        if (response.success && response.data && response.data.tokens) {
          // Filtrar tokens pela rede atual do usuário
          const network = balances?.network || defaultNetwork;
          // ID do contract type para tokens ERC20
          const TOKEN_CONTRACT_TYPE_ID = 'cc350023-d9ba-4746-85f3-1590175a2328';

          const filteredTokens = response.data.tokens.filter(token => {
            const matchNetwork = token.network === network;
            const isToken = token.contractTypeId === TOKEN_CONTRACT_TYPE_ID;
            return matchNetwork && isToken;
          });

          setTokens(filteredTokens);
        }
      } catch (error) {
        console.error('Erro ao carregar tokens:', error);
      } finally {
        setLoadingTokens(false);
      }
    };

    loadTokens();
  }, [balances?.network, defaultNetwork]);

  // Buscar preços reais dos tokens (igual ao DigitalAssetsCard)
  useEffect(() => {
    const fetchPrices = async () => {
      if (tokens.length === 0) return;

      const symbols = [...new Set(tokens.map(t => t.metadata?.symbol).filter(Boolean))];
      const prices = await tokenPriceService.getMultipleTokenPrices(symbols);
      setTokenPrices(prices);
    };

    fetchPrices();
  }, [tokens]);

  // Usar formatação centralizada
  const formatCurrency = formatCurrencyHelper;

  // Mapeamento de tokens por categoria baseado no banco de dados (igual ao DigitalAssetsCard)
  const tokenCategories = useMemo(() => {
    const categoriesMap = {
      cryptocurrencies: [],
      startups: [],
      utility: [],
      digital: []
    };

    // Adicionar AZE/AZE-t como criptomoedas (moeda nativa da rede Azore)
    const azeSymbol = getCorrectAzeSymbol();
    categoriesMap.cryptocurrencies.push(azeSymbol);

    // Garantir que tokens é um array
    if (!Array.isArray(tokens)) {
      return categoriesMap;
    }

    tokens.forEach(token => {
      const symbol = token.metadata?.symbol || token.symbol;
      const category = token.metadata?.category || 'cryptocurrencies';

      // Pular cBRL (aparece em saldo disponível)
      if (symbol === 'cBRL') return;

      // Mapear categoria para formato do gráfico
      const categoryKey = category === 'criptomoedas' ? 'cryptocurrencies' : category;

      // Adicionar token à categoria correspondente
      if (categoriesMap[categoryKey]) {
        categoriesMap[categoryKey].push(symbol);
      }
    });

    return categoriesMap;
  }, [tokens, getCorrectAzeSymbol]);

  // Função para obter saudação baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  // Função para formatar nome para saudação (abreviar intermediários, ocultar nomes < 4 chars)
  const formatNameForGreeting = (fullName) => {
    if (!fullName) return 'Usuário';
    
    const names = fullName.trim().split(' ').filter(name => name.length > 0);
    if (names.length === 0) return 'Usuário';
    if (names.length === 1) return names[0];
    
    // Primeiro nome sempre aparece completo
    const result = [names[0]];
    
    // Processar nomes do meio (índices 1 até length-2)
    for (let i = 1; i < names.length - 1; i++) {
      const name = names[i];
      if (name.length >= 4) {
        // Abreviar nomes com 4+ caracteres (primeiro char + maiúsculo)
        result.push(name.charAt(0).toUpperCase());
      }
      // Nomes com menos de 4 caracteres são omitidos
    }
    
    // Último nome sempre aparece completo
    if (names.length > 1) {
      result.push(names[names.length - 1]);
    }
    
    return result.join(' ');
  };

  // Função para obter balance de um token (usar a do hook que já tem toda lógica)
  const getBalance = (symbol) => {
    const balance = getCachedBalance(symbol);
    return parseFloat(balance) || 0;
  };

  // Função para gerar tooltip do Total Investido (Stakes)
  const generateStakeTooltip = () => {
    if (!portfolioData || !portfolioData.stakeBreakdown || portfolioData.stakeBreakdown.length === 0) {
      return (
        <div className="p-2 min-w-48">
          <div className="text-xs text-gray-300">
            {t('portfolio.tooltips.noStakes')}
          </div>
        </div>
      );
    }

    // Agrupar stakes por token
    const stakesByToken = {};
    portfolioData.stakeBreakdown.forEach((stake) => {
      const tokenSymbol = stake.tokenSymbol || 'PCN';
      const balanceWei = parseFloat(stake.balance || 0);
      if (!stakesByToken[tokenSymbol]) {
        stakesByToken[tokenSymbol] = 0;
      }
      stakesByToken[tokenSymbol] += balanceWei;
    });

    // Calcular valor de cada token
    const tokensList = Object.entries(stakesByToken).map(([tokenSymbol, balanceWei]) => {
      const balanceEther = balanceWei / (10 ** 18);
      const price = tokenPrices[tokenSymbol] || getTokenPrice(tokenSymbol);
      const valueBRL = balanceEther * price;
      return {
        token: tokenSymbol,
        balance: balanceEther,
        price,
        valueBRL
      };
    });

    const totalValueBRL = tokensList.reduce((sum, token) => sum + token.valueBRL, 0);
    const totalTokensCount = Object.keys(stakesByToken).length;

    return (
      <div className="space-y-2 p-2 min-w-64">
        <div className="border-b border-gray-600 pb-2">
          <div className="font-semibold text-sm text-white">
            {t('portfolio.tooltips.stakeTitle')}
          </div>
          <div className="text-xs text-gray-300">
            {t(totalTokensCount === 1 ? 'portfolio.tooltips.stakeSubtitle' : 'portfolio.tooltips.stakeSubtitle_plural', { count: totalTokensCount })}
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tokensList.map((token, index) => (
            <div key={index} className="p-2 bg-gray-700/50 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium text-sm">{token.token}</span>
                <span className="text-green-400 text-xs font-semibold">{formatCurrency(token.valueBRL)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>{token.balance.toFixed(2)} × {formatCurrency(token.price)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-600">
          <span className="text-gray-300 font-medium">{t('portfolio.tooltips.totalValue')}</span>
          <span className="text-green-400 font-bold">{formatCurrency(totalValueBRL)}</span>
        </div>
      </div>
    );
  };

  // Função para gerar tooltip do Total em Ordem
  const generateOrdersTooltip = () => {
    if (!portfolioData || !portfolioData.ordersBreakdown || portfolioData.ordersBreakdown.length === 0) {
      return (
        <div className="p-2 min-w-48">
          <div className="text-xs text-gray-300">
            {t('portfolio.tooltips.noOrders')}
          </div>
        </div>
      );
    }

    // ordersBreakdown já vem agrupado por token do backend com totalBRL calculado
    const orders = portfolioData.ordersBreakdown;
    const totalValueBRL = orders.reduce((sum, order) => sum + parseFloat(order.totalBRL || 0), 0);

    return (
      <div className="space-y-2 p-2 min-w-64">
        <div className="border-b border-gray-600 pb-2">
          <div className="font-semibold text-sm text-white">
            {t('portfolio.tooltips.ordersTitle')}
          </div>
          <div className="text-xs text-gray-300">
            {t(orders.length === 1 ? 'portfolio.tooltips.ordersSubtitle' : 'portfolio.tooltips.ordersSubtitle_plural', { count: orders.length })}
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {orders.map((order, index) => {
            const tokenAmount = parseFloat(order.total || 0);
            const marketPrice = parseFloat(order.marketPrice || 0);
            const valueBRL = parseFloat(order.totalBRL || 0);

            return (
              <div key={index} className="p-2 bg-gray-700/50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{order.token}</span>
                  <span className="text-green-400 text-xs font-semibold">{formatCurrency(valueBRL)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>{tokenAmount.toFixed(8)} {order.token} × {formatCurrency(marketPrice)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-600">
          <span className="text-gray-300 font-medium">{t('portfolio.tooltips.totalValue')}</span>
          <span className="text-green-400 font-bold">{formatCurrency(totalValueBRL)}</span>
        </div>
      </div>
    );
  };

  // Calcular dados do portfólio com memoization baseado nos saldos reais
  const summaryData = useMemo(() => {
    if (!balances || !balances.balancesTable) {
      return {
        totalPortfolio: 0,
        availableBalance: 0,
        assetsBalance: 0,
        totalInvested: 0,
        totalInOrder: 0,
      };
    }

    const availableBalance = getBalance("cBRL"); // cBRL disponível

    // Calcular Saldo em Ativos (soma das 4 categorias de tokens em carteira)
    let assetsBalance = 0;
    Object.entries(tokenCategories).forEach(([, tokens]) => {
      tokens.forEach((symbol) => {
        const balance = getBalance(symbol);
        // Usar preço dinâmico (tokenPrices) com fallback para preço estático
        const price = tokenPrices[symbol] || getTokenPrice(symbol);
        const valueBRL = balance * price;
        assetsBalance += valueBRL;
      });
    });

    // Calcular Total Investido (stakes) agrupado por token
    let totalInvested = 0;
    const stakesByToken = {};

    if (portfolioData && portfolioData.stakeBreakdown && Array.isArray(portfolioData.stakeBreakdown)) {
      // Agrupar stakes por token
      portfolioData.stakeBreakdown.forEach((stake) => {
        try {
          const tokenSymbol = stake.tokenSymbol || 'PCN'; // Fallback para PCN
          const balanceWei = parseFloat(stake.balance || 0);

          if (!stakesByToken[tokenSymbol]) {
            stakesByToken[tokenSymbol] = 0;
          }
          stakesByToken[tokenSymbol] += balanceWei;
        } catch (e) {
          console.error('Error processing stake:', e, stake);
        }
      });

      // Calcular valor em BRL para cada token
      Object.entries(stakesByToken).forEach(([tokenSymbol, balanceWei]) => {
        const balanceEther = balanceWei / (10 ** 18);
        const price = tokenPrices[tokenSymbol] || getTokenPrice(tokenSymbol);
        const valueBRL = balanceEther * price;
        totalInvested += valueBRL;
      });
    }

    // Calcular Total em Ordem baseado em portfolioData.ordersBreakdown
    // O backend já retorna totalBRL calculado para cada token
    let totalInOrder = 0;
    if (portfolioData && portfolioData.ordersBreakdown && Array.isArray(portfolioData.ordersBreakdown)) {
      portfolioData.ordersBreakdown.forEach((order) => {
        try {
          // O backend já retorna o valor em BRL calculado com preço de mercado correto
          const valueBRL = parseFloat(order.totalBRL || 0);
          totalInOrder += valueBRL;
        } catch (e) {
          console.error('Error calculating order value:', e, order);
        }
      });
    }

    // Patrimônio Total = Saldo Disponível + Saldo em Ativos + Total Investido + Total em Ordem
    const totalPortfolio = availableBalance + assetsBalance + totalInvested + totalInOrder;

    return {
      totalPortfolio,
      availableBalance,
      assetsBalance,
      totalInvested,
      totalInOrder,
    };
  }, [balances?.balancesTable, portfolioData, tokenCategories, tokenPrices]);

  // Estado para controlar timeout do skeleton e dados carregados
  const [skeletonTimeout, setSkeletonTimeout] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [previousBalances, setPreviousBalances] = useState(null);

  // Timeout de 3 segundos para parar skeleton mesmo se API falhar
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonTimeout(true);
    }, 2500); // 2.5 segundos

    return () => clearTimeout(timer);
  }, []);

  // Marcar quando dados foram carregados pela primeira vez e detectar mudanças reais
  useEffect(() => {
    if (balances && balances.balancesTable) {
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
        setPreviousBalances(balances.balancesTable);
      } else {
        // Verificar se houve mudanças significativas nos saldos
        const currentBalances = balances.balancesTable;
        if (previousBalances) {
          let hasRealChanges = false;

          // Verificar todos os tokens atuais
          for (const [token, balance] of Object.entries(currentBalances)) {
            const prevBalance = previousBalances[token] || '0';
            const currentBalance = balance || '0';

            // Comparar com precisão de 6 casas decimais para evitar mudanças irrelevantes
            const prevFloat = parseFloat(prevBalance);
            const currentFloat = parseFloat(currentBalance);

            if (Math.abs(currentFloat - prevFloat) > 0.000001) {
              hasRealChanges = true;
              break;
            }
          }

          // Verificar se algum token foi removido
          for (const token of Object.keys(previousBalances)) {
            if (!currentBalances.hasOwnProperty(token)) {
              hasRealChanges = true;
              break;
            }
          }

          if (hasRealChanges) {
            setPreviousBalances(currentBalances);
          }
        } else {
          setPreviousBalances(currentBalances);
        }
      }
    }
  }, [balances?.balancesTable, hasLoadedOnce]);

  // Só mostrar skeleton se está carregando E não passou do timeout E não tem dados válidos E nunca carregou antes
  const isReallyLoading = loading && !skeletonTimeout && (!balances || !balances.balancesTable || balances.isEmergency) && !hasLoadedOnce;
  const isFirstLoad = isReallyLoading;

  if (isFirstLoad) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Aviso de API instável no topo */}
      {syncStatus?.status === 'error' && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
            <div className="flex-1">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                {t('apiWarning.title')}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 opacity-90">
                {syncStatus.fromCache
                  ? t('apiWarning.cacheMessage')
                  : t('apiWarning.connectingMessage')
                }
              </div>
            </div>
            {/* Indicator de sincronização */}
            {!syncStatus.fromCache && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-600 border-t-transparent"></div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 grid-cols-1 gap-6">
        {/* Seção de boas-vindas */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-4 items-center rtl:space-x-reverse">
            <div className="flex-none">
              <UserAvatar size="2xl" className="h-20 w-20" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-medium mb-2">
                <span className="block font-light">{getGreeting()},</span>
                <span className="block">{formatNameForGreeting(user?.name)}</span>
              </h4>
              <p className="text-sm dark:text-slate-300">{t('greeting.welcome')}</p>
            </div>
          </div>
        </div>

        {/* Seção do gráfico donut */}
        <div className="flex items-center justify-center">
          {isFirstLoad ? (
            <div className="animate-pulse">
              <div className="h-32 w-32 border-8 border-slate-200 dark:border-slate-700 rounded-full">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-1">
                    <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <PortfolioDonutChart />
          )}
        </div>
          {/* Seção esquerda - Patrimônio total */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center justify-center gap-2">
              {t('portfolio.yourPatrimony', { name: user?.name || "USUÁRIO" })}
              <SyncStatusIndicator syncStatus={syncStatus} />
            </div>
            {isFirstLoad ? (
              <div className="animate-pulse">
                <div className="h-8 w-40 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded mx-auto" />
              </div>
            ) : (
              <div className="text-2xl font-bold text-slate-900 dark:text-white balance">
                {formatCurrency(summaryData.totalPortfolio)}
              </div>
            )}
          </div>

          {/* Grid responsivo - 2x2 em telas pequenas e grandes, 1 coluna em telas médias */}
          <div className="grid grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2">
            {isFirstLoad ? (
              <>
                {/* Skeletons for all 4 cards */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                      <div className="h-6 w-24 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded mx-auto" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* Saldo disponível */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                    {t('portfolio.availableBalance')}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white balance">
                    {formatCurrency(summaryData.availableBalance)}
                  </div>
                </div>

                {/* Saldo em Ativos */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                    {t('portfolio.assetsBalance')}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white balance">
                    {formatCurrency(summaryData.assetsBalance)}
                  </div>
                </div>

                {/* Total investido */}
                <Tooltip
                  content={generateStakeTooltip()}
                  placement="top"
                  theme="dark"
                  allowHTML={true}
                  interactive={true}
                  maxWidth={320}
                  animation="shift-away"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 cursor-help">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('portfolio.totalInvested')}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white balance">
                      {formatCurrency(summaryData.totalInvested)}
                    </div>
                  </div>
                </Tooltip>

                {/* Total em ordem */}
                <Tooltip
                  content={generateOrdersTooltip()}
                  placement="top"
                  theme="dark"
                  allowHTML={true}
                  interactive={true}
                  maxWidth={320}
                  animation="shift-away"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 cursor-help">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                      {t('portfolio.totalInOrder')}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white balance">
                      {formatCurrency(summaryData.totalInOrder)}
                    </div>
                  </div>
                </Tooltip>
              </>
            )}
          </div>
          
      </div>
    </>
  );
};

export default PortfolioSummary;

"use client";
import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import useCachedBalances from "@/hooks/useCachedBalances";
import useConfig from "@/hooks/useConfig";
import { getTokenPrice, formatCurrency as formatCurrencyHelper } from "@/constants/tokenPrices";
import { BalanceDisplay } from "@/utils/balanceUtils";
import { tokenService } from "@/services/api";
import tokenPriceService from "@/services/tokenPriceService";
import { useTranslation } from "@/hooks/useTranslation";

const DigitalAssetsCard = () => {
  const { t } = useTranslation('dashboard');
  const [activeIndex, setActiveIndex] = useState(null);
  const { balances, loading, getBalance, getCorrectAzeSymbol } = useCachedBalances();
  const { defaultNetwork } = useConfig();
  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [tokenPrices, setTokenPrices] = useState({});

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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

          // console.log('Tokens carregados:', filteredTokens.map(t => ({
          //   symbol: t.metadata?.symbol,
          //   category: t.metadata?.category
          // })));

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

  // Mapeamento de tokens por categoria baseado no banco de dados
  const tokenCategories = useMemo(() => {
    const categoriesMap = {
      criptomoedas: [],
      startups: [],
      utility: [],
      digital: []
    };

    // Adicionar AZE/AZE-t como criptomoedas (moeda nativa da rede Azore)
    const azeSymbol = getCorrectAzeSymbol();
    categoriesMap.criptomoedas.push(azeSymbol);

    // Garantir que tokens é um array
    if (!Array.isArray(tokens)) {
      return categoriesMap;
    }

    tokens.forEach(token => {
      const symbol = token.metadata?.symbol || token.symbol;
      const category = token.metadata?.category || 'criptomoedas';

      // Pular cBRL (aparece em saldo disponível)
      if (symbol === 'cBRL') return;

      // Adicionar token à categoria correspondente
      if (categoriesMap[category]) {
        categoriesMap[category].push(symbol);
      }
    });

    return categoriesMap;
  }, [tokens, getCorrectAzeSymbol]);

  // Usar preços centralizados de @/constants/tokenPrices

  // Função para obter o nome correto do token baseado na rede
  const getTokenName = (symbol) => {
    if (symbol === 'AZE' || symbol === 'AZE-t') {
      const network = balances?.network || defaultNetwork;
      return network === 'testnet' ? 'Azore (testnet)' : 'Azore';
    }
    
    const tokenNames = {
      'cBRL': 'Coinage Real Brasil',
      'CNT': 'Coinage Trade',
      'MJD': 'Meu Jurídico Digital',
      'PCN': 'Pratique Coin',
      'STT': 'Simple Test Token'
    };
    
    return tokenNames[symbol] || symbol;
  };
  
  // Nomes das categorias
  const categoryNames = {
    criptomoedas: t('digitalAssets.categories.cryptocurrencies'),
    startups: t('digitalAssets.categories.startups'),
    utility: t('digitalAssets.categories.utility'),
    digital: t('digitalAssets.categories.digital')
  };


  // Usar formatação centralizada
  const formatCurrency = formatCurrencyHelper;

  // Buscar preços reais dos tokens
  useEffect(() => {
    const fetchPrices = async () => {
      if (tokens.length === 0) return;

      const symbols = [...new Set(tokens.map(t => t.metadata?.symbol).filter(Boolean))];
      const prices = await tokenPriceService.getMultipleTokenPrices(symbols);
      setTokenPrices(prices);
    };

    fetchPrices();
  }, [tokens]);

  // Função para calcular valor em BRL baseado no preço real do token
  const calculateValueBRL = (balance, symbol) => {
    const price = tokenPrices[symbol] || getTokenPrice(symbol); // Fallback para preço estático
    const value = parseFloat(balance) * price;
    return formatCurrency(value);
  };

  // Processar dados dos balances com memoization baseado nos saldos reais
  const assetCategories = useMemo(() => {
    if (!balances || !balances.balancesTable) return [];

    const categories = [];

    Object.entries(tokenCategories).forEach(([categoryKey, tokens]) => {
      const categoryData = {
        title: categoryNames[categoryKey],
        balance: "R$ 0,00",
        data: []
      };

      let totalValue = 0;

      tokens.forEach(symbol => {
        const balance = getBalance(symbol);
        const valueBRL = calculateValueBRL(balance, symbol);

        // Extrair valor numérico para cálculo do total usando preço real
        const price = tokenPrices[symbol] || getTokenPrice(symbol);
        const numericValue = parseFloat(balance) * price;
        totalValue += numericValue;

        categoryData.data.push({
          symbol: symbol,
          name: getTokenName(symbol),
          balance: balance, // Store raw balance for BalanceDisplay
          valueBRL: valueBRL
        });
      });

      // Atualizar saldo total da categoria
      categoryData.balance = formatCurrency(totalValue);

      // Adicionar categoria sempre, mesmo sem saldo
      categories.push(categoryData);
    });

    return categories;
  }, [balances?.balancesTable, tokenPrices]);

  // Estado para controlar timeout do skeleton e dados carregados
  const [skeletonTimeout, setSkeletonTimeout] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [previousBalances, setPreviousBalances] = useState(null);

  // Timeout de 3 segundos para parar skeleton mesmo se API falhar
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonTimeout(true);
    }, 2500);

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
  const shouldShowSkeleton = (loading || loadingTokens) && !skeletonTimeout && (!balances || !balances.balancesTable || balances.isEmergency) && !hasLoadedOnce;

  if (shouldShowSkeleton) {
    return (
      <Card title={t('digitalAssets.title')} subtitle={t('digitalAssets.subtitle')}>
        <div className="space-y-4">
          {/* Skeleton para categorias de ativos */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="h-3 w-8 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                  <div className="h-5 w-20 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={t('digitalAssets.title')}
      subtitle={t('digitalAssets.subtitle')}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {assetCategories.map((category, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                activeIndex === index
                  ? "border-primary-500 shadow-lg"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {/* Header do accordion */}
              <div
                className={`flex justify-between items-center p-4 cursor-pointer transition-colors duration-200 ${
                  activeIndex === index
                    ? "bg-primary-500 text-white"
                    : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                onClick={() => toggleAccordion(index)}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-lg transition-transform duration-200 ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <Icon icon="heroicons-outline:chevron-down" />
                  </span>
                  <span className="font-medium">{category.title}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm opacity-80">{t('digitalAssets.balance')}</span>
                  <span className="balance font-semibold">{category.balance}</span>
                </div>
              </div>

              {/* Conteúdo do accordion */}
              {activeIndex === index && (
                <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <div className="flex justify-center">
                              <Icon icon="heroicons-outline:currency-dollar" className="w-4 h-4" />
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('digitalAssets.table.symbol')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('digitalAssets.table.name')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('digitalAssets.table.available')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('digitalAssets.table.valueBRL')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                        {category.data.map((item, itemIndex) => (
                          <tr
                            key={itemIndex}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                                  <img 
                                    src={`/assets/images/currencies/${item.symbol}.png`} 
                                    alt={item.symbol} 
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center hidden">
                                    <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">
                                      {item.symbol.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                              {item.symbol}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                              <BalanceDisplay value={item.balance} symbol={item.symbol} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                              <Tooltip
                                content={`1 ${item.symbol} = ${formatCurrency(tokenPrices[item.symbol] || getTokenPrice(item.symbol))} cBRL`}
                                placement="top"
                                arrow
                              >
                                <span className="cursor-help underline decoration-dotted decoration-slate-400 dark:decoration-slate-500 underline-offset-2">
                                  {item.valueBRL}
                                </span>
                              </Tooltip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Espaçador para manter altura similar ao LastTransactions quando fechado */}
        {activeIndex === null && (
          <div className="responsive-spacer flex items-center justify-center">
            <style jsx>{`
              .responsive-spacer {
                min-height: 0px;
              }
              @media (min-width: 1024px) {
                .responsive-spacer {
                  min-height: 78px;
                }
              }
              @media (min-width: 1196px) {
                .responsive-spacer {
                  min-height: 64px;
                }
              }
              @media (min-width: 1280px) {
                .responsive-spacer {
                  min-height: 78px;
                }
              }
              @media (min-width: 1444px) {
                .responsive-spacer {
                  min-height: 64px;
                }
              }
              @media (min-width: 1834px) {
                .responsive-spacer {
                  min-height: 49px;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DigitalAssetsCard;

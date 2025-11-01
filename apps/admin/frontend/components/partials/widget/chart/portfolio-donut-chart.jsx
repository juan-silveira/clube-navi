"use client";
import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import useCachedBalances from "@/hooks/useCachedBalances";
import useConfig from "@/hooks/useConfig";
import { getTokenPrice, formatCurrency as formatCurrencyHelper } from "@/constants/tokenPrices";
import { tokenService } from "@/services/api";
import tokenPriceService from "@/services/tokenPriceService";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PortfolioDonutChart = () => {
  const { balances, loading, getCorrectAzeSymbol, getBalance: getCachedBalance } = useCachedBalances();
  const { defaultNetwork } = useConfig();
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [previousBalances, setPreviousBalances] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [tokenPrices, setTokenPrices] = useState({});

  // Usar formatação centralizada
  const formatCurrency = formatCurrencyHelper;

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

  // Detectar mudanças reais nos saldos
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

  // Nomes das categorias
  const categoryNames = {
    cryptocurrencies: "Criptomoedas",
    startups: "Startups",
    utility: "Utility Tokens",
    digital: "Renda Digital"
  };

  // Usar preços centralizados de @/constants/tokenPrices

  // Função para obter balance de um token (usar a do hook que já tem toda lógica)
  const getBalance = (symbol) => {
    const balance = getCachedBalance(symbol);
    return parseFloat(balance) || 0;
  };

  // Processamento dos dados do cache com memoization baseado nos saldos reais
  const chartData = useMemo(() => {
    if (!balances || !balances.balancesTable) {
      return {
        series: [1],
        labels: ['Sem dados'],
        colors: ['#E5E7EB'],
        totalValue: 0,
        isEmpty: true
      };
    }

    const series = [];
    const labels = [];
    const colors = [];

    // Mapeamento fixo de cores por categoria (igual à legenda)
    const colorMap = {
      'Saldo Disponível': '#3B82F6', // Azul
      'Criptomoedas': '#10B981',     // Verde
      'Startups': '#8B5CF6',         // Roxo
      'Utility Tokens': '#F59E0B',   // Laranja
      'Renda Digital': '#EF4444'     // Vermelho
    };

    let totalValue = 0;
    const availableBalance = getBalance('cBRL'); // cBRL disponível

    // Array para armazenar dados de cada categoria (sempre incluir todas)
    const categoryData = [];
    const chartIndexMap = {}; // Mapear categoria para índice no gráfico
    let chartIndex = 0;

    // Adicionar saldo disponível (cBRL) primeiro
    if (availableBalance > 0) {
      series.push(availableBalance);
      labels.push('Saldo Disponível');
      colors.push(colorMap['Saldo Disponível']);
      totalValue += availableBalance;
      chartIndexMap['Saldo Disponível'] = chartIndex;
      chartIndex++;
    }

    // Calcular cada categoria usando preços dinâmicos
    Object.entries(tokenCategories).forEach(([categoryKey, tokens]) => {
      let categoryTotal = 0;

      tokens.forEach(symbol => {
        const balance = getBalance(symbol);
        // Usar preço dinâmico (tokenPrices) com fallback para preço estático
        const price = tokenPrices[symbol] || getTokenPrice(symbol);
        const valueBRL = balance * price;
        categoryTotal += valueBRL;
      });

      const categoryName = categoryNames[categoryKey];

      categoryData.push({
        key: categoryKey,
        name: categoryName,
        value: categoryTotal,
        chartIndex: categoryTotal > 0 ? chartIndex : -1 // Índice no gráfico ou -1 se não está no gráfico
      });

      // Adicionar ao gráfico apenas se tiver valor > 0
      if (categoryTotal > 0) {
        series.push(categoryTotal);
        labels.push(categoryName);
        colors.push(colorMap[categoryName]);
        totalValue += categoryTotal;
        chartIndexMap[categoryName] = chartIndex;
        chartIndex++;
      }
    });

    // Se não há dados, criar gráfico placeholder
    if (series.length === 0) {
      return {
        series: [1], // Valor mínimo para mostrar o donut
        labels: ['Sem dados'],
        colors: ['#E5E7EB'], // Cinza claro
        totalValue: 0,
        isEmpty: true
      };
    }

    return {
      series,
      labels,
      colors: colors, // Usar o array de cores que montamos
      totalValue,
      isEmpty: false,
      allCategories: categoryData, // Incluir dados de todas as categorias
      availableBalance,
      chartIndexMap // Mapeamento de categoria para índice no gráfico
    };
  }, [balances?.balancesTable, tokenCategories, tokenPrices]);

  // Configuração do gráfico donut com memoization
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'donut',
      height: 180,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '85%', // Gráfico mais fino
          labels: {
            show: true,
            name: {
              show: false
            },
            value: {
              show: false
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              color: '#64748B',
              formatter: () => {
                return chartData.isEmpty ? 'R$ 0,00' : formatCurrency(chartData.totalValue);
              }
            }
          }
        },
        expandOnClick: false
      }
    },
    colors: chartData.colors.map((color, index) => {
      if (hoveredIndex === -1) return color; // Sem hover - cores normais
      if (hoveredIndex === index) return color; // Elemento com hover - cor normal
      return color + '40'; // Outros elementos - cor com opacidade reduzida
    }),
    labels: chartData.labels,
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false
    },
    tooltip: {
      enabled: !chartData.isEmpty,
      y: {
        formatter: function (value) {
          return formatCurrency(value);
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: 'none' // Desabilitar hover padrão do ApexCharts
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 140,
          width: 140
        }
      }
    }]
  }), [chartData, hoveredIndex]);

  // Só mostrar loading na primeira carga
  if (loading && !hasLoadedOnce) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }


  return (
    <div className="space-y-3">
      {/* Layout sempre lado a lado: Gráfico (esquerda) + Legenda (direita) */}
      <div className="flex flex-row items-stretch space-x-4">
        {/* Gráfico Donut - centralizado verticalmente */}
        <div className="flex justify-center items-center flex-none self-center">
          <div className="w-40 h-40 sm:w-36 sm:h-36 flex items-center justify-center">
            <Chart
              options={chartOptions}
              series={chartData.series}
              type="donut"
              height={160}
              width={160}
            />
          </div>
        </div>

        {/* Legenda - centralizada verticalmente */}
        <div className="space-y-2 flex-1 min-w-0 flex flex-col justify-center self-center">
        {chartData.isEmpty ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-4">
            <p className="text-sm font-medium">Nenhum ativo encontrado</p>
            <p className="text-xs">Seus investimentos aparecerão aqui</p>
          </div>
        ) : (
          <>
            {/* Saldo Disponível */}
            {chartData.availableBalance !== undefined && (
              <div 
                className={`flex items-center text-xs cursor-pointer p-1 rounded transition-colors duration-200 ${
                  hoveredIndex === (chartData.chartIndexMap?.['Saldo Disponível'] ?? -1) ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onMouseEnter={() => setHoveredIndex(chartData.chartIndexMap?.['Saldo Disponível'] ?? -1)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                  <span className="text-slate-600 dark:text-slate-400">Saldo Disponível</span>
                </div>
              </div>
            )}
            
            {/* Todas as categorias */}
            {chartData.allCategories && chartData.allCategories.map((category, index) => {
              const chartIndexForCategory = category.chartIndex;
              const colors = ['#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
              const isInChart = chartIndexForCategory !== -1;
              
              return (
                <div 
                  key={category.key} 
                  className={`flex items-center text-xs cursor-pointer p-1 rounded transition-colors duration-200 ${
                    hoveredIndex === chartIndexForCategory ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  } ${
                    !isInChart ? 'opacity-60' : ''
                  }`}
                  onMouseEnter={() => isInChart && setHoveredIndex(chartIndexForCategory)}
                  onMouseLeave={() => setHoveredIndex(-1)}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    <span className="text-slate-600 dark:text-slate-400">{category.name}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDonutChart;
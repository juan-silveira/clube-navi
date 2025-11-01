"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Card from '@/components/ui/Card';
import api from '@/services/api';
import useSharedPolling from '@/hooks/useSharedPolling';
import { useTranslation } from '@/hooks/useTranslation';

const OrderBook = ({ symbol, exchangeContract, onPriceClick, buyOrders, sellOrders }) => {
    const { t } = useTranslation('exchange');
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
    const [spread, setSpread] = useState({ value: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);
    const [depth, setDepth] = useState(15);
    const [aggregation, setAggregation] = useState(0.001);
    const [error, setError] = useState(null);
    const [lastPrice, setLastPrice] = useState(null);

    // Helper function to invert symbol display (e.g., cBRL/PCN → PCN/cBRL)
    const getInvertedSymbol = () => {
        if (!symbol || typeof symbol !== 'string') return symbol;
        const tokens = symbol.split('/');
        if (tokens.length === 2) {
            return `${tokens[1]}/${tokens[0]}`;
        }
        return symbol;
    };

    // Helper functions to get individual tokens
    const getTokenB = () => {
        // For inverted display PCN/cBRL, tokenB is the first part (PCN, CST)
        const inverted = getInvertedSymbol();
        if (!inverted || typeof inverted !== 'string') return '';
        const tokens = inverted.split('/');
        return tokens.length === 2 ? tokens[0] : '';
    };

    const getTokenA = () => {
        // For inverted display PCN/cBRL, tokenA is the second part (cBRL)
        const inverted = getInvertedSymbol();
        if (!inverted || typeof inverted !== 'string') return '';
        const tokens = inverted.split('/');
        return tokens.length === 2 ? tokens[1] : '';
    };

    // Função de fetch para polling compartilhado
    const fetchOrderBookData = async () => {
        if (!exchangeContract) return null;

        try {
            const response = await api.get(`/api/exchange/v2/orderbook/${exchangeContract}?depth=${depth}`);
            if (response.data.success) {
                return response.data.data || { bids: [], asks: [] };
            }
        } catch (error) {
            console.error('Erro no fetch do orderbook:', error);
        }
        return null;
    };

    // Hook de polling compartilhado (1 segundo para OrderBook)
    const pollingData = useSharedPolling(
        exchangeContract,
        fetchOrderBookData,
        !!exchangeContract && !buyOrders && !sellOrders, // Só usar polling se não tiver dados via props
        1000 // 1 segundo para atualizações mais rápidas do OrderBook
    );

    // Define fetchLastPrice function first
    const fetchLastPrice = async () => {
        if (!exchangeContract) return;

        try {
            // console.log('Fetching last price from:', `/api/exchange/v3/ticker/${exchangeContract}`);
            const response = await api.get(`/api/exchange/v3/ticker/${exchangeContract}`);
            // console.log('Last price response:', response.data);

            if (response.data.success && response.data.data?.lastPrice) {
                // console.log('Setting last price to:', response.data.data.lastPrice);
                setLastPrice(response.data.data.lastPrice);
            } else {
                // console.warn('No lastPrice found in response');
            }
        } catch (error) {
            console.error('Error fetching last price:', error);
        }
    };

    // Calcular spread e atualizar state quando dados mudam
    const calculateSpread = (data) => {
        if (data?.bids?.length > 0 && data?.asks?.length > 0) {
            const bestBid = parseFloat(data.bids[0].price);
            const bestAsk = parseFloat(data.asks[0].price);
            const spreadValue = bestAsk - bestBid;
            const spreadPct = bestAsk > 0 ? (spreadValue / bestAsk) * 100 : 0;

            setSpread({
                value: spreadValue.toFixed(4),
                percentage: spreadPct.toFixed(2)
            });
        }
    };

    // Usar dados das props se disponível
    useEffect(() => {
        if ((buyOrders && buyOrders.length > 0) || (sellOrders && sellOrders.length > 0)) {
            const data = {
                bids: buyOrders || [],
                asks: sellOrders || []
            };
            setOrderBook(data);
            calculateSpread(data);
            setLoading(false);
            fetchLastPrice();
        }
    }, [buyOrders, sellOrders]);

    // Usar dados do polling compartilhado
    useEffect(() => {
        if (pollingData && !buyOrders && !sellOrders) {
            setOrderBook(pollingData);
            calculateSpread(pollingData);
            setLoading(false);
        }
    }, [pollingData, buyOrders, sellOrders]);

    // Reset e fetch inicial quando o exchange contract mudar
    useEffect(() => {
        if (exchangeContract) {
            // Limpar dados anteriores
            setOrderBook({ bids: [], asks: [] });
            setSpread({ value: 0, percentage: 0 });
            setLastPrice(null);
            setLoading(true);

            // Buscar novo último preço
            fetchLastPrice();
        }
    }, [exchangeContract]);

    // Polling para último preço (a cada 10 segundos)
    useEffect(() => {
        if (!exchangeContract) return;

        const pollLastPrice = () => {
            fetchLastPrice();
        };

        const interval = setInterval(pollLastPrice, 10000); // 10 segundos

        return () => clearInterval(interval);
    }, [exchangeContract]);

    // Agregar ordens por nível de preço
    const aggregatedBook = useMemo(() => {
        if (aggregation === 0) return orderBook;

        const aggregateOrders = (orders, isAsk = false) => {
            const aggregated = {};

            orders.forEach(order => {
                const price = parseFloat(order.price);

                // Use a more precise aggregation logic
                let aggregatedPrice;
                if (aggregation === 0) {
                    // No aggregation - use exact price
                    aggregatedPrice = price;
                } else {
                    // Round to nearest aggregation level instead of floor
                    aggregatedPrice = Math.round(price / aggregation) * aggregation;
                }

                const key = aggregatedPrice.toFixed(4);

                if (!aggregated[key]) {
                    aggregated[key] = {
                        price: key,
                        amount: 0,
                        total: 0,
                        orderCount: 0,
                        orderId: order.orderId || order.blockchainOrderId,
                        blockchainOrderId: order.blockchainOrderId,
                        databaseId: order.databaseId,
                        userAddress: order.userAddress
                    };
                }

                aggregated[key].amount += parseFloat(order.amount || 0);
                aggregated[key].total += parseFloat(order.total || 0);
                aggregated[key].orderCount += (order.orderCount || 1);
            });

            const result = Object.values(aggregated).map(order => ({
                ...order,
                amount: order.amount.toFixed(2),
                total: order.total.toFixed(2)
            }));

            return isAsk
                ? result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                : result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        };

        return {
            bids: aggregateOrders(orderBook.bids),
            asks: aggregateOrders(orderBook.asks, true)
        };
    }, [orderBook, aggregation]);

    // Calcular totais cumulativos
    const bookWithCumulative = useMemo(() => {
        let bidsCumulative = 0;
        let asksCumulative = 0;
        let maxCumulative = 0;

        const bidsWithCum = aggregatedBook.bids.slice(0, depth).map(order => {
            bidsCumulative += parseFloat(order.total);
            maxCumulative = Math.max(maxCumulative, bidsCumulative);
            return { ...order, cumulative: bidsCumulative };
        });

        const asksWithCum = aggregatedBook.asks.slice(0, depth).map(order => {
            asksCumulative += parseFloat(order.total);
            maxCumulative = Math.max(maxCumulative, asksCumulative);
            return { ...order, cumulative: asksCumulative };
        });

        return {
            bids: bidsWithCum,
            asks: asksWithCum,
            maxCumulative
        };
    }, [aggregatedBook, depth]);

    const handlePriceClick = (price, side) => {
        if (onPriceClick) {
            onPriceClick(price, side);
        }
    };

    const OrderRow = ({ order, side, maxCumulative }) => {
        const percentage = (order.cumulative / maxCumulative) * 100;
        const bgClass = side === 'bid'
            ? 'bg-green-500 dark:bg-green-600'
            : 'bg-red-500 dark:bg-red-600';

        return (
            <tr
                className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer relative"
                onClick={() => handlePriceClick(order.price, side)}
            >
                <td className="relative">
                    <div
                        className={`absolute inset-0 ${bgClass} opacity-10`}
                        style={{ width: `${percentage}%` }}
                    />
                    <span className={`relative px-2 py-1 text-xs ${
                        side === 'bid' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                        {order.price}
                    </span>
                </td>
                <td className="px-2 py-1 text-xs text-right">{order.amount}</td>
                <td className="px-2 py-1 text-xs text-right text-gray-500 dark:text-gray-400">
                    {order.total}
                </td>
            </tr>
        );
    };

    return (
        <Card title="Order Book" noborder>
            <div className="p-4">
                {/* Header com controles */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold">{getInvertedSymbol()}</h3>
                    <div className="flex gap-2">
                        <select
                            value={aggregation}
                            onChange={(e) => setAggregation(parseFloat(e.target.value))}
                            className="text-xs px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value={0}>{t('orderBook.noAggregation')}</option>
                            <option value={0.001}>0.001</option>
                            <option value={0.01}>0.01</option>
                            <option value={0.1}>0.1</option>
                        </select>
                        <select
                            value={depth}
                            onChange={(e) => setDepth(parseInt(e.target.value))}
                            className="text-xs px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                {/* Spread */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded p-2 mb-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{t('orderBook.spread')}:</span>
                        <span>{spread.value} ({spread.percentage}%)</span>
                    </div>
                </div>

                {/* Cabeçalho da tabela */}
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <div className="flex justify-between px-2">
                        <span>{t('orderBook.price')}</span>
                        <span>{t('orderBook.quantity')} ({getTokenB()})</span>
                        <span>{t('orderBook.total')} ({getTokenA()})</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-500">{t('orderBook.loading')}</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="text-red-500 mb-2">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            {t('orderBook.tryAgain')}
                        </button>
                    </div>
                ) : bookWithCumulative.bids.length === 0 && bookWithCumulative.asks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-600 dark:text-gray-400 text-base font-semibold mb-2">
                            {t('orderBook.noActiveOrders')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                            {t('orderBook.createOrderPrompt')}
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Ordens de Venda (Asks) */}
                        <div className="mb-1">
                            <div className="text-xs text-red-500 dark:text-red-400 font-semibold mb-1 px-2">
                                {t('orderBook.sells')}
                            </div>
                            <table className="w-full">
                                <tbody>
                                    {bookWithCumulative.asks.slice().reverse().map((order, idx) => (
                                        <OrderRow
                                            key={`ask-${idx}`}
                                            order={order}
                                            side="ask"
                                            maxCumulative={bookWithCumulative.maxCumulative}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Último preço - separador mais destacado */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-y-2 border-blue-500/30 dark:border-blue-400/30 py-3 my-2">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('orderBook.lastPrice')}</span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {lastPrice ? `${parseFloat(lastPrice).toFixed(4)} ${getInvertedSymbol().split('/')[1]}` : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Ordens de Compra (Bids) */}
                        <div>
                            <div className="text-xs text-green-500 dark:text-green-400 font-semibold mb-1 px-2">
                                {t('orderBook.buys')}
                            </div>
                            <table className="w-full">
                                <tbody>
                                    {bookWithCumulative.bids.map((order, idx) => (
                                        <OrderRow
                                            key={`bid-${idx}`}
                                            order={order}
                                            side="bid"
                                            maxCumulative={bookWithCumulative.maxCumulative}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default OrderBook;
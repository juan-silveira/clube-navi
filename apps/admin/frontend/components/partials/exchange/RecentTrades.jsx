"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Card from '@/components/ui/Card';
import api from '@/services/api';
import useSharedPolling from '@/hooks/useSharedPolling';
import { useTranslation } from '@/hooks/useTranslation';

// Global fetch tracking to prevent multiple simultaneous fetches
const globalFetchTracker = new Map();

const RecentTrades = React.memo(({ symbol, exchangeContract }) => {
    const { t } = useTranslation('exchange');
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to invert symbol display (e.g., cBRL/PCN → PCN/cBRL)
    const getInvertedSymbol = (symbolToInvert = symbol) => {
        if (!symbolToInvert || typeof symbolToInvert !== 'string') return symbolToInvert || 'CST/cBRL';
        const tokens = symbolToInvert.split('/');
        if (tokens.length === 2) {
            return `${tokens[1]}/${tokens[0]}`;
        }
        return symbolToInvert;
    };

    // Função de fetch para polling compartilhado
    const fetchTradesData = async () => {
        if (!exchangeContract) return null;

        try {
            const response = await api.get(`/api/exchange/v3/trades/${exchangeContract}?limit=10`);
            if (response.data.success) {
                const tradesData = response.data.data || [];
                return tradesData.map(trade => ({
                    id: trade.id,
                    price: parseFloat(trade.price).toFixed(4),
                    amount: parseFloat(trade.amount).toFixed(2),
                    total: parseFloat(trade.total).toFixed(2),
                    side: trade.type,
                    time: new Date(trade.timestamp),
                    hash: trade.hash || null,
                    pair: trade.pair || 'CST/cBRL'
                }));
            }
        } catch (error) {
            console.error('Erro no fetch de trades:', error);
        }
        return null;
    };

    // Hook de polling compartilhado (2 segundos para trades)
    const pollingData = useSharedPolling(
        `trades_${exchangeContract}`,
        fetchTradesData,
        !!exchangeContract,
        2000 // 2 segundos para trades
    );

    // Track last trade ID to only update when new trades come in
    const lastTradeIdRef = useRef(null);

    // Atualizar trades com dados do polling compartilhado
    useEffect(() => {
        if (pollingData) {
            // Só atualizar se realmente mudou
            if (pollingData.length > 0) {
                const newFirstTradeId = pollingData[0].id;
                if (lastTradeIdRef.current !== newFirstTradeId) {
                    setTrades(pollingData);
                    setError(null);
                    lastTradeIdRef.current = newFirstTradeId;
                }
            } else {
                setTrades([]);
            }
            setLoading(false);
        }
    }, [pollingData]);

    // Loading inicial
    useEffect(() => {
        if (!symbol || !exchangeContract) {
            setLoading(false);
        }
    }, [symbol, exchangeContract]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <Card title={t('recentTrades.title')} noborder>
            <div className="p-4">
                {/* Header */}
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 px-2">
                    <div className="grid grid-cols-4 gap-2">
                        <span>{t('recentTrades.price')}</span>
                        <span className="text-right">{t('recentTrades.quantity')}</span>
                        <span className="text-right">{t('recentTrades.total')}</span>
                        <span className="text-right">{t('recentTrades.time')}</span>
                    </div>
                </div>

                {/* Trades List */}
                <div className="overflow-y-auto max-h-96">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-500">{t('recentTrades.loading')}</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="text-red-500 mb-2">{error}</div>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                {t('recentTrades.tryAgain')}
                            </button>
                        </div>
                    ) : trades.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-2">{t('recentTrades.noTrades')}</div>
                            <div className="text-xs text-gray-400">
                                {t('recentTrades.waitingForTrades', { symbol: getInvertedSymbol() })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {trades.map((trade, idx) => (
                                <div
                                    key={trade.id}
                                    className={`grid grid-cols-4 gap-2 px-2 py-1 rounded text-xs hover:bg-gray-50 dark:hover:bg-slate-700 ${
                                        idx === 0 ? 'animate-pulse bg-gray-50 dark:bg-slate-700' : ''
                                    }`}
                                    title={`Hash: ${trade.hash || 'N/A'} | Par: ${trade.pair || 'CST/cBRL'}`}
                                >
                                    {/* Preço */}
                                    <div className={`font-medium ${
                                        trade.side === 'buy'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {trade.price}
                                    </div>

                                    {/* Quantidade */}
                                    <div className="text-right">
                                        {trade.amount}
                                    </div>

                                    {/* Total */}
                                    <div className="text-right font-medium">
                                        {trade.total}
                                    </div>

                                    {/* Hora */}
                                    <div className="text-right text-gray-500 dark:text-gray-400">
                                        {formatTime(trade.time)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
});

RecentTrades.displayName = 'RecentTrades';

export default RecentTrades;
"use client";
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import api from '@/services/api';

const MarketOrderForm = ({
    symbol,
    exchangeContract,
    side, // 'buy' or 'sell'
    onOrderSubmit,
    userBalances = {}
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        slippage: '1.0', // 1% default slippage
        useSlippage: true
    });

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Debounce para quotes
    useEffect(() => {
        if (!formData.amount || !exchangeContract || parseFloat(formData.amount) <= 0) {
            setQuote(null);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchQuote();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.amount, side, exchangeContract]);

    const fetchQuote = async () => {
        if (!formData.amount || !symbol || !exchangeContract) return;

        setLoading(true);
        setError(null);

        try {
            // Buscar quote do backend
            const response = await api.post(`/api/exchange/quote/${symbol}`, {
                side,
                amount: formData.amount,
                contractAddress: exchangeContract.address
            });

            if (response.data.success) {
                setQuote(response.data.data);
            } else {
                setError(response.data.message || 'Erro ao obter cotação');
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quote || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            // Calcular slippage minimum
            const slippagePercent = formData.useSlippage ? parseFloat(formData.slippage) : 0;
            let minAmount = 0;

            if (side === 'buy') {
                // Para compra: minimum asset amount out (considerando slippage)
                minAmount = quote.assetOut * (100 - slippagePercent) / 100;
            } else {
                // Para venda: minimum cBRL amount out (considerando slippage)
                minAmount = quote.cbrlOut * (100 - slippagePercent) / 100;
            }

            const orderData = {
                side,
                amount: formData.amount,
                minAmountOut: minAmount.toString(),
                slippage: slippagePercent,
                orderIds: quote.orderIds,
                contractAddress: exchangeContract.address,
                quote
            };

            await onOrderSubmit(orderData);

            // Reset form
            setFormData({
                amount: '',
                slippage: '1.0',
                useSlippage: true
            });
            setQuote(null);

        } catch (error) {
            setError(error.message || 'Erro ao executar ordem');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMaxClick = () => {
        if (side === 'buy') {
            // Máximo de cBRL disponível
            const maxAmount = userBalances?.cBRL || 0;
            setFormData(prev => ({ ...prev, amount: maxAmount.toString() }));
        } else {
            // Máximo do token sendo vendido
            const tokenSymbol = symbol.split('/')[0]; // PCN/cBRL -> PCN
            const maxAmount = userBalances?.[tokenSymbol] || 0;
            setFormData(prev => ({ ...prev, amount: maxAmount.toString() }));
        }
    };

    const formatNumber = (num) => {
        if (num === 0 || !num) return '0';
        return parseFloat(num).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        });
    };

    const getTokenSymbols = () => {
        // O símbolo pode vir como cBRL/PCN e precisamos garantir que seja PCN/cBRL
        let base, quote;

        if (!symbol || typeof symbol !== 'string') {
            return side === 'buy'
                ? { paying: 'cBRL', receiving: 'TOKEN' }
                : { paying: 'TOKEN', receiving: 'cBRL' };
        }

        const tokens = symbol.split('/');
        if (tokens.length !== 2) {
            return side === 'buy'
                ? { paying: 'cBRL', receiving: symbol }
                : { paying: symbol, receiving: 'cBRL' };
        }

        // Se o primeiro token é cBRL, invertemos para ficar PCN/cBRL
        if (tokens[0] === 'cBRL') {
            base = tokens[1];  // PCN
            quote = tokens[0]; // cBRL
        } else {
            base = tokens[0];  // Já está correto (PCN)
            quote = tokens[1]; // cBRL
        }

        return side === 'buy'
            ? { paying: quote, receiving: base }  // Compra: paga cBRL, recebe PCN
            : { paying: base, receiving: quote };  // Venda: paga PCN, recebe cBRL
    };

    const tokens = getTokenSymbols();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
            <div className="flex items-center gap-2 mb-4">
                <Icon
                    icon={side === 'buy' ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'}
                    className={`w-5 h-5 ${side === 'buy' ? 'text-green-500' : 'text-red-500'}`}
                />
                <h3 className="text-lg font-semibold">
                    {side === 'buy' ? 'Compra' : 'Venda'} a Mercado
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Quantidade de {tokens.paying}
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                amount: e.target.value
                            }))}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                     bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="any"
                            min="0"
                        />
                        <button
                            type="button"
                            onClick={handleMaxClick}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1
                                     text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400
                                     rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                            MAX
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Disponível: {formatNumber(userBalances?.[tokens.paying] || 0)} {tokens.paying}
                    </div>
                </div>

                {/* Slippage Configuration */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Proteção de Slippage</label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.useSlippage}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    useSlippage: e.target.checked
                                }))}
                                className="rounded"
                            />
                            <span className="ml-2 text-sm">Ativar</span>
                        </label>
                    </div>

                    {formData.useSlippage && (
                        <div className="flex gap-2">
                            {['0.5', '1.0', '2.0'].map(percentage => (
                                <button
                                    key={percentage}
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        slippage: percentage
                                    }))}
                                    className={`px-3 py-1 text-sm rounded ${
                                        formData.slippage === percentage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {percentage}%
                                </button>
                            ))}
                            <input
                                type="number"
                                value={formData.slippage}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    slippage: e.target.value
                                }))}
                                className="flex-1 px-2 py-1 text-sm border rounded
                                         dark:bg-slate-700 dark:border-slate-600"
                                step="0.1"
                                min="0"
                                max="50"
                                placeholder="Custom %"
                            />
                        </div>
                    )}
                </div>

                {/* Quote Display */}
                {loading && (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Calculando cotação...
                            </span>
                        </div>
                    </div>
                )}

                {quote && !loading && (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 space-y-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Resumo da Operação
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Você receberá:</span>
                                <span className="font-medium">
                                    {formatNumber(side === 'buy' ? quote.assetOut : quote.cbrlOut)} {tokens.receiving}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Preço médio:</span>
                                <span>{formatNumber(quote.averagePrice)} cBRL</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Impacto no preço:</span>
                                <span className={quote.priceImpact > 5 ? 'text-orange-500' : ''}>
                                    {(quote.priceImpact / 100).toFixed(2)}%
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Taxa estimada:</span>
                                <span>{formatNumber(quote.estimatedFee)} cBRL</span>
                            </div>

                            {formData.useSlippage && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Mínimo esperado:</span>
                                    <span className="text-green-600 dark:text-green-400">
                                        {formatNumber(
                                            (side === 'buy' ? quote.assetOut : quote.cbrlOut) *
                                            (100 - parseFloat(formData.slippage)) / 100
                                        )} {tokens.receiving}
                                    </span>
                                </div>
                            )}
                        </div>

                        {quote.priceImpact > 10 && (
                            <div className="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-800 rounded p-2">
                                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                                    <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4" />
                                    <span className="text-xs">
                                        Alto impacto no preço ({(quote.priceImpact / 100).toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                            <Icon icon="heroicons:exclamation-circle" className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={!quote || loading || submitting || !formData.amount}
                    className={`w-full ${
                        side === 'buy'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {submitting ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Executando...
                        </div>
                    ) : (
                        `${side === 'buy' ? 'Comprar' : 'Vender'} a Mercado`
                    )}
                </Button>
            </form>
        </div>
    );
};

export default MarketOrderForm;
"use client";
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import api from '@/services/api';

const SimpleMarketForm = ({
    symbol,
    exchangeContract,
    side, // 'buy' or 'sell'
    onOrderSubmit,
    userBalances = {},
    availableTokens = [],
    onTokenChange
}) => {
    const [formData, setFormData] = useState({
        payAmount: '',
        receiveAmount: '',
        slippage: '1.0',
        useSlippage: true
    });

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showPayTokenDropdown, setShowPayTokenDropdown] = useState(false);
    const [showReceiveTokenDropdown, setShowReceiveTokenDropdown] = useState(false);

    // Debounce para quotes
    useEffect(() => {
        if (!formData.payAmount || !exchangeContract || parseFloat(formData.payAmount) <= 0) {
            setQuote(null);
            setFormData(prev => ({ ...prev, receiveAmount: '' }));
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchQuote();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.payAmount, side, exchangeContract]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.token-dropdown')) {
                setShowPayTokenDropdown(false);
                setShowReceiveTokenDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchQuote = async () => {
        if (!formData.payAmount || !symbol || !exchangeContract) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.post(`/api/exchange/quote/${symbol}`, {
                side,
                amount: formData.payAmount,
                contractAddress: exchangeContract.address
            });

            if (response.data.success) {
                setQuote(response.data.data);
                const receiveAmount = side === 'buy' ? response.data.data.assetOut : response.data.data.cbrlOut;
                setFormData(prev => ({ ...prev, receiveAmount: receiveAmount.toString() }));
            } else {
                setError(response.data.message || 'Erro ao obter cotação');
                setFormData(prev => ({ ...prev, receiveAmount: '' }));
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            setError('Erro ao conectar com o servidor');
            setFormData(prev => ({ ...prev, receiveAmount: '' }));
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
            const slippagePercent = formData.useSlippage ? parseFloat(formData.slippage) : 0;
            let minAmount = 0;

            if (side === 'buy') {
                minAmount = quote.assetOut * (100 - slippagePercent) / 100;
            } else {
                minAmount = quote.cbrlOut * (100 - slippagePercent) / 100;
            }

            const orderData = {
                side,
                amount: formData.payAmount,
                minAmountOut: minAmount.toString(),
                slippage: slippagePercent,
                orderIds: quote.orderIds,
                contractAddress: exchangeContract.address,
                quote
            };

            await onOrderSubmit(orderData);

            // Reset form
            setFormData({
                payAmount: '',
                receiveAmount: '',
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
        const tokenSymbol = getTokenSymbols().paying;
        const maxAmount = userBalances?.[tokenSymbol] || 0;
        setFormData(prev => ({ ...prev, payAmount: maxAmount.toString() }));
    };

    const formatNumber = (num) => {
        if (num === 0 || !num) return '0';
        return parseFloat(num).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        });
    };

    const getTokenSymbols = () => {
        const [base, quote] = symbol.split('/');
        return side === 'buy'
            ? { paying: quote, receiving: base }
            : { paying: base, receiving: quote };
    };

    const tokens = getTokenSymbols();

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-600">
            {/* Header */}
            <div className="flex border-b border-slate-600">
                <button
                    type="button"
                    className={`flex-1 py-3 px-4 font-medium transition-colors ${
                        side === 'buy'
                            ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                    disabled={side === 'buy'}
                >
                    Comprar
                </button>
                <button
                    type="button"
                    className={`flex-1 py-3 px-4 font-medium transition-colors ${
                        side === 'sell'
                            ? 'bg-red-600 text-white border-b-2 border-red-400'
                            : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                    disabled={side === 'sell'}
                >
                    Vender
                </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <h3 className={`text-xl font-bold text-center ${
                        side === 'buy' ? 'text-blue-400' : 'text-red-400'
                    }`}>
                        {side === 'buy' ? 'COMPRAR' : 'VENDER'}
                    </h3>

                    {/* Pay Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Pagar
                        </label>
                        <div className="relative bg-slate-700 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-center justify-between mb-2">
                                <input
                                    type="number"
                                    value={formData.payAmount}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        payAmount: e.target.value
                                    }))}
                                    placeholder="0"
                                    className="bg-transparent text-2xl font-bold text-white placeholder-gray-500 border-0 outline-0 w-full"
                                    step="any"
                                    min="0"
                                />
                                <button
                                    type="button"
                                    onClick={handleMaxClick}
                                    className="ml-2 px-3 py-1 bg-yellow-500 text-black text-sm font-medium rounded-full hover:bg-yellow-400 transition-colors"
                                >
                                    Máx
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">
                                    Disponível: {formatNumber(userBalances?.[tokens.paying] || 0)} {tokens.paying}
                                </span>
                                <div className="relative token-dropdown">
                                    <button
                                        type="button"
                                        onClick={() => setShowPayTokenDropdown(!showPayTokenDropdown)}
                                        className="flex items-center gap-2 hover:bg-slate-600 px-2 py-1 rounded transition-colors"
                                    >
                                        <Icon icon="heroicons:currency-dollar" className="w-4 h-4 text-yellow-500" />
                                        <span className="text-white font-medium">{tokens.paying}</span>
                                        <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {showPayTokenDropdown && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50">
                                            {availableTokens.map((token) => (
                                                <button
                                                    key={token.address}
                                                    type="button"
                                                    onClick={() => {
                                                        onTokenChange(side === 'buy' ? 'base' : 'quote', token);
                                                        setShowPayTokenDropdown(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors text-left"
                                                >
                                                    <Icon icon="heroicons:currency-dollar" className="w-5 h-5 text-yellow-500" />
                                                    <div>
                                                        <div className="text-white font-medium">{token.symbol}</div>
                                                        <div className="text-gray-400 text-xs">{token.name}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receive Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Receber
                        </label>
                        <div className="relative bg-slate-700 rounded-lg p-4 border border-slate-600">
                            <div className="flex items-center justify-between mb-2">
                                <input
                                    type="text"
                                    value={loading ? 'Calculando...' : formData.receiveAmount}
                                    readOnly
                                    placeholder="0.00000000"
                                    className="bg-transparent text-2xl font-bold text-white placeholder-gray-500 border-0 outline-0 w-full"
                                />
                            </div>
                            <div className="flex items-center justify-end">
                                <div className="relative token-dropdown">
                                    <button
                                        type="button"
                                        onClick={() => setShowReceiveTokenDropdown(!showReceiveTokenDropdown)}
                                        className="flex items-center gap-2 hover:bg-slate-600 px-2 py-1 rounded transition-colors"
                                    >
                                        <Icon icon="heroicons:currency-dollar" className="w-4 h-4 text-yellow-500" />
                                        <span className="text-white font-medium">{tokens.receiving}</span>
                                        <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {showReceiveTokenDropdown && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50">
                                            {availableTokens.map((token) => (
                                                <button
                                                    key={token.address}
                                                    type="button"
                                                    onClick={() => {
                                                        onTokenChange(side === 'buy' ? 'quote' : 'base', token);
                                                        setShowReceiveTokenDropdown(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors text-left"
                                                >
                                                    <Icon icon="heroicons:currency-dollar" className="w-5 h-5 text-yellow-500" />
                                                    <div>
                                                        <div className="text-white font-medium">{token.symbol}</div>
                                                        <div className="text-gray-400 text-xs">{token.name}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slippage Settings */}
                    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-300">Proteção de Slippage</label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.useSlippage}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        useSlippage: e.target.checked
                                    }))}
                                    className="rounded bg-slate-600 border-slate-500 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-300">Ativar</span>
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
                                        className={`px-3 py-1 text-sm rounded transition-colors ${
                                            formData.slippage === percentage
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
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
                                    className="flex-1 px-2 py-1 text-sm rounded bg-slate-600 border-slate-500 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                                    step="0.1"
                                    min="0"
                                    max="50"
                                    placeholder="Custom %"
                                />
                            </div>
                        )}

                        {quote && formData.useSlippage && (
                            <div className="mt-3 text-xs text-gray-400">
                                Mínimo esperado: {formatNumber(
                                    (side === 'buy' ? quote.assetOut : quote.cbrlOut) *
                                    (100 - parseFloat(formData.slippage)) / 100
                                )} {tokens.receiving}
                            </div>
                        )}
                    </div>

                    {/* Quote Summary */}
                    {quote && !loading && (
                        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                            <div className="text-sm text-gray-300 space-y-2">
                                <div className="flex justify-between">
                                    <span>Preço médio:</span>
                                    <span className="text-white">{formatNumber(quote.averagePrice)} cBRL</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Impacto no preço:</span>
                                    <span className={quote.priceImpact > 5 ? 'text-orange-400' : 'text-white'}>
                                        {(quote.priceImpact / 100).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxa estimada:</span>
                                    <span className="text-white">{formatNumber(quote.estimatedFee)} cBRL</span>
                                </div>
                            </div>

                            {quote.priceImpact > 10 && (
                                <div className="mt-3 p-2 bg-orange-900/20 border border-orange-800 rounded">
                                    <div className="flex items-center gap-2 text-orange-200">
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
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-red-200">
                                <Icon icon="heroicons:exclamation-circle" className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={!quote || loading || submitting || !formData.payAmount}
                        className={`w-full py-4 text-lg font-bold rounded-lg transition-colors ${
                            side === 'buy'
                                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400'
                                : 'bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:text-slate-400'
                        }`}
                    >
                        {submitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Executando...
                            </div>
                        ) : (
                            `${side === 'buy' ? 'Comprar' : 'Vender'} ${tokens.receiving}`
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default SimpleMarketForm;
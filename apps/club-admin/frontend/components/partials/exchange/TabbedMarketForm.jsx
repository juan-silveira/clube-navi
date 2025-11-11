"use client";
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Tooltip from '@/components/ui/Tooltip';
import api from '@/services/api';
import { useBranding } from '@/hooks/useBranding';
import { useTranslation } from '@/hooks/useTranslation';

const TabbedMarketForm = ({
    availableTokens = [],
    userBalances = {},
    onOrderSubmit,
    selectedExchange,
    onTokenChange,
    selectedTokenA,
    selectedTokenB,
    tokensInitialized = false,
    user
}) => {
    const { t } = useTranslation('exchange');
    const { getPrimaryColor } = useBranding();
    const primaryColor = getPrimaryColor();

    // Helper function to get token symbol from metadata or direct property
    const getTokenSymbol = (token) => {
        if (!token) return '';

        // First try to get from metadata
        if (token.metadata) {
            try {
                const metadata = typeof token.metadata === 'string'
                    ? JSON.parse(token.metadata)
                    : token.metadata;
                if (metadata.symbol) return metadata.symbol;
            } catch (e) {
                // console.warn('Error parsing token metadata:', e);
            }
        }

        // Fallback to direct symbol property
        return token.symbol || '';
    };

    const [formData, setFormData] = useState({
        payAmount: '',
        receiveAmount: '',
        slippage: '1.0',
        useSlippage: false
    });

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showPayTokenDropdown, setShowPayTokenDropdown] = useState(false);
    const [showReceiveTokenDropdown, setShowReceiveTokenDropdown] = useState(false);
    const [quoteInterval, setQuoteInterval] = useState(null);
    const [timeUntilRefresh, setTimeUntilRefresh] = useState(5);

    // Tokens are already pre-filtered from the API call
    const filteredTokens = availableTokens;

    // Auto-select tokens for initial state
    // Use a ref to track if auto-select has already run
    const hasAutoSelected = React.useRef(false);
    const prevTokensInitialized = React.useRef(tokensInitialized);

    useEffect(() => {
        // Se tokensInitialized mudou para true, marcar que já selecionamos
        if (tokensInitialized && !prevTokensInitialized.current) {
            hasAutoSelected.current = true;
        }
        prevTokensInitialized.current = tokensInitialized;
    }, [tokensInitialized]);

    useEffect(() => {
        // IMPORTANTE: Não fazer auto-select se tokens já foram inicializados pela URL
        if (tokensInitialized) {
            return;
        }

        // Também não executar se já rodou antes
        if (hasAutoSelected.current) {
            return;
        }

        if (filteredTokens.length > 0 && onTokenChange) {
            // Only auto-select if we don't have BOTH tokens selected
            // This allows URL parameters to work properly
            if (!selectedTokenA && !selectedTokenB) {
                const cbrl = filteredTokens.find(t =>
                    getTokenSymbol(t) === 'cBRL' || getTokenSymbol(t).toLowerCase().includes('cbrl')
                );
                const pcn = filteredTokens.find(t =>
                    getTokenSymbol(t) === 'PCN' || getTokenSymbol(t).toLowerCase().includes('pcn')
                );

                if (cbrl) {
                    onTokenChange('base', cbrl);
                }
                if (pcn) {
                    onTokenChange('quote', pcn);
                }
                hasAutoSelected.current = true;
            }
        }
    }, [filteredTokens, selectedTokenA, selectedTokenB, onTokenChange, tokensInitialized]);

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

    // Determine operation type based on the exchange metadata and user's token selection
    const getOperationType = () => {
        if (!selectedExchange || !selectedTokenA || !selectedTokenB) return 'buy';

        const tokenASymbol = getTokenSymbol(selectedTokenA);
        const tokenBSymbol = getTokenSymbol(selectedTokenB);

        // With the new API, tokenA and tokenB are already parsed objects
        const exchangeTokenASymbol = selectedExchange.tokenA?.symbol;
        const exchangeTokenBSymbol = selectedExchange.tokenB?.symbol;

        // If user's tokenA matches exchange's tokenA (cBRL), it's a buy
        // If user's tokenA matches exchange's tokenB (PCN), it's a sell
        if (tokenASymbol === exchangeTokenASymbol && tokenBSymbol === exchangeTokenBSymbol) {
            // User order matches exchange order: cBRL -> PCN = buy
            return 'buy';
        } else if (tokenASymbol === exchangeTokenBSymbol && tokenBSymbol === exchangeTokenASymbol) {
            // User order is reversed: PCN -> cBRL = sell
            return 'sell';
        }

        // Default to buy if we can't determine
        return 'buy';
    };

    const operationType = getOperationType();
    const isBuyOperation = operationType === 'buy';

    // Auto-refresh quote every 5 seconds for market orders
    useEffect(() => {
        if (!formData.payAmount || !selectedTokenA || !selectedTokenB || parseFloat(formData.payAmount) <= 0) {
            setQuote(null);
            setFormData(prev => ({ ...prev, receiveAmount: '' }));
            if (quoteInterval) {
                clearInterval(quoteInterval);
                setQuoteInterval(null);
            }
            setTimeUntilRefresh(5);
            return;
        }

        // Fetch quote immediately
        fetchMarketQuote();

        // Setup auto-refresh every 5 seconds
        const refreshInterval = setInterval(() => {
            fetchMarketQuote();
            setTimeUntilRefresh(5);
        }, 5000);

        setQuoteInterval(refreshInterval);

        // Setup countdown timer
        const countdownInterval = setInterval(() => {
            setTimeUntilRefresh(prev => {
                if (prev <= 1) return 5;
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [formData.payAmount, selectedTokenA, selectedTokenB, operationType]);

    const fetchMarketQuote = async () => {
        if (!formData.payAmount || !selectedTokenA || !selectedTokenB || !selectedExchange) return;

        setLoading(true);
        setError(null);

        try {
            // Use the new market quote endpoints
            const endpoint = isBuyOperation
                ? '/api/exchange/v2/market/buy/quote'
                : '/api/exchange/v2/market/sell/quote';

            // Get user's wallet address for filtering out their own orders
            const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

            // Get slippage (use default 2% if not set)
            const slippageToUse = formData.useSlippage ? parseFloat(formData.slippage) : 2;

            const response = await api.post(endpoint, {
                contractAddress: selectedExchange.address,
                amount: formData.payAmount,
                userAddress: userAddress, // Pass user address to exclude their own orders
                slippage: slippageToUse // Pass slippage for minAmountOut calculation
            });

            if (response.data.success) {
                const marketQuote = response.data.data;
                setQuote(marketQuote);

                // Handle insufficient liquidity case
                if (marketQuote.insufficientLiquidity) {
                    setError(t('swapForm.insufficientLiquidity', { amount: marketQuote.availableAmount }));
                    // DO NOT automatically adjust the user's input amount
                    // Keep their original input and show the error
                    setFormData(prev => ({
                        ...prev,
                        receiveAmount: ''
                    }));
                    return; // Don't proceed with receive amount calculation
                } else {
                    setError(null); // Clear any previous errors
                }

                // Calculate receive amount based on operation type
                let receiveAmount;
                if (isBuyOperation) {
                    // When buying, we receive the tokens (PCN)
                    receiveAmount = marketQuote.amount;
                } else {
                    // When selling, we receive cBRL (amount field contains the revenue)
                    receiveAmount = marketQuote.amount;
                }

                // Validar se receiveAmount existe antes de converter para string
                if (receiveAmount !== undefined && receiveAmount !== null) {
                    setFormData(prev => ({ ...prev, receiveAmount: receiveAmount.toString() }));
                } else {
                    console.error('❌ receiveAmount is undefined. marketQuote:', marketQuote);
                    setError(t('swapForm.errorCalculating'));
                    setFormData(prev => ({ ...prev, receiveAmount: '' }));
                }
            } else {
                setError(response.data.message || t('swapForm.errorGettingQuote'));
                setFormData(prev => ({ ...prev, receiveAmount: '' }));
                setQuote(null);
            }
        } catch (error) {
            console.error('Error fetching market quote:', error);
            if (error.response?.data?.message?.includes('No sell orders available') ||
                error.response?.data?.message?.includes('No buy orders available')) {
                setError(t('swapForm.noOrdersAvailable'));
            } else if (error.response?.data?.message?.includes('Insufficient liquidity')) {
                setError(error.response.data.message);
            } else {
                setError(t('swapForm.errorConnecting'));
            }
            setFormData(prev => ({ ...prev, receiveAmount: '' }));
            setQuote(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quote || submitting || !selectedExchange) return;

        setSubmitting(true);
        setError(null);

        try {
            const slippagePercent = formData.useSlippage ? parseFloat(formData.slippage) : 0;
            let minAmountOut = 0;

            if (isBuyOperation) {
                // For buying, minimum amount is based on expected tokens to receive, not amount paid
                // If no slippage configured, use 2% default
                const slippageToUse = slippagePercent || 2;
                const expectedTokens = quote.totalTokens || parseFloat(formData.receiveAmount);
                minAmountOut = expectedTokens * (100 - slippageToUse) / 100;
            } else {
                // For selling, minimum amount is the cBRL we receive
                // quote.amount contains the cBRL revenue for SELL operations
                const expectedRevenue = quote.amount || parseFloat(formData.receiveAmount);
                const slippageToUse = slippagePercent || 2;
                minAmountOut = expectedRevenue * (100 - slippageToUse) / 100;
            }

            const orderData = {
                side: operationType,
                amount: formData.payAmount,
                minAmountOut: minAmountOut.toString(),
                slippage: slippagePercent,
                orderIds: quote.orderIds,
                contractAddress: selectedExchange.address,
                isMarketOrder: true,
                quote
            };

            await onOrderSubmit(orderData);

            // Clear quote interval
            if (quoteInterval) {
                clearInterval(quoteInterval);
                setQuoteInterval(null);
            }

            // Reset form to initial state
            setFormData({
                payAmount: '',
                receiveAmount: '',
                slippage: '1.0',
                useSlippage: false
            });
            setQuote(null);
            setTimeUntilRefresh(5);

        } catch (error) {
            setError(error.message || t('swapForm.errorExecuting'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleMaxClick = () => {
        const tokenSymbol = getTokenSymbol(getPayingToken());
        const maxAmount = userBalances?.[tokenSymbol] || 0;
        setFormData(prev => ({ ...prev, payAmount: maxAmount.toString() }));
    };

    const handleTokenSelect = (type, token) => {
        if (onTokenChange) {
            if (type === 'pay') {
                // Se selecionar o mesmo token que está no campo de receber, fazer SWAP
                const isSelectingSameAsBottom = token.address === selectedTokenB?.address;

                if (isSelectingSameAsBottom) {
                    // SWAP: Trocar os tokens (passando isManualSwap = true)
                    onTokenChange('base', token, true);
                    setTimeout(() => {
                        onTokenChange('quote', selectedTokenA, true);
                    }, 50);
                } else {
                    // Normal selection for top dropdown (passando isManualSwap = true)
                    onTokenChange('base', token, true);
                }
            } else {
                // Se selecionar o mesmo token que está no campo de pagar, fazer SWAP
                const isSelectingSameAsTop = token.address === selectedTokenA?.address;

                if (isSelectingSameAsTop) {
                    // SWAP: Trocar os tokens (passando isManualSwap = true)
                    onTokenChange('quote', token, true);
                    setTimeout(() => {
                        onTokenChange('base', selectedTokenB, true);
                    }, 50);
                } else {
                    // Normal selection for bottom dropdown (passando isManualSwap = true)
                    onTokenChange('quote', token, true);
                }
            }
        }

        setShowPayTokenDropdown(false);
        setShowReceiveTokenDropdown(false);
        setFormData(prev => ({ ...prev, payAmount: '', receiveAmount: '' }));
        setQuote(null);
    };

    const getPayingToken = () => {
        return selectedTokenA; // Always paying with tokenA
    };

    const getReceivingToken = () => {
        return selectedTokenB; // Always receiving tokenB
    };

    const formatNumber = (num) => {
        if (num === 0 || !num) return '0';
        return parseFloat(num).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        });
    };

    const getTokenLogo = (token) => {
        if (!token) return `/assets/images/currencies/DEFAULT.png`;
        const symbol = getTokenSymbol(token);
        return `/assets/images/currencies/${symbol}.png`;
    };

    const hasValidExchange = selectedTokenA && selectedTokenB && selectedExchange;
    const noExchangeFound = selectedTokenA && selectedTokenB && !selectedExchange;

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-600 max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-600">
                <h3 className="text-lg font-semibold text-white">{t('swapForm.title')}</h3>
                <button type="button" className="text-gray-400 hover:text-white">
                    <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
                </button>
            </div>

            {/* Form Content */}
            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-3">

                    {/* Pay Section */}
                    <div className="bg-slate-700 rounded-2xl p-4 relative">
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                className="flex items-center gap-2 text-white hover:text-gray-300 font-medium w-full"
                                onClick={() => {
                                    // console.log('Pay dropdown clicked, current state:', showPayTokenDropdown);
                                    setShowPayTokenDropdown(!showPayTokenDropdown);
                                }}
                            >
                                <img
                                    src={getPayingToken() ? getTokenLogo(getPayingToken()) : (filteredTokens.length > 0 ? getTokenLogo(filteredTokens[0]) : '/assets/images/currencies/DEFAULT.png')}
                                    alt={getTokenSymbol(getPayingToken()) || (filteredTokens.length > 0 ? getTokenSymbol(filteredTokens[0]) : 'Token')}
                                    className="w-6 h-6"
                                    onError={(e) => {
                                        e.target.src = '/assets/images/currencies/DEFAULT.png';
                                    }}
                                />
                                <span className="mr-1">{getTokenSymbol(getPayingToken()) || (filteredTokens.length > 0 ? getTokenSymbol(filteredTokens[0]) : 'Selecione')}</span>
                                <Icon icon="heroicons:chevron-down" className="w-4 h-4" />
                            </button>
                            <input
                                type="text"
                                className="text-right text-2xl font-bold bg-transparent border-0 outline-0 text-white placeholder-gray-400 w-32"
                                placeholder="100"
                                value={formData.payAmount}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    payAmount: e.target.value
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-400">
                                <Icon icon="heroicons:wallet" className="w-4 h-4" />
                                <span>{getTokenSymbol(getPayingToken()) || 'Token'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <span>{formatNumber(userBalances?.[getTokenSymbol(getPayingToken())] || 0)}</span>
                                {userBalances?.[getTokenSymbol(getPayingToken())] > 0 && (
                                    <button
                                        type="button"
                                        className="text-xs font-medium hover:opacity-80"
                                        style={{ color: primaryColor }}
                                        onClick={handleMaxClick}
                                    >
                                        {t('swapForm.max')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Pay Currency Dropdown */}
                        {showPayTokenDropdown && (
                            <div className="token-dropdown absolute top-full left-0 right-0 mt-1 bg-slate-800 shadow-lg rounded-lg border border-slate-600 z-30 max-h-60 overflow-y-auto">
                                <ul className="py-2">
                                    {filteredTokens.length > 0 ? filteredTokens
                                        .map((token) => (
                                        <li
                                            key={token.address}
                                            className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleTokenSelect('pay', token);
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getTokenLogo(token)}
                                                    alt={getTokenSymbol(token)}
                                                    className="w-6 h-6"
                                                    onError={(e) => {
                                                        e.target.src = '/assets/images/currencies/DEFAULT.png';
                                                    }}
                                                />
                                                <span className="font-medium text-white">{getTokenSymbol(token)}</span>
                                            </div>
                                            <span className="text-gray-400 text-sm">
                                                {formatNumber(userBalances?.[getTokenSymbol(token)] || 0)}
                                            </span>
                                        </li>
                                    )) : (
                                        <li className="px-4 py-3 text-center text-gray-400">
                                            {t('swapForm.noTokenFound')}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Swap Arrow */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => {
                                // Swap tokens (passando isManualSwap = true)
                                if (onTokenChange) {
                                    const tempA = selectedTokenA;
                                    const tempB = selectedTokenB;
                                    if (tempA && tempB) {
                                        onTokenChange('base', tempB, true);
                                        setTimeout(() => {
                                            onTokenChange('quote', tempA, true);
                                        }, 50);
                                    }
                                }
                            }}
                            className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors border border-slate-600"
                        >
                            <Icon icon="heroicons:arrow-path" className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>

                    {/* Receive Section */}
                    <div className="bg-slate-700 rounded-2xl p-4 relative">
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                className="flex items-center gap-2 text-white hover:text-gray-300 font-medium w-full"
                                onClick={() => setShowReceiveTokenDropdown(!showReceiveTokenDropdown)}
                            >
                                <img
                                    src={getReceivingToken() ? getTokenLogo(getReceivingToken()) : (filteredTokens.length > 0 ? getTokenLogo(filteredTokens.find(t => t.address !== getPayingToken()?.address) || filteredTokens[0]) : '/assets/images/currencies/DEFAULT.png')}
                                    alt={getTokenSymbol(getReceivingToken()) || (filteredTokens.length > 0 ? getTokenSymbol(filteredTokens.find(t => t.address !== getPayingToken()?.address) || filteredTokens[0]) : 'Token')}
                                    className="w-6 h-6"
                                    onError={(e) => {
                                        e.target.src = '/assets/images/currencies/DEFAULT.png';
                                    }}
                                />
                                <span className="mr-1">{getTokenSymbol(getReceivingToken()) || (filteredTokens.length > 0 ? getTokenSymbol(filteredTokens.find(t => t.address !== getPayingToken()?.address) || filteredTokens[0]) : 'Selecione')}</span>
                                <Icon icon="heroicons:chevron-down" className="w-4 h-4" />
                            </button>
                            <input
                                type="text"
                                className="text-right text-2xl font-bold bg-transparent border-0 outline-0 text-white placeholder-gray-400 w-40"
                                placeholder="36.953201629"
                                value={loading ? t('swapForm.calculating') : (formData.receiveAmount || '0')}
                                readOnly
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-400">
                                <Icon icon="heroicons:wallet" className="w-4 h-4" />
                                <span>{getTokenSymbol(getReceivingToken()) || 'Token'}</span>
                            </div>
                            <div className="text-gray-400">
                                {quote ? formatNumber(parseFloat(formData.receiveAmount) * (quote.averagePrice || 1)) : '0.00'}
                            </div>
                        </div>

                        {/* Receive Currency Dropdown */}
                        {showReceiveTokenDropdown && (
                            <div className="token-dropdown absolute top-full left-0 right-0 mt-1 bg-slate-800 shadow-lg rounded-lg border border-slate-600 z-30 max-h-60 overflow-y-auto">
                                <ul className="py-2">
                                    {filteredTokens.length > 0 ? filteredTokens
                                        .map((token) => (
                                        <li
                                            key={token.address}
                                            className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleTokenSelect('receive', token);
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getTokenLogo(token)}
                                                    alt={getTokenSymbol(token)}
                                                    className="w-6 h-6"
                                                    onError={(e) => {
                                                        e.target.src = '/assets/images/currencies/DEFAULT.png';
                                                    }}
                                                />
                                                <span className="font-medium text-white">{getTokenSymbol(token)}</span>
                                            </div>
                                            <span className="text-gray-400 text-sm">
                                                {formatNumber(userBalances?.[getTokenSymbol(token)] || 0)}
                                            </span>
                                        </li>
                                    )) : (
                                        <li className="px-4 py-3 text-center text-gray-400">
                                            {t('swapForm.noTokenFound')}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Exchange Status */}
                    {noExchangeFound && (
                        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-yellow-200">
                                <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4" />
                                <span className="text-sm">
                                    {t('swapForm.exchangeNotFound', { pair: `${getTokenSymbol(selectedTokenA)}/${getTokenSymbol(selectedTokenB)}` })}
                                </span>
                            </div>
                        </div>
                    )}

                    {hasValidExchange && (
                        <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-200">
                                <Icon icon="heroicons:check-circle" className="w-4 h-4" />
                                <span className="text-sm">
                                    {t('swapForm.exchangeFound', { pair: selectedExchange.pair || selectedExchange.symbol || 'o par selecionado' })}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Ultra Swap Section */}
                    <div className="bg-slate-700 rounded-xl p-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Icon icon="heroicons:adjustments-horizontal" className="w-4 h-4" />
                                <span>{t('swapForm.priceVariation')}</span>
                                <Tooltip
                                    content={t('swapForm.priceVariationTooltip')}
                                    placement="top"
                                >
                                    <div className="inline-flex">
                                        <Icon icon="heroicons:information-circle" className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help" />
                                    </div>
                                </Tooltip>
                            </div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.useSlippage}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        useSlippage: e.target.checked
                                    }))}
                                    className="sr-only"
                                />
                                <div
                                    className={`relative w-8 h-4 rounded-full transition-colors ${
                                        formData.useSlippage ? 'bg-slate-600' : 'bg-slate-600'
                                    }`}
                                    style={{ backgroundColor: formData.useSlippage ? primaryColor : undefined }}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                                        formData.useSlippage ? 'transform translate-x-4' : ''
                                    }`}></div>
                                </div>
                            </label>
                        </div>

                        {formData.useSlippage && (
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>{t('swapForm.maxVariation')}</span>
                                    <span>{formData.slippage}%</span>
                                </div>
                                <div className="flex gap-1">
                                    {['0.5', '1.0', '2.0'].map(percentage => (
                                        <button
                                            key={percentage}
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                slippage: percentage
                                            }))}
                                            className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                                formData.slippage === percentage
                                                    ? 'text-black'
                                                    : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                            }`}
                                            style={{
                                                backgroundColor: formData.slippage === percentage ? primaryColor : undefined
                                            }}
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
                                        className="w-16 px-2 py-1 text-xs text-center rounded bg-slate-600 border border-slate-500 text-white placeholder-gray-400 focus:ring-1 focus:border-slate-400"
                                        style={{
                                            '--tw-ring-color': primaryColor,
                                            '--tw-border-opacity': '1'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = primaryColor;
                                            e.target.style.boxShadow = `0 0 0 1px ${primaryColor}`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '';
                                            e.target.style.boxShadow = '';
                                        }}
                                        step="0.1"
                                        min="0"
                                        max="50"
                                        placeholder="%"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quote Summary */}
                    {quote && !loading && hasValidExchange && (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-gray-400">
                                <span>{t('swapForm.averagePrice')}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-white">1 {getTokenSymbol(getReceivingToken())} = {formatNumber(quote.averagePrice)} cBRL</span>
                                    <Icon icon="heroicons:arrow-path" className="w-3 h-3" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>{t('swapForm.ordersToExecute')}</span>
                                <span className="text-white">{quote.orderIds?.length || 0} {t('swapForm.orders')}</span>
                            </div>
                            {formData.useSlippage && (
                                <div className="flex justify-between items-center text-gray-400">
                                    <span>{t('swapForm.minToReceive')}</span>
                                    <span className="text-white">
                                        {formatNumber(
                                            isBuyOperation
                                                ? parseFloat(formData.payAmount) * (100 - parseFloat(formData.slippage)) / 100
                                                : (quote.totalRevenue || quote.totalCost) * (100 - parseFloat(formData.slippage)) / 100
                                        )} {isBuyOperation ? getTokenSymbol(getReceivingToken()) : 'cBRL'}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-gray-400">
                                <span>{t('swapForm.autoRefreshIn')}</span>
                                <span className="text-white">{timeUntilRefresh}s</span>
                            </div>
                        </div>
                    )}

                    {error && !submitting && formData.payAmount && parseFloat(formData.payAmount) > 0 && (
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
                        className="w-full text-black font-semibold py-4 rounded-2xl transition-colors"
                        style={{
                            backgroundColor: primaryColor,
                            opacity: (!hasValidExchange || !quote || loading || submitting || !formData.payAmount || parseFloat(formData.payAmount) <= 0) ? 0.5 : 1
                        }}
                        isLoading={submitting}
                        disabled={!hasValidExchange || !quote || loading || submitting || !formData.payAmount || parseFloat(formData.payAmount) <= 0}
                    >
                        {!hasValidExchange ? (
                            t('swapForm.selectTokens')
                        ) : !quote && formData.payAmount ? (
                            t('swapForm.calculating')
                        ) : !user ? (
                            t('swapForm.connectWallet')
                        ) : (
                            `${operationType === 'buy' ? t('swapForm.buy') : t('swapForm.sell')} ${getTokenSymbol(getReceivingToken()) || 'Token'}`
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default TabbedMarketForm;
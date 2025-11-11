"use client";
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

const LimitOrderForm = ({
    symbol,
    exchangeContract,
    side, // 'buy' or 'sell'
    onOrderSubmit,
    userBalances = {},
    initialPrice = '',
    initialAmount = ''
}) => {
    const { t } = useTranslation('exchange');
    const [formData, setFormData] = useState({
        amount: initialAmount,
        price: initialPrice
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const orderData = {
                side,
                amount: formData.amount,
                price: formData.price,
                contractAddress: exchangeContract.address
            };

            await onOrderSubmit(orderData);

            // Reset form
            setFormData({
                amount: '',
                price: ''
            });

        } catch (error) {
            setError(error.message || t('limitForm.errorCreatingOrder'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleMaxClick = () => {
        if (side === 'buy') {
            // Para compra: calcular máximo baseado no preço
            if (formData.price && parseFloat(formData.price) > 0) {
                const maxCbrl = userBalances?.cBRL || 0;
                const maxAmount = maxCbrl / parseFloat(formData.price);
                setFormData(prev => ({ ...prev, amount: maxAmount.toString() }));
            }
        } else {
            // Para venda: máximo do token disponível
            const tokenSymbol = symbol.split('/')[0]; // PCN/cBRL -> PCN
            const maxAmount = userBalances?.[tokenSymbol] || 0;
            setFormData(prev => ({ ...prev, amount: maxAmount.toString() }));
        }
    };

    const calculateTotal = () => {
        const amount = parseFloat(formData.amount) || 0;
        const price = parseFloat(formData.price) || 0;
        return amount * price;
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
            return { base: 'TOKEN', quote: 'cBRL' };
        }

        const tokens = symbol.split('/');
        if (tokens.length !== 2) {
            return { base: symbol, quote: 'cBRL' };
        }

        // Se o primeiro token é cBRL, invertemos para ficar PCN/cBRL
        if (tokens[0] === 'cBRL') {
            base = tokens[1];  // PCN
            quote = tokens[0]; // cBRL
        } else {
            base = tokens[0];  // Já está correto (PCN)
            quote = tokens[1]; // cBRL
        }

        // console.log('LimitOrderForm - Symbol:', symbol, '| Base (tokenB):', base, '| Quote (tokenA):', quote);
        return { base, quote };
    };

    const tokens = getTokenSymbols();
    const total = calculateTotal();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
            <div className="flex items-center gap-2 mb-4">
                <Icon
                    icon={side === 'buy' ? 'heroicons:plus-circle' : 'heroicons:minus-circle'}
                    className={`w-5 h-5 ${side === 'buy' ? 'text-green-500' : 'text-red-500'}`}
                />
                <h3 className="text-lg font-semibold">
                    {t('limitForm.orderTitle', { type: side === 'buy' ? t('orderForm.buy') : t('orderForm.sell') })}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Price Input */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {t('limitForm.priceLabel', { base: tokens.base, quote: tokens.quote })}
                    </label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            price: e.target.value
                        }))}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                 bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="any"
                        min="0"
                        required
                    />
                </div>

                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {t('limitForm.quantityLabel', { base: tokens.base })}
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
                            required
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
                        {t('limitForm.available')} {formatNumber(userBalances?.[side === 'buy' ? tokens.quote : tokens.base] || 0)}
                        {' '}{side === 'buy' ? tokens.quote : tokens.base}
                    </div>
                </div>

                {/* Total Display */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {side === 'buy' ? t('limitForm.totalToPay') : t('limitForm.totalToReceive')}
                        </span>
                        <span className="text-lg font-medium">
                            {formatNumber(total)} {tokens.quote}
                        </span>
                    </div>
                </div>

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
                    disabled={submitting || !formData.amount || !formData.price}
                    className={`w-full ${
                        side === 'buy'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {submitting ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {t('limitForm.creatingOrder')}
                        </div>
                    ) : (
                        t('limitForm.createOrderButton', { type: side === 'buy' ? t('orderForm.buy') : t('orderForm.sell') })
                    )}
                </Button>
            </form>
        </div>
    );
};

export default LimitOrderForm;
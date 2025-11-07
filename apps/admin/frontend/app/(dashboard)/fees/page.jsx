"use client";

import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import useConfig from "@/hooks/useConfig";
import api from "@/services/api";

const FeesPage = () => {
  const { t } = useTranslation('fees');
  // Hook para gerenciar título da aba com contagem de notificações
  useDocumentTitle(t('pageTitle'), 'Clube Digital', true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userTaxes, setUserTaxes] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { defaultNetwork } = useConfig();

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchUserTaxes = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await api.get(`/api/users/${user.id}/taxes`);
        if (response.data.success) {
          setUserTaxes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user taxes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTaxes();
  }, [user?.id]);

  // Obter tokens da rede atual
  const getCurrentNetworkTokens = () => {
    if (!userTaxes?.tokenTransferFees) return [];

    // Determinar rede atual (mainnet ou testnet)
    const currentNetwork = defaultNetwork || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'mainnet';

    // Se tokenTransferFees for um objeto com estrutura { mainnet: [], testnet: [] }
    if (userTaxes.tokenTransferFees.mainnet || userTaxes.tokenTransferFees.testnet) {
      return userTaxes.tokenTransferFees[currentNetwork] || [];
    }

    // Fallback para estrutura antiga (objeto simples { DREX: 1.0, cBRL: 0.5 })
    return Object.entries(userTaxes.tokenTransferFees).map(([symbol, fee]) => ({
      symbol,
      name: symbol,
      fee: typeof fee === 'object' ? fee.fee : fee
    }));
  };

  // Função para obter a logo do token
  const getTokenLogo = (symbol) => {
    // O caminho é /assets/images/currencies/{SYMBOL}.png
    return `/assets/images/currencies/${symbol}.png`;
  };

  const getFeesData = () => {
    if (!userTaxes) return [];

    const networkTokens = getCurrentNetworkTokens();
    const currentNetwork = defaultNetwork || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'mainnet';
    const networkLabel = currentNetwork === 'mainnet' ? t('network.mainnet') : t('network.testnet');

    return [
      ...(networkTokens.length > 0 ? [{
        title: t('sections.transfers'),
        icon: "heroicons-outline:arrow-path",
        networkLabel: networkLabel,
        tokens: networkTokens
      }] : []),
      {
        title: t('sections.depositsWithdrawals'),
        icon: "heroicons-outline:banknotes",
        content: [
          {
            description: t('fees.depositPix'),
            fee: `R$ ${userTaxes.depositFee.toFixed(2)}`,
            isFree: userTaxes.depositFee === 0
          },
          {
            description: t('fees.withdrawPix'),
            fee: `R$ ${userTaxes.withdrawFee.toFixed(2)}`,
            isFree: userTaxes.withdrawFee === 0
          }
        ]
      }
    ];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('loading')}
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  const feesData = getFeesData();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('subtitle')}
        </p>
        {userTaxes && (
          <div className="mt-4 inline-flex items-center space-x-2 text-sm">
            {userTaxes.isVip && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full font-medium">
                <Icon icon="heroicons-outline:star" className="w-4 h-4 inline mr-1" />
                {t('vipLevel', { level: userTaxes.vipLevel })}
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400">
              {t('validFrom')}: {new Date(userTaxes.validFrom).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {feesData.map((item, index) => (
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
                  <Icon icon={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
                {item.networkLabel && (
                  <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                    {t('network.label')}: {item.networkLabel}
                  </span>
                )}
              </div>

              {/* Conteúdo do accordion */}
              {activeIndex === index && (
                <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                  {item.tokens ? (
                    /* Tabela de tokens */
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t('table.token')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t('table.name')}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t('table.transferFee')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {item.tokens.map((token, tokenIndex) => (
                            <tr
                              key={tokenIndex}
                              className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={getTokenLogo(token.symbol)}
                                      alt={token.symbol}
                                      onError={(e) => {
                                        e.target.src = '/assets/images/currencies/DEFAULT.png';
                                      }}
                                    />
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {token.symbol}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {token.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={`text-sm font-semibold ${
                                  parseFloat(token.fee) === 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {typeof token.fee === 'number'
                                    ? `${token.fee.toFixed(2)} ${token.symbol}`
                                    : `${token.fee} ${token.symbol}`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Outras seções (grid) */
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {item.content.map((service, serviceIndex) => (
                          <div key={serviceIndex} className="flex flex-col p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-gray-800 dark:text-white mb-1 font-medium">
                              {service.description}
                            </span>
                            <span className={`font-medium text-lg ${
                              service.isFree ? 'text-primary-500' : 'text-gray-800 dark:text-white'
                            }`}>
                              {service.fee}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeesPage;

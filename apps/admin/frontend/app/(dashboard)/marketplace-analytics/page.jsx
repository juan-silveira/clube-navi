"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";
import productService from "@/services/productService";
import merchantService from "@/services/merchantService";
import purchaseService from "@/services/purchaseService";
import cashbackService from "@/services/cashbackService";

const MarketplaceAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: {
      total: 0,
      active: 0,
      lowStock: 0,
      outOfStock: 0,
    },
    merchants: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    purchases: {
      total: 0,
      pending: 0,
      confirmed: 0,
      totalAmount: 0,
    },
    cashback: {
      totalDistributed: 0,
      totalPending: 0,
      averagePercentage: 0,
    },
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Carregar todas as stats em paralelo
      const [productStatsResponse, merchantStatsResponse, purchaseStatsResponse, cashbackStatsResponse] =
        await Promise.all([
          productService.getProductStats(),
          merchantService.getMerchantStats(),
          purchaseService.getPurchaseStats(),
          cashbackService.getCashbackStats(),
        ]);

      // Montar objeto de stats com dados reais
      setStats({
        products: productStatsResponse.data || {
          total: 0,
          active: 0,
          lowStock: 0,
          outOfStock: 0,
        },
        merchants: merchantStatsResponse.data || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        purchases: purchaseStatsResponse.data || {
          total: 0,
          pending: 0,
          confirmed: 0,
          totalAmount: 0,
        },
        cashback: cashbackStatsResponse.data || {
          totalDistributed: 0,
          totalPending: 0,
          averagePercentage: 0,
        },
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <HomeBredCurbs title="Analytics do Marketplace" />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {/* Total de Vendas */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-14 w-14 rounded-full bg-success-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:currency-dollar"
                  className="text-success-500"
                  width={28}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total de Vendas
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.purchases.totalAmount)}
              </div>
              <div className="text-xs text-success-500 mt-1">
                <Icon icon="heroicons:arrow-trending-up" width={12} className="inline mr-1" />
                +15.3% este mês
              </div>
            </div>
          </div>
        </Card>

        {/* Total de Compras */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-14 w-14 rounded-full bg-primary-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:shopping-cart"
                  className="text-primary-500"
                  width={28}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total de Compras
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.purchases.total}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.purchases.confirmed} confirmadas
              </div>
            </div>
          </div>
        </Card>

        {/* Cashback Distribuído */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-14 w-14 rounded-full bg-warning-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:gift"
                  className="text-warning-500"
                  width={28}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Cashback Total
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.cashback.totalDistributed)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Média: {stats.cashback.averagePercentage}%
              </div>
            </div>
          </div>
        </Card>

        {/* Merchants Ativos */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-14 w-14 rounded-full bg-info-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:user-group"
                  className="text-info-500"
                  width={28}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Merchants Aprovados
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.merchants.approved}
              </div>
              <div className="text-xs text-warning-500 mt-1">
                {stats.merchants.pending} pendentes
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card title="Estatísticas de Produtos">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Icon icon="heroicons:shopping-bag" className="text-primary-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total de Produtos</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.products.total}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-success-500 font-medium">
                  {((stats.products.active / stats.products.total) * 100).toFixed(1)}% ativos
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
                  <Icon icon="heroicons:check-circle" className="text-success-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Produtos Ativos</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.products.active}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center">
                  <Icon icon="heroicons:exclamation-triangle" className="text-warning-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Estoque Baixo</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.products.lowStock}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-danger-100 dark:bg-danger-900 flex items-center justify-center">
                  <Icon icon="heroicons:x-circle" className="text-danger-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Sem Estoque</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.products.outOfStock}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Status dos Merchants">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-info-100 dark:bg-info-900 flex items-center justify-center">
                  <Icon icon="heroicons:user-group" className="text-info-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total de Merchants</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.merchants.total}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center">
                  <Icon icon="heroicons:clock" className="text-warning-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Pendentes Aprovação</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.merchants.pending}
                  </div>
                </div>
              </div>
              <div>
                <span className="px-3 py-1 bg-warning-100 text-warning-800 text-xs font-medium rounded-full">
                  Ação necessária
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
                  <Icon icon="heroicons:check-badge" className="text-success-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Aprovados</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.merchants.approved}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-success-500 font-medium">
                  {((stats.merchants.approved / stats.merchants.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-danger-100 dark:bg-danger-900 flex items-center justify-center">
                  <Icon icon="heroicons:x-circle" className="text-danger-500" width={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Rejeitados</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stats.merchants.rejected}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cashback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Cashback Distribuído" className="lg:col-span-2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900 dark:to-success-800 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon icon="heroicons:gift" className="text-success-600 dark:text-success-400" width={24} />
                  <span className="text-sm font-medium text-success-800 dark:text-success-200">
                    Total Distribuído
                  </span>
                </div>
                <div className="text-3xl font-bold text-success-900 dark:text-success-100">
                  {formatCurrency(stats.cashback.totalDistributed)}
                </div>
                <div className="text-xs text-success-700 dark:text-success-300 mt-2">
                  Desde o início das operações
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900 dark:to-warning-800 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon icon="heroicons:clock" className="text-warning-600 dark:text-warning-400" width={24} />
                  <span className="text-sm font-medium text-warning-800 dark:text-warning-200">
                    Cashback Pendente
                  </span>
                </div>
                <div className="text-3xl font-bold text-warning-900 dark:text-warning-100">
                  {formatCurrency(stats.cashback.totalPending)}
                </div>
                <div className="text-xs text-warning-700 dark:text-warning-300 mt-2">
                  Aguardando confirmação de compras
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Percentual Médio de Cashback
                  </div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white">
                    {stats.cashback.averagePercentage}%
                  </div>
                </div>
                <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Icon icon="heroicons:calculator" className="text-primary-500" width={32} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Compras Recentes">
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Compras Pendentes</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-warning-500">{stats.purchases.pending}</span>
                <span className="text-xs text-slate-500">aguardando confirmação</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Compras Confirmadas</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-success-500">{stats.purchases.confirmed}</span>
                <span className="text-xs text-slate-500">finalizadas</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Taxa de Conversão</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-primary-500">
                  {((stats.purchases.confirmed / stats.purchases.total) * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">confirmadas</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketplaceAnalytics;

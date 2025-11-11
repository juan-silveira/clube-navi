"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { purchasesService } from "@/services/api";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, failed: 0, totalValue: 0, totalCashback: 0 });

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, statusFilter, sortBy]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await purchasesService.getAll();

      if (response.success && response.data) {
        const txs = response.data;
        setTransactions(txs);

        const completed = txs.filter(t => t.status === 'completed');

        setStats({
          total: txs.length,
          completed: completed.length,
          pending: txs.filter(t => t.status === 'pending' || t.status === 'processing').length,
          failed: txs.filter(t => t.status === 'failed').length,
          totalValue: completed.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0),
          totalCashback: completed.reduce((sum, t) => sum + parseFloat(t.consumerCashback), 0)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.consumer?.firstName?.toLowerCase().includes(term) ||
        t.consumer?.lastName?.toLowerCase().includes(term) ||
        t.consumer?.email?.toLowerCase().includes(term) ||
        t.merchant?.firstName?.toLowerCase().includes(term) ||
        t.merchant?.lastName?.toLowerCase().includes(term) ||
        t.product?.name?.toLowerCase().includes(term) ||
        t.id?.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Ordenação
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "value-high") {
      filtered.sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount));
    } else if (sortBy === "value-low") {
      filtered.sort((a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount));
    }

    setFilteredTransactions(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-success-100 dark:bg-success-900', text: 'text-success-800 dark:text-success-200', label: 'Concluída' },
      pending: { bg: 'bg-warning-100 dark:bg-warning-900', text: 'text-warning-800 dark:text-warning-200', label: 'Pendente' },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', label: 'Processando' },
      failed: { bg: 'bg-danger-100 dark:bg-danger-900', text: 'text-danger-800 dark:text-danger-200', label: 'Falhou' },
      refunded: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', label: 'Reembolsada' }
    };

    const badge = badges[status] || badges.pending;
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Transações</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredTransactions.length} de {stats.total} transações
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="btn btn-primary flex items-center gap-2"
        >
          <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Cliente, comerciante, produto, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Icon icon="heroicons:x-mark" className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="completed">Concluídas</option>
                <option value="pending">Pendentes</option>
                <option value="processing">Processando</option>
                <option value="failed">Falhas</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="value-high">Maior valor</option>
                <option value="value-low">Menor valor</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
              </div>
              <Icon icon="heroicons:arrow-path" className="w-10 h-10 text-primary-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Concluídas</p>
                <h3 className="text-2xl font-bold text-success-500">{stats.completed}</h3>
              </div>
              <Icon icon="heroicons:check-circle" className="w-10 h-10 text-success-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Volume Total</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  R$ {stats.totalValue.toFixed(2)}
                </h3>
              </div>
              <Icon icon="heroicons:banknotes" className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cashback Total</p>
                <h3 className="text-xl font-bold text-success-600">
                  R$ {stats.totalCashback.toFixed(2)}
                </h3>
              </div>
              <Icon icon="heroicons:gift" className="w-10 h-10 text-success-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card title={`Transações (${filteredTransactions.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Comerciante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Cashback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Icon icon="heroicons:arrow-path" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">
                      {transactions.length === 0 ? 'Nenhuma transação registrada' : 'Nenhum resultado encontrado'}
                    </p>
                    {transactions.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        className="mt-2 text-primary-500 hover:text-primary-600 text-sm"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        {tx.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-2">
                          <span className="text-primary-600 dark:text-primary-300 text-xs font-medium">
                            {tx.consumer?.firstName?.charAt(0)}{tx.consumer?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {tx.consumer?.firstName} {tx.consumer?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">{tx.product?.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{tx.product?.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {tx.merchant?.firstName} {tx.merchant?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        R$ {parseFloat(tx.totalAmount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-success-600">
                        R$ {parseFloat(tx.consumerCashback).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                      <div className="text-xs text-slate-500">
                        {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TransactionsPage;

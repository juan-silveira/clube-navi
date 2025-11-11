"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { userService } from "@/services/api";

const MerchantsPage = () => {
  const [merchants, setMerchants] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name

  useEffect(() => {
    fetchMerchants();
  }, []);

  useEffect(() => {
    filterAndSortMerchants();
  }, [merchants, searchTerm, statusFilter, sortBy]);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll({ userType: 'merchant' });

      if (response.success && response.data) {
        const users = response.data;
        setMerchants(users);

        setStats({
          total: users.length,
          active: users.filter(u => u.isActive).length,
          inactive: users.filter(u => !u.isActive).length,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar comerciantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMerchants = () => {
    let filtered = [...merchants];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.firstName?.toLowerCase().includes(term) ||
        m.lastName?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.cpf?.includes(term) ||
        m.username?.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (statusFilter === "active") {
      filtered = filtered.filter(m => m.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(m => !m.isActive);
    }

    // Ordenação
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    setFilteredMerchants(filtered);
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
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Comerciantes</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredMerchants.length} de {stats.total} comerciantes
          </p>
        </div>
        <button
          onClick={fetchMerchants}
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
                  placeholder="Nome, email, CPF ou username..."
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
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
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
                <option value="oldest">Mais antigos</option>
                <option value="name">Nome (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
              </div>
              <Icon icon="heroicons:building-storefront" className="w-10 h-10 text-primary-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ativos</p>
                <h3 className="text-2xl font-bold text-success-500">{stats.active}</h3>
              </div>
              <Icon icon="heroicons:check-circle" className="w-10 h-10 text-success-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Inativos</p>
                <h3 className="text-2xl font-bold text-slate-500">{stats.inactive}</h3>
              </div>
              <Icon icon="heroicons:x-circle" className="w-10 h-10 text-slate-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card title={`Lista de Comerciantes (${filteredMerchants.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Cadastro</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Icon icon="heroicons:building-storefront" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">
                      {merchants.length === 0 ? 'Nenhum comerciante cadastrado' : 'Nenhum resultado encontrado'}
                    </p>
                    {merchants.length > 0 && (
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
                filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                          <span className="text-primary-600 dark:text-primary-300 font-medium">
                            {merchant.firstName?.charAt(0)}{merchant.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {merchant.firstName} {merchant.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">@{merchant.username || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{merchant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{merchant.cpf || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{merchant.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        merchant.isActive
                          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {merchant.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {new Date(merchant.createdAt).toLocaleDateString('pt-BR')}
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

export default MerchantsPage;

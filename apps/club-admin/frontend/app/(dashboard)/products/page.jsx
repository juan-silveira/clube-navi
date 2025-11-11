"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { productsService } from "@/services/api";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, categories: [] });

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getAll();

      if (response.success && response.data) {
        const prods = response.data;
        setProducts(prods);

        // Calcular categorias únicas
        const categories = [...new Set(prods.map(p => p.category).filter(Boolean))];

        setStats({
          total: prods.length,
          active: prods.filter(p => p.isActive).length,
          inactive: prods.filter(p => !p.isActive).length,
          categories
        });
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.merchant?.firstName?.toLowerCase().includes(term) ||
        p.merchant?.lastName?.toLowerCase().includes(term)
      );
    }

    // Filtro de categoria
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Filtro de status
    if (statusFilter === "active") {
      filtered = filtered.filter(p => p.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(p => !p.isActive);
    }

    // Ordenação
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "cashback") {
      filtered.sort((a, b) => parseFloat(b.cashbackPercentage) - parseFloat(a.cashbackPercentage));
    }

    setFilteredProducts(filtered);
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
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Produtos</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredProducts.length} de {stats.total} produtos
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="btn btn-primary flex items-center gap-2"
        >
          <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="Nome, descrição..."
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

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Categoria
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas</option>
                {stats.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                <option value="price-high">Maior preço</option>
                <option value="price-low">Menor preço</option>
                <option value="cashback">Maior cashback</option>
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
              <Icon icon="heroicons:shopping-bag" className="w-10 h-10 text-primary-500" />
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

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-16">
                <Icon icon="heroicons:shopping-bag" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum resultado encontrado'}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                    className="mt-2 text-primary-500 hover:text-primary-600 text-sm"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id}>
              <div className="p-4">
                {/* Header com status */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    product.isActive
                      ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {product.category}
                  </span>
                </div>

                {/* Nome e descrição */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Preço e cashback */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Preço</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      R$ {parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cashback</p>
                    <p className="text-xl font-bold text-success-500">
                      {parseFloat(product.cashbackPercentage).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Estoque */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Estoque:</span>
                  <span className={`text-sm font-medium ${
                    product.stock > 10 ? 'text-success-500' :
                    product.stock > 0 ? 'text-warning-500' :
                    'text-danger-500'
                  }`}>
                    {product.stock} unidades
                  </span>
                </div>

                {/* Comerciante */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 text-xs font-medium">
                      {product.merchant?.firstName?.charAt(0)}{product.merchant?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Comerciante</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {product.merchant?.firstName} {product.merchant?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

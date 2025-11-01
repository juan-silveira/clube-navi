"use client";
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';

const InvestmentProductsAdmin = () => {
  const router = useRouter();
  const { showSuccess, showError } = useAlertContext();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // all, fixed-income, variable-income

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, filterCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Buscar todos os contratos de stake
      const response = await api.get('/api/contracts/stake');

      if (response.data.success) {
        const contracts = response.data.data || [];

        // Filtrar apenas contratos que sejam produtos de investimento (fixed ou variable)
        const investmentProducts = contracts.filter(contract =>
          contract.metadata?.investment_type === 'fixed' ||
          contract.metadata?.investment_type === 'variable'
        );

        setProducts(investmentProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrar por tipo de investimento
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.metadata?.investment_type === filterCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.metadata?.issuer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCreateProduct = () => {
    router.push('/admin/investment-products/create');
  };

  const handleEditProduct = (productAddress) => {
    router.push(`/admin/investment-products/edit/${productAddress}`);
  };

  const handleDeleteProduct = async (productAddress) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      // TODO: Implementar lógica de exclusão/desativação
      showSuccess('Produto excluído com sucesso');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('Erro ao excluir produto');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryLabel = (investmentType) => {
    const labels = {
      'fixed': 'Renda Fixa',
      'variable': 'Renda Variável'
    };
    return labels[investmentType] || 'Não definido';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', class: 'bg-green-100 text-green-800' },
      captation: { label: 'Em captação', class: 'bg-blue-100 text-blue-800' },
      closed: { label: 'Encerrado', class: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Gestão de Produtos de Investimento
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie produtos de Renda Fixa e Renda Variável Digital
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="btn-brand">
          <Plus size={16} className="mr-2" />
          Criar Produto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, símbolo ou emissor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            >
              <option value="all">Todas as categorias</option>
              <option value="fixed">Renda Fixa</option>
              <option value="variable">Renda Variável</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total de Produtos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Renda Fixa</p>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.metadata?.investment_type === 'fixed').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Renda Variável</p>
            <p className="text-2xl font-bold text-purple-600">
              {products.filter(p => p.metadata?.investment_type === 'variable').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Em Captação</p>
            <p className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.metadata?.status === 'captation').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Emissor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rentabilidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Captação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.address} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.metadata?.logoUrl ? (
                            <img
                              src={product.metadata.logoUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {product.symbol?.substring(0, 3) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getCategoryLabel(product.metadata?.investment_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {product.metadata?.issuer || '--'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        {product.metadata?.rentability || product.metadata?.rentabilityRange || '--'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(product.metadata?.capturedAmount || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        de {formatCurrency(product.metadata?.totalEmission || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.metadata?.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProduct(product.address)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <a
                          href={`https://floripa.azorescan.com/address/${product.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleDeleteProduct(product.address)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
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

export default InvestmentProductsAdmin;

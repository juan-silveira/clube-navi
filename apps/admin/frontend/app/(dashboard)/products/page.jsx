"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import HomeBredCurbs from "@/components/partials/HomeBredCurbs";
import productService from "@/services/productService";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cashbackPercentage: "",
    category: "",
    stock: "",
  });

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.listProducts();
      if (response.success && response.data) {
        const productList = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];
        setProducts(productList);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await productService.getProductStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      cashbackPercentage: product.cashbackPercentage,
      category: product.category,
      stock: product.stock,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter((p) => p.id !== productId));
        loadStats();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Erro ao excluir produto");
      }
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productService.toggleProductStatus(product.id, !product.isActive);
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, isActive: !p.isActive } : p
        )
      );
      loadStats();
    } catch (error) {
      console.error("Error toggling product status:", error);
      alert("Erro ao alterar status do produto");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          cashbackPercentage: parseFloat(formData.cashbackPercentage),
          category: formData.category,
          stock: parseInt(formData.stock),
        });
      } else {
        await productService.createProduct({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          cashbackPercentage: parseFloat(formData.cashbackPercentage),
          category: formData.category,
          stock: parseInt(formData.stock),
        });
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        cashbackPercentage: "",
        category: "",
        stock: "",
      });
      loadProducts();
      loadStats();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Erro ao salvar produto");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div>
      <HomeBredCurbs title="Gestão de Produtos" />

      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-primary-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:shopping-bag"
                  className="text-primary-500"
                  width={24}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total Produtos
              </div>
              <div className="text-2xl font-medium text-slate-900 dark:text-white">
                {stats.total}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-success-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:check-circle"
                  className="text-success-500"
                  width={24}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Ativos
              </div>
              <div className="text-2xl font-medium text-slate-900 dark:text-white">
                {stats.active}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-warning-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:cube"
                  className="text-warning-500"
                  width={24}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Estoque Baixo
              </div>
              <div className="text-2xl font-medium text-slate-900 dark:text-white">
                {stats.lowStock}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-danger-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:x-circle"
                  className="text-danger-500"
                  width={24}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Sem Estoque
              </div>
              <div className="text-2xl font-medium text-slate-900 dark:text-white">
                {stats.outOfStock}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <div className="flex-1 md:flex space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Textinput
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="heroicons-outline:search"
              />
            </div>
            <div className="w-full md:w-auto">
              <select
                className="form-control py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas Categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              icon="heroicons-outline:plus"
              text="Novo Produto"
              className="btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: "",
                  description: "",
                  price: "",
                  cashbackPercentage: "",
                  category: "",
                  stock: "",
                });
                setShowModal(true);
              }}
            />
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="table-th">Produto</th>
                <th className="table-th">Categoria</th>
                <th className="table-th">Preço</th>
                <th className="table-th">Cashback</th>
                <th className="table-th">Estoque</th>
                <th className="table-th">Vendedor</th>
                <th className="table-th">Status</th>
                <th className="table-th">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <div className="text-slate-500 dark:text-slate-400">
                      Nenhum produto encontrado
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="table-td">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <Badge label={product.category} className="bg-slate-100 text-slate-800" />
                    </td>
                    <td className="table-td">
                      <span className="font-medium">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="table-td">
                      <Badge
                        label={`${product.cashbackPercentage}%`}
                        className="bg-success-100 text-success-800"
                      />
                    </td>
                    <td className="table-td">
                      <span
                        className={`font-medium ${
                          product.stock === 0
                            ? "text-danger-500"
                            : product.stock < 10
                            ? "text-warning-500"
                            : "text-success-500"
                        }`}
                      >
                        {product.stock} un.
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="text-sm">
                        {product.merchant.firstName} {product.merchant.lastName}
                      </div>
                    </td>
                    <td className="table-td">
                      <Badge
                        label={product.isActive ? "Ativo" : "Inativo"}
                        className={
                          product.isActive
                            ? "bg-success-100 text-success-800"
                            : "bg-slate-100 text-slate-800"
                        }
                      />
                    </td>
                    <td className="table-td">
                      <div className="flex space-x-2">
                        <Tooltip content="Editar" placement="top">
                          <button
                            className="action-btn"
                            type="button"
                            onClick={() => handleEdit(product)}
                          >
                            <Icon icon="heroicons:pencil-square" />
                          </button>
                        </Tooltip>
                        <Tooltip
                          content={product.isActive ? "Desativar" : "Ativar"}
                          placement="top"
                        >
                          <button
                            className="action-btn"
                            type="button"
                            onClick={() => handleToggleActive(product)}
                          >
                            <Icon
                              icon={
                                product.isActive
                                  ? "heroicons:eye-slash"
                                  : "heroicons:eye"
                              }
                            />
                          </button>
                        </Tooltip>
                        <Tooltip content="Excluir" placement="top">
                          <button
                            className="action-btn"
                            type="button"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Icon icon="heroicons:trash" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Criação/Edição */}
      <Modal
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
        activeModal={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textinput
            label="Nome do Produto"
            type="text"
            placeholder="Digite o nome"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <Textarea
            label="Descrição"
            placeholder="Descreva o produto"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Textinput
              label="Preço (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />

            <Textinput
              label="Cashback (%)"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.cashbackPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cashbackPercentage: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Textinput
              label="Categoria"
              type="text"
              placeholder="Ex: Eletrônicos"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />

            <Textinput
              label="Estoque"
              type="number"
              placeholder="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              text="Cancelar"
              className="btn-outline-dark"
              onClick={() => {
                setShowModal(false);
                setEditingProduct(null);
              }}
            />
            <Button
              text={editingProduct ? "Atualizar" : "Criar"}
              type="submit"
              className="btn-primary"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsManagement;

"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import useAuthStore from "@/store/authStore";
import { userService } from "@/services/api";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { useAlertContext } from "@/contexts/AlertContext";

const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    type: "consumer",
    isActive: true
  });
  const { showSuccess, showError } = useAlertContext();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAll();
      console.log('📊 [Users] Response:', response);

      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar usuários');
      }
    } catch (err) {
      console.error('❌ [Users] Error:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      name: "",
      email: "",
      cpf: "",
      phone: "",
      type: "consumer",
      isActive: true
    });
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode("edit");
    setFormData({
      name: user.name || "",
      email: user.email || "",
      cpf: user.cpf || "",
      phone: user.phone || "",
      type: user.type || "consumer",
      isActive: user.isActive !== false
    });
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleView = (user) => {
    setModalMode("view");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const response = await userService.delete(userId);
      if (response.success) {
        showSuccess("Usuário excluído com sucesso!");
        fetchUsers();
      } else {
        showError(response.message || "Erro ao excluir usuário");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Erro ao excluir usuário");
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const response = await userService.toggleActive(userId);
      if (response.success) {
        showSuccess(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
        fetchUsers();
      } else {
        showError(response.message || "Erro ao atualizar usuário");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Erro ao atualizar usuário");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (modalMode === "create") {
        response = await userService.create(formData);
      } else {
        response = await userService.update(selectedUser.id, formData);
      }

      if (response.success) {
        showSuccess(`Usuário ${modalMode === "create" ? 'criado' : 'atualizado'} com sucesso!`);
        setShowModal(false);
        fetchUsers();
      } else {
        showError(response.message || `Erro ao ${modalMode === "create" ? 'criar' : 'atualizar'} usuário`);
      }
    } catch (err) {
      showError(err.response?.data?.message || `Erro ao ${modalMode === "create" ? 'criar' : 'atualizar'} usuário`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf?.includes(searchTerm) ||
      user.phone?.includes(searchTerm);

    const matchesType =
      filterType === "all" ||
      user.type === filterType;

    return matchesSearch && matchesType;
  });

  const stats = {
    total: users.length,
    consumers: users.filter(u => u.type === "consumer").length,
    merchants: users.filter(u => u.type === "merchant").length,
    admins: users.filter(u => u.type === "admin").length,
    active: users.filter(u => u.isActive).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-500 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-300">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <Icon icon="heroicons:exclamation-triangle" className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Erro ao carregar Usuários
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
          <Button onClick={fetchUsers} className="btn-primary">
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Usuários
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Gerencie os usuários do clube
          </p>
        </div>
        <Button onClick={handleCreate} className="btn-primary inline-flex items-center gap-2">
          <Icon icon="heroicons:plus" className="w-5 h-5" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card bodyClass="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            </div>
            <Icon icon="heroicons:users" className="w-8 h-8 text-primary-500" />
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Consumidores</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.consumers}</p>
            </div>
            <Icon icon="heroicons:user" className="w-8 h-8 text-info-500" />
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Comerciantes</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.merchants}</p>
            </div>
            <Icon icon="heroicons:building-storefront" className="w-8 h-8 text-success-500" />
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Administradores</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.admins}</p>
            </div>
            <Icon icon="heroicons:shield-check" className="w-8 h-8 text-warning-500" />
          </div>
        </Card>

        <Card bodyClass="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Ativos</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
            </div>
            <Icon icon="heroicons:check-circle" className="w-8 h-8 text-success-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nome, email, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterType === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("consumer")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterType === "consumer"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Consumidores
            </button>
            <button
              onClick={() => setFilterType("merchant")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterType === "merchant"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Comerciantes
            </button>
            <button
              onClick={() => setFilterType("admin")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterType === "admin"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Admins
            </button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card title={`Usuários (${filteredUsers.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-300">Nome</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-300">Email</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-300">CPF</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-300">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600 dark:text-slate-300">Cadastro</th>
                <th className="text-right p-4 text-sm font-medium text-slate-600 dark:text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Icon icon="heroicons:user-group" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">
                      {searchTerm || filterType !== "all"
                        ? "Nenhum usuário encontrado com os filtros aplicados"
                        : "Nenhum usuário cadastrado"
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                          <span className="text-primary-500 font-medium">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.name || 'Sem nome'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {user.email}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {user.cpf || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.type === "consumer"
                          ? "bg-info-500/10 text-info-500"
                          : user.type === "merchant"
                          ? "bg-success-500/10 text-success-500"
                          : "bg-warning-500/10 text-warning-500"
                      }`}>
                        {user.type === "consumer" ? "Consumidor" : user.type === "merchant" ? "Comerciante" : "Admin"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-success-500/10 text-success-500"
                            : "bg-slate-500/10 text-slate-500"
                        }`}
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(user)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                          title="Visualizar"
                        >
                          <Icon icon="heroicons:eye" className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Icon icon="heroicons:pencil" className="w-5 h-5 text-primary-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Icon icon="heroicons:trash" className="w-5 h-5 text-danger-500" />
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

      {/* Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalMode === "create"
            ? "Novo Usuário"
            : modalMode === "edit"
            ? "Editar Usuário"
            : "Detalhes do Usuário"
        }
        activeModal={showModal}
        centered
      >
        {modalMode === "view" && selectedUser ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome
              </label>
              <p className="text-slate-900 dark:text-white">{selectedUser.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <p className="text-slate-900 dark:text-white">{selectedUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                CPF
              </label>
              <p className="text-slate-900 dark:text-white">{selectedUser.cpf || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Telefone
              </label>
              <p className="text-slate-900 dark:text-white">{selectedUser.phone || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo
              </label>
              <p className="text-slate-900 dark:text-white">
                {selectedUser.type === "consumer" ? "Consumidor" : selectedUser.type === "merchant" ? "Comerciante" : "Admin"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <p className="text-slate-900 dark:text-white">{selectedUser.isActive ? "Ativo" : "Inativo"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data de Cadastro
              </label>
              <p className="text-slate-900 dark:text-white">
                {new Date(selectedUser.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textinput
              label="Nome"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
              required
            />

            <Textinput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              required
            />

            <Textinput
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              placeholder="000.000.000-00"
            />

            <Textinput
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Usuário
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="consumer">Consumidor</option>
                <option value="merchant">Comerciante</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-500 border-slate-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                Usuário ativo
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-outline-secondary"
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-primary">
                {modalMode === "create" ? "Criar" : "Salvar"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;

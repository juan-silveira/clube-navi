"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import merchantService from "@/services/merchantService";

const MerchantsManagement = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadMerchants();
    loadStats();
  }, [statusFilter]);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const response = await merchantService.listMerchants({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm,
      });
      if (response.success && response.data) {
        const merchantList = response.data.merchants || response.data.users || [];
        setMerchants(merchantList);
      }
    } catch (error) {
      console.error("Error loading merchants:", error);
      alert("Erro ao carregar merchants");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await merchantService.getMerchantStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleApprove = async (merchantId) => {
    if (confirm("Aprovar este merchant?")) {
      try {
        await merchantService.approveMerchant(merchantId);
        setMerchants(
          merchants.map((m) =>
            m.id === merchantId
              ? { ...m, merchantStatus: "approved", isActive: true }
              : m
          )
        );
        loadStats();
      } catch (error) {
        console.error("Error approving merchant:", error);
        alert("Erro ao aprovar merchant");
      }
    }
  };

  const handleReject = async (merchantId) => {
    const reason = prompt("Motivo da rejeição (opcional):");
    try {
      await merchantService.rejectMerchant(merchantId, reason || "");
      setMerchants(
        merchants.map((m) =>
          m.id === merchantId
            ? { ...m, merchantStatus: "rejected", isActive: false }
            : m
        )
      );
      loadStats();
    } catch (error) {
      console.error("Error rejecting merchant:", error);
      alert("Erro ao rejeitar merchant");
    }
  };

  const handleToggleActive = async (merchantId, isActive) => {
    try {
      await merchantService.toggleMerchantStatus(merchantId, !isActive);
      setMerchants(
        merchants.map((m) =>
          m.id === merchantId ? { ...m, isActive: !isActive } : m
        )
      );
    } catch (error) {
      console.error("Error toggling merchant status:", error);
      alert("Erro ao alterar status do merchant");
    }
  };

  const handleViewDetails = (merchant) => {
    setSelectedMerchant(merchant);
    setShowDetailModal(true);
  };

  const filteredMerchants = merchants.filter((merchant) => {
    const matchesSearch =
      merchant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || merchant.merchantStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pendente", className: "bg-warning-100 text-warning-800" };
      case "approved":
        return { label: "Aprovado", className: "bg-success-100 text-success-800" };
      case "rejected":
        return { label: "Rejeitado", className: "bg-danger-100 text-danger-800" };
      default:
        return { label: status, className: "bg-slate-100 text-slate-800" };
    }
  };

  return (
    <div>
      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-none">
              <div className="h-12 w-12 rounded-full bg-primary-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:user-group"
                  className="text-primary-500"
                  width={24}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total Merchants
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
              <div className="h-12 w-12 rounded-full bg-warning-500 bg-opacity-10 flex items-center justify-center">
                <Icon
                  icon="heroicons:clock"
                  className="text-warning-500"
                  width={24}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Pendentes
              </div>
              <div className="text-2xl font-medium text-slate-900 dark:text-white">
                {stats.pending}
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
                Aprovados
              </div>
              <div className="text-2xl font-medium text-slate-900 dark:text-white">
                {stats.approved}
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
                Rejeitados
              </div>
              <div className="text-2xl font-medium text-slate-900 dark:text-white">
                {stats.rejected}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <div className="flex-1 md:flex space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Textinput
                type="text"
                placeholder="Buscar merchants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="heroicons-outline:search"
              />
            </div>
            <div className="w-full md:w-auto">
              <select
                className="form-control py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos Status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Merchants */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="table-th">Merchant</th>
                <th className="table-th">Tipo</th>
                <th className="table-th">Contato</th>
                <th className="table-th">Localização</th>
                <th className="table-th">Produtos</th>
                <th className="table-th">Status</th>
                <th className="table-th">Data Cadastro</th>
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
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <div className="text-slate-500 dark:text-slate-400">
                      Nenhum merchant encontrado
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => {
                  const statusBadge = getStatusBadge(merchant.merchantStatus);
                  return (
                    <tr key={merchant.id}>
                      <td className="table-td">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {merchant.firstName} {merchant.lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {merchant.email}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <Badge
                          label={merchant.address?.personType || "N/A"}
                          className="bg-slate-100 text-slate-800"
                        />
                      </td>
                      <td className="table-td">
                        <div className="text-sm">
                          <div>{merchant.cpf}</div>
                          <div className="text-slate-500">{merchant.phone}</div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="text-sm">
                          {merchant.address?.city}, {merchant.address?.state}
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="font-medium">
                          {merchant._count?.products || 0}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="space-y-1">
                          <Badge
                            label={statusBadge.label}
                            className={statusBadge.className}
                          />
                          {merchant.isActive && (
                            <Badge
                              label="Ativo"
                              className="bg-success-100 text-success-800"
                            />
                          )}
                          {!merchant.emailConfirmed && (
                            <Badge
                              label="Email não confirmado"
                              className="bg-warning-100 text-warning-800"
                            />
                          )}
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="text-sm">
                          {new Date(merchant.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex space-x-2">
                          <Tooltip content="Ver Detalhes" placement="top">
                            <button
                              className="action-btn"
                              type="button"
                              onClick={() => handleViewDetails(merchant)}
                            >
                              <Icon icon="heroicons:eye" />
                            </button>
                          </Tooltip>

                          {merchant.merchantStatus === "pending" && (
                            <>
                              <Tooltip content="Aprovar" placement="top">
                                <button
                                  className="action-btn"
                                  type="button"
                                  onClick={() => handleApprove(merchant.id)}
                                >
                                  <Icon
                                    icon="heroicons:check-circle"
                                    className="text-success-500"
                                  />
                                </button>
                              </Tooltip>
                              <Tooltip content="Rejeitar" placement="top">
                                <button
                                  className="action-btn"
                                  type="button"
                                  onClick={() => handleReject(merchant.id)}
                                >
                                  <Icon
                                    icon="heroicons:x-circle"
                                    className="text-danger-500"
                                  />
                                </button>
                              </Tooltip>
                            </>
                          )}

                          {merchant.merchantStatus === "approved" && (
                            <Tooltip
                              content={merchant.isActive ? "Desativar" : "Ativar"}
                              placement="top"
                            >
                              <button
                                className="action-btn"
                                type="button"
                                onClick={() => handleToggleActive(merchant)}
                              >
                                <Icon
                                  icon={
                                    merchant.isActive
                                      ? "heroicons:eye-slash"
                                      : "heroicons:eye"
                                  }
                                />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhes */}
      {selectedMerchant && (
        <Modal
          title="Detalhes do Merchant"
          activeModal={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMerchant(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Nome
                </label>
                <div className="mt-1 text-slate-900 dark:text-white">
                  {selectedMerchant.firstName} {selectedMerchant.lastName}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Tipo
                </label>
                <div className="mt-1">
                  <Badge
                    label={selectedMerchant.address?.personType || "N/A"}
                    className="bg-slate-100 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Email
              </label>
              <div className="mt-1 text-slate-900 dark:text-white">
                {selectedMerchant.email}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  CPF/CNPJ
                </label>
                <div className="mt-1 text-slate-900 dark:text-white">
                  {selectedMerchant.cpf}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Telefone
                </label>
                <div className="mt-1 text-slate-900 dark:text-white">
                  {selectedMerchant.phone}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Localização
              </label>
              <div className="mt-1 text-slate-900 dark:text-white">
                {selectedMerchant.address?.city}, {selectedMerchant.address?.state}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    label={getStatusBadge(selectedMerchant.merchantStatus).label}
                    className={
                      getStatusBadge(selectedMerchant.merchantStatus).className
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Produtos Cadastrados
                </label>
                <div className="mt-1 text-slate-900 dark:text-white font-medium">
                  {selectedMerchant._count?.products || 0}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Data de Cadastro
              </label>
              <div className="mt-1 text-slate-900 dark:text-white">
                {new Date(selectedMerchant.createdAt).toLocaleString("pt-BR")}
              </div>
            </div>

            {selectedMerchant.merchantStatus === "pending" && (
              <div className="flex space-x-3 pt-4">
                <Button
                  text="Aprovar Merchant"
                  className="btn-success flex-1"
                  onClick={() => {
                    handleApprove(selectedMerchant.id);
                    setShowDetailModal(false);
                  }}
                />
                <Button
                  text="Rejeitar"
                  className="btn-danger flex-1"
                  onClick={() => {
                    handleReject(selectedMerchant.id);
                    setShowDetailModal(false);
                  }}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MerchantsManagement;

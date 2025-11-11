"use client";

import { useState, useEffect, useCallback } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "react-select";
import Tooltip from "@/components/ui/Tooltip";
import Modal from "@/components/ui/Modal";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from "@/contexts/AlertContext";
import useAuthStore from "@/store/authStore";
import useConfig from "@/hooks/useConfig";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Search,
  RefreshCw,
  Banknote,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
// Removido import moment - usando JavaScript nativo

const SystemWithdrawalsPage = () => {
  const { t } = useTranslation("systemWithdrawals");
  const { showSuccess, showError } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const { accessToken } = useAuthStore();
  const { defaultNetwork } = useConfig();

  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modal de confirmação
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [receiptCode, setReceiptCode] = useState("");
  const [processing, setProcessing] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    failed: 0,
  });

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    // Só carrega uma vez na montagem inicial
    if (!initialLoadDone) {
      loadWithdrawals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.canViewSystemSettings, router, initialLoadDone]);

  useEffect(() => {
    if (initialLoadDone) {
      applyFilters();
    }
  }, [withdrawals, filters, initialLoadDone]);

  const loadWithdrawals = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: 1,
        limit: 100,
      };

      try {
        const response = await fetch("/api/admin/withdrawals/all", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const withdrawalsData = data.withdrawals || [];

          setWithdrawals(withdrawalsData);

          // Calcular estatísticas
          const newStats = {
            total: withdrawalsData.length,
            pending: withdrawalsData.filter((w) => w.status === "PENDING")
              .length,
            confirmed: withdrawalsData.filter((w) => w.status === "CONFIRMED")
              .length,
            failed: withdrawalsData.filter((w) => w.status === "FAILED").length,
          };

          setStats(newStats);

          // Aplicar filtros iniciais
          if (!initialLoadDone) {
            setInitialLoadDone(true);
          }
        } else {
          // Se não conseguir carregar dados reais, mostrar estado vazio
          console.warn(t("messages.noWithdrawalsFound"), response);
          setWithdrawals([]);
          setStats({ total: 0, pending: 0, confirmed: 0, failed: 0 });
          setInitialLoadDone(true);
        }
      } catch (apiError) {
        console.error("Erro na API de saques:", apiError);

        // Se falhar na API, mostrar estado vazio em vez de erro
        setWithdrawals([]);
        setStats({ total: 0, pending: 0, confirmed: 0, failed: 0 });
        setInitialLoadDone(true);

        // Mostrar toast apenas se for erro de autenticação ou rate limiting
        if (apiError.response?.status === 401) {
          showError(t("messages.authError"));
        } else if (apiError.response?.status === 429) {
          showError(t("messages.rateLimitError"));
        } else {
          showError(t("messages.genericLoadError"));
        }
      }
    } catch (error) {
      console.error("Erro geral ao carregar saques:", error);
      showError(t("messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, showError, initialLoadDone]);

  const applyFilters = () => {
    let filtered = [...withdrawals];

    // Filtro de busca
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((withdrawal) => {
        if (!withdrawal) return false;

        const userNameMatch =
          withdrawal.user?.name?.toLowerCase().includes(search) || false;
        const userEmailMatch =
          withdrawal.user?.email?.toLowerCase().includes(search) || false;
        const pixKeyMatch =
          withdrawal.pixKey?.toLowerCase().includes(search) || false;
        const amountMatch =
          withdrawal.amount?.toString().includes(search) || false;

        return userNameMatch || userEmailMatch || pixKeyMatch || amountMatch;
      });
    }

    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter(
        (withdrawal) => withdrawal.status === filters.status
      );
    }

    setFilteredWithdrawals(filtered);
  };

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
    });
  };

  const handleConfirmPayment = async () => {
    if (!receiptCode.trim()) {
      showError(t("messages.enterReceiptCode"));
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch(
        `/api/admin/withdrawals/${selectedWithdrawal.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ receiptCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("messages.confirmError"));
      }

      showSuccess(t("messages.paymentConfirmed"));
      setConfirmModal(false);
      setSelectedWithdrawal(null);
      setReceiptCode("");
      loadWithdrawals(); // Recarregar lista
    } catch (error) {
      console.error("Erro:", error);
      showError(error.message || t("messages.confirmError"));
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess(t("messages.copied"));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "CONFIRMED":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock size={16} />;
      case "CONFIRMED":
        return <CheckCircle size={16} />;
      case "FAILED":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return t("status.PENDING");
      case "CONFIRMED":
        return t("status.CONFIRMED");
      case "FAILED":
        return t("status.FAILED");
      default:
        return status;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getExplorerUrl = (txHash) => {
    const baseUrl =
      defaultNetwork === "mainnet"
        ? "https://azorescan.com"
        : "https://floripa.azorescan.com";
    return `${baseUrl}/tx/${txHash}`;
  };

  // Opções para filtros
  const statusOptions = [
    { value: "", label: t("filters.status.all") },
    { value: "PENDING", label: t("status.PENDING") },
    { value: "CONFIRMED", label: t("status.CONFIRMED") },
    { value: "FAILED", label: t("status.FAILED") },
  ];

  const itemsPerPageOptions = [
    { value: 10, label: t("table.pagination.perPage10") },
    { value: 20, label: t("table.pagination.perPage20") },
    { value: 50, label: t("table.pagination.perPage50") },
  ];

  // Pagination
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const currentWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => setCurrentPage(page);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    setCurrentPage(Math.min(totalPages, currentPage + 1));

  const handleItemsPerPageChange = (option) => {
    setItemsPerPage(option.value);
    setCurrentPage(1);
  };

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              text={t("buttons.refresh")}
              icon="heroicons:arrow-path-solid"
              onClick={loadWithdrawals}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Banknote className="text-blue-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.total")}
                  </p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="text-yellow-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.pending")}
                  </p>
                  <p className="text-xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.confirmed")}
                  </p>
                  <p className="text-xl font-bold">{stats.confirmed}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="text-red-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.failed")}
                  </p>
                  <p className="text-xl font-bold">{stats.failed}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("filters.search.label")}
              </label>
              <div className="relative">
                <Textinput
                  placeholder={t("filters.search.placeholder")}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("filters.status.label")}
              </label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={statusOptions}
                value={statusOptions.find(
                  (option) => option.value === filters.status
                )}
                onChange={(option) =>
                  handleFilterChange("status", option?.value || "")
                }
                placeholder={t("filters.status.placeholder")}
                isClearable
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="btn-outline-secondary flex-1"
              >
                {t("buttons.clear")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista de Saques */}
        <Card className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col h-full">
            {/* Cabeçalho da tabela */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("table.title")} (
                {loading ? "..." : filteredWithdrawals.length})
              </h3>
              <div className="flex items-center space-x-2">
                <Select
                  className="react-select"
                  classNamePrefix="select"
                  options={itemsPerPageOptions}
                  value={itemsPerPageOptions.find(
                    (option) => option.value === itemsPerPage
                  )}
                  onChange={handleItemsPerPageChange}
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-slate-600 dark:text-slate-400">
                  {t("table.loading")}
                </span>
              </div>
            )}

            {/* Tabela */}
            {!loading && (
              <div className="flex-1 overflow-auto relative">
                <table className="min-w-full relative">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.dateTime")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.user")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.values")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.pixKey")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.status")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.burnHash")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.receiptCode")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("table.columns.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {currentWithdrawals.length > 0 ? (
                      currentWithdrawals.map((withdrawal) => (
                        <tr
                          key={withdrawal.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                        >
                          {/* Data/Hora */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="text-slate-900 dark:text-white">
                              {new Date(
                                withdrawal.createdAt
                              ).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs">
                              {new Date(
                                withdrawal.createdAt
                              ).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>

                          {/* Usuário */}
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium text-slate-900 dark:text-white">
                                {withdrawal.user?.name}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-xs">
                                {withdrawal.user?.email}
                              </div>
                            </div>
                          </td>

                          {/* Valores */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              <div className="text-slate-900 dark:text-white">
                                <span className="text-xs text-slate-500">
                                  {t("table.values.requested")}
                                </span>{" "}
                                {formatCurrency(withdrawal.amount)}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-xs">
                                <span>{t("table.values.fee")}</span>{" "}
                                {formatCurrency(withdrawal.fee)}
                              </div>
                              <div className="font-bold text-green-600">
                                <span className="text-xs">
                                  {t("table.values.net")}
                                </span>{" "}
                                {formatCurrency(withdrawal.netAmount)}
                              </div>
                            </div>
                          </td>

                          {/* Chave PIX */}
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm">
                                <div className="text-slate-900 dark:text-white font-mono">
                                  {withdrawal.pixKey}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 text-xs">
                                  <Badge
                                    label={withdrawal.pixKeyType}
                                    className="bg-gray-100 text-gray-800 text-xs"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(withdrawal.pixKey)
                                }
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <Copy size={14} className="text-gray-500" />
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(withdrawal.status)}
                              <Badge
                                label={getStatusLabel(withdrawal.status)}
                                className={`${getStatusColor(
                                  withdrawal.status
                                )} text-white`}
                              />
                            </div>
                          </td>

                          {/* Hash Burn */}
                          <td className="px-4 py-3 text-sm">
                            {withdrawal.burnTxHash ? (
                              <Tooltip
                                content={t("tooltips.viewTransaction", {
                                  hash: `${withdrawal.burnTxHash.substring(
                                    0,
                                    5
                                  )}...${withdrawal.burnTxHash.slice(-5)}`,
                                })}
                                placement="top"
                                theme="dark"
                              >
                                <a
                                  href={getExplorerUrl(withdrawal.burnTxHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                                >
                                  {withdrawal.burnTxHash.substring(0, 5)}...
                                  {withdrawal.burnTxHash.slice(-5)}
                                </a>
                              </Tooltip>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Código Recibo PIX */}
                          <td className="px-4 py-3 text-sm">
                            {withdrawal.pixTransactionId ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                  {withdrawal.pixTransactionId.substring(0, 5)}
                                  ...{withdrawal.pixTransactionId.slice(-5)}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(withdrawal.pixTransactionId)
                                  }
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  title={t("tooltips.copyCode")}
                                >
                                  <Copy size={14} className="text-gray-500" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {withdrawal.status === "PENDING" &&
                              withdrawal.burnTxHash && (
                                <Button
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal);
                                    setConfirmModal(true);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  size="sm"
                                >
                                  <Check size={14} className="mr-1" />
                                  {t("buttons.confirm")}
                                </Button>
                              )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                        >
                          <div className="flex flex-col items-center">
                            <Banknote className="w-12 h-12 mb-2 opacity-50" />
                            <span className="font-medium">
                              {t("table.empty.title")}
                            </span>
                            <span className="text-sm">
                              {t("table.empty.subtitle")}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredWithdrawals.length > itemsPerPage && (
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t("table.pagination.showing", {
                      from: (currentPage - 1) * itemsPerPage + 1,
                      to: Math.min(
                        currentPage * itemsPerPage,
                        filteredWithdrawals.length
                      ),
                      total: filteredWithdrawals.length,
                    })}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            currentPage === page
                              ? "bg-primary-500 text-white"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de Confirmação */}
      <Modal
        title={t("modal.title")}
        labelclassName="btn-outline-dark"
        activeModal={confirmModal}
        onClose={() => !processing && setConfirmModal(false)}
      >
        <div className="space-y-6">
          {/* Aviso de confirmação com melhor contraste */}
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-amber-900/30 border-amber-700"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span
                  className={`text-lg ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  ⚠️
                </span>
              </div>
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-amber-200" : "text-amber-800"
                  }`}
                >
                  {t("modal.warning.title")}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-amber-300" : "text-amber-700"
                  }`}
                >
                  {t("modal.warning.message")}
                </p>
              </div>
            </div>
          </div>

          {/* Informações do saque com melhor formatação */}
          {selectedWithdrawal && (
            <div
              className={`p-4 rounded-lg border ${
                isDark ? "border-slate-600" : "border-slate-200"
              }`}
            >
              <h4
                className={`text-sm mb-3 ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {t("modal.details.title")}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {t("modal.details.transactionId")}
                  </span>
                  <span
                    className={`text-sm font-mono ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {selectedWithdrawal.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {t("modal.details.valueToSend")}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isDark ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    R${" "}
                    {typeof selectedWithdrawal.netAmount === "number"
                      ? selectedWithdrawal.netAmount.toFixed(2)
                      : parseFloat(selectedWithdrawal.netAmount || 0).toFixed(
                          2
                        )}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {t("modal.details.pixKey")}
                  </span>
                  <span
                    className={`text-sm font-mono text-right max-w-[60%] break-all ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {selectedWithdrawal.pixKey}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {t("modal.details.type")}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {selectedWithdrawal.pixKeyType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Campo do código com melhor visibilidade */}
          <div className="space-y-3">
            <label
              className={`block text-sm font-semibold ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              {t("modal.receiptCode.label")}
            </label>
            <Textinput
              placeholder={t("modal.receiptCode.placeholder")}
              value={receiptCode}
              onChange={(e) => setReceiptCode(e.target.value)}
              disabled={processing}
              className="w-full"
            />
            <p
              className={`text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t("modal.receiptCode.helper")}
            </p>
          </div>

          {/* Botões com melhor contraste */}
          <div
            className={`flex justify-end space-x-3 pt-4 border-t ${
              isDark ? "border-slate-600" : "border-slate-200"
            }`}
          >
            <Button
              onClick={() => setConfirmModal(false)}
              className="btn-outline-secondary px-6 py-2 font-medium"
              disabled={processing}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              onClick={handleConfirmPayment}
              className="btn-success px-6 py-2 font-medium"
              disabled={processing || !receiptCode.trim()}
              isLoading={processing}
            >
              <Check size={16} className="mr-2" />
              {t("buttons.confirmPayment")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SystemWithdrawalsPage;

"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import Select from "react-select";
import usePermissions from "@/hooks/usePermissions";
import useDarkmode from "@/hooks/useDarkMode";
import { useAlertContext } from "@/contexts/AlertContext";
import { useTranslation } from "@/hooks/useTranslation";
import api from "@/services/api";
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const SystemDocumentValidationPage = () => {
  const { t } = useTranslation("documentValidation");
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkmode();
  const router = useRouter();
  const permissions = usePermissions();
  const [documents, setDocuments] = useState([]);
  const [groupedDocuments, setGroupedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: null,
    title: null,
    zoom: 1,
    isPdf: false,
    mimeType: null,
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: "",
    status: "pending",
    documentType: "",
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!permissions.canManageRoles) {
      router.push("/dashboard");
      return;
    }
    loadDocuments();
  }, [permissions.canManageRoles, router]);

  useEffect(() => {
    applyFiltersAndGroup();
  }, [documents, filters]);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas
      const statsResponse = await api.get("/api/user-documents/stats");
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Buscar documentos
      const params = {
        page: 1,
        limit: 100,
        status: filters.status || undefined,
        documentType: filters.documentType || undefined,
      };

      const docsResponse = await api.get("/api/user-documents/pending", {
        params,
      });

      if (docsResponse.data.success) {
        const docs = docsResponse.data.data.documents.map((doc) => ({
          id: doc.id,
          userId: doc.userId,
          userName: doc.user?.name || "Usuário",
          userEmail: doc.user?.email || "",
          documentType: doc.documentType,
          status: doc.status,
          filename: doc.filename,
          s3Url: doc.s3Url,
          mimeType: doc.mimeType,
          uploadedAt: doc.uploadedAt,
          reviewedAt: doc.reviewedAt,
          reviewedBy: doc.reviewer?.name || null,
          rejectionReason: doc.rejectionReason,
        }));

        setDocuments(docs);
      }
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      showError(t("messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndGroup = () => {
    let filtered = [...documents];

    // Filtro de busca
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.userName.toLowerCase().includes(search) ||
          doc.userEmail.toLowerCase().includes(search) ||
          doc.filename.toLowerCase().includes(search)
      );
    }

    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    // Filtro de tipo de documento
    if (filters.documentType) {
      filtered = filtered.filter(
        (doc) => doc.documentType === filters.documentType
      );
    }

    // Agrupar por usuário
    const grouped = filtered.reduce((acc, doc) => {
      const existingUser = acc.find((group) => group.userId === doc.userId);
      if (existingUser) {
        existingUser.documents.push(doc);
      } else {
        acc.push({
          userId: doc.userId,
          userName: doc.userName,
          userEmail: doc.userEmail,
          documents: [doc],
        });
      }
      return acc;
    }, []);

    setGroupedDocuments(grouped);
  };

  const toggleUserExpanded = (userId) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Funções de zoom
  const handleZoomIn = () => {
    setImageModal((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.25, 3),
    }));
  };

  const handleZoomOut = () => {
    setImageModal((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.25, 0.5),
    }));
  };

  const handleResetZoom = () => {
    setImageModal((prev) => ({
      ...prev,
      zoom: 1,
    }));
  };

  const handleValidateDocument = async () => {
    if (!selectedDocument) return;

    if (validationAction === "reject" && !rejectionReason.trim()) {
      showError(t("messages.rejectionReasonRequired"));
      return;
    }

    try {
      setLoading(true);

      if (validationAction === "approve") {
        const response = await api.post(
          `/api/user-documents/admin/${selectedDocument.id}/approve`
        );

        if (response.data.success) {
          showSuccess(t("messages.approveSuccess"));
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === selectedDocument.id
                ? {
                    ...doc,
                    status: "approved",
                    reviewedAt: response.data.data.reviewedAt,
                    reviewedBy: response.data.data.reviewer?.name || null,
                    rejectionReason: null,
                  }
                : doc
            )
          );
        }
      } else {
        const response = await api.post(
          `/api/user-documents/admin/${selectedDocument.id}/reject`,
          {
            rejectionReason: rejectionReason.trim(),
          }
        );

        if (response.data.success) {
          showSuccess(t("messages.rejectSuccess"));
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === selectedDocument.id
                ? {
                    ...doc,
                    status: "rejected",
                    reviewedAt: response.data.data.reviewedAt,
                    reviewedBy: response.data.data.reviewer?.name || null,
                    rejectionReason: rejectionReason.trim(),
                  }
                : doc
            )
          );
        }
      }

      setShowValidationModal(false);
      setSelectedDocument(null);
      setRejectionReason("");

      // Recarregar estatísticas
      const statsResponse = await api.get("/api/user-documents/stats");
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error("Erro ao validar documento:", error);
      showError(error.response?.data?.message || t("messages.validationError"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return t("status.approved");
      case "pending":
        return t("status.pending");
      case "rejected":
        return t("status.rejected");
      default:
        return t("status.unknown");
    }
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case "front":
        return t("documentTypes.front");
      case "back":
        return t("documentTypes.back");
      case "selfie":
        return t("documentTypes.selfie");
      default:
        return type;
    }
  };

  const statusOptions = [
    { value: "", label: t("filters.status.all") },
    { value: "pending", label: t("status.pending") },
    { value: "approved", label: t("status.approved") },
    { value: "rejected", label: t("status.rejected") },
  ];

  const documentTypeOptions = [
    { value: "", label: t("filters.documentType.all") },
    { value: "front", label: t("documentTypes.frontDocument") },
    { value: "back", label: t("documentTypes.backDocument") },
    { value: "selfie", label: t("documentTypes.selfieDocument") },
  ];

  if (!permissions.canManageRoles) {
    return null;
  }

  return (
    <div className="space-y-6">
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
            onClick={loadDocuments}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.total")}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock
                  className="text-yellow-600 dark:text-yellow-400"
                  size={20}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.pending")}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle
                  className="text-green-600 dark:text-green-400"
                  size={20}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.approved")}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("stats.rejected")}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("filters.search.label")}
              </label>
              <div className="relative">
                <Textinput
                  placeholder={t("filters.search.placeholder")}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
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
                options={statusOptions}
                value={statusOptions.find(
                  (option) => option.value === filters.status
                )}
                onChange={(option) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: option?.value || "",
                  }))
                }
                className="react-select"
                classNamePrefix="select"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("filters.documentType.label")}
              </label>
              <Select
                options={documentTypeOptions}
                value={documentTypeOptions.find(
                  (option) => option.value === filters.documentType
                )}
                onChange={(option) =>
                  setFilters((prev) => ({
                    ...prev,
                    documentType: option?.value || "",
                  }))
                }
                className="react-select"
                classNamePrefix="select"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() =>
                  setFilters({
                    search: "",
                    status: "pending",
                    documentType: "",
                  })
                }
                className="btn-outline-secondary flex-1"
              >
                {t("buttons.clear")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Documentos Agrupados por Usuário (Accordion) */}
      <Card>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Header da Lista */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("table.title")} ({loading ? "..." : groupedDocuments.length}{" "}
              {groupedDocuments.length === 1
                ? t("table.users")
                : t("table.usersPlural")}
              )
            </h3>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-slate-600 dark:text-slate-400">
                {t("table.loading")}
              </span>
            </div>
          )}

          {!loading && groupedDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("table.empty")}
              </p>
            </div>
          )}

          {!loading &&
            groupedDocuments.map((userGroup) => {
              const isExpanded = expandedUsers.has(userGroup.userId);

              return (
                <div key={userGroup.userId}>
                  {/* Header do Usuário (Clicável) */}
                  <button
                    onClick={() => toggleUserExpanded(userGroup.userId)}
                    className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Ícone de Expansão */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="text-gray-400" size={20} />
                        ) : (
                          <ChevronRight className="text-gray-400" size={20} />
                        )}
                      </div>

                      {/* Avatar do Usuário */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                        <User
                          className="text-blue-600 dark:text-blue-400"
                          size={20}
                        />
                      </div>

                      {/* Informações do Usuário */}
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {userGroup.userName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {userGroup.userEmail}
                        </p>
                      </div>

                      {/* Badge de Contagem */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge
                          label={`${userGroup.documents.length} ${
                            userGroup.documents.length === 1
                              ? t("table.document")
                              : t("table.documentsPlural")
                          }`}
                          className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        />

                        {/* Indicadores de Status */}
                        <div className="flex items-center gap-2">
                          {userGroup.documents.some(
                            (d) => d.status === "pending"
                          ) && (
                            <div className="flex items-center gap-1">
                              <Clock className="text-yellow-500" size={16} />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {
                                  userGroup.documents.filter(
                                    (d) => d.status === "pending"
                                  ).length
                                }
                              </span>
                            </div>
                          )}
                          {userGroup.documents.some(
                            (d) => d.status === "approved"
                          ) && (
                            <div className="flex items-center gap-1">
                              <CheckCircle
                                className="text-green-500"
                                size={16}
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {
                                  userGroup.documents.filter(
                                    (d) => d.status === "approved"
                                  ).length
                                }
                              </span>
                            </div>
                          )}
                          {userGroup.documents.some(
                            (d) => d.status === "rejected"
                          ) && (
                            <div className="flex items-center gap-1">
                              <XCircle className="text-red-500" size={16} />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {
                                  userGroup.documents.filter(
                                    (d) => d.status === "rejected"
                                  ).length
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Conteúdo Expandido (Grid de Documentos) */}
                  {isExpanded && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {userGroup.documents.map((document) => (
                          <div
                            key={document.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Tipo e Status */}
                            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {getDocumentTypeLabel(document.documentType)}
                                </span>
                              </div>
                              <Badge
                                label={getStatusLabel(document.status)}
                                className={`${getStatusBadgeColor(
                                  document.status
                                )} text-white`}
                              />
                            </div>

                            {/* Imagem/PDF do Documento */}
                            <div className="p-3">
                              {document.mimeType === "application/pdf" ? (
                                <div
                                  className="w-full h-48 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() =>
                                    setImageModal({
                                      isOpen: true,
                                      imageUrl: document.s3Url,
                                      title: `${
                                        document.userName
                                      } - ${getDocumentTypeLabel(
                                        document.documentType
                                      )}`,
                                      zoom: 1,
                                      isPdf: true,
                                      mimeType: document.mimeType,
                                    })
                                  }
                                >
                                  <div className="text-center">
                                    <FileText
                                      className="text-blue-600 dark:text-blue-400 mx-auto mb-2"
                                      size={48}
                                    />
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                      {t("modal.pdfDocument")}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {t("modal.clickToView")}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={document.s3Url}
                                  alt={document.filename}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() =>
                                    setImageModal({
                                      isOpen: true,
                                      imageUrl: document.s3Url,
                                      title: `${
                                        document.userName
                                      } - ${getDocumentTypeLabel(
                                        document.documentType
                                      )}`,
                                      zoom: 1,
                                      isPdf: false,
                                      mimeType: document.mimeType,
                                    })
                                  }
                                />
                              )}
                            </div>

                            {/* Informações */}
                            <div className="px-4 pb-3">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                {t("table.uploaded")}{" "}
                                {new Date(
                                  document.uploadedAt
                                ).toLocaleDateString("pt-BR")}
                              </div>

                              {document.rejectionReason && (
                                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                  <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                    {t("table.rejectionReason")}
                                  </div>
                                  <div className="text-xs text-red-700 dark:text-red-300">
                                    {document.rejectionReason}
                                  </div>
                                </div>
                              )}

                              {/* Ações */}
                              {document.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      setSelectedDocument(document);
                                      setValidationAction("approve");
                                      setShowValidationModal(true);
                                    }}
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1.5"
                                  >
                                    <Check size={16} />
                                    <span>{t("buttons.approve")}</span>
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedDocument(document);
                                      setValidationAction("reject");
                                      setShowValidationModal(true);
                                    }}
                                    size="sm"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5"
                                  >
                                    <X size={16} />
                                    <span>{t("buttons.reject")}</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </Card>

      {/* Modal de Validação */}
      <Modal
        activeModal={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title={
          validationAction === "approve"
            ? t("modal.approveTitle")
            : t("modal.rejectTitle")
        }
        className="max-w-2xl"
        centered
        footerContent={
          <div className="flex gap-3">
            <Button
              onClick={() => setShowValidationModal(false)}
              className="btn-outline-secondary"
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              onClick={handleValidateDocument}
              isLoading={loading}
              className={`flex items-center gap-2 ${
                validationAction === "approve"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {validationAction === "approve" ? (
                <>
                  <Check size={16} />
                  <span>{t("buttons.approveDocument")}</span>
                </>
              ) : (
                <>
                  <X size={16} />
                  <span>{t("buttons.rejectDocument")}</span>
                </>
              )}
            </Button>
          </div>
        }
      >
        {selectedDocument && (
          <div className="space-y-4">
            {/* Info do Usuário */}
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <User size={18} />
              <div>
                <div className="font-medium">{selectedDocument.userName}</div>
                <div className="text-sm opacity-70">
                  {selectedDocument.userEmail}
                </div>
              </div>
            </div>

            {/* Imagem/PDF */}
            <div className="border rounded-lg p-4">
              {selectedDocument.mimeType === "application/pdf" ? (
                <div
                  className="w-full max-h-96 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity p-12"
                  onClick={() =>
                    setImageModal({
                      isOpen: true,
                      imageUrl: selectedDocument.s3Url,
                      title: `${
                        selectedDocument.userName
                      } - ${getDocumentTypeLabel(
                        selectedDocument.documentType
                      )}`,
                      zoom: 1,
                      isPdf: true,
                      mimeType: selectedDocument.mimeType,
                    })
                  }
                >
                  <div className="text-center">
                    <FileText
                      className="text-blue-600 dark:text-blue-400 mx-auto mb-3"
                      size={64}
                    />
                    <p className="text-lg text-blue-700 dark:text-blue-300 font-medium">
                      {t("modal.pdfDocument")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {t("modal.clickToViewFullscreen")}
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={selectedDocument.s3Url}
                  alt={selectedDocument.filename}
                  className="w-full max-h-96 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    setImageModal({
                      isOpen: true,
                      imageUrl: selectedDocument.s3Url,
                      title: `${
                        selectedDocument.userName
                      } - ${getDocumentTypeLabel(
                        selectedDocument.documentType
                      )}`,
                      zoom: 1,
                      isPdf: false,
                      mimeType: selectedDocument.mimeType,
                    })
                  }
                />
              )}
            </div>

            {/* Detalhes */}
            <div className="grid grid-cols-2 gap-4 text-sm p-3 rounded-lg border">
              <div>
                <span className="opacity-70">{t("table.type")}</span>
                <span className="ml-2 font-medium">
                  {getDocumentTypeLabel(selectedDocument.documentType)}
                </span>
              </div>
              <div>
                <span className="opacity-70">{t("table.file")}</span>
                <span className="ml-2 break-all">
                  {selectedDocument.filename}
                </span>
              </div>
            </div>

            {/* Campo de Rejeição */}
            {validationAction === "reject" && (
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-white" : "text-slate-700"
                  }`}
                >
                  {t("modal.rejectionReasonLabel")}
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t("modal.rejectionReasonPlaceholder")}
                  row={4}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Visualização de Imagem/PDF com Zoom */}
      <Transition appear show={imageModal.isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[99999]"
          onClose={() =>
            setImageModal({
              isOpen: false,
              imageUrl: null,
              title: null,
              zoom: 1,
              isPdf: false,
              mimeType: null,
            })
          }
        >
          {/* Backdrop escuro */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black backdrop-filter backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-full">
                <div className="w-full h-full flex flex-col">
                  {/* Header com fundo sólido */}
                  <div className="bg-slate-900 border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-white font-semibold text-lg">
                        {imageModal.title}
                      </Dialog.Title>
                      <div className="flex items-center gap-3">
                        {/* Controles de Zoom - apenas para imagens */}
                        {!imageModal.isPdf && (
                          <>
                            <div className="flex items-center gap-2 bg-slate-800 rounded-md border border-slate-600 p-1">
                              <button
                                onClick={handleZoomOut}
                                disabled={imageModal.zoom <= 0.5}
                                className="text-slate-300 hover:text-white hover:bg-slate-700 rounded p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("imageModal.zoomOut")}
                              >
                                <ZoomOut size={18} />
                              </button>
                              <span className="text-white text-sm font-medium px-2 min-w-[60px] text-center">
                                {Math.round(imageModal.zoom * 100)}%
                              </span>
                              <button
                                onClick={handleZoomIn}
                                disabled={imageModal.zoom >= 3}
                                className="text-slate-300 hover:text-white hover:bg-slate-700 rounded p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={t("imageModal.zoomIn")}
                              >
                                <ZoomIn size={18} />
                              </button>
                            </div>

                            {/* Botão Reset Zoom (1:1) */}
                            {imageModal.zoom !== 1 && (
                              <button
                                onClick={handleResetZoom}
                                className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded px-3 py-1.5 text-sm transition-colors border border-slate-600"
                                title={t("imageModal.resetZoom")}
                              >
                                1:1
                              </button>
                            )}
                          </>
                        )}

                        {/* Botão Fechar */}
                        <button
                          onClick={() =>
                            setImageModal({
                              isOpen: false,
                              imageUrl: null,
                              title: null,
                              zoom: 1,
                              isPdf: false,
                              mimeType: null,
                            })
                          }
                          className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full p-2 transition-colors"
                          title={t("imageModal.close")}
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Área da Imagem/PDF com fundo escuro */}
                  <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-slate-950">
                    {imageModal.isPdf ? (
                      <iframe
                        src={imageModal.imageUrl}
                        className="w-full h-full rounded-lg shadow-2xl"
                        title={imageModal.title}
                      />
                    ) : (
                      <img
                        src={imageModal.imageUrl}
                        alt={imageModal.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-150 rounded-lg shadow-2xl"
                        style={{ transform: `scale(${imageModal.zoom})` }}
                      />
                    )}
                  </div>

                  {/* Footer com fundo sólido */}
                  <div className="bg-slate-900 border-t border-slate-700 p-4">
                    <p className="text-slate-300 text-sm text-center">
                      {imageModal.isPdf
                        ? t("imageModal.pdfInstructions")
                        : t("imageModal.imageInstructions")}
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SystemDocumentValidationPage;

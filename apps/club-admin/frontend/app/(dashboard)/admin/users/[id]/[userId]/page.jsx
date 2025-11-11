"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from 'react-i18next';
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Textarea from "@/components/ui/Textarea";
import Tooltip from "@/components/ui/Tooltip";
import Select from "react-select";
import Icon from "@/components/ui/Icon";
import Switch from "@/components/ui/Switch";
import usePermissions from "@/hooks/usePermissions";
import { useAlertContext } from "@/contexts/AlertContext";
import { useNotifications } from "@/hooks/useNotifications";
import { userService } from "@/services/api";
import TrackingParcel from "@/components/partials/widget/activity";
import UserDocumentsTab from "@/components/system/UserDocumentsTab";
import UserBalancesTab from "@/components/system/UserBalancesTab";
import Disable2FAAdmin from "@/components/admin/Disable2FAAdmin";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Building,
  Globe,
  FileCheck,
  FileX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Save,
  Edit,
  Eye,
  EyeOff,
  Coins,
} from "lucide-react";

const UserProfilePage = () => {
  const { t } = useTranslation('admin');
  // console.log('🚀 ADMIN USER PROFILE PAGE CARREGADO!!!');
  const { showSuccess, showError, showInfo } = useAlertContext();
  const router = useRouter();
  const { userId } = useParams();
  const permissions = usePermissions();
  const { sendNotification, loading: notificationLoading } = useNotifications();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [userActions, setUserActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);

  // Estados para edição
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    isActive: true,
    userPlan: "BASIC",
    userCompanies: [],
  });

  // Função para formatar telefone
  const formatPhone = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    if (phoneNumber.length <= 2) return `(${phoneNumber}`;
    if (phoneNumber.length <= 6)
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    if (phoneNumber.length <= 10)
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
        2,
        6
      )}-${phoneNumber.slice(6)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
      2,
      7
    )}-${phoneNumber.slice(7, 11)}`;
  };

  // Função para formatar CPF
  const formatCPF = (value) => {
    if (!value) return value;
    const cpfNumber = value.replace(/[^\d]/g, "");
    if (cpfNumber.length <= 3) return cpfNumber;
    if (cpfNumber.length <= 6)
      return `${cpfNumber.slice(0, 3)}.${cpfNumber.slice(3)}`;
    if (cpfNumber.length <= 9)
      return `${cpfNumber.slice(0, 3)}.${cpfNumber.slice(
        3,
        6
      )}.${cpfNumber.slice(6)}`;
    return `${cpfNumber.slice(0, 3)}.${cpfNumber.slice(3, 6)}.${cpfNumber.slice(
      6,
      9
    )}-${cpfNumber.slice(9, 11)}`;
  };

  // Estado para notificação
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (!permissions.canViewCompanySettings) {
      router.push("/dashboard");
      return;
    }
    loadUser();
  }, [userId, permissions.canViewCompanySettings, router]);

  // Carregar ações quando a aba activity for selecionada
  useEffect(() => {
    if (activeTab === "activity" && userId) {
      loadUserActions();
    }
  }, [activeTab, userId]);

  // Debug: Monitorar mudanças no estado user
  useEffect(() => {
    // console.log('👤 User state changed:', user);
    if (user) {
      // console.log('📍 User details - Name:', user.name, 'Email:', user.email, 'Phone:', user.phone);
    }
  }, [user]);

  // Debug: Monitorar mudanças no estado editData
  useEffect(() => {
    // console.log('✏️ EditData state changed:', editData);
  }, [editData]);

  const loadUserActions = async () => {
    if (!userId) return;

    try {
      setLoadingActions(true);
      // console.log('🔍 Carregando ações para userId:', userId);

      const response = await userService.getUserActions(userId, {
        limit: 20,
        orderBy: "performedAt",
        orderDirection: "desc",
      });

      // console.log('🔍 Resposta da API getUserActions:', response);

      if (response.success && response.data) {
        // console.log('✅ Ações encontradas:', response.data);
        // O backend retorna { actions, total, page, totalPages }
        const actions = response.data.actions || response.data;
        setUserActions(actions);
      } else {
        // console.log('⚠️ Nenhuma ação encontrada ou resposta inválida');
        setUserActions([]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar ações do usuário:", error);
      setUserActions([]);
    } finally {
      setLoadingActions(false);
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      // console.log('🔍 Carregando usuário com ID:', userId);

      const response = await userService.getUserById(userId);
      // console.log('📊 Resposta recebida:', response);

      // Verificar a estrutura da resposta - pode ser {success, data} ou diretamente o usuário
      let userData = null;

      // Debug detalhado da estrutura
      // console.log('🔍 Analisando estrutura da resposta:');
      // console.log('- typeof response:', typeof response);
      // console.log('- response:', response);
      // console.log('- response.success:', response?.success);
      // console.log('- response.data:', response?.data);
      // console.log('- response.id:', response?.id);

      if (response && response.success && response.data) {
        // A API retorna { success: true, data: { user: { id, name, ... } } }
        userData = response.data.user || response.data;
        // console.log('📌 Usando response.data.user ou response.data:', userData);
      } else if (response && response.id) {
        // Formato: usuário direto
        userData = response;
        // console.log('📌 Usando response diretamente:', userData);
      } else {
        console.error("❌ Estrutura de resposta não reconhecida:", response);
      }

      if (userData && userData.id) {
        // Extrair role das userCompanies e plano do usuário
        let primaryRole = "USER";
        let primaryPlan = userData.userPlan || "BASIC"; // O plano vem do próprio usuário
        let userRoles = [];

        if (userData.userCompanies && userData.userCompanies.length > 0) {
          // console.log('📋 UserCompanies encontradas:', userData.userCompanies);

          // Coletar todas as roles
          userData.userCompanies.forEach((uc) => {
            if (uc.role) userRoles.push(uc.role);
          });

          // Definir hierarquia de roles (do maior para menor)
          const roleHierarchy = ["SUPER_ADMIN", "APP_ADMIN", "ADMIN", "USER"];

          // Buscar a role mais alta
          for (const role of roleHierarchy) {
            if (userRoles.includes(role)) {
              primaryRole = role;
              break;
            }
          }

          // console.log('✅ Roles encontradas:', userRoles);
          // console.log('✅ Role primária selecionada:', primaryRole);
        }

        // console.log('✅ Plano do usuário:', primaryPlan);

        const finalUserData = {
          id: userData.id,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          cpf: userData.cpf || "",
          birthDate: userData.birthDate,
          isActive: userData.isActive ?? true,
          createdAt: userData.createdAt,
          publicKey: userData.publicKey,
          privateKey: userData.privateKey,
          userCompanies: userData.userCompanies,
          role: primaryRole,
          plan: primaryPlan,
          allRoles: userRoles,
        };

        const finalEditData = {
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          cpf: userData.cpf || "",
          birthDate: userData.birthDate || "",
          isActive: userData.isActive ?? true,
          userPlan: primaryPlan,
          userCompanies:
            userData.userCompanies?.map((uc) => ({
              id: uc.id,
              role: uc.role,
              companyId: uc.companyId,
              company: uc.company,
            })) || [],
        };

        // console.log('✅ Dados processados - User:', finalUserData);
        // console.log('✅ Dados processados - Edit:', finalEditData);

        // Definir os estados
        setUser(finalUserData);
        setEditData(finalEditData);
        setLoading(false);
      } else {
        console.error(
          "❌ Usuário não encontrado ou dados inválidos:",
          response
        );
        showError(t('users.profile.messages.userNotFound'));
        setLoading(false);
        router.push("/admin/users");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar usuário:", error);
      showError(t('users.profile.messages.errorLoadingUser'));
      setLoading(false);
      router.push("/admin/users");
    }
  };

  const handleSave = async () => {
    if (!permissions.canViewCompanySettings) {
      showError(t('users.messages.noPermission'));
      return;
    }

    try {
      setSaving(true);

      // Preparar dados limpos para atualização (remover campos complexos)
      const cleanedData = {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        cpf: editData.cpf,
        birthDate: editData.birthDate || null,
        isActive: editData.isActive,
        userPlan: editData.userPlan,
      };

      // console.log('🔍 Dados limpos sendo enviados para atualização:', cleanedData);
      // console.log('🔍 User ID:', userId);
      const response = await userService.updateUser(userId, cleanedData);

      if (response.success) {
        setUser({ ...user, ...editData });
        setEditMode(false);
        showSuccess(t('users.profile.messages.updated'));
      } else {
        showError(t('users.profile.messages.errorUpdate'));
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      showError(t('users.profile.messages.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotification = async () => {
    // console.log('🔍 UserProfilePage - handleSendNotification called');
    // console.log('🔍 Notification data:', notification);
    // console.log('🔍 User ID:', userId);

    if (!notification.title || !notification.message) {
      // console.log('❌ Validation failed: title or message empty');
      showError(t('users.profile.notifications.errorValidation'));
      return;
    }

    try {
      setSaving(true);
      // console.log('📤 Calling sendNotification API...');

      const result = await sendNotification(userId, {
        title: notification.title,
        message: notification.message,
        type: notification.type || "info",
        priority: "normal",
        category: "general",
      });

      // console.log('✅ Notification sent successfully:', result);
      showSuccess(t('users.profile.notifications.successSent'));
      setNotification({ title: "", message: "", type: "info" });
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      showError(error.message || t('users.profile.notifications.errorSending'));
    } finally {
      setSaving(false);
    }
  };


  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-500";
      case "APP_ADMIN":
        return "bg-orange-500";
      case "ADMIN":
        return "bg-blue-500";
      case "USER":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive ? "bg-green-500" : "bg-gray-500";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "APP_ADMIN":
        return "Admin da Empresa";
      case "ADMIN":
        return "Administrador";
      case "USER":
        return "Usuário";
      default:
        return role;
    }
  };

  const getPlanLabel = (plan) => {
    switch (plan) {
      case "BASIC":
        return "Básico";
      case "PRO":
        return "Pro";
      case "PREMIUM":
        return "Premium";
      default:
        return plan || "Não definido";
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case "BASIC":
        return "bg-gray-500";
      case "PRO":
        return "bg-blue-500";
      case "PREMIUM":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      authentication: t('users.profile.activity.categories.authentication'),
      financial: t('users.profile.activity.categories.financial'),
      profile: t('users.profile.activity.categories.profile'),
      security: t('users.profile.activity.categories.security'),
      system: t('users.profile.activity.categories.system'),
    };
    return categoryLabels[category] || category;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      success: t('users.profile.activity.statuses.success'),
      pending: t('users.profile.activity.statuses.pending'),
      failed: t('users.profile.activity.statuses.failed'),
      error: t('users.profile.activity.statuses.error'),
    };
    return statusLabels[status] || status;
  };

  const getActionLabel = (action) => {
    const actionKey = `users.profile.activity.actions.${action}`;
    const translated = t(actionKey);
    // Se a tradução retornar a própria chave, significa que não existe tradução
    return translated !== actionKey ? translated : action;
  };

  // Converter userActions para o formato esperado pelo TrackingParcel
  const convertActionsToTrackingList = (actions) => {
    return actions.map((action) => ({
      title: getActionLabel(action.action),
      desc: `${t('users.profile.activity.category')}: ${getCategoryLabel(action.category)} - ${t('users.profile.activity.status')}: ${getStatusLabel(action.status)}`,
      date: action.performedAt
        ? new Date(action.performedAt).toLocaleDateString("pt-BR")
        : "",
      time: action.performedAt
        ? new Date(action.performedAt).toLocaleTimeString("pt-BR")
        : "",
      status: action.status === "success" ? "ok" : "error",
    }));
  };

  const formatRolesDisplay = (primaryRole, allRoles) => {
    if (!allRoles || allRoles.length === 0) return getRoleLabel(primaryRole);

    if (allRoles.length === 1) {
      return getRoleLabel(primaryRole);
    }

    // Se tiver múltiplas roles diferentes, mostrar a primária + outras
    const uniqueRoles = [...new Set(allRoles)];
    if (uniqueRoles.length > 1) {
      const otherRoles = uniqueRoles.filter((role) => role !== primaryRole);
      return `${getRoleLabel(primaryRole)} (+${otherRoles.length} outras)`;
    }

    return getRoleLabel(primaryRole);
  };

  const roleOptions = [
    { value: "USER", label: "Usuário" },
    { value: "ADMIN", label: "Administrador" },
    { value: "APP_ADMIN", label: "Admin da Empresa" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
  ];

  const planOptions = [
    { value: "BASIC", label: "Básico" },
    { value: "PRO", label: "Pro" },
    { value: "PREMIUM", label: "Premium" },
  ];

  const handleCompanyRoleChange = (companyIndex, newRole) => {
    const updatedCompanies = [...editData.userCompanies];
    updatedCompanies[companyIndex] = {
      ...updatedCompanies[companyIndex],
      role: newRole,
    };
    setEditData({
      ...editData,
      userCompanies: updatedCompanies,
    });
  };

  const notificationTypeOptions = [
    { value: "info", label: t('users.profile.notifications.types.info') },
    { value: "success", label: t('users.profile.notifications.types.success') },
    { value: "warning", label: t('users.profile.notifications.types.warning') },
    { value: "error", label: t('users.profile.notifications.types.error') },
  ];

  const tabs = [
    { id: "profile", label: t('users.profile.tabs.profile'), icon: User },
    { id: "balances", label: t('users.profile.tabs.balances'), icon: Coins },
    { id: "documents", label: t('users.profile.tabs.documents'), icon: FileCheck },
    { id: "activity", label: t('users.profile.tabs.activity'), icon: Calendar },
    { id: "notifications", label: t('users.profile.tabs.notifications'), icon: Bell },
  ];

  if (!permissions.canViewCompanySettings) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {t('users.loadingProfile')}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // console.log('⚠️ User state is null or undefined:', user);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {t('users.loadingProfile')}
          </p>
        </div>
      </div>
    );
  }

  // console.log('✅ Renderizando com usuário:', user);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Tooltip content={t('users.profile.backToUsers')} placement="bottom">
            <button
              onClick={() => router.push("/admin/users")}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
            >
              <ArrowLeft
                size={16}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.name || t('users.profile.noName')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
              {user.email || t('users.profile.noEmail')}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
          <Badge
            label={formatRolesDisplay(user.role, user.allRoles)}
            className={`${getRoleBadgeColor(user.role)} text-white w-full md:w-auto text-center`}
          />
          <Badge
            label={getPlanLabel(user.plan)}
            className={`${getPlanBadgeColor(user.plan)} text-white w-full md:w-auto text-center`}
          />
          <Badge
            label={user.isActive ? t('users.status.active') : t('users.status.inactive')}
            className={`${getStatusBadgeColor(user.isActive)} text-white w-full md:w-auto text-center`}
          />
        </div>
      </div>

      {/* Tabs */}
      <Card>
        {/* Tabs - Desktop Single Row */}
        <div className="hidden md:block border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tabs - Mobile Grid (2x2) */}
        <div className="md:hidden border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center py-3 px-2 border-b-2 font-medium text-xs transition-all ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={16} className="mr-1.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Perfil */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Botão Editar no topo da aba */}
              {permissions.canViewCompanySettings && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('users.profile.status')}
                    </span>
                    {editMode ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          value={editData.isActive}
                          onChange={(value) =>
                            setEditData({ ...editData, isActive: value })
                          }
                        />
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                            editData.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400"
                          }`}
                        >
                          <Icon
                            icon={
                              editData.isActive
                                ? "heroicons-solid:check-circle"
                                : "heroicons-solid:x-circle"
                            }
                            className="w-3 h-3 mr-1.5"
                          />
                          {editData.isActive ? t('users.status.active').toUpperCase() : t('users.status.inactive').toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                          user.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400"
                        }`}
                      >
                        <Icon
                          icon={
                            user.isActive
                              ? "heroicons-solid:check-circle"
                              : "heroicons-solid:x-circle"
                          }
                          className="w-3 h-3 mr-1.5"
                        />
                        {user.isActive ? t('users.status.active').toUpperCase() : t('users.status.inactive').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {editMode && (
                      <Button
                        onClick={handleSave}
                        isLoading={saving}
                        className="!bg-primary !hover:bg-primary-600 !text-white !border-primary hover:!border-primary-600 flex items-center justify-center"
                      >
                        <Save size={16} className="mr-2" />
                        <span>{t('users.profile.save')}</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => setEditMode(!editMode)}
                      className={`flex items-center justify-center ${
                        editMode
                          ? "!bg-red-500 !hover:bg-red-600 !text-white !border-red-500 hover:!border-red-600"
                          : "!bg-primary !hover:bg-primary-600 !text-white !border-primary hover:!border-primary-600"
                      }`}
                    >
                      <Edit size={16} className="mr-2" />
                      <span>{editMode ? t('users.profile.cancel') : t('users.profile.edit')}</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.profile.fields.fullName')}
                      </label>
                      {editMode ? (
                        <Textinput
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          placeholder={t('users.profile.fields.fullNamePlaceholder')}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {user.name || t('users.profile.fields.notProvided')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.profile.fields.email')}
                      </label>
                      {editMode ? (
                        <Tooltip content="Este campo não pode ser editado!" placement="top">
                          <div>
                            <Textinput
                              defaultValue={editData.email}
                              readOnly
                              placeholder={t('users.profile.fields.emailPlaceholder')}
                              type="email"
                              className="bg-gray-50 cursor-not-allowed pointer-events-none"
                              tabIndex={-1}
                            />
                          </div>
                        </Tooltip>
                      ) : (
                        <p className="text-slate-900 dark:text-white break-all text-sm">
                          {user.email || t('users.profile.fields.notProvided')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.profile.fields.phone')}
                      </label>
                      {editMode ? (
                        <Textinput
                          value={formatPhone(editData.phone)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^\d]/g, "");
                            setEditData({ ...editData, phone: rawValue });
                          }}
                          placeholder={t('users.profile.fields.phonePlaceholder')}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {formatPhone(user.phone) || t('users.profile.fields.notProvided')}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.profile.fields.birthDate')}
                      </label>
                      {editMode ? (
                        <Textinput
                          value={
                            editData.birthDate
                              ? new Date(editData.birthDate).toISOString().split('T')[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditData({ ...editData, birthDate: e.target.value })
                          }
                          type="date"
                          placeholder={t('users.profile.fields.birthDatePlaceholder')}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {user.birthDate
                            ? new Date(user.birthDate).toLocaleDateString("pt-BR")
                            : t('users.profile.fields.notProvided')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.profile.fields.cpf')}
                      </label>
                      {editMode ? (
                        <Tooltip content={t('users.profile.fields.cannotEdit')} placement="top">
                          <div>
                            <Textinput
                              defaultValue={formatCPF(user.cpf) || ""}
                              readOnly
                              placeholder={t('users.profile.fields.cpfPlaceholder')}
                              className="bg-gray-50 cursor-not-allowed pointer-events-none"
                              tabIndex={-1}
                            />
                          </div>
                        </Tooltip>
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {formatCPF(user.cpf) || t('users.profile.fields.notProvided')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('users.profile.fields.blockchainAddress')}
                      </label>
                      {editMode ? (
                        <Tooltip content={t('users.profile.fields.cannotEdit')} placement="top">
                          <div>
                            <Textinput
                              defaultValue={user.publicKey || ""}
                              readOnly
                              placeholder={t('users.profile.fields.blockchainPlaceholder')}
                              className="bg-gray-50 cursor-not-allowed pointer-events-none"
                              tabIndex={-1}
                            />
                          </div>
                        </Tooltip>
                      ) : (
                        <p className="text-slate-900 dark:text-white break-all text-sm">
                          {user.publicKey || t('users.profile.fields.walletNotGenerated')}
                        </p>
                      )}
                    </div>

                    {permissions.canViewSensitiveData && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('users.profile.fields.privateKey')}
                        </label>
                        <p className="text-slate-900 dark:text-white break-all text-sm font-mono bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-2 rounded border border-red-200 dark:border-red-800">
                          {user.privateKey ? "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••" : t('users.profile.fields.notAvailable')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin 2FA Management */}
                {permissions.canViewCompanySettings && (
                  <div className="mt-6">
                    <Disable2FAAdmin userId={userId} onDisabled={loadUser} />
                  </div>
                )}

            </div>
          )}

          {/* Tab: Saldos */}
          {activeTab === "balances" && (
            <UserBalancesTab userId={userId} />
          )}

          {/* Tab: Documentos */}
          {activeTab === "documents" && (
            <UserDocumentsTab userId={userId} />
          )}

          {/* Tab: Atividade */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('users.profile.activity.title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('users.profile.activity.subtitle')}
                  </p>
                </div>
                <button
                  onClick={loadUserActions}
                  disabled={loadingActions}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {loadingActions ? t('users.profile.activity.updating') : t('users.profile.activity.update')}
                </button>
              </div>

              {loadingActions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : userActions.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
                  <TrackingParcel
                    lists={convertActionsToTrackingList(userActions)}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('users.profile.activity.noActivity')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {t('users.profile.activity.noActivityDesc')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Notificações */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('users.profile.notifications.sendTo', { name: user.name })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.profile.notifications.title')}
                    </label>
                    <Textinput
                      value={notification.title}
                      onChange={(e) =>
                        setNotification({
                          ...notification,
                          title: e.target.value,
                        })
                      }
                      placeholder={t('users.profile.notifications.titlePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.profile.notifications.type')}
                    </label>
                    <Select
                      options={notificationTypeOptions}
                      value={notificationTypeOptions.find(
                        (option) => option.value === notification.type
                      )}
                      onChange={(option) =>
                        setNotification({ ...notification, type: option.value })
                      }
                      className="react-select"
                      classNamePrefix="select"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('users.profile.notifications.message')}
                  </label>
                  <Textarea
                    value={notification.message}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        message: e.target.value,
                      })
                    }
                    placeholder={t('users.profile.notifications.messagePlaceholder')}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSendNotification}
                    isLoading={saving || notificationLoading}
                  >
                    <Bell size={16} className="mr-2" />
                    {t('users.profile.notifications.send')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserProfilePage;
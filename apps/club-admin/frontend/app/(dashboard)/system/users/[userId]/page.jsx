"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import UserFeesTab from "@/components/system/UserFeesTab";
import Disable2FAAdmin from "@/components/admin/Disable2FAAdmin";
import { useTranslation } from '@/hooks/useTranslation';
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
  DollarSign,
} from "lucide-react";

const UserProfilePage = () => {
  const { t } = useTranslation('systemUsers');
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
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }
    loadUser();
  }, [userId, permissions.canViewSystemSettings, router]);

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
        showError(t('userDetails.messages.userNotFound'));
        setLoading(false);
        router.push("/system/users");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar usuário:", error);
      showError(t('userDetails.messages.loadError'));
      setLoading(false);
      router.push("/system/users");
    }
  };

  const handleSave = async () => {
    if (!permissions.canManageRoles) {
      showError(t('userDetails.messages.noPermissionEdit'));
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
        showSuccess(t('userDetails.messages.updateSuccess'));
      } else {
        showError(t('userDetails.messages.updateError'));
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      showError(t('userDetails.messages.saveError'));
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
      showError(t('userDetails.messages.notificationRequired'));
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
      showSuccess(t('userDetails.messages.notificationSuccess'));
      setNotification({ title: "", message: "", type: "info" });
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      showError(error.message || t('userDetails.messages.notificationError'));
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
    return t(`roles.${role}`);
  };

  const getPlanLabel = (plan) => {
    if (!plan) {
      return t('userDetails.plans.notDefined');
    }
    return t(`userDetails.plans.${plan}`, { defaultValue: t('userDetails.plans.notDefined') });
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

  const getActionLabel = (action) => {
    return t(`userDetails.activity.actions.${action}`, { defaultValue: action });
  };

  // Converter userActions para o formato esperado pelo TrackingParcel
  const convertActionsToTrackingList = (actions) => {
    return actions.map((action) => ({
      title: getActionLabel(action.action),
      desc: `${t('userDetails.activity.category')}: ${action.category} - ${t('userDetails.activity.status')}: ${action.status}`,
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
    { value: "USER", label: t('roles.USER') },
    { value: "ADMIN", label: t('roles.ADMIN') },
    { value: "APP_ADMIN", label: t('roles.APP_ADMIN') },
    { value: "SUPER_ADMIN", label: t('roles.SUPER_ADMIN') },
  ];

  const planOptions = [
    { value: "BASIC", label: t('userDetails.plans.BASIC') },
    { value: "PRO", label: t('userDetails.plans.PRO') },
    { value: "PREMIUM", label: t('userDetails.plans.PREMIUM') },
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
    { value: "info", label: t('userDetails.notifications.types.info') },
    { value: "success", label: t('userDetails.notifications.types.success') },
    { value: "warning", label: t('userDetails.notifications.types.warning') },
    { value: "error", label: t('userDetails.notifications.types.error') },
  ];

  const tabs = [
    { id: "profile", label: t('userDetails.tabs.profile'), icon: User },
    { id: "balances", label: t('userDetails.tabs.balances'), icon: Coins },
    { id: "fees", label: t('userDetails.tabs.fees'), icon: DollarSign },
    { id: "documents", label: t('userDetails.tabs.documents'), icon: FileCheck },
    { id: "activity", label: t('userDetails.tabs.activity'), icon: Calendar },
    { id: "notifications", label: t('userDetails.tabs.notifications'), icon: Bell },
  ];

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {t('userDetails.loading')}
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
            {t('userDetails.loadingData')}
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
          <Tooltip content={t('userDetails.backButton')} placement="bottom">
            <button
              onClick={() => router.push("/system/users")}
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
              {user.name || t('userDetails.noName')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
              {user.email || t('userDetails.noEmail')}
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
            label={user.isActive ? t('userDetails.status.active') : t('userDetails.status.inactive')}
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
              {permissions.canManageRoles && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? "outline" : "primary"}
                  >
                    <Edit size={16} className="mr-2" />
                    {editMode ? t('userDetails.profile.cancelButton') : t('userDetails.profile.editButton')}
                  </Button>
                </div>
              )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('userDetails.profile.fullName')}
                      </label>
                      {editMode ? (
                        <Textinput
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          placeholder={t('userDetails.profile.fullNamePlaceholder')}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {user.name || t('userDetails.profile.notInformed')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('userDetails.profile.email')}
                      </label>
                      {editMode ? (
                        <Textinput
                          defaultValue={editData.email}
                          readOnly
                          placeholder={t('userDetails.profile.emailPlaceholder')}
                          type="email"
                          className="bg-gray-50 cursor-not-allowed pointer-events-none"
                          tabIndex={-1}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white break-all text-sm">
                          {user.email || t('userDetails.profile.notInformed')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('userDetails.profile.phone')}
                      </label>
                      {editMode ? (
                        <Textinput
                          value={formatPhone(editData.phone)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^\d]/g, "");
                            setEditData({ ...editData, phone: rawValue });
                          }}
                          placeholder={t('userDetails.profile.phonePlaceholder')}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {formatPhone(user.phone) || t('userDetails.profile.notInformed')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('userDetails.profile.cpf')}
                      </label>
                      {editMode ? (
                        <Textinput
                          value={formatCPF(editData.cpf)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^\d]/g, "");
                            setEditData({ ...editData, cpf: rawValue });
                          }}
                          placeholder={t('userDetails.profile.cpfPlaceholder')}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {formatCPF(user.cpf) || t('userDetails.profile.notInformed')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('userDetails.profile.userPlan')}
                      </label>
                      {editMode ? (
                        <Select
                          options={planOptions}
                          value={planOptions.find(
                            (option) =>
                              option.value === (editData.userPlan || "BASIC")
                          )}
                          onChange={(option) =>
                            setEditData({
                              ...editData,
                              userPlan: option?.value || "BASIC",
                            })
                          }
                          className="react-select"
                          classNamePrefix="select"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {getPlanLabel(user.plan)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('userDetails.profile.birthDate')}
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
                          placeholder={t('userDetails.profile.birthDatePlaceholder')}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white">
                          {user.birthDate
                            ? new Date(user.birthDate).toLocaleDateString("pt-BR")
                            : t('userDetails.profile.notInformed')}
                        </p>
                      )}
                    </div>

                    {permissions.canViewSensitiveData && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('userDetails.profile.azoreWallet')}
                        </label>
                        {editMode ? (
                          <Textinput
                            defaultValue={user.publicKey || ""}
                            readOnly
                            placeholder={t('userDetails.profile.walletPublicKey')}
                            className="bg-gray-50 cursor-not-allowed pointer-events-none"
                            tabIndex={-1}
                          />
                        ) : (
                          <p className="text-slate-900 dark:text-white break-all text-sm">
                            {user.publicKey || t('userDetails.profile.notGenerated')}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('userDetails.profile.status')}
                      </label>
                      {editMode ? (
                        <div className="flex items-center space-x-3 mt-3">
                          <Switch
                            value={editData.isActive}
                            onChange={(value) =>
                              setEditData({ ...editData, isActive: value })
                            }
                            label=""
                          />
                          <div className="flex items-center space-x-2">
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
                              {editData.isActive ? t('userDetails.profile.active') : t('userDetails.profile.inactive')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-2">
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
                            {user.isActive ? t('userDetails.profile.active') : t('userDetails.profile.inactive')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin 2FA Management */}
                {permissions.canManageRoles && (
                  <div className="mt-6">
                    <Disable2FAAdmin userId={userId} onDisabled={loadUser} />
                  </div>
                )}

                {/* Seção Empresas e Roles */}
                {user.userCompanies && user.userCompanies.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      {t('userDetails.profile.linkedCompanies', { count: user.userCompanies.length })}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {user.userCompanies.map((uc, index) => {
                        return (
                          <div
                            key={index}
                            className="group relative bg-gradient-to-br from-white via-white to-gray-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 opacity-5 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative mb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                      <span className="text-white text-lg font-bold tracking-wide">
                                        {(uc.company?.name || "N")
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                    <div
                                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                                        uc.company?.isActive
                                          ? "bg-emerald-500 shadow-lg shadow-emerald-500 shadow-opacity-30"
                                          : "bg-red-500 shadow-lg shadow-red-500 shadow-opacity-30"
                                      }`}
                                    >
                                      <div
                                        className={`absolute inset-1 rounded-full ${
                                          uc.company?.isActive
                                            ? "bg-emerald-300"
                                            : "bg-red-300"
                                        } animate-pulse`}
                                      ></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end">
                                  {editMode ? (
                                    <Select
                                      options={roleOptions}
                                      value={roleOptions.find(
                                        (option) =>
                                          option.value ===
                                          (editData.userCompanies[index]?.role ||
                                            uc.role)
                                      )}
                                      onChange={(option) =>
                                        handleCompanyRoleChange(
                                          index,
                                          option?.value || "USER"
                                        )
                                      }
                                      className="react-select text-xs"
                                      style={{ minWidth: "120px" }}
                                      classNamePrefix="select"
                                      styles={{
                                        control: (base) => ({
                                          ...base,
                                          minHeight: "32px",
                                          fontSize: "12px",
                                        }),
                                        option: (base) => ({
                                          ...base,
                                          fontSize: "12px",
                                        }),
                                      }}
                                    />
                                  ) : (
                                    <Badge
                                      label={getRoleLabel(uc.role)}
                                      className={`${getRoleBadgeColor(
                                        uc.role
                                      )} text-white text-xs px-3 py-1.5 font-semibold shadow-md transform group-hover:scale-105 transition-transform duration-200`}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="relative space-y-3">
                              <div>
                                <h4
                                  className="font-bold text-gray-900 dark:text-white text-base mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
                                  title={uc.company?.name}
                                >
                                  {uc.company?.name || t('userDetails.profile.companyNotAvailable')}
                                </h4>
                                <p
                                  className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                                  title={uc.company?.alias}
                                >
                                  @{uc.company?.alias || t('userDetails.profile.noAlias')}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700 dark:border-opacity-50">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide ${
                                    uc.company?.isActive
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900 dark:bg-opacity-20 dark:text-emerald-400 dark:border-emerald-800"
                                      : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400 dark:border-red-800"
                                  }`}
                                >
                                  <Icon
                                    icon={
                                      uc.company?.isActive
                                        ? "heroicons-solid:check-circle"
                                        : "heroicons-solid:x-circle"
                                    }
                                    className="w-3 h-3 mr-1.5"
                                  />
                                  {uc.company?.isActive ? t('userDetails.profile.companyActive') : t('userDetails.profile.companyInactive')}
                                </span>

                                {uc.linkedAt && (
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                      {t('userDetails.profile.linkedSince')}
                                    </span>
                                    <span
                                      className="text-xs text-gray-600 dark:text-gray-300 font-semibold"
                                      title={`Vinculado em ${new Date(
                                        uc.linkedAt
                                      ).toLocaleDateString("pt-BR")}`}
                                    >
                                      {new Date(uc.linkedAt).toLocaleDateString(
                                        "pt-BR",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          year: "2-digit",
                                        }
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500 pointer-events-none"></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {editMode && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={() => setEditMode(false)} variant="outline">
                      {t('userDetails.profile.cancelButton')}
                    </Button>
                    <Button onClick={handleSave} isLoading={saving}>
                      <Save size={16} className="mr-2" />
                      {t('userDetails.profile.saveButton')}
                    </Button>
                  </div>
                )}
            </div>
          )}

          {/* Tab: Saldos */}
          {activeTab === "balances" && (
            <UserBalancesTab userId={userId} />
          )}

          {/* Tab: Taxas */}
          {activeTab === "fees" && (
            <UserFeesTab userId={userId} />
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
                    {t('userDetails.activity.title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('userDetails.activity.subtitle')}
                  </p>
                </div>
                <button
                  onClick={loadUserActions}
                  disabled={loadingActions}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {loadingActions ? t('userDetails.activity.updating') : t('userDetails.activity.refreshButton')}
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
                    {t('userDetails.activity.noActivity')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {t('userDetails.activity.noActivityDesc')}
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
                  {t('userDetails.notifications.title', { name: user.name })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('userDetails.notifications.titleLabel')}
                    </label>
                    <Textinput
                      value={notification.title}
                      onChange={(e) =>
                        setNotification({
                          ...notification,
                          title: e.target.value,
                        })
                      }
                      placeholder={t('userDetails.notifications.titlePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('userDetails.notifications.typeLabel')}
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
                    {t('userDetails.notifications.messageLabel')}
                  </label>
                  <Textarea
                    value={notification.message}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        message: e.target.value,
                      })
                    }
                    placeholder={t('userDetails.notifications.messagePlaceholder')}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSendNotification}
                    isLoading={saving || notificationLoading}
                  >
                    <Bell size={16} className="mr-2" />
                    {t('userDetails.notifications.sendButton')}
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

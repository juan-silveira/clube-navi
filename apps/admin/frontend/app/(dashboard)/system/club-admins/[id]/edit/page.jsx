"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import { useAlertContext } from '@/contexts/AlertContext';
import { clubAdminsService } from '@/services/api';
import Badge from "@/components/ui/Badge";
import {
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ClubAdminEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: ''
  });

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadAdmin = async () => {
    try {
      setLoading(true);
      const response = await clubAdminsService.getById(params.id);
      if (response.success) {
        const adminData = response.data.clubAdmin;
        setAdmin(adminData);
        setFormData({
          name: adminData.name,
          cpf: adminData.cpf || '',
          phone: adminData.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading club admin:', error);
      showError('Erro ao carregar dados do administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await clubAdminsService.update(params.id, formData);
      if (response.success) {
        showSuccess('Administrador atualizado com sucesso');
        router.push(`/system/club-admins/${params.id}`);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      showError('Erro ao atualizar administrador');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await clubAdminsService.updateStatus(admin.id, !admin.isActive);
      if (response.success) {
        showSuccess(response.message || 'Status atualizado com sucesso');
        loadAdmin();
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      showError('Erro ao alterar status do administrador');
    }
  };

  const handleCancel = () => {
    router.push(`/system/club-admins/${params.id}`);
  };

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tooltip content="Voltar" placement="bottom">
            <button
              onClick={handleCancel}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Editar Administrador
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Atualize as informações do administrador
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {admin && (
            <Button
              className={admin.isActive ? "btn-outline-danger" : "btn-outline-success"}
              onClick={handleToggleStatus}
              icon={admin.isActive ? "heroicons-outline:x-circle" : "heroicons-outline:check-circle"}
              text={admin.isActive ? "Desativar" : "Ativar"}
            />
          )}
        </div>
      </div>

      {/* Status Badge */}
      {admin && (
        <div className="flex gap-2">
          {admin.isActive ? (
            <Badge className="bg-success-500/10 text-success-500 border-success-500 flex items-center gap-1">
              <CheckCircle size={14} />
              Ativo
            </Badge>
          ) : (
            <Badge className="bg-danger-500/10 text-danger-500 border-danger-500 flex items-center gap-1">
              <XCircle size={14} />
              Inativo
            </Badge>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card title="Informações do Administrador">
              <div className="space-y-4">
                <Textinput
                  label="Nome Completo"
                  type="text"
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="Email"
                    type="email"
                    value={admin?.email || ''}
                    disabled
                    readonly
                  />

                  <Textinput
                    label="Clube"
                    type="text"
                    value={admin?.club?.branding?.appName || admin?.club?.companyName || ''}
                    disabled
                    readonly
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="CPF"
                    type="text"
                    placeholder="123.456.789-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />

                  <Textinput
                    label="Telefone"
                    type="text"
                    placeholder="+55 11 98765-4321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card title="Ações">
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="btn-primary w-full"
                  isLoading={saving}
                  icon="heroicons-outline:check"
                  text="Salvar Alterações"
                />
                <Button
                  type="button"
                  className="btn-outline-secondary w-full"
                  onClick={handleCancel}
                  disabled={saving}
                  icon="heroicons-outline:x-mark"
                  text="Cancelar"
                />
              </div>

              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Informações
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  As alterações serão aplicadas imediatamente após salvar.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClubAdminEditPage;

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import usePermissions from "@/hooks/usePermissions";
import {
  ArrowLeft,
  Save,
  X,
  Shield,
  AlertTriangle
} from 'lucide-react';

// Mock data
const getMockAdmin = (id) => ({
  id,
  name: 'Admin Navi',
  email: 'admin@navi.com',
  isActive: true,
  permissions: ['all'],
  phone: '+55 11 91234-5678'
});

const SuperAdminEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    hasFullAccess: true
  });

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const admin = getMockAdmin(params.id);
      setFormData({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        isActive: admin.isActive,
        hasFullAccess: admin.permissions.includes('all')
      });
      setLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      router.push(`/system/super-admins/${params.id}`);
    }, 1000);
  };

  const handleCancel = () => {
    router.push(`/system/super-admins/${params.id}`);
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
          <Button
            icon={<ArrowLeft size={16} />}
            className="btn-secondary"
            onClick={handleCancel}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Editar Super Administrador
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Atualize as informações do administrador
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
              Atenção: Permissões Críticas
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Super administradores têm acesso total ao sistema. Tenha cuidado ao modificar essas informações.
            </p>
          </div>
        </div>
      </div>

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
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />

                  <Textinput
                    label="Telefone"
                    type="text"
                    placeholder="+55 11 98765-4321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div className="flex-1">
                      <label className="form-label flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.hasFullAccess}
                          onChange={(e) => setFormData({ ...formData, hasFullAccess: e.target.checked })}
                          className="form-checkbox"
                        />
                        <span>Acesso Total ao Sistema</span>
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Concede permissões irrestritas para todas as funcionalidades, incluindo gestão de clubes,
                        usuários, configurações sensíveis e dados do sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="form-checkbox"
                    />
                    <span>Ativo</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Desmarque para desativar o acesso do administrador ao sistema
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card title="Ações">
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="btn-primary w-full"
                  isLoading={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </Card>

            <Card title="Segurança">
              <div className="space-y-3">
                <Button type="button" className="btn-outline-primary w-full btn-sm">
                  Resetar Senha
                </Button>
                <Button type="button" className="btn-outline-secondary w-full btn-sm">
                  Configurar 2FA
                </Button>
              </div>
            </Card>

            <Card title="Informações">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  As alterações serão aplicadas imediatamente após salvar. O administrador
                  receberá uma notificação por email sobre as mudanças realizadas.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminEditPage;

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Tooltip from "@/components/ui/Tooltip";
import usePermissions from "@/hooks/usePermissions";
import clubsService from "@/services/clubsService";
import {
  ArrowLeft,
  Save,
  X
} from 'lucide-react';

const ClubEditPage = () => {
  const { t } = useTranslation("common");
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    companyDocument: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    plan: 'basic',
    isActive: true,
    subdomain: '',
    adminSubdomain: '',
    customDomain: '',
    monthlyFee: 0,
    maxUsers: 1000,
    maxAdmins: 10,
    maxStorageGB: 50
  });

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    loadClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadClub = async () => {
    try {
      setLoading(true);
      const response = await clubsService.getClubById(params.id);
      const club = response.data.club;

      setFormData({
        companyName: club.companyName || '',
        companyDocument: club.companyDocument || '',
        contactName: club.contactName || '',
        contactEmail: club.contactEmail || '',
        contactPhone: club.contactPhone || '',
        plan: club.plan || 'basic',
        isActive: club.isActive ?? true,
        subdomain: club.subdomain || '',
        adminSubdomain: club.adminSubdomain || '',
        customDomain: club.customDomain || '',
        monthlyFee: club.monthlyFee || 0,
        maxUsers: club.maxUsers || 1000,
        maxAdmins: club.maxAdmins || 10,
        maxStorageGB: club.maxStorageGB || 50
      });
    } catch (err) {
      console.error('Error loading club:', err);
      setError('Erro ao carregar dados do clube');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await clubsService.updateClub(params.id, formData);
      router.push(`/system/clubs/${params.id}`);
    } catch (err) {
      console.error('Error updating club:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar clube');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/system/clubs/${params.id}`);
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
          <Tooltip content={t("buttons.back")} placement="bottom">
            <button
              onClick={handleCancel}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Editar Clube
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Atualize as informações do clube
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-5">
            <Card title="Informações da Empresa">
              <div className="space-y-4">
                <Textinput
                  label="Nome da Empresa"
                  type="text"
                  placeholder="Digite o nome da empresa"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="CNPJ"
                    type="text"
                    placeholder="12.345.678/0001-90"
                    value={formData.companyDocument}
                    onChange={(e) => setFormData({ ...formData, companyDocument: e.target.value })}
                    required
                  />

                  <div className="form-group">
                    <label className="form-label">Plano</label>
                    <select
                      className="form-control"
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                      required
                    >
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <Textinput
                  label="Nome do Contato"
                  type="text"
                  placeholder="Nome completo"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="Email de Contato"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />

                  <Textinput
                    label="Telefone"
                    type="text"
                    placeholder="+55 11 98765-4321"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </Card>

            <Card title="Domínios">
              <div className="space-y-4">
                <Textinput
                  label="Subdomínio"
                  type="text"
                  placeholder="clubenavi"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  URL: {formData.subdomain || 'seuclube'}.localhost:3000
                </p>

                <Textinput
                  label="Subdomínio Admin"
                  type="text"
                  placeholder="adminclubenavi"
                  value={formData.adminSubdomain}
                  onChange={(e) => setFormData({ ...formData, adminSubdomain: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  URL Admin: {formData.adminSubdomain || 'adminseuclube'}.localhost:3000
                </p>

                <Textinput
                  label="Domínio Customizado (Opcional)"
                  type="text"
                  placeholder="www.seuclube.com.br"
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                />
              </div>
            </Card>

            <Card title="Limites e Taxas">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="Mensalidade (R$)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: parseFloat(e.target.value) || 0 })}
                  />

                  <Textinput
                    label="Máximo de Usuários"
                    type="number"
                    placeholder="1000"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="Máximo de Admins"
                    type="number"
                    placeholder="10"
                    value={formData.maxAdmins}
                    onChange={(e) => setFormData({ ...formData, maxAdmins: parseInt(e.target.value) || 0 })}
                  />

                  <Textinput
                    label="Armazenamento (GB)"
                    type="number"
                    placeholder="50"
                    value={formData.maxStorageGB}
                    onChange={(e) => setFormData({ ...formData, maxStorageGB: parseInt(e.target.value) || 0 })}
                  />
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

            <Card title="Status">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="form-checkbox"
                  />
                  <span>Clube Ativo</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Desmarque para desativar o clube e impedir novos acessos
                </p>
              </div>
            </Card>

            <Card title="Informações">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  As alterações serão aplicadas imediatamente após salvar.
                  Campos como slug e configurações de banco de dados não podem ser editados.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClubEditPage;

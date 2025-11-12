"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import usePermissions from "@/hooks/usePermissions";
import {
  ArrowLeft,
  Save,
  X,
  Building,
  AlertCircle
} from 'lucide-react';

const NewClubPage = () => {
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    contactEmail: '',
    contactPhone: '',
    plan: 'basic',
    isActive: true,
    subdomain: '',
    customDomain: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    }
  });

  // Generate slug from company name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleCompanyNameChange = (e) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setFormData({
      ...formData,
      companyName: name,
      subdomain: slug
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      // Redirect to new club detail page
      router.push('/system/clubs');
    }, 1000);
  };

  const handleCancel = () => {
    router.push('/system/clubs');
  };

  if (!permissions.canViewSystemSettings) {
    router.push("/dashboard");
    return null;
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
              Criar Novo Clube
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Cadastre um novo clube no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
              Informações Importantes
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• O slug será gerado automaticamente a partir do nome da empresa</li>
              <li>• Um banco de dados isolado será criado para este clube</li>
              <li>• O clube ficará inativo até você configurar o branding</li>
            </ul>
          </div>
        </div>
      </div>

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
                  onChange={handleCompanyNameChange}
                  required
                />

                <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                    <strong>Slug gerado:</strong> {formData.subdomain || 'aguardando...'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Package name: com.clubedigital.{formData.subdomain || 'nome'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="CNPJ"
                    type="text"
                    placeholder="12.345.678/0001-90"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    required
                  />

                  <div className="form-group">
                    <label className="form-label">Plano Inicial</label>
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
                  />
                </div>
              </div>
            </Card>

            <Card title="Domínios">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Subdomínio</label>
                  <Textinput
                    type="text"
                    placeholder="clube-navi"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    URL de acesso: {formData.subdomain || 'seu-clube'}.localhost:3000
                  </p>
                </div>

                <Textinput
                  label="Domínio Customizado (Opcional)"
                  type="text"
                  placeholder="www.seuclube.com.br"
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                />
              </div>
            </Card>

            <Card title="Endereço">
              <div className="space-y-4">
                <Textinput
                  label="Rua e Número"
                  type="text"
                  placeholder="Av. Paulista, 1000"
                  value={formData.address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Textinput
                    label="Cidade"
                    type="text"
                    placeholder="São Paulo"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />

                  <Textinput
                    label="Estado"
                    type="text"
                    placeholder="SP"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />

                  <Textinput
                    label="CEP"
                    type="text"
                    placeholder="01310-100"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                  />
                </div>

                <Textinput
                  label="País"
                  type="text"
                  placeholder="Brasil"
                  value={formData.address.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value }
                  })}
                />
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
                  Criar Clube
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

            <Card title="Status Inicial">
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="form-checkbox"
                  />
                  <span>Ativar clube imediatamente</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recomendado deixar inativo até configurar o branding
                </p>
              </div>
            </Card>

            <Card title="Próximos Passos">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                      Após criar o clube, você deverá:
                    </p>
                    <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
                      <li>Configurar o branding do app</li>
                      <li>Criar o primeiro administrador</li>
                      <li>Ativar o clube</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewClubPage;

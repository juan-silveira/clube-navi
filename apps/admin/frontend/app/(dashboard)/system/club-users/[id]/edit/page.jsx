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
  X
} from 'lucide-react';

// Mock data
const getMockUser = (id) => ({
  id,
  name: 'Pedro Alves',
  email: 'pedro@example.com',
  cpf: '123.456.789-00',
  phone: '+55 11 98765-4321',
  userType: 'consumer',
  isActive: true,
  clubId: 1,
  address: {
    street: 'Rua Exemplo, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
  }
});

const mockClubs = [
  { id: 1, name: 'Clube Navi', slug: 'clube-navi' },
  { id: 2, name: 'Empresa Teste', slug: 'empresa-teste' }
];

const ClubUserEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    clubId: '',
    userType: 'consumer',
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const user = getMockUser(params.id);
      setFormData({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        clubId: user.clubId,
        userType: user.userType,
        isActive: user.isActive,
        address: user.address
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
      router.push(`/system/club-users/${params.id}`);
    }, 1000);
  };

  const handleCancel = () => {
    router.push(`/system/club-users/${params.id}`);
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
              Editar Usuário
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Atualize as informações do usuário
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-5">
            <Card title="Informações Pessoais">
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

                <Textinput
                  label="CPF"
                  type="text"
                  placeholder="123.456.789-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                />

                <div className="form-group">
                  <label className="form-label">Clube</label>
                  <select
                    className="form-control"
                    value={formData.clubId}
                    onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um clube</option>
                    {mockClubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Usuário</label>
                  <select
                    className="form-control"
                    value={formData.userType}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    required
                  >
                    <option value="consumer">Consumidor</option>
                    <option value="merchant">Lojista</option>
                  </select>
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
                    Desmarque para desativar o acesso do usuário
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Endereço">
              <div className="space-y-4">
                <Textinput
                  label="Rua e Número"
                  type="text"
                  placeholder="Rua Exemplo, 123"
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
                    placeholder="01234-567"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
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

export default ClubUserEditPage;

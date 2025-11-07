"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import MultiSelect from '@/components/ui/MultiSelect';
import { useAlertContext } from '@/contexts/AlertContext';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/services/api';
import {
  Send,
  Bell,
  Image as ImageIcon,
  MapPin,
  Eye,
  Users,
  Loader,
  ExternalLink,
  Grid3x3,
  ChevronLeft
} from 'lucide-react';

const PushNotificationPage = () => {
  const { t } = useTranslation('push');
  const { showSuccess, showError } = useAlertContext();

  // Estado do wizard
  const [currentStep, setCurrentStep] = useState(1);

  // Estado - Etapa 1: Push
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Estado - Etapa 2: Página
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [code, setCode] = useState('');
  const [rules, setRules] = useState('');
  const [enableButton, setEnableButton] = useState(false);
  const [buttonType, setButtonType] = useState('module'); // 'module' ou 'external'
  const [selectedModule, setSelectedModule] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [buttonText, setButtonText] = useState('');

  // Estado - Etapa 3: Público
  const [cep, setCep] = useState('');
  const [radius, setRadius] = useState(10);
  const [coordinates, setCoordinates] = useState(null);

  // Estado - Etapa 4: Enviar
  const [cpfList, setCpfList] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sending, setSending] = useState(false);

  // Módulos disponíveis no app
  const availableModules = [
    { value: 'home', label: 'Início' },
    { value: 'wallet', label: 'Carteira' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'purchases', label: 'Minhas Compras' },
    { value: 'cashback', label: 'Cashback' },
    { value: 'profile', label: 'Perfil' },
    { value: 'settings', label: 'Configurações' }
  ];

  // Carregar usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users?limit=1000');
      if (response.data.success) {
        const usersList = response.data.data?.users || [];
        setUsers(usersList.sort((a, b) =>
          a.firstName.localeCompare(b.firstName, 'pt-BR', { sensitivity: 'base' })
        ));
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showError('Erro ao carregar usuários');
    }
  };

  // Buscar coordenadas do CEP
  const fetchCoordinates = async (cepValue) => {
    if (!cepValue || cepValue.length < 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await response.json();

      if (data.erro) {
        showError('CEP não encontrado');
        return;
      }

      // Geocode usando Google Maps API (você pode implementar no backend)
      // Por enquanto, vamos usar um exemplo fixo
      setCoordinates({
        lat: -23.550520,
        lng: -46.633308,
        address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      showError('Erro ao buscar CEP');
    }
  };

  const handleCepChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    setCep(cleaned);
    if (cleaned.length === 8) {
      fetchCoordinates(cleaned);
    }
  };

  // Upload de imagens
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Navegação do wizard
  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    // Validação antes de avançar
    if (currentStep === 1) {
      if (!title.trim() || !description.trim()) {
        showError('Preencha o título e a descrição da notificação');
        return;
      }
    }

    if (currentStep === 2) {
      if (!pageTitle.trim()) {
        showError('Preencha o título da página');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Enviar notificação
  const handleSendNotification = async () => {
    // Validações finais
    if (!title.trim() || !description.trim()) {
      showError('Título e descrição são obrigatórios');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();

      // Dados da notificação
      formData.append('title', title);
      formData.append('description', description);

      // Dados da página
      if (logo) formData.append('logo', logo);
      if (banner) formData.append('banner', banner);
      formData.append('pageTitle', pageTitle);
      formData.append('pageDescription', pageDescription);
      formData.append('code', code);
      formData.append('rules', rules);

      // Botão
      formData.append('enableButton', enableButton);
      if (enableButton) {
        formData.append('buttonType', buttonType);
        formData.append('buttonText', buttonText);
        if (buttonType === 'module') {
          formData.append('targetModule', selectedModule);
        } else {
          formData.append('externalLink', externalLink);
        }
      }

      // Público alvo
      if (cep) {
        formData.append('cep', cep);
        formData.append('radius', radius);
      }

      // CPFs específicos
      if (cpfList.trim()) {
        const cpfs = cpfList.split(/[\n,]/).map(c => c.trim()).filter(c => c);
        formData.append('cpfList', JSON.stringify(cpfs));
      }

      // Usuários selecionados
      if (selectedUsers.length > 0) {
        formData.append('userIds', JSON.stringify(selectedUsers));
      }

      const response = await api.post('/api/push-notifications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showSuccess(`Notificação enviada para ${response.data.data.sentCount} usuários!`);

        // Limpar formulário
        resetForm();
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      showError(error.response?.data?.message || 'Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLogo(null);
    setLogoPreview('');
    setBanner(null);
    setBannerPreview('');
    setPageTitle('');
    setPageDescription('');
    setCode('');
    setRules('');
    setEnableButton(false);
    setButtonType('module');
    setSelectedModule('');
    setExternalLink('');
    setButtonText('');
    setCep('');
    setRadius(10);
    setCoordinates(null);
    setCpfList('');
    setSelectedUsers([]);
  };

  // Renderização das etapas
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Crie sua Campanha
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Como seu cliente vai receber a sua mensagem na tela bloqueada
              </p>
            </div>

            <Textinput
              label="Título da notificação"
              placeholder="Título da notificação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Textarea
              label="Descrição da notificação"
              placeholder="Descrição da notificação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            {/* Preview da notificação push */}
            <div className="mt-8">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Preview da Notificação
              </p>
              <div className="flex justify-center">
                <div className="relative w-[320px] h-[640px] bg-blue-500 rounded-[40px] p-4 shadow-2xl">
                  {/* Status bar */}
                  <div className="text-white text-xs flex justify-between items-center mb-4">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4">📶</div>
                      <div className="w-4 h-4">📶</div>
                      <div className="w-4 h-4">🔋</div>
                    </div>
                  </div>

                  {/* Notificação */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bell size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {title || 'Título Digitado'}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {description || 'Descrição digitada'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">há pouco</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Agora vamos para a tela do aplicativo seu cliente
              </h2>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700"
                  >
                    <ImageIcon size={16} />
                    Alterar imagem
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Tipo de Imagem: Pequeno
                  </p>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {bannerPreview ? (
                    <div className="w-64 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-64 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700"
                  >
                    <ImageIcon size={16} />
                    Alterar imagem
                  </label>
                </div>
              </div>
            </div>

            <Textinput
              label="Título da notificação"
              placeholder="Título da notificação"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
            />

            <Textarea
              label="Descrição da notificação"
              placeholder="Descrição da notificação"
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
              rows={3}
            />

            <Textinput
              label="Código para copiar dentro da mensagem"
              placeholder="Código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Textarea
              label="Regras de descontos"
              placeholder="Regras"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={3}
            />

            {/* Habilitar botão */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="enable-button"
                  checked={enableButton}
                  onChange={(e) => setEnableButton(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="enable-button" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Habilitar botão
                </label>
              </div>

              {enableButton && (
                <div className="space-y-4 pl-7">
                  {/* Tipo de botão */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="buttonType"
                        value="module"
                        checked={buttonType === 'module'}
                        onChange={(e) => setButtonType(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Módulo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="buttonType"
                        value="external"
                        checked={buttonType === 'external'}
                        onChange={(e) => setButtonType(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Link Externo</span>
                    </label>
                  </div>

                  {buttonType === 'module' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selecione o Módulo
                      </label>
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Selecione...</option>
                        {availableModules.map(module => (
                          <option key={module.value} value={module.value}>
                            {module.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <Textinput
                      label="Link Externo"
                      placeholder="https://exemplo.com"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                    />
                  )}

                  <Textinput
                    label="Texto do Botão"
                    placeholder="Texto do Botão"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Publique para um público específico por geolocalização
              </h2>
            </div>

            <Textinput
              label="Digite seu CEP"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => handleCepChange(e.target.value)}
              maxLength={8}
            />

            {coordinates && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  📍 {coordinates.address}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Raio de alcance: {radius} km
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Mapa (placeholder) */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Mapa de visualização do raio
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Prévia da Notificação
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Notificação push */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  notificação de push
                </p>
                <div className="relative w-full max-w-[250px] mx-auto aspect-[9/19] bg-blue-500 rounded-[40px] p-4 shadow-2xl">
                  <div className="text-white text-xs flex justify-between items-center mb-4">
                    <span>9:41</span>
                    <div className="flex gap-1 text-xs">📶 🔋</div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bell size={12} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {title || 'Título'}
                        </p>
                        <p className="text-[10px] text-gray-600 line-clamp-2">
                          {description || 'Descrição'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tela de listagem */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Tela de listagem da notificação
                </p>
                <div className="relative w-full max-w-[250px] mx-auto aspect-[9/19] bg-purple-600 rounded-[40px] p-4 shadow-2xl">
                  <div className="h-full bg-white dark:bg-gray-900 rounded-3xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <ChevronLeft size={16} className="text-white" />
                      <p className="text-sm font-semibold text-white">Notificação</p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3">
                      {logoPreview && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden mb-2">
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                        {pageTitle || 'Título digitado'}
                      </p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">
                        {pageDescription || 'Descrição digitada'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Página do desconto */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  página do desconto
                </p>
                <div className="relative w-full max-w-[250px] mx-auto aspect-[9/19] bg-purple-600 rounded-[40px] p-4 shadow-2xl">
                  <div className="h-full bg-white dark:bg-gray-900 rounded-3xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <ChevronLeft size={16} className="text-white" />
                      <p className="text-sm font-semibold text-white">Notificação</p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 overflow-auto">
                      {bannerPreview && (
                        <div className="w-full h-20 rounded-lg overflow-hidden mb-3">
                          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">
                        {pageTitle || 'Título digitado'}
                      </p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                        {pageDescription || 'Descrição digitada'}
                      </p>
                      {code && (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-2">
                          <p className="text-[10px] font-mono text-gray-900 dark:text-white">
                            {code}
                          </p>
                        </div>
                      )}
                      {rules && (
                        <div className="text-[9px] text-gray-500 dark:text-gray-400 mb-2">
                          <p className="font-semibold mb-1">Termos e Condições</p>
                          <p>{rules}</p>
                        </div>
                      )}
                      {enableButton && buttonText && (
                        <button className="w-full bg-purple-600 text-white text-[10px] font-semibold py-2 rounded-lg">
                          {buttonText} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Enviar Notificação
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Defina quem receberá esta notificação
              </p>
            </div>

            <Textarea
              label="Digite os cpfs e aperte ENTER"
              placeholder="000.000.000-00"
              value={cpfList}
              onChange={(e) => setCpfList(e.target.value)}
              rows={4}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ou selecione usuários específicos
              </label>
              <MultiSelect
                label=""
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.firstName} ${user.lastName} - ${user.email}`
                }))}
                value={selectedUsers}
                onChange={setSelectedUsers}
                placeholder="Selecione usuários"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {selectedUsers.length} usuário(s) selecionado(s)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esses usuários receberão a notificação mesmo que não estejam no público-alvo geográfico
              </p>
            </div>

            {/* Resumo */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Resumo da Campanha
              </p>
              <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                <p>• Título: {title}</p>
                {cep && <p>• Público: CEP {cep} (raio de {radius}km)</p>}
                {cpfList && <p>• CPFs específicos: {cpfList.split(/[\n,]/).filter(c => c.trim()).length}</p>}
                {selectedUsers.length > 0 && <p>• Usuários selecionados: {selectedUsers.length}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Notificações Push
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Crie uma notificação personalizada para o seu público
          </p>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => goToStep(1)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 1
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Push
        </button>
        <button
          onClick={() => goToStep(2)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 2
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Página
        </button>
        <button
          onClick={() => goToStep(3)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 3
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Público
        </button>
        <button
          onClick={() => goToStep(4)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 4
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Prévia
        </button>
        <button
          onClick={() => goToStep(5)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStep === 5
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Enviar
        </button>
      </div>

      {/* Conteúdo da etapa */}
      <Card>
        <div className="min-h-[600px]">
          {renderStepContent()}
        </div>

        {/* Botões de navegação */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            text="Voltar"
            icon={ChevronLeft}
            className="btn-outline-secondary"
            onClick={previousStep}
            disabled={currentStep === 1}
          />

          {currentStep < 5 ? (
            <Button
              text="Próximo"
              className="btn-primary"
              onClick={nextStep}
            />
          ) : (
            <Button
              text={sending ? 'Enviando...' : 'Criar'}
              icon={sending ? Loader : Send}
              className="btn-primary"
              onClick={handleSendNotification}
              disabled={sending}
              isLoading={sending}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default PushNotificationPage;

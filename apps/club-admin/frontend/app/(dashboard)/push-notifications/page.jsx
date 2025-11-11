"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import MultiSelect from "@/components/ui/MultiSelect";
import { Icon } from "@iconify/react";
import MobilePreview from "@/components/notifications/MobilePreview";
import { useAlertContext } from '@/contexts/AlertContext';
import { clubAdminApi } from '@/services/api';

const NotificationsPage = () => {
  const { showSuccess, showError } = useAlertContext();

  // Current step (1-5)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Título e Descrição
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Step 2: Página de configuração
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [code, setCode] = useState('');
  const [rules, setRules] = useState('');
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [buttonType, setButtonType] = useState('module');
  const [selectedModule, setSelectedModule] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [buttonText, setButtonText] = useState('Texto do Botão');

  // Step 3: Geolocalização
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [cep, setCep] = useState('');
  const [radius, setRadius] = useState(0);

  // Step 4: Preview (usa os estados anteriores)

  // Step 5: Público e Agendamento
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Sending state
  const [sending, setSending] = useState(false);

  // Available modules
  const modules = [
    { value: 'home', label: 'Início' },
    { value: 'cashback', label: 'Cashback' },
    { value: 'discounts', label: 'Descontos' },
    { value: 'orders', label: 'Pedidos' },
    { value: 'profile', label: 'Perfil' }
  ];

  // Load users
  useEffect(() => {
    if (currentStep === 5) {
      fetchUsers();
    }
  }, [currentStep]);

  const fetchUsers = async () => {
    try {
      const response = await clubAdminApi.get('/users?userType=consumer');
      if (response.data && response.data.success) {
        const usersList = response.data.data || [];
        const sortedUsers = usersList.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'pt-BR')
        );
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showError('Erro ao carregar usuários');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    // Validação básica
    if (currentStep === 1) {
      if (!notificationTitle.trim() || !notificationMessage.trim()) {
        showError('Preencha o título e a mensagem da notificação');
        return;
      }
    }

    if (currentStep === 2) {
      if (!pageTitle.trim() || !pageDescription.trim()) {
        showError('Preencha o título e a descrição da página');
        return;
      }
      if (buttonEnabled) {
        if (buttonType === 'module' && !selectedModule) {
          showError('Selecione um módulo para o botão');
          return;
        }
        if (buttonType === 'external' && !externalLink.trim()) {
          showError('Insira um link externo para o botão');
          return;
        }
      }
    }

    if (currentStep === 3 && useGeolocation) {
      if (!cep.trim()) {
        showError('Digite um CEP para geolocalização');
        return;
      }
    }

    setCurrentStep(prev => Math.min(5, prev + 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSend = async () => {
    if (currentStep !== 5) {
      showError('Complete todos os passos antes de enviar');
      return;
    }

    // Validação do público-alvo
    if (!useGeolocation && selectedUsers.length === 0) {
      showError('Selecione pelo menos um destinatário ou configure geolocalização');
      return;
    }

    setSending(true);
    try {
      let uploadedLogoUrl = null;
      let uploadedBannerUrl = null;

      // Upload da logo se houver
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('image', logoFile);

        const logoUploadResponse = await clubAdminApi.post('/push-notifications/upload-image', logoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (logoUploadResponse.data.success) {
          uploadedLogoUrl = logoUploadResponse.data.data.url;
        }
      }

      // Upload do banner se houver
      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('image', bannerFile);

        const bannerUploadResponse = await clubAdminApi.post('/push-notifications/upload-image', bannerFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (bannerUploadResponse.data.success) {
          uploadedBannerUrl = bannerUploadResponse.data.data.url;
        }
      }

      // Criar a campanha
      const payload = {
        title: notificationTitle,
        description: notificationMessage,
        pageTitle: pageTitle || null,
        pageDescription: pageDescription || null,
        code: code || null,
        rules: rules || null,
        logoUrl: uploadedLogoUrl,
        bannerUrl: uploadedBannerUrl,
        enableButton: buttonEnabled,
        buttonType: buttonEnabled ? buttonType : null,
        targetModule: buttonEnabled && buttonType === 'module' ? selectedModule : null,
        externalLink: buttonEnabled && buttonType === 'external' ? externalLink : null,
        buttonText: buttonEnabled ? buttonText : null,
        geolocation: useGeolocation ? { cep, radius } : null,
        targetUserIds: !useGeolocation ? selectedUsers : [],
        scheduledAt: scheduleEnabled ? scheduledDateTime : null
      };

      console.log('Criando campanha de notificação:', payload);

      const response = await clubAdminApi.post('/push-notifications', payload);

      if (response.data.success) {
        const campaign = response.data.data;

        // Se não for agendada, enviar imediatamente
        if (!scheduleEnabled) {
          const sendResponse = await clubAdminApi.post(`/push-notifications/${campaign.id}/send`);

          if (sendResponse.data.success) {
            const { totalSent, totalFailed } = sendResponse.data.data;
            showSuccess(`Notificação enviada! ${totalSent} enviadas, ${totalFailed} falharam`);
          } else {
            showError('Campanha criada, mas houve erro ao enviar');
          }
        } else {
          showSuccess('Notificação agendada com sucesso!');
        }

        // Reset form
        setCurrentStep(1);
        setNotificationTitle('');
        setNotificationMessage('');
        setLogoFile(null);
        setLogoPreview(null);
        setBannerFile(null);
        setBannerPreview(null);
        setPageTitle('');
        setPageDescription('');
        setCode('');
        setRules('');
        setButtonEnabled(false);
        setButtonType('module');
        setSelectedModule('');
        setExternalLink('');
        setButtonText('Texto do Botão');
        setUseGeolocation(false);
        setCep('');
        setRadius(0);
        setSelectedUsers([]);
        setScheduleEnabled(false);
        setScheduledDateTime('');
      } else {
        showError('Erro ao criar campanha de notificação');
      }

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao enviar notificação';
      showError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const steps = [
    { number: 1, label: 'Push', active: currentStep >= 1, completed: currentStep > 1 },
    { number: 2, label: 'Página', active: currentStep >= 2, completed: currentStep > 2 },
    { number: 3, label: 'Público', active: currentStep >= 3, completed: currentStep > 3 },
    { number: 4, label: 'Prévia', active: currentStep >= 4, completed: currentStep > 4 },
    { number: 5, label: 'Enviar', active: currentStep === 5, completed: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Notificações Push</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Crie uma notificação de email personalizada para o seu público
        </p>
      </div>

      {/* Steps navigation */}
      <div className="flex items-center justify-between gap-2 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <button
              onClick={() => step.active && setCurrentStep(step.number)}
              disabled={!step.active && !step.completed}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all flex-1
                ${currentStep === step.number
                  ? 'bg-primary-600 text-white shadow-lg scale-105'
                  : step.completed
                  ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'
                  : step.active
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed'
                }
              `}
            >
              {step.completed ? (
                <Icon icon="heroicons:check-circle" className="w-5 h-5" />
              ) : (
                <span className="text-sm">{step.number}</span>
              )}
              <span className="text-sm hidden sm:inline">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <Icon icon="heroicons:chevron-right" className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className={`grid gap-6 ${currentStep === 4 ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3'}`}>
        {/* Form Column */}
        <div className={currentStep === 4 ? '' : 'xl:col-span-2'}>
          <Card>
            <div className="p-6">
              {/* Step 1: Push (Título e Descrição) */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Crie sua Campanha
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Como seu cliente vai receber a sua mensagem na tela bloqueada
                    </p>
                  </div>

                  <Textinput
                    label="Título da notificação"
                    placeholder="Título da Notificação"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    required
                  />

                  <Textarea
                    label="Descrição da notificação"
                    placeholder="Mensagem da Notificação"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    row={5}
                    required
                  />

                  <div className="flex justify-end">
                    <Button
                      text="Próximo"
                      icon="heroicons:arrow-right"
                      className="btn-primary"
                      onClick={handleNext}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Página (Logo, Banner, Código, Botão) */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Página de configuração
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Agora vamos para a tela do aplicativo seu cliente
                    </p>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Logo
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="group cursor-pointer block"
                      >
                        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10">
                          {logoPreview ? (
                            <div className="flex items-center gap-4">
                              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-md flex-shrink-0">
                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                  Logo selecionada
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Clique para alterar a imagem
                                </p>
                                <div className="mt-2 inline-flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
                                  <Icon icon="heroicons:photo" className="w-4 h-4" />
                                  <span>Alterar imagem</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                                <Icon icon="heroicons:photo" className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                              </div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                Clique para fazer upload da logo
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                PNG, JPG ou SVG (max. 2MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Banner
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="group cursor-pointer block"
                      >
                        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10">
                          {bannerPreview ? (
                            <div className="space-y-3">
                              <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-md">
                                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Icon icon="heroicons:arrow-path" className="w-10 h-10 text-white" />
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                  Banner selecionado
                                </p>
                                <div className="inline-flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
                                  <Icon icon="heroicons:photo" className="w-4 h-4" />
                                  <span>Clique para alterar a imagem</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                                <Icon icon="heroicons:photo" className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                              </div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                Clique para fazer upload do banner
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                PNG ou JPG - Recomendado: 1200x400px (max. 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Page content */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                      Página de notificação
                    </h4>

                    <div className="space-y-4">
                      <Textinput
                        label="Título da notificação"
                        placeholder="Título da Notificação"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        required
                      />

                      <Textarea
                        label="Descrição da notificação"
                        placeholder="Mensagem da Notificação"
                        value={pageDescription}
                        onChange={(e) => setPageDescription(e.target.value)}
                        row={4}
                        required
                      />

                      <Textinput
                        label="Código para copiar dentro da notificação"
                        placeholder="Código"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />

                      <Textarea
                        label="Regras do desconto"
                        placeholder="Regras"
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        row={3}
                      />

                      <div className="pt-4">
                        <Checkbox
                          label="Habilitar botão"
                          value={buttonEnabled}
                          onChange={() => setButtonEnabled(!buttonEnabled)}
                        />
                      </div>

                      {buttonEnabled && (
                        <div className="space-y-4 pl-6 border-l-2 border-primary-200 dark:border-primary-800">
                          <Select
                            label="Tipo do botão"
                            options={[
                              { value: 'module', label: 'Módulo' },
                              { value: 'external', label: 'Externo' }
                            ]}
                            value={buttonType}
                            onChange={(e) => setButtonType(e.target.value)}
                          />

                          {buttonType === 'module' && (
                            <Select
                              label="Módulo"
                              options={[{ value: '', label: 'Selecione um módulo' }, ...modules]}
                              value={selectedModule}
                              onChange={(e) => setSelectedModule(e.target.value)}
                            />
                          )}

                          {buttonType === 'external' && (
                            <Textinput
                              label="Link do botão"
                              placeholder="https://app.coinage.trade"
                              value={externalLink}
                              onChange={(e) => setExternalLink(e.target.value)}
                            />
                          )}

                          <Textinput
                            label="Texto do botão"
                            placeholder="Texto do Botão"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      text="Anterior"
                      icon="heroicons:arrow-left"
                      className="btn-outline-secondary"
                      onClick={handlePrevious}
                    />
                    <Button
                      text="Próximo"
                      icon="heroicons:arrow-right"
                      className="btn-primary"
                      onClick={handleNext}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Público (Geolocalização) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Público
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Publique para um público específico por geolocalização
                    </p>
                  </div>

                  <Checkbox
                    label="Usar geolocalização (CEP)"
                    value={useGeolocation}
                    onChange={() => setUseGeolocation(!useGeolocation)}
                  />

                  {useGeolocation && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary-200 dark:border-primary-800">
                      <Textinput
                        label="Digite seu CEP"
                        placeholder="Digite seu CEP"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                      />

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Raio de alcance
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={radius}
                          onChange={(e) => setRadius(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0 km</span>
                          <span className="font-semibold text-primary-600">{radius} km</span>
                          <span>100 km</span>
                        </div>
                      </div>

                      {/* Map placeholder */}
                      <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                          <Icon icon="heroicons:map" className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Mapa de geolocalização</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!useGeolocation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <Icon icon="heroicons:information-circle" className="w-5 h-5 inline mr-2" />
                        Sem geolocalização, você selecionará usuários específicos no próximo passo
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    <Button
                      text="Anterior"
                      icon="heroicons:arrow-left"
                      className="btn-outline-secondary"
                      onClick={handlePrevious}
                    />
                    <Button
                      text="Próximo"
                      icon="heroicons:arrow-right"
                      className="btn-primary"
                      onClick={handleNext}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Prévia */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Prévia
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Visualize como sua notificação aparecerá nos dispositivos
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                    <MobilePreview
                      title={pageTitle || notificationTitle || "Título da Notificação"}
                      message={pageDescription || notificationMessage || "Mensagem da Notificação"}
                      logo={logoPreview}
                      banner={bannerPreview}
                      code={code}
                      rules={rules}
                      buttonEnabled={buttonEnabled}
                      buttonText={buttonText}
                      showLockScreen={true}
                      showInAppList={true}
                      showInAppDetail={true}
                    />
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      text="Anterior"
                      icon="heroicons:arrow-left"
                      className="btn-outline-secondary"
                      onClick={handlePrevious}
                    />
                    <Button
                      text="Próximo"
                      icon="heroicons:arrow-right"
                      className="btn-primary"
                      onClick={handleNext}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Enviar (Usuários e Agendamento) */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Enviar
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Selecione os destinatários e agende o envio
                    </p>
                  </div>

                  {!useGeolocation && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Digite os cpfs e aperte ENTER
                      </label>
                      <MultiSelect
                        label=""
                        options={users.map(user => ({
                          value: user.id,
                          label: `${user.firstName} ${user.lastName} (${user.cpf || user.email})`
                        }))}
                        value={selectedUsers}
                        onChange={setSelectedUsers}
                        placeholder="Selecione os usuários..."
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {selectedUsers.length} usuário(s) selecionado(s)
                      </p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Checkbox
                      label="Habilitar data de entrega"
                      value={scheduleEnabled}
                      onChange={() => setScheduleEnabled(!scheduleEnabled)}
                    />
                  </div>

                  {scheduleEnabled && (
                    <div className="pl-6 border-l-2 border-primary-200 dark:border-primary-800">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Data e Hora
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    <Button
                      text="Anterior"
                      icon="heroicons:arrow-left"
                      className="btn-outline-secondary"
                      onClick={handlePrevious}
                    />
                    <Button
                      text={sending ? 'Criando...' : 'Criar'}
                      icon={sending ? "heroicons:arrow-path" : "heroicons:paper-airplane"}
                      className="btn-primary"
                      onClick={handleSend}
                      disabled={sending}
                      isLoading={sending}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Preview Column - Fixed on the right (hidden on step 4) */}
        {currentStep !== 4 && (
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Preview ao Vivo
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <MobilePreview
                      title={pageTitle || notificationTitle || "Título da Notificação"}
                      message={pageDescription || notificationMessage || "Mensagem da Notificação"}
                      logo={logoPreview}
                      banner={bannerPreview}
                      code={code}
                      rules={rules}
                      buttonEnabled={buttonEnabled}
                      buttonText={buttonText}
                      showLockScreen={currentStep === 1}
                      showInAppList={currentStep === 2}
                      showInAppDetail={currentStep >= 2}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

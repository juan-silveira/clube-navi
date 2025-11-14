"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";
import { useAlertContext } from '@/contexts/AlertContext';
import clubsService from '@/services/clubsService';
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  Building2,
  Palette,
  Settings,
  UserCog,
  CheckCircle2
} from 'lucide-react';

// Import step components
import Step1Company from './steps/Step1Company';
import Step2Branding from './steps/Step2Branding';
import Step3Technical from './steps/Step3Technical';
import Step4Admin from './steps/Step4Admin';

const NewClubWizard = () => {
  const router = useRouter();
  const { showSuccess, showError } = useAlertContext();
  const [isDark] = useDarkMode();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wizard data state
  const [wizardData, setWizardData] = useState({
    // Step 1: Company Info
    companyName: '',
    companyDocument: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    plan: 'basic',

    // Step 2: Branding
    appName: '',
    appDescription: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    logoFile: null,
    logoUrl: '',
    iconFile: null,
    iconUrl: '',
    splashFile: null,
    splashUrl: '',

    // Step 3: Technical
    slug: '',
    subdomain: '',
    customDomain: '',
    bundleId: '',

    // Step 4: Admin
    adminName: '',
    adminEmail: '',
    adminCpf: '',
    adminPhone: '',
    adminPassword: '',
    adminPasswordConfirm: ''
  });

  const steps = [
    {
      number: 1,
      title: "Informações da Empresa",
      icon: Building2,
      description: "Dados básicos da empresa"
    },
    {
      number: 2,
      title: "Branding & Identidade",
      icon: Palette,
      description: "Logo, cores e visual do app"
    },
    {
      number: 3,
      title: "Configuração Técnica",
      icon: Settings,
      description: "Domínio, slug e bundle ID"
    },
    {
      number: 4,
      title: "Primeiro Administrador",
      icon: UserCog,
      description: "Criar conta de admin"
    }
  ];

  const updateWizardData = (data) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push('/system/clubs');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create club with all data
      const response = await clubsService.createClubComplete(wizardData);

      if (response.success) {
        showSuccess('Clube criado com sucesso! Database, branding e administrador configurados.');
        router.push(`/system/clubs/${response.data.club.id}`);
      }
    } catch (error) {
      console.error('Error creating club:', error);
      showError(error.response?.data?.message || 'Erro ao criar clube. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Company
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2Branding
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step3Technical
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step4Admin
            data={wizardData}
            updateData={updateWizardData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Criar Novo Clube
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Configure completamente um novo clube em 4 etapas
        </p>
      </div>

      {/* Steps Progress */}
      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${isActive
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : isCompleted
                          ? 'bg-success-500 border-success-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Icon size={24} />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="text-center mt-2">
                    <p
                      className={`
                        text-xs font-semibold
                        ${isActive
                          ? 'text-primary-500'
                          : isCompleted
                            ? 'text-success-500'
                            : 'text-slate-400'
                        }
                      `}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      h-0.5 w-full mx-4 -mt-12 transition-all
                      ${currentStep > step.number
                        ? 'bg-success-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                      }
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStepContent()}
      </div>

      {/* Cancel Button (always visible) */}
      <Card>
        <div className="flex justify-between items-center">
          <Button
            type="button"
            className="btn-outline-danger"
            onClick={handleCancel}
            icon="heroicons-outline:x-mark"
            text="Cancelar Criação"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Etapa {currentStep} de {steps.length}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NewClubWizard;

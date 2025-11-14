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
            onCancel={handleCancel}
          />
        );
      case 2:
        return (
          <Step2Branding
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={handleCancel}
          />
        );
      case 3:
        return (
          <Step3Technical
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={handleCancel}
          />
        );
      case 4:
        return (
          <Step4Admin
            data={wizardData}
            updateData={updateWizardData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Steps Progress */}
      <Card>
        <div className="px-8 py-6">
          <div className="flex items-start justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-start flex-1">
                  <div className="flex flex-col items-center w-full">
                    {/* Step Number Badge */}
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Etapa {step.number} de {steps.length}
                      </span>
                    </div>

                    {/* Step Circle */}
                    <div
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all mb-3
                        ${isActive
                          ? 'bg-primary-500 border-primary-500 text-white shadow-lg'
                          : isCompleted
                            ? 'bg-success-500 border-success-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={28} />
                      ) : (
                        <Icon size={28} />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="text-center px-2">
                      <p
                        className={`
                          text-sm font-bold mb-1
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Connector */}
                  {index < steps.length - 1 && (
                    <div className="flex items-center px-4 mt-16">
                      <svg
                        className={`w-8 h-8 ${currentStep > step.number ? 'text-success-500' : 'text-slate-300 dark:text-slate-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <div>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default NewClubWizard;

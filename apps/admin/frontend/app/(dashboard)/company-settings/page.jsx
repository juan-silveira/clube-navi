"use client";
import React, { useState, useEffect } from 'react';
import { Upload, Building2, Save, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAlertContext } from '@/contexts/AlertContext';
import { useCompanyContext } from '@/contexts/CompanyContext';
import CompanyLogoUpload from '@/components/admin/CompanyLogoUpload';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';

const CompanySettings = () => {
  const { showSuccess, showError } = useAlertContext();
  const { companyBranding, reloadCompanyBranding } = useCompanyContext();
  const { user } = useAuthStore();
  
  const [isUploading, setIsUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);

  useEffect(() => {
    // Get current company ID from user's companies
    const loadCompanyInfo = async () => {
      try {
        const response = await api.get('/api/whitelabel/user/current-company');
        if (response.data.success && response.data.data) {
          setCurrentCompanyId(response.data.data.companyId);
        }
      } catch (error) {
        console.error('Error loading company info:', error);
      }
    };
    
    if (user?.id) {
      loadCompanyInfo();
    }
  }, [user]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showError('Tipo de arquivo não permitido. Use JPG, PNG, GIF, WebP ou SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = async () => {
    if (!logoFile || !currentCompanyId) {
      showError('Selecione um arquivo de logo');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('companyId', currentCompanyId);

      const response = await api.post('/api/company-branding/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showSuccess('Logo da empresa atualizado com sucesso!');
        
        // Reload company branding to update logo everywhere
        await reloadCompanyBranding();
        
        // Clear preview
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        throw new Error(response.data.message || 'Erro ao enviar logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showError(error.message || 'Erro ao enviar logo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações da Empresa
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie o logo e branding da sua empresa
          </p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Building2 className="w-6 h-6 mr-2 text-blue-500" />
            <h2 className="text-lg font-semibold">Logo da Empresa</h2>
          </div>

          {currentCompanyId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CompanyLogoUpload
                companyId={currentCompanyId}
                currentLogoUrl={companyBranding?.logoUrl}
                logoType="light"
                onSuccess={(url) => {
                  showSuccess('Logo claro atualizado com sucesso!');
                }}
                onReload={reloadCompanyBranding}
              />
              
              <CompanyLogoUpload
                companyId={currentCompanyId}
                currentLogoUrl={companyBranding?.logoUrlDark}
                logoType="dark"
                onSuccess={(url) => {
                  showSuccess('Logo escuro atualizado com sucesso!');
                }}
                onReload={reloadCompanyBranding}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Carregando informações da empresa...
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Instruções:</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-600 dark:text-blue-400 list-disc list-inside">
              <li>Formatos aceitos: JPG, PNG, GIF, WebP, SVG</li>
              <li>Tamanho máximo: 5MB</li>
              <li>Recomendado: Logo com fundo transparente (PNG ou SVG)</li>
              <li>Dimensões ideais: 200x60 pixels ou proporcional</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanySettings;
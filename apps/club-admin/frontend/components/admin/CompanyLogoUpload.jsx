"use client";
import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

const CompanyLogoUpload = ({ companyId, currentLogoUrl, logoType = 'light', onSuccess, onReload }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogoUrl);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    setError(null);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Fazer upload automático
    uploadLogo(file);
  };

  const uploadLogo = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('companyId', companyId);
      formData.append('logoType', logoType);

      const response = await api.post('/api/s3-photos/company-logo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(`Logo ${logoType === 'dark' ? 'escuro' : 'claro'} atualizado com sucesso!`);
        
        // Atualizar o branding no banco
        await updateBrandingWithNewLogo(response.data.data.url);
        
        // Recarregar branding no contexto
        if (onReload) {
          await onReload();
        }
        
        if (onSuccess) {
          onSuccess(response.data.data.url);
        }
      } else {
        throw new Error(response.data.message || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setError(error.response?.data?.message || 'Erro ao fazer upload da imagem');
      setPreview(currentLogoUrl);
      toast.error('Erro ao fazer upload da logo');
    } finally {
      setUploading(false);
    }
  };

  const updateBrandingWithNewLogo = async (logoUrl) => {
    try {
      const updateData = {};
      if (logoType === 'dark') {
        updateData.logoUrlDark = logoUrl;
      } else {
        updateData.logoUrl = logoUrl;
      }

      await api.put(`/api/whitelabel/branding/${companyId}`, updateData);
    } catch (error) {
      console.error('Erro ao atualizar branding:', error);
    }
  };

  const removeLogo = async () => {
    if (!confirm(`Tem certeza que deseja remover o logo ${logoType === 'dark' ? 'escuro' : 'claro'}?`)) {
      return;
    }

    setUploading(true);
    try {
      // Remover do S3 e atualizar branding
      await updateBrandingWithNewLogo(null);
      
      setPreview(null);
      toast.success('Logo removido com sucesso!');
      
      // Recarregar branding
      if (onReload) {
        await onReload();
      }
      
      if (onSuccess) {
        onSuccess(null);
      }
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast.error('Erro ao remover logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Logo {logoType === 'dark' ? 'Escuro' : 'Claro'}
        </label>
        {preview && (
          <button
            onClick={removeLogo}
            disabled={uploading}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remover
          </button>
        )}
      </div>

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 
            ${uploading ? 'cursor-wait' : 'cursor-pointer hover:border-primary-500'}
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            transition-colors
          `}
        >
          {preview ? (
            <div className="flex items-center justify-center">
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-32 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Clique para selecionar uma imagem
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG, SVG até 5MB
              </p>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 flex items-center text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyLogoUpload;
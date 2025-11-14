"use client";

import { useState, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import useDarkMode from "@/hooks/useDarkMode";
import { useAlertContext } from '@/contexts/AlertContext';
import {
  Upload,
  Image as ImageIcon,
  Palette,
  Type,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const Step2Branding = ({ data, updateData, onNext, onBack }) => {
  const { showError } = useAlertContext();
  const [isDark] = useDarkMode();

  const [formData, setFormData] = useState({
    appName: data.appName || data.companyName || '',
    appDescription: data.appDescription || `Clube de benefícios ${data.companyName}` || '',
    primaryColor: data.primaryColor || '#3B82F6',
    secondaryColor: data.secondaryColor || '#10B981',
    accentColor: data.accentColor || '#F59E0B',
    backgroundColor: data.backgroundColor || '#FFFFFF',
    textColor: data.textColor || '#1F2937',
    logoFile: data.logoFile || null,
    logoPreview: data.logoUrl || '',
    iconFile: data.iconFile || null,
    iconPreview: data.iconUrl || '',
    splashFile: data.splashFile || null,
    splashPreview: data.splashUrl || ''
  });

  const [uploading, setUploading] = useState({
    logo: false,
    icon: false,
    splash: false
  });

  const [errors, setErrors] = useState({});

  const logoInputRef = useRef(null);
  const iconInputRef = useRef(null);
  const splashInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateImageFile = (file, type) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      showError(`${type}: Apenas arquivos JPG, PNG ou WEBP são permitidos`);
      return false;
    }

    if (file.size > maxSize) {
      showError(`${type}: Arquivo muito grande. Máximo 5MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateImageFile(file, type)) {
      e.target.value = ''; // Reset input
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [`${type}File`]: file,
        [`${type}Preview`]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type) => {
    setFormData(prev => ({
      ...prev,
      [`${type}File`]: null,
      [`${type}Preview`]: ''
    }));

    // Reset file input
    if (type === 'logo' && logoInputRef.current) logoInputRef.current.value = '';
    if (type === 'icon' && iconInputRef.current) iconInputRef.current.value = '';
    if (type === 'splash' && splashInputRef.current) splashInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.appName || formData.appName.trim().length < 3) {
      newErrors.appName = 'Nome do app deve ter no mínimo 3 caracteres';
    }

    if (!formData.appDescription || formData.appDescription.trim().length < 10) {
      newErrors.appDescription = 'Descrição deve ter no mínimo 10 caracteres';
    }

    if (!formData.logoFile && !formData.logoPreview) {
      newErrors.logo = 'Logo é obrigatório';
    }

    if (!formData.iconFile && !formData.iconPreview) {
      newErrors.icon = 'Ícone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      updateData({
        appName: formData.appName,
        appDescription: formData.appDescription,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        logoFile: formData.logoFile,
        logoUrl: formData.logoPreview,
        iconFile: formData.iconFile,
        iconUrl: formData.iconPreview,
        splashFile: formData.splashFile,
        splashUrl: formData.splashPreview
      });
      onNext();
    }
  };

  const renderImageUpload = (type, label, description, ref) => {
    const preview = formData[`${type}Preview`];
    const file = formData[`${type}File`];
    const isUploading = uploading[type];
    const error = errors[type];

    return (
      <div>
        <label className="form-label flex items-center gap-2 mb-2">
          <ImageIcon size={18} />
          {label}
          {error && <span className="text-danger-500 text-xs ml-auto">{error}</span>}
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {description}
        </p>

        <div
          className={`
            border-2 border-dashed rounded-lg p-6 transition-all
            ${error
              ? 'border-danger-300 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/20'
              : preview
                ? 'border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-900/20'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
            }
          `}
        >
          {preview ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <img
                  src={preview}
                  alt={`Preview ${label}`}
                  className="max-h-32 object-contain rounded"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                  <CheckCircle2 size={16} />
                  <span>{file ? file.name : 'Arquivo carregado'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(type)}
                  className="text-danger-500 hover:text-danger-700 font-medium"
                >
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto mb-2 text-slate-400" size={32} />
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                Clique para selecionar ou arraste o arquivo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG ou WEBP (máx. 5MB)
              </p>
            </div>
          )}

          <input
            ref={ref}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e, type)}
            className="hidden"
          />

          {!preview && (
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="w-full mt-3 btn btn-outline-secondary btn-sm"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Carregando...
                </>
              ) : (
                'Selecionar Arquivo'
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderColorPicker = (field, label) => {
    return (
      <div>
        <label className="form-label flex items-center gap-2 mb-2">
          <Palette size={18} />
          {label}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            className="h-10 w-20 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
          />
          <Textinput
            type="text"
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Info Banner */}
      <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
              Sobre o Branding
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• <strong>Logo:</strong> Exibida no app e dashboard (recomendado: 512x512px)</li>
              <li>• <strong>Ícone:</strong> Usado como ícone do app (obrigatório: 1024x1024px)</li>
              <li>• <strong>Splash Screen:</strong> Tela de abertura do app (opcional: 1242x2688px)</li>
              <li>• Os arquivos serão enviados para o S3 automaticamente ao criar o clube</li>
            </ul>
          </div>
        </div>
      </div>

      {/* App Info */}
      <Card title="Informações do Aplicativo">
        <div className="space-y-4">
          <Textinput
            label="Nome do App"
            type="text"
            placeholder="Ex: Clube Navi"
            value={formData.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            error={errors.appName}
            icon={<Type size={18} />}
          />

          <div>
            <label className="form-label flex items-center gap-2 mb-2">
              <FileText size={18} />
              Descrição do App
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Descreva o clube de benefícios..."
              value={formData.appDescription}
              onChange={(e) => handleChange('appDescription', e.target.value)}
            />
            {errors.appDescription && (
              <p className="text-danger-500 text-xs mt-1">{errors.appDescription}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card title="Imagens">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderImageUpload('logo', 'Logo', 'Logo principal do clube (512x512px recomendado)', logoInputRef)}
          {renderImageUpload('icon', 'Ícone do App', 'Ícone do aplicativo (1024x1024px obrigatório)', iconInputRef)}
        </div>
        <div className="mt-6">
          {renderImageUpload('splash', 'Splash Screen (Opcional)', 'Tela de abertura (1242x2688px recomendado)', splashInputRef)}
        </div>
      </Card>

      {/* Colors */}
      <Card title="Paleta de Cores">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderColorPicker('primaryColor', 'Cor Primária')}
          {renderColorPicker('secondaryColor', 'Cor Secundária')}
          {renderColorPicker('accentColor', 'Cor de Destaque')}
          {renderColorPicker('backgroundColor', 'Cor de Fundo')}
          {renderColorPicker('textColor', 'Cor do Texto')}
        </div>

        {/* Color Preview */}
        <div className="mt-6 p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold mb-4">Preview das Cores:</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Primária', color: formData.primaryColor },
              { label: 'Secundária', color: formData.secondaryColor },
              { label: 'Destaque', color: formData.accentColor },
              { label: 'Fundo', color: formData.backgroundColor },
              { label: 'Texto', color: formData.textColor }
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <Card>
        <div className="flex justify-between">
          <Button
            type="button"
            className="btn-outline-secondary"
            onClick={onBack}
            icon="heroicons-outline:arrow-left"
            text="Voltar"
          />
          <Button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            icon="heroicons-outline:arrow-right"
            text="Próximo: Configuração Técnica"
          />
        </div>
      </Card>
    </div>
  );
};

export default Step2Branding;

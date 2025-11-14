"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import useDarkMode from "@/hooks/useDarkMode";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { maskCPF, maskPhone, validateCPF, validatePhone } from '@/utils/masks';

const Step4Admin = ({ data, updateData, onSubmit, onBack, onCancel, isSubmitting }) => {
  const [isDark] = useDarkMode();

  const [formData, setFormData] = useState({
    adminName: data.adminName || data.contactName || '',
    adminEmail: data.adminEmail || data.contactEmail || '',
    adminCpf: data.adminCpf || '',
    adminPhone: data.adminPhone || data.contactPhone || '',
    adminPassword: data.adminPassword || '',
    adminPasswordConfirm: data.adminPasswordConfirm || ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };


  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber
    };
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.adminName || formData.adminName.trim().length < 3) {
      newErrors.adminName = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.adminEmail) {
      newErrors.adminEmail = 'Email é obrigatório';
    } else if (!validateEmail(formData.adminEmail)) {
      newErrors.adminEmail = 'Email inválido';
    }

    if (!formData.adminCpf) {
      newErrors.adminCpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.adminCpf)) {
      newErrors.adminCpf = 'CPF inválido';
    }

    if (!formData.adminPhone) {
      newErrors.adminPhone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.adminPhone)) {
      newErrors.adminPhone = 'Telefone inválido (mín. 10 dígitos)';
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(formData.adminPassword);
      if (!passwordValidation.isValid) {
        newErrors.adminPassword = 'Senha não atende aos requisitos de segurança';
      }
    }

    if (!formData.adminPasswordConfirm) {
      newErrors.adminPasswordConfirm = 'Confirmação de senha é obrigatória';
    } else if (formData.adminPassword !== formData.adminPasswordConfirm) {
      newErrors.adminPasswordConfirm = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('🔍 [Step4Admin] handleSubmit called');
    console.log('📝 [Step4Admin] Form data:', formData);

    const isValid = validate();
    console.log('✅ [Step4Admin] Validation result:', isValid);

    if (isValid) {
      console.log('🚀 [Step4Admin] Calling onSubmit with form data');
      // Passar os dados diretamente para o onSubmit
      onSubmit(formData);
    } else {
      console.error('❌ [Step4Admin] Validation failed, errors:', errors);
    }
  };

  const passwordValidation = validatePassword(formData.adminPassword);

  return (
    <div className="space-y-5">
      {/* Auto-fill Notice */}
      {(data.contactName || data.contactEmail || data.contactPhone) && (
        <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-success-900/20 border-success-800' : 'bg-success-50 border-success-200'}`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-success-600 dark:text-success-400 mb-1">
                Dados preenchidos automaticamente
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Os dados do responsável da Etapa 1 foram utilizados para preencher este formulário. Você pode editá-los se necessário.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
              Primeiro Administrador do Clube
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• Este será o administrador principal com acesso total ao clube</li>
              <li>• Use um email válido, pois será usado para login</li>
              <li>• A senha deve ser forte para garantir segurança</li>
              <li>• Mais administradores podem ser adicionados depois</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <Card title="Dados do Administrador">
        <div className="space-y-4">
          <Textinput
            label="Nome Completo"
            type="text"
            placeholder="Ex: João Silva"
            value={formData.adminName}
            onChange={(e) => handleChange('adminName', e.target.value)}
            error={errors.adminName}
            icon={<User size={18} />}
          />

          <Textinput
            label="Email (será usado para login)"
            type="email"
            placeholder="admin@empresa.com"
            value={formData.adminEmail}
            onChange={(e) => handleChange('adminEmail', e.target.value)}
            error={errors.adminEmail}
            icon={<Mail size={18} />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textinput
              label="CPF"
              type="text"
              placeholder="123.456.789-00"
              value={formData.adminCpf}
              onChange={(e) => handleChange('adminCpf', maskCPF(e.target.value))}
              error={errors.adminCpf}
              icon={<CreditCard size={18} />}
            />

            <Textinput
              label="Telefone"
              type="text"
              placeholder="(11) 98765-4321"
              value={formData.adminPhone}
              onChange={(e) => handleChange('adminPhone', maskPhone(e.target.value))}
              error={errors.adminPhone}
              icon={<Phone size={18} />}
            />
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card title="Definir Senha">
        <div className="space-y-4">
          <div>
            <div className="relative">
              <Textinput
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="Digite uma senha forte"
                value={formData.adminPassword}
                onChange={(e) => handleChange('adminPassword', e.target.value)}
                error={errors.adminPassword}
                icon={<Lock size={18} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Requirements */}
            {formData.adminPassword && (
              <div className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Requisitos da senha:
                </p>
                <div className="space-y-1">
                  {[
                    { label: 'Mínimo 8 caracteres', valid: passwordValidation.hasMinLength },
                    { label: 'Letra maiúscula', valid: passwordValidation.hasUpperCase },
                    { label: 'Letra minúscula', valid: passwordValidation.hasLowerCase },
                    { label: 'Número', valid: passwordValidation.hasNumber }
                  ].map(({ label, valid }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      {valid ? (
                        <CheckCircle2 size={14} className="text-success-500" />
                      ) : (
                        <AlertCircle size={14} className="text-slate-400" />
                      )}
                      <span className={valid ? 'text-success-600 dark:text-success-400' : 'text-slate-500'}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Textinput
              label="Confirmar Senha"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={formData.adminPasswordConfirm}
              onChange={(e) => handleChange('adminPasswordConfirm', e.target.value)}
              error={errors.adminPasswordConfirm}
              icon={<Lock size={18} />}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {formData.adminPassword && formData.adminPasswordConfirm && formData.adminPassword === formData.adminPasswordConfirm && (
            <div className={`p-2 rounded ${isDark ? 'bg-success-900/20' : 'bg-success-50'}`}>
              <p className="text-xs text-success-600 dark:text-success-400 flex items-center gap-2">
                <CheckCircle2 size={14} />
                Senhas coincidem
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card title="Resumo Final">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Ao finalizar, será criado:
          </p>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Empresa:</strong> {data.companyName || 'Aguardando...'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Database:</strong> clube_digital_{data.slug ? data.slug.replace(/-/g, '_') : 'aguardando'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Branding:</strong> {data.logoFile ? 'Logo, ícone e cores configurados' : 'Aguardando upload'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Subdomínio:</strong> {data.subdomain || 'aguardando'}.localhost:8033
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Administrador:</strong> {formData.adminName || 'Aguardando...'} ({formData.adminEmail || 'aguardando'})
              </span>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-lg border-2 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Atenção:</strong> Esta operação criará o database no PostgreSQL, fará upload dos assets para o S3 e criará todos os registros necessários. Certifique-se de que todos os dados estão corretos antes de continuar.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <Card>
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              className="btn-outline-danger"
              onClick={onCancel}
              disabled={isSubmitting}
              icon="heroicons-outline:x-mark"
              text="Cancelar"
            />
            <Button
              type="button"
              className="btn-outline-secondary"
              onClick={onBack}
              disabled={isSubmitting}
              icon="heroicons-outline:arrow-left"
              text="Voltar"
            />
          </div>
          <Button
            type="button"
            className="btn-success"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            icon="heroicons-outline:check-circle"
            text={isSubmitting ? "Criando Clube..." : "Criar Clube Completo"}
          />
        </div>
      </Card>
    </div>
  );
};

export default Step4Admin;

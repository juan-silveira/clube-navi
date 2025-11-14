"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import useDarkMode from "@/hooks/useDarkMode";
import {
  Link2,
  Globe,
  Smartphone,
  Database,
  Server,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const Step3Technical = ({ data, updateData, onNext, onBack, onCancel }) => {
  const [isDark] = useDarkMode();

  const [formData, setFormData] = useState({
    slug: data.slug || '',
    subdomain: data.subdomain || '',
    customDomain: data.customDomain || '',
    bundleId: data.bundleId || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateSlug = (slug) => {
    // Only lowercase letters, numbers, and hyphens
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  };

  const validateDomain = (domain) => {
    if (!domain) return true; // Optional field

    // Basic domain validation
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
    return domainRegex.test(domain);
  };

  const validateBundleId = (bundleId) => {
    // Bundle ID format: com.company.appname
    const bundleRegex = /^[a-z]{2,}\.[a-z0-9]+(\.[a-z0-9]+)+$/;
    return bundleRegex.test(bundleId);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.slug) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (!validateSlug(formData.slug)) {
      newErrors.slug = 'Slug inválido. Use apenas letras minúsculas, números e hífens';
    }

    if (!formData.subdomain) {
      newErrors.subdomain = 'Subdomínio é obrigatório';
    } else if (!validateSlug(formData.subdomain)) {
      newErrors.subdomain = 'Subdomínio inválido. Use apenas letras minúsculas, números e hífens';
    }

    if (formData.customDomain && !validateDomain(formData.customDomain)) {
      newErrors.customDomain = 'Domínio inválido. Ex: clube.empresa.com.br';
    }

    if (!formData.bundleId) {
      newErrors.bundleId = 'Bundle ID é obrigatório';
    } else if (!validateBundleId(formData.bundleId)) {
      newErrors.bundleId = 'Bundle ID inválido. Formato: com.empresa.nome';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      updateData(formData);
      onNext();
    }
  };

  const getDatabaseName = () => {
    return `clube_digital_${formData.slug.replace(/-/g, '_')}`;
  };

  const getSubdomainUrl = () => {
    return `http://${formData.subdomain}.localhost:8033`;
  };

  const getAdminSubdomainUrl = () => {
    return `http://admin-${formData.subdomain}.localhost:3100`;
  };

  return (
    <div className="space-y-5">
      {/* Info Banner */}
      <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
              Configurações Técnicas
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• O <strong>slug</strong> é usado internamente e não pode ser alterado depois</li>
              <li>• O <strong>subdomínio</strong> define a URL de acesso ao clube</li>
              <li>• O <strong>Bundle ID</strong> é único para cada app no Google Play e App Store</li>
              <li>• O <strong>database</strong> será criado automaticamente no PostgreSQL</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slug and Subdomain */}
      <Card title="Identificadores">
        <div className="space-y-4">
          <Textinput
            label="Slug (Identificador Interno)"
            type="text"
            placeholder="clube-navi"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value.toLowerCase())}
            error={errors.slug}
            icon={<Link2 size={18} />}
            helpText="Apenas letras minúsculas, números e hífens. Não pode ser alterado depois."
          />

          <Textinput
            label="Subdomínio"
            type="text"
            placeholder="clube-navi"
            value={formData.subdomain}
            onChange={(e) => handleChange('subdomain', e.target.value.toLowerCase())}
            error={errors.subdomain}
            icon={<Globe size={18} />}
            helpText={formData.subdomain ? `URL: ${getSubdomainUrl()}` : 'Define a URL de acesso ao clube'}
          />

          <Textinput
            label="Domínio Personalizado (Opcional)"
            type="text"
            placeholder="clube.empresa.com.br"
            value={formData.customDomain}
            onChange={(e) => handleChange('customDomain', e.target.value.toLowerCase())}
            error={errors.customDomain}
            icon={<Server size={18} />}
            helpText="Domínio customizado para acessar o clube (configuração DNS necessária)"
          />
        </div>
      </Card>

      {/* Bundle ID */}
      <Card title="Configuração do Aplicativo">
        <div className="space-y-4">
          <Textinput
            label="Bundle ID / Package Name"
            type="text"
            placeholder="com.clubedigital.clubenavi"
            value={formData.bundleId}
            onChange={(e) => handleChange('bundleId', e.target.value.toLowerCase())}
            error={errors.bundleId}
            icon={<Smartphone size={18} />}
            helpText="Identificador único do app nas lojas (iOS e Android)"
          />

          {formData.bundleId && !errors.bundleId && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success-500" />
                <strong>Bundle ID configurado:</strong>
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pl-5">
                <li>• iOS: {formData.bundleId}</li>
                <li>• Android: {formData.bundleId}</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Database Configuration */}
      <Card title="Configuração do Database">
        <div className={`p-4 rounded-lg border-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Database Multi-Tenant
              </p>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Nome do Database:</span>
                    <p className="font-mono font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                      {formData.slug ? getDatabaseName() : 'aguardando slug...'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Host:</span>
                    <p className="font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      localhost:5432
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Usuário:</span>
                    <p className="font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      clube_digital_user
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Schema:</span>
                    <p className="font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      public
                    </p>
                  </div>
                </div>
              </div>

              <div className={`mt-3 p-2 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-success-500" />
                  O database será criado automaticamente ao finalizar o wizard
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* URLs Summary */}
      {formData.subdomain && !errors.subdomain && (
        <Card title="Resumo de URLs">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">URL do Clube (API):</p>
                <p className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                  {getSubdomainUrl()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">URL do Admin:</p>
                <p className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                  {getAdminSubdomainUrl()}
                </p>
              </div>
              {formData.customDomain && (
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Domínio Personalizado:</p>
                  <p className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                    https://{formData.customDomain}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              className="btn-outline-danger"
              onClick={onCancel}
              icon="heroicons-outline:x-mark"
              text="Cancelar"
            />
            <Button
              type="button"
              className="btn-outline-secondary"
              onClick={onBack}
              icon="heroicons-outline:arrow-left"
              text="Voltar"
            />
          </div>
          <Button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            icon="heroicons-outline:arrow-right"
            text="Próximo: Criar Administrador"
          />
        </div>
      </Card>
    </div>
  );
};

export default Step3Technical;

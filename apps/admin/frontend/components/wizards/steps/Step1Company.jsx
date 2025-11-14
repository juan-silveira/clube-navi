"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Building2, FileText, User, Mail, Phone, CreditCard } from 'lucide-react';

const Step1Company = ({ data, updateData, onNext, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    companyDocument: data.companyDocument || '',
    contactName: data.contactName || '',
    contactEmail: data.contactEmail || '',
    contactPhone: data.contactPhone || '',
    plan: data.plan || 'basic'
  });

  const [errors, setErrors] = useState({});

  // Auto-generate slug when company name changes
  useEffect(() => {
    if (formData.companyName) {
      const slug = generateSlug(formData.companyName);
      updateData({
        ...formData,
        slug,
        subdomain: slug,
        bundleId: `com.clubedigital.${slug.replace(/-/g, '')}`,
        appName: formData.companyName,
        appDescription: `Clube de benefícios ${formData.companyName}`
      });
    }
  }, [formData.companyName]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars except spaces
      .replace(/\s+/g, '') // Remove all spaces (no hyphens)
      .trim();
  };

  const validateCNPJ = (cnpj) => {
    // Remove non-digits
    const cleaned = cnpj.replace(/\D/g, '');

    // Basic validation (14 digits)
    if (cleaned.length !== 14) {
      return false;
    }

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cleaned)) {
      return false;
    }

    return true;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Accept 10 or 11 digits (with or without country code)
    return cleaned.length >= 10 && cleaned.length <= 13;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.companyName || formData.companyName.trim().length < 3) {
      newErrors.companyName = 'Nome da empresa deve ter no mínimo 3 caracteres';
    }

    if (!formData.companyDocument) {
      newErrors.companyDocument = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(formData.companyDocument)) {
      newErrors.companyDocument = 'CNPJ inválido';
    }

    if (!formData.contactName || formData.contactName.trim().length < 3) {
      newErrors.contactName = 'Nome do contato deve ter no mínimo 3 caracteres';
    }

    if (!formData.contactEmail) {
      newErrors.contactEmail = 'Email é obrigatório';
    } else if (!validateEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }

    if (!formData.contactPhone) {
      newErrors.contactPhone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.contactPhone)) {
      newErrors.contactPhone = 'Telefone inválido (mín. 10 dígitos)';
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

  return (
    <div className="space-y-5">
      <Card title="Informações da Empresa">
        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="form-label flex items-center gap-2 mb-2">
              <Building2 size={18} />
              Nome da Empresa
            </label>
            <input
              type="text"
              className="form-control py-2"
              placeholder="Ex: Clube Navi"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              style={{ paddingLeft: '12px', paddingRight: '12px' }}
            />
            {errors.companyName && (
              <p className="text-danger-500 text-xs mt-1">{errors.companyName}</p>
            )}
            {formData.companyName && !errors.companyName && (
              <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
                <span>✓</span> Slug será gerado automaticamente: <strong>{generateSlug(formData.companyName)}</strong>
              </p>
            )}
          </div>

          {/* CNPJ and Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label flex items-center gap-2 mb-2">
                <FileText size={18} />
                CNPJ
              </label>
              <input
                type="text"
                className="form-control py-2"
                placeholder="12.345.678/0001-90"
                value={formData.companyDocument}
                onChange={(e) => handleChange('companyDocument', e.target.value)}
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
              />
              {errors.companyDocument && (
                <p className="text-danger-500 text-xs mt-1">{errors.companyDocument}</p>
              )}
            </div>

            <div>
              <label className="form-label flex items-center gap-2 mb-2">
                <CreditCard size={18} />
                Plano Inicial
              </label>
              <div className="relative">
                <select
                  className="form-control py-2 appearance-none cursor-pointer"
                  value={formData.plan}
                  onChange={(e) => handleChange('plan', e.target.value)}
                  style={{ paddingLeft: '12px', paddingRight: '40px' }}
                >
                  <option value="basic">Basic - Funcionalidades essenciais</option>
                  <option value="pro">Pro - Recursos avançados</option>
                  <option value="premium">Premium - Todos os recursos</option>
                  <option value="custom">Custom - Personalizado</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Informações de Contato">
        <div className="space-y-4">
          {/* Contact Name */}
          <div>
            <label className="form-label flex items-center gap-2 mb-2">
              <User size={18} />
              Nome do Responsável
            </label>
            <input
              type="text"
              className="form-control py-2"
              placeholder="Ex: João Silva"
              value={formData.contactName}
              onChange={(e) => handleChange('contactName', e.target.value)}
              style={{ paddingLeft: '12px', paddingRight: '12px' }}
            />
            {errors.contactName && (
              <p className="text-danger-500 text-xs mt-1">{errors.contactName}</p>
            )}
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label flex items-center gap-2 mb-2">
                <Mail size={18} />
                Email de Contato
              </label>
              <input
                type="email"
                className="form-control py-2"
                placeholder="contato@empresa.com"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
              />
              {errors.contactEmail && (
                <p className="text-danger-500 text-xs mt-1">{errors.contactEmail}</p>
              )}
            </div>

            <div>
              <label className="form-label flex items-center gap-2 mb-2">
                <Phone size={18} />
                Telefone
              </label>
              <input
                type="text"
                className="form-control py-2"
                placeholder="+55 11 98765-4321"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
              />
              {errors.contactPhone && (
                <p className="text-danger-500 text-xs mt-1">{errors.contactPhone}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <Card>
        <div className="flex justify-between">
          <Button
            type="button"
            className="btn-outline-danger"
            onClick={onCancel}
            icon="heroicons-outline:x-mark"
            text="Cancelar"
          />
          <Button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            icon="heroicons-outline:arrow-right"
            text="Próximo: Branding"
          />
        </div>
      </Card>
    </div>
  );
};

export default Step1Company;

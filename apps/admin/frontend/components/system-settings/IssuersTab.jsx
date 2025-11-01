"use client";
import React, { useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import IssuersTable from '@/components/partials/table/issuers-table';
import { useTranslation } from 'react-i18next';

const IssuersTab = ({
  issuerForm,
  setIssuerForm,
  showIssuerForm,
  setShowIssuerForm,
  loading,
  handleIssuerSubmit,
  issuers,
  loadingIssuers,
  editingIssuer,
  setEditingIssuer,
  handleIssuerActivate,
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview
}) => {
  const { t } = useTranslation('systemSettings');
  const logoInputRef = useRef(null);

  const handleLogoChange = (e) => {
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

  return (
    <Card title={t('issuers.sectionTitle')} icon="heroicons-outline:building-office-2">
      <div className="space-y-6">
        {/* Header com botão de adicionar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('issuers.description')}
          </p>
          {!showIssuerForm && (
            <Button
              onClick={() => setShowIssuerForm(true)}
              className="btn-primary"
              icon="heroicons:plus"
              text={t('issuers.newIssuer')}
            />
          )}
        </div>

        {/* Formulário de registro/edição */}
        {showIssuerForm && (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
            <div className="space-y-4">
              {/* Upload de Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('issuers.form.logo')}
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                      <Image
                        src={logoPreview}
                        alt={t('issuers.form.preview')}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    icon="heroicons-outline:photo"
                    text={t('issuers.form.selectLogo')}
                    className="btn-outline-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      logoInputRef.current?.click();
                    }}
                  />
                  {logoPreview && (
                    <Button
                      icon="heroicons-outline:x-mark"
                      className="btn-outline-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        setLogoFile(null);
                        setLogoPreview(editingIssuer?.logoUrl || null);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Nome */}
              <Textinput
                label={t('issuers.form.issuerName')}
                type="text"
                placeholder={t('issuers.form.issuerNamePlaceholder')}
                value={issuerForm.name}
                onChange={(e) => setIssuerForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ano de Fundação */}
                <Textinput
                  label={t('issuers.form.foundationYear')}
                  type="number"
                  placeholder={t('issuers.form.foundationYearPlaceholder')}
                  value={issuerForm.foundationYear}
                  onChange={(e) => setIssuerForm(prev => ({ ...prev, foundationYear: e.target.value }))}
                  min="1800"
                  max={new Date().getFullYear()}
                />

                {/* Website */}
                <Textinput
                  label={t('issuers.form.website')}
                  type="url"
                  placeholder={t('issuers.form.websitePlaceholder')}
                  value={issuerForm.website}
                  onChange={(e) => setIssuerForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              {/* Descrição */}
              <Textarea
                label={t('issuers.form.description')}
                placeholder={t('issuers.form.descriptionPlaceholder')}
                value={issuerForm.description}
                onChange={(e) => setIssuerForm(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowIssuerForm(false);
                    setEditingIssuer(null);
                    setLogoFile(null);
                    setLogoPreview(null);
                  }}
                  className="btn-outline-secondary"
                  icon="heroicons:x-mark"
                  text={t('buttons.cancel')}
                />
                <Button
                  onClick={handleIssuerSubmit}
                  className="btn-primary"
                  isLoading={loading}
                  icon="heroicons:check"
                  text={t('buttons.save')}
                  disabled={!issuerForm.name}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de emissores - Só exibe quando não está editando/criando */}
        {!showIssuerForm && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('issuers.registeredIssuers')}
            </h4>

            <IssuersTable
              issuers={issuers}
              loading={loadingIssuers}
              onEdit={(issuer) => {
                setEditingIssuer(issuer);
                setIssuerForm({
                  name: issuer.name || '',
                  foundationYear: issuer.foundationYear || '',
                  website: issuer.website || '',
                  description: issuer.description || ''
                });
                setLogoPreview(issuer.logoUrl || null);
                setLogoFile(null);
                setShowIssuerForm(true);
              }}
              onToggleActive={handleIssuerActivate}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default IssuersTab;

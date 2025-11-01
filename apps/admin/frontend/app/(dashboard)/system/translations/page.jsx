'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Textinput from '@/components/ui/Textinput';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Icon } from '@iconify/react';
import useAuthStore from '@/store/authStore';

const TranslationsPage = () => {
  const { t, currentLanguage } = useTranslation('system');
  const { i18n } = useLanguage();
  const { accessToken } = useAuthStore();

  const LANGUAGES = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  // State
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [selectedMobileLanguage, setSelectedMobileLanguage] = useState('pt-BR');
  const [translationsByLanguage, setTranslationsByLanguage] = useState({
    'pt-BR': {},
    'en-US': {},
    'es': {}
  });
  const [originalTranslationsByLanguage, setOriginalTranslationsByLanguage] = useState({
    'pt-BR': {},
    'en-US': {},
    'es': {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [stats, setStats] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchNamespaces();
    fetchStatistics();
  }, []);

  // Fetch translations when namespace changes
  useEffect(() => {
    if (selectedNamespace) {
      fetchAllTranslations();
    }
  }, [selectedNamespace]);

  const getAuthHeaders = () => {
    if (!accessToken) {
      console.error('[Translations] No access token found');
      toast.error(t('translations.messages.sessionExpired'));
      return {
        'Content-Type': 'application/json',
      };
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
  };

  const fetchNamespaces = async () => {
    try {
      const response = await fetch('/api/translations/namespaces', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setNamespaces(data);
      }
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      toast.error(t('translations.messages.errorLoadingNamespaces'));
    }
  };

  const fetchAllTranslations = async () => {
    setLoading(true);
    try {
      const languageCodes = ['pt-BR', 'en-US', 'es'];

      // Fetch all 3 languages in parallel
      const promises = languageCodes.map(async (langCode) => {
        const response = await fetch(
          `/api/translations/${selectedNamespace}/${langCode}`,
          {
            headers: getAuthHeaders()
          }
        );
        if (response.ok) {
          const data = await response.json();

          // Convert array to object for easier manipulation
          const translationsObj = {};
          data.forEach((item) => {
            translationsObj[item.key] = item.value;
          });

          return { langCode, translations: translationsObj };
        }
        return { langCode, translations: {} };
      });

      const results = await Promise.all(promises);

      const newTranslationsByLanguage = {};
      const newOriginalTranslationsByLanguage = {};

      results.forEach(({ langCode, translations }) => {
        newTranslationsByLanguage[langCode] = translations;
        newOriginalTranslationsByLanguage[langCode] = { ...translations };
      });

      setTranslationsByLanguage(newTranslationsByLanguage);
      setOriginalTranslationsByLanguage(newOriginalTranslationsByLanguage);
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast.error(t('translations.messages.errorLoadingTranslations'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/translations/statistics', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleTranslationChange = (key, langCode, value) => {
    setTranslationsByLanguage((prev) => ({
      ...prev,
      [langCode]: {
        ...prev[langCode],
        [key]: value,
      },
    }));
  };

  const handleSaveTranslation = async (key) => {
    setSaving((prev) => ({ ...prev, [key]: true }));

    try {
      const languageCodes = ['pt-BR', 'en-US', 'es'];
      const promises = languageCodes.map(async (langCode) => {
        const response = await fetch(
          `/api/translations/${selectedNamespace}/${langCode}/${key}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ value: translationsByLanguage[langCode][key] }),
          }
        );

        if (response.ok) {
          // Update i18n in real-time for this language
          if (i18n && i18n.addResource) {
            i18n.addResource(
              langCode,
              selectedNamespace,
              key,
              translationsByLanguage[langCode][key]
            );
          }
          return { success: true, langCode };
        }
        return { success: false, langCode };
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;

      if (successCount === 3) {
        // Update original translations to reflect saved state
        setOriginalTranslationsByLanguage((prev) => {
          const updated = { ...prev };
          languageCodes.forEach(langCode => {
            updated[langCode] = {
              ...updated[langCode],
              [key]: translationsByLanguage[langCode][key],
            };
          });
          return updated;
        });

        toast.success(t('translations.messages.savedAllLanguages'));
        fetchStatistics();
      } else {
        toast.error(t('translations.messages.partialSave', { count: successCount }));
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error(t('translations.messages.errorSaving'));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSyncToFiles = async () => {
    const loadingToast = toast.loading(t('translations.messages.syncing'));

    try {
      const response = await fetch('/api/translations/sync/to-files', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || t('translations.messages.syncComplete'));
      } else {
        toast.error(t('translations.messages.errorSyncing'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error syncing:', error);
      toast.error(t('translations.messages.errorSyncing'));
    }
  };

  const handleSyncFromFiles = async () => {
    const loadingToast = toast.loading(t('translations.messages.syncing'));

    try {
      const response = await fetch('/api/translations/sync/from-files', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || t('translations.messages.syncComplete'));
        fetchAllTranslations();
        fetchStatistics();
      } else {
        toast.error(t('translations.messages.errorSyncing'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error syncing:', error);
      toast.error(t('translations.messages.errorSyncing'));
    }
  };

  // Get all unique keys from all languages
  const allKeys = Array.from(
    new Set([
      ...Object.keys(translationsByLanguage['pt-BR'] || {}),
      ...Object.keys(translationsByLanguage['en-US'] || {}),
      ...Object.keys(translationsByLanguage['es'] || {}),
    ])
  ).sort();

  // Filter keys based on search
  const filteredKeys = allKeys.filter((key) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      key.toLowerCase().includes(searchLower) ||
      (translationsByLanguage['pt-BR'][key] || '').toLowerCase().includes(searchLower) ||
      (translationsByLanguage['en-US'][key] || '').toLowerCase().includes(searchLower) ||
      (translationsByLanguage['es'][key] || '').toLowerCase().includes(searchLower)
    );
  });

  // Count modified keys
  const modifiedCount = allKeys.filter((key) => {
    return LANGUAGES.some((lang) => {
      return originalTranslationsByLanguage[lang.code][key] !== translationsByLanguage[lang.code][key];
    });
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h4 className="text-2xl font-semibold">
          {t('translations.title')}
        </h4>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('translations.statistics.totalLanguages')}</div>
              <div className="text-2xl font-bold">{stats.languages}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('translations.statistics.namespaces')}</div>
              <div className="text-2xl font-bold">{stats.namespaces}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('translations.statistics.totalTranslations')}</div>
              <div className="text-2xl font-bold">{stats.totalTranslations}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('translations.statistics.activeLanguages')}</div>
              <div className="text-2xl font-bold">{stats.activeLanguages}</div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Namespace Selector */}
            <div>
              <label className="form-label">{t('translations.controls.namespace')}</label>
              <select
                className="form-control"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
              >
                {namespaces.map((ns) => (
                  <option key={ns.id} value={ns.key}>
                    {ns.key} - {t(`translations.namespaces.${ns.key}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Language Selector - Only visible on mobile */}
            <div className="md:hidden">
              <label className="form-label">{t('translations.controls.language')}</label>
              <select
                className="form-control"
                value={selectedMobileLanguage}
                onChange={(e) => setSelectedMobileLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="form-label">{t('translations.controls.search')}</label>
              <Textinput
                placeholder={t('translations.controls.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Tooltip content={t('translations.controls.syncToFilesTooltip')} placement="bottom">
              <span>
                <Button
                  text={t('translations.controls.syncToFiles')}
                  className="btn-primary"
                  onClick={handleSyncToFiles}
                  icon="heroicons:arrow-down-tray"
                />
              </span>
            </Tooltip>
            <Tooltip content={t('translations.controls.syncFromFilesTooltip')} placement="bottom">
              <span>
                <Button
                  text={t('translations.controls.syncFromFiles')}
                  className="btn-secondary"
                  onClick={handleSyncFromFiles}
                  icon="heroicons:arrow-up-tray"
                />
              </span>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Translations Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-semibold">
              {t('translations.table.title')}: {selectedNamespace}
            </h5>
            {modifiedCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                <Icon icon="heroicons:exclamation-triangle" />
                <span>{modifiedCount} {modifiedCount > 1 ? t('translations.table.modifiedPlural') : t('translations.table.modified')}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Icon icon="line-md:loading-loop" className="text-4xl mx-auto" />
              <p className="mt-2">{t('translations.messages.loading')}</p>
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('translations.messages.noTranslations')}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header - Desktop (3 languages) */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="col-span-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('translations.table.key')}
                </div>
                <div className="col-span-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🇧🇷 {t('translations.table.portuguese')}
                </div>
                <div className="col-span-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🇺🇸 {t('translations.table.english')}
                </div>
                <div className="col-span-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🇪🇸 {t('translations.table.spanish')}
                </div>
                <div className="col-span-1 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                  {t('translations.table.save')}
                </div>
              </div>

              {/* Header - Mobile (1 language) */}
              <div className="md:hidden grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="col-span-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('translations.table.key')}
                </div>
                <div className="col-span-7 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {LANGUAGES.find(l => l.code === selectedMobileLanguage)?.flag} {LANGUAGES.find(l => l.code === selectedMobileLanguage)?.name}
                </div>
                <div className="col-span-1 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                  {t('translations.table.save')}
                </div>
              </div>

              {/* Translation Rows */}
              {filteredKeys.map((key) => {
                const isModified = LANGUAGES.some((lang) =>
                  originalTranslationsByLanguage[lang.code][key] !== translationsByLanguage[lang.code][key]
                );
                const isSaving = saving[key];

                return (
                  <React.Fragment key={key}>
                    {/* Desktop View - All 3 languages */}
                    <div
                      className={`hidden md:grid grid-cols-12 gap-4 p-4 border rounded-lg transition-colors ${
                        isModified
                          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Key Column */}
                      <div className="col-span-2 min-w-0 flex items-center">
                        <Tooltip content={key} placement="top">
                          <span className="min-w-0 flex-1 block">
                            <div
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-help overflow-hidden whitespace-nowrap"
                              style={{
                                textOverflow: 'ellipsis',
                                direction: 'rtl',
                                textAlign: 'left'
                              }}
                            >
                              <span style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
                                {key}
                              </span>
                            </div>
                          </span>
                        </Tooltip>
                      </div>

                      {/* Language Columns */}
                      {LANGUAGES.map((lang) => (
                        <div key={lang.code} className="col-span-3">
                          <Textinput
                            value={translationsByLanguage[lang.code][key] || ''}
                            onChange={(e) => handleTranslationChange(key, lang.code, e.target.value)}
                            className="w-full"
                            placeholder={`${lang.name}...`}
                          />
                        </div>
                      ))}

                      {/* Action Column */}
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          text={isSaving ? '' : ''}
                          className={`btn-primary btn-sm ${
                            !isModified ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleSaveTranslation(key)}
                          icon={isSaving ? 'line-md:loading-loop' : 'heroicons:paper-airplane'}
                          disabled={!isModified || isSaving}
                        />
                      </div>
                    </div>

                    {/* Mobile View - Selected language only */}
                    <div
                      className={`md:hidden grid grid-cols-12 gap-4 p-4 border rounded-lg transition-colors ${
                        isModified
                          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Key Column */}
                      <div className="col-span-4 min-w-0 flex items-center">
                        <Tooltip content={key} placement="top">
                          <span className="min-w-0 flex-1 block">
                            <div
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-help overflow-hidden whitespace-nowrap"
                              style={{
                                textOverflow: 'ellipsis',
                                direction: 'rtl',
                                textAlign: 'left'
                              }}
                            >
                              <span style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
                                {key}
                              </span>
                            </div>
                          </span>
                        </Tooltip>
                      </div>

                      {/* Selected Language Column */}
                      <div className="col-span-7">
                        <Textinput
                          value={translationsByLanguage[selectedMobileLanguage][key] || ''}
                          onChange={(e) => handleTranslationChange(key, selectedMobileLanguage, e.target.value)}
                          className="w-full"
                          placeholder={LANGUAGES.find(l => l.code === selectedMobileLanguage)?.name}
                        />
                      </div>

                      {/* Action Column */}
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          text={isSaving ? '' : ''}
                          className={`btn-primary btn-sm ${
                            !isModified ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleSaveTranslation(key)}
                          icon={isSaving ? 'line-md:loading-loop' : 'heroicons:paper-airplane'}
                          disabled={!isModified || isSaving}
                        />
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TranslationsPage;

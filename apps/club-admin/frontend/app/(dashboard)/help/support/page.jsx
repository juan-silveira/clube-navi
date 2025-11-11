"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const SupportPage = () => {
  const router = useRouter();
  const { t } = useTranslation('help');
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    { value: '', label: t('support.form.category.options.select') },
    { value: 'account', label: t('support.form.category.options.account') },
    { value: 'deposit', label: t('support.form.category.options.deposit') },
    { value: 'withdrawal', label: t('support.form.category.options.withdrawal') },
    { value: 'exchange', label: t('support.form.category.options.exchange') },
    { value: 'security', label: t('support.form.category.options.security') },
    { value: 'kyc', label: t('support.form.category.options.kyc') },
    { value: 'other', label: t('support.form.category.options.other') }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ subject: '', category: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/help')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('support.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('support.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('support.form.title')}
              </h2>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                  <Icon icon="heroicons:check-circle" className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">{t('support.form.success.title')}</p>
                    <p className="text-sm text-green-600 dark:text-green-300">{t('support.form.success.description')}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">{t('support.form.subject.label')}</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder={t('support.form.subject.placeholder')}
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-control py-2"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">{t('support.form.category.label')}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-control py-2"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">{t('support.form.message.label')}</label>
                  <textarea
                    name="message"
                    placeholder={t('support.form.message.placeholder')}
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="form-control py-2"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('support.form.submitting') : t('support.form.submit')}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          {/* Support Hours */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:clock" className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('support.info.hours.title')}
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>{t('support.info.hours.weekdays')}</strong> {t('support.info.hours.weekdaysTime')}</p>
                <p><strong>{t('support.info.hours.saturday')}</strong> {t('support.info.hours.saturdayTime')}</p>
                <p><strong>{t('support.info.hours.sunday')}</strong> {t('support.info.hours.sundayTime')}</p>
              </div>
            </div>
          </Card>

          {/* Response Time */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('support.info.responseTime.title')}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: t('support.info.responseTime.description') }} />
            </div>
          </Card>

          {/* Other Options */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:question-mark-circle" className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('support.info.otherOptions.title')}
                </h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/help/faq')}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('support.info.otherOptions.faq')}
                    </span>
                    <Icon icon="heroicons:arrow-right" className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
                <button
                  onClick={() => router.push('/help/tutorials')}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('support.info.otherOptions.tutorials')}
                    </span>
                    <Icon icon="heroicons:arrow-right" className="w-4 h-4 text-gray-500" />
                  </div>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;

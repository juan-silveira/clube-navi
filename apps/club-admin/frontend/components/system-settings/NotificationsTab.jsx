import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MultiSelect from '@/components/ui/MultiSelect';
import { useTranslation } from '@/hooks/useTranslation';

const NotificationsTab = ({
  users,
  withdrawalUsers,
  setWithdrawalUsers,
  documentUsers,
  setDocumentUsers,
  loadingNotifications,
  saveNotificationConfig,
  handleSelectAllWithdrawal,
  handleDeselectAllWithdrawal,
  handleSelectAllDocument,
  handleDeselectAllDocument,
  normalizePhoneDisplay
}) => {
  const { t } = useTranslation('systemSettings');

  return (
    <div className="space-y-6">
      <Card title={t('notifications.withdrawalNotices.title')} icon="heroicons-outline:currency-dollar">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('notifications.withdrawalNotices.description')}
          </p>
          {loadingNotifications ? (
            <div className="text-center py-4 text-gray-500">{t('notifications.loading')}</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('notifications.withdrawalNotices.usersLabel')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllWithdrawal}
                    className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                    type="button"
                  >
                    {t('buttons.selectAll')}
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleDeselectAllWithdrawal}
                    className="text-xs text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                    type="button"
                  >
                    {t('buttons.removeAll')}
                  </button>
                </div>
              </div>
              <MultiSelect
                label=""
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.name}${user.phone ? ` (${normalizePhoneDisplay(user.phone)})` : ''}`,
                  disabled: !user.phone
                }))}
                value={withdrawalUsers}
                onChange={setWithdrawalUsers}
                placeholder={t('notifications.withdrawalNotices.searchPlaceholder')}
                disabled={loadingNotifications}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('notifications.withdrawalNotices.usersSelected', { count: withdrawalUsers.length })}
              </p>
            </>
          )}
          <div className="flex justify-end">
            <Button
              text={t('buttons.saveConfig')}
              className="btn-primary"
              onClick={saveNotificationConfig}
              isLoading={loadingNotifications}
            />
          </div>
        </div>
      </Card>

      <Card title={t('notifications.documentNotices.title')} icon="heroicons-outline:document-text">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('notifications.documentNotices.description')}
          </p>
          {loadingNotifications ? (
            <div className="text-center py-4 text-gray-500">{t('notifications.loading')}</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('notifications.documentNotices.usersLabel')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllDocument}
                    className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                    type="button"
                  >
                    {t('buttons.selectAll')}
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleDeselectAllDocument}
                    className="text-xs text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                    type="button"
                  >
                    {t('buttons.removeAll')}
                  </button>
                </div>
              </div>
              <MultiSelect
                label=""
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.name}${user.phone ? ` (${normalizePhoneDisplay(user.phone)})` : ''}`,
                  disabled: !user.phone
                }))}
                value={documentUsers}
                onChange={setDocumentUsers}
                placeholder={t('notifications.documentNotices.searchPlaceholder')}
                disabled={loadingNotifications}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('notifications.documentNotices.usersSelected', { count: documentUsers.length })}
              </p>
            </>
          )}
          <div className="flex justify-end">
            <Button
              text={t('buttons.saveConfig')}
              className="btn-primary"
              onClick={saveNotificationConfig}
              isLoading={loadingNotifications}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationsTab;

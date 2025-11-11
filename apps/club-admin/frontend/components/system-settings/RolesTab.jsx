import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Select from '@/components/ui/Select';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Eye,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const RolesTab = ({
  selectedAddress,
  setSelectedAddress,
  selectedContract,
  setSelectedContract,
  addressRoles,
  loadingRoles,
  grantingRole,
  checkAddressRoles,
  handleGrantRole
}) => {
  const { t } = useTranslation('systemSettings');

  return (
    <Card title={t('roles.sectionTitle')} icon="heroicons-outline:users">
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('roles.description')}
        </p>

        {/* Formulário de verificação de roles */}
        <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              {t('roles.verifyRolesTitle')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textinput
                label={t('roles.addressToVerify')}
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                placeholder={t('roles.addressPlaceholder')}
                required
              />
              <Select
                label={t('roles.contract')}
                options={[
                  { value: '0x0b5F5510160E27E6BFDe03914a18d555B590DAF5', label: t('roles.contractOptions.pcnToken') },
                  { value: '0xe21fc42e8c8758f6d999328228721F7952e5988d', label: t('roles.contractOptions.stakeContract') },
                  { value: '0x5528C065931f523CA9F3a6e49a911896fb1D2e6f', label: t('roles.contractOptions.adminToken') }
                ]}
                value={selectedContract}
                onChange={(value) => setSelectedContract(value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={checkAddressRoles}
                className="btn-primary"
                isLoading={loadingRoles}
                disabled={!selectedAddress || !selectedContract}
              >
                <Eye size={16} className="mr-2" />
                {t('roles.verifyRoles')}
              </Button>
            </div>
          </div>
        </div>

        {/* Resultado das roles */}
        {Object.keys(addressRoles).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('roles.rolesFor', { address: `${selectedAddress.slice(0, 6)}...${selectedAddress.slice(-4)}` })}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(addressRoles).map(([roleKey, hasRole]) => (
                <div key={roleKey} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {hasRole ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {roleKey.replace('_ROLE', '').replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      hasRole
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {hasRole ? t('roles.hasRole') : t('roles.noRole')}
                    </span>
                  </div>

                  {!hasRole && (
                    <Button
                      onClick={() => handleGrantRole(roleKey)}
                      className="btn-primary btn-sm w-full"
                      isLoading={grantingRole}
                      size="sm"
                    >
                      <Key size={14} className="mr-1" />
                      {t('roles.grantRole')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações importantes */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                {t('roles.infoBox.title')}
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• {t('roles.infoBox.transferRole')}</li>
                <li>• {t('roles.infoBox.adminRole')}</li>
                <li>• {t('roles.infoBox.minterRole')}</li>
                <li>• {t('roles.infoBox.burnerRole')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RolesTab;

'use client';

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { Building, ChevronDown, Check } from 'lucide-react';

const CompanySwitcher = () => {
  const {
    activeCompany,
    availableCompanies,
    switchCompany,
    hasMultipleCompanies
  } = useActiveCompany();

  // Se usuário só tem uma company, não mostrar o switcher
  if (!hasMultipleCompanies) {
    return null;
  }

  const activeCompanyData = availableCompanies.find(c => c.isActive);

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <Building className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <div className="flex flex-col items-start">
            <span className="text-xs text-slate-500 dark:text-slate-400">Empresa</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {activeCompanyData?.name || 'Selecione'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Trocar Empresa
              </div>
              {availableCompanies.map((company) => (
                <Menu.Item key={company.id}>
                  {({ active }) => (
                    <button
                      onClick={() => switchCompany(company.id)}
                      className={`
                        ${active ? 'bg-slate-100 dark:bg-slate-700' : ''}
                        ${company.isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                        group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors
                      `}
                    >
                      <div className="flex flex-col items-start">
                        <span className={`
                          font-medium
                          ${company.isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-900 dark:text-white'
                          }
                        `}>
                          {company.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {getRoleLabel(company.role)}
                        </span>
                      </div>
                      {company.isActive && (
                        <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

const getRoleLabel = (role) => {
  const labels = {
    'USER': 'Usuário',
    'ADMIN': 'Administrador',
    'APP_ADMIN': 'Admin da Empresa',
    'SUPER_ADMIN': 'Super Admin'
  };
  return labels[role] || role;
};

export default CompanySwitcher;

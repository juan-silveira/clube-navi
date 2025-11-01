"use client";
import React, { useState } from "react";
import { Edit3, Layers, ChevronLeft, ChevronRight, Power } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Tooltip from "@/components/ui/Tooltip";

const StakesTable = ({
  contracts = [],
  onEdit,
  onToggleActive,
  loading = false
}) => {
  const { t } = useTranslation('systemSettings');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = contracts.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <Layers size={48} className="mx-auto mb-4 opacity-50" />
        <p>{t('stakes.noContracts') || 'Nenhum contrato encontrado'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabela Responsiva - Funciona em todas as telas */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('stakes.table.name') || 'Nome'}
                </th>
                <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('stakes.table.token') || 'Token'}
                </th>
                <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('stakes.table.investmentType') || 'Tipo de Investimento'}
                </th>
                <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('stakes.table.status') || 'Status'}
                </th>
                <th className="pb-4 px-6 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('stakes.table.actions') || 'Ações'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900">
              {currentContracts.map((contract, index) => (
                <tr
                  key={contract.id}
                  className={`transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  {/* Nome */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {contract.name}
                        </p>
                        {contract.metadata?.code && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                            {contract.metadata.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Token */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      {contract.symbol && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 w-fit">
                          {contract.symbol}
                        </span>
                      )}
                      {(contract.tokenAddress || contract.metadata?.tokenAddress) && (
                        <code className="text-xs text-gray-500 dark:text-gray-400">
                          {(contract.tokenAddress || contract.metadata?.tokenAddress).slice(0, 6)}...
                          {(contract.tokenAddress || contract.metadata?.tokenAddress).slice(-4)}
                        </code>
                      )}
                    </div>
                  </td>

                  {/* Tipo de Investimento */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {contract.metadata?.investment_type === 'fixed' && 'Renda Fixa'}
                      {contract.metadata?.investment_type === 'variable' && 'Renda Variável'}
                      {contract.metadata?.investment_type === 'stake' && 'Stake'}
                      {contract.metadata?.investment_type === 'pratique' && 'Pedacinho Pratique'}
                      {contract.metadata?.investment_type === 'privateOffer' && 'Oferta Privada'}
                      {!contract.metadata?.investment_type && 'N/A'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      contract.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {contract.isActive ? t('stakes.table.active') : t('stakes.table.inactive')}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip
                        content={contract.isActive ? (t('buttons.deactivate') || 'Desativar') : (t('buttons.activate') || 'Ativar')}
                        placement="top"
                      >
                        <button
                          type="button"
                          onClick={() => onToggleActive && onToggleActive(contract)}
                          className={`p-2 rounded-lg text-white transition-colors ${
                            contract.isActive
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          <Power size={18} />
                        </button>
                      </Tooltip>
                      <Tooltip
                        content={t('buttons.edit') || 'Editar'}
                        placement="top"
                      >
                        <button
                          type="button"
                          onClick={() => onEdit(contract)}
                          className="p-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 items-center gap-2">
            <button
              className={`p-2 rounded-lg ${
                currentPage === 0
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    i === currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => goToPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              className={`p-2 rounded-lg ${
                currentPage === totalPages - 1
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        </div>
    </>
  );
};

export default StakesTable;

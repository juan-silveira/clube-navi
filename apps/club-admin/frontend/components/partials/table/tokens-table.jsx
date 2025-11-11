"use client";
import React, { useState } from "react";
import { Edit3, Coins, ChevronLeft, ChevronRight, Power } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Tooltip from "@/components/ui/Tooltip";

const TokensTable = ({
  tokens = [],
  onEdit,
  onToggleActive,
  loading = false
}) => {
  const { t } = useTranslation('systemSettings');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(tokens.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTokens = tokens.slice(startIndex, endIndex);

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

  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <Coins size={48} className="mx-auto mb-4 opacity-50" />
        <p>{t('tokens.noTokens') || 'Nenhum token encontrado'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabela Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('tokens.table.name') || 'Nome'}
              </th>
              <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('tokens.table.symbol') || 'Símbolo'}
              </th>
              <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('tokens.table.status') || 'Status'}
              </th>
              <th className="pb-4 px-6 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('tokens.table.actions') || 'Ações'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {currentTokens.map((token, index) => (
              <tr
                key={token.id}
                className={`transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 ${
                  index % 2 === 0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                {/* Nome */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {token.name}
                      </p>
                      {token.address && (
                        <code className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </code>
                      )}
                    </div>
                  </div>
                </td>

                {/* Símbolo */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 w-fit">
                    {token.symbol || token.metadata?.symbol || 'N/A'}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    token.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  }`}>
                    {token.isActive ? t('tokens.table.active') : t('tokens.table.inactive')}
                  </span>
                </td>

                {/* Ações */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip
                      content={token.isActive ? (t('buttons.deactivate') || 'Desativar') : (t('buttons.activate') || 'Ativar')}
                      placement="top"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleActive && onToggleActive(token)}
                        className={`p-2 rounded-lg text-white transition-colors ${
                          token.isActive
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
                        onClick={() => onEdit(token)}
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

export default TokensTable;

"use client";
import React, { useState } from 'react';
import { Edit3, Building2, ChevronLeft, ChevronRight, Power } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import Image from 'next/image';

const IssuersTable = ({
  issuers = [],
  onEdit,
  onToggleActive,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(issuers.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIssuers = issuers.slice(startIndex, endIndex);

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

  if (!issuers || issuers.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <Building2 size={48} className="mx-auto mb-4 opacity-50" />
        <p>Nenhum emissor encontrado</p>
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
                Emissor
              </th>
              <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Fundação
              </th>
              <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Website
              </th>
              <th className="pb-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="pb-4 px-6 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {currentIssuers.map((issuer, index) => (
              <tr
                key={issuer.id}
                className={`transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 ${
                  index % 2 === 0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                {/* Emissor */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    {issuer.logoUrl ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={issuer.logoUrl}
                          alt={issuer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {issuer.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {issuer.name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Fundação */}
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {issuer.foundationYear || '--'}
                  </span>
                </td>

                {/* Website */}
                <td className="py-4 px-6">
                  {issuer.website ? (
                    <a
                      href={issuer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400 truncate block max-w-xs"
                    >
                      {issuer.website.replace(/^https?:\/\//, '').substring(0, 30)}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">--</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    issuer.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  }`}>
                    {issuer.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>

                {/* Ações */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip
                      content={issuer.isActive ? 'Desativar' : 'Ativar'}
                      placement="top"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleActive && onToggleActive(issuer)}
                        className={`p-2 rounded-lg text-white transition-colors ${
                          issuer.isActive
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <Power size={18} />
                      </button>
                    </Tooltip>
                    <Tooltip
                      content="Editar"
                      placement="top"
                    >
                      <button
                        type="button"
                        onClick={() => onEdit(issuer)}
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

export default IssuersTable;

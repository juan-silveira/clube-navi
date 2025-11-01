"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FileText, Download, Calendar, Loader2, Info, ExternalLink } from 'lucide-react';
import { useAlertContext } from '@/contexts/AlertContext';
import useDarkmode from '@/hooks/useDarkMode';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

const StatementsModal = ({
  isOpen,
  onClose,
  contractId,
  contractName
}) => {
  const { t } = useTranslation('investments');
  const { showError } = useAlertContext();
  const [isDark] = useDarkmode();
  const [loading, setLoading] = useState(false);
  const [statements, setStatements] = useState([]);

  useEffect(() => {
    if (isOpen && contractId) {
      loadStatements();
    }
  }, [isOpen, contractId]);

  const loadStatements = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/stake-statements/${contractId}`);

      if (response.data.success) {
        setStatements(response.data.data || []);
      } else {
        showError(t('pedacinhoPratique.statements.loading'));
        setStatements([]);
      }
    } catch (error) {
      console.error('Error loading statements:', error);
      showError(t('pedacinhoPratique.statements.loading'));
      setStatements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleOpen = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const handleDownload = (fileUrl, fileName) => {
    // Criar um link temporário para forçar download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'demonstrativo.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Classes baseadas no tema atual
  const tableClasses = {
    table: isDark ? "bg-slate-900" : "bg-white",
    headerBorder: isDark ? "border-slate-700" : "border-slate-200",
    headerText: isDark ? "text-slate-300" : "text-slate-700",
    rowBorder: isDark ? "border-slate-800" : "border-slate-100",
    rowBg: isDark ? "bg-slate-800/50" : "bg-slate-50",
    cellText: isDark ? "text-slate-400" : "text-slate-600",
    cellTextBold: isDark ? "text-white" : "text-slate-900"
  };

  return (
    <Modal
      title={t('pedacinhoPratique.statements.modalTitle', { contractName: contractName || 'Contrato' })}
      activeModal={isOpen}
      onClose={onClose}
      centered
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <span className="ml-2 text-slate-600 dark:text-slate-400">{t('pedacinhoPratique.statements.loading')}</span>
          </div>
        ) : statements.length === 0 ? (
          <div className="text-center py-12">
            <Info className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600 dark:text-slate-400">{t('pedacinhoPratique.statements.noStatements')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${tableClasses.table}`}>
              <thead>
                <tr className={`border-b ${tableClasses.headerBorder}`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${tableClasses.headerText}`}>
                    {t('pedacinhoPratique.statements.table.date')}
                  </th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${tableClasses.headerText}`}>
                    {t('pedacinhoPratique.statements.table.name')}
                  </th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${tableClasses.headerText}`}>
                    {t('pedacinhoPratique.statements.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {statements.map((statement, index) => (
                  <tr
                    key={statement.id}
                    className={`border-b ${tableClasses.rowBorder} ${
                      index % 2 === 0 ? tableClasses.rowBg : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                        <span className={`text-sm ${tableClasses.cellText}`}>
                          {formatDate(statement.statementDate)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                        {statement.linkUrl ? (
                          <a
                            href={statement.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-medium ${tableClasses.cellTextBold} hover:text-primary-500 underline cursor-pointer transition-colors`}
                          >
                            {statement.name}
                          </a>
                        ) : (
                          <span className={`text-sm font-medium ${tableClasses.cellTextBold}`}>
                            {statement.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        {statement.fileUrl && (
                          <>
                            <Button
                              className="btn-sm btn-primary inline-flex items-center"
                              onClick={() => handleOpen(statement.fileUrl)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              {t('pedacinhoPratique.statements.buttons.open')}
                            </Button>
                            <Button
                              className="btn-sm btn-outline-primary inline-flex items-center"
                              onClick={() => handleDownload(statement.fileUrl, statement.name)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {t('pedacinhoPratique.statements.buttons.download')}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Botão de Fechar */}
        <div className="flex justify-end pt-4">
          <Button
            text={t('pedacinhoPratique.statements.buttons.close')}
            className="btn-secondary"
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  );
};

export default StatementsModal;

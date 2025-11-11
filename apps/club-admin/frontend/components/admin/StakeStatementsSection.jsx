"use client";

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FileText, ChevronDown, ChevronUp, Loader2, Info, Download, Plus, ExternalLink, Edit } from 'lucide-react';
import { useAlertContext } from '@/contexts/AlertContext';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import AddStatementModal from './modals/AddStatementModal';

const StakeStatementsSection = ({ contractId, companyId, contractName }) => {
  const { t } = useTranslation('admin');
  const { showSuccess, showError } = useAlertContext();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statements, setStatements] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState(null);

  useEffect(() => {
    if (contractId) {
      loadStatements();
    }
  }, [contractId]);

  const loadStatements = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/stake-statements/${contractId}`);

      if (response.data.success) {
        setStatements(response.data.data || []);
      } else {
        showError(t('companyStakes.statements.loading'));
        setStatements([]);
      }
    } catch (error) {
      console.error('Error loading statements:', error);
      showError(t('companyStakes.statements.loading'));
      setStatements([]);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleAddSuccess = () => {
    loadStatements();
  };

  const handleEdit = (statement) => {
    setEditingStatement(statement);
    setAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditingStatement(null);
  };

  return (
    <>
      <Card>
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-500" />
            {t('companyStakes.statements.title')}
            {statements.length > 0 && (
              <Badge className="ml-2 bg-primary-500 text-white text-xs">
                {statements.length}
              </Badge>
            )}
          </h2>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Botão Adicionar */}
            <div className="flex justify-end">
              <Button
                className="btn-primary inline-flex items-center"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('companyStakes.statements.addButton')}
              </Button>
            </div>

            {/* Tabela de Demonstrativos */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                <span className="ml-2 text-slate-600 dark:text-slate-400">{t('companyStakes.statements.loading')}</span>
              </div>
            ) : statements.length === 0 ? (
              <div className="text-center py-12">
                <Info className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">{t('companyStakes.statements.noStatements')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  {t('companyStakes.statements.noStatementsDesc')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('companyStakes.statements.table.date')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('companyStakes.statements.table.name')}
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('companyStakes.statements.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statements.map((statement, index) => (
                      <tr
                        key={statement.id}
                        className={`border-b border-slate-100 dark:border-slate-800 ${
                          index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(statement.statementDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                            {statement.linkUrl ? (
                              <a
                                href={statement.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-slate-900 dark:text-white hover:text-primary-500 underline cursor-pointer transition-colors"
                              >
                                {statement.name}
                              </a>
                            ) : (
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {statement.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                            {statement.fileUrl && (
                              <>
                                <Button
                                  className="btn-sm btn-primary inline-flex items-center"
                                  onClick={() => handleOpen(statement.fileUrl)}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  {t('companyStakes.statements.buttons.open')}
                                </Button>
                                <Button
                                  className="btn-sm btn-outline-primary inline-flex items-center"
                                  onClick={() => handleDownload(statement.fileUrl, statement.name)}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  {t('companyStakes.statements.buttons.download')}
                                </Button>
                              </>
                            )}
                            <Button
                              className="btn-sm btn-outline-dark inline-flex items-center"
                              onClick={() => handleEdit(statement)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {t('companyStakes.statements.buttons.edit')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal de Adicionar/Editar */}
      <AddStatementModal
        isOpen={addModalOpen}
        onClose={handleCloseModal}
        contractId={contractId}
        companyId={companyId}
        onSuccess={handleAddSuccess}
        editingStatement={editingStatement}
      />
    </>
  );
};

export default StakeStatementsSection;

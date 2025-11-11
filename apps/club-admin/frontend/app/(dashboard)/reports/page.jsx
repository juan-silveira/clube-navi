"use client";
import React, { useState } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import { useAlertContext } from "@/contexts/AlertContext";
import { clubAdminApi } from "@/services/api";

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("transactions");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const { showSuccess, showError } = useAlertContext();

  const reportTypes = [
    { value: "transactions", label: "Transações" },
    { value: "cashback", label: "Cashback Distribuído" },
    { value: "users", label: "Usuários" },
    { value: "merchants", label: "Comerciantes" },
    { value: "products", label: "Produtos Mais Vendidos" },
    { value: "financial", label: "Resumo Financeiro" },
  ];

  const handleGenerateReport = async (format) => {
    try {
      setLoading(true);

      // Validar datas
      if (!dateRange.startDate || !dateRange.endDate) {
        showError("Por favor, selecione o período do relatório");
        return;
      }

      const response = await clubAdminApi.post(`/reports/generate`, {
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format
      }, {
        responseType: 'blob' // Para download de arquivos
      });

      // Criar download do arquivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
      const fileName = `relatorio_${reportType}_${dateRange.startDate}_${dateRange.endDate}.${extension}`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSuccess(`Relatório ${format.toUpperCase()} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      showError("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const quickReports = [
    {
      title: "Relatório Diário",
      description: "Transações e cashback de hoje",
      icon: "heroicons:calendar-days",
      color: "primary",
      onClick: () => {
        const today = new Date().toISOString().split('T')[0];
        setDateRange({ startDate: today, endDate: today });
        setReportType("transactions");
      }
    },
    {
      title: "Relatório Semanal",
      description: "Últimos 7 dias",
      icon: "heroicons:calendar",
      color: "success",
      onClick: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        setDateRange({
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        });
        setReportType("financial");
      }
    },
    {
      title: "Relatório Mensal",
      description: "Último mês completo",
      icon: "heroicons:chart-bar",
      color: "warning",
      onClick: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        setDateRange({
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        });
        setReportType("financial");
      }
    },
    {
      title: "Relatório Anual",
      description: "Todo o ano atual",
      icon: "heroicons:document-chart-bar",
      color: "info",
      onClick: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        setDateRange({
          startDate: start.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        });
        setReportType("financial");
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Gere relatórios detalhados do seu clube</p>
        </div>
      </div>

      {/* Relatórios Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickReports.map((report, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={report.onClick}>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900 flex items-center justify-center`}>
                  <Icon icon={report.icon} className={`w-6 h-6 text-${report.color}-600 dark:text-${report.color}-300`} />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{report.title}</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{report.description}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gerador de Relatórios Personalizado */}
      <Card title="Gerar Relatório Personalizado" subtitle="Configure e exporte seus relatórios">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações */}
            <div className="space-y-4">
              <div>
                <label className="form-label">Tipo de Relatório</label>
                <Select
                  options={reportTypes}
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Data Inicial</label>
                <Textinput
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Data Final</label>
                <Textinput
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Informações e Ações */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-2">
                  <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Tipos de Relatório:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>Transações:</strong> Lista detalhada de todas as transações</li>
                      <li><strong>Cashback:</strong> Histórico completo de cashback distribuído</li>
                      <li><strong>Usuários:</strong> Dados de cadastro e atividade dos membros</li>
                      <li><strong>Comerciantes:</strong> Performance e vendas por comerciante</li>
                      <li><strong>Produtos:</strong> Ranking de produtos mais vendidos</li>
                      <li><strong>Financeiro:</strong> Resumo financeiro com gráficos e totais</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label mb-3">Formato de Exportação</label>
                <div className="space-y-2">
                  <Button
                    text="Exportar como Excel (.xlsx)"
                    className="btn-outline-success w-full"
                    onClick={() => handleGenerateReport('excel')}
                    isLoading={loading}
                    icon="heroicons:table-cells"
                  />
                  <Button
                    text="Exportar como PDF (.pdf)"
                    className="btn-outline-danger w-full"
                    onClick={() => handleGenerateReport('pdf')}
                    isLoading={loading}
                    icon="heroicons:document-text"
                  />
                  <Button
                    text="Exportar como CSV (.csv)"
                    className="btn-outline-primary w-full"
                    onClick={() => handleGenerateReport('csv')}
                    isLoading={loading}
                    icon="heroicons:document-arrow-down"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Histórico de Relatórios Gerados */}
      <Card title="Relatórios Recentes" subtitle="Últimos relatórios gerados">
        <div className="p-4">
          <div className="text-center py-12">
            <Icon icon="heroicons:document-chart-bar" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Nenhum relatório gerado ainda</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Os relatórios gerados aparecerão aqui para acesso rápido
            </p>
          </div>
        </div>
      </Card>

      {/* Dicas */}
      <Card>
        <div className="p-6">
          <div className="flex gap-3">
            <Icon icon="heroicons:light-bulb" className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Dicas para Relatórios</h5>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Use relatórios diários para acompanhar o desempenho em tempo real</li>
                <li>• Relatórios mensais são ideais para análises de tendências e planejamento</li>
                <li>• Exporte em Excel para manipular e criar suas próprias análises</li>
                <li>• PDFs são perfeitos para apresentações e arquivamento</li>
                <li>• CSVs podem ser importados em outras ferramentas de análise</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;

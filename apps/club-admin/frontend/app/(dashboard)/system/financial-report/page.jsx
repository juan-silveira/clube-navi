"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import useConfig from "@/hooks/useConfig";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "react-select";
import MultiSelect from "@/components/ui/MultiSelect";
import usePermissions from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from "@/components/ui/Tooltip";
import {
  Search,
  Download,
  RefreshCw,
  Building,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Send,
  Inbox,
  XCircle,
  CheckCircle
} from 'lucide-react';

const FinancialReportPage = () => {
  const { t } = useTranslation('financial');
  const { showSuccess, showError } = useAlertContext();
  const router = useRouter();
  const permissions = usePermissions();
  const [isDark] = useDarkMode();
  const { defaultNetwork } = useConfig();

  const [users, setUsers] = useState([]);
  const [tokenSymbols, setTokenSymbols] = useState([]);
  const [tokenTotals, setTokenTotals] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [syncingBlockchain, setSyncingBlockchain] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Estado para controlar linhas expandidas
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    network: '',
    onlyWithBalance: 'all', // 'all', 'with', 'without'
    selectedTokens: [] // Array de símbolos de tokens selecionados
  });

  // Função para alternar expansão de usuário
  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Função para gerar tooltip com histórico
  const generateHistoryTooltip = (tokenData, symbol) => {
    const history = tokenData.history || {};
    const hasHistory = (
      parseFloat(history.deposits || 0) > 0 ||
      parseFloat(history.withdrawals || 0) > 0 ||
      parseFloat(history.transfersSent || 0) > 0 ||
      parseFloat(history.transfersReceived || 0) > 0
    );

    if (!hasHistory) {
      return null;
    }

    return (
      <div className="space-y-2 p-2 min-w-48">
        <div className="font-semibold text-sm border-b border-gray-200 pb-1 mb-2">
          {symbol} - Histórico
        </div>

        {parseFloat(history.deposits || 0) > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-green-400">
              <ArrowDownCircle size={14} />
              <span>Depósitos:</span>
            </div>
            <span className="font-medium text-white">{history.deposits}</span>
          </div>
        )}

        {parseFloat(history.withdrawals || 0) > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-red-400">
              <ArrowUpCircle size={14} />
              <span>Saques:</span>
            </div>
            <span className="font-medium text-white">{history.withdrawals}</span>
          </div>
        )}

        {parseFloat(history.transfersSent || 0) > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-orange-400">
              <Send size={14} />
              <span>Enviou:</span>
            </div>
            <span className="font-medium text-white">{history.transfersSent}</span>
          </div>
        )}

        {parseFloat(history.transfersReceived || 0) > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-blue-400">
              <Inbox size={14} />
              <span>Recebeu:</span>
            </div>
            <span className="font-medium text-white">{history.transfersReceived}</span>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!permissions.canViewSystemSettings) {
      router.push("/dashboard");
      return;
    }

    // Aguardar defaultNetwork estar disponível antes de carregar
    if (!initialLoadDone && defaultNetwork) {
      loadReport();
    }
  }, [permissions.canViewSystemSettings, router, initialLoadDone, defaultNetwork]);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        network: filters.network || defaultNetwork, // Usa filtro ou rede padrão
        ...(filters.company && { companyId: filters.company }),
        ...(filters.search && { search: filters.search }),
        ...(filters.onlyWithBalance !== 'all' && { onlyWithBalance: filters.onlyWithBalance }),
        ...(filters.selectedTokens.length > 0 && { tokens: filters.selectedTokens.join(',') })
      };

      const response = await api.get('/api/admin/financial-report', { params });

      if (response.data.success && response.data.data) {
        setUsers(response.data.data.users || []);
        setTokenSymbols(response.data.data.tokenSymbols || []);
        setTokenTotals(response.data.data.tokenTotals || {});
        setSummary(response.data.data.summary || {});
        setInitialLoadDone(true);
      } else {
        showError(t('messages.loadError') || 'Erro ao carregar relatório');
      }

    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      showError(t('messages.loadError') || 'Erro ao carregar relatório financeiro');
    } finally {
      setLoading(false);
    }
  }, [filters, defaultNetwork]);

  const syncBlockchain = useCallback(async () => {
    try {
      setSyncingBlockchain(true);

      const params = {
        network: filters.network || defaultNetwork
      };

      const response = await api.post('/api/admin/financial-report/sync-blockchain', {}, { params });

      if (response.data.success) {
        showSuccess(
          t('messages.syncStarted') ||
          `Sincronização iniciada para ${response.data.data.total} usuários. Os dados serão atualizados em breve.`
        );

        // Aguardar um pouco e recarregar o relatório
        setTimeout(() => {
          loadReport();
        }, 3000);
      } else {
        showError(t('messages.syncError') || 'Erro ao iniciar sincronização blockchain');
      }

    } catch (error) {
      console.error('Erro ao sincronizar blockchain:', error);
      showError(t('messages.syncError') || 'Erro ao sincronizar com blockchain');
    } finally {
      setSyncingBlockchain(false);
    }
  }, [filters, defaultNetwork, showSuccess, showError, t, loadReport]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      company: '',
      network: '',
      onlyWithBalance: 'all',
      selectedTokens: []
    });
    setInitialLoadDone(false);
  };

  const exportReport = () => {
    const csvRows = [];

    // Header
    const header = ['Nome', 'Email', 'CPF', 'Empresa', 'Status'];
    tokenSymbols.forEach(symbol => {
      header.push(`${symbol} - Saldo`);
      header.push(`${symbol} - Stake`);
      header.push(`${symbol} - Ordem`);
      header.push(`${symbol} - Total`);
    });
    csvRows.push(header.join(','));

    // Data rows
    users.forEach(user => {
      const row = [
        `"${user.userName}"`,
        `"${user.userEmail}"`,
        `"${user.userCpf}"`,
        `"${user.company?.name || 'Sem empresa'}"`,
        user.isActive ? 'Ativo' : 'Inativo'
      ];

      tokenSymbols.forEach(symbol => {
        const tokenData = user.tokenData[symbol];
        row.push(tokenData.balance);
        row.push(tokenData.stake);
        row.push(tokenData.order);
        row.push(tokenData.total);
      });

      csvRows.push(row.join(','));
    });

    // Totals row
    const totalsRow = ['', '', '', '', 'TOTAL'];
    tokenSymbols.forEach(symbol => {
      const totals = tokenTotals[symbol];
      totalsRow.push(totals.balance);
      totalsRow.push(totals.stake);
      totalsRow.push(totals.order);
      totalsRow.push(totals.total);
    });
    csvRows.push(totalsRow.join(','));

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess(t('messages.exportSuccess') || 'Relatório exportado com sucesso');
  };

  // Opções de filtros
  const allCompanyNames = [...new Set(users.map(u => u.company?.name).filter(Boolean))];
  const companyOptions = [
    { value: '', label: t('filters.company.all') || 'Todas as empresas' },
    ...allCompanyNames.map(name => ({
      value: users.find(u => u.company?.name === name)?.company?.id,
      label: name
    }))
  ];

  const networkOptions = [
    { value: '', label: t('filters.network.all') || 'Todas as redes' },
    { value: 'mainnet', label: 'Mainnet' },
    { value: 'testnet', label: 'Testnet' }
  ];

  const selectStyles = {
    option: (provided) => ({
      ...provided,
      fontSize: "14px",
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      fontSize: "14px",
    }),
  };

  if (!permissions.canViewSystemSettings) {
    return null;
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('title') || 'Relatório Financeiro'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('subtitle') || 'Visualize todos os saldos, stakes e ordens dos usuários'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={exportReport}
            className="btn-outline-primary"
            disabled={loading || users.length === 0}
            text={t('buttons.exportCSV') || 'Exportar CSV'}
            icon="heroicons:arrow-down-tray"
          />
          <Button
            onClick={syncBlockchain}
            className="btn-warning"
            isLoading={syncingBlockchain}
            disabled={loading || syncingBlockchain}
            text={t('buttons.syncBlockchain') || 'Sincronizar Blockchain'}
            icon="heroicons:cloud-arrow-down"
          />
          <Button
            onClick={loadReport}
            icon="heroicons:arrow-path-solid"
            isLoading={loading}
            text={t('buttons.refresh') || 'Atualizar'}
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.totalUsers') || 'Total de Usuários'}
                </p>
                <p className="text-xl font-bold">{summary.totalUsers || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.totalTokens') || 'Total de Tokens'}
                </p>
                <p className="text-xl font-bold">{summary.totalTokens || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.activeOrders') || 'Ordens Ativas'}
                </p>
                <p className="text-xl font-bold">{summary.totalActiveOrders || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="text-orange-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.companies') || 'Empresas'}
                </p>
                <p className="text-xl font-bold">{summary.totalCompanies || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="text-yellow-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('stats.stakeContracts') || 'Contratos Stake'}
                </p>
                <p className="text-xl font-bold">{summary.totalStakeContracts || 0}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          {/* Primeira linha de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('filters.search.label') || 'Buscar'}
              </label>
              <div className="relative">
                <Textinput
                  placeholder={t('filters.search.placeholder') || 'Nome, email ou CPF'}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('filters.company.label') || 'Empresa'}
              </label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={companyOptions}
                value={companyOptions.find(option => option.value === filters.company)}
                onChange={(option) => handleFilterChange('company', option?.value || '')}
                placeholder={t('filters.company.placeholder') || 'Todas as empresas'}
                styles={selectStyles}
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('filters.network.label') || 'Rede'}
              </label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={networkOptions}
                value={networkOptions.find(option => option.value === filters.network)}
                onChange={(option) => handleFilterChange('network', option?.value || '')}
                placeholder={t('filters.network.placeholder') || 'Todas as redes'}
                styles={selectStyles}
                isClearable
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('filters.balanceFilter.label') || 'Filtrar Saldo'}
              </label>
              <Select
                className="react-select"
                classNamePrefix="select"
                options={[
                  { value: 'all', label: t('filters.balanceFilter.all') || 'Todos' },
                  { value: 'with', label: t('filters.balanceFilter.with') || 'Apenas com saldo' },
                  { value: 'without', label: t('filters.balanceFilter.without') || 'Apenas sem saldo' }
                ]}
                value={{ value: filters.onlyWithBalance, label: t(`filters.balanceFilter.${filters.onlyWithBalance}`) || 'Todos' }}
                onChange={(option) => handleFilterChange('onlyWithBalance', option?.value || 'all')}
                styles={selectStyles}
              />
            </div>
          </div>

          {/* Segunda linha - Tokens e botões */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 items-end">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('filters.tokens.label') || 'Tokens'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange('selectedTokens', tokenSymbols)}
                    className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    type="button"
                  >
                    {t('filters.tokens.selectAll') || 'Selecionar todos'}
                  </button>
                  <button
                    onClick={() => handleFilterChange('selectedTokens', [])}
                    className="text-xs text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                    type="button"
                  >
                    {t('filters.tokens.deselectAll') || 'Limpar'}
                  </button>
                </div>
              </div>
              <MultiSelect
                label=""
                options={tokenSymbols.map(symbol => ({
                  value: symbol,
                  label: symbol
                }))}
                value={filters.selectedTokens}
                onChange={(selected) => handleFilterChange('selectedTokens', selected)}
                placeholder={t('filters.tokens.placeholder') || 'Selecione os tokens para exibir (todos se vazio)'}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="btn-outline-secondary"
              >
                {t('filters.clear') || 'Limpar'}
              </Button>
              <Button
                onClick={() => {
                  setInitialLoadDone(false);
                  loadReport();
                }}
                className="btn-primary"
              >
                {t('filters.apply') || 'Aplicar'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col h-full">
          {/* Cabeçalho da tabela */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('table.title') || 'Relatório Detalhado'} ({loading ? '...' : users.length})
            </h3>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-slate-600 dark:text-slate-400">
                {t('table.loading') || 'Carregando...'}
              </span>
            </div>
          )}

          {/* Tabela responsiva com scroll horizontal */}
          {!loading && users.length > 0 && (
            <div className="flex-1 overflow-auto">
              <table className="min-w-full relative">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-20" style={{minWidth: '50px'}}>
                      {/* Expand column */}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-20" style={{left: '50px', minWidth: '200px'}}>
                      {t('table.columns.user') || 'Usuário'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-20" style={{left: '250px', minWidth: '150px'}}>
                      {t('table.columns.company') || 'Empresa'}
                    </th>
                    {tokenSymbols.map((symbol) => (
                      <th key={symbol} className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" colSpan={4}>
                        {symbol}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 sticky left-0 bg-slate-50 dark:bg-slate-800 z-20" style={{minWidth: '50px'}}></th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 sticky left-0 bg-slate-50 dark:bg-slate-800 z-20" style={{left: '50px', minWidth: '200px'}}></th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 sticky left-0 bg-slate-50 dark:bg-slate-800 z-20" style={{left: '250px', minWidth: '150px'}}></th>
                    {tokenSymbols.map((symbol) => (
                      <React.Fragment key={`${symbol}-sub`}>
                        <th className="px-2 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                          {t('table.columns.balance') || 'Saldo'}
                        </th>
                        <th className="px-2 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                          {t('table.columns.stake') || 'Stake'}
                        </th>
                        <th className="px-2 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                          {t('table.columns.order') || 'Ordem'}
                        </th>
                        <th className="px-2 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                          {t('table.columns.total') || 'Total'}
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map((user) => {
                    const isExpanded = expandedUsers.has(user.userId);
                    const hasData =
                      (user.activeOrders?.length || 0) > 0 ||
                      (user.activeStakes?.length || 0) > 0;

                    return (
                      <React.Fragment key={user.userId}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150">
                          {/* Botão de expandir */}
                          <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 z-10" style={{minWidth: '50px'}}>
                            {hasData && (
                              <button
                                onClick={() => toggleUserExpansion(user.userId)}
                                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </td>

                          {/* Informações do usuário */}
                          <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 z-10" style={{left: '50px', minWidth: '200px'}}>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {user.userName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {user.userEmail}
                              </div>
                            </div>
                          </td>

                          {/* Empresa */}
                          <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 z-10" style={{left: '250px', minWidth: '150px'}}>
                            <div className="text-sm text-slate-900 dark:text-white">
                              {user.company?.name || '-'}
                            </div>
                          </td>

                          {/* Dados por token */}
                          {tokenSymbols.map((symbol) => {
                            const tokenData = user.tokenData[symbol];
                            const hasValue = parseFloat(tokenData.total) > 0;
                            const historyTooltip = generateHistoryTooltip(tokenData, symbol);

                            const cellClasses = `px-2 py-3 text-center text-xs ${hasValue ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`;
                            const totalClasses = `px-2 py-3 text-center text-xs font-medium ${hasValue ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`;

                            return (
                              <React.Fragment key={`${user.userId}-${symbol}`}>
                                <td className={cellClasses}>
                                  {tokenData.balance}
                                </td>
                                <td className={cellClasses}>
                                  {tokenData.stake}
                                </td>
                                <td className={cellClasses}>
                                  {tokenData.order}
                                </td>
                                <td className={totalClasses}>
                                  {historyTooltip ? (
                                    <Tooltip
                                      content={historyTooltip}
                                      placement="top"
                                      theme="dark"
                                      allowHTML={true}
                                      interactive={true}
                                    >
                                      <span className="cursor-help border-b border-dotted border-blue-400">
                                        {tokenData.total}
                                      </span>
                                    </Tooltip>
                                  ) : (
                                    tokenData.total
                                  )}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>

                        {/* Linha expandida com detalhes de ordens */}
                        {isExpanded && hasData && (
                          <tr>
                            <td colSpan={3 + (tokenSymbols.length * 4)} className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                              <div className="space-y-4">
                                {/* Ordens ativas */}
                                {user.activeOrders && user.activeOrders.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                      <TrendingUp className="text-blue-500" size={16} />
                                      {t('orders.active') || 'Ordens Ativas'} ({user.activeOrders.length})
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-100 dark:bg-slate-800">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Par</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Lado</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Tipo</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Preço</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Quantidade</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Restante</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Exchange</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                          {user.activeOrders.map((order, idx) => (
                                            <tr key={idx} className="text-xs">
                                              <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                                                {order.tokenA}/{order.tokenB}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                <Badge className={order.side === 'buy' ? 'bg-green-500' : 'bg-red-500'}>
                                                  {order.side?.toUpperCase()}
                                                </Badge>
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                                {order.type}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-right text-slate-600 dark:text-slate-400">
                                                {order.price.toFixed(6)}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-right text-slate-600 dark:text-slate-400">
                                                {order.amount.toFixed(6)}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-right text-slate-600 dark:text-slate-400">
                                                {order.remaining.toFixed(6)}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                                                {order.exchange.substring(0, 10)}...
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Stakes ativos */}
                                {user.activeStakes && user.activeStakes.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                      <DollarSign className="text-yellow-500" size={16} />
                                      {t('stakes.active') || 'Stakes Ativos'} ({user.activeStakes.length})
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-100 dark:bg-slate-800">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Contrato</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Token</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Saldo</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Rede</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Endereço</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                          {user.activeStakes.map((stake, idx) => (
                                            <tr key={idx} className="text-xs">
                                              <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                                                {stake.contractName}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                <Badge className="bg-purple-500">
                                                  {stake.tokenSymbol}
                                                </Badge>
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-right font-medium text-slate-900 dark:text-white">
                                                {stake.balance}
                                              </td>
                                              <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                                {stake.network}
                                              </td>
                                              <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                                {stake.contract}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {/* Linha de totais */}
                  <tr className="bg-slate-100 dark:bg-slate-700 font-bold">
                    <td className="px-4 py-3 sticky left-0 bg-slate-100 dark:bg-slate-700 z-10" style={{minWidth: '50px'}}></td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white sticky left-0 bg-slate-100 dark:bg-slate-700 z-10" style={{left: '50px', minWidth: '200px'}}>
                      {t('table.totals') || 'TOTAL'}
                    </td>
                    <td className="px-4 py-3 sticky left-0 bg-slate-100 dark:bg-slate-700 z-10" style={{left: '250px', minWidth: '150px'}}></td>
                    {tokenSymbols.map((symbol) => {
                      const totals = tokenTotals[symbol];
                      return (
                        <React.Fragment key={`total-${symbol}`}>
                          <td className="px-2 py-3 text-center text-xs text-slate-900 dark:text-white">
                            {totals.balance}
                          </td>
                          <td className="px-2 py-3 text-center text-xs text-slate-900 dark:text-white">
                            {totals.stake}
                          </td>
                          <td className="px-2 py-3 text-center text-xs text-slate-900 dark:text-white">
                            {totals.order}
                          </td>
                          <td className="px-2 py-3 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
                            {totals.total}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-600" />
              <span className="text-lg font-medium text-slate-900 dark:text-white">
                {t('table.empty.title') || 'Nenhum dado encontrado'}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t('table.empty.description') || 'Ajuste os filtros ou aguarde o carregamento dos dados'}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FinancialReportPage;

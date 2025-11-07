'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Smartphone,
  MapPin,
  Filter,
  Download,
  RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import CampaignAnalyticsCard from '@/components/CampaignAnalyticsCard';

export default function PushHistoryPage() {
  const { user, getAuthHeaders } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [campaignLogs, setCampaignLogs] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, processing, scheduled

  useEffect(() => {
    fetchCampaigns();
  }, [pagination.page, pagination.limit, filter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/push-notifications/campaigns?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: getAuthHeaders()
        }
      );

      const data = await response.json();

      if (data.success) {
        let filteredCampaigns = data.data.campaigns;

        // Apply filter
        if (filter !== 'all') {
          filteredCampaigns = filteredCampaigns.filter(c => c.status === filter);
        }

        setCampaigns(filteredCampaigns);
        setPagination(data.data.pagination);
      } else {
        toast.error('Erro ao carregar campanhas');
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      setLoadingDetails(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/push-notifications/campaigns/${campaignId}`,
        {
          headers: getAuthHeaders()
        }
      );

      const data = await response.json();

      if (data.success) {
        setSelectedCampaign(data.data);
        setCampaignLogs(data.data.logs || []);
        setShowDetailsModal(true);
      } else {
        toast.error('Erro ao carregar detalhes da campanha');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      toast.error('Erro ao carregar detalhes da campanha');
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Concluída'
      },
      processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Clock,
        label: 'Processando'
      },
      scheduled: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Calendar,
        label: 'Agendada'
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Falhou'
      }
    };

    const config = statusConfig[status] || statusConfig.processing;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSuccessRate = (campaign) => {
    const total = campaign.sentCount + campaign.failedCount;
    if (total === 0) return 0;
    return ((campaign.sentCount / total) * 100).toFixed(1);
  };

  const exportCampaignData = (campaign) => {
    const csvData = [
      ['ID', 'Título', 'Status', 'Enviados', 'Falharam', 'Taxa de Sucesso', 'Data de Criação', 'Data de Conclusão'],
      [
        campaign.id,
        campaign.title,
        campaign.status,
        campaign.sentCount || 0,
        campaign.failedCount || 0,
        `${calculateSuccessRate(campaign)}%`,
        formatDate(campaign.createdAt),
        campaign.completedAt ? formatDate(campaign.completedAt) : 'N/A'
      ]
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campanha-${campaign.id}-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Dados exportados com sucesso!');
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCcw className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando histórico de campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Histórico de Campanhas Push
        </h1>
        <p className="text-gray-600">
          Visualize e analise todas as campanhas de push notification enviadas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Todas' },
                { value: 'completed', label: 'Concluídas' },
                { value: 'processing', label: 'Processando' },
                { value: 'scheduled', label: 'Agendadas' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={fetchCampaigns}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCcw size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Send size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma campanha encontrada
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Crie sua primeira campanha de push notification para começar!'
              : 'Não há campanhas com este filtro.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.title}
                      </h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {campaign.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(campaign.createdAt)}</span>
                      </div>
                      {campaign.geolocation?.cep && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>CEP {campaign.geolocation.cep} ({campaign.geolocation.radius}km)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                      <Users size={14} />
                      <span>Público-alvo</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {campaign.targetUserCount || 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-green-600 text-xs mb-1">
                      <CheckCircle size={14} />
                      <span>Enviados</span>
                    </div>
                    <p className="text-lg font-semibold text-green-700">
                      {campaign.sentCount || 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-red-600 text-xs mb-1">
                      <XCircle size={14} />
                      <span>Falharam</span>
                    </div>
                    <p className="text-lg font-semibold text-red-700">
                      {campaign.failedCount || 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-blue-600 text-xs mb-1">
                      <TrendingUp size={14} />
                      <span>Taxa de Sucesso</span>
                    </div>
                    <p className="text-lg font-semibold text-blue-700">
                      {calculateSuccessRate(campaign)}%
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchCampaignDetails(campaign.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye size={16} />
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => exportCampaignData(campaign)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {pagination.page} de {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {/* Campaign Details Modal */}
      <Modal
        activeModal={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalhes da Campanha"
        size="large"
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCcw className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : selectedCampaign ? (
          <div className="space-y-6">
            {/* Analytics Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Analytics da Campanha
              </h3>
              <CampaignAnalyticsCard campaignId={selectedCampaign.id} />
            </div>

            {/* Campaign Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações da Campanha
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Título</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedCampaign.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  {getStatusBadge(selectedCampaign.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Descrição</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedCampaign.description}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Criada em</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedCampaign.createdAt)}
                  </p>
                </div>
                {selectedCampaign.completedAt && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Concluída em</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(selectedCampaign.completedAt)}
                    </p>
                  </div>
                )}
                {selectedCampaign.code && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Código</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {selectedCampaign.code}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Page Content */}
            {(selectedCampaign.pageTitle || selectedCampaign.pageDescription) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Conteúdo da Página
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  {selectedCampaign.pageTitle && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Título da Página</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedCampaign.pageTitle}
                      </p>
                    </div>
                  )}
                  {selectedCampaign.pageDescription && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Descrição da Página</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedCampaign.pageDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Logs Table */}
            {campaignLogs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Logs de Envio ({campaignLogs.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Usuário
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Data de Envio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Erro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaignLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {log.status === 'sent' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                <CheckCircle size={12} className="mr-1" />
                                Enviado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                <XCircle size={12} className="mr-1" />
                                Falhou
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(log.sentAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            {log.error || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

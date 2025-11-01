"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  BarChart3,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Image from '@/components/ui/Image';
import { useAuth } from '@/hooks/useAuth';
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';
import { BalanceDisplay } from '@/utils/balanceUtils';
import { useTranslation } from '@/hooks/useTranslation';
import { getExplorerAddressUrl, getNetworkDisplayName } from '@/utils/explorerUtils';
import useConfig from '@/hooks/useConfig';
import ProductHeader from '@/components/investments/ProductHeader';
import InvestmentSidebarMobile from '@/components/investments/InvestmentSidebarMobile';
import ClaimRewardsModal from '@/components/investments/modals/ClaimRewardsModal';
import CompoundRewardsModal from '@/components/investments/modals/CompoundRewardsModal';
import StakeModal from '@/components/investments/modals/StakeModal';
import UnstakeModal from '@/components/investments/modals/UnstakeModal';
import LastTransactionsModal from '@/components/investments/modals/LastTransactionsModal';

const FixedIncomeProductPage = () => {
  const { t } = useTranslation('investments');
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useAlertContext();
  const { defaultNetwork } = useConfig();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('25.00');
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [copied, setCopied] = useState(false);

  // Modal states
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [compoundModalOpen, setCompoundModalOpen] = useState(false);
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);

  // Rewards and stake data
  const [contractRewards, setContractRewards] = useState('0');
  const [userStake, setUserStake] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0'); // Total em stake no contrato
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);

  // Extrair productCode do params ou do product
  const productCode = params?.code || product?.metadata?.code || product?.code || '';

  useEffect(() => {
    if (params.code) {
      loadProductDetails();
      loadTransactions();
    }
  }, [params.code]);

  useEffect(() => {
    if (product && user) {
      loadContractRewards();
      loadContractStakeData();
    }
  }, [product, user]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);

      // Buscar contrato pelo código do produto
      const response = await api.get(`/api/contracts/by-code/${params.code}`);

      if (response.data.success) {
        const contractData = response.data.data;

        setProduct({
          ...contractData,
          issuer: contractData.metadata?.issuer || t('detailPage.issuer'),
          rentability: contractData.metadata?.rentability || '1.5% a.m',
          equivalentCDI: contractData.metadata?.equivalentCDI || '123% do CDI',
          description: contractData.metadata?.description || '',
          logoUrl: contractData.metadata?.logoUrl,
          bannerUrl: contractData.metadata?.bannerUrl,
          assetType: contractData.metadata?.assetType || 'Recebível',
          paymentFrequency: contractData.metadata?.paymentFrequency || 'Mensal',
          maturityDate: contractData.metadata?.maturityDate,
          risk: contractData.metadata?.risk || 'low',
          guarantees: contractData.metadata?.guarantees || [],
          risks: contractData.metadata?.risks || []
        });

        // Carregar documentos se existirem
        if (contractData.metadata?.documents) {
          setDocuments(contractData.metadata.documents);
        }
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      showError(t('detailPage.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;
      if (!userAddress) return;

      // Buscar histórico de transações do token
      const response = await api.get(`/api/contracts/${product?.address}/transactions`, {
        params: { userAddress }
      });

      if (response.data.success) {
        setTransactions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadContractRewards = async () => {
    if (!product?.address || !user) return;

    try {
      setLoadingRewards(true);
      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

      const response = await api.post('/api/contracts/read', {
        contractAddress: product.address,
        functionName: 'getPendingReward',
        params: [userAddress],
        network: product.network || defaultNetwork
      });

      if (response.data.success && response.data.data?.result) {
        const rewardsInWei = response.data.data.result;
        const rewardsInEther = (parseFloat(rewardsInWei) / 10**18).toString();
        setContractRewards(rewardsInEther);
      } else {
        setContractRewards('0');
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      setContractRewards('0');
    } finally {
      setLoadingRewards(false);
    }
  };

  const loadContractStakeData = async () => {
    if (!product?.address || !user) return;

    try {
      setLoadingStake(true);
      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

      // Buscar stake do usuário E total em stake no contrato
      const [userStakeResponse, totalStakedResponse] = await Promise.all([
        api.post('/api/contracts/read', {
          contractAddress: product.address,
          functionName: 'getTotalStakeBalance',
          params: [userAddress],
          network: product.network || defaultNetwork
        }),
        api.post('/api/contracts/read', {
          contractAddress: product.address,
          functionName: 'getTotalStakedSupply',
          params: [],
          network: product.network || defaultNetwork
        })
      ]);

      // Stake do usuário
      if (userStakeResponse.data.success && userStakeResponse.data.data?.result) {
        const stakeInWei = userStakeResponse.data.data.result;
        const stakeInEther = (parseFloat(stakeInWei) / 10**18).toString();
        setUserStake(stakeInEther);
      } else {
        setUserStake('0');
      }

      // Total em stake
      if (totalStakedResponse.data.success && totalStakedResponse.data.data?.result) {
        const totalInWei = totalStakedResponse.data.data.result;
        const totalInEther = (parseFloat(totalInWei) / 10**18).toString();
        setTotalStaked(totalInEther);
      } else {
        setTotalStaked('0');
      }
    } catch (error) {
      console.error('Error loading stake data:', error);
      setUserStake('0');
      setTotalStaked('0');
    } finally {
      setLoadingStake(false);
    }
  };

  const handleInvest = () => {
    setStakeModalOpen(true);
  };

  const handleWithdraw = () => {
    setUnstakeModalOpen(true);
  };

  const handleBuy = () => {
    const tokenSymbol = product.metadata?.tokenSymbol || product.symbol || 'TOKEN';
    router.push(`/exchange/market?from=cBRL&to=${tokenSymbol}`);
  };

  const handleCompound = () => {
    setCompoundModalOpen(true);
  };

  const handleClaim = () => {
    setClaimModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadProductDetails();
    loadContractRewards();
    loadContractStakeData();
  };

  const handleCopyAddress = () => {
    if (product?.address) {
      navigator.clipboard.writeText(product.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTokenAmount = (value, tokenSymbol) => {
    if (!value && value !== 0) return '--';
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }).format(value);
    return `${formatted} ${tokenSymbol || stakeTokenSymbol || 'TOKEN'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('detailPage.productNotFound')}
        </h3>
        <Button onClick={() => router.back()}>{t('detailPage.backButton')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-colors duration-200"
        >
          <ArrowLeft size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Mobile Sidebar Accordion */}
      <InvestmentSidebarMobile
        product={product}
        user={user}
        investmentAmount={investmentAmount}
        setInvestmentAmount={setInvestmentAmount}
        handleInvest={handleInvest}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Layout de 2 colunas: Header + Sidebar */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Coluna principal - 2/3 */}
        <div
          className="lg:col-span-2 space-y-6 overflow-y-auto pr-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(37, 99, 235, 0.5) transparent'
          }}
        >
          {/* Header do Produto */}
          <ProductHeader
            product={product}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
          {/* Card Sobre o ativo */}
          <Card title={t('detailPage.aboutAssetTitle')}>
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {product.description?.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n') || t('detailPage.aboutAssetEmpty')}
              </div>
            </div>
            {/* Botão Ver últimas transações */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setTransactionsModalOpen(true)}
                className="w-full py-2.5 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                {t('detailPage.viewLastTransactions')}
              </button>
            </div>
          </Card>

          {/* Documentos */}
          {documents.length > 0 && (
            <Card title={t('detailPage.documentsTitle')}>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="text-gray-400" size={20} />
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                    <Download size={16} className="text-gray-400" />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Garantias */}
          {product.guarantees.length > 0 && (
            <Card title={t('detailPage.guaranteesTitle')}>
              <ul className="space-y-2">
                {product.guarantees.map((guarantee, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{guarantee}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Riscos */}
          {product.risks.length > 0 && (
            <Card title={t('detailPage.risksTitle')}>
              <ul className="space-y-2">
                {product.risks.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{risk}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Histórico de transações */}
          {transactions.length > 0 && (
            <Card title={t('detailPage.tokenHistoryTitle')}>
              <div className="space-y-2">
                {transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{tx.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(tx.amount)}</p>
                      <p className="text-xs text-gray-500">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Registro blockchain */}
          <Card title={t('detailPage.blockchainTitle')}>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('detailPage.blockchainNetwork')}</p>
                <p className="text-sm font-semibold">{getNetworkDisplayName(product?.network || defaultNetwork)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('detailPage.contractAddress')}</p>
                <div className="flex items-center space-x-2">
                  <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {product?.address || '--'}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                  <a
                    href={getExplorerAddressUrl(product?.address, product?.network || defaultNetwork)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Card de investimento */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              {/* Disponibilidade com barra */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t('detailPage.assetAvailability')} <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.metadata?.capturedAmount || 0)}</span>
                </p>
                {/* Barra de progresso */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{
                      width: `${product.metadata?.totalEmission && product.metadata?.capturedAmount
                        ? Math.min((product.metadata.capturedAmount / product.metadata.totalEmission) * 100, 100)
                        : 0}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('detailPage.minimumInvestment')} <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.minValueStake || 25)}</span>
                </p>
              </div>

              {/* Card escuro de investimento */}
              <div className="bg-gray-900 dark:bg-black rounded-2xl p-6 mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-3 text-center">
                    {t('detailPage.investmentAmountLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      R$
                    </span>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={product.minValueStake || 25}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 text-center font-semibold border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-sm text-gray-400 mb-1">
                    {t('detailPage.estimatedValue')}
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(parseFloat(investmentAmount) * 1.015 || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {t('sidebar.maturity')} {formatDate(product.metadata?.maturityDate)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('sidebar.installment', { label: product.metadata?.paymentFrequency || 'única' })}
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleInvest}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!user || product.status === 'closed'}
                >
                  {t('detailPage.invest')}
                </button>
                <button
                  onClick={handleWithdraw}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!user || parseFloat(userStake) <= 0}
                >
                  {t('detailPage.withdraw')}
                </button>
                <button
                  onClick={handleBuy}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors"
                >
                  Comprar
                </button>
                <button
                  onClick={handleCompound}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!user || parseFloat(contractRewards) <= 0}
                >
                  {t('detailPage.reinvest')}
                </button>
                <button
                  onClick={handleClaim}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!user || parseFloat(contractRewards) <= 0}
                >
                  {t('detailPage.claim')}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modais */}
      {user && product && (
        <>
          <ClaimRewardsModal
            isOpen={claimModalOpen}
            onClose={() => setClaimModalOpen(false)}
            contract={product}
            userAddress={user?.walletAddress || user?.blockchainAddress || user?.publicKey}
            rewardsAmount={contractRewards}
            tokenSymbol={product.metadata?.tokenSymbol || product.symbol || 'TOKEN'}
            onSuccess={handleModalSuccess}
          />

          <CompoundRewardsModal
            isOpen={compoundModalOpen}
            onClose={() => setCompoundModalOpen(false)}
            contract={product}
            userAddress={user?.walletAddress || user?.blockchainAddress || user?.publicKey}
            rewardsAmount={contractRewards}
            tokenSymbol={product.metadata?.tokenSymbol || product.symbol || 'TOKEN'}
            totalEmission={product.metadata?.totalEmission}
            totalStaked={totalStaked}
            onSuccess={handleModalSuccess}
          />

          <StakeModal
            isOpen={stakeModalOpen}
            onClose={() => setStakeModalOpen(false)}
            contract={product}
            userAddress={user?.walletAddress || user?.blockchainAddress || user?.publicKey}
            tokenSymbol={product.metadata?.tokenSymbol || product.symbol || 'TOKEN'}
            totalEmission={product.metadata?.totalEmission}
            totalStaked={totalStaked}
            onSuccess={handleModalSuccess}
          />

          <UnstakeModal
            isOpen={unstakeModalOpen}
            onClose={() => setUnstakeModalOpen(false)}
            contract={product}
            userAddress={user?.walletAddress || user?.blockchainAddress || user?.publicKey}
            userStake={userStake}
            tokenSymbol={product.metadata?.tokenSymbol || product.symbol || 'TOKEN'}
            onSuccess={handleModalSuccess}
          />
        </>
      )}

      {/* Modal de Transações */}
      {product && (
        <LastTransactionsModal
          isOpen={transactionsModalOpen}
          onClose={() => setTransactionsModalOpen(false)}
          contractAddress={product.address}
          network={product.network}
          productCode={productCode}
        />
      )}
    </div>
  );
};

export default FixedIncomeProductPage;

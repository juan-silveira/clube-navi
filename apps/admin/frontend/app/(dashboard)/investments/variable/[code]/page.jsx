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

const VariableIncomeProductPage = () => {
  const { t } = useTranslation('investments');
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useAlertContext();
  const { defaultNetwork } = useConfig();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('10.00');
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
  const [stakeTokenSymbol, setStakeTokenSymbol] = useState(''); // Símbolo do token de stake
  const [minValueStake, setMinValueStake] = useState(null); // Valor mínimo de stake do contrato
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);

  // Extrair productCode do params ou do product
  const productCode = params?.code || product?.metadata?.code || product?.code || '';

  useEffect(() => {
    if (params.code) {
      loadProductDetails();
    }
  }, [params.code]);

  useEffect(() => {
    if (product && user) {
      loadContractRewards();
      loadContractStakeData();
    }
  }, [product, user]);

  // Atualizar investmentAmount quando minValueStake for carregado
  useEffect(() => {
    if (minValueStake !== null && parseFloat(investmentAmount) < minValueStake) {
      setInvestmentAmount(minValueStake.toFixed(2));
    }
  }, [minValueStake]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);

      // Buscar contrato pelo código do produto
      const response = await api.get(`/api/contracts/by-code/${params.code}`);

      // console.log('📦 [loadProductDetails] Response completa:', response.data);

      if (response.data.success) {
        const contractData = response.data.data;

        // console.log('📦 [loadProductDetails] contractData:', contractData);
        // console.log('📦 [loadProductDetails] minValueStake do DB:', contractData.minValueStake);
        // console.log('📦 [loadProductDetails] metadata.minInvestment:', contractData.metadata?.minInvestment);

        // Buscar minValueStake do contrato blockchain
        if (contractData.address && contractData.network) {
          try {
            // console.log('🔍 [loadProductDetails] Buscando minValueStake do contrato...');
            const minValueStakeResponse = await api.post('/api/contracts/read', {
              contractAddress: contractData.address,
              functionName: 'minValueStake',
              params: [],
              network: contractData.network || defaultNetwork
            });

            // console.log('🔍 [loadProductDetails] minValueStakeResponse:', minValueStakeResponse.data);

            if (minValueStakeResponse.data.success && minValueStakeResponse.data.data?.result) {
              const minValueInWei = minValueStakeResponse.data.data.result;
              const minValueInEther = parseFloat(minValueInWei) / Math.pow(10, 18);
              // console.log('✅ [loadProductDetails] minValueStake do contrato:', minValueInWei, 'wei =', minValueInEther, 'ether');
              setMinValueStake(minValueInEther);
            } else {
              // console.log('⚠️ [loadProductDetails] minValueStake não encontrado no contrato');
              setMinValueStake(null);
            }
          } catch (error) {
            console.error('❌ [loadProductDetails] Erro ao buscar minValueStake:', error);
            setMinValueStake(null);
          }
        }

        // Garantees e risks podem ser arrays ou strings
        const guarantees = contractData.metadata?.guarantees || null;
        const risks = contractData.metadata?.risks || null;

        // Buscar dados do issuer se houver issuerId
        let issuerProjectsCount = 0;
        let issuerFoundationYear = contractData.metadata?.issuerFoundationYear;
        if (contractData.metadata?.issuerId) {
          try {
            const issuerResponse = await api.get(`/api/issuers/${contractData.metadata.issuerId}`);
            if (issuerResponse.data.success && issuerResponse.data.data) {
              issuerProjectsCount = issuerResponse.data.data.stakes?.length || 0;
              // Atualizar foundationYear com o valor atual do banco de dados
              issuerFoundationYear = issuerResponse.data.data.foundationYear || issuerFoundationYear;
            }
          } catch (error) {
            console.error('Erro ao buscar dados do issuer:', error);
          }
        }

        setProduct({
          ...contractData,
          issuer: contractData.metadata?.issuer || t('detailPage.issuer'),
          issuerProjectsCount,
          metadata: {
            ...contractData.metadata,
            issuerFoundationYear
          },
          rentabilityRange: contractData.metadata?.rentabilityRange || '2% - 3% a.m',
          rentability: contractData.metadata?.rentability || '2.5% a.m',
          equivalentCDI: contractData.metadata?.equivalentCDI || 'Variável',
          description: contractData.metadata?.description || '',
          logoUrl: contractData.metadata?.logoUrl,
          bannerUrl: contractData.metadata?.bannerUrl,
          assetType: contractData.metadata?.assetType || 'Imobiliário',
          paymentFrequency: contractData.metadata?.paymentFrequency || 'Trimestral',
          maturityDate: contractData.metadata?.maturityDate,
          risk: contractData.metadata?.risk || 'medium',
          guarantees,
          risks
        });

        // console.log('✅ [loadProductDetails] Product setado com minValueStake:', contractData.minValueStake);

        // Carregar documentos se existirem
        if (contractData.metadata?.documents) {
          setDocuments(contractData.metadata.documents);
        }

        // Buscar símbolo do stakeToken (não precisa de usuário logado)
        try {
          // console.log('🔍 [loadProductDetails] Buscando stakeToken...');
          const stakeTokenResponse = await api.post('/api/contracts/read', {
            contractAddress: contractData.address,
            functionName: 'stakeToken',
            params: [],
            network: contractData.network || defaultNetwork
          });

          // console.log('🔍 [loadProductDetails] stakeTokenResponse:', stakeTokenResponse.data);

          if (stakeTokenResponse.data.success && stakeTokenResponse.data.data?.result) {
            const stakeTokenAddress = stakeTokenResponse.data.data.result;
            // console.log('🔍 [loadProductDetails] stakeTokenAddress:', stakeTokenAddress);

            // Buscar o símbolo do token
            const symbolsResponse = await api.post('/api/contracts/get-token-symbols', {
              stakeTokenAddress: stakeTokenAddress,
              rewardTokenAddress: '', // Não precisamos do reward token aqui
              network: contractData.network || defaultNetwork
            });

            // console.log('🔍 [loadProductDetails] symbolsResponse:', symbolsResponse.data);

            if (symbolsResponse.data.success) {
              const symbol = symbolsResponse.data.data.stakeTokenSymbol || '';
              // console.log('✅ [loadProductDetails] Token Symbol:', symbol);
              setStakeTokenSymbol(symbol);
            }
          }
        } catch (symbolError) {
          console.error('❌ [loadProductDetails] Error fetching token symbol:', symbolError);
          setStakeTokenSymbol('');
        }
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      showError(t('detailPage.errorLoading'));
    } finally {
      setLoading(false);
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
    if (!product?.address || !user) {
      // console.log('⚠️ [loadContractStakeData] Pulando: product.address ou user não disponível');
      return;
    }

    try {
      setLoadingStake(true);
      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;
      // console.log('📊 [loadContractStakeData] Buscando dados de stake para:', userAddress);

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

      // console.log('📊 [loadContractStakeData] userStakeResponse:', userStakeResponse.data);
      // console.log('📊 [loadContractStakeData] totalStakedResponse:', totalStakedResponse.data);

      // Stake do usuário
      if (userStakeResponse.data.success && userStakeResponse.data.data?.result) {
        const stakeInWei = userStakeResponse.data.data.result;
        const stakeInEther = (parseFloat(stakeInWei) / 10**18).toString();
        // console.log('✅ [loadContractStakeData] User stake:', stakeInWei, 'wei =', stakeInEther, 'ether');
        setUserStake(stakeInEther);
      } else {
        // console.log('⚠️ [loadContractStakeData] User stake = 0');
        setUserStake('0');
      }

      // Total em stake
      if (totalStakedResponse.data.success && totalStakedResponse.data.data?.result) {
        const totalInWei = totalStakedResponse.data.data.result;
        const totalInEther = (parseFloat(totalInWei) / 10**18).toString();
        // console.log('✅ [loadContractStakeData] Total staked:', totalInWei, 'wei =', totalInEther, 'ether');
        setTotalStaked(totalInEther);
      } else {
        // console.log('⚠️ [loadContractStakeData] Total staked = 0');
        setTotalStaked('0');
      }
    } catch (error) {
      console.error('❌ [loadContractStakeData] Error:', error);
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
    // Navegar para exchange com o token do produto
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
    // Recarregar dados após ação bem-sucedida
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
        totalStaked={totalStaked}
        stakeTokenSymbol={stakeTokenSymbol}
        contractRewards={contractRewards}
        userStake={userStake}
        loadingRewards={loadingRewards}
        loadingStake={loadingStake}
        handleInvest={handleInvest}
        handleWithdraw={handleWithdraw}
        handleBuy={handleBuy}
        handleCompound={handleCompound}
        handleClaim={handleClaim}
        formatCurrency={formatCurrency}
        formatTokenAmount={formatTokenAmount}
        formatDate={formatDate}
        documents={documents}
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
            totalStaked={totalStaked}
            stakeTokenSymbol={stakeTokenSymbol}
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
            {/* Botão Ver últimos investimentos */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setTransactionsModalOpen(true)}
                className="w-full py-2.5 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                {t('detailPage.viewLastInvestments')}
              </button>
            </div>
          </Card>

          {/* Sobre o Emissor */}
          {(product.metadata?.issuerName || product.metadata?.issuerDescription) && (
            <Card title={t('detailPage.aboutIssuerTitle')}>
              <div className="space-y-4">
                {/* Header: Logo e Informações */}
                <div className="flex items-center gap-4">
                  {/* Logo redonda */}
                  {product.metadata?.issuerLogo && (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.metadata.issuerLogo}
                        alt={product.metadata?.issuerName || 'Emissor'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Informações do emissor */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Linha 1: Nome e Ano de fundação */}
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {product.metadata?.issuerName || product.issuer || 'Emissor'}
                      </h4>
                      {product.metadata?.issuerFoundationYear && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('detailPage.issuerFoundationYear')}: <strong className="text-gray-900 dark:text-white">{product.metadata.issuerFoundationYear}</strong>
                        </span>
                      )}
                    </div>

                    {/* Linha 2: URL e Projetos */}
                    <div className="flex items-center justify-between gap-4">
                      {product.metadata?.issuerWebsite ? (
                        <a
                          href={product.metadata.issuerWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1"
                        >
                          {product.metadata.issuerWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <div />
                      )}
                      {product.issuerProjectsCount !== undefined && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('detailPage.issuerProjects')}: <strong className="text-gray-900 dark:text-white">{product.issuerProjectsCount}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descrição em largura total */}
                {product.metadata?.issuerDescription && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                    {product.metadata.issuerDescription.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n')}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Documentos */}
          <Card title={t('detailPage.documentsTitle')}>
            <div className="space-y-2">
              {(() => {
                const productCode = product.metadata?.code || product.code || '';
                const standardDocuments = [
                  { type: 'whitepaper', name: `${t('detailPage.documentWhitepaper')} ${productCode}` },
                  { type: 'essential_info', name: `${t('detailPage.documentEssentialInfo')} ${productCode}` },
                  { type: 'offer_info', name: `${t('detailPage.documentOfferInfo')} ${productCode}` }
                ];

                return standardDocuments.map((standardDoc, index) => {
                  // Buscar documento correspondente no array de documentos
                  const uploadedDoc = documents.find(doc => doc.type === standardDoc.type);

                  if (uploadedDoc) {
                    // Se documento existe, mostrar como link
                    return (
                      <a
                        key={index}
                        href={uploadedDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 underline">
                            {standardDoc.name}
                          </span>
                        </div>
                        <Download size={16} className="text-blue-600 dark:text-blue-400" />
                      </a>
                    );
                  } else {
                    // Se documento não existe, mostrar sem link
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={20} />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {standardDoc.name}
                          </span>
                        </div>
                      </div>
                    );
                  }
                });
              })()}
            </div>
          </Card>

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

          {/* Garantias */}
          {product.guarantees && (
            <Card title={t('detailPage.guaranteesTitle')}>
              {Array.isArray(product.guarantees) ? (
                <ul className="space-y-2">
                  {product.guarantees.map((guarantee, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{guarantee}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {product.guarantees.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n')}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Riscos */}
          {product.risks && (
            <Card title={t('detailPage.risksTitle')}>
              {Array.isArray(product.risks) ? (
                <ul className="space-y-2">
                  {product.risks.map((risk, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {product.risks.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n')}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar - Card de investimento */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              {/* Disponibilidade com barra */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t('detailPage.assetAvailability')} <span className="font-bold text-gray-900 dark:text-white">
                    {(() => {
                      const totalEmission = product.metadata?.totalEmission || 0;
                      const totalStakedNum = parseFloat(totalStaked) || 0;
                      const available = Math.max(totalEmission - totalStakedNum, 0);
                      return formatTokenAmount(available);
                    })()}
                  </span>
                </p>
                {/* Barra de progresso */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{
                      width: `${(() => {
                        const totalEmission = product.metadata?.totalEmission || 0;
                        const totalStakedNum = parseFloat(totalStaked) || 0;
                        if (totalEmission > 0) {
                          return Math.min((totalStakedNum / totalEmission) * 100, 100);
                        }
                        return 0;
                      })()}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('detailPage.minimumInvestment')} <span className="font-semibold text-gray-900 dark:text-white">
                    {minValueStake !== null ? formatTokenAmount(minValueStake) : '--'}
                  </span>
                </p>
              </div>

              {/* Card escuro com informações de rewards e stake */}
              <div className="bg-gray-900 dark:bg-black rounded-2xl p-6 mb-4">
                {/* A Receber */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-3xl font-bold text-white">
                      {loadingRewards ? (
                        <div className="h-9 w-24 bg-gray-700 rounded animate-pulse mx-auto"></div>
                      ) : (
                        formatTokenAmount(parseFloat(contractRewards))
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 uppercase">
                    {stakeTokenSymbol} {t('detailPage.toReceive')}
                  </div>
                </div>

                {/* Meu Investimento */}
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{t('detailPage.myInvestment')}</span>
                    <span className="text-lg font-bold text-white">
                      {loadingStake ? (
                        <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        formatTokenAmount(parseFloat(userStake))
                      )}
                    </span>
                  </div>
                </div>

                {/* Risco */}
                {product.metadata?.risk !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('detailPage.risk')}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.metadata.risk === 0 ? 'bg-green-100 text-green-800' :
                        product.metadata.risk === 1 ? 'bg-blue-100 text-blue-800' :
                        product.metadata.risk === 2 ? 'bg-yellow-100 text-yellow-800' :
                        product.metadata.risk === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.metadata.risk === 0 ? t('detailPage.riskLevels.veryLow') :
                         product.metadata.risk === 1 ? t('detailPage.riskLevels.low') :
                         product.metadata.risk === 2 ? t('detailPage.riskLevels.medium') :
                         product.metadata.risk === 3 ? t('detailPage.riskLevels.high') :
                         t('detailPage.riskLevels.veryHigh')}
                      </span>
                    </div>
                  </div>
                )}
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
                  {t('detailPage.buy')}
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

export default VariableIncomeProductPage;

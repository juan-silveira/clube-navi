"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAlertContext } from '@/contexts/AlertContext';
import useConfig from '@/hooks/useConfig';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/services/api';
import {
  Save,
  Shield,
  DollarSign,
  Mail,
  Database,
  Server,
  Bell,
  Settings,
  AlertTriangle,
  Coins,
  Users,
  Layers,
  ArrowLeftRight,
  Building2
} from 'lucide-react';

// System Settings Tab Components
import GeneralTab from '@/components/system-settings/GeneralTab';
import SecurityTab from '@/components/system-settings/SecurityTab';
import FinancialTab from '@/components/system-settings/FinancialTab';
import TokensTab from '@/components/system-settings/TokensTab';
import StakesTab from '@/components/system-settings/StakesTab';
import IssuersTab from '@/components/system-settings/IssuersTab';
import DatabaseTab from '@/components/system-settings/DatabaseTab';
import EmailTab from '@/components/system-settings/EmailTab';
import ApiTab from '@/components/system-settings/ApiTab';
import NotificationsTab from '@/components/system-settings/NotificationsTab';
import ExchangesTab from '@/components/system-settings/ExchangesTab';
import RolesTab from '@/components/system-settings/RolesTab';
import CdiTab from '@/components/system-settings/CdiTab';

const SystemSettingsPage = () => {
  const { showSuccess, showError, showInfo, showWarning } = useAlertContext();
  const { defaultNetwork } = useConfig();
  const { currentCompany } = useCurrentCompany();
  const { t } = useTranslation('systemSettings');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');
  
  // Token management states
  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [tokenForm, setTokenForm] = useState({
    address: '',
    adminAddress: '',
    website: '',
    description: '',
    category: 'criptomoedas'
  });

  // Stake contracts management states
  const [stakeContracts, setStakeContracts] = useState([]);
  const [loadingStakeContracts, setLoadingStakeContracts] = useState(false);
  const [showStakeForm, setShowStakeForm] = useState(false);

  // Issuers management states
  const [issuers, setIssuers] = useState([]);
  const [loadingIssuers, setLoadingIssuers] = useState(false);
  const [showIssuerForm, setShowIssuerForm] = useState(false);
  const [editingIssuer, setEditingIssuer] = useState(null);
  const [issuerForm, setIssuerForm] = useState({
    name: '',
    foundationYear: '',
    website: '',
    description: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Companies management states
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Exchange contracts management states
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({
    address: '',
    network: defaultNetwork || 'testnet',
    contractType: 'exchange',
    tokenAAddress: '',  // Token A (ex: cBRL)
    tokenBAddress: '',  // Token B (outro token)
    adminAddress: '',
    symbol: '',         // Trading pair symbol (e.g., PCN/cBRL)
    name: '',          // Exchange name (e.g., PCN Exchange)
    website: '',
    description: '',
    metadata: {
      tradingFee: '0.25',      // Trading fee percentage (0.25%)
      minOrderSize: '1',       // Minimum order size
      maxOrderSize: '1000000', // Maximum order size
      priceDecimals: '6',      // Price precision decimals
      amountDecimals: '18'     // Amount precision decimals
    }
  });
  const [stakeForm, setStakeForm] = useState({
    address: '',
    tokenAddress: '',
    network: defaultNetwork || 'testnet',
    name: '',
    code: '', // Código do produto (ex: FTR3)
    description: '',
    adminAddress: '',
    risk: 1, // Padrão: Baixo (0=Muito Baixo, 1=Baixo, 2=Médio, 3=Alto, 4=Muito Alto)
    companyId: '', // Empresa associada ao contrato
    investment_type: 'stake' // Tipo de investimento: stake, private_offer, fixed, variable, pratique
  });
  const [editingStakeId, setEditingStakeId] = useState(null); // ID do contrato sendo editado

  // Update forms network when defaultNetwork changes
  useEffect(() => {
    if (defaultNetwork) {
      setStakeForm(prev => ({ ...prev, network: defaultNetwork }));
      setExchangeForm(prev => ({ ...prev, network: defaultNetwork }));
    }
  }, [defaultNetwork]);

  // Load issuers when issuers or stakes tab is active
  useEffect(() => {
    if (activeTab === 'issuers' || activeTab === 'stakes') {
      fetchIssuers();
    }
  }, [activeTab]);

  // Role management states
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [addressRoles, setAddressRoles] = useState({});
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [grantingRole, setGrantingRole] = useState(false);

  // Notification states
  const [users, setUsers] = useState([]);
  const [withdrawalUsers, setWithdrawalUsers] = useState([]);
  const [documentUsers, setDocumentUsers] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      platformName: 'Coinage',
      platformDescription: 'Plataforma líder em criptomoedas',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      currency: 'BRL',
      maintenanceMode: false
    },
    security: {
      passwordMinLength: 8,
      twoFactorRequired: true,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      ipWhitelist: '',
      apiRateLimit: 100
    },
    financial: {
      minDeposit: 10,
      maxDeposit: 50000,
      minWithdraw: 10,
      maxWithdraw: 50000,
      transferFee: 0.5,
      exchangeFee: 0.3,
      pixFee: 0,
      tedFee: 8.90
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@coinage.com',
      smtpPassword: '••••••••',
      fromEmail: 'noreply@coinage.com',
      fromName: 'Coinage',
      enableNotifications: true
    },
    api: {
      enablePublicApi: true,
      enableWebhooks: true,
      webhookSecret: '••••••••••••••••',
      apiVersion: 'v1',
      rateLimit: 1000,
      enableCors: true
    },
    database: {
      backupFrequency: 'daily',
      retentionDays: 30,
      autoBackup: true,
      encryptionEnabled: true
    }
  });

  const tabs = [
    // { id: 'general', label: t('tabs.general'), icon: Settings },
    // { id: 'security', label: t('tabs.security'), icon: Shield },
    // { id: 'financial', label: t('tabs.financial'), icon: DollarSign },
    { id: 'tokens', label: t('tabs.tokens'), icon: Coins },
    { id: 'stakes', label: t('tabs.stakes'), icon: Layers },
    { id: 'exchanges', label: t('tabs.exchanges'), icon: ArrowLeftRight },
    { id: 'issuers', label: 'Emissores', icon: Building2 },
    { id: 'cdi', label: t('tabs.cdi') || 'CDI', icon: DollarSign },
    // { id: 'roles', label: t('tabs.roles'), icon: Users },
    // { id: 'notifications', label: t('tabs.notifications'), icon: Bell },
    // { id: 'email', label: t('tabs.email'), icon: Mail },
    // { id: 'api', label: t('tabs.api'), icon: Server },
    // { id: 'database', label: t('tabs.database'), icon: Database }
  ];

  const backupFrequencies = [
    { value: 'hourly', label: t('database.frequencies.hourly') },
    { value: 'daily', label: t('database.frequencies.daily') },
    { value: 'weekly', label: t('database.frequencies.weekly') },
    { value: 'monthly', label: t('database.frequencies.monthly') }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess(t('messages.success.settingsUpdated'));
    } catch (error) {
      showError(t('messages.error.updateSettings'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleToggle = (section, field) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  // Token management functions
  const fetchTokens = async () => {
    setLoadingTokens(true);
    try {
      const response = await api.get('/api/admin/tokens?limit=100'); // Buscar até 100 tokens
      if (response.data.success) {
        setTokens(response.data.data?.tokens || []);
      } else {
        showError(t('messages.error.loadTokens'));
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      showError(t('messages.error.loadTokens'));
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleTokenSubmit = async () => {
    setLoading(true);

    try {
      // Add network and contractType from defaultNetwork and fixed type
      const tokenData = {
        ...tokenForm,
        network: defaultNetwork,
        contractType: 'token'
      };

      const response = await api.post('/api/admin/tokens/register', tokenData);

      if (response.data.success) {
        const action = response.data.data.tokenInfo.isUpdate ? t('common.updated') : t('common.registered');
        showSuccess(t('messages.success.tokenRegistered', { action }));
        setShowTokenForm(false);
        setEditingToken(null);
        setTokenForm({
          address: '',
          adminAddress: '',
          website: '',
          description: '',
          category: 'criptomoedas'
        });
        fetchTokens();
      } else {
        showError(response.data.message || t('messages.error.registerToken'));
      }
    } catch (error) {
      console.error('Error registering token:', error);
      const errorMessage = error.response?.data?.message || error.message || t('messages.error.registerToken');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenActivate = async (contractAddress, isActive) => {
    // Atualização otimista - atualizar o estado local imediatamente
    setTokens(prevTokens => 
      prevTokens.map(token => 
        token.address === contractAddress 
          ? { ...token, isActive: !isActive }
          : token
      )
    );

    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      const response = await api.post(`/api/admin/tokens/${contractAddress}/${endpoint}`);

      if (response.data.success) {
        showSuccess(isActive ? t('messages.success.tokenDeactivated') : t('messages.success.tokenActivated'));
        // Não recarregar a lista, manter a atualização otimista
      } else {
        // Reverter a mudança otimista se falhar
        setTokens(prevTokens =>
          prevTokens.map(token =>
            token.address === contractAddress
              ? { ...token, isActive: isActive }
              : token
          )
        );
        showError(response.data.message || t('messages.error.changeTokenStatus'));
      }
    } catch (error) {
      console.error('Error changing token status:', error);
      // Reverter a mudança otimista se falhar
      setTokens(prevTokens =>
        prevTokens.map(token =>
          token.address === contractAddress
            ? { ...token, isActive: isActive }
            : token
        )
      );
      const errorMessage = error.response?.data?.message || error.message || t('messages.error.changeTokenStatus');
      showError(errorMessage);
    }
  };

  // ===== EXCHANGE CONTRACTS FUNCTIONS =====

  const handleExchangeActivate = async (contractAddress, isActive) => {
    // Atualização otimista - atualizar o estado local imediatamente
    setTokens(prevTokens =>
      prevTokens.map(token =>
        token.address === contractAddress
          ? { ...token, isActive: !isActive }
          : token
      )
    );

    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      const response = await api.post(`/api/admin/tokens/${contractAddress}/${endpoint}`);

      if (response.data.success) {
        showSuccess(isActive ? t('messages.success.exchangeDeactivated') : t('messages.success.exchangeActivated'));
        // Não recarregar a lista, manter a atualização otimista
      } else {
        // Reverter a mudança otimista se falhar
        setTokens(prevTokens =>
          prevTokens.map(token =>
            token.address === contractAddress
              ? { ...token, isActive: isActive }
              : token
          )
        );
        showError(response.data.message || t('messages.error.changeExchangeStatus'));
      }
    } catch (error) {
      console.error('Error changing exchange status:', error);
      // Reverter a mudança otimista se falhar
      setTokens(prevTokens =>
        prevTokens.map(token =>
          token.address === contractAddress
            ? { ...token, isActive: isActive }
            : token
        )
      );
      const errorMessage = error.response?.data?.message || error.message || t('messages.error.changeExchangeStatus');
      showError(errorMessage);
    }
  };

  const handleExchangeSubmit = async () => {
    setLoading(true);

    try {
      // Validate required fields
      if (!exchangeForm.address || !exchangeForm.tokenAAddress || !exchangeForm.tokenBAddress ||
          !exchangeForm.symbol || !exchangeForm.name) {
        showError(t('messages.error.requiredFields'));
        setLoading(false);
        return;
      }

      // Use token registration endpoint that supports exchange type
      const response = await api.post('/api/admin/tokens/register', {
        ...exchangeForm,
        // Ensure metadata is included but not stringified here - the backend will handle it
        metadata: exchangeForm.metadata
      });

      if (response.data.success) {
        const action = response.data.data.tokenInfo?.isUpdate ? t('common.updated') : t('common.registered');
        showSuccess(t('messages.success.exchangeRegistered', { action }));
        setShowExchangeForm(false);
        setExchangeForm({
          address: '',
          network: defaultNetwork || 'testnet',
          contractType: 'exchange',
          tokenAAddress: '',
          tokenBAddress: '',
          adminAddress: '',
          symbol: '',
          name: '',
          website: '',
          description: '',
          metadata: {
            tradingFee: '0.25',
            minOrderSize: '1',
            maxOrderSize: '1000000',
            priceDecimals: '6',
            amountDecimals: '18'
          }
        });
        fetchTokens(); // Refresh the list
      } else {
        showError(response.data.message || t('messages.error.registerExchange'));
      }
    } catch (error) {
      console.error('Error registering exchange:', error);
      const errorMessage = error.response?.data?.message || error.message || t('messages.error.registerExchange');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== STAKE CONTRACTS FUNCTIONS =====

  const handleStakeActivate = async (contractAddress, isActive) => {
    // Atualização otimista - atualizar o estado local imediatamente
    setStakeContracts(prevContracts =>
      prevContracts.map(contract =>
        contract.address === contractAddress
          ? { ...contract, isActive: !isActive }
          : contract
      )
    );

    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      const response = await api.post(`/api/admin/tokens/${contractAddress}/${endpoint}`);

      if (response.data.success) {
        showSuccess(isActive ? t('messages.success.stakeDeactivated') : t('messages.success.stakeActivated'));
        // Não recarregar a lista, manter a atualização otimista
      } else {
        // Reverter a mudança otimista se falhar
        setStakeContracts(prevContracts =>
          prevContracts.map(contract =>
            contract.address === contractAddress
              ? { ...contract, isActive: isActive }
              : contract
          )
        );
        showError(response.data.message || t('messages.error.changeStakeStatus'));
      }
    } catch (error) {
      console.error('Error changing stake status:', error);
      // Reverter a mudança otimista se falhar
      setStakeContracts(prevContracts =>
        prevContracts.map(contract =>
          contract.address === contractAddress
            ? { ...contract, isActive: isActive }
            : contract
        )
      );
      const errorMessage = error.response?.data?.message || error.message || t('messages.error.changeStakeStatus');
      showError(errorMessage);
    }
  };

  const fetchIssuers = async () => {
    try {
      setLoadingIssuers(true);
      const response = await api.get('/api/issuers');
      if (response.data.success) {
        setIssuers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching issuers:', error);
      showError('Erro ao carregar emissores');
    } finally {
      setLoadingIssuers(false);
    }
  };

  const handleIssuerSubmit = async () => {
    setLoading(true);

    try {
      let issuerId;

      if (editingIssuer) {
        // Update existing issuer
        const response = await api.put(`/api/issuers/${editingIssuer.id}`, issuerForm);

        if (response.data.success) {
          issuerId = editingIssuer.id;
          showSuccess('Emissor atualizado com sucesso');
        } else {
          showError(response.data.message || 'Erro ao atualizar emissor');
          return;
        }
      } else {
        // Create new issuer
        const response = await api.post('/api/issuers', issuerForm);

        if (response.data.success) {
          issuerId = response.data.data.id;
          showSuccess('Emissor criado com sucesso');
        } else {
          showError(response.data.message || 'Erro ao criar emissor');
          return;
        }
      }

      // Upload logo if provided
      if (logoFile && issuerId) {
        const formData = new FormData();
        formData.append('logo', logoFile);

        try {
          await api.post(`/api/issuers/${issuerId}/upload-logo`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError);
          showError('Emissor salvo, mas erro ao fazer upload do logo');
        }
      }

      // Reset form and refresh list
      setShowIssuerForm(false);
      setEditingIssuer(null);
      setIssuerForm({
        name: '',
        foundationYear: '',
        website: '',
        description: ''
      });
      setLogoFile(null);
      setLogoPreview(null);
      fetchIssuers();
    } catch (error) {
      console.error('Error saving issuer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar emissor';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleIssuerActivate = async (issuer) => {
    const newIsActiveStatus = !issuer.isActive;

    // Atualização otimista - atualizar o estado local imediatamente
    setIssuers(prevIssuers =>
      prevIssuers.map(i =>
        i.id === issuer.id
          ? { ...i, isActive: newIsActiveStatus }
          : i
      )
    );

    try {
      const response = await api.put(`/api/issuers/${issuer.id}`, {
        isActive: newIsActiveStatus
      });

      if (response.data.success) {
        showSuccess(newIsActiveStatus ? 'Emissor ativado com sucesso' : 'Emissor desativado com sucesso');
      } else {
        // Reverter a mudança otimista se falhar
        setIssuers(prevIssuers =>
          prevIssuers.map(i =>
            i.id === issuer.id
              ? { ...i, isActive: issuer.isActive }
              : i
          )
        );
        showError(response.data.message || 'Erro ao alterar status do emissor');
      }
    } catch (error) {
      console.error('Error changing issuer status:', error);
      // Reverter a mudança otimista se falhar
      setIssuers(prevIssuers =>
        prevIssuers.map(i =>
          i.id === issuer.id
            ? { ...i, isActive: issuer.isActive }
            : i
        )
      );
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao alterar status do emissor';
      showError(errorMessage);
    }
  };

  const fetchStakeContracts = async () => {
    try {
      setLoadingStakeContracts(true);

      // Try to fetch from API first
      try {
        const response = await api.get('/api/stake-contracts');
        if (response.data.success) {
          setStakeContracts(response.data.data);
          return;
        }
      } catch (apiError) {
        console.warn('API not available, using fallback data:', apiError.message);
      }

      // No fallback data - start with empty list
      setStakeContracts([]);

      console.warn('API not available - contract list started empty');
    } catch (error) {
      console.error('Error fetching stake contracts:', error);
      showError(t('messages.error.loadStakeContracts'));
    } finally {
      setLoadingStakeContracts(false);
    }
  };

  const handleStakeSubmit = async () => {
    // Validar campos obrigatórios
    if (!stakeForm.companyId) {
      showError(t('messages.error.selectCompany'));
      return;
    }

    setLoading(true);
    try {
      let resultContract;

      // Ensure network matches defaultNetwork
      const contractData = {
        ...stakeForm,
        network: defaultNetwork || 'testnet'
      };

      // Verificar se está editando ou criando
      if (editingStakeId) {
        // MODO DE EDIÇÃO - Fazer PUT
        console.log('🔄 Editando contrato de stake:', editingStakeId, contractData);
        try {
          const response = await api.put(`/api/stake-contracts/${editingStakeId}`, {
            name: contractData.name,
            description: contractData.description,
            adminAddress: contractData.adminAddress,
            code: contractData.code,
            investment_type: contractData.investment_type,
            risk: contractData.risk,
            companyId: contractData.companyId,
            // Campos do metadata - Informações Financeiras
            equivalentCDI: contractData.equivalentCDI,
            rentability: contractData.rentability,
            rentabilityRange: contractData.rentabilityRange,
            rentabilityTooltip: contractData.rentabilityTooltip,
            rentabilityRangeTooltip: contractData.rentabilityRangeTooltip,
            assetType: contractData.assetType,
            maturityDate: contractData.maturityDate,
            paymentFrequency: contractData.paymentFrequency,
            capturedAmount: contractData.capturedAmount,
            totalEmission: contractData.totalEmission,
            minInvestment: contractData.minInvestment,
            tokenSymbol: contractData.tokenSymbol,
            // Emissor
            issuerId: contractData.issuerId,
            issuer: contractData.issuer,
            issuerName: contractData.issuerName,
            issuerDescription: contractData.issuerDescription,
            issuerWebsite: contractData.issuerWebsite,
            issuerFoundationYear: contractData.issuerFoundationYear,
            issuerLogo: contractData.issuerLogo,
            // Imagens
            logoUrl: contractData.logoUrl,
            bannerUrl: contractData.bannerUrl,
            // Garantias e Riscos
            guarantees: contractData.guarantees,
            risks: contractData.risks,
            blockchainNetwork: contractData.blockchainNetwork,
            registryInfo: contractData.registryInfo
          });

          if (response.data.success) {
            resultContract = response.data.data;
            showSuccess(t('messages.success.stakeUpdated') || 'Contrato atualizado com sucesso!');

            // Atualizar o contrato na lista
            setStakeContracts(prev =>
              prev.map(contract =>
                contract.id === editingStakeId
                  ? { ...contract, ...resultContract, metadata: { ...contract.metadata, ...resultContract.metadata } }
                  : contract
              )
            );
          }
        } catch (apiError) {
          console.error('Erro ao atualizar contrato:', apiError);
          showError(apiError.response?.data?.message || t('messages.error.updateStakeContract') || 'Erro ao atualizar contrato');
          setLoading(false);
          return;
        }
      } else {
        // MODO DE CRIAÇÃO - Fazer POST
        console.log('➕ Criando novo contrato de stake:', contractData);
        try {
          const response = await api.post('/api/stake-contracts', contractData);
          if (response.data.success) {
            resultContract = response.data.data;
            showSuccess(t('messages.success.stakeRegistered'));
          }
        } catch (apiError) {
          console.warn('API not available, using local data:', apiError.message);
          // Fallback to local state only
          resultContract = {
            id: Date.now(),
            ...contractData,
            isActive: true,
            createdAt: new Date().toISOString(),
            isFallbackData: true
          };
          showWarning(t('messages.warning.stakeRegisteredLocally'));
        }

        // Adicionar novo contrato à lista
        setStakeContracts(prev => [...prev, resultContract]);
      }

      // Limpar formulário e fechar
      setShowStakeForm(false);
      setEditingStakeId(null);
      setStakeForm({
        address: '',
        tokenAddress: '',
        network: defaultNetwork || 'testnet',
        name: '',
        code: '',
        description: '',
        adminAddress: '',
        risk: 1,
        companyId: '',
        investment_type: 'stake'
      });

      // Recarregar lista de contratos
      fetchStakeContracts();

    } catch (error) {
      console.error('Error in stake contract operation:', error);
      showError(editingStakeId ? t('messages.error.updateStakeContract') : t('messages.error.registerStakeContract'));
    } finally {
      setLoading(false);
    }
  };

  // ===== ROLE MANAGEMENT FUNCTIONS =====
  
  const checkAddressRoles = async () => {
    if (!selectedAddress || !selectedContract) {
      showWarning(t('messages.warning.selectAddressAndContract'));
      return;
    }

    try {
      setLoadingRoles(true);
      // Mock role checking - would use roleService
      const mockRoles = {
        DEFAULT_ADMIN_ROLE: selectedAddress === '0x5528C065931f523CA9F3a6e49a911896fb1D2e6f',
        MINTER_ROLE: false,
        TRANSFER_ROLE: selectedContract === '0xe21fc42e8c8758f6d999328228721F7952e5988d',
        BURNER_ROLE: false
      };

      setAddressRoles(mockRoles);
      const shortAddress = `${selectedAddress.slice(0,6)}...${selectedAddress.slice(-4)}`;
      showInfo(t('messages.success.rolesVerified', { address: shortAddress }));
    } catch (error) {
      showError(t('messages.error.verifyRoles'));
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleGrantRole = async (roleKey) => {
    if (!selectedAddress || !selectedContract) {
      showWarning(t('messages.warning.selectAddressAndContract'));
      return;
    }

    try {
      setGrantingRole(true);
      // Mock grant role - would use roleService
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAddressRoles(prev => ({
        ...prev,
        [roleKey]: true
      }));

      showSuccess(t('messages.success.roleGranted', { role: roleKey }));
    } catch (error) {
      showError(t('messages.error.grantRole'));
    } finally {
      setGrantingRole(false);
    }
  };

  // Helper functions to filter tokens by type and network
  const filterTokensByTypeAndNetwork = (contractType) => {
    return tokens.filter(token => {
      // Filter by contract type
      const tokenType = token.metadata?.contractType || 'token';
      const matchesType = tokenType === contractType;

      // Filter by network (only show items matching the default network)
      const matchesNetwork = token.network === defaultNetwork;

      return matchesType && matchesNetwork;
    });
  };

  const filterStakesByNetwork = () => {
    return stakeContracts.filter(contract => {
      // Filter by network
      const matchesNetwork = contract.network === defaultNetwork;

      // Filter out exchanges - only show stake contracts
      const contractType = contract.metadata?.contractType || contract.contractType || 'stake';
      const isStake = contractType === 'stake' || contractType === 'staking';

      return matchesNetwork && isStake;
    });
  };

  // Fetch companies function
  // Notification functions
  const fetchUsersForNotifications = async () => {
    try {
      const response = await api.get('/api/users?limit=1000');
      if (response.data.success) {
        const usersList = response.data.data?.users || response.data.users || response.data.data || [];
        // Ordenar alfabeticamente por nome
        const sortedUsers = usersList.sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
        );
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários para notificações:', error);
      showError(t('messages.error.loadUsers'));
    }
  };

  // Função para normalizar telefone (apenas números)
  const normalizePhoneDisplay = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  // Funções para selecionar/remover todos os usuários com telefone - Saques
  const handleSelectAllWithdrawal = () => {
    const allUserIds = users
      .filter(user => user.phone)
      .map(user => user.id);
    setWithdrawalUsers(allUserIds);
  };

  const handleDeselectAllWithdrawal = () => {
    setWithdrawalUsers([]);
  };

  // Funções para selecionar/remover todos os usuários com telefone - Documentos
  const handleSelectAllDocument = () => {
    const allUserIds = users
      .filter(user => user.phone)
      .map(user => user.id);
    setDocumentUsers(allUserIds);
  };

  const handleDeselectAllDocument = () => {
    setDocumentUsers([]);
  };

  const loadNotificationConfig = async () => {
    setLoadingNotifications(true);
    try {
      const response = await api.get('/api/notification-config');
      if (response.data.success) {
        const config = response.data.data;
        setWithdrawalUsers(config.withdrawal || []);
        setDocumentUsers(config.document || []);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de notificações:', error);
      showError(t('messages.error.loadNotificationConfig'));
    } finally {
      setLoadingNotifications(false);
    }
  };

  const saveNotificationConfig = async () => {
    setLoadingNotifications(true);
    try {
      const response = await api.post('/api/notification-config', {
        withdrawal: withdrawalUsers,
        document: documentUsers
      });
      if (response.data.success) {
        showSuccess(t('messages.success.notificationConfigSaved'));
      }
    } catch (error) {
      console.error('Erro ao salvar configuração de notificações:', error);
      showError(t('messages.error.saveNotificationConfig'));
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      // Buscar todas as empresas sem paginação
      const response = await api.get('/api/companies/frontend?limit=1000');
      if (response.data.success) {
        // A resposta é paginada, então pegamos companies
        const companiesList = response.data.data?.companies || response.data.companies || [];
        setCompanies(companiesList);

        // Auto-selecionar empresa atual se disponível
        if (currentCompany?.id && !stakeForm.companyId) {
          const companyExists = companiesList.find(c => c.id === currentCompany.id && c.isActive);
          if (companyExists) {
            setStakeForm(prev => ({ ...prev, companyId: currentCompany.id }));
          }
        }
        // Se não tem empresa atual, mas tem apenas uma empresa, selecionar automaticamente
        else if (!stakeForm.companyId) {
          const activeCompanies = companiesList.filter(c => c.isActive);
          if (activeCompanies.length === 1) {
            setStakeForm(prev => ({ ...prev, companyId: activeCompanies[0].id }));
          }
        }
      } else {
        showError(t('messages.error.loadCompanies'));
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      showError(error.response?.data?.message || t('messages.error.loadCompanies'));
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Load data when specific tabs are active
  useEffect(() => {
    if (activeTab === 'tokens' || activeTab === 'exchanges') {
      fetchTokens();
    } else if (activeTab === 'stakes') {
      fetchStakeContracts();
      fetchCompanies(); // Carregar empresas quando na tab de stakes
    } else if (activeTab === 'notifications') {
      fetchUsersForNotifications();
      loadNotificationConfig();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm">
            <AlertTriangle size={16} className="mr-1" />
            {t('subtitle')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com Tabs */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} className="mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Conteúdo das Configurações */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit}>
            {activeTab === 'general' && (
              <GeneralTab
                settings={settings}
                handleInputChange={handleInputChange}
                handleToggle={handleToggle}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab
                settings={settings}
                handleInputChange={handleInputChange}
                handleToggle={handleToggle}
              />
            )}

            {activeTab === 'financial' && (
              <FinancialTab
                settings={settings}
                handleInputChange={handleInputChange}
              />
            )}

            {activeTab === 'email' && (
              <EmailTab
                settings={settings}
                handleInputChange={handleInputChange}
                handleToggle={handleToggle}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                users={users}
                withdrawalUsers={withdrawalUsers}
                setWithdrawalUsers={setWithdrawalUsers}
                documentUsers={documentUsers}
                setDocumentUsers={setDocumentUsers}
                loadingNotifications={loadingNotifications}
                normalizePhoneDisplay={normalizePhoneDisplay}
                handleSelectAllWithdrawal={handleSelectAllWithdrawal}
                handleDeselectAllWithdrawal={handleDeselectAllWithdrawal}
                handleSelectAllDocument={handleSelectAllDocument}
                handleDeselectAllDocument={handleDeselectAllDocument}
                saveNotificationConfig={saveNotificationConfig}
              />
            )}

            {activeTab === 'api' && (
              <ApiTab
                settings={settings}
                handleInputChange={handleInputChange}
                handleToggle={handleToggle}
              />
            )}

            {activeTab === 'tokens' && (
              <TokensTab
                tokenForm={tokenForm}
                setTokenForm={setTokenForm}
                showTokenForm={showTokenForm}
                setShowTokenForm={setShowTokenForm}
                loading={loading}
                handleTokenSubmit={handleTokenSubmit}
                tokens={tokens}
                loadingTokens={loadingTokens}
                filterTokensByTypeAndNetwork={filterTokensByTypeAndNetwork}
                editingToken={editingToken}
                setEditingToken={setEditingToken}
                handleTokenActivate={handleTokenActivate}
              />
            )}


            {activeTab === 'stakes' && (
              <StakesTab
                stakeForm={stakeForm}
                setStakeForm={setStakeForm}
                showStakeForm={showStakeForm}
                setShowStakeForm={setShowStakeForm}
                loading={loading}
                handleStakeSubmit={handleStakeSubmit}
                companies={companies}
                loadingCompanies={loadingCompanies}
                currentCompany={currentCompany}
                stakeContracts={stakeContracts}
                loadingStakeContracts={loadingStakeContracts}
                filterStakesByNetwork={filterStakesByNetwork}
                editingStakeId={editingStakeId}
                setEditingStakeId={setEditingStakeId}
                handleStakeActivate={handleStakeActivate}
                issuers={issuers}
                loadingIssuers={loadingIssuers}
              />
            )}


            {activeTab === 'issuers' && (
              <IssuersTab
                issuerForm={issuerForm}
                setIssuerForm={setIssuerForm}
                showIssuerForm={showIssuerForm}
                setShowIssuerForm={setShowIssuerForm}
                loading={loading}
                handleIssuerSubmit={handleIssuerSubmit}
                issuers={issuers}
                loadingIssuers={loadingIssuers}
                editingIssuer={editingIssuer}
                setEditingIssuer={setEditingIssuer}
                handleIssuerActivate={handleIssuerActivate}
                logoFile={logoFile}
                setLogoFile={setLogoFile}
                logoPreview={logoPreview}
                setLogoPreview={setLogoPreview}
              />
            )}

            {activeTab === 'exchanges' && (
              <ExchangesTab
                exchangeForm={exchangeForm}
                setExchangeForm={setExchangeForm}
                showExchangeForm={showExchangeForm}
                setShowExchangeForm={setShowExchangeForm}
                loading={loading}
                handleExchangeSubmit={handleExchangeSubmit}
                tokens={tokens}
                loadingTokens={loadingTokens}
                filterTokensByTypeAndNetwork={filterTokensByTypeAndNetwork}
                handleExchangeActivate={handleExchangeActivate}
              />
            )}

            {activeTab === 'cdi' && <CdiTab />}

            {activeTab === 'roles' && (
              <RolesTab
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                selectedContract={selectedContract}
                setSelectedContract={setSelectedContract}
                addressRoles={addressRoles}
                loadingRoles={loadingRoles}
                grantingRole={grantingRole}
                checkAddressRoles={checkAddressRoles}
                handleGrantRole={handleGrantRole}
              />
            )}

            {activeTab === 'database' && (
              <DatabaseTab
                settings={settings}
                handleInputChange={handleInputChange}
                handleToggle={handleToggle}
                backupFrequencies={backupFrequencies}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
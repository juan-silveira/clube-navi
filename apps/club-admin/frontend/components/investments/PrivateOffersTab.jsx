"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Lock, Loader2, TrendingUp } from 'lucide-react';
import MeuPedacinhoPratique from './MeuPedacinhoPratique';
import Image from '@/components/ui/Image';
import stakeContractsService from '@/services/stakeContractsService';
import whitelistService from '@/services/whitelistService';
import { useAuth } from '@/hooks/useAuth';
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

const PrivateOffersTab = () => {
  const { t } = useTranslation('investments');
  const { user } = useAuth();
  const { showError } = useAlertContext();
  const [loading, setLoading] = useState(true);
  const [privateStakeContracts, setPrivateStakeContracts] = useState([]);
  const [tokenInfo, setTokenInfo] = useState({}); // Armazenar informações dos tokens
  const [hasPratiqueContracts, setHasPratiqueContracts] = useState(null); // Rastrear se Pratique tem contratos (null = ainda carregando)


  useEffect(() => {
    loadPrivateStakeContracts();
  }, [user]);

  const loadPrivateStakeContracts = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Limpar cache se forceRefresh
      if (forceRefresh) {
        stakeContractsService.clearCache();
        whitelistService.clearCache();
      }

      const userAddress = user?.walletAddress || user?.blockchainAddress || user?.publicKey;

      const result = await stakeContractsService.categorizeStakeContracts(userAddress, forceRefresh);

      // Validar resultado antes de definir estado
      if (result && Array.isArray(result.privateOffers)) {
        // Filtrar apenas ofertas privadas (excluir 'pratique' que tem componente próprio)
        // Contratos sem tipo definido caem na aba "Stake" por compatibilidade
        const privateOffersOnly = result.privateOffers.filter(contract =>
          contract.metadata?.investment_type === 'private_offer'
        );

        // Aplicar verificação de whitelist do metadata (banco de dados)
        // Regras:
        // 1. whitelistEnabled = false -> mostra para todos
        // 2. whitelistEnabled = true + usuário na whitelist -> mostra apenas para autorizados
        // 3. whitelistEnabled = true + whitelist vazia -> não mostra para ninguém
        const authorizedContracts = whitelistService.filterAuthorizedContracts(
          privateOffersOnly,
          userAddress
        );

        setPrivateStakeContracts(authorizedContracts);

        // Carregar informações dos tokens após definir os contratos
        if (authorizedContracts.length > 0) {
          await loadTokensInfo(authorizedContracts);
        }
      } else {
        console.warn('Invalid result from categorizeStakeContracts:', result);
        setPrivateStakeContracts([]);
      }
    } catch (error) {
      console.error('Error loading private stake contracts:', error);
      setPrivateStakeContracts([]); // Garantir estado válido em caso de erro
      showError(t('privateOffers.errors.loadContracts'));
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar informações de um token específico
  const fetchTokenInfo = async (tokenAddress, network) => {
    try {
      // Primeiro tentar via contract call (mais confiável)
      const symbolResponse = await api.post('/api/contracts/read', {
        contractAddress: tokenAddress,
        functionName: 'symbol',
        params: [],
        network
      });
      
      if (symbolResponse.data.success && symbolResponse.data.data?.result) {
        const symbol = Array.isArray(symbolResponse.data.data.result) 
          ? symbolResponse.data.data.result[0] 
          : symbolResponse.data.data.result;
        
        return {
          symbol: symbol || 'UNKNOWN',
          name: symbol || 'Unknown Token',
          decimals: 18
        };
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch token info for ${tokenAddress}:`, error.message);
      return null;
    }
  };

  // Carregar informações dos tokens para todos os contratos
  const loadTokensInfo = async (contracts) => {
    const tokensInfo = {};
    
    for (const contract of contracts) {
      // Verificar se existe tokenAddress no metadata
      const tokenAddress = contract.tokenAddress || contract.stakeToken;
      
      if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
        const info = await fetchTokenInfo(tokenAddress, contract.network);
        if (info) {
          tokensInfo[contract.address] = {
            ...info,
            tokenAddress
          };
        }
      }
    }
    
    setTokenInfo(tokensInfo);
  };

  const formatStakeContractForDisplay = (contract) => {
    // Validar dados do contrato
    if (!contract || typeof contract !== 'object') {
      console.warn('Invalid contract for display formatting:', contract);
      return null;
    }

    // Usar informações do token carregadas dinamicamente
    const tokenSymbol = tokenInfo[contract.address]?.symbol || contract.symbol || 'STAKE';
    
    return {
      icon: `${tokenSymbol}.png`,
      name: contract.name || 'Unknown Contract',
      code: tokenSymbol,
      price: '1 unidade',
      profitability: 'Recompensas de stake',
      profitabilityClass: 'text-purple-600',
      payment: 'Variável',
      daysRemaining: 'Sem prazo definido',
      market: 'Privado',
      type: 'stake',
      contractAddress: contract.address || '',
      network: contract.network || ''
    };
  };

  // Usar apenas contratos de stake reais com validação
  const allProducts = privateStakeContracts
    .map(formatStakeContractForDisplay)
    .filter(product => product !== null); // Filtrar produtos inválidos

  return (
    <div className="space-y-6">
      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Empty State quando não há ofertas privadas E não há contratos Pratique */}
          {/* Só mostra após confirmar que Pratique também não tem contratos (hasPratiqueContracts === false) */}
          {allProducts.length === 0 && hasPratiqueContracts === false && (
            <div className="text-center py-12">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('privateOffers.empty.title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('privateOffers.empty.description')}
              </p>
            </div>
          )}

          {/* TODO: Quando houver ofertas privadas, adicionar grid de cards aqui */}
          {/* Similar ao VariableIncomeTab ou FixedIncomeTab */}
        </>
      )}

      {/* Meu Pedacinho Pratique Section */}
      <div className="mt-8">
        <MeuPedacinhoPratique onContractsLoaded={setHasPratiqueContracts} />
      </div>
    </div>
  );
};

export default PrivateOffersTab;
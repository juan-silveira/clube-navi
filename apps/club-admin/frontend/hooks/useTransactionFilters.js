import { useState, useEffect, useMemo } from 'react';
import { transactionService } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';

const useTransactionFilters = () => {
  const { t } = useTranslation('statement');

  const [filterOptions, setFilterOptions] = useState({
    tokens: [],
    types: [],
    statuses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useAuthStore((s) => s.user);

  // Mapeamento dos tipos de transação (não usado mais - migramos para traduções via i18n)
  const transactionTypeTranslation = {};

  const fetchFilterOptions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await transactionService.getFilterOptions();
      
      if (response.success && response.data.transactions) {
        const transactions = response.data.transactions;
        
        // Extrair tokens únicos
        const uniqueTokens = [...new Set(
          transactions
            .map(tx => tx.metadata?.tokenSymbol)
            .filter(token => token)
        )];

        // Extrair tipos únicos - combinar transactionType e operations dos metadados
        const transactionTypes = transactions.map(tx => tx.transactionType);
        const operationTypes = transactions
          .map(tx => tx.metadata?.operation)
          .filter(op => op);
        
        const allTypes = [...transactionTypes, ...operationTypes];
        const uniqueTypes = [...new Set(allTypes)]
          .filter(type => type !== 'contract_call'); // Remover contract_call

        // Extrair status únicos
        const uniqueStatuses = [...new Set(
          transactions.map(tx => tx.status)
        )];

        setFilterOptions({
          tokens: uniqueTokens,
          types: uniqueTypes,
          statuses: uniqueStatuses
        });
      }
    } catch (err) {
      console.error('Erro ao buscar opções de filtro:', err);
      setError('Erro ao carregar opções de filtro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, [user?.id]);

  // Gerar opções para os selects
  const tokenOptions = useMemo(() => [
    { value: "", label: t('tokenOptions.all') },
    ...filterOptions.tokens.map(token => ({ value: token, label: token }))
  ], [filterOptions.tokens, t]);

  const typeOptions = useMemo(() => {
    // Mapeamento fixo: da chave de tradução para o tipo de backend principal
    const backendTypeGroups = {
      "typeOptions.deposit": ["deposit", "mint"],
      "typeOptions.dividend": ["stake_reward"],
      "typeOptions.investment": ["stake"],
      "typeOptions.redemption": ["unstake"],
      "typeOptions.withdraw": ["withdraw", "burn"],
      "typeOptions.transfer": ["transfer"],
      "typeOptions.exchange": ["exchange"]
    };
    
    // Identificar quais translation keys têm pelo menos um tipo disponível no banco
    const availableKeys = new Set();
    filterOptions.types.forEach(type => {
      for (const [translationKey, backendTypes] of Object.entries(backendTypeGroups)) {
        if (backendTypes.includes(type)) {
          availableKeys.add(translationKey);
          break;
        }
      }
    });

    // Sempre incluir Investimento e Resgate, mesmo se não houver dados no banco
    availableKeys.add("typeOptions.investment");
    availableKeys.add("typeOptions.redemption");

    // Criar opções para todas as translation keys
    const options = Array.from(availableKeys).map(translationKey => {
      const backendTypes = backendTypeGroups[translationKey];
      // Usar o primeiro tipo do backend que está disponível, ou o primeiro da lista se nenhum estiver disponível
      const availableType = backendTypes.find(t => filterOptions.types.includes(t)) || backendTypes[0];
      return { value: availableType, label: t(translationKey) };
    });
    
    return [
      { value: "", label: t('typeOptions.all') },
      ...options.sort((a, b) => {
        const labelA = a.label || '';
        const labelB = b.label || '';
        return labelA.localeCompare(labelB);
      })
    ];
  }, [filterOptions.types, t]);

  const statusOptions = useMemo(() => [
    { value: "", label: t('statusOptions.all') },
    { value: "pending", label: t('statusOptions.pending') },
    { value: "confirmed", label: t('statusOptions.confirmed') },
    { value: "failed", label: t('statusOptions.failed') },
    { value: "cancelled", label: t('statusOptions.cancelled') }
  ], [t]);

  return {
    tokenOptions,
    typeOptions,
    statusOptions,
    loading,
    error,
    refresh: fetchFilterOptions
  };
};

export default useTransactionFilters;
import { useCallback, useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import { userService } from '@/services/api';
import UserPlanService from '@/services/userPlanService';
import { useConfigContext } from '@/contexts/ConfigContext';
import redisBackupService from '@/services/redisBackupService';
import balanceBackupService from '@/services/balanceBackupService';
import { useNotificationEvents } from '@/contexts/NotificationContext';

// Função para obter o intervalo de cache baseado no plano do usuário
// Cache é menor que sync para evitar chamadas desnecessárias
const getCacheDurationMs = (userPlan = 'BASIC') => {
  switch (userPlan) {
    case 'PREMIUM': return 10 * 1000;     // 10 segundos (sync: 15s)
    case 'PRO': return 45 * 1000;         // 45 segundos (sync: 1min)
    case 'BASIC':
    default: return 90 * 1000;            // 90 segundos (sync: 2min)
  }
};

export const useCachedBalances = () => {
  const { 
    isAuthenticated, 
    user,
    cachedBalances, 
    balancesLastUpdate, 
    balancesLoading,
    setCachedBalances,
    setBalancesLoading,
    clearCachedBalances
  } = useAuthStore();
  
  const { config } = useConfigContext();
  const defaultNetwork = config?.defaultNetwork;
  
  // Hook de notificações para detectar mudanças de saldo
  const { sendBalanceNotification } = useNotificationEvents();
  
  // Ref para armazenar saldos anteriores para comparação
  const previousBalancesRef = useRef(null);

  // Função para detectar mudanças nos saldos e gerar notificações
  const detectBalanceChanges = useCallback((newBalances) => {
    if (!newBalances?.balancesTable || !previousBalancesRef.current?.balancesTable) {
      // Primeira carga ou saldo anterior não disponível - não notificar
      previousBalancesRef.current = newBalances;
      return;
    }

    const previousBalances = previousBalancesRef.current.balancesTable;
    const currentBalances = newBalances.balancesTable;
    
    try {
      // Detectar novos tokens
      const newTokens = Object.keys(currentBalances).filter(
        token => !previousBalances.hasOwnProperty(token)
      );
      
      // Detectar tokens removidos (saldo zerado/enviado completamente)
      const removedTokens = Object.keys(previousBalances).filter(
        token => !currentBalances.hasOwnProperty(token)
      ).map(token => {
        const previousBalance = parseFloat(previousBalances[token]) || 0;
        return {
          token,
          previousBalance,
          currentBalance: 0,
          difference: -previousBalance,
          type: 'decrease'
        };
      });
      
      // Detectar mudanças de saldo
      const balanceChanges = Object.keys(currentBalances)
        .filter(token => previousBalances.hasOwnProperty(token))
        .map(token => {
          const prevBalance = parseFloat(previousBalances[token]) || 0;
          const currentBalance = parseFloat(currentBalances[token]) || 0;
          const difference = currentBalance - prevBalance;
          
          if (Math.abs(difference) > 0.000001) { // Evitar diferenças de precisão
            return {
              token,
              previousBalance: prevBalance,
              currentBalance,
              difference,
              type: difference > 0 ? 'increase' : 'decrease'
            };
          }
          return null;
        })
        .filter(Boolean);

      // Enviar notificações para novos tokens
      newTokens.forEach(token => {
        const balance = parseFloat(currentBalances[token]) || 0;
        if (balance > 0) {
          sendBalanceNotification?.({
            type: 'new_token',
            token,
            balance,
            message: `Novo token ${token} detectado com saldo de ${balance.toFixed(6)}`
          });
        }
      });

      // Enviar notificações para tokens removidos (saldo zerado)
      removedTokens.forEach(removed => {
        const { token, previousBalance, difference } = removed;
        
        sendBalanceNotification?.({
          type: 'balance_change',
          token,
          difference,
          currentBalance: 0,
          changeType: 'decrease',
          message: `Seu saldo de ${token} diminuiu em ${Math.abs(difference).toFixed(6)}. Novo saldo: 0`
        });
      });

      // Enviar notificações para mudanças de saldo
      balanceChanges.forEach(change => {
        const { token, difference, type, currentBalance } = change;
        
        sendBalanceNotification?.({
          type: 'balance_change',
          token,
          difference,
          currentBalance,
          changeType: type,
          message: `${token}: ${type === 'increase' ? '+' : ''}${difference.toFixed(6)} (atual: ${currentBalance.toFixed(6)})`
        });
      });

    } catch (error) {
      console.error('Erro ao detectar mudanças de saldo:', error);
    }

    // Atualizar referência para próxima comparação
    previousBalancesRef.current = newBalances;
  }, [sendBalanceNotification]);

  // PROTEÇÃO CRÍTICA: Aplicar backup apenas quando realmente necessário (primeira carga)
  // DESABILITADO: Para evitar loops infinitos - será aplicado apenas no loadBalances se necessário

  // Verificar se o cache é válido
  const isCacheValid = useCallback(() => {
    if (!cachedBalances || !balancesLastUpdate) return false;
    
    // CRÍTICO: Verificar se o cache é do usuário atual (evitar cross-user contamination)
    if (cachedBalances.userId && user?.id && cachedBalances.userId !== user.id) {
      console.warn('⚠️ [CachedBalances] Cache de outro usuário detectado, invalidando');
      return false;
    }
    
    // Usar o intervalo baseado no plano do usuário
    const userPlan = user?.userPlan || 'BASIC';
    const cacheDuration = getCacheDurationMs(userPlan);
    
    return (Date.now() - balancesLastUpdate) < cacheDuration;
  }, [cachedBalances, balancesLastUpdate, user?.userPlan, user?.id]);

  // Carregar balances da API - usar cache quando possível
  const loadBalances = useCallback(async (force = false) => {
    if (!isAuthenticated || !user?.publicKey || !defaultNetwork) return;
    
    // Usar cache se disponível e válido (a menos que force = true)
    if (!force && cachedBalances && cachedBalances.userId === user?.id && isCacheValid()) {
      // console.log('✅ [CachedBalances] Usando dados do cache válido');
      return cachedBalances;
    }

    // Evitar múltiplas requisições simultâneas
    if (balancesLoading && !force) {
      // console.log('⚠️ [CachedBalances] Aguardando requisição em andamento...');
      return cachedBalances;
    }

    let safetyTimeout;
    try {
      setBalancesLoading(true);
      
      // Timeout de segurança para garantir que loading nunca fica preso
      safetyTimeout = setTimeout(() => {
        setBalancesLoading(false);
      }, 10000); // 10 segundos
      
      const response = await userService.getUserBalances(user.publicKey, defaultNetwork, true);
      
      if (response.success) {
        // ✅ API OK: Atualizar dados com timestamp fresh
        const balancesWithUserId = {
          ...response.data,
          userId: user.id,
          loadedAt: new Date().toISOString(),
          syncStatus: 'success',
          syncError: null,
          fromCache: false,
          isFreshData: true // Marcar como dados frescos
        };
        
        setCachedBalances(balancesWithUserId);
        
        // Usar sempre a detecção local para evitar duplicação
        // O backend já detecta e salva as mudanças, mas a notificação fica por conta do frontend
        detectBalanceChanges(balancesWithUserId);
        
        // Salvar backup no Redis
        try {
          redisBackupService.saveUserBalanceBackup(user.publicKey, balancesWithUserId);
        } catch (redisError) {
          // console.log('⚠️ [CachedBalances] Redis backup falhou (continuando):', redisError.message);
        }
        
        return balancesWithUserId;
      } else {
        // ❌ API com erro: Usar cache se disponível
        return await loadFromCache('API com erro');
      }
    } catch (error) {
      // ❌ API offline: Usar cache se disponível
      return await loadFromCache('API offline');
    } finally {
      clearTimeout(safetyTimeout);
      setBalancesLoading(false);
    }
  }, [isAuthenticated, user?.publicKey, defaultNetwork, isCacheValid]); // Removido cachedBalances, balancesLoading, setCachedBalances, setBalancesLoading

  // Função para carregar do cache quando API falha
  const loadFromCache = useCallback(async (reason = '') => {
    // CRÍTICO: Sempre parar loading primeiro
    setBalancesLoading(false);
    
    // Tentar cache atual primeiro
    if (cachedBalances && cachedBalances.userId === user?.id && cachedBalances.balancesTable) {
      const updatedCache = {
        ...cachedBalances,
        syncStatus: 'error',
        syncError: `${reason} - Mantendo dados em cache`,
        fromCache: true,
        lastApiError: new Date().toISOString()
      };
      setCachedBalances(updatedCache);
      return updatedCache;
    }

    // PRIMEIRO: Tentar saldos salvos no banco (campo balance do usuário)
    try {
      console.log('💾 [CachedBalances] Tentando saldos salvos no banco...');
      const savedBalanceResponse = await userService.getUserSavedBalances(user.id);
      
      if (savedBalanceResponse && savedBalanceResponse.success && savedBalanceResponse.data.balancesTable) {
        const balancesFromBank = {
          ...savedBalanceResponse.data,
          network: defaultNetwork,
          userId: user.id,
          loadedAt: new Date().toISOString(),
          syncStatus: 'error',
          syncError: `${reason} - Usando saldos salvos no banco`,
          fromCache: true,
          isEmergency: false
        };
        
        setCachedBalances(balancesFromBank);
        console.log('✅ [CachedBalances] Saldos salvos no banco carregados');
        return balancesFromBank;
      }
    } catch (bankError) {
      console.error('❌ [CachedBalances] Erro ao buscar saldos salvos no banco:', bankError);
    }

    // BACKUP ROBUSTO - NUNCA FALHA
    try {
      // console.log('🛡️ [CachedBalances] Tentando backup robusto...');
      const backupResult = await balanceBackupService.getBalances(user.id);
      
      if (backupResult && backupResult.data) {
        const balancesFromBackup = {
          ...backupResult.data,
          network: defaultNetwork,
          userId: user.id,
          loadedAt: new Date().toISOString(),
          syncStatus: 'error',
          syncError: `${reason} - Backup robusto (${backupResult.source})`,
          fromCache: true,
          isEmergency: backupResult.isEmergency || false
        };
        
        setCachedBalances(balancesFromBackup);
        // console.log('✅ [CachedBalances] Backup robusto carregado:', backupResult.source);
        return balancesFromBackup;
      }
    } catch (backupError) {
      // console.error('❌ [CachedBalances] Erro no backup robusto:', backupError);
    }

    // Se não tem cache atual, tentar backup Redis legado
    try {
      const userBackup = await redisBackupService.getUserBalanceBackup(user.publicKey);
      
      if (userBackup && userBackup.balancesTable && Object.keys(userBackup.balancesTable).length > 0) {
        const balancesFromBackup = {
          ...userBackup,
          network: defaultNetwork,
          userId: user.id,
          loadedAt: new Date().toISOString(),
          syncStatus: 'error',
          syncError: `${reason} - Usando backup Redis legado`,
          fromCache: true
        };
        setCachedBalances(balancesFromBackup);
        return balancesFromBackup;
      }
    } catch (backupError) {
      console.error('❌ [CachedBalances] Erro ao buscar backup Redis:', backupError);
    }
    
    // Se chegou até aqui, nenhum backup funcionou - usar balances vazios para novo usuário
    // Usar símbolo correto do token nativo baseado na rede
    const nativeToken = defaultNetwork === 'testnet' ? 'AZE-t' : 'AZE';
    const emergencyBalances = {
      balancesTable: {
        [nativeToken]: '0.000000',
        'cBRL': '0.000000'
      },
      network: defaultNetwork,
      userId: user.id,
      loadedAt: new Date().toISOString(),
      syncStatus: 'emergency',
      syncError: `${reason} - Sem dados disponíveis`,
      fromCache: true,
      isEmergency: true
    };
    
    setCachedBalances(emergencyBalances);
    return emergencyBalances;
  }, [user?.id, user?.publicKey, defaultNetwork]); // Removido cachedBalances, setCachedBalances, setBalancesLoading das dependências


  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated && user?.publicKey && user?.id) {
      // CRÍTICO: Verificar se há cache de outro usuário e limpar se necessário
      if (cachedBalances?.userId && user?.id && cachedBalances.userId !== user.id) {
        console.warn('🧹 [CachedBalances] Limpando cache de outro usuário');
        clearCachedBalances();
      }
      
      loadBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.publicKey, user?.id]);

  // Auto-refresh baseado no plano do usuário - BLOCKCHAIN DIRECT
  useEffect(() => {
    if (!isAuthenticated || !user?.publicKey) return;

    // Obter o intervalo baseado no plano do usuário  
    // PREMIUM: 15 segundos, PRO: 1 minuto, BASIC: 2 minutos
    const userPlan = user?.userPlan || 'BASIC';
    let syncInterval;
    switch (userPlan) {
      case 'PREMIUM': syncInterval = 15 * 1000; break;     // 15 segundos
      case 'PRO': syncInterval = 60 * 1000; break;         // 1 minuto  
      case 'BASIC':
      default: syncInterval = 2 * 60 * 1000; break;        // 2 minutos
    }

    // console.log(`🔄 Auto-refresh ativado para plano ${userPlan}: ${syncInterval/1000}s`);

    const interval = setInterval(() => {
      loadBalances(true); // Force = true para sempre buscar da blockchain
    }, syncInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.publicKey, user?.userPlan]);

  // VALORES DE EMERGÊNCIA para useCachedBalances - Valores zerados para novos usuários
  const emergencyValues = {
    'AZE-t': '0',
    'AZE': '0',
    'cBRL': '0'
  };

  // Funções de conveniência COM PROTEÇÃO TOTAL
  const getBalance = useCallback((symbol) => {
    if (!cachedBalances?.balancesTable) {
      return emergencyValues[symbol] || '0';
    }
    
    const balance = cachedBalances.balancesTable[symbol];
    if (!balance || balance === '0' || balance === 0) {
      return emergencyValues[symbol] || '0';
    }
    
    return balance; // Return raw balance for BalanceDisplay to format
  }, [cachedBalances]);

  const formatBalance = useCallback((balance) => {
    if (!balance || balance === '0' || balance === 0) return '0.000000';
    return parseFloat(balance).toFixed(6);
  }, []);

  const getCorrectAzeSymbol = useCallback(() => {
    if (!cachedBalances) return defaultNetwork === 'testnet' ? 'AZE-t' : 'AZE';
    const network = cachedBalances.network || defaultNetwork;
    return network === 'testnet' ? 'AZE-t' : 'AZE';
  }, [cachedBalances, defaultNetwork]);

  // Obter status de sincronização
  const getSyncStatus = useCallback(() => {
    // Se está loading e já tem dados, é atualização em background
    if (balancesLoading && cachedBalances && cachedBalances.balancesTable) {
      return {
        status: 'updating',
        error: null,
        lastSuccessfulSync: cachedBalances.lastSuccessfulSync || cachedBalances.timestamp,
        fromCache: cachedBalances.fromCache || false,
        loadingStartTime: Date.now(),
        isBackgroundUpdate: true
      };
    }
    
    // Se está loading e não tem dados, é loading inicial
    if (balancesLoading && (!cachedBalances || !cachedBalances.balancesTable)) {
      return { 
        status: 'loading',
        loadingStartTime: Date.now(),
        isInitialLoad: true
      };
    }
    
    // Se não está loading, retornar status normal
    if (!cachedBalances) {
      return { status: 'loading', loadingStartTime: Date.now() };
    }
    
    return {
      status: cachedBalances.syncStatus || 'success',
      error: cachedBalances.syncError || null,
      lastSuccessfulSync: cachedBalances.lastSuccessfulSync || cachedBalances.timestamp,
      fromCache: cachedBalances.fromCache || false,
      loadingStartTime: cachedBalances.loadingStartTime || null
    };
  }, [cachedBalances, balancesLoading]);

  return {
    balances: cachedBalances,
    loading: balancesLoading,
    isValid: isCacheValid(),
    lastUpdate: balancesLastUpdate,
    syncStatus: getSyncStatus(),
    reloadBalances: (force = false) => loadBalances(force),
    getBalance,
    formatBalance,
    getCorrectAzeSymbol,
  };
};

export default useCachedBalances;
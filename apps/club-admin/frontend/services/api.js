import axios from 'axios';
import useAuthStore from '@/store/authStore';

// Configuração base da API - CHAMADA DIRETA PARA O BACKEND
// Pegar o hostname atual (clube-navi.localhost) e mudar a porta para 8033
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname; // clube-navi.localhost
    return `http://${hostname}:8033`;
  }
  return 'http://localhost:8033';
};

const API_BASE_URL = getApiUrl();

// Instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔇 INTERCEPTAR CONSOLE.ERROR PARA SILENCIAR ERROS DE BALANCE-SYNC 401/403
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Override console.error
console.error = (...args) => {
  const message = args.join(' ').toLowerCase();
  
  // Lista de padrões para silenciar
  const silencePatterns = [
    'balance-sync',
    'usebalancesync',
    'fresh?address=',
    'cache?userid=',
    '401',
    '403',
    'unauthorized'
  ];
  
  // Se contém pelo menos 2 padrões da lista, silenciar
  const matchCount = silencePatterns.filter(pattern => message.includes(pattern)).length;
  if (matchCount >= 2) {
    return; // Silenciar
  }
  
  // Silenciar erros específicos do balance-sync
  if (message.includes('balance-sync') || 
      (message.includes(process.env.NEXT_PUBLIC_API_URL) && (message.includes('401') || message.includes('403')))) {
    return; // Silenciar
  }
  
  // Mostrar todos os outros erros normalmente
  originalConsoleError.apply(console, args);
};

// Override console.warn também
console.warn = (...args) => {
  const message = args.join(' ').toLowerCase();
  
  if (message.includes('balance-sync') && (message.includes('401') || message.includes('403'))) {
    return; // Silenciar warnings também
  }
  
  originalConsoleWarn.apply(console, args);
};


// Flag global para balance sync (importada do hook)
let isBalanceSyncAPIBlocked = false;

// Função para controlar bloqueio da API (somente no client-side)
if (typeof window !== 'undefined') {
  window.setBalanceSyncAPIBlocked = (blocked) => {
    isBalanceSyncAPIBlocked = blocked;
  };
}

// Throttling para refresh tokens - previne loops
let refreshTokenThrottle = {
  isRefreshing: false,
  lastRefreshTime: 0,
  minInterval: 2000 // 2 segundos mínimo entre refresh
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const { accessToken, isAuthenticated, user } = useAuthStore.getState();

    // DEBUG: Log para verificar estado do token
    console.log('🔍 [API Interceptor] Request:', {
      url: config.url,
      hasToken: !!accessToken,
      isAuthenticated,
      method: config.method
    });

    // PROTEÇÃO SUPREMA: Bloquear TODAS as chamadas balance-sync se flag global ativa
    if (config.url?.includes('/balance-sync/') && isBalanceSyncAPIBlocked) {
      const ultraSilentError = Object.create(Error.prototype);
      ultraSilentError.name = 'UltraSilentError';
      ultraSilentError.message = 'Balance sync blocked by global flag';
      ultraSilentError.code = 'BALANCE_SYNC_GLOBALLY_BLOCKED';
      ultraSilentError.isAxiosError = false;
      ultraSilentError.toJSON = () => ({});
      return Promise.reject(ultraSilentError);
    }

    // PROTEÇÃO CRÍTICA: Bloquear chamadas de balance-sync se usuário não está autenticado
    if (config.url?.includes('/balance-sync/') && (!isAuthenticated || !user?.publicKey || !accessToken)) {
      // Criar um erro silencioso que não gera logs no DevTools
      const silentError = Object.create(Error.prototype);
      silentError.name = 'SilentError';
      silentError.message = 'Balance sync blocked - user not authenticated';
      silentError.code = 'USER_NOT_AUTHENTICATED_SILENT';
      silentError.config = config;
      silentError.isAxiosError = false; // Evita logs do axios
      silentError.toJSON = () => ({}); // Evita serialização
      return Promise.reject(silentError);
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('✅ [API Interceptor] Token adicionado');
    } else {
      console.warn('⚠️ [API Interceptor] Token não disponível!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de requisição para prevenir chamadas desnecessárias de super admin
api.interceptors.request.use(
  (config) => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.email?.includes('@clubedigital.com');

    // Bloquear chamadas específicas para super admins
    if (isSuperAdmin) {
      const blockedEndpoints = [
        '/api/whitelabel/user/current-company',
        '/api/profile/photo',
        '/api/notifications/unread-count',
        '/api/notifications/unread',
        '/api/notifications/preferences',
        '/api/auth/me'
      ];

      const isBlocked = blockedEndpoints.some(endpoint => config.url?.includes(endpoint));

      if (isBlocked) {
        // Cancelar a requisição e retornar uma promise que resolve imediatamente
        config.adapter = () => {
          return Promise.resolve({
            data: { success: true, data: null },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
          });
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔇 SILENCIAR ERROS 401/403 DE BALANCE-SYNC DURANTE LOGOUT
    if (originalRequest?.url?.includes('/balance-sync/') && 
        (error.response?.status === 401 || error.response?.status === 403)) {
      // Criar erro ultra-silencioso que não aparece no DevTools
      const silentError = Object.create(Error.prototype);
      silentError.name = 'SilentBalanceSyncError';
      silentError.message = 'Balance sync unauthorized - silenced';
      silentError.code = 'BALANCE_SYNC_UNAUTHORIZED_SILENCED';
      silentError.config = originalRequest;
      silentError.isAxiosError = false; // Evita logs do axios
      silentError.toJSON = () => ({}); // Evita serialização
      silentError.stack = ''; // Remove stack trace
      return Promise.reject(silentError);
    }

    // Log do erro para debug (apenas para outras APIs)
    // console.log('🔍 [API] Erro interceptado:', {
    //   url: originalRequest?.url,
    //   method: originalRequest?.method,
    //   status: error.response?.status,
    //   message: error.message
    // });

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // ⚠️ IMPORTANTE: NÃO fazer retry para erros de 2FA inválido
      // Erros de 2FA devem ser tratados pelo frontend, não pelo interceptor
      const is2FAError = error.response?.data?.message?.toLowerCase().includes('2fa') ||
                        error.response?.data?.message?.toLowerCase().includes('código') ||
                        error.response?.data?.requires2FA === true;

      if (is2FAError) {
        console.log('🔐 [API] Erro 2FA detectado - NÃO fazendo retry automático');
        return Promise.reject(error);
      }

      // THROTTLING: Prevenir multiple refresh simultâneos
      const now = Date.now();
      if (refreshTokenThrottle.isRefreshing ||
          (now - refreshTokenThrottle.lastRefreshTime) < refreshTokenThrottle.minInterval) {
        console.log('🛑 [API] Refresh throttled - aguardando...');
        return Promise.reject(error);
      }
      // console.log('🔍 [API] Detectado erro 401, tentando refresh...', {
      //   url: originalRequest?.url,
      //   hasRetry: originalRequest._retry
      // });
      
      originalRequest._retry = true;

      refreshTokenThrottle.isRefreshing = true;
      refreshTokenThrottle.lastRefreshTime = now;
      
      const { refreshToken, logout, isAuthenticated } = useAuthStore.getState();
      
      // console.log('🔍 [API] Estado de autenticação:', {
      //   isAuthenticated,
      //   hasRefreshToken: !!refreshToken
      // });
      
      // IMPORTANTE: Não fazer logout automático em endpoints de sincronização, mas permitir renovação de token
      const isSyncRequest = originalRequest?.url?.includes('/balance-sync/') || 
                           originalRequest?.url?.includes('/notifications/') ||
                           originalRequest?.url?.includes('azorescan.com');
      
      if (isSyncRequest) {
        // console.log('⚠️ [API] Erro 401 em requisição de sync - tentando renovar token silenciosamente');
        
        // Para endpoints de sync (balance-sync, notifications), tentar refresh token silenciosamente
        if (isAuthenticated && refreshToken) {
          try {
            // console.log('🔄 [API] Tentando renovar token para sync...');
            // Super admins não usam refresh token por enquanto
            const user = useAuthStore.getState().user;
            if (user?.email?.includes('@clubedigital.com')) {
              throw new Error('Super admin - skip refresh');
            }

            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
              refreshToken
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
            
            // console.log('✅ [API] Token renovado para sync');
            // Atualizar tokens no store
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
            
            // Retry da requisição original
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            refreshTokenThrottle.isRefreshing = false;
            return api(originalRequest);
          } catch (refreshError) {
            refreshTokenThrottle.isRefreshing = false;
            // console.warn('⚠️ [API] Falha no refresh para sync - continuando sem fazer logout');
            // Não fazer logout, apenas rejeitar a requisição
            return Promise.reject(error);
          }
        }
        
        refreshTokenThrottle.isRefreshing = false;
        return Promise.reject(error);
      }
      
      // Só tentar refresh se o usuário estiver autenticado
      if (isAuthenticated && refreshToken) {
        try {
          // console.log('🔄 [API] Tentando renovar token...');
          // Super admins não usam refresh token por enquanto
          const user = useAuthStore.getState().user;
          if (user?.email?.includes('@clubedigital.com')) {
            // Para super admins, fazer logout e redirecionar para login
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Tentar renovar o token
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // console.log('✅ [API] Token renovado com sucesso');
          // Atualizar tokens no store
          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
          
          // Retry da requisição original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          refreshTokenThrottle.isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          refreshTokenThrottle.isRefreshing = false;
          // console.error('❌ [API] Erro ao renovar token:', {
          //   error: refreshError.message,
          //   status: refreshError.response?.status,
          //   data: refreshError.response?.data
          // });
          
          // NÃO fazer logout automático por falhas de refresh token
          // Deixar o usuário continuar logado e tentar novamente depois
          // console.warn('⚠️ [API] Falha no refresh token - usuário continua logado');
          
          // Só fazer logout se for explicitamente um token inválido do servidor
          const isTokenInvalid = refreshError.response?.status === 401 && 
                               (refreshError.response?.data?.message?.toLowerCase().includes('invalid token') ||
                                refreshError.response?.data?.message?.toLowerCase().includes('token expired'));
          
          if (isTokenInvalid) {
            // console.error('🚪 [API] LOGOUT - Token refresh inválido');
            logout('invalid_refresh_token');
            setTimeout(() => window.location.href = '/login', 1000);
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        refreshTokenThrottle.isRefreshing = false;
      }
      
      if (isAuthenticated && !isSyncRequest && !refreshToken) {
        // Só fazer logout se NÃO tiver refresh token E não for requisição de sync
        // console.error('🚪 [API] LOGOUT - Sem refresh token');
        logout('no_refresh_token');
        setTimeout(() => window.location.href = '/login', 1000);
      } else {
        // Para outros casos, apenas logar o erro
        // console.warn('⚠️ [API] Erro 401 - Continua logado:', {
        //   isAuthenticated,
        //   hasRefreshToken: !!refreshToken,
        //   isSyncRequest,
        //   url: originalRequest?.url
        // });
      }
      // Se não estiver autenticado, não fazer nada (provavelmente é erro de login)
    }

    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Login regular (Super Admin)
  login: async (email, password, twoFactorCode = null) => {
    try {
      const payload = {
        email,
        password
      };

      if (twoFactorCode) {
        payload.twoFactorCode = twoFactorCode;
      }

      const response = await api.post('/api/club-admin/auth/login', payload);
      // O backend retorna { success: true, data: { admin, accessToken } }
      // Adaptar para o formato esperado pelo frontend
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: {
            user: response.data.data.admin,
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.accessToken,
            isFirstAccess: false
          }
        };
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login whitelabel com company_alias
  loginWhitelabel: async (email, password, companyAlias, twoFactorCode = null) => {
    try {
      // Primeiro, buscar o company ID pelo alias
      const companyResponse = await api.get(`/api/whitelabel/company-branding/${companyAlias}`);

      if (!companyResponse.data.success) {
        throw new Error('Company não encontrado');
      }

      const payload = {
        email,
        password,
        companyId: companyResponse.data.data.company_id
      };

      if (twoFactorCode) {
        payload.twoFactorCode = twoFactorCode;
      }

      // Fazer login com o company ID
      const response = await api.post('/api/whitelabel/login/authenticate', payload);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar status do usuário para registro whitelabel
  checkUserStatus: async (email, companyAlias) => {
    try {
      const response = await api.post('/api/whitelabel/check-user-status', {
        email,
        companyAlias
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registrar novo usuário no whitelabel
  registerNewUserWhitelabel: async (userData) => {
    try {
      const response = await api.post('/api/whitelabel/register-new-user', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vincular usuário existente ao companye
  linkExistingUser: async (userId, password, companyAlias) => {
    try {
      const response = await api.post('/api/whitelabel/link-existing-user', {
        userId,
        password,
        companyAlias
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Completar dados do primeiro acesso
  completeFirstAccess: async (userData) => {
    try {
      const response = await api.post('/api/whitelabel/complete-first-access', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar token de primeiro acesso
  createFirstAccessToken: async () => {
    try {
      const response = await api.post('/api/whitelabel/create-first-access-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter dados usando token de primeiro acesso
  getFirstAccessData: async (token) => {
    try {
      const response = await api.get(`/api/whitelabel/get-first-access-data/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Erro no logout silencioso
    }
  },


  // Alterar senha
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/api/auth/change-password', {
      currentPassword: oldPassword,
      newPassword
    });
    return response.data;
  },

  // Refresh token (remover duplicata - usar apenas este)
  refreshToken: async (refreshToken) => {
    const response = await api.post('/api/auth/refresh', {
      refreshToken
    });
    return response.data;
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Validar token atual (usando endpoint /me)
  validateToken: async (token) => {
    try {
      const response = await api.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      // Se der erro 401, o token é inválido
      if (error.response?.status === 401) {
        return { success: false, message: 'Token inválido' };
      }
      throw error;
    }
  },
};

// Serviços de usuário
export const userService = {
  // Listar todos os usuários (club-admin)
  getAll: async (params = {}) => {
    const response = await api.get('/api/club-admin/users', { params });
    return response.data;
  },

  // Obter usuário por ID
  getById: async (id) => {
    const response = await api.get(`/api/club-admin/users/${id}`);
    return response.data;
  },

  // Criar usuário
  create: async (userData) => {
    const response = await api.post('/api/club-admin/users', userData);
    return response.data;
  },

  // Atualizar usuário
  update: async (id, userData) => {
    const response = await api.put(`/api/club-admin/users/${id}`, userData);
    return response.data;
  },

  // Deletar usuário
  delete: async (id) => {
    const response = await api.delete(`/api/club-admin/users/${id}`);
    return response.data;
  },

  // Toggle status ativo/inativo
  toggleActive: async (id) => {
    const response = await api.patch(`/api/club-admin/users/${id}/status`);
    return response.data;
  },

  // Métodos antigos mantidos para compatibilidade
  getUsers: async (params = {}) => {
    const response = await api.get('/api/club-admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/club-admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/api/club-admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/api/club-admin/users/${id}`, userData);
    return response.data;
  },

  // Obter saldos do usuário por endereço (usa endpoint fresh que inclui AZE-t nativo)
  getUserBalances: async (address, network, forceRefresh = false) => {
    // Usar o novo endpoint que busca dados frescos incluindo AZE-t
    const response = await api.get(`/api/balance-sync/fresh`, {
      params: {
        address: address,
        network: network
      }
    });

    // Transformar resposta para o formato esperado pelos hooks
    if (response.data.success && response.data.data) {
      const balanceData = response.data.data;
      return {
        success: true,
        data: {
          network: balanceData.network || 'testnet',
          balancesTable: balanceData.balancesTable || {},
          tokenBalances: balanceData.tokenBalances || [],
          totalTokens: balanceData.totalTokens || 0,
          address: balanceData.address || address,
          azeBalance: balanceData.azeBalance,
          timestamp: balanceData.timestamp || new Date().toISOString(),
          fromCache: balanceData.fromCache || false,
          syncStatus: balanceData.syncStatus || 'success',
          syncError: balanceData.syncError || null
        }
      };
    }

    return response.data;
  },

  // Obter saldos de qualquer usuário (apenas para admin)
  getAdminUserBalances: async (userId, address, network) => {
    const response = await api.get(`/api/balance-sync/admin/fresh`, {
      params: {
        userId: userId,
        address: address,
        network: network
      }
    });
    
    // Transformar resposta para o formato esperado pelos hooks
    if (response.data.success && response.data.data) {
      const balanceData = response.data.data;
      return {
        success: true,
        data: {
          network: balanceData.network || 'testnet',
          balancesTable: balanceData.balancesTable || {},
          tokenBalances: balanceData.tokenBalances || [],
          totalTokens: balanceData.totalTokens || 0,
          address: balanceData.address || address,
          azeBalance: balanceData.azeBalance,
          timestamp: balanceData.timestamp || new Date().toISOString(),
          // IMPORTANTE: Preservar os campos de status do backend
          fromCache: balanceData.fromCache || false,
          syncStatus: balanceData.syncStatus || 'success',
          syncError: balanceData.syncError || null
        }
      };
    }
    
    return response.data;
  },

  // Obter saldos do cache Redis
  getCachedBalances: async (userId, address, network) => {
    const response = await api.get('/api/balance-sync/cache', {
      params: { 
        userId: userId,
        address: address,
        network: network
      }
    });
    return response.data;
  },

  // Obter saldos salvos no banco de dados (campo balance do usuário)
  getUserSavedBalances: async (userId) => {
    const response = await api.get(`/api/users/${userId}/saved-balances`);
    return response.data;
  },

  // Ativar usuário
  activateUser: async (id) => {
    const response = await api.post(`/api/users/${id}/activate`);
    return response.data;
  },

  // Desativar usuário
  deactivateUser: async (id) => {
    const response = await api.post(`/api/users/${id}/deactivate`);
    return response.data;
  },

  // Bloquear usuário
  blockUser: async (id) => {
    const response = await api.post(`/api/users/${id}/block`);
    return response.data;
  },

  // Desbloquear usuário
  unblockUser: async (id) => {
    const response = await api.post(`/api/users/${id}/unblock`);
    return response.data;
  },

  // Obter ações do usuário
  getUserActions: async (userId, params = {}) => {
    const response = await api.get(`/api/users/${userId}/actions`, { params });
    return response.data;
  },

  // ==== MÉTODOS DE TAXAS DE TRANSFERÊNCIA POR TOKEN ====

  // Obter todas as taxas do usuário (incluindo deposit, withdraw, etc)
  getUserTaxes: async (userId) => {
    const response = await api.get(`/api/users/${userId}/taxes`);
    return response.data;
  },

  // Atualizar taxas customizadas do usuário (deposit, withdraw, etc)
  updateUserTaxes: async (userId, taxes) => {
    const response = await api.put(`/api/user-taxes/${userId}`, taxes);
    return response.data;
  },

  // Obter todas as taxas de tokens de um usuário
  getUserTokenFees: async (userId) => {
    const response = await api.get(`/api/user-taxes/${userId}/token-fees`);
    return response.data;
  },

  // Obter taxa de um token específico
  getUserTokenFee: async (userId, network, tokenId) => {
    const response = await api.get(`/api/user-taxes/${userId}/token-fees/${network}/${tokenId}`);
    return response.data;
  },

  // Atualizar taxa de um token específico
  updateUserTokenFee: async (userId, network, tokenId, fee) => {
    const response = await api.put(`/api/user-taxes/${userId}/token-fees/${network}/${tokenId}`, { fee });
    return response.data;
  },

  // Atualizar múltiplas taxas de tokens
  updateMultipleTokenFees: async (userId, updates) => {
    const response = await api.put(`/api/user-taxes/${userId}/token-fees/batch`, { updates });
    return response.data;
  },

  // Resetar todas as taxas de tokens para 0
  resetUserTokenFees: async (userId) => {
    const response = await api.post(`/api/user-taxes/${userId}/token-fees/reset`);
    return response.data;
  },

};

// Serviços de transações
export const transactionService = {
  // Listar transações do usuário
  getTransactions: async (params = {}) => {
    const response = await api.get('/api/transactions', { params });
    return response.data;
  },

  // Obter transação por hash
  getTransactionByHash: async (txHash) => {
    const response = await api.get(`/api/transactions/${txHash}`);
    return response.data;
  },

  // Obter estatísticas gerais
  getStats: async (params = {}) => {
    const response = await api.get('/api/transactions/stats/overview', { params });
    return response.data;
  },

  // Obter estatísticas por status
  getStatusStats: async (params = {}) => {
    const response = await api.get('/api/transactions/stats/status', { params });
    return response.data;
  },

  // Obter estatísticas por tipo
  getTypeStats: async (params = {}) => {
    const response = await api.get('/api/transactions/stats/type', { params });
    return response.data;
  },

  // Enfileirar transação
  enqueueTransaction: async (transactionData) => {
    const response = await api.post('/api/transactions/enqueue', transactionData);
    return response.data;
  },

  // Obter status de transação enfileirada
  getQueuedTransactionStatus: async (jobId) => {
    const response = await api.get(`/api/transactions/queue/${jobId}`);
    return response.data;
  },

  // Obter status de múltiplas transações enfileiradas
  getMultipleQueuedTransactionStatus: async (jobIds) => {
    const response = await api.post('/api/transactions/queue/batch', { jobIds });
    return response.data;
  },
  // Obter opções para filtros (busca todas as transações sem filtros para popular as opções)
  getFilterOptions: async () => {
    const response = await api.get('/api/transactions', { 
      params: { 
        page: 1, 
        limit: 1000 // Buscar uma quantidade grande para obter todas as opções
      } 
    });
    return response.data;
  }
};

// Serviços de tokens
export const tokenService = {
  // Listar tokens
  getTokens: async (params = {}) => {
    const response = await api.get('/api/tokens', { params });
    return response.data;
  },

  // Obter saldo de token
  getTokenBalance: async (contractAddress, walletAddress, network = 'mainnet') => {
    const response = await api.post('/api/tokens/balance', {
      contractAddress,
      walletAddress,
      network
    });
    return response.data;
  },
};

// Serviços de earnings (proventos)
export const earningsService = {
  // Obter proventos do usuário
  getUserEarnings: async (params = {}) => {
    const response = await api.get('/api/earnings', { params });
    return response.data;
  },

  // Obter dados para gráfico
  getEarningsForChart: async (params = {}) => {
    const response = await api.get('/api/earnings/chart', { params });
    return response.data;
  },

  // Obter resumo dos proventos
  getEarningsSummary: async (network = 'mainnet') => {
    const response = await api.get('/api/earnings/summary', { params: { network } });
    return response.data;
  },

  // Obter proventos por período
  getEarningsByPeriod: async (startDate, endDate, network = 'mainnet') => {
    const response = await api.get('/api/earnings/period', { 
      params: { startDate, endDate, network } 
    });
    return response.data;
  },

  // Criar novo provento (admin)
  createEarning: async (earningData) => {
    const response = await api.post('/api/earnings', earningData);
    return response.data;
  },

  // Atualizar provento (admin)
  updateEarning: async (id, updateData) => {
    const response = await api.put(`/api/earnings/${id}`, updateData);
    return response.data;
  },

  // Desativar provento (admin)
  deactivateEarning: async (id) => {
    const response = await api.delete(`/api/earnings/${id}`);
    return response.data;
  },
};

// Serviços de configuração
export const configService = {
  // Obter configurações públicas
  getPublicConfig: async () => {
    const response = await api.get('/api/config/public');
    return response.data;
  },
};

// Serviços de whitelabel
export const whitelabelService = {
  // Obter empresa atual do usuário
  getCurrentCompany: async () => {
    const response = await api.get('/api/whitelabel/user/current-company');
    return response.data;
  },

  // Listar empresas do usuário
  getUserCompanies: async (params = {}) => {
    const response = await api.get('/api/whitelabel/user/companies', { params });
    return response.data;
  }
};

// Serviços de administração de empresas
export const companyService = {
  // Listar todas as empresas (admin)
  getCompanies: async (params = {}) => {
    const response = await api.get('/api/companies/frontend', { params });
    return response.data;
  },

  // Obter empresa por ID
  getCompanyById: async (id) => {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  },

  // Criar empresa
  createCompany: async (companyData) => {
    const response = await api.post('/api/companies', companyData);
    return response.data;
  },

  // Atualizar empresa
  updateCompany: async (id, companyData) => {
    const response = await api.put(`/api/companies/${id}`, companyData);
    return response.data;
  },

  // Ativar empresa
  activateCompany: async (id) => {
    const response = await api.post(`/api/companies/${id}/activate`);
    return response.data;
  },

  // Desativar empresa
  deactivateCompany: async (id) => {
    const response = await api.post(`/api/companies/${id}/deactivate`);
    return response.data;
  },

  // Obter estatísticas de uso da empresa
  getCompanyUsageStats: async (id) => {
    const response = await api.get(`/api/companies/${id}/usage-stats`);
    return response.data;
  },

  // Obter usuários da empresa
  getCompanyUsers: async (id, params = {}) => {
    const response = await api.get(`/api/companies/${id}/users`, { params });
    return response.data;
  },

  // Obter estatísticas dos usuários da empresa
  getCompanyUsersStats: async (id) => {
    const response = await api.get(`/api/companies/${id}/users/stats`);
    return response.data;
  },

  // Atualizar rate limits
  updateRateLimits: async (id, rateLimit) => {
    const response = await api.put(`/api/companies/${id}/rate-limits`, { rateLimit });
    return response.data;
  }
};

// Serviços de administração para estatísticas gerais
export const adminService = {
  // Obter estatísticas gerais do sistema
  getSystemStats: async () => {
    // Para agora, vamos criar um endpoint que combine dados de usuários e empresas
    const [usersResponse, companiesResponse] = await Promise.all([
      api.get('/api/users', { params: { limit: 1 } }), // Para pegar total
      api.get('/api/companies', { params: { limit: 1 } }) // Para pegar total
    ]);

    return {
      success: true,
      data: {
        totalUsers: usersResponse.data.data?.pagination?.total || 0,
        totalCompanies: companiesResponse.data.data?.pagination?.total || 0,
        activeUsers: usersResponse.data.data?.pagination?.total || 0, // TODO: filtrar ativos
        activeCompanies: companiesResponse.data.data?.pagination?.total || 0 // TODO: filtrar ativas
      }
    };
  },

  // Obter atividades recentes
  getRecentActivities: async (params = {}) => {
    // TODO: Implementar endpoint de logs/atividades
    return {
      success: true,
      data: []
    };
  }
};

// Serviço de gerenciamento de clubes (super admin)
export const clubsService = {
  // Listar todos os clubes
  list: async (params = {}) => {
    const response = await api.get('/api/super-admin/clubs', { params });
    return response.data;
  },

  // Obter clube por ID
  getById: async (id) => {
    const response = await api.get(`/api/super-admin/clubs/${id}`);
    return response.data;
  },

  // Obter estatísticas do clube
  getStats: async (id) => {
    const response = await api.get(`/api/super-admin/clubs/${id}/stats`);
    return response.data;
  },

  // Atualizar status do clube
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/super-admin/clubs/${id}/status`, { status });
    return response.data;
  },

  // Obter estatísticas do dashboard
  getDashboardStats: async () => {
    const response = await api.get('/api/super-admin/clubs/dashboard/stats');
    return response.data;
  }
};

// Club Admins Service
export const clubAdminsService = {
  // Listar todos os administradores de clubes
  list: async (params = {}) => {
    const response = await api.get('/api/super-admin/club-admins', { params });
    return response.data;
  },

  // Obter admin por ID
  getById: async (id) => {
    const response = await api.get(`/api/super-admin/club-admins/${id}`);
    return response.data;
  },

  // Atualizar status do admin
  updateStatus: async (id, isActive) => {
    const response = await api.patch(`/api/super-admin/club-admins/${id}/status`, { isActive });
    return response.data;
  },

  // Obter estatísticas dos admins
  getStats: async () => {
    const response = await api.get('/api/super-admin/club-admins/stats');
    return response.data;
  }
};

// Notifications Service
export const notificationsService = {
  send: async (data) => {
    const response = await api.post('/api/super-admin/notifications/send', data);
    return response.data;
  },
  getHistory: async (params = {}) => {
    const response = await api.get('/api/super-admin/notifications/history', { params });
    return response.data;
  }
};

// WhatsApp Service
export const whatsappService = {
  send: async (data) => {
    const response = await api.post('/api/super-admin/whatsapp/send', data);
    return response.data;
  },
  getHistory: async (params = {}) => {
    const response = await api.get('/api/super-admin/whatsapp/history', { params });
    return response.data;
  }
};

// Club Users Service
export const clubUsersService = {
  list: async (params = {}) => {
    const response = await api.get('/api/super-admin/club-users', { params });
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await api.get('/api/super-admin/club-users/stats', { params });
    return response.data;
  }
};

// Club Groups Service
export const clubGroupsService = {
  list: async (params = {}) => {
    const response = await api.get('/api/super-admin/club-groups', { params });
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await api.get('/api/super-admin/club-groups/stats', { params });
    return response.data;
  }
};

// Billing Service
export const billingService = {
  list: async (params = {}) => {
    const response = await api.get('/api/super-admin/billing', { params });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/api/super-admin/billing/stats');
    return response.data;
  },
  updateStatus: async (clubId, status) => {
    const response = await api.patch(`/api/super-admin/billing/${clubId}/status`, { status });
    return response.data;
  }
};

// Club Transactions Service
export const clubTransactionsService = {
  list: async (params = {}) => {
    const response = await api.get('/api/super-admin/club-transactions', { params });
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await api.get('/api/super-admin/club-transactions/stats', { params });
    return response.data;
  }
};

// Club Service (for Club Admin)
export const clubService = {
  getStats: async () => {
    const response = await api.get('/api/club-admin/club-stats');
    return response.data;
  },
  getInfo: async () => {
    const response = await api.get('/api/club-admin/club-info');
    return response.data;
  }
};

// Products Service (for Club Admin)
export const productsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/club-admin/products', { params });
    return response.data;
  }
};

// Purchases Service (for Club Admin) - Transações/Pedidos
export const purchasesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/club-admin/purchases', { params });
    return response.data;
  }
};

// Groups Service (for Club Admin)
export const groupsService = {
  getAll: async () => {
    const response = await api.get('/api/club-admin/groups');
    return response.data;
  }
};

export default api;

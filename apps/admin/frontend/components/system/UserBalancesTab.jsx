"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { userService } from "@/services/api";
import BalancesTable from "@/components/partials/table/BalancesTable";
import { Coins, AlertCircle } from "lucide-react";
import useConfig from "@/hooks/useConfig";

const UserBalancesTab = ({ userId }) => {
  const { t } = useTranslation('admin');
  const { defaultNetwork } = useConfig();
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const response = await userService.getUserById(userId);
      if (response.success && response.data) {
        const userData = response.data.user || response.data;
        setUser(userData);
        // Depois de carregar o usuário, carregar saldos
        loadBalances(userData);
      } else if (response.id) {
        setUser(response);
        loadBalances(response);
      }
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      setLoading(false);
    }
  };

  const loadBalances = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Tentar buscar saldos salvos no banco primeiro
      let savedBalancesResponse = null;
      try {
        savedBalancesResponse = await userService.getUserSavedBalances(userId);

        // Verificar se os balances salvos são da mesma rede configurada
        const currentNetwork = defaultNetwork || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'mainnet';
        const savedNetwork = savedBalancesResponse?.data?.network;

        if (savedBalancesResponse.success && savedBalancesResponse.data &&
            savedBalancesResponse.data.balancesTable &&
            Object.keys(savedBalancesResponse.data.balancesTable).length > 0 &&
            savedNetwork === currentNetwork) {
          // Tem saldos salvos no banco E são da mesma rede
          setBalances(savedBalancesResponse.data);
          setLoading(false);
          return;
        }

        // Se a rede mudou, ignorar balances salvos e buscar da blockchain
        if (savedNetwork && savedNetwork !== currentNetwork) {
          console.log(`🔄 Rede mudou de ${savedNetwork} para ${currentNetwork}, buscando novos balances...`);
        }
      } catch (savedErr) {
        // Silenciar erro de saldos salvos (403, 404, etc)
      }

      // Se não tem saldos salvos, buscar da blockchain
      if (userData && userData.publicKey) {
        try {
          // Usar env var como fallback se defaultNetwork ainda não carregou
          const network = (defaultNetwork || process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'mainnet') === 'mainnet' ? 'mainnet' : 'testnet';

          // Usar endpoint de admin que permite buscar de qualquer usuário
          const blockchainResponse = await userService.getAdminUserBalances(
            userId,
            userData.publicKey,
            network
          );

          if (blockchainResponse.success && blockchainResponse.data) {
            setBalances(blockchainResponse.data);
          } else {
            setBalances(null);
          }
        } catch (blockchainErr) {
          // Erro de blockchain - apenas não mostrar saldos
          setBalances(null);
        }
      } else {
        setBalances(null);
      }
    } catch (err) {
      setBalances(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-300 dark:bg-slate-600 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Verificar se há saldos
  const hasBalances = balances?.balancesTable && Object.keys(balances.balancesTable).length > 0;

  if (!hasBalances) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-base font-medium text-slate-500 dark:text-slate-400 mb-2">
            {t('users.profile.balances.noBalances')}
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('users.profile.balances.noBalancesDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('users.profile.balances.title')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('users.profile.balances.subtitle')}
          </p>
        </div>
        <button
          onClick={() => loadBalances(user)}
          disabled={loading}
          className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('users.profile.balances.loading') : t('users.profile.balances.update')}
        </button>
      </div>

      {/* Usar o mesmo componente da tela de profile */}
      <BalancesTable balances={balances} />

      {/* Informações Adicionais */}
      {balances.address && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('users.profile.balances.walletAddress')}
          </h4>
          <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
            {balances.address}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserBalancesTab;

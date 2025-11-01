"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/api";
import { DollarSign, AlertCircle, Save, Percent, Network } from "lucide-react";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Badge from "@/components/ui/Badge";
import { useAlertContext } from "@/contexts/AlertContext";

const UserFeesTab = ({ userId }) => {
  const { showSuccess, showError } = useAlertContext();
  const [tokenFees, setTokenFees] = useState({ testnet: [], mainnet: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingFees, setEditingFees] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [depositFee, setDepositFee] = useState(0);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [originalDepositFee, setOriginalDepositFee] = useState(0);
  const [originalWithdrawFee, setOriginalWithdrawFee] = useState(0);

  useEffect(() => {
    loadTokenFees();
  }, [userId]);

  // Verificar mudanças e atualizar estado hasChanges
  useEffect(() => {
    const checkChanges = () => {
      // Verificar mudanças em deposit/withdraw
      const depositChanged = parseFloat(depositFee) !== parseFloat(originalDepositFee);
      const withdrawChanged = parseFloat(withdrawFee) !== parseFloat(originalWithdrawFee);

      if (depositChanged || withdrawChanged) {
        return true;
      }

      // Verificar mudanças nos tokens
      const keys = Object.keys(editingFees);

      if (keys.length === 0) {
        return false;
      }

      const hasAnyChange = keys.some(key => {
        const [network, ...tokenIdParts] = key.split('-');
        const tokenId = tokenIdParts.join('-');
        const tokensInNetwork = tokenFees[network] || [];

        const token = tokensInNetwork.find(t => t.id === tokenId);

        if (!token) {
          return false;
        }

        const editedValue = editingFees[key];
        const currentFee = parseFloat(editedValue);
        const originalFee = parseFloat(token.fee);

        return currentFee !== originalFee;
      });

      return hasAnyChange;
    };

    const result = checkChanges();
    setHasChanges(result);
  }, [editingFees, tokenFees, depositFee, withdrawFee, originalDepositFee, originalWithdrawFee]);

  const loadTokenFees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar taxas de tokens
      const tokenFeesResponse = await userService.getUserTokenFees(userId);

      // Buscar todas as taxas do usuário (incluindo deposit e withdraw)
      const allTaxesResponse = await userService.getUserTaxes(userId);

      if (tokenFeesResponse.success && tokenFeesResponse.data) {
        setTokenFees(tokenFeesResponse.data);
        // Inicializar estado de edição
        const initialEditState = {};
        ['testnet', 'mainnet'].forEach(network => {
          tokenFeesResponse.data[network]?.forEach(token => {
            initialEditState[`${network}-${token.id}`] = token.fee;
          });
        });
        setEditingFees(initialEditState);
      } else {
        setTokenFees({ testnet: [], mainnet: [] });
      }

      // Carregar taxas de depósito e saque
      if (allTaxesResponse.success && allTaxesResponse.data) {
        const depositFeeValue = parseFloat(allTaxesResponse.data.depositFee) || 0;
        const withdrawFeeValue = parseFloat(allTaxesResponse.data.withdrawFee) || 0;

        setDepositFee(depositFeeValue);
        setWithdrawFee(withdrawFeeValue);
        setOriginalDepositFee(depositFeeValue);
        setOriginalWithdrawFee(withdrawFeeValue);
      }
    } catch (err) {
      console.error("Erro ao carregar taxas:", err);
      setError("Erro ao carregar taxas");
    } finally {
      setLoading(false);
    }
  };

  const handleFeeChange = (network, tokenId, value) => {
    const key = `${network}-${tokenId}`;
    const newValue = value === '' ? '' : value; // Manter como string
    setEditingFees(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  const handleSaveAllFees = async () => {
    try {
      setSaving(true);

      let totalUpdates = 0;

      // Verificar mudanças em deposit/withdraw
      const depositChanged = parseFloat(depositFee) !== parseFloat(originalDepositFee);
      const withdrawChanged = parseFloat(withdrawFee) !== parseFloat(originalWithdrawFee);

      // Atualizar taxas de deposit/withdraw se mudaram
      if (depositChanged || withdrawChanged) {
        const taxesUpdate = {};
        if (depositChanged) {
          taxesUpdate.depositFee = parseFloat(depositFee);
          totalUpdates++;
        }
        if (withdrawChanged) {
          taxesUpdate.withdrawFee = parseFloat(withdrawFee);
          totalUpdates++;
        }

        const taxesResponse = await userService.updateUserTaxes(userId, taxesUpdate);
        if (!taxesResponse.success) {
          showError("Erro ao atualizar taxas de depósito/saque");
          return;
        }
      }

      // Montar array de updates para tokens
      const tokenUpdates = [];
      ['testnet', 'mainnet'].forEach(network => {
        tokenFees[network]?.forEach(token => {
          const key = `${network}-${token.id}`;
          const editedValue = editingFees[key];

          if (editedValue === undefined) return;

          const currentFee = parseFloat(editedValue) || 0;
          const originalFee = parseFloat(token.fee) || 0;

          if (currentFee !== originalFee) {
            tokenUpdates.push({
              network,
              tokenId: token.id,
              fee: currentFee
            });
          }
        });
      });

      // Atualizar taxas de tokens se houver mudanças
      if (tokenUpdates.length > 0) {

        const response = await userService.updateMultipleTokenFees(userId, tokenUpdates);

        if (!response.success) {
          showError(response.message || "Erro ao atualizar taxas de tokens");
          return;
        }
        totalUpdates += tokenUpdates.length;
      }

      if (totalUpdates === 0) {
        showError("Nenhuma taxa foi alterada");
        return;
      }

      showSuccess(`${totalUpdates} taxa(s) atualizada(s) com sucesso`);
      await loadTokenFees();
    } catch (err) {
      console.error("Erro ao salvar taxas:", err);
      showError("Erro ao salvar taxas");
    } finally {
      setSaving(false);
    }
  };

  const handleResetFees = async () => {
    if (!confirm("Deseja resetar todas as taxas para 0 (zero)?")) {
      return;
    }

    try {
      setSaving(true);

      const response = await userService.resetUserTokenFees(userId);

      if (response.success) {
        showSuccess("Todas as taxas foram resetadas para 0");
        await loadTokenFees();
      } else {
        showError(response.message || "Erro ao resetar taxas");
      }
    } catch (err) {
      console.error("Erro ao resetar taxas:", err);
      showError("Erro ao resetar taxas");
    } finally {
      setSaving(false);
    }
  };

  // Função para obter a logo do token
  const getTokenLogo = (symbol) => {
    return `/assets/images/currencies/${symbol}.png`;
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
        <Button onClick={loadTokenFees} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const hasTokens = (tokenFees.testnet?.length > 0 || tokenFees.mainnet?.length > 0);

  if (!hasTokens) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-base font-medium text-slate-500 dark:text-slate-400 mb-2">
            Nenhum token configurado
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Execute o script de população para adicionar taxas de tokens
          </p>
        </div>
      </div>
    );
  }

  const renderTokenGroup = (network, tokens) => {
    if (!tokens || tokens.length === 0) return null;

    const isMainnet = network === 'mainnet';
    const headerColor = isMainnet
      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
      : 'bg-gradient-to-r from-purple-500 to-purple-600';

    return (
      <div key={network} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {/* Header da rede */}
        <div className={`${headerColor} text-white px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Network className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">
                  {network === 'testnet' ? 'Testnet (Floripa)' : 'Mainnet (Azore)'}
                </h3>
                <p className="text-sm text-white/80">
                  {tokens.length} {tokens.length === 1 ? 'token disponível' : 'tokens disponíveis'}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isMainnet ? 'bg-blue-400/30' : 'bg-purple-400/30'
            }`}>
              {isMainnet ? 'PRODUÇÃO' : 'TESTE'}
            </div>
          </div>
        </div>

        {/* Grid de tokens */}
        <div className="p-6 bg-gray-50 dark:bg-slate-900/50">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => {
              const key = `${network}-${token.id}`;
              const currentFee = editingFees[key] !== undefined ? editingFees[key] : token.fee;
              const hasChanged = (parseFloat(currentFee) || 0) !== (parseFloat(token.fee) || 0);

              return (
                <div
                  key={token.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-2 ${
                    hasChanged
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 ring-2 ring-yellow-400/20'
                      : 'border-gray-200 dark:border-slate-700'
                  } transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                        src={getTokenLogo(token.symbol)}
                        alt={token.symbol}
                        onError={(e) => {
                          e.target.src = '/assets/images/currencies/DEFAULT.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {token.symbol}
                        </h4>
                        {hasChanged && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs rounded-full font-medium animate-pulse">
                            Alterado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={token.name}>
                        {token.name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Taxa de Transferência
                    </label>
                    <Textinput
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentFee}
                      onChange={(e) => handleFeeChange(network, token.id, e.target.value)}
                      placeholder="0.00"
                      className="text-sm"
                    />

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-mono">{token.address.substring(0, 10)}...</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Taxas de Transferência por Token
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure as taxas individuais para cada token em cada rede
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={loadTokenFees}
            variant="outline"
            disabled={loading || saving}
          >
            Atualizar
          </Button>
          <Button
            onClick={handleResetFees}
            variant="outline"
            disabled={saving}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            Resetar Tudo
          </Button>
          {hasChanges ? (
            <Button
              onClick={handleSaveAllFees}
              isLoading={saving}
              className="bg-green-600 hover:bg-green-700 text-white animate-pulse"
            >
              <Save size={16} className="mr-2" />
              Salvar Tudo
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                {Object.keys(editingFees).filter(key => {
                  const [network, ...tokenIdParts] = key.split('-');
                  const tokenId = tokenIdParts.join('-');
                  const token = tokenFees[network]?.find(t => t.id === tokenId);
                  if (!token) return false;
                  const currentFee = parseFloat(editingFees[key]) || 0;
                  const originalFee = parseFloat(token.fee) || 0;
                  return currentFee !== originalFee;
                }).length}
              </span>
            </Button>
          ) : (
            <Button
              disabled={true}
              className="bg-gray-400 text-gray-200"
            >
              <Save size={16} className="mr-2" />
              Salvar Tudo
            </Button>
          )}
        </div>
      </div>

      {/* Deposit and Withdraw Fees Section */}
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">
                  Taxas de Depósito e Saque
                </h3>
                <p className="text-sm text-white/80">
                  Valores fixos em Reais (R$)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50 dark:bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deposit Fee */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-gray-200 dark:border-slate-700">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taxa de Depósito (PIX)
                </label>
                <Textinput
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositFee}
                  onChange={(e) => setDepositFee(e.target.value)}
                  placeholder="0.00"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Taxa fixa em R$ cobrada em cada depósito via PIX
                </p>
              </div>
            </div>

            {/* Withdraw Fee */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-gray-200 dark:border-slate-700">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taxa de Saque (PIX)
                </label>
                <Textinput
                  type="number"
                  step="0.01"
                  min="0"
                  value={withdrawFee}
                  onChange={(e) => setWithdrawFee(e.target.value)}
                  placeholder="0.00"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Taxa fixa em R$ cobrada em cada saque via PIX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="py-4"></div>

      {/* Mainnet Tokens */}
      {renderTokenGroup('mainnet', tokenFees.mainnet)}

      {/* Espaçamento entre redes */}
      {tokenFees.mainnet?.length > 0 && tokenFees.testnet?.length > 0 && (
        <div className="py-4"></div>
      )}

      {/* Testnet Tokens */}
      {renderTokenGroup('testnet', tokenFees.testnet)}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Sobre as Taxas de Transferência
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• As taxas são aplicadas em cada transferência do respectivo token</li>
              <li>• Valores em unidades do token (ex: 0.5 cBRL = R$ 0,50)</li>
              <li>• Taxa padrão é 0 (zero) para não impactar usuários existentes</li>
              <li>• Mainnet = Azore | Testnet = Floripa</li>
              <li>• Clique em "Salvar Tudo" para aplicar todas as alterações de uma vez</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFeesTab;

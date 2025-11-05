import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { transactionsService, type Transaction } from '@/services/transactions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Statement() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const transactions = await transactionsService.getMyTransactions();
      setTransactions(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      await fetchTransactions();
      setLoading(false);
    };

    loadTransactions();
  }, []);

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return 'time-outline';
    if (status === 'failed') return 'close-circle-outline';

    switch (type.toUpperCase()) {
      case 'DEPOSIT':
      case 'MINT':
        return 'add-circle';
      case 'WITHDRAWAL':
      case 'WITHDRAW':
      case 'BURN':
        return 'remove-circle';
      case 'BUY':
        return 'arrow-down-circle';
      case 'SELL':
        return 'arrow-up-circle';
      case 'TRANSFER':
        return 'swap-horizontal';
      default:
        return 'cash-outline';
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'pending') return '#FF9500';
    if (status === 'failed') return '#FF3B30';

    switch (type.toUpperCase()) {
      case 'DEPOSIT':
      case 'MINT':
        return '#34C759';
      case 'WITHDRAWAL':
      case 'WITHDRAW':
      case 'BURN':
        return '#FF3B30';
      case 'BUY':
        return '#34C759'; // Verde para compra (entrada de ativo)
      case 'SELL':
        return '#FF3B30'; // Vermelho para venda (saída de ativo)
      case 'TRANSFER':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DEPOSIT':
        return 'Depósito';
      case 'WITHDRAWAL':
      case 'WITHDRAW':
        return 'Saque';
      case 'BUY':
        return 'Compra';
      case 'SELL':
        return 'Venda';
      case 'TRANSFER':
        return 'Transferência';
      case 'MINT':
        return 'Mint';
      case 'BURN':
        return 'Burn';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const value = Math.abs(amount).toFixed(2).replace('.', ',');
    const upperType = type.toUpperCase();

    // Transações que aumentam saldo (entrada): +
    if (upperType === 'DEPOSIT' || upperType === 'MINT' || upperType === 'BUY') {
      return `R$ ${value}`;
    }

    // Transações que diminuem saldo (saída): sem prefixo
    return `R$ ${value}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMM 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const openBlockchainExplorer = async (txHash: string) => {
    try {
      // Obter a rede padrão e URLs dos exploradores das variáveis de ambiente
      const defaultNetwork = process.env.EXPO_PUBLIC_DEFAULT_NETWORK || 'testnet';
      const mainnetExplorerUrl = process.env.EXPO_PUBLIC_MAINNET_EXPLORER_URL || 'https://azorescan.com';
      const testnetExplorerUrl = process.env.EXPO_PUBLIC_TESTNET_EXPLORER_URL || 'https://floripa.azorescan.com';

      // Selecionar o explorador baseado na rede
      const explorerUrl = defaultNetwork === 'mainnet' ? mainnetExplorerUrl : testnetExplorerUrl;

      // Construir a URL completa da transação
      const txUrl = `${explorerUrl}/tx/${txHash}`;

      // Verificar se a URL pode ser aberta
      const canOpen = await Linking.canOpenURL(txUrl);

      if (canOpen) {
        await Linking.openURL(txUrl);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o explorador da blockchain');
      }
    } catch (error) {
      console.error('Erro ao abrir explorador:', error);
      Alert.alert('Erro', 'Não foi possível abrir o link');
    }
  };

  const openTransactionDetails = (transaction: Transaction) => {
    // TODO: Implementar modal ou tela de detalhes
    console.log('Detalhes da transação:', transaction);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Extrato</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
          <Text style={styles.loadingText}>Carregando transações...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={whitelabelConfig.colors.primary}
              colors={[whitelabelConfig.colors.primary]}
            />
          }
        >
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyTitle}>Nenhuma transação</Text>
              <Text style={styles.emptySubtitle}>
                Suas transações aparecerão aqui
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  onPress={() => openTransactionDetails(transaction)}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: getTransactionColor(transaction.transactionType, transaction.status) + '20' },
                      ]}
                    >
                      <Ionicons
                        name={getTransactionIcon(transaction.transactionType, transaction.status) as any}
                        size={24}
                        color={getTransactionColor(transaction.transactionType, transaction.status)}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionType}>
                        {getTransactionLabel(transaction.transactionType)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getTransactionColor(transaction.transactionType, transaction.status) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getTransactionColor(transaction.transactionType, transaction.status) },
                          ]}
                        >
                          {getStatusLabel(transaction.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: getTransactionColor(transaction.transactionType, transaction.status) },
                      ]}
                    >
                      {formatAmount(transaction.amount, transaction.transactionType)}
                    </Text>
                    {transaction.txHash && (
                      <TouchableOpacity
                        style={styles.txHashButton}
                        onPress={() => openBlockchainExplorer(transaction.txHash!)}
                      >
                        <Ionicons name="link-outline" size={14} color={whitelabelConfig.colors.primary} />
                        <Text style={[styles.txHashText, { color: whitelabelConfig.colors.primary }]}>
                          Ver TX
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionsList: {
    padding: 20,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  txHashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  txHashText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

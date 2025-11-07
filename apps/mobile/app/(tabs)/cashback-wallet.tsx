import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter } from 'expo-router';
import { cashbackService } from '@/services/cashbackService';
import type { CashbackStats, CashbackHistoryItem } from '@/types/cashback';

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  purchase: { label: 'Compra', icon: 'cart', color: whitelabelConfig.colors.success },
  referral: { label: 'Indicação', icon: 'people', color: whitelabelConfig.colors.primary },
  withdrawal: { label: 'Saque', icon: 'arrow-up', color: whitelabelConfig.colors.danger },
  bonus: { label: 'Bônus', icon: 'gift', color: whitelabelConfig.colors.warning },
};

export default function CashbackWallet() {
  const router = useRouter();

  const [stats, setStats] = useState<CashbackStats | null>(null);
  const [history, setHistory] = useState<CashbackHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'purchase' | 'referral' | 'withdrawal' | 'bonus'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, [selectedFilter]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadHistory(1),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const response = await cashbackService.getCashbackStats();
    if (response.success && response.data) {
      setStats(response.data);
    }
  };

  const loadHistory = async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await cashbackService.getCashbackHistory({
        page,
        limit: pagination.limit,
        type: selectedFilter === 'all' ? undefined : selectedFilter,
      });

      if (response.success && response.data) {
        if (page === 1) {
          setHistory(response.data.history);
        } else {
          setHistory((prev) => [...prev, ...response.data!.history]);
        }
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInitialData();
  }, [selectedFilter]);

  const loadMore = () => {
    if (!loadingMore && pagination.page < pagination.totalPages) {
      loadHistory(pagination.page + 1);
    }
  };

  const handleFilterChange = (filter: typeof selectedFilter) => {
    setSelectedFilter(filter);
  };

  const renderHistoryItem = ({ item }: { item: CashbackHistoryItem }) => {
    const typeInfo = TYPE_LABELS[item.type];
    const isNegative = item.type === 'withdrawal';
    const formattedDate = new Date(item.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity style={styles.historyCard} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: typeInfo.color + '15' }]}>
          <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
        </View>

        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>{item.description}</Text>
          <Text style={styles.historyDate}>{formattedDate}</Text>
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '15' }]}>
            <Text style={[styles.typeText, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.historyAmount,
            { color: isNegative ? whitelabelConfig.colors.danger : whitelabelConfig.colors.success },
          ]}
        >
          {isNegative ? '-' : '+'}R$ {Math.abs(item.amount).toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={whitelabelConfig.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="gift-outline" size={80} color="#DDD" />
      <Text style={styles.emptyTitle}>Nenhum cashback ainda</Text>
      <Text style={styles.emptyText}>
        Faça compras no marketplace para começar a acumular cashback!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)/marketplace')}
      >
        <Ionicons name="storefront" size={20} color={whitelabelConfig.colors.white} />
        <Text style={styles.shopButtonText}>Ir para o Marketplace</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !stats) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
        <Text style={styles.loadingText}>Carregando carteira...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carteira de Cashback</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Cards */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {stats && (
          <View style={styles.statsContainer}>
            {/* Main Balance Card */}
            <View style={[styles.mainBalanceCard, { backgroundColor: whitelabelConfig.colors.primary }]}>
              <View style={styles.balanceHeader}>
                <Ionicons name="wallet" size={32} color="#FFF" />
                <Text style={styles.balanceLabel}>Saldo Disponível</Text>
              </View>
              <Text style={styles.balanceAmount}>R$ {stats.availableCashback.toFixed(2)}</Text>
              <View style={styles.balanceFooter}>
                <View style={styles.balanceInfo}>
                  <Ionicons name="time-outline" size={16} color="#FFF" />
                  <Text style={styles.balanceInfoText}>
                    Pendente: R$ {stats.pendingCashback.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: whitelabelConfig.colors.success + '15' }]}>
                  <Ionicons name="trending-up" size={24} color={whitelabelConfig.colors.success} />
                </View>
                <Text style={styles.statLabel}>Total Ganho</Text>
                <Text style={styles.statValue}>R$ {stats.totalEarned.toFixed(2)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: whitelabelConfig.colors.primary + '15' }]}>
                  <Ionicons name="cart" size={24} color={whitelabelConfig.colors.primary} />
                </View>
                <Text style={styles.statLabel}>De Compras</Text>
                <Text style={styles.statValue}>R$ {stats.fromPurchases.toFixed(2)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: whitelabelConfig.colors.warning + '15' }]}>
                  <Ionicons name="people" size={24} color={whitelabelConfig.colors.warning} />
                </View>
                <Text style={styles.statLabel}>Indicações</Text>
                <Text style={styles.statValue}>R$ {stats.fromReferrals.toFixed(2)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: whitelabelConfig.colors.danger + '15' }]}>
                  <Ionicons name="arrow-up" size={24} color={whitelabelConfig.colors.danger} />
                </View>
                <Text style={styles.statLabel}>Sacado</Text>
                <Text style={styles.statValue}>R$ {stats.totalWithdrawn.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          >
            {[
              { value: 'all', label: 'Todos' },
              { value: 'purchase', label: 'Compras' },
              { value: 'referral', label: 'Indicações' },
              { value: 'withdrawal', label: 'Saques' },
              { value: 'bonus', label: 'Bônus' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.value && styles.filterChipActive,
                ]}
                onPress={() => handleFilterChange(filter.value as typeof selectedFilter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter.value && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* History List */}
        <View style={styles.historySection}>
          {history.length > 0 ? (
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListFooterComponent={renderFooter}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
            />
          ) : (
            renderEmpty()
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whitelabelConfig.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: whitelabelConfig.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: whitelabelConfig.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  mainBalanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceInfoText: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
  },
  filtersSection: {
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: whitelabelConfig.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filtersList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: whitelabelConfig.colors.border,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: whitelabelConfig.colors.primary + '15',
    borderColor: whitelabelConfig.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: whitelabelConfig.colors.textSecondary,
  },
  filterChipTextActive: {
    color: whitelabelConfig.colors.primary,
    fontWeight: '600',
  },
  historySection: {
    padding: 20,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
    gap: 4,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: whitelabelConfig.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: whitelabelConfig.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

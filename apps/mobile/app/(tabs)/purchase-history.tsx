import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter } from 'expo-router';
import { purchaseService } from '@/services/purchaseService';
import type { Purchase, PurchaseStatus } from '@/types/purchase';

const FILTER_OPTIONS: { label: string; value: PurchaseStatus | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Concluídas', value: 'completed' },
  { label: 'Canceladas', value: 'cancelled' },
];

export default function PurchaseHistory() {
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PurchaseStatus | 'all'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadPurchases(1);
  }, [selectedFilter]);

  const loadPurchases = async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await purchaseService.listPurchases({
        page,
        limit: pagination.limit,
        status: selectedFilter === 'all' ? undefined : selectedFilter,
      });

      if (response.success && response.data) {
        if (page === 1) {
          setPurchases(response.data.purchases);
        } else {
          setPurchases((prev) => [...prev, ...response.data!.purchases]);
        }
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPurchases(1);
  }, [selectedFilter]);

  const loadMore = () => {
    if (!loadingMore && pagination.page < pagination.totalPages) {
      loadPurchases(pagination.page + 1);
    }
  };

  const handleFilterChange = (filter: PurchaseStatus | 'all') => {
    setSelectedFilter(filter);
  };

  const handlePurchasePress = (purchase: Purchase) => {
    router.push({
      pathname: '/(tabs)/purchase-detail',
      params: { purchaseId: purchase.id },
    });
  };

  const getStatusInfo = (status: PurchaseStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendente',
          color: whitelabelConfig.colors.warning,
          icon: 'time-outline' as const,
          bgColor: whitelabelConfig.colors.warning + '15',
        };
      case 'confirmed':
        return {
          label: 'Confirmada',
          color: whitelabelConfig.colors.primary,
          icon: 'checkmark-circle-outline' as const,
          bgColor: whitelabelConfig.colors.primary + '15',
        };
      case 'completed':
        return {
          label: 'Concluída',
          color: whitelabelConfig.colors.success,
          icon: 'checkmark-done-circle-outline' as const,
          bgColor: whitelabelConfig.colors.success + '15',
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          color: whitelabelConfig.colors.danger,
          icon: 'close-circle-outline' as const,
          bgColor: whitelabelConfig.colors.danger + '15',
        };
    }
  };

  const renderPurchaseCard = ({ item }: { item: Purchase }) => {
    const statusInfo = getStatusInfo(item.status);
    const formattedDate = new Date(item.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.purchaseCard}
        onPress={() => handlePurchasePress(item)}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        {item.product && (
          <Image
            source={{
              uri: item.product.images[0] || 'https://via.placeholder.com/80',
            }}
            style={styles.productImage}
          />
        )}

        <View style={styles.purchaseContent}>
          {/* Product Name */}
          {item.product && (
            <Text style={styles.productName} numberOfLines={1}>
              {item.product.name}
            </Text>
          )}

          {/* Purchase Info */}
          <View style={styles.infoRow}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Price and Cashback */}
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Total</Text>
              <Text style={styles.amountValue}>R$ {item.totalAmount.toFixed(2)}</Text>
            </View>

            {item.consumerCashback > 0 && (
              <View style={styles.cashbackContainer}>
                <Ionicons name="gift" size={16} color={whitelabelConfig.colors.success} />
                <View>
                  <Text style={styles.cashbackLabel}>Cashback</Text>
                  <Text style={styles.cashbackValue}>
                    R$ {item.consumerCashback.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cart-outline" size={80} color="#DDD" />
      <Text style={styles.emptyTitle}>Nenhuma compra encontrada</Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all'
          ? 'Você ainda não fez nenhuma compra.'
          : `Você não tem compras ${FILTER_OPTIONS.find((f) => f.value === selectedFilter)?.label.toLowerCase()}.`}
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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={whitelabelConfig.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Compras</Text>
        <Text style={styles.headerSubtitle}>
          {pagination.total} compra{pagination.total !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => handleFilterChange(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Purchase List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
          <Text style={styles.loadingText}>Carregando compras...</Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          renderItem={renderPurchaseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            purchases.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whitelabelConfig.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: whitelabelConfig.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: whitelabelConfig.colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
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
  listContent: {
    paddingVertical: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: whitelabelConfig.colors.textSecondary,
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: whitelabelConfig.colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: whitelabelConfig.colors.border,
  },
  purchaseContent: {
    flex: 1,
    gap: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.primary,
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashbackLabel: {
    fontSize: 10,
    color: whitelabelConfig.colors.textSecondary,
  },
  cashbackValue: {
    fontSize: 13,
    fontWeight: '600',
    color: whitelabelConfig.colors.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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

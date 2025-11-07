import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { purchaseService } from '@/services/purchaseService';
import type { Purchase } from '@/types/purchase';

export default function PurchaseDetail() {
  const router = useRouter();
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (purchaseId) {
      loadPurchase();
    }
  }, [purchaseId]);

  const loadPurchase = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getPurchaseById(purchaseId);

      if (response.success && response.data) {
        setPurchase(response.data);
      }
    } catch (error) {
      console.error('Error loading purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendente',
          color: whitelabelConfig.colors.warning,
          icon: 'time-outline',
        };
      case 'confirmed':
        return {
          label: 'Confirmada',
          color: whitelabelConfig.colors.primary,
          icon: 'checkmark-circle-outline',
        };
      case 'completed':
        return {
          label: 'Concluída',
          color: whitelabelConfig.colors.success,
          icon: 'checkmark-done-circle-outline',
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          color: whitelabelConfig.colors.danger,
          icon: 'close-circle-outline',
        };
      default:
        return {
          label: status,
          color: whitelabelConfig.colors.textSecondary,
          icon: 'help-circle-outline',
        };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
      </View>
    );
  }

  if (!purchase) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Compra não encontrada</Text>
      </View>
    );
  }

  const statusInfo = getStatusInfo(purchase.status);
  const formattedDate = new Date(purchase.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Compra</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
            <Ionicons name={statusInfo.icon as any} size={24} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Product Info */}
        {purchase.product && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produto</Text>
            <View style={styles.productCard}>
              <Image
                source={{
                  uri: purchase.product.images[0] || 'https://via.placeholder.com/100',
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {purchase.product.name}
                </Text>
                <Text style={styles.productCategory}>{purchase.product.category}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Purchase Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes da Transação</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valor Total</Text>
              <Text style={styles.detailValue}>R$ {purchase.totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID da Compra</Text>
              <Text style={styles.detailValueSmall} numberOfLines={1}>
                {purchase.id}
              </Text>
            </View>
            {purchase.txHash && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hash da Transação</Text>
                  <Text style={styles.detailValueSmall} numberOfLines={1}>
                    {purchase.txHash}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Cashback Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cashback</Text>
          <View style={styles.cashbackCard}>
            <View style={styles.cashbackRow}>
              <Ionicons
                name="gift"
                size={32}
                color={whitelabelConfig.colors.success}
              />
              <View style={styles.cashbackInfo}>
                <Text style={styles.cashbackLabel}>Você ganhou</Text>
                <Text style={styles.cashbackValue}>
                  R$ {purchase.consumerCashback.toFixed(2)}
                </Text>
              </View>
            </View>
            <Text style={styles.cashbackNote}>
              {purchase.status === 'completed'
                ? 'Cashback disponível na sua carteira'
                : 'Cashback será creditado após confirmação da compra'}
            </Text>
          </View>
        </View>

        {/* Merchant Info */}
        {purchase.merchant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vendedor</Text>
            <View style={styles.merchantCard}>
              <View style={styles.merchantHeader}>
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={whitelabelConfig.colors.primary}
                />
                <Text style={styles.merchantName}>
                  {purchase.merchant.firstName} {purchase.merchant.lastName}
                </Text>
              </View>
              <Text style={styles.merchantEmail}>{purchase.merchant.email}</Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: whitelabelConfig.colors.success },
                ]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Compra realizada</Text>
                <Text style={styles.timelineDate}>
                  {new Date(purchase.createdAt).toLocaleString('pt-BR')}
                </Text>
              </View>
            </View>

            {purchase.status !== 'pending' && (
              <View style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor:
                        purchase.status === 'cancelled'
                          ? whitelabelConfig.colors.danger
                          : whitelabelConfig.colors.success,
                    },
                  ]}
                />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    {purchase.status === 'cancelled' ? 'Compra cancelada' : 'Compra confirmada'}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {new Date(purchase.updatedAt).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/marketplace')}
        >
          <Ionicons name="cart-outline" size={20} color={whitelabelConfig.colors.white} />
          <Text style={styles.buttonText}>Continuar Comprando</Text>
        </TouchableOpacity>
      </View>
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
  errorText: {
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
  statusCard: {
    backgroundColor: whitelabelConfig.colors.white,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: whitelabelConfig.colors.white,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: whitelabelConfig.colors.border,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
  },
  detailsCard: {
    backgroundColor: whitelabelConfig.colors.white,
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
  },
  detailValueSmall: {
    fontSize: 12,
    color: whitelabelConfig.colors.text,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: whitelabelConfig.colors.border,
    marginVertical: 8,
  },
  cashbackCard: {
    backgroundColor: whitelabelConfig.colors.success + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.success + '30',
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackLabel: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 2,
  },
  cashbackValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.success,
  },
  cashbackNote: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
    fontStyle: 'italic',
  },
  merchantCard: {
    backgroundColor: whitelabelConfig.colors.white,
    padding: 16,
    borderRadius: 12,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
  },
  merchantEmail: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
  },
  timeline: {
    backgroundColor: whitelabelConfig.colors.white,
    padding: 16,
    borderRadius: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: whitelabelConfig.colors.white,
    borderTopWidth: 1,
    borderTopColor: whitelabelConfig.colors.border,
    paddingBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: whitelabelConfig.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { productService } from '@/services/productService';
import { purchaseService } from '@/services/purchaseService';
import { cashbackService } from '@/services/cashbackService';
import type { Product } from '@/types/product';
import type { CashbackDistribution } from '@/types/cashback';

const { width } = Dimensions.get('window');

export default function ProductDetail() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cashbackPreview, setCashbackPreview] = useState<CashbackDistribution | null>(
    null
  );

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      calculateCashback();
    }
  }, [product, quantity]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(productId);

      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        Alert.alert('Erro', 'Produto não encontrado');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Erro', 'Não foi possível carregar o produto');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const calculateCashback = async () => {
    if (!product) return;

    try {
      const totalAmount = product.price * quantity;
      const response = await cashbackService.calculateCashback({
        totalAmount,
        cashbackPercentage: product.cashbackPercentage,
      });

      if (response.success && response.data) {
        setCashbackPreview(response.data);
      }
    } catch (error) {
      console.error('Error calculating cashback:', error);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;

    if (product.stock < quantity) {
      Alert.alert('Estoque insuficiente', 'A quantidade solicitada não está disponível');
      return;
    }

    try {
      setPurchasing(true);

      const response = await purchaseService.createPurchase({
        productId: product.id,
        quantity,
      });

      if (response.success && response.data) {
        Alert.alert(
          'Compra realizada!',
          `Você receberá R$ ${response.data.cashbackDistribution.consumer.toFixed(2)} de cashback!`,
          [
            {
              text: 'Ver compra',
              onPress: () => {
                router.push({
                  pathname: '/(tabs)/purchase-detail',
                  params: { purchaseId: response.data!.purchase.id },
                });
              },
            },
            {
              text: 'Continuar comprando',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível processar a compra');
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar a compra');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Produto não encontrado</Text>
      </View>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image
          source={{ uri: product.images[0] || 'https://via.placeholder.com/400' }}
          style={styles.productImage}
        />

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <View style={styles.productHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            {product.stock > 0 ? (
              <View style={styles.stockBadge}>
                <Ionicons name="checkmark-circle" size={16} color={whitelabelConfig.colors.success} />
                <Text style={styles.stockText}>{product.stock} disponíveis</Text>
              </View>
            ) : (
              <View style={[styles.stockBadge, styles.outOfStock]}>
                <Ionicons name="close-circle" size={16} color={whitelabelConfig.colors.danger} />
                <Text style={[styles.stockText, styles.outOfStockText]}>Esgotado</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          {/* Price and Cashback */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Preço unitário</Text>
              <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
            </View>
            <View style={styles.cashbackCard}>
              <View style={styles.cashbackHeader}>
                <Ionicons name="gift" size={20} color={whitelabelConfig.colors.success} />
                <Text style={styles.cashbackLabel}>Cashback</Text>
              </View>
              <Text style={styles.cashbackValue}>{product.cashbackPercentage}%</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantidade</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? '#CCC' : whitelabelConfig.colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    quantity >= product.stock ? '#CCC' : whitelabelConfig.colors.primary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cashback Preview */}
          {cashbackPreview && (
            <View style={styles.cashbackPreview}>
              <Text style={styles.cashbackPreviewTitle}>Você receberá de cashback:</Text>
              <View style={styles.cashbackPreviewRow}>
                <Ionicons name="gift" size={24} color={whitelabelConfig.colors.success} />
                <Text style={styles.cashbackPreviewValue}>
                  R$ {cashbackPreview.consumerCashback.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.cashbackPreviewNote}>
                Cashback disponível após confirmação da compra
              </Text>
            </View>
          )}

          {/* Merchant Info */}
          {product.merchant && (
            <View style={styles.merchantContainer}>
              <Text style={styles.merchantLabel}>Vendido por</Text>
              <Text style={styles.merchantName}>
                {product.merchant.firstName} {product.merchant.lastName}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>R$ {totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.buyButton,
            (product.stock === 0 || purchasing) && styles.buyButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={product.stock === 0 || purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color={whitelabelConfig.colors.white} />
          ) : (
            <>
              <Ionicons name="cart" size={20} color={whitelabelConfig.colors.white} />
              <Text style={styles.buyButtonText}>
                {product.stock === 0 ? 'Esgotado' : 'Comprar Agora'}
              </Text>
            </>
          )}
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
  productImage: {
    width: width,
    height: width,
    backgroundColor: whitelabelConfig.colors.border,
  },
  contentContainer: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: whitelabelConfig.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: whitelabelConfig.colors.primary,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
    color: whitelabelConfig.colors.success,
  },
  outOfStock: {},
  outOfStockText: {
    color: whitelabelConfig.colors.danger,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 15,
    color: whitelabelConfig.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.primary,
  },
  cashbackCard: {
    backgroundColor: whitelabelConfig.colors.success + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cashbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cashbackLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: whitelabelConfig.colors.success,
  },
  cashbackValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.success,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: whitelabelConfig.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
  cashbackPreview: {
    backgroundColor: whitelabelConfig.colors.success + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.success + '30',
  },
  cashbackPreviewTitle: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 8,
  },
  cashbackPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cashbackPreviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.success,
  },
  cashbackPreviewNote: {
    fontSize: 11,
    color: whitelabelConfig.colors.textSecondary,
    fontStyle: 'italic',
  },
  merchantContainer: {
    borderTopWidth: 1,
    borderTopColor: whitelabelConfig.colors.border,
    paddingTop: 16,
  },
  merchantLabel: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: whitelabelConfig.colors.white,
    borderTopWidth: 1,
    borderTopColor: whitelabelConfig.colors.border,
    paddingBottom: 32,
  },
  totalLabel: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.primary,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: whitelabelConfig.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buyButtonDisabled: {
    backgroundColor: whitelabelConfig.colors.textSecondary,
    opacity: 0.6,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
  },
});

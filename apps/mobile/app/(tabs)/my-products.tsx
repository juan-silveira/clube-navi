import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import productService from '@/src/services/productService';
import { Product } from '@/src/types/product';
import whitelabelConfig from '@/whitelabel.config';

export default function MyProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.listProducts();

      if (response.success && response.data) {
        // Backend já filtra produtos do merchant logado
        const productList = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];
        setProducts(productList);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus produtos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMyProducts();
  }, [loadMyProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMyProducts();
  }, [loadMyProducts]);

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Excluir Produto',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              Alert.alert('Sucesso', 'Produto excluído com sucesso');
              loadMyProducts();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productService.toggleProductStatus(product.id, !product.isActive);
      loadMyProducts();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status do produto');
    }
  };

  const renderProduct = ({ item: product }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Image
          source={{
            uri: product.images?.[0] || 'https://via.placeholder.com/80',
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            R$ {product.price.toFixed(2)}
          </Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                product.isActive ? styles.badgeActive : styles.badgeInactive,
              ]}
            >
              <Text style={styles.badgeText}>
                {product.isActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeStock]}>
              <Text style={styles.badgeText}>
                {product.stock} un.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/edit-product',
              params: { productId: product.id },
            })
          }
        >
          <Ionicons name="create-outline" size={20} color={whitelabelConfig.colors.primary} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleActive(product)}
        >
          <Ionicons
            name={product.isActive ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={whitelabelConfig.colors.primary}
          />
          <Text style={styles.actionButtonText}>
            {product.isActive ? 'Desativar' : 'Ativar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={() => handleDeleteProduct(product.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyStateText}>Você ainda não tem produtos</Text>
      <Text style={styles.emptyStateSubtext}>
        Comece adicionando seu primeiro produto
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => router.push('/(tabs)/create-product')}
      >
        <Text style={styles.addFirstButtonText}>Adicionar Produto</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Produtos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/create-product')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[whitelabelConfig.colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: whitelabelConfig.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.primary,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
  },
  badgeStock: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: whitelabelConfig.colors.primary,
    fontWeight: '500',
  },
  actionButtonDanger: {},
  actionButtonTextDanger: {
    color: '#ef4444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: whitelabelConfig.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

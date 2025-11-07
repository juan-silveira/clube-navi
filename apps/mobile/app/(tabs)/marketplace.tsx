import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter } from 'expo-router';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product';

export default function Marketplace() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Carregar dados em paralelo
      const [productsRes, featuredRes, categoriesRes] = await Promise.all([
        productService.listProducts({ limit: 20 }),
        productService.getFeaturedProducts({ limit: 5, sortBy: 'cashback' }),
        productService.getCategories(),
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data.products);
      }

      if (featuredRes.success && featuredRes.data) {
        setFeaturedProducts(featuredRes.data);
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInitialData();
      return;
    }

    try {
      setLoading(true);
      const response = await productService.searchProducts(searchQuery);

      if (response.success && response.data) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category: string) => {
    try {
      setSelectedCategory(category);
      setLoading(true);

      const response = await productService.getProductsByCategory(category);

      if (response.success && response.data) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/(tabs)/product-detail',
      params: { productId: product.id },
    });
  };

  const renderFeaturedProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{ uri: item.images[0] || 'https://via.placeholder.com/300' }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredPrice}>
            R$ {item.price.toFixed(2)}
          </Text>
          <View style={styles.cashbackBadge}>
            <Ionicons name="gift" size={12} color={whitelabelConfig.colors.white} />
            <Text style={styles.cashbackText}>{item.cashbackPercentage}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.productFooter}>
          <View>
            <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
            <View style={styles.productCashback}>
              <Ionicons name="gift-outline" size={14} color={whitelabelConfig.colors.success} />
              <Text style={styles.productCashbackText}>
                {item.cashbackPercentage}% cashback
              </Text>
            </View>
          </View>
          {item.stock > 0 ? (
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>{item.stock} un.</Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, styles.outOfStock]}>
              <Text style={[styles.stockText, styles.outOfStockText]}>Esgotado</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && products.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadInitialData();
              }}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Produtos em Destaque */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Em Destaque</Text>
            <FlatList
              horizontal
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Categorias */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === null && styles.categoryChipActive,
                ]}
                onPress={() => {
                  setSelectedCategory(null);
                  loadInitialData();
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === null && styles.categoryChipTextActive,
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Lista de Produtos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory}` : 'Todos os Produtos'}
          </Text>
          {products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productsRow}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>Nenhum produto encontrado</Text>
            </View>
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: whitelabelConfig.colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: whitelabelConfig.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 16,
  },
  featuredList: {
    gap: 16,
  },
  featuredCard: {
    width: 280,
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    backgroundColor: whitelabelConfig.colors.border,
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.primary,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: whitelabelConfig.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: whitelabelConfig.colors.white,
  },
  categoriesContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: whitelabelConfig.colors.border,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: whitelabelConfig.colors.primary + '15',
    borderColor: whitelabelConfig.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: whitelabelConfig.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: whitelabelConfig.colors.primary,
    fontWeight: '600',
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: whitelabelConfig.colors.border,
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
    minHeight: 36,
  },
  productCategory: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.primary,
    marginBottom: 2,
  },
  productCashback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productCashbackText: {
    fontSize: 11,
    color: whitelabelConfig.colors.success,
    fontWeight: '500',
  },
  stockBadge: {
    backgroundColor: whitelabelConfig.colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    color: whitelabelConfig.colors.primary,
  },
  outOfStock: {
    backgroundColor: whitelabelConfig.colors.textSecondary + '15',
  },
  outOfStockText: {
    color: whitelabelConfig.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: whitelabelConfig.colors.textSecondary,
  },
});

import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRef, useEffect } from 'react';

export default function Dashboard() {
  const bannerScrollRef = useRef<ScrollView>(null);
  const scrollPosition = useRef(0);
  const categories = ['Tudo', 'Eletrônicos', 'Moda', 'Casa', 'Esportes', 'Livros'];

  const quickAccess = [
    { icon: 'pricetag', label: 'Ofertas', color: '#FF9500' },
    { icon: 'card', label: 'Cartão', color: '#34C759' },
    { icon: 'gift', label: 'Cupons', color: '#5856D6' },
    { icon: 'wallet', label: 'Carteira', color: '#007AFF' },
    { icon: 'cash', label: 'Cashback', color: '#FF2D55' },
    { icon: 'ticket', label: 'Ingressos', color: '#FFD60A' },
    { icon: 'restaurant', label: 'Alimentação', color: '#FF9500' },
    { icon: 'cart', label: 'Mercado', color: '#34C759' },
  ];

  const banners = [
    { id: 1, title: 'OFERTAS ESPECIAIS', subtitle: 'Até 45% OFF', color: whitelabelConfig.colors.primary },
    { id: 2, title: 'BLACK FRIDAY', subtitle: 'Até 70% OFF', color: '#000000' },
    { id: 3, title: 'FRETE GRÁTIS', subtitle: 'Em compras acima de R$ 99', color: '#34C759' },
    { id: 4, title: 'CUPOM R$ 50', subtitle: 'Para primeira compra', color: '#FF9500' },
  ];

  // Criar array infinito: duplica os banners 3 vezes para scroll infinito
  const infiniteBanners = [...banners, ...banners, ...banners];
  const BANNER_WIDTH = 316; // 300 + 16 margin

  useEffect(() => {
    // Iniciar no meio do array infinito
    setTimeout(() => {
      bannerScrollRef.current?.scrollTo({ x: banners.length * BANNER_WIDTH, animated: false });
    }, 100);

    let interval: NodeJS.Timeout;

    // Aguardar 30 segundos antes de iniciar o auto-scroll
    const startTimeout = setTimeout(() => {
      // Auto-scroll dos banners a cada 5 segundos
      interval = setInterval(() => {
        scrollPosition.current += 1;
        const newPosition = (scrollPosition.current % banners.length) * BANNER_WIDTH + banners.length * BANNER_WIDTH;
        bannerScrollRef.current?.scrollTo({ x: newPosition, animated: true });
      }, 5000);
    }, 30000);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleBannerScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const totalWidth = banners.length * BANNER_WIDTH;

    // Quando chega no final, volta para o início
    if (contentOffsetX >= totalWidth * 2) {
      bannerScrollRef.current?.scrollTo({ x: totalWidth, animated: false });
      scrollPosition.current = 0;
    }
    // Quando chega no início, vai para o final
    else if (contentOffsetX <= 0) {
      bannerScrollRef.current?.scrollTo({ x: totalWidth, animated: false });
      scrollPosition.current = 0;
    }
  };

  const products = [
    { id: 1, title: 'Produto Exemplo 1', price: 'R$ 99,90', discount: '15% OFF', image: 'https://via.placeholder.com/150' },
    { id: 2, title: 'Produto Exemplo 2', price: 'R$ 149,90', discount: '20% OFF', image: 'https://via.placeholder.com/150' },
    { id: 3, title: 'Produto Exemplo 3', price: 'R$ 79,90', discount: '10% OFF', image: 'https://via.placeholder.com/150' },
    { id: 4, title: 'Produto Exemplo 4', price: 'R$ 199,90', discount: '25% OFF', image: 'https://via.placeholder.com/150' },
  ];

  return (
    <View style={styles.container}>
      {/* Header Amarelo */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar no ${whitelabelConfig.branding.companyName}`}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#FFFFFF" />
          <Text style={styles.locationText}>Rua Exemplo, 123</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Categorias Horizontais */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                index === 0 && styles.categoryButtonActive
              ]}
            >
              <Text style={[
                styles.categoryText,
                index === 0 && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Banner Promocional - Carousel Infinito */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={BANNER_WIDTH}
            snapToAlignment="start"
            onMomentumScrollEnd={handleBannerScroll}
          >
            {infiniteBanners.map((banner, index) => (
              <TouchableOpacity
                key={`${banner.id}-${index}`}
                style={[styles.banner, { backgroundColor: banner.color }]}
              >
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Acesso Rápido - Scroll Horizontal */}
        <View style={styles.quickAccessSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAccessContainer}
          >
            {quickAccess.map((item, index) => (
              <TouchableOpacity key={index} style={styles.quickAccessItem}>
                <View style={[styles.quickAccessIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Seção de Produtos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas do dia</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  <Text style={styles.productDiscount}>{product.discount}</Text>
                  <Text style={styles.freeShipping}>Frete grátis</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Segunda Seção */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recomendados para você</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  <Text style={styles.productDiscount}>{product.discount}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: whitelabelConfig.colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: whitelabelConfig.colors.white,
    fontSize: 12,
    marginLeft: 4,
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: whitelabelConfig.colors.white,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  categoryButtonActive: {
    backgroundColor: whitelabelConfig.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: whitelabelConfig.colors.text,
  },
  categoryTextActive: {
    color: whitelabelConfig.colors.white,
    fontWeight: '600',
  },
  bannerContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    backgroundColor: whitelabelConfig.colors.background,
  },
  banner: {
    width: 300,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: whitelabelConfig.colors.white,
  },
  quickAccessSection: {
    backgroundColor: whitelabelConfig.colors.white,
    paddingVertical: 16,
    marginBottom: 8,
  },
  quickAccessContainer: {
    paddingHorizontal: 16,
  },
  quickAccessItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  quickAccessIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    color: whitelabelConfig.colors.text,
    textAlign: 'center',
    maxWidth: 80,
  },
  section: {
    backgroundColor: whitelabelConfig.colors.white,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: whitelabelConfig.colors.primary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  productCard: {
    width: '48%',
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 8,
    margin: '1%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    color: whitelabelConfig.colors.text,
    marginBottom: 8,
    height: 40,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  productDiscount: {
    fontSize: 12,
    color: whitelabelConfig.colors.success,
    fontWeight: '600',
    marginBottom: 4,
  },
  freeShipping: {
    fontSize: 12,
    color: whitelabelConfig.colors.success,
  },
});

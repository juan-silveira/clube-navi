import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function Cashback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentPath = usePathname();

  // Deserializa o breadcrumb recebido
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  const [searchText, setSearchText] = useState('');

  const handleBack = () => {
    const backPath = getBackPath(currentBreadcrumb);
    if (backPath) {
      router.push({
        pathname: backPath.path as any,
        params: backPath.params || {},
      });
    } else {
      router.push('/');
    }
  };

  // Dados mockados - virão do backend futuramente
  const highlights = [
    {
      id: 1,
      title: 'até 15% de Cashback',
      brand: 'GOL',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
      color: '#FF6B00',
    },
    {
      id: 2,
      title: 'até 7.5% de Cashback',
      brand: 'C&A',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      color: '#E50914',
    },
  ];

  const giftCards = [
    { id: 1, name: 'Netshoes', value: 'A2# R$ 200,00', color: '#6B2F8F' },
    { id: 2, name: 'Tinder', value: 'A# R$ 150,00', color: '#FF6B6B' },
  ];

  const cashbackBrands = [
    { id: 1, name: 'Electrolux', logo: 'https://logo.clearbit.com/electrolux.com' },
    { id: 2, name: 'Telhanorte', logo: 'https://logo.clearbit.com/telhanorte.com.br' },
    { id: 3, name: 'Consul', logo: 'https://logo.clearbit.com/consul.com.br' },
  ];

  const partners = [
    { id: 1, name: 'Pague Menos', logo: 'https://logo.clearbit.com/paguemenos.com.br' },
    { id: 2, name: 'Carrefour', logo: 'https://logo.clearbit.com/carrefour.com.br' },
    { id: 3, name: 'Pontofrio', logo: 'https://logo.clearbit.com/pontofrio.com.br' },
  ];

  const unbeatable = [
    { id: 1, name: 'Central Ar BR', cashback: '1.9%', icon: '❄️' },
    { id: 2, name: 'Pontofrio BR', cashback: '5.2%', icon: '🔌' },
    { id: 3, name: 'Casas Bahia BR', cashback: '4.5%', icon: '🏠' },
    { id: 4, name: 'Posthaus BR', cashback: '8.2%', icon: '👗' },
    { id: 5, name: 'Consul BR', cashback: '3.2%', icon: '🔧' },
    { id: 6, name: 'C&A BR', cashback: '7.5%', icon: '👕' },
    { id: 7, name: 'Nike BR', cashback: '4.5%', icon: '👟' },
    { id: 8, name: 'Natura BR', cashback: '6.8%', icon: '💄' },
    { id: 9, name: 'oBoticario BR', cashback: '5.5%', icon: '🧴' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cashback</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar"
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Ionicons name="search-outline" size={20} color={whitelabelConfig.colors.primary} />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: whitelabelConfig.colors.primary }]}
            onPress={() => {
              const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
              router.push({
                pathname: '/(tabs)/cashback-statement',
                params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
              });
            }}
          >
            <Ionicons name="receipt-outline" size={20} color="#FFF" />
            <Text style={styles.filterButtonText}>Extrato</Text>
          </TouchableOpacity>
        </View>

        {/* Destaques */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destaques</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {highlights.map((highlight) => (
              <TouchableOpacity
                key={highlight.id}
                style={[styles.highlightCard, { backgroundColor: highlight.color }]}
              >
                <View style={styles.highlightOverlay}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightBrand}>{highlight.brand}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Gift Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gift cards</Text>
            <TouchableOpacity
              style={[styles.seeMoreButton, { borderColor: whitelabelConfig.colors.primary }]}
            >
              <Text style={[styles.seeMoreText, { color: whitelabelConfig.colors.primary }]}>
                Ver mais
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {giftCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.giftCard, { backgroundColor: card.color }]}
              >
                <Text style={styles.giftCardName}>{card.name}</Text>
                <Text style={styles.giftCardValue}>{card.value}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cashback */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cashback</Text>
            <TouchableOpacity
              style={[styles.seeMoreButton, { borderColor: whitelabelConfig.colors.primary }]}
            >
              <Text style={[styles.seeMoreText, { color: whitelabelConfig.colors.primary }]}>
                Ver mais
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {cashbackBrands.map((brand) => (
              <TouchableOpacity key={brand.id} style={styles.brandCard}>
                <View style={styles.brandLogo}>
                  <Text style={styles.brandInitial}>{brand.name.charAt(0)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nossos Parceiros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossos Parceiros</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {partners.map((partner) => (
              <TouchableOpacity key={partner.id} style={styles.partnerCard}>
                <View style={styles.partnerLogo}>
                  <Text style={styles.partnerInitial}>{partner.name.charAt(0)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Ofertas Imperdíveis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas imperdíveis</Text>
            <TouchableOpacity
              style={[styles.seeMoreButton, { borderColor: whitelabelConfig.colors.primary }]}
            >
              <Text style={[styles.seeMoreText, { color: whitelabelConfig.colors.primary }]}>
                Ver mais
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.offersList}>
            {unbeatable.map((offer) => (
              <TouchableOpacity key={offer.id} style={styles.offerCard}>
                <View style={styles.offerLeft}>
                  <View style={styles.offerIcon}>
                    <Text style={styles.offerIconText}>{offer.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerName}>{offer.name}</Text>
                    <View style={[styles.cashbackBadge, { backgroundColor: whitelabelConfig.colors.primary }]}>
                      <Text style={styles.cashbackBadgeText}>{offer.cashback}</Text>
                      <Text style={styles.cashbackBadgeLabel}>Cashback</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={whitelabelConfig.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    paddingHorizontal: 20,
  },
  seeMoreButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  highlightCard: {
    width: 280,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  highlightOverlay: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  highlightBrand: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 4,
  },
  giftCard: {
    width: 200,
    height: 100,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  giftCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  giftCardValue: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  brandCard: {
    width: 140,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#666',
  },
  partnerCard: {
    width: 120,
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  partnerLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },
  offersList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  offerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  offerIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerIconText: {
    fontSize: 24,
  },
  offerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  cashbackBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  cashbackBadgeLabel: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 40,
  },
});

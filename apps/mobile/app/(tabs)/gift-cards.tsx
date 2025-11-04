import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

export default function GiftCards() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const returnTo = (params.returnTo as string) || '/(tabs)/index';

  const [searchText, setSearchText] = useState('');

  // Dados mockados - virão do backend futuramente
  const giftCards = [
    { id: 1, name: 'Nike', image: 'https://logo.clearbit.com/nike.com', color: '#111' },
    { id: 2, name: 'Tinder', image: 'https://logo.clearbit.com/tinder.com', color: '#FF6B6B' },
    { id: 3, name: 'Centauro', image: 'https://logo.clearbit.com/centauro.com.br', color: '#E50914' },
    { id: 4, name: 'RiHappy', image: 'https://logo.clearbit.com/rihappy.com.br', color: '#FFD700' },
    { id: 5, name: 'Cacau Show', image: 'https://logo.clearbit.com/cacaushow.com.br', color: '#8B4513' },
    { id: 6, name: 'Grand Cru', image: 'https://logo.clearbit.com/grandcru.com.br', color: '#8B0000' },
    { id: 7, name: 'PlayStation Store', image: 'https://logo.clearbit.com/playstation.com', color: '#003087' },
    { id: 8, name: 'McDonald\'s', image: 'https://logo.clearbit.com/mcdonalds.com', color: '#FFC72C' },
    { id: 9, name: 'Spotify Premium', image: 'https://logo.clearbit.com/spotify.com', color: '#1DB954' },
    { id: 10, name: 'Netflix', image: 'https://logo.clearbit.com/netflix.com', color: '#E50914' },
    { id: 11, name: 'Uber', image: 'https://logo.clearbit.com/uber.com', color: '#000' },
    { id: 12, name: 'iFood', image: 'https://logo.clearbit.com/ifood.com.br', color: '#EA1D2C' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={() => {
          try {
            router.replace(returnTo || '/(tabs)/index');
          } catch {
            router.replace('/(tabs)/index');
          }
        }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vale Presentes</Text>
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
        </View>

        {/* Gift Cards Grid */}
        <View style={styles.section}>
          <View style={styles.giftCardsGrid}>
            {giftCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.giftCardItem, { backgroundColor: card.color }]}
              >
                <Text style={styles.giftCardName}>{card.name}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  searchContainer: {
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
  section: {
    paddingHorizontal: 20,
  },
  giftCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  giftCardItem: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});

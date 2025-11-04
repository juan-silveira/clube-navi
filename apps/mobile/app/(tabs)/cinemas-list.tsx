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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, getBackPath } from '@/utils/navigationHelper';

export default function CinemasList() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Deserializa o breadcrumb recebido
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  const [searchText, setSearchText] = useState('');

  // Dados mockados - virão do backend futuramente
  const cinemas = [
    {
      id: 1,
      name: 'Continente Shopping',
      address: 'BR-101, KM 210 - Distrito Industrial',
      distance: '1.5 Km',
      logo: 'https://logo.clearbit.com/cinepolis.com.br',
    },
    {
      id: 2,
      name: 'CINEMARK FLORIPA',
      address: 'ROD JOSE CARLOS DAUX, Nº 283, Compl.: SC 401 3116 AP LOJAS PISO L2',
      distance: '4.8 Km',
      logo: 'https://logo.clearbit.com/cinemark.com.br',
    },
    {
      id: 3,
      name: 'GNC Balneário Shopping',
      address: 'Avenida Praia de Belas, 1181 – Praia de Belas, Porto Alegre – RS, 90110-001',
      distance: '42.1 Km',
      logo: 'https://logo.clearbit.com/gncinemas.com.br',
    },
    {
      id: 4,
      name: 'GNC Neumarkt Shopping',
      address: 'Avenida Praia de Belas, 1181 – Praia de Belas, Porto Alegre – RS, 90110-001',
      distance: '54.2 Km',
      logo: 'https://logo.clearbit.com/gncinemas.com.br',
    },
    {
      id: 5,
      name: 'Norte Shopping Blumenau',
      address: 'Rodovia BR 470, s/n - Sala Comercial 49 a 54 - Salto Norte',
      distance: '58.3 Km',
      logo: 'https://logo.clearbit.com/cinepolis.com.br',
    },
    {
      id: 6,
      name: 'Grupo Cine Rio do Sul',
      address: 'Rua 15 De Novembro, 303, Centro Comercial Dellan',
      distance: '67.3 Km',
      logo: 'https://logo.clearbit.com/grupocine.com.br',
    },
  ];

  const handleBack = () => {
    const backPath = getBackPath(currentBreadcrumb);
    if (backPath) {
      router.push({
        pathname: backPath.path as any,
        params: backPath.params || {},
      });
    } else {
      // Fallback para cinema se não houver breadcrumb
      router.push('/(tabs)/cinema');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#E5E5EA"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Ionicons name="search-outline" size={20} color={whitelabelConfig.colors.primary} />
          </View>
        </View>

        {/* Location Button */}
        <TouchableOpacity style={[styles.locationButton, { backgroundColor: whitelabelConfig.colors.primary }]}>
          <Ionicons name="locate" size={24} color="#FFF" />
          <Text style={styles.locationButtonText}>Usar minha localização atual</Text>
        </TouchableOpacity>

        {/* Cinemas List */}
        <View style={styles.cinemasList}>
          {cinemas.map((cinema) => (
            <View key={cinema.id} style={styles.cinemaCard}>
              <View style={styles.cinemaLogo}>
                <Text style={styles.cinemaLogoText}>{cinema.name.charAt(0)}</Text>
              </View>
              <View style={styles.cinemaInfo}>
                <Text style={styles.cinemaName}>{cinema.name}</Text>
                <Text style={styles.cinemaAddress}>{cinema.address}</Text>
              </View>
              <View style={styles.cinemaRight}>
                <View style={styles.distanceContainer}>
                  <Ionicons name="location" size={16} color={whitelabelConfig.colors.primary} />
                  <Text style={styles.distanceText}>{cinema.distance}</Text>
                </View>
                <TouchableOpacity style={[styles.buyButton, { backgroundColor: whitelabelConfig.colors.primary }]}>
                  <Text style={styles.buyButtonText}>Comprar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#E8E8E8',
  },
  backButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  cinemasList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cinemaCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  cinemaLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },
  cinemaInfo: {
    flex: 1,
  },
  cinemaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cinemaAddress: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  cinemaRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 40,
  },
});

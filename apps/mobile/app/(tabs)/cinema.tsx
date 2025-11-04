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
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function Cinema() {
  const router = useRouter();
  const currentPath = usePathname();
  const params = useLocalSearchParams();

  // Deserializa o breadcrumb recebido
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('tickets');
  const [selectedFilter, setSelectedFilter] = useState('em-cartaz');
  const [cinemasExpanded, setCinemasExpanded] = useState(false);

  // Dados mockados
  const tickets = { current: 0, total: 8 };
  const consumables = { current: 0, total: 8 };

  const filters = [
    { id: 'em-cartaz', label: 'Em cartaz' },
    { id: 'explorar', label: 'Explorar' },
    { id: 'estreias', label: 'Estreias' },
    { id: 'em-breve', label: 'Em breve' },
  ];

  const featuredMovies = [
    { id: 1, title: 'Filme 1', image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop' },
    { id: 2, title: 'Filme 2', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop' },
    { id: 3, title: 'Filme 3', image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop' },
  ];

  const upcomingMovies = [
    { id: 1, title: 'Filme 4', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop' },
    { id: 2, title: 'Filme 5', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop' },
    { id: 3, title: 'Filme 6', image: 'https://images.unsplash.com/photo-1574267432644-f610f5b45110?w=400&h=600&fit=crop' },
  ];

  const nearbyCinemas = [
    {
      id: 1,
      name: 'Continente Shopping',
      address: 'BR-101, KM 210 - Distrito Industrial',
      distance: '1.5 Km',
    },
    {
      id: 2,
      name: 'CINEMARK FLORIPA',
      address: 'ROD JOSE CARLOS DAUX, Nº 283, Compl.: SC 401 3116 AP LOJAS PISO L2',
      distance: '4.8 Km',
    },
    {
      id: 3,
      name: 'GNC Balneário Shopping',
      address: 'Avenida Praia de Belas, 1181 – Praia de Belas, Porto Alegre – RS, 90110-001',
      distance: '42.1 Km',
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
      // Fallback para home se não houver breadcrumb
      router.push('/');
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
        {/* Search and Actions */}
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
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="cart-outline" size={28} color={whitelabelConfig.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ticket-outline" size={28} color={whitelabelConfig.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'tickets' && styles.tabActive]}
            onPress={() => setSelectedTab('tickets')}
          >
            <Text style={[styles.tabText, selectedTab === 'tickets' && styles.tabTextActive]}>
              Ingressos{' '}
              <Text style={[styles.tabCount, selectedTab === 'tickets' && styles.tabCountActive]}>
                {tickets.current}/{tickets.total}
              </Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'consumables' && styles.tabActive]}
            onPress={() => setSelectedTab('consumables')}
          >
            <Text style={[styles.tabText, selectedTab === 'consumables' && styles.tabTextActive]}>
              Consumíveis{' '}
              <Text style={[styles.tabCount, selectedTab === 'consumables' && styles.tabCountActive]}>
                {consumables.current}/{consumables.total}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersSection}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterButton, selectedFilter === filter.id && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Movies Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredMoviesScroll}
        >
          {featuredMovies.map((movie) => (
            <TouchableOpacity key={movie.id} style={styles.featuredMovieCard}>
              <Image source={{ uri: movie.image }} style={styles.featuredMoviePoster} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cinemas Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cinemas para você</Text>
            <TouchableOpacity
              style={[styles.seeAllButton, { borderColor: whitelabelConfig.colors.primary }]}
              onPress={() => {
                const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                router.push({
                  pathname: '/(tabs)/cinemas-list',
                  params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
                });
              }}
            >
              <Text style={[styles.seeAllText, { color: whitelabelConfig.colors.primary }]}>
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.cinemaSelector, { backgroundColor: whitelabelConfig.colors.primary }]}
            onPress={() => setCinemasExpanded(!cinemasExpanded)}
          >
            <View style={styles.cinemaSelectorIcon}>
              <Ionicons name="film" size={24} color={whitelabelConfig.colors.primary} />
            </View>
            <Text style={styles.cinemaSelectorText}>Selecione o cinema para comprar</Text>
            <Ionicons name={cinemasExpanded ? "chevron-up" : "chevron-down"} size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Lista de cinemas expansível */}
          {cinemasExpanded && (
            <View style={styles.cinemasExpandedSection}>
              <View style={styles.expandedCityHeader}>
                <Text style={styles.expandedCityText}>São José | 1.5 Km de distância</Text>
              </View>

              {nearbyCinemas.map((cinema) => (
                <TouchableOpacity
                  key={cinema.id}
                  style={styles.expandedCinemaItem}
                  onPress={() => {
                    setCinemasExpanded(false);
                    // Aqui poderia selecionar o cinema
                  }}
                >
                  <View style={styles.expandedCinemaLogo}>
                    <Text style={styles.expandedCinemaLogoText}>{cinema.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.expandedCinemaInfo}>
                    <Text style={styles.expandedCinemaName}>{cinema.name}</Text>
                    <Text style={styles.expandedCinemaAddress}>{cinema.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.expandedSeeAllButton}
                onPress={() => {
                  setCinemasExpanded(false);
                  const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                  router.push({
                    pathname: '/(tabs)/cinemas-list',
                    params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
                  });
                }}
              >
                <Text style={styles.expandedSeeAllButtonText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming Movies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Em breve nos cinemas</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.upcomingMoviesScroll}
          >
            {upcomingMovies.map((movie) => (
              <TouchableOpacity key={movie.id} style={styles.upcomingMovieCard}>
                <Image source={{ uri: movie.image }} style={styles.upcomingMoviePoster} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
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
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1C1C1E',
  },
  tabCount: {
    color: whitelabelConfig.colors.primary,
  },
  tabCountActive: {
    color: whitelabelConfig.colors.primary,
  },
  filtersSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1C1C1E',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#1C1C1E',
  },
  featuredMoviesScroll: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  featuredMovieCard: {
    width: 180,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredMoviePoster: {
    width: '100%',
    height: '100%',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  seeAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cinemaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  cinemaSelectorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  upcomingMoviesScroll: {
    gap: 12,
    marginTop: 16,
  },
  upcomingMovieCard: {
    width: 240,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upcomingMoviePoster: {
    width: '100%',
    height: '100%',
  },
  bottomSpacer: {
    height: 40,
  },
  cinemasExpandedSection: {
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  expandedCityHeader: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  expandedCityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  expandedCinemaItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  expandedCinemaLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedCinemaLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },
  expandedCinemaInfo: {
    flex: 1,
  },
  expandedCinemaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  expandedCinemaAddress: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  expandedSeeAllButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  expandedSeeAllButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
});

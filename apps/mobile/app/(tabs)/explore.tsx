import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

export default function Explore() {
  const popularSearches = [
    'iPhone 15',
    'Notebook',
    'Fone bluetooth',
    'Smart TV',
    'Air Fryer',
    'Tênis Nike',
  ];

  const categories = [
    { id: 1, title: 'Eletrônicos', icon: 'phone-portrait', color: '#007AFF', image: 'https://via.placeholder.com/100' },
    { id: 2, title: 'Moda', icon: 'shirt', color: '#FF9500', image: 'https://via.placeholder.com/100' },
    { id: 3, title: 'Casa e Jardim', icon: 'home', color: '#34C759', image: 'https://via.placeholder.com/100' },
    { id: 4, title: 'Esportes', icon: 'football', color: '#FF3B30', image: 'https://via.placeholder.com/100' },
    { id: 5, title: 'Livros', icon: 'book', color: '#5856D6', image: 'https://via.placeholder.com/100' },
    { id: 6, title: 'Beleza', icon: 'heart', color: '#FF2D55', image: 'https://via.placeholder.com/100' },
    { id: 7, title: 'Brinquedos', icon: 'game-controller', color: '#FFD60A', image: 'https://via.placeholder.com/100' },
    { id: 8, title: 'Automotivo', icon: 'car', color: '#8E8E93', image: 'https://via.placeholder.com/100' },
  ];

  const trendingTopics = [
    { id: 1, title: 'Black Friday 2024', subtitle: 'Ofertas imperdíveis', image: 'https://via.placeholder.com/300x150' },
    { id: 2, title: 'Lançamentos', subtitle: 'Produtos novos', image: 'https://via.placeholder.com/300x150' },
    { id: 3, title: 'Mais vendidos', subtitle: 'Top produtos', image: 'https://via.placeholder.com/300x150' },
  ];

  return (
    <View style={styles.container}>
      {/* Header com busca */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <Text style={styles.headerTitle}>Explorar</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="O que você está procurando?"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons name="scan" size={20} color={whitelabelConfig.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Buscas Populares */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buscas populares</Text>
          <View style={styles.tagsContainer}>
            {popularSearches.map((search, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Ionicons name="trending-up" size={14} color={whitelabelConfig.colors.primary} />
                <Text style={styles.tagText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                  <Ionicons name={category.icon as any} size={32} color={category.color} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Em Alta */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Em alta</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.trendingScroll}
          >
            {trendingTopics.map((topic) => (
              <TouchableOpacity key={topic.id} style={styles.trendingCard}>
                <Image source={{ uri: topic.image }} style={styles.trendingImage} />
                <View style={styles.trendingOverlay}>
                  <Text style={styles.trendingTitle}>{topic.title}</Text>
                  <Text style={styles.trendingSubtitle}>{topic.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Histórico de Busca */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Buscas recentes</Text>
            <TouchableOpacity>
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyContainer}>
            <TouchableOpacity style={styles.historyItem}>
              <Ionicons name="time-outline" size={20} color={whitelabelConfig.colors.textSecondary} />
              <Text style={styles.historyText}>Smart TV 55 polegadas</Text>
              <Ionicons name="close" size={18} color={whitelabelConfig.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyItem}>
              <Ionicons name="time-outline" size={20} color={whitelabelConfig.colors.textSecondary} />
              <Text style={styles.historyText}>Fone de ouvido JBL</Text>
              <Ionicons name="close" size={18} color={whitelabelConfig.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyItem}>
              <Ionicons name="time-outline" size={20} color={whitelabelConfig.colors.textSecondary} />
              <Text style={styles.historyText}>Notebook Gamer</Text>
              <Ionicons name="close" size={18} color={whitelabelConfig.colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: whitelabelConfig.colors.text,
  },
  scanButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: whitelabelConfig.colors.white,
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearText: {
    fontSize: 14,
    color: whitelabelConfig.colors.error,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: whitelabelConfig.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: whitelabelConfig.colors.text,
    marginLeft: 6,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginHorizontal: -8,
  },
  categoryCard: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    color: whitelabelConfig.colors.text,
    textAlign: 'center',
  },
  trendingScroll: {
    marginTop: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  trendingCard: {
    width: 300,
    height: 150,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
    marginBottom: 4,
  },
  trendingSubtitle: {
    fontSize: 14,
    color: whitelabelConfig.colors.white,
  },
  historyContainer: {
    marginTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    color: whitelabelConfig.colors.text,
    marginLeft: 12,
  },
});

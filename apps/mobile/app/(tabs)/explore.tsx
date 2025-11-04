import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function Explore() {
  const router = useRouter();
  const currentPath = usePathname();
  const params = useLocalSearchParams();

  // Deserializa o breadcrumb recebido
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  const productsAndServices = [
    { id: 1, icon: 'film-outline', label: 'Cinema', route: '/(tabs)/cinema', color: whitelabelConfig.colors.primary },
    { id: 2, icon: 'cash-outline', label: 'Cashback', route: '/(tabs)/cashback', color: whitelabelConfig.colors.primary },
    { id: 3, icon: 'gift-outline', label: 'GiftCard', route: '/(tabs)/gift-cards', color: whitelabelConfig.colors.primary },
    { id: 4, icon: 'wifi-outline', label: 'Internet', route: '/(tabs)/internet-management', color: whitelabelConfig.colors.primary },
  ];

  const cinemaCategories = [
    { id: 1, label: 'Em cartaz', route: '/(tabs)/cinema' },
    { id: 2, label: 'Estreias', route: '/(tabs)/cinema' },
    { id: 3, label: 'Em breve', route: '/(tabs)/cinema' },
    { id: 4, label: 'Comprar ingressos', route: '/(tabs)/cinema' },
    { id: 5, label: 'Cinemas perto de você', route: '/(tabs)/cinema' },
    { id: 6, label: 'Vouchers', route: '/(tabs)/cinema' },
    { id: 7, label: 'Explorar', route: '/(tabs)/cinema' },
    { id: 8, label: 'Procurar', route: '/(tabs)/cinema' },
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
      {/* Header com barra de pesquisa */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="O que você está buscando?"
            placeholderTextColor="#999"
          />
          <Ionicons name="search" size={20} color="#999" />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Produtos e serviços */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos e serviços</Text>
          <View style={styles.productsGrid}>
            {productsAndServices.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => {
                  const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                  router.push({
                    pathname: item.route as any,
                    params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
                  });
                }}
              >
                <View style={[styles.productIconContainer, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={32} color={item.color} />
                </View>
                <Text style={styles.productLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navegue pelas categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navegue pelas categorias</Text>

          {/* Cinema Header */}
          <View style={styles.categoryHeader}>
            <Ionicons name="film-outline" size={24} color="#1C1C1E" />
            <Text style={styles.categoryHeaderText}>Cinema</Text>
          </View>

          {/* Lista de categorias */}
          <View style={styles.categoriesList}>
            {cinemaCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => {
                  const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                  router.push({
                    pathname: category.route as any,
                    params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
                  });
                }}
              >
                <Text style={styles.categoryItemText}>{category.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.primary} />
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
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  productIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  bottomSpacer: {
    height: 40,
  },
});

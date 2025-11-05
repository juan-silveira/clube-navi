import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'expo-router';
import { serializeBreadcrumb } from '@/utils/navigationHelper';
import { useState, useEffect } from 'react';
import { blockchainService, BlockchainBalance } from '@/services/blockchain';

const { width } = Dimensions.get('window');

// Imagens dos banners (futuramente virão do S3 via admin)
const BANNER_IMAGES = {
  cashback: require('../../assets/images/banners/cashback.jpg'),
  ofertas: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop',
  valePresente: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop',
};

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();
  const currentPath = usePathname();
  const [balance, setBalance] = useState<BlockchainBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  // Função para buscar saldo
  const fetchBalance = async () => {
    const balanceData = await blockchainService.getCBRLBalance();
    setBalance(balanceData);
  };

  // Função para refresh manual (pull-to-refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  };

  // Buscar saldo da blockchain na montagem do componente
  useEffect(() => {
    const loadInitialBalance = async () => {
      setLoadingBalance(true);
      await fetchBalance();
      setLoadingBalance(false);
    };

    loadInitialBalance();

    // Atualizar saldo a cada 30 segundos
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, []);

  const quickAccessItems = [
    { icon: 'wifi', label: 'Internet', route: '/(tabs)/internet-management' },
    { icon: 'cash', label: 'Cashback', route: '/(tabs)/cashback' },
    { icon: 'gift', label: 'Vale-Presente', route: '/(tabs)/gift-cards' },
    { icon: 'card', label: 'Cartão', route: '/(tabs)/explore' },
  ];

  return (
    <View style={styles.container}>
      {/* Header amarelo com saudação - FIXO */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <View style={styles.avatar}>
              <Text style={[styles.avatarText, { color: whitelabelConfig.colors.primary }]}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.greetingText}>Olá, {firstName}!</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push({
              pathname: '/(tabs)/notifications',
              params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
            })}
          >
            <Ionicons name="notifications-outline" size={28} color="#FFF" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo com scroll */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={whitelabelConfig.colors.primary}
            colors={[whitelabelConfig.colors.primary]}
          />
        }
      >

      {/* Card de saldo disponível */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Ionicons name="wallet-outline" size={20} color={whitelabelConfig.colors.primary} />
            <Text style={styles.balanceTitle}>Saldo disponível</Text>
          </View>
          {loadingBalance ? (
            <ActivityIndicator size="small" color={whitelabelConfig.colors.primary} style={styles.balanceLoader} />
          ) : (
            <Text style={styles.balanceValue}>{balance?.formattedBalance || 'R$ 0,00'}</Text>
          )}
          <Text style={styles.balanceSubtitle}>Saldo em cBRL na blockchain Azore</Text>

          {/* Ações rápidas */}
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={[styles.balanceActionButton, { backgroundColor: whitelabelConfig.colors.primary }]}
              onPress={() => router.push('/deposit')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.balanceActionText}>Depositar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.balanceActionButton}
              onPress={() => router.push('/statement')}
            >
              <Ionicons name="list-outline" size={20} color={whitelabelConfig.colors.primary} />
              <Text style={[styles.balanceActionText, { color: whitelabelConfig.colors.primary }]}>Extrato</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Card de destaque - Gerencie sua Internet */}
      <View style={styles.section}>
        <View style={styles.highlightCard}>
          <View style={styles.highlightLeft}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop' }}
              style={styles.highlightLeftImage}
              resizeMode="cover"
            />
            <View style={styles.highlightLeftOverlay}>
              <Ionicons name="wifi" size={32} color={whitelabelConfig.colors.primary} />
              <Text style={styles.highlightLeftText}>Internet</Text>
            </View>
          </View>
          <View style={styles.highlightRight}>
            <Text style={styles.highlightTitle}>Gerencie sua Internet!</Text>
            <Text style={styles.highlightSubtitle}>
              Veja seus planos, benefícios e faturas em um só lugar.
            </Text>
            <TouchableOpacity
              style={[styles.highlightButton, { backgroundColor: whitelabelConfig.colors.primary }]}
              onPress={() => router.push({
                pathname: '/(tabs)/internet-management',
                params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
              })}
            >
              <Text style={styles.highlightButtonText}>Acessar agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Você pode gostar disso */}
      <View style={styles.quickAccessSection}>
        <View style={styles.quickAccessSectionHeader}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Você pode gostar disso</Text>
            <TouchableOpacity
              style={[styles.exploreBadge, { borderColor: whitelabelConfig.colors.primary }]}
              onPress={() => router.push({
                pathname: '/(tabs)/explore',
                params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
              })}
            >
              <Text style={[styles.exploreBadgeText, { color: whitelabelConfig.colors.primary }]}>Explorar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAccessCarousel}
        >
          {quickAccessItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickAccessButton, { backgroundColor: whitelabelConfig.colors.primary }]}
              onPress={() => router.push({
                pathname: item.route as any,
                params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
              })}
            >
              <Ionicons name={item.icon as any} size={28} color="#FFF" />
              <Text style={styles.quickAccessButtonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Banner grande - Cashback */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.bigBanner}
          onPress={() => router.push({
            pathname: '/(tabs)/explore',
            params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
          })}
        >
          <Image
            source={BANNER_IMAGES.cashback}
            style={styles.bannerImageFull}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* Vantagens exclusivas */}
      <View style={styles.advantagesSection}>
        <View style={styles.advantagesSectionHeader}>
          <Text style={styles.sectionTitle}>Vantagens exclusivas</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.advantagesContainer}
        >
          {/* Card 1 - Cashback */}
          <View style={styles.advantageCard}>
            <View style={styles.advantageLeft}>
              <View style={styles.advantageTextContainer}>
                <Text style={styles.advantageTitle}>Conheça nossas</Text>
                <Text style={styles.advantageTitle}>melhores opções</Text>
                <Text style={styles.advantageSubtitle}>para Cashback!</Text>
              </View>
              <TouchableOpacity
                style={[styles.advantageButton, { borderColor: whitelabelConfig.colors.primary }]}
                onPress={() => router.push({
                  pathname: '/(tabs)/explore',
                  params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
                })}
              >
                <Text style={[styles.advantageButtonText, { color: whitelabelConfig.colors.primary }]}>Ver +</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.advantageRight, { backgroundColor: '#4A90E2' }]}>
              <Text style={styles.advantageEmoji}>🎯</Text>
              <View style={[styles.advantageBadge, { backgroundColor: whitelabelConfig.colors.primary }]}>
                <Text style={styles.advantageBadgeText}>Até 25%</Text>
                <Text style={styles.advantageBadgeSubtext}>de Cashback</Text>
              </View>
            </View>
          </View>

          {/* Card 2 - Lojas */}
          <View style={styles.advantageCard}>
            <View style={styles.advantageLeft}>
              <View style={styles.advantageTextContainer}>
                <Text style={styles.advantageTitle}>Lojas</Text>
                <Text style={styles.advantageTitle}>exclusivas</Text>
                <Text style={styles.advantageSubtitle}>para você!</Text>
              </View>
              <TouchableOpacity
                style={[styles.advantageButton, { borderColor: '#8B5CF6' }]}
                onPress={() => router.push({
                  pathname: '/(tabs)/explore',
                  params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
                })}
              >
                <Text style={[styles.advantageButtonText, { color: '#8B5CF6' }]}>Ver +</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.advantageRight, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.advantageEmoji}>🏪</Text>
            </View>
          </View>

          {/* Card 3 - Vale Presente */}
          <View style={styles.advantageCard}>
            <View style={styles.advantageLeft}>
              <View style={styles.advantageTextContainer}>
                <Text style={styles.advantageTitle}>Vale</Text>
                <Text style={styles.advantageTitle}>Presente</Text>
                <Text style={styles.advantageSubtitle}>especial!</Text>
              </View>
              <TouchableOpacity
                style={[styles.advantageButton, { borderColor: '#FF8C00' }]}
                onPress={() => router.push({
                  pathname: '/(tabs)/gift-cards',
                  params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
                })}
              >
                <Text style={[styles.advantageButtonText, { color: '#FF8C00' }]}>Ver +</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.advantageRight, { backgroundColor: '#FF8C00' }]}>
              <Text style={styles.advantageEmoji}>🎁</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Novidades */}
      <View style={styles.novitiesSection}>
        <View style={styles.novitiesSectionHeader}>
          <Text style={styles.sectionTitle}>Novidades</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.novitiesContainer}
        >
          <TouchableOpacity style={styles.novityCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=400&fit=crop' }}
              style={styles.novityCardImage}
              resizeMode="cover"
            />
            <View style={styles.novityOverlay}>
              <View style={styles.novityTextContainer}>
                <Text style={styles.novitySubtitle}>Assinatura</Text>
                <Text style={styles.novityTitle}>Teste de velocidade</Text>
              </View>
              <TouchableOpacity style={styles.novityDetailsButton}>
                <Ionicons name="document-text-outline" size={18} color="#1C1C1E" />
                <Text style={styles.novityDetailsText}>Detalhes</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.novityCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop' }}
              style={styles.novityCardImage}
              resizeMode="cover"
            />
            <View style={styles.novityOverlay}>
              <View style={styles.novityTextContainer}>
                <Text style={styles.novitySubtitle}>Cashback</Text>
                <Text style={styles.novityTitle}>Lojas exclusivas</Text>
              </View>
              <TouchableOpacity style={styles.novityDetailsButton}>
                <Ionicons name="document-text-outline" size={18} color="#1C1C1E" />
                <Text style={styles.novityDetailsText}>Detalhes</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Em cartaz Hoje */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Em cartaz Hoje</Text>
          <TouchableOpacity
            style={[styles.seeAllButton, { borderColor: whitelabelConfig.colors.primary }]}
            onPress={() => router.push({
              pathname: '/(tabs)/explore',
              params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
            })}
          >
            <Text style={[styles.seeAllText, { color: whitelabelConfig.colors.primary }]}>Ver +</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moviesContainer}
      >
          {[
            { image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop' },
            { image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop' },
            { image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop' },
            { image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop' },
            { image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop' },
          ].map((movie, index) => (
            <TouchableOpacity key={index} style={styles.movieCard}>
              <Image
                source={{ uri: movie.image }}
                style={styles.moviePoster}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* Links úteis */}
      <View style={styles.linksSection}>
        <View style={styles.linksSectionHeader}>
          <Text style={styles.sectionTitle}>Links úteis</Text>
        </View>

        <View style={styles.linksMenu}>
          <TouchableOpacity style={styles.linkItem}>
            <View style={styles.linkItemLeft}>
              <Ionicons name="person-outline" size={24} color={whitelabelConfig.colors.text} />
              <Text style={styles.linkItemText}>Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <View style={styles.linkItemLeft}>
              <Ionicons name="notifications-outline" size={24} color={whitelabelConfig.colors.text} />
              <Text style={styles.linkItemText}>Notificações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <View style={styles.linkItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color={whitelabelConfig.colors.text} />
              <Text style={styles.linkItemText}>Políticas e privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
          </TouchableOpacity>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  scrollContent: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  balanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  balanceLoader: {
    marginVertical: 12,
  },
  balanceSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  balanceActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  balanceActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
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
  exploreBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  exploreBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  highlightCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    height: 180,
  },
  highlightLeft: {
    width: '40%',
    position: 'relative',
  },
  highlightLeftImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  highlightLeftOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  highlightLeftText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  highlightRight: {
    width: '60%',
    padding: 20,
    justifyContent: 'center',
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 16,
  },
  highlightButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  highlightButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAccessSection: {
    marginTop: 24,
  },
  quickAccessSectionHeader: {
    paddingHorizontal: 20,
  },
  quickAccessCarousel: {
    gap: 12,
    marginTop: 16,
    paddingLeft: 20,
    paddingRight: 20,
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  quickAccessButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  bigBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  bannerImageFull: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  advantagesSection: {
    marginTop: 24,
  },
  advantagesSectionHeader: {
    paddingHorizontal: 20,
  },
  advantagesContainer: {
    gap: 16,
    marginTop: 16,
    paddingVertical: 8, // Espaço para as sombras não serem cortadas
    paddingBottom: 16, // Margin bottom adicional
    paddingLeft: 20, // Alinha primeiro card com o conteúdo acima
    paddingRight: 20, // Espaço após o último card
  },
  advantageCard: {
    width: width * 0.8, // 80% da largura da tela
    height: 160,
    backgroundColor: '#FFF',
    borderRadius: 24, // Mais arredondado
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  advantageLeft: {
    width: '40%',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: 'space-between',
  },
  advantageTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  advantageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 22,
  },
  advantageSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  advantageButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  advantageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  advantageRight: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  advantageEmoji: {
    fontSize: 80,
  },
  advantageBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  advantageBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  advantageBadgeSubtext: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  novitiesSection: {
    marginTop: 24,
  },
  novitiesSectionHeader: {
    paddingHorizontal: 20,
  },
  novitiesContainer: {
    gap: 16,
    marginTop: 16,
    paddingVertical: 8,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
  },
  novityCard: {
    width: width * 0.8,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  novityCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  novityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  novityTextContainer: {
    flex: 1,
  },
  novitySubtitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  novityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  novityDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  novityDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  moviesContainer: {
    gap: 12,
    marginTop: 16,
    paddingVertical: 8,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
  },
  movieCard: {
    width: 140,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  linksSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  linksSectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  linksMenu: {
    backgroundColor: whitelabelConfig.colors.white,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkItemText: {
    fontSize: 16,
    color: whitelabelConfig.colors.text,
    marginLeft: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});

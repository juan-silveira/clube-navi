import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

export default function Profile() {
  const menuSections = [
    {
      title: 'Compras',
      items: [
        { icon: 'cube-outline', label: 'Meus pedidos', badge: '3' },
        { icon: 'heart-outline', label: 'Favoritos', badge: null },
        { icon: 'time-outline', label: 'Vistos recentemente', badge: null },
        { icon: 'star-outline', label: 'Avaliações', badge: null },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { icon: 'card-outline', label: 'Formas de pagamento', badge: null },
        { icon: 'wallet-outline', label: 'Saldo e cupons', badge: '2' },
        { icon: 'receipt-outline', label: 'Faturas', badge: null },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { icon: 'person-outline', label: 'Dados pessoais', badge: null },
        { icon: 'location-outline', label: 'Endereços', badge: null },
        { icon: 'notifications-outline', label: 'Notificações', badge: null },
        { icon: 'lock-closed-outline', label: 'Segurança', badge: null },
        { icon: 'help-circle-outline', label: 'Ajuda', badge: null },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header com perfil */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Ivan Alberton</Text>
            <Text style={styles.email}>ivan.alberton@email.com</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={14} color={whitelabelConfig.colors.primary} />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={28} color="#FFD60A" />
          <Text style={styles.statCardValue}>Prata</Text>
          <Text style={styles.statCardLabel}>Nível</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={28} color="#FFD60A" />
          <Text style={styles.statCardValue}>850</Text>
          <Text style={styles.statCardLabel}>Pontos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="gift" size={28} color={whitelabelConfig.colors.primary} />
          <Text style={styles.statCardValue}>2</Text>
          <Text style={styles.statCardLabel}>Cupons</Text>
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuItems}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex === section.items.length - 1 && styles.menuItemLast
                ]}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={24} color={whitelabelConfig.colors.text} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Últimas compras */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Compras recentes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.purchasesList}>
          {[1, 2].map((item) => (
            <TouchableOpacity key={item} style={styles.purchaseItem}>
              <Image
                source={{ uri: 'https://via.placeholder.com/60' }}
                style={styles.purchaseImage}
              />
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseTitle}>Produto Exemplo {item}</Text>
                <Text style={styles.purchaseStatus}>Entregue em 15/10/2024</Text>
                <Text style={styles.purchasePrice}>R$ 99,90</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Espaçamento final */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whitelabelConfig.colors.background,
  },
  header: {
    backgroundColor: whitelabelConfig.colors.white,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: whitelabelConfig.colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: whitelabelConfig.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: whitelabelConfig.colors.white,
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: whitelabelConfig.colors.white,
    marginTop: 8,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: whitelabelConfig.colors.primary,
  },
  menuItems: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    color: whitelabelConfig.colors.text,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: whitelabelConfig.colors.error,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: whitelabelConfig.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  purchasesList: {
    paddingHorizontal: 16,
  },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  purchaseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: whitelabelConfig.colors.background,
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  purchaseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  purchaseStatus: {
    fontSize: 13,
    color: whitelabelConfig.colors.success,
    marginBottom: 2,
  },
  purchasePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
  },
});

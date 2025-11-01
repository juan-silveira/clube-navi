import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'order',
      icon: 'cube',
      iconColor: '#34C759',
      title: 'Pedido enviado',
      message: 'Seu pedido #12345 foi enviado e está a caminho',
      time: '2 min atrás',
      read: false,
      image: 'https://via.placeholder.com/60',
    },
    {
      id: 2,
      type: 'offer',
      icon: 'pricetag',
      iconColor: '#FF9500',
      title: 'Oferta especial',
      message: 'Até 50% OFF em eletrônicos selecionados',
      time: '1 hora atrás',
      read: false,
      image: 'https://via.placeholder.com/60',
    },
    {
      id: 3,
      type: 'payment',
      icon: 'card',
      iconColor: '#007AFF',
      title: 'Pagamento confirmado',
      message: 'Pagamento do pedido #12344 foi confirmado',
      time: '3 horas atrás',
      read: true,
      image: 'https://via.placeholder.com/60',
    },
    {
      id: 4,
      type: 'delivery',
      icon: 'checkmark-circle',
      iconColor: '#34C759',
      title: 'Pedido entregue',
      message: 'Seu pedido #12343 foi entregue com sucesso',
      time: 'Ontem',
      read: true,
      image: 'https://via.placeholder.com/60',
    },
    {
      id: 5,
      type: 'coupon',
      icon: 'gift',
      iconColor: '#5856D6',
      title: 'Novo cupom disponível',
      message: 'Você ganhou um cupom de R$ 20,00',
      time: 'Ontem',
      read: true,
      image: null,
    },
    {
      id: 6,
      type: 'review',
      icon: 'star',
      iconColor: '#FFD60A',
      title: 'Avalie sua compra',
      message: 'Conte para outros compradores sobre sua experiência',
      time: '2 dias atrás',
      read: true,
      image: 'https://via.placeholder.com/60',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <Text style={styles.headerTitle}>Notificações</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount} novas</Text>
          </View>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
            <Text style={styles.filterTextActive}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Ofertas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Pagamentos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.notificationUnread
            ]}
          >
            {/* Ícone ou Imagem */}
            <View style={styles.notificationLeft}>
              {notification.image ? (
                <Image
                  source={{ uri: notification.image }}
                  style={styles.notificationImage}
                />
              ) : (
                <View style={[styles.notificationIcon, { backgroundColor: notification.iconColor + '20' }]}>
                  <Ionicons name={notification.icon as any} size={24} color={notification.iconColor} />
                </View>
              )}
            </View>

            {/* Conteúdo */}
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>

            {/* Seta */}
            <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Empty State (oculto quando há notificações) */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={whitelabelConfig.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyText}>Você não tem notificações no momento</Text>
          </View>
        )}
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
  },
  unreadBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  unreadText: {
    fontSize: 14,
    color: whitelabelConfig.colors.white,
    opacity: 0.9,
  },
  filterContainer: {
    backgroundColor: whitelabelConfig.colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: whitelabelConfig.colors.background,
  },
  filterButtonActive: {
    backgroundColor: whitelabelConfig.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: whitelabelConfig.colors.text,
  },
  filterTextActive: {
    fontSize: 14,
    color: whitelabelConfig.colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: whitelabelConfig.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  notificationUnread: {
    backgroundColor: whitelabelConfig.colors.primary + '08',
  },
  notificationLeft: {
    marginRight: 12,
  },
  notificationImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  notificationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: whitelabelConfig.colors.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: whitelabelConfig.colors.textSecondary,
    textAlign: 'center',
  },
});

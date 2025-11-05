import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';
import { serializeBreadcrumb } from '@/utils/navigationHelper';
import { useState, useEffect } from 'react';
import { blockchainService, BlockchainBalance } from '@/services/blockchain';
import BalanceCard from '@/components/BalanceCard';

export default function More() {
  const router = useRouter();
  const currentPath = usePathname();
  const { user, logout } = useAuthStore();
  const [balance, setBalance] = useState<BlockchainBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Função para buscar saldo
  const fetchBalance = async () => {
    const balanceData = await blockchainService.getCBRLBalance();
    setBalance(balanceData);
  };

  // Buscar saldo da blockchain na montagem do componente
  useEffect(() => {
    // Só buscar saldo se o usuário estiver autenticado
    if (!user) {
      setLoadingBalance(false);
      return;
    }

    const loadInitialBalance = async () => {
      setLoadingBalance(true);
      await fetchBalance();
      setLoadingBalance(false);
    };

    loadInitialBalance();

    // Atualizar saldo a cada 30 segundos
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuItems: Array<{ icon: string; title: string; route?: string; badge?: number; useBreadcrumb?: boolean }> = [
    { icon: 'grid-outline', title: 'Dashboard', route: '/(tabs)/dashboard' },
    { icon: 'gift-outline', title: 'Minhas indicações', route: '/referrals', useBreadcrumb: true },
    { icon: 'people-outline', title: 'Lojas que sigo' },
    { icon: 'headset-outline', title: 'Ajuda' },
    { icon: 'bag-outline', title: 'Minhas compras' },
    { icon: 'star-outline', title: 'Minhas opiniões' },
    { icon: 'heart-outline', title: 'Favoritos' },
    { icon: 'pricetag-outline', title: 'Ofertas do dia' },
    { icon: 'settings-outline', title: 'Configurações' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header com informações do usuário */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user?.profilePicture || 'https://via.placeholder.com/60'
            }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            <TouchableOpacity>
              <Text style={styles.viewProfile}>Meu perfil →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card de saldo */}
        <BalanceCard balance={balance} loadingBalance={loadingBalance} />
      </View>

      {/* Lista de opções de navegação */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.route) {
                if (item.useBreadcrumb) {
                  router.push({
                    pathname: item.route as any,
                    params: { breadcrumb: serializeBreadcrumb([{ path: currentPath }]) },
                  });
                } else {
                  router.push(item.route);
                }
              }
            }}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={whitelabelConfig.colors.text} />
              <Text style={styles.menuItemText}>{item.title}</Text>
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

      {/* Botão de sair */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: whitelabelConfig.colors.error }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={whitelabelConfig.colors.white} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whitelabelConfig.colors.background,
  },
  header: {
    backgroundColor: whitelabelConfig.colors.primary,
    padding: 20,
    paddingTop: 60,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: whitelabelConfig.colors.white,
  },
  userDetails: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
    marginBottom: 4,
  },
  viewProfile: {
    fontSize: 14,
    color: whitelabelConfig.colors.white,
  },
  menu: {
    backgroundColor: whitelabelConfig.colors.white,
    marginTop: 2,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: whitelabelConfig.colors.text,
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: whitelabelConfig.colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: whitelabelConfig.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: whitelabelConfig.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

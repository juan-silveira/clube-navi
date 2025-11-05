import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const firstName = user?.name?.split(' ')[0] || 'U';
  const hasProfilePicture = user?.profilePicture && user.profilePicture !== 'https://via.placeholder.com/60';

  const tabs = [
    { name: 'Início', icon: 'home-outline', path: '/(tabs)' },
    { name: 'Explorar', icon: 'search-outline', path: '/(tabs)/explore' },
    { name: 'profile', icon: null, path: '/(tabs)/profile' }, // Avatar especial
    { name: 'Notificações', icon: 'notifications-outline', path: '/(tabs)/notifications' },
    { name: 'Mais', icon: 'menu-outline', path: '/(tabs)/more' },
  ];

  const isActive = (path: string) => {
    if (path === '/(tabs)') {
      return pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname === path;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const active = isActive(tab.path);

        // Avatar do perfil (centro)
        if (tab.name === 'profile') {
          return (
            <TouchableOpacity
              key={index}
              style={styles.tabItem}
              onPress={() => router.push(tab.path as any)}
            >
              <View style={[styles.centerButton, active && styles.centerButtonActive]}>
                {hasProfilePicture ? (
                  <Image
                    source={{ uri: user.profilePicture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: whitelabelConfig.colors.primary }]}>
                    <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }

        // Outros tabs
        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => router.push(tab.path as any)}
          >
            {active && <View style={styles.indicator} />}
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={active ? whitelabelConfig.colors.primary : whitelabelConfig.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: active ? whitelabelConfig.colors.primary : whitelabelConfig.colors.textSecondary }
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -10,
    width: 40,
    height: 3,
    backgroundColor: whitelabelConfig.colors.primary,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: whitelabelConfig.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: whitelabelConfig.colors.border,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centerButtonActive: {
    borderColor: whitelabelConfig.colors.primary,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
  },
});

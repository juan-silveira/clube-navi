import { Tabs } from 'expo-router';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';

const TabBarIndicator = ({ focused }: { focused: boolean }) => {
  if (!focused) return null;
  return <View style={styles.indicator} />;
};

const ProfileAvatar = ({ user, focused }: { user: any; focused: boolean }) => {
  const firstName = user?.name?.split(' ')[0] || 'U';
  const hasProfilePicture = user?.profilePicture && user.profilePicture !== 'https://via.placeholder.com/60';

  return (
    <View style={styles.tabItem}>
      <View style={[styles.centerButton, focused && styles.centerButtonActive]}>
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
    </View>
  );
};

export default function TabLayout() {
  const { user } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: whitelabelConfig.colors.primary,
        tabBarInactiveTintColor: whitelabelConfig.colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabItem}>
              <TabBarIndicator focused={focused} />
              <Ionicons name="home-outline" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabItem}>
              <TabBarIndicator focused={focused} />
              <Ionicons name="search-outline" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <ProfileAvatar user={user} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabItem}>
              <TabBarIndicator focused={focused} />
              <Ionicons name="notifications-outline" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabItem}>
              <TabBarIndicator focused={focused} />
              <Ionicons name="menu-outline" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="internet-management"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="my-plans"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="unlock"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="upgrade-plan"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="new-plan"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="cashback"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="cashback-statement"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="benefit-detail"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="cinema"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="gift-cards"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="cinemas-list"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="product-detail"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
      <Tabs.Screen
        name="purchase-detail"
        options={{
          href: null, // Esconde do menu de tabs
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
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

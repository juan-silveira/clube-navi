import { Tabs } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

const TabBarIndicator = ({ focused }: { focused: boolean }) => {
  if (!focused) return null;
  return <View style={styles.indicator} />;
};

export default function TabLayout() {
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
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View style={[styles.centerButton, focused && styles.centerButtonActive]}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/50' }}
                  style={styles.avatar}
                />
              </View>
            </View>
          ),
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
});

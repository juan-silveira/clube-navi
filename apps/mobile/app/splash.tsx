import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { whitelabelConfig } from '@/config/whitelabel';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, whitelabelConfig.splash.duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: whitelabelConfig.splash.backgroundColor }]}>
      <Text style={styles.companyName}>{whitelabelConfig.branding.companyName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { whitelabelConfig, getLogo } from '@/config/whitelabel';
import { biometricService } from '@/services/biometricService';
import { useAuthStore } from '@/store/authStore';

export default function Splash() {
  const router = useRouter();
  const { loginWithBiometric, loadUser } = useAuthStore();
  const [biometricAttempted, setBiometricAttempted] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Verificar se tem biometria habilitada PRIMEIRO (como o Nubank)
      const biometricEnabled = await biometricService.isBiometricEnabled();
      const biometricAvailable = await biometricService.isAvailable();

      if (biometricEnabled && biometricAvailable && !biometricAttempted) {
        setBiometricAttempted(true);

        // Pedir biometria imediatamente na splash screen
        const success = await loginWithBiometric();

        if (success) {
          router.replace('/(tabs)');
        } else {
          // Se falhar ou cancelar, ir para tela de login
          router.replace('/(auth)/login');
        }
        return;
      }

      // Se não tem biometria, verificar se já está autenticado
      await loadUser();
      const { isAuthenticated } = useAuthStore.getState();

      if (isAuthenticated) {
        // Se já está autenticado (mas sem biometria), ir para home
        setTimeout(() => {
          router.replace('/(tabs)');
        }, whitelabelConfig.splash.duration);
      } else {
        // Sem biometria e sem autenticação, ir para login
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, whitelabelConfig.splash.duration);
      }
    };

    initializeApp();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: whitelabelConfig.splash.backgroundColor }]}>
      <Image
        source={getLogo('dark', 'full')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color={whitelabelConfig.colors.primary}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 100,
  },
  loader: {
    marginTop: 40,
  },
});

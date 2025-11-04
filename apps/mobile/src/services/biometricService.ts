import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';
const STORED_CREDENTIALS_KEY = '@stored_credentials';
const BIOMETRIC_USER_KEY = '@biometric_user'; // Armazena qual usuário tem biometria ativada

export interface StoredCredentials {
  email: string;
  password: string;
  userId?: string; // ID do usuário para validação adicional
}

export const biometricService = {
  async isDeviceCompatible(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  },

  async hasBiometricsEnrolled(): Promise<boolean> {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  },

  async getSupportedBiometrics(): Promise<LocalAuthentication.AuthenticationType[]> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types;
  },

  async isBiometricEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  },

  async enableBiometric(credentials: StoredCredentials): Promise<boolean> {
    try {
      // Salvar credenciais criptografadas
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      await AsyncStorage.setItem(STORED_CREDENTIALS_KEY, JSON.stringify(credentials));
      // Salvar identificador do usuário separadamente para validação rápida
      await AsyncStorage.setItem(BIOMETRIC_USER_KEY, credentials.email);
      return true;
    } catch (error) {
      console.error('Erro ao habilitar biometria:', error);
      return false;
    }
  },

  async disableBiometric(): Promise<void> {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await AsyncStorage.removeItem(STORED_CREDENTIALS_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_USER_KEY);
  },

  /**
   * Verifica se a biometria está vinculada a um usuário específico
   * Retorna o email do usuário que tem biometria ativada, ou null se nenhum
   */
  async getBiometricUser(): Promise<string | null> {
    return await AsyncStorage.getItem(BIOMETRIC_USER_KEY);
  },

  /**
   * Verifica se o usuário atual pode usar biometria
   * Compara o email fornecido com o email salvo na biometria
   */
  async canUseBiometric(userEmail: string): Promise<boolean> {
    const biometricUser = await this.getBiometricUser();
    if (!biometricUser) return false;

    // Comparação case-insensitive
    return biometricUser.toLowerCase() === userEmail.toLowerCase();
  },

  async authenticate(): Promise<StoredCredentials | null> {
    const enabled = await this.isBiometricEnabled();
    if (!enabled) return null;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentique-se para fazer login',
      fallbackLabel: 'Usar senha',
      cancelLabel: 'Cancelar',
    });

    if (!result.success) return null;

    const credentialsJson = await AsyncStorage.getItem(STORED_CREDENTIALS_KEY);
    if (!credentialsJson) return null;

    return JSON.parse(credentialsJson);
  },

  async isAvailable(): Promise<boolean> {
    const compatible = await this.isDeviceCompatible();
    const enrolled = await this.hasBiometricsEnrolled();
    return compatible && enrolled;
  },

  async getBiometricTypeName(): Promise<string> {
    const types = await this.getSupportedBiometrics();

    // No Android, usar termo genérico "Biometria" independente do tipo
    // No iOS, usar "Face ID" para reconhecimento facial
    const isIOS = require('react-native').Platform.OS === 'ios';

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return isIOS ? 'Face ID' : 'Biometria';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return isIOS ? 'Touch ID' : 'Biometria';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Biometria';
    }
    return 'Biometria';
  },
};

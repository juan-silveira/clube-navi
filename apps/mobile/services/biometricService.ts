import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';
const STORED_CREDENTIALS_KEY = '@stored_credentials';

export interface StoredCredentials {
  email: string;
  password: string;
}

export const biometricService = {
  /**
   * Verifica se o dispositivo tem hardware de biometria
   */
  async isDeviceCompatible(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch (error) {
      console.error('Erro ao verificar compatibilidade de biometria:', error);
      return false;
    }
  },

  /**
   * Verifica se há biometrias cadastradas no dispositivo
   */
  async hasBiometricsEnrolled(): Promise<boolean> {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error('Erro ao verificar biometrias cadastradas:', error);
      return false;
    }
  },

  /**
   * Obtém os tipos de biometria disponíveis no dispositivo
   */
  async getSupportedBiometrics(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    } catch (error) {
      console.error('Erro ao obter tipos de biometria:', error);
      return [];
    }
  },

  /**
   * Verifica se a biometria está ativada no app
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Erro ao verificar se biometria está ativada:', error);
      return false;
    }
  },

  /**
   * Ativa a biometria e armazena as credenciais
   */
  async enableBiometric(credentials: StoredCredentials): Promise<boolean> {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      await AsyncStorage.setItem(STORED_CREDENTIALS_KEY, JSON.stringify(credentials));
      return true;
    } catch (error) {
      console.error('Erro ao ativar biometria:', error);
      return false;
    }
  },

  /**
   * Desativa a biometria e remove as credenciais armazenadas
   */
  async disableBiometric(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      await AsyncStorage.removeItem(STORED_CREDENTIALS_KEY);
    } catch (error) {
      console.error('Erro ao desativar biometria:', error);
    }
  },

  /**
   * Autentica com biometria e retorna as credenciais armazenadas
   */
  async authenticate(): Promise<StoredCredentials | null> {
    try {
      // Verifica se a biometria está ativada
      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        return null;
      }

      // Autentica com biometria
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para fazer login',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
      });

      if (!result.success) {
        return null;
      }

      // Recupera as credenciais armazenadas
      const credentialsJson = await AsyncStorage.getItem(STORED_CREDENTIALS_KEY);
      if (!credentialsJson) {
        return null;
      }

      const credentials: StoredCredentials = JSON.parse(credentialsJson);
      return credentials;
    } catch (error) {
      console.error('Erro ao autenticar com biometria:', error);
      return null;
    }
  },

  /**
   * Verifica se o dispositivo está pronto para usar biometria
   */
  async isAvailable(): Promise<boolean> {
    const compatible = await this.isDeviceCompatible();
    const enrolled = await this.hasBiometricsEnrolled();
    return compatible && enrolled;
  },

  /**
   * Obtém o nome do tipo de biometria para exibição
   */
  async getBiometricTypeName(): Promise<string> {
    const types = await this.getSupportedBiometrics();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Impressão Digital';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Íris';
    }

    return 'Biometria';
  },
};

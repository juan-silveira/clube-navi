import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';
import { biometricService } from '@/services/biometricService';
import BiometricPromptModal from '@/components/BiometricPromptModal';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometria');
  const [biometricUser, setBiometricUser] = useState<string | null>(null);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  const { login, loginWithBiometric, isLoading, error, isAuthenticated, clearError } =
    useAuthStore();

  // Verificar disponibilidade de biometria ao carregar
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await biometricService.isAvailable();
      const enabled = await biometricService.isBiometricEnabled();
      const type = await biometricService.getBiometricTypeName();
      const user = await biometricService.getBiometricUser();

      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      setBiometricType(type);
      setBiometricUser(user);

      // Pré-preencher o email do usuário que tem biometria ativada
      // Isso permite que o usuário faça login apenas clicando no botão de biometria
      if (enabled && user) {
        setEmail(user);
      }
    };

    checkBiometric();
  }, []);

  // Mostrar erro quando houver
  useEffect(() => {
    if (error) {
      Alert.alert('Erro no Login', error, [
        {
          text: 'OK',
          onPress: () => clearError(),
        },
      ]);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const success = await login({ email, password });

    if (success) {
      // Se a biometria está disponível mas não ativada, perguntar se quer ativar
      if (biometricAvailable && !biometricEnabled) {
        setShowBiometricPrompt(true);
        // NÃO redirecionar aqui - deixar o modal aparecer
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  const handleBiometricLogin = async () => {
    const success = await loginWithBiometric();

    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleEnableBiometric = async () => {
    const success = await biometricService.enableBiometric({
      email,
      password,
    });

    setShowBiometricPrompt(false);

    if (success) {
      setBiometricEnabled(true);
      setBiometricUser(email); // Atualizar o usuário vinculado à biometria
      Alert.alert(
        'Sucesso',
        `${biometricType} ativado com sucesso! Você pode usar na próxima vez.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert('Erro', 'Não foi possível ativar a biometria');
      router.replace('/(tabs)');
    }
  };

  const handleCancelBiometricPrompt = () => {
    setShowBiometricPrompt(false);
    router.replace('/(tabs)');
  };

  // Verificar se o usuário digitado tem biometria ativada
  const canUseBiometricForCurrentUser =
    biometricEnabled && biometricUser?.toLowerCase() === email.toLowerCase();

  return (
    <View style={styles.container}>
      {/* Botão de biometria - aparece apenas se biometria estiver ativada para este usuário */}
      {canUseBiometricForCurrentUser && (
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={isLoading}
        >
          <Ionicons name="finger-print" size={48} color={whitelabelConfig.colors.primary} />
          <Text style={[styles.biometricText, { color: whitelabelConfig.colors.primary }]}>
            Entrar com {biometricType}
          </Text>
        </TouchableOpacity>
      )}

      {/* Mensagem informativa quando biometria está ativada para outro usuário */}
      {biometricEnabled && !canUseBiometricForCurrentUser && biometricUser && (
        <View style={styles.biometricInfoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={whitelabelConfig.colors.textSecondary} />
          <Text style={styles.biometricInfoText}>
            {biometricType} está ativado para {biometricUser}
          </Text>
        </View>
      )}

      <Text style={styles.title}>{whitelabelConfig.branding.companyName}</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={whitelabelConfig.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={whitelabelConfig.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: whitelabelConfig.colors.primary },
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={whitelabelConfig.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.registerLink, { color: whitelabelConfig.colors.primary }]}>
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal para perguntar sobre ativar biometria */}
      <BiometricPromptModal
        visible={showBiometricPrompt}
        biometricType={biometricType}
        onEnableBiometric={handleEnableBiometric}
        onCancel={handleCancelBiometricPrompt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whitelabelConfig.colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  biometricButton: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  biometricInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: whitelabelConfig.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  biometricInfoText: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: whitelabelConfig.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: whitelabelConfig.colors.white,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    color: whitelabelConfig.colors.text,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: whitelabelConfig.colors.primary,
    fontSize: 14,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: whitelabelConfig.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: whitelabelConfig.colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

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
  Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig, getLogo } from '@/config/whitelabel';
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
  const [isDifferentAccount, setIsDifferentAccount] = useState(false); // Usuário quer entrar com outra conta
  const [isReplacingBiometric, setIsReplacingBiometric] = useState(false); // Se está substituindo biometria existente

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
      // APENAS se não estiver tentando entrar com outra conta
      if (enabled && user && !isDifferentAccount) {
        setEmail(user);
      }
    };

    checkBiometric();
  }, [isDifferentAccount]);

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
      // Verificar se o email foi confirmado
      const { user: loggedUser } = useAuthStore.getState();

      console.log('[LOGIN] User after login:', loggedUser);
      console.log('[LOGIN] Email confirmed:', loggedUser?.emailConfirmed);

      if (loggedUser && !loggedUser.emailConfirmed) {
        // Email não confirmado, redirecionar para tela de confirmação
        console.log('[LOGIN] Email not confirmed, redirecting to confirmation screen');
        router.replace({
          pathname: '/(auth)/email-confirmation',
          params: {
            email: loggedUser.email,
            userId: loggedUser.id
          }
        });
        return;
      }

      // Verificar se deve mostrar prompt de biometria
      const replacingBiometric = biometricEnabled && biometricUser && biometricUser.toLowerCase() !== email.toLowerCase();
      const shouldShowBiometricPrompt = biometricAvailable && (
        !biometricEnabled || // Nenhuma biometria ativada
        (biometricEnabled && isDifferentAccount) || // Conta diferente quer ativar
        replacingBiometric // Email diferente da biometria - vai substituir
      );

      if (shouldShowBiometricPrompt) {
        setIsReplacingBiometric(replacingBiometric);
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
      // Verificar se o email foi confirmado
      const { user: loggedUser } = useAuthStore.getState();

      if (loggedUser && !loggedUser.emailConfirmed) {
        // Email não confirmado, redirecionar para tela de confirmação
        router.replace({
          pathname: '/(auth)/email-confirmation',
          params: {
            email: loggedUser.email,
            userId: loggedUser.id
          }
        });
        return;
      }

      router.replace('/(tabs)');
    }
  };

  const handleSwitchAccount = () => {
    // Limpar email preenchido
    setEmail('');
    setPassword('');
    // Marcar que quer usar outra conta
    setIsDifferentAccount(true);
  };

  const handleEnableBiometric = async () => {
    const success = await biometricService.enableBiometric({
      email,
      password,
    });

    setShowBiometricPrompt(false);

    if (success) {
      const previousUser = biometricUser;
      setBiometricEnabled(true);
      setBiometricUser(email); // Atualizar o usuário vinculado à biometria

      const message = isReplacingBiometric && previousUser
        ? `${biometricType} substituído com sucesso! Agora está vinculado a ${email}.`
        : `${biometricType} ativado com sucesso! Você pode usar na próxima vez.`;

      Alert.alert(
        'Sucesso',
        message,
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
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={getLogo('light', 'full')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

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

        {/* Link para trocar de conta - só aparece se tem biometria ativa e não está no modo "outra conta" */}
        {biometricEnabled && biometricUser && !isDifferentAccount && (
          <TouchableOpacity
            style={styles.switchAccountContainer}
            onPress={handleSwitchAccount}
          >
            <Text style={styles.switchAccountText}>
              Não é você? <Text style={[styles.switchAccountLink, { color: whitelabelConfig.colors.primary }]}>Entrar com outra conta</Text>
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.registerLink, { color: whitelabelConfig.colors.primary }]}>
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mensagem informativa quando biometria está ativada para outro usuário */}
      {biometricEnabled && !canUseBiometricForCurrentUser && biometricUser && (
        <View style={styles.biometricInfoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={whitelabelConfig.colors.textSecondary} />
          <Text style={styles.biometricInfoText}>
            {biometricType} está ativado para {biometricUser}
          </Text>
        </View>
      )}

      {/* Botão de biometria - aparece na parte inferior */}
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

      {/* Modal para perguntar sobre ativar biometria */}
      <BiometricPromptModal
        visible={showBiometricPrompt}
        biometricType={biometricType}
        onEnableBiometric={handleEnableBiometric}
        onCancel={handleCancelBiometricPrompt}
        isReplacing={isReplacingBiometric}
        previousUser={biometricUser || undefined}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 80,
  },
  biometricButton: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: whitelabelConfig.colors.border,
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
    marginTop: 16,
    gap: 8,
  },
  biometricInfoText: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
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
  switchAccountContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  switchAccountText: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
    textAlign: 'center',
  },
  switchAccountLink: {
    fontWeight: '600',
  },
});

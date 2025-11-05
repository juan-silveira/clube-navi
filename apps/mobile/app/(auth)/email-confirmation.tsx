import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { apiService } from '@/services/api';

export default function EmailConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [validating, setValidating] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(
    (params.confirmationToken as string) || null
  );

  const email = params.email as string;
  const userId = params.userId as string;

  // Hook para verificar status de confirmação
  useEffect(() => {
    const checkConfirmation = async () => {
      try {
        const response = await apiService.get('/api/auth/check-email-confirmation');

        if (response.success && response.data?.emailConfirmed) {
          // Email foi confirmado, redirecionar para home
          router.replace('/(tabs)/');
        }
      } catch (error) {
        console.error('Erro ao verificar confirmação:', error);
      }
    };

    // Verificar a cada 3 segundos
    const interval = setInterval(checkConfirmation, 3000);

    // Verificar imediatamente
    checkConfirmation();

    return () => clearInterval(interval);
  }, []);

  // Obter token se não foi passado como parâmetro
  useEffect(() => {
    const getTestToken = async () => {
      // Se já temos o token, não precisa buscar
      if (confirmationToken) {
        console.log('Token já disponível:', confirmationToken.substring(0, 16) + '...');
        return;
      }

      try {
        // Reenviar email para obter novo token
        const response = await apiService.post('/api/auth/resend-confirmation', { email });

        if (response.success && response.data?.confirmationToken) {
          setConfirmationToken(response.data.confirmationToken);
          console.log('Novo token obtido:', response.data.confirmationToken.substring(0, 16) + '...');
        }
      } catch (error) {
        console.error('Erro ao obter token:', error);
      }
    };

    if (email && !confirmationToken) {
      getTestToken();
    }
  }, [email, confirmationToken]);

  const handleResendEmail = async () => {
    if (!email) {
      Alert.alert('Erro', 'Email não encontrado');
      return;
    }

    setResending(true);

    try {
      const response = await apiService.post('/api/auth/resend-confirmation', { email });

      if (response.success) {
        // Atualizar token se veio na resposta
        if (response.data?.confirmationToken) {
          setConfirmationToken(response.data.confirmationToken);
        }
        Alert.alert('Sucesso', 'Email de confirmação reenviado com sucesso!');
      } else {
        Alert.alert('Erro', response.message || 'Erro ao reenviar email');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao reenviar email de confirmação');
    } finally {
      setResending(false);
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);

    try {
      const response = await apiService.get('/api/auth/check-email-confirmation');

      if (response.success && response.data?.emailConfirmed) {
        Alert.alert('Sucesso', 'Email confirmado!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/'),
          },
        ]);
      } else {
        Alert.alert('Atenção', 'Email ainda não foi confirmado. Verifique sua caixa de entrada.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao verificar confirmação');
    } finally {
      setChecking(false);
    }
  };

  // Validar email usando o token (debug/teste)
  const handleDebugValidation = async () => {
    if (!confirmationToken) {
      Alert.alert('Erro', 'Token de confirmação não disponível. Tente reenviar o email.');
      return;
    }

    setValidating(true);

    try {
      console.log('🔑 Validando com token:', confirmationToken.substring(0, 16) + '...');

      const response = await apiService.get(`/api/auth/confirm-email/${confirmationToken}`);

      if (response.success) {
        Alert.alert('Sucesso', 'Email confirmado com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/'),
          },
        ]);
      } else {
        Alert.alert('Erro', response.message || 'Erro ao confirmar email');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao validar email');
    } finally {
      setValidating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: whitelabelConfig.colors.secondary }]}>
      <View style={styles.content}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color={whitelabelConfig.colors.white} />
        </View>

        {/* Título */}
        <Text style={styles.title}>Confirme seu Email</Text>

        {/* Descrição */}
        <Text style={styles.description}>
          Enviamos um email de confirmação para:
        </Text>
        <Text style={styles.email}>{email}</Text>

        <Text style={styles.instructions}>
          Clique no link do email para confirmar sua conta. O sistema verificará automaticamente quando você confirmar.
        </Text>

        {/* Loading indicator */}
        <View style={styles.checkingContainer}>
          <ActivityIndicator size="small" color={whitelabelConfig.colors.white} />
          <Text style={styles.checkingText}>Aguardando confirmação...</Text>
        </View>

        {/* Botões */}
        <View style={styles.buttonsContainer}>
          {/* Botão de verificar manualmente */}
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleManualCheck}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color={whitelabelConfig.colors.secondary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={whitelabelConfig.colors.secondary} />
                <Text style={[styles.buttonText, { color: whitelabelConfig.colors.secondary }]}>
                  Verificar Agora
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botão de reenviar email */}
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={handleResendEmail}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator color={whitelabelConfig.colors.white} />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color={whitelabelConfig.colors.white} />
                <Text style={styles.buttonText}>Reenviar Email</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botão de validação debug (temporário) */}
          {confirmationToken && (
            <TouchableOpacity
              style={[styles.button, styles.buttonTest]}
              onPress={handleDebugValidation}
              disabled={validating}
            >
              {validating ? (
                <ActivityIndicator color={whitelabelConfig.colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-done-outline" size={20} color={whitelabelConfig.colors.white} />
                  <Text style={styles.buttonText}>Validar (Debug)</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Link para voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.backButtonText}>Voltar para Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: whitelabelConfig.colors.white,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.9,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: whitelabelConfig.colors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  instructions: {
    fontSize: 14,
    color: whitelabelConfig.colors.white,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  checkingText: {
    fontSize: 14,
    color: whitelabelConfig.colors.white,
    opacity: 0.9,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: whitelabelConfig.colors.white,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: whitelabelConfig.colors.white,
  },
  buttonTest: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.white,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.white,
  },
  backButton: {
    marginTop: 32,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: whitelabelConfig.colors.white,
    textDecorationLine: 'underline',
  },
});

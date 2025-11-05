import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

export default function ReferralCode() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const validateReferralCode = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Atenção', 'Digite um código de indicação');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/referral/validate/${referralCode.toLowerCase()}`,
      );

      const data = await response.json();

      if (data.success) {
        // Navegar para tela de confirmação
        router.push({
          pathname: '/auth/referral-confirm',
          params: {
            username: data.data.username,
            name: data.data.name,
            description: data.data.referralDescription || 'Sem descrição',
          },
        });
      } else {
        Alert.alert('Erro', data.message || 'Código de indicação inválido');
      }
    } catch (error) {
      console.error('Erro ao validar código:', error);
      Alert.alert('Erro', 'Erro ao validar código de indicação');
    } finally {
      setLoading(false);
    }
  };

  const skipReferral = () => {
    // Navegar direto para o registro sem código
    router.push('/auth/register-step1');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={whitelabelConfig.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.main}>
          <View style={[styles.iconContainer, { backgroundColor: whitelabelConfig.colors.primary + '20' }]}>
            <Ionicons name="gift" size={64} color={whitelabelConfig.colors.primary} />
          </View>

          <Text style={styles.title}>Código de Indicação</Text>
          <Text style={styles.subtitle}>
            Você foi indicado por alguém? Digite o código de indicação abaixo
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                placeholder="Digite o código"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.validateButton, { backgroundColor: whitelabelConfig.colors.primary }]}
              onPress={validateReferralCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.validateButtonText}>Validar Código</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipReferral}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>Pular esta etapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1C1C1E',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  validateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
});

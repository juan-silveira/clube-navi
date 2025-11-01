import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { whitelabelConfig } from '@/config/whitelabel';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleResetPassword = () => {
    // TODO: Implement password reset logic
    console.log('Reset password for:', email);
    setSent(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.subtitle}>
        {sent
          ? 'Enviamos um link para redefinir sua senha. Verifique seu email.'
          : 'Digite seu email para receber instruções de recuperação'}
      </Text>

      {!sent ? (
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

          <TouchableOpacity
            style={[styles.button, { backgroundColor: whitelabelConfig.colors.primary }]}
            onPress={handleResetPassword}
          >
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: whitelabelConfig.colors.primary }]}>
              Voltar para o login
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: whitelabelConfig.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Voltar para o login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => setSent(false)}
          >
            <Text style={[styles.resendText, { color: whitelabelConfig.colors.primary }]}>
              Não recebeu? Reenviar
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 20,
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
    marginBottom: 24,
    color: whitelabelConfig.colors.text,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: whitelabelConfig.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    width: '100%',
  },
  resendButton: {
    alignItems: 'center',
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

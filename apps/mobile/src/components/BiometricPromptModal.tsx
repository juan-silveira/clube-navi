import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

interface BiometricPromptModalProps {
  visible: boolean;
  biometricType: string;
  onEnableBiometric: () => void;
  onCancel: () => void;
}

export default function BiometricPromptModal({
  visible,
  biometricType,
  onEnableBiometric,
  onCancel,
}: BiometricPromptModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Ícone */}
          <View style={[styles.iconContainer, { backgroundColor: whitelabelConfig.colors.primary + '20' }]}>
            <Ionicons name="finger-print" size={48} color={whitelabelConfig.colors.primary} />
          </View>

          {/* Título */}
          <Text style={styles.title}>Ativar {biometricType}?</Text>

          {/* Descrição */}
          <Text style={styles.description}>
            Faça login de forma rápida e segura usando seu {biometricType.toLowerCase()} nas próximas vezes.
          </Text>

          {/* Botões */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Agora não
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, { backgroundColor: whitelabelConfig.colors.primary }]}
              onPress={onEnableBiometric}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                Ativar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: whitelabelConfig.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: whitelabelConfig.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: whitelabelConfig.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: whitelabelConfig.colors.white,
  },
  buttonTextSecondary: {
    color: whitelabelConfig.colors.textSecondary,
  },
});

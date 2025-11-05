import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';

export default function ReferralConfirm() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { username, name, description } = params;

  const confirmAndContinue = () => {
    // Navegar para o registro passando o código de indicação
    router.push({
      pathname: '/auth/register-step1',
      params: {
        referralCode: username,
      },
    });
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={whitelabelConfig.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: whitelabelConfig.colors.primary + '20' }]}>
          <Ionicons name="checkmark-circle" size={80} color={whitelabelConfig.colors.primary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Código Válido!</Text>
        <Text style={styles.subtitle}>Você foi indicado por:</Text>

        {/* Card com informações de quem indicou */}
        <View style={styles.referrerCard}>
          <View style={[styles.avatarContainer, { backgroundColor: whitelabelConfig.colors.primary }]}>
            <Ionicons name="person" size={40} color="#FFF" />
          </View>

          <View style={styles.referrerInfo}>
            <Text style={styles.referrerName}>{name}</Text>
            <Text style={[styles.referrerUsername, { color: whitelabelConfig.colors.primary }]}>
              @{username}
            </Text>
          </View>
        </View>

        {/* Descrição */}
        {description && description !== 'Sem descrição' && (
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={24} color={whitelabelConfig.colors.primary} />
              <Text style={styles.descriptionTitle}>Mensagem</Text>
            </View>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        )}

        {/* Benefícios */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Ao usar este código você:</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.benefitText}>Ajuda quem te indicou</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.benefitText}>Faz parte de uma comunidade</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.benefitText}>Pode indicar outras pessoas também</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={confirmAndContinue}
        >
          <Text style={styles.confirmButtonText}>Continuar Cadastro</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.changeButton} onPress={goBack}>
          <Text style={styles.changeButtonText}>Usar outro código</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
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
    marginBottom: 32,
  },
  referrerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  referrerInfo: {
    flex: 1,
  },
  referrerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  referrerUsername: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  descriptionText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  benefitsCard: {
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  changeButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
});

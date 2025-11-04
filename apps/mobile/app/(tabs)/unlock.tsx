import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function Unlock() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentPath = usePathname();
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  const handleUnlock = () => {
    // Aqui será implementada a lógica de desbloqueio com o backend
    Alert.alert(
      'Solicitação Enviada',
      'Sua internet será desbloqueada em até 24 horas após o pagamento constar no sistema.',
      [{ text: 'OK' }]
    );
  };

  const handleBack = () => {
    const backPath = getBackPath(currentBreadcrumb);
    if (backPath) {
      router.push({
        pathname: backPath.path as any,
        params: backPath.params || {},
      });
    } else {
      router.push('/');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          <Text style={styles.title}>Desbloqueio de confiança</Text>

          <Text style={styles.description}>
            Caso você esteja com sua internet bloqueada por falta de pagamento, e você já efetuou o
            pagamento da fatura, clique no botão abaixo que iremos desbloquear sua internet na
            confiança durante 24 horas ate o pagamento da fatura constar no sistema
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.unlockButton, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={handleUnlock}
        >
          <Text style={styles.unlockButtonText}>Desbloquear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  unlockButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

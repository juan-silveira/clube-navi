import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, getBackPath } from '@/utils/navigationHelper';

export default function CashbackStatement() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Deserializa o breadcrumb recebido
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  // Dados mockados - virão do backend futuramente
  const pendingBalance = 0.00;

  const handleGoBack = () => {
    const backPath = getBackPath(currentBreadcrumb);
    if (backPath) {
      router.push({
        pathname: backPath.path as any,
        params: backPath.params || {},
      });
    } else {
      router.push('/(tabs)/cashback');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Extrato de Cashback</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resgate Cashback Card */}
        <View style={styles.section}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Resgate Cashback</Text>

            <View style={styles.divider} />

            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Total de pendentes:</Text>
              <Text style={styles.balanceAmount}>
                R$ {pendingBalance.toFixed(2).replace('.', ',')}
              </Text>
            </View>

            <View style={styles.divider} />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  balanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  balanceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 20,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  bottomSpacer: {
    height: 40,
  },
});

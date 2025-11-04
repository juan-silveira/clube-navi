import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function MeusPlanos() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentPath = usePathname();
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  // Dados mockados - virão do backend futuramente
  const plans = [
    {
      id: 1,
      name: 'Semi-Dedicado 1000MB + IP FIXO',
      address: 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho - 88058-338',
      contract: '450',
      status: 'Ativo',
    },
    {
      id: 2,
      name: 'Force TV - Start',
      address: 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho - 88058-338',
      contract: '348',
      status: 'Ativo',
    },
    {
      id: 3,
      name: 'Combo Force Max + Clube Black',
      address: 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho - 88058-338',
      contract: '168',
      status: 'Ativo',
    },
  ];

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
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus planos</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{plan.status}</Text>
              </View>

              {/* Plan Info */}
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planAddress}>{plan.address}</Text>
              <Text style={styles.planContract}>Contrato: {plan.contract}</Text>

              {/* Update Button */}
              <TouchableOpacity
                style={[styles.updateButton, { backgroundColor: whitelabelConfig.colors.primary }]}
                onPress={() => {
                  const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                  router.push({
                    pathname: '/(tabs)/upgrade-plan',
                    params: {
                      planId: plan.id,
                      planName: plan.name,
                      planAddress: plan.address,
                      planContract: plan.contract,
                      breadcrumb: serializeBreadcrumb(newBreadcrumb),
                    },
                  });
                }}
              >
                <Text style={styles.updateButtonText}>Atualizar plano</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.contractButton, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={() => {
            const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
            router.push({
              pathname: '/(tabs)/new-plan',
              params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
            });
          }}
        >
          <Text style={styles.contractButtonText}>Contratar novo plano</Text>
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
  notificationButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  plansContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    paddingRight: 80,
  },
  planAddress: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 8,
  },
  planContract: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '600',
    marginBottom: 16,
  },
  updateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 100,
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
  contractButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contractButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

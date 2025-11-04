import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function UpgradePlan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentPath = usePathname();
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  // Plano atual passado como parâmetro
  const currentPlan = {
    id: params.planId || '1',
    name: params.planName || 'Semi-Dedicado 1000MB + IP FIXO',
    address: params.planAddress || 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho - 88058-338',
    contract: params.planContract || '450',
    status: 'Ativo',
  };

  // Planos disponíveis mockados
  const availablePlans = [
    {
      id: 1,
      name: 'Básico 300MB',
      speed: '300 Mega',
      price: 'R$ 89,90',
      benefits: ['Wi-Fi incluso', 'Suporte 24h'],
    },
    {
      id: 2,
      name: 'Intermediário 600MB',
      speed: '600 Mega',
      price: 'R$ 129,90',
      benefits: ['Wi-Fi incluso', 'Suporte 24h', 'Instalação grátis'],
    },
    {
      id: 3,
      name: 'Semi-Dedicado 1000MB + IP FIXO',
      speed: '1 Giga',
      price: 'R$ 199,90',
      benefits: ['Wi-Fi incluso', 'Suporte 24h', 'IP fixo', 'Instalação grátis'],
      recommended: true,
    },
    {
      id: 4,
      name: 'Premium 1500MB',
      speed: '1.5 Giga',
      price: 'R$ 279,90',
      benefits: ['Wi-Fi incluso', 'Suporte 24h', 'IP fixo', 'Instalação grátis', 'Roteador premium'],
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
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

  const handleConfirm = () => {
    if (selectedPlan) {
      // Aqui será implementada a lógica de confirmação com o backend
      handleBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trocar plano atual</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plano Atual */}
        <View style={styles.section}>
          <View style={styles.currentPlanCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{currentPlan.status}</Text>
            </View>
            <Text style={styles.currentPlanName}>{currentPlan.name}</Text>
            <Text style={styles.currentPlanAddress}>{currentPlan.address}</Text>
            <Text style={styles.currentPlanContract}>Contrato: {currentPlan.contract}</Text>
          </View>
        </View>

        {/* Lista de Planos Disponíveis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escolha abaixo o seu novo plano</Text>

          {availablePlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
              ]}
              onPress={() => handleSelectPlan(plan.id)}
            >
              {plan.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: whitelabelConfig.colors.primary }]}>
                  <Text style={styles.recommendedText}>Recomendado</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planSpeed}>{plan.speed}</Text>
                </View>
                <Text style={[styles.planPrice, { color: whitelabelConfig.colors.primary }]}>
                  {plan.price}
                  <Text style={styles.planPricePeriod}>/mês</Text>
                </Text>
              </View>

              <View style={styles.benefitsList}>
                {plan.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={18} color={whitelabelConfig.colors.primary} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {selectedPlan === plan.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={whitelabelConfig.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      {selectedPlan && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: whitelabelConfig.colors.primary }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirmar mudança</Text>
          </TouchableOpacity>
        </View>
      )}
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
  currentPlanCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
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
  currentPlanName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    paddingRight: 80,
  },
  currentPlanAddress: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  currentPlanContract: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: whitelabelConfig.colors.primary,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  planSpeed: {
    fontSize: 14,
    color: '#8E8E93',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  planPricePeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function Invoices() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentPath = usePathname();
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Dados mockados - virão do backend futuramente
  const [currentPlan, setCurrentPlan] = useState({
    name: 'Semi-Dedicado 1000MB + IP FIXO',
    address: 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho...',
    contract: '450',
  });

  const allPlans = [
    {
      name: 'Semi-Dedicado 1000MB + IP FIXO',
      address: 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho - 88058-338',
      contract: '450',
    },
    {
      name: 'Force TV - Start',
      address: 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho - 88058-338',
      contract: '348',
    },
    {
      name: 'Combo Force Max + Clube Black',
      address: 'Servidão Rita Maria Garcia, Nº910, Ingleses do Rio Vermelho - 88058-338',
      contract: '168',
    },
  ];

  const handleSelectPlan = (plan: typeof currentPlan) => {
    setCurrentPlan(plan);
    setPlanExpanded(false);
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
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suas faturas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seu plano */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => setPlanExpanded(!planExpanded)}
          >
            <View style={styles.planCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{currentPlan.name}</Text>
                <Text style={styles.planAddress}>{currentPlan.address}</Text>
              </View>
              <Ionicons
                name={planExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Modal do dropdown */}
        <Modal
          visible={planExpanded}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPlanExpanded(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setPlanExpanded(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.planDropdownCard}>
                {allPlans.map((plan, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.planOption,
                      plan.name === currentPlan.name && styles.planOptionActive,
                      index !== allPlans.length - 1 && styles.planOptionBorder,
                    ]}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.planOptionName,
                        plan.name === currentPlan.name && styles.planOptionNameActive,
                      ]}>
                        {plan.name}
                      </Text>
                      <Text style={styles.planOptionAddress}>{plan.address}</Text>
                    </View>
                    {plan.name === currentPlan.name && (
                      <Ionicons name="checkmark-circle" size={24} color={whitelabelConfig.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Filtros */}
        <View style={styles.filtersSection}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive,
            ]}>
              Ver todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'overdue' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('overdue')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'overdue' && styles.filterButtonTextActive,
            ]}>
              Vencida
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'open' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('open')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'open' && styles.filterButtonTextActive,
            ]}>
              Em aberto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card de status */}
        <View style={styles.invoicesSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusText}>Tudo ok com</Text>
              <Text style={styles.statusText}>suas faturas :)</Text>
            </View>
            <View style={styles.statusRight}>
              <Image
                source={require('../../assets/images/illustration/invoices.png')}
                style={styles.statusImage}
                resizeMode="contain"
              />
            </View>
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
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.primary,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  planAddress: {
    fontSize: 13,
    color: '#8E8E93',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 240,
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  planDropdownCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  planOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  planOptionActive: {
    // Sem cor de fundo - apenas título colorido e checkmark
  },
  planOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  planOptionNameActive: {
    color: whitelabelConfig.colors.primary,
    fontWeight: '700',
  },
  planOptionAddress: {
    fontSize: 12,
    color: '#8E8E93',
  },
  filtersSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: whitelabelConfig.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  invoicesSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statusCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    overflow: 'hidden',
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  statusRight: {
    width: 180,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusImage: {
    width: '100%',
    height: '100%',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  bottomSpacer: {
    height: 40,
  },
});

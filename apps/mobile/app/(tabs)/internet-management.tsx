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

export default function Internet() {
  const router = useRouter();
  const currentPath = usePathname();
  const params = useLocalSearchParams();

  // Deserializa o breadcrumb recebido
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  const [planExpanded, setPlanExpanded] = useState(false);

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

  const benefits = [
    { icon: 'people-outline', label: 'Cashback', color: '#000', type: 'cashback' },
    { icon: 'film-outline', label: 'Cinema', color: '#E50914', type: 'cinema' },
  ];

  const specialLinks = [
    { icon: 'document-text-outline', label: 'Faturas', route: '/(tabs)/invoices' },
    { icon: 'shield-checkmark-outline', label: 'Desbloqueio', route: '/(tabs)/unlock' },
    { icon: 'headset-outline', label: 'Atendimento', route: '/support' },
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
      // Fallback para home se não houver breadcrumb
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
        <Text style={styles.headerTitle}>Internet</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seu plano */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seu plano</Text>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: whitelabelConfig.colors.primary }]}
              onPress={() => {
                const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                router.push({
                  pathname: '/(tabs)/my-plans',
                  params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
                });
              }}
            >
              <Text style={[styles.actionButtonText, { color: whitelabelConfig.colors.primary }]}>
                Meus planos
              </Text>
            </TouchableOpacity>
          </View>

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

        {/* Suas faturas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suas faturas</Text>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: whitelabelConfig.colors.primary }]}
              onPress={() => {
                const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                router.push({
                  pathname: '/(tabs)/invoices',
                  params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
                });
              }}
            >
              <Text style={[styles.actionButtonText, { color: whitelabelConfig.colors.primary }]}>
                Faturas em aberto
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.invoiceCard}>
            <View style={styles.invoiceLeft}>
              <Text style={styles.invoiceText}>Tudo ok com</Text>
              <Text style={styles.invoiceText}>suas faturas :)</Text>
            </View>
            <View style={styles.invoiceRight}>
              <Image
                source={require('../../assets/images/illustration/invoices.png')}
                style={styles.invoiceIllustration}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Benefícios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefícios</Text>

          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <TouchableOpacity
                key={index}
                style={styles.benefitCard}
                onPress={() => {
                  const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                  router.push({
                    pathname: '/(tabs)/benefit-detail',
                    params: {
                      type: benefit.type,
                      icon: benefit.icon,
                      label: benefit.label,
                      color: benefit.color,
                      breadcrumb: serializeBreadcrumb(newBreadcrumb),
                    },
                  });
                }}
              >
                <View style={[styles.benefitIcon, { backgroundColor: benefit.color }]}>
                  <Ionicons name={benefit.icon as any} size={32} color="#FFF" />
                </View>
                <Text style={styles.benefitLabel}>{benefit.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Links especiais */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Links especiais</Text>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: whitelabelConfig.colors.primary }]}
            >
              <Text style={[styles.actionButtonText, { color: whitelabelConfig.colors.primary }]}>
                Explorar opções
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linksContainer}>
            {specialLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.linkItem}
                onPress={() => {
                  if (link.route) {
                    const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
                    router.push({
                      pathname: link.route as any,
                      params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
                    });
                  }
                }}
              >
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIcon, { backgroundColor: whitelabelConfig.colors.primary + '20' }]}>
                    <Ionicons name={link.icon as any} size={24} color={whitelabelConfig.colors.primary} />
                  </View>
                  <Text style={styles.linkLabel}>{link.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={whitelabelConfig.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  notificationButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  invoiceCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    overflow: 'hidden',
    height: 150,
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 24,
  },
  invoiceRight: {
    width: 180,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceIllustration: {
    width: '100%',
    height: '100%',
  },
  invoiceText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  benefitsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  linksContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  linkIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
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
});

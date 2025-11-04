import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, addToBreadcrumb, getBackPath, serializeBreadcrumb } from '@/utils/navigationHelper';

export default function BenefitDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentPath = usePathname();

  // Deserializa o breadcrumb recebido
  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  // Dados do benefício passados como parâmetros
  const benefitType = params.type || 'cashback';
  const benefitIcon = params.icon || 'people-outline';
  const benefitLabel = params.label || 'Cashback';
  const benefitColor = params.color || '#000';

  // Configuração de benefícios
  const benefitConfig: { [key: string]: any } = {
    cashback: {
      title: 'Cashback',
      description: 'Tenha acesso a diversos parceiros de cashback no Brasil dentro do seu superapp.',
      steps: [
        '> 1 - Clique no botão "confira já" e aproveite.',
      ],
      route: '/(tabs)/cashback',
    },
    cinema: {
      title: 'Cinema',
      description: 'Aproveite descontos exclusivos em ingressos de cinema.',
      steps: [
        '> 1 - Clique no botão "confira já" e aproveite.',
      ],
      route: '/(tabs)/cinema',
    },
  };

  const currentBenefit = benefitConfig[benefitType as string] || benefitConfig.cashback;

  const handleBack = () => {
    const backPath = getBackPath(currentBreadcrumb);
    if (backPath) {
      router.push({
        pathname: backPath.path as any,
        params: backPath.params || {},
      });
    } else {
      router.push('/(tabs)/internet-management');
    }
  };

  const handleConfirm = () => {
    const newBreadcrumb = addToBreadcrumb(currentBreadcrumb, currentPath, params);
    router.push({
      pathname: currentBenefit.route,
      params: { breadcrumb: serializeBreadcrumb(newBreadcrumb) },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Benefícios</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {/* Benefit Icon */}
          <View style={[styles.benefitIcon, { backgroundColor: benefitColor }]}>
            <Ionicons name={benefitIcon as any} size={48} color="#FFF" />
          </View>

          {/* Benefit Title */}
          <Text style={styles.benefitTitle}>{currentBenefit.title}</Text>

          {/* Benefit Description */}
          <Text style={styles.benefitDescription}>
            {currentBenefit.description}
          </Text>

          {/* Passo-a-passo */}
          <View style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>Passo-a-passo</Text>

            <View style={styles.stepsCard}>
              {currentBenefit.steps.map((step: string, index: number) => (
                <Text key={index} style={styles.stepText}>
                  {step}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confira já</Text>
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
  benefitIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  benefitTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  benefitDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  stepsSection: {
    marginTop: 8,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  stepsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  stepText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 24,
    marginBottom: 8,
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

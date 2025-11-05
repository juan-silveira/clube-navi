import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { deserializeBreadcrumb, getBackPath } from '@/utils/navigationHelper';
import { apiService } from '@/services/api';
import BottomNav from '@/components/BottomNav';

interface ReferralStats {
  referralCode: string;
  referralDescription: string | null;
  totalReferrals: number;
  recentReferrals: Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    createdAt: string;
  }>;
}

export default function Referrals() {
  const router = useRouter();
  const currentPath = usePathname();
  const params = useLocalSearchParams();

  const currentBreadcrumb = deserializeBreadcrumb(params.breadcrumb as string);

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/auth/referral/stats');

      if (response.success && response.data) {
        setStats(response.data);
        setDescription(response.data.referralDescription || '');
      } else {
        Alert.alert('Erro', response.message || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      Alert.alert('Erro', 'Erro ao carregar estatísticas de indicações');
    } finally {
      setLoading(false);
    }
  };

  const saveDescription = async () => {
    if (!description.trim()) {
      Alert.alert('Atenção', 'A descrição não pode estar vazia');
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.put('/api/auth/referral/description', {
        referralDescription: description,
      });

      if (response.success) {
        setStats(prev => prev ? {
          ...prev,
          referralDescription: description,
        } : null);
        setIsEditing(false);
        Alert.alert('Sucesso', 'Descrição atualizada com sucesso!');
      } else {
        Alert.alert('Erro', response.message || 'Erro ao salvar descrição');
      }
    } catch (error) {
      console.error('Erro ao salvar descrição:', error);
      Alert.alert('Erro', 'Erro ao salvar descrição');
    } finally {
      setSaving(false);
    }
  };

  const shareReferralCode = async () => {
    try {
      await Share.share({
        message: `Use meu código de indicação ${stats?.referralCode} para se cadastrar no ${whitelabelConfig.branding.companyName}!\n\n${stats?.referralDescription || 'Junte-se a nós!'}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Indicações</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Indicações</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Código de Indicação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seu Código de Indicação</Text>
          <View style={[styles.codeCard, { borderColor: whitelabelConfig.colors.primary }]}>
            <View style={styles.codeContent}>
              <Ionicons name="gift" size={40} color={whitelabelConfig.colors.primary} />
              <View style={styles.codeInfo}>
                <Text style={styles.codeLabel}>Código</Text>
                <Text style={[styles.codeValue, { color: whitelabelConfig.colors.primary }]}>
                  {stats?.referralCode}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: whitelabelConfig.colors.primary }]}
              onPress={shareReferralCode}
            >
              <Ionicons name="share-social" size={20} color="#FFF" />
              <Text style={styles.shareButtonText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={24} color={whitelabelConfig.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva por que as pessoas devem se cadastrar com seu código..."
                placeholderTextColor="#8E8E93"
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setDescription(stats?.referralDescription || '');
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: whitelabelConfig.colors.primary }]}
                  onPress={saveDescription}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {stats?.referralDescription || 'Adicione uma descrição para seu código de indicação'}
              </Text>
            </View>
          )}
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsCard}>
            <View style={[styles.statItem, { backgroundColor: whitelabelConfig.colors.primary + '20' }]}>
              <Ionicons name="people" size={32} color={whitelabelConfig.colors.primary} />
              <Text style={styles.statValue}>{stats?.totalReferrals || 0}</Text>
              <Text style={styles.statLabel}>Indicações</Text>
            </View>
          </View>
        </View>

        {/* Minhas Indicações */}
        {stats && stats.recentReferrals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minhas Indicações ({stats.totalReferrals})</Text>
            {stats.recentReferrals.map((referral) => (
              <View key={referral.id} style={styles.referralItem}>
                <View style={[styles.referralIcon, { backgroundColor: whitelabelConfig.colors.primary + '20' }]}>
                  <Ionicons name="person" size={24} color={whitelabelConfig.colors.primary} />
                </View>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>{referral.name}</Text>
                  <Text style={styles.referralUsername}>@{referral.username}</Text>
                  <Text style={styles.referralEmail}>{referral.email}</Text>
                </View>
                <Text style={styles.referralDate}>{formatDate(referral.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  codeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeInfo: {
    marginLeft: 16,
  },
  codeLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  descriptionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  referralIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  referralUsername: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  referralEmail: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  referralDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

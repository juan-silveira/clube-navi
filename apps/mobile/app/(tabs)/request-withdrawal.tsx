import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import withdrawalService, {
  PixKeyType,
  WithdrawalRequest,
} from '@/src/services/withdrawalService';
import documentService from '@/src/services/documentService';
import whitelabelConfig from '@/whitelabel.config';
import authService from '@/src/services/authService';

export default function RequestWithdrawalScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Validações de elegibilidade
  const [isMerchant, setIsMerchant] = useState(false);
  const [kycApproved, setKycApproved] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);

  // Dados do formulário
  const [amount, setAmount] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('cpf');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyOwnerName, setPixKeyOwnerName] = useState('');
  const [pixKeyOwnerCpf, setPixKeyOwnerCpf] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Verificar tipo de usuário
      const userResponse = await authService.getProfile();
      if (!userResponse.success || !userResponse.data) {
        Alert.alert('Erro', 'Não foi possível carregar dados do usuário');
        router.back();
        return;
      }

      const user = userResponse.data;
      const isMerchantUser = user.userType === 'merchant';
      setIsMerchant(isMerchantUser);

      if (!isMerchantUser) {
        Alert.alert(
          'Acesso Negado',
          'Apenas lojistas podem solicitar saques. Consumidores não podem sacar saldo.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Verificar KYC aprovado
      const kycResponse = await documentService.getKYCStatus();
      if (kycResponse.success && kycResponse.data) {
        const approved = kycResponse.data.allApproved;
        setKycApproved(approved);

        if (!approved) {
          Alert.alert(
            'Verificação Pendente',
            'Você precisa ter sua identidade verificada antes de solicitar saques. Por favor, envie seus documentos.',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => router.back() },
              { text: 'Verificar Identidade', onPress: () => router.push('/(tabs)/kyc-upload') },
            ]
          );
          return;
        }
      }

      // Buscar saldo disponível
      const balanceResponse = await withdrawalService.getMerchantBalance();
      if (balanceResponse.success && balanceResponse.data) {
        setAvailableBalance(balanceResponse.data.availableBalance);
      }
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setAmount(formatted);
  };

  const getAmountValue = (): number => {
    const cleaned = amount.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const formatPixKey = (text: string, type: PixKeyType): string => {
    if (type === 'cpf') {
      const numbers = text.replace(/\D/g, '');
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }

    if (type === 'cnpj') {
      const numbers = text.replace(/\D/g, '');
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }

    if (type === 'phone') {
      const numbers = text.replace(/\D/g, '');
      if (numbers.length <= 10) {
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2');
      }
    }

    return text;
  };

  const handlePixKeyChange = (text: string) => {
    const formatted = formatPixKey(text, pixKeyType);
    setPixKey(formatted);
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    const amountValue = getAmountValue();

    // Validar valor mínimo
    if (amountValue < 10) {
      return { valid: false, error: 'O valor mínimo de saque é R$ 10,00' };
    }

    // Validar saldo disponível
    if (amountValue > availableBalance) {
      return {
        valid: false,
        error: `Saldo insuficiente. Disponível: ${withdrawalService.formatCurrency(availableBalance)}`,
      };
    }

    // Validar chave PIX (formato básico)
    const pixValidation = withdrawalService.validatePixKeyFormat(pixKey, pixKeyType);
    if (!pixValidation.valid) {
      return { valid: false, error: pixValidation.error };
    }

    // Validar nome do proprietário (obrigatório)
    if (!pixKeyOwnerName.trim()) {
      return { valid: false, error: 'Nome do proprietário da chave é obrigatório' };
    }

    // Validar CPF do proprietário (obrigatório)
    if (!pixKeyOwnerCpf.trim()) {
      return { valid: false, error: 'CPF do proprietário da chave é obrigatório' };
    }

    const cleanCpf = pixKeyOwnerCpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      return { valid: false, error: 'CPF do proprietário inválido' };
    }

    return { valid: true };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert('Erro de Validação', validation.error);
      return;
    }

    Alert.alert(
      'Confirmar Saque',
      `Você está solicitando um saque de ${withdrawalService.formatCurrency(getAmountValue())}.\n\nChave PIX: ${pixKey}\nNome: ${pixKeyOwnerName}\n\nO saque será analisado pela nossa equipe e processado em até 2 dias úteis.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: submitWithdrawal },
      ]
    );
  };

  const submitWithdrawal = async () => {
    try {
      setSubmitting(true);

      const data: WithdrawalRequest = {
        amount: getAmountValue(),
        pixKey: pixKey.replace(/\D/g, ''),
        pixKeyType,
        pixKeyOwnerName: pixKeyOwnerName.trim(),
        pixKeyOwnerCpf: pixKeyOwnerCpf.replace(/\D/g, ''),
      };

      const response = await withdrawalService.createWithdrawal(data);

      if (response.success) {
        Alert.alert(
          'Saque Solicitado',
          'Sua solicitação de saque foi enviada com sucesso! Você será notificado quando for processada.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível solicitar o saque');
      }
    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      Alert.alert('Erro', 'Não foi possível solicitar o saque');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (!isMerchant || !kycApproved) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitar Saque</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Saldo Disponível */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={24} color={whitelabelConfig.colors.primary} />
            <Text style={styles.balanceLabel}>Saldo Disponível</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {withdrawalService.formatCurrency(availableBalance)}
          </Text>
          <Text style={styles.balanceHint}>
            Saldo proveniente de vendas de produtos
          </Text>
        </View>

        {/* Informações */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            O saque será analisado pela nossa equipe e processado em até 2 dias úteis.
            Valor mínimo: R$ 10,00
          </Text>
        </View>

        {/* Valor do Saque */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Valor do Saque *</Text>
          <View style={styles.currencyInputContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.currencyInput}
              placeholder="0,00"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountChange}
            />
          </View>
          <Text style={styles.inputHint}>
            Disponível: {withdrawalService.formatCurrency(availableBalance)}
          </Text>
        </View>

        {/* Tipo de Chave PIX */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tipo de Chave PIX *</Text>
          <View style={styles.pixTypeContainer}>
            {(['cpf', 'cnpj', 'email', 'phone', 'random'] as PixKeyType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pixTypeButton,
                  pixKeyType === type && styles.pixTypeButtonActive,
                ]}
                onPress={() => {
                  setPixKeyType(type);
                  setPixKey('');
                }}
              >
                <Text
                  style={[
                    styles.pixTypeButtonText,
                    pixKeyType === type && styles.pixTypeButtonTextActive,
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chave PIX */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Chave PIX *</Text>
          <TextInput
            style={styles.input}
            placeholder={
              pixKeyType === 'cpf'
                ? '000.000.000-00'
                : pixKeyType === 'cnpj'
                ? '00.000.000/0000-00'
                : pixKeyType === 'email'
                ? 'email@exemplo.com'
                : pixKeyType === 'phone'
                ? '(00) 00000-0000'
                : 'Chave aleatória'
            }
            placeholderTextColor="#9ca3af"
            keyboardType={
              pixKeyType === 'email'
                ? 'email-address'
                : pixKeyType === 'cpf' || pixKeyType === 'cnpj' || pixKeyType === 'phone'
                ? 'numeric'
                : 'default'
            }
            value={pixKey}
            onChangeText={handlePixKeyChange}
            autoCapitalize="none"
          />
        </View>

        {/* Nome do Proprietário */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nome do Proprietário da Chave *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#9ca3af"
            value={pixKeyOwnerName}
            onChangeText={setPixKeyOwnerName}
            autoCapitalize="words"
          />
        </View>

        {/* CPF do Proprietário */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>CPF do Proprietário *</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={pixKeyOwnerCpf}
            onChangeText={(text) => setPixKeyOwnerCpf(formatPixKey(text, 'cpf'))}
          />
        </View>

        {/* Aviso de Segurança */}
        <View style={styles.warningCard}>
          <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          <Text style={styles.warningText}>
            Certifique-se que os dados da chave PIX estão corretos. Não nos
            responsabilizamos por transferências enviadas para chaves incorretas.
          </Text>
        </View>

        {/* Botão de Submissão */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cash" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Solicitar Saque</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  balanceHint: {
    fontSize: 13,
    color: '#9ca3af',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 14,
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  pixTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pixTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  pixTypeButtonActive: {
    borderColor: whitelabelConfig.colors.primary,
    backgroundColor: whitelabelConfig.colors.primary + '15',
  },
  pixTypeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  pixTypeButtonTextActive: {
    color: whitelabelConfig.colors.primary,
  },
  warningCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#065f46',
    lineHeight: 18,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: whitelabelConfig.colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

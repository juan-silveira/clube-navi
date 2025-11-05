import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';
import { depositService } from '@/services/deposit';

export default function DepositScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState<'amount' | 'qrcode' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [depositStatus, setDepositStatus] = useState({
    pixPaid: false,
    blockchainConfirmed: false,
  });

  // Formatar valor para BRL
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const numberValue = Number(numericValue) / 100;
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Converter valor digitado para número
  useEffect(() => {
    if (amount) {
      const numericValue = Number(amount.replace(/\D/g, '')) / 100;
      setDepositAmount(numericValue);
    } else {
      setDepositAmount(0);
    }
  }, [amount]);

  // Verificar status do pagamento periodicamente
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if ((step === 'qrcode' || step === 'processing') && transactionId) {
      interval = setInterval(async () => {
        const status = await depositService.checkDepositStatus(transactionId);

        if (status) {
          console.log('[DEPOSIT] Status recebido:', {
            pixPaid: status.pixPaid,
            blockchainConfirmed: status.blockchainConfirmed,
            status: status.status,
            currentStep: step,
          });

          setDepositStatus({
            pixPaid: status.pixPaid,
            blockchainConfirmed: status.blockchainConfirmed,
          });

          // PIX confirmado mas blockchain ainda processando
          if (status.pixPaid && !status.blockchainConfirmed && step === 'qrcode') {
            console.log('[DEPOSIT] Mudando para processing');
            setStep('processing');
          }

          // Tudo confirmado
          if (status.pixPaid && status.blockchainConfirmed) {
            console.log('[DEPOSIT] Tudo confirmado, mudando para success');
            clearInterval(interval);
            // Buscar txHash da resposta do status
            if (status.status === 'confirmed') {
              setTxHash((status as any).txHash || '');
            }
            setStep('success');
          }
        }
      }, 3000); // Verifica a cada 3 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, transactionId]);

  const handleContinue = async () => {
    if (!depositAmount || depositAmount <= 0 || !user) return;

    setLoading(true);
    try {
      // 1. Iniciar depósito
      const depositData = await depositService.initiateDeposit(depositAmount, user.id);
      if (!depositData) {
        Alert.alert('Erro', 'Não foi possível iniciar o depósito');
        return;
      }

      setTransactionId(depositData.transactionId);

      // 2. Criar cobrança PIX
      const pixData = await depositService.createPixCharge(depositData.transactionId, user.id);
      if (!pixData || !pixData.success) {
        Alert.alert('Erro', 'Não foi possível gerar o QR Code');
        return;
      }

      setQrCode(pixData.data.qrCode);
      setQrCodeImage(pixData.data.qrCodeImage);
      setStep('qrcode');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar seu depósito');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = () => {
    if (qrCode) {
      Clipboard.setString(qrCode);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência');
    }
  };

  const handleCopyTxHash = () => {
    if (txHash) {
      Clipboard.setString(txHash);
      Alert.alert('Copiado!', 'TX Hash copiado para a área de transferência');
    }
  };

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Quanto você quer depositar?</Text>
      <Text style={styles.subtitle}>Digite o valor que deseja adicionar à sua conta</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={formatCurrency(amount)}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="R$ 0,00"
          placeholderTextColor="#999"
        />
      </View>

      {depositAmount > 0 && (
        <View style={styles.feesContainer}>
          <View style={[styles.feeRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Você receberá</Text>
            <Text style={styles.totalValue}>
              {depositAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
          <Text style={styles.infoText}>
            {depositAmount.toFixed(2)} cBRL serão creditados na sua carteira
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: whitelabelConfig.colors.primary },
          (depositAmount <= 0 || loading) && styles.buttonDisabled
        ]}
        onPress={handleContinue}
        disabled={depositAmount <= 0 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Continuar</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderQRCodeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.qrHeader}>
        <Ionicons name="qr-code" size={40} color={whitelabelConfig.colors.primary} />
        <Text style={styles.title}>Escaneie o QR Code</Text>
        <Text style={styles.subtitle}>Use o app do seu banco para pagar</Text>
      </View>

      {qrCodeImage && (
        <View style={styles.qrCodeContainer}>
          <Image
            source={{ uri: qrCodeImage }}
            style={styles.qrCodeImage}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Valor a pagar</Text>
        <Text style={styles.amountValue}>
          {depositAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>

      {/* Campo com código PIX */}
      {qrCode && (
        <View style={styles.pixCodeContainer}>
          <Text style={styles.pixCodeLabel}>Código PIX Copia e Cola</Text>
          <View style={styles.pixCodeBox}>
            <Text style={styles.pixCodeText} numberOfLines={2} ellipsizeMode="middle">
              {qrCode}
            </Text>
          </View>
        </View>
      )}

      {/* Botão para copiar código PIX */}
      {qrCode && (
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={handleCopyPixCode}
        >
          <Ionicons name="copy-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Copiar código PIX</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <Text style={styles.infoBoxText}>
          O pagamento será confirmado automaticamente após a confirmação do PIX
        </Text>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
        <Text style={styles.processingTitle}>Processando na Blockchain</Text>
        <Text style={styles.processingSubtitle}>
          Seu pagamento PIX foi confirmado! Estamos realizando o mint de{' '}
          {depositAmount.toFixed(2)} cBRL na blockchain Azore.
        </Text>

        <View style={styles.processingSteps}>
          <View style={styles.processingStepItem}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={depositStatus.pixPaid ? whitelabelConfig.colors.primary : '#CCC'}
            />
            <Text style={[
              styles.processingStepText,
              depositStatus.pixPaid && styles.processingStepTextActive
            ]}>
              Pagamento PIX confirmado
            </Text>
          </View>

          <View style={styles.processingStepItem}>
            <ActivityIndicator
              size="small"
              color={whitelabelConfig.colors.primary}
            />
            <Text style={[styles.processingStepText, styles.processingStepTextActive]}>
              Realizando mint na blockchain...
            </Text>
          </View>

          <View style={styles.processingStepItem}>
            <Ionicons name="ellipse-outline" size={24} color="#CCC" />
            <Text style={styles.processingStepText}>
              Aguardando confirmação
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoBoxText}>
            Este processo pode levar alguns segundos. Aguarde...
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <View style={[styles.successIcon, { backgroundColor: whitelabelConfig.colors.primary }]}>
          <Ionicons name="checkmark" size={60} color="#FFF" />
        </View>
        <Text style={styles.successTitle}>Depósito realizado!</Text>
        <Text style={styles.successSubtitle}>
          {depositAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foram creditados na sua conta
        </Text>

        <View style={styles.successDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Valor depositado</Text>
            <Text style={styles.detailValue}>
              {depositAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>cBRL recebidos</Text>
            <Text style={styles.detailValue}>
              {depositAmount.toFixed(2)} cBRL
            </Text>
          </View>
          {txHash && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TX Hash</Text>
              <TouchableOpacity onPress={() => handleCopyTxHash()}>
                <Text style={[styles.detailValue, styles.txHashValue]} numberOfLines={1} ellipsizeMode="middle">
                  {txHash}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={styles.buttonText}>Voltar para início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: whitelabelConfig.colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Depositar</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, step === 'amount' && styles.progressDotActive]} />
        <View style={[styles.progressLine, (step === 'qrcode' || step === 'processing' || step === 'success') && styles.progressLineActive]} />
        <View style={[styles.progressDot, (step === 'qrcode' || step === 'processing') && styles.progressDotActive]} />
        <View style={[styles.progressLine, step === 'success' && styles.progressLineActive]} />
        <View style={[styles.progressDot, step === 'success' && styles.progressDotActive]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'amount' && renderAmountStep()}
        {step === 'qrcode' && renderQRCodeStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'success' && renderSuccessStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFF',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD',
  },
  progressDotActive: {
    backgroundColor: '#FFC107',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#DDD',
  },
  progressLineActive: {
    backgroundColor: '#FFC107',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  feesContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 16,
    color: '#666',
  },
  feeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrCodeContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeImage: {
    width: 250,
    height: 250,
  },
  amountBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pixCodeContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  pixCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  pixCodeBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pixCodeText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoBoxText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1976D2',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#999',
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  txHashValue: {
    color: '#1976D2',
    textDecorationLine: 'underline',
    maxWidth: 200,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  processingSteps: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  processingStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  processingStepText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
  },
  processingStepTextActive: {
    color: '#333',
    fontWeight: '600',
  },
});

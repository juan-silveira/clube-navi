import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { whitelabelConfig } from '@/config/whitelabel';
import { BlockchainBalance } from '@/services/blockchain';

interface BalanceCardProps {
  balance: BlockchainBalance | null;
  loadingBalance: boolean;
}

export default function BalanceCard({ balance, loadingBalance }: BalanceCardProps) {
  const router = useRouter();

  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceRow}>
        <Ionicons name="wallet-outline" size={20} color={whitelabelConfig.colors.primary} />
        <Text style={styles.balanceTitle}>Saldo disponível</Text>
      </View>
      {loadingBalance ? (
        <ActivityIndicator size="small" color={whitelabelConfig.colors.primary} style={styles.balanceLoader} />
      ) : (
        <Text style={styles.balanceValue}>{balance?.formattedBalance || 'R$ 0,00'}</Text>
      )}
      <Text style={styles.balanceSubtitle}>Saldo em cBRL na blockchain Azore</Text>

      {/* Ações rápidas */}
      <View style={styles.balanceActions}>
        <TouchableOpacity
          style={[styles.balanceActionButton, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={() => router.push('/deposit')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.balanceActionText}>Depositar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.balanceActionButton}
          onPress={() => router.push('/statement')}
        >
          <Ionicons name="list-outline" size={20} color={whitelabelConfig.colors.primary} />
          <Text style={[styles.balanceActionText, { color: whitelabelConfig.colors.primary }]}>Extrato</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  balanceLoader: {
    marginVertical: 12,
  },
  balanceSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  balanceActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  balanceActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

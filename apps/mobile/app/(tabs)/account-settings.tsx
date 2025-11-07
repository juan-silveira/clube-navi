import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function AccountSettings() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [downloadingData, setDownloadingData] = useState(false);

  const deleteReasons = [
    'Não uso mais o aplicativo',
    'Encontrei uma alternativa melhor',
    'Preocupações com privacidade',
    'Muitas notificações',
    'Problema técnico',
    'Outro motivo',
  ];

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await apiService.changePassword(currentPassword, newPassword);

      if (response.success) {
        Alert.alert('Sucesso', 'Senha alterada com sucesso!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível alterar a senha');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao alterar a senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDownloadData = async () => {
    Alert.alert(
      'Baixar Dados',
      'Você está prestes a baixar todos os seus dados. Este arquivo conterá suas informações pessoais, histórico de compras, produtos e transações.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Baixar',
          onPress: async () => {
            try {
              setDownloadingData(true);
              const response = await apiService.downloadUserData();

              if (response.success && response.data) {
                // Em produção, você salvaria o arquivo ou compartilharia
                // Por enquanto, vamos apenas mostrar uma mensagem
                Alert.alert(
                  'Dados Obtidos',
                  `Seus dados foram recuperados com sucesso. Em breve você receberá um email com o link para download.`,
                  [{ text: 'OK' }]
                );
                console.log('User data:', JSON.stringify(response.data, null, 2));
              } else {
                Alert.alert('Erro', response.message || 'Não foi possível obter os dados');
              }
            } catch (error) {
              console.error('Error downloading data:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao baixar os dados');
            } finally {
              setDownloadingData(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'excluir') {
      Alert.alert('Erro', 'Digite "excluir" para confirmar');
      return;
    }

    if (!deleteReason) {
      Alert.alert('Erro', 'Por favor, selecione um motivo');
      return;
    }

    Alert.alert(
      'Confirmação Final',
      'Tem certeza que deseja excluir sua conta? Esta ação é IRREVERSÍVEL e todos os seus dados serão perdidos permanentemente.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir Definitivamente',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

              const response = await apiService.deleteAccount(deleteReason);

              if (response.success) {
                Alert.alert(
                  'Conta Excluída',
                  'Sua conta foi excluída com sucesso. Sentiremos sua falta!',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Erro', response.message || 'Não foi possível excluir a conta');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir a conta');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações da Conta</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade e Segurança</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: whitelabelConfig.colors.primary + '15' }]}>
                <Ionicons name="lock-closed" size={24} color={whitelabelConfig.colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Alterar Senha</Text>
                <Text style={styles.settingDescription}>Modifique sua senha de acesso</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: whitelabelConfig.colors.success + '15' }]}>
                <Ionicons name="shield-checkmark" size={24} color={whitelabelConfig.colors.success} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Autenticação em Duas Etapas</Text>
                <Text style={styles.settingDescription}>Adicione uma camada extra de segurança</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Dados</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleDownloadData}
            disabled={downloadingData}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: whitelabelConfig.colors.warning + '15' }]}>
                <Ionicons name="download" size={24} color={whitelabelConfig.colors.warning} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Baixar Meus Dados</Text>
                <Text style={styles.settingDescription}>Faça download de todos os seus dados</Text>
              </View>
            </View>
            {downloadingData ? (
              <ActivityIndicator size="small" color={whitelabelConfig.colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            )}
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: whitelabelConfig.colors.danger }]}>
            Zona de Perigo
          </Text>

          {!showDeleteConfirm ? (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: whitelabelConfig.colors.danger }]}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Ionicons name="trash" size={24} color={whitelabelConfig.colors.danger} />
              <Text style={[styles.dangerButtonText, { color: whitelabelConfig.colors.danger }]}>
                Excluir Minha Conta
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.deleteConfirmCard}>
              <View style={styles.deleteWarning}>
                <Ionicons name="warning" size={48} color={whitelabelConfig.colors.danger} />
                <Text style={styles.deleteWarningTitle}>Atenção!</Text>
                <Text style={styles.deleteWarningText}>
                  Esta ação é PERMANENTE e IRREVERSÍVEL. Todos os seus dados serão excluídos:
                </Text>
              </View>

              <View style={styles.deleteList}>
                <View style={styles.deleteListItem}>
                  <Ionicons name="close-circle" size={20} color={whitelabelConfig.colors.danger} />
                  <Text style={styles.deleteListText}>Histórico de compras</Text>
                </View>
                <View style={styles.deleteListItem}>
                  <Ionicons name="close-circle" size={20} color={whitelabelConfig.colors.danger} />
                  <Text style={styles.deleteListText}>Saldo de cashback</Text>
                </View>
                <View style={styles.deleteListItem}>
                  <Ionicons name="close-circle" size={20} color={whitelabelConfig.colors.danger} />
                  <Text style={styles.deleteListText}>Produtos cadastrados</Text>
                </View>
                <View style={styles.deleteListItem}>
                  <Ionicons name="close-circle" size={20} color={whitelabelConfig.colors.danger} />
                  <Text style={styles.deleteListText}>Indicações e referências</Text>
                </View>
                <View style={styles.deleteListItem}>
                  <Ionicons name="close-circle" size={20} color={whitelabelConfig.colors.danger} />
                  <Text style={styles.deleteListText}>Documentos KYC</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Por que você está saindo?</Text>
                {deleteReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      deleteReason === reason && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setDeleteReason(reason)}
                  >
                    <Ionicons
                      name={deleteReason === reason ? 'radio-button-on' : 'radio-button-off'}
                      size={24}
                      color={
                        deleteReason === reason
                          ? whitelabelConfig.colors.primary
                          : '#CCC'
                      }
                    />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Digite <Text style={styles.confirmKeyword}>excluir</Text> para confirmar:
                </Text>
                <TextInput
                  style={styles.confirmInput}
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="Digite 'excluir'"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText('');
                    setDeleteReason('');
                  }}
                >
                  <Text style={styles.cancelDeleteText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmDeleteButton,
                    { backgroundColor: whitelabelConfig.colors.danger },
                    (confirmText.toLowerCase() !== 'excluir' || !deleteReason || deleting) &&
                      styles.confirmDeleteButtonDisabled,
                  ]}
                  onPress={handleDeleteAccount}
                  disabled={
                    confirmText.toLowerCase() !== 'excluir' || !deleteReason || deleting
                  }
                >
                  {deleting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="trash" size={20} color="#FFF" />
                      <Text style={styles.confirmDeleteText}>Excluir Conta</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Senha</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={28} color={whitelabelConfig.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Senha Atual</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Digite sua senha atual"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nova Senha</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inputHint}>Mínimo de 8 caracteres</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Digite novamente a nova senha"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  { backgroundColor: whitelabelConfig.colors.primary },
                  (!currentPassword || !newPassword || !confirmPassword || changingPassword) &&
                    styles.modalConfirmButtonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Alterar Senha</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whitelabelConfig.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: whitelabelConfig.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: whitelabelConfig.colors.white,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteConfirmCard: {
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: whitelabelConfig.colors.danger,
  },
  deleteWarning: {
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteWarningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.danger,
    marginTop: 12,
    marginBottom: 8,
  },
  deleteWarningText: {
    fontSize: 15,
    color: whitelabelConfig.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteList: {
    backgroundColor: whitelabelConfig.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  deleteListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteListText: {
    fontSize: 14,
    color: whitelabelConfig.colors.text,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 12,
  },
  confirmKeyword: {
    fontWeight: 'bold',
    color: whitelabelConfig.colors.danger,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: whitelabelConfig.colors.background,
  },
  reasonOptionSelected: {
    backgroundColor: whitelabelConfig.colors.primary + '10',
  },
  reasonText: {
    fontSize: 14,
    color: whitelabelConfig.colors.text,
  },
  confirmInput: {
    backgroundColor: whitelabelConfig.colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: whitelabelConfig.colors.text,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDeleteButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.textSecondary,
  },
  confirmDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  confirmDeleteButtonDisabled: {
    opacity: 0.5,
  },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: whitelabelConfig.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
  },
  modalBody: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: whitelabelConfig.colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: whitelabelConfig.colors.text,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
  },
  inputHint: {
    fontSize: 13,
    color: whitelabelConfig.colors.textSecondary,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButtonDisabled: {
    opacity: 0.5,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

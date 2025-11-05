import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadService } from '@/services/upload';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const hasProfilePicture = user?.profilePicture && user.profilePicture !== 'https://via.placeholder.com/60';

  const handlePickImage = async (useCamera: boolean) => {
    try {
      setShowImageModal(false);

      // Solicitar permissões
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert(
          'Permissão necessária',
          `Precisamos de permissão para acessar ${useCamera ? 'a câmera' : 'suas fotos'}.`
        );
        return;
      }

      // Abrir câmera ou galeria
      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao selecionar a imagem');
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setUploadingImage(true);

      const uploadResult = await uploadService.uploadProfilePicture(imageUri);

      if (uploadResult.success && uploadResult.imageUrl) {
        // Atualizar o usuário no store com a nova foto
        if (user) {
          updateUser({
            ...user,
            profilePicture: uploadResult.imageUrl,
          });
        }
        Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
      } else {
        Alert.alert('Erro', uploadResult.error || 'Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };
  const menuSections = [
    {
      title: 'Compras',
      items: [
        { icon: 'cube-outline', label: 'Meus pedidos', badge: '3' },
        { icon: 'heart-outline', label: 'Favoritos', badge: null },
        { icon: 'time-outline', label: 'Vistos recentemente', badge: null },
        { icon: 'star-outline', label: 'Avaliações', badge: null },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { icon: 'card-outline', label: 'Formas de pagamento', badge: null },
        { icon: 'wallet-outline', label: 'Saldo e cupons', badge: '2' },
        { icon: 'receipt-outline', label: 'Faturas', badge: null },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { icon: 'person-outline', label: 'Dados pessoais', badge: null },
        { icon: 'location-outline', label: 'Endereços', badge: null },
        { icon: 'notifications-outline', label: 'Notificações', badge: null },
        { icon: 'lock-closed-outline', label: 'Segurança', badge: null },
        { icon: 'help-circle-outline', label: 'Ajuda', badge: null },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header com perfil */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowImageModal(true)}
            disabled={uploadingImage}
          >
            {hasProfilePicture ? (
              <Image
                source={{ uri: user?.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: whitelabelConfig.colors.primary }]}>
                <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            {/* Ícone de câmera */}
            <View style={[styles.cameraIcon, { backgroundColor: whitelabelConfig.colors.primary }]}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={18} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.email}>{user?.email || 'email@exemplo.com'}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={14} color={whitelabelConfig.colors.primary} />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={28} color="#FFD60A" />
          <Text style={styles.statCardValue}>Prata</Text>
          <Text style={styles.statCardLabel}>Nível</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={28} color="#FFD60A" />
          <Text style={styles.statCardValue}>850</Text>
          <Text style={styles.statCardLabel}>Pontos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="gift" size={28} color={whitelabelConfig.colors.primary} />
          <Text style={styles.statCardValue}>2</Text>
          <Text style={styles.statCardLabel}>Cupons</Text>
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuItems}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex === section.items.length - 1 && styles.menuItemLast
                ]}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={24} color={whitelabelConfig.colors.text} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Últimas compras */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Compras recentes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.purchasesList}>
          {[1, 2].map((item) => (
            <TouchableOpacity key={item} style={styles.purchaseItem}>
              <Image
                source={{ uri: 'https://via.placeholder.com/60' }}
                style={styles.purchaseImage}
              />
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseTitle}>Produto Exemplo {item}</Text>
                <Text style={styles.purchaseStatus}>Entregue em 15/10/2024</Text>
                <Text style={styles.purchasePrice}>R$ 99,90</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={whitelabelConfig.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Espaçamento final */}
      <View style={{ height: 20 }} />

      {/* Modal de seleção de imagem */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar foto de perfil</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handlePickImage(true)}
            >
              <Ionicons name="camera" size={24} color={whitelabelConfig.colors.primary} />
              <Text style={styles.modalButtonText}>Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handlePickImage(false)}
            >
              <Ionicons name="images" size={24} color={whitelabelConfig.colors.primary} />
              <Text style={styles.modalButtonText}>Escolher da galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={24} color={whitelabelConfig.colors.error} />
              <Text style={[styles.modalButtonText, { color: whitelabelConfig.colors.error }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whitelabelConfig.colors.background,
  },
  header: {
    backgroundColor: whitelabelConfig.colors.white,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: whitelabelConfig.colors.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: whitelabelConfig.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.white,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: whitelabelConfig.colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: whitelabelConfig.colors.textSecondary,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: whitelabelConfig.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: whitelabelConfig.colors.white,
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: whitelabelConfig.colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: whitelabelConfig.colors.white,
    marginTop: 8,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: whitelabelConfig.colors.primary,
  },
  menuItems: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    color: whitelabelConfig.colors.text,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: whitelabelConfig.colors.error,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: whitelabelConfig.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  purchasesList: {
    paddingHorizontal: 16,
  },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: whitelabelConfig.colors.border,
  },
  purchaseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: whitelabelConfig.colors.background,
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  purchaseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 4,
  },
  purchaseStatus: {
    fontSize: 13,
    color: whitelabelConfig.colors.success,
    marginBottom: 2,
  },
  purchasePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: whitelabelConfig.colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: whitelabelConfig.colors.background,
    marginBottom: 12,
  },
  modalButtonCancel: {
    backgroundColor: '#FFE5E5',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginLeft: 16,
  },
});

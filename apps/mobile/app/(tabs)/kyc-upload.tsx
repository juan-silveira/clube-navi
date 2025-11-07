import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import documentService, {
  DocumentType,
  DocumentStatus,
  UserDocument,
} from '@/src/services/documentService';
import whitelabelConfig from '@/whitelabel.config';

interface DocumentState {
  front: UserDocument | null;
  back: UserDocument | null;
  selfie: UserDocument | null;
}

interface UploadingState {
  front: boolean;
  back: boolean;
  selfie: boolean;
}

export default function KYCUploadScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<DocumentState>({
    front: null,
    back: null,
    selfie: null,
  });
  const [uploading, setUploading] = useState<UploadingState>({
    front: false,
    back: false,
    selfie: false,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.listDocuments();

      if (response.success && response.data) {
        const newDocuments: DocumentState = {
          front: response.data.find(d => d.documentType === 'front') || null,
          back: response.data.find(d => d.documentType === 'back') || null,
          selfie: response.data.find(d => d.documentType === 'selfie') || null,
        };
        setDocuments(newDocuments);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus documentos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  }, []);

  const pickImage = async (documentType: DocumentType) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão Negada', 'Você precisa permitir acesso às fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(documentType, result.assets[0].uri);
    }
  };

  const takePhoto = async (documentType: DocumentType) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão Negada', 'Você precisa permitir acesso à câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(documentType, result.assets[0].uri);
    }
  };

  const showImagePickerOptions = (documentType: DocumentType) => {
    Alert.alert('Escolha uma opção', 'Como deseja enviar a foto?', [
      { text: 'Tirar Foto', onPress: () => takePhoto(documentType) },
      { text: 'Escolher da Galeria', onPress: () => pickImage(documentType) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const uploadDocument = async (documentType: DocumentType, imageUri: string) => {
    try {
      setUploading(prev => ({ ...prev, [documentType]: true }));

      const response = await documentService.uploadDocument(documentType, imageUri);

      if (response.success && response.data) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: response.data!,
        }));
        Alert.alert('Sucesso', 'Documento enviado com sucesso!');
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível enviar o documento');
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      Alert.alert('Erro', 'Não foi possível enviar o documento');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Em análise';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Não enviado';
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
        return 'close-circle';
      default:
        return 'document-outline';
    }
  };

  const renderDocumentCard = (
    documentType: DocumentType,
    title: string,
    description: string,
    icon: any
  ) => {
    const document = documents[documentType];
    const isUploading = uploading[documentType];
    const status = document?.status || 'not_sent';

    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentTitleContainer}>
            <Ionicons name={icon} size={24} color={whitelabelConfig.colors.primary} />
            <View style={styles.documentTitleText}>
              <Text style={styles.documentTitle}>{title}</Text>
              <Text style={styles.documentDescription}>{description}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) + '20' },
            ]}
          >
            <Ionicons
              name={getStatusIcon(status) as any}
              size={16}
              color={getStatusColor(status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {getStatusLabel(status)}
            </Text>
          </View>
        </View>

        {document?.s3Url && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: document.s3Url }} style={styles.imagePreview} />
          </View>
        )}

        {document?.rejectionReason && (
          <View style={styles.rejectionContainer}>
            <Ionicons name="warning" size={16} color="#ef4444" />
            <Text style={styles.rejectionText}>{document.rejectionReason}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.uploadButton,
            isUploading && styles.uploadButtonDisabled,
            status === 'approved' && styles.uploadButtonSuccess,
          ]}
          onPress={() => showImagePickerOptions(documentType)}
          disabled={isUploading || status === 'approved'}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={document ? 'refresh' : 'camera'}
                size={20}
                color="#fff"
              />
              <Text style={styles.uploadButtonText}>
                {status === 'approved'
                  ? 'Documento Aprovado'
                  : document
                  ? 'Atualizar Foto'
                  : 'Enviar Foto'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
        <Text style={styles.loadingText}>Carregando documentos...</Text>
      </View>
    );
  }

  const allApproved =
    documents.front?.status === 'approved' &&
    documents.back?.status === 'approved' &&
    documents.selfie?.status === 'approved';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificação de Identidade</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Geral */}
        {allApproved && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.successBannerText}>
              Seus documentos foram aprovados!
            </Text>
          </View>
        )}

        {/* Informações */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={whitelabelConfig.colors.primary} />
          <Text style={styles.infoText}>
            Para garantir a segurança da plataforma, precisamos verificar sua
            identidade. Envie fotos claras dos seus documentos.
          </Text>
        </View>

        {/* Documento Frente */}
        {renderDocumentCard(
          'front',
          'Documento - Frente',
          'RG ou CNH (frente)',
          'card-outline'
        )}

        {/* Documento Verso */}
        {renderDocumentCard(
          'back',
          'Documento - Verso',
          'RG ou CNH (verso)',
          'card-outline'
        )}

        {/* Selfie */}
        {renderDocumentCard(
          'selfie',
          'Selfie com Documento',
          'Foto segurando o documento',
          'person-outline'
        )}

        {/* Dicas */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Dicas para uma boa foto:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark" size={16} color="#10b981" />
            <Text style={styles.tipText}>Tire a foto em um local bem iluminado</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark" size={16} color="#10b981" />
            <Text style={styles.tipText}>
              Certifique-se que todos os dados estão legíveis
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark" size={16} color="#10b981" />
            <Text style={styles.tipText}>Não use flash para evitar reflexos</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark" size={16} color="#10b981" />
            <Text style={styles.tipText}>
              Na selfie, seu rosto e documento devem estar visíveis
            </Text>
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#10b98120',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  successBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  documentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentTitleContainer: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  documentTitleText: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  documentDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginVertical: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  rejectionContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  rejectionText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: whitelabelConfig.colors.primary,
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonSuccess: {
    backgroundColor: '#10b981',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  bottomSpacer: {
    height: 40,
  },
});

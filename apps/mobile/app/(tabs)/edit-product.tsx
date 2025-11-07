import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import productService from '@/src/services/productService';
import { Product } from '@/src/types/product';
import whitelabelConfig from '@/whitelabel.config';

export default function EditProductScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cashbackPercentage: '',
    category: '',
    stock: '',
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(productId);

      if (response.success && response.data) {
        const productData = response.data.product || response.data;
        setProduct(productData);

        // Preencher formulário com dados existentes
        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          cashbackPercentage: productData.cashbackPercentage.toString(),
          category: productData.category,
          stock: productData.stock.toString(),
        });

        // Definir imagem atual
        if (productData.images && productData.images.length > 0) {
          setImageUri(productData.images[0]);
        } else if (productData.imageUrl) {
          setImageUri(productData.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Erro', 'Não foi possível carregar o produto');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão Negada', 'Você precisa permitir acesso às fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão Negada', 'Você precisa permitir acesso à câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Alterar Foto', 'Escolha uma opção', [
      { text: 'Tirar Foto', onPress: takePhoto },
      { text: 'Escolher da Galeria', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Erro', 'Preço deve ser maior que zero');
      return false;
    }
    if (!formData.cashbackPercentage || parseFloat(formData.cashbackPercentage) < 0) {
      Alert.alert('Erro', 'Cashback deve ser maior ou igual a zero');
      return false;
    }
    if (parseFloat(formData.cashbackPercentage) > 100) {
      Alert.alert('Erro', 'Cashback não pode ser maior que 100%');
      return false;
    }
    if (!formData.category.trim()) {
      Alert.alert('Erro', 'Categoria é obrigatória');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Erro', 'Estoque deve ser maior ou igual a zero');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Atualizar produto
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        cashbackPercentage: parseFloat(formData.cashbackPercentage),
        category: formData.category.trim(),
        stock: parseInt(formData.stock),
      };

      const response = await productService.updateProduct(productId, productData);

      if (!response.success) {
        throw new Error('Erro ao atualizar produto');
      }

      // Upload de nova imagem se houver mudança
      if (imageChanged && imageUri && !imageUri.startsWith('http')) {
        try {
          await productService.uploadProductImage(productId, imageUri);
        } catch (imageError) {
          console.warn('Erro ao fazer upload da imagem:', imageError);
          // Não falhar a atualização do produto por causa da imagem
        }
      }

      Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating product:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={whitelabelConfig.colors.primary} />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Produto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Upload de Imagem */}
        <TouchableOpacity style={styles.imageContainer} onPress={showImagePickerOptions}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <View style={styles.imageOverlay}>
                <Ionicons name="camera-outline" size={32} color="#fff" />
                <Text style={styles.imageOverlayText}>Alterar Foto</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>Adicionar Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Produto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Notebook Dell Inspiron"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva seu produto..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cashback (%) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                value={formData.cashbackPercentage}
                onChangeText={(text) =>
                  setFormData({ ...formData, cashbackPercentage: text })
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Categoria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Eletrônicos"
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Estoque *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: whitelabelConfig.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

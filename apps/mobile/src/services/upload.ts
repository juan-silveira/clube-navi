import { API_URL } from '@/constants/api';
import { apiService } from './api';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

class UploadService {
  /**
   * Faz upload de uma imagem para o S3
   */
  async uploadProfilePicture(imageUri: string): Promise<UploadResult> {
    try {
      const token = await apiService.getAccessToken();

      if (!token) {
        return {
          success: false,
          error: 'Não autenticado',
        };
      }

      // Criar FormData com a imagem
      const formData = new FormData();

      // Extrair informações do arquivo
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Adicionar imagem ao FormData
      formData.append('profilePicture', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      console.log('📤 Uploading image to:', `${API_URL}/api/users/profile-picture`);

      const response = await fetch(`${API_URL}/api/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Não definir Content-Type, deixar o fetch definir automaticamente para multipart/form-data
        },
        body: formData,
      });

      console.log('📡 Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to upload image:', response.status, errorText);
        return {
          success: false,
          error: `Erro ao fazer upload: ${response.status}`,
        };
      }

      const data = await response.json();
      console.log('✅ Upload successful:', data);

      if (data.success && data.data?.profilePicture) {
        return {
          success: true,
          imageUrl: data.data.profilePicture,
        };
      }

      return {
        success: false,
        error: 'Resposta inválida do servidor',
      };
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;

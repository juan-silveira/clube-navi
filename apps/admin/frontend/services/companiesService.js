import axios from 'axios';
import useAuthStore from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Interceptador para incluir token de autenticação
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

  // Interceptador de request
  instance.interceptors.request.use(
    (config) => {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptador de response
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token inválido - fazer logout
        const companyAlias = useAuthStore.getState().logout();
        window.location.href = `/login/${companyAlias}`;
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createAxiosInstance();

export const companiesService = {
  // Listar todas as empresas
  async getCompanies() {
    try {
      const response = await api.get('/api/admin/companies');
      return {
        success: true,
        data: response.data.data,
        total: response.data.total
      };
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar empresas',
        error: error
      };
    }
  },

  // Obter branding de uma empresa
  async getCompanyBranding(companyId) {
    try {
      console.log('🌐 [CompaniesService] Fazendo requisição GET para:', `/api/admin/companies/${companyId}/branding`);
      const response = await api.get(`/api/admin/companies/${companyId}/branding`);
      console.log('✅ [CompaniesService] Resposta recebida:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ [CompaniesService] Erro ao obter branding:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter branding',
        error: error
      };
    }
  },

  // Salvar configurações completas de branding
  async updateBranding(companyId, brandingData) {
    try {
      const response = await api.put(`/api/admin/companies/${companyId}/branding`, brandingData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erro ao salvar branding:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao salvar configurações',
        error: error
      };
    }
  },

  // Upload de asset de branding (logo, favicon, etc)
  async uploadBrandingAsset(companyId, file, assetType) {
    try {
      console.log('🔄 [CompaniesService] Iniciando upload:', {
        companyId,
        assetType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 [CompaniesService] Enviando para API:', `/api/admin/companies/${companyId}/branding/upload/${assetType}`);

      const response = await api.post(
        `/api/admin/companies/${companyId}/branding/upload/${assetType}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ [CompaniesService] Upload bem-sucedido:', {
        status: response.status,
        data: response.data
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ [CompaniesService] Erro ao fazer upload:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar arquivo',
        error: error
      };
    }
  },

  // Deletar asset de branding
  async deleteBrandingAsset(companyId, assetType) {
    try {
      const response = await api.delete(`/api/admin/companies/${companyId}/branding/asset/${assetType}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao deletar asset',
        error: error
      };
    }
  },

  // Alterar status da empresa (ativar/desativar)
  async updateCompanyStatus(companyId, status) {
    try {
      const response = await api.patch(`/api/admin/companies/${companyId}/status`, { status });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar status',
        error: error
      };
    }
  },

  // Validar arquivo antes do upload
  validateFile(file, maxSize = 5 * 1024 * 1024) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/x-icon'
    ];

    if (!file) {
      return { valid: false, message: 'Nenhum arquivo selecionado' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: 'Tipo de arquivo não permitido. Use: JPG, PNG, GIF, WebP, SVG ou ICO' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        message: `Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB` 
      };
    }

    return { valid: true };
  },

  // Gerar preview de arquivo
  generateFilePreview(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nenhum arquivo fornecido'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          name: file.name,
          size: file.size,
          type: file.type
        });
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsDataURL(file);
    });
  },

  // Formatar tamanho do arquivo
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Obter extensão do arquivo
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  },

  // Verificar se é imagem
  isImageFile(file) {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return file && imageTypes.includes(file.type);
  },

  // Mapear tipos de asset para labels em português
  getAssetTypeLabel(assetType) {
    const labels = {
      'logo': 'Logo Principal',
      'logo-dark': 'Logo Escura',
      'mini': 'Mini Logo',
      'mini-dark': 'Mini Logo Escura',
      'text': 'Logo Texto',
      'text-dark': 'Logo Texto Escura',
      'favicon': 'Favicon',
      'background': 'Imagem de Fundo'
    };
    return labels[assetType] || assetType;
  },

  // Obter URL de preview para asset type
  getAssetPreviewUrl(branding, assetType) {
    if (!branding) return null;
    
    const fieldMap = {
      'logo': 'logoUrl',
      'logo-dark': 'logoUrlDark',
      'mini': 'miniUrl',
      'mini-dark': 'miniUrlDark',
      'text': 'textUrl',
      'text-dark': 'textUrlDark',
      'favicon': 'faviconUrl', 
      'background': 'backgroundImageUrl'
    };

    return branding[fieldMap[assetType]] || null;
  }
};

export default companiesService;
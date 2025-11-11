import { useState, useCallback } from 'react';

/**
 * Hook para lidar com fallback de imagens quebradas
 */
const useImageFallback = (fallbackUrl) => {
  const [hasError, setHasError] = useState(false);

  const handleImageError = useCallback(() => {
    if (!hasError) {
      // console.warn('🖼️ Imagem falhou ao carregar, usando fallback');
      setHasError(true);
    }
  }, [hasError]);

  const resetImage = useCallback(() => {
    setHasError(false);
  }, []);

  const getImageSrc = useCallback((originalSrc) => {
    // Se houve erro, usar fallback. Senão, usar URL original
    return hasError ? fallbackUrl : originalSrc;
  }, [fallbackUrl, hasError]);

  return {
    getImageSrc,
    handleImageError,
    resetImage,
    hasError
  };
};

export default useImageFallback;
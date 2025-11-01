import { useState, useEffect } from 'react';
import api from '@/services/api';

/**
 * Hook para verificar se os documentos do usuário estão aprovados
 * @returns {Object} { isValidated, isLoading, documents }
 */
const useDocumentValidation = () => {
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState({
    front: null,
    back: null,
    selfie: null
  });

  useEffect(() => {
    checkDocuments();
  }, []);

  const checkDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/user-documents');

      if (response.data.success && response.data.data) {
        const docsMap = {};
        response.data.data.forEach(doc => {
          docsMap[doc.documentType] = doc;
        });
        setDocuments(docsMap);

        // Verificar se todos os 3 documentos estão aprovados
        const allApproved = ['front', 'back', 'selfie'].every(
          type => docsMap[type]?.status === 'approved'
        );

        setIsValidated(allApproved);
      } else {
        setIsValidated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar documentos:', error);
      setIsValidated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { isValidated, isLoading, documents, refetch: checkDocuments };
};

export default useDocumentValidation;

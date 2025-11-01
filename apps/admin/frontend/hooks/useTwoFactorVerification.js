import { useState, useEffect } from 'react';
import api from '@/services/api';

/**
 * Hook personalizado para verificação 2FA em operações sensíveis
 * @param {string} operation - Nome da operação (withdraw, transfer, etc)
 * @returns {object} - Objeto com métodos e estados do 2FA
 */
const useTwoFactorVerification = (operation = 'withdraw') => {
  const [requires2FA, setRequires2FA] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState(null);

  // Verificar se o usuário tem 2FA configurado
  useEffect(() => {
    checkTwoFactorRequirement();
  }, [operation]);

  const checkTwoFactorRequirement = async () => {
    try {
      setIsChecking(true);
      const response = await api.get('/api/2fa/check-requirement', {
        params: { operation }
      });

      if (response.data.success) {
        setRequires2FA(response.data.data.requires2FA);
        setHas2FA(response.data.data.has2FA);
      }
    } catch (error) {
      console.error('Erro ao verificar requisito 2FA:', error);
      // Em caso de erro, não bloquear a operação
      setRequires2FA(false);
      setHas2FA(false);
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Inicia o processo de verificação 2FA
   * @param {function} onSuccess - Callback chamado após verificação bem-sucedida
   * @returns {Promise<boolean>} - True se deve continuar com a operação
   */
  const verify2FA = async (onSuccess) => {
    // Se não tem 2FA configurado, continua normalmente
    if (!has2FA || !requires2FA) {
      if (onSuccess) onSuccess(null);
      return true;
    }

    // SEMPRE pedir 2FA para cada operação (sem cache)
    // Resetar código verificado anterior
    setVerifiedCode(null);

    // Mostra modal de verificação
    return new Promise((resolve, reject) => {
      setShowVerificationModal(true);

      // Guarda o callback para ser chamado após verificação
      window._2faCallback = (code) => {
        if (onSuccess) onSuccess(code);
        resolve(true);
      };

      // Callback de erro para permitir nova tentativa
      window._2faErrorCallback = () => {
        reject(new Error('2FA verification failed'));
      };
    });
  };

  /**
   * Callback chamado quando o código 2FA é verificado com sucesso
   */
  const handleVerificationSuccess = (code) => {
    setShowVerificationModal(false);

    // Chama o callback se existir
    if (window._2faCallback) {
      window._2faCallback(code);
      delete window._2faCallback;
      delete window._2faErrorCallback;
    }
  };

  /**
   * Callback chamado quando ocorre erro na verificação
   */
  const handleVerificationError = () => {
    // Não fecha o modal, apenas reseta o código
    setVerifiedCode(null);

    // Chama o callback de erro se existir
    if (window._2faErrorCallback) {
      window._2faErrorCallback();
      delete window._2faCallback;
      delete window._2faErrorCallback;
    }
  };

  /**
   * Reseta o estado de verificação
   */
  const reset = () => {
    setVerifiedCode(null);
    setShowVerificationModal(false);
    if (window._2faCallback) delete window._2faCallback;
    if (window._2faErrorCallback) delete window._2faErrorCallback;
  };

  return {
    requires2FA,
    has2FA,
    isChecking,
    showVerificationModal,
    setShowVerificationModal,
    verifiedCode,
    verify2FA,
    handleVerificationSuccess,
    handleVerificationError,
    reset,
    checkTwoFactorRequirement
  };
};

export default useTwoFactorVerification;

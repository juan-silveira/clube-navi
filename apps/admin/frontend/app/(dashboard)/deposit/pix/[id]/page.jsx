"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Loading from "@/components/Loading";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import useAuthStore from "@/store/authStore";
import { useAlertContext } from "@/contexts/AlertContext";
import QRCode from 'qrcode';
import api from "@/services/api";

const PixPaymentPage = () => {
  useDocumentTitle('Pagamento PIX', 'Clube Digital', true);

  const router = useRouter();
  const params = useParams();
  const transactionId = params.id;
  const { user, accessToken } = useAuthStore();
  const { showSuccess, showError, showInfo } = useAlertContext();

  // Estados
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [countdown, setCountdown] = useState(null); // Inicializar como null para calcular baseado no expiresAt
  const [error, setError] = useState(null);

  // Ref para evitar múltiplos alertas
  const hasShownSuccessAlert = useRef(false);
  const hasShownExpiredAlert = useRef(false);
  
  // Carregar dados do PIX
  const loadPixData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📱 Carregando dados do PIX para transação:', transactionId);
      
      // Buscar dados do PIX já criado (não criar novo!)
      const response = await fetch(`/api/deposits/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const pixInfo = data.data;
        
        // Garantir que valores sejam números e calcular corretamente
        const baseAmount = parseFloat(pixInfo.amount) || 0;
        const feeAmount = parseFloat(pixInfo.feeAmount) || 3; // Taxa padrão de R$ 3
        const totalAmount = pixInfo.totalAmount ? parseFloat(pixInfo.totalAmount) : (baseAmount + feeAmount);
        
        // Criar objeto com valores corrigidos
        const correctedPixInfo = {
          ...pixInfo,
          amount: baseAmount,
          feeAmount: feeAmount,
          totalAmount: totalAmount
        };
        
        console.log('📊 Dados do PIX recebidos:', {
          amount: correctedPixInfo.amount,
          totalAmount: correctedPixInfo.totalAmount,
          feeAmount: correctedPixInfo.feeAmount,
          hasPixCode: !!correctedPixInfo.pixCode,
          hasQrCodeImage: !!correctedPixInfo.qrCodeImage
        });
        
        setPixData(correctedPixInfo);
        
        // Gerar QR Code se tiver o código PIX
        if (pixInfo.pixCode) {
          try {
            const qrCodeDataUrl = await QRCode.toDataURL(pixInfo.pixCode, {
              width: 300,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
            setQrCodeImage(qrCodeDataUrl);
            console.log('✅ QR Code gerado localmente');
          } catch (qrError) {
            console.error('Erro ao gerar QR Code:', qrError);
            // Usar QR Code da API se disponível
            if (pixInfo.qrCodeImage) {
              setQrCodeImage(pixInfo.qrCodeImage);
              console.log('✅ Usando QR Code da API');
            }
          }
        } else if (pixInfo.qrCodeImage) {
          // Usar QR Code retornado pela API
          setQrCodeImage(pixInfo.qrCodeImage);
          console.log('✅ Usando QR Code da API (sem pixCode)');
        } else {
          console.warn('⚠️ Nenhum QR Code disponível');
        }
        
        // Calcular tempo restante baseado na data de expiração real
        if (pixInfo.expiresAt) {
          const expiresTime = new Date(pixInfo.expiresAt).getTime();
          const now = new Date().getTime();
          const timeLeft = Math.floor((expiresTime - now) / 1000);
          
          // Se o tempo restante for válido, usar ele, senão usar 30 minutos como fallback
          if (timeLeft > 0 && timeLeft <= 1800) {
            setCountdown(timeLeft);
          } else if (timeLeft > 1800) {
            // Se por algum motivo o tempo for maior que 30 minutos, limitar a 30 minutos
            setCountdown(1800);
          } else {
            // Se já expirou
            setCountdown(0);
            setPaymentStatus('expired');
          }
        } else {
          // Se não tem data de expiração, usar criação + 30 minutos
          const createdTime = pixInfo.createdAt ? new Date(pixInfo.createdAt).getTime() : new Date().getTime();
          const expiresTime = createdTime + (30 * 60 * 1000); // 30 minutos
          const now = new Date().getTime();
          const timeLeft = Math.floor((expiresTime - now) / 1000);
          setCountdown(Math.max(0, timeLeft));
        }
      } else {
        throw new Error(data.message || 'Erro ao carregar dados do PIX');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar PIX:', error);
      setError(error.message || 'Erro ao carregar dados do pagamento');
      showError('Erro ao carregar dados do pagamento');
    } finally {
      setLoading(false);
    }
  }, [transactionId, accessToken, showError]);
  
  // Verificar status do pagamento (NÃO recarregar QR Code)
  const checkPaymentStatus = useCallback(async () => {
    if (checkingStatus || paymentStatus === 'completed') return;

    try {
      setCheckingStatus(true);
      console.log('🔍 Verificando status do pagamento...');

      const response = await fetch(`/api/deposits/check-status/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const status = data.data.status;

        // Só atualizar status se mudou para confirmado/completado E não mostrou alerta ainda
        if ((status === 'confirmed' || status === 'completed' || status === 'approved') && paymentStatus !== 'completed' && !hasShownSuccessAlert.current) {
          hasShownSuccessAlert.current = true; // Marcar que já mostrou o alerta
          setPaymentStatus('completed');
          showSuccess('Pagamento confirmado!', 'Seu depósito foi processado com sucesso na blockchain\nDepósito Concluído!');
          setTimeout(() => {
            router.push(`/deposit/tx/${transactionId}`);
          }, 3000);
        } else if ((status === 'expired' || status === 'cancelled') && paymentStatus === 'pending' && !hasShownExpiredAlert.current) {
          hasShownExpiredAlert.current = true; // Marcar que já mostrou o alerta
          setPaymentStatus('expired');
          showError('Pagamento expirado', 'O tempo para pagamento expirou. Por favor, tente novamente.');
          setTimeout(() => {
            router.push('/deposit');
          }, 3000);
        }
        // NÃO atualizar dados do PIX ou QR Code aqui
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    } finally {
      setCheckingStatus(false);
    }
  }, [transactionId, paymentStatus, checkingStatus, accessToken, router, showSuccess, showError]);
  
  // Copiar código PIX
  const copyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode).then(() => {
        showSuccess('Código PIX copiado!', 'Cole no seu app de pagamento');
      }).catch(() => {
        showError('Erro ao copiar', 'Por favor, copie manualmente');
      });
    }
  };
  
  // Timer countdown
  useEffect(() => {
    if (countdown > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && paymentStatus === 'pending') {
      setPaymentStatus('expired');
      showError('Tempo expirado', 'O tempo para pagamento expirou.');
      setTimeout(() => {
        router.push('/deposit');
      }, 3000);
    }
  }, [countdown, paymentStatus, router, showError]);
  
  // Verificação automática de status
  useEffect(() => {
    let interval = null;

    if (paymentStatus === 'pending') {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000); // Verificar a cada 5 segundos
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [paymentStatus, checkPaymentStatus]);
  
  // Carregar dados na montagem
  useEffect(() => {
    if (transactionId) {
      loadPixData();
    }
  }, [transactionId, loadPixData]);
  
  // Formatar tempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Formatar valor
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <Icon icon="mdi:alert-circle" className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erro ao carregar pagamento
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button onClick={() => router.push('/deposit')} className="bg-primary-500">
            Voltar ao Depósito
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Pagamento via PIX
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Escaneie o QR Code ou copie o código PIX para realizar o pagamento
            </p>
          </div>
          
          {/* Status */}
          {paymentStatus === 'completed' && (
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Icon icon="mdi:check-circle" className="text-green-500 text-2xl mr-3" />
                <div>
                  <h3 className="font-bold text-green-900 dark:text-green-100">
                    Pagamento Confirmado!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Seu depósito foi processado com sucesso.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Timer */}
          {paymentStatus === 'pending' && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon icon="mdi:clock-outline" className="text-yellow-500 text-2xl mr-3" />
                  <div>
                    <h3 className="font-bold text-yellow-900 dark:text-yellow-100">
                      Aguardando Pagamento
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Tempo restante: {formatTime(countdown)}
                    </p>
                  </div>
                </div>
                {checkingStatus && (
                  <div className="animate-spin">
                    <Icon icon="mdi:loading" className="text-yellow-500 text-2xl" />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="text-center">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                QR Code PIX
              </h3>
              {qrCodeImage ? (
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img 
                    src={qrCodeImage} 
                    alt="QR Code PIX" 
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
                  <Icon icon="mdi:qrcode" className="text-6xl text-gray-400 mx-auto" />
                  <p className="text-gray-500 mt-2">QR Code não disponível</p>
                </div>
              )}
            </div>
            
            {/* Informações do pagamento */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Detalhes do Pagamento
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Valor Total a Pagar
                  </span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(pixData?.totalAmount || (pixData?.amount + 3))}
                  </p>
                  {(pixData?.feeAmount > 0 || pixData?.amount > 0) && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Valor base: {formatCurrency(pixData?.amount || 0)}</p>
                      <p>Taxa: {formatCurrency(pixData?.feeAmount || 3)}</p>
                    </div>
                  )}
                </div>
                
                {pixData?.pixCode && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Código PIX Copia e Cola
                    </span>
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={pixData.pixCode}
                        readOnly
                        className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono"
                      />
                      <Button
                        onClick={copyPixCode}
                        className="ml-2 bg-primary-500 hover:bg-primary-600 text-white"
                      >
                        <Icon icon="mdi:content-copy" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    ID da Transação
                  </span>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {transactionId}
                  </p>
                </div>
              </div>
              
              {/* Instruções */}
              <div className="mt-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Como pagar:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento</li>
                  <li>Aguarde a confirmação automática</li>
                </ol>
              </div>
              
              {/* Botões */}
              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={checkPaymentStatus}
                  disabled={checkingStatus}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                >
                  {checkingStatus ? 'Verificando...' : 'Verificar Pagamento'}
                </Button>
                <Button
                  onClick={() => router.push('/deposit')}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PixPaymentPage;
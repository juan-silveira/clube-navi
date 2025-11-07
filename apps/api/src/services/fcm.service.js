/**
 * Firebase Cloud Messaging (FCM) Service
 *
 * Serviço para envio de push notifications via FCM
 */

const admin = require('firebase-admin');

class FCMService {
  constructor() {
    this.isInitialized = false;
    this.isMockMode = false;

    // Tentar inicializar FCM
    this.initialize();
  }

  /**
   * Inicializar Firebase Admin SDK
   */
  initialize() {
    try {
      // Verificar se as credenciais FCM estão configuradas
      const fcmCredentials = process.env.FCM_CREDENTIALS;
      const projectId = process.env.FCM_PROJECT_ID;

      if (!fcmCredentials || !projectId) {
        console.warn('⚠️ FCM credentials não configuradas, usando modo MOCK');
        this.isMockMode = true;
        return;
      }

      // Parse das credenciais (podem estar em JSON string ou arquivo)
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(fcmCredentials);
      } catch (error) {
        // Se não for JSON, assumir que é um caminho de arquivo
        serviceAccount = require(fcmCredentials);
      }

      // Inicializar Firebase Admin
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId
        });
      }

      this.isInitialized = true;
      console.log('✅ FCM Service initialized successfully');
    } catch (error) {
      console.error('❌ Erro ao inicializar FCM Service:', error);
      console.warn('⚠️ Usando modo MOCK para push notifications');
      this.isMockMode = true;
    }
  }

  /**
   * Enviar push notification para um único token
   *
   * @param {string} token - FCM token do dispositivo
   * @param {Object} notification - Dados da notificação
   * @param {string} notification.title - Título da notificação
   * @param {string} notification.body - Corpo da notificação
   * @param {Object} data - Dados adicionais (opcional)
   * @param {string} imageUrl - URL da imagem (opcional)
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendToToken(token, notification, data = {}, imageUrl = null) {
    if (this.isMockMode) {
      return this._mockSend(token, notification, data);
    }

    try {
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      // Adicionar imagem se fornecida
      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
        message.android.notification.imageUrl = imageUrl;
        message.apns.payload.aps.mutableContent = 1;
        message.apns.fcmOptions = {
          imageUrl: imageUrl
        };
      }

      const response = await admin.messaging().send(message);

      return {
        success: true,
        messageId: response,
        token
      };
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);

      // Verificar se é erro de token inválido
      const isInvalidToken =
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered';

      return {
        success: false,
        error: error.message,
        code: error.code,
        isInvalidToken,
        token
      };
    }
  }

  /**
   * Enviar push notification para múltiplos tokens
   *
   * @param {string[]} tokens - Array de FCM tokens
   * @param {Object} notification - Dados da notificação
   * @param {Object} data - Dados adicionais
   * @param {string} imageUrl - URL da imagem
   * @returns {Promise<Object>} Resultado do envio em lote
   */
  async sendToMultipleTokens(tokens, notification, data = {}, imageUrl = null) {
    if (this.isMockMode) {
      return this._mockSendMultiple(tokens, notification, data);
    }

    if (!tokens || tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        results: []
      };
    }

    try {
      // FCM limita a 500 tokens por request
      const batchSize = 500;
      const batches = [];

      for (let i = 0; i < tokens.length; i += batchSize) {
        batches.push(tokens.slice(i, i + batchSize));
      }

      let totalSuccessCount = 0;
      let totalFailureCount = 0;
      const allResults = [];

      for (const batch of batches) {
        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            ...data,
            timestamp: new Date().toISOString()
          },
          tokens: batch,
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1
              }
            }
          }
        };

        // Adicionar imagem se fornecida
        if (imageUrl) {
          message.notification.imageUrl = imageUrl;
          message.android.notification.imageUrl = imageUrl;
          message.apns.payload.aps.mutableContent = 1;
          message.apns.fcmOptions = {
            imageUrl: imageUrl
          };
        }

        const response = await admin.messaging().sendMulticast(message);

        totalSuccessCount += response.successCount;
        totalFailureCount += response.failureCount;

        // Processar resultados individuais
        response.responses.forEach((result, index) => {
          const token = batch[index];

          if (result.success) {
            allResults.push({
              token,
              success: true,
              messageId: result.messageId
            });
          } else {
            const isInvalidToken =
              result.error.code === 'messaging/invalid-registration-token' ||
              result.error.code === 'messaging/registration-token-not-registered';

            allResults.push({
              token,
              success: false,
              error: result.error.message,
              code: result.error.code,
              isInvalidToken
            });
          }
        });
      }

      return {
        successCount: totalSuccessCount,
        failureCount: totalFailureCount,
        results: allResults
      };
    } catch (error) {
      console.error('Erro ao enviar push notifications em lote:', error);
      return {
        successCount: 0,
        failureCount: tokens.length,
        error: error.message,
        results: tokens.map(token => ({
          token,
          success: false,
          error: error.message
        }))
      };
    }
  }

  /**
   * Enviar push notification por tópico
   *
   * @param {string} topic - Nome do tópico
   * @param {Object} notification - Dados da notificação
   * @param {Object} data - Dados adicionais
   * @param {string} imageUrl - URL da imagem
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendToTopic(topic, notification, data = {}, imageUrl = null) {
    if (this.isMockMode) {
      return this._mockSend(topic, notification, data);
    }

    try {
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      // Adicionar imagem se fornecida
      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
        message.android.notification.imageUrl = imageUrl;
        message.apns.payload.aps.mutableContent = 1;
        message.apns.fcmOptions = {
          imageUrl: imageUrl
        };
      }

      const response = await admin.messaging().send(message);

      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      console.error('Erro ao enviar push notification por tópico:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Inscrever tokens em um tópico
   *
   * @param {string[]} tokens - Array de tokens
   * @param {string} topic - Nome do tópico
   * @returns {Promise<Object>} Resultado da inscrição
   */
  async subscribeToTopic(tokens, topic) {
    if (this.isMockMode) {
      return {
        successCount: tokens.length,
        failureCount: 0
      };
    }

    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };
    } catch (error) {
      console.error('Erro ao inscrever em tópico:', error);
      return {
        successCount: 0,
        failureCount: tokens.length,
        error: error.message
      };
    }
  }

  /**
   * Desinscrever tokens de um tópico
   *
   * @param {string[]} tokens - Array de tokens
   * @param {string} topic - Nome do tópico
   * @returns {Promise<Object>} Resultado da desinscrição
   */
  async unsubscribeFromTopic(tokens, topic) {
    if (this.isMockMode) {
      return {
        successCount: tokens.length,
        failureCount: 0
      };
    }

    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };
    } catch (error) {
      console.error('Erro ao desinscrever de tópico:', error);
      return {
        successCount: 0,
        failureCount: tokens.length,
        error: error.message
      };
    }
  }

  /**
   * Mock de envio para desenvolvimento
   */
  _mockSend(token, notification, data) {
    console.log('📧 [MOCK FCM] Enviando push notification:');
    console.log('Token:', token);
    console.log('Notification:', notification);
    console.log('Data:', data);

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      token,
      mock: true
    };
  }

  /**
   * Mock de envio múltiplo para desenvolvimento
   */
  _mockSendMultiple(tokens, notification, data) {
    console.log('📧 [MOCK FCM] Enviando push notifications em lote:');
    console.log('Tokens:', tokens.length);
    console.log('Notification:', notification);
    console.log('Data:', data);

    return {
      successCount: tokens.length,
      failureCount: 0,
      results: tokens.map(token => ({
        token,
        success: true,
        messageId: `mock-${Date.now()}`,
        mock: true
      })),
      mock: true
    };
  }

  /**
   * Verificar status do serviço
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      mockMode: this.isMockMode,
      provider: 'Firebase Cloud Messaging (FCM)'
    };
  }
}

// Singleton
const fcmService = new FCMService();

module.exports = fcmService;

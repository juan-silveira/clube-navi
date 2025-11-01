const Mailchimp = require('@mailchimp/mailchimp_transactional');

/**
 * Provedor de email Mandrill (MailChimp Transactional)
 * Implementa envio de emails transacionais via Mandrill API
 */
class MandrillProvider {
  constructor() {
    this.apiKey = process.env.MANDRILL_API_KEY;
    this.client = this.apiKey ? Mailchimp(this.apiKey) : null;
    
    this.defaultSender = {
      email: process.env.MANDRILL_FROM_EMAIL || 'noreply@coinage.com',
      name: process.env.MANDRILL_FROM_NAME || 'Coinage',
    };

    this.isConfigured = !!(
      process.env.MANDRILL_API_KEY && 
      process.env.MANDRILL_FROM_EMAIL
    );
  }

  /**
   * Verificar se o provedor está configurado
   */
  isEnabled() {
    return this.isConfigured;
  }

  /**
   * Enviar email simples
   */
  async sendEmail({ to, subject, htmlContent, textContent, from, replyTo, attachments = [] }) {
    try {
      if (!this.isConfigured || !this.client) {
        return {
          success: false,
          error: 'Mandrill não está configurado. Verifique as variáveis de ambiente.',
          provider: 'mandrill'
        };
      }

      // Preparar destinatários
      const recipients = Array.isArray(to) 
        ? to.map(recipient => ({
            email: recipient.email,
            name: recipient.name,
            type: 'to'
          }))
        : [{
            email: to.email || to,
            name: to.name || '',
            type: 'to'
          }];

      // Preparar anexos
      const mandrillAttachments = attachments.map(att => ({
        type: att.type || 'application/octet-stream',
        name: att.filename,
        content: att.content
      }));

      // Configurar mensagem
      const message = {
        html: htmlContent,
        text: textContent,
        subject: subject,
        from_email: from?.email || this.defaultSender.email,
        from_name: from?.name || this.defaultSender.name,
        to: recipients,
        headers: {
          'Reply-To': replyTo?.email || this.defaultSender.email
        },
        important: false,
        track_opens: true,
        track_clicks: true,
        auto_text: !textContent, // Gerar texto automaticamente se não fornecido
        auto_html: false,
        inline_css: true,
        url_strip_qs: false,
        preserve_recipients: false,
        view_content_link: false,
        tracking_domain: null,
        signing_domain: null,
        return_path_domain: null,
        merge: false,
        attachments: mandrillAttachments
      };

      // Enviar email
      const result = await this.client.messages.send({
        message: message,
        async: false,
        ip_pool: 'Main Pool'
      });

      if (result && result.length > 0) {
        const firstResult = result[0];
        
        if (firstResult.status === 'sent' || firstResult.status === 'queued') {
          console.log('✅ Email enviado via Mandrill:', {
            messageId: firstResult._id,
            to: recipients.map(r => r.email),
            subject,
            status: firstResult.status
          });

          return {
            success: true,
            messageId: firstResult._id,
            provider: 'mandrill',
            status: firstResult.status,
            response: result
          };
        } else {
          console.error('❌ Erro no envio via Mandrill:', firstResult);
          
          return {
            success: false,
            error: firstResult.reject_reason || 'Erro desconhecido',
            provider: 'mandrill',
            status: firstResult.status,
            details: result
          };
        }
      } else {
        return {
          success: false,
          error: 'Resposta vazia da API Mandrill',
          provider: 'mandrill'
        };
      }

    } catch (error) {
      console.error('❌ Erro ao enviar email via Mandrill:', error);
      
      return {
        success: false,
        error: error.message,
        provider: 'mandrill',
        details: error
      };
    }
  }

  /**
   * Enviar email usando template
   */
  async sendTemplateEmail({ to, templateName, variables, from }) {
    try {
      if (!this.isConfigured || !this.client) {
        return {
          success: false,
          error: 'Mandrill não está configurado. Verifique as variáveis de ambiente.',
          provider: 'mandrill'
        };
      }

      const recipients = Array.isArray(to)
        ? to.map(recipient => ({
            email: recipient.email,
            name: recipient.name,
            type: 'to'
          }))
        : [{
            email: to.email || to,
            name: to.name || '',
            type: 'to'
          }];

      // Preparar variáveis globais do template
      const globalMergeVars = variables ? Object.keys(variables).map(key => ({
        name: key,
        content: variables[key]
      })) : [];

      const templateContent = []; // Templates do Mandrill não precisam de conteúdo adicional

      const message = {
        from_email: from?.email || this.defaultSender.email,
        from_name: from?.name || this.defaultSender.name,
        to: recipients,
        important: false,
        track_opens: true,
        track_clicks: true,
        auto_text: true,
        auto_html: false,
        inline_css: true,
        url_strip_qs: false,
        preserve_recipients: false,
        view_content_link: false,
        global_merge_vars: globalMergeVars,
        merge: true,
        merge_language: 'handlebars'
      };

      const result = await this.client.messages.sendTemplate({
        template_name: templateName,
        template_content: templateContent,
        message: message,
        async: false
      });

      if (result && result.length > 0) {
        const firstResult = result[0];
        
        if (firstResult.status === 'sent' || firstResult.status === 'queued') {
          console.log('✅ Email template enviado via Mandrill:', {
            messageId: firstResult._id,
            to: recipients.map(r => r.email),
            templateName,
            status: firstResult.status
          });

          return {
            success: true,
            messageId: firstResult._id,
            provider: 'mandrill',
            status: firstResult.status,
            response: result
          };
        } else {
          console.error('❌ Erro no envio template via Mandrill:', firstResult);
          
          return {
            success: false,
            error: firstResult.reject_reason || 'Erro desconhecido',
            provider: 'mandrill',
            status: firstResult.status,
            details: result
          };
        }
      } else {
        return {
          success: false,
          error: 'Resposta vazia da API Mandrill',
          provider: 'mandrill'
        };
      }

    } catch (error) {
      console.error('❌ Erro ao enviar template via Mandrill:', error);
      
      return {
        success: false,
        error: error.message,
        provider: 'mandrill',
        details: error
      };
    }
  }

  /**
   * Verificar informações da mensagem
   */
  async getDeliveryStatus(messageId) {
    try {
      if (!this.isConfigured || !this.client) {
        return {
          success: false,
          error: 'Mandrill não está configurado.',
          provider: 'mandrill'
        };
      }

      const result = await this.client.messages.info({
        id: messageId
      });

      console.log('✅ Status obtido via Mandrill:', {
        messageId,
        status: result.state
      });

      return {
        success: true,
        status: result.state,
        provider: 'mandrill',
        details: result
      };

    } catch (error) {
      console.error('❌ Erro ao obter status via Mandrill:', error);
      
      return {
        success: false,
        error: error.message,
        provider: 'mandrill'
      };
    }
  }

  /**
   * Listar templates disponíveis
   */
  async getTemplates() {
    try {
      if (!this.isConfigured || !this.client) {
        return {
          success: false,
          error: 'Mandrill não está configurado.',
          provider: 'mandrill'
        };
      }

      const result = await this.client.templates.list({
        label: null
      });

      return {
        success: true,
        templates: result,
        provider: 'mandrill'
      };

    } catch (error) {
      console.error('❌ Erro ao listar templates Mandrill:', error);
      
      return {
        success: false,
        error: error.message,
        provider: 'mandrill'
      };
    }
  }

  /**
   * Validar configuração do provedor
   */
  async validateConfiguration() {
    try {
      if (!this.isConfigured || !this.client) {
        return {
          valid: false,
          error: 'Variáveis de ambiente não configuradas',
          missing: ['MANDRILL_API_KEY', 'MANDRILL_FROM_EMAIL'],
          provider: 'mandrill'
        };
      }

      // Testar a API com ping
      const result = await this.client.users.ping();

      return {
        valid: true,
        provider: 'mandrill',
        ping: result,
        config: {
          apiKey: this.apiKey ? '***' : null,
          fromEmail: this.defaultSender.email,
          fromName: this.defaultSender.name
        }
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        provider: 'mandrill'
      };
    }
  }
}

module.exports = MandrillProvider;
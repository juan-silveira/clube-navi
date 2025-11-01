const nodemailer = require('nodemailer');

/**
 * Provedor de email Mandrill via SMTP
 * Usa Nodemailer para enviar emails através do servidor SMTP do Mandrill
 */
class MandrillSMTPProvider {
  constructor() {
    this.apiKey = process.env.MANDRILL_API_KEY;
    this.fromEmail = process.env.MANDRILL_FROM_EMAIL || 'noreply@coinage.trade';
    this.fromName = process.env.MANDRILL_FROM_NAME || 'Coinage';
    
    this.isConfigured = !!(
      process.env.MANDRILL_API_KEY && 
      process.env.MANDRILL_FROM_EMAIL
    );

    // Configurar transporter SMTP se estiver configurado
    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.mandrillapp.com',
        port: 587,
        secure: false, // true para 465, false para outras portas
        auth: {
          user: 'navi', // qualquer username funciona
          pass: this.apiKey // usar API key como senha
        }
      });
    }
  }

  /**
   * Verificar se o provedor está configurado
   */
  isEnabled() {
    return this.isConfigured;
  }

  /**
   * Enviar email via SMTP
   */
  async sendEmail({ to, subject, htmlContent, textContent, from, replyTo, attachments = [] }) {
    try {
      if (!this.isConfigured || !this.transporter) {
        return {
          success: false,
          error: 'Mandrill SMTP não está configurado. Verifique as variáveis de ambiente.',
          provider: 'mandrill-smtp'
        };
      }

      // Preparar destinatário
      const toEmail = typeof to === 'object' ? to.email : to;
      const toName = typeof to === 'object' ? to.name : '';

      // Preparar anexos para Nodemailer
      const mailAttachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.type || 'application/octet-stream'
      }));

      // Configurar opções do email
      const mailOptions = {
        from: `"${from?.name || this.fromName}" <${from?.email || this.fromEmail}>`,
        to: toName ? `"${toName}" <${toEmail}>` : toEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
        replyTo: replyTo?.email || this.fromEmail,
        attachments: mailAttachments,
        headers: {
          'X-MC-Tags': 'coinage',
          'X-MC-Metadata': JSON.stringify({
            platform: 'coinage',
            environment: process.env.NODE_ENV || 'development'
          })
        }
      };

      // Enviar email
      const info = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email enviado via Mandrill SMTP:', {
        messageId: info.messageId,
        to: toEmail,
        subject,
        response: info.response
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: 'mandrill-smtp',
        status: 'sent',
        response: info
      };

    } catch (error) {
      console.error('❌ Erro ao enviar email via Mandrill SMTP:', error);
      
      return {
        success: false,
        error: error.message,
        provider: 'mandrill-smtp',
        details: error
      };
    }
  }

  /**
   * Validar configuração do provedor
   */
  async validateConfiguration() {
    try {
      if (!this.isConfigured || !this.transporter) {
        return {
          valid: false,
          error: 'Variáveis de ambiente não configuradas',
          missing: ['MANDRILL_API_KEY', 'MANDRILL_FROM_EMAIL'],
          provider: 'mandrill-smtp'
        };
      }

      // Verificar conexão SMTP
      await this.transporter.verify();

      return {
        valid: true,
        provider: 'mandrill-smtp',
        config: {
          host: 'smtp.mandrillapp.com',
          port: 587,
          fromEmail: this.fromEmail,
          fromName: this.fromName,
          apiKey: this.apiKey ? '***' : null
        }
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        provider: 'mandrill-smtp'
      };
    }
  }
}

module.exports = MandrillSMTPProvider;
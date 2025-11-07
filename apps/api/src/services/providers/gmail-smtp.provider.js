const nodemailer = require('nodemailer');

/**
 * Provedor de email Gmail via SMTP
 * Usa Nodemailer para enviar emails através do Gmail
 * 
 * IMPORTANTE: Para usar o Gmail, você precisa:
 * 1. Ativar autenticação de 2 fatores na conta Google
 * 2. Gerar uma "Senha de App" em: https://myaccount.google.com/apppasswords
 * 3. Usar essa senha no GMAIL_PASS ao invés da senha normal
 */
class GmailSMTPProvider {
  constructor() {
    this.user = process.env.GMAIL_USER;
    this.pass = process.env.GMAIL_PASS;
    this.fromName = process.env.GMAIL_FROM_NAME || 'Clube Digital';
    
    this.isConfigured = !!(
      process.env.GMAIL_USER && 
      process.env.GMAIL_PASS
    );

    // Configurar transporter SMTP se estiver configurado
    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.user,
          pass: this.pass
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
   * Enviar email via Gmail SMTP
   */
  async sendEmail({ to, subject, htmlContent, textContent, from, replyTo, attachments = [] }) {
    try {
      if (!this.isConfigured || !this.transporter) {
        return {
          success: false,
          error: 'Gmail SMTP não está configurado. Configure GMAIL_USER e GMAIL_PASS (senha de app).',
          provider: 'gmail-smtp'
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
        from: `"${from?.name || this.fromName}" <${this.user}>`,
        to: toName ? `"${toName}" <${toEmail}>` : toEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
        replyTo: replyTo?.email || this.user,
        attachments: mailAttachments
      };

      // Enviar email
      const info = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email enviado via Gmail SMTP:', {
        messageId: info.messageId,
        to: toEmail,
        subject,
        response: info.response
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: 'gmail-smtp',
        status: 'sent',
        response: info
      };

    } catch (error) {
      console.error('❌ Erro ao enviar email via Gmail SMTP:', error);
      
      // Mensagem de erro mais informativa
      let errorMessage = error.message;
      if (error.code === 'EAUTH') {
        errorMessage = 'Falha na autenticação. Verifique se está usando uma "Senha de App" do Gmail (não a senha normal).';
      }
      
      return {
        success: false,
        error: errorMessage,
        provider: 'gmail-smtp',
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
          missing: ['GMAIL_USER', 'GMAIL_PASS'],
          provider: 'gmail-smtp',
          help: 'Configure uma Senha de App em: https://myaccount.google.com/apppasswords'
        };
      }

      // Verificar conexão SMTP
      await this.transporter.verify();

      return {
        valid: true,
        provider: 'gmail-smtp',
        config: {
          service: 'gmail',
          user: this.user,
          fromName: this.fromName
        }
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        provider: 'gmail-smtp',
        help: 'Certifique-se de usar uma Senha de App, não a senha normal do Gmail'
      };
    }
  }
}

module.exports = GmailSMTPProvider;
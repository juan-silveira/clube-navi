const express = require('express');
const router = express.Router();
const PixController = require('../controllers/pix.controller');

const pixController = new PixController();

/**
 * @route   GET /api/pix/test-efi
 * @desc    Testar integração com EFI Pay
 * @access  Public
 */
router.get('/test-efi', async (req, res) => {
  try {
    const fs = require('fs');
    const certPath = process.env.EFI_CERTIFICATE_PATH || './certificates/producao-416207-hubpay.p12';
    const certExists = fs.existsSync(certPath);
    
    let authStatus = 'not_tested';
    let authError = null;
    
    if (process.env.EFI_CLIENT_ID && process.env.EFI_CLIENT_SECRET && certExists) {
      try {
        const PixService = require('../services/pix.service');
        const testService = new PixService();
        await testService.authenticateEfi();
        authStatus = 'success';
      } catch (error) {
        authStatus = 'failed';
        authError = error.message;
      }
    }
    
    res.json({
      status: 'ok',
      provider: process.env.PIX_PROVIDER,
      fallback: process.env.PIX_FALLBACK_PROVIDER,
      efi: {
        configured: !!(process.env.EFI_CLIENT_ID && process.env.EFI_CLIENT_SECRET),
        certificate: certExists ? 'found' : 'missing',
        certificatePath: certPath,
        sandbox: process.env.EFI_SANDBOX === 'true',
        pixKey: process.env.EFI_PIX_KEY ? 'configured' : 'missing',
        authentication: authStatus,
        authError: authError
      },
      asaas: {
        configured: !!process.env.ASAAS_API_KEY,
        url: process.env.ASAAS_API_URL
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/pix/dev/payment/:pixPaymentId
 * @desc    Obter dados do pagamento PIX (SEM AUTENTICAÇÃO - DESENVOLVIMENTO)
 * @access  Public
 */
router.get('/dev/payment/:pixPaymentId', pixController.getPixPayment.bind(pixController));

/**
 * @route   POST /api/pix/dev/payment/:pixPaymentId/force
 * @desc    Forçar confirmação do PIX (SEM AUTENTICAÇÃO - DESENVOLVIMENTO)
 * @access  Public
 */
router.post('/dev/payment/:pixPaymentId/force', pixController.confirmPixPayment.bind(pixController));

/**
 * @route   GET /api/pix/payment/:pixPaymentId
 * @desc    Obter dados do pagamento PIX
 * @access  Private
 */
router.get('/payment/:pixPaymentId', pixController.getPixPayment.bind(pixController));

/**
 * @route   POST /api/pix/payment/:pixPaymentId/force
 * @desc    Forçar confirmação do PIX (desenvolvimento)
 * @access  Private
 */
router.post('/payment/:pixPaymentId/force', pixController.confirmPixPayment.bind(pixController));

module.exports = router;
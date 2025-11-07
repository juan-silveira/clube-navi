/**
 * PIX Validation Routes
 *
 * Rotas para validação de chaves PIX
 */

const express = require('express');
const router = express.Router();
const pixService = require('../services/pix.service');
const { authenticateJWT } = require('../middleware/jwt.middleware');

/**
 * POST /api/pix/validate-key
 * Valida uma chave PIX e retorna dados do titular
 *
 * Body: {
 *   pixKey: string,
 *   pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
 * }
 */
router.post('/validate-key', authenticateJWT, async (req, res) => {
  try {
    const { pixKey, pixKeyType } = req.body;

    if (!pixKey || !pixKeyType) {
      return res.status(400).json({
        success: false,
        message: 'pixKey e pixKeyType são obrigatórios',
      });
    }

    const validTypes = ['cpf', 'cnpj', 'email', 'phone', 'random'];
    if (!validTypes.includes(pixKeyType)) {
      return res.status(400).json({
        success: false,
        message: 'pixKeyType inválido. Valores aceitos: cpf, cnpj, email, phone, random',
      });
    }

    console.log(`🔍 [PixValidation] Validando chave ${pixKeyType}: ${pixKey.substring(0, 3)}***`);

    // Validar chave PIX com EFI Pay
    const result = await pixService.validatePixKey(pixKey, pixKeyType);

    if (result.success && result.valid) {
      return res.json({
        success: true,
        valid: true,
        data: {
          pixKey: result.pixKey,
          pixKeyType: result.pixKeyType,
          holder: result.holder,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        valid: false,
        message: result.error || 'Chave PIX inválida',
      });
    }
  } catch (error) {
    console.error('❌ [PixValidation] Erro ao validar chave PIX:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar chave PIX',
      error: error.message,
    });
  }
});

/**
 * POST /api/pix/validate-format
 * Valida apenas o formato da chave PIX (sem consultar EFI)
 *
 * Body: {
 *   pixKey: string,
 *   pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
 * }
 */
router.post('/validate-format', authenticateJWT, async (req, res) => {
  try {
    const { pixKey, pixKeyType } = req.body;

    if (!pixKey || !pixKeyType) {
      return res.status(400).json({
        success: false,
        message: 'pixKey e pixKeyType são obrigatórios',
      });
    }

    const validation = pixService.validatePixKeyFormat(pixKey, pixKeyType);

    if (validation.valid) {
      return res.json({
        success: true,
        valid: true,
        pixKey,
        pixKeyType,
      });
    } else {
      return res.status(400).json({
        success: false,
        valid: false,
        message: validation.error,
      });
    }
  } catch (error) {
    console.error('❌ [PixValidation] Erro ao validar formato:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar formato da chave PIX',
    });
  }
});

module.exports = router;

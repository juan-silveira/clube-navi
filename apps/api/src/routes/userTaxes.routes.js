const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/jwt.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { body, param } = require('express-validator');
const userTaxesService = require('../services/userTaxes.service');

/**
 * @route   GET /api/user-taxes/:userId
 * @desc    Obter todas as taxas de um usuário
 * @access  Private (Admin)
 */
router.get('/:userId',
  authenticateJWT,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const userTaxes = await userTaxesService.getUserTaxes(userId);

      res.json({
        success: true,
        data: userTaxes
      });

    } catch (error) {
      console.error('Erro ao obter taxas do usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao obter taxas do usuário'
      });
    }
  }
);

/**
 * @route   GET /api/user-taxes/:userId/token-fees
 * @desc    Obter taxas de transferência por token de um usuário
 * @access  Private (Admin)
 */
router.get('/:userId/token-fees',
  authenticateJWT,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const tokenFees = await userTaxesService.getUserTokenFees(userId);

      res.json({
        success: true,
        data: tokenFees
      });

    } catch (error) {
      console.error('Erro ao obter taxas de tokens:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao obter taxas de tokens'
      });
    }
  }
);

/**
 * @route   GET /api/user-taxes/:userId/token-fees/:network/:tokenId
 * @desc    Obter taxa de um token específico
 * @access  Private (Admin)
 */
router.get('/:userId/token-fees/:network/:tokenId',
  authenticateJWT,
  async (req, res) => {
    try {
      const { userId, network, tokenId } = req.params;

      const tokenFee = await userTaxesService.getTokenFee(userId, network, tokenId);

      res.json({
        success: true,
        data: tokenFee
      });

    } catch (error) {
      console.error('Erro ao obter taxa do token:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao obter taxa do token'
      });
    }
  }
);

/**
 * @route   PUT /api/user-taxes/:userId/token-fees/:network/:tokenId
 * @desc    Atualizar taxa de um token específico
 * @access  Private (Admin)
 */
router.put('/:userId/token-fees/:network/:tokenId',
  authenticateJWT,
  [
    body('fee').isNumeric().withMessage('Taxa deve ser um número'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { userId, network, tokenId } = req.params;
      const { fee } = req.body;

      const updatedTaxes = await userTaxesService.updateUserTokenFee(userId, network, tokenId, fee);

      res.json({
        success: true,
        data: updatedTaxes,
        message: 'Taxa do token atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar taxa do token:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar taxa do token'
      });
    }
  }
);

/**
 * @route   PUT /api/user-taxes/:userId/token-fees/batch
 * @desc    Atualizar múltiplas taxas de tokens
 * @access  Private (Admin)
 */
router.put('/:userId/token-fees/batch',
  authenticateJWT,
  [
    body('updates').isArray().withMessage('Updates deve ser um array'),
    body('updates.*.network').isIn(['testnet', 'mainnet']).withMessage('Network inválida'),
    body('updates.*.tokenId').isString().notEmpty().withMessage('Token ID é obrigatório'),
    body('updates.*.fee').isNumeric().withMessage('Taxa deve ser um número'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { updates } = req.body;

      const updatedTaxes = await userTaxesService.updateMultipleTokenFees(userId, updates);

      res.json({
        success: true,
        data: updatedTaxes,
        message: 'Taxas de tokens atualizadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar taxas de tokens:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar taxas de tokens'
      });
    }
  }
);

/**
 * @route   POST /api/user-taxes/:userId/token-fees/reset
 * @desc    Resetar todas as taxas de tokens para valores padrão (0)
 * @access  Private (Admin)
 */
router.post('/:userId/token-fees/reset',
  authenticateJWT,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const updatedTaxes = await userTaxesService.resetAllTokenFees(userId);

      res.json({
        success: true,
        data: updatedTaxes,
        message: 'Taxas de tokens resetadas para valores padrão'
      });

    } catch (error) {
      console.error('Erro ao resetar taxas de tokens:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao resetar taxas de tokens'
      });
    }
  }
);

/**
 * @route   PUT /api/user-taxes/:userId
 * @desc    Atualizar taxas customizadas de um usuário
 * @access  Private (Admin)
 */
router.put('/:userId',
  authenticateJWT,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const customTaxes = req.body;

      const updatedTaxes = await userTaxesService.updateCustomTaxes(userId, customTaxes);

      res.json({
        success: true,
        data: updatedTaxes,
        message: 'Taxas atualizadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar taxas:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar taxas'
      });
    }
  }
);

module.exports = router;

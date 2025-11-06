const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/jwt.middleware');

/**
 * Todas as routes de produtos requerem autenticação
 */

/**
 * POST /api/products
 * Criar novo produto (apenas merchants)
 */
router.post('/', authenticateToken, productController.createProduct);

/**
 * GET /api/products
 * Listar produtos
 * - Merchants veem apenas seus produtos
 * - Consumers veem todos os produtos ativos
 */
router.get('/', authenticateToken, productController.listProducts);

/**
 * GET /api/products/:id
 * Buscar produto por ID
 */
router.get('/:id', authenticateToken, productController.getProductById);

/**
 * PUT /api/products/:id
 * Atualizar produto (apenas o merchant dono)
 */
router.put('/:id', authenticateToken, productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Desativar produto (apenas o merchant dono)
 */
router.delete('/:id', authenticateToken, productController.deleteProduct);

/**
 * PATCH /api/products/:id/stock
 * Atualizar estoque do produto
 */
router.patch('/:id/stock', authenticateToken, productController.updateStock);

module.exports = router;

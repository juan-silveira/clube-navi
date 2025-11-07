const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/jwt.middleware');

// Configure multer for memory storage (product images)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit para produtos
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG e WEBP são permitidos.'), false);
    }
  }
});

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

/**
 * POST /api/products/:id/upload-image
 * Upload de imagem do produto (apenas o merchant dono)
 */
router.post('/:id/upload-image', authenticateToken, upload.single('image'), productController.uploadProductImage);

/**
 * GET /api/products/stats
 * Obter estatísticas gerais de produtos (Admin)
 */
router.get('/stats', authenticateToken, productController.getProductStats);

/**
 * GET /api/products/categories/list
 * Listar categorias disponíveis
 */
router.get('/categories/list', authenticateToken, productController.getCategories);

/**
 * GET /api/products/featured/list
 * Listar produtos em destaque
 */
router.get('/featured/list', authenticateToken, productController.getFeaturedProducts);

/**
 * GET /api/products/merchant/:merchantId/stats
 * Obter estatísticas de produtos do merchant
 */
router.get('/merchant/:merchantId/stats', authenticateToken, productController.getMerchantStats);

module.exports = router;

/**
 * Product Controller - Multi-Clube
 * Gerencia produtos dos comerciantes (merchants)
 * Usa req.clubPrisma para isolamento de dados por clube
 */

const { v4: uuidv4 } = require('uuid');
const s3Service = require('../services/s3.service');
const productService = require('../services/product.service');

/**
 * Criar novo produto (apenas merchants)
 */
const createProduct = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const userId = req.user.id;
    const productData = req.body;

    const product = await productService.createProduct(prisma, userId, productData);

    console.log(`✅ Produto criado: ${product.name} (ID: ${product.id})`);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);

    // Handle validation errors with 400 status
    if (error.message.includes('obrigatórios') ||
        error.message.includes('maior que zero') ||
        error.message.includes('entre 0 e 100')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle permission errors with 403 status
    if (error.message.includes('comerciantes') ||
        error.message.includes('aprovado')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar produto',
      error: error.message
    });
  }
};

/**
 * Listar produtos
 * Merchants veem apenas seus produtos
 * Consumers veem todos os produtos ativos
 */
const listProducts = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const userId = req.user?.id;
    const {
      merchantId,
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filters = {
      merchantId,
      category,
      minPrice,
      maxPrice,
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy,
      order
    };

    const result = await productService.listProducts(prisma, userId, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos',
      error: error.message
    });
  }
};

/**
 * Buscar produto por ID
 */
const getProductById = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const { id } = req.params;
    const userId = req.user?.id;

    const product = await productService.getProductById(prisma, id, userId);

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error);

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrado') ||
        error.message.includes('não disponível') ||
        error.message.includes('não tem permissão')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto',
      error: error.message
    });
  }
};

/**
 * Atualizar produto (apenas o merchant dono)
 */
const updateProduct = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const updatedProduct = await productService.updateProduct(prisma, id, userId, updateData);

    console.log(`✅ Produto atualizado: ${updatedProduct.name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);

    // Handle validation errors with 400 status
    if (error.message.includes('maior que zero') ||
        error.message.includes('entre 0 e 100')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Handle permission errors with 403 status
    if (error.message.includes('não tem permissão')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
};

/**
 * Deletar/desativar produto
 */
const deleteProduct = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const userId = req.user.id;
    const { id } = req.params;

    const deletedProduct = await productService.deleteProduct(prisma, id, userId);

    console.log(`🗑️ Produto desativado: ${deletedProduct.name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Produto desativado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Handle permission errors with 403 status
    if (error.message.includes('não tem permissão')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao deletar produto',
      error: error.message
    });
  }
};

/**
 * Atualizar estoque
 */
const updateStock = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const userId = req.user.id;
    const { id } = req.params;
    const { stock, operation } = req.body; // operation: 'set', 'add', 'subtract'

    // Get current product stock for comparison
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { stock: true }
    });

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const updatedProduct = await productService.updateStock(prisma, id, userId, stock, operation);

    console.log(`📦 Estoque atualizado: ${updatedProduct.name} - ${updatedProduct.stock} unidades`);

    res.json({
      success: true,
      message: 'Estoque atualizado com sucesso',
      data: {
        product: updatedProduct,
        previousStock: currentProduct.stock,
        newStock: updatedProduct.stock
      }
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque:', error);

    // Handle validation errors with 400 status
    if (error.message.includes('Quantidade inválida') ||
        error.message.includes('Operação inválida') ||
        error.message.includes('não pode ser negativo')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle not found errors with 404 status
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Handle permission errors with 403 status
    if (error.message.includes('não tem permissão')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar estoque',
      error: error.message
    });
  }
};

/**
 * Upload de imagem do produto
 */
const uploadProductImage = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const userId = req.user.id;
    const { id: productId } = req.params;

    // Verificar se arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { merchantId: true, imageUrl: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Verificar se usuário é o dono do produto
    if (product.merchantId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para alterar este produto'
      });
    }

    // Upload da imagem para S3
    const fileName = `products/${req.club?.slug || 'default'}/${productId}/${uuidv4()}-${req.file.originalname}`;
    const imageUrl = await s3Service.uploadBuffer(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    console.log(`✅ Imagem do produto enviada para S3: ${imageUrl}`);

    // Atualizar URL da imagem no produto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl }
    });

    // Se havia imagem anterior, deletar do S3 (opcional)
    if (product.imageUrl) {
      try {
        const oldKey = product.imageUrl.split('.com/')[1];
        if (oldKey) {
          await s3Service.deleteFile(oldKey);
          console.log(`🗑️ Imagem antiga deletada: ${oldKey}`);
        }
      } catch (deleteError) {
        console.warn('⚠️ Erro ao deletar imagem antiga:', deleteError.message);
        // Não falhar a requisição se não conseguir deletar a imagem antiga
      }
    }

    res.json({
      success: true,
      message: 'Imagem do produto atualizada com sucesso',
      data: {
        productId: updatedProduct.id,
        imageUrl: updatedProduct.imageUrl
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer upload da imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da imagem',
      error: error.message
    });
  }
};

/**
 * Listar categorias disponíveis
 */
const getCategories = async (req, res) => {
  try {
    const prisma = req.clubPrisma;

    const categories = await productService.getCategories(prisma);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar categorias',
      error: error.message
    });
  }
};

/**
 * Listar produtos em destaque
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const { limit = 10, sortBy = 'cashback' } = req.query;

    const products = await productService.getFeaturedProducts(
      prisma,
      parseInt(limit),
      sortBy
    );

    res.json({
      success: true,
      data: { products, count: products.length }
    });
  } catch (error) {
    console.error('❌ Erro ao listar produtos em destaque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos em destaque',
      error: error.message
    });
  }
};

/**
 * Obter estatísticas de produtos do merchant
 */
const getMerchantStats = async (req, res) => {
  try {
    const prisma = req.clubPrisma;
    const { merchantId } = req.params;
    const userId = req.user.id;

    // Verificar se usuário tem permissão (só pode ver próprias stats ou se for admin)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true }
    });

    if (merchantId !== userId && user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para visualizar estas estatísticas'
      });
    }

    const stats = await productService.getMerchantProductStats(prisma, merchantId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
};

/**
 * Obter estatísticas gerais de produtos (Admin)
 */
const getProductStats = async (req, res) => {
  try {
    const prisma = req.clubPrisma;

    // Contar total de produtos
    const total = await prisma.product.count();

    // Contar produtos ativos
    const active = await prisma.product.count({
      where: { isActive: true }
    });

    // Contar produtos com estoque baixo (menos de 10 unidades, mas maior que 0)
    const lowStock = await prisma.product.count({
      where: {
        stock: {
          gt: 0,
          lt: 10
        }
      }
    });

    // Contar produtos sem estoque
    const outOfStock = await prisma.product.count({
      where: { stock: 0 }
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        lowStock,
        outOfStock
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas de produtos',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  uploadProductImage,
  getCategories,
  getFeaturedProducts,
  getMerchantStats,
  getProductStats
};

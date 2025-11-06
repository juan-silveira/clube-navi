/**
 * Product Controller - Multi-Tenant
 * Gerencia produtos dos comerciantes (merchants)
 * Usa req.tenantPrisma para isolamento de dados por tenant
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Criar novo produto (apenas merchants)
 */
const createProduct = async (req, res) => {
  try {
    const prisma = req.tenantPrisma;
    const userId = req.user.id; // Do middleware de autenticação
    const {
      name,
      description,
      price,
      cashbackPercentage,
      imageUrl,
      category,
      stock
    } = req.body;

    // Validações
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nome, descrição e preço são obrigatórios'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Preço deve ser maior que zero'
      });
    }

    if (cashbackPercentage < 0 || cashbackPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentual de cashback deve estar entre 0 e 100'
      });
    }

    // Verificar se usuário é merchant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, merchantStatus: true }
    });

    if (!user || user.userType !== 'merchant') {
      return res.status(403).json({
        success: false,
        message: 'Apenas comerciantes podem criar produtos'
      });
    }

    if (user.merchantStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Comerciante precisa estar aprovado para criar produtos'
      });
    }

    // Criar produto
    const product = await prisma.product.create({
      data: {
        merchantId: userId,
        name,
        description,
        price,
        cashbackPercentage: cashbackPercentage || 0,
        imageUrl: imageUrl || null,
        category: category || null,
        stock: stock || 0,
        isActive: true
      }
    });

    console.log(`✅ Produto criado: ${product.name} (ID: ${product.id})`);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
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
    const prisma = req.tenantPrisma;
    const userId = req.user?.id;
    const {
      merchantId,
      category,
      isActive,
      search,
      limit = 20,
      offset = 0
    } = req.query;

    // Construir filtros
    const where = {};

    // Se usuário é merchant, mostrar apenas seus produtos
    if (req.user?.userType === 'merchant') {
      where.merchantId = userId;
    } else {
      // Consumers veem apenas produtos ativos
      where.isActive = true;

      // Pode filtrar por merchant específico
      if (merchantId) {
        where.merchantId = merchantId;
      }
    }

    // Filtros adicionais
    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar produtos
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          merchant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
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
    const prisma = req.tenantPrisma;
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
            merchantStatus: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Verificar permissão (merchants só veem seus próprios produtos inativos)
    if (!product.isActive && req.user?.userType === 'consumer') {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error);
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
    const prisma = req.tenantPrisma;
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se produto existe e pertence ao merchant
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    if (product.merchantId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este produto'
      });
    }

    // Validar cashbackPercentage se fornecido
    if (updateData.cashbackPercentage !== undefined) {
      if (updateData.cashbackPercentage < 0 || updateData.cashbackPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentual de cashback deve estar entre 0 e 100'
        });
      }
    }

    // Validar price se fornecido
    if (updateData.price !== undefined && updateData.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Preço deve ser maior que zero'
      });
    }

    // Atualizar produto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Produto atualizado: ${updatedProduct.name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
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
    const prisma = req.tenantPrisma;
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar se produto existe e pertence ao merchant
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    if (product.merchantId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este produto'
      });
    }

    // Desativar ao invés de deletar (soft delete)
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    console.log(`🗑️ Produto desativado: ${product.name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Produto desativado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);
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
    const prisma = req.tenantPrisma;
    const userId = req.user.id;
    const { id } = req.params;
    const { stock, operation } = req.body; // operation: 'set', 'add', 'subtract'

    // Verificar se produto existe e pertence ao merchant
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    if (product.merchantId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este produto'
      });
    }

    let newStock = product.stock;

    if (operation === 'set') {
      newStock = stock;
    } else if (operation === 'add') {
      newStock = product.stock + stock;
    } else if (operation === 'subtract') {
      newStock = Math.max(0, product.stock - stock);
    }

    // Atualizar estoque
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: newStock }
    });

    console.log(`📦 Estoque atualizado: ${updatedProduct.name} - ${newStock} unidades`);

    res.json({
      success: true,
      message: 'Estoque atualizado com sucesso',
      data: {
        product: updatedProduct,
        previousStock: product.stock,
        newStock
      }
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar estoque',
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
  updateStock
};

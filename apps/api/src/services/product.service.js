/**
 * Product Service
 *
 * Service para gerenciar lógica de produtos
 */

class ProductService {
  /**
   * Criar produto
   * @param {Object} prisma - Prisma client do clube
   * @param {String} userId - ID do usuário (merchant)
   * @param {Object} data - Dados do produto
   * @returns {Object} Produto criado
   */
  async createProduct(prisma, userId, data) {
    const {
      name,
      description,
      price,
      cashbackPercentage = 0,
      imageUrl = null,
      category = null,
      stock = 0
    } = data;

    // Validações
    if (!name || !description || !price) {
      throw new Error('Nome, descrição e preço são obrigatórios');
    }

    if (price <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    if (cashbackPercentage < 0 || cashbackPercentage > 100) {
      throw new Error('Percentual de cashback deve estar entre 0 e 100');
    }

    // Verificar se usuário é merchant aprovado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, merchantStatus: true }
    });

    if (!user || user.userType !== 'merchant') {
      throw new Error('Apenas comerciantes podem criar produtos');
    }

    if (user.merchantStatus !== 'approved') {
      throw new Error('Comerciante precisa estar aprovado para criar produtos');
    }

    // Criar produto
    const product = await prisma.product.create({
      data: {
        merchantId: userId,
        name,
        description,
        price,
        cashbackPercentage,
        imageUrl,
        category,
        stock,
        isActive: true
      }
    });

    return product;
  }

  /**
   * Listar produtos com filtros e paginação
   * @param {Object} prisma - Prisma client do clube
   * @param {String} userId - ID do usuário
   * @param {Object} filters - Filtros e paginação
   * @returns {Object} Lista de produtos e metadados
   */
  async listProducts(prisma, userId, filters = {}) {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      merchantId,
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      order = 'desc'
    } = filters;

    // Verificar tipo de usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true }
    });

    // Construir where clause
    const where = {};

    // Merchants veem apenas seus produtos
    if (user.userType === 'merchant') {
      where.merchantId = userId;
    } else {
      // Consumers veem apenas produtos ativos
      where.isActive = true;
    }

    // Filtros adicionais
    if (category) {
      where.category = category;
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar produtos com paginação
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          }
        },
        orderBy: { [orderBy]: order },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }

  /**
   * Buscar produto por ID
   * @param {Object} prisma - Prisma client do clube
   * @param {String} productId - ID do produto
   * @param {String} userId - ID do usuário (para validação)
   * @returns {Object} Produto
   */
  async getProductById(prisma, productId, userId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar tipo de usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true }
    });

    // Se for consumer, só pode ver produtos ativos
    if (user.userType === 'consumer' && !product.isActive) {
      throw new Error('Produto não disponível');
    }

    // Se for merchant, só pode ver produtos próprios (a não ser que seja produto ativo)
    if (user.userType === 'merchant' && product.merchantId !== userId && !product.isActive) {
      throw new Error('Você não tem permissão para visualizar este produto');
    }

    return product;
  }

  /**
   * Atualizar produto
   * @param {Object} prisma - Prisma client do clube
   * @param {String} productId - ID do produto
   * @param {String} userId - ID do usuário (merchant)
   * @param {Object} data - Dados para atualizar
   * @returns {Object} Produto atualizado
   */
  async updateProduct(prisma, productId, userId, data) {
    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se usuário é o dono
    if (product.merchantId !== userId) {
      throw new Error('Você não tem permissão para editar este produto');
    }

    // Validar dados se fornecidos
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    if (data.cashbackPercentage !== undefined &&
        (data.cashbackPercentage < 0 || data.cashbackPercentage > 100)) {
      throw new Error('Percentual de cashback deve estar entre 0 e 100');
    }

    // Atualizar produto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        merchant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });

    return updatedProduct;
  }

  /**
   * Desativar produto
   * @param {Object} prisma - Prisma client do clube
   * @param {String} productId - ID do produto
   * @param {String} userId - ID do usuário (merchant)
   * @returns {Object} Produto desativado
   */
  async deleteProduct(prisma, productId, userId) {
    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se usuário é o dono
    if (product.merchantId !== userId) {
      throw new Error('Você não tem permissão para deletar este produto');
    }

    // Desativar produto (soft delete)
    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    return deletedProduct;
  }

  /**
   * Atualizar estoque
   * @param {Object} prisma - Prisma client do clube
   * @param {String} productId - ID do produto
   * @param {String} userId - ID do usuário (merchant)
   * @param {Number} quantity - Quantidade a adicionar/remover
   * @param {String} operation - 'add' ou 'set'
   * @returns {Object} Produto com estoque atualizado
   */
  async updateStock(prisma, productId, userId, quantity, operation = 'add') {
    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se usuário é o dono
    if (product.merchantId !== userId) {
      throw new Error('Você não tem permissão para alterar este produto');
    }

    // Validar quantidade
    if (typeof quantity !== 'number' || quantity < 0) {
      throw new Error('Quantidade inválida');
    }

    // Calcular novo estoque
    let newStock;
    if (operation === 'set') {
      newStock = quantity;
    } else if (operation === 'add') {
      newStock = product.stock + quantity;
    } else if (operation === 'subtract') {
      newStock = product.stock - quantity;
      if (newStock < 0) {
        throw new Error('Estoque não pode ser negativo');
      }
    } else {
      throw new Error('Operação inválida. Use "add", "subtract" ou "set"');
    }

    // Atualizar estoque
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });

    return updatedProduct;
  }

  /**
   * Obter categorias disponíveis
   * @param {Object} prisma - Prisma client do clube
   * @returns {Array} Lista de categorias
   */
  async getCategories(prisma) {
    const categories = await prisma.product.findMany({
      where: {
        category: { not: null },
        isActive: true
      },
      select: { category: true },
      distinct: ['category']
    });

    return categories.map(c => c.category).filter(Boolean);
  }

  /**
   * Obter estatísticas de produtos do merchant
   * @param {Object} prisma - Prisma client do clube
   * @param {String} merchantId - ID do merchant
   * @returns {Object} Estatísticas
   */
  async getMerchantProductStats(prisma, merchantId) {
    const [
      totalProducts,
      activeProducts,
      totalStock,
      averagePrice,
      totalSales
    ] = await Promise.all([
      prisma.product.count({ where: { merchantId } }),
      prisma.product.count({ where: { merchantId, isActive: true } }),
      prisma.product.aggregate({
        where: { merchantId },
        _sum: { stock: true }
      }),
      prisma.product.aggregate({
        where: { merchantId, isActive: true },
        _avg: { price: true }
      }),
      prisma.purchase.count({
        where: { merchantId, status: 'completed' }
      })
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      totalStock: totalStock._sum.stock || 0,
      averagePrice: parseFloat(averagePrice._avg.price || 0),
      totalSales
    };
  }

  /**
   * Buscar produtos em destaque (mais vendidos ou maior cashback)
   * @param {Object} prisma - Prisma client do clube
   * @param {Number} limit - Limite de resultados
   * @param {String} sortBy - 'sales' ou 'cashback'
   * @returns {Array} Produtos em destaque
   */
  async getFeaturedProducts(prisma, limit = 10, sortBy = 'cashback') {
    if (sortBy === 'cashback') {
      // Produtos com maior percentual de cashback
      return await prisma.product.findMany({
        where: { isActive: true },
        include: {
          merchant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          }
        },
        orderBy: { cashbackPercentage: 'desc' },
        take: limit
      });
    } else {
      // Produtos mais vendidos (contar purchases)
      const topProducts = await prisma.purchase.groupBy({
        by: ['productId'],
        where: { status: 'completed' },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: limit
      });

      const productIds = topProducts.map(p => p.productId);

      return await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true
        },
        include: {
          merchant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true
            }
          }
        }
      });
    }
  }
}

module.exports = new ProductService();

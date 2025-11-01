const express = require('express');
const router = express.Router();

/**
 * GET /api/tokens/:symbol/price
 * Retorna o preço de um token a partir do metadata.tokenPrice
 *
 * O preço é atualizado automaticamente quando:
 * 1. Um novo trade é criado (prioridade máxima)
 * 2. Uma nova ordem de compra é criada (se não houver trades)
 * 3. Uma nova ordem de venda é criada (se não houver trades nem ordens de compra)
 * 4. Padrão inicial: 1.00
 */
router.get('/:symbol/price', async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!global.prisma) {
      return res.status(500).json({
        success: false,
        message: 'Serviço temporariamente indisponível',
        error: 'Prisma client not initialized'
      });
    }

    const prisma = global.prisma;

    // Contract type ID para tokens ERC20
    const TOKEN_CONTRACT_TYPE_ID = 'cc350023-d9ba-4746-85f3-1590175a2328';

    // Buscar token pelo símbolo
    const token = await prisma.smartContract.findFirst({
      where: {
        contractTypeId: TOKEN_CONTRACT_TYPE_ID,
        metadata: {
          path: ['symbol'],
          equals: symbol
        }
      }
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: `Token ${symbol} não encontrado`
      });
    }

    // Obter preço do metadata
    const metadata = token.metadata || {};
    const price = metadata.tokenPrice || 1.00;

    return res.json({
      success: true,
      data: {
        symbol,
        price: parseFloat(price),
        source: 'metadata',
        lastUpdate: token.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting token price:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar preço do token',
      error: error.message
    });
  }
});

module.exports = router;

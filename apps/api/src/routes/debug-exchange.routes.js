const express = require('express');
const router = express.Router();
const { prisma } = require('../utils/database');

router.get('/debug/exchange-contracts', async (req, res) => {
  try {
    // Buscar TODOS os contratos que possam ser exchanges
    const allContracts = await prisma.smartContract.findMany({
      where: {
        OR: [
          { name: { contains: 'exchange', mode: 'insensitive' } },
          { name: { contains: 'Exchange', mode: 'insensitive' } },
          { contractTypeId: 'b96cbbfd-38b9-4224-8eb6-467fb612190b' }
        ]
      },
      include: {
        contractType: true
      }
    });

    // Buscar todos os contract types
    const contractTypes = await prisma.contractType.findMany();

    res.json({
      success: true,
      data: {
        exchanges: allContracts.map(c => ({
          id: c.id,
          name: c.name,
          address: c.address,
          network: c.network,
          contractTypeId: c.contractTypeId,
          contractTypeName: c.contractType?.name,
          isActive: c.isActive,
          metadata: c.metadata
        })),
        contractTypes: contractTypes.map(ct => ({
          id: ct.id,
          name: ct.name,
          description: ct.description
        })),
        searchCriteria: {
          exchangeTypeId: 'b96cbbfd-38b9-4224-8eb6-467fb612190b',
          network: process.env.DEFAULT_NETWORK || 'testnet'
        }
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
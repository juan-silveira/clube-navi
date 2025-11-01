const { prisma } = require('../utils/database');

const CONTRACT_TYPES = {
  TOKEN: 'cc350023-d9ba-4746-85f3-1590175a2328',
  STAKE: '165a6e47-a216-4ac4-b96d-1c6d85ebb492',
  EXCHANGE: 'b96cbbfd-38b9-4224-8eb6-467fb612190b'
};

const getTokens = async (req, res) => {
  try {
    const { network } = req.query;
    const defaultNetwork = network || process.env.DEFAULT_NETWORK || 'testnet';

    const tokens = await prisma.smartContract.findMany({
      where: {
        contractTypeId: CONTRACT_TYPES.TOKEN,
        network: defaultNetwork
      },
      include: {
        contractType: true
      }
    });

    return res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Error fetching token contracts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratos de token',
      error: error.message
    });
  }
};

const getStakes = async (req, res) => {
  try {
    const { network } = req.query;
    const defaultNetwork = network || process.env.DEFAULT_NETWORK || 'testnet';

    const stakes = await prisma.smartContract.findMany({
      where: {
        contractTypeId: CONTRACT_TYPES.STAKE,
        network: defaultNetwork
      },
      include: {
        contractType: true
      }
    });

    return res.json({
      success: true,
      data: stakes
    });
  } catch (error) {
    console.error('Error fetching stake contracts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratos de stake',
      error: error.message
    });
  }
};

const getExchanges = async (req, res) => {
  try {
    const { network } = req.query;
    const defaultNetwork = network || process.env.DEFAULT_NETWORK || 'testnet';

    const exchanges = await prisma.smartContract.findMany({
      where: {
        contractTypeId: CONTRACT_TYPES.EXCHANGE,
        network: defaultNetwork
      },
      include: {
        contractType: true
      }
    });

    return res.json({
      success: true,
      data: exchanges
    });
  } catch (error) {
    console.error('Error fetching exchange contracts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratos de exchange',
      error: error.message
    });
  }
};

module.exports = {
  getTokens,
  getStakes,
  getExchanges
};
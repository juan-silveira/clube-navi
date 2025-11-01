/**
 * Stake Contracts Routes
 * Rotas para gerenciamento de contratos de stake
 */

const express = require('express');
const router = express.Router();
const prismaConfig = require('../config/prisma');
const fs = require('fs');
const path = require('path');
const tokenService = require('../services/token.service');
const cdiService = require('../services/cdi.service');
const multer = require('multer');
const s3Service = require('../services/s3.service');

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Helper function to get prisma instance
const getPrisma = () => {
  try {
    return prismaConfig.getPrisma();
  } catch (error) {
    console.error('Prisma not initialized:', error.message);
    throw new Error('Database connection not available');
  }
};

// Helper to add stake to issuer's stakes array
const addStakeToIssuer = async (issuerId, stakeId) => {
  if (!issuerId || !stakeId) return;

  try {
    const prisma = getPrisma();

    // Get current issuer
    const issuer = await prisma.issuer.findUnique({
      where: { id: issuerId },
      select: { stakes: true }
    });

    if (!issuer) {
      console.warn(`⚠️ Issuer ${issuerId} not found`);
      return;
    }

    // Add stake ID if not already in array
    if (!issuer.stakes.includes(stakeId)) {
      await prisma.issuer.update({
        where: { id: issuerId },
        data: {
          stakes: {
            push: stakeId
          }
        }
      });
      console.log(`✅ Added stake ${stakeId} to issuer ${issuerId} (total: ${issuer.stakes.length + 1})`);
    }
  } catch (error) {
    console.error('Error adding stake to issuer:', error);
  }
};

// Helper to remove stake from issuer's stakes array
const removeStakeFromIssuer = async (issuerId, stakeId) => {
  if (!issuerId || !stakeId) return;

  try {
    const prisma = getPrisma();

    // Get current issuer
    const issuer = await prisma.issuer.findUnique({
      where: { id: issuerId },
      select: { stakes: true }
    });

    if (!issuer) {
      console.warn(`⚠️ Issuer ${issuerId} not found`);
      return;
    }

    // Remove stake ID from array
    const updatedStakes = issuer.stakes.filter(id => id !== stakeId);

    if (updatedStakes.length !== issuer.stakes.length) {
      await prisma.issuer.update({
        where: { id: issuerId },
        data: {
          stakes: updatedStakes
        }
      });
      console.log(`✅ Removed stake ${stakeId} from issuer ${issuerId} (total: ${updatedStakes.length})`);
    }
  } catch (error) {
    console.error('Error removing stake from issuer:', error);
  }
};

// Helper to check whitelist status from blockchain
const checkWhitelistStatus = async (contractAddress, network, abi) => {
  try {
    const ethers = require('ethers');
    const blockchainService = require('../services/blockchain.service');

    const provider = blockchainService.config.getProvider(network);
    const contractInstance = new ethers.Contract(contractAddress, abi, provider);

    // Try to call whitelistEnabled function
    if (contractInstance.whitelistEnabled) {
      const result = await contractInstance.whitelistEnabled();
      return Boolean(result);
    }
    return false;
  } catch (error) {
    // If function doesn't exist or fails, assume whitelist is disabled
    return false;
  }
};

// Helper to get whitelisted addresses
const getWhitelistedAddresses = async (contractAddress, network, abi, userAddress) => {
  try {
    const ethers = require('ethers');
    const blockchainService = require('../services/blockchain.service');

    const provider = blockchainService.config.getProvider(network);
    const contractInstance = new ethers.Contract(contractAddress, abi, provider);

    // Try to call getWhitelistedAddresses function
    if (contractInstance.getWhitelistedAddresses) {
      const addresses = await contractInstance.getWhitelistedAddresses();

      // Check if user is whitelisted
      if (userAddress && Array.isArray(addresses)) {
        const normalizedUserAddress = userAddress.toLowerCase();
        const isUserWhitelisted = addresses.some(addr =>
          addr && addr.toLowerCase() === normalizedUserAddress
        );
        return { addresses, isUserWhitelisted };
      }

      return { addresses, isUserWhitelisted: false };
    }
    return { addresses: [], isUserWhitelisted: false };
  } catch (error) {
    // If function doesn't exist or fails, return empty
    return { addresses: [], isUserWhitelisted: false };
  }
};

// Load default stake ABI
const loadStakeABI = () => {
  try {
    const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_stake_abi.json');
    const abiContent = fs.readFileSync(abiPath, 'utf8');
    return JSON.parse(abiContent);
  } catch (error) {
    console.error('Error loading stake ABI:', error);
    return null;
  }
};

// Função helper para buscar contract type por nome
const getContractTypeByName = async (name) => {
  try {
    const contractType = await global.prisma.contractType.findUnique({
      where: { name }
    });
    return contractType;
  } catch (error) {
    console.warn(`Não foi possível encontrar contract type ${name}:`, error.message);
    return null;
  }
};

/**
 * GET /api/stake-contracts/by-code/:code
 * Busca um contrato pelo código do produto
 */
router.get('/by-code/:code', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código do produto é obrigatório'
      });
    }

    // Buscar contrato pelo código no metadata
    const contract = await prisma.smartContract.findFirst({
      where: {
        isActive: true,
        metadata: {
          path: ['code'],
          equals: code
        }
      },
      select: {
        id: true,
        name: true,
        address: true,
        network: true,
        isActive: true,
        metadata: true,
        abi: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        contractType: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    // Load default stake ABI if needed
    const defaultStakeABI = loadStakeABI();
    let abi = typeof contract.abi === 'string' ? JSON.parse(contract.abi) : contract.abi;
    if (!abi) {
      abi = defaultStakeABI;
    }

    // Buscar símbolo do token se tokenAddress existir
    let symbol = 'STAKE';
    if (contract.metadata?.tokenAddress) {
      try {
        const tokenInfo = await tokenService.getTokenInfo(
          contract.metadata.tokenAddress,
          contract.network.toLowerCase()
        );
        symbol = tokenInfo.symbol;
      } catch (error) {
        console.warn(`Erro ao buscar símbolo para token ${contract.metadata.tokenAddress}:`, error.message);
      }
    }

    // Transform data to match frontend format
    const transformedContract = {
      id: contract.id,
      name: contract.name,
      address: contract.address,
      tokenAddress: contract.metadata?.tokenAddress || null,
      stakeToken: contract.metadata?.tokenAddress || null,
      symbol: symbol,
      network: contract.network.toLowerCase(),
      description: contract.metadata?.description || null,
      adminAddress: contract.metadata?.adminAddress || null,
      companyId: contract.companyId,
      isActive: contract.isActive,
      createdAt: contract.createdAt.toISOString(),
      metadata: contract.metadata
    };

    res.json({
      success: true,
      data: transformedContract
    });

  } catch (error) {
    console.error('Error fetching contract by code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/stake-contracts
 * Lista todos os contratos de stake
 */
router.get('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    console.log('Prisma instance:', prisma ? 'OK' : 'UNDEFINED');

    if (!prisma) {
      throw new Error('Prisma instance is undefined');
    }

    // Get user address from request (if authenticated)
    const userAddress = req.user?.publicKey || req.user?.blockchainAddress || req.user?.walletAddress;

    // Get optional companyId filter from query params
    const { companyId } = req.query;

    // Build where clause - filtrar APENAS contratos de stake (ativos e inativos)
    const whereClause = {
      // Filtrar por metadata.contractType = 'stake' OU contractType = stake
      OR: [
        {
          metadata: {
            path: ['contractType'],
            equals: 'stake'
          }
        },
        {
          metadata: {
            path: ['contractType'],
            equals: 'staking'
          }
        }
      ]
    };

    // Add company filter if provided
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const contracts = await prisma.smartContract.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        address: true,
        network: true,
        isActive: true,
        metadata: true,
        abi: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        contractType: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Load default stake ABI for contracts without ABI
    const defaultStakeABI = loadStakeABI();

    // Transform data to match frontend format and fetch token symbols + whitelist info
    const transformedContracts = await Promise.all(contracts.map(async (contract) => {
      let symbol = 'STAKE'; // Default symbol
      let minValueStake = null;
      let whitelistEnabled = false;
      let userWhitelisted = false;

      // Get ABI (contract's own or default)
      let abi = typeof contract.abi === 'string' ? JSON.parse(contract.abi) : contract.abi;
      if (!abi) {
        abi = defaultStakeABI;
      }

      // Buscar símbolo do token se tokenAddress existir
      if (contract.metadata?.tokenAddress) {
        try {
          const tokenInfo = await tokenService.getTokenInfo(
            contract.metadata.tokenAddress,
            contract.network.toLowerCase()
          );
          symbol = tokenInfo.symbol;
        } catch (error) {
          console.warn(`Erro ao buscar símbolo para token ${contract.metadata.tokenAddress}:`, error.message);
        }
      }

      // Buscar minValueStake do contrato de stake
      if (abi) {
        try {
          const ethers = require('ethers');
          const blockchainService = require('../services/blockchain.service');
          const provider = blockchainService.config.getProvider(contract.network.toLowerCase());
          const contractInstance = new ethers.Contract(contract.address, abi, provider);

          if (contractInstance.minValueStake) {
            const minValueStakePromise = contractInstance.minValueStake();
            minValueStake = await Promise.race([
              minValueStakePromise,
              new Promise((resolve) => setTimeout(() => resolve(null), 3000)) // 3 second timeout
            ]);

            // Converter BigNumber para string se necessário
            if (minValueStake && minValueStake._isBigNumber) {
              minValueStake = minValueStake.toString();
            }
          }
        } catch (error) {
          console.warn(`Erro ao buscar minValueStake para contrato ${contract.address}:`, error.message);
        }
      }

      // Check whitelist from metadata first (fast), then optionally from blockchain
      if (contract.metadata?.whitelistEnabled !== undefined) {
        // Use cached whitelist status from metadata
        whitelistEnabled = contract.metadata.whitelistEnabled;

        // If whitelist is enabled and user is logged in, check if user is in cached whitelist
        if (whitelistEnabled && userAddress && contract.metadata?.whitelist) {
          const normalizedUserAddress = userAddress.toLowerCase();
          const whitelistArray = Array.isArray(contract.metadata.whitelist)
            ? contract.metadata.whitelist
            : [];
          userWhitelisted = whitelistArray.some(addr => addr.toLowerCase() === normalizedUserAddress);

          console.log(`✅ Whitelist check from metadata for ${contract.address}: user ${normalizedUserAddress} is ${userWhitelisted ? 'whitelisted' : 'not whitelisted'}`);
        }
      } else if (abi) {
        // Fallback: Check whitelist status from blockchain if not in metadata (with timeout)
        try {
          console.log(`⚠️ Whitelist not in metadata for ${contract.address}, checking blockchain...`);
          const whitelistPromise = checkWhitelistStatus(contract.address, contract.network.toLowerCase(), abi);
          whitelistEnabled = await Promise.race([
            whitelistPromise,
            new Promise((resolve) => setTimeout(() => resolve(false), 3000)) // 3 second timeout
          ]);

          // If whitelist is enabled and user is logged in, check if user is whitelisted
          if (whitelistEnabled && userAddress) {
            const whitelistPromise = getWhitelistedAddresses(contract.address, contract.network.toLowerCase(), abi, userAddress);
            const whitelistResult = await Promise.race([
              whitelistPromise,
              new Promise((resolve) => setTimeout(() => resolve({ isUserWhitelisted: false }), 3000)) // 3 second timeout
            ]);
            userWhitelisted = whitelistResult.isUserWhitelisted;
          }
        } catch (error) {
          console.warn(`Error checking whitelist for ${contract.address}:`, error.message);
        }
      }

      return {
        id: contract.id,
        name: contract.name,
        address: contract.address,
        tokenAddress: contract.metadata?.tokenAddress || null,
        stakeToken: contract.metadata?.tokenAddress || null, // Alias for compatibility
        symbol: symbol, // Incluir o símbolo do token
        minValueStake: minValueStake, // Valor mínimo de stake em wei
        network: contract.network.toLowerCase(),
        description: contract.metadata?.description || null,
        adminAddress: contract.metadata?.adminAddress || null,
        companyId: contract.companyId, // Incluir companyId na resposta
        isActive: contract.isActive,
        whitelistEnabled, // Include whitelist status (from metadata or blockchain)
        userWhitelisted, // Include if user is whitelisted
        whitelistLastSync: contract.metadata?.whitelistLastSync || null, // Last sync timestamp
        createdAt: contract.createdAt.toISOString(),
        metadata: contract.metadata // Incluir o metadata completo
      };
    }));

    res.json({
      success: true,
      data: transformedContracts
    });

  } catch (error) {
    console.error('Error fetching stake contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratos de stake',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/stake-contracts
 * Registra um novo contrato de stake
 */
router.post('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    const {
      address, tokenAddress, network, name, description, adminAddress, risk, companyId, code, investment_type,
      // Campos do emissor
      issuerId, issuer, issuerName, issuerDescription, issuerWebsite, issuerFoundationYear, issuerLogo,
      // Campos financeiros
      equivalentCDI, rentability, rentabilityRange, rentabilityTooltip, rentabilityRangeTooltip,
      // Características do ativo
      assetType, paymentFrequency, maturityDate, status, market, totalEmission, capturedAmount, minInvestment, tokenSymbol,
      // Garantias e riscos
      guarantees, risks,
      // Blockchain
      blockchainNetwork, registryInfo,
      // Imagens
      logoUrl, bannerUrl
    } = req.body;

    // Validações básicas
    if (!address || !tokenAddress || !network || !name) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: address, tokenAddress, network, name'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'companyId é obrigatório. Selecione uma empresa para associar este contrato.'
      });
    }

    // Validar risco (0-4)
    if (risk !== undefined && risk !== null && (risk < 0 || risk > 4 || !Number.isInteger(risk))) {
      return res.status(400).json({
        success: false,
        message: 'Risco deve ser um número inteiro entre 0 e 4 (0=Muito Baixo, 1=Baixo, 2=Médio, 3=Alto, 4=Muito Alto)'
      });
    }

    // Validar formato de endereço Ethereum
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(address)) {
      return res.status(400).json({
        success: false,
        message: 'Endereço do contrato inválido'
      });
    }

    if (!ethAddressRegex.test(tokenAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Endereço do token inválido'
      });
    }

    if (adminAddress && !ethAddressRegex.test(adminAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Endereço do admin inválido'
      });
    }

    // Verificar se o contrato já existe
    const existingContract = await prisma.smartContract.findUnique({
      where: { address }
    });

    if (existingContract) {
      return res.status(409).json({
        success: false,
        message: 'Contrato com este endereço já existe'
      });
    }

    // Verificar se a empresa existe e está ativa
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, isActive: true, name: true }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      if (!company.isActive) {
        return res.status(400).json({
          success: false,
          message: `Empresa "${company.name}" está inativa. Selecione outra empresa.`
        });
      }
    } catch (companyError) {
      console.error('Error validating company:', companyError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao validar empresa'
      });
    }

    // Buscar contract type dinamicamente
    console.log('🔍 Buscando contract type stake...');
    const contractTypeRecord = await getContractTypeByName('stake');
    if (!contractTypeRecord) {
      return res.status(500).json({
        success: false,
        message: 'Contract type stake não encontrado no banco de dados'
      });
    }
    console.log('✅ Contract type encontrado:', contractTypeRecord.id, contractTypeRecord.name);

    // Load stake ABI
    const stakeABI = loadStakeABI();
    if (!stakeABI) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar ABI do contrato de stake'
      });
    }

    // Calcular CDI Equivalent automaticamente se rentabilidade foi fornecida
    let cdiData = {};
    const { rentabilityValue, rentabilityRangeMin, rentabilityRangeMax } = req.body;

    if (rentabilityValue) {
      // Renda fixa - usar valor direto
      try {
        console.log(`[CDI Auto-calc] Calculando CDI para rentabilidade fixa: ${rentabilityValue}% a.a.`);
        const cdiCalc = await cdiService.calculateCdiEquivalent(rentabilityValue);
        cdiData = {
          equivalentCDI: cdiCalc.cdiEquivalent,
          cdiRate: cdiCalc.cdiRate,
          cdiCalculationDate: cdiCalc.cdiDate,
          cdiProfitabilityUsed: rentabilityValue,
          cdiProfitabilitySource: 'fixed',
          rentabilityValue: rentabilityValue
        };
        console.log(`[CDI Auto-calc] ✅ Resultado: ${cdiData.equivalentCDI}% do CDI`);
      } catch (error) {
        console.warn('[CDI Auto-calc] Não foi possível calcular CDI Equivalent:', error.message);
      }
    } else if (rentabilityRangeMin && rentabilityRangeMax) {
      // Renda variável - usar média da faixa
      const avgProfitability = (
        (parseFloat(rentabilityRangeMin) + parseFloat(rentabilityRangeMax)) / 2
      ).toFixed(2);

      try {
        console.log(`[CDI Auto-calc] Calculando CDI para rentabilidade variável (média): ${avgProfitability}% a.a.`);
        const cdiCalc = await cdiService.calculateCdiEquivalent(avgProfitability);
        cdiData = {
          equivalentCDI: cdiCalc.cdiEquivalent,
          cdiRate: cdiCalc.cdiRate,
          cdiCalculationDate: cdiCalc.cdiDate,
          cdiProfitabilityUsed: avgProfitability,
          cdiProfitabilitySource: 'variable_avg',
          rentabilityRangeMin: rentabilityRangeMin,
          rentabilityRangeMax: rentabilityRangeMax
        };
        console.log(`[CDI Auto-calc] ✅ Resultado: ${cdiData.equivalentCDI}% do CDI`);
      } catch (error) {
        console.warn('[CDI Auto-calc] Não foi possível calcular CDI Equivalent:', error.message);
      }
    }

    // Criar o contrato
    const newContract = await prisma.smartContract.create({
      data: {
        name,
        address,
        network: network.toLowerCase(),
        companyId: companyId,
        contractTypeId: contractTypeRecord.id, // Usar ID dinâmico
        abi: stakeABI, // Include the stake ABI
        isActive: true,
        metadata: {
          tokenAddress,
          description,
          adminAddress,
          contractType: 'stake',
          code: code || null,
          investment_type: investment_type || 'stake',
          risk: risk || 1,
          // Emissor
          ...(issuerId && { issuerId }),
          ...(issuer && { issuer }),
          ...(issuerName && { issuerName }),
          ...(issuerDescription && { issuerDescription }),
          ...(issuerWebsite && { issuerWebsite }),
          ...(issuerFoundationYear && { issuerFoundationYear }),
          ...(issuerLogo && { issuerLogo }),
          // Campos financeiros (incluindo CDI calculado automaticamente)
          ...cdiData, // CDI Equivalent calculado automaticamente
          ...(equivalentCDI && { equivalentCDI }), // Permitir override manual
          ...(rentability && { rentability }),
          ...(rentabilityRange && { rentabilityRange }),
          ...(rentabilityTooltip && { rentabilityTooltip }),
          ...(rentabilityRangeTooltip && { rentabilityRangeTooltip }),
          // Características do ativo
          ...(assetType && { assetType }),
          ...(paymentFrequency && { paymentFrequency }),
          ...(maturityDate && { maturityDate }),
          ...(status && { status }),
          ...(market && { market }),
          ...(totalEmission && { totalEmission }),
          ...(capturedAmount && { capturedAmount }),
          ...(minInvestment && { minInvestment }),
          ...(tokenSymbol && { tokenSymbol }),
          // Garantias e riscos
          ...(guarantees && { guarantees }),
          ...(risks && { risks }),
          // Blockchain
          ...(blockchainNetwork && { blockchainNetwork }),
          ...(registryInfo && { registryInfo }),
          // Imagens
          ...(logoUrl && { logoUrl }),
          ...(bannerUrl && { bannerUrl }),
          lastDistribution: null,
          nextDistribution: null,
          registeredBy: 'system',
          registrationSource: 'admin_panel',
          companyId: companyId
        },
        updatedAt: new Date()
      }
    });

    // Adicionar stake ao array de stakes do emissor, se houver
    if (issuerId) {
      await addStakeToIssuer(issuerId, newContract.id);
    }

    // Retornar dados no formato esperado pelo frontend
    const responseData = {
      id: newContract.id,
      name: newContract.name,
      address: newContract.address,
      tokenAddress,
      network: network.toLowerCase(),
      description,
      adminAddress,
      isActive: newContract.isActive,
      createdAt: newContract.createdAt.toISOString()
    };

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Contrato de stake registrado com sucesso'
    });

  } catch (error) {
    console.error('Error creating stake contract:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Contrato com este endereço já existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao registrar contrato de stake',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * PATCH /api/stake-contracts/:id/abi
 * Atualiza apenas o ABI de um contrato de stake
 */
router.patch('/:id/abi', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    // Load stake ABI
    const stakeABI = loadStakeABI();
    if (!stakeABI) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar ABI do contrato de stake'
      });
    }

    // Buscar contract type dinamicamente
    const contractTypeRecord = await getContractTypeByName('stake');
    if (!contractTypeRecord) {
      return res.status(500).json({
        success: false,
        message: 'Contract type stake não encontrado no banco de dados'
      });
    }

    const updatedContract = await prisma.smartContract.update({
      where: { id },
      data: {
        abi: stakeABI,
        contractTypeId: contractTypeRecord.id,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        id: updatedContract.id,
        name: updatedContract.name,
        address: updatedContract.address,
        message: 'ABI atualizado com sucesso'
      }
    });

  } catch (error) {
    console.error('Error updating stake contract ABI:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar ABI do contrato',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * PUT /api/stake-contracts/:id
 * Atualiza um contrato de stake
 */
router.put('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;
    const {
      name, description, adminAddress, isActive, code, investment_type, risk, companyId,
      // Novos campos financeiros
      equivalentCDI, rentability, rentabilityRange,
      rentabilityTooltip, rentabilityRangeTooltip,
      // Características do ativo
      assetType, paymentFrequency, maturityDate,
      // Captação
      status, market, totalEmission, capturedAmount, minInvestment,
      // Emissor
      issuerId, issuer, issuerName, issuerDescription, issuerWebsite, issuerFoundationYear, issuerLogo,
      // Garantias e Riscos
      guarantees, risks,
      // Blockchain
      blockchainNetwork, registryInfo,
      // Imagens
      logoUrl, bannerUrl
    } = req.body;

    // Buscar contrato atual para preservar metadata existente
    const currentContract = await prisma.smartContract.findUnique({
      where: { id },
      select: { metadata: true, companyId: true }
    });

    if (!currentContract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Se companyId foi fornecido, validar a empresa
    if (companyId && companyId !== currentContract.companyId) {
      try {
        const company = await prisma.company.findUnique({
          where: { id: companyId },
          select: { id: true, isActive: true, name: true }
        });

        if (!company) {
          return res.status(404).json({
            success: false,
            message: 'Empresa não encontrada'
          });
        }

        if (!company.isActive) {
          return res.status(400).json({
            success: false,
            message: `Empresa "${company.name}" está inativa. Selecione outra empresa.`
          });
        }
      } catch (companyError) {
        console.error('Error validating company:', companyError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao validar empresa'
        });
      }
    }

    // Validar risco se fornecido (0-4)
    if (risk !== undefined && risk !== null && (risk < 0 || risk > 4 || !Number.isInteger(risk))) {
      return res.status(400).json({
        success: false,
        message: 'Risco deve ser um número inteiro entre 0 e 4 (0=Muito Baixo, 1=Baixo, 2=Médio, 3=Alto, 4=Muito Alto)'
      });
    }

    // Calcular CDI Equivalent automaticamente se rentabilidade foi fornecida
    let cdiData = {};
    const { rentabilityValue, rentabilityRangeMin, rentabilityRangeMax } = req.body;

    if (rentabilityValue) {
      // Renda fixa - usar valor direto
      try {
        console.log(`[CDI Auto-calc UPDATE] Calculando CDI para rentabilidade fixa: ${rentabilityValue}% a.a.`);
        const cdiCalc = await cdiService.calculateCdiEquivalent(rentabilityValue);
        cdiData = {
          equivalentCDI: cdiCalc.cdiEquivalent,
          cdiRate: cdiCalc.cdiRate,
          cdiCalculationDate: cdiCalc.cdiDate,
          cdiProfitabilityUsed: rentabilityValue,
          cdiProfitabilitySource: 'fixed',
          rentabilityValue: rentabilityValue
        };
        console.log(`[CDI Auto-calc UPDATE] ✅ Resultado: ${cdiData.equivalentCDI}% do CDI`);
      } catch (error) {
        console.warn('[CDI Auto-calc UPDATE] Não foi possível calcular CDI Equivalent:', error.message);
      }
    } else if (rentabilityRangeMin && rentabilityRangeMax) {
      // Renda variável - usar média da faixa
      const avgProfitability = (
        (parseFloat(rentabilityRangeMin) + parseFloat(rentabilityRangeMax)) / 2
      ).toFixed(2);

      try {
        console.log(`[CDI Auto-calc UPDATE] Calculando CDI para rentabilidade variável (média): ${avgProfitability}% a.a.`);
        const cdiCalc = await cdiService.calculateCdiEquivalent(avgProfitability);
        cdiData = {
          equivalentCDI: cdiCalc.cdiEquivalent,
          cdiRate: cdiCalc.cdiRate,
          cdiCalculationDate: cdiCalc.cdiDate,
          cdiProfitabilityUsed: avgProfitability,
          cdiProfitabilitySource: 'variable_avg',
          rentabilityRangeMin: rentabilityRangeMin,
          rentabilityRangeMax: rentabilityRangeMax
        };
        console.log(`[CDI Auto-calc UPDATE] ✅ Resultado: ${cdiData.equivalentCDI}% do CDI`);
      } catch (error) {
        console.warn('[CDI Auto-calc UPDATE] Não foi possível calcular CDI Equivalent:', error.message);
      }
    }

    // IMPORTANTE: Preservar TODO o metadata existente e apenas atualizar campos fornecidos
    const updatedMetadata = {
      ...currentContract.metadata,  // Preservar TUDO que já existe
      ...cdiData, // Adicionar dados do CDI calculado automaticamente
      contractType: 'stake',
      lastUpdated: new Date().toISOString()
    };

    // Atualizar campos básicos apenas se fornecidos
    if (description !== undefined) updatedMetadata.description = description;
    if (adminAddress !== undefined) updatedMetadata.adminAddress = adminAddress;
    if (code !== undefined) updatedMetadata.code = code;
    if (investment_type !== undefined) updatedMetadata.investment_type = investment_type;
    if (risk !== undefined) updatedMetadata.risk = risk;

    // Atualizar campos financeiros
    if (equivalentCDI !== undefined) updatedMetadata.equivalentCDI = equivalentCDI;
    if (rentability !== undefined) updatedMetadata.rentability = rentability;
    if (rentabilityRange !== undefined) updatedMetadata.rentabilityRange = rentabilityRange;
    if (rentabilityTooltip !== undefined) updatedMetadata.rentabilityTooltip = rentabilityTooltip;
    if (rentabilityRangeTooltip !== undefined) updatedMetadata.rentabilityRangeTooltip = rentabilityRangeTooltip;

    // Atualizar características do ativo
    if (assetType !== undefined) updatedMetadata.assetType = assetType;
    if (paymentFrequency !== undefined) updatedMetadata.paymentFrequency = paymentFrequency;
    if (maturityDate !== undefined) updatedMetadata.maturityDate = maturityDate;

    // Atualizar informações de captação
    if (status !== undefined) updatedMetadata.status = status;
    if (market !== undefined) updatedMetadata.market = market;
    if (totalEmission !== undefined) updatedMetadata.totalEmission = totalEmission;
    if (capturedAmount !== undefined) updatedMetadata.capturedAmount = capturedAmount;
    if (minInvestment !== undefined) updatedMetadata.minInvestment = minInvestment;

    // Atualizar informações do emissor
    if (issuerId !== undefined) updatedMetadata.issuerId = issuerId;
    if (issuer !== undefined) updatedMetadata.issuer = issuer;
    if (issuerName !== undefined) updatedMetadata.issuerName = issuerName;
    if (issuerDescription !== undefined) updatedMetadata.issuerDescription = issuerDescription;
    if (issuerWebsite !== undefined) updatedMetadata.issuerWebsite = issuerWebsite;
    if (issuerFoundationYear !== undefined) updatedMetadata.issuerFoundationYear = issuerFoundationYear;
    if (issuerLogo !== undefined) updatedMetadata.issuerLogo = issuerLogo;

    // Atualizar garantias e riscos
    if (guarantees !== undefined) updatedMetadata.guarantees = guarantees;
    if (risks !== undefined) updatedMetadata.risks = risks;

    // Atualizar informações blockchain
    if (blockchainNetwork !== undefined) updatedMetadata.blockchainNetwork = blockchainNetwork;
    if (registryInfo !== undefined) updatedMetadata.registryInfo = registryInfo;

    // Atualizar URLs de imagens
    if (logoUrl !== undefined) updatedMetadata.logoUrl = logoUrl;
    if (bannerUrl !== undefined) updatedMetadata.bannerUrl = bannerUrl;

    console.log('📝 [Backend] Atualizando contrato:', {
      id,
      preservando_metadata: Object.keys(currentContract.metadata || {}),
      atualizando: Object.keys(updatedMetadata)
    });

    // Gerenciar mudança de issuer
    const oldIssuerId = currentContract.metadata?.issuerId;
    const newIssuerId = issuerId;

    // Se o issuer mudou, atualizar arrays
    if (oldIssuerId !== newIssuerId) {
      // Remover do issuer antigo
      if (oldIssuerId) {
        await removeStakeFromIssuer(oldIssuerId, id);
      }
      // Adicionar ao novo issuer
      if (newIssuerId) {
        await addStakeToIssuer(newIssuerId, id);
      }
    }

    // Gerenciar ativação/desativação do stake
    if (isActive !== undefined && isActive !== currentContract.isActive) {
      const currentIssuerId = currentContract.metadata?.issuerId;
      if (currentIssuerId) {
        if (isActive) {
          // Ativando: adicionar ao array do issuer
          await addStakeToIssuer(currentIssuerId, id);
        } else {
          // Desativando: remover do array do issuer
          await removeStakeFromIssuer(currentIssuerId, id);
        }
      }
    }

    // Preparar dados para update
    const updateData = {
      metadata: updatedMetadata,
      updatedAt: new Date()
    };

    // Adicionar campos opcionais apenas se fornecidos
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (companyId !== undefined) updateData.companyId = companyId;

    const updatedContract = await prisma.smartContract.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: {
        id: updatedContract.id,
        name: updatedContract.name,
        address: updatedContract.address,
        isActive: updatedContract.isActive,
        metadata: updatedContract.metadata,
        message: 'Contrato atualizado com sucesso'
      }
    });

  } catch (error) {
    console.error('Error updating stake contract:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar contrato',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/stake-contracts/:id
 * Remove (desativa) um contrato de stake
 */
router.delete('/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    await prisma.smartContract.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Contrato desativado com sucesso'
    });

  } catch (error) {
    console.error('Error deleting stake contract:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao remover contrato',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * PATCH /api/stake-contracts/:address/distribution
 * Atualiza dados de distribuição após chamada de distributeReward
 */
router.patch('/:address/distribution', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { address } = req.params;
    const { percentage, network } = req.body;
    

    if (!percentage || percentage < 0) {
      return res.status(400).json({
        success: false,
        message: 'Percentage é obrigatório e deve ser maior que 0'
      });
    }

    // Buscar cycleDurationInDays do contrato
    let cycleDurationInDays = 90; // Default fallback
    
    try {
      // Buscar informações do contrato no banco para obter a network
      const contract = await prisma.smartContract.findUnique({
        where: { address },
        select: { network: true }
      });
      
      const contractNetwork = network || contract?.network || 'testnet';
      
      // Fazer chamada para buscar cycleDurationInDays do contrato
      const axios = require('axios');
      const cycleResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'}/api/contracts/read`, {
        contractAddress: address,
        functionName: 'cycleDurationInDays',
        params: [],
        network: contractNetwork
      });
      
      if (cycleResponse.data.success && cycleResponse.data.data?.result) {
        cycleDurationInDays = parseInt(cycleResponse.data.data.result);
      }
    } catch (cycleError) {
      // Use default 90 days on error
    }

    // Calcular próxima distribuição usando cycleDurationInDays
    const nextDistribution = new Date();
    nextDistribution.setDate(nextDistribution.getDate() + cycleDurationInDays);

    // Verificar se o contrato existe primeiro
    const existingContract = await prisma.smartContract.findUnique({
      where: { address },
      select: { id: true, metadata: true }
    });
    
    if (!existingContract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Converter percentage para formato de exibição (540 -> 5.40%)
    const displayPercentage = (percentage / 100).toFixed(2);
    
    const newMetadata = {
      ...existingContract.metadata,
      lastDistribution: `${displayPercentage}%`,
      nextDistribution: nextDistribution.toISOString(),
      lastDistributionDate: new Date().toISOString(),
      cycleDurationInDays: cycleDurationInDays
    };

    const updatedContract = await prisma.smartContract.update({
      where: { address },
      data: {
        metadata: newMetadata,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        address,
        lastDistribution: `${displayPercentage}%`,
        nextDistribution: nextDistribution.toISOString(),
        cycleDurationInDays: cycleDurationInDays,
        message: 'Dados de distribuição atualizados com sucesso'
      }
    });

  } catch (error) {
    console.error('Error updating distribution data:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar dados de distribuição',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/stake-contracts/:id/upload-logo
 * Upload de logo do produto
 */
router.post('/:id/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // Verificar se o contrato existe
    const prisma = getPrisma();
    const contract = await prisma.smartContract.findUnique({
      where: { id },
      select: { id: true, metadata: true }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Upload para S3
    const uploadResult = await s3Service.uploadProductLogo(id, file);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload do logo'
      });
    }

    // Atualizar metadata do contrato com a URL do logo
    const updatedMetadata = {
      ...contract.metadata,
      logoUrl: uploadResult.url,
      logoKey: uploadResult.key
    };

    await prisma.smartContract.update({
      where: { id },
      data: {
        metadata: updatedMetadata,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      },
      message: 'Logo enviado com sucesso'
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao fazer upload do logo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/stake-contracts/:id/upload-banner
 * Upload de banner do produto
 */
router.post('/:id/upload-banner', upload.single('banner'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    // Verificar se o contrato existe
    const prisma = getPrisma();
    const contract = await prisma.smartContract.findUnique({
      where: { id },
      select: { id: true, metadata: true }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Upload para S3
    const uploadResult = await s3Service.uploadProductBanner(id, file);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload do banner'
      });
    }

    // Atualizar metadata do contrato com a URL do banner
    const updatedMetadata = {
      ...contract.metadata,
      bannerUrl: uploadResult.url,
      bannerKey: uploadResult.key
    };

    await prisma.smartContract.update({
      where: { id },
      data: {
        metadata: updatedMetadata,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key
      },
      message: 'Banner enviado com sucesso'
    });

  } catch (error) {
    console.error('Error uploading banner:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao fazer upload do banner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/stake-contracts/:id/upload-document
 * Upload de documento do produto (lâmina, informações essenciais, etc)
 */
router.post('/:id/upload-document', upload.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, documentName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento é obrigatório'
      });
    }

    // Verificar se o contrato existe
    const prisma = getPrisma();
    const contract = await prisma.smartContract.findUnique({
      where: { id },
      select: { id: true, metadata: true }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Upload para S3
    const uploadResult = await s3Service.uploadProductDocument(id, file, documentType);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload do documento'
      });
    }

    // Atualizar metadata do contrato com o documento
    const currentDocuments = contract.metadata?.documents || [];
    const newDocument = {
      name: documentName || file.originalname,
      url: uploadResult.url,
      key: uploadResult.key,
      type: documentType,
      uploadDate: new Date().toISOString()
    };

    const updatedMetadata = {
      ...contract.metadata,
      documents: [...currentDocuments, newDocument]
    };

    await prisma.smartContract.update({
      where: { id },
      data: {
        metadata: updatedMetadata,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        document: newDocument
      },
      message: 'Documento enviado com sucesso'
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao fazer upload do documento',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/stake-contracts/:id/documents/:documentIndex
 * Deletar documento do produto
 */
router.delete('/:id/documents/:documentIndex', async (req, res) => {
  try {
    const { id, documentIndex } = req.params;
    const index = parseInt(documentIndex);

    // Verificar se o contrato existe
    const prisma = getPrisma();
    const contract = await prisma.smartContract.findUnique({
      where: { id },
      select: { id: true, metadata: true }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    const currentDocuments = contract.metadata?.documents || [];

    if (index < 0 || index >= currentDocuments.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de documento inválido'
      });
    }

    const documentToDelete = currentDocuments[index];

    // Deletar do S3 se houver key
    if (documentToDelete.key) {
      try {
        await s3Service.deleteFile(documentToDelete.key);
      } catch (s3Error) {
        console.warn('Erro ao deletar arquivo do S3, continuando...', s3Error);
      }
    }

    // Remover documento do array
    const updatedDocuments = currentDocuments.filter((_, i) => i !== index);

    const updatedMetadata = {
      ...contract.metadata,
      documents: updatedDocuments
    };

    await prisma.smartContract.update({
      where: { id },
      data: {
        metadata: updatedMetadata,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Documento deletado com sucesso'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao deletar documento',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/stake-contracts/:id/sync-whitelist
 * Sincroniza whitelist da blockchain para o metadata
 */
router.post('/:id/sync-whitelist', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;

    // Buscar contrato
    const contract = await prisma.smartContract.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        network: true,
        metadata: true,
        abi: true
      }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Load ABI
    const defaultStakeABI = loadStakeABI();
    let abi = typeof contract.abi === 'string' ? JSON.parse(contract.abi) : contract.abi;
    if (!abi) {
      abi = defaultStakeABI;
    }

    // Verificar se whitelist está habilitada
    const whitelistEnabled = await checkWhitelistStatus(contract.address, contract.network.toLowerCase(), abi);

    let whitelistAddresses = [];
    if (whitelistEnabled) {
      // Buscar endereços whitelistados da blockchain
      const whitelistResult = await getWhitelistedAddresses(contract.address, contract.network.toLowerCase(), abi);
      whitelistAddresses = whitelistResult.addresses || [];
    }

    // Atualizar metadata com whitelist
    const updatedMetadata = {
      ...contract.metadata,
      whitelistEnabled,
      whitelist: whitelistAddresses.map(addr => addr.toLowerCase()),
      whitelistLastSync: new Date().toISOString()
    };

    await prisma.smartContract.update({
      where: { id },
      data: {
        metadata: updatedMetadata,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        whitelistEnabled,
        whitelistSize: whitelistAddresses.length,
        lastSync: updatedMetadata.whitelistLastSync
      },
      message: 'Whitelist sincronizada com sucesso'
    });

  } catch (error) {
    console.error('Error syncing whitelist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao sincronizar whitelist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/stake-contracts/:address/transactions
 * Busca transações de stake (investimentos) para um contrato específico
 */
router.get('/:address/transactions', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { address } = req.params;
    const { limit = 20 } = req.query;

    console.log('🔍 [GET /stake-contracts/:address/transactions] Buscando transações para:', address);
    console.log('🔍 [GET /stake-contracts/:address/transactions] Filtros:', {
      contractAddress: address.toLowerCase(),
      transactionType: 'stake',
      limit: parseInt(limit)
    });

    // Primeiro, buscar TODAS as transações para debug
    const allTransactions = await prisma.transaction.findMany({
      where: {
        contractAddress: {
          equals: address,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        txHash: true,
        contractAddress: true,
        transactionType: true,
        status: true
      }
    });

    console.log('🔍 [DEBUG] Todas as transações para este endereço (case-insensitive):', allTransactions);

    // Buscar transações onde contractAddress seja o endereço do stake e transactionType seja 'stake'
    const transactions = await prisma.transaction.findMany({
      where: {
        contractAddress: {
          equals: address,
          mode: 'insensitive'
        },
        transactionType: 'stake'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      select: {
        id: true,
        txHash: true,
        fromAddress: true,
        toAddress: true,
        amount: true,
        currency: true,
        transactionType: true,
        status: true,
        createdAt: true,
        metadata: true
      }
    });

    console.log('✅ [GET /stake-contracts/:address/transactions] Encontradas', transactions.length, 'transações');
    console.log('📋 [GET /stake-contracts/:address/transactions] Lista de transações:', JSON.stringify(transactions, null, 2));

    // Transformar dados para o formato esperado pelo frontend
    const transformedTransactions = transactions.map(tx => ({
      id: tx.id,
      transactionHash: tx.txHash,
      userAddress: tx.fromAddress,
      from: tx.fromAddress,
      amount: tx.amount ? tx.amount.toString() : '0',
      type: tx.transactionType,
      eventType: 'Stake',
      status: tx.status,
      timestamp: Math.floor(new Date(tx.createdAt).getTime() / 1000),
      blockTimestamp: Math.floor(new Date(tx.createdAt).getTime() / 1000),
      symbol: tx.currency || tx.metadata?.symbol || 'tokens'
    }));

    res.json({
      success: true,
      data: transformedTransactions
    });

  } catch (error) {
    console.error('❌ [GET /stake-contracts/:address/transactions] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar transações de stake',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
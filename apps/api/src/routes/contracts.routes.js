/**
 * Contract Interaction Routes
 * Routes for interacting with smart contracts (read/write operations)
 */

const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const prismaConfig = require('../config/prisma');
const blockchainService = require('../services/blockchain.service');
const fs = require('fs');
const path = require('path');

// Helper function to get prisma instance
const getPrisma = () => {
  try {
    return prismaConfig.getPrisma();
  } catch (error) {
    console.error('Prisma not initialized:', error.message);
    throw new Error('Database connection not available');
  }
};

// Load ABIs
const loadTokenABI = () => {
  try {
    const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_token_abi.json');
    const abiContent = fs.readFileSync(abiPath, 'utf8');
    return JSON.parse(abiContent);
  } catch (error) {
    console.error('Error loading token ABI:', error);
    return null;
  }
};

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

const loadExchangeABI = () => {
  try {
    const abiPath = path.join(__dirname, '..', 'contracts', 'abis', 'default_exchange_abi.json');
    const abiContent = fs.readFileSync(abiPath, 'utf8');
    return JSON.parse(abiContent);
  } catch (error) {
    console.error('Error loading exchange ABI:', error);
    return null;
  }
};

// Contract type IDs
const CONTRACT_TYPE_IDS = {
  TOKEN: 'cc350023-d9ba-4746-85f3-1590175a2328', // ID correto do contract type 'token'
  STAKE: '165a6e47-a216-4ac4-b96d-1c6d85ebb492', // ID correto do contract type 'stake'
  EXCHANGE: 'b96cbbfd-38b9-4224-8eb6-467fb612190b' // ID correto do contract type 'exchange'
};

/**
 * GET /api/contracts/all
 * Get all contracts (tokens and stake) with their ABIs
 */
router.get('/all', async (req, res) => {
  try {
    const prisma = getPrisma();
    
    // Fetch all active contracts
    const contracts = await prisma.smartContract.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Load ABIs
    const tokenABI = loadTokenABI();
    const stakeABI = loadStakeABI();
    const exchangeABI = loadExchangeABI();

    // Process contracts and add appropriate ABIs
    const processedContracts = contracts.map(contract => {
      let abi = contract.abi;
      let contractType = 'unknown';
      
      // Determine contract type based on contractTypeId or metadata
      if (contract.contractTypeId === CONTRACT_TYPE_IDS.TOKEN) {
        contractType = 'token';
        if (!abi && tokenABI) {
          abi = tokenABI;
        }
      } else if (contract.contractTypeId === CONTRACT_TYPE_IDS.STAKE) {
        contractType = 'stake';
        if (!abi && stakeABI) {
          abi = stakeABI;
        }
      } else {
        // Try to detect type from metadata or name
        const metadata = contract.metadata || {};
        const name = contract.name?.toLowerCase() || '';
        
        if (metadata.contractType === 'stake' || name.includes('stake') || name.includes('pedacinho')) {
          contractType = 'stake';
          if (!abi && stakeABI) {
            abi = stakeABI;
          }
        } else if (metadata.contractType === 'ERC20' || metadata.contractType === 'token' || name.includes('token')) {
          contractType = 'token';
          if (!abi && tokenABI) {
            abi = tokenABI;
          }
        } else if (metadata.contractType === 'exchange' || name.includes('exchange') || metadata.pair) {
          contractType = 'exchange';
          if (!abi && exchangeABI) {
            abi = exchangeABI;
          }
        }
      }

      return {
        id: contract.id,
        name: contract.name,
        address: contract.address,
        network: contract.network,
        contractType,
        symbol: contract.metadata?.symbol || null,
        tokenAddress: contract.metadata?.tokenAddress || null,
        adminAddress: contract.metadata?.adminAddress || null,
        description: contract.metadata?.description || null,
        isActive: contract.isActive,
        abi,
        createdAt: contract.createdAt,
        // Campos específicos para exchanges
        ...(contractType === 'exchange' && {
          pair: contract.metadata?.pair || null,
          tokenA: contract.metadata?.tokenA || null,
          tokenB: contract.metadata?.tokenB || null
        })
      };
    });

    res.json({
      success: true,
      data: processedContracts
    });

  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts',
      error: error.message
    });
  }
});

/**
 * GET /api/contracts/by-code/:code
 * Get a contract by its product code
 */
router.get('/by-code/:code', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { code } = req.params;
    const tokenService = require('../services/token.service');

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
 * POST /api/contracts/read
 * Execute a read function on a smart contract (no gas required)
 */
router.post('/read', async (req, res) => {
  let functionName = 'unknown'; // Declare at function scope for error handling
  let contractAddress = 'unknown'; // Declare at function scope for error handling
  try {
    const { contractAddress: addr, functionName: fn, params = [], network = 'testnet' } = req.body;
    contractAddress = addr;
    functionName = fn;

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        message: 'Contract address is required'
      });
    }

    if (!functionName) {
      return res.status(400).json({
        success: false,
        message: 'Function name is required'
      });
    }

    // Get contract from database
    const prisma = getPrisma();
    const contract = await prisma.smartContract.findFirst({
      where: { 
        address: contractAddress,
        isActive: true
      }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or inactive'
      });
    }

    // Get provider
    const provider = blockchainService.config.getProvider(network);
    
    // Parse ABI if it's a string, or load default ABI based on contract type
    let abi = typeof contract.abi === 'string' ? JSON.parse(contract.abi) : contract.abi;

    // If no ABI found, try to load default based on contract metadata
    if (!abi) {
      const metadata = contract.metadata || {};
      if (metadata.contractType === 'exchange' || contract.name?.toLowerCase().includes('exchange')) {
        abi = loadExchangeABI();
      } else if (metadata.contractType === 'stake' || contract.name?.toLowerCase().includes('stake')) {
        abi = loadStakeABI();
      } else if (metadata.contractType === 'token' || contract.name?.toLowerCase().includes('token')) {
        abi = loadTokenABI();
      }
    }
    
    // Determine the caller address for functions that might require permissions
    const adminAddress = contract.metadata?.adminAddress;
    const fallbackAddress = '0x5528C065931f523CA9F3a6e49a911896fb1D2e6f';
    const callerAddress = adminAddress || fallbackAddress;
    
    console.log(`Using caller address for ${functionName}: ${callerAddress} (admin: ${adminAddress || 'not set'})`);
    
    // Create contract instance (we'll handle wallet connection if needed)
    const contractInstance = new ethers.Contract(contractAddress, abi, provider);

    // Check if function exists
    if (!contractInstance[functionName]) {
      return res.status(400).json({
        success: false,
        message: `Function '${functionName}' not found in contract`
      });
    }

    // Execute read function with timeout
    console.log(`Executing read function: ${functionName} with params:`, params);
    
    // Some functions like getAvailableRewardBalance may need more time to execute
    const timeoutDuration = functionName === 'getAvailableRewardBalance' ? 45000 : 10000; // 45s for balance check, 10s for others
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function call timeout - function may not exist in deployed contract')), timeoutDuration);
    });
    
    // For functions that might require permissions, try with caller address context
    let functionPromise;
    
    // Try to detect functions that might need specific caller context
    const mightNeedPermissions = functionName.includes('Admin') || 
                                 functionName.includes('Balance') || 
                                 functionName.includes('Reward') ||
                                 functionName === 'getAvailableRewardBalance';
    
    if (mightNeedPermissions && callerAddress) {
      // For permission-sensitive functions, we need to use staticCall with specific from address
      try {
        console.log(`Attempting ${functionName} with caller context: ${callerAddress}`);
        
        // Use staticCall with specific from address for read functions that might check permissions
        const callData = contractInstance.interface.encodeFunctionData(functionName, params);
        
        functionPromise = provider.call({
          to: contractAddress,
          data: callData,
          from: callerAddress
        }).then(result => {
          // Decode the result
          return contractInstance.interface.decodeFunctionResult(functionName, result);
        });
      } catch (contextError) {
        console.log(`Failed with caller context, falling back to regular call:`, contextError.message);
        functionPromise = contractInstance[functionName](...params);
      }
    } else {
      // Regular function call for functions that don't need permissions
      functionPromise = contractInstance[functionName](...params);
    }
    
    const result = await Promise.race([functionPromise, timeoutPromise]);
    
    // Format result based on type (ethers v6 compatibility)
    let formattedResult;
    
    // Handle decoded result from staticCall (comes as Result array)
    let actualResult = result;
    if (result && typeof result === 'object' && result.length !== undefined && result.length === 1) {
      // If it's a Result array with single element, extract it
      actualResult = result[0];
    }
    
    if (typeof actualResult === 'bigint') {
      formattedResult = actualResult.toString();
    } else if (typeof actualResult === 'object' && actualResult._isBigNumber) {
      formattedResult = actualResult.toString();
    } else if (Array.isArray(actualResult)) {
      formattedResult = actualResult.map(item => {
        if (typeof item === 'bigint') return item.toString();
        if (typeof item === 'object' && item._isBigNumber) return item.toString();
        return item;
      });
    } else {
      formattedResult = actualResult;
    }

    res.json({
      success: true,
      data: {
        contractAddress,
        functionName,
        params,
        result: formattedResult,
        network,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`Error executing read function ${functionName}:`, error);
    
    // Parse specific contract call errors
    let errorMessage = 'Error executing contract function';
    let statusCode = 500;
    
    if (error.message && error.message.includes('Function call timeout')) {
      if (functionName === 'getAvailableRewardBalance') {
        errorMessage = `Function 'getAvailableRewardBalance' timed out - the reward balance query is taking too long. This may indicate network issues or the contract needs more time to process the request.`;
      } else {
        errorMessage = `Function '${functionName}' timed out - this function may not exist in the deployed contract`;
      }
      statusCode = 400;
    } else if (error.code === 'CALL_EXCEPTION') {
      if (error.reason && error.reason.includes('AccessControlUnauthorizedAccount')) {
        if (functionName === 'getAvailableRewardBalance') {
          errorMessage = `Function 'getAvailableRewardBalance' requires DEFAULT_ADMIN_ROLE to execute. This function can only be called by connecting an admin wallet to the contract, not through read-only interface. Implementation needed: configure ADMIN_PRIVATE_KEY in environment variables.`;
        } else {
          errorMessage = `Function '${functionName}' requires admin permissions. This function needs to be called with an admin wallet, not through read-only interface.`;
        }
        statusCode = 403; // Forbidden - access denied
      } else if (error.reason === null && error.data === null) {
        errorMessage = `Function '${functionName}' may not exist in the deployed contract, or the contract is not deployed at this address`;
        statusCode = 400;
      } else if (error.reason) {
        errorMessage = `Contract call failed: ${error.reason}`;
        statusCode = 400;
      } else {
        errorMessage = 'Contract call failed - the function may not exist or has execution errors';
        statusCode = 400;
      }
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.toString(),
      details: {
        contractAddress,
        functionName,
        errorCode: error.code || 'UNKNOWN'
      }
    });
  }
});

/**
 * POST /api/contracts/write
 * Execute a write function on a smart contract (requires gas)
 */
router.post('/write', async (req, res) => {
  // console.log('🚀🚀🚀 [CONTRACTS WRITE] REQUISIÇÃO RECEBIDA 🚀🚀🚀');
  // console.log('🚀 [DEBUG] Body da requisição:', JSON.stringify(req.body, null, 2));
  // console.log('🚀 [DEBUG] Headers da requisição:', JSON.stringify(req.headers, null, 2));
  
  try {
    const { 
      contractAddress, 
      functionName, 
      params = [], 
      gasPayer,
      network = 'testnet',
      gasLimit = 300000
    } = req.body;
    
    // console.log('🔍 [DEBUG] Parâmetros extraídos:');
    // console.log('  - contractAddress:', contractAddress);
    // console.log('  - functionName:', functionName);
    // console.log('  - params:', params);
    // console.log('  - gasPayer:', gasPayer);
    // console.log('  - network:', network);
    // console.log('  - gasLimit:', gasLimit);

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        message: 'Contract address is required'
      });
    }

    if (!functionName) {
      return res.status(400).json({
        success: false,
        message: 'Function name is required'
      });
    }

    if (!gasPayer) {
      return res.status(400).json({
        success: false,
        message: 'Gas payer address is required'
      });
    }

    // Get contract from database
    const prisma = getPrisma();
    const contract = await prisma.smartContract.findFirst({
      where: { 
        address: contractAddress,
        isActive: true
      }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or inactive'
      });
    }

    // Determine the gas payer: use admin address first, then fallback, then provided gasPayer
    const adminAddress = contract.metadata?.adminAddress;
    const fallbackAddress = '0x5528C065931f523CA9F3a6e49a911896fb1D2e6f';
    const actualGasPayer = gasPayer || adminAddress || fallbackAddress;
    
    // console.log('💼 [DEBUG] Gas payer determination:');
    // console.log('  - contract.metadata?.adminAddress:', adminAddress);
    // console.log('  - provided gasPayer:', gasPayer);
    // console.log('  - fallbackAddress:', fallbackAddress);
    // console.log('  - actualGasPayer (final):', actualGasPayer);
    
    // console.log(`🔑 [DEBUG] Tentando buscar usuário com publicKey: ${actualGasPayer}`);

    // Get user/admin by public key to get private key
    const user = await prisma.user.findFirst({
      where: {
        publicKey: actualGasPayer
      }
    });

    // console.log('👤 [DEBUG] Resultado da busca do usuário:', user ? {
    //   id: user.id,
    //   email: user.email,
    //   publicKey: user.publicKey,
    //   hasPrivateKey: !!user.privateKey
    // } : 'USUÁRIO NÃO ENCONTRADO');

    if (!user) {
      console.log('❌ [ERROR] Gas payer não encontrado no banco:', actualGasPayer);
      return res.status(404).json({
        success: false,
        message: `Gas payer not found: ${actualGasPayer}. Make sure this address is registered in the system.`
      });
    }

    if (!user.privateKey) {
      // console.log('❌ [ERROR] Private key não disponível para:', actualGasPayer);
      // console.log('🔍 [DEBUG] Verificando variáveis de ambiente:');
      // console.log('  - ADMIN_WALLET_PUBLIC_KEY:', process.env.ADMIN_WALLET_PUBLIC_KEY);
      // console.log('  - ADMIN_WALLET_PRIVATE_KEY exists:', !!process.env.ADMIN_WALLET_PRIVATE_KEY);
      
      return res.status(400).json({
        success: false,
        message: `Private key not available for gas payer: ${actualGasPayer}`
      });
    }

    // Get provider
    const provider = blockchainService.config.getProvider(network);
    
    // Create signer
    const signer = new ethers.Wallet(user.privateKey, provider);
    
    // Parse ABI if it's a string, or load default ABI based on contract type
    let abi = typeof contract.abi === 'string' ? JSON.parse(contract.abi) : contract.abi;

    // If no ABI found, try to load default based on contract metadata
    if (!abi) {
      const metadata = contract.metadata || {};
      if (metadata.contractType === 'exchange' || contract.name?.toLowerCase().includes('exchange')) {
        abi = loadExchangeABI();
      } else if (metadata.contractType === 'stake' || contract.name?.toLowerCase().includes('stake')) {
        abi = loadStakeABI();
      } else if (metadata.contractType === 'token' || contract.name?.toLowerCase().includes('token')) {
        abi = loadTokenABI();
      }
    }
    
    // Create contract instance with signer
    const contractInstance = new ethers.Contract(contractAddress, abi, signer);

    // Check if function exists
    if (!contractInstance[functionName]) {
      return res.status(400).json({
        success: false,
        message: `Function '${functionName}' not found in contract`
      });
    }

    // Execute write function with timeout
    console.log(`Executing write function: ${functionName} with params:`, params);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function call timeout - function may not exist in deployed contract')), 15000); // 15 second timeout for write operations
    });
    
    const functionPromise = contractInstance[functionName](...params, { gasLimit });
    const tx = await Promise.race([functionPromise, timeoutPromise]);
    
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log(`Transaction confirmed: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);

    // Get authenticated user (who clicked the button) and their company
    const authenticatedUserId = req.user?.id;
    let loggedUserId = user.id; // Gas payer for transaction log
    let actionUserId = authenticatedUserId || user.id; // Authenticated user for action log

    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: authenticatedUserId || user.id,
        status: 'active'
      },
      orderBy: {
        lastAccessAt: 'desc'
      }
    });

    // Transaction logging removed - not needed for contract interactions
    // Only contract actions are logged below

    // Log contract action if it's a stake contract admin action (with authenticated user)
    if (receipt.status === 1 && userCompany) {
      try {
        // Prepare metadata based on function
        const actionMetadata = {
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          params: params,
          network: network,
          gasPayer: signer.address // Who paid the gas
        };

        // Add specific metadata for distributeReward
        if (functionName === 'distributeReward' && params.length > 0) {
          actionMetadata.distributionPercentage = params[0];
        }

        await prisma.contractAction.create({
          data: {
            contractId: contract.id,
            companyId: userCompany.companyId,
            userId: actionUserId, // User who triggered the action (authenticated user)
            actionType: functionName,
            metadata: actionMetadata
          }
        });

        console.log(`✅ Contract action logged: ${functionName} by user ${actionUserId}`);
      } catch (actionLogError) {
        console.error('Error logging contract action:', actionLogError);
        // Continue even if action logging fails
      }
    }

    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        contractAddress,
        functionName,
        params,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'SUCCESS' : 'FAILED',
        network,
        from: signer.address,
        timestamp: new Date().toISOString()
      }
    });

    // Auto-refresh metadata for whitelist-related functions
    const whitelistFunctions = ['setWhitelistEnabled', 'addToWhitelist', 'removeFromWhitelist', 'addMultipleToWhitelist'];
    if (whitelistFunctions.includes(functionName)) {
      console.log(`🔄 [ContractWrite] Auto-refreshing metadata after ${functionName}`);
      try {
        await refreshContractMetadataInternal(contractAddress, network, functionName);
        console.log(`✅ [ContractWrite] Metadata auto-refreshed for ${contractAddress}`);
      } catch (refreshError) {
        console.error(`⚠️ [ContractWrite] Failed to auto-refresh metadata:`, refreshError.message);
        // Don't throw - refresh failure shouldn't block the response
      }
    }

  } catch (error) {
    console.error('Error executing write function:', error);
    
    // Parse specific contract call errors
    let errorMessage = 'Error executing contract function';
    let statusCode = 500;
    
    if (error.message && error.message.includes('Function call timeout')) {
      errorMessage = `Function '${functionName}' timed out - this function may not exist in the deployed contract`;
      statusCode = 400;
    } else if (error.code === 'CALL_EXCEPTION') {
      if (error.reason === null && error.data === null) {
        errorMessage = `Function '${functionName}' may not exist in the deployed contract, or the contract is not deployed at this address`;
        statusCode = 400;
      } else if (error.reason) {
        errorMessage = `Contract call failed: ${error.reason}`;
        statusCode = 400;
      } else {
        errorMessage = 'Contract call failed - the function may not exist or has execution errors';
        statusCode = 400;
      }
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds for gas';
      statusCode = 400;
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      errorMessage = 'Transaction would fail - check function parameters';
      statusCode = 400;
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.toString(),
      details: {
        contractAddress,
        functionName,
        errorCode: error.code || 'UNKNOWN'
      }
    });
  }
});

/**
 * POST /api/contracts/update-abis
 * Force update ABIs for all contracts based on their type
 */
router.post('/update-abis', async (req, res) => {
  try {
    const prisma = getPrisma();
    
    // Load ABIs
    const tokenABI = loadTokenABI();
    const stakeABI = loadStakeABI();
    
    if (!tokenABI || !stakeABI) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar ABIs padrão'
      });
    }
    
    // Get all contracts
    const contracts = await prisma.smartContract.findMany({
      where: { isActive: true }
    });
    
    let updated = 0;
    
    for (const contract of contracts) {
      let shouldUpdate = false;
      let newABI = null;
      let newContractTypeId = null;
      
      // Determine contract type and update if needed
      if (contract.contractTypeId === CONTRACT_TYPE_IDS.TOKEN) {
        newABI = tokenABI;
        shouldUpdate = true;
      } else if (contract.contractTypeId === CONTRACT_TYPE_IDS.STAKE) {
        newABI = stakeABI;
        shouldUpdate = true;
      } else {
        // Try to detect type from metadata or name
        const metadata = contract.metadata || {};
        const name = contract.name?.toLowerCase() || '';
        
        if (metadata.contractType === 'stake' || name.includes('stake') || name.includes('pedacinho')) {
          newABI = stakeABI;
          newContractTypeId = CONTRACT_TYPE_IDS.STAKE;
          shouldUpdate = true;
        } else if (metadata.contractType === 'ERC20' || metadata.contractType === 'token' || name.includes('token')) {
          newABI = tokenABI;
          newContractTypeId = CONTRACT_TYPE_IDS.TOKEN;
          shouldUpdate = true;
        }
      }
      
      if (shouldUpdate && newABI) {
        const updateData = {
          abi: newABI,
          updatedAt: new Date()
        };
        
        if (newContractTypeId) {
          updateData.contractTypeId = newContractTypeId;
        }
        
        await prisma.smartContract.update({
          where: { id: contract.id },
          data: updateData
        });
        
        updated++;
        console.log(`Updated contract ${contract.name} (${contract.address}) with new ABI`);
      }
    }
    
    res.json({
      success: true,
      message: `ABIs atualizados com sucesso para ${updated} contratos`,
      data: {
        totalContracts: contracts.length,
        updatedContracts: updated
      }
    });
    
  } catch (error) {
    console.error('Error updating ABIs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar ABIs',
      error: error.message
    });
  }
});

/**
 * POST /api/contracts/estimate-gas
 * Estimate gas for a write function
 */
router.post('/estimate-gas', async (req, res) => {
  try {
    const { 
      contractAddress, 
      functionName, 
      params = [], 
      gasPayer,
      network = 'testnet'
    } = req.body;

    if (!contractAddress || !functionName || !gasPayer) {
      return res.status(400).json({
        success: false,
        message: 'Contract address, function name, and gas payer are required'
      });
    }

    // Get contract from database
    const prisma = getPrisma();
    const contract = await prisma.smartContract.findFirst({
      where: { 
        address: contractAddress,
        isActive: true
      }
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or inactive'
      });
    }

    // Get provider
    const provider = blockchainService.config.getProvider(network);
    
    // Parse ABI if it's a string, or load default ABI based on contract type
    let abi = typeof contract.abi === 'string' ? JSON.parse(contract.abi) : contract.abi;

    // If no ABI found, try to load default based on contract metadata
    if (!abi) {
      const metadata = contract.metadata || {};
      if (metadata.contractType === 'exchange' || contract.name?.toLowerCase().includes('exchange')) {
        abi = loadExchangeABI();
      } else if (metadata.contractType === 'stake' || contract.name?.toLowerCase().includes('stake')) {
        abi = loadStakeABI();
      } else if (metadata.contractType === 'token' || contract.name?.toLowerCase().includes('token')) {
        abi = loadTokenABI();
      }
    }
    
    // Create contract instance
    const contractInstance = new ethers.Contract(contractAddress, abi, provider);

    // Estimate gas
    const estimatedGas = await contractInstance[functionName].estimateGas(...params, { from: gasPayer });
    
    // Get current gas price
    const gasPrice = await provider.getGasPrice();
    
    // Calculate estimated cost (ethers v6 uses BigInt)
    const estimatedCost = estimatedGas * gasPrice;

    res.json({
      success: true,
      data: {
        estimatedGas: estimatedGas.toString(),
        gasPrice: gasPrice.toString(),
        estimatedCost: ethers.formatEther(estimatedCost),
        network
      }
    });

  } catch (error) {
    console.error('Error estimating gas:', error);
    res.status(500).json({
      success: false,
      message: 'Error estimating gas',
      error: error.message
    });
  }
});

/**
 * GET /api/contracts/tokens
 * Get all token contracts for a specific network
 */
router.get('/tokens', async (req, res) => {
  try {
    const { network } = req.query;
    const defaultNetwork = network || process.env.DEFAULT_NETWORK || 'testnet';

    const prisma = getPrisma();
    const tokens = await prisma.smartContract.findMany({
      where: {
        contractTypeId: CONTRACT_TYPE_IDS.TOKEN,
        network: defaultNetwork,
        isActive: true
      },
      include: {
        contractType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Load token ABI if needed
    const tokenABI = loadTokenABI();

    // Process tokens
    const processedTokens = tokens.map(token => ({
      id: token.id,
      name: token.name,
      address: token.address,
      network: token.network,
      contractType: 'token',
      symbol: token.metadata?.symbol || token.symbol || null,
      metadata: token.metadata,
      adminAddress: token.metadata?.adminAddress || null,
      description: token.metadata?.description || null,
      isActive: token.isActive,
      abi: token.abi || tokenABI,
      createdAt: token.createdAt
    }));

    res.json({
      success: true,
      data: processedTokens
    });
  } catch (error) {
    console.error('Error fetching token contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching token contracts',
      error: error.message
    });
  }
});

/**
 * GET /api/contracts/stakes
 * Get all stake contracts for a specific network
 */
router.get('/stakes', async (req, res) => {
  try {
    const { network } = req.query;
    const defaultNetwork = network || process.env.DEFAULT_NETWORK || 'testnet';

    const prisma = getPrisma();
    const stakes = await prisma.smartContract.findMany({
      where: {
        contractTypeId: CONTRACT_TYPE_IDS.STAKE,
        network: defaultNetwork,
        isActive: true
      },
      include: {
        contractType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Load stake ABI if needed
    const stakeABI = loadStakeABI();

    // Process stakes
    const processedStakes = stakes.map(stake => ({
      id: stake.id,
      name: stake.name,
      address: stake.address,
      network: stake.network,
      contractType: 'stake',
      tokenAddress: stake.metadata?.tokenAddress || null,
      metadata: stake.metadata,
      adminAddress: stake.metadata?.adminAddress || null,
      description: stake.metadata?.description || null,
      isActive: stake.isActive,
      abi: stake.abi || stakeABI,
      createdAt: stake.createdAt
    }));

    res.json({
      success: true,
      data: processedStakes
    });
  } catch (error) {
    console.error('Error fetching stake contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stake contracts',
      error: error.message
    });
  }
});

/**
 * GET /api/contracts/exchanges
 * Get all exchange contracts for a specific network
 */
router.get('/exchanges', async (req, res) => {
  try {
    const { network } = req.query;
    const defaultNetwork = network || process.env.DEFAULT_NETWORK || 'testnet';

    console.log('Fetching exchanges with params:', {
      contractTypeId: CONTRACT_TYPE_IDS.EXCHANGE,
      network: defaultNetwork
    });

    const prisma = getPrisma();

    // Debug: let's see what exchanges exist regardless of network first
    const allExchanges = await prisma.smartContract.findMany({
      where: {
        contractTypeId: CONTRACT_TYPE_IDS.EXCHANGE
      }
    });

    console.log(`DEBUG: All exchanges in DB (any network):`, allExchanges.map(e => ({
      name: e.name,
      network: e.network,
      isActive: e.isActive
    })));

    const exchanges = await prisma.smartContract.findMany({
      where: {
        contractTypeId: CONTRACT_TYPE_IDS.EXCHANGE,
        network: defaultNetwork,
        isActive: true
      },
      include: {
        contractType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${exchanges.length} exchanges for network '${defaultNetwork}'`);

    // Load exchange ABI if needed
    const exchangeABI = loadExchangeABI();

    // Process exchanges
    const processedExchanges = exchanges.map(exchange => ({
      id: exchange.id,
      name: exchange.name,
      address: exchange.address,
      network: exchange.network,
      contractType: 'exchange',
      pair: exchange.metadata?.pair || null,
      symbol: exchange.metadata?.symbol || exchange.metadata?.pair || null,
      tokenA: exchange.metadata?.tokenA || null,
      tokenB: exchange.metadata?.tokenB || null,
      metadata: exchange.metadata,
      adminAddress: exchange.metadata?.adminAddress || null,
      description: exchange.metadata?.description || null,
      isActive: exchange.isActive,
      abi: exchange.abi || exchangeABI,
      createdAt: exchange.createdAt
    }));

    res.json({
      success: true,
      data: processedExchanges
    });
  } catch (error) {
    console.error('Error fetching exchange contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exchange contracts',
      error: error.message
    });
  }
});

/**
 * POST /api/contracts/get-token-symbols
 * Get token symbols from smart_contracts table by addresses
 */
router.post('/get-token-symbols', async (req, res) => {
  try {
    const { stakeTokenAddress, rewardTokenAddress, network } = req.body;
    const prisma = getPrisma();

    console.log('🔍 Buscando símbolos dos tokens:', {
      stakeTokenAddress,
      rewardTokenAddress,
      network
    });

    let stakeTokenSymbol = '';
    let rewardTokenSymbol = '';

    // Buscar símbolo do stakeToken
    if (stakeTokenAddress && ethers.isAddress(stakeTokenAddress)) {
      const normalizedStakeAddress = ethers.getAddress(stakeTokenAddress);

      const stakeTokenContract = await prisma.smartContract.findFirst({
        where: {
          address: normalizedStakeAddress,
          network: network
        },
        select: {
          name: true,
          metadata: true
        }
      });

      stakeTokenSymbol = stakeTokenContract?.metadata?.symbol || stakeTokenContract?.name || '';
      console.log('✅ Stake Token encontrado:', { address: normalizedStakeAddress, symbol: stakeTokenSymbol, metadata: stakeTokenContract?.metadata });
    }

    // Buscar símbolo do rewardToken
    if (rewardTokenAddress && ethers.isAddress(rewardTokenAddress)) {
      const normalizedRewardAddress = ethers.getAddress(rewardTokenAddress);

      const rewardTokenContract = await prisma.smartContract.findFirst({
        where: {
          address: normalizedRewardAddress,
          network: network
        },
        select: {
          name: true,
          metadata: true
        }
      });

      rewardTokenSymbol = rewardTokenContract?.metadata?.symbol || rewardTokenContract?.name || '';
      console.log('✅ Reward Token encontrado:', { address: normalizedRewardAddress, symbol: rewardTokenSymbol, metadata: rewardTokenContract?.metadata });
    }

    console.log('📤 Retornando símbolos:', { stakeTokenSymbol, rewardTokenSymbol });

    res.json({
      success: true,
      data: {
        stakeTokenSymbol,
        rewardTokenSymbol
      }
    });
  } catch (error) {
    console.error('❌ Error fetching token symbols:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching token symbols',
      error: error.message
    });
  }
});

/**
 * GET /api/contracts/actions/:contractId
 * Get all actions for a contract
 */
router.get('/actions/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { limit = 50 } = req.query;
    const prisma = getPrisma();

    console.log('🔍 Buscando ações para contrato:', contractId);

    const actions = await prisma.contractAction.findMany({
      where: {
        contractId: contractId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      select: {
        id: true,
        actionType: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Encontradas ${actions.length} ações`);

    res.json({
      success: true,
      data: {
        actions: actions.map(action => ({
          id: action.id,
          actionType: action.actionType,
          actionName: formatActionName(action.actionType),
          userName: action.user?.name || action.user?.email || 'Usuário desconhecido',
          metadata: action.metadata,
          createdAt: action.createdAt,
          params: action.metadata?.params || []
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching contract actions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contract actions',
      error: error.message
    });
  }
});

// Helper function to format action names
function formatActionName(actionType) {
  const actionNames = {
    'depositRewards': 'Depositar Recompensas',
    'distributeReward': 'Distribuir Recompensas',
    'withdrawRewardTokens': 'Sacar Tokens de Recompensa',
    'updateMinValueStake': 'Atualizar Valor Mínimo',
    'setCycleDuration': 'Definir Duração do Ciclo',
    'setWhitelistEnabled': 'Configurar Whitelist',
    'setAllowRestake': 'Configurar Restake',
    'setStakingBlocked': 'Bloquear/Desbloquear Stake',
    'addToWhitelist': 'Adicionar à Whitelist',
    'removeFromWhitelist': 'Remover da Whitelist'
  };
  return actionNames[actionType] || actionType;
}

/**
 * GET /api/contracts/last-distribution/:contractId
 * Get the last distribution action for a stake contract
 */
router.get('/last-distribution/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const prisma = getPrisma();

    console.log('🔍 Buscando última distribuição para contrato:', contractId);

    // Find the last distributeReward action for this contract
    const lastDistribution = await prisma.contractAction.findFirst({
      where: {
        contractId: contractId,
        actionType: 'distributeReward'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        actionType: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!lastDistribution) {
      return res.json({
        success: true,
        data: {
          hasDistribution: false,
          message: 'Nenhuma distribuição encontrada'
        }
      });
    }

    // Extract distribution percentage from metadata
    const distributionPercentage = lastDistribution.metadata?.distributionPercentage ||
                                   lastDistribution.metadata?.params?.[0] ||
                                   null;

    console.log('✅ Última distribuição encontrada:', {
      id: lastDistribution.id,
      percentage: distributionPercentage,
      date: lastDistribution.createdAt,
      user: lastDistribution.user?.name
    });

    res.json({
      success: true,
      data: {
        hasDistribution: true,
        distributionPercentage: distributionPercentage,
        transactionHash: lastDistribution.metadata?.transactionHash,
        blockNumber: lastDistribution.metadata?.blockNumber,
        distributedAt: lastDistribution.createdAt,
        distributedBy: lastDistribution.user?.name || lastDistribution.user?.email
      }
    });
  } catch (error) {
    console.error('❌ Error fetching last distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching last distribution',
      error: error.message
    });
  }
});

/**
 * Helper function to refresh contract metadata from blockchain
 * Can be called internally without HTTP request
 * @param {string} functionName - Optional: name of the function that triggered the refresh (setWhitelistEnabled, addToWhitelist, etc)
 */
async function refreshContractMetadataInternal(contractAddress, network, functionName = null) {
  const prisma = getPrisma();

  console.log(`🔄 Refreshing metadata for contract: ${contractAddress} on ${network}`);

  // Find contract in database
  const contract = await prisma.smartContract.findFirst({
    where: {
      address: contractAddress,
      network: network
    }
  });

  if (!contract) {
    console.error(`❌ Contract not found in database: ${contractAddress}`);
    throw new Error('Contract not found in database');
  }

  console.log(`📋 Contract found: ${contract.name}, type: ${contract.contractType || contract.contractTypeId}`);

  // Get contract type name if using contractTypeId
  let contractTypeName = contract.contractType;
  if (!contractTypeName && contract.contractTypeId) {
    const contractTypeRecord = await prisma.contractType.findUnique({
      where: { id: contract.contractTypeId },
      select: { name: true }
    });
    contractTypeName = contractTypeRecord?.name?.toLowerCase();
    console.log(`📋 Contract type name from DB: ${contractTypeName}`);
  }

  // Get provider for the network
  const provider = blockchainService.config.getProvider(network);
  if (!provider) {
    console.error(`❌ Invalid network: ${network}`);
    throw new Error(`Invalid network: ${network}`);
  }

  console.log(`🔍 Loading ABI for contract type: ${contractTypeName}`);

  // Load appropriate ABI based on contract type
  let abi;
  if (contractTypeName === 'stake' || contractTypeName === 'staking') {
    abi = loadStakeABI();
  } else if (contractTypeName === 'token') {
    abi = loadTokenABI();
  } else if (contractTypeName === 'exchange') {
    abi = loadExchangeABI();
  } else {
    // Try stake ABI as default for contracts with whitelist
    console.log(`⚠️ Unknown contract type '${contractTypeName}', trying stake ABI as default`);
    abi = loadStakeABI();
  }

  if (!abi) {
    console.error(`❌ Failed to load ABI for contract type: ${contractTypeName}`);
    throw new Error('Failed to load contract ABI');
  }

  console.log(`✅ ABI loaded successfully`);

  // Create contract instance
  const contractInstance = new ethers.Contract(contractAddress, abi, provider);

  // Fetch whitelist data from blockchain
  let whitelistEnabled = false;
  let whitelist = [];

  try {
    // Try to get whitelistEnabled
    const whitelistEnabledResult = await contractInstance.whitelistEnabled();
    whitelistEnabled = Boolean(whitelistEnabledResult);
    console.log(`  ✓ whitelistEnabled: ${whitelistEnabled}`);
  } catch (error) {
    console.log(`  ⚠ whitelistEnabled not available (function may not exist)`);
    // Not all contracts have whitelist, this is OK
  }

  let whitelistFetchSuccess = false;
  try {
    // Try to get whitelist addresses (always fetch, regardless of whitelistEnabled)
    // The whitelist EXISTS on blockchain even when disabled
    console.log(`  🔍 Fetching whitelist from blockchain...`);
    console.log(`  📍 Contract address: ${contractAddress}`);
    console.log(`  📍 Network: ${network}`);
    console.log(`  📍 Provider: ${provider.connection?.url || 'unknown'}`);
    console.log(`  📍 Function name context: ${functionName}`);

    // Add timeout to getWhitelistedAddresses call
    const whitelistPromise = contractInstance.getWhitelistedAddresses();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('getWhitelistedAddresses timeout after 10s')), 10000)
    );

    const whitelistResult = await Promise.race([whitelistPromise, timeoutPromise]);
    console.log(`  📊 Raw whitelist result type:`, typeof whitelistResult);
    console.log(`  📊 Raw whitelist result isArray:`, Array.isArray(whitelistResult));
    console.log(`  📊 Raw whitelist result length:`, whitelistResult?.length);
    console.log(`  📊 Raw whitelist result:`, whitelistResult);

    if (Array.isArray(whitelistResult)) {
      // ethers v6 uses ZeroAddress instead of constants.AddressZero
      whitelist = whitelistResult.filter(addr => addr && addr !== ethers.ZeroAddress);
      whitelistFetchSuccess = true;
      console.log(`  ✅ Whitelist addresses: ${whitelist.length} found`);
      console.log(`  📋 Addresses:`, whitelist.map(a => a.toLowerCase()));
    } else {
      console.error(`  ❌ getWhitelistedAddresses returned non-array:`, whitelistResult);
    }
  } catch (error) {
    console.error(`  ❌ getWhitelistedAddresses failed:`, error.message);
    console.error(`  📍 Error code:`, error.code);
    console.error(`  📍 Error reason:`, error.reason);
    console.error(`  📍 Error stack:`, error.stack);
    // Not all contracts have this function, but if we're doing whitelist operations, this is critical
    if (functionName === 'addToWhitelist' || functionName === 'removeFromWhitelist' || functionName === 'addMultipleToWhitelist') {
      console.error(`  🚨 CRITICAL: Failed to fetch whitelist after ${functionName} operation!`);
      throw new Error(`Failed to fetch whitelist from blockchain after ${functionName}: ${error.message}`);
    }
  }

  // Update metadata in database - only update relevant fields based on function called
  const currentMetadata = contract.metadata || {};
  const updatedMetadata = {
    ...currentMetadata,
    lastMetadataRefresh: new Date().toISOString()
  };

  // Update only the fields that should change based on the function called
  if (functionName === 'setWhitelistEnabled') {
    // Only update whitelistEnabled, keep whitelist intact
    updatedMetadata.whitelistEnabled = whitelistEnabled;
    console.log(`  📝 Updating only whitelistEnabled: ${whitelistEnabled}`);
  } else if (functionName === 'addToWhitelist' || functionName === 'removeFromWhitelist' || functionName === 'addMultipleToWhitelist') {
    // Only update whitelist array IF we successfully fetched it
    if (whitelistFetchSuccess) {
      updatedMetadata.whitelist = whitelist;
      updatedMetadata.whitelistLastSync = new Date().toISOString();
      console.log(`  📝 Updating whitelist: ${whitelist.length} addresses`);
    } else {
      console.error(`  ⚠️  NOT updating whitelist in metadata - fetch failed`);
      // Keep existing whitelist in metadata to avoid data loss
    }
  } else {
    // No specific function provided - update both (for manual refresh)
    updatedMetadata.whitelistEnabled = whitelistEnabled;
    if (whitelistFetchSuccess) {
      updatedMetadata.whitelist = whitelist;
      updatedMetadata.whitelistLastSync = new Date().toISOString();
    } else {
      // Keep existing whitelist if fetch failed
      console.log(`  ⚠️  Keeping existing whitelist in metadata - fetch failed`);
    }
    console.log(`  📝 Updating whitelistEnabled and ${whitelistFetchSuccess ? 'whitelist' : '(keeping existing whitelist)'}`);
  }

  await prisma.smartContract.update({
    where: {
      id: contract.id
    },
    data: {
      metadata: updatedMetadata
    }
  });

  console.log(`✅ Metadata refreshed successfully for ${contractAddress}`);

  return {
    contractAddress,
    network,
    whitelistEnabled,
    whitelistCount: whitelist.length,
    lastRefresh: updatedMetadata.lastMetadataRefresh
  };
}

/**
 * POST /api/contracts/refresh-metadata
 * Refresh contract metadata from blockchain (whitelist info)
 * Should be called after whitelist changes in admin panels
 */
router.post('/refresh-metadata', async (req, res) => {
  try {
    const { contractAddress, network } = req.body;

    if (!contractAddress || !network) {
      return res.status(400).json({
        success: false,
        message: 'Contract address and network are required'
      });
    }

    const result = await refreshContractMetadataInternal(contractAddress, network);

    res.json({
      success: true,
      message: 'Metadata refreshed successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error refreshing metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing contract metadata',
      error: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

/**
 * POST /api/system/contracts/deploy
 * Deploy a new contract (Token, Exchange, or Stake)
 */
router.post('/deploy', async (req, res) => {
    try {
        const { contractType } = req.body;

        if (!contractType || !['token', 'exchange', 'stake'].includes(contractType)) {
            return res.status(400).json({
                error: 'Invalid contract type. Must be: token, exchange, or stake'
            });
        }

        // Setup blockchain connection
        const rpcUrl = process.env.RPC_URL || 'https://rpc-testnet.azore.technology';
        const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;

        if (!privateKey) {
            return res.status(500).json({
                error: 'ADMIN_WALLET_PRIVATE_KEY not configured'
            });
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        let deployResult;

        if (contractType === 'token') {
            deployResult = await deployToken(req.body, wallet);
        } else if (contractType === 'exchange') {
            deployResult = await deployExchange(req.body, wallet);
        } else if (contractType === 'stake') {
            deployResult = await deployStake(req.body, wallet);
        }

        res.json({
            success: true,
            ...deployResult
        });

    } catch (error) {
        console.error('❌ Contract deploy error:', error);
        console.error('   Error stack:', error.stack);
        console.error('   Error details:', {
            message: error.message,
            code: error.code,
            reason: error.reason
        });
        res.status(500).json({
            success: false,
            error: error.message || 'Error deploying contract',
            details: error.reason || error.code || 'Unknown error'
        });
    }
});

/**
 * Deploy Token Contract
 */
async function deployToken(params, wallet) {
    const { name, symbol, initialSupply, contractName } = params;

    if (!name || !symbol || !initialSupply || !contractName) {
        throw new Error('Missing required parameters for token deployment');
    }

    console.log(`🚀 Starting Token deployment...`);
    console.log(`   Contract Name: ${contractName}`);
    console.log(`   Token Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Initial Supply: ${initialSupply}`);

    // Read the token.sol template
    const tokenSolPath = path.join(__dirname, '../contracts/token.sol');
    let tokenSource = fs.readFileSync(tokenSolPath, 'utf8');

    // Replace the contract name
    tokenSource = tokenSource.replace(/contract\s+CoinageTrade/g, `contract ${contractName}`);

    console.log(`📝 Token contract source prepared`);

    // Prepare compilation input for Solidity 0.8.27
    const input = {
        language: 'Solidity',
        sources: {
            'token.sol': {
                content: tokenSource
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            evmVersion: 'paris', // EVM version Paris for Solidity 0.8.27
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
                }
            }
        }
    };

    console.log(`⚙️ Compiling contract with solc 0.8.27 (EVM: paris)...`);

    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:', errors);
            throw new Error(`Compilation error: ${errors[0].formattedMessage}`);
        }
    }

    console.log(`✅ Contract compiled successfully`);

    // Extract ABI and bytecode
    const contract = output.contracts['token.sol'][contractName];
    if (!contract) {
        throw new Error(`Contract ${contractName} not found in compilation output`);
    }

    const abi = contract.abi;
    const bytecode = '0x' + contract.evm.bytecode.object;

    console.log(`📦 ABI extracted: ${abi.length} methods`);
    console.log(`📦 Bytecode size: ${bytecode.length} characters`);

    // Create contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log(`🚀 Deploying contract to blockchain...`);
    console.log(`   Deployer: ${wallet.address}`);

    // Deploy the contract with constructor parameters
    const deployedContract = await factory.deploy(name, symbol);

    console.log(`⏳ Waiting for deployment transaction...`);
    await deployedContract.waitForDeployment();

    const contractAddress = await deployedContract.getAddress();
    const deployTx = deployedContract.deploymentTransaction();
    const receipt = await deployTx.wait();

    console.log(`✅ Token deployed at: ${contractAddress}`);
    console.log(`   Transaction: ${deployTx.hash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);

    // Mint initial supply
    console.log(`💰 Minting initial supply of ${initialSupply} tokens...`);
    const initialSupplyWei = ethers.parseUnits(initialSupply.toString(), 18);
    const mintTx = await deployedContract.mint(wallet.address, initialSupplyWei);
    await mintTx.wait();
    console.log(`✅ Initial supply minted successfully`);

    return {
        success: true,
        contractAddress,
        transactionHash: deployTx.hash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        contractType: 'token',
        parameters: {
            name,
            symbol,
            initialSupply,
            contractName
        }
    };
}

/**
 * Deploy Exchange Contract
 */
async function deployExchange(params, wallet) {
    const { tokenA, tokenB, feeRecipient, feeBasisPoints } = params;

    if (!tokenA || !tokenB || !feeRecipient || feeBasisPoints === undefined) {
        throw new Error('Missing required parameters for exchange deployment');
    }

    console.log(`🚀 Starting Exchange deployment...`);
    console.log(`   Token A: ${tokenA}`);
    console.log(`   Token B: ${tokenB}`);
    console.log(`   Fee Recipient: ${feeRecipient}`);
    console.log(`   Fee Basis Points: ${feeBasisPoints} (${(feeBasisPoints / 100).toFixed(2)}%)`);

    // Read the exchange contract source
    const exchangeSolPath = path.join(__dirname, '../contracts/coinageExchange.sol');
    const exchangeSource = fs.readFileSync(exchangeSolPath, 'utf8');

    console.log(`📝 Exchange contract source loaded`);

    // Function to find and read imported contracts
    function findImports(importPath) {
        try {
            // Handle OpenZeppelin imports
            if (importPath.startsWith('@openzeppelin/')) {
                const contractPath = path.join(__dirname, '../../node_modules', importPath);
                const content = fs.readFileSync(contractPath, 'utf8');
                return { contents: content };
            }

            // Handle relative imports
            const contractPath = path.join(__dirname, '../contracts', importPath);
            const content = fs.readFileSync(contractPath, 'utf8');
            return { contents: content };
        } catch (error) {
            return { error: `File not found: ${importPath}` };
        }
    }

    // Prepare compilation input for Solidity 0.8.27
    const input = {
        language: 'Solidity',
        sources: {
            'CoinageExchange.sol': {
                content: exchangeSource
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            evmVersion: 'paris', // EVM version Paris for Solidity 0.8.27
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
                }
            }
        }
    };

    console.log(`⚙️ Compiling contract with solc 0.8.27 (EVM: paris)...`);

    // Compile the contract with import callback
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    // Check for compilation errors
    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:', errors);
            throw new Error(`Compilation error: ${errors[0].formattedMessage}`);
        }
        // Log warnings
        const warnings = output.errors.filter(e => e.severity === 'warning');
        if (warnings.length > 0) {
            console.warn(`⚠️ Compilation warnings: ${warnings.length}`);
        }
    }

    console.log(`✅ Contract compiled successfully`);

    // Extract ABI and bytecode
    console.log(`📋 Extracting contract from compilation output...`);
    console.log(`   Available contracts:`, Object.keys(output.contracts));

    const contract = output.contracts['CoinageExchange.sol']['HybridExchange'];
    if (!contract) {
        console.error(`❌ Contract not found. Available:`, output.contracts);
        throw new Error('HybridExchange contract not found in compilation output');
    }

    const abi = contract.abi;
    const bytecode = '0x' + contract.evm.bytecode.object;

    console.log(`📦 ABI extracted: ${abi.length} methods`);
    console.log(`📦 Bytecode size: ${bytecode.length} characters`);

    // Create contract factory
    console.log(`🏭 Creating contract factory...`);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log(`🚀 Deploying contract to blockchain...`);
    console.log(`   Deployer: ${wallet.address}`);
    console.log(`   Constructor params:`, { tokenA, tokenB, feeRecipient, feeBasisPoints });

    // Deploy the contract with constructor parameters
    console.log(`📤 Sending deployment transaction...`);
    console.log(`   Bytecode length: ${bytecode.length} chars`);
    console.log(`   Estimated gas needed: ~${Math.ceil(bytecode.length / 2 * 200)}`);

    let deployedContract;
    try {
        deployedContract = await factory.deploy(tokenA, tokenB, feeRecipient, feeBasisPoints);
        console.log(`✅ Deployment transaction sent`);
    } catch (deployError) {
        console.error(`❌ Deploy transaction failed:`, deployError.message);
        console.error(`   Error code:`, deployError.code);
        console.error(`   Request URL:`, deployError.info?.requestUrl);
        console.error(`   Full error info:`, JSON.stringify(deployError.info, null, 2));
        throw deployError;
    }

    console.log(`⏳ Waiting for deployment transaction...`);
    await deployedContract.waitForDeployment();

    const contractAddress = await deployedContract.getAddress();
    const deployTx = deployedContract.deploymentTransaction();
    const receipt = await deployTx.wait();

    console.log(`✅ Exchange deployed at: ${contractAddress}`);
    console.log(`   Transaction: ${deployTx.hash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);

    return {
        success: true,
        contractAddress,
        transactionHash: deployTx.hash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        contractType: 'exchange',
        parameters: {
            tokenA,
            tokenB,
            feeRecipient,
            feeBasisPoints
        }
    };
}

/**
 * Deploy Stake Contract
 */
async function deployStake(params, wallet) {
    const { stakeToken, rewardToken, minStakeAmount, cycleStartTimestamp, whitelist } = params;

    if (!stakeToken || !minStakeAmount) {
        throw new Error('Missing required parameters for stake deployment');
    }

    // Load the stake contract (assuming you have one)
    // For now, we'll return a placeholder
    // You'll need to implement the actual stake contract deployment

    console.log(`Deploying Stake Contract...`);
    console.log(`  Stake Token: ${stakeToken}`);
    console.log(`  Reward Token: ${rewardToken}`);
    console.log(`  Min Stake Amount: ${minStakeAmount}`);
    console.log(`  Cycle Start: ${cycleStartTimestamp}`);
    console.log(`  Whitelist: ${whitelist.length} addresses`);

    // TODO: Implement stake contract deployment
    // This is a placeholder
    throw new Error('Stake contract deployment not yet implemented');
}

module.exports = router;
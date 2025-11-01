require('dotenv').config({ path: '/home/juan/Desktop/Projects/Navi/coinage/.env' });
const { PrismaClient } = require('./src/generated/prisma');
const { ethers } = require('ethers');
const fs = require('fs');

// Initialize Prisma
const prisma = new PrismaClient();

// Determine RPC URL based on environment
const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
const RPC_URL = defaultNetwork === 'mainnet'
    ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
    : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';

console.log(`🌐 Network: ${defaultNetwork}`);
console.log(`🔗 RPC URL: ${RPC_URL}\n`);

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Load Contract ABI from the correct file
const exchangeABI = JSON.parse(fs.readFileSync('./src/contracts/abis/default_exchange_abi.json', 'utf8'));

function determineStatus(isActive, remainingAmount) {
    if (isActive) {
        return 'ACTIVE';
    } else {
        // isActive = false
        if (remainingAmount < 0.000001) { // remainingAmount = 0
            return 'EXECUTED';
        } else {
            return 'CANCELLED';
        }
    }
}

async function recreateOrdersFromBlockchain(contractAddress) {
    try {
        console.log(`🔗 Recriando ordens históricas do contrato ${contractAddress}...`);

        const contract = new ethers.Contract(contractAddress, exchangeABI, provider);

        // Get token addresses and symbols
        const tokenAAddress = await contract.tokenA();
        const tokenBAddress = await contract.tokenB();

        console.log(`🪙 Token A: ${tokenAAddress}`);
        console.log(`🪙 Token B: ${tokenBAddress}`);

        // Create token contracts to get symbols
        const erc20ABI = [
            "function symbol() external view returns (string)"
        ];

        const tokenAContract = new ethers.Contract(tokenAAddress, erc20ABI, provider);
        const tokenBContract = new ethers.Contract(tokenBAddress, erc20ABI, provider);

        const tokenASymbol = await tokenAContract.symbol();
        const tokenBSymbol = await tokenBContract.symbol();

        console.log(`🪙 Token A Symbol: ${tokenASymbol}`);
        console.log(`🪙 Token B Symbol: ${tokenBSymbol}`);

        // Get the next order IDs to know the range
        const nextBuyOrderId = await contract.nextBuyOrderId();
        const nextSellOrderId = await contract.nextSellOrderId();

        console.log(`📊 Next Buy Order ID: ${nextBuyOrderId}`);
        console.log(`📊 Next Sell Order ID: ${nextSellOrderId}`);
        console.log(`📊 Ordens a recriar: ${Number(nextBuyOrderId) - 1} buy orders + ${Number(nextSellOrderId) - 1} sell orders\n`);

        let totalCreated = 0;
        let totalUpdated = 0;
        let totalSkipped = 0;

        // Recreate Buy Orders (1 to nextBuyOrderId-1)
        console.log('🔵 Recriando Buy Orders...');
        for (let orderId = 1; orderId < nextBuyOrderId; orderId++) {
            try {
                console.log(`🔍 Processando Buy Order ${orderId}...`);

                // Use buyOrders array instead of getBuyOrder function
                const orderData = await contract.buyOrders(orderId);

                // Extract data from the returned struct
                const [id, buyer, amountTokenB, pricePerTokenB, remainingAmount, isActive, createdAt] = orderData;

                // Convert from Wei to Ether
                const ethAmount = parseFloat(ethers.formatEther(amountTokenB));
                const ethPrice = parseFloat(ethers.formatEther(pricePerTokenB));
                const ethRemainingAmount = parseFloat(ethers.formatEther(remainingAmount));
                const ethFilledAmount = ethAmount - ethRemainingAmount;

                const status = determineStatus(isActive, ethRemainingAmount);

                // Convert timestamp to Date
                const createdAtDate = new Date(Number(createdAt) * 1000);

                // Check if order already exists
                const existingOrder = await prisma.exchangeOrder.findFirst({
                    where: {
                        orderSide: 'LIMIT',
                        orderType: 'BUY',
                        exchangeContractAddress: {
                            equals: contractAddress,
                            mode: 'insensitive'
                        },
                        blockchainOrderId: Number(id)
                    }
                });

                if (existingOrder) {
                    console.log(`  🔄 Atualizando: buyer=${buyer}, amount=${ethAmount}, price=${ethPrice}, remaining=${ethRemainingAmount}, status=${status}`);

                    // Update existing order
                    await prisma.exchangeOrder.update({
                        where: { id: existingOrder.id },
                        data: {
                            price: ethPrice.toString(),
                            remainingAmount: ethRemainingAmount.toString(),
                            filledAmount: ethFilledAmount.toString(),
                            status: status,
                            updatedAt: new Date()
                        }
                    });

                    console.log(`  ✅ Buy Order ${orderId} atualizada com sucesso`);
                    totalUpdated++;
                } else {
                    console.log(`  💾 Criando: buyer=${buyer}, amount=${ethAmount}, price=${ethPrice}, remaining=${ethRemainingAmount}, status=${status}`);

                    // Create the order
                    await prisma.exchangeOrder.create({
                        data: {
                            blockchainOrderId: Number(id),
                            exchangeContractAddress: contractAddress,
                            userAddress: buyer.toLowerCase(),
                            orderType: 'BUY',
                            orderSide: 'LIMIT',
                            tokenASymbol: tokenASymbol,
                            tokenBSymbol: tokenBSymbol,
                            price: ethPrice.toString(),
                            amount: ethAmount.toString(),
                            remainingAmount: ethRemainingAmount.toString(),
                            filledAmount: ethFilledAmount.toString(),
                            status: status,
                            transactionHash: null,
                            gasUsed: null,
                            gasPrice: null,
                            blockNumber: null,
                            expiresAt: null,
                            createdAt: createdAtDate,
                            updatedAt: new Date()
                        }
                    });

                    console.log(`  ✅ Buy Order ${orderId} criada com sucesso`);
                    totalCreated++;
                }

                // Wait between calls to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error) {
                console.error(`  ❌ Erro na Buy Order ${orderId}:`, error.message);
                totalSkipped++;
            }
        }

        // Recreate Sell Orders (1 to nextSellOrderId-1)
        console.log('\n🔴 Recriando Sell Orders...');
        for (let orderId = 1; orderId < nextSellOrderId; orderId++) {
            try {
                console.log(`🔍 Processando Sell Order ${orderId}...`);

                // Use sellOrders array instead of getSellOrder function
                const orderData = await contract.sellOrders(orderId);

                // Extract data from the returned struct
                const [id, seller, amountTokenB, pricePerTokenB, remainingAmount, isActive, createdAt] = orderData;

                // Convert from Wei to Ether
                const ethAmount = parseFloat(ethers.formatEther(amountTokenB));
                const ethPrice = parseFloat(ethers.formatEther(pricePerTokenB));
                const ethRemainingAmount = parseFloat(ethers.formatEther(remainingAmount));
                const ethFilledAmount = ethAmount - ethRemainingAmount;

                const status = determineStatus(isActive, ethRemainingAmount);

                // Convert timestamp to Date
                const createdAtDate = new Date(Number(createdAt) * 1000);

                // Check if order already exists
                const existingOrder = await prisma.exchangeOrder.findFirst({
                    where: {
                        orderSide: 'LIMIT',
                        orderType: 'SELL',
                        exchangeContractAddress: {
                            equals: contractAddress,
                            mode: 'insensitive'
                        },
                        blockchainOrderId: Number(id)
                    }
                });

                if (existingOrder) {
                    console.log(`  🔄 Atualizando: seller=${seller}, amount=${ethAmount}, price=${ethPrice}, remaining=${ethRemainingAmount}, status=${status}`);

                    // Update existing order
                    await prisma.exchangeOrder.update({
                        where: { id: existingOrder.id },
                        data: {
                            price: ethPrice.toString(),
                            remainingAmount: ethRemainingAmount.toString(),
                            filledAmount: ethFilledAmount.toString(),
                            status: status,
                            updatedAt: new Date()
                        }
                    });

                    console.log(`  ✅ Sell Order ${orderId} atualizada com sucesso`);
                    totalUpdated++;
                } else {
                    console.log(`  💾 Criando: seller=${seller}, amount=${ethAmount}, price=${ethPrice}, remaining=${ethRemainingAmount}, status=${status}`);

                    // Create the order
                    await prisma.exchangeOrder.create({
                        data: {
                            blockchainOrderId: Number(id),
                            exchangeContractAddress: contractAddress,
                            userAddress: seller.toLowerCase(),
                            orderType: 'SELL',
                            orderSide: 'LIMIT',
                            tokenASymbol: tokenASymbol,
                            tokenBSymbol: tokenBSymbol,
                            price: ethPrice.toString(),
                            amount: ethAmount.toString(),
                            remainingAmount: ethRemainingAmount.toString(),
                            filledAmount: ethFilledAmount.toString(),
                            status: status,
                            transactionHash: null,
                            gasUsed: null,
                            gasPrice: null,
                            blockNumber: null,
                            expiresAt: null,
                            createdAt: createdAtDate,
                            updatedAt: new Date()
                        }
                    });

                    console.log(`  ✅ Sell Order ${orderId} criada com sucesso`);
                    totalCreated++;
                }

                // Wait between calls to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error) {
                console.error(`  ❌ Erro na Sell Order ${orderId}:`, error.message);
                totalSkipped++;
            }
        }

        console.log('\n📋 RESUMO DA RECRIAÇÃO:');
        console.log(`  ✅ Total criadas: ${totalCreated}`);
        console.log(`  🔄 Total atualizadas: ${totalUpdated}`);
        console.log(`  ⏭️ Total puladas (erro): ${totalSkipped}`);
        console.log(`\n✅ Recriação do contrato ${contractAddress} concluída!`);

    } catch (error) {
        console.error('❌ Erro na recriação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get command line arguments
const contractAddress = process.argv[2];

if (!contractAddress) {
    console.log(`
🔧 Script de Recriação de Ordens Históricas

Uso:
  node recreate-orders-from-blockchain.js <contract-address>

Exemplo:
  node recreate-orders-from-blockchain.js 0xaBE82005386d4E9A0e9fcA3eeA1b1fcd9304E0D9

Este script recria TODAS as ordens históricas (1 até nextOrderId-1) diretamente
da blockchain, preenchendo todos os dados disponíveis e deixando NULL os campos
que não conseguimos recuperar (transactionHash, gasUsed, gasPrice, blockNumber).
`);
} else {
    recreateOrdersFromBlockchain(contractAddress);
}

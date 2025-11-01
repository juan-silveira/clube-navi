const path = require('path');
const fs = require('fs');

// Load environment variables from project root
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { PrismaClient } = require('../generated/prisma');
const { ethers } = require('ethers');

/**
 * Script para sincronizar ordens do banco de dados com a blockchain
 *
 * PROBLEMA: O banco de dados de produção pode ter ordens antigas que já foram
 * executadas ou canceladas na blockchain, mas o DB ainda mostra como ACTIVE.
 *
 * SOLUÇÃO: Buscar todas as ordens ACTIVE no DB e verificar na blockchain
 * se elas realmente existem e estão ativas. Atualizar o DB com o estado real.
 */

const prisma = new PrismaClient();

async function syncOrdersFromBlockchain() {
    console.log('');
    console.log('════════════════════════════════════════════════════');
    console.log('  SYNC: Orders from Blockchain to Database');
    console.log('════════════════════════════════════════════════════');
    console.log('');

    try {
        // Setup blockchain connection
        const defaultNetwork = process.env.DEFAULT_NETWORK || 'testnet';
        const RPC_URL = defaultNetwork === 'mainnet'
            ? process.env.MAINNET_RPC_URL || 'https://rpc-mainnet.azore.technology'
            : process.env.TESTNET_RPC_URL || 'https://rpc-testnet.azore.technology';

        console.log(`🔗 Connecting to RPC: ${RPC_URL}`);
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // Load exchange ABI
        const abiPath = path.join(__dirname, '../contracts/abis/default_exchange_abi.json');
        if (!fs.existsSync(abiPath)) {
            throw new Error('Exchange ABI file not found');
        }
        const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

        // Buscar todos os contratos de exchange
        const exchangeContracts = await prisma.smartContract.findMany({
            where: {
                contractTypeId: 'b96cbbfd-38b9-4224-8eb6-467fb612190b', // Exchange
                isActive: true
            },
            select: {
                address: true,
                name: true,
                metadata: true
            }
        });

        console.log(`📋 Found ${exchangeContracts.length} exchange contracts\n`);

        let totalOrders = 0;
        let updatedOrders = 0;
        let cancelledOrders = 0;
        let filledOrders = 0;
        let errorOrders = 0;

        for (const exchangeContract of exchangeContracts) {
            const contractAddress = exchangeContract.address;
            const contractName = exchangeContract.name;
            const pair = exchangeContract.metadata?.pair || 'Unknown';

            console.log(`\n📊 Processing: ${contractName} (${pair})`);
            console.log(`   Address: ${contractAddress}`);

            const contract = new ethers.Contract(contractAddress, exchangeABI, provider);

            // Buscar todas as ordens ACTIVE deste contrato no DB
            const activeOrders = await prisma.exchangeOrder.findMany({
                where: {
                    exchangeContractAddress: {
                        equals: contractAddress,
                        mode: 'insensitive'
                    },
                    status: 'ACTIVE',
                    blockchainOrderId: { gt: BigInt(0) }
                },
                orderBy: {
                    blockchainOrderId: 'asc'
                }
            });

            console.log(`   Found ${activeOrders.length} ACTIVE orders in database`);
            totalOrders += activeOrders.length;

            if (activeOrders.length === 0) {
                continue;
            }

            // Verificar cada ordem na blockchain
            for (const order of activeOrders) {
                const orderId = order.blockchainOrderId.toString();
                const orderType = order.orderType; // BUY or SELL

                try {
                    // Buscar ordem na blockchain
                    let blockchainOrder;
                    if (orderType === 'BUY') {
                        blockchainOrder = await contract.buyOrders(orderId);
                    } else {
                        blockchainOrder = await contract.sellOrders(orderId);
                    }

                    const isActive = blockchainOrder.isActive;
                    const remaining = ethers.formatEther(blockchainOrder.remainingAmount);
                    const remainingFloat = parseFloat(remaining);

                    // Determinar novo status baseado na blockchain
                    let newStatus = order.status;
                    let needsUpdate = false;

                    if (!isActive) {
                        // Ordem foi cancelada na blockchain
                        newStatus = 'CANCELLED';
                        needsUpdate = true;
                        cancelledOrders++;
                        console.log(`   ❌ Order ${orderId} (${orderType}): CANCELLED on blockchain`);
                    } else if (remainingFloat < 0.000001) {
                        // Ordem foi completamente executada
                        newStatus = 'FILLED';
                        needsUpdate = true;
                        filledOrders++;
                        console.log(`   ✅ Order ${orderId} (${orderType}): FILLED on blockchain`);
                    } else if (Math.abs(remainingFloat - parseFloat(order.remainingAmount)) > 0.000001) {
                        // Remaining amount mudou - foi parcialmente executada
                        needsUpdate = true;
                        console.log(`   🔄 Order ${orderId} (${orderType}): Updated remaining ${order.remainingAmount} → ${remaining}`);
                    }

                    // Atualizar ordem no banco de dados
                    if (needsUpdate) {
                        await prisma.exchangeOrder.update({
                            where: { id: order.id },
                            data: {
                                status: newStatus,
                                remainingAmount: remaining,
                                updatedAt: new Date()
                            }
                        });
                        updatedOrders++;
                    }

                } catch (error) {
                    // Ordem não existe na blockchain ou erro ao buscar
                    if (error.message.includes('call revert exception')) {
                        // Ordem não existe na blockchain - marcar como cancelada
                        await prisma.exchangeOrder.update({
                            where: { id: order.id },
                            data: {
                                status: 'CANCELLED',
                                remainingAmount: '0',
                                updatedAt: new Date()
                            }
                        });
                        cancelledOrders++;
                        updatedOrders++;
                        console.log(`   ⚠️ Order ${orderId} (${orderType}): Not found on blockchain, marked as CANCELLED`);
                    } else {
                        errorOrders++;
                        console.error(`   ❌ Error checking order ${orderId}:`, error.message);
                    }
                }
            }
        }

        console.log('');
        console.log('════════════════════════════════════════════════════');
        console.log('  SYNC COMPLETED');
        console.log('════════════════════════════════════════════════════');
        console.log(`Total orders checked: ${totalOrders}`);
        console.log(`Orders updated: ${updatedOrders}`);
        console.log(`  - Cancelled: ${cancelledOrders}`);
        console.log(`  - Filled: ${filledOrders}`);
        console.log(`  - Partially filled: ${updatedOrders - cancelledOrders - filledOrders}`);
        console.log(`Errors: ${errorOrders}`);
        console.log('════════════════════════════════════════════════════');
        console.log('');

    } catch (error) {
        console.error('❌ Error in sync script:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Execute script
syncOrdersFromBlockchain()
    .then(() => {
        console.log('✅ Sync completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    });

module.exports = { syncOrdersFromBlockchain };

const { ethers } = require('ethers');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const tokenPriceUpdater = require('./tokenPriceUpdater.service');

/**
 * MarketOrderService - Serviço isolado para Market Orders
 *
 * IMPORTANTE: Este serviço NÃO modifica o orderManagement.service.js
 * Market orders têm seu próprio fluxo de execução completamente separado do book (limit orders)
 *
 * REGRAS:
 * - marketBuy consome SELL limit orders
 * - marketSell consome BUY limit orders
 * - Ordenação FiFo: price ASC, blockchain_order_id ASC
 * - Slippage padrão: 2%
 * - Lock de ordens: status PROCESSING antes da blockchain
 * - Sync pós-blockchain: atualizar apenas ordens consumidas
 * - Exchange_trades: apenas para ordens efetivamente consumidas
 * - Market orders NÃO alteram transaction_hash de limit orders
 */
class MarketOrderService {
    constructor() {
        this.prisma = global.prisma || new PrismaClient();
        this.provider = null;
        this.wallet = null;
    }

    /**
     * Inicializa o serviço com conexão blockchain
     */
    async initialize(rpcUrl, privateKey) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        console.log('✅ MarketOrderService initialized');
    }

    /**
     * Normaliza endereço para checksum
     */
    normalizeAddress(address) {
        if (!address) return null;
        return ethers.getAddress(address.toLowerCase());
    }

    /**
     * Get market buy quote
     *
     * @param {string} contractAddress - Exchange contract address
     * @param {number} amountToSpend - Amount of tokenA (cBRL) to spend
     * @param {string} userAddress - User's address (to exclude their own orders)
     * @param {number} slippagePercent - Slippage tolerance (default 2%)
     * @returns {Object} Quote with estimated amount, orderIds, and minAmountOut
     */
    async getMarketBuyQuote(contractAddress, amountToSpend, userAddress = null, slippagePercent = 2) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);
            const normalizedUser = userAddress ? this.normalizeAddress(userAddress) : null;

            // Buscar SELL limit orders (marketBuy consome sell orders)
            // Ordenação FiFo: price ASC, blockchainOrderId ASC
            const whereClause = {
                exchangeContractAddress: normalizedContract,
                orderType: 'SELL',
                orderSide: 'LIMIT',
                status: 'ACTIVE',
                remainingAmount: { gt: '0' }
            };

            // Excluir ordens do próprio usuário
            if (normalizedUser) {
                whereClause.userAddress = { not: normalizedUser };
            }

            const sellOrders = await this.prisma.exchangeOrder.findMany({
                where: whereClause,
                orderBy: [
                    { price: 'asc' },              // Menor preço primeiro
                    { blockchainOrderId: 'asc' }  // FiFo: menor ID primeiro
                ]
            });

            if (sellOrders.length === 0) {
                throw new Error('No sell orders available for market buy');
            }

            // Calcular quanto pode comprar com o budget
            let remainingBudget = amountToSpend;
            let totalTokensEstimated = 0;
            const selectedOrders = [];

            for (const order of sellOrders) {
                if (remainingBudget <= 0) break;

                const orderAmount = parseFloat(order.remainingAmount);
                const orderPrice = parseFloat(order.price);
                const costForFullOrder = orderAmount * orderPrice;

                if (costForFullOrder <= remainingBudget) {
                    // Pode comprar a ordem completa
                    selectedOrders.push(order.blockchainOrderId);
                    totalTokensEstimated += orderAmount;
                    remainingBudget -= costForFullOrder;
                } else {
                    // Pode comprar parcialmente
                    const partialAmount = remainingBudget / orderPrice;
                    selectedOrders.push(order.blockchainOrderId);
                    totalTokensEstimated += partialAmount;
                    remainingBudget = 0;
                }
            }

            // Calcular minAmountOut com slippage
            const minAmountOut = totalTokensEstimated * (1 - slippagePercent / 100);

            // Verificar liquidez suficiente
            const insufficientLiquidity = remainingBudget > 0.01; // Tolerance

            return {
                success: true,
                amount: totalTokensEstimated,
                requestedAmount: amountToSpend,
                orderIds: selectedOrders,
                minAmountOut: minAmountOut,
                averagePrice: amountToSpend / totalTokensEstimated,
                slippagePercent: slippagePercent,
                insufficientLiquidity: insufficientLiquidity,
                availableAmount: totalTokensEstimated
            };

        } catch (error) {
            console.error('❌ Error in getMarketBuyQuote:', error);
            throw error;
        }
    }

    /**
     * Get market sell quote
     *
     * @param {string} contractAddress - Exchange contract address
     * @param {number} amountToSell - Amount of tokenB (PCN) to sell
     * @param {string} userAddress - User's address (to exclude their own orders)
     * @param {number} slippagePercent - Slippage tolerance (default 2%)
     * @returns {Object} Quote with estimated revenue, orderIds, and minAmountOut
     */
    async getMarketSellQuote(contractAddress, amountToSell, userAddress = null, slippagePercent = 2) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);
            const normalizedUser = userAddress ? this.normalizeAddress(userAddress) : null;

            // Buscar BUY limit orders (marketSell consome buy orders)
            // Ordenação FiFo: price DESC (maior preço primeiro para sell), blockchainOrderId ASC
            const whereClause = {
                exchangeContractAddress: normalizedContract,
                orderType: 'BUY',
                orderSide: 'LIMIT',
                status: 'ACTIVE',
                remainingAmount: { gt: '0' }
            };

            // Excluir ordens do próprio usuário
            if (normalizedUser) {
                whereClause.userAddress = { not: normalizedUser };
            }

            const buyOrders = await this.prisma.exchangeOrder.findMany({
                where: whereClause,
                orderBy: [
                    { price: 'desc' },             // Maior preço primeiro (melhor para vendedor)
                    { blockchainOrderId: 'asc' }  // FiFo: menor ID primeiro
                ]
            });

            if (buyOrders.length === 0) {
                throw new Error('No buy orders available for market sell');
            }

            // Calcular quanto receberá vendendo
            let remainingToSell = amountToSell;
            let totalRevenueEstimated = 0;
            const selectedOrders = [];

            for (const order of buyOrders) {
                if (remainingToSell <= 0) break;

                const orderAmount = parseFloat(order.remainingAmount);
                const orderPrice = parseFloat(order.price);

                if (orderAmount <= remainingToSell) {
                    // Pode vender a ordem completa
                    selectedOrders.push(order.blockchainOrderId);
                    totalRevenueEstimated += orderAmount * orderPrice;
                    remainingToSell -= orderAmount;
                } else {
                    // Pode vender parcialmente
                    selectedOrders.push(order.blockchainOrderId);
                    totalRevenueEstimated += remainingToSell * orderPrice;
                    remainingToSell = 0;
                }
            }

            // Calcular minAmountOut (mínimo de cBRL a receber) com slippage
            const minAmountOut = totalRevenueEstimated * (1 - slippagePercent / 100);

            // Verificar liquidez suficiente
            const insufficientLiquidity = remainingToSell > 0.000001; // Tolerance

            return {
                success: true,
                amount: totalRevenueEstimated, // cBRL que receberá
                requestedAmount: amountToSell, // PCN que quer vender
                orderIds: selectedOrders,
                minAmountOut: minAmountOut,
                averagePrice: totalRevenueEstimated / amountToSell,
                slippagePercent: slippagePercent,
                insufficientLiquidity: insufficientLiquidity,
                availableAmount: amountToSell - remainingToSell
            };

        } catch (error) {
            console.error('❌ Error in getMarketSellQuote:', error);
            throw error;
        }
    }

    /**
     * Lock orders by setting status to PROCESSING
     */
    async lockOrders(orderIds, contractAddress, orderType) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);

            const result = await this.prisma.exchangeOrder.updateMany({
                where: {
                    blockchainOrderId: { in: orderIds },
                    exchangeContractAddress: normalizedContract,
                    orderType: orderType,
                    orderSide: 'LIMIT',
                    status: 'ACTIVE'
                },
                data: {
                    status: 'PROCESSING',
                    updatedAt: new Date()
                }
            });

            console.log(`🔒 Locked ${result.count} ${orderType} orders:`, orderIds);
            return result.count;

        } catch (error) {
            console.error('❌ Error locking orders:', error);
            throw error;
        }
    }

    /**
     * Unlock orders by reverting status to ACTIVE
     */
    async unlockOrders(orderIds, contractAddress, orderType) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);

            const result = await this.prisma.exchangeOrder.updateMany({
                where: {
                    blockchainOrderId: { in: orderIds },
                    exchangeContractAddress: normalizedContract,
                    orderType: orderType,
                    orderSide: 'LIMIT',
                    status: 'PROCESSING'
                },
                data: {
                    status: 'ACTIVE',
                    updatedAt: new Date()
                }
            });

            console.log(`🔓 Unlocked ${result.count} ${orderType} orders`);
            return result.count;

        } catch (error) {
            console.error('❌ Error unlocking orders:', error);
            throw error;
        }
    }

    /**
     * Get orders state before execution (to compare after)
     */
    async getOrdersStateBefore(orderIds, contractAddress, orderType) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);

            const orders = await this.prisma.exchangeOrder.findMany({
                where: {
                    blockchainOrderId: { in: orderIds },
                    exchangeContractAddress: normalizedContract,
                    orderType: orderType,
                    orderSide: 'LIMIT'
                }
            });

            return orders.map(o => ({
                id: o.id,
                blockchainOrderId: o.blockchainOrderId,
                userAddress: o.userAddress,
                price: parseFloat(o.price),
                amount: parseFloat(o.amount),
                remainingAmount: parseFloat(o.remainingAmount),
                filledAmount: parseFloat(o.filledAmount)
            }));

        } catch (error) {
            console.error('❌ Error getting orders state:', error);
            throw error;
        }
    }

    /**
     * Sync consumed orders from blockchain after execution
     */
    async syncConsumedOrders(orderIds, contractAddress, orderType, transactionHash) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);

            // Load ABI
            const abiPath = './src/contracts/abis/default_exchange_abi.json';
            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
            const contract = new ethers.Contract(normalizedContract, exchangeABI, this.wallet);

            console.log(`🔄 Syncing ${orderIds.length} ${orderType} orders from blockchain...`);

            for (const orderId of orderIds) {
                try {
                    // Buscar estado real da ordem na blockchain
                    const blockchainOrder = orderType === 'SELL'
                        ? await contract.sellOrders(orderId)
                        : await contract.buyOrders(orderId);

                    const [id, trader, amount, price, remainingAmount, isActive] = blockchainOrder;

                    const remaining = parseFloat(ethers.formatEther(remainingAmount));
                    const total = parseFloat(ethers.formatEther(amount));
                    const filled = total - remaining;

                    // Determinar status
                    let status;
                    if (!isActive && remaining === 0) {
                        status = 'EXECUTED';
                    } else if (!isActive && remaining > 0) {
                        status = 'CANCELLED';
                    } else {
                        status = 'ACTIVE';
                    }

                    // Atualizar no banco (SEM alterar transactionHash)
                    await this.prisma.exchangeOrder.updateMany({
                        where: {
                            blockchainOrderId: orderId,
                            exchangeContractAddress: normalizedContract,
                            orderType: orderType,
                            orderSide: 'LIMIT'
                        },
                        data: {
                            remainingAmount: remaining.toString(),
                            filledAmount: filled.toString(),
                            status: status,
                            updatedAt: new Date()
                            // NÃO atualizar transactionHash - preservar original da limit order
                        }
                    });

                    console.log(`   ✅ Order ${orderId} synced: ${status} (remaining: ${remaining})`);

                } catch (error) {
                    console.warn(`   ⚠️ Could not sync order ${orderId}:`, error.message);
                }
            }

        } catch (error) {
            console.error('❌ Error syncing consumed orders:', error);
            throw error;
        }
    }

    /**
     * Create exchange trades only for consumed orders
     */
    async createTradesForConsumedOrders(ordersBefore, contractAddress, orderType, transactionHash, blockNumber, userAddress, isBuy) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);
            const normalizedUser = this.normalizeAddress(userAddress);

            // Load ABI
            const abiPath = './src/contracts/abis/default_exchange_abi.json';
            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
            const contract = new ethers.Contract(normalizedContract, exchangeABI, this.wallet);

            console.log(`📊 Creating trades for consumed ${orderType} orders...`);

            for (const orderBefore of ordersBefore) {
                try {
                    // Buscar estado atual da ordem na blockchain
                    const blockchainOrder = orderType === 'SELL'
                        ? await contract.sellOrders(orderBefore.blockchainOrderId)
                        : await contract.buyOrders(orderBefore.blockchainOrderId);

                    const [id, trader, amount, price, remainingAmount, isActive] = blockchainOrder;
                    const remainingAfter = parseFloat(ethers.formatEther(remainingAmount));

                    // Calcular quanto foi consumido
                    const consumed = orderBefore.remainingAmount - remainingAfter;

                    // Só criar trade se a ordem foi efetivamente consumida
                    if (consumed > 0.000001) {
                        // Buscar internal ID da ordem
                        const orderRecord = await this.prisma.exchangeOrder.findFirst({
                            where: {
                                blockchainOrderId: orderBefore.blockchainOrderId,
                                exchangeContractAddress: normalizedContract,
                                orderType: orderType,
                                orderSide: 'LIMIT'
                            }
                        });

                        if (orderRecord) {
                            const tradeData = {
                                exchangeContractAddress: normalizedContract,
                                buyOrderId: isBuy ? null : orderRecord.id,
                                sellOrderId: isBuy ? orderRecord.id : null,
                                buyerAddress: isBuy ? normalizedUser : this.normalizeAddress(trader),
                                sellerAddress: isBuy ? this.normalizeAddress(trader) : normalizedUser,
                                tokenASymbol: 'cBRL',
                                tokenBSymbol: 'PCN',
                                price: orderBefore.price.toString(),
                                amount: consumed.toString(),
                                totalValue: (consumed * orderBefore.price).toString(),
                                feeAmount: '0', // Market orders não têm fee separado
                                transactionHash: transactionHash,
                                blockNumber: BigInt(blockNumber),
                                tradeTimestamp: new Date()
                            };

                            await this.prisma.exchangeTrade.create({ data: tradeData });

                            console.log(`   ✅ Trade created for order ${orderBefore.blockchainOrderId}: ${consumed} PCN @ ${orderBefore.price}`);

                            // Update token price after trade
                            await tokenPriceUpdater.onTradeCreated({
                                pair: `${tradeData.tokenBSymbol}/${tradeData.tokenASymbol}`,
                                price: tradeData.price
                            });
                        }
                    } else {
                        console.log(`   ℹ️ Order ${orderBefore.blockchainOrderId} not consumed (${consumed} PCN)`);
                    }

                } catch (error) {
                    console.warn(`   ⚠️ Could not create trade for order ${orderBefore.blockchainOrderId}:`, error.message);
                }
            }

        } catch (error) {
            console.error('❌ Error creating trades:', error);
            throw error;
        }
    }

    /**
     * Create MARKET order record in exchange_orders
     */
    async createMarketOrderRecord(userAddress, contractAddress, isBuy, amountIn, amountOut, transactionHash, blockNumber, consumedOrderIds) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);
            const normalizedUser = this.normalizeAddress(userAddress);

            // Calcular preço médio
            const averagePrice = isBuy ? (amountIn / amountOut) : (amountOut / amountIn);

            // Gerar um ID único para market order (timestamp + random)
            const uniqueMarketOrderId = BigInt(Date.now()) * BigInt(1000000) + BigInt(Math.floor(Math.random() * 1000000));

            await this.prisma.exchangeOrder.create({
                data: {
                    blockchainOrderId: uniqueMarketOrderId, // ID único para market orders
                    exchangeContractAddress: normalizedContract,
                    userAddress: normalizedUser,
                    orderType: isBuy ? 'BUY' : 'SELL',
                    orderSide: 'MARKET',
                    tokenASymbol: 'cBRL',
                    tokenBSymbol: 'PCN',
                    price: averagePrice.toString(),
                    amount: isBuy ? amountOut.toString() : amountIn.toString(),
                    remainingAmount: '0', // Market orders são executadas completamente
                    filledAmount: isBuy ? amountOut.toString() : amountIn.toString(),
                    status: 'EXECUTED',
                    transactionHash: transactionHash,
                    blockNumber: BigInt(blockNumber),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Market order record created: ${isBuy ? 'BUY' : 'SELL'} ${isBuy ? amountOut : amountIn} PCN @ ${averagePrice.toFixed(4)}`);

        } catch (error) {
            console.error('❌ Error creating market order record:', error);
            // Não propagar erro - não é crítico
        }
    }

    /**
     * Create transaction record for market order
     */
    async createMarketTransaction(userAddress, isBuy, amount, symbol, contractAddress, transactionHash, blockNumber, gasUsed) {
        try {
            const normalizedUser = this.normalizeAddress(userAddress);

            // Buscar userId pelo endereço com empresas vinculadas
            console.log(`🔍 Searching for user with publicKey: ${normalizedUser}`);
            const user = await this.prisma.user.findFirst({
                where: {
                    publicKey: normalizedUser
                },
                include: {
                    userCompanies: {
                        include: {
                            company: true
                        }
                    }
                }
            });

            if (!user) {
                console.warn(`⚠️ User not found for address ${normalizedUser}`);
                console.warn(`   Skipping transaction record creation`);
                return;
            }

            console.log(`✅ User found: ${user.id} (${user.name || user.email})`);

            // Determine network from environment or default to testnet
            const network = process.env.DEFAULT_NETWORK || 'testnet';

            // Get current company (lastAccessAt mais recente) - same logic as userCompany.service.js
            let companyId = 'e040ff60-2846-4d87-963e-332f2bbc2803'; // Default Coinage

            const currentUserCompany = await this.prisma.userCompany.findFirst({
                where: {
                    userId: user.id,
                    status: 'active',
                    company: {
                        isActive: true
                    }
                },
                include: {
                    company: true
                },
                orderBy: [
                    { lastAccessAt: 'desc' },
                    { linkedAt: 'desc' }
                ]
            });

            if (currentUserCompany) {
                companyId = currentUserCompany.company.id;
                console.log(`   📍 Using current company: ${currentUserCompany.company.name} (${companyId})`);
            } else {
                console.log(`   ⚠️ No active company found, using default Coinage`);
            }

            const transactionData = {
                companyId: companyId,
                userId: user.id,
                network: network,
                transactionType: 'exchange',
                functionName: isBuy ? 'buy' : 'sell',
                amount: amount.toString(),
                currency: symbol,
                contractAddress: this.normalizeAddress(contractAddress),
                txHash: transactionHash,
                fromAddress: normalizedUser,
                toAddress: this.normalizeAddress(contractAddress),
                status: blockNumber ? 'confirmed' : 'pending'
            };

            if (blockNumber) {
                transactionData.blockNumber = BigInt(blockNumber);
                transactionData.confirmedAt = new Date();
            }

            if (gasUsed) {
                transactionData.gasUsed = BigInt(gasUsed);
            }

            await this.prisma.transaction.create({
                data: transactionData
            });

            console.log(`✅ Transaction record created: ${isBuy ? 'BUY' : 'SELL'} ${amount} ${symbol}`);

        } catch (error) {
            console.error('❌ Error creating transaction record:', error);
            // Não lançar erro - transaction record é suplementar
        }
    }

    /**
     * Execute market buy
     */
    async executeMarketBuy(userAddress, contractAddress, amountToSpend, orderIds, minAmountOut) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);
            const normalizedUser = this.normalizeAddress(userAddress);

            console.log(`🎯 Executing market BUY...`);
            console.log(`   User: ${normalizedUser}`);
            console.log(`   Amount to spend: ${amountToSpend} cBRL`);
            console.log(`   Sell orders to consume: [${orderIds.join(', ')}]`);
            console.log(`   Min amount out: ${minAmountOut} PCN`);

            // 1. Lock sell orders
            await this.lockOrders(orderIds, normalizedContract, 'SELL');

            // 2. Get orders state before execution
            const ordersBefore = await this.getOrdersStateBefore(orderIds, normalizedContract, 'SELL');

            try {
                // 3. Execute on blockchain
                const abiPath = './src/contracts/abis/default_exchange_abi.json';
                const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
                const contract = new ethers.Contract(normalizedContract, exchangeABI, this.wallet);

                const amountWei = ethers.parseEther(amountToSpend.toString());
                const minAmountOutWei = ethers.parseEther(minAmountOut.toString());

                console.log(`🚀 Calling contract.marketBuy...`);
                const tx = await contract.marketBuy(
                    normalizedUser,
                    amountWei,
                    orderIds,
                    minAmountOutWei
                );

                console.log(`📤 Transaction sent: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`✅ Transaction confirmed: ${receipt.hash}`);

                // 4. Parse MarketOrderExecuted event
                let totalTokenBBought = 0;
                let totalValueSpent = 0;

                for (const log of receipt.logs) {
                    try {
                        const parsedLog = contract.interface.parseLog(log);
                        if (parsedLog && parsedLog.name === 'MarketOrderExecuted') {
                            totalValueSpent = parseFloat(ethers.formatEther(parsedLog.args.totalValue));
                            totalTokenBBought = parseFloat(ethers.formatEther(parsedLog.args.totalTokenB));
                            console.log(`   📊 MarketOrderExecuted: bought ${totalTokenBBought} PCN for ${totalValueSpent} cBRL`);
                        }
                    } catch (error) {
                        // Log não é do contrato
                    }
                }

                // 5. Sync consumed orders from blockchain
                await this.syncConsumedOrders(orderIds, normalizedContract, 'SELL', receipt.hash);

                // 6. Create trades for consumed orders
                await this.createTradesForConsumedOrders(
                    ordersBefore,
                    normalizedContract,
                    'SELL',
                    receipt.hash,
                    receipt.blockNumber,
                    normalizedUser,
                    true // isBuy
                );

                // 7. Create MARKET order record
                await this.createMarketOrderRecord(
                    normalizedUser,
                    normalizedContract,
                    true, // isBuy
                    totalValueSpent, // amountIn (cBRL)
                    totalTokenBBought, // amountOut (PCN)
                    receipt.hash,
                    receipt.blockNumber,
                    orderIds
                );

                // 8. Create transaction record for PCN bought
                await this.createMarketTransaction(
                    normalizedUser,
                    true, // isBuy
                    totalTokenBBought,
                    'PCN',
                    normalizedContract,
                    receipt.hash,
                    receipt.blockNumber,
                    receipt.gasUsed.toString()
                );

                console.log(`✅ Market BUY completed successfully!`);

                return {
                    success: true,
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    totalTokenBBought: totalTokenBBought,
                    totalValueSpent: totalValueSpent,
                    ordersConsumed: orderIds.length
                };

            } catch (blockchainError) {
                // Blockchain error - unlock orders
                console.error('❌ Blockchain execution failed:', blockchainError.message);
                await this.unlockOrders(orderIds, normalizedContract, 'SELL');
                throw blockchainError;
            }

        } catch (error) {
            console.error('❌ Error executing market buy:', error);
            throw error;
        }
    }

    /**
     * Execute market sell
     */
    async executeMarketSell(userAddress, contractAddress, amountToSell, orderIds, minAmountOut) {
        try {
            const normalizedContract = this.normalizeAddress(contractAddress);
            const normalizedUser = this.normalizeAddress(userAddress);

            console.log(`🎯 Executing market SELL...`);
            console.log(`   User: ${normalizedUser}`);
            console.log(`   Amount to sell: ${amountToSell} PCN`);
            console.log(`   Buy orders to consume: [${orderIds.join(', ')}]`);
            console.log(`   Min amount out: ${minAmountOut} cBRL`);

            // 1. Lock buy orders
            await this.lockOrders(orderIds, normalizedContract, 'BUY');

            // 2. Get orders state before execution
            const ordersBefore = await this.getOrdersStateBefore(orderIds, normalizedContract, 'BUY');

            try {
                // 3. Execute on blockchain
                const abiPath = './src/contracts/abis/default_exchange_abi.json';
                const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
                const contract = new ethers.Contract(normalizedContract, exchangeABI, this.wallet);

                const amountWei = ethers.parseEther(amountToSell.toString());
                const minAmountOutWei = ethers.parseEther(minAmountOut.toString());

                console.log(`🚀 Calling contract.marketSell...`);
                const tx = await contract.marketSell(
                    normalizedUser,
                    amountWei,
                    orderIds,
                    minAmountOutWei
                );

                console.log(`📤 Transaction sent: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`✅ Transaction confirmed: ${receipt.hash}`);

                // 4. Parse MarketOrderExecuted event
                let totalTokenASold = 0;
                let totalValueReceived = 0;

                for (const log of receipt.logs) {
                    try {
                        const parsedLog = contract.interface.parseLog(log);
                        if (parsedLog && parsedLog.name === 'MarketOrderExecuted') {
                            totalValueReceived = parseFloat(ethers.formatEther(parsedLog.args.totalValue));
                            totalTokenASold = parseFloat(ethers.formatEther(parsedLog.args.totalTokenB));
                            console.log(`   📊 MarketOrderExecuted: sold ${totalTokenASold} PCN for ${totalValueReceived} cBRL`);
                        }
                    } catch (error) {
                        // Log não é do contrato
                    }
                }

                // 5. Sync consumed orders from blockchain
                await this.syncConsumedOrders(orderIds, normalizedContract, 'BUY', receipt.hash);

                // 6. Create trades for consumed orders
                await this.createTradesForConsumedOrders(
                    ordersBefore,
                    normalizedContract,
                    'BUY',
                    receipt.hash,
                    receipt.blockNumber,
                    normalizedUser,
                    false // isSell
                );

                // 7. Create MARKET order record
                await this.createMarketOrderRecord(
                    normalizedUser,
                    normalizedContract,
                    false, // isSell
                    totalTokenASold, // amountIn (PCN)
                    totalValueReceived, // amountOut (cBRL)
                    receipt.hash,
                    receipt.blockNumber,
                    orderIds
                );

                // 8. Create transaction record for PCN sold (not cBRL received)
                await this.createMarketTransaction(
                    normalizedUser,
                    false, // isSell
                    totalTokenASold, // Amount of PCN sold
                    'PCN', // Currency sold
                    normalizedContract,
                    receipt.hash,
                    receipt.blockNumber,
                    receipt.gasUsed.toString()
                );

                console.log(`✅ Market SELL completed successfully!`);

                return {
                    success: true,
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    totalTokenBSold: totalTokenASold,
                    totalValueReceived: totalValueReceived,
                    ordersConsumed: orderIds.length
                };

            } catch (blockchainError) {
                // Blockchain error - unlock orders
                console.error('❌ Blockchain execution failed:', blockchainError.message);
                await this.unlockOrders(orderIds, normalizedContract, 'BUY');
                throw blockchainError;
            }

        } catch (error) {
            console.error('❌ Error executing market sell:', error);
            throw error;
        }
    }
}

module.exports = MarketOrderService;
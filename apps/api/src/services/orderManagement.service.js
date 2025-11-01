const { PrismaClient } = require('../generated/prisma');
const { ethers } = require('ethers');
const EventEmitter = require('events');
const OrderIdManager = require('./orderIdManager.service');
const { normalizeAddress } = require('../utils/address');
const fs = require('fs');
const tokenPriceUpdater = require('./tokenPriceUpdater.service');

class OrderManagementService extends EventEmitter {
    constructor() {
        super();
        this.prisma = null; // Will be set during initialization
        this.provider = null;
        this.wallet = null;
        this.exchangeContracts = new Map(); // contractAddress -> contract instance
        this.orderIdManager = new OrderIdManager();
    }

    /**
     * Create a transaction record for exchange operations
     * @param {string} userAddress - User's address
     * @param {string} functionName - Function name (buy/sell/cancel)
     * @param {string} amount - Amount involved
     * @param {string} currency - Currency symbol
     * @param {string} contractAddress - Contract address
     * @param {string} txHash - Transaction hash
     * @param {number} blockNumber - Block number
     * @param {string} gasUsed - Gas used
     */
    async createTransactionRecord(userAddress, functionName, amount, currency, contractAddress, txHash, blockNumber = null, gasUsed = null) {
        try {
            // Get user and company info
            const user = await this.validateUser(userAddress);

            // Determine network from environment or default to testnet
            const network = process.env.DEFAULT_NETWORK || 'testnet';

            const transactionData = {
                companyId: user.companyId || process.env.DEFAULT_COMPANY_ID || 'default-company-id',
                userId: user.id,
                network: network, // ADD NETWORK FIELD
                transactionType: 'exchange',
                functionName: functionName, // 'buy', 'sell', 'cancel'
                amount: amount,
                currency: currency,
                contractAddress: contractAddress,
                txHash: txHash,
                fromAddress: userAddress,
                toAddress: contractAddress,
                status: blockNumber ? 'confirmed' : 'pending'
            };

            if (blockNumber) {
                transactionData.blockNumber = BigInt(blockNumber);
                transactionData.confirmedAt = new Date();
            }

            if (gasUsed) {
                transactionData.gasUsed = BigInt(gasUsed);
            }

            const transaction = await this.prisma.transaction.create({
                data: transactionData
            });

            console.log(`✅ Transaction record created: ${functionName} for ${amount} ${currency}`);
            return transaction;
        } catch (error) {
            console.error('❌ Error creating transaction record:', error);
            // Don't throw - transaction records are supplementary
        }
    }

    /**
     * Create exchange trade records for market execution
     * @param {Object} matchResult - Result from blockchain matching
     * @param {string} contractAddress - Contract address
     * @param {Object[]} consumedOrders - Orders that were consumed
     */
    async createExchangeTradeRecords(matchResult, contractAddress, consumedOrders) {
        try {
            const trades = [];

            for (const result of matchResult.matchingResults) {
                const trade = await this.prisma.exchangeTrade.create({
                    data: {
                        exchangeContractAddress: contractAddress,
                        buyOrderId: result.buyOrderId ? await this.getOrderIdByBlockchainId(result.buyOrderId, contractAddress, 'BUY') : null,
                        sellOrderId: result.sellOrderId ? await this.getOrderIdByBlockchainId(result.sellOrderId, contractAddress, 'SELL') : null,
                        buyerAddress: result.buyer,
                        sellerAddress: result.seller,
                        tokenASymbol: consumedOrders[0]?.tokenASymbol || 'cBRL',
                        tokenBSymbol: consumedOrders[0]?.tokenBSymbol || 'PCN',
                        price: result.pricePerToken,
                        amount: result.amountMatched,
                        totalValue: (parseFloat(result.pricePerToken) * parseFloat(result.amountMatched)).toString(),
                        transactionHash: matchResult.transactionHash,
                        blockNumber: BigInt(matchResult.blockNumber),
                        tradeTimestamp: new Date()
                    }
                });
                trades.push(trade);
            }

            console.log(`✅ Created ${trades.length} exchange trade records`);
            return trades;
        } catch (error) {
            console.error('❌ Error creating exchange trade records:', error);
            throw error;
        }
    }

    /**
     * Create a single exchange trade record for market orders without OrdersMatched events
     * @param {string} contractAddress - Contract address
     * @param {string} userAddress - User's address
     * @param {string} orderType - BUY or SELL
     * @param {Object} marketOrderSummary - Summary from MarketOrderExecuted event
     * @param {Object} matchResult - Transaction details
     */
    async createMarketOrderTradeRecord(contractAddress, userAddress, orderType, marketOrderSummary, matchResult) {
        try {
            const ethers = require('ethers');

            // Calculate price from the event data
            const totalValue = parseFloat(ethers.formatEther(marketOrderSummary.totalValue));
            const totalTokenB = parseFloat(ethers.formatEther(marketOrderSummary.totalTokenB));
            const averagePrice = totalValue / totalTokenB;

            const trade = await this.prisma.exchangeTrade.create({
                data: {
                    exchangeContractAddress: contractAddress,
                    buyOrderId: null,  // Market orders don't have specific order IDs
                    sellOrderId: null,
                    buyerAddress: orderType === 'BUY' ? userAddress : null,
                    sellerAddress: orderType === 'SELL' ? userAddress : null,
                    tokenASymbol: 'cBRL',
                    tokenBSymbol: 'PCN',
                    price: averagePrice.toString(),
                    amount: totalTokenB.toString(),
                    totalValue: totalValue.toString(),
                    transactionHash: matchResult.transactionHash,
                    blockNumber: BigInt(matchResult.blockNumber),
                    tradeTimestamp: new Date()
                }
            });

            console.log(`✅ Created market order trade record: ${totalTokenB} PCN @ ${averagePrice.toFixed(6)} cBRL/PCN`);
            return trade;
        } catch (error) {
            console.error('❌ Error creating market order trade record:', error);
            throw error;
        }
    }

    /**
     * Get internal order ID by blockchain order ID
     */
    async getOrderIdByBlockchainId(blockchainOrderId, contractAddress, orderType) {
        try {
            const where = {
                blockchainOrderId: BigInt(blockchainOrderId),
                exchangeContractAddress: contractAddress
            };

            // Se orderType foi fornecido, adicionar ao filtro para evitar duplicatas
            if (orderType) {
                where.orderType = orderType;
            }

            const order = await this.prisma.exchangeOrder.findFirst({
                where,
                select: { id: true, orderType: true }
            });

            if (!order) {
                console.warn(`⚠️ Order not found: blockchainOrderId=${blockchainOrderId}, contract=${contractAddress}, type=${orderType || 'ANY'}`);
            }

            return order?.id || null;
        } catch (error) {
            console.error(`❌ Error finding order ID for blockchain ID ${blockchainOrderId}:`, error);
            return null;
        }
    }

    /**
     * Process successful market order execution - create all database records
     * @param {string} userAddress - User's address
     * @param {string} contractAddress - Contract address
     * @param {string} orderType - 'BUY' or 'SELL'
     * @param {number} tokenAmount - Amount of tokens bought/sold
     * @param {number} totalValue - Total value in cBRL
     * @param {Object} matchResult - Blockchain match result
     * @param {Object[]} consumedOrders - Orders that were consumed
     * @param {Object} marketOrderSummary - Summary from MarketOrderExecuted event (optional)
     */
    async processMarketOrderSuccess(userAddress, contractAddress, orderType, tokenAmount, totalValue, matchResult, consumedOrders, marketOrderSummary = null) {
        try {
            // CRITICAL GUARD: Validate blockchain confirmation before database updates
            if (!matchResult || !matchResult.transactionHash) {
                console.error('🚫 BLOCKCHAIN GUARD: Cannot process market order success without valid transaction hash');
                throw new Error('Blockchain transaction confirmation required before database updates');
            }

            // For market orders (marketBuy/marketSell), we don't need OrdersMatched events
            // The MarketOrderExecuted event already contains all the information we need
            console.log(`📝 Processing market ${orderType} success - creating database records...`);
            console.log(`   Total amount: ${tokenAmount}`);
            console.log(`   Total value: ${totalValue}`);

            // Get token symbols from consumed orders
            const tokenASymbol = consumedOrders[0]?.tokenASymbol || 'cBRL';
            const tokenBSymbol = consumedOrders[0]?.tokenBSymbol || 'PCN';

            // 1. Create market order record in exchange_orders table
            const marketOrder = await this.prisma.exchangeOrder.create({
                data: {
                    blockchainOrderId: 0, // Market orders don't have blockchain order IDs
                    exchangeContractAddress: contractAddress,
                    userAddress: userAddress,
                    orderType: orderType,
                    orderSide: 'MARKET', // This is a market order
                    tokenASymbol: tokenASymbol,
                    tokenBSymbol: tokenBSymbol,
                    price: (totalValue / tokenAmount).toString(), // Average execution price
                    amount: tokenAmount.toString(),
                    remainingAmount: '0', // Market orders are immediately filled
                    filledAmount: tokenAmount.toString(),
                    status: 'EXECUTED',
                    transactionHash: matchResult.transactionHash, // Market orders: creation = execution (same TX)
                    gasUsed: matchResult.gasUsed,
                    blockNumber: BigInt(matchResult.blockNumber)
                }
            });

            console.log(`✅ Created market ${orderType} order record: ${marketOrder.id}`);

            // 2. Create transaction record
            await this.createTransactionRecord(
                userAddress,
                orderType.toLowerCase(), // 'buy' or 'sell'
                tokenAmount.toString(), // Amount of tokenB traded
                tokenBSymbol, // Currency (tokenB - the token being traded, e.g., PCN)
                contractAddress,
                matchResult.transactionHash,
                matchResult.blockNumber,
                matchResult.gasUsed
            );

            // 3. Create exchange_trades records for each consumed order
            if (matchResult.matches && matchResult.matches.length > 0) {
                await this.createExchangeTradeRecords(matchResult, contractAddress, consumedOrders);
            } else if (marketOrderSummary) {
                // For market orders without OrdersMatched events, create a single trade record
                console.log('   📝 Creating market order trade record from MarketOrderExecuted event...');
                await this.createMarketOrderTradeRecord(contractAddress, userAddress, orderType, marketOrderSummary, matchResult);
            }

            // 4. Update consumed limit orders (reduce remaining amounts or mark as executed)
            // For market orders without OrdersMatched events, we sync from blockchain instead
            if (matchResult.matchingResults && matchResult.matchingResults.length > 0) {
                await this.updateConsumedOrders(matchResult.matchingResults, contractAddress);
            } else {
                console.log('   ℹ️ No OrdersMatched events - syncing order states from blockchain...');
                await this.syncConsumedOrdersFromBlockchain(consumedOrders, contractAddress);
            }

            console.log(`✅ Successfully processed market ${orderType} - all database records created`);

        } catch (error) {
            console.error(`❌ Error processing market ${orderType} success:`, error);
            // This is critical - if we can't record the transaction, we need to know
            throw new Error(`Failed to record market ${orderType} in database: ${error.message}`);
        }
    }

    /**
     * Sync consumed orders from blockchain after market order execution
     * (when contract doesn't emit OrdersMatched events)
     */
    async syncConsumedOrdersFromBlockchain(consumedOrders, contractAddress) {
        try {
            console.log(`   🔄 Syncing ${consumedOrders.length} consumed orders from blockchain...`);

            const fs = require('fs');
            const abiPath = './src/contracts/abis/default_exchange_abi.json';
            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
            const contract = new ethers.Contract(contractAddress, exchangeABI, this.wallet.provider);

            for (const consumedOrder of consumedOrders) {
                try {
                    const blockchainOrderId = consumedOrder.blockchainOrderId;

                    // Determine if it's a buy or sell order based on order type
                    const isSellOrder = consumedOrder.price !== undefined; // Sell orders have price from the fetch

                    // Fetch current state from blockchain
                    let orderData;
                    if (isSellOrder) {
                        orderData = await contract.sellOrders(blockchainOrderId);
                    } else {
                        orderData = await contract.buyOrders(blockchainOrderId);
                    }

                    const [id, trader, amount, price, remainingAmount, isActive] = orderData;

                    // Find order in database
                    const dbOrder = await this.prisma.exchangeOrder.findFirst({
                        where: {
                            blockchainOrderId: BigInt(blockchainOrderId),
                            exchangeContractAddress: contractAddress
                        }
                    });

                    if (!dbOrder) {
                        console.warn(`   ⚠️ Order ${blockchainOrderId} not found in database`);
                        continue;
                    }

                    // Calculate what changed
                    const blockchainRemainingAmount = parseFloat(ethers.formatEther(remainingAmount));
                    const dbRemainingAmount = parseFloat(dbOrder.remainingAmount);
                    const dbFilledAmount = parseFloat(dbOrder.filledAmount || '0');

                    // Calcular apenas o que foi consumido NESTE match
                    const amountConsumed = dbRemainingAmount - blockchainRemainingAmount;

                    if (amountConsumed > 0.000001) {
                        // Order was partially or fully consumed
                        const newStatus = blockchainRemainingAmount <= 0.000001 ? 'EXECUTED' : 'ACTIVE';

                        // SOMAR o que foi consumido ao filled_amount existente
                        const newFilledAmount = dbFilledAmount + amountConsumed;

                        console.log(`   📊 Updating order ${blockchainOrderId}: consumed ${amountConsumed.toFixed(6)}, filled ${dbFilledAmount.toFixed(6)} → ${newFilledAmount.toFixed(6)}, remaining ${blockchainRemainingAmount.toFixed(6)}, status: ${newStatus}`);

                        await this.prisma.exchangeOrder.update({
                            where: { id: dbOrder.id },
                            data: {
                                remainingAmount: blockchainRemainingAmount.toString(),
                                filledAmount: newFilledAmount.toString(),
                                status: newStatus,
                                updatedAt: new Date()
                            }
                        });

                        console.log(`   ✅ Order ${blockchainOrderId} synced from blockchain`);
                    } else {
                        console.log(`   ℹ️ Order ${blockchainOrderId} unchanged (remaining: ${blockchainRemainingAmount.toFixed(6)})`);
                    }

                } catch (error) {
                    console.error(`   ❌ Error syncing order ${consumedOrder.blockchainOrderId}:`, error.message);
                }
            }

            console.log(`   ✅ Finished syncing consumed orders from blockchain`);
        } catch (error) {
            console.error('❌ Error in syncConsumedOrdersFromBlockchain:', error);
            // Don't throw - this is a sync operation, shouldn't fail the whole transaction
        }
    }

    /**
     * Update consumed limit orders after market execution
     */
    async updateConsumedOrders(matchingResults, contractAddress) {
        try {
            for (const match of matchingResults) {
                // Update buy order if it exists
                if (match.buyOrderId) {
                    await this.updateOrderAfterMatch(match.buyOrderId, match.amountMatched, contractAddress);
                }

                // Update sell order if it exists
                if (match.sellOrderId) {
                    await this.updateOrderAfterMatch(match.sellOrderId, match.amountMatched, contractAddress);
                }
            }
        } catch (error) {
            console.error('❌ Error updating consumed orders:', error);
            throw error;
        }
    }

    /**
     * Update individual order after match
     */
    async updateOrderAfterMatch(blockchainOrderId, amountMatched, contractAddress) {
        try {
            // CRITICAL GUARD: Only update orders that actually had blockchain matches
            if (!amountMatched || parseFloat(amountMatched) <= 0) {
                console.warn(`🚫 ORDER GUARD: Skipping order ${blockchainOrderId} update - no valid amount matched (${amountMatched})`);
                return;
            }

            const order = await this.prisma.exchangeOrder.findFirst({
                where: {
                    blockchainOrderId: BigInt(blockchainOrderId),
                    exchangeContractAddress: contractAddress
                }
            });

            if (order) {
                // ADDITIONAL GUARD: Validate order data consistency before update
                if (parseFloat(order.remainingAmount) <= 0) {
                    console.warn(`🚫 ORDER GUARD: Order ${blockchainOrderId} already fully executed (remaining: ${order.remainingAmount})`);
                    return;
                }

                if (parseFloat(amountMatched) > parseFloat(order.remainingAmount)) {
                    console.error(`🚫 ORDER GUARD: Invalid match amount ${amountMatched} exceeds remaining ${order.remainingAmount} for order ${blockchainOrderId}`);
                    return;
                }

                const remainingAmount = Math.max(0, parseFloat(order.remainingAmount) - parseFloat(amountMatched));
                const filledAmount = parseFloat(order.filledAmount) + parseFloat(amountMatched);
                const newStatus = remainingAmount <= 0.000001 ? 'EXECUTED' : 'ACTIVE';

                console.log(`📊 ORDER UPDATE: Order ${blockchainOrderId} - matched: ${amountMatched}, remaining: ${remainingAmount}, status: ${newStatus}`);

                await this.prisma.exchangeOrder.update({
                    where: { id: order.id },
                    data: {
                        remainingAmount: remainingAmount.toString(),
                        filledAmount: filledAmount.toString(),
                        status: newStatus,
                        updatedAt: new Date()
                    }
                });

                console.log(`✅ Updated order ${blockchainOrderId}: ${order.status} → ${newStatus} (remaining: ${remainingAmount})`);
            }
        } catch (error) {
            console.error(`❌ Error updating order ${blockchainOrderId}:`, error);
            throw error;
        }
    }

    /**
     * Initialize the service with blockchain connection
     */
    async initialize(rpcUrl, privateKey) {
        try {
            // Use global Prisma instance if available, otherwise create new one
            this.prisma = global.prisma || new PrismaClient();

            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);

            // Initialize OrderIdManager
            await this.orderIdManager.initialize();

            console.log('✅ OrderManagementService initialized');
            console.log('📍 Wallet address:', this.wallet.address);
            console.log('🗄️ Prisma instance:', this.prisma ? 'available' : 'not available');

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize OrderManagementService:', error);
            throw error;
        }
    }

    /**
     * Add an exchange contract to manage
     */
    addExchangeContract(contractAddress, abi) {
        try {
            const checksumAddress = ethers.getAddress(contractAddress);
            const contract = new ethers.Contract(checksumAddress, abi, this.wallet);
            this.exchangeContracts.set(checksumAddress, contract);

            // Setup event listeners for this contract
            this.setupEventListeners(contract, contractAddress);

            console.log(`✅ Added exchange contract: ${contractAddress}`);
            return contract;
        } catch (error) {
            console.error(`❌ Failed to add exchange contract ${contractAddress}:`, error);
            throw error;
        }
    }

    /**
     * Setup blockchain event listeners
     * DESABILITADO: Event listeners causam "Batch request length too long"
     */
    setupEventListeners(contract, contractAddress) {
        // Event listeners desabilitados - eventos processados via polling
        console.log(`⚠️ Event listeners desabilitados para ${contractAddress} - usando polling mode`);
        return;

        /* CÓDIGO ORIGINAL COMENTADO
        // Wrapper para capturar erros nos event listeners
        const safeEventListener = (eventName, handler) => {
            try {
                contract.on(eventName, async (...args) => {
                    try {
                        await handler(...args);
                    } catch (error) {
                        // Filtrar erros específicos do FilterIdEventSubscriber
                        if (error.message && error.message.includes('results is not iterable')) {
                            console.warn(`⚠️ Filtered ${eventName} error: ${error.message}`);
                            return;
                        }
                        console.error(`❌ Error in ${eventName} handler:`, error);
                    }
                });
            } catch (error) {
                console.error(`❌ Error setting up ${eventName} listener:`, error);
            }
        };
        */

        // Listen to BuyOrderCreated events
        safeEventListener('BuyOrderCreated', async (buyer, orderId, amountAsset, pricePerAsset, event) => {
            await this.handleOrderCreatedEvent({
                type: 'BUY',
                buyer,
                orderId: orderId.toString(),
                amountAsset: ethers.formatEther(amountAsset),
                pricePerAsset: ethers.formatEther(pricePerAsset),
                contractAddress,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        // Listen to SellOrderCreated events
        safeEventListener('SellOrderCreated', async (seller, orderId, amountAsset, pricePerAsset, event) => {
            await this.handleOrderCreatedEvent({
                type: 'SELL',
                seller,
                orderId: orderId.toString(),
                amountAsset: ethers.formatEther(amountAsset),
                pricePerAsset: ethers.formatEther(pricePerAsset),
                contractAddress,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        // Listen to OrdersMatched events
        safeEventListener('OrdersMatched', async (buyOrderId, sellOrderId, buyer, seller, amountMatched, pricePerAsset, fee, event) => {
            await this.handleOrdersMatchedEvent({
                buyOrderId: buyOrderId.toString(),
                sellOrderId: sellOrderId.toString(),
                buyer,
                seller,
                amountMatched: ethers.formatEther(amountMatched),
                pricePerAsset: ethers.formatEther(pricePerAsset),
                fee: ethers.formatEther(fee),
                contractAddress,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        // Listen to order cancellations
        safeEventListener('BuyOrderCancelled', async (buyer, orderId, event) => {
            await this.handleOrderCancelledEvent({
                type: 'BUY',
                user: buyer,
                orderId: orderId.toString(),
                contractAddress,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });

        safeEventListener('SellOrderCancelled', async (seller, orderId, event) => {
            await this.handleOrderCancelledEvent({
                type: 'SELL',
                user: seller,
                orderId: orderId.toString(),
                contractAddress,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        });
    }

    /**
     * Create a limit buy order
     * Uses admin wallet with TRANSFER_ROLE to execute transferFromGasless
     */
    async createBuyOrder(userAddress, exchangeContractAddress, tokenASymbol, tokenBSymbol, amount, price) {
        const checksumAddress = ethers.getAddress(exchangeContractAddress);
        const contract = this.exchangeContracts.get(checksumAddress);
        if (!contract) {
            throw new Error(`Exchange contract not found: ${exchangeContractAddress}`);
        }

        try {
            // Validate user exists and is active
            await this.validateUser(userAddress);

            // Convert to wei
            const amountWei = ethers.parseEther(amount.toString());
            const priceWei = ethers.parseEther(price.toString());

            // Use admin wallet (has TRANSFER_ROLE) instead of user wallet
            // The exchange contract will handle transferFromGasless for token transfers
            const tx = await contract.createBuyOrder(
                userAddress,
                amountWei,
                priceWei
            );

            // Create pending order in database
            const order = await this.prisma.exchangeOrder.create({
                data: {
                    blockchainOrderId: 0, // Will be updated when event is received
                    exchangeContractAddress: normalizeAddress(exchangeContractAddress),
                    userAddress: normalizeAddress(userAddress),
                    orderType: 'BUY',
                    orderSide: 'LIMIT',
                    tokenASymbol,
                    tokenBSymbol,
                    price: price.toString(),
                    amount: amount.toString(),
                    remainingAmount: amount.toString(),
                    status: 'PENDING',
                    transactionHash: tx.hash
                }
            });

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            // Update order with gas info
            await this.prisma.exchangeOrder.update({
                where: { id: order.id },
                data: {
                    gasUsed: receipt.gasUsed.toString(),
                    gasPrice: tx.gasPrice.toString(),
                    blockNumber: receipt.blockNumber,
                    status: 'ACTIVE'
                }
            });

            // Create transaction record for the buy order creation
            await this.createTransactionRecord(
                userAddress,
                'buy', // functionName
                amount.toString(), // amount of tokens user wants to buy
                tokenBSymbol, // currency (tokenB - the token being bought, e.g., PCN)
                exchangeContractAddress,
                tx.hash,
                receipt.blockNumber,
                receipt.gasUsed.toString()
            );

            // Update token price after creating buy order
            await tokenPriceUpdater.onOrderCreated({
                pair: `${tokenBSymbol}/${tokenASymbol}`,
                price: price.toString(),
                side: 'BUY'
            });

            this.emit('orderCreated', { order, receipt });

            return {
                success: true,
                orderId: order.id,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error('❌ Error creating buy order:', error);
            throw error;
        }
    }

    /**
     * Create a limit sell order
     * Uses admin wallet with TRANSFER_ROLE to execute transferFromGasless
     */
    async createSellOrder(userAddress, exchangeContractAddress, tokenASymbol, tokenBSymbol, amount, price) {
        const checksumAddress = ethers.getAddress(exchangeContractAddress);
        const contract = this.exchangeContracts.get(checksumAddress);
        if (!contract) {
            throw new Error(`Exchange contract not found: ${exchangeContractAddress}`);
        }

        try {
            // Validate user exists and is active
            await this.validateUser(userAddress);

            // Convert to wei
            const amountWei = ethers.parseEther(amount.toString());
            const priceWei = ethers.parseEther(price.toString());

            // Use admin wallet (has TRANSFER_ROLE) instead of user wallet
            // The exchange contract will handle transferFromGasless for token transfers
            const tx = await contract.createSellOrder(
                userAddress,
                amountWei,
                priceWei
            );

            // Create pending order in database
            const order = await this.prisma.exchangeOrder.create({
                data: {
                    blockchainOrderId: 0, // Will be updated when event is received
                    exchangeContractAddress: normalizeAddress(exchangeContractAddress),
                    userAddress: normalizeAddress(userAddress),
                    orderType: 'SELL',
                    orderSide: 'LIMIT',
                    tokenASymbol,
                    tokenBSymbol,
                    price: price.toString(),
                    amount: amount.toString(),
                    remainingAmount: amount.toString(),
                    status: 'PENDING',
                    transactionHash: tx.hash
                }
            });

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            // Update order with gas info
            await this.prisma.exchangeOrder.update({
                where: { id: order.id },
                data: {
                    gasUsed: receipt.gasUsed.toString(),
                    gasPrice: tx.gasPrice.toString(),
                    blockNumber: receipt.blockNumber,
                    status: 'ACTIVE'
                }
            });

            // Create transaction record for the sell order creation
            await this.createTransactionRecord(
                userAddress,
                'sell', // functionName
                amount.toString(), // amount of tokens user wants to sell
                tokenBSymbol, // currency (tokenB - the token being sold, e.g., PCN)
                exchangeContractAddress,
                tx.hash,
                receipt.blockNumber,
                receipt.gasUsed.toString()
            );

            // Update token price after creating sell order
            await tokenPriceUpdater.onOrderCreated({
                pair: `${tokenBSymbol}/${tokenASymbol}`,
                price: price.toString(),
                side: 'SELL'
            });

            this.emit('orderCreated', { order, receipt });

            return {
                success: true,
                orderId: order.id,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error('❌ Error creating sell order:', error);
            throw error;
        }
    }

    /**
     * Cancel an order
     * Uses admin wallet with TRANSFER_ROLE (no user private key needed)
     */
    async cancelOrder(orderId, userAddress, exchangeContractAddress, orderType) {
        // Validate and normalize contract address
        if (!exchangeContractAddress) {
            throw new Error('Exchange contract address is required');
        }

        const checksumAddress = ethers.getAddress(exchangeContractAddress);
        const contract = this.exchangeContracts.get(checksumAddress);
        if (!contract) {
            throw new Error(`Exchange contract not found: ${checksumAddress}`);
        }

        try {
            // Get order from database - normalize user address with checksum
            const checksumUserAddress = ethers.getAddress(userAddress);

            console.log('🔍 Debug cancelOrder - Searching for:', {
                orderId,
                userAddress: checksumUserAddress,
                orderType: orderType?.toUpperCase(),
                status: 'ACTIVE'
            });

            const order = await this.prisma.ExchangeOrder.findFirst({
                where: {
                    blockchainOrderId: BigInt(orderId), // orderId é o blockchain_order_id incremental
                    userAddress: checksumUserAddress,
                    exchangeContractAddress: checksumAddress, // Add contract address filter
                    orderType: orderType?.toUpperCase(), // Filtrar por tipo de ordem (BUY/SELL)
                    status: 'ACTIVE' // Only allow cancelling active orders
                },
                orderBy: {
                    createdAt: 'desc' // Get the most recent order if there are duplicates
                }
            });

            console.log('🔍 Debug cancelOrder - Found order:', order ? {
                id: order.id.substring(0, 8) + '...',
                orderType: order.orderType,
                price: order.price,
                amount: order.amount,
                status: order.status,
                blockchainOrderId: order.blockchainOrderId
            } : 'NO');

            if (!order) {
                // Debug: buscar todas as ordens com este blockchainOrderId
                const allOrdersWithId = await this.prisma.ExchangeOrder.findMany({
                    where: { blockchainOrderId: BigInt(orderId) }
                });
                console.log('🔍 Debug - All orders with this blockchainOrderId:', allOrdersWithId.map(o => ({
                    id: o.id.substring(0, 8) + '...',
                    orderType: o.orderType,
                    userAddress: o.userAddress,
                    status: o.status,
                    price: o.price
                })));

                throw new Error('Order not found or not active');
            }

            // Use admin wallet (has TRANSFER_ROLE) instead of user wallet
            // The exchange contract will validate that the userAddress owns the order
            const tx = order.orderType === 'BUY'
                ? await contract.cancelBuyOrder(order.blockchainOrderId, userAddress)
                : await contract.cancelSellOrder(order.blockchainOrderId, userAddress);

            // Wait for confirmation
            const receipt = await tx.wait();

            // Update order status
            await this.prisma.ExchangeOrder.update({
                where: { id: order.id },
                data: {
                    status: 'CANCELLED',
                    updatedAt: new Date()
                }
            });

            // Create transaction record for the order cancellation
            // Use remainingAmount instead of amount to show how much was returned
            const returnedAmount = order.remainingAmount || order.amount;
            await this.createTransactionRecord(
                userAddress,
                'cancel', // functionName
                returnedAmount.toString(), // amount returned to user (remainingAmount of the cancelled order)
                order.tokenBSymbol || order.tokenASymbol || 'UNKNOWN', // currency (tokenB - the token being traded, e.g., PCN)
                exchangeContractAddress,
                tx.hash,
                receipt.blockNumber,
                receipt.gasUsed.toString()
            );

            this.emit('orderCancelled', { order, receipt });

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error('❌ Error cancelling order:', error);
            throw error;
        }
    }

    /**
     * Get order book for a trading pair
     */
    async getOrderBook(exchangeContractAddress, depth = 20) {
        try {
            const buyOrders = await this.prisma.exchangeOrder.findMany({
                where: {
                    exchangeContractAddress: ethers.getAddress(exchangeContractAddress),
                    orderType: 'BUY',
                    orderSide: 'LIMIT', // Only LIMIT orders, never MARKET
                    status: {
                        in: ['ACTIVE', 'ACTIVE']
                    }
                },
                orderBy: [
                    { price: 'desc' },
                    { createdAt: 'asc' }
                ],
                take: depth
            });

            const sellOrders = await this.prisma.exchangeOrder.findMany({
                where: {
                    exchangeContractAddress: ethers.getAddress(exchangeContractAddress),
                    orderType: 'SELL',
                    orderSide: 'LIMIT', // Only LIMIT orders, never MARKET
                    status: {
                        in: ['ACTIVE', 'ACTIVE']
                    }
                },
                orderBy: [
                    { price: 'asc' },
                    { createdAt: 'asc' }
                ],
                take: depth
            });

            return {
                bids: buyOrders.map(order => ({
                    price: parseFloat(order.price),
                    amount: parseFloat(order.remainingAmount),
                    total: parseFloat(order.price) * parseFloat(order.remainingAmount),
                    orderId: order.blockchainOrderId.toString(), // Use blockchain order ID for matching
                    blockchainOrderId: order.blockchainOrderId.toString(),
                    databaseId: order.id, // Keep database ID for internal reference
                    userAddress: order.userAddress
                })),
                asks: sellOrders.map(order => ({
                    price: parseFloat(order.price),
                    amount: parseFloat(order.remainingAmount),
                    total: parseFloat(order.price) * parseFloat(order.remainingAmount),
                    orderId: order.blockchainOrderId.toString(), // Use blockchain order ID for matching
                    blockchainOrderId: order.blockchainOrderId.toString(),
                    databaseId: order.id, // Keep database ID for internal reference
                    userAddress: order.userAddress
                }))
            };

        } catch (error) {
            console.error('❌ Error getting order book:', error);
            throw error;
        }
    }

    /**
     * Get user's orders
     */
    async getUserOrders(userAddress, filters = {}) {
        try {
            const where = {
                userAddress: ethers.getAddress(userAddress),
                ...filters
            };

            const orders = await this.prisma.exchangeOrder.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: filters.limit || 50
            });

            return orders.map(order => ({
                id: order.id,
                blockchainOrderId: order.blockchainOrderId.toString(),
                type: order.orderType.toLowerCase(),
                side: order.orderSide.toLowerCase(),
                tokenPair: `${order.tokenBSymbol}/${order.tokenASymbol}`,
                price: parseFloat(order.price),
                amount: parseFloat(order.amount),
                remaining: parseFloat(order.remainingAmount),
                filled: parseFloat(order.filledAmount),
                status: order.status.toLowerCase(),
                createdAt: order.createdAt,
                transactionHash: order.transactionHash
            }));

        } catch (error) {
            console.error('❌ Error getting user orders:', error);
            throw error;
        }
    }

    /**
     * Get recent trades
     */
    async getRecentTrades(exchangeContractAddress, limit = 50) {
        try {
            const trades = await this.prisma.exchangeTrade.findMany({
                where: {
                    exchangeContractAddress: normalizeAddress(exchangeContractAddress)
                },
                orderBy: { tradeTimestamp: 'desc' },
                take: limit
            });

            return trades.map(trade => ({
                id: trade.id,
                price: parseFloat(trade.price),
                amount: parseFloat(trade.amount),
                total: parseFloat(trade.totalValue),
                side: trade.buyerAddress === trade.sellerAddress ? 'market' : 'limit',
                timestamp: trade.tradeTimestamp,
                transactionHash: trade.transactionHash
            }));

        } catch (error) {
            console.error('❌ Error getting recent trades:', error);
            throw error;
        }
    }

    /**
     * Handle blockchain events
     */
    async handleOrderCreatedEvent(eventData) {
        try {
            console.log(`🔔 Processing order created event for orderId: ${eventData.orderId}, txHash: ${eventData.transactionHash}`);

            // Validate required data
            if (!eventData.orderId) {
                console.error('❌ Missing orderId in event data');
                return;
            }

            // Prepare update data with safe BigInt conversion
            const updateData = {
                blockchainOrderId: BigInt(eventData.orderId),
                status: 'ACTIVE'
            };

            // Only add blockNumber if it exists
            if (eventData.blockNumber !== undefined && eventData.blockNumber !== null) {
                updateData.blockNumber = BigInt(eventData.blockNumber);
            }

            // Update order with blockchain order ID - don't filter by status since it might already be ACTIVE
            const updateResult = await this.prisma.exchangeOrder.updateMany({
                where: {
                    transactionHash: eventData.transactionHash,
                    blockchainOrderId: 0  // Only update orders that haven't been updated yet
                },
                data: updateData
            });

            console.log(`✅ Order created event processed: ${eventData.orderId}, updated ${updateResult.count} orders`);

            if (updateResult.count === 0) {
                console.log(`⚠️ No orders found to update for txHash: ${eventData.transactionHash}`);
                return;
            }

            // Buscar a ordem atualizada para publicar no RabbitMQ
            const updatedOrder = await this.prisma.exchangeOrder.findFirst({
                where: {
                    transactionHash: eventData.transactionHash,
                    blockchainOrderId: BigInt(eventData.orderId)
                }
            });

            if (updatedOrder) {
                // Publicar ordem criada para o sistema de matching
                const rabbitMQ = require('../config/rabbitmq');
                await rabbitMQ.publishOrderCreated(eventData.contractAddress, {
                    id: updatedOrder.id,
                    orderId: eventData.orderId,
                    blockchainOrderId: updatedOrder.blockchainOrderId.toString(),
                    orderType: updatedOrder.orderType,
                    userAddress: updatedOrder.userAddress,
                    price: updatedOrder.price,
                    amount: updatedOrder.amount,
                    remainingAmount: updatedOrder.remainingAmount,
                    contractAddress: eventData.contractAddress,
                    transactionHash: eventData.transactionHash,
                    blockNumber: eventData.blockNumber
                });

                console.log(`📤 Order ${eventData.orderId} published to matching queue`);
            }
        } catch (error) {
            console.error('❌ Error handling order created event:', error);
        }
    }

    async handleOrdersMatchedEvent(eventData) {
        try {
            // Validar transaction hash básico
            const txHash = eventData.transactionHash;
            if (!txHash || txHash === '0x') {
                console.log(`🚫 [OrderManagement] Transaction hash inválido: ${txHash} - IGNORANDO match sem transaction hash válido`);
                console.log(`   ℹ️ Matches agora devem ser processados via MatchExecutorService com transaction hash válido`);
                console.log(`   ℹ️ Este match será ignorado para evitar conflitos entre sistemas`);

                // 🚫 NÃO atualizar ordens sem transaction hash válido
                // Isso previne conflitos entre AutoMatchingService antigo e MatchExecutorService novo
                // Somente o MatchExecutorService deve atualizar ordens após matches blockchain
                return;
            }

            console.log(`🔍 [OrderManagement] Processando evento de match para tx: ${txHash}`);

            // 🚫 DESABILITADO: Trade creation moved to MatchExecutorService
            // O MatchExecutorService agora é responsável por criar trades com order IDs corretos
            // Isso evita duplicação e garante que buy_order_id e sell_order_id sejam preenchidos
            console.log(`ℹ️ [OrderManagement] Trade creation skipped - MatchExecutorService handles this now`);
            console.log(`   TX: ${txHash} - Only order updates will be processed`);

            // Update orders with filled amounts immediately after match
            await this.updateOrdersAfterMatch(eventData);

            this.emit('orderMatched', eventData);

        } catch (error) {
            console.error('❌ Error handling orders matched event:', error);
        }
    }

    async handleOrderCancelledEvent(eventData) {
        try {
            // Only update orders that are currently ACTIVE to prevent affecting already cancelled orders
            await this.prisma.exchangeOrder.updateMany({
                where: {
                    blockchainOrderId: BigInt(eventData.orderId),
                    exchangeContractAddress: normalizeAddress(eventData.contractAddress),
                    status: 'ACTIVE' // Only update ACTIVE orders
                },
                data: {
                    status: 'CANCELLED',
                    updatedAt: new Date()
                }
            });

            this.emit('orderCancelled', eventData);
            console.log(`✅ Order cancelled: ${eventData.orderId}`);

        } catch (error) {
            console.error('❌ Error handling order cancelled event:', error);
        }
    }

    /**
     * Validate user exists in database (for security/audit purposes)
     */
    async validateUser(userAddress) {
        const normalizedUserAddress = normalizeAddress(userAddress);
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { publicKey: normalizedUserAddress },
                    { blockchainAddress: normalizedUserAddress }
                ],
                isActive: true
            },
            select: {
                id: true,
                publicKey: true,
                blockchainAddress: true,
                isActive: true,
                userCompanies: {
                    take: 1,
                    orderBy: {
                        lastAccessAt: 'desc' // Get most recently accessed company
                    },
                    select: {
                        companyId: true
                    }
                }
            }
        });

        if (!user) {
            throw new Error(`User not found or inactive: ${userAddress}`);
        }

        // Extract companyId from the first userCompany relation
        const companyId = user.userCompanies?.[0]?.companyId || process.env.DEFAULT_COMPANY_ID || 'e040ff60-2846-4d87-963e-332f2bbc2803';

        return {
            ...user,
            companyId
        };
    }

    /**
     * Update orders status after match is executed
     */
    async updateOrdersAfterMatch(eventData) {
        try {
            console.log(`🔄 Updating orders after match: buyOrderId=${eventData.buyOrderId}, sellOrderId=${eventData.sellOrderId}`);

            const buyOrderId = BigInt(eventData.buyOrderId);
            const sellOrderId = BigInt(eventData.sellOrderId);
            const amountMatched = eventData.amountMatched || eventData.amount || '0';

            console.log(`📊 Match data: amount=${amountMatched}`);

            // Update buy order
            const buyOrder = await this.prisma.exchangeOrder.findFirst({
                where: {
                    blockchainOrderId: buyOrderId,
                    exchangeContractAddress: normalizeAddress(eventData.contractAddress)
                }
            });

            if (buyOrder) {
                const remainingAmount = Math.max(0, parseFloat(buyOrder.remainingAmount) - parseFloat(amountMatched));
                const filledAmount = parseFloat(buyOrder.filledAmount) + parseFloat(amountMatched);
                const newStatus = remainingAmount <= 0 ? 'EXECUTED' : 'ACTIVE';

                await this.prisma.exchangeOrder.update({
                    where: { id: buyOrder.id },
                    data: {
                        remainingAmount: remainingAmount,
                        filledAmount: filledAmount,
                        status: newStatus,
                        updatedAt: new Date()
                    }
                });

                console.log(`✅ Buy order ${buyOrderId} updated: ${buyOrder.status} → ${newStatus} (remaining: ${remainingAmount})`);
            }

            // Update sell order
            const sellOrder = await this.prisma.exchangeOrder.findFirst({
                where: {
                    blockchainOrderId: sellOrderId,
                    exchangeContractAddress: normalizeAddress(eventData.contractAddress)
                }
            });

            if (sellOrder) {
                const remainingAmount = Math.max(0, parseFloat(sellOrder.remainingAmount) - parseFloat(amountMatched));
                const filledAmount = parseFloat(sellOrder.filledAmount) + parseFloat(amountMatched);
                const newStatus = remainingAmount <= 0 ? 'EXECUTED' : 'ACTIVE';

                await this.prisma.exchangeOrder.update({
                    where: { id: sellOrder.id },
                    data: {
                        remainingAmount: remainingAmount,
                        filledAmount: filledAmount,
                        status: newStatus,
                        updatedAt: new Date()
                    }
                });

                console.log(`✅ Sell order ${sellOrderId} updated: ${sellOrder.status} → ${newStatus} (remaining: ${remainingAmount})`);
            }

            // Broadcast WebSocket updates for both order book and user orders
            await this.broadcastUpdatesAfterMatch(eventData.contractAddress, [buyOrder, sellOrder].filter(Boolean));

        } catch (error) {
            console.error('❌ Error updating orders after match:', error);
        }
    }

    /**
     * Broadcast WebSocket updates after order match
     */
    async broadcastUpdatesAfterMatch(contractAddress, updatedOrders) {
        try {
            // Import here to avoid circular dependency
            const rabbitMQ = require('../config/rabbitmq');
            const redisOrderBookCache = require('./redisOrderBookCache');

            // Clear Redis cache to force fresh order book data
            await redisOrderBookCache.invalidateOrderBook(contractAddress);

            // Broadcast order book update (will exclude executed orders)
            await rabbitMQ.publishWebSocketBroadcast('orderbook_update', {
                contractAddress: normalizeAddress(contractAddress)
            });

            // Broadcast user-specific order updates
            for (const order of updatedOrders) {
                await rabbitMQ.publishWebSocketBroadcast('user_orders_update', {
                    contractAddress: normalizeAddress(contractAddress),
                    userAddress: order.userAddress,
                    orderData: {
                        orderId: order.blockchainOrderId.toString(),
                        status: order.status,
                        remainingAmount: order.remainingAmount,
                        filledAmount: order.filledAmount
                    }
                });
            }

            console.log(`📡 WebSocket updates broadcasted for ${updatedOrders.length} orders`);

        } catch (error) {
            console.error('❌ Error broadcasting updates after match:', error);
        }
    }

    /**
     * Execute matching between buy and sell orders using contract's matchOrders function
     */
    async executeMatchOrders(contractAddress, buyOrderIds, sellOrderIds) {
        try {
            const normalizedContractAddress = normalizeAddress(contractAddress);
            const contract = this.exchangeContracts.get(normalizedContractAddress);

            if (!contract) {
                throw new Error(`Exchange contract not found: ${contractAddress}`);
            }

            console.log(`🎯 Executing matchOrders on contract ${contractAddress}`);
            console.log(`📝 Buy Order IDs: [${buyOrderIds.join(', ')}]`);
            console.log(`📝 Sell Order IDs: [${sellOrderIds.join(', ')}]`);


            // Call the matchOrders function on the smart contract
            const tx = await contract.matchOrders(buyOrderIds, sellOrderIds);
            console.log('📤 Transaction sent:', tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed:', receipt.hash);

            // Parse events from the receipt to get matching results
            const matchingResults = [];
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog.name === 'OrdersMatched') {
                        matchingResults.push({
                            buyOrderId: parsedLog.args.buyOrderId.toString(),
                            sellOrderId: parsedLog.args.sellOrderId.toString(),
                            buyer: parsedLog.args.buyer,
                            seller: parsedLog.args.seller,
                            amountMatched: parsedLog.args.amountMatched.toString(),
                            pricePerToken: parsedLog.args.pricePerToken.toString(),
                            fee: parsedLog.args.fee ? parsedLog.args.fee.toString() : '0'
                        });
                    }
                } catch (error) {
                    // Log that couldn't be parsed - probably from another contract
                    console.log('⚠️ Could not parse log:', log);
                }
            }

            console.log(`✅ Matching completed: ${matchingResults.length} trades executed`);

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                matchingResults
            };

        } catch (error) {
            console.error('❌ Error executing matchOrders:', error);
            throw error;
        }
    }

    /**
     * Get market buy quote - calculates best execution for buying tokens
     * @param {string} contractAddress - Exchange contract address
     * @param {number} amount - Amount of cBRL to spend
     * @param {string} userAddress - User's address to exclude their own orders (optional)
     * @returns {Object} Quote with order IDs and average price
     */
    async getMarketBuyQuote(contractAddress, amount, userAddress = null) {
        try {
            const normalizedAddress = normalizeAddress(contractAddress);
            const contract = this.exchangeContracts.get(normalizedAddress);

            if (!contract) {
                throw new Error(`Exchange contract ${contractAddress} not found`);
            }

            // Get active sell orders sorted by price (ascending)
            // Exclude user's own orders if userAddress is provided
            const whereClause = {
                exchangeContractAddress: normalizedAddress,
                orderType: 'SELL',
                status: 'ACTIVE',
                amount: { gt: 0 }
            };

            // Exclude user's own orders from market execution
            if (userAddress) {
                whereClause.userAddress = {
                    not: normalizeAddress(userAddress)
                };
            }

            const sellOrders = await this.prisma.exchangeOrder.findMany({
                where: whereClause,
                orderBy: {
                    price: 'asc' // Best prices first for buying
                }
            });

            if (sellOrders.length === 0) {
                throw new Error('No sell orders available');
            }

            const selectedOrders = [];
            let remainingBudget = amount; // amount is cBRL budget to spend
            let totalTokens = 0; // total PCN tokens we'll get

            // Get token symbols from the first order for market operations
            const tokenASymbol = sellOrders[0]?.tokenASymbol;
            const tokenBSymbol = sellOrders[0]?.tokenBSymbol;

            if (!tokenASymbol || !tokenBSymbol) {
                throw new Error('Could not determine token symbols from existing orders');
            }

            for (const order of sellOrders) {
                if (remainingBudget <= 0) break;

                const orderAmount = parseFloat(order.remainingAmount); // PCN tokens ACTUALLY available (not original amount!)
                const orderPrice = parseFloat(order.price); // cBRL per PCN

                // Calculate how many tokens we can buy with remaining budget
                const maxTokensFromBudget = remainingBudget / orderPrice;
                const tokensToTake = Math.min(maxTokensFromBudget, orderAmount);
                const costForThisOrder = tokensToTake * orderPrice;

                selectedOrders.push({
                    orderId: order.blockchainOrderId,
                    amount: tokensToTake,
                    price: orderPrice,
                    total: costForThisOrder
                });

                totalTokens += tokensToTake;
                remainingBudget -= costForThisOrder;
            }

            const totalCostSpent = amount - remainingBudget;
            const averagePrice = totalTokens > 0 ? totalCostSpent / totalTokens : 0;

            if (remainingBudget > 0.001) { // Small tolerance for floating point precision
                // We couldn't spend the full budget due to insufficient liquidity
                return {
                    success: true,
                    amount: totalTokens,
                    requestedAmount: amount, // cBRL budget requested
                    insufficientLiquidity: true,
                    availableAmount: totalTokens,
                    orderIds: selectedOrders.map(o => o.orderId),
                    selectedOrders: selectedOrders,
                    averagePrice: averagePrice,
                    totalCost: totalCostSpent,
                    estimatedGasLimit: 300000
                };
            }

            // Return quote without calling contract function (contract may not have these functions)
            const orderIds = selectedOrders.map(o => o.orderId);

            return {
                success: true,
                amount: totalTokens,
                orderIds: orderIds,
                selectedOrders: selectedOrders,
                totalCost: totalCostSpent,
                averagePrice: averagePrice,
                totalRevenue: totalCostSpent, // For consistency with sell quote
                contractQuote: {
                    totalCbrlRequired: totalCostSpent.toString(),
                    averagePricePerToken: averagePrice.toString()
                }
            };
        } catch (error) {
            console.error('❌ Error getting market buy quote:', error);
            throw error;
        }
    }

    /**
     * Get market sell quote - calculates best execution for selling tokens
     * @param {string} contractAddress - Exchange contract address
     * @param {number} amount - Amount of tokens to sell
     * @param {string} userAddress - User's address to exclude their own orders (optional)
     * @returns {Object} Quote with order IDs and average price
     */
    async getMarketSellQuote(contractAddress, amount, userAddress = null) {
        try {
            const normalizedAddress = normalizeAddress(contractAddress);
            const contract = this.exchangeContracts.get(normalizedAddress);

            if (!contract) {
                throw new Error(`Exchange contract ${contractAddress} not found`);
            }

            // Get active buy orders sorted by price (descending)
            // Exclude user's own orders if userAddress is provided
            const whereClause = {
                exchangeContractAddress: normalizedAddress,
                orderType: 'BUY',
                status: 'ACTIVE',
                amount: { gt: 0 }
            };

            // Exclude user's own orders from market execution
            if (userAddress) {
                whereClause.userAddress = {
                    not: normalizeAddress(userAddress)
                };
            }

            const orders = await this.prisma.exchangeOrder.findMany({
                where: whereClause,
                orderBy: {
                    price: 'desc' // Best prices first for selling
                }
            });

            if (orders.length === 0) {
                throw new Error('No buy orders available');
            }

            const selectedOrders = [];
            let remainingAmount = amount;
            let totalRevenue = 0;

            for (const order of orders) {
                if (remainingAmount <= 0) break;

                const orderAmount = parseFloat(order.remainingAmount); // Use remainingAmount, not original amount!
                const orderPrice = parseFloat(order.price);
                const amountToTake = Math.min(remainingAmount, orderAmount);

                selectedOrders.push({
                    orderId: order.blockchainOrderId,
                    amount: amountToTake,
                    price: orderPrice,
                    total: amountToTake * orderPrice
                });

                totalRevenue += amountToTake * orderPrice;
                remainingAmount -= amountToTake;
            }

            // Adjust amount to maximum available if insufficient liquidity
            const actualAmount = amount - remainingAmount;
            const averagePrice = actualAmount > 0 ? totalRevenue / actualAmount : 0;

            if (remainingAmount > 0) {
                // Return partial fulfillment info instead of throwing error
                return {
                    success: true,
                    amount: actualAmount,
                    requestedAmount: amount,
                    insufficientLiquidity: true,
                    availableAmount: actualAmount,
                    orderIds: selectedOrders.map(o => o.orderId),
                    selectedOrders: selectedOrders,
                    averagePrice: averagePrice,
                    totalRevenue: totalRevenue,
                    estimatedGasLimit: 300000
                };
            }

            // Return quote without calling contract function (contract may not have these functions)
            const orderIds = selectedOrders.map(o => o.orderId);

            return {
                success: true,
                amount: amount,
                orderIds: orderIds,
                selectedOrders: selectedOrders,
                totalRevenue: totalRevenue,
                totalCost: totalRevenue, // For consistency with buy quote
                averagePrice: averagePrice,
                contractQuote: {
                    totalCbrlReceived: totalRevenue.toString(),
                    averagePricePerToken: averagePrice.toString()
                }
            };
        } catch (error) {
            console.error('❌ Error getting market sell quote:', error);
            throw error;
        }
    }

    /**
     * Execute market buy order - Direct blockchain execution without creating database orders first
     * @param {string} userAddress - User's address
     * @param {string} contractAddress - Exchange contract address
     * @param {number} cBrlBudget - Amount of cBRL to spend
     * @param {Array} orderIds - Order IDs to execute against
     * @param {number} minAmountOut - Minimum amount to accept (slippage protection)
     * @returns {Object} Transaction result
     */
    async marketBuy(userAddress, contractAddress, cBrlBudget, orderIds, minAmountOut) {
        try {
            const normalizedAddress = normalizeAddress(contractAddress);
            const normalizedUserAddress = normalizeAddress(userAddress);

            // Load ABI
            const abiPath = './src/contracts/abis/default_exchange_abi.json';
            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

            // Get the sell orders to consume from blockchain directly
            console.log(`🎯 Market Buy: Getting sell orders ${orderIds.join(', ')} from blockchain...`);

            const contract = new ethers.Contract(normalizedAddress, exchangeABI, this.wallet);
            const sellOrdersData = [];

            // Get each sell order data from blockchain
            for (const orderId of orderIds) {
                try {
                    console.log(`   🔍 Fetching sell order ${orderId} from blockchain...`);
                    const orderData = await contract.sellOrders(orderId);
                    const [id, trader, amount, price, remainingAmount, isActive] = orderData;

                    console.log(`   📊 Order ${orderId} data:`, {
                        id: id.toString(),
                        trader,
                        amount: ethers.formatEther(amount),
                        price: ethers.formatEther(price),
                        remainingAmount: ethers.formatEther(remainingAmount),
                        isActive
                    });

                    if (isActive && parseFloat(ethers.formatEther(remainingAmount)) > 0.000001) {
                        console.log(`   ✅ Order ${orderId} is active and has remaining amount`);
                        sellOrdersData.push({
                            blockchainOrderId: orderId,
                            trader: trader.toLowerCase(),
                            amount: parseFloat(ethers.formatEther(amount)),
                            price: parseFloat(ethers.formatEther(price)),
                            remainingAmount: parseFloat(ethers.formatEther(remainingAmount))
                        });
                    } else {
                        console.log(`   ⚠️ Order ${orderId} is NOT active or has no remaining amount`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not get sell order ${orderId} from blockchain:`, error.message);
                }
            }

            if (sellOrdersData.length === 0) {
                throw new Error('No active sell orders available on blockchain for market buy');
            }

            // Sort by price ascending (best prices first for buying)
            sellOrdersData.sort((a, b) => a.price - b.price);

            // Calculate total tokens we can get and validate slippage
            let remainingBudget = cBrlBudget;
            let totalTokensExpected = 0;
            const ordersToExecute = [];

            for (const sellOrder of sellOrdersData) {
                if (remainingBudget <= 0.001) break;

                const orderAmount = sellOrder.remainingAmount;
                const orderPrice = sellOrder.price;
                const maxTokensFromBudget = remainingBudget / orderPrice;
                const tokensToTake = Math.min(maxTokensFromBudget, orderAmount);
                const costForThisOrder = tokensToTake * orderPrice;

                if (tokensToTake > 0.000001) {
                    totalTokensExpected += tokensToTake;
                    remainingBudget -= costForThisOrder;
                    ordersToExecute.push({
                        ...sellOrder,
                        tokensToTake,
                        costForThisOrder
                    });
                }
            }

            // Check slippage protection before executing
            if (totalTokensExpected < minAmountOut) {
                throw new Error(`Slippage protection: only ${totalTokensExpected} tokens available, minimum required: ${minAmountOut}`);
            }

            console.log(`💰 Market Buy: Will buy ${totalTokensExpected} tokens for ${cBrlBudget - remainingBudget} cBRL`);

            // Execute direct market buy against sell orders on blockchain
            const sellOrderIds = ordersToExecute.map(order => order.blockchainOrderId);

            console.log(`🚀 Executing market buy against orders: ${sellOrderIds.join(', ')}`);

            // Convert amounts to Wei
            const cBrlBudgetWei = ethers.parseEther(cBrlBudget.toString());
            const minAmountOutWei = ethers.parseEther(minAmountOut.toString());

            console.log(`💰 Calling marketBuy with:`);
            console.log(`   Buyer: ${normalizedUserAddress}`);
            console.log(`   Budget: ${cBrlBudget} cBRL (${cBrlBudgetWei.toString()} Wei)`);
            console.log(`   Sell Order IDs: [${sellOrderIds.join(', ')}]`);
            console.log(`   Min Amount Out: ${minAmountOut} PCN (${minAmountOutWei.toString()} Wei)`);

            const tx = await contract.marketBuy(
                normalizedUserAddress,
                cBrlBudgetWei,
                sellOrderIds,
                minAmountOutWei
            );

            console.log('📤 Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed:', receipt.hash);

            // Extract real executed values from blockchain events
            let actualAmountBought = 0;
            let actualCostPaid = 0;
            const actualOrdersExecuted = [];
            const matchingResults = [];

            // Parse events from the receipt
            console.log(`📋 Parsing ${receipt.logs.length} logs from marketBuy transaction...`);

            // First, capture MarketOrderExecuted summary
            let marketOrderSummary = null;

            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog) {
                        console.log(`   ✅ Event: ${parsedLog.name}`);

                        if (parsedLog.name === 'MarketOrderExecuted') {
                            // MarketOrderExecuted fields: user, isBuy, totalValue, totalTokenB, totalFee
                            marketOrderSummary = {
                                user: parsedLog.args.user,
                                isBuy: parsedLog.args.isBuy,
                                totalValue: parsedLog.args.totalValue, // Total cBRL spent
                                totalTokenB: parsedLog.args.totalTokenB, // Total PCN bought
                                totalFee: parsedLog.args.totalFee
                            };

                            console.log(`   📊 MarketOrderExecuted Summary:`);
                            console.log(`      User: ${marketOrderSummary.user}`);
                            console.log(`      IsBuy: ${marketOrderSummary.isBuy}`);
                            console.log(`      Total Value (cBRL): ${ethers.formatEther(marketOrderSummary.totalValue)}`);
                            console.log(`      Total TokenB (PCN): ${ethers.formatEther(marketOrderSummary.totalTokenB)}`);
                            console.log(`      Total Fee: ${ethers.formatEther(marketOrderSummary.totalFee)}`);

                            // Use the summary values
                            actualAmountBought = parseFloat(ethers.formatEther(marketOrderSummary.totalTokenB));
                            actualCostPaid = parseFloat(ethers.formatEther(marketOrderSummary.totalValue));
                        }

                        if (parsedLog.name === 'OrdersMatched') {
                            // OrdersMatched fields: buyOrderId, sellOrderId, buyer, seller, amountMatched, pricePerTokenB, fee
                            const match = {
                                buyOrderId: parsedLog.args.buyOrderId?.toString() || '0',
                                sellOrderId: parsedLog.args.sellOrderId?.toString(),
                                buyer: parsedLog.args.buyer,
                                seller: parsedLog.args.seller,
                                amountMatched: parsedLog.args.amountMatched,
                                pricePerToken: parsedLog.args.pricePerTokenB,
                                fee: parsedLog.args.fee
                            };

                            console.log(`   📊 OrdersMatched: Buy #${match.buyOrderId} x Sell #${match.sellOrderId}`);
                            console.log(`      Amount: ${ethers.formatEther(match.amountMatched)} PCN`);
                            console.log(`      Price: ${ethers.formatEther(match.pricePerToken)} cBRL/PCN`);

                            matchingResults.push(match);
                            if (match.sellOrderId) {
                                actualOrdersExecuted.push(match.sellOrderId);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`   ⚠️ Could not parse log:`, error.message);
                }
            }

            console.log(`✅ Market buy executed with ${matchingResults.length} matches`);

            // Calculate expected average price
            const expectedAveragePrice = cBrlBudget / totalTokensExpected;

            // Calculate actual average price from blockchain execution
            const actualAveragePrice = actualCostPaid > 0 ? actualCostPaid / actualAmountBought : expectedAveragePrice;

            // Validate slippage protection with actual values
            if (actualAmountBought < minAmountOut) {
                throw new Error(`Slippage protection failed: received ${actualAmountBought} tokens, minimum required: ${minAmountOut}`);
            }

            console.log(`🎉 Market buy completed successfully!`);
            console.log(`   Expected: ${totalTokensExpected} tokens for ${cBrlBudget} cBRL`);
            console.log(`   Actual: ${actualAmountBought} tokens for ${actualCostPaid} cBRL`);

            // After successful blockchain execution, create all database records
            const matchResult = {
                transactionHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString(),
                blockNumber: receipt.blockNumber,
                matches: matchingResults,
                matchingResults: matchingResults
            };

            await this.processMarketOrderSuccess(
                normalizedUserAddress,
                normalizedAddress,
                'BUY',
                actualAmountBought,
                actualCostPaid,
                matchResult,
                sellOrdersData,
                marketOrderSummary
            );

            return {
                success: true,
                totalAmountBought: actualAmountBought,
                totalCostPaid: actualCostPaid,
                averagePrice: actualAveragePrice,
                ordersExecuted: actualOrdersExecuted,
                transactionType: 'MARKET_BUY',
                transactionHash: receipt.hash,
                // Include estimated vs actual comparison for user feedback
                estimated: {
                    amount: totalTokensExpected,
                    cost: cBrlBudget,
                    price: expectedAveragePrice
                },
                actual: {
                    amount: actualAmountBought,
                    cost: actualCostPaid,
                    price: actualAveragePrice
                },
                // Additional information
                sellOrdersConsumed: sellOrderIds.length,
                slippageProtection: {
                    minAmountOut,
                    actualAmountOut: actualAmountBought,
                    slippagePercentage: ((actualAmountBought - minAmountOut) / minAmountOut * 100).toFixed(2)
                }
            };
        } catch (error) {
            console.error('❌ Error executing market buy:', error);
            throw error;
        }
    }

    /**
     * Execute market sell order - Direct blockchain execution without creating database orders first
     * @param {string} userAddress - User's address
     * @param {string} contractAddress - Exchange contract address
     * @param {number} tokenBAmount - Amount of tokenB to sell
     * @param {Array} orderIds - Buy order IDs to execute against
     * @param {number} minAmountOut - Minimum cBRL amount to accept (slippage protection)
     * @returns {Object} Transaction result
     */
    async marketSell(userAddress, contractAddress, tokenBAmount, orderIds, minAmountOut) {
        try {
            const normalizedAddress = normalizeAddress(contractAddress);
            const normalizedUserAddress = normalizeAddress(userAddress);

            // Get the buy orders to consume from blockchain directly
            console.log(`🎯 Market Sell: Getting buy orders ${orderIds.join(', ')} from blockchain...`);

            // Load ABI
            const abiPath = './src/contracts/abis/default_exchange_abi.json';
            const exchangeABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

            const contract = new ethers.Contract(normalizedAddress, exchangeABI, this.wallet);
            const buyOrdersData = [];

            // Get each buy order data from blockchain
            for (const orderId of orderIds) {
                try {
                    const orderData = await contract.buyOrders(orderId);
                    const [id, trader, amount, price, remainingAmount, isActive] = orderData;

                    if (isActive && parseFloat(ethers.formatEther(remainingAmount)) > 0.000001) {
                        buyOrdersData.push({
                            blockchainOrderId: orderId,
                            trader: trader.toLowerCase(),
                            amount: parseFloat(ethers.formatEther(amount)),
                            price: parseFloat(ethers.formatEther(price)),
                            remainingAmount: parseFloat(ethers.formatEther(remainingAmount))
                        });
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not get buy order ${orderId} from blockchain:`, error.message);
                }
            }

            if (buyOrdersData.length === 0) {
                throw new Error('No active buy orders available on blockchain for market sell');
            }

            // Sort by price descending (best prices first for selling)
            buyOrdersData.sort((a, b) => b.price - a.price);

            // Calculate total cBRL we can get and validate slippage
            let remainingTokens = tokenBAmount;
            let totalRevenueExpected = 0;
            const ordersToExecute = [];

            for (const buyOrder of buyOrdersData) {
                if (remainingTokens <= 0.000001) break;

                const orderAmount = buyOrder.remainingAmount;
                const orderPrice = buyOrder.price;
                const tokensToSell = Math.min(remainingTokens, orderAmount);
                const revenueFromThisOrder = tokensToSell * orderPrice;

                if (tokensToSell > 0.000001) {
                    totalRevenueExpected += revenueFromThisOrder;
                    remainingTokens -= tokensToSell;
                    ordersToExecute.push({
                        ...buyOrder,
                        tokensToSell,
                        revenueFromThisOrder
                    });
                }
            }

            // Check slippage protection before executing
            if (totalRevenueExpected < minAmountOut) {
                throw new Error(`Slippage protection: only ${totalRevenueExpected} cBRL available, minimum required: ${minAmountOut}`);
            }

            console.log(`💰 Market Sell: Will sell ${tokenBAmount - remainingTokens} tokens for ${totalRevenueExpected} cBRL`);

            // Execute direct market sell against buy orders on blockchain
            const buyOrderIds = ordersToExecute.map(order => order.blockchainOrderId);

            console.log(`🚀 Executing market sell against orders: ${buyOrderIds.join(', ')}`);

            // Convert amounts to Wei
            const tokenBAmountWei = ethers.parseEther(tokenBAmount.toString());
            const minAmountOutWei = ethers.parseEther(minAmountOut.toString());

            console.log(`💰 Calling marketSell with:`);
            console.log(`   Seller: ${normalizedUserAddress}`);
            console.log(`   Token Amount: ${tokenBAmount} PCN (${tokenBAmountWei.toString()} Wei)`);
            console.log(`   Buy Order IDs: [${buyOrderIds.join(', ')}]`);
            console.log(`   Min Amount Out: ${minAmountOut} cBRL (${minAmountOutWei.toString()} Wei)`);

            const tx = await contract.marketSell(
                normalizedUserAddress,
                tokenBAmountWei,
                buyOrderIds,
                minAmountOutWei
            );

            console.log('📤 Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed:', receipt.hash);

            // Extract real executed values from blockchain events
            let actualAmountSold = 0;
            let actualRevenueReceived = 0;
            const actualOrdersExecuted = [];
            const matchingResults = [];

            // Parse events from the receipt
            console.log(`📋 Parsing ${receipt.logs.length} logs from marketSell transaction...`);

            // First, capture MarketOrderExecuted summary
            let marketOrderSummary = null;

            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog) {
                        console.log(`   ✅ Event: ${parsedLog.name}`);

                        if (parsedLog.name === 'MarketOrderExecuted') {
                            // MarketOrderExecuted fields: user, isBuy, totalValue, totalTokenB, totalFee
                            marketOrderSummary = {
                                user: parsedLog.args.user,
                                isBuy: parsedLog.args.isBuy,
                                totalValue: parsedLog.args.totalValue, // Total cBRL received (for sell)
                                totalTokenB: parsedLog.args.totalTokenB, // Total PCN sold
                                totalFee: parsedLog.args.totalFee
                            };

                            console.log(`   📊 MarketOrderExecuted Summary:`);
                            console.log(`      User: ${marketOrderSummary.user}`);
                            console.log(`      IsBuy: ${marketOrderSummary.isBuy}`);
                            console.log(`      Total Value (cBRL): ${ethers.formatEther(marketOrderSummary.totalValue)}`);
                            console.log(`      Total TokenB (PCN): ${ethers.formatEther(marketOrderSummary.totalTokenB)}`);
                            console.log(`      Total Fee: ${ethers.formatEther(marketOrderSummary.totalFee)}`);

                            // Use the summary values
                            actualAmountSold = parseFloat(ethers.formatEther(marketOrderSummary.totalTokenB));
                            actualRevenueReceived = parseFloat(ethers.formatEther(marketOrderSummary.totalValue));
                        }

                        if (parsedLog.name === 'OrdersMatched') {
                            // OrdersMatched fields: buyOrderId, sellOrderId, buyer, seller, amountMatched, pricePerTokenB, fee
                            const match = {
                                buyOrderId: parsedLog.args.buyOrderId?.toString(),
                                sellOrderId: parsedLog.args.sellOrderId?.toString() || '0',
                                buyer: parsedLog.args.buyer,
                                seller: parsedLog.args.seller,
                                amountMatched: parsedLog.args.amountMatched,
                                pricePerToken: parsedLog.args.pricePerTokenB,
                                fee: parsedLog.args.fee
                            };

                            console.log(`   📊 OrdersMatched: Buy #${match.buyOrderId} x Sell #${match.sellOrderId}`);
                            console.log(`      Amount: ${ethers.formatEther(match.amountMatched)} PCN`);
                            console.log(`      Price: ${ethers.formatEther(match.pricePerToken)} cBRL/PCN`);

                            matchingResults.push(match);
                            if (match.buyOrderId) {
                                actualOrdersExecuted.push(match.buyOrderId);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`   ⚠️ Could not parse log:`, error.message);
                }
            }

            console.log(`✅ Market sell executed with ${matchingResults.length} matches`);

            // Calculate expected average price
            const expectedAveragePrice = totalRevenueExpected / (tokenBAmount - remainingTokens);

            // Calculate actual average price from blockchain execution
            const actualAveragePrice = actualAmountSold > 0 ? actualRevenueReceived / actualAmountSold : expectedAveragePrice;

            // Validate slippage protection with actual values
            if (actualRevenueReceived < minAmountOut) {
                throw new Error(`Slippage protection failed: received ${actualRevenueReceived} cBRL, minimum required: ${minAmountOut}`);
            }

            console.log(`🎉 Market sell completed successfully!`);
            console.log(`   Expected: ${tokenBAmount - remainingTokens} tokens for ${totalRevenueExpected} cBRL`);
            console.log(`   Actual: ${actualAmountSold} tokens for ${actualRevenueReceived} cBRL`);

            // After successful blockchain execution, create all database records
            const matchResult = {
                transactionHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString(),
                blockNumber: receipt.blockNumber,
                matches: matchingResults,
                matchingResults: matchingResults
            };

            await this.processMarketOrderSuccess(
                normalizedUserAddress,
                normalizedAddress,
                'SELL',
                actualAmountSold,
                actualRevenueReceived,
                matchResult,
                buyOrdersData,
                marketOrderSummary
            );

            return {
                success: true,
                totalAmountSold: actualAmountSold,
                totalRevenueReceived: actualRevenueReceived,
                averagePrice: actualAveragePrice,
                ordersExecuted: actualOrdersExecuted,
                transactionType: 'MARKET_SELL',
                transactionHash: receipt.hash,
                // Include estimated vs actual comparison for user feedback
                estimated: {
                    amount: tokenBAmount - remainingTokens,
                    revenue: totalRevenueExpected,
                    price: expectedAveragePrice
                },
                actual: {
                    amount: actualAmountSold,
                    revenue: actualRevenueReceived,
                    price: actualAveragePrice
                },
                // Additional information
                buyOrdersConsumed: buyOrderIds.length,
                slippageProtection: {
                    minAmountOut,
                    actualAmountOut: actualRevenueReceived,
                    slippagePercentage: ((actualRevenueReceived - minAmountOut) / minAmountOut * 100).toFixed(2)
                }
            };
        } catch (error) {
            console.error('❌ Error executing market sell:', error);
            throw error;
        }
    }

    /**
     * Cleanup resources
     */
    async disconnect() {
        try {
            // Remove all event listeners
            for (const contract of this.exchangeContracts.values()) {
                contract.removeAllListeners();
            }

            await this.prisma.$disconnect();
            console.log('✅ OrderManagementService disconnected');
        } catch (error) {
            console.error('❌ Error disconnecting OrderManagementService:', error);
        }
    }
}

module.exports = OrderManagementService;
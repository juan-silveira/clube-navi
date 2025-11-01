// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title IGaslessToken
 * @dev Interface para tokens que suportam transferências sem gás (meta-transações)
 */
interface IGaslessToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFromGasless(address from, address to, uint256 value) external;
}

/**
 * @title HybridExchange
 * @dev Contrato completo para exchange híbrida genérica entre tokenA e tokenB
 * com suporte a buy orders, sell orders, market orders e matching automático
 * 
 * CORREÇÕES APLICADAS:
 * 1. Verificação de slippage movida para APÓS execução (sobre total agregado)
 * 2. Proteção contra modificação de ordens sem execução real
 */
contract HybridExchange is AccessControl, ReentrancyGuard {

    //=========== ENUMS ===========
    
    enum OrderType { BUY, SELL }

    //=========== ESTRUTURAS ===========

    struct BuyOrder {
        uint256 id;
        address buyer;
        uint256 amountTokenB;    // Quantidade de tokenB que quer comprar (em wei)
        uint256 pricePerTokenB;  // Preço em tokenA por tokenB (em wei)
        uint256 remainingAmount; // Quantidade restante para comprar (em wei)
        bool isActive;
        uint256 createdAt;
    }

    struct SellOrder {
        uint256 id;
        address seller;
        uint256 amountTokenB;    // Quantidade de tokenB que quer vender (em wei)
        uint256 pricePerTokenB;  // Preço em tokenA por tokenB (em wei)
        uint256 remainingAmount; // Quantidade restante para vender (em wei)
        bool isActive;
        uint256 createdAt;
    }

    //=========== CONSTANTES E VARIÁVEIS DE ESTADO ===========

    bytes32 public constant ORDER_CREATOR_ROLE = keccak256("ORDER_CREATOR_ROLE");
    uint256 private constant PRECISION = 1e18;

    IGaslessToken public immutable tokenA; // Token usado para pagamento/preço
    IGaslessToken public immutable tokenB; // Token sendo negociado

    uint256 public nextBuyOrderId = 1;
    uint256 public nextSellOrderId = 1;
    
    mapping(uint256 => BuyOrder) public buyOrders;
    mapping(uint256 => SellOrder) public sellOrders;

    address public feeWallet;
    uint256 public feeBps; // Taxa em Basis Points (1 BPS = 0.01%)

    //=========== EVENTOS ===========

    event BuyOrderCreated(address indexed buyer, uint256 indexed orderId, uint256 amountTokenB, uint256 pricePerTokenB);
    event SellOrderCreated(address indexed seller, uint256 indexed orderId, uint256 amountTokenB, uint256 pricePerTokenB);
    event BuyOrderCancelled(address indexed buyer, uint256 indexed orderId);
    event SellOrderCancelled(address indexed seller, uint256 indexed orderId);
    
    event OrdersMatched(
        uint256 indexed buyOrderId,
        uint256 indexed sellOrderId,
        address indexed buyer,
        address seller,
        uint256 amountMatched,
        uint256 pricePerTokenB,
        uint256 fee
    );
    
    event MarketOrderExecuted(
        address indexed user,
        bool indexed isBuy,
        uint256 totalValue,
        uint256 totalTokenB,
        uint256 totalFee
    );
    
    event FeeUpdated(uint256 newFeeBps);
    event FeeWalletUpdated(address indexed newFeeWallet);

    //=========== CONSTRUTOR ===========

    constructor(
        address _tokenA,         // Token usado para pagamento (ex: USDC, cBRL)
        address _tokenB,         // Token sendo negociado (ex: ETH, BTC)
        address _initialFeeWallet,
        uint256 _initialFeeBps
    ) {
        require(_tokenA != address(0) && _tokenB != address(0) && _initialFeeWallet != address(0), "Enderecos invalidos");
        require(_initialFeeBps <= 1000, "Taxa muito alta"); // Max 10%
        
        tokenA = IGaslessToken(_tokenA);
        tokenB = IGaslessToken(_tokenB);
        feeWallet = _initialFeeWallet;
        feeBps = _initialFeeBps;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORDER_CREATOR_ROLE, msg.sender);
    }

    //=========== FUNÇÕES DE CRIAÇÃO DE ORDENS ===========

    /**
     * @dev Cria uma ordem de compra (usuário quer comprar tokenB com tokenA)
     */
    function createBuyOrder(
        address _buyer,
        uint256 _amountTokenB,   // Quantidade de tokenB que quer comprar (em wei)
        uint256 _pricePerTokenB  // Preço em tokenA por tokenB (em wei)
    ) external nonReentrant onlyRole(ORDER_CREATOR_ROLE) {
        require(_amountTokenB > 0, "Quantidade deve ser maior que zero");
        require(_pricePerTokenB > 0, "Preco deve ser maior que zero");

        // Calcula total de tokenA necessário
        uint256 totalTokenA = (_amountTokenB * _pricePerTokenB) / PRECISION;
        
        // Transfere tokenA do comprador para o contrato
        tokenA.transferFromGasless(_buyer, address(this), totalTokenA);

        uint256 orderId = nextBuyOrderId;
        buyOrders[orderId] = BuyOrder({
            id: orderId,
            buyer: _buyer,
            amountTokenB: _amountTokenB,
            pricePerTokenB: _pricePerTokenB,
            remainingAmount: _amountTokenB,
            isActive: true,
            createdAt: block.timestamp
        });

        nextBuyOrderId++;

        emit BuyOrderCreated(_buyer, orderId, _amountTokenB, _pricePerTokenB);
    }

    /**
     * @dev Cria uma ordem de venda (usuário quer vender tokenB por tokenA)
     */
    function createSellOrder(
        address _seller,
        uint256 _amountTokenB,   // Quantidade de tokenB que quer vender (em wei)
        uint256 _pricePerTokenB  // Preço em tokenA por tokenB (em wei)
    ) external nonReentrant onlyRole(ORDER_CREATOR_ROLE) {
        require(_amountTokenB > 0, "Quantidade deve ser maior que zero");
        require(_pricePerTokenB > 0, "Preco deve ser maior que zero");

        // Transfere tokenB do vendedor para o contrato
        tokenB.transferFromGasless(_seller, address(this), _amountTokenB);

        uint256 orderId = nextSellOrderId;
        sellOrders[orderId] = SellOrder({
            id: orderId,
            seller: _seller,
            amountTokenB: _amountTokenB,
            pricePerTokenB: _pricePerTokenB,
            remainingAmount: _amountTokenB,
            isActive: true,
            createdAt: block.timestamp
        });

        nextSellOrderId++;

        emit SellOrderCreated(_seller, orderId, _amountTokenB, _pricePerTokenB);
    }

    //=========== FUNÇÕES DE CANCELAMENTO ===========

    function cancelBuyOrder(uint256 _orderId, address _user) external nonReentrant onlyRole(ORDER_CREATOR_ROLE) {
        BuyOrder storage order = buyOrders[_orderId];
        require(order.buyer == _user, "Nao autorizado");
        require(order.isActive, "Ordem ja inativa");

        order.isActive = false;

        // Devolve tokenA não utilizado
        if (order.remainingAmount > 0) {
            uint256 tokenAToReturn = (order.remainingAmount * order.pricePerTokenB) / PRECISION;
            tokenA.transfer(order.buyer, tokenAToReturn);
        }

        emit BuyOrderCancelled(_user, _orderId);
    }

    function cancelSellOrder(uint256 _orderId, address _user) external nonReentrant onlyRole(ORDER_CREATOR_ROLE) {
        SellOrder storage order = sellOrders[_orderId];
        require(order.seller == _user, "Nao autorizado");
        require(order.isActive, "Ordem ja inativa");

        order.isActive = false;

        // Devolve tokenB não vendido
        if (order.remainingAmount > 0) {
            tokenB.transfer(order.seller, order.remainingAmount);
        }

        emit SellOrderCancelled(_user, _orderId);
    }

    //=========== FUNÇÃO DE MATCHING MANUAL ===========

    /**
     * @dev Executa matching manual entre ordens específicas
     */
    function matchOrders(
        uint256[] calldata _buyOrderIds,
        uint256[] calldata _sellOrderIds
    ) external nonReentrant onlyRole(ORDER_CREATOR_ROLE) {
        require(_buyOrderIds.length > 0 && _sellOrderIds.length > 0, "Arrays vazios");
        
        for (uint256 i = 0; i < _buyOrderIds.length; i++) {
            for (uint256 j = 0; j < _sellOrderIds.length; j++) {
                _tryMatchOrders(_buyOrderIds[i], _sellOrderIds[j]);
            }
        }
    }

    function _tryMatchOrders(uint256 _buyOrderId, uint256 _sellOrderId) internal returns (bool matched) {
        BuyOrder storage buyOrder = buyOrders[_buyOrderId];
        SellOrder storage sellOrder = sellOrders[_sellOrderId];

        // Validações básicas
        if (!buyOrder.isActive || !sellOrder.isActive ||
            buyOrder.buyer == sellOrder.seller ||
            buyOrder.remainingAmount == 0 || 
            sellOrder.remainingAmount == 0) {
            return false;
        }

        // Verifica se os preços são compatíveis (buy >= sell)
        if (buyOrder.pricePerTokenB < sellOrder.pricePerTokenB) {
            return false;
        }

        // Determina quantidade a ser matcheada
        uint256 amountToMatch = buyOrder.remainingAmount < sellOrder.remainingAmount
            ? buyOrder.remainingAmount
            : sellOrder.remainingAmount;

        // Preço de execução (preço da sell order)
        uint256 executionPrice = sellOrder.pricePerTokenB;
        uint256 totalValue = (amountToMatch * executionPrice) / PRECISION;

        // Calcula taxa
        uint256 fee = (totalValue * feeBps) / 10000;
        uint256 sellerReceives = totalValue - fee;

        // Executa transferências
        tokenB.transfer(buyOrder.buyer, amountToMatch);           // TokenB para comprador
        tokenA.transfer(sellOrder.seller, sellerReceives);       // TokenA para vendedor (menos taxa)
        
        if (fee > 0) {
            tokenA.transfer(feeWallet, fee);                     // Taxa em tokenA
        }

        // Se comprador pagou mais que o preço de execução, devolve diferença
        uint256 buyerPaid = (amountToMatch * buyOrder.pricePerTokenB) / PRECISION;
        if (buyerPaid > totalValue) {
            tokenA.transfer(buyOrder.buyer, buyerPaid - totalValue);
        }

        // Atualiza ordens
        buyOrder.remainingAmount -= amountToMatch;
        sellOrder.remainingAmount -= amountToMatch;

        if (buyOrder.remainingAmount == 0) {
            buyOrder.isActive = false;
        }
        if (sellOrder.remainingAmount == 0) {
            sellOrder.isActive = false;
        }

        emit OrdersMatched(
            _buyOrderId,
            _sellOrderId,
            buyOrder.buyer,
            sellOrder.seller,
            amountToMatch,
            executionPrice,
            fee
        );

        return true;
    }

    //=========== MARKET BUY - CORRIGIDO ===========

    /**
     * @dev Compra a mercado - usuário especifica quanto tokenA quer gastar
     * 
     * CORREÇÕES APLICADAS:
     * 1. Verificação de slippage movida para APÓS execução das ordens
     * 2. Slippage verificado sobre o TOTAL AGREGADO recebido, não por ordem individual
     */
    function marketBuy(
        address _buyer,
        uint256 _tokenAAmountToSpend,
        uint256[] calldata _sellOrderIds,
        uint256 _minTokenBAmountOut
    ) external nonReentrant onlyRole(ORDER_CREATOR_ROLE) {
        require(_tokenAAmountToSpend > 0, "Valor em tokenA deve ser maior que zero");
        require(_sellOrderIds.length > 0, "Lista de ordens vazia");
        
        // 1. Transfere tokenA do comprador
        tokenA.transferFromGasless(_buyer, address(this), _tokenAAmountToSpend);
        
        // 2. Executa a compra iterando pelas ordens
        uint256 tokenARemaining = _tokenAAmountToSpend;
        uint256 totalTokenBBought = 0;
        uint256 totalFee = 0;

        for (uint i = 0; i < _sellOrderIds.length && tokenARemaining > 0; i++) {
            (uint256 tokenBBought, uint256 tokenASpent, uint256 fee) = _processSellOrderForMarketBuy(
                _buyer,
                _sellOrderIds[i],
                tokenARemaining
            );
            
            if (tokenBBought > 0) {
                totalTokenBBought += tokenBBought;
                tokenARemaining -= tokenASpent;
                totalFee += fee;
            }
        }
        
        // 3. VERIFICAÇÃO DE SLIPPAGE - Após execução, sobre o total agregado recebido
        require(totalTokenBBought >= _minTokenBAmountOut, "Slippage: quantidade total de tokenB menor que o minimo");
        require(totalTokenBBought > 0, "Nenhum tokenB foi comprado");
        
        // 4. Transferências finais
        if (totalFee > 0) {
            tokenA.transfer(feeWallet, totalFee);
        }
        
        if (tokenARemaining > 0) {
            tokenA.transfer(_buyer, tokenARemaining);
        }
        
        tokenB.transfer(_buyer, totalTokenBBought);
        
        emit MarketOrderExecuted(_buyer, true, _tokenAAmountToSpend, totalTokenBBought, totalFee);
    }

    /**
     * @dev Processa uma sell order para market buy
     * 
     * CORREÇÃO APLICADA:
     * - Só modifica estado da ordem se realmente executou a compra (tokenBBought > 0)
     * - Retorna imediatamente se não há fundos disponíveis
     */
    function _processSellOrderForMarketBuy(
        address _buyer,
        uint256 _sellOrderId,
        uint256 _tokenAAvailable
    ) internal returns (uint256 tokenBBought, uint256 tokenASpent, uint256 fee) {
        SellOrder storage sellOrder = sellOrders[_sellOrderId];
        
        // Validações básicas
        if (!sellOrder.isActive || sellOrder.seller == _buyer || sellOrder.remainingAmount == 0) {
            return (0, 0, 0);
        }
        
        // Verifica se há tokenA disponível ANTES de calcular
        if (_tokenAAvailable == 0) {
            return (0, 0, 0);
        }
        
        uint256 tokenANeededForFullOrder = (sellOrder.remainingAmount * sellOrder.pricePerTokenB) / PRECISION;
        
        // Se não há tokenA suficiente nem para comprar uma unidade mínima, retorna
        if (_tokenAAvailable < sellOrder.pricePerTokenB / PRECISION && _tokenAAvailable < tokenANeededForFullOrder) {
            return (0, 0, 0);
        }
        
        // Determina quanto pode comprar com o tokenA disponível
        if (_tokenAAvailable >= tokenANeededForFullOrder) {
            // Pode comprar a ordem completa
            tokenBBought = sellOrder.remainingAmount;
            tokenASpent = tokenANeededForFullOrder;
        } else {
            // Compra parcial
            tokenBBought = (_tokenAAvailable * PRECISION) / sellOrder.pricePerTokenB;
            tokenASpent = (tokenBBought * sellOrder.pricePerTokenB) / PRECISION;
        }
        
        // CRÍTICO: Só processa se realmente vai comprar algo significativo
        if (tokenBBought == 0 || tokenASpent == 0) {
            return (0, 0, 0);
        }
        
        // Atualiza estado da ordem
        sellOrder.remainingAmount -= tokenBBought;
        if (sellOrder.remainingAmount == 0) {
            sellOrder.isActive = false;
        }
        
        // Calcula e transfere pagamento
        fee = (tokenASpent * feeBps) / 10000;
        uint256 amountToSeller = tokenASpent - fee;
        tokenA.transfer(sellOrder.seller, amountToSeller);
        
        return (tokenBBought, tokenASpent, fee);
    }

    //=========== MARKET SELL - CORRIGIDO ===========

    /**
     * @dev Venda a mercado - usuário especifica quanto tokenB quer vender
     * 
     * CORREÇÕES APLICADAS:
     * 1. Verificação de slippage movida para APÓS execução das ordens
     * 2. Slippage verificado sobre o TOTAL AGREGADO recebido, não por ordem individual
     */
    function marketSell(
        address _seller,
        uint256 _tokenBAmountToSell,
        uint256[] calldata _buyOrderIds,
        uint256 _minTokenAAmountOut
    ) external nonReentrant onlyRole(ORDER_CREATOR_ROLE) {
        require(_tokenBAmountToSell > 0, "Quantidade de tokenB deve ser maior que zero");
        require(_buyOrderIds.length > 0, "Lista de ordens vazia");
        
        // 1. Transfere tokenB do vendedor
        tokenB.transferFromGasless(_seller, address(this), _tokenBAmountToSell);
        
        // 2. Executa a venda iterando pelas ordens
        uint256 tokenBRemaining = _tokenBAmountToSell;
        uint256 totalTokenAReceived = 0;
        uint256 totalFee = 0;

        for (uint i = 0; i < _buyOrderIds.length && tokenBRemaining > 0; i++) {
            (uint256 tokenAReceived, uint256 tokenBSold, uint256 fee) = _processBuyOrderForMarketSell(
                _seller,
                _buyOrderIds[i],
                tokenBRemaining
            );
            
            if (tokenBSold > 0) {
                totalTokenAReceived += tokenAReceived;
                tokenBRemaining -= tokenBSold;
                totalFee += fee;
            }
        }
        
        // 3. VERIFICAÇÃO DE SLIPPAGE - Após execução, sobre o total agregado recebido
        require(totalTokenAReceived >= _minTokenAAmountOut, "Slippage: quantidade total de tokenA menor que o minimo");
        require(totalTokenAReceived > 0, "Nenhum tokenA foi recebido");
        
        // 4. Transferências finais
        if (totalFee > 0) {
            tokenA.transfer(feeWallet, totalFee);
        }
        
        if (tokenBRemaining > 0) {
            tokenB.transfer(_seller, tokenBRemaining);
        }
        
        tokenA.transfer(_seller, totalTokenAReceived);
        
        emit MarketOrderExecuted(_seller, false, totalTokenAReceived, _tokenBAmountToSell, totalFee);
    }

    /**
     * @dev Processa uma buy order para market sell
     * 
     * CORREÇÃO APLICADA:
     * - Só modifica estado da ordem se realmente executou a venda (tokenBSold > 0)
     * - Retorna imediatamente se não há tokenB disponível
     */
    function _processBuyOrderForMarketSell(
        address _seller,
        uint256 _buyOrderId,
        uint256 _tokenBAvailable
    ) internal returns (uint256 tokenAReceived, uint256 tokenBSold, uint256 fee) {
        BuyOrder storage buyOrder = buyOrders[_buyOrderId];
        
        // Validações básicas
        if (!buyOrder.isActive || buyOrder.buyer == _seller || buyOrder.remainingAmount == 0) {
            return (0, 0, 0);
        }
        
        // Verifica se há tokenB disponível ANTES de calcular
        if (_tokenBAvailable == 0) {
            return (0, 0, 0);
        }
        
        // Determina quanto pode vender
        uint256 tokenBToSell = _tokenBAvailable > buyOrder.remainingAmount 
            ? buyOrder.remainingAmount 
            : _tokenBAvailable;
        
        // Só processa se tiver algo para vender
        if (tokenBToSell > 0) {
            uint256 totalTokenAValue = (tokenBToSell * buyOrder.pricePerTokenB) / PRECISION;
            fee = (totalTokenAValue * feeBps) / 10000;
            tokenAReceived = totalTokenAValue - fee;
            tokenBSold = tokenBToSell;
            
            // Atualiza buy order
            buyOrder.remainingAmount -= tokenBToSell;
            if (buyOrder.remainingAmount == 0) {
                buyOrder.isActive = false;
            }
            
            // Transfere tokenB para o comprador
            tokenB.transfer(buyOrder.buyer, tokenBToSell);
        }
        
        return (tokenAReceived, tokenBSold, fee);
    }

    //=========== FUNÇÕES DE SIMULAÇÃO ===========

    function _simulateMarketBuy(
        uint256 _tokenAAmountToSpend,
        uint256[] calldata _sellOrderIds
    ) internal view returns (uint256 totalTokenBOut, uint256 tokenAEffectivelySpent) {
        uint256 tokenARemaining = _tokenAAmountToSpend;
        
        for (uint i = 0; i < _sellOrderIds.length && tokenARemaining > 0; i++) {
            SellOrder memory sellOrder = sellOrders[_sellOrderIds[i]];
            if (!sellOrder.isActive || sellOrder.remainingAmount == 0) continue;

            uint256 tokenANeededForFullOrder = (sellOrder.remainingAmount * sellOrder.pricePerTokenB) / PRECISION;
            uint256 tokenBToGet;
            uint256 tokenAToSpend;

            if (tokenARemaining >= tokenANeededForFullOrder) {
                tokenBToGet = sellOrder.remainingAmount;
                tokenAToSpend = tokenANeededForFullOrder;
            } else {
                tokenBToGet = (tokenARemaining * PRECISION) / sellOrder.pricePerTokenB;
                tokenAToSpend = (tokenBToGet * sellOrder.pricePerTokenB) / PRECISION;
            }
            
            totalTokenBOut += tokenBToGet;
            tokenARemaining -= tokenAToSpend;
        }

        tokenAEffectivelySpent = _tokenAAmountToSpend - tokenARemaining;
    }

    function _simulateMarketSell(
        uint256 _tokenBAmountToSell,
        uint256[] calldata _buyOrderIds
    ) internal view returns (uint256 totalTokenAOut, uint256 tokenBEffectivelySold) {
        uint256 tokenBRemaining = _tokenBAmountToSell;
        
        for (uint i = 0; i < _buyOrderIds.length && tokenBRemaining > 0; i++) {
            BuyOrder memory buyOrder = buyOrders[_buyOrderIds[i]];
            if (!buyOrder.isActive || buyOrder.remainingAmount == 0) continue;

            uint256 tokenBToSell = tokenBRemaining > buyOrder.remainingAmount 
                ? buyOrder.remainingAmount 
                : tokenBRemaining;
            
            uint256 tokenAFromThisOrder = (tokenBToSell * buyOrder.pricePerTokenB) / PRECISION;
            totalTokenAOut += tokenAFromThisOrder;
            tokenBRemaining -= tokenBToSell;
        }

        tokenBEffectivelySold = _tokenBAmountToSell - tokenBRemaining;
    }

    //=========== FUNÇÕES DE COTAÇÃO ===========

    function getMarketBuyQuote(
        uint256 _tokenAAmountToSpend,
        uint256[] calldata _sellOrderIds
    ) external view returns (
        uint256 tokenBOut,
        uint256 tokenASpent,
        uint256 averagePrice,
        uint256 priceImpact,
        uint256 estimatedFee
    ) {
        (tokenBOut, tokenASpent) = _simulateMarketBuy(_tokenAAmountToSpend, _sellOrderIds);
        
        if (tokenBOut > 0 && tokenASpent > 0) {
            averagePrice = (tokenASpent * PRECISION) / tokenBOut;
            estimatedFee = (tokenASpent * feeBps) / 10000;
            
            if (_sellOrderIds.length > 0) {
                SellOrder memory firstOrder = sellOrders[_sellOrderIds[0]];
                if (firstOrder.isActive && averagePrice > firstOrder.pricePerTokenB) {
                    priceImpact = ((averagePrice - firstOrder.pricePerTokenB) * 10000) / firstOrder.pricePerTokenB;
                }
            }
        }
    }

    function getMarketSellQuote(
        uint256 _tokenBAmountToSell,
        uint256[] calldata _buyOrderIds
    ) external view returns (
        uint256 tokenAOut,
        uint256 tokenBSold,
        uint256 averagePrice,
        uint256 priceImpact,
        uint256 estimatedFee
    ) {
        (tokenAOut, tokenBSold) = _simulateMarketSell(_tokenBAmountToSell, _buyOrderIds);
        
        if (tokenBSold > 0 && tokenAOut > 0) {
            averagePrice = (tokenAOut * PRECISION) / tokenBSold;
            estimatedFee = (tokenAOut * feeBps) / 10000;
            
            if (_buyOrderIds.length > 0) {
                BuyOrder memory firstOrder = buyOrders[_buyOrderIds[0]];
                if (firstOrder.isActive && firstOrder.pricePerTokenB > averagePrice) {
                    priceImpact = ((firstOrder.pricePerTokenB - averagePrice) * 10000) / firstOrder.pricePerTokenB;
                }
            }
        }
    }

    //=========== FUNÇÕES DE CONSULTA ===========

    // Funções para verificar se ordens estão ativas
    function isBuyOrderActive(uint256 _orderId) external view returns (bool) {
        return buyOrders[_orderId].isActive && buyOrders[_orderId].remainingAmount > 0;
    }

    function isSellOrderActive(uint256 _orderId) external view returns (bool) {
        return sellOrders[_orderId].isActive && sellOrders[_orderId].remainingAmount > 0;
    }

    // NOTA: Para listar ordens de usuários, use eventos ou indexação off-chain
    // getUserActiveBuyOrders e getUserActiveSellOrders removidas - use eventos para tracking

    //=========== FUNÇÕES ADMINISTRATIVAS ===========

    function setFee(uint256 _newFeeBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newFeeBps <= 1000, "Taxa nao pode exceder 10%");
        feeBps = _newFeeBps;
        emit FeeUpdated(_newFeeBps);
    }

    function setFeeWallet(address _newFeeWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newFeeWallet != address(0), "Endereco invalido");
        feeWallet = _newFeeWallet;
        emit FeeWalletUpdated(_newFeeWallet);
    }
}
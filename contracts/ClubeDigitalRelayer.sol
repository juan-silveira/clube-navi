// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title IClube DigitalTrade
 * @dev Interface para o token cBRL (Clube DigitalTrade) com transferFromGasless
 */
interface IClube DigitalTrade is IERC20 {
    function transferFromGasless(address from, address to, uint256 value) external;
}

/**
 * @title ClubeDigitalRelayer
 * @dev Contrato relayer para distribuição atômica de cashback do Clube Digital
 * @notice Este contrato processa pagamentos em cBRL e distribui automaticamente
 *         entre merchant, consumidor, plataforma e referrers
 * @notice Usa transferFromGasless do cBRL para transferência sem approve (gasless)
 * @notice O contrato deve ter TRANSFER_ROLE no token cBRL
 */
contract ClubeDigitalRelayer is ReentrancyGuard, Pausable {

    // Token cBRL (Clube Real) com transferFromGasless
    IClube DigitalTrade public immutable cBRLToken;

    // Endereço da plataforma para receber taxas
    address public platformAddress;

    // Mapping de administradores autorizados
    mapping(address => bool) public isAdmin;

    /**
     * @dev Estrutura contendo todos os dados de uma distribuição de pagamento
     * @param consumer Endereço do consumidor que está pagando
     * @param merchant Endereço do lojista que receberá o pagamento
     * @param platform Endereço da plataforma (taxa)
     * @param consumerReferrer Endereço de quem indicou o consumidor
     * @param merchantReferrer Endereço de quem indicou o lojista
     * @param totalAmount Valor total da compra em cBRL (wei)
     * @param merchantAmount Valor que vai para o merchant (80%)
     * @param consumerCashback Cashback do consumidor (10%)
     * @param platformFee Taxa da plataforma (5%)
     * @param consumerReferrerFee Taxa do referrer do consumidor (2.5%)
     * @param merchantReferrerFee Taxa do referrer do merchant (2.5%)
     */
    struct Distribution {
        address consumer;
        address merchant;
        address platform;
        address consumerReferrer;
        address merchantReferrer;
        uint256 totalAmount;
        uint256 merchantAmount;
        uint256 consumerCashback;
        uint256 platformFee;
        uint256 consumerReferrerFee;
        uint256 merchantReferrerFee;
    }

    // Eventos
    event PaymentProcessed(
        address indexed consumer,
        address indexed merchant,
        uint256 totalAmount,
        uint256 merchantAmount,
        uint256 consumerCashback,
        uint256 platformFee,
        uint256 consumerReferrerFee,
        uint256 merchantReferrerFee,
        uint256 timestamp
    );

    event PlatformAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    // Modifier para funções administrativas
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can call this function");
        _;
    }

    /**
     * @dev Constructor do contrato
     * @param _cBRLToken Endereço do token cBRL (Clube DigitalTrade)
     * @param _platformAddress Endereço da carteira da plataforma
     * @param _initialAdmin Endereço do primeiro administrador
     *
     * IMPORTANTE: Após o deploy, é necessário conceder TRANSFER_ROLE ao contrato no token cBRL:
     * cBRLToken.grantRole(TRANSFER_ROLE, address(ClubeDigitalRelayer))
     */
    constructor(
        address _cBRLToken,
        address _platformAddress,
        address _initialAdmin
    ) {
        require(_cBRLToken != address(0), "Invalid cBRL token address");
        require(_platformAddress != address(0), "Invalid platform address");
        require(_initialAdmin != address(0), "Invalid admin address");

        cBRLToken = IClube DigitalTrade(_cBRLToken);
        platformAddress = _platformAddress;
        isAdmin[_initialAdmin] = true;

        emit AdminAdded(_initialAdmin);
    }

    /**
     * @dev Processa um pagamento e distribui automaticamente para todos os participantes
     * @param dist Estrutura contendo todos os endereços e valores da distribuição
     *
     * Requisitos:
     * - Apenas o consumidor pode executar (msg.sender == dist.consumer)
     * - Todos os endereços devem ser válidos (não zero)
     * - A soma das distribuições deve ser igual ao totalAmount
     * - Contrato não pode estar pausado
     * - Contrato deve ter TRANSFER_ROLE no token cBRL
     *
     * Nota: Não precisa de approve! O transferFromGasless permite transferência direta.
     */
    function processPayment(Distribution calldata dist)
        external
        nonReentrant
        whenNotPaused
    {
        _processPaymentInternal(dist);
    }


    /**
     * @dev Versão interna do processamento de pagamento
     * @param dist Estrutura contendo todos os endereços e valores da distribuição
     *
     * Usa transferFromGasless do cBRL para transferência sem approve
     */
    function _processPaymentInternal(Distribution calldata dist) internal {
        // Validação 1: Apenas o consumidor pode pagar
        require(msg.sender == dist.consumer, "Only consumer can pay");

        // Validação 2: Endereços válidos
        require(dist.consumer != address(0), "Invalid consumer address");
        require(dist.merchant != address(0), "Invalid merchant address");
        require(dist.platform != address(0), "Invalid platform address");
        require(dist.consumerReferrer != address(0), "Invalid consumer referrer address");
        require(dist.merchantReferrer != address(0), "Invalid merchant referrer address");

        // Validação 3: Endereços únicos
        require(dist.consumer != dist.merchant, "Consumer and merchant must be different");
        require(dist.merchant != dist.platform, "Merchant and platform must be different");
        require(dist.consumer != dist.consumerReferrer, "Consumer cannot refer themselves");
        require(dist.merchant != dist.merchantReferrer, "Merchant cannot refer themselves");

        // Validação 4: Valores devem ser maiores que zero
        require(dist.totalAmount > 0, "Total amount must be greater than zero");
        require(dist.merchantAmount > 0, "Merchant amount must be greater than zero");

        // Validação 5: Soma das distribuições deve ser igual ao total
        uint256 calculatedTotal = dist.merchantAmount +
                                  dist.consumerCashback +
                                  dist.platformFee +
                                  dist.consumerReferrerFee +
                                  dist.merchantReferrerFee;

        require(calculatedTotal == dist.totalAmount, "Invalid distribution amounts");

        // Validação 6: Platform address deve corresponder ao registrado
        require(dist.platform == platformAddress, "Platform address mismatch");

        // Validação 7: Consumidor tem saldo suficiente
        require(
            cBRLToken.balanceOf(dist.consumer) >= dist.totalAmount,
            "Insufficient cBRL balance"
        );

        // Distribuição atômica usando transferFromGasless (sem approve necessário!)
        // Se qualquer transferência falhar, toda a transação é revertida

        // 1. Merchant recebe 80%
        cBRLToken.transferFromGasless(dist.consumer, dist.merchant, dist.merchantAmount);

        // 2. Consumer recebe 10% de cashback
        cBRLToken.transferFromGasless(dist.consumer, dist.consumer, dist.consumerCashback);

        // 3. Platform recebe 5%
        cBRLToken.transferFromGasless(dist.consumer, dist.platform, dist.platformFee);

        // 4. Referrer do consumer recebe 2.5%
        cBRLToken.transferFromGasless(dist.consumer, dist.consumerReferrer, dist.consumerReferrerFee);

        // 5. Referrer do merchant recebe 2.5%
        cBRLToken.transferFromGasless(dist.consumer, dist.merchantReferrer, dist.merchantReferrerFee);

        // Emitir evento de pagamento processado
        emit PaymentProcessed(
            dist.consumer,
            dist.merchant,
            dist.totalAmount,
            dist.merchantAmount,
            dist.consumerCashback,
            dist.platformFee,
            dist.consumerReferrerFee,
            dist.merchantReferrerFee,
            block.timestamp
        );
    }

    /**
     * @dev Adiciona um novo administrador
     * @param _admin Endereço do novo administrador
     *
     * Apenas administradores existentes podem adicionar novos administradores
     */
    function addAdmin(address _admin) external onlyAdmin {
        require(_admin != address(0), "Invalid admin address");
        require(!isAdmin[_admin], "Already an admin");

        isAdmin[_admin] = true;
        emit AdminAdded(_admin);
    }

    /**
     * @dev Remove um administrador
     * @param _admin Endereço do administrador a ser removido
     *
     * Apenas administradores existentes podem remover administradores
     */
    function removeAdmin(address _admin) external onlyAdmin {
        require(_admin != address(0), "Invalid admin address");
        require(isAdmin[_admin], "Not an admin");
        require(_admin != msg.sender, "Cannot remove yourself");

        isAdmin[_admin] = false;
        emit AdminRemoved(_admin);
    }

    /**
     * @dev Atualiza o endereço da plataforma
     * @param _newPlatformAddress Novo endereço da plataforma
     *
     * Apenas administradores podem executar esta função
     */
    function updatePlatformAddress(address _newPlatformAddress)
        external
        onlyAdmin
    {
        require(_newPlatformAddress != address(0), "Invalid platform address");
        require(_newPlatformAddress != platformAddress, "Same address");

        address oldAddress = platformAddress;
        platformAddress = _newPlatformAddress;

        emit PlatformAddressUpdated(oldAddress, _newPlatformAddress);
    }

    /**
     * @dev Pausa o contrato em caso de emergência
     *
     * Apenas administradores podem executar esta função
     * Quando pausado, nenhum pagamento pode ser processado
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Despausa o contrato
     *
     * Apenas administradores podem executar esta função
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @dev Função de emergência para recuperar tokens enviados acidentalmente
     * @param token Endereço do token a ser recuperado
     * @param amount Quantidade a ser recuperada
     * @param recipient Endereço que receberá os tokens
     *
     * Apenas administradores podem executar esta função
     * IMPORTANTE: Esta função NÃO deve ser usada em operações normais
     */
    function emergencyWithdraw(address token, uint256 amount, address recipient)
        external
        onlyAdmin
    {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than zero");
        require(recipient != address(0), "Invalid recipient address");

        IERC20(token).transfer(recipient, amount);
    }

    /**
     * @dev Verifica o saldo de cBRL do contrato
     * @return Saldo atual de cBRL no contrato
     */
    function getContractBalance() external view returns (uint256) {
        return cBRLToken.balanceOf(address(this));
    }
}

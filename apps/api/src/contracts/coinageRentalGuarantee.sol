// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PratiqueCoin Interface
 * @dev Interface para incluir a função de transferência sem gás.
 */
interface PratiqueCoin is IERC20 {
    function transferFromGasless(address from, address to, uint256 value) external;
}

/**
 * @title RentalGuaranteeManager
 * @dev Contrato para gerenciar múltiplos contratos de garantia de locação de imóveis.
 *
 * Funcionalidades principais:
 * - Criação de contratos de garantia com valor fixo
 * - Sistema de whitelist por contrato
 * - Aprovação dupla (landlord + club) para unstake
 * - Multa por unstake antecipado
 * - Gestão centralizada de múltiplos contratos
 */
contract RentalGuaranteeManager is AccessControl, ReentrancyGuard {

    // ========== ESTRUTURAS ==========

    /**
     * @dev Estrutura que representa um contrato de garantia de locação
     */
    struct RentalContract {
        uint256 id;
        address landlord;           // Proprietário/criador do contrato
        address club;             // Inquilino (quem fez o stake)
        uint256 exactStakeAmount;   // Valor exato requerido para stake
        uint256 endDate;            // Data de encerramento do contrato (timestamp)
        uint256 penaltyAmount;      // Valor de multa para unstake antecipado
        uint256 stakedAmount;       // Valor efetivamente depositado
        uint256 pendingReward;      // Recompensa pendente acumulada
        uint256 stakeTimestamp;     // Timestamp de quando o stake foi depositado
        bool isActive;              // Contrato está ativo?
        bool hasStake;              // Já possui stake?
        bool landlordApproval;      // Proprietário aprovou unstake?
        bool clubApproval;        // Inquilino aprovou unstake?
        uint256 createdAt;          // Timestamp de criação
    }

    // ========== VARIÁVEIS DE ESTADO ==========

    PratiqueCoin public guaranteeToken;  // Token usado para garantia e recompensas (mesmo token)

    uint256 public nextContractId = 1;
    mapping(uint256 => RentalContract) public rentalContracts;

    uint256[] private activeContractIds;  // Lista de IDs de contratos ativos
    mapping(uint256 => uint256) private activeContractIndex;  // contractId => index no array
    mapping(uint256 => bool) private isInActiveList;  // contractId => está na lista?

    // Variáveis do sistema de recompensas
    uint256 private _rewardReserveBalance;      // Saldo de recompensas no cofre
    uint256 private _totalRewardDistributed;    // Total de recompensas já distribuídas
    uint256 private _totalSupply;               // Total de stake ativo em todos os contratos
    uint256 public cycleDurationInDays;         // Duração do ciclo de recompensas em dias
    uint256 public cycleStartTime;              // Timestamp de início do ciclo atual

    uint256 private constant PERCENTAGE_PRECISION = 10000; // Para 2 casas decimais (1% = 100)

    // ========== EVENTOS ==========

    event RentalContractCreated(
        uint256 indexed contractId,
        address indexed landlord,
        address indexed club,
        uint256 exactStakeAmount,
        uint256 endDate,
        uint256 penaltyAmount
    );

    event StakeDeposited(
        uint256 indexed contractId,
        address indexed club,
        uint256 amount
    );

    event UnstakeRequested(
        uint256 indexed contractId,
        address indexed requester
    );

    event ApprovalGranted(
        uint256 indexed contractId,
        address indexed approver,
        bool isLandlord
    );

    event ApprovalRevoked(
        uint256 indexed contractId,
        address indexed revoker,
        bool isLandlord
    );

    event UnstakeExecuted(
        uint256 indexed contractId,
        address indexed recipient,
        uint256 amount,
        bool hadPenalty,
        uint256 penaltyAmount
    );

    event UnstakeAdminExecuted(
        uint256 indexed contractId,
        address indexed recipient,
        uint256 amount,
        bool hadPenalty,
        uint256 penaltyAmount
    );

    event RentalContractCancelled(
        uint256 indexed contractId,
        address indexed canceller
    );

    event ContractExtended(
        uint256 indexed contractId,
        uint256 newEndDate
    );

    event RewardDeposited(
        uint256 amount,
        uint256 totalReserve
    );

    event RewardDistributed(
        uint256 totalDistributed,
        uint256 contractsCount
    );

    event RewardClaimed(
        uint256 indexed contractId,
        address indexed recipient,
        uint256 amount
    );

    event RewardTokensWithdrawn(
        address indexed admin,
        uint256 amount
    );

    event CycleDurationUpdated(
        uint256 newDurationInDays
    );

    event CycleStartTimeUpdated(
        uint256 newStartTime
    );

    // ========== CONSTRUTOR ==========

    constructor(
        address _guaranteeToken,
        uint256 _initialCycleStartTime,
        uint256 _cycleDurationInDays
    ) {
        require(_guaranteeToken != address(0), "Token invalido");
        guaranteeToken = PratiqueCoin(_guaranteeToken);

        // Configuração do sistema de recompensas
        cycleDurationInDays = _cycleDurationInDays > 0 ? _cycleDurationInDays : 90; // Padrão 90 dias
        cycleStartTime = _initialCycleStartTime > 0 ? _initialCycleStartTime : block.timestamp;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ========== FUNÇÕES DE CRIAÇÃO E CONFIGURAÇÃO ==========

    /**
     * @dev Cria um novo contrato de garantia de locação
     * @param _landlord Endereço do proprietário
     * @param _club Endereço do inquilino (quem fará o stake)
     * @param _exactStakeAmount Valor exato requerido para stake
     * @param _endDate Data de encerramento (timestamp)
     * @param _penaltyAmount Valor de multa para unstake antecipado
     */
    function createRentalContract(
        address _landlord,
        address _club,
        uint256 _exactStakeAmount,
        uint256 _endDate,
        uint256 _penaltyAmount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(_landlord != address(0), "Landlord invalido");
        require(_club != address(0), "Tenant invalido");
        require(_club != _landlord, "Tenant nao pode ser o landlord");
        require(_exactStakeAmount > 0, "Stake amount deve ser maior que zero");
        require(_endDate > block.timestamp, "Data de encerramento deve ser futura");
        require(_penaltyAmount <= _exactStakeAmount, "Multa nao pode exceder valor do stake");

        uint256 contractId = nextContractId;
        nextContractId++;

        rentalContracts[contractId] = RentalContract({
            id: contractId,
            landlord: _landlord,
            club: _club,
            exactStakeAmount: _exactStakeAmount,
            endDate: _endDate,
            penaltyAmount: _penaltyAmount,
            stakedAmount: 0,
            pendingReward: 0,
            stakeTimestamp: 0,
            isActive: true,
            hasStake: false,
            landlordApproval: false,
            clubApproval: false,
            createdAt: block.timestamp
        });

        // Adiciona à lista de contratos ativos
        _addToActiveList(contractId);

        emit RentalContractCreated(contractId, _landlord, _club, _exactStakeAmount, _endDate, _penaltyAmount);
        return contractId;
    }

    // ========== FUNÇÕES DE STAKE ==========

    /**
     * @dev Deposita stake/garantia em um contrato de locação
     * @param _caller Endereço que está chamando (deve ser o club do contrato)
     * @param _contractId ID do contrato
     */
    function stake(address _caller, uint256 _contractId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        RentalContract storage rental = rentalContracts[_contractId];

        require(rental.isActive, "Contrato nao existe ou inativo");
        require(!rental.hasStake, "Contrato ja possui stake");
        require(block.timestamp < rental.endDate, "Contrato ja expirou");
        require(_caller == rental.club, "Apenas o club definido pode fazer stake");

        // Transfere o valor EXATO
        guaranteeToken.transferFromGasless(_caller, address(this), rental.exactStakeAmount);

        rental.stakedAmount = rental.exactStakeAmount;
        rental.hasStake = true;
        rental.stakeTimestamp = block.timestamp;

        // Atualiza o total supply global
        _totalSupply += rental.exactStakeAmount;

        emit StakeDeposited(_contractId, rental.club, rental.exactStakeAmount);
    }

    // ========== FUNÇÕES DE APROVAÇÃO PARA UNSTAKE ==========

    /**
     * @dev Landlord aprova o unstake
     */
    function approveLandlordUnstake(uint256 _contractId, address _caller)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        RentalContract storage rental = rentalContracts[_contractId];
        require(rental.isActive, "Contrato nao existe ou inativo");
        require(rental.hasStake, "Contrato nao possui stake");
        require(_caller == rental.landlord, "Apenas landlord pode aprovar");

        rental.landlordApproval = true;
        emit ApprovalGranted(_contractId, rental.landlord, true);
    }

    /**
     * @dev Tenant aprova o unstake
     */
    function approveTenantUnstake(uint256 _contractId, address _caller)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        RentalContract storage rental = rentalContracts[_contractId];
        require(rental.isActive, "Contrato nao existe ou inativo");
        require(rental.hasStake, "Contrato nao possui stake");
        require(_caller == rental.club, "Apenas club pode aprovar");

        rental.clubApproval = true;
        emit ApprovalGranted(_contractId, rental.club, false);
    }

    /**
     * @dev Revoga aprovação do landlord
     */
    function revokeLandlordApproval(uint256 _contractId, address _caller)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        RentalContract storage rental = rentalContracts[_contractId];
        require(rental.isActive, "Contrato nao existe ou inativo");
        require(_caller == rental.landlord, "Apenas landlord pode revogar");

        rental.landlordApproval = false;
        emit ApprovalRevoked(_contractId, rental.landlord, true);
    }

    /**
     * @dev Revoga aprovação do club
     */
    function revokeTenantApproval(uint256 _contractId, address _caller)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        RentalContract storage rental = rentalContracts[_contractId];
        require(rental.isActive, "Contrato nao existe ou inativo");
        require(_caller == rental.club, "Apenas club pode revogar");

        rental.clubApproval = false;
        emit ApprovalRevoked(_contractId, rental.club, false);
    }

    // ========== FUNÇÕES DE UNSTAKE ==========

    /**
     * @dev Executa unstake quando ambas as partes aprovaram
     * @param _contractId ID do contrato
     * @param _recipient Endereço que receberá os tokens
     */
    function unstake(uint256 _contractId, address _recipient)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        RentalContract storage rental = rentalContracts[_contractId];

        require(rental.isActive, "Contrato nao existe ou inativo");
        require(rental.hasStake, "Contrato nao possui stake");
        require(_recipient != address(0), "Recipient invalido");
        require(rental.landlordApproval, "Falta aprovacao do landlord");
        require(rental.clubApproval, "Falta aprovacao do club");

        uint256 amountToTransfer = rental.stakedAmount;
        bool hadPenalty = false;
        uint256 penaltyApplied = 0;

        // Verifica se é unstake antecipado (antes da data de encerramento)
        if (block.timestamp < rental.endDate) {
            // Aplica multa
            penaltyApplied = rental.penaltyAmount;
            amountToTransfer = rental.stakedAmount - penaltyApplied;
            hadPenalty = true;

            // Transfere multa para o landlord
            if (penaltyApplied > 0) {
                guaranteeToken.transfer(rental.landlord, penaltyApplied);
            }
        }

        // Adiciona recompensas pendentes ao valor final
        uint256 rewardAmount = rental.pendingReward;
        uint256 totalAmount = amountToTransfer + rewardAmount;

        // Transfere valor total (stake + recompensas - multa se houver) para o recipient
        if (totalAmount > 0) {
            guaranteeToken.transfer(_recipient, totalAmount);
        }

        // Atualiza o total supply global
        _totalSupply -= rental.stakedAmount;

        // Marca contrato como inativo
        rental.isActive = false;
        rental.hasStake = false;
        rental.pendingReward = 0;
        _removeFromActiveList(_contractId);

        emit UnstakeExecuted(_contractId, _recipient, totalAmount, hadPenalty, penaltyApplied);
        if (rewardAmount > 0) {
            emit RewardClaimed(_contractId, _recipient, rewardAmount);
        }
    }

    /**
     * @dev Unstake executado por admin sem necessidade de aprovações
     * Útil para resolver deadlocks ou situações de disputa
     * @param _contractId ID do contrato
     * @param _recipient Endereço que receberá os tokens
     */
    function unstakeAdmin(uint256 _contractId, address _recipient)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        RentalContract storage rental = rentalContracts[_contractId];

        require(rental.isActive, "Contrato nao existe ou inativo");
        require(rental.hasStake, "Contrato nao possui stake");
        require(_recipient != address(0), "Recipient invalido");

        uint256 amountToTransfer = rental.stakedAmount;
        bool hadPenalty = false;
        uint256 penaltyApplied = 0;

        // Verifica se é unstake antecipado (antes da data de encerramento)
        if (block.timestamp < rental.endDate) {
            // Aplica multa
            penaltyApplied = rental.penaltyAmount;
            amountToTransfer = rental.stakedAmount - penaltyApplied;
            hadPenalty = true;

            // Transfere multa para o landlord
            if (penaltyApplied > 0) {
                guaranteeToken.transfer(rental.landlord, penaltyApplied);
            }
        }

        // Adiciona recompensas pendentes ao valor final
        uint256 rewardAmount = rental.pendingReward;
        uint256 totalAmount = amountToTransfer + rewardAmount;

        // Transfere valor total (stake + recompensas - multa se houver) para o recipient
        if (totalAmount > 0) {
            guaranteeToken.transfer(_recipient, totalAmount);
        }

        // Atualiza o total supply global
        _totalSupply -= rental.stakedAmount;

        // Marca contrato como inativo
        rental.isActive = false;
        rental.hasStake = false;
        rental.pendingReward = 0;
        _removeFromActiveList(_contractId);

        emit UnstakeAdminExecuted(_contractId, _recipient, totalAmount, hadPenalty, penaltyApplied);
        if (rewardAmount > 0) {
            emit RewardClaimed(_contractId, _recipient, rewardAmount);
        }
    }

    /**
     * @dev Cancela um contrato sem stake (apenas antes de ter stake)
     */
    function cancelRentalContract(uint256 _contractId, address _caller)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        RentalContract storage rental = rentalContracts[_contractId];
        require(rental.isActive, "Contrato nao existe ou inativo");
        require(!rental.hasStake, "Nao pode cancelar contrato com stake ativo");
        require(_caller == rental.landlord, "Apenas landlord pode cancelar");

        rental.isActive = false;
        _removeFromActiveList(_contractId);

        emit RentalContractCancelled(_contractId, _caller);
    }

    /**
     * @dev Estende a data de encerramento de um contrato
     */
    function extendContract(uint256 _contractId, uint256 _newEndDate, address _caller)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        RentalContract storage rental = rentalContracts[_contractId];
        require(rental.isActive, "Contrato nao existe ou inativo");
        require(_caller == rental.landlord, "Apenas landlord pode estender");
        require(_newEndDate > rental.endDate, "Nova data deve ser posterior a atual");
        require(_newEndDate > block.timestamp, "Nova data deve ser futura");

        rental.endDate = _newEndDate;
        emit ContractExtended(_contractId, _newEndDate);
    }

    // ========== FUNÇÕES DE RECOMPENSA ==========

    /**
     * @dev Deposita tokens no cofre de recompensas
     * @param _amount Quantidade de tokens a depositar
     */
    function depositRewards(uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_amount > 0, "Amount deve ser maior que zero");
        guaranteeToken.transferFromGasless(msg.sender, address(this), _amount);
        _rewardReserveBalance += _amount;
        emit RewardDeposited(_amount, _rewardReserveBalance);
    }

    /**
     * @dev Função auxiliar para calcular recompensa de um contrato específico
     */
    function _calculateContractReward(
        uint256 _contractId,
        uint256 _distributionTime,
        uint256 _percentageInBasisPoints,
        uint256 _cycleDurationInSeconds
    ) internal view returns (uint256 rewardForCycle) {
        RentalContract storage rental = rentalContracts[_contractId];

        if (!rental.hasStake || rental.stakedAmount == 0) {
            return 0;
        }

        // Determina o início efetivo do stake para este ciclo
        uint256 stakeEffectiveStart = rental.stakeTimestamp > cycleStartTime
            ? rental.stakeTimestamp
            : cycleStartTime;

        // Se o stake foi feito após a distribuição, não recebe recompensa neste ciclo
        if (_distributionTime <= stakeEffectiveStart) {
            return 0;
        }

        uint256 timeStaked = _distributionTime - stakeEffectiveStart;

        // Calcula recompensa proporcional ao tempo e percentual
        rewardForCycle = (rental.stakedAmount * _percentageInBasisPoints * timeStaked) /
                         (PERCENTAGE_PRECISION * _cycleDurationInSeconds);

        return rewardForCycle;
    }

    /**
     * @dev Distribui recompensas para TODOS os contratos ativos com stake
     * @param _percentageInBasisPoints Percentual anual em basis points (ex: 5.40% = 540)
     */
    function distributeReward(uint256 _percentageInBasisPoints)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_percentageInBasisPoints > 0, "Percentual deve ser maior que zero");
        require(activeContractIds.length > 0, "Nenhum contrato ativo");

        uint256 distributionTime = block.timestamp;
        uint256 cycleDurationInSeconds = cycleDurationInDays * 1 days;
        require(cycleDurationInSeconds > 0, "Duracao do ciclo deve ser positiva");

        uint256 totalCalculatedReward = 0;
        uint256 contractsWithReward = 0;

        // Loop 1: Calcular total de recompensas necessárias
        for (uint256 i = 0; i < activeContractIds.length; i++) {
            uint256 contractId = activeContractIds[i];
            if (rentalContracts[contractId].hasStake) {
                uint256 contractReward = _calculateContractReward(
                    contractId,
                    distributionTime,
                    _percentageInBasisPoints,
                    cycleDurationInSeconds
                );
                totalCalculatedReward += contractReward;
                if (contractReward > 0) {
                    contractsWithReward++;
                }
            }
        }

        require(totalCalculatedReward <= _rewardReserveBalance, "Saldo insuficiente no cofre");

        // Loop 2: Distribuir efetivamente
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < activeContractIds.length; i++) {
            uint256 contractId = activeContractIds[i];
            RentalContract storage rental = rentalContracts[contractId];

            if (!rental.hasStake) continue;

            uint256 contractReward = _calculateContractReward(
                contractId,
                distributionTime,
                _percentageInBasisPoints,
                cycleDurationInSeconds
            );

            if (contractReward > 0) {
                rental.pendingReward += contractReward;
                totalDistributed += contractReward;

                // Atualiza o timestamp do stake para o momento da distribuição
                rental.stakeTimestamp = distributionTime;
            }
        }

        // Atualiza variáveis globais
        _rewardReserveBalance -= totalDistributed;
        _totalRewardDistributed += totalDistributed;
        cycleStartTime = distributionTime;

        emit RewardDistributed(totalDistributed, contractsWithReward);
    }

    /**
     * @dev Permite que club resgate apenas as recompensas sem fazer unstake
     * @param _contractId ID do contrato
     */
    function claimReward(uint256 _contractId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        RentalContract storage rental = rentalContracts[_contractId];

        require(rental.isActive, "Contrato nao ativo");
        require(rental.hasStake, "Contrato nao possui stake");

        uint256 reward = rental.pendingReward;
        require(reward > 0, "Nenhuma recompensa pendente");

        rental.pendingReward = 0;
        guaranteeToken.transfer(rental.club, reward);

        emit RewardClaimed(_contractId, rental.club, reward);
    }

    /**
     * @dev Admin pode retirar tokens do cofre de recompensas
     * @param _amount Quantidade a retirar
     */
    function withdrawRewardTokens(uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        require(_amount > 0, "Amount deve ser maior que zero");
        require(_amount <= _rewardReserveBalance, "Amount excede saldo disponivel");

        _rewardReserveBalance -= _amount;
        guaranteeToken.transfer(msg.sender, _amount);

        emit RewardTokensWithdrawn(msg.sender, _amount);
    }

    /**
     * @dev Define a duração do ciclo de recompensas em dias
     */
    function setCycleDuration(uint256 _newDurationInDays)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newDurationInDays > 0, "Duracao deve ser positiva");
        cycleDurationInDays = _newDurationInDays;
        emit CycleDurationUpdated(_newDurationInDays);
    }

    /**
     * @dev Atualiza o timestamp de início do ciclo atual de recompensas
     */
    function updateCycleStartTime(uint256 _newStartTime)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_newStartTime > 0, "Start time deve ser positivo");
        require(_newStartTime <= block.timestamp, "Start time nao pode ser futuro");
        cycleStartTime = _newStartTime;
        emit CycleStartTimeUpdated(_newStartTime);
    }

    // ========== FUNÇÕES DE CONSULTA (VIEW) ==========

    /**
     * @dev Retorna todos os IDs de contratos ativos
     */
    function getActiveContractIds() external view returns (uint256[] memory) {
        return activeContractIds;
    }

    /**
     * @dev Retorna informações completas de um contrato
     */
    function getRentalContract(uint256 _contractId)
        external
        view
        returns (RentalContract memory)
    {
        return rentalContracts[_contractId];
    }

    /**
     * @dev Verifica se um contrato está pronto para unstake
     */
    function canExecuteUnstake(uint256 _contractId)
        external
        view
        returns (bool)
    {
        RentalContract memory rental = rentalContracts[_contractId];
        return rental.isActive &&
               rental.hasStake &&
               rental.landlordApproval &&
               rental.clubApproval;
    }

    /**
     * @dev Retorna status de aprovações de um contrato
     */
    function getApprovalStatus(uint256 _contractId)
        external
        view
        returns (bool landlordApproval, bool clubApproval)
    {
        RentalContract memory rental = rentalContracts[_contractId];
        return (rental.landlordApproval, rental.clubApproval);
    }

    /**
     * @dev Retorna contratos onde um endereço é landlord
     */
    function getContractsByLandlord(address _landlord)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < activeContractIds.length; i++) {
            if (rentalContracts[activeContractIds[i]].landlord == _landlord) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeContractIds.length; i++) {
            if (rentalContracts[activeContractIds[i]].landlord == _landlord) {
                result[index] = activeContractIds[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Retorna contratos onde um endereço é club
     */
    function getContractsByTenant(address _club)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < activeContractIds.length; i++) {
            if (rentalContracts[activeContractIds[i]].club == _club) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeContractIds.length; i++) {
            if (rentalContracts[activeContractIds[i]].club == _club) {
                result[index] = activeContractIds[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Calcula a penalidade atual se unstake fosse feito agora
     */
    function calculateCurrentPenalty(uint256 _contractId)
        external
        view
        returns (uint256 penalty, bool wouldHavePenalty)
    {
        RentalContract memory rental = rentalContracts[_contractId];

        if (block.timestamp < rental.endDate) {
            return (rental.penaltyAmount, true);
        } else {
            return (0, false);
        }
    }

    /**
     * @dev Retorna número total de contratos ativos
     */
    function getActiveContractsCount() external view returns (uint256) {
        return activeContractIds.length;
    }

    // ========== FUNÇÕES DE CONSULTA - RECOMPENSAS ==========

    /**
     * @dev Retorna a recompensa pendente de um contrato específico
     */
    function getPendingReward(uint256 _contractId)
        external
        view
        returns (uint256)
    {
        return rentalContracts[_contractId].pendingReward;
    }

    /**
     * @dev Retorna o total de stake ativo em TODOS os contratos
     */
    function getTotalStakedSupply()
        external
        view
        returns (uint256)
    {
        return _totalSupply;
    }

    /**
     * @dev Retorna o total de recompensas já distribuídas historicamente
     */
    function getTotalRewardDistributed()
        external
        view
        returns (uint256)
    {
        return _totalRewardDistributed;
    }

    /**
     * @dev Retorna o saldo atual do cofre de recompensas
     */
    function getRewardReserveBalance()
        external
        view
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (uint256)
    {
        return _rewardReserveBalance;
    }

    /**
     * @dev Retorna o timestamp de início do ciclo atual
     */
    function getCycleStartTime()
        external
        view
        returns (uint256)
    {
        return cycleStartTime;
    }

    /**
     * @dev Simula quanto de recompensa um contrato receberia se distribuíssemos agora
     * @param _contractId ID do contrato
     * @param _percentageInBasisPoints Percentual a simular (ex: 540 para 5.40%)
     */
    function simulateReward(uint256 _contractId, uint256 _percentageInBasisPoints)
        external
        view
        returns (uint256 estimatedReward)
    {
        uint256 cycleDurationInSeconds = cycleDurationInDays * 1 days;
        if (cycleDurationInSeconds == 0) return 0;

        return _calculateContractReward(
            _contractId,
            block.timestamp,
            _percentageInBasisPoints,
            cycleDurationInSeconds
        );
    }

    /**
     * @dev Retorna informações completas sobre recompensas de todos os contratos ativos
     * Útil para dashboards e análises
     */
    function getRewardsSummary()
        external
        view
        returns (
            uint256 totalStaked,
            uint256 totalRewardReserve,
            uint256 totalRewardDistributed,
            uint256 activeContractsWithStake,
            uint256 totalPendingRewards
        )
    {
        totalStaked = _totalSupply;
        totalRewardReserve = _rewardReserveBalance;
        totalRewardDistributed = _totalRewardDistributed;

        uint256 contractsCount = 0;
        uint256 pendingSum = 0;

        for (uint256 i = 0; i < activeContractIds.length; i++) {
            RentalContract storage rental = rentalContracts[activeContractIds[i]];
            if (rental.hasStake) {
                contractsCount++;
                pendingSum += rental.pendingReward;
            }
        }

        activeContractsWithStake = contractsCount;
        totalPendingRewards = pendingSum;
    }

    // ========== FUNÇÕES INTERNAS ==========

    /**
     * @dev Adiciona contrato à lista de ativos
     */
    function _addToActiveList(uint256 _contractId) internal {
        if (!isInActiveList[_contractId]) {
            activeContractIds.push(_contractId);
            activeContractIndex[_contractId] = activeContractIds.length - 1;
            isInActiveList[_contractId] = true;
        }
    }

    /**
     * @dev Remove contrato da lista de ativos (swap and pop)
     */
    function _removeFromActiveList(uint256 _contractId) internal {
        if (isInActiveList[_contractId]) {
            uint256 index = activeContractIndex[_contractId];
            uint256 lastIndex = activeContractIds.length - 1;

            if (index != lastIndex) {
                uint256 lastContractId = activeContractIds[lastIndex];
                activeContractIds[index] = lastContractId;
                activeContractIndex[lastContractId] = index;
            }

            activeContractIds.pop();
            delete activeContractIndex[_contractId];
            isInActiveList[_contractId] = false;
        }
    }
}

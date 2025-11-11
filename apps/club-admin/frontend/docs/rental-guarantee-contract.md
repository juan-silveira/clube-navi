# Contrato de Garantia de Locação - RentalGuaranteeManager

## Visão Geral

Contrato inteligente para gerenciar múltiplos contratos de garantia de locação de imóveis (caução). Este contrato permite:
- Criação centralizada de múltiplos contratos de garantia
- **Clube (inquilino) é definido na criação do contrato**
- Sistema de stake com valor EXATO (não aceita valores diferentes)
- Aprovação dupla (proprietário + inquilino) para liberação de fundos
- Multa por unstake antecipado
- **Sistema de recompensas (rendimento) sobre o valor em stake**
- **Distribuição global de recompensas para todos os contratos ativos**
- **Um único token serve para stake E recompensas**
- Gestão eficiente através de pattern Factory

## Localização
`backend/src/contracts/coinageRentalGuarantee.sol`

---

## Estruturas de Dados

### RentalContract

```solidity
struct RentalContract {
    uint256 id;                  // ID único do contrato
    address landlord;            // Proprietário do imóvel
    address clube;              // Inquilino (quem fez o stake)
    uint256 exactStakeAmount;    // Valor EXATO requerido para stake
    uint256 endDate;             // Data de encerramento (Unix timestamp)
    uint256 penaltyAmount;       // Valor de multa para unstake antecipado
    uint256 stakedAmount;        // Valor efetivamente depositado
    uint256 pendingReward;       // Recompensa pendente acumulada
    uint256 stakeTimestamp;      // Timestamp de quando o stake foi depositado
    bool isActive;               // Contrato está ativo?
    bool hasStake;               // Já possui stake depositado?
    bool landlordApproval;       // Proprietário aprovou unstake?
    bool tenantApproval;         // Inquilino aprovou unstake?
    uint256 createdAt;           // Timestamp de criação
}
```

**Explicação dos campos:**
- `id`: Gerado automaticamente, incrementa a cada novo contrato
- `landlord`: Endereço que criou o contrato (proprietário do imóvel)
- **`clube`: Endereço do inquilino definido NA CRIAÇÃO do contrato. Apenas este endereço pode fazer stake**
- `exactStakeAmount`: Valor exato que deve ser depositado. Se tentar depositar valor diferente, a transação falha
- `endDate`: Timestamp Unix. Se unstake ocorrer antes desta data, aplica multa
- `penaltyAmount`: Valor deduzido do stake se unstake ocorrer antes do `endDate`
- `stakedAmount`: Valor atualmente depositado no contrato
- **`pendingReward`**: Recompensas acumuladas ainda não resgatadas. Incluídas automaticamente no unstake
- **`stakeTimestamp`**: Momento em que o stake foi depositado. Usado para calcular recompensas proporcionais ao tempo
- `isActive`: `false` quando contrato é cancelado ou unstake é executado
- `hasStake`: Controla se já existe depósito no contrato
- `landlordApproval`/`tenantApproval`: Ambos devem ser `true` para executar unstake

---

## Eventos

### RentalContractCreated
```solidity
event RentalContractCreated(
    uint256 indexed contractId,
    address indexed landlord,
    address indexed clube,
    uint256 exactStakeAmount,
    uint256 endDate,
    uint256 penaltyAmount
)
```
Emitido quando um novo contrato de garantia é criado. Inclui landlord e clube definidos.

### StakeDeposited
```solidity
event StakeDeposited(
    uint256 indexed contractId,
    address indexed clube,
    uint256 amount
)
```
Emitido quando um inquilino deposita a garantia.

### ApprovalGranted / ApprovalRevoked
```solidity
event ApprovalGranted(
    uint256 indexed contractId,
    address indexed approver,
    bool isLandlord
)

event ApprovalRevoked(
    uint256 indexed contractId,
    address indexed revoker,
    bool isLandlord
)
```
Emitidos quando aprovações são concedidas ou revogadas.

### UnstakeExecuted
```solidity
event UnstakeExecuted(
    uint256 indexed contractId,
    address indexed recipient,
    uint256 amount,
    bool hadPenalty,
    uint256 penaltyAmount
)
```
Emitido quando o unstake é executado com sucesso (com aprovações).

### UnstakeAdminExecuted
```solidity
event UnstakeAdminExecuted(
    uint256 indexed contractId,
    address indexed recipient,
    uint256 amount,
    bool hadPenalty,
    uint256 penaltyAmount
)
```
Emitido quando o unstake é forçado pelo admin sem aprovações (deadlock/disputa).

### RentalContractCancelled
```solidity
event RentalContractCancelled(
    uint256 indexed contractId,
    address indexed canceller
)
```
Emitido quando um contrato é cancelado (apenas contratos sem stake).

### ContractExtended
```solidity
event ContractExtended(
    uint256 indexed contractId,
    uint256 newEndDate
)
```
Emitido quando a data de encerramento é estendida.

### RewardDeposited
```solidity
event RewardDeposited(
    uint256 amount,
    uint256 totalReserve
)
```
Emitido quando admin deposita tokens no cofre de recompensas.

### RewardDistributed
```solidity
event RewardDistributed(
    uint256 totalDistributed,
    uint256 contractsCount
)
```
Emitido quando recompensas são distribuídas globalmente para todos os contratos.

### RewardClaimed
```solidity
event RewardClaimed(
    uint256 indexed contractId,
    address indexed recipient,
    uint256 amount
)
```
Emitido quando um clube resgata suas recompensas (sem fazer unstake).

### RewardTokensWithdrawn
```solidity
event RewardTokensWithdrawn(
    address indexed admin,
    uint256 amount
)
```
Emitido quando admin retira tokens do cofre de recompensas.

### CycleDurationUpdated
```solidity
event CycleDurationUpdated(
    uint256 newDurationInDays
)
```
Emitido quando a duração do ciclo de recompensas é alterada.

### CycleStartTimeUpdated
```solidity
event CycleStartTimeUpdated(
    uint256 newStartTime
)
```
Emitido quando o timestamp de início do ciclo é atualizado.

---

## Funções Principais

### 1. Funções de Criação e Configuração

#### createRentalContract
```solidity
function createRentalContract(
    address _landlord,
    address _clube,
    uint256 _exactStakeAmount,
    uint256 _endDate,
    uint256 _penaltyAmount
) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256)
```

**Propósito:** Cria um novo contrato de garantia de locação com landlord e clube pré-definidos.

**Parâmetros:**
- `_landlord`: Endereço do proprietário do imóvel
- **`_clube`: Endereço do inquilino que fará o stake (definido na criação)**
- `_exactStakeAmount`: Valor exato que o inquilino deverá depositar (em wei)
- `_endDate`: Data de término do contrato (Unix timestamp)
- `_penaltyAmount`: Valor de multa se unstake ocorrer antes do `_endDate`

**Retorno:** ID do contrato criado

**Validações:**
- `_landlord` não pode ser `address(0)`
- `_clube` não pode ser `address(0)`
- **`_clube` não pode ser igual a `_landlord`**
- `_exactStakeAmount` deve ser > 0
- `_endDate` deve ser futura
- `_penaltyAmount` não pode exceder `_exactStakeAmount`

**Uso esperado:**
```javascript
// Exemplo: Criar contrato de R$ 5.000 de caução, vencimento em 1 ano, multa de R$ 1.000
const contractId = await contract.createRentalContract(
    landlordAddress,
    tenantAddress,  // Clube definido na criação
    ethers.parseUnits("5000", 18),  // 5000 tokens
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60),  // +1 ano
    ethers.parseUnits("1000", 18)   // 1000 tokens de multa
);
```

---

#### extendContract
```solidity
function extendContract(
    uint256 _contractId,
    uint256 _newEndDate,
    address _caller
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Estende a data de encerramento de um contrato (útil para renovações).

**Parâmetros:**
- `_contractId`: ID do contrato
- `_newEndDate`: Nova data de encerramento (deve ser posterior à atual)
- `_caller`: Endereço que está solicitando (deve ser o landlord)

**Validações:**
- Apenas landlord pode estender
- Nova data deve ser posterior à atual
- Nova data deve ser futura

---

### 2. Funções de Stake

#### stake
```solidity
function stake(
    address _caller,
    uint256 _contractId
) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
```

**Propósito:** Deposita a garantia no contrato. Aceita APENAS o valor exato especificado.

**Parâmetros:**
- `_caller`: Endereço que está chamando (deve ser o clube definido no contrato)
- `_contractId`: ID do contrato

**Validações:**
- Contrato deve estar ativo
- Contrato não pode já ter stake
- Contrato não pode estar expirado
- **CRÍTICO: `_caller` deve ser EXATAMENTE o clube definido na criação do contrato**
- **CRÍTICO:** O valor transferido será EXATAMENTE `exactStakeAmount`. Qualquer valor diferente fará a transação falhar

**Fluxo:**
1. Valida todas as condições
2. Transfere `exactStakeAmount` do clube para o contrato (via `transferFromGasless`)
3. Registra clube no contrato
4. Marca `hasStake = true`
5. Emite evento `StakeDeposited`

**Uso esperado:**
```javascript
// Clube precisa ter aprovado o contrato para transferir tokens antes
await token.approve(contractAddress, exactStakeAmount);
await contract.stake(tenantAddress, contractId);
```

---

### 3. Sistema de Aprovação Dupla

#### approveLandlordUnstake
```solidity
function approveLandlordUnstake(
    uint256 _contractId,
    address _caller
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Proprietário aprova a liberação da garantia.

**Parâmetros:**
- `_contractId`: ID do contrato
- `_caller`: Endereço que está aprovando (deve ser o landlord)

**Validações:**
- Contrato deve estar ativo
- Contrato deve ter stake
- Caller deve ser o landlord

---

#### approveTenantUnstake
```solidity
function approveTenantUnstake(
    uint256 _contractId,
    address _caller
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Inquilino aprova a liberação da garantia.

**Parâmetros:**
- `_contractId`: ID do contrato
- `_caller`: Endereço que está aprovando (deve ser o clube)

**Validações:**
- Contrato deve estar ativo
- Contrato deve ter stake
- Caller deve ser o clube

---

#### revokeLandlordApproval / revokeTenantApproval
```solidity
function revokeLandlordApproval(uint256 _contractId, address _caller) external
function revokeTenantApproval(uint256 _contractId, address _caller) external
```

**Propósito:** Permite que landlord ou clube revoguem suas aprovações antes do unstake ser executado.

**Caso de uso:** Se houver mudança de acordo, qualquer parte pode revogar sua aprovação.

---

### 4. Funções de Unstake

#### unstake
```solidity
function unstake(
    uint256 _contractId,
    address _recipient
) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
```

**Propósito:** Executa a liberação da garantia quando AMBAS as partes aprovaram.

**Parâmetros:**
- `_contractId`: ID do contrato
- `_recipient`: Endereço que receberá os tokens (normalmente o clube, mas pode ser outro)

**Validações:**
- Contrato deve estar ativo
- Contrato deve ter stake
- Recipient não pode ser `address(0)`
- **CRÍTICO:** `landlordApproval` deve ser `true`
- **CRÍTICO:** `tenantApproval` deve ser `true`

**Lógica de Multa:**
```
SE block.timestamp < endDate ENTÃO:
    hadPenalty = true
    penaltyApplied = penaltyAmount
    amountToTransfer = stakedAmount - penaltyAmount
    Transfere penaltyAmount para landlord
    Transfere amountToTransfer para recipient
SENÃO:
    hadPenalty = false
    penaltyApplied = 0
    Transfere stakedAmount completo para recipient
```

**Fluxo:**
1. Valida todas as condições
2. Verifica se está antes da data de término
3. Se sim, calcula e aplica multa
4. Transfere multa para landlord (se houver)
5. Transfere restante para recipient
6. Marca contrato como inativo
7. Remove da lista de contratos ativos
8. Emite evento `UnstakeExecuted`

**Uso esperado:**
```javascript
// 1. Landlord aprova
await contract.approveLandlordUnstake(contractId, landlordAddress);

// 2. Clube aprova
await contract.approveTenantUnstake(contractId, tenantAddress);

// 3. Admin verifica se pode executar
const canExecute = await contract.canExecuteUnstake(contractId);

// 4. Admin executa
if (canExecute) {
    await contract.unstake(contractId, recipientAddress);
}
```

---

#### unstakeAdmin
```solidity
function unstakeAdmin(
    uint256 _contractId,
    address _recipient
) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
```

**Propósito:** Executa unstake FORÇADO pelo admin SEM necessidade de aprovações de landlord ou clube. **Resolve deadlocks e disputas.**

**Parâmetros:**
- `_contractId`: ID do contrato
- `_recipient`: Endereço que receberá os tokens (admin decide livremente)

**Validações:**
- Contrato deve estar ativo
- Contrato deve ter stake
- Recipient não pode ser `address(0)`
- **NÃO requer aprovações de landlord ou clube**

**Diferenças vs unstake:**
| Aspecto | unstake | unstakeAdmin |
|---------|---------|--------------|
| Aprovações | Requer ambas (landlord + clube) | Não requer |
| Uso | Fluxo normal | Deadlocks, disputas |
| Multa | Aplica se antes do prazo | Aplica se antes do prazo |
| Recompensas | Incluídas | Incluídas |
| Recipient | Admin escolhe | Admin escolhe |

**Quando usar:**
- 🔴 Deadlock: Uma parte nunca aprova
- 🔴 Disputa: Partes não entram em acordo
- 🔴 Emergência: Necessidade de liberar fundos urgentemente
- 🔴 Correção: Erro operacional

**Fluxo:**
1. Admin decide que precisa forçar o unstake
2. Admin escolhe recipient (pode ser clube, landlord, ou outro endereço)
3. Sistema aplica lógica normal de multa se antes do prazo
4. Sistema inclui recompensas pendentes
5. Transfere para recipient escolhido
6. Marca contrato como inativo
7. Emite evento `UnstakeAdminExecuted`

**Uso esperado:**
```javascript
// Cenário: Clube quer resgatar mas landlord não aprova há 60 dias

// Admin força unstake enviando para o clube
await contract.unstakeAdmin(contractId, tenantAddress);

// OU Admin pode enviar para outro endereço se houver decisão judicial
await contract.unstakeAdmin(contractId, escrowAddress);
```

**IMPORTANTE:** Esta função deve ser usada com cautela. Recomenda-se:
- Documentar motivo do uso
- Notificar ambas as partes
- Ter política clara de quando usar
- Considerar adicionar timelock (ex: só pode usar após X dias sem aprovação)

---

#### cancelRentalContract
```solidity
function cancelRentalContract(
    uint256 _contractId,
    address _caller
) external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Cancela um contrato que ainda não tem stake (útil se criado por engano).

**Validações:**
- Contrato deve estar ativo
- **CRÍTICO:** Contrato NÃO pode ter stake
- Caller deve ser o landlord

**Nota:** Depois que stake é feito, não há mais como cancelar, apenas fazer unstake (com aprovações ou via unstakeAdmin).

---

### 5. Funções de Recompensa

#### depositRewards
```solidity
function depositRewards(uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Deposita tokens no cofre de recompensas que serão distribuídos aos contratos ativos.

**Parâmetros:**
- `_amount`: Quantidade de tokens a depositar

**Uso:**
```javascript
// Admin deposita 10.000 tokens para serem distribuídos como recompensa
await contract.depositRewards(ethers.parseUnits("10000", 18));
```

**Nota:** Os tokens depositados aqui serão gradualmente distribuídos aos contratos com stake quando `distributeReward()` for chamado.

---

#### distributeReward
```solidity
function distributeReward(uint256 _percentageInBasisPoints)
    external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Distribui recompensas para TODOS os contratos ativos com stake, baseado em um percentual anual.

**Parâmetros:**
- `_percentageInBasisPoints`: Percentual anual em basis points (100 = 1%, 540 = 5.40%)

**Lógica de Cálculo:**
- Recompensa proporcional ao tempo que o stake esteve ativo no ciclo
- Exemplo: Se ciclo é 90 dias e stake ficou 30 dias, recebe 1/3 da recompensa
- Fórmula: `(stakedAmount * percentage * timeStaked) / (10000 * cycleDuration)`

**Validações:**
- Deve haver contratos ativos
- Percentual deve ser > 0
- Saldo no cofre deve ser suficiente para distribuir

**Fluxo:**
1. Calcula recompensa para cada contrato com base no tempo ativo
2. Verifica se há saldo suficiente no cofre
3. Distribui e adiciona a `pendingReward` de cada contrato
4. Atualiza `stakeTimestamp` de cada contrato para o momento da distribuição
5. Atualiza `cycleStartTime` para o momento da distribuição
6. Deduz do cofre o total distribuído

**Uso:**
```javascript
// Distribui 5.40% anual para todos os contratos
// 5.40% = 540 basis points
await contract.distributeReward(540);
```

**Importante:** Esta função atualiza TODOS os contratos de uma vez. Não é necessário chamar por contrato individual.

---

#### claimReward
```solidity
function claimReward(uint256 _contractId)
    external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
```

**Propósito:** Permite que clube resgate APENAS as recompensas acumuladas, SEM fazer unstake.

**Parâmetros:**
- `_contractId`: ID do contrato

**Validações:**
- Contrato deve estar ativo
- Contrato deve ter stake
- Deve haver recompensa pendente > 0

**Uso:**
```javascript
// Clube quer sacar apenas as recompensas, mantendo o stake ativo
await contract.claimReward(contractId);
```

**Nota:** Após o resgate, `pendingReward` é zerado. O stake continua ativo e rendendo.

---

#### withdrawRewardTokens
```solidity
function withdrawRewardTokens(uint256 _amount)
    external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
```

**Propósito:** Admin pode retirar tokens do cofre de recompensas (útil se depositou demais).

**Parâmetros:**
- `_amount`: Quantidade a retirar

**Validações:**
- Amount deve ser > 0
- Amount não pode exceder saldo do cofre

**Uso:**
```javascript
// Admin retira 1.000 tokens do cofre
await contract.withdrawRewardTokens(ethers.parseUnits("1000", 18));
```

---

#### setCycleDuration
```solidity
function setCycleDuration(uint256 _newDurationInDays)
    external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Define a duração do ciclo de recompensas em dias.

**Parâmetros:**
- `_newDurationInDays`: Nova duração em dias (ex: 90, 180, 365)

**Nota:** Isso afeta o cálculo proporcional de recompensas. Ciclo de 90 dias significa que 5.40% anual seria ~1.35% por ciclo.

---

#### updateCycleStartTime
```solidity
function updateCycleStartTime(uint256 _newStartTime)
    external onlyRole(DEFAULT_ADMIN_ROLE)
```

**Propósito:** Atualiza manualmente o timestamp de início do ciclo atual.

**Parâmetros:**
- `_newStartTime`: Novo timestamp (Unix time)

**Validações:**
- Start time deve ser > 0
- Start time não pode ser futuro

**Uso:** Útil para correções manuais se necessário.

---

### 6. Funções de Consulta (View)

#### getActiveContractIds
```solidity
function getActiveContractIds() external view returns (uint256[] memory)
```

**Propósito:** Retorna array com IDs de todos os contratos ativos.

**Uso:** Essencial para o admin listar contratos antes de chamar outras funções.

**Exemplo de retorno:** `[1, 3, 5, 7, 12]`

---

#### getRentalContract
```solidity
function getRentalContract(uint256 _contractId)
    external view returns (RentalContract memory)
```

**Propósito:** Retorna todas as informações de um contrato específico.

**Retorno:** Struct completa com todos os campos do contrato.

---

#### canExecuteUnstake
```solidity
function canExecuteUnstake(uint256 _contractId) external view returns (bool)
```

**Propósito:** Verifica se um contrato está pronto para executar unstake.

**Retorna `true` se:**
- Contrato está ativo
- Contrato tem stake
- Landlord aprovou
- Clube aprovou

**Uso:** Admin deve chamar esta função ANTES de tentar `unstake()`.

---

#### getApprovalStatus
```solidity
function getApprovalStatus(uint256 _contractId)
    external view returns (bool landlordApproval, bool tenantApproval)
```

**Propósito:** Retorna o status das aprovações de um contrato.

**Exemplo de retorno:** `(true, false)` - landlord aprovou, clube ainda não

---

#### getContractsByLandlord
```solidity
function getContractsByLandlord(address _landlord)
    external view returns (uint256[] memory)
```

**Propósito:** Retorna IDs de todos os contratos ativos onde um endereço é landlord.

**Uso:** UI pode usar para mostrar "Meus Contratos como Proprietário".

---

#### getContractsByClube
```solidity
function getContractsByClube(address _clube)
    external view returns (uint256[] memory)
```

**Propósito:** Retorna IDs de todos os contratos ativos onde um endereço é clube.

**Uso:** UI pode usar para mostrar "Meus Contratos como Inquilino".

---

#### calculateCurrentPenalty
```solidity
function calculateCurrentPenalty(uint256 _contractId)
    external view returns (uint256 penalty, bool wouldHavePenalty)
```

**Propósito:** Calcula quanto de multa seria aplicada SE o unstake fosse executado agora.

**Retorno:**
- `penalty`: Valor da multa (0 se já passou a data de término)
- `wouldHavePenalty`: `true` se ainda está antes da data de término

**Uso:** UI pode mostrar "Se você sacar agora, terá multa de X tokens".

---

#### getActiveContractsCount
```solidity
function getActiveContractsCount() external view returns (uint256)
```

**Propósito:** Retorna número total de contratos ativos (sem precisar carregar array completo).

---

#### getPendingReward
```solidity
function getPendingReward(uint256 _contractId) external view returns (uint256)
```

**Propósito:** Retorna a recompensa pendente acumulada de um contrato específico.

**Retorno:** Quantidade de tokens em recompensa ainda não resgatada.

---

#### getTotalStakedSupply
```solidity
function getTotalStakedSupply() external view returns (uint256)
```

**Propósito:** Retorna o total de stake ativo em TODOS os contratos.

**Uso:** Útil para dashboards mostrando TVL (Total Value Locked).

---

#### getTotalRewardDistributed
```solidity
function getTotalRewardDistributed() external view returns (uint256)
```

**Propósito:** Retorna o total de recompensas já distribuídas historicamente.

**Uso:** Métricas de quanto já foi pago em recompensas desde o início.

---

#### getRewardReserveBalance
```solidity
function getRewardReserveBalance()
    external view onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256)
```

**Propósito:** Retorna o saldo atual do cofre de recompensas.

**Acesso:** Apenas admin pode consultar.

**Uso:** Verificar quanto ainda há disponível para distribuir.

---

#### simulateReward
```solidity
function simulateReward(uint256 _contractId, uint256 _percentageInBasisPoints)
    external view returns (uint256 estimatedReward)
```

**Propósito:** Simula quanto de recompensa um contrato receberia SE distribuíssemos agora com um dado percentual.

**Parâmetros:**
- `_contractId`: ID do contrato
- `_percentageInBasisPoints`: Percentual a simular (ex: 540 para 5.40%)

**Uso:** Útil para mostrar ao usuário "Você receberia X tokens se distribuíssemos agora".

---

#### getRewardsSummary
```solidity
function getRewardsSummary() external view returns (
    uint256 totalStaked,
    uint256 totalRewardReserve,
    uint256 totalRewardDistributed,
    uint256 activeContractsWithStake,
    uint256 totalPendingRewards
)
```

**Propósito:** Retorna um resumo completo do sistema de recompensas em uma única chamada.

**Retorno:**
- `totalStaked`: Total de stake ativo em todos os contratos
- `totalRewardReserve`: Saldo do cofre de recompensas
- `totalRewardDistributed`: Total já distribuído historicamente
- `activeContractsWithStake`: Número de contratos com stake ativo
- `totalPendingRewards`: Soma de todas as recompensas pendentes de todos os contratos

**Uso:** Ideal para dashboards administrativos mostrando overview completo.

---

## Fluxos Completos

### Fluxo 1: Criar Contrato e Fazer Stake
```
1. Admin → createRentalContract(landlord, tenant1, 5000 tokens, endDate, 1000 multa)
   → Retorna contractId = 1
   → tenant1 já está definido no contrato

2. Tenant1 → Aprova contrato para gastar tokens
   token.approve(contractAddress, 5000 tokens)

3. Admin → stake(tenant1, contractId=1)
   → Valida que caller é o tenant1 definido
   → Contrato agora tem stake de 5000 tokens
```

### Fluxo 2: Unstake Normal (após término)
```
1. block.timestamp >= endDate

2. Landlord → Chama backend que chama approveLandlordUnstake(1, landlord)
   → landlordApproval = true

3. Clube → Chama backend que chama approveTenantUnstake(1, tenant1)
   → tenantApproval = true

4. Admin → Verifica canExecuteUnstake(1)
   → Retorna true

5. Admin → unstake(1, tenant1)
   → Transfere 5000 tokens para tenant1
   → Sem multa (passou o prazo)
   → Contrato inativado
```

### Fluxo 3: Unstake Antecipado (com multa)
```
1. block.timestamp < endDate

2. Landlord → approveLandlordUnstake(1, landlord)
3. Clube → approveTenantUnstake(1, tenant1)

4. Admin → calculateCurrentPenalty(1)
   → Retorna (1000, true)
   → UI mostra: "Multa de 1000 tokens será aplicada"

5. Admin → unstake(1, tenant1)
   → Transfere 1000 tokens (multa) para landlord
   → Transfere 4000 tokens restantes para tenant1
   → Contrato inativado
```

### Fluxo 4: Cancelar Aprovação
```
1. Landlord → approveLandlordUnstake(1, landlord)
   → landlordApproval = true

2. Clube → approveTenantUnstake(1, tenant1)
   → tenantApproval = true

3. Landlord muda de ideia → revokeLandlordApproval(1, landlord)
   → landlordApproval = false

4. Admin → canExecuteUnstake(1)
   → Retorna false (falta aprovação do landlord)
```

### Fluxo 5: Resolução de Deadlock com unstakeAdmin
```
1. Situação: Contrato 1
   - Clube aprovou: ✓
   - Landlord aprovou: ✗ (há 90 dias sem responder)
   - Prazo de término já passou
   - Clube precisa dos fundos urgentemente

2. Admin → canExecuteUnstake(1)
   → Retorna false (falta aprovação do landlord)

3. Admin analisa a situação:
   - Verifica histórico de tentativas de contato
   - Confirma que prazo passou (sem multa)
   - Decide forçar o unstake

4. Admin → unstakeAdmin(1, tenant1)
   → Transfere stake + recompensas para tenant1
   → Sem multa (prazo passou)
   → Contrato inativado
   → Emite UnstakeAdminExecuted

5. Sistema registra no log:
   - Motivo: "Deadlock - Landlord sem resposta há 90 dias"
   - Data da ação
   - Recipient escolhido
```

### Fluxo 6: Sistema de Recompensas Completo
```
1. Admin → depositRewards(10000 tokens)
   → Cofre de recompensas: 10000 tokens

2. Vários contratos têm stake ativo:
   - Contrato 1: 5000 tokens (há 30 dias)
   - Contrato 2: 3000 tokens (há 15 dias)
   - Contrato 3: 2000 tokens (há 45 dias)

3. Admin → distributeReward(540) // 5.40% anual
   → Sistema calcula recompensa proporcional para cada contrato
   → Contrato 1 recebe: X tokens (proporcional a 5000 * 30 dias)
   → Contrato 2 recebe: Y tokens (proporcional a 3000 * 15 dias)
   → Contrato 3 recebe: Z tokens (proporcional a 2000 * 45 dias)
   → Total distribuído deduzido do cofre
   → Cada contrato tem pendingReward atualizado
   → cycleStartTime atualizado para agora

4. Clube do Contrato 1 → claimReward(1)
   → Recebe X tokens
   → pendingReward zerado
   → Stake continua ativo e rendendo

5. Passam mais 30 dias...

6. Admin → distributeReward(540) novamente
   → Todos os contratos recebem nova recompensa proporcional
   → Contrato 1 acumula nova recompensa (stake continuou ativo)
```

### Fluxo 7: Unstake com Recompensas Acumuladas
```
1. Contrato 1 tem:
   - Stake: 5000 tokens
   - Recompensas pendentes: 150 tokens
   - Data de término já passou

2. Landlord → approveLandlordUnstake(1, landlord)
3. Clube → approveTenantUnstake(1, tenant1)

4. Admin → unstake(1, tenant1)
   → Transfere 5000 tokens (stake) + 150 tokens (recompensas) = 5150 tokens para tenant1
   → Sem multa (passou o prazo)
   → Contrato inativado
   → totalSupply diminui em 5000
```

---

## Considerações de Segurança

### Proteções Implementadas

1. **ReentrancyGuard**: Protege `stake()` e `executeUnstake()` contra ataques de reentrância
2. **AccessControl**: Apenas admin pode chamar funções críticas
3. **Validações rigorosas**: Múltiplas verificações antes de executar operações
4. **Sistema de aprovação dupla**: Nenhuma parte pode sacar unilateralmente
5. **Imutabilidade do valor de stake**: Não aceita valores diferentes do especificado
6. **Swap-and-pop pattern**: Remoção eficiente de arrays sem buracos

### Limitações e Riscos

1. **Centralização**: Admin tem controle total (modelo confiável)
2. **Deadlock potencial**: Se uma parte nunca aprovar, fundos ficam travados
3. **Sem arbitragem automática**: Não há mecanismo de resolução de disputas
4. **Sem timelock de aprovação**: Aprovações não expiram

---

## Melhorias Futuras a Considerar

### Funcionalidades Adicionais

1. **Sistema de Arbitragem**
   - Adicionar árbitro de terceira parte
   - Árbitro pode forçar unstake após N dias sem acordo

2. **Aprovações com Prazo**
   - Aprovações expiram após X dias
   - Previne aprovações "esquecidas"

3. **Unstake Parcial**
   - Permitir liberação parcial da garantia
   - Útil para devoluções gradativas

4. **Histórico de Contratos**
   - Manter contratos inativos para consulta histórica
   - Não remover da lista, apenas marcar como inativo

5. **Multi-token Support**
   - Permitir diferentes tokens por contrato
   - Ex: Contrato 1 usa cBRL, Contrato 2 usa USDC

6. **Sistema de Documentos**
   - Armazenar hash IPFS de contratos PDF
   - Link entre contrato digital e documento legal

7. **Notificações On-chain**
   - Eventos para prazos se aproximando
   - Avisos de expiração

8. **Penalidades Graduais**
   - Multa proporcional ao tempo restante
   - Ex: Sacar com 6 meses de antecedência = 50% multa
        Sacar com 1 mês de antecedência = 10% multa

---

## Decisões de Design (Resolvidas)

1. **~~Deadlock~~**: ✅ Resolvido! Função `unstakeAdmin()` permite admin forçar unstake sem aprovações.

2. **Penalidades**: 🟡 Aguardando definição - multa fixa ou proporcional ao tempo restante?

3. **~~Recipient no unstake~~**: ✅ Flexibilidade total! Admin sempre escolhe o recipient.

4. **~~Whitelist~~**: ✅ Removida! Clube agora é definido na criação do contrato.

5. **~~Histórico~~**: ✅ Não mantido on-chain. Sistema backend registra. Contratos inativos retornam estado inativo.

6. **~~Renovações~~**: ✅ Criar novo contrato (não estender o atual).

7. **~~Depósitos parciais~~**: ✅ Não permitido. Apenas valor exato total.

8. **~~Multi-clube~~**: ✅ Não permitido. Um contrato = um clube.

---

## Checklist de Testes Necessários

- [ ] Criar contrato com parâmetros válidos
- [ ] Tentar criar contrato com parâmetros inválidos
- [ ] Fazer stake com valor exato
- [ ] Tentar stake com valor diferente (deve falhar)
- [ ] Tentar stake duas vezes no mesmo contrato (deve falhar)
- [ ] Tentar stake em contrato expirado (deve falhar)
- [ ] Aprovar como landlord
- [ ] Aprovar como clube
- [ ] Tentar aprovar como terceiro (deve falhar)
- [ ] Revogar aprovação
- [ ] Executar unstake sem ambas aprovações (deve falhar)
- [ ] Executar unstake com ambas aprovações (antes do prazo - com multa)
- [ ] Executar unstake com ambas aprovações (após prazo - sem multa)
- [ ] Executar unstakeAdmin SEM aprovações (deadlock scenario)
- [ ] Executar unstakeAdmin com recipient diferente do clube
- [ ] Verificar que unstakeAdmin aplica multa corretamente
- [ ] Verificar que unstakeAdmin inclui recompensas
- [ ] Cancelar contrato sem stake
- [ ] Tentar cancelar contrato com stake (deve falhar)
- [ ] Estender contrato
- [ ] Tentar stake com endereço diferente do clube definido (deve falhar)
- [ ] Depositar recompensas no cofre
- [ ] Distribuir recompensas globalmente
- [ ] Verificar recompensas acumuladas corretamente por contrato
- [ ] Resgatar recompensas sem fazer unstake
- [ ] Executar unstake e receber stake + recompensas
- [ ] Tentar distribuir sem saldo suficiente no cofre (deve falhar)
- [ ] Retirar tokens do cofre de recompensas
- [ ] Verificar cálculo proporcional de recompensas por tempo
- [ ] Testar simulação de recompensas
- [ ] Testar getRewardsSummary()
- [ ] Testar todas as funções de consulta
- [ ] Verificar eventos emitidos corretamente
- [ ] Testar com múltiplos contratos simultâneos

---

## Notas de Implementação Backend/Frontend

### Chamadas Backend Esperadas

```javascript
// Criar contrato
POST /api/rental/create
Body: {
    landlordAddress,
    tenantAddress,  // Clube definido na criação
    exactStakeAmount,
    endDate,
    penaltyAmount
}

// Fazer stake
POST /api/rental/:id/stake
Body: { tenantAddress }

// Aprovar unstake (landlord)
POST /api/rental/:id/approve/landlord
Body: { callerAddress }

// Aprovar unstake (clube)
POST /api/rental/:id/approve/clube
Body: { callerAddress }

// Executar unstake (requer aprovações)
POST /api/rental/:id/unstake
Body: { recipientAddress }

// Executar unstake forçado (admin, sem aprovações)
POST /api/rental/:id/unstake-admin
Body: { recipientAddress, reason }  // reason opcional para log

// === RECOMPENSAS ===

// Depositar no cofre de recompensas
POST /api/rental/rewards/deposit
Body: { amount }

// Distribuir recompensas globalmente
POST /api/rental/rewards/distribute
Body: { percentageInBasisPoints }

// Resgatar recompensas de um contrato (sem unstake)
POST /api/rental/:id/claim-reward

// Retirar do cofre de recompensas
POST /api/rental/rewards/withdraw
Body: { amount }

// === CONSULTAS ===

GET /api/rental/active - Lista contratos ativos
GET /api/rental/:id - Detalhes do contrato
GET /api/rental/:id/can-unstake - Verifica se pode executar
GET /api/rental/:id/penalty - Calcula penalidade atual
GET /api/rental/landlord/:address - Contratos do proprietário
GET /api/rental/clube/:address - Contratos do inquilino

// Consultas de recompensas
GET /api/rental/:id/pending-reward - Recompensa pendente do contrato
GET /api/rental/:id/simulate-reward/:percentage - Simula recompensa
GET /api/rental/rewards/summary - Resumo completo de recompensas
GET /api/rental/rewards/total-staked - Total de stake ativo
GET /api/rental/rewards/total-distributed - Total de recompensas distribuídas
GET /api/rental/rewards/reserve-balance - Saldo do cofre (admin only)
```

### Interface Frontend Sugerida

**Tela 1: Criar Contrato (Admin)**
- Input: Endereço do proprietário (landlord)
- Input: Endereço do inquilino (clube)
- Input: Valor da caução
- Input: Data de término (date picker)
- Input: Valor da multa
- Button: Criar Contrato

**Tela 2: Lista de Contratos Ativos**
- Tabela com colunas:
  - ID
  - Landlord
  - Clube
  - Valor Stake
  - Recompensas Pendentes
  - Data Término
  - Status (Com stake / Sem stake)
  - Aprovações (Landlord: ✓/✗, Clube: ✓/✗)
  - Ações

**Tela 3: Detalhes do Contrato**
- Informações completas do contrato
- Card de Recompensas:
  - Recompensas pendentes: X tokens
  - Simulação: "Se distribuir 5.40% agora, você receberia Y tokens"
  - Botão "Resgatar Recompensas" (se clube e há recompensa pendente)
- Botão "Depositar Caução" (se clube e sem stake)
- Botão "Aprovar Liberação" (se landlord ou clube)
- Botão "Revogar Aprovação" (se já aprovou)
- Botão "Executar Liberação" (se admin e ambos aprovaram)
- **Botão "Forçar Liberação (Admin)" (se admin, em vermelho, com confirmação dupla)**
  - Modal de confirmação:
    - Aviso: "Esta ação bypassa aprovações. Use apenas em deadlocks."
    - Input: Endereço recipient
    - Input: Motivo (obrigatório para log)
    - Checkbox: "Confirmo que tentei resolver via aprovações normais"
- Badge mostrando multa atual se houver
- Badge mostrando total a receber no unstake (stake + recompensas - multa)
- **Indicador de deadlock** (se uma aprovação está pendente há mais de X dias)

**Tela 4: Dashboard de Recompensas (Admin)**
- Card Overview:
  - Total de Stake Ativo (TVL): X tokens
  - Saldo do Cofre: Y tokens
  - Total Distribuído Historicamente: Z tokens
  - Contratos Ativos com Stake: N
  - Total de Recompensas Pendentes: W tokens
- Botão "Depositar no Cofre"
- Botão "Distribuir Recompensas"
- Modal para distribuição:
  - Input: Percentual (ex: 5.40%)
  - Preview: "Será distribuído aproximadamente X tokens"
  - Confirmação
- Botão "Retirar do Cofre"
- Histórico de Distribuições

**Tela 5: Minha Carteira (Clube)**
- Meus Contratos como Inquilino:
  - Lista de contratos ativos
  - Para cada contrato:
    - Valor em Stake: X tokens
    - Recompensas Acumuladas: Y tokens
    - Total que receberá no resgate: X + Y - multa (se houver)
    - Botão "Resgatar Recompensas"
- Total Geral:
  - Total em Stake: soma de todos
  - Total em Recompensas: soma de todos

---

## Arquivo de Contrato
`backend/src/contracts/coinageRentalGuarantee.sol`

---

**Versão:** 3.1 (Com Resolução de Deadlock)
**Data:** 2025-10-21
**Status:** Pronto para testes - contrato completo e production-ready

**Mudanças v3.1:**
- ✅ **Função `unstakeAdmin()` para resolver deadlocks**
- ✅ **Admin pode forçar unstake sem aprovações em casos de disputa**

**Funcionalidades v3.0:**
- ✅ Sistema de recompensas integrado
- ✅ Distribuição global para todos os contratos ativos
- ✅ Mesmo token para stake e recompensas
- ✅ Resgate de recompensas sem unstake
- ✅ Recompensas proporcionais ao tempo de stake
- ✅ Cofre centralizado de recompensas
- ✅ Funções de consulta e simulação
- ✅ Clube definido na criação do contrato (removido sistema de whitelist)
- ✅ Código mais simples e gas-efficient

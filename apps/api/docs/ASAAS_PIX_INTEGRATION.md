# Integração PIX com Asaas

## 📋 Visão Geral

Este documento descreve a integração do sistema de depósitos PIX com a plataforma Asaas.

## 🚀 Funcionalidades Implementadas

### 1. Criação de Cobrança PIX
- Geração automática de QR Code
- Código PIX copia e cola
- Definição de prazo de validade
- Vinculação com transação interna

### 2. Webhook de Notificações
- Recebimento de confirmações de pagamento
- Atualização automática de status
- Processamento assíncrono de depósitos

### 3. Verificação de Status
- Consulta em tempo real do status do pagamento
- Polling automático no frontend
- Atualização visual para o usuário

### 4. Processamento de Saques
- Transferências PIX via Asaas
- Validação de chaves PIX
- Controle de taxas e limites

## 🔧 Configuração

### 1. Obter Credenciais Asaas

1. Acesse [Asaas](https://www.asaas.com)
2. Crie uma conta ou faça login
3. Vá em **Configurações > Integrações > API**
4. Gere sua API Key

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.asaas.example` para `.env` e configure:

```bash
# Provedor PIX
PIX_PROVIDER=asaas

# API Key do Asaas
ASAAS_API_KEY=sua_api_key_aqui

# URL da API (sandbox ou produção)
PIX_API_URL=https://sandbox.asaas.com/api/v3

# Token do Webhook (gere um token seguro)
ASAAS_WEBHOOK_TOKEN=seu_token_seguro

# URL do Webhook (onde o Asaas enviará notificações)
ASAAS_WEBHOOK_URL=https://seudominio.com/api/webhooks/asaas
```

### 3. Configurar Webhook no Asaas

1. No painel do Asaas, vá em **Configurações > Webhooks**
2. Adicione um novo webhook
3. Configure a URL: `https://seudominio.com/api/webhooks/asaas`
4. Selecione os eventos:
   - `PAYMENT_CONFIRMED`
   - `PAYMENT_RECEIVED`
   - `PAYMENT_OVERDUE`
   - `PAYMENT_DELETED`
   - `TRANSFER_DONE`
   - `TRANSFER_FAILED`

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── controllers/
│   │   ├── deposit.controller.js      # Controlador de depósitos
│   │   └── asaasWebhook.controller.js # Webhook do Asaas
│   ├── services/
│   │   └── pix.service.js            # Serviço PIX com Asaas
│   └── routes/
│       ├── deposit.routes.js         # Rotas de depósito
│       └── asaas.routes.js          # Rotas do webhook
└── docs/
    └── ASAAS_PIX_INTEGRATION.md     # Este documento
```

## 🔄 Fluxo de Depósito

1. **Usuário inicia depósito**
   - Informa valor desejado
   - Sistema calcula taxas

2. **Sistema cria cobrança PIX**
   - Chama API Asaas para gerar PIX
   - Recebe QR Code e código copia/cola
   - Salva dados no banco

3. **Usuário realiza pagamento**
   - Escaneia QR Code ou cola código
   - Efetua pagamento no app bancário

4. **Asaas envia webhook**
   - Sistema recebe notificação
   - Valida assinatura do webhook
   - Atualiza status do depósito

5. **Sistema processa depósito**
   - Minta tokens cBRL
   - Credita na carteira do usuário
   - Envia confirmação por email

## 🔍 Endpoints da API

### Criar Cobrança PIX
```http
POST /api/deposits/create-pix
{
  "transactionId": "uuid-da-transacao",
  "userId": "uuid-do-usuario"
}
```

### Verificar Status
```http
GET /api/deposits/check-status/:transactionId
```

### Webhook Asaas
```http
POST /api/webhooks/asaas
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_xxx",
    "status": "CONFIRMED",
    "value": 100.00,
    "externalReference": "transactionId"
  }
}
```

## 🧪 Testes

### Modo Mock
Para testes sem usar a API real do Asaas:

```bash
PIX_PROVIDER=mock
USE_PIX_MOCK=true
```

### Sandbox Asaas
Para testes com a API sandbox do Asaas:

```bash
PIX_PROVIDER=asaas
PIX_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=sua_api_key_sandbox
```

## 🔒 Segurança

1. **Validação de Webhook**
   - Sempre valide a assinatura do webhook
   - Use HTTPS para o endpoint do webhook
   - Implemente rate limiting

2. **Proteção de Credenciais**
   - Nunca commite API keys no código
   - Use variáveis de ambiente
   - Rotacione keys periodicamente

3. **Validação de Dados**
   - Valide todos os inputs
   - Sanitize dados do usuário
   - Implemente timeouts nas requisições

## 📊 Monitoramento

### Logs Importantes
- Criação de cobranças PIX
- Recebimento de webhooks
- Confirmações de pagamento
- Erros de API

### Métricas Sugeridas
- Taxa de conversão (cobranças criadas vs pagas)
- Tempo médio de confirmação
- Volume de transações por período
- Taxa de falhas

## 🐛 Troubleshooting

### Webhook não está sendo recebido
1. Verifique se a URL está acessível publicamente
2. Confirme configuração no painel Asaas
3. Verifique logs de erro

### QR Code não aparece
1. Verifique se a API Key está correta
2. Confirme se está usando a URL correta (sandbox vs produção)
3. Verifique logs da API Asaas

### Pagamento não é confirmado
1. Verifique se o webhook está configurado
2. Confirme se o evento PAYMENT_CONFIRMED está selecionado
3. Verifique processamento do webhook

## 📚 Referências

- [Documentação API Asaas](https://docs.asaas.com/)
- [Sandbox Asaas](https://sandbox.asaas.com)
- [Status API Asaas](https://status.asaas.com/)

## 💬 Suporte

Para dúvidas sobre a integração:
- Documentação técnica: [docs.asaas.com](https://docs.asaas.com/)
- Suporte Asaas: suporte@asaas.com
- Comunidade: [Forum Asaas](https://forum.asaas.com/)
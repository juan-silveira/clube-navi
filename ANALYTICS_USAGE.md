# 📊 Guia de Uso do Sistema de Analytics

## Visão Geral

O sistema de analytics do Clube Digital permite rastrear **todos os eventos e interações** dos usuários na plataforma, incluindo:

- Page views e navegação
- Cliques em botões e elementos
- Compras e transações
- Buscas
- Erros
- Aberturas e cliques em push notifications
- Sessões de usuários
- E muito mais!

## 🚀 Configuração Inicial

### 1. Adicionar o Provider de Analytics

No arquivo principal do app (ex: `app/layout.jsx`):

```jsx
import AnalyticsProvider from '@/components/AnalyticsProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

## 📝 Exemplos de Uso

### 1. Hook Básico de Analytics

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MinhaPagina() {
  const analytics = useAnalytics();

  const handleComprar = async () => {
    // Fazer a compra...

    // Rastrear o evento
    analytics.trackPurchase({
      purchaseId: 'purchase-123',
      productId: 'product-456',
      amount: 99.90,
      cashbackAmount: 4.99
    });
  };

  return (
    <button onClick={handleComprar}>
      Comprar Agora
    </button>
  );
}
```

### 2. Rastreamento Automático de Cliques

```jsx
import { useClickTracking } from '@/hooks/useAnalytics';

function BotaoImportante() {
  const buttonRef = useClickTracking('btn-destaque', 'Ver Ofertas', {
    data: { section: 'hero', position: 'top' }
  });

  return (
    <button ref={buttonRef} className="btn-primary">
      Ver Ofertas
    </button>
  );
}
```

### 3. Rastrear Tempo na Página

```jsx
import { usePageTimeTracking } from '@/hooks/useAnalytics';

function PaginaProduto() {
  // Rastreia automaticamente quanto tempo o usuário fica na página
  usePageTimeTracking('Página de Produto');

  return <div>Conteúdo do produto...</div>;
}
```

### 4. Rastrear Visibilidade de Elementos (Scroll Tracking)

```jsx
import { useVisibilityTracking } from '@/hooks/useAnalytics';

function ProdutoCard({ produto }) {
  const cardRef = useVisibilityTracking(
    `product-${produto.id}`,
    'product_viewed'
  );

  return (
    <div ref={cardRef} className="product-card">
      <h3>{produto.nome}</h3>
      <p>{produto.preco}</p>
    </div>
  );
}
```

### 5. Rastrear Buscas

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function BarraDeBusca() {
  const analytics = useAnalytics();
  const [resultados, setResultados] = useState([]);

  const handleBuscar = async (termo) => {
    const results = await buscarProdutos(termo);
    setResultados(results);

    // Rastrear busca
    analytics.trackSearch(termo, results.length);
  };

  return (
    <input
      type="search"
      onSearch={(e) => handleBuscar(e.target.value)}
    />
  );
}
```

### 6. Rastrear Erros

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function ComponenteComErro() {
  const analytics = useAnalytics();

  const handleOperacao = async () => {
    try {
      await operacaoArriscada();
    } catch (error) {
      // Rastrear erro
      analytics.trackError(error.message, error.stack);

      // Mostrar mensagem ao usuário
      toast.error('Ocorreu um erro');
    }
  };
}
```

### 7. Rastrear Submissão de Formulários

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function FormularioContato() {
  const analytics = useAnalytics();

  const handleSubmit = async (data) => {
    // Enviar formulário...

    // Rastrear submissão
    analytics.trackFormSubmit('contato', {
      categoria: data.categoria,
      origem: 'pagina_contato'
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 8. Rastrear Eventos Personalizados

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function VideoPlayer({ videoId }) {
  const analytics = useAnalytics();

  const handlePlay = () => {
    analytics.trackEvent('video_play', 'video_started', {
      category: 'media',
      data: {
        videoId,
        timestamp: Date.now()
      }
    });
  };

  const handleComplete = () => {
    analytics.trackEvent('video_complete', 'video_completed', {
      category: 'media',
      data: {
        videoId,
        watchedToEnd: true
      }
    });
  };

  return (
    <video
      onPlay={handlePlay}
      onEnded={handleComplete}
    >
      ...
    </video>
  );
}
```

### 9. Rastrear Notificações Push

```jsx
import { useAnalytics } from '@/hooks/useAnalytics';

function PushNotificationHandler() {
  const analytics = useAnalytics();

  useEffect(() => {
    // Quando o usuário abre o app via push notification
    const handleNotificationOpen = (notification) => {
      analytics.trackNotificationOpen(
        notification.campaignId,
        notification.logId
      );
    };

    // Quando o usuário clica no botão da notificação
    const handleNotificationClick = (notification) => {
      analytics.trackNotificationClick(
        notification.campaignId,
        notification.logId,
        notification.buttonType,
        notification.targetModule
      );
    };

    // Registrar listeners...
  }, [analytics]);
}
```

## 📊 Visualizando os Dados

### Dashboard Principal
Acesse `/analytics` para ver:
- Total de eventos
- Usuários únicos
- Páginas mais visitadas
- Sessões recentes
- Eventos em tempo real

### Analytics de Campanhas Push
Acesse `/system/push/history` e clique em "Ver Detalhes" em qualquer campanha para ver:
- Taxa de abertura
- Taxa de cliques
- Click-through rate (CTR)
- Gráficos de tendência
- Insights de performance

## 🔌 API Endpoints

### Rastrear Evento
```bash
POST /api/analytics/events
Content-Type: application/json

{
  "sessionId": "session-123",
  "eventType": "click",
  "eventName": "button_clicked",
  "category": "engagement",
  "pagePath": "/produtos",
  "metadata": {
    "buttonId": "btn-comprar",
    "productId": "123"
  }
}
```

### Rastrear Page View
```bash
POST /api/analytics/pageview
Content-Type: application/json

{
  "sessionId": "session-123",
  "pagePath": "/produtos",
  "pageTitle": "Produtos",
  "referrer": "https://google.com"
}
```

### Obter Estatísticas
```bash
GET /api/analytics/stats?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {token}
```

### Obter Analytics de Campanha
```bash
GET /api/analytics/campaigns/{campaignId}
Authorization: Bearer {token}
```

## 📈 Tipos de Eventos Suportados

- `page_view` - Visualização de página
- `click` - Clique em elemento
- `form_submit` - Submissão de formulário
- `purchase` - Compra realizada
- `search` - Busca realizada
- `notification_open` - Notificação aberta
- `notification_click` - Notificação clicada
- `video_play` - Vídeo iniciado
- `video_complete` - Vídeo completo
- `download` - Download realizado
- `share` - Compartilhamento
- `error` - Erro ocorrido
- `custom` - Evento personalizado

## 🎯 Melhores Práticas

### 1. Consistência nos Nomes de Eventos
```jsx
// ✅ Bom - Nomes descritivos e consistentes
analytics.trackClick('btn_checkout', 'Finalizar Compra');
analytics.trackClick('btn_add_cart', 'Adicionar ao Carrinho');

// ❌ Ruim - Nomes genéricos
analytics.trackClick('button1', 'Click');
```

### 2. Metadados Relevantes
```jsx
// ✅ Bom - Metadados úteis para análise
analytics.trackPurchase({
  purchaseId: '123',
  productId: '456',
  amount: 99.90,
  category: 'eletronicos',
  paymentMethod: 'pix'
});

// ❌ Ruim - Pouca informação
analytics.trackPurchase({ id: '123' });
```

### 3. Rastrear Jornadas Completas
```jsx
// Rastrear cada etapa do funil
analytics.trackEvent('custom', 'product_viewed', { productId: '123' });
analytics.trackClick('btn_add_cart', 'Adicionar ao Carrinho');
analytics.trackEvent('custom', 'checkout_started', { total: 99.90 });
analytics.trackPurchase({ purchaseId: '789', amount: 99.90 });
```

### 4. Não Rastrear Dados Sensíveis
```jsx
// ❌ NUNCA rastreie dados sensíveis
analytics.trackEvent('form_submit', 'login', {
  password: '123456', // NUNCA!
  cpf: '123.456.789-00' // NUNCA!
});

// ✅ Rastreie apenas informações não-sensíveis
analytics.trackFormSubmit('login', {
  success: true,
  method: 'email'
});
```

## 🔧 Performance

O sistema usa **batch processing** automático:
- Eventos são enfileirados
- Enviados em lotes de 50 a cada 5 segundos
- Não impacta a performance da aplicação
- Funciona mesmo offline (enfileira para envio posterior)

## 🎨 Personalização

### Criar Evento Personalizado

```jsx
// Evento personalizado para rastrear scroll depth
const trackScrollDepth = (depth) => {
  analytics.trackEvent('custom', 'scroll_depth', {
    category: 'engagement',
    data: {
      depth: `${depth}%`,
      pagePath: window.location.pathname
    }
  });
};

useEffect(() => {
  let maxScroll = 0;

  const handleScroll = () => {
    const scrollPercent = (window.scrollY / document.body.scrollHeight) * 100;

    if (scrollPercent > maxScroll + 25) { // A cada 25%
      maxScroll = Math.floor(scrollPercent / 25) * 25;
      trackScrollDepth(maxScroll);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

## 📚 Recursos Adicionais

- **Dashboard**: `/analytics` - Visualização em tempo real
- **Histórico de Campanhas**: `/system/push/history` - Analytics de push notifications
- **API Docs**: Todos os endpoints estão documentados no código
- **Hooks**: Veja `hooks/useAnalytics.js` para todos os métodos disponíveis

## 🆘 Suporte

Se tiver dúvidas ou problemas:
1. Verifique o console do browser para erros
2. Confirme que o `AnalyticsProvider` está no layout principal
3. Verifique se as variáveis de ambiente estão configuradas
4. Consulte os exemplos neste documento

---

**Nota**: O sistema de analytics respeita a privacidade dos usuários e não rastreia informações sensíveis. Todos os dados são armazenados de forma segura e podem ser exportados a qualquer momento.

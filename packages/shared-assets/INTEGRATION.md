# Integração com S3 - Roadmap

## Fase Atual (Desenvolvimento)

Atualmente, as imagens dos banners estão usando URLs do Unsplash como placeholder:

```typescript
const BANNER_IMAGES = {
  cashback: 'https://images.unsplash.com/photo-...',
  ofertas: 'https://images.unsplash.com/photo-...',
  valePresente: 'https://images.unsplash.com/photo-...',
};
```

## Próximos Passos

### 1. Configuração do Admin
- [ ] Criar interface no admin para upload de imagens
- [ ] Implementar preview das imagens
- [ ] Permitir configurar imagens por tipo de banner

### 2. Integração com S3
- [ ] Configurar bucket S3
- [ ] Implementar upload de imagens para S3
- [ ] Gerar URLs públicas/presigned
- [ ] Criar API endpoint para buscar URLs das imagens

### 3. Backend API
```typescript
// GET /api/assets/banners
{
  "cashback": "https://s3.amazonaws.com/bucket/banners/cashback.jpg",
  "ofertas": "https://s3.amazonaws.com/bucket/banners/ofertas.jpg",
  "valePresente": "https://s3.amazonaws.com/bucket/banners/vale-presente.jpg"
}
```

### 4. Atualização do Mobile
```typescript
// Antes (atual)
const BANNER_IMAGES = {
  cashback: 'https://images.unsplash.com/...',
};

// Depois (com S3)
const [bannerImages, setBannerImages] = useState({});

useEffect(() => {
  fetch('/api/assets/banners')
    .then(res => res.json())
    .then(setBannerImages);
}, []);
```

## Formatos Suportados

- **JPG/JPEG**: Melhor para fotos
- **PNG**: Melhor para gráficos com transparência
- **WEBP**: Melhor compressão (recomendado)
- **GIF**: Suporta animação

## Requisitos Técnicos

### Tamanhos Recomendados
- Banner principal: 800x400px
- Cards de vantagens: 400x400px
- Ícones: 200x200px

### Otimização
- Comprimir imagens antes do upload
- Usar WEBP quando possível
- Implementar lazy loading
- Cache de imagens no mobile

## Segurança
- Validar tipo de arquivo no upload
- Limitar tamanho máximo (5MB)
- Sanitizar nomes de arquivos
- Usar presigned URLs com expiração

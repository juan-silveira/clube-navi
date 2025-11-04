# Shared Assets

Esta pasta contém os assets compartilhados entre o mobile e o admin.

## Estrutura

```
shared-assets/
├── images/
│   ├── banners/          # Imagens de banners promocionais
│   │   └── default/      # Imagens padrão do sistema
│   ├── icons/            # Ícones e logos
│   └── placeholders/     # Imagens placeholder
```

## Formatos Suportados

- JPG / JPEG
- PNG
- WEBP
- GIF (incluindo animados)

## Uso

### Mobile (React Native)
```typescript
import { BANNER_IMAGES } from '@shared/assets';

<Image
  source={BANNER_IMAGES.cashback}
  style={styles.bannerImage}
  resizeMode="contain"
/>
```

### Admin (Next.js)
```typescript
import { BANNER_IMAGES } from '@shared/assets';

<img
  src={BANNER_IMAGES.cashback}
  alt="Cashback"
  className="banner-image"
/>
```

## Futuro: Integração com S3

Estas imagens padrão serão posteriormente substituídas por imagens armazenadas no S3, configuráveis pelo admin.

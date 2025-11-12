# Shared Assets

Este diretório contém assets compartilhados entre os projetos **admin** e **club-admin**.

## Estrutura

```
shared/
└── assets/
    └── images/
        └── auth/
            ├── ils1.svg         # Ilustração 1 para tela de login
            └── ilst2.png        # Ilustração 2 para tela de login
```

## Como funciona

Os assets são acessíveis em ambos os projetos através de symlinks criados nas pastas `public/`:

- **Admin**: `/apps/admin/frontend/public/shared-assets` → `../../../../shared/assets`
- **Club Admin**: `/apps/club-admin/frontend/public/shared-assets` → `../../../../shared/assets`

## Uso

### No código frontend (React/Next.js)

```jsx
// Acessar ilustração de login
<img src="/shared-assets/images/auth/ils1.svg" alt="Ilustração" />
```

### Adicionar novos assets

1. Adicione os arquivos na estrutura apropriada dentro de `shared/assets/`
2. Os arquivos estarão automaticamente disponíveis em ambos os projetos via `/shared-assets/...`

## Vantagens

- ✅ **Sem duplicação**: Um único arquivo serve ambos os projetos
- ✅ **Consistência**: Alterações em assets são refletidas em todos os lugares
- ✅ **Fácil manutenção**: Gerenciar assets em um único local
- ✅ **Economia de espaço**: Não duplicar arquivos grandes (imagens, vídeos, etc.)

# Integração da API no Mobile

Este documento descreve como a API do backend está integrada no aplicativo mobile Clube Navi.

## 📁 Estrutura de Pastas

```
src/
├── constants/
│   └── api.ts          # Configurações da API (URL, endpoints, timeout)
├── types/
│   └── user.ts         # Interfaces TypeScript (User, LoginResponse, etc)
├── services/
│   └── api.ts          # Cliente API com axios (ApiService)
└── store/
    └── authStore.ts    # State management com Zustand
```

## 🔧 Configuração da API

### URL da API

O arquivo `src/constants/api.ts` configura automaticamente a URL da API baseado no ambiente:

- **Android Emulator**: `http://10.0.2.2:8033`
- **iOS Simulator**: `http://localhost:8033`
- **Produção**: `https://api.clubenavi.com`

### Endpoints Disponíveis

```typescript
API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ME: '/auth/me',
  UPDATE_PROFILE: '/users/profile',
  ENABLE_2FA: '/auth/2fa/enable',
  DISABLE_2FA: '/auth/2fa/disable',
  VERIFY_2FA: '/auth/2fa/verify',
}
```

## 🔐 Autenticação

### ApiService (`src/services/api.ts`)

Cliente API baseado em axios com as seguintes funcionalidades:

#### Recursos Principais:

1. **Interceptor de Request**: Adiciona automaticamente o token JWT em todas as requisições
2. **Interceptor de Response**: Renova o token automaticamente quando recebe 401
3. **Armazenamento**: Usa AsyncStorage para persistir tokens e dados do usuário
4. **Retry Automático**: Tenta renovar o token e refaz a requisição em caso de 401

#### Métodos Disponíveis:

```typescript
// Autenticação
await apiService.login({ email, password });
await apiService.logout();
await apiService.renewToken();
await apiService.forgotPassword({ email });
await apiService.resetPassword({ token, newPassword });

// Usuário
await apiService.getMe();
await apiService.getStoredUser();
await apiService.getAccessToken();
await apiService.getRefreshToken();
await apiService.isAuthenticated();
```

### AuthStore (`src/store/authStore.ts`)

State management com Zustand para gerenciar o estado de autenticação:

```typescript
const {
  user,              // Dados do usuário logado
  isAuthenticated,   // Se está autenticado
  isLoading,         // Se está carregando
  error,             // Mensagem de erro (se houver)

  login,             // Fazer login
  logout,            // Fazer logout
  loadUser,          // Carregar usuário do storage
  clearError,        // Limpar mensagem de erro
} = useAuthStore();
```

## 📱 Uso nas Telas

### Exemplo: Tela de Login

```typescript
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    const success = await login({ email, password });
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text>Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

### Exemplo: Tela Protegida

```typescript
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <View>
      <Text>Bem-vindo, {user?.name}!</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🔄 Fluxo de Autenticação

### 1. Login

```
Usuário preenche email/senha
    ↓
handleLogin() no componente
    ↓
useAuthStore.login({ email, password })
    ↓
apiService.login() → POST /auth/login
    ↓
Tokens salvos no AsyncStorage
    ↓
User data salvo no Zustand store
    ↓
Redirecionamento para dashboard
```

### 2. Renovação Automática de Token

```
Request com token expirado
    ↓
Interceptor detecta erro 401
    ↓
apiService.renewToken() → POST /auth/refresh
    ↓
Novos tokens salvos no AsyncStorage
    ↓
Request original é refeito com novo token
```

### 3. Logout

```
useAuthStore.logout()
    ↓
apiService.logout() → POST /auth/logout
    ↓
AsyncStorage limpo (tokens + user)
    ↓
Zustand store resetado
    ↓
Redirecionamento para login
```

## 🧪 Testando a API

### Credenciais de Teste

```
Email: admin@clubenavi.com
Senha: admin123456
```

### Verificar Logs

Habilite logs no console para debug:

```typescript
// src/services/api.ts
private handleError<T>(error: any): T {
  console.error('API Error:', error); // ← Logs de erro
  // ...
}
```

## 📝 Tipos TypeScript

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  profilePicture?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}
```

### LoginResponse

```typescript
interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
    requires2FA?: boolean;
    tempToken?: string;
  };
  error?: string;
  message?: string;
}
```

## ⚠️ Tratamento de Erros

Todos os métodos da API retornam objetos com `success` boolean:

```typescript
const response = await apiService.login({ email, password });

if (response.success) {
  // Login bem-sucedido
  const { user, accessToken } = response.data;
} else {
  // Login falhou
  const errorMessage = response.error; // "Credenciais inválidas"
}
```

## 🔒 Segurança

1. **Tokens**: Armazenados de forma segura no AsyncStorage
2. **HTTPS**: Obrigatório em produção
3. **Timeout**: 30 segundos para todas as requisições
4. **Auto-Logout**: Se renovação de token falhar, logout automático

## 🚀 Próximos Passos

- [ ] Implementar suporte a 2FA
- [ ] Adicionar refresh token rotation
- [ ] Implementar biometria (fingerprint/face ID)
- [ ] Adicionar interceptor de erro global
- [ ] Implementar retry policy para requests falhados

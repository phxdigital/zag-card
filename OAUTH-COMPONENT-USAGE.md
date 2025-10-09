# Como Usar o Componente OAuthButtons

## 📦 Componente Criado

Foi criado um componente reutilizável para facilitar a adição de botões OAuth em qualquer página: `app/components/OAuthButtons.tsx`

---

## 🚀 Uso Básico

### Opção 1: Usar na página de login atual

A página de login (`app/login/page.tsx`) já tem o código OAuth implementado. Se quiser usar o novo componente:

```tsx
import OAuthButtons from '@/app/components/OAuthButtons';

export default function LoginPage() {
    const [error, setError] = useState('');
    
    return (
        <div>
            {/* Seu formulário de login */}
            
            {/* Divisor */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou</span>
                    </div>
                </div>
            </div>

            {/* Botões OAuth */}
            <div className="mt-4">
                <OAuthButtons 
                    redirectTo="/dashboard"
                    onError={(error) => setError(error)}
                />
            </div>
        </div>
    );
}
```

### Opção 2: Layout em Grid (2 colunas)

Para um layout mais compacto:

```tsx
import { OAuthButtonsGrid } from '@/app/components/OAuthButtons';

<OAuthButtonsGrid 
    redirectTo="/dashboard"
    onError={(error) => setError(error)}
/>
```

---

## 🎨 Props Disponíveis

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `redirectTo` | `string` | `'/dashboard'` | URL para redirecionar após login |
| `onError` | `(error: string) => void` | `undefined` | Callback para tratar erros |
| `disabled` | `boolean` | `false` | Desabilita todos os botões |

---

## 🔧 Adicionar Mais Provedores

### GitHub

1. Configure o GitHub OAuth no Supabase Dashboard
2. No arquivo `OAuthButtons.tsx`, descomente o botão do GitHub:

```tsx
{/* GitHub OAuth */}
<button
    onClick={() => handleOAuthLogin('github')}
    disabled={disabled}
    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
    <Github className="w-5 h-5 mr-2" />
    Continuar com GitHub
</button>
```

### Facebook

1. Configure o Facebook OAuth no Supabase Dashboard
2. No arquivo `OAuthButtons.tsx`, descomente o botão do Facebook

### Outros Provedores

Para adicionar um novo provedor (ex: Microsoft):

```tsx
<button
    onClick={() => handleOAuthLogin('azure')}
    disabled={disabled}
    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
    <MicrosoftIcon className="w-5 h-5 mr-2" />
    Continuar com Microsoft
</button>
```

---

## 💡 Exemplos Avançados

### Com Loading State

```tsx
import { useState } from 'react';
import OAuthButtons from '@/app/components/OAuthButtons';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOAuthError = (errorMsg: string) => {
        setError(errorMsg);
        setLoading(false);
    };

    return (
        <div>
            <OAuthButtons 
                redirectTo="/dashboard"
                onError={handleOAuthError}
                disabled={loading}
            />
            
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}
```

### Redirecionar para Página Específica

```tsx
// Redirecionar para conta do usuário
<OAuthButtons redirectTo="/dashboard/account" />

// Redirecionar para página de checkout
<OAuthButtons redirectTo="/checkout" />

// Redirecionar para página anterior
<OAuthButtons redirectTo={router.query.redirect || '/dashboard'} />
```

### Usar em Modal

```tsx
import OAuthButtons from '@/app/components/OAuthButtons';

export default function LoginModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Faça Login</h2>
                <OAuthButtons 
                    redirectTo="/dashboard"
                    onError={(error) => {
                        console.error('Erro OAuth:', error);
                        // Mostrar notificação de erro
                    }}
                />
            </div>
        </div>
    );
}
```

---

## 🎯 Comparação: Código Atual vs Componente

### Código Atual (app/login/page.tsx)

```tsx
const handleGoogleLogin = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });

        if (error) {
            setError(error.message);
        }
    } catch (error) {
        setError('Erro ao fazer login com Google');
    }
};

// No JSX
<button onClick={handleGoogleLogin}>
    {/* SVG do Google */}
    Continuar com Google
</button>
```

### Com o Componente Novo

```tsx
import OAuthButtons from '@/app/components/OAuthButtons';

// No JSX
<OAuthButtons 
    redirectTo="/dashboard"
    onError={(error) => setError(error)}
/>
```

**Vantagens do componente:**
- ✅ Código mais limpo e reutilizável
- ✅ Fácil adicionar múltiplos provedores
- ✅ Consistência visual
- ✅ Menos duplicação de código
- ✅ Props customizáveis

---

## 🔄 Atualizar Página de Login (Opcional)

Se você quiser usar o novo componente na página de login atual:

1. Abra `app/login/page.tsx`
2. Importe o componente:
   ```tsx
   import OAuthButtons from '@/app/components/OAuthButtons';
   ```
3. Substitua o botão Google atual por:
   ```tsx
   <OAuthButtons 
       redirectTo="/dashboard"
       onError={(error) => setError(error)}
       disabled={loading}
   />
   ```
4. Remova a função `handleGoogleLogin` (não é mais necessária)

---

## 📚 Provedores Suportados pelo Supabase

Você pode usar qualquer um destes provedores:

- ✅ Google
- ✅ GitHub
- ✅ GitLab
- ✅ Bitbucket
- ✅ Azure (Microsoft)
- ✅ Facebook
- ✅ Twitter
- ✅ Discord
- ✅ Slack
- ✅ Spotify
- ✅ Twitch
- ✅ LinkedIn
- ✅ Notion
- ✅ WorkOS
- ✅ Zoom
- ✅ Apple

Para usar qualquer um, basta:
1. Configurar no dashboard do provedor
2. Ativar no Supabase Dashboard
3. Adicionar o botão no componente

---

## 🚨 Nota Importante

**O componente está criado e pronto para uso, mas:**
- O código atual da página de login já funciona perfeitamente
- Você pode manter o código atual ou migrar para o componente
- O componente é útil se você precisar de OAuth em múltiplas páginas
- Para apenas uma página (login), ambas as abordagens são válidas

**Recomendação:**
- Se só vai usar OAuth na página de login → Mantenha o código atual
- Se vai usar OAuth em outras páginas → Use o componente
- Se quer código mais organizado → Use o componente

---

**✨ O componente está pronto e pode ser usado quando necessário!**


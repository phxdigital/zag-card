# Configuração OAuth 2.0 - Google Login

## ✅ Status Atual
O código OAuth 2.0 **já está implementado** na página de login (`app/login/page.tsx`). Você só precisa ativar e configurar no Supabase e Google Cloud.

---

## 📋 Passo a Passo para Ativar OAuth 2.0

### ETAPA 1: Configurar Google Cloud Console

1. **Acesse o Google Cloud Console**
   - Vá para: https://console.cloud.google.com/

2. **Crie um novo projeto (se necessário)**
   - Clique em "Select a project" no topo
   - Clique em "New Project"
   - Nome: `Zag NFC App` (ou o nome que preferir)
   - Clique em "Create"

3. **Ative a API do Google+**
   - No menu lateral, vá em "APIs & Services" > "Library"
   - Procure por "Google+ API"
   - Clique em "Enable"

4. **Configure a OAuth Consent Screen**
   - Vá em "APIs & Services" > "OAuth consent screen"
   - Escolha "External" (para permitir qualquer usuário do Google)
   - Clique em "Create"
   
   **Preencha os campos:**
   - App name: `Zag NFC`
   - User support email: seu email
   - Developer contact information: seu email
   - Clique em "Save and Continue"
   
   **Scopes:**
   - Clique em "Add or Remove Scopes"
   - Adicione: `.../auth/userinfo.email` e `.../auth/userinfo.profile`
   - Clique em "Save and Continue"
   
   **Test users (opcional para desenvolvimento):**
   - Adicione emails de teste se necessário
   - Clique em "Save and Continue"

5. **Crie as credenciais OAuth 2.0**
   - Vá em "APIs & Services" > "Credentials"
   - Clique em "+ CREATE CREDENTIALS"
   - Escolha "OAuth client ID"
   - Application type: "Web application"
   - Name: `Zag NFC Web Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://seu-dominio.vercel.app
   https://zagnfc.com.br
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://<SEU_PROJETO>.supabase.co/auth/v1/callback
   https://seu-dominio.vercel.app/auth/callback
   ```
   
   > ⚠️ **IMPORTANTE**: Substitua `<SEU_PROJETO>` pelo ID do seu projeto Supabase
   
   - Clique em "Create"
   - **COPIE** o `Client ID` e `Client Secret` (você vai precisar!)

---

### ETAPA 2: Configurar Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Ative o provedor Google**
   - No menu lateral, clique em "Authentication"
   - Clique em "Providers"
   - Procure por "Google" e clique nele
   
3. **Configure o Google Provider**
   - **Enable Google provider**: ✅ Ative
   - **Client ID (for OAuth)**: Cole o Client ID do Google Cloud
   - **Client Secret (for OAuth)**: Cole o Client Secret do Google Cloud
   - **Redirect URL**: Copie a URL fornecida pelo Supabase (exemplo: `https://seu-projeto.supabase.co/auth/v1/callback`)
   - Clique em "Save"

4. **Configure a URL de redirecionamento**
   - Ainda em "Authentication" > "Providers"
   - Role para baixo até "Site URL"
   - Adicione suas URLs:
     ```
     http://localhost:3000
     https://seu-dominio.vercel.app
     https://zagnfc.com.br
     ```
   
5. **Configure Redirect URLs adicionais**
   - Em "Redirect URLs", adicione:
     ```
     http://localhost:3000/dashboard
     https://seu-dominio.vercel.app/dashboard
     https://zagnfc.com.br/dashboard
     ```

---

### ETAPA 3: Atualizar Variáveis de Ambiente (Opcional)

Se você quiser adicionar mais provedores OAuth no futuro, suas variáveis de ambiente já estão configuradas corretamente. Não é necessário adicionar nada novo para o Google OAuth.

Arquivo `.env.local` (já deve estar configurado):
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

---

### ETAPA 4: Testar o Login

1. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Acesse a página de login**
   - Vá para: http://localhost:3000/login

3. **Teste o login com Google**
   - Clique no botão "Continuar com Google"
   - Você será redirecionado para a tela de login do Google
   - Faça login com sua conta Google
   - Você deve ser redirecionado de volta para `/dashboard`

---

## 🔍 Verificação e Troubleshooting

### ✅ Checklist de Verificação

- [ ] Google Cloud Console configurado
- [ ] OAuth 2.0 Client ID criado
- [ ] Redirect URIs configurados no Google Cloud
- [ ] Google Provider ativado no Supabase
- [ ] Client ID e Secret configurados no Supabase
- [ ] Site URL e Redirect URLs configurados no Supabase
- [ ] Botão "Continuar com Google" aparece na página de login
- [ ] Login com Google funciona corretamente

### 🐛 Problemas Comuns

**Erro: "redirect_uri_mismatch"**
- **Causa**: A URL de redirecionamento não está configurada no Google Cloud Console
- **Solução**: Adicione a URL exata do Supabase (`https://<SEU_PROJETO>.supabase.co/auth/v1/callback`) nas "Authorized redirect URIs" do Google Cloud

**Erro: "Access blocked: This app's request is invalid"**
- **Causa**: OAuth Consent Screen não está configurado corretamente
- **Solução**: Verifique se você completou todas as etapas da OAuth Consent Screen no Google Cloud

**Erro: "Invalid OAuth configuration"**
- **Causa**: Client ID ou Secret incorretos no Supabase
- **Solução**: Verifique se você copiou corretamente as credenciais do Google Cloud para o Supabase

**Usuário não é redirecionado após login**
- **Causa**: Redirect URLs não configuradas no Supabase
- **Solução**: Adicione `/dashboard` nas Redirect URLs do Supabase

**Login funciona mas usuário não aparece no banco**
- **Causa**: Usuário está sendo criado na tabela `auth.users` mas não em tabelas customizadas
- **Solução**: Verifique se você tem triggers no banco de dados para criar registros em tabelas relacionadas

---

## 🚀 Próximos Passos

Após configurar o Google OAuth, você pode adicionar outros provedores:

### Provedores Disponíveis no Supabase:
- GitHub
- GitLab
- Bitbucket
- Azure (Microsoft)
- Facebook
- Twitter
- Discord
- Slack
- Spotify
- Twitch
- LinkedIn
- Notion
- WorkOS
- Zoom

### Para adicionar outro provedor:

1. Siga o mesmo processo de configuração
2. Crie as credenciais OAuth no provedor
3. Ative e configure no Supabase
4. Adicione o botão na página de login

**Exemplo para adicionar GitHub:**

```tsx
const handleGitHubLogin = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });

        if (error) {
            setError(error.message);
        }
    } catch (error) {
        setError('Erro ao fazer login com GitHub');
    }
};
```

---

## 📚 Recursos Adicionais

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)

---

## 📞 Suporte

Se você encontrar problemas durante a configuração:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do Supabase Dashboard (Authentication > Logs)
3. Verifique se as URLs estão corretas (sem barras extras no final)
4. Teste primeiro em localhost antes de testar em produção

---

## ✨ Melhorias Futuras (Opcional)

### 1. Adicionar mais provedores OAuth
- GitHub (popular para desenvolvedores)
- Facebook (alcance geral)
- Microsoft (empresas)

### 2. Melhorar UI dos botões OAuth
```tsx
{/* Botões de OAuth organizados */}
<div className="grid grid-cols-2 gap-3 mt-4">
    <button onClick={handleGoogleLogin} className="...">
        <GoogleIcon />
        Google
    </button>
    <button onClick={handleGitHubLogin} className="...">
        <GitHubIcon />
        GitHub
    </button>
</div>
```

### 3. Adicionar loading state nos botões OAuth
```tsx
const [oauthLoading, setOauthLoading] = useState(false);

const handleGoogleLogin = async () => {
    setOauthLoading(true);
    try {
        // ... código de login
    } finally {
        setOauthLoading(false);
    }
};
```

### 4. Salvar informações adicionais do perfil Google
Após o login, você pode capturar informações como:
- Avatar do usuário
- Nome completo
- Idioma preferido

---

**🎉 Pronto! Depois de seguir todos os passos, seu OAuth 2.0 estará funcionando perfeitamente!**


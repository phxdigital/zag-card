# ✅ Checklist: Ativação OAuth 2.0

Siga este checklist para ativar o OAuth 2.0 no seu sistema.

---

## 🎯 ETAPA 1: Google Cloud Console

### 1.1 Criar/Selecionar Projeto
- [ ] Acessei https://console.cloud.google.com/
- [ ] Criei novo projeto OU selecionei projeto existente
- [ ] Nome do projeto: ________________________

### 1.2 Ativar API
- [ ] Fui em "APIs & Services" > "Library"
- [ ] Procurei "Google+ API"
- [ ] Cliquei em "Enable"

### 1.3 OAuth Consent Screen
- [ ] Fui em "APIs & Services" > "OAuth consent screen"
- [ ] Selecionei "External"
- [ ] Preenchi "App name": Zag NFC
- [ ] Preenchi "User support email": ________________________
- [ ] Preenchi "Developer contact": ________________________
- [ ] Adicionei scopes: `userinfo.email` e `userinfo.profile`
- [ ] Salvei

### 1.4 Criar Credenciais
- [ ] Fui em "APIs & Services" > "Credentials"
- [ ] Cliquei em "+ CREATE CREDENTIALS" > "OAuth client ID"
- [ ] Selecionei "Web application"
- [ ] Nome: Zag NFC Web Client

### 1.5 Authorized JavaScript Origins
Adicionei as seguintes URLs:
- [ ] `http://localhost:3000`
- [ ] `https://________________________.vercel.app` (se aplicável)
- [ ] `https://zagnfc.com.br` (se aplicável)

### 1.6 Authorized Redirect URIs
⚠️ **IMPORTANTE:** Substitua `<SEU_PROJETO>` pelo ID do seu projeto Supabase

Adicionei as seguintes URLs:
- [ ] `http://localhost:3000/auth/callback`
- [ ] `https://<SEU_PROJETO>.supabase.co/auth/v1/callback`
- [ ] `https://________________________.vercel.app/auth/callback` (se aplicável)

### 1.7 Copiar Credenciais
- [ ] Copiei o **Client ID**: ________________________
- [ ] Copiei o **Client Secret**: ________________________
- [ ] Salvei as credenciais em local seguro

---

## 🔧 ETAPA 2: Supabase Dashboard

### 2.1 Acessar Supabase
- [ ] Acessei https://supabase.com/dashboard
- [ ] Selecionei meu projeto
- [ ] ID do projeto: ________________________

### 2.2 Ativar Google Provider
- [ ] Fui em "Authentication" > "Providers"
- [ ] Procurei "Google"
- [ ] Cliquei para expandir

### 2.3 Configurar Google Provider
- [ ] Ativei "Enable Google provider"
- [ ] Colei o **Client ID** do Google Cloud
- [ ] Colei o **Client Secret** do Google Cloud
- [ ] Copiei a "Redirect URL" do Supabase: ________________________
- [ ] Cliquei em "Save"

### 2.4 Configurar Site URL
- [ ] Rolei até "Site URL"
- [ ] Adicionei: `http://localhost:3000` (desenvolvimento)
- [ ] Adicionei: `https://zagnfc.com.br` (produção, se aplicável)

### 2.5 Configurar Redirect URLs
- [ ] Rolei até "Redirect URLs"
- [ ] Adicionei: `http://localhost:3000/dashboard`
- [ ] Adicionei: `https://zagnfc.com.br/dashboard` (se aplicável)
- [ ] Salvei todas as configurações

---

## 🧪 ETAPA 3: Teste Local

### 3.1 Preparar Ambiente
- [ ] Verifiquei que `.env.local` está configurado
- [ ] Variáveis necessárias:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 3.2 Iniciar Servidor
- [ ] Executei: `npm run dev`
- [ ] Servidor iniciou na porta 3000
- [ ] Sem erros no console

### 3.3 Testar Interface
- [ ] Acessei: http://localhost:3000/login
- [ ] Página de login carregou corretamente
- [ ] Botão "Continuar com Google" está visível
- [ ] Nenhum erro no console do navegador (F12)

### 3.4 Testar Login OAuth
- [ ] Cliquei em "Continuar com Google"
- [ ] Fui redirecionado para tela de login do Google
- [ ] Fiz login com minha conta Google
- [ ] Autorizei o aplicativo
- [ ] Fui redirecionado de volta para o app
- [ ] Cheguei na rota `/dashboard`
- [ ] Estou autenticado (nome/email aparecem)

### 3.5 Verificar no Supabase
- [ ] Acessei Supabase Dashboard
- [ ] Fui em "Authentication" > "Users"
- [ ] Meu usuário aparece na lista
- [ ] Provider mostra "google"
- [ ] Data de criação está correta

---

## 🚀 ETAPA 4: Deploy em Produção (Opcional)

### 4.1 Atualizar Google Cloud Console
- [ ] Adicionei URL de produção nas "Authorized JavaScript origins"
- [ ] Adicionei URL de produção nas "Authorized redirect URIs"
- [ ] Formato: `https://seu-dominio.com.br`

### 4.2 Atualizar Supabase
- [ ] Adicionei URL de produção na "Site URL"
- [ ] Adicionei URL de produção + `/dashboard` nas "Redirect URLs"

### 4.3 Testar em Produção
- [ ] Deploy realizado
- [ ] Acessei site de produção
- [ ] Testei login com Google
- [ ] Login funcionou corretamente
- [ ] Redirecionamento funcionou

---

## 📊 Status Final

### ✅ FUNCIONANDO
Marque quando tudo estiver operacional:
- [ ] OAuth 2.0 configurado no Google Cloud
- [ ] Google Provider ativado no Supabase
- [ ] Login com Google funcionando em localhost
- [ ] Login com Google funcionando em produção (se aplicável)
- [ ] Usuários sendo criados corretamente
- [ ] Redirecionamento funcionando

### 🎉 PARABÉNS!
Quando todos os itens acima estiverem marcados, seu OAuth 2.0 está 100% funcional!

---

## 🆘 Se Algo Não Funcionar

### Erro: "redirect_uri_mismatch"
- [ ] Verifiquei que adicionei a URL EXATA do Supabase no Google Cloud
- [ ] URL está sem `/` no final
- [ ] Formato correto: `https://<projeto>.supabase.co/auth/v1/callback`

### Erro: "Invalid OAuth configuration"
- [ ] Verifiquei Client ID no Supabase (sem espaços extras)
- [ ] Verifiquei Client Secret no Supabase (sem espaços extras)
- [ ] Copiei novamente do Google Cloud

### Botão não funciona
- [ ] Abri console do navegador (F12)
- [ ] Verifiquei erros no console
- [ ] Verifiquei logs no Supabase Dashboard

### Não redireciona após login
- [ ] Verifiquei "Site URL" no Supabase
- [ ] Verifiquei "Redirect URLs" no Supabase
- [ ] URLs estão corretas (com `https://` e sem `/` extra)

### Usuário não aparece no Supabase
- [ ] Verifiquei logs em Authentication > Logs
- [ ] Procurei mensagens de erro
- [ ] Tentei fazer logout e login novamente

---

## 📚 Guias de Referência

Se precisar de mais detalhes, consulte:

- **Setup completo:** `OAUTH-SETUP.md`
- **Início rápido:** `QUICK-START.md`
- **Resumo:** `OAUTH-RESUMO.md`
- **Componente OAuth:** `OAUTH-COMPONENT-USAGE.md`

---

## 📝 Notas Pessoais

Use este espaço para anotar informações importantes:

**Google Cloud Project ID:**
________________________________________

**Supabase Project URL:**
________________________________________

**Client ID:**
________________________________________

**Data de Configuração:**
________________________________________

**Problemas Encontrados:**
________________________________________
________________________________________
________________________________________

**Soluções Aplicadas:**
________________________________________
________________________________________
________________________________________

---

**✨ Boa sorte! Você consegue! 🚀**


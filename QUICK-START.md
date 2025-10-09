# 🚀 Guia Rápido de Início - Zag NFC

## 📋 Checklist Inicial

### 1. Configuração do Ambiente Local

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

**Como obter essas chaves:**
- Acesse [supabase.com](https://supabase.com)
- Vá para Settings > API no seu projeto
- Copie as chaves correspondentes

### 2. Instalar Dependências

```bash
npm install
```

### 3. Iniciar o Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## ✅ Funcionalidades Disponíveis

### ✅ Login com Email/Senha
**Status:** ✅ Funcionando  
**Localização:** `/login`  
- Login de usuários
- Cadastro de novos usuários
- Redirecionamento para dashboard após login

### ⚠️ Login com Google (OAuth 2.0)
**Status:** 🔧 Precisa ser configurado  
**Código:** ✅ Implementado  
**Configuração:** ❌ Aguardando setup

**Para ativar:**
1. Veja o guia completo: `OAUTH-SETUP.md`
2. Configure o Google Cloud Console
3. Ative no Supabase Dashboard
4. Teste em `/login`

---

## 📁 Estrutura de Arquivos Importantes

```
├── app/
│   ├── login/page.tsx          # Página de login (Email + OAuth)
│   ├── dashboard/page.tsx      # Dashboard principal
│   ├── admin/page.tsx          # Painel administrativo
│   └── api/                    # Rotas de API
├── lib/
│   ├── supabase.ts             # Configuração Supabase
│   └── utils.ts                # Utilitários
├── database/
│   └── schema.sql              # Schema do banco de dados
├── OAUTH-SETUP.md              # Guia completo OAuth 2.0
└── ENV-VARIABLES.md            # Guia de variáveis de ambiente
```

---

## 🔐 Sistema de Autenticação

### Como funciona:

1. **Login com Email/Senha:**
   - Usuário acessa `/login`
   - Preenche email e senha
   - Sistema valida credenciais via Supabase Auth
   - Redirecionado para `/dashboard`

2. **Login com Google (após configurar):**
   - Usuário clica em "Continuar com Google"
   - Redirecionado para tela de login do Google
   - Após autenticação, retorna para `/dashboard`
   - Conta criada automaticamente no primeiro login

3. **Proteção de Rotas:**
   - `middleware.ts` verifica autenticação
   - Rotas protegidas redirecionam para `/login`
   - Dashboard e admin requerem autenticação

---

## 🔧 Configuração OAuth 2.0 (Resumo)

### Pré-requisitos:
- [ ] Conta no Google Cloud Console
- [ ] Projeto Supabase configurado
- [ ] Acesso ao Supabase Dashboard

### Etapas Principais:

1. **Google Cloud Console**
   - Criar projeto
   - Configurar OAuth Consent Screen
   - Criar Client ID e Secret
   - Configurar Redirect URIs

2. **Supabase Dashboard**
   - Authentication > Providers
   - Ativar Google Provider
   - Adicionar Client ID e Secret
   - Configurar Site URL e Redirect URLs

3. **Testar**
   - Acessar `/login`
   - Clicar em "Continuar com Google"
   - Fazer login e verificar redirecionamento

**Guia detalhado:** `OAUTH-SETUP.md`

---

## 🚨 Problemas Comuns

### Erro: "Invalid OAuth configuration"
**Solução:** Verifique se copiou corretamente Client ID e Secret do Google para o Supabase

### Erro: "redirect_uri_mismatch"
**Solução:** Adicione a URL exata do Supabase nas Authorized redirect URIs do Google Cloud:
```
https://<SEU_PROJETO>.supabase.co/auth/v1/callback
```

### Login funciona mas não redireciona
**Solução:** Configure as Redirect URLs no Supabase Dashboard:
```
http://localhost:3000/dashboard
https://seu-dominio.vercel.app/dashboard
```

### Botão do Google não aparece
**Solução:** Verifique o console do navegador (F12) para erros. Verifique se as variáveis de ambiente estão corretas.

---

## 📊 Monitoramento

### Verificar logs de autenticação:
1. Acesse Supabase Dashboard
2. Vá para Authentication > Logs
3. Verifique tentativas de login

### Verificar usuários cadastrados:
1. Acesse Supabase Dashboard
2. Vá para Authentication > Users
3. Veja lista de usuários e métodos de login

---

## 🎯 Próximas Ações

### Agora:
1. [ ] Configurar variáveis de ambiente (`.env.local`)
2. [ ] Testar login com email/senha
3. [ ] Seguir guia OAuth para ativar login com Google

### Depois:
- [ ] Adicionar mais provedores OAuth (GitHub, Facebook, etc)
- [ ] Personalizar página de login
- [ ] Configurar recuperação de senha
- [ ] Adicionar verificação de email

---

## 📚 Documentação Adicional

- `OAUTH-SETUP.md` - Guia completo OAuth 2.0
- `ENV-VARIABLES.md` - Todas as variáveis de ambiente
- `SETUP.md` - Setup inicial do projeto
- `README.md` - Informações gerais do projeto

---

## 💡 Dicas

- **Desenvolvimento local:** Use `http://localhost:3000` nas URLs
- **Produção:** Configure as mesmas URLs no Vercel e Google Cloud
- **Segurança:** Nunca comite `.env.local` no Git
- **Testing:** Teste OAuth primeiro em localhost antes de produção

---

**🎉 Pronto para começar! Qualquer dúvida, consulte os guias de documentação.**


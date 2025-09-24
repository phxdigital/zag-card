# Variáveis de Ambiente Necessárias

## Configuração do Supabase

Para o sistema funcionar corretamente, você precisa configurar as seguintes variáveis de ambiente:

### 1. No arquivo `.env.local` (desenvolvimento local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

### 2. No Vercel (produção):
Acesse o dashboard da Vercel > Settings > Environment Variables e adicione:

- `NEXT_PUBLIC_SUPABASE_URL` = https://seu-projeto.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua_chave_anonima_aqui
- `SUPABASE_SERVICE_ROLE_KEY` = sua_chave_service_role_aqui

## Como obter as chaves do Supabase:

1. Acesse [supabase.com](https://supabase.com)
2. Vá para o seu projeto
3. Clique em "Settings" > "API"
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## Configuração Opcional - Stripe (para pagamentos):
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## ⚠️ IMPORTANTE:
- As variáveis `NEXT_PUBLIC_*` são públicas e podem ser vistas no frontend
- A variável `SUPABASE_SERVICE_ROLE_KEY` é privada e só deve ser usada no servidor
- Nunca commite o arquivo `.env.local` no Git
- Sempre configure as variáveis no Vercel para produção

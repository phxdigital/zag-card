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

## Configuração de Pagamentos - Asaas (Obrigatório para produção):

### 1. Criar conta no Asaas:
1. Acesse [asaas.com](https://www.asaas.com)
2. Crie sua conta e complete o cadastro
3. Acesse o menu "Integrações" > "API"

### 2. Configurar variáveis de ambiente:
```env
# API do Asaas
ASAAS_API_KEY=sua_chave_api_aqui
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_WEBHOOK_TOKEN=seu_token_webhook_aleatorio_seguro

# Links de pagamento diretos (Opcional - recomendado)
# Crie os links no painel do Asaas e cole aqui
NEXT_PUBLIC_ASAAS_LINK_PARA_MIM=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO=https://www.asaas.com/c/xxxxx
```

### 3. Como obter as chaves:
- **ASAAS_API_KEY**: No painel Asaas, vá em "Integrações" > "API" e copie sua chave
- **ASAAS_WEBHOOK_TOKEN**: Crie um token aleatório seguro (pode usar gerador online)

### 4. Configurar Webhook no Asaas:
1. No painel Asaas, vá em "Integrações" > "Webhooks"
2. Adicione a URL: `https://seu-dominio.com/api/webhook/asaas`
3. Selecione os eventos:
   - PAYMENT_CREATED
   - PAYMENT_CONFIRMED
   - PAYMENT_RECEIVED
   - PAYMENT_OVERDUE
   - PAYMENT_REFUNDED
4. Cole o mesmo token que você definiu em `ASAAS_WEBHOOK_TOKEN`

### 5. Criar Links de Pagamento (Recomendado):
Para facilitar, você pode criar links de pagamento reutilizáveis no painel do Asaas:

1. No Asaas, vá em "Vendas" > "Links de Pagamento"
2. Crie 3 links, um para cada plano:
   - **Para Mim**: R$ 89,00
   - **Para minha equipe**: R$ 387,00 (pode parcelar em 3x)
   - **Para meu negócio**: R$ 928,00 (pode parcelar em 3x)
3. Configure para aceitar PIX e Cartão de Crédito
4. Copie as URLs geradas e adicione nas variáveis `NEXT_PUBLIC_ASAAS_LINK_*`

**Vantagem dos links diretos**: Os clientes são redirecionados diretamente para a página de pagamento do Asaas, sem precisar criar cliente via API.

## Configuração OAuth 2.0 (Login Social):
O OAuth 2.0 está configurado diretamente no Supabase Dashboard, não requer variáveis de ambiente adicionais no Next.js.

**Para ativar o OAuth 2.0 (Google, GitHub, etc):**
- Veja o guia completo em: `OAUTH-SETUP.md`
- Configure no Google Cloud Console
- Ative o provedor no Supabase Dashboard (Authentication > Providers)
- O código já está implementado em `app/login/page.tsx`

## ⚠️ IMPORTANTE:
- As variáveis `NEXT_PUBLIC_*` são públicas e podem ser vistas no frontend
- A variável `SUPABASE_SERVICE_ROLE_KEY` é privada e só deve ser usada no servidor
- Nunca commite o arquivo `.env.local` no Git
- Sempre configure as variáveis no Vercel para produção
- Para OAuth, configure as credenciais no Supabase Dashboard, não em variáveis de ambiente

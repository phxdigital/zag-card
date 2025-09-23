# Guia de Deploy - Sistema Zag NFC

## Pré-requisitos

1. ✅ Conta no Supabase criada
2. ✅ Banco de dados configurado com o schema
3. ✅ Conta na Vercel
4. ✅ Domínio `zagnfc.com.br` registrado
5. ✅ Repositório no GitHub

## Passo a Passo do Deploy

### 1. Configurar Variáveis de Ambiente

No seu projeto local, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Deploy na Vercel

1. **Conectar Repositório:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte seu repositório GitHub

2. **Configurar Variáveis de Ambiente:**
   - No dashboard da Vercel, vá para "Settings" > "Environment Variables"
   - Adicione as três variáveis do `.env.local`
   - Marque para "Production", "Preview" e "Development"

3. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar

### 3. Configurar Domínios na Vercel

1. **Adicionar Domínios:**
   - Vá para "Settings" > "Domains"
   - Adicione: `zagnfc.com.br`
   - Adicione: `*.zagnfc.com.br` (wildcard)

2. **Verificar DNS:**
   - A Vercel mostrará os registros DNS necessários
   - Configure no seu provedor de domínio

### 4. Configurar DNS no Provedor

No painel do seu provedor de domínio (Hostinger, GoDaddy, etc.):

**Registro A:**
- Tipo: A
- Nome: @
- Valor: 76.76.21.21

**Registro CNAME:**
- Tipo: CNAME  
- Nome: *
- Valor: cname.vercel-dns.com

### 5. Testar o Sistema

1. **Teste do Domínio Principal:**
   - Acesse `https://zagnfc.com.br`
   - Deve carregar a página principal

2. **Teste de Subdomínio:**
   - Acesse `https://teste.zagnfc.com.br`
   - Deve mostrar página 404 (normal, pois não existe)

3. **Teste do Dashboard:**
   - Acesse `https://zagnfc.com.br/dashboard`
   - Deve redirecionar para login

### 6. Configurar Autenticação

1. **No Supabase:**
   - Vá para "Authentication" > "Settings"
   - Configure "Site URL": `https://zagnfc.com.br`
   - Configure "Redirect URLs": `https://zagnfc.com.br/dashboard`

2. **Testar Login:**
   - Acesse `https://zagnfc.com.br/login`
   - Teste o registro e login

### 7. Verificar Segurança

1. **RLS Ativado:**
   - No Supabase, vá para "Table Editor"
   - Verifique se a tabela `pages` tem RLS ativado

2. **Políticas Configuradas:**
   - Vá para "Authentication" > "Policies"
   - Verifique se as políticas estão ativas

3. **Storage Configurado:**
   - Vá para "Storage"
   - Verifique se o bucket "logos" existe e é público

### 8. Monitoramento

1. **Logs da Vercel:**
   - Monitore os logs de deploy
   - Configure alertas para erros

2. **Logs do Supabase:**
   - Monitore queries e erros
   - Configure alertas se necessário

### 9. Backup e Manutenção

1. **Backup Automático:**
   - O Supabase faz backup automático
   - Configure backup adicional se necessário

2. **Atualizações:**
   - Mantenha dependências atualizadas
   - Teste em ambiente de desenvolvimento

## Troubleshooting

### Subdomínio não carrega
- Verifique se o DNS propagou (pode levar até 24h)
- Confirme se o wildcard está configurado na Vercel
- Verifique os logs da Vercel

### Erro de autenticação
- Verifique se as chaves do Supabase estão corretas
- Confirme se o Site URL está configurado
- Verifique se o RLS está ativado

### Upload de logo falha
- Verifique se o bucket "logos" existe
- Confirme as políticas de storage
- Verifique o tamanho do arquivo (máx 5MB)

### Página 404 em subdomínios
- Verifique se o middleware está funcionando
- Confirme se a página `[subdomain]/page.tsx` existe
- Verifique os logs da Vercel

## Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Verificar linting
npm run lint

# Deploy manual (se necessário)
vercel --prod
```

## URLs Importantes

- **Dashboard:** `https://zagnfc.com.br/dashboard`
- **Login:** `https://zagnfc.com.br/login`
- **Exemplo de subdomínio:** `https://cliente.zagnfc.com.br`
- **Painel Supabase:** [supabase.com/dashboard](https://supabase.com/dashboard)
- **Painel Vercel:** [vercel.com/dashboard](https://vercel.com/dashboard)

## Próximos Passos

1. Configurar analytics (Google Analytics, Vercel Analytics)
2. Implementar sistema de pagamento
3. Adicionar mais funcionalidades
4. Configurar monitoramento avançado
5. Implementar CDN para assets

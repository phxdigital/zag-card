# 💳 Guia Completo de Integração com Asaas

## 📝 Sobre o Asaas

O Asaas é a plataforma de pagamentos brasileira que estamos usando para processar pagamentos via PIX, Boleto e Cartão de Crédito. É uma excelente alternativa ao Stripe para o mercado brasileiro.

## 🚀 Configuração Inicial

### 1. Criar Conta no Asaas

1. Acesse [www.asaas.com](https://www.asaas.com)
2. Clique em "Criar conta grátis"
3. Complete seu cadastro com seus dados
4. Valide seu email
5. Complete as informações da sua empresa

**⚠️ Importante**: 
- Para ambiente de **testes**, use a conta sandbox
- Para **produção**, complete o processo de verificação da conta

### 2. Obter Chave de API

1. Faça login no painel do Asaas
2. Vá em **Integrações** > **API**
3. Copie sua **Chave de API** (API Key)
4. Adicione no arquivo `.env.local`:

```env
ASAAS_API_KEY=$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNDk3NDU6OiRhYWNoX2Y3YmI5M2FhLTMwZDQtNGQ5NS1iZGIzLWMzOWE1NDNhZjFjOQ==
ASAAS_API_URL=https://api.asaas.com/v3
```

**Ambiente de Testes (Sandbox)**:
```env
ASAAS_API_KEY=sua_chave_de_teste_aqui
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
```

### 3. Configurar Webhook

O webhook é essencial para receber notificações automáticas quando um pagamento é confirmado.

#### 3.1 Criar Token de Segurança

Crie um token aleatório seguro para validar os webhooks. Você pode usar este comando:

```bash
# No terminal (Linux/Mac)
openssl rand -hex 32

# Ou online em https://www.random.org/strings/
```

Adicione no `.env.local`:
```env
ASAAS_WEBHOOK_TOKEN=seu_token_aleatorio_super_seguro_aqui
```

#### 3.2 Configurar no Painel Asaas

1. No painel Asaas, vá em **Integrações** > **Webhooks**
2. Clique em "Adicionar Webhook"
3. Configure:
   - **URL**: `https://seu-dominio.com.br/api/webhook/asaas`
   - **Token de autenticação**: Cole o mesmo token do passo anterior
   - **Eventos**: Selecione os seguintes:
     - ✅ PAYMENT_CREATED
     - ✅ PAYMENT_CONFIRMED
     - ✅ PAYMENT_RECEIVED
     - ✅ PAYMENT_OVERDUE
     - ✅ PAYMENT_REFUNDED
4. Clique em "Salvar"

#### 3.3 Testar Webhook (Opcional)

Para testar localmente, use o [ngrok](https://ngrok.com/):

```bash
# Instalar ngrok
npm install -g ngrok

# Executar aplicação localmente
npm run dev

# Em outro terminal, criar túnel
ngrok http 3000

# Use a URL do ngrok no webhook do Asaas
# Exemplo: https://abc123.ngrok.io/api/webhook/asaas
```

## 💰 Criar Links de Pagamento (Recomendado)

A maneira mais fácil é criar links de pagamento diretos no painel do Asaas. Os clientes são redirecionados para uma página de checkout hospedada pelo Asaas.

### Passo a Passo:

1. No painel Asaas, vá em **Vendas** > **Links de Pagamento**
2. Clique em "Criar link de pagamento"

### Configuração para cada plano:

#### Plano "Para Mim" (R$ 89,00)
- **Nome**: Zag NFC - Para Mim
- **Valor**: R$ 89,00
- **Tipo**: Cobrança avulsa
- **Formas de pagamento**: PIX, Cartão de Crédito, Boleto
- **Descrição**: 1 Cartão NFC + Página personalizada + QR Code

#### Plano "Para minha equipe" (R$ 387,00)
- **Nome**: Zag NFC - Para minha equipe
- **Valor**: R$ 387,00
- **Tipo**: Cobrança avulsa
- **Parcelamento**: Até 3x sem juros
- **Formas de pagamento**: PIX, Cartão de Crédito, Boleto
- **Descrição**: 2 Cartões NFC + 3 Adesivos + Página personalizada

#### Plano "Para meu negócio" (R$ 928,00)
- **Nome**: Zag NFC - Para meu negócio
- **Valor**: R$ 928,00
- **Tipo**: Cobrança avulsa
- **Parcelamento**: Até 3x sem juros
- **Formas de pagamento**: PIX, Cartão de Crédito, Boleto
- **Descrição**: 8 Cartões NFC + 8 Adesivos + 8 Páginas + Suporte VIP

### Após criar os links:

Copie as URLs geradas e adicione no `.env.local`:

```env
NEXT_PUBLIC_ASAAS_LINK_PARA_MIM=https://www.asaas.com/c/abc123
NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE=https://www.asaas.com/c/def456
NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO=https://www.asaas.com/c/ghi789
```

## 🗄️ Configurar Banco de Dados

Execute o script SQL para criar a tabela de pagamentos:

```bash
# No painel do Supabase, vá em SQL Editor e execute:
database/payments.sql
```

Isso criará:
- Tabela `payments` para armazenar cobranças
- Colunas adicionais em `profiles` para controlar assinaturas
- Políticas de segurança (RLS)

## 🧪 Testar Integração

### 1. Testar criação de cobrança via API:

```bash
# Com usuário autenticado
curl -X POST http://localhost:3000/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "para_mim",
    "value": 89.00,
    "description": "Teste - Para Mim"
  }'
```

### 2. Testar webhook:

No painel Asaas, vá em **Integrações** > **Webhooks** e clique em "Testar webhook".

### 3. Fazer um pagamento de teste:

1. Acesse sua homepage: `http://localhost:3000`
2. Role até a seção de preços
3. Clique em "Escolher Para Mim"
4. Você será redirecionado para o checkout
5. Use dados de teste do Asaas

**Dados de teste PIX**:
- O QR Code será gerado, mas não precisa pagar de verdade no ambiente sandbox
- Você pode simular o pagamento no painel Asaas

## 📊 Verificar Pagamentos

### No Painel Asaas:
1. Acesse **Financeiro** > **Cobranças**
2. Veja todas as cobranças criadas

### No Dashboard da Aplicação:
1. Acesse `/dashboard/payments`
2. Veja o histórico de seus pagamentos

## ⚙️ Variáveis de Ambiente Completas

Arquivo `.env.local` completo:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Asaas API
ASAAS_API_KEY=sua_chave_api_asaas
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_WEBHOOK_TOKEN=seu_token_webhook_seguro

# Links de Pagamento Asaas (Opcional mas recomendado)
NEXT_PUBLIC_ASAAS_LINK_PARA_MIM=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO=https://www.asaas.com/c/xxxxx
```

## 📱 Modo de Funcionamento

### Com Links Diretos (Recomendado):
1. Cliente clica em "Escolher plano" na homepage
2. É redirecionado para a página de checkout do Asaas
3. Paga via PIX, Cartão ou Boleto
4. Webhook notifica nossa aplicação
5. Plano é ativado automaticamente

### Sem Links Diretos (Via API):
1. Cliente clica em "Escolher plano"
2. API cria cliente e cobrança no Asaas
3. QR Code PIX é exibido na página `/checkout`
4. Cliente paga pelo app do banco
5. Webhook notifica confirmação
6. Plano é ativado automaticamente

## 🔒 Segurança

1. **Nunca** exponha `ASAAS_API_KEY` no frontend
2. **Sempre** valide o token do webhook
3. Use **HTTPS** em produção
4. Verifique o webhook vem do IP do Asaas (opcional)

IPs do Asaas para whitelist:
- `34.95.231.208`
- `35.247.240.145`

## 📚 Documentação Oficial

- [Documentação Asaas](https://docs.asaas.com)
- [API Reference](https://docs.asaas.com/reference/overview)
- [Webhooks](https://docs.asaas.com/reference/webhooks)
- [PIX](https://docs.asaas.com/reference/pix)

## 🆘 Troubleshooting

### Webhook não está sendo chamado:
1. Verifique se a URL está correta e acessível
2. Confirme que o webhook está ativo no painel
3. Veja os logs de webhook no painel Asaas

### Erro ao criar cobrança:
1. Verifique se `ASAAS_API_KEY` está correta
2. Confirme que está usando a URL correta (sandbox vs produção)
3. Veja os logs no console da aplicação

### PIX QR Code não aparece:
1. Confirme que a cobrança foi criada com `billingType: 'PIX'`
2. Verifique se o QR Code foi gerado (pode levar alguns segundos)
3. Veja os logs da API

## ✅ Checklist de Produção

Antes de ir para produção:

- [ ] Conta Asaas verificada e aprovada
- [ ] API Key de **produção** configurada (não sandbox)
- [ ] Webhook configurado com URL de produção
- [ ] Links de pagamento criados e testados
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Script SQL executado no Supabase
- [ ] Testado fluxo completo de pagamento
- [ ] Webhook testado e funcionando
- [ ] Ativação automática de plano testada

## 💡 Dicas

1. Use os **links de pagamento** para simplificar - é mais rápido e seguro
2. Configure **notificações por email** no Asaas para acompanhar vendas
3. Monitore o **dashboard financeiro** do Asaas regularmente
4. Ative a **antifraude** do Asaas para proteção extra
5. Configure **split de pagamento** se trabalhar com parceiros


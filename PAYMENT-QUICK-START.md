# 🚀 Início Rápido - Integração de Pagamentos

## ⚡ Setup em 5 Minutos

### 1️⃣ Execute o SQL no Supabase
```sql
-- Copie e execute o conteúdo de: database/payments.sql
```

### 2️⃣ Configure as Variáveis de Ambiente

Crie/edite o arquivo `.env.local`:

```env
# Asaas API
ASAAS_API_KEY=sua_chave_aqui
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_WEBHOOK_TOKEN=token_aleatorio_seguro

# Links de Pagamento (Crie no painel do Asaas)
NEXT_PUBLIC_ASAAS_LINK_PARA_MIM=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO=https://www.asaas.com/c/xxxxx
```

### 3️⃣ Crie Links de Pagamento no Asaas

1. Acesse [asaas.com](https://www.asaas.com)
2. Vá em **Vendas** > **Links de Pagamento**
3. Crie 3 links:
   - **Para Mim**: R$ 89,00
   - **Para minha equipe**: R$ 387,00 (parcelável em 3x)
   - **Para meu negócio**: R$ 928,00 (parcelável em 3x)
4. Copie as URLs e cole nas variáveis acima

### 4️⃣ Configure o Webhook

1. No Asaas, vá em **Integrações** > **Webhooks**
2. **URL**: `https://seu-dominio.com/api/webhook/asaas`
3. **Token**: Use o mesmo da variável `ASAAS_WEBHOOK_TOKEN`
4. **Eventos**: Selecione todos os eventos de `PAYMENT_*`

### 5️⃣ Teste!

```bash
npm run dev
```

Acesse `http://localhost:3000`, role até a seção de preços e clique em "Escolher plano".

## 📁 Arquivos Criados

```
✅ types/asaas.d.ts              - Tipos TypeScript
✅ lib/asaas.ts                  - Cliente da API Asaas
✅ app/api/create-payment/       - Criar cobranças
✅ app/api/webhook/asaas/        - Receber notificações
✅ app/checkout/page.tsx         - Página de checkout PIX
✅ database/payments.sql         - Schema do banco
✅ app/components/PricingSection - Botões de pagamento
✅ app/dashboard/payments/       - Histórico de pagamentos
```

## 🎯 Como Funciona

### Fluxo com Links Diretos (Recomendado):
```
Cliente clica → Redireciona para Asaas → Paga → Webhook notifica → Plano ativado
```

### Fluxo via API:
```
Cliente clica → API cria cobrança → Mostra QR Code → Cliente paga → Webhook notifica → Plano ativado
```

## 🔗 Links Úteis

- 📖 [Guia Completo](./ASAAS-SETUP.md)
- 📝 [Variáveis de Ambiente](./ENV-VARIABLES.md)
- 🌐 [Documentação Asaas](https://docs.asaas.com)

## ❓ Problemas Comuns

### Os botões não funcionam?
- Verifique se as variáveis `NEXT_PUBLIC_ASAAS_LINK_*` estão configuradas
- Se não estiver, os botões usarão a API (precisa estar logado)

### Webhook não está sendo chamado?
- Confirme que a URL está acessível publicamente (use ngrok para testes locais)
- Verifique se os eventos estão selecionados no painel

### Plano não ativa automaticamente?
- Verifique os logs do webhook em `/api/webhook/asaas`
- Confirme que o evento `PAYMENT_CONFIRMED` foi recebido

## 🎉 Pronto!

Agora você tem um sistema completo de pagamentos com PIX integrado!


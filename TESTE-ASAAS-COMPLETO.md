# 🧪 Guia Completo de Testes - Integração Asaas

## 🎯 Objetivo
Este guia te ajudará a testar se a integração com Asaas está funcionando corretamente para pagamentos PIX e cartão de crédito.

## 📋 Pré-requisitos

### 1. Variáveis de Ambiente Configuradas
Verifique se seu `.env.local` contém:

```env
# Asaas API (Sandbox para testes)
ASAAS_API_KEY=sua_chave_sandbox_aqui
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_WEBHOOK_TOKEN=seu_token_webhook_seguro

# Links de Pagamento (Opcional)
NEXT_PUBLIC_ASAAS_LINK_PARA_MIM=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE=https://www.asaas.com/c/xxxxx
NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO=https://www.asaas.com/c/xxxxx
```

### 2. Conta Asaas Sandbox
- ✅ Conta criada no Asaas
- ✅ Chave de API do sandbox obtida
- ✅ Webhook configurado (opcional para testes básicos)

---

## 🚀 Testes Passo a Passo

### Teste 1: Verificar Conexão com Asaas

**Método 1: Página de Teste (Mais Fácil)**
1. Acesse: `http://localhost:3000/test-asaas`
2. Selecione "🧪 Sandbox (Teste)"
3. Clique em "Executar Teste"
4. Verifique se aparece "✅ Integração Funcionando!"

**Método 2: Via API Direta**
```bash
curl -X GET "http://localhost:3000/api/test-asaas?env=sandbox"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "✅ Integração com Asaas SANDBOX funcionando!",
  "environment": "🧪 SANDBOX (Teste)",
  "account": {
    "name": "Seu Nome",
    "email": "seu@email.com"
  }
}
```

---

### Teste 2: Criar Pagamento PIX via API

**Passo 1: Fazer Login**
1. Acesse: `http://localhost:3000/login`
2. Faça login com sua conta

**Passo 2: Testar Criação de Pagamento**
```bash
curl -X POST "http://localhost:3000/api/create-payment" \
  -H "Content-Type: application/json" \
  -H "Cookie: seu_cookie_de_sessao" \
  -d '{
    "planType": "para_mim",
    "value": 89.00,
    "description": "Teste PIX - Plano Para Mim"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_xxxxxxxxx",
    "status": "PENDING",
    "value": 89.00,
    "pix": {
      "qrCode": "00020126580014br.gov.bcb.pix...",
      "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "expirationDate": "2024-01-15T23:59:59.000Z"
    }
  }
}
```

**Passo 3: Verificar no Painel Asaas**
1. Acesse: https://sandbox.asaas.com
2. Vá em "Cobranças"
3. Procure pela cobrança criada
4. Verifique se o QR Code PIX foi gerado

---

### Teste 3: Simular Pagamento PIX (Sandbox)

**No Painel Asaas Sandbox:**
1. Encontre a cobrança criada
2. Clique em "Simular Pagamento"
3. Selecione "PIX"
4. Clique em "Confirmar Pagamento"

**Verificar no Sistema:**
1. Acesse: `http://localhost:3000/dashboard/payments`
2. Verifique se o pagamento aparece como "CONFIRMED"
3. Verifique se o plano foi ativado

---

### Teste 4: Testar Webhook (Opcional)

**Configurar Webhook no Asaas:**
1. No painel Asaas, vá em "Integrações" > "Webhooks"
2. Adicione webhook:
   - URL: `https://seu-dominio.com/api/webhook/asaas`
   - Eventos: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`
   - Token: `seu_token_webhook_seguro`

**Testar Webhook:**
1. Crie um pagamento via API
2. Simule o pagamento no painel Asaas
3. Verifique se o webhook foi chamado
4. Confirme se o plano foi ativado automaticamente

---

### Teste 5: Pagamento com Cartão (Via Links)

**Se você configurou links de pagamento:**
1. Acesse: `http://localhost:3000`
2. Clique em "Escolher Plano" em qualquer plano
3. Será redirecionado para o Asaas
4. Teste com cartão de crédito sandbox:
   - Número: `4111 1111 1111 1111`
   - CVV: `123`
   - Validade: `12/25`
   - Nome: `Teste`

**Cartões de Teste Asaas:**
```
Aprovado: 4111 1111 1111 1111
Negado: 4000 0000 0000 0002
CVV: 123
Validade: 12/25
```

---

## 🔍 Verificações Importantes

### ✅ Checklist de Funcionamento

- [ ] Conexão com API Asaas funcionando
- [ ] Criação de cliente no Asaas
- [ ] Criação de cobrança PIX
- [ ] Geração de QR Code PIX
- [ ] Simulação de pagamento no sandbox
- [ ] Atualização de status no banco
- [ ] Ativação automática do plano
- [ ] Webhook funcionando (se configurado)
- [ ] Links de pagamento funcionando (se configurados)

### 🚨 Problemas Comuns

**1. Erro "ASAAS_API_KEY não configurada"**
- Verifique se a variável está no `.env.local`
- Reinicie o servidor após adicionar

**2. Erro "Não autorizado" na API**
- Faça login primeiro
- Verifique se o cookie de sessão está sendo enviado

**3. QR Code PIX não aparece**
- Aguarde alguns segundos (pode demorar)
- Verifique se a cobrança foi criada com `billingType: 'PIX'`

**4. Webhook não funciona**
- Verifique se a URL está acessível publicamente
- Use ngrok para testes locais: `ngrok http 3000`

---

## 🛠️ Ferramentas de Debug

### 1. Logs do Console
```bash
# Terminal onde roda o Next.js
npm run dev
# Observe os logs de erro
```

### 2. Logs do Asaas
- Acesse o painel Asaas
- Vá em "Integrações" > "Logs"
- Veja as requisições feitas

### 3. Banco de Dados
```sql
-- Verificar pagamentos criados
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;

-- Verificar perfis atualizados
SELECT id, subscription_status, subscription_plan, max_pages 
FROM profiles 
WHERE subscription_status = 'active';
```

---

## 🎉 Próximos Passos

Após confirmar que os testes estão funcionando:

1. **Configurar Produção:**
   - Trocar chave sandbox pela de produção
   - Configurar webhook com URL de produção
   - Testar com valores reais pequenos

2. **Configurar Links de Pagamento:**
   - Criar links no painel Asaas
   - Adicionar URLs no `.env.local`
   - Testar redirecionamento

3. **Monitoramento:**
   - Configurar logs de erro
   - Monitorar webhooks
   - Acompanhar pagamentos no dashboard

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Consulte a documentação do Asaas
3. Teste com a página `/test-asaas`
4. Verifique as variáveis de ambiente

**Documentação Asaas:** https://docs.asaas.com

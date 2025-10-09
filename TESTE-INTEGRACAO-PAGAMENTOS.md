# ✅ Teste de Integração - Sistema de Pagamentos

## 🎯 CHECKLIST COMPLETO DE INTEGRAÇÃO

### ✅ 1. CONFIGURAÇÃO LOCAL (.env.local)
```
✓ SUPABASE configurado
✓ ASAAS_API_KEY configurado
✓ ASAAS_API_URL = https://api.asaas.com/v3
✓ ASAAS_WEBHOOK_TOKEN = zag-nfc-assas
✓ ASAAS_WALLET_ID configurado
✓ Links de pagamento dos 3 planos configurados
```

### ✅ 2. CONFIGURAÇÃO VERCEL (Produção)
```
✓ Todas as 7 variáveis do Asaas adicionadas
✓ Redeploy realizado
```

### ✅ 3. WEBHOOK ASAAS
```
✓ URL: https://zagnfc.com.br/api/webhook/asaas
✓ Token: zag-nfc-assas
✓ Tipo: SEQUENCIAL
✓ Eventos PAYMENT_* selecionados
```

### ✅ 4. BANCO DE DADOS
```
✓ Script database/payments.sql executado
✓ Tabela 'profiles' criada
✓ Tabela 'payments' criada
```

---

## 🧪 TESTES FUNCIONAIS

### Teste 1: Homepage - Botões de Pagamento

**Local:** http://localhost:3000

1. Abra a página inicial
2. Role até a seção "Planos Para os Profissionais"
3. Clique em qualquer botão "Escolher plano"

**Resultado esperado:**
✅ Deve redirecionar para: https://www.asaas.com/c/[id_do_link]
✅ Página de checkout do Asaas deve abrir
✅ Deve mostrar o valor correto do plano

**Se der erro:**
- Verifique se as variáveis `NEXT_PUBLIC_ASAAS_LINK_*` estão no .env.local
- Veja o console do navegador (F12) para erros

---

### Teste 2: API de Pagamento

**URL:** http://localhost:3000/api/create-payment

**Teste com cURL:**
```bash
curl -X POST http://localhost:3000/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "para_mim",
    "value": 89.00,
    "description": "Teste de pagamento"
  }'
```

**Resultado esperado:**
✅ Retorna JSON com dados do pagamento
✅ Inclui QR Code PIX
✅ Status 200

**Se der erro 401:**
- Você precisa estar logado para criar pagamento via API
- Use os links diretos (teste 1) que não precisa login

---

### Teste 3: Webhook Status

**URL:** http://localhost:3000/api/webhook/status

**Abra no navegador:**
```
http://localhost:3000/api/webhook/status
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "configuration": {
    "asaasApiKey": "$aact_prod_000Mzkw...",
    "asaasWebhookToken": "✅ Configurado",
    "asaasApiUrl": "https://api.asaas.com/v3",
    "webhookUrl": "https://zagnfc.com.br/api/webhook/asaas"
  },
  "ready": true
}
```

✅ `ready: true` = Tudo configurado!
❌ `ready: false` = Falta configurar variáveis

---

### Teste 4: Webhook do Asaas (Produção)

**No painel do Asaas:**

1. Vá em **Integrações** → **Webhooks**
2. Clique no webhook criado
3. Clique em **"Testar webhook"**

**Resultado esperado:**
✅ Status: Enviado com sucesso
✅ Código de resposta: 200 ou 401 (401 é OK, significa que está protegido)

**Verificar logs:**
- Na Vercel: **Deployments** → **View Function Logs**
- Procure por `/api/webhook/asaas`

---

### Teste 5: Dashboard de Pagamentos

**URL:** http://localhost:3000/dashboard/payments

1. Faça login na aplicação
2. Acesse `/dashboard/payments`

**Resultado esperado:**
✅ Página carrega sem erros
✅ Mostra "Nenhum pagamento encontrado" (se não tiver pagamentos)
✅ Botão "Novo Pagamento" redireciona para `/#pricing`
✅ Estatísticas aparecem (Total Pago, Aprovados, Pendentes)

---

### Teste 6: Página de Checkout PIX

**URL:** http://localhost:3000/checkout

**Como testar:**
1. Crie um pagamento via API (teste 2)
2. O sistema deve redirecionar para `/checkout`
3. Ou acesse manualmente (vai redirecionar para home se não tiver dados)

**Resultado esperado:**
✅ Mostra QR Code PIX
✅ Timer de expiração funciona
✅ Botão "Copiar Código PIX" funciona
✅ Instruções aparecem

---

## 🎯 TESTE COMPLETO DE PONTA A PONTA

### Cenário: Cliente faz uma compra

1. **Cliente acessa o site:**
   - https://zagnfc.com.br

2. **Cliente escolhe um plano:**
   - Clica em "Escolher Para Mim"
   - É redirecionado para Asaas

3. **Cliente paga:**
   - Escolhe PIX
   - Escaneia QR Code
   - Paga

4. **Asaas processa:**
   - Confirma pagamento
   - Envia webhook para `https://zagnfc.com.br/api/webhook/asaas`

5. **Sistema ativa plano:**
   - Webhook recebe notificação
   - Atualiza status na tabela `payments`
   - Ativa plano na tabela `profiles`
   - Cliente recebe acesso

6. **Cliente vê pagamento:**
   - Acessa `/dashboard/payments`
   - Vê o pagamento como "Pago"

---

## 🐛 TROUBLESHOOTING

### ❌ Botão não redireciona
**Problema:** Clica no botão mas nada acontece
**Solução:**
1. Verifique se as variáveis `NEXT_PUBLIC_ASAAS_LINK_*` estão no `.env.local`
2. Reinicie o servidor (`npm run dev`)
3. Limpe o cache do navegador (Ctrl + Shift + R)

### ❌ Webhook não funciona
**Problema:** Pagamento não ativa automaticamente
**Solução:**
1. Verifique se o webhook está ativo no Asaas
2. Teste o webhook no painel do Asaas
3. Veja os logs na Vercel
4. Confirme que o token está correto (`zag-nfc-assas`)

### ❌ Erro 401 na API
**Problema:** `/api/create-payment` retorna 401
**Solução:**
- Normal! Você precisa estar logado para usar a API
- Use os links diretos nos botões (não precisa login)

### ❌ Página de pagamentos vazia
**Problema:** Dashboard não mostra pagamentos
**Solução:**
1. Execute o SQL: `database/payments.sql` no Supabase
2. Verifique se a tabela `payments` existe
3. Faça um pagamento de teste

---

## ✅ CHECKLIST FINAL

Antes de considerar pronto:

- [ ] Links de pagamento funcionam na homepage
- [ ] Webhook configurado e testado no Asaas
- [ ] Variáveis configuradas na Vercel
- [ ] Redeploy realizado
- [ ] `/api/webhook/status` retorna `ready: true`
- [ ] Dashboard de pagamentos carrega sem erros
- [ ] Fez um pagamento de teste completo

---

## 🎉 TUDO PRONTO!

Se todos os testes passarem, seu sistema de pagamentos está **100% funcional!** 💰

**Próximos passos:**
1. Testar com pagamento real (pequeno valor)
2. Monitorar logs do webhook
3. Verificar se planos ativam automaticamente

---

## 📞 SUPORTE

**Problemas?**
- Veja os logs na Vercel
- Veja o histórico de webhooks no Asaas
- Verifique a tabela `payments` no Supabase


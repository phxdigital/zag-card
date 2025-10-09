# 🚀 Configuração das Variáveis de Ambiente na Vercel

## ⚠️ IMPORTANTE: Faça isso AGORA na Vercel!

Acesse: https://vercel.com → Seu Projeto → **Settings** → **Environment Variables**

---

## 📋 Variáveis para Adicionar

Copie e cole cada uma dessas variáveis na Vercel:

### 1. ASAAS_API_KEY
```
$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmNhNWRmMmRiLTU0ZDAtNDMzOC1iOTc3LTgzZWQyOTljY2NhZDo6JGFhY2hfYzNkOThmNTMtNTAzNS00ZGY1LWIxYzItNDViOGI1YWIwYThm
```

### 2. ASAAS_API_URL
```
https://api.asaas.com/v3
```

### 3. ASAAS_WEBHOOK_TOKEN
```
zag-nfc-assas
```

### 4. ASAAS_WALLET_ID
```
8b692b75-dba6-4420-a187-388551f9a7ce
```

### 5. NEXT_PUBLIC_ASAAS_LINK_PARA_MIM
```
https://www.asaas.com/c/aiu54b2u55725oa4
```

### 6. NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE
```
https://www.asaas.com/c/6zhfj1jq19tscfj3
```

### 7. NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO
```
https://www.asaas.com/c/dg8vyn2rdkdcatdz
```

---

## 📝 Passo a Passo na Vercel

Para cada variável acima:

1. Clique em **Add New**
2. **Name**: Cole o nome (ex: `ASAAS_API_KEY`)
3. **Value**: Cole o valor
4. **Environment**: Selecione **Production**, **Preview** e **Development**
5. Clique em **Save**

---

## 🔄 Depois de Adicionar TODAS as Variáveis

1. Vá em **Deployments**
2. Clique no último deployment
3. Clique nos **3 pontinhos** (...)
4. Clique em **Redeploy**
5. Marque a opção **"Use existing build cache"** (opcional)
6. Clique em **Redeploy**

---

## ⚙️ Configurar Webhook no Asaas

Depois do deploy, configure o webhook:

1. Acesse https://www.asaas.com
2. Vá em **Integrações** → **Webhooks**
3. Clique em **Adicionar Webhook**
4. Configure:
   - **URL**: `https://zagnfc.com.br/api/webhook/asaas`
   - **Token de autenticação**: `zag-nfc-assas`
   - **Eventos**: Selecione TODOS os eventos de `PAYMENT_*`:
     - ✅ PAYMENT_CREATED
     - ✅ PAYMENT_CONFIRMED
     - ✅ PAYMENT_RECEIVED
     - ✅ PAYMENT_OVERDUE
     - ✅ PAYMENT_REFUNDED
     - ✅ PAYMENT_DELETED
     - ✅ PAYMENT_RESTORED
5. Clique em **Salvar**

---

## ✅ Testar se Funcionou

Depois do redeploy, teste:

1. **Verificar configuração:**
   ```
   https://zagnfc.com.br/api/webhook/status
   ```
   Deve mostrar tudo ✅ Configurado

2. **Testar webhook:**
   No painel do Asaas, vá no webhook e clique em **"Testar webhook"**

3. **Testar pagamento:**
   Acesse `https://zagnfc.com.br`, role até os planos e clique em "Escolher plano"

---

## 🎯 Seus Planos Configurados

| Plano | Valor | Link Configurado |
|-------|-------|------------------|
| **Para Mim** | R$ 89,00 | ✅ https://www.asaas.com/c/aiu54b2u55725oa4 |
| **Para Minha Equipe** | R$ 387,00 | ✅ https://www.asaas.com/c/6zhfj1jq19tscfj3 |
| **Para Meu Negócio** | R$ 928,00 | ✅ https://www.asaas.com/c/dg8vyn2rdkdcatdz |

---

## 🎉 Pronto!

Depois de configurar tudo, os botões na sua homepage vão redirecionar direto para os links de pagamento do Asaas! 💰

**Os pagamentos já vão funcionar automaticamente!** 🚀


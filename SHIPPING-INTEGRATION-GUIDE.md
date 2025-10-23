# 🚚 Guia de Implementação - Integração com Plataformas de Envio

## 📋 **Resumo da Implementação**

Este guia implementa um sistema completo de integração com plataformas de envio para o projeto Zag NFC, incluindo:

- ✅ Estrutura de banco de dados para shipping
- ✅ Componentes React para coleta de endereço
- ✅ Sistema de cálculo de frete
- ✅ Rastreamento de envios
- ✅ Dashboard de acompanhamento

---

## 🗄️ **1. Estrutura do Banco de Dados**

### **Execute o SQL no Supabase:**

```sql
-- Copie e cole o conteúdo do arquivo database/shipping-integration.sql
-- no painel do Supabase (SQL Editor)
```

**Tabelas criadas:**
- `shipping_addresses` - Endereços de entrega
- `shipments` - Informações de envio
- `tracking_events` - Histórico de rastreamento
- `shipping_configs` - Configurações de frete

**Campos adicionados à tabela `payments`:**
- `shipping_address` (JSONB)
- `tracking_code` (TEXT)
- `shipping_carrier` (TEXT)
- `shipping_service` (TEXT)
- `shipping_cost` (DECIMAL)
- `shipping_status` (TEXT)

---

## 🔧 **2. Arquivos Criados**

### **Biblioteca de Shipping:**
- `lib/shipping.ts` - Funções para integração com transportadoras

### **Componentes React:**
- `app/components/ShippingAddressForm.tsx` - Formulário de endereço
- `app/components/ShippingOptions.tsx` - Seleção de opções de frete
- `app/components/TrackingSection.tsx` - Rastreamento de envios

---

## 🚀 **3. Implementação Passo a Passo**

### **Passo 1: Execute o SQL**
1. Acesse o painel do Supabase
2. Vá em SQL Editor
3. Cole o conteúdo de `database/shipping-integration.sql`
4. Execute o script

### **Passo 2: Integre no Checkout**
```typescript
// app/checkout/card/page.tsx
import ShippingAddressForm from '@/app/components/ShippingAddressForm';
import ShippingOptions from '@/app/components/ShippingOptions';

// Adicione ao estado:
const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);

// Adicione ao formulário:
<ShippingAddressForm 
  onAddressChange={setShippingAddress}
  loading={loading}
/>

{shippingAddress && (
  <ShippingOptions
    address={shippingAddress}
    products={[/* dados do produto */]}
    onOptionSelect={setShippingOption}
    selectedOption={shippingOption}
  />
)}
```

### **Passo 3: Atualize a API de Pagamento**
```typescript
// app/api/charge-card/route.ts
import { createShipment } from '@/lib/shipping';

// Após processar o pagamento:
if (result.success && shippingAddress && shippingOption) {
  await createShipment({
    payment_id: payment.id,
    address: shippingAddress,
    carrier: shippingOption.carrier,
    service_type: shippingOption.service_type,
    weight: 1.0, // peso do produto
    dimensions: { length: 20, width: 15, height: 5 },
    declared_value: payment.amount
  });
}
```

### **Passo 4: Integre no Dashboard**
```typescript
// app/dashboard/payments/page.tsx
import TrackingSection from '@/app/components/TrackingSection';

// Adicione na exibição de cada pagamento:
{payment.tracking_code && (
  <TrackingSection
    paymentId={payment.id}
    trackingCode={payment.tracking_code}
    carrier={payment.shipping_carrier}
    serviceType={payment.shipping_service}
    shippingStatus={payment.shipping_status}
    estimatedDelivery={payment.estimated_delivery}
  />
)}
```

---

## 🔌 **4. Integrações com Transportadoras**

### **Correios (Implementação Básica)**
```typescript
// lib/correios.ts
export async function createCorreiosShipment(data: ShipmentData) {
  // Implementar API dos Correios
  const response = await fetch('https://api.correios.com.br/shipping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // dados do envio
    })
  });
  
  return response.json();
}
```

### **Melhor Envio**
```typescript
// lib/melhor-envio.ts
export async function createMelhorEnvioShipment(data: ShipmentData) {
  // Implementar API do Melhor Envio
  const response = await fetch('https://api.melhorenvio.com.br/shipping', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

---

## 📊 **5. Webhooks de Atualização**

### **Configurar Webhooks:**
```typescript
// app/api/webhooks/shipping/route.ts
import { updateShipmentStatus } from '@/lib/shipping';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Atualizar status do envio
  await updateShipmentStatus(
    body.tracking_code,
    body.status,
    body.description,
    body.location
  );
  
  return Response.json({ success: true });
}
```

### **URLs de Webhook:**
- Correios: `https://seu-dominio.com/api/webhooks/shipping`
- Melhor Envio: `https://seu-dominio.com/api/webhooks/shipping`
- Jadlog: `https://seu-dominio.com/api/webhooks/shipping`

---

## 🎨 **6. Personalização Visual**

### **Cores por Transportadora:**
```css
/* globals.css */
.correios { @apply bg-blue-50 border-blue-200 text-blue-800; }
.melhor-envio { @apply bg-green-50 border-green-200 text-green-800; }
.jadlog { @apply bg-purple-50 border-purple-200 text-purple-800; }
.total-express { @apply bg-orange-50 border-orange-200 text-orange-800; }
```

### **Ícones:**
- Correios: 📮
- Melhor Envio: 🚚
- Jadlog: 📦
- Total Express: ⚡

---

## 🔍 **7. Testes e Validação**

### **Teste de CEP:**
```typescript
// Teste a validação de CEP
const result = await validateCEP('01310100');
console.log(result); // { valid: true, address: {...} }
```

### **Teste de Cálculo de Frete:**
```typescript
// Teste o cálculo de frete
const options = await calculateShipping(
  '88010001', // origem
  '01310100', // destino
  1.0,        // peso
  { length: 20, width: 15, height: 5 } // dimensões
);
console.log(options); // Array de opções
```

### **Teste de Rastreamento:**
```typescript
// Teste o rastreamento
const tracking = await trackShipment('BR123456789');
console.log(tracking); // { success: true, events: [...] }
```

---

## 📈 **8. Monitoramento e Analytics**

### **Métricas Importantes:**
- Taxa de entrega por transportadora
- Tempo médio de entrega
- Custo médio de frete
- Satisfação do cliente

### **Relatórios:**
```sql
-- Relatório de envios por transportadora
SELECT 
  shipping_carrier,
  COUNT(*) as total_shipments,
  AVG(shipping_cost) as avg_cost,
  AVG(EXTRACT(DAYS FROM delivered_at - shipped_at)) as avg_delivery_days
FROM shipments 
WHERE delivered_at IS NOT NULL
GROUP BY shipping_carrier;
```

---

## 🚨 **9. Tratamento de Erros**

### **Erros Comuns:**
- CEP inválido
- Transportadora indisponível
- Falha na criação do envio
- Timeout na API

### **Fallbacks:**
```typescript
// Sistema de fallback
const createShipmentWithFallback = async (data: ShipmentData) => {
  try {
    return await createCorreiosShipment(data);
  } catch (error) {
    console.log('Correios falhou, tentando Melhor Envio...');
    return await createMelhorEnvioShipment(data);
  }
};
```

---

## 🔐 **10. Segurança**

### **Validações:**
- Sanitização de endereços
- Validação de CEP
- Verificação de dados de envio
- Rate limiting nas APIs

### **Dados Sensíveis:**
- Não armazenar dados pessoais desnecessários
- Criptografar informações sensíveis
- Logs de auditoria

---

## 📞 **11. Suporte**

### **Contatos das Transportadoras:**
- **Correios:** 0800 725 0101
- **Melhor Envio:** suporte@melhorenvio.com.br
- **Jadlog:** (11) 3003-3003
- **Total Express:** (11) 3003-3003

### **Documentação:**
- [API Correios](https://www.correios.com.br/atendimento/ferramentas-e-solucoes/ferramentas-de-integracao)
- [API Melhor Envio](https://docs.melhorenvio.com.br/)
- [API Jadlog](https://www.jadlog.com.br/site/tecnologia)

---

## ✅ **12. Checklist de Implementação**

- [ ] Executar SQL no Supabase
- [ ] Integrar componentes no checkout
- [ ] Atualizar APIs de pagamento
- [ ] Adicionar rastreamento no dashboard
- [ ] Configurar webhooks
- [ ] Testar validação de CEP
- [ ] Testar cálculo de frete
- [ ] Testar criação de envio
- [ ] Testar rastreamento
- [ ] Configurar monitoramento
- [ ] Documentar para equipe

---

## 🎯 **Próximos Passos**

1. **Implementar APIs reais** das transportadoras
2. **Adicionar notificações** por email/SMS
3. **Criar relatórios** de performance
4. **Implementar cache** de cálculos
5. **Adicionar analytics** avançados

---

**🚀 Sua integração de shipping está pronta para uso!**

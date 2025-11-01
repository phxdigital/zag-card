# 🚀 INTEGRAÇÃO COMPLETA: PAGAMENTO → DESIGN → APROVAÇÃO → ENTREGA

## ✅ O QUE FOI IMPLEMENTADO

Este sistema integra completamente o fluxo de produção e entrega do cartão NFC personalizado:

1. **Pagamento** → Cliente compra o produto
2. **Design** → Cliente cria design personalizado no dashboard
3. **Aprovação** → Admin aprova o design em `/admin` (Layouts / Cartões)
4. **Entrega** → Endereço coletado e produto enviado
5. **Status** → Rastreamento completo do processo

---

## 📊 FLUXO COMPLETO

```
┌─────────────┐
│  PAGAMENTO  │ → payment_id criado
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   DESIGN    │ → page_id criado (vinculado a payment_id)
└──────┬──────┘     production_status: 'pending'
       │
       ▼
┌─────────────┐
│  APROVAÇÃO  │ → notification_id criado (vinculado a page_id)
└──────┬──────┘     Admin aprova → production_status: 'approved'
       │
       ▼
┌─────────────┐
│   ENTREGA   │ → shipping_address_id criado (vinculado a page_id)
└──────┬──────┘     production_status: 'ready_to_ship'
       │
       ▼
┌─────────────┐
│   ENVIADO   │ → tracking_code criado
└─────────────┘     production_status: 'shipped'
```

---

## 🗄️ BANCO DE DADOS

### Script SQL: `database/integrate-delivery-flow.sql`

Execute este script no Supabase para adicionar:
- `payment_id` na tabela `pages` (relaciona design com pagamento)
- `page_id` na tabela `admin_notifications` (relaciona notificação com design)
- `page_id` na tabela `shipping_addresses` (relaciona endereço com design)
- `production_status` na tabela `pages` (rastrea o processo)
- Campos de produção: `approved_at`, `production_started_at`, `tracking_code`

### Status de Produção (`production_status`)

- `pending` - Design criado, aguardando aprovação
- `approved` - Aprovado pelo admin, pronto para produção
- `in_production` - Em produção (cartão sendo fabricado)
- `ready_to_ship` - Pronto para envio (endereço coletado)
- `shipped` - Enviado (com tracking_code)
- `delivered` - Entregue ao cliente
- `cancelled` - Cancelado

### View Criada

**`order_flow_view`** - Visão completa do fluxo que junta:
- Dados do pagamento (`payments`)
- Dados do design (`pages`)
- Dados de aprovação (`admin_notifications`)
- Dados de entrega (`shipping_addresses`)
- Dados do envio (`shipments`)

Query de exemplo:
```sql
SELECT * FROM order_flow_view 
WHERE production_status = 'pending'
ORDER BY payment_date DESC;
```

---

## 🔧 MODIFICAÇÕES NAS APIs

### 1. **API de Criação de Página** (`app/api/pages/route.ts`)
- ✅ Busca automaticamente o último pagamento confirmado do usuário
- ✅ Vincula `payment_id` ao criar a página
- ✅ Define `production_status: 'pending'` automaticamente

### 2. **API de Notificação** (`app/api/notify-admin/route.ts`)
- ✅ Busca `page_id` pelo `subdomain`
- ✅ Vincula `page_id` na notificação ao admin

### 3. **API de Aprovação** (`app/api/admin/notifications/[id]/route.ts`)
- ✅ Quando admin aprova (`status: 'approved'`):
  - Atualiza `production_status: 'approved'` na tabela `pages`
  - Define `approved_at` com data/hora da aprovação

### 4. **API de Entrega** (`app/api/shipping/save/route.ts`)
- ✅ Busca `page_id` vinculado ao `payment_id`
- ✅ Cria `shipping_address` e vincula com `page_id`
- ✅ Atualiza `production_status: 'ready_to_ship'`
- ✅ Adiciona `tracking_code` na página

---

## 📱 COMO FUNCIONA NO SISTEMA

### Para o Cliente:

1. **Compra o produto** → Pagamento criado (`payment_id`)
2. **Cria design** → Página criada (`page_id` vinculado ao `payment_id`)
3. **Envia para aprovação** → Notificação criada (admin recebe em `/admin`)
4. **Aguarda aprovação** → Status: `pending`
5. **Após aprovação** → Status muda para: `approved`
6. **Fornece endereço** → Endereço coletado e vinculado ao design
7. **Produto enviado** → Status: `ready_to_ship` → `shipped`
8. **Recebe produto** → Status: `delivered`

### Para o Admin:

1. **Acessa `/admin`** → Vê todas as notificações de aprovação
2. **Visualiza design** → Clica em "Visualizar" para ver o design
3. **Aprova ou rejeita** → Clica em "Aprovar" ou "Rejeitar"
4. **Sistema atualiza** → Status muda automaticamente
5. **Visualiza fluxo completo** → Pode usar a view `order_flow_view` para ver tudo

---

## 🔍 CONSULTAS ÚTEIS

### Ver todos os pedidos em um status específico:
```sql
SELECT * FROM order_flow_view 
WHERE production_status = 'approved'
ORDER BY approved_at DESC;
```

### Ver pedidos aguardando aprovação:
```sql
SELECT * FROM order_flow_view 
WHERE production_status = 'pending'
ORDER BY notification_date DESC;
```

### Ver pedidos prontos para envio:
```sql
SELECT * FROM order_flow_view 
WHERE production_status = 'ready_to_ship'
ORDER BY payment_date DESC;
```

### Ver pedidos enviados:
```sql
SELECT * FROM order_flow_view 
WHERE production_status = 'shipped'
ORDER BY payment_date DESC;
```

---

## 🎯 PRÓXIMOS PASSOS (Opcional)

Para visualizar o fluxo completo no admin, você pode:

1. **Criar página `/admin/orders`** - Visualizar todos os pedidos com status
2. **Adicionar filtros** - Por status, por data, por usuário
3. **Dashboard de métricas** - Quantidade de pedidos em cada status
4. **Notificações automáticas** - Avisar cliente quando status mudar

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Script SQL criado (`database/integrate-delivery-flow.sql`)
- [x] API de criação de página modificada (vincula `payment_id`)
- [x] API de notificação modificada (vincula `page_id`)
- [x] API de aprovação modificada (atualiza `production_status`)
- [x] API de entrega modificada (vincula `page_id` ao endereço)
- [ ] **Interface admin** (opcional - ver abaixo)

---

## 🖥️ INTERFACE ADMIN (Opcional)

Para criar uma interface visual no admin, você pode:

1. Criar uma nova página `/admin/orders/page.tsx`
2. Usar a view `order_flow_view` para buscar todos os dados
3. Exibir cards/tabela com:
   - Informações do cliente
   - Status do pagamento
   - Status do design (`production_status`)
   - Status da aprovação
   - Endereço de entrega
   - Tracking code
   - Botões para mudar status manualmente

Exemplo de query:
```typescript
const { data } = await supabase
  .from('order_flow_view')
  .select('*')
  .eq('production_status', 'approved')
  .order('payment_date', { ascending: false });
```

---

## 📝 NOTAS IMPORTANTES

1. **Execute o SQL primeiro**: Antes de usar, execute `database/integrate-delivery-flow.sql` no Supabase
2. **Relacionamentos**: Todas as relações são opcionais (ON DELETE SET NULL ou CASCADE conforme necessário)
3. **Backward compatibility**: O sistema funciona mesmo se algumas relações não existirem (páginas antigas)
4. **Performance**: Índices foram criados automaticamente para melhorar performance das queries

---

## 🐛 TROUBLESHOOTING

### Erro: "column payment_id does not exist"
→ Execute o script SQL `database/integrate-delivery-flow.sql`

### Erro: "production_status is null"
→ Verifique se a API está definindo `production_status: 'pending'` ao criar páginas

### Notificações não vinculam com page_id
→ Verifique se o `subdomain` na notificação corresponde a uma página existente

---

## 📞 SUPORTE

Se tiver dúvidas ou problemas:
1. Verifique os logs do console (server-side)
2. Verifique os logs do navegador (client-side)
3. Verifique as políticas RLS no Supabase
4. Execute as queries de verificação do SQL


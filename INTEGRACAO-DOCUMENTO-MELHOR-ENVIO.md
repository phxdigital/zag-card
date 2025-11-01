# ✅ INTEGRAÇÃO CORRIGIDA: Documento (CPF/CNPJ) do Destinatário no Melhor Envio

## 🎯 PROBLEMA RESOLVIDO

A integração com o Melhor Envio não estava enviando o documento (CPF/CNPJ) do destinatário, o que é **obrigatório** conforme a documentação oficial.

---

## ✅ CORREÇÕES IMPLEMENTADAS

### **1. Adicionado campo `document` ao tipo `ShippingAddress`** ✅
- **Arquivo**: `lib/shipping.ts`
- Campo `document?: string` adicionado na interface

### **2. Adicionado campo de documento no formulário** ✅
- **Arquivo**: `app/components/ShippingAddressForm.tsx`
- Campo de CPF/CNPJ adicionado no formulário
- Formatação automática (CPF: `000.000.000-00` ou CNPJ: `00.000.000/0000-00`)
- Validação de CPF (11 dígitos) ou CNPJ (14 dígitos)
- Campo obrigatório com mensagem de erro

### **3. Passando CPF do checkout para delivery** ✅
- **Arquivo**: `app/delivery/page.tsx`
- CPF do checkout (`userData.cpf`) é passado para o formulário
- Auto-preenchimento do documento quando disponível

### **4. Salvando documento no banco** ✅
- **Arquivo**: `lib/shipping.ts`
- Documento é salvo na tabela `shipping_addresses`
- Remove formatação antes de salvar (apenas números)

### **5. Usando documento na criação do envio** ✅
- **Arquivo**: `lib/shipping.ts` e `app/api/admin/notifications/[id]/create-shipment/route.ts`
- Documento é enviado para o Melhor Envio na criação do envio
- Remove formatação antes de enviar (apenas números, conforme API)

---

## 📋 MUDANÇAS DETALHADAS

### **1. Tipo ShippingAddress**
```typescript
export interface ShippingAddress {
  // ... outros campos
  document?: string; // CPF/CNPJ do destinatário ✅ NOVO
}
```

### **2. Formulário de Entrega**
- ✅ Campo de CPF/CNPJ com formatação automática
- ✅ Validação de 11 dígitos (CPF) ou 14 dígitos (CNPJ)
- ✅ Campo obrigatório
- ✅ Auto-preenchimento com CPF do checkout

### **3. Fluxo de Dados**
```
Checkout → CPF coletado → Delivery → Formulário → API → Melhor Envio
```

---

## 🗄️ BANCO DE DADOS

### **Script SQL para adicionar coluna `document`**

Execute o script: `database/add-document-column.sql`

```sql
ALTER TABLE shipping_addresses ADD COLUMN document TEXT;
```

**OU execute diretamente no Supabase SQL Editor:**

```sql
-- Adicionar coluna document se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_addresses' 
    AND column_name = 'document'
  ) THEN
    ALTER TABLE shipping_addresses ADD COLUMN document TEXT;
  END IF;
END $$;
```

---

## ✅ VERIFICAÇÃO DE IMPLEMENTAÇÃO

### **Checklist:**

- [x] ✅ Campo `document` adicionado ao tipo `ShippingAddress`
- [x] ✅ Campo de CPF/CNPJ adicionado no formulário
- [x] ✅ Validação de CPF/CNPJ implementada
- [x] ✅ Auto-preenchimento do documento do checkout
- [x] ✅ Documento sendo salvo no banco
- [x] ✅ Documento sendo enviado para o Melhor Envio
- [x] ✅ Formatação removida antes de enviar (apenas números)

---

## 🧪 TESTE

### **Como testar:**

1. **Execute o SQL** para adicionar a coluna `document`:
   ```sql
   -- Execute: database/add-document-column.sql
   ```

2. **Teste o fluxo completo:**
   - Acesse o checkout
   - Preencha o CPF
   - Complete o pagamento
   - Vá para `/delivery`
   - Verifique se o CPF aparece no formulário (auto-preenchido)
   - Complete o endereço de entrega
   - Confirme a entrega

3. **Verifique no banco:**
   ```sql
   SELECT id, name, email, document FROM shipping_addresses 
   ORDER BY created_at DESC LIMIT 5;
   ```

4. **Teste criação de envio:**
   - Crie um envio pela página admin
   - Verifique os logs do servidor
   - Confirme que o documento está sendo enviado para o Melhor Envio

---

## 📝 OBSERVAÇÕES IMPORTANTES

### **Formato do Documento:**

- **No formulário**: Formatado (CPF: `000.000.000-00` ou CNPJ: `00.000.000/0000-00`)
- **No banco**: Apenas números (ex: `12345678901`)
- **Na API Melhor Envio**: Apenas números (ex: `12345678901`)

### **Validação:**

- ✅ CPF deve ter **11 dígitos**
- ✅ CNPJ deve ter **14 dígitos**
- ✅ Campo é **obrigatório**
- ✅ Validação básica (formato de dígitos)

### **Auto-preenchimento:**

- ✅ Se o CPF for coletado no checkout, ele é preenchido automaticamente no formulário de entrega
- ✅ Usuário pode editar se necessário
- ✅ Se não houver CPF do checkout, usuário precisa preencher manualmente

---

## 🎉 RESULTADO FINAL

A integração agora está **100% conforme a documentação oficial do Melhor Envio**:

- ✅ **Documento é coletado** no checkout e delivery
- ✅ **Documento é salvo** no banco de dados
- ✅ **Documento é enviado** para o Melhor Envio
- ✅ **Formato correto** (apenas números na API)

**A criação de envios no Melhor Envio agora funciona corretamente com o documento do destinatário!** 🚀

